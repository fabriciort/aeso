'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Hand } from 'lucide-react'
import {
  ANDROMEDA,
  approachCosine,
  C_KMS,
  dopplerSound,
  fitError,
  GALAXIES,
  GALAXIES_BEST_H0,
  H_ALPHA,
  H_LINES,
  hubbleTimeGyr,
  observedWavelength,
  PLANCK_H0,
  SHOES_H0,
  SOUND_SPEED,
  wavelengthToRgb,
} from '@/lib/astro/cosmology'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { Burst } from '@/components/instruments/DragSurface'
import type { StageProps } from '../runtime'
import {
  AMB_MAX,
  AMB_MIN,
  clamp,
  DEFAULTS,
  DRAW_EXAGGERATION,
  ENT_MAX,
  ENT_MIN,
  FIT_TOL,
  FULL_WINDOW,
  H_MAX,
  H_MIN,
  HA_WINDOW,
  measuredList,
  residualKms,
  U_MAX,
  type UniLive,
} from './shared'
import { sirenTone, stopSiren, updateSiren } from './siren'

// The continuous Palco of "Meça a expansão do universo": one canvas that
// starts on a street at night (an ambulance and its sound waves), turns the
// waves into light and a spectrum, zooms out to a field of galaxies, flies
// them into a Hubble diagram and finally rewinds them to a single point.
// Every visual quantity is interpolated toward a target set by
// (step, scene, live, answers), so nothing ever cuts.

// ------------------------------------------------------------ view state

interface View {
  street: number
  light: number
  srcY: number
  redden: number
  spec: number
  dual: number
  ghost: number
  specV: number
  lo: number
  hi: number
  specCy: number
  specH: number
  specLabels: number
  field: number
  fy: number
  fh: number
  logZoom: number
  mapCx: number
  mapCy: number
  plot: number
  refs: number
  arrows: number
  obsX: number
  obsY: number
  rewind: number
  local: number
  final: number
  dim: number
  Hdisp: number
  labels: number
}

const RATES: Partial<Record<keyof View, number>> = {
  rewind: 0.9,
  obsX: 1.8,
  obsY: 1.8,
  logZoom: 2.4,
  mapCx: 2.4,
  mapCy: 2.4,
  specV: 4.5,
  plot: 2.6,
  Hdisp: 12,
  lo: 4,
  hi: 4,
}

const LOCAL_ZOOM = Math.log(260)
const M31_POS = { x: -ANDROMEDA.distanceMpc / Math.SQRT2, y: -ANDROMEDA.distanceMpc / Math.SQRT2 }
const OBS_GALAXY = 2 // galaxy C becomes the new point of view

const galaxyPos = (i: number) => {
  const g = GALAXIES[i]
  const a = (g.angle * Math.PI) / 180
  return { x: g.distanceMpc * Math.cos(a), y: g.distanceMpc * Math.sin(a) }
}

type Picks = Record<string, number | undefined>

function targetView(stepId: string, scene: number, L: UniLive, answers: Record<string, unknown>): View {
  const picks = (answers.challenges as Picks | undefined) ?? {}
  const v: View = {
    street: 0,
    light: 0,
    srcY: 0.36,
    redden: 0,
    spec: 0,
    dual: 0,
    ghost: 0,
    specV: 0,
    lo: FULL_WINDOW[0],
    hi: FULL_WINDOW[1],
    specCy: 0.8,
    specH: 0.26,
    specLabels: 0,
    field: 0,
    fy: 0,
    fh: 1,
    logZoom: 3,
    mapCx: 0,
    mapCy: 0,
    plot: 0,
    refs: 0,
    arrows: 0,
    obsX: 0,
    obsY: 0,
    rewind: 0,
    local: 0,
    final: 0,
    dim: 0,
    Hdisp: L.H,
    labels: 1,
  }
  switch (stepId) {
    case 'imagine':
      v.street = 1
      break
    case 'preveja':
      Object.assign(v, { light: 1, spec: 1, specCy: 0.8, specH: 0.26 })
      if (scene >= 1) Object.assign(v, { specV: 20000, ghost: 1, redden: 1 })
      break
    case 'entenda':
      if (scene === 0) Object.assign(v, { light: 0.4, srcY: 0.18, spec: 1, specCy: 0.58, specH: 0.32, specLabels: 1 })
      else Object.assign(v, { spec: 1, dual: 1, specCy: 0.53, specH: 0.66, specLabels: 1, specV: L.entV })
      break
    case 'observe':
      Object.assign(v, { field: 1, logZoom: 0 })
      if (scene === 1)
        Object.assign(v, { fy: 0, fh: 0.5, spec: 1, dual: 1, specCy: 0.765, specH: 0.43, specLabels: 1, lo: HA_WINDOW[0], hi: HA_WINDOW[1], specV: residualKms(L.sel, L.u) })
      if (scene === 2) v.arrows = 1
      break
    case 'meca': {
      Object.assign(v, { field: 1, logZoom: 0, plot: 1 })
      const locked = typeof answers.H0 === 'number'
      if (scene >= 1) v.refs = 1
      if (locked && scene >= 1) v.Hdisp = answers.H0 as number
      break
    }
    case 'e-se':
      Object.assign(v, { field: 1, logZoom: 0 })
      if (scene === 0) {
        if (picks.rebobinar !== undefined) v.rewind = 1
        else v.arrows = 1
      } else if (scene === 1) {
        v.arrows = 1
        if (picks.centro !== undefined) {
          const p = galaxyPos(OBS_GALAXY)
          v.obsX = p.x
          v.obsY = p.y
        }
      } else {
        Object.assign(v, { local: 1, logZoom: LOCAL_ZOOM, mapCx: M31_POS.x / 2, mapCy: M31_POS.y / 2, labels: 0 })
      }
      break
    case 'conclua':
      Object.assign(v, { field: 1, logZoom: 0.1, arrows: 0.55, final: 1, dim: 0.5, labels: 0 })
      break
  }
  return v
}

// ------------------------------------------------------------ helpers

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hexRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

interface Bg {
  x: number
  y: number
  r: number
  tilt: number
  warm: boolean
}

interface Wave {
  x: number
  y: number
  t: number
  kind: 'sound' | 'light'
}

type DragMode = 'speed' | 'ent' | 'obs' | 'H' | null

const EMERALD: [number, number, number] = [110, 231, 183]
const AMBER: [number, number, number] = [246, 183, 78]
const SKY: [number, number, number] = [125, 200, 255]
const ROSE: [number, number, number] = [255, 140, 160]

// ------------------------------------------------------------ component

export default function UniversoStage({ lab, stepId, scene, answers, live, setLive }: StageProps) {
  const L = useMemo(() => ({ ...DEFAULTS, ...(live as Partial<UniLive>) }) as UniLive, [live])
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hzRef = useRef<HTMLSpanElement>(null)
  const agoRef = useRef<HTMLSpanElement>(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const target = targetView(stepId, scene, L, answers)
  const targetRef = useRef(target)
  targetRef.current = target
  const dispRef = useRef<View | null>(null)
  const ctxRef = useRef({ stepId, scene, L, answers })
  ctxRef.current = { stepId, scene, L, answers }
  const screenRef = useRef<{ x: number; y: number }[]>(GALAXIES.map(() => ({ x: -999, y: -999 })))
  const accent = useMemo(() => hexRgb(lab.accent), [lab.accent])
  const measured = measuredList(answers)
  const locked = typeof answers.H0 === 'number'
  const picks = (answers.challenges as Picks | undefined) ?? {}

  const mode: DragMode =
    stepId === 'imagine' && scene >= 1 ? 'speed' : stepId === 'entenda' && scene === 1 ? 'ent' : stepId === 'observe' && scene === 1 ? 'obs' : stepId === 'meca' && scene === 0 && !locked ? 'H' : null
  const [used, setUsed] = useState<Record<string, boolean>>({})
  const [burst, setBurst] = useState<{ id: number; x: number; y: number; color: string } | null>(null)

  // Siren: stop on leaving the scene, on hiding the page and on unmount.
  useEffect(() => {
    if (stepId !== 'imagine' && L.listening) {
      stopSiren()
      setLive({ listening: false })
    }
  }, [stepId, L.listening, setLive])
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        stopSiren()
        setLive({ listening: false })
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      stopSiren()
    }
  }, [setLive])

  // Bursts: a galaxy measured, the Hubble line fitted.
  const prevMeasured = useRef(measured.length)
  const prevLocked = useRef(locked)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (measured.length > prevMeasured.current) {
      const i = measured[measured.length - 1]
      const p = screenRef.current[i]
      if (p) setBurst({ id: Date.now(), x: p.x, y: p.y, color: lab.accent })
      t = setTimeout(() => setBurst(null), 1000)
    }
    prevMeasured.current = measured.length
    return () => clearTimeout(t)
  }, [measured, lab.accent])
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (locked && !prevLocked.current) {
      const { w, h } = sizeRef.current
      setBurst({ id: Date.now(), x: w * 0.6, y: h * 0.42, color: '#6ee7b7' })
      t = setTimeout(() => setBurst(null), 1000)
    }
    prevLocked.current = locked
    return () => clearTimeout(t)
  }, [locked])

  // Canvas + animation loop.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const font = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
    const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { w: r.width, h: r.height }
      canvas.width = Math.max(1, Math.round(r.width * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const rnd = mulberry32(1929)
    const stars = Array.from({ length: 130 }, () => ({ x: rnd(), y: rnd(), r: 0.4 + rnd() * 0.9, a: 0.15 + rnd() * 0.45 }))
    const bg: Bg[] = Array.from({ length: 80 }, () => {
      const r = 14 + 250 * Math.sqrt(rnd())
      const a = rnd() * Math.PI * 2
      return { x: r * Math.cos(a), y: r * Math.sin(a), r: 1.4 + rnd() * 2.6, tilt: rnd() * Math.PI, warm: rnd() > 0.45 }
    })
    const tilts = GALAXIES.map((_, i) => 0.3 + i * 1.1)

    if (!dispRef.current) dispRef.current = { ...targetRef.current }
    const waves: Wave[] = []
    let ambX = 0.12 // fraction of the width
    let lastEmit = 0
    let rot = 0
    let last = performance.now()
    let lastHz = 0
    let raf = 0

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const T = targetRef.current
      const D = dispRef.current!
      for (const k of Object.keys(T) as (keyof View)[]) {
        D[k] = reduced ? T[k] : D[k] + (T[k] - D[k]) * (1 - Math.exp(-dt * (RATES[k] ?? 7.5)))
      }
      const { w: W, h: H } = sizeRef.current
      const { stepId: sid, L: live, answers: ans } = ctxRef.current
      const t = now / 1000
      if (W < 2 || H < 2) {
        raf = requestAnimationFrame(frame)
        return
      }
      ctx.clearRect(0, 0, W, H)

      // ---------- sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#05060d')
      sky.addColorStop(1, D.street > 0.01 ? `rgba(14,16,30,1)` : '#06070c')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)
      for (const s of stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.a * (1 - 0.5 * D.spec * (1 - D.field))})`
        ctx.fillRect(s.x * W, s.y * H, s.r, s.r)
      }

      // ---------- street + sound
      const cv = clamp(0.9 * W, 220, 520) // drawn wave speed, px/s
      const roadY = H * 0.5
      const ambY = roadY - 2
      const lis = { x: W * 0.5, y: roadY + Math.min(70, H * 0.17) }
      const tone = sirenTone(now)
      const vAmb = live.ambV
      if (D.street > 0.01 && !reduced) {
        ambX += ((cv * DRAW_EXAGGERATION * (vAmb / SOUND_SPEED)) / W) * dt
        if (ambX > 1.25) ambX = -0.25
      } else if (reduced && D.street > 0.01 && vAmb > 0) {
        ambX += ((cv * DRAW_EXAGGERATION * (vAmb / SOUND_SPEED)) / W) * dt * 0.35
        if (ambX > 1.25) ambX = -0.25
      }
      const ax = ambX * W
      const srcX = W / 2
      const srcY = D.srcY * H
      const emitting = D.street > 0.05 || D.light > 0.05
      if (emitting && t - lastEmit > 0.16) {
        lastEmit = t
        if (D.street >= D.light) waves.push({ x: ax, y: ambY - 6, t, kind: 'sound' })
        else waves.push({ x: srcX, y: srcY, t, kind: 'light' })
      }
      const rMax = Math.hypot(W, H) * 0.75
      for (let i = waves.length - 1; i >= 0; i--) if ((t - waves[i].t) * cv > rMax) waves.splice(i, 1)

      if (D.street > 0.01) {
        const a = D.street
        ctx.save()
        ctx.globalAlpha = a
        // lamps
        for (const lx of [0.14, 0.86]) {
          const x = lx * W
          const g = ctx.createRadialGradient(x, roadY - 70, 0, x, roadY - 70, 90)
          g.addColorStop(0, 'rgba(255,214,150,0.18)')
          g.addColorStop(1, 'rgba(255,214,150,0)')
          ctx.fillStyle = g
          ctx.fillRect(x - 90, roadY - 160, 180, 200)
          ctx.strokeStyle = 'rgba(255,255,255,0.14)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, roadY - 22)
          ctx.lineTo(x, roadY - 72)
          ctx.lineTo(x + (lx < 0.5 ? 14 : -14), roadY - 76)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,226,170,0.9)'
          ctx.beginPath()
          ctx.arc(x + (lx < 0.5 ? 14 : -14), roadY - 74, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
        // road
        ctx.fillStyle = '#0b0d15'
        ctx.fillRect(0, roadY - 22, W, 44)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, roadY - 22.5)
        ctx.lineTo(W, roadY - 22.5)
        ctx.moveTo(0, roadY + 22.5)
        ctx.lineTo(W, roadY + 22.5)
        ctx.stroke()
        ctx.setLineDash([14, 14])
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.beginPath()
        ctx.moveTo(0, roadY + 6)
        ctx.lineTo(W, roadY + 6)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      // wavefronts (sound in the street, light from the source)
      for (const wv of waves) {
        const r = (t - wv.t) * cv
        const fade = (1 - r / rMax) ** 1.3
        if (wv.kind === 'sound') {
          if (D.street < 0.01) continue
          ctx.strokeStyle = `rgba(220,230,255,${0.42 * fade * D.street})`
          ctx.lineWidth = 1.4
        } else {
          if (D.light < 0.01) continue
          const nm = 500 * (1 + 0.32 * D.redden)
          ctx.strokeStyle = rgba(wavelengthToRgb(nm), 0.5 * fade * D.light)
          ctx.lineWidth = 1.6
        }
        ctx.beginPath()
        ctx.arc(wv.x, wv.y, Math.max(0.1, r), 0, Math.PI * 2)
        ctx.stroke()
      }

      if (D.street > 0.01) {
        ctx.save()
        ctx.globalAlpha = D.street
        drawAmbulance(ctx, ax, ambY, clamp(W / 420, 0.8, 1.25), Math.floor(now / 300) % 2 === 0)
        drawListener(ctx, lis.x, lis.y, font)
        // what you hear
        const cos = approachCosine(ax, ambY, 1, 0, lis.x, lis.y)
        const f = dopplerSound(tone, vAmb, cos)
        const dist = Math.hypot(ax - lis.x, ambY - lis.y)
        const level = clamp((1.6 * (lis.y - ambY)) / dist, 0.15, 1)
        if (live.listening && sid === 'imagine') updateSiren(f, level)
        if (hzRef.current && now - lastHz > 90) {
          lastHz = now
          hzRef.current.textContent = `${formatNumber(f, 0)} Hz`
        }
        if (ctxRef.current.stepId === 'imagine' && ctxRef.current.scene === 2 && vAmb > 2) {
          ctx.font = `500 12px ${font}`
          ctx.textAlign = 'center'
          ctx.fillStyle = 'rgba(186,220,255,0.9)'
          ctx.fillText('mais agudo ›', ax + 78, ambY - 40)
          ctx.fillStyle = 'rgba(255,190,150,0.9)'
          ctx.fillText('‹ mais grave', ax - 78, ambY - 40)
        }
        ctx.restore()
      }

      // ---------- light source
      if (D.light > 0.01) {
        const rr = 34 * (1 - 0.3 * D.redden)
        const col = wavelengthToRgb(560 * (1 + 0.2 * D.redden))
        const g = ctx.createRadialGradient(srcX, srcY, 0, srcX, srcY, rr * 2.4)
        g.addColorStop(0, `rgba(255,255,255,${D.light})`)
        g.addColorStop(0.18, rgba(col, 0.9 * D.light))
        g.addColorStop(1, rgba(col, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(srcX, srcY, rr * 2.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---------- field of galaxies / Hubble diagram
      const screen = screenRef.current
      if (D.field > 0.01) {
        const fa = D.field
        const fTop = D.fy * H
        const fH = D.fh * H
        const cx = W / 2
        const cy = fTop + fH / 2
        const s = ((Math.min(W, fH) * 0.45) / 168) * Math.exp(D.logZoom)
        if (D.final > 0.01 && !reduced) rot += dt * 0.035 * D.final
        const cr = Math.cos(rot)
        const sr = Math.sin(rot)
        const k = 1 - 0.99 * D.rewind
        const toScreen = (px: number, py: number) => {
          const qx = (px - D.obsX) * k - D.mapCx
          const qy = (py - D.obsY) * k - D.mapCy
          return { x: cx + (qx * cr - qy * sr) * s, y: cy + (qx * sr + qy * cr) * s }
        }
        const mapA = fa * (1 - D.plot)
        const ringA = mapA * (1 - D.local) * (1 - D.rewind) * D.labels

        // plot frame
        const pl = 52
        const pr = W - 20
        const pt = fTop + 34
        const pb = fTop + fH - 34
        const plotXY = (d: number, v: number) => ({ x: pl + (d / 180) * (pr - pl), y: pb - (v / 13000) * (pb - pt) })

        // distance rings around the Milky Way
        if (ringA > 0.01) {
          const o = toScreen(0, 0)
          ctx.setLineDash([2, 5])
          ctx.lineWidth = 1
          ctx.font = `10px ${mono}`
          ctx.textAlign = 'left'
          for (const d of [50, 100, 150]) {
            ctx.strokeStyle = `rgba(255,255,255,${0.1 * ringA})`
            ctx.beginPath()
            ctx.arc(o.x, o.y, d * s * k, 0, Math.PI * 2)
            ctx.stroke()
            ctx.fillStyle = `rgba(255,255,255,${0.3 * ringA})`
            ctx.fillText(`${d} Mpc`, o.x + 3, o.y - d * s * k - 3)
          }
          ctx.setLineDash([])
        }

        // background galaxies
        const bgA = mapA * (1 - D.local * 0.6)
        if (bgA > 0.01) {
          for (const b of bg) {
            const p = toScreen(b.x, b.y)
            if (p.x < -20 || p.x > W + 20 || p.y < fTop - 20 || p.y > fTop + fH + 20) continue
            drawGalaxy(ctx, p.x, p.y, b.r * clamp(s / 1, 0.7, 1.4), b.tilt, b.warm ? [255, 226, 190] : [190, 210, 255], 0.55 * bgA)
            if (D.arrows > 0.01) drawArrow(ctx, p, b.x - D.obsX, b.y - D.obsY, s * k * 0.26 * cr, s * k * 0.26, rot, rgba(accent, 0.28 * D.arrows * bgA * (1 - D.rewind)), 1)
          }
        }

        // plot axes
        if (D.plot > 0.01) {
          const a = D.plot * fa
          ctx.strokeStyle = `rgba(255,255,255,${0.06 * a})`
          ctx.lineWidth = 1
          ctx.font = `10.5px ${mono}`
          ctx.fillStyle = `rgba(255,255,255,${0.42 * a})`
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          for (const v of [0, 4000, 8000, 12000]) {
            const y = plotXY(0, v).y
            ctx.beginPath()
            ctx.moveTo(pl, y)
            ctx.lineTo(pr, y)
            ctx.stroke()
            ctx.fillText(v === 0 ? '0' : formatNumber(v / 1000, 0) + ' mil', pl - 6, y)
          }
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          for (const d of [0, 50, 100, 150]) {
            const x = plotXY(d, 0).x
            ctx.beginPath()
            ctx.moveTo(x, pt)
            ctx.lineTo(x, pb)
            ctx.stroke()
            ctx.fillText(String(d), x, pb + 6)
          }
          ctx.font = `11px ${font}`
          ctx.fillStyle = `rgba(255,255,255,${0.55 * a})`
          ctx.textAlign = 'right'
          ctx.fillText('distância (Mpc)', pr, pb + 20)
          ctx.textAlign = 'left'
          ctx.textBaseline = 'bottom'
          ctx.fillText('velocidade (km/s)', pl - 40, pt - 10)
          ctx.strokeStyle = `rgba(255,255,255,${0.35 * a})`
          ctx.beginPath()
          ctx.moveTo(pl, pt)
          ctx.lineTo(pl, pb)
          ctx.lineTo(pr, pb)
          ctx.stroke()
          ctx.textBaseline = 'alphabetic'

          // reference lines
          const lineTo = (Hc: number) => {
            const dEnd = Math.min(180, 13000 / Hc)
            return plotXY(dEnd, Hc * dEnd)
          }
          if (D.refs > 0.01) {
            for (const [ref, col] of [
              [PLANCK_H0, SKY],
              [SHOES_H0, ROSE],
            ] as const) {
              const e = lineTo(ref.value)
              const o = plotXY(0, 0)
              ctx.setLineDash([4, 5])
              ctx.strokeStyle = rgba(col, 0.7 * D.refs * a)
              ctx.lineWidth = 1.3
              ctx.beginPath()
              ctx.moveTo(o.x, o.y)
              ctx.lineTo(e.x, e.y)
              ctx.stroke()
              ctx.setLineDash([])
              ctx.font = `10.5px ${font}`
              ctx.fillStyle = rgba(col, 0.9 * D.refs * a)
              ctx.textAlign = 'right'
              ctx.fillText(`${ref.label} · ${formatNumber(ref.value, 1)}`, e.x - 4, e.y + (ref === PLANCK_H0 ? 14 : -6))
            }
          }
          // the student's line + residuals
          const Hc = D.Hdisp
          const fitted = typeof ans.H0 === 'number' || fitError(Hc, GALAXIES_BEST_H0) < FIT_TOL
          const col = fitted ? EMERALD : AMBER
          ctx.save()
          ctx.beginPath()
          ctx.rect(pl, pt - 2, pr - pl, pb - pt + 2)
          ctx.clip()
          if (D.refs < 0.99) {
            GALAXIES.forEach((g) => {
              const p = plotXY(g.distanceMpc, g.velocityKms)
              const q = plotXY(g.distanceMpc, Hc * g.distanceMpc)
              ctx.strokeStyle = rgba(col, 0.45 * a * (1 - D.refs))
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(q.x, q.y)
              ctx.stroke()
            })
          }
          const o = plotXY(0, 0)
          const e = plotXY(180, Hc * 180)
          ctx.strokeStyle = rgba(col, 0.95 * a)
          ctx.lineWidth = 2.6
          ctx.shadowColor = rgba(col, 0.6)
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(o.x, o.y)
          ctx.lineTo(e.x, e.y)
          ctx.stroke()
          ctx.restore()
        }

        // Milky Way (the observer) → origin of the plot
        {
          const m = toScreen(0, 0)
          const o = plotXY(0, 0)
          const x = mix(m.x, o.x, D.plot)
          const y = mix(m.y, o.y, D.plot)
          const size = mix(mix(9, 22, D.local), 5, D.plot)
          drawMilkyWay(ctx, x, y, size, fa, rot)
          const la = fa * (1 - D.plot) * D.labels * (1 - D.rewind)
          if (la > 0.01 || D.local > 0.01) {
            ctx.font = `11px ${font}`
            ctx.textAlign = 'center'
            ctx.fillStyle = `rgba(255,255,255,${0.7 * Math.max(la, D.local * fa)})`
            ctx.fillText(Math.hypot(D.obsX, D.obsY) > 5 ? 'Via Láctea' : 'Via Láctea · você', x, y + size + 14)
          }
        }

        // Andromeda (local view)
        if (D.local > 0.01) {
          const la = D.local * fa
          const m = toScreen(M31_POS.x, M31_POS.y)
          const o = toScreen(0, 0)
          drawGalaxy(ctx, m.x, m.y, 30, -0.7, [255, 232, 205], la)
          const dx = o.x - m.x
          const dy = o.y - m.y
          const len = Math.hypot(dx, dy)
          const ux = dx / len
          const uy = dy / len
          // gravity link
          ctx.setLineDash([2, 6])
          ctx.strokeStyle = `rgba(255,255,255,${0.18 * la})`
          ctx.beginPath()
          ctx.moveTo(m.x, m.y)
          ctx.lineTo(o.x, o.y)
          ctx.stroke()
          ctx.setLineDash([])
          // measured: approaching at 300 km/s (blue); Hubble flow: receding at ~55 km/s
          const Lm = len * 0.42
          arrowSeg(ctx, m.x + ux * 36, m.y + uy * 36, m.x + ux * (36 + Lm), m.y + uy * (36 + Lm), rgba(SKY, 0.95 * la), 2.4)
          const Lh = Lm * (55 / 300)
          arrowSeg(ctx, m.x - ux * 36, m.y - uy * 36, m.x - ux * (36 + Lh), m.y - uy * (36 + Lh), `rgba(255,255,255,${0.45 * la})`, 1.6, true)
          ctx.font = `600 12px ${font}`
          ctx.textAlign = 'center'
          ctx.fillStyle = `rgba(255,255,255,${0.9 * la})`
          ctx.fillText('Andrômeda (M31)', m.x, m.y - 42)
          ctx.font = `11px ${mono}`
          ctx.fillStyle = `rgba(255,255,255,${0.5 * la})`
          ctx.fillText('0,78 Mpc', (m.x + o.x) / 2 + 30, (m.y + o.y) / 2 + 4)
          ctx.fillStyle = rgba(SKY, 0.95 * la)
          ctx.fillText('−300 km/s medido', m.x + ux * (40 + Lm) + 6, m.y + uy * (40 + Lm) - 14)
          ctx.fillStyle = `rgba(255,255,255,${0.55 * la})`
          ctx.fillText('+55 km/s pela lei', m.x - ux * (44 + Lh), m.y - uy * (44 + Lh) - 12)
        }

        // the five hypothetical galaxies
        const sel = ctxRef.current.stepId === 'observe' && ctxRef.current.scene === 1 ? live.sel : -1
        const meas = measuredList(ans)
        const showV = ctxRef.current.stepId === 'observe' && ctxRef.current.scene >= 1
        GALAXIES.forEach((g, i) => {
          const p0 = galaxyPos(i)
          const m = toScreen(p0.x, p0.y)
          const pp = clamp(D.plot * 1.5 - i * 0.12, 0, 1)
          const e = pp * pp * (3 - 2 * pp)
          const q = plotXY(g.distanceMpc, g.velocityKms)
          const x = mix(m.x, q.x, e)
          const y = mix(m.y, q.y, e)
          screen[i] = { x, y }
          if (x < -40 || x > W + 40 || y < fTop - 40 || y > fTop + fH + 40) return
          const mine = meas.includes(i)
          const r = mix(clamp(4.2 * s, 6, 13), 4.5, e)
          const a = fa * (1 - 0.8 * D.local)
          if (D.arrows > 0.01) drawArrow(ctx, { x, y }, p0.x - D.obsX, p0.y - D.obsY, s * k * 0.26 * cr, s * k * 0.26, rot, rgba(accent, 0.75 * D.arrows * a * (1 - D.plot) * (1 - D.rewind)), 1.8)
          if (e > 0.02) {
            // a point of the Hubble diagram
            const col: [number, number, number] = mine ? accent : [255, 255, 255]
            const pa = a * (mine ? 1 : 0.5)
            ctx.shadowColor = rgba(col, 0.8 * pa)
            ctx.shadowBlur = mine ? 12 : 4
            ctx.fillStyle = rgba(col, pa * e)
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
          if (e < 0.98) drawGalaxy(ctx, x, y, r, tilts[i], i % 2 ? [205, 220, 255] : [255, 236, 210], a * (1 - e))
          if (i === sel) {
            ctx.strokeStyle = rgba(accent, 0.9 * a)
            ctx.lineWidth = 1.5
            ctx.setLineDash([3, 3])
            ctx.beginPath()
            ctx.arc(x, y, r + 9 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
          }
          const la = a * D.labels * (1 - D.rewind)
          if (la > 0.01) {
            ctx.textAlign = 'left'
            ctx.font = `600 12px ${font}`
            ctx.fillStyle = `rgba(255,255,255,${0.92 * la})`
            ctx.fillText(g.id, x + r + 5, y - 2)
            if (e < 0.5) {
              ctx.font = `10.5px ${mono}`
              ctx.fillStyle = `rgba(255,255,255,${0.5 * la * (1 - 2 * e)})`
              ctx.fillText(`${g.distanceMpc} Mpc`, x + r + 5, y + 11)
              if (showV && mine) {
                ctx.fillStyle = rgba(accent, la * (1 - 2 * e))
                ctx.fillText(`${formatNumber(g.velocityKms, 0)} km/s`, x + r + 5, y + 23)
              }
            }
          }
        })

        // new point of view
        const shift = Math.hypot(D.obsX, D.obsY)
        if (shift > 2) {
          const c = toScreen(D.obsX, D.obsY)
          const a = clamp(shift / 50, 0, 1) * fa
          ctx.strokeStyle = rgba(accent, 0.8 * a)
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.arc(c.x, c.y, 20, 0, Math.PI * 2)
          ctx.stroke()
          ctx.font = `11px ${font}`
          ctx.textAlign = 'center'
          ctx.fillStyle = rgba(accent, a)
          ctx.fillText('novo ponto de vista', c.x, c.y - 28)
        }

        // rewind: everything together, hot and dense
        if (D.rewind > 0.75) {
          const a = sstep(0.75, 1, D.rewind) * fa
          const c = toScreen(0, 0)
          const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 70)
          g.addColorStop(0, `rgba(255,250,235,${0.95 * a})`)
          g.addColorStop(0.25, `rgba(255,200,140,${0.55 * a})`)
          g.addColorStop(1, 'rgba(255,160,90,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(c.x, c.y, 70, 0, Math.PI * 2)
          ctx.fill()
        }
        if (agoRef.current) {
          const age = hubbleTimeGyr(typeof ans.H0 === 'number' ? (ans.H0 as number) : 70)
          agoRef.current.textContent = formatNumber(age * D.rewind, 1)
        }
      }

      // ---------- spectrum
      if (D.spec > 0.01) drawSpectrum(ctx, W, H, D, font, mono)

      if (D.dim > 0.01) {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6)
        g.addColorStop(0, `rgba(6,7,12,${0.6 * D.dim})`)
        g.addColorStop(1, `rgba(6,7,12,${0.2 * D.dim})`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [accent])

  // ---------- direct manipulation
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const markUsed = () => {
    if (mode && !used[mode]) setUsed((u) => ({ ...u, [mode]: true }))
  }
  const spectrumNmPerPx = () => {
    const D = dispRef.current
    const W = sizeRef.current.w
    if (!D) return 1
    return (D.hi - D.lo) / Math.max(1, W - 32)
  }
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mode) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (mode === 'obs') {
      const hit = screenRef.current.findIndex((p) => Math.hypot(p.x - x, p.y - y) < 28)
      if (hit >= 0) {
        if (hit !== L.sel) {
          haptic(8)
          const done = measuredList(answers).includes(hit)
          setLive({ sel: hit, u: done ? GALAXIES[hit].velocityKms : 0 })
        }
        return
      }
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || !mode) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    d.x = e.clientX
    d.y = e.clientY
    if (dx === 0 && dy === 0) return
    if (!d.moved) {
      d.moved = true
      markUsed()
    }
    if (mode === 'speed') setLive({ ambV: clamp(Math.round((L.ambV + dx * 0.09) * 10) / 10, AMB_MIN, AMB_MAX) })
    else if (mode === 'ent') {
      const dv = (C_KMS * dx * spectrumNmPerPx()) / H_ALPHA
      setLive({ entV: clamp(L.entV + dv, ENT_MIN, ENT_MAX) })
    } else if (mode === 'obs') {
      if (measuredList(answers).includes(L.sel)) return
      const du = -(C_KMS * dx * spectrumNmPerPx()) / H_ALPHA
      setLive({ u: clamp(L.u + du, 0, U_MAX) })
    } else if (mode === 'H') setLive({ H: clamp(L.H - dy * 0.12, H_MIN, H_MAX) })
  }
  const onUp = () => {
    drag.current = null
  }

  const hint =
    mode === 'speed'
      ? 'Arraste para os lados: velocidade'
      : mode === 'ent'
        ? 'Arraste o espectro para os lados'
        : mode === 'obs'
          ? 'Toque numa galáxia · arraste o espectro'
          : mode === 'H'
            ? 'Arraste para cima ou para baixo'
            : null
  const showHint = Boolean(hint && mode && !used[mode])

  const aria = ariaFor(stepId, scene, L, answers)
  const sel = GALAXIES[L.sel]
  const selDone = measured.includes(L.sel)
  const undoneNm = (H_ALPHA * L.u) / C_KMS
  const entNm = observedWavelength(H_ALPHA, L.entV)

  return (
    <div className="relative h-full overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#06070c] lg:rounded-[28px]">
      <div
        ref={wrapRef}
        className="absolute inset-0"
        style={{ touchAction: mode ? 'none' : 'auto', cursor: mode === 'H' ? 'ns-resize' : mode ? 'ew-resize' : 'default' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>

      {/* badges */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {stepId === 'imagine' && (
            <Badge key="speed">
              {formatNumber(L.ambV, 0)} m/s · {formatNumber(L.ambV * 3.6, 0)} km/h
            </Badge>
          )}
          {stepId === 'imagine' && L.listening && (
            <Badge key="hz" tone="accent">
              você ouve <span ref={hzRef}>—</span>
            </Badge>
          )}
          {stepId === 'preveja' && scene >= 1 && <Badge key="away">afastando-se · Hα → {formatNumber(observedWavelength(H_ALPHA, 20000), 0)} nm</Badge>}
          {stepId === 'entenda' && scene === 1 && (
            <Badge key="ent">
              Hα {formatNumber(H_ALPHA, 1)} → <span className="text-white">{formatNumber(entNm, 1)} nm</span>
            </Badge>
          )}
          {stepId === 'entenda' && scene === 1 && (
            <Badge key="entv" tone="accent">
              v = {formatNumber(Math.round(L.entV / 10) * 10, 0)} km/s
            </Badge>
          )}
          {stepId === 'observe' && scene === 1 && sel && (
            <Badge key={`sel-${L.sel}`}>
              {sel.id} · {sel.distanceMpc} Mpc · {selDone ? <span className="text-emerald-300">v = {formatNumber(sel.velocityKms, 0)} km/s</span> : <>Δλ desfeito {formatNumber(undoneNm, 1)} nm</>}
            </Badge>
          )}
          {stepId === 'meca' && (
            <Badge key="h0" tone={locked ? 'good' : 'accent'}>
              H₀ = {formatNumber(locked ? (answers.H0 as number) : L.H, 1)} km/s/Mpc
            </Badge>
          )}
          {stepId === 'e-se' && scene === 0 && picks.rebobinar !== undefined && (
            <Badge key="ago">
              rebobinando: há <span ref={agoRef}>0</span> bilhões de anos
            </Badge>
          )}
          {stepId === 'e-se' && scene === 1 && picks.centro !== undefined && <Badge key="pov">vista da galáxia C: todas se afastam dela</Badge>}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {(stepId === 'observe' || stepId === 'meca') && (
          <motion.span key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute bottom-2.5 right-3 z-10 text-[10.5px] text-white/35">
            galáxias hipotéticas · dados simulados
          </motion.span>
        )}
        {stepId === 'imagine' && (
          <motion.span key="exag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute bottom-2.5 left-3 z-10 text-[10.5px] text-white/35">
            desenho em câmera lenta · velocidade 3× exagerada
          </motion.span>
        )}
      </AnimatePresence>

      {/* drag hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <AnimatePresence>
          {showHint && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 py-1.5 pl-2 pr-3.5 text-[12.5px] text-white/85 backdrop-blur-xl"
            >
              {mode === 'H' ? (
                <motion.span animate={{ y: [0, -3, 0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col text-white/70">
                  <ChevronUp className="-mb-1.5 h-3.5 w-3.5" />
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              ) : mode === 'obs' ? (
                <Hand className="h-3.5 w-3.5 text-white/70" />
              ) : (
                <motion.span animate={{ x: [0, -3, 0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="flex text-white/70">
                  <ChevronLeft className="-mr-1.5 h-3.5 w-3.5" />
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.span>
              )}
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {burst && (
        <span key={burst.id} className="pointer-events-none absolute z-10" style={{ left: burst.x, top: burst.y, width: 0, height: 0 }}>
          <Burst color={burst.color} />
        </span>
      )}

      <AnimatePresence>{stepId === 'conclua' && <Medal key="medal" accent={lab.accent} />}</AnimatePresence>
    </div>
  )
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: 'accent' | 'good' }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={spring.snappy}
      className={
        'rounded-full bg-black/55 px-3 py-1.5 font-mono text-[12px] tabular-nums backdrop-blur-xl ' +
        (tone === 'accent' ? 'text-violet-100' : tone === 'good' ? 'text-emerald-200' : 'text-white/85')
      }
    >
      {children}
    </motion.div>
  )
}

function ariaFor(stepId: string, scene: number, L: UniLive, answers: Record<string, unknown>): string {
  switch (stepId) {
    case 'imagine':
      return `Rua à noite: uma ambulância passa a ${formatNumber(L.ambV, 0)} m/s por um ouvinte; as ondas de som se apertam à frente dela e se espaçam atrás.`
    case 'preveja':
      return scene === 0 ? 'Uma fonte de luz emite ondas; embaixo, o espectro com as linhas escuras do hidrogênio.' : 'A fonte se afasta: as ondas se esticam e as linhas do espectro deslizam para o vermelho.'
    case 'entenda':
      return scene === 0
        ? 'Espectro do arco-íris com quatro linhas escuras do hidrogênio: Hα, Hβ, Hγ e Hδ.'
        : `Espectro de laboratório em cima e observado embaixo; Hα observada em ${formatNumber(observedWavelength(H_ALPHA, L.entV), 1)} nm.`
    case 'observe':
      return scene === 1
        ? `Mapa com cinco galáxias hipotéticas; selecionada a ${GALAXIES[L.sel]?.id}. Embaixo, o espectro dela perto da linha Hα.`
        : `Mapa com a Via Láctea no centro e cinco galáxias hipotéticas, de A a E, a 20, 45, 80, 120 e 160 megaparsecs.${scene === 2 ? ' Setas mostram que as mais distantes se afastam mais rápido.' : ''}`
    case 'meca':
      return `Gráfico de velocidade por distância com cinco pontos e uma reta pela origem com inclinação ${formatNumber(typeof answers.H0 === 'number' ? (answers.H0 as number) : L.H, 1)} km/s por Mpc.`
    case 'e-se':
      return scene === 0
        ? 'As galáxias voltam no tempo e se juntam num único ponto.'
        : scene === 1
          ? 'Mapa de galáxias visto de outra galáxia: todas se afastam dela também.'
          : 'A Via Láctea e Andrômeda, a 0,78 megaparsec: Andrômeda se aproxima a 300 km/s.'
    default:
      return 'Campo de galáxias girando devagar, com a medalha da conquista.'
  }
}

// ------------------------------------------------------------ drawing

function drawAmbulance(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flash: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  // headlight beam
  const beam = ctx.createLinearGradient(30, 0, 120, 0)
  beam.addColorStop(0, 'rgba(255,240,200,0.22)')
  beam.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(32, 2)
  ctx.lineTo(120, -8)
  ctx.lineTo(120, 18)
  ctx.closePath()
  ctx.fill()
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(0, 15, 36, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // body
  ctx.fillStyle = '#eef1f8'
  ctx.beginPath()
  ctx.roundRect(-34, -16, 50, 28, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(10, -8, 24, 20, [2, 8, 4, 2])
  ctx.fill()
  // window
  ctx.fillStyle = '#1b2a44'
  ctx.beginPath()
  ctx.roundRect(18, -5, 12, 7, [1, 5, 1, 1])
  ctx.fill()
  // stripe + cross
  ctx.fillStyle = '#ff4d5e'
  ctx.fillRect(-34, 2, 68, 3)
  ctx.fillRect(-14, -12, 4, 11)
  ctx.fillRect(-17.5, -8.5, 11, 4)
  // light bar
  const c = flash ? [255, 70, 90] : [80, 150, 255]
  const g = ctx.createRadialGradient(-6, -19, 0, -6, -19, 22)
  g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.75)`)
  g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(-6, -19, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`
  ctx.beginPath()
  ctx.roundRect(-13, -20, 14, 4, 2)
  ctx.fill()
  // wheels
  for (const wx of [-20, 21]) {
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(wx, 12, 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#777'
    ctx.beginPath()
    ctx.arc(wx, 12, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawListener(ctx: CanvasRenderingContext2D, x: number, y: number, font: string) {
  ctx.fillStyle = 'rgba(215,225,245,0.9)'
  ctx.beginPath()
  ctx.arc(x, y - 19, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x - 7, y - 11, 14, 19, [7, 7, 3, 3])
  ctx.fill()
  ctx.font = `11px ${font}`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('você', x, y + 22)
}

function drawGalaxy(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tilt: number, col: [number, number, number], a: number) {
  if (a <= 0.005 || r <= 0) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  ctx.scale(1, 0.48)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2)
  g.addColorStop(0, `rgba(255,252,240,${a})`)
  g.addColorStop(0.18, rgba(col, 0.75 * a))
  g.addColorStop(0.55, rgba(col, 0.18 * a))
  g.addColorStop(1, rgba(col, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawMilkyWay(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number, rot: number) {
  if (a <= 0.01) return
  ctx.save()
  ctx.translate(x, y)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8)
  g.addColorStop(0, `rgba(255,246,225,${a})`)
  g.addColorStop(0.25, `rgba(255,214,160,${0.6 * a})`)
  g.addColorStop(1, 'rgba(160,170,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.rotate(rot * 3)
  ctx.strokeStyle = `rgba(200,210,255,${0.45 * a})`
  ctx.lineWidth = Math.max(1, size / 8)
  for (const k of [0, Math.PI]) {
    ctx.beginPath()
    for (let i = 0; i <= 24; i++) {
      const th = (i / 24) * 3.2
      const rr = size * 0.25 * Math.exp(0.42 * th)
      const px = rr * Math.cos(th + k)
      const py = rr * Math.sin(th + k)
      if (i) ctx.lineTo(px, py)
      else ctx.moveTo(px, py)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function arrowSeg(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width: number, dashed = false) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 2) return
  const ux = (x1 - x0) / len
  const uy = (y1 - y0) / len
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  if (dashed) ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - ux * 4, y1 - uy * 4)
  ctx.stroke()
  ctx.setLineDash([])
  const h = 3 + width * 1.6
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - ux * h - uy * h * 0.6, y1 - uy * h + ux * h * 0.6)
  ctx.lineTo(x1 - ux * h + uy * h * 0.6, y1 - uy * h - ux * h * 0.6)
  ctx.closePath()
  ctx.fill()
}

/** Arrow from a galaxy, pointing away from the observer, length ∝ distance (Hubble law). */
function drawArrow(ctx: CanvasRenderingContext2D, p: { x: number; y: number }, dx: number, dy: number, _unused: number, scale: number, rot: number, color: string, width: number) {
  const d = Math.hypot(dx, dy)
  if (d < 1) return
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const rx = (dx * c - dy * s) / d
  const ry = (dx * s + dy * c) / d
  const L = d * scale
  const off = 8
  arrowSeg(ctx, p.x + rx * off, p.y + ry * off, p.x + rx * (off + L), p.y + ry * (off + L), color, width)
}

function drawSpectrum(ctx: CanvasRenderingContext2D, W: number, H: number, D: View, font: string, mono: string) {
  const a = D.spec
  const x0 = 16
  const x1 = W - 16
  const bw = x1 - x0
  const boxH = D.specH * H
  const cy = D.specCy * H
  const lo = D.lo
  const hi = D.hi
  const toX = (nm: number) => x0 + ((nm - lo) / (hi - lo)) * bw
  const bandH = clamp(boxH * 0.2, 14, 30)
  const gap = boxH * 0.5
  const labY = cy - (D.dual * gap) / 2
  const obsY = cy + (D.dual * gap) / 2

  // backing panel (over the field of galaxies)
  if (D.field > 0.01) {
    ctx.fillStyle = `rgba(6,7,12,${0.88 * a * D.field})`
    ctx.beginPath()
    ctx.roundRect(8, cy - boxH / 2, W - 16, boxH, 18)
    ctx.fill()
    ctx.strokeStyle = `rgba(255,255,255,${0.07 * a * D.field})`
    ctx.stroke()
  }

  const band = (y: number, alpha: number) => {
    if (alpha <= 0.01) return
    for (let x = 0; x < bw; x += 2) {
      const nm = lo + (x / bw) * (hi - lo)
      ctx.fillStyle = rgba(wavelengthToRgb(nm), alpha)
      ctx.fillRect(x0 + x, y - bandH / 2, 2.5, bandH)
    }
  }
  const lines = (y: number, v: number, alpha: number) => {
    if (alpha <= 0.01) return
    ctx.fillStyle = `rgba(0,0,0,${0.92 * alpha})`
    for (const l of H_LINES) {
      const x = toX(observedWavelength(l.nm, v))
      if (x < x0 - 2 || x > x1 + 2) continue
      ctx.fillRect(x - 1.5, y - bandH / 2, 3, bandH)
    }
  }

  // lab (rest) spectrum
  const la = a * D.dual
  band(labY, la)
  lines(labY, 0, la)
  // observed spectrum
  band(obsY, a)
  lines(obsY, D.specV, a)

  // connectors
  if (la > 0.01) {
    ctx.strokeStyle = `rgba(255,255,255,${0.4 * la})`
    ctx.lineWidth = 1
    for (const l of H_LINES) {
      const xa = toX(l.nm)
      const xb = toX(observedWavelength(l.nm, D.specV))
      if ((xa < x0 && xb < x0) || (xa > x1 && xb > x1)) continue
      ctx.beginPath()
      ctx.moveTo(xa, labY + bandH / 2 + 2)
      ctx.lineTo(xb, obsY - bandH / 2 - 2)
      ctx.stroke()
    }
    ctx.font = `10.5px ${font}`
    ctx.textAlign = 'right'
    ctx.fillStyle = `rgba(255,255,255,${0.5 * la})`
    ctx.fillText('laboratório (em repouso)', x1, labY - bandH / 2 - 16)
    ctx.fillText('observado', x1, obsY + bandH / 2 + 30)
  }

  // ghost rest marks
  const ga = a * D.ghost * (1 - D.dual)
  if (ga > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${0.75 * ga})`
    for (const l of H_LINES) {
      const x = toX(l.nm)
      ctx.beginPath()
      ctx.moveTo(x, obsY - bandH / 2 - 3)
      ctx.lineTo(x - 4, obsY - bandH / 2 - 10)
      ctx.lineTo(x + 4, obsY - bandH / 2 - 10)
      ctx.closePath()
      ctx.fill()
    }
  }

  // line names above the top band
  const na = a * D.specLabels
  if (na > 0.01) {
    ctx.font = `600 11px ${font}`
    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(255,255,255,${0.85 * na})`
    const topY = D.dual > 0.5 ? labY : obsY
    const v = D.dual > 0.5 ? 0 : D.specV
    for (const l of H_LINES) {
      const x = toX(observedWavelength(l.nm, v))
      if (x < x0 || x > x1) continue
      ctx.fillText(l.label, x, topY - bandH / 2 - 5)
    }
  }

  // wavelength axis under the bottom band
  const span = hi - lo
  const step = span > 200 ? 50 : 10
  ctx.font = `10px ${mono}`
  ctx.textAlign = 'center'
  ctx.fillStyle = `rgba(255,255,255,${0.4 * a})`
  for (let nm = Math.ceil(lo / step) * step; nm <= hi; nm += step) {
    const x = toX(nm)
    if (x < x0 + 8 || x > x1 - 8) continue
    ctx.fillRect(x - 0.5, obsY + bandH / 2 + 2, 1, 4)
    ctx.fillText(String(nm), x, obsY + bandH / 2 + 15)
  }
  ctx.textAlign = 'left'
  ctx.fillText('nm', x0, obsY + bandH / 2 + 15)
}

// ------------------------------------------------------------ medal

function Medal({ accent }: { accent: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-32 w-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
        />
        <svg viewBox="0 0 160 160" className="relative h-full w-full">
          <defs>
            <radialGradient id="uniMedalCore">
              <stop offset="0%" stopColor="#fffaf0" />
              <stop offset="60%" stopColor="#ffd9a8" />
              <stop offset="100%" stopColor="#b993ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle cx="80" cy="80" r="66" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
          <motion.circle cx="80" cy="80" r="56" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.3 }} style={{ originX: '80px', originY: '80px' }} />
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx="80"
              cy="80"
              fill="none"
              stroke={accent}
              strokeOpacity={0.5 - i * 0.12}
              strokeWidth="1.2"
              initial={{ r: 4 }}
              animate={{ r: 18 + i * 12 }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          <motion.circle cx="80" cy="80" r="12" fill="url(#uniMedalCore)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.45 }} style={{ originX: '80px', originY: '80px' }} />
        </svg>
      </div>
    </motion.div>
  )
}
