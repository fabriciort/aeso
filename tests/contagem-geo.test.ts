import { describe, expect, test } from 'vitest'
import { caminhos, casosDaGrade, chanceDe, contaTexto, corCanonica, etapasDe, favoraveisDe, gradeDe, textoCasa, type GradeFinal } from '@/components/aula/visual/contagem-geo'

// As contas do modelo `contagem` (U19): a árvore, a grade de pares, os favoráveis e a chance.

describe('as contas da contagem', () => {
  test('a árvore: as escolhas em sequência se multiplicam', () => {
    const etapas = etapasDe({ arvore: [[{ nome: 'azul', cor: 'azul' }, 'preta', 'branca'], ['jeans', 'social']] })
    expect(etapas.map((e) => e.map((o) => o.nome))).toEqual([['azul', 'preta', 'branca'], ['jeans', 'social']])
    expect(etapas[0][0].cor).toBe('azul')
    const cs = caminhos(etapas)
    expect(cs).toHaveLength(6)
    expect(cs[0]).toEqual([0, 0])
    expect(cs[5]).toEqual([2, 1])
    expect(caminhos(etapas, 1)).toEqual([[0], [1], [2]])
    expect(caminhos([[1, 2, 3], [1, 2], [1, 2]].map((e) => e.map((n) => ({ nome: String(n) }))))).toHaveLength(12)
    expect(contaTexto([3, 2], 'roupas')).toBe('3 × 2 = 6 roupas')
    expect(contaTexto([3, 2, 2])).toBe('3 × 2 × 2 = 12')
    expect(contaTexto([4])).toBe('4')
    expect(contaTexto([])).toBe('')
    // Uma etapa vazia ou que não é lista fica de fora.
    expect(etapasDe({ arvore: [['a'], [], 'x' as unknown as unknown[]] })).toHaveLength(1)
  })

  test('a grade de dois dados: 36 pares, as somas e os favoráveis', () => {
    const g = gradeDe({ grade: { linhas: 6, conteudo: 'soma' } }) as GradeFinal
    expect([g.linhas.length, g.colunas.length]).toEqual([6, 6])
    expect(textoCasa(g, 0, 5)).toBe('7')
    expect(textoCasa(g, 5, 5)).toBe('12')
    expect(textoCasa({ ...g, conteudo: 'par' }, 0, 5)).toBe('1, 6')
    expect(textoCasa({ ...g, conteudo: 'produto' }, 2, 3)).toBe('12')
    expect(textoCasa({ ...g, conteudo: 'diferenca' }, 5, 0)).toBe('5')
    const casos = casosDaGrade(g)
    expect(casos).toHaveLength(36)
    // Soma 7: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1).
    expect(favoraveisDe(casos, { soma: 7 })).toEqual([5, 10, 15, 20, 25, 30])
    expect(favoraveisDe(casos, { soma: [7, 11] })).toHaveLength(8)
    expect(favoraveisDe(casos, { iguais: true })).toEqual([0, 7, 14, 21, 28, 35])
    expect(favoraveisDe(casos, { maior: 10 })).toHaveLength(3)
    expect(favoraveisDe(casos, [[0, 5], [1, 4]])).toEqual([5, 10])
    expect(favoraveisDe(casos, { nada: 1 })).toEqual([])
    // Para cada soma de 2 a 12, as casas que a dão: 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1.
    expect(Array.from({ length: 11 }, (_, i) => favoraveisDe(casos, { soma: i + 2 }).length)).toEqual([1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1])
  })

  test('a grade com nomes nos lados', () => {
    const g = gradeDe({ grade: { linhas: ['cara', 'coroa'], colunas: 6, nomes: ['moeda', 'dado'] } }) as GradeFinal
    expect(casosDaGrade(g)).toHaveLength(12)
    expect(textoCasa(g, 1, 2)).toBe('coroa, 3')
    expect(g.nomes).toEqual(['moeda', 'dado'])
    expect(gradeDe({})).toBeUndefined()
  })

  test('a chance: a fração, a simplificada e a porcentagem', () => {
    const c = chanceDe(6, 36)
    expect(c.de).toBe('6 de 36')
    expect(c.fracao).toEqual([6, 36])
    expect(c.simples).toEqual([1, 6])
    expect(c.pct).toBe('16,7 %')
    expect(c.exata).toBe(false)
    expect(chanceDe(3, 6)).toMatchObject({ simples: [1, 2], pct: '50 %', exata: true })
    expect(chanceDe(1, 6).simples).toBeNull()
    expect(chanceDe(0, 6)).toMatchObject({ simples: null, pct: '0 %' })
    expect(chanceDe(2, 5).pct).toBe('40 %')
  })

  test('as cores que o autor escreve', () => {
    expect(corCanonica('Vermelha')).toBe('erro')
    expect(corCanonica('lilás')).toBe('lilas')
    expect(corCanonica('amarelas')).toBeUndefined()
    expect(corCanonica('azuis')).toBe('azul')
    expect(corCanonica(3)).toBeUndefined()
  })
})
