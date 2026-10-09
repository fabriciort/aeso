// Doppler, redshift and the Hubble law: pure functions used by the lab
// "Meça a expansão do universo" (components/labs/universo-em-expansao).

/** Speed of light in vacuum, km/s (exact, SI definition). */
export const C_KMS = 299_792.458

/** Speed of sound in dry air at 20 °C, m/s. */
export const SOUND_SPEED = 343

// ------------------------------------------------------------------ Som

/**
 * Frequency heard by a listener at rest when the source moves at speed
 * `v` (same units as `c`). `cosTheta` is the cosine of the angle between the
 * source's velocity and the line from the source to the listener:
 * +1 = coming straight at you (higher pitch), −1 = going straight away.
 *   f' = f · c / (c − v·cosθ)
 */
export function dopplerSound(f: number, v: number, cosTheta: number, c = SOUND_SPEED): number {
  const denom = c - v * cosTheta
  if (denom <= 0) return Infinity
  return (f * c) / denom
}

/**
 * cosθ for a source at (sx, sy) moving along (dx, dy) and a listener at
 * (lx, ly). Returns 0 when the source sits on the listener or does not move.
 */
export function approachCosine(sx: number, sy: number, dx: number, dy: number, lx: number, ly: number): number {
  const rx = lx - sx
  const ry = ly - sy
  const r = Math.hypot(rx, ry)
  const d = Math.hypot(dx, dy)
  if (r === 0 || d === 0) return 0
  return (rx * dx + ry * dy) / (r * d)
}

// ------------------------------------------------------------------ Luz

export interface SpectralLine {
  id: string
  label: string
  /** Rest wavelength in air, nm (Balmer series of hydrogen). */
  nm: number
}

/** Balmer lines of hydrogen (NIST, air wavelengths, rounded to 0,1 nm). */
export const H_LINES: SpectralLine[] = [
  { id: 'ha', label: 'Hα', nm: 656.3 },
  { id: 'hb', label: 'Hβ', nm: 486.1 },
  { id: 'hg', label: 'Hγ', nm: 434.0 },
  { id: 'hd', label: 'Hδ', nm: 410.2 },
]

export const H_ALPHA = 656.3

/**
 * Observed wavelength for a source receding at `vKms` (negative = approaching).
 * First-order Doppler: λobs = λ0 (1 + v/c), good to better than 1 % for
 * |v| ≲ 30 000 km/s.
 */
export function observedWavelength(restNm: number, vKms: number): number {
  return restNm * (1 + vKms / C_KMS)
}

/** Exact special-relativistic Doppler for purely radial motion. */
export function relativisticObservedWavelength(restNm: number, vKms: number): number {
  const b = vKms / C_KMS
  return restNm * Math.sqrt((1 + b) / (1 - b))
}

/** Redshift z = Δλ/λ0. */
export function redshift(observedNm: number, restNm: number): number {
  return (observedNm - restNm) / restNm
}

/** Radial velocity from a measured line: v ≈ c·Δλ/λ0 (km/s). */
export function velocityFromWavelength(observedNm: number, restNm: number): number {
  return C_KMS * redshift(observedNm, restNm)
}

/**
 * Approximate sRGB color (0–255) of monochromatic light, with intensity
 * falling off near the limits of vision (after Dan Bruton's approximation).
 */
export function wavelengthToRgb(nm: number): [number, number, number] {
  let r = 0
  let g = 0
  let b = 0
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380)
    b = 1
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440)
    b = 1
  } else if (nm >= 490 && nm < 510) {
    g = 1
    b = -(nm - 510) / (510 - 490)
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510)
    g = 1
  } else if (nm >= 580 && nm < 645) {
    r = 1
    g = -(nm - 645) / (645 - 580)
  } else if (nm >= 645 && nm <= 780) {
    r = 1
  }
  let k = 0
  if (nm >= 380 && nm < 420) k = 0.3 + (0.7 * (nm - 380)) / (420 - 380)
  else if (nm >= 420 && nm <= 700) k = 1
  else if (nm > 700 && nm <= 780) k = 0.3 + (0.7 * (780 - nm)) / (780 - 700)
  const gamma = 0.8
  const f = (c: number) => Math.round(255 * (c > 0 ? (c * k) ** gamma : 0))
  return [f(r), f(g), f(b)]
}

// ------------------------------------------------------------------ Hubble

/** km in one megaparsec. */
export const KM_PER_MPC = 3.085_677_581e19
/** Seconds in a billion (Julian) years. */
export const SEC_PER_GYR = 3.155_76e16

export function hubbleVelocity(distanceMpc: number, H0: number): number {
  return H0 * distanceMpc
}

/** Hubble time 1/H0 in billions of years (≈ 977,8/H0 for H0 in km/s/Mpc). */
export function hubbleTimeGyr(H0: number): number {
  return KM_PER_MPC / H0 / SEC_PER_GYR
}

/** Least-squares slope of a line through the origin: Σxy / Σx². */
export function slopeThroughOrigin(points: { x: number; y: number }[]): number {
  let sxy = 0
  let sxx = 0
  for (const p of points) {
    sxy += p.x * p.y
    sxx += p.x * p.x
  }
  return sxx > 0 ? sxy / sxx : 0
}

/** Relative distance of a trial slope to the best one. */
export function fitError(trial: number, best: number): number {
  return Math.abs(trial - best) / best
}

export interface HypotheticalGalaxy {
  id: string
  /** Distance from standard candles (Cepheids, type Ia supernovae), Mpc. */
  distanceMpc: number
  /** Peculiar velocity added to the Hubble flow, km/s (deterministic). */
  peculiarKms: number
  /** Recession velocity, km/s: 70·d + peculiar. */
  velocityKms: number
  /** Position angle on the map, degrees (screen convention, y down). */
  angle: number
}

/** The Hubble-flow value used to build the hypothetical galaxies. */
export const SIM_H0 = 70

const RAW: Omit<HypotheticalGalaxy, 'velocityKms'>[] = [
  { id: 'A', distanceMpc: 20, peculiarKms: 130, angle: -58 },
  { id: 'B', distanceMpc: 45, peculiarKms: -90, angle: 158 },
  { id: 'C', distanceMpc: 80, peculiarKms: 180, angle: 32 },
  { id: 'D', distanceMpc: 120, peculiarKms: -160, angle: 236 },
  { id: 'E', distanceMpc: 160, peculiarKms: 70, angle: -22 },
]

/** Five HYPOTHETICAL galaxies (A–E). Not real objects. */
export const GALAXIES: HypotheticalGalaxy[] = RAW.map((g) => ({ ...g, velocityKms: hubbleVelocity(g.distanceMpc, SIM_H0) + g.peculiarKms }))

/** Best slope through the origin for the hypothetical galaxies (≈ 70,1). */
export const GALAXIES_BEST_H0 = slopeThroughOrigin(GALAXIES.map((g) => ({ x: g.distanceMpc, y: g.velocityKms })))

export interface H0Measurement {
  value: number
  err: number
  label: string
  reference: string
}

/** Cosmic microwave background (Planck satellite, final 2018 data release). */
export const PLANCK_H0: H0Measurement = {
  value: 67.4,
  err: 0.5,
  label: 'Planck (2018)',
  reference: 'Planck Collaboration, A&A 641, A6 (2020)',
}

/** Cepheids + type Ia supernovae (Hubble Space Telescope, SH0ES team). */
export const SHOES_H0: H0Measurement = {
  value: 73.0,
  err: 1.0,
  label: 'SH0ES (2022)',
  reference: 'Riess et al., ApJL 934, L7 (2022)',
}

/** Age of the universe from Planck 2018 (ΛCDM), billions of years. */
export const UNIVERSE_AGE_GYR = 13.8

/** Andromeda (M31): distance ≈ 0,78 Mpc; heliocentric radial velocity ≈ −300 km/s. */
export const ANDROMEDA = { distanceMpc: 0.78, radialVelocityKms: -300 }
