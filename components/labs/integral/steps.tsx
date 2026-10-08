'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { BOLT_PEAK, BOLT_SOURCE, BOLT_TIME, boltDistance, METHOD_LABEL, METHODS, riemann } from '@/lib/math/integral'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Tex } from '@/components/math/Tex'
import { Burst } from '@/components/instruments/DragSurface'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import { carAccel, CHALLENGES, DEFAULT_LIVE, P1, P2, P3, readResolva, type IntegralLive, type Option } from './shared'

// "Somando fatias infinitas". The Palco is continuous (Stage.tsx); these
// Etapas tell the story and hold the controls.

function useIntegral() {
  const [live, setLive] = useLive<IntegralLive>()
  return [{ ...DEFAULT_LIVE, ...live } as IntegralLive, setLive] as const
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

/** Text with inline TeX between $…$. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('$').map((part, i) =>
        i % 2 ? (
          <Tex key={i}>{part}</Tex>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
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
        'focus-ring h-9 rounded-full border px-3.5 text-[13px] tabular-nums transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto h-9 shrink-0 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
      Me mostre
    </button>
  )
}

/** Animates a live value to a target (for "Me mostre"), with cleanup. */
function useSweep() {
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return (from: number, to: number, ms: number, apply: (v: number) => void, done?: () => void) => {
    cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      apply(from + (to - from) * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2))
      if (p < 1) raf.current = requestAnimationFrame(step)
      else done?.()
    }
    raf.current = requestAnimationFrame(step)
  }
}

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 4, 'imagineScene')
  const [live, setLive] = useIntegral()
  const arrived = useTask(live.carT >= 1.99, 'carDone', props)
  const sweep = useSweep()
  useEffect(() => setReady(scene !== 1 || arrived), [scene, arrived, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state:
      scene < 3
        ? `Cena ${scene + 1}/4. Carro imaginado a 60 km/h constantes; tempo no cursor ${fmt(live.carT, 2)} h, distância ${fmt(60 * live.carT, 1)} km.`
        : 'Cena 4/4. O carro agora acelera de 30 a 90 km/h; a área sob a curva é a distância, mas a forma é curva.',
  })

  const captions = [
    <>
      Imagine um carro numa estrada reta, a <strong>60 km/h</strong> o tempo todo. O gráfico marca a velocidade a cada instante.
    </>,
    <>
      Arraste o tempo no palco até <strong>2 h</strong>. Quantos quilômetros o carro andou?
    </>,
    <>
      60 km/h × 2 h = <strong>120 km</strong>: é a base vezes a altura do retângulo. A <strong>área</strong> sob o gráfico é a distância!
    </>,
    <>
      Agora ele acelera, de 30 a 90 km/h. A área continua sendo a distância, mas o topo virou <strong>curva</strong>. Como medir?
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !arrived ? 'Arraste da esquerda para a direita no gráfico e olhe o carro e o número lá em cima.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Tempo" min={0} max={2} step={0.01} value={live.carT} onChange={(v) => setLive({ carT: v })} display={`${fmt(live.carT, 2)} h · ${fmt(60 * live.carT, 0)} km`} />
            <div className="flex items-center">
              <Dot done={arrived} label="Chegou às 2 h" />
              {!arrived && <ShowMe onClick={() => sweep(live.carT, 2, 1600, (v) => setLive({ carT: v }))} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const Q1 = ['Abaixo da área real', 'Acima da área real', 'Igual à área real', 'Depende do carro']
const Q1_ANSWER = 0
const Q2 = ['Aumentar', 'Diminuir', 'Ficar igual', 'Dobrar']
const Q2_ANSWER = 1

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const pred1 = typeof answers.pred1 === 'number' ? (answers.pred1 as number) : null
  const pred2 = typeof answers.pred2 === 'number' ? (answers.pred2 as number) : null
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(scene === 0 ? pred1 !== null : scene === 2 ? pred2 !== null : true), [scene, pred1, pred2, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: `Cena ${scene + 1}/4. ${pred1 === null ? 'Ainda não previu a soma pela esquerda.' : `Previu "${Q1[pred1]}" (${pred1 === Q1_ANSWER ? 'certo' : 'errado'}).`} ${pred2 === null ? '' : `Com 8 retângulos pela direita, previu "${Q2[pred2]}" (${pred2 === Q2_ANSWER ? 'certo' : 'errado'}).`}`,
  })

  const choose = (key: 'pred1' | 'pred2', i: number, ok: boolean, next: number) => {
    setAnswer(key, i)
    haptic(ok ? [10, 40, 10] : 20)
    timer.current = setTimeout(() => setScene(next), 650)
  }
  const left4 = riemann(carAccel, 0, 2, 4, 'left')
  const right4 = riemann(carAccel, 0, 2, 4, 'right')
  const right8 = riemann(carAccel, 0, 2, 8, 'right')

  const caption =
    scene === 0 ? (
      <>
        Vamos cortar a área em <strong>4 fatias</strong>. Cada retângulo pega a altura do ponto da <strong>esquerda</strong>. A soma fica…
      </>
    ) : scene === 1 ? (
      <>
        <strong>{pred1 === Q1_ANSWER ? 'Isso!' : 'Ótimo erro para aprender!'}</strong> Abaixo: numa curva que sobe, a esquerda pega a menor altura. Faltam os pedaços azuis: {fmt(left4, 1)} km.
      </>
    ) : scene === 2 ? (
      <>
        Pela <strong>direita</strong>, sobra área (rosa): {fmt(right4, 1)} km. Se cortarmos em <strong>8 retângulos</strong>, a soma vai…
      </>
    ) : (
      <>
        <strong>{pred2 === Q2_ANSWER ? 'Exato:' : 'Ótimo erro:'}</strong> diminuiu para {fmt(right8, 1)} km. Mais retângulos não aumentam a soma: eles a aproximam da área real.
      </>
    )

  const grid = (opts: string[], picked: number | null, answer: number, key: 'pred1' | 'pred2', next: number) => (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((o, i) => (
        <Choice
          key={o}
          selected={picked === i}
          state={picked === null ? null : i === answer ? 'correct' : picked === i ? 'wrong' : null}
          disabled={picked !== null}
          onClick={() => choose(key, i, i === answer, next)}
        >
          <span className="text-[14px] leading-snug">{o}</span>
        </Choice>
      ))}
    </div>
  )

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={caption}
      narration={
        scene === 0
          ? `Vamos cortar a área em 4 fatias. Cada retângulo pega a altura do ponto da esquerda. A soma fica: ${Q1.join('; ')}?`
          : scene === 2
            ? `Pela direita, sobra área: ${fmt(right4, 1)} quilômetros. Se cortarmos em 8 retângulos, a soma vai: ${Q2.join('; ')}?`
            : undefined
      }
      nudge={scene === 0 && pred1 === null ? 'Olhe as bolinhas: cada uma marca a altura de um retângulo. Compare com o resto da curva naquela fatia.' : undefined}
      controls={scene === 0 ? grid(Q1, pred1, Q1_ANSWER, 'pred1', 1) : scene === 2 ? grid(Q2, pred2, Q2_ANSWER, 'pred2', 3) : null}
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 4, 'entendaScene')
  const [live, setLive] = useIntegral()
  const sliced = useTask(scene >= 1 && live.n >= 50, 'sliced', props)
  useEffect(() => setReady(scene !== 1 || sliced), [scene, sliced, setReady])
  const sum = riemann(carAccel, 0, 2, live.n, live.method)
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state:
      scene === 1
        ? `Cena 2/4. n = ${live.n} retângulos pelo método ${METHOD_LABEL[live.method]}; soma ≈ ${fmt(sum, 2)} (área real 100).`
        : `Cena ${scene + 1}/4. ${scene === 0 ? 'Anatomia de um retângulo: altura f(xᵢ), largura Δx.' : scene === 2 ? 'Animação: Σ f(xᵢ)Δx vira ∫ f(x) dx.' : 'Área exata: ∫₀² v(t) dt = 100 km.'}`,
  })

  const captions = [
    <>
      Chame a curva de <Tex say="f de x">{'f(x)'}</Tex>. Cada retângulo tem altura <Tex say="f de x i">{'f(x_i)'}</Tex> e largura <Tex say="delta x">{'\\Delta x'}</Tex>. Somar todos é a <strong>soma de Riemann</strong>.
    </>,
    <>
      Fatie! Arraste para os lados no palco (ou use o controle). Leve <strong>n a 50 ou mais</strong> e veja sobras e faltas sumirem.
    </>,
    <>
      Com fatias infinitamente finas, a soma vira <strong>integral</strong>: o Σ se alonga num S (de soma) e <Tex say="delta x">{'\\Delta x'}</Tex> vira <Tex say="d x">{'dx'}</Tex>.
    </>,
    <>
      Sem retângulos, só a área exata. Para o carro, <Tex say="a integral de 0 a 2 de v de t, d t">{'\\int_0^2 v(t)\\,dt'}</Tex> = <strong>100 km</strong>, nem mais, nem menos.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      narration={
        scene === 0
          ? 'Chame a curva de f de x. Cada retângulo tem altura f de x i e largura delta x. Somar todos é a soma de Riemann.'
          : scene === 2
            ? 'Com fatias infinitamente finas, a soma vira integral: o sigma se alonga num S, de soma, e delta x vira d x.'
            : scene === 3
              ? 'Sem retângulos, só a área exata. Para o carro, a integral de 0 a 2 de v de t dá 100 quilômetros, nem mais, nem menos.'
              : undefined
      }
      nudge={scene === 1 && !sliced ? 'Arraste para a direita no gráfico: cada retângulo se parte em pedaços menores.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Retângulos (n)" min={1} max={200} step={1} value={live.n} onChange={(v) => setLive({ n: Math.round(v) })} display={`n = ${live.n} · ${fmt(sum, 2)} km`} />
            <div className="flex items-center gap-2">
              {METHODS.map((m) => (
                <Chip key={m} active={live.method === m} onClick={() => setLive({ method: m })}>
                  {METHOD_LABEL[m]}
                </Chip>
              ))}
              <span className="ml-auto">
                <Dot done={sliced} label="n ≥ 50" />
              </span>
            </div>
          </div>
        ) : scene === 2 ? (
          <Button variant="secondary" onClick={() => setLive({ morphKey: live.morphKey + 1 })}>
            <RotateCcw className="h-4 w-4" /> Ver de novo
          </Button>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. Observe

export function Observe(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 4, 'observeScene')
  const [live, setLive] = useIntegral()
  const finished = useTask(live.boltT >= BOLT_TIME - 0.01, 'boltDone', props)
  const sweep = useSweep()
  useEffect(() => setReady(scene !== 1 || finished), [scene, finished, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state: `Cena ${scene + 1}/4. Gráfico em degraus da velocidade média de Bolt (Berlim 2009) a cada 10 m. Cursor em ${fmt(live.boltT, 2)} s: ${fmt(boltDistance(live.boltT), 1)} m acumulados.`,
  })

  const captions = [
    <>
      Berlim, 2009: <strong>Usain Bolt</strong> faz 100 m em <strong>9,58 s</strong> (em tempo real no palco). Cada trecho de 10 m foi cronometrado.
    </>,
    <>
      Cada degrau é a <strong>velocidade média do trecho</strong>: 10 m ÷ tempo. Arraste o tempo até o fim e some as áreas.
    </>,
    <>
      Cada degrau tem área de <strong>exatamente 10 m</strong>. Dez degraus: 100 m. A integral da velocidade devolveu a distância!
    </>,
    <>
      O degrau mais alto, de 60 a 70 m: ≈ <strong>{fmt(BOLT_PEAK.v, 1)} m/s</strong> ({fmt(BOLT_PEAK.v * 3.6, 0)} km/h). Na derivada, a conta foi a inversa.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !finished ? 'Arraste da esquerda para a direita no gráfico: Bolt anda na pista e os metros somam lá em cima.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Tempo" min={0} max={BOLT_TIME} step={0.01} value={live.boltT} onChange={(v) => setLive({ boltT: v })} display={`${fmt(live.boltT, 2)} s · ${fmt(boltDistance(live.boltT), 1)} m`} />
            <div className="flex items-center">
              <Dot done={finished} label="Chegou aos 100 m" />
              {!finished && <ShowMe onClick={() => sweep(live.boltT, BOLT_TIME, 2400, (v) => setLive({ boltT: v }))} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

function Options({ options, wrong, okPick, onPick, cols }: { options: Option[]; wrong: number[]; okPick: number | null; onPick: (i: number) => void; cols: 1 | 2 }) {
  return (
    <div className={cn('grid gap-1.5', cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {options.map((o, i) => {
        const state = okPick === i ? 'correct' : wrong.includes(i) ? 'wrong' : null
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            disabled={okPick !== null || wrong.includes(i)}
            className={cn(
              'focus-ring flex min-h-[44px] items-center justify-center rounded-2xl border px-3 py-1.5 text-[15px] transition-all duration-200 active:scale-[0.99]',
              !state && 'border-white/[0.08] bg-white/[0.03] text-white/90 hover:border-white/20 hover:bg-white/[0.06]',
              state === 'correct' && 'border-emerald-300/50 bg-emerald-400/10 text-white',
              state === 'wrong' && 'border-rose-300/40 bg-rose-400/[0.08] text-white/60',
            )}
          >
            <Tex say={o.say}>{o.tex}</Tex>
          </button>
        )
      })}
    </div>
  )
}

export function Resolva(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 3, 'resolvaScene')
  const [live, setLive] = useIntegral()
  const r = readResolva(answers)
  const [wrong, setWrong] = useState<number[]>([])
  const [okPick, setOkPick] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sweep = useSweep()
  const sub = scene === 0 ? r.p1 : scene === 1 ? r.p2 : r.p3 !== null && P3.options[r.p3]?.ok ? 1 : 0

  useEffect(() => {
    setWrong([])
    setOkPick(null)
  }, [scene, sub])
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  // Problem 1, last step: every rectangle splits in two, again and again.
  useEffect(() => {
    if (scene !== 0 || r.p1 < 4 || live.splitN >= 256) return
    const t = setTimeout(() => {
      setLive({ splitN: live.splitN * 2 })
      haptic(live.splitN * 2 >= 256 ? [10, 40, 10] : 5)
    }, 850)
    return () => clearTimeout(t)
  }, [scene, r.p1, live.splitN, setLive])

  // Problem 2, first task: drag x all the way to 2.
  useEffect(() => {
    if (scene === 1 && r.p2 === 0 && live.accX >= 1.97) {
      haptic([10, 40, 10])
      setAnswer('p2', 1)
      timer.current = setTimeout(() => setLive({ accX: 1.5 }), 500)
    }
  }, [scene, r.p2, live.accX, setAnswer, setLive])

  const p3ok = r.p3 !== null && Boolean(P3.options[r.p3]?.ok)
  const complete = scene === 0 ? r.p1 >= 4 : scene === 1 ? r.p2 >= 2 : p3ok || r.p3Shown
  useEffect(() => setReady(complete), [complete, setReady])

  const task = scene === 0 ? P1[Math.min(r.p1, 3)] : scene === 1 ? P2[Math.min(r.p2, 1)] : P3
  const wrongKey = scene === 0 ? 'p1Wrong' : 'p2Wrong'
  const lastWrong = scene === 0 ? r.p1Wrong : scene === 1 ? r.p2Wrong : r.p3 !== null && !p3ok ? r.p3 : null
  const why = lastWrong !== null && wrong.includes(lastWrong) ? task.options[lastWrong]?.why : null

  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: `Problema ${scene + 1}/3. ${complete ? 'Resolvido.' : `Pergunta: ${task.say}`}${why ? ` Último erro: ${why}` : ''}`,
  })

  const pick = (i: number) => {
    const o = task.options[i]
    if (o.ok) {
      haptic([10, 40, 10])
      setOkPick(i)
      if (scene === 2) {
        setAnswer('p3', i)
        setCelebrate(true)
        timer.current = setTimeout(() => setCelebrate(false), 1200)
        return
      }
      setAnswer(wrongKey, null)
      const key = scene === 0 ? 'p1' : 'p2'
      const next = (scene === 0 ? r.p1 : r.p2) + 1
      timer.current = setTimeout(() => {
        if (scene === 0 && next >= 4) setLive({ splitN: 4 })
        setAnswer(key, next)
      }, 750)
    } else {
      haptic(20)
      setWrong((w) => [...w, i])
      setAnswer(scene === 2 ? 'p3' : wrongKey, i)
    }
  }

  let caption: React.ReactNode
  let narration: string | undefined
  if (complete) {
    caption =
      scene === 0 ? (
        <>
          Cada retângulo se parte em dois, de novo e de novo… e a soma desce até <Tex say="8 terços">{'\\tfrac{8}{3}'}</Tex> ≈ <strong>2,667</strong>: a área exata.
        </>
      ) : scene === 1 ? (
        <>
          <strong>Isso!</strong> Uma fatia fina em x soma <Tex say="f de x d x">{'f(x)\\,dx'}</Tex>: A cresce no ritmo de f. Integrar <strong>desfaz</strong> derivar. É o Teorema Fundamental.
        </>
      ) : r.p3Shown && !p3ok ? (
        <>
          A primitiva é <Tex say="x ao quadrado mais x">{'x^2 + x'}</Tex>: F(3) − F(1) = 12 − 2 = <strong>10</strong>. O trapézio no palco confirma.
        </>
      ) : (
        <>
          <strong>Sem ajuda, e certo!</strong> F(x) = x² + x, e F(3) − F(1) = <strong>10</strong>. O trapézio confirma: (3 + 7) ÷ 2 × 2 = 10.
        </>
      )
    narration =
      scene === 0
        ? 'Cada retângulo se parte em dois, de novo e de novo, e a soma desce até 8 terços, aproximadamente 2,667: a área exata.'
        : scene === 1
          ? 'Isso! Uma fatia fina em x soma f de x vezes d x: A cresce no ritmo de f. Integrar desfaz derivar. É o Teorema Fundamental do Cálculo.'
          : 'F de x é x ao quadrado mais x. F de 3 menos F de 1 é 12 menos 2, igual a 10. O trapézio confirma.'
  } else if (okPick !== null) {
    caption = (
      <>
        <strong>Isso.</strong> Anotado no caderno.
      </>
    )
  } else if (why) {
    caption = (
      <>
        <strong>Bom erro para aprender.</strong> {why}
      </>
    )
  } else {
    caption = <Rich text={task.q} />
    narration = `${task.say} ${task.options.map((o) => o.say).join('; ou ')}`
  }

  const controls = complete ? null : scene === 1 && r.p2 === 0 ? (
    <div className="space-y-3">
      <Slider label="Posição x" min={0} max={2} step={0.01} value={live.accX} onChange={(v) => setLive({ accX: v })} display={`x = ${fmt(live.accX, 2)}`} />
      <div className="flex items-center">
        <Dot done={false} label="Leve x até 2" />
        <ShowMe onClick={() => sweep(live.accX, 2, 2200, (v) => setLive({ accX: v }))} />
      </div>
    </div>
  ) : (
    <div className="relative space-y-1.5">
      {celebrate && <Burst color={lab.accent} />}
      <Options options={task.options} wrong={wrong} okPick={okPick} onPick={pick} cols={task.options.length > 3 ? 2 : 1} />
      {scene === 2 && (
        <div className="flex">
          <ShowMe
            onClick={() => {
              haptic(8)
              setAnswer('p3Shown', true)
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene * 10 + sub + (okPick !== null ? 0.5 : why ? 0.25 : 0)}
      caption={caption}
      narration={narration}
      nudge={
        complete
          ? undefined
          : scene === 0
            ? 'Olhe o palco: cada escolha muda os retângulos. Os que encostam certinho na curva mostram o caminho.'
            : scene === 1
              ? r.p2 === 0
                ? 'Arraste no gráfico da esquerda para a direita e veja a curva colorida nascer.'
                : 'Inclinação é o quanto a curva sobe por passo. Qual altura o palco mostra na fatia em x = 1,5?'
              : 'Que função tem derivada 2x + 1? Teste no fim e no começo do intervalo e subtraia.'
      }
      controls={controls}
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
            <strong>{picked === c.answer ? 'Exato.' : `Ótimo erro: era “${c.options[c.answer]}”.`}</strong> {c.explain}
          </>
        )
      }
      narration={picked === undefined ? `${c.q.replace('∫₀² x² dx', 'a integral de 0 a 2 de x ao quadrado').replace('8/3', '8 terços').replace('v < 0', 'velocidade negativa')} ${c.options.join('; ')}.` : undefined}
      nudge={picked === undefined ? (c.id === 're' ? 'Olhe as duas cores no gráfico: uma área está acima do eixo e outra abaixo.' : 'Compare os contornos tracejados com os retângulos cheios: quem encosta melhor na curva?') : undefined}
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
          <button onClick={() => setAnswer('challenges', { ...picks, [c.id]: undefined })} className="h-9 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
            Responder de novo
          </button>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady }: StepProps) {
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: 'Laboratório concluído: somas de Riemann, Teorema Fundamental do Cálculo e os 100 m de Bolt reconstruídos pela área.' })
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
          <span className="mt-1 block text-[14.5px] text-white/60">
            Próximo: <strong className="text-white/85">Imitando curvas com polinômios</strong> (Cálculo 2).
          </span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Próximo laboratório: Imitando curvas com polinômios, de Cálculo 2.`}
      controls={
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Bolt · área" value="100 m" sub="10 degraus de 10 m" />
            <Summary label="Somas →" value="8/3 ≈ 2,667" sub="∫₀² x² dx" />
            <Summary label="Sem ajuda" value="10" sub="∫₁³ (2x + 1) dx" />
          </div>
          <p className="text-[10.5px] leading-snug text-white/30">Tempos de Bolt: {BOLT_SOURCE}. Carro: exemplo imaginado.</p>
        </div>
      }
    />
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[14.5px] text-white">{value}</p>
      <p className="truncate text-[10.5px] text-white/45">{sub}</p>
    </motion.div>
  )
}

export const INTEGRAL_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
