import { describe, expect, test } from 'vitest'
import { abcDe, celulasDe, conferirTexto, cruzamentoDe, equacaoTexto, lerEquacao, letrasDe, paresNaGrade, satisfaz, sistemaDe, substituirLado, trocaDe, type Equacao } from '@/components/aula/visual/sistema'

// Os sistemas de equações (AF.U4): ler a equação, pôr o par, conferir, onde
// as retas se cruzam, somar as equações e trocar uma letra pelo que ela vale.

const eq = (t: string) => lerEquacao(t) as Equacao

describe('lerEquacao', () => {
  test('lê os termos dos dois lados, com o menos de verdade ou o hífen', () => {
    expect(eq('x + y = 10')).toEqual({ esquerda: [{ coef: 1, letra: 'x' }, { coef: 1, letra: 'y' }], direita: [{ coef: 10 }], texto: 'x + y = 10' })
    expect(eq('2x − 3y = −4').esquerda).toEqual([{ coef: 2, letra: 'x' }, { coef: -3, letra: 'y' }])
    expect(eq('2x - 3y = -4').texto).toBe('2x − 3y = −4')
    expect(eq('y = 0,5x + 2').direita).toEqual([{ coef: 0.5, letra: 'x' }, { coef: 2 }])
    expect(eq('−x + y = 2').esquerda[0]).toEqual({ coef: -1, letra: 'x' })
  })

  test('o que não é uma equação do 1º grau com termos simples', () => {
    for (const t of ['x + y', 'x = y = 2', '2(x + 1) = 4', 'x² = 4', '= 3', 'x + = 3', 'x y = 3', 3]) expect(lerEquacao(t)).toBeNull()
  })

  test('a, b e c de a·x + b·y = c', () => {
    expect(abcDe(eq('x + y = 10'), ['x', 'y'])).toEqual([1, 1, 10])
    expect(abcDe(eq('y = x + 2'), ['x', 'y'])).toEqual([-1, 1, 2])
    expect(abcDe(eq('2x + 3 = y + 7'), ['x', 'y'])).toEqual([2, -1, 4])
    expect(letrasDe([eq('20i + 10m = 150'), eq('i + m = 10')])).toEqual(['i', 'm'])
  })
})

describe('as retas', () => {
  test('satisfaz e os pares da grade', () => {
    expect(satisfaz([1, 1, 10], [6, 4])).toBe(true)
    expect(satisfaz([1, 1, 10], [6, 5])).toBe(false)
    const e = { de: 0, ate: 10, passo: 1 }
    expect(paresNaGrade([1, 1, 10], e, e)).toHaveLength(11)
    // 2x + 3y = 26 on the grid: (1, 8), (4, 6), (7, 4), (10, 2).
    expect(paresNaGrade([2, 3, 26], e, e)).toEqual([[1, 8], [4, 6], [7, 4], [10, 2]])
    // x = 3: the whole column.
    expect(paresNaGrade([1, 0, 3], e, { de: 0, ate: 2, passo: 1 })).toEqual([[3, 0], [3, 1], [3, 2]])
  })

  test('onde se cruzam: um ponto, nunca ou em toda parte', () => {
    expect(cruzamentoDe([1, 1, 10], [1, -1, 4])).toEqual({ tipo: 'ponto', v: [7, 3] })
    expect(cruzamentoDe([1, 1, 10], [2, 3, 26])).toEqual({ tipo: 'ponto', v: [4, 6] })
    expect(cruzamentoDe([1, 1, 3], [1, 1, 5])).toEqual({ tipo: 'paralelas' })
    expect(cruzamentoDe([1, 1, 3], [2, 2, 6])).toEqual({ tipo: 'mesma' })
    expect(cruzamentoDe([0, 0, 3], [1, 1, 5])).toBeNull()
  })
})

describe('pôr o par na equação', () => {
  test('a conta, como no papel', () => {
    expect(substituirLado(eq('2x + 3y = 26').esquerda, { x: 6, y: 4 })).toBe('2 · 6 + 3 · 4')
    expect(substituirLado(eq('x − y = 4').esquerda, { x: 3, y: -2 })).toBe('3 − (−2)')
    expect(substituirLado(eq('x + y = 4').esquerda, { x: -2, y: 6 })).toBe('−2 + 6')
    expect(conferirTexto(eq('x + y = 10'), { x: 6, y: 4 })).toEqual({ texto: '6 + 4 = 10', ok: true })
    expect(conferirTexto(eq('x + y = 10'), { x: 3, y: 5 })).toEqual({ texto: '3 + 5 = 8 ≠ 10', ok: false })
    expect(conferirTexto(eq('2x + 3y = 26'), { x: 6, y: 4 })).toEqual({ texto: '2 · 6 + 3 · 4 = 24 ≠ 26', ok: false })
    expect(conferirTexto(eq('y = x + 2'), { x: 3, y: 5 })).toEqual({ texto: '5 = 3 + 2', ok: true })
    expect(conferirTexto(eq('x = 3'), { x: 4, y: 0 })).toEqual({ texto: '4 ≠ 3', ok: false })
    expect(conferirTexto(eq('0,5x + y = 3'), { x: 2, y: 2 })).toEqual({ texto: '0,5 · 2 + 2 = 3', ok: true })
  })

  test('escrever a equação', () => {
    expect(equacaoTexto([2, 0], 14, ['x', 'y'])).toBe('2x = 14')
    expect(equacaoTexto([1, -1], -4, ['x', 'y'])).toBe('x − y = −4')
    expect(equacaoTexto([0, -2], 6, ['x', 'y'])).toBe('−2y = 6')
    expect(equacaoTexto([0, 0], 2, ['x', 'y'])).toBe('0 = 2')
  })
})

describe('sistemaDe: somar as equações', () => {
  test('x + y = 10 e x − y = 4 somadas: o y some', () => {
    const s = sistemaDe({ equacoes: ['x + y = 10', 'x − y = 4'], somado: true })!
    expect(s.letras).toEqual(['x', 'y'])
    expect(s.soma).toEqual({ coef: [2, 0], c: 14 })
    expect(s.somem).toEqual([1])
    expect(celulasDe(s.linhas[1].coef, s.letras)).toEqual([{ sinal: '', termo: 'x' }, { sinal: '−', termo: 'y' }])
    expect(celulasDe(s.soma!.coef, s.letras)).toEqual([{ sinal: '', termo: '2x' }, { sinal: '', termo: '' }])
  })

  test('multiplicar antes: × (−1) faz o x sumir', () => {
    const antes = sistemaDe({ equacoes: ['x + 2y = 7', 'x + y = 5'], vezes: [1, -1] })!
    expect(antes.temVezes).toBe(true)
    expect(antes.multiplicado).toBe(false)
    expect(antes.linhas[1]).toEqual({ coef: [1, 1], c: 5, vezes: -1 })
    const depois = sistemaDe({ equacoes: ['x + 2y = 7', 'x + y = 5'], vezes: [1, -1], somado: true })!
    expect(depois.multiplicado).toBe(true)
    expect(depois.linhas[1]).toEqual({ coef: [-1, -1], c: -5, vezes: -1 })
    expect(depois.soma).toEqual({ coef: [0, 1], c: 2 })
    expect(depois.somem).toEqual([0])
    expect(celulasDe(depois.soma!.coef, depois.letras)).toEqual([{ sinal: '', termo: '' }, { sinal: '', termo: 'y' }])
  })

  test('nenhuma ou infinitas soluções: 0 = 2 e 0 = 0', () => {
    const nenhuma = sistemaDe({ equacoes: ['x + y = 5', 'x + y = 3'], vezes: [1, -1], somado: true })!
    expect(nenhuma.soma).toEqual({ coef: [0, 0], c: 2 })
    expect(nenhuma.somem).toEqual([0, 1])
    expect(celulasDe(nenhuma.soma!.coef, nenhuma.letras)[0]).toEqual({ sinal: '', termo: '0' })
    const infinitas = sistemaDe({ equacoes: ['2x + 2y = 6', 'x + y = 3'], vezes: [1, -2], somado: true })!
    expect(infinitas.soma).toEqual({ coef: [0, 0], c: 0 })
  })

  test('somar sem que uma letra suma', () => {
    const s = sistemaDe({ equacoes: ['x + y = 10', 'x + 2y = 14'], somado: true })!
    expect(s.soma).toEqual({ coef: [2, 3], c: 24 })
    expect(s.somem).toEqual([])
  })

  test('o que não é um sistema para somar', () => {
    expect(sistemaDe({ equacoes: ['x + y = 10'] })).toBeNull()
    expect(sistemaDe({ equacoes: ['x + y = 10', 'x + y + z = 4'] })).toBeNull()
    expect(sistemaDe({ equacoes: ['x + y = 10', 'x − y'] })).toBeNull()
    expect(sistemaDe({ equacoes: ['y = x + 2', 'x + y = 10'], trocar: 'y' })).toBeNull()
  })
})

describe('trocaDe: a substituição', () => {
  test('a caixa (x + 2) no lugar do y, com os parênteses', () => {
    const t = trocaDe({ equacoes: ['y = x + 2', 'x + y = 10'], trocar: 'y' })!
    expect(t.valor).toBe('x + 2')
    expect(t.segunda).toEqual([{ t: 'x + ' }, { t: 'y', letra: true }, { t: ' = 10' }])
    expect(t.trocada).toBe('x + (x + 2) = 10')
    expect(t.trocado).toBe(false)
    expect(trocaDe({ equacoes: ['y = x - 3', '2x + 3y = 21'], trocar: 'y', trocado: true })).toMatchObject({ trocada: '2x + 3(x − 3) = 21', trocado: true })
    expect(trocaDe({ equacoes: ['x = 2y', 'x + y = 9'], trocar: 'x' })!.trocada).toBe('(2y) + y = 9')
  })

  test('a primeira tem de dizer quanto vale a letra, e a segunda tem de ter a letra', () => {
    expect(trocaDe({ equacoes: ['2y = x', 'x + y = 10'], trocar: 'y' })).toBeNull()
    expect(trocaDe({ equacoes: ['y = y + 2', 'x + y = 10'], trocar: 'y' })).toBeNull()
    expect(trocaDe({ equacoes: ['y = x + 2', 'x = 10'], trocar: 'y' })).toBeNull()
    expect(trocaDe({ equacoes: ['y = x + 2', 'x + y = 10'] })).toBeNull()
  })
})
