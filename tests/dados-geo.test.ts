import { describe, expect, test } from 'vitest'
import {
  amplitude,
  comSinal,
  comUnidade,
  conjuntosDe,
  desvioPadrao,
  desvios,
  distanciaMedia,
  eixoDados,
  encaixarFulcro,
  fulcroNaMedia,
  inclinacao,
  lerValor,
  media,
  mediana,
  meioDaFila,
  modas,
  niveis,
  ordemFila,
  somaDesviosTexto,
  type DadosState,
} from '@/components/aula/visual/dados-geo'

// As contas do modelo `dados` (U19): cada uma refeita à mão.

const notas = [5, 7, 8, 6, 7, 9, 7, 6, 8, 4]

describe('as contas dos dados', () => {
  test('média: a soma dividida pela quantidade', () => {
    expect(media([7, 5, 8, 7, 6])).toBe(6.6)
    expect(media(notas)).toBe(6.7)
    expect(media([2, 2, 2.5, 3, 3, 3.5, 30])).toBeCloseTo(46 / 7)
    expect(media([])).toBe(0)
  })

  test('mediana: o do meio, com quantidade ímpar e par', () => {
    // Ímpar: 5, 6, 7, 7, 8 → o terceiro.
    expect(mediana([7, 5, 8, 7, 6])).toBe(7)
    // Par: 3, 4, 5, 6, 8, 9 → entre o 5 e o 6.
    expect(mediana([3, 8, 5, 6, 9, 4])).toBe(5.5)
    expect(mediana([2, 2, 2.5, 3, 3, 3.5, 30])).toBe(3)
    expect(meioDaFila(5)).toEqual([2])
    expect(meioDaFila(6)).toEqual([2, 3])
    expect(meioDaFila(0)).toEqual([])
    // A fila: do menor ao maior; num empate, a ordem da lista.
    expect(ordemFila([7, 4, 9, 4])).toEqual([1, 3, 0, 2])
  })

  test('moda: a pilha mais alta, com empate e sem moda', () => {
    expect(modas(notas)).toEqual([7])
    expect(modas([1, 2, 2, 3, 3])).toEqual([2, 3])
    expect(modas([1, 2, 3])).toEqual([])
    expect(modas([4])).toEqual([4])
    expect(niveis([7, 5, 7, 7])).toEqual([0, 0, 1, 2])
  })

  test('amplitude, desvios que somam zero e distância média', () => {
    expect(amplitude([3, 12, 7])).toBe(9)
    expect(desvios([2, 4, 9])).toEqual([-3, -1, 4])
    const mg = [498, 500, 501, 499, 502, 500, 503, 497]
    expect(desvios(mg).reduce((a, b) => a + b, 0)).toBeCloseTo(0)
    expect(desvios(notas).reduce((a, b) => a + b, 0)).toBeCloseTo(0)
    expect(distanciaMedia([2, 4, 9])).toBeCloseTo(8 / 3)
    expect(somaDesviosTexto([2, 4, 9])).toBe('(−3) + (−1) + (+4) = 0')
    expect(comSinal(2)).toBe('+2')
    expect(comSinal(-0.5)).toBe('−0,5')
    expect(comSinal(0)).toBe('0')
  })

  test('desvio padrão: a raiz da média dos quadrados dos desvios', () => {
    // 2, 4, 4, 4, 5, 5, 7, 9: média 5, quadrados 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32; 32 ÷ 8 = 4; raiz 2.
    expect(desvioPadrao([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
    expect(desvioPadrao([2, 4, 4, 4, 5, 5, 7, 9], true)).toBeCloseTo(Math.sqrt(32 / 7))
    expect(desvioPadrao([498, 500, 501, 499, 502, 500, 503, 497])).toBeCloseTo(Math.sqrt(28 / 8))
    // Todos iguais: nada se espalha.
    expect(desvioPadrao([5, 5, 5])).toBe(0)
    expect(desvioPadrao([])).toBe(0)
  })

  test('a reta: do passo antes do menor ao passo depois do maior; sem negativos, do 0', () => {
    const e = eixoDados({ valores: notas })
    expect([e.de, e.ate, e.passo]).toEqual([3, 10, 1])
    expect(eixoDados({ valores: [0, 5] }).de).toBe(0)
    const dado = eixoDados({ valores: [20, 40], de: 0, ate: 50, passo: 10 })
    expect(dado.marcas).toEqual([0, 10, 20, 30, 40, 50])
    // Dois conjuntos na mesma reta.
    expect(conjuntosDe({ conjuntos: [{ nome: 'A', valores: [1, 2] }, { valores: [9] }] }).map((c) => c.valores)).toEqual([[1, 2], [9]])
    expect(comUnidade({ antes: 'R$ ' }, 1200)).toBe('R$ 1.200')
    expect(comUnidade({ unidade: 'min' }, 7.5)).toBe('7,5 min')
  })

  test('o apoio: inclina para o lado mais pesado e encaixa na média', () => {
    const s: DadosState = { valores: notas }
    const e = eixoDados(s)
    expect(inclinacao(notas, 6.7, e)).toBe(0)
    // Apoio à esquerda da média: a direita desce (ângulo positivo).
    expect(inclinacao(notas, 5, e)).toBeGreaterThan(0)
    expect(inclinacao(notas, 9, e)).toBeLessThan(0)
    // Perto da média, o apoio encaixa nela; longe, anda de décimo em décimo.
    expect(encaixarFulcro(s, 6.55, 6.7)).toBe(6.7)
    expect(encaixarFulcro(s, 5.04, 6.7)).toBe(5)
    expect(encaixarFulcro(s, 99, 6.7)).toBe(10)
    expect(fulcroNaMedia(s, 6.7, 6.7)).toBe(true)
    expect(fulcroNaMedia(s, 6.3, 6.7)).toBe(false)
  })

  test('achar: o toque lê o valor mais perto', () => {
    const e = eixoDados({ valores: notas })
    expect(lerValor(notas, 6.95, e)).toBe(7)
    expect(lerValor(notas, 6.68, e)).toBe(6.7)
    expect(lerValor([3, 8, 5, 6, 9, 4], 5.6, eixoDados({ valores: [3, 8, 5, 6, 9, 4] }))).toBe(5.5)
  })
})
