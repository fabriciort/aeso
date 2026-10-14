'use client'

import { useEffect, useState } from 'react'

// O motor de cena dos visuais desenhados (figura, plano, gráfico): o palco é
// uma lista de primitivas com chave, em unidades de tela. Quando o alvo muda,
// cada primitiva com a mesma chave vai de onde está até o novo lugar; as
// novas aparecem aos poucos (ou percorrem a sua `rota`) e as que saíram somem.
// Um laço próprio (requestAnimationFrame), não molas do framer: o layout pode
// mudar no meio sem travar nada.

export const amber = '#f6b74e'
export const sky = '#7dd3fc'
export const rose = '#fb7185'
export const gray = '#e5e7eb'
export const green = '#6fd3a8'
export const DUR = 520

export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
export const largura = (t: string, fs: number) => t.length * fs * 0.56
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// ---------------------------------------------------------------- the scene: keyed primitives in screen units

export interface Prim {
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
  /** A new primitive travels these values (same shape as `v`) and ends at `v`, instead of fading in: a point that walks first along x, then along y. Hidden until its `atraso`. */
  rota?: number[][]
  /** `atraso` and `dur` are for its entrance only: once on stage, it moves with the rest (a new point that flew out of the machine follows the layout like any other). Implied by `rota`. */
  entrada?: boolean
}

export interface Quadro {
  p: Prim
  v: number[]
  op: number
}

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Angles turn the short way: a wedge by whole turns, a square cell by quarter turns. */
function alinha(a: number[], b: number[], t: Prim['t']): number[] {
  if (t === 'wedge') {
    const k = Math.round((a[3] - b[3]) / 360) * 360
    return [b[0], b[1], b[2], b[3] + k, b[4] + k]
  }
  if (t === 'cell') return [b[0], b[1], b[2], b[3] + Math.round((a[3] - b[3]) / 90) * 90]
  return b
}

export function quadros(de: Map<string, Quadro>, para: Prim[], t: number): Quadro[] {
  const out: Quadro[] = []
  const vistos = new Set<string>()
  for (const b of para) {
    vistos.add(b.k)
    const a = de.get(b.k)
    const opB = b.op ?? 1
    const so = a && (b.entrada || b.rota)
    const raw = clamp((t - (so ? 0 : (b.atraso ?? 0))) / (so ? DUR : (b.dur ?? DUR)), 0, 1)
    const p = (b.t === 'roll' || (b.rota && !a) ? easeIO : easeOut)(raw)
    if (a && a.p.t === b.t && a.v.length === b.v.length) {
      const bv = alinha(a.v, b.v, b.t)
      out.push({ p: b, v: a.v.map((x, i) => x + (bv[i] - x) * p), op: a.op + (opB - a.op) * p })
    } else {
      if (a && p < 1) out.push({ p: { ...a.p, k: `${a.p.k}~` }, v: a.v, op: a.op * (1 - p) })
      const rota = !a && b.rota?.length ? [...b.rota, b.v].filter((w) => w.length === b.v.length) : undefined
      if (rota && rota.length > 1) {
        // Each leg takes the same time.
        const f = p * (rota.length - 1)
        const i = Math.min(rota.length - 2, Math.floor(f))
        const u = f - i
        out.push({ p: b, v: rota[i].map((x, j) => x + (rota[i + 1][j] - x) * u), op: raw > 0 ? opB : 0 })
      } else out.push({ p: b, v: b.v, op: opB * p })
    }
  }
  const fim = easeOut(clamp(t / 300, 0, 1))
  // A fading copy ("k~") may already be out, from a change that came mid-transition: one key, one shape.
  const saindo = new Set(out.map((q) => q.p.k))
  for (const [k, a] of de) if (!vistos.has(k) && !saindo.has(a.p.k) && fim < 1) out.push({ ...a, op: a.op * (1 - fim) })
  return out
}

export const reduzido = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** The scene shown now: when the target changes, every primitive tweens from where it is to the new place. */
export function useCena(prims: Prim[]): Quadro[] {
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

export const ponto = (cx: number, cy: number, r: number, a: number): [number, number] => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]

export function arcoD(cx: number, cy: number, r: number, a0: number, a1: number, fechado: boolean): string {
  const span = a1 - a0
  if (span >= 359.9) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy}${fechado ? 'Z' : ''}`
  if (span <= 0.01) return ''
  const [x0, y0] = ponto(cx, cy, r, a0)
  const [x1, y1] = ponto(cx, cy, r, a1)
  const arc = `A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}`
  return fechado ? `M${cx} ${cy} L${x0} ${y0} ${arc} Z` : `M${x0} ${y0} ${arc}`
}

export function seta(x1: number, y1: number, x2: number, y2: number, cor: string, k: string) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / L
  const uy = (y2 - y1) / L
  const s = 10
  return <path key={k} d={`M${x2 + ux * 2} ${y2 + uy * 2} L${x2 - ux * s - uy * 5.5} ${y2 - uy * s + ux * 5.5} L${x2 - ux * s + uy * 5.5} ${y2 - uy * s - ux * 5.5} Z`} fill={cor} />
}

export function Desenho({ q }: { q: Quadro }) {
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
