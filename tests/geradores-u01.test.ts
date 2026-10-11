import { describe, expect, it } from 'vitest'
import { leituraComZero, palavrasParaNumero, valorDoAlgarismo, valorPosicionalSozinho } from '@/content/matematica/geradores/valor-posicional'
import { rng } from '@/lib/formation/rng'

describe('valor posicional com e sem apoio', () => {
  for (const gerador of [valorDoAlgarismo, valorPosicionalSozinho]) {
    it(gerador.id + ': reconstrói o valor a partir do enunciado sem consultar o visual', () => {
      const respostas = new Set()
      for (let s = 1; s <= 500; s++) {
        const item = gerador.gerar(rng(s))
        const [, numero, digito] = item.enunciado.match(/(?:Em |há |deu )([\d.]+).*?(?:vale o )(\d)/)!
        const digits = numero.replace(/\./g, '')
        // Somar o peso de cada casa lendo o número da direita; não usar o cálculo do gerador.
        let peso = 1
        let esperado = 0
        for (const d of [...digits].reverse()) {
          if (d === digito) esperado += Number(d) * peso
          peso *= 10
        }
        expect(item.resposta).toBe(esperado)
        expect(digits.split(digito)).toHaveLength(2)
        expect(Object.keys(item.erros)).not.toContain(String(esperado))
        expect(item.erros[digito]).toBe('valor-de-face')
        expect(item.visual === undefined).toBe(gerador.nivel === 3)
        respostas.add(item.resposta)
      }
      expect(respostas.size).toBeGreaterThan(8)
    })
  }
})

const centenas: Record<string, number> = {
  duzentos: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500,
  seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900,
}
const unidades: Record<string, number> = {
  um: 1, dois: 2, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
}

describe('palavras-para-numero', () => {
  it('interpreta o ditado e diagnostica concatenação e omissão de zero', () => {
    const combinacoes = new Set()
    for (let s = 1; s <= 500; s++) {
      const item = palavrasParaNumero.gerar(rng(s))
      const [, centena, unidade] = item.enunciado.match(/algarismos: (\S+) e (\S+)\./)!
      const esperado = centenas[centena] + unidades[unidade]
      expect(item.resposta).toBe(esperado)
      expect(item.erros[String(centenas[centena]) + unidades[unidade]]).toBe('concatena-casas')
      expect(item.erros[String(centenas[centena] / 100) + unidades[unidade]]).toBe('esquece-zero')
      combinacoes.add(esperado)
    }
    expect(combinacoes.size).toBe(72)
  })
})

describe('leitura-com-zero', () => {
  it('escolhe mil e unidades, sem confundir com dezenas nem remover casas vazias', () => {
    const casas: Record<string, number> = {
      ...unidades, dez: 10, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
      sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
      onze: 11, doze: 12, treze: 13, quatorze: 14, quinze: 15, dezesseis: 16,
      dezessete: 17, dezoito: 18, dezenove: 19,
    }
    const posicoes = new Set()
    for (let seed = 1; seed <= 500; seed++) {
      const item = leituraComZero.gerar(rng(seed))
      const n = Number(item.enunciado.match(/([\d.]+)/)![1].replace(/\./g, ''))
      const valores = item.opcoes!.map((opcao) => {
        const semMil = opcao.toLowerCase().replace(/^mil e /, '')
        return casas[semMil] + (opcao.startsWith('Mil e ') ? 1000 : 0)
      })
      expect(valores[Number(item.resposta)]).toBe(n)
      expect(valores.filter((valor) => valor === n)).toHaveLength(1)
      expect(new Set(item.opcoes).size).toBe(3)
      for (const [indice, erro] of Object.entries(item.erros)) {
        const alternativa = valores[Number(indice)]
        expect(alternativa).not.toBe(n)
        expect(erro).toBe(alternativa > 1000 ? 'casa-errada' : 'esquece-zero')
      }
      posicoes.add(item.resposta)
    }
    expect([...posicoes].sort()).toEqual([0, 1, 2])
  })
})
