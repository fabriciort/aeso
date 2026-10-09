'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { drawAxes, drawDot, drawFunction, MATH_FONT, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import DragSurface from '@/components/instruments/DragSurface'
import { haptic } from '@/lib/observatory/immersive'
import { coefficient, coefficients, correctDigits, eSums, evalPoly, FN, goodInterval, pendulumPeriodRatio, smallAngleError, TAYLOR_FNS, taylor, type TaylorFn } from '@/lib/math/taylor'
import { fmt, lerp, lerpViewport, toPx, type Frame, type Viewport } from '@/lib/math/view'
import { cn } from '@/lib/utils'
import { Panel, type StageProps } from '../runtime'
import {
  DERIV_CHAIN,
  DERIV_POLYS,
  DIALS,
  dialDone,
  dialsOf,
  derivsOf,
  eTermsOf,
  expDegOf,
  FN_TEX,
  GENERAL_SAY,
  GENERAL_TEX,
  LN_MAX,
  lnDegOf,
  num,
  PROBLEMS,
  problemState,
  QGEOM,
  seriesTerms,
  setDial,
  sinDegOf,
  solveOf,
  tapAction,
  type Answers,
  type TaylorLive,
  type TexTerm,
} from './shared'

// The continuous Palco of "Imitando curvas com polinômios".
//
// One graph for the whole lab. The copy (a polynomial, in the accent color)
// never cuts from one shape to another: its coefficients are eased frame by
// frame, which is the same as blending the two curves point by point, and
// new terms enter one at a time (a "ramp" on the degree). The real function
// is blended the same way (sen → eˣ → cos → ln(1 + x) → 1/(1 − x)), the
// window zooms in and out, and the band where the copy is good (error <
// 0,01) is recomputed from what is on screen every frame.

const NMAX = 32
const TOL = 0.01
const ROSE = '#fb7185'
const REAL = 'rgba(255,255,255,0.88)'

type Mix = Record<TaylorFn, number>
type Tone = 'accent' | 'real' | 'wrong'
interface Mark {
  x: number
  y: number
  a: number
  tone: Tone
}

interface Target {
  view: Viewport
  mix: Mix
  fnA: number
  poly: { fn: TaylorFn; deg: number } | number[]
  polyA: number
  /** 0 = accent copy, 1 = rose (a wrong choice). */
  wrong: number
  ghosts: number
  band: number
  walls: number
  zone: number
  tangent: number
  guideX: number
  guideA: number
  marks: Record<string, Mark>
  bound: { x: number; y: number; r: number; a: number; wrong: number }
  sums: number
  eCount: number
  pend: number
  theta: number
  dim: number
  degAxis: boolean
}

interface Display extends Omit<Target, 'poly'> {
  c: number[]
}

const ZERO_MIX: Mix = { sin: 0, cos: 0, exp: 0, ln1p: 0, geom: 0 }
const only = (fn: TaylorFn): Mix => ({ ...ZERO_MIX, [fn]: 1 })
const pad = (c: readonly number[]) => Array.from({ length: NMAX + 1 }, (_, i) => c[i] ?? 0)

const V_DIALS: Viewport = { x0: -3.4, x1: 3.4, y0: -2.2, y1: 2.2 }
const V_WIDE: Viewport = { x0: -7.5, x1: 7.5, y0: -3.4, y1: 3.4 }
const V_EXP: Viewport = { x0: -4.2, x1: 3.2, y0: -1.6, y1: 12 }
const V_LN: Viewport = { x0: -1.45, x1: 2.7, y0: -3.2, y1: 2.4 }
const V_GEOM: Viewport = { x0: -1.6, x1: 1.7, y0: -1.4, y1: 8.5 }
const V_PEND: Viewport = { x0: -0.08, x1: 1.62, y0: -0.14, y1: 1.75 }

export const DEFAULT_THETA = (25 * Math.PI) / 180

interface Inputs {
  stepId: string
  scene: number
  answers: Answers
  theta: number
}

function target(p: Inputs): Target {
  const { stepId, scene, answers: a } = p
  const t: Target = {
    view: V_DIALS,
    mix: only('sin'),
    fnA: 1,
    poly: [0],
    polyA: 0,
    wrong: 0,
    ghosts: 0,
    band: 0,
    walls: 0,
    zone: 0,
    tangent: 0,
    guideX: 0,
    guideA: 0,
    marks: {},
    bound: { x: 0.5, y: 1.6458, r: 0, a: 0, wrong: 0 },
    sums: 0,
    eCount: 1,
    pend: 0,
    theta: p.theta,
    dim: 0,
    degAxis: false,
  }
  switch (stepId) {
    case 'imagine': {
      const d = dialsOf(a)
      t.view = scene < 4 ? V_DIALS : V_WIDE
      t.poly = d
      t.polyA = 1
      t.ghosts = scene < 4 ? 1 : 0.35
      t.band = 1
      if (scene === 0) {
        t.marks.f0 = { x: 0, y: 0, a: 1, tone: 'real' }
        t.marks.c0 = { x: 0, y: d[0], a: 1, tone: 'accent' }
      }
      if (scene === 1) t.tangent = 1
      break
    }
    case 'preveja': {
      const answered100 = a.q100 !== undefined
      t.view = scene === 0 ? { x0: -4.2, x1: 4.2, y0: -2.4, y1: 2.4 } : scene === 3 && answered100 ? { x0: -32, x1: 32, y0: -4.5, y1: 4.5 } : { x0: -6.8, x1: 6.8, y0: -3.2, y1: 3.2 }
      t.poly = { fn: 'sin', deg: scene === 0 ? 3 : scene === 3 && answered100 ? 31 : 5 }
      t.polyA = 1
      t.ghosts = scene === 1 ? 0.7 : 0
      t.band = 1
      break
    }
    case 'entenda':
      if (scene === 0) {
        t.fnA = 0
        t.poly = DERIV_POLYS[Math.min(derivsOf(a), 3)]
        t.polyA = 1
        t.view = { x0: -2.3, x1: 2.3, y0: -9, y1: 12 }
      } else if (scene === 1) {
        t.poly = { fn: 'sin', deg: sinDegOf(a) }
        t.polyA = 1
        t.ghosts = 1
        t.band = 1
        t.view = V_WIDE
      } else {
        t.mix = only('exp')
        t.poly = { fn: 'exp', deg: expDegOf(a) }
        t.polyA = 1
        t.ghosts = scene === 2 ? 1 : 0.3
        t.band = 1
        t.view = V_EXP
      }
      break
    case 'observe':
      if (scene <= 1) {
        t.view = V_PEND
        t.poly = [0, 1]
        t.polyA = 1
        t.pend = 1
        t.degAxis = true
        t.marks.thR = { x: p.theta, y: Math.sin(p.theta), a: 1, tone: 'real' }
        t.marks.thC = { x: p.theta, y: p.theta, a: 1, tone: 'accent' }
      } else if (scene === 2) {
        t.view = { x0: -8.5, x1: 8.5, y0: -2.4, y1: 2.4 }
        t.poly = { fn: 'sin', deg: 13 }
        t.polyA = 1
        t.zone = 1
        t.band = 1
      } else {
        t.mix = only('exp')
        t.fnA = 0
        t.sums = 1
        t.eCount = eTermsOf(a)
        t.view = { x0: -0.9, x1: 12.4, y0: 0.6, y1: 3.15 }
      }
      break
    case 'resolva': {
      const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
      const st = problemState(prob, solveOf(a))
      const step = prob.steps[Math.min(st.current, prob.steps.length - 1)]
      const pick = st.wrong !== null ? step.options[st.wrong] : null
      t.mix = only(prob.fn)
      t.guideX = prob.x
      if (prob.id === 'p1') {
        const zoom = st.current >= 2
        t.view = zoom ? { x0: -0.15, x1: 1.05, y0: 0.2, y1: 2.6 } : { x0: -1.7, x1: 1.9, y0: -0.6, y1: 5.4 }
        t.guideA = zoom ? 0.6 : 0
        if (pick?.poly) {
          t.poly = pick.poly
          t.polyA = 1
          t.wrong = 1
        } else if (st.current >= 1) {
          t.poly = [1, 1, 1 / 2, 1 / 6]
          t.polyA = 1
        }
        t.marks.f0 = { x: 0, y: 1, a: zoom ? 0 : 1, tone: 'real' }
        if (zoom) {
          const v = pick?.value ?? 1 + 0.5 + 0.125 + 0.125 / 6
          t.marks.est = { x: 0.5, y: v, a: pick || st.solved ? 1 : 0, tone: pick ? 'wrong' : 'accent' }
          t.marks.real = { x: 0.5, y: Math.exp(0.5), a: st.solved ? 1 : 0, tone: 'real' }
        }
      } else if (prob.id === 'p2') {
        t.view = { x0: 0.3, x1: 0.62, y0: 1.636, y1: 1.657 }
        t.poly = [1, 1, 1 / 2, 1 / 6]
        t.polyA = 1
        t.guideA = 0.5
        t.marks.est = { x: 0.5, y: taylor('exp', 3, 0.5), a: 1, tone: 'accent' }
        t.marks.real = { x: 0.5, y: Math.exp(0.5), a: 1, tone: 'real' }
        const r = pick?.bound ?? (st.solved ? (2 * 0.5 ** 4) / 24 : 0)
        t.bound = { x: 0.5, y: taylor('exp', 3, 0.5), r: r || t.bound.r, a: r ? 1 : 0, wrong: pick ? 1 : 0 }
      } else {
        const picked = (solveOf(a)[step.id] ?? []).length > 0
        t.view = picked ? { x0: -0.06, x1: 0.46, y0: 0.72, y1: 1.1 } : { x0: -2.4, x1: 2.4, y0: -1.5, y1: 1.6 }
        t.guideA = 0.6
        const opt = pick ?? (st.solved ? step.options[step.answer] : null)
        if (opt?.poly) {
          t.poly = opt.poly
          t.polyA = 1
          t.wrong = pick ? 1 : 0
        }
        t.marks.est = { x: 0.2, y: opt?.value ?? 0.98, a: opt ? 1 : 0, tone: pick ? 'wrong' : 'accent' }
        t.marks.real = { x: 0.2, y: Math.cos(0.2), a: st.solved ? 1 : 0, tone: 'real' }
      }
      break
    }
    case 'e-se':
      if (scene <= 2) {
        t.mix = only('ln1p')
        t.view = V_LN
        t.poly = { fn: 'ln1p', deg: scene === 0 ? 1 : lnDegOf(a) }
        t.polyA = 1
        t.band = 1
        t.walls = scene === 2 ? 1 : scene === 1 ? 0.35 : 0
        t.guideX = 1.5
        t.guideA = scene >= 1 ? 0.45 : 0
        if (scene >= 1) {
          t.marks.lnR = { x: 1.5, y: Math.log(2.5), a: 1, tone: 'real' }
          t.marks.lnC = { x: 1.5, y: taylor('ln1p', lnDegOf(a), 1.5), a: 1, tone: 'accent' }
        }
      } else {
        const answered = a.geomGuess !== undefined
        t.mix = only('geom')
        t.view = V_GEOM
        t.poly = { fn: 'geom', deg: answered ? 24 : 1 }
        t.polyA = answered ? 1 : 0.6
        t.band = answered ? 1 : 0
        t.walls = answered ? 1 : 0
        t.marks.half = { x: 0.5, y: 2, a: answered ? 1 : 0, tone: 'real' }
      }
      break
    case 'conclua':
      t.view = { x0: -9.5, x1: 9.5, y0: -2.8, y1: 2.8 }
      t.poly = { fn: 'sin', deg: 15 }
      t.polyA = 1
      t.band = 1
      t.dim = 1
      break
  }
  return t
}

function polyTarget(t: Target, ramp: { fn: TaylorFn | null; deg: number }): number[] {
  if (Array.isArray(t.poly)) return pad(t.poly)
  return pad(coefficients(t.poly.fn, ramp.deg))
}

function initial(t: Target, ramp: { fn: TaylorFn | null; deg: number }): Display {
  const { poly: _poly, ...rest } = t // eslint-disable-line @typescript-eslint/no-unused-vars
  return { ...JSON.parse(JSON.stringify(rest)), c: polyTarget(t, ramp) }
}

function ease(d: Display, t: Target, c: number[], k: number) {
  d.view = lerpViewport(d.view, t.view, k)
  for (const fn of TAYLOR_FNS) d.mix[fn] = lerp(d.mix[fn], t.mix[fn], k)
  for (let i = 0; i <= NMAX; i++) d.c[i] = lerp(d.c[i], c[i], k)
  for (const key of ['fnA', 'polyA', 'wrong', 'ghosts', 'band', 'walls', 'zone', 'tangent', 'guideX', 'guideA', 'sums', 'eCount', 'pend', 'theta', 'dim'] as const) d[key] = lerp(d[key], t[key], k)
  d.degAxis = t.degAxis
  for (const key of ['x', 'y', 'r', 'a', 'wrong'] as const) d.bound[key] = lerp(d.bound[key], t.bound[key], k)
  for (const id of new Set([...Object.keys(d.marks), ...Object.keys(t.marks)])) {
    const m = t.marks[id]
    const cur = d.marks[id]
    if (!cur) {
      if (m) d.marks[id] = { ...m, a: 0 }
      continue
    }
    if (m) {
      cur.x = lerp(cur.x, m.x, k)
      cur.y = Number.isFinite(m.y) ? lerp(cur.y, m.y, k) : cur.y
      cur.a = lerp(cur.a, m.a, k)
      cur.tone = m.tone
    } else {
      cur.a = lerp(cur.a, 0, k)
      if (cur.a < 0.01) delete d.marks[id]
    }
  }
}

// ---------------------------------------------------------------- Palco

export default function TaylorStage({ lab, stepId, scene, answers, setAnswer, live, setLive }: StageProps) {
  const L = live as Partial<TaylorLive>
  const theta = num(L.theta, DEFAULT_THETA)
  const inputs: Inputs = { stepId, scene, answers, theta }
  const key = JSON.stringify([stepId, scene, theta, answers.dials, answers.q100, answers.derivs, answers.sinDeg, answers.expDeg, answers.eTerms, answers.solve, answers.lnDeg, answers.geomGuess])
  const tgt = useMemo(() => target(inputs), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Display | null>(null)
  const ramp = useRef<{ fn: TaylorFn | null; deg: number; last: number }>({ fn: null, deg: 0, last: 0 })
  const geo = useRef<{ view: Viewport; frame: Frame } | null>(null)
  const { ref, size, context } = useMathCanvas()
  const accent = lab.accent

  useEffect(() => {
    if (!size.w) return
    const reduced = prefersReducedMotion()
    const r = ramp.current
    const t0 = tgtRef.current
    if (!disp.current) {
      if (!Array.isArray(t0.poly)) r.fn = t0.poly.fn
      r.deg = Array.isArray(t0.poly) ? 0 : t0.poly.deg
      disp.current = initial(t0, r)
    }
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const t = tgtRef.current
      // Terms enter one at a time (skipping zero coefficients).
      if (Array.isArray(t.poly)) r.fn = null
      else {
        const { fn, deg } = t.poly
        if (r.fn !== fn) {
          // Coming from a hand-made copy, morph straight to the target;
          // switching functions, keep at most the terms already shown.
          r.deg = r.fn === null ? deg : Math.min(r.deg, deg)
          r.fn = fn
        }
        if (reduced) r.deg = deg
        else if (r.deg !== deg && now - r.last > 130) {
          const dir = deg > r.deg ? 1 : -1
          do r.deg += dir
          while (r.deg !== deg && coefficient(fn, r.deg + (dir < 0 ? 1 : 0)) === 0)
          r.last = now
        }
      }
      const d = disp.current!
      ease(d, t, polyTarget(t, r), reduced ? 1 : 1 - Math.exp(-dt / 170))
      const ctx = context()
      if (ctx) draw(ctx, d, size.w, size.h, now / 1000, accent, geo)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, accent])

  return (
    <Panel>
      <canvas ref={ref} role="img" aria-label={ariaLabel(stepId, scene, answers, theta)} className="absolute inset-0 touch-none" />
      <StageInput stepId={stepId} scene={scene} answers={answers} setAnswer={setAnswer} setLive={setLive} geo={geo} theta={theta} />
      <Overlays stepId={stepId} scene={scene} answers={answers} theta={theta} accent={accent} size={size} view={tgt.view} />
    </Panel>
  )
}

// ---------------------------------------------------------------- drawing

function draw(ctx: CanvasRenderingContext2D, d: Display, W: number, H: number, time: number, accent: string, geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>) {
  const f: Frame = { left: 0, top: 0, width: W, height: H }
  const v = d.view
  geo.current = { view: v, frame: f }
  const p = toPx(v, f)
  const G = 1 - 0.55 * d.dim
  const fMix = (x: number) => {
    let s = 0
    for (const fn of TAYLOR_FNS) {
      const w = d.mix[fn]
      if (w > 0.002) s += w * FN[fn](x)
    }
    return s
  }
  const P = (x: number) => evalPoly(d.c, x)
  const axisY = Math.min(Math.max(p.y(0), f.top), f.top + f.height)

  drawAxes(ctx, v, f, {
    alpha: G,
    ...(d.degAxis ? { xStep: Math.PI / 12, formatX: (x: number) => `${Math.round((x * 180) / Math.PI)}°` } : {}),
  })

  // Calculator zone |x| ≤ π/4.
  if (d.zone > 0.01) {
    const a = p.x(-Math.PI / 4)
    const b = p.x(Math.PI / 4)
    ctx.save()
    ctx.fillStyle = `rgba(255,255,255,${0.06 * d.zone * G})`
    ctx.fillRect(a, 0, b - a, H)
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * d.zone * G})`
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(a, 0)
    ctx.lineTo(a, H)
    ctx.moveTo(b, 0)
    ctx.lineTo(b, H)
    ctx.stroke()
    ctx.restore()
  }

  // Radius-of-convergence walls at x = ±1.
  if (d.walls > 0.01) {
    ctx.save()
    for (const sx of [-1, 1]) {
      const X = p.x(sx)
      ctx.fillStyle = `rgba(251,113,133,${0.05 * d.walls * G})`
      if (sx > 0) ctx.fillRect(X, 0, W - X, H)
      else ctx.fillRect(0, 0, X, H)
      ctx.strokeStyle = `rgba(251,113,133,${0.7 * d.walls * G})`
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(X, 0)
      ctx.lineTo(X, H)
      ctx.stroke()
    }
    ctx.restore()
  }

  // The band where the copy is good (error < 0,01), from what is on screen.
  if (d.band > 0.01 && d.polyA > 0.3) {
    const xmax = Math.max(Math.abs(v.x0), Math.abs(v.x1))
    const [lo, hi] = goodInterval(fMix, d.c, TOL, xmax, (v.x1 - v.x0) / 500)
    if (hi - lo > 1e-6) {
      const a = p.x(lo)
      const b = p.x(hi)
      ctx.save()
      ctx.globalAlpha = d.band * G
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, hexA(accent, 0.02))
      g.addColorStop(0.5, hexA(accent, 0.1))
      g.addColorStop(1, hexA(accent, 0.02))
      ctx.fillStyle = g
      ctx.fillRect(a, 0, Math.max(1.5, b - a), H)
      ctx.strokeStyle = accent
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(a, axisY)
      ctx.lineTo(b, axisY)
      ctx.stroke()
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(a, axisY - 7)
      ctx.lineTo(a, axisY + 7)
      ctx.moveTo(b, axisY - 7)
      ctx.lineTo(b, axisY + 7)
      ctx.stroke()
      ctx.restore()
    }
  }

  // Vertical guide at the x of the problem.
  if (d.guideA > 0.01) {
    ctx.save()
    ctx.strokeStyle = `rgba(255,255,255,${0.28 * d.guideA * G})`
    ctx.setLineDash([2, 5])
    ctx.beginPath()
    ctx.moveTo(p.x(d.guideX), 0)
    ctx.lineTo(p.x(d.guideX), H)
    ctx.stroke()
    ctx.restore()
  }

  // The real curve.
  drawFunction(ctx, fMix, v, f, { color: REAL, width: 2.4, alpha: d.fnA * G })

  // e = Σ 1/n! as dots climbing toward the dashed line y = e.
  if (d.sums > 0.01) drawSums(ctx, d, p, W, accent, G)

  // Ghost terms: each cₙxⁿ alone, faint and dashed.
  if (d.ghosts > 0.01 && d.polyA > 0.01) {
    let shown = 0
    for (let n = 0; n <= NMAX && shown < 8; n++) {
      const cn = d.c[n]
      if (Math.abs(cn) < 1e-7) continue
      shown++
      drawFunction(ctx, (x) => cn * x ** n, v, f, { color: accent, width: 1.2, alpha: 0.42 * d.ghosts * d.polyA * G, dash: [3, 5] })
    }
  }

  // Tangent guide y = x (the slope the copy must match).
  if (d.tangent > 0.01) drawFunction(ctx, (x) => x, v, f, { color: 'rgba(255,255,255,0.9)', width: 1.2, alpha: 0.3 * d.tangent * G, dash: [6, 6] })

  // The copy.
  if (d.polyA > 0.01) {
    drawFunction(ctx, P, v, f, { color: accent, width: 3, alpha: d.polyA * (1 - d.wrong) * G, glow: true })
    if (d.wrong > 0.01) drawFunction(ctx, P, v, f, { color: ROSE, width: 3, alpha: d.polyA * d.wrong * G })
  }

  // Pendulum: the error segment between θ and sen θ, plus a little pendulum.
  if (d.pend > 0.01) drawPendulum(ctx, d, p, W, time, accent)

  // Error bracket (Lagrange).
  if (d.bound.a > 0.01) {
    const b = d.bound
    const X = p.x(b.x) + 22
    const y0 = p.y(b.y - b.r)
    const y1 = p.y(b.y + b.r)
    const col = b.wrong > 0.5 ? ROSE : accent
    ctx.save()
    ctx.globalAlpha = b.a * G
    ctx.fillStyle = hexA(b.wrong > 0.5 ? ROSE : accent, 0.12)
    ctx.fillRect(p.x(b.x) - 26, y1, 52, y0 - y1)
    ctx.strokeStyle = col
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(X, y0)
    ctx.lineTo(X, y1)
    ctx.moveTo(X - 6, y0)
    ctx.lineTo(X + 6, y0)
    ctx.moveTo(X - 6, y1)
    ctx.lineTo(X + 6, y1)
    ctx.stroke()
    ctx.restore()
  }

  for (const m of Object.values(d.marks)) {
    if (m.a < 0.02) continue
    const X = p.x(m.x)
    const Y = p.y(m.y)
    if (!Number.isFinite(Y) || Y < -20 || Y > H + 20) continue
    ctx.save()
    ctx.globalAlpha = m.a * G
    drawDot(ctx, X, Y, m.tone === 'real' ? 4.5 : 5.5, m.tone === 'real' ? '#ffffff' : m.tone === 'wrong' ? ROSE : accent, 0.8)
    ctx.restore()
  }
}

function drawSums(ctx: CanvasRenderingContext2D, d: Display, p: ReturnType<typeof toPx>, W: number, accent: string, G: number) {
  const s = eSums(13)
  ctx.save()
  ctx.globalAlpha = d.sums * G
  const Ye = p.y(Math.E)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.setLineDash([5, 5])
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, Ye)
  ctx.lineTo(W, Ye)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.font = MATH_FONT
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('e = 2,718281828…', W - 10, Ye + 8)
  const n = d.eCount
  ctx.strokeStyle = hexA(accent, 0.6)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let k = 0; k < Math.ceil(n) && k < s.length; k++) {
    const X = p.x(k)
    const Y = p.y(s[k])
    if (k) ctx.lineTo(X, Y)
    else ctx.moveTo(X, Y)
  }
  ctx.stroke()
  for (let k = 0; k < Math.ceil(n) && k < s.length; k++) {
    const a = Math.min(1, n - k + 0.001)
    if (a <= 0.01) continue
    ctx.save()
    ctx.globalAlpha = a * d.sums * G
    drawDot(ctx, p.x(k), p.y(s[k]), 4.5, accent, 0.6)
    ctx.restore()
  }
  ctx.restore()
}

function drawPendulum(ctx: CanvasRenderingContext2D, d: Display, p: ReturnType<typeof toPx>, W: number, time: number, accent: string) {
  const th = d.theta
  ctx.save()
  ctx.globalAlpha = d.pend
  ctx.strokeStyle = ROSE
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(p.x(th), p.y(Math.sin(th)))
  ctx.lineTo(p.x(th), p.y(th))
  ctx.stroke()
  // The little pendulum swings with the chosen amplitude.
  const L = 60
  const ox = W - 70
  const oy = p.y(0.72)
  const phi = th * Math.cos((2 * Math.PI * time) / 1.9)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 4])
  ctx.beginPath()
  ctx.arc(ox, oy, L, Math.PI / 2 - th, Math.PI / 2 + th)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(ox - 14, oy)
  ctx.lineTo(ox + 14, oy)
  ctx.moveTo(ox, oy)
  const bx = ox + L * Math.sin(phi)
  const by = oy + L * Math.cos(phi)
  ctx.lineTo(bx, by)
  ctx.stroke()
  drawDot(ctx, bx, by, 7, accent, 0.6)
  ctx.restore()
}

function hexA(color: string, a: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

// ---------------------------------------------------------------- input

function StageInput({
  stepId,
  scene,
  answers,
  setAnswer,
  setLive,
  geo,
  theta,
}: {
  stepId: string
  scene: number
  answers: Answers
  setAnswer: (key: string, value: unknown) => void
  setLive: (patch: Record<string, unknown>) => void
  geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>
  theta: number
}) {
  const latest = useRef(answers)
  latest.current = answers
  const acc = useRef(0)
  const [tapped, setTapped] = useState<string | null>(null)
  const dragging = useRef(false)
  const lastTheta = useRef(theta)

  // Dials of the copy machine (Imagine).
  if (stepId === 'imagine' && scene < 4 && !dialDone(dialsOf(answers), scene)) {
    const dial = DIALS[scene]
    return (
      <DragSurface
        key={`dial-${scene}`}
        hint={`Arraste para girar o dial c${'₀₁₂₃'[scene]}`}
        onDrag={(dy) => {
          const a = latest.current
          const d = dialsOf(a)
          const next = setDial(a, setAnswer, scene, d[scene] - (dy * (dial.max - dial.min)) / 300)
          latest.current = { ...a, dials: next }
        }}
      />
    )
  }

  // Degree of the copy of ln(1 + x) (E se…?).
  if (stepId === 'e-se' && scene === 1) {
    return (
      <DragSurface
        hint="Arraste para cima para somar termos"
        onDrag={(dy) => {
          acc.current -= dy / 16
          const cur = lnDegOf(latest.current)
          const step = Math.trunc(acc.current)
          if (step !== 0) {
            acc.current -= step
            const next = Math.min(LN_MAX, Math.max(1, cur + step))
            if (next !== cur) {
              latest.current = { ...latest.current, lnDeg: next }
              setAnswer('lnDeg', next)
              haptic(4)
            }
          }
        }}
      />
    )
  }

  // Pendulum angle: drag sideways on the graph.
  if (stepId === 'observe' && scene <= 1) {
    const set = (e: React.PointerEvent) => {
      const g = geo.current
      if (!g) return
      const r = e.currentTarget.getBoundingClientRect()
      const x = toPx(g.view, g.frame).fromX(e.clientX - r.left)
      const th = Math.min((85 * Math.PI) / 180, Math.max(Math.PI / 180, x))
      const step = Math.PI / 18
      if (Math.floor(th / step) !== Math.floor(lastTheta.current / step)) haptic(4)
      lastTheta.current = th
      setLive({ theta: th })
    }
    return (
      <div
        className="absolute inset-0 z-[1] cursor-ew-resize"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          dragging.current = true
          setTapped('theta')
          set(e)
        }}
        onPointerMove={(e) => dragging.current && set(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <Hint show={tapped !== 'theta'} text="Arraste para os lados para mudar o ângulo" />
      </div>
    )
  }

  // Tap the Palco to grow something (derive, add a term).
  const tapKey = `${stepId}-${scene}`
  if ((stepId === 'entenda' && scene <= 2) || (stepId === 'observe' && scene === 3)) {
    const text = stepId === 'entenda' && scene === 0 ? 'Toque no palco para derivar' : 'Toque no palco para somar um termo'
    return (
      <button
        aria-label={text}
        className="absolute inset-0 z-[1] cursor-pointer"
        onClick={() => {
          if (tapAction(stepId, scene, latest.current, setAnswer)) setTapped(tapKey)
        }}
      >
        <Hint show={tapped !== tapKey} text={text} />
      </button>
    )
  }
  return null
}

function Hint({ show, text }: { show: boolean; text: string }) {
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="whitespace-nowrap rounded-full bg-black/60 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur-xl"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

// ---------------------------------------------------------------- overlays

const chip = 'pointer-events-none absolute z-10 rounded-2xl bg-black/50 px-3 py-1.5 text-[12px] leading-snug text-white/85 backdrop-blur-xl'

function bandText(lo: number, hi: number): string {
  if (hi - lo < 0.004) return 'cópia boa: em nenhum trecho'
  const d = hi - lo < 0.2 ? 3 : 2
  if (Math.abs(hi + lo) < 0.02) return `cópia boa: |x| < ${fmt(hi, d)}`
  return `cópia boa: de ${fmt(lo, d)} a ${fmt(hi, d)}`
}

function Overlays({
  stepId,
  scene,
  answers,
  theta,
  accent,
  size,
  view,
}: {
  stepId: string
  scene: number
  answers: Answers
  theta: number
  accent: string
  size: { w: number; h: number }
  view: Viewport
}) {
  const info = useMemo(() => {
    const band = (f: (x: number) => number, c: number[], xmax = 40) => goodInterval(f, c, TOL, xmax, xmax / 4000)
    switch (stepId) {
      case 'imagine': {
        const [lo, hi] = band(Math.sin, dialsOf(answers), 8)
        return { text: bandText(lo, hi), legend: scene < 4 ? 'curva misteriosa' : 'sen x' }
      }
      case 'preveja': {
        const deg = scene === 0 ? 3 : scene === 3 && answers.q100 !== undefined ? 31 : 5
        const [lo, hi] = band(Math.sin, coefficients('sin', deg))
        return { text: `grau ${deg} · ${bandText(lo, hi)}`, legend: 'sen x' }
      }
      case 'entenda': {
        if (scene === 0 || scene === 3) return { text: null, legend: null }
        const fn: TaylorFn = scene === 1 ? 'sin' : 'exp'
        const deg = scene === 1 ? sinDegOf(answers) : expDegOf(answers)
        const [lo, hi] = band(FN[fn], coefficients(fn, deg))
        return { text: `grau ${deg} · ${bandText(lo, hi)}`, legend: FN_TEX[fn].name }
      }
      case 'observe':
        if (scene === 2) return { text: 'grau 13 · em |x| ≤ π/4, erro < 10⁻¹³', legend: 'sen x' }
        return { text: null, legend: null }
      case 'e-se': {
        if (scene === 3) return { text: answers.geomGuess !== undefined ? 'em x = 0,5: 1 + 0,5 + 0,25 + … = 2' : null, legend: '1/(1 − x)' }
        const deg = scene === 0 ? 1 : lnDegOf(answers)
        const T = taylor('ln1p', deg, 1.5)
        return { text: scene === 0 ? null : `grau ${deg} · x = 1,5: ${Math.abs(T) > 999 ? (T > 0 ? '> 999' : '< −999') : fmt(T, 1)} (real ${fmt(Math.log(2.5))})`, legend: 'ln(1 + x)' }
      }
      case 'resolva': {
        const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
        return { text: prob.title, legend: FN_TEX[prob.fn].name }
      }
      default:
        return { text: null, legend: null }
    }
  }, [stepId, scene, answers])

  const formula = formulaFor(stepId, scene, answers)
  const px = size.w ? toPx(view, { left: 0, top: 0, width: size.w, height: size.h }) : null

  return (
    <>
      <AnimatePresence>
        {info.text && (
          <motion.div key={`t-${stepId}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn(chip, 'left-3 top-3 font-mono tabular-nums')}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: accent }} />
            <motion.span key={info.text} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
              {info.text}
            </motion.span>
          </motion.div>
        )}
        {info.legend && !formula && (
          <motion.div key={`l-${stepId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(chip, 'right-3 top-3 hidden flex-col gap-0.5 sm:flex')}>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-white/85" /> {info.legend}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full" style={{ background: accent }} /> cópia
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{formula && <Formula key={`f-${stepId}`} {...formula} />}</AnimatePresence>
      <AnimatePresence>{stepId === 'observe' && scene <= 1 && <PendulumReadout key="pend" theta={theta} period={scene === 1} />}</AnimatePresence>
      <AnimatePresence>{stepId === 'observe' && scene === 3 && <SumReadout key="sum" n={eTermsOf(answers)} accent={accent} />}</AnimatePresence>
      <AnimatePresence>{stepId === 'resolva' && <Notebook key="nb" scene={scene} answers={answers} />}</AnimatePresence>
      <AnimatePresence>{stepId === 'conclua' && <Finale key="fin" accent={accent} />}</AnimatePresence>

      <AnimatePresence>
        {px && stepId === 'e-se' && (scene === 2 || (scene === 3 && answers.geomGuess !== undefined)) && (
          <>
            {[-1, 1].map((sx) => (
              <motion.span
                key={`w${sx}`}
                initial={{ opacity: 0, x: '-50%' }}
                animate={{ opacity: 1, x: '-50%', left: px.x(sx) }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                className="pointer-events-none absolute bottom-3 z-10 whitespace-nowrap rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] text-rose-100 backdrop-blur-xl"
                style={{ left: px.x(sx) }}
              >
                x = {sx < 0 ? '−1' : '1'}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function formulaFor(stepId: string, scene: number, answers: Answers): { lead: { tex: string; say: string }; terms: TexTerm[]; tail?: boolean; big?: boolean } | null {
  if (stepId === 'entenda' && scene === 0) {
    const n = derivsOf(answers)
    return {
      lead: { tex: '', say: '' },
      terms: DERIV_CHAIN.slice(0, n + 1).map((c, i) => ({ key: `d${i}`, tex: (i ? '\\to ' : '') + c.tex, say: (i ? 'deriva para ' : '') + c.say })),
      big: true,
    }
  }
  if (stepId === 'entenda' && scene <= 2) {
    const fn: TaylorFn = scene === 1 ? 'sin' : 'exp'
    return { lead: { tex: `${FN_TEX[fn].tex} \\approx`, say: `${FN_TEX[fn].say} é aproximadamente` }, terms: seriesTerms(fn, scene === 1 ? sinDegOf(answers) : expDegOf(answers)), tail: true }
  }
  if (stepId === 'entenda' && scene === 3) return { lead: { tex: GENERAL_TEX, say: GENERAL_SAY }, terms: [], big: true }
  if (stepId === 'e-se' && scene <= 2) return { lead: { tex: '\\ln(1+x) \\approx', say: 'logaritmo natural de 1 mais x é aproximadamente' }, terms: seriesTerms('ln1p', scene === 0 ? 1 : lnDegOf(answers)), tail: true }
  if (stepId === 'e-se' && scene === 3) {
    const answered = answers.geomGuess !== undefined
    return { lead: { tex: '\\frac{1}{1-x} =', say: '1 sobre 1 menos x é igual a' }, terms: seriesTerms('geom', answered ? 3 : 1), tail: true }
  }
  return null
}

/** The series, written term by term (long ones keep the first two and the last two). */
function Formula({ lead, terms, tail, big }: { lead: { tex: string; say: string }; terms: TexTerm[]; tail?: boolean; big?: boolean }) {
  const shown: (TexTerm | 'dots')[] = terms.length > 5 ? [terms[0], terms[1], 'dots', ...terms.slice(-2)] : terms
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={cn('pointer-events-none absolute inset-x-3 z-10 flex justify-center', big ? 'top-4' : 'top-12')}
    >
      <div className={cn('flex max-w-full flex-wrap items-center justify-center gap-x-1 rounded-2xl bg-black/55 px-3 py-1.5 text-white backdrop-blur-xl', big ? 'text-[17px]' : 'text-[14px] sm:text-[16px]')}>
        {lead.tex && <Tex say={lead.say}>{lead.tex}</Tex>}
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((t) =>
            t === 'dots' ? (
              <motion.span key="dots" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Tex say="e assim por diante">{'+\\cdots'}</Tex>
              </motion.span>
            ) : (
              <motion.span
                key={t.key}
                layout
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <Tex say={t.say}>{t.tex}</Tex>
              </motion.span>
            ),
          )}
        </AnimatePresence>
        {tail && <Tex say="mais termos">{'+\\cdots'}</Tex>}
      </div>
    </motion.div>
  )
}

function PendulumReadout({ theta, period }: { theta: number; period: boolean }) {
  const degs = (theta * 180) / Math.PI
  const err = smallAngleError(theta)
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn(chip, 'left-3 top-3 font-mono tabular-nums')}>
      <p>
        θ = {fmt(degs, 0)}° = {fmt(theta, 4)} rad
      </p>
      <p className="text-white/60">sen θ = {fmt(Math.sin(theta), 4)}</p>
      <p className="text-rose-200">erro de sen θ ≈ θ: {fmt(err * 100, 2)} %</p>
      <AnimatePresence>
        {period && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-white/80">
            período real: +{fmt((pendulumPeriodRatio(theta) - 1) * 100, 2)} %
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SumReadout({ n, accent }: { n: number; accent: string }) {
  const S = eSums(n)[n - 1]
  const ok = correctDigits(S, Math.E)
  const digits = S.toFixed(9)
  let seen = 0
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn(chip, 'left-3 top-3 font-mono tabular-nums')}>
      <p className="text-white/60">
        {n} {n === 1 ? 'termo' : 'termos'} · {ok} {ok === 1 ? 'algarismo certo' : 'algarismos certos'}
      </p>
      <p className="text-[15px]">
        {digits.split('').map((ch, i) => {
          if (ch === '.') return <span key={i}>,</span>
          const good = seen++ < ok
          return (
            <span key={i} style={{ color: good ? accent : 'rgba(255,255,255,0.4)' }}>
              {ch}
            </span>
          )
        })}
      </p>
    </motion.div>
  )
}

function Notebook({ scene, answers }: { scene: number; answers: Answers }) {
  const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
  const st = problemState(prob, solveOf(answers))
  const lines = prob.steps.slice(0, st.current).map((s) => s.line)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex flex-col items-start gap-1">
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.div
            key={`${prob.id}-${l.tex}`}
            layout
            initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="max-w-full rounded-xl border-l-2 border-white/25 bg-black/55 px-2.5 py-1 text-[13px] text-white/90 backdrop-blur-xl sm:text-[14px]"
          >
            <Tex say={l.say}>{l.tex}</Tex>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function Finale({ accent }: { accent: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative h-24 w-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${hexA(accent, 0.45)}, transparent 70%)` }}
        />
        <svg viewBox="0 0 120 120" className="relative h-full w-full" aria-hidden>
          <motion.circle cx="60" cy="60" r="52" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
          <motion.circle cx="60" cy="60" r="44" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.3 }} style={{ originX: '60px', originY: '60px' }} />
          {/* sen x and its copy, drawn into the medal */}
          <motion.path d="M24 60 C 36 30, 48 30, 60 60 S 84 90, 96 60" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
          <motion.path d="M34 92 C 44 50, 50 46, 60 60 S 76 70, 86 28" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 0" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.8 }} />
        </svg>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 80, opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 0.9 + i * 0.02, ease: 'easeOut' }}
            />
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 1.1 }}
        className="rounded-2xl bg-black/55 px-4 py-2 text-[17px] text-white backdrop-blur-xl sm:text-[21px]"
      >
        <Tex block say="f de x é igual à soma, de n igual a zero até infinito, da n-ésima derivada de f em zero, sobre n fatorial, vezes x elevado a n">
          {'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}\\,x^n'}
        </Tex>
      </motion.div>
    </motion.div>
  )
}

function ariaLabel(stepId: string, scene: number, answers: Answers, theta: number): string {
  switch (stepId) {
    case 'imagine': {
      const d = dialsOf(answers)
      return `Curva ${scene < 4 ? 'misteriosa' : 'seno'} e a cópia com c0 = ${fmt(d[0])}, c1 = ${fmt(d[1])}, c2 = ${fmt(d[2])}, c3 = ${fmt(d[3])}`
    }
    case 'preveja':
      return 'Seno e sua cópia polinomial; a janela se afasta para mostrar onde a cópia falha'
    case 'entenda':
      return scene === 0 ? `Gráfico de x ao cubo após ${derivsOf(answers)} derivadas` : scene === 1 ? `Seno e sua cópia de grau ${sinDegOf(answers)}` : `Exponencial e sua cópia de grau ${expDegOf(answers)}`
    case 'observe':
      return scene <= 1
        ? `Seno de teta e a reta teta; teta = ${fmt((theta * 180) / Math.PI, 0)} graus, erro ${fmt(smallAngleError(theta) * 100, 2)} por cento`
        : scene === 2
          ? 'Seno e a cópia de grau 13; destaque no trecho entre menos pi sobre 4 e pi sobre 4'
          : `Somas parciais de 1 sobre n fatorial com ${eTermsOf(answers)} termos, subindo até o número e`
    case 'resolva':
      return `Problema ${scene + 1}: ${PROBLEMS[Math.min(scene, 2)].title}`
    case 'e-se':
      return scene <= 2 ? `ln de 1 mais x e a cópia de grau ${lnDegOf(answers)}; ela diverge depois de x = 1` : `1 sobre 1 menos x e a série geométrica; raio de convergência 1 (${QGEOM.options[0]})`
    default:
      return 'Seno e sua cópia de grau 15, com a fórmula de Taylor'
  }
}
