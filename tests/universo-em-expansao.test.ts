import { describe, expect, it } from 'vitest'
import {
  ANDROMEDA,
  approachCosine,
  C_KMS,
  dopplerSound,
  fitError,
  GALAXIES,
  GALAXIES_BEST_H0,
  H_ALPHA,
  hubbleTimeGyr,
  hubbleVelocity,
  observedWavelength,
  redshift,
  relativisticObservedWavelength,
  slopeThroughOrigin,
  velocityFromWavelength,
  wavelengthToRgb,
} from '@/lib/astro/cosmology'
import { UNIVERSO_EM_EXPANSAO } from '@/lib/labs/universo-em-expansao'

describe('Doppler do som', () => {
  it('fica mais agudo chegando e mais grave indo embora', () => {
    expect(dopplerSound(700, 30, 1)).toBeCloseTo((700 * 343) / 313, 6)
    expect(dopplerSound(700, 30, -1)).toBeCloseTo((700 * 343) / 373, 6)
    expect(dopplerSound(700, 30, 1)).toBeGreaterThan(700)
    expect(dopplerSound(700, 30, -1)).toBeLessThan(700)
  })
  it('não muda quando a fonte passa de lado (cosθ = 0) ou está parada', () => {
    expect(dopplerSound(700, 30, 0)).toBe(700)
    expect(dopplerSound(700, 0, 1)).toBe(700)
  })
  it('calcula cosθ entre a velocidade e a linha até o ouvinte', () => {
    expect(approachCosine(-10, 0, 1, 0, 0, 0)).toBeCloseTo(1)
    expect(approachCosine(10, 0, 1, 0, 0, 0)).toBeCloseTo(-1)
    expect(approachCosine(0, 0, 1, 0, 0, 5)).toBeCloseTo(0)
    expect(approachCosine(-5, 0, 1, 0, 0, 5)).toBeCloseTo(Math.SQRT1_2)
  })
})

describe('redshift', () => {
  it('Hα a 6 200 km/s vai para ≈ 670 nm', () => {
    expect(observedWavelength(H_ALPHA, 6200)).toBeCloseTo(669.87, 1)
  })
  it('a velocidade volta pela fórmula v = c·Δλ/λ', () => {
    for (const v of [-300, 1500, 11270, 30000]) {
      expect(velocityFromWavelength(observedWavelength(H_ALPHA, v), H_ALPHA)).toBeCloseTo(v, 6)
    }
    expect(redshift(observedWavelength(500, 0.1 * C_KMS), 500)).toBeCloseTo(0.1, 10)
  })
  it('a aproximação linear erra menos de 1 % até 30 000 km/s', () => {
    const lin = observedWavelength(H_ALPHA, 30000)
    const rel = relativisticObservedWavelength(H_ALPHA, 30000)
    expect(Math.abs(lin - rel) / rel).toBeLessThan(0.01)
  })
  it('converte comprimento de onda em cor', () => {
    const [r, g, b] = wavelengthToRgb(656)
    expect(r).toBeGreaterThan(200)
    expect(g).toBe(0)
    expect(b).toBe(0)
    expect(wavelengthToRgb(450)[2]).toBe(255)
    expect(wavelengthToRgb(300)).toEqual([0, 0, 0])
  })
})

describe('lei de Hubble', () => {
  it('as galáxias hipotéticas seguem 70·d com desvio peculiar de 50 a 200 km/s', () => {
    expect(GALAXIES.map((g) => g.distanceMpc)).toEqual([20, 45, 80, 120, 160])
    for (const g of GALAXIES) {
      const pec = g.velocityKms - hubbleVelocity(g.distanceMpc, 70)
      expect(Math.abs(pec)).toBeGreaterThanOrEqual(50)
      expect(Math.abs(pec)).toBeLessThanOrEqual(200)
    }
  })
  it('o melhor ajuste pela origem é ≈ 70 km/s/Mpc', () => {
    expect(GALAXIES_BEST_H0).toBeGreaterThan(69)
    expect(GALAXIES_BEST_H0).toBeLessThan(71.5)
    expect(slopeThroughOrigin([{ x: 1, y: 2 }, { x: 3, y: 6 }])).toBeCloseTo(2)
    expect(fitError(73.5, 70)).toBeCloseTo(0.05)
  })
  it('o tempo de Hubble é ≈ 977,8/H0 bilhões de anos', () => {
    expect(hubbleTimeGyr(1)).toBeCloseTo(977.8, 0)
    expect(hubbleTimeGyr(70)).toBeCloseTo(13.97, 1)
    expect(hubbleTimeGyr(67.4)).toBeCloseTo(14.5, 1)
  })
  it('Andrômeda: pela lei de Hubble se afastaria a ≈ 55 km/s', () => {
    expect(hubbleVelocity(ANDROMEDA.distanceMpc, 70)).toBeCloseTo(54.6, 1)
    expect(ANDROMEDA.radialVelocityKms).toBeLessThan(0)
  })
})

describe('definição do laboratório', () => {
  it('está disponível, com etapas na ordem e perguntas para a Vega', () => {
    const lab = UNIVERSO_EM_EXPANSAO
    expect(lab.status).toBe('disponivel')
    expect(lab.steps.map((s) => s.id)).toEqual(['imagine', 'preveja', 'entenda', 'observe', 'meca', 'e-se', 'conclua'])
    for (const s of lab.steps) {
      expect(s.vega.length).toBeGreaterThan(80)
      expect(s.ask?.length ?? 0).toBeGreaterThanOrEqual(2)
    }
  })
})
