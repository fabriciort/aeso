import { describe, expect, it } from 'vitest'
import { GERADORES_U7B } from '@/content/matematica/geradores/fracoes-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê as frações do enunciado e das opções e refaz a conta por
// conta própria, com frações exatas (numerador e denominador inteiros),
// sem usar as funções do gerador.

const g = (id: string) => GERADORES_U7B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

type F = [number, number]
const gcd = (a: number, b: number): number => {
  for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d
  return 1
}
const red = ([n, d]: F): F => {
  const k = gcd(n, d)
  return [n / k, d / k]
}
const igual = (x: F, y: F) => x[0] * y[1] === y[0] * x[1]
const maior = (x: F, y: F) => x[0] * y[1] > y[0] * x[1]
const soma = (x: F, y: F): F => red([x[0] * y[1] + y[0] * x[1], x[1] * y[1]])
const menos = (x: F, y: F): F => red([x[0] * y[1] - y[0] * x[1], x[1] * y[1]])
const vezes = (x: F, y: F): F => red([x[0] * y[0], x[1] * y[1]])
const div = (x: F, y: F): F => red([x[0] * y[1], x[1] * y[0]])

/** As frações escritas em TeX num texto, na ordem. */
const fracoes = (s: string): F[] => [...s.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])])
/** O valor de uma opção: uma fração em TeX ou um inteiro; outra coisa vira null. */
function valorDe(o: string): F | null {
  const f = fracoes(o)
  if (f.length === 1) return f[0]
  if (/^\d+$/.test(o)) return [Number(o), 1]
  return null
}
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
/** Só uma opção vale a resposta certa, e é a marcada. */
function confere(item: Item, certa: F) {
  const valores = item.opcoes!.map(valorDe)
  const certas = valores.map((v, i) => (v && igual(v, certa) ? i : -1)).filter((i) => i >= 0)
  expect(certas, `${item.enunciado} → ${item.opcoes!.join(' | ')}`).toEqual([Number(item.resposta)])
  // Nenhuma outra opção tem o mesmo valor de outra (sem ambiguidade).
  const textos = valores.filter((v): v is F => v !== null).map((v) => red(v).join('/'))
  expect(new Set(textos).size).toBe(textos.length)
}
/** A opção com este valor exato (mesmo numerador e denominador) tem este erro. */
function erroDe(item: Item, f: F, erro: string) {
  const i = item.opcoes!.findIndex((o) => {
    const v = valorDe(o)
    return v !== null && v[0] === f[0] && v[1] === f[1]
  })
  expect(i, `${item.enunciado}: falta a opção ${f.join('/')}`).toBeGreaterThanOrEqual(0)
  expect(item.erros[String(i)]).toBe(erro)
}

describe('U7 (aulas 6 a 10) · geradores', () => {
  it('15 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U7B).toHaveLength(15)
    for (const aula of ['B.U7.A6', 'B.U7.A7', 'B.U7.A8', 'B.U7.A9', 'B.U7.A10']) {
      expect(GERADORES_U7B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
})

describe('U7 · aula 6: comparar', () => {
  for (const id of ['comparar-fracoes-n1', 'comparar-fracoes-n2', 'comparar-fracoes-n3']) {
    it(`${id}: a opção certa é a maior; "iguais" nunca é certa`, () => {
      for (const item of itens(g(id))) {
        const [x, y] = fracoes(item.enunciado)
        expect(igual(x, y)).toBe(false)
        const certa = maior(x, y) ? x : y
        const errada = maior(x, y) ? y : x
        confere(item, certa)
        const v = valorDe(escolhida(item))!
        expect(v[0] === certa[0] && v[1] === certa[1]).toBe(true)
        // A armadilha: a menor tem o denominador maior.
        if (id !== 'comparar-fracoes-n2' || x[0] === y[0]) {
          expect(errada[1]).toBeGreaterThan(certa[1])
          erroDe(item, errada, 'maior-denominador-maior-fracao')
        }
      }
    })
  }
  it('comparar-fracoes-n3: a menor tem os dois números maiores', () => {
    for (const item of itens(g('comparar-fracoes-n3'))) {
      const [x, y] = fracoes(item.enunciado)
      const [a, b] = maior(x, y) ? [x, y] : [y, x]
      expect(b[0]).toBeGreaterThan(a[0])
      expect(b[1]).toBeGreaterThan(a[1])
    }
  })
})

describe('U7 · aula 7: somar com pedaços iguais', () => {
  for (const id of ['somar-iguais-n1', 'somar-iguais-n2', 'somar-iguais-n3']) {
    it(`${id}: soma (ou sobra) certa; somar os denominadores é erro mapeado`, () => {
      for (const item of itens(g(id))) {
        const [x, y] = fracoes(item.enunciado)
        expect(x[1]).toBe(y[1])
        const sobra = /sobrou/.test(item.enunciado)
        const certa = sobra ? menos(x, y) : soma(x, y)
        confere(item, certa)
        if (!sobra) erroDe(item, [x[0] + y[0], 2 * x[1]], 'soma-denominadores-iguais')
        if (id === 'somar-iguais-n1') expect(maior([1, 1], certa)).toBe(true)
        if (id === 'somar-iguais-n2') expect(maior(certa, [1, 1])).toBe(true)
      }
    })
  }
})

describe('U7 · aula 8: somar com pedaços diferentes', () => {
  for (const id of ['somar-diferentes-n1', 'somar-diferentes-n2', 'somar-diferentes-n3']) {
    it(`${id}: soma certa; somar em cima e embaixo é erro mapeado`, () => {
      for (const item of itens(g(id))) {
        const [x, y] = fracoes(item.enunciado)
        expect(x[1]).not.toBe(y[1])
        confere(item, soma(x, y))
        erroDe(item, [x[0] + y[0], x[1] + y[1]], 'soma-numeradores-e-denominadores')
      }
    })
  }
  it('somar-diferentes-n1: um denominador é múltiplo do outro', () => {
    for (const item of itens(g('somar-diferentes-n1'))) {
      const [x, y] = fracoes(item.enunciado)
      expect(Math.max(x[1], y[1]) % Math.min(x[1], y[1])).toBe(0)
    }
  })
  it('somar-diferentes-n2: o MMC é menor que o produto', () => {
    for (const item of itens(g('somar-diferentes-n2'))) {
      const [x, y] = fracoes(item.enunciado)
      expect(gcd(x[1], y[1])).toBeGreaterThan(1)
      expect(Math.max(x[1], y[1]) % Math.min(x[1], y[1])).not.toBe(0)
    }
  })
})

describe('U7 · aula 9: multiplicar', () => {
  it('multiplicar-fracoes-n1: 1/b de c/d', () => {
    for (const item of itens(g('multiplicar-fracoes-n1'))) {
      const [x, y] = fracoes(item.enunciado)
      expect(x[0]).toBe(1)
      confere(item, vezes(x, y))
      erroDe(item, [y[0] * x[1], y[1]], 'multiplicar-sempre-aumenta')
    }
  })
  it('multiplicar-fracoes-n2: a/b de n é inteiro e certo', () => {
    for (const item of itens(g('multiplicar-fracoes-n2'))) {
      const n = Number(item.enunciado.match(/(\d+) (colheres|ovos|pães)/)![1])
      const [f] = fracoes(item.enunciado)
      const certa = vezes([n, 1], f)
      expect(certa[1]).toBe(1)
      expect(item.resposta).toBe(certa[0])
      if (f[0] < f[1]) expect(item.erros[String(n * f[0])]).toBe('multiplicar-sempre-aumenta')
    }
  })
  it('multiplicar-fracoes-n3: fração de fração, na forma mais simples', () => {
    for (const item of itens(g('multiplicar-fracoes-n3'))) {
      const [x, y] = fracoes(item.enunciado)
      // O enunciado pode trazer as duas em qualquer ordem: o produto é o mesmo.
      confere(item, vezes(x, y))
      const v = valorDe(escolhida(item))!
      expect(gcd(v[0], v[1])).toBe(1)
    }
  })
})

describe('U7 · aula 10: dividir', () => {
  it('dividir-fracoes-n1: quantos 1/d cabem em n', () => {
    for (const item of itens(g('dividir-fracoes-n1'))) {
      const [f] = fracoes(item.enunciado)
      const n = Number(item.enunciado.replace(/\\frac\{\d+\}\{\d+\}/, '').match(/(\d+) (L|xícaras|kg)/)![1])
      expect(f[0]).toBe(1)
      const certa = div([n, 1], f)
      expect(certa[1]).toBe(1)
      expect(item.resposta).toBe(certa[0])
      expect(Number(item.resposta)).toBeGreaterThan(n)
    }
  })
  it('dividir-fracoes-n2: quantos c/d cabem em n, resposta inteira', () => {
    for (const item of itens(g('dividir-fracoes-n2'))) {
      const [f] = fracoes(item.enunciado)
      const n = Number(item.enunciado.replace(/\\frac\{\d+\}\{\d+\}/, '').match(/(\d+) (L|xícaras|kg)/)![1])
      const certa = div([n, 1], f)
      expect(certa[1]).toBe(1)
      expect(item.resposta).toBe(certa[0])
      const passos = (item.visual!.estado.saltos as unknown[]).length
      expect(passos).toBe(certa[0])
    }
  })
  it('dividir-fracoes-n3: a ÷ b; inverter a errada e não inverter são erros mapeados', () => {
    for (const item of itens(g('dividir-fracoes-n3'))) {
      const fs = fracoes(item.enunciado)
      // "potes de y com x" e "doses de y em x" trazem o divisor primeiro.
      const [x, y] = /potes de|doses de/.test(item.enunciado) ? [fs[1], fs[0]] : [fs[0], fs[1]]
      const certa = div(x, y)
      expect(maior(certa, [1, 1])).toBe(true)
      confere(item, certa)
      const inv = red(div(y, x))
      const sem = red(vezes(x, y))
      const idx = (f: F) => item.opcoes!.findIndex((o) => {
        const v = valorDe(o)
        return v !== null && igual(v, f)
      })
      expect(item.erros[String(idx(inv))]).toBe('inverte-a-fracao-errada')
      expect(item.erros[String(idx(sem))]).toBe('dividir-sempre-diminui')
    }
  })
})
