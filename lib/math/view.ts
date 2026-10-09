// A math viewport: the window [x0, x1] × [y0, y1] shown on a canvas. Pure
// functions, so the Palco of every Matemática lab can ease its window from
// one Cena to the next (zoom into a point, slide to another part of a graph)
// instead of cutting.

export interface Viewport {
  x0: number
  x1: number
  y0: number
  y1: number
}

/** Where the viewport lands on the canvas, in CSS pixels. */
export interface Frame {
  left: number
  top: number
  width: number
  height: number
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Frame-rate independent exponential easing factor (k ≈ 0.12 at 60 fps). */
export function easeFactor(dtMs: number, k = 0.12): number {
  return 1 - Math.pow(1 - k, dtMs / 16.67)
}

export function lerpViewport(a: Viewport, b: Viewport, t: number): Viewport {
  return { x0: lerp(a.x0, b.x0, t), x1: lerp(a.x1, b.x1, t), y0: lerp(a.y0, b.y0, t), y1: lerp(a.y1, b.y1, t) }
}

export function viewportClose(a: Viewport, b: Viewport, eps = 1e-4): boolean {
  const s = Math.max(a.x1 - a.x0, a.y1 - a.y0)
  return Math.abs(a.x0 - b.x0) + Math.abs(a.x1 - b.x1) + Math.abs(a.y0 - b.y0) + Math.abs(a.y1 - b.y1) < eps * s
}

/**
 * Fits a viewport into a frame keeping one unit the same size on both axes
 * (circles stay round): the shorter side is widened around its center.
 */
export function equalAspect(v: Viewport, f: Frame): Viewport {
  const sx = f.width / (v.x1 - v.x0)
  const sy = f.height / (v.y1 - v.y0)
  if (sx > sy) {
    const w = f.width / sy
    const cx = (v.x0 + v.x1) / 2
    return { ...v, x0: cx - w / 2, x1: cx + w / 2 }
  }
  const h = f.height / sx
  const cy = (v.y0 + v.y1) / 2
  return { ...v, y0: cy - h / 2, y1: cy + h / 2 }
}

export function toPx(v: Viewport, f: Frame) {
  const sx = f.width / (v.x1 - v.x0)
  const sy = f.height / (v.y1 - v.y0)
  return {
    x: (x: number) => f.left + (x - v.x0) * sx,
    y: (y: number) => f.top + (v.y1 - y) * sy,
    /** Canvas pixel → math coordinates. */
    fromX: (px: number) => v.x0 + (px - f.left) / sx,
    fromY: (py: number) => v.y1 - (py - f.top) / sy,
    sx,
    sy,
  }
}

/** "Nice" tick step (1, 2 or 5 × 10ⁿ) for about `target` ticks on a range. */
export function niceStep(range: number, target = 6): number {
  const raw = range / Math.max(1, target)
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}

export function ticks(a: number, b: number, step: number): number[] {
  const out: number[] = []
  const start = Math.ceil(a / step - 1e-9) * step
  for (let v = start; v <= b + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}

/** pt-BR number for axis labels and readouts ("2,5", "−3", "0,25"). */
export function fmt(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '—'
  const s = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(Math.abs(v) < 10 ** -(digits + 1) ? 0 : v)
  return s.replace('-', '−')
}

/** Same as fmt, for KaTeX: decimal comma that does not add a space ("2{,}5"). */
export function texNum(v: number, digits = 2): string {
  return fmt(v, digits).replace(/\./g, '\\,').replace(',', '{,}').replace('−', '-')
}

/**
 * Samples y = f(x) across the viewport, breaking the path where the
 * function is undefined or jumps off-screen (asymptotes).
 */
export function sample(f: (x: number) => number, v: Viewport, n = 240): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = []
  let run: { x: number; y: number }[] = []
  const span = v.y1 - v.y0
  let prev: number | null = null
  for (let i = 0; i <= n; i++) {
    const x = v.x0 + ((v.x1 - v.x0) * i) / n
    const y = f(x)
    const bad = !Number.isFinite(y) || (prev !== null && Math.abs(y - prev) > span * 3)
    if (bad) {
      if (run.length > 1) out.push(run)
      run = Number.isFinite(y) ? [{ x, y }] : []
    } else run.push({ x, y })
    prev = Number.isFinite(y) ? y : null
  }
  if (run.length > 1) out.push(run)
  return out
}
