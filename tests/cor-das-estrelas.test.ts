import { describe, expect, it } from 'vitest'
import { blackbodyRgb, glowVisibility, planck, planckNormalized, wienPeakNm, wienTemperature } from '@/lib/astro/blackbody'

describe('blackbody', () => {
  it('Wien: the Sun peaks near 502 nm, a person (310 K) near 9.3 µm', () => {
    expect(wienPeakNm(5772)).toBeCloseTo(502, 0)
    expect(wienPeakNm(310)).toBeGreaterThan(9300)
    expect(wienPeakNm(310)).toBeLessThan(9400)
    expect(wienTemperature(290)).toBeCloseTo(9992, -1)
  })

  it('Planck peaks at the Wien wavelength', () => {
    const T = 3600
    const p = wienPeakNm(T)
    expect(planck(p, T)).toBeGreaterThan(planck(p * 0.95, T))
    expect(planck(p, T)).toBeGreaterThan(planck(p * 1.05, T))
    expect(planckNormalized(p, T)).toBeCloseTo(1, 6)
  })

  it('hotter is brighter at every wavelength', () => {
    for (const l of [300, 500, 800, 2000]) expect(planck(l, 6000)).toBeGreaterThan(planck(l, 5000))
  })

  it('colors: cool stars are red, hot stars are blue, the Sun is nearly white', () => {
    const [r1, , b1] = blackbodyRgb(3000)
    expect(r1).toBeGreaterThan(b1 + 80)
    const [r2, , b2] = blackbodyRgb(15000)
    expect(b2).toBeGreaterThan(r2)
    const sun = blackbodyRgb(5772)
    expect(Math.min(...sun)).toBeGreaterThan(200)
  })

  it('room temperature does not glow; 2500 K glows fully', () => {
    expect(glowVisibility(300)).toBe(0)
    expect(glowVisibility(900)).toBeGreaterThan(0)
    expect(glowVisibility(2500)).toBe(1)
  })
})
