import { describe, expect, it } from 'vitest'
import {
  accumulate,
  antiderivative,
  BOLT_PEAK,
  BOLT_SEGMENTS,
  boltArea,
  boltDistance,
  boltVelocity,
  definite,
  derivative,
  evalPoly,
  riemann,
  riemannRects,
  signedAndTotal,
  simpson,
  trapezoid,
} from '@/lib/math/integral'
import { carAccel, carAccelDistance, carReverse, carReverseDisplacement, P1, P2, P3 } from '@/components/labs/integral/shared'

const sq = (x: number) => x * x

describe('Riemann sums', () => {
  it('∫₀² x² dx with 4 slices: right 3,75, left 1,75, mid 2,625', () => {
    expect(riemann(sq, 0, 2, 4, 'right')).toBeCloseTo(3.75, 10)
    expect(riemann(sq, 0, 2, 4, 'left')).toBeCloseTo(1.75, 10)
    expect(riemann(sq, 0, 2, 4, 'mid')).toBeCloseTo(2.625, 10)
  })

  it('rectangles: widths Δx, heights f(sample)', () => {
    const r = riemannRects(sq, 0, 2, 4, 'right')
    expect(r.map((q) => q.h)).toEqual([0.25, 1, 2.25, 4])
    expect(r[0].x1 - r[0].x0).toBeCloseTo(0.5, 12)
  })

  it('all sums converge to 8/3; midpoint error ~1/n², left ~1/n', () => {
    for (const m of ['left', 'right', 'mid'] as const) expect(riemann(sq, 0, 2, 4096, m)).toBeCloseTo(8 / 3, 2)
    const eL = (n: number) => Math.abs(8 / 3 - riemann(sq, 0, 2, n, 'left'))
    const eM = (n: number) => Math.abs(8 / 3 - riemann(sq, 0, 2, n, 'mid'))
    expect(eL(10) / eL(20)).toBeCloseTo(2, 0)
    expect(eM(10) / eM(20)).toBeCloseTo(4, 5)
    expect(eL(10)).toBeCloseTo(0.3867, 3)
    expect(eM(10)).toBeCloseTo(0.00667, 4)
  })

  it('right sums of an increasing curve go DOWN with more slices (the misconception)', () => {
    expect(riemann(carAccel, 0, 2, 4, 'right')).toBeCloseTo(116.25, 10)
    expect(riemann(carAccel, 0, 2, 8, 'right')).toBeCloseTo(107.8125, 10)
    expect(riemann(carAccel, 0, 2, 4, 'left')).toBeCloseTo(86.25, 10)
  })

  it('trapezoid = average of left and right; Simpson is exact for cubics', () => {
    const f = (x: number) => x ** 3 - x
    expect(trapezoid(f, 0, 2, 6)).toBeCloseTo((riemann(f, 0, 2, 6, 'left') + riemann(f, 0, 2, 6, 'right')) / 2, 12)
    expect(simpson(f, 0, 2, 2)).toBeCloseTo(2, 12)
  })
})

describe('Teorema Fundamental', () => {
  it('antiderivative and definite integral of polynomials', () => {
    expect(definite([0, 0, 1], 0, 2)).toBeCloseTo(8 / 3, 12)
    expect(definite([1, 2], 1, 3)).toBeCloseTo(10, 12) // ∫₁³ (2x + 1) dx
    const F = antiderivative([1, 2])
    expect(evalPoly(F, 3)).toBe(12)
    expect(evalPoly(F, 1)).toBe(2)
    expect(derivative(F)).toEqual([1, 2])
  })

  it("A(x) = ∫₀ˣ t² dt = x³/3, and A'(x) = f(x)", () => {
    const A = (x: number) => accumulate(sq, 0, x)
    expect(A(1.5)).toBeCloseTo(1.125, 9)
    const h = 1e-4
    expect((A(1.5 + h) - A(1.5 - h)) / (2 * h)).toBeCloseTo(2.25, 5)
  })

  it('imagined car: 100 km accelerating; reverse: displacement 25 km, distance 65 km', () => {
    expect(simpson(carAccel, 0, 2)).toBeCloseTo(100, 9)
    expect(carAccelDistance(2)).toBe(100)
    const { signed, total } = signedAndTotal(carReverse, 0, 2.5)
    expect(signed).toBeCloseTo(25, 6)
    expect(total).toBeCloseTo(65, 3)
    expect(carReverseDisplacement(2.5)).toBe(25)
    expect(carReverseDisplacement(1.5)).toBe(45)
  })
})

describe('Usain Bolt, Berlin 2009', () => {
  it('every 10 m step has area 10 m; the steps add up to 100 m', () => {
    expect(BOLT_SEGMENTS).toHaveLength(10)
    for (const s of BOLT_SEGMENTS) expect(s.v * (s.t1 - s.t0)).toBeCloseTo(10, 12)
    expect(boltArea()).toBeCloseTo(100, 12)
    expect(simpson(boltVelocity, 0, 9.58, 200000)).toBeCloseTo(100, 1)
  })

  it('distance is the accumulated area; peak ≈ 12,3 m/s between 60 and 70 m', () => {
    expect(boltDistance(0.1)).toBe(0)
    expect(boltDistance(1.89)).toBeCloseTo(10, 9)
    expect(boltDistance(6.29)).toBeCloseTo(60, 9)
    expect(boltDistance(9.58)).toBe(100)
    expect(BOLT_PEAK.v).toBeGreaterThan(12.3)
    expect(BOLT_PEAK.v).toBeLessThan(12.4)
    expect(BOLT_PEAK.d0).toBe(60)
    expect(BOLT_SEGMENTS[0].v).toBeCloseTo(10 / (1.89 - 0.146), 9)
  })
})

describe('guided problems', () => {
  it('each step has exactly one right option, with explanations for the others', () => {
    for (const t of [...P1, P2[1], P3]) {
      expect(t.options.filter((o) => o.ok)).toHaveLength(1)
      for (const o of t.options) if (!o.ok) expect(o.why).toBeTruthy()
    }
  })
})
