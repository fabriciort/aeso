'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Tex } from '@/components/math/Tex'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  AGE_ANSWER,
  AGE_MAX,
  AGE_TOL,
  asSketch,
  carbon,
  coffee,
  EULER_STEPS,
  eulerMaxError,
  H_CHOICES,
  HAND,
  HALF_LIFE,
  SEPARATION,
  sketchCoverage,
  sketchError,
  T10,
  T_TO_40,
  type OdeLive,
  type SolveStep,
} from './shared'

// "A equação que prevê o futuro". O Palco é contínuo (Stage.tsx); estas
// Etapas contam a história e guardam os controles.

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-10 min-w-[44px] rounded-full border px-3.5 text-[13.5px] tabular-nums transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

function Dot({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/55">
      <motion.span
        animate={{ scale: done ? 1 : 0.8, backgroundColor: done ? 'rgb(110,231,183)' : 'rgba(255,255,255,0.15)' }}
        transition={spring.snappy}
        className="grid h-5 w-5 place-items-center rounded-full"
      >
        {done && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
      </motion.span>
      {label}
    </span>
  )
}

function ShowMe({ onClick, children = 'Me mostre' }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="ml-auto min-h-[44px] text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
      {children}
    </button>
  )
}

function Readout({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[16px] tabular-nums text-white" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  )
}

/** Marca uma tarefa como feita uma vez só, com vibração. */
function useTask(done: boolean, key: string, props: StepProps) {
  const { answers, setAnswer } = props
  const was = Boolean(answers[key])
  useEffect(() => {
    if (done && !was) {
      setAnswer(key, true)
      haptic([10, 40, 10])
    }
  }, [done, was, key, setAnswer])
  return was || done
}

/** Timer que se limpa sozinho ao desmontar. */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
}

const deg = (v: number, d = 1) => `${fmt(v, d)} °C`

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const sketch = asSketch(answers.sketch)
  const cov = sketchCoverage(sketch)
  const skipped = Boolean(answers.sketchSkipped)
  const drawn = useTask(cov >= 0.75, 'sketchDone', props)
  useEffect(() => setReady(scene < 2 || drawn || skipped), [scene, drawn, skipped, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state:
      scene < 2
        ? `Cena ${scene + 1}/3. Xícara de café a 90 °C numa sala a 20 °C (exemplo imaginado).`
        : `Cena 3/3. O aluno desenha a queda de temperatura; cobriu ${fmt(cov * 100, 0)} % dos 60 minutos.`,
  })

  const captions = [
    <>
      Imagine um café recém-passado: <strong>90 °C</strong>. A sala está a <strong>20 °C</strong>. O que acontece com ele na próxima hora?
    </>,
    <>
      Vamos registrar a temperatura <strong>T</strong> minuto a minuto. O ponto laranja é o começo: 90 °C no minuto 0.
    </>,
    <>
      Sua vez: <strong>desenhe com o dedo</strong> como você acha que a temperatura cai até os 60 minutos.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 2 && !drawn && !skipped ? 'Comece no ponto laranja e arraste o dedo para a direita, até o fim do gráfico.' : undefined}
      controls={
        scene === 2 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', drawn ? 'bg-emerald-300' : 'bg-white/70')} animate={{ width: `${Math.round(cov * 100)}%` }} transition={spring.snappy} />
              </div>
              <span className={cn('w-24 text-right text-[13px]', drawn ? 'text-emerald-300' : 'text-white/55')}>{drawn ? 'Desenhado!' : `${fmt(cov * 100, 0)} % da hora`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                onClick={() => {
                  setAnswer('sketch', null)
                  setAnswer('sketchDone', false)
                }}
              >
                Apagar
              </Chip>
              {!drawn && !skipped && <ShowMe onClick={() => setAnswer('sketchSkipped', true)}>Prefiro não desenhar</ShowMe>}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const Q1 = ['No começo, bem quente', 'No fim, perto da sala', 'Sempre no mesmo ritmo', 'No meio da hora']
const Q1_ANSWER = 0
const Q2 = ['Sim, em cerca de 1 hora', 'Sim, depois de umas 2 horas', 'Chega cada vez mais perto, sem chegar', 'Esfria abaixo de 20 °C']
const Q2_ANSWER = 2

function Choices({ options, answer, chosen, onPick }: { options: string[]; answer: number; chosen: number | null; onPick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o, i) => (
        <Choice key={o} selected={chosen === i} state={chosen === null ? null : i === answer ? 'correct' : chosen === i ? 'wrong' : null} disabled={chosen !== null} onClick={() => onPick(i)}>
          <span className="block text-[14px] leading-snug">{o}</span>
        </Choice>
      ))}
    </div>
  )
}

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const later = useLater()
  const p1 = typeof answers.pred1 === 'number' ? (answers.pred1 as number) : null
  const p2 = typeof answers.pred2 === 'number' ? (answers.pred2 as number) : null
  const err = sketchError(asSketch(answers.sketch))
  useEffect(() => setReady(scene === 0 ? p1 !== null : scene === 2 ? p2 !== null : true), [scene, p1, p2, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state:
      scene <= 1
        ? `Pergunta: quando o café esfria mais rápido? ${p1 === null ? 'Ainda não respondeu.' : `Respondeu "${Q1[p1]}" (${p1 === Q1_ANSWER ? 'certo' : 'errado'}).`}${Number.isFinite(err) ? ` O desenho dele ficou em média a ${fmt(err, 0)} °C da curva real.` : ''}`
        : `Pergunta: o café chega a exatamente 20 °C? ${p2 === null ? 'Ainda não respondeu.' : `Respondeu "${Q2[p2]}" (${p2 === Q2_ANSWER ? 'certo' : 'errado'}).`}`,
  })

  const pick = (key: 'pred1' | 'pred2', i: number, right: number, next: number) => {
    setAnswer(key, i)
    haptic(i === right ? [10, 40, 10] : 20)
    later(() => setScene(next), 650)
  }

  const captions = [
    <>
      Aposte: em que momento o café perde calor <strong>mais rápido</strong>?
    </>,
    p1 === Q1_ANSWER ? (
      <>
        <strong>Isso!</strong> Bem quente, ele perde 3,5 °C por minuto; aos 40 min, só 0,5. A queda vai <strong>freando</strong>.
      </>
    ) : (
      <>
        Ótimo erro para aprender! Veja as inclinações: 3,5 °C/min no início, só 0,5 aos 40 min. A queda <strong>freia</strong>: não é reta.
      </>
    ),
    <>
      E depois de muito tempo? O café chega a <strong>exatamente 20 °C</strong>?
    </>,
    p2 === Q2_ANSWER ? (
      <>
        <strong>Exato.</strong> Quanto mais perto de 20 °C, mais devagar ele esfria. Após 2 horas, ainda está a 20,17 °C.
      </>
    ) : (
      <>
        Ótimo erro para aprender! Perto de 20 °C, a queda fica lenta demais: após 2 horas ainda marca 20,17 °C. Chega perto, nunca chega.
      </>
    ),
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 0 && p1 === null ? 'Olhe o seu desenho: onde ele é mais inclinado?' : undefined}
      controls={
        scene === 0 ? (
          <Choices options={Q1} answer={Q1_ANSWER} chosen={p1} onPick={(i) => pick('pred1', i, Q1_ANSWER, 1)} />
        ) : scene === 2 ? (
          <Choices options={Q2} answer={Q2_ANSWER} chosen={p2} onPick={(i) => pick('pred2', i, Q2_ANSWER, 3)} />
        ) : scene === 1 ? (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Seu desenho" value={Number.isFinite(err) ? `± ${deg(err, 0)}` : '—'} />
            <Readout label="Aos 60 min" value={deg(coffee(60))} accent={lab.accent} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Após 2 horas" value={deg(coffee(120), 2)} accent={lab.accent} />
            <Readout label="Diferença cai à metade" value={`a cada ${fmt(Math.LN2 / 0.05, 1)} min`} />
          </div>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 5, 'entendaScene')
  const [live, setLive] = useLive<OdeLive>()
  const probe = live.probe ?? { t: 8, T: 70 }
  const later = useLater()
  const hot = useTask(probe.T >= 80, 'probeHot', props)
  const room = useTask(Math.abs(probe.T - 20) <= 1.5, 'probeRoom', props)
  const drops = typeof answers.drops === 'number' ? (answers.drops as number) : 0
  const dropped = drops >= 3
  const slope = -0.05 * (probe.T - 20)
  useEffect(() => setReady(scene === 0 ? hot && room : scene === 3 ? dropped : true), [scene, hot, room, dropped, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state:
      scene <= 1
        ? `Cena ${scene + 1}/5. Ponto em T = ${fmt(probe.T, 0)} °C, inclinação ${fmt(slope, 2)} °C/min. Visitou: quente ${hot ? 'sim' : 'não'}, sala ${room ? 'sim' : 'não'}.`
        : scene === 3
          ? `Campo de direções do café. O aluno soltou ${drops} cafés.`
          : `Cena ${scene + 1}/5: campo de direções de dT/dt = −0,05(T − 20).`,
  })

  const setT = (T: number) => setLive({ probe: { t: probe.t, T } })

  const captions = [
    <>
      Quanto mais quente que a sala, mais rápido ele esfria. <strong>Arraste o ponto</strong>: o tracinho mostra o ritmo ali.
    </>,
    <>
      Essa regra tem fórmula: <Tex say="d T d t igual a menos k vezes T menos 20">{'\\tfrac{dT}{dt} = -k\\,(T - 20)'}</Tex>, com k = 0,05 por minuto. Ela dá a <strong>inclinação</strong>.
    </>,
    <>
      Ponha um tracinho em cada ponto (t, T) e surge um <strong>campo de direções</strong>: o mapa de como tudo muda.
    </>,
    dropped ? (
      <>
        Todos vão para <strong>20 °C</strong>, até um café gelado, que esquenta. Ninguém escolhe o caminho: as setas escolhem.
      </>
    ) : (
      <>
        <strong>Toque no plano</strong> para soltar cafés com outras temperaturas. Cada um segue as setas.
      </>
    ),
    <>
      Uma equação diferencial é uma <strong>regra de mudança</strong>. A solução é a curva que obedece à regra em todo lugar.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 1 ? 'Essa regra tem fórmula: d T d t igual a menos k vezes T menos 20, com k igual a 0,05 por minuto. Ela dá a inclinação.' : undefined}
      nudge={
        scene === 0 && !(hot && room)
          ? hot
            ? 'Leve o ponto até a linha tracejada da sala. O que acontece com o tracinho?'
            : 'Suba o ponto até bem perto do topo, onde o café está mais quente.'
          : scene === 3 && !dropped
            ? 'Toque em qualquer lugar do gráfico, inclusive embaixo da linha da sala.'
            : undefined
      }
      controls={
        scene <= 1 ? (
          <div className="space-y-3">
            <Slider label="Temperatura do ponto" min={0} max={100} step={0.5} value={probe.T} onChange={setT} display={`${deg(probe.T, 0)} · ${fmt(slope, 2)} °C/min`} />
            {scene === 0 && (
              <div className="flex items-center gap-4">
                <Dot done={hot} label="Quente (≥ 80 °C)" />
                <Dot done={room} label="Sala (20 °C)" />
                {!(hot && room) && (
                  <ShowMe
                    onClick={() => {
                      setLive({ probe: { t: probe.t, T: 90 } })
                      later(() => setLive({ probe: { t: probe.t, T: 20 } }), 1100)
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ) : scene === 3 ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scale: i < drops ? 1 : 0.85, backgroundColor: i < drops ? lab.accent : 'rgba(255,255,255,0.12)' }}
                  transition={spring.snappy}
                  className="h-2.5 w-8 rounded-full"
                />
              ))}
            </div>
            <span className="text-sm text-white/55">{Math.min(drops, 3)} de 3 cafés</span>
            {!dropped && (
              <ShowMe
                onClick={() => {
                  setLive({ drop: { id: Date.now(), kind: 'cool', pts: [[0, 100], [6, 48], [0, 4]] } })
                  setAnswer('drops', 3)
                }}
              />
            )}
          </div>
        ) : scene === 4 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-center text-[17px] text-white">
            <Tex block say="regra: d T d t igual a menos k vezes T menos 20. Solução: a curva que segue as setas.">{'\\underbrace{\\tfrac{dT}{dt} = -k\\,(T-20)}_{\\text{regra}}\\ \\Rightarrow\\ \\underbrace{T(t)}_{\\text{solução}}'}</Tex>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

export function MundoReal(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'mundoScene')
  const [live, setLive] = useLive<OdeLive>()
  const later = useLater()
  const age = live.age ?? 4000
  const found = typeof answers.ageFound === 'number'
  const N = carbon(age)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (scene === 2 && !found && Math.abs(age - AGE_ANSWER) <= AGE_TOL) {
      setAnswer('ageFound', age)
      haptic([14, 60, 20])
      setBurst(true)
      later(() => setBurst(false), 1000)
      later(() => setScene(3), 1100)
    }
  }, [scene, found, age, setAnswer, setScene, later])
  useEffect(() => setReady(scene === 2 ? found : true), [scene, found, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'mundo-real',
    state:
      scene === 2
        ? `Datação: cursor em ${fmt(age, 0)} anos, restam ${fmt(N, 1)} % do C-14; a amostra tem 25 %. ${found ? 'Encontrou.' : 'Ainda procurando.'}`
        : `Cena ${scene + 1}/4: decaimento do carbono-14, meia-vida de 5.730 anos.`,
  })

  const captions = [
    <>
      <strong>No mundo real:</strong> o carbono-14 decai pela mesma lógica. Quanto mais átomos há, mais deles se desintegram por ano.
    </>,
    <>
      A meia-vida do C-14 é <strong>5.730 anos</strong>: a cada 5.730 anos, sobra metade. Igual ao café, só que o alvo é zero.
    </>,
    <>
      Um osso tem <strong>25 %</strong> do C-14 original (exemplo imaginado). Arraste no gráfico até achar a idade dele.
    </>,
    <>
      <strong>Duas meias-vidas: ≈ 11.460 anos.</strong> Metade da metade é um quarto. É assim que se datam ossos e fogueiras antigas.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 2 && !found ? 'Procure onde a curva cruza a linha azul de 25 %. Quantas metades cabem de 100 % até lá?' : undefined}
      controls={
        scene === 2 ? (
          <div className="relative space-y-2">
            {burst && <Burst />}
            <Slider label="Idade do osso" min={0} max={AGE_MAX} step={10} value={age} onChange={(v) => !found && setLive({ age: v })} display={`${fmt(age, 0)} anos · ${fmt(N, 1)} %`} />
            <div className="flex items-center gap-2 text-[13px]">
              <span className={cn(found ? 'text-emerald-300' : 'text-white/55')}>
                {found ? 'Achou!' : N > 25.5 ? 'Ainda sobra C-14 demais: o osso é mais velho.' : N < 24.5 ? 'Sobrou pouco demais: volte no tempo.' : 'Quase!'}
              </span>
              {!found && <ShowMe onClick={() => setLive({ age: AGE_ANSWER })} />}
            </div>
          </div>
        ) : scene === 3 ? (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Sua idade" value={`${fmt(typeof answers.ageFound === 'number' ? (answers.ageFound as number) : AGE_ANSWER, 0)} anos`} accent={lab.accent} />
            <Readout label="2 × meia-vida" value={`${fmt(2 * HALF_LIFE, 0)} anos`} />
          </div>
        ) : scene === 1 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-center text-[16px] text-white">
            <Tex say="lambda igual a logaritmo natural de 2 sobre 5730, aproximadamente 1,21 vezes 10 elevado a menos 4 por ano">{'\\lambda = \\tfrac{\\ln 2}{5\\,730} \\approx 1{,}21\\times 10^{-4}\\ \\text{por ano}'}</Tex>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

function Solver({
  props,
  steps,
  doneKey,
  wrongPrefix,
  sceneBase,
  finished,
}: {
  props: StepProps
  steps: SolveStep[]
  doneKey: string
  wrongPrefix: string
  sceneBase: number
  finished: React.ReactNode
}) {
  const { lab, setAnswer, answers } = props
  const [, setLive] = useLive<OdeLive>()
  const later = useLater()
  const done = typeof answers[doneKey] === 'number' ? (answers[doneKey] as number) : 0
  const complete = done >= steps.length
  const step = steps[Math.min(done, steps.length - 1)]
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; pick: number } | null>(null)
  const [wrong, setWrong] = useState<number[]>([])

  useEffect(() => {
    setFeedback(null)
    setWrong([])
    setLive({ wrong: null })
  }, [done, setLive])
  useEffect(() => () => setLive({ wrong: null }), [setLive])
  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: `${wrongPrefix === 'sep' ? 'Problema 1 (separação de variáveis)' : 'Problema 2 (Euler à mão, h = 5)'}. ${complete ? 'Resolvido.' : `Passo ${done + 1} de ${steps.length}: ${step.prompt}`}${feedback && !feedback.ok ? ` Errou escolhendo ${step.options[feedback.pick].say}.` : ''}`,
  })

  const pick = (i: number) => {
    const o = step.options[i]
    if (o.ok) {
      haptic([10, 40, 10])
      setFeedback({ ok: true, text: o.why, pick: i })
      setLive({ wrong: null })
      later(() => setAnswer(doneKey, done + 1), 1200)
    } else {
      haptic(20)
      setWrong((w) => [...w, i])
      setFeedback({ ok: false, text: o.why, pick: i })
      setLive({ wrong: { key: `${wrongPrefix}-${done}`, i } })
    }
  }

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={sceneBase * 100 + done * 10 + (feedback ? 1 + feedback.pick : 0)}
      caption={
        complete ? (
          finished
        ) : feedback ? (
          <>
            <strong>{feedback.ok ? 'Isso.' : 'Ótimo erro para aprender!'}</strong> {feedback.text}
          </>
        ) : (
          step.prompt
        )
      }
      narration={!complete && !feedback ? `${step.promptSay} Opções: ${step.options.map((o) => o.say).join('; ou ')}.` : undefined}
      nudge={!complete && wrong.length >= 1 && !feedback?.ok ? 'Olhe o caderno: cada linha nasce da anterior. Que operação faz a próxima linha aparecer?' : undefined}
      controls={
        complete ? null : (
          <div className="grid grid-cols-2 gap-2">
            {step.options.map((o, i) => (
              <Choice
                key={i}
                state={feedback?.pick === i ? (feedback.ok ? 'correct' : 'wrong') : wrong.includes(i) ? 'wrong' : null}
                disabled={wrong.includes(i) || Boolean(feedback?.ok)}
                onClick={() => pick(i)}
              >
                <span className="-my-1.5 block overflow-x-auto whitespace-nowrap text-center text-[14.5px] [scrollbar-width:none]">
                  <Tex say={o.say}>{o.tex}</Tex>
                </span>
              </Choice>
            ))}
          </div>
        )
      }
    />
  )
}

export function Resolva(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 4, 'resolvaScene')
  const [live, setLive] = useLive<OdeLive>()
  const sepDone = (typeof answers.sepStep === 'number' ? (answers.sepStep as number) : 0) >= SEPARATION.length
  const eulerDone = (typeof answers.eulerStep === 'number' ? (answers.eulerStep as number) : 0) >= EULER_STEPS.length
  const h = live.h ?? 5
  const small = useTask(h <= 1.5, 'triedSmallH', props)
  const big = useTask(h >= 20, 'triedBigH', props)
  const soloT = live.soloT ?? 30
  const checked = live.soloChecked !== null && live.soloChecked !== undefined && live.soloChecked === soloT
  const soloRight = Math.abs(soloT - T_TO_40) <= 0.75
  const soloDone = Boolean(answers.soloDone)
  const [burst, setBurst] = useState(false)
  const later = useLater()

  useEffect(() => {
    setReady(scene === 0 ? sepDone : scene === 1 ? eulerDone : scene === 2 ? small && big : soloDone)
  }, [scene, sepDone, eulerDone, small, big, soloDone, setReady])

  if (scene === 0)
    return (
      <Solver
        key="sep"
        props={props}
        steps={SEPARATION}
        doneKey="sepStep"
        wrongPrefix="sep"
        sceneBase={0}
        finished={
          <>
            <strong>Resolvido!</strong> A fórmula prevê sem esperar: aos 10 minutos, <strong>T ≈ 62,5 °C</strong>. Confira o ponto no gráfico.
          </>
        }
      />
    )
  if (scene === 1)
    return (
      <Solver
        key="euler"
        props={props}
        steps={EULER_STEPS}
        doneKey="eulerStep"
        wrongPrefix="euler"
        sceneBase={1}
        finished={
          <>
            Euler deu <strong>{fmt(HAND[2], 1)} °C</strong>; a exata, {fmt(T10, 1)} °C. Erro de {fmt(T10 - HAND[2], 1)} °C: as tangentes passam por baixo da curva.
          </>
        }
      />
    )
  return <ResolvaRest {...{ props, scene, h, small, big, soloT, checked, soloRight, soloDone, burst, setBurst, later, setLive, setAnswer, lab }} />
}

function ResolvaRest({
  props,
  scene,
  h,
  small,
  big,
  soloT,
  checked,
  soloRight,
  soloDone,
  burst,
  setBurst,
  later,
  setLive,
  setAnswer,
  lab,
}: {
  props: StepProps
  scene: number
  h: number
  small: boolean
  big: boolean
  soloT: number
  checked: boolean
  soloRight: boolean
  soloDone: boolean
  burst: boolean
  setBurst: (b: boolean) => void
  later: (fn: () => void, ms: number) => void
  setLive: (p: Partial<OdeLive>) => void
  setAnswer: (k: string, v: unknown) => void
  lab: StepProps['lab']
}) {
  const shown = Boolean(props.answers.soloShown)
  const Tsolo = coffee(soloT)
  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state:
      scene === 2
        ? `Problema extra: Euler com passo h = ${fmt(h, 1)} min, erro máximo ${fmt(eulerMaxError(h), 1)} °C. Testou passo pequeno: ${small ? 'sim' : 'não'}; grande: ${big ? 'sim' : 'não'}.`
        : `Problema 3 (sozinho): quando T = 40 °C? Escolheu t = ${fmt(soloT, 1)} min${checked ? `, onde T = ${fmt(Tsolo, 1)} °C` : ''}. ${soloDone ? 'Resolvido.' : ''}`,
  })

  if (scene === 2)
    return (
      <StepFrame
        lab={lab}
        stepIndex={4}
        scene={200 + (small && big ? 1 : 0)}
        caption={
          small && big ? (
            <>
              Passo menor, erro menor: quase <strong>proporcional a h</strong>. Com h = 40, Euler pula para −50 °C e começa a oscilar.
            </>
          ) : (
            <>
              Mude o passo <strong>h</strong>. Passos pequenos colam na curva; passos grandes erram feio. Teste um bem pequeno e um enorme.
            </>
          )
        }
        nudge={!(small && big) ? (small ? 'Agora experimente h = 20 ou h = 40.' : 'Comece com h = 1 e veja o azul colar no laranja.') : undefined}
        controls={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {H_CHOICES.map((v) => (
                <Chip key={v} active={Math.abs(h - v) < 0.05} onClick={() => setLive({ h: v })}>
                  {fmt(v, 1)}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Dot done={small} label="h pequeno (≤ 1,5)" />
              <Dot done={big} label="h enorme (≥ 20)" />
              {!(small && big) && (
                <ShowMe
                  onClick={() => {
                    setLive({ h: 1 })
                    later(() => setLive({ h: 40 }), 1600)
                  }}
                />
              )}
            </div>
          </div>
        }
      />
    )

  const check = () => {
    setLive({ soloChecked: soloT })
    if (Math.abs(soloT - T_TO_40) <= 0.75) {
      setAnswer('soloDone', true)
      haptic([14, 60, 20])
      setBurst(true)
      later(() => setBurst(false), 1000)
    } else haptic(20)
  }
  const showMe = () => {
    setLive({ soloT: 25, soloChecked: 25 })
    setAnswer('soloShown', true)
    setAnswer('soloDone', true)
  }

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={300 + (checked ? (soloRight ? 2 : 1) : 0)}
      caption={
        checked && soloRight ? (
          <>
            <strong>{shown ? 'Era ≈ 25,1 min.' : 'Sozinho, e certo!'}</strong> 70e^(−0,05t) = 20 dá e^(−0,05t) = 2/7, então t = 20·ln 3,5 ≈ 25,1 min.
          </>
        ) : checked ? (
          <>
            Aos {fmt(soloT, 1)} min o termômetro marca <strong>{deg(Tsolo)}</strong>: {Tsolo > 40 ? 'precisa de mais tempo' : 'passou do ponto'}. Dica: isole a exponencial.
          </>
        ) : (
          <>
            <strong>Problema 3, sem ajuda:</strong> em quantos minutos o café chega a <strong>40 °C</strong>? Escolha t e confira.
          </>
        )
      }
      narration={!checked ? 'Problema 3, sem ajuda: em quantos minutos o café chega a 40 graus? Use T igual a 20 mais 70 e elevado a menos 0,05 t. Escolha t e confira.' : undefined}
      nudge={!soloDone ? 'Troque T por 40 na fórmula. O que sobra de um lado depois de tirar o 20 e dividir por 70?' : undefined}
      controls={
        <div className="relative space-y-2">
          {burst && <Burst />}
          <Slider label="Tempo t" min={0} max={60} step={0.5} value={soloT} onChange={(v) => setLive({ soloT: v })} display={`${fmt(soloT, 1)} min`} />
          <div className="flex items-center gap-2">
            <Button size="md" onClick={check} disabled={checked}>
              Conferir
            </Button>
            {!soloDone && <ShowMe onClick={showMe} />}
          </div>
        </div>
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

const LOG_Q = ['Crescem sem parar', 'Crescem e param perto de 1.000', 'Passam de 1.000 e voltam', 'Crescem e depois somem']
const LOG_ANSWER = 1
const EQ_Q = ['P = 0', 'P = 1.000', 'Os dois', 'Nenhum']
const EQ_ANSWER = 1

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'eseScene')
  const [, setLive] = useLive<OdeLive>()
  const later = useLater()
  const lp = typeof answers.logPred === 'number' ? (answers.logPred as number) : null
  const eq = typeof answers.eqPick === 'number' ? (answers.eqPick as number) : null
  const drops = (answers.logDrops as { below?: boolean; above?: boolean } | undefined) ?? {}
  const both = Boolean(drops.below && drops.above)
  useEffect(() => setReady(scene === 0 ? lp !== null : scene === 2 ? both : scene === 3 ? eq !== null : true), [scene, lp, both, eq, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state:
      scene <= 1
        ? `Lago com capacidade de 1.000 peixes, soltando 50. ${lp === null ? 'Ainda não previu.' : `Previu "${LOG_Q[lp]}" (${lp === LOG_ANSWER ? 'certo' : 'errado'}).`}`
        : scene === 2
          ? `O aluno solta populações: abaixo de 1.000 ${drops.below ? 'sim' : 'não'}, acima ${drops.above ? 'sim' : 'não'}.`
          : `Linha de fase: qual equilíbrio atrai? ${eq === null ? 'Ainda não respondeu.' : `Respondeu ${EQ_Q[eq]} (${eq === EQ_ANSWER ? 'certo' : 'errado'}).`}`,
  })

  const captions = [
    <>
      E se for um <strong>lago</strong>? Os peixes se multiplicam, mas cabem no máximo 1.000. Soltando 50, o que acontece?
    </>,
    lp === LOG_ANSWER ? (
      <>
        <strong>Isso!</strong> No começo quase dobra a cada 1,4 mês; perto de 1.000, o freio <strong>(1 − P/K)</strong> zera a inclinação.
      </>
    ) : (
      <>
        Ótimo erro para aprender! Sem limite seria exponencial (tracejado). O freio <strong>(1 − P/K)</strong> zera a inclinação em 1.000.
      </>
    ),
    both ? (
      <>
        Todas vão para <strong>1.000</strong>. Acima disso, o lago superlotado perde peixes. Veja as setas na linha de fase, à direita.
      </>
    ) : (
      <>
        <strong>Toque no plano</strong> para soltar outras populações: uma abaixo e uma acima de 1.000.
      </>
    ),
    eq === null ? (
      <>
        Na linha de fase, qual equilíbrio <strong>atrai</strong> as populações vizinhas?
      </>
    ) : (
      <>
        <strong>{eq === EQ_ANSWER ? 'Exato.' : 'Ótimo erro para aprender!'}</strong> As setas apontam para 1.000 dos dois lados: estável. De 0 elas fogem: instável.
      </>
    ),
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + (scene === 3 && eq !== null ? 1 : 0)}
      caption={captions[scene]}
      nudge={scene === 2 && !both ? 'Toque uma vez embaixo da linha de 1.000 e outra vez bem acima dela.' : scene === 3 && eq === null ? 'Siga as setinhas da linha vertical à direita: para onde elas apontam?' : undefined}
      controls={
        scene === 0 ? (
          <Choices
            options={LOG_Q}
            answer={LOG_ANSWER}
            chosen={lp}
            onPick={(i) => {
              setAnswer('logPred', i)
              haptic(i === LOG_ANSWER ? [10, 40, 10] : 20)
              later(() => setScene(1), 650)
            }}
          />
        ) : scene === 2 ? (
          <div className="flex items-center gap-4">
            <Dot done={Boolean(drops.below)} label="Abaixo de 1.000" />
            <Dot done={Boolean(drops.above)} label="Acima" />
            {!both && (
              <ShowMe
                onClick={() => {
                  setLive({ drop: { id: Date.now(), kind: 'log', pts: [[0, 250], [2, 1450], [4, 600]] } })
                  setAnswer('logDrops', { below: true, above: true })
                }}
              />
            )}
          </div>
        ) : scene === 3 ? (
          <Choices
            options={EQ_Q}
            answer={EQ_ANSWER}
            chosen={eq}
            onPick={(i) => {
              setAnswer('eqPick', i)
              haptic(i === EQ_ANSWER ? [10, 40, 10] : 20)
            }}
          />
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady, answers }: StepProps) {
  const err = sketchError(asSketch(answers.sketch))
  const ageFound = typeof answers.ageFound === 'number' ? (answers.ageFound as number) : AGE_ANSWER
  useEffect(() => {
    setReady(true)
    haptic([12, 50, 12, 50, 20])
  }, [setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'conclua',
    state: `Conclusão. Desenho a ${Number.isFinite(err) ? `${fmt(err, 0)} °C` : '—'} da curva real; T(10) ≈ 62,5 °C resolvido à mão; osso datado em ${fmt(ageFound, 0)} anos.`,
  })
  return (
    <StepFrame
      lab={lab}
      stepIndex={6}
      caption={
        <>
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.3 }} className="mb-1 block text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
            Conquista desbloqueada
          </motion.span>
          <span className="block text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white lg:text-[32px]">{lab.achievement?.title}</span>
          <span className="mt-1 block text-[15px] text-white/60">Uma regra de mudança e um ponto de partida bastam para prever o futuro.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Uma regra de mudança e um ponto de partida bastam para prever o futuro. Próximo laboratório: Ventos e redemoinhos, sobre campos vetoriais, em breve.`}
      controls={
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Seu desenho" value={Number.isFinite(err) ? `± ${fmt(err, 0)} °C` : '—'} sub="da curva real" />
            <Summary label="T(10)" value="62,5 °C" sub="resolvido à mão" />
            <Summary label="Osso" value={`${fmt(ageFound / 1000, 1)} mil`} sub="anos (C-14)" />
          </div>
          <p className="text-[12.5px] text-white/55">
            Próximo: <span className="text-white/80">Ventos e redemoinhos</span> (campos vetoriais) · em breve
          </p>
          <p className="text-[10.5px] leading-snug text-white/30">Newton (1701), lei do resfriamento; Godwin (1962), Nature 195, 984: meia-vida do C-14 = 5.730 ± 40 anos; Verhulst (1838), modelo logístico.</p>
        </div>
      }
    />
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] text-white">{value}</p>
      <p className="truncate text-[10.5px] text-white/40">{sub}</p>
    </motion.div>
  )
}

export const EQUACOES_DIFERENCIAIS_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  'mundo-real': MundoReal,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
