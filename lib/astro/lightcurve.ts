// Light-curve processing: cleaning, detrending, folding and fitting.
// Pure functions shared by the server route and the client lab.

import { modelAtPhase, type LimbDarkening, type OrbitGeometry, SUN_LIKE_LD } from './transit'

export interface Point {
  t: number
  f: number
}

function median(values: number[]): number {
  if (!values.length) return NaN
  const s = [...values].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Drops NaNs and flagged cadences, normalises to median 1. */
export function clean(time: ArrayLike<number>, flux: ArrayLike<number>, quality?: ArrayLike<number>): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < time.length; i++) {
    const t = time[i]
    const f = flux[i]
    if (!Number.isFinite(t) || !Number.isFinite(f)) continue
    if (quality && quality[i] !== 0) continue
    pts.push({ t, f })
  }
  pts.sort((a, b) => a.t - b.t)
  const med = median(pts.map((p) => p.f))
  return pts.map((p) => ({ t: p.t, f: p.f / med }))
}

/**
 * Removes slow stellar/instrumental trends by dividing by a running median.
 * The median is evaluated on a coarse grid (every `stepDays`) and linearly
 * interpolated, which keeps this fast for 20k-point TESS sectors.
 * Points inside known transits can be masked so they do not bias the trend.
 */
export function detrend(points: Point[], windowDays: number, mask?: (t: number) => boolean, stepDays = 0.02): Point[] {
  if (!points.length) return []
  const half = windowDays / 2
  const t0 = points[0].t
  const t1 = points[points.length - 1].t
  const knots: { t: number; m: number }[] = []
  let lo = 0
  let hi = 0
  for (let t = t0; t <= t1 + stepDays; t += stepDays) {
    while (lo < points.length && points[lo].t < t - half) lo++
    while (hi < points.length && points[hi].t <= t + half) hi++
    const win: number[] = []
    for (let j = lo; j < hi; j++) if (!mask || !mask(points[j].t)) win.push(points[j].f)
    if (win.length >= 5) knots.push({ t, m: median(win) })
  }
  if (!knots.length) return points.map((p) => ({ ...p }))
  let k = 0
  return points.map((p) => {
    while (k < knots.length - 2 && knots[k + 1].t < p.t) k++
    const a = knots[k]
    const b = knots[Math.min(k + 1, knots.length - 1)]
    const m = b.t === a.t ? a.m : a.m + ((b.m - a.m) * (p.t - a.t)) / (b.t - a.t)
    return { t: p.t, f: p.f / m }
  })
}

export function phaseOf(t: number, period: number, t0: number): number {
  const p = (((t - t0) / period) % 1 + 1.5) % 1
  return p - 0.5 // −0.5 … 0.5, transit at 0
}

/** Averages points into equal-width bins of x. */
export function binBy(points: { x: number; y: number }[], lo: number, hi: number, nBins: number) {
  const sum = new Float64Array(nBins)
  const sum2 = new Float64Array(nBins)
  const cnt = new Uint32Array(nBins)
  const w = (hi - lo) / nBins
  for (const p of points) {
    const b = Math.floor((p.x - lo) / w)
    if (b < 0 || b >= nBins) continue
    sum[b] += p.y
    sum2[b] += p.y * p.y
    cnt[b]++
  }
  const out: { x: number; y: number; err: number; n: number }[] = []
  for (let b = 0; b < nBins; b++) {
    if (!cnt[b]) continue
    const mean = sum[b] / cnt[b]
    const variance = Math.max(sum2[b] / cnt[b] - mean * mean, 0)
    out.push({ x: lo + (b + 0.5) * w, y: mean, err: Math.sqrt(variance / cnt[b]), n: cnt[b] })
  }
  return out
}

/** Finds the epoch of mid-transit by scanning a box over the folded curve. */
export function findEpoch(points: Point[], period: number, durationDays: number, reference = points[0]?.t ?? 0): number {
  const nBins = 400
  const folded = points.map((p) => ({ x: (((p.t - reference) / period) % 1 + 1) % 1, y: p.f }))
  const bins = binBy(folded, 0, 1, nBins)
  const full = new Float64Array(nBins).fill(1)
  for (const b of bins) full[Math.floor(b.x * nBins)] = b.y
  const width = Math.max(1, Math.round((durationDays / period) * nBins * 0.6))
  let best = 0
  let bestVal = Infinity
  for (let i = 0; i < nBins; i++) {
    let s = 0
    for (let j = -width; j <= width; j++) s += full[(i + j + nBins) % nBins]
    if (s < bestVal) {
      bestVal = s
      best = i
    }
  }
  return reference + ((best + 0.5) / nBins) * period
}

export interface FoldedPoint {
  /** Hours from mid-transit. */
  h: number
  f: number
}

/** χ² of a transit model with radius ratio k against folded data. */
export function chiSquare(data: FoldedPoint[], k: number, period: number, g: OrbitGeometry, ld: LimbDarkening = SUN_LIKE_LD, sigma = 1): number {
  let s = 0
  for (const p of data) {
    const m = modelAtPhase(p.h / 24 / period, k, g, ld)
    s += ((p.f - m) / sigma) ** 2
  }
  return s
}

/** Best radius ratio by golden-section search. */
export function bestRadiusRatio(data: FoldedPoint[], period: number, g: OrbitGeometry, ld: LimbDarkening = SUN_LIKE_LD): number {
  let a = 0.01
  let b = 0.35
  const gr = (Math.sqrt(5) - 1) / 2
  let c = b - gr * (b - a)
  let d = a + gr * (b - a)
  for (let i = 0; i < 60; i++) {
    if (chiSquare(data, c, period, g, ld) < chiSquare(data, d, period, g, ld)) b = d
    else a = c
    c = b - gr * (b - a)
    d = a + gr * (b - a)
  }
  return (a + b) / 2
}

/** Robust scatter estimate (1.4826 × MAD). */
export function robustStd(values: number[]): number {
  const m = median(values)
  return 1.4826 * median(values.map((v) => Math.abs(v - m)))
}
