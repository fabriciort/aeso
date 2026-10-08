import { haptic } from '@/lib/observatory/immersive'
import { coefficient, type TaylorFn } from '@/lib/math/taylor'

// State shared by the Etapas and the continuous Palco of "Imitando curvas
// com polinômios": the keys in answers/live, the dials of the copy machine,
// the guided problems of Resolva and the TeX of the growing series.

export type Answers = Record<string, unknown>
export type SetAnswer = (key: string, value: unknown) => void

export type TaylorLive = {
  /** Pendulum angle (rad) chosen on the Palco in Observe. */
  theta?: number
}

export const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

// ------------------------------------------------------------ Imagine: dials

export interface Dial {
  name: string
  target: number
  start: number
  min: number
  max: number
  /** Snaps to the target ("click" of the dial) within this distance. */
  tol: number
}

export const DIALS: Dial[] = [
  { name: 'altura', target: 0, start: 0.6, min: -1.5, max: 1.5, tol: 0.05 },
  { name: 'inclinação', target: 1, start: 0, min: -2, max: 2, tol: 0.07 },
  { name: 'curvatura', target: 0, start: 0.35, min: -1, max: 1, tol: 0.04 },
  { name: 'dobra', target: -1 / 6, start: 0, min: -0.6, max: 0.6, tol: 0.022 },
]

export function dialsOf(answers: Answers): number[] {
  const d = answers.dials
  return DIALS.map((dial, i) => (Array.isArray(d) && typeof d[i] === 'number' ? (d[i] as number) : dial.start))
}

export const dialDone = (dials: number[], i: number) => Math.abs(dials[i] - DIALS[i].target) < 1e-9

/** Moves dial i (clamped); snaps to the target when close, with a haptic click. */
export function setDial(answers: Answers, setAnswer: SetAnswer, i: number, v: number): number[] {
  const d = dialsOf(answers)
  if (dialDone(d, i)) return d
  const dial = DIALS[i]
  let next = Math.min(dial.max, Math.max(dial.min, v))
  if (Math.abs(next - dial.target) < dial.tol) {
    next = dial.target
    haptic([10, 40, 14])
  }
  d[i] = next
  setAnswer('dials', d)
  return d
}

export function showDial(answers: Answers, setAnswer: SetAnswer, i: number) {
  const d = dialsOf(answers)
  d[i] = DIALS[i].target
  setAnswer('dials', d)
}

// ------------------------------------------------------------ Entenda / Observe / E se: counters

export const DERIV_CHAIN = [
  { tex: 'x^3', say: 'x ao cubo' },
  { tex: '3x^2', say: '3 x ao quadrado' },
  { tex: '3\\cdot 2\\,x', say: '3 vezes 2 vezes x' },
  { tex: '3\\cdot 2\\cdot 1 = 3! = 6', say: '3 vezes 2 vezes 1, que é 3 fatorial, igual a 6' },
]
/** Coefficients of x³ and its derivatives. */
export const DERIV_POLYS = [
  [0, 0, 0, 1],
  [0, 0, 3, 0],
  [0, 6, 0, 0],
  [6, 0, 0, 0],
]

export const SIN_MAX = 11
export const EXP_MAX = 7
export const E_TERMS_MAX = 12
export const LN_MAX = 25

export const sinDegOf = (a: Answers) => num(a.sinDeg, 1)
export const expDegOf = (a: Answers) => num(a.expDeg, 0)
export const eTermsOf = (a: Answers) => num(a.eTerms, 1)
export const lnDegOf = (a: Answers) => num(a.lnDeg, 1)
export const derivsOf = (a: Answers) => num(a.derivs, 0)

/** One tap on the Palco (or the button) in the scenes that grow something. */
export function tapAction(stepId: string, scene: number, answers: Answers, setAnswer: SetAnswer): boolean {
  if (stepId === 'entenda' && scene === 0) {
    const d = derivsOf(answers)
    if (d >= 3) return false
    setAnswer('derivs', d + 1)
    haptic(d + 1 === 3 ? [10, 40, 14] : 8)
    return true
  }
  if (stepId === 'entenda' && scene === 1) {
    const d = sinDegOf(answers)
    if (d >= SIN_MAX) return false
    setAnswer('sinDeg', d + 2)
    haptic(8)
    return true
  }
  if (stepId === 'entenda' && scene === 2) {
    const d = expDegOf(answers)
    if (d >= EXP_MAX) return false
    setAnswer('expDeg', d + 1)
    haptic(8)
    return true
  }
  if (stepId === 'observe' && scene === 3) {
    const n = eTermsOf(answers)
    if (n >= E_TERMS_MAX) return false
    setAnswer('eTerms', n + 1)
    haptic(n + 1 === 10 ? [10, 40, 14] : 8)
    return true
  }
  return false
}

// ------------------------------------------------------------ TeX of the series

export interface TexTerm {
  key: string
  tex: string
  say: string
}

const sup = (n: number) => (n === 1 ? 'x' : `x^{${n}}`)

/** Nonzero terms of the series of fn up to degree `deg`, with signs. */
export function seriesTerms(fn: TaylorFn, deg: number): TexTerm[] {
  const out: TexTerm[] = []
  for (let n = 0; n <= deg; n++) {
    const c = coefficient(fn, n)
    if (Math.abs(c) < 1e-15) continue
    const sign = c < 0 ? '-' : out.length ? '+' : ''
    const signSay = c < 0 ? 'menos ' : out.length ? 'mais ' : ''
    let body: string
    let say: string
    if (n === 0) {
      body = '1'
      say = '1'
    } else if (fn === 'geom' || n === 1) {
      body = sup(n)
      say = n === 1 ? 'x' : `x elevado a ${n}`
    } else if (fn === 'ln1p') {
      body = `\\frac{${sup(n)}}{${n}}`
      say = `x elevado a ${n} sobre ${n}`
    } else {
      body = `\\frac{${sup(n)}}{${n}!}`
      say = `x elevado a ${n} sobre ${n} fatorial`
    }
    out.push({ key: `${fn}-${n}`, tex: `${sign}${body}`, say: `${signSay}${say}` })
  }
  return out
}

export const FN_TEX: Record<TaylorFn, { tex: string; say: string; name: string }> = {
  sin: { tex: '\\operatorname{sen} x', say: 'seno de x', name: 'sen x' },
  cos: { tex: '\\cos x', say: 'cosseno de x', name: 'cos x' },
  exp: { tex: 'e^x', say: 'e elevado a x', name: 'eˣ' },
  ln1p: { tex: '\\ln(1+x)', say: 'logaritmo natural de 1 mais x', name: 'ln(1 + x)' },
  geom: { tex: '\\frac{1}{1-x}', say: '1 sobre 1 menos x', name: '1/(1 − x)' },
}

export const GENERAL_TEX = 'f(x) \\approx \\sum_{n=0}^{N} \\frac{f^{(n)}(0)}{n!}\\,x^n'
export const GENERAL_SAY = 'f de x é aproximadamente a soma, de n igual a zero até N, da n-ésima derivada de f em zero, sobre n fatorial, vezes x elevado a n'

// ------------------------------------------------------------ Resolva

export interface SolveOption {
  label: string
  /** The copy this choice would build (drawn on the Palco). */
  poly?: number[]
  /** Value this choice gives at the problem's x (drawn as a dot). */
  value?: number
  /** Error bound this choice claims (drawn as a bracket). */
  bound?: number
  why: string
}

export interface SolveStep {
  id: string
  prompt: string
  options: SolveOption[]
  answer: number
  line: { tex: string; say: string }
  done: string
}

export interface Problem {
  id: string
  fn: TaylorFn
  x: number
  title: string
  steps: SolveStep[]
}

const T3 = [1, 1, 1 / 2, 1 / 6]
const E = Math.E

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    fn: 'exp',
    x: 0.5,
    title: 'Problema 1 · com ajuda',
    steps: [
      {
        id: 'p1a',
        prompt: 'Monte a cópia de grau 3 de eˣ. Passo 1: quanto valem f(0), f′(0), f″(0) e f‴(0)? Lembre: eˣ é a própria derivada.',
        options: [
          { label: '1, 1, 1, 1', poly: T3, why: 'Derivar eˣ dá eˣ de novo, e e⁰ = 1.' },
          { label: '1, 0, 0, 0', poly: [1], why: 'Derivar eˣ não zera: ele é a própria derivada. Veja a cópia reta, que nem sobe.' },
          { label: '0, 1, 2, 3', poly: [0, 1, 1, 0.5], why: 'Isso trata eˣ como uma potência. Veja: a cópia nem passa por (0, 1).' },
          { label: 'e, e, e, e', poly: T3.map((c) => c * E), why: 'Faltou calcular em x = 0: e⁰ = 1, não e. A cópia começa alta demais.' },
        ],
        answer: 0,
        line: { tex: "f(0)=f'(0)=f''(0)=f'''(0)=e^0=1", say: 'f de zero e todas as derivadas em zero valem e elevado a zero, igual a 1' },
        done: 'Isso. Todas as derivadas de eˣ valem 1 em x = 0.',
      },
      {
        id: 'p1b',
        prompt: 'Passo 2: cada dial é a derivada dividida por n!. Então c₀, c₁, c₂, c₃ são…',
        options: [
          { label: '1, 1, ½, ⅙', poly: T3, why: 'Dividindo por 0!, 1!, 2! e 3!.' },
          { label: '1, 1, 1, 1', poly: [1, 1, 1, 1], why: 'Sem o n!, a cópia sobe rápido demais. Veja ela fugir da curva.' },
          { label: '1, 1, ½, ⅓', poly: [1, 1, 1 / 2, 1 / 3], why: 'Dividir por n não basta: derivar x³ três vezes dá 3·2·1 = 3! = 6.' },
        ],
        answer: 0,
        line: { tex: 'e^x \\approx 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}', say: 'e elevado a x é aproximadamente 1 mais x mais x ao quadrado sobre 2 mais x ao cubo sobre 6' },
        done: 'A cópia gruda na curva perto de 0.',
      },
      {
        id: 'p1c',
        prompt: 'Passo 3: troque x por 0,5 e estime e^0,5.',
        options: [
          { label: '≈ 1,6458', value: 1 + 0.5 + 0.125 + 0.125 / 6, poly: T3, why: '1 + 0,5 + 0,125 + 0,0208.' },
          { label: '≈ 1,6250', value: 1.625, poly: [1, 1, 0.5], why: 'Faltou o último termo: 0,5³/6 ≈ 0,0208.' },
          { label: '≈ 1,8750', value: 1.875, poly: [1, 1, 1, 1], why: 'Faltou dividir: x² vai sobre 2 e x³ sobre 6.' },
        ],
        answer: 0,
        line: { tex: 'e^{0{,}5} \\approx 1 + 0{,}5 + 0{,}125 + 0{,}0208 = 1{,}6458', say: 'e elevado a 0,5 é aproximadamente 1 mais 0,5 mais 0,125 mais 0,0208, igual a 1,6458' },
        done: 'A calculadora diz 1,6487. Com só 4 termos, o erro é 0,0029!',
      },
    ],
  },
  {
    id: 'p2',
    fn: 'exp',
    x: 0.5,
    title: 'Problema 2 · menos ajuda',
    steps: [
      {
        id: 'p2a',
        prompt: 'Sem calculadora: quanto a cópia pode errar? O resto é eᶜ·x⁴/4!, com c entre 0 e 0,5. O maior eᶜ possível é…',
        options: [
          { label: 'menos de 2', bound: (2 * 0.5 ** 4) / 24, why: 'eᶜ cresce: o pior caso é c = 0,5, e e^0,5 < 2.' },
          { label: '1, com c = 0', bound: 0.5 ** 4 / 24, why: 'c pode estar em qualquer ponto até 0,5. Garantia usa o pior caso, o maior valor.' },
          { label: 'não dá para saber', why: 'Dá, sim: eᶜ só cresce, então o maior valor está em c = 0,5, e e^0,5 < 2.' },
        ],
        answer: 0,
        line: { tex: '|R_3| \\le \\frac{M\\,x^4}{4!},\\quad M = 2', say: 'o resto é no máximo M vezes x à quarta sobre 4 fatorial, com M igual a 2' },
        done: 'Isso: M = 2 serve para qualquer c entre 0 e 0,5.',
      },
      {
        id: 'p2b',
        prompt: 'Então o erro de 1,6458 é, no máximo…',
        options: [
          { label: '2·0,5⁴/24 ≈ 0,0052', bound: (2 * 0.5 ** 4) / 24, why: 'Garantido. O erro real, 0,0029, cabe na faixa.' },
          { label: '2·0,5⁴ ≈ 0,125', bound: 2 * 0.5 ** 4, why: 'Faltou o 4!. Verdade, mas larga demais para ser útil.' },
          { label: '0,5⁴/24 ≈ 0,0026', bound: 0.5 ** 4 / 24, why: 'Menor que o erro real (0,0029)! Com M = 1 a garantia falha. Veja o ponto fora.' },
        ],
        answer: 0,
        line: { tex: '|R_3| \\le \\frac{2\\cdot 0{,}5^4}{24} \\approx 0{,}0052', say: 'o resto é no máximo 2 vezes 0,5 à quarta sobre 24, aproximadamente 0,0052' },
        done: 'Garantido: erro ≤ 0,0052. O real (0,0029) ficou dentro.',
      },
    ],
  },
  {
    id: 'p3',
    fn: 'cos',
    x: 0.2,
    title: 'Problema 3 · sozinho',
    steps: [
      {
        id: 'p3a',
        prompt: 'Sozinho agora: estime cos 0,2 com a cópia de grau 2 do cosseno.',
        options: [
          { label: '0,98', value: 0.98, poly: [1, 0, -0.5], why: 'cos 0 = 1, cos′ 0 = 0, cos″ 0 = −1: 1 − 0,2²/2 = 0,98.' },
          { label: '0,96', value: 0.96, poly: [1, 0, -1], why: 'Faltou dividir por 2!: o termo é −x²/2, não −x².' },
          { label: '0,80', value: 0.8, poly: [1, -1], why: 'cos′(0) = −sen 0 = 0: o cosseno sai de x = 0 na horizontal.' },
          { label: '1,02', value: 1.02, poly: [1, 0, 0.5], why: 'Sinal trocado: cos″(0) = −cos 0 = −1, a curva desce.' },
        ],
        answer: 0,
        line: { tex: '\\cos 0{,}2 \\approx 1 - \\frac{0{,}2^2}{2} = 0{,}98', say: 'cosseno de 0,2 é aproximadamente 1 menos 0,2 ao quadrado sobre 2, igual a 0,98' },
        done: 'O valor real é 0,980067…: certo até a 4ª casa.',
      },
    ],
  },
]

export type Solve = Record<string, number[]>

export const solveOf = (a: Answers): Solve => (a.solve && typeof a.solve === 'object' ? (a.solve as Solve) : {})

export interface ProblemState {
  /** Index of the first unsolved step (steps.length when solved). */
  current: number
  solved: boolean
  /** Last pick on the current step, if it was wrong. */
  wrong: number | null
}

export function problemState(p: Problem, solve: Solve): ProblemState {
  let current = 0
  while (current < p.steps.length && (solve[p.steps[current].id] ?? []).includes(p.steps[current].answer)) current++
  const step = p.steps[current]
  const picks = step ? (solve[step.id] ?? []) : []
  const last = picks.length ? picks[picks.length - 1] : null
  return { current, solved: current >= p.steps.length, wrong: step && last !== null && last !== step.answer ? last : null }
}

export function firstTries(solve: Solve): { right: number; total: number } {
  let right = 0
  let total = 0
  for (const p of PROBLEMS)
    for (const s of p.steps) {
      total++
      if ((solve[s.id] ?? [])[0] === s.answer) right++
    }
  return { right, total }
}

// ------------------------------------------------------------ choices of Preveja / E se

export const Q5 = {
  options: ['Só perto de 0: a faixa boa cresce', 'Longe de 0, onde era pior', 'Igual em toda a reta', 'Não muda nada'],
  answer: 0,
}
export const Q100 = {
  options: ['Sim, cola em tudo', 'Não: um dia ele dispara', 'Só entre −π e π', 'Grau alto piora a cópia'],
  answer: 1,
}
export const QLN = {
  options: ['Fica cada vez melhor', 'Fica cada vez pior', 'Melhora e depois para', 'Não muda'],
  answer: 1,
}
export const QGEOM = {
  options: ['Só para |x| < 1', 'Em toda a reta', 'Só para x > 0', 'Até x = 2'],
  answer: 0,
}
