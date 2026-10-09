'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { NAMED_STARS, R_SUN_IN_AU } from '@/lib/astro/stars'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import type { HrLive } from './data'
import { fmtR } from './format'
import { BETELGEUSE_R } from './Stage'

// "Monte o diagrama H-R". The Palco (Stage.tsx) is continuous; each Etapa
// renders only the Legenda and the Controles and talks to it through
// answers (saved) and live values.

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-9 rounded-full border px-3 text-[13px] transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
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

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
      Me mostre
    </button>
  )
}

const starName = (id: string) => NAMED_STARS.find((s) => s.id === id)?.name ?? id

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 2, 'imagineScene')
  const [, setLive] = useLive<HrLive>()
  const tapped = Array.isArray(answers.tapped) ? (answers.tapped as string[]) : []
  const done = tapped.length >= 3

  useEffect(() => setReady(scene === 0 || done), [scene, done, setReady])
  useEffect(() => {
    if (done && tapped.length === 3) haptic([10, 40, 10])
  }, [done, tapped.length])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/2. Céu com estrelas famosas. Tocou: ${tapped.map(starName).join(', ') || 'nenhuma'}.`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            Imagine organizar <strong>todas as estrelas do céu</strong>. O que elas têm de diferente?
          </>
        ) : !done ? (
          <>
            Toque em <strong>3 estrelas</strong> e compare as fichas. O tamanho de cada ponto mostra quanta luz ela emite de verdade.
          </>
        ) : (
          <>
            Cor (temperatura) e brilho (luminosidade) <strong>nem sempre andam juntos</strong>. Como pôr ordem nisso?
          </>
        )
      }
      nudge={scene === 1 && !done ? 'Compare um ponto grande e avermelhado com um pequeno e azulado. Toque bem em cima deles.' : undefined}
      controls={
        scene === 1 ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" aria-label={`${Math.min(tapped.length, 3)} de 3 estrelas`}>
              {[0, 1, 2].map((i) => (
                <Dot key={i} done={i < tapped.length} />
              ))}
            </span>
            <span className="text-sm text-white/55">{Math.min(tapped.length, 3)} de 3</span>
            {!done && (
              <ShowMe
                onClick={() => {
                  const show = ['betelgeuse', 'sirius-b', 'sol']
                  setAnswer('tapped', Array.from(new Set([...tapped, ...show])))
                  setLive({ selected: 'betelgeuse' })
                }}
              />
            )}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['Nuvem sem padrão', 'Linha reta perfeita', 'Faixas e grupos', 'Todas no mesmo lugar']
const PREDICTION_ANSWER = 2

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const [scene, setScene] = useScenes(props, 2, 'prevejaScene')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
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
            Se pusermos <strong>milhares de estrelas</strong> num gráfico de temperatura × luminosidade, o que vai aparecer?
          </>
        ) : chosen === PREDICTION_ANSWER ? (
          <>
            <strong>Isso mesmo!</strong> A física só permite certas combinações de cor e brilho: as estrelas se juntam em <strong>faixas e grupos</strong>.
          </>
        ) : (
          <>
            Ótimo erro para aprender! A física só permite certas combinações de cor e brilho, então aparecem <strong>faixas e grupos</strong>. Vamos ver.
          </>
        )
      }
      narration={scene === 0 ? 'Se pusermos milhares de estrelas num gráfico de temperatura por luminosidade, o que vai aparecer?' : undefined}
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
                <span className="block text-[14px] leading-tight">{p}</span>
              </Choice>
            ))}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 3. Observe

export function Observe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 3, 'observeScene')
  const [live] = useLive<HrLive>()
  const organized = Boolean(answers.organized)
  const sunFound = Boolean(answers.sunFound)
  const [flown, setFlown] = useState(organized)
  const simulated = live.gaiaSource === 'simulado'
  const count = live.gaiaCount ?? 0

  useEffect(() => {
    if (!organized || flown) return
    const t = setTimeout(() => setFlown(true), 1700)
    return () => clearTimeout(t)
  }, [organized, flown])
  useEffect(() => {
    if (sunFound) haptic([12, 50, 12])
  }, [sunFound])
  useEffect(() => setReady(scene === 0 ? flown : scene === 1 ? count > 0 : sunFound), [scene, flown, count, sunFound, setReady])

  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state:
      scene === 0
        ? organized
          ? 'As estrelas famosas já estão no diagrama H-R.'
          : 'Céu com estrelas; o aluno ainda não tocou em Organizar.'
        : scene === 1
          ? `${count} estrelas ${simulated ? 'simuladas' : 'do Gaia DR3'} caindo no diagrama.`
          : sunFound
            ? 'O aluno achou o Sol na sequência principal.'
            : 'Regiões rotuladas; o aluno procura o Sol (5772 K, 1 L☉).',
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={
        scene === 0 ? (
          organized ? (
            <>
              Cada estrela pousou no seu lugar. Por tradição, a <strong>temperatura cresce para a esquerda</strong>, e cada linha do eixo vale 100× mais luz.
            </>
          ) : (
            <>
              Vamos pôr cada estrela num gráfico: <strong>quente à esquerda, fria à direita</strong>; quanto mais luminosa, mais alto.
            </>
          )
        ) : scene === 1 ? (
          simulated ? (
            <>
              Agora, <strong>milhares de estrelas</strong> (simuladas: o arquivo do Gaia não respondeu). Veja os grupos surgirem.
            </>
          ) : (
            <>
              Agora, <strong>{count ? formatNumber(count, 0) : 'milhares de'} estrelas do Gaia</strong>, todas a menos de 330 anos-luz. Veja os grupos surgirem.
            </>
          )
        ) : sunFound ? (
          <>
            Achou! O Sol é uma estrela <strong>comum</strong>, no meio da sequência principal, onde fica a maioria das estrelas.
          </>
        ) : (
          <>
            Apareceram as regiões. <strong>Toque onde está o Sol</strong>: 5772 K e luminosidade 1.
          </>
        )
      }
      nudge={scene === 2 && !sunFound ? 'Ache o 1 no eixo da luminosidade e siga na horizontal até perto de 5000 K.' : undefined}
      controls={
        scene === 0 && !organized ? (
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              haptic([8, 30, 8])
              setAnswer('organized', true)
            }}
          >
            <Sparkles className="h-4 w-4" /> Organizar
          </Button>
        ) : scene === 2 && !sunFound ? (
          <div className="flex items-center">
            <span className="text-[13px] text-white/45">Toque no gráfico</span>
            <ShowMe onClick={() => setAnswer('sunFound', true)} />
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. Entenda

const RADIUS_PRESETS = [0.01, 1, 100, 1000]

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 2, 'entendaScene')
  const [live, setLive] = useLive<HrLive>()
  const R = live.radius ?? 1
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: scene === 0 ? 'Retas de raio constante (0,01, 1, 100 e 1000 R☉) sobre o diagrama.' : `Reta de raio móvel em ${fmtR(R)}.`,
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            O diagrama esconde o <strong>tamanho</strong>: L = 4πR²σT⁴. Cada linha tracejada junta estrelas de <strong>mesmo raio</strong>.
          </>
        ) : (
          <>
            Mova a linha. Fria e muito luminosa? Precisa ser <strong>enorme</strong>. Quente e fraca? <strong>Minúscula</strong>.
          </>
        )
      }
      narration={
        scene === 0
          ? 'O diagrama esconde o tamanho das estrelas. A luminosidade é quatro pi, vezes o raio ao quadrado, vezes sigma, vezes a temperatura à quarta potência. Cada linha tracejada junta estrelas de mesmo raio.'
          : undefined
      }
      controls={
        scene === 1 ? (
          <div className="space-y-3">
            <Slider label="Raio da linha" min={-3} max={3.4} step={0.01} value={Math.log10(R)} onChange={(v) => setLive({ radius: 10 ** v })} display={fmtR(R)} />
            <div className="flex flex-wrap gap-2">
              {RADIUS_PRESETS.map((p) => (
                <Chip key={p} active={Math.abs(Math.log10(R / p)) < 0.03} onClick={() => setLive({ radius: p })}>
                  {formatNumber(p, 2)} R☉
                </Chip>
              ))}
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
  const [scene, setScene] = useScenes(props, 3, 'mecaScene')
  const [live, setLive] = useLive<HrLive>()
  const { ask } = useVega()
  const R = live.measureR ?? 10
  const err = Math.abs(R - BETELGEUSE_R) / BETELGEUSE_R
  const fitted = err < 0.1
  const locked = typeof answers.betelR === 'number'
  const measured = locked ? (answers.betelR as number) : R
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (!fitted || locked || scene !== 0) return
    setAnswer('betelR', R)
    setCelebrate(true)
    haptic([14, 60, 20])
    const a = setTimeout(() => setCelebrate(false), 1200)
    const b = setTimeout(() => setScene(1), 1400)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [fitted, locked, scene, R, setAnswer, setScene])
  useEffect(() => setReady(locked), [locked, setReady])

  const status = err < 0.1 ? 'Encaixou!' : err < 0.3 ? 'Quase lá' : err < 0.7 ? 'Chegando perto' : R < BETELGEUSE_R ? 'Linha abaixo da estrela' : 'Linha acima da estrela'
  const meter = Math.max(0, 1 - Math.abs(Math.log10(R / BETELGEUSE_R)) / 2)
  const au = measured * R_SUN_IN_AU

  useVegaScreen({
    lab: lab.slug,
    step: 'meca',
    state:
      scene === 0
        ? `Reta de raio em ${fmtR(R)}; Betelgeuse destacada. Situação: ${status}.`
        : scene === 1
          ? `Mediu ${fmtR(measured)} ≈ ${formatNumber(au, 1)} UA; Betelgeuse no lugar do Sol com as órbitas.`
          : 'Contraste: Sirius B, 0,0084 R☉, do tamanho da Terra.',
  })

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene}
      caption={
        scene === 0 ? (
          <>
            Betelgeuse está destacada. Mova a linha de raio até ela <strong>passar pela estrela</strong>.
          </>
        ) : scene === 1 ? (
          <>
            Betelgeuse tem cerca de <strong>{fmtR(measured)} ≈ {formatNumber(au, 1)} UA</strong>. No lugar do Sol, engoliria Mercúrio, Vênus, Terra e Marte.
          </>
        ) : (
          <>
            No outro extremo, <strong>Sirius B</strong>: 25 mil K, mas só 0,0084 R☉. Uma estrela <strong>do tamanho da Terra</strong>.
          </>
        )
      }
      narration={
        scene === 1
          ? `Betelgeuse tem cerca de ${Math.round(measured / 10) * 10} raios solares, ou ${formatNumber(au, 1)} unidades astronômicas. No lugar do Sol, engoliria Mercúrio, Vênus, Terra e Marte.`
          : scene === 2
            ? 'No outro extremo, Sirius B: 25 mil kelvin, mas só 0,0084 raio solar. Uma estrela do tamanho da Terra.'
            : undefined
      }
      nudge={scene === 0 && !locked ? 'Olhe se a linha passa acima ou abaixo de Betelgeuse e mova para o outro lado.' : undefined}
      controls={
        scene === 0 ? (
          <div className="space-y-2.5">
            <Slider
              label="Raio da linha"
              min={0}
              max={3.4}
              step={0.005}
              value={Math.log10(R)}
              onChange={(v) => setLive({ measureR: 10 ** v })}
              display={fmtR(R)}
            />
            <div className="relative">
              {celebrate && <Burst />}
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-white/55">Encaixe</span>
                <motion.span key={status} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy} className={cn('font-medium', fitted ? 'text-emerald-300' : 'text-white/80')}>
                  {status}
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', fitted ? 'bg-emerald-300' : 'bg-gradient-to-r from-sky-300 to-sky-200')} animate={{ width: `${meter * 100}%` }} transition={spring.snappy} />
              </div>
            </div>
            {!fitted && (
              <div className="flex items-center">
                <button onClick={() => ask('Como sei se a linha de raio passa por Betelgeuse?')} className="inline-flex items-center gap-1.5 text-[13px] text-violet-200/80 hover:text-violet-100">
                  <Sparkles className="h-3.5 w-3.5" /> Dica da Vega
                </button>
                <ShowMe onClick={() => setLive({ measureR: BETELGEUSE_R })} />
              </div>
            )}
          </div>
        ) : scene === 1 ? (
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Raio medido" value={fmtR(measured)} accent />
            <Readout label="Em UA" value={`${formatNumber(au, 1)} UA`} />
          </div>
        ) : null
      }
    />
  )
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className={cn('mt-0.5 text-[17px] font-medium tabular-nums', accent ? 'text-sky-200' : 'text-white')}>{value}</p>
    </div>
  )
}

// ------------------------------------------------------------ 6. E se…?

const CHALLENGES = [
  {
    id: 'sol',
    q: 'Daqui a ~5 bilhões de anos o Sol esgota o hidrogênio do núcleo. Para onde ele vai no diagrama?',
    options: ['Fica parado', 'Sobe e à direita', 'Desce e à esquerda', 'Some'],
    answer: 1,
    explain: 'O núcleo encolhe e esquenta; as camadas de fora incham e esfriam: vira gigante vermelha. Veja o caminho todo.',
  },
  {
    id: 'ms',
    q: 'Por que a sequência principal tem tantas estrelas?',
    options: ['~90 % da vida ali', 'São mais brilhantes', 'O Gaia só vê essas', 'Por acaso'],
    answer: 0,
    explain: 'As estrelas passam ~90 % da vida queimando hidrogênio ali. Numa foto do céu, a maioria está nessa fase.',
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
            <strong>{picked === c.answer ? 'Exato.' : 'Ótimo erro para aprender!'}</strong> {c.explain}
          </>
        )
      }
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
                <span className="block text-[14px] leading-tight">{o}</span>
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
  const [live] = useLive<HrLive>()
  const R = typeof answers.betelR === 'number' ? (answers.betelR as number) : BETELGEUSE_R
  const plotted = (live.gaiaCount ?? 0) + NAMED_STARS.length
  const simulated = live.gaiaSource === 'simulado'
  useEffect(() => {
    setReady(true)
    haptic([10, 40, 10, 40, 20])
  }, [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `O aluno mediu Betelgeuse com ${fmtR(R)} e plotou ${plotted} estrelas${simulated ? ' (simuladas)' : ''}.` })

  return (
    <StepFrame
      lab={lab}
      stepIndex={6}
      caption={
        <>
          <span className="mb-1 flex items-center gap-2">
            <Medal accent={lab.accent} />
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.3 }} className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
              Conquista desbloqueada
            </motion.span>
          </span>
          <span className="block text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white lg:text-[32px]">{lab.achievement?.title}</span>
          <span className="mt-1 block text-[15px] text-white/60">Próximo passo: veja Betelgeuse no Céu ou descubra por que as estrelas têm cores.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Próximo passo: veja Betelgeuse no Céu ou descubra por que as estrelas têm cores.`}
      controls={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Betelgeuse" value={fmtR(R)} />
            <Summary label={simulated ? 'Estrelas (sim.)' : 'Estrelas'} value={formatNumber(plotted, 0)} />
            <Summary label="O Sol" value="Seq. principal" />
          </div>
          <div className="flex items-center gap-3">
            {onExplore && (
              <Button variant="secondary" onClick={onExplore}>
                Ver Betelgeuse no Céu
              </Button>
            )}
            <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-white/30">Hertzsprung (1911); Russell (1913); Gaia Collaboration (2023), A&A 674, A1. Valores aproximados.</p>
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
      <p className="mt-0.5 truncate font-mono text-[14px] text-white">{value}</p>
    </motion.div>
  )
}

function Medal({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden>
      <motion.circle cx="20" cy="20" r="17" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
      <motion.circle cx="20" cy="20" r="7" fill="#ffd27a" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.4 }} style={{ originX: '20px', originY: '20px' }} />
    </svg>
  )
}

export const HR_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  observe: Observe,
  entenda: Entenda,
  meca: Meca,
  'e-se': ESe,
  conclua: Conclua,
}
