import { describe, expect, it } from 'vitest'
import { GERADORES_U8B } from '@/content/matematica/geradores/decimais-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (com vírgula) e refaz a conta por
// conta própria, sem usar as funções do gerador. Para fugir do ponto
// flutuante, todo decimal vira um inteiro de milésimos: 3,75 é 3750.

const g = (id: string) => GERADORES_U8B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** '3,75' → 3750; '10' → 10000. Até 3 casas. */
function mil(t: string): number {
  const [a, b = ''] = t.split(',')
  expect(b.length, `"${t}" tem mais de 3 casas`).toBeLessThanOrEqual(3)
  return Number(a) * 1000 + Number(b.padEnd(3, '0'))
}
/** Os números escritos num texto, na ordem ("R$ 3,75" e "10"). */
const numeros = (s: string) => [...s.matchAll(/\d+(?:,\d+)?/g)].map((m) => m[0])
const casas = (t: string) => (t.includes(',') ? t.split(',')[1].length : 0)
/** A resposta em milésimos: texto com vírgula ou inteiro. */
function valor(item: Item): number {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta)).toBe(true)
    return item.resposta * 1000
  }
  expect(item.resposta, 'decimal com vírgula, sem ponto').toMatch(/^\d+,\d+$/)
  return mil(item.resposta)
}
/** O erro mapeado para a resposta errada que vale `m` milésimos. */
function erroPara(item: Item, m: number): string | undefined {
  const k = Object.keys(item.erros).find((t) => mil(t) === m)
  return k === undefined ? undefined : item.erros[k]
}
/** Nenhuma resposta errada mapeada vale o mesmo que a certa. */
function semErroCerto(item: Item) {
  const certa = valor(item)
  for (const t of Object.keys(item.erros)) expect(mil(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
}
/** Os algarismos colados, sem a vírgula. */
const semVirgula = (t: string) => Number(t.replace(',', ''))

describe('U8 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U8B).toHaveLength(9)
    for (const aula of ['B.U8.A4', 'B.U8.A5', 'B.U8.A6']) {
      expect(GERADORES_U8B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('respostas decimais vêm com vírgula; nenhum erro mapeado é a certa', () => {
    for (const ger of GERADORES_U8B) for (const item of itens(ger)) if (item.formato === 'numero') semErroCerto(item)
  })
})

describe('U8 · aula 4: somar e subtrair', () => {
  const ehSubtracao = (item: Item) => /−|troco|sobraram/.test(item.enunciado)
  for (const id of ['somar-decimais-n1', 'somar-decimais-n2', 'somar-decimais-n3']) {
    it(`${id}: a soma ou o troco estão certos`, () => {
      for (const item of itens(g(id))) {
        const ns = numeros(item.enunciado)
        expect(ns, item.enunciado).toHaveLength(2)
        const [x, y] = ns.map(mil)
        const certa = ehSubtracao(item) ? Math.max(x, y) - Math.min(x, y) : x + y
        expect(valor(item), item.enunciado).toBe(certa)
        expect(certa % 1000, `${item.enunciado}: a resposta é um decimal`).not.toBe(0)
      }
    })
  }
  it('somas: uma parcela com 1 casa e outra com 2; alinhar pela direita e somar o depois da vírgula como inteiro são erros mapeados', () => {
    for (const id of ['somar-decimais-n1', 'somar-decimais-n2', 'somar-decimais-n3']) {
      for (const item of itens(g(id)).filter((i) => !ehSubtracao(i))) {
        const [p, q] = numeros(item.enunciado)
        expect([casas(p), casas(q)].sort()).toEqual([1, 2])
        // Alinhado pela direita: os algarismos somados como inteiros, com 2 casas.
        expect(erroPara(item, (semVirgula(p) + semVirgula(q)) * 10)).toBe('alinha-decimais-pela-direita')
        // O que vem depois da vírgula, somado como inteiro (5 + 25 = 30).
        const [ip, dp] = p.split(',').map(Number)
        const [iq, dq] = q.split(',').map(Number)
        // Quando o número de 1 casa começa com 0 (0,5 + 1,25), os dois erros dão o mesmo número.
        const parte = (ip + iq) * 1000 + (dp + dq) * 10
        const umaCasaComZero = (casas(p) === 1 ? ip : iq) === 0
        expect(erroPara(item, parte)).toBe(umaCasaComZero ? 'alinha-decimais-pela-direita' : 'parte-decimal-como-inteiro')
      }
    }
  })
  it('somar-decimais-n1: sem vai um nos décimos; n2 e n3: com vai um', () => {
    const decimos = (t: string) => Number(t.split(',')[1][0])
    for (const item of itens(g('somar-decimais-n1'))) {
      const [p, q] = numeros(item.enunciado)
      expect(decimos(p) + decimos(q)).toBeLessThanOrEqual(9)
    }
    for (const id of ['somar-decimais-n2', 'somar-decimais-n3']) {
      for (const item of itens(g(id)).filter((i) => !ehSubtracao(i))) {
        const [p, q] = numeros(item.enunciado)
        expect(decimos(p) + decimos(q)).toBeGreaterThanOrEqual(10)
      }
    }
  })
  it('subtrações: o de baixo tem mais casas; copiar as casas que faltam é erro mapeado', () => {
    for (const id of ['somar-decimais-n2', 'somar-decimais-n3']) {
      const subs = itens(g(id)).filter(ehSubtracao)
      expect(subs.length).toBeGreaterThan(50)
      for (const item of subs) {
        const ns = numeros(item.enunciado)
        const [cima, baixo] = mil(ns[0]) > mil(ns[1]) ? ns : [ns[1], ns[0]]
        expect(casas(baixo)).toBeGreaterThan(casas(cima))
        // Copiar: as casas que só existem embaixo descem, e o resto se subtrai casa a casa.
        const copiadas = mil(baixo) % (1000 / 10 ** casas(cima))
        const copia = mil(cima) - (mil(baixo) - copiadas) + copiadas
        expect(erroPara(item, copia), item.enunciado).toBe('copia-casas-que-faltam')
      }
    }
  })
})

describe('U8 · aula 5: multiplicar', () => {
  it('multiplicar-decimais-n1: décimo vezes décimo, e as casas como na soma é erro', () => {
    for (const item of itens(g('multiplicar-decimais-n1'))) {
      const [p, q] = numeros(item.enunciado)
      const a = Number(p.split(',')[1])
      const b = Number(q.split(',')[1])
      expect(p.startsWith('0,') && q.startsWith('0,')).toBe(true)
      expect(valor(item)).toBe(a * b * 10)
      expect(erroPara(item, a * b * 100)).toBe('casas-do-produto-como-na-soma')
      expect(item.visual?.estado.faixas).toEqual([a, b])
    }
  })
  it('multiplicar-decimais-n2: inteiro vezes decimal, com o vai um que separa as partes', () => {
    for (const item of itens(g('multiplicar-decimais-n2'))) {
      const [n, x] = numeros(item.enunciado)
      expect(casas(n)).toBe(0)
      expect(valor(item)).toBe(Number(n) * mil(x))
      const [i, d] = x.split(',')
      // Partes separadas: n × inteira, vírgula, n × decimal.
      const separado = `${Number(n) * Number(i)},${Number(n) * Number(d)}`
      expect(String(Number(n) * Number(d)).length, 'a parte decimal vezes n passa de uma casa').toBeGreaterThan(d.length)
      expect(item.erros[separado]).toBe('multiplica-partes-separadas')
    }
  })
  it('multiplicar-decimais-n3: preço vezes quantidade dá centavos exatos; 2 casas é erro', () => {
    for (const item of itens(g('multiplicar-decimais-n3'))) {
      const [preco, q] = numeros(item.enunciado)
      expect(casas(preco)).toBe(2)
      expect(casas(q)).toBe(1)
      // centavos × décimos = milésimos de real
      const produto = semVirgula(preco) * semVirgula(q)
      expect(valor(item)).toBe(produto)
      expect(casas(String(item.resposta))).toBeLessThanOrEqual(2)
      expect(erroPara(item, produto * 10)).toBe('casas-do-produto-como-na-soma')
    }
  })
})

describe('U8 · aula 6: dividir', () => {
  /** Os algarismos depois da vírgula de a ÷ b, pela conta de inteiros. */
  const depois = (a: number, b: number, n: number) => String(Math.floor((a * 10 ** n) / b) % 10 ** n).padStart(n, '0')
  const so2e5 = (b: number) => {
    while (b % 2 === 0) b /= 2
    while (b % 5 === 0) b /= 5
    return b === 1
  }
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

  it('dividir-decimais-n1: o rateio confere multiplicando; o resto depois da vírgula é erro', () => {
    for (const item of itens(g('dividir-decimais-n1'))) {
      const ns = numeros(item.enunciado).map(Number)
      const total = Math.max(...ns)
      const n = Math.min(...ns)
      expect([2, 4, 5]).toContain(n)
      expect(total % n).not.toBe(0)
      expect(valor(item) * n).toBe(total * 1000)
      expect(item.erros[`${Math.floor(total / n)},${total % n}`]).toBe('resto-vira-decimal')
    }
  })
  it('dividir-decimais-n2: só a dízima, com os algarismos certos, está marcada', () => {
    for (const item of itens(g('dividir-decimais-n2'))) {
      const [a, b] = numeros(item.enunciado).map(Number)
      expect(so2e5(b / gcd(a, b)), `${a} ÷ ${b} termina`).toBe(false)
      const certa = item.opcoes![Number(item.resposta)]
      expect(certa).toBe(`${Math.floor(a / b)},${depois(a, b, 4)}…, e não termina`)
      expect(item.opcoes!.filter((o) => o.includes('…'))).toHaveLength(1)
      const resto = item.opcoes!.indexOf(`${Math.floor(a / b)},${a % b}`)
      expect(item.erros[String(resto)]).toBe('resto-vira-decimal')
      const exata = item.opcoes!.findIndex((o) => o.includes('exato'))
      expect(item.erros[String(exata)]).toBe('dizima-como-exata')
    }
  })
  it('dividir-decimais-n3: quantas vezes um decimal cabe, ou o rateio até o fim', () => {
    for (const item of itens(g('dividir-decimais-n3'))) {
      const ns = numeros(item.enunciado)
      const decimal = ns.find((t) => t.includes(','))
      if (decimal) {
        const total = ns.find((t) => !t.includes(','))!
        expect(mil(decimal)).toBeLessThan(1000)
        expect(typeof item.resposta).toBe('number')
        expect(valor(item) * mil(decimal)).toBe(mil(total) * 1000)
        // Multiplicar no lugar de dividir: o "dividir sempre diminui".
        expect(erroPara(item, (mil(total) * mil(decimal)) / 1000)).toBe('dividir-sempre-diminui')
      } else {
        const [x, y] = ns.map(Number)
        const total = Math.max(x, y)
        const n = Math.min(x, y)
        expect([4, 5, 8]).toContain(n)
        expect(valor(item) * n).toBe(total * 1000)
        expect(item.erros[`${Math.floor(total / n)},${total % n}`]).toBe('resto-vira-decimal')
      }
    }
  })
})
