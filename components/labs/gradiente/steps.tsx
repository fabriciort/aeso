'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { descend, norm, type Vec2 } from '@/lib/math/surface'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Tex } from '@/components/math/Tex'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  BOWL,
  DESCENT_BOUND,
  DESCENT_START,
  FALSE_SUMMIT,
  HIKER_START,
  isRidgePoint,
  MOUNTAIN,
  P3_ANSWER,
  PROBLEMS,
  RIDGE_POINT,
  RIO,
  RIO_MAX_SLOPE,
  RIO_STEEPEST,
  STEEP_OK,
  SUMMIT,
  SUMMIT_H,
  SUMMIT_TOL,
  TRAIL_A,
  TRAIL_B,
  TRAIL_POINT,
  trailLength,
  toKm,
  type GradLive,
} from './data'

// "Subindo a montanha". The Palco is continuous (Stage.tsx); these Etapas
// tell the story and hold the controls.

const m = (km: number) => `${fmt(toKm(km), 0)} m`
const deg = (rad: number) => (rad * 180) / Math.PI
/** How the voice reads the symbols of this lab. */
const spoken = (s: string) =>
  s
    .replace(/∂f\/∂x/g, 'derivada parcial de f em x')
    .replace(/∂f\/∂y/g, 'derivada parcial de f em y')
    .replace(/−∇f/g, 'menos gradiente de f')
    .replace(/\|∇f\|/g, 'o módulo do gradiente')
    .replace(/∇f/g, 'gradiente de f')
    .replace(/η/g, 'eta')

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

function ShowMe({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="ml-auto h-9 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
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

function useHiker() {
  const [live, setLive] = useLive<GradLive>()
  const hx = live.hx ?? HIKER_START[0]
  const hy = live.hy ?? HIKER_START[1]
  return { live, setLive, hx, hy, h: MOUNTAIN.field.f(hx, hy), g: MOUNTAIN.field.grad(hx, hy) }
}

function Predict({ options, chosen, answer, onPick }: { options: string[]; chosen: number | null; answer: number; onPick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o, i) => (
        <Choice
          key={o}
          selected={chosen === i}
          state={chosen === null ? null : i === answer ? 'correct' : chosen === i ? 'wrong' : null}
          disabled={chosen !== null}
          onClick={() => onPick(i)}
        >
          <span className="block text-[14px] leading-snug">{o}</span>
        </Choice>
      ))}
    </div>
  )
}

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 3, 'imagineScene')
  const { live, setLive, hx, hy, h } = useHiker()
  const best = Math.max(live.best ?? 0, h)
  const found = typeof answers.summit === 'number'
  const onFalse = Math.hypot(hx - FALSE_SUMMIT[0], hy - FALSE_SUMMIT[1]) < 0.45

  useEffect(() => {
    if (h > (live.best ?? 0) + 0.002) setLive({ best: h })
  }, [h, live.best, setLive])
  useEffect(() => {
    if (scene === 1 && !found && h >= SUMMIT_H - SUMMIT_TOL) {
      setAnswer('summit', h)
      haptic([14, 60, 20])
      const t = setTimeout(() => setScene(2), 1300)
      return () => clearTimeout(t)
    }
  }, [scene, found, h, setAnswer, setScene])
  useEffect(() => setReady(scene !== 1 || found), [scene, found, setReady])
  useVegaScreen({ lab: lab.slug, step: 'imagine', state: `Cena ${scene + 1}/3. Trilheiro em x = ${fmt(hx)} km, y = ${fmt(hy)} km, altura ${m(h)}; recorde ${m(best)}. ${found ? 'Achou o cume.' : 'Ainda não achou o cume.'}` })

  const captions = [
    <>
      Imagine uma montanha que só existe aqui. Cada ponto do chão tem uma altura: a montanha é uma função <Tex say="f de x e y">{'f(x,\\,y)'}</Tex>.
    </>,
    <>
      Você é o <strong>ponto dourado</strong>. Arraste-o pelo terreno (ou gire a montanha pelo fundo) e <strong>ache o cume</strong>.
    </>,
    <>
      <strong>Cume: {m(typeof answers.summit === 'number' ? (answers.summit as number) : SUMMIT_H)}!</strong> Repare: lá em cima o chão fica plano em todas as direções. Guarde essa ideia.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={
        <>
          {captions[scene]}
          {scene === 1 && found && <Burst color={lab.accent} />}
        </>
      }
      nudge={
        scene === 1 && !found
          ? onFalse
            ? 'Aqui parece o topo, mas olhe em volta: existe algum lugar ainda mais alto?'
            : 'Arraste o ponto devagar e observe a altura: vá sempre para o lado em que ela cresce.'
          : undefined
      }
      controls={
        scene === 1 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Slider label="Leste (x)" min={-2.9} max={2.9} step={0.01} value={hx} onChange={(v) => setLive({ hx: v })} display={`${fmt(hx, 1)} km`} />
              <Slider label="Norte (y)" min={-2.9} max={2.9} step={0.01} value={hy} onChange={(v) => setLive({ hy: v })} display={`${fmt(hy, 1)} km`} />
            </div>
            <div className="flex items-center">
              <Dot done={found} label="Cume" />
              {!found && <ShowMe onClick={() => setLive({ hx: SUMMIT[0], hy: SUMMIT[1] })} />}
            </div>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICTION = ['A, onde as curvas se apertam', 'B, onde as curvas se afastam', 'Iguais: as duas sobem 300 m', 'Não dá para saber pelo mapa']
const PREDICTION_ANSWER = 0

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 5, 'prevejaScene')
  const chosen = typeof answers.prediction === 'number' ? (answers.prediction as number) : null
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(scene !== 2 || chosen !== null), [scene, chosen, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: `Cena ${scene + 1}/5. ${scene === 0 ? 'Anéis de mesma altura sobre a montanha.' : 'Mapa de curvas de nível (a cada 100 m).'} ${chosen === null ? 'Ainda não escolheu.' : `Escolheu "${PREDICTION[chosen]}" (${chosen === PREDICTION_ANSWER ? 'certo' : 'errado'}).`}`,
  })
  const choose = (i: number) => {
    setAnswer('prediction', i)
    haptic(i === PREDICTION_ANSWER ? [10, 40, 10] : 20)
    timer.current = setTimeout(() => setScene(3), 650)
  }
  const a = fmt(trailLength(TRAIL_A), 2)
  const b = fmt(trailLength(TRAIL_B), 1)

  const captions = [
    <>
      Agora fatie a montanha na horizontal, <strong>a cada 100 m</strong>. Cada corte deixa um anel: uma <strong>curva de nível</strong>.
    </>,
    <>Suba e olhe de cima: os anéis caem no chão e viram um mapa. Cada curva liga pontos da mesma altura.</>,
    <>
      Duas trilhas, <strong>A</strong> e <strong>B</strong>, sobem de 300 m a 600 m. Em qual delas a subida é <strong>mais íngreme</strong>?
    </>,
    chosen === PREDICTION_ANSWER ? (
      <>
        <strong>Isso!</strong> A sobe 300 m em {a} km; B precisa de {b} km. Curvas juntas: pouco chão para subir a mesma altura.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> As duas sobem 300 m, mas A faz isso em {a} km e B em {b} km. Curvas juntas = íngreme.
      </>
    ),
    <>
      Pegadinha clássica: curvas juntas <strong>não</strong> querem dizer lugar alto. No cume elas se afastam: lá é quase plano.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={captions[scene]}
      narration={scene === 2 ? `Duas trilhas, A e B, sobem de 300 a 600 metros. Em qual delas a subida é mais íngreme? ${PREDICTION.join('; ')}.` : undefined}
      controls={scene === 2 ? <Predict options={PREDICTION} chosen={chosen} answer={PREDICTION_ANSWER} onPick={choose} /> : null}
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene] = useScenes(props, 5, 'entendaScene')
  const { live, setLive, hx, hy, h, g } = useHiker()
  const ridge = useTask(scene === 1 && isRidgePoint([hx, hy]), 'ridge', props)

  // Coming from the summit (where every slice is flat), start on a slope.
  useEffect(() => {
    if (live.hx === undefined || Math.hypot(hx - SUMMIT[0], hy - SUMMIT[1]) < 0.4) setLive({ hx: 1.45, hy: 1.1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => setReady(scene !== 1 || ridge), [scene, ridge, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state: `Cena ${scene + 1}/5. Ponto (${fmt(hx)}; ${fmt(hy)}) km, altura ${m(h)}, ∂f/∂x = ${fmt(g[0])}, ∂f/∂y = ${fmt(g[1])}, |∇f| = ${fmt(norm(g))}. ${scene === 1 ? (ridge ? 'Achou ∂f/∂x = 0 fora do cume.' : 'Procurando ∂f/∂x = 0 fora do cume.') : ''}`,
  })

  const dfdx = <Tex say="derivada parcial de f em x">{'\\partial f/\\partial x'}</Tex>
  const dfdy = <Tex say="derivada parcial de f em y">{'\\partial f/\\partial y'}</Tex>
  const captions = [
    <>
      Corte a montanha com um plano vertical, de oeste para leste. A borda do corte é uma curva comum, de <strong>uma variável só</strong>.
    </>,
    <>
      A inclinação dessa curva no seu ponto é {dfdx}. Ache um lugar onde ela vale <strong>0</strong> sem estar no cume.
    </>,
    <>
      Gire o corte para norte–sul: a inclinação dessa nova fatia é {dfdy}. No mesmo ponto, as duas são diferentes.
    </>,
    <>
      Junte as duas numa seta, o <strong>gradiente</strong>: <Tex say="gradiente de f igual a, derivada parcial em x, derivada parcial em y">{'\\nabla f = (\\partial f/\\partial x,\\ \\partial f/\\partial y)'}</Tex>. Toque no mapa e veja a seta.
    </>,
    <>
      A seta cruza a curva de nível em <strong>ângulo reto</strong> e cresce onde as curvas se apertam. No cume ela some: <Tex say="gradiente igual a zero">{'\\nabla f = 0'}</Tex>.
    </>,
  ]
  const narrations = [
    undefined,
    'A inclinação dessa curva no seu ponto é a derivada parcial de f em x. Ache um lugar onde ela vale zero sem estar no cume.',
    'Gire o corte para norte-sul: a inclinação dessa nova fatia é a derivada parcial de f em y. No mesmo ponto, as duas são diferentes.',
    'Junte as duas numa seta, o gradiente: as duas derivadas parciais, uma em cada coordenada. Toque no mapa e veja a seta.',
    'A seta cruza a curva de nível em ângulo reto e cresce onde as curvas se apertam. No cume ela some: o gradiente vale zero.',
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      narration={narrations[scene]}
      nudge={scene === 1 && !ridge ? 'Vá para a encosta sul, um pouco abaixo do topo, e ande de lado: em que ponto a fatia azul faz um morrinho?' : undefined}
      controls={
        scene === 1 ? (
          <div className="space-y-2">
            <Slider label="Posição leste–oeste (x)" min={-2.9} max={2.9} step={0.005} value={hx} onChange={(v) => setLive({ hx: v })} display={`${fmt(hx, 2)} km`} />
            <div className="flex items-center">
              <Dot done={ridge} label="∂f/∂x = 0 fora do cume" />
              {!ridge && <ShowMe onClick={() => setLive({ hx: RIDGE_POINT[0], hy: RIDGE_POINT[1] })} />}
            </div>
          </div>
        ) : scene === 3 ? (
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => setLive({ hx: TRAIL_A[1][0], hy: TRAIL_A[1][1] })}>Encosta leste</Chip>
            <Chip onClick={() => setLive({ hx: TRAIL_B[1][0], hy: TRAIL_B[1][1] })}>Ombro oeste</Chip>
            <Chip onClick={() => setLive({ hx: SUMMIT[0], hy: SUMMIT[1] })}>Cume</Chip>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

const TRAIL_OPTIONS = ['Seguindo ∇f, direto para cima', 'Perpendicular a ∇f', 'Em zigue-zague, na diagonal', 'Contra ∇f']
const TRAIL_ANSWER = 2
const TRAIL_WHY = [
  'Seguindo ∇f é a subida mais íngreme possível: cansa demais. A trilha corta na diagonal, em zigue-zague (azul).',
  'Perpendicular a ∇f você anda sobre a curva de nível: dá a volta no morro sem subir. O zigue-zague (azul) sobe aos poucos.',
  'Isso! Nem direto (∇f), nem de lado (curva de nível): na diagonal, em zigue-zague, a subida fica suave.',
  'Contra ∇f você desce! A trilha sobe na diagonal, em zigue-zague (azul), entre ∇f e a curva de nível.',
]

export function MundoReal(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 4, 'mundoScene')
  const [live, setLive] = useLive<GradLive>()
  const tap = Array.isArray(answers.steepTap) ? (answers.steepTap as Vec2) : null
  const tapSlope = tap ? norm(RIO.field.grad(tap[0], tap[1])) : 0
  const steep = useTask(scene === 1 && tapSlope >= STEEP_OK * RIO_MAX_SLOPE, 'steepOk', props)
  const pick = typeof answers.trailPick === 'number' ? (answers.trailPick as number) : null
  const theta = live.trailAngle ?? 1.2
  const gT = norm(RIO.field.grad(...TRAIL_POINT))
  const grade = gT * Math.cos(theta) * 100
  const gentle = useTask(scene === 3 && grade >= 10 && grade <= 20, 'gentle', props)

  useEffect(() => setReady(scene === 0 || (scene === 1 && steep) || (scene === 2 && pick !== null) || scene === 3), [scene, steep, pick, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'mundo-real',
    state: `Cena ${scene + 1}/4. Relevo do Pão de Açúcar e da Urca (forma simplificada). ${
      scene === 1 ? (tap ? `Tocou num ponto com inclinação de ${fmt(deg(Math.atan(tapSlope)), 0)}° (máximo ${fmt(deg(Math.atan(RIO_MAX_SLOPE)), 0)}°).` : 'Ainda não tocou.') : ''
    }${scene === 2 ? (pick === null ? 'Escolhendo a direção da trilha.' : `Escolheu "${TRAIL_OPTIONS[pick]}".`) : ''}${scene === 3 ? `Direção a ${fmt(deg(Math.abs(theta)), 0)}° de ∇f, subida de ${fmt(grade, 0)} %.` : ''}`,
  })

  const captions = [
    <>
      No Rio, o <strong>Pão de Açúcar</strong> (396 m) e o <strong>Morro da Urca</strong> (≈ 220 m) saem do mar. Um bondinho liga os dois desde 1912.
    </>,
    steep ? (
      <>
        <strong>Achou!</strong> A encosta do Pão de Açúcar, onde as curvas quase se encostam: ≈ {fmt(deg(Math.atan(tapSlope)), 0)}° neste modelo.
      </>
    ) : (
      <>
        No mapa, <strong>toque no ponto mais íngreme</strong>. A seta mostra o gradiente, e a inclinação aparece em graus.
      </>
    ),
    pick === null ? (
      <>
        Você quer subir a Urca a pé, sem se cansar. A seta dourada é <Tex say="gradiente de f">{'\\nabla f'}</Tex>. Para onde vai a trilha?
      </>
    ) : (
      <>
        {pick === TRAIL_ANSWER ? '' : <strong>Ótimo erro para aprender! </strong>}
        {TRAIL_WHY[pick]}
      </>
    ),
    <>
      Arraste para girar a direção. A subida por metro é <Tex say="módulo do gradiente vezes cosseno de teta">{'|\\nabla f|\\cos\\theta'}</Tex>: máxima em 0°, zero em 90°. Ache uns 15 %.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene * 2 + (scene === 2 && pick !== null ? 1 : 0)}
      caption={captions[scene]}
      narration={
        scene === 2 && pick === null
          ? `Você quer subir a Urca a pé, sem se cansar. A seta dourada é o gradiente. Para onde vai a trilha? ${TRAIL_OPTIONS.map(spoken).join('; ')}.`
          : scene === 2 && pick !== null
            ? spoken(TRAIL_WHY[pick])
            : scene === 3
              ? 'Arraste para girar a direção. A subida por metro é o módulo do gradiente vezes o cosseno do ângulo: máxima em zero grau, zero em noventa graus. Ache uns 15 por cento.'
              : undefined
      }
      nudge={scene === 1 && !steep ? 'Procure onde as curvas de nível estão mais apertadas umas contra as outras.' : undefined}
      controls={
        scene === 1 ? (
          <div className="flex items-center gap-3">
            <Dot done={steep} label={tap ? `Você: ${fmt(deg(Math.atan(tapSlope)), 0)}°` : 'Toque no mapa'} />
            {!steep && <ShowMe onClick={() => setAnswer('steepTap', RIO_STEEPEST.p)} />}
          </div>
        ) : scene === 2 && pick === null ? (
          <div className="grid grid-cols-2 gap-2">
            {TRAIL_OPTIONS.map((o, i) => (
              <Choice
                key={o}
                onClick={() => {
                  haptic(i === TRAIL_ANSWER ? [10, 40, 10] : 20)
                  setAnswer('trailPick', i)
                }}
              >
                <span className="block text-[14px] leading-snug">{o}</span>
              </Choice>
            ))}
          </div>
        ) : scene === 3 ? (
          <div className="space-y-2">
            <Slider label="Ângulo com ∇f" min={0} max={Math.PI} step={0.01} value={Math.abs(theta)} onChange={(v) => setLive({ trailAngle: v })} display={`${fmt(deg(Math.abs(theta)), 0)}° · ${fmt(grade, 0)} %`} />
            <Dot done={gentle} label="Trilha suave (10 a 20 %)" />
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
  const [live, setLive] = useLive<GradLive>()
  const solved = (answers.solve as Record<string, number> | undefined) ?? {}
  const shown = (answers.shown as Record<string, boolean> | undefined) ?? {}
  const misses = (answers.misses as Record<string, number> | undefined) ?? {}
  const prob = PROBLEMS[scene]
  const done = solved[prob.id] ?? 0
  const solo = prob.id === 'p3'
  const complete = solo ? done >= 1 : done >= prob.steps.length
  const step = solo ? null : prob.steps[Math.min(done, prob.steps.length - 1)]
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; pick: number } | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const v: Vec2 = [live.vx ?? 0, live.vy ?? 0]

  useEffect(() => {
    setFeedback(null)
    setWrong([])
    setLive({ pick: null })
  }, [scene, done, setLive])
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(complete), [complete, setReady])

  // Problem 3: validated as soon as the arrow is right.
  const [vx, vy] = v
  const solveRec = answers.solve
  useEffect(() => {
    if (solo && !complete && vx === P3_ANSWER[0] && vy === P3_ANSWER[1]) {
      haptic([14, 60, 20])
      setAnswer('solve', { ...(solveRec as Record<string, number> | undefined), p3: 1 })
    }
  }, [solo, complete, vx, vy, solveRec, setAnswer])

  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: solo
      ? `Problema 3 (sozinho): ∇f(−2; 0,5) para f = x² + 3y². ${complete ? (shown.p3 ? 'Pediu "Me mostre".' : 'Acertou sozinho: (−4, 3).') : `A seta do aluno está em (${fmt(v[0])}, ${fmt(v[1])}).`}`
      : `Problema ${scene + 1}/3 (${prob.titleSay}). ${complete ? 'Resolvido.' : `Passo ${done + 1} de ${prob.steps.length}: ${step!.prompt}`}${feedback && !feedback.ok && step ? ` Errou escolhendo ${step.options[feedback.pick].say}.` : ''}`,
  })

  const pick = (i: number) => {
    if (!step) return
    const o = step.options[i]
    setLive({ pick: { prob: prob.id, step: step.id, show: o.show, ok: o.ok } })
    if (o.ok) {
      haptic([10, 40, 10])
      setFeedback({ ok: true, text: o.why, pick: i })
      timer.current = setTimeout(() => setAnswer('solve', { ...solved, [prob.id]: done + 1 }), 1500)
    } else {
      haptic(20)
      setWrong((w) => [...w, i])
      setFeedback({ ok: false, text: o.why, pick: i })
      setAnswer('misses', { ...misses, [step.id]: (misses[step.id] ?? 0) + 1 })
    }
  }
  const showMe = () => {
    setAnswer('shown', { ...shown, p3: true })
    setLive({ vx: P3_ANSWER[0], vy: P3_ANSWER[1] })
    setAnswer('solve', { ...solved, p3: 1 })
  }
  const nudgeV = (dx: number, dy: number) => setLive({ vx: Math.max(-6, Math.min(6, v[0] + dx)), vy: Math.max(-6, Math.min(6, v[1] + dy)) })

  const finished: Record<string, React.ReactNode> = {
    p1: (
      <>
        <strong>Pronto: ∇f(1, 1) = (2, 6).</strong> Nenhuma direção sobe mais rápido que √40 ≈ 6,32 por unidade andada.
      </>
    ),
    p2: (
      <>
        <strong>Isso: na direção u, f sobe 6</strong> por unidade, um pouco menos que o máximo de 6,32. É a sombra de ∇f sobre u.
      </>
    ),
    p3: shown.p3 ? (
      <>
        Era <strong>(−4, 3)</strong>: 2·(−2) = −4 e 6·0,5 = 3. Comprimento 5, um triângulo 3-4-5. Repare: a seta cruza a curva em ângulo reto.
      </>
    ) : (
      <>
        <strong>Sozinho, e certo!</strong> ∇f = (−4, 3), de comprimento 5. Repare: ela cruza a curva de nível em ângulo reto.
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
        ) : solo ? (
          <>
            <strong>Sozinho agora:</strong> monte a seta ∇f no ponto (−2; 0,5). Arraste a ponta no mapa ou use os botões.
          </>
        ) : feedback ? (
          <>
            <strong>{feedback.ok ? 'Isso.' : 'Ainda não.'}</strong> {feedback.text}
          </>
        ) : (
          step!.prompt
        )
      }
      narration={
        complete
          ? undefined
          : solo
            ? 'Sozinho agora: monte a seta do gradiente no ponto menos 2, 0 vírgula 5. Arraste a ponta no mapa ou use os botões.'
            : feedback
              ? spoken(`${feedback.ok ? 'Isso.' : 'Ainda não.'} ${feedback.text}`)
              : `${spoken(step!.prompt)} ${step!.options.map((o) => o.say).join('; ou ')}.`
      }
      nudge={
        !complete && solo
          ? 'Use as duas regras que você achou: ∂f/∂x = 2x e ∂f/∂y = 6y. Troque x e y pelos números do ponto.'
          : !complete && wrong.length >= 1 && !feedback?.ok
            ? 'Olhe o palco: a reta ou a seta rosa mostra o que a sua escolha faria. Pense em qual letra está andando.'
            : undefined
      }
      controls={
        complete ? null : solo ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Stepper label="∂f/∂x" value={v[0]} onMinus={() => nudgeV(-1, 0)} onPlus={() => nudgeV(1, 0)} />
              <Stepper label="∂f/∂y" value={v[1]} onMinus={() => nudgeV(0, -1)} onPlus={() => nudgeV(0, 1)} />
            </div>
            <div className="flex">
              <ShowMe onClick={showMe} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {step!.options.map((o, i) => (
              <Choice
                key={i}
                state={feedback?.pick === i ? (feedback.ok ? 'correct' : 'wrong') : wrong.includes(i) ? 'wrong' : null}
                disabled={wrong.includes(i) || Boolean(feedback?.ok)}
                onClick={() => pick(i)}
              >
                <span className="block text-center text-[16px]">
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

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  const btn = 'focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.05] text-white/80 active:scale-95'
  return (
    <div className="flex items-center justify-between gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-1.5 py-1">
      <button aria-label={`Diminuir ${label}`} className={btn} onClick={() => (haptic(5), onMinus())}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-center">
        <span className="block text-[11px] text-white/45">{label}</span>
        <span className="block font-mono text-[17px] tabular-nums text-white">{fmt(value)}</span>
      </span>
      <button aria-label={`Aumentar ${label}`} className={btn} onClick={() => (haptic(5), onPlus())}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

// ------------------------------------------------------------ 6. E se…?

const FOG_OPTIONS = ['Na direção de ∇f', 'Na direção de −∇f', 'Ao longo da curva de nível', 'Direto para o fundo']
const FOG_ANSWER = 1
const FOG_WHY = [
  '∇f aponta morro acima: você subiria! Para descer o mais rápido possível, ande contra a seta: −∇f.',
  'Isso! −∇f é a descida mais íngreme. Passo a passo: (x, y) ← (x, y) − η∇f.',
  'Na curva de nível a altura não muda: você andaria em volta. Para descer, ande contra a seta: −∇f.',
  'Na neblina você não vê o fundo! Só sente a inclinação do chão. A melhor aposta é −∇f.',
]
const BIG_OPTIONS = ['Chega ainda mais rápido', 'Passa do fundo e sobe do outro lado, cada vez mais', 'Para no meio do caminho', 'Faz o mesmo zigue-zague de 0,3']
const BIG_ANSWER = 1
const ETA_CHIPS = [0.02, 0.15, 0.3]

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 4, 'eseScene')
  const [live, setLive] = useLive<GradLive>()
  const eta = live.eta ?? 0.15
  const fogPick = typeof answers.eseChoice === 'number' ? (answers.eseChoice as number) : null
  const big = typeof answers.eseBig === 'number' ? (answers.eseBig as number) : null
  const small = useTask(scene === 1 && eta <= 0.05, 'etaSmall', props)
  const zig = useTask(scene === 1 && eta >= 0.2, 'etaZig', props)
  const run = descend(BOWL.field, DESCENT_START, eta, { maxSteps: 60, bound: DESCENT_BOUND, tol: 0.05 })
  const steps = run.path.length - 1

  // Remember the quickest walk that reached the bottom.
  const bestSteps = typeof answers.bestSteps === 'number' ? (answers.bestSteps as number) : Infinity
  useEffect(() => {
    if (scene === 1 && run.status === 'chegou' && steps < bestSteps) {
      setAnswer('bestSteps', steps)
      setAnswer('bestEta', eta)
    }
  }, [scene, run.status, steps, bestSteps, eta, setAnswer])
  useEffect(() => setReady((scene === 0 && fogPick !== null) || (scene === 1 && small && zig) || (scene === 2 && big !== null) || scene === 3), [scene, fogPick, small, zig, big, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state: `Cena ${scene + 1}/4. ${
      scene === 0
        ? fogPick === null
          ? 'Escolhendo a direção do passo na neblina.'
          : `Escolheu "${FOG_OPTIONS[fogPick]}".`
        : scene === 1
          ? `η = ${fmt(eta)}: ${run.status === 'chegou' ? `chegou em ${steps} passos` : run.status === 'divergiu' ? 'divergiu' : 'ainda descendo após 60 passos'}.`
          : scene === 2
            ? big === null
              ? 'Prevendo o que acontece com η = 0,4.'
              : `Escolheu "${BIG_OPTIONS[big]}".`
            : 'Ligação com redes neurais.'
    }`,
  })

  const rule = <Tex say="x e y recebem x e y menos eta vezes o gradiente">{'(x,y) \\leftarrow (x,y) - \\eta\\,\\nabla f'}</Tex>
  const caption =
    scene === 0 ? (
      fogPick === null ? (
        <>
          Neblina total: você só sente o chão sob os pés. Para descer ao fundo do vale, <strong>para onde dar o passo?</strong>
        </>
      ) : (
        <>
          {fogPick !== FOG_ANSWER && <strong>Ótimo erro para aprender! </strong>}
          {FOG_WHY[fogPick]}
        </>
      )
    ) : scene === 1 ? (
      <>
        Cada passo: {rule}. O <strong>η</strong> é o tamanho do passo. Teste um passo pequeno e um grande.
      </>
    ) : scene === 2 ? (
      big === null ? (
        <>
          E se o passo for grande demais, <strong>η = 0,4</strong>? O que acontece com o caminhante?
        </>
      ) : (
        <>
          <strong>{big === BIG_ANSWER ? 'Isso: diverge!' : 'Ótimo erro para aprender!'}</strong> Em y, cada passo multiplica a posição por 1 − 6η = −1,4: troca de lado e cresce.
        </>
      )
    ) : (
      <>
        É assim que <strong>redes neurais aprendem</strong>: o vale é o erro da rede, com milhões de direções, e η é a taxa de aprendizado.
      </>
    )

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + ((scene === 0 && fogPick !== null) || (scene === 2 && big !== null) ? 1 : 0)}
      caption={caption}
      narration={
        scene === 0
          ? fogPick === null
            ? `Neblina total: você só sente o chão sob os pés. Para descer ao fundo do vale, para onde dar o passo? ${FOG_OPTIONS.map(spoken).join('; ')}.`
            : spoken(FOG_WHY[fogPick]).replace('(x, y) ← (x, y) − eta gradiente de f', 'a posição recebe a posição menos eta vezes o gradiente')
          : scene === 1
            ? 'Cada passo: a posição recebe a posição menos eta vezes o gradiente. Eta é o tamanho do passo. Teste um passo pequeno e um grande.'
            : scene === 2 && big !== null
              ? 'Em y, cada passo multiplica a posição por 1 menos 6 eta, que dá menos 1 vírgula 4: troca de lado e cresce. O caminhante foge do vale.'
              : scene === 3
                ? 'É assim que redes neurais aprendem: o vale é o erro da rede, com milhões de direções, e eta é a taxa de aprendizado.'
                : undefined
      }
      nudge={scene === 1 && !(small && zig) ? (small ? 'Agora um passo grande: passe de 0,2 e veja o caminho.' : 'Comece com um passo bem pequeno, perto de 0,02, e conte os passos.') : undefined}
      controls={
        scene === 0 && fogPick === null ? (
          <div className="grid grid-cols-2 gap-2">
            {FOG_OPTIONS.map((o, i) => (
              <Choice
                key={o}
                onClick={() => {
                  haptic(i === FOG_ANSWER ? [10, 40, 10] : 20)
                  setAnswer('eseChoice', i)
                }}
              >
                <span className="block text-[14px] leading-snug">{o}</span>
              </Choice>
            ))}
          </div>
        ) : scene === 1 ? (
          <div className="space-y-2">
            <Slider label="Tamanho do passo (η)" min={0.01} max={0.32} step={0.01} value={eta} onChange={(x) => setLive({ eta: x })} display={fmt(eta, 2)} />
            <div className="flex flex-wrap items-center gap-2">
              {ETA_CHIPS.map((c) => (
                <Chip key={c} active={Math.abs(eta - c) < 0.005} onClick={() => setLive({ eta: c, run: (live.run ?? 0) + 1 })}>
                  {fmt(c, 2)}
                </Chip>
              ))}
              <span className="ml-auto flex items-center gap-3">
                <Dot done={small} label="pequeno" />
                <Dot done={zig} label="grande" />
              </span>
            </div>
          </div>
        ) : scene === 2 && big === null ? (
          <div className="grid grid-cols-2 gap-2">
            {BIG_OPTIONS.map((o, i) => (
              <Choice
                key={o}
                onClick={() => {
                  haptic(i === BIG_ANSWER ? [10, 40, 10] : 20)
                  setAnswer('eseBig', i)
                }}
              >
                <span className="block text-[13.5px] leading-snug">{o}</span>
              </Choice>
            ))}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

const FIRST_TRY_STEPS = ['dx', 'dy', 'vec', 'len', 'dir']

export function Conclua({ lab, setReady, answers }: StepProps) {
  const { navigate } = useRouter()
  useEffect(() => setReady(true), [setReady])
  const summit = typeof answers.summit === 'number' ? (answers.summit as number) : SUMMIT_H
  const misses = (answers.misses as Record<string, number> | undefined) ?? {}
  const shown = (answers.shown as Record<string, boolean> | undefined) ?? {}
  const firstTry = FIRST_TRY_STEPS.filter((s) => !misses[s]).length + (shown.p3 ? 0 : 1)
  const bestSteps = typeof answers.bestSteps === 'number' ? (answers.bestSteps as number) : null
  const bestEta = typeof answers.bestEta === 'number' ? (answers.bestEta as number) : null
  useVegaScreen({
    lab: lab.slug,
    step: 'conclua',
    state: `Conclusão. Cume a ${m(summit)}; ${firstTry} de 6 passos do Resolva de primeira; descida mais rápida: ${bestSteps ?? '—'} passos com η = ${bestEta === null ? '—' : fmt(bestEta)}.`,
  })
  return (
    <StepFrame
      lab={lab}
      stepIndex={6}
      caption={
        <>
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.3 }} className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
            <Medal accent={lab.accent} /> Conquista desbloqueada
          </motion.span>
          <span className="block text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white lg:text-[32px]">{lab.achievement?.title}</span>
          <span className="mt-1 block text-[15px] text-white/60">O gradiente aponta a subida mais íngreme; contra ele, a descida mais rápida.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} O gradiente aponta a subida mais íngreme; contra ele, a descida mais rápida.`}
      controls={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Cume" value={m(summit)} />
            <Summary label="De primeira" value={`${firstTry} de 6`} />
            <Summary label="Descida" value={bestSteps === null ? '—' : `${bestSteps} passos`} sub={bestEta === null ? undefined : `η = ${fmt(bestEta, 2)}`} />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate({ area: 'laboratorio', slug: 'equacoes-diferenciais' })}>
              Próximo: a equação que prevê o futuro <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10.5px] leading-snug text-white/30">Alturas: Parque Bondinho Pão de Açúcar (forma simplificada). Cauchy (1847); Rumelhart, Hinton e Williams (1986).</p>
        </div>
      }
    />
  )
}

function Summary({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.5 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] text-white">{value}</p>
      {sub && <p className="text-[10.5px] text-white/45">{sub}</p>}
    </motion.div>
  )
}

/** A small medal: a ring that draws itself around a rising arrow. */
function Medal({ accent }: { accent: string }) {
  return (
    <span className="relative inline-block h-7 w-7">
      <motion.span
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.8, 2.2] }}
        transition={{ duration: 1.4, delay: 0.4 }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}88, transparent 70%)` }}
      />
      <svg viewBox="0 0 28 28" className="relative h-full w-full">
        <motion.circle cx="14" cy="14" r="12" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.3 }} />
        <motion.path d="M8 18 L14 9 L20 18" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.9 }} />
      </svg>
    </span>
  )
}

export const GRADIENTE_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  'mundo-real': MundoReal,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
