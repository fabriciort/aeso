import { describe, expect, test } from 'vitest'
import { alturaDoArco, arcoEspelho, comparacaoEspelho, dentro, espelhar, faixaDe, intersecao, lerCondicao, pedacoDe, pedacosDe, raizes, raizesDasRegioes, regioesDe, serve, solucaoDe, testar, testarFeito, testesDaSolucao, textoDe, textoEspelho, tracosDaReta, type Pedaco } from '@/components/aula/visual/reta-intervalos'

const INF = Infinity
const cond = (t: string) => {
  const c = lerCondicao(t)
  if (!c) throw new Error(`não leu: ${t}`)
  return c
}
const sol = (t: string) => solucaoDe(cond(t))

describe('ler uma condição', () => {
  test('lê as formas da unidade', () => {
    for (const t of ['x > 3', 'x ≥ −1', 'x <= 4', '2 < x ≤ 5', '2x + 3 < 11', '−2x < 6', '(x − 2)(x − 5) < 0', 'x² < 9', 'x^2 - 9 > 0', 'x < −3 ou x > 3', 'x ≥ −1 e x < 3', '−1 ≤ 2x + 1 < 7', '40 + 0,5x ≤ 100', '(7 + 8 + x) / 3 ≥ 6', 'a > 2', 'x(x − 4) < 0']) expect(lerCondicao(t), t).not.toBeNull()
  })

  test('não lê o que não é uma comparação com uma letra', () => {
    for (const t of ['', 'x + 3', 'x + y > 2', 'x > ', '> 3', 'abc > 1', 3, undefined]) expect(lerCondicao(t), String(t)).toBeNull()
  })

  test('quem serve', () => {
    const c = cond('x > 3')
    expect([2, 3, 3.5, 4].map((v) => serve(c, v))).toEqual([false, false, true, true])
    expect([2, 3, 4].map((v) => serve(cond('x ≥ 3'), v))).toEqual([false, true, true])
    expect([2, 3, 5, 6].map((v) => serve(cond('2 < x ≤ 5'), v))).toEqual([false, true, true, false])
    expect([1, 2, 3, 5].map((v) => serve(cond('(x − 2)(x − 5) < 0'), v))).toEqual([false, false, true, false])
    expect([-4, -3, 0, 3, 4].map((v) => serve(cond('x < −3 ou x > 3'), v))).toEqual([true, false, false, false, true])
    expect([-1, 2, 3].map((v) => serve(cond('−1 ≤ 2x + 1 < 7'), v))).toEqual([true, true, false])
    expect([120, 121].map((v) => serve(cond('40 + 0,5x ≤ 100'), v))).toEqual([true, false])
  })
})

describe('pôr um número na condição', () => {
  test('o próprio 3 em x > 3: empate, não serve', () => {
    const t = testar(cond('x > 3'), 3)
    expect(t).toMatchObject({ serve: false, conta: '', comparacao: '3 > 3', empate: '3 é igual a 3: não é maior.' })
    expect(testar(cond('x > 3'), 5)).toMatchObject({ serve: true, comparacao: '5 > 3' })
    expect(testar(cond('x > 3'), 5).empate).toBeUndefined()
    expect(testar(cond('x ≥ 3'), 3)).toMatchObject({ serve: true, comparacao: '3 ≥ 3' })
  })

  test('a conta de um lado: 2x + 3 < 11', () => {
    expect(testar(cond('2x + 3 < 11'), 5)).toMatchObject({ serve: false, conta: '2 · 5 + 3 = 13', comparacao: '13 < 11', motivo: '13 não é menor que 11.' })
    expect(testar(cond('2x + 3 < 11'), -1)).toMatchObject({ serve: true, conta: '2 · (−1) + 3 = 1', comparacao: '1 < 11' })
    expect(testar(cond('−2x < 6'), -4)).toMatchObject({ serve: false, conta: '−2 · (−4) = 8', comparacao: '8 < 6' })
  })

  test('o produto: o sinal de cada fator', () => {
    expect(testar(cond('(x − 2)(x − 5) < 0'), 3)).toMatchObject({ serve: true, conta: '(3 − 2)(3 − 5) = 1 · (−2) = −2', comparacao: '−2 < 0' })
    expect(testar(cond('(x − 2)(x − 5) < 0'), 0)).toMatchObject({ serve: false, conta: '(0 − 2)(0 − 5) = −2 · (−5) = 10', comparacao: '10 < 0' })
    expect(testar(cond('(x − 2)(x − 5) < 0'), 2)).toMatchObject({ serve: false, conta: '(2 − 2)(2 − 5) = 0 · (−3) = 0', comparacao: '0 < 0', empate: '0 é igual a 0: não é menor.' })
    expect(testar(cond('x² < 9'), -4)).toMatchObject({ serve: false, conta: '(−4)² = 16', comparacao: '16 < 9' })
    expect(testar(cond('x(x − 4) < 0'), 1)).toMatchObject({ serve: true, conta: '1(1 − 4) = 1 · (−3) = −3' })
  })

  test('duas condições e a união', () => {
    expect(testar(cond('−1 ≤ 2x + 1 < 7'), 3)).toMatchObject({ serve: false, conta: '2 · 3 + 1 = 7', comparacao: '−1 ≤ 7 < 7', empate: '7 é igual a 7: não é menor.' })
    expect(testar(cond('x ≥ −1 e x < 3'), 0)).toMatchObject({ serve: true, comparacao: '0 ≥ −1 e 0 < 3' })
    expect(testar(cond('x < −3 ou x > 3'), 0)).toMatchObject({ serve: false, comparacao: '0 < −3 ou 0 > 3' })
    expect(testar(cond('40 + 0,5x ≤ 100'), 130)).toMatchObject({ serve: false, conta: '40 + 0,5 · 130 = 105', comparacao: '105 ≤ 100' })
  })
})

describe('o pedaço que serve', () => {
  test('1º grau', () => {
    expect(sol('x > 3')).toEqual([{ a: 3, b: INF, ia: false, ib: false }])
    expect(sol('x ≥ 3')).toEqual([{ a: 3, b: INF, ia: true, ib: false }])
    expect(sol('x ≤ −1')).toEqual([{ a: -INF, b: -1, ia: false, ib: true }])
    expect(sol('2 < x ≤ 5')).toEqual([{ a: 2, b: 5, ia: false, ib: true }])
    expect(sol('2x + 3 < 11')).toEqual([{ a: -INF, b: 4, ia: false, ib: false }])
    expect(sol('−2x < 6')).toEqual([{ a: -3, b: INF, ia: false, ib: false }])
    expect(sol('−1 ≤ 2x + 1 < 7')).toEqual([{ a: -1, b: 3, ia: true, ib: false }])
    expect(sol('40 + 0,5x ≤ 100')).toEqual([{ a: -INF, b: 120, ia: false, ib: true }])
  })

  test('2º grau: entre as raízes ou fora delas', () => {
    expect(sol('(x − 2)(x − 5) < 0')).toEqual([{ a: 2, b: 5, ia: false, ib: false }])
    expect(sol('(x − 2)(x − 5) ≥ 0')).toEqual([
      { a: -INF, b: 2, ia: false, ib: true },
      { a: 5, b: INF, ia: true, ib: false },
    ])
    expect(sol('x² < 9')).toEqual([{ a: -3, b: 3, ia: false, ib: false }])
    expect(sol('x² > 9')).toEqual(sol('x < −3 ou x > 3'))
    expect(sol('x² + 1 < 0')).toEqual([])
    expect(sol('x² + 1 > 0')).toEqual([{ a: -INF, b: INF, ia: false, ib: false }])
    expect(sol('(x − 1)² ≤ 0')).toEqual([{ a: 1, b: 1, ia: true, ib: true }])
    expect(raizes([0, -1, 0, 1])).toEqual([-1, 0, 1])
  })

  test('pedaços escritos pelo conteúdo', () => {
    expect(pedacoDe({ de: 3 })).toEqual({ a: 3, b: INF, ia: false, ib: false })
    expect(pedacoDe({ de: 3, ate: null, inclui: true })).toEqual({ a: 3, b: INF, ia: true, ib: false })
    expect(pedacoDe({ de: 2, ate: 5, inclui: [false, true] })).toEqual({ a: 2, b: 5, ia: false, ib: true })
    expect(pedacoDe({ de: 5, ate: 2 })).toBeNull()
    expect(pedacosDe('x < −3 ou x > 3')).toHaveLength(2)
    expect(pedacosDe({ condicao: 'x ≥ −1', cor: 'azul' })).toEqual([{ a: -1, b: INF, ia: true, ib: false }])
    expect(pedacosDe('não é condição')).toEqual([])
  })

  test('a sobreposição', () => {
    const A = sol('x ≥ −1')
    const B = sol('x < 3')
    expect(intersecao(A, B)).toEqual([{ a: -1, b: 3, ia: true, ib: false }])
    expect(intersecao(sol('x < 1'), sol('x > 4'))).toEqual([])
    expect(intersecao(sol('x ≤ 2'), sol('x ≥ 2'))).toEqual([{ a: 2, b: 2, ia: true, ib: true }])
    expect(intersecao(sol('x < 2'), sol('x ≥ 2'))).toEqual([])
    expect(intersecao(sol('x < −3 ou x > 3'), sol('x < 5'))).toEqual([
      { a: -INF, b: -3, ia: false, ib: false },
      { a: 3, b: 5, ia: false, ib: false },
    ])
  })

  test('o texto dos pedaços', () => {
    expect(textoDe(sol('x > 3'))).toBe('x > 3')
    expect(textoDe(sol('−1 ≤ 2x + 1 < 7'))).toBe('−1 ≤ x < 3')
    expect(textoDe(sol('x² > 9'))).toBe('x < −3 ou x > 3')
    expect(textoDe([])).toBe('nenhum número')
    expect(dentro(sol('x ≥ 3'), 3)).toBe(true)
    expect(dentro(sol('x > 3'), 3)).toBe(false)
  })
})

describe('o espelho de multiplicar por −1', () => {
  test('x < 3 vira −x > −3; 2 < x ≤ 5 vira −5 ≤ −x < −2', () => {
    expect(espelhar(sol('x < 3'))).toEqual([{ a: -3, b: INF, ia: false, ib: false }])
    expect(textoEspelho(sol('x < 3'), 'x', true)).toBe('−x > −3')
    expect(textoEspelho(sol('x < 3'), 'x', false)).toBe('x < 3')
    expect(textoEspelho(sol('2 < x ≤ 5'), 'x', true)).toBe('−5 ≤ −x < −2')
    const P: Pedaco[] = sol('x < −3 ou x > 3')
    expect(espelhar(espelhar(P))).toEqual(P)
  })

  test('3 < 5, mas −3 > −5', () => {
    expect(comparacaoEspelho(3, 5, false)).toEqual({ esquerda: '3', rel: '<', direita: '5' })
    expect(comparacaoEspelho(3, 5, true)).toEqual({ esquerda: '−3', rel: '>', direita: '−5' })
    expect(comparacaoEspelho(-2, 4, true)).toEqual({ esquerda: '2', rel: '>', direita: '−4' })
  })

  test('o arco sobe e desce, e quem vai mais longe sobe mais', () => {
    const a = arcoEspelho(100, 40, 120, 30)
    expect(a[0]).toEqual([100, 120])
    expect(a[a.length - 1]).toEqual([40, 120])
    expect(Math.min(...a.map((p) => p[1]))).toBeCloseTo(90)
    expect(alturaDoArco(60, 300, 70)).toBeLessThan(alturaDoArco(100, 300, 70))
    expect(alturaDoArco(-300, 300, 70)).toBe(70)
    expect(alturaDoArco(1, 300, 70)).toBe(12)
  })
})

describe('o desenho', () => {
  test('bolinhas e setas', () => {
    expect(faixaDe(sol('x > 3')[0], 0, 10)).toEqual({ v1: 3, v2: 10, esq: 'vazia', dir: 'seta' })
    expect(faixaDe(sol('x ≥ 3')[0], 0, 10)).toEqual({ v1: 3, v2: 10, esq: 'cheia', dir: 'seta' })
    expect(faixaDe(sol('x ≤ −1')[0], -5, 5)).toEqual({ v1: -5, v2: -1, esq: 'seta', dir: 'cheia' })
    expect(faixaDe(sol('2 < x ≤ 5')[0], 0, 8)).toEqual({ v1: 2, v2: 5, esq: 'vazia', dir: 'cheia' })
    // Uma ponta que passa da reta segue com a seta; um pedaço fora da reta não aparece.
    expect(faixaDe(sol('−20 < x < 3')[0], -5, 5)).toMatchObject({ esq: 'seta', dir: 'vazia' })
    expect(faixaDe(sol('x > 12')[0], 0, 10)).toBeNull()
    expect(faixaDe(sol('x > 10')[0], 0, 10)).toBeNull()
    expect(faixaDe(sol('x ≥ 10')[0], 0, 10)).toMatchObject({ v1: 10, v2: 10, esq: 'cheia', dir: 'seta' })
  })

  test('as regiões de sinal', () => {
    const rs = regioesDe([{ ate: 2, sinal: '+' }, { de: 2, ate: 5, sinal: '-', serve: true }, { de: 5, sinal: '+' }, { sinal: '?' }], 0, 7)
    expect(rs.map((r) => [r.sinal, r.serve, r.meio])).toEqual([
      ['+', false, 1],
      ['−', true, 3.5],
      ['+', false, 6],
    ])
    expect(raizesDasRegioes(rs)).toEqual([2, 5])
    expect(regioesDe('x', 0, 7)).toEqual([])
  })

  test('os traços da reta', () => {
    expect(tracosDaReta({ de: -2, ate: 2, passo: 1 })).toEqual([-2, -1, 0, 1, 2])
    expect(tracosDaReta({ de: 0, ate: 10 })).toHaveLength(11)
    expect(tracosDaReta({ de: 0, ate: 1, passo: 0.25 })).toEqual([0, 0.25, 0.5, 0.75, 1])
  })
})

describe('o Mexa testar', () => {
  const c = cond('x > 3')
  const tracos = tracosDaReta({ de: 0, ate: 8, passo: 1 })

  test('pede a meta, um de cada tipo e os números pedidos', () => {
    expect(testarFeito(c, [4, 5, 6], { testados: 4 }, tracos).feito).toBe(false)
    expect(testarFeito(c, [4, 5, 6, 7], { testados: 4 }, tracos)).toEqual({ feito: false, falta: 'Teste também um número que não serve.' })
    expect(testarFeito(c, [1, 2, 0, 1], { testados: 4 }, tracos).feito).toBe(false)
    expect(testarFeito(c, [1, 2, 5, 6], { testados: 4 }, tracos).feito).toBe(true)
    expect(testarFeito(c, [1, 2, 5, 6], { testados: 4, testar: [3] }, tracos)).toEqual({ feito: false, falta: 'Teste também o 3.' })
    expect(testarFeito(c, [3], { testar: [3] }, tracos)).toEqual({ feito: false, falta: 'Teste também um número que serve.' })
    expect(testarFeito(c, [3, 4], { testar: [3] }, tracos).feito).toBe(true)
    // Com só a lista, a meta é a lista inteira.
    expect(testarFeito(c, [], { testar: [1, 5] }, tracos)).toEqual({ feito: false })
    expect(testarFeito(c, [5], { testar: [1, 5] }, tracos)).toEqual({ feito: false })
    // Se nenhum traço serve, não pede um que serve.
    expect(testarFeito(cond('x > 20'), [1], { testados: 1 }, tracos).feito).toBe(true)
  })

  test('"Me mostre" testa o que basta, perto da borda', () => {
    for (const [t, meta] of [
      ['x > 3', { testados: 4 }],
      ['x > 3', { testados: 2, testar: [3] }],
      ['(x − 2)(x − 5) < 0', { testados: 3 }],
      ['x ≥ 7', { testados: 9 }],
    ] as [string, { testados?: number; testar?: number[] }][]) {
      const cc = cond(t)
      const out = testesDaSolucao(cc, meta, tracos)
      expect(testarFeito(cc, out, meta, tracos).feito, t).toBe(true)
      expect(new Set(out).size).toBe(out.length)
    }
    expect(testesDaSolucao(c, { testados: 2 }, tracos)).toEqual([4, 3])
  })
})
