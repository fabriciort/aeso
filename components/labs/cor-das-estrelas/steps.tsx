'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { T_SUN, wienPeakNm } from '@/lib/astro/blackbody'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import { CHALLENGES, clampT, colorName, fromSlider, ORION, STAR_A_T, STAR_B_T, SUN_BEST_T, toSlider, type ColorLive } from './data'

// "Por que as estrelas têm cores". The Palco is continuous (Stage.tsx);
// these Etapas only tell the story and hold the controls.

const K = (T: number) => `${formatNumber(T, 0)} K`

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

function TempSlider({ T, onChange, min = 300, max = 30000, label = 'Temperatura' }: { T: number; onChange: (T: number) => void; min?: number; max?: number; label?: string }) {
  return <Slider label={label} min={toSlider(min)} max={toSlider(max)} step={0.001} value={toSlider(T)} onChange={(s) => onChange(clampT(fromSlider(s), min, max))} display={K(T)} />
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
  const { lab, setReady } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const [live, setLive] = useLive<ColorLive>()
  const T = live.T ?? 300
  const ember = useTask(T >= 1000, 'ember', props)
  const blue = useTask(T >= 9000, 'blue', props)
  useEffect(() => setReady(scene !== 1 || (ember && blue)), [scene, ember, blue, setReady])
  useVegaScreen({ lab: lab.slug, step: 'imagine', state: `Cena ${scene + 1}/3. Esfera a ${K(T)} (${colorName(T)}).` })

  const captions = [
    <>
      Imagine uma esfera de metal num forno que esquenta <strong>sem limite</strong>. Agora ela está na temperatura da sala: escura.
    </>,
    <>
      Aqueça a esfera, <strong>arrastando para cima</strong>. Repare quando ela começa a brilhar e que cor tem.
    </>,
    <>
      Vermelho, laranja, amarelo, branco… e, quentíssima, <strong>azulada</strong>. A cor da luz é um termômetro.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !(ember && blue) ? (ember ? 'Continue subindo: bem quente, a cor muda de novo.' : 'Arraste para cima no palco, devagar, e repare quando ela começa a brilhar.') : undefined}
      controls={
        scene >= 1 ? (
          <div className="space-y-3">
            <TempSlider T={T} onChange={(v) => setLive({ T: v })} />
            <div className="flex items-center gap-4">
              <Dot done={ember} label="Brasa" />
              <Dot done={blue} label="Azulada" />
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['A, a vermelha', 'B, a azul', 'As duas iguais', 'Não dá para saber']
const PREDICTION_ANSWER = 1

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
            Duas estrelas: <strong>A é avermelhada</strong>, <strong>B é azulada</strong>. Qual delas é mais quente?
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso!</strong> A vermelha tem uns {formatNumber(STAR_A_T - 273, 0)} °C; a azul, mais de {formatNumber(STAR_B_T - 273, 0)} °C. Na luz, azul é o mais quente.
          </>
        ) : (
          <>
            <strong>Pegadinha clássica!</strong> Na torneira vermelho é quente, mas na luz é o contrário: lembre da esfera, que ficou azulada quando estava mais quente.
          </>
        )
      }
      narration={scene === 0 ? 'Duas estrelas: A é avermelhada, B é azulada. Qual delas é mais quente? A vermelha, a azul, as duas iguais, ou não dá para saber?' : undefined}
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
  const [scene] = useScenes(props, 3, 'entendaScene')
  const [live, setLive] = useLive<ColorLive>()
  const T = live.T ?? 5772
  const peak = wienPeakNm(T)
  const ir = useTask(scene >= 1 && peak > 750, 'peakIr', props)
  const uv = useTask(scene >= 1 && peak < 380, 'peakUv', props)

  // The curve needs a glowing object: coming from a cold sphere, warm it up.
  useEffect(() => {
    if ((live.T ?? 0) < 1500) setLive({ T: 3000 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => setReady(scene !== 1 || (ir && uv)), [scene, ir, uv, setReady])
  useVegaScreen({ lab: lab.slug, step: 'entenda', state: `Cena ${scene + 1}/3. Curva de corpo negro a ${K(T)}, pico em ${formatNumber(peak, 0)} nm.` })

  const captions = [
    <>
      Um objeto quente emite <strong>todas as cores</strong>, e até luz invisível, mas não na mesma quantidade. A curva mostra quanto de cada uma.
    </>,
    <>
      O pico da curva anda com a temperatura. Leve o pico para o <strong>infravermelho</strong> e depois para o <strong>ultravioleta</strong>.
    </>,
    <>
      É a <strong>lei de Wien</strong>: λ<sub>pico</sub> = 2.898.000 ÷ T. Ache o pico da luz e você sabe a temperatura.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      narration={
        scene === 2
          ? 'É a lei de Wien: o comprimento de onda do pico é 2 milhões e 898 mil dividido pela temperatura em kelvin. Ache o pico da luz e você sabe a temperatura.'
          : undefined
      }
      nudge={scene === 1 && !(ir && uv) ? 'Esfrie até o pico sair pela direita do arco-íris; depois esquente até ele passar da ponta violeta.' : undefined}
      controls={
        scene >= 1 ? (
          <div className="space-y-3">
            <TempSlider T={T} min={1500} onChange={(v) => setLive({ T: v })} />
            {scene === 1 ? (
              <div className="flex items-center gap-4">
                <Dot done={ir} label="Infravermelho" />
                <Dot done={uv} label="Ultravioleta" />
              </div>
            ) : (
              <div className="flex gap-2">
                <Chip active={Math.abs(T - 3600) < 30} onClick={() => setLive({ T: 3600 })}>
                  Betelgeuse
                </Chip>
                <Chip active={Math.abs(T - T_SUN) < 30} onClick={() => setLive({ T: T_SUN })}>
                  Sol
                </Chip>
                <Chip active={Math.abs(T - 12100) < 60} onClick={() => setLive({ T: 12100 })}>
                  Rigel
                </Chip>
              </div>
            )}
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
  const picked = Array.isArray(answers.picked) ? (answers.picked as string[]) : []
  const both = picked.includes('betelgeuse') && picked.includes('rigel')
  const advanced = useRef(false)

  useEffect(() => {
    if (scene === 1 && both && !advanced.current) {
      advanced.current = true
      haptic([12, 50, 12])
      const t = setTimeout(() => setScene(2), 1300)
      return () => clearTimeout(t)
    }
  }, [scene, both, setScene])
  useEffect(() => setReady(scene !== 1 || both), [scene, both, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state: `Cena ${scene + 1}/3. Constelação de Órion. Estrelas tocadas: ${picked.map((p) => ORION.find((s) => s.id === p)?.name).join(', ') || 'nenhuma'}.`,
  })

  const captions = [
    <>
      Esta é <strong>Órion</strong>, que brilha nas noites de verão do Brasil. Repare: Betelgeuse é alaranjada e Rigel, azulada.
    </>,
    <>
      Toque em <strong>Betelgeuse</strong> e em <strong>Rigel</strong> para decompor a luz de cada uma.
    </>,
    <>
      O pico de Betelgeuse fica no infravermelho: <strong>≈ 3.600 K</strong>. O de Rigel, no ultravioleta: <strong>≈ 12.000 K</strong>.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !both ? 'Betelgeuse é o ombro de Órion, em cima à esquerda. Rigel é o pé, embaixo à direita.' : undefined}
      controls={
        scene === 1 ? (
          <div className="flex items-center gap-4">
            <Dot done={picked.includes('betelgeuse')} label="Betelgeuse" />
            <Dot done={picked.includes('rigel')} label="Rigel" />
            {!both && (
              <button
                onClick={() => setAnswer('picked', Array.from(new Set([...picked, 'betelgeuse', 'rigel'])))}
                className="ml-auto text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
              >
                Me mostre
              </button>
            )}
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
  const [live, setLive] = useLive<ColorLive>()
  const T = live.modelT ?? (typeof answers.sunT === 'number' ? (answers.sunT as number) : 3500)
  const { ask } = useVega()
  const err = Math.abs(T - SUN_BEST_T) / SUN_BEST_T
  const fitted = err < 0.03
  const locked = Boolean(answers.measured)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (live.modelT === undefined) setLive({ modelT: T })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (fitted && !locked) {
      setAnswer('measured', true)
      setAnswer('sunT', Math.round(T))
      setCelebrate(true)
      haptic([14, 60, 20])
      setTimeout(() => setCelebrate(false), 1200)
      setTimeout(() => setScene(1), 1300)
    }
  }, [fitted, locked, T, setAnswer, setScene])
  useEffect(() => setReady(locked), [locked, setReady])

  const status = err < 0.03 ? 'Encaixou!' : err < 0.08 ? 'Quase lá' : err < 0.2 ? 'Chegando perto' : 'Ainda longe'
  const meter = Math.max(0, 1 - err / 0.45)
  useVegaScreen({ lab: lab.slug, step: 'meca', state: `Modelo a ${K(T)} (pico ${formatNumber(wienPeakNm(T), 0)} nm). Situação: ${status}.` })

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            Os pontos são a luz do <strong>Sol</strong>, cor por cor. Ajuste a temperatura até a curva passar <strong>pelo meio dos pontos</strong>.
          </>
        ) : (
          <>
            Você mediu <strong>≈ {K(Math.round(T / 10) * 10)}</strong> na superfície do Sol. O pico fica no verde-azulado, mas ele emite todas as cores: por isso parece branco.
          </>
        )
      }
      nudge={scene === 0 && !fitted ? 'Olhe onde fica o pico dos pontos. A curva precisa ter o pico no mesmo lugar.' : undefined}
      controls={
        scene === 0 ? (
          <div className="space-y-3">
            <TempSlider T={T} min={2500} max={10000} label="Temperatura do modelo" onChange={(v) => setLive({ modelT: v })} />
            <div className="relative">
              {celebrate && <Burst color="#ffd27a" />}
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="text-white/55">Encaixe</span>
                <motion.span key={status} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy} className={cn('font-medium', fitted ? 'text-emerald-300' : 'text-white/80')}>
                  {status}
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', fitted ? 'bg-emerald-300' : 'bg-gradient-to-r from-orange-300 to-amber-200')} animate={{ width: `${meter * 100}%` }} transition={spring.snappy} />
              </div>
            </div>
            {!fitted && (
              <button onClick={() => ask('Como eu sei se a curva encaixou nos pontos do Sol?')} className="hidden items-center gap-1.5 text-[13px] text-violet-200/80 hover:text-violet-100 sm:inline-flex">
                <Sparkles className="h-3.5 w-3.5" /> Pedir uma dica à Vega
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Pico da luz" value={`${formatNumber(wienPeakNm(T), 0)} nm`} />
            <Readout label="Temperatura" value={`${formatNumber(T - 273.15, 0)} °C`} accent />
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
      <p className={cn('mt-0.5 text-[17px] font-medium tabular-nums', accent ? 'text-orange-200' : 'text-white')}>{value}</p>
    </div>
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
      narration={picked === undefined ? `${c.q} ${c.options.join('; ')}.` : undefined}
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

export function Conclua({ lab, setReady, answers, onExplore }: StepProps) {
  const sunT = typeof answers.sunT === 'number' ? (answers.sunT as number) : SUN_BEST_T
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `O aluno mediu ${K(sunT)} para o Sol.` })
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
          <span className="mt-1 block text-[15px] text-white/60">A cor da luz revela a temperatura: vermelho é frio, azul é quente.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} A cor da luz revela a temperatura: vermelho é frio, azul é quente.`}
      controls={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Sol · você" value={K(sunT)} />
            <Summary label="Betelgeuse" value="3.600 K" />
            <Summary label="Rigel" value="12.100 K" />
          </div>
          <div className="flex items-center gap-3">
            {onExplore && (
              <Button variant="secondary" onClick={onExplore}>
                Ver Betelgeuse no Céu
              </Button>
            )}
            <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-white/30">Planck (1900); Wien (1893); Levesque & Massey (2020); Przybilla et al. (2006)</p>
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

export const COR_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  meca: Meca,
  'e-se': ESe,
  conclua: Conclua,
}
