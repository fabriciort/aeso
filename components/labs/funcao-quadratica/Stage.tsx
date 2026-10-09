'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatNumber } from '@/lib/format'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import { easeFactor, equalAspect, fmt, lerpViewport, texNum, toPx, type Frame, type Viewport } from '@/lib/math/view'
import {
  BALL_RADIUS,
  BOARD_BOTTOM,
  BOARD_DX,
  BOARD_TOP,
  evaluate,
  FREE_THROW_DX,
  G_EARTH,
  G_MOON,
  ghosts,
  landing,
  lerpQuad,
  minSpeedAngle,
  position,
  rad,
  RELEASE_HEIGHT,
  RIM_HEIGHT,
  RIM_RADIUS,
  roots,
  shotOutcome,
  speedThrough,
  trajectory,
  velocity,
  vertex,
  vertexLocusB,
  type Launch,
  type Quad,
  type ShotOutcome,
} from '@/lib/math/quadratic'
import { drawArrow, drawAxes, drawDot, drawFunction, INK, MATH_FONT, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import DragSurface from '@/components/instruments/DragSurface'
import { Panel, type StageProps } from '../runtime'
import {
  AIM_DEFAULT,
  baseShot,
  currentStepIndex,
  DEG_MAX,
  DEG_MIN,
  launchOf,
  makeShot,
  PROBLEMS,
  RANGE_OPTIONS,
  RANGE_V,
  readShot,
  readSolve,
  roundedQuad,
  SHOT_TEXT,
  snapC,
  stepSolved,
  V_MAX,
  V_MIN,
  type QuadLive,
  type Show,
  type Shot,
} from './shared'

// The continuous Palco of "O arremesso perfeito".
//
// One world in meters, never cut: the free-throw court; the ball's trail of
// ghosts drawing a parabola; the court fading away until only the curve is
// left on a Cartesian plane (the same coefficients, so the same curve); the
// window sliding to h(t) for the worked problems; zooming out to the Moon.
// Every frame eases the displayed state toward the target of the current
// Etapa/Cena (positions, alphas, the curve's coefficients and the window).

const NUM_KEYS = [
  'padB', 'floor', 'player', 'hoop', 'dims', 'moon', 'axes', 'curveA', 'from', 'to', 'ghost', 'arrows', 'shadows',
  'vertex', 'roots', 'sym', 'locus', 'arms', 'armsW', 'level', 'levelH', 'dot', 'dotT', 'fan', 'fountain', 'earth',
  'range', 'tAxis', 'ball', 'past', 'ground', 'glow', 'aimA',
] as const
type Nums = Record<(typeof NUM_KEYS)[number], number>
interface Disp extends Nums {
  view: Viewport
  curve: Quad
}

type Fit = 'court' | 'equal' | 'free'

interface Target {
  d: Disp
  box: Viewport
  fit: Fit
  /** The throw whose ghosts are shown (when not flying). */
  ghostOf: { l: Launch; end: number } | null
  /** Faint second curves (fan of throws, the Earth's path…). */
  extra: { q: Quad; from: number; to: number; label?: string; at?: number }[]
  /** Resolva: marks drawn on h(t). */
  marks: { wrong: boolean; shows: Show[] }
  /** Court fit: share of the spare height that goes under the floor. */
  under: number
  /** Range challenge: landing markers. */
  landings: { x: number; label: string; best?: boolean }[]
}

const ACCENT_FALLBACK = '#ffb454'
const GOOD = '#6ee7b7'
const BAD = '#fda4af'
const SKY = '#7dd3fc'
const BIG = 60
const COURT_BOX: Viewport = { x0: -0.75, x1: 5.25, y0: -0.38, y1: 4.3 }

function zero(): Disp {
  const n = Object.fromEntries(NUM_KEYS.map((k) => [k, 0])) as Nums
  return { ...n, view: { ...COURT_BOX }, curve: { a: -0.3, b: 1.2, c: RELEASE_HEIGHT } }
}

interface Inputs {
  stepId: string
  scene: number
  last: Shot | null
  base: { v: number; deg: number }
  q: Quad
  coef: 'a' | 'b' | 'c'
  ftDeg: number
  rangeDeg: number
  solve: ReturnType<typeof readSolve>
  ese: Record<string, number | undefined>
  shown3: boolean
}

function target(p: Inputs): Target {
  const d = zero()
  const t: Target = { d, box: COURT_BOX, fit: 'court', ghostOf: null, extra: [], marks: { wrong: false, shows: [] }, landings: [], under: 0.33 }
  const court = (dims = 0) => {
    d.floor = 1
    d.player = 1
    d.hoop = 1
    d.dims = dims
  }
  const showThrow = (s: { v: number; deg: number }, alpha = 1) => {
    const l = launchOf(s)
    const out = shotOutcome(l)
    d.curve = trajectory(l)
    d.from = 0
    d.to = out.x
    d.curveA = alpha
    d.ghost = alpha
    t.ghostOf = { l, end: out.t }
  }

  switch (p.stepId) {
    case 'imagine': {
      court(p.scene === 0 ? 1 : 0.3)
      d.ball = 1
      d.aimA = p.scene >= 1 ? 1 : 0
      if (p.last) showThrow(p.last)
      else {
        d.curve = trajectory(launchOf(AIM_DEFAULT))
        d.to = 0
      }
      break
    }
    case 'preveja': {
      court(0)
      d.dims = 0
      showThrow(p.base)
      d.arrows = p.scene === 1 ? 1 : 0
      d.shadows = p.scene === 3 ? 1 : 0
      break
    }
    case 'entenda': {
      t.fit = 'equal'
      d.axes = 1
      d.floor = p.scene === 0 ? 0.35 : 0
      d.curveA = 1
      d.from = -BIG
      d.to = BIG
      d.curve = p.scene === 0 ? trajectory(launchOf(p.base)) : p.q
      d.ghost = p.scene === 0 ? 0.55 : 0
      if (p.scene === 0) t.ghostOf = { l: launchOf(p.base), end: shotOutcome(launchOf(p.base)).t }
      const q = d.curve
      const ok = Math.abs(q.a) > 0.02
      d.locus = p.scene === 2 && ok ? 1 : 0
      d.vertex = p.scene >= 2 && ok ? 1 : 0
      d.roots = p.scene >= 3 ? 1 : 0
      d.sym = p.scene >= 3 && ok ? 1 : 0
      d.ground = p.scene === 3 ? 1 : 0
      d.glow = p.scene === 4 ? 1 : 0
      // A window that keeps the vertex and the roots in view.
      const box = { x0: -3, x1: 7.5, y0: -2.6, y1: 5.6 }
      if (ok) {
        const v = vertex(q)
        const xs = [v.x, ...roots(q)].filter((x) => Math.abs(x) < 14)
        const ys = [v.y].filter((y) => Math.abs(y) < 12)
        for (const x of xs) {
          box.x0 = Math.min(box.x0, x - 1.2)
          box.x1 = Math.max(box.x1, x + 1.2)
        }
        for (const y of ys) {
          box.y0 = Math.min(box.y0, y - 1.2)
          box.y1 = Math.max(box.y1, y + 1.2)
        }
      }
      t.box = box
      break
    }
    case 'observe': {
      const dy = RIM_HEIGHT - RELEASE_HEIGHT
      if (p.scene <= 2) {
        court(p.scene === 0 ? 1 : 0.25)
        d.fan = p.scene <= 1 ? 1 : 0
        for (let deg = 35; deg <= 70; deg += 5) {
          const v = speedThrough(rad(deg), FREE_THROW_DX, dy, G_EARTH)
          t.extra.push({ q: trajectory({ v, theta: rad(deg), h0: RELEASE_HEIGHT, g: G_EARTH }), from: 0, to: FREE_THROW_DX })
        }
        const deg = p.scene === 0 ? 52 : p.scene === 2 ? (minSpeedAngle(FREE_THROW_DX, dy) * 180) / Math.PI : p.ftDeg
        const v = speedThrough(rad(deg), FREE_THROW_DX, dy, G_EARTH)
        d.curve = trajectory({ v, theta: rad(deg), h0: RELEASE_HEIGHT, g: G_EARTH })
        d.from = 0
        d.to = FREE_THROW_DX
        d.curveA = p.scene === 0 ? 0 : 1
        d.ball = 1
      } else {
        // A drinking-fountain jet: zoom in on a smaller parabola.
        d.floor = 1
        d.fountain = 1
        const jet = { v: 3.4, theta: rad(62), h0: 0.92, g: G_EARTH }
        d.curve = trajectory(jet)
        d.from = 0
        d.to = landing(jet).x
        d.curveA = 0.35
        t.box = { x0: -0.9, x1: 2.3, y0: -0.25, y1: 2.1 }
      }
      break
    }
    case 'medicao': {
      t.fit = 'free'
      d.axes = 1
      d.tAxis = 1
      d.padB = 92
      const pi = Math.min(p.scene, PROBLEMS.length - 1)
      const prob = PROBLEMS[pi]
      d.curve = prob.q
      d.from = 0
      d.to = BIG
      d.past = 1
      const k = currentStepIndex(p.solve, prob)
      const cur = prob.steps[k]
      const tries = cur ? (p.solve[cur.id] ?? []) : []
      const lastPick = cur && tries.length ? cur.options[tries[tries.length - 1]] : null
      const shows: Show[] = []
      prob.steps.forEach((s, i) => {
        if (i < k) {
          const right = s.options.find((o) => o.ok)
          if (right) shows.push(right.show)
        }
      })
      if (lastPick && !lastPick.ok) shows.push(lastPick.show)
      // Once solved, the roots speak for themselves: drop the arms.
      if (k >= prob.steps.length) for (let i = shows.length - 1; i >= 0; i--) if (shows[i].kind === 'arms') shows.splice(i, 1)
      t.marks = { wrong: Boolean(lastPick && !lastPick.ok), shows }
      // Problem 3 is solved alone: the curve stays hidden until it is.
      const solved = k >= prob.steps.length
      d.curveA = pi === 2 && !solved && !p.shown3 ? (t.marks.wrong ? 0.22 : 0) : 1
      d.past = d.curveA
      const box = pi === 2 ? { x0: -0.6, x1: 4.6, y0: -2.6, y1: 35 } : { x0: -0.75, x1: 2.85, y0: -1.3, y1: 11.6 }
      for (const s of shows) {
        if (s.kind === 'point') {
          d.dot = 1
          d.dotT = s.t
        } else if (s.kind === 'level') {
          d.level = 1
          d.levelH = s.h
          box.y1 = Math.max(box.y1, s.h * 1.3 + 1)
        } else if (s.kind === 'arms') {
          d.arms = 1
          d.armsW = s.w
        } else if (s.kind === 'sym') d.sym = 1
        else if (s.kind === 'roots') d.roots = 1
        else if (s.kind === 'ground') d.ground = 1
      }
      if (solved && pi === 1) d.roots = 1
      if (solved || (pi === 0 && k >= 2)) d.vertex = 1
      t.box = box
      break
    }
    case 'e-se': {
      if (p.scene === 0) {
        const answered = p.ese.moon !== undefined
        court(0)
        d.moon = answered ? 1 : 0
        d.hoop = answered ? 0.6 : 1
        const earth = launchOf(p.base)
        const moon = launchOf(p.base, G_MOON)
        t.extra.push({ q: trajectory(earth), from: 0, to: landing(earth).x, label: 'Terra', at: 2.2 })
        d.earth = answered ? 1 : 0
        d.curve = trajectory(answered ? moon : earth)
        d.from = 0
        d.to = answered ? landing(moon).x : landing(earth).x
        d.curveA = 1
        d.ball = 1
        if (answered) {
          const top = vertex(trajectory(moon))
          t.box = { x0: -2, x1: landing(moon).x + 2, y0: -1, y1: top.y + 2 }
        }
      } else {
        d.floor = 1
        d.ball = 1
        const answered = p.ese.range !== undefined
        const box = { x0: -1, x1: 12, y0: -0.5, y1: 6 }
        if (p.scene === 1) {
          d.range = answered ? 1 : 0
          RANGE_OPTIONS.forEach((deg) => {
            const l = { v: RANGE_V, theta: rad(deg), h0: 0, g: G_EARTH }
            const R = landing(l).x
            t.extra.push({ q: trajectory(l), from: 0, to: R })
            if (deg !== 30) t.landings.push({ x: R, label: deg === 60 ? '30° = 60°' : `${deg}°`, best: deg === 45 })
          })
          d.curve = trajectory({ v: RANGE_V, theta: rad(45), h0: 0, g: G_EARTH })
          d.from = 0
          d.to = (RANGE_V * RANGE_V) / G_EARTH
          d.curveA = answered ? 1 : 0
        } else {
          const l = { v: RANGE_V, theta: rad(p.rangeDeg), h0: 0, g: G_EARTH }
          const twin = { ...l, theta: rad(90 - p.rangeDeg) }
          d.curve = trajectory(l)
          d.from = 0
          d.to = landing(l).x
          d.curveA = 1
          d.range = 1
          if (Math.abs(p.rangeDeg - 45) > 0.5) t.extra.push({ q: trajectory(twin), from: 0, to: landing(twin).x, label: `${formatNumber(90 - p.rangeDeg, 0)}°`, at: landing(twin).x * 0.5 })
          t.landings.push({ x: landing(l).x, label: `${formatNumber(landing(l).x, 1)} m`, best: Math.abs(p.rangeDeg - 45) <= 0.5 })
          t.landings.push({ x: (RANGE_V * RANGE_V) / G_EARTH, label: '', best: true })
        }
        t.box = box
      }
      break
    }
    case 'conclua': {
      court(0)
      d.floor = 0.5
      d.player = 0.35
      d.hoop = 0.6
      d.axes = 0.5
      showThrow(p.base)
      d.vertex = 1
      d.glow = 1
      t.box = { x0: -1.6, x1: 5.6, y0: -0.38, y1: 7.2 }
      t.under = 0.08
      break
    }
  }
  return t
}

const COPY: (keyof Nums)[] = [...NUM_KEYS]

function easeDisp(cur: Disp, tgt: Disp, k: number, view: Viewport) {
  for (const key of COPY) cur[key] += (tgt[key] - cur[key]) * k
  cur.curve = lerpQuad(cur.curve, tgt.curve, k)
  cur.view = lerpViewport(cur.view, view, k)
}

/** Fits the box to the frame: equal scale on both axes, floor anchored at the bottom (court) or centered (graph). */
function fitView(box: Viewport, f: Frame, fit: Fit, under = 0.33): Viewport {
  if (fit === 'free' || !f.width || !f.height) return box
  if (fit === 'equal') return equalAspect(box, f)
  const s = Math.min(f.width / (box.x1 - box.x0), f.height / (box.y1 - box.y0))
  const w = f.width / s
  const cx = (box.x0 + box.x1) / 2
  // Spare height: a third goes under the floor (more court), the rest is sky.
  const spare = f.height / s - (box.y1 - box.y0)
  const y0 = box.y0 - spare * under
  return { x0: cx - w / 2, x1: cx + w / 2, y0, y1: y0 + f.height / s }
}

const frameOf = (w: number, h: number, padB: number): Frame => ({ left: 0, top: 0, width: w, height: Math.max(40, h - padB) })

interface Flight {
  l: Launch
  out: ShotOutcome
  start: number
  /** After the event: a short, simple motion (into the net, a bounce…). */
  after: { x: number; y: number; vx: number; vy: number }
  reported: boolean
}

function afterOf(l: Launch, o: ShotOutcome): Flight['after'] {
  const v = velocity(l, o.t)
  if (o.kind === 'cesta') return { x: o.x, y: o.y, vx: (FREE_THROW_DX - o.x) * 1.5, vy: -1.2 }
  if (o.kind === 'tabela') return { x: o.x, y: o.y, vx: -0.45 * v.vx, vy: 0.5 * v.vy }
  if (o.kind === 'aro') return { x: o.x, y: o.y, vx: 0.5 * v.vx * Math.sign(o.miss || 1), vy: 0.45 * Math.abs(v.vy) }
  return { x: o.x, y: BALL_RADIUS, vx: 0.6 * v.vx, vy: 0.4 * Math.abs(v.vy) }
}

const SETTLE = 0.9

export default function QuadStage({ lab, stepId, scene, answers, setAnswer, live, setLive }: StageProps) {
  const L = live as Partial<QuadLive>
  const accent = lab.accent || ACCENT_FALLBACK
  const aim = L.aim ?? AIM_DEFAULT
  const last = readShot(answers.lastShot)
  const base = baseShot(answers)
  const q = L.q ?? roundedQuad(answers)
  const solve = readSolve(answers)
  const ese = (answers.ese as Record<string, number | undefined> | undefined) ?? {}
  const inputs: Inputs = {
    stepId: stepId === 'resolva' ? 'medicao' : stepId,
    scene,
    last,
    base,
    q,
    coef: L.coef ?? 'a',
    ftDeg: L.ftDeg ?? 40,
    rangeDeg: L.rangeDeg ?? 30,
    solve,
    ese,
    shown3: Boolean(answers.shown3),
  }
  const key = JSON.stringify(inputs)
  const tgt = useMemo(() => target(JSON.parse(key) as Inputs), [key])

  const { ref, size, context } = useMathCanvas()
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Disp | null>(null)
  const flight = useRef<Flight | null>(null)
  const pull = useRef<{ x: number; y: number } | null>(null)
  const aimRef = useRef(aim)
  aimRef.current = aim
  const answersRef = useRef(answers)
  answersRef.current = answers
  const qRef = useRef(q)
  qRef.current = q
  const [toast, setToast] = useState<{ id: number; shot: Shot } | null>(null)
  const [canonT, setCanonT] = useState(0)
  const canonStart = useRef(0)

  const throwOn = stepId === 'imagine' && scene >= 1

  // ------------------------------------------------------------ throwing

  const launch = (a: { v: number; deg: number }) => {
    if (flight.current) return
    const l = launchOf(a)
    const out = shotOutcome(l)
    flight.current = { l, out, start: performance.now(), after: afterOf(l, out), reported: false }
    setLive({ flying: true })
    haptic(10)
  }
  const launchRef = useRef(launch)
  launchRef.current = launch

  const report = (f: Flight) => {
    f.reported = true
    const a = answersRef.current
    const shot = makeShot({ v: f.l.v, deg: (f.l.theta * 180) / Math.PI })
    setAnswer('lastShot', shot)
    setAnswer('shots', (typeof a.shots === 'number' ? a.shots : 0) + 1)
    if (shot.kind === 'cesta' && !readShot(a.goodShot)) setAnswer('goodShot', shot)
    haptic(shot.kind === 'cesta' ? [14, 60, 24] : 16)
    setToast({ id: Date.now(), shot })
  }
  const reportRef = useRef(report)
  reportRef.current = report

  // "Lançar" button and "Me mostre" in the Etapa bump live.fire.
  const fireSeen = useRef(L.fire ?? 0)
  useEffect(() => {
    const f = L.fire ?? 0
    if (f !== fireSeen.current) {
      fireSeen.current = f
      if (f > 0) launchRef.current(aimRef.current)
    }
  }, [L.fire])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  // Forma canônica: a build animation (x² → a·x² → shifted) on entry and on "Ver de novo".
  useEffect(() => {
    if (stepId !== 'entenda' || scene !== 4) return
    canonStart.current = performance.now()
    setCanonT(0)
  }, [stepId, scene, L.replay])

  // ------------------------------------------------------------ the loop

  const { w: W, h: H } = size
  useEffect(() => {
    if (!W || !H) return
    const reduced = prefersReducedMotion()
    let raf = 0
    let last = performance.now()
    let canonLast = -1

    const frame = (now: number) => {
      const dt = Math.min(now - last, 64)
      last = now
      const T = tgtRef.current
      const tframe = frameOf(W, H, T.d.padB)
      const tview = fitView(T.box, tframe, T.fit, T.under)
      if (!disp.current) disp.current = { ...T.d, view: tview, curve: { ...T.d.curve } }
      const g = disp.current
      easeDisp(g, T.d, reduced ? 1 : easeFactor(dt), tview)

      // Flight of the ball (overrides the trail while in the air).
      const f = flight.current
      let ball: { x: number; y: number } | null = null
      let ghostList: { x: number; y: number }[] = []
      let trailTo: number | null = null
      if (f) {
        const tau = reduced ? f.out.t + SETTLE : (now - f.start) / 1000
        const tt = Math.min(tau, f.out.t)
        ghostList = ghosts(f.l, 0.1, tt)
        trailTo = position(f.l, tt).x
        g.curve = trajectory(f.l)
        g.from = 0
        g.curveA = 1
        g.ghost = 1
        if (tau < f.out.t) ball = position(f.l, tau)
        else {
          if (!f.reported) reportRef.current(f)
          const s = tau - f.out.t
          const a = f.after
          ball = { x: a.x + a.vx * s, y: Math.max(BALL_RADIUS, a.y + a.vy * s - 0.5 * G_EARTH * s * s) }
          if (s >= SETTLE) {
            flight.current = null
            setLive({ flying: false })
          }
        }
      } else if (T.ghostOf) {
        ghostList = ghosts(T.ghostOf.l, 0.1, T.ghostOf.end)
      }
      if (trailTo !== null) g.to = trailTo

      // Forma canônica animation clock (0 → 1 over 3 s).
      if (stepId === 'entenda' && scene === 4) {
        const c = reduced ? 1 : Math.min(1, (now - canonStart.current) / 3000)
        if (Math.abs(c - canonLast) > 0.02 || (c === 1 && canonLast !== 1)) {
          canonLast = c
          setCanonT(c)
        }
      }

      const ctx = context()
      if (!ctx) {
        raf = requestAnimationFrame(frame)
        return
      }
      const fr = frameOf(W, H, g.padB)
      draw(ctx, g, T, fr, { W, H, accent, ball, ghostList, now, inputs: inputsRef.current, flying: Boolean(f), canon: canonRef.current, aim: aimRef.current })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H, accent, stepId, scene])

  const inputsRef = useRef(inputs)
  inputsRef.current = inputs
  const canonRef = useRef(canonT)
  canonRef.current = canonT

  // ------------------------------------------------------------ input

  const drag = useRef<{ kind: 'sling' | 'c' | 'v'; x0: number; y0: number } | null>(null)
  const handlesOn = stepId === 'entenda' && (scene === 2 || scene === 4)

  const toWorld = (px: number, py: number) => {
    const g = disp.current
    if (!g) return null
    const p = toPx(g.view, frameOf(W, H, g.padB))
    return { x: p.fromX(px), y: p.fromY(py), p }
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    if (throwOn) {
      if (flight.current) return
      e.currentTarget.setPointerCapture(e.pointerId)
      drag.current = { kind: 'sling', x0: e.clientX, y0: e.clientY }
      pull.current = { x: 0, y: 0 }
      return
    }
    if (handlesOn) {
      const w = toWorld(px, py)
      if (!w) return
      const cq = qRef.current
      const cands: { kind: 'c' | 'v'; x: number; y: number }[] = []
      if (Math.abs(cq.a) > 0.02) {
        const v = vertex(cq)
        cands.push({ kind: 'v', x: w.p.x(v.x), y: w.p.y(v.y) })
      }
      if (scene === 2) cands.push({ kind: 'c', x: w.p.x(0), y: w.p.y(cq.c) })
      let best: (typeof cands)[number] | null = null
      let bd = 34
      for (const c of cands) {
        const dd = Math.hypot(c.x - px, c.y - py)
        if (dd < bd) {
          bd = dd
          best = c
        }
      }
      if (best) {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { kind: best.kind, x0: px, y0: py }
        haptic(6)
      }
    }
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dg = drag.current
    if (!dg) return
    if (dg.kind === 'sling') {
      const px = e.clientX - dg.x0
      const py = e.clientY - dg.y0
      pull.current = { x: px, y: py }
      const len = Math.hypot(px, py)
      if (len < 6) return
      const deg = Math.min(DEG_MAX, Math.max(DEG_MIN, (Math.atan2(py, -px) * 180) / Math.PI))
      const v = Math.min(V_MAX, Math.max(V_MIN, V_MIN + (len / (0.42 * Math.min(W, H))) * (V_MAX - V_MIN)))
      setLive({ aim: { v: Math.round(v * 20) / 20, deg: Math.round(deg) } })
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const w = toWorld(e.clientX - r.left, e.clientY - r.top)
    if (!w) return
    const cq = qRef.current
    const r1 = (x: number) => Math.round(x * 10) / 10
    if (dg.kind === 'c') setLive({ q: { ...cq, c: Math.max(-3, Math.min(5, r1(w.y))) } })
    else if (scene === 2) setLive({ q: { ...cq, b: Math.max(-6, Math.min(6, r1(-2 * cq.a * w.x))) } })
    else {
      const h = r1(w.x)
      const k = r1(w.y)
      setLive({ q: { a: cq.a, b: Math.round(-2 * cq.a * h * 100) / 100, c: Math.round((cq.a * h * h + k) * 100) / 100 } })
    }
  }

  const onUp = () => {
    const dg = drag.current
    drag.current = null
    if (dg?.kind === 'sling') {
      const p = pull.current
      pull.current = null
      if (p && Math.hypot(p.x, p.y) > 14) launch(aimRef.current)
    }
  }

  const vDrag =
    stepId === 'entenda' && scene === 1
      ? { hint: 'Arraste para abrir, fechar ou virar', apply: (dy: number) => setLive({ q: { ...q, a: Math.max(-2, Math.min(2, Math.round((q.a - dy * 0.008) * 100) / 100)) } }) }
      : stepId === 'entenda' && scene === 3
        ? { hint: 'Arraste para subir ou descer', apply: (dy: number) => setLive({ q: snapC(q, q.c - dy * 0.012) }) }
        : stepId === 'observe' && scene === 1
          ? { hint: 'Arraste para mudar o ângulo', apply: (dy: number) => setLive({ ftDeg: Math.max(30, Math.min(75, (L.ftDeg ?? 40) - dy * 0.12)) }) }
          : stepId === 'e-se' && scene === 2
            ? { hint: 'Arraste para mudar o ângulo', apply: (dy: number) => setLive({ rangeDeg: Math.max(10, Math.min(80, (L.rangeDeg ?? 30) - dy * 0.15)) }) }
            : null

  // ------------------------------------------------------------ overlays

  const shots = typeof answers.shots === 'number' ? answers.shots : 0
  const v0 = vertex(q)
  const qTex = (c: Quad) => `y = ${texNum(c.a)}x^2 ${c.b < 0 ? '-' : '+'} ${texNum(Math.abs(c.b))}x ${c.c < 0 ? '-' : '+'} ${texNum(Math.abs(c.c))}`
  const qSay = (c: Quad) => `y igual a ${fmt(c.a)} x ao quadrado, mais ${fmt(c.b)} x, mais ${fmt(c.c)}`
  const baseQ = trajectory(launchOf(base))
  const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
  const dyFt = RIM_HEIGHT - RELEASE_HEIGHT
  const ftDeg = L.ftDeg ?? 40
  const bestFt = (minSpeedAngle(FREE_THROW_DX, dyFt) * 180) / Math.PI
  const ftQ = trajectory({ v: speedThrough(rad(scene === 2 ? bestFt : ftDeg), FREE_THROW_DX, dyFt, G_EARTH), theta: rad(scene === 2 ? bestFt : ftDeg), h0: RELEASE_HEIGHT, g: G_EARTH })
  const delta = q.b * q.b - 4 * q.a * q.c
  const nRoots = roots(q).length

  const badge: { key: string; node: React.ReactNode } | null =
    stepId === 'imagine' && scene >= 1
      ? {
          key: 'aim',
          node: (
            <span className="font-mono tabular-nums">
              θ {formatNumber(aim.deg, 0)}° · v {formatNumber(aim.v, 1)} m/s
            </span>
          ),
        }
      : stepId === 'entenda'
        ? {
            key: `q${scene === 0 ? 0 : 1}`,
            node: (
              <span className="block leading-tight">
                <Tex say={qSay(scene === 0 ? baseQ : q)}>{qTex(scene === 0 ? baseQ : q)}</Tex>
                {scene <= 1 && (
                  <span className="mt-1 block text-[11px] text-white/55">
                    na quadra: <Tex say="a igual a menos g sobre 2 v ao quadrado cosseno ao quadrado de teta">{'a = -\\frac{g}{2v^2\\cos^2\\theta}'}</Tex>
                  </span>
                )}
              </span>
            ),
          }
        : stepId === 'observe' && (scene === 1 || scene === 2)
          ? {
              key: `ft${scene}`,
              node: (
                <span className="block leading-tight">
                  <span className="font-mono tabular-nums">
                    θ {formatNumber(scene === 2 ? bestFt : ftDeg, scene === 2 ? 1 : 0)}° · v {formatNumber(speedThrough(rad(scene === 2 ? bestFt : ftDeg), FREE_THROW_DX, dyFt, G_EARTH), 2)} m/s
                  </span>
                  {scene === 2 && (
                    <span className="mt-1 block">
                      <Tex say={qSay(ftQ)}>{`y \\approx ${qTex(ftQ).slice(4)}`}</Tex>
                    </span>
                  )}
                </span>
              ),
            }
          : stepId === 'resolva'
            ? {
                key: `p${prob.id}`,
                node: (
                  <span className="block leading-tight">
                    <Tex say={prob.say}>{prob.tex}</Tex>
                    <span className="mt-1 block text-[11px] text-white/50">g ≈ 10 m/s² para facilitar a conta</span>
                  </span>
                ),
              }
            : stepId === 'e-se' && scene === 2
              ? {
                  key: 'range',
                  node: (
                    <span className="font-mono tabular-nums">
                      θ {formatNumber(L.rangeDeg ?? 30, 0)}° → {formatNumber(landing({ v: RANGE_V, theta: rad(L.rangeDeg ?? 30), h0: 0, g: G_EARTH }).x, 2)} m
                    </span>
                  ),
                }
              : null

  const chip =
    stepId === 'imagine' || stepId === 'preveja' || (stepId === 'observe' && scene < 3)
      ? 'g = 9,8 m/s² · sem ar'
      : stepId === 'e-se' && scene === 0
        ? ese.moon !== undefined
          ? 'Lua · g = 1,62 m/s² · sem ar'
          : 'Terra · g = 9,8 m/s²'
        : stepId === 'e-se'
          ? `v = ${formatNumber(RANGE_V, 0)} m/s (exemplo) · sem ar`
          : stepId === 'observe'
              ? 'Cada gota: uma bolinha lançada'
              : null

  // Entenda: Δ and the forma canônica.
  const deltaNode =
    stepId === 'entenda' && scene === 3 ? (
      <span className="block text-right leading-tight">
        <Tex say={`delta igual a ${fmt(delta)}`}>{`\\Delta = ${texNum(delta)}`}</Tex>
        <span className={cn('mt-1 block text-[12px]', nRoots === 2 ? 'text-white/70' : nRoots === 1 ? 'text-emerald-200' : 'text-rose-200')}>
          {nRoots === 2 ? 'Δ > 0 · toca o chão 2 vezes' : nRoots === 1 ? 'Δ = 0 · toca 1 vez' : 'Δ < 0 · não toca'}
        </span>
      </span>
    ) : null
  const canon =
    stepId === 'entenda' && scene === 4 && Math.abs(q.a) > 0.02 ? (
      <span className="block text-right leading-tight">
        <Tex say={`y igual a ${fmt(q.a)} vezes x menos ${fmt(v0.x)}, ao quadrado, mais ${fmt(v0.y)}`}>
          {`y = ${texNum(q.a)}\\,(x ${v0.x < 0 ? '+' : '-'} ${texNum(Math.abs(v0.x))})^2 ${v0.y < 0 ? '-' : '+'} ${texNum(Math.abs(v0.y))}`}
        </Tex>
        <span className="mt-1 block text-[11px] text-white/50">{canonT < 0.34 ? 'parte de y = x²' : canonT < 0.67 ? `estica por a = ${fmt(q.a)}` : `desloca até o vértice (${fmt(v0.x, 1)}; ${fmt(v0.y, 1)})`}</span>
      </span>
    ) : null

  // Resolva: the notebook that writes itself.
  const notes = stepId === 'resolva' ? prob.steps.filter((s) => stepSolved(solve, s) || (prob.id === 'p3' && answers.shown3)) : []

  const aria =
    stepId === 'imagine'
      ? `Quadra de basquete de lado: aro a 3,05 metros de altura e 4,225 metros à frente. Mira: ${formatNumber(aim.deg, 0)} graus, ${formatNumber(aim.v, 1)} metros por segundo.${last ? ` Último lance: ${SHOT_TEXT[last.kind]}.` : ''}`
      : stepId === 'preveja'
        ? 'O rastro da bola: fantasmas a cada 0,1 segundo formando uma parábola.'
        : stepId === 'entenda'
          ? `Gráfico da parábola y = ${fmt(q.a)} x² + ${fmt(q.b)} x + ${fmt(q.c)}, vértice em (${fmt(v0.x)}; ${fmt(v0.y)}), ${nRoots} raízes.`
          : stepId === 'observe'
            ? scene < 3
              ? 'Parábolas que ligam a mão ao aro num lance livre.'
              : 'Jato de água de um bebedouro em forma de parábola.'
            : stepId === 'resolva'
              ? `Gráfico de ${prob.say}.`
              : stepId === 'e-se'
                ? scene === 0
                  ? 'O mesmo arremesso na Terra e na Lua.'
                  : 'Lançamentos do chão com ângulos diferentes e onde cada um cai.'
                : 'A parábola do seu arremesso, com o vértice marcado.'

  return (
    <Panel>
      <div
        className={cn('absolute inset-0', throwOn && 'cursor-grab active:cursor-grabbing')}
        style={{ touchAction: throwOn || handlesOn ? 'none' : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={ref} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>
      {vDrag && <DragSurface key={`${stepId}-${scene}`} hint={vDrag.hint} onDrag={vDrag.apply} />}

      <AnimatePresence>
        {throwOn && shots === 0 && !L.flying && (
          <motion.div
            key="sling-hint"
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%', transition: { delay: 0.8 } }}
            exit={{ opacity: 0, x: '-50%' }}
            className="pointer-events-none absolute bottom-10 left-1/2 z-10 whitespace-nowrap rounded-full bg-black/60 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur-xl"
          >
            Puxe para trás e solte ↙
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {badge && (
          <motion.div
            key={badge.key}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] rounded-2xl bg-black/50 px-3 py-2 text-[13px] text-white/90 backdrop-blur-xl"
          >
            {badge.node}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chip && (
          <motion.div
            key={chip}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'pointer-events-none absolute right-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/55 backdrop-blur-xl',
              badge && stepId !== 'imagine' ? 'bottom-3' : 'top-3',
            )}
          >
            {chip}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(deltaNode || canon) && (
          <motion.div
            key={deltaNode ? 'delta' : 'canon'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn('pointer-events-none absolute right-3 z-10 rounded-2xl bg-black/55 px-3 py-2 text-[13.5px] text-white/90 backdrop-blur-xl', deltaNode ? 'top-[60px]' : 'bottom-3')}
          >
            {deltaNode ?? canon}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -6, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={cn(
              'pointer-events-none absolute left-1/2 top-[18%] z-20 whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-semibold backdrop-blur-xl',
              toast.shot.kind === 'cesta' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-black/60 text-white/90',
            )}
          >
            {SHOT_TEXT[toast.shot.kind]}
            {(toast.shot.kind === 'curto' || toast.shot.kind === 'longo') && Number.isFinite(toast.shot.miss) && (
              <span className="ml-2 font-mono text-[13px] font-normal text-white/60">
                {formatNumber(Math.abs(toast.shot.miss) * 100, 0)} cm {toast.shot.miss < 0 ? 'antes' : 'depois'}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stepId === 'resolva' && (
          <motion.div
            key="notebook"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-3 bottom-3 z-10 flex h-[78px] flex-col justify-end gap-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
            aria-label="Caderno"
          >
            {notes.length === 0 && <p className="text-[12px] text-white/35">Caderno: cada passo certo aparece aqui.</p>}
            <AnimatePresence initial={false}>
              {notes.slice(-2).map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="text-[14px] text-white/85"
                >
                  <Tex say={s.note.say}>{s.note.tex}</Tex>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stepId === 'conclua' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.9, duration: 0.6 } }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-3 top-3 z-10 space-y-1.5 rounded-2xl bg-black/50 px-3 py-2.5 text-[13.5px] text-white/90 backdrop-blur-xl"
          >
            <Tex block say="y igual a a x ao quadrado mais b x mais c">{'y = ax^2 + bx + c'}</Tex>
            <Tex block say="x do vértice igual a menos b sobre 2 a">{'x_v = -\\frac{b}{2a}'}</Tex>
            <Tex block say="x igual a menos b mais ou menos raiz de delta, sobre 2 a">{'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}'}</Tex>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}

// ------------------------------------------------------------------ drawing

interface DrawCtx {
  W: number
  H: number
  accent: string
  ball: { x: number; y: number } | null
  ghostList: { x: number; y: number }[]
  now: number
  inputs: Inputs
  flying: boolean
  canon: number
  aim: { v: number; deg: number }
}

function draw(ctx: CanvasRenderingContext2D, g: Disp, T: Target, f: Frame, c: DrawCtx) {
  const v = g.view
  const p = toPx(v, f)
  const m = p.sx // pixels per meter (x)
  const { accent, inputs } = c

  // Moon tint of the sky.
  if (g.moon > 0.01) {
    const grad = ctx.createLinearGradient(0, 0, 0, f.height)
    grad.addColorStop(0, `rgba(20,24,40,${0.5 * g.moon})`)
    grad.addColorStop(1, `rgba(6,7,12,0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, c.W, c.H)
  }

  // Axes (graph mode).
  if (g.axes > 0.01) {
    drawAxes(ctx, v, f, { alpha: g.axes, formatX: (x) => fmt(x, 1), formatY: (y) => fmt(y, 1) })
    ctx.save()
    ctx.globalAlpha = g.axes
    ctx.font = MATH_FONT
    ctx.fillStyle = INK.label
    const ax = Math.min(Math.max(p.y(0), f.top + 12), f.top + f.height - 16)
    const ay = Math.min(Math.max(p.x(0), f.left + 4), f.left + f.width - 40)
    ctx.textAlign = 'right'
    ctx.fillText(g.tAxis > 0.5 ? 't (s)' : 'x (m)', f.left + f.width - 6, ax - 8)
    ctx.textAlign = 'left'
    ctx.fillText(g.tAxis > 0.5 ? 'h (m)' : 'y (m)', ay + 6, f.top + 14)
    ctx.restore()
  }

  // Floor (and the Moon's grey dust).
  if (g.floor > 0.01) {
    const Y = p.y(0)
    const grad = ctx.createLinearGradient(0, Y, 0, c.H)
    const wood = [255, 180, 84]
    const dust = [150, 155, 170]
    const col = wood.map((w, i) => Math.round(w + (dust[i] - w) * g.moon))
    grad.addColorStop(0, `rgba(${col.join(',')},${0.13 * g.floor})`)
    grad.addColorStop(1, `rgba(${col.join(',')},${0.02 * g.floor})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, Y, c.W, c.H - Y)
    ctx.strokeStyle = `rgba(255,255,255,${0.28 * g.floor})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, Math.round(Y) + 0.5)
    ctx.lineTo(c.W, Math.round(Y) + 0.5)
    ctx.stroke()
  }

  if (g.dims > 0.01) drawDims(ctx, p, g.dims)
  if (g.hoop > 0.01) drawHoop(ctx, p, g.hoop, c.now, c.flying)
  if (g.player > 0.01) drawPlayer(ctx, p, g.player)
  if (g.fountain > 0.01) drawFountain(ctx, p, g.fountain, c.now, accent)

  // Fan of free throws through the hand and the ring.
  if (g.fan > 0.01) for (const e of T.extra) drawFunction(ctx, (x) => evaluate(e.q, x), v, f, { color: 'rgba(255,255,255,0.9)', width: 1.2, alpha: 0.16 * g.fan, from: e.from, upTo: e.to })

  // The Earth's path next to the Moon's, the range fan, the twin angle.
  if (inputs.stepId === 'e-se') {
    for (const e of T.extra) {
      const al = inputs.scene === 0 ? 0.35 * g.earth + (1 - g.earth) * 0 : inputs.scene === 1 ? 0.45 * g.range : 0.3
      if (al < 0.01) continue
      drawFunction(ctx, (x) => evaluate(e.q, x), v, f, { color: '#ffffff', width: 1.5, alpha: al, dash: [4, 5], from: e.from, upTo: e.to })
      if (e.label && e.at !== undefined) label(ctx, p.x(e.at), p.y(evaluate(e.q, e.at)) - 10, e.label, `rgba(255,255,255,${al + 0.2})`, 'center')
    }
    const lal = inputs.scene === 1 ? g.range : inputs.scene === 2 ? 1 : 0
    if (lal > 0.01)
      for (const l of T.landings) {
        drawDot(ctx, p.x(l.x), p.y(0), l.best ? 4.5 : 3.5, l.best ? GOOD : 'rgba(255,255,255,0.7)', l.best ? 0.6 : 0)
        if (l.label) label(ctx, p.x(l.x), p.y(0) + 16, l.label, l.best ? GOOD : 'rgba(255,255,255,0.7)', 'center', lal)
      }
  }

  // Resolva marks (under the curve).
  if (inputs.stepId === 'medicao') drawMarks(ctx, g, T, p, f, accent)

  // The vertex locus (when only b changes).
  if (g.locus > 0.01) drawFunction(ctx, (x) => vertexLocusB(g.curve, x), v, f, { color: SKY, width: 1.3, alpha: 0.5 * g.locus, dash: [3, 5] })

  // Forma canônica: the parent curve y = x² stretched and moved.
  if (inputs.stepId === 'entenda' && inputs.scene === 4 && Math.abs(g.curve.a) > 0.02) drawCanon(ctx, g, p, f, c.canon)

  // Earlier part of h(t) (t < 0): math, not physics.
  if (g.past > 0.01) drawFunction(ctx, (x) => evaluate(g.curve, x), v, f, { color: accent, width: 1.6, alpha: 0.3 * g.past, dash: [4, 6], from: -BIG, upTo: 0 })

  // THE curve.
  if (g.curveA > 0.01)
    drawFunction(ctx, (x) => evaluate(g.curve, x), v, f, { color: accent, width: 2.6, alpha: g.curveA, from: Math.max(g.from, v.x0 - 1), upTo: Math.min(g.to, v.x1 + 1), glow: g.glow > 0.5 })

  // Symmetry axis, roots and vertex (from the displayed curve, so they glide).
  const q = g.curve
  const hasV = Math.abs(q.a) > 0.02
  if (hasV && g.sym > 0.01 && inputs.stepId === 'entenda') {
    const vx = p.x(vertex(q).x)
    ctx.save()
    ctx.setLineDash([4, 5])
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * g.sym})`
    ctx.beginPath()
    ctx.moveTo(vx, f.top)
    ctx.lineTo(vx, f.top + f.height)
    ctx.stroke()
    ctx.restore()
  }
  if (g.ground > 0.01 && inputs.stepId === 'entenda') {
    ctx.save()
    ctx.globalAlpha = g.ground
    ctx.strokeStyle = SKY
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(f.left, p.y(0))
    ctx.lineTo(f.left + f.width, p.y(0))
    ctx.stroke()
    label(ctx, f.left + 8, p.y(0) - 8, 'chão: y = 0', SKY, 'left', g.ground)
    ctx.restore()
  }
  if (g.roots > 0.01) {
    for (const r of roots(q)) {
      if (r < v.x0 || r > v.x1) continue
      drawDot(ctx, p.x(r), p.y(0), 4.5, inputs.stepId === 'medicao' && r < 0 ? 'rgba(255,255,255,0.5)' : SKY, 0.7 * g.roots)
      if (inputs.stepId !== 'medicao') label(ctx, p.x(r), p.y(0) + 16, fmt(r, 2), SKY, 'center', g.roots)
    }
  }
  if (hasV && g.vertex > 0.01) {
    const vv = vertex(q)
    const X = p.x(vv.x)
    const Y = p.y(vv.y)
    drawDot(ctx, X, Y, 5, '#ffffff', 0.9 * g.vertex)
    const txt = inputs.stepId === 'medicao' ? `topo (${fmt(vv.x, 2)} s; ${fmt(vv.y, 2)} m)` : `vértice (${fmt(vv.x, 1)}; ${fmt(vv.y, 1)})`
    if (inputs.stepId === 'entenda') label(ctx, X + 18, Y + (q.a < 0 ? -12 : 12), txt, 'rgba(255,255,255,0.9)', 'left', g.vertex)
    else label(ctx, X, Y - 14, txt, 'rgba(255,255,255,0.9)', 'center', g.vertex)
  }
  // Draggable handles (Entenda): vertex and (0, c).
  if (inputs.stepId === 'entenda' && (inputs.scene === 2 || inputs.scene === 4)) {
    const pulse = 1 + 0.12 * Math.sin(c.now / 260)
    if (hasV) ring(ctx, p.x(vertex(q).x), p.y(vertex(q).y), 13 * pulse, '#ffffff')
    if (inputs.scene === 2) {
      drawDot(ctx, p.x(0), p.y(q.c), 5, SKY, 0.8)
      ring(ctx, p.x(0), p.y(q.c), 13 * pulse, SKY)
      label(ctx, p.x(0) - 16, p.y(q.c), `c = ${fmt(q.c, 1)}`, SKY, 'right')
    }
  }

  // Ghosts every 0.1 s.
  if (g.ghost > 0.01 && c.ghostList.length) {
    const r = Math.max(3, BALL_RADIUS * m)
    c.ghostList.forEach((pt, i) => {
      const X = p.x(pt.x)
      const Y = p.y(pt.y)
      ctx.save()
      ctx.globalAlpha = g.ghost * (0.35 + 0.35 * (i / Math.max(1, c.ghostList.length - 1)))
      ctx.fillStyle = 'rgba(232,131,58,0.22)'
      ctx.strokeStyle = 'rgba(255,190,120,0.75)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(X, Y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })
    if (g.shadows > 0.01) drawShadows(ctx, p, c.ghostList, g.shadows)
    if (g.arrows > 0.01 && T.ghostOf) drawVelocity(ctx, p, T.ghostOf.l, c.ghostList, g.arrows)
  }

  // The ball (in the hand, flying or settling).
  if (c.ball) drawBall(ctx, p.x(c.ball.x), p.y(c.ball.y), BALL_RADIUS * m, c.now)
  else if (g.ball > 0.01) {
    const at = inputs.stepId === 'e-se' && inputs.scene > 0 ? { x: 0, y: BALL_RADIUS } : { x: 0.02, y: RELEASE_HEIGHT }
    ctx.save()
    ctx.globalAlpha = g.ball
    drawBall(ctx, p.x(at.x), p.y(at.y), BALL_RADIUS * m, c.now)
    ctx.restore()
  }

  // Aim: an arrow from the hand (direction = angle, length = speed) and a few dots of preview.
  if (g.aimA > 0.01 && !c.flying && inputs.stepId === 'imagine') {
    drawAim(ctx, p, c.aim, g.aimA)
  }
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, align: CanvasTextAlign = 'center', alpha = 1) {
  if (alpha < 0.02) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = MATH_FONT
  // Keep the whole label inside the canvas (no numbers cut at the edge).
  const w = ctx.measureText(text).width
  const W = ctx.canvas.clientWidth || ctx.canvas.width
  const left = align === 'center' ? x - w / 2 : align === 'right' || align === 'end' ? x - w : x
  const shift = Math.min(0, W - 6 - (left + w)) + Math.max(0, 6 - left)
  x += shift
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(6,7,12,0.85)'
  ctx.strokeText(text, x, y)
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

type P = ReturnType<typeof toPx>

function drawBall(ctx: CanvasRenderingContext2D, X: number, Y: number, r: number, now: number) {
  const R = Math.max(4, r)
  const g = ctx.createRadialGradient(X - R * 0.35, Y - R * 0.35, R * 0.1, X, Y, R)
  g.addColorStop(0, '#ffb877')
  g.addColorStop(0.7, '#e8833a')
  g.addColorStop(1, '#a24e17')
  ctx.save()
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(X, Y, R, 0, Math.PI * 2)
  ctx.fill()
  // Seams.
  ctx.strokeStyle = 'rgba(40,16,4,0.6)'
  ctx.lineWidth = Math.max(0.8, R * 0.09)
  const rot = now / 400
  ctx.beginPath()
  ctx.moveTo(X + Math.cos(rot) * R, Y + Math.sin(rot) * R)
  ctx.lineTo(X - Math.cos(rot) * R, Y - Math.sin(rot) * R)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(X, Y, R, R * 0.45, rot + Math.PI / 2, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: P, a: number) {
  const m = p.sx
  ctx.save()
  ctx.globalAlpha = a
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(3, 0.1 * m)
  const P2 = (x: number, y: number): [number, number] => [p.x(x), p.y(y)]
  const line = (pts: [number, number][]) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.stroke()
  }
  line([P2(-0.42, 0.02), P2(-0.33, 0.48), P2(-0.3, 0.92)]) // back leg
  line([P2(-0.18, 0.02), P2(-0.24, 0.48), P2(-0.27, 0.92)]) // front leg
  ctx.lineWidth = Math.max(4, 0.16 * m)
  line([P2(-0.28, 0.95), P2(-0.25, 1.42)]) // torso
  ctx.lineWidth = Math.max(2.5, 0.075 * m)
  line([P2(-0.22, 1.4), P2(-0.12, 1.74), P2(-0.02, RELEASE_HEIGHT - 0.1)]) // shooting arm
  line([P2(-0.28, 1.38), P2(-0.16, 1.62), P2(-0.06, RELEASE_HEIGHT - 0.2)]) // guide arm
  ctx.beginPath()
  ctx.arc(p.x(-0.26), p.y(1.6), Math.max(4, 0.11 * m), 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawHoop(ctx: CanvasRenderingContext2D, p: P, a: number, now: number, flying: boolean) {
  const m = p.sx
  ctx.save()
  ctx.globalAlpha = a
  // Stanchion: arm from the back of the board to a post, then down.
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = Math.max(2, 0.08 * m)
  ctx.beginPath()
  ctx.moveTo(p.x(BOARD_DX + 0.05), p.y(3.3))
  ctx.lineTo(p.x(BOARD_DX + 1.0), p.y(3.3))
  ctx.lineTo(p.x(BOARD_DX + 1.0), p.y(0))
  ctx.stroke()
  // Backboard (side view: a thin slab).
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillRect(p.x(BOARD_DX), p.y(BOARD_TOP), Math.max(2, 0.05 * m), p.y(BOARD_BOTTOM) - p.y(BOARD_TOP))
  // Net.
  const sway = flying ? 0 : Math.sin(now / 700) * 0.008
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 1
  const top = RIM_HEIGHT
  const bot = RIM_HEIGHT - 0.42
  ctx.beginPath()
  for (let i = 0; i <= 4; i++) {
    const s = i / 4
    const xt = FREE_THROW_DX - RIM_RADIUS + 2 * RIM_RADIUS * s
    const xb = FREE_THROW_DX - 0.13 + 0.26 * s + sway
    ctx.moveTo(p.x(xt), p.y(top))
    ctx.lineTo(p.x(xb), p.y(bot))
  }
  for (let j = 1; j <= 2; j++) {
    const yy = top - (0.42 * j) / 3
    const w = RIM_RADIUS - ((RIM_RADIUS - 0.13) * j) / 3
    ctx.moveTo(p.x(FREE_THROW_DX - w), p.y(yy))
    ctx.lineTo(p.x(FREE_THROW_DX + w), p.y(yy))
  }
  ctx.stroke()
  // Ring.
  ctx.strokeStyle = '#ff6b3d'
  ctx.lineWidth = Math.max(2.5, 0.04 * m)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(p.x(FREE_THROW_DX - RIM_RADIUS), p.y(RIM_HEIGHT))
  ctx.lineTo(p.x(BOARD_DX), p.y(RIM_HEIGHT))
  ctx.stroke()
  ctx.restore()
}

function drawDims(ctx: CanvasRenderingContext2D, p: P, a: number) {
  ctx.save()
  ctx.globalAlpha = a
  const col = 'rgba(125,211,252,0.85)'
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = col
  ctx.lineWidth = 1
  // Horizontal: line → ring centre, just above the floor.
  const yh = p.y(0) - 10
  ctx.beginPath()
  ctx.moveTo(p.x(0), yh)
  ctx.lineTo(p.x(FREE_THROW_DX), yh)
  // Vertical: floor → ring, beside the net.
  const xv = p.x(FREE_THROW_DX - 0.62)
  ctx.moveTo(xv, p.y(0))
  ctx.lineTo(xv, p.y(RIM_HEIGHT))
  ctx.moveTo(xv - 4, p.y(RIM_HEIGHT))
  ctx.lineTo(p.x(FREE_THROW_DX), p.y(RIM_HEIGHT))
  ctx.stroke()
  ctx.setLineDash([])
  // Free-throw line mark.
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(p.x(0), p.y(0) - 3)
  ctx.lineTo(p.x(0), p.y(0) + 3)
  ctx.stroke()
  ctx.restore()
  label(ctx, (p.x(0) + p.x(FREE_THROW_DX)) / 2, yh - 10, '4,225 m', col, 'center', a)
  label(ctx, xv - 6, (p.y(0) + p.y(RIM_HEIGHT)) / 2, '3,05 m', col, 'right', a)
  label(ctx, Math.max(6, p.x(0) - 30), p.y(0) + 14, 'linha de lance livre', 'rgba(255,255,255,0.55)', 'left', a)
}

function drawFountain(ctx: CanvasRenderingContext2D, p: P, a: number, now: number, accent: string) {
  const m = p.sx
  ctx.save()
  ctx.globalAlpha = a
  // Pedestal and nozzle.
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(p.x(-0.35), p.y(0.86), 0.3 * m, p.y(0) - p.y(0.86))
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillRect(p.x(-0.45), p.y(0.9), 0.5 * m, Math.max(3, 0.05 * m))
  ctx.fillRect(p.x(-0.04), p.y(0.95), Math.max(3, 0.05 * m), Math.max(3, 0.05 * m))
  // Drops: each one is a little launched ball.
  const jet: Launch = { v: 3.4, theta: rad(62), h0: 0.92, g: G_EARTH }
  const tl = landing(jet).t
  const N = 46
  for (let i = 0; i < N; i++) {
    const t = ((now / 1000 + (i / N) * tl) % tl) + 0
    const pos = position(jet, t)
    const jitter = Math.sin(i * 12.9898) * 0.01
    drawDot(ctx, p.x(pos.x + jitter), p.y(pos.y), Math.max(1.6, 0.022 * m), i % 3 ? SKY : accent, 0)
  }
  ctx.restore()
}

function drawShadows(ctx: CanvasRenderingContext2D, p: P, list: { x: number; y: number }[], a: number) {
  ctx.save()
  ctx.globalAlpha = a
  ctx.setLineDash([2, 4])
  ctx.strokeStyle = 'rgba(125,211,252,0.45)'
  ctx.lineWidth = 1
  for (const pt of list) {
    ctx.beginPath()
    ctx.moveTo(p.x(pt.x), p.y(pt.y))
    ctx.lineTo(p.x(pt.x), p.y(0))
    ctx.stroke()
  }
  ctx.setLineDash([])
  for (const pt of list) drawDot(ctx, p.x(pt.x), p.y(0), 3, SKY, 0)
  ctx.restore()
  if (list.length > 2) {
    const dx = list[1].x - list[0].x
    label(ctx, (p.x(list[1].x) + p.x(list[2].x)) / 2, p.y(0) + 16, `${formatNumber(dx, 2)} m a cada 0,1 s`, SKY, 'left', a)
  }
}

function drawVelocity(ctx: CanvasRenderingContext2D, p: P, l: Launch, list: { x: number; y: number }[], a: number) {
  const k = 0.12 // meters of arrow per m/s
  const m = p.sx
  ctx.save()
  ctx.globalAlpha = a
  list.forEach((pt, i) => {
    if (i % 2) return
    const vel = velocity(l, i * 0.1)
    const X = p.x(pt.x)
    const Y = p.y(pt.y)
    drawArrow(ctx, X, Y, X + vel.vx * k * m, Y, 'rgba(255,255,255,0.8)', 1.6, 6)
    if (Math.abs(vel.vy) > 0.15) drawArrow(ctx, X, Y, X, Y - vel.vy * k * m, SKY, 1.6, 6)
  })
  ctx.restore()
  const top = vertex(trajectory(l))
  const vx = l.v * Math.cos(l.theta)
  drawDot(ctx, p.x(top.x), p.y(top.y), 4, '#ffffff', a)
  label(ctx, p.x(top.x), p.y(top.y) - 22, `topo: vᵧ = 0 · vₓ = ${formatNumber(vx, 1)} m/s`, '#ffffff', 'center', a)
}

function drawAim(ctx: CanvasRenderingContext2D, p: P, a: { v: number; deg: number }, alpha: number) {
  const l = launchOf(a)
  const X = p.x(0.02)
  const Y = p.y(RELEASE_HEIGHT)
  const len = (0.12 + (a.v / V_MAX) * 0.9) * p.sx
  const th = rad(a.deg)
  ctx.save()
  ctx.globalAlpha = alpha
  drawArrow(ctx, X, Y, X + Math.cos(th) * len, Y - Math.sin(th) * len, 'rgba(255,255,255,0.8)', 2, 9)
  // First 0,3 s of the path as a hint.
  for (const t of [0.1, 0.2, 0.3]) {
    const pt = position(l, t)
    drawDot(ctx, p.x(pt.x), p.y(pt.y), 2.2, 'rgba(255,255,255,0.45)', 0)
  }
  // Angle arc.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(X, Y, 22, -th, 0)
  ctx.stroke()
  ctx.restore()
}

function drawCanon(ctx: CanvasRenderingContext2D, g: Disp, p: P, f: Frame, t: number) {
  // 0–⅓: y = x²; ⅓–⅔: a·x²; ⅔–1: a(x − h)² + k.
  const q = g.curve
  const vv = vertex(q)
  const s1 = Math.min(1, Math.max(0, (t - 0.2) / 0.3))
  const s2 = Math.min(1, Math.max(0, (t - 0.6) / 0.3))
  const e = (x: number) => x * x * (3 - 2 * x)
  const a = 1 + (q.a - 1) * e(s1)
  const h = vv.x * e(s2)
  const k = vv.y * e(s2)
  const fade = t >= 1 ? 0.35 : 0.8
  drawFunction(ctx, (x) => a * (x - h) ** 2 + k, g.view, f, { color: '#ffffff', width: 1.6, alpha: fade, dash: [5, 5] })
  if (s2 > 0 && s2 < 1) drawArrow(ctx, p.x(0), p.y(0), p.x(h), p.y(k), 'rgba(255,255,255,0.7)', 1.5, 7)
  drawDot(ctx, p.x(h), p.y(k), 3.5, '#ffffff', 0)
}

function drawMarks(ctx: CanvasRenderingContext2D, g: Disp, T: Target, p: P, f: Frame, accent: string) {
  const q = g.curve
  const wrong = T.marks.wrong
  const vv = vertex(q)
  // Symmetry: the same height (the hand, h = c) at two instants; the top in the middle.
  if (g.sym > 0.01) {
    const t2 = -q.b / q.a
    ctx.save()
    ctx.globalAlpha = g.sym
    ctx.setLineDash([4, 5])
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.moveTo(p.x(0), p.y(q.c))
    ctx.lineTo(p.x(t2), p.y(q.c))
    ctx.moveTo(p.x(vv.x), f.top + 6)
    ctx.lineTo(p.x(vv.x), p.y(0))
    ctx.stroke()
    ctx.restore()
    drawDot(ctx, p.x(0), p.y(q.c), 4, SKY, g.sym * 0.5)
    drawDot(ctx, p.x(t2), p.y(q.c), 4, SKY, g.sym * 0.5)
    label(ctx, p.x(0) + 4, p.y(q.c) + 14, `t = 0`, SKY, 'left', g.sym)
    label(ctx, p.x(t2), p.y(q.c) + 14, `t = ${fmt(t2)}`, SKY, 'center', g.sym)
    label(ctx, p.x(vv.x) + 6, p.y(q.c) + 14, 'meio', 'rgba(255,255,255,0.7)', 'left', g.sym)
  }
  if (g.ground > 0.01) {
    ctx.save()
    ctx.globalAlpha = g.ground
    ctx.strokeStyle = SKY
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(f.left, p.y(0))
    ctx.lineTo(f.left + f.width, p.y(0))
    ctx.stroke()
    ctx.restore()
    label(ctx, f.left + 8, p.y(0) - 10, 'chão: h = 0', SKY, 'left', g.ground)
  }
  // √Δ/(2|a|) on each side of the axis.
  if (g.arms > 0.01) {
    const right = Math.abs(g.armsW - Math.sqrt(Math.max(0, q.b * q.b - 4 * q.a * q.c)) / (2 * Math.abs(q.a))) < 0.02
    const col = right ? GOOD : BAD
    const X = p.x(vv.x)
    const Y = p.y(0) - 12
    ctx.save()
    ctx.globalAlpha = g.arms
    ctx.setLineDash([4, 5])
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.moveTo(X, f.top + 6)
    ctx.lineTo(X, p.y(0))
    ctx.stroke()
    ctx.setLineDash([])
    drawArrow(ctx, X, Y, p.x(vv.x + g.armsW), Y, col, 1.8, 7)
    drawArrow(ctx, X, Y, p.x(vv.x - g.armsW), Y, col, 1.8, 7)
    for (const s of [-1, 1]) {
      const tx = vv.x + s * g.armsW
      const hy = evaluate(q, tx)
      if (!right) {
        ctx.setLineDash([2, 3])
        ctx.strokeStyle = BAD
        ctx.beginPath()
        ctx.moveTo(p.x(tx), p.y(0))
        ctx.lineTo(p.x(tx), p.y(hy))
        ctx.stroke()
        ctx.setLineDash([])
      }
      drawDot(ctx, p.x(tx), p.y(0), 4, col, 0.6)
    }
    ctx.restore()
    label(ctx, (X + p.x(vv.x + g.armsW)) / 2, Y - 12, `√Δ/(2|a|) ≈ ${fmt(g.armsW, 2)}`, col, 'center', g.arms)
  }
  if (g.level > 0.01) {
    const right = Math.abs(g.levelH - vv.y) < 0.05
    const col = !wrong || right ? GOOD : BAD
    ctx.save()
    ctx.globalAlpha = g.level
    ctx.setLineDash([6, 5])
    ctx.strokeStyle = col
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(f.left, p.y(g.levelH))
    ctx.lineTo(f.left + f.width, p.y(g.levelH))
    ctx.stroke()
    ctx.restore()
    label(ctx, f.left + f.width - 8, p.y(g.levelH) - 10, `h = ${fmt(g.levelH, 1)} m`, col, 'right', g.level)
  }
  if (g.dot > 0.01) {
    const t = g.dotT
    const h = evaluate(q, t)
    const atTop = Math.abs(t - vv.x) < 0.02
    const col = wrong ? BAD : GOOD
    if (wrong && !atTop && g.curveA > 0.5) {
      // How far it still is from the top.
      ctx.save()
      ctx.globalAlpha = g.dot
      ctx.setLineDash([3, 4])
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.moveTo(f.left, p.y(vv.y))
      ctx.lineTo(f.left + f.width, p.y(vv.y))
      ctx.stroke()
      ctx.restore()
    }
    drawDot(ctx, p.x(t), p.y(h), 6, col, 0.8 * g.dot)
    label(ctx, p.x(t), p.y(h) - 16, `t = ${fmt(t, 2)} s · h = ${fmt(h, 2)} m`, col, t < (f.left + 60 - p.x(0)) / p.sx ? 'left' : 'center', g.dot)
  }
  void accent
}
