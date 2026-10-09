import { GALAXIES, H_ALPHA, observedWavelength } from '@/lib/astro/cosmology'

// Values shared by the Etapas and the continuous Palco.

/** Lab-wide live values (not saved). */
export interface UniLive {
  [key: string]: unknown
  /** Ambulance speed, m/s. */
  ambV: number
  /** Siren audible (started inside a tap). */
  listening: boolean
  /** Velocity of the observed spectrum in "Entenda", km/s. */
  entV: number
  /** Selected galaxy in "Observe". */
  sel: number
  /** Velocity the student has "undone" by dragging the observed spectrum back, km/s. */
  u: number
  /** Trial Hubble constant, km/s/Mpc. */
  H: number
}

export const DEFAULTS: UniLive = { ambV: 25, listening: false, entV: 0, sel: 0, u: 0, H: 50 }

export const AMB_MIN = 0
export const AMB_MAX = 40
/** The drawing shows the ambulance 3× faster than the sound so the wave pattern is visible. */
export const DRAW_EXAGGERATION = 3

export const ENT_MIN = -3000
export const ENT_MAX = 30000
/** Target of the "Entenda" task: Hα near 670 nm. */
export const ENT_TARGET_NM = 670
export const ENT_TOL_NM = 2
export const entendaDone = (v: number) => Math.abs(observedWavelength(H_ALPHA, v) - ENT_TARGET_NM) <= ENT_TOL_NM

/** Observe: the observed Hα is aligned with the lab line within this tolerance (snaps). */
export const ALIGN_TOL_NM = 0.8
export const U_MAX = 13000
export const MEASURE_GOAL = 3

export const H_MIN = 40
export const H_MAX = 100
export const FIT_TOL = 0.05

/** Wavelength windows of the spectrum (nm). */
export const FULL_WINDOW: [number, number] = [380, 750]
export const HA_WINDOW: [number, number] = [622, 702]

export const residualKms = (sel: number, u: number) => (GALAXIES[sel]?.velocityKms ?? 0) - u
export const aligned = (sel: number, u: number) => Math.abs(observedWavelength(H_ALPHA, residualKms(sel, u)) - H_ALPHA) <= ALIGN_TOL_NM

export function measuredList(answers: Record<string, unknown>): number[] {
  return Array.isArray(answers.measured) ? (answers.measured as number[]) : []
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Challenge ids of the "E se…?" step, in scene order. */
export const CHALLENGE_IDS = ['rebobinar', 'centro', 'andromeda'] as const
