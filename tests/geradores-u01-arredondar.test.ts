import { describe, expect, it } from 'vitest'
import { arredondarN1, arredondarN2, arredondarN3 } from '@/content/matematica/geradores/arredondar'
import type { Item, Rng } from '@/lib/formation/schema'
import { rng } from '@/lib/formation/rng'

const lerNumero = (texto: string) => Number(texto.replace(/\./g, ''))
const precisao: Record<string, number> = { dezena: 10, centena: 100, milhar: 1000 }

// Confere por distâncias aos vizinhos, sem repetir a fórmula do gerador.
function maisProximo(numero: number, escala: number) {
  const inferior = numero - numero % escala
  const superior = inferior + escala
  return numero - inferior < superior - numero ? inferior : superior
}

function conferir(item: Item) {
  if (item.formato === 'numero') {
    const numero = lerNumero(item.enunciado.match(/[\d.]+/)![0])
    const escala = precisao[item.enunciado.match(/(?:à|ao) (dezena|centena|milhar)/)![1]]
    expect(item.resposta).toBe(maisProximo(numero, escala))
    for (const [valor, erro] of Object.entries(item.erros)) {
      expect(Number(valor)).not.toBe(item.resposta)
      if (erro === 'empate-para-baixo') {
        expect(numero % escala).toBe(escala / 2)
        expect(Number(valor)).toBe(numero - numero % escala)
      } else if (erro === 'arredonda-sempre-para-cima') {
        expect(numero % escala).toBeLessThan(escala / 2)
        expect(Number(valor)).toBe(numero - numero % escala + escala)
      } else {
        expect(erro).toBe('olha-casa-errada')
        expect([maisProximo(numero, escala / 10), maisProximo(numero, escala * 10)]).toContain(Number(valor))
      }
    }
    if (item.visual) {
      const inferior = numero - numero % escala
      expect(item.visual.modelo).toBe('reta')
      expect(item.visual.estado).toEqual({ de: inferior, ate: inferior + escala, marcas: [inferior, numero, inferior + escala] })
      expect(item.visual.esboco).toContain('Sem seta')
    }
  } else {
    expect(item.formato).toBe('escolha')
    expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
    expect(item.resposta).toBeGreaterThanOrEqual(0)
    expect(item.resposta).toBeLessThan(item.opcoes!.length)
    const escolhida = item.opcoes![Number(item.resposta)]
    if (item.enunciado.includes('catálogo')) {
      const numero = lerNumero(item.enunciado.match(/tem ([\d.]+) livros/)![1])
      const esperado = maisProximo(numero, 100)
      const [, origem, destino] = escolhida.match(/^([\d.]+) ≈ ([\d.]+)$/)!
      expect(lerNumero(origem)).toBe(numero)
      expect(lerNumero(destino)).toBe(esperado)
      for (const [indice, erro] of Object.entries(item.erros)) {
        expect(item.opcoes![Number(indice)].includes(' = ')).toBe(erro === 'estimativa-exata')
      }
    } else {
      const valores = [...item.enunciado.matchAll(/R\$ ([\d.]+)/g)].map((m) => lerNumero(m[1]))
      expect(valores).toHaveLength(3)
      expect(valores[1]).toBe(maisProximo(valores[0], 100))
      expect(valores[2]).toBe(valores[1])
      expect(valores[0]).toBeGreaterThan(valores[2])
      expect(escolhida).toBe('Não; a aproximação está abaixo do preço exato.')
      for (const [indice, erro] of Object.entries(item.erros)) {
        const opcao = item.opcoes![Number(indice)]
        expect(opcao.includes('igual')).toBe(erro === 'estimativa-exata')
        expect(opcao.includes('sempre garante')).toBe(erro === 'aproximacao-garante-limite')
      }
    }
    expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
    expect(Object.keys(item.erros)).toHaveLength(item.opcoes!.length - 1)
  }
  expect(item.dicas).toHaveLength(3)
  for (const texto of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) expect(texto.length).toBeLessThanOrEqual(140)
}

describe.each([arredondarN1, arredondarN2, arredondarN3])('$id', (gerador) => {
  it('300 sementes: lê o enunciado e confere resposta, dicas e diagnósticos', () => {
    const enunciados = new Set<string>()
    for (let s = 1; s <= 300; s++) {
      const item = gerador.gerar(rng(s))
      conferir(item)
      enunciados.add(item.enunciado)
      expect(gerador.gerar(rng(s))).toEqual(item)
      expect(Boolean(item.visual)).toBe(gerador.nivel < 3)
      if (gerador.nivel === 3) expect(item.enunciado).toContain('Exemplo imaginado:')
    }
    expect(enunciados.size).toBeGreaterThan(15)
  })
})

// RNG dirigido: escolhe bordas do domínio sem depender de encontrar uma semente.
function borda(escala: number, multiplicador: number, deslocamento: number): Rng {
  const escolhas = [escala, multiplicador, escala / 2 + deslocamento]
  let chamada = 0
  return {
    int: () => { throw new Error('Este gerador de bordas só deve escolher itens.') },
    next: () => { throw new Error('Este gerador de bordas só deve escolher itens.') },
    pick<T>(items: readonly T[]): T {
      const escolhido = escolhas[chamada++]
      expect(items).toContain(escolhido)
      return escolhido as T
    },
  }
}

describe('bordas do arredondamento', () => {
  it.each([
    [10, 10, 94, 95, 96, 90, 100],
    [10, 100, 994, 995, 996, 990, 1000],
    [100, 10, 949, 950, 951, 900, 1000],
    [100, 100, 9949, 9950, 9951, 9900, 10000],
    [1000, 10, 9499, 9500, 9501, 9000, 10000],
    [1000, 100, 99499, 99500, 99501, 99000, 100000],
  ])('escala %i, vizinho superior %i vezes a escala: abaixo, empate e acima', (escala, multiplicador, abaixo, empate, acima, inferior, superior) => {
    const casos = [[-1, abaixo, inferior], [0, empate, superior], [1, acima, superior]]
    for (const [deslocamento, numero, resposta] of casos) {
      const item = arredondarN2.gerar(borda(escala, multiplicador, deslocamento))
      expect(lerNumero(item.enunciado.match(/[\d.]+/)![0])).toBe(numero)
      expect(item.resposta).toBe(resposta)
      conferir(item)
      expect(Object.values(item.erros).includes('empate-para-baixo')).toBe(deslocamento === 0)
    }
  })

  it('exercita os três contextos sem visual e varia a posição certa nas escolhas', () => {
    const tipos = new Set<string>()
    const indices = new Set<number>()
    for (let s = 1; s <= 300; s++) {
      const item = arredondarN3.gerar(rng(s))
      tipos.add(item.formato === 'numero' ? 'quantidade' : item.enunciado.includes('catálogo') ? 'notacao' : 'limite')
      if (item.formato === 'escolha') indices.add(Number(item.resposta))
    }
    expect(tipos).toEqual(new Set(['quantidade', 'notacao', 'limite']))
    expect(indices).toEqual(new Set([0, 1, 2]))
  })
})
