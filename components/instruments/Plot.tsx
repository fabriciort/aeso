'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Canvas plot used by the lab instruments: fast enough to redraw thousands
// of points every animation frame, crisp on high-DPI screens.

export interface PlotPoint {
  x: number
  y: number
}

export interface PlotSeries {
  points: PlotPoint[]
  kind: 'dots' | 'line'
  color: string
  size?: number
  width?: number
  alpha?: number
}

export interface PlotMarker {
  x: number
  label?: string
  color?: string
}

interface PlotProps {
  series: PlotSeries[]
  x: [number, number]
  y: [number, number]
  xLabel?: string
  yLabel?: string
  xTicks?: number[]
  yTicks?: number[]
  formatX?: (v: number) => string
  formatY?: (v: number) => string
  markers?: PlotMarker[]
  /** Vertical band highlight (e.g. hover). */
  band?: [number, number] | null
  onPointer?: (x: number | null) => void
  onSelect?: (x: number) => void
  className?: string
  ariaLabel: string
}

const PAD = { l: 52, r: 14, t: 14, b: 34 }

export default function Plot({
  series,
  x,
  y,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  formatX = (v) => String(Math.round(v * 100) / 100),
  formatY = (v) => String(v),
  markers,
  band,
  onPointer,
  onSelect,
  className,
  ariaLabel,
}: PlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const pw = size.w - PAD.l - PAD.r
    const ph = size.h - PAD.t - PAD.b
    const sx = (v: number) => PAD.l + ((v - x[0]) / (x[1] - x[0])) * pw
    const sy = (v: number) => PAD.t + (1 - (v - y[0]) / (y[1] - y[0])) * ph

    // grid + ticks
    ctx.font = '11px var(--font-geist-mono), ui-monospace, monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (const t of yTicks ?? []) {
      const py = Math.round(sy(t)) + 0.5
      ctx.beginPath()
      ctx.moveTo(PAD.l, py)
      ctx.lineTo(PAD.l + pw, py)
      ctx.stroke()
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(formatY(t), PAD.l - 8, py)
    }
    for (const t of xTicks ?? []) {
      const px = Math.round(sx(t)) + 0.5
      ctx.beginPath()
      ctx.moveTo(px, PAD.t)
      ctx.lineTo(px, PAD.t + ph)
      ctx.stroke()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(formatX(t), px, PAD.t + ph + 8)
    }

    if (band) {
      ctx.fillStyle = 'rgba(125,190,255,0.08)'
      ctx.fillRect(sx(band[0]), PAD.t, sx(band[1]) - sx(band[0]), ph)
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(PAD.l, PAD.t, pw, ph)
    ctx.clip()
    for (const s of series) {
      ctx.globalAlpha = s.alpha ?? 1
      if (s.kind === 'dots') {
        ctx.fillStyle = s.color
        const r = s.size ?? 1.6
        for (const p of s.points) {
          const px = sx(p.x)
          const py = sy(p.y)
          if (px < PAD.l - 4 || px > PAD.l + pw + 4) continue
          ctx.fillRect(px - r / 2, py - r / 2, r, r)
        }
      } else {
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width ?? 2
        ctx.lineJoin = 'round'
        ctx.beginPath()
        s.points.forEach((p, i) => (i ? ctx.lineTo(sx(p.x), sy(p.y)) : ctx.moveTo(sx(p.x), sy(p.y))))
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    for (const m of markers ?? []) {
      const px = sx(m.x)
      ctx.strokeStyle = m.color ?? 'rgba(246,183,78,0.9)'
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.moveTo(px, PAD.t)
      ctx.lineTo(px, PAD.t + ph)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.fillStyle = m.color ?? 'rgba(246,183,78,1)'
      ctx.arc(px, PAD.t + 6, 4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '11px var(--font-geist-sans), ui-sans-serif, system-ui'
    if (xLabel) {
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(xLabel, PAD.l + pw, size.h - 1)
    }
    if (yLabel) {
      ctx.save()
      ctx.translate(11, PAD.t)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(yLabel, 0, 0)
      ctx.restore()
    }
  }, [series, x, y, xLabel, yLabel, xTicks, yTicks, formatX, formatY, markers, band, size])

  const toX = (clientX: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const pw = rect.width - PAD.l - PAD.r
    const v = x[0] + ((clientX - rect.left - PAD.l) / pw) * (x[1] - x[0])
    return v >= x[0] && v <= x[1] ? v : null
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className={cn('absolute inset-0 h-full w-full', (onSelect || onPointer) && 'cursor-crosshair')}
        onPointerMove={onPointer ? (e) => onPointer(toX(e.clientX)) : undefined}
        onPointerLeave={onPointer ? () => onPointer(null) : undefined}
        onClick={
          onSelect
            ? (e) => {
                const v = toX(e.clientX)
                if (v !== null) onSelect(v)
              }
            : undefined
        }
      />
    </div>
  )
}

/** Nice evenly spaced ticks. */
export function ticks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v / step) * step)
  return out
}
