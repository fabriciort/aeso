'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Crosshair, RotateCcw, Sparkles } from 'lucide-react'
import { CANNON_ALTITUDE, classify, gravityFraction, R_EARTH, TRAJECTORY_LABEL, vCircular } from '@/lib/astro/orbits'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import { CHALLENGE_IDS, DEFAULT_SLOPE, DEFAULT_V, SLICES_GOAL, SLOPE_TOLERANCE, V_MAX, type Challenges, type OrbitLive } from './shared'

// "Coloque um planeta em órbita". The Palco is continuous (Stage.tsx); these
// Etapas only tell the story and hold the controls.

const kms = (v: number, d = 1) => `${formatNumber(v, d)} km/s`
const V_CIRC = vCircular(R_EARTH + CANNON_ALTITUDE) / 1000

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

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto shrink-0 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
      Me mostre
    </button>
  )
}

/** Live values plus a stable "fire" that works from timers too. */
function useCannon() {
  const [live, setLive] = useLive<OrbitLive>()
  const ref = useRef(live)
  ref.current = live
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const fire = (v?: number) => {
    const speed = v ?? ref.current.v ?? DEFAULT_V
    setLive({ v: speed, fire: (ref.current.fire ?? 0) + 1 })
    ref.current = { ...ref.current, v: speed, fire: (ref.current.fire ?? 0) + 1 }
  }
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))
  return { live, setLive, fire, later, v: live.v ?? DEFAULT_V }
}

function SpeedSlider({ v, onChange }: { v: number; onChange: (v: number) => void }) {
  return <Slider label="Velocidade da bala" min={0} max={V_MAX} step={0.05} value={v} onChange={onChange} display={kms(v, 2)} />
}

function FireButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="md" onClick={onClick} className="shrink-0 px-4">
      <Crosshair className="h-4 w-4" /> Disparar
    </Button>
  )
}

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const { fire, setLive, later, v } = useCannon()
  const slow = Boolean(answers.triedSlow)
  const fast = Boolean(answers.triedFast)
  useEffect(() => setReady(scene !== 1 || (slow && fast)), [scene, slow, fast, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/3. Velocidade escolhida ${kms(v)} (${TRAJECTORY_LABEL[classify(v)]}). Lenta: ${slow ? 'feita' : 'falta'}; rápida: ${fast ? 'feita' : 'falta'}.`,
  })

  const captions = [
    <>
      Em 1687, Newton imaginou um <strong>canhão</strong> no alto de uma montanha altíssima, acima do ar. O que acontece com a bala?
    </>,
    <>
      Escolha a velocidade e dispare. Tente uma bala <strong>lenta</strong> (menos de 4 km/s) e uma <strong>rápida</strong> (mais de 6 km/s).
    </>,
    <>
      Quanto mais rápida, mais longe ela cai. E se o chão <strong>“fugisse”</strong> tão rápido quanto a bala cai?
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !(slow && fast) ? (slow ? 'Agora arraste a seta para a direita: bem mais rápido. Onde ela cai?' : 'Comece devagar: escolha poucos km/s e veja onde a bala cai.') : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <SpeedSlider v={v} onChange={(x) => setLive({ v: x })} />
            <div className="flex items-center gap-2.5">
              <FireButton onClick={() => fire()} />
              <Dot done={slow} label="Lenta" />
              <Dot done={fast} label="Rápida" />
              {!(slow && fast) && (
                <ShowMe
                  onClick={() => {
                    fire(2.5)
                    later(2200, () => fire(7.2))
                    later(2300, () => {
                      setAnswer('triedSlow', true)
                      setAnswer('triedFast', true)
                    })
                  }}
                />
              )}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['0,8 km/s', '7,9 km/s', '79 km/s', 'Nenhuma: ela sempre cai']
const PREDICTION_ANSWER = 1
const PREDICTION_WHY = [
  'Ótimo erro para aprender! A 0,8 km/s ela cai logo ali. Só a 7,9 km/s a Terra se curva na mesma medida que a bala cai.',
  '',
  'Ótimo erro para aprender! A 79 km/s ela escaparia da Terra. A 7,9 km/s, a Terra se curva na mesma medida que a bala cai.',
  'Ótimo erro: ela sempre cai, sim! Mas a 7,9 km/s a Terra se curva na mesma medida, e a queda nunca termina.',
]

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const [scene, setScene] = useScenes(props, 2, 'prevejaScene')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(chosen !== null), [chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state:
      chosen === null
        ? 'O aluno ainda não escolheu.'
        : `Escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'correto' : 'incorreto'}). ${scene === 1 ? 'O palco disparou a 7,9 km/s: a bala dá a volta na Terra.' : ''}`,
  })
  const choose = (i: number) => {
    setAnswer('prediction', i)
    haptic(i === PREDICTION_ANSWER ? [10, 40, 10] : 20)
    timer.current = setTimeout(() => setScene(1), 650)
  }
  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            Faça uma aposta. Com qual velocidade a bala dá a volta na Terra <strong>sem nunca tocar o chão</strong>?
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso mesmo: 7,9 km/s.</strong> Ela continua caindo, mas a Terra se curva na mesma medida. Órbita é queda livre sem fim.
          </>
        ) : (
          <>{PREDICTION_WHY[chosen ?? 0]}</>
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
                <span className={cn(i < 3 && 'font-mono', 'text-[14.5px]')}>{p}</span>
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
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 2, 'entendaScene')
  const { fire, setLive, later, v } = useCannon()
  const circV = typeof answers.circV === 'number' ? (answers.circV as number) : null
  const ellipse = Boolean(answers.madeEllipse)
  const escape = Boolean(answers.madeEscape)
  useEffect(() => setReady(scene === 0 ? circV !== null : ellipse && escape), [scene, circV, ellipse, escape, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: `Cena ${scene + 1}/2. Velocidade ${kms(v, 2)}, trajetória: ${TRAJECTORY_LABEL[classify(v)]}. Círculo ${circV !== null ? `achado a ${kms(circV, 2)}` : 'ainda não'}; elipse ${ellipse ? 'feita' : 'falta'}; escape ${escape ? 'feito' : 'falta'}.`,
  })

  const controls = (
    <div className="space-y-3">
      <SpeedSlider v={v} onChange={(x) => setLive({ v: x })} />
      <div className="flex items-center gap-2.5">
        <FireButton onClick={() => fire()} />
        {scene === 0 ? (
          <>
            <Dot done={circV !== null} label="Círculo" />
            {circV === null && <ShowMe onClick={() => fire(7.9)} />}
          </>
        ) : (
          <>
            <Dot done={ellipse} label="Elipse" />
            <Dot done={escape} label="Escape" />
            {!(ellipse && escape) && (
              <ShowMe
                onClick={() => {
                  fire(9.6)
                  later(3600, () => fire(11.6))
                  later(5200, () => {
                    setAnswer('madeEllipse', true)
                    setAnswer('madeEscape', true)
                  })
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={
        scene === 0 ? (
          circV === null ? (
            <>
              Sua vez: ache a velocidade em que a bala dá a volta <strong>em círculo</strong>, sempre à mesma altura.
            </>
          ) : (
            <>
              Achou: <strong>{kms(circV, 2)}</strong>. A bala cai o tempo todo, mas a Terra se curva por baixo na mesma medida.
            </>
          )
        ) : (
          <>
            Mais rápida, a órbita vira uma <strong>elipse</strong>. A partir de 11,2 km/s (√2 × 7,9), a bala <strong>escapa</strong>. Faça as duas.
          </>
        )
      }
      narration={
        scene === 1 ? 'Mais rápida, a órbita vira uma elipse. A partir de 11,2 quilômetros por segundo, raiz de dois vezes 7,9, a bala escapa. Faça as duas.' : undefined
      }
      nudge={
        scene === 0 && circV === null
          ? 'Repare no rótulo do palco: se ela cai, falta velocidade; se vira elipse, passou. Ajuste aos poucos.'
          : scene === 1 && !(ellipse && escape)
            ? 'Suba a velocidade em passos e veja o rótulo mudar no canto do palco.'
            : undefined
      }
      controls={controls}
    />
  )
}

// ------------------------------------------------------------ 4. Observe

export function Observe(props: StepProps) {
  const { lab, setReady, answers } = props
  const [scene] = useScenes(props, 3, 'observeScene')
  const [live, setLive] = useLive<OrbitLive>()
  const slices = typeof answers.slices === 'number' ? (answers.slices as number) : 0
  const done = slices >= SLICES_GOAL
  useEffect(() => setReady(scene !== 1 || done), [scene, done, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state: `Cena ${scene + 1}/3. Planeta imaginário com e = 0,6 em volta de uma estrela como o Sol. Fatias marcadas: ${slices} de ${SLICES_GOAL}${done ? '; todas com ≈ 0,25 UA²' : ''}.`,
  })

  const captions = [
    <>
      Afaste o olhar: a Terra vira uma estrela, e a bala, um planeta numa órbita alongada. Perto da estrela, ele <strong>corre</strong>.
    </>,
    done ? (
      <>
        Fatias curtas e largas, outras longas e finas… e todas com <strong>a mesma área</strong>!
      </>
    ) : (
      <>
        Toque em <strong>Marcar</strong> para pintar a área que a linha estrela–planeta varre em tempos iguais. Faça {SLICES_GOAL}.
      </>
    ),
    <>
      <strong>2ª lei de Kepler (1609):</strong> a linha estrela–planeta varre áreas iguais em tempos iguais.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !done ? 'Marque uma fatia perto da estrela e outra bem longe. Compare a forma e o número de cada uma.' : undefined}
      controls={
        scene === 1 ? (
          <div className="flex items-center gap-2.5">
            <Button size="md" onClick={() => setLive({ mark: (live.mark ?? 0) + 1 })} className="shrink-0 px-4">
              <Sparkles className="h-4 w-4" /> Marcar
            </Button>
            <div className="flex gap-1.5" aria-label={`${slices} de ${SLICES_GOAL} fatias`}>
              {Array.from({ length: SLICES_GOAL }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: i < slices ? 1 : 0.85, backgroundColor: i < slices ? (i % 2 ? 'rgb(246,183,78)' : 'rgb(70,217,198)') : 'rgba(255,255,255,0.12)' }}
                  transition={spring.snappy}
                  className="h-2.5 w-7 rounded-full"
                />
              ))}
            </div>
            {!done && <ShowMe onClick={() => setLive({ autoMark: (live.autoMark ?? 0) + 1 })} />}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Meça

export function Meca(props: StepProps) {
  const { lab, setReady, answers, setAnswer } = props
  const [scene] = useScenes(props, 4, 'mecaScene')
  const [live, setLive] = useLive<OrbitLive>()
  const { ask } = useVega()
  const k = live.slope ?? DEFAULT_SLOPE
  const fittedNow = Math.abs(k - 1) < SLOPE_TOLERANCE
  const fitted = Boolean(answers.fitted)
  useEffect(() => {
    if (fittedNow && scene === 2) {
      setAnswer('slope', k)
      if (!fitted) {
        setAnswer('fitted', true)
        haptic([10, 40, 10])
      }
    }
  }, [fittedNow, fitted, k, scene, setAnswer])
  useEffect(() => setReady(scene !== 2 || fitted), [scene, fitted, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'meca',
    state: `Cena ${scene + 1}/4. ${scene === 0 ? 'Sistema Solar animado.' : scene === 1 ? 'Gráfico T × a: uma curva.' : `Gráfico T² × a³; reta com k = ${formatNumber(k, 2)} ano²/UA³ (${fittedNow ? 'encaixada' : 'fora dos pontos'}).`}`,
  })

  const captions = [
    <>O Sistema Solar de verdade, de Mercúrio a Saturno. Quem está mais longe demora muito mais para dar a volta.</>,
    <>
      Cada planeta vira um ponto: distância <strong>a</strong> e período <strong>T</strong>. Os pontos formam uma curva, não uma reta.
    </>,
    fittedNow ? (
      <>
        <strong>Encaixou!</strong> A reta passa por todos os planetas com k = {formatNumber(k, 2)} ano²/UA³.
      </>
    ) : (
      <>
        Agora em <strong>T² × a³</strong>, os pontos se alinham! Gire a reta até ela passar por todos.
      </>
    ),
    <>
      <strong>3ª lei de Kepler (1619): T² ∝ a³.</strong> Em anos e UA, T² = a³ para todo planeta do Sol.
    </>,
  ]
  const narrations = [
    undefined,
    undefined,
    fittedNow ? `Encaixou! A reta passa por todos os planetas com k igual a ${formatNumber(k, 2)}.` : 'Agora em T ao quadrado por a ao cubo, os pontos se alinham! Gire a reta até ela passar por todos.',
    'Terceira lei de Kepler, de 1619: T ao quadrado é proporcional a a ao cubo. Em anos e unidades astronômicas, T ao quadrado é igual a a ao cubo para todo planeta do Sol.',
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene}
      caption={captions[scene]}
      narration={narrations[scene]}
      nudge={scene === 2 && !fitted ? 'Olhe o quadro ampliado: a reta precisa passar também pelos planetas de perto.' : undefined}
      controls={
        scene === 2 ? (
          <div className="space-y-2.5">
            <Slider label="Inclinação k da reta (ano²/UA³)" min={0.2} max={3} step={0.01} value={k} onChange={(x) => setLive({ slope: x })} display={formatNumber(k, 2)} />
            <div className="flex items-center gap-2.5">
              <Dot done={fitted} label={fittedNow ? 'Encaixada' : 'Encaixe'} />
              {!fitted && (
                <button onClick={() => ask('Como eu sei qual inclinação a reta deve ter?')} className="inline-flex items-center gap-1.5 text-[13px] text-violet-200/80 hover:text-violet-100">
                  <Sparkles className="h-3.5 w-3.5" /> Dica da Vega
                </button>
              )}
              {!fitted && <ShowMe onClick={() => setLive({ slope: 1 })} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

const ISS_G = gravityFraction(400e3)

const CHALLENGES: { id: (typeof CHALLENGE_IDS)[number]; q: React.ReactNode; voice: string; options: string[]; answer: number; explain: string; mono?: boolean }[] = [
  {
    id: 'quatro-ua',
    q: (
      <>
        Um planeta imaginário gira a <strong>4 UA</strong> do Sol. Quanto dura o ano dele?
      </>
    ),
    voice: 'Um planeta imaginário gira a 4 unidades astronômicas do Sol. Quanto dura o ano dele?',
    options: ['4 anos', '8 anos', '16 anos', '64 anos'],
    answer: 1,
    explain: 'T² = a³ = 4³ = 64, então T = 8 anos. O ano cresce mais depressa que a distância.',
    mono: true,
  },
  {
    id: 'iss',
    q: (
      <>
        Os astronautas da ISS (≈ 400 km de altura, volta em ≈ 92 min) <strong>flutuam</strong> porque…
      </>
    ),
    voice: 'Os astronautas da Estação Espacial, a 400 quilômetros de altura, flutuam porque…',
    options: ['Não há gravidade lá', 'Caem junto com ela', 'Estão longe da Terra', 'A estação os segura'],
    answer: 1,
    explain: `Lá a gravidade ainda é ≈ ${formatNumber(ISS_G * 100, 0)} % da daqui. Estação e astronautas caem juntos, em queda livre sem fim.`,
  },
  {
    id: 'raiz-de-dois',
    q: (
      <>
        E se a Terra de repente andasse <strong>√2 ≈ 1,41 vez</strong> mais rápido na órbita? Ela…
      </>
    ),
    voice: 'E se a Terra de repente andasse raiz de dois, 1,41 vez, mais rápido na órbita? Ela…',
    options: ['Cairia no Sol', 'Faria uma elipse', 'Escaparia do Sol', 'Nada mudaria'],
    answer: 2,
    explain: '√2 × a velocidade circular é a velocidade de escape. A Terra iria embora numa parábola, para nunca mais voltar.',
  },
]

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const picks = (answers.challenges as Challenges | undefined) ?? {}
  const [scene] = useScenes(props, CHALLENGES.length, 'eseScene')
  const c = CHALLENGES[scene]
  const picked = picks[c.id]
  useEffect(() => setReady(picked !== undefined), [picked, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state: `Desafio ${scene + 1} de ${CHALLENGES.length}: ${c.voice} ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu "${c.options[picked]}" (${picked === c.answer ? 'certo' : 'errado'}).`}`,
  })
  const choose = (i: number) => {
    setAnswer('challenges', { ...picks, [c.id]: i })
    haptic(i === c.answer ? [10, 40, 10] : 20)
  }

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
      narration={picked === undefined ? c.voice : undefined}
      controls={
        picked === undefined ? (
          <div className="grid grid-cols-2 gap-2">
            {c.options.map((o, i) => (
              <Choice key={o} onClick={() => choose(i)}>
                <span className={cn('text-[14px] leading-tight', c.mono && 'font-mono')}>{o}</span>
              </Choice>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setAnswer('challenges', { ...picks, [c.id]: undefined })}
            className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Responder de novo
          </button>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady, answers }: StepProps) {
  const circV = typeof answers.circV === 'number' ? (answers.circV as number) : V_CIRC
  const slope = typeof answers.slope === 'number' ? (answers.slope as number) : 1
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `Conclusão. Órbita circular a ${kms(circV, 2)}; k = ${formatNumber(slope, 2)} ano²/UA³; planeta a 4 UA: 8 anos.` })
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
          <span className="mt-1 block text-[15px] text-white/60">Próximo passo: olhe Júpiter no céu. Ele obedece à mesma regra.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Próximo passo: olhe Júpiter no céu. Ele obedece à mesma regra.`}
      controls={
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Órbita" value={kms(circV, 1)} />
            <Summary label="T² = k·a³" value={`k = ${formatNumber(slope, 2)}`} />
            <Summary label="A 4 UA" value="8 anos" />
          </div>
          <p className="text-[10.5px] leading-snug text-white/30">Newton, Principia (1687); Kepler, Astronomia Nova (1609) e Harmonices Mundi (1619); NASA Planetary Fact Sheet</p>
        </div>
      }
    />
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[15px] text-white">{value}</p>
    </motion.div>
  )
}

export const ORBITAS_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  meca: Meca,
  'e-se': ESe,
  conclua: Conclua,
}
