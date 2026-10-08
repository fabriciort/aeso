import { equation, side, type Equation, type Where } from '@/lib/math/equations'

// Shared state and content of "Equações na balança".
//
// The Etapas describe what the Palco shows as a View (live.view); the Palco
// eases from one View to the next and never cuts. In Imagine the Palco also
// writes live.pans when the student drags weights.

export interface NbLine {
  id: string
  tex: string
  say: string
  /** Small note to the right ("−3 nos dois lados"). */
  note?: string
  tone?: 'ok' | 'bad' | 'meh' | 'rule' | 'done'
  /** Builds the line term by term (Entenda: reading the balance). */
  parts?: string[]
}

export type Fx = { id: number; kind: 'split'; k: number; where: Where } | { id: number; kind: 'cancel' } | { id: number; kind: 'wobble' }

export interface View {
  /** Identity of the set of objects: a new key makes the old ones fly away. */
  key: string
  eq: Equation
  /** Weight of each box used by the physics. */
  X: number
  /** Number painted on the boxes (null = the letter). */
  label: number | null
  /** The letter of the unknown. */
  v: string
  /** Block mode (decimal numbers): the largest side total, for scale. */
  blocks?: number
  fx?: Fx | null
  nb: NbLine[]
  /** Imagine: tray with weights to drag. */
  tray?: boolean
  thermo?: { F: number; showC: boolean } | null
  medal?: boolean
  /** Reading animation id (Entenda): boxes → weights → = → right side. */
  read?: number
  badges?: { tex: string; say: string }[]
  /** Shows the total of each pan. */
  readout?: boolean
  /** Caption above the notebook ("Problema 1 de 3"). */
  nbTitle?: string
  aria: string
}

export type Pans = { L: number; R: number }

export type EqLive = {
  view: View
  pans: Pans
}

/** Rhythm of the reading animation (Entenda): one term per beat. */
export const READ_MS = 850

export const IMAGINE_X = 4
export const MAX_PAN = 12

export const PREVEJA_EQ = equation(side(2, 3), side(0, 11))
export const PREVEJA_X = 4

export interface Problem {
  id: string
  eq: Equation
  x: number
  /** 2 = many hints, 1 = fewer, 0 = alone. */
  support: number
}

export const PROBLEMS: Problem[] = [
  { id: 'p1', eq: equation(side(3, 2), side(0, 14)), x: 4, support: 2 },
  { id: 'p2', eq: equation(side(5, 1), side(2, 10)), x: 3, support: 1 },
  { id: 'p3', eq: equation(side(1, -1, 4), side(2, 6)), x: 5, support: 0 },
]

export const F_EQ = equation(side(1.8, 32), side(0, 98.6))
export const F_C = 37
export const RIDE_EQ = equation(side(2, 5), side(0, 29))
export const RIDE_KM = 12

export const NO_SOL = equation(side(1, 2), side(1, 5))
export const ALL_SOL = equation(side(1, 1, 2), side(2, 2))

export const SOURCES = 'NIST SP 811 (2008), Apêndice B: t/°F = 1,8·t/°C + 32. Corrida de app: exemplo imaginado.'
