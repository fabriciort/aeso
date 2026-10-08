// Contrato entre as Etapas e o Palco do laboratório "orbitas".

/** Valores ao vivo (não salvos) que o palco e as etapas compartilham. */
export type OrbitLive = {
  /** Velocidade escolhida para o canhão (km/s). */
  v: number
  /** Contador: cada incremento dispara o canhão. */
  fire: number
  /** Contador: cada incremento marca uma fatia de área (Observe). */
  mark: number
  /** Contador: "Me mostre" das fatias (o palco marca três sozinho). */
  autoMark: number
  /** Inclinação k da reta T² = k·a³ (Meça). */
  slope: number
}

export const DEFAULT_V = 3
export const DEFAULT_SLOPE = 2.2
export const V_MAX = 12

/** Fração do período varrida por fatia (Observe). */
export const SLICE_FRACTION = 1 / 10
export const SLICES_GOAL = 3

/** Planeta imaginário do Observe. */
export const KEPLER_E = 0.6

/** |k − 1| aceito para dar o encaixe por feito. */
export const SLOPE_TOLERANCE = 0.05

/** Desafios do E se…? (o palco ilustra cada um). */
export const CHALLENGE_IDS = ['quatro-ua', 'iss', 'raiz-de-dois'] as const

export type Challenges = Partial<Record<(typeof CHALLENGE_IDS)[number], number>>
