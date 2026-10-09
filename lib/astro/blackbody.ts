// Thermal (blackbody) radiation: Planck's law, Wien's law and the color a
// hot object shows to the eye. Pure functions, used by the lab
// "Por que as estrelas têm cores".

const H = 6.62607015e-34 // J·s
const C = 299792458 // m/s
const K = 1.380649e-23 // J/K

/** Wien's displacement constant, in nm·K. */
export const WIEN_NM_K = 2897771.955
export const T_SUN = 5772

/** Planck spectral radiance B(λ, T), λ in nm (W·sr⁻¹·m⁻³). */
export function planck(lambdaNm: number, T: number): number {
  const l = lambdaNm * 1e-9
  const x = (H * C) / (l * K * T)
  if (x > 700) return 0
  return (2 * H * C * C) / (l ** 5 * Math.expm1(x))
}

/** Wavelength of peak emission, in nm. */
export function wienPeakNm(T: number): number {
  return WIEN_NM_K / T
}

/** Temperature whose emission peaks at `lambdaNm`. */
export function wienTemperature(lambdaNm: number): number {
  return WIEN_NM_K / lambdaNm
}

/** B(λ, T) / B(λ_peak, T): the curve shape, peak = 1. */
export function planckNormalized(lambdaNm: number, T: number): number {
  return planck(lambdaNm, T) / planck(wienPeakNm(T), T)
}

// CIE 1931 color matching functions, multi-lobe Gaussian fit by Wyman,
// Sloan & Shirley (2013), JCGT 2(2).
function g(x: number, mu: number, s1: number, s2: number) {
  const t = (x - mu) / (x < mu ? s1 : s2)
  return Math.exp(-0.5 * t * t)
}
export function cie(lambdaNm: number): [number, number, number] {
  const l = lambdaNm
  return [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ]
}

/** CIE XYZ of a blackbody (unnormalized). */
export function blackbodyXYZ(T: number): [number, number, number] {
  let X = 0
  let Y = 0
  let Z = 0
  for (let l = 380; l <= 780; l += 5) {
    const b = planck(l, T)
    const [x, y, z] = cie(l)
    X += b * x
    Y += b * y
    Z += b * z
  }
  return [X, Y, Z]
}

const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

/**
 * The color of a blackbody at temperature T as sRGB 0–255, at full
 * brightness (the brightest channel is 255). Out-of-gamut colors are
 * desaturated toward white.
 */
export function blackbodyRgb(T: number): [number, number, number] {
  const [X, Y, Z] = blackbodyXYZ(T)
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
  let gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
  let b = 0.0557 * X - 0.204 * Y + 1.057 * Z
  const min = Math.min(r, gg, b)
  if (min < 0) {
    r -= min
    gg -= min
    b -= min
  }
  const max = Math.max(r, gg, b) || 1
  return [r, gg, b].map((c) => Math.round(255 * Math.min(1, Math.max(0, gamma(c / max))))) as [number, number, number]
}

export function blackbodyCss(T: number, alpha = 1): string {
  const [r, g, b] = blackbodyRgb(T)
  return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`
}

/**
 * How visible the glow of a hot object is (0–1): nothing at room
 * temperature, a dull red from ~800 K (the Draper point), fully bright
 * from ~2000 K. Perceptual, for drawing only.
 */
export function glowVisibility(T: number): number {
  if (T <= 700) return 0
  const t = Math.min(1, Math.log(T / 700) / Math.log(2200 / 700))
  return t * t * (3 - 2 * t)
}

/** Approximate color of a pure spectral wavelength (for a rainbow strip). */
export function wavelengthRgb(l: number): [number, number, number] {
  let r = 0
  let g = 0
  let b = 0
  if (l >= 380 && l < 440) {
    r = -(l - 440) / 60
    b = 1
  } else if (l < 490) {
    g = (l - 440) / 50
    b = 1
  } else if (l < 510) {
    g = 1
    b = -(l - 510) / 20
  } else if (l < 580) {
    r = (l - 510) / 70
    g = 1
  } else if (l < 645) {
    r = 1
    g = -(l - 645) / 65
  } else if (l <= 780) {
    r = 1
  }
  const f = l < 420 ? 0.3 + (0.7 * (l - 380)) / 40 : l > 700 ? 0.3 + (0.7 * (780 - l)) / 80 : 1
  return [r, g, b].map((c) => Math.round(255 * (c * Math.max(0, f)) ** 0.8)) as [number, number, number]
}

export const kelvinToCelsius = (T: number) => T - 273.15
