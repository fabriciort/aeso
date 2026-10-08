'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { angleDelta, sinusoidMatches, TAU, toDeg, toRad, waveDistance, wheelHeight } from '@/lib/math/trig'
import { fmt } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Tex } from '@/components/math/Tex'
import { prefersReducedMotion } from '@/components/math/canvas'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  ENTENDA_MAX,
  ESE_Q,
  ESE_Q_ANSWER,
  ESE_RANGE,
  ESE_TARGET,
  EYE_ABOVE,
  IMAGINE_MAX,
  P3_SOLUTIONS,
  PROBLEMS,
  Q1,
  Q1_ANSWER,
  SHAPE_ANSWER,
  SHAPES,
  SIN,
  type TrigLive,
} from './data'

// "A roda que vira onda". The Palco is continuous (Stage.tsx); these Etapas
// tell the story and hold the controls.

// ------------------------------------------------------------ helpers

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

/** Advances to `to` once, a moment after `when` becomes true. */
function useAutoAdvance(when: boolean, scene: number, from: number, to: number, setScene: (s: number) => void, ms = 1100) {
  const fired = useRef(false)
  useEffect(() => {
    if (!when || scene !== from || fired.current) return
    fired.current = true
    const t = setTimeout(() => setScene(to), ms)
    return () => clearTimeout(t)
  }, [when, scene, from, to, setScene, ms])
}

/** Animates live values (the "Me mostre" moves), with rAF and cleanup. */
function useTween() {
  const [, setLive] = useLive<TrigLive>()
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return useCallback(
    (from: Partial<Record<keyof TrigLive, number>>, to: Partial<Record<keyof TrigLive, number>>, ms: number, done?: () => void) => {
      cancelAnimationFrame(raf.current)
      if (prefersReducedMotion()) {
        setLive(to as Partial<TrigLive>)
        done?.()
        return
      }
      const t0 = performance.now()
      const tick = (now: number) => {
        const s = Math.min(1, (now - t0) / ms)
        const e = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2
        const patch: Record<string, number> = {}
        for (const k of Object.keys(to) as (keyof TrigLive)[]) patch[k] = (from[k] ?? 0) + ((to[k] ?? 0) - (from[k] ?? 0)) * e
        setLive(patch as Partial<TrigLive>)
        if (s < 1) raf.current = requestAnimationFrame(tick)
        else done?.()
      }
      raf.current = requestAnimationFrame(tick)
    },
    [setLive],
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

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-11 rounded-full border px-3.5 text-[13.5px] transition-all active:scale-95',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/70',
      )}
    >
      {children}
    </button>
  )
}

function ShowMe({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn('h-11 px-1 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline', className)}>
      Me mostre
    </button>
  )
}

const deg = (rad: number) => `${fmt(toDeg(rad), 0)}°`

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'imagineScene')
  const [live] = useLive<TrigLive>()
  const theta = live.theta ?? 0
  const tween = useTween()
  const one = useTask(theta >= TAU - 0.03, 'turn1', props)
  const two = useTask(theta >= IMAGINE_MAX - 0.03, 'turn2', props)
  const best = typeof answers.turns === 'number' ? (answers.turns as number) : 0
  useEffect(() => {
    if (theta / TAU > best + 0.05) setAnswer('turns', Math.min(2, theta / TAU))
  }, [theta, best, setAnswer])
  useAutoAdvance(one, scene, 1, 2, setScene)
  useAutoAdvance(two, scene, 2, 3, setScene)
  useEffect(() => setReady(scene === 1 ? one : scene === 2 ? two : true), [scene, one, two, setReady])
  useVegaScreen({ lab: lab.slug, step: 'imagine', state: `Cena ${scene + 1}/4. Cabine girada ${deg(theta)} (${fmt(theta / TAU, 2)} volta).` })

  const captions = [
    <>
      Uma roda-gigante gira devagar. Ao lado, um gráfico anota a <strong>altura da cabine</strong> para cada ângulo girado.
    </>,
    <>
      Arraste a cabine e dê <strong>uma volta completa</strong>, no sentido anti-horário. Olhe o gráfico nascer.
    </>,
    <>
      Agora a <strong>segunda volta</strong>. Compare o desenho novo com o da primeira.
    </>,
    <>
      O desenho <strong>se repete</strong> a cada volta: sobe, desce, volta. Essa onda nasceu do círculo e tem nome: <strong>senoide</strong>.
    </>,
  ]
  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={
        scene === 1 && !one
          ? 'Siga a linha tracejada: ela liga a cabine ao ponto do gráfico, na mesma altura.'
          : scene === 2 && !two
            ? 'Continue girando no mesmo sentido até completar 720°.'
            : undefined
      }
      controls={
        scene === 1 || scene === 2 ? (
          <div className="flex items-center gap-4">
            <Dot done={one} label="1 volta" />
            <Dot done={two} label="2 voltas" />
            {((scene === 1 && !one) || (scene === 2 && !two)) && (
              <ShowMe className="ml-auto" onClick={() => tween({ theta }, { theta: scene === 1 ? TAU : IMAGINE_MAX }, 2200)} />
            )}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

function MiniShape({ id }: { id: string }) {
  const pts: string[] = []
  for (let i = 0; i <= 48; i++) {
    const u = (i / 48) * TAU
    const y = id === 'sin' ? Math.sin(u) : id === 'tri' ? (2 / Math.PI) * Math.asin(Math.sin(u)) : ((u + Math.PI) % TAU) / Math.PI - 1
    pts.push(`${(i / 48) * 60 + 2},${16 - y * 11}`)
  }
  if (id === 'saw') {
    // The jump of the sawtooth is vertical.
    pts.splice(25, 0, `${32},${16 - 11}`, `${32},${16 + 11}`)
  }
  return (
    <svg viewBox="0 0 64 32" className="mx-auto h-7 w-16" aria-hidden>
      <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const q1 = typeof answers.q1 === 'number' ? (answers.q1 as number) : null
  const q2 = typeof answers.q2 === 'number' ? (answers.q2 as number) : null
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(scene === 0 ? q1 !== null : scene === 2 ? q2 !== null : true), [scene, q1, q2, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state:
      scene <= 1
        ? q1 === null
          ? 'Pergunta 1 (altura após 180°): ainda não escolheu.'
          : `Pergunta 1: escolheu "${Q1[q1]}" (${q1 === Q1_ANSWER ? 'correto' : 'incorreto'}).`
        : q2 === null
          ? 'Pergunta 2 (forma do gráfico altura × tempo): ainda não escolheu.'
          : `Pergunta 2: escolheu ${SHAPES[q2].name} (${q2 === SHAPE_ANSWER ? 'correto' : 'incorreto'}).`,
  })
  const choose = (key: 'q1' | 'q2', i: number, ok: boolean, next: number) => {
    setAnswer(key, i)
    haptic(ok ? [10, 40, 10] : 20)
    timer.current = setTimeout(() => setScene(next), 650)
  }

  const captions = [
    <>
      A cabine está na <strong>altura do eixo</strong>, à direita. Depois de girar <strong>180°</strong>, ela estará…
    </>,
    q1 === Q1_ANSWER ? (
      <>
        <strong>Isso!</strong> Meia volta leva a cabine para o outro lado, na mesma altura. O topo vem antes: em 90°, um quarto de volta.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> O topo é em 90°, só um quarto de volta. Em 180° a cabine está do outro lado, na altura do eixo.
      </>
    ),
    <>
      A roda gira sempre com a mesma rapidez. Qual gráfico mostra a <strong>altura × tempo</strong>?
    </>,
    q2 === SHAPE_ANSWER ? (
      <>
        <strong>Exato: a onda suave.</strong> Veja a seta azul: perto do topo a cabine anda de lado, e a altura quase para de mudar.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> A cabine gira em ritmo constante, mas a altura não: no topo ela anda de lado (a seta azul some). O pico é redondo.
      </>
    ),
  ]
  return (
    <StepFrame
      lab={lab}
      stepIndex={1}
      scene={scene}
      caption={captions[scene]}
      narration={
        scene === 0
          ? `A cabine está na altura do eixo, à direita. Depois de girar 180 graus, ela estará: ${Q1.join('; ')}?`
          : scene === 2
            ? 'A roda gira sempre com a mesma rapidez. Qual gráfico mostra a altura em função do tempo? A, zigue-zague; B, onda suave; ou C, dente de serra?'
            : undefined
      }
      controls={
        scene === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {Q1.map((p, i) => (
              <Choice
                key={p}
                selected={q1 === i}
                state={q1 === null ? null : i === Q1_ANSWER ? 'correct' : q1 === i ? 'wrong' : null}
                disabled={q1 !== null}
                onClick={() => choose('q1', i, i === Q1_ANSWER, 1)}
              >
                <span className="text-[14px] leading-snug">{p}</span>
              </Choice>
            ))}
          </div>
        ) : scene === 2 ? (
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map((s, i) => (
              <Choice
                key={s.id}
                selected={q2 === i}
                state={q2 === null ? null : i === SHAPE_ANSWER ? 'correct' : q2 === i ? 'wrong' : null}
                disabled={q2 !== null}
                onClick={() => choose('q2', i, i === SHAPE_ANSWER, 3)}
              >
                <span className="block text-center text-white/85">
                  <MiniShape id={s.id} />
                  <span className="mt-1 block text-[12.5px] leading-tight">
                    <strong className="font-semibold" style={{ color: lab.accent }}>
                      {'ABC'[i]}
                    </strong>{' '}
                    {s.name}
                  </span>
                </span>
              </Choice>
            ))}
          </div>
        ) : (
          <button
            onClick={() => {
              setAnswer(scene === 1 ? 'q1' : 'q2', undefined)
              setScene(scene - 1)
            }}
            className="h-11 text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
          >
            Responder de novo
          </button>
        )
      }
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 5, 'entendaScene')
  const [live, setLive] = useLive<TrigLive>()
  const theta = live.theta ?? 0
  const radii = typeof answers.radii === 'number' ? (answers.radii as number) : 0
  const tween = useTween()
  const unrolled = useTask(scene === 3 && theta >= ENTENDA_MAX - 0.03, 'unrolled', props)

  // Coming from Imagine with two turns: start P near a nice angle.
  useEffect(() => {
    if (scene === 0 && (live.theta === undefined || live.theta > TAU)) setLive({ theta: toRad(40) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // The unrolling starts from θ = 0.
  const reset3 = useRef(false)
  useEffect(() => {
    if (scene === 3 && !unrolled && !reset3.current) {
      reset3.current = true
      setLive({ theta: 0 })
    }
  }, [scene, unrolled, setLive])
  useAutoAdvance(radii >= 6, scene, 1, 2, setScene, 2600)
  useAutoAdvance(unrolled, scene, 3, 4, setScene, 1200)
  useEffect(() => setReady(scene === 1 ? radii >= 6 : scene === 3 ? unrolled : true), [scene, radii, unrolled, setReady])
  useVegaScreen({
    lab: lab.slug,
    step: 'entenda',
    state:
      scene === 0
        ? `Cena 1/5. P em ${deg(theta % TAU)}: cos θ = ${fmt(Math.cos(theta))}, sen θ = ${fmt(Math.sin(theta))}.`
        : scene <= 2
          ? `Cena ${scene + 1}/5. ${radii} raios dobrados sobre a borda.`
          : `Cena ${scene + 1}/5. θ = ${fmt(theta)} rad; ${scene === 4 ? 'cosseno tracejado como onda adiantada de π/2' : 'seno se desenrolando'}.`,
  })

  const captions = [
    <>
      O raio agora vale 1 e a cabine vira o ponto P. A sombra horizontal de P é o <strong style={{ color: '#ffb454' }}>cosseno</strong>; a vertical, o <strong style={{ color: lab.accent }}>seno</strong>.
    </>,
    <>
      Pegue o raio e <strong>dobre-o sobre a borda</strong>, um de cada vez. Quantos raios cabem em meia volta? E na volta inteira?
    </>,
    <>
      Em meia volta cabem <strong>π ≈ 3,14 raios</strong>; na volta inteira, <strong>2π ≈ 6,28</strong>. Medir ângulos em raios é medir em <strong>radianos</strong>.
    </>,
    <>
      Agora desenrole: gire P <strong>uma volta</strong> e veja o seno virar onda, com o ângulo em radianos embaixo.
    </>,
    <>
      O <strong style={{ color: '#ffb454' }}>cosseno</strong> (tracejado) é a mesma onda, <strong>adiantada π/2</strong>: chega ao topo um quarto de volta antes.
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
          ? 'Em meia volta cabem pi, aproximadamente 3,14 raios; na volta inteira, 2 pi, aproximadamente 6,28. Medir ângulos em raios é medir em radianos.'
          : scene === 4
            ? 'O cosseno, tracejado, é a mesma onda adiantada de pi sobre 2: chega ao topo um quarto de volta antes.'
            : undefined
      }
      nudge={
        scene === 1 && radii < 6
          ? 'Toque em dobrar e acompanhe o número de cada arco. Repare onde fica a metade da volta.'
          : scene === 3 && !unrolled
            ? 'Arraste P no sentido anti-horário, ou arraste o ponto do gráfico para a direita.'
            : undefined
      }
      controls={
        scene === 0 ? (
          <Slider label="Ângulo θ" min={0} max={360} step={1} value={Math.round(toDeg(theta % TAU))} onChange={(v) => setLive({ theta: toRad(v) })} display={deg(theta % TAU)} />
        ) : scene === 1 ? (
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={radii >= 6}
              onClick={() => {
                haptic(10)
                setAnswer('radii', radii + 1)
              }}
            >
              Dobrar um raio
            </Button>
            <span className="font-mono text-[14px] tabular-nums text-white/60">{radii} de 6</span>
            {radii < 6 && <ShowMe className="ml-auto" onClick={() => setAnswer('radii', 6)} />}
          </div>
        ) : scene === 2 ? (
          <div className="text-[15px] text-white/80">
            <Tex say="pi radianos igual a 180 graus">{'\\pi\\ \\text{rad} = 180^\\circ'}</Tex>
            <span className="mx-3 text-white/25">·</span>
            <Tex say="1 radiano é aproximadamente 57,3 graus">{'1\\ \\text{rad} \\approx 57{,}3^\\circ'}</Tex>
          </div>
        ) : scene === 3 ? (
          <div className="flex items-center gap-4">
            <Dot done={unrolled} label="Uma volta: 2π" />
            {!unrolled && <ShowMe className="ml-auto" onClick={() => tween({ theta }, { theta: ENTENDA_MAX }, 2400)} />}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

export function Observe(props: StepProps) {
  const { lab, setReady } = props
  const [scene, setScene] = useScenes(props, 4, 'observeScene')
  const [live, setLive] = useLive<TrigLive>()
  const t = live.t ?? 0
  const tween = useTween()
  const f1 = useTask(scene === 2 && t >= EYE_ABOVE.t1, 'f1', props)
  const f2 = useTask(scene === 2 && f1 && t >= EYE_ABOVE.t2, 'f2', props)
  useEffect(() => {
    if (scene === 0 && live.t === undefined) setLive({ t: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useAutoAdvance(f1 && f2, scene, 2, 3, setScene, 1300)
  useEffect(() => setReady(scene === 2 ? f1 && f2 : true), [scene, f1, f2, setReady])
  useVegaScreen({ lab: lab.slug, step: 'observe', state: `Cena ${scene + 1}/4. t = ${fmt(t, 1)} min, h ≈ ${fmt(wheelHeight(t), 0)} m. Subida por 100 m: ${f1 ? 'achou' : 'não'}; descida: ${f2 ? 'achou' : 'não'}.` })

  const captions = [
    <>
      A <strong>London Eye</strong>, em Londres: 135 m de altura, roda de 120 m e uma volta em ≈ 30 min. A cabine embarca embaixo.
    </>,
    <>
      O modelo: eixo a 75 m, <strong>menos</strong> 60 m (o raio) vezes o cosseno. O menos é porque ela começa embaixo. Arraste o tempo.
    </>,
    <>
      Quando a cabine passa de <strong>100 m</strong>? Arraste o tempo e ache quando ela <strong>cruza a linha</strong> subindo e descendo.
    </>,
    <>
      Acima de 100 m de <strong>≈ {fmt(EYE_ABOVE.t1, 1)}</strong> a <strong>≈ {fmt(EYE_ABOVE.t2, 1)} min</strong>: mais de um terço do passeio com a vista mais alta.
    </>,
  ]
  const slider = <Slider label="Tempo depois do embarque" min={0} max={30} step={0.1} value={t} onChange={(v) => setLive({ t: v })} display={`${fmt(t, 1)} min`} />
  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene}
      caption={captions[scene]}
      narration={
        scene === 1
          ? 'O modelo: h de t igual a 75 menos 60 vezes o cosseno de 2 pi t sobre 30. 75 metros é o eixo, 60 o raio. O menos é porque ela começa embaixo. Arraste o tempo.'
          : undefined
      }
      nudge={scene === 2 && !(f1 && f2) ? (f1 ? 'Continue: depois do topo, a cabine desce e cruza a linha de novo.' : 'Olhe onde a curva encosta na linha tracejada de 100 m.') : undefined}
      controls={
        scene === 1 ? (
          slider
        ) : scene === 2 ? (
          <div className="space-y-2.5">
            {slider}
            <div className="flex items-center gap-4">
              <Dot done={f1} label="Subindo" />
              <Dot done={f2} label="Descendo" />
              {!(f1 && f2) && <ShowMe className="ml-auto" onClick={() => tween({ t }, { t: 30 }, 3200)} />}
            </div>
          </div>
        ) : scene === 3 ? (
          <div className="text-[15px] text-white/85">
            <Tex block say="h de t maior que 100 quando o cosseno de 2 pi t sobre 30 for menor que menos 5 sobre 12">
              {'h(t) > 100 \\iff \\cos\\tfrac{2\\pi t}{30} < -\\tfrac{5}{12}'}
            </Tex>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

export function Resolva(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 4, 'resolvaScene')
  const [live, setLive] = useLive<TrigLive>()
  const tries = (answers.tries as Record<string, number> | undefined) ?? {}
  const r0 = typeof answers.r0 === 'number' ? (answers.r0 as number) : 0
  const r1 = typeof answers.r1 === 'number' ? (answers.r1 as number) : 0
  const found = useMemo(() => (Array.isArray(answers.p3found) ? (answers.p3found as number[]) : []), [answers.p3found])
  const miss = Boolean(answers.p3miss)
  const p3 = live.p3 ?? toRad(70)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; pick: number } | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const problem = scene <= 1 ? PROBLEMS[scene] : null
  const done = scene === 0 ? r0 : r1
  const complete = problem ? done >= problem.length : scene === 2 ? found.length === 2 : true
  const step = problem ? problem[Math.min(done, problem.length - 1)] : null

  useEffect(() => {
    setFeedback(null)
    setWrong([])
    setLive({ pick: null })
  }, [scene, done, setLive])
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  useEffect(() => setReady(complete), [complete, setReady])

  // Problem 3: a solution counts when P lands on it (snap or slider).
  useEffect(() => {
    if (scene !== 2) return
    P3_SOLUTIONS.forEach((s, i) => {
      if (Math.abs(angleDelta(p3, s)) < 0.004 && !found.includes(i)) {
        haptic([12, 50, 12])
        setAnswer('p3found', [...found, i].sort())
      }
    })
  }, [scene, p3, found, setAnswer])

  const pick = (i: number) => {
    if (!problem || !step) return
    const o = step.options[i]
    const key = `${scene}-${done}`
    setLive({ pick: { problem: scene as 0 | 1, step: done, option: i } })
    if (i === step.answer) {
      haptic([10, 40, 10])
      setFeedback({ ok: true, text: o.why, pick: i })
      timer.current = setTimeout(() => setAnswer(scene === 0 ? 'r0' : 'r1', done + 1), 1300)
    } else {
      haptic(20)
      setAnswer('tries', { ...tries, [key]: (tries[key] ?? 0) + 1 })
      setWrong((w) => [...w, i])
      setFeedback({ ok: false, text: o.why, pick: i })
    }
  }

  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state:
      scene <= 1 && step
        ? `Problema ${scene + 1}/3 (${scene === 0 ? 'seno de 150°' : 'cosseno de 210°'}). ${complete ? 'Resolvido.' : `Passo ${done + 1}: ${step.q}`}${feedback && !feedback.ok ? ` Errou escolhendo ${step.options[feedback.pick].say}.` : ''}`
        : scene === 2
          ? `Problema 3: sen θ = 1/2 em [0, 2π]. P em ${deg(p3)}. Soluções achadas: ${found.length}.${miss ? ' Achou que tinha terminado com uma só.' : ''}`
          : 'Resumo das simetrias: 30°, 150°, 210° e 330°.',
  })

  // ---------------------------------------------------------------- problems 1 and 2
  if (problem && step) {
    const finished =
      scene === 0 ? (
        <>
          <strong>
            <Tex say="seno de 150 graus igual a um meio">{`${SIN} 150^\\circ = \\tfrac{1}{2}`}</Tex>
          </strong>
          . O espelho mudou o lado, não a altura. Agora um com menos ajuda.
        </>
      ) : (
        <>
          <strong>
            <Tex say="cosseno de 210 graus igual a menos raiz de três sobre dois">{'\\cos 210^\\circ = -\\tfrac{\\sqrt{3}}{2}'}</Tex>
          </strong>
          . Meia volta troca os dois sinais. O último é com você.
        </>
      )
    return (
      <StepFrame
        lab={lab}
        stepIndex={4}
        scene={scene * 10 + done + (feedback ? 0.5 : 0)}
        caption={
          complete ? (
            finished
          ) : feedback ? (
            <>
              <strong>{feedback.ok ? 'Isso.' : 'Ainda não.'}</strong> {feedback.text}
            </>
          ) : (
            <>
              {scene === 0 && done === 0 && (
                <>
                  Quanto vale <Tex say="seno de 150 graus">{`${SIN} 150^\\circ`}</Tex>? Você sabe que <Tex say="seno de 30 graus é um meio">{`${SIN} 30^\\circ = \\tfrac{1}{2}`}</Tex>.{' '}
                </>
              )}
              {scene === 1 && done === 0 && <>Agora cos 210°, com menos ajuda. </>}
              <strong>{step.q}</strong>
            </>
          )
        }
        narration={complete ? undefined : feedback ? undefined : `${step.say} ${step.options.map((o) => o.say).join('; ou ')}.`}
        nudge={!complete && wrong.length >= 1 && !feedback?.ok ? 'Olhe o palco: de que lado do círculo o ponto está, e a que altura?' : undefined}
        controls={
          complete ? null : (
            <div className={cn('grid gap-2', step.options.length > 3 ? 'grid-cols-2' : 'grid-cols-1')}>
              {step.options.map((o, i) => (
                <Choice
                  key={i}
                  state={feedback?.pick === i ? (feedback.ok ? 'correct' : 'wrong') : wrong.includes(i) ? 'wrong' : null}
                  disabled={wrong.includes(i) || Boolean(feedback?.ok)}
                  onClick={() => pick(i)}
                >
                  <span className={cn('block text-center', o.tex ? 'text-[17px]' : 'text-[14px]', step.options.length <= 3 && 'py-0')}>
                    {o.tex ? <Tex say={o.say}>{o.tex}</Tex> : o.text}
                  </span>
                </Choice>
              ))}
            </div>
          )
        }
      />
    )
  }

  // ---------------------------------------------------------------- problem 3 (alone)
  if (scene === 2) {
    const one = found.length === 1
    const caption =
      found.length === 2 ? (
        <>
          <strong>As duas:</strong> <Tex say="pi sobre 6">{'\\tfrac{\\pi}{6}'}</Tex> e <Tex say="5 pi sobre 6">{'\\tfrac{5\\pi}{6}'}</Tex>. Espelhos no eixo vertical, como 30° e 150°.
        </>
      ) : one && miss ? (
        <>
          <strong>Ótimo erro para aprender:</strong> a reta y = ½ corta o círculo em <strong>dois</strong> pontos. Ache o outro.
        </>
      ) : one ? (
        <>
          Achou <Tex say={found[0] === 0 ? 'pi sobre 6' : '5 pi sobre 6'}>{found[0] === 0 ? '\\tfrac{\\pi}{6}' : '\\tfrac{5\\pi}{6}'}</Tex>! Tem mais alguma? Quando acabar, toque em Terminei.
        </>
      ) : (
        <>
          Sozinho: resolva <Tex say="seno de teta igual a um meio">{`${SIN}\\,\\theta = \\tfrac{1}{2}`}</Tex> com θ de 0 a 2π. Arraste P e solte onde a altura for ½.
        </>
      )
    return (
      <StepFrame
        lab={lab}
        stepIndex={4}
        scene={20 + found.length + (miss ? 0.5 : 0)}
        caption={caption}
        narration={found.length === 0 ? 'Sozinho: resolva seno de teta igual a um meio, com teta de 0 a 2 pi. Arraste P e solte onde a altura for um meio.' : undefined}
        nudge={found.length < 2 ? (one ? 'Quantos pontos do círculo têm exatamente essa altura?' : 'O seno é a altura de P. Onde ela vale metade do raio?') : undefined}
        controls={
          <div className="space-y-2">
            <Slider label="Ângulo θ" min={0} max={359} step={1} value={Math.round(toDeg(p3)) % 360} onChange={(v) => setLive({ p3: toRad(v) })} display={`${deg(p3)} · sen ${fmt(Math.sin(p3))}`} />
            <div className="flex items-center gap-3">
              <Dot done={found.includes(0)} label="θ₁" />
              <Dot done={found.includes(1)} label="θ₂" />
              {one && !miss && (
                <Button
                  variant="secondary"
                  className="h-11"
                  onClick={() => {
                    haptic(20)
                    setAnswer('p3miss', true)
                  }}
                >
                  Terminei
                </Button>
              )}
              {found.length < 2 && (found.length === 0 || miss) && (
                <ShowMe
                  className="ml-auto"
                  onClick={() => {
                    setAnswer('p3shown', true)
                    setAnswer('p3found', [0, 1])
                    setLive({ p3: P3_SOLUTIONS[1] })
                  }}
                />
              )}
            </div>
          </div>
        }
      />
    )
  }

  // ---------------------------------------------------------------- summary
  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={30}
      caption={
        <>
          Espelhar ou girar só <strong>troca sinais</strong>. O tamanho vem do ângulo de referência: aqui, sempre <strong>30°</strong>.
        </>
      }
      controls={
        <div className="text-[15px] text-white/85">
          <Tex block say="seno de 30 graus igual a seno de 150 graus igual a um meio">{`${SIN} 30^\\circ = ${SIN} 150^\\circ = \\tfrac{1}{2}`}</Tex>
          <Tex block say="seno de 210 graus igual a seno de 330 graus igual a menos um meio">{`${SIN} 210^\\circ = ${SIN} 330^\\circ = -\\tfrac{1}{2}`}</Tex>
        </div>
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

const PARAMS = [
  { id: 'A', label: 'A · raio', name: 'Amplitude A', step: 0.05 },
  { id: 'w', label: 'ω · rapidez', name: 'Rapidez ω', step: 0.05 },
  { id: 'd', label: 'd · eixo', name: 'Altura do eixo d', step: 0.05 },
] as const

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 5, 'eseScene')
  const [live, setLive] = useLive<TrigLive>()
  const tween = useTween()
  const q = typeof answers.eseQ === 'number' ? (answers.eseQ as number) : null
  const matched = Boolean(answers.matched)
  const p = { A: live.A ?? 1, w: live.w ?? 2, d: live.d ?? 0 }
  const param = live.param ?? 'A'
  const [celebrate, setCelebrate] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  useEffect(() => {
    if (scene >= 2 && live.A === undefined) setLive({ A: 1, w: 2, d: 0, param: 'A' })
  }, [scene, live.A, setLive])
  const fits = scene === 3 && sinusoidMatches(p, ESE_TARGET)
  useEffect(() => {
    if (fits && !matched) {
      setAnswer('matched', true)
      setCelebrate(true)
      haptic([14, 60, 20])
      setLive(ESE_TARGET)
      timer.current = setTimeout(() => setCelebrate(false), 1200)
    }
  }, [fits, matched, setAnswer, setLive])
  useAutoAdvance(matched, scene, 3, 4, setScene, 1500)
  useEffect(() => setReady(scene === 0 ? q !== null : scene === 3 ? matched : true), [scene, q, matched, setReady])

  const dist = waveDistance(p, ESE_TARGET)
  const meter = Math.max(0, 1 - dist / 1.2)
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state:
      scene <= 1
        ? q === null
          ? 'Pergunta: o que acontece com a onda se a roda girar 2× mais rápido? Ainda não escolheu.'
          : `Escolheu "${ESE_Q[q]}" (${q === ESE_Q_ANSWER ? 'correto' : 'incorreto'}).`
        : `h(t) = ${fmt(p.A)}·sen(${fmt(p.w)}t) + ${fmt(p.d)}. ${scene === 3 ? `Alvo: A = 0,5, ω = 2, d = 1. ${matched ? 'Encaixou.' : 'Ainda não encaixou.'}` : ''}`,
  })

  const captions = [
    <>
      E se a roda girar <strong>duas vezes mais rápido</strong>? O que acontece com a onda?
    </>,
    q === ESE_Q_ANSWER ? (
      <>
        <strong>Isso: mais apertada.</strong> Cada volta desenha uma onda, e agora cabem duas voltas no mesmo tempo. A altura não muda.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> A roda é a mesma, então a altura não muda. Só cabem mais voltas no mesmo tempo: a onda aperta.
      </>
    ),
    <>
      Três botões controlam a onda: <strong>A</strong>, o raio; <strong>ω</strong>, a rapidez; <strong>d</strong>, a altura do eixo. Experimente cada um.
    </>,
    <>
      <strong>Desafio:</strong> faça a sua onda cobrir a curva tracejada. Que roda é essa?
    </>,
    <>
      <strong>Encaixou!</strong> Roda menor (A = 0,5), duas vezes mais rápida (ω = 2) e com o eixo mais alto (d = 1).
    </>,
  ]
  const r = ESE_RANGE[param]
  const cur = PARAMS.find((x) => x.id === param)!
  const controlsEdit = (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        {PARAMS.map((x) => (
          <Chip key={x.id} active={param === x.id} onClick={() => setLive({ param: x.id })}>
            {x.label}
          </Chip>
        ))}
      </div>
      <Slider label={cur.name} min={r[0]} max={r[1]} step={cur.step} value={p[param]} onChange={(v) => setLive({ [param]: v })} display={fmt(p[param])} />
    </div>
  )
  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene}
      caption={captions[scene]}
      narration={
        scene === 0
          ? `E se a roda girar duas vezes mais rápido? O que acontece com a onda? ${ESE_Q.join('; ')}?`
          : scene === 2
            ? 'Três botões controlam a onda: A, o raio; ômega, a rapidez; d, a altura do eixo. Experimente cada um.'
            : scene === 4
              ? 'Encaixou! Roda menor, amplitude 0,5; duas vezes mais rápida, ômega 2; e com o eixo mais alto, d igual a 1.'
              : undefined
      }
      nudge={scene === 3 && !matched ? 'Compare: a distância entre o pico e o vale dá 2A; conte quantas ondas cabem; o meio da onda é o d.' : undefined}
      controls={
        scene === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {ESE_Q.map((o, i) => (
              <Choice
                key={o}
                selected={q === i}
                state={q === null ? null : i === ESE_Q_ANSWER ? 'correct' : q === i ? 'wrong' : null}
                disabled={q !== null}
                onClick={() => {
                  setAnswer('eseQ', i)
                  haptic(i === ESE_Q_ANSWER ? [10, 40, 10] : 20)
                  timer.current = setTimeout(() => setScene(1), 650)
                }}
              >
                <span className="text-[14px] leading-snug">{o}</span>
              </Choice>
            ))}
          </div>
        ) : scene === 2 ? (
          controlsEdit
        ) : scene === 3 ? (
          <div className="relative space-y-2">
            {celebrate && <Burst color="#6ee7b7" />}
            {controlsEdit}
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div className={cn('h-full rounded-full', matched ? 'bg-emerald-300' : 'bg-sky-300')} animate={{ width: `${(matched ? 1 : meter) * 100}%` }} transition={spring.snappy} />
              </div>
              {!matched && <ShowMe onClick={() => tween(p, ESE_TARGET, 1800)} />}
            </div>
          </div>
        ) : scene === 4 ? (
          <div className="text-[16px] text-white/85">
            <Tex block say="h de t igual a A vezes seno de ômega t, mais d">{`h(t) = A\\,${SIN}(\\omega t) + d`}</Tex>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua(props: StepProps) {
  const { lab, setReady, answers } = props
  const [scene] = useScenes(props, 2, 'concluaScene')
  const { navigate } = useRouter()
  useEffect(() => setReady(true), [setReady])
  const turns = typeof answers.turns === 'number' ? (answers.turns as number) : 2
  const tries = (answers.tries as Record<string, number> | undefined) ?? {}
  const firstSteps = ['0-0', '0-1', '0-2', '1-0', '1-1'].filter((k) => !tries[k]).length + (answers.p3miss || answers.p3shown ? 0 : 1)
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `Conclusão. ${fmt(turns, 1)} voltas na roda; ${firstSteps} de 6 passos do Resolva certos de primeira.` })

  return (
    <StepFrame
      lab={lab}
      stepIndex={6}
      scene={scene}
      caption={
        scene === 0 ? (
          <span className="flex items-center gap-3">
            <Medal accent={lab.accent} />
            <span className="min-w-0">
              <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.3 }} className="block text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: lab.accent }}>
                Conquista desbloqueada
              </motion.span>
              <span className="block text-[24px] font-semibold leading-tight tracking-[-0.03em] text-white lg:text-[30px]">{lab.achievement?.title}</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-white/60">{lab.achievement?.description}</span>
            </span>
          </span>
        ) : (
          <>
            O triângulo dentro do círculo tem catetos cos θ e sen θ e hipotenusa 1. Pitágoras dá a regra de <strong>todo</strong> ângulo:
            <span className="mt-2 block text-[20px] text-white">
              <Tex block say="seno ao quadrado de teta mais cosseno ao quadrado de teta igual a 1">{`${SIN}^2\\theta + \\cos^2\\theta = 1`}</Tex>
            </span>
          </>
        )
      }
      narration={
        scene === 0
          ? `Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description}`
          : 'O triângulo dentro do círculo tem catetos cosseno de teta e seno de teta, e hipotenusa 1. Pitágoras dá a regra de todo ângulo: seno ao quadrado mais cosseno ao quadrado igual a 1.'
      }
      controls={
        scene === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Voltas na roda" value={fmt(turns, 1)} />
            <Summary label="Acima de 100 m" value={`≈ ${fmt(EYE_ABOVE.duration, 1)} min`} />
            <Summary label="De primeira" value={`${firstSteps} de 6`} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate({ area: 'laboratorio', slug: 'derivada' })}>
              Próximo: a derivada <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-white/30">London Eye: site oficial (londoneye.com). Altura da base ≈ 15 m, aproximada.</p>
          </div>
        )
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

/** A small medal: a ring that draws itself around a point on its circle. */
function Medal({ accent }: { accent: string }) {
  return (
    <span className="relative block h-16 w-16 shrink-0">
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1.3 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      <svg viewBox="0 0 64 64" className="relative h-full w-full">
        <motion.circle cx="32" cy="32" r="27" fill="#0a0b10" stroke="rgba(255,255,255,0.1)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.soft, delay: 0.1 }} style={{ originX: '32px', originY: '32px' }} />
        <motion.circle cx="32" cy="32" r="20" fill="none" stroke={accent} strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.2 }} />
        <motion.path d="M 12 32 Q 22 10 32 32 T 52 32" fill="none" stroke="#ffb454" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.9 }} />
        <motion.circle r="3.5" fill="#fff" initial={{ cx: 52, cy: 32, opacity: 0 }} animate={{ cx: 32, cy: 12, opacity: 1 }} transition={{ ...spring.gentle, delay: 1.1 }} />
      </svg>
    </span>
  )
}

export const CIRCULO_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  observe: Observe,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
