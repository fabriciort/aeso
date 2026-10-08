'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import {
  colorName,
  GROUP_LABEL,
  logLOnRadiusLine,
  mainSequenceLogL,
  NAMED_STARS,
  R_SUN_IN_AU,
  radiusFrom,
  rng,
  starById,
  starColor,
  SUN_TRACK,
} from '@/lib/astro/stars'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import DragSurface from '@/components/instruments/DragSurface'
import { Panel, type StageProps } from '../runtime'
import { useGaia, type GaiaData, type HrLive } from './data'
import { fmtL, fmtR, fmtT } from './format'

// The continuous Palco of "Monte o diagrama H-R": a night sky whose stars
// fly into an H-R diagram, then thousands of Gaia stars rain onto it. One
// canvas, mounted for the whole lab. Every visual quantity is interpolated
// each frame towards a target derived from (step, scene, answers, live), so
// nothing ever cuts: it morphs.

const PAD = { l: 46, r: 12, t: 46, b: 34 }
const Y0 = -4.6
const Y1 = 5.9
const X_COOL = 3.38
const X_HOT = 4.68
const X_HOT_WIDE = 5.2
const LOG_T_SUN = Math.log10(5772)

const BETELGEUSE = starById('betelgeuse')!
const SIRIUS_B = starById('sirius-b')!
export const BETELGEUSE_R = radiusFrom(BETELGEUSE.lum, BETELGEUSE.teff)

const FIXED_RADII = [0.01, 1, 100, 1000]
const ORBITS = [
  { name: 'Mercúrio', au: 0.387 },
  { name: 'Vênus', au: 0.723 },
  { name: 'Terra', au: 1 },
  { name: 'Marte', au: 1.524 },
  { name: 'Júpiter', au: 5.203 },
]
const TRACK_SEG_S = 0.42

// Regions (index): main sequence, giants, supergiants, white dwarfs
const REGION_COLORS = ['124,196,255', '246,183,78', '251,113,133', '196,181,253']

const STEP = { imagine: 0, preveja: 1, observe: 2, entenda: 3, meca: 4, 'e-se': 5, conclua: 6 } as const

function halton(i: number, b: number) {
  let f = 1
  let r = 0
  while (i > 0) {
    f /= b
    r += f * (i % b)
    i = Math.floor(i / b)
  }
  return r
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const easeOut = (x: number) => 1 - (1 - x) ** 3
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

interface Target {
  fly: number
  axes: number
  sky: number
  rain: number
  gaiaA: number
  regions: [number, number, number, number]
  radLines: number
  movA: number
  movLogR: number
  disk: number
  orbit: number
  xHot: number
  track: number
  msEmph: number
  dimOthers: number
  hl: Set<string>
  labels: Set<string>
}

function targetFor(stepId: string, scene: number, answers: Record<string, unknown>, live: Partial<HrLive>): Target {
  const si = STEP[stepId as keyof typeof STEP] ?? 0
  const organized = Boolean(answers.organized)
  const sunFound = Boolean(answers.sunFound)
  const picks = (answers.challenges as Record<string, number | undefined> | undefined) ?? {}
  const fly = si > STEP.observe || (si === STEP.observe && organized) ? 1 : 0
  const t: Target = {
    fly,
    axes: fly ? 1 : si >= STEP.preveja ? 0.35 : 0,
    sky: fly ? 0 : 1,
    rain: si > STEP.observe || (si === STEP.observe && scene >= 1) ? 1 : 0,
    gaiaA: 0.6,
    regions: [0, 0, 0, 0],
    radLines: 0,
    movA: 0,
    movLogR: 0,
    disk: 0,
    orbit: 0,
    xHot: X_HOT,
    track: 0,
    msEmph: 0,
    dimOthers: 0,
    hl: new Set(),
    labels: new Set(),
  }
  if (live.selected) t.labels.add(live.selected)
  if (si === STEP.observe) {
    if (scene <= 1 && fly) ['betelgeuse', 'rigel', 'sirius-a', 'sirius-b', 'proxima', 'deneb'].forEach((id) => t.labels.add(id))
    if (scene >= 2) {
      t.regions = [1, 1, 1, 1]
      t.labels.delete('sol')
      if (sunFound) {
        t.hl.add('sol')
        t.labels.add('sol')
      }
    }
  }
  if (si === STEP.entenda) {
    t.radLines = 1
    t.gaiaA = 0.4
    if (scene >= 1) {
      t.movA = 1
      t.movLogR = Math.log10(live.radius ?? 1)
      t.disk = 1
      t.radLines = 0.45
    }
  }
  if (si === STEP.meca) {
    t.gaiaA = 0.35
    if (scene === 0) {
      t.hl.add('betelgeuse')
      t.labels.add('betelgeuse')
      t.movA = 1
      t.movLogR = Math.log10(live.measureR ?? 10)
      t.disk = 1
    } else if (scene === 1) {
      t.orbit = 1
      t.movLogR = Math.log10(typeof answers.betelR === 'number' ? answers.betelR : BETELGEUSE_R)
    } else {
      t.hl.add('sirius-b')
      t.labels.add('sirius-b')
      t.movA = 1
      t.movLogR = Math.log10(SIRIUS_B.radius)
      t.disk = 1
    }
  }
  if (si === STEP['e-se']) {
    if (scene === 0) {
      t.labels.add('sol')
      if (picks.sol !== undefined) {
        t.xHot = X_HOT_WIDE
        t.track = 1
        t.dimOthers = 1
        t.gaiaA = 0.3
      } else t.hl.add('sol')
    } else {
      t.regions = [picks.ms !== undefined ? 1 : 0.5, 0, 0, 0]
      if (picks.ms !== undefined) t.msEmph = 1
    }
  }
  if (si === STEP.conclua) {
    t.regions = [0.8, 0.8, 0.8, 0.8]
    t.radLines = 0.25
    ;['sol', 'betelgeuse'].forEach((id) => {
      t.hl.add(id)
      t.labels.add(id)
    })
    ;['sirius-b', 'rigel', 'proxima'].forEach((id) => t.labels.add(id))
  }
  return t
}

interface Disp {
  axes: number
  sky: number
  rain: number
  gaiaA: number
  regions: number[]
  radLines: number
  movA: number
  movLogR: number
  disk: number
  orbit: number
  xHot: number
  trackA: number
  msEmph: number
  dimOthers: number
}

interface Points {
  n: number
  lt: Float32Array
  ll: Float32Array
  delay: Float32Array
  onMs: Uint8Array
  bins: Int32Array[]
  binColor: string[]
}

const NB = 14
function preparePoints(d: GaiaData | null): Points | null {
  if (!d) return null
  const n = d.stars.length
  const lt = new Float32Array(n)
  const ll = new Float32Array(n)
  const delay = new Float32Array(n)
  const onMs = new Uint8Array(n)
  const r = rng(42)
  const lists: number[][] = Array.from({ length: NB }, () => [])
  for (let i = 0; i < n; i++) {
    const [T, L] = d.stars[i]
    lt[i] = Math.log10(T)
    ll[i] = Math.log10(Math.max(L, 1e-6))
    delay[i] = r() * 0.7
    onMs[i] = Math.abs(ll[i] - mainSequenceLogL(lt[i])) < 0.55 ? 1 : 0
    const b = Math.min(NB - 1, Math.max(0, Math.floor(((lt[i] - 3.42) / (4.4 - 3.42)) * NB)))
    lists[b].push(i)
  }
  return {
    n,
    lt,
    ll,
    delay,
    onMs,
    bins: lists.map((l) => Int32Array.from(l)),
    binColor: lists.map((_, b) => starColor(10 ** (3.42 + ((b + 0.5) / NB) * (4.4 - 3.42)))),
  }
}

function ariaFor(stepId: string, scene: number, answers: Record<string, unknown>): string {
  const si = STEP[stepId as keyof typeof STEP] ?? 0
  if (si < STEP.observe || (si === STEP.observe && !answers.organized)) return 'Céu noturno com estrelas famosas, coloridas pela temperatura e com tamanho pelo brilho'
  if (si === STEP.observe && scene === 0) return 'Diagrama H-R: temperatura no eixo horizontal, quente à esquerda, e luminosidade no vertical, com estrelas famosas'
  if (si === STEP.observe) return 'Diagrama H-R com milhares de estrelas formando a sequência principal, gigantes, supergigantes e anãs brancas'
  if (si === STEP.entenda) return 'Diagrama H-R com retas diagonais de raio constante'
  if (si === STEP.meca && scene === 1) return 'Betelgeuse no lugar do Sol, engolindo as órbitas de Mercúrio, Vênus, Terra e Marte'
  if (si === STEP.meca) return 'Diagrama H-R com uma reta de raio e Betelgeuse destacada'
  if (si === STEP['e-se']) return scene === 0 ? 'Caminho evolutivo do Sol no diagrama H-R' : 'Diagrama H-R com a sequência principal destacada'
  return 'Diagrama H-R completo com o Sol e Betelgeuse destacados'
}

export default function HrStage({ stepId, scene, answers, setAnswer, live: liveRaw, setLive: setLiveRaw }: StageProps) {
  const live = liveRaw as Partial<HrLive>
  const setLive = setLiveRaw as (p: Partial<HrLive>) => void
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gaia = useGaia()
  const points = useMemo(() => preparePoints(gaia), [gaia])
  const [trackLabel, setTrackLabel] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; hit: boolean }[]>([])

  const target = useMemo(() => targetFor(stepId, scene, answers, live), [stepId, scene, answers, live])
  const si = STEP[stepId as keyof typeof STEP] ?? 0

  // Everything the animation loop reads, without restarting it.
  const state = useRef({ target, points, replay: live.trackReplay ?? 0 })
  state.current.target = target
  state.current.points = points
  const positions = useRef<{ x: number; y: number }[]>(NAMED_STARS.map(() => ({ x: 0, y: 0 })))
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    if (gaia) setLive({ gaiaCount: gaia.stars.length, gaiaSource: gaia.source })
  }, [gaia, setLive])

  // ------------------------------------------------------------ loop
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !wrap || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const font = getComputedStyle(canvas).fontFamily || 'system-ui, sans-serif'
    let dpr = 1
    const resize = () => {
      const r = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { w: r.width, h: r.height }
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const N = NAMED_STARS.length
    const sky = NAMED_STARS.map((_, i) => ({ hx: 0.06 + 0.88 * halton(i + 1, 2), hy: 0.1 + 0.8 * halton(i + 1, 3) }))
    const order = sky.map((s, i) => [s.hx, i] as const).sort((a, b) => a[0] - b[0])
    const delay = new Float32Array(N)
    order.forEach(([, i], k) => (delay[i] = k * 0.035))
    const phase = NAMED_STARS.map((_, i) => (i * 2.399) % (Math.PI * 2))
    const r0 = rng(3)
    const bg = Array.from({ length: 170 }, () => ({ x: r0(), y: r0(), s: 0.4 + r0() * 0.9, p: r0() * 6.28 }))

    const t0 = state.current.target
    const disp: Disp = {
      axes: t0.axes,
      sky: t0.sky,
      rain: t0.rain,
      gaiaA: t0.gaiaA,
      regions: [...t0.regions],
      radLines: t0.radLines,
      movA: t0.movA,
      movLogR: t0.movLogR,
      disk: t0.disk,
      orbit: t0.orbit,
      xHot: t0.xHot,
      trackA: t0.track,
      msEmph: t0.msEmph,
      dimOthers: t0.dimOthers,
    }
    const flyV = new Float32Array(N).fill(t0.fly)
    const hlA = new Float32Array(N)
    const labA = new Float32Array(N)
    let flyTarget = t0.fly
    let flyChanged = -10
    let trackV = t0.track ? (reduce ? SUN_TRACK.length - 1 : 0) : 0
    let lastReplay = state.current.replay
    let lastLabelIdx = -1
    let last = performance.now()
    let raf = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const time = now / 1000
      const T = state.current.target
      const P = state.current.points
      const { w, h } = sizeRef.current
      if (!w || !h) return
      const k = reduce ? 1 : 1 - Math.pow(1 - 0.12, dt * 60)
      const lerp = (a: number, b: number) => a + (b - a) * k

      // ---- interpolate towards the target
      disp.axes = lerp(disp.axes, T.axes)
      disp.sky = lerp(disp.sky, T.sky)
      disp.gaiaA = lerp(disp.gaiaA, T.gaiaA)
      for (let i = 0; i < 4; i++) disp.regions[i] = lerp(disp.regions[i], T.regions[i])
      disp.radLines = lerp(disp.radLines, T.radLines)
      disp.movA = lerp(disp.movA, T.movA)
      disp.movLogR = disp.movA < 0.02 && T.movA > 0 ? T.movLogR : lerp(disp.movLogR, T.movLogR)
      disp.disk = lerp(disp.disk, T.disk)
      disp.orbit = lerp(disp.orbit, T.orbit)
      disp.xHot = lerp(disp.xHot, T.xHot)
      disp.trackA = lerp(disp.trackA, T.track)
      disp.msEmph = lerp(disp.msEmph, T.msEmph)
      disp.dimOthers = lerp(disp.dimOthers, T.dimOthers)
      // Gaia rain is a clock (not an exponential), so the shower has a rhythm.
      if (P) disp.rain = reduce ? T.rain : T.rain > disp.rain ? Math.min(T.rain, disp.rain + dt / 2.2) : Math.max(T.rain, disp.rain - dt / 0.6)
      if (T.fly !== flyTarget) {
        flyTarget = T.fly
        flyChanged = time
      }
      for (let i = 0; i < N; i++) {
        if (reduce) flyV[i] = flyTarget
        else if (time - flyChanged > delay[i]) flyV[i] = flyTarget > flyV[i] ? Math.min(1, flyV[i] + dt / 0.9) : Math.max(0, flyV[i] - dt / 0.9)
        const id = NAMED_STARS[i].id
        hlA[i] = lerp(hlA[i], T.hl.has(id) ? 1 : 0)
        labA[i] = lerp(labA[i], T.labels.has(id) ? 1 : 0)
      }
      // Sun track clock
      if (state.current.replay !== lastReplay) {
        lastReplay = state.current.replay
        trackV = 0
      }
      if (T.track) trackV = reduce ? SUN_TRACK.length - 1 : Math.min(SUN_TRACK.length - 1, trackV + dt / TRACK_SEG_S)
      else if (disp.trackA < 0.02) trackV = 0
      const segIdx = Math.floor(trackV)
      let labelIdx = -1
      for (let i = 0; i <= segIdx && i < SUN_TRACK.length; i++) if (SUN_TRACK[i].label) labelIdx = i
      if (!T.track) labelIdx = -1
      if (labelIdx !== lastLabelIdx) {
        lastLabelIdx = labelIdx
        setTrackLabel(labelIdx >= 0 ? (SUN_TRACK[labelIdx].label ?? null) : null)
      }

      // ---- projection
      const pw = w - PAD.l - PAD.r
      const ph = h - PAD.t - PAD.b
      const X = (lt: number) => PAD.l + ((disp.xHot - lt) / (disp.xHot - X_COOL)) * pw
      const Y = (ll: number) => PAD.t + ((Y1 - ll) / (Y1 - Y0)) * ph
      const inPlot = (x: number, y: number, m = 0) => x >= PAD.l + m && x <= PAD.l + pw - m && y >= PAD.t + m && y <= PAD.t + ph - m
      const orbitDim = 1 - 0.85 * disp.orbit

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // ---- background sky
      if (disp.sky > 0.01) {
        ctx.fillStyle = '#fff'
        for (const s of bg) {
          ctx.globalAlpha = disp.sky * (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(time * 1.4 + s.p)))
          ctx.fillRect(s.x * w, s.y * h, s.s, s.s)
        }
        const g = ctx.createLinearGradient(0, h * 0.7, 0, h)
        g.addColorStop(0, 'rgba(124,196,255,0)')
        g.addColorStop(1, `rgba(124,196,255,${0.06 * disp.sky})`)
        ctx.globalAlpha = 1
        ctx.fillStyle = g
        ctx.fillRect(0, h * 0.7, w, h * 0.3)
      }

      // ---- axes
      if (disp.axes > 0.01) {
        const a = disp.axes * orbitDim
        ctx.lineWidth = 1
        ctx.font = `10.5px ${font}`
        for (const v of [-4, -2, 0, 2, 4]) {
          const y = Math.round(Y(v)) + 0.5
          ctx.globalAlpha = a
          ctx.strokeStyle = 'rgba(255,255,255,0.06)'
          ctx.beginPath()
          ctx.moveTo(PAD.l, y)
          ctx.lineTo(PAD.l + pw, y)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.42)'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          ctx.fillText(formatNumber(10 ** v, 4), PAD.l - 6, y)
        }
        for (const v of [100000, 40000, 20000, 10000, 5000, 3000]) {
          const lt = Math.log10(v)
          if (lt > disp.xHot - 0.03) continue
          const x = Math.round(X(lt)) + 0.5
          ctx.globalAlpha = a * clamp01((disp.xHot - lt) / 0.08)
          ctx.strokeStyle = 'rgba(255,255,255,0.06)'
          ctx.beginPath()
          ctx.moveTo(x, PAD.t)
          ctx.lineTo(x, PAD.t + ph)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.42)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(formatNumber(v, 0), x, PAD.t + ph + 6)
        }
        ctx.globalAlpha = a
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.beginPath()
        ctx.moveTo(PAD.l, PAD.t)
        ctx.lineTo(PAD.l, PAD.t + ph)
        ctx.lineTo(PAD.l + pw, PAD.t + ph)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = `11px ${font}`
        ctx.textBaseline = 'bottom'
        ctx.textAlign = 'left'
        ctx.fillText('← mais quente', PAD.l, h - 1)
        ctx.textAlign = 'right'
        ctx.fillText('Temperatura (K)', PAD.l + pw, h - 1)
        ctx.save()
        ctx.translate(11, PAD.t + ph / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Luminosidade (L☉)', 0, 0)
        ctx.restore()
      }

      ctx.save()
      ctx.beginPath()
      ctx.rect(PAD.l, PAD.t, pw, ph)
      ctx.clip()

      // ---- regions
      const dexPx = ph / (Y1 - Y0)
      const ra = disp.regions
      if (ra[0] > 0.01) {
        ctx.globalAlpha = ra[0] * orbitDim
        ctx.strokeStyle = `rgba(${REGION_COLORS[0]},${0.1 + 0.08 * disp.msEmph})`
        ctx.lineWidth = dexPx * 0.9
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        for (let lt = 3.45; lt <= 4.5; lt += 0.02) (lt === 3.45 ? ctx.moveTo.bind(ctx) : ctx.lineTo.bind(ctx))(X(lt), Y(mainSequenceLogL(lt)))
        ctx.stroke()
      }
      if (ra[1] > 0.01) {
        ctx.globalAlpha = ra[1] * orbitDim
        ctx.fillStyle = `rgba(${REGION_COLORS[1]},0.1)`
        ctx.beginPath()
        ctx.ellipse(X(3.655), Y(1.9), Math.abs(X(3.655) - X(3.73)), Math.abs(Y(1.9) - Y(3.2)), 0, 0, Math.PI * 2)
        ctx.fill()
      }
      if (ra[2] > 0.01) {
        ctx.globalAlpha = ra[2] * orbitDim
        ctx.fillStyle = `rgba(${REGION_COLORS[2]},0.07)`
        ctx.fillRect(PAD.l, Y(5.7), pw, Y(4) - Y(5.7))
      }
      if (ra[3] > 0.01) {
        ctx.globalAlpha = ra[3] * orbitDim
        ctx.strokeStyle = `rgba(${REGION_COLORS[3]},0.12)`
        ctx.lineWidth = dexPx * 0.75
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(X(3.7), Y(logLOnRadiusLine(0.0125, 3.7)))
        ctx.lineTo(X(4.45), Y(logLOnRadiusLine(0.0125, 4.45)))
        ctx.stroke()
      }

      // ---- fixed radius lines
      const radiusLine = (R: number, color: string, width: number, dash: number[], label: string, labelFont: string) => {
        const yA = Y(logLOnRadiusLine(R, disp.xHot))
        const yB = Y(logLOnRadiusLine(R, X_COOL))
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.setLineDash(dash)
        ctx.beginPath()
        ctx.moveTo(PAD.l, yA)
        ctx.lineTo(PAD.l + pw, yB)
        ctx.stroke()
        ctx.setLineDash([])
        // Label: on the visible part of the line, towards the cool side.
        let best: [number, number] | null = null
        for (let f = 0.92; f >= 0.05; f -= 0.02) {
          const x = PAD.l + f * pw
          const y = yA + f * (yB - yA)
          if (inPlot(x, y, 16) && x < PAD.l + pw - 70) {
            best = [x, y]
            break
          }
        }
        if (best) {
          ctx.save()
          ctx.translate(best[0], best[1])
          ctx.rotate(Math.atan2(yB - yA, pw))
          ctx.fillStyle = color
          ctx.font = labelFont
          ctx.textAlign = 'left'
          ctx.textBaseline = 'bottom'
          ctx.fillText(label, 4, -4)
          ctx.restore()
        }
      }
      if (disp.radLines > 0.01) {
        ctx.globalAlpha = disp.radLines * orbitDim
        for (const R of FIXED_RADII) radiusLine(R, 'rgba(255,255,255,0.45)', 1, [4, 5], `${formatNumber(R, 2)} R☉`, `10.5px ${font}`)
      }

      // ---- Gaia stars
      if (P && disp.rain > 0.001) {
        const base = disp.gaiaA * orbitDim
        const s = 1.7
        for (let b = 0; b < NB; b++) {
          ctx.fillStyle = P.binColor[b]
          const list = P.bins[b]
          for (let j = 0; j < list.length; j++) {
            const i = list[j]
            const p = clamp01((disp.rain - P.delay[i]) / 0.3)
            if (p <= 0) continue
            const x = X(P.lt[i])
            let y = Y(P.ll[i])
            if (p < 1) y -= (1 - easeOut(p)) * h * 0.55
            ctx.globalAlpha = base * p * (P.onMs[i] ? 1 : 1 - 0.75 * disp.msEmph)
            ctx.fillRect(x - s / 2, y - s / 2, s, s)
          }
        }
      }

      // ---- region labels (over the points)
      ctx.font = `600 11.5px ${font}`
      ctx.textBaseline = 'middle'
      const regionLabel = (i: number, text: string, x: number, y: number, angle = 0) => {
        if (ra[i] < 0.01) return
        ctx.globalAlpha = ra[i] * orbitDim
        ctx.fillStyle = `rgb(${REGION_COLORS[i]})`
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.textAlign = 'center'
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }
      {
        const a = X(4.2)
        const b = X(4.05)
        const ya = Y(mainSequenceLogL(4.2))
        const yb = Y(mainSequenceLogL(4.05))
        const ang = Math.atan2(yb - ya, b - a)
        const nx = Math.sin(ang)
        const ny = -Math.cos(ang)
        const off = dexPx * 0.45 + 12
        regionLabel(0, disp.msEmph > 0.5 ? '~90 % da vida aqui' : 'Sequência principal', (a + b) / 2 + nx * off, (ya + yb) / 2 + ny * off, ang)
        regionLabel(1, 'Gigantes', X(3.655), Y(3.45))
        regionLabel(2, 'Supergigantes', PAD.l + pw * 0.28, Y(5.45))
        const wa = X(4.3)
        const wb = X(4.1)
        const wya = Y(logLOnRadiusLine(0.0125, 4.3))
        const wyb = Y(logLOnRadiusLine(0.0125, 4.1))
        const wang = Math.atan2(wyb - wya, wb - wa)
        regionLabel(3, 'Anãs brancas', (wa + wb) / 2 - Math.sin(wang) * (dexPx * 0.4 + 12), (wya + wyb) / 2 + Math.cos(wang) * (dexPx * 0.4 + 12), wang)
      }

      // ---- movable radius line
      if (disp.movA > 0.01) {
        ctx.globalAlpha = disp.movA * orbitDim
        ctx.shadowColor = 'rgba(124,196,255,0.8)'
        ctx.shadowBlur = 8
        radiusLine(10 ** disp.movLogR, '#7cc4ff', 2, [], `R = ${fmtR(10 ** disp.movLogR)}`, `600 12.5px ${font}`)
        ctx.shadowBlur = 0
      }

      // ---- Sun's evolutionary track
      if (disp.trackA > 0.01) {
        const pts = SUN_TRACK.map((p) => [X(Math.log10(p.teff)), Y(Math.log10(p.lum))] as const)
        const seg = Math.min(pts.length - 2, Math.floor(trackV))
        const f = trackV - seg
        const head: [number, number] =
          trackV >= pts.length - 1 ? [pts[pts.length - 1][0], pts[pts.length - 1][1]] : [pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * f, pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * f]
        ctx.globalAlpha = disp.trackA
        ctx.strokeStyle = 'rgba(246,183,78,0.85)'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i <= seg && i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
        ctx.lineTo(head[0], head[1])
        ctx.stroke()
        // dots at labelled stages already reached
        ctx.fillStyle = 'rgba(246,183,78,0.9)'
        SUN_TRACK.forEach((p, i) => {
          if (p.label && i <= trackV) {
            ctx.beginPath()
            ctx.arc(pts[i][0], pts[i][1], 2.5, 0, Math.PI * 2)
            ctx.fill()
          }
        })
        const tHead = trackV >= pts.length - 1 ? SUN_TRACK[pts.length - 1].teff : 10 ** (Math.log10(SUN_TRACK[seg].teff) + (Math.log10(SUN_TRACK[seg + 1].teff) - Math.log10(SUN_TRACK[seg].teff)) * f)
        const g = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 16)
        g.addColorStop(0, starColor(tHead, 0.9))
        g.addColorStop(1, starColor(tHead, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(head[0], head[1], 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(head[0], head[1], 3.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore() // plot clip

      // ---- named stars (sky ↔ diagram)
      for (let i = 0; i < N; i++) {
        const s = NAMED_STARS[i]
        const e = easeInOut(flyV[i])
        const lt = Math.log10(s.teff)
        const ll = Math.log10(s.lum)
        const sx = sky[i].hx * w
        const sy = sky[i].hy * h
        const px = X(lt)
        const py = Y(ll)
        // A gentle arc, so stars swoop instead of sliding.
        const dx = px - sx
        const dy = py - sy
        const arc = Math.sin(Math.PI * e) * 0.18 * (i % 2 ? 1 : -1)
        let x = sx + dx * e - dy * arc
        let y = sy + dy * e + dx * arc
        let r = (1.3 + 0.55 * Math.min(Math.max(ll + 3.5, 0), 10.5)) * (1 - e) + (2.6 + 0.12 * (ll + 4)) * e
        let alpha = (0.72 + 0.28 * Math.sin(time * (1.1 + (i % 5) * 0.23) + phase[i])) * (1 - e) + e
        alpha *= 1 - disp.dimOthers * 0.65 * (1 - hlA[i])
        if (s.id === 'betelgeuse' && disp.orbit > 0.01) {
          // Betelgeuse grows into a disc as big as its real size, centered where the Sun would be.
          const o = easeInOut(disp.orbit)
          const scale = (Math.min(pw, ph) * 0.47) / 5.203
          const R = 10 ** disp.movLogR * R_SUN_IN_AU * scale
          x = x + (PAD.l + pw / 2 - x) * o
          y = y + (PAD.t + ph / 2 - y) * o
          r = r + (R - r) * o
        } else alpha *= orbitDim
        positions.current[i] = { x, y }
        if (alpha < 0.01) continue
        const col = starColor(s.teff)
        ctx.globalAlpha = alpha
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2)
        glow.addColorStop(0, starColor(s.teff, 0.5))
        glow.addColorStop(1, starColor(s.teff, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        if (hlA[i] > 0.01) {
          ctx.globalAlpha = hlA[i] * orbitDim
          ctx.strokeStyle = '#7cc4ff'
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(x, y, r + 7 + 2 * Math.sin(time * 3), 0, Math.PI * 2)
          ctx.stroke()
        }
        if (labA[i] > 0.01) {
          ctx.globalAlpha = labA[i] * alpha * orbitDim
          ctx.fillStyle = 'rgba(255,255,255,0.85)'
          ctx.font = `500 11px ${font}`
          ctx.textBaseline = 'middle'
          const right = x > w - 100
          ctx.textAlign = right ? 'right' : 'left'
          ctx.fillText(s.name, x + (right ? -(r + 6) : r + 6), y)
        }
      }

      // ---- Betelgeuse in place of the Sun: the planets' orbits
      if (disp.orbit > 0.01) {
        const o = disp.orbit
        const cx = PAD.l + pw / 2
        const cy = PAD.t + ph / 2
        const scale = (Math.min(pw, ph) * 0.47) / 5.203
        const R = 10 ** disp.movLogR * R_SUN_IN_AU
        ctx.font = `11px ${font}`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ORBITS.forEach((orb, j) => {
          const a = clamp01(o * 1.4 - j * 0.08)
          const inside = orb.au < R
          ctx.globalAlpha = a
          ctx.strokeStyle = inside ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.45)'
          ctx.setLineDash(inside ? [3, 4] : [])
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(cx, cy, orb.au * scale, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
          const ang = -0.6 - j * 0.42
          const px = cx + Math.cos(ang) * orb.au * scale
          const py = cy + Math.sin(ang) * orb.au * scale
          ctx.fillStyle = inside ? 'rgba(30,10,0,0.85)' : '#fff'
          ctx.beginPath()
          ctx.arc(px, py, 2.4, 0, Math.PI * 2)
          ctx.fill()
          if (!inside || j === 3) {
            ctx.fillStyle = inside ? 'rgba(40,12,0,0.9)' : 'rgba(255,255,255,0.75)'
            ctx.fillText(orb.name, px + 5, py)
          }
        })
      }

      // ---- size comparison disc (top-left of the plot)
      if (disp.disk > 0.01) {
        const R = 10 ** disp.movLogR
        const bx = PAD.l + 8
        const by = PAD.t + 6
        const bw = 118
        const bh = 74
        ctx.globalAlpha = disp.disk * orbitDim
        ctx.fillStyle = 'rgba(3,4,8,0.78)'
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(bx, by, bw, bh, 14)
        ctx.fill()
        ctx.stroke()
        const maxR = 22
        const sunR = R >= 1 ? maxR / R : maxR
        const starR = R >= 1 ? maxR : maxR * R
        const cy = by + 31
        const disc = (x: number, rad: number, color: string) => {
          if (rad < 1.2) {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, cy, 1.2, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.35)'
            ctx.beginPath()
            ctx.arc(x, cy, 6, 0, Math.PI * 2)
            ctx.stroke()
            return
          }
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x, cy, rad, 0, Math.PI * 2)
          ctx.fill()
        }
        disc(bx + 30, sunR, starColor(5772))
        disc(bx + 86, starR, '#7cc4ff')
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = `10.5px ${font}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('Sol', bx + 30, by + bh - 7)
        ctx.fillText(R >= 1 ? `${fmtR(R).replace(' R☉', '')}× Sol` : `1/${formatNumber(1 / R, 0)} Sol`, bx + 86, by + bh - 7)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    state.current.replay = live.trackReplay ?? 0
  }, [live.trackReplay])

  // ------------------------------------------------------------ interaction
  const tapsSky = si === STEP.imagine && scene >= 1
  const tapsPlot = (si === STEP.observe && scene <= 1 && Boolean(answers.organized)) || si === STEP.conclua
  const sunTask = si === STEP.observe && scene === 2 && !answers.sunFound
  const dragMode = (si === STEP.entenda && scene === 1) || (si === STEP.meca && scene === 0)

  const ripple = useCallback((x: number, y: number, hit: boolean) => {
    const id = performance.now()
    setRipples((r) => [...r.slice(-4), { id, x, y, hit }])
    setTimeout(() => setRipples((r) => r.filter((q) => q.id !== id)), 900)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nearest = () => {
      let best = -1
      let bd = 26
      positions.current.forEach((p, i) => {
        const d = Math.hypot(p.x - x, p.y - y)
        if (d < bd) {
          bd = d
          best = i
        }
      })
      return best
    }
    if (sunTask) {
      const i = NAMED_STARS.findIndex((s) => s.id === 'sol')
      const p = positions.current[i]
      const hit = Math.hypot(p.x - x, p.y - y) < 30
      ripple(x, y, hit)
      if (hit) {
        haptic([12, 50, 12])
        setAnswer('sunFound', true)
      } else haptic(6)
      return
    }
    if (!tapsSky && !tapsPlot) return
    const i = nearest()
    if (i < 0) {
      setLive({ selected: null })
      return
    }
    const id = NAMED_STARS[i].id
    haptic(10)
    ripple(positions.current[i].x, positions.current[i].y, true)
    setLive({ selected: id })
    if (tapsSky) {
      const tapped = Array.isArray(answers.tapped) ? (answers.tapped as string[]) : []
      if (!tapped.includes(id)) setAnswer('tapped', [...tapped, id])
    }
  }

  // Drag up/down on the stage: the radius line follows the finger.
  const dragKey = si === STEP.entenda ? 'radius' : 'measureR'
  const dragR = useRef<number | null>(null)
  const onDrag = (dy: number) => {
    const ph = sizeRef.current.h - PAD.t - PAD.b
    const cur = dragR.current ?? (live[dragKey] as number | undefined) ?? (dragKey === 'radius' ? 1 : 10)
    const dLogL = (-dy / ph) * (Y1 - Y0)
    const next = Math.min(3000, Math.max(0.001, 10 ** (Math.log10(cur) + dLogL / 2)))
    dragR.current = next
    setLive({ [dragKey]: next } as Partial<HrLive>)
  }

  const selected = live.selected && (tapsSky || tapsPlot) ? starById(live.selected) : undefined
  const showSource = gaia && ((si === STEP.observe && scene >= 1) || si === STEP['e-se'] || si === STEP.conclua)
  const picks = (answers.challenges as Record<string, number | undefined> | undefined) ?? {}

  return (
    <Panel>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaFor(stepId, scene, answers)}
          onPointerDown={onPointerDown}
          className={cn('absolute inset-0 h-full w-full', (tapsSky || tapsPlot || sunTask) && 'cursor-pointer')}
          style={{ touchAction: 'manipulation' }}
        />
      </div>

      {dragMode && <DragSurface key={stepId} hint="Arraste para mudar o raio" onDrag={onDrag} onEnd={() => (dragR.current = null)} />}

      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className={cn('pointer-events-none absolute z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2', r.hit ? 'border-sky-300' : 'border-white/30')}
            style={{ left: r.x, top: r.y }}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: r.hit ? 1.7 : 1.1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>

      {/* top-left: star card, formula, Betelgeuse card or the Sun's stage */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[64%]">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={spring.snappy}
              className="rounded-[18px] border border-white/[0.08] bg-black/60 px-3 py-2 backdrop-blur-xl"
            >
              <p className="flex items-center gap-2 text-[14px] font-medium text-white">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: starColor(selected.teff), boxShadow: `0 0 8px ${starColor(selected.teff)}` }} />
                <span className="truncate">{selected.name}</span>
                <span className="text-[11px] font-normal text-white/45">{GROUP_LABEL[selected.group]}</span>
              </p>
              <p className="mt-0.5 font-mono text-[12px] tabular-nums text-white/75">
                {fmtT(selected.teff)} · {fmtL(selected.lum)}
              </p>
              <p className="text-[11px] text-white/45">cor {colorName(selected.teff)} · valores aproximados</p>
            </motion.div>
          ) : si === STEP.entenda ? (
            <motion.p key="formula" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-full bg-black/55 px-3 py-1.5 font-mono text-[12.5px] text-white/90 backdrop-blur-xl">
              L/L☉ = (R/R☉)² · (T/T☉)⁴
            </motion.p>
          ) : si === STEP['e-se'] && scene === 0 && picks.sol !== undefined && trackLabel ? (
            <motion.p key={trackLabel} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={spring.snappy} className="rounded-full bg-amber-400/15 px-3 py-1.5 text-[12.5px] text-amber-100 backdrop-blur-xl">
              {trackLabel}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {si === STEP['e-se'] && scene === 0 && picks.sol !== undefined && (
        <button
          onClick={() => {
            haptic(6)
            setLive({ trackReplay: (live.trackReplay ?? 0) + 1 })
          }}
          className="focus-ring absolute bottom-11 right-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-[12.5px] text-white/75 backdrop-blur-xl"
          aria-label="Ver o caminho do Sol de novo"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Ver de novo
        </button>
      )}

      <AnimatePresence>
        {showSource && gaia && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring.snappy} className="absolute right-3 top-3 z-10">
            {gaia.source === 'gaia' ? (
              <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] text-white/80 backdrop-blur-xl">Gaia DR3 · {formatNumber(gaia.stars.length, 0)} estrelas</span>
            ) : (
              <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11.5px] text-amber-100 backdrop-blur-xl" title="População simulada: o arquivo do Gaia não respondeu">
                Simulado · {formatNumber(gaia.stars.length, 0)} estrelas
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tapsSky && !(Array.isArray(answers.tapped) && answers.tapped.length) && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
            <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur-xl">Toque numa estrela</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}
