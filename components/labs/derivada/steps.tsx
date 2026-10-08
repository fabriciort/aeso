'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { boltSpeed, boltTopSpeed, msToKmh } from '@/lib/math/derivative'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Tex } from '@/components/math/Tex'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import { CHALLENGES, DEFAULTS, PROBLEMS, type DerivLive } from './shared'

// "A velocidade de um instante". The Palco is continuous (Stage.tsx); these
// Etapas tell the story and hold the controls.

const TOP = boltTopSpeed()

function useDeriv() {
  const [live, setLive] = useLive<DerivLive>()
  return [{ ...DEFAULTS, ...live } as DerivLive, setLive] as const
}

/** Marks a task done once, with a tap of haptics. */
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

function Dot({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-white/50">
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

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-9 rounded-full border px-3 text-[13px] tabular-nums transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const [live, setLive] = useDeriv()
  const arrived = useTask(live.t >= 9.8, 'arrived', props)
  useEffect(() => setReady(scene !== 1 || arrived), [scene, arrived, setReady])
  useVegaScreen({ lab: lab.slug, step: 'imagine', state: `Cena ${scene + 1}/3. Carro em t = ${fmt(live.t, 1)} s, posição ${fmt(live.t * live.t, 1)} m.` })

  const captions = [
    <>
      Um carro sai do semáforo. O velocímetro mostra a velocidade <strong>agora</strong>. Mas velocidade é distância ÷ tempo, e “agora” não dura tempo nenhum…
    </>,
    <>
      <strong>Arraste no palco</strong> para passar o tempo. Veja o carro andar e o gráfico da posição se desenhar.
    </>,
    <>
      Em 10 s, 100 m: média de <strong>10 m/s</strong>. Mas ele saiu do zero. Quanto marcava o velocímetro em cada instante?
    </>,
  ]
  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !arrived ? 'Arraste da esquerda para a direita no palco: o tempo anda junto com o seu dedo.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Tempo" min={0} max={10} step={0.01} value={live.t} onChange={(t) => setLive({ t })} display={`${fmt(live.t, 1)} s`} />
            <Dot done={arrived} label="Chegar aos 10 s" />
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['Menor que 5 m/s', 'Igual a 5 m/s', 'Maior que 5 m/s', 'Não dá para saber']
const PREDICTION_ANSWER = 2

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const [scene, setScene] = useScenes(props, 2, 'prevejaScene')
  useEffect(() => setReady(chosen !== null), [chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: chosen === null ? 'O aluno ainda não escolheu.' : `Escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'correto' : 'incorreto'}).`,
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
      caption={
        scene === 0 ? (
          <>
            De 0 a 5 s o carro andou 25 m: média de 5 m/s. E a velocidade <strong>no instante</strong> t = 5 s?
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso!</strong> Ele está acelerando: em t = 5 s já anda mais rápido que a média do caminho. A reta rosa, a do instante, é bem mais inclinada.
          </>
        ) : (
          <>
            <strong>Ótimo erro para aprender.</strong> Ele acelera: no fim do trecho anda mais rápido que a média. Veja a reta rosa, a do instante: mais inclinada.
          </>
        )
      }
      narration={scene === 0 ? 'De 0 a 5 segundos o carro andou 25 metros: média de 5 metros por segundo. E a velocidade no instante t igual a 5? Menor, igual ou maior que 5 metros por segundo? Ou não dá para saber?' : undefined}
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

const H_CHIPS = [1, 0.1, 0.01, 0.001]

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 4, 'entendaScene')
  const [live, setLive] = useDeriv()
  const tiny = useTask(scene >= 1 && live.h <= 0.0101, 'tiny', props)
  useEffect(() => setReady(scene !== 1 || tiny), [scene, tiny, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: `Cena ${scene + 1}/4. h = ${fmt(live.h, 4)} s; média entre 5 e 5 + h = ${fmt(10 + live.h, 4)} m/s.`,
  })

  const captions = [
    <>
      A velocidade média é a <strong>inclinação</strong> da reta que liga dois pontos: Δs ÷ Δt. Aqui, entre t = 5 e t = 5 + h, com h = 3 s.
    </>,
    <>
      Agora <strong>encolha h</strong>: arraste para a esquerda no palco. A câmera mergulha junto. Leve h abaixo de 0,01 s.
    </>,
    <>
      As médias se aproximam de <strong>10</strong>, e a secante vira a <strong>tangente</strong>:{' '}
      <Tex say="v de 5 é o limite, quando h tende a zero, de s de 5 mais h menos s de 5, sobre h: 10 metros por segundo">{'v(5) = \\lim_{h \\to 0} \\frac{s(5+h) - s(5)}{h} = 10'}</Tex>
    </>,
    <>
      De muito perto, a curva <strong>vira reta</strong>. A inclinação dessa reta é a <strong>derivada</strong>: a velocidade de um instante.
    </>,
  ]
  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 0 ? 'A velocidade média é a inclinação da reta que liga dois pontos: delta s dividido por delta t. Aqui, entre t igual a 5 e t igual a 5 mais h, com h igual a 3 segundos.' : undefined}
      nudge={scene === 1 && !tiny ? 'Arraste para a esquerda várias vezes: a cada arrasto, h fica menor e o zoom aumenta.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {H_CHIPS.map((h) => (
                <Chip key={h} active={Math.abs(live.h - h) < h * 0.05} onClick={() => setLive({ h })}>
                  h = {fmt(h, 3)}
                </Chip>
              ))}
            </div>
            <Dot done={tiny} label="h menor que 0,01 s" />
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. Observe

export function Observe(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 3, 'observeScene')
  const [live, setLive] = useDeriv()
  const v = boltSpeed(live.tb)
  const start = useTask(scene >= 1 && live.tb <= 1.2, 'boltStart', props)
  const top = useTask(scene >= 1 && v >= 12.1, 'boltTop', props)
  const traced = useTask(scene >= 2 && live.tbMax >= 9.3, 'boltTraced', props)
  useEffect(() => setReady(scene === 0 || (scene === 1 ? start && top : traced)), [scene, start, top, traced, setReady])
  useVegaScreen({ lab: lab.slug, step: 'observe', state: `Cena ${scene + 1}/3. Tangente em t = ${fmt(live.tb, 2)} s: ${fmt(v, 1)} m/s (${fmt(msToKmh(v), 0)} km/h).` })

  const captions = [
    <>
      Berlim, 2009. <strong>Usain Bolt</strong> corre 100 m em 9,58 s, o recorde mundial. Cada ponto azul é um tempo oficial, a cada 10 m.
    </>,
    <>
      Uma curva suave liga os pontos. <strong>Arraste a tangente</strong> pela corrida: veja a largada e ache onde ele é mais rápido.
    </>,
    <>
      Cada inclinação vira um ponto embaixo: o gráfico da <strong>velocidade</strong>. A derivada também é uma função! Percorra a corrida toda.
    </>,
  ]
  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={
        scene === 1 && !(start && top)
          ? start
            ? 'Procure onde a curva fica mais inclinada: é perto do fim da corrida.'
            : 'Leve a tangente bem para o começo, logo depois da largada.'
          : scene === 2 && !traced
            ? 'Arraste a tangente até o fim da corrida, em 9,58 s.'
            : undefined
      }
      controls={
        scene >= 1 ? (
          <div className="space-y-3">
            <Slider label="Instante" min={0.2} max={9.58} step={0.01} value={live.tb} onChange={(tb) => setLive({ tb, tbMax: Math.max(live.tbMax, tb) })} display={`${fmt(v, 1)} m/s`} />
            {scene === 1 ? (
              <div className="flex items-center gap-4">
                <Dot done={start} label="Largada" />
                <Dot done={top} label="Velocidade máxima" />
              </div>
            ) : (
              <Dot done={traced} label="Corrida inteira" />
            )}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

export function Resolva(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, PROBLEMS.length, 'resolvaScene')
  const solved = (answers.solve as Record<string, number> | undefined) ?? {}
  const shown = (answers.shown as Record<string, boolean> | undefined) ?? {}
  const prob = PROBLEMS[scene]
  const done = solved[prob.id] ?? 0
  const complete = done >= prob.steps.length
  const step = prob.steps[Math.min(done, prob.steps.length - 1)]
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; pick: number } | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setFeedback(null)
    setWrong([])
  }, [scene, done])
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(complete), [complete, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: `Problema ${scene + 1}/3 (${prob.titleSay}). ${complete ? 'Resolvido.' : `Passo ${done + 1} de ${prob.steps.length}: ${step.prompt}`}${feedback && !feedback.ok ? ` Errou escolhendo ${step.options[feedback.pick].say}.` : ''}`,
  })

  const pick = (i: number) => {
    const o = step.options[i]
    if (o.ok) {
      haptic([10, 40, 10])
      setFeedback({ ok: true, text: o.why, pick: i })
      timer.current = setTimeout(() => setAnswer('solve', { ...solved, [prob.id]: done + 1 }), 1100)
    } else {
      haptic(20)
      setWrong((w) => [...w, i])
      setFeedback({ ok: false, text: o.why, pick: i })
    }
  }
  const showMe = () => {
    setAnswer('shown', { ...shown, [prob.id]: true })
    setAnswer('solve', { ...solved, [prob.id]: prob.steps.length })
  }

  const finished: Record<string, React.ReactNode> = {
    p1: (
      <>
        <strong>v(5) = 10 m/s</strong>, exatamente. Você não pôs h = 0: viu de que valor as médias se aproximam. Isso é a <strong>derivada</strong>.
      </>
    ),
    p2: (
      <>
        <strong>A derivada de t² é 2t.</strong> Uma fórmula só dá a velocidade em <em>qualquer</em> instante: veja a tangente percorrendo a curva.
      </>
    ),
    p3: shown.p3 ? (
      <>
        Era <strong>13 m/s</strong>: a média dá 13 + 3h, que vai a 13. Atalho que você vai adorar: a derivada de 3t² + t é 6t + 1.
      </>
    ) : (
      <>
        <strong>Sozinho, e certo!</strong> 13 m/s. Atalho que você vai adorar: a derivada de 3t² + t é 6t + 1, e 6·2 + 1 = 13.
      </>
    ),
  }

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene * 10 + done + (feedback ? 0.5 : 0)}
      caption={
        complete ? (
          finished[prob.id]
        ) : feedback ? (
          <>
            <strong>{feedback.ok ? 'Isso.' : 'Ainda não.'}</strong> {feedback.text}
          </>
        ) : (
          step.prompt
        )
      }
      narration={!complete && !feedback ? `${step.prompt} ${step.options.map((o) => o.say).join('; ou ')}.` : undefined}
      nudge={!complete && wrong.length >= 1 && !feedback?.ok ? 'Olhe o caderno: cada linha veio da anterior. Qual operação faz a próxima linha nascer?' : undefined}
      controls={
        complete ? null : (
          <div className="space-y-2">
            <div className={cn('grid gap-2', step.options.length > 3 ? 'grid-cols-2' : 'grid-cols-1')}>
              {step.options.map((o, i) => (
                <Choice
                  key={i}
                  state={feedback?.pick === i ? (feedback.ok ? 'correct' : 'wrong') : wrong.includes(i) ? 'wrong' : null}
                  disabled={wrong.includes(i) || Boolean(feedback?.ok)}
                  onClick={() => pick(i)}
                >
                  <span className={cn('block text-center text-[16px]', step.options.length <= 3 && 'py-0')}>
                    <Tex say={o.say}>{`\\displaystyle ${o.tex}`}</Tex>
                  </span>
                </Choice>
              ))}
            </div>
            {prob.id === 'p3' && wrong.length > 0 && (
              <button onClick={showMe} className="text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
                Me mostre
              </button>
            )}
          </div>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

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
      caption={
        picked === undefined ? (
          c.q
        ) : (
          <>
            <strong>{picked === c.answer ? 'Exato.' : `Era “${c.options[c.answer]}”.`}</strong> {c.explain}
          </>
        )
      }
      narration={picked === undefined ? `${c.q} ${c.options.join('; ')}.`.replace('|x|', 'módulo de x') : undefined}
      controls={
        picked === undefined ? (
          <div className="grid grid-cols-2 gap-2">
            {c.options.map((o, i) => (
              <Choice
                key={o}
                onClick={() => {
                  haptic(i === c.answer ? [10, 40, 10] : 20)
                  setAnswer('challenges', { ...picks, [c.id]: i })
                }}
              >
                <span className="text-[14px] leading-snug">{o}</span>
              </Choice>
            ))}
          </div>
        ) : (
          <button onClick={() => setAnswer('challenges', { ...picks, [c.id]: undefined })} className="text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
            Responder de novo
          </button>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady }: StepProps) {
  const { navigate } = useRouter()
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: 'Conclusão: tangente percorrendo s = t² e o gráfico de v = 2t embaixo.' })
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
          <span className="mt-1.5 block text-[16px] text-white/75">
            <Tex say="f linha de x é o limite, quando h tende a zero, de f de x mais h, menos f de x, sobre h">{"f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"}</Tex>
          </span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} A derivada é o limite das médias quando o intervalo encolhe: a inclinação da reta tangente.`}
      controls={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Carro · t = 5" value="10 m/s" />
            <Summary label="Derivada" value="(t²)′ = 2t" />
            <Summary label="Pico de Bolt" value={`${fmt(TOP.v, 1)} m/s`} />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate({ area: 'laboratorio', slug: 'integral' })}>
              Próximo: a integral <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-white/30">Tempos: IAAF, Berlim 2009 (Graubner & Nixdorf, 2011). Modelo: Keller (1973).</p>
          </div>
        </div>
      }
    />
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] text-white">{value}</p>
    </motion.div>
  )
}

export const DERIVADA_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
