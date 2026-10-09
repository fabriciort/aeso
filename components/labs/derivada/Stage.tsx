'use client'

import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BOLT, boltPosition, boltSpeed, carPosition, carSpeed, msToKmh } from '@/lib/math/derivative'
import { fmt, toPx, type Frame, type Viewport } from '@/lib/math/view'
import { cn } from '@/lib/utils'
import { drawAxes, drawDot, drawFunction, INK, MATH_FONT, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import { Panel, type StageProps } from '../runtime'
import { CHALLENGES, cubicPosition, DEFAULTS, PROBLEMS, T0, type DerivLive } from './shared'

// The continuous Palco of "A velocidade de um instante".
//
// One graph that never cuts: the car's parabola is drawn as time runs, the
// secant shrinks into a tangent while the camera dives into the point,
// Bolt's real splits appear as he runs, the same tangent then slides along
// his curve and leaves the velocity graph behind it. Every frame eases the
// displayed scene toward the target of the current Etapa/Cena.

type CurveId = 'car' | 'bolt' | 'cubic' | 'abs' | 'line2'

const CURVES: Record<CurveId, { f: (x: number) => number; df: (x: number) => number; x: string; y: string }> = {
  car: { f: carPosition, df: carSpeed, x: 't (s)', y: 's (m)' },
  bolt: { f: boltPosition, df: boltSpeed, x: 't (s)', y: 's (m)' },
  cubic: { f: cubicPosition, df: (t) => 6 * t + 1, x: 't (s)', y: 's (m)' },
  abs: { f: Math.abs, df: (x) => Math.sign(x), x: 'x', y: 'y' },
  line2: { f: (t) => 2 * t, df: () => 2, x: 't (s)', y: 'v (m/s)' },
}
const CURVE_IDS = Object.keys(CURVES) as CurveId[]

const REAL = '#7dd3fc' // real data (Bolt)

interface Scene {
  view: Viewport
  curves: Record<CurveId, number>
  /** The curve P, the secant and the tangent live on. */
  on: CurveId
  /** Car curve drawn only up to this time. */
  upTo: number
  P: number
  h: number
  pA: number
  qA: number
  secant: number
  tangent: number
  triangle: number
  average: number
  halves: number
  dots: number
  road: number
  roadKind: 'car' | 'bolt'
  split: number
  vView: Viewport
  vOn: 'bolt' | 'car'
  vUpTo: number
  notebook: number
  race: boolean
  sweep: boolean
}

const VIEW_CAR: Viewport = { x0: -0.5, x1: 10.6, y0: -7, y1: 108 }
const VIEW_BOLT: Viewport = { x0: -0.3, x1: 10.3, y0: -7, y1: 108 }
const ASPECT = (VIEW_CAR.y1 - VIEW_CAR.y0) / (VIEW_CAR.x1 - VIEW_CAR.x0)

/** A window of width w around (x, y) with the car graph's proportions. */
function around(x: number, y: number, w: number, aspect = ASPECT): Viewport {
  return { x0: x - w / 2, x1: x + w / 2, y0: y - (w * aspect) / 2, y1: y + (w * aspect) / 2 }
}

interface Inputs {
  stepId: string
  scene: number
  live: DerivLive
  predicted: boolean
  solved: Record<string, number>
  eseAnswered: boolean
}

function target(p: Inputs): Scene {
  const zero = Object.fromEntries(CURVE_IDS.map((c) => [c, 0])) as Record<CurveId, number>
  const s: Scene = {
    view: VIEW_CAR,
    curves: { ...zero },
    on: 'car',
    upTo: 11,
    P: T0,
    h: 3,
    pA: 0,
    qA: 0,
    secant: 0,
    tangent: 0,
    triangle: 0,
    average: 0,
    halves: 0,
    dots: 0,
    road: 0,
    roadKind: 'car',
    split: 0,
    vView: { x0: -0.3, x1: 10.3, y0: -1.5, y1: 14 },
    vOn: 'bolt',
    vUpTo: 0,
    notebook: 0,
    race: false,
    sweep: false,
  }
  const { live } = p
  switch (p.stepId) {
    case 'imagine':
      s.road = 1
      s.curves.car = 1
      s.upTo = p.scene === 0 ? 0 : p.scene === 1 ? live.t : 11
      s.P = p.scene === 2 ? 10 : live.t
      s.pA = p.scene === 0 ? 0 : 1
      s.average = p.scene === 2 ? 1 : 0
      break
    case 'preveja':
      s.road = 1
      s.curves.car = 1
      s.P = T0
      s.pA = 1
      s.average = 1
      s.tangent = p.scene === 1 && p.predicted ? 1 : 0
      break
    case 'entenda': {
      s.curves.car = 1
      s.P = T0
      s.pA = 1
      const h = p.scene === 0 ? 3 : p.scene === 1 ? live.h : 0.0004
      s.h = h
      s.qA = p.scene <= 1 ? 1 : 0
      s.secant = p.scene <= 1 ? 1 : 0
      s.triangle = p.scene <= 1 ? 1 : 0
      s.tangent = p.scene >= 2 ? 1 : 0
      if (p.scene === 1) {
        const w = Math.max(2.6 * h, 0.012)
        const xm = T0 + h / 2
        s.view = h > 2 ? VIEW_CAR : around(xm, carPosition(xm), Math.min(w, 11.1))
      }
      if (p.scene === 3) s.view = around(T0, carPosition(T0), 0.06)
      break
    }
    case 'observe':
      s.road = 1
      s.roadKind = 'bolt'
      s.view = VIEW_BOLT
      s.on = 'bolt'
      s.dots = 1
      s.race = p.scene === 0
      s.curves.bolt = p.scene >= 1 ? 1 : 0
      s.P = live.tb
      s.pA = p.scene >= 1 ? 1 : 0
      s.tangent = p.scene >= 1 ? 1 : 0
      s.split = p.scene >= 2 ? 1 : 0
      s.vUpTo = live.tbMax
      break
    case 'resolva': {
      s.notebook = 1
      const prob = PROBLEMS[Math.min(p.scene, PROBLEMS.length - 1)]
      const done = p.solved[prob.id] ?? 0
      const complete = done >= prob.steps.length
      if (prob.id === 'p3') {
        s.on = 'cubic'
        s.curves.cubic = 1
        s.view = { x0: -0.25, x1: 3.4, y0: -4, y1: 40 }
        s.P = 2
        s.pA = 1
        s.h = complete ? 0.0004 : 0.8
        s.secant = complete ? 0 : 1
        s.qA = complete ? 0 : 1
        s.tangent = complete ? 1 : 0
      } else if (prob.id === 'p2') {
        s.curves.car = 1
        s.pA = 1
        s.sweep = true
        s.h = complete ? 0.0004 : 1.5
        s.secant = complete ? 0 : 1
        s.qA = complete ? 0 : 1
        s.tangent = complete ? 1 : 0
      } else {
        s.curves.car = 1
        s.P = T0
        s.pA = 1
        // The interval shrinks as the student simplifies, and closes at the limit.
        s.h = complete ? 0.0004 : [3, 2, 1, 0.5][done] ?? 0.5
        s.qA = complete ? 0 : 1
        s.secant = complete ? 0 : 1
        s.triangle = complete ? 0 : 1
        s.tangent = complete ? 1 : 0
      }
      break
    }
    case 'e-se': {
      const c = CHALLENGES[Math.min(p.scene, CHALLENGES.length - 1)]
      if (c.id === 'zero') {
        s.curves.car = 1
        s.road = 1
        s.view = { x0: -0.45, x1: 4.6, y0: -2.5, y1: 17 }
        s.P = 0
        s.pA = 1
        s.tangent = 1
        s.sweep = p.eseAnswered
      } else if (c.id === 'bico') {
        s.on = 'abs'
        s.curves.abs = 1
        s.view = p.eseAnswered ? { x0: -0.24, x1: 0.24, y0: -0.09, y1: 0.26 } : { x0: -2.4, x1: 2.4, y0: -0.9, y1: 2.6 }
        s.P = 0
        s.pA = 1
        s.halves = 1
      } else {
        s.on = 'line2'
        s.curves.line2 = 1
        s.view = { x0: -0.5, x1: 10.6, y0: -1.6, y1: 22 }
        s.P = T0
        s.h = 1
        s.pA = 1
        s.qA = 1
        s.triangle = p.eseAnswered ? 1 : 0.0
        s.tangent = 1
      }
      break
    }
    case 'conclua':
      s.curves.car = 1
      s.pA = 1
      s.tangent = 1
      s.sweep = true
      s.split = 1
      s.vOn = 'car'
      s.vView = { x0: -0.5, x1: 10.6, y0: -2, y1: 22 }
      s.vUpTo = 11
      break
  }
  return s
}

// ---------------------------------------------------------------- easing

interface Display extends Omit<Scene, 'view' | 'vView'> {
  view: { cx: number; cy: number; lw: number; lh: number }
  vView: { cx: number; cy: number; lw: number; lh: number }
  sweepT: number
}

const toLog = (v: Viewport) => ({ cx: (v.x0 + v.x1) / 2, cy: (v.y0 + v.y1) / 2, lw: Math.log(v.x1 - v.x0), lh: Math.log(v.y1 - v.y0) })
const fromLog = (d: Display['view']): Viewport => {
  const w = Math.exp(d.lw)
  const h = Math.exp(d.lh)
  return { x0: d.cx - w / 2, x1: d.cx + w / 2, y0: d.cy - h / 2, y1: d.cy + h / 2 }
}

function initial(s: Scene): Display {
  return { ...s, curves: { ...s.curves }, view: toLog(s.view), vView: toLog(s.vView), sweepT: 0 }
}

const SCALARS = ['upTo', 'P', 'pA', 'qA', 'secant', 'tangent', 'triangle', 'average', 'halves', 'dots', 'road', 'split', 'vUpTo', 'notebook'] as const

function ease(d: Display, s: Scene, k: number) {
  const L = (a: number, b: number) => a + (b - a) * k
  // Zooming: ease the window size on a log scale, so a dive from 10 s to
  // 0,01 s takes as long as a dive from 10 s to 1 s; the center follows a
  // little faster so the point stays in frame while the camera dives.
  const kc = Math.min(1, k * 1.6)
  for (const key of ['view', 'vView'] as const) {
    const t = toLog(s[key])
    d[key].cx += (t.cx - d[key].cx) * kc
    d[key].cy += (t.cy - d[key].cy) * kc
    d[key].lw = L(d[key].lw, t.lw)
    d[key].lh = L(d[key].lh, t.lh)
  }
  for (const c of CURVE_IDS) d.curves[c] = L(d.curves[c], s.curves[c])
  for (const key of SCALARS) d[key] = L(d[key], s[key])
  d.h = Math.exp(L(Math.log(d.h), Math.log(s.h)))
  d.on = s.on
  d.roadKind = s.roadKind
  d.vOn = s.vOn
  d.race = s.race
  d.sweep = s.sweep
}

// ---------------------------------------------------------------- Palco

export default function DerivadaStage({ stepId, scene, answers, live, setLive }: StageProps) {
  const L = { ...DEFAULTS, ...(live as Partial<DerivLive>) }
  const solved = (answers.solve as Record<string, number> | undefined) ?? {}
  const challenge = CHALLENGES[Math.min(scene, CHALLENGES.length - 1)]
  const eseAnswered = stepId === 'e-se' && (answers.challenges as Record<string, number | undefined> | undefined)?.[challenge.id] !== undefined
  const inputs: Inputs = { stepId, scene, live: L, predicted: answers.prediction !== undefined, solved, eseAnswered }
  const key = JSON.stringify(inputs)
  const tgt = useMemo(() => target(inputs), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Display | null>(null)
  const geo = useRef<{ view: Viewport; frame: Frame } | null>(null)
  const { ref, size, context } = useMathCanvas()

  useEffect(() => {
    if (!size.w) return
    const reduced = prefersReducedMotion()
    if (!disp.current) disp.current = initial(tgtRef.current)
    let raf = 0
    let last = performance.now()
    const raceStart = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const d = disp.current!
      const s = tgtRef.current
      ease(d, s, reduced ? 1 : 1 - Math.exp(-dt / 190))
      if (d.sweep) d.sweepT += dt / 1000
      else d.sweepT = 0
      const ctx = context()
      if (ctx) draw(ctx, d, size.w, size.h, now / 1000, ((now - raceStart) / 1000) % 12.5, geo)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h])

  const label = ariaLabel(stepId, scene, L)
  return (
    <Panel>
      <canvas ref={ref} role="img" aria-label={label} className="absolute inset-0 touch-none" />
      <StageInput stepId={stepId} scene={scene} geo={geo} live={L} setLive={setLive} />
      <Readout stepId={stepId} scene={scene} live={L} predicted={inputs.predicted} />
      <AnimatePresence>{stepId === 'resolva' && <Notebook key="nb" scene={scene} solved={solved} />}</AnimatePresence>
    </Panel>
  )
}

function ariaLabel(stepId: string, scene: number, l: DerivLive): string {
  switch (stepId) {
    case 'imagine':
      return `Gráfico da posição do carro: em ${fmt(l.t, 1)} s ele está a ${fmt(carPosition(l.t), 1)} m.`
    case 'entenda':
      return `Reta secante entre t = 5 e t = 5 + ${fmt(l.h, 3)}: velocidade média de ${fmt(10 + l.h, 3)} m/s.`
    case 'observe':
      return `Curva de Usain Bolt; tangente em ${fmt(l.tb, 2)} s: ${fmt(boltSpeed(l.tb), 1)} m/s.`
    default:
      return 'Gráfico de posição por tempo com retas secante e tangente.'
  }
}

// ---------------------------------------------------------------- input

/** Direct manipulation on the Palco (time scrub, shrinking h, tangent drag). */
function StageInput({
  stepId,
  scene,
  geo,
  live,
  setLive,
}: {
  stepId: string
  scene: number
  geo: React.RefObject<{ view: Viewport; frame: Frame } | null>
  live: DerivLive
  setLive: (patch: Partial<DerivLive>) => void
}) {
  const mode = stepId === 'imagine' && scene === 1 ? 'scrub' : stepId === 'entenda' && scene === 1 ? 'shrink' : stepId === 'observe' && scene >= 1 ? 'tangent' : null
  const lastX = useRef(0)
  if (!mode) return null
  const fromPx = (px: number) => {
    const g = geo.current
    return g ? toPx(g.view, g.frame).fromX(px) : 0
  }
  const apply = (e: React.PointerEvent, first: boolean) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const px = e.clientX - rect.left
    if (mode === 'scrub') setLive({ t: Math.min(10, Math.max(0, fromPx(px))) })
    else if (mode === 'tangent') {
      const tb = Math.min(9.58, Math.max(0.2, fromPx(px)))
      setLive({ tb, tbMax: Math.max(live.tbMax, tb) })
    } else if (!first) {
      const dx = px - lastX.current
      setLive({ h: Math.min(4.5, Math.max(0.0005, live.h * Math.exp(dx * 0.012))) })
    }
    lastX.current = px
  }
  return (
    <div
      className={cn('absolute inset-0 touch-none', mode === 'shrink' ? 'cursor-ew-resize' : 'cursor-crosshair')}
      onPointerDown={(e) => {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        apply(e, true)
      }}
      onPointerMove={(e) => e.buttons && apply(e, false)}
    />
  )
}

// ---------------------------------------------------------------- overlays

function Readout({ stepId, scene, live, predicted }: { stepId: string; scene: number; live: DerivLive; predicted: boolean }) {
  let content: React.ReactNode = null
  if (stepId === 'imagine' && scene >= 1) {
    const t = scene === 2 ? 10 : live.t
    content = (
      <>
        <Row k="t" v={`${fmt(t, 1)} s`} />
        <Row k="s" v={`${fmt(carPosition(t), 1)} m`} />
        {scene === 2 && <Row k="média" v="10 m/s" accent />}
      </>
    )
  } else if (stepId === 'preveja') {
    content = (
      <>
        <Row k="média 0 → 5 s" v="5 m/s" />
        {scene === 1 && predicted && <Row k="em t = 5 s" v="10 m/s" accent />}
      </>
    )
  } else if (stepId === 'entenda') {
    const h = scene === 0 ? 3 : live.h
    content =
      scene <= 1 ? (
        <>
          <Row k="h" v={`${fmt(h, h < 0.01 ? 4 : h < 0.1 ? 3 : 2)} s`} />
          <Row k={<Tex say="delta s sobre delta t">{'\\tfrac{\\Delta s}{\\Delta t}'}</Tex>} v={`${fmt(10 + h, h < 0.01 ? 4 : h < 0.1 ? 3 : 2)} m/s`} accent />
        </>
      ) : (
        <Row k="v(5)" v="10 m/s" accent />
      )
  } else if (stepId === 'observe' && scene >= 1) {
    const v = boltSpeed(live.tb)
    content = (
      <>
        <Row k="t" v={`${fmt(live.tb, 2)} s`} />
        <Row k="v" v={`${fmt(v, 1)} m/s`} accent />
        <Row k="" v={`${fmt(msToKmh(v), 0)} km/h`} />
      </>
    )
  } else if (stepId === 'observe') {
    content = <p className="text-[11px] leading-snug text-sky-200/80">Berlim, 2009 · tempos oficiais a cada 10 m</p>
  }
  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={`${stepId}-${scene >= 1 ? 1 : 0}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className={cn('pointer-events-none absolute right-3 min-w-[112px] space-y-0.5 rounded-2xl border border-white/[0.07] bg-[#06070c]/80 px-3 py-2 backdrop-blur-md', stepId === 'imagine' || stepId === 'preveja' || stepId === 'observe' ? 'top-[74px]' : 'top-3')}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ k, v, accent }: { k: React.ReactNode; v: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <span className="text-white/45">{k}</span>
      <span className={cn('font-mono tabular-nums', accent ? 'text-[#ff9fb2]' : 'text-white/85')}>{v}</span>
    </div>
  )
}

/** The caderno: the solution writes itself, one line per correct step. */
function Notebook({ scene, solved }: { scene: number; solved: Record<string, number> }) {
  const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
  const done = solved[prob.id] ?? 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="absolute inset-x-2 bottom-2 h-[40%] overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.035] px-3 py-2.5"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={prob.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex h-full flex-col">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">Caderno · problema {scene + 1} de {PROBLEMS.length}</p>
          <div className="mt-1 text-[15px] text-white/90">
            <Tex say={prob.titleSay}>{prob.title}</Tex>
          </div>
          <div className="mt-1 flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden text-[14px] text-white/80">
            {prob.steps.slice(0, done).map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn('overflow-x-auto [scrollbar-width:none]', i === done - 1 && 'text-white')}
              >
                <Tex say={st.lineSay}>{st.line}</Tex>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------- drawing

function draw(
  ctx: CanvasRenderingContext2D,
  d: Display,
  W: number,
  H: number,
  time: number,
  raceClock: number,
  geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>,
) {
  // Layout from the eased scalars: road strip on top, caderno at the bottom,
  // and the main graph sharing the middle with the velocity graph.
  const left = 40
  const right = 14
  const top = 14 + d.road * 56
  const bottom = H - 26 - d.notebook * (H * 0.4 + 6)
  const avail = Math.max(40, bottom - top)
  const mainH = avail * (1 - 0.47 * d.split)
  const frame: Frame = { left, top, width: W - left - right, height: mainH }
  const view = fromLog(d.view)
  geo.current = { view, frame }
  const c = CURVES[d.on]
  // Sweeping: the tangent glides along the curve (Resolva 2, Conclua); with
  // the road on (E se…? "zero"), the car pulls away instead.
  const onRoad = d.road > 0.5
  const P = d.sweep && !onRoad ? 5 + 4.3 * Math.sin(d.sweepT * 0.55 - Math.PI / 2) : d.P
  const Pt = d.sweep && onRoad ? 1.5 * (1 - Math.cos(d.sweepT * 0.9)) : P

  drawAxes(ctx, view, frame, { formatX: (x) => fmt(x, 3), formatY: (y) => fmt(y, 3), titles: { x: CURVES[d.on].x, y: CURVES[d.on].y } })

  // Bolt's real splits.
  if (d.dots > 0.01) {
    const p = toPx(view, frame)
    BOLT.times.forEach((t, i) => {
      if (i === 0) return
      const a = d.race ? Math.min(1, Math.max(0, (raceClock - t) * 5)) : 1
      if (a <= 0) return
      drawDot(ctx, p.x(t), p.y(BOLT.distances[i]), 3.6, REAL, a * d.dots)
    })
    if (d.race) {
      drawFunction(ctx, boltPosition, view, frame, { color: REAL, width: 1.5, alpha: 0.35 * d.dots, upTo: Math.min(raceClock, 9.58) })
    }
  }

  // Curves (cross-fading when the Etapa changes the function).
  for (const id of CURVE_IDS) {
    const a = d.curves[id]
    if (a < 0.01) continue
    drawFunction(ctx, CURVES[id].f, view, frame, { color: id === 'bolt' ? REAL : 'rgba(255,255,255,0.92)', width: 2.5, alpha: a, upTo: id === 'car' ? d.upTo : Infinity })
  }
  if (d.curves.bolt > 0.05) label(ctx, frame.left + frame.width - 4, frame.top + frame.height - 26, 'curva: modelo ajustado', REAL, d.curves.bolt * 0.8, 'right')

  const p = toPx(view, frame)
  const accent = '#ff6b8b'

  // Average from the start (the trap): from (0, s(0)) to P.
  if (d.average > 0.01) {
    ctx.save()
    ctx.setLineDash([5, 6])
    ctx.globalAlpha = d.average
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(p.x(0), p.y(c.f(0)))
    ctx.lineTo(p.x(P), p.y(c.f(P)))
    ctx.stroke()
    ctx.restore()
    const mx = (p.x(0) + p.x(P)) / 2
    const my = (p.y(c.f(0)) + p.y(c.f(P))) / 2
    // Whole trip: the chord runs above the curve, so the label sits above it.
    if (P >= 9.9) label(ctx, mx - 8, my - 12, 'média: 10 m/s', 'rgba(255,255,255,0.75)', d.average, 'right')
    else label(ctx, mx + 10, my + 16, 'média: 5 m/s', 'rgba(255,255,255,0.75)', d.average)
  }

  // Secant through P and Q = P + h.
  const Q = P + d.h
  const ms = (c.f(Q) - c.f(P)) / d.h
  if (d.secant > 0.01) line(ctx, view, frame, P, c.f(P), ms, 'rgba(255,255,255,0.7)', d.secant, 1.6)
  if (d.tangent > 0.01) line(ctx, view, frame, P, c.f(P), c.df(P), accent, d.tangent, 2.4)

  // Rise over run.
  if (d.triangle > 0.01) {
    const x0 = p.x(P)
    const x1 = p.x(Q)
    const y0 = p.y(c.f(P))
    const y1 = p.y(c.f(Q))
    if (Math.abs(x1 - x0) > 6) {
      ctx.save()
      ctx.globalAlpha = d.triangle
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
      ctx.restore()
      label(ctx, (x0 + x1) / 2, y0 + 14, 'Δt', 'rgba(255,255,255,0.7)', d.triangle, 'center')
      label(ctx, x1 + 6, (y0 + y1) / 2, 'Δs', 'rgba(255,255,255,0.7)', d.triangle)
    }
  }

  // Half-tangents at a corner (y = |x|).
  if (d.halves > 0.01 && d.curves.abs > 0.3) {
    line(ctx, view, frame, -0.0001, 0, -1, '#fbbf24', d.halves * 0.9, 2, 'left')
    line(ctx, view, frame, 0.0001, 0, 1, '#7dd3fc', d.halves * 0.9, 2, 'right')
    label(ctx, p.x(view.x0 + (view.x1 - view.x0) * 0.12), p.y((view.x1 - view.x0) * 0.32) - 8, 'inclinação −1', '#fbbf24', d.halves)
    label(ctx, p.x(view.x1 - (view.x1 - view.x0) * 0.12), p.y((view.x1 - view.x0) * 0.32) - 8, 'inclinação +1', '#7dd3fc', d.halves, 'right')
  }

  // Points.
  if (d.qA > 0.01 && Math.abs(p.x(Q) - p.x(P)) > 3) {
    drawDot(ctx, p.x(Q), p.y(c.f(Q)), 5, '#ffffff', d.qA)
    label(ctx, p.x(Q) + 8, p.y(c.f(Q)) - 8, d.on === 'car' && Math.abs(P - 5) < 0.01 ? '5 + h' : 'Q', 'rgba(255,255,255,0.85)', d.qA)
  }
  if (d.pA > 0.01) {
    const pulse = 0.6 + 0.4 * Math.sin(time * 3)
    drawDot(ctx, p.x(P), p.y(c.f(P)), 6, accent, d.pA * pulse)
  }

  // Road strip: the car leaving the light, or Bolt on the track.
  if (d.road > 0.01) drawRoad(ctx, d, W, Pt, raceClock)

  // Velocity graph: each slope becomes a point.
  if (d.split > 0.01) {
    const vf: Frame = { left, top: top + mainH + 22 * d.split, width: W - left - right, height: Math.max(10, avail - mainH - 22 * d.split) }
    const vv = fromLog(d.vView)
    ctx.save()
    ctx.globalAlpha = d.split
    drawAxes(ctx, vv, vf, { formatX: (x) => fmt(x), formatY: (y) => fmt(y), yStep: d.vOn === 'car' ? 10 : 4, titles: { x: 't (s)', y: 'v (m/s)' } })
    const vfn = d.vOn === 'car' ? carSpeed : boltSpeed
    drawFunction(ctx, vfn, vv, vf, { color: accent, width: 2.4, upTo: d.vOn === 'car' ? (d.sweep ? P : d.vUpTo) : d.vUpTo, glow: true })
    if (d.vOn === 'car' && d.sweep) drawFunction(ctx, vfn, vv, vf, { color: accent, width: 1.2, alpha: 0.25 })
    const pv = toPx(vv, vf)
    // A guide from the tangent point down to its velocity.
    ctx.strokeStyle = 'rgba(255,107,139,0.35)'
    ctx.setLineDash([2, 4])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p.x(P), p.y(c.f(P)) + 8)
    ctx.lineTo(pv.x(P), pv.y(vfn(P)) - 6)
    ctx.stroke()
    ctx.setLineDash([])
    drawDot(ctx, pv.x(P), pv.y(vfn(P)), 5, accent, 1)
    ctx.restore()
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, d: Display, W: number, carT: number, raceClock: number) {
  const a = d.road
  const x0 = 40
  const x1 = W - 22
  const y = 40
  ctx.save()
  ctx.globalAlpha = a
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x0, y + 10)
  ctx.lineTo(x1, y + 10)
  ctx.stroke()
  ctx.font = MATH_FONT
  ctx.fillStyle = INK.label
  ctx.textAlign = 'center'
  for (let m = 0; m <= 100; m += d.roadKind === 'bolt' ? 10 : 25) {
    const X = x0 + ((x1 - x0) * m) / 100
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(X - 0.5, y + 6, 1, 8)
    if (m % 50 === 0) {
      ctx.fillStyle = INK.label
      ctx.fillText(`${m} m`, X, y + 26)
    }
  }
  if (d.roadKind === 'car') {
    // Traffic light at the start.
    ctx.fillStyle = carT > 0.02 ? '#34d399' : '#f87171'
    ctx.beginPath()
    ctx.arc(x0 - 14, y + 2, 3.5, 0, Math.PI * 2)
    ctx.fill()
    const X = x0 + ((x1 - x0) * Math.min(100, carPosition(carT))) / 100
    drawCar(ctx, X, y + 2)
  } else {
    const t = d.race ? Math.min(raceClock, 9.58) : d.P
    const X = x0 + ((x1 - x0) * boltPosition(t)) / 100
    const v = boltSpeed(t)
    // A short motion trail, longer when faster.
    const g = ctx.createLinearGradient(X - v * 4, 0, X, 0)
    g.addColorStop(0, 'rgba(125,211,252,0)')
    g.addColorStop(1, 'rgba(125,211,252,0.6)')
    ctx.strokeStyle = g
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(X - v * 4, y + 2)
    ctx.lineTo(X, y + 2)
    ctx.stroke()
    drawDot(ctx, X, y + 2, 5.5, REAL, 0.8)
    ctx.fillStyle = 'rgba(125,211,252,0.85)'
    ctx.textAlign = 'center'
    ctx.fillText('Bolt', X, y - 12)
    if (d.race) {
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '500 12px ui-monospace, SFMono-Regular, monospace'
      ctx.fillText(`${fmt(Math.min(raceClock, 9.58), 2)} s`, x0, y - 22)
    }
  }
  ctx.restore()
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#ff6b8b'
  ctx.beginPath()
  ctx.roundRect(-15, -7, 30, 10, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(-8, -13, 15, 8, 3)
  ctx.fill()
  ctx.fillStyle = '#0b0d14'
  ctx.beginPath()
  ctx.arc(-8, 4, 3.6, 0, Math.PI * 2)
  ctx.arc(8, 4, 3.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** A line of slope m through (x, y), across the whole frame (or one side). */
function line(ctx: CanvasRenderingContext2D, v: Viewport, f: Frame, x: number, y: number, m: number, color: string, alpha: number, width: number, side?: 'left' | 'right') {
  const p = toPx(v, f)
  const xa = side === 'right' ? x : v.x0
  const xb = side === 'left' ? x : v.x1
  ctx.save()
  ctx.beginPath()
  ctx.rect(f.left, f.top, f.width, f.height)
  ctx.clip()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(p.x(xa), p.y(y + m * (xa - x)))
  ctx.lineTo(p.x(xb), p.y(y + m * (xb - x)))
  ctx.stroke()
  ctx.restore()
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, alpha: number, align: CanvasTextAlign = 'left') {
  if (alpha < 0.02) return
  ctx.save()
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.font = MATH_FONT
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}
