// Física do laboratório "Coloque um planeta em órbita".
//
// Unidades adimensionais para a simulação perto da Terra: comprimento em
// raios terrestres (R), tempo em √(R³/GM) ≈ 806 s, de modo que GM = 1 e a
// velocidade circular rente ao chão vale 1 (≈ 7,91 km/s). Assim o
// integrador (Verlet de velocidade) trabalha com números perto de 1.
//
// Fontes: GM da Terra = 3,986004418 × 10¹⁴ m³/s² e raio médio 6371 km
// (IERS/IAU); GM do Sol = 1,32712440018 × 10²⁰ m³/s²; dados planetários do
// NASA Planetary Fact Sheet.

export const GM_EARTH = 3.986004418e14 // m³/s²
export const R_EARTH = 6.371e6 // m
export const GM_SUN = 1.32712440018e20 // m³/s²
export const AU = 1.495978707e11 // m
export const YEAR = 365.25 * 86400 // s

/** Altura física do canhão de Newton nas contas (o desenho a exagera). */
export const CANNON_ALTITUDE = 30e3 // m

/** Unidade de velocidade da simulação: √(GM/R) em m/s (≈ 7,91 km/s). */
export const V_UNIT = Math.sqrt(GM_EARTH / R_EARTH)
/** Unidade de tempo da simulação: √(R³/GM) em s (≈ 806 s). */
export const T_UNIT = Math.sqrt(R_EARTH ** 3 / GM_EARTH)

/** Velocidade de órbita circular a uma distância r do centro (m/s). */
export function vCircular(r: number, gm = GM_EARTH): number {
  return Math.sqrt(gm / r)
}

/** Velocidade de escape a uma distância r do centro (m/s): √2 × a circular. */
export function vEscape(r: number, gm = GM_EARTH): number {
  return Math.sqrt((2 * gm) / r)
}

/** Período de uma órbita circular de raio r (s). */
export function circularPeriod(r: number, gm = GM_EARTH): number {
  return 2 * Math.PI * Math.sqrt(r ** 3 / gm)
}

/** Gravidade a uma altura h, como fração da gravidade na superfície. */
export function gravityFraction(h: number, R = R_EARTH): number {
  return (R / (R + h)) ** 2
}

/** 3ª lei de Kepler para o Sol: período em anos para a em UA. */
export function keplerPeriodYears(aAU: number): number {
  return aAU ** 1.5
}

// ------------------------------------------------------------ simulação

export interface Body {
  x: number
  y: number
  vx: number
  vy: number
}

/** km/s → unidade de velocidade da simulação. */
export const toSimSpeed = (kms: number) => (kms * 1000) / V_UNIT
/** unidade de velocidade da simulação → km/s. */
export const toKms = (v: number) => (v * V_UNIT) / 1000

/** Raio de lançamento (em raios terrestres) do canhão. */
export const LAUNCH_R = 1 + CANNON_ALTITUDE / R_EARTH

/** Estado inicial da bala: no topo da Terra, disparada na horizontal (+x). */
export function launchState(vKms: number, r0 = LAUNCH_R): Body {
  return { x: 0, y: r0, vx: toSimSpeed(vKms), vy: 0 }
}

function accel(x: number, y: number, mu: number): [number, number] {
  const r2 = x * x + y * y
  const r = Math.sqrt(r2)
  const k = -mu / (r2 * r)
  return [k * x, k * y]
}

/** Um passo de Verlet de velocidade (simplético: conserva bem a energia). */
export function verletStep(b: Body, dt: number, mu = 1): Body {
  const [ax, ay] = accel(b.x, b.y, mu)
  const vxh = b.vx + 0.5 * dt * ax
  const vyh = b.vy + 0.5 * dt * ay
  const x = b.x + dt * vxh
  const y = b.y + dt * vyh
  const [ax2, ay2] = accel(x, y, mu)
  return { x, y, vx: vxh + 0.5 * dt * ax2, vy: vyh + 0.5 * dt * ay2 }
}

/** Energia específica (cinética + potencial). */
export function energy(b: Body, mu = 1): number {
  return 0.5 * (b.vx * b.vx + b.vy * b.vy) - mu / Math.hypot(b.x, b.y)
}

export interface Elements {
  energy: number
  /** Semieixo maior (Infinity/negativo se não estiver presa). */
  a: number
  e: number
  /** Distância mínima ao centro (perigeu). */
  rp: number
  /** Distância máxima (Infinity se escapa). */
  ra: number
  /** Período (Infinity se escapa). */
  period: number
  bound: boolean
}

/** Elementos orbitais de um estado (problema de dois corpos). */
export function elements(b: Body, mu = 1): Elements {
  const E = energy(b, mu)
  const h = b.x * b.vy - b.y * b.vx
  const e = Math.sqrt(Math.max(0, 1 + (2 * E * h * h) / (mu * mu)))
  const p = (h * h) / mu
  const rp = p / (1 + e)
  const bound = E < 0
  const a = bound ? -mu / (2 * E) : Infinity
  const ra = bound ? a * (1 + e) : Infinity
  const period = bound ? 2 * Math.PI * Math.sqrt(a ** 3 / mu) : Infinity
  return { energy: E, a, e, rp, ra, period, bound }
}

export type Trajectory = 'cai' | 'circulo' | 'elipse' | 'escapa'

export const TRAJECTORY_LABEL: Record<Trajectory, string> = {
  cai: 'Cai',
  circulo: 'Círculo',
  elipse: 'Elipse',
  escapa: 'Escapa!',
}

/** Tipo de trajetória de uma bala disparada na horizontal do canhão. */
export function classify(vKms: number, r0 = LAUNCH_R): Trajectory {
  const el = elements(launchState(vKms, r0))
  if (!el.bound) return 'escapa'
  if (el.rp < 1) return 'cai'
  return el.e < 0.03 ? 'circulo' : 'elipse'
}

/**
 * Integra até a bala tocar o chão (r ≤ 1) ou até tMax. Devolve o tempo de voo
 * (unidades da simulação) e o ângulo percorrido sobre a Terra (rad).
 */
export function flight(vKms: number, tMax = 40, dt = 0.0015): { time: number; angle: number; landed: boolean } {
  let b = launchState(vKms)
  let t = 0
  let angle = 0
  let prev = Math.atan2(b.y, b.x)
  while (t < tMax) {
    b = verletStep(b, dt)
    t += dt
    const th = Math.atan2(b.y, b.x)
    let d = th - prev
    if (d > Math.PI) d -= 2 * Math.PI
    if (d < -Math.PI) d += 2 * Math.PI
    angle += Math.abs(d)
    prev = th
    if (Math.hypot(b.x, b.y) <= 1) return { time: t, angle, landed: true }
  }
  return { time: t, angle, landed: false }
}

// ------------------------------------------------------------ Kepler

/** Resolve a equação de Kepler M = E − e·sen E (Newton). */
export function solveKepler(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI
  for (let i = 0; i < 30; i++) {
    const f = E - e * Math.sin(E) - M
    const d = 1 - e * Math.cos(E)
    const step = f / d
    E -= step
    if (Math.abs(step) < 1e-13) break
  }
  return E
}

/** Posição numa elipse com o foco na origem e o periélio em +x. */
export function keplerPosition(a: number, e: number, M: number): { x: number; y: number; r: number } {
  const E = solveKepler(M, e)
  const x = a * (Math.cos(E) - e)
  const y = a * Math.sqrt(1 - e * e) * Math.sin(E)
  return { x, y, r: Math.hypot(x, y) }
}

/** Velocidade pela equação vis-viva: v = √(GM(2/r − 1/a)). */
export function visViva(gm: number, a: number, r: number): number {
  return Math.sqrt(gm * (2 / r - 1 / a))
}

/** Área de um leque com vértice no foco (origem) por pontos da curva (fórmula do laço). */
export function fanArea(points: { x: number; y: number }[]): number {
  let s = 0
  for (let i = 0; i < points.length - 1; i++) s += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y
  return Math.abs(s) / 2
}

/** Área varrida entre as anomalias médias M0 e M1 (integração numérica). */
export function sweptArea(a: number, e: number, M0: number, M1: number, n = 200): number {
  const pts = []
  for (let i = 0; i <= n; i++) pts.push(keplerPosition(a, e, M0 + ((M1 - M0) * i) / n))
  return fanArea(pts)
}

// ------------------------------------------------------------ Sistema Solar

export interface PlanetData {
  name: string
  /** Semieixo maior (UA). */
  a: number
  /** Período orbital (anos). */
  T: number
}

/** NASA Planetary Fact Sheet. */
export const PLANETS: PlanetData[] = [
  { name: 'Mercúrio', a: 0.387, T: 0.241 },
  { name: 'Vênus', a: 0.723, T: 0.615 },
  { name: 'Terra', a: 1, T: 1 },
  { name: 'Marte', a: 1.524, T: 1.881 },
  { name: 'Júpiter', a: 5.203, T: 11.862 },
  { name: 'Saturno', a: 9.537, T: 29.457 },
]

/** Melhor k em T² = k·a³ (mínimos quadrados por uma reta pela origem). */
export function fitKepler(planets: PlanetData[] = PLANETS): number {
  let sxy = 0
  let sxx = 0
  for (const p of planets) {
    const x = p.a ** 3
    const y = p.T ** 2
    sxy += x * y
    sxx += x * x
  }
  return sxy / sxx
}
