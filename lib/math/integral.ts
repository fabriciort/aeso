// Pure math for the "Somando fatias infinitas" lab (integral): Riemann sums
// (left, right, midpoint), the trapezoid rule, antiderivatives of
// polynomials, the accumulated-area function and Usain Bolt's official
// 10 m splits from Berlin 2009. No DOM, fully testable (tests/integral.test.ts).

import { BOLT } from './derivative'

export type Fn = (x: number) => number
export type Method = 'left' | 'right' | 'mid'

export const METHODS: Method[] = ['left', 'mid', 'right']
export const METHOD_LABEL: Record<Method, string> = { left: 'Esquerda', mid: 'Meio', right: 'Direita' }

/** Where a slice [x0, x1] takes its height. */
export function samplePoint(x0: number, x1: number, m: Method): number {
  return m === 'left' ? x0 : m === 'right' ? x1 : (x0 + x1) / 2
}

export interface Rect {
  x0: number
  x1: number
  /** Sample point (where the height comes from). */
  s: number
  /** Height f(s) (may be negative). */
  h: number
}

/** The n rectangles of a Riemann sum of f on [a, b]. */
export function riemannRects(f: Fn, a: number, b: number, n: number, m: Method): Rect[] {
  const k = Math.max(1, Math.round(n))
  const dx = (b - a) / k
  const out: Rect[] = []
  for (let i = 0; i < k; i++) {
    const x0 = a + i * dx
    const x1 = a + (i + 1) * dx
    const s = samplePoint(x0, x1, m)
    out.push({ x0, x1, s, h: f(s) })
  }
  return out
}

/** Riemann sum Σ f(xᵢ) Δx with n equal slices. */
export function riemann(f: Fn, a: number, b: number, n: number, m: Method): number {
  const k = Math.max(1, Math.round(n))
  const dx = (b - a) / k
  let s = 0
  for (let i = 0; i < k; i++) s += f(samplePoint(a + i * dx, a + (i + 1) * dx, m))
  return s * dx
}

/** Trapezoid rule: the average of the left and right sums. */
export function trapezoid(f: Fn, a: number, b: number, n: number): number {
  const k = Math.max(1, Math.round(n))
  const dx = (b - a) / k
  let s = (f(a) + f(b)) / 2
  for (let i = 1; i < k; i++) s += f(a + i * dx)
  return s * dx
}

/** Composite Simpson rule (n rounded up to even); used as the "exact" reference. */
export function simpson(f: Fn, a: number, b: number, n = 400): number {
  if (a === b) return 0
  let k = Math.max(2, Math.round(n))
  if (k % 2) k++
  const dx = (b - a) / k
  let s = f(a) + f(b)
  for (let i = 1; i < k; i++) s += f(a + i * dx) * (i % 2 ? 4 : 2)
  return (s * dx) / 3
}

/** Accumulated area A(x) = ∫ₐˣ f(t) dt (signed). */
export function accumulate(f: Fn, a: number, x: number, n = 400): number {
  return simpson(f, a, x, n)
}

/** Signed area (displacement) and total area (distance, ∫|f|) on [a, b]. */
export function signedAndTotal(f: Fn, a: number, b: number, n = 2000): { signed: number; total: number } {
  return { signed: simpson(f, a, b, n), total: simpson((x) => Math.abs(f(x)), a, b, n) }
}

// ------------------------------------------------------------ polynomials

/** Polynomial as coefficients: [c0, c1, c2…] = c0 + c1·x + c2·x² + … */
export type Poly = number[]

export function evalPoly(p: Poly, x: number): number {
  let y = 0
  for (let i = p.length - 1; i >= 0; i--) y = y * x + p[i]
  return y
}

/** An antiderivative F (with F(0) = 0): xⁿ → xⁿ⁺¹ / (n + 1). */
export function antiderivative(p: Poly): Poly {
  return [0, ...p.map((c, i) => c / (i + 1))]
}

export function derivative(p: Poly): Poly {
  return p.slice(1).map((c, i) => c * (i + 1))
}

/** ∫ₐᵇ p(x) dx = F(b) − F(a) (Teorema Fundamental do Cálculo). */
export function definite(p: Poly, a: number, b: number): number {
  const F = antiderivative(p)
  return evalPoly(F, b) - evalPoly(F, a)
}

// ------------------------------------------------------------ Usain Bolt

/**
 * Usain Bolt, 100 m final, World Championships Berlin 2009 (9,58 s). The
 * official 10 m splits and reaction time come from lib/math/derivative.ts
 * (BOLT, shared with the "derivada" lab; IAAF Biomechanics Project,
 * Graubner & Nixdorf 2011).
 */
export const BOLT_REACTION = BOLT.reaction
export const BOLT_SPLITS = BOLT.times.slice(1)
export const BOLT_TIME = BOLT_SPLITS[BOLT_SPLITS.length - 1]
export const BOLT_SOURCE = BOLT.source

export interface Segment {
  t0: number
  t1: number
  /** Distance at the start of the segment (m). */
  d0: number
  /** Average speed on the segment (m/s) = 10 m ÷ duration. */
  v: number
}

/**
 * Ten 10 m segments with their average speed. The first one starts when
 * Bolt leaves the blocks (after the reaction time), so its area is 10 m too.
 */
export const BOLT_SEGMENTS: Segment[] = BOLT_SPLITS.map((t1, i) => {
  const t0 = i === 0 ? BOLT_REACTION : BOLT_SPLITS[i - 1]
  return { t0, t1, d0: i * 10, v: 10 / (t1 - t0) }
})

/** Fastest segment (highest average speed). */
export const BOLT_PEAK: Segment & { index: number } = BOLT_SEGMENTS.reduce<Segment & { index: number }>(
  (best, s, i) => (s.v > best.v ? { ...s, index: i } : best),
  { ...BOLT_SEGMENTS[0], index: 0 },
)

/** Average speed of the segment Bolt is on at time t (0 before he moves and after the line). */
export function boltVelocity(t: number): number {
  if (t < BOLT_REACTION || t > BOLT_TIME) return 0
  for (const s of BOLT_SEGMENTS) if (t <= s.t1) return s.v
  return 0
}

/** Distance run at time t: the area under the step graph from 0 to t. */
export function boltDistance(t: number): number {
  if (t <= BOLT_REACTION) return 0
  if (t >= BOLT_TIME) return 100
  for (const s of BOLT_SEGMENTS) if (t <= s.t1) return s.d0 + s.v * (t - s.t0)
  return 100
}

/** Sum of the step areas (v × Δt) of all segments: 100 m. */
export function boltArea(): number {
  return BOLT_SEGMENTS.reduce((acc, s) => acc + s.v * (s.t1 - s.t0), 0)
}
