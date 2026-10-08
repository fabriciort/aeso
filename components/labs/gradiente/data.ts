import { ascend, bisect, hills, norm, quadratic, rayToLevel, type Bump, type Field, type Vec2 } from '@/lib/math/surface'

// Terrains of "Subindo a montanha". Everything on the Palco lives in a square
// of "stage units" [−1, 1]²; each terrain maps it to its own math units
// (x = L·u, y = L·v) and draws heights as z = zs·f.

export interface Terrain {
  id: 'montanha' | 'rio' | 'vale'
  field: Field
  /** Half-width of the square, in math units. */
  L: number
  /** Stage height per unit of f. */
  zs: number
  /** Level curves (values of f). */
  levels: number[]
  /** Length on the map per unit of gradient (arrows), in math units. */
  arrow: number
}

const range = (a: number, b: number, step: number) => {
  const out: number[] = []
  for (let v = a; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6)
  return out
}

// 1) The imagined mountain (exemplo imaginado). x, y and f in km, so the
// gradient is a plain number: 0,5 means "sobe 50 cm a cada metro".
export const MOUNTAIN_BUMPS: Bump[] = [
  { x: 0.55, y: 0.35, h: 0.82, sx: 0.62, sy: 1.05, rot: 0.3 }, // main peak, steep to the east
  { x: -0.55, y: 0.25, h: 0.42, sx: 1.25, sy: 1.35 }, // broad western shoulder: gentle slope
  { x: -1.75, y: -1.45, h: 0.5, sx: 0.48, sy: 0.55 }, // a smaller, false summit
  { x: 1.4, y: -1.7, h: 0.16, sx: 0.5, sy: 0.4 }, // a little knoll
]
export const MOUNTAIN: Terrain = { id: 'montanha', field: hills(MOUNTAIN_BUMPS), L: 3, zs: 0.5, levels: range(0.1, 1.5, 0.1), arrow: 0.9 }

// 2) Pão de Açúcar and Morro da Urca (Rio de Janeiro): real summit heights
// (396 m and ≈ 220 m), shape simplified as gaussians. x, y and f in km.
export const RIO_BUMPS: Bump[] = [
  { x: 0.42, y: 0.12, h: 0.3907, sx: 0.2, sy: 0.27, rot: -0.45 }, // Pão de Açúcar
  { x: -0.38, y: -0.02, h: 0.2, sx: 0.3, sy: 0.24, rot: 0.2 }, // Morro da Urca
  { x: -0.72, y: -0.4, h: 0.07, sx: 0.32, sy: 0.3 }, // gentle south-west flank (where the trail goes)
]
export const RIO: Terrain = { id: 'rio', field: hills(RIO_BUMPS), L: 1.5, zs: 1, levels: range(0.04, 0.4, 0.04), arrow: 0.22 }
export const PAO: Vec2 = ascend(RIO.field, [0.42, 0.12])
export const URCA: Vec2 = ascend(RIO.field, [-0.38, -0.02])
export const PRAIA_VERMELHA: Vec2 = [-0.95, -0.85]
/** Where we look at a trail on the Urca's gentle flank. */
export const TRAIL_POINT: Vec2 = [-0.62, -0.33]

// 3) The valley f = x² + 3y² (Resolva and E se…?).
export const BOWL_A = 1
export const BOWL_B = 3
export const BOWL: Terrain = { id: 'vale', field: quadratic(BOWL_A, BOWL_B), L: 4, zs: 0.018, levels: range(2, 62, 4), arrow: 0.25 }

export const TERRAINS = [MOUNTAIN, RIO, BOWL] as const
export type TerrainIndex = 0 | 1 | 2

// ------------------------------------------------------------ mountain landmarks

export const SUMMIT: Vec2 = ascend(MOUNTAIN.field, [0.55, 0.35])
export const SUMMIT_H = MOUNTAIN.field.f(...SUMMIT)
export const FALSE_SUMMIT: Vec2 = ascend(MOUNTAIN.field, [-1.75, -1.45])
export const FALSE_SUMMIT_H = MOUNTAIN.field.f(...FALSE_SUMMIT)
export const HIKER_START: Vec2 = [-2.3, 2.2]
/** The student "found" the summit when this close in height (km). */
export const SUMMIT_TOL = 0.015

// Preveja: two trails between the 300 m and 600 m curves, one on the steep
// east face (A) and one on the gentle west shoulder (B).
function trail(dir: Vec2): [Vec2, Vec2] {
  const n = Math.hypot(dir[0], dir[1])
  const d: Vec2 = [dir[0] / n, dir[1] / n]
  return [rayToLevel(MOUNTAIN.field, SUMMIT, d, 0.3), rayToLevel(MOUNTAIN.field, SUMMIT, d, 0.6)]
}
export const TRAIL_A = trail([1, -0.15])
export const TRAIL_B = trail([-1, -0.25])
export const trailLength = (t: [Vec2, Vec2]) => Math.hypot(t[1][0] - t[0][0], t[1][1] - t[0][1])

/**
 * Entenda: a point on the southern slope where ∂f/∂x = 0 but ∂f/∂y is not:
 * the east–west slice is flat there, yet you are not on the summit.
 */
export const RIDGE_POINT: Vec2 = (() => {
  const y = SUMMIT[1] - 0.75
  const x = bisect((x) => MOUNTAIN.field.grad(x, y)[0], SUMMIT[0] - 0.9, SUMMIT[0] + 0.9)
  return [x, y]
})()
export const isRidgePoint = (p: Vec2) => {
  const [gx, gy] = MOUNTAIN.field.grad(p[0], p[1])
  return Math.abs(gx) < 0.03 && Math.abs(gy) > 0.12
}

/** Steepest point of the Rio map (for the "toque no ponto mais íngreme" task). */
export const RIO_STEEPEST: { p: Vec2; slope: number } = (() => {
  let best = { p: [0, 0] as Vec2, slope: 0 }
  for (let j = 0; j <= 150; j++)
    for (let i = 0; i <= 150; i++) {
      const x = -RIO.L + (2 * RIO.L * i) / 150
      const y = -RIO.L + (2 * RIO.L * j) / 150
      const s = norm(RIO.field.grad(x, y))
      if (s > best.slope) best = { p: [x, y], slope: s }
    }
  return best
})()
export const RIO_MAX_SLOPE = RIO_STEEPEST.slope
/** A tap counts as "the steepest" when it is at least this fraction of the maximum. */
export const STEEP_OK = 0.8

// ------------------------------------------------------------ Resolva & E se…?

export const P1: Vec2 = [1, 1]
export const U_DIR: Vec2 = [0.6, 0.8]
export const P3: Vec2 = [-2, 0.5]
export const DESCENT_START: Vec2 = [-2.5, 1.2]
export const DESCENT_BOUND = 3.4
export const ETA_MIN = 0.01
export const ETA_MAX = 0.4

// ------------------------------------------------------------ live values

export type GradLive = {
  /** Hiker on the mountain, in km. */
  hx: number
  hy: number
  /** Turntable angle chosen by dragging. */
  yaw: number
  /** Highest point reached so far (km). */
  best: number
  /** Resolva, problem 3: the arrow the student builds. */
  vx: number
  vy: number
  /** Observe: direction of the trail, angle (rad) measured from ∇f. */
  trailAngle: number
  /** E se…?: step size and a token that restarts the walk. */
  eta: number
  run: number
  /** Resolva: the option on screen (the Palco shows why it works or not). */
  pick: { prob: string; step: string; show?: Show; ok?: boolean } | null
}

export const toKm = (km: number) => Math.round(km * 1000)

// ------------------------------------------------------------ Resolva

/** What the Palco shows for a choice: a tangent slope, an arrow, a length or a projection. */
export interface Show {
  slope?: number
  vec?: Vec2
  len?: number
  proj?: number
}
export interface Option {
  tex: string
  say: string
  ok?: boolean
  why: string
  show?: Show
}
export interface SolveStep {
  id: string
  prompt: string
  options: Option[]
  line: string
  lineSay: string
}
export interface Problem {
  id: 'p1' | 'p2' | 'p3'
  title: string
  titleSay: string
  steps: SolveStep[]
}

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 'f(x,y) = x^2 + 3y^2 \\ \\text{em}\\ (1,\\,1)',
    titleSay: 'f de x e y igual a x ao quadrado mais 3 y ao quadrado, no ponto 1, 1',
    steps: [
      {
        id: 'dx',
        prompt: 'Passo 1: ∂f/∂x. Na fatia y = 1, só x anda; y é um número parado. Qual é a derivada?',
        options: [
          { tex: '2x', say: '2 x', ok: true, why: 'Só x anda: x² vira 2x e 3y² é constante, deriva para 0. Em x = 1, inclinação 2: a reta toca a fatia.', show: { slope: 2 } },
          { tex: '2x + 3y^2', say: '2 x mais 3 y ao quadrado', why: 'Veja a reta torta. Com y parado, 3y² é só um número, e a derivada de um número é 0.', show: { slope: 5 } },
          { tex: 'x^2', say: 'x ao quadrado', why: 'Isso é a própria fatia, não a inclinação dela. Derive x²: a reta não acompanha a curva.', show: { slope: 1 } },
          { tex: '2x + 6y', say: '2 x mais 6 y', why: 'Você derivou y também. Nesta fatia y fica parado: a reta saiu íngreme demais.', show: { slope: 8 } },
        ],
        line: '\\partial f/\\partial x = 2x \\quad\\Rightarrow\\quad 2',
        lineSay: 'derivada parcial de f em x igual a 2 x, que no ponto vale 2',
      },
      {
        id: 'dy',
        prompt: 'Passo 2: ∂f/∂y. Agora a fatia é x = 1: quem anda é y. Qual é a derivada?',
        options: [
          { tex: '6y', say: '6 y', ok: true, why: '3y² vira 3·2y = 6y e x² é constante. Em y = 1, inclinação 6: bem mais íngreme que no outro corte.', show: { slope: 6 } },
          { tex: '2y', say: '2 y', why: 'Faltou o 3 da frente: a derivada de 3y² é 3·2y. Veja a reta, rasa demais.', show: { slope: 2 } },
          { tex: 'x^2 + 6y', say: 'x ao quadrado mais 6 y', why: 'Com x parado, x² é só um número: deriva para 0. A reta saiu torta.', show: { slope: 7 } },
          { tex: '3y^2', say: '3 y ao quadrado', why: 'Essa é a fatia, não a inclinação. Derive 3y²: a reta não acompanha a curva.', show: { slope: 3 } },
        ],
        line: '\\partial f/\\partial y = 6y \\quad\\Rightarrow\\quad 6',
        lineSay: 'derivada parcial de f em y igual a 6 y, que no ponto vale 6',
      },
      {
        id: 'vec',
        prompt: 'Passo 3: junte as duas inclinações numa seta. Quanto vale ∇f(1, 1)?',
        options: [
          { tex: '(2,\\ 6)', say: '2 vírgula 6', ok: true, why: 'Primeiro a inclinação em x, depois em y. Veja: a seta cruza a curva de nível em ângulo reto.', show: { vec: [2, 6] } },
          { tex: '(6,\\ 2)', say: '6 vírgula 2', why: 'Trocou a ordem. Veja: essa seta não cruza a curva de nível em ângulo reto.', show: { vec: [6, 2] } },
          { tex: '2 + 6 = 8', say: '2 mais 6 igual a 8', why: 'O gradiente é uma seta, não um número: precisa dizer para onde subir. Monte o par.' },
          { tex: '(2x,\\ 6y)', say: '2 x vírgula 6 y', why: 'Essa é a regra para qualquer ponto. No ponto (1, 1), troque x e y pelos números.' },
        ],
        line: '\\nabla f(1,1) = (2,\\ 6)',
        lineSay: 'gradiente de f no ponto 1, 1 igual a 2, 6',
      },
      {
        id: 'len',
        prompt: 'Passo 4: quão íngreme é a subida máxima? É o comprimento da seta, |∇f|.',
        options: [
          { tex: '\\sqrt{40} \\approx 6{,}32', say: 'raiz de 40, aproximadamente 6 vírgula 32', ok: true, why: 'Pitágoras: √(2² + 6²) = √40 ≈ 6,32. Nenhuma direção sobe mais rápido que isso.', show: { len: Math.sqrt(40) } },
          { tex: '2 + 6 = 8', say: '2 mais 6 igual a 8', why: 'Somar os catetos dá o caminho em L, mais longo que a diagonal. Use Pitágoras.', show: { len: 8 } },
          { tex: '40', say: '40', why: 'Quase! 2² + 6² = 40 é o quadrado do comprimento. Falta a raiz.', show: { len: 40 } },
          { tex: '6', say: '6', why: 'Esse é só o cateto maior. A diagonal é sempre mais longa que os catetos.', show: { len: 6 } },
        ],
        line: '|\\nabla f| = \\sqrt{2^2 + 6^2} = \\sqrt{40} \\approx 6{,}32',
        lineSay: 'módulo do gradiente igual a raiz de 2 ao quadrado mais 6 ao quadrado, raiz de 40, aproximadamente 6 vírgula 32',
      },
    ],
  },
  {
    id: 'p2',
    title: 'D_u f(1,1),\\ \\ u = (0{,}6;\\ 0{,}8)',
    titleSay: 'derivada direcional de f no ponto 1, 1, na direção u igual a 0 vírgula 6, 0 vírgula 8',
    steps: [
      {
        id: 'dir',
        prompt: 'Problema 2: andando na direção u = (0,6; 0,8), quanto f sobe por unidade? Use ∇f = (2, 6).',
        options: [
          { tex: '6', say: '6', ok: true, why: '∇f · u = 2·0,6 + 6·0,8 = 1,2 + 4,8 = 6: a sombra de ∇f sobre a direção u.', show: { proj: 6 } },
          { tex: '\\approx 6{,}32', say: 'aproximadamente 6 vírgula 32', why: 'Esse é o máximo, só na direção do próprio ∇f. A seta u aponta para outro lado: projete.', show: { proj: Math.sqrt(40) } },
          { tex: '5{,}2', say: '5 vírgula 2', why: 'Trocou os pares. Multiplique x com x e y com y: 2·0,6 + 6·0,8.', show: { proj: 5.2 } },
          { tex: '8', say: '8', why: 'Faltou a direção: cada componente de ∇f é multiplicada pela de u.', show: { proj: 8 } },
        ],
        line: 'D_u f = \\nabla f \\cdot u = 2(0{,}6) + 6(0{,}8) = 6',
        lineSay: 'derivada direcional igual a gradiente escalar u, 2 vezes 0 vírgula 6 mais 6 vezes 0 vírgula 8, igual a 6',
      },
    ],
  },
  {
    id: 'p3',
    title: '\\nabla f(-2;\\ 0{,}5) = \\ ?',
    titleSay: 'gradiente de f no ponto menos 2, 0 vírgula 5',
    steps: [],
  },
]
export const P3_ANSWER: Vec2 = [-4, 3]
export const P3_LINE = '\\nabla f(-2;\\ 0{,}5) = (2\\cdot(-2),\\ 6\\cdot 0{,}5) = (-4,\\ 3)'
export const P3_SAY = 'gradiente no ponto menos 2, 0 vírgula 5, igual a menos 4, 3'

/** Gradient ascent from the trailhead to the summit (Conclua). */
export const ASCENT_PATH: Vec2[] = (() => {
  const out: Vec2[] = [HIKER_START]
  let p = HIKER_START
  for (let i = 0; i < 600; i++) {
    const [gx, gy] = MOUNTAIN.field.grad(p[0], p[1])
    const n = Math.hypot(gx, gy)
    if (n < 1e-3) break
    p = [p[0] + (0.04 * gx) / Math.max(n, 0.15), p[1] + (0.04 * gy) / Math.max(n, 0.15)]
    out.push(p)
  }
  return out
})()
