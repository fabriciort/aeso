import { describe, expect, it } from 'vitest'
import { GERADORES_U2 } from '@/content/matematica/geradores/adicao-subtracao'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado e refaz a conta por conta própria,
// sem usar a resposta do gerador.

const g = (id: string) => GERADORES_U2.find((x) => x.id === id)!
const n = (s: string) => Number(s.replace(/\./g, ''))
const nums = (s: string) => [...s.matchAll(/\d[\d.]*/g)].map((m) => n(m[0]))
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]

/** Há vai um em alguma casa? */
const temReserva = (a: number, b: number) => {
  for (; a > 0 || b > 0; a = Math.floor(a / 10), b = Math.floor(b / 10)) if ((a % 10) + (b % 10) >= 10) return true
  return false
}
/** Há empresta em alguma casa? */
const temEmpresta = (a: number, b: number) => {
  for (; b > 0; a = Math.floor(a / 10), b = Math.floor(b / 10)) if (a % 10 < b % 10) return true
  return false
}

describe('U2 · aula 1: os sentidos', () => {
  it('sentidos-n1: ganhar soma, usar subtrai', () => {
    for (const item of itens(g('sentidos-n1'))) {
      const [a, b] = nums(item.enunciado)
      const certa = /ganha/.test(item.enunciado) ? a + b : a - b
      expect(item.resposta).toBe(certa)
      expect(certa).toBeGreaterThan(0)
      expect(certa).toBeLessThan(100)
      const trocada = /ganha/.test(item.enunciado) ? a - b : a + b
      if (trocada >= 0) expect(item.erros[String(trocada)]).toBe('operacao-trocada')
    }
  })
  it('sentidos-n2: só juntar pede soma; comparar, completar e tirar pedem subtração', () => {
    for (const item of itens(g('sentidos-n2'))) {
      const soma = /chegaram mais/.test(item.enunciado)
      expect(escolhida(item)).toMatch(soma ? / \+ / : / − /)
      expect(item.opcoes).toHaveLength(2)
      expect(Object.values(item.erros)).toEqual(['operacao-trocada'])
    }
  })
  it('sentidos-n3: troco é a nota menos o preço', () => {
    for (const item of itens(g('sentidos-n3'))) {
      const [preco, nota] = nums(item.enunciado)
      expect(item.resposta).toBe(nota - preco)
      expect(nota - preco).toBeGreaterThan(0)
      expect(preco % 10).not.toBe(0)
    }
  })
})

describe('U2 · aula 2: contas de cabeça', () => {
  for (const id of ['cabeca-n1', 'cabeca-n2', 'cabeca-n3']) {
    it(`${id}: a conta passa por uma dezena redonda`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        const soma = !/ − /.test(item.enunciado)
        const certa = soma ? a + b : a - b
        expect(item.resposta).toBe(certa)
        // Atravessa a dezena: as unidades passam de 9 (soma) ou faltam (subtração).
        expect(soma ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10).toBe(true)
        if (soma) expect(item.erros[String(certa - 10)]).toBe('esquece-reserva')
      }
    })
  }
})

describe('U2 · aula 3: adição armada', () => {
  for (const id of ['armada-soma-n1', 'armada-soma-n2', 'armada-soma-n3']) {
    it(`${id}: soma com vai um`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        expect(item.resposta).toBe(a + b)
        expect(temReserva(a, b)).toBe(true)
        expect(Object.values(item.erros)).toContain('esquece-reserva')
      }
    })
  }
  it('armada-soma-n2: vai um nas unidades e nas dezenas', () => {
    for (const item of itens(g('armada-soma-n2'))) {
      const [a, b] = nums(item.enunciado)
      const u = (a % 10) + (b % 10)
      expect(u).toBeGreaterThanOrEqual(10)
      expect(1 + Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10).toBeGreaterThanOrEqual(10)
      expect(a + b).toBeLessThan(1000)
    }
  })
})

describe('U2 · aula 4: subtração armada', () => {
  for (const id of ['armada-sub-n1', 'armada-sub-n2', 'armada-sub-n3']) {
    it(`${id}: subtração com empresta e resultado positivo`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        expect(item.resposta).toBe(a - b)
        expect(a - b).toBeGreaterThan(0)
        if (id !== 'armada-sub-n3') expect(temEmpresta(a, b)).toBe(true)
      }
    })
  }
  it('armada-sub-n2: zero nas dezenas de cima', () => {
    for (const item of itens(g('armada-sub-n2'))) {
      const [a] = nums(item.enunciado)
      expect(Math.floor(a / 10) % 10).toBe(0)
    }
  })
})

describe('U2 · aula 5: conferir', () => {
  it('conferir-n1: a estimativa certa é a soma das centenas', () => {
    for (const item of itens(g('conferir-n1'))) {
      const [a, b] = nums(item.enunciado)
      const est = Math.round(a / 100) * 100 + Math.round(b / 100) * 100
      expect(n(escolhida(item))).toBe(est)
      expect(Math.abs(a + b - est)).toBeLessThan(50)
    }
  })
  it('conferir-n2: a conta certa desfaz a subtração', () => {
    for (const item of itens(g('conferir-n2'))) {
      const [a, b, c] = nums(item.enunciado)
      expect(a - b).toBe(c)
      const [x, y, z] = nums(escolhida(item))
      expect(escolhida(item)).toMatch(/ \+ /)
      expect(x + y).toBe(z)
      expect(z).toBe(a)
    }
  })
  it('conferir-n3: a conta mostrada está errada e a resposta é a certa', () => {
    for (const item of itens(g('conferir-n3'))) {
      const [a, b, achou] = nums(item.enunciado)
      const certa = / \+ /.test(item.enunciado) ? a + b : a - b
      expect(item.resposta).toBe(certa)
      expect(achou).not.toBe(certa)
      expect(Object.keys(item.erros)).toContain(String(achou))
    }
  })
})
