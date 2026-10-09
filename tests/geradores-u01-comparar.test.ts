import { describe, expect, it } from 'vitest'
import { compararN1, compararN2, compararN3 } from '@/content/matematica/geradores/comparar'
import { rng } from '@/lib/formation/rng'
import type { Item, Rng } from '@/lib/formation/schema'

const numerosDoTexto = (texto: string) => [...texto.matchAll(/\d[\d.]*/g)].map(([n]) => Number(n.replace(/\./g, '')))

function confiraAlternativas(item: Item) {
  expect(item.formato).toBe('escolha')
  expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
  expect(Number.isInteger(item.resposta)).toBe(true)
  expect(Number(item.resposta)).toBeGreaterThanOrEqual(0)
  expect(Number(item.resposta)).toBeLessThan(item.opcoes!.length)
  expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
  expect(Object.keys(item.erros)).toHaveLength(item.opcoes!.length - 1)
  for (const chave of Object.keys(item.erros)) {
    expect(Number(chave)).toBeGreaterThanOrEqual(0)
    expect(Number(chave)).toBeLessThan(item.opcoes!.length)
  }
  expect(item.enunciado.length).toBeLessThanOrEqual(140)
  expect(item.dicas).toHaveLength(3)
  item.dicas.forEach((dica) => expect(dica.length).toBeLessThanOrEqual(140))
}

function confiraOrdem(item: Item) {
  // Lê o problema, sem consultar o estado visual nem os números internos
  // do gerador; a solução independente usa comparação aritmética.
  const apresentados = numerosDoTexto(item.enunciado)
  expect(apresentados).toHaveLength(3)
  expect(new Set(apresentados).size).toBe(3)
  const esperados = [...apresentados].sort((a, b) => a - b)
  let corretas = 0
  item.opcoes!.forEach((opcao, indice) => {
    const propostos = numerosDoTexto(opcao)
    expect([...propostos].sort((a, b) => a - b)).toEqual(esperados)
    const correta = propostos.every((n, i) => n === esperados[i])
    if (correta) {
      corretas++
      expect(item.resposta).toBe(indice)
    } else {
      expect(item.erros[String(indice)]).toBeDefined()
    }
  })
  expect(corretas).toBe(1)
  expect(numerosDoTexto(item.dicas[2]).slice(0, 3)).toEqual(esperados)
  return apresentados
}

/** Rng extremo também confere os intervalos usados, sem depender de sementes. */
function borda(maximo: boolean): Rng {
  return {
    int(min, max) {
      expect(Number.isInteger(min)).toBe(true)
      expect(Number.isInteger(max)).toBe(true)
      expect(min).toBeLessThanOrEqual(max)
      return maximo ? max : min
    },
    pick<T>(itens: readonly T[]): T {
      expect(itens.length).toBeGreaterThan(0)
      return itens[maximo ? itens.length - 1 : 0]
    },
    next: () => maximo ? 0.999999 : 0,
  }
}

describe('comparar: três níveis', () => {
  for (const gerador of [compararN1, compararN2, compararN3]) {
    it(`${gerador.id}: 300 sementes, respostas independentes e determinismo`, () => {
      const enunciados = new Set<string>()
      const respostas = new Set<number>()
      for (let seed = 1; seed <= 300; seed++) {
        const item = gerador.gerar(rng(seed))
        expect(gerador.gerar(rng(seed))).toEqual(item)
        confiraAlternativas(item)
        enunciados.add(item.enunciado)
        respostas.add(Number(item.resposta))
        if (gerador.nivel === 2) {
          const numeros = numerosDoTexto(item.enunciado)
          expect(numeros).toHaveLength(2)
          const procurado = item.enunciado.includes('o maior') ? Math.max(...numeros) : Math.min(...numeros)
          expect(Number(item.opcoes![Number(item.resposta)].replace(/\./g, ''))).toBe(procurado)
          expect(item.opcoes!.map((n) => Number(n.replace(/\./g, ''))).sort((a, b) => a - b))
            .toEqual([...numeros].sort((a, b) => a - b))
          expect(numeros).not.toContain(0)
          expect(Math.max(...numeros)).toBeLessThanOrEqual(4_000)
          expect(item.visual?.modelo).toBe('quadro-posicional')
          expect(item.visual?.estado.numero).toBeNull()
        } else {
          const numeros = confiraOrdem(item)
          expect(Math.min(...numeros)).toBeGreaterThanOrEqual(0)
          expect(Math.max(...numeros)).toBeLessThanOrEqual(gerador.nivel === 1 ? 90 : 1_000_000)
          if (gerador.nivel === 1) {
            expect(item.visual?.modelo).toBe('reta')
            expect(item.visual?.estado.pontos).toEqual([])
            expect(item.visual?.estado.marcas).toEqual([0, 100])
            expect([...item.visual!.estado.fichas as number[]].sort((a, b) => a - b))
              .toEqual([...numeros].sort((a, b) => a - b))
          } else {
            expect(item.enunciado).toContain('Exemplo imaginado')
            expect(item.visual).toBeUndefined()
          }
        }
      }
      expect(enunciados.size).toBeGreaterThan(80)
      expect(respostas.size).toBe(gerador.nivel === 2 ? 2 : 3)
    })

    it(`${gerador.id}: termina e mantém opções distintas nas duas bordas do rng`, () => {
      for (const maximo of [false, true]) {
        const item = gerador.gerar(borda(maximo))
        confiraAlternativas(item)
        if (gerador.nivel !== 2) confiraOrdem(item)
      }
    })
  }

  it('nível 2 varia zeros, trocas e quantidade de casas, perguntando maior e menor', () => {
    const familias = new Set<string>()
    const perguntas = new Set<string>()
    for (let seed = 1; seed <= 300; seed++) {
      const item = compararN2.gerar(rng(seed))
      const numeros = numerosDoTexto(item.enunciado)
      const textos = numeros.map(String)
      perguntas.add(item.enunciado.includes('o maior') ? 'maior' : 'menor')
      if (textos[0].length !== textos[1].length) familias.add('casas')
      else if (textos.some((n) => n[1] === '0')) familias.add('zero')
      else familias.add('troca')
    }
    expect([...familias].sort()).toEqual(['casas', 'troca', 'zero'])
    expect([...perguntas].sort()).toEqual(['maior', 'menor'])
  })

  it('nível 3 inclui a virada para um milhão e mantém a unidade comum', () => {
    const item = compararN3.gerar(borda(false))
    expect(numerosDoTexto(item.enunciado)).toContain(1_000_000)
    expect(item.enunciado).toContain(' m.')
    confiraOrdem(item)
  })
})
