'use client'

import { useEffect, useRef, useState } from 'react'
import { fmt, niceStep, sample, ticks, toPx, type Frame, type Viewport } from '@/lib/math/view'

// Drawing kit for the Palco of the Matemática labs: one look for grids,
// axes and graphs across every lab. Call these from your own rAF loop.

export const INK = {
  grid: 'rgba(255,255,255,0.045)',
  gridStrong: 'rgba(255,255,255,0.08)',
  axis: 'rgba(255,255,255,0.32)',
  label: 'rgba(255,255,255,0.45)',
  text: 'rgba(255,255,255,0.85)',
  faint: 'rgba(255,255,255,0.18)',
}

export const MATH_FONT = '500 11px ui-sans-serif, system-ui, -apple-system, "Geist", sans-serif'

/**
 * Canvas sized to its parent with the right device pixel ratio. Returns the
 * ref to put on <canvas>, its CSS size and a getter for a ready 2D context
 * (scaled so you draw in CSS pixels).
 */
export function useMathCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const c = ref.current
    if (!c || !size.w) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    c.width = size.w * dpr
    c.height = size.h * dpr
    c.style.width = `${size.w}px`
    c.style.height = `${size.h}px`
  }, [size])
  const context = () => {
    const c = ref.current
    if (!c || !size.w) return null
    const ctx = c.getContext('2d')
    if (!ctx) return null
    const dpr = c.width / size.w
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)
    return ctx
  }
  return { ref, size, context }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Light grid (every tick) and axes through the origin, with labels. */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  v: Viewport,
  f: Frame,
  opts: { alpha?: number; xStep?: number; yStep?: number; labels?: boolean; grid?: boolean; formatX?: (x: number) => string; formatY?: (y: number) => string } = {},
) {
  const { alpha = 1, labels = true, grid = true, formatX = (x) => fmt(x), formatY = (y) => fmt(y) } = opts
  if (alpha <= 0.01) return
  const p = toPx(v, f)
  const xs = opts.xStep ?? niceStep(v.x1 - v.x0, Math.max(3, Math.round(f.width / 70)))
  const ys = opts.yStep ?? niceStep(v.y1 - v.y0, Math.max(3, Math.round(f.height / 60)))
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1
  if (grid) {
    ctx.strokeStyle = INK.grid
    ctx.beginPath()
    for (const x of ticks(v.x0, v.x1, xs)) {
      const X = Math.round(p.x(x)) + 0.5
      ctx.moveTo(X, f.top)
      ctx.lineTo(X, f.top + f.height)
    }
    for (const y of ticks(v.y0, v.y1, ys)) {
      const Y = Math.round(p.y(y)) + 0.5
      ctx.moveTo(f.left, Y)
      ctx.lineTo(f.left + f.width, Y)
    }
    ctx.stroke()
  }
  // Axes (clamped to the frame edge when the origin is off-screen).
  const ax = Math.min(Math.max(p.y(0), f.top), f.top + f.height)
  const ay = Math.min(Math.max(p.x(0), f.left), f.left + f.width)
  ctx.strokeStyle = INK.axis
  ctx.beginPath()
  ctx.moveTo(f.left, Math.round(ax) + 0.5)
  ctx.lineTo(f.left + f.width, Math.round(ax) + 0.5)
  ctx.moveTo(Math.round(ay) + 0.5, f.top)
  ctx.lineTo(Math.round(ay) + 0.5, f.top + f.height)
  ctx.stroke()
  if (labels) {
    ctx.font = MATH_FONT
    ctx.fillStyle = INK.label
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const x of ticks(v.x0, v.x1, xs)) {
      if (x === 0) continue
      const X = p.x(x)
      if (X < f.left + 10 || X > f.left + f.width - 10) continue
      ctx.fillText(formatX(x), X, Math.min(ax + 5, f.top + f.height - 14))
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (const y of ticks(v.y0, v.y1, ys)) {
      if (y === 0) continue
      const Y = p.y(y)
      if (Y < f.top + 8 || Y > f.top + f.height - 8) continue
      ctx.fillText(formatY(y), Math.max(ay - 5, f.left + 26), Y)
    }
  }
  ctx.restore()
}

/** Graph of y = fn(x) over the viewport. `upTo` draws only x ≤ upTo (for "drawing" animations). */
export function drawFunction(
  ctx: CanvasRenderingContext2D,
  fn: (x: number) => number,
  v: Viewport,
  f: Frame,
  style: { color: string; width?: number; alpha?: number; dash?: number[]; upTo?: number; from?: number; glow?: boolean },
) {
  const { color, width = 2.5, alpha = 1, dash, upTo = Infinity, from = -Infinity, glow } = style
  if (alpha <= 0.01) return
  const p = toPx(v, f)
  ctx.save()
  ctx.beginPath()
  ctx.rect(f.left, f.top, f.width, f.height)
  ctx.clip()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (dash) ctx.setLineDash(dash)
  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 12
  }
  const span = { ...v, x0: Math.max(v.x0, from), x1: Math.min(v.x1, upTo) }
  if (span.x1 > span.x0) {
    for (const run of sample(fn, span, Math.max(60, Math.round(((span.x1 - span.x0) / (v.x1 - v.x0)) * f.width * 0.8)))) {
      ctx.beginPath()
      run.forEach((pt, i) => (i ? ctx.lineTo(p.x(pt.x), p.y(pt.y)) : ctx.moveTo(p.x(pt.x), p.y(pt.y))))
      ctx.stroke()
    }
  }
  ctx.restore()
}

/** A dot with an optional soft halo. */
export function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, halo = 0) {
  ctx.save()
  if (halo > 0) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * (2 + halo * 3))
    g.addColorStop(0, color)
    g.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.35 * Math.min(1, halo)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r * (2 + halo * 3), 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** Arrow from (x0, y0) to (x1, y1) in canvas pixels. */
export function drawArrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 2, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0)
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 0.5) return
  const h = Math.min(head, len * 0.6)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - Math.cos(a) * h * 0.7, y1 - Math.sin(a) * h * 0.7)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - Math.cos(a - 0.45) * h, y1 - Math.sin(a - 0.45) * h)
  ctx.lineTo(x1 - Math.cos(a + 0.45) * h, y1 - Math.sin(a + 0.45) * h)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
