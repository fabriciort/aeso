// Taylor polynomials around 0 (Maclaurin) for the five classic functions of
// the "Imitando curvas com polinômios" lab: coefficients, evaluation, error,
// the Lagrange remainder and a few real-world numbers (pendulum, e, the
// calculator's range). Pure functions, tested in tests/series-taylor.test.ts.

export type TaylorFn = 'sin' | 'cos' | 'exp' | 'ln1p' | 'geom'

export const TAYLOR_FNS: TaylorFn[] = ['sin', 'cos', 'exp', 'ln1p', 'geom']

/** The functions themselves (NaN outside the domain). */
export const FN: Record<TaylorFn, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  exp: Math.exp,
  ln1p: (x) => (x > -1 ? Math.log1p(x) : NaN),
  geom: (x) => (x !== 1 ? 1 / (1 - x) : NaN),
}

/** Radius of convergence of the Maclaurin series. */
export const RADIUS: Record<TaylorFn, number> = { sin: Infinity, cos: Infinity, exp: Infinity, ln1p: 1, geom: 1 }

export function factorial(n: number): number {
  let p = 1
  for (let k = 2; k <= n; k++) p *= k
  return p
}

/** ln(n!), stable for large n. */
export function logFactorial(n: number): number {
  let s = 0
  for (let k = 2; k <= n; k++) s += Math.log(k)
  return s
}

/** f⁽ⁿ⁾(0), the n-th derivative at 0. */
export function derivativeAt0(fn: TaylorFn, n: number): number {
  switch (fn) {
    case 'sin':
      return [0, 1, 0, -1][n % 4]
    case 'cos':
      return [1, 0, -1, 0][n % 4]
    case 'exp':
      return 1
    case 'ln1p':
      // ln(1+x)' = 1/(1+x); the n-th derivative is (−1)^(n−1)(n−1)!/(1+x)^n.
      return n === 0 ? 0 : (n % 2 === 1 ? 1 : -1) * factorial(n - 1)
    case 'geom':
      // (1−x)^(−1): the n-th derivative is n!/(1−x)^(n+1).
      return factorial(n)
  }
}

/** cₙ = f⁽ⁿ⁾(0) / n! (computed in closed form, without huge factorials). */
export function coefficient(fn: TaylorFn, n: number): number {
  switch (fn) {
    case 'sin':
      return n % 2 === 0 ? 0 : (n % 4 === 1 ? 1 : -1) / factorial(n)
    case 'cos':
      return n % 2 === 1 ? 0 : (n % 4 === 0 ? 1 : -1) / factorial(n)
    case 'exp':
      return 1 / factorial(n)
    case 'ln1p':
      return n === 0 ? 0 : (n % 2 === 1 ? 1 : -1) / n
    case 'geom':
      return 1
  }
}

/** [c₀, c₁, …, c_degree]. */
export function coefficients(fn: TaylorFn, degree: number): number[] {
  return Array.from({ length: Math.max(0, Math.floor(degree)) + 1 }, (_, n) => coefficient(fn, n))
}

/** Evaluates c₀ + c₁x + c₂x² + … (Horner). */
export function evalPoly(c: readonly number[], x: number): number {
  let y = 0
  for (let i = c.length - 1; i >= 0; i--) y = y * x + c[i]
  return y
}

/** Coefficients of the derivative of a polynomial. */
export function derivePoly(c: readonly number[]): number[] {
  return c.length <= 1 ? [0] : c.slice(1).map((v, i) => v * (i + 1))
}

/** Taylor polynomial of degree n around 0, at x. */
export function taylor(fn: TaylorFn, degree: number, x: number): number {
  return evalPoly(coefficients(fn, degree), x)
}

/** |f(x) − Tₙ(x)|. */
export function taylorError(fn: TaylorFn, degree: number, x: number): number {
  return Math.abs(FN[fn](x) - taylor(fn, degree, x))
}

/**
 * Lagrange remainder bound: if |f⁽ⁿ⁺¹⁾| ≤ M between 0 and x, then
 * |f(x) − Tₙ(x)| ≤ M·|x|ⁿ⁺¹/(n+1)!.
 */
export function lagrangeBound(M: number, degree: number, x: number): number {
  return Math.exp(Math.log(M) + (degree + 1) * Math.log(Math.abs(x)) - logFactorial(degree + 1))
}

/** Largest |x| for which the Lagrange bound stays below tol. */
export function lagrangeRadius(M: number, degree: number, tol: number): number {
  return Math.exp((Math.log(tol / M) + logFactorial(degree + 1)) / (degree + 1))
}

/**
 * Interval around 0 where the copy is good: walks outward from 0 (both
 * sides) until |f − P| reaches tol. Returns [lo, hi] (lo ≤ 0 ≤ hi).
 */
export function goodInterval(f: (x: number) => number, c: readonly number[], tol = 0.01, xmax = 40, step = xmax / 4000): [number, number] {
  const ok = (x: number) => {
    const y = f(x)
    return Number.isFinite(y) && Math.abs(y - evalPoly(c, x)) < tol
  }
  if (!ok(0)) return [0, 0]
  let hi = 0
  while (hi < xmax && ok(hi + step)) hi += step
  let lo = 0
  while (lo > -xmax && ok(lo - step)) lo -= step
  return [lo, hi]
}

/** Partial sums S₀…S_{n−1} of e = Σ 1/k! (n terms). */
export function eSums(n: number): number[] {
  const out: number[] = []
  let s = 0
  for (let k = 0; k < n; k++) {
    s += 1 / factorial(k)
    out.push(s)
  }
  return out
}

/** How many leading digits of `approx` match `exact` (decimal point ignored). */
export function correctDigits(approx: number, exact: number, places = 12): number {
  const a = approx.toFixed(places).replace('.', '')
  const b = exact.toFixed(places).replace('.', '')
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  return i
}

/** Relative error of sin θ ≈ θ: (θ − sin θ)/sin θ (θ in radians). */
export function smallAngleError(theta: number): number {
  return (theta - Math.sin(theta)) / Math.sin(theta)
}

/** Arithmetic-geometric mean. */
export function agm(a: number, b: number): number {
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15 * a; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]
  return (a + b) / 2
}

/**
 * Exact period of a pendulum with amplitude θ₀, divided by the small-angle
 * period 2π√(L/g): T/T₀ = 1/AGM(1, cos(θ₀/2)).
 */
export function pendulumPeriodRatio(theta0: number): number {
  return 1 / agm(1, Math.cos(theta0 / 2))
}

export const deg = (d: number) => (d * Math.PI) / 180
