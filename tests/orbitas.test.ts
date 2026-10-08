import { describe, expect, it } from 'vitest'
import {
  AU,
  circularPeriod,
  classify,
  elements,
  energy,
  fitKepler,
  flight,
  GM_EARTH,
  GM_SUN,
  gravityFraction,
  keplerPeriodYears,
  keplerPosition,
  launchState,
  LAUNCH_R,
  PLANETS,
  R_EARTH,
  solveKepler,
  sweptArea,
  toKms,
  vCircular,
  verletStep,
  vEscape,
  visViva,
} from '@/lib/astro/orbits'
import { ORBITAS } from '@/lib/labs/orbitas'

describe('velocidades perto da Terra', () => {
  it('v circular rente ao chão ≈ 7,9 km/s e escape ≈ 11,2 km/s', () => {
    expect(vCircular(R_EARTH) / 1000).toBeCloseTo(7.91, 2)
    expect(vEscape(R_EARTH) / 1000).toBeCloseTo(11.19, 2)
    expect(vEscape(R_EARTH) / vCircular(R_EARTH)).toBeCloseTo(Math.SQRT2, 10)
  })
  it('no alto do canhão (30 km) os números arredondados continuam 7,9 e 11,2', () => {
    const r = LAUNCH_R * R_EARTH
    expect(Math.round(vCircular(r) / 100) / 10).toBe(7.9)
    expect(Math.round(vEscape(r) / 100) / 10).toBe(11.2)
  })
  it('ISS: ≈ 92 min de volta e gravidade ≈ 89 % da superfície', () => {
    const r = R_EARTH + 400e3
    expect(circularPeriod(r) / 60).toBeGreaterThan(91)
    expect(circularPeriod(r) / 60).toBeLessThan(93)
    expect(gravityFraction(400e3)).toBeCloseTo(0.885, 3)
  })
})

describe('trajetórias do canhão', () => {
  it('classifica as balas', () => {
    expect(classify(1)).toBe('cai')
    expect(classify(4)).toBe('cai')
    expect(classify(7)).toBe('cai')
    expect(classify(7.9)).toBe('circulo')
    expect(classify(9.5)).toBe('elipse')
    expect(classify(11)).toBe('elipse')
    expect(classify(11.2)).toBe('escapa')
    expect(classify(12)).toBe('escapa')
  })
  it('bala mais rápida cai mais longe', () => {
    const a = flight(2).angle
    const b = flight(5).angle
    const c = flight(7).angle
    expect(a).toBeLessThan(b)
    expect(b).toBeLessThan(c)
    expect(flight(2).landed).toBe(true)
    expect(flight(7.9, 10).landed).toBe(false)
  })
  it('Verlet conserva a energia e fecha a órbita circular', () => {
    let b = launchState(toKms(Math.sqrt(1 / LAUNCH_R)))
    const e0 = energy(b)
    const T = 2 * Math.PI * Math.sqrt(LAUNCH_R ** 3)
    const dt = 0.0015
    const n = Math.round(T / dt)
    for (let i = 0; i < n; i++) b = verletStep(b, dt)
    expect(Math.abs(energy(b) - e0) / Math.abs(e0)).toBeLessThan(1e-6)
    expect(Math.hypot(b.x - 0, b.y - LAUNCH_R)).toBeLessThan(0.01)
  })
  it('elementos: na velocidade de escape a energia é zero', () => {
    const el = elements({ x: 0, y: 1, vx: Math.SQRT2, vy: 0 })
    expect(el.energy).toBeCloseTo(0, 12)
    expect(el.bound).toBe(false)
    const el2 = elements({ x: 0, y: 1, vx: 1.2, vy: 0 })
    expect(el2.rp).toBeCloseTo(1, 10)
    expect(el2.e).toBeCloseTo(0.44, 10)
  })
})

describe('leis de Kepler', () => {
  it('resolve a equação de Kepler', () => {
    for (const M of [0.1, 1, 2.5, 3.1]) {
      const E = solveKepler(M, 0.6)
      expect(E - 0.6 * Math.sin(E)).toBeCloseTo(M, 12)
    }
  })
  it('periélio e afélio da elipse e = 0,6', () => {
    expect(keplerPosition(1, 0.6, 0).r).toBeCloseTo(0.4, 10)
    expect(keplerPosition(1, 0.6, Math.PI).r).toBeCloseTo(1.6, 10)
    const vp = visViva(GM_SUN, AU, 0.4 * AU) / 1000
    const va = visViva(GM_SUN, AU, 1.6 * AU) / 1000
    expect(vp / va).toBeCloseTo(4, 6)
  })
  it('2ª lei: áreas iguais em tempos iguais', () => {
    const dM = (2 * Math.PI) / 10
    const total = Math.PI * Math.sqrt(1 - 0.36)
    for (const M0 of [-dM / 2, 1.3, Math.PI - dM / 2]) {
      expect(sweptArea(1, 0.6, M0, M0 + dM, 400)).toBeCloseTo(total / 10, 3)
    }
  })
  it('3ª lei: T² = a³ nos planetas reais (k ≈ 1 ano²/UA³)', () => {
    expect(fitKepler()).toBeGreaterThan(0.99)
    expect(fitKepler()).toBeLessThan(1.01)
    for (const p of PLANETS) expect(p.T ** 2 / p.a ** 3).toBeCloseTo(1, 1)
    expect(keplerPeriodYears(4)).toBe(8)
  })
  it('o ano da Terra sai de GM do Sol', () => {
    expect(circularPeriod(AU, GM_SUN) / (365.25 * 86400)).toBeCloseTo(1, 2)
    expect(GM_EARTH).toBeCloseTo(3.986e14, -11)
  })
})

describe('definição do laboratório', () => {
  it('tem as 7 etapas com Vega e perguntas', () => {
    expect(ORBITAS.status).toBe('disponivel')
    expect(ORBITAS.steps.map((s) => s.kind)).toEqual(['cenario', 'previsao', 'conceito', 'observacao', 'medicao', 'desafio', 'conclusao'])
    for (const s of ORBITAS.steps) {
      expect(s.vega.length).toBeGreaterThan(40)
      expect(s.ask?.length).toBeGreaterThanOrEqual(2)
    }
  })
})
