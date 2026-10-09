import { TAU, timeAbove, type Sinusoid } from '@/lib/math/trig'

// Shared contract between the Etapas and the continuous Palco of
// "A roda que vira onda".

export type TrigLive = {
  /** Imagine / Entenda: accumulated angle of the cabin (rad, ≥ 0). */
  theta: number
  /** No mundo real: minutes since boarding the London Eye. */
  t: number
  /** Resolva, problem 3: angle of P (rad, [0, 2π)). */
  p3: number
  /** E se…?: h(t) = A·sen(ωt) + d. */
  A: number
  w: number
  d: number
  /** E se…?: which parameter the slider edits. */
  param: 'A' | 'w' | 'd'
  /** Resolva: the last option picked (the Palco shows why it works or not). */
  pick: Pick | null
}

export interface Pick {
  problem: 0 | 1
  step: number
  option: number
}

export const SIN = '\\operatorname{sen}'
export const DEG = '^\\circ'

export const IMAGINE_MAX = 2 * TAU
export const ENTENDA_MAX = TAU

/** Preveja, question 2: the candidates for height × time. */
export const SHAPES = [
  { id: 'tri', name: 'Zigue-zague' },
  { id: 'sin', name: 'Onda suave' },
  { id: 'saw', name: 'Dente de serra' },
] as const
export const SHAPE_ANSWER = 1

export const Q1 = ['Mais alta', 'Mais baixa', 'Na mesma altura', 'Depende do tamanho da roda']
export const Q1_ANSWER = 2

/** London Eye: when is the cabin above 100 m? */
export const EYE_LINE = 100
export const EYE_ABOVE = timeAbove(EYE_LINE)!

/** E se…? */
export const ESE_START: Sinusoid = { A: 1, w: 1, d: 0 }
export const ESE_TARGET: Sinusoid = { A: 0.5, w: 2, d: 1 }
export const ESE_RANGE = { A: [0.3, 1.6], w: [0.5, 3], d: [-1, 1] } as const
export const ESE_Q = ['Fica mais alta', 'Fica mais apertada', 'Sobe inteira', 'Não muda nada']
export const ESE_Q_ANSWER = 1

// ------------------------------------------------------------ Resolva

export interface Option {
  /** TeX (rendered with Tex) or plain text. */
  tex?: string
  text?: string
  say: string
  /** Gentle explanation of why it fails (or works). */
  why: string
}

export interface SolveStep {
  q: string
  /** Spoken question. */
  say: string
  options: Option[]
  answer: number
  /** Line written in the notebook when solved. */
  line: { tex: string; say: string }
}

export const PROBLEMS: SolveStep[][] = [
  [
    {
      q: 'Que ângulo, espelhado no eixo vertical, cai em 150°?',
      say: 'Quanto vale seno de 150 graus? Primeiro passo: que ângulo, espelhado no eixo vertical, cai em 150 graus?',
      options: [
        { text: '30°', say: '30 graus', why: 'Isso: 150° = 180° − 30°. Os dois pontos são espelhos um do outro.' },
        { text: '60°', say: '60 graus', why: 'O espelho de 60° é 120°, não 150°. Quanto falta de 150° até 180°?' },
        { text: '120°', say: '120 graus', why: '120° já está do lado esquerdo; o espelho dele é 60°.' },
        { text: '210°', say: '210 graus', why: '210° fica embaixo, no 3º quadrante. O espelho dele também fica embaixo.' },
      ],
      answer: 0,
      line: { tex: `150${DEG} = 180${DEG} - 30${DEG}`, say: '150 graus é igual a 180 graus menos 30 graus' },
    },
    {
      q: 'O espelho no eixo vertical leva 30° a 150°. O que muda nas coordenadas?',
      say: 'O espelho no eixo vertical leva 30 graus a 150 graus. O que muda nas coordenadas?',
      options: [
        { text: 'Só o x troca de sinal', say: 'só o x troca de sinal', why: 'Isso: o ponto pula de lado na mesma altura. O x vira negativo; o y fica.' },
        { text: 'Só o y troca de sinal', say: 'só o y troca de sinal', why: 'Veja o palco: o ponto anda na horizontal. A altura, o y, não muda.' },
        { text: 'Os dois trocam', say: 'os dois trocam', why: 'Isso seria a meia volta pelo centro. Aqui o ponto só pula de lado.' },
        { text: 'Nada muda', say: 'nada muda', why: '30° está à direita e 150° à esquerda: o x muda de sinal.' },
      ],
      answer: 0,
      line: { tex: `P(150${DEG}) = (-\\cos 30${DEG},\\ ${SIN} 30${DEG})`, say: 'P de 150 graus é igual a menos cosseno de 30 graus, seno de 30 graus' },
    },
    {
      q: 'Então quanto vale sen 150°?',
      say: 'Então quanto vale seno de 150 graus?',
      options: [
        { tex: '\\tfrac{1}{2}', say: 'um meio', why: 'Isso! Mesma altura que 30°: sen 150° = ½.' },
        { tex: '-\\tfrac{1}{2}', say: 'menos um meio', why: '−½ fica abaixo do eixo, mas 150° está em cima: o seno é positivo.' },
        { tex: '\\tfrac{\\sqrt{3}}{2}', say: 'raiz de três sobre dois', why: '√3/2 é o cos 30°, a sombra horizontal. O seno é a altura.' },
        { tex: '-\\tfrac{\\sqrt{3}}{2}', say: 'menos raiz de três sobre dois', why: 'Esse é o cos 150°, a sombra horizontal. O seno é a altura.' },
      ],
      answer: 0,
      line: { tex: `${SIN} 150${DEG} = ${SIN} 30${DEG} = \\tfrac{1}{2}`, say: 'seno de 150 graus é igual a seno de 30 graus, que é um meio' },
    },
  ],
  [
    {
      q: 'Que movimento leva 30° até 210°?',
      say: 'Agora cosseno de 210 graus, com menos ajuda. Que movimento leva 30 graus até 210 graus?',
      options: [
        { text: 'Espelho no eixo vertical', say: 'espelho no eixo vertical', why: 'Esse espelho leva 30° a 150°, veja. Ainda falta descer.' },
        { text: 'Espelho no eixo horizontal', say: 'espelho no eixo horizontal', why: 'Esse leva 30° a 330°. Ainda falta ir para a esquerda.' },
        { text: 'Meia volta pelo centro', say: 'meia volta pelo centro', why: 'Isso: 210° = 30° + 180°. O ponto vai para o lado oposto do centro.' },
      ],
      answer: 2,
      line: { tex: `210${DEG} = 30${DEG} + 180${DEG}`, say: '210 graus é igual a 30 graus mais 180 graus' },
    },
    {
      q: 'Quanto vale cos 210°?',
      say: 'A meia volta troca os dois sinais. Quanto vale cosseno de 210 graus?',
      options: [
        { tex: '-\\tfrac{\\sqrt{3}}{2}', say: 'menos raiz de três sobre dois', why: 'Isso! Mesmo tamanho do cos 30°, com sinal trocado: o ponto está à esquerda.' },
        { tex: '\\tfrac{\\sqrt{3}}{2}', say: 'raiz de três sobre dois', why: 'Esse é o cos 30°. Em 210° o ponto está à esquerda: o x é negativo.' },
        { tex: '-\\tfrac{1}{2}', say: 'menos um meio', why: '−½ é o seno de 210°, a altura. O cosseno é a sombra horizontal.' },
        { tex: '\\tfrac{1}{2}', say: 'um meio', why: '½ é o seno de 30°. O cosseno é a sombra horizontal, e aqui ela é negativa.' },
      ],
      answer: 0,
      line: { tex: `\\cos 210${DEG} = -\\cos 30${DEG} = -\\tfrac{\\sqrt{3}}{2} \\approx -0{,}87`, say: 'cosseno de 210 graus é igual a menos cosseno de 30 graus, menos raiz de três sobre dois, aproximadamente menos 0,87' },
    },
  ],
]

/** Problem 3: sen θ = ½ in [0, 2π). */
export const P3_SOLUTIONS = [Math.PI / 6, (5 * Math.PI) / 6]
/** How close (rad) a release must be to snap onto a solution. */
export const P3_SNAP = (5 * Math.PI) / 180
