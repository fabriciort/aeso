'use client'

import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { prefersReducedMotion } from '@/components/math/canvas'

// The notation morph of "Entenda": Σ f(xᵢ) Δx → ∫ f(x) dx. The Σ glyph is
// one path that stretches into the long S of Leibniz (summa), point by
// point; the subscript i fades away and Δ turns into d.

type Pt = [number, number]

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
  }
  return out
}

function polyline(pts: Pt[], n: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const t = j / n
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

/** Resamples a dense path into `n` points evenly spaced along its length. */
function resample(path: Pt[], n: number): Pt[] {
  const acc = [0]
  for (let i = 1; i < path.length; i++) acc.push(acc[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]))
  const total = acc[acc.length - 1]
  const out: Pt[] = []
  let j = 0
  for (let i = 0; i < n; i++) {
    const s = (total * i) / (n - 1)
    while (j < acc.length - 2 && acc[j + 1] < s) j++
    const t = (s - acc[j]) / (acc[j + 1] - acc[j] || 1)
    out.push([path[j][0] + (path[j + 1][0] - path[j][0]) * t, path[j][1] + (path[j + 1][1] - path[j][1]) * t])
  }
  return out
}

const N = 90
// Σ in a 60 × 120 box (vertically centered), ∫ taller: the "S alongado".
const SIGMA = resample(polyline([[50, 28], [10, 28], [33, 60], [10, 92], [50, 92]], 60), N)
const INTEGRAL = resample(
  [...cubic([49, 16], [46, 2], [36, 2], [34, 18], 40), ...cubic([34, 18], [31, 50], [29, 72], [26, 100], 60).slice(1), ...cubic([26, 100], [24, 117], [14, 118], [11, 104], 40).slice(1)],
  N,
)

const smooth = (t: number) => t * t * (3 - 2 * t)

function pathAt(p: number): string {
  const t = smooth(Math.min(1, Math.max(0, p)))
  return SIGMA.map((a, i) => {
    const b = INTEGRAL[i]
    return `${i ? 'L' : 'M'}${(a[0] + (b[0] - a[0]) * t).toFixed(2)} ${(a[1] + (b[1] - a[1]) * t).toFixed(2)}`
  }).join(' ')
}

const MATH = { fontFamily: 'KaTeX_Math, "Times New Roman", serif', fontStyle: 'italic' as const }
const MAIN = { fontFamily: 'KaTeX_Main, "Times New Roman", serif' }

function Swap({ p, from, to, className }: { p: MotionValue<number>; from: React.ReactNode; to: React.ReactNode; className?: string }) {
  const a = useTransform(p, [0.25, 0.6], [1, 0])
  const b = useTransform(p, [0.45, 0.85], [0, 1])
  const ya = useTransform(p, [0.25, 0.6], [0, -6])
  const yb = useTransform(p, [0.45, 0.85], [6, 0])
  return (
    <span className={`relative inline-grid ${className ?? ''}`}>
      <motion.span style={{ opacity: a, y: ya, gridArea: '1 / 1' }}>{from}</motion.span>
      <motion.span style={{ opacity: b, y: yb, gridArea: '1 / 1' }}>{to}</motion.span>
    </span>
  )
}

export function MorphNotation({ accent, replay, result }: { accent: string; replay: number; result: string | null }) {
  const p = useMotionValue(0)
  const d = useTransform(p, pathAt)
  const subW = useTransform(p, [0.2, 0.6], [0.42, 0])
  const subO = useTransform(p, [0.15, 0.45], [1, 0])
  const subWidth = useTransform(subW, (w) => `${w}em`)

  useEffect(() => {
    if (prefersReducedMotion()) {
      p.set(1)
      return
    }
    p.set(0)
    const c = animate(p, 1, { duration: 1.8, delay: 0.7, ease: [0.65, 0, 0.35, 1] })
    return () => c.stop()
  }, [replay, p])

  return (
    <div
      className="flex h-full items-center gap-1 text-[clamp(24px,4.4svh,40px)] leading-none text-white"
      role="math"
      aria-label="A soma de f de x i vezes delta x vira a integral de a até b de f de x d x"
    >
      <span className="relative flex h-full items-center">
        <svg viewBox="0 0 60 120" className="h-[92%] w-auto overflow-visible" aria-hidden>
          <motion.path d={d} fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }} />
        </svg>
        <span className="absolute -right-3 top-0 text-[0.42em] text-white/80">
          <Swap p={p} from={<span style={MATH}>n</span>} to={<span style={MAIN}>2</span>} />
        </span>
        <span className="absolute -right-3 bottom-0 text-[0.42em] text-white/80">
          <Swap p={p} from={<span style={MATH}>i=1</span>} to={<span style={MAIN}>0</span>} />
        </span>
      </span>
      <span className="ml-3 flex items-baseline">
        <span style={MATH}>f</span>
        <span style={MAIN}>(</span>
        <span style={MATH}>x</span>
        <motion.span style={{ ...MATH, width: subWidth, opacity: subO, fontSize: '0.6em', display: 'inline-block', overflow: 'hidden', transform: 'translateY(0.25em)' }}>i</motion.span>
        <span style={MAIN}>)</span>
        <span className="ml-[0.25em]">
          <Swap p={p} from={<span style={MAIN}>Δ</span>} to={<span style={MATH}>d</span>} />
        </span>
        <span style={MATH}>x</span>
        {result && (
          <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="ml-[0.3em]" style={MAIN}>
            = {result}
          </motion.span>
        )}
      </span>
    </div>
  )
}
