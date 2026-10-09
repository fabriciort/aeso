import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  absoluteMagnitude,
  L_SUN_W,
  logLOnRadiusLine,
  luminosityFrom,
  luminosityFromAbsG,
  luminosityWatts,
  mainSequenceLogL,
  NAMED_STARS,
  R_EARTH_IN_R_SUN,
  R_SUN_IN_AU,
  R_SUN_M,
  radiusFrom,
  simulatedPopulation,
  starById,
  starRgb,
  SUN_TRACK,
  T_SUN,
} from '@/lib/astro/stars'
import { DIAGRAMA_HR } from '@/lib/labs/diagrama-hr'

describe('Stefan-Boltzmann', () => {
  it('reproduces the nominal solar luminosity', () => {
    expect(luminosityWatts(R_SUN_M, T_SUN) / L_SUN_W).toBeCloseTo(1, 2)
  })
  it('scales as R² T⁴', () => {
    expect(luminosityFrom(2, T_SUN)).toBeCloseTo(4)
    expect(luminosityFrom(1, 2 * T_SUN)).toBeCloseTo(16)
    expect(radiusFrom(luminosityFrom(37, 4200), 4200)).toBeCloseTo(37)
  })
  it('lines of constant radius are straight with slope 4 in log-log', () => {
    const a = logLOnRadiusLine(10, 3.6)
    const b = logLOnRadiusLine(10, 3.7)
    expect((b - a) / 0.1).toBeCloseTo(4)
    expect(logLOnRadiusLine(1, Math.log10(T_SUN))).toBeCloseTo(0)
  })
})

describe('named stars', () => {
  it('has the required stars', () => {
    const names = NAMED_STARS.map((s) => s.name)
    for (const n of ['Sol', 'Sirius A', 'Sirius B', 'Vega', 'Betelgeuse', 'Rigel', 'Antares', 'Aldebaran', 'Arcturus', 'Capella', 'Procyon A', 'Procyon B', 'Altair', 'Deneb', 'Spica', 'Polaris', 'Alfa Centauri A', 'Alfa Centauri B', 'Proxima Centauri', 'Tau Ceti', 'Epsilon Eridani', '40 Eridani B', 'Estrela de Barnard']) {
      expect(names).toContain(n)
    }
    expect(new Set(NAMED_STARS.map((s) => s.id)).size).toBe(NAMED_STARS.length)
  })
  it('is consistent with L = R²(T/T☉)⁴ within 12 %', () => {
    for (const s of NAMED_STARS) {
      const ratio = luminosityFrom(s.radius, s.teff) / s.lum
      expect(ratio, s.name).toBeGreaterThan(0.88)
      expect(ratio, s.name).toBeLessThan(1.12)
    }
  })
  it('Betelgeuse radius from L and T is ≈ 800 R☉ ≈ 3,7 UA', () => {
    const b = starById('betelgeuse')!
    const r = radiusFrom(b.lum, b.teff)
    expect(r).toBeGreaterThan(750)
    expect(r).toBeLessThan(870)
    expect(r * R_SUN_IN_AU).toBeGreaterThan(3.5)
    expect(r * R_SUN_IN_AU).toBeLessThan(4)
    // Larger than Mars' orbit (1,52 UA), smaller than Jupiter's (5,2 UA)
    expect(r * R_SUN_IN_AU).toBeGreaterThan(1.52)
  })
  it('Sirius B is about the size of the Earth', () => {
    const s = starById('sirius-b')!
    expect(s.radius / R_EARTH_IN_R_SUN).toBeGreaterThan(0.8)
    expect(s.radius / R_EARTH_IN_R_SUN).toBeLessThan(1.1)
  })
  it('main-sequence stars sit near the main-sequence line', () => {
    for (const s of NAMED_STARS.filter((x) => x.group === 'principal' && x.id !== 'spica' && x.id !== 'regulus')) {
      expect(Math.abs(Math.log10(s.lum) - mainSequenceLogL(Math.log10(s.teff))), s.name).toBeLessThan(0.5)
    }
  })
})

describe('color', () => {
  it('goes from red to blue', () => {
    const [r1, , b1] = starRgb(3000)
    const [r2, , b2] = starRgb(30000)
    expect(r1).toBe(255)
    expect(b1).toBeLessThan(140)
    expect(b2).toBe(255)
    expect(r2).toBeLessThan(170)
    // clamps
    expect(starRgb(100)).toEqual(starRgb(2000))
    expect(starRgb(1e6)).toEqual(starRgb(40000))
  })
})

describe('Gaia photometry', () => {
  it('absolute magnitude from parallax', () => {
    // At 10 pc (100 mas) M = m
    expect(absoluteMagnitude(5, 100)).toBeCloseTo(5)
    // At 100 pc (10 mas) M = m − 5
    expect(absoluteMagnitude(10, 10)).toBeCloseTo(5)
  })
  it('the Sun at 10 pc has L ≈ 1', () => {
    expect(luminosityFromAbsG(4.67)).toBeCloseTo(1)
    expect(luminosityFromAbsG(4.67 - 5)).toBeCloseTo(100)
  })
})

describe('simulated population', () => {
  it('is deterministic and looks like an H-R diagram', () => {
    const a = simulatedPopulation(3000)
    expect(a).toEqual(simulatedPopulation(3000))
    expect(a).toHaveLength(3000)
    let ms = 0
    let wd = 0
    let sg = 0
    for (const [t, l] of a) {
      expect(t).toBeGreaterThan(2000)
      expect(t).toBeLessThan(50000)
      expect(l).toBeGreaterThan(0)
      const dl = Math.log10(l) - mainSequenceLogL(Math.log10(t))
      if (Math.abs(dl) < 0.5) ms++
      if (dl < -2) wd++
      if (l > 1e4) sg++
    }
    expect(ms / a.length).toBeGreaterThan(0.7)
    expect(wd).toBeGreaterThan(50)
    expect(sg).toBeGreaterThan(3)
  })
})

describe('Sun track', () => {
  it('climbs to ~2000 L☉ as a red giant and ends as a white dwarf', () => {
    expect(SUN_TRACK.find((p) => p.label === 'Hoje')).toMatchObject({ teff: 5772, lum: 1 })
    const tip = SUN_TRACK.find((p) => p.label?.startsWith('Topo'))!
    expect(tip.lum).toBeGreaterThan(1500)
    expect(tip.teff).toBeLessThan(4000)
    const last = SUN_TRACK[SUN_TRACK.length - 1]
    // White-dwarf radius (~0,0125 R☉)
    expect(radiusFrom(last.lum, last.teff)).toBeLessThan(0.02)
  })
})

describe('gaia-hr route', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.AESO_MOCK
  })
  it('falls back to the simulated population when Gaia is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { GET } = await import('@/app/api/gaia-hr/route')
    const res = await GET()
    const body = (await res.json()) as { source: string; stars: [number, number][] }
    expect(body.source).toBe('simulado')
    expect(body.stars.length).toBe(3000)
  })
  it('in mock mode returns simulated data without touching the network', async () => {
    process.env.AESO_MOCK = '1'
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    const { GET } = await import('@/app/api/gaia-hr/route')
    const body = (await (await GET()).json()) as { source: string }
    expect(body.source).toBe('simulado')
    expect(f).not.toHaveBeenCalled()
  })
  it('parses a Gaia TAP JSON answer', async () => {
    const data = Array.from({ length: 150 }, (_, i) => [5772, 4.67 + (i % 3), 100])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ metadata: [{ name: 'teff_gspphot' }, { name: 'phot_g_mean_mag' }, { name: 'parallax' }], data }), { status: 200 })),
    )
    const { GET } = await import('@/app/api/gaia-hr/route')
    const res = await GET()
    const body = (await res.json()) as { source: string; stars: [number, number][] }
    expect(body.source).toBe('gaia')
    expect(body.stars[0]).toEqual([5772, 1])
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400')
  })
})

describe('lab definition', () => {
  it('has the seven steps in order', () => {
    expect(DIAGRAMA_HR.status).toBe('disponivel')
    expect(DIAGRAMA_HR.steps.map((s) => s.id)).toEqual(['imagine', 'preveja', 'observe', 'entenda', 'meca', 'e-se', 'conclua'])
    for (const s of DIAGRAMA_HR.steps) expect(s.ask?.length).toBeGreaterThanOrEqual(2)
  })
})
