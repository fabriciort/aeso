'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'
import { phaseOf } from '@/lib/astro/lightcurve'
import { centralDepth, modelAtPhase, R_JUP_IN_R_EARTH, R_SUN_IN_R_EARTH, R_SUN_IN_R_JUP } from '@/lib/astro/transit'
import { formatNumber } from '@/lib/format'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/utils'
import Plot, { ticks } from '@/components/instruments/Plot'
import TransitSimulator from '@/components/instruments/TransitSimulator'
import { Button, Callout, Choice, Slider } from '@/components/observatory/ui'
import { Panel, StepFrame, useLabRuntime, type StepProps } from '../runtime'

const pct = (f: number, digits = 2) => `${formatNumber(f * 100, digits)} %`

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

function planetLabel(re: number): string {
  const near = PRESETS.find((p) => Math.abs(p.re - re) / p.re < 0.06)
  return near ? near.label : `${formatNumber(re, re < 10 ? 1 : 0)} × Terra`
}

export function Imagine({ lab, setReady, setAnswer, answers }: StepProps) {
  const [s, setS] = useState(() => (typeof answers.imagineSlider === 'number' ? (answers.imagineSlider as number) : toSlider(R_JUP_IN_R_EARTH)))
  const [playing, setPlaying] = useState(true)
  const [flux, setFlux] = useState(1)
  const [tried, setTried] = useState<{ small: boolean; big: boolean }>(() => ({
    small: Boolean(answers.triedSmall),
    big: Boolean(answers.triedBig),
  }))
  const re = fromSlider(s)
  const k = re / R_SUN_IN_R_EARTH
  const depth = centralDepth(k, 0.15)

  useEffect(() => {
    const next = { small: tried.small || re < 2.5, big: tried.big || re > 15 }
    if (next.small !== tried.small || next.big !== tried.big) {
      setTried(next)
      setAnswer('triedSmall', next.small)
      setAnswer('triedBig', next.big)
    }
  }, [re, tried, setAnswer])

  useEffect(() => setReady(tried.small && tried.big), [tried, setReady])

  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Planeta com ${formatNumber(re, 1)} raios terrestres numa estrela como o Sol; queda máxima de brilho ${pct(depth, 3)}.`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      instrument={
        <Panel className="relative">
          <TransitSimulator k={k} b={0.15} playing={playing} onFlux={setFlux} className="aspect-[4/3.2] w-full" />
          <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 font-mono text-xs text-white/80 backdrop-blur-xl">
            brilho {pct(flux, 3)}
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="focus-ring absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white/80 backdrop-blur-xl hover:text-white"
            aria-label={playing ? 'Pausar' : 'Continuar animação'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </Panel>
      }
    >
      <p className="text-[15px] leading-relaxed text-white/70">
        Imagine que você está muito longe, olhando uma estrela parecida com o Sol. Você não consegue ver o planeta: ele é pequeno e
        escuro demais. Mas, quando ele passa na frente da estrela, <strong className="font-medium text-white">uma parte da luz some</strong>.
      </p>
      <Slider
        label="Tamanho do planeta"
        min={0}
        max={1}
        step={0.002}
        value={s}
        onChange={(v) => {
          setS(v)
          setAnswer('imagineSlider', v)
        }}
        display={planetLabel(re)}
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setS(toSlider(p.re))
              setAnswer('imagineSlider', toSlider(p.re))
            }}
            className={cn('chip focus-ring', Math.abs(re - p.re) / p.re < 0.06 && '!border-white/30 !bg-white/[0.12] !text-white')}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Readout label="Queda máxima de brilho" value={pct(depth, depth < 0.001 ? 4 : 2)} />
        <Readout label="Luz que sobra" value={pct(1 - depth, depth < 0.001 ? 4 : 2)} />
      </div>
      <ul className="space-y-2">
        <Task done={tried.small}>Deixe o planeta do tamanho da Terra. Dá para ver a queda?</Task>
        <Task done={tried.big}>Agora faça um planeta gigante, maior que Júpiter.</Task>
      </ul>
    </StepFrame>
  )
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
      <p className="eyebrow !text-[10px]">{label}</p>
      <motion.p key={value} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className={cn('mt-1 font-mono text-[17px] tabular-nums', accent ? 'text-amber-200' : 'text-white')}>
        {value}
      </motion.p>
    </div>
  )
}

function Task({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('flex items-start gap-3 text-[14px] transition-colors', done ? 'text-white/50' : 'text-white/80')}>
      <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-300', done ? 'border-emerald-300/60 bg-emerald-400/20' : 'border-white/20')}>
        <AnimatePresence>
          {done && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}>
              <Check className="h-3 w-3 text-emerald-200" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className={cn(done && 'line-through decoration-white/20')}>{children}</span>
    </li>
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['Ficar igual', 'Dobrar', 'Ficar 4 vezes maior', 'Ficar 8 vezes maior']
const PREDICTION_ANSWER = 2

export function Preveja({ lab, setReady, setAnswer, answers }: StepProps) {
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  useEffect(() => setReady(chosen !== null), [chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: chosen === null ? 'O aluno ainda não escolheu.' : `O aluno escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'correto' : 'incorreto'}).`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      instrument={
        <Panel className="relative">
          <TransitSimulator k={0.05} compareK={chosen !== null ? 0.1 : null} b={0.1} className="aspect-[4/3.2] w-full" />
          <AnimatePresence>
            {chosen !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-4 top-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-black/50 px-3 py-1.5 text-amber-200 backdrop-blur-xl">— raio R: queda {pct(centralDepth(0.05, 0.1))}</span>
                <span className="rounded-full bg-black/50 px-3 py-1.5 text-violet-200 backdrop-blur-xl">- - raio 2R: queda {pct(centralDepth(0.1, 0.1))}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      }
    >
      <p className="text-[15px] leading-relaxed text-white/70">
        Pense antes de testar. <strong className="font-medium text-white">Se o raio do planeta dobrar</strong>, a queda de brilho vai…
      </p>
      <div className="grid gap-2">
        {PREDICTION.map((p, i) => (
          <Choice
            key={p}
            selected={chosen === i}
            state={chosen === null ? null : i === PREDICTION_ANSWER ? 'correct' : chosen === i ? 'wrong' : null}
            disabled={chosen !== null}
            onClick={() => setAnswer('prediction', i)}
          >
            {p}
          </Choice>
        ))}
      </div>
      <AnimatePresence>
        {chosen !== null && (
          <Callout tone={chosen === PREDICTION_ANSWER ? 'good' : 'info'}>
            {chosen === PREDICTION_ANSWER ? 'Isso mesmo! ' : 'Muita gente aposta nisso, e é um ótimo erro para aprender. '}
            O que importa é a <strong>área</strong> do disco do planeta que tampa a estrela. A área cresce com o raio ao quadrado: dobrar o raio
            deixa a área <strong>2² = 4 vezes</strong> maior. Compare as duas curvas no simulador.
          </Callout>
        )}
      </AnimatePresence>
    </StepFrame>
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda({ lab, setReady }: StepProps) {
  const [k, setK] = useState(0.1)
  useEffect(() => setReady(true), [setReady])
  const depth = k * k
  useVegaScreen({ lab: lab.slug, step: 'entenda', state: `Razão de raios ${formatNumber(k, 3)}, δ = ${pct(depth, 3)}.` })

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      instrument={
        <Panel className="p-6">
          <AreaRule k={k} />
        </Panel>
      }
    >
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 text-center">
        <p className="eyebrow mb-3">A regra da sombra</p>
        <p className="font-mono text-[26px] tracking-tight text-white sm:text-[30px]">
          δ ≈ (<span className="text-sky-200">R<sub className="text-[0.6em]">p</sub></span> / <span className="text-amber-200">R<sub className="text-[0.6em]">★</sub></span>)²
        </p>
        <p className="mt-3 font-mono text-[15px] text-white/60">
          = ({formatNumber(k, 3)})² = <span className="text-white">{pct(depth, depth < 0.001 ? 4 : 2)}</span>
        </p>
      </div>
      <p className="text-[15px] leading-relaxed text-white/70">
        A queda de brilho <strong className="font-medium text-white">δ</strong> é a fração do disco da estrela coberta pelo planeta: a razão
        entre as áreas, que é a razão entre os <span className="text-sky-200">raios do planeta</span> e da{' '}
        <span className="text-amber-200">estrela</span> ao quadrado.
      </p>
      <Slider label="Razão de raios Rp/R★" min={0.005} max={0.3} step={0.001} value={k} onChange={setK} display={formatNumber(k, 3)} />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setK(1 / R_SUN_IN_R_EARTH)} className="chip focus-ring">
          Terra / Sol
        </button>
        <button onClick={() => setK(1 / R_SUN_IN_R_JUP)} className="chip focus-ring">
          Júpiter / Sol
        </button>
      </div>
      <p className="text-[13px] leading-relaxed text-white/45">
        Na vida real a borda da estrela é um pouco mais escura que o centro (escurecimento de borda), o que deixa a curva mais arredondada. A
        regra continua valendo.
      </p>
    </StepFrame>
  )
}

function AreaRule({ k }: { k: number }) {
  const R = 120
  const r = Math.max(k * R, 1)
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 300 300" className="w-full max-w-[340px]" role="img" aria-label="Disco da estrela e do planeta em escala">
        <defs>
          <radialGradient id="starfill">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="70%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="#e88a2c" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r={R + 30} fill="rgba(255,190,90,0.07)" />
        <circle cx="150" cy="150" r={R} fill="url(#starfill)" />
        <motion.circle cx="150" cy="150" r={r} initial={false} animate={{ r }} transition={spring.snappy} fill="#05060a" stroke="rgba(160,200,255,0.8)" strokeWidth="1" />
        <line x1="150" y1="150" x2={150 + R} y2="150" stroke="rgba(253,224,171,0.9)" strokeDasharray="3 3" />
        <text x={150 + R / 2} y="143" textAnchor="middle" fill="rgba(253,224,171,0.95)" fontSize="11">R★</text>
      </svg>
      <div className="w-full">
        <div className="mb-2 flex justify-between text-xs text-white/50">
          <span>fração de luz bloqueada</span>
          <span className="font-mono text-white">{pct(k * k, k * k < 0.001 ? 4 : 2)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-violet-400" animate={{ width: `${Math.max(k * k * 100 * 3, 0.5)}%` }} transition={spring.snappy} />
        </div>
        <p className="mt-2 text-right text-[11px] text-white/35">barra ampliada 3× para ficar visível</p>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ 4. Observe

function SourceBadge() {
  const { data } = useLabRuntime()
  if (data.status !== 'ready') return null
  const d = data.data
  return d.source === 'tess' ? (
    <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/75 backdrop-blur-xl">
      TESS{d.sector ? ` · Setor ${d.sector}` : ''} · {d.target}
    </span>
  ) : (
    <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-xs text-amber-100 backdrop-blur-xl" title="Gerado com os parâmetros reais do planeta, mas não é a medição do telescópio">
      Dados simulados · {d.target}
    </span>
  )
}

function DataGate({ children }: { children: React.ReactNode }) {
  const { data, useSimulated } = useLabRuntime()
  if (data.status === 'loading') {
    return (
      <Panel className="relative grid aspect-[4/3] place-items-center">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-amber-200" />
          <p className="text-sm text-white/60">Baixando a curva de luz do arquivo MAST…</p>
          <p className="mt-1 text-xs text-white/35">cerca de 20 mil medições de brilho</p>
        </div>
      </Panel>
    )
  }
  if (data.status === 'error') {
    return (
      <Panel className="grid aspect-[4/3] place-items-center p-8 text-center">
        <div>
          <p className="text-[15px] text-white/80">{data.message}</p>
          <p className="mt-2 text-sm text-white/45">Você pode continuar com uma versão simulada, feita com os parâmetros reais do planeta.</p>
          <Button variant="secondary" className="mt-5" onClick={useSimulated}>
            Usar dados simulados
          </Button>
        </div>
      </Panel>
    )
  }
  return <>{children}</>
}

export function Observe({ lab, setReady, setAnswer, answers }: StepProps) {
  const { data } = useLabRuntime()
  const [found, setFound] = useState<number[]>(() => (Array.isArray(answers.found) ? (answers.found as number[]) : []))
  const [hover, setHover] = useState<number | null>(null)
  const [fold, setFold] = useState(answers.folded ? 1 : 0)
  const [folding, setFolding] = useState(false)
  const lc = data.status === 'ready' ? data.data : null
  const goal = 3

  useEffect(() => setReady(fold >= 1), [fold, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state: lc
      ? fold >= 1
        ? `Trânsitos empilhados (curva dobrada no período de ${formatNumber(lc.period, 3)} dia). Ruído ≈ ${lc.noisePpm} ppm.`
        : `Curva de luz completa de ${lc.target} (${lc.source === 'tess' ? 'TESS' : 'simulada'}), ${Math.round(lc.series[lc.series.length - 1]?.t ?? 0)} dias. O aluno encontrou ${found.length} de ${goal} quedas.`
      : 'Carregando dados.',
  })

  const transits = useMemo(() => {
    if (!lc) return []
    const end = lc.series[lc.series.length - 1]?.t ?? 0
    const out: number[] = []
    for (let t = lc.t0 - Math.floor(lc.t0 / lc.period) * lc.period; t <= end; t += lc.period) {
      // only transits that actually have data around them
      if (lc.series.some((p) => Math.abs(p.t - t) < 0.05)) out.push(t)
    }
    return out
  }, [lc])

  const select = (x: number) => {
    if (!lc || fold > 0) return
    const near = transits.find((t) => Math.abs(t - x) < Math.max(0.18, lc.durationHours / 24))
    if (near !== undefined && !found.includes(near)) {
      const next = [...found, near]
      setFound(next)
      setAnswer('found', next)
    }
  }

  const startFold = () => {
    if (!lc) return
    setFolding(true)
    const start = performance.now()
    const dur = 1700
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setFold(p)
      if (p < 1) requestAnimationFrame(tick)
      else {
        setFolding(false)
        setAnswer('folded', true)
      }
    }
    requestAnimationFrame(tick)
  }

  const plot = useMemo(() => {
    if (!lc) return null
    const T = lc.series[lc.series.length - 1].t
    const windowH = Math.max(lc.durationHours * 1.6, 3)
    const e = fold < 0.5 ? 4 * fold ** 3 : 1 - (-2 * fold + 2) ** 3 / 2 // easeInOutCubic
    const inside: { x: number; y: number }[] = []
    const outside: { x: number; y: number }[] = []
    for (const p of lc.series) {
      const h = phaseOf(p.t, lc.period, lc.t0) * lc.period * 24
      const xa = p.t / T
      const inWin = Math.abs(h) <= windowH
      const xb = inWin ? (h + windowH) / (2 * windowH) : xa
      const pt = { x: xa + (xb - xa) * e, y: p.f * 100 }
      ;(inWin ? inside : outside).push(pt)
    }
    const ys = lc.series.map((p) => p.f)
    const lo = Math.min(...ys)
    const hi = Math.max(...ys)
    const pad = (hi - lo) * 0.15
    return { inside, outside, T, windowH, y: [(lo - pad) * 100, (hi + pad) * 100] as [number, number] }
  }, [lc, fold])

  const folded = fold >= 1
  const allFound = found.length >= goal

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      wideInstrument
      instrument={
        <DataGate>
          {lc && plot && (
            <Panel className="relative">
              <div className="absolute right-4 top-4 z-10">
                <SourceBadge />
              </div>
              <Plot
                ariaLabel={folded ? 'Trânsitos empilhados: brilho em função das horas a partir do centro do trânsito' : 'Brilho da estrela ao longo de cerca de 27 dias'}
                className="aspect-[4/3] w-full pt-10"
                x={[0, 1]}
                y={plot.y}
                xTicks={folded ? ticks(-plot.windowH, plot.windowH, 6).map((h) => (h + plot.windowH) / (2 * plot.windowH)) : ticks(0, plot.T, 6).map((d) => d / plot.T)}
                formatX={(v) => (folded ? formatNumber(v * 2 * plot.windowH - plot.windowH, 0) + ' h' : formatNumber(v * plot.T, 0) + ' d')}
                yTicks={ticks(plot.y[0], plot.y[1], 4)}
                formatY={(v) => formatNumber(v, 1) + '%'}
                xLabel={folded ? 'horas a partir do centro do trânsito' : 'dias de observação'}
                yLabel="brilho"
                series={[
                  { kind: 'dots', points: plot.outside, color: 'rgba(255,255,255,0.75)', size: 1.6, alpha: 1 - fold },
                  { kind: 'dots', points: plot.inside, color: fold > 0 ? 'rgba(253,224,171,0.95)' : 'rgba(255,255,255,0.75)', size: fold > 0 ? 2.2 : 1.6 },
                ]}
                markers={fold > 0 ? [] : (allFound ? transits : found).map((t) => ({ x: t / plot.T }))}
                band={!folded && hover !== null ? [hover - 0.012, hover + 0.012] : null}
                onPointer={fold > 0 ? undefined : setHover}
                onSelect={fold > 0 ? undefined : (x) => select(x * plot.T)}
              />
            </Panel>
          )}
        </DataGate>
      }
    >
      <p className="text-[15px] leading-relaxed text-white/70">
        Cada ponto é uma medida do brilho da estrela <strong className="font-medium text-white">{lab.target?.name}</strong>, a cerca de{' '}
        {formatNumber(lab.target?.distanceLy ?? 0, 0)} anos-luz, feita pelo telescópio espacial TESS. Isso é uma{' '}
        <strong className="font-medium text-white">curva de luz</strong>.
      </p>
      {lc?.source === 'simulado' && (
        <Callout tone="warn">
          Não conseguimos falar com o arquivo MAST agora. Estes pontos foram <strong>simulados</strong> com os parâmetros reais do planeta, com o
          mesmo ruído do TESS. Tudo funciona igual, e você pode refazer com os dados reais depois.
        </Callout>
      )}
      {!folded ? (
        <>
          <Callout tone="info">
            Procure as pequenas quedas de brilho, iguais às do simulador. <strong>Toque em {goal} delas.</strong>
          </Callout>
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
          </div>
          <AnimatePresence>
            {allFound && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Callout tone="good">
                  Achou! As quedas se repetem a cada <strong>{formatNumber((lc?.period ?? 0) * 24, 1)} horas</strong>: esse é o ano do planeta, o{' '}
                  <strong>período orbital</strong>. Cada queda sozinha é ruidosa. E se juntássemos todas?
                </Callout>
                <Button size="lg" onClick={startFold} disabled={folding}>
                  <Sparkles className="h-4 w-4" /> Empilhar os trânsitos
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!allFound && lc && (
            <button
              onClick={() => {
                setFound(transits.slice(0, goal))
                setAnswer('found', transits.slice(0, goal))
              }}
              className="self-start text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
            >
              Não estou achando, me mostre
            </button>
          )}
        </>
      ) : (
        <Callout tone="good">
          Dobramos a curva a cada período: todos os trânsitos ficaram um sobre o outro. Somando {transits.length} trânsitos, o ruído
          aleatório se cancela e a <strong>forma da sombra</strong> aparece nítida. É assim que astrônomos enxergam planetas pequenos.
        </Callout>
      )}
    </StepFrame>
  )
}

// ------------------------------------------------------------ 5. Meça

export function Meca({ lab, setReady, setAnswer, answers }: StepProps) {
  const { data } = useLabRuntime()
  const lc = data.status === 'ready' ? data.data : null
  const t = lab.target!
  const [k, setK] = useState(() => (typeof answers.k === 'number' ? (answers.k as number) : 0.06))
  const { ask } = useVega()
  const best = lc?.fitRadiusRatio ?? t.radiusRatio
  const err = Math.abs(k - best) / best
  const fitted = err < 0.04
  const [locked, setLocked] = useState(Boolean(answers.measured))

  useEffect(() => {
    if (fitted && !locked) {
      setLocked(true)
      setAnswer('measured', true)
    }
  }, [fitted, locked, setAnswer])
  useEffect(() => setReady(locked), [locked, setReady])

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
      wideInstrument
      instrument={
        <DataGate>
          {lc && plot && (
            <Panel className="relative">
              <div className="absolute right-4 top-4 z-10 flex gap-2">
                <SourceBadge />
              </div>
              <Plot
                ariaLabel="Trânsitos empilhados com a curva do modelo"
                className="aspect-[4/3] w-full pt-10"
                x={[-plot.windowH, plot.windowH]}
                y={plot.y}
                xTicks={ticks(-plot.windowH, plot.windowH, 6)}
                formatX={(v) => `${formatNumber(v, 0)} h`}
                yTicks={ticks(plot.y[0], plot.y[1], 4)}
                formatY={(v) => formatNumber(v, 1) + '%'}
                xLabel="horas a partir do centro do trânsito"
                yLabel="brilho"
                series={[
                  { kind: 'dots', points: lc.folded.map((p) => ({ x: p.h, y: p.f * 100 })), color: 'rgba(255,255,255,0.35)', size: 1.4 },
                  { kind: 'dots', points: lc.foldedBinned.map((p) => ({ x: p.h, y: p.f * 100 })), color: '#ffffff', size: 3.2 },
                  { kind: 'line', points: plot.model, color: fitted ? '#6ee7b7' : '#f6b74e', width: 2.6 },
                ]}
              />
            </Panel>
          )}
        </DataGate>
      }
    >
      <p className="text-[15px] leading-relaxed text-white/70">
        A linha colorida é um <strong className="font-medium text-white">modelo</strong>: o trânsito que um planeta do tamanho escolhido
        produziria nesta estrela. Mude o tamanho até a linha passar pelo meio dos pontos brancos.
      </p>
      <Slider
        label="Tamanho do planeta (Rp/R★)"
        min={0.03}
        max={0.22}
        step={0.0005}
        value={k}
        onChange={(v) => {
          setK(v)
          setAnswer('k', v)
        }}
        display={formatNumber(k, 3)}
      />
      <div>
        <div className="mb-2 flex justify-between text-[13px]">
          <span className="text-white/55">Encaixe</span>
          <span className={cn('font-medium', fitted ? 'text-emerald-300' : 'text-white/80')}>{status}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn('h-full rounded-full', fitted ? 'bg-emerald-300' : 'bg-gradient-to-r from-amber-300 to-amber-200')}
            animate={{ width: `${meter * 100}%` }}
            transition={spring.snappy}
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {locked ? (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Readout label="Queda de brilho" value={pct(centralDepth(k, t.impact, t.limbDarkening))} />
              <Readout label="Raio do planeta" value={`${formatNumber(rpJup, 2)} × Júpiter`} accent />
            </div>
            <SizeCompare rpJup={rpJup} name={`${t.name} b`} />
            <p className="text-[14px] leading-relaxed text-white/60">
              Com a estrela tendo {formatNumber(t.starRadiusSun, 2)} vezes o raio do Sol, o planeta tem{' '}
              <strong className="text-white">{formatNumber(rpJup, 1)} vezes o raio de Júpiter</strong>, e dá uma volta na estrela a cada{' '}
              {formatNumber(t.period * 24, 1)} horas. É um &ldquo;Júpiter quente&rdquo;: gigante, colado na estrela e inchado pelo calor.
            </p>
          </motion.div>
        ) : (
          <motion.div key="hint" exit={{ opacity: 0 }}>
            <Button variant="ghost" onClick={() => ask('Como eu sei se o modelo encaixou nos dados?')} className="-ml-3">
              <Sparkles className="h-4 w-4 text-violet-300" /> Pedir uma dica à Vega
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </StepFrame>
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
    <div className="flex items-end justify-around gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] px-4 py-5">
      {items.map((it, i) => {
        const d = Math.max((it.r / max) * 96, 4)
        return (
          <div key={it.label} className="flex flex-col items-center gap-2">
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring.soft, delay: 0.1 + i * 0.12 }}
              className="rounded-full"
              style={{
                width: d,
                height: d,
                background: `radial-gradient(circle at 35% 30%, #fff8, ${it.color} 45%, #0008 120%)`,
                boxShadow: `0 0 24px ${it.color}55`,
              }}
            />
            <span className="text-[11px] text-white/55">{it.label}</span>
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
    q: 'Um astrônomo alienígena observa a Terra passando na frente do Sol. Qual é a queda de brilho que ele mede?',
    options: ['≈ 1 %', '≈ 0,1 %', '≈ 0,01 %', '≈ 0,001 %'],
    answer: 2,
    explain:
      'O Sol tem 109 vezes o raio da Terra: k = 1/109 ≈ 0,0092. Ao quadrado: δ ≈ 0,000084 = 0,0084 % (84 partes por milhão). É uma queda minúscula, por isso achar planetas como a Terra é tão difícil.',
    tint: 'sun' as const,
    k: 1 / R_SUN_IN_R_EARTH,
  },
  {
    id: 'ana-vermelha',
    q: 'Agora, um planeta do tamanho de Júpiter passa na frente de uma anã vermelha, uma estrela com só 0,2 vezes o raio do Sol. Qual é a queda?',
    options: ['≈ 1 %', '≈ 5 %', '≈ 25 %', '≈ 100 %'],
    answer: 2,
    explain:
      'Júpiter tem 0,1 raio solar. Comparado a uma estrela de 0,2 raio solar: k = 0,1/0,2 = 0,5. Ao quadrado: δ ≈ 0,25 = 25 %. Estrelas pequenas deixam os planetas muito mais fáceis de ver.',
    tint: 'red' as const,
    k: 0.5,
  },
]

export function ESe({ lab, setReady, setAnswer, answers }: StepProps) {
  const picks = (answers.challenges as Record<string, number> | undefined) ?? {}
  const current = CHALLENGES.findIndex((c) => picks[c.id] === undefined)
  const [shown, setShown] = useState(current === -1 ? CHALLENGES.length - 1 : current)
  const c = CHALLENGES[shown]
  const picked = picks[c.id]
  useEffect(() => setReady(current === -1), [current, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state: `Desafio ${shown + 1} de ${CHALLENGES.length}: ${c.q} ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu ${c.options[picked]} (${picked === c.answer ? 'certo' : 'errado'}).`}`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      instrument={
        <Panel className="relative">
          <TransitSimulator key={c.id} k={picked !== undefined ? c.k : 0.0001} starTint={c.tint} sceneOnly={picked === undefined} b={0.1} className="aspect-[4/3.2] w-full" />
          <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/75 backdrop-blur-xl">
            {c.tint === 'red' ? 'Anã vermelha · 0,2 R☉' : 'O Sol visto de longe'}
          </span>
        </Panel>
      }
    >
      <div className="flex gap-1.5">
        {CHALLENGES.map((ch, i) => (
          <span key={ch.id} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', i < shown || picks[ch.id] !== undefined ? 'bg-white/70' : i === shown ? 'bg-white/30' : 'bg-white/10')} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={c.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={spring.soft} className="space-y-4">
          <p className="text-[16px] leading-relaxed text-white/85">{c.q}</p>
          <div className="grid grid-cols-2 gap-2">
            {c.options.map((o, i) => (
              <Choice
                key={o}
                selected={picked === i}
                state={picked === undefined ? null : i === c.answer ? 'correct' : picked === i ? 'wrong' : null}
                disabled={picked !== undefined}
                onClick={() => setAnswer('challenges', { ...picks, [c.id]: i })}
              >
                <span className="font-mono">{o}</span>
              </Choice>
            ))}
          </div>
          {picked !== undefined && (
            <Callout tone={picked === c.answer ? 'good' : 'info'}>
              {picked === c.answer ? 'Exato. ' : 'Quase! '}
              {c.explain}
            </Callout>
          )}
          {picked !== undefined && shown < CHALLENGES.length - 1 && (
            <Button variant="secondary" onClick={() => setShown(shown + 1)}>
              Próximo desafio
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
      {current === -1 && (
        <button
          onClick={() => {
            setAnswer('challenges', {})
            setShown(0)
          }}
          className="inline-flex items-center gap-1.5 self-start text-[13px] text-white/40 hover:text-white/70"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Refazer desafios
        </button>
      )}
    </StepFrame>
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady, answers, onExplore }: StepProps & { onExplore?: () => void }) {
  const t = lab.target!
  const { data } = useLabRuntime()
  const simulated = data.status === 'ready' && data.data.source === 'simulado'
  const k = typeof answers.k === 'number' ? (answers.k as number) : t.radiusRatio
  const rpJup = k * t.starRadiusSun * R_SUN_IN_R_JUP
  const diff = ((k - t.radiusRatio) / t.radiusRatio) * 100
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `O aluno mediu k = ${formatNumber(k, 3)}, Rp ≈ ${formatNumber(rpJup, 2)} R♃.` })

  return (
    <div className="mx-auto max-w-2xl text-center">
      <Medal accent={lab.accent} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} className="eyebrow mt-8" style={{ color: lab.accent }}>
        Conquista desbloqueada
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...spring.soft, delay: 0.7 } }}
        className="mt-3 text-[36px] font-semibold tracking-[-0.03em] text-white sm:text-[44px]"
      >
        {lab.achievement?.title}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.85 } }} className="mx-auto mt-3 max-w-lg text-[17px] leading-relaxed text-white/60">
        {simulated
          ? 'Você mediu o tamanho de um planeta fora do Sistema Solar. Desta vez com dados simulados; refaça quando o MAST estiver disponível para medir com os dados reais do TESS.'
          : lab.achievement?.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { ...spring.soft, delay: 1 } }}
        className="mt-10 grid gap-3 text-left sm:grid-cols-3"
      >
        <Summary label="Você mediu" value={`k = ${formatNumber(k, 3)}`} sub={`${formatNumber(rpJup, 2)} raios de Júpiter`} />
        <Summary label="Artigo científico" value={`k = ${formatNumber(t.radiusRatio, 4)}`} sub={`diferença de ${formatNumber(Math.abs(diff), 1)} %`} />
        <Summary label="Ano do planeta" value={`${formatNumber(t.period * 24, 1)} h`} sub="período orbital" />
      </motion.div>

      <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.15 } }} className="mx-auto mt-8 max-w-lg space-y-2 text-left text-[15px] text-white/70">
        <li>• Um planeta que passa na frente da estrela bloqueia uma fração da luz: <strong className="text-white">δ ≈ (Rp/R★)²</strong>.</li>
        <li>• O intervalo entre as quedas é o <strong className="text-white">período orbital</strong>.</li>
        <li>• Empilhar muitos trânsitos reduz o ruído e revela a forma da sombra.</li>
      </motion.ul>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.25 } }} className="mt-6 text-xs text-white/35">
        Referência: {t.reference}
      </motion.p>
      {onExplore && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.3 } }} className="mt-8">
          <Button variant="secondary" onClick={onExplore}>
            Ver {t.name} no Céu
          </Button>
        </motion.div>
      )}
    </div>
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="eyebrow !text-[10px]">{label}</p>
      <p className="mt-1.5 font-mono text-[18px] text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/45">{sub}</p>
    </div>
  )
}

function Medal({ accent }: { accent: string }) {
  return (
    <div className="relative mx-auto h-40 w-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1.25 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      <svg viewBox="0 0 160 160" className="relative h-full w-full">
        <motion.circle cx="80" cy="80" r="66" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
        <motion.circle cx="80" cy="80" r="56" fill="#0a0b10" stroke="rgba(255,255,255,0.08)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.3 }} style={{ originX: '80px', originY: '80px' }} />
        <motion.circle cx="80" cy="80" r="26" fill="url(#medalStar)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.45 }} style={{ originX: '80px', originY: '80px' }} />
        <motion.circle cx="80" cy="80" r="8" fill="#05060a" initial={{ cx: 40, opacity: 0 }} animate={{ cx: 86, opacity: 1 }} transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        <defs>
          <radialGradient id="medalStar">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="70%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="#e88a2c" />
          </radialGradient>
        </defs>
      </svg>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 110, opacity: [0, 1, 0] }}
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
