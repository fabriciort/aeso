import { describe, expect, it } from 'vitest'
import { BOLT, boltPosition, boltSegmentSpeeds, boltSpeed, boltTopSpeed, carPosition, derivative, secantSlope } from '@/lib/math/derivative'

describe('secantes e o limite', () => {
  it('a média de t² entre 5 e 5 + h é 10 + h', () => {
    for (const h of [3, 1, 0.1, 0.001]) expect(secantSlope(carPosition, 5, h)).toBeCloseTo(10 + h, 6)
  })
  it('a derivada numérica de t² é 2t', () => {
    for (const t of [0, 1, 5, 9]) expect(derivative(carPosition, t)).toBeCloseTo(2 * t, 6)
  })
})

describe('Usain Bolt, Berlim 2009', () => {
  it('o modelo passa a menos de 0,2 m de cada tempo parcial oficial', () => {
    BOLT.times.forEach((t, i) => {
      if (i === 0) return
      expect(Math.abs(boltPosition(t) - BOLT.distances[i])).toBeLessThan(0.2)
    })
  })
  it('a velocidade é a derivada da posição', () => {
    for (const t of [1, 3, 6, 9]) expect(boltSpeed(t)).toBeCloseTo(derivative(boltPosition, t), 3)
  })
  it('parado no tempo de reação, depois acelera', () => {
    expect(boltPosition(0.1)).toBe(0)
    expect(boltSpeed(1)).toBeLessThan(boltSpeed(3))
  })
  it('pico ≈ 12,2 m/s (≈ 44 km/h), perto da média do melhor trecho (12,35 m/s)', () => {
    const top = boltTopSpeed()
    expect(top.v).toBeGreaterThan(12.1)
    expect(top.v).toBeLessThan(12.4)
    const best = Math.max(...boltSegmentSpeeds().map((s) => s.v))
    expect(best).toBeCloseTo(12.35, 2)
  })
})
