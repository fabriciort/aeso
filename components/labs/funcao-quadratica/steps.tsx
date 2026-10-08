'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { fmt } from '@/lib/math/view'
import { FREE_THROW_DX, G_EARTH, G_MOON, landing, minSpeedAngle, rad, RELEASE_HEIGHT, RIM_HEIGHT, roots, speedThrough, vertex, trajectory } from '@/lib/math/quadratic'
import { Tex } from '@/components/math/Tex'
import { Burst } from '@/components/instruments/DragSurface'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  AIM_DEFAULT,
  baseShot,
  currentStepIndex,
  DEG_MAX,
  DEG_MIN,
  launchOf,
  MOON_ANSWER,
  MOON_OPTIONS,
  PERFECT_AIM,
  PROBLEMS,
  RANGE_ANSWER,
  RANGE_OPTIONS,
  readShot,
  readSolve,
  roundedQuad,
  snapC,
  stepSolved,
  V_MAX,
  V_MIN,
  type Problem,
  type QuadLive,
} from './shared'

// "O arremesso perfeito". The Palco is continuous (Stage.tsx); these Etapas
// tell the story, hold the controls and talk to the Palco through live values
// and answers.

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] transition-all active:scale-95',
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

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto shrink-0 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
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

/** Text with `$tex|fala$` segments and `{h}` (the problem's function). */
function Rich({ text, prob }: { text: string; prob?: Problem }) {
  const parts = text.split(/(\$[^$]+\$|\{h\})/g)
  return (
    <>
      {parts.map((s, i) => {
        if (s === '{h}' && prob)
          return (
            <Tex key={i} say={prob.say}>
              {prob.tex}
            </Tex>
          )
        if (s.startsWith('$') && s.endsWith('$')) {
          const [tex, say] = s.slice(1, -1).split('|')
          return (
            <Tex key={i} say={say}>
              {tex}
            </Tex>
          )
        }
        return <span key={i}>{s}</span>
      })}
    </>
  )
}

/** The same text as the Vega says it. */
function spoken(text: string, prob?: Problem): string {
  return text
    .replace(/\{h\}/g, prob?.say ?? '')
    .replace(/\$([^$|]+)\|([^$]+)\$/g, '$2')
    .replace(/\$([^$]+)\$/g, (_, t: string) => t.replace(/-/g, ' menos ').replace(/=/g, ' igual a '))
}

const deg = (d: number) => `${formatNumber(d, 0)}°`
const ms = (v: number) => `${formatNumber(v, 1)} m/s`

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, answers } = props
  const [scene] = useScenes(props, 3, 'imagineScene')
  const [live, setLive] = useLive<QuadLive>()
  const [which, setWhich] = useState<'deg' | 'v'>('deg')
  const aim = live.aim ?? AIM_DEFAULT
  const shots = typeof answers.shots === 'number' ? answers.shots : 0
  const last = readShot(answers.lastShot)
  const good = readShot(answers.goodShot)
  const flying = Boolean(live.flying)

  useEffect(() => setReady(scene === 0 || (scene === 1 ? shots > 0 : Boolean(good))), [scene, shots, good, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/3. Mira: ${deg(aim.deg)}, ${ms(aim.v)}. ${shots} lance(s).${last ? ` Último: ${last.kind}${Number.isFinite(last.miss) ? `, ${formatNumber(last.miss * 100, 0)} cm do centro do aro` : ''}.` : ''}${good ? ' Já acertou a cesta.' : ''}`,
  })

  const fire = () => {
    if (flying) return
    setLive({ fire: (live.fire ?? 0) + 1 })
  }
  const showMe = () => {
    if (flying) return
    setLive({ aim: PERFECT_AIM, fire: (live.fire ?? 0) + 1 })
  }

  const captions = [
    <>
      Você está na linha de lance livre. O aro fica a <strong>3,05 m</strong> do chão e <strong>4,225 m</strong> à sua frente (regras FIBA).
    </>,
    shots === 0 ? (
      <>
        <strong>Puxe a bola para trás e solte</strong>, como um estilingue. A direção vira o ângulo; o tamanho do puxão, a força.
      </>
    ) : (
      <>
        Viu o rastro? Cada <strong>fantasma</strong> marca onde a bola estava a cada 0,1 s. Juntos, desenham uma curva.
      </>
    ),
    good ? (
      <>
        <strong>Cesta!</strong> {deg(good.deg)} a {ms(good.v)}. Guarde esse rastro: ele vai virar matemática.
      </>
    ) : (
      <>
        Agora, <strong>acerte a cesta</strong>. Errou? Compare o rastro com o aro e ajuste o ângulo ou a força.
      </>
    ),
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene * 10 + (scene === 1 && shots > 0 ? 1 : 0) + (scene === 2 && good ? 1 : 0)}
      caption={captions[scene]}
      nudge={
        scene === 1 && shots === 0
          ? 'Toque no palco, arraste o dedo para baixo e para a esquerda, e solte.'
          : scene === 2 && !good
            ? 'Olhe onde o rastro cruza a altura do aro: antes dele, falta força; depois, sobra.'
            : undefined
      }
      controls={
        scene >= 1 ? (
          <div className="space-y-2.5">
            {which === 'deg' ? (
              <Slider label="Ângulo de saída" min={DEG_MIN} max={DEG_MAX} step={1} value={aim.deg} onChange={(d) => setLive({ aim: { ...aim, deg: d } })} display={deg(aim.deg)} />
            ) : (
              <Slider label="Força (velocidade de saída)" min={V_MIN} max={V_MAX} step={0.05} value={aim.v} onChange={(v) => setLive({ aim: { ...aim, v } })} display={ms(aim.v)} />
            )}
            <div className="flex items-center gap-2">
              <Chip active={which === 'deg'} onClick={() => setWhich('deg')}>
                Ângulo
              </Chip>
              <Chip active={which === 'v'} onClick={() => setWhich('v')}>
                Força
              </Chip>
              {scene === 2 && shots > 0 && !good && <ShowMe onClick={showMe} />}
              <Button onClick={fire} disabled={flying} className={cn('h-9 px-4', !(scene === 2 && shots > 0 && !good) && 'ml-auto')}>
                Lançar
              </Button>
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const Q1 = ['Na saída da mão', 'No topo, onde ela para um instante', 'No topo, mas sem parar', 'É igual o caminho todo']
const Q1_ANSWER = 2
const Q2 = ['Mais juntos no topo', 'Igualmente espaçados', 'Mais juntos no fim', 'Sem padrão']
const Q2_ANSWER = 1

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const p1 = typeof answers.prev1 === 'number' ? (answers.prev1 as number) : null
  const p2 = typeof answers.prev2 === 'number' ? (answers.prev2 as number) : null
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  const base = baseShot(answers)
  const vx = base.v * Math.cos(rad(base.deg))

  useEffect(() => setReady(scene === 0 ? p1 !== null : scene === 2 ? p2 !== null : true), [scene, p1, p2, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state:
      scene <= 1
        ? p1 === null
          ? 'Pergunta: onde a bola anda mais devagar? Ainda não escolheu.'
          : `Escolheu "${Q1[p1]}" (${p1 === Q1_ANSWER ? 'certo' : 'errado'}). O palco mostra as setas de velocidade.`
        : p2 === null
          ? 'Pergunta: os fantasmas ficam igualmente espaçados na horizontal? Ainda não escolheu.'
          : `Escolheu "${Q2[p2]}" (${p2 === Q2_ANSWER ? 'certo' : 'errado'}). O palco mostra as sombras no chão.`,
  })

  const choose = (key: 'prev1' | 'prev2', i: number, right: number, next: number) => {
    setAnswer(key, i)
    haptic(i === right ? [10, 40, 10] : 20)
    timer.current = setTimeout(() => setScene(next), 650)
  }

  const captions = [
    <>
      Olhe o rastro do seu arremesso. <strong>Onde a bola anda mais devagar?</strong>
    </>,
    p1 === Q1_ANSWER ? (
      <>
        <strong>Isso!</strong> No topo a seta vertical (azul) zera, mas a horizontal (branca) segue igual: a bola nunca para.
      </>
    ) : p1 === 1 ? (
      <>
        <strong>Ótimo erro para aprender!</strong> No topo só a seta vertical (azul) zera. A horizontal continua: ela não para.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> É no topo: a seta azul (vertical) zera. A branca nunca muda, então ela não para.
      </>
    ),
    <>
      Agora, só na <strong>horizontal</strong>: como ficam os fantasmas, um a cada 0,1 s?
    </>,
    p2 === Q2_ANSWER ? (
      <>
        <strong>Exato.</strong> A sombra anda {formatNumber(vx * 0.1, 2)} m a cada 0,1 s. Só a altura muda de ritmo, e isso desenha a parábola.
      </>
    ) : (
      <>
        <strong>Ótimo erro!</strong> No caminho eles se juntam no topo, mas a sombra no chão anda sempre igual. Só a altura muda de ritmo.
      </>
    ),
  ]

  const grid = (opts: string[], chosen: number | null, right: number, key: 'prev1' | 'prev2', next: number) => (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((o, i) => (
        <Choice
          key={o}
          selected={chosen === i}
          state={chosen === null ? null : i === right ? 'correct' : chosen === i ? 'wrong' : null}
          disabled={chosen !== null}
          onClick={() => choose(key, i, right, next)}
        >
          <span className="block text-[14px] leading-snug">{o}</span>
        </Choice>
      ))}
    </div>
  )

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 0 ? `Onde a bola anda mais devagar? ${Q1.join('; ')}.` : scene === 2 ? `Na horizontal, como ficam os fantasmas? ${Q2.join('; ')}.` : undefined}
      controls={
        scene === 0 ? (
          grid(Q1, p1, Q1_ANSWER, 'prev1', 1)
        ) : scene === 2 ? (
          grid(Q2, p2, Q2_ANSWER, 'prev2', 3)
        ) : scene === 1 && p1 !== null ? (
          <button onClick={() => (setAnswer('prev1', undefined), setScene(0))} className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70">
            <RotateCcw className="h-3.5 w-3.5" /> Responder de novo
          </button>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady, answers } = props
  const [scene] = useScenes(props, 5, 'entendaScene')
  const [live, setLive] = useLive<QuadLive>()
  const start = roundedQuad(answers)
  const q = live.q ?? start
  const coef = live.coef === 'b' || live.coef === 'c' ? live.coef : 'b'
  useEffect(() => {
    if (!live.q) setLive({ q: roundedQuad(answers) })
  }, [live.q, setLive, answers])

  const n = roots(q).length
  const up = useTask(q.a > 0.02, 'qUp', props)
  const closed = useTask(Math.abs(q.a) >= 1, 'qClosed', props)
  const movedB = useTask(Math.abs(q.b - start.b) > 0.25, 'qMovedB', props)
  const movedC = useTask(Math.abs(q.c - start.c) > 0.25, 'qMovedC', props)
  const one = useTask(n === 1 && Math.abs(q.a) > 0.02, 'qOne', props)
  const none = useTask(n === 0, 'qNone', props)
  const done = scene === 1 ? up && closed : scene === 2 ? movedB && movedC : scene === 3 ? one && none : true
  useEffect(() => setReady(done), [done, setReady])

  const v = Math.abs(q.a) > 0.02 ? vertex(q) : null
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: `Cena ${scene + 1}/5. Parábola y = ${fmt(q.a)}x² + ${fmt(q.b)}x + ${fmt(q.c)}${v ? `, vértice (${fmt(v.x)}; ${fmt(v.y)})` : ' (a = 0: é uma reta)'}, Δ = ${fmt(q.b * q.b - 4 * q.a * q.c)}, ${n} raiz(es).`,
  })

  const setQ = (patch: Partial<typeof q>) => setLive({ q: { ...q, ...patch } })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  // "Me mostre": the Palco does each task, one after the other.
  const showMe = () => {
    if (timer.current) clearTimeout(timer.current)
    if (scene === 1) {
      setQ({ a: 0.5 })
      timer.current = setTimeout(() => setLive({ q: { ...q, a: 1.2 } }), 900)
    } else if (scene === 2) {
      setLive({ coef: 'b', q: { ...q, b: Math.round((start.b - 1.5) * 10) / 10 } })
      timer.current = setTimeout(() => setLive({ coef: 'c', q: { ...q, b: Math.round((start.b - 1.5) * 10) / 10, c: Math.round((start.c + 1) * 10) / 10 } }), 900)
    } else if (scene === 3 && Math.abs(q.a) > 0.02) {
      setLive({ q: snapC(q, (q.b * q.b) / (4 * q.a)) })
      timer.current = setTimeout(() => setLive({ q: { ...q, c: (q.b * q.b) / (4 * q.a) + (q.a < 0 ? -1 : 1) } }), 1100)
    }
  }
  const r = (x: number, s: number) => Math.round(x / s) * s

  const captions = [
    <>
      Apague a quadra: sobra a curva. Ela é o gráfico de uma <strong>função quadrática</strong>, <Tex say="y igual a a x ao quadrado mais b x mais c">{'y = ax^2 + bx + c'}</Tex>.
    </>,
    Math.abs(q.a) <= 0.02 ? (
      <>
        <strong>a = 0: não é mais parábola, virou reta!</strong> O <Tex>{'x^2'}</Tex> sumiu. Continue arrastando.
      </>
    ) : (
      <>
        O <strong>a</strong> abre, fecha e vira a boca. Deixe a boca <strong>para cima</strong> e depois <strong>bem fechada</strong>.
      </>
    ),
    <>
      O <strong>c</strong> é onde a curva corta o eixo y (a altura da mão!). O <strong>b</strong> leva o vértice pela curva azul. Arraste os dois pontos.
    </>,
    <>
      O <strong>Δ</strong> conta quantas vezes a parábola toca o chão: 2, 1 ou 0. Suba e desça: faça tocar <strong>uma vez só</strong> e <strong>nenhuma</strong>.
    </>,
    <>
      Toda parábola é <Tex>{'y = x^2'}</Tex> esticada por <strong>a</strong> e levada até o <strong>vértice</strong>: a forma canônica. Arraste o vértice.
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
          ? 'Apague a quadra: sobra a curva. Ela é o gráfico de uma função quadrática: y igual a a x ao quadrado, mais b x, mais c.'
          : scene === 3
            ? 'O delta conta quantas vezes a parábola toca o chão: 2, 1 ou nenhuma. Suba e desça a curva: faça tocar uma vez só, e depois nenhuma.'
            : scene === 4
              ? 'Toda parábola é y igual a x ao quadrado, esticada por a e levada até o vértice: a forma canônica. Arraste o vértice.'
              : undefined
      }
      nudge={
        !done
          ? scene === 1
            ? 'Arraste para cima no palco e veja o sinal do a.'
            : scene === 2
              ? 'Os pontos com anel no palco podem ser arrastados.'
              : 'Observe o vértice: ele está acima ou abaixo do chão?'
          : undefined
      }
      controls={
        scene === 1 ? (
          <div className="space-y-2.5">
            <Slider label="a" min={-2} max={2} step={0.05} value={q.a} onChange={(a) => setQ({ a: r(a, 0.05) })} display={fmt(q.a)} />
            <div className="flex items-center gap-3">
              <Dot done={up} label="boca para cima" />
              <Dot done={closed} label="bem fechada" />
              {!done && <ShowMe onClick={showMe} />}
            </div>
          </div>
        ) : scene === 2 ? (
          <div className="space-y-2.5">
            {coef === 'b' ? (
              <Slider label="b (move o vértice)" min={-6} max={6} step={0.1} value={q.b} onChange={(b) => setQ({ b: r(b, 0.1) })} display={fmt(q.b, 1)} />
            ) : (
              <Slider label="c (sobe e desce)" min={-3} max={5} step={0.1} value={q.c} onChange={(c) => setQ({ c: r(c, 0.1) })} display={fmt(q.c, 1)} />
            )}
            <div className="flex items-center gap-2">
              <Chip active={coef === 'b'} onClick={() => setLive({ coef: 'b' })}>
                b
              </Chip>
              <Chip active={coef === 'c'} onClick={() => setLive({ coef: 'c' })}>
                c
              </Chip>
              <span className="ml-auto flex items-center gap-3">
                <Dot done={movedB} label="b" />
                <Dot done={movedC} label="c" />
                {!done && <ShowMe onClick={showMe} />}
              </span>
            </div>
          </div>
        ) : scene === 3 ? (
          <div className="space-y-2.5">
            <Slider label="c (sobe e desce)" min={-3} max={5} step={0.01} value={q.c} onChange={(c) => setLive({ q: snapC(q, c) })} display={fmt(q.c, 2)} />
            <div className="flex items-center gap-3">
              <Dot done={one} label="toca 1 vez" />
              <Dot done={none} label="não toca" />
              {!done && <ShowMe onClick={showMe} />}
            </div>
          </div>
        ) : scene === 4 ? (
          <Button variant="secondary" onClick={() => setLive({ replay: (live.replay ?? 0) + 1 })}>
            <RotateCcw className="h-4 w-4" /> Ver de novo
          </Button>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

const DY = RIM_HEIGHT - RELEASE_HEIGHT
const BEST_FT = (minSpeedAngle(FREE_THROW_DX, DY) * 180) / Math.PI

export function Observe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'observeScene')
  const [live, setLive] = useLive<QuadLive>()
  const ftDeg = live.ftDeg ?? 40
  const v = speedThrough(rad(ftDeg), FREE_THROW_DX, DY, G_EARTH)
  const found = Boolean(answers.ftFound)
  const [burst, setBurst] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => {
    if (live.ftDeg === undefined) setLive({ ftDeg: 40 })
  }, [live.ftDeg, setLive])

  useEffect(() => {
    if (scene === 1 && !found && Math.abs(ftDeg - BEST_FT) < 1) {
      setAnswer('ftFound', true)
      haptic([14, 60, 20])
      setBurst(true)
      timer.current = setTimeout(() => {
        setBurst(false)
        setScene(2)
      }, 1100)
    }
  }, [scene, found, ftDeg, setAnswer, setScene])
  useEffect(() => setReady(scene !== 1 || found), [scene, found, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'observe',
    state:
      scene === 1
        ? `Ângulo ${formatNumber(ftDeg, 0)}°, velocidade necessária ${formatNumber(v, 2)} m/s. ${found ? 'Achou o mínimo.' : 'Procurando o ângulo de menor velocidade.'}`
        : scene === 3
          ? 'Jato de água de um bebedouro: cada gota é uma bolinha lançada.'
          : 'Lance livre com medidas FIBA reais.',
  })

  const best = trajectory({ v: speedThrough(rad(BEST_FT), FREE_THROW_DX, DY, G_EARTH), theta: rad(BEST_FT), h0: RELEASE_HEIGHT, g: G_EARTH })

  const captions = [
    <>
      Lance livre de verdade: aro a <strong>3,05 m</strong> e <strong>4,225 m</strong> à frente (FIBA). A mão solta a ≈ 2,1 m (exemplo imaginado).
    </>,
    <>
      Muitas parábolas ligam a mão ao aro. Mude o ângulo: <strong>qual pede o lance mais fraco</strong> (menor v)?
    </>,
    <>
      <strong>≈ {formatNumber(BEST_FT, 0)}°</strong>, o lance mais econômico: <Tex say={`a aproximadamente ${fmt(best.a)}`}>{`a \\approx ${fmt(best.a).replace('−', '-').replace(',', '{,}')}`}</Tex>. Estudos com arremessadores sugerem ≈ 52°.
    </>,
    <>
      Um bebedouro faz igual: cada gota sai como uma bolinha sem ar. O <strong>jato inteiro é uma parábola</strong>.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 2 ? `Cerca de ${formatNumber(BEST_FT, 0)} graus: o lance mais econômico. Estudos com arremessadores sugerem cerca de 52 graus.` : undefined}
      nudge={scene === 1 && !found ? 'Olhe o número v no palco enquanto muda o ângulo: ele desce e depois volta a subir.' : undefined}
      controls={
        scene === 1 ? (
          <div className="relative space-y-2.5">
            {burst && <Burst />}
            <Slider label="Ângulo de saída" min={30} max={75} step={0.5} value={ftDeg} onChange={(d) => setLive({ ftDeg: d })} display={`${formatNumber(ftDeg, 1)}° · ${formatNumber(v, 2)} m/s`} />
            <div className="flex items-center">
              <Dot done={found} label="menor velocidade" />
              {!found && <ShowMe onClick={() => setLive({ ftDeg: Math.round(BEST_FT * 2) / 2 })} />}
            </div>
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
  const log = readSolve(answers)
  const prob = PROBLEMS[scene]
  const k = currentStepIndex(log, prob)
  const complete = k >= prob.steps.length
  const step = prob.steps[Math.min(k, prob.steps.length - 1)]
  const tries = log[step.id] ?? []
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; pick: number; id: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setFeedback(null), [scene])
  useEffect(() => setReady(complete), [complete, setReady])
  const shown = Boolean(answers.shown3)
  const wrongs = tries.filter((i) => !step.options[i]?.ok)

  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: `Problema ${scene + 1}/3 (${prob.say}). ${complete ? 'Resolvido.' : `Passo ${k + 1} de ${prob.steps.length}: ${spoken(step.ask, prob)}`}${feedback && !feedback.ok ? ` Errou escolhendo "${step.options[feedback.pick].label}".` : ''}`,
  })

  const pick = (i: number) => {
    const o = step.options[i]
    setAnswer('solve', { ...log, [step.id]: [...tries, i] })
    if (o.ok) {
      haptic([10, 40, 10])
      setFeedback({ ok: true, text: o.why, pick: i, id: step.id })
      timer.current = setTimeout(() => setFeedback(null), 1300)
    } else {
      haptic(20)
      setFeedback({ ok: false, text: o.why, pick: i, id: step.id })
    }
  }
  const showMe = () => {
    setAnswer('shown3', true)
    const right = step.options.findIndex((o) => o.ok)
    setAnswer('solve', { ...log, [step.id]: [...tries, right] })
    setFeedback(null)
  }

  const finished: Record<string, React.ReactNode> = {
    p1: (
      <>
        <strong>Topo: 7 m, em t = 1 s.</strong> Sem desenhar nada: a simetria da parábola entregou o vértice.
      </>
    ),
    p2: (
      <>
        <strong>Chão em ≈ 2,18 s.</strong> A outra raiz (≈ −0,18 s) existe na conta, mas é antes do lance: a física escolhe.
      </>
    ),
    p3: shown ? (
      <>
        Era <strong>21 m</strong>: topo em t = −20/(−10) = 2 s, e h(2) = −20 + 40 + 1 = 21. Agora a curva aparece.
      </>
    ) : (
      <>
        <strong>Sem ajuda, e certo!</strong> 21 m, em t = 2 s. A curva confirma: o topo está onde você calculou.
      </>
    ),
  }

  // Feedback of a step already logged (ok) still shows while the next one waits.
  const fb = feedback && (feedback.ok || feedback.id === step.id) ? feedback : null

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene * 10 + k + (fb ? 0.5 : 0)}
      caption={
        fb?.ok ? (
          <>
            <strong>Isso.</strong> {fb.text}
          </>
        ) : complete ? (
          finished[prob.id]
        ) : fb ? (
          <>
            <strong>Ainda não.</strong> {fb.text}
          </>
        ) : (
          <Rich text={step.ask} prob={prob} />
        )
      }
      narration={!complete && !fb ? `${spoken(step.ask, prob)} ${step.options.map((o) => o.say ?? o.label).join('; ou ')}.` : undefined}
      nudge={
        !complete && wrongs.length >= 1 && !fb?.ok
          ? scene === 0
            ? 'Olhe o palco: a escolha errada aparece lá. Onde fica o ponto mais alto da curva?'
            : 'Releia o caderno: cada linha nasce da anterior.'
          : undefined
      }
      controls={
        complete || fb?.ok ? null : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {step.options.map((o, i) => (
                <Choice
                  key={i}
                  state={fb?.pick === i ? 'wrong' : tries.includes(i) && !o.ok ? 'wrong' : null}
                  disabled={tries.includes(i) && !o.ok}
                  onClick={() => pick(i)}
                >
                  <span className="block text-center text-[15px] leading-tight">
                    {o.tex ? (
                      <Tex say={o.say ?? o.label}>{o.tex}</Tex>
                    ) : (
                      o.label
                    )}
                  </span>
                </Choice>
              ))}
            </div>
            {prob.id === 'p3' && wrongs.length > 0 && (
              <div className="flex">
                <ShowMe onClick={showMe} />
              </div>
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
  const [scene] = useScenes(props, 3, 'eseScene')
  const [live, setLive] = useLive<QuadLive>()
  const picks = (answers.ese as Record<string, number | undefined> | undefined) ?? {}
  const rangeDeg = live.rangeDeg ?? 30
  const found = Boolean(answers.rangeFound)
  const [burst, setBurst] = useState(false)
  const base = baseShot(answers)
  const moon = launchOf(base, G_MOON)
  const moonTop = vertex(trajectory(moon)).y
  const moonLand = landing(moon).x
  const R = landing({ v: 10, theta: rad(rangeDeg), h0: 0, g: G_EARTH }).x

  useEffect(() => {
    if (live.rangeDeg === undefined) setLive({ rangeDeg: 30 })
  }, [live.rangeDeg, setLive])
  useEffect(() => {
    if (scene === 2 && !found && Math.abs(rangeDeg - 45) <= 0.5) {
      setAnswer('rangeFound', true)
      haptic([14, 60, 20])
      setBurst(true)
      const t = setTimeout(() => setBurst(false), 1000)
      return () => clearTimeout(t)
    }
  }, [scene, found, rangeDeg, setAnswer])
  const id = scene === 0 ? 'moon' : 'range'
  const picked = picks[id]
  useEffect(() => setReady(scene === 2 ? found : picked !== undefined), [scene, found, picked, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state:
      scene === 0
        ? `Arremesso na Lua. ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu "${MOON_OPTIONS[picked]}" (${picked === MOON_ANSWER ? 'certo' : 'errado'}).`}`
        : scene === 1
          ? `Ângulo de maior alcance no chão plano. ${picked === undefined ? 'Ainda não respondeu.' : `Respondeu ${RANGE_OPTIONS[picked]}°.`}`
          : `Explorando: ${formatNumber(rangeDeg, 0)}° dá ${formatNumber(R, 2)} m. ${found ? 'Achou 45°.' : ''}`,
  })

  const choose = (i: number, right: number) => {
    haptic(i === right ? [10, 40, 10] : 20)
    setAnswer('ese', { ...picks, [id]: i })
  }

  const caption =
    scene === 0 ? (
      picked === undefined ? (
        <>
          O mesmo arremesso, na <strong>Lua</strong> (g = 1,62 m/s², sem ar). A parábola fica…
        </>
      ) : (
        <>
          <strong>{picked === MOON_ANSWER ? 'Exato.' : 'Ótimo erro: era “bem mais aberta”.'}</strong> Com g 6× menor, o <strong>a</strong> fica 6× menor: a bola sobe a ≈ {formatNumber(moonTop, 0)} m e cai a ≈ {formatNumber(moonLand, 0)} m.
        </>
      )
    ) : scene === 1 ? (
      picked === undefined ? (
        <>
          No chão plano, sempre com a mesma força: <strong>qual ângulo leva a bola mais longe?</strong>
        </>
      ) : (
        <>
          <strong>{picked === RANGE_ANSWER ? 'Isso: 45°.' : 'Ótimo erro: é 45°.'}</strong> E repare: 30° e 60° caem no mesmo lugar. Ângulos que somam 90° empatam.
        </>
      )
    ) : found ? (
      <>
        <strong>45°: {formatNumber(100 / G_EARTH, 1)} m</strong>, o máximo. O alcance é <Tex say="v ao quadrado vezes seno de 2 teta, sobre g">{'\\frac{v^2 \\sin 2\\theta}{g}'}</Tex>, e o seno é máximo em 2θ = 90°.
      </>
    ) : (
      <>
        Confira com as mãos: mude o ângulo e <strong>ache o alcance máximo</strong>. A curva tracejada é o ângulo gêmeo.
      </>
    )

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + (scene === 2 ? (found ? 1 : 0) : picked === undefined ? 0 : 1)}
      caption={caption}
      narration={
        scene === 0 && picked === undefined
          ? `O mesmo arremesso, na Lua, com g igual a 1 vírgula 62. A parábola fica: ${MOON_OPTIONS.join('; ')}?`
          : scene === 2 && found
            ? 'Quarenta e cinco graus: o máximo. O alcance é v ao quadrado vezes o seno de 2 teta, sobre g, e o seno é máximo quando 2 teta é 90 graus.'
            : undefined
      }
      nudge={scene === 2 && !found ? 'Veja o número no palco: ele cresce, chega num máximo e volta a cair.' : undefined}
      controls={
        scene < 2 ? (
          picked === undefined ? (
            <div className="grid grid-cols-2 gap-2">
              {(scene === 0 ? MOON_OPTIONS : RANGE_OPTIONS.map((d) => `${d}°`)).map((o, i) => (
                <Choice key={o} onClick={() => choose(i, scene === 0 ? MOON_ANSWER : RANGE_ANSWER)}>
                  <span className="block text-[14px] leading-snug">{o}</span>
                </Choice>
              ))}
            </div>
          ) : (
            <button onClick={() => setAnswer('ese', { ...picks, [id]: undefined })} className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70">
              <RotateCcw className="h-3.5 w-3.5" /> Responder de novo
            </button>
          )
        ) : (
          <div className="relative space-y-2.5">
            {burst && <Burst />}
            <Slider label="Ângulo" min={10} max={80} step={0.5} value={rangeDeg} onChange={(d) => setLive({ rangeDeg: d })} display={`${formatNumber(rangeDeg, 1)}° · ${formatNumber(R, 2)} m`} />
            <div className="flex items-center">
              <Dot done={found} label="alcance máximo" />
              {!found && <ShowMe onClick={() => setLive({ rangeDeg: 45 })} />}
            </div>
          </div>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua({ lab, setReady, answers }: StepProps) {
  const good = readShot(answers.goodShot)
  const base = baseShot(answers)
  const shots = typeof answers.shots === 'number' ? answers.shots : 0
  const log = readSolve(answers)
  const solved = PROBLEMS.filter((p) => p.steps.every((s) => stepSolved(log, s))).length
  useEffect(() => setReady(true), [setReady])
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `Cesta a ${deg(base.deg)} e ${ms(base.v)}; ${shots} lances; ${solved} de 3 problemas resolvidos.` })

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
          <span className="mt-1 block text-[15px] text-white/60">Toda bola lançada, sem ar, desenha uma parábola. O topo fica em −b/2a.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} Toda bola lançada, sem ar, desenha uma parábola. O topo fica em menos b sobre 2 a. Próximo laboratório: Dobrar, dobrar, dobrar.`}
      controls={
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <Summary label={good ? 'Sua cesta' : 'Cesta (exemplo)'} value={`${deg(base.deg)} · ${formatNumber(base.v, 1)}`} sub="ângulo · m/s" />
            <Summary label="Lances" value={formatNumber(Math.max(shots, 1), 0)} sub="até acertar e além" />
            <Summary label="Resolvidos" value={`${solved}/3`} sub="topo e chão" />
          </div>
          <p className="text-[12px] leading-snug text-white/50">
            Próximo: <span className="text-white/80">Dobrar, dobrar, dobrar</span> (em breve) ou <span className="text-white/80">A roda que vira onda</span>.
          </p>
          <p className="text-[10.5px] leading-snug text-white/30">FIBA Official Basketball Rules (2024); NASA Moon Fact Sheet (g = 1,62 m/s²); Tran & Silverberg (2008), J. Sports Sci. 26(11).</p>
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

export const QUADRATICA_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
