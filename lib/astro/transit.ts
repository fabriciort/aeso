// Transit physics shared by the simulator, the fitting step and the server.
//
// Geometry: a planet of radius k (in stellar radii) whose centre is at a
// projected distance z (stellar radii) from the star's centre. The star has
// quadratic limb darkening I(μ) = 1 − u1(1−μ) − u2(1−μ)².

export interface LimbDarkening {
  u1: number
  u2: number
}

export const SUN_LIKE_LD: LimbDarkening = { u1: 0.4, u2: 0.26 }

/** Area of the intersection of two circles (radii 1 and k, centres z apart). */
export function overlapArea(k: number, z: number): number {
  if (z >= 1 + k) return 0
  if (z <= 1 - k) return Math.PI * k * k
  if (z <= k - 1) return Math.PI // planet larger than star, fully covering
  const k2 = k * k
  const z2 = z * z
  const a1 = Math.acos(Math.min(1, Math.max(-1, (z2 + k2 - 1) / (2 * z * k))))
  const a2 = Math.acos(Math.min(1, Math.max(-1, (z2 + 1 - k2) / (2 * z))))
  const tri = 0.5 * Math.sqrt(Math.max(0, (-z + k + 1) * (z + k - 1) * (z - k + 1) * (z + k + 1)))
  return k2 * a1 + a2 - tri
}

function intensity(r: number, ld: LimbDarkening): number {
  const mu = Math.sqrt(Math.max(0, 1 - r * r))
  return 1 - ld.u1 * (1 - mu) - ld.u2 * (1 - mu) ** 2
}

/** Disk-integrated flux of the unocculted star (normalisation). */
function totalFlux(ld: LimbDarkening): number {
  return Math.PI * (1 - ld.u1 / 3 - ld.u2 / 6)
}

/**
 * Relative flux (1 = no transit). Uses the small-planet approximation: the
 * blocked area times the stellar intensity under the planet.
 */
export function transitFlux(k: number, z: number, ld: LimbDarkening = SUN_LIKE_LD): number {
  const area = overlapArea(k, z)
  if (area <= 0) return 1
  // Intensity under the planet: at its centre when fully inside the disk, at
  // the middle of the covered strip during ingress/egress.
  const r = z <= 1 - k ? z : Math.min(1, (Math.max(z - k, 0) + 1) / 2)
  return 1 - (area * intensity(Math.min(r, 0.9999), ld)) / totalFlux(ld)
}

export interface OrbitGeometry {
  /** Semi-major axis in stellar radii. */
  aR: number
  /** Impact parameter (0 = through the centre). */
  b: number
}

/** Projected planet–star separation at orbital phase φ (0 = mid-transit). */
export function separationAtPhase(phase: number, g: OrbitGeometry): number {
  const ang = 2 * Math.PI * phase
  const cosI = g.b / g.aR
  const x = g.aR * Math.sin(ang)
  const y = g.aR * cosI * Math.cos(ang)
  // Planet behind the star (secondary eclipse side) does not block light.
  if (Math.cos(ang) < 0) return Infinity
  return Math.sqrt(x * x + y * y)
}

export function modelAtPhase(phase: number, k: number, g: OrbitGeometry, ld: LimbDarkening = SUN_LIKE_LD): number {
  return transitFlux(k, separationAtPhase(phase, g), ld)
}

/** Transit depth at mid-transit, as a fraction (0.0155 = 1.55 %). */
export function centralDepth(k: number, b = 0, ld: LimbDarkening = SUN_LIKE_LD): number {
  return 1 - transitFlux(k, b, ld)
}

/** Total transit duration (first to fourth contact) as a fraction of the period. */
export function durationFraction(k: number, g: OrbitGeometry): number {
  const cosI = g.b / g.aR
  const sinI = Math.sqrt(1 - cosI * cosI)
  const arg = Math.sqrt(Math.max(0, (1 + k) ** 2 - g.b * g.b)) / (g.aR * sinI)
  return Math.asin(Math.min(1, arg)) / Math.PI
}

// Handy constants
export const R_SUN_IN_R_JUP = 9.731
export const R_SUN_IN_R_EARTH = 109.08
export const R_JUP_IN_R_EARTH = 11.21
