import {
  coolingRhs,
  coolingTimeTo,
  euler,
  exponentialDecay,
  lambdaFromHalfLife,
  logistic,
  logisticRhs,
  maxError,
  meanAbsDeviation,
  newtonCooling,
  decayRhs,
} from '@/lib/math/ode'

// Números e roteiro compartilhados entre o Palco e as Etapas de
// "A equação que prevê o futuro".

// ------------------------------------------------------------ café (exemplo imaginado)

export const ROOM = 20
export const T0 = 90
export const K_COOL = 0.05
export const coffee = newtonCooling(T0, ROOM, K_COOL)
export const coolF = coolingRhs(K_COOL, ROOM)
/** T(10) ≈ 62,46 °C. */
export const T10 = coffee(10)
/** Tempo até 40 °C ≈ 25,06 min (problema 3). */
export const T_TO_40 = coolingTimeTo(T0, ROOM, K_COOL, 40)

/** Euler à mão com h = 5: 90 → 72,5 → 59,375. */
export const HAND_H = 5
export const HAND = euler(coolF, 0, T0, HAND_H, 10).map((p) => p.y)
export const H_CHOICES = [1, 2.5, 5, 10, 20, 40]
export function eulerMaxError(h: number): number {
  return maxError(euler(coolF, 0, T0, h, 60), coffee)
}

// ------------------------------------------------------------ carbono-14 (dado real)

/** Meia-vida do C-14: 5.730 ± 40 anos (Godwin, 1962, Nature 195, 984). */
export const HALF_LIFE = 5730
export const LAMBDA = lambdaFromHalfLife(HALF_LIFE)
export const decayF = decayRhs(LAMBDA)
export const carbon = exponentialDecay(100, LAMBDA)
export const AGE_MAX = 25000
/** Amostra com 25 % do original: 2 meias-vidas. */
export const AGE_ANSWER = 2 * HALF_LIFE
export const AGE_TOL = 250

// ------------------------------------------------------------ lago (exemplo imaginado)

export const R_LOG = 0.5
export const K_LOG = 1000
export const P0_LOG = 50
export const logF = logisticRhs(R_LOG, K_LOG)
export const lake = logistic(P0_LOG, R_LOG, K_LOG)

// ------------------------------------------------------------ desenho do aluno

/** O desenho é guardado como T em t = 0, 1, …, 60 min (null onde não há traço). */
export const SKETCH_N = 61
export type Sketch = (number | null)[]

export function asSketch(v: unknown): Sketch | null {
  return Array.isArray(v) && v.length === SKETCH_N ? (v as Sketch) : null
}
export function sketchCoverage(s: Sketch | null): number {
  return s ? s.filter((v) => v !== null).length / SKETCH_N : 0
}
/** Distância média (°C) entre o desenho e a curva real. */
export function sketchError(s: Sketch | null): number {
  if (!s) return NaN
  const pts = s.flatMap((y, t) => (y === null ? [] : [{ t, y }]))
  return meanAbsDeviation(pts, coffee)
}

// ------------------------------------------------------------ valores ao vivo

export type OdeLive = {
  probe: { t: number; T: number }
  age: number
  h: number
  soloT: number
  soloChecked: number | null
  /** Escolha errada no Resolva, para o Palco mostrar por que não funciona. */
  wrong: { key: string; i: number } | null
  /** Pedido de "Me mostre" para soltar partículas. */
  drop: { id: number; kind: 'cool' | 'log'; pts: [number, number][] } | null
}

// ------------------------------------------------------------ Resolva

export type WrongVisual = { kind: 'curve'; f: (t: number) => number; label: string } | { kind: 'point'; t: number; y: number; label: string } | { kind: 'segment'; t0: number; y0: number; t1: number; y1: number; label: string }

export interface SolveOption {
  tex: string
  say: string
  ok?: boolean
  /** Por que funciona (ok) ou por que não (erro comum). Curto. */
  why: string
  wrong?: WrongVisual
}

export interface SolveStep {
  prompt: string
  promptSay: string
  /** Linha que o caderno escreve quando o passo é resolvido. */
  line: string
  lineSay: string
  options: SolveOption[]
}

const exp = Math.exp

export const SEPARATION: SolveStep[] = [
  {
    prompt: 'Problema 1: achar T(t). Qual é o primeiro passo com dT/dt = −k(T − 20)?',
    promptSay: 'Problema 1: achar T de t. Qual é o primeiro passo com d T d t igual a menos k vezes T menos 20?',
    line: '\\frac{dT}{T-20} = -k\\,dt',
    lineSay: 'd T sobre T menos 20 igual a menos k d t',
    options: [
      { tex: '\\frac{dT}{T-20} = -k\\,dt', say: 'separar: d T sobre T menos 20 igual a menos k d t', ok: true, why: 'Separou: tudo com T de um lado, tudo com t do outro.' },
      {
        tex: 'T = 90 - 70k\\,t',
        say: 'T igual a 90 menos 70 k t',
        why: 'Isso trata T como constante. Veja: a reta cruza a sala e o café congelaria! A inclinação muda com T.',
        wrong: { kind: 'curve', f: (t) => 90 - 70 * K_COOL * t, label: 'reta: congela' },
      },
      {
        tex: '\\frac{d^2T}{dt^2} = -k\\frac{dT}{dt}',
        say: 'derivar de novo: d dois T d t dois igual a menos k d T d t',
        why: 'É verdade, mas piora: agora há uma derivada segunda. Queremos menos derivadas, não mais.',
      },
    ],
  },
  {
    prompt: 'Agora integre os dois lados. Qual é a integral de 1/(T − 20)?',
    promptSay: 'Agora integre os dois lados. Qual é a integral de 1 sobre T menos 20?',
    line: '\\ln|T-20| = -kt + C',
    lineSay: 'logaritmo natural de T menos 20 igual a menos k t mais C',
    options: [
      { tex: '\\ln|T-20| = -kt + C', say: 'logaritmo natural de T menos 20 igual a menos k t mais C', ok: true, why: 'A integral de 1/u é ln|u|, e a constante C guarda todas as curvas possíveis.' },
      {
        tex: '\\tfrac{(T-20)^2}{2} = -kt + C',
        say: 'T menos 20 ao quadrado sobre 2 igual a menos k t mais C',
        why: 'Essa é a integral de (T − 20), não de 1/(T − 20). Veja: o café quase não esfriaria.',
        wrong: { kind: 'curve', f: (t) => 20 + Math.sqrt(Math.max(0, 4900 - 2 * K_COOL * t)), label: 'quase não esfria' },
      },
      {
        tex: '\\ln|T-20| = -kt',
        say: 'logaritmo natural de T menos 20 igual a menos k t, sem constante',
        why: 'Faltou a constante C! Sem ela, todo café começaria em 21 °C, e o nosso começa em 90 °C.',
        wrong: { kind: 'curve', f: (t) => 20 + exp(-K_COOL * t), label: 'começa em 21 °C' },
      },
    ],
  },
  {
    prompt: 'Para tirar o ln, aplique a exponencial dos dois lados. Como fica?',
    promptSay: 'Para tirar o logaritmo, aplique a exponencial dos dois lados. Como fica?',
    line: 'T = 20 + A\\,e^{-kt}',
    lineSay: 'T igual a 20 mais A vezes e elevado a menos k t',
    options: [
      { tex: 'T - 20 = A\\,e^{-kt}', say: 'T menos 20 igual a A vezes e elevado a menos k t', ok: true, why: 'e elevado a (−kt + C) é e^C · e^(−kt). O número e^C (com sinal) virou A: uma família de curvas.' },
      {
        tex: 'T - 20 = e^{-kt} + e^{C}',
        say: 'T menos 20 igual a e elevado a menos k t mais e elevado a C',
        why: 'Expoente somado vira produto: e^(a+b) = e^a·e^b. Com a soma, o café pararia em 89 °C.',
        wrong: { kind: 'curve', f: (t) => 89 + exp(-K_COOL * t), label: 'para em 89 °C' },
      },
      {
        tex: 'T - 20 = -kt\\,e^{C}',
        say: 'T menos 20 igual a menos k t vezes e elevado a C',
        why: 'O expoente inteiro fica lá em cima: e^(−kt + C) não vira −kt vezes nada.',
      },
    ],
  },
  {
    prompt: 'Cada A dá uma curva da família. Qual A faz a curva passar pelo começo, T(0) = 90?',
    promptSay: 'Cada A dá uma curva da família. Qual A faz a curva passar pelo começo, T de zero igual a 90?',
    line: 'T = 20 + 70\\,e^{-0{,}05t}',
    lineSay: 'T igual a 20 mais 70 vezes e elevado a menos 0,05 t',
    options: [
      { tex: 'A = 70', say: 'A igual a 70', ok: true, why: 'Em t = 0, e⁰ = 1: 90 = 20 + A, então A = 70. A condição inicial escolhe a curva.' },
      { tex: 'A = 90', say: 'A igual a 90', why: 'Em t = 0 daria 20 + 90 = 110 °C. Lembre do +20 da sala.', wrong: { kind: 'curve', f: (t) => 20 + 90 * exp(-K_COOL * t), label: 'começa em 110 °C' } },
      { tex: 'A = 20', say: 'A igual a 20', why: 'Daria 20 + 20 = 40 °C no começo. A é a diferença inicial para a sala.', wrong: { kind: 'curve', f: (t) => 20 + 20 * exp(-K_COOL * t), label: 'começa em 40 °C' } },
      { tex: 'A = -70', say: 'A igual a menos 70', why: 'Daria −50 °C no começo: um café congelado que esquenta. O nosso começa a 90 °C.', wrong: { kind: 'curve', f: (t) => 20 - 70 * exp(-K_COOL * t), label: 'começa em −50 °C' } },
    ],
  },
  {
    prompt: 'Agora a fórmula prevê o futuro. Quanto marca o termômetro aos 10 minutos?',
    promptSay: 'Agora a fórmula prevê o futuro. Quanto marca o termômetro aos 10 minutos?',
    line: 'T(10) = 20 + 70\\,e^{-0{,}5} \\approx 62{,}5\\ ^\\circ\\mathrm{C}',
    lineSay: 'T de 10 igual a 20 mais 70 vezes e elevado a menos 0,5, aproximadamente 62,5 graus',
    options: [
      { tex: '\\approx 62{,}5\\ ^\\circ\\mathrm{C}', say: 'aproximadamente 62,5 graus', ok: true, why: 'e^(−0,5) ≈ 0,607; 70 × 0,607 ≈ 42,5; mais 20 dá 62,5 °C.' },
      { tex: '\\approx 55\\ ^\\circ\\mathrm{C}', say: 'aproximadamente 55 graus', why: 'Isso é 90 − 3,5 × 10: a reta. A queda freia, então sobra mais calor.', wrong: { kind: 'point', t: 10, y: 55, label: '55 °C: fora da curva' } },
      { tex: '\\approx 42{,}5\\ ^\\circ\\mathrm{C}', say: 'aproximadamente 42,5 graus', why: 'Esse é só 70·e^(−0,5). Faltou somar os 20 °C da sala.', wrong: { kind: 'point', t: 10, y: 42.5, label: '42,5 °C: faltou o +20' } },
    ],
  },
]

const f1 = (v: number) => v.toFixed(1).replace('.', ',')

export const EULER_STEPS: SolveStep[] = [
  {
    prompt: 'Problema 2: sem fórmula. Euler anda 5 min seguindo a inclinação de onde está (−3,5 °C/min). Onde chega?',
    promptSay: 'Problema 2: sem fórmula. Euler anda 5 minutos seguindo a inclinação de onde está, menos 3,5 graus por minuto. Onde chega?',
    line: 'T_1 = 90 + 5\\cdot(-3{,}5) = 72{,}5',
    lineSay: 'T 1 igual a 90 mais 5 vezes menos 3,5, igual a 72,5',
    options: [
      { tex: '72{,}5\\ ^\\circ\\mathrm{C}', say: '72,5 graus', ok: true, why: 'Queda de 3,5 °C por minuto, durante 5 minutos: 17,5 °C a menos.' },
      { tex: '86{,}5\\ ^\\circ\\mathrm{C}', say: '86,5 graus', why: 'Assim você andou só 1 minuto. O passo é h = 5: multiplique a inclinação por 5.', wrong: { kind: 'segment', t0: 0, y0: 90, t1: 5, y1: 86.5, label: '86,5 °C' } },
      { tex: f1(coffee(5)).replace(',', '{,}') + '\\ ^\\circ\\mathrm{C}', say: `${f1(coffee(5))} graus`, why: 'Esse é o valor exato. Euler não conhece a curva: só segue a reta tangente.', wrong: { kind: 'point', t: 5, y: coffee(5), label: 'valor exato' } },
      { tex: '107{,}5\\ ^\\circ\\mathrm{C}', say: '107,5 graus', why: 'A inclinação é negativa: o café esfria, não esquenta.', wrong: { kind: 'segment', t0: 0, y0: 90, t1: 5, y1: 107.5, label: '107,5 °C' } },
    ],
  },
  {
    prompt: 'Segundo passo, agora a partir de 72,5 °C. Onde Euler chega aos 10 min?',
    promptSay: 'Segundo passo, agora a partir de 72,5 graus. Onde Euler chega aos 10 minutos?',
    line: 'T_2 = 72{,}5 + 5\\cdot(-2{,}625) \\approx 59{,}4',
    lineSay: 'T 2 igual a 72,5 mais 5 vezes menos 2,625, aproximadamente 59,4',
    options: [
      { tex: '59{,}4\\ ^\\circ\\mathrm{C}', say: '59,4 graus', ok: true, why: 'Nova inclinação: −0,05 × 52,5 = −2,625. Vezes 5: 13,1 °C a menos.' },
      { tex: '55\\ ^\\circ\\mathrm{C}', say: '55 graus', why: 'Você repetiu a inclinação antiga (−3,5). A cada passo, recalcule a inclinação onde está.', wrong: { kind: 'segment', t0: 5, y0: 72.5, t1: 10, y1: 55, label: '55 °C' } },
      { tex: '69{,}9\\ ^\\circ\\mathrm{C}', say: '69,9 graus', why: 'A inclinação está certa, mas faltou multiplicar pelo passo h = 5.', wrong: { kind: 'segment', t0: 5, y0: 72.5, t1: 10, y1: 69.875, label: '69,9 °C' } },
    ],
  },
]

export const SEP_FIRST_LINE = { tex: '\\frac{dT}{dt} = -k\\,(T-20),\\quad T(0) = 90', say: 'd T d t igual a menos k vezes T menos 20, com T de zero igual a 90' }
export const EULER_FIRST_LINE = { tex: 'T_{n+1} = T_n + h\\cdot\\left(-0{,}05\\,(T_n - 20)\\right)', say: 'T n mais 1 igual a T n mais h vezes menos 0,05 vezes T n menos 20' }

export function wrongVisual(w: OdeLive['wrong']): WrongVisual | undefined {
  if (!w) return undefined
  const [kind, idx] = w.key.split('-')
  const list = kind === 'sep' ? SEPARATION : kind === 'euler' ? EULER_STEPS : null
  return list?.[Number(idx)]?.options[w.i]?.wrong
}
