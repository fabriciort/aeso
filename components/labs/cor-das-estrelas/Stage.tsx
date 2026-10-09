'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { blackbodyRgb, glowVisibility, planckNormalized, wavelengthRgb, wienPeakNm } from '@/lib/astro/blackbody'
import { formatNumber } from '@/lib/format'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import DragSurface from '@/components/instruments/DragSurface'
import { Panel, type StageProps } from '../runtime'
import { CHALLENGES, clampT, colorName, ORION, ORION_LINES, orionXY, STAR_A_T, STAR_B_T, SUN_POINTS, type ColorLive } from './data'

// The continuous Palco of "Por que as estrelas têm cores".
//
// Everything on it is one scene graph that never cuts: the metal sphere
// heats up, becomes star A, shrinks into the corner as the spectrum grows,
// flies into Betelgeuse's place in Orion, turns into the Sun's model, and
// finally lines up with the other stars on a temperature ruler. Each frame
// eases the displayed graph toward the target of the current Etapa/Cena.

interface Body {
  x: number
  y: number
  r: number
  T: number
  a: number
  /** 1 = the metal sphere look (dark until it glows), 0 = a star. */
  metal: number
}
interface Graph {
  bodies: Record<string, Body>
  chart: { x0: number; y0: number; x1: number; y1: number; a: number; lmax: number }
  curves: Record<string, { T: number; a: number }>
  primary: string | null
  peaks: number
  data: number
  lines: number
  person: number
  thermal: number
  ruler: number
}

const BODY_IDS = ['main', 'B', ...ORION.map((s) => s.id)]
const CHART_FULL = { x0: 0.06, y0: 0.24, x1: 0.95, y1: 0.9 }
const CHART_LOW = { x0: 0.06, y0: 0.6, x1: 0.95, y1: 0.93 }
const RULER_Y = 0.78
const rulerX = (T: number) => 0.1 + (0.8 * Math.log(T / 2400)) / Math.log(40000 / 2400)

function orionLayout(box: { x0: number; y0: number; x1: number; y1: number }, w: number, h: number) {
  const bw = (box.x1 - box.x0) * w
  const bh = (box.y1 - box.y0) * h
  const s = Math.min(bw / 12, bh / 22)
  const cx = ((box.x0 + box.x1) / 2) * w
  const cy = ((box.y0 + box.y1) / 2) * h
  const out: Record<string, { x: number; y: number; r: number }> = {}
  for (const st of ORION) {
    const [x, y] = orionXY(st)
    out[st.id] = { x: (cx + x * s) / w, y: (cy + y * s) / h, r: 0.011 + (0.014 * (2.4 - st.mag)) / 2.3 }
  }
  return out
}

interface Inputs {
  stepId: string
  scene: number
  T: number
  modelT: number
  picked: string[]
  answered: boolean
}

function target(p: Inputs, w: number, h: number): Graph {
  const hidden = (x = 0.5, y = 0.5, r = 0.05, T = 5000): Body => ({ x, y, r, T, a: 0, metal: 0 })
  const orionFull = orionLayout({ x0: 0.08, y0: 0.05, x1: 0.92, y1: 0.95 }, w, h)
  const orionTop = orionLayout({ x0: 0.1, y0: 0.03, x1: 0.9, y1: 0.56 }, w, h)
  const g: Graph = {
    bodies: {},
    chart: { ...CHART_FULL, a: 0, lmax: 2500 },
    curves: {},
    primary: null,
    peaks: 0,
    data: 0,
    lines: 0,
    person: 0,
    thermal: 0,
    ruler: 0,
  }
  for (const id of BODY_IDS) g.bodies[id] = hidden()
  for (const st of ORION) g.bodies[st.id] = { ...orionFull[st.id], T: st.T, a: 0, metal: 0 }
  g.bodies.B = hidden(0.7, 0.46, 0.17, STAR_B_T)

  const showOrion = (layout: Record<string, { x: number; y: number; r: number }>) => {
    for (const st of ORION) g.bodies[st.id] = { ...layout[st.id], T: st.T, a: 1, metal: 0 }
    g.lines = 1
  }

  switch (p.stepId) {
    case 'imagine':
      g.bodies.main = { x: 0.5, y: 0.47, r: 0.27, T: p.T, a: 1, metal: 1 }
      break
    case 'preveja':
      g.bodies.main = { x: 0.29, y: 0.45, r: 0.16, T: STAR_A_T, a: 1, metal: 0 }
      g.bodies.B = { x: 0.71, y: 0.45, r: 0.16, T: STAR_B_T, a: 1, metal: 0 }
      break
    case 'entenda':
      g.bodies.main = { x: 0.14, y: 0.12, r: 0.075, T: p.T, a: 1, metal: 1 }
      g.chart = { ...CHART_FULL, a: 1, lmax: 2500 }
      g.curves.main = { T: p.T, a: 1 }
      g.primary = 'main'
      g.peaks = p.scene >= 1 ? 1 : 0
      break
    case 'observe': {
      const layout = p.scene === 0 ? orionFull : orionTop
      showOrion(layout)
      const b = layout.betelgeuse
      g.bodies.main = { x: b.x, y: b.y, r: b.r, T: 3600, a: 0, metal: 0 }
      if (p.scene >= 1) {
        g.chart = { ...CHART_LOW, a: 1, lmax: 2500 }
        for (const id of p.picked) {
          const st = ORION.find((s) => s.id === id)
          if (st) g.curves[id] = { T: st.T, a: 1 }
        }
        g.primary = p.picked[p.picked.length - 1] ?? null
        g.peaks = 1
      }
      break
    }
    case 'meca':
      g.bodies.main = { x: 0.13, y: 0.11, r: 0.065, T: p.modelT, a: 1, metal: 0 }
      g.chart = { ...CHART_FULL, a: 1, lmax: 2500 }
      g.curves.model = { T: p.modelT, a: 1 }
      g.primary = 'model'
      g.data = 1
      g.peaks = p.scene >= 1 ? 1 : 0.35
      break
    case 'e-se': {
      const c = CHALLENGES[Math.min(p.scene, CHALLENGES.length - 1)]
      if (c.id === 'voce') {
        g.person = 1
        g.thermal = p.answered ? 1 : 0
        g.chart = { ...CHART_LOW, a: p.answered ? 1 : 0, lmax: 20000 }
        g.curves.you = { T: 310, a: 1 }
        g.primary = 'you'
        g.peaks = 1
      } else {
        g.bodies.main = { x: 0.5, y: 0.29, r: 0.13, T: c.T, a: 1, metal: 0 }
        g.chart = { ...CHART_LOW, a: 1, lmax: 2500 }
        g.curves.main = { T: c.T, a: 1 }
        g.primary = 'main'
        g.peaks = 1
      }
      break
    }
    case 'conclua': {
      g.ruler = 1
      // Three stars in a row, each linked to its place on the ruler below.
      const row = (id: string, x: number, T: number, r: number) => (g.bodies[id] = { x, y: 0.3, r, T, a: 1, metal: 0 })
      row('betelgeuse', 0.2, 3600, 0.09)
      row('main', 0.5, p.modelT, 0.07)
      row('rigel', 0.8, 12100, 0.075)
      break
    }
  }
  return g
}

const COPY_KEYS = ['x', 'y', 'r', 'a', 'metal'] as const

function ease(cur: Graph, tgt: Graph, k: number) {
  const L = (a: number, b: number) => a + (b - a) * k
  const LT = (a: number, b: number) => Math.exp(L(Math.log(a), Math.log(b)))
  for (const id of BODY_IDS) {
    const c = cur.bodies[id]
    const t = tgt.bodies[id]
    for (const key of COPY_KEYS) c[key] = L(c[key], t[key])
    c.T = LT(c.T, t.T)
  }
  for (const key of ['x0', 'y0', 'x1', 'y1', 'a'] as const) cur.chart[key] = L(cur.chart[key], tgt.chart[key])
  cur.chart.lmax = LT(cur.chart.lmax, tgt.chart.lmax)
  for (const id of new Set([...Object.keys(cur.curves), ...Object.keys(tgt.curves)])) {
    const t = tgt.curves[id]
    const c = cur.curves[id]
    if (!c) cur.curves[id] = { T: t.T, a: 0 }
    else {
      c.a = L(c.a, t ? t.a : 0)
      if (t) c.T = LT(c.T, t.T)
      if (!t && c.a < 0.01) delete cur.curves[id]
    }
  }
  cur.primary = tgt.primary
  for (const key of ['peaks', 'data', 'lines', 'person', 'thermal', 'ruler'] as const) cur[key] = L(cur[key], tgt[key])
}

const clone = (g: Graph): Graph => JSON.parse(JSON.stringify(g))

/** Slightly more saturated than physical, so colors read on dark screens. */
function vivid(T: number): [number, number, number] {
  const [r, g, b] = blackbodyRgb(T)
  const m = (r + g + b) / 3
  const s = 1.35
  return [r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, m + (c - m) * s)))) as [number, number, number]
}
const rgba = ([r, g, b]: [number, number, number], a: number) => `rgba(${r},${g},${b},${a})`

export default function ColorStage({ stepId, scene, answers, setAnswer, live, setLive }: StageProps) {
  const L = live as Partial<ColorLive>
  const T = L.T ?? 300
  const modelT = L.modelT ?? 3500
  const picked = useMemo(() => (Array.isArray(answers.picked) ? (answers.picked as string[]) : []), [answers.picked])
  const challenge = CHALLENGES[Math.min(scene, CHALLENGES.length - 1)]
  const answered = stepId === 'e-se' && (answers.challenges as Record<string, number | undefined> | undefined)?.[challenge.id] !== undefined
  const inputs: Inputs = { stepId, scene, T, modelT, picked, answered }

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const tgt = useMemo(() => target(inputs, size.w || 1, size.h || 1), [JSON.stringify(inputs), size.w, size.h]) // eslint-disable-line react-hooks/exhaustive-deps
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Graph | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!disp.current) disp.current = clone(tgtRef.current)
    let raf = 0
    let last = performance.now()
    const W = size.w
    const H = size.h
    const M = Math.min(W, H)

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = disp.current!
      ease(g, tgtRef.current, reduced ? 1 : 1 - Math.exp(-dt * 5.5))
      const t = now / 1000
      ctx.clearRect(0, 0, W, H)

      // Thermal-camera background (E se…? "você brilha").
      if (g.thermal > 0.01) {
        const bg = ctx.createLinearGradient(0, 0, 0, H)
        bg.addColorStop(0, `rgba(30,10,60,${0.7 * g.thermal})`)
        bg.addColorStop(1, `rgba(12,6,30,${0.7 * g.thermal})`)
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, W, H)
      }

      // Constellation lines.
      if (g.lines > 0.01) {
        ctx.lineWidth = 1
        for (const [a, b] of ORION_LINES) {
          const A = g.bodies[a]
          const B = g.bodies[b]
          const al = g.lines * Math.min(A.a, B.a) * 0.18
          if (al < 0.005) continue
          ctx.strokeStyle = `rgba(170,190,255,${al})`
          ctx.beginPath()
          ctx.moveTo(A.x * W, A.y * H)
          ctx.lineTo(B.x * W, B.y * H)
          ctx.stroke()
        }
      }

      // Temperature ruler (Conclua).
      if (g.ruler > 0.01) {
        drawRuler(ctx, W, H, g.ruler)
        for (const id of ['betelgeuse', 'main', 'rigel']) {
          const b = g.bodies[id]
          const tx = rulerX(b.T) * W
          const ty = RULER_Y * H
          ctx.strokeStyle = `rgba(255,255,255,${0.22 * g.ruler * b.a})`
          ctx.setLineDash([2, 4])
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(b.x * W, b.y * H + b.r * M * 1.5 + 34)
          ctx.lineTo(tx, ty - 6)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = rgba(vivid(b.T), g.ruler * b.a)
          ctx.beginPath()
          ctx.arc(tx, ty, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Glowing bodies.
      BODY_IDS.forEach((id, i) => {
        const b = g.bodies[id]
        if (b.a < 0.01) return
        const twinkle = ORION.some((s) => s.id === id) ? 0.9 + 0.1 * Math.sin(t * 2.3 + i * 1.7) : 1
        const shimmer = b.metal > 0.5 ? 1 + 0.006 * Math.sin(t * 3.1) : 1
        drawBody(ctx, b.x * W, b.y * H, b.r * M * shimmer, b.T, b.a * twinkle, b.metal)
        if (picked.includes(id) && stepId === 'observe') {
          ctx.strokeStyle = `rgba(255,255,255,${0.55 * b.a})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(b.x * W, b.y * H, b.r * M * 2.4 + 2 * Math.sin(t * 3), 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      if (g.person > 0.01) drawPerson(ctx, W, H, g.person, g.thermal, t)
      if (g.chart.a > 0.01) drawChart(ctx, W, H, g, t)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size, picked, stepId])

  // ---------------------------------------------------------------- input

  const drag =
    stepId === 'imagine' && scene >= 1
      ? { hint: 'Arraste para cima para aquecer', apply: (dy: number) => setLive({ T: clampT(T * Math.exp(-dy * 0.0075)) }) }
      : stepId === 'entenda' && scene >= 1
        ? { hint: 'Arraste para esquentar ou esfriar', apply: (dy: number) => setLive({ T: clampT(T * Math.exp(-dy * 0.006), 1500) }) }
        : stepId === 'meca' && scene === 0
          ? { hint: 'Arraste para mudar a temperatura', apply: (dy: number) => setLive({ modelT: clampT(modelT * Math.exp(-dy * 0.004), 2500, 10000) }) }
          : null

  const tapStars = stepId === 'observe' && scene >= 1
  const onTap = (e: React.PointerEvent) => {
    if (!tapStars || !disp.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    let best: string | null = null
    let bestD = 44
    for (const st of ORION) {
      const b = disp.current.bodies[st.id]
      const d = Math.hypot(b.x * size.w - px, b.y * size.h - py)
      if (d < bestD) {
        bestD = d
        best = st.id
      }
    }
    if (best && !picked.includes(best)) {
      haptic(12)
      setAnswer('picked', [...picked, best])
    } else if (best) haptic(4)
  }

  // ---------------------------------------------------------------- labels

  const px = (b: Body) => ({ left: b.x * size.w, top: b.y * size.h, rad: b.r * Math.min(size.w, size.h) })
  const labels: { key: string; x: number; y: number; text: React.ReactNode; tone?: 'muted' | 'accent'; side?: 'right' | 'left' }[] = []
  if (size.w) {
    if (stepId === 'preveja') {
      for (const [id, name, temp] of [
        ['main', 'A', STAR_A_T],
        ['B', 'B', STAR_B_T],
      ] as const) {
        const p = px(tgt.bodies[id])
        labels.push({ key: id, x: p.left, y: p.top + p.rad * 1.9 + 14, text: scene >= 1 ? `${name} · ≈ ${formatNumber(temp - 273, 0)} °C` : `Estrela ${name}` })
      }
    }
    if (stepId === 'observe') {
      for (const st of ORION) {
        const show = st.id === 'betelgeuse' || st.id === 'rigel' || picked.includes(st.id)
        if (!show) continue
        const p = px(tgt.bodies[st.id])
        const isPicked = picked.includes(st.id)
        const right = p.left < size.w / 2
        labels.push({
          key: st.id,
          x: right ? p.left + p.rad * 2 + 8 : p.left - p.rad * 2 - 8,
          y: p.top - 12,
          side: right ? 'right' : 'left',
          text: isPicked ? `${st.name} · ≈ ${formatNumber(st.T, 0)} K` : st.name,
          tone: isPicked ? 'accent' : 'muted',
        })
      }
    }
    if (stepId === 'conclua') {
      for (const [id, name, temp] of [
        ['betelgeuse', 'Betelgeuse', 3600],
        ['main', 'Sol · você', modelT],
        ['rigel', 'Rigel', 12100],
      ] as const) {
        const p = px(tgt.bodies[id])
        labels.push({
          key: id,
          x: p.left,
          y: p.top + p.rad * 1.5 + 8,
          text: (
            <span className="block text-center leading-tight">
              {name}
              <span className="block font-mono text-[11px] opacity-70">{formatNumber(temp, 0)} K</span>
            </span>
          ),
          tone: id === 'main' ? 'accent' : 'muted',
        })
      }
    }
  }

  const readout =
    stepId === 'imagine' || (stepId === 'entenda' && scene < 2)
      ? { big: `${formatNumber(T, 0)} K`, small: `${formatNumber(T - 273.15, 0)} °C · ${colorName(T)}` }
      : stepId === 'meca'
        ? { big: `${formatNumber(modelT, 0)} K`, small: 'temperatura do modelo' }
        : null
  const readoutAt = stepId === 'imagine' ? 'left-3 top-3' : 'left-[24%] top-[7%] lg:left-[22%]'

  const aria =
    stepId === 'imagine'
      ? `Esfera a ${formatNumber(T, 0)} kelvin, cor ${colorName(T)}`
      : stepId === 'observe'
        ? 'A constelação de Órion, com Betelgeuse alaranjada e Rigel azulada'
        : stepId === 'meca'
          ? `Espectro do Sol e curva do modelo a ${formatNumber(modelT, 0)} kelvin`
          : 'Palco do laboratório de cores das estrelas'

  return (
    <Panel>
      <div ref={wrapRef} className={cn('absolute inset-0', tapStars && 'cursor-pointer')} onPointerDown={onTap}>
        <canvas ref={canvasRef} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>
      {drag && <DragSurface key={stepId} hint={drag.hint} onDrag={drag.apply} />}

      <AnimatePresence>
        {readout && (
          <motion.div
            key="readout"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn('pointer-events-none absolute z-10 rounded-2xl bg-black/45 px-3 py-2 backdrop-blur-xl', readoutAt)}
          >
            <p className="font-mono text-[17px] leading-none text-white tabular-nums">{readout.big}</p>
            <p className="mt-1 text-[11.5px] leading-none text-white/55">{readout.small}</p>
          </motion.div>
        )}
        {stepId === 'entenda' && scene >= 2 && (
          <motion.div
            key="wien"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-3 top-3 z-10 rounded-2xl bg-black/50 px-3 py-2 text-right font-mono text-[12.5px] text-white/85 backdrop-blur-xl"
          >
            λ<sub>pico</sub> = 2.898.000 ÷ {formatNumber(T, 0)}
            <span className="block text-[15px] text-amber-200">= {formatNumber(wienPeakNm(T), 0)} nm</span>
          </motion.div>
        )}
        {stepId === 'meca' && (
          <motion.div
            key="sun"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-3 top-3 z-10 max-w-[48%] rounded-2xl bg-amber-400/15 px-3 py-1.5 text-right text-[11px] leading-snug text-amber-100/90 backdrop-blur-xl"
          >
            Luz do Sol · pontos simulados a partir do espectro real
          </motion.div>
        )}
        {stepId === 'e-se' && challenge.id === 'voce' && (
          <motion.div
            key={answered ? 'ir' : 'vis'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('pointer-events-none absolute left-3 top-3 z-10 rounded-full px-3 py-1.5 text-[12px] backdrop-blur-xl', answered ? 'bg-fuchsia-500/20 text-fuchsia-100' : 'bg-black/50 text-white/70')}
          >
            {answered ? 'Câmera térmica (infravermelho)' : 'Luz visível'}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {labels.map((l) => (
          <motion.div
            key={`${stepId}-${l.key}`}
            initial={{ opacity: 0, y: 4, x: l.side === 'right' ? '0%' : l.side === 'left' ? '-100%' : '-50%' }}
            animate={{ opacity: 1, y: 0, x: l.side === 'right' ? '0%' : l.side === 'left' ? '-100%' : '-50%', left: l.x, top: l.y }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className={cn(
              'pointer-events-none absolute z-10 whitespace-nowrap rounded-[14px] px-2.5 py-1 text-[11.5px] backdrop-blur-xl',
              l.tone === 'accent' ? 'bg-white/15 text-white' : 'bg-black/45 text-white/70',
            )}
            style={{ left: l.x, top: l.y }}
          >
            {l.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </Panel>
  )
}

// ------------------------------------------------------------------ drawing

function drawBody(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, T: number, a: number, metal: number) {
  const vis = metal > 0 ? metal * glowVisibility(T) + (1 - metal) : 1
  const col = vivid(T)
  // Dark metal (visible only while the sphere is not glowing much).
  if (metal > 0.01) {
    const m = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.05, x, y, R)
    m.addColorStop(0, `rgba(92,98,112,${a * metal})`)
    m.addColorStop(0.55, `rgba(38,41,50,${a * metal})`)
    m.addColorStop(1, `rgba(12,13,17,${a * metal})`)
    ctx.fillStyle = m
    ctx.beginPath()
    ctx.arc(x, y, R, 0, Math.PI * 2)
    ctx.fill()
  }
  if (vis < 0.005) return
  // Halo.
  const halo = ctx.createRadialGradient(x, y, R * 0.6, x, y, R * 3.2)
  halo.addColorStop(0, rgba(col, 0.42 * vis * a))
  halo.addColorStop(0.35, rgba(col, 0.12 * vis * a))
  halo.addColorStop(1, rgba(col, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, R * 3.2, 0, Math.PI * 2)
  ctx.fill()
  // Core: hotter center, slightly darker edge (limb darkening).
  const white: [number, number, number] = [255, 255, 255]
  const center = col.map((c, i) => Math.round(c + (white[i] - c) * 0.55 * vis)) as [number, number, number]
  const edge = col.map((c) => Math.round(c * 0.72)) as [number, number, number]
  const core = ctx.createRadialGradient(x - R * 0.12, y - R * 0.12, R * 0.05, x, y, R)
  core.addColorStop(0, rgba(center, vis * a))
  core.addColorStop(0.7, rgba(col, vis * a))
  core.addColorStop(1, rgba(edge, vis * a))
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(x, y, R, 0, Math.PI * 2)
  ctx.fill()
}

function drawChart(ctx: CanvasRenderingContext2D, W: number, H: number, g: Graph, t: number) {
  const c = g.chart
  const A = c.a
  const X0 = c.x0 * W + 6
  const X1 = c.x1 * W - 6
  const Y0 = c.y0 * H
  const Y1 = c.y1 * H - 22
  const lmax = c.lmax
  const X = (l: number) => X0 + (l / lmax) * (X1 - X0)
  const Y = (f: number) => Y1 - f * (Y1 - Y0) * 0.86

  // Visible band.
  const v0 = X(380)
  const v1 = X(750)
  ctx.fillStyle = `rgba(255,255,255,${0.035 * A})`
  ctx.fillRect(v0, Y0, v1 - v0, Y1 - Y0)

  // Axis + rainbow strip.
  ctx.strokeStyle = `rgba(255,255,255,${0.22 * A})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(X0, Y1)
  ctx.lineTo(X1, Y1)
  ctx.stroke()
  const strip = ctx.createLinearGradient(v0, 0, v1, 0)
  for (let l = 380; l <= 750; l += 10) strip.addColorStop((l - 380) / 370, rgba(wavelengthRgb(l), A))
  ctx.fillStyle = strip
  ctx.fillRect(v0, Y1 + 2, Math.max(1, v1 - v0), 4)

  // Ticks.
  const step = lmax > 6000 ? 5000 : 500
  ctx.fillStyle = `rgba(255,255,255,${0.4 * A})`
  ctx.font = '10.5px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textAlign = 'center'
  for (let l = step; l < lmax * 0.98; l += step) {
    const x = X(l)
    if (x > X1 - 30) break
    ctx.fillText(formatNumber(l, 0), x, Y1 + 18)
  }
  ctx.textAlign = 'right'
  ctx.fillText('nm', X1, Y1 + 18)
  ctx.textAlign = 'left'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillStyle = `rgba(255,255,255,${0.38 * A})`
  if (X(380) - X0 > 26) ctx.fillText('UV', X0 + 2, Y1 - 6)
  ctx.textAlign = 'right'
  ctx.fillText('infravermelho →', X1, Y1 - 6)
  ctx.textAlign = 'left'

  // Curves.
  const N = 200
  const lmin = lmax * 0.006
  const path = (T: number) => {
    const p = new Path2D()
    for (let i = 0; i <= N; i++) {
      const l = lmin + ((lmax - lmin) * i) / N
      const f = planckNormalized(l, T)
      if (i === 0) p.moveTo(X(l), Y(f))
      else p.lineTo(X(l), Y(f))
    }
    return p
  }
  const many = Object.keys(g.curves).length > 1
  let peakRow = 0
  for (const [id, cv] of Object.entries(g.curves)) {
    const al = cv.a * A
    if (al < 0.01) continue
    const p = path(cv.T)
    if (id === g.primary) {
      // Fill under the curve with the colors of the light.
      const fill = new Path2D(p)
      fill.lineTo(X(lmax), Y1)
      fill.lineTo(X(lmin), Y1)
      fill.closePath()
      const grad = ctx.createLinearGradient(X0, 0, X1, 0)
      const stops = [0, 370, 380, 420, 460, 500, 540, 580, 620, 660, 700, 750, 760, lmax]
      for (const l of stops) {
        const f = Math.min(1, Math.max(0, l / lmax))
        const vis = l >= 380 && l <= 750
        grad.addColorStop(f, vis ? rgba(wavelengthRgb(l), 0.42 * al) : `rgba(150,150,170,${0.1 * al})`)
      }
      ctx.fillStyle = grad
      ctx.fill(fill)
    }
    ctx.strokeStyle = rgba(vivid(cv.T), al)
    ctx.lineWidth = id === g.primary ? 2.6 : 1.8
    ctx.stroke(p)

    if (g.peaks > 0.01 && (id === g.primary || Object.keys(g.curves).length <= 3)) {
      const lp = wienPeakNm(cv.T)
      const pa = g.peaks * al * (id === g.primary ? 1 : 0.6)
      if (lp < lmax * 0.97) {
        const x = X(lp)
        ctx.setLineDash([3, 4])
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * pa})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, Y(1) - 6)
        ctx.lineTo(x, Y1)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = `rgba(255,255,255,${0.9 * pa})`
        ctx.font = '11.5px ui-monospace, SFMono-Regular, Menlo, monospace'
        if (many) {
          // Several curves: labels beside their peak lines, one row each.
          ctx.textAlign = x > X1 - 90 ? 'right' : 'left'
          ctx.fillText(`pico ${formatNumber(lp, 0)} nm`, x + (x > X1 - 90 ? -6 : 6), Y(1) + 4 + peakRow++ * 15)
        } else {
          ctx.textAlign = x > X1 - 60 ? 'right' : x < X0 + 60 ? 'left' : 'center'
          ctx.fillText(`pico ${formatNumber(lp, 0)} nm`, x, Y(1) - 12)
        }
      } else {
        ctx.fillStyle = `rgba(255,255,255,${0.7 * pa})`
        ctx.font = '11.5px system-ui, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`pico em ${formatNumber(lp, 0)} nm →`, X1, Y0 + 28)
      }
    }
  }

  // The Sun's points (Meça).
  if (g.data > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${0.85 * g.data * A})`
    for (const p of SUN_POINTS) {
      if (p.l > lmax) continue
      ctx.beginPath()
      ctx.arc(X(p.l), Y(p.f), 2.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  void t
}

function drawPerson(ctx: CanvasRenderingContext2D, W: number, H: number, a: number, thermal: number, t: number) {
  const hh = H * 0.46
  const cx = W / 2
  const top = H * 0.08
  const shape = new Path2D()
  shape.arc(cx, top + hh * 0.14, hh * 0.115, 0, Math.PI * 2)
  const sw = hh * 0.27
  const sy = top + hh * 0.3
  shape.moveTo(cx - sw, top + hh)
  shape.bezierCurveTo(cx - sw * 1.02, sy + hh * 0.18, cx - sw * 0.95, sy, cx - sw * 0.45, sy)
  shape.lineTo(cx + sw * 0.45, sy)
  shape.bezierCurveTo(cx + sw * 0.95, sy, cx + sw * 1.02, sy + hh * 0.18, cx + sw, top + hh)
  shape.closePath()
  // Visible light: a dark figure.
  ctx.fillStyle = `rgba(28,31,40,${a * (1 - thermal)})`
  ctx.strokeStyle = `rgba(255,255,255,${0.14 * a * (1 - thermal)})`
  ctx.lineWidth = 1
  ctx.fill(shape)
  ctx.stroke(shape)
  if (thermal < 0.01) return
  // Infrared: false colors, warmest at the core.
  const pulse = 1 + 0.02 * Math.sin(t * 2)
  const grd = ctx.createRadialGradient(cx, top + hh * 0.45, hh * 0.02, cx, top + hh * 0.5, hh * 0.62 * pulse)
  grd.addColorStop(0, `rgba(255,248,190,${a * thermal})`)
  grd.addColorStop(0.3, `rgba(255,176,48,${a * thermal})`)
  grd.addColorStop(0.62, `rgba(226,81,42,${a * thermal})`)
  grd.addColorStop(1, `rgba(122,29,110,${a * thermal})`)
  ctx.save()
  ctx.shadowColor = `rgba(255,120,60,${0.6 * thermal})`
  ctx.shadowBlur = 30
  ctx.fillStyle = grd
  ctx.fill(shape)
  ctx.restore()
}

function drawRuler(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  const y = RULER_Y * H
  const x0 = rulerX(2400) * W
  const x1 = rulerX(40000) * W
  const grad = ctx.createLinearGradient(x0, 0, x1, 0)
  for (let i = 0; i <= 12; i++) {
    const T = 2400 * (40000 / 2400) ** (i / 12)
    grad.addColorStop(i / 12, rgba(vivid(T), a))
  }
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(x0, y - 3, x1 - x0, 6, 3)
  ctx.fill()
  ctx.fillStyle = `rgba(255,255,255,${0.4 * a})`
  ctx.font = '10.5px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textAlign = 'center'
  ctx.fillText('mais fria', x0 + 26, y - 12)
  ctx.fillText('mais quente', x1 - 32, y - 12)
}

