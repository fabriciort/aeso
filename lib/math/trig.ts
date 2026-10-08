// Trigonometria pura para o laboratório "A roda que vira onda"
// (circulo-trigonometrico). Ângulos em radianos, salvo quando o nome diz
// "Deg". Sem dependências de interface: tudo aqui é testável.

export const TAU = Math.PI * 2

export const toRad = (deg: number) => (deg * Math.PI) / 180
export const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Ângulo levado para [0, 2π). */
export function wrapAngle(t: number): number {
  const r = t % TAU
  const w = r < 0 ? r + TAU : r
  return Math.abs(w - TAU) < 1e-12 ? 0 : w
}

/** Diferença angular mais curta de `from` para `to`, em (−π, π]. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % TAU
  if (d <= -Math.PI) d += TAU
  if (d > Math.PI) d -= TAU
  return d
}

/** O ponto P do círculo unitário: x = cos θ, y = sen θ. */
export function unitPoint(t: number): { x: number; y: number } {
  return { x: Math.cos(t), y: Math.sin(t) }
}

/** Quadrante de θ (1 a 4), ou 0 se o ponto está sobre um eixo. */
export function quadrant(t: number, eps = 1e-9): 0 | 1 | 2 | 3 | 4 {
  const { x, y } = unitPoint(t)
  if (Math.abs(x) < eps || Math.abs(y) < eps) return 0
  if (x > 0 && y > 0) return 1
  if (x < 0 && y > 0) return 2
  if (x < 0) return 3
  return 4
}

/** Ângulo de referência: o ângulo agudo entre o raio de P e o eixo horizontal. */
export function referenceAngle(t: number): number {
  const w = wrapAngle(t)
  if (w <= Math.PI / 2) return w
  if (w <= Math.PI) return Math.PI - w
  if (w <= (3 * Math.PI) / 2) return w - Math.PI
  return TAU - w
}

/** Simetrias do círculo: espelho no eixo vertical, no horizontal e meia-volta pelo centro. */
export const reflectVertical = (t: number) => wrapAngle(Math.PI - t)
export const reflectHorizontal = (t: number) => wrapAngle(-t)
export const halfTurn = (t: number) => wrapAngle(t + Math.PI)

/** As soluções de sen θ = k em [0, 2π), em ordem. */
export function solveSin(k: number, eps = 1e-12): number[] {
  if (k > 1 + eps || k < -1 - eps) return []
  const a = Math.asin(Math.max(-1, Math.min(1, k)))
  return dedupe([wrapAngle(a), wrapAngle(Math.PI - a)])
}

/** As soluções de cos θ = k em [0, 2π), em ordem. */
export function solveCos(k: number, eps = 1e-12): number[] {
  if (k > 1 + eps || k < -1 - eps) return []
  const a = Math.acos(Math.max(-1, Math.min(1, k)))
  return dedupe([wrapAngle(a), wrapAngle(-a)])
}

function dedupe(xs: number[]): number[] {
  const out: number[] = []
  for (const x of xs.sort((a, b) => a - b)) if (!out.some((y) => Math.abs(y - x) < 1e-9)) out.push(x)
  return out
}

/** Comprimento do arco de ângulo θ (rad) num círculo de raio r: s = r·θ. */
export const arcLength = (theta: number, r = 1) => theta * r

/** Quantos raios cabem num arco de ângulo θ: é a medida em radianos. */
export const radiiInArc = (theta: number) => theta

// ------------------------------------------------------------ ondas

/** Onda triangular com os mesmos picos de sen θ (0 em 0, 1 em π/2, −1 em 3π/2). */
export function triangleWave(t: number): number {
  return (2 / Math.PI) * Math.asin(Math.sin(t))
}

/** Dente de serra de período 2π: sobe em linha reta de −1 a 1 e cai de uma vez. */
export function sawtoothWave(t: number): number {
  return wrapAngle(t + Math.PI) / Math.PI - 1
}

/** Rapidez com que a altura muda quando o ângulo muda: d(sen θ)/dθ = cos θ. */
export const heightRate = (t: number) => Math.cos(t)

export interface Sinusoid {
  /** Amplitude: o raio da roda. */
  A: number
  /** Frequência angular: rad por unidade de tempo. */
  w: number
  /** Deslocamento vertical: a altura do eixo. */
  d: number
}

/** h(t) = A·sen(ωt) + d. */
export function sinusoid({ A, w, d }: Sinusoid, t: number): number {
  return A * Math.sin(w * t) + d
}

export const period = (w: number) => TAU / w

/** Distância média (RMS) entre duas senoides em [0, T]. */
export function waveDistance(p: Sinusoid, q: Sinusoid, T = 4 * Math.PI, n = 240): number {
  let s = 0
  for (let i = 0; i <= n; i++) {
    const t = (T * i) / n
    const e = sinusoid(p, t) - sinusoid(q, t)
    s += e * e
  }
  return Math.sqrt(s / (n + 1))
}

/** Cada parâmetro dentro da tolerância? */
export function sinusoidMatches(p: Sinusoid, q: Sinusoid, tol = { A: 0.08, w: 0.08, d: 0.08 }): boolean {
  return Math.abs(p.A - q.A) <= tol.A && Math.abs(p.w - q.w) <= tol.w && Math.abs(p.d - q.d) <= tol.d
}

// ------------------------------------------------------------ London Eye

/**
 * London Eye (site oficial, londoneye.com): 135 m de altura, roda de 120 m
 * de diâmetro, uma volta em cerca de 30 minutos. O eixo fica a 135 − 60 =
 * 75 m do chão; a base da roda, a ≈ 15 m.
 */
export const LONDON_EYE = { height: 135, diameter: 120, periodMin: 30 } as const

export interface Wheel {
  height: number
  diameter: number
  periodMin: number
}

export const wheelRadius = (w: Wheel = LONDON_EYE) => w.diameter / 2
export const wheelHub = (w: Wheel = LONDON_EYE) => w.height - w.diameter / 2
export const wheelBase = (w: Wheel = LONDON_EYE) => w.height - w.diameter

/** Altura (m) da cabine que embarcou embaixo, t minutos depois: h = 75 − 60·cos(2πt/30). */
export function wheelHeight(tMin: number, w: Wheel = LONDON_EYE): number {
  return wheelHub(w) - wheelRadius(w) * Math.cos((TAU * tMin) / w.periodMin)
}

/** Ângulo da cabine no círculo (medido a partir da direita, anti-horário): começa em −π/2 (embaixo). */
export function wheelAngle(tMin: number, w: Wheel = LONDON_EYE): number {
  return (TAU * tMin) / w.periodMin - Math.PI / 2
}

/** Intervalo de uma volta em que a cabine fica acima de `h` metros. */
export function timeAbove(h: number, w: Wheel = LONDON_EYE): { t1: number; t2: number; duration: number } | null {
  const T = w.periodMin
  const c = (wheelHub(w) - h) / wheelRadius(w)
  if (c <= -1) return null
  if (c >= 1) return { t1: 0, t2: T, duration: T }
  const t1 = (T * Math.acos(c)) / TAU
  return { t1, t2: T - t1, duration: T - 2 * t1 }
}

// ------------------------------------------------------------ notação

const EXACT: [number, string, string][] = [
  [0, '0', '0'],
  [0.5, '\\tfrac{1}{2}', 'um meio'],
  [Math.SQRT2 / 2, '\\tfrac{\\sqrt{2}}{2}', 'raiz de dois sobre dois'],
  [Math.sqrt(3) / 2, '\\tfrac{\\sqrt{3}}{2}', 'raiz de três sobre dois'],
  [1, '1', 'um'],
]

/** Valor exato de sen/cos dos ângulos notáveis, em TeX e falado; null se não for notável. */
export function exactValue(v: number, eps = 1e-6): { tex: string; say: string } | null {
  for (const [x, tex, say] of EXACT) {
    if (Math.abs(Math.abs(v) - x) < eps) {
      if (x === 0) return { tex, say }
      return v < 0 ? { tex: `-${tex}`, say: `menos ${say}` } : { tex, say }
    }
  }
  return null
}

/**
 * θ como múltiplo de π, quando for múltiplo de π/12 (ex.: "5π/6"); null
 * caso contrário. `tex` usa \tfrac; `text` é texto puro.
 */
export function piFraction(t: number, eps = 1e-6): { tex: string; text: string; say: string } | null {
  const n = t / (Math.PI / 12)
  const k = Math.round(n)
  if (Math.abs(n - k) > eps) return null
  if (k === 0) return { tex: '0', text: '0', say: 'zero' }
  const g = gcd(Math.abs(k), 12)
  const num = k / g
  const den = 12 / g
  const sign = num < 0 ? '-' : ''
  const a = Math.abs(num)
  const numTex = a === 1 ? '\\pi' : `${a}\\pi`
  const numText = a === 1 ? 'π' : `${a}π`
  const numSay = a === 1 ? 'pi' : `${a} pi`
  if (den === 1) return { tex: `${sign}${numTex}`, text: `${sign ? '−' : ''}${numText}`, say: `${sign ? 'menos ' : ''}${numSay}` }
  return {
    tex: `${sign}\\tfrac{${numTex}}{${den}}`,
    text: `${sign ? '−' : ''}${numText}/${den}`,
    say: `${sign ? 'menos ' : ''}${numSay} sobre ${den}`,
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
