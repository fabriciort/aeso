'use client'

import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contour, descend, project, groundDelta, groundFromScreen, norm, type Camera, type Projected, type Vec2 } from '@/lib/math/surface'
import { fmt } from '@/lib/math/view'
import { prefersReducedMotion } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import { cn } from '@/lib/utils'
import { Panel, type StageProps } from '../runtime'
import {
  ASCENT_PATH,
  BOWL,
  DESCENT_BOUND,
  DESCENT_START,
  HIKER_START,
  MOUNTAIN,
  P1,
  P3,
  P3_ANSWER,
  P3_LINE,
  P3_SAY,
  PAO,
  PRAIA_VERMELHA,
  PROBLEMS,
  RIO,
  SUMMIT,
  TERRAINS,
  TRAIL_A,
  TRAIL_B,
  TRAIL_POINT,
  trailLength,
  U_DIR,
  URCA,
  toKm,
  type GradLive,
} from './data'

// The continuous Palco of "Subindo a montanha".
//
// One terrain, drawn as a shaded 40 × 40 mesh with its own projection, that
// never cuts: the imagined mountain gets sliced into level curves, the camera
// rises until the rings fall flat into a map, a vertical plane slices it to
// show ∂f/∂x and ∂f/∂y, the ground reshapes itself into Pão de Açúcar and
// then into the valley x² + 3y², where fog rolls in. Every frame eases the
// displayed state toward the target of the current Etapa/Cena.

const N = 81 // contour/texture grid
const M = 41 // mesh vertices per side (40 × 40 quads)
const STRIDE = (N - 1) / (M - 1)
const TOP = Math.PI / 2
const ACCENT = [245, 208, 97] as const
const SKY = '#7dd3fc'
const ROSE = '#fda4af'
const acc = (a: number) => `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`

type LayerId = 'trails' | 'summit' | 'cable' | 'steep' | 'trailPick' | 'dial' | 'vecs' | 'tri' | 'dir' | 'solo' | 'descent' | 'stepArrow' | 'ascent'
const LAYERS: LayerId[] = ['trails', 'summit', 'cable', 'steep', 'trailPick', 'dial', 'vecs', 'tri', 'dir', 'solo', 'descent', 'stepArrow', 'ascent']

interface View {
  w: [number, number, number]
  amp: number
  yaw: number
  pitch: number
  fit: number
  cyF: number
  zoom: number
  panX: number
  panY: number
  persp: number
  nb: number
  mesh: number
  map: number
  rings: number
  drop: number
  fog: number
  hiker: number
  hx: number
  hy: number
  plane: number
  planeAng: number
  grad: number
  comps: number
  levelHi: number
  layers: Record<LayerId, number>
}

/** Things the drawing needs that are not eased. */
interface Inputs {
  stepId: string
  scene: number
  spin: boolean
  steepTap: Vec2 | null
  trailPick: number | null
  pick: GradLive['pick'] | null
  solveStep: string | null
  v: Vec2
  soloDone: boolean
  trailAngle: number
  eta: number
  run: number
  eseChoice: number | null
  eseAnswered: boolean
}

const BASE: View = {
  w: [1, 0, 0],
  amp: 1,
  yaw: 0,
  pitch: 0.62,
  fit: 2.45,
  cyF: 0.62,
  zoom: 1,
  panX: 0,
  panY: 0,
  persp: 0.16,
  nb: 0,
  mesh: 1,
  map: 0,
  rings: 0,
  drop: 0,
  fog: 0,
  hiker: 0,
  hx: 0,
  hy: 0,
  plane: 0,
  planeAng: 0,
  grad: 0,
  comps: 0,
  levelHi: 0,
  layers: Object.fromEntries(LAYERS.map((l) => [l, 0])) as Record<LayerId, number>,
}

const MAP: Partial<View> = { pitch: TOP, fit: 2.18, cyF: 0.5, persp: 0, mesh: 0, map: 1, rings: 1, drop: 1, yaw: 0 }

const stageOf = (t: 0 | 1 | 2, p: Vec2): Vec2 => [p[0] / TERRAINS[t].L, p[1] / TERRAINS[t].L]

function target(p: Inputs, live: Partial<GradLive>, answers: Record<string, unknown>, yawFree: number): View {
  const v: View = { ...BASE, layers: { ...BASE.layers } }
  const on = (...ids: LayerId[]) => ids.forEach((id) => (v.layers[id] = 1))
  const hiker = stageOf(0, [live.hx ?? HIKER_START[0], live.hy ?? HIKER_START[1]])
  const put = (t: 0 | 1 | 2, pt: Vec2) => {
    ;[v.hx, v.hy] = stageOf(t, pt)
    v.hiker = 1
  }
  v.yaw = yawFree
  const s = p.scene
  switch (p.stepId) {
    case 'imagine':
      if (s >= 1) {
        ;[v.hx, v.hy] = hiker
        v.hiker = 1
      }
      break
    case 'preveja':
      if (s === 0) Object.assign(v, { rings: 1, mesh: 0.85 })
      else if (s === 3) {
        Object.assign(v, { rings: 1, yaw: 0, pitch: 0.5, mesh: 0.8 })
        on('trails')
      } else {
        Object.assign(v, MAP)
        on(s === 4 ? 'summit' : 'trails')
      }
      break
    case 'entenda':
      ;[v.hx, v.hy] = hiker
      v.hiker = 1
      if (s <= 2) Object.assign(v, { plane: 1, planeAng: s === 2 ? TOP : 0, yaw: s === 2 ? -TOP : 0, pitch: 0.36, fit: 2.75, cyF: 0.62 })
      else Object.assign(v, MAP, { grad: 1, comps: s === 3 ? 1 : 0, levelHi: s === 4 ? 1 : 0 })
      break
    case 'mundo-real':
      v.w = [0, 1, 0]
      if (s === 0) {
        Object.assign(v, { pitch: 0.58, fit: 2.6, zoom: 1.2 })
        on('cable')
      } else {
        Object.assign(v, MAP)
        on('cable')
        v.layers.cable = s === 1 ? 1 : s === 2 ? 0.4 : 0
        if (s === 1) on('steep')
        if (s >= 2) {
          put(1, TRAIL_POINT)
          Object.assign(v, { grad: 1, levelHi: 1, zoom: 1.7 })
          ;[v.panX, v.panY] = [v.hx + 0.12, v.hy + 0.1]
          on(s === 2 ? 'trailPick' : 'dial')
        }
      }
      break
    case 'resolva': {
      v.w = [0, 0, 1]
      v.nb = 1
      const prob = PROBLEMS[Math.min(s, PROBLEMS.length - 1)]
      const done = Number((answers.solve as Record<string, number> | undefined)?.[prob.id] ?? 0)
      if (prob.id === 'p1' && done < 2) {
        put(2, P1)
        Object.assign(v, { amp: 3.3, mesh: 0.28, plane: 1, planeAng: done === 1 ? TOP : 0, yaw: done === 1 ? -TOP : 0, pitch: 0.22, fit: 2.4, cyF: 0.9, zoom: 1.35, persp: 0.08 })
      } else if (prob.id !== 'p3') {
        put(2, P1)
        Object.assign(v, MAP, { levelHi: 1, zoom: 1.6, map: 0.8 })
        ;[v.panX, v.panY] = [v.hx + 0.08, v.hy + 0.05]
        if (prob.id === 'p1') {
          on('vecs')
          if (done >= 3) on('tri')
        } else on('dir')
      } else {
        put(2, P3)
        Object.assign(v, MAP, { levelHi: 0.6, zoom: 1.45, map: 0.8 })
        ;[v.panX, v.panY] = [v.hx - 0.08, v.hy + 0.12]
        on('solo')
      }
      break
    }
    case 'e-se':
      v.w = [0, 0, 1]
      if (s === 0) {
        put(2, DESCENT_START)
        Object.assign(v, { fog: 1, pitch: 0.75, yaw: 0.35, zoom: 1.5, cyF: 0.55 })
        ;[v.panX, v.panY] = [v.hx * 0.7, v.hy * 0.7]
        if (p.eseAnswered) on('stepArrow')
      } else {
        Object.assign(v, MAP, { map: 0.85 })
        put(2, DESCENT_START)
        on('descent')
      }
      break
    case 'conclua':
      Object.assign(v, { rings: 0.55, mesh: 1, pitch: 0.6 })
      put(0, SUMMIT)
      on('ascent')
      break
  }
  return v
}

// ------------------------------------------------------------ easing helpers

const clone = (v: View): View => ({ ...v, w: [...v.w] as View['w'], layers: { ...v.layers } })
const angDiff = (a: number, b: number) => {
  let d = (b - a) % (2 * Math.PI)
  if (d > Math.PI) d -= 2 * Math.PI
  if (d < -Math.PI) d += 2 * Math.PI
  return d
}
const SCALARS = ['amp', 'pitch', 'fit', 'cyF', 'zoom', 'panX', 'panY', 'persp', 'nb', 'mesh', 'map', 'rings', 'drop', 'fog', 'hiker', 'hx', 'hy', 'plane', 'grad', 'comps', 'levelHi'] as const

function ease(d: View, t: View, k: number) {
  for (const key of SCALARS) d[key] += (t[key] - d[key]) * k
  for (let i = 0; i < 3; i++) d.w[i] += (t.w[i] - d.w[i]) * k
  d.yaw += angDiff(d.yaw, t.yaw) * k
  d.planeAng += angDiff(d.planeAng, t.planeAng) * k
  for (const l of LAYERS) d.layers[l] += (t.layers[l] - d.layers[l]) * k
}

// Precomputed stage heights of each terrain (z = zs·f on the shared grid).
const GRIDS = TERRAINS.map((T) => {
  const g = new Float32Array(N * N)
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) g[j * N + i] = T.zs * T.field.f(T.L * (-1 + (2 * i) / (N - 1)), T.L * (-1 + (2 * j) / (N - 1)))
  return g
})

const MESH_STROKES = Array.from({ length: 16 }, (_, k) => acc(0.16 + (0.3 * k) / 15))
const SHADES = Array.from({ length: 25 }, (_, k) => `rgb(${Math.round(9 + k * 2.7)},${Math.round(11 + k * 2.65)},${Math.round(18 + k * 2.4)})`)
const LIGHT = (() => {
  const l = [-0.45, 0.55, 0.7]
  const n = Math.hypot(l[0], l[1], l[2])
  return l.map((c) => c / n)
})()

// ------------------------------------------------------------ component

export default function GradStage({ stepId, scene, answers, live, setLive, setAnswer }: StageProps) {
  const L = live as Partial<GradLive>
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const yawRef = useRef(-0.5)
  const sizeRef = useRef({ w: 0, h: 0 })
  const camRef = useRef<Camera | null>(null)
  const hikerPx = useRef({ X: -999, Y: -999 })
  const draggingRef = useRef(false)

  const solve = (answers.solve as Record<string, number> | undefined) ?? {}
  const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
  const done = solve[prob.id] ?? 0
  const soloDone = done >= 1 && prob.id === 'p3'
    const eseChoice = typeof answers.eseChoice === 'number' ? (answers.eseChoice as number) : null

  const inputs: Inputs = {
    stepId,
    scene,
    spin: (stepId === 'imagine' && scene === 0) || stepId === 'conclua' || (stepId === 'mundo-real' && scene === 0),
    steepTap: Array.isArray(answers.steepTap) ? (answers.steepTap as Vec2) : null,
    trailPick: typeof answers.trailPick === 'number' ? (answers.trailPick as number) : null,
    pick: stepId === 'resolva' ? (L.pick ?? null) : null,
    solveStep: stepId === 'resolva' && prob.steps[done] ? prob.steps[done].id : null,
    v: [L.vx ?? 0, L.vy ?? 0],
    soloDone: stepId === 'resolva' && prob.id === 'p3' && (soloDone || Boolean((answers.shown as Record<string, boolean> | undefined)?.p3)),
    trailAngle: L.trailAngle ?? 1.2,
    eta: stepId === 'e-se' && scene === 2 ? (typeof answers.eseBig === 'number' ? 0.4 : (L.eta ?? 0.15)) : (L.eta ?? 0.15),
    run: L.run ?? 0,
    eseChoice,
    eseAnswered: eseChoice !== null,
  }
  const inputsRef = useRef(inputs)
  inputsRef.current = inputs
  const liveRef = useRef(L)
  liveRef.current = L
  const answersRef = useRef(answers)
  answersRef.current = answers

  // Descent walk (E se…?): path recomputed when η or the run token changes.
  const walk = useMemo(() => {
    if (stepId !== 'e-se' || scene === 0) return null
    const eta = scene === 3 ? (typeof answers.bestEta === 'number' ? (answers.bestEta as number) : 0.15) : inputs.eta
    return { ...descend(BOWL.field, DESCENT_START, eta, { maxSteps: 60, bound: DESCENT_BOUND, tol: 0.05 }), eta, t0: performance.now() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, scene, inputs.eta, inputs.run, answers.bestEta])
  const walkRef = useRef(walk)
  walkRef.current = walk

  // ---------------------------------------------------------------- loop
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      const h = e.contentRect.height
      sizeRef.current = { w, h }
      const dpr = 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    })
    ro.observe(wrap)
    const reduced = prefersReducedMotion()
    const disp = clone(target(inputsRef.current, liveRef.current, answersRef.current, yawRef.current))
    const zmix = new Float32Array(N * N)
    const PX = new Float32Array(M * M)
    const PY = new Float32Array(M * M)
    const PD = new Float32Array(M * M)
    const order: number[] = Array.from({ length: (M - 1) * (M - 1) }, (_, i) => i)
    const qDepth = new Float32Array((M - 1) * (M - 1))
    const tex = document.createElement('canvas')
    tex.width = N
    tex.height = N
    const tctx = tex.getContext('2d')!
    const img = tctx.createImageData(N, N)
    let mixKey = ''
    let fine: { lvl: number; major: boolean; seg: number[] }[] = []
    let zmax = 1
    let raf = 0
    let last = performance.now()
    const tmp: Projected = { X: 0, Y: 0, depth: 0 }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const { w: W, h: H } = sizeRef.current
      if (!W || !H) return
      const dt = Math.min(now - last, 50)
      last = now
      const inp = inputsRef.current
      if (inp.spin && !draggingRef.current && !reduced) yawRef.current += dt * 0.00012
      const tgt = target(inp, liveRef.current, answersRef.current, yawRef.current)
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.085, dt / 16.67)
      ease(disp, tgt, k)
      if (draggingRef.current) {
        disp.hx = tgt.hx
        disp.hy = tgt.hy
      }
      const d = disp
      const dpr = canvas.width / W
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // ---- terrain mix
      const wsum = d.w[0] + d.w[1] + d.w[2] || 1
      const dom = d.w.indexOf(Math.max(...d.w)) as 0 | 1 | 2
      const purity = d.w[dom] / wsum
      const key = `${d.w.map((x) => x.toFixed(3)).join()}|${d.amp.toFixed(3)}`
      if (key !== mixKey) {
        mixKey = key
        const [a, b, c] = d.w
        zmax = 1e-6
        for (let i = 0; i < N * N; i++) {
          const z = d.amp * (a * GRIDS[0][i] + b * GRIDS[1][i] + c * GRIDS[2][i])
          zmix[i] = z
          if (z > zmax) zmax = z
        }
        const T = TERRAINS[dom]
        fine = T.levels.map((lvl) => ({ lvl: lvl * T.zs * d.amp * d.w[dom], major: Math.round(lvl / T.levels[0]) % 5 === 0, seg: [] as number[] }))
        for (const f of fine) f.seg = contour(zmix, N, 1, f.lvl)
        // ground texture: height tint with a soft hillshade
        const step = 2 / (N - 1)
        for (let j = 0; j < N; j++)
          for (let i = 0; i < N; i++) {
            const z = zmix[j * N + i]
            const zx = (zmix[j * N + Math.min(i + 1, N - 1)] - zmix[j * N + Math.max(i - 1, 0)]) / (2 * step)
            const zy = (zmix[Math.min(j + 1, N - 1) * N + i] - zmix[Math.max(j - 1, 0) * N + i]) / (2 * step)
            const nlen = Math.hypot(zx, zy, 1)
            const lam = Math.max(0, (-zx * LIGHT[0] - zy * LIGHT[1] + LIGHT[2]) / nlen)
            const h = Math.max(0, z / zmax)
            const o = ((N - 1 - j) * N + i) * 4
            const sh = 0.55 + 0.6 * lam
            img.data[o] = Math.min(255, (10 + h * 70) * sh)
            img.data[o + 1] = Math.min(255, (12 + h * 58) * sh)
            img.data[o + 2] = Math.min(255, (20 + h * 24) * sh)
            img.data[o + 3] = 255
          }
        tctx.putImageData(img, 0, 0)
      }
      const terr = TERRAINS[dom]
      const zAt = (u: number, v: number) => {
        let z = 0
        for (let t = 0; t < 3; t++) if (d.w[t] > 1e-4) z += d.w[t] * TERRAINS[t].zs * TERRAINS[t].field.f(TERRAINS[t].L * u, TERRAINS[t].L * v)
        return z * d.amp
      }
      /** Gradient of the dominant terrain in its own math units. */
      const gMath = (u: number, v: number): Vec2 => terr.field.grad(terr.L * u, terr.L * v)

      // ---- camera
      const availH = H - d.nb * Math.min(H * 0.4, 190)
      const topness = Math.max(0, Math.min(1, (d.pitch - 0.6) / (TOP - 0.6)))
      const scale = d.zoom * Math.min(W / d.fit, availH / (d.fit * (0.86 + 0.14 * topness)))
      const cam: Camera = { yaw: d.yaw, pitch: Math.min(TOP, d.pitch), scale, cx: W / 2, cy: availH * d.cyF, panX: d.panX, panY: d.panY, persp: d.persp }
      camRef.current = cam
      const P = (u: number, v: number, z: number) => project(cam, u, v, z, { X: 0, Y: 0, depth: 0 })
      const flat = 1 - d.drop
      const ringsCoarse = d.rings * Math.min(1, d.mesh / 0.3) * purity ** 6
      const ringsFine = d.rings * (1 - Math.min(1, d.mesh / 0.3)) * purity ** 6

      // ---- ground texture (the map)
      if (d.map > 0.01) {
        const c0 = project({ ...cam, persp: 0 }, -1, 1, 0)
        const c1 = project({ ...cam, persp: 0 }, 1, 1, 0)
        const c2 = project({ ...cam, persp: 0 }, -1, -1, 0)
        ctx.save()
        ctx.globalAlpha = d.map * 0.9
        ctx.transform((c1.X - c0.X) / N, (c1.Y - c0.Y) / N, (c2.X - c0.X) / N, (c2.Y - c0.Y) / N, c0.X, c0.Y)
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(tex, 0, 0)
        ctx.restore()
      }

      // ---- mesh (painter's order, far to near) with per-quad level curves
      const hu = d.hx
      const hv = d.hy
      if (d.mesh > 0.01) {
        for (let j = 0; j < M; j++)
          for (let i = 0; i < M; i++) {
            const idx = j * M + i
            const u = -1 + (2 * i) / (M - 1)
            const v = -1 + (2 * j) / (M - 1)
            project(cam, u, v, zmix[j * STRIDE * N + i * STRIDE], tmp)
            PX[idx] = tmp.X
            PY[idx] = tmp.Y
            PD[idx] = tmp.depth
          }
        for (let j = 0; j < M - 1; j++)
          for (let i = 0; i < M - 1; i++) {
            const a = j * M + i
            qDepth[j * (M - 1) + i] = PD[a] + PD[a + 1] + PD[a + M] + PD[a + M + 1]
          }
        order.sort((p, q) => qDepth[q] - qDepth[p])
        const cell = 2 / (M - 1)
        const levels = fine.map((f) => f.lvl)
        ctx.lineWidth = 0.7
        ctx.lineJoin = 'round'
        for (const q of order) {
          const i = q % (M - 1)
          const j = (q - i) / (M - 1)
          const a = j * M + i
          const za = zmix[j * STRIDE * N + i * STRIDE]
          const zb = zmix[j * STRIDE * N + (i + 1) * STRIDE]
          const zc = zmix[(j + 1) * STRIDE * N + (i + 1) * STRIDE]
          const zd = zmix[(j + 1) * STRIDE * N + i * STRIDE]
          let alpha = d.mesh
          if (d.fog > 0.01) {
            const du = -1 + (i + 0.5) * cell - hu
            const dv = -1 + (j + 0.5) * cell - hv
            alpha *= 1 - d.fog * (1 - Math.exp(-(du * du + dv * dv) / 0.16))
          }
          if (alpha < 0.01) continue
          const nx = -((zb - za + zc - zd) / 2) / cell
          const ny = -((zd - za + zc - zb) / 2) / cell
          const lam = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + LIGHT[2]) / Math.hypot(nx, ny, 1))
          ctx.globalAlpha = alpha
          ctx.fillStyle = SHADES[Math.min(24, Math.round(lam * 24))]
          ctx.strokeStyle = MESH_STROKES[Math.round(15 * Math.min(1, Math.max(0, (za / zmax) * 1.3)))]
          ctx.beginPath()
          ctx.moveTo(PX[a], PY[a])
          ctx.lineTo(PX[a + 1], PY[a + 1])
          ctx.lineTo(PX[a + M + 1], PY[a + M + 1])
          ctx.lineTo(PX[a + M], PY[a + M])
          ctx.closePath()
          ctx.fill()
          if (ringsCoarse > 0.01) {
            const lo = Math.min(za, zb, zc, zd)
            const hi = Math.max(za, zb, zc, zd)
            let drew = false
            for (const lvl of levels) {
              if (lvl <= lo || lvl >= hi) continue
              const pts: number[] = []
              const edge = (z1: number, z2: number, u1: number, v1: number, u2: number, v2: number) => {
                if (z1 > lvl === z2 > lvl) return
                const t = (lvl - z1) / (z2 - z1)
                pts.push(u1 + (u2 - u1) * t, v1 + (v2 - v1) * t)
              }
              const u0 = -1 + i * cell
              const v0 = -1 + j * cell
              edge(za, zb, u0, v0, u0 + cell, v0)
              edge(zb, zc, u0 + cell, v0, u0 + cell, v0 + cell)
              edge(zc, zd, u0 + cell, v0 + cell, u0, v0 + cell)
              edge(zd, za, u0, v0 + cell, u0, v0)
              if (!drew) {
                ctx.beginPath()
                drew = true
              }
              for (let s = 0; s + 3 < pts.length; s += 4) {
                project(cam, pts[s], pts[s + 1], lvl * flat, tmp)
                ctx.moveTo(tmp.X, tmp.Y)
                project(cam, pts[s + 2], pts[s + 3], lvl * flat, tmp)
                ctx.lineTo(tmp.X, tmp.Y)
              }
            }
            if (drew) {
              ctx.globalAlpha = alpha * ringsCoarse
              ctx.strokeStyle = acc(0.95)
              ctx.lineWidth = 1.5
              ctx.stroke()
              ctx.lineWidth = 0.7
            }
          }
        }
        ctx.globalAlpha = 1
      }

      // ---- fine level curves (map)
      if (ringsFine > 0.01) {
        for (const f of fine) {
          ctx.beginPath()
          const z = f.lvl * flat
          for (let s = 0; s + 3 < f.seg.length; s += 4) {
            project(cam, f.seg[s], f.seg[s + 1], z, tmp)
            ctx.moveTo(tmp.X, tmp.Y)
            project(cam, f.seg[s + 2], f.seg[s + 3], z, tmp)
            ctx.lineTo(tmp.X, tmp.Y)
          }
          ctx.strokeStyle = acc(ringsFine * (f.major ? 0.95 : 0.6))
          ctx.lineWidth = f.major ? 1.7 : 1.1
          ctx.stroke()
        }
      }

      // ---- the level curve through the hiker
      if (d.levelHi > 0.01 && d.hiker > 0.01) {
        const lvl = zAt(hu, hv)
        const seg = contour(zmix, N, 1, lvl)
        ctx.beginPath()
        for (let s = 0; s + 3 < seg.length; s += 4) {
          project(cam, seg[s], seg[s + 1], lvl * flat, tmp)
          ctx.moveTo(tmp.X, tmp.Y)
          project(cam, seg[s + 2], seg[s + 3], lvl * flat, tmp)
          ctx.lineTo(tmp.X, tmp.Y)
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.85 * d.levelHi})`
        ctx.lineWidth = 2
        ctx.setLineDash([5, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ---- slicing plane (Entenda, Resolva)
      if (d.plane > 0.01 && d.hiker > 0.01) drawPlane(ctx, P, zAt, hu, hv, d, terr.zs * terr.L * d.amp, inp.pick?.show?.slope, inp.pick?.ok)

      // ---- layers
      const pill = (X: number, Y: number, text: string, a: number, tone: 'accent' | 'muted' | 'sky' | 'rose' = 'muted', align: 'center' | 'left' | 'right' = 'center') =>
        drawPill(ctx, X, Y, text, a, tone, align, W)
      const surf = (t: 0 | 1 | 2, x: number, y: number) => {
        const [u, v] = stageOf(t, [x, y])
        return P(u, v, zAt(u, v) * flat)
      }
      const Lr = d.layers
      if (Lr.trails > 0.01) {
        const scene3 = inp.stepId === 'preveja' && inp.scene === 3
        ;[
          { t: TRAIL_A, name: 'A', color: acc(1), tone: 'accent' as const },
          { t: TRAIL_B, name: 'B', color: SKY, tone: 'sky' as const },
        ].forEach(({ t, name, color, tone }) => {
          ctx.save()
          ctx.globalAlpha = Lr.trails
          ctx.strokeStyle = color
          ctx.lineWidth = 3.2
          ctx.lineCap = 'round'
          ctx.beginPath()
          for (let s = 0; s <= 24; s++) {
            const x = t[0][0] + ((t[1][0] - t[0][0]) * s) / 24
            const y = t[0][1] + ((t[1][1] - t[0][1]) * s) / 24
            const p = surf(0, x, y)
            if (s) ctx.lineTo(p.X, p.Y)
            else ctx.moveTo(p.X, p.Y)
          }
          ctx.stroke()
          for (const e of t) {
            const p = surf(0, e[0], e[1])
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(p.X, p.Y, 3.5, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
          const mid = surf(0, (t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2)
          const text = scene3 ? `${name} · 300 m em ${fmt(trailLength(t), 2)} km` : name
          if (scene3) pill(mid.X + (name === 'A' ? 10 : -10), mid.Y + (name === 'A' ? -26 : 26), text, Lr.trails, tone, name === 'A' ? 'left' : 'right')
          else pill(mid.X, mid.Y - 22, text, Lr.trails, tone)
        })
      }
      if (Lr.summit > 0.01) {
        const s = surf(0, SUMMIT[0], SUMMIT[1])
        ctx.save()
        ctx.globalAlpha = Lr.summit
        ctx.strokeStyle = '#ffffff'
        ctx.setLineDash([3, 4])
        ctx.beginPath()
        ctx.arc(s.X, s.Y, scale * 0.12, 0, Math.PI * 2)
        ctx.stroke()
        const a = surf(0, (TRAIL_A[0][0] + TRAIL_A[1][0]) / 2, (TRAIL_A[0][1] + TRAIL_A[1][1]) / 2)
        ctx.beginPath()
        ctx.arc(a.X, a.Y, scale * 0.09, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
        pill(s.X, s.Y - scale * 0.12 - 16, 'cume: curvas afastadas', Lr.summit, 'accent')
        pill(a.X, a.Y + scale * 0.09 + 16, 'encosta: curvas juntas', Lr.summit, 'muted')
      }
      if (Lr.cable > 0.01) {
        const pts: Vec2[] = [PRAIA_VERMELHA, URCA, PAO]
        const zs = pts.map((p, i) => (i === 0 ? 0.004 : RIO.field.f(p[0], p[1])))
        ctx.save()
        ctx.globalAlpha = Lr.cable
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        for (let s = 0; s < 2; s++) {
          for (let k2 = 0; k2 <= 20; k2++) {
            const t = k2 / 20
            const x = pts[s][0] + (pts[s + 1][0] - pts[s][0]) * t
            const y = pts[s][1] + (pts[s + 1][1] - pts[s][1]) * t
            const z = zs[s] + (zs[s + 1] - zs[s]) * t - 0.025 * Math.sin(Math.PI * t)
            const [u, v] = stageOf(1, [x, y])
            const p = P(u, v, z * RIO.zs * d.amp * flat)
            if (k2 || s) ctx.lineTo(p.X, p.Y)
            else ctx.moveTo(p.X, p.Y)
          }
        }
        ctx.stroke()
        ctx.restore()
        const names = ['Praia Vermelha', 'Morro da Urca · ≈ 220 m', 'Pão de Açúcar · 396 m']
        pts.forEach((p, i) => {
          const [u, v] = stageOf(1, p)
          const q = P(u, v, zs[i] * RIO.zs * d.amp * flat)
          ctx.fillStyle = `rgba(255,255,255,${Lr.cable})`
          ctx.beginPath()
          ctx.arc(q.X, q.Y, 3, 0, Math.PI * 2)
          ctx.fill()
          pill(q.X, i === 0 ? q.Y + 16 : q.Y - 18, names[i], Lr.cable * (i === 0 ? 0.8 : 1), i === 2 ? 'accent' : 'muted')
        })
      }
      if (Lr.steep > 0.01 && inp.steepTap) {
        const [x, y] = inp.steepTap
        const g = RIO.field.grad(x, y)
        const [u, v] = stageOf(1, [x, y])
        const p = P(u, v, 0)
        const deg = (Math.atan(norm(g)) * 180) / Math.PI
        arrowFrom(ctx, P, u, v, (g[0] * RIO.arrow) / RIO.L, (g[1] * RIO.arrow) / RIO.L, acc(Lr.steep), 2.6)
        dot(ctx, p.X, p.Y, 5, '#ffffff', Lr.steep)
        pill(p.X, p.Y + 20, `inclinação ≈ ${fmt(deg, 0)}°`, Lr.steep, 'accent')
      }
      if (Lr.trailPick > 0.01 && inp.trailPick !== null) {
        const [x, y] = TRAIL_POINT
        const g = RIO.field.grad(x, y)
        const n = norm(g)
        const gu: Vec2 = [g[0] / n, g[1] / n]
        const [u, v] = stageOf(1, TRAIL_POINT)
        const len = 0.22
        const dirs: Vec2[] = [gu, [-gu[1], gu[0]], [0, 0], [-gu[0], -gu[1]]]
        if (inp.trailPick !== 2) {
          const dd = dirs[inp.trailPick]
          arrowFrom(ctx, P, u, v, dd[0] * len, dd[1] * len, ROSE, 2.4, Lr.trailPick)
        }
        // the switchback trail: zigzag around the uphill direction, ≈ 70° off ∇f
        ctx.save()
        ctx.globalAlpha = Lr.trailPick
        ctx.strokeStyle = SKY
        ctx.lineWidth = 2.6
        ctx.lineJoin = 'round'
        ctx.beginPath()
        let cu = u
        let cv = v
        let p = P(cu, cv, 0)
        ctx.moveTo(p.X, p.Y)
        for (let s = 0; s < 6; s++) {
          const [gx, gy] = RIO.field.grad(cu * RIO.L, cv * RIO.L)
          const gn = Math.hypot(gx, gy) || 1
          const side = s % 2 ? 1 : -1
          const a = side * 1.2
          const du = (Math.cos(a) * gx - Math.sin(a) * gy) / gn
          const dv = (Math.sin(a) * gx + Math.cos(a) * gy) / gn
          cu += du * 0.065
          cv += dv * 0.065
          p = P(cu, cv, 0)
          ctx.lineTo(p.X, p.Y)
        }
        ctx.stroke()
        ctx.restore()
      }
      if (Lr.dial > 0.01) {
        const [x, y] = TRAIL_POINT
        const g = RIO.field.grad(x, y)
        const n = norm(g)
        const base = Math.atan2(g[1], g[0])
        const a = base + inp.trailAngle
        const [u, v] = stageOf(1, TRAIL_POINT)
        const len = 0.2
        arrowFrom(ctx, P, u, v, Math.cos(a) * len, Math.sin(a) * len, SKY, 2.8, Lr.dial)
        // the angle arc between ∇f and the walking direction
        const c = P(u, v, 0)
        ctx.save()
        ctx.globalAlpha = Lr.dial * 0.8
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath()
        const r = scale * 0.07
        ctx.arc(c.X, c.Y, r, -base, -a, inp.trailAngle > 0)
        ctx.stroke()
        ctx.restore()
        const climb = n * Math.cos(inp.trailAngle)
        const tip = P(u + Math.cos(a) * len, v + Math.sin(a) * len, 0)
        pill(tip.X, tip.Y - 18, `${climb >= 0 ? 'sobe' : 'desce'} ${fmt(Math.abs(climb) * 100, 0)} m a cada 100 m`, Lr.dial, 'sky')
      }
      if (Lr.vecs > 0.01) {
        const [u, v] = stageOf(2, P1)
        const s = BOWL.arrow / BOWL.L
        // components head to tail: 2 along x, then 6 along y
        dashedArrow(ctx, P, u, v, 2 * s, 0, `rgba(255,255,255,${0.7 * Lr.vecs})`)
        dashedArrow(ctx, P, u + 2 * s, v, 0, 6 * s, `rgba(255,255,255,${0.7 * Lr.vecs})`)
        const ex = P(u + s, v, 0)
        pill(ex.X, ex.Y + 14, '∂f/∂x = 2', Lr.vecs, 'muted')
        const ey = P(u + 2 * s, v + 3 * s, 0)
        pill(ey.X + 10, ey.Y, '∂f/∂y = 6', Lr.vecs, 'muted', 'left')
        const solvedVec = inp.solveStep !== 'vec'
        const pk = inp.pick?.step === 'vec' ? inp.pick : null
        if (pk?.show?.vec && !pk.ok) arrowFrom(ctx, P, u, v, pk.show.vec[0] * s, pk.show.vec[1] * s, ROSE, 2.6, Lr.vecs)
        if (solvedVec || pk?.ok) {
          arrowFrom(ctx, P, u, v, 2 * s, 6 * s, acc(1), 3, Lr.vecs)
          const t = P(u + 2 * s, v + 6 * s, 0)
          pill(t.X, t.Y - 16, '∇f = (2, 6)', Lr.vecs, 'accent')
        }
      }
      if (Lr.tri > 0.01) {
        const [u, v] = stageOf(2, P1)
        const s = BOWL.arrow / BOWL.L
        const pk = inp.pick?.step === 'len' ? inp.pick : null
        const a = P(u, v, 0)
        const b = P(u + 2 * s, v + 6 * s, 0)
        ctx.save()
        ctx.globalAlpha = Lr.tri
        ctx.fillStyle = acc(0.1)
        const c = P(u + 2 * s, v, 0)
        ctx.beginPath()
        ctx.moveTo(a.X, a.Y)
        ctx.lineTo(c.X, c.Y)
        ctx.lineTo(b.X, b.Y)
        ctx.closePath()
        ctx.fill()
        if (pk?.show?.len && !pk.ok) {
          // the wrong length laid along the arrow: it overshoots (or falls short)
          const L2 = Math.min(pk.show.len, 12) / Math.sqrt(40)
          const e = P(u + 2 * s * L2, v + 6 * s * L2, 0)
          ctx.strokeStyle = ROSE
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(a.X + 6, a.Y)
          ctx.lineTo(e.X + 6, e.Y)
          ctx.stroke()
          ctx.setLineDash([])
          pill(e.X + 10, e.Y, fmt(pk.show.len, 2), 1, 'rose', 'left')
        }
        ctx.restore()
        if (inp.solveStep !== 'len' || pk?.ok) pill((a.X + b.X) / 2 - 12, (a.Y + b.Y) / 2, '√40 ≈ 6,32', Lr.tri, 'accent', 'right')
      }
      if (Lr.dir > 0.01) {
        const [u, v] = stageOf(2, P1)
        const s = BOWL.arrow / BOWL.L
        const pk = inp.pick?.step === 'dir' ? inp.pick : null
        const solved = inp.solveStep === null
        arrowFrom(ctx, P, u, v, 2 * s, 6 * s, acc(1), 2.6, Lr.dir)
        const t = P(u + 2 * s, v + 6 * s, 0)
        pill(t.X, t.Y - 16, '∇f', Lr.dir, 'accent')
        const ul = Math.sqrt(40) * s * 1.05
        arrowFrom(ctx, P, u, v, U_DIR[0] * ul, U_DIR[1] * ul, SKY, 2.4, Lr.dir)
        const ut = P(u + U_DIR[0] * ul, v + U_DIR[1] * ul, 0)
        pill(ut.X + 12, ut.Y + 4, 'u', Lr.dir, 'sky', 'left')
        if (solved || pk?.ok) {
          // the shadow of ∇f on u: length ∇f·u = 6
          const foot = P(u + U_DIR[0] * 6 * s, v + U_DIR[1] * 6 * s, 0)
          ctx.save()
          ctx.globalAlpha = Lr.dir
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'
          ctx.setLineDash([3, 4])
          ctx.beginPath()
          ctx.moveTo(t.X, t.Y)
          ctx.lineTo(foot.X, foot.Y)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.strokeStyle = SKY
          ctx.lineWidth = 5
          ctx.globalAlpha = Lr.dir * 0.55
          const o = P(u, v, 0)
          ctx.beginPath()
          ctx.moveTo(o.X, o.Y)
          ctx.lineTo(foot.X, foot.Y)
          ctx.stroke()
          ctx.restore()
          pill(foot.X + 12, foot.Y + 12, 'sombra = 6', Lr.dir, 'sky', 'left')
        } else if (pk?.show?.proj) {
          const e = P(u + U_DIR[0] * Math.min(pk.show.proj, 9) * s, v + U_DIR[1] * Math.min(pk.show.proj, 9) * s, 0)
          dot(ctx, e.X, e.Y, 4.5, ROSE, Lr.dir)
          pill(e.X + 10, e.Y + 12, fmt(pk.show.proj, 2), Lr.dir, 'rose', 'left')
        }
      }
      if (Lr.solo > 0.01) {
        const [u, v] = stageOf(2, P3)
        const s = BOWL.arrow / BOWL.L
        // snapping grid for the arrow tip
        ctx.save()
        ctx.globalAlpha = Lr.solo * 0.35
        ctx.fillStyle = '#ffffff'
        for (let a = -6; a <= 6; a++)
          for (let b = -6; b <= 6; b++) {
            const q = P(u + a * s, v + b * s, 0)
            ctx.fillRect(q.X - 0.75, q.Y - 0.75, 1.5, 1.5)
          }
        ctx.restore()
        if (inp.soloDone) {
          arrowFrom(ctx, P, u, v, P3_ANSWER[0] * s, P3_ANSWER[1] * s, acc(1), 3, Lr.solo)
        } else if (inp.v[0] || inp.v[1]) {
          arrowFrom(ctx, P, u, v, inp.v[0] * s, inp.v[1] * s, SKY, 2.8, Lr.solo)
        }
        const vv = inp.soloDone ? P3_ANSWER : inp.v
        const tip = P(u + vv[0] * s, v + vv[1] * s, 0)
        pill(tip.X, tip.Y - 18, `(${fmt(vv[0])}, ${fmt(vv[1])})`, Lr.solo, inp.soloDone ? 'accent' : 'sky')
      }
      if (Lr.stepArrow > 0.01) {
        const [u, v] = stageOf(2, DESCENT_START)
        const g = BOWL.field.grad(...DESCENT_START)
        const n = norm(g)
        const z = zAt(u, v)
        const len = 0.28
        const at = (du: number, dv: number) => {
          const a = P(u, v, z)
          const b = P(u + du, v + dv, zAt(u + du, v + dv))
          return [a, b] as const
        }
        if (inp.eseChoice !== null && inp.eseChoice !== 1) {
          const dirs: Vec2[] = [
            [g[0] / n, g[1] / n],
            [0, 0],
            [-g[1] / n, g[0] / n],
            [-u / Math.hypot(u, v), -v / Math.hypot(u, v)],
          ]
          const dd = dirs[inp.eseChoice]
          const [a, b] = at(dd[0] * len, dd[1] * len)
          ctx.globalAlpha = Lr.stepArrow
          drawArrow2(ctx, a.X, a.Y, b.X, b.Y, ROSE, 2.4)
          ctx.globalAlpha = 1
        }
        const [a, b] = at((-g[0] / n) * len, (-g[1] / n) * len)
        ctx.globalAlpha = Lr.stepArrow
        drawArrow2(ctx, a.X, a.Y, b.X, b.Y, acc(1), 3)
        ctx.globalAlpha = 1
        pill(b.X, b.Y + 18, '−∇f', Lr.stepArrow, 'accent')
      }
      let walkPos: Vec2 | null = null
      const wk = walkRef.current
      if (Lr.descent > 0.01 && wk) {
        const elapsed = reduced ? 1e9 : now - wk.t0
        const prog = Math.max(0, Math.min(wk.path.length - 1, elapsed / 110))
        const kk = Math.floor(prog)
        const fr = prog - kk
        ctx.save()
        // keep a runaway walk inside the map
        ctx.beginPath()
        ;[P(-1, -1, 0), P(1, -1, 0), P(1, 1, 0), P(-1, 1, 0)].forEach((c, i) => (i ? ctx.lineTo(c.X, c.Y) : ctx.moveTo(c.X, c.Y)))
        ctx.closePath()
        ctx.clip()
        ctx.globalAlpha = Lr.descent
        ctx.strokeStyle = wk.status === 'divergiu' ? ROSE : SKY
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.beginPath()
        for (let s = 0; s <= kk; s++) {
          const [u, v] = stageOf(2, wk.path[s])
          const p = P(u, v, 0)
          if (s) ctx.lineTo(p.X, p.Y)
          else ctx.moveTo(p.X, p.Y)
        }
        const a = wk.path[kk]
        const b = wk.path[Math.min(kk + 1, wk.path.length - 1)]
        walkPos = [a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr]
        const [wu, wv] = stageOf(2, walkPos)
        const wp = P(wu, wv, 0)
        ctx.lineTo(wp.X, wp.Y)
        ctx.stroke()
        for (let s = 0; s <= kk; s++) {
          const [u, v] = stageOf(2, wk.path[s])
          const p = P(u, v, 0)
          ctx.fillStyle = 'rgba(255,255,255,0.75)'
          ctx.fillRect(p.X - 1.5, p.Y - 1.5, 3, 3)
        }
        ctx.restore()
        const bottom = P(0, 0, 0)
        dot(ctx, bottom.X, bottom.Y, 3, 'rgba(255,255,255,0.8)', Lr.descent)
        if (inp.stepId === 'e-se' && inp.scene === 3) pill(bottom.X, bottom.Y + 16, 'erro mínimo', Lr.descent, 'muted')
      }
      if (Lr.ascent > 0.01) {
        const prog = reduced ? 1 : Math.min(1, ((now / 1000) % 9) / 6)
        const n = Math.max(2, Math.floor(ASCENT_PATH.length * prog))
        ctx.save()
        ctx.globalAlpha = Lr.ascent
        ctx.strokeStyle = acc(1)
        ctx.shadowColor = acc(1)
        ctx.shadowBlur = 10
        ctx.lineWidth = 2.6
        ctx.lineCap = 'round'
        ctx.beginPath()
        for (let s = 0; s < n; s += 2) {
          const p = surf(0, ASCENT_PATH[s][0], ASCENT_PATH[s][1])
          if (s) ctx.lineTo(p.X, p.Y)
          else ctx.moveTo(p.X, p.Y)
        }
        ctx.stroke()
        ctx.restore()
        const st = surf(0, HIKER_START[0], HIKER_START[1])
        dot(ctx, st.X, st.Y, 3.5, '#ffffff', Lr.ascent)
      }

      // ---- gradient arrow at the hiker (map views)
      if (d.grad > 0.01 && d.hiker > 0.01) {
        const g = gMath(hu, hv)
        const s = terr.arrow / terr.L
        const gu = g[0] * s
        const gv = g[1] * s
        const z = zAt(hu, hv) * flat
        if (d.comps > 0.01) {
          dashedArrow(ctx, P, hu, hv, gu, 0, `rgba(255,255,255,${0.75 * d.comps})`, z)
          dashedArrow(ctx, P, hu + gu, hv, 0, gv, `rgba(125,211,252,${0.9 * d.comps})`, z)
        }
        if (Math.hypot(gu, gv) > 0.004) {
          arrowFrom(ctx, P, hu, hv, gu, gv, acc(1), 3, d.grad, z)
          if (d.levelHi > 0.3) {
            // right-angle mark between ∇f and the level curve
            const n = Math.hypot(gu, gv)
            const a: Vec2 = [(gu / n) * 0.035, (gv / n) * 0.035]
            const b: Vec2 = [-a[1], a[0]]
            const p1 = P(hu + a[0], hv + a[1], z)
            const p2 = P(hu + a[0] + b[0], hv + a[1] + b[1], z)
            const p3 = P(hu + b[0], hv + b[1], z)
            ctx.strokeStyle = `rgba(255,255,255,${0.8 * d.levelHi * d.grad})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(p1.X, p1.Y)
            ctx.lineTo(p2.X, p2.Y)
            ctx.lineTo(p3.X, p3.Y)
            ctx.stroke()
          }
        }
      }

      // ---- the hiker (or point P)
      if (d.hiker > 0.01) {
        const [u, v] = walkPos ? stageOf(2, walkPos) : [hu, hv]
        const z = zAt(u, v)
        const top = P(u, v, z * flat)
        const ground = P(u, v, 0)
        if (d.mesh > 0.05 && flat > 0.2) {
          ctx.strokeStyle = `rgba(255,255,255,${0.35 * d.hiker * d.mesh})`
          ctx.lineWidth = 1
          ctx.setLineDash([2, 3])
          ctx.beginPath()
          ctx.moveTo(top.X, top.Y)
          ctx.lineTo(ground.X, ground.Y)
          ctx.stroke()
          ctx.setLineDash([])
        }
        dot(ctx, top.X, top.Y, 6.5, acc(1), d.hiker, true)
        dot(ctx, top.X, top.Y, 2.2, '#0a0b10', d.hiker)
        hikerPx.current = { X: top.X, Y: top.Y }
        if (inp.stepId === 'resolva') pill(top.X - 12, top.Y + 16, inp.scene === 2 ? 'P (−2; 0,5)' : 'P (1, 1)', d.hiker, 'muted', 'right')
      } else hikerPx.current = { X: -999, Y: -999 }
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  // ---------------------------------------------------------------- input
  type Mode = 'rotate' | 'hiker' | 'hikerNoRotate' | 'hikerMap' | 'tap' | 'dial' | 'arrow' | null
  const mode: Mode =
    stepId === 'imagine'
      ? scene === 0
        ? 'rotate'
        : 'hiker'
      : stepId === 'preveja'
        ? scene === 0
          ? 'rotate'
          : null
        : stepId === 'entenda'
          ? scene <= 2
            ? 'hikerNoRotate'
            : 'hikerMap'
          : stepId === 'mundo-real'
            ? scene === 0
              ? 'rotate'
              : scene === 1
                ? 'tap'
                : scene === 3
                  ? 'dial'
                  : null
            : stepId === 'resolva'
              ? prob.id === 'p3' && !inputs.soloDone
                ? 'arrow'
                : null
              : stepId === 'conclua' || (stepId === 'e-se' && scene === 0)
                ? 'rotate'
                : null

  const drag = useRef<{ kind: 'rotate' | 'hiker' | 'abs'; x: number; y: number } | null>(null)
  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const moveHikerTo = (u: number, v: number) => {
    const lim = 0.97
    setLive({ hx: Math.max(-lim, Math.min(lim, u)) * MOUNTAIN.L, hy: Math.max(-lim, Math.min(lim, v)) * MOUNTAIN.L })
  }
  const apply = (x: number, y: number, dx: number, dy: number) => {
    const cam = camRef.current
    const dg = drag.current
    if (!cam || !dg) return
    const lv = liveRef.current
    if (dg.kind === 'rotate') {
      yawRef.current += dx * 0.008
      return
    }
    if (mode === 'tap') return
    if (mode === 'dial') {
      const [gu, gv] = groundFromScreen(cam, x, y)
      const [tu, tv] = stageOf(1, TRAIL_POINT)
      const g = RIO.field.grad(...TRAIL_POINT)
      let a = Math.atan2(gv - tv, gu - tu) - Math.atan2(g[1], g[0])
      a = Math.atan2(Math.sin(a), Math.cos(a))
      setLive({ trailAngle: a })
      return
    }
    if (mode === 'arrow') {
      const [gu, gv] = groundFromScreen(cam, x, y)
      const [pu, pv] = stageOf(2, P3)
      const s = BOWL.arrow / BOWL.L
      const vx = Math.max(-6, Math.min(6, Math.round((gu - pu) / s)))
      const vy = Math.max(-6, Math.min(6, Math.round((gv - pv) / s)))
      if (vx !== lv.vx || vy !== lv.vy) setLive({ vx, vy })
      return
    }
    if (dg.kind === 'abs') {
      const [u, v] = groundFromScreen(cam, x, y)
      moveHikerTo(u, v)
      return
    }
    const [du, dv] = groundDelta(cam, dx, dy)
    const hx = (lv.hx ?? HIKER_START[0]) / MOUNTAIN.L
    const hy = (lv.hy ?? HIKER_START[1]) / MOUNTAIN.L
    moveHikerTo(hx + du, hy + dv)
  }
  const onDown = (e: React.PointerEvent) => {
    if (!mode) return
    const p = local(e)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const near = Math.hypot(p.x - hikerPx.current.X, p.y - hikerPx.current.Y) < 48
    let kind: 'rotate' | 'hiker' | 'abs' = 'rotate'
    if (mode === 'hiker') kind = near ? 'hiker' : 'rotate'
    else if (mode === 'hikerNoRotate') kind = 'hiker'
    else if (mode === 'hikerMap' || mode === 'dial' || mode === 'arrow') kind = 'abs'
    drag.current = { kind, x: p.x, y: p.y }
    draggingRef.current = kind !== 'rotate'
    if (mode === 'tap') {
      const cam = camRef.current
      if (cam) {
        const [u, v] = groundFromScreen(cam, p.x, p.y)
        if (Math.abs(u) <= 1 && Math.abs(v) <= 1) setAnswer('steepTap', [u * RIO.L, v * RIO.L])
      }
      return
    }
    if (kind === 'abs') apply(p.x, p.y, 0, 0)
  }
  const onMove = (e: React.PointerEvent) => {
    const dg = drag.current
    if (!dg) return
    const p = local(e)
    const dx = p.x - dg.x
    const dy = p.y - dg.y
    dg.x = p.x
    dg.y = p.y
    if (dx || dy) apply(p.x, p.y, dx, dy)
  }
  const onUp = () => {
    drag.current = null
    draggingRef.current = false
  }

  // ---------------------------------------------------------------- overlays
  const hx = L.hx ?? HIKER_START[0]
  const hy = L.hy ?? HIKER_START[1]
  const h = MOUNTAIN.field.f(hx, hy)
  const [gx, gy] = MOUNTAIN.field.grad(hx, hy)
  const readout: { big: React.ReactNode; small?: React.ReactNode } | null =
    stepId === 'imagine' && scene >= 1
      ? { big: `${fmt(toKm(h), 0)} m`, small: `altura · recorde ${fmt(toKm(Math.max(L.best ?? 0, h)), 0)} m` }
      : stepId === 'entenda'
        ? {
            big: (
              <span className="flex flex-col gap-0.5">
                {scene !== 2 && <Row k="∂f/∂x" v={fmt(gx, 2)} hi={scene <= 1} />}
                {scene >= 2 && <Row k="∂f/∂y" v={fmt(gy, 2)} hi={scene === 2} />}
                {scene >= 3 && <Row k="|∇f|" v={fmt(Math.hypot(gx, gy), 2)} hi />}
              </span>
            ),
            small: scene <= 2 ? `fatia ${scene === 2 ? 'norte–sul' : 'leste–oeste'} · altura ${fmt(toKm(h), 0)} m` : `altura ${fmt(toKm(h), 0)} m`,
          }
        : stepId === 'mundo-real' && scene === 3
          ? { big: `θ = ${fmt((Math.abs(inputs.trailAngle) * 180) / Math.PI, 0)}°`, small: 'ângulo com ∇f' }
          : stepId === 'e-se' && scene >= 1 && walk
            ? { big: `η = ${fmt(walk.eta, 2)}`, small: walk.status === 'divergiu' ? 'saiu do vale!' : walk.status === 'chegou' ? `chegou em ${walk.path.length - 1} passos` : `${walk.path.length - 1} passos e ainda descendo` }
            : null

  const badge =
    stepId === 'mundo-real' ? 'forma simplificada · alturas reais' : stepId === 'resolva' || stepId === 'e-se' ? 'f(x, y) = x² + 3y²' : 'exemplo imaginado'
  const aria =
    stepId === 'imagine'
      ? `Montanha imaginária em 3D. Trilheiro a ${toKm(h)} metros.`
      : stepId === 'preveja'
        ? scene === 0
          ? 'Montanha fatiada em anéis de mesma altura'
          : 'Mapa de curvas de nível da montanha, com as trilhas A e B'
        : stepId === 'entenda'
          ? `Fatia da montanha e gradiente no ponto do trilheiro: derivada em x ${fmt(gx, 2)}, em y ${fmt(gy, 2)}`
          : stepId === 'mundo-real'
            ? 'Relevo simplificado do Pão de Açúcar e do Morro da Urca, com o caminho do bondinho'
            : stepId === 'resolva'
              ? 'Vale f igual a x ao quadrado mais 3 y ao quadrado, com o ponto P e setas do gradiente'
              : stepId === 'e-se'
                ? 'Vale coberto de neblina e o caminho da descida do gradiente'
                : 'Montanha com o caminho de subida mais íngreme até o cume'

  const notebook = stepId === 'resolva'
  const shownP3 = Boolean((answers.shown as Record<string, boolean> | undefined)?.p3)

  return (
    <Panel>
      <div
        ref={wrapRef}
        className={cn('absolute inset-0', mode && (mode === 'tap' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'))}
        style={{ touchAction: mode ? 'none' : 'auto' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>

      <AnimatePresence>
        {readout && (
          <motion.div
            key="readout"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="pointer-events-none absolute left-3 top-3 z-10 rounded-2xl bg-black/50 px-3 py-2 backdrop-blur-xl"
          >
            <div className="font-mono text-[17px] leading-tight tabular-nums text-white">{readout.big}</div>
            {readout.small && <p className="mt-1 text-[11.5px] leading-none text-white/55">{readout.small}</p>}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        key={badge}
        initial={{ opacity: 0 }}
        animate={{ opacity: stepId === 'conclua' ? 0 : 1 }}
        className="pointer-events-none absolute right-3 top-3 z-10 max-w-[46%] rounded-full bg-black/45 px-2.5 py-1 text-right text-[11px] text-white/60 backdrop-blur-xl"
      >
        {badge}
      </motion.div>

      <AnimatePresence>
        {notebook && <Notebook key="nb" scene={scene} solve={solve} shownP3={shownP3} />}
        {stepId === 'conclua' && (
          <motion.div
            key="prize"
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.6, duration: 0.7 } }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-3 bottom-4 z-10 rounded-2xl bg-black/45 px-3 py-2.5 text-center text-[17px] text-white backdrop-blur-xl"
          >
            <Tex block say="gradiente de f igual a derivada parcial de f em x, derivada parcial de f em y">{'\\nabla f = \\left(\\dfrac{\\partial f}{\\partial x},\\ \\dfrac{\\partial f}{\\partial y}\\right)'}</Tex>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}

function Row({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-[12.5px] text-white/50">{k}</span>
      <span className={cn('tabular-nums', hi ? 'text-[#f5d061]' : 'text-white/85')}>{v}</span>
    </span>
  )
}

/** The caderno: the solution writes itself, one line per correct step. */
function Notebook({ scene, solve, shownP3 }: { scene: number; solve: Record<string, number>; shownP3: boolean }) {
  const prob = PROBLEMS[Math.min(scene, PROBLEMS.length - 1)]
  const done = solve[prob.id] ?? 0
  const lines = prob.id === 'p3' ? (done >= 1 || shownP3 ? [{ line: P3_LINE, lineSay: P3_SAY }] : []) : prob.steps.slice(0, done)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="pointer-events-none absolute inset-x-2 bottom-2 z-10 h-[min(40%,190px)] overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0a0b11]/90 px-3 py-2.5 backdrop-blur-xl"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={prob.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex h-full flex-col">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
            Caderno · problema {Math.min(scene, 2) + 1} de {PROBLEMS.length}
            {prob.id === 'p3' && ' · sozinho'}
          </p>
          <div className="mt-1 text-[15px] text-white/90">
            <Tex say={prob.titleSay}>{prob.title}</Tex>
          </div>
          <div className="mt-1 flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden text-[13.5px] text-white/80">
            {lines.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn('whitespace-nowrap', i === lines.length - 1 && 'text-white')}
              >
                <Tex say={st.lineSay}>{st.line}</Tex>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ------------------------------------------------------------ drawing helpers

type Proj = (u: number, v: number, z: number) => Projected

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 1, halo = false) {
  if (a < 0.01) return
  ctx.save()
  ctx.globalAlpha = a
  if (halo) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4)
    g.addColorStop(0, color)
    g.addColorStop(1, 'transparent')
    ctx.globalAlpha = a * 0.45
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r * 3.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = a
  }
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawArrow2(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width: number) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 1) return
  const a = Math.atan2(y1 - y0, x1 - x0)
  const h = Math.min(10, len * 0.5)
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

function arrowFrom(ctx: CanvasRenderingContext2D, P: Proj, u: number, v: number, du: number, dv: number, color: string, width: number, a = 1, z = 0) {
  if (a < 0.01) return
  const p = P(u, v, z)
  const q = P(u + du, v + dv, z)
  ctx.save()
  ctx.globalAlpha = a
  drawArrow2(ctx, p.X, p.Y, q.X, q.Y, color, width)
  ctx.restore()
}

function dashedArrow(ctx: CanvasRenderingContext2D, P: Proj, u: number, v: number, du: number, dv: number, color: string, z = 0) {
  const p = P(u, v, z)
  const q = P(u + du, v + dv, z)
  if (Math.hypot(q.X - p.X, q.Y - p.Y) < 2) return
  ctx.save()
  ctx.setLineDash([4, 4])
  drawArrow2(ctx, p.X, p.Y, q.X, q.Y, color, 1.6)
  ctx.restore()
}

function drawPill(ctx: CanvasRenderingContext2D, X: number, Y: number, text: string, a: number, tone: 'accent' | 'muted' | 'sky' | 'rose', align: 'center' | 'left' | 'right', W: number) {
  if (a < 0.02) return
  ctx.save()
  ctx.font = '500 11.5px ui-sans-serif, system-ui, -apple-system, "Geist", sans-serif'
  const w = ctx.measureText(text).width + 16
  let x = align === 'center' ? X - w / 2 : align === 'left' ? X : X - w
  x = Math.max(6, Math.min(W - w - 6, x))
  const y = Y - 11
  ctx.globalAlpha = a
  ctx.fillStyle = tone === 'accent' ? 'rgba(245,208,97,0.2)' : tone === 'sky' ? 'rgba(125,211,252,0.18)' : tone === 'rose' ? 'rgba(253,164,175,0.2)' : 'rgba(0,0,0,0.55)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, 22, 11)
  ctx.fill()
  ctx.fillStyle = tone === 'accent' ? '#fde9a8' : tone === 'sky' ? '#d6f0ff' : tone === 'rose' ? '#ffe0e5' : 'rgba(255,255,255,0.82)'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 8, Y)
  ctx.restore()
}

/** The vertical slicing plane through the hiker, the cut curve and its tangent. */
function drawPlane(ctx: CanvasRenderingContext2D, P: Proj, zAt: (u: number, v: number) => number, hu: number, hv: number, d: View, slopeScale: number, pickSlope?: number, pickOk?: boolean) {
  const a = d.plane
  const dir: Vec2 = [Math.cos(d.planeAng), Math.sin(d.planeAng)]
  // t range inside the square [−1, 1]²
  let t0 = -Infinity
  let t1 = Infinity
  for (let i = 0; i < 2; i++) {
    const p = i ? hv : hu
    const q = dir[i]
    if (Math.abs(q) < 1e-6) continue
    const lo = (-1 - p) / q
    const hi = (1 - p) / q
    t0 = Math.max(t0, Math.min(lo, hi))
    t1 = Math.min(t1, Math.max(lo, hi))
  }
  if (!(t1 > t0)) return
  const at = (t: number): Vec2 => [hu + dir[0] * t, hv + dir[1] * t]
  const top = 0.85
  const c = [P(...at(t0), 0), P(...at(t1), 0), P(...at(t1), top), P(...at(t0), top)]
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = 'rgba(125,211,252,0.07)'
  ctx.strokeStyle = 'rgba(125,211,252,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  c.forEach((p, i) => (i ? ctx.lineTo(p.X, p.Y) : ctx.moveTo(p.X, p.Y)))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // the cut: a one-variable curve
  ctx.strokeStyle = SKY
  ctx.lineWidth = 2.6
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const n = 70
  for (let s = 0; s <= n; s++) {
    const t = t0 + ((t1 - t0) * s) / n
    const [u, v] = at(t)
    const p = P(u, v, zAt(u, v))
    if (s) ctx.lineTo(p.X, p.Y)
    else ctx.moveTo(p.X, p.Y)
  }
  ctx.stroke()
  // tangent line at the hiker: slope = derivative along the slice
  const z0 = zAt(hu, hv)
  const e = 1e-4
  const slope = (zAt(hu + dir[0] * e, hv + dir[1] * e) - zAt(hu - dir[0] * e, hv - dir[1] * e)) / (2 * e)
  const tan = (sl: number, color: string, width: number) => {
    const p = P(...at(-0.32), z0 - sl * 0.32)
    const q = P(...at(0.32), z0 + sl * 0.32)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(p.X, p.Y)
    ctx.lineTo(q.X, q.Y)
    ctx.stroke()
  }
  if (pickSlope !== undefined && !pickOk) tan(pickSlope * slopeScale, ROSE, 2.4)
  tan(slope, pickSlope !== undefined && !pickOk ? 'rgba(255,255,255,0.0)' : 'rgba(255,255,255,0.92)', 2)
  ctx.restore()
}
