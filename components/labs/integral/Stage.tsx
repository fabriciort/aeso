'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BOLT_PEAK, BOLT_SEGMENTS, BOLT_TIME, boltDistance, riemann, samplePoint, type Method } from '@/lib/math/integral'
import { easeFactor, fmt, toPx, type Frame, type Viewport } from '@/lib/math/view'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import { drawAxes, drawDot, INK, MATH_FONT, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import { Panel, type StageProps } from '../runtime'
import { MorphNotation } from './Morph'
import {
  CAR_CONST,
  carAccel,
  CHALLENGES,
  CURVES,
  DEFAULT_LIVE,
  notebook,
  P1,
  P2,
  P3,
  readResolva,
  REVERSE_END,
  type CurveId,
  type Demo,
  type IntegralLive,
  type ResolvaState,
} from './shared'

// The continuous Palco of "Somando fatias infinitas".
//
// One graph that never cuts. The imagined car's speed graph fills with
// area as it drives; the curve is sliced into rectangles that rise from the
// axis and split in two; the window glides to Bolt's real step graph, then
// zooms into y = x² for the guided problems, where the accumulated area
// A(x) is drawn as the student drags. Every frame eases the displayed scene
// (window, curve blend, rectangles, fills, overlays) toward the target of
// the current Etapa/Cena.

const MISS = '#7dd3fc' // area the rectangles leave out (falta)
const EXCESS = '#fb7185' // area the rectangles add on top (sobra)
const REAL = '#7dd3fc' // real data (Bolt), as in the "derivada" lab
const CURVE_IDS = Object.keys(CURVES) as CurveId[]

type CursorMode = 'auto' | 'set'

interface Target {
  view: Viewport
  /** Space above the graph (px) for the road, the track or an overlay. */
  top: number
  /** Notebook at the bottom (0–1). */
  nb: number
  w: Record<CurveId, number>
  curve: number
  a: number
  b: number
  n: number
  method: Method
  rects: number
  err: number
  hx: number
  ws: number
  hs: number
  ghost: number
  guides: number
  hi: number
  hiA: number
  fill: number
  fillFrom: number
  signed: number
  cursorMode: CursorMode
  cursor: number
  autoFrom: number
  autoTo: number
  autoDur: number
  cursorLine: number
  acc: number
  tangent: number
  slopeOver: number
  slopeMix: number
  slice: number
  dot: number
  dotX: number
  road: number
  roadMax: number
  track: number
  steps: number
  peak: number
  xLabel: string
  yLabel: string
}

const SCALARS = [
  'top',
  'nb',
  'curve',
  'a',
  'b',
  'rects',
  'err',
  'hx',
  'ws',
  'hs',
  'ghost',
  'guides',
  'hiA',
  'fill',
  'fillFrom',
  'signed',
  'cursorLine',
  'acc',
  'tangent',
  'slopeOver',
  'slopeMix',
  'slice',
  'dot',
  'dotX',
  'road',
  'roadMax',
  'track',
  'steps',
  'peak',
] as const

interface DRect {
  x0: number
  x1: number
  s: number
}

interface Display extends Target {
  rectList: DRect[]
  rectKey: string
  autoKey: string
  hold: number
}

interface Inputs {
  stepId: string
  scene: number
  live: IntegralLive
  r: ResolvaState
  pred1: number | null
  pred2: number | null
  picks: Record<string, number | undefined>
}

const VIEW_CAR: Viewport = { x0: -0.16, x1: 2.3, y0: -12, y1: 100 }
const VIEW_SQ: Viewport = { x0: -0.28, x1: 2.32, y0: -0.5, y1: 4.6 }
const VIEW_BOLT: Viewport = { x0: -0.55, x1: 10.25, y0: -1.3, y1: 14.2 }
const VIEW_LIN: Viewport = { x0: -0.35, x1: 3.45, y0: -0.9, y1: 8.4 }
const VIEW_REV: Viewport = { x0: -0.18, x1: 2.75, y0: -52, y1: 74 }

const one = (id: CurveId): Record<CurveId, number> => Object.fromEntries(CURVE_IDS.map((c) => [c, c === id ? 1 : 0])) as Record<CurveId, number>

function target(p: Inputs, H: number): Target {
  const L = p.live
  const t: Target = {
    view: VIEW_CAR,
    top: 44,
    nb: 0,
    w: one('car'),
    curve: 1,
    a: 0,
    b: 2,
    n: 4,
    method: 'left',
    rects: 0,
    err: 0,
    hx: 0,
    ws: 1,
    hs: 1,
    ghost: 0,
    guides: 0,
    hi: -1,
    hiA: 0,
    fill: 0,
    fillFrom: 0,
    signed: 0,
    cursorMode: 'set',
    cursor: 2,
    autoFrom: 0,
    autoTo: 2,
    autoDur: 4,
    cursorLine: 0,
    acc: 0,
    tangent: 0,
    slopeOver: 0,
    slopeMix: 0,
    slice: 0,
    dot: 0,
    dotX: 0,
    road: 0,
    roadMax: 120,
    track: 0,
    steps: 0,
    peak: 0,
    xLabel: 't (h)',
    yLabel: 'v (km/h)',
  }
  const auto = (from: number, to: number, dur: number) => {
    t.cursorMode = 'auto'
    t.autoFrom = from
    t.autoTo = to
    t.autoDur = dur
    t.cursorLine = 1
  }
  const applyDemo = (d: Demo | undefined) => {
    if (!d) return
    if (d.n !== undefined) t.n = d.n
    if (d.method) t.method = d.method
    if (d.heightsAreX) t.hx = 1
    if (d.widthScale) t.ws = d.widthScale
    if (d.heightScale) t.hs = d.heightScale
    if (d.showError) t.err = 1
    if (d.slope !== undefined) {
      t.slopeOver = d.slope
      t.slopeMix = 1
    }
    if (d.fillFrom !== undefined) t.fillFrom = d.fillFrom
    if (d.curve) t.w = one(d.curve)
    if (d.dot !== undefined) {
      t.dot = 1
      t.dotX = d.dot
    }
  }

  switch (p.stepId) {
    case 'imagine':
      t.top = 96
      t.road = 1
      t.fill = 1
      t.w = one(p.scene >= 3 ? 'car' : 'const60')
      t.roadMax = p.scene >= 3 ? 100 : 120
      if (p.scene === 0 || p.scene === 3) auto(0, 2, 4.2)
      else if (p.scene === 1) {
        t.cursor = L.carT
        t.cursorLine = 1
      }
      break
    case 'preveja':
      t.fill = 0.12
      t.guides = p.scene === 0 ? 1 : 0
      t.rects = p.scene === 0 ? 0 : 1
      t.err = p.scene === 0 ? 0 : 1
      t.method = p.scene <= 1 ? 'left' : 'right'
      t.n = p.scene === 3 && p.pred2 !== null ? 8 : 4
      break
    case 'entenda':
      t.xLabel = 'x'
      t.yLabel = 'f(x)'
      if (p.scene === 0) {
        t.n = 8
        t.method = 'right'
        t.rects = 1
        t.hi = 5
        t.hiA = 1
      } else if (p.scene === 1) {
        t.n = L.n
        t.method = L.method
        t.rects = 1
        t.err = 1
      } else {
        t.top = Math.min(170, H * 0.42)
        t.n = 200
        t.method = 'mid'
        t.rects = p.scene === 2 ? 1 : 0
        t.fill = p.scene === 3 ? 1 : 0
      }
      break
    case 'observe':
      t.view = VIEW_BOLT
      t.top = 104
      t.track = 1
      t.w = one('bolt')
      t.fill = 1
      t.steps = 1
      t.a = 0
      t.b = BOLT_TIME
      t.xLabel = 't (s)'
      t.yLabel = 'v (m/s), média por trecho'
      if (p.scene === 0) auto(0, BOLT_TIME, BOLT_TIME)
      else if (p.scene === 1) {
        t.cursor = L.boltT
        t.cursorLine = 1
      } else t.cursor = BOLT_TIME
      t.peak = p.scene >= 3 ? 1 : 0
      break
    case 'resolva': {
      t.xLabel = 'x'
      t.yLabel = 'y'
      t.nb = 1
      t.top = 16
      const r = p.r
      if (p.scene === 0) {
        t.view = VIEW_SQ
        t.w = one('sq')
        t.rects = 1
        const task = P1[Math.min(r.p1, P1.length - 1)]
        applyDemo(task.base)
        if (r.p1 >= 4) {
          t.n = L.splitN
          t.err = 1
        } else if (r.p1Wrong !== null) applyDemo(task.options[r.p1Wrong]?.demo)
        t.view = { ...VIEW_SQ, x1: Math.max(VIEW_SQ.x1, 2 * t.ws + 0.35), y1: VIEW_SQ.y1 * Math.max(1, t.hs) }
      } else if (p.scene === 1) {
        t.view = VIEW_SQ
        t.w = one('sq')
        t.fill = 1
        t.acc = 1
        t.cursor = L.accX
        t.cursorLine = 1
        if (r.p2 >= 1) {
          t.tangent = 1
          if (r.p2 === 1 && r.p2Wrong !== null) applyDemo(P2[1].options[r.p2Wrong]?.demo)
        }
        if (r.p2 >= 2) t.slice = 1
      } else {
        t.view = VIEW_LIN
        t.w = one('lin')
        t.fill = 1
        t.a = 1
        t.b = 3
        t.fillFrom = 1
        t.cursor = 3
        const ok = r.p3 !== null && P3.options[r.p3]?.ok
        if (r.p3 !== null && !ok) applyDemo(P3.options[r.p3]?.demo)
      }
      break
    }
    case 'e-se': {
      const c = CHALLENGES[Math.min(p.scene, CHALLENGES.length - 1)]
      const answered = p.picks[c.id] !== undefined
      if (c.id === 're') {
        t.view = VIEW_REV
        t.top = 96
        t.road = 1
        t.roadMax = 45
        t.w = one('rev')
        t.fill = 1
        t.signed = 1
        t.b = REVERSE_END
        if (answered) t.cursor = REVERSE_END
        else auto(0, REVERSE_END, 5)
      } else {
        t.view = VIEW_SQ
        t.w = one('sq')
        t.xLabel = 'x'
        t.yLabel = 'y'
        t.n = 10
        t.method = 'mid'
        t.rects = 1
        t.ghost = 1
        t.err = answered ? 1 : 0
      }
      break
    }
    case 'conclua':
      t.view = { x0: -0.3, x1: 2.3, y0: -0.4, y1: 4.4 }
      t.top = Math.min(H * 0.58, 270)
      t.w = one('sq')
      t.xLabel = 'x'
      t.yLabel = 'y'
      t.n = 200
      t.method = 'mid'
      t.fill = 1
      t.acc = 1
      t.cursor = 2
      break
  }
  return t
}

const cloneTarget = (t: Target): Display => ({ ...t, view: { ...t.view }, w: { ...t.w }, rectList: [], rectKey: '', autoKey: '', hold: 0 })

function ease(d: Display, t: Target, k: number) {
  const L = (a: number, b: number) => a + (b - a) * k
  for (const key of SCALARS) d[key] = L(d[key], t[key])
  d.view = { x0: L(d.view.x0, t.view.x0), x1: L(d.view.x1, t.view.x1), y0: L(d.view.y0, t.view.y0), y1: L(d.view.y1, t.view.y1) }
  for (const id of CURVE_IDS) d.w[id] = L(d.w[id], t.w[id])
  d.n = t.n
  d.method = t.method
  d.hi = t.hiA > 0.5 ? t.hi : d.hi
  d.xLabel = t.xLabel
  d.yLabel = t.yLabel
  d.cursorMode = t.cursorMode
  d.autoFrom = t.autoFrom
  d.autoTo = t.autoTo
  d.autoDur = t.autoDur
}

/** The displayed curve: a blend of the named curves (so one morphs into the next). */
function blend(d: Display) {
  const ids = CURVE_IDS.filter((id) => d.w[id] > 0.002)
  const sum = ids.reduce((s, id) => s + d.w[id], 0) || 1
  return (x: number) => {
    let y = 0
    for (const id of ids) y += d.w[id] * CURVES[id](x)
    return y / sum
  }
}

/**
 * Keeps the displayed rectangles in step with the target slicing. When n
 * changes, each new rectangle starts from the old one that holds its center
 * (so every rectangle splits in two when n doubles) or from the span of the
 * old ones it swallows (when n shrinks), then eases to its own place.
 */
function syncRects(d: Display, a: number, b: number, n: number, method: Method, k: number) {
  const count = Math.max(1, Math.round(n))
  const key = `${a}|${b}|${count}`
  const dx = (b - a) / count
  if (key !== d.rectKey) {
    const old = d.rectList
    d.rectList = Array.from({ length: count }, (_, i) => {
      const x0 = a + i * dx
      const x1 = x0 + dx
      const c = (x0 + x1) / 2
      if (!old.length) return { x0, x1, s: samplePoint(x0, x1, method) }
      const inside = old.filter((o) => (o.x0 + o.x1) / 2 >= x0 && (o.x0 + o.x1) / 2 < x1)
      if (inside.length > 1) return { x0: inside[0].x0, x1: inside[inside.length - 1].x1, s: inside.reduce((s, o) => s + o.s, 0) / inside.length }
      let best = old[0]
      let bestD = Infinity
      for (const o of old) {
        const dd = c >= o.x0 && c <= o.x1 ? 0 : Math.min(Math.abs(c - o.x0), Math.abs(c - o.x1))
        if (dd < bestD) {
          bestD = dd
          best = o
        }
      }
      return { ...best }
    })
    d.rectKey = key
  }
  d.rectList.forEach((r, i) => {
    const x0 = a + i * dx
    const x1 = x0 + dx
    r.x0 += (x0 - r.x0) * k
    r.x1 += (x1 - r.x1) * k
    r.s += (samplePoint(x0, x1, method) - r.s) * k
  })
}

function frameOf(W: number, H: number, top: number, nb: number): Frame {
  const left = 40
  const right = 14
  const bottom = H - 26 - nb * (H * 0.32 + 8)
  return { left, top, width: Math.max(40, W - left - right), height: Math.max(40, bottom - top) }
}

export default function IntegralStage({ lab, stepId, scene, answers, live, setLive }: StageProps) {
  const L = useMemo(() => ({ ...DEFAULT_LIVE, ...(live as Partial<IntegralLive>) }), [live])
  const r = useMemo(() => readResolva(answers), [answers])
  const picks = useMemo(() => (answers.challenges as Record<string, number | undefined> | undefined) ?? {}, [answers.challenges])
  const pred1 = typeof answers.pred1 === 'number' ? (answers.pred1 as number) : null
  const pred2 = typeof answers.pred2 === 'number' ? (answers.pred2 as number) : null
  const accent = lab.accent
  const { ref, size, context } = useMathCanvas()
  const H = size.h || 400
  const W = size.w || 360

  const inputs: Inputs = { stepId, scene, live: L, r, pred1, pred2, picks }
  const tgt = useMemo(() => target(inputs, H), [JSON.stringify(inputs), H]) // eslint-disable-line react-hooks/exhaustive-deps
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Display | null>(null)
  const geo = useRef<{ view: Viewport; frame: Frame } | null>(null)
  const chipRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef({ stepId, scene, answered: false })
  ctxRef.current = { stepId, scene, answered: stepId === 'e-se' && picks[CHALLENGES[Math.min(scene, 1)].id] !== undefined }

  useEffect(() => {
    if (!size.w) return
    const reduced = prefersReducedMotion()
    if (!disp.current) disp.current = cloneTarget(tgtRef.current)
    let raf = 0
    let last = performance.now()
    let lastChip = ''
    const frame = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const d = disp.current!
      const t = tgtRef.current
      const k = reduced ? 1 : easeFactor(dt, 0.1)
      ease(d, t, k)
      // Cursor: runs by itself (autoplay) or follows the live value.
      if (t.cursorMode === 'auto') {
        const key = `${t.autoFrom}|${t.autoTo}`
        if (d.autoKey !== key) {
          d.autoKey = key
          d.cursor = t.autoFrom
          d.hold = 0
        }
        if (reduced) d.cursor = t.autoTo
        else if (d.cursor < t.autoTo) d.cursor = Math.min(t.autoTo, d.cursor + ((t.autoTo - t.autoFrom) * dt) / 1000 / t.autoDur)
        else {
          d.hold += dt
          if (d.hold > 1400) {
            d.cursor = t.autoFrom
            d.hold = 0
          }
        }
      } else {
        d.autoKey = ''
        d.cursor += (t.cursor - d.cursor) * (reduced ? 1 : easeFactor(dt, 0.3))
      }
      syncRects(d, t.a, t.b, t.n, t.method, reduced ? 1 : easeFactor(dt, 0.09))
      const ctx = context()
      if (ctx) draw(ctx, d, size.w, size.h, accent, geo)
      const chip = chipText(ctxRef.current, d, tgtRef.current)
      if (chip !== lastChip && chipRef.current) {
        lastChip = chip
        chipRef.current.textContent = chip
        chipRef.current.style.opacity = chip ? '1' : '0'
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, accent])

  const frameT = frameOf(W, H, tgt.top, tgt.nb)
  const P = toPx(tgt.view, frameT)
  const labels = stageLabels(stepId, scene, tgt, inputs)
  const context_ =
    stepId === 'observe'
      ? 'dados reais · Berlim 2009'
      : stepId === 'imagine' || stepId === 'preveja' || (stepId === 'e-se' && scene === 0) || (stepId === 'entenda' && scene < 2)
        ? 'exemplo imaginado'
        : null

  return (
    <Panel>
      <canvas ref={ref} role="img" aria-label={ariaLabel(stepId, scene, L, r)} className="absolute inset-0 touch-none" />
      <StageInput stepId={stepId} scene={scene} r={r} geo={geo} live={L} setLive={setLive} />

      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
        <AnimatePresence mode="popLayout">
          {context_ && (
            <motion.span
              key={context_}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn('shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] backdrop-blur-xl', stepId === 'observe' ? 'bg-sky-400/15 text-sky-100' : 'bg-white/[0.07] text-white/60')}
            >
              {context_}
            </motion.span>
          )}
        </AnimatePresence>
        <div
          ref={chipRef}
          className="ml-auto min-w-0 truncate whitespace-nowrap rounded-full bg-black/55 px-2.5 py-1.5 font-mono text-[11.5px] tabular-nums text-white/90 opacity-0 backdrop-blur-xl transition-opacity duration-300"
        />
      </div>

      {/* Labels on the graph, placed with the target window (they glide between Cenas). */}
      <AnimatePresence>
        {labels.map((l) => (
          <motion.div
            key={l.key}
            className={cn(
              'pointer-events-none absolute z-[2] whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] backdrop-blur-md',
              l.tone === 'accent' ? 'bg-black/40 text-white' : l.tone === 'real' ? 'bg-black/40 text-sky-100' : l.tone === 'big' ? 'bg-black/35 text-[15px] font-medium text-white' : 'bg-black/30 text-white/70',
            )}
            initial={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.9, left: P.x(l.x), top: P.y(l.y) + (l.dy ?? 0) }}
            animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1, left: P.x(l.x), top: P.y(l.y) + (l.dy ?? 0) }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={l.tone === 'accent' ? { boxShadow: `inset 0 0 0 1px ${accent}66` } : undefined}
          >
            {l.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {stepId === 'entenda' && scene >= 2 && (
          <motion.div
            key="morph"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="pointer-events-none absolute inset-x-0 top-9 z-10 flex justify-center"
            style={{ height: Math.max(90, tgt.top - 44) }}
          >
            <MorphNotation accent={accent} replay={L.morphKey} result={scene >= 3 ? '100' : null} />
          </motion.div>
        )}
        {stepId === 'resolva' && <Notebook key="nb" scene={scene} r={r} splitN={L.splitN} accent={accent} />}
        {stepId === 'conclua' && <Finale key="fin" accent={accent} height={tgt.top} />}
      </AnimatePresence>
    </Panel>
  )
}

// ---------------------------------------------------------------- chip

function chipText(c: { stepId: string; scene: number; answered: boolean }, d: Display, t: Target): string {
  const cur = d.cursor
  switch (c.stepId) {
    case 'imagine': {
      if (c.scene === 2) return '60 km/h × 2 h = 120 km'
      const v = c.scene >= 3 ? carAccel(cur) : CAR_CONST
      const s = c.scene >= 3 ? 30 * cur + 5 * cur ** 3 : CAR_CONST * cur
      return `${fmt(v, 0)} km/h · andou ${fmt(s, 1)} km`
    }
    case 'preveja':
      if (c.scene === 0) return ''
      return `soma ${fmt(riemann(carAccel, 0, 2, t.n, t.method), 1)} km · real 100 km`
    case 'entenda':
      if (c.scene >= 2) return ''
      return `n = ${Math.round(t.n)} · soma ≈ ${fmt(riemann(carAccel, 0, 2, t.n, t.method), 2)}`
    case 'observe':
      if (c.scene >= 2) return '10 degraus × 10 m = 100 m'
      return `t = ${fmt(cur, 2)} s · ${fmt(boltDistance(cur), 1)} m`
    case 'resolva':
      if (c.scene === 1 && t.tangent > 0.5) return `x = ${fmt(cur, 2)} · inclinação de A: ${fmt(t.slopeMix > 0.5 ? t.slopeOver : cur * cur, 3)}`
      if (c.scene === 1) return `x = ${fmt(cur, 2)} · A(x) ≈ ${fmt(cur ** 3 / 3, 3)}`
      return ''
    case 'e-se':
      if (c.scene === 0) {
        const s = 60 * cur - 20 * cur * cur
        const tot = cur <= 1.5 ? s : 45 + (45 - s)
        return `desloc. ${fmt(s, 0)} km · andou ${fmt(tot, 0)} km`
      }
      return c.answered ? `erro: esquerda ${fmt(8 / 3 - riemann((x) => x * x, 0, 2, 10, 'left'), 3)} · meio ${fmt(8 / 3 - riemann((x) => x * x, 0, 2, 10, 'mid'), 4)}` : ''
    default:
      return ''
  }
}

// ---------------------------------------------------------------- labels

interface StageLabel {
  key: string
  x: number
  y: number
  dy?: number
  text: React.ReactNode
  tone?: 'accent' | 'muted' | 'real' | 'big'
}

function stageLabels(stepId: string, scene: number, t: Target, p: Inputs): StageLabel[] {
  const out: StageLabel[] = []
  if (stepId === 'imagine' && scene === 2) {
    out.push({ key: 'area', x: 1, y: 30, text: 'área = 120 km', tone: 'big' })
    out.push({ key: 'base', x: 1, y: 0, dy: 26, text: 'base: 2 h' })
    out.push({ key: 'alt', x: 1, y: 60, dy: -16, text: 'altura: 60 km/h' })
  }
  if (stepId === 'imagine' && scene === 3) out.push({ key: 'q', x: 1.25, y: 30, text: 'área = ?', tone: 'big' })
  if (stepId === 'preveja' && scene >= 1) {
    out.push({ key: 'miss', x: 0.35, y: 88, text: <span className="text-sky-200">■ falta</span> })
    out.push({ key: 'exc', x: 0.85, y: 88, text: <span className="text-rose-300">■ sobra</span> })
  }
  if (stepId === 'entenda' && scene === 0) {
    const dx = (t.b - t.a) / t.n
    const x0 = t.a + t.hi * dx
    const h = carAccel(x0 + dx)
    out.push({ key: 'dx', x: x0 + dx / 2, y: h, dy: -16, text: <Tex say="delta x">{'\\Delta x'}</Tex>, tone: 'accent' })
    out.push({ key: 'fx', x: x0 - 0.2, y: h / 2, text: <Tex say="f de x i">{'f(x_i)'}</Tex>, tone: 'accent' })
  }
  if (stepId === 'entenda' && scene === 1) {
    out.push({ key: 'miss', x: 0.35, y: 88, text: <span className="text-sky-200">■ falta</span> })
    out.push({ key: 'exc', x: 0.85, y: 88, text: <span className="text-rose-300">■ sobra</span> })
  }
  if (stepId === 'observe' && scene >= 3) {
    const s = BOLT_PEAK
    out.push({ key: 'peak', x: (s.t0 + s.t1) / 2, y: s.v, dy: -18, text: `pico ≈ ${fmt(s.v, 1)} m/s`, tone: 'real' })
  }
  if (stepId === 'resolva' && scene === 2) {
    const ok = p.r.p3 !== null && P3.options[p.r.p3]?.ok
    if (ok || p.r.p3Shown) out.push({ key: 'trap', x: 2, y: 2.4, text: 'área = 10', tone: 'big' })
    else if (p.r.p3 !== null && P3.options[p.r.p3]?.demo?.dot) out.push({ key: 'dot', x: 3, y: 7, dy: -18, text: 'f(3) = 7', tone: 'accent' })
  }
  if (stepId === 'resolva' && scene === 1 && p.r.p2 >= 2) out.push({ key: 'fdx', x: 0.8, y: 3.2, text: <Tex say="f de x vezes d x">{'f(x)\\,dx'}</Tex>, tone: 'accent' })
  if (stepId === 'e-se' && scene === 0 && p.picks.re !== undefined) {
    out.push({ key: 'pos', x: 0.6, y: 22, text: '+45 km', tone: 'big' })
    out.push({ key: 'neg', x: 2.05, y: -12, text: <span className="text-rose-200">−20 km</span>, tone: 'big' })
  }
  return out
}

// ---------------------------------------------------------------- input

function StageInput({
  stepId,
  scene,
  r,
  geo,
  live,
  setLive,
}: {
  stepId: string
  scene: number
  r: ResolvaState
  geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>
  live: IntegralLive
  setLive: (patch: Partial<IntegralLive>) => void
}) {
  const mode =
    stepId === 'imagine' && scene === 1
      ? 'car'
      : stepId === 'entenda' && scene === 1
        ? 'slice'
        : stepId === 'observe' && scene === 1
          ? 'bolt'
          : stepId === 'resolva' && scene === 1 && r.p2 === 0
            ? 'acc'
            : null
  const [used, setUsed] = useState<Record<string, boolean>>({})
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const start = useRef<{ n: number; x: number; dist: number } | null>(null)
  const lastTick = useRef(-1)
  if (!mode) return null

  const hint = mode === 'slice' ? 'Arraste para os lados para fatiar' : mode === 'acc' ? 'Arraste para mover x' : 'Arraste para mover o tempo'
  const scrub = (clientX: number, el: HTMLElement) => {
    const g = geo.current
    if (!g) return
    const rect = el.getBoundingClientRect()
    const x = toPx(g.view, g.frame).fromX(clientX - rect.left)
    if (mode === 'car') {
      const v = Math.min(2, Math.max(0, x))
      setLive({ carT: v })
      tick(Math.floor(v * 4))
    } else if (mode === 'bolt') {
      const v = Math.min(BOLT_TIME, Math.max(0, x))
      setLive({ boltT: v })
      tick(Math.floor(boltDistance(v) / 10))
    } else if (mode === 'acc') {
      const v = Math.min(2, Math.max(0, x))
      setLive({ accX: v })
      tick(Math.floor(v * 4))
    }
  }
  const tick = (i: number) => {
    if (i !== lastTick.current) {
      lastTick.current = i
      haptic(4)
    }
  }
  const distance = () => {
    const ps = [...pointers.current.values()]
    return ps.length >= 2 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0
  }

  return (
    <div
      className="absolute inset-0 z-[1] cursor-ew-resize select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        start.current = { n: live.n, x: e.clientX, dist: distance() }
        if (mode !== 'slice') scrub(e.clientX, e.currentTarget)
      }}
      onPointerMove={(e) => {
        if (!pointers.current.has(e.pointerId)) return
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (!used[mode]) setUsed((u) => ({ ...u, [mode]: true }))
        if (mode === 'slice' && start.current) {
          const d = distance()
          let n: number
          if (pointers.current.size >= 2 && start.current.dist > 0) n = start.current.n * (d / start.current.dist)
          else n = start.current.n * Math.exp((e.clientX - start.current.x) / 110)
          n = Math.round(Math.min(200, Math.max(1, n)))
          if (n !== live.n) {
            setLive({ n })
            if (n <= 16) haptic(4)
          }
        } else scrub(e.clientX, e.currentTarget)
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId)
        start.current = pointers.current.size ? { n: live.n, x: [...pointers.current.values()][0].x, dist: 0 } : null
      }}
      onPointerCancel={(e) => {
        pointers.current.delete(e.pointerId)
        start.current = null
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-9 flex justify-center">
        <AnimatePresence>
          {!used[mode] && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur-xl"
            >
              <motion.span animate={{ x: [0, -4, 0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="text-white/70">
                ↔
              </motion.span>
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- overlays

function Notebook({ scene, r, splitN, accent }: { scene: number; r: ResolvaState; splitN: number; accent: string }) {
  const rn = riemann((x) => x * x, 0, 2, splitN, 'right')
  const lines = notebook(scene, r, splitN, rn)
  const titles = [
    { tex: '\\int_0^2 x^2\\,dx', say: 'integral de 0 a 2 de x ao quadrado' },
    { tex: 'A(x) = \\int_0^x t^2\\,dt', say: 'A de x, a área de 0 até x' },
    { tex: '\\int_1^3 (2x + 1)\\,dx', say: 'integral de 1 a 3 de 2x mais 1' },
  ]
  const title = titles[Math.min(scene, 2)]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="pointer-events-none absolute inset-x-2 bottom-2 z-10 h-[32%] overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.035] px-3 py-2.5"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={scene} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex h-full flex-col">
          <p className="flex items-baseline gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
            Caderno · problema {scene + 1} de 3
            <span className="normal-case tracking-normal text-white/70" style={{ color: accent }}>
              <Tex say={title.say}>{title.tex}</Tex>
            </span>
          </p>
          <div className="mt-1 flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden text-[14px] text-white/75">
            {lines.slice(-3).map((l, i) => (
              <motion.div
                key={i < 3 ? `${scene}-${i}` : `${scene}-${i}-${l.tex.startsWith('R_n') ? 'end' : 'run'}`}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn('whitespace-nowrap', i === Math.min(3, lines.length) - 1 && 'text-white')}
              >
                <Tex say={l.say}>{l.tex}</Tex>
              </motion.div>
            ))}
            {!lines.length && <p className="text-[12.5px] text-white/35">As linhas aparecem aqui conforme você resolve.</p>}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function Finale({ accent, height }: { accent: string; height: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center justify-center gap-2 px-4 pt-6"
      style={{ height }}
    >
      <div className="relative h-[clamp(64px,12svh,104px)] w-[clamp(64px,12svh,104px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
        />
        <svg viewBox="0 0 160 160" className="relative h-full w-full" aria-hidden>
          <motion.circle cx="80" cy="80" r="66" fill="none" stroke={accent} strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
          <motion.circle cx="80" cy="80" r="56" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.3 }} style={{ originX: '80px', originY: '80px' }} />
          {Array.from({ length: 8 }).map((_, i) => {
            const h = 10 + ((i + 0.5) / 8) ** 2 * 50
            return (
              <motion.rect
                key={i}
                x={44 + i * 9}
                width="8"
                y={112 - h}
                height={h}
                rx="1.5"
                fill={accent}
                fillOpacity={0.55 + i * 0.05}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.5 + i * 0.06 }}
                style={{ originY: '112px' }}
              />
            )
          })}
          <motion.path
            d="M 44 102 Q 80 100 116 52"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 1, ease: 'easeInOut' }}
          />
        </svg>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 80, opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 1 + i * 0.02, ease: 'easeOut' }}
            />
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 170, damping: 26, delay: 1.3 }}
        className="text-[clamp(17px,2.6svh,26px)] text-white"
      >
        <Tex block say="A integral de a até b de f de x d x é igual a F de b menos F de a">{'\\int_a^b f(x)\\,dx = F(b) - F(a)'}</Tex>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="text-[10.5px] uppercase tracking-[0.16em] text-white/40">
        Teorema Fundamental do Cálculo
      </motion.p>
    </motion.div>
  )
}

function ariaLabel(stepId: string, scene: number, L: IntegralLive, r: ResolvaState): string {
  switch (stepId) {
    case 'imagine':
      return scene >= 3 ? 'Gráfico de velocidade de um carro que acelera de 30 a 90 quilômetros por hora; a área sob a curva é a distância' : 'Gráfico de velocidade constante de 60 quilômetros por hora; a área do retângulo é a distância'
    case 'preveja':
      return 'Curva de velocidade crescente aproximada por retângulos'
    case 'entenda':
      return scene >= 2 ? 'A área sob a curva preenchida por retângulos finíssimos' : `Área sob a curva aproximada por ${L.n} retângulos`
    case 'observe':
      return `Gráfico em degraus da velocidade média de Usain Bolt em cada trecho de 10 metros; ${fmt(boltDistance(L.boltT), 1)} metros acumulados`
    case 'resolva':
      return scene === 0
        ? `Parábola y igual a x ao quadrado de 0 a 2 com retângulos; passo ${r.p1 + 1}`
        : scene === 1
          ? `Área acumulada sob y igual a x ao quadrado até x igual a ${fmt(L.accX, 2)}`
          : 'Reta y igual a 2x mais 1 entre 1 e 3'
    case 'e-se':
      return scene === 0 ? 'Velocidade de um carro que vai para a frente e depois dá ré; a área abaixo do eixo é negativa' : 'Retângulos pelo ponto médio e contornos pela esquerda sob a parábola'
    default:
      return 'A área sob a parábola, preenchida'
  }
}

// ---------------------------------------------------------------- drawing

function points(f: (x: number) => number, x0: number, x1: number, n: number, bolt: boolean): { x: number; y: number }[] {
  const xs: number[] = []
  for (let i = 0; i <= n; i++) xs.push(x0 + ((x1 - x0) * i) / n)
  if (bolt) {
    // Exact corners for the step graph.
    const edges = [0.146, ...BOLT_SEGMENTS.map((s) => s.t1)]
    for (const e of edges) for (const x of [e - 1e-6, e + 1e-6]) if (x > x0 && x < x1) xs.push(x)
    xs.sort((a, b) => a - b)
  }
  return xs.map((x) => ({ x, y: f(x) }))
}

function draw(ctx: CanvasRenderingContext2D, d: Display, W: number, H: number, accent: string, geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>) {
  const fr = frameOf(W, H, d.top, d.nb)
  const v = d.view
  geo.current = { view: v, frame: fr }
  const P = toPx(v, fr)
  const f = blend(d)
  const bolt = d.w.bolt > 0.01

  drawAxes(ctx, v, fr)

  ctx.save()
  ctx.beginPath()
  ctx.rect(fr.left, fr.top - 4, fr.width, fr.height + 8)
  ctx.clip()

  // Exact area under the curve, from fillFrom to the cursor.
  const from = d.fillFrom
  const to = Math.min(d.cursor, Math.max(d.b, d.cursor))
  if (d.fill > 0.01 && to > from) {
    const pts = points(f, from, to, 220, bolt)
    const area = () => {
      ctx.beginPath()
      ctx.moveTo(P.x(from), P.y(0))
      for (const p of pts) ctx.lineTo(P.x(p.x), P.y(p.y))
      ctx.lineTo(P.x(to), P.y(0))
      ctx.closePath()
    }
    // The car's (accent) area turns into Bolt's (real data) area as the curves blend.
    const paint = () => {
      ctx.globalAlpha = 0.3 * d.fill * (1 - d.w.bolt)
      ctx.fillStyle = accent
      ctx.fill()
      ctx.globalAlpha = 0.3 * d.fill * d.w.bolt
      ctx.fillStyle = REAL
      ctx.fill()
    }
    // Above the axis.
    ctx.save()
    ctx.beginPath()
    ctx.rect(fr.left, fr.top - 4, fr.width, P.y(0) - fr.top + 4)
    ctx.clip()
    area()
    paint()
    ctx.restore()
    // Below the axis: negative when signed.
    ctx.save()
    ctx.beginPath()
    ctx.rect(fr.left, P.y(0), fr.width, fr.top + fr.height - P.y(0) + 4)
    ctx.clip()
    area()
    if (d.signed > 0.5) {
      ctx.globalAlpha = 0.3 * d.fill
      ctx.fillStyle = EXCESS
      ctx.fill()
    } else paint()
    ctx.restore()
  }

  // Bolt: the ten steps, each 10 m of area.
  if (d.steps > 0.01) {
    ctx.save()
    ctx.font = '500 10px ui-sans-serif, system-ui, sans-serif'
    BOLT_SEGMENTS.forEach((s, i) => {
      const xa = P.x(s.t0)
      const xb = P.x(s.t1)
      const top = P.y(s.v)
      const reached = d.cursor >= s.t1 - 1e-3
      const isPeak = i === BOLT_PEAK.index
      if (isPeak && d.peak > 0.01) {
        ctx.globalAlpha = 0.45 * d.peak
        ctx.fillStyle = REAL
        ctx.fillRect(xa, top, xb - xa, P.y(0) - top)
      }
      ctx.globalAlpha = d.steps * 0.35
      ctx.strokeStyle = REAL
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(xb + 0.5, P.y(0))
      ctx.lineTo(xb + 0.5, top)
      ctx.stroke()
      if (reached && xb - xa > 9) {
        ctx.save()
        ctx.globalAlpha = d.steps * 0.85
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.translate((xa + xb) / 2, (top + P.y(0)) / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('10 m', 0, 0)
        ctx.restore()
      }
    })
    ctx.restore()
  }

  // Riemann rectangles.
  const grow = 1 - Math.pow(1 - Math.min(1, d.rects), 3)
  if (d.rects > 0.01) {
    const a = d.a
    for (let i = 0; i < d.rectList.length; i++) {
      const r = d.rectList[i]
      const xa = a + (r.x0 - a) * d.ws
      const xb = a + (r.x1 - a) * d.ws
      const h = ((1 - d.hx) * f(r.s) + d.hx * r.s) * d.hs * grow
      const pxA = P.x(xa)
      const pxB = P.x(xb)
      const wpx = pxB - pxA
      const gap = wpx > 6 ? 0.75 : 0
      const y0 = P.y(0)
      const y1 = P.y(h)
      const hl = i === d.hi ? d.hiA : 0
      ctx.globalAlpha = Math.min(1, d.rects * 1.5) * (0.26 + 0.3 * hl + (wpx < 3 ? 0.18 : 0))
      ctx.fillStyle = accent
      ctx.fillRect(pxA + gap, Math.min(y0, y1), wpx - 2 * gap, Math.abs(y1 - y0))
      if (wpx > 4) {
        ctx.globalAlpha = Math.min(1, d.rects * 1.5) * (0.85 + 0.15 * hl)
        ctx.strokeStyle = hl > 0.5 ? '#fff' : accent
        ctx.lineWidth = hl > 0.5 ? 2 : 1.25
        ctx.strokeRect(pxA + gap, Math.min(y0, y1), wpx - 2 * gap, Math.abs(y1 - y0))
      }
      // What each rectangle adds (sobra) or leaves out (falta).
      if (d.err > 0.01 && d.ws < 1.05) {
        const N = 10
        const xs = Array.from({ length: N + 1 }, (_, j) => xa + ((xb - xa) * j) / N)
        for (const [color, pick] of [
          [MISS, (y: number) => Math.max(y, h)],
          [EXCESS, (y: number) => Math.min(y, h)],
        ] as const) {
          ctx.beginPath()
          ctx.moveTo(P.x(xa), P.y(h))
          for (const x of xs) ctx.lineTo(P.x(x), P.y(pick(f(x))))
          ctx.lineTo(P.x(xb), P.y(h))
          ctx.closePath()
          ctx.globalAlpha = 0.55 * d.err * Math.min(1, d.rects * 1.5)
          ctx.fillStyle = color
          ctx.fill()
        }
      }
    }
    ctx.globalAlpha = 1
  }

  // Left-sum outlines, to compare with the midpoint (E se…?).
  if (d.ghost > 0.01) {
    const n = Math.max(1, Math.round(d.n))
    const dx = (d.b - d.a) / n
    ctx.save()
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.globalAlpha = d.ghost * 0.8
    ctx.lineWidth = 1
    for (let i = 0; i < n; i++) {
      const x0 = d.a + i * dx
      const h = f(x0)
      ctx.strokeRect(P.x(x0), P.y(h), P.x(x0 + dx) - P.x(x0), P.y(0) - P.y(h))
    }
    ctx.restore()
  }

  // Slice guides (Preveja): where each slice takes its height.
  if (d.guides > 0.01) {
    const n = Math.max(1, Math.round(d.n))
    const dx = (d.b - d.a) / n
    ctx.save()
    ctx.globalAlpha = d.guides
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    for (let i = 0; i <= n; i++) {
      const x = d.a + i * dx
      ctx.beginPath()
      ctx.moveTo(P.x(x), P.y(0))
      ctx.lineTo(P.x(x), P.y(f(x)))
      ctx.stroke()
    }
    ctx.setLineDash([])
    for (let i = 0; i < n; i++) {
      const x = samplePoint(d.a + i * dx, d.a + (i + 1) * dx, d.method)
      drawDot(ctx, P.x(x), P.y(f(x)), 4.5, accent, 0.8)
    }
    ctx.restore()
  }

  // The curve itself.
  if (d.curve > 0.01) {
    const pts = points(f, v.x0, v.x1, Math.round(fr.width * 0.8), bolt)
    ctx.save()
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(P.x(p.x), P.y(p.y)) : ctx.moveTo(P.x(p.x), P.y(p.y))))
    ctx.globalAlpha = d.curve * (1 - d.w.bolt)
    ctx.strokeStyle = '#fff'
    ctx.stroke()
    ctx.globalAlpha = d.curve * d.w.bolt
    ctx.strokeStyle = REAL
    ctx.stroke()
    ctx.restore()
  }

  // Accumulated area A(x) = ∫₀ˣ f, drawn up to the cursor.
  const c = d.cursor
  if (d.acc > 0.01) {
    const n = 160
    const pts: { x: number; y: number }[] = [{ x: d.a, y: 0 }]
    let A = 0
    for (let i = 1; i <= n; i++) {
      const x0 = d.a + ((c - d.a) * (i - 1)) / n
      const x1 = d.a + ((c - d.a) * i) / n
      A += ((f(x0) + 4 * f((x0 + x1) / 2) + f(x1)) / 6) * (x1 - x0)
      pts.push({ x: x1, y: A })
    }
    ctx.save()
    ctx.globalAlpha = d.acc
    ctx.strokeStyle = accent
    ctx.shadowColor = accent
    ctx.shadowBlur = 10
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(P.x(p.x), P.y(p.y)) : ctx.moveTo(P.x(p.x), P.y(p.y))))
    ctx.stroke()
    ctx.restore()
    if (d.acc > 0.5 && c > 0.02) {
      label(ctx, P.x(c) + 8, P.y(A) - 10, 'A(x)', accent, d.acc)
      drawDot(ctx, P.x(c), P.y(A), 5, accent, 0.8)
      drawDot(ctx, P.x(c), P.y(f(c)), 4, '#fff', 0)
    }
    // The tangent to A at x: its slope is f(x).
    if (d.tangent > 0.01) {
      const m = (1 - d.slopeMix) * f(c) + d.slopeMix * d.slopeOver
      const half = 0.55
      ctx.save()
      ctx.globalAlpha = d.tangent
      ctx.strokeStyle = d.slopeMix > 0.5 ? EXCESS : '#fff'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(P.x(c - half), P.y(A - m * half))
      ctx.lineTo(P.x(c + half), P.y(A + m * half))
      ctx.stroke()
      ctx.restore()
    }
    // A thin slice at x: the area grows by f(x)·dx.
    if (d.slice > 0.01) {
      const w = 0.12
      ctx.save()
      ctx.globalAlpha = 0.65 * d.slice
      ctx.fillStyle = '#fff'
      ctx.fillRect(P.x(c), P.y(f(c)), P.x(c + w) - P.x(c), P.y(0) - P.y(f(c)))
      ctx.restore()
    }
  }

  // Highlighted point (x, f(x)).
  if (d.dot > 0.01) drawDot(ctx, P.x(d.dotX), P.y(f(d.dotX)), 6 * d.dot, accent, d.dot)

  // Time cursor with a handle on the axis.
  if (d.cursorLine > 0.01) {
    const X = P.x(c)
    ctx.save()
    ctx.globalAlpha = d.cursorLine
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(X, fr.top)
    ctx.lineTo(X, fr.top + fr.height)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = d.cursorLine
    drawDot(ctx, X, P.y(f(c)), 4.5, bolt ? REAL : accent, 0.9)
    ctx.restore()
  }
  ctx.restore()

  if (d.cursorLine > 0.01) {
    ctx.save()
    ctx.globalAlpha = d.cursorLine
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(P.x(c), Math.min(P.y(0), fr.top + fr.height), 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  axisTitles(ctx, fr, d.xLabel, d.yLabel)
  if (d.road > 0.01) drawRoad(ctx, d, W, f, accent)
  if (d.track > 0.01) drawTrack(ctx, d, W)
}

function drawRoad(ctx: CanvasRenderingContext2D, d: Display, W: number, f: (x: number) => number, accent: string) {
  const x0 = 40
  const x1 = W - 22
  const y = 62
  ctx.save()
  ctx.globalAlpha = d.road
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.beginPath()
  ctx.roundRect(x0 - 14, y - 12, x1 - x0 + 28, 24, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(x0, y)
  ctx.lineTo(x1, y)
  ctx.stroke()
  ctx.setLineDash([])
  // Distance (signed) from 0 to the cursor: the area so far.
  const n = 60
  const c = d.cursor
  let s = 0
  for (let i = 0; i < n; i++) {
    const a = (c * i) / n
    const b = (c * (i + 1)) / n
    s += ((f(a) + 4 * f((a + b) / 2) + f(b)) / 6) * (b - a)
  }
  const X = x0 + (x1 - x0) * Math.min(1.05, Math.max(0, s / d.roadMax))
  const dir = f(c) < 0 ? -1 : 1
  ctx.translate(X, y - 2)
  ctx.scale(dir, 1)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.roundRect(-15, -6, 30, 10, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(-8, -12, 14, 8, 3)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillRect(12, -4, 3, 3)
  ctx.fillStyle = '#0b0d14'
  ctx.beginPath()
  ctx.arc(-8, 5, 3.4, 0, Math.PI * 2)
  ctx.arc(8, 5, 3.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTrack(ctx: CanvasRenderingContext2D, d: Display, W: number) {
  const x0 = 40
  const x1 = W - 22
  const y = 66
  ctx.save()
  ctx.globalAlpha = d.track
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x0, y + 8)
  ctx.lineTo(x1, y + 8)
  ctx.stroke()
  ctx.font = MATH_FONT
  ctx.textAlign = 'center'
  for (let m = 0; m <= 100; m += 10) {
    const X = x0 + ((x1 - x0) * m) / 100
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(X - 0.5, y + 4, 1, 8)
    if (m % 50 === 0) {
      ctx.fillStyle = INK.label
      ctx.fillText(`${m} m`, X, y + 24)
    }
  }
  const t = d.cursor
  const X = x0 + ((x1 - x0) * boltDistance(t)) / 100
  const v = BOLT_SEGMENTS.find((s) => t <= s.t1 && t >= s.t0)?.v ?? 0
  const g = ctx.createLinearGradient(X - v * 4, 0, X, 0)
  g.addColorStop(0, 'rgba(125,211,252,0)')
  g.addColorStop(1, 'rgba(125,211,252,0.6)')
  ctx.strokeStyle = g
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(X - v * 4, y)
  ctx.lineTo(X, y)
  ctx.stroke()
  drawDot(ctx, X, y, 5.5, REAL, 0.8)
  ctx.fillStyle = 'rgba(125,211,252,0.85)'
  ctx.fillText('Bolt', X, y - 12)
  ctx.restore()
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, alpha: number) {
  if (alpha < 0.02) return
  ctx.save()
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.font = MATH_FONT
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

function axisTitles(ctx: CanvasRenderingContext2D, f: Frame, x: string, y: string) {
  ctx.save()
  ctx.font = MATH_FONT
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(x, f.left + f.width, f.top + f.height - 4)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(y, f.left + 6, f.top + 2)
  ctx.restore()
}
