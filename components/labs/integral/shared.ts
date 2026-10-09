import { boltDistance, boltVelocity, type Method } from '@/lib/math/integral'
import { fmt, texNum } from '@/lib/math/view'

// Shared between the Etapas and the continuous Palco of "Somando fatias
// infinitas": the curves, the live values and the guided problems of
// "Resolva" (each choice also tells the Palco what to show).

export type IntegralLive = {
  /** Slices in "Entenda" (1–200). */
  n: number
  method: Method
  /** Time cursor (h) of the imagined car in "Imagine". */
  carT: number
  /** Time cursor (s) of Bolt's race in "Observe". */
  boltT: number
  /** Cursor x of the accumulated area A(x) in "Resolva". */
  accX: number
  /** Slices while the rectangles split in two in "Resolva" (problem 1). */
  splitN: number
  /** Replays the Σ → ∫ morph. */
  morphKey: number
}

export const DEFAULT_LIVE: IntegralLive = { n: 8, method: 'right', carT: 0, boltT: 0, accX: 0, splitN: 4, morphKey: 0 }

export type CurveId = 'const60' | 'car' | 'sq' | 'lin' | 'twox' | 'rev' | 'bolt'

/** Imagined car (exemplo imaginado): constant speed, then accelerating, then reversing. */
export const CAR_CONST = 60
export const carAccel = (t: number) => 30 + 15 * t * t
export const carAccelDistance = (t: number) => 30 * t + 5 * t ** 3
export const carReverse = (t: number) => 60 - 40 * t
export const carReverseDisplacement = (t: number) => 60 * t - 20 * t * t
export const REVERSE_END = 2.5

export const CURVES: Record<CurveId, (x: number) => number> = {
  const60: () => CAR_CONST,
  car: carAccel,
  sq: (x) => x * x,
  lin: (x) => 2 * x + 1,
  twox: (x) => 2 * x,
  rev: carReverse,
  bolt: boltVelocity,
}

export { boltDistance }

// ------------------------------------------------------------ Resolva

/** What the Palco shows for a choice (or a step). */
export interface Demo {
  n?: number
  method?: Method
  /** Heights follow y = x instead of f(x) (forgot to apply f). */
  heightsAreX?: boolean
  /** Rectangles drawn this many times wider (forgot Δx or used the wrong width). */
  widthScale?: number
  /** Rectangles made taller. */
  heightScale?: number
  /** Pulse the error colors. */
  showError?: boolean
  /** Tangent slope at the cursor, when it is not f(x). */
  slope?: number
  /** Area filled from this x instead of a. */
  fillFrom?: number
  /** Curve drawn instead of the problem's. */
  curve?: CurveId
  /** Highlight the point (x, f(x)). */
  dot?: number
}

export interface Option {
  tex: string
  say: string
  ok?: boolean
  why?: string
  demo?: Demo
}

export interface Task {
  /** Caption (HTML-free text with optional TeX segments in $…$). */
  q: string
  say: string
  options: Option[]
  /** Notebook line written when this task is solved. */
  line: string
  lineSay: string
  /** The Palco before any choice. */
  base: Demo
}

// Problem 1: ∫₀² x² dx by Riemann sums, a lot of help.
export const P1: Task[] = [
  {
    q: 'Vamos fatiar $\\int_0^2 x^2\\,dx$ em 4 retângulos. Qual é a largura $\\Delta x$ de cada fatia?',
    say: 'Vamos fatiar a integral de 0 a 2 de x ao quadrado em 4 retângulos. Qual é a largura delta x de cada fatia?',
    options: [
      { tex: '0{,}5', say: 'zero vírgula cinco', ok: true },
      { tex: '2', say: 'dois', why: '2 é a largura do intervalo todo: daria um retângulo só. Divida por 4.', demo: { n: 1 } },
      { tex: '0{,}25', say: 'zero vírgula vinte e cinco', why: 'Com 0,25 caberiam 8 fatias, não 4. Conte no palco.', demo: { n: 8 } },
    ],
    line: '\\Delta x = \\frac{2 - 0}{4} = 0{,}5',
    lineSay: 'delta x igual a 2 menos 0, sobre 4, igual a 0 vírgula 5',
    base: { n: 4, method: 'right' },
  },
  {
    q: 'A altura vem do lado direito de cada fatia, em $f(x) = x^2$. Quais são as 4 alturas?',
    say: 'A altura vem do lado direito de cada fatia, em f de x igual a x ao quadrado. Quais são as 4 alturas?',
    options: [
      { tex: '0{,}25;\\ 1;\\ 2{,}25;\\ 4', say: '0,25; 1; 2,25; 4', ok: true },
      { tex: '0{,}5;\\ 1;\\ 1{,}5;\\ 2', say: '0,5; 1; 1,5; 2', why: 'Esses são os valores de x. A altura é f(x) = x²: veja os retângulos longe da curva.', demo: { heightsAreX: true } },
      { tex: '0;\\ 0{,}25;\\ 1;\\ 2{,}25', say: '0; 0,25; 1; 2,25', why: 'Essas são as alturas do lado esquerdo. Aqui pedimos o lado direito.', demo: { method: 'left' } },
    ],
    line: 'f(0{,}5) + f(1) + f(1{,}5) + f(2) = 7{,}5',
    lineSay: 'a soma das quatro alturas dá 7 vírgula 5',
    base: { n: 4, method: 'right' },
  },
  {
    q: 'As alturas somam 7,5. E a soma das áreas dos 4 retângulos?',
    say: 'As alturas somam 7 vírgula 5. E a soma das áreas dos 4 retângulos?',
    options: [
      { tex: '7{,}5 \\cdot 0{,}5 = 3{,}75', say: '7,5 vezes 0,5, igual a 3,75', ok: true },
      { tex: '7{,}5', say: '7,5', why: 'Somar só as alturas é usar largura 1: os retângulos saem do intervalo. Área = altura × Δx.', demo: { widthScale: 2 } },
      { tex: '7{,}5 \\cdot 2 = 15', say: '7,5 vezes 2, igual a 15', why: '2 é a largura do intervalo todo. Cada fatia tem só Δx = 0,5 de largura.', demo: { widthScale: 4 } },
    ],
    line: 'R_4 = 7{,}5 \\cdot 0{,}5 = 3{,}75',
    lineSay: 'R 4 igual a 7,5 vezes 0,5, igual a 3,75',
    base: { n: 4, method: 'right' },
  },
  {
    q: '3,75 passa da área real: veja as sobras em rosa. Qual é o próximo passo?',
    say: '3,75 passa da área real: veja as sobras em rosa. Qual é o próximo passo?',
    options: [
      { tex: '\\text{Fatias mais finas}', say: 'Fatias mais finas', ok: true },
      { tex: '\\text{Retângulos mais altos}', say: 'Retângulos mais altos', why: 'Mais altos só aumentam a sobra rosa. Já estamos acima do valor real.', demo: { heightScale: 1.3, showError: true } },
      { tex: '\\text{Parar: } 3{,}75', say: 'Parar: 3,75 já é a resposta', why: 'As sobras rosa ainda existem: 3,75 é maior que a área. Dá para chegar mais perto.', demo: { showError: true } },
    ],
    line: 'R_n \\to \\tfrac{8}{3} \\approx 2{,}667',
    lineSay: 'R n tende a 8 terços, aproximadamente 2,667',
    base: { n: 4, method: 'right', showError: true },
  },
]

// Problem 2: the accumulated area A(x) and the Teorema Fundamental, less help.
export const P2: Task[] = [
  {
    q: 'Agora a área vira função: $A(x)$ é a área de 0 até $x$. Arraste no palco de 0 até 2.',
    say: 'Agora a área vira função: A de x é a área de 0 até x. Arraste no palco de 0 até 2.',
    options: [],
    line: 'A(x) = \\int_0^x t^2\\,dt',
    lineSay: 'A de x igual à integral de 0 a x de t ao quadrado',
    base: {},
  },
  {
    q: 'Em $x = 1{,}5$, com que inclinação a curva $A(x)$ está subindo?',
    say: 'Em x igual a 1,5, com que inclinação a curva A de x está subindo?',
    options: [
      { tex: 'f(1{,}5) = 2{,}25', say: 'f de 1,5, igual a 2,25', ok: true },
      { tex: 'A(1{,}5) = 1{,}125', say: 'A de 1,5, igual a 1,125', why: '1,125 é a altura de A, não a inclinação. Veja: essa reta corta a curva.', demo: { slope: 1.125 } },
      { tex: '1{,}5', say: '1,5', why: '1,5 é a posição x. A reta com essa inclinação não acompanha a curva.', demo: { slope: 1.5 } },
    ],
    line: "A'(1{,}5) = f(1{,}5) = 2{,}25",
    lineSay: 'A linha de 1,5 é igual a f de 1,5, igual a 2,25',
    base: {},
  },
]
export const P2_FINAL = { tex: "A'(x) = f(x) \\;\\Rightarrow\\; A(2) = \\tfrac{2^3}{3} = \\tfrac{8}{3}", say: 'A linha de x é igual a f de x. Então A de 2 é 2 ao cubo sobre 3, igual a 8 terços' }

// Problem 3: on their own. Only the result is checked.
export const P3: Task = {
  q: 'Agora é com você: quanto vale $\\int_1^3 (2x + 1)\\,dx$? Pense numa $F$ com $F\' = 2x + 1$.',
  say: 'Agora é com você: quanto vale a integral de 1 a 3 de 2x mais 1? Pense numa F cuja derivada seja 2x mais 1.',
  options: [
    { tex: '10', say: '10', ok: true },
    { tex: '12', say: '12', why: '12 é F(3) = 9 + 3. A área começa em x = 1: falta subtrair F(1) = 2.', demo: { fillFrom: 0 } },
    { tex: '8', say: '8', why: '8 vem de x² sozinho: é a área sob 2x. A primitiva de 1 é x, não some.', demo: { curve: 'twox' } },
    { tex: '7', say: '7', why: '7 é f(3), a altura no fim. A integral é a área inteira entre 1 e 3.', demo: { dot: 3 } },
  ],
  line: 'F(x) = x^2 + x',
  lineSay: 'F de x igual a x ao quadrado mais x',
  base: {},
}
export const P3_LINES = [
  { tex: 'F(x) = x^2 + x', say: 'F de x igual a x ao quadrado mais x' },
  { tex: 'F(3) - F(1) = 12 - 2 = 10', say: 'F de 3 menos F de 1, igual a 12 menos 2, igual a 10' },
  { tex: '\\tfrac{3 + 7}{2} \\cdot 2 = 10 \\;\\checkmark', say: 'conferindo com o trapézio: 3 mais 7 sobre 2, vezes 2, igual a 10' },
]

export interface ResolvaState {
  p1: number
  p1Wrong: number | null
  p2: number
  p2Wrong: number | null
  p3: number | null
  p3Shown: boolean
}

export function readResolva(answers: Record<string, unknown>): ResolvaState {
  const num = (k: string, d: number) => (typeof answers[k] === 'number' ? (answers[k] as number) : d)
  const opt = (k: string) => (typeof answers[k] === 'number' ? (answers[k] as number) : null)
  return {
    p1: num('p1', 0),
    p1Wrong: opt('p1Wrong'),
    p2: num('p2', 0),
    p2Wrong: opt('p2Wrong'),
    p3: opt('p3'),
    p3Shown: Boolean(answers.p3Shown),
  }
}

/** Notebook (caderno) lines on the Palco for the current problem. */
export function notebook(scene: number, r: ResolvaState, splitN: number, rn: number): { tex: string; say: string }[] {
  if (scene === 0) {
    const lines = P1.slice(0, Math.min(r.p1, 3)).map((t) => ({ tex: t.line, say: t.lineSay }))
    if (r.p1 >= 4) {
      lines.push(
        splitN < 256
          ? { tex: `R_{${splitN}} \\approx ${texNum(rn, 3)}`, say: `R ${splitN} aproximadamente ${fmt(rn, 3)}` }
          : { tex: P1[3].line, say: P1[3].lineSay },
      )
    }
    return lines
  }
  if (scene === 1) {
    const lines = P2.slice(0, Math.min(r.p2, 2)).map((t) => ({ tex: t.line, say: t.lineSay }))
    if (r.p2 >= 2) lines.push(P2_FINAL)
    return lines
  }
  const solved = r.p3 !== null && P3.options[r.p3]?.ok
  return solved || r.p3Shown ? P3_LINES : []
}

// ------------------------------------------------------------ E se…?

export const CHALLENGES = [
  {
    id: 're',
    q: 'O carro anda para a frente e depois dá ré (v < 0). Quanto vale a integral de v de 0 a 2,5 h?',
    options: ['25 km', '65 km', '45 km', '−20 km'],
    answer: 0,
    explain: 'A área abaixo do eixo conta negativa: 45 − 20 = 25 km de deslocamento. Já a distância percorrida foi 45 + 20 = 65 km.',
  },
  {
    id: 'metodo',
    q: 'Com n = 10 em ∫₀² x² dx, quem chega mais perto de 8/3: a esquerda ou o ponto médio?',
    options: ['Esquerda', 'Ponto médio', 'Empatam', 'Depende do n'],
    answer: 1,
    explain: 'Ponto médio: erro ≈ 0,007, contra ≈ 0,39 da esquerda. No meio, a sobra de um lado quase cancela a falta do outro.',
  },
]
