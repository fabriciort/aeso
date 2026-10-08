// Pure math for the lab "A velocidade de um instante" (derivada): secant
// slopes, the limit h → 0, and a smooth curve through Usain Bolt's real
// split times.

/** Average rate of change of f between a and a + h (slope of the secant). */
export function secantSlope(f: (x: number) => number, a: number, h: number): number {
  return (f(a + h) - f(a)) / h
}

/** Symmetric numerical derivative (for checks and for curves without a formula). */
export function derivative(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h)
}

// ---------------------------------------------------------------- Bolt

/**
 * Usain Bolt, 100 m final of the World Championships, Berlin, 16 Aug 2009
 * (world record 9.58 s). Official 10 m split times from the IAAF
 * biomechanics project (Graubner & Nixdorf, New Studies in Athletics 26,
 * 2011). Reaction time 0.146 s. Times include the reaction.
 */
export const BOLT = {
  reaction: 0.146,
  distances: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  times: [0, 1.89, 2.88, 3.78, 4.64, 5.47, 6.29, 7.1, 7.92, 8.75, 9.58],
  source: 'IAAF, Mundial de Berlim 2009 (Graubner & Nixdorf, 2011)',
}

/** Average speed in each 10 m segment (m/s): what the splits tell directly. */
export function boltSegmentSpeeds(): { t0: number; t1: number; v: number }[] {
  const out: { t0: number; t1: number; v: number }[] = []
  for (let i = 1; i < BOLT.times.length; i++) {
    const t0 = BOLT.times[i - 1]
    const t1 = BOLT.times[i]
    out.push({ t0, t1, v: (BOLT.distances[i] - BOLT.distances[i - 1]) / (t1 - t0) })
  }
  return out
}

/**
 * A smooth model of the race fitted to the real splits (least squares):
 * v(t) = A·(1 − e^(−k·τ)) − c·τ, τ = t − reaction. The classic sprint model
 * of Keller (1973) with a gentle fatigue term (Tibshirani, 1997). It passes
 * within 0.2 m of every official split, and its slope is a real derivative.
 * The splits themselves are data; this curve is a model (label it so).
 */
export const BOLT_MODEL = { A: 12.3494, k: 0.7915, c: 0.0186 }

/** Bolt's position (m) at time t (s) on the fitted model. */
export function boltPosition(t: number): number {
  const u = Math.max(0, Math.min(t, 9.58) - BOLT.reaction)
  const { A, k, c } = BOLT_MODEL
  return Math.max(0, A * (u - (1 - Math.exp(-k * u)) / k) - (c * u * u) / 2)
}

/** Bolt's speed (m/s): the derivative of the position model. */
export function boltSpeed(t: number): number {
  const u = Math.max(0, Math.min(t, 9.58) - BOLT.reaction)
  const { A, k, c } = BOLT_MODEL
  return A * (1 - Math.exp(-k * u)) - c * u
}

/** Time and value of Bolt's top speed on the model. */
export function boltTopSpeed(): { t: number; v: number } {
  let best = { t: 0, v: 0 }
  for (let t = 0; t <= 9.58; t += 0.005) {
    const v = boltSpeed(t)
    if (v > best.v) best = { t, v }
  }
  return best
}

export const msToKmh = (v: number) => v * 3.6

// ---------------------------------------------------------------- the car

/** The imagined car leaving a traffic light: s(t) = t² (m), 0 ≤ t ≤ 10 s. */
export const carPosition = (t: number) => t * t
export const carSpeed = (t: number) => 2 * t
