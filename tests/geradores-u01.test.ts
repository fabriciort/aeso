import { describe, expect, it } from 'vitest'
import { palavrasParaNumero, valorDoAlgarismo } from '@/content/matematica/geradores/valor-posicional'
import { rng } from '@/lib/formation/rng'

// Exemplo de teste de gerador: confere a resposta por um cálculo
// independente, lendo o próprio enunciado.

describe('valor-do-algarismo', () => {
  it('a resposta é o algarismo vezes o valor da casa', () => {
    for (let s = 1; s <= 500; s++) {
      const item = valorDoAlgarismo.gerar(rng(s))
      const [, num, dig] = item.enunciado.match(/Em ([\d.]+), quanto vale o (\d)\?/)!
      const digits = num.replace(/\./g, '')
      const pos = digits.length - 1 - digits.indexOf(dig)
      expect(item.resposta).toBe(Number(dig) * 10 ** pos)
      expect(digits.indexOf(dig)).toBe(digits.lastIndexOf(dig)) // sem ambiguidade
    }
  })
})

describe('palavras-para-numero', () => {
  it('tem sempre zero nas dezenas e diagnostica os dois erros clássicos', () => {
    for (let s = 1; s <= 200; s++) {
      const item = palavrasParaNumero.gerar(rng(s))
      const n = Number(item.resposta)
      expect(Math.floor(n / 10) % 10).toBe(0)
      expect(Object.values(item.erros).sort()).toEqual(['concatena-casas', 'esquece-zero'])
    }
  })
})
