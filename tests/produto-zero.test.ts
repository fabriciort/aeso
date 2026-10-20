import { describe, expect, test } from 'vitest'
import { contaTexto, fatorTexto, numTexto, produtoEm, produtoTexto, produtoZeroDe, raizesDe, substituicao, valoresTexto } from '@/components/aula/visual/produto-zero'

// O produto que zera (AF.U3): (x − 2)(x + 3) só dá zero quando um fator dá zero.

describe('produtoZeroDe', () => {
  test('lê os fatores, os valores, o x e os marcados', () => {
    expect(produtoZeroDe({ fatores: [-2, 3], valores: [-4, -3, 0, 1, 2, 3] })).toEqual({ fatores: [-2, 3], valores: [-4, -3, 0, 1, 2, 3], x: undefined, marcados: [], letra: 'x' })
    // The x of the worked line counts as tried; a mark with no button is dropped.
    expect(produtoZeroDe({ fatores: [-2, 3], valores: [-3, 0, 2], x: 2, marcados: [0, 9] })).toMatchObject({ x: 2, marcados: [0, 2] })
    expect(produtoZeroDe({ fatores: [], valores: [1] })).toBeNull()
    expect(produtoZeroDe({ fatores: [1], valores: [] })).toBeNull()
    expect(produtoZeroDe(undefined)).toBeNull()
  })
})

describe('as contas', () => {
  test('os fatores e o produto, com o menos de verdade', () => {
    expect(fatorTexto(-2)).toBe('x − 2')
    expect(fatorTexto(3)).toBe('x + 3')
    expect(fatorTexto(0)).toBe('x')
    expect(fatorTexto(0.5)).toBe('x + 0,5')
    expect(produtoTexto([-2, 3])).toBe('(x − 2)(x + 3)')
    expect(produtoTexto([0, -4])).toBe('x(x − 4)')
    expect(numTexto(-3)).toBe('−3')
  })

  test('a conta de cada x, refeita à mão', () => {
    expect(contaTexto(2, [-2, 3])).toBe('(2 − 2) · (2 + 3) = 0 · 5 = 0')
    expect(contaTexto(-3, [-2, 3])).toBe('(−3 − 2) · (−3 + 3) = (−5) · 0 = 0')
    expect(contaTexto(1, [-2, 3])).toBe('(1 − 2) · (1 + 3) = (−1) · 4 = −4')
    expect(contaTexto(-4, [-2, 3])).toBe('(−4 − 2) · (−4 + 3) = (−6) · (−1) = 6')
    expect(contaTexto(4, [0, -4])).toBe('4 · (4 − 4) = 4 · 0 = 0')
    expect(contaTexto(-1, [0, -4])).toBe('(−1) · (−1 − 4) = (−1) · (−5) = 5')
    expect(substituicao(2, [-2, 3]).filter((t) => t.zero).map((t) => t.t)).toEqual(['(2 − 2)'])
    expect(valoresTexto(-3, [-2, 3]).filter((t) => t.zero).map((t) => t.t)).toEqual(['0'])
  })

  test('o produto só zera nas raízes', () => {
    const fatores = [-2, 3]
    expect(raizesDe(fatores)).toEqual([2, -3])
    for (let x = -6; x <= 6; x++) expect(produtoEm(x, fatores) === 0).toBe(x === 2 || x === -3)
    expect(produtoEm(1, fatores)).toBe((1 - 2) * (1 + 3))
    expect(raizesDe([-3, -3])).toEqual([3])
    expect(raizesDe([0, 4])).toEqual([0, -4])
  })
})
