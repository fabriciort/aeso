import { describe, expect, it } from 'vitest'
import {
  coefficient,
  coefficients,
  correctDigits,
  deg,
  derivativeAt0,
  derivePoly,
  eSums,
  evalPoly,
  factorial,
  FN,
  goodInterval,
  lagrangeBound,
  lagrangeRadius,
  pendulumPeriodRatio,
  smallAngleError,
  taylor,
  taylorError,
  TAYLOR_FNS,
} from '@/lib/math/taylor'

describe('Taylor coefficients', () => {
  it('sin, cos and eˣ have the textbook coefficients', () => {
    expect(coefficients('sin', 7)).toEqual([0, 1, 0, -1 / 6, 0, 1 / 120, 0, -1 / 5040])
    expect(coefficients('cos', 4)).toEqual([1, 0, -1 / 2, 0, 1 / 24])
    expect(coefficients('exp', 3)).toEqual([1, 1, 1 / 2, 1 / 6])
    expect(coefficients('ln1p', 4)).toEqual([0, 1, -1 / 2, 1 / 3, -1 / 4])
    expect(coefficients('geom', 3)).toEqual([1, 1, 1, 1])
  })

  it('cₙ = f⁽ⁿ⁾(0)/n! for every function', () => {
    for (const fn of TAYLOR_FNS) for (let n = 0; n <= 10; n++) expect(coefficient(fn, n)).toBeCloseTo(derivativeAt0(fn, n) / factorial(n), 12)
  })

  it('deriving xⁿ n times leaves n! (why the factorial appears)', () => {
    for (let n = 1; n <= 8; n++) {
      let c: number[] = Array.from({ length: n + 1 }, (_, i) => (i === n ? 1 : 0))
      for (let k = 0; k < n; k++) c = derivePoly(c)
      expect(c).toEqual([factorial(n)])
    }
    expect(derivePoly([0, 0, 0, 1])).toEqual([0, 0, 3])
  })

  it('the derivatives of the polynomial match those of f at 0', () => {
    let c = coefficients('sin', 9)
    for (let n = 0; n <= 9; n++) {
      expect(evalPoly(c, 0)).toBeCloseTo(derivativeAt0('sin', n), 12)
      c = derivePoly(c)
    }
  })
})

describe('the copy of sin x', () => {
  it('good region (error < 0,01) grows with the degree', () => {
    const r1 = goodInterval(Math.sin, coefficients('sin', 1))[1]
    const r3 = goodInterval(Math.sin, coefficients('sin', 3))[1]
    const r5 = goodInterval(Math.sin, coefficients('sin', 5))[1]
    const r31 = goodInterval(Math.sin, coefficients('sin', 31), 0.01, 40, 0.005)[1]
    expect(r1).toBeGreaterThan(0.38)
    expect(r1).toBeLessThan(0.4)
    expect(r3).toBeGreaterThan(1.0)
    expect(r3).toBeLessThan(1.1)
    expect(r5).toBeGreaterThan(1.6)
    expect(r5).toBeLessThan(1.8)
    expect(r31).toBeGreaterThan(10)
    expect(r31).toBeLessThan(13)
    // symmetric (odd function)
    expect(goodInterval(Math.sin, coefficients('sin', 3))[0]).toBeCloseTo(-r3, 2)
  })

  it('degree 100 is good up to about |x| ≈ 36 (Lagrange), but never on the whole line', () => {
    const r = lagrangeRadius(1, 100, 0.01)
    expect(r).toBeGreaterThan(35)
    expect(r).toBeLessThan(38)
    // any non-constant polynomial escapes: far enough, the degree-5 copy is huge
    expect(Math.abs(taylor('sin', 5, 50))).toBeGreaterThan(1e5)
  })

  it('adding x⁵ helps near 0 but far away the copy is still lost', () => {
    expect(taylorError('sin', 5, 0.5)).toBeLessThan(taylorError('sin', 3, 0.5))
    expect(taylorError('sin', 5, 6)).toBeGreaterThan(10)
  })
})

describe('Resolva', () => {
  it('degree-3 Taylor of eˣ gives e^0,5 ≈ 1,6458 against 1,6487', () => {
    const t3 = taylor('exp', 3, 0.5)
    expect(t3).toBeCloseTo(1.6458333, 6)
    expect(Math.exp(0.5)).toBeCloseTo(1.6487213, 6)
    const err = Math.exp(0.5) - t3
    expect(err).toBeCloseTo(0.00289, 4)
    // distractors used in the choices
    expect(evalPoly([1, 1, 1, 1], 0.5)).toBeCloseTo(1.875, 6)
    expect(taylor('exp', 2, 0.5)).toBeCloseTo(1.625, 6)
  })

  it('Lagrange guarantees the error is below 2·0,5⁴/4! ≈ 0,0052', () => {
    const bound = lagrangeBound(2, 3, 0.5)
    expect(bound).toBeCloseTo(0.0052083, 6)
    expect(Math.exp(0.5) - taylor('exp', 3, 0.5)).toBeLessThan(bound)
    expect(Math.exp(0.5)).toBeLessThan(2)
  })

  it('cos 0,2 ≈ 1 − 0,2²/2 = 0,98 (true 0,980067)', () => {
    expect(taylor('cos', 2, 0.2)).toBeCloseTo(0.98, 10)
    expect(Math.cos(0.2)).toBeCloseTo(0.980067, 6)
    expect(taylorError('cos', 2, 0.2)).toBeLessThan(lagrangeBound(1, 3, 0.2))
  })
})

describe('No mundo real', () => {
  it('pendulum: at 10° sin θ ≈ θ is off by ≈ 0,5 %', () => {
    const e = smallAngleError(deg(10))
    expect(e).toBeGreaterThan(0.005)
    expect(e).toBeLessThan(0.0052)
    expect(smallAngleError(deg(30))).toBeGreaterThan(0.04)
  })

  it('pendulum: the true period at 10° is only ≈ 0,19 % longer', () => {
    expect(pendulumPeriodRatio(deg(10))).toBeCloseTo(1.0019, 4)
    expect(pendulumPeriodRatio(deg(90))).toBeCloseTo(1.18034, 4) // classic value 2K(1/√2)/π
    expect(pendulumPeriodRatio(1e-6)).toBeCloseTo(1, 10)
  })

  it('e = Σ 1/n!: 10 terms already give 2,718281 (7 correct digits)', () => {
    const s = eSums(10)
    expect(s[9]).toBeCloseTo(2.7182815, 7)
    expect(correctDigits(s[9], Math.E)).toBe(7)
    expect(correctDigits(eSums(4)[3], Math.E)).toBe(1) // 2,666… vs 2,718…
    expect(Math.E - s[9]).toBeLessThan(1e-6)
  })

  it('a degree-13 polynomial is enough on |x| ≤ π/4 (after reducing the angle)', () => {
    expect(lagrangeBound(1, 14, Math.PI / 4)).toBeLessThan(1e-13)
    expect(taylorError('sin', 13, Math.PI / 4)).toBeLessThan(1e-13)
  })
})

describe('E se…? radius of convergence', () => {
  it('ln(1+x): more terms help inside |x| < 1 and make it worse outside', () => {
    expect(taylorError('ln1p', 20, 0.5)).toBeLessThan(taylorError('ln1p', 5, 0.5))
    expect(taylorError('ln1p', 20, 1.5)).toBeGreaterThan(taylorError('ln1p', 5, 1.5))
    expect(taylorError('ln1p', 25, 1.5)).toBeGreaterThan(100)
    expect(FN.ln1p(-1)).toBeNaN()
  })

  it('1/(1−x) = 1 + x + x² + … converges to 2 at x = 0,5', () => {
    expect(taylor('geom', 40, 0.5)).toBeCloseTo(2, 10)
    expect(taylorError('geom', 40, 1.2)).toBeGreaterThan(1000)
  })
})
