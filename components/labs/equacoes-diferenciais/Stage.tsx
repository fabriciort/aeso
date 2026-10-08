'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand } from 'lucide-react'
import { euler, rk4Step, type Rhs } from '@/lib/math/ode'
import { fmt, texNum, toPx, type Frame, type Viewport } from '@/lib/math/view'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import { Tex } from '@/components/math/Tex'
import { drawAxes, drawDot, drawFunction, drawArrow, INK, prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import DragSurface from '@/components/instruments/DragSurface'
import { Panel, type StageProps } from '../runtime'
import {
  AGE_ANSWER,
  AGE_MAX,
  asSketch,
  carbon,
  coffee,
  coolF,
  EULER_FIRST_LINE,
  EULER_STEPS,
  eulerMaxError,
  HALF_LIFE,
  HAND,
  K_LOG,
  lake,
  logF,
  P0_LOG,
  R_LOG,
  ROOM,
  SEP_FIRST_LINE,
  SEPARATION,
  SKETCH_N,
  T10,
  T0,
  wrongVisual,
  type OdeLive,
  type Sketch,
  type WrongVisual,
} from './shared'

// O Palco contínuo de "A equação que prevê o futuro".
//
// Um único plano (t, y) atravessa o laboratório inteiro. A janela (Viewport)
// desliza e dá zoom entre o café (minutos, °C), o carbono-14 (anos, %) e o
// lago (meses, peixes); campos de direções aparecem e somem com fade, as
// curvas se desenham sozinhas e as partículas seguem as setas. A cada quadro
// o estado exibido se aproxima do alvo da Etapa/Cena: nada troca com corte.

// ------------------------------------------------------------ canais

const BASE = {
  // janela: x0 = ox·sx, largura sx (escala log), idem para y
  ox: -0.045,
  sx: 67,
  oy: -0.054,
  sy: 112,
  fb: 0, // fração de baixo reservada ao caderno
  pr: 0, // espaço à direita para a linha de fase
  cupA: 0,
  cupX: 0.42,
  cupY: 0.5,
  cupS: 1,
  thermoT: 20,
  follow: 0,
  axes: 0,
  wCool: 1,
  wDecay: 0,
  wLog: 0,
  wLong: 0,
  start: 0,
  room: 0,
  sketch: 0,
  sketchFaint: 0,
  exact: 0,
  exactUpTo: 0,
  tangents: 0,
  asym: 0,
  fCool: 0,
  fDecay: 0,
  fLog: 0,
  bCool: 0,
  bDecay: 0,
  bLog: 0,
  pCool: 0,
  pLog: 0,
  probe: 0,
  probeT: 8,
  probeY: 70,
  solHi: 0,
  decay: 0,
  decayUpTo: 0,
  halves: 0,
  family: 0,
  age: 0,
  ageX: 4000,
  ageHit: 0,
  fam2: 0,
  sol: 0,
  t10: 0,
  wrong: 0,
  hand: 0,
  handN: 0,
  eulerAuto: 0,
  eulerUpTo: 10,
  errBar: 0,
  euler: 0,
  h: 5,
  solo: 0,
  soloT: 30,
  soloCheck: 0,
  logc: 0,
  logUpTo: 0,
  ghost: 0,
  phase: 0,
  eqPulse: 0,
  logStart: 0,
  capLine: 0,
  finale: 0,
}
type Key = keyof typeof BASE
type Ch = Record<Key, number>
const KEYS = Object.keys(BASE) as Key[]
/** Canais que andam a velocidade constante (curvas "se desenhando", tracinhos nascendo). */
const RATE: Partial<Record<Key, number>> = { exactUpTo: 45, decayUpTo: 9000, logUpTo: 9, eulerUpTo: 28, bCool: 0.5, bDecay: 0.8, bLog: 0.8, halves: 0.55 }
const LOG_KEYS: Key[] = ['sx', 'sy', 'h']

const COFFEE = { ox: -3 / 67, sx: 67, oy: -6 / 112, sy: 112 }
const COFFEE_LONG = { ox: -12 / 262, sx: 262, oy: -6 / 112, sy: 112 }
const CARBON = { ox: -1300 / 27300, sx: 27300, oy: -7 / 119, sy: 119 }
const LAKE = { ox: -1 / 26, sx: 26, oy: -90 / 1650, sy: 1650 }
const UNSTABLE = { oy: -80 / 190, sy: 190 }

const SKY = '#7dd3fc'
const ROSE = '#fb7185'
const GOOD = '#6ee7b7'

interface Inputs {
  stepId: string
  scene: number
  probe: { t: number; T: number }
  age: number
  h: number
  soloT: number
  soloShown: boolean
  sepStep: number
  eulerStep: number
  ageFound: boolean
  wrong: boolean
  eqAnswered: boolean
}

function target(p: Inputs): Ch {
  const g: Ch = { ...BASE }
  const coffeeWorld = () => Object.assign(g, COFFEE, { axes: 1, wCool: 1, wDecay: 0, wLog: 0 })
  const cupCorner = () => Object.assign(g, { cupA: 1, cupX: 0.71, cupY: 0.3, cupS: 0.42 })
  switch (p.stepId) {
    case 'imagine':
      coffeeWorld()
      g.cupA = 1
      g.thermoT = T0
      if (p.scene === 0) g.axes = 0
      else {
        cupCorner()
        g.start = 1
        g.room = 1
        g.sketch = p.scene === 2 ? 1 : 0
      }
      break
    case 'preveja':
      coffeeWorld()
      cupCorner()
      g.thermoT = p.scene === 0 ? T0 : coffee(60)
      g.start = 1
      g.room = 1
      g.sketch = 1
      if (p.scene >= 1) {
        g.exact = 1
        g.exactUpTo = 64
        g.sketchFaint = 1
        g.follow = p.scene === 1 || p.scene === 3 ? 1 : 0
      }
      if (p.scene === 1) g.tangents = 1
      if (p.scene === 3) Object.assign(g, COFFEE_LONG, { wLong: 1, exactUpTo: 252, asym: 1, sketch: 0.6 })
      break
    case 'entenda':
      coffeeWorld()
      g.room = 1
      if (p.scene <= 1) Object.assign(g, { probe: 1, probeT: p.probe.t, probeY: p.probe.T })
      if (p.scene >= 2) Object.assign(g, { fCool: 1, bCool: 1 })
      if (p.scene === 3) g.pCool = 1
      if (p.scene === 4) Object.assign(g, { fCool: 0.6, exact: 1, exactUpTo: 64, solHi: 1, start: 1, pCool: 0.3 })
      break
    case 'mundo-real':
      Object.assign(g, CARBON, { axes: 1, wCool: 0, wDecay: 1, fDecay: p.scene === 0 ? 1 : 0.4, bDecay: 1 })
      if (p.scene >= 1) Object.assign(g, { decay: 1, decayUpTo: 27000, halves: 1 })
      if (p.scene === 2) Object.assign(g, { age: 1, ageX: p.age, ageHit: p.ageFound ? 1 : 0 })
      if (p.scene === 3) Object.assign(g, { age: 1, ageX: AGE_ANSWER, ageHit: 1, family: 1 })
      break
    case 'resolva': {
      coffeeWorld()
      g.room = 1
      g.start = 1
      const s = p.sepStep
      const e = p.eulerStep
      if (p.scene === 0) {
        Object.assign(g, { fb: 0.32, fCool: 0.22, bCool: 1 })
        if (s >= 2) g.fam2 = s >= 4 ? 0.3 : 1
        if (s >= 4) g.sol = 1
        if (s >= 5) g.t10 = 1
      }
      if (p.scene === 1) {
        Object.assign(g, { fb: 0.32, exact: 0.3, exactUpTo: 64, hand: 1, handN: e })
        if (e >= 2) Object.assign(g, { exact: 1, eulerAuto: 1, eulerUpTo: 64, errBar: 1 })
      }
      if (p.scene === 2) {
        Object.assign(g, { exact: 1, exactUpTo: 64, euler: 1, h: p.h })
        if (p.h >= 30) Object.assign(g, UNSTABLE)
      }
      if (p.scene === 3) Object.assign(g, { exact: 1, exactUpTo: 64, solo: 1, soloT: p.soloT, soloCheck: p.soloShown ? 1 : 0 })
      g.wrong = p.wrong ? 1 : 0
      break
    }
    case 'e-se':
      Object.assign(g, LAKE, { axes: 1, wCool: 0, wLog: 1, capLine: 1, logStart: 1 })
      if (p.scene >= 1) Object.assign(g, { logc: 1, logUpTo: 26, fLog: 1, bLog: 1 })
      if (p.scene === 1) g.ghost = 1
      if (p.scene >= 2) Object.assign(g, { phase: 1, pr: 1, pLog: 1 })
      if (p.scene === 3) g.eqPulse = p.eqAnswered ? 1 : 0
      break
    case 'conclua':
      coffeeWorld()
      Object.assign(g, { room: 1, fCool: 0.35, bCool: 1, finale: 1, exact: 1, exactUpTo: 64 })
      break
  }
  return g
}

function ease(d: Ch, t: Ch, dt: number, reduced: boolean) {
  const k = 1 - Math.exp(-dt * 7)
  for (const key of KEYS) {
    const a = d[key]
    const b = t[key]
    if (reduced || a === b) d[key] = b
    else if (RATE[key]) {
      const step = RATE[key]! * dt
      d[key] = Math.abs(b - a) <= step ? b : a + Math.sign(b - a) * step
    } else if (LOG_KEYS.includes(key)) d[key] = Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * k)
    else d[key] = a + (b - a) * k
  }
}

// ------------------------------------------------------------ partículas

interface Particle {
  kind: 'cool' | 'log' | 'flow'
  t: number
  y: number
  trail: number[]
  delay: number
  age: number
  done: number // segundos desde que terminou (−1 = ainda andando)
  cold: boolean
}
const SPEED = { cool: 12, log: 5, flow: 15 }
const END = { cool: 63, log: 25.5, flow: 63 }

function advance(p: Particle, dt: number) {
  if (p.delay > 0) {
    p.delay -= dt
    return
  }
  p.age += dt
  if (p.done >= 0) {
    p.done += dt
    return
  }
  const f: Rhs = p.kind === 'log' ? logF : coolF
  const sub = p.kind === 'log' ? 0.1 : 0.5
  let left = SPEED[p.kind] * dt
  while (left > 1e-9 && p.done < 0) {
    const h = Math.min(left, sub)
    p.y = rk4Step(f, p.t, p.y, h)
    p.t += h
    left -= h
    p.trail.push(p.t, p.y)
    if (p.t >= END[p.kind]) p.done = 0
  }
}

// ------------------------------------------------------------ Palco

const emptySketch = (): Sketch => Array.from({ length: SKETCH_N }, () => null)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const num = (v: unknown) => (typeof v === 'number' ? v : 0)

type Mode = 'draw' | 'probe' | 'dropCool' | 'dropLog' | 'age' | 'solo' | null

export default function OdeStage({ lab, stepId, scene, answers, setAnswer, live, setLive }: StageProps) {
  const L = live as Partial<OdeLive>
  const accent = lab.accent
  const probe = L.probe ?? { t: 8, T: 70 }
  const age = L.age ?? 4000
  const h = L.h ?? 5
  const soloT = L.soloT ?? 30
  const soloShown = L.soloChecked !== null && L.soloChecked !== undefined && L.soloChecked === soloT
  const sepStep = num(answers.sepStep)
  const eulerStep = num(answers.eulerStep)
  const ageFound = typeof answers.ageFound === 'number'
  const wrongVis = stepId === 'resolva' ? wrongVisual(L.wrong ?? null) : undefined
  const inputs: Inputs = {
    stepId,
    scene,
    probe,
    age,
    h,
    soloT,
    soloShown,
    sepStep,
    eulerStep,
    ageFound,
    wrong: Boolean(wrongVis),
    eqAnswered: answers.eqPick !== undefined,
  }
  const key = JSON.stringify(inputs)
  const tgt = useMemo(() => target(JSON.parse(key) as Inputs), [key])
  const tgtRef = useRef(tgt)
  tgtRef.current = tgt
  const disp = useRef<Ch | null>(null)
  const geo = useRef<{ view: Viewport; frame: Frame } | null>(null)
  const particles = useRef<Particle[]>([])
  const sketchRef = useRef<Sketch>(asSketch(answers.sketch)?.slice() ?? emptySketch())
  const drawing = useRef<{ last: number | null; lastT: number } | null>(null)
  const finger = useRef<number | null>(null)
  const wrongRef = useRef<WrongVisual | undefined>(undefined)
  const active = useRef(false)
  const { ref: canvasRef, size } = useMathCanvas()
  const [used, setUsed] = useState<Record<string, boolean>>({})

  // A escolha errada do Resolva: guarda o visual (para o fade de saída) e reinicia o fade de entrada.
  const wrongKey = L.wrong ? `${L.wrong.key}:${L.wrong.i}` : ''
  useEffect(() => {
    if (!wrongVis) return
    wrongRef.current = wrongVis
    if (disp.current) disp.current.wrong = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrongKey])

  // O desenho salvo (ou apagado pela Etapa) volta para o ref enquanto ninguém desenha.
  useEffect(() => {
    if (!drawing.current) sketchRef.current = asSketch(answers.sketch)?.slice() ?? emptySketch()
  }, [answers.sketch])

  const spawn = (kind: Particle['kind'], t: number, y: number, delay = 0) => {
    particles.current.push({ kind, t, y, trail: [t, y], delay, age: 0, done: -1, cold: kind !== 'log' && y < ROOM })
  }

  // "Me mostre" das Etapas: solta partículas pelo live.
  const dropId = L.drop?.id
  useEffect(() => {
    const d = L.drop
    if (!d) return
    d.pts.forEach(([t, y], i) => spawn(d.kind, t, y, i * 0.45))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropId])

  // ---------------------------------------------------------------- loop

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size.w || !size.h) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()
    if (!disp.current) {
      const start = { ...tgtRef.current }
      for (const k of ['exactUpTo', 'decayUpTo', 'logUpTo', 'bCool', 'bDecay', 'bLog', 'halves'] as Key[]) start[k] = 0
      start.eulerUpTo = 10
      disp.current = start
    }
    let thermo = ROOM
    let raf = 0
    let last = performance.now()
    let spawnClock = 0
    const W = size.w
    const H = size.h

    const frameFn = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const d = disp.current!
      const T = tgtRef.current
      ease(d, T, dt, reduced)
      const dpr = canvas.width / W
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // Particles: advance, spawn the finale's flow, drop the faded ones.
      if (d.finale > 0.5 && !reduced) {
        spawnClock += dt
        if (spawnClock > 0.32 && particles.current.length < 40) {
          spawnClock = 0
          const y0 = Math.random() < 0.2 ? 2 + Math.random() * 15 : 26 + Math.random() * 78
          spawn('flow', 0, y0)
        }
      } else if (d.finale > 0.5 && reduced && !particles.current.some((p) => p.kind === 'flow')) {
        for (const y0 of [5, 35, 60, 80, 100]) spawn('flow', 0, y0)
      }
      for (const p of particles.current) advance(p, reduced ? 100 : dt)
      particles.current = particles.current.filter((p) => {
        if (p.kind === 'flow') return !(p.done > 1.2 && !reduced) && T.finale > 0
        if (p.kind === 'cool') return !(T.pCool === 0 && d.pCool < 0.02)
        return !(T.pLog === 0 && d.pLog < 0.02)
      })

      // Thermometer reading: the finger while drawing, the playhead while the curve draws itself.
      const desired = finger.current ?? (d.follow > 0.5 ? coffee(Math.max(0, d.exactUpTo)) : d.thermoT)
      thermo += (desired - thermo) * (reduced ? 1 : 1 - Math.exp(-dt * 6))

      draw(ctx, d, W, H, now / 1000, thermo, accent, sketchRef.current, particles.current, wrongRef.current, geo)
      raf = requestAnimationFrame(frameFn)
    }
    raf = requestAnimationFrame(frameFn)
    return () => cancelAnimationFrame(raf)
  }, [size.w, size.h, accent, canvasRef])

  // ---------------------------------------------------------------- input

  const mode: Mode =
    stepId === 'imagine' && scene === 2
      ? 'draw'
      : stepId === 'entenda' && scene <= 1
        ? 'probe'
        : stepId === 'entenda' && scene === 3
          ? 'dropCool'
          : stepId === 'mundo-real' && scene === 2 && !ageFound
            ? 'age'
            : stepId === 'e-se' && scene === 2
              ? 'dropLog'
              : stepId === 'resolva' && scene === 3
                ? 'solo'
                : null

  const toMath = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = geo.current
    if (!g) return null
    const r = e.currentTarget.getBoundingClientRect()
    const p = toPx(g.view, g.frame)
    return { t: p.fromX(e.clientX - r.left), y: p.fromY(e.clientY - r.top) }
  }

  const addSketch = (t: number, y: number) => {
    const s = sketchRef.current
    const i = Math.round(clamp(t, 0, 60))
    const v = clamp(y, -5, 105)
    const st = drawing.current
    if (!st) return
    if (st.last === null || st.last === i) s[i] = v
    else {
      const a = st.last
      for (let j = Math.min(a, i); j <= Math.max(a, i); j++) {
        const u = (j - a) / (i - a)
        s[j] = st.lastT + (v - st.lastT) * u
      }
    }
    st.last = i
    st.lastT = v
    finger.current = v
  }

  const handle = (e: React.PointerEvent<HTMLDivElement>, down: boolean) => {
    const m = toMath(e)
    if (!m) return
    switch (mode) {
      case 'draw':
        addSketch(m.t, m.y)
        break
      case 'probe':
        setLive({ probe: { t: clamp(m.t, 0, 60), T: clamp(m.y, 0, 100) } })
        break
      case 'age':
        setLive({ age: Math.round(clamp(m.t, 0, AGE_MAX) / 10) * 10 })
        break
      case 'solo':
        setLive({ soloT: Math.round(clamp(m.t, 0, 60) * 2) / 2 })
        break
      case 'dropCool':
        if (!down) break
        spawn('cool', clamp(m.t, 0, 50), clamp(m.y, 0, 104))
        setAnswer('drops', num(answers.drops) + 1)
        haptic(10)
        break
      case 'dropLog': {
        if (!down) break
        const P = clamp(m.y, 2, 1500)
        spawn('log', clamp(m.t, 0, 18), P)
        const prev = (answers.logDrops as { below?: boolean; above?: boolean } | undefined) ?? {}
        setAnswer('logDrops', { below: prev.below || P < K_LOG - 20, above: prev.above || P > K_LOG + 20 })
        haptic(10)
        break
      }
    }
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mode) return
    e.currentTarget.setPointerCapture(e.pointerId)
    active.current = true
    if (!used[mode]) setUsed((u) => ({ ...u, [mode]: true }))
    if (mode === 'draw') {
      drawing.current = { last: null, lastT: 0 }
      haptic(6)
    }
    handle(e, true)
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (active.current) handle(e, false)
  }
  const onUp = () => {
    active.current = false
    if (mode === 'draw' && drawing.current) {
      drawing.current = null
      finger.current = null
      setAnswer('sketch', sketchRef.current.slice())
    }
  }

  // ---------------------------------------------------------------- overlays

  const hint: Record<Exclude<Mode, null>, string> = {
    draw: 'Desenhe com o dedo, a partir do ponto',
    probe: 'Arraste o ponto pelo plano',
    dropCool: 'Toque no plano para soltar um café',
    dropLog: 'Toque para soltar uma população',
    age: 'Arraste para os lados',
    solo: 'Arraste ou use o controle',
  }

  const slope = -0.05 * (probe.T - ROOM)
  const badge =
    stepId === 'imagine' || stepId === 'preveja'
      ? 'Exemplo imaginado'
      : stepId === 'e-se'
        ? 'Exemplo imaginado · lago'
        : stepId === 'mundo-real'
          ? `Dado real · meia-vida ${fmt(HALF_LIFE, 0)} anos`
          : null

  let chip: React.ReactNode = null
  if (stepId === 'entenda') {
    chip =
      scene === 0 ? (
        <span className="font-mono tabular-nums">ritmo {fmt(slope, 2)} °C/min</span>
      ) : scene === 1 ? (
        <Tex say={`d T d t igual a menos 0,05 vezes ${fmt(probe.T, 0)} menos 20, igual a ${fmt(slope, 2)}`}>{`\\tfrac{dT}{dt} = -0{,}05\\,(${texNum(probe.T, 0)} - 20) = ${texNum(slope, 2)}`}</Tex>
      ) : (
        <Tex say="d T d t igual a menos 0,05 vezes T menos 20">{'\\tfrac{dT}{dt} = -0{,}05\\,(T - 20)'}</Tex>
      )
  } else if (stepId === 'mundo-real') {
    chip = <Tex say="d N d t igual a menos lambda N">{'\\tfrac{dN}{dt} = -\\lambda N'}</Tex>
  } else if (stepId === 'e-se') {
    chip = <Tex say="d P d t igual a r P vezes 1 menos P sobre K">{'\\tfrac{dP}{dt} = rP\\left(1 - \\tfrac{P}{K}\\right)'}</Tex>
  } else if (stepId === 'resolva' && scene === 2) {
    chip = (
      <span className="font-mono tabular-nums">
        h = {fmt(h, 1)} · erro máx. {fmt(eulerMaxError(h), 1)} °C
      </span>
    )
  } else if (stepId === 'resolva' && scene === 3) {
    chip = <Tex say="T igual a 20 mais 70 e elevado a menos 0,05 t">{'T = 20 + 70\\,e^{-0{,}05t}'}</Tex>
  }

  const aria =
    stepId === 'imagine'
      ? 'Xícara de café a 90 graus numa sala a 20 graus, e um plano de temperatura por tempo para desenhar'
      : stepId === 'preveja'
        ? 'Curva real de resfriamento do café comparada com o desenho do aluno'
        : stepId === 'entenda'
          ? scene <= 1
            ? `Ponto em ${fmt(probe.T, 0)} graus com inclinação ${fmt(slope, 2)} graus por minuto`
            : 'Campo de direções do resfriamento, com soluções que tendem a 20 graus'
          : stepId === 'mundo-real'
            ? `Decaimento do carbono-14 caindo à metade a cada ${fmt(HALF_LIFE, 0)} anos`
            : stepId === 'resolva'
              ? scene === 2
                ? `Método de Euler com passo ${fmt(h, 1)} minutos comparado com a curva exata`
                : 'Curva do café e o caderno da resolução'
              : stepId === 'e-se'
                ? 'Crescimento logístico de peixes que se aproximam de 1.000, com a linha de fase'
                : 'Campo de direções com cafés esfriando até a temperatura da sala'

  return (
    <Panel>
      <div
        className={cn('absolute inset-0', mode && 'cursor-crosshair')}
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>
      {stepId === 'resolva' && scene === 2 && (
        <DragSurface hint="Arraste para mudar o passo h" onDrag={(dy) => setLive({ h: clamp(h * Math.exp(-dy * 0.012), 1, 40) })} />
      )}

      <AnimatePresence>
        {badge && (
          <motion.div
            key={badge}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'pointer-events-none absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11.5px] backdrop-blur-xl',
              stepId === 'mundo-real' ? 'bg-sky-400/15 text-sky-100' : 'bg-white/[0.07] text-white/65',
            )}
          >
            {badge}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {chip && (
          <motion.div
            key={`${stepId}-${stepId === 'entenda' ? Math.min(scene, 2) : scene}`}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="pointer-events-none absolute right-3 top-3 z-10 max-w-[78%] whitespace-nowrap rounded-2xl bg-black/55 px-3 py-1.5 text-[13px] text-white/90 backdrop-blur-xl"
          >
            {chip}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{stepId === 'resolva' && scene <= 1 && <Notebook key="nb" scene={scene} sepStep={sepStep} eulerStep={eulerStep} />}</AnimatePresence>

      <AnimatePresence>
        {mode && !used[mode] && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%', transition: { delay: 0.8 } }}
            exit={{ opacity: 0, x: '-50%' }}
            className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-white/85 backdrop-blur-xl"
          >
            <motion.span animate={{ x: [0, 4, 0], y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <Hand className="h-3.5 w-3.5 text-white/70" />
            </motion.span>
            {hint[mode]}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{stepId === 'conclua' && <Finale key="finale" accent={accent} />}</AnimatePresence>
    </Panel>
  )
}

// ------------------------------------------------------------ caderno

function Notebook({ scene, sepStep, eulerStep }: { scene: number; sepStep: number; eulerStep: number }) {
  const lines = scene === 0 ? [SEP_FIRST_LINE, ...SEPARATION.slice(0, sepStep).map((s) => ({ tex: s.line, say: s.lineSay }))] : [EULER_FIRST_LINE, ...EULER_STEPS.slice(0, eulerStep).map((s) => ({ tex: s.line, say: s.lineSay }))]
  const shown = lines.slice(-3)
  const offset = lines.length - shown.length
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="absolute inset-x-2 bottom-2 z-10 h-[calc(32%-8px)] overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0b0c12]/90 px-3 py-2 backdrop-blur-xl"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">Caderno · problema {scene + 1}</p>
      <div className="mt-1 flex h-[calc(100%-18px)] flex-col justify-end gap-1 overflow-hidden text-[14px] text-white/75">
        <AnimatePresence initial={false}>
          {shown.map((l, i) => (
            <motion.div
              key={`${scene}-${offset + i}`}
              layout
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={cn('overflow-x-auto whitespace-nowrap [scrollbar-width:none]', offset + i === lines.length - 1 && 'text-white')}
            >
              <Tex say={l.say}>{l.tex}</Tex>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------ final

function Finale({ accent }: { accent: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-2">
      <div className="relative h-[72px] w-[72px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
        />
        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          <motion.circle cx="50" cy="50" r="45" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
          <motion.circle cx="50" cy="50" r="38" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.25 }} style={{ originX: '50px', originY: '50px' }} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const x = 28 + c * 14.5
              const y = 34 + r * 14
              const s = -0.05 * ((1 - (y - 34) / 40) * 80 - 10) * 0.9
              const a = Math.atan(s)
              return (
                <motion.line
                  key={`${r}-${c}`}
                  x1={x - 4 * Math.cos(a)}
                  y1={y + 4 * Math.sin(a)}
                  x2={x + 4 * Math.cos(a)}
                  y2={y - 4 * Math.sin(a)}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + (c * 3 + r) * 0.04 }}
                />
              )
            }),
          )}
          <motion.path
            d="M24 30 C 40 52, 52 60, 78 64"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(a) * 64, y: Math.sin(a) * 64, opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 1 + i * 0.02, ease: 'easeOut' }}
            />
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
        transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.9 }}
        className="rounded-2xl border border-white/[0.08] bg-black/60 px-3.5 py-2 text-[15px] text-white backdrop-blur-xl"
      >
        <Tex say="T de t igual a T da sala mais T zero menos T da sala, vezes e elevado a menos k t">{'T(t) = T_{\\text{sala}} + (T_0 - T_{\\text{sala}})\\,e^{-kt}'}</Tex>
      </motion.div>
    </motion.div>
  )
}

// ------------------------------------------------------------ desenho

const TAG_FONT = '500 11.5px ui-sans-serif, system-ui, -apple-system, "Geist", sans-serif'

function tag(ctx: CanvasRenderingContext2D, W: number, x: number, y: number, text: string, color: string, a: number, align: 'left' | 'right' | 'center' = 'left') {
  if (a < 0.02) return
  ctx.save()
  ctx.globalAlpha = Math.min(1, a)
  ctx.font = TAG_FONT
  const w = ctx.measureText(text).width + 14
  const hh = 20
  let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
  x0 = clamp(x0, 4, W - w - 4)
  ctx.fillStyle = 'rgba(6,7,12,0.82)'
  ctx.beginPath()
  ctx.roundRect(x0, y - hh / 2, w, hh, 10)
  ctx.fill()
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x0 + 7, y + 0.5)
  ctx.restore()
}

function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, a: number, width = 1.4, dash?: number[]) {
  if (a < 0.01) return
  ctx.save()
  ctx.globalAlpha = Math.min(1, a)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
  ctx.restore()
}

function polyline(ctx: CanvasRenderingContext2D, pts: number[], P: ReturnType<typeof toPx>, f: Frame, color: string, a: number, width = 2.4, dash?: number[], upTo = Infinity) {
  if (a < 0.01 || pts.length < 4) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(f.left, f.top, f.width, f.height)
  ctx.clip()
  ctx.globalAlpha = Math.min(1, a)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(P.x(pts[0]), P.y(pts[1]))
  for (let i = 2; i < pts.length; i += 2) {
    const t = pts[i]
    if (t > upTo) {
      const t0 = pts[i - 2]
      const u = (upTo - t0) / (t - t0)
      ctx.lineTo(P.x(upTo), P.y(pts[i - 1] + (pts[i + 1] - pts[i - 1]) * u))
      break
    }
    ctx.lineTo(P.x(t), P.y(pts[i + 1]))
  }
  ctx.stroke()
  ctx.restore()
}

/** Campo de direções numa grade em pixels; `born` faz os tracinhos nascerem um a um, coluna por coluna. */
function drawField(ctx: CanvasRenderingContext2D, fn: Rhs, P: ReturnType<typeof toPx>, f: Frame, a: number, born: number) {
  if (a < 0.01 || born <= 0) return
  const sp = clamp(Math.min(f.width, f.height) / 9, 26, 40)
  const cols = Math.max(1, Math.floor(f.width / sp))
  const rows = Math.max(1, Math.floor(f.height / sp))
  const ox = f.left + (f.width - cols * sp) / 2 + sp / 2
  const oy = f.top + (f.height - rows * sp) / 2 + sp / 2
  const N = cols * rows
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#ffffff'
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const idx = i * rows + j
      const q = clamp((born * (N + 6) - idx) / 6, 0, 1)
      if (q <= 0) continue
      const X = ox + i * sp
      const Y = oy + j * sp
      const s = fn(P.fromX(X), P.fromY(Y))
      let dx = P.sx
      let dy = -s * P.sy
      const n = Math.hypot(dx, dy) || 1
      dx /= n
      dy /= n
      const len = sp * 0.34 * (0.4 + 0.6 * q)
      ctx.globalAlpha = 0.3 * a * q
      ctx.beginPath()
      ctx.moveTo(X - dx * len, Y - dy * len)
      ctx.lineTo(X + dx * len, Y + dy * len)
      ctx.stroke()
    }
  ctx.restore()
}

/** Segmento tangente centrado em (t, y), com comprimento fixo em pixels. */
function tangent(ctx: CanvasRenderingContext2D, P: ReturnType<typeof toPx>, t: number, y: number, slope: number, len: number, color: string, a: number, width = 2.2) {
  let dx = P.sx
  let dy = -slope * P.sy
  const n = Math.hypot(dx, dy) || 1
  dx = (dx / n) * len
  dy = (dy / n) * len
  line(ctx, P.x(t) - dx, P.y(y) - dy, P.x(t) + dx, P.y(y) + dy, color, a, width)
}

function drawCup(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a: number, time: number, heat: number) {
  if (a < 0.01) return
  const h = w * 0.78
  ctx.save()
  ctx.globalAlpha = a
  // pires
  ctx.fillStyle = 'rgba(255,255,255,0.09)'
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.52, w * 0.78, w * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  // alça
  ctx.strokeStyle = '#cfc6bb'
  ctx.lineWidth = w * 0.075
  ctx.beginPath()
  ctx.arc(x + w * 0.46, y - h * 0.08, w * 0.17, -Math.PI / 2.2, Math.PI / 2.2)
  ctx.stroke()
  // corpo
  const body = new Path2D()
  body.moveTo(x - w / 2, y - h / 2)
  body.lineTo(x + w / 2, y - h / 2)
  body.bezierCurveTo(x + w / 2, y + h * 0.25, x + w * 0.32, y + h / 2, x + w * 0.18, y + h / 2)
  body.lineTo(x - w * 0.18, y + h / 2)
  body.bezierCurveTo(x - w * 0.32, y + h / 2, x - w / 2, y + h * 0.25, x - w / 2, y - h / 2)
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
  g.addColorStop(0, '#f6f1ea')
  g.addColorStop(1, '#a89f95')
  ctx.fillStyle = g
  ctx.fill(body)
  // borda e café
  ctx.fillStyle = '#ece5dc'
  ctx.beginPath()
  ctx.ellipse(x, y - h / 2, w / 2, w * 0.09, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4a2b17'
  ctx.beginPath()
  ctx.ellipse(x, y - h / 2 + 1, w * 0.43, w * 0.068, 0, 0, Math.PI * 2)
  ctx.fill()
  // vapor (some quando o café se aproxima da sala)
  if (heat > 0.02) {
    ctx.lineWidth = Math.max(1.4, w * 0.035)
    ctx.lineCap = 'round'
    for (let k = 0; k < 3; k++) {
      const sx = x + (k - 1) * w * 0.2
      const base = y - h / 2 - w * 0.08
      const top = base - h * 0.85
      const grad = ctx.createLinearGradient(0, base, 0, top)
      grad.addColorStop(0, `rgba(255,255,255,${0.45 * heat})`)
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.strokeStyle = grad
      ctx.beginPath()
      for (let i = 0; i <= 16; i++) {
        const u = i / 16
        const yy = base + (top - base) * u
        const xx = sx + Math.sin(time * 1.8 + k * 2.1 + u * 5) * w * 0.05 * (0.4 + u)
        if (i) ctx.lineTo(xx, yy)
        else ctx.moveTo(xx, yy)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawThermo(ctx: CanvasRenderingContext2D, x: number, y: number, hgt: number, T: number, a: number, accent: string, clock: string | null) {
  if (a < 0.01) return
  const tw = Math.max(7, hgt * 0.11)
  const r = tw * 0.95
  const top = y - hgt / 2
  const bottom = y + hgt / 2 - r
  const yOf = (v: number) => bottom - (clamp(v, -5, 105) / 100) * (bottom - top - tw * 0.6)
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x - tw / 2, top, tw, bottom - top + r * 0.5, tw / 2)
  ctx.fill()
  ctx.stroke()
  const level = yOf(T)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.roundRect(x - tw * 0.26, level, tw * 0.52, bottom - level + r * 0.4, tw * 0.26)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, bottom + r * 0.35, r, 0, Math.PI * 2)
  ctx.fill()
  // marca da sala
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.moveTo(x + tw / 2 + 1, yOf(ROOM))
  ctx.lineTo(x + tw / 2 + 5, yOf(ROOM))
  ctx.stroke()
  ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${fmt(T, 0)} °C`, x, top - 5)
  if (clock) {
    ctx.font = '500 11px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textBaseline = 'top'
    ctx.fillText(clock, x, bottom + r * 1.5 + 4)
  }
  ctx.restore()
}

function draw(
  ctx: CanvasRenderingContext2D,
  d: Ch,
  W: number,
  H: number,
  time: number,
  thermo: number,
  accent: string,
  sketch: Sketch,
  parts: Particle[],
  wrongVis: WrongVisual | undefined,
  geo: React.MutableRefObject<{ view: Viewport; frame: Frame } | null>,
) {
  const top = 54
  const left = 8
  const right = 12 + 46 * d.pr
  const bottom = H - 24 - d.fb * H
  const frame: Frame = { left, top, width: Math.max(40, W - left - right), height: Math.max(40, bottom - top) }
  const view: Viewport = { x0: d.ox * d.sx, x1: d.ox * d.sx + d.sx, y0: d.oy * d.sy, y1: d.oy * d.sy + d.sy }
  geo.current = { view, frame }
  const P = toPx(view, frame)
  const fx = frame.left + frame.width
  const fy = frame.top + frame.height

  // Eixos: uma grade, e os rótulos de cada mundo em fade cruzado.
  if (d.axes > 0.01) {
    drawAxes(ctx, view, frame, { alpha: d.axes, labels: false })
    const sets: [number, number, number, string, string][] = [
      [d.wCool * (1 - d.wLong), 10, 20, 'T (°C)', 't (min)'],
      [d.wCool * d.wLong, 30, 20, 'T (°C)', 't (min)'],
      [d.wDecay, HALF_LIFE, 25, 'N (% do C-14)', 't (anos)'],
      [d.wLog, 6, 250, 'P (peixes)', 't (meses)'],
    ]
    sets.forEach(([w, xs, ys, yt, xt], i) => {
      const a = w * d.axes
      if (a < 0.02) return
      drawAxes(ctx, view, frame, { alpha: a, grid: false, xStep: xs, yStep: ys, formatX: (x) => fmt(x, 0), formatY: (y) => fmt(y, 0) })
      ctx.save()
      ctx.globalAlpha = a
      ctx.font = '500 11px ui-sans-serif, system-ui, sans-serif'
      ctx.fillStyle = INK.label
      ctx.textBaseline = 'alphabetic'
      if (i !== 1 || d.wLong > 0.5) {
        ctx.textAlign = 'left'
        ctx.fillText(yt, frame.left + 30, frame.top - 8)
        ctx.textAlign = 'right'
        const ax = P.y(0)
        ctx.fillText(xt, fx - 2, (ax > frame.top + 30 && ax < fy ? ax : fy) - 7)
      }
      ctx.restore()
    })
  }

  // Campos de direções.
  drawField(ctx, coolF, P, frame, d.fCool, d.bCool)
  drawField(ctx, (t, y) => -(Math.LN2 / HALF_LIFE) * y, P, frame, d.fDecay, d.bDecay)
  drawField(ctx, logF, P, frame, d.fLog, d.bLog)

  // Linhas de referência: a sala e a capacidade do lago.
  if (d.room > 0.01 && d.wCool > 0.01) {
    const a = d.room * d.wCool
    line(ctx, frame.left, P.y(ROOM), fx, P.y(ROOM), '#ffffff', 0.35 * a, 1.2, [4, 5])
    tag(ctx, W, fx - 2, P.y(ROOM) + 13, 'sala · 20 °C', 'rgba(255,255,255,0.7)', a * (1 - d.fb * 2), 'right')
  }
  if (d.capLine > 0.01) {
    line(ctx, frame.left, P.y(K_LOG), fx, P.y(K_LOG), '#ffffff', 0.35 * d.capLine, 1.2, [4, 5])
    tag(ctx, W, frame.left + 30, P.y(K_LOG) - 13, 'capacidade K = 1.000', 'rgba(255,255,255,0.7)', d.capLine)
  }

  // Famílias de curvas.
  if (d.family > 0.01)
    for (const N0 of [80, 60, 40, 20]) {
      drawFunction(ctx, (t) => (N0 * carbon(t)) / 100, view, frame, { color: '#ffffff', width: 1.4, alpha: 0.35 * d.family })
      drawDot(ctx, P.x(HALF_LIFE), P.y(N0 / 2), 2.6, `rgba(255,255,255,${0.8 * d.family})`)
    }
  if (d.fam2 > 0.01)
    for (const A of [-60, -30, 30, 50, 70, 90, 110, 140]) drawFunction(ctx, (t) => ROOM + A * Math.exp(-0.05 * t), view, frame, { color: '#ffffff', width: 1.3, alpha: 0.25 * d.fam2 })

  // O desenho do aluno.
  if (d.sketch > 0.01) {
    const a = d.sketch * (1 - 0.45 * d.sketchFaint)
    ctx.save()
    ctx.beginPath()
    ctx.rect(frame.left, frame.top, frame.width, frame.height)
    ctx.clip()
    ctx.globalAlpha = a
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (d.sketchFaint > 0.5) ctx.setLineDash([5, 5])
    ctx.beginPath()
    let pen = false
    let lastI = -1
    sketch.forEach((v, i) => {
      if (v === null) {
        pen = false
        return
      }
      if (pen) ctx.lineTo(P.x(i), P.y(v))
      else ctx.moveTo(P.x(i), P.y(v))
      pen = true
      lastI = i
    })
    ctx.stroke()
    ctx.restore()
    if (lastI >= 0 && d.sketchFaint > 0.01) tag(ctx, W, P.x(lastI) - 4, P.y(sketch[lastI]!) - 16, 'seu desenho', 'rgba(255,255,255,0.85)', d.sketchFaint * d.sketch, 'right')
  }

  // A curva real do café, desenhando-se.
  if (d.exact > 0.01 && d.wCool > 0.01) {
    const a = d.exact * d.wCool
    drawFunction(ctx, coffee, view, frame, { color: accent, width: 2.8, alpha: a, upTo: d.exactUpTo, glow: true })
    const tt = Math.min(d.exactUpTo, view.x1)
    if (d.follow > 0.01 && tt > 0 && tt < view.x1 - 0.5) drawDot(ctx, P.x(tt), P.y(coffee(tt)), 4.5, accent, 1)
    if (d.sketchFaint > 0.01) {
      const tl = Math.min(d.exactUpTo, 28 + 90 * d.wLong)
      tag(ctx, W, P.x(tl) - 6, P.y(coffee(tl)) + 18, 'real', accent, d.sketchFaint * a * clamp(d.exactUpTo / 20, 0, 1))
    }
  }

  // Preveja: inclinação no começo e aos 40 min.
  if (d.tangents > 0.01) {
    const a = d.tangents
    tangent(ctx, P, 0, T0, coolF(0, T0), 34, '#ffffff', a)
    tag(ctx, W, P.x(0) + 26, P.y(T0) - 22, '−3,5 °C/min', '#ffffff', a)
    const q = clamp((d.exactUpTo - 40) / 4, 0, 1)
    const T40 = coffee(40)
    tangent(ctx, P, 40, T40, coolF(40, T40), 34, '#ffffff', a * q)
    tag(ctx, W, P.x(40), P.y(T40) - 26, '−0,5 °C/min', '#ffffff', a * q, 'center')
  }
  if (d.asym > 0.01) {
    const q = clamp((d.exactUpTo - 120) / 10, 0, 1)
    drawDot(ctx, P.x(120), P.y(coffee(120)), 3.5, '#ffffff')
    tag(ctx, W, P.x(120), P.y(coffee(120)) - 30, `2 h depois: ${fmt(coffee(120), 2)} °C`, '#ffffff', d.asym * q, 'center')
  }

  // Entenda: o ponto e seu tracinho.
  if (d.probe > 0.01) {
    const s = coolF(0, d.probeY)
    const col = d.probeY < ROOM - 0.5 ? SKY : accent
    tangent(ctx, P, d.probeT, d.probeY, s, 36, col, d.probe, 3)
    drawDot(ctx, P.x(d.probeT), P.y(d.probeY), 6, '#ffffff', d.probe)
    tag(ctx, W, P.x(d.probeT), P.y(d.probeY) - 26, `${fmt(d.probeY, 0)} °C · ${fmt(s, 2)} °C/min`, '#ffffff', d.probe, 'center')
  }
  if (d.solHi > 0.01)
    for (const t of [6, 18, 30, 42, 54]) {
      const y = coffee(t)
      tangent(ctx, P, t, y, coolF(t, y), 16, '#ffffff', d.solHi * 0.95, 3)
    }

  // Carbono-14.
  if (d.decay > 0.01) {
    drawFunction(ctx, carbon, view, frame, { color: accent, width: 2.8, alpha: d.decay, upTo: d.decayUpTo, glow: true })
    drawDot(ctx, P.x(0), P.y(100), 4.5, accent, d.decay)
    for (let n = 1; n <= 3; n++) {
      const q = clamp(d.halves * 3 - (n - 1), 0, 1) * clamp((d.decayUpTo - n * HALF_LIFE) / 800, 0, 1)
      if (q < 0.01) continue
      const x = n * HALF_LIFE
      const y = 100 / 2 ** n
      line(ctx, P.x(x), P.y(0), P.x(x), P.y(y), '#ffffff', 0.4 * q, 1, [3, 4])
      line(ctx, P.x(0), P.y(y), P.x(x), P.y(y), '#ffffff', 0.4 * q, 1, [3, 4])
      drawDot(ctx, P.x(x), P.y(y), 3.5, '#ffffff')
      tag(ctx, W, P.x(x) + 8, P.y(y) - 14, `${fmt(y, 1)} %`, '#ffffff', q)
    }
  }
  if (d.age > 0.01) {
    const a = d.age
    line(ctx, frame.left, P.y(25), fx, P.y(25), SKY, 0.55 * a, 1.2, [5, 4])
    tag(ctx, W, fx - 2, P.y(25) - 13, 'osso: 25 %', SKY, a, 'right')
    const N = carbon(d.ageX)
    const col = d.ageHit > 0.5 ? GOOD : '#ffffff'
    line(ctx, P.x(d.ageX), P.y(0), P.x(d.ageX), P.y(N), col, 0.8 * a, 1.4)
    drawDot(ctx, P.x(d.ageX), P.y(N), 5.5, col, d.ageHit > 0.5 ? 1 : 0.5)
    tag(ctx, W, P.x(d.ageX) + 10, P.y(N) - 16, `${fmt(N, 1)} %`, col, a)
    tag(ctx, W, P.x(d.ageX), P.y(0) - 14, `${fmt(Math.round(d.ageX / 10) * 10, 0)} anos`, col, a, 'center')
    if (d.family > 0.01) tag(ctx, W, fx - 2, frame.top + 12, `todas caem à metade em ${fmt(HALF_LIFE, 0)} anos`, 'rgba(255,255,255,0.8)', d.family, 'right')
  }

  // Resolva 1: a solução escolhida, T(10) e os erros.
  if (d.sol > 0.01) drawFunction(ctx, coffee, view, frame, { color: accent, width: 2.8, alpha: d.sol, glow: true })
  if (d.t10 > 0.01) {
    line(ctx, P.x(10), P.y(0), P.x(10), P.y(T10), '#ffffff', 0.5 * d.t10, 1, [3, 4])
    line(ctx, P.x(0), P.y(T10), P.x(10), P.y(T10), '#ffffff', 0.5 * d.t10, 1, [3, 4])
    drawDot(ctx, P.x(10), P.y(T10), 5, accent, d.t10)
    tag(ctx, W, P.x(10) + 10, P.y(T10) - 14, 'T(10) ≈ 62,5 °C', '#ffffff', d.t10)
  }
  if (d.wrong > 0.01 && wrongVis) {
    const a = d.wrong
    if (wrongVis.kind === 'curve') {
      drawFunction(ctx, wrongVis.f, view, frame, { color: ROSE, width: 2.4, alpha: a })
      const tl = 32
      tag(ctx, W, P.x(tl), clamp(P.y(wrongVis.f(tl)), frame.top + 12, fy - 12) - 16, wrongVis.label, ROSE, a, 'center')
    } else if (wrongVis.kind === 'point') {
      drawDot(ctx, P.x(wrongVis.t), P.y(wrongVis.y), 5, ROSE, a)
      tag(ctx, W, P.x(wrongVis.t) + 10, P.y(wrongVis.y) + 16, wrongVis.label, ROSE, a)
    } else {
      line(ctx, P.x(wrongVis.t0), P.y(wrongVis.y0), P.x(wrongVis.t1), P.y(wrongVis.y1), ROSE, a, 2.4)
      drawDot(ctx, P.x(wrongVis.t1), P.y(wrongVis.y1), 4.5, ROSE, a)
      tag(ctx, W, P.x(wrongVis.t1) + 10, P.y(wrongVis.y1) - 14, wrongVis.label, ROSE, a)
    }
  }

  // Resolva 2: Euler à mão.
  if (d.hand > 0.01) {
    const a = d.hand
    for (let i = 0; i < 2; i++) {
      const q = clamp(d.handN - i, 0, 1)
      if (q <= 0.001) continue
      const t0 = i * 5
      line(ctx, P.x(t0), P.y(HAND[i]), P.x(t0 + 5 * q), P.y(HAND[i] + (HAND[i + 1] - HAND[i]) * q), SKY, a, 2.6)
    }
    const n = Math.round(d.handN)
    for (let i = 0; i <= Math.min(n, 2); i++) {
      drawDot(ctx, P.x(i * 5), P.y(HAND[i]), 4, SKY, i === n ? 0.8 : 0)
      if (i > 0) tag(ctx, W, P.x(i * 5) - 6, P.y(HAND[i]) + 16, fmt(HAND[i], 1), SKY, a * clamp(d.handN - i + 1, 0, 1), 'right')
    }
    if (n < 2 && Math.abs(d.handN - n) < 0.05) {
      const y = HAND[n]
      const s = coolF(0, y)
      let dx = P.sx
      let dy = -s * P.sy
      const m = Math.hypot(dx, dy)
      dx = (dx / m) * 36
      dy = (dy / m) * 36
      drawArrow(ctx, P.x(n * 5), P.y(y), P.x(n * 5) + dx, P.y(y) + dy, 'rgba(125,211,252,0.85)', 2, 7)
      line(ctx, P.x(n * 5 + 5), frame.top, P.x(n * 5 + 5), fy, '#ffffff', 0.25 * a, 1, [3, 5])
      tag(ctx, W, P.x(n * 5 + 5), frame.top + 10, `t = ${n * 5 + 5} min`, 'rgba(255,255,255,0.75)', a, 'center')
    }
  }
  if (d.eulerAuto > 0.01) {
    const pts = euler(coolF, 0, T0, 5, 64).flatMap((p) => [p.t, p.y])
    polyline(ctx, pts, P, frame, SKY, d.eulerAuto, 2.4, undefined, d.eulerUpTo)
    tag(ctx, W, P.x(Math.min(d.eulerUpTo, 50)), P.y(coffee(Math.min(d.eulerUpTo, 50))) + 20, 'Euler, h = 5', SKY, d.eulerAuto * clamp((d.eulerUpTo - 20) / 10, 0, 1), 'center')
  }
  if (d.errBar > 0.01) {
    const x = P.x(10)
    line(ctx, x + 6, P.y(HAND[2]), x + 6, P.y(T10), ROSE, d.errBar, 2)
    line(ctx, x + 2, P.y(HAND[2]), x + 10, P.y(HAND[2]), ROSE, d.errBar, 2)
    line(ctx, x + 2, P.y(T10), x + 10, P.y(T10), ROSE, d.errBar, 2)
    tag(ctx, W, x + 16, (P.y(HAND[2]) + P.y(T10)) / 2, `erro ≈ ${fmt(T10 - HAND[2], 1)} °C`, ROSE, d.errBar)
  }

  // Resolva 3: passo h à escolha.
  if (d.euler > 0.01) {
    const nodes = euler(coolF, 0, T0, d.h, 64)
    polyline(
      ctx,
      nodes.flatMap((p) => [p.t, p.y]),
      P,
      frame,
      SKY,
      d.euler,
      2.4,
    )
    if (nodes.length < 40) for (const p of nodes) if (p.t <= view.x1) drawDot(ctx, P.x(p.t), P.y(p.y), 3.2, SKY)
    const low = nodes.find((p) => p.y < 0 && p.t <= 60)
    if (low) tag(ctx, W, P.x(low.t) - 10, P.y(low.y), `${fmt(low.y, 0)} °C: congelaria!`, ROSE, d.euler, 'right')
  }

  // Resolva 4: sozinho.
  if (d.solo > 0.01) {
    const a = d.solo
    line(ctx, P.x(d.soloT), frame.top, P.x(d.soloT), fy, '#ffffff', 0.6 * a, 1.4, [4, 4])
    tag(ctx, W, P.x(d.soloT), frame.top + 10, `t = ${fmt(d.soloT, 1)} min`, '#ffffff', a, 'center')
    if (d.soloCheck > 0.01) {
      const c = d.soloCheck * a
      const y = coffee(d.soloT)
      line(ctx, frame.left, P.y(40), fx, P.y(40), SKY, 0.6 * c, 1.2, [5, 4])
      tag(ctx, W, frame.left + 30, P.y(40) + 13, 'alvo: 40 °C', SKY, c)
      const ok = Math.abs(y - 40) < 0.6
      drawDot(ctx, P.x(d.soloT), P.y(y), 5.5, ok ? GOOD : '#ffffff', c)
      tag(ctx, W, P.x(d.soloT) + 10, P.y(y) - 16, `T = ${fmt(y, 1)} °C`, ok ? GOOD : '#ffffff', c)
    }
  }

  // Lago: curva em S, o fantasma exponencial e a linha de fase.
  if (d.logStart > 0.01) drawDot(ctx, P.x(0), P.y(P0_LOG), 5, accent, d.logStart)
  if (d.logc > 0.01) drawFunction(ctx, lake, view, frame, { color: accent, width: 2.8, alpha: d.logc, upTo: d.logUpTo, glow: true })
  if (d.ghost > 0.01) {
    drawFunction(ctx, (t) => P0_LOG * Math.exp(R_LOG * t), view, frame, { color: '#ffffff', width: 1.8, alpha: 0.6 * d.ghost, upTo: d.logUpTo, dash: [5, 5] })
    const te = Math.log(1350 / P0_LOG) / R_LOG
    tag(ctx, W, P.x(te) + 8, P.y(1350), 'sem limite', 'rgba(255,255,255,0.8)', d.ghost * clamp((d.logUpTo - te) / 1, 0, 1))
  }
  if (d.phase > 0.01) {
    const a = d.phase
    const x = fx + 24
    line(ctx, x, P.y(-60), x, frame.top, '#ffffff', 0.35 * a, 1.4)
    const arrow = (y0: number, y1: number) => drawArrow(ctx, x, P.y(y0), x, P.y(y1), `rgba(255,255,255,${0.8 * a})`, 2, 7)
    arrow(220, 420)
    arrow(560, 760)
    arrow(1420, 1180)
    const pulse = 1 + 0.25 * d.eqPulse * (0.5 + 0.5 * Math.sin(time * 4))
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.6
    ctx.fillStyle = '#06070c'
    ctx.beginPath()
    ctx.arc(x, P.y(0), 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    drawDot(ctx, x, P.y(K_LOG), 5.5 * pulse, accent, a * (0.6 + d.eqPulse))
    tag(ctx, W, x - 12, P.y(K_LOG) + 16, 'estável', accent, d.eqPulse, 'right')
    tag(ctx, W, x - 12, P.y(0) - 14, 'instável', 'rgba(255,255,255,0.8)', d.eqPulse, 'right')
  }

  // Partículas seguindo as setas.
  for (const p of parts) {
    if (p.delay > 0) continue
    const layer = p.kind === 'cool' ? d.pCool : p.kind === 'log' ? d.pLog : d.finale
    let a = layer
    if (p.kind === 'flow') a *= clamp(p.age / 0.3, 0, 1) * (p.done >= 0 ? clamp(1 - p.done / 1.2, 0, 1) : 1) * 0.85
    if (a < 0.01) continue
    const col = p.cold ? SKY : accent
    polyline(ctx, p.trail, P, frame, col, a, p.kind === 'flow' ? 1.8 : 2.4)
    if (p.done < 0) drawDot(ctx, P.x(p.t), P.y(p.y), p.kind === 'flow' ? 3 : 4.5, col, p.kind === 'flow' ? 0 : a)
    else if (p.kind !== 'flow') drawDot(ctx, P.x(p.trail[0]), P.y(p.trail[1]), 3.5, col)
  }

  // Ponto inicial do café.
  if (d.start > 0.01 && d.wCool > 0.01) {
    drawDot(ctx, P.x(0), P.y(T0), 6, accent, d.start * d.wCool)
    tag(ctx, W, P.x(0) + 12, P.y(T0) + 2, '90 °C', accent, d.start * d.wCool * (1 - d.tangents) * (1 - d.fb * 3))
  }

  // Xícara e termômetro.
  if (d.cupA > 0.01) {
    const M = Math.min(W, H)
    const cw = M * 0.36 * d.cupS
    const cx = d.cupX * W
    const cy = d.cupY * H
    drawCup(ctx, cx, cy, cw, d.cupA, time, clamp((thermo - ROOM) / 70, 0, 1))
    const clock = d.follow > 0.5 ? `aos ${fmt(Math.min(d.exactUpTo, d.wLong > 0.5 ? 240 : 60), 0)} min` : null
    drawThermo(ctx, cx + cw * 0.95 + 8 * d.cupS, cy, cw * 1.55, thermo, d.cupA, accent, clock)
    if (d.axes < 0.5) tag(ctx, W, cx - cw * 0.5, cy + cw * 0.78, 'sala · 20 °C', 'rgba(255,255,255,0.75)', d.cupA * (1 - d.axes * 2), 'right')
  }
}
