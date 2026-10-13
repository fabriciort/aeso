'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import {
  angulosDe,
  angulosTextos,
  cantoDe,
  cantosNaReta,
  centroide,
  dist,
  encaixeDe,
  escalaCerta,
  fmtNum,
  ladosTextos,
  ladosValores,
  leituraTransferidor,
  linhasDeCorte,
  pitagorasDe,
  poligonosDe,
  polar,
  quadradoNoLado,
  recorteDe,
  resolve,
  somaTexto,
  tracosDe,
  transferidorDe,
  type Cor,
  type FiguraState,
  type Vec,
} from './figura-geo'

export type { FiguraState }

// A figura da U16 (geometria plana): pontos, segmentos, retas, semirretas,
// polígonos com as medidas dos lados e os arcos dos ângulos, o transferidor,
// o círculo, os quadrados sobre os lados (Pitágoras) e a grade de fundo.
// As coordenadas são do mundo (y para cima); a figura se ajusta ao palco.
//
// De um cartão para o outro, o que tem o mesmo nome se move até o novo lugar
// (um ponto que anda, um lado que cresce), e o que é novo aparece aos poucos.
//
// Os Mexa: medir com o transferidor, juntar os cantos do triângulo, tocar o
// contorno, recortar e mover (área), desenrolar o círculo e encaixar os
// quadradinhos de Pitágoras. As contas ficam em figura-geo.ts.

export interface FiguraInteract {
  /** Mexa "medir": a última leitura tocada (direção de 0 a 180 e a escala). */
  lido?: { direcao: number; escala: 'dentro' | 'fora' } | null
  onEscala?: (direcao: number, escala: 'dentro' | 'fora') => void
  /** Mexa "juntar": tocar num canto do triângulo. */
  onCanto?: (i: number) => void
  /** Mexa "contorno": tocar num lado do polígono. */
  onLado?: (i: number) => void
  /** Mexa de um toque (recortar, desenrolar, encaixar). */
  onToque?: () => void
  /** Cresce a cada erro: o palco treme. */
  tremer?: number
}

const amber = '#f6b74e'
const sky = '#7dd3fc'
const rose = '#fb7185'
const gray = '#e5e7eb'
const green = '#6fd3a8'
const DUR = 520

const corDe = (c: Cor | undefined, padrao = gray) => (c === 'azul' ? sky : c === 'erro' ? rose : c === 'verde' ? green : c ? amber : padrao)
function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
const largura = (t: string, fs: number) => t.length * fs * 0.56
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// ---------------------------------------------------------------- the scene: keyed primitives in screen units

interface Prim {
  k: string
  t: 'path' | 'wedge' | 'circle' | 'text' | 'cell' | 'roll'
  /** The numbers that tween: path [x1, y1, x2, y2…]; wedge [cx, cy, r, a0, a1] (screen degrees, clockwise); circle [cx, cy, r]; text [x, y]; cell [cx, cy, size, angle]; roll [x0, yLine, r, rolled]. */
  v: number[]
  op?: number
  fill?: string
  stroke?: string
  sw?: number
  dash?: string
  fechado?: boolean
  /** Path: the numbers are separate segments (x1, y1, x2, y2 per segment). */
  pares?: boolean
  seta?: 'fim' | 'ambos'
  /** Wedge: only the arc, without the two radii. */
  arco?: boolean
  cap?: 'round' | 'butt'
  texto?: string
  fs?: number
  peso?: number
  anchor?: 'start' | 'middle' | 'end'
  diam?: boolean
  atraso?: number
  dur?: number
}

interface Quadro {
  p: Prim
  v: number[]
  op: number
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Angles turn the short way: a wedge by whole turns, a square cell by quarter turns. */
function alinha(a: number[], b: number[], t: Prim['t']): number[] {
  if (t === 'wedge') {
    const k = Math.round((a[3] - b[3]) / 360) * 360
    return [b[0], b[1], b[2], b[3] + k, b[4] + k]
  }
  if (t === 'cell') return [b[0], b[1], b[2], b[3] + Math.round((a[3] - b[3]) / 90) * 90]
  return b
}

function quadros(de: Map<string, Quadro>, para: Prim[], t: number): Quadro[] {
  const out: Quadro[] = []
  const vistos = new Set<string>()
  for (const b of para) {
    vistos.add(b.k)
    const a = de.get(b.k)
    const opB = b.op ?? 1
    const raw = clamp((t - (b.atraso ?? 0)) / (b.dur ?? DUR), 0, 1)
    const p = (b.t === 'roll' ? easeIO : easeOut)(raw)
    if (a && a.p.t === b.t && a.v.length === b.v.length) {
      const bv = alinha(a.v, b.v, b.t)
      out.push({ p: b, v: a.v.map((x, i) => x + (bv[i] - x) * p), op: a.op + (opB - a.op) * p })
    } else {
      if (a && p < 1) out.push({ p: { ...a.p, k: `${a.p.k}~` }, v: a.v, op: a.op * (1 - p) })
      out.push({ p: b, v: b.v, op: opB * p })
    }
  }
  const fim = easeOut(clamp(t / 300, 0, 1))
  for (const [k, a] of de) if (!vistos.has(k) && fim < 1) out.push({ ...a, op: a.op * (1 - fim) })
  return out
}

const reduzido = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** The scene shown now: when the target changes, every primitive tweens from where it is to the new place. */
function useCena(prims: Prim[]): Quadro[] {
  const key = JSON.stringify(prims)
  const [anim, setAnim] = useState(() => ({ key, de: new Map<string, Quadro>(), para: prims, vivo: false }))
  const [t, setT] = useState(Infinity)
  let atual = anim
  if (anim.key !== key) {
    const agora = quadros(anim.de, anim.para, t)
    atual = { key, de: new Map(agora.map((q) => [q.p.k, q])), para: prims, vivo: true }
    setAnim(atual)
    setT(0)
  }
  useEffect(() => {
    if (!anim.vivo) return
    if (reduzido()) {
      setT(Infinity)
      return
    }
    const total = Math.max(300, ...anim.para.map((p) => (p.atraso ?? 0) + (p.dur ?? DUR)))
    const t0 = performance.now()
    let raf = 0
    const passo = (agora: number) => {
      const el = agora - t0
      if (el >= total) return setT(Infinity)
      setT(el)
      raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [anim])
  return quadros(atual.de, atual.para, atual === anim ? t : 0)
}

// ---------------------------------------------------------------- drawing one primitive

const ponto = (cx: number, cy: number, r: number, a: number): [number, number] => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]

function arcoD(cx: number, cy: number, r: number, a0: number, a1: number, fechado: boolean): string {
  const span = a1 - a0
  if (span >= 359.9) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy}${fechado ? 'Z' : ''}`
  if (span <= 0.01) return ''
  const [x0, y0] = ponto(cx, cy, r, a0)
  const [x1, y1] = ponto(cx, cy, r, a1)
  const arc = `A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}`
  return fechado ? `M${cx} ${cy} L${x0} ${y0} ${arc} Z` : `M${x0} ${y0} ${arc}`
}

function seta(x1: number, y1: number, x2: number, y2: number, cor: string, k: string) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / L
  const uy = (y2 - y1) / L
  const s = 10
  return <path key={k} d={`M${x2 + ux * 2} ${y2 + uy * 2} L${x2 - ux * s - uy * 5.5} ${y2 - uy * s + ux * 5.5} L${x2 - ux * s + uy * 5.5} ${y2 - uy * s - ux * 5.5} Z`} fill={cor} />
}

function Desenho({ q }: { q: Quadro }) {
  const { p, v, op } = q
  if (op <= 0.005) return null
  switch (p.t) {
    case 'path': {
      let d = ''
      if (p.pares) for (let i = 0; i + 3 < v.length; i += 4) d += `M${v[i]} ${v[i + 1]}L${v[i + 2]} ${v[i + 3]}`
      else for (let i = 0; i + 1 < v.length; i += 2) d += `${i ? 'L' : 'M'}${v[i]} ${v[i + 1]}`
      if (p.fechado) d += 'Z'
      const n = v.length
      return (
        <g opacity={op}>
          <path d={d} fill={p.fill ?? 'none'} stroke={p.stroke ?? 'none'} strokeWidth={p.sw ?? 2} strokeDasharray={p.dash} strokeLinecap={p.cap ?? 'round'} strokeLinejoin="round" />
          {p.seta && n >= 4 && seta(v[n - 4], v[n - 3], v[n - 2], v[n - 1], p.stroke ?? gray, 'b')}
          {p.seta === 'ambos' && n >= 4 && seta(v[2], v[3], v[0], v[1], p.stroke ?? gray, 'a')}
        </g>
      )
    }
    case 'wedge': {
      const [cx, cy, r, a0, a1] = v
      return <path opacity={op} d={arcoD(cx, cy, r, a0, a1, !p.arco)} fill={p.arco ? 'none' : (p.fill ?? 'none')} stroke={p.stroke ?? 'none'} strokeWidth={p.sw ?? 1.5} strokeDasharray={p.dash} strokeLinejoin="round" />
    }
    case 'circle':
      return <circle opacity={op} cx={v[0]} cy={v[1]} r={Math.max(0, v[2])} fill={p.fill ?? 'none'} stroke={p.stroke ?? 'none'} strokeWidth={p.sw ?? 2} strokeDasharray={p.dash} />
    case 'text':
      return (
        <text
          opacity={op}
          x={v[0]}
          y={v[1]}
          textAnchor={p.anchor ?? 'middle'}
          dominantBaseline="central"
          fontSize={p.fs ?? 14}
          fontWeight={p.peso ?? 600}
          fill={p.fill ?? '#fff'}
          stroke="#000"
          strokeWidth={4}
          strokeLinejoin="round"
          paintOrder="stroke"
          className="tabular-nums"
        >
          {p.texto}
        </text>
      )
    case 'cell': {
      const [cx, cy, s, a] = v
      return <rect opacity={op} x={-s / 2} y={-s / 2} width={s} height={s} rx={1.5} transform={`translate(${cx} ${cy}) rotate(${a})`} fill={p.fill} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
    }
    case 'roll': {
      // The circle rolls to the right: the part of the edge that touched the floor is laid out flat.
      const [x0, yl, r, L] = v
      const th = (L / r) * (180 / Math.PI)
      const cx = x0 + L
      const cy = yl - r
      const cor = p.stroke ?? amber
      const [d0x, d0y] = ponto(cx, cy, r, th)
      const [d1x, d1y] = ponto(cx, cy, r, th + 180)
      return (
        <g opacity={op}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="4 4" />
          <path d={arcoD(cx, cy, r, 90 + th, 450, false)} fill="none" stroke={cor} strokeWidth={3} strokeLinecap="round" />
          {L > 0.5 && <path d={`M${x0} ${yl}L${x0 + L} ${yl}`} stroke={cor} strokeWidth={3} strokeLinecap="round" />}
          {p.diam && <path d={`M${d0x} ${d0y}L${d1x} ${d1y}`} stroke={sky} strokeWidth={2.5} strokeLinecap="round" />}
          <circle cx={cx} cy={cy} r={3.5} fill="#fff" />
          {/* Where the edge started: it moves around the circle as it rolls. */}
          <circle cx={ponto(cx, cy, r, 90 + th)[0]} cy={ponto(cx, cy, r, 90 + th)[1]} r={4} fill={cor} stroke="#000" strokeWidth={1.5} />
        </g>
      )
    }
  }
}

// ---------------------------------------------------------------- building the scene from the state

interface Alvos {
  medir?: { cx: number; cy: number; R: number; rDivisa: number; de: number; sentido: 1 | -1; graus: number }
  cantos: { i: number; x: number; y: number }[]
  lados: { i: number; a: [number, number]; b: [number, number] }[]
}

function montar(s: FiguraState, W: number, Hs: number, lido: FiguraInteract['lido']): { prims: Prim[]; alvos: Alvos } {
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { cantos: [], lados: [] }
  const pts = s.pontos ?? {}
  const polys = poligonosDe(s)
  const angs = angulosDe(s)
  const tr = transferidorDe(s)
  const segs = tracosDe(s.segmentos, pts)
  const retas = tracosDe(s.retas, pts)
  const semis = tracosDe(s.semirretas, pts)
  const circ = s.circulo && typeof s.circulo.raio === 'number' && s.circulo.raio > 0 ? s.circulo : undefined
  const cc = circ ? (resolve(circ.centro, pts) ?? ([0, 0] as Vec)) : undefined
  const rolar = Boolean(circ && (s.desenrolar || s.desenrolado))
  const p0 = polys[0]
  const tri = p0 && p0.verts.length === 3 ? p0 : undefined
  const juntarOn = Boolean(tri && (s.juntar || s.juntados))
  const quadOpts = typeof s.quadradosNosLados === 'object' && s.quadradosNosLados ? s.quadradosNosLados : {}
  const quadOn = Boolean(tri && s.quadradosNosLados)
  const encaixe = tri && quadOn && (s.encaixar || s.encaixado) ? encaixeDe(tri.verts) : undefined
  const rec = p0 && (s.recortar || s.recortado || s.recorte) ? recorteDe(s) : undefined
  const trR = tr && angs[0] ? (tr.raio ?? 0.9 * Math.max(...angs[0].comp)) : 0

  // The world box of everything drawn.
  const caixa: Vec[] = []
  for (const k of Object.keys(pts)) {
    const v = resolve(k, pts)
    if (v && !(rolar && circ?.centro === k)) caixa.push(v)
  }
  polys.forEach((p) => caixa.push(...p.verts))
  ;[...segs, ...retas, ...semis].forEach((t) => caixa.push(t.a, t.b))
  angs.forEach((a) => caixa.push(a.v, polar(a.v, a.comp[0], a.de), polar(a.v, a.comp[1], a.de + a.sentido * a.graus)))
  if (tr && angs[0]) {
    const a = angs[0]
    for (let t = 0; t <= 180; t += 15) caixa.push(polar(a.v, trR, a.de + a.sentido * t))
    a.comp.forEach((c, i) => c < trR * 1.02 && caixa.push(polar(a.v, trR * 1.1, a.de + (i ? a.sentido * a.graus : 0))))
  }
  if (tri && quadOn) {
    const c = centroide(tri.verts)
    for (let i = 0; i < 3; i++) caixa.push(...quadradoNoLado(tri.verts[i], tri.verts[(i + 1) % 3], c))
  }
  if (rec) caixa.push(...rec.pedaco.map((p): Vec => [p[0] + rec.mover[0], p[1] + rec.mover[1]]), ...rec.resto)
  if (circ && cc) {
    caixa.push([cc[0] - circ.raio, cc[1] - circ.raio], [cc[0] + circ.raio, cc[1] + circ.raio])
    if (rolar) caixa.push([cc[0] + 2 * Math.PI * circ.raio + circ.raio, cc[1]])
  }
  if (!caixa.length) return { prims, alvos }

  const minX = Math.min(...caixa.map((p) => p[0]))
  const maxX = Math.max(...caixa.map((p) => p[0]))
  const minY = Math.min(...caixa.map((p) => p[1]))
  const maxY = Math.max(...caixa.map((p) => p[1]))
  const bw = maxX - minX
  const bh = maxY - minY
  // The protractor's numbers are inside it: it can go closer to the edges.
  const padX = tr && angs[0] ? 10 : rolar ? 24 : 40
  const padT = 30
  let padB = 30 + (rolar ? 40 : 0)
  const escala = () => {
    const sx = bw > 1e-9 ? (W - 2 * padX) / bw : Infinity
    const sy = bh > 1e-9 ? (Hs - padT - padB) / bh : Infinity
    const v = Math.min(sx, sy)
    return Number.isFinite(v) ? Math.max(1, v) : 40
  }
  let sc = escala()
  const ladoMin = tri ? Math.min(...[0, 1, 2].map((i) => dist(tri.verts[i], tri.verts[(i + 1) % 3]))) : 0
  if (juntarOn) {
    padB += clamp(0.3 * ladoMin * sc, 24, 52) + 50
    sc = escala()
  }
  const ox = W / 2 - (sc * (minX + maxX)) / 2
  const oy = padT + (Hs - padT - padB) / 2 + (sc * (minY + maxY)) / 2
  const X = (v: Vec): [number, number] => [ox + v[0] * sc, oy - v[1] * sc]
  const centroTela = X(centroide(caixa.length ? [[minX, minY], [maxX, maxY]] : []))

  const linha = (k: string, a: [number, number], b: [number, number], o: Partial<Prim> = {}) => prims.push({ k, t: 'path', v: [...a, ...b], stroke: gray, sw: 2.5, ...o })
  const texto = (k: string, at: [number, number], t: string, o: Partial<Prim> = {}) => topo.push({ k, t: 'text', v: at, texto: t, ...o })
  /** A label beside a segment, on the side away from `longe`. */
  const aoLado = (a: [number, number], b: [number, number], t: string, longe: [number, number], dentro = false): [number, number] => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const L = Math.hypot(dx, dy) || 1
    let nx = dy / L
    let ny = -dx / L
    const m: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    if (nx * (m[0] - longe[0]) + ny * (m[1] - longe[1]) < 0) [nx, ny] = [-nx, -ny]
    if (dentro) [nx, ny] = [-nx, -ny]
    const off = 11 + Math.abs(nx) * (largura(t, 14) / 2) + Math.abs(ny) * 8
    return [m[0] + nx * off, m[1] + ny * off]
  }

  // Grid of whole units, over the whole stage.
  if (s.grade) {
    const passo = sc >= 9 ? 1 : sc >= 4 ? 2 : 5
    const x0 = Math.ceil(-ox / sc / passo) * passo
    const x1 = Math.floor((W - ox) / sc / passo) * passo
    const y0 = Math.ceil((oy - Hs) / sc / passo) * passo
    const y1 = Math.floor(oy / sc / passo) * passo
    const g = { stroke: 'rgba(255,255,255,0.10)', sw: 1, cap: 'butt' as const }
    for (let x = x0; x <= x1; x += passo) linha(`gx:${x}`, [ox + x * sc, 0], [ox + x * sc, Hs], g)
    for (let y = y0; y <= y1; y += passo) linha(`gy:${y}`, [0, oy - y * sc], [W, oy - y * sc], g)
  }

  // The protractor goes under the angle's sides; its numbers go on top.
  const a0 = angs[0]
  const Rpx = trR * sc
  const fo = clamp(Rpx * 0.072, 10, 16)
  const rFora = Rpx - 11 - fo * 0.75
  const rDentro = rFora - fo * 1.55
  // The inner numbers get smaller when they are close together.
  const fi = clamp((rDentro * Math.PI) / 18 / 2.05, 8.5, fo - 1)
  const posEscala = (t: number, escala: 'dentro' | 'fora'): [number, number] => {
    const r = escala === 'fora' ? rFora : rDentro
    const delta = (((fo * 0.6 + 2) / Math.max(10, r)) * 180) / Math.PI
    const tl = clamp(t, delta, 180 - delta)
    return X(polar(a0.v, r / sc, a0.de + a0.sentido * tl))
  }
  if (tr && a0) {
    const V = X(a0.v)
    const lo = a0.sentido > 0 ? a0.de : a0.de - 180
    prims.push({ k: 'tr:disco', t: 'wedge', v: [V[0], V[1], Rpx, -(lo + 180), -lo], fill: alpha(sky, 0.08), stroke: alpha(sky, 0.7), sw: 1.5 })
    const marcas: number[] = []
    const fino = Rpx >= 110 ? 5 : 10
    for (let t = 0; t <= 180; t += fino) {
      const len = t % 10 === 0 ? 9 : 5
      const g = a0.de + a0.sentido * t
      marcas.push(...X(polar(a0.v, trR, g)), ...X(polar(a0.v, trR - len / sc, g)))
    }
    prims.push({ k: 'tr:marcas', t: 'path', v: marcas, pares: true, stroke: alpha(sky, 0.85), sw: 1.2, cap: 'butt' })
    const passo = Rpx >= 115 ? 10 : Rpx >= 75 ? 20 : 30
    const g = grausCertos(a0.graus)
    const certa = escalaCerta(tr.invertido)
    for (let t = 0; t <= 180; t += passo) {
      for (const esc of ['fora', 'dentro'] as const) {
        const ok = s.medido && t === g && esc === certa
        texto(`tr:${esc}:${t}`, posEscala(t, esc), String(leituraTransferidor(t, esc, tr.invertido)), {
          fs: esc === 'fora' ? fo : fi,
          peso: ok ? 700 : esc === 'fora' ? 600 : 500,
          fill: ok ? amber : esc === 'fora' ? 'rgba(255,255,255,0.9)' : sky,
        })
      }
    }
    if (lido) prims.push({ k: 'tr:lido', t: 'circle', v: [...posEscala(lido.direcao, lido.escala), 13], stroke: rose, sw: 2, fill: alpha(rose, 0.15) })
    if (s.medido) prims.push({ k: 'tr:ok', t: 'circle', v: [...posEscala(g, certa), 13], stroke: amber, sw: 2, fill: alpha(amber, 0.2) })
    alvos.medir = { cx: V[0], cy: V[1], R: Rpx, rDivisa: (rFora + rDentro) / 2, de: a0.de, sentido: a0.sentido, graus: g }
  }

  // Squares on the sides (Pythagoras), under the triangle.
  if (tri && quadOn) {
    const c = centroide(tri.verts)
    const pg = pitagorasDe(tri.verts)
    const comp = [0, 1, 2].map((i) => dist(tri.verts[i], tri.verts[(i + 1) % 3]))
    const ordem = [0, 1, 2].sort((a, b) => comp[a] - comp[b])
    const corLado = (i: number) => (pg ? (i === pg.catetos[0] ? amber : i === pg.catetos[1] ? sky : gray) : [amber, sky, gray][ordem.indexOf(i)])
    const areas = Array.isArray(quadOpts.areas) ? quadOpts.areas : undefined
    for (let i = 0; i < 3; i++) {
      const q = quadradoNoLado(tri.verts[i], tri.verts[(i + 1) % 3], c)
      const cor = corLado(i)
      const vazio = Boolean(encaixe && s.encaixado && cor !== gray)
      prims.push({ k: `q:${i}`, t: 'path', v: q.map(X).flat(), fechado: true, fill: alpha(cor, encaixe ? 0.05 : 0.16), stroke: alpha(cor, 0.9), sw: 2, dash: vazio ? '5 4' : undefined })
      const L = comp[i]
      const inteiro = Math.abs(L - Math.round(L)) < 1e-6 && L >= 1
      if (inteiro && (quadOpts.quadriculado || encaixe)) {
        const n = Math.round(L)
        const [P, Q, , N] = q
        const g: number[] = []
        for (let k = 1; k < n; k++) {
          const f = k / n
          g.push(...X([P[0] + (Q[0] - P[0]) * f, P[1] + (Q[1] - P[1]) * f]), ...X([N[0] + (Q[0] - P[0]) * f, N[1] + (Q[1] - P[1]) * f]))
          g.push(...X([P[0] + (N[0] - P[0]) * f, P[1] + (N[1] - P[1]) * f]), ...X([Q[0] + (N[0] - P[0]) * f, Q[1] + (N[1] - P[1]) * f]))
        }
        prims.push({ k: `qg:${i}`, t: 'path', v: g, pares: true, stroke: alpha(cor, 0.35), sw: 1, cap: 'butt' })
      }
      if (quadOpts.areas !== false) {
        const t = areas ? areas[i] : fmtNum(L * L)
        if (t !== null && t !== undefined) texto(`qa:${i}`, X(centroide(q)), String(t), { fs: 18, peso: 700, fill: cor === gray || encaixe ? '#fff' : cor, op: vazio ? 0.45 : 1 })
      }
    }
    if (encaixe && pg) {
      const total = encaixe.origem[0].length
      for (let k = 0; k < 2; k++) {
        const cor = k === 0 ? amber : sky
        encaixe.origem[k].forEach((o, j) => {
          const cel = s.encaixado ? encaixe.alvo[k][j] : o
          const [x, y] = X(cel.c)
          prims.push({ k: `cel:${k}:${j}`, t: 'cell', v: [x, y, sc * 0.84, -cel.ang], fill: alpha(cor, 0.85), dur: 700, atraso: s.encaixado ? (k ? total + j : j) * 40 : 0 })
        })
      }
    }
  }

  // Circle (still, or rolling along the line).
  if (circ && cc) {
    const C = X(cc)
    const r = circ.raio * sc
    if (rolar) {
      const yl = C[1] + r
      const volta = 2 * Math.PI * r
      linha('roll:linha', [C[0] - 16, yl], [C[0] + volta + 16, yl], { stroke: gray, sw: 1.5, op: 0.45 })
      prims.push({ k: 'roll', t: 'roll', v: [C[0], yl, r, s.desenrolado ? volta : 0], stroke: corDe(circ.destaque, amber), diam: circ.diametroVisivel !== false, dur: 2000 })
      if (s.desenrolado) {
        const d = 2 * r
        const at = { atraso: 1900, dur: 450 }
        for (let i = 0; i < 3; i++) {
          linha(`roll:d:${i}`, [C[0] + i * d, yl + 11], [C[0] + (i + 1) * d, yl + 11], { stroke: i % 2 ? alpha(sky, 0.55) : sky, sw: 6, cap: 'butt', ...at })
          texto(`roll:n:${i}`, [C[0] + (i + 0.5) * d, yl + 30], String(i + 1), { fill: sky, fs: 15, ...at })
        }
        linha('roll:s', [C[0] + 3 * d, yl + 11], [C[0] + volta, yl + 11], { stroke: amber, sw: 6, cap: 'butt', ...at })
        texto('roll:st', [C[0] + 3 * d + (volta - 3 * d) / 2 + 6, yl + 30], '0,14', { fill: amber, fs: 13, ...at })
      }
    } else {
      prims.push({ k: 'ci', t: 'circle', v: [C[0], C[1], r], stroke: corDe(circ.destaque, gray), sw: 2.5, fill: circ.preenchido ? alpha(corDe(circ.preenchido), 0.18) : 'none' })
      if (circ.diametroVisivel) {
        linha('ci:d', X([cc[0] - circ.raio, cc[1]]), X([cc[0] + circ.raio, cc[1]]), { stroke: sky, sw: 2.5 })
        if (circ.diametroTexto) texto('ci:dt', [C[0] - r / 2, C[1] + 15], circ.diametroTexto, { fill: sky })
      }
      if (circ.raioVisivel) {
        const g = circ.diametroVisivel ? 50 : 0
        const E = X(polar(cc, circ.raio, g))
        linha('ci:r', C, E, { stroke: amber, sw: 2.5 })
        if (circ.raioTexto) texto('ci:rt', aoLado(C, E, circ.raioTexto, circ.diametroVisivel ? [C[0] + r, C[1] + r] : [C[0], C[1] + r]), circ.raioTexto, { fill: amber })
      }
      prims.push({ k: 'ci:c', t: 'circle', v: [C[0], C[1], 3.5], fill: '#fff' })
    }
  }

  // Polygons.
  polys.forEach((p, pi) => {
    const T = p.verts.map(X)
    const n = T.length
    const cT = centroide(T)
    const cheio = p.o.preenchido ?? (pi === 0 && rec ? true : undefined)
    const fill = cheio ? alpha(corDe(cheio), 0.2) : 'none'
    const stroke = corDe(p.o.destaque, gray)
    if (pi === 0 && rec) {
      prims.push({ k: 'rec:resto', t: 'path', v: rec.resto.map(X).flat(), fechado: true, fill, stroke, sw: 2.5 })
      const mv: Vec = s.recortado ? rec.mover : [0, 0]
      prims.push({ k: 'rec:pedaco', t: 'path', v: rec.pedaco.map((q) => X([q[0] + mv[0], q[1] + mv[1]])).flat(), fechado: true, fill, stroke: s.recortado ? stroke : amber, sw: 2.5, dash: s.recortado ? undefined : '6 5', dur: 950 })
      if (!s.recortado)
        linhasDeCorte(rec.pedaco, p.verts).forEach(([a, b], j) => {
          linha(`rec:fundo:${j}`, X(a), X(b), { stroke: '#000', sw: 4 })
          linha(`rec:corte:${j}`, X(a), X(b), { stroke: amber, sw: 2.5, dash: '6 5' })
        })
    } else if (n >= 2) {
      prims.push({ k: `pol:${pi}`, t: 'path', v: T.flat(), fechado: n > 2, fill: n > 2 ? fill : 'none', stroke, sw: 2.5 })
    }
    if (n < 3) return
    // Lit sides (the contour) and the side measures.
    const acesos = pi === 0 ? (s.acesos === true ? T.map((_, i) => i) : Array.isArray(s.acesos) ? s.acesos : []) : []
    acesos.forEach((i) => T[i] && linha(`aceso:${i}`, T[i], T[(i + 1) % n], { stroke: amber, sw: 5 }))
    if (pi === 0 && s.contorno) T.forEach((a, i) => !acesos.includes(i) && alvos.lados.push({ i, a, b: T[(i + 1) % n] }))
    const lt = ladosTextos(p, s.unidade)
    lt.forEach((t, i) => t && texto(`lt:${pi}:${i}`, aoLado(T[i], T[(i + 1) % n], t, cT, pi === 0 && quadOn), t, { fill: acesos.includes(i) ? amber : 'rgba(255,255,255,0.92)' }))
    // Corner arcs, right-angle squares and their values.
    if (pi === 0 && juntarOn) return
    const at = angulosTextos(p)
    const retos = new Set((p.o.angulosRetos ?? []).map((r) => (typeof r === 'number' ? r : p.nomes.indexOf(r))))
    T.forEach((V, i) => {
      const txt = at[i]
      const c = cantoDe(p.verts, i)
      const reto = retos.has(i) || (txt !== undefined && p.o.angulos === true && Math.abs(c.graus - 90) < 0.5)
      if (!txt && !reto) return
      const l1 = Math.hypot(T[(i + 1) % n][0] - V[0], T[(i + 1) % n][1] - V[1])
      const l2 = Math.hypot(T[(i - 1 + n) % n][0] - V[0], T[(i - 1 + n) % n][1] - V[1])
      const ra = clamp(0.2 * Math.min(l1, l2), 14, 30)
      if (reto) prims.push(marcaReta(`ar:${pi}:${i}`, V, T[(i + 1) % n], T[(i - 1 + n) % n], Math.min(ra * 0.6, 14)))
      else prims.push({ k: `aa:${pi}:${i}`, t: 'wedge', v: [V[0], V[1], ra, -c.ate, -c.de], fill: alpha(amber, 0.18), stroke: amber, sw: 1.8 })
      if (txt) {
        const b = (((c.de + c.ate) / 2) * Math.PI) / 180
        const ux = Math.cos(b)
        const uy = -Math.sin(b)
        const off = ra + 7 + Math.abs(ux) * (largura(txt, 14) / 2) + Math.abs(uy) * 8
        texto(`at:${pi}:${i}`, [V[0] + ux * off, V[1] + uy * off], txt, { fill: amber })
      }
    })
    if (p.o.nome) texto(`pnome:${pi}`, cT, p.o.nome, { fs: 15, peso: 500, fill: 'rgba(255,255,255,0.8)' })
  })

  // The triangle's corners, cut and joined on a line under it.
  if (tri && juntarOn) {
    const T = tri.verts.map(X)
    const rw = clamp(0.3 * ladoMin * sc, 22, 52)
    const Jx = centroide(T)[0]
    const Jy = Math.max(...T.map((v) => v[1])) + rw + 26
    const graus = [0, 1, 2].map((i) => cantoDe(tri.verts, i).graus)
    const ordem = s.juntados === true ? [0, 1, 2] : Array.isArray(s.juntados) ? s.juntados.filter((i, k, a) => i >= 0 && i < 3 && a.indexOf(i) === k) : []
    const cheio = ordem.length === 3
    const alvo = cantosNaReta(graus, ordem)
    const cores = [amber, sky, green]
    const at = angulosTextos(tri)
    linha('j:linha', [Jx - rw - 34, Jy], [Jx + rw + 34, Jy], { stroke: cheio ? amber : gray, sw: 2, op: cheio ? 1 : 0.5 })
    prims.push({ k: 'j:guia', t: 'wedge', v: [Jx, Jy, rw, 180, 360], arco: true, stroke: 'rgba(255,255,255,0.35)', sw: 1.5, dash: '3 4' })
    for (let i = 0; i < 3; i++) {
      const c = cantoDe(tri.verts, i)
      const g = alvo.get(i)
      const [cx, cy, a, b] = g ? [Jx, Jy, -g.ate, -g.de] : [T[i][0], T[i][1], -c.ate, -c.de]
      if (g) prims.push({ k: `j:fantasma:${i}`, t: 'wedge', v: [T[i][0], T[i][1], rw, -c.ate, -c.de], stroke: cores[i], sw: 1.5, dash: '3 3', op: 0.7 })
      prims.push({ k: `j:canto:${i}`, t: 'wedge', v: [cx, cy, rw, a, b], fill: alpha(cores[i], 0.55), stroke: cores[i], sw: 1.5, dur: 800 })
      if (at[i]) {
        const m = (((a + b) / 2) * Math.PI) / 180
        const ux = Math.cos(m)
        const uy = Math.sin(m)
        const off = rw + 8 + Math.abs(ux) * (largura(at[i]!, 14) / 2) + Math.abs(uy) * 8
        texto(`j:valor:${i}`, [cx + ux * off, cy + uy * off], at[i]!, { fill: cores[i], dur: 800 })
      }
      if (!g) alvos.cantos.push({ i, x: T[i][0], y: T[i][1] })
    }
    if (cheio) texto('j:180', [Jx, Jy + 18], '180°', { fill: amber, fs: 16, peso: 700 })
  }

  // Segments, lines (arrows at both ends) and rays (arrow at the end).
  const ext = 26
  const longe = (u: [number, number], v: [number, number], d: number): [number, number] => {
    const L = Math.hypot(v[0] - u[0], v[1] - u[1]) || 1
    return [v[0] + ((v[0] - u[0]) / L) * d, v[1] + ((v[1] - u[1]) / L) * d]
  }
  const medida = (k: string, a: [number, number], b: [number, number], t: string | undefined, cor: string) => t && texto(k, aoLado(a, b, t, centroTela), t, { fill: cor === gray ? 'rgba(255,255,255,0.92)' : cor })
  segs.forEach((t, i) => {
    const cor = corDe(t.destaque)
    const a = X(t.a)
    const b = X(t.b)
    linha(`seg:${i}`, a, b, { stroke: cor, sw: t.destaque ? 3.5 : 2.5, dash: t.tracejado ? '6 5' : undefined })
    medida(`segm:${i}`, a, b, t.medida, cor)
  })
  retas.forEach((t, i) => {
    const cor = corDe(t.destaque)
    const a = X(t.a)
    const b = X(t.b)
    prims.push({ k: `reta:${i}`, t: 'path', v: [...longe(b, a, ext), ...longe(a, b, ext)], stroke: cor, sw: t.destaque ? 3 : 2.25, seta: 'ambos', dash: t.tracejado ? '6 5' : undefined })
    medida(`retam:${i}`, a, b, t.medida, cor)
  })
  semis.forEach((t, i) => {
    const cor = corDe(t.destaque)
    const a = X(t.a)
    const b = X(t.b)
    prims.push({ k: `semi:${i}`, t: 'path', v: [...a, ...longe(a, b, ext)], stroke: cor, sw: t.destaque ? 3 : 2.25, seta: 'fim', dash: t.tracejado ? '6 5' : undefined })
    medida(`semim:${i}`, a, b, t.medida, cor)
  })

  // Angles: the two sides, the arc (or the right-angle square) and the value.
  angs.forEach((a, ai) => {
    const V = X(a.v)
    const ate = a.de + a.sentido * a.graus
    const e0 = X(polar(a.v, a.comp[0], a.de))
    const e1 = X(polar(a.v, a.comp[1], ate))
    const cor = corDe(a.o.destaque)
    if (a.o.lados !== false) {
      linha(`al:${ai}:0`, V, e0, { stroke: cor })
      linha(`al:${ai}:1`, V, e1, { stroke: cor })
    }
    // A side shorter than the protractor is extended (thin, dashed) until it crosses the scale.
    if (tr && ai === 0)
      a.comp.forEach((c, i) => {
        if (c < trR * 1.02) linha(`al:${ai}:ext:${i}`, i ? e1 : e0, X(polar(a.v, trR * 1.1, i ? ate : a.de)), { stroke: cor, sw: 1.5, dash: '3 4', op: 0.8 })
      })
    const ra = tr && ai === 0 ? clamp(0.17 * Rpx, 16, 28) : clamp(0.3 * Math.min(...a.comp) * sc, 18, 40)
    const lo = a.sentido > 0 ? a.de : a.de - a.graus
    const reto = Math.abs(a.graus - 90) < 0.5
    if (reto) prims.push(marcaReta(`ar2:${ai}`, V, e0, e1, Math.min(ra * 0.6, 15)))
    else if (a.o.arco !== false) prims.push({ k: `aw:${ai}`, t: 'wedge', v: [V[0], V[1], ra, -(lo + a.graus), -lo], fill: alpha(amber, 0.2), stroke: amber, sw: 2 })
    const valor = a.o.valor === true || (ai === 0 && s.medido && a.o.valor === undefined) ? `${fmtNum(a.graus, 0)}°` : typeof a.o.valor === 'string' ? a.o.valor : undefined
    if (valor) {
      const b = ((lo + a.graus / 2) * Math.PI) / 180
      const ux = Math.cos(b)
      const uy = -Math.sin(b)
      const off = ra + 8 + Math.abs(ux) * (largura(valor, 15) / 2) + Math.abs(uy) * 9
      texto(`av:${ai}`, [V[0] + ux * off, V[1] + uy * off], valor, { fill: amber, fs: 15, peso: 700 })
    }
    prims.push({ k: `avx:${ai}`, t: 'circle', v: [V[0], V[1], 3.5], fill: '#fff' })
    if (a.o.nome) texto(`an:${ai}`, [(Math.min(V[0], e0[0], e1[0]) + Math.max(V[0], e0[0], e1[0])) / 2, Math.max(V[1], e0[1], e1[1]) + 24], a.o.nome, { fs: 15, peso: 500, fill: 'rgba(255,255,255,0.8)' })
  })

  // Named points: a dot and the name, away from the figure (or where `posRotulos` says).
  if (s.rotulos !== false) {
    const nomes = typeof s.rotulos === 'object' ? s.rotulos : {}
    const linhasPor = [...segs, ...retas, ...semis].map((t) => [X(t.a), X(t.b)] as const)
    for (const k of Object.keys(pts)) {
      const v = resolve(k, pts)
      if (!v || (rolar && circ?.centro === k)) continue
      const P = X(v)
      prims.push({ k: `pt:${k}`, t: 'circle', v: [P[0], P[1], 3.5], fill: '#fff' })
      const nome = nomes[k] ?? k
      const dono = polys.find((p) => p.nomes.includes(k))
      const de = dono ? centroide(dono.verts.map(X)) : centroTela
      let dx = P[0] - de[0]
      let dy = P[1] - de[1]
      let L = Math.hypot(dx, dy)
      if (L < 1) [dx, dy, L] = [0, -1, 1]
      dx /= L
      dy /= L
      // On a line, the name would sit on the line: it goes to the side instead.
      for (const [a, b] of linhasPor) {
        const lx = b[0] - a[0]
        const ly = b[1] - a[1]
        const ll = Math.hypot(lx, ly) || 1
        const naLinha = Math.abs((lx * (P[1] - a[1]) - ly * (P[0] - a[0])) / ll) < 2
        if (naLinha && Math.abs((dx * lx + dy * ly) / ll) > 0.8) {
          ;[dx, dy] = [ly / ll, -lx / ll]
          if (dy > 0) [dx, dy] = [-dx, -dy]
        }
      }
      if (circ && circ.centro === k) [dx, dy] = [0.55, 0.85]
      const pos = s.posRotulos?.[k]
      if (pos) [dx, dy] = pos === 'acima' ? [0, -1] : pos === 'abaixo' ? [0, 1] : pos === 'esquerda' ? [-1, 0] : [1, 0]
      const off = 14 + Math.abs(dx) * (largura(nome, 16) / 2) + Math.abs(dy) * 4
      texto(`pn:${k}`, [P[0] + dx * off, P[1] + dy * off], nome, { fs: 16, peso: 600 })
    }
  }

  return { prims: [...prims, ...topo], alvos }
}

const grausCertos = (g: number) => Math.round(g)

function marcaReta(k: string, V: [number, number], A: [number, number], B: [number, number], q: number): Prim {
  const u = (P: [number, number]): [number, number] => {
    const L = Math.hypot(P[0] - V[0], P[1] - V[1]) || 1
    return [(P[0] - V[0]) / L, (P[1] - V[1]) / L]
  }
  const a = u(A)
  const b = u(B)
  return {
    k,
    t: 'path',
    v: [V[0], V[1], V[0] + a[0] * q, V[1] + a[1] * q, V[0] + (a[0] + b[0]) * q, V[1] + (a[1] + b[1]) * q, V[0] + b[0] * q, V[1] + b[1] * q],
    fechado: true,
    fill: alpha(amber, 0.18),
    stroke: amber,
    sw: 1.8,
  }
}

// ---------------------------------------------------------------- the component

export function Figura({ s, size, lido, onEscala, onCanto, onLado, onToque, tremer = 0 }: { s: FiguraState; size: { w: number; h: number } } & FiguraInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])

  const p0 = poligonosDe(s)[0]
  const acesos = s.acesos === true && p0 ? p0.verts.map((_, i) => i) : Array.isArray(s.acesos) ? s.acesos : []
  const soma = s.soma && p0 ? somaTexto(ladosValores(p0), acesos, s.unidade) : ''
  const textH = s.rotulo || s.soma ? 56 : 0
  const W = size.w
  const Hs = Math.max(140, size.h - textH)
  const { prims, alvos } = montar(s, W, Hs, lido)
  const cena = useCena(prims)

  const medirToque = (e: React.PointerEvent<SVGPathElement>) => {
    const m = alvos.medir
    const svg = e.currentTarget.ownerSVGElement
    if (!m || !svg || !onEscala) return
    const r = svg.getBoundingClientRect()
    const x = e.clientX - r.left - m.cx
    const y = e.clientY - r.top - m.cy
    const d = Math.hypot(x, y)
    if (d > m.R + 8) return
    const mundo = (Math.atan2(-y, x) * 180) / Math.PI
    let t = m.sentido * (mundo - m.de)
    t = ((t % 360) + 360) % 360
    if (t > 270) t -= 360
    if (t < -12 || t > 192) return
    // Near the angle's side, the reading is the side's direction (any whole degree); elsewhere, the nearest printed ten.
    const dir = Math.abs(t - m.graus) <= 4 ? m.graus : Math.round(clamp(t, 0, 180) / 10) * 10
    onEscala(dir, d > m.rDivisa ? 'fora' : 'dentro')
  }

  const [lado, total] = soma.split(' = ')
  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? 'Figura'}>
      <svg width={W} height={Hs} viewBox={`0 0 ${W} ${Hs}`} className="block shrink-0 overflow-visible" onClick={onToque} style={{ cursor: onToque ? 'pointer' : undefined }}>
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {alvos.medir && onEscala && (
          <path
            d={arcoD(alvos.medir.cx, alvos.medir.cy, alvos.medir.R + 8, alvos.medir.sentido > 0 ? -(alvos.medir.de + 186) : -(alvos.medir.de + 6), alvos.medir.sentido > 0 ? -(alvos.medir.de - 6) : -(alvos.medir.de - 186), true)}
            fill="transparent"
            className="cursor-pointer"
            onPointerDown={medirToque}
            aria-label="escala do transferidor"
          />
        )}
        {onCanto &&
          alvos.cantos.map((c) => (
            <circle key={`c${c.i}`} cx={c.x} cy={c.y} r={30} fill="transparent" className="cursor-pointer" onClick={() => onCanto(c.i)} aria-label={`canto ${c.i + 1}`} role="button" />
          ))}
        {onLado &&
          alvos.lados.map((l) => (
            <path key={`l${l.i}`} d={`M${l.a[0]} ${l.a[1]}L${l.b[0]} ${l.b[1]}`} stroke="transparent" strokeWidth={30} strokeLinecap="round" className="cursor-pointer" onClick={() => onLado(l.i)} aria-label={`lado ${l.i + 1}`} role="button" />
          ))}
      </svg>
      {soma ? (
        <p className="whitespace-nowrap px-4 text-center text-[24px] font-semibold tabular-nums text-white">
          {lado}
          {total && <span style={{ color: amber }}> = {total}</span>}
        </p>
      ) : s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[20px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : textH ? (
        <p className="text-[24px]">&nbsp;</p>
      ) : null}
    </motion.div>
  )
}
