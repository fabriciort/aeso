import { describe, expect, it } from 'vitest'
import {
  angleDelta,
  exactValue,
  halfTurn,
  LONDON_EYE,
  period,
  piFraction,
  quadrant,
  referenceAngle,
  reflectHorizontal,
  reflectVertical,
  sawtoothWave,
  sinusoid,
  sinusoidMatches,
  solveCos,
  solveSin,
  TAU,
  timeAbove,
  toDeg,
  toRad,
  triangleWave,
  unitPoint,
  waveDistance,
  wheelAngle,
  wheelBase,
  wheelHeight,
  wheelHub,
  wheelRadius,
  wrapAngle,
} from '@/lib/math/trig'

describe('círculo unitário', () => {
  it('cos é o x e sen é o y do ponto P', () => {
    for (const d of [0, 30, 90, 150, 210, 300]) {
      const p = unitPoint(toRad(d))
      expect(p.x).toBeCloseTo(Math.cos(toRad(d)), 12)
      expect(p.y).toBeCloseTo(Math.sin(toRad(d)), 12)
    }
    expect(unitPoint(Math.PI / 2).y).toBeCloseTo(1, 12)
  })

  it('sen²θ + cos²θ = 1 para qualquer ângulo (Pitágoras no círculo)', () => {
    for (let t = -7; t < 7; t += 0.37) {
      const { x, y } = unitPoint(t)
      expect(x * x + y * y).toBeCloseTo(1, 12)
    }
  })

  it('radianos: meia volta = π raios, volta inteira ≈ 6,28', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 12)
    expect(TAU).toBeCloseTo(6.283, 3)
    expect(toDeg(1)).toBeCloseTo(57.2958, 3)
  })

  it('wrapAngle e angleDelta', () => {
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12)
    expect(wrapAngle(5 * Math.PI)).toBeCloseTo(Math.PI, 12)
    expect(wrapAngle(TAU)).toBe(0)
    expect(angleDelta(toRad(350), toRad(10))).toBeCloseTo(toRad(20), 12)
    expect(angleDelta(toRad(10), toRad(350))).toBeCloseTo(toRad(-20), 12)
  })

  it('quadrantes e ângulo de referência', () => {
    expect(quadrant(toRad(45))).toBe(1)
    expect(quadrant(toRad(150))).toBe(2)
    expect(quadrant(toRad(210))).toBe(3)
    expect(quadrant(toRad(330))).toBe(4)
    expect(quadrant(toRad(90))).toBe(0)
    for (const d of [30, 150, 210, 330]) expect(toDeg(referenceAngle(toRad(d)))).toBeCloseTo(30, 9)
  })
})

describe('simetrias (Resolva)', () => {
  it('sen 150° = sen 30°: espelho no eixo vertical mantém a altura', () => {
    const t = toRad(30)
    expect(toDeg(reflectVertical(t))).toBeCloseTo(150, 9)
    expect(Math.sin(toRad(150))).toBeCloseTo(Math.sin(t), 12)
    expect(Math.sin(toRad(150))).toBeCloseTo(0.5, 12)
    expect(Math.cos(toRad(150))).toBeCloseTo(-Math.cos(t), 12)
  })

  it('cos 210° = −cos 30°: meia volta troca os dois sinais', () => {
    const t = toRad(30)
    expect(toDeg(halfTurn(t))).toBeCloseTo(210, 9)
    expect(Math.cos(toRad(210))).toBeCloseTo(-Math.sqrt(3) / 2, 12)
    expect(Math.sin(toRad(210))).toBeCloseTo(-0.5, 12)
  })

  it('os distratores levam a outros ângulos', () => {
    expect(toDeg(reflectVertical(toRad(60)))).toBeCloseTo(120, 9)
    expect(toDeg(reflectHorizontal(toRad(30)))).toBeCloseTo(330, 9)
    expect(toDeg(reflectVertical(toRad(30)))).not.toBeCloseTo(210, 3)
  })

  it('sen θ = 1/2 tem DUAS soluções em [0, 2π): π/6 e 5π/6', () => {
    const s = solveSin(0.5)
    expect(s).toHaveLength(2)
    expect(s[0]).toBeCloseTo(Math.PI / 6, 12)
    expect(s[1]).toBeCloseTo((5 * Math.PI) / 6, 12)
  })

  it('casos de borda de solveSin e solveCos', () => {
    expect(solveSin(1)).toHaveLength(1)
    expect(solveSin(1)[0]).toBeCloseTo(Math.PI / 2, 12)
    expect(solveSin(2)).toEqual([])
    const neg = solveSin(-0.5)
    expect(neg.map(toDeg)[0]).toBeCloseTo(210, 9)
    expect(neg.map(toDeg)[1]).toBeCloseTo(330, 9)
    const c = solveCos(0.5).map(toDeg)
    expect(c[0]).toBeCloseTo(60, 9)
    expect(c[1]).toBeCloseTo(300, 9)
  })
})

describe('ondas (Preveja e E se…?)', () => {
  it('a triangular e a senoide têm os mesmos picos, mas formas diferentes', () => {
    expect(triangleWave(Math.PI / 2)).toBeCloseTo(1, 12)
    expect(triangleWave((3 * Math.PI) / 2)).toBeCloseTo(-1, 12)
    expect(triangleWave(Math.PI / 4)).toBeCloseTo(0.5, 12)
    expect(Math.sin(Math.PI / 4)).toBeGreaterThan(0.7)
  })

  it('o dente de serra sobe em linha reta e cai de uma vez', () => {
    expect(sawtoothWave(0)).toBeCloseTo(0, 12)
    expect(sawtoothWave(Math.PI / 2)).toBeCloseTo(0.5, 12)
    expect(sawtoothWave(Math.PI - 1e-6)).toBeCloseTo(1, 5)
    expect(sawtoothWave(Math.PI + 1e-6)).toBeCloseTo(-1, 5)
  })

  it('h(t) = A·sen(ωt) + d', () => {
    const p = { A: 2, w: 3, d: 1 }
    expect(sinusoid(p, 0)).toBeCloseTo(1, 12)
    expect(sinusoid(p, Math.PI / 6)).toBeCloseTo(3, 12)
    expect(period(2)).toBeCloseTo(Math.PI, 12)
  })

  it('mede quão perto uma onda está do alvo', () => {
    const target = { A: 0.5, w: 2, d: 1 }
    expect(waveDistance(target, target)).toBe(0)
    expect(waveDistance({ A: 1, w: 1, d: 0 }, target)).toBeGreaterThan(0.5)
    expect(sinusoidMatches({ A: 0.55, w: 1.95, d: 1.05 }, target)).toBe(true)
    expect(sinusoidMatches({ A: 0.5, w: 1, d: 1 }, target)).toBe(false)
  })
})

describe('London Eye (No mundo real)', () => {
  it('geometria: raio 60 m, eixo a 75 m, base a 15 m', () => {
    expect(wheelRadius()).toBe(60)
    expect(wheelHub()).toBe(75)
    expect(wheelBase()).toBe(15)
    expect(LONDON_EYE.periodMin).toBe(30)
  })

  it('h(t) = 75 − 60·cos(2πt/30)', () => {
    expect(wheelHeight(0)).toBeCloseTo(15, 9)
    expect(wheelHeight(7.5)).toBeCloseTo(75, 9)
    expect(wheelHeight(15)).toBeCloseTo(135, 9)
    expect(wheelHeight(30)).toBeCloseTo(15, 9)
  })

  it('o ângulo da cabine bate com a altura', () => {
    for (const t of [0, 4, 11, 19, 27]) {
      expect(wheelHub() + wheelRadius() * Math.sin(wheelAngle(t))).toBeCloseTo(wheelHeight(t), 9)
    }
  })

  it('acima de 100 m entre ≈ 9,6 e ≈ 20,4 min (≈ 10,9 min)', () => {
    const r = timeAbove(100)!
    expect(r.t1).toBeCloseTo(9.55, 2)
    expect(r.t2).toBeCloseTo(20.45, 2)
    expect(r.duration).toBeCloseTo(10.9, 1)
    expect(wheelHeight(r.t1)).toBeCloseTo(100, 9)
    expect(timeAbove(200)).toBeNull()
    expect(timeAbove(10)?.duration).toBe(30)
  })
})

describe('notação', () => {
  it('valores exatos', () => {
    expect(exactValue(0.5)?.tex).toBe('\\tfrac{1}{2}')
    expect(exactValue(-Math.sqrt(3) / 2)?.tex).toBe('-\\tfrac{\\sqrt{3}}{2}')
    expect(exactValue(0.3)).toBeNull()
  })

  it('múltiplos de π', () => {
    expect(piFraction(Math.PI / 6)?.text).toBe('π/6')
    expect(piFraction((5 * Math.PI) / 6)?.text).toBe('5π/6')
    expect(piFraction(Math.PI)?.text).toBe('π')
    expect(piFraction(2 * Math.PI)?.tex).toBe('2\\pi')
    expect(piFraction((3 * Math.PI) / 2)?.text).toBe('3π/2')
    expect(piFraction(1)).toBeNull()
  })
})
