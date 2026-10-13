'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  abre,
  aplica,
  areaTexto,
  cameraDe,
  camadasDe,
  contagemTexto,
  deFrente,
  destaquesDe,
  dimsDe,
  facesDe,
  giraV,
  gradeDe,
  medidasDe,
  modoCamadas,
  noPlano,
  partesDe,
  projeta,
  somaTexto,
  tipoDe,
  type Ancora,
  type Camera,
  type CorFace,
  type Dims,
  type Face3,
  type Mat,
  type SolidoState,
  type V2,
  type V3,
} from './solido-geo'

export type { SolidoState }

// O sólido da U17: a caixa, o cubo, o prisma de base triangular e o cilindro
// (que se abrem na planificação), a pirâmide e o cone (só para nomear), em
// perspectiva, com as medidas nas arestas e as faces coloridas.
//
// Abrir é dobrar ao contrário: cada face gira em torno da sua dobradiça até o
// plano da face da frente, enquanto o olhar vira de frente para ela. As
// camadas de cubinhos caem uma a uma dentro da caixa tracejada.
//
// Os Mexa: abrir (um toque), empilhar (um toque por camada) e pintar (um
// toque por face, somando as áreas). As contas ficam em solido-geo.ts.

export interface SolidoInteract {
  /** Mexa de toque no palco (abrir, empilhar). */
  onToque?: () => void
  /** Mexa "pintar": tocar numa face. */
  onFace?: (parte: string) => void
}

const amber = '#f6b74e'
const sky = '#7dd3fc'
const rose = '#fb7185'
const green = '#6fd3a8'
const NEUTRO: V3 = [150, 158, 172]
const LUZ: V3 = (() => {
  const v: V3 = [-0.35, -0.75, 0.9]
  const L = Math.hypot(...v)
  return [v[0] / L, v[1] / L, v[2] / L]
})()

const corDe = (c: CorFace | undefined) => (c === 'azul' ? sky : c === 'erro' ? rose : c === 'verde' ? green : c ? amber : undefined)
const rgb = (hex: string): V3 => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const tom = (c: V3, k: number) => `rgb(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)})`
const largura = (t: string, fs: number) => t.length * fs * 0.56
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const reduzido = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ---------------------------------------------------------------- numbers that move

interface Canal {
  de: number
  para: number
  t0: number
  dur: number
}

/**
 * Each number goes from where it is to the new target, in its own time (the
 * opening, the layers, the sizes). A new target in the middle starts from
 * where the number is now.
 */
function useTween(alvo: Record<string, number>, dur: (k: string, de: number, para: number) => number, ease: (k: string, t: number) => number): Record<string, number> {
  const canais = useRef(new Map<string, Canal>())
  const [agora, setAgora] = useState(0)
  const valor = (k: string, t: number) => {
    const c = canais.current.get(k)!
    const p = c.dur > 0 ? clamp((t - c.t0) / c.dur, 0, 1) : 1
    return c.de + (c.para - c.de) * ease(k, p)
  }
  const chave = JSON.stringify(alvo)
  useEffect(() => {
    const t = performance.now()
    let vivo = false
    for (const [k, v] of Object.entries(JSON.parse(chave) as Record<string, number>)) {
      const c = canais.current.get(k)
      if (!c) {
        canais.current.set(k, { de: v, para: v, t0: t, dur: 0 })
        continue
      }
      if (c.para === v) continue
      const atual = valor(k, t)
      canais.current.set(k, { de: atual, para: v, t0: t, dur: reduzido() ? 0 : dur(k, atual, v) })
      vivo = true
    }
    if (!vivo) return
    let raf = 0
    const passo = (n: number) => {
      setAgora(n)
      if ([...canais.current.values()].some((c) => n < c.t0 + c.dur)) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])
  return Object.fromEntries(Object.entries(alvo).map(([k, v]) => [k, canais.current.has(k) ? valor(k, agora) : v]))
}

// ---------------------------------------------------------------- the scene

interface Corpo {
  faces: Face3[]
  mats: Mat[]
  ids: string[]
}

const corpoDe = (d: Dims, dobra: number): Corpo => {
  const r = facesDe(d, dobra)
  return { faces: r.faces, mats: r.mats, ids: r.faces.map((f) => f.id) }
}

/** Where an anchor is in the world: on a face of the net (moved with it) or a world point. */
function noMundo(a: Ancora, corpo: Corpo): { p: V3; dir: V3 } | undefined {
  if (a.face === undefined) return { p: a.p as V3, dir: a.dir as V3 }
  const i = corpo.ids.indexOf(a.face)
  const m = corpo.mats[i]
  if (!m) return undefined
  const dir = a.dir as V2
  return { p: aplica(m, noPlano(a.p as V2)), dir: giraV(m, [dir[0], 0, dir[1]]) }
}

type Tela = (p: V3) => [number, number, number]

function caixaDe(pts: V3[], cam: Camera) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const p of pts) {
    const [x, y] = projeta(p, cam)
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    y0 = Math.min(y0, y)
    y1 = Math.max(y1, y)
  }
  return { x0, y0, x1, y1 }
}

const caminho = (pts: [number, number][], fechado = true) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('') + (fechado ? 'Z' : '')

function seta(x1: number, y1: number, x2: number, y2: number) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / L
  const uy = (y2 - y1) / L
  const s = 8
  return `M${x2} ${y2}L${x2 - ux * s - uy * 4.5} ${y2 - uy * s + ux * 4.5}L${x2 - ux * s + uy * 4.5} ${y2 - uy * s - ux * 4.5}Z`
}

function Rotulo({ x, y, texto, cor = '#fff', op = 1, fs = 14 }: { x: number; y: number; texto: string; cor?: string; op?: number; fs?: number }) {
  if (op <= 0.01) return null
  return (
    <text x={x} y={y} opacity={op} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={600} fill={cor} stroke="#000" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke" className="tabular-nums" pointerEvents="none">
      {texto}
    </text>
  )
}

/**
 * The faces, back to front: the fill (shaded by a light from the upper left),
 * the edges (on a curved surface, only the outline) and what is drawn on the
 * face. A face seen from behind (the inside of the open box) is darker.
 */
function desenhaFaces(
  faces: Face3[],
  cam: Camera,
  tela: Tela,
  cor: (f: Face3) => string | undefined,
  o: { k: string; edge?: string; sw?: number; tracejado?: boolean; onFace?: (parte: string) => void; sobre?: (f: Face3, i: number) => React.ReactNode; op?: number; contorno?: boolean },
) {
  const frente = faces.map((f) => deFrente(f.n, cam))
  const porSuave = new Map<string, number[]>()
  faces.forEach((f, i) => f.suaves?.forEach((k) => k && porSuave.set(k, [...(porSuave.get(k) ?? []), i])))
  const T = faces.map((f) => f.pts.map(tela))
  const ordem = faces.map((_, i) => i).sort((a, b) => T[b].reduce((s, p) => s + p[2], 0) / T[b].length - T[a].reduce((s, p) => s + p[2], 0) / T[a].length)
  const edge = o.edge ?? 'rgba(229,231,235,0.92)'
  // A dashed edge shared by two faces is drawn once (two dash patterns on top of each other look solid).
  const vistas = new Set<string>()
  return ordem.map((i) => {
    const f = faces[i]
    const pts = T[i].map((p) => [p[0], p[1]] as [number, number])
    const c = cor(f)
    const base = c ? rgb(c) : NEUTRO
    const lam = Math.max(0, f.n[0] * LUZ[0] + f.n[1] * LUZ[1] + f.n[2] * LUZ[2])
    const k = frente[i] ? (c ? 0.5 + 0.45 * (0.45 + 0.55 * lam) : 0.24 + 0.2 * lam) : c ? 0.32 : 0.12
    const fill = tom(base, k)
    let arestas = ''
    pts.forEach((p, j) => {
      const q = pts[(j + 1) % pts.length]
      const sv = f.suaves?.[j]
      if (sv) {
        // A fold inside a curved surface shows only where the surface turns away.
        const outro = (porSuave.get(sv) ?? []).find((x) => x !== i)
        if (!frente[i] || (outro !== undefined && frente[outro])) return
      } else if (o.contorno && !frente[i]) return
      if (o.tracejado) {
        const k = [p, q].map((v) => `${Math.round(v[0])},${Math.round(v[1])}`).sort().join('|')
        if (vistas.has(k)) return
        vistas.add(k)
      }
      arestas += `M${p[0].toFixed(2)} ${p[1].toFixed(2)}L${q[0].toFixed(2)} ${q[1].toFixed(2)}`
    })
    return (
      <g key={`${o.k}:${f.id}`} opacity={o.op}>
        {!o.contorno && (
          <path
            d={caminho(pts)}
            fill={fill}
            stroke={fill}
            strokeWidth={1.2}
            strokeLinejoin="round"
            onClick={o.onFace ? () => o.onFace!(f.parte) : undefined}
            style={{ cursor: o.onFace ? 'pointer' : undefined, transition: 'fill 0.35s' }}
            role={o.onFace ? 'button' : undefined}
            aria-label={o.onFace ? f.parte : undefined}
          />
        )}
        {arestas && <path d={arestas} fill="none" stroke={edge} strokeWidth={o.sw ?? 1.8} strokeLinecap="round" strokeDasharray={o.tracejado ? '5 5' : undefined} pointerEvents="none" />}
        {frente[i] && o.sobre?.(f, i)}
      </g>
    )
  })
}

function SolidoCena({ s, size, onToque, onFace }: { s: SolidoState; size: { w: number; h: number } } & SolidoInteract) {
  const d0 = dimsDe(s)
  const camadasOn = modoCamadas(s)
  const kAlvo = camadasOn ? camadasDe(s, d0) : 0
  const aAlvo = camadasOn || !abre(d0.tipo) ? 0 : s.aberto === true ? 1 : typeof s.aberto === 'number' ? clamp(s.aberto, 0, 1) : 0
  const tw = useTween(
    { f: aAlvo, k: kAlvo, c: d0.c, l: d0.l, h: d0.h, r: d0.r, ap: d0.ap },
    (k, de, para) => (k === 'f' ? 1500 * Math.abs(para - de) + 200 : k === 'k' ? clamp(430 * Math.abs(para - de), 350, 2600) : 600),
    (k, t) => (k === 'f' ? easeIO(t) : k === 'k' ? t : easeOut(t)),
  )
  const d: Dims = { ...d0, c: tw.c, l: tw.l, h: tw.h, r: tw.r, ap: tw.ap }
  const f = tw.f
  const cam = cameraDe(d.tipo, f)

  const pintadas = Array.isArray(s.pintadas) ? s.pintadas : []
  const soma = s.soma ? somaTexto(d0, pintadas, s.unidade) : ''
  // The count follows the layers as they land.
  const contagem = camadasOn && s.contagem !== false ? contagemTexto(s, d0, Math.floor(tw.k + 0.02)) : ''
  const baixo = soma || s.rotulo || contagem
  const textH = baixo || s.soma || (camadasOn && s.contagem !== false) ? 56 : 0
  const W = size.w
  const Hs = Math.max(160, size.h - textH)

  // The fit: the closed solid and the net each fill the stage, and the size goes from one to the other as it opens.
  const { rotulos, linhas } = medidasDe(s, d)
  // Labels to the side (the height) need room beside the solid; the others only half of their width.
  const deLado = (r: (typeof rotulos)[number]) => !r.ate && Math.abs(r.a.dir[0]) > 0.5
  const padX = Math.max(26, 18 + Math.max(0, ...rotulos.filter(deLado).map((r) => largura(r.texto, 14))), 12 + Math.max(0, ...rotulos.filter((r) => !deLado(r)).map((r) => largura(r.texto, 14) / 2)))
  const padT = 26
  const padB = 30
  const encaixe = (pts: V3[], c: Camera) => {
    const b = caixaDe(pts, c)
    const bw = Math.max(1e-6, b.x1 - b.x0)
    const bh = Math.max(1e-6, b.y1 - b.y0)
    const sc = Math.max(1, Math.min((W - 2 * padX) / bw, (Hs - padT - padB) / bh))
    return { sc, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 }
  }
  const fechado = corpoDe(d, 1)
  const ptsFechado = fechado.faces.flatMap((x) => x.pts)
  // Room for a falling layer above the box.
  if (camadasOn) ptsFechado.push([0, 0, d.h + 0.6], [d.c, d.l, d.h + 0.6])
  const e0 = encaixe(ptsFechado, cameraDe(d.tipo, 0))
  const abrir = abre(d.tipo) && !camadasOn && (s.abrir || aAlvo > 0 || f > 0.001)
  const e1 = abrir ? encaixe(corpoDe(d, 0).faces.flatMap((x) => x.pts), cameraDe(d.tipo, 1)) : e0
  // Half open, the solid can be wider than both: then it shrinks to fit, around its middle.
  const eC = abrir && f > 0.001 && f < 0.999 ? encaixe(corpoDe(d, 1 - f).faces.flatMap((x) => x.pts), cam) : f >= 0.999 ? e1 : e0
  const sc = Math.min(lerp(e0.sc, e1.sc, f), eC.sc)
  const cx = eC.cx
  const cy = eC.cy
  const ox = W / 2 - sc * cx
  const oy = padT + (Hs - padT - padB) / 2 - sc * cy
  const tela: Tela = (p) => {
    const q = projeta(p, cam)
    return [ox + q[0] * sc, oy + q[1] * sc, q[2]]
  }

  const destaques = destaquesDe(s)
  const corFace = (x: Face3) => (pintadas.includes(x.parte) ? amber : corDe(destaques[x.parte]))
  const corpo = camadasOn ? fechado : corpoDe(d, 1 - f)

  // What is written inside each face: its name and its area, at the middle of what is in view.
  const textos: React.ReactNode[] = []
  if (!camadasOn) {
    for (const parte of partesDe(d.tipo)) {
      const nome = s.nomes?.[parte]
      const area = areaTexto(s, d0, parte)
      if (!nome && !area) continue
      let [sx, sy, sa] = [0, 0, 0]
      let [bx0, bx1] = [Infinity, -Infinity]
      corpo.faces.forEach((x) => {
        if (x.parte !== parte || !deFrente(x.n, cam)) return
        const T = x.pts.map(tela)
        let a = 0
        for (let i = 0; i < T.length; i++) {
          const p = T[i]
          const q = T[(i + 1) % T.length]
          a += p[0] * q[1] - q[0] * p[1]
        }
        a = Math.abs(a) / 2
        T.forEach((p) => ([bx0, bx1] = [Math.min(bx0, p[0]), Math.max(bx1, p[0])]))
        const c = T.reduce((acc, p) => [acc[0] + p[0] / T.length, acc[1] + p[1] / T.length], [0, 0])
        sx += c[0] * a
        sy += c[1] * a
        sa += a
      })
      if (sa < 500) continue
      const op = clamp((sa - 500) / 700, 0, 1)
      // Text wider than the face (a small disk) goes beside it, on the right.
      const larg = Math.max(nome ? largura(nome, 14) : 0, area ? largura(area, 15) : 0)
      const fora = larg > bx1 - bx0 - 6
      const x = fora ? bx1 + 8 + larg / 2 : sx / sa
      const y = sy / sa
      // The disk with the radius drawn on it has its text a little lower.
      const temLinha = linhas.some((l) => l.k === 'raio' && l.face === parte)
      // On the net, the cylinder's side has the length of the turn near its bottom: the text goes up.
      const volta = parte === 'lateral' && f > 0.75 && rotulos.some((r) => r.ate)
      const y0 = y + (temLinha && !fora ? 14 : 0) - (volta ? 14 : 0)
      const dois = nome && area
      if (nome) textos.push(<Rotulo key={`n:${parte}`} x={x} y={dois ? y0 - 10 : y0} texto={nome} op={op} fs={14} cor="rgba(255,255,255,0.88)" />)
      if (area) textos.push(<Rotulo key={`a:${parte}`} x={x} y={dois ? y0 + 10 : y0} texto={area} op={op} fs={15} cor={pintadas.includes(parte) ? '#fff' : amber} />)
    }
  }

  // The lines drawn on a face (the radius, the triangle's height) go with the face.
  const sobre = (x: Face3, i: number) => {
    const ls = linhas.filter((l) => l.face === x.id && (l.quando === 'sempre' || f < 0.5))
    if (!ls.length) return null
    const m = corpo.mats[i]
    if (!m) return null
    return ls.map((l) => {
      const a = tela(aplica(m, noPlano(l.a as V2)))
      const b = tela(aplica(m, noPlano(l.b as V2)))
      const cor = l.cor === 'azul' ? sky : camadasOn ? '#fff' : amber
      return (
        <g key={l.k} pointerEvents="none">
          <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={cor} strokeWidth={2.5} strokeDasharray={l.tracejado ? '5 4' : undefined} strokeLinecap="round" />
          {l.k === 'raio' && <circle cx={a[0]} cy={a[1]} r={3} fill="#fff" />}
        </g>
      )
    })
  }

  // Layers of little cubes: the full ones, and the one falling into place.
  const camadasDesenho: React.ReactNode[] = []
  if (camadasOn) {
    const k = tw.k
    const cheias = Math.floor(k + 1e-6)
    const resto = k - cheias
    const cubinhos = d.tipo === 'caixa' || d.tipo === 'cubo'
    const bloco = (h: number, z0: number, key: string, op = 1) => {
      const dd = { ...d0, h }
      const { faces, mats, defs } = facesDe(dd, 1)
      const desl = (p: V3): V3 => [p[0], p[1], p[2] + z0]
      const grade = gradeDe(defs, !cubinhos)
      const fs = faces.map((x) => ({ ...x, pts: x.pts.map(desl) }))
      return desenhaFaces(fs, cam, tela, () => amber, {
        k: key,
        op,
        edge: 'rgba(0,0,0,0.55)',
        sw: 1.4,
        sobre: (_x, i) => {
          const ls = grade.filter((g) => g.face === i)
          if (!ls.length) return null
          let fino = ''
          let forte = ''
          ls.forEach((g) => {
            const a = tela(desl(aplica(mats[i], noPlano(g.a))))
            const b = tela(desl(aplica(mats[i], noPlano(g.b))))
            const seg = `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`
            if (g.forte) forte += seg
            else fino += seg
          })
          return (
            <g pointerEvents="none">
              {fino && <path d={fino} stroke="rgba(0,0,0,0.38)" strokeWidth={1} />}
              {forte && <path d={forte} stroke="rgba(0,0,0,0.6)" strokeWidth={1.5} />}
            </g>
          )
        },
      })
    }
    if (cheias > 0) camadasDesenho.push(...bloco(cheias, 0, 'bloco'))
    if (resto > 0.001) {
      const e = easeOut(resto)
      camadasDesenho.push(...bloco(1, cheias + (1 - e) * 0.6, `cai${cheias}`, clamp(e * 1.6, 0, 1)))
    }
  }

  // The measures: each one goes with its face; the ones of the closed solid fade out as it opens, the ones of the net fade in.
  const medidas: React.ReactNode[] = []
  for (const r of rotulos) {
    const op = r.quando === 'sempre' ? 1 : r.quando === 'fechado' ? clamp(1 - f / 0.25, 0, 1) : clamp((f - 0.75) / 0.25, 0, 1)
    if (op <= 0.01) continue
    const A = noMundo(r.a, corpo)
    if (!A) continue
    // On the amber cubes, the amber radius would not show.
    const cor = r.cor === 'azul' ? sky : r.cor === 'ambar' && !camadasOn ? amber : '#fff'
    if (r.ate) {
      const B = noMundo(r.ate, corpo)
      if (!B) continue
      const a = tela(A.p)
      const b = tela(B.p)
      const m: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      medidas.push(
        <g key={r.k} opacity={op} pointerEvents="none">
          <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={cor} strokeWidth={2} />
          <path d={seta(b[0], b[1], a[0], a[1]) + seta(a[0], a[1], b[0], b[1])} fill={cor} />
          <Rotulo x={m[0]} y={m[1] - 13} texto={r.texto} cor={cor} />
        </g>,
      )
      continue
    }
    const P = tela(A.p)
    const Q = tela([A.p[0] + A.dir[0] * 0.01, A.p[1] + A.dir[1] * 0.01, A.p[2] + A.dir[2] * 0.01])
    let ux = Q[0] - P[0]
    let uy = Q[1] - P[1]
    const L = Math.hypot(ux, uy)
    if (L < 1e-9) [ux, uy] = [0, 1]
    else [ux, uy] = [ux / L, uy / L]
    const off = 11 + Math.abs(ux) * (largura(r.texto, 14) / 2) + Math.abs(uy) * 8
    medidas.push(<Rotulo key={r.k} x={P[0] + ux * off} y={P[1] + uy * off} texto={r.texto} cor={cor} op={op} />)
  }
  // Lines through the inside (the height of the pyramid and the cone), dashed on top.
  const porDentro = linhas
    .filter((l) => l.face === undefined && f < 0.5)
    .map((l) => {
      const a = tela(l.a as V3)
      const b = tela(l.b as V3)
      return <path key={l.k} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={l.cor === 'azul' ? sky : amber} strokeWidth={2.2} strokeDasharray="5 4" strokeLinecap="round" pointerEvents="none" />
    })

  const fsBaixo = baixo ? clamp((W - 24) / (baixo.length * 0.56), 14, soma || contagem ? 24 : 20) : 20
  const [lado, total] = soma.split(' = ')
  return (
    <div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" role="img" aria-label={s.rotulo ?? 'Sólido'}>
      <svg width={W} height={Hs} viewBox={`0 0 ${W} ${Hs}`} className="block shrink-0 overflow-visible" onClick={onToque} style={{ cursor: onToque ? 'pointer' : undefined }}>
        {!camadasOn && desenhaFaces(corpo.faces, cam, tela, corFace, { k: 'f', onFace, sobre })}
        {camadasOn && camadasDesenho}
        {camadasOn && desenhaFaces(fechado.faces, cam, tela, () => undefined, { k: 'cx', contorno: true, sobre, tracejado: kAlvo < Math.ceil(d0.h - 1e-9) || tw.k < d0.h - 0.01, edge: 'rgba(229,231,235,0.75)', sw: 1.6 })}
        {s.ocultas && f < 0.3 && !camadasOn && (
          <g opacity={1 - f / 0.3} pointerEvents="none">
            {corpo.faces
              .filter((x) => !deFrente(x.n, cam))
              .map((x) => {
                const T = x.pts.map(tela)
                let dd = ''
                T.forEach((p, j) => {
                  if (x.suaves?.[j]) return
                  const q = T[(j + 1) % T.length]
                  dd += `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`
                })
                return <path key={x.id} d={dd} stroke="rgba(229,231,235,0.5)" strokeWidth={1.4} strokeDasharray="4 5" fill="none" />
              })}
          </g>
        )}
        {porDentro}
        {textos}
        {medidas}
      </svg>
      {soma ? (
        <p className="whitespace-nowrap px-3 text-center font-semibold tabular-nums text-white" style={{ fontSize: fsBaixo }}>
          {lado}
          {total && <span style={{ color: amber }}> = {total}</span>}
        </p>
      ) : s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center font-semibold leading-tight text-white" style={{ fontSize: fsBaixo }}>
          {s.rotulo}
        </motion.p>
      ) : contagem ? (
        <p className="whitespace-nowrap px-3 text-center font-semibold tabular-nums text-white" style={{ fontSize: fsBaixo }}>
          {contagem.split(' = ')[0]}
          {contagem.includes(' = ') && <span style={{ color: amber }}> = {contagem.split(' = ')[1]}</span>}
        </p>
      ) : textH ? (
        <p className="text-[24px]">&nbsp;</p>
      ) : null}
    </div>
  )
}

export function Solido({ s, size, onToque, onFace }: { s: SolidoState; size: { w: number; h: number } } & SolidoInteract) {
  // Another solid fades in; the same one moves (opens, grows, fills).
  const tipo = tipoDe(s)
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div key={tipo} className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        <SolidoCena s={s} size={size} onToque={onToque} onFace={onFace} />
      </motion.div>
    </AnimatePresence>
  )
}
