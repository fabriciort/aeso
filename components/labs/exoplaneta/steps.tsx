'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'
import { phaseOf } from '@/lib/astro/lightcurve'
import { centralDepth, modelAtPhase, R_JUP_IN_R_EARTH, R_SUN_IN_R_EARTH, R_SUN_IN_R_JUP } from '@/lib/astro/transit'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import DragSurface, { Burst } from '@/components/instruments/DragSurface'
import Plot, { ticks } from '@/components/instruments/Plot'
import TransitSimulator from '@/components/instruments/TransitSimulator'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { Panel, StepFrame, useLabRuntime, useScenes, type StepProps } from '../runtime'

// "Encontre um exoplaneta". Every Etapa fits one screen; long content is
// split into scenes (see components/labs/runtime.tsx).

const pct = (f: number, digits = 2) => `${formatNumber(f * 100, digits)} %`

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-9 rounded-full border px-3.5 text-[13.5px] transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

function StageBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('absolute z-10 rounded-full bg-black/50 px-3 py-1.5 font-mono text-[12px] text-white/85 backdrop-blur-xl', className)}>{children}</div>
}

// ------------------------------------------------------------ 1. Imagine

const PRESETS = [
  { label: 'Terra', re: 1 },
  { label: 'Netuno', re: 3.86 },
  { label: 'Júpiter', re: R_JUP_IN_R_EARTH },
  { label: '2× Júpiter', re: 2 * R_JUP_IN_R_EARTH },
]
const MIN_RE = 1
const MAX_RE = 2 * R_JUP_IN_R_EARTH
const toSlider = (re: number) => Math.log(re / MIN_RE) / Math.log(MAX_RE / MIN_RE)
const fromSlider = (s: number) => MIN_RE * (MAX_RE / MIN_RE) ** s
const nearPreset = (re: number) => PRESETS.find((p) => Math.abs(p.re - re) / p.re < 0.06)

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const [s, setS] = useState(() => (typeof answers.imagineSlider === 'number' ? (answers.imagineSlider as number) : toSlider(R_JUP_IN_R_EARTH)))
  const [playing, setPlaying] = useState(true)
  const [flux, setFlux] = useState(1)
  const tried = { small: Boolean(answers.triedSmall), big: Boolean(answers.triedBig) }
  const re = fromSlider(s)
  const k = re / R_SUN_IN_R_EARTH
  const depth = centralDepth(k, 0.15)

  const update = (v: number) => {
    const next = Math.min(1, Math.max(0, v))
    setS(next)
    setAnswer('imagineSlider', next)
    const r = fromSlider(next)
    if (r < 2.5 && !tried.small) {
      setAnswer('triedSmall', true)
      haptic(10)
    }
    if (r > 15 && !tried.big) {
      setAnswer('triedBig', true)
      haptic(10)
    }
  }

  useEffect(() => setReady(scene < 2 || (tried.small && tried.big)), [scene, tried.small, tried.big, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/3. Planeta com ${formatNumber(re, 1)} raios terrestres numa estrela como o Sol; queda máxima ${pct(depth, 3)}.`,
  })

  const captions = [
    <>Imagine uma estrela como o Sol, muito longe daqui. Um planeta gira em volta dela.</>,
    <>
      O planeta é escuro e pequeno demais para ver. Mas, quando ele passa na frente, <strong>uma parte da luz some</strong>: veja o brilho cair.
    </>,
    <>
      Agora é com você: faça um planeta do tamanho da <strong>Terra</strong> e depois um <strong>gigante</strong>.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      stage={
        <Panel>
          <TransitSimulator k={k} b={0.15} playing={playing} onFlux={setFlux} sceneOnly={scene === 0} className="h-full w-full" />
          {scene === 2 && <DragSurface hint="Arraste para mudar o tamanho" onDrag={(dy) => update(s - dy / 260)} />}
          <AnimatePresence>
            {scene >= 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                <StageBadge className="left-3 top-3">brilho {pct(flux, flux > 0.999 ? 2 : 3)}</StageBadge>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="focus-ring absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white/80 backdrop-blur-xl"
            aria-label={playing ? 'Pausar' : 'Continuar animação'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </Panel>
      }
      caption={captions[scene]}
      controls={
        scene === 2 ? (
          <div className="space-y-3">
            <Slider label="Tamanho do planeta" min={0} max={1} step={0.002} value={s} onChange={update} display={nearPreset(re)?.label ?? `${formatNumber(re, re < 10 ? 1 : 0)} × Terra`} />
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <Chip key={p.label} active={nearPreset(re)?.label === p.label} onClick={() => update(toSlider(p.re))}>
                  {p.label}
                </Chip>
              ))}
              <span className="ml-auto flex items-center gap-1.5" aria-label="Tarefas">
                <Dot done={tried.small} /> <Dot done={tried.big} />
              </span>
            </div>
          </div>
        ) : null
      }
    />
  )
}

function Dot({ done }: { done: boolean }) {
  return (
    <motion.span
      animate={{ scale: done ? 1 : 0.8, backgroundColor: done ? 'rgb(110,231,183)' : 'rgba(255,255,255,0.15)' }}
      transition={spring.snappy}
      className="grid h-5 w-5 place-items-center rounded-full"
    >
      {done && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
    </motion.span>
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['Ficar igual', 'Dobrar', 'Ficar 4× maior', 'Ficar 8× maior']
const PREDICTION_ANSWER = 2

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const [scene, setScene] = useScenes(props, 2, 'prevejaScene')
  useEffect(() => setReady(chosen !== null), [chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: chosen === null ? 'O aluno ainda não escolheu.' : `O aluno escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'correto' : 'incorreto'}).`,
  })

  const choose = (i: number) => {
    setAnswer('prediction', i)
    haptic(i === PREDICTION_ANSWER ? [10, 40, 10] : 20)
    setTimeout(() => setScene(1), 650)
  }

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      stage={
        <Panel>
          <TransitSimulator k={0.05} compareK={scene === 1 ? 0.1 : null} b={0.1} className="h-full w-full" />
          <AnimatePresence>
            {scene === 1 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-3 top-3 z-10 flex flex-wrap gap-1.5 text-[11.5px]">
                <span className="rounded-full bg-black/55 px-2.5 py-1 text-amber-200 backdrop-blur-xl">— raio R: {pct(centralDepth(0.05, 0.1))}</span>
                <span className="rounded-full bg-black/55 px-2.5 py-1 text-violet-200 backdrop-blur-xl">- - raio 2R: {pct(centralDepth(0.1, 0.1))}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      }
      caption={
        scene === 0 ? (
          <>
            Faça uma aposta. <strong>Se o raio do planeta dobrar</strong>, a queda de brilho vai…
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso mesmo!</strong> O que importa é a <strong>área</strong> do planeta. Dobrar o raio deixa a área 2² = <strong>4× maior</strong>.
          </>
        ) : (
          <>
            Ótimo erro para aprender! O que importa é a <strong>área</strong> do planeta: dobrar o raio deixa a área 2² = <strong>4× maior</strong>. Compare as curvas.
          </>
        )
      }
      controls={
        scene === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {PREDICTION.map((p, i) => (
              <Choice
                key={p}
                selected={chosen === i}
                state={chosen === null ? null : i === PREDICTION_ANSWER ? 'correct' : chosen === i ? 'wrong' : null}
                disabled={chosen !== null}
                onClick={() => choose(i)}
              >
                {p}
              </Choice>
            ))}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 2, 'entendaScene')
  const [k, setK] = useState(0.1)
  useEffect(() => setReady(true), [setReady])
  const depth = k * k
  useVegaScreen({ lab: lab.slug, step: 'entenda', state: `Cena ${scene + 1}/2. Razão de raios ${formatNumber(k, 3)}, δ = ${pct(depth, 3)}.` })

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      stage={
        <Panel className="grid place-items-center p-5">
          <AreaRule k={k} showFormula={scene === 1} />
        </Panel>
      }
      caption={
        scene === 0 ? (
          <>
            A queda de brilho é a <strong>fração do disco da estrela</strong> que o planeta cobre. Quanto maior a sombra, menos luz chega até você.
          </>
        ) : (
          <>
            Essa fração é a razão entre as áreas: <strong>δ ≈ (Rp/R★)²</strong>. Mude o tamanho e veja a conta acontecer.
          </>
        )
      }
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Raio do planeta ÷ raio da estrela" min={0.005} max={0.3} step={0.001} value={k} onChange={setK} display={formatNumber(k, 3)} />
            <div className="flex gap-2">
              <Chip onClick={() => setK(1 / R_SUN_IN_R_EARTH)} active={Math.abs(k - 1 / R_SUN_IN_R_EARTH) < 0.001}>
                Terra / Sol
              </Chip>
              <Chip onClick={() => setK(1 / R_SUN_IN_R_JUP)} active={Math.abs(k - 1 / R_SUN_IN_R_JUP) < 0.001}>
                Júpiter / Sol
              </Chip>
            </div>
          </div>
        ) : null
      }
    />
  )
}

function AreaRule({ k, showFormula }: { k: number; showFormula: boolean }) {
  const R = 110
  const r = Math.max(k * R, 1)
  const depth = k * k
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <svg viewBox="0 0 300 260" className="min-h-0 w-full max-w-[340px] flex-1" role="img" aria-label="Disco da estrela e do planeta em escala">
        <defs>
          <radialGradient id="starfill">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="70%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="#e88a2c" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="130" r={R + 26} fill="rgba(255,190,90,0.06)" />
        <circle cx="150" cy="130" r={R} fill="url(#starfill)" />
        <motion.circle cx="150" cy="130" r={r} initial={false} animate={{ r }} transition={spring.snappy} fill="#05060a" stroke="rgba(160,200,255,0.8)" strokeWidth="1" />
      </svg>
      <AnimatePresence>
        {showFormula && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center font-mono text-[21px] text-white">
            δ ≈ (<span className="text-sky-200">{formatNumber(k, 3)}</span>)² = <span className="text-amber-200">{pct(depth, depth < 0.001 ? 4 : 2)}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ------------------------------------------------------------ 4. Observe

function SourceBadge() {
  const { data } = useLabRuntime()
  if (data.status !== 'ready') return null
  const d = data.data
  return d.source === 'tess' ? (
    <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] text-white/80 backdrop-blur-xl">
      TESS{d.sector ? ` · Setor ${d.sector}` : ''} · {d.target}
    </span>
  ) : (
    <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11.5px] text-amber-100 backdrop-blur-xl" title="Feitos com os parâmetros reais do planeta; não são a medição do telescópio">
      Simulado · {d.target}
    </span>
  )
}

function DataGate({ children }: { children: React.ReactNode }) {
  const { data, useSimulated } = useLabRuntime()
  if (data.status === 'loading') {
    return (
      <Panel className="grid place-items-center">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-amber-200" />
          <p className="text-sm text-white/60">Baixando a curva de luz do MAST…</p>
          <p className="mt-1 text-xs text-white/35">cerca de 20 mil medições de brilho</p>
        </div>
      </Panel>
    )
  }
  if (data.status === 'error') {
    return (
      <Panel className="grid place-items-center p-8 text-center">
        <div>
          <p className="text-[15px] text-white/80">{data.message}</p>
          <p className="mt-2 text-sm text-white/45">Continue com uma versão simulada, feita com os parâmetros reais do planeta.</p>
          <Button variant="secondary" className="mt-5" onClick={useSimulated}>
            Usar dados simulados
          </Button>
        </div>
      </Panel>
    )
  }
  return <>{children}</>
}

export function Observe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const { data } = useLabRuntime()
  const [scene, setScene] = useScenes(props, 4, 'observeScene')
  const [found, setFound] = useState<number[]>(() => (Array.isArray(answers.found) ? (answers.found as number[]) : []))
  const [hover, setHover] = useState<number | null>(null)
  const [fold, setFold] = useState(answers.folded ? 1 : 0)
  const [folding, setFolding] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; hit: boolean }[]>([])
  const pointer = useRef({ x: 0, y: 0 })
  const lc = data.status === 'ready' ? data.data : null
  const goal = 3
  const allFound = found.length >= goal
  const folded = fold >= 1

  useEffect(() => {
    setReady(scene === 0 ? Boolean(lc) : scene === 1 ? allFound : scene === 2 ? folded : true)
  }, [scene, lc, allFound, folded, setReady])

  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state: lc
      ? folded
        ? `Trânsitos empilhados (período ${formatNumber(lc.period, 3)} dia). Ruído ≈ ${lc.noisePpm} ppm.`
        : `Curva de luz de ${lc.target} (${lc.source === 'tess' ? 'TESS' : 'simulada'}), ~27 dias. Encontrou ${found.length} de ${goal} quedas.`
      : 'Carregando dados.',
  })

  const transits = useMemo(() => {
    if (!lc) return []
    const end = lc.series[lc.series.length - 1]?.t ?? 0
    const out: number[] = []
    for (let t = lc.t0 - Math.floor(lc.t0 / lc.period) * lc.period; t <= end; t += lc.period) {
      if (lc.series.some((p) => Math.abs(p.t - t) < 0.05)) out.push(t)
    }
    return out
  }, [lc])

  const select = (x: number) => {
    if (!lc || fold > 0 || scene !== 1) return
    const near = transits.find((t) => Math.abs(t - x) < Math.max(0.2, lc.durationHours / 24))
    const hit = near !== undefined && !found.includes(near)
    const id = Date.now()
    setRipples((r) => [...r.slice(-4), { id, ...pointer.current, hit }])
    setTimeout(() => setRipples((r) => r.filter((q) => q.id !== id)), 900)
    if (hit) {
      const next = [...found, near]
      setFound(next)
      setAnswer('found', next)
      haptic(next.length >= goal ? [12, 50, 12] : 12)
      if (next.length >= goal) setTimeout(() => setScene(2), 900)
    }
  }

  const startFold = () => {
    if (!lc || folding) return
    setFolding(true)
    haptic(8)
    const start = performance.now()
    const dur = 1800
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setFold(p)
      if (p < 1) requestAnimationFrame(tick)
      else {
        setFolding(false)
        setAnswer('folded', true)
        haptic([10, 40, 10])
        setTimeout(() => setScene(3), 500)
      }
    }
    requestAnimationFrame(tick)
  }

  const plot = useMemo(() => {
    if (!lc) return null
    const T = lc.series[lc.series.length - 1].t
    const windowH = Math.max(lc.durationHours * 1.6, 3)
    const e = fold < 0.5 ? 4 * fold ** 3 : 1 - (-2 * fold + 2) ** 3 / 2
    const inside: { x: number; y: number }[] = []
    const outside: { x: number; y: number }[] = []
    for (const p of lc.series) {
      const h = phaseOf(p.t, lc.period, lc.t0) * lc.period * 24
      const xa = p.t / T
      const inWin = Math.abs(h) <= windowH
      const xb = inWin ? (h + windowH) / (2 * windowH) : xa
      ;(inWin ? inside : outside).push({ x: xa + (xb - xa) * e, y: p.f * 100 })
    }
    const ys = lc.series.map((p) => p.f)
    const lo = Math.min(...ys)
    const hi = Math.max(...ys)
    const pad = (hi - lo) * 0.15
    return { inside, outside, T, windowH, y: [(lo - pad) * 100, (hi + pad) * 100] as [number, number] }
  }, [lc, fold])

  const captions = [
    <>
      Agora, <strong>de verdade</strong>: cada ponto é o brilho da estrela {lab.target?.name}, medido pelo telescópio TESS durante 27 dias.
      {lc?.source === 'simulado' && <span className="mt-1 block text-[13px] text-amber-100/70">Sem conexão com o MAST agora: pontos simulados com os parâmetros reais.</span>}
    </>,
    <>
      Viu as pequenas quedas? <strong>Toque em {goal} delas</strong> no gráfico.
    </>,
    <>
      Elas se repetem a cada <strong>{formatNumber((lc?.period ?? 0) * 24, 1)} horas</strong>: o ano do planeta. Cada uma sozinha tem ruído. Vamos empilhar todas.
    </>,
    <>
      Somando {transits.length} trânsitos, o ruído se cancela e a <strong>forma da sombra</strong> aparece. É assim que se enxerga um planeta.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      stage={
        <DataGate>
          {lc && plot && (
            <Panel
              onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                const r = e.currentTarget.getBoundingClientRect()
                pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top }
              }}
            >
              <div className="absolute right-3 top-3 z-10">
                <SourceBadge />
              </div>
              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.span
                    key={r.id}
                    className={cn('pointer-events-none absolute z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2', r.hit ? 'border-amber-300' : 'border-white/30')}
                    style={{ left: r.x, top: r.y }}
                    initial={{ scale: 0.2, opacity: 1 }}
                    animate={{ scale: r.hit ? 1.8 : 1.1, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </AnimatePresence>
              <Plot
                ariaLabel={folded ? 'Trânsitos empilhados' : 'Brilho da estrela ao longo de cerca de 27 dias'}
                className="h-full w-full pt-11"
                x={[0, 1]}
                y={plot.y}
                xTicks={folded ? ticks(-plot.windowH, plot.windowH, 5).map((h) => (h + plot.windowH) / (2 * plot.windowH)) : ticks(0, plot.T, 5).map((d) => d / plot.T)}
                formatX={(v) => (folded ? formatNumber(v * 2 * plot.windowH - plot.windowH, 0) + ' h' : formatNumber(v * plot.T, 0) + ' d')}
                yTicks={ticks(plot.y[0], plot.y[1], 4)}
                formatY={(v) => formatNumber(v, 1) + '%'}
                xLabel={folded ? 'horas do centro do trânsito' : 'dias'}
                yLabel="brilho"
                series={[
                  { kind: 'dots', points: plot.outside, color: 'rgba(255,255,255,0.75)', size: 1.6, alpha: 1 - fold },
                  { kind: 'dots', points: plot.inside, color: fold > 0 ? 'rgba(253,224,171,0.95)' : 'rgba(255,255,255,0.75)', size: fold > 0 ? 2.4 : 1.6 },
                ]}
                markers={fold > 0 ? [] : (scene >= 2 ? transits : found).map((t) => ({ x: t / plot.T }))}
                band={scene === 1 && hover !== null ? [hover - 0.014, hover + 0.014] : null}
                onPointer={scene === 1 ? setHover : undefined}
                onSelect={scene === 1 ? (x) => select(x * plot.T) : undefined}
              />
            </Panel>
          )}
        </DataGate>
      }
      caption={captions[scene]}
      controls={
        scene === 1 ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: goal }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: i < found.length ? 1 : 0.85, backgroundColor: i < found.length ? 'rgb(246,183,78)' : 'rgba(255,255,255,0.12)' }}
                  transition={spring.snappy}
                  className="h-2.5 w-8 rounded-full"
                />
              ))}
            </div>
            <span className="text-sm text-white/55">
              {Math.min(found.length, goal)} de {goal}
            </span>
            {!allFound && lc && (
              <button
                onClick={() => {
                  const show = transits.slice(0, goal)
                  setFound(show)
                  setAnswer('found', show)
                  setTimeout(() => setScene(2), 700)
                }}
                className="ml-auto text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
              >
                Me mostre
              </button>
            )}
          </div>
        ) : scene === 2 && !folded ? (
          <Button size="lg" onClick={startFold} disabled={folding} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" /> {folding ? 'Empilhando…' : 'Empilhar os trânsitos'}
          </Button>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Meça

export function Meca(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const { data } = useLabRuntime()
  const lc = data.status === 'ready' ? data.data : null
  const t = lab.target!
  const [scene, setScene] = useScenes(props, 2, 'mecaScene')
  const [k, setK] = useState(() => (typeof answers.k === 'number' ? (answers.k as number) : 0.06))
  const { ask } = useVega()
  const best = lc?.fitRadiusRatio ?? t.radiusRatio
  const err = Math.abs(k - best) / best
  const fitted = err < 0.04
  const locked = Boolean(answers.measured)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (fitted && !locked) {
      setAnswer('measured', true)
      setCelebrate(true)
      haptic([14, 60, 20])
      setTimeout(() => setCelebrate(false), 1200)
      setTimeout(() => setScene(1), 1300)
    }
  }, [fitted, locked, setAnswer, setScene])
  useEffect(() => setReady(locked), [locked, setReady])

  const setKClamped = (v: number) => {
    const next = Math.min(0.22, Math.max(0.03, v))
    setK(next)
    setAnswer('k', next)
  }

  const status = err < 0.04 ? 'Encaixou!' : err < 0.1 ? 'Quase lá' : err < 0.25 ? 'Chegando perto' : 'Ainda longe'
  const meter = Math.max(0, 1 - err / 0.5)
  const rpJup = k * t.starRadiusSun * R_SUN_IN_R_JUP

  useVegaScreen({
    lab: lab.slug,
    step: 'meca',
    state: `Modelo com k = ${formatNumber(k, 3)} (queda ${pct(centralDepth(k, t.impact, t.limbDarkening))}). Situação: ${status}.`,
  })

  const plot = useMemo(() => {
    if (!lc) return null
    const windowH = Math.max(lc.durationHours * 1.6, 3)
    const model: { x: number; y: number }[] = []
    for (let h = -windowH; h <= windowH; h += windowH / 150) {
      model.push({ x: h, y: modelAtPhase(h / 24 / lc.period, k, { aR: t.aR, b: t.impact }, t.limbDarkening) * 100 })
    }
    const ys = lc.foldedBinned.map((p) => p.f)
    const lo = Math.min(...ys, 1 - centralDepth(0.16))
    const hi = Math.max(...ys)
    const pad = (hi - lo) * 0.12
    return { model, windowH, y: [(lo - pad) * 100, (hi + pad) * 100] as [number, number] }
  }, [lc, k, t])

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene}
      stage={
        <AnimatePresence mode="wait" initial={false}>
          {scene === 0 ? (
            <motion.div key="fit" className="h-full" exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }} transition={{ duration: 0.35 }}>
              <DataGate>
                {lc && plot && (
                  <Panel>
                    <div className="absolute right-3 top-3 z-10">
                      <SourceBadge />
                    </div>
                    <Plot
                      ariaLabel="Trânsitos empilhados com a curva do modelo"
                      className="h-full w-full pt-11"
                      x={[-plot.windowH, plot.windowH]}
                      y={plot.y}
                      xTicks={ticks(-plot.windowH, plot.windowH, 5)}
                      formatX={(v) => `${formatNumber(v, 0)} h`}
                      yTicks={ticks(plot.y[0], plot.y[1], 4)}
                      formatY={(v) => formatNumber(v, 1) + '%'}
                      xLabel="horas do centro do trânsito"
                      yLabel="brilho"
                      series={[
                        { kind: 'dots', points: lc.folded.map((p) => ({ x: p.h, y: p.f * 100 })), color: 'rgba(255,255,255,0.3)', size: 1.4 },
                        { kind: 'dots', points: lc.foldedBinned.map((p) => ({ x: p.h, y: p.f * 100 })), color: '#ffffff', size: 3.2 },
                        { kind: 'line', points: plot.model, color: fitted ? '#6ee7b7' : '#f6b74e', width: 2.8 },
                      ]}
                    />
                    <DragSurface hint="Arraste para afundar a curva" onDrag={(dy) => setKClamped(k * Math.exp(dy * 0.004))} />
                  </Panel>
                )}
              </DataGate>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="h-full"
              initial={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Panel className="grid place-items-center">
                <SizeCompare rpJup={rpJup} name={`${t.name} b`} />
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      }
      caption={
        scene === 0 ? (
          <>
            A linha é um <strong>modelo</strong> de planeta. Ajuste o tamanho até ela passar <strong>pelo meio dos pontos brancos</strong>.
          </>
        ) : (
          <>
            Você mediu: <strong>{formatNumber(rpJup, 1)}× o raio de Júpiter</strong>, com um ano de {formatNumber(t.period * 24, 1)} horas. Um
            &ldquo;Júpiter quente&rdquo;, inchado pelo calor da estrela.
          </>
        )
      }
      controls={
        scene === 0 ? (
          <div className="space-y-3">
            <Slider label="Tamanho do planeta (Rp/R★)" min={0.03} max={0.22} step={0.0005} value={k} onChange={setKClamped} display={formatNumber(k, 3)} />
            <div className="relative">
              {celebrate && <Burst />}
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="text-white/55">Encaixe</span>
                <motion.span key={status} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy} className={cn('font-medium', fitted ? 'text-emerald-300' : 'text-white/80')}>
                  {status}
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', fitted ? 'bg-emerald-300' : 'bg-gradient-to-r from-amber-300 to-amber-200')} animate={{ width: `${meter * 100}%` }} transition={spring.snappy} />
              </div>
            </div>
            {!fitted && (
              <button onClick={() => ask('Como eu sei se o modelo encaixou nos dados?')} className="inline-flex items-center gap-1.5 text-[13px] text-violet-200/80 hover:text-violet-100">
                <Sparkles className="h-3.5 w-3.5" /> Pedir uma dica à Vega
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Queda de brilho" value={pct(centralDepth(k, t.impact, t.limbDarkening))} />
            <Readout label="Raio do planeta" value={`${formatNumber(rpJup, 2)} × Júpiter`} accent />
          </div>
        )
      }
    />
  )
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className={cn('mt-0.5 text-[17px] font-medium tabular-nums', accent ? 'text-amber-200' : 'text-white')}>{value}</p>
    </div>
  )
}

function SizeCompare({ rpJup, name }: { rpJup: number; name: string }) {
  const items = [
    { label: 'Terra', r: 1 / R_JUP_IN_R_EARTH, color: '#5eb0ff' },
    { label: 'Júpiter', r: 1, color: '#e7c08a' },
    { label: name, r: rpJup, color: '#f6b74e' },
  ]
  const max = Math.max(...items.map((i) => i.r))
  return (
    <div className="flex w-full items-end justify-around gap-3 px-4">
      {items.map((it, i) => {
        const d = Math.max((it.r / max) * 150, 5)
        return (
          <div key={it.label} className="flex flex-col items-center gap-3">
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring.soft, delay: 0.2 + i * 0.15 }}
              className="rounded-full"
              style={{ width: d, height: d, background: `radial-gradient(circle at 35% 30%, #fff8, ${it.color} 45%, #0008 120%)`, boxShadow: `0 0 30px ${it.color}55` }}
            />
            <span className="text-[12px] text-white/60">{it.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ------------------------------------------------------------ 6. E se…?

const CHALLENGES = [
  {
    id: 'terra',
    q: 'Um astrônomo alienígena vê a Terra passar na frente do Sol. Qual é a queda de brilho?',
    options: ['≈ 1 %', '≈ 0,1 %', '≈ 0,01 %', '≈ 0,001 %'],
    answer: 2,
    explain: 'k = 1/109 ≈ 0,0092. Ao quadrado: ≈ 0,0084 %. Minúscula: por isso achar outras Terras é tão difícil.',
    tint: 'sun' as const,
    k: 1 / R_SUN_IN_R_EARTH,
    label: 'O Sol visto de longe',
  },
  {
    id: 'ana-vermelha',
    q: 'E um planeta do tamanho de Júpiter na frente de uma anã vermelha com 0,2 vez o raio do Sol?',
    options: ['≈ 1 %', '≈ 5 %', '≈ 25 %', '≈ 100 %'],
    answer: 2,
    explain: 'k = 0,1/0,2 = 0,5. Ao quadrado: 25 %. Estrelas pequenas deixam os planetas muito mais fáceis de ver.',
    tint: 'red' as const,
    k: 0.5,
    label: 'Anã vermelha · 0,2 R☉',
  },
]

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const picks = (answers.challenges as Record<string, number | undefined> | undefined) ?? {}
  const [scene] = useScenes(props, CHALLENGES.length, 'eseScene')
  const c = CHALLENGES[scene]
  const picked = picks[c.id]
  useEffect(() => setReady(picked !== undefined), [picked, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state: `Desafio ${scene + 1} de ${CHALLENGES.length}: ${c.q} ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu ${c.options[picked]} (${picked === c.answer ? 'certo' : 'errado'}).`}`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + (picked === undefined ? 0 : 1)}
      stage={
        <Panel>
          <TransitSimulator key={c.id} k={picked !== undefined ? c.k : 0.0001} starTint={c.tint} sceneOnly={picked === undefined} b={0.1} className="h-full w-full" />
          <StageBadge className="left-3 top-3 font-sans">{c.label}</StageBadge>
          {picked !== undefined && (
            <button
              onClick={() => setAnswer('challenges', { ...picks, [c.id]: undefined })}
              className="focus-ring absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white/70 backdrop-blur-xl"
              aria-label="Responder de novo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </Panel>
      }
      caption={
        picked === undefined ? (
          c.q
        ) : (
          <>
            <strong>{picked === c.answer ? 'Exato.' : `Era ${c.options[c.answer]}.`}</strong> {c.explain}
          </>
        )
      }
      controls={
        picked === undefined ? (
          <div className="grid grid-cols-2 gap-2">
            {c.options.map((o, i) => (
              <Choice key={o} onClick={() => setAnswer('challenges', { ...picks, [c.id]: i })}>
                <span className="font-mono">{o}</span>
              </Choice>
            ))}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady, answers, onExplore }: StepProps) {
  const t = lab.target!
  const { data } = useLabRuntime()
  const simulated = data.status === 'ready' && data.data.source === 'simulado'
  const k = typeof answers.k === 'number' ? (answers.k as number) : t.radiusRatio
  const rpJup = k * t.starRadiusSun * R_SUN_IN_R_JUP
  const diff = ((k - t.radiusRatio) / t.radiusRatio) * 100
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `O aluno mediu k = ${formatNumber(k, 3)}, Rp ≈ ${formatNumber(rpJup, 2)} R♃.` })

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Medal accent={lab.accent} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
        Conquista desbloqueada
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...spring.soft, delay: 0.7 } }}
        className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[42px]"
      >
        {lab.achievement?.title}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.85 } }} className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-white/60">
        {simulated ? 'Você mediu um planeta fora do Sistema Solar (desta vez com dados simulados).' : lab.achievement?.description}
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { ...spring.soft, delay: 1 } }} className="mt-6 grid w-full max-w-lg grid-cols-3 gap-2 text-left">
        <Summary label="Você" value={formatNumber(k, 3)} sub={`${formatNumber(rpJup, 2)}× Júpiter`} />
        <Summary label="Artigo" value={formatNumber(t.radiusRatio, 4)} sub={`Δ ${formatNumber(Math.abs(diff), 1)} %`} />
        <Summary label="Ano" value={`${formatNumber(t.period * 24, 1)} h`} sub="período" />
      </motion.div>
      {onExplore && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.2 } }} className="mt-6">
          <Button variant="secondary" onClick={onExplore}>
            Ver {t.name} no Céu
          </Button>
        </motion.div>
      )}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.3 } }} className="mt-4 text-[11px] text-white/30">
        Referência: {t.reference}
      </motion.p>
    </div>
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[16px] text-white">{value}</p>
      <p className="text-[11px] text-white/45">{sub}</p>
    </div>
  )
}

function Medal({ accent }: { accent: string }) {
  return (
    <div className="relative h-32 w-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1.25 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      <svg viewBox="0 0 160 160" className="relative h-full w-full">
        <defs>
          <radialGradient id="medalStar">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="70%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="#e88a2c" />
          </radialGradient>
        </defs>
        <motion.circle cx="80" cy="80" r="66" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
        <motion.circle cx="80" cy="80" r="56" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.3 }} style={{ originX: '80px', originY: '80px' }} />
        <motion.circle cx="80" cy="80" r="26" fill="url(#medalStar)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.45 }} style={{ originX: '80px', originY: '80px' }} />
        <motion.circle cx="80" cy="80" r="8" fill="#05060a" initial={{ cx: 40, opacity: 0 }} animate={{ cx: 86, opacity: 1 }} transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: Math.cos(a) * 95, y: Math.sin(a) * 95, opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, delay: 0.9 + i * 0.02, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

export const EXOPLANETA_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  meca: Meca,
  'e-se': ESe,
  conclua: Conclua,
}
