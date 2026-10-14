import { describe, expect, test } from 'vitest'
import { chaveRevelar, comprimento, ehNegativo, escreveMonomio, escreveSoma, grau, lerMonomio, letraPadrao, letrasDe, produto, revelaveis, somaTermos } from '@/components/aula/visual/monomio'
import { montesDe, pecasViradas, quantosMontes } from '@/components/aula/visual/azulejos-pecas'
import { expressaoDe } from '@/components/aula/visual/azulejos-pecas'

// Os monômios do retângulo por área (AF.U1): ler, multiplicar e somar.

describe('ler um monômio', () => {
  test('coeficiente, letras e expoentes', () => {
    expect(lerMonomio('3x')).toEqual({ k: 3, letras: { x: 1 } })
    expect(lerMonomio('x²')).toEqual({ k: 1, letras: { x: 2 } })
    expect(lerMonomio('−3x')).toEqual({ k: -3, letras: { x: 1 } })
    expect(lerMonomio('-x')).toEqual({ k: -1, letras: { x: 1 } })
    expect(lerMonomio('2x^2')).toEqual({ k: 2, letras: { x: 2 } })
    expect(lerMonomio('yx')).toEqual({ k: 1, letras: { x: 1, y: 1 } })
    expect(lerMonomio('1,5a')).toEqual({ k: 1.5, letras: { a: 1 } })
    expect(lerMonomio(-2)).toEqual({ k: -2, letras: {} })
    expect(lerMonomio('−2')).toEqual({ k: -2, letras: {} })
    expect(lerMonomio('?')).toBeNull()
    expect(lerMonomio('2x + 6')).toBeNull()
    expect(grau(lerMonomio('3x²y')!)).toBe(3)
  })

  test('escrever com o sinal de menos de verdade', () => {
    expect(escreveMonomio({ k: -1, letras: { x: 1 } })).toBe('−x')
    expect(escreveMonomio({ k: 1, letras: { y: 1, x: 2 } })).toBe('x²y')
    expect(escreveMonomio({ k: -6, letras: {} })).toBe('−6')
    expect(escreveMonomio({ k: 0, letras: { x: 1 } })).toBe('0')
    expect(escreveMonomio({ k: 0.5, letras: { x: 1 } })).toBe('0,5x')
  })
})

describe('multiplicar monômios', () => {
  test.each([
    [3, 4, 12],
    [3, 'x', '3x'],
    ['x', 'x', 'x²'],
    ['2x', 3, '6x'],
    ['x²', '3x', '3x³'],
    ['3x', '4x²', '12x³'],
    ['2x', -3, '−6x'],
    ['2x', '−3', '−6x'],
    ['x', 'y', 'xy'],
    ['y', 'x', 'xy'],
    ['−x', -2, '2x'],
    ['-x', '−x', 'x²'],
    ['2x', 'x²', '2x³'],
    ['2a', 'a', '2a²'],
    ['xy', 'x', 'x²y'],
    [-2, 3, -6],
    ['−2', '3', '−6'],
    [4, 0.5, 2],
    ['x', '?', '?'],
  ] as const)('%s · %s = %s', (a, b, r) => {
    expect(produto(a, b)).toBe(r)
  })

  test('o sinal da área', () => {
    expect(ehNegativo('−6x')).toBe(true)
    expect(ehNegativo('-2')).toBe(true)
    expect(ehNegativo(-3)).toBe(true)
    expect(ehNegativo('x²')).toBe(false)
    expect(ehNegativo('?')).toBe(false)
  })
})

describe('somar as áreas', () => {
  test('a soma escrita, com os sinais', () => {
    expect(escreveSoma(['x²', '3x', '−2x', -6])).toBe('x² + 3x − 2x − 6')
    expect(escreveSoma(['2x³', '-6x²', '2x'])).toBe('2x³ − 6x² + 2x')
  })

  test.each([
    [['x²', '3x', '2x', 6], 'x² + 5x + 6'],
    [['x²', '3x', '−2x', -6], 'x² + x − 6'],
    [['2x²', '−6x', 'x', -3], '2x² − 5x − 3'],
    [['x²', '2x', 'xy', '2y'], 'x² + xy + 2x + 2y'],
    [['3x²', '12x'], '3x² + 12x'],
    [['x²', '−2x', '2x', -4], 'x² − 4'],
    [[6, '3x', 'x²'], 'x² + 3x + 6'],
    [['x', '−x'], '0'],
  ] as const)('%j = %s', (ts, r) => {
    expect(somaTermos([...ts])).toBe(r)
  })
})

describe('o desenho do retângulo', () => {
  test('comprimentos: números pelo valor absoluto, x² mais comprido que x, kx limitado', () => {
    const letra = letraPadrao(['x', 3, 'x', 2])
    expect(letra).toBeCloseTo(4.8)
    expect(comprimento(-2, letra)).toBe(2)
    expect(comprimento('−3', letra)).toBe(3)
    expect(comprimento('x', letra, ['x'])).toBeCloseTo(4.8)
    expect(comprimento('x²', letra, ['x'])).toBeGreaterThan(comprimento('x', letra, ['x']))
    expect(comprimento('2x', letra, ['x'])).toBeCloseTo(9.6)
    expect(comprimento('10x', letra, ['x'])).toBeLessThanOrEqual(3.5 * letra)
    expect(comprimento('y', letra, ['x', 'y'])).toBeLessThan(comprimento('x', letra, ['x', 'y']))
    expect(letrasDe(['y', 2, 'x'])).toEqual(['x', 'y'])
    // The old default is kept: a lone letter is 4.
    expect(letraPadrao(['x', 'x'])).toBe(4)
  })

  test('o que o Mexa "revelar" descobre', () => {
    expect(revelaveis({ base: ['x', 3], altura: ['x', 2] })).toEqual(['0-0', '0-1', '1-0', '1-1'])
    expect(revelaveis({ base: ['2x', 3], altura: ['3x'], oculto: 'base' })).toEqual(['b0', 'b1'])
    expect(revelaveis({ base: ['x'], altura: ['x', 1], oculto: 'altura' })).toEqual(['h0', 'h1'])
    expect(chaveRevelar({ oculto: 'base' }, 0, 1)).toBe('b1')
    expect(chaveRevelar({}, 1, 0)).toBe('1-0')
  })
})

describe('virar um monte de azulejos', () => {
  test('montes iguais ou com tamanhos', () => {
    expect(montesDe(6, 2)).toEqual([0, 0, 0, 1, 1, 1])
    expect(montesDe(5, [2, 3])).toEqual([0, 0, 1, 1, 1])
    expect(montesDe(4)).toEqual([0, 0, 0, 0])
    expect(quantosMontes(5, [2, 3])).toBe(2)
  })

  test('o menos antes do parêntese troca o sinal de todas as peças do monte', () => {
    const pecas = ['x²', 'x', 'x', 'x²', '−x', '−x', '−x', '1']
    const virado = pecasViradas(pecas, [3, 5], 1, true)
    expect(virado).toEqual(['x²', 'x', 'x', '−x²', 'x', 'x', 'x', '−1'])
    expect(pecasViradas(pecas, [3, 5], 1, false)).toEqual(['x²', 'x', 'x', 'x²', '−x', '−x', '−x', '1'])
    // (x² + 2x) − (x² − 3x + 1) = 5x − 1
    expect(expressaoDe(virado)).toBe('5x − 1')
  })
})

describe('o retângulo que cancela (AF.U2)', () => {
  test('pedaços da soma, com o sinal na frente', async () => {
    const { pedacosSoma } = await import('@/components/aula/visual/monomio')
    expect(pedacosSoma(['x²', '3x', '-3x', -9])).toEqual(['x²', ' + 3x', ' − 3x', ' − 9'])
    expect(pedacosSoma(['x²', '3x', '-3x', -9]).join('')).toBe(escreveSoma(['x²', '3x', '-3x', -9]))
    expect(escreveSoma([])).toBe('0')
  })

  test('as áreas opostas se cancelam aos pares', async () => {
    const { termosCancelados } = await import('@/components/aula/visual/monomio')
    expect(termosCancelados(['x²', '3x', '−3x', -9])).toEqual([false, true, true, false])
    expect(termosCancelados(['x²', '3x', '3x', 9])).toEqual([false, false, false, false])
    expect(termosCancelados(['3x', '−3x', '3x'])).toEqual([true, true, false])
    expect(termosCancelados([6, -6, undefined, '?'])).toEqual([true, true, false, false])
    expect(termosCancelados(['2x', '−2y'])).toEqual([false, false])
    expect(somaTermos(['x²', '3x', '−3x', -9])).toBe('x² − 9')
  })

  test('destaque: uma parte ou uma lista', async () => {
    const { celulasDestaque } = await import('@/components/aula/visual/monomio')
    expect(celulasDestaque([0, 1])).toEqual([[0, 1]])
    expect(celulasDestaque([[0, 1], [1, 0]])).toEqual([[0, 1], [1, 0]])
    expect(celulasDestaque('linha')).toEqual([])
    expect(celulasDestaque(undefined)).toEqual([])
  })
})
