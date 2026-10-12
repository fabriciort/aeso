import { describe, expect, it } from 'vitest'
import { GERADORES_U3 } from '@/content/matematica/geradores/multiplicacao'
import { rng } from '@/lib/formation/rng'
import type { Gerador } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado e refaz a conta por conta própria,
// sem usar a resposta do gerador.

const g = (id: string) => GERADORES_U3.find((x) => x.id === id)!
const n = (s: string) => Number(s.replace(/\./g, ''))
const nums = (s: string) => [...s.matchAll(/\d[\d.]*\d|\d/g)].map((m) => n(m[0]))
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** Multiplicação armada feita algarismo por algarismo, sem usar a × b. */
function armada(a: number, b: number): number {
  const da = String(a).split('').reverse().map(Number)
  const db = String(b).split('').reverse().map(Number)
  const res = Array(da.length + db.length + 1).fill(0)
  db.forEach((y, j) => da.forEach((x, i) => (res[i + j] += x * y)))
  for (let k = 0; k < res.length - 1; k++) {
    res[k + 1] += Math.floor(res[k] / 10)
    res[k] %= 10
  }
  return Number(res.reverse().join(''))
}

describe('U3 · geradores', () => {
  it('são 15, três por aula, níveis 1 a 3', () => {
    expect(GERADORES_U3).toHaveLength(15)
    for (const aula of ['B.U3.A1', 'B.U3.A2', 'B.U3.A3', 'B.U3.A4', 'B.U3.A5']) {
      expect(GERADORES_U3.filter((x) => x.aula === aula).map((x) => x.nivel).sort()).toEqual([1, 2, 3])
    }
  })
})

describe('U3 · aula 1: grupos iguais', () => {
  for (const id of ['grupos-n1', 'grupos-n2']) {
    it(`${id}: linhas vezes quantos em cada`, () => {
      for (const item of itens(g(id))) {
        const [a, b] = nums(item.enunciado)
        expect(item.resposta).toBe(armada(a, b))
        expect(item.erros[String(a + b)]).toBe('soma-no-lugar-de-multiplicar')
      }
    })
  }
  it('grupos-n3: grupos iguais multiplicam, comprar mais soma', () => {
    let mult = 0
    for (const item of itens(g('grupos-n3'))) {
      const [x, y] = nums(item.enunciado)
      if (/receitas/.test(item.enunciado)) {
        mult++
        expect(item.resposta).toBe(armada(x, y))
        expect(item.erros[String(x + y)]).toBe('soma-no-lugar-de-multiplicar')
      } else {
        expect(item.resposta).toBe(x + y)
        expect(item.erros[String(armada(x, y))]).toBe('operacao-trocada')
      }
    }
    expect(mult).toBeGreaterThan(50)
    expect(mult).toBeLessThan(250)
  })
})

describe('U3 · aula 2: a tabuada com estratégia', () => {
  it('tabuada-n1: o dobro de 2 × b', () => {
    for (const item of itens(g('tabuada-n1'))) {
      const [dois, b, dado, quatro, b2] = nums(item.enunciado)
      expect([dois, quatro, b2]).toEqual([2, 4, b])
      expect(dado).toBe(b + b)
      expect(item.resposta).toBe(dado + dado)
    }
  })
  it('tabuada-n2: um fato a partir do 5 ou do 10', () => {
    for (const item of itens(g('tabuada-n2'))) {
      const [f, b, dado, alvo] = nums(item.enunciado)
      expect(dado).toBe(armada(f, b))
      const certa = alvo === 6 ? dado + b : dado - b
      expect(alvo).toBe(f === 5 ? 6 : 9)
      expect(item.resposta).toBe(certa)
      expect(item.erros[String(dado)]).toBe('esquece-grupo-extra')
    }
  })
  it('tabuada-n3: fatos de 6 a 9', () => {
    for (const item of itens(g('tabuada-n3'))) {
      const [a, b] = nums(item.enunciado)
      expect(a).toBeGreaterThanOrEqual(6)
      expect(b).toBeGreaterThanOrEqual(6)
      expect(item.resposta).toBe(armada(a, b))
      expect(item.erros[String(a + b)]).toBe('soma-no-lugar-de-multiplicar')
    }
  })
})

describe('U3 · aula 3: multiplicar por 10, 100, 1.000', () => {
  it('vezes-dez-n1: o número com um zero à direita', () => {
    for (const item of itens(g('vezes-dez-n1'))) {
      const [x, f] = nums(item.enunciado)
      expect(f).toBe(10)
      expect(String(item.resposta)).toBe(`${x}0`)
      expect(item.erros[String(x + 10)]).toBe('soma-no-lugar-de-multiplicar')
    }
  })
  it('vezes-dez-n2: zeros contados pelas casas', () => {
    let terminaEmZero = 0
    for (const item of itens(g('vezes-dez-n2'))) {
      const [x, f] = nums(item.enunciado)
      expect([100, 1000]).toContain(f)
      const zeros = f === 100 ? '00' : '000'
      expect(String(item.resposta)).toBe(`${x}${zeros}`)
      expect(item.erros[`${x}${zeros.slice(1)}`]).toBe('conta-zeros-errado')
      expect(item.erros[`${x}${zeros}0`]).toBe('conta-zeros-errado')
      if (x % 10 === 0) terminaEmZero++
    }
    expect(terminaEmZero).toBeGreaterThan(50)
  })
  it('vezes-dez-n3: um número redondo vezes um algarismo', () => {
    for (const item of itens(g('vezes-dez-n3'))) {
      const [c, d] = nums(item.enunciado)
      expect(c % 10).toBe(0)
      expect(item.resposta).toBe(armada(c, d))
      const sig = Number(String(c).replace(/0+$/, ''))
      expect(item.erros[String(armada(sig, d))]).toBe('conta-zeros-errado')
    }
  })
})

describe('U3 · aula 4: quebrar para multiplicar', () => {
  it('distributiva-n1: os dois pedaços somados', () => {
    for (const item of itens(g('distributiva-n1'))) {
      const [a, b, a2, cinco, a3, resto] = nums(item.enunciado)
      expect([a2, a3, cinco]).toEqual([a, a, 5])
      expect(cinco + resto).toBe(b)
      expect(item.resposta).toBe(armada(a, 5) + armada(a, resto))
      expect(item.erros[String(armada(a, 5) + resto)]).toBe('distributiva-parcial')
    }
  })
  for (const id of ['distributiva-n2', 'distributiva-n3']) {
    it(`${id}: um algarismo vezes dois, com o erro da parte esquecida`, () => {
      for (const item of itens(g(id))) {
        const [x, y] = nums(item.enunciado)
        const [a, p] = x < 10 ? [x, y] : [y, x]
        expect(a).toBeLessThan(10)
        expect(p).toBeGreaterThan(10)
        expect(p % 10).not.toBe(0)
        expect(item.resposta).toBe(armada(a, p))
        const dez = p - (p % 10)
        expect(item.erros[String(armada(a, dez) + (p % 10))]).toBe('distributiva-parcial')
      }
    })
  }
})

describe('U3 · aula 5: multiplicação armada', () => {
  it('armada-mult-n1: dois algarismos vezes um, sempre com vai um', () => {
    for (const item of itens(g('armada-mult-n1'))) {
      const [x, d] = nums(item.enunciado)
      expect(item.resposta).toBe(armada(x, d))
      expect(d * (x % 10)).toBeGreaterThanOrEqual(10)
      expect(Object.values(item.erros)).toContain('esquece-reserva')
    }
  })
  it('armada-mult-n1: o erro de somar o vai um antes de multiplicar', () => {
    // 6 × 27 → 362 é o exemplo do catálogo.
    const ex = itens(g('armada-mult-n1')).find((i) => i.enunciado.endsWith('27 × 6'))
    if (ex) expect(ex.erros['362']).toBe('reserva-antes-de-multiplicar')
  })
  for (const id of ['armada-mult-n2', 'armada-mult-n3']) {
    it(`${id}: dois algarismos vezes dois, com o zero de deslocamento`, () => {
      for (const item of itens(g(id))) {
        const [x, y] = nums(item.enunciado)
        expect(x).toBeGreaterThanOrEqual(10)
        expect(y).toBeGreaterThanOrEqual(10)
        expect(item.resposta).toBe(armada(x, y))
        // Sem deslocar: o número de cima vezes cada algarismo de baixo, somados.
        const semZero = x * Math.floor(y / 10) + x * (y % 10)
        const semZero2 = y * Math.floor(x / 10) + y * (x % 10)
        expect([item.erros[String(semZero)], item.erros[String(semZero2)]]).toContain('esquece-deslocar-linha')
      }
    })
  }
})
