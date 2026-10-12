import { describe, expect, it } from 'vitest'
import { GERADORES_U7A } from '@/content/matematica/geradores/fracoes-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (do visual, quando o enunciado é o
// desenho) e das opções, e refaz a conta por conta própria, sem usar as
// funções do gerador.

const g = (id: string) => GERADORES_U7A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const nums = (s: string) => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
/** Todas as frações de um texto, como [numerador, denominador]. */
const fracoes = (s: string) => [...s.matchAll(/\\frac\{(\d+|\?)\}\{(\d+|\?)\}/g)].map((m) => [m[1], m[2]] as [string, string])
const fracao = (s: string) => {
  const [[n, d]] = fracoes(s)
  return [Number(n), Number(d)] as [number, number]
}
/** Índices das opções que valem n/d (por produto cruzado). */
const valendo = (item: Item, n: number, d: number) =>
  item.opcoes!.map((o, i) => ({ o, i })).filter(({ o }) => fracoes(o).length === 1 && (() => { const [a, b] = fracao(o); return a * d === b * n })()).map(({ i }) => i)
const iguais = (item: Item, n: number, d: number) => item.opcoes!.map((o, i) => ({ o, i })).filter(({ o }) => fracoes(o).length === 1 && fracao(o)[0] === n && fracao(o)[1] === d).map(({ i }) => i)
const gcd = (a: number, b: number) => {
  for (let x = Math.min(a, b); x >= 1; x--) if (a % x === 0 && b % x === 0) return x
  return 1
}

describe('U7 (aulas 1 a 5) · geradores', () => {
  it('15 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U7A).toHaveLength(15)
    for (const aula of ['B.U7.A1', 'B.U7.A2', 'B.U7.A3', 'B.U7.A4', 'B.U7.A5']) {
      expect(GERADORES_U7A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('opções únicas e erros apontando para opções', () => {
    for (const ger of GERADORES_U7A) {
      for (const item of itens(ger)) {
        if (item.formato !== 'escolha') continue
        expect(new Set(item.opcoes).size, ger.id).toBe(item.opcoes!.length)
        expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
      }
    }
  })
})

describe('U7 · aula 1: partes iguais', () => {
  it('partes-iguais-n1: a fração pintada da barra', () => {
    for (const item of itens(g('partes-iguais-n1'))) {
      const { partes, pintadas } = item.visual!.estado as { partes: number; pintadas: number }
      expect(iguais(item, pintadas, partes)).toEqual([Number(item.resposta)])
      expect(item.erros[String(iguais(item, pintadas, partes - pintadas)[0])]).toBe('pintadas-sobre-nao-pintadas')
      expect(item.erros[String(iguais(item, partes, pintadas)[0])]).toBe('troca-numerador-denominador')
    }
  })
  it('partes-iguais-n2: a fração sem pintar', () => {
    for (const item of itens(g('partes-iguais-n2'))) {
      const { partes, pintadas } = item.visual!.estado as { partes: number; pintadas: number }
      const sem = partes - pintadas
      expect(iguais(item, sem, partes)).toEqual([Number(item.resposta)])
      expect(item.erros[String(iguais(item, sem, pintadas)[0])]).toBe('pintadas-sobre-nao-pintadas')
    }
  })
  it('partes-iguais-n3: comeu ou sobrou, sem visual', () => {
    for (const item of itens(g('partes-iguais-n3'))) {
      expect(item.visual).toBeUndefined()
      const [d, p] = nums(item.enunciado)
      const resto = /sobrou|ainda/.test(item.enunciado)
      const k = resto ? d - p : p
      expect(iguais(item, k, d)).toEqual([Number(item.resposta)])
    }
  })
})

describe('U7 · aula 2: fração na reta', () => {
  for (const id of ['fracao-reta-n1', 'fracao-reta-n2']) {
    it(`${id}: conta os espaços até o "?"`, () => {
      for (const item of itens(g(id))) {
        const { passo, marcaSemRotulo } = item.visual!.estado as { passo: number; marcaSemRotulo: number }
        const d = Math.round(1 / passo)
        const k = Math.round(marcaSemRotulo / passo)
        expect(iguais(item, k, d)).toEqual([Number(item.resposta)])
        expect(item.erros[String(iguais(item, k, d + 1)[0])]).toBe('reta-conta-tracos')
        if (id === 'fracao-reta-n2') {
          expect(k).toBeGreaterThan(d)
          expect(item.erros[String(iguais(item, k - d, d)[0])]).toBe('fracao-so-menor-que-um')
        }
      }
    })
  }
  it('fracao-reta-n3: entre quais inteiros', () => {
    for (const item of itens(g('fracao-reta-n3'))) {
      const [k, d] = fracao(item.enunciado)
      let q = 0
      while ((q + 1) * d <= k) q++
      expect(k % d).not.toBe(0)
      expect(escolhida(item)).toBe(`Entre ${q} e ${q + 1}`)
      if (q > 0) expect(item.erros['0']).toBe('fracao-so-menor-que-um')
    }
  })
})

describe('U7 · aula 3: fração como divisão', () => {
  for (const id of ['fracao-divisao-n1', 'fracao-divisao-n2', 'fracao-divisao-n3']) {
    it(`${id}: a ÷ b = a/b`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        expect(a % b).not.toBe(0)
        const certa = escolhida(item)
        expect(fracao(certa)).toEqual([a, b])
        expect(item.erros[String(iguais(item, b, a)[0])]).toBe('divide-o-menor-pelo-maior')
        if (a < b) expect(item.erros[String(item.opcoes!.findIndex((o) => /^(0|Nada)/.test(o)))]).toBe('menor-por-maior-da-zero')
      }
    })
  }
})

describe('U7 · aula 4: equivalentes', () => {
  for (const id of ['equivalentes-n1', 'equivalentes-n2']) {
    it(`${id}: o número que falta`, () => {
      for (const item of itens(g(id))) {
        const [[a, b], [c, e]] = fracoes(item.enunciado)
        // a/b = c/e, com um "?" do lado direito.
        const x = c === '?' ? (Number(a) * Number(e)) / Number(b) : (Number(b) * Number(c)) / Number(a)
        expect(Number.isInteger(x)).toBe(true)
        expect(item.resposta).toBe(x)
      }
    })
  }
  it('equivalentes-n3: só uma opção vale o mesmo', () => {
    for (const item of itens(g('equivalentes-n3'))) {
      const [n, d] = fracao(item.enunciado)
      expect(valendo(item, n, d)).toEqual([Number(item.resposta)])
      expect(Object.values(item.erros)).toContain('equivalente-somando')
    }
  })
})

describe('U7 · aula 5: simplificar', () => {
  for (const id of ['simplificar-n1', 'simplificar-n2', 'simplificar-n3']) {
    it(`${id}: a forma mais simples`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = id === 'simplificar-n3' ? [nums(item.enunciado)[1], nums(item.enunciado)[0]] : fracao(item.enunciado)
        const m = gcd(a, b)
        expect(m).toBeGreaterThan(1)
        expect(fracao(escolhida(item))).toEqual([a / m, b / m])
        if (id === 'simplificar-n1') expect(a % nums(item.enunciado).at(-1)!).toBe(0)
        // Só a certa vale a/b e não simplifica mais.
        const certas = item.opcoes!.filter((o) => { const [x, y] = fracao(o); return x * b === y * a && gcd(x, y) === 1 })
        expect(certas).toEqual([escolhida(item)])
      }
    })
  }
})
