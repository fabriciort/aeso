'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Minus, Plus } from 'lucide-react'
import {
  apply,
  applyAll,
  holdsAt,
  isSolved,
  itemsOf,
  opText,
  shuffled,
  side,
  stepOptions,
  toSay,
  toTex,
  valueOf,
  WHERE_TEXT,
  type Equation,
  type Op,
  type Option,
  type Verdict,
} from '@/lib/math/equations'
import { fmt, texNum } from '@/lib/math/view'
import { spring } from '@/lib/motion'
import { haptic } from '@/lib/observatory/immersive'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Burst } from '@/components/instruments/DragSurface'
import { Tex } from '@/components/math/Tex'
import { Button, Choice, Slider } from '@/components/observatory/ui'
import { StepFrame, useLive, useScenes, type StepProps } from '../runtime'
import {
  ALL_SOL,
  F_C,
  F_EQ,
  IMAGINE_X,
  MAX_PAN,
  NO_SOL,
  PREVEJA_EQ,
  PREVEJA_X,
  PROBLEMS,
  RIDE_EQ,
  RIDE_KM,
  SOURCES,
  type EqLive,
  type Fx,
  type NbLine,
  type View,
} from './shared'

// "Equações na balança". The Palco is continuous (Stage.tsx): each Etapa
// describes what it shows (a View in live.view) and holds the controls.

// ------------------------------------------------------------------ helpers

let fxSeq = 1

/** Publishes the View of the current Cena to the Palco. */
function useView(view: View) {
  const [, setLive] = useLive<EqLive>()
  const key = JSON.stringify(view)
  useEffect(() => {
    setLive({ view: JSON.parse(key) as View })
  }, [key, setLive])
}

/** setTimeout that is cleared when the Etapa unmounts. */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
}

function Chip({ active, onClick, children, disabled }: { active?: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring h-10 rounded-full border px-3.5 text-[13.5px] transition-all active:scale-95 disabled:opacity-35',
        active ? 'border-white/30 bg-white/[0.14] text-white' : 'border-white/[0.08] bg-white/[0.04] text-white/75',
      )}
    >
      {children}
    </button>
  )
}

function ShowMe({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn('min-h-[44px] text-[13px] text-white/40 underline-offset-4 hover:text-white/70 hover:underline', className)}>
      Me mostre
    </button>
  )
}

function Dot({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-white/50">
      <motion.span
        animate={{ scale: done ? 1 : 0.8, backgroundColor: done ? 'rgb(123,216,143)' : 'rgba(255,255,255,0.15)' }}
        transition={spring.snappy}
        className="grid h-5 w-5 place-items-center rounded-full"
      >
        {done && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
      </motion.span>
      {label}
    </span>
  )
}

/** One operation of the Raciocinador: the move in notation, where below. */
function OpButton({ o, state, disabled, onClick }: { o: Option; state: 'correct' | 'wrong' | null; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={() => {
        haptic(8)
        onClick()
      }}
      disabled={disabled}
      aria-label={o.say}
      className={cn(
        'focus-ring flex h-[50px] w-full flex-col items-center justify-center rounded-2xl border px-2 leading-none transition-all duration-200 active:scale-[0.98]',
        !state && 'border-white/[0.08] bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]',
        state === 'correct' && 'border-emerald-300/50 bg-emerald-400/10 text-white',
        state === 'wrong' && 'border-rose-300/40 bg-rose-400/[0.08] text-white/70',
        disabled && !state && 'opacity-50',
      )}
    >
      <span className="text-[17px]">
        <Tex say={o.say}>{o.tex}</Tex>
      </span>
      <span className="mt-1 text-[11px] text-white/50">{o.sub}</span>
    </button>
  )
}

const noteOf = (op: Op, v: string) => (op.kind === 'expand' ? 'abrir parênteses' : `${opText(op, v)} ${op.where === 'both' ? 'nos dois lados' : WHERE_TEXT[op.where]}`)

const MEH_NOTE: Partial<Record<Verdict, string>> = { detour: 'não ajuda', messy: 'frações', stuck: 'não existe', coefNotLoose: 'não ajuda' }

// ------------------------------------------------------------------ Raciocinador

interface Saved {
  ops: Op[]
  errors: number
  shown: number
}

interface Attempt {
  o: Option
  eq: Equation
  n: number
}

/**
 * The Raciocinador: the state of one equation (operations applied so far),
 * the options for the next move, the attempt in progress (a wrong move is
 * shown for a moment, then undone) and the lines of the caderno.
 */
function useReasoner(props: StepProps, pid: string, start: Equation, X: number, v: string, opts: { max?: number; allow?: Verdict[] } = {}) {
  const { answers, setAnswer } = props
  const key = `r:${pid}`
  const saved: Saved = (answers[key] as Saved | undefined) ?? { ops: [], errors: 0, shown: 0 }
  const eq = applyAll(start, saved.ops)
  const solved = isSolved(eq)
  const canonical = stepOptions(eq, v, 6)
  const allowed = canonical.filter((o) => !opts.allow || opts.allow.includes(o.verdict)).slice(0, opts.max ?? 3)
  const options = shuffled(allowed, toTex(eq, v))
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [feedback, setFeedback] = useState<Option | null>(null)
  const [wrong, setWrong] = useState<string[]>([])
  const [fx, setFx] = useState<Fx | null>(null)
  const later = useLater()
  const steps = saved.ops.length

  useEffect(() => {
    setWrong([])
    setAttempt(null)
  }, [pid, steps])
  useEffect(() => {
    setFeedback(null)
    setFx(null)
  }, [pid])

  const pick = (o: Option, viaShowMe = false) => {
    setFeedback(o)
    if (o.verdict === 'good') {
      haptic(isSolved(apply(eq, o.op)) ? [14, 60, 20] : [10, 40, 10])
      setAttempt(null)
      const onBalloons = o.op.kind === 'add' && o.op.c > 0 && (itemsOf(eq.l).balloons > 0 || itemsOf(eq.r).balloons > 0)
      setFx(o.op.kind === 'div' ? { id: fxSeq++, kind: 'split', k: o.op.k, where: 'both' } : onBalloons ? { id: fxSeq++, kind: 'cancel' } : null)
      setAnswer(key, { ...saved, ops: [...saved.ops, o.op], shown: saved.shown + (viaShowMe ? 1 : 0) })
      return
    }
    haptic(20)
    setWrong((w) => [...w, o.id])
    setAnswer(key, { ...saved, errors: saved.errors + 1 })
    const next = apply(eq, o.op)
    const n = fxSeq++
    const shows = !holdsAt(next, X) && next.l.x >= 0 && next.r.x >= 0
    setFx(shows && o.op.kind === 'div' ? { id: n, kind: 'split', k: o.op.k, where: o.op.where } : shows ? null : { id: n, kind: 'wobble' })
    setAttempt({ o, eq: next, n })
    later(() => setAttempt((a) => (a && a.n === n ? null : a)), 2600)
  }
  const showMe = () => {
    const good = canonical.find((o) => o.verdict === 'good')
    if (good) pick(good, true)
  }

  const lines: NbLine[] = [{ id: `${pid}-0`, tex: toTex(start, v), say: toSay(start, v) }]
  let cur = start
  saved.ops.forEach((op, i) => {
    cur = apply(cur, op)
    lines.push({ id: `${pid}-${i + 1}`, tex: toTex(cur, v), say: toSay(cur, v), note: noteOf(op, v), tone: isSolved(cur) ? 'done' : undefined })
  })
  if (attempt) {
    const breaks = !holdsAt(attempt.eq, X)
    lines.push({
      id: `${pid}-try-${attempt.n}`,
      tex: toTex(attempt.eq, v, breaks ? '\\neq' : '='),
      say: toSay(attempt.eq, v, breaks ? 'diferente de' : 'igual a'),
      note: breaks ? noteOf(attempt.o.op, v) : MEH_NOTE[attempt.o.verdict],
      tone: breaks ? 'bad' : 'meh',
    })
  }
  const viewEq = attempt && !holdsAt(attempt.eq, X) && attempt.eq.l.x >= 0 && attempt.eq.r.x >= 0 ? attempt.eq : eq

  return { eq, solved, options, canonical, attempt, feedback, wrong, fx, pick, showMe, lines, viewEq, saved }
}

/** Why a move works or not, in one or two short sentences. */
function why(o: Option, eq: Equation, v: string): React.ReactNode {
  const op = o.op
  const side = (w: string) => (w === 'left' ? 'na esquerda' : 'na direita')
  switch (o.verdict) {
    case 'good':
      if (op.kind === 'expand') return <>Isso: o {fmt(eq.l.m !== 1 ? eq.l.m : eq.r.m)} multiplica cada termo dos parênteses.</>
      if (op.kind === 'div')
        return Number.isInteger(op.k) ? <>Isso: {op.k} grupos iguais de cada lado, e fica um de cada.</> : <>Isso: dividir os dois lados por {fmt(op.k)} desfaz o ×{fmt(op.k)}.</>
      if (op.x !== 0) return <>Isso: tirar {Math.abs(op.x)} {Math.abs(op.x) === 1 ? 'caixa' : 'caixas'} de cada lado mantém o equilíbrio.</>
      if (op.c > 0 && (itemsOf(eq.l).balloons > 0 || itemsOf(eq.r).balloons > 0)) return <>Isso: {opText(op)} dos dois lados. Cada peso que entra cancela um balão.</>
      return <>Isso: {opText(op)} dos dois lados, e a balança continua reta.</>
    case 'breaks':
      return <>Ótimo erro para aprender: mexer só {side(op.where)} deixa os lados diferentes, e a balança tomba.</>
    case 'detour':
      return <>Pode, a balança fica reta, mas o <Tex>{v}</Tex> continua acompanhado. Tire o que está junto dele.</>
    case 'messy':
    {
      const k = op.kind === 'div' ? op.k : 1
      const odd = [eq.l.m * eq.l.c, eq.r.m * eq.r.c, eq.l.m * eq.l.x, eq.r.m * eq.r.x].find((n) => n !== 0 && Math.abs(n / k - Math.round(n / k)) > 1e-9) ?? 1
      return (
        <>
          Pode, mas {fmt(odd)} ÷ {fmt(k)} não dá exato: viram frações. Tire os números soltos antes.
        </>
      )
    }
    case 'stuck':
      return <>Não dá: um dos lados não tem {op.kind === 'add' ? Math.abs(op.x) : 0} caixas. Tire de cada lado o que os dois têm.</>
    case 'coefNotLoose':
      return (
        <>
          Não há números soltos: <Tex>{`${texNum(op.kind === 'add' ? -op.c : 1)}${v}`}</Tex> é {fmt(op.kind === 'add' ? -op.c : 1)} vezes <Tex>{v}</Tex>. Para desfazer uma multiplicação, divida.
        </>
      )
    case 'wrongExpand':
      return <>Ótimo erro para aprender: o número de fora multiplica os dois termos. Conte os balões!</>
  }
}

function ReasonerControls({ r, onShowMe, cols = 2 }: { r: ReturnType<typeof useReasoner>; onShowMe?: () => void; cols?: 1 | 2 }) {
  return (
    <div className={cn('grid gap-2', cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {r.options.map((o) => (
        <OpButton
          key={o.id}
          o={o}
          state={r.wrong.includes(o.id) ? 'wrong' : r.feedback?.id === o.id && o.verdict === 'good' ? 'correct' : null}
          disabled={r.wrong.includes(o.id)}
          onClick={() => r.pick(o)}
        />
      ))}
      {onShowMe && (
        <button
          onClick={onShowMe}
          className="focus-ring h-[50px] rounded-2xl border border-dashed border-white/[0.12] text-[13px] text-white/45 transition hover:text-white/75 active:scale-[0.98]"
        >
          Me mostre o passo
        </button>
      )}
    </div>
  )
}

const T = ({ children, say }: { children: string; say?: string }) => <Tex say={say}>{children}</Tex>

// ------------------------------------------------------------ 1. Imagine

export function Imagine(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 3, 'imagineScene')
  const [live, setLive] = useLive<EqLive>()
  const pans = live.pans ?? { L: 0, R: 0 }
  const done = Boolean(answers.imagineDone)
  const hasBox = scene >= 1
  const balanced = hasBox && IMAGINE_X + pans.L === pans.R
  const later = useLater()
  const [celebrate, setCelebrate] = useState(false)

  // Each Cena starts from a clean balance (scene 2 keeps the answer).
  useEffect(() => {
    if (scene === 1 && !done) setLive({ pans: { L: 0, R: 0 } })
    if (scene === 2) setLive({ pans: { L: 0, R: IMAGINE_X } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])
  useEffect(() => {
    if (scene === 1 && balanced && !done) {
      setAnswer('imagineDone', true)
      haptic([14, 60, 20])
      setCelebrate(true)
      later(() => setCelebrate(false), 1100)
      later(() => setScene(2), 1300)
    }
  }, [scene, balanced, done, setAnswer, setScene, later])
  useEffect(() => setReady(scene !== 1 || done), [scene, done, setReady])

  useView({
    key: 'imagine',
    eq: { l: side(hasBox ? 1 : 0, pans.L), r: side(0, pans.R) },
    X: IMAGINE_X,
    label: scene === 2 ? IMAGINE_X : null,
    v: 'x',
    tray: scene < 2,
    nb: [],
    aria: hasBox ? `Caixa misteriosa e ${pans.L} pesos na esquerda; ${pans.R} pesos na direita` : `${pans.L} pesos na esquerda e ${pans.R} na direita`,
  })
  useVegaScreen({
    lab: lab.slug,
    step: 'imagine',
    state: `Cena ${scene + 1}/3. ${hasBox ? 'Caixa (x = 4, escondido) na esquerda' : 'Sem caixa'}; pesos: esquerda ${pans.L}, direita ${pans.R}. ${balanced ? 'Equilibrada.' : ''}`,
  })

  const add = (s: 'L' | 'R', d: number) => setLive({ pans: { ...pans, [s]: Math.max(0, Math.min(MAX_PAN, pans[s] + d)) } })

  const captions = [
    <>
      Uma balança de dois pratos: o lado mais pesado <strong>desce</strong>. Arraste pesos de 1 da bandeja para os pratos e sinta como ela reage.
    </>,
    <>
      Esta caixa fechada tem um peso <strong>escondido</strong>, o <T>x</T>. Ponha pesos na direita até a balança ficar <strong>reta</strong>.
    </>,
    <>
      Reta com 4 pesos: a caixa pesa <strong>4</strong>. Equilíbrio quer dizer <strong>igualdade</strong>: os dois lados valem o mesmo.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={0}
      scene={scene}
      caption={captions[scene]}
      nudge={scene === 1 && !done ? 'Olhe qual prato está mais baixo: se é o da caixa, ainda falta peso do outro lado. Ponha um de cada vez.' : undefined}
      controls={
        scene === 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Chip onClick={() => add('L', 1)}>+1 na esquerda</Chip>
            <Chip onClick={() => add('R', 1)}>+1 na direita</Chip>
            <Chip onClick={() => setLive({ pans: { L: 0, R: 0 } })} disabled={!pans.L && !pans.R}>
              Esvaziar
            </Chip>
          </div>
        ) : scene === 1 ? (
          <div className="relative flex flex-wrap items-center gap-2">
            {celebrate && <Burst color={lab.accent} />}
            <Chip onClick={() => add('R', 1)} disabled={done}>
              +1 na direita
            </Chip>
            <Chip onClick={() => add('R', -1)} disabled={done || !pans.R}>
              −1 da direita
            </Chip>
            <span className="ml-auto flex items-center gap-3">
              <Dot done={done} label="Reta" />
              {!done && <ShowMe onClick={() => setLive({ pans: { L: 0, R: IMAGINE_X } })} />}
            </span>
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 2. Preveja

const PREDICT = ['Fica reta', 'Desce a esquerda', 'Desce a direita', 'Depende da caixa']
const ANSWER_A = 2
const ANSWER_B = 0

export function Preveja(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'prevejaScene')
  const a = typeof answers.predA === 'number' ? (answers.predA as number) : null
  const b = typeof answers.predB === 'number' ? (answers.predB as number) : null
  const later = useLater()
  useEffect(() => setReady(scene === 0 ? a !== null : scene === 2 ? b !== null : true), [scene, a, b, setReady])

  const eq = scene === 1 ? apply(PREVEJA_EQ, { kind: 'add', x: 0, c: -3, where: 'left' }) : scene === 3 ? apply(PREVEJA_EQ, { kind: 'add', x: 0, c: -3, where: 'both' }) : PREVEJA_EQ
  useView({
    key: 'preveja',
    eq,
    X: PREVEJA_X,
    label: null,
    v: 'x',
    nb: [],
    aria: scene === 1 ? '2 caixas na esquerda contra 11 pesos' : scene === 3 ? '2 caixas contra 8 pesos' : '2 caixas e 3 pesos contra 11 pesos',
  })
  useVegaScreen({
    lab: lab.slug,
    step: 'preveja',
    state: `Cena ${scene + 1}/4. ${a === null ? 'Ainda não respondeu a 1ª pergunta.' : `1ª: "${PREDICT[a]}" (${a === ANSWER_A ? 'certo' : 'errado'}).`} ${b === null ? '' : `2ª: "${PREDICT[b]}" (${b === ANSWER_B ? 'certo' : 'errado'}).`}`,
  })

  const choose = (k: 'predA' | 'predB', i: number, right: number, next: number) => {
    setAnswer(k, i)
    haptic(i === right ? [10, 40, 10] : 20)
    later(() => setScene(next), 650)
  }
  const grid = (k: 'predA' | 'predB', chosen: number | null, right: number, next: number) => (
    <div className="grid grid-cols-2 gap-2">
      {PREDICT.map((p, i) => (
        <Choice
          key={p}
          selected={chosen === i}
          state={chosen === null ? null : i === right ? 'correct' : chosen === i ? 'wrong' : null}
          disabled={chosen !== null}
          onClick={() => choose(k, i, right, next)}
        >
          <span className="text-[14.5px]">{p}</span>
        </Choice>
      ))}
    </div>
  )

  const captions = [
    <>
      Reta: 2 caixas e 3 pesos contra 11 pesos. Se eu tirar <strong>3 pesos só da esquerda</strong>, a balança…
    </>,
    a === ANSWER_A ? (
      <>
        <strong>Isso!</strong> A esquerda perdeu 3 e ficou mais leve: a direita desce. Mexer de um lado só <strong>quebra a igualdade</strong>.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender!</strong> A esquerda perdeu 3 e ficou mais leve, então a direita desce. Mexer de um lado só quebra a igualdade.
      </>
    ),
    <>
      Os pesos voltaram. E se eu tirar <strong>3 pesos dos dois lados</strong>?
    </>,
    b === ANSWER_B ? (
      <>
        <strong>Fica reta!</strong> Os dois lados perderam o mesmo, então continuam iguais: 2 caixas contra 8 pesos.
      </>
    ) : (
      <>
        <strong>Ótimo erro para aprender:</strong> os dois lados perderam 3, então continuam iguais. Fica reta: 2 caixas contra 8 pesos.
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
          ? 'A balança está reta: 2 caixas e 3 pesos contra 11 pesos. Se eu tirar 3 pesos só da esquerda, a balança fica reta, desce a esquerda, desce a direita, ou depende da caixa?'
          : scene === 2
            ? 'E se eu tirar 3 pesos dos dois lados? Fica reta, desce a esquerda, desce a direita, ou depende da caixa?'
            : undefined
      }
      controls={scene === 0 ? grid('predA', a, ANSWER_A, 1) : scene === 2 ? grid('predB', b, ANSWER_B, 3) : null}
    />
  )
}

// ------------------------------------------------------------ 3. Entenda

export function Entenda(props: StepProps) {
  const { lab, setReady } = props
  const [scene, setScene] = useScenes(props, 5, 'entendaScene')
  const r = useReasoner(props, 'entenda', PREVEJA_EQ, PREVEJA_X, 'x', { allow: ['good'], max: 1 })
  const later = useLater()
  const steps = r.saved.ops.length
  const doneHere = scene === 1 ? steps >= 1 : scene === 3 ? r.solved : true
  useEffect(() => setReady(doneHere), [doneHere, setReady])

  const pick = () => {
    const o = r.options[0]
    if (!o) return
    r.pick(o)
    const next = scene + 1
    later(() => setScene(next), scene === 3 ? 2100 : 1400)
  }

  const lines: NbLine[] = r.lines.map((l, i) => (i === 0 ? { ...l, parts: ['2x', '+\\;3', '=', '11'] } : l))
  useView({
    key: 'entenda',
    eq: r.viewEq,
    X: PREVEJA_X,
    label: r.solved && scene >= 3 ? PREVEJA_X : null,
    v: 'x',
    nb: scene >= 1 ? lines.slice(0, Math.max(1, steps + 1)) : lines.slice(0, 1),
    read: scene === 0 ? 1 : undefined,
    fx: r.fx,
    badges:
      scene === 2
        ? [
            { tex: '+3 \\;\\leftrightarrow\\; -3', say: 'mais 3 se desfaz com menos 3' },
            { tex: '\\times 2 \\;\\leftrightarrow\\; \\div 2', say: 'vezes 2 se desfaz com dividir por 2' },
          ]
        : undefined,
    aria: `Balança lida como ${toSay(r.eq)}`,
  })
  useVegaScreen({ lab: lab.slug, step: 'entenda', state: `Cena ${scene + 1}/5. Caderno: ${r.lines.map((l) => l.say).join('; ')}.` })

  const captions = [
    <>
      Cada caixa vale <T>x</T> e cada peso vale 1. O equilíbrio é o sinal de igual. Lida em voz alta, a balança diz: <T say="2 x mais 3 igual a 11">2x + 3 = 11</T>.
    </>,
    steps >= 1 ? (
      <>
        Os pesos voaram dos <strong>dois</strong> pratos e a balança ficou reta. No caderno: <T say="2 x igual a 8">2x = 8</T>.
      </>
    ) : (
      <>
        <strong>Regra de ouro:</strong> o que você faz de um lado, faz do outro. Tire os 3 pesos soltos.
      </>
    ),
    <>
      Os 3 entraram somando; tirar 3 desfaz. São <strong>operações inversas</strong>: tirar desfaz pôr, dividir desfaz multiplicar.
    </>,
    r.solved ? (
      <>Formando grupos iguais…</>
    ) : (
      <>
        Sobraram 2 caixas contra 8 pesos. Separe cada lado em <strong>2 grupos iguais</strong> e fique com um.
      </>
    ),
    <>
      Um grupo de cada lado: 1 caixa = 4 pesos. Então <T say="x igual a 4">x = 4</T>, o mesmo peso que a balança mostrou no começo.
    </>,
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={2}
      scene={scene}
      caption={captions[scene]}
      nudge={(scene === 1 || scene === 3) && !doneHere ? 'Toque no botão e olhe os dois pratos ao mesmo tempo.' : undefined}
      controls={
        (scene === 1 || scene === 3) && !doneHere && r.options[0] ? (
          <Button size="lg" className="w-full" onClick={pick}>
            <Tex say={r.options[0].say}>{r.options[0].tex}</Tex> <span className="font-normal">{r.options[0].sub}</span>
          </Button>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 4. No mundo real

const RIDE = ['12 km', '17 km', '14,5 km', '24 km']
const RIDE_ANSWER = 0
const RIDE_WHY = [
  'Exato: tire os R$ 5 fixos (sobram 24) e divida por R$ 2 o km.',
  '17 vem de somar os R$ 5. A tarifa fixa já está nos 29: tire 5 (sobram 24) e divida por 2.',
  '14,5 é 29 ÷ 2: esqueceu a tarifa fixa. Tire os 5 antes (sobram 24) e divida por 2.',
  '24 é o que custaram os km, a R$ 2 cada. Falta dividir por 2.',
]

export function MundoReal(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene, setScene] = useScenes(props, 4, 'mundoScene')
  const f = useReasoner(props, 'f', F_EQ, F_C, 'C', { allow: ['good', 'messy', 'coefNotLoose'], max: 2 })
  const ride = useReasoner(props, 'ride', RIDE_EQ, RIDE_KM, 'k', { allow: ['good'], max: 1 })
  const ridePick = typeof answers.ride === 'number' ? (answers.ride as number) : null
  const later = useLater()

  useEffect(() => {
    if (scene === 1 && f.solved && !answers.fAdvanced) {
      setAnswer('fAdvanced', true)
      later(() => setScene(2), 1600)
    }
  }, [scene, f.solved, answers.fAdvanced, setAnswer, setScene, later])
  // After the guess, the balance solves the ride by itself, one step at a time.
  const rideSteps = ride.saved.ops.length
  useEffect(() => {
    if (scene !== 3 || ridePick === null || ride.solved) return
    const t = setTimeout(() => ride.showMe(), rideSteps === 0 ? 700 : 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, ridePick, rideSteps, ride.solved])
  useEffect(() => setReady(scene === 1 ? f.solved : scene === 3 ? ridePick !== null : true), [scene, f.solved, ridePick, setReady])

  const rule: NbLine = { id: 'rule', tex: 'F = 1{,}8\\,C + 32', say: 'F igual a 1 vírgula 8 C mais 32', note: 'definição', tone: 'rule' }
  const isRide = scene === 3
  useView(
    isRide
      ? {
          key: 'ride',
          eq: ride.viewEq,
          X: RIDE_KM,
          label: ride.solved ? RIDE_KM : null,
          v: 'k',
          blocks: 29,
          fx: ride.fx,
          nb: ridePick === null ? ride.lines.slice(0, 1) : ride.lines,
          nbTitle: 'exemplo imaginado',
          aria: 'Balança de blocos: 2 vezes k mais 5 contra 29',
        }
      : {
          key: 'fahrenheit',
          eq: f.viewEq,
          X: F_C,
          label: f.solved ? F_C : null,
          v: 'C',
          blocks: 98.6,
          fx: f.fx,
          thermo: { F: 98.6, showC: scene >= 2 },
          nb: scene === 0 ? [rule] : [rule, ...f.lines],
          aria: 'Termômetro em 98,6 graus Fahrenheit e balança de blocos: 1,8 C mais 32 contra 98,6',
        },
  )
  useVegaScreen({
    lab: lab.slug,
    step: 'mundo-real',
    state: isRide
      ? `Exemplo imaginado da corrida: 2k + 5 = 29. ${ridePick === null ? 'Ainda não respondeu.' : `Respondeu ${RIDE[ridePick]} (${ridePick === RIDE_ANSWER ? 'certo' : 'errado'}).`}`
      : `Cena ${scene + 1}/4. Termômetro em 98,6 °F. Caderno: ${f.lines.map((l) => l.say).join('; ')}.`,
  })

  const fCaption = f.feedback ? (
    <>
      {why(f.feedback, applyAll(F_EQ, f.saved.ops.slice(0, f.feedback.verdict === 'good' ? -1 : undefined)), 'C')} {f.solved ? '' : f.feedback.verdict === 'good' ? 'E agora?' : ''}
    </>
  ) : (
    <>
      Com F = 98,6 a balança fica <T say="1 vírgula 8 C mais 32 igual a 98 vírgula 6">{'1{,}8C + 32 = 98{,}6'}</T>. Desfaça na ordem inversa: qual o primeiro passo?
    </>
  )

  const captions = [
    <>
      Nos EUA, a febre é medida em °F. Um termômetro marca <strong>98,6 °F</strong>. As escalas se ligam pela regra <T say="F igual a 1 vírgula 8 C mais 32">{'F = 1{,}8C + 32'}</T>.
    </>,
    fCaption,
    <>
      <strong>C = 37:</strong> os famosos 37 °C, sem febre. A conta é exata, porque a regra vem da definição das duas escalas.
    </>,
    ridePick === null ? (
      <>
        <em>Exemplo imaginado:</em> uma corrida de app cobra R$ 5 fixos + R$ 2 por km e deu R$ 29. Quantos km?
      </>
    ) : (
      <>
        <strong>{ridePick === RIDE_ANSWER ? 'Isso!' : 'Era 12 km.'}</strong> {RIDE_WHY[ridePick]}
      </>
    ),
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={3}
      scene={scene * 10 + (scene === 1 ? f.saved.ops.length : 0) + (f.feedback && scene === 1 ? 0.5 : 0)}
      caption={captions[scene]}
      narration={
        scene === 0
          ? 'Nos Estados Unidos, a febre é medida em graus Fahrenheit. Um termômetro marca 98,6 graus. As escalas se ligam pela regra: F é igual a 1,8 vezes C, mais 32.'
          : scene === 3 && ridePick === null
            ? 'Exemplo imaginado: uma corrida de aplicativo cobra 5 reais fixos mais 2 reais por quilômetro, e deu 29 reais. Quantos quilômetros? 12, 17, 14 e meio, ou 24?'
            : undefined
      }
      nudge={scene === 1 && !f.solved ? 'O C foi multiplicado por 1,8 e depois ganhou + 32. Para voltar ao C, desfaça primeiro o que foi feito por último.' : undefined}
      controls={
        scene === 1 && !f.solved ? (
          <ReasonerControls r={f} />
        ) : scene === 3 && ridePick === null ? (
          <div className="grid grid-cols-2 gap-2">
            {RIDE.map((o, i) => (
              <Choice
                key={o}
                onClick={() => {
                  haptic(i === RIDE_ANSWER ? [10, 40, 10] : 20)
                  setAnswer('ride', i)
                }}
              >
                <span className="font-mono text-[14.5px]">{o}</span>
              </Choice>
            ))}
          </div>
        ) : null
      }
    />
  )
}

// ------------------------------------------------------------ 5. Resolva

type P3 = { tries: number; ok: boolean; shown: boolean; last: number | null }

export function Resolva(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, PROBLEMS.length, 'resolvaScene')
  const prob = PROBLEMS[scene]
  const solo = prob.support === 0
  const r = useReasoner(props, prob.id, prob.eq, prob.x, 'x', { max: 3 })
  const p3: P3 = (answers.p3 as P3 | undefined) ?? { tries: 0, ok: false, shown: false, last: null }
  const [guess, setGuess] = useState(() => (typeof answers.p3guess === 'number' ? (answers.p3guess as number) : 1))
  const [celebrate, setCelebrate] = useState(false)
  const later = useLater()

  const complete = solo ? p3.ok || (p3.shown && r.solved) : r.solved
  useEffect(() => setReady(complete), [complete, setReady])

  // "Me mostre" in the solo problem: the Raciocinador plays every step.
  const playing = solo && p3.shown && !r.solved
  const steps = r.saved.ops.length
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => r.showMe(), steps === 0 ? 500 : 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, steps])

  const check = () => {
    const ok = guess === prob.x
    setAnswer('p3', { ...p3, tries: p3.tries + 1, ok: p3.ok || ok, last: guess })
    haptic(ok ? [14, 60, 20] : 20)
    if (ok) {
      setCelebrate(true)
      later(() => setCelebrate(false), 1100)
    }
  }
  const setG = (g: number) => {
    const v = Math.max(0, Math.min(12, g))
    setGuess(v)
    setAnswer('p3guess', v)
  }

  // What the Palco shows.
  const tested = solo && !p3.shown && p3.last !== null ? p3.last : null
  const sideVal = (g: number, s: 'l' | 'r') => valueOf(prob.eq[s], g)
  const checkLines: NbLine[] =
    tested !== null
      ? [
          {
            id: `p3-check-${p3.tries}`,
            tex: `x = ${tested}:\\;\\; ${sideVal(tested, 'l')} ${tested === prob.x ? '=' : '\\neq'} ${sideVal(tested, 'r')}`,
            say: `com x igual a ${tested}, a esquerda pesa ${sideVal(tested, 'l')} e a direita ${sideVal(tested, 'r')}`,
            tone: tested === prob.x ? 'done' : 'bad',
            note: tested === prob.x ? 'confere' : 'não confere',
          },
        ]
      : []
  useView({
    key: prob.id,
    eq: solo && !p3.shown ? prob.eq : r.viewEq,
    X: tested ?? prob.x,
    label: tested ?? (complete ? prob.x : null),
    v: 'x',
    fx: solo && !p3.shown ? null : r.fx,
    readout: tested !== null,
    nb: solo && !p3.shown ? [r.lines[0], ...checkLines] : r.lines,
    nbTitle: `problema ${scene + 1} de ${PROBLEMS.length}`,
    aria: `Problema ${scene + 1}: ${toSay(r.eq)}`,
  })
  useVegaScreen({
    lab: lab.slug,
    step: 'resolva',
    state: `Problema ${scene + 1}/3: ${toSay(prob.eq)}. Estado: ${toSay(r.eq)}. ${complete ? 'Resolvido.' : ''} ${
      r.feedback && r.feedback.verdict !== 'good' ? `Último erro: ${r.feedback.say} (${r.feedback.verdict}).` : ''
    } ${solo && p3.last !== null ? `Testou x = ${p3.last}.` : ''}`,
  })

  const hint = (): React.ReactNode => {
    const good = r.canonical.find((o) => o.verdict === 'good')
    if (!good || prob.support < 2) return 'Qual é o próximo passo?'
    if (good.op.kind === 'div') return 'Dica: as caixas estão sozinhas. Como ficar com uma só?'
    return 'Dica: comece pelos pesos soltos que estão junto das caixas.'
  }
  const statement = <T say={toSay(prob.eq)}>{toTex(prob.eq)}</T>

  let caption: React.ReactNode
  if (solo) {
    if (p3.shown) caption = r.solved ? <>Veja o caminho: abrir os parênteses, tirar 2 caixas, cancelar os balões e dividir por 2. <strong>x = 5</strong>.</> : <>Olhe a balança e o caderno: um passo de cada vez…</>
    else if (p3.ok) caption = <><strong>Sozinho, e certo: x = 5!</strong> Os dois lados pesam 16. Cada balão puxou 1 para cima.</>
    else if (tested !== null) {
      const L = sideVal(tested, 'l')
      const R = sideVal(tested, 'r')
      caption = (
        <>
          Com <T>{`x = ${tested}`}</T>, a esquerda pesa {L} e a direita {R}: {L < R ? 'a direita desce' : 'a esquerda desce'}. Tente um <T>x</T> {tested < prob.x ? 'maior' : 'menor'}.
        </>
      )
    } else
      caption = (
        <>
          Agora sozinho: {statement}. Cada balão de hélio vale −1 (puxa para cima). Resolva e confira o seu <T>x</T>.
        </>
      )
  } else if (r.solved) {
    caption = (
      <>
        <strong>Resolvido: x = {prob.x}!</strong> Confira: com <T>{`x = ${prob.x}`}</T>, os dois lados pesam {valueOf(prob.eq.l, prob.x)}. Continue para o próximo.
      </>
    )
  } else if (r.feedback) {
    const prev = applyAll(prob.eq, r.saved.ops.slice(0, r.feedback.verdict === 'good' ? -1 : undefined))
    caption = (
      <>
        {why(r.feedback, prev, 'x')} {r.feedback.verdict === 'good' ? 'E agora?' : ''}
      </>
    )
  } else
    caption = (
      <>
        Problema {scene + 1} de 3: {statement}. {hint()}
      </>
    )

  return (
    <StepFrame
      lab={lab}
      stepIndex={4}
      scene={scene * 100 + steps * 2 + (r.feedback ? 1 : 0) + (solo ? p3.tries * 3 : 0)}
      caption={caption}
      nudge={
        !complete && !solo && r.wrong.length >= 1
          ? 'Olhe o que está grudado no x: primeiro some com os pesos soltos, depois desfaça a multiplicação.'
          : !complete && solo
            ? 'Faça como antes: abra os parênteses, junte as caixas de um lado, desfaça os balões e divida.'
            : undefined
      }
      controls={
        complete ? null : solo ? (
          p3.shown ? null : (
            <div className="relative space-y-1">
              {celebrate && <Burst color={lab.accent} />}
              <div className="flex items-center gap-2">
                <button aria-label="Diminuir x" onClick={() => setG(guess - 1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 active:scale-95">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-[19px] text-white" aria-live="polite">
                  <T>{`x = ${guess}`}</T>
                </span>
                <button aria-label="Aumentar x" onClick={() => setG(guess + 1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 active:scale-95">
                  <Plus className="h-4 w-4" />
                </button>
                <Button className="ml-auto" onClick={check}>
                  Conferir
                </Button>
              </div>
              {p3.tries > 0 && <ShowMe onClick={() => setAnswer('p3', { ...p3, shown: true })} />}
            </div>
          )
        ) : (
          <ReasonerControls r={r} onShowMe={r.showMe} />
        )
      }
    />
  )
}

// ------------------------------------------------------------ 6. E se…?

const Q_NONE = ['Sim, x = 3', 'Sim, um x enorme', 'Nenhum x', 'Qualquer x']
const Q_NONE_ANSWER = 2
const Q_ALL = ['Nenhum', 'Só x = 1', 'Só x = 2', 'Todos']
const Q_ALL_ANSWER = 3

export function ESe(props: StepProps) {
  const { lab, setReady, setAnswer, answers } = props
  const [scene] = useScenes(props, 4, 'eseScene')
  const [x, setX] = useState(() => (typeof answers.eseX === 'number' ? (answers.eseX as number) : 2))
  const seenA = Array.isArray(answers.seenA) ? (answers.seenA as number[]) : []
  const seenB = Array.isArray(answers.seenB) ? (answers.seenB as number[]) : []
  const qa = typeof answers.qNone === 'number' ? (answers.qNone as number) : null
  const qb = typeof answers.qAll === 'number' ? (answers.qAll as number) : null
  const [phase, setPhase] = useState(qb !== null ? 2 : 0)
  const later = useLater()
  const first = scene < 2
  const seen = first ? seenA : seenB
  const explored = seen.length >= 4

  useEffect(() => setReady(scene === 0 || scene === 2 ? explored : scene === 1 ? qa !== null : qb !== null), [scene, explored, qa, qb, setReady])

  const move = (v: number) => {
    const n = Math.round(v)
    setX(n)
    setAnswer('eseX', n)
    if (!seen.includes(n)) {
      setAnswer(first ? 'seenA' : 'seenB', [...seen, n])
      if (seen.length === 3) haptic([10, 40, 10])
    }
  }
  const answerAll = (i: number) => {
    setAnswer('qAll', i)
    haptic(i === Q_ALL_ANSWER ? [10, 40, 10] : 20)
    setPhase(1)
    later(() => setPhase(2), 1500)
  }

  const minusBox = { kind: 'add', x: -1, c: 0, where: 'both' } as const
  const expand = { kind: 'expand', where: 'left' } as const
  let eq: Equation
  let nb: NbLine[]
  if (first) {
    const reduced = apply(NO_SOL, minusBox)
    eq = scene === 1 && qa !== null ? reduced : NO_SOL
    nb = [{ id: 'none-0', tex: toTex(NO_SOL), say: toSay(NO_SOL) }]
    if (scene === 1 && qa !== null) nb.push({ id: 'none-1', tex: '2 = 5', say: '2 igual a 5: falso', note: 'falso para todo x', tone: 'bad' })
  } else {
    const ex = apply(ALL_SOL, expand)
    const fin = apply(ex, { kind: 'add', x: -2, c: 0, where: 'both' })
    eq = scene === 3 && qb !== null ? (phase >= 2 ? fin : ex) : ALL_SOL
    nb = [{ id: 'all-0', tex: toTex(ALL_SOL), say: toSay(ALL_SOL) }]
    if (scene === 3 && qb !== null) {
      nb.push({ id: 'all-1', tex: toTex(ex), say: toSay(ex), note: 'abrir parênteses' })
      if (phase >= 2) nb.push({ id: 'all-2', tex: '2 = 2', say: '2 igual a 2: sempre verdade', note: 'sempre verdade', tone: 'done' })
    }
  }
  useView({
    key: first ? 'nosol' : 'allsol',
    eq,
    X: x,
    label: x,
    v: 'x',
    readout: true,
    nb,
    aria: first ? `x mais 2 contra x mais 5, com x igual a ${x}` : `2 vezes x mais 1 contra 2 x mais 2, com x igual a ${x}`,
  })
  useVegaScreen({
    lab: lab.slug,
    step: 'e-se',
    state: `Cena ${scene + 1}/4. ${first ? 'x + 2 = x + 5' : '2(x + 1) = 2x + 2'} com x = ${x}; esquerda ${fmt(valueOf(eq.l, x))}, direita ${fmt(valueOf(eq.r, x))}. Valores testados: ${seen.join(', ') || 'nenhum'}.`,
  })

  const slider = (
    <div className="space-y-2.5">
      <Slider label="Valor escondido de cada caixa" min={0} max={10} step={1} value={x} onChange={move} display={`x = ${x}`} />
      <Dot done={explored} label={explored ? 'Explorou' : `Teste 4 valores (${seen.length}/4)`} />
    </div>
  )
  const grid = (opts: string[], chosen: number | null, right: number, onPick: (i: number) => void) => (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((o, i) => (
        <Choice key={o} selected={chosen === i} state={chosen === null ? null : i === right ? 'correct' : chosen === i ? 'wrong' : null} disabled={chosen !== null} onClick={() => onPick(i)}>
          <span className="text-[14.5px]">{o}</span>
        </Choice>
      ))}
    </div>
  )

  const captions = [
    <>
      Uma balança teimosa: <T say="x mais 2 igual a x mais 5">x + 2 = x + 5</T>. Gire o valor de <T>x</T> e procure um que a deixe reta.
    </>,
    qa === null ? (
      <>Existe algum valor de <T>x</T> que equilibra essa balança?</>
    ) : (
      <>
        <strong>{qa === Q_NONE_ANSWER ? 'Isso: nenhum.' : 'Nenhum!'}</strong> Tirando uma caixa de cada lado sobra <T say="2 igual a 5">2 = 5</T>, que é falso: <strong>sem solução</strong>.
      </>
    ),
    <>
      Agora <T say="2 vezes, x mais 1, igual a 2 x mais 2">2(x + 1) = 2x + 2</T>. Gire o <T>x</T> de novo e observe a balança.
    </>,
    qb === null ? (
      <>Quantos valores de <T>x</T> deixam essa balança reta?</>
    ) : (
      <>
        <strong>{qb === Q_ALL_ANSWER ? 'Todos!' : 'Todos, na verdade.'}</strong> Abrindo os parênteses os dois lados são iguais; sobra <T say="2 igual a 2">2 = 2</T>: <strong>infinitas soluções</strong>.
      </>
    ),
  ]

  return (
    <StepFrame
      lab={lab}
      stepIndex={5}
      scene={scene * 2 + (scene === 1 ? (qa !== null ? 1 : 0) : scene === 3 ? (qb !== null ? 1 : 0) : 0)}
      caption={captions[scene]}
      nudge={(scene === 0 || scene === 2) && !explored ? 'Arraste o controle e leia os pesos de cada lado no alto do palco. A diferença muda?' : undefined}
      controls={
        scene === 0 || scene === 2
          ? slider
          : scene === 1 && qa === null
            ? grid(Q_NONE, qa, Q_NONE_ANSWER, (i) => {
                setAnswer('qNone', i)
                haptic(i === Q_NONE_ANSWER ? [10, 40, 10] : 20)
              })
            : scene === 3 && qb === null
              ? grid(Q_ALL, qb, Q_ALL_ANSWER, answerAll)
              : null
      }
    />
  )
}

// ------------------------------------------------------------ 7. Conclua

export function Conclua(props: StepProps) {
  const { lab, setReady, answers } = props
  useEffect(() => setReady(true), [setReady])
  const p3 = (answers.p3 as P3 | undefined) ?? { tries: 0, ok: false, shown: false, last: null }
  const summary = PROBLEMS.map((p) => {
    const s = (answers[`r:${p.id}`] as Saved | undefined) ?? { ops: [], errors: 0, shown: 0 }
    const sub =
      p.support === 0
        ? p3.ok
          ? p3.tries === 1
            ? 'sozinho, de 1ª'
            : `sozinho, ${p3.tries} tentativas`
          : 'com o Me mostre'
        : `${s.ops.length} passos${s.errors ? ` · ${s.errors} ${s.errors === 1 ? 'tropeço' : 'tropeços'}` : ''}`
    return { tex: toTex(p.eq), say: toSay(p.eq), x: p.x, sub }
  })
  useView({
    key: 'final',
    eq: { l: side(1, 0), r: side(0, 4) },
    X: 4,
    label: null,
    v: 'x',
    medal: true,
    nbTitle: 'a regra de ouro',
    nb: [
      { id: 'rule-1', tex: 'a = b \\;\\Rightarrow\\; a \\pm c = b \\pm c', say: 'se a é igual a b, então a mais ou menos c é igual a b mais ou menos c', tone: 'rule' },
      { id: 'rule-2', tex: 'a = b \\;\\Rightarrow\\; a \\div k = b \\div k', say: 'e a dividido por k é igual a b dividido por k', note: 'k ≠ 0', tone: 'rule' },
    ],
    aria: 'Balança equilibrada dentro de uma medalha',
  })
  useVegaScreen({ lab: lab.slug, step: 'conclua', state: `Resolveu: ${summary.map((s) => `${s.say}, x = ${s.x} (${s.sub})`).join('; ')}.` })

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
          <span className="mt-1 block text-[15px] text-white/60">O que você faz de um lado, faz do outro.</span>
        </>
      }
      narration={`Conquista desbloqueada: ${lab.achievement?.title}. ${lab.achievement?.description} A regra de ouro: o que você faz de um lado, faz do outro. Próximo: Porcentagem sem susto.`}
      controls={
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {summary.map((s, i) => (
              <motion.div
                key={s.tex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.soft, delay: 0.5 + i * 0.08 }}
                className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2"
              >
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">Problema {i + 1}</p>
                <p className="mt-0.5 text-[15px] text-white">
                  <T say={`x igual a ${s.x}`}>{`x = ${s.x}`}</T>
                </p>
                <p className="truncate text-[10.5px] text-white/45">{s.sub}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-[12.5px] leading-snug text-white/55">
            Próximo na trilha: <strong className="font-medium text-white/80">Porcentagem sem susto</strong> (em breve). Depois, o Ensino médio.
          </p>
          <p className="text-[10.5px] leading-snug text-white/30">{SOURCES}</p>
        </div>
      }
    />
  )
}

export const EQUACOES_STEPS = {
  imagine: Imagine,
  preveja: Preveja,
  entenda: Entenda,
  'mundo-real': MundoReal,
  resolva: Resolva,
  'e-se': ESe,
  conclua: Conclua,
}
