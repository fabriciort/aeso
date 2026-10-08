'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Volume2, VolumeX } from 'lucide-react'
import {
  ANDROMEDA,
  C_KMS,
  fitError,
  GALAXIES,
  GALAXIES_BEST_H0,
  H_ALPHA,
  hubbleTimeGyr,
  hubbleVelocity,
  observedWavelength,
  PLANCK_H0,
  SHOES_H0,
  UNIVERSE_AGE_GYR,
} from '@/lib/astro/cosmology'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  AMB_MAX,
  AMB_MIN,
  aligned,
  DEFAULTS,
  ENT_MAX,
  ENT_MIN,
  entendaDone,
  FIT_TOL,
  H_MAX,
  H_MIN,
  MEASURE_GOAL,
  measuredList,
  U_MAX,
  type UniLive,
} from './shared'
import { audioSupported, startSiren, stopSiren } from './siren'

// "Meça a expansão do universo". The Palco is continuous (Stage.tsx); these
// Etapas only tell the story and hold the controls.

const kms = (v: number) => `${formatNumber(v, 0)} km/s`

function useUni() {
  const [live, setLive] = useLive<UniLive>()
  return [{ ...DEFAULTS, ...live } as UniLive, setLive] as const
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

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
      Me mostre
    </button>
  )
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

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const [L, setLive] = useUni()
  const heard = Boolean(answers.heard)
  const changed = useTask(Math.abs(L.ambV - DEFAULTS.ambV) >= 5, 'speedChanged', props)
  useEffect(() => setReady(scene !== 1 || (heard && changed)), [scene, heard, changed, setReady])

  // Never leave the siren on behind the student's back.
  useEffect(
    () => () => {
      stopSiren()
      setLive({ listening: false })
    },
    [setLive],
  )

  const toggle = () => {
    if (L.listening) {
      stopSiren()
      setLive({ listening: false })
      return
    }
    const ok = startSiren()
    setLive({ listening: ok })
    if (!heard) setAnswer('heard', true)
  }

  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/3. Ambulância a ${formatNumber(L.ambV, 0)} m/s; som ${L.listening ? 'ligado' : 'desligado'}.`,
  })

  const captions = [
    <>
      Noite. Uma ambulância passa por você. Repare nos círculos: são as <strong>ondas de som</strong> da sirene.
    </>,
    <>
      Toque em <strong>Ouvir</strong> e mude a velocidade. Preste atenção no tom quando ela passa por você.
    </>,
    <>
      Chegando, as ondas se apertam: som <strong>mais agudo</strong>. Indo embora, se esticam: <strong>mais grave</strong>. É o efeito Doppler.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !(heard && changed) ? 'Olhe as ondas na frente da ambulância e atrás dela. Onde estão mais juntas?' : undefined}
      controls={
        scene >= 1 ? (
          <div className="space-y-3">
            <Slider label="Velocidade da ambulância" min={AMB_MIN} max={AMB_MAX} step={1} value={L.ambV} onChange={(v) => setLive({ ambV: v })} display={`${formatNumber(L.ambV, 0)} m/s`} />
            <div className="flex items-center gap-3">
              <Button variant={L.listening ? 'secondary' : 'primary'} onClick={toggle} className="h-9">
                {L.listening ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {L.listening ? 'Parar' : 'Ouvir'}
              </Button>
              {scene === 1 && (
                <>
                  <Dot done={heard} label="ouvir" />
                  <Dot done={changed} label="velocidade" />
                  {!heard && (
                    <button
                      onClick={() => setAnswer('heard', true)}
                      className="ml-auto text-[12.5px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
                    >
                      {audioSupported() ? 'Sem som agora' : 'Sem áudio aqui'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['Mais azul', 'Mais vermelha', 'Mais brilhante', 'Igual']
const PREDICTION_ANSWER = 1

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const [scene, setScene] = useScenes(props, 2, 'prevejaScene')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => setReady(chosen !== null), [chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: chosen === null ? 'O aluno ainda não escolheu.' : `O aluno escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'correto' : 'incorreto'}).`,
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
            A luz também é uma onda. Se uma galáxia <strong>se afasta</strong> de nós, a luz dela fica…
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso mesmo!</strong> Indo embora, as ondas se esticam: a luz desliza para o <strong>vermelho</strong>. É o <em>redshift</em>.
          </>
        ) : (
          <>
            Ótimo erro para aprender! Como a sirene indo embora, a onda se estica: a luz desliza para o <strong>vermelho</strong> (<em>redshift</em>).
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
  const [L, setLive] = useUni()
  const done = useTask(entendaDone(L.entV), 'entendaDone', props)
  useEffect(() => setReady(scene === 0 || done), [scene, done, setReady])
  const nm = observedWavelength(H_ALPHA, L.entV)
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: `Cena ${scene + 1}/2. Velocidade ${kms(L.entV)}; Hα observada em ${formatNumber(nm, 1)} nm. ${done ? 'Tarefa feita.' : 'Tarefa: Hα perto de 670 nm.'}`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            O hidrogênio deixa <strong>linhas escuras</strong> sempre nos mesmos lugares do arco-íris, como um <strong>código de barras</strong>.
          </>
        ) : (
          <>
            Em movimento, todas as linhas andam juntas: <strong>v ≈ c·Δλ/λ</strong>. Leve a linha Hα até <strong>670 nm</strong>.
          </>
        )
      }
      narration={
        scene === 1
          ? 'Em movimento, todas as linhas andam juntas. A velocidade é a velocidade da luz vezes o deslocamento da linha, dividido pelo comprimento de onda original. Leve a linha H alfa até 670 nanômetros.'
          : undefined
      }
      nudge={scene === 1 && !done ? 'Olhe a linha mais à direita, a Hα. Para onde ela precisa andar para chegar a 670?' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Velocidade da fonte" min={ENT_MIN} max={ENT_MAX} step={50} value={L.entV} onChange={(v) => setLive({ entV: v })} display={kms(Math.round(L.entV / 10) * 10)} />
            <div className="flex items-center gap-3">
              <Dot done={done} label={`Hα ≈ 670 nm${done ? ` · v ≈ ${kms(Math.round(L.entV / 100) * 100)}` : ''}`} />
              {!done && <ShowMe onClick={() => setLive({ entV: 6200 })} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. Observe

export function Observe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 3, 'observeScene')
  const [L, setLive] = useUni()
  const measured = measuredList(answers)
  const enough = measured.length >= MEASURE_GOAL
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => setReady(scene !== 1 || enough), [scene, enough, setReady])

  // Entering the task: point at the first galaxy not measured yet.
  useEffect(() => {
    if (scene !== 1) return
    if (measured.includes(L.sel)) {
      const next = GALAXIES.findIndex((_, i) => !measured.includes(i))
      if (next >= 0) setLive({ sel: next, u: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  const record = (i: number) => {
    if (measured.includes(i)) return
    const next = [...measured, i]
    setAnswer('measured', next)
    setLive({ u: GALAXIES[i].velocityKms })
    haptic(next.length >= MEASURE_GOAL ? [12, 50, 12] : [10, 30, 10])
    if (next.length >= MEASURE_GOAL) {
      if (scene === 1) timers.current.push(setTimeout(() => setScene(2), 1100))
    } else {
      const nextSel = GALAXIES.findIndex((_, j) => !next.includes(j))
      if (nextSel >= 0) timers.current.push(setTimeout(() => setLive({ sel: nextSel, u: 0 }), 1000))
    }
  }

  // Aligned within the tolerance: the line snaps and the velocity is measured.
  useEffect(() => {
    if (scene === 1 && aligned(L.sel, L.u)) record(L.sel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.sel, L.u, scene])

  const sel = GALAXIES[L.sel]
  const selDone = measured.includes(L.sel)
  const undoneNm = (H_ALPHA * L.u) / C_KMS

  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state:
      scene === 1
        ? `Mediu ${measured.length} de ${MEASURE_GOAL}. Selecionada: ${sel.id} (${sel.distanceMpc} Mpc), ${selDone ? `medida em ${kms(sel.velocityKms)}` : `deslocamento desfeito ${formatNumber(undoneNm, 1)} nm`}.`
        : `Cena ${scene + 1}/3. Mapa com as galáxias A–E e a Via Láctea no centro.`,
  })

  const captions = [
    <>
      Cinco galáxias imaginárias. A distância de cada uma veio de <strong>velas padrão</strong>: estrelas de brilho conhecido. Falta a velocidade.
    </>,
    <>
      Toque numa galáxia e arraste o espectro dela até a linha Hα <strong>alinhar com a do laboratório</strong>. Meça {MEASURE_GOAL}.
    </>,
    <>
      Viu o padrão? <strong>Quanto mais longe</strong> a galáxia, <strong>mais rápido</strong> ela se afasta de nós.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !enough ? 'Compare as duas linhas escuras: a de baixo precisa ficar exatamente embaixo da de cima.' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider
              label={`Desfazer o deslocamento · ${sel.id}`}
              min={0}
              max={U_MAX}
              step={10}
              value={L.u}
              onChange={(u) => !selDone && setLive({ u })}
              display={selDone ? kms(sel.velocityKms) : `${formatNumber(undoneNm, 1)} nm`}
            />
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {Array.from({ length: MEASURE_GOAL }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ scale: i < measured.length ? 1 : 0.85, backgroundColor: i < measured.length ? lab.accent : 'rgba(255,255,255,0.12)' }}
                    transition={spring.snappy}
                    className="h-2.5 w-8 rounded-full"
                  />
                ))}
              </div>
              <span className="text-sm text-white/55">
                {Math.min(measured.length, MEASURE_GOAL)} de {MEASURE_GOAL}
              </span>
              {!enough && <ShowMe onClick={() => record(selDone ? GALAXIES.findIndex((_, i) => !measured.includes(i)) : L.sel)} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Meça

export function Meca(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 2, 'mecaScene')
  const [L, setLive] = useUni()
  const { ask } = useVega()
  const locked = typeof answers.H0 === 'number'
  const H = locked ? (answers.H0 as number) : L.H
  const err = fitError(L.H, GALAXIES_BEST_H0)
  const fitted = err < FIT_TOL
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (fitted && !locked && scene === 0) {
      setAnswer('H0', Math.round(L.H * 10) / 10)
      haptic([14, 60, 20])
      timer.current = setTimeout(() => setScene(1), 1300)
    }
  }, [fitted, locked, scene, L.H, setAnswer, setScene])
  useEffect(() => setReady(locked), [locked, setReady])

  const status = locked ? 'Encaixou!' : err < 0.1 ? 'Quase lá' : err < 0.25 ? 'Chegando perto' : 'Ainda longe'
  const meter = locked ? 1 : Math.max(0, 1 - err / 0.45)

  useVegaScreen({
    lab: lab.slug,
    step: 'meca',
    state: `Reta com H0 = ${formatNumber(H, 1)} km/s/Mpc. ${locked ? 'Encaixou.' : `Situação: ${status}.`}`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            Cada ponto é uma galáxia. Incline a reta <strong>v = H₀·d</strong> até ela passar <strong>pelo meio dos pontos</strong>.
          </>
        ) : (
          <>
            Seu H₀: <strong>{formatNumber(H, 1)} km/s por Mpc</strong>. Planck mede 67,4 e o Hubble, 73,0. Ninguém sabe por quê: é a <strong>tensão de Hubble</strong>.
          </>
        )
      }
      narration={
        scene === 0
          ? 'Cada ponto é uma galáxia. Incline a reta, velocidade igual a H zero vezes a distância, até ela passar pelo meio dos pontos.'
          : `Seu H zero: ${formatNumber(H, 1)} quilômetros por segundo por megaparsec. O satélite Planck mede 67,4 e o telescópio Hubble, 73,0. Ninguém sabe por quê: é a tensão de Hubble.`
      }
      nudge={scene === 0 && !locked ? 'Olhe as linhas finas entre os pontos e a reta: o melhor encaixe deixa pontos dos dois lados.' : undefined}
      controls={
        scene === 0 ? (
          <div className="space-y-3">
            <Slider label="Inclinação H₀ (km/s/Mpc)" min={H_MIN} max={H_MAX} step={0.5} value={H} onChange={(v) => !locked && setLive({ H: v })} display={formatNumber(H, 1)} />
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="text-white/55">Encaixe</span>
                <span className="flex items-center gap-3">
                  {!locked && (
                    <button onClick={() => ask('Como eu sei se a reta encaixou nos pontos?')} className="inline-flex items-center gap-1 text-[12.5px] text-violet-200/80 hover:text-violet-100">
                      <Sparkles className="h-3.5 w-3.5" /> Dica
                    </button>
                  )}
                  {!locked && (
                    <button onClick={() => setLive({ H: Math.round(GALAXIES_BEST_H0 * 2) / 2 })} className="text-[12.5px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
                      Me mostre
                    </button>
                  )}
                  <motion.span key={status} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy} className={cn('font-medium', locked ? 'text-emerald-300' : 'text-white/80')}>
                    {status}
                  </motion.span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', locked ? 'bg-emerald-300' : 'bg-gradient-to-r from-amber-300 to-amber-200')} animate={{ width: `${meter * 100}%` }} transition={spring.snappy} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Readout label="Você" value={formatNumber(H, 1)} accent={lab.accent} />
            <Readout label="Planck" value={`${formatNumber(PLANCK_H0.value, 1)} ± ${formatNumber(PLANCK_H0.err, 1)}`} />
            <Readout label="SH0ES" value={`${formatNumber(SHOES_H0.value, 1)} ± ${formatNumber(SHOES_H0.err, 1)}`} />
          </div>
        )
      }
    />
  )
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] tabular-nums text-white" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  )
}

// ------------------------------------------------------------ 6. E se…?

const CHALLENGES = [
  {
    id: 'rebobinar',
    q: 'Rebobine o filme: se tudo se afasta a ~70 km/s por Mpc, há quanto tempo estava tudo junto?',
    options: ['14 mil anos', '14 milhões de anos', '14 bilhões de anos', 'Sempre esteve separado'],
    answer: 2,
    explain: `Tempo ≈ distância ÷ velocidade = 1/H₀ ≈ ${formatNumber(hubbleTimeGyr(70), 0)} bilhões de anos. A idade medida é ${formatNumber(UNIVERSE_AGE_GYR, 1)} bilhões.`,
    narration: `O tempo é a distância dividida pela velocidade, um sobre H zero, cerca de 14 bilhões de anos. A idade medida é 13,8 bilhões.`,
  },
  {
    id: 'centro',
    q: 'Se todas as galáxias se afastam de nós, estamos no centro do universo?',
    options: ['Sim', 'Não, todas veem isso', 'Só na Via Láctea', 'Depende do dia'],
    answer: 1,
    explain: 'De qualquer galáxia se vê o mesmo: todas fugindo. É como passas num pão crescendo: nenhuma é o centro.',
    narration: undefined,
  },
  {
    id: 'andromeda',
    q: `Andrômeda está a 0,78 Mpc: pela lei de Hubble se afastaria a ~${formatNumber(hubbleVelocity(ANDROMEDA.distanceMpc, 70), 0)} km/s. Mas vem até nós a 300 km/s. Por quê?`,
    options: ['A gravidade vence', 'Hubble errou', 'Erro de medida', 'Ela é jovem demais'],
    answer: 0,
    explain: 'Tão perto, a gravidade entre ela e a Via Láctea vence a expansão. As duas devem se encontrar em uns 4 a 5 bilhões de anos.',
    narration: undefined,
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
    state: `Desafio ${scene + 1} de ${CHALLENGES.length}: ${c.q} ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu "${c.options[picked]}" (${picked === c.answer ? 'certo' : 'errado'}).`}`,
  })

  const choose = (i: number) => {
    haptic(i === c.answer ? [10, 40, 10] : 20)
    setAnswer('challenges', { ...picks, [c.id]: i })
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
            <strong>{picked === c.answer ? 'Exato.' : `Ótimo erro: ${c.options[c.answer].toLowerCase()}.`}</strong> {c.explain}
          </>
        )
      }
      narration={picked !== undefined && c.narration ? c.narration : undefined}
      controls={
        picked === undefined ? (
          <div className="grid grid-cols-2 gap-2">
            {c.options.map((o, i) => (
              <Choice key={o} onClick={() => choose(i)}>
                <span className="text-[14px] leading-tight">{o}</span>
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

export function Conclua({ lab, setReady, answers, onExplore }: StepProps) {
  const H = typeof answers.H0 === 'number' ? (answers.H0 as number) : GALAXIES_BEST_H0
  const age = hubbleTimeGyr(H)
  const count = measuredList(answers).length
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `O aluno mediu H0 = ${formatNumber(H, 1)} km/s/Mpc (idade ≈ ${formatNumber(age, 1)} bilhões de anos) com ${count} galáxias.` })
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
          <span className="mt-1 block text-[15px] text-white/60">Da sirene às galáxias: a luz contou a velocidade e a idade do universo.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Agora, veja Andrômeda, a galáxia que vem na nossa direção.`}
      controls={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Seu H₀" value={formatNumber(H, 1)} sub="km/s/Mpc" />
            <Summary label="Idade" value={`${formatNumber(age, 1)} bi`} sub="anos (1/H₀)" />
            <Summary label="Galáxias" value={String(count)} sub="medidas por você" />
          </div>
          <div className="flex items-center gap-3">
            {onExplore && (
              <Button variant="secondary" onClick={onExplore}>
                Ver Andrômeda no Céu
              </Button>
            )}
            <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-white/30">Lemaître (1927); Hubble, PNAS (1929); Planck (2018); Riess et al. (2022)</p>
          </div>
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

export const UNIVERSO_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  meca: Meca,
  'e-se': ESe,
  conclua: Conclua,
}
