'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand } from 'lucide-react'
import { easeFactor, equalAspect, fmt, lerp, lerpViewport, texNum, toPx, type Frame, type Viewport } from '@/lib/math/view'
import { drawArrow, drawDot, INK, MATH_FONT, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import { haptic } from '@/lib/observatory/immersive'
import { angleDelta, piFraction, sawtoothWave, TAU, toDeg, toRad, triangleWave, wheelHeight, wrapAngle, type Sinusoid } from '@/lib/math/trig'
import { Panel, type StageProps } from '../runtime'
import {
  ENTENDA_MAX,
  ESE_RANGE,
  ESE_START,
  ESE_TARGET,
  EYE_ABOVE,
  EYE_LINE,
  IMAGINE_MAX,
  P3_SNAP,
  P3_SOLUTIONS,
  PROBLEMS,
  SIN,
  type Pick,
  type TrigLive,
} from './data'

// The continuous Palco of "A roda que vira onda".
//
// One math scene that never cuts: a circle on the left (a Ferris wheel, the
// unit circle, the London Eye, a wheel of any size) and, on the right, the
// graph of its height, tied to the cabin by a horizontal projection line.
// Everything lives in one math coordinate system: the circle is centred at
// (0, cy) with radius rho, and the wave point for the parameter u (angle,
// minutes or time) sits at (xw + st·u, cy + rho·sin(w·u + phi)). Each Cena
// sets a target for these numbers, the layer opacities and the viewport;
// every frame eases the displayed scene toward it (zooming into the circle,
// sliding the graph away, rewinding the cabin…).

const COS = '#ffb454'
const BAD = '#fb7185'
const GOOD = '#6ee7b7'

const LAYERS = [
  'wheel', 'eye', 'unit', 'pdot', 'wave', 'trace', 'proj', 'shadows', 'angle', 'radius', 'cosCurve', 'shift', 'target',
  'ground', 'cands', 'cmpTri', 'cmpSaw', 'vel', 'dir', 'axleLine', 'thresh', 'above', 'f1', 'f2', 'tri', 'rim',
  'xDeg', 'xRad', 'xMin', 'xTime', 'yTopo', 'yUnit', 'yM', 'yInt', 'mirV', 'mirH', 'mirC', 'slideV', 'slideC',
  'line12', 'ref4', 'arcs', 'piMark', 'tauMark', 'match',
] as const
type Layer = (typeof LAYERS)[number]

interface Mark {
  kind: 'pt' | 'x' | 'y'
  v: number
  color: string
  a: number
  label?: string
}

interface Scene {
  view: Viewport
  rho: number
  cy: number
  w: number
  phi: number
  xw: number
  st: number
  u1: number
  base: number
  u: number
  trace: number
  a: Record<Layer, number>
  marks: Record<string, Mark>
}

interface Target extends Omit<Scene, 'a'> {
  a: Partial<Record<Layer, number>>
  /** Free-running cabin: u per second (0 = follow the target u). */
  run: number
  /** In run mode, the trace grows behind the cabin instead of easing. */
  follow: boolean
  /** Easing strength for u (lower = slower, for reveals). */
  uK: number
}

interface Inputs {
  stepId: string
  scene: number
  theta: number
  t: number
  p3: number
  ese: Sinusoid
  q2: number | null
  radii: number
  f1: boolean
  f2: boolean
  r0: number
  r1: number
  pick: Pick | null
  p3found: number[]
  p3miss: boolean
  matched: boolean
}

const deg = (d: number) => toRad(d)

/** Width (math units) of the wave panel for a canvas aspect ratio. */
const waveWidth = (ar: number) => Math.max(3.2, Math.min(7.5, ar * 3.1 - 2.4))

function target(p: Inputs, ar: number, accent: string): Target {
  // Phones (portrait): a tighter gap and a shorter wave, so the circle is bigger.
  const tight = ar < 1.25
  const WW = tight ? 2.6 : waveWidth(ar)
  const XW = tight ? 1.22 : 1.7
  const full = (xw: number, y0 = -1.55, y1 = 1.45, x0 = tight ? -1.2 : -1.35): Viewport => ({ x0, x1: xw + WW + (tight ? 0.12 : 0.3), y0, y1 })
  const focus = (y0 = -1.5, y1 = 1.5): Viewport => ({ x0: -1.55, x1: 1.55, y0, y1 })
  const T: Target = {
    view: full(XW),
    rho: 1,
    cy: 0,
    w: 1,
    phi: 0,
    xw: XW,
    st: WW / IMAGINE_MAX,
    u1: IMAGINE_MAX,
    base: 0,
    u: 0,
    trace: 0,
    a: {},
    marks: {},
    run: 0,
    follow: false,
    uK: 0.3,
  }
  const mark = (id: string, m: Omit<Mark, 'a'> & { a?: number }) => (T.marks[id] = { a: 1, ...m })
  const sinAt = (d: number) => Math.sin(deg(d))
  const cosAt = (d: number) => Math.cos(deg(d))

  switch (p.stepId) {
    case 'imagine':
      T.u = T.trace = p.theta
      T.a = { wheel: 1, wave: 1, trace: 1, proj: 1, xDeg: 1, yTopo: 1 }
      break

    case 'preveja': {
      T.u1 = TAU
      T.st = WW / TAU
      T.a = { wheel: 1, wave: 1, proj: 1, yTopo: 1 }
      if (p.scene === 0) {
        T.a = { ...T.a, xDeg: 1, dir: 1, trace: 1 }
        T.uK = 0.1
      } else if (p.scene === 1) {
        T.u = T.trace = Math.PI
        T.uK = 0.035
        T.a = { ...T.a, xDeg: 1, trace: 1, axleLine: 1 }
        mark('top', { kind: 'pt', v: Math.PI / 2, color: 'rgba(255,255,255,0.55)', label: 'topo: 90°' })
      } else if (p.scene === 2) {
        T.uK = 0.12
        T.a = { ...T.a, xTime: 1, cands: 1, proj: 0, yTopo: 0 }
      } else {
        T.run = 1.1
        T.follow = true
        T.trace = TAU
        T.a = { ...T.a, xTime: 1, trace: 1, vel: 1, cmpTri: p.q2 === 2 ? 0 : 0.7, cmpSaw: p.q2 === 2 ? 0.7 : 0 }
      }
      break
    }

    case 'entenda': {
      T.u1 = ENTENDA_MAX
      T.st = WW / ENTENDA_MAX
      if (p.scene === 0) {
        T.view = focus()
        T.u = p.theta
        T.uK = 0.3
        T.a = { unit: 1, pdot: 1, shadows: 1, angle: 1 }
      } else if (p.scene <= 2) {
        T.view = focus()
        T.u = 0
        T.uK = 0.12
        T.a = { unit: 1, pdot: 1, radius: 1, arcs: 1, piMark: p.radii >= 4 ? 1 : 0, tauMark: p.radii >= 6 ? 1 : 0 }
      } else if (p.scene === 3) {
        T.u = T.trace = Math.min(p.theta, ENTENDA_MAX)
        T.a = { unit: 1, pdot: 1, wave: 1, trace: 1, proj: 1, shadows: 0.55, xRad: 1, yUnit: 1 }
      } else {
        T.run = 0.9
        T.trace = ENTENDA_MAX
        T.a = { unit: 1, pdot: 1, wave: 1, trace: 1, proj: 1, shadows: 0.8, cosCurve: 1, shift: 1, xRad: 1, yUnit: 1 }
      }
      break
    }

    case 'observe': {
      T.view = full(XW, -1.62, 1.42)
      T.u1 = 30
      T.st = WW / 30
      T.w = TAU / 30
      T.phi = -Math.PI / 2
      T.base = -1.25
      T.u = T.trace = p.t
      T.uK = 0.25
      T.a = { wheel: 1, eye: 1, ground: 1, wave: 1, trace: 1, proj: 1, xMin: 1, yM: 1 }
      if (p.scene >= 2) T.a = { ...T.a, thresh: 1, f1: p.f1 ? 1 : 0, f2: p.f2 ? 1 : 0 }
      if (p.scene >= 3) {
        T.trace = 30
        T.a = { ...T.a, above: 1, f1: 1, f2: 1 }
      }
      break
    }

    case 'resolva': {
      T.view = focus(-2.3, 1.5)
      T.a = { unit: 1 }
      const pick = p.pick
      if (p.scene === 0) {
        const s = p.r0
        mark('p30', { kind: 'pt', v: deg(30), color: 'rgba(255,255,255,0.7)', label: '30°' })
        mark('p150', { kind: 'pt', v: deg(150), color: accent, label: '150°' })
        if (s >= 1) T.a = { ...T.a, mirV: 1 }
        if (s >= 2) T.a = { ...T.a, slideV: 1 }
        if (s >= 2) mark('y30', { kind: 'y', v: sinAt(30), color: 'rgba(255,255,255,0.55)', label: s >= 3 ? '' : 'mesma altura' })
        if (s >= 3) mark('yAns', { kind: 'y', v: 0.5, color: accent, label: '½' })
        if (pick && pick.problem === 0 && pick.step === s && pick.option !== PROBLEMS[0][s].answer) {
          const o = pick.option
          if (s === 0) {
            const k = [30, 60, 120, 210][o]
            T.a = { ...T.a, mirV: 1 }
            mark('bad', { kind: 'pt', v: deg(k), color: BAD, label: `${k}°` })
            mark('badImg', { kind: 'pt', v: deg(180 - k), color: 'rgba(251,113,133,0.55)', label: `espelho: ${fmt(wrapDeg(180 - k), 0)}°` })
          } else if (s === 1) {
            const k = [150, 330, 210, 30][o]
            mark('bad', { kind: 'pt', v: deg(k), color: BAD, label: o === 3 ? 'ficaria em 30°' : `iria para ${k}°` })
          } else {
            if (o === 1) mark('bad', { kind: 'y', v: -0.5, color: BAD, label: '−½' })
            if (o === 2) mark('bad', { kind: 'x', v: cosAt(30), color: BAD, label: '√3/2 é o x' })
            if (o === 3) mark('bad', { kind: 'x', v: -cosAt(30), color: BAD, label: '−√3/2 é o x' })
          }
        }
      } else if (p.scene === 1) {
        const s = p.r1
        mark('p30', { kind: 'pt', v: deg(30), color: 'rgba(255,255,255,0.7)', label: '30°' })
        mark('p210', { kind: 'pt', v: deg(210), color: accent, label: '210°' })
        if (s >= 1) T.a = { ...T.a, mirC: 1, slideC: 1 }
        if (s >= 2) {
          mark('xRef', { kind: 'x', v: cosAt(30), color: 'rgba(255,255,255,0.5)', label: 'cos 30°' })
          mark('xAns', { kind: 'x', v: -cosAt(30), color: COS, label: '−√3/2' })
        }
        if (pick && pick.problem === 1 && pick.step === s && pick.option !== PROBLEMS[1][s].answer) {
          const o = pick.option
          if (s === 0) {
            if (o === 0) {
              T.a = { ...T.a, mirV: 1 }
              mark('bad', { kind: 'pt', v: deg(150), color: BAD, label: 'cai em 150°' })
            } else {
              T.a = { ...T.a, mirH: 1 }
              mark('bad', { kind: 'pt', v: deg(330), color: BAD, label: 'cai em 330°' })
            }
          } else {
            if (o === 1) mark('bad', { kind: 'x', v: cosAt(30), color: BAD, label: '+√3/2' })
            if (o === 2) mark('bad', { kind: 'y', v: -0.5, color: BAD, label: '−½ é a altura' })
            if (o === 3) mark('bad', { kind: 'y', v: 0.5, color: BAD, label: '½' })
          }
        }
      } else if (p.scene === 2) {
        T.u = p.p3
        T.uK = 0.35
        T.a = { ...T.a, pdot: 1, shadows: 0.5, line12: p.p3miss || p.p3found.length === 2 ? 1 : 0 }
        p.p3found.forEach((i) => mark(`sol${i}`, { kind: 'pt', v: P3_SOLUTIONS[i], color: GOOD, label: i === 0 ? 'π/6' : '5π/6' }))
      } else {
        T.a = { ...T.a, ref4: 1 }
        for (const [d, c] of [
          [30, 'rgba(255,255,255,0.75)'],
          [150, accent],
          [210, COS],
          [330, 'rgba(255,255,255,0.45)'],
        ] as const)
          mark(`q${d}`, { kind: 'pt', v: deg(d), color: c, label: `${d}°` })
      }
      break
    }

    case 'e-se': {
      const e = p.scene === 0 ? ESE_START : p.scene === 1 ? { A: 1, w: 2, d: 0 } : p.ese
      T.xw = tight ? 1.85 : 2.1
      T.view = { x0: tight ? -1.65 : -1.8, x1: T.xw + WW + (tight ? 0.12 : 0.3), y0: -2.75, y1: 2.75 }
      T.rho = e.A
      T.cy = e.d
      T.w = e.w
      T.u1 = 2 * TAU
      T.st = WW / T.u1
      T.trace = T.u1
      T.run = 1.0
      T.a = { wheel: 1, wave: 1, trace: 1, proj: 1, xRad: 1, yInt: 1, target: p.scene >= 3 ? 1 : 0, match: p.matched && p.scene >= 3 ? 1 : 0 }
      break
    }

    case 'conclua':
      T.trace = IMAGINE_MAX
      T.run = 0.8
      T.a = { unit: 1, pdot: 1, wave: 1, trace: 1, proj: 1, tri: 1, rim: 1, cosCurve: 0.3, xRad: 1, yUnit: 1 }
      break
  }
  return T
}

const wrapDeg = (d: number) => ((d % 360) + 360) % 360

function fromTarget(t: Target): Scene {
  const a = Object.fromEntries(LAYERS.map((k) => [k, t.a[k] ?? 0])) as Record<Layer, number>
  return { ...t, view: { ...t.view }, a, marks: JSON.parse(JSON.stringify(t.marks)) }
}

// ------------------------------------------------------------------ Stage

export default function TrigStage({ lab, stepId, scene, answers, live, setLive }: StageProps) {
  const L = live as Partial<TrigLive>
  const accent = lab.accent
  const theta = L.theta ?? 0
  const t = L.t ?? 0
  const p3 = L.p3 ?? deg(70)
  const ese: Sinusoid = { A: L.A ?? 1, w: L.w ?? 2, d: L.d ?? 0 }
  const num = (k: string) => (typeof answers[k] === 'number' ? (answers[k] as number) : 0)
  const inputs: Inputs = {
    stepId,
    scene,
    theta,
    t,
    p3,
    ese,
    q2: typeof answers.q2 === 'number' ? (answers.q2 as number) : null,
    radii: num('radii'),
    f1: Boolean(answers.f1),
    f2: Boolean(answers.f2),
    r0: num('r0'),
    r1: num('r1'),
    pick: (L.pick as Pick | null | undefined) ?? null,
    p3found: Array.isArray(answers.p3found) ? (answers.p3found as number[]) : [],
    p3miss: Boolean(answers.p3miss),
    matched: Boolean(answers.matched),
  }

  const { ref, size, context } = useMathCanvas()
  const ar = size.w && size.h ? size.w / size.h : 1
  const tgt = useMemo(() => target(inputs, ar, accent), [JSON.stringify(inputs), ar, accent]) // eslint-disable-line react-hooks/exhaustive-deps
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Scene | null>(null)
  const frameRef = useRef<Frame>({ left: 0, top: 0, width: 1, height: 1 })
  const arcProg = useRef<number[]>([])
  const radiiRef = useRef(inputs.radii)
  radiiRef.current = stepId === 'entenda' ? inputs.radii : radiiRef.current
  const flagsRef = useRef({ accent, reduced: false })
  flagsRef.current.accent = accent
  const contextRef = useRef(context)
  contextRef.current = context

  // ------------------------------------------------------------ render loop
  useEffect(() => {
    if (!size.w || !size.h) return
    const reduced = prefersReducedMotion()
    flagsRef.current.reduced = reduced
    const fr: Frame = { left: 8, top: 8, width: size.w - 16, height: size.h - 16 }
    frameRef.current = fr
    if (!disp.current) disp.current = fromTarget(tgtRef.current)
    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const g = disp.current!
      const T = tgtRef.current
      const k = reduced ? 1 : easeFactor(dt)
      g.view = lerpViewport(g.view, equalAspect(T.view, fr), k)
      for (const key of ['rho', 'cy', 'w', 'phi', 'xw', 'st', 'u1', 'base'] as const) g[key] = lerp(g[key], T[key], k)
      for (const key of LAYERS) g.a[key] = lerp(g.a[key], T.a[key] ?? 0, k)
      if (T.run && !reduced) {
        g.u += (T.run * dt) / 1000
        const P = TAU / Math.max(0.2, g.w)
        if (g.u > g.u1) {
          const n = Math.floor(g.u1 / P)
          g.u -= n >= 1 ? n * P : g.u1
        }
        g.trace = T.follow ? Math.max(g.trace, Math.min(g.u, T.trace)) : lerp(g.trace, T.trace, k)
        if (T.follow && g.trace < T.trace && g.u < g.trace - 0.01) g.trace = T.trace
      } else {
        const ku = reduced ? 1 : easeFactor(dt, T.uK)
        g.u = lerp(g.u, T.u, ku)
        g.trace = lerp(g.trace, T.trace, ku)
      }
      // Marks: fade in/out, angles along the shortest way.
      for (const id of new Set([...Object.keys(g.marks), ...Object.keys(T.marks)])) {
        const tm = T.marks[id]
        const cm = g.marks[id]
        if (!cm) g.marks[id] = { ...tm, a: 0 }
        else if (!tm) {
          cm.a = lerp(cm.a, 0, k)
          if (cm.a < 0.01) delete g.marks[id]
        } else {
          cm.a = lerp(cm.a, tm.a, k)
          cm.v = cm.kind === 'pt' ? cm.v + angleDelta(cm.v, tm.v) * k : lerp(cm.v, tm.v, k)
          cm.color = tm.color
          cm.label = tm.label
        }
      }
      // Radii bent over the rim, one after the other.
      const n = radiiRef.current
      const prog = arcProg.current
      for (let i = 0; i < 6; i++) {
        const want = i < n ? 1 : 0
        const ready = i === 0 || (prog[i - 1] ?? 0) > 0.75
        const cur = prog[i] ?? 0
        prog[i] = reduced ? want : want > cur ? (ready ? Math.min(1, cur + dt / 1100) : cur) : Math.max(0, cur - dt / 400)
      }
      const ctx = contextRef.current()
      if (ctx) draw(ctx, g, fr, now / 1000, flagsRef.current.accent, prog)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [size.w, size.h])

  // A tap of haptics at every full turn in Imagine.
  const turns = Math.floor(theta / TAU + 1e-6)
  const lastTurns = useRef(turns)
  useEffect(() => {
    if (stepId === 'imagine' && turns > lastTurns.current) haptic([10, 30, 10])
    lastTurns.current = turns
  }, [turns, stepId])

  // ------------------------------------------------------------ input
  type Drag = { key: 'theta' | 't' | 'p3'; min: number; max: number; w: number; phi: number; wrap?: boolean } | { key: 'ese' } | null
  const drag: Drag =
    stepId === 'imagine'
      ? { key: 'theta', min: 0, max: IMAGINE_MAX, w: 1, phi: 0 }
      : stepId === 'entenda' && (scene === 0 || scene === 3)
        ? { key: 'theta', min: 0, max: scene === 0 ? IMAGINE_MAX : ENTENDA_MAX, w: 1, phi: 0 }
        : stepId === 'observe' && (scene === 1 || scene === 2)
          ? { key: 't', min: 0, max: 30, w: TAU / 30, phi: -Math.PI / 2 }
          : stepId === 'resolva' && scene === 2
            ? { key: 'p3', min: 0, max: TAU, w: 1, phi: 0, wrap: true }
            : stepId === 'e-se' && scene >= 2
              ? { key: 'ese' }
              : null
  const dragRef = useRef(drag)
  dragRef.current = drag
  const valRef = useRef({ theta, t, p3, ese })
  valRef.current = { theta, t, p3, ese }
  const grab = useRef<{ zone: 'circle' | 'wave'; x: number; y: number } | null>(null)
  const [used, setUsed] = useState<string | null>(null)
  const hintKey = `${stepId}-${drag ? drag.key : ''}`

  const toMath = (e: React.PointerEvent) => {
    const g = disp.current
    if (!g) return null
    const r = e.currentTarget.getBoundingClientRect()
    const P = toPx(g.view, frameRef.current)
    return { x: P.fromX(e.clientX - r.left), y: P.fromY(e.clientY - r.top), g }
  }

  const apply = (m: { x: number; y: number; g: Scene }, zone: 'circle' | 'wave', first: boolean) => {
    const d = dragRef.current
    if (!d) return
    const { g } = m
    if (d.key === 'ese') {
      const v = valRef.current.ese
      const clampP = (k: 'A' | 'w' | 'd', x: number) => Math.min(ESE_RANGE[k][1], Math.max(ESE_RANGE[k][0], x))
      if (zone === 'circle') {
        const A = clampP('A', Math.hypot(m.x, m.y - v.d))
        setLive({ A, param: 'A' })
      } else if (!first && grab.current) {
        const dx = m.x - grab.current.x
        const dy = m.y - grab.current.y
        const horizontal = Math.abs(dx) > Math.abs(dy)
        if (horizontal) setLive({ w: clampP('w', v.w * Math.exp(-dx * 0.32)), param: 'w' })
        else setLive({ d: clampP('d', v.d + dy), param: 'd' })
      }
      grab.current = { zone, x: m.x, y: m.y }
      return
    }
    const cur = valRef.current[d.key]
    let next = cur
    if (zone === 'wave') next = (m.x - g.xw) / g.st
    else {
      if (Math.hypot(m.x, m.y - g.cy) < 0.12 * g.rho) return
      const a = Math.atan2(m.y - g.cy, m.x)
      const alpha = d.w * cur + d.phi
      next = d.wrap ? wrapAngle(a) : cur + angleDelta(alpha, a) / d.w
    }
    next = Math.min(d.max, Math.max(d.min, next))
    if (d.wrap) next = wrapAngle(next)
    if (next !== cur) setLive({ [d.key]: next })
  }

  const onDown = (e: React.PointerEvent) => {
    if (!drag) return
    const m = toMath(e)
    if (!m) return
    const { g } = m
    const nearCircle = Math.hypot(m.x, m.y - g.cy) < Math.max(1.75 * g.rho, 0.9)
    const onWave = g.a.wave > 0.5 && m.x > g.xw - 0.25 && m.x < g.xw + g.st * g.u1 + 0.3
    const zone = nearCircle ? 'circle' : onWave ? 'wave' : null
    if (!zone) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    grab.current = { zone, x: m.x, y: m.y }
    setUsed(hintKey)
    haptic(6)
    apply(m, zone, true)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!grab.current) return
    const m = toMath(e)
    if (m) apply(m, grab.current.zone, false)
  }
  const onUp = () => {
    if (!grab.current) return
    grab.current = null
    // Resolva, problem 3: a release near a solution snaps onto it.
    const d = dragRef.current
    if (d && d.key === 'p3') {
      const v = valRef.current.p3
      for (const s of P3_SOLUTIONS) {
        if (Math.abs(angleDelta(v, s)) < P3_SNAP) {
          setLive({ p3: s })
          break
        }
      }
    }
  }

  // ------------------------------------------------------------ overlays
  const showHint = drag && used !== hintKey && !(stepId === 'imagine' && scene === 0)
  const hintText =
    drag?.key === 'ese'
      ? 'Arraste a borda da roda ou a onda'
      : drag?.key === 't'
        ? 'Arraste a cabine ou o gráfico'
        : stepId === 'imagine'
          ? 'Arraste a cabine ao redor da roda'
          : 'Arraste o ponto P'

  const thetaW = wrapAngle(theta)
  const readout: { key: string; node: React.ReactNode } | null =
    stepId === 'imagine'
      ? {
          key: 'imagine',
          node: (
            <>
              <p className="font-mono text-[17px] leading-none tabular-nums text-white">{fmt(toDeg(theta), 0)}°</p>
              <p className="mt-1 text-[11.5px] leading-none text-white/55">{fmt(theta / TAU, 2)} {Math.abs(theta / TAU - 1) < 0.005 ? 'volta' : 'voltas'}</p>
            </>
          ),
        }
      : stepId === 'entenda' && scene === 0
        ? {
            key: 'unit',
            node: (
              <div className="space-y-1 font-mono text-[13px] leading-none tabular-nums">
                <p className="text-white">θ = {fmt(toDeg(thetaW), 0)}°</p>
                <p style={{ color: COS }}>cos θ = {fmt(Math.cos(theta), 2)}</p>
                <p style={{ color: accent }}>sen θ = {fmt(Math.sin(theta), 2)}</p>
              </div>
            ),
          }
        : stepId === 'entenda' && (scene === 1 || scene === 2)
          ? {
              key: 'rad',
              node: (
                <>
                  <p className="font-mono text-[15px] leading-none tabular-nums text-white">
                    {inputs.radii} {inputs.radii === 1 ? 'raio' : 'raios'}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-none text-white/55">1 rad ≈ 57,3°</p>
                </>
              ),
            }
          : stepId === 'entenda' && scene === 3
            ? {
                key: 'rad3',
                node: (
                  <>
                    <p className="font-mono text-[15px] leading-none tabular-nums text-white">θ = {fmt(Math.min(theta, TAU), 2)} rad</p>
                    <p className="mt-1 font-mono text-[12px] leading-none" style={{ color: accent }}>
                      sen θ = {fmt(Math.sin(theta), 2)}
                    </p>
                  </>
                ),
              }
            : stepId === 'observe'
              ? {
                  key: 'eye',
                  node: (
                    <>
                      <p className="font-mono text-[16px] leading-none tabular-nums text-white">h ≈ {fmt(wheelHeight(t), 0)} m</p>
                      <p className="mt-1 font-mono text-[11.5px] leading-none text-white/55">t = {fmt(t, 1)} min</p>
                    </>
                  ),
                }
              : stepId === 'resolva' && scene === 2
                ? {
                    key: 'p3',
                    node: (
                      <>
                        <p className="font-mono text-[15px] leading-none tabular-nums text-white">θ = {fmt(toDeg(p3), 0)}°</p>
                        <p className="mt-1 font-mono text-[12px] leading-none" style={{ color: accent }}>
                          sen θ = {fmt(Math.sin(p3), 2)}
                        </p>
                      </>
                    ),
                  }
                : null

  const formula: { key: string; node: React.ReactNode } | null =
    stepId === 'observe' && scene >= 1
      ? {
          key: 'f-eye',
          node: (
            <>
              <Tex say="h de t igual a 75 menos 60 vezes cosseno de 2 pi t sobre 30">{'h(t) = 75 - 60\\cos\\!\\left(\\tfrac{2\\pi t}{30}\\right)'}</Tex>
              <span className="mt-1 block text-[10.5px] leading-snug text-white/50">75 m eixo · 60 m raio · 30 min por volta</span>
            </>
          ),
        }
      : stepId === 'entenda' && scene === 4
        ? { key: 'shift', node: <Tex say="cosseno de teta igual a seno de teta mais pi sobre 2">{`\\cos\\theta = ${SIN}\\!\\left(\\theta + \\tfrac{\\pi}{2}\\right)`}</Tex> }
        : stepId === 'e-se'
          ? {
              key: 'ese',
              node: (
                <Tex say={`h de t igual a ${fmt(scene <= 1 ? 1 : ese.A)} vezes seno de ${fmt(scene === 0 ? 1 : scene === 1 ? 2 : ese.w)} t mais ${fmt(scene <= 1 ? 0 : ese.d)}`}>
                  {(() => {
                    const e = scene === 0 ? ESE_START : scene === 1 ? { A: 1, w: 2, d: 0 } : ese
                    const dTex = Math.abs(e.d) < 0.005 ? '' : e.d > 0 ? ` + ${texNum(e.d)}` : ` - ${texNum(-e.d)}`
                    return `h(t) = {\\color{${accent}}${texNum(e.A)}}\\,${SIN}({\\color{${COS}}${texNum(e.w)}}\\,t)${dTex ? `{\\color{#d4d4d8}${dTex}}` : ''}`
                  })()}
                </Tex>
              ),
            }
          : stepId === 'conclua' && scene >= 1
            ? { key: 'id', node: <Tex say="seno ao quadrado de teta mais cosseno ao quadrado de teta igual a 1">{`${SIN}^2\\theta + \\cos^2\\theta = 1`}</Tex> }
            : null

  const notebook: { tex: string; say: string }[] =
    stepId === 'resolva' && scene <= 1 ? PROBLEMS[scene].slice(0, scene === 0 ? inputs.r0 : inputs.r1).map((s) => s.line) : []
  const sourceBadge = stepId === 'observe'
  const aboveLabel = stepId === 'observe' && scene >= 3

  const aria =
    stepId === 'imagine'
      ? `Roda-gigante com a cabine girada ${fmt(toDeg(theta), 0)} graus; o gráfico ao lado mostra a altura da cabine.`
      : stepId === 'preveja'
        ? 'Roda-gigante e o gráfico da altura da cabine.'
        : stepId === 'entenda'
          ? scene === 0
            ? `Círculo unitário. P em ${fmt(toDeg(thetaW), 0)} graus: cosseno ${fmt(Math.cos(theta))}, seno ${fmt(Math.sin(theta))}.`
            : scene <= 2
              ? `${inputs.radii} raios dobrados sobre a borda do círculo.`
              : 'O seno se desenrola numa onda, com o eixo horizontal em radianos.'
          : stepId === 'observe'
            ? `London Eye: depois de ${fmt(t, 1)} minutos a cabine está a ${fmt(wheelHeight(t), 0)} metros.`
            : stepId === 'resolva'
              ? 'Círculo unitário com os ângulos do problema.'
              : stepId === 'e-se'
                ? `Roda de raio ${fmt(ese.A)}, rapidez ${fmt(ese.w)} e eixo em ${fmt(ese.d)}, com a onda da altura.`
                : 'O círculo unitário com o triângulo de catetos cosseno e seno e a onda do seno.'

  return (
    <Panel>
      <div
        className="absolute inset-0 select-none"
        style={{ touchAction: drag ? 'none' : 'auto', cursor: drag ? 'grab' : 'default' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={ref} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>

      <AnimatePresence>
        {readout && (
          <motion.div
            key={readout.key}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="pointer-events-none absolute left-3 top-3 z-10 rounded-2xl bg-black/45 px-3 py-2 backdrop-blur-xl"
          >
            {readout.node}
          </motion.div>
        )}
        {formula && (
          <motion.div
            key={formula.key}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-none absolute right-3 top-3 z-10 max-w-[62%] rounded-2xl bg-black/50 px-3 py-2 text-right text-[14px] text-white/90 backdrop-blur-xl"
          >
            {formula.node}
          </motion.div>
        )}
        {sourceBadge && !formula && (
          <motion.div
            key="src"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-white/[0.08] px-3 py-1.5 text-[11px] text-white/60 backdrop-blur-xl"
          >
            London Eye · dados do site oficial
          </motion.div>
        )}
        {aboveLabel && (
          <motion.div
            key="above"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-3 left-1/2 z-10 rounded-2xl bg-amber-400/15 px-3 py-1.5 text-center text-[12px] text-amber-50/90 backdrop-blur-xl"
            style={{ x: '-50%' }}
          >
            acima de 100 m por ≈ {fmt(EYE_ABOVE.duration, 1)} min a cada volta
          </motion.div>
        )}
      </AnimatePresence>

      {notebook.length > 0 && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 space-y-1 rounded-2xl border border-white/[0.06] bg-black/40 px-3 py-2 backdrop-blur-xl">
          <AnimatePresence initial={false}>
            {notebook.map((l) => (
              <motion.div
                key={l.tex}
                initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="text-[14px] text-white/85"
              >
                <Tex say={l.say}>{l.tex}</Tex>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showHint && (
          <motion.div
            key={hintKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-white/85 backdrop-blur-xl"
            style={{ x: '-50%' }}
          >
            <motion.span animate={{ rotate: [0, -14, 0, 14, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
              <Hand className="h-3.5 w-3.5 text-white/70" />
            </motion.span>
            {hintText}
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}

// ------------------------------------------------------------------ drawing

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle', font = MATH_FONT) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(s, x, y)
}

function withAlpha(color: string, a: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${a})`
  }
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b, a0 = '1'] = m[1].split(',').map((s) => s.trim())
    return `rgba(${r},${g},${b},${parseFloat(a0) * a})`
  }
  return color
}

function draw(ctx: CanvasRenderingContext2D, g: Scene, fr: Frame, time: number, accent: string, arcs: number[]) {
  const P = toPx(g.view, fr)
  const A = g.a
  const R = g.rho * P.sx
  const cx = P.x(0)
  const cyPx = P.y(g.cy)
  const alpha = g.w * g.u + g.phi
  const pAt = (ang: number, r = 1) => ({ x: P.x(g.rho * r * Math.cos(ang)), y: P.y(g.cy + g.rho * r * Math.sin(ang)) })
  const Pp = pAt(alpha)
  const waveX = (u: number) => P.x(g.xw + g.st * u)
  const waveY = (u: number) => P.y(g.cy + g.rho * Math.sin(g.w * u + g.phi))
  const xEnd = g.xw + g.st * g.u1
  const W = fr.left * 2 + fr.width

  const curve = (f: (u: number) => number, u0: number, u1: number, color: string, width: number, a: number, dash?: number[], glow = false) => {
    if (a < 0.01 || u1 <= u0) return
    const n = Math.max(24, Math.round(((u1 - u0) / Math.max(1e-6, g.u1)) * 420))
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (dash) ctx.setLineDash(dash)
    if (glow) {
      ctx.shadowColor = color
      ctx.shadowBlur = 10
    }
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const u = u0 + ((u1 - u0) * i) / n
      const X = waveX(u)
      const Y = P.y(f(u))
      if (i) ctx.lineTo(X, Y)
      else ctx.moveTo(X, Y)
    }
    ctx.stroke()
    ctx.restore()
  }
  const sinF = (u: number) => g.cy + g.rho * Math.sin(g.w * u + g.phi)

  // ---------------------------------------------------------------- ground (London Eye)
  if (A.ground > 0.01) {
    const gy = P.y(g.cy - 1.25 * g.rho)
    ctx.save()
    ctx.globalAlpha = A.ground
    const grd = ctx.createLinearGradient(0, gy, 0, gy + 40)
    grd.addColorStop(0, 'rgba(255,255,255,0.06)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, gy, W, 40)
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(P.x(-1.6), gy + 0.5)
    ctx.lineTo(P.x(xEnd + 0.2), gy + 0.5)
    ctx.stroke()
    // A-frame legs.
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(P.x(-0.55 * g.rho), gy)
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(P.x(0.55 * g.rho), gy)
    ctx.stroke()
    ctx.restore()
    text(ctx, 'chão', P.x(-0.95), gy + 12, withAlpha('rgb(255,255,255)', 0.35 * A.ground), 'left', 'middle')
  }

  // ---------------------------------------------------------------- wave axes and labels
  if (A.wave > 0.01) {
    const by = P.y(g.base)
    const x0 = P.x(g.xw)
    const x1 = P.x(xEnd)
    ctx.save()
    ctx.globalAlpha = A.wave
    ctx.strokeStyle = INK.axis
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x0, Math.round(by) + 0.5)
    ctx.lineTo(x1 + 6, Math.round(by) + 0.5)
    const yTop = Math.max(g.cy + g.rho * 1.18, A.yInt > 0.5 ? 2.5 : -Infinity)
    const yBot = Math.min(g.cy - g.rho * 1.18, g.base, A.yInt > 0.5 ? -2.5 : Infinity)
    ctx.moveTo(Math.round(x0) + 0.5, P.y(yTop))
    ctx.lineTo(Math.round(x0) + 0.5, P.y(yBot))
    ctx.stroke()
    // Guide lines at the top and bottom of the wave.
    if (A.yInt < 0.5) {
      ctx.strokeStyle = INK.grid
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      for (const yy of [g.cy + g.rho, g.cy - g.rho]) {
        ctx.moveTo(x0, P.y(yy))
        ctx.lineTo(x1, P.y(yy))
      }
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.restore()

    const xl = (u: number) => waveX(u)
    const lab = (a: number) => withAlpha('rgb(255,255,255)', 0.45 * a * A.wave)
    const tickY = by + 6
    const spacing = (du: number) => g.st * du * P.sx
    if (A.xDeg > 0.01) {
      const du = spacing(Math.PI / 2) > 38 ? Math.PI / 2 : Math.PI
      for (let u = du; u <= g.u1 + 1e-6; u += du) text(ctx, `${fmt(toDeg(u), 0)}°`, xl(u), tickY, lab(A.xDeg), 'center', 'top')
    }
    if (A.xRad > 0.01) {
      const du = spacing(Math.PI / 2) > 34 ? Math.PI / 2 : Math.PI
      for (let u = du; u <= g.u1 + 1e-6; u += du) text(ctx, piFraction(u)?.text ?? fmt(u), xl(u), tickY, lab(A.xRad), 'center', 'top')
    }
    if (A.xMin > 0.01) {
      for (let m = 5; m <= 30; m += 5) text(ctx, `${m}`, xl(m), tickY, lab(A.xMin), 'center', 'top')
      text(ctx, 'min', x1, by - 8, lab(A.xMin), 'right', 'middle')
    }
    if (A.xTime > 0.01) text(ctx, 'tempo →', x1, tickY, lab(A.xTime), 'right', 'top')
    // Height labels sit inside the graph (top above its line, bottom below,
    // middle at the far end), so the gap to the circle can stay small.
    const top = (s: string, a: number) => text(ctx, s, x0 + 5, P.y(g.cy + g.rho) - 8, lab(a), 'left', 'middle')
    const mid = (s: string, a: number) => text(ctx, s, x1, P.y(g.cy) - 8, lab(a), 'right', 'middle')
    const bot = (s: string, a: number) => text(ctx, s, x0 + 5, P.y(g.cy - g.rho) + 9, lab(a), 'left', 'middle')
    if (A.yTopo > 0.01) {
      top('topo', A.yTopo)
      mid('eixo', A.yTopo)
      bot('base', A.yTopo)
    }
    if (A.yUnit > 0.01) {
      top('1', A.yUnit)
      bot('−1', A.yUnit)
    }
    if (A.yM > 0.01) {
      top('135 m', A.yM)
      mid('75 m', A.yM)
      bot('15 m', A.yM)
    }
    if (A.yInt > 0.01) for (const k of [-2, -1, 1, 2]) text(ctx, fmt(k), x0 - 5, P.y(k), lab(A.yInt), 'right', 'middle')
  }

  // ---------------------------------------------------------------- candidates (Preveja)
  if (A.cands > 0.01) {
    const shapes = [triangleWave, Math.sin, sawtoothWave]
    shapes.forEach((f, i) => {
      const oy = g.cy + g.rho * (0.72 - i * 0.72)
      const amp = g.rho * 0.24
      curve((u) => oy + amp * f(u), 0, g.u1, 'rgba(255,255,255,0.8)', 2, A.cands)
      text(ctx, 'ABC'[i], waveX(0) + 4, P.y(oy + amp) - 6, withAlpha(accent, A.cands), 'left', 'middle', '600 13px ui-sans-serif, system-ui, sans-serif')
    })
  }

  // ---------------------------------------------------------------- comparison and reference curves
  curve((u) => g.cy + g.rho * triangleWave(g.w * u + g.phi), 0, g.u1, BAD, 1.6, A.cmpTri, [5, 5])
  curve((u) => g.cy + g.rho * sawtoothWave(g.w * u + g.phi), 0, g.u1, BAD, 1.6, A.cmpSaw, [5, 5])
  curve((u) => g.cy + g.rho * Math.cos(g.w * u + g.phi), 0, g.u1, COS, 2, A.cosCurve, [6, 5])
  if (A.target > 0.01) {
    const tf = (u: number) => ESE_TARGET.d + ESE_TARGET.A * Math.sin(ESE_TARGET.w * u)
    curve(tf, 0, g.u1, A.match > 0.5 ? GOOD : 'rgba(255,255,255,0.75)', 2, A.target, [7, 6])
  }

  // ---------------------------------------------------------------- threshold (London Eye, 100 m)
  if (A.thresh > 0.01) {
    const ly = g.cy + g.rho * ((EYE_LINE - 75) / 60)
    ctx.save()
    ctx.globalAlpha = A.thresh
    ctx.strokeStyle = 'rgba(255,180,84,0.7)'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(P.x(-1.3 * g.rho), P.y(ly))
    ctx.lineTo(P.x(xEnd), P.y(ly))
    ctx.stroke()
    ctx.restore()
    text(ctx, '100 m', P.x(g.xw) + 5, P.y(ly) + 10, withAlpha(COS, A.thresh), 'left', 'middle')
    if (A.above > 0.01) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, P.y(ly))
      ctx.clip()
      curve(sinF, 0, g.u1, COS, 4, A.above, undefined, true)
      ctx.globalAlpha = A.above
      ctx.strokeStyle = COS
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(cx, cyPx, R, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }
    const marks: [number, number, number][] = [
      [EYE_ABOVE.t1, A.f1, 0],
      [EYE_ABOVE.t2, A.f2, 1],
    ]
    for (const [tm, a, i] of marks) {
      if (a < 0.01) continue
      const X = waveX(tm)
      const Y = P.y(ly)
      ctx.save()
      ctx.globalAlpha = a
      ctx.strokeStyle = 'rgba(255,180,84,0.45)'
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(X, Y)
      ctx.lineTo(X, P.y(g.base))
      ctx.stroke()
      ctx.restore()
      drawDot(ctx, X, Y, 4.5, withAlpha(COS, a), a)
      text(ctx, `≈ ${fmt(tm, 1)}`, X, Y - 11, withAlpha(COS, a), i ? 'left' : 'right', 'middle')
    }
  }

  // ---------------------------------------------------------------- the trace (height of the cabin)
  if (A.trace > 0.01 && A.wave > 0.01) curve(sinF, 0, Math.min(g.trace, g.u1), accent, 2.6, A.trace * A.wave, undefined, true)

  // ---------------------------------------------------------------- shift arrow (cos is sin ahead by π/2)
  if (A.shift > 0.01) {
    const y = P.y(g.cy + g.rho) - 12
    const xa = waveX(0)
    const xb = waveX(Math.PI / 2 / Math.max(0.2, g.w))
    ctx.save()
    ctx.globalAlpha = A.shift
    drawArrow(ctx, xa, y, xb, y, 'rgba(255,255,255,0.75)', 1.5, 7)
    ctx.restore()
    text(ctx, 'π/2', (xa + xb) / 2, y - 10, withAlpha('rgb(255,255,255)', 0.8 * A.shift))
  }

  // ---------------------------------------------------------------- the circle
  const unitA = A.unit
  // Rim.
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cyPx, R, 0, TAU)
  ctx.stroke()
  if (A.rim > 0.01) {
    ctx.globalAlpha = A.rim
    ctx.strokeStyle = accent
    ctx.lineWidth = 2.5
    ctx.shadowColor = accent
    ctx.shadowBlur = 16 + 6 * Math.sin(time * 2)
    ctx.beginPath()
    ctx.arc(cx, cyPx, R, 0, TAU)
    ctx.stroke()
  }
  ctx.restore()

  // Unit-circle axes.
  if (unitA > 0.01) {
    ctx.save()
    ctx.globalAlpha = unitA
    ctx.strokeStyle = INK.axis
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(P.x(-1.3 * g.rho), Math.round(cyPx) + 0.5)
    ctx.lineTo(P.x(1.3 * g.rho), Math.round(cyPx) + 0.5)
    ctx.moveTo(Math.round(cx) + 0.5, P.y(g.cy - 1.3 * g.rho))
    ctx.lineTo(Math.round(cx) + 0.5, P.y(g.cy + 1.3 * g.rho))
    ctx.stroke()
    ctx.restore()
    const l = withAlpha('rgb(255,255,255)', 0.4 * unitA)
    text(ctx, '1', P.x(g.rho) + 5, cyPx - 9, l, 'left')
    text(ctx, '−1', P.x(-g.rho) - 4, cyPx - 9, l, 'right')
    text(ctx, '1', cx - 6, P.y(g.cy + g.rho) - 8, l, 'right')
    text(ctx, '−1', cx - 6, P.y(g.cy - g.rho) + 8, l, 'right')
  }

  // Mirror lines and symmetry guides (Resolva).
  const guide = (x0: number, y0: number, x1: number, y1: number, a: number, color = 'rgba(255,255,255,0.45)') => {
    if (a < 0.01) return
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = color
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.restore()
  }
  guide(cx, P.y(g.cy + 1.35 * g.rho), cx, P.y(g.cy - 1.35 * g.rho), A.mirV, withAlpha(accent, 0.8))
  if (A.mirV > 0.01) text(ctx, 'espelho', cx + 6, P.y(g.cy + 1.38 * g.rho), withAlpha(accent, 0.8 * A.mirV), 'left')
  guide(P.x(-1.35 * g.rho), cyPx, P.x(1.35 * g.rho), cyPx, A.mirH, withAlpha(BAD, 0.8))
  if (A.mirC > 0.01) {
    const a = pAt(deg(30))
    const b = pAt(deg(210))
    guide(a.x, a.y, b.x, b.y, A.mirC, withAlpha(accent, 0.8))
    drawDot(ctx, cx, cyPx, 3, withAlpha(accent, A.mirC))
  }
  if (A.slideV > 0.01) {
    const a = pAt(deg(30))
    const b = pAt(deg(150))
    guide(a.x, a.y, b.x, b.y, A.slideV * 0.8)
    const s = (1 - Math.cos(((time * 0.9) % 2) * Math.PI)) / 2
    drawDot(ctx, lerp(a.x, b.x, s), a.y, 4, `rgba(255,255,255,${0.75 * A.slideV})`)
  }
  if (A.slideC > 0.01) {
    const s = (1 - Math.cos(((time * 0.7) % 2) * Math.PI)) / 2
    const q = pAt(deg(30 + 180 * s))
    ctx.save()
    ctx.globalAlpha = A.slideC * 0.5
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cyPx, R * 0.22, -deg(30), -deg(30 + 180 * s), true)
    ctx.stroke()
    ctx.restore()
    drawDot(ctx, q.x, q.y, 4, `rgba(255,255,255,${0.75 * A.slideC})`)
  }
  if (A.line12 > 0.01) {
    const y = P.y(g.cy + 0.5 * g.rho)
    guide(P.x(-1.35 * g.rho), y, P.x(1.35 * g.rho), y, A.line12, withAlpha(accent, 0.9))
    text(ctx, 'y = ½', P.x(1.35 * g.rho), y + 11, withAlpha(accent, A.line12), 'right')
  }
  if (A.ref4 > 0.01) {
    const pts = [30, 150, 210, 330].map((d) => pAt(deg(d)))
    ctx.save()
    ctx.globalAlpha = A.ref4 * 0.5
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (const i of [1, 2, 3, 0]) ctx.lineTo(pts[i].x, pts[i].y)
    ctx.stroke()
    ctx.restore()
  }

  // Radii bent over the rim (Entenda).
  if (A.arcs > 0.01) drawRadianArcs(ctx, g, P, arcs, accent, A)

  // Spokes and capsules (the Ferris wheel look).
  const wheelA = A.wheel
  if (wheelA > 0.01) {
    const n = A.eye > 0.5 ? 16 : 8
    ctx.save()
    ctx.globalAlpha = wheelA
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const q = pAt(alpha + (i * TAU) / n)
      ctx.moveTo(cx, cyPx)
      ctx.lineTo(q.x, q.y)
    }
    ctx.stroke()
    ctx.restore()
    if (A.eye > 0.01) {
      for (let i = 1; i < 32; i++) {
        const q = pAt(alpha + (i * TAU) / 32, 1.04)
        drawDot(ctx, q.x, q.y, Math.max(1.6, R * 0.025), `rgba(255,255,255,${0.35 * A.eye * wheelA})`)
      }
    }
    drawDot(ctx, cx, cyPx, Math.max(3, R * 0.05), `rgba(255,255,255,${0.5 * wheelA})`)
  }

  // Shadows: cos on the horizontal axis, sen on the vertical one.
  if (A.shadows > 0.01) {
    const a = A.shadows
    const fx = P.x(g.rho * Math.cos(alpha))
    const fy = P.y(g.cy + g.rho * Math.sin(alpha))
    ctx.save()
    ctx.setLineDash([3, 4])
    ctx.lineWidth = 1
    ctx.strokeStyle = withAlpha(COS, 0.5 * a)
    ctx.beginPath()
    ctx.moveTo(fx, fy)
    ctx.lineTo(fx, cyPx)
    ctx.stroke()
    ctx.strokeStyle = withAlpha(accent, 0.5 * a)
    ctx.beginPath()
    ctx.moveTo(fx, fy)
    ctx.lineTo(cx, fy)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineCap = 'round'
    ctx.lineWidth = 4.5
    ctx.strokeStyle = withAlpha(COS, a)
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(fx, cyPx)
    ctx.stroke()
    ctx.strokeStyle = withAlpha(accent, a)
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(cx, fy)
    ctx.stroke()
    ctx.restore()
    if (A.angle > 0.01) {
      const below = Math.sin(alpha) > 0
      text(ctx, 'cos θ', (cx + fx) / 2, cyPx + (below ? 12 : -12), withAlpha(COS, a * A.angle))
      text(ctx, 'sen θ', cx + (Math.cos(alpha) > 0 ? -8 : 8), (cyPx + fy) / 2, withAlpha(accent, a * A.angle), Math.cos(alpha) > 0 ? 'right' : 'left')
    }
  }

  // Angle arc θ.
  if (A.angle > 0.01) {
    const wa = wrapAngle(alpha)
    ctx.save()
    ctx.globalAlpha = A.angle
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1.3
    ctx.beginPath()
    ctx.arc(cx, cyPx, R * 0.2, 0, -wa, true)
    ctx.stroke()
    ctx.restore()
    const m = pAt(wa / 2, 0.32)
    if (wa > 0.25) text(ctx, 'θ', m.x, m.y, `rgba(255,255,255,${0.8 * A.angle})`, 'center', 'middle', 'italic 500 13px ui-serif, Georgia, serif')
  }

  // Radius line (Entenda: the radius that gets bent).
  if (A.radius > 0.01) {
    ctx.save()
    ctx.globalAlpha = A.radius
    ctx.strokeStyle = accent
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(Pp.x, Pp.y)
    ctx.stroke()
    ctx.restore()
    text(ctx, 'raio = 1', (cx + Pp.x) / 2, (cyPx + Pp.y) / 2 - 12, withAlpha(accent, A.radius))
  }

  // Pythagoras (Conclua).
  if (A.tri > 0.01) {
    const fx = P.x(g.rho * Math.cos(alpha))
    ctx.save()
    ctx.globalAlpha = A.tri
    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = COS
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(fx, cyPx)
    ctx.stroke()
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.moveTo(fx, cyPx)
    ctx.lineTo(fx, Pp.y)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cyPx)
    ctx.lineTo(Pp.x, Pp.y)
    ctx.stroke()
    // Right-angle mark.
    const s = Math.min(8, Math.abs(fx - cx) * 0.4, Math.abs(Pp.y - cyPx) * 0.4)
    if (s > 2) {
      const sx = fx > cx ? -1 : 1
      const sy = Pp.y < cyPx ? -1 : 1
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath()
      ctx.moveTo(fx + sx * s, cyPx)
      ctx.lineTo(fx + sx * s, cyPx + sy * s)
      ctx.lineTo(fx, cyPx + sy * s)
      ctx.stroke()
    }
    ctx.restore()
    const up = Math.sin(alpha) >= 0
    text(ctx, 'cos θ', (cx + fx) / 2, cyPx + (up ? 12 : -12), withAlpha(COS, A.tri))
    // Inside the triangle, so it never leaves the stage.
    text(ctx, 'sen θ', fx + (Math.cos(alpha) >= 0 ? -6 : 6), (cyPx + Pp.y) / 2, withAlpha(accent, A.tri), Math.cos(alpha) >= 0 ? 'right' : 'left')
    text(ctx, '1', (cx + Pp.x) / 2 - 8 * Math.sin(alpha), (cyPx + Pp.y) / 2 - 8 * Math.cos(alpha), `rgba(255,255,255,${0.85 * A.tri})`)
  }

  // Direction of rotation (Preveja).
  if (A.dir > 0.01) {
    ctx.save()
    ctx.globalAlpha = A.dir * 0.7
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cyPx, R * 1.2, -0.12, -0.8, true)
    ctx.stroke()
    ctx.restore()
    const e0 = pAt(0.72, 1.2)
    const e1 = pAt(0.82, 1.2)
    ctx.save()
    ctx.globalAlpha = A.dir * 0.7
    drawArrow(ctx, e0.x, e0.y, e1.x, e1.y, 'rgba(255,255,255,0.7)', 1.5, 8)
    ctx.restore()
  }

  // Marks (Resolva and Preveja).
  for (const m of Object.values(g.marks)) {
    if (m.a < 0.01) continue
    if (m.kind === 'pt') {
      const q = pAt(m.v)
      drawDot(ctx, q.x, q.y, 5.5, withAlpha(m.color, m.a), 0.5 * m.a)
      if (m.label) {
        const o = pAt(m.v, 1.26)
        const right = Math.cos(m.v) > 0.2
        const left = Math.cos(m.v) < -0.2
        text(ctx, m.label, o.x, o.y, withAlpha(m.color, m.a), right ? 'left' : left ? 'right' : 'center', 'middle', '500 12px ui-sans-serif, system-ui, sans-serif')
      }
    } else if (m.kind === 'x') {
      const X = P.x(g.rho * m.v)
      ctx.save()
      ctx.globalAlpha = m.a
      ctx.strokeStyle = m.color
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx, cyPx)
      ctx.lineTo(X, cyPx)
      ctx.stroke()
      ctx.restore()
      if (m.label) text(ctx, m.label, X, cyPx + 14, withAlpha(m.color, m.a), 'center', 'middle', '500 12px ui-sans-serif, system-ui, sans-serif')
    } else {
      const Y = P.y(g.cy + g.rho * m.v)
      ctx.save()
      ctx.globalAlpha = m.a
      ctx.strokeStyle = m.color
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx, cyPx)
      ctx.lineTo(cx, Y)
      ctx.stroke()
      ctx.restore()
      if (m.label) text(ctx, m.label, cx - 9, Y, withAlpha(m.color, m.a), 'right', 'middle', '500 12px ui-sans-serif, system-ui, sans-serif')
    }
  }

  // Projection line from the cabin to the graph.
  const wx = waveX(g.u)
  const wy = waveY(g.u)
  const onGraph = A.wave > 0.01 && g.u <= g.u1 + 1e-6
  if (A.proj > 0.01 && onGraph) {
    ctx.save()
    ctx.globalAlpha = A.proj * A.wave
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.setLineDash([3, 4])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Pp.x, Pp.y)
    ctx.lineTo(wx, wy)
    ctx.stroke()
    ctx.restore()
    drawDot(ctx, wx, wy, 4.5, withAlpha(accent, A.proj * A.wave), 0.6 * A.proj * A.wave)
  }

  // Velocity of the cabin and its vertical part (Preveja).
  if (A.vel > 0.01) {
    const L = 0.6 * g.rho
    const vx = -Math.sin(alpha) * L
    const vy = Math.cos(alpha) * L
    const P0 = { x: g.rho * Math.cos(alpha), y: g.cy + g.rho * Math.sin(alpha) }
    ctx.save()
    ctx.globalAlpha = A.vel
    drawArrow(ctx, Pp.x, Pp.y, P.x(P0.x + vx), P.y(P0.y + vy), 'rgba(255,255,255,0.75)', 1.6, 7)
    if (Math.abs(vy) > 0.04) drawArrow(ctx, Pp.x, Pp.y, Pp.x, P.y(P0.y + vy), accent, 3, 8)
    ctx.restore()
  }

  // The cabin (gondola) or the point P.
  if (wheelA > 0.01) {
    const gw = Math.max(13, R * 0.17)
    const gh = gw * 0.78
    ctx.save()
    ctx.globalAlpha = wheelA
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(Pp.x, Pp.y)
    ctx.lineTo(Pp.x, Pp.y + gh * 0.45)
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.shadowColor = accent
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.roundRect(Pp.x - gw / 2, Pp.y + gh * 0.4, gw, gh, gw * 0.3)
    ctx.fill()
    ctx.restore()
    drawDot(ctx, Pp.x, Pp.y, 3, `rgba(255,255,255,${wheelA})`)
  }
  if (A.pdot > 0.01) {
    drawDot(ctx, Pp.x, Pp.y, 6, withAlpha(accent, A.pdot * (1 - wheelA * 0.8)), 0.7 * A.pdot)
    const o = pAt(alpha, 1.17)
    text(ctx, 'P', o.x, o.y, `rgba(255,255,255,${0.8 * A.pdot * (1 - wheelA)})`, 'center', 'middle', 'italic 600 13px ui-serif, Georgia, serif')
  }
}

function drawRadianArcs(ctx: CanvasRenderingContext2D, g: Scene, P: ReturnType<typeof toPx>, prog: number[], accent: string, A: Record<Layer, number>) {
  const a = A.arcs
  const pt = (x: number, y: number) => ({ x: P.x(g.rho * x), y: P.y(g.cy + g.rho * y) })
  const colors = [accent, '#b6e3ff']
  for (let i = 0; i < 6; i++) {
    const p = prog[i] ?? 0
    if (p <= 0.001) continue
    // 0 → 0.4: the radius pivots at the rim until it is tangent; 0.4 → 1: it bends onto the rim.
    const r0 = { x: Math.cos(i), y: Math.sin(i) }
    const inward = { x: -r0.x, y: -r0.y }
    const pivot = Math.min(1, p / 0.4)
    const bend = Math.max(0, (p - 0.4) / 0.6)
    const ease = (s: number) => 1 - Math.pow(1 - s, 3)
    const ph = ease(pivot) * (Math.PI / 2)
    // Direction: inward rotated clockwise by ph (inward → tangent at ph = π/2).
    const dir = { x: inward.x * Math.cos(ph) + inward.y * Math.sin(ph), y: -inward.x * Math.sin(ph) + inward.y * Math.cos(ph) }
    const nrm = { x: -dir.y, y: dir.x }
    const k = ease(bend)
    ctx.save()
    ctx.globalAlpha = a * Math.min(1, p * 4)
    ctx.strokeStyle = colors[i % 2]
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.shadowColor = colors[i % 2]
    ctx.shadowBlur = 8
    ctx.beginPath()
    const N = 28
    for (let j = 0; j <= N; j++) {
      const s = j / N
      // Curve of length 1 with curvature k (k = 1 lies on the unit circle).
      const along = k < 1e-4 ? s : Math.sin(k * s) / k
      const side = k < 1e-4 ? 0 : (1 - Math.cos(k * s)) / k
      // Bend toward the centre: the normal must point inward once tangent.
      const sgn = nrm.x * inward.x + nrm.y * inward.y >= 0 ? 1 : -1
      const x = r0.x + dir.x * along + nrm.x * side * sgn
      const y = r0.y + dir.y * along + nrm.y * side * sgn
      const q = pt(x, y)
      if (j) ctx.lineTo(q.x, q.y)
      else ctx.moveTo(q.x, q.y)
    }
    ctx.stroke()
    ctx.restore()
    if (p > 0.95) {
      const q = pt(Math.cos(i + 0.5) * 1.17, Math.sin(i + 0.5) * 1.17)
      text(ctx, `${i + 1}`, q.x, q.y, withAlpha(colors[i % 2], a), 'center', 'middle', '600 12px ui-sans-serif, system-ui, sans-serif')
      // Tick at the end of the arc.
      const e0 = pt(Math.cos(i + 1) * 0.94, Math.sin(i + 1) * 0.94)
      const e1 = pt(Math.cos(i + 1) * 1.06, Math.sin(i + 1) * 1.06)
      ctx.save()
      ctx.globalAlpha = a
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(e0.x, e0.y)
      ctx.lineTo(e1.x, e1.y)
      ctx.stroke()
      ctx.restore()
    }
  }
  // π at half a turn, 2π at the full turn, and the leftover 0,28.
  const big = '600 12.5px ui-sans-serif, system-ui, sans-serif'
  if (A.piMark > 0.01) {
    const q = pt(-0.55, 0.22)
    text(ctx, 'π ≈ 3,14', q.x, q.y - 10, `rgba(255,255,255,${0.9 * A.piMark * a})`, 'center', 'middle', big)
    text(ctx, 'meia volta', q.x, q.y + 8, `rgba(255,255,255,${0.45 * A.piMark * a})`)
  }
  if (A.tauMark > 0.01) {
    ctx.save()
    ctx.globalAlpha = A.tauMark * a
    ctx.strokeStyle = COS
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(P.x(0), P.y(g.cy), g.rho * P.sx, -TAU, -6, false)
    ctx.stroke()
    ctx.restore()
    const q = pt(0.88, -0.4)
    text(ctx, 'sobra ≈ 0,28', q.x, q.y, withAlpha(COS, A.tauMark * a), 'right', 'middle')
    const r = pt(0.88, -0.22)
    text(ctx, '2π ≈ 6,28', r.x, r.y, `rgba(255,255,255,${0.9 * A.tauMark * a})`, 'right', 'middle', big)
  }
}
