'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { Tex } from '@/components/math/Tex'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { deg, goodInterval, lagrangeRadius, smallAngleError, taylor } from '@/lib/math/taylor'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  DIALS,
  dialDone,
  dialsOf,
  derivsOf,
  E_TERMS_MAX,
  eTermsOf,
  EXP_MAX,
  expDegOf,
  firstTries,
  LN_MAX,
  lnDegOf,
  PROBLEMS,
  problemState,
  Q100,
  Q5,
  QGEOM,
  QLN,
  setDial,
  showDial,
  SIN_MAX,
  sinDegOf,
  solveOf,
  tapAction,
  type TaylorLive,
} from './shared'

// "Imitando curvas com polinômios". The Palco is continuous (Stage.tsx);
// these Etapas tell the story and hold the controls.

const SUB = '₀₁₂₃'

/** setTimeout that is cleared when the Etapa unmounts. */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }
}

function ShowMe({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn('focus-ring min-h-[32px] text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline', className)}
    >
      Me mostre
    </button>
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
        'focus-ring h-9 rounded-full border px-3.5 text-[13.5px] transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

function Grid4({ options, chosen, answer, onPick }: { options: string[]; chosen: number | null; answer: number; onPick: (i: number) => void }) {
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

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene, setScene] = useScenes(props, 5, 'imagineScene')
  const later = useLater()
  const dials = dialsOf(answers)
  const active = Math.min(scene, 3)
  const done = dialDone(dials, active)
  const [lo, hi] = goodInterval(Math.sin, dials, 0.01, 8, 0.002)

  const wasDone = useRef(done)
  useEffect(() => {
    if (done && !wasDone.current && scene < 4) later(() => setScene(scene + 1), 1100)
    wasDone.current = done
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])
  useEffect(() => setReady(scene === 4 || done), [scene, done, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/5. Dials: c0 = ${fmt(dials[0], 3)}, c1 = ${fmt(dials[1], 3)}, c2 = ${fmt(dials[2], 3)}, c3 = ${fmt(dials[3], 3)}. Cópia boa (erro < 0,01) de ${fmt(lo)} a ${fmt(hi)}.`,
  })

  const captions = [
    <>
      Uma <strong>máquina copiadora</strong>: monte um polinômio que cole na curva branca perto de x = 0. Comece pela <strong>altura</strong>, o dial c₀.
    </>,
    <>
      Agora a <strong>inclinação</strong>: gire c₁ até a cópia sair de x = 0 na mesma direção da curva (a reta tracejada).
    </>,
    <>
      c₂ entorta a cópia como uma parábola. Quanto a curva branca <strong>se curva</strong> bem em x = 0? Ajuste c₂.
    </>,
    <>
      Falta a <strong>dobra</strong>: a curva começa a virar para baixo. Gire c₃ e veja a faixa boa crescer.
    </>,
    <>
      A curva misteriosa é <strong>sen x</strong>. Com 4 dials, a cópia vale perto de 0… e se perde longe dele.
    </>,
  ]
  const nudges = [
    'Olhe o ponto branco em x = 0: o ponto da cópia precisa ficar em cima dele.',
    'Compare as duas curvas bem no meio: uma sobe mais rápido que a outra?',
    'Repare na curva branca em x = 0: ali ela muda de "boca para cima" para "boca para baixo".',
    'Para a cópia virar para baixo como a curva, o dial precisa ser pequeno e negativo.',
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene < 4 && !done ? nudges[scene] : undefined}
      controls={
        scene < 4 ? (
          <div className="space-y-2.5">
            <Slider
              label={`c${SUB[active]} · ${DIALS[active].name}`}
              min={DIALS[active].min}
              max={DIALS[active].max}
              step={0.001}
              value={dials[active]}
              onChange={(v) => setDial(answers, setAnswer, active, v)}
              display={fmt(dials[active], 3)}
            />
            <div className="flex items-center gap-3">
              {DIALS.map((d, i) => (
                <Dot key={d.name} done={dialDone(dials, i)} label={`c${SUB[i]}`} />
              ))}
              {!done && <ShowMe className="ml-auto" onClick={() => showDial(answers, setAnswer, active)} />}
            </div>
          </div>
        ) : (
          <p className="font-mono text-[13px] text-white/55">
            c₀ = 0 · c₁ = 1 · c₂ = 0 · c₃ ≈ −0,1667 → boa em |x| &lt; {fmt(hi)}
          </p>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

export function Preveja(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const later = useLater()
  const q5 = typeof answers.q5 === 'number' ? (answers.q5 as number) : null
  const q100 = typeof answers.q100 === 'number' ? (answers.q100 as number) : null
  useEffect(() => setReady(scene === 0 ? q5 !== null : scene === 2 ? q100 !== null : true), [scene, q5, q100, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: `Cena ${scene + 1}/4. Pergunta do grau 5: ${q5 === null ? 'sem resposta' : `"${Q5.options[q5]}" (${q5 === Q5.answer ? 'certo' : 'errado'})`}. Pergunta do grau 100: ${q100 === null ? 'sem resposta' : `"${Q100.options[q100]}" (${q100 === Q100.answer ? 'certo' : 'errado'})`}.`,
  })

  const pick = (key: 'q5' | 'q100', i: number, right: number, next: number) => {
    setAnswer(key, i)
    haptic(i === right ? [10, 40, 10] : 20)
    later(() => setScene(next), 650)
  }
  const r100 = lagrangeRadius(1, 100, 0.01)

  const caption =
    scene === 0 ? (
      <>
        Aposta: se eu somar o termo de grau 5, <Tex say="x elevado a 5 sobre 120">{'x^5/120'}</Tex>, onde a cópia do seno <strong>melhora</strong>?
      </>
    ) : scene === 1 ? (
      <>
        <strong>{q5 === Q5.answer ? 'Isso!' : 'Ótimo erro para aprender!'}</strong> Perto de 0, x⁵ é minúsculo e só corrige: a faixa vai de 1,04 a 1,76. Longe, a cópia segue perdida.
      </>
    ) : scene === 2 ? (
      <>
        E um polinômio de <strong>grau 100</strong>? Ele copia sen x em <strong>toda</strong> a reta?
      </>
    ) : (
      <>
        <strong>{q100 === Q100.answer ? 'Exato.' : 'Ótimo erro para aprender!'}</strong> Grau 31 cola até |x| ≈ 11,5 e dispara. Todo polinômio vai a ±∞; o seno fica entre −1 e 1.
      </>
    )

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={caption}
      narration={scene === 0 ? 'Aposta: se eu somar o termo de grau 5, x elevado a 5 sobre 120, onde a cópia do seno melhora?' : undefined}
      controls={
        scene === 0 ? (
          <Grid4 options={Q5.options} chosen={q5} answer={Q5.answer} onPick={(i) => pick('q5', i, Q5.answer, 1)} />
        ) : scene === 2 ? (
          <Grid4 options={Q100.options} chosen={q100} answer={Q100.answer} onPick={(i) => pick('q100', i, Q100.answer, 3)} />
        ) : scene === 3 ? (
          <p className="text-[13px] leading-snug text-white/50">Com grau 100, o resto de Lagrange garante a cópia só até |x| ≈ {fmt(r100, 0)}. Depois, ela também foge.</p>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 4, 'entendaScene')
  const derivs = derivsOf(answers)
  const sinDeg = sinDegOf(answers)
  const expDeg = expDegOf(answers)
  const done = scene === 0 ? derivs >= 3 : scene === 1 ? sinDeg >= 7 : scene === 2 ? expDeg >= 5 : true
  useEffect(() => setReady(done), [done, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state:
      scene === 0
        ? `Derivando x³: ${derivs} de 3 derivadas feitas.`
        : scene === 1
          ? `Série do seno até o grau ${sinDeg}.`
          : scene === 2
            ? `Série de eˣ até o grau ${expDeg}.`
            : 'Fórmula geral de Taylor na tela.',
  })
  const tap = () => tapAction('entenda', scene, answers, setAnswer)

  const caption =
    scene === 0 ? (
      derivs < 3 ? (
        <>
          Por que aparece um <strong>n!</strong>? Derive x³ três vezes, tocando no palco. Repare no número que sobra.
        </>
      ) : (
        <>
          Sobrou 3·2·1 = <strong>3!</strong>. Por isso cada dial é <Tex say="c n igual à derivada de ordem n em zero, sobre n fatorial">{'c_n = \\frac{f^{(n)}(0)}{n!}'}</Tex>: o n! desfaz o que a derivada cria.
        </>
      )
    ) : scene === 1 ? (
      <>
        No seno, as derivadas em 0 repetem <strong>0, 1, 0, −1</strong>. Toque para somar termos e veja a cópia crescer.
      </>
    ) : scene === 2 ? (
      <>
        Em eˣ é ainda mais simples: toda derivada é eˣ, e e⁰ = 1. Então cada dial vira <strong>1/n!</strong>. Some termos.
      </>
    ) : (
      <>
        A receita vale para qualquer curva suave: cada termo copia <strong>uma derivada em 0</strong>, dividida por n!.
      </>
    )

  const narration =
    scene === 0 && derivs >= 3
      ? 'Sobrou 3 vezes 2 vezes 1, que é 3 fatorial. Por isso cada dial é a derivada de ordem n em zero, dividida por n fatorial: o n fatorial desfaz o que a derivada cria.'
      : undefined

  const count = scene === 0 ? `${derivs} de 3` : scene === 1 ? `grau ${sinDeg}` : scene === 2 ? `grau ${expDeg}` : ''
  const max = scene === 0 ? derivs >= 3 : scene === 1 ? sinDeg >= SIN_MAX : expDeg >= EXP_MAX

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={caption}
      narration={narration}
      nudge={!done ? (scene === 0 ? 'Toque no palco: cada toque deriva uma vez. Olhe o que acontece com o expoente.' : 'Toque no palco algumas vezes e observe o termo novo entrar na fórmula lá em cima.') : undefined}
      controls={
        scene < 3 ? (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={tap} disabled={max}>
              <Plus className="h-4 w-4" /> {scene === 0 ? 'Derivar' : 'Somar um termo'}
            </Button>
            <span className="font-mono text-[13px] text-white/55">{count}</span>
            {done ? <Dot done label="" /> : <ShowMe className="ml-auto" onClick={() => setAnswer(scene === 0 ? 'derivs' : scene === 1 ? 'sinDeg' : 'expDeg', scene === 0 ? 3 : scene === 1 ? 7 : 5)} />}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

const ANGLES = [5, 10, 30, 60]

export function Observe(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 4, 'observeScene')
  const [live, setLive] = useLive<TaylorLive>()
  const theta = live.theta
  const tried = theta !== undefined || Boolean(answers.thetaTried)
  const n = eTermsOf(answers)

  useEffect(() => {
    if (theta !== undefined && !answers.thetaTried) setAnswer('thetaTried', true)
  }, [theta, answers.thetaTried, setAnswer])
  useEffect(() => {
    if (scene === 1) setLive({ theta: deg(10) })
  }, [scene, setLive])
  useEffect(() => setReady(scene === 0 ? tried : scene === 3 ? n >= 10 : true), [scene, tried, n, setReady])

  const th = theta ?? deg(25)
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state:
      scene <= 1
        ? `Pêndulo: θ = ${fmt((th * 180) / Math.PI, 0)}°, erro relativo de sen θ ≈ θ = ${fmt(smallAngleError(th) * 100, 2)} %.`
        : scene === 2
          ? 'Seno e cópia de grau 13; o trecho |x| ≤ π/4 em destaque.'
          : `Somando 1/n!: ${n} termos.`,
  })

  const captions = [
    <>
      Pêndulo: os físicos trocam sen θ por θ, a cópia de grau 1. <strong>Arraste no palco</strong> e veja o erro (rosa) crescer com o ângulo.
    </>,
    <>
      A 10°, o erro é só <strong>≈ 0,5 %</strong>. Por isso o período quase não depende da amplitude: o real é só 0,19 % maior.
    </>,
    <>
      Calculadoras não guardam tabelas de seno: <strong>calculam</strong>. A fdlibm leva o ângulo para perto de 0 e usa um polinômio de grau 13.
    </>,
    <>
      Em x = 1, eˣ vira o número <strong>e</strong> = 1 + 1 + 1/2! + 1/3! + … Toque no palco e conte os algarismos certos.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 3 ? 'Em x igual a 1, e elevado a x vira o número e, igual a 1 mais 1 mais 1 sobre 2 fatorial mais 1 sobre 3 fatorial, e assim por diante. Toque no palco e conte os algarismos certos.' : undefined}
      nudge={scene === 0 && !tried ? 'Arraste o dedo para a direita no gráfico: o ângulo aumenta.' : scene === 3 && n < 10 ? 'Cada toque soma um termo. Veja os pontos subindo até a linha tracejada.' : undefined}
      controls={
        scene === 0 ? (
          <div className="space-y-2.5">
            <Slider label="Ângulo θ" min={1} max={85} step={0.5} value={(th * 180) / Math.PI} onChange={(v) => setLive({ theta: deg(v) })} display={`${fmt((th * 180) / Math.PI, 0)}°`} />
            <div className="flex flex-wrap gap-2">
              {ANGLES.map((a) => (
                <Chip key={a} active={Math.abs((th * 180) / Math.PI - a) < 0.5} onClick={() => setLive({ theta: deg(a) })}>
                  {a}°
                </Chip>
              ))}
            </div>
          </div>
        ) : scene === 1 ? (
          <p className="text-[12.5px] leading-snug text-white/45">
            Período exato: <Tex say="T sobre T zero igual a 1 sobre a média aritmético-geométrica de 1 e cosseno de teta zero sobre 2">{'T/T_0 = 1/\\mathrm{AGM}\\big(1, \\cos\\tfrac{\\theta_0}{2}\\big)'}</Tex>
          </p>
        ) : scene === 2 ? (
          <p className="text-[12.5px] leading-snug text-white/45">
            Os coeficientes são ajustados para errar pouco nesse trecho, não são exatamente os de Taylor. Muitas calculadoras de bolso usam outro truque, o CORDIC, só com somas e deslocamentos.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => tapAction('observe', 3, answers, setAnswer)} disabled={n >= E_TERMS_MAX}>
              <Plus className="h-4 w-4" /> Somar 1/{n}!
            </Button>
            <Dot done={n >= 10} label="10 termos" />
            {n < 10 && <ShowMe className="ml-auto" onClick={() => setAnswer('eTerms', 10)} />}
          </div>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

export function Resolva(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, PROBLEMS.length, 'resolvaScene')
  const prob = PROBLEMS[scene]
  const solve = solveOf(answers)
  const st = problemState(prob, solve)
  const step = prob.steps[Math.min(st.current, prob.steps.length - 1)]
  useEffect(() => setReady(st.solved), [st.solved, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: st.solved
      ? `${prob.title}: resolvido.`
      : `${prob.title}, passo ${st.current + 1} de ${prob.steps.length}: "${step.prompt}" ${st.wrong !== null ? `Última escolha errada: "${step.options[st.wrong].label}".` : ''}`,
  })

  const pick = (i: number) => {
    const picks = solve[step.id] ?? []
    setAnswer('solve', { ...solve, [step.id]: [...picks, i] })
    haptic(i === step.answer ? [10, 40, 10] : 20)
  }

  const caption = st.solved ? (
    <>
      <strong>Resolvido.</strong> {prob.steps[prob.steps.length - 1].done}
    </>
  ) : st.wrong !== null ? (
    <>
      <strong>Quase.</strong> {step.options[st.wrong].why} Tente outra.
    </>
  ) : (
    <>
      {step.prompt}
    </>
  )
  const picks = solve[step.id] ?? []

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene * 10 + Math.min(st.current, 9)}
      caption={caption}
      nudge={!st.solved ? (scene === 2 ? 'Escreva as três primeiras derivadas do cosseno e calcule cada uma em 0.' : 'Olhe o palco: a cópia certa gruda na curva branca perto de x = 0.') : undefined}
      controls={
        st.solved ? null : (
          <div>
            <div className="grid grid-cols-2 gap-1.5">
              {step.options.map((o, i) => {
                const tried = picks.includes(i)
                return (
                  <button
                    key={o.label}
                    disabled={tried}
                    onClick={() => pick(i)}
                    className={cn(
                      'focus-ring min-h-[44px] rounded-2xl border px-3 py-2 text-left font-mono text-[13.5px] leading-tight transition-all active:scale-[0.98]',
                      tried ? 'border-rose-300/30 bg-rose-400/[0.07] text-white/45 line-through' : 'border-white/[0.08] bg-white/[0.03] text-white/90 hover:border-white/20',
                    )}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end">
              <ShowMe onClick={() => pick(step.answer)} />
            </div>
          </div>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

export function ESe(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene, setScene] = useScenes(props, 4, 'eseScene')
  const later = useLater()
  const lnGuess = typeof answers.lnGuess === 'number' ? (answers.lnGuess as number) : null
  const geomGuess = typeof answers.geomGuess === 'number' ? (answers.geomGuess as number) : null
  const lnDeg = lnDegOf(answers)
  const ready = scene === 0 ? lnGuess !== null : scene === 1 ? lnDeg >= 15 : scene === 3 ? geomGuess !== null : true
  useEffect(() => setReady(ready), [ready, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state:
      scene <= 2
        ? `ln(1 + x) com cópia de grau ${lnDeg}; em x = 1,5 a cópia vale ${fmt(taylor('ln1p', lnDeg, 1.5))} e o real ${fmt(Math.log(2.5))}. Aposta: ${lnGuess === null ? 'nenhuma' : QLN.options[lnGuess]}.`
        : `Série geométrica. Resposta: ${geomGuess === null ? 'nenhuma' : QGEOM.options[geomGuess]}.`,
  })

  const caption =
    scene === 0 ? (
      <>
        Nova curva: <strong>ln(1 + x)</strong>. Somando cada vez mais termos, o que acontece com a cópia em <strong>x = 1,5</strong>?
      </>
    ) : scene === 1 ? (
      <>
        <strong>Arraste para cima</strong> no palco para somar termos. Olhe o ponto em x = 1,5 e a faixa boa.
      </>
    ) : scene === 2 ? (
      <>
        <strong>{lnGuess === QLN.answer ? 'Você previu certo.' : 'Ótimo erro para aprender!'}</strong> A faixa trava em x = 1: além dele, xⁿ/n cresce sem parar. É o <strong>raio de convergência</strong>: 1.
      </>
    ) : geomGuess === null ? (
      <>
        E <Tex say="1 mais x mais x ao quadrado mais x ao cubo, e assim por diante">{'1 + x + x^2 + x^3 + \\cdots'}</Tex>? Ela copia 1/(1 − x). Onde a cópia vale?
      </>
    ) : (
      <>
        <strong>{geomGuess === QGEOM.answer ? 'Isso.' : 'Ótimo erro para aprender!'}</strong> Em x = 0,5: 1 + 0,5 + 0,25 + … = 2. Em |x| ≥ 1 os termos não diminuem: raio 1 de novo.
      </>
    )

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + (scene === 3 && geomGuess !== null ? 1 : 0)}
      caption={caption}
      narration={scene === 3 && geomGuess === null ? 'E 1 mais x mais x ao quadrado mais x ao cubo, e assim por diante? Ela copia 1 sobre 1 menos x. Onde a cópia vale?' : undefined}
      nudge={scene === 1 && lnDeg < 15 ? 'Arraste para cima várias vezes e observe o ponto colorido em x = 1,5.' : undefined}
      controls={
        scene === 0 ? (
          <Grid4
            options={QLN.options}
            chosen={lnGuess}
            answer={QLN.answer}
            onPick={(i) => {
              setAnswer('lnGuess', i)
              haptic(i === QLN.answer ? [10, 40, 10] : 20)
              later(() => setScene(1), 650)
            }}
          />
        ) : scene === 1 ? (
          <div className="space-y-2">
            <Slider label="Grau da cópia" min={1} max={LN_MAX} step={1} value={lnDeg} onChange={(v) => setAnswer('lnDeg', Math.round(v))} display={`${lnDeg}`} />
            <div className="flex items-center gap-3">
              <Dot done={lnDeg >= 15} label="grau 15 ou mais" />
              {lnDeg < 15 && <ShowMe className="ml-auto" onClick={() => setAnswer('lnDeg', 20)} />}
            </div>
          </div>
        ) : scene === 3 && geomGuess === null ? (
          <Grid4
            options={QGEOM.options}
            chosen={geomGuess}
            answer={QGEOM.answer}
            onPick={(i) => {
              setAnswer('geomGuess', i)
              haptic(i === QGEOM.answer ? [10, 40, 10] : 20)
            }}
          />
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua(props: StepProps) {
  const { lab, setReady, answers } = props
  useEffect(() => setReady(true), [setReady])
  const [, hi] = goodInterval(Math.sin, dialsOf(answers), 0.01, 8, 0.002)
  const { right, total } = firstTries(solveOf(answers))
  const t3 = taylor('exp', 3, 0.5)
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `Cópia do seno boa em |x| < ${fmt(hi)}; e^0,5 ≈ ${fmt(t3, 4)}; ${right} de ${total} passos de primeira no Resolva.` })
  return (
    <StepFrame
      lab={lab}
      stepIndex={6}
      caption={
        <>
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.3 }} className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
            Conquista desbloqueada
          </motion.span>
          <span className="block text-[24px] font-semibold leading-tight tracking-[-0.03em] text-white lg:text-[30px]">{lab.achievement?.title}</span>
          <span className="mt-0.5 block text-[14.5px] text-white/60">Perto de um ponto, uma curva suave vira uma soma de potências.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Próximo laboratório: Subindo a montanha, de Cálculo 3.`}
      controls={
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Sua cópia" value={`|x| < ${fmt(hi)}`} sub="sen x, 4 dials" />
            <Summary label="e^0,5" value={`≈ ${fmt(t3, 4)}`} sub="erro 0,0029" />
            <Summary label="Resolva" value={`${right} de ${total}`} sub="de primeira" />
          </div>
          <p className="text-[12.5px] text-white/60">
            Próximo: <strong className="text-white/85">Subindo a montanha</strong> · Cálculo 3
          </p>
          <p className="text-[10.5px] leading-snug text-white/30">Taylor (1715); Lagrange (1797); fdlibm, Sun (1993); Volder (1959), CORDIC</p>
        </div>
      }
    />
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[14px] text-white">{value}</p>
      <p className="truncate text-[10.5px] text-white/45">{sub}</p>
    </motion.div>
  )
}

export const SERIES_TAYLOR_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
