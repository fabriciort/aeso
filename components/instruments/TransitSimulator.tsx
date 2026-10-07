'use client'

import { useEffect, useRef, useState } from 'react'
import { SUN_LIKE_LD, transitFlux } from '@/lib/astro/transit'
import { cn } from '@/lib/utils'

// Instrumento: Simulador de trânsito.
// A star (limb-darkened) and a planet crossing its disk, with the light curve
// traced live underneath. Pure canvas, 60 fps, no React re-render per frame.

interface TransitSimulatorProps {
  /** Planet radius / star radius. */
  k: number
  /** Impact parameter (0 = centre). */
  b?: number
  playing?: boolean
  /** Seconds for one full crossing. */
  period?: number
  /** Draw a second, dashed curve for comparison (another radius ratio). */
  compareK?: number | null
  /** Reports the current relative brightness (throttled). */
  onFlux?: (f: number) => void
  className?: string
  /** Hide the light curve (scene only). */
  sceneOnly?: boolean
  starTint?: 'sun' | 'red'
}

export default function TransitSimulator({
  k,
  b = 0.15,
  playing = true,
  period = 6,
  compareK = null,
  onFlux,
  className,
  sceneOnly = false,
  starTint = 'sun',
}: TransitSimulatorProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({ k, b, playing, period, compareK, onFlux, sceneOnly, starTint })
  const [size, setSize] = useState({ w: 0, h: 0 })
  state.current = { k, b, playing, period, compareK, onFlux, sceneOnly, starTint }

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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    let pos = -1 // normalised position along the path, −1 … 1
    let lastReport = 0

    const draw = (now: number) => {
      const s = state.current
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (s.playing && !reduced) {
        pos += (dt / s.period) * 2
        if (pos > 1.15) pos = -1.15
      } else if (reduced) {
        pos = 0
      }

      const W = size.w
      const H = size.h
      ctx.clearRect(0, 0, W, H)
      const sceneH = s.sceneOnly ? H : H * 0.58
      const R = Math.min(sceneH * 0.36, W * 0.2)
      const cx = W / 2
      const cy = sceneH / 2 + 4
      const xmax = 1 + s.k + 0.9
      const px = pos * xmax // planet x in stellar radii
      const z = Math.hypot(px, s.b)

      // glow
      const warm = s.starTint === 'red'
      const glow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.6)
      glow.addColorStop(0, warm ? 'rgba(255,110,60,0.30)' : 'rgba(255,190,90,0.28)')
      glow.addColorStop(1, 'rgba(255,170,80,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, sceneH)

      // limb-darkened disk
      const disk = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      if (warm) {
        disk.addColorStop(0, '#ffd1b0')
        disk.addColorStop(0.7, '#ff8a55')
        disk.addColorStop(1, '#c2410c')
      } else {
        disk.addColorStop(0, '#fff7e0')
        disk.addColorStop(0.65, '#ffd27a')
        disk.addColorStop(1, '#e88a2c')
      }
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = disk
      ctx.fill()

      // orbit chord
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.setLineDash([2, 6])
      ctx.beginPath()
      ctx.moveTo(cx - xmax * R, cy + s.b * R)
      ctx.lineTo(cx + xmax * R, cy + s.b * R)
      ctx.stroke()
      ctx.setLineDash([])

      // planet
      const pr = Math.max(s.k * R, 1.4)
      const ppx = cx + px * R
      const ppy = cy + s.b * R
      ctx.beginPath()
      ctx.arc(ppx, ppy, pr, 0, Math.PI * 2)
      ctx.fillStyle = '#05060a'
      ctx.fill()
      ctx.strokeStyle = 'rgba(160,200,255,0.55)'
      ctx.lineWidth = 1
      ctx.stroke()

      const flux = transitFlux(s.k, z, SUN_LIKE_LD)
      if (s.onFlux && now - lastReport > 60) {
        lastReport = now
        s.onFlux(flux)
      }

      if (!s.sceneOnly) {
        // light curve: brightness vs planet position
        const top = sceneH + 14
        const ch = H - top - 18
        const depthMax = Math.max(1 - transitFlux(Math.max(s.k, s.compareK ?? 0), 0, SUN_LIKE_LD), 0.0005) * 1.35
        const yOf = (f: number) => top + ((1 - f) / depthMax) * ch
        const xOf = (x: number) => cx + x * R

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.beginPath()
        ctx.moveTo(xOf(-xmax), yOf(1))
        ctx.lineTo(xOf(xmax), yOf(1))
        ctx.stroke()

        const curve = (kk: number, upTo: number, color: string, width: number, dash: number[] = []) => {
          ctx.strokeStyle = color
          ctx.lineWidth = width
          ctx.setLineDash(dash)
          ctx.beginPath()
          const n = 240
          for (let i = 0; i <= n; i++) {
            const x = -xmax + (2 * xmax * i) / n
            if (x > upTo) break
            const f = transitFlux(kk, Math.hypot(x, s.b), SUN_LIKE_LD)
            if (i) ctx.lineTo(xOf(x), yOf(f))
            else ctx.moveTo(xOf(x), yOf(f))
          }
          ctx.stroke()
          ctx.setLineDash([])
        }
        curve(s.k, xmax, 'rgba(255,255,255,0.12)', 1.5)
        if (s.compareK) curve(s.compareK, xmax, 'rgba(185,147,255,0.85)', 1.5, [4, 4])
        curve(s.k, px, 'rgba(246,183,78,1)', 2.2)
        ctx.beginPath()
        ctx.arc(xOf(px), yOf(flux), 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '11px var(--font-geist-sans), ui-sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('brilho', xOf(-xmax), top - 4)
        ctx.textAlign = 'right'
        ctx.fillText('tempo →', xOf(xmax), H - 4)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [size])

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Simulação de um planeta passando na frente de uma estrela e a curva de brilho resultante" />
    </div>
  )
}
