import {
  G_EARTH,
  perfectSpeed,
  rad,
  RELEASE_HEIGHT,
  shotOutcome,
  trajectory,
  type Launch,
  type Quad,
  type ShotKind,
} from '@/lib/math/quadratic'

// Shared between the Etapas (steps.tsx) and the continuous Palco (Stage.tsx)
// of "O arremesso perfeito".

/** Lab-wide live values (not saved). */
export type QuadLive = {
  /** Current aim of the throw: speed (m/s) and angle (degrees). */
  aim: { v: number; deg: number }
  /** Bumped by the "Lançar" button / "Me mostre": the Palco throws with `aim`. */
  fire: number
  /** True while a ball is in the air. */
  flying: boolean
  /** Entenda: the quadratic the student is shaping. */
  q: Quad
  /** Entenda: the coefficient the slider moves. */
  coef: 'a' | 'b' | 'c'
  /** Entenda (forma canônica): bumped to replay the build animation. */
  replay: number
  /** No mundo real: release angle of the free throw, degrees. */
  ftDeg: number
  /** E se…?: launch angle on flat ground, degrees. */
  rangeDeg: number
}

export interface Shot {
  v: number
  deg: number
  kind: ShotKind
  miss: number
}

export const AIM_DEFAULT = { v: 6.4, deg: 58 }
export const V_MIN = 4
export const V_MAX = 12
export const DEG_MIN = 15
export const DEG_MAX = 80

export const launchOf = (s: { v: number; deg: number }, g = G_EARTH, h0 = RELEASE_HEIGHT): Launch => ({ v: s.v, theta: rad(s.deg), h0, g })

export function makeShot(aim: { v: number; deg: number }): Shot {
  const o = shotOutcome(launchOf(aim))
  return { v: aim.v, deg: aim.deg, kind: o.kind, miss: o.miss }
}

/** A clean swish at 52°, used by "Me mostre" and when the student has no basket yet. */
export const PERFECT_DEG = 52
export const PERFECT_AIM = { v: perfectSpeed(rad(PERFECT_DEG)), deg: PERFECT_DEG }

export function readShot(v: unknown): Shot | null {
  if (!v || typeof v !== 'object') return null
  const s = v as Partial<Shot>
  return typeof s.v === 'number' && typeof s.deg === 'number' ? (s as Shot) : null
}

/** The throw that the rest of the lab is built on: the student's basket (or the 52° swish). */
export function baseShot(answers: Record<string, unknown>): { v: number; deg: number } {
  return readShot(answers.goodShot) ?? PERFECT_AIM
}

/** Entenda starts from the student's own parabola, with friendlier numbers. */
export function roundedQuad(answers: Record<string, unknown>): Quad {
  const q = trajectory(launchOf(baseShot(answers)))
  return { a: Math.round(q.a * 20) / 20 || -0.25, b: Math.round(q.b * 10) / 10, c: Math.round(q.c * 10) / 10 }
}

export const SHOT_TEXT: Record<ShotKind, string> = {
  cesta: 'Cesta!',
  aro: 'Bateu no aro',
  tabela: 'Bateu na tabela',
  curto: 'Curto',
  longo: 'Passou do aro',
}

// ------------------------------------------------------------ Resolva

/** What the Palco shows for a choice: why it works or why it does not. */
export type Show =
  | { kind: 'none' }
  | { kind: 'point'; t: number }
  | { kind: 'roots' }
  | { kind: 'sym' }
  | { kind: 'level'; h: number }
  | { kind: 'arms'; w: number }
  | { kind: 'ground' }

export interface SolveOption {
  /** Plain label; `tex` (if given) is rendered instead. */
  label: string
  tex?: string
  say?: string
  ok: boolean
  /** One gentle sentence: why it is right, or why it does not work. */
  why: string
  show: Show
}

export interface SolveStep {
  id: string
  /**
   * The caption. `{h}` stands for the problem's function; `$tex|fala$`
   * segments are rendered with KaTeX (the part after | is how the Vega says it).
   */
  ask: string
  options: SolveOption[]
  /** The notebook line written when solved. */
  note: { tex: string; say: string }
}

export interface Problem {
  id: string
  q: Quad
  tex: string
  say: string
  steps: SolveStep[]
}

const H1: Quad = { a: -5, b: 10, c: 2 }
const H3: Quad = { a: -5, b: 20, c: 1 }

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    q: H1,
    tex: 'h(t) = -5t^2 + 10t + 2',
    say: 'h de t igual a menos 5 t ao quadrado mais 10 t mais 2',
    steps: [
      {
        id: 'p1-metodo',
        ask: 'Uma bola sobe e desce com {h}. Em que instante ela fica mais alta? Qual é o primeiro passo?',
        options: [
          { label: 'Usar t = −b/2a', tex: 't = -\\dfrac{b}{2a}', say: 't igual a menos b sobre 2 a', ok: true, why: 'A parábola é simétrica: o topo fica bem no meio.', show: { kind: 'sym' } },
          { label: 'Igualar h(t) a zero', ok: false, why: 'h(t) = 0 é quando a bola toca o chão, não o topo. Veja os dois pontos no chão.', show: { kind: 'roots' } },
          { label: 'Calcular h(0)', ok: false, why: 'h(0) = 2 m é a altura da mão, no começo do voo. Não é o topo.', show: { kind: 'point', t: 0 } },
          { label: 'Derivar', ok: false, why: 'Funciona, mas é Cálculo 1! Aqui a simetria resolve sem derivada.', show: { kind: 'none' } },
        ],
        note: { tex: 't_v = -\\dfrac{b}{2a}', say: 't do vértice igual a menos b sobre 2 a' },
      },
      {
        id: 'p1-tv',
        ask: 'Ela passa por 2 m em $t = 0$ e de novo em $t = 2$: o topo fica no meio. Confira com $-\\frac{b}{2a}|menos b sobre 2 a$.',
        options: [
          { label: '1 s', ok: true, why: 'O meio entre 0 e 2.', show: { kind: 'point', t: 1 } },
          { label: '−1 s', ok: false, why: 'Cuidado com o sinal: −10 ÷ (−10) dá +1. E t negativo é antes do lance.', show: { kind: 'point', t: -1 } },
          { label: '2 s', ok: false, why: 'Isso é −b/a: faltou o 2. Em t = 2 a bola já voltou aos 2 m.', show: { kind: 'point', t: 2 } },
          { label: '0,5 s', ok: false, why: 'Em 0,5 s ela ainda está subindo: veja que dá para ir mais alto.', show: { kind: 'point', t: 0.5 } },
        ],
        note: { tex: 't_v = -\\dfrac{10}{2\\cdot(-5)} = 1\\ \\text{s}', say: 't do vértice igual a menos 10 sobre 2 vezes menos 5, igual a 1 segundo' },
      },
      {
        id: 'p1-h',
        ask: 'O topo é em $t = 1$ s. Qual é a altura máxima, $h(1)|h de 1$?',
        options: [
          { label: '7 m', ok: true, why: '−5 + 10 + 2 = 7.', show: { kind: 'level', h: 7 } },
          { label: '17 m', ok: false, why: '−5·1² é −5, não +5. A curva nem chega lá.', show: { kind: 'level', h: 17 } },
          { label: '5 m', ok: false, why: 'Faltou somar o c = 2: a bola já sai da mão a 2 m.', show: { kind: 'level', h: 5 } },
          { label: '1 m', ok: false, why: '1 é o instante (t), não a altura. Agora calcule h(1).', show: { kind: 'level', h: 1 } },
        ],
        note: { tex: 'h(1) = -5 + 10 + 2 = 7\\ \\text{m}', say: 'h de 1 igual a menos 5 mais 10 mais 2, igual a 7 metros' },
      },
    ],
  },
  {
    id: 'p2',
    q: H1,
    tex: 'h(t) = -5t^2 + 10t + 2',
    say: 'h de t igual a menos 5 t ao quadrado mais 10 t mais 2',
    steps: [
      {
        id: 'p2-metodo',
        ask: 'Mesma bola. Quando ela toca o chão? Qual é o primeiro passo?',
        options: [
          { label: 'Resolver h(t) = 0', ok: true, why: 'Chão é altura zero.', show: { kind: 'ground' } },
          { label: 'Usar t = −b/2a', ok: false, why: 'Isso dá o topo (t = 1 s), não o chão.', show: { kind: 'point', t: 1 } },
          { label: 'Resolver h(t) = 2', ok: false, why: 'h = 2 é a altura da mão: dá t = 0 e t = 2, ainda no ar.', show: { kind: 'level', h: 2 } },
          { label: 'Calcular h(0)', ok: false, why: 'h(0) é a saída, 2 m acima do chão.', show: { kind: 'point', t: 0 } },
        ],
        note: { tex: '-5t^2 + 10t + 2 = 0', say: 'menos 5 t ao quadrado mais 10 t mais 2 igual a zero' },
      },
      {
        id: 'p2-delta',
        ask: 'Bhaskara começa pelo $\\Delta = b^2 - 4ac|delta igual a b ao quadrado menos 4 a c$. Com $a = -5$, $b = 10$ e $c = 2$, quanto dá?',
        options: [
          { label: '140', ok: true, why: '100 + 40.', show: { kind: 'arms', w: Math.sqrt(140) / 10 } },
          { label: '60', ok: false, why: '−4·(−5)·2 é +40: menos com menos dá mais. As pontas não caem no chão.', show: { kind: 'arms', w: Math.sqrt(60) / 10 } },
          { label: '100', ok: false, why: 'Faltou o −4ac. Veja: as pontas ficam no ar.', show: { kind: 'arms', w: 1 } },
          { label: '−60', ok: false, why: 'Com Δ < 0 a curva nunca tocaria o chão, mas a bola cai! Revise os sinais.', show: { kind: 'none' } },
        ],
        note: { tex: '\\Delta = 10^2 - 4\\cdot(-5)\\cdot 2 = 140', say: 'delta igual a 10 ao quadrado menos 4 vezes menos 5 vezes 2, igual a 140' },
      },
      {
        id: 'p2-t',
        ask: 'Agora, $t = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}|t igual a menos b mais ou menos raiz de delta, sobre 2 a$. Quando a bola toca o chão?',
        options: [
          { label: '≈ 2,18 s', ok: true, why: '1 + 1,18.', show: { kind: 'point', t: 1 + Math.sqrt(140) / 10 } },
          { label: '≈ −0,18 s', ok: false, why: 'A conta está certa, mas é antes do lance: fisicamente não vale.', show: { kind: 'point', t: 1 - Math.sqrt(140) / 10 } },
          { label: '≈ 1,18 s', ok: false, why: '1,18 é só a distância até o eixo. Some ao t = 1 do topo.', show: { kind: 'point', t: Math.sqrt(140) / 10 } },
          { label: '2 s', ok: false, why: 'Em t = 2 ela ainda está a 2 m do chão.', show: { kind: 'point', t: 2 } },
        ],
        note: { tex: 't = \\dfrac{-10 \\pm \\sqrt{140}}{-10} \\approx 2{,}18\\ \\text{s}', say: 't igual a menos 10 mais ou menos raiz de 140, sobre menos 10: aproximadamente 2 vírgula 18 segundos' },
      },
    ],
  },
  {
    id: 'p3',
    q: H3,
    tex: 'h(t) = -5t^2 + 20t + 1',
    say: 'h de t igual a menos 5 t ao quadrado mais 20 t mais 1',
    steps: [
      {
        id: 'p3',
        ask: 'Agora é com você: uma bola mais forte, {h}. Qual é a altura máxima?',
        options: [
          { label: '21 m', ok: true, why: 'Topo em t = 2 s e h(2) = 21 m.', show: { kind: 'level', h: 21 } },
          { label: '2 m', ok: false, why: '2 é o instante do topo (t). Falta calcular h(2).', show: { kind: 'level', h: 2 } },
          { label: '41 m', ok: false, why: '−5·2² = −20, não +20. A curva para bem antes.', show: { kind: 'level', h: 41 } },
          { label: '1 m', ok: false, why: 'h(0) = 1 m é a saída da mão, não o topo.', show: { kind: 'level', h: 1 } },
        ],
        note: { tex: 't_v = 2\\ \\text{s},\\ \\ h(2) = -20 + 40 + 1 = 21\\ \\text{m}', say: 't do vértice igual a 2 segundos; h de 2 igual a menos 20 mais 40 mais 1, igual a 21 metros' },
      },
    ],
  },
]

/** Attempts per Resolva step (answer key `solve`): option indexes in the order tried. */
export type SolveLog = Record<string, number[]>

export function readSolve(answers: Record<string, unknown>): SolveLog {
  const s = answers.solve
  return s && typeof s === 'object' ? (s as SolveLog) : {}
}

export const stepSolved = (log: SolveLog, s: SolveStep) => (log[s.id] ?? []).some((i) => s.options[i]?.ok)

/** The first unsolved step of a problem (or steps.length when all are solved). */
export const currentStepIndex = (log: SolveLog, p: Problem) => {
  const i = p.steps.findIndex((s) => !stepSolved(log, s))
  return i < 0 ? p.steps.length : i
}

// ------------------------------------------------------------ E se…?

export const MOON_OPTIONS = ['Igual à da Terra', 'Mais fechada', 'Bem mais aberta', 'Uma reta']
export const MOON_ANSWER = 2
export const RANGE_OPTIONS = [30, 45, 60, 75]
export const RANGE_ANSWER = 1
/** Launch speed for the flat-ground range challenge, m/s (example). */
export const RANGE_V = 10

/**
 * Moves c, snapping to the value that makes Δ = 0 (the parabola just
 * touches the floor) when close, so "toca uma vez" can be found by hand.
 */
export function snapC(q: Quad, c: number): Quad {
  const next = Math.max(-3, Math.min(5, c))
  if (Math.abs(q.a) > 0.02) {
    const touch = (q.b * q.b) / (4 * q.a)
    if (Math.abs(next - touch) < 0.12) return { ...q, c: touch }
  }
  return { ...q, c: Math.round(next * 100) / 100 }
}
