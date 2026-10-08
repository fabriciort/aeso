'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CANNON_ALTITUDE,
  classify,
  elements,
  flight,
  keplerPosition,
  launchState,
  PLANETS,
  R_EARTH,
  sweptArea,
  TRAJECTORY_LABEL,
  verletStep,
  visViva,
  type Body,
  type Elements,
  type Trajectory,
} from '@/lib/astro/orbits'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Panel, type StageProps } from '../runtime'
import {
  CHALLENGE_IDS,
  DEFAULT_SLOPE,
  DEFAULT_V,
  KEPLER_E,
  SLICE_FRACTION,
  SLICES_GOAL,
  SLOPE_TOLERANCE,
  V_MAX,
  type Challenges,
  type OrbitLive,
} from './shared'

// The continuous Palco of "Coloque um planeta em órbita".
//
// One scene graph that never cuts: Newton's mountain and cannon sit on a big
// Earth; the camera follows each shot and zooms out to the whole orbit; the
// Earth shrinks and becomes a star with an eccentric planet (equal areas);
// the real planets appear around it; then they fly into a T × a chart that
// morphs into T² × a³. Every frame eases the displayed state toward the
// target of the current Etapa/Cena.
//
// Physics near the Earth: Newton's gravity integrated with velocity Verlet in
// dimensionless units (R = 1, GM = 1). Only the drawing exaggerates altitude
// (the first tens of km are stretched), so the mountain and the orbits read
// on a phone; angles and the shape of the motion are untouched.

type Mode = 'cannon' | 'orbit' | 'kepler' | 'solar' | 'graph' | 'iss' | 'sunEarth' | 'final'
type Interaction = 'shoot' | 'mark' | 'slope' | null

function modeOf(stepId: string, scene: number): Mode {
  switch (stepId) {
    case 'imagine':
      return 'cannon'
    case 'preveja':
      return scene === 0 ? 'cannon' : 'orbit'
    case 'entenda':
      return 'orbit'
    case 'observe':
      return 'kepler'
    case 'meca':
      return scene === 0 ? 'solar' : 'graph'
    case 'e-se':
      return (['solar', 'iss', 'sunEarth'] as const)[Math.min(scene, 2)]
    default:
      return 'final'
  }
}

function interactionOf(stepId: string, scene: number): Interaction {
  if (stepId === 'imagine' && scene >= 1) return 'shoot'
  if (stepId === 'entenda') return 'shoot'
  if (stepId === 'observe' && scene >= 1) return 'mark'
  if (stepId === 'meca' && scene === 2) return 'slope'
  return null
}

// ------------------------------------------------------------ drawing scales

/** Altitude exaggeration: the first ~30 km are stretched, higher is shifted. */
const EX_A = 0.16
const EX_S = 0.005
const lift = (u: number) => (u <= 0 ? u : u + EX_A * (1 - Math.exp(-u / EX_S)))
const dispR = (r: number) => 1 + lift(r - 1)

const H0 = CANNON_ALTITUDE / R_EARTH
const MOUNT_DPHI = 0.09
const MOUNT_PEAK = H0 * 0.94
function mountAlt(phi: number) {
  const f = 1 - Math.abs(phi) / MOUNT_DPHI
  return f <= 0 ? 0 : MOUNT_PEAK * f ** 1.6
}
const wrap = (a: number) => {
  let x = a
  while (x > Math.PI) x -= 2 * Math.PI
  while (x < -Math.PI) x += 2 * Math.PI
  return x
}

/** Kepler world: 1 UA of the imaginary planet = KA world units. */
const KA = 1.6
const KEP_PERIOD_S = 10
/** Solar system: real years per second of animation. */
const YEAR_S = 5
const SUN_EARTH_SCALE = 1.5
const ISS_R = 1 + 400e3 / R_EARTH

const PLANET_LOOK = [
  { color: '#bdb6ae', px: 3 },
  { color: '#ecc98a', px: 4.2 },
  { color: '#5eb0ff', px: 4.4 },
  { color: '#e2724a', px: 3.5 },
  { color: '#d9a66b', px: 8 },
  { color: '#e8d29a', px: 7 },
]
const ACCENT = '#46d9c6'
const AMBER = '#f6b74e'

// ------------------------------------------------------------ state

interface View {
  cx: number
  cy: number
  hw: number
  hh: number
  bodyR: number
  starMix: number
  bodyA: number
  mountainA: number
  ballsA: number
  keplerA: number
  radiusA: number
  solarA: number
  hypoA: number
  morph: number
  lineA: number
  issA: number
  sunEarthA: number
  ghostA: number
  aimA: number
  duck: number
  k: number
}

interface TrailPt {
  x: number
  y: number
  t: number
}

interface Ball {
  s: Body
  v: number
  type: Trajectory
  el: Elements
  warp: number
  trail: TrailPt[]
  lap: number
  prevTh: number
  landed: boolean
  retired: number | null
  circle: boolean
  ellipse: boolean
  escape: boolean
}

interface Slice {
  M0: number
  M1: number
  cur: number
  color: string
  area: number | null
}

interface Sim {
  balls: Ball[]
  puffs: { x: number; y: number; t: number }[]
  kep: { M: number; slices: Slice[]; pending: number[]; done: number }
  planets: number[]
  hypo: number
  iss: number
  se: { b: Body; boosted: boolean; trail: TrailPt[] }
  view: View
  graphP: number
  time: number
  stars: { x: number; y: number; r: number; p: number }[]
}

const circularEarth = (angle: number): Body => {
  const v = 2 * Math.PI
  return { x: Math.cos(angle), y: Math.sin(angle), vx: v * Math.sin(angle), vy: -v * Math.cos(angle) }
}

function makeSim(): Sim {
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return {
    balls: [],
    puffs: [],
    kep: { M: -1.3, slices: [], pending: [], done: 0 },
    planets: PLANETS.map((_, i) => 0.6 + i * 1.7),
    hypo: 2.4,
    iss: Math.PI / 2 + 0.6,
    se: { b: circularEarth(Math.PI * 0.6), boosted: false, trail: [] },
    view: {
      cx: 0.1,
      cy: 0.98,
      hw: 0.3,
      hh: 0.24,
      bodyR: 1,
      starMix: 0,
      bodyA: 1,
      mountainA: 1,
      ballsA: 1,
      keplerA: 0,
      radiusA: 0,
      solarA: 0,
      hypoA: 0,
      morph: 0,
      lineA: 0,
      issA: 0,
      sunEarthA: 0,
      ghostA: 0,
      aimA: 0,
      duck: 0,
      k: DEFAULT_SLOPE,
    },
    graphP: 0,
    time: 0,
    stars: Array.from({ length: 150 }, () => ({ x: rnd(), y: rnd(), r: 0.3 + rnd() * 1.1, p: rnd() * 6.28 })),
  }
}

function launch(sim: Sim, v: number, now: number): Ball {
  for (const b of sim.balls) if (b.retired === null) b.retired = now
  const s = launchState(v)
  const el = elements(s)
  const type = classify(v)
  const warp = type === 'cai' ? Math.min(1.5, Math.max(0.05, flight(v, 30).time / 2)) : type === 'escapa' ? 2.2 : el.period / 6
  const ball: Ball = { s, v, type, el, warp, trail: [{ x: s.x, y: s.y, t: now }], lap: 0, prevTh: Math.PI / 2, landed: false, retired: null, circle: false, ellipse: false, escape: false }
  sim.balls.push(ball)
  if (sim.balls.length > 5) sim.balls.shift()
  return ball
}

// ------------------------------------------------------------ geometry

interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}
const box = (x0: number, x1: number, y0: number, y1: number): Box => ({ x0, x1, y0, y1 })
const sq = (h: number) => box(-h, h, -h, h)
function union(a: Box, b: Box): Box {
  return { x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) }
}
function cap(b: Box, h: number): Box {
  return { x0: Math.max(b.x0, -h), x1: Math.min(b.x1, h), y0: Math.max(b.y0, -h), y1: Math.min(b.y1, h) }
}

/** Display-space bounding box of a ball: its trail, plus its whole orbit when bound. */
function ballBox(b: Ball): Box | null {
  let out: Box | null = null
  for (const p of b.trail) {
    const r = Math.hypot(p.x, p.y)
    const d = dispR(r) / r
    const x = p.x * d
    const y = p.y * d
    out = out ? union(out, box(x, x, y, y)) : box(x, x, y, y)
  }
  if (b.el.bound && b.el.rp >= 1) {
    const bb = b.el.a * Math.sqrt(1 - b.el.e ** 2)
    out = union(out ?? sq(1), box(-dispR(bb), dispR(bb), -dispR(b.el.ra), dispR(b.el.rp)))
  }
  return out
}

interface Plot {
  L: number
  R: number
  T: number
  B: number
  ix: number
  iy: number
  iw: number
  ih: number
}
function plotRect(W: number, H: number): Plot {
  const L = 50
  const R = W - 18
  const T = 46
  const B = H - 40
  const iw = Math.min(150, (R - L) * 0.42)
  const ih = Math.min(128, (B - T) * 0.42)
  return { L, R, T, B, ix: L + 10, iy: T + 6, iw, ih }
}
const A_MAX = { x: 10.5, y: 32 }
const B_MAX = 1000
const INSET_MAX = 4
function graphPos(pl: Plot, a: number, T: number, morph: number) {
  const ax = pl.L + (a / A_MAX.x) * (pl.R - pl.L)
  const ay = pl.B - (T / A_MAX.y) * (pl.B - pl.T)
  const bx = pl.L + (a ** 3 / B_MAX) * (pl.R - pl.L)
  const by = pl.B - (T ** 2 / B_MAX) * (pl.B - pl.T)
  return { x: ax + (bx - ax) * morph, y: ay + (by - ay) * morph }
}
function insetPos(pl: Plot, X: number, Y: number) {
  return { x: pl.ix + 18 + (X / INSET_MAX) * (pl.iw - 26), y: pl.iy + pl.ih - 16 - (Y / INSET_MAX) * (pl.ih - 26) }
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexRgb(hex)
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`
}

// ------------------------------------------------------------ component

interface Shot {
  id: number
  v: number
  type: Trajectory
}

export default function OrbitStage({ lab, stepId, scene, answers, setAnswer, live, setLive }: StageProps) {
  const L = live as Partial<OrbitLive>
  const v = typeof L.v === 'number' ? L.v : DEFAULT_V
  const slope = typeof L.slope === 'number' ? L.slope : DEFAULT_SLOPE
  const mode = modeOf(stepId, scene)
  const interaction = interactionOf(stepId, scene)
  const challenges = (answers.challenges as Challenges | undefined) ?? {}
  const eseAnswered = stepId === 'e-se' && challenges[CHALLENGE_IDS[Math.min(scene, 2)]] !== undefined

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speedRef = useRef<HTMLSpanElement>(null)
  const simRef = useRef<Sim | null>(null)
  if (!simRef.current) simRef.current = makeSim()
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [shot, setShot] = useState<Shot | null>(null)
  const [celebrate, setCelebrate] = useState(0)
  const [usedFor, setUsedFor] = useState<Record<string, boolean>>({})
  const used = interaction ? Boolean(usedFor[interaction]) : true
  const setUsed = (u: boolean) => interaction && u && !usedFor[interaction] && setUsedFor((m) => ({ ...m, [interaction]: true }))
  const [allEqual, setAllEqual] = useState(false)

  const pr = useRef({ stepId, scene, mode, interaction, answers, setAnswer, setLive, v, slope, eseAnswered })
  pr.current = { stepId, scene, mode, interaction, answers, setAnswer, setLive, v, slope, eseAnswered }

  const fire = (speed: number) => {
    const sim = simRef.current!
    const b = launch(sim, speed, sim.time)
    setShot({ id: Date.now(), v: speed, type: b.type })
    haptic(12)
    const p = pr.current
    if (p.stepId === 'imagine') {
      if (speed < 4 && !p.answers.triedSlow) p.setAnswer('triedSlow', true)
      if (speed > 6 && !p.answers.triedFast) p.setAnswer('triedFast', true)
    }
  }
  const fireRef = useRef(fire)
  fireRef.current = fire

  const mark = () => {
    const k = simRef.current!.kep
    if (k.slices.some((s) => s.area === null)) return haptic(4)
    const color = k.slices.length % 2 === 0 ? ACCENT : AMBER
    k.slices.push({ M0: k.M, M1: k.M + 2 * Math.PI * SLICE_FRACTION, cur: k.M, color, area: null })
    if (k.slices.length > 6) k.slices.shift()
    haptic(8)
  }
  const markRef = useRef(mark)
  markRef.current = mark

  // Shots, marks and the "Me mostre" of the slices come from the Etapas as counters.
  const lastFire = useRef(L.fire)
  useEffect(() => {
    if (L.fire !== undefined && L.fire !== lastFire.current) fireRef.current(v)
    lastFire.current = L.fire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.fire])
  const lastMark = useRef(L.mark)
  useEffect(() => {
    if (L.mark !== undefined && L.mark !== lastMark.current) markRef.current()
    lastMark.current = L.mark
  }, [L.mark])
  const lastAuto = useRef(L.autoMark)
  useEffect(() => {
    if (L.autoMark !== undefined && L.autoMark !== lastAuto.current) {
      const k = simRef.current!.kep
      const dM = 2 * Math.PI * SLICE_FRACTION
      const starts = [-dM / 2, Math.PI / 2 - dM / 2, Math.PI - dM / 2]
      const from = k.M + 0.05
      k.pending = starts.map((s) => from + ((((s - from) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))).sort((a, b) => a - b)
    }
    lastAuto.current = L.autoMark
  }, [L.autoMark])

  // Preveja, cena 2: the stage fires at 7,9 km/s by itself.
  useEffect(() => {
    if (stepId !== 'preveja' || scene !== 1) return
    const t = setTimeout(() => fireRef.current(7.9), 500)
    return () => clearTimeout(t)
  }, [stepId, scene])

  useEffect(() => {
    if (stepId !== 'observe') setAllEqual(false)
  }, [stepId])

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
    const W = size.w
    const H = size.h
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sim = simRef.current!
    let raf = 0
    let last = performance.now()
    let speedShown = -1

    const step = (dt: number) => {
      const p = pr.current
      sim.time += dt
      const now = sim.time

      // --- cannon balls
      for (const b of sim.balls) {
        if (b.landed || Math.hypot(b.s.x, b.s.y) > 60) continue
        const simDt = dt * b.warp
        const n = Math.max(1, Math.ceil(simDt / 0.0015))
        const h = simDt / n
        for (let i = 0; i < n; i++) {
          b.s = verletStep(b.s, h)
          const r = Math.hypot(b.s.x, b.s.y)
          const th = Math.atan2(b.s.y, b.s.x)
          b.lap += Math.abs(wrap(th - b.prevTh))
          b.prevTh = th
          if (r - 1 <= mountAlt(wrap(th - Math.PI / 2))) {
            const ground = 1 + mountAlt(wrap(th - Math.PI / 2))
            b.s = { x: Math.cos(th) * ground, y: Math.sin(th) * ground, vx: 0, vy: 0 }
            b.landed = true
            sim.puffs.push({ x: b.s.x, y: b.s.y, t: now })
            if (b.retired === null) haptic(6)
            break
          }
          if (i % 3 === 2 || i === n - 1) b.trail.push({ x: b.s.x, y: b.s.y, t: now })
        }
        if (b.trail.length > 2400) b.trail.splice(0, b.trail.length - 2400)

        if (b.retired === null && p.stepId === 'entenda') {
          const r = Math.hypot(b.s.x, b.s.y)
          if (!b.circle && b.type === 'circulo' && b.lap >= 2 * Math.PI - 0.05) {
            b.circle = true
            if (typeof p.answers.circV !== 'number') {
              p.setAnswer('circV', b.v)
              haptic([10, 40, 10])
              setCelebrate((c) => c + 1)
            }
          }
          if (!b.ellipse && b.type === 'elipse' && b.lap >= Math.PI) {
            b.ellipse = true
            if (!p.answers.madeEllipse) {
              p.setAnswer('madeEllipse', true)
              haptic([10, 40, 10])
            }
          }
          if (!b.escape && b.type === 'escapa' && r > 3) {
            b.escape = true
            if (!p.answers.madeEscape) {
              p.setAnswer('madeEscape', true)
              haptic([10, 40, 10])
            }
          }
        }
      }
      sim.balls = sim.balls.filter((b) => b.retired === null || now - b.retired < 2.5)
      sim.puffs = sim.puffs.filter((f) => now - f.t < 0.9)

      // --- Kepler planet and equal-area slices
      const k = sim.kep
      k.M += (dt * 2 * Math.PI) / KEP_PERIOD_S
      if (k.pending.length && k.M >= k.pending[0] && !k.slices.some((s) => s.area === null)) {
        k.pending.shift()
        markRef.current()
      }
      for (const s of k.slices) {
        if (s.area !== null) continue
        s.cur = Math.min(k.M, s.M1)
        if (s.cur >= s.M1) {
          s.area = sweptArea(1, KEPLER_E, s.M0, s.M1)
          if (p.stepId === 'observe') {
            k.done += 1
            const prev = typeof p.answers.slices === 'number' ? (p.answers.slices as number) : 0
            if (k.done > prev) p.setAnswer('slices', Math.min(k.done, SLICES_GOAL))
            if (k.done >= SLICES_GOAL && prev < SLICES_GOAL) {
              haptic([10, 40, 10])
              setCelebrate((c) => c + 1)
              setAllEqual(true)
            } else haptic(10)
          }
        }
      }

      // --- planets, ISS, Earth around the Sun
      sim.planets = sim.planets.map((th, i) => th + (dt * 2 * Math.PI) / (PLANETS[i].T * YEAR_S))
      sim.hypo += (dt * 2 * Math.PI) / (8 * YEAR_S)
      sim.iss -= (dt * 2 * Math.PI) / 8
      const se = sim.se
      const wantBoost = p.mode === 'sunEarth' && p.eseAnswered
      if (wantBoost && !se.boosted) {
        se.boosted = true
        se.b = { ...se.b, vx: se.b.vx * Math.SQRT2 * 1.002, vy: se.b.vy * Math.SQRT2 * 1.002 }
        se.trail = []
      } else if (!wantBoost && se.boosted) {
        se.boosted = false
        se.b = circularEarth(Math.atan2(se.b.y, se.b.x))
        se.trail = []
      }
      if (Math.hypot(se.b.x, se.b.y) < 14) {
        const yr = dt / YEAR_S
        const n = Math.max(1, Math.ceil(yr / 0.002))
        for (let i = 0; i < n; i++) se.b = verletStep(se.b, yr / n, 4 * Math.PI * Math.PI)
        if (se.boosted) se.trail.push({ x: se.b.x, y: se.b.y, t: now })
      }
    }

    const targets = (): { view: View; cam: Box } => {
      const p = pr.current
      const base: View = {
        ...sim.view,
        bodyR: 1,
        starMix: 0,
        bodyA: 1,
        mountainA: 0,
        ballsA: 0,
        keplerA: 0,
        radiusA: 0,
        solarA: 0,
        hypoA: 0,
        morph: 0,
        lineA: 0,
        issA: 0,
        sunEarthA: 0,
        ghostA: 0,
        aimA: p.interaction === 'shoot' ? 1 : 0,
        duck: 0,
        k: p.slope,
      }
      let cam = sq(1.2)
      const active = sim.balls.find((b) => b.retired === null)
      switch (p.mode) {
        case 'cannon':
        case 'orbit': {
          base.mountainA = 1
          base.ballsA = 1
          base.ghostA = p.stepId === 'imagine' && p.scene === 2 ? 1 : 0
          cam = p.mode === 'cannon' ? box(-0.17, 0.36, 0.84, 1.15) : sq(1.2)
          const bb = active ? ballBox(active) : null
          if (bb) cam = cap(union(cam, bb), 12)
          // The cannon ducks when a ball comes back around.
          for (const b of sim.balls) {
            if (b.landed || !b.el.bound || b.lap < Math.PI) continue
            const d = wrap(b.prevTh - Math.PI / 2)
            if (d > -0.12 && d < 0.5) base.duck = 1
          }
          break
        }
        case 'kepler':
          base.bodyR = 0.2
          base.starMix = 1
          base.keplerA = 1
          base.radiusA = p.scene >= 1 ? 1 : 0
          cam = box(-2.75, 0.95, -1.45, 1.45)
          break
        case 'solar':
        case 'final':
          base.bodyR = 0.16
          base.starMix = 1
          base.solarA = 1
          base.hypoA = p.mode === 'final' || p.stepId === 'e-se' ? 1 : 0
          cam = sq(3.35)
          break
        case 'graph':
          base.bodyR = 0.16
          base.starMix = 1
          base.bodyA = 0
          base.solarA = 1
          base.morph = p.scene >= 2 ? 1 : 0
          base.lineA = p.scene >= 2 ? 1 : 0
          cam = sq(3.35)
          break
        case 'iss':
          base.issA = 1
          cam = sq(1.42)
          break
        case 'sunEarth': {
          base.bodyR = 0.2
          base.starMix = 1
          base.sunEarthA = 1
          cam = sq(2.05)
          if (sim.se.boosted) {
            const x = sim.se.b.x * SUN_EARTH_SCALE
            const y = sim.se.b.y * SUN_EARTH_SCALE
            cam = cap(union(cam, box(x - 0.6, x + 0.6, y - 0.6, y + 0.6)), 9)
          }
          break
        }
      }
      return { view: base, cam }
    }

    const toScreen = (x: number, y: number, S: number) => ({ x: W / 2 + (x - sim.view.cx) * S, y: H / 2 - (y - sim.view.cy) * S })

    const draw = () => {
      const V = sim.view
      const p = pr.current
      const S = Math.min(W / (2 * V.hw), H / (2 * V.hh))
      const sc = (x: number, y: number) => toScreen(x, y, S)
      const gE = smooth(sim.graphP)
      ctx.clearRect(0, 0, W, H)

      // Sky.
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#04050b')
      sky.addColorStop(1, '#070914')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)
      for (const s of sim.stars) {
        const tw = reduced ? 0.7 : 0.55 + 0.45 * Math.sin(sim.time * 1.3 + s.p)
        const x = (((s.x * W - V.cx * 6) % W) + W) % W
        const y = (((s.y * H + V.cy * 6) % H) + H) % H
        ctx.fillStyle = `rgba(255,255,255,${0.5 * tw * (1 - 0.6 * gE)})`
        ctx.fillRect(x, y, s.r, s.r)
      }

      const C = sc(0, 0)
      const bodyPx = V.bodyR * S

      // Solar system orbits (under everything).
      const planetsA = Math.max(V.solarA, gE)
      if (V.solarA > 0.01) {
        ctx.lineWidth = 1
        PLANETS.forEach((pl) => {
          ctx.strokeStyle = `rgba(255,255,255,${0.1 * V.solarA * (1 - gE)})`
          ctx.beginPath()
          ctx.arc(C.x, C.y, Math.sqrt(pl.a) * S, 0, Math.PI * 2)
          ctx.stroke()
        })
        if (V.hypoA > 0.01) {
          ctx.setLineDash([4, 5])
          ctx.strokeStyle = rgba(ACCENT, 0.45 * V.hypoA * (1 - gE))
          ctx.beginPath()
          ctx.arc(C.x, C.y, 2 * S, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Kepler ellipse, slices, radius line.
      if (V.keplerA > 0.01) {
        const ka = V.keplerA
        ctx.strokeStyle = `rgba(255,255,255,${0.18 * ka})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let i = 0; i <= 160; i++) {
          const q = keplerPosition(KA, KEPLER_E, (i / 160) * Math.PI * 2)
          const s = sc(q.x, q.y)
          if (i === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        }
        ctx.stroke()
        for (const s of sim.kep.slices) {
          const span = s.cur - s.M0
          if (span <= 0) continue
          const n = Math.max(2, Math.ceil(span / 0.015))
          ctx.beginPath()
          ctx.moveTo(C.x, C.y)
          for (let i = 0; i <= n; i++) {
            const q = keplerPosition(KA, KEPLER_E, s.M0 + (span * i) / n)
            const pt = sc(q.x, q.y)
            ctx.lineTo(pt.x, pt.y)
          }
          ctx.closePath()
          ctx.fillStyle = rgba(s.color, 0.32 * ka)
          ctx.fill()
          ctx.strokeStyle = rgba(s.color, 0.8 * ka)
          ctx.lineWidth = 1
          ctx.stroke()
          if (s.area !== null) {
            const mid = keplerPosition(KA, KEPLER_E, (s.M0 + s.M1) / 2)
            const f = mid.r > 1.6 ? 0.55 : 0.68
            const pt = sc(mid.x * f, mid.y * f)
            ctx.font = '600 11.5px ui-monospace, SFMono-Regular, Menlo, monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = `rgba(0,0,0,${0.55 * ka})`
            const label = `${formatNumber(s.area, 2)} UA²`
            const w = ctx.measureText(label).width + 10
            ctx.fillRect(pt.x - w / 2, pt.y - 9, w, 18)
            ctx.fillStyle = `rgba(255,255,255,${ka})`
            ctx.fillText(label, pt.x, pt.y)
          }
        }
      }

      // Central body: Earth ↔ star.
      if (V.bodyA > 0.01 && bodyPx > 0.5) {
        const a = V.bodyA
        if (V.starMix > 0.01) {
          const glow = ctx.createRadialGradient(C.x, C.y, bodyPx * 0.6, C.x, C.y, bodyPx * 3.2)
          glow.addColorStop(0, `rgba(255,200,110,${0.35 * V.starMix * a})`)
          glow.addColorStop(1, 'rgba(255,200,110,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(C.x, C.y, bodyPx * 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
        // Atmosphere (thin: the mountain peak pokes above it).
        if (V.starMix < 0.99) {
          const atm = bodyPx * (1 + lift(0.0016))
          const g = ctx.createRadialGradient(C.x, C.y, bodyPx * 0.98, C.x, C.y, atm)
          g.addColorStop(0, `rgba(120,180,255,${0.45 * (1 - V.starMix) * a})`)
          g.addColorStop(1, 'rgba(120,180,255,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(C.x, C.y, atm, 0, Math.PI * 2)
          ctx.fill()
          const e = ctx.createRadialGradient(C.x - bodyPx * 0.35, C.y - bodyPx * 0.45, bodyPx * 0.1, C.x, C.y, bodyPx)
          e.addColorStop(0, '#3f86e6')
          e.addColorStop(0.6, '#1d4f9e')
          e.addColorStop(1, '#0a1f45')
          ctx.globalAlpha = (1 - V.starMix) * a
          ctx.fillStyle = e
          ctx.beginPath()
          ctx.arc(C.x, C.y, bodyPx, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
        if (V.starMix > 0.01) {
          const s = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, bodyPx)
          s.addColorStop(0, '#fff7e0')
          s.addColorStop(0.7, '#ffd27a')
          s.addColorStop(1, '#e88a2c')
          ctx.globalAlpha = V.starMix * a
          ctx.fillStyle = s
          ctx.beginPath()
          ctx.arc(C.x, C.y, bodyPx, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      const bodyDisp = (x: number, y: number) => {
        const r = Math.hypot(x, y)
        const d = r > 0 ? (dispR(r) / r) * V.bodyR : 0
        return sc(x * d, y * d)
      }

      // Mountain and cannon.
      if (V.mountainA > 0.01) {
        const a = V.mountainA
        ctx.beginPath()
        for (let i = 0; i <= 40; i++) {
          const phi = -MOUNT_DPHI * 1.05 + (2.1 * MOUNT_DPHI * i) / 40
          const r = 1 + mountAlt(phi) - 0.002
          const th = Math.PI / 2 + phi
          const s = bodyDisp(Math.cos(th) * r, Math.sin(th) * r)
          if (i === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        }
        ctx.closePath()
        const top = bodyDisp(0, 1 + MOUNT_PEAK)
        const g = ctx.createLinearGradient(0, top.y, 0, top.y + 0.12 * S)
        g.addColorStop(0, `rgba(96,104,124,${a})`)
        g.addColorStop(1, `rgba(28,32,44,${a})`)
        ctx.fillStyle = g
        ctx.fill()
        // Snow cap.
        ctx.beginPath()
        for (let i = 0; i <= 16; i++) {
          const phi = -0.018 + (0.036 * i) / 16
          const r = 1 + mountAlt(phi)
          const s = bodyDisp(Math.cos(Math.PI / 2 + phi) * r, Math.sin(Math.PI / 2 + phi) * r)
          if (i === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        }
        ctx.closePath()
        ctx.fillStyle = `rgba(235,240,250,${0.85 * a})`
        ctx.fill()

        const muzzle = bodyDisp(0, 1 + H0)
        const size = Math.min(16, Math.max(5, 0.016 * S * V.bodyR))
        ctx.save()
        ctx.translate(muzzle.x, muzzle.y + V.duck * size * 1.1)
        ctx.rotate(V.duck * 0.5)
        ctx.globalAlpha = a
        ctx.fillStyle = '#d6dbe6'
        ctx.beginPath()
        ctx.roundRect(-size * 0.5, -size * 0.32, size * 1.5, size * 0.64, size * 0.2)
        ctx.fill()
        ctx.fillStyle = '#7d8597'
        ctx.beginPath()
        ctx.arc(-size * 0.25, size * 0.35, size * 0.38, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Aim arrow: length grows with the chosen speed.
        if (V.aimA > 0.01) {
          const len = 14 + (p.v / V_MAX) * 70
          const x0 = muzzle.x + size * 1.2
          ctx.strokeStyle = rgba(ACCENT, 0.85 * V.aimA * a)
          ctx.fillStyle = rgba(ACCENT, 0.85 * V.aimA * a)
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x0, muzzle.y)
          ctx.lineTo(x0 + len, muzzle.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x0 + len + 6, muzzle.y)
          ctx.lineTo(x0 + len - 1, muzzle.y - 4.5)
          ctx.lineTo(x0 + len - 1, muzzle.y + 4.5)
          ctx.fill()
        }

        // "E se o chão fugisse?": a dashed path at the cannon's height.
        if (V.ghostA > 0.01) {
          ctx.setLineDash([5, 6])
          ctx.strokeStyle = rgba(ACCENT, 0.55 * V.ghostA * a)
          ctx.lineWidth = 1.4
          ctx.beginPath()
          const rr = dispR(1 + H0) * V.bodyR * S
          ctx.arc(C.x, C.y, rr, -Math.PI / 2, -Math.PI / 2 + 1.1)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Balls and their fading trails.
      if (V.ballsA > 0.01) {
        for (const b of sim.balls) {
          const ra = V.ballsA * (b.retired === null ? 1 : Math.max(0, 1 - (sim.time - b.retired) / 2.5))
          if (ra <= 0.01) continue
          const tr = b.trail
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          for (let i = 1; i < tr.length; i += 6) {
            const age = sim.time - tr[i].t
            const al = Math.max(0, 1 - age / 7) * ra
            if (al <= 0.01) continue
            ctx.strokeStyle = rgba(ACCENT, 0.85 * al)
            ctx.beginPath()
            const s0 = bodyDisp(tr[i - 1].x, tr[i - 1].y)
            ctx.moveTo(s0.x, s0.y)
            for (let j = i; j < Math.min(tr.length, i + 7); j++) {
              const s = bodyDisp(tr[j].x, tr[j].y)
              ctx.lineTo(s.x, s.y)
            }
            ctx.stroke()
          }
          const s = bodyDisp(b.s.x, b.s.y)
          ctx.fillStyle = `rgba(255,255,255,${ra})`
          ctx.shadowColor = ACCENT
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(s.x, s.y, 3.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        for (const f of sim.puffs) {
          const t = (sim.time - f.t) / 0.9
          const s = bodyDisp(f.x, f.y)
          ctx.strokeStyle = `rgba(255,220,180,${(1 - t) * 0.8 * V.ballsA})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(s.x, s.y, 3 + t * 14, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Kepler planet with its velocity arrow.
      if (V.keplerA > 0.01) {
        const ka = V.keplerA
        const q = keplerPosition(KA, KEPLER_E, sim.kep.M)
        const q2 = keplerPosition(KA, KEPLER_E, sim.kep.M + 0.001)
        const dx = q2.x - q.x
        const dy = q2.y - q.y
        const dl = Math.hypot(dx, dy) || 1
        const vk = visViva(1, 1, q.r / KA) * 29.78
        const s = sc(q.x, q.y)
        if (V.radiusA > 0.01) {
          ctx.strokeStyle = `rgba(255,255,255,${0.35 * V.radiusA * ka})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(C.x, C.y)
          ctx.lineTo(s.x, s.y)
          ctx.stroke()
        }
        const len = 0.012 * vk * S * 0.7
        const ex = s.x + (dx / dl) * len
        const ey = s.y - (dy / dl) * len
        ctx.strokeStyle = rgba(AMBER, 0.95 * ka)
        ctx.fillStyle = rgba(AMBER, 0.95 * ka)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        const ang = Math.atan2(ey - s.y, ex - s.x)
        ctx.beginPath()
        ctx.moveTo(ex + Math.cos(ang) * 6, ey + Math.sin(ang) * 6)
        ctx.lineTo(ex + Math.cos(ang + 2.4) * 6, ey + Math.sin(ang + 2.4) * 6)
        ctx.lineTo(ex + Math.cos(ang - 2.4) * 6, ey + Math.sin(ang - 2.4) * 6)
        ctx.fill()
        ctx.fillStyle = `rgba(160,215,255,${ka})`
        ctx.shadowColor = '#9ad1ff'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(s.x, s.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (speedRef.current && Math.abs(vk - speedShown) > 0.4) {
          speedShown = vk
          speedRef.current.textContent = `${formatNumber(vk, 0)} km/s`
        }
      }

      // ISS: a station in free fall, with the astronaut falling alongside.
      if (V.issA > 0.01) {
        const ia = V.issA
        const rr = dispR(ISS_R) * V.bodyR * S
        ctx.setLineDash([3, 5])
        ctx.strokeStyle = `rgba(255,255,255,${0.25 * ia})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(C.x, C.y, rr, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        const x = C.x + Math.cos(sim.iss) * rr
        const y = C.y - Math.sin(sim.iss) * rr
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-sim.iss + Math.PI / 2)
        ctx.globalAlpha = ia
        ctx.fillStyle = '#e6eaf2'
        ctx.fillRect(-3, -3, 6, 6)
        ctx.fillStyle = '#5b8bd6'
        ctx.fillRect(-15, -2.5, 10, 5)
        ctx.fillRect(5, -2.5, 10, 5)
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(0, -9, 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        if (p.eseAnswered) {
          const ux = (C.x - x) / rr
          const uy = (C.y - y) / rr
          ctx.strokeStyle = rgba(AMBER, ia)
          ctx.fillStyle = rgba(AMBER, ia)
          ctx.lineWidth = 2
          const L0 = 12
          const L1 = 40
          ctx.beginPath()
          ctx.moveTo(x + ux * L0, y + uy * L0)
          ctx.lineTo(x + ux * L1, y + uy * L1)
          ctx.stroke()
          const hx = x + ux * (L1 + 6)
          const hy = y + uy * (L1 + 6)
          ctx.beginPath()
          ctx.moveTo(hx, hy)
          ctx.lineTo(hx - ux * 7 - uy * 4.5, hy - uy * 7 + ux * 4.5)
          ctx.lineTo(hx - ux * 7 + uy * 4.5, hy - uy * 7 - ux * 4.5)
          ctx.fill()
          ctx.font = '600 11.5px ui-monospace, SFMono-Regular, Menlo, monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('g ≈ 89 %', x + ux * (L1 + 20) + uy * 30, y + uy * (L1 + 20) - ux * 30)
        }
      }

      // Earth around the Sun (E se…? c).
      if (V.sunEarthA > 0.01) {
        const ea = V.sunEarthA
        ctx.strokeStyle = `rgba(255,255,255,${0.14 * ea})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(C.x, C.y, SUN_EARTH_SCALE * S, 0, Math.PI * 2)
        ctx.stroke()
        const tr = sim.se.trail
        if (tr.length > 1) {
          ctx.strokeStyle = rgba('#5eb0ff', 0.7 * ea)
          ctx.lineWidth = 2
          ctx.beginPath()
          tr.forEach((pt, i) => {
            const s = sc(pt.x * SUN_EARTH_SCALE, pt.y * SUN_EARTH_SCALE)
            if (i === 0) ctx.moveTo(s.x, s.y)
            else ctx.lineTo(s.x, s.y)
          })
          ctx.stroke()
        }
        const b = sim.se.b
        const s = sc(b.x * SUN_EARTH_SCALE, b.y * SUN_EARTH_SCALE)
        const vl = Math.hypot(b.vx, b.vy)
        const len = (vl / (2 * Math.PI)) * 34
        ctx.strokeStyle = rgba(AMBER, ea)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + (b.vx / vl) * len, s.y - (b.vy / vl) * len)
        ctx.stroke()
        ctx.fillStyle = rgba('#5eb0ff', ea)
        ctx.shadowColor = '#5eb0ff'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Graph: axes, curve and the fitted line.
      const pl = plotRect(W, H)
      const m = V.morph
      if (gE > 0.01) {
        const ga = gE
        ctx.font = '10.5px ui-monospace, SFMono-Regular, Menlo, monospace'
        const tickSet = (xs: number[], ys: number[], toX: (x: number) => number, toY: (y: number) => number, alpha: number) => {
          if (alpha < 0.01) return
          for (const t of ys) {
            const y = toY(t)
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * alpha})`
            ctx.beginPath()
            ctx.moveTo(pl.L, y)
            ctx.lineTo(pl.R, y)
            ctx.stroke()
            ctx.fillStyle = `rgba(255,255,255,${0.42 * alpha})`
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillText(formatNumber(t, 0), pl.L - 7, y)
          }
          for (const t of xs) {
            const x = toX(t)
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * alpha})`
            ctx.beginPath()
            ctx.moveTo(x, pl.T)
            ctx.lineTo(x, pl.B)
            ctx.stroke()
            ctx.fillStyle = `rgba(255,255,255,${0.42 * alpha})`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(formatNumber(t, 0), x, pl.B + 7)
          }
        }
        ctx.lineWidth = 1
        tickSet(
          [0, 2, 4, 6, 8, 10],
          [0, 10, 20, 30],
          (x) => pl.L + (x / A_MAX.x) * (pl.R - pl.L),
          (y) => pl.B - (y / A_MAX.y) * (pl.B - pl.T),
          ga * (1 - m),
        )
        tickSet(
          [0, 500, 1000],
          [0, 250, 500, 750],
          (x) => pl.L + (x / B_MAX) * (pl.R - pl.L),
          (y) => pl.B - (y / B_MAX) * (pl.B - pl.T),
          ga * m,
        )
        ctx.strokeStyle = `rgba(255,255,255,${0.3 * ga})`
        ctx.beginPath()
        ctx.moveTo(pl.L, pl.T)
        ctx.lineTo(pl.L, pl.B)
        ctx.lineTo(pl.R, pl.B)
        ctx.stroke()
        ctx.font = '12px system-ui, sans-serif'
        const axisLabel = (a: string, b: string, x: number, y: number, align: CanvasTextAlign) => {
          ctx.textAlign = align
          ctx.textBaseline = 'bottom'
          ctx.fillStyle = `rgba(255,255,255,${0.7 * ga * (1 - m)})`
          ctx.fillText(a, x, y)
          ctx.fillStyle = `rgba(255,255,255,${0.7 * ga * m})`
          ctx.fillText(b, x, y)
        }
        axisLabel('a (UA)', 'a³ (UA³)', pl.R, pl.B - 6, 'right')
        axisLabel('T (anos)', 'T² (anos²)', pl.L + 6, pl.T - 8, 'left')

        // The curve T = a^1,5 straightens into T² = a³ while the axes morph.
        const curveA = ga * (1 - m) * (p.stepId === 'meca' && p.scene >= 1 ? 1 : 0)
        if (curveA > 0.01 || (m > 0.01 && m < 0.99)) {
          ctx.strokeStyle = `rgba(255,255,255,${0.35 * Math.max(curveA, ga * (1 - m))})`
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.save()
          ctx.beginPath()
          ctx.rect(pl.L, pl.T, pl.R - pl.L, pl.B - pl.T)
          ctx.clip()
          ctx.beginPath()
          for (let i = 0; i <= 80; i++) {
            const a = (10.4 * i) / 80
            const q = graphPos(pl, a, a ** 1.5, m)
            if (i === 0) ctx.moveTo(q.x, q.y)
            else ctx.lineTo(q.x, q.y)
          }
          ctx.stroke()
          ctx.restore()
          ctx.setLineDash([])
        }
      }

      const insetA = gE * smooth((m - 0.5) * 2)
      const fitted = Math.abs(p.slope - 1) < SLOPE_TOLERANCE
      const lineCol = fitted ? ACCENT : '#ffffff'
      if (V.lineA > 0.01 && gE > 0.01) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(pl.L, pl.T, pl.R - pl.L, pl.B - pl.T)
        ctx.clip()
        const a = graphPos(pl, 0, 0, 1)
        const xEnd = 1100
        const b = { x: pl.L + (xEnd / B_MAX) * (pl.R - pl.L), y: pl.B - ((V.k * xEnd) / B_MAX) * (pl.B - pl.T) }
        ctx.strokeStyle = rgba(lineCol, 0.85 * V.lineA * gE)
        ctx.lineWidth = fitted ? 2.6 : 2
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.restore()
      }

      // Inset that magnifies the inner planets (0 to 4 on both axes).
      if (insetA > 0.01) {
        ctx.fillStyle = `rgba(6,7,12,${0.94 * insetA})`
        ctx.strokeStyle = `rgba(255,255,255,${0.16 * insetA})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(pl.ix, pl.iy, pl.iw, pl.ih, 12)
        ctx.fill()
        ctx.stroke()
        const o = insetPos(pl, 0, 0)
        const e = insetPos(pl, INSET_MAX, INSET_MAX)
        ctx.strokeStyle = `rgba(255,255,255,${0.25 * insetA})`
        ctx.beginPath()
        ctx.moveTo(o.x, e.y)
        ctx.lineTo(o.x, o.y)
        ctx.lineTo(e.x, o.y)
        ctx.stroke()
        ctx.font = '9.5px ui-monospace, SFMono-Regular, Menlo, monospace'
        ctx.fillStyle = `rgba(255,255,255,${0.4 * insetA})`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('ampliado: 0 a 4', pl.ix + pl.iw - 7, pl.iy + 6)
        if (V.lineA > 0.01) {
          ctx.save()
          ctx.beginPath()
          ctx.rect(o.x, e.y, e.x - o.x, o.y - e.y)
          ctx.clip()
          const end = insetPos(pl, INSET_MAX * 1.2, INSET_MAX * 1.2 * V.k)
          ctx.strokeStyle = rgba(lineCol, 0.85 * V.lineA * insetA)
          ctx.lineWidth = fitted ? 2.2 : 1.6
          ctx.beginPath()
          ctx.moveTo(o.x, o.y)
          ctx.lineTo(end.x, end.y)
          ctx.stroke()
          ctx.restore()
        }
      }

      // Planets: on their orbits, flying into the chart.
      if (planetsA > 0.01) {
        PLANETS.forEach((pl0, i) => {
          const look = PLANET_LOOK[i]
          const th = sim.planets[i]
          const rho = Math.sqrt(pl0.a)
          const orb = sc(Math.cos(th) * rho, Math.sin(th) * rho)
          const local = smooth((sim.graphP - i * 0.08) / 0.6)
          const g = graphPos(pl, pl0.a, pl0.T, m)
          const x = orb.x + (g.x - orb.x) * local
          const y = orb.y + (g.y - orb.y) * local
          const r = look.px + (5 - look.px) * local
          const al = planetsA
          ctx.fillStyle = rgba(look.color, al)
          ctx.shadowColor = look.color
          ctx.shadowBlur = 8 * (1 - local)
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          if (i === 5 && local < 0.6) {
            ctx.strokeStyle = rgba(look.color, 0.6 * al * (1 - local))
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.4, 0, Math.PI * 2)
            ctx.stroke()
          }
          // Names: on the chart (inner ones move into the inset as it opens).
          const nameA = al * Math.max(local, V.solarA * (1 - gE) * (i >= 4 || p.mode === 'final' ? 0.8 : 0.55))
          const inner = i < 4
          const mainNameA = nameA * (inner ? 1 - insetA : 1)
          ctx.font = '11px system-ui, sans-serif'
          ctx.textBaseline = 'middle'
          if (mainNameA > 0.02 && !(inner && local > 0.5 && m > 0.01 && m < 0.5)) {
            ctx.fillStyle = `rgba(255,255,255,${0.7 * mainNameA})`
            const left = local > 0.5 && i >= 4
            ctx.textAlign = left ? 'right' : 'left'
            const dy = local > 0.5 && inner ? (i % 2 === 0 ? -10 : 10) : 0
            ctx.fillText(pl0.name, x + (left ? -r - 5 : r + 5), y + dy)
          }
          if (inner && insetA > 0.01) {
            const q = insetPos(pl, pl0.a ** 3, pl0.T ** 2)
            ctx.fillStyle = rgba(look.color, insetA * local)
            ctx.beginPath()
            ctx.arc(q.x, q.y, 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = `rgba(255,255,255,${0.7 * insetA * local})`
            ctx.textAlign = i === 0 ? 'left' : 'right'
            ctx.font = '10px system-ui, sans-serif'
            ctx.fillText(pl0.name, q.x + (i === 0 ? 7 : -7), q.y + (i === 0 ? -8 : i === 1 ? -2 : 0))
          }
        })
      }

      // The imaginary planet at 4 UA (a year of 8 years).
      if (V.hypoA > 0.01 && V.solarA > 0.01) {
        const s = sc(Math.cos(sim.hypo) * 2, Math.sin(sim.hypo) * 2)
        const al = V.hypoA * V.solarA * (1 - gE)
        ctx.fillStyle = rgba(ACCENT, al)
        ctx.shadowColor = ACCENT
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(s.x, s.y, 5.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = `rgba(255,255,255,${0.8 * al})`
        ctx.font = '600 11px system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        const known = p.mode === 'final' || p.eseAnswered
        ctx.fillText(known ? '4 UA · 8 anos' : '4 UA · ? anos', s.x + 10, s.y)
      }
    }

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      step(dt)
      const { view: tv, cam } = targets()
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.12, dt * 60)
      const V = sim.view
      const Lp = (a: number, b: number) => a + (b - a) * k
      for (const key of Object.keys(tv) as (keyof View)[]) {
        if (key === 'cx' || key === 'cy' || key === 'hw' || key === 'hh' || key === 'duck') continue
        V[key] = Lp(V[key], tv[key])
      }
      V.duck = V.duck + (tv.duck - V.duck) * (reduced ? 1 : 1 - Math.pow(1 - 0.25, dt * 60))
      const pad = 1.1
      V.cx = Lp(V.cx, (cam.x0 + cam.x1) / 2)
      V.cy = Lp(V.cy, (cam.y0 + cam.y1) / 2)
      V.hw = Math.exp(Lp(Math.log(V.hw), Math.log(((cam.x1 - cam.x0) / 2) * pad)))
      V.hh = Math.exp(Lp(Math.log(V.hh), Math.log(((cam.y1 - cam.y0) / 2) * pad)))
      const gTarget = pr.current.mode === 'graph' ? 1 : 0
      sim.graphP = reduced ? gTarget : sim.graphP + Math.sign(gTarget - sim.graphP) * Math.min(Math.abs(gTarget - sim.graphP), dt / 1.5)
      draw()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size])

  // ------------------------------------------------------------ pointer

  const drag = useRef<{ x: number; v0: number; moved: boolean } | null>(null)
  const slopeFrom = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pl = plotRect(rect.width, rect.height)
    const inInset = x >= pl.ix && x <= pl.ix + pl.iw && y >= pl.iy && y <= pl.iy + pl.ih
    let X: number
    let Y: number
    if (inInset) {
      const o = insetPos(pl, 0, 0)
      const e4 = insetPos(pl, INSET_MAX, INSET_MAX)
      X = ((x - o.x) / (e4.x - o.x)) * INSET_MAX
      Y = ((o.y - y) / (o.y - e4.y)) * INSET_MAX
    } else {
      X = ((x - pl.L) / (pl.R - pl.L)) * B_MAX
      Y = ((pl.B - y) / (pl.B - pl.T)) * B_MAX
    }
    if (X <= (inInset ? 0.2 : 40)) return
    const k = Math.min(3, Math.max(0.2, Y / X))
    setLive({ slope: Math.round(k * 100) / 100 })
  }

  const onDown = (e: React.PointerEvent) => {
    if (!interaction) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, v0: v, moved: false }
    if (interaction === 'slope') {
      slopeFrom(e)
      setUsed(true)
    }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (interaction === 'shoot') {
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 6) d.moved = true
      if (!d.moved) return
      const w = wrapRef.current?.clientWidth ?? 360
      const nv = Math.min(V_MAX, Math.max(0, Math.round((d.v0 + (dx / (w * 0.8)) * V_MAX) * 20) / 20))
      if (nv !== v) setLive({ v: nv })
      if (!used) setUsed(true)
    } else if (interaction === 'slope') slopeFrom(e)
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (interaction === 'shoot') {
      fire(v)
      setUsed(true)
    } else if (interaction === 'mark') {
      mark()
      setUsed(true)
    }
  }

  // ------------------------------------------------------------ overlays

  const showSpeed = mode === 'cannon' || mode === 'orbit'
  const shownV = stepId === 'preveja' && scene === 1 && shot ? shot.v : v
  const typeShown = showSpeed && shot && !(stepId === 'preveja' && scene === 0) ? shot.type : null
  const circV = typeof answers.circV === 'number' ? (answers.circV as number) : null
  const fitted = Math.abs(slope - 1) < SLOPE_TOLERANCE
  const hint =
    interaction === 'shoot'
      ? 'Arraste para os lados · solte para disparar'
      : interaction === 'mark'
        ? 'Toque no palco para marcar'
        : interaction === 'slope'
          ? 'Arraste para girar a reta'
          : null

  const aria = (() => {
    switch (mode) {
      case 'cannon':
        return `Canhão de Newton no alto de uma montanha. Velocidade ${formatNumber(shownV, 1)} km/s${shot ? `; último disparo: ${TRAJECTORY_LABEL[shot.type]}` : ''}.`
      case 'orbit':
        return `A Terra inteira e a trajetória da bala a ${formatNumber(shownV, 1)} km/s${typeShown ? `: ${TRAJECTORY_LABEL[typeShown]}` : ''}.`
      case 'kepler':
        return 'Estrela com um planeta imaginário numa órbita elíptica, com fatias de área varridas em tempos iguais.'
      case 'solar':
        return 'Sistema Solar de Mercúrio a Saturno, com distâncias comprimidas e ritmos reais.'
      case 'graph':
        return scene >= 2 ? `Gráfico T² por a³ dos planetas, com uma reta de inclinação ${formatNumber(slope, 2)}.` : 'Gráfico do período T pela distância a dos planetas: uma curva.'
      case 'iss':
        return 'A Estação Espacial Internacional em órbita da Terra.'
      case 'sunEarth':
        return eseAnswered ? 'A Terra, 1,41 vez mais rápida, escapa do Sol numa parábola.' : 'A Terra em órbita circular do Sol.'
      default:
        return 'Sistema Solar com o planeta imaginário a 4 UA.'
    }
  })()

  const badge = 'rounded-full bg-black/55 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-xl'

  return (
    <Panel>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>
      <div
        className={cn('absolute inset-0 z-[1] select-none', interaction === 'shoot' && 'cursor-ew-resize', interaction === 'mark' && 'cursor-pointer', interaction === 'slope' && 'cursor-crosshair')}
        style={{ touchAction: interaction ? 'none' : 'auto' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      />

      {/* Top-left: the main number of the moment. */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        <AnimatePresence mode="popLayout">
          {showSpeed && (
            <motion.div key="v" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.snappy} className={cn(badge, 'font-mono tabular-nums')}>
              v = {formatNumber(shownV, 2)} km/s
            </motion.div>
          )}
          {showSpeed && stepId === 'entenda' && circV !== null && (
            <motion.div key="vc" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} className={cn(badge, 'text-[11.5px] text-white/65')}>
              círculo ≈ 7,9 km/s · escape ≈ 11,2 km/s
            </motion.div>
          )}
          {mode === 'kepler' && (
            <motion.div key="kep" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} className={cn(badge, 'font-mono tabular-nums')}>
              <span className="text-amber-200">→</span> v = <span ref={speedRef}>–</span>
            </motion.div>
          )}
          {mode === 'kepler' && (
            <motion.div key="kep2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(badge, 'text-[11px] text-white/55')}>
              Planeta imaginário · e = 0,6 · a = 1 UA
            </motion.div>
          )}
          {(mode === 'solar' || mode === 'final') && stepId !== 'e-se' && (
            <motion.div key="sol" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(badge, 'text-[11px] text-white/60')}>
              Distâncias comprimidas · ritmos reais · 1 ano = {YEAR_S} s
            </motion.div>
          )}
          {mode === 'graph' && scene >= 2 && (
            <motion.div key="k" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} className={cn(badge, 'ml-10 font-mono tabular-nums', fitted && 'text-[#46d9c6]')}>
              T² = {formatNumber(slope, 2)} · a³
            </motion.div>
          )}
          {mode === 'iss' && (
            <motion.div key="iss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={badge}>
              ISS · ≈ 400 km · volta em ≈ 92 min
            </motion.div>
          )}
          {mode === 'sunEarth' && (
            <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(badge, 'font-mono tabular-nums')}>
              Terra: {eseAnswered ? '42 km/s (× √2)' : '30 km/s'}
            </motion.div>
          )}
          {stepId === 'e-se' && mode === 'solar' && (
            <motion.div key="hyp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(badge, 'text-[11.5px]')}>
              Planeta imaginário a 4 UA do Sol
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top-right: the kind of trajectory, animated. */}
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <AnimatePresence mode="wait">
          {typeShown && (
            <motion.div
              key={`${shot?.id}-${typeShown}`}
              initial={{ opacity: 0, scale: 0.7, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 520, damping: 26 }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur-xl',
                typeShown === 'cai' && 'bg-rose-400/20 text-rose-100',
                typeShown === 'circulo' && 'bg-[#46d9c6]/20 text-[#bff5ee]',
                typeShown === 'elipse' && 'bg-amber-400/20 text-amber-100',
                typeShown === 'escapa' && 'bg-violet-400/25 text-violet-100',
              )}
            >
              {TRAJECTORY_LABEL[typeShown]}
            </motion.div>
          )}
          {mode === 'kepler' && allEqual && (
            <motion.div key="eq" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring.snappy} className="rounded-full bg-[#46d9c6]/20 px-3.5 py-1.5 text-[13px] font-semibold text-[#bff5ee] backdrop-blur-xl">
              Áreas iguais!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* T² ∝ a³, the result of Meça. */}
      <AnimatePresence>
        {stepId === 'meca' && scene === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={spring.soft}
            className="pointer-events-none absolute bottom-14 right-5 z-10 rounded-2xl bg-black/60 px-4 py-2 font-mono text-[24px] text-white backdrop-blur-xl"
            style={{ textShadow: `0 0 18px ${lab.accent}` }}
          >
            T² ∝ a³
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conclusion: a ring drawn around the Sun. */}
      <AnimatePresence>
        {stepId === 'conclua' && (
          <motion.div key="medal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <svg viewBox="0 0 160 160" className="h-40 w-40">
              <motion.circle cx="80" cy="80" r="70" fill="none" stroke={lab.accent} strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.3 }} />
            </svg>
            <span className="absolute">
              <Burst color={lab.accent} count={16} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {(mode === 'cannon' || mode === 'orbit' || mode === 'iss') && (
        <p className="pointer-events-none absolute bottom-2.5 left-3 z-10 text-[10.5px] text-white/35">Montanha e altitudes exageradas no desenho</p>
      )}
      {mode === 'graph' && <p className="pointer-events-none absolute bottom-2.5 right-3 z-10 text-[10.5px] text-white/35">NASA Planetary Fact Sheet</p>}

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <AnimatePresence>
          {hint && !used && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }} exit={{ opacity: 0, scale: 0.95 }} className="whitespace-nowrap rounded-full bg-black/60 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur-xl">
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {celebrate > 0 && (
        <span key={celebrate} className="pointer-events-none absolute inset-0 z-10">
          <Burst color={lab.accent} />
        </span>
      )}
    </Panel>
  )
}
