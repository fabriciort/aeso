// Stars for the H-R diagram lab: a small catalog of named stars, the
// Stefan-Boltzmann law in solar units and an approximate blackbody color.
// Pure functions, no DOM, so they are testable and usable on the server.

/** Stefan-Boltzmann constant, W m⁻² K⁻⁴ (CODATA 2018). */
export const SIGMA = 5.670374419e-8
/** Nominal solar values (IAU 2015 Resolution B3). */
export const T_SUN = 5772
export const L_SUN_W = 3.828e26
export const R_SUN_M = 6.957e8
/** Solar radius in astronomical units (6.957e8 m / 1.495978707e11 m). */
export const R_SUN_IN_AU = R_SUN_M / 1.495978707e11
/** Earth's equatorial radius in solar radii (6378 km / 695 700 km). */
export const R_EARTH_IN_R_SUN = 6.3781e6 / R_SUN_M
/** Absolute magnitude of the Sun in the Gaia G band (Casagrande & VandenBerg 2018). */
export const M_G_SUN = 4.67

/** L = 4πR²σT⁴, in watts (R in meters, T in kelvin). */
export function luminosityWatts(radiusM: number, teff: number): number {
  return 4 * Math.PI * radiusM ** 2 * SIGMA * teff ** 4
}

/** L/L☉ = (R/R☉)² (T/T☉)⁴. */
export function luminosityFrom(radiusSun: number, teff: number): number {
  return radiusSun ** 2 * (teff / T_SUN) ** 4
}

/** R/R☉ = √(L/L☉) / (T/T☉)². */
export function radiusFrom(lumSun: number, teff: number): number {
  return Math.sqrt(lumSun) / (teff / T_SUN) ** 2
}

/**
 * On a log-log H-R diagram a line of constant radius is straight:
 * log L = 2 log R + 4 (log T − log T☉).
 */
export function logLOnRadiusLine(radiusSun: number, logT: number): number {
  return 2 * Math.log10(radiusSun) + 4 * (logT - Math.log10(T_SUN))
}

// ------------------------------------------------------------ Gaia

/** Absolute magnitude from apparent G and parallax in milliarcseconds. */
export function absoluteMagnitude(g: number, parallaxMas: number): number {
  return g + 5 * Math.log10(parallaxMas / 100)
}

/**
 * Approximate luminosity (L☉) from the absolute G magnitude. This ignores
 * the bolometric correction (light outside the G band), so very hot and very
 * cool stars come out somewhat too faint. Good enough to see the structure of
 * the diagram, not for precise work.
 */
export function luminosityFromAbsG(absG: number): number {
  return 10 ** ((M_G_SUN - absG) / 2.5)
}

// ------------------------------------------------------------ Color

// Blackbody color in sRGB (normalized so the brightest channel is 255),
// after Mitchell Charity's "Blackbody color datafile" (CIE 1964 10°).
const BB_TABLE: [number, number, number, number][] = [
  [2000, 255, 137, 18],
  [2500, 255, 161, 72],
  [3000, 255, 180, 107],
  [3500, 255, 196, 137],
  [4000, 255, 209, 163],
  [4500, 255, 219, 186],
  [5000, 255, 228, 206],
  [5500, 255, 236, 224],
  [6000, 255, 243, 239],
  [6500, 255, 249, 253],
  [7000, 245, 243, 255],
  [8000, 227, 233, 255],
  [9000, 214, 225, 255],
  [10000, 204, 219, 255],
  [12000, 191, 211, 255],
  [15000, 179, 204, 255],
  [20000, 168, 197, 255],
  [30000, 159, 191, 255],
  [40000, 155, 188, 255],
]

/** Approximate color of a blackbody at temperature T (K), as [r, g, b] 0–255. */
export function starRgb(teff: number): [number, number, number] {
  const t = Math.min(Math.max(teff, BB_TABLE[0][0]), BB_TABLE[BB_TABLE.length - 1][0])
  for (let i = 1; i < BB_TABLE.length; i++) {
    const [t1, r1, g1, b1] = BB_TABLE[i]
    if (t <= t1) {
      const [t0, r0, g0, b0] = BB_TABLE[i - 1]
      const f = (t - t0) / (t1 - t0)
      return [Math.round(r0 + (r1 - r0) * f), Math.round(g0 + (g1 - g0) * f), Math.round(b0 + (b1 - b0) * f)]
    }
  }
  const last = BB_TABLE[BB_TABLE.length - 1]
  return [last[1], last[2], last[3]]
}

export function starColor(teff: number, alpha = 1): string {
  const [r, g, b] = starRgb(teff)
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`
}

/** A word for the color, as the eye sees it. */
export function colorName(teff: number): string {
  if (teff < 3700) return 'vermelho-alaranjada'
  if (teff < 5000) return 'laranja'
  if (teff < 6000) return 'amarelo-esbranquiçada'
  if (teff < 7500) return 'branca'
  if (teff < 10000) return 'branco-azulada'
  return 'azulada'
}

// ------------------------------------------------------------ Named stars

export type StarGroup = 'principal' | 'gigante' | 'supergigante' | 'ana-branca'

export const GROUP_LABEL: Record<StarGroup, string> = {
  principal: 'Sequência principal',
  gigante: 'Gigante',
  supergigante: 'Supergigante',
  'ana-branca': 'Anã branca',
}

export interface NamedStar {
  id: string
  name: string
  /** Effective temperature, K. */
  teff: number
  /** Luminosity, L☉. */
  lum: number
  /** Radius, R☉ (chosen consistent with L = R²T⁴ within ~10 %). */
  radius: number
  spectral: string
  group: StarGroup
}

/**
 * Approximate literature values (rounded; Wikipedia / SIMBAD compilations
 * of the original papers). Where published L, R and T disagree (e.g. Sirius
 * B), the radius or luminosity was adjusted to satisfy L = R²(T/T☉)⁴.
 */
export const NAMED_STARS: NamedStar[] = [
  { id: 'sol', name: 'Sol', teff: 5772, lum: 1, radius: 1, spectral: 'G2 V', group: 'principal' },
  { id: 'sirius-a', name: 'Sirius A', teff: 9940, lum: 25.4, radius: 1.71, spectral: 'A1 V', group: 'principal' },
  { id: 'sirius-b', name: 'Sirius B', teff: 25000, lum: 0.025, radius: 0.0084, spectral: 'DA2', group: 'ana-branca' },
  { id: 'vega', name: 'Vega', teff: 9600, lum: 40, radius: 2.3, spectral: 'A0 V', group: 'principal' },
  { id: 'betelgeuse', name: 'Betelgeuse', teff: 3600, lum: 100000, radius: 810, spectral: 'M2 Iab', group: 'supergigante' },
  { id: 'rigel', name: 'Rigel', teff: 12100, lum: 120000, radius: 79, spectral: 'B8 Ia', group: 'supergigante' },
  { id: 'antares', name: 'Antares', teff: 3660, lum: 75000, radius: 680, spectral: 'M1,5 Iab', group: 'supergigante' },
  { id: 'deneb', name: 'Deneb', teff: 8525, lum: 196000, radius: 203, spectral: 'A2 Ia', group: 'supergigante' },
  { id: 'polaris', name: 'Polaris', teff: 6015, lum: 1260, radius: 33, spectral: 'F7 Ib', group: 'supergigante' },
  { id: 'canopus', name: 'Canopus', teff: 7400, lum: 10700, radius: 64, spectral: 'A9 II', group: 'supergigante' },
  { id: 'aldebaran', name: 'Aldebaran', teff: 3900, lum: 440, radius: 45, spectral: 'K5 III', group: 'gigante' },
  { id: 'arcturus', name: 'Arcturus', teff: 4290, lum: 170, radius: 24, spectral: 'K1,5 III', group: 'gigante' },
  { id: 'capella', name: 'Capella', teff: 4970, lum: 79, radius: 12, spectral: 'G III', group: 'gigante' },
  { id: 'pollux', name: 'Pólux', teff: 4590, lum: 43, radius: 10, spectral: 'K0 III', group: 'gigante' },
  { id: 'procyon-a', name: 'Procyon A', teff: 6530, lum: 6.9, radius: 2.05, spectral: 'F5 IV–V', group: 'principal' },
  { id: 'procyon-b', name: 'Procyon B', teff: 7740, lum: 0.00049, radius: 0.0123, spectral: 'DQZ', group: 'ana-branca' },
  { id: 'altair', name: 'Altair', teff: 7670, lum: 10.6, radius: 1.84, spectral: 'A7 V', group: 'principal' },
  { id: 'spica', name: 'Spica', teff: 25300, lum: 20500, radius: 7.5, spectral: 'B1 III–IV', group: 'principal' },
  { id: 'regulus', name: 'Régulo', teff: 12460, lum: 288, radius: 3.6, spectral: 'B8 IV', group: 'principal' },
  { id: 'fomalhaut', name: 'Fomalhaut', teff: 8590, lum: 16.6, radius: 1.84, spectral: 'A3 V', group: 'principal' },
  { id: 'alfa-cen-a', name: 'Alfa Centauri A', teff: 5790, lum: 1.52, radius: 1.22, spectral: 'G2 V', group: 'principal' },
  { id: 'alfa-cen-b', name: 'Alfa Centauri B', teff: 5260, lum: 0.5, radius: 0.86, spectral: 'K1 V', group: 'principal' },
  { id: 'proxima', name: 'Proxima Centauri', teff: 3040, lum: 0.0017, radius: 0.15, spectral: 'M5,5 V', group: 'principal' },
  { id: 'tau-ceti', name: 'Tau Ceti', teff: 5340, lum: 0.52, radius: 0.84, spectral: 'G8 V', group: 'principal' },
  { id: 'eps-eri', name: 'Epsilon Eridani', teff: 5080, lum: 0.34, radius: 0.75, spectral: 'K2 V', group: 'principal' },
  { id: '40-eri-b', name: '40 Eridani B', teff: 16500, lum: 0.013, radius: 0.014, spectral: 'DA4', group: 'ana-branca' },
  { id: 'barnard', name: 'Estrela de Barnard', teff: 3195, lum: 0.0035, radius: 0.19, spectral: 'M4 V', group: 'principal' },
]

export function starById(id: string): NamedStar | undefined {
  return NAMED_STARS.find((s) => s.id === id)
}

// ------------------------------------------------------------ Diagram regions

/** Approximate zero-age-ish main sequence: [log T, log L] nodes. */
const MAIN_SEQUENCE: [number, number][] = [
  [Math.log10(2800), -3.3],
  [Math.log10(3200), -2.3],
  [Math.log10(3600), -1.4],
  [Math.log10(4000), -0.85],
  [Math.log10(4500), -0.5],
  [Math.log10(5200), -0.2],
  [Math.log10(5772), 0],
  [Math.log10(6500), 0.35],
  [Math.log10(7500), 0.8],
  [Math.log10(9000), 1.25],
  [Math.log10(10000), 1.5],
  [Math.log10(15000), 2.5],
  [Math.log10(20000), 3.3],
  [Math.log10(30000), 4.5],
  [Math.log10(40000), 5.1],
]

/** log L of the main sequence at log T (piecewise linear, approximate). */
export function mainSequenceLogL(logT: number): number {
  const ms = MAIN_SEQUENCE
  if (logT <= ms[0][0]) return ms[0][1] + (logT - ms[0][0]) * ((ms[1][1] - ms[0][1]) / (ms[1][0] - ms[0][0]))
  for (let i = 1; i < ms.length; i++) {
    if (logT <= ms[i][0]) {
      const f = (logT - ms[i - 1][0]) / (ms[i][0] - ms[i - 1][0])
      return ms[i - 1][1] + f * (ms[i][1] - ms[i - 1][1])
    }
  }
  const a = ms[ms.length - 2]
  const b = ms[ms.length - 1]
  return b[1] + (logT - b[0]) * ((b[1] - a[1]) / (b[0] - a[0]))
}

export const MAIN_SEQUENCE_NODES = MAIN_SEQUENCE

// ------------------------------------------------------------ Simulated population

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r: () => number): number {
  const u = Math.max(r(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

const round3 = (x: number) => Number(x.toPrecision(3))

/**
 * A simulated, deterministic stellar population for when the Gaia archive
 * cannot be reached: a dense main sequence, a red-giant branch and clump,
 * a few supergiants and a white-dwarf sequence. Returns [Teff K, L L☉].
 * It imitates the look of a real H-R diagram; it is NOT a measurement.
 */
export function simulatedPopulation(n = 3000, seed = 1913): [number, number][] {
  const r = rng(seed)
  const out: [number, number][] = []
  const push = (logT: number, logL: number) => out.push([Math.round(10 ** logT), round3(10 ** logL)])
  for (let i = 0; i < n; i++) {
    const k = r()
    if (k < 0.82) {
      // Main sequence: nearby samples are dominated by cool dwarfs.
      const m = r()
      const logT = m < 0.5 ? 3.46 + r() * 0.14 : m < 0.88 ? 3.6 + r() * 0.21 : 3.81 + r() * 0.26 * r()
      let logL = mainSequenceLogL(logT) + gauss(r) * 0.12
      if (r() < 0.12) logL += 0.15 + r() * 0.2 // unresolved binaries and slightly evolved stars
      push(logT, logL)
    } else if (k < 0.85) {
      // Subgiants: leaving the main sequence.
      const logT = 3.69 + r() * 0.1
      push(logT, 0.3 + r() * 0.6 + gauss(r) * 0.08)
    } else if (k < 0.92) {
      if (r() < 0.45) {
        // Red clump (helium-burning giants).
        push(Math.log10(4800) + gauss(r) * 0.012, Math.log10(50) + gauss(r) * 0.12)
      } else {
        // Red-giant branch: cooler as it climbs.
        const u = r()
        const logT = Math.log10(5100) - u * (Math.log10(5100) - Math.log10(3600))
        push(logT + gauss(r) * 0.01, 0.8 + u * 2.6 + gauss(r) * 0.1)
      }
    } else if (k < 0.925) {
      // Supergiants, across all colors.
      push(3.55 + r() * 0.8, 4 + r() * 1.3)
    } else {
      // White dwarfs: R ≈ 0.012 R☉, many cool, few hot.
      const logT = Math.log10(5000) + r() ** 1.6 * (Math.log10(30000) - Math.log10(5000))
      const radius = 0.0105 + r() * 0.004
      push(logT, Math.log10(luminosityFrom(radius, 10 ** logT)))
    }
  }
  return out
}

// ------------------------------------------------------------ Sun's future

export interface TrackPoint {
  teff: number
  lum: number
  /** Label shown when the Sun reaches this point (if any). */
  label?: string
}

/**
 * Approximate evolutionary track of a 1 M☉ star (shape after MIST/Sackmann
 * et al. 1993; numbers rounded for teaching).
 */
export const SUN_TRACK: TrackPoint[] = [
  { teff: 5600, lum: 0.7, label: 'Sol jovem' },
  { teff: 5772, lum: 1, label: 'Hoje' },
  { teff: 5850, lum: 1.8, label: 'Fim da sequência principal' },
  { teff: 5000, lum: 2.4, label: 'Subgigante' },
  { teff: 4600, lum: 4 },
  { teff: 4300, lum: 30, label: 'Gigante vermelha' },
  { teff: 3900, lum: 300 },
  { teff: 3300, lum: 2000, label: 'Topo: ~2000 L☉' },
  { teff: 4700, lum: 45, label: 'Ramo horizontal' },
  { teff: 4500, lum: 100 },
  { teff: 3800, lum: 1000, label: 'Ramo assintótico' },
  { teff: 3150, lum: 4800 },
  { teff: 10000, lum: 4800, label: 'Nebulosa planetária' },
  { teff: 50000, lum: 4500 },
  { teff: 110000, lum: 3000 },
  { teff: 120000, lum: 500 },
  { teff: 100000, lum: 14, label: 'Anã branca' },
  { teff: 50000, lum: 0.9 },
  { teff: 25000, lum: 0.055 },
  { teff: 12000, lum: 0.003, label: 'Esfriando por bilhões de anos' },
]
