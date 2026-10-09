import { describe, expect, it } from 'vitest'
import { agrupamentoN1, agrupamentoN2, agrupamentoN3 } from '@/content/matematica/geradores/agrupamento'
import { rng } from '@/lib/formation/rng'
import type { Item, Rng } from '@/lib/formation/schema'

const geradores = [agrupamentoN1, agrupamentoN2, agrupamentoN3]
const numero = (s: string) => Number(s.replace(/\./g, ''))

function dados(item: Item) {
  const [, grupos, tamanho, soltas] = item.enunciado.match(/São (\d+) grupos de ([\d.]+) e (\d+) unidades soltas/)
    ?? item.enunciado.match(/(\d+) caixas com ([\d.]+) peças cada, e mais (\d+) peças soltas/)!
  return { grupos: numero(grupos), tamanho: numero(tamanho), soltas: numero(soltas) }
}

function roteiro(inteiros: number[], grupo: 10 | 100 | 1_000): Rng {
  let pos = 0
  return {
    int: () => inteiros[pos++],
    pick: <T>(items: readonly T[]) => items.find((x) => x === grupo)! as T,
    next: () => 0,
  }
}

describe('agrupamento: conservar unidades ao trocar embalagens', () => {
  for (const gerador of geradores) {
    it(`${gerador.id}: confere 300 enunciados por contagem de grupos`, () => {
      const vistos = new Set<string>()
      for (let seed = 1; seed <= 300; seed++) {
        const item = gerador.gerar(rng(seed))
        const { grupos, tamanho, soltas } = dados(item)
        // Reconstrói o total contando o conteúdo de cada grupo, sem usar o visual/resposta.
        let dentroDosGrupos = 0
        for (let g = 0; g < grupos; g++) dentroDosGrupos += tamanho
        const contagem = dentroDosGrupos + soltas
        expect(item.resposta).toBe(contagem)
        expect(item.erros[String(grupos + soltas)]).toBe('conta-grupos-como-unidades')
        if (soltas > 0 && dentroDosGrupos !== grupos + soltas) {
          expect(item.erros[String(dentroDosGrupos)]).toBe('descarta-sobra')
        }
        expect(Object.keys(item.erros)).not.toContain(String(contagem))
        expect(item.dicas).toHaveLength(3)
        for (const texto of [item.enunciado, ...item.dicas]) expect(texto.length).toBeLessThanOrEqual(140)
        if (gerador.nivel === 3) {
          expect(item.visual).toBeUndefined()
          expect(item.enunciado).not.toMatch(/imaginad/i)
          expect(contagem).toBeLessThan(10_000)
        } else {
          expect(item.visual?.modelo).toBe('blocos')
          expect(item.visual?.estado.total).toBeNull()
          expect(item.visual?.estado.trocasFeitas).toBe(0)
        }
        vistos.add(item.enunciado)
      }
      expect(vistos.size).toBeGreaterThan(30)
    })

    it(`${gerador.id}: repete diversas sementes e continua a sequência`, () => {
      for (const seed of [0, 1, 42, 300, 65_535]) {
        const a = rng(seed)
        const b = rng(seed)
        for (let i = 0; i < 5; i++) expect(gerador.gerar(a)).toEqual(gerador.gerar(b))
      }
    })
  }

  it('inclui dezena sem sobra e viradas de centena e milhar', () => {
    expect(agrupamentoN1.gerar(roteiro([1, 0], 10)).resposta).toBe(10)
    expect(agrupamentoN2.gerar(roteiro([10, 0], 10)).resposta).toBe(100)
    expect(agrupamentoN2.gerar(roteiro([10, 0], 100)).resposta).toBe(1_000)
    const item = agrupamentoN2.gerar(roteiro([10, 7], 100))
    expect(item.resposta).toBe(1_007)
    expect(item.erros['907']).toBe('troca-incompleta')
    expect(item.erros['1070']).toBe('sobra-na-casa-errada')
    expect(item.erros['1000']).toBe('descarta-sobra')
  })

  it('mantém zero como sobra legítima no contexto sem apoio', () => {
    const item = agrupamentoN3.gerar(roteiro([9, 0], 1_000))
    expect(item.resposta).toBe(9_000)
    expect(item.erros).not.toHaveProperty('9000')
    expect(item.visual).toBeUndefined()
  })
})
