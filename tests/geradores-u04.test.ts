import { describe, expect, it } from 'vitest'
import { GERADORES_U4, chave } from '@/content/matematica/geradores/divisao'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado e refaz a conta por conta própria,
// sem usar a resposta do gerador.

const g = (id: string) => GERADORES_U4.find((x) => x.id === id)!
const n = (s: string) => Number(s.replace(/\./g, ''))
const nums = (s: string) => [...s.matchAll(/\d[\d.]*\d|\d/g)].map((m) => n(m[0]))
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
const tiraZeros = (q: number) => Number(String(q).replace(/0/g, ''))
/** Divide uma conta escrita "a ÷ b"; undefined quando b é 0. */
const calcula = (s: string) => {
  const [a, b] = nums(s)
  return b === 0 ? undefined : a / b
}

describe('U4 · geradores', () => {
  it('15 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U4).toHaveLength(15)
    for (const aula of ['B.U4.A1', 'B.U4.A2', 'B.U4.A3', 'B.U4.A4', 'B.U4.A5']) {
      expect(GERADORES_U4.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
})

describe('U4 · aula 1: repartir e quantos cabem', () => {
  for (const id of ['repartir-n1', 'repartir-n3']) {
    it(`${id}: o total dividido pelo segundo número, exato`, () => {
      for (const item of itens(g(id))) {
        const [t, d] = nums(item.enunciado)
        expect(t % d).toBe(0)
        expect(item.resposta).toBe(t / d)
        expect(item.erros[String(t * d)]).toBe('operacao-trocada')
      }
    })
  }
  it('repartir-n2: a conta certa é total ÷ parte; a invertida é um erro', () => {
    for (const item of itens(g('repartir-n2'))) {
      const [t, d] = nums(item.enunciado)
      expect(escolhida(item)).toBe(`${t} ÷ ${d}`)
      const inv = item.opcoes!.indexOf(`${d} ÷ ${t}`)
      expect(item.erros[String(inv)]).toBe('divide-o-menor-pelo-maior')
      expect(item.opcoes).toHaveLength(4)
    }
  })
})

describe('U4 · aula 2: o resto', () => {
  it('resto-n1: o que sobra, sempre menor que o grupo', () => {
    for (const item of itens(g('resto-n1'))) {
      const [t, d] = nums(item.enunciado)
      const resto = t % d
      expect(resto).toBeGreaterThan(0)
      expect(item.resposta).toBe(resto)
      // Quando o quociente coincide com resto + grupo, a resposta vale para os dois erros.
      if (Math.floor(t / d) !== resto + d) expect(item.erros[String(resto + d)]).toBe('resto-maior-que-divisor')
    }
  })
  it('resto-n2 e resto-n3: arredondar para cima, descartar o resto ou dar o resto', () => {
    for (const id of ['resto-n2', 'resto-n3']) {
      for (const item of itens(g(id))) {
        const [t, d] = nums(item.enunciado)
        const q = Math.floor(t / d)
        const resto = t % d
        expect(resto).toBeGreaterThan(0)
        const e = item.enunciado
        if (/sobra|fora d/.test(e)) {
          expect(item.resposta).toBe(resto)
        } else if (/é preciso/.test(e)) {
          expect(item.resposta).toBe(q + 1)
          expect(item.erros[String(q)]).toBe('ignora-contexto-do-resto')
        } else {
          expect(e).toMatch(/cheias|dá para/)
          expect(item.resposta).toBe(q)
          expect(item.erros[String(q + 1)]).toBe('ignora-contexto-do-resto')
        }
      }
    }
  })
  it('resto-n2 nunca pergunta só o resto', () => {
    for (const item of itens(g('resto-n2'))) expect(item.enunciado).not.toMatch(/sobra|fora d/)
  })
})

describe('U4 · aula 3: divisão longa', () => {
  it('divisao-longa-n1: cada casa divide sem sobra', () => {
    for (const item of itens(g('divisao-longa-n1'))) {
      const [t, d] = nums(item.enunciado)
      expect(item.resposta).toBe(t / d)
      for (const c of String(t)) expect(Number(c) % d).toBe(0)
    }
  })
  it('divisao-longa-n2: o quociente tem um zero, e esquecê-lo é um erro mapeado', () => {
    for (const item of itens(g('divisao-longa-n2'))) {
      const [t, d] = nums(item.enunciado)
      const q = t / d
      expect(Number.isInteger(q)).toBe(true)
      expect(item.resposta).toBe(q)
      expect(String(q)).toMatch(/0/)
      expect(t).toBeLessThan(1000)
      expect(item.erros[String(tiraZeros(q))]).toBe('esquece-zero-no-quociente')
    }
  })
  it('divisao-longa-n3: três algarismos, divisão exata', () => {
    for (const item of itens(g('divisao-longa-n3'))) {
      const [t, d] = nums(item.enunciado)
      expect(t).toBeGreaterThanOrEqual(100)
      expect(t).toBeLessThan(1000)
      expect(item.resposta).toBe(t / d)
      if (String(t / d).includes('0')) expect(item.erros[String(tiraZeros(t / d))]).toBe('esquece-zero-no-quociente')
    }
  })
  it('chave: os passos recompõem o quociente', () => {
    for (const [t, d, q] of [[612, 6, 102], [738, 3, 246], [824, 4, 206], [252, 4, 63], [840, 4, 210]]) {
      const ps = chave(t, d)
      expect(Number(ps.map((p) => p.digito).join(''))).toBe(q)
      expect(ps[ps.length - 1].resto).toBe(0)
      for (const p of ps) expect(p.resto).toBeLessThan(d)
    }
  })
})

describe('U4 · aula 4: a prova real', () => {
  it('prova-real-n1: divisor × quociente', () => {
    for (const item of itens(g('prova-real-n1'))) {
      const [d, q] = nums(item.enunciado)
      expect(item.resposta).toBe(d * q)
    }
  })
  it('prova-real-n2: divisor × quociente + resto, e esquecer o resto é um erro mapeado', () => {
    for (const item of itens(g('prova-real-n2'))) {
      const [d, q, resto] = nums(item.enunciado)
      expect(resto).toBeLessThan(d)
      expect(item.resposta).toBe(d * q + resto)
      expect(item.erros[String(d * q)]).toBe('prova-real-sem-resto')
    }
  })
  it('prova-real-n3: o quociente certo', () => {
    for (const item of itens(g('prova-real-n3'))) {
      const ns = nums(item.enunciado)
      const [t, d] = ns
      const q = Math.floor(t / d)
      expect(item.resposta).toBe(q)
      if (/resto/.test(item.enunciado)) {
        const [, , qErrado, rErrado] = ns
        expect(d * qErrado + rErrado).toBe(t) // a prova fecha…
        expect(rErrado).toBeGreaterThanOrEqual(d) // …mas o resto é grande demais
        expect(item.erros[String(qErrado)]).toBe('resto-maior-que-divisor')
      } else {
        expect(t % d).toBe(0)
        const [, , achou] = ns
        expect(achou).toBe(tiraZeros(q))
        expect(achou).not.toBe(q)
        expect(item.erros[String(achou)]).toBe('esquece-zero-no-quociente')
      }
    }
  })
})

describe('U4 · aula 5: dividir por zero', () => {
  for (const id of ['zero-n1', 'zero-n2']) {
    it(`${id}: 0 ÷ n dá 0; n ÷ 0 não existe`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        const certa = b === 0 ? 'Não existe' : String(a / b)
        expect(escolhida(item)).toBe(certa)
        expect(item.opcoes).toHaveLength(3)
        if (b === 0) {
          expect(item.erros[String(item.opcoes!.indexOf('0'))]).toBe('dividir-por-zero-da-zero')
          expect(item.erros[String(item.opcoes!.indexOf(String(a)))]).toBe('dividir-por-zero-da-o-dividendo')
        } else {
          expect(item.erros[String(item.opcoes!.indexOf('Não existe'))]).toBe('zero-dividido-nao-existe')
        }
      }
    })
  }
  it('zero-n3: a única conta sem resposta, ou a única que dá 0', () => {
    for (const item of itens(g('zero-n3'))) {
      const valores = item.opcoes!.map(calcula)
      const alvo = /não tem resposta/.test(item.enunciado) ? valores.filter((v) => v === undefined) : valores.filter((v) => v === 0)
      expect(alvo).toHaveLength(1)
      const certa = calcula(escolhida(item))
      expect(/não tem resposta/.test(item.enunciado) ? certa === undefined : certa === 0).toBe(true)
    }
  })
})
