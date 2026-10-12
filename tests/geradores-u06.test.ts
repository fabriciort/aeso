import { describe, expect, it } from 'vitest'
import { GERADORES_U6 } from '@/content/matematica/geradores/divisibilidade'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (e das opções) e refaz a conta por
// conta própria, sem usar as funções do gerador.

const g = (id: string) => GERADORES_U6.find((x) => x.id === id)!
const n = (s: string) => Number(s.replace(/\./g, ''))
const nums = (s: string) => [...s.matchAll(/\d[\d.]*\d|\d/g)].map((m) => n(m[0]))
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
const erroDa = (item: Item, texto: string) => item.erros[String(item.opcoes!.indexOf(texto))]

// Contas independentes, pela força bruta.
const nDivisores = (x: number) => {
  let c = 0
  for (let d = 1; d <= x; d++) if (x % d === 0) c++
  return c
}
const primo = (x: number) => nDivisores(x) === 2
const gcd = (a: number, b: number) => {
  for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d
  return 1
}
const lcm = (a: number, b: number) => {
  for (let m = Math.max(a, b); ; m++) if (m % a === 0 && m % b === 0) return m
}
const produto = (s: string) => s.split(' × ').reduce((t, f) => t * Number(f), 1)

describe('U6 · geradores', () => {
  it('12 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U6).toHaveLength(12)
    for (const aula of ['B.U6.A1', 'B.U6.A2', 'B.U6.A3', 'B.U6.A4']) {
      expect(GERADORES_U6.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
})

describe('U6 · aula 1: múltiplos e divisores', () => {
  it('multiplos-divisores-n1: só uma opção é múltiplo; o divisor é um erro mapeado', () => {
    for (const item of itens(g('multiplos-divisores-n1'))) {
      const [d] = nums(item.enunciado)
      const ops = item.opcoes!.map(Number)
      expect(new Set(ops).size).toBe(4)
      expect(ops.filter((x) => x % d === 0)).toEqual([Number(escolhida(item))])
      const divisor = ops.find((x) => x > 1 && x < d && d % x === 0)!
      expect(erroDa(item, String(divisor))).toBe('confunde-multiplo-divisor')
    }
  })
  it('multiplos-divisores-n2: conta todos os divisores, com o 1 e o próprio número', () => {
    for (const item of itens(g('multiplos-divisores-n2'))) {
      const [x] = nums(item.enunciado)
      const t = nDivisores(x)
      expect(item.resposta).toBe(t)
      expect(item.erros[String(t - 2)]).toBe('esquece-divisores-extremos')
    }
  })
  it('multiplos-divisores-n3: só uma frase é verdadeira', () => {
    for (const item of itens(g('multiplos-divisores-n3'))) {
      const [x, d] = nums(item.enunciado)
      expect(x % d).toBe(0)
      const verdade = (f: string) => {
        const m = f.match(/^(\d+) (não )?é (divisor|múltiplo) de (\d+)$/)!
        const [a, b] = [Number(m[1]), Number(m[4])]
        const v = m[3] === 'divisor' ? b % a === 0 : a % b === 0
        return m[2] ? !v : v
      }
      const certas = item.opcoes!.filter(verdade)
      expect(certas).toEqual([escolhida(item)])
      expect(erroDa(item, `${x} é divisor de ${d}`)).toBe('confunde-multiplo-divisor')
    }
  })
})

describe('U6 · aula 2: regras de divisibilidade', () => {
  for (const id of ['divisibilidade-n1', 'divisibilidade-n2']) {
    it(`${id}: só uma opção é divisível`, () => {
      for (const item of itens(g(id))) {
        const [d] = nums(item.enunciado)
        const ops = item.opcoes!.map(Number)
        expect(new Set(ops).size).toBe(4)
        expect(ops.filter((x) => x % d === 0)).toEqual([Number(escolhida(item))])
        expect(Object.values(item.erros)).toContain('regra-no-algarismo-errado')
      }
    })
  }
  it('divisibilidade-n1: a isca tem o algarismo certo no lugar errado', () => {
    for (const item of itens(g('divisibilidade-n1'))) {
      const [d] = nums(item.enunciado)
      const i = Number(Object.keys(item.erros).find((k) => item.erros[k] === 'regra-no-algarismo-errado'))
      const isca = item.opcoes![i]
      if (d === 5) expect(isca[0]).toBe('5')
      if (d === 2) expect(Number(isca[0]) % 2).toBe(0)
      if (d === 10) expect(isca[1]).toBe('0')
    }
  })
  it('divisibilidade-n2: a isca termina no próprio divisor; por 9, outra é só por 3', () => {
    for (const item of itens(g('divisibilidade-n2'))) {
      const [d] = nums(item.enunciado)
      const i = Number(Object.keys(item.erros).find((k) => item.erros[k] === 'regra-no-algarismo-errado'))
      expect(Number(item.opcoes![i]) % 10 % 3).toBe(0)
      expect(Number(escolhida(item)) % 10 === d).toBe(false)
      if (d === 9) {
        const j = Number(Object.keys(item.erros).find((k) => item.erros[k] === 'confunde-3-e-9'))
        expect(Number(item.opcoes![j]) % 3).toBe(0)
      }
    }
  })
  it('divisibilidade-n3: o algarismo que completa a divisibilidade (o menor, para o 3)', () => {
    for (const item of itens(g('divisibilidade-n3'))) {
      const lacuna = item.enunciado.match(/\d[\d.]*\?[\d.]*/)![0].replace(/\.$/, '').replace(/\./g, '')
      const d = /caixas de 9|fileiras de 9/.test(item.enunciado) ? 9 : 3
      if (d === 3) expect(item.enunciado).toMatch(/3 pessoas|3 turmas/)
      const servem = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => Number(lacuna.replace('?', String(x))) % d === 0)
      if (d === 9) expect(servem).toHaveLength(1)
      expect(item.resposta).toBe(servem[0])
    }
  })
})

describe('U6 · aula 3: primos e fatoração', () => {
  it('primos-n1: só uma opção é primo; o 1 e o ímpar composto são erros', () => {
    for (const item of itens(g('primos-n1'))) {
      const ops = item.opcoes!.map(Number)
      expect(ops.filter(primo)).toEqual([Number(escolhida(item))])
      expect(erroDa(item, '1')).toBe('um-e-primo')
      const impar = ops.find((x) => x > 1 && x % 2 === 1 && !primo(x))!
      expect(erroDa(item, String(impar))).toBe('primo-e-impar')
    }
  })
  it('primos-n2: só uma opção tem só primos e dá o número', () => {
    for (const item of itens(g('primos-n2'))) {
      const [x] = nums(item.enunciado)
      const valida = (f: string) => produto(f) === x && f.split(' × ').every((p) => primo(Number(p)))
      expect(item.opcoes!.filter(valida)).toEqual([escolhida(item)])
      for (const o of item.opcoes!) {
        if (o === escolhida(item)) continue
        const fs = o.split(' × ').map(Number)
        const e = erroDa(item, o)
        if (fs.includes(1)) expect(e).toBe('um-e-primo')
        else if (produto(o) !== x) expect(e).toBe('esquece-fator-repetido')
        else expect(e).toBe('fatoracao-com-composto')
      }
    }
  })
  it('primos-n3: o maior primo que divide o número', () => {
    for (const item of itens(g('primos-n3'))) {
      const [x] = nums(item.enunciado)
      let maior = 0
      for (let p = 2; p <= x; p++) if (x % p === 0 && primo(p)) maior = p
      expect(primo(x)).toBe(false)
      expect(item.resposta).toBe(maior)
    }
  })
})

describe('U6 · aula 4: MMC e MDC', () => {
  it('mmc-mdc-n1: o primeiro encontro; o produto e o MDC são erros', () => {
    for (const item of itens(g('mmc-mdc-n1'))) {
      const [a, b] = nums(item.enunciado)
      const m = lcm(a, b)
      expect(item.resposta).toBe(m)
      if (a * b !== m) expect(item.erros[String(a * b)]).toBe('mmc-e-o-produto')
      expect(item.erros[String(gcd(a, b))]).toBe('confunde-mmc-mdc')
    }
  })
  it('mmc-mdc-n2: o maior pedaço comum; o MMC é um erro', () => {
    for (const item of itens(g('mmc-mdc-n2'))) {
      const [a, b] = nums(item.enunciado)
      expect(item.resposta).toBe(gcd(a, b))
      expect(gcd(a, b)).toBeGreaterThan(1)
      expect(item.erros[String(lcm(a, b))]).toBe('confunde-mmc-mdc')
    }
  })
  it('mmc-mdc-n3: encontro é MMC, corte é MDC', () => {
    let encontros = 0
    for (const item of itens(g('mmc-mdc-n3'))) {
      const [a, b] = nums(item.enunciado)
      if (/juntos de novo|juntas de novo/.test(item.enunciado)) {
        encontros++
        expect(item.resposta).toBe(lcm(a, b))
        expect(item.erros[String(gcd(a, b))]).toBe('confunde-mmc-mdc')
      } else {
        expect(item.resposta).toBe(gcd(a, b))
        expect(item.erros[String(lcm(a, b))]).toBe('confunde-mmc-mdc')
      }
    }
    expect(encontros).toBeGreaterThan(50)
    expect(encontros).toBeLessThan(250)
  })
})
