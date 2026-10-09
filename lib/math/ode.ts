// Equações diferenciais de 1ª ordem, dy/dt = f(t, y): campo de direções,
// métodos numéricos (Euler e Runge-Kutta 4) e as soluções exatas usadas no
// laboratório "A equação que prevê o futuro". Funções puras, sem DOM.

export type Rhs = (t: number, y: number) => number

export interface Pt {
  t: number
  y: number
}

// ------------------------------------------------------------ campo de direções

export interface FieldSample {
  t: number
  y: number
  /** Inclinação dy/dt naquele ponto. */
  slope: number
}

/** Amostra a inclinação f(t, y) numa grade nx × ny dentro da janela (centros das células). */
export function slopeField(f: Rhs, v: { x0: number; x1: number; y0: number; y1: number }, nx: number, ny: number): FieldSample[] {
  const out: FieldSample[] = []
  for (let i = 0; i < nx; i++) {
    const t = v.x0 + ((i + 0.5) * (v.x1 - v.x0)) / nx
    for (let j = 0; j < ny; j++) {
      const y = v.y0 + ((j + 0.5) * (v.y1 - v.y0)) / ny
      out.push({ t, y, slope: f(t, y) })
    }
  }
  return out
}

// ------------------------------------------------------------ métodos numéricos

/** Um passo de Euler: segue a reta tangente do ponto atual por h. */
export function eulerStep(f: Rhs, t: number, y: number, h: number): number {
  return y + h * f(t, y)
}

/** Um passo de Runge-Kutta clássico (4ª ordem). */
export function rk4Step(f: Rhs, t: number, y: number, h: number): number {
  const k1 = f(t, y)
  const k2 = f(t + h / 2, y + (h / 2) * k1)
  const k3 = f(t + h / 2, y + (h / 2) * k2)
  const k4 = f(t + h, y + h * k3)
  return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
}

function march(step: (f: Rhs, t: number, y: number, h: number) => number, f: Rhs, t0: number, y0: number, h: number, tEnd: number): Pt[] {
  if (!(h > 0)) throw new Error('O passo h precisa ser positivo')
  const n = Math.max(0, Math.ceil((tEnd - t0) / h - 1e-9))
  const out: Pt[] = [{ t: t0, y: y0 }]
  let y = y0
  for (let i = 0; i < n; i++) {
    const t = t0 + i * h
    y = step(f, t, y, h)
    out.push({ t: t0 + (i + 1) * h, y })
  }
  return out
}

/** Método de Euler de t0 até (pelo menos) tEnd, com passo h. Devolve os nós. */
export function euler(f: Rhs, t0: number, y0: number, h: number, tEnd: number): Pt[] {
  return march(eulerStep, f, t0, y0, h, tEnd)
}

/** Runge-Kutta 4 de t0 até (pelo menos) tEnd, com passo h. */
export function rk4(f: Rhs, t0: number, y0: number, h: number, tEnd: number): Pt[] {
  return march(rk4Step, f, t0, y0, h, tEnd)
}

/** Valor da poligonal que liga os nós (interpolação linear; constante fora dos extremos). */
export function interpolate(points: Pt[], t: number): number {
  if (!points.length) return NaN
  if (t <= points[0].t) return points[0].y
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (t <= b.t) return a.y + ((b.y - a.y) * (t - a.t)) / (b.t - a.t)
  }
  return points[points.length - 1].y
}

/** Maior erro |numérico − exato| nos nós. */
export function maxError(points: Pt[], exact: (t: number) => number): number {
  return points.reduce((m, p) => Math.max(m, Math.abs(p.y - exact(p.t))), 0)
}

/** Distância média |y − exato(t)| de pontos (ex.: um desenho à mão) até a curva exata. */
export function meanAbsDeviation(samples: Pt[], exact: (t: number) => number): number {
  if (!samples.length) return NaN
  return samples.reduce((s, p) => s + Math.abs(p.y - exact(p.t)), 0) / samples.length
}

// ------------------------------------------------------------ resfriamento de Newton

/** dT/dt = −k (T − Tamb). */
export const coolingRhs =
  (k: number, ambient: number): Rhs =>
  (_t, T) =>
    -k * (T - ambient)

/** Solução exata: T(t) = Tamb + (T0 − Tamb)·e^(−kt). */
export function newtonCooling(T0: number, ambient: number, k: number) {
  return (t: number) => ambient + (T0 - ambient) * Math.exp(-k * t)
}

/** Tempo até a temperatura chegar a `target` (infinito se nunca chega: a curva só se aproxima de Tamb). */
export function coolingTimeTo(T0: number, ambient: number, k: number, target: number): number {
  const r = (target - ambient) / (T0 - ambient)
  if (!(r > 0) || r > 1) return Infinity
  return -Math.log(r) / k
}

// ------------------------------------------------------------ decaimento exponencial

/** dN/dt = −λN. */
export const decayRhs =
  (lambda: number): Rhs =>
  (_t, N) =>
    -lambda * N

/** N(t) = N0·e^(−λt). */
export function exponentialDecay(N0: number, lambda: number) {
  return (t: number) => N0 * Math.exp(-lambda * t)
}

/** λ = ln 2 / meia-vida. */
export function lambdaFromHalfLife(halfLife: number): number {
  return Math.LN2 / halfLife
}

/** Idade de uma amostra que guarda `fraction` do original: t = meia-vida · log₂(1/fração). */
export function ageFromFraction(fraction: number, halfLife: number): number {
  if (!(fraction > 0) || fraction > 1) return NaN
  return halfLife * Math.log2(1 / fraction)
}

// ------------------------------------------------------------ crescimento logístico

/** dP/dt = rP(1 − P/K). */
export const logisticRhs =
  (r: number, K: number): Rhs =>
  (_t, P) =>
    r * P * (1 - P / K)

/** P(t) = K / (1 + ((K − P0)/P0)·e^(−rt)). */
export function logistic(P0: number, r: number, K: number) {
  return (t: number) => {
    if (P0 === 0) return 0
    return K / (1 + ((K - P0) / P0) * Math.exp(-r * t))
  }
}

// ------------------------------------------------------------ equilíbrios (linha de fase)

export interface Equilibrium {
  y: number
  /** Estável: as setas vizinhas apontam para ele (f'(y*) < 0). */
  stable: boolean
}

/**
 * Equilíbrios de uma equação autônoma dy/dt = g(y) em [a, b]: zeros de g,
 * achados por troca de sinal numa grade e refinados por bisseção.
 */
export function equilibria(g: (y: number) => number, a: number, b: number, n = 600): Equilibrium[] {
  const roots: number[] = []
  const push = (y: number) => {
    if (!roots.some((r) => Math.abs(r - y) < ((b - a) / n) * 1.5)) roots.push(y)
  }
  let ya = a
  let ga = g(a)
  if (ga === 0) push(a)
  for (let i = 1; i <= n; i++) {
    const yb = a + ((b - a) * i) / n
    const gb = g(yb)
    if (gb === 0) push(yb)
    else if (ga !== 0 && Math.sign(ga) !== Math.sign(gb)) {
      let lo = ya
      let hi = yb
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2
        if (Math.sign(g(mid)) === Math.sign(g(lo))) lo = mid
        else hi = mid
      }
      push((lo + hi) / 2)
    }
    ya = yb
    ga = gb
  }
  const d = (b - a) * 1e-6
  return roots
    .sort((p, q) => p - q)
    .map((y) => ({ y, stable: (g(y + d) - g(y - d)) / (2 * d) < 0 }))
}
