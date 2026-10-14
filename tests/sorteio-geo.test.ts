import { describe, expect, test } from 'vitest'
import { favoraveisDe } from '@/components/aula/visual/contagem-geo'
import { bolasDe, casosDe, chancesDe, contarResultados, curvaDe, gerador, jogadasDe, pctTexto, resultadosDe, sortear, tipoSorteio, type SorteioState } from '@/components/aula/visual/sorteio-geo'

// As contas do modelo `sorteio` (U19): os casos possíveis, os favoráveis e a simulação.

describe('as contas do sorteio', () => {
  test('os casos: o dado, a moeda, as bolas e uma lista', () => {
    const dado = casosDe({ casos: 'dado' })
    expect(dado.map((c) => c.valor)).toEqual([1, 2, 3, 4, 5, 6])
    expect(favoraveisDe(dado, { valores: [2, 4, 6] })).toEqual([1, 3, 5])
    expect(favoraveisDe(dado, { maior: 4 })).toEqual([4, 5])
    expect(favoraveisDe(dado, { menor: 3 })).toEqual([0, 1])
    expect(resultadosDe({ casos: 'moeda' }).map((r) => r.nome)).toEqual(['cara', 'coroa'])
    // Cada bola é um caso; as da mesma cor contam como um resultado.
    const saco: SorteioState = { bolas: { azul: 3, vermelha: 2 } }
    expect(tipoSorteio(saco)).toBe('bolas')
    expect(bolasDe(saco)).toEqual([{ cor: 'azul', nome: 'azul', n: 3 }, { cor: 'erro', nome: 'vermelha', n: 2 }])
    const bolas = casosDe(saco)
    expect(bolas).toHaveLength(5)
    expect(favoraveisDe(bolas, { cor: 'vermelha' })).toEqual([3, 4])
    expect(favoraveisDe(bolas, { cor: ['azul', 'vermelha'] })).toHaveLength(5)
    expect(chancesDe(saco)).toEqual([0.6, 0.4])
    expect(bolasDe({ bolas: [['verde', 1], ['azul', 2]] }).map((b) => b.n)).toEqual([1, 2])
    const cartas = casosDe({ casos: ['A', 'K', { nome: 'Q', cor: 'erro' }, '10'] })
    expect(cartas.map((c) => c.nome)).toEqual(['A', 'K', 'Q', '10'])
    expect(cartas[2].cor).toBe('erro')
    expect(cartas[3].valor).toBe(10)
    expect(favoraveisDe(cartas, { valores: ['a', 'k'] })).toEqual([0, 1])
  })

  test('a simulação é a mesma para a mesma semente', () => {
    const s: SorteioState = { casos: 'dado', semente: 7 }
    expect(sortear(s, 50)).toEqual(sortear(s, 50))
    expect(sortear(s, 50)).not.toEqual(sortear({ ...s, semente: 8 }, 50))
    // Jogar mais não muda as primeiras jogadas: as barras só crescem.
    expect(sortear(s, 100).slice(0, 50)).toEqual(sortear(s, 50))
    const r = gerador(1)
    const xs = Array.from({ length: 1000 }, r)
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true)
    expect(Array.from({ length: 5 }, gerador(1))).toEqual(xs.slice(0, 5))
    expect(sortear(s, 20).every((i) => i >= 0 && i < 6)).toBe(true)
  })

  test('a sequência fixa vem primeiro (a falácia do jogador)', () => {
    const s: SorteioState = { casos: 'moeda', sequencia: ['cara', 'cara', 'cara', 'cara', 'cara'] }
    const res = sortear(s, 5)
    expect(res).toEqual([0, 0, 0, 0, 0])
    expect(sortear(s, 8).slice(0, 5)).toEqual(res)
    expect(sortear({ bolas: { azul: 1, vermelha: 1 }, sequencia: ['vermelha', 'azul'] }, 2)).toEqual([1, 0])
  })

  test('a frequência relativa chega perto da chance', () => {
    const dado = sortear({ casos: 'dado', semente: 7 }, 6000)
    contarResultados(dado, 6).forEach((c) => expect(Math.abs(c / 6000 - 1 / 6)).toBeLessThan(0.02))
    const moeda = sortear({ casos: 'moeda', semente: 3 }, 10000)
    expect(Math.abs(contarResultados(moeda, 2)[0] / 10000 - 0.5)).toBeLessThan(0.02)
    // Com pesos: 3 azuis e 2 vermelhas, a azul sai uns 60 %.
    const saco = sortear({ bolas: { azul: 3, vermelha: 2 }, semente: 5 }, 5000)
    expect(Math.abs(contarResultados(saco, 2)[0] / 5000 - 0.6)).toBeLessThan(0.03)
    // Com poucas jogadas, longe; com muitas, perto: a curva termina perto da chance.
    const curva = curvaDe(moeda, 0)
    expect(curva.length).toBeLessThanOrEqual(121)
    expect(curva[curva.length - 1][0]).toBe(10000)
    expect(curva[curva.length - 1][1]).toBeCloseTo(contarResultados(moeda, 2)[0] / 10000)
    expect(Math.abs(curva[curva.length - 1][1] - 0.5)).toBeLessThan(Math.max(...curva.slice(0, 3).map((p) => Math.abs(p[1] - 0.5))))
  })

  test('as jogadas e a porcentagem escrita', () => {
    expect(jogadasDe({ jogadas: 100 })).toBe(100)
    expect(jogadasDe({ jogadas: 99999 })).toBe(10000)
    expect(jogadasDe({})).toBeUndefined()
    expect(pctTexto(1 / 6)).toBe('16,7 %')
    expect(pctTexto(0.5)).toBe('50 %')
    expect(pctTexto(0.523)).toBe('52,3 %')
  })
})
