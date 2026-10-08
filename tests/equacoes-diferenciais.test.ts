import { describe, expect, it } from 'vitest'
import {
  ageFromFraction,
  coolingRhs,
  coolingTimeTo,
  decayRhs,
  equilibria,
  euler,
  eulerStep,
  exponentialDecay,
  interpolate,
  lambdaFromHalfLife,
  logistic,
  logisticRhs,
  maxError,
  meanAbsDeviation,
  newtonCooling,
  rk4,
  slopeField,
} from '@/lib/math/ode'
import { EQUACOES_DIFERENCIAIS } from '@/lib/labs/equacoes-diferenciais'
import { eulerMaxError, HAND, SEPARATION, EULER_STEPS, sketchCoverage, sketchError, SKETCH_N, T10, T_TO_40 } from '@/components/labs/equacoes-diferenciais/shared'

const k = 0.05
const f = coolingRhs(k, 20)
const T = newtonCooling(90, 20, k)

describe('resfriamento de Newton (café a 90 °C, sala a 20 °C)', () => {
  it('a solução exata começa em 90 °C e obedece à equação', () => {
    expect(T(0)).toBe(90)
    for (const t of [0, 7, 23, 51]) {
      const d = (T(t + 1e-5) - T(t - 1e-5)) / 2e-5
      expect(d).toBeCloseTo(f(t, T(t)), 6)
    }
  })
  it('T(10) ≈ 62,5 °C', () => {
    expect(T(10)).toBeCloseTo(62.457, 2)
    expect(T10).toBeCloseTo(62.457, 2)
  })
  it('esfria mais rápido no começo: −3,5 °C/min contra ≈ −0,47 aos 40 min', () => {
    expect(f(0, 90)).toBeCloseTo(-3.5, 10)
    expect(f(40, T(40))).toBeCloseTo(-0.4737, 3)
  })
  it('nunca chega a 20 °C em tempo finito', () => {
    expect(T(120) - 20).toBeCloseTo(0.1735, 3)
    expect(T(200)).toBeGreaterThan(20)
    expect(coolingTimeTo(90, 20, k, 20)).toBe(Infinity)
  })
  it('chega a 40 °C em ≈ 25,1 min', () => {
    expect(T_TO_40).toBeCloseTo(20 * Math.log(3.5), 6)
    expect(T(T_TO_40)).toBeCloseTo(40, 8)
  })
})

describe('método de Euler', () => {
  it('à mão com h = 5: 90 → 72,5 → 59,375', () => {
    expect(eulerStep(f, 0, 90, 5)).toBeCloseTo(72.5, 10)
    expect(HAND).toHaveLength(3)
    expect(HAND[1]).toBeCloseTo(72.5, 10)
    expect(HAND[2]).toBeCloseTo(59.375, 10)
    expect(T10 - HAND[2]).toBeCloseTo(3.08, 2)
  })
  it('o erro diminui com o passo (≈ proporcional a h)', () => {
    const e1 = eulerMaxError(1)
    const e5 = eulerMaxError(5)
    const e10 = eulerMaxError(10)
    expect(e1).toBeLessThan(e5)
    expect(e5).toBeLessThan(e10)
    expect(e5 / e1).toBeGreaterThan(4)
    expect(e5 / e1).toBeLessThan(6.5)
  })
  it('h = 20 despenca direto para 20 °C; h = 40 oscila até −50 °C', () => {
    expect(euler(f, 0, 90, 20, 60)[1].y).toBeCloseTo(20, 10)
    expect(euler(f, 0, 90, 40, 40)[1].y).toBeCloseTo(-50, 10)
  })
  it('Euler fica abaixo da curva (tangentes de uma curva convexa)', () => {
    for (const p of euler(f, 0, 90, 5, 60).slice(1)) expect(p.y).toBeLessThan(T(p.t))
  })
  it('RK4 é muito mais preciso que Euler com o mesmo passo', () => {
    expect(maxError(rk4(f, 0, 90, 5, 60), T)).toBeLessThan(0.01)
    expect(maxError(euler(f, 0, 90, 5, 60), T)).toBeGreaterThan(3)
  })
  it('interpolação da poligonal', () => {
    const pts = euler(f, 0, 90, 5, 10)
    expect(interpolate(pts, 2.5)).toBeCloseTo(81.25, 10)
    expect(interpolate(pts, -1)).toBe(90)
  })
})

describe('campo de direções', () => {
  it('inclinação de cada tracinho = f(t, T)', () => {
    const field = slopeField(f, { x0: 0, x1: 60, y0: 0, y1: 100 }, 6, 5)
    expect(field).toHaveLength(30)
    for (const s of field) expect(s.slope).toBeCloseTo(-k * (s.y - 20), 12)
    // abaixo da sala o café gelado esquenta; acima, esfria
    expect(field.some((s) => s.slope > 0)).toBe(true)
    expect(field.some((s) => s.slope < 0)).toBe(true)
  })
})

describe('carbono-14 (meia-vida 5.730 anos)', () => {
  const lambda = lambdaFromHalfLife(5730)
  const N = exponentialDecay(100, lambda)
  it('λ ≈ 1,21 × 10⁻⁴ por ano', () => {
    expect(lambda).toBeCloseTo(1.2097e-4, 7)
  })
  it('cai à metade a cada meia-vida, qualquer que seja a quantidade inicial', () => {
    expect(N(5730)).toBeCloseTo(50, 8)
    expect(N(11460)).toBeCloseTo(25, 8)
    expect(exponentialDecay(37, lambda)(5730)).toBeCloseTo(18.5, 8)
  })
  it('25 % do original: 2 meias-vidas ≈ 11.460 anos', () => {
    expect(ageFromFraction(0.25, 5730)).toBeCloseTo(11460, 6)
    expect(ageFromFraction(0, 5730)).toBeNaN()
  })
  it('RK4 reproduz a solução exata', () => {
    const pts = rk4(decayRhs(lambda), 0, 100, 500, 20000)
    expect(maxError(pts, N)).toBeLessThan(1e-4)
  })
})

describe('crescimento logístico (K = 1.000, r = 0,5/mês)', () => {
  const g = logisticRhs(0.5, 1000)
  it('populações abaixo e acima de K vão para K', () => {
    for (const P0 of [50, 400, 1400]) expect(logistic(P0, 0.5, 1000)(40)).toBeCloseTo(1000, 3)
    expect(logistic(0, 0.5, 1000)(40)).toBe(0)
  })
  it('a solução exata bate com RK4', () => {
    expect(maxError(rk4(g, 0, 50, 0.1, 24), logistic(50, 0.5, 1000))).toBeLessThan(1e-4)
  })
  it('equilíbrios: 0 instável e K estável', () => {
    const eq = equilibria((P) => g(0, P), -100, 1500)
    expect(eq).toHaveLength(2)
    expect(eq[0].y).toBeCloseTo(0, 6)
    expect(eq[0].stable).toBe(false)
    expect(eq[1].y).toBeCloseTo(1000, 6)
    expect(eq[1].stable).toBe(true)
  })
  it('o resfriamento tem um único equilíbrio estável em 20 °C', () => {
    const eq = equilibria((y) => f(0, y), -50, 120)
    expect(eq).toHaveLength(1)
    expect(eq[0].y).toBeCloseTo(20, 6)
    expect(eq[0].stable).toBe(true)
  })
})

describe('desenho do aluno', () => {
  it('cobertura e distância média até a curva real', () => {
    const exact = Array.from({ length: SKETCH_N }, (_, t) => T(t))
    expect(sketchCoverage(exact)).toBe(1)
    expect(sketchError(exact)).toBeCloseTo(0, 10)
    const line = Array.from({ length: SKETCH_N }, (_, t) => (t <= 30 ? 90 - (70 * t) / 60 : null))
    expect(sketchCoverage(line)).toBeCloseTo(31 / 61, 10)
    expect(sketchError(line)).toBeGreaterThan(5)
    expect(meanAbsDeviation([], T)).toBeNaN()
  })
})

describe('roteiro do Resolva', () => {
  it('cada passo tem exatamente uma opção certa, e todo erro tem explicação', () => {
    for (const s of [...SEPARATION, ...EULER_STEPS]) {
      expect(s.options.filter((o) => o.ok)).toHaveLength(1)
      expect(s.options.length).toBeGreaterThanOrEqual(2)
      expect(s.options.length).toBeLessThanOrEqual(4)
      for (const o of s.options) expect(o.why.length).toBeGreaterThan(10)
      expect(s.prompt.length).toBeLessThanOrEqual(140)
    }
  })
  it('as curvas dos erros comuns erram mesmo', () => {
    const curves = SEPARATION.flatMap((s) => s.options).flatMap((o) => (o.wrong?.kind === 'curve' ? [o.wrong.f] : []))
    expect(curves.length).toBeGreaterThanOrEqual(5)
    for (const c of curves) expect(Math.abs(c(0) - 90) > 1 || Math.abs(c(30) - T(30)) > 5).toBe(true)
  })
})

describe('definição do laboratório', () => {
  it('7 etapas na ordem canônica, disponível', () => {
    const lab = EQUACOES_DIFERENCIAIS
    expect(lab.status).toBe('disponivel')
    expect(lab.steps.map((s) => s.kind)).toEqual(['cenario', 'previsao', 'conceito', 'observacao', 'medicao', 'desafio', 'conclusao'])
    expect(lab.steps.find((s) => s.kind === 'medicao')?.label).toBe('Resolva')
    expect(lab.steps.find((s) => s.kind === 'observacao')?.label).toBe('No mundo real')
    for (const s of lab.steps) {
      expect(s.vega.length).toBeGreaterThan(80)
      expect(s.ask?.length ?? 0).toBeGreaterThanOrEqual(2)
    }
    expect(lab.achievement?.title).toBeTruthy()
    expect(lab.skyTarget).toBeUndefined()
  })
})
