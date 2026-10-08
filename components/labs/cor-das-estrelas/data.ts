import { planckNormalized, T_SUN, wienPeakNm } from '@/lib/astro/blackbody'

// Data for "Por que as estrelas têm cores".

export interface ColorLive extends Record<string, unknown> {
  /** Temperature of the imaginary sphere (K). Shared by Imagine and Entenda. */
  T: number
  /** Temperature of the model curve in Meça (K). */
  modelT: number
}

export const T_MIN = 300
export const T_MAX = 30000
export const toSlider = (T: number) => Math.log(T / T_MIN) / Math.log(T_MAX / T_MIN)
export const fromSlider = (s: number) => T_MIN * (T_MAX / T_MIN) ** Math.min(1, Math.max(0, s))
export const clampT = (T: number, lo = T_MIN, hi = T_MAX) => Math.min(hi, Math.max(lo, T))

export function colorName(T: number): string {
  if (T < 700) return 'sem brilho visível'
  if (T < 1000) return 'vermelho escuro'
  if (T < 1800) return 'vermelho'
  if (T < 2800) return 'laranja'
  if (T < 4200) return 'amarelo-alaranjado'
  if (T < 5400) return 'amarelo-claro'
  if (T < 7000) return 'branco'
  if (T < 10500) return 'branco-azulado'
  return 'azul-claro'
}

/**
 * The bright stars of Orion. Positions J2000 (degrees), visual magnitudes,
 * effective temperatures (approximate; Betelgeuse: Levesque & Massey 2020,
 * Rigel: Przybilla et al. 2006).
 */
export const ORION = [
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 88.793, dec: 7.407, mag: 0.5, T: 3600 },
  { id: 'rigel', name: 'Rigel', ra: 78.634, dec: -8.202, mag: 0.13, T: 12100 },
  { id: 'bellatrix', name: 'Bellatrix', ra: 81.283, dec: 6.35, mag: 1.64, T: 22000 },
  { id: 'saiph', name: 'Saiph', ra: 86.939, dec: -9.67, mag: 2.09, T: 26000 },
  { id: 'alnitak', name: 'Alnitak', ra: 85.19, dec: -1.943, mag: 1.77, T: 29000 },
  { id: 'alnilam', name: 'Alnilam', ra: 84.053, dec: -1.202, mag: 1.69, T: 27000 },
  { id: 'mintaka', name: 'Mintaka', ra: 83.002, dec: -0.299, mag: 2.23, T: 29500 },
  { id: 'meissa', name: 'Meissa', ra: 83.784, dec: 9.934, mag: 3.33, T: 35000 },
] as const

export type OrionId = (typeof ORION)[number]['id']

export const ORION_LINES: [OrionId, OrionId][] = [
  ['meissa', 'betelgeuse'],
  ['meissa', 'bellatrix'],
  ['betelgeuse', 'alnitak'],
  ['bellatrix', 'mintaka'],
  ['alnitak', 'alnilam'],
  ['alnilam', 'mintaka'],
  ['alnitak', 'saiph'],
  ['mintaka', 'rigel'],
]

/** Orion projected on the sky: x to the right (west), y down; ~[-5, 5] × [-10, 10]. */
export function orionXY(s: { ra: number; dec: number }): [number, number] {
  return [-(s.ra - 83.8) * Math.cos((s.dec * Math.PI) / 180), -s.dec]
}

/** Two imaginary stars for the prediction. */
export const STAR_A_T = 3200
export const STAR_B_T = 15000

// ------------------------------------------------------------ The Sun's light

// Deterministic noise.
function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Points shaped like the Sun's spectrum: a 5772 K blackbody with the
 * strongest absorption lines and the ultraviolet "line blanketing", plus
 * noise. Simulated from the real shape, labeled as such on screen.
 */
export const SUN_POINTS: { l: number; f: number }[] = (() => {
  const r = rand(5772)
  const lines = [
    [393.4, 0.35, 3],
    [396.8, 0.3, 3],
    [430.8, 0.12, 2],
    [486.1, 0.12, 2],
    [517.3, 0.1, 2],
    [589.3, 0.1, 2],
    [656.3, 0.14, 2],
  ]
  const out: { l: number; f: number }[] = []
  for (let l = 260; l <= 2400; l += l < 900 ? 12 : 40) {
    let f = planckNormalized(l, T_SUN)
    if (l < 400) f *= 0.72 + (0.28 * (l - 260)) / 140
    for (const [c, d, w] of lines) f *= 1 - d * Math.exp(-0.5 * ((l - c) / w) ** 2)
    f += (r() - 0.5) * 0.04
    out.push({ l, f: Math.max(0, f) })
  }
  return out
})()

/** Least-squares temperature for the Sun points (shape fit). */
export const SUN_BEST_T = (() => {
  let best = T_SUN
  let bestErr = Infinity
  for (let T = 4000; T <= 8000; T += 10) {
    let e = 0
    for (const p of SUN_POINTS) e += (planckNormalized(p.l, T) - p.f) ** 2
    if (e < bestErr) {
      bestErr = e
      best = T
    }
  }
  return best
})()

export const peakNm = wienPeakNm

// ------------------------------------------------------------ E se…?

export const CHALLENGES = [
  {
    id: 'voce',
    q: 'Você também brilha! Seu corpo está a 37 °C (310 K). Onde fica o pico da sua luz?',
    options: ['≈ 500 nm (visível)', '≈ 9.300 nm (infravermelho)', '≈ 93 nm (ultravioleta)', 'Você não emite luz'],
    answer: 1,
    explain: '2.898.000 ÷ 310 ≈ 9.300 nm: infravermelho. Invisível aos olhos, mas é assim que câmeras térmicas enxergam pessoas no escuro.',
    T: 310,
  },
  {
    id: 'verde',
    q: 'O pico do Sol fica no verde-azulado. Então por que não existem estrelas verdes?',
    options: ['Nenhuma estrela tem pico no verde', 'As outras cores vêm juntas e a mistura parece branca', 'O espaço absorve o verde', 'Existem, só são raras'],
    answer: 1,
    explain: 'A curva é larga: com o pico no verde, sobra muito vermelho e azul. Tudo junto, o olho vê branco.',
    T: T_SUN,
  },
  {
    id: 'uv',
    q: 'Uma estrela imaginária tem o pico da luz em 290 nm, no ultravioleta. Qual é a temperatura dela?',
    options: ['≈ 1.000 K', '≈ 5.800 K', '≈ 10.000 K', '≈ 100.000 K'],
    answer: 2,
    explain: '2.898.000 ÷ 290 ≈ 10.000 K: uma estrela branco-azulada, parecida com Vega.',
    T: 9990,
  },
] as const
