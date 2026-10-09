import { describe, expect, it } from 'vitest'
import {
  apply,
  applyAll,
  celsiusFromFahrenheit,
  difference,
  equation,
  fahrenheitFromCelsius,
  holdsAt,
  isSolved,
  itemsOf,
  opText,
  shuffled,
  side,
  solutionPath,
  solve,
  springStep,
  stepOptions,
  tiltTarget,
  toTex,
} from '@/lib/math/equations'
import { EQUACOES } from '@/lib/labs/equacoes'

const P1 = equation(side(3, 2), side(0, 14))
const P2 = equation(side(5, 1), side(2, 10))
const P3 = equation(side(1, -1, 4), side(2, 6))
const F = equation(side(1.8, 32), side(0, 98.6))

describe('balança e equação', () => {
  it('solves the lab problems', () => {
    expect(solve(equation(side(2, 3), side(0, 11)))).toEqual({ kind: 'one', x: 4 })
    expect(solve(P1)).toEqual({ kind: 'one', x: 4 })
    expect(solve(P2)).toEqual({ kind: 'one', x: 3 })
    expect(solve(P3)).toEqual({ kind: 'one', x: 5 })
    expect(solve(F)).toEqual({ kind: 'one', x: 37 })
    expect(solve(equation(side(2, 5), side(0, 29)))).toEqual({ kind: 'one', x: 12 })
  })

  it('knows equations with no solution and with infinitely many', () => {
    expect(solve(equation(side(1, 2), side(1, 5)))).toEqual({ kind: 'none' })
    expect(solve(equation(side(1, 1, 2), side(2, 2)))).toEqual({ kind: 'all' })
    for (const X of [0, 1, 2.5, 7]) {
      expect(holdsAt(equation(side(1, 1, 2), side(2, 2)), X)).toBe(true)
      expect(difference(equation(side(1, 2), side(1, 5)), X)).toBe(3)
    }
  })

  it('doing the same on both sides keeps the balance; one side tips it', () => {
    const e = equation(side(2, 3), side(0, 11))
    expect(holdsAt(apply(e, { kind: 'add', x: 0, c: -3, where: 'both' }), 4)).toBe(true)
    const tipped = apply(e, { kind: 'add', x: 0, c: -3, where: 'left' })
    expect(holdsAt(tipped, 4)).toBe(false)
    expect(difference(tipped, 4)).toBe(3) // right is 3 heavier
    expect(holdsAt(apply(equation(side(2, 0), side(0, 8)), { kind: 'div', k: 2, where: 'both' }), 4)).toBe(true)
  })

  it('every option has the verdict it claims', () => {
    for (const [e, X] of [
      [P1, 4],
      [P2, 3],
      [P3, 5],
      [F, 37],
    ] as const) {
      let cur = e
      for (let guard = 0; guard < 8 && !isSolved(cur); guard++) {
        const opts = stepOptions(cur)
        expect(opts.length).toBeGreaterThanOrEqual(2)
        expect(opts.length).toBeLessThanOrEqual(4)
        expect(opts[0].verdict).toBe('good')
        for (const o of opts) {
          const next = apply(cur, o.op)
          if (o.verdict === 'breaks' || o.verdict === 'wrongExpand') expect(holdsAt(next, X)).toBe(false)
          else expect(holdsAt(next, X)).toBe(true)
        }
        cur = apply(cur, opts[0].op)
      }
      expect(isSolved(cur)).toBe(true)
    }
  })

  it('finds the classic mistakes', () => {
    const v = stepOptions(P1).map((o) => o.verdict)
    expect(v).toEqual(['good', 'breaks', 'detour', 'messy'])
    const alone = stepOptions(equation(side(3, 0), side(0, 12)))
    expect(alone.map((o) => o.verdict)).toEqual(['good', 'coefNotLoose', 'breaks'])
    const paren = stepOptions(P3)
    expect(paren[1].verdict).toBe('wrongExpand')
    expect(paren[1].tex).toBe('4x - 1')
    expect(paren[0].tex).toBe('4x - 4')
    expect(stepOptions(P2).map((o) => o.verdict)).toEqual(['good', 'breaks', 'stuck', 'good'])
  })

  it('solution paths are short and end with x alone', () => {
    expect(solutionPath(P1).map((o) => opText(o))).toEqual(['−2', '÷3'])
    expect(solutionPath(P2).map((o) => opText(o))).toEqual(['−2x', '−1', '÷3'])
    expect(solutionPath(P3).map((o) => opText(o))).toEqual(['abrir parênteses', '−2x', '+4', '÷2'])
    expect(applyAll(P3, solutionPath(P3))).toEqual(equation(side(1, 0), side(0, 5)))
    expect(applyAll(F, solutionPath(F))).toEqual(equation(side(1, 0), side(0, 37)))
  })

  it('writes TeX with pt-BR decimals', () => {
    expect(toTex(P1)).toBe('3x + 2 = 14')
    expect(toTex(P3)).toBe('4(x - 1) = 2x + 6')
    expect(toTex(F, 'C')).toBe('1{,}8C + 32 = 98{,}6')
    expect(toTex(equation(side(1, 2), side(1, 5)), 'x', '\\neq')).toBe('x + 2 \\neq x + 5')
    expect(toTex(equation(side(0, 2), side(0, 5)))).toBe('2 = 5')
  })

  it('maps a side to boxes, weights and balloons', () => {
    expect(itemsOf(side(1, -1, 4))).toEqual({ boxes: 4, units: 0, balloons: 4 })
    expect(itemsOf(side(2, 6))).toEqual({ boxes: 2, units: 6, balloons: 0 })
  })

  it('stable shuffle keeps all items', () => {
    const a = shuffled([1, 2, 3, 4], '3x + 2 = 14')
    expect(a.slice().sort()).toEqual([1, 2, 3, 4])
    expect(shuffled([1, 2, 3, 4], '3x + 2 = 14')).toEqual(a)
  })
})

describe('física da balança', () => {
  it('tilt grows with the difference and saturates', () => {
    expect(tiltTarget(0)).toBe(0)
    expect(tiltTarget(1)).toBeGreaterThan(0)
    expect(tiltTarget(-1)).toBeCloseTo(-tiltTarget(1))
    expect(tiltTarget(2)).toBeGreaterThan(tiltTarget(1))
    expect(tiltTarget(100)).toBeLessThanOrEqual(0.28)
    expect(tiltTarget(0.3) / tiltTarget(0.1)).toBeCloseTo(3, 1)
  })

  it('the damped spring settles with a small overshoot', () => {
    let s = { a: 0, v: 0 }
    let peak = 0
    for (let i = 0; i < 180; i++) {
      s = springStep(s, 0.2, 1 / 60)
      peak = Math.max(peak, s.a)
    }
    expect(s.a).toBeCloseTo(0.2, 3)
    expect(peak).toBeGreaterThan(0.2)
    expect(peak).toBeLessThan(0.2 * 1.35)
    // Same result with a long frame (stable sub-steps).
    let t = { a: 0, v: 0 }
    for (let i = 0; i < 30; i++) t = springStep(t, 0.2, 0.1)
    expect(t.a).toBeCloseTo(0.2, 3)
  })
})

describe('mundo real', () => {
  it('Fahrenheit ↔ Celsius (definição exata)', () => {
    expect(celsiusFromFahrenheit(98.6)).toBe(37)
    expect(fahrenheitFromCelsius(100)).toBe(212)
    expect(fahrenheitFromCelsius(-40)).toBe(-40)
  })
})

describe('definição do laboratório', () => {
  it('has 7 steps in the right order', () => {
    expect(EQUACOES.status).toBe('disponivel')
    expect(EQUACOES.steps.map((s) => s.kind)).toEqual(['cenario', 'previsao', 'conceito', 'observacao', 'medicao', 'desafio', 'conclusao'])
    expect(EQUACOES.steps[4].label).toBe('Resolva')
    for (const s of EQUACOES.steps) expect(s.vega.length).toBeGreaterThan(80)
  })
})
