'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  r: number
  phase: number
  speed: number
  hue: number
}

/** Ambient background: slowly twinkling stars with a subtle pointer parallax. */
export default function Starfield({ dimmed = false }: { dimmed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stars: Star[] = []
    let width = 0
    let height = 0
    let raf = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((width * height) / 4200)
      stars = Array.from({ length: count }, () => {
        const z = Math.random() ** 2.2
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: 0.25 + z * 1.15,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          hue: Math.random() < 0.15 ? 25 : Math.random() < 0.35 ? 215 : 0,
        }
      })
    }

    const draw = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      ctx.clearRect(0, 0, width, height)
      for (const s of stars) {
        const twinkle = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(s.phase + (t / 1000) * s.speed)
        const alpha = (0.25 + s.z * 0.75) * twinkle
        const px = s.x + pointer.x * s.z * 18
        const py = s.y + pointer.y * s.z * 18
        ctx.beginPath()
        ctx.fillStyle = s.hue ? `hsla(${s.hue}, 80%, 85%, ${alpha})` : `rgba(255,255,255,${alpha})`
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
        if (s.z > 0.82) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(190,215,255,${alpha * 0.12})`
          ctx.arc(px, py, s.r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / width - 0.5
      pointer.ty = e.clientY / height - 0.5
    }
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,98,255,0.16),transparent_60%),radial-gradient(ellipse_50%_40%_at_85%_110%,rgba(168,85,247,0.10),transparent_60%),radial-gradient(ellipse_40%_30%_at_5%_80%,rgba(14,165,233,0.07),transparent_60%)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: dimmed ? 0.45 : 1 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#030407] to-transparent" />
    </div>
  )
}
