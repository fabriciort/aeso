import { describe, expect, it } from 'vitest'
import { GERADORES_U10A } from '@/content/matematica/geradores/proporcao-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (os trechos em negrito) e refaz a
// conta por conta própria, sem usar as funções do gerador. Todo número vira
// um inteiro em milionésimos, para comparar sem decimais de JavaScript.

const g = (id: string) => GERADORES_U10A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const ESC = 6
/** "1.250" → 1250 milhões de milionésimos; "2,5" → 2.500.000. */
function mi(s: string): number {
  const [i, f = ''] = s.replace(/\./g, '').split(',')
  expect(f.length, s).toBeLessThanOrEqual(ESC)
  return Number(i + f.padEnd(ESC, '0'))
}
/** Os números de cada trecho em negrito, na ordem. */
function negritos(t: string): number[][] {
  return [...t.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => [...m[1].matchAll(/\d[\d.]*(?:,\d+)?/g)].map((n) => mi(n[0])))
}
/** A resposta como o aluno digita, em milionésimos: um inteiro como número, um decimal como texto com vírgula. */
function digitada(item: Item): number {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta)).toBe(true)
    return item.resposta * 10 ** ESC
  }
  expect(item.resposta).toMatch(/^\d+,\d*[1-9]$/)
  return mi(item.resposta)
}
/** Nenhum erro previsto vale o mesmo que a resposta certa (0,50 = 0,5). */
function errosDiferentes(item: Item) {
  if (item.formato !== 'numero') return
  const certa = digitada(item)
  for (const k of Object.keys(item.erros)) expect(mi(k), `${k} = ${item.resposta}`).not.toBe(certa)
}
const temErro = (item: Item, id: string) => expect(Object.values(item.erros), String(item.enunciado)).toContain(id)
/** p × q, com os dois em milionésimos: o resultado também em milionésimos. */
const vezes = (p: number, q: number) => (p * q) / 10 ** ESC
const U = 10 ** ESC

describe('U10 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U10A).toHaveLength(9)
    for (const aula of ['B.U10.A1', 'B.U10.A2', 'B.U10.A3']) {
      expect(GERADORES_U10A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('sem visual no nível 3 e erros diferentes da certa', () => {
    for (const ger of GERADORES_U10A) {
      for (const item of itens(ger)) {
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        errosDiferentes(item)
      }
    }
  })
})

describe('U10 · aula 1: razão', () => {
  it('razao-n1: água ÷ suco, com a jarra na barra', () => {
    for (const item of itens(g('razao-n1'))) {
      const [[a], [b]] = negritos(item.enunciado)
      expect(item.formato).toBe('numero')
      expect(vezes(digitada(item), a)).toBe(b)
      if (b - a !== digitada(item)) temErro(item, 'pensa-aditivamente')
      const e = item.visual!.estado as { partes: number; pintadas: number }
      expect([e.pintadas * U, (e.partes - e.pintadas) * U]).toEqual([a, b])
    }
  })
  it('razao-n2: a opção certa segue a ordem da pergunta', () => {
    for (const item of itens(g('razao-n2'))) {
      const m = item.enunciado.match(/^A mistura leva \*\*(\d+) (\S+) de (.+?)\*\* para \*\*(\d+) de (.+?)\*\*\. Qual é a razão de \*\*(.+) para (.+)\*\*\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [, a, , x, b, y, P, Q] = m!
      const qtd: Record<string, string> = { [x]: a, [y]: b }
      expect(new Set([P, Q])).toEqual(new Set([x, y]))
      expect(item.formato).toBe('escolha')
      expect(item.opcoes![item.resposta as number]).toBe(`${qtd[P]} : ${qtd[Q]}`)
      const inv = item.opcoes!.indexOf(`${qtd[Q]} : ${qtd[P]}`)
      expect(inv).toBeGreaterThanOrEqual(0)
      expect(item.erros[String(inv)]).toBe('razao-invertida')
      expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
    }
  })
  it('razao-n3: a razão "por um", às vezes com vírgula', () => {
    let decimais = 0
    for (const item of itens(g('razao-n3'))) {
      const [[a], [b]] = negritos(item.enunciado)
      expect(vezes(digitada(item), a)).toBe(b)
      if (typeof item.resposta === 'string') decimais++
      if (b > a && b - a !== digitada(item)) temErro(item, 'pensa-aditivamente')
    }
    expect(decimais).toBeGreaterThan(50)
  })
})

describe('U10 · aula 2: escala', () => {
  it('escala-n1: do mapa para a verdade, × a escala', () => {
    for (const item of itens(g('escala-n1'))) {
      const [[um, e], [c]] = negritos(item.enunciado)
      expect(um).toBe(U)
      expect(digitada(item)).toBe(vezes(c, e))
      temErro(item, 'pensa-aditivamente')
      const t = (item.visual!.estado as { tabela: { linhas: { valores: (number | string)[] }[]; fator: string } }).tabela
      expect(t.linhas[0].valores).toEqual([1, c / U])
      expect(t.linhas[1].valores).toEqual([e / U, '?'])
      expect(t.fator).toBe(`× ${e / U}`)
    }
  })
  it('escala-n2: planta 1 : 50 ou 1 : 100, a resposta em metros', () => {
    for (const item of itens(g('escala-n2'))) {
      const [[um, n], [c]] = negritos(item.enunciado)
      expect(um).toBe(U)
      // c cm no papel são c × n cm de verdade; em metros, ÷ 100.
      expect(digitada(item) * 100).toBe(vezes(c, n))
      temErro(item, 'escala-unidade-esquecida')
      expect(mi(Object.keys(item.erros).find((k) => item.erros[k] === 'escala-unidade-esquecida')!)).toBe(vezes(c, n))
      expect((item.visual!.estado as { numero: number }).numero * U).toBe(c)
    }
  })
  it('escala-n3: da verdade para o desenho, ÷ a escala', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('escala-n3'))) {
      const nums = negritos(item.enunciado)
      if (/ km\*\*/.test(item.enunciado)) {
        tipos.add('mapa')
        const [[d], [um, e]] = nums
        expect(um).toBe(U)
        expect(vezes(digitada(item), e)).toBe(d)
      } else {
        tipos.add('planta')
        const [[m], [um, n]] = nums
        expect(um).toBe(U)
        // m metros são 100 m centímetros; no papel, ÷ n.
        expect(vezes(digitada(item), n)).toBe(m * 100)
        temErro(item, 'escala-unidade-esquecida')
      }
      temErro(item, 'converte-no-sentido-errado')
    }
    expect(tipos).toEqual(new Set(['mapa', 'planta']))
  })
})

describe('U10 · aula 3: proporção e regra de três', () => {
  /** a está para b como c está para a resposta: resposta × a = b × c. */
  function proporcao(item: Item) {
    const [[a], [b], [c]] = negritos(item.enunciado)
    expect(item.formato).toBe('numero')
    expect(vezes(digitada(item), a)).toBe(vezes(b, c))
    return { a, b, c }
  }
  it('regra-de-tres-n1: a coluna nova é a primeira × um inteiro', () => {
    for (const item of itens(g('regra-de-tres-n1'))) {
      const { a, b, c } = proporcao(item)
      expect(c % a).toBe(0)
      const k = c / a
      const t = (item.visual!.estado as { tabela: { linhas: { valores: (number | string)[] }[]; setas: { rotulo: string }[] } }).tabela
      expect(t.linhas[0].valores).toEqual([a / U, c / U])
      expect(t.linhas[1].valores).toEqual([b / U, '?'])
      expect(t.setas[0].rotulo).toBe(`× ${k}`)
      temErro(item, 'muda-so-um-termo')
      if (a !== b) temErro(item, 'pensa-aditivamente')
    }
  })
  it('regra-de-tres-n2: a coluna nova não é múltipla; passa pelo 1', () => {
    for (const item of itens(g('regra-de-tres-n2'))) {
      const { a, b, c } = proporcao(item)
      expect(c % a).not.toBe(0)
      expect(c).toBeGreaterThan(a)
      const t = (item.visual!.estado as { tabela: { linhas: { valores: (number | string)[] }[] } }).tabela
      expect(t.linhas[0].valores).toEqual([a / U, 1, c / U])
      expect(t.linhas[1].valores).toEqual([b / U, '?', '?'])
      temErro(item, 'pensa-aditivamente')
    }
  })
  it('regra-de-tres-n3: sozinho, com contexto, às vezes com vírgula', () => {
    let decimais = 0
    for (const item of itens(g('regra-de-tres-n3'))) {
      const { a, c } = proporcao(item)
      expect(c).toBeGreaterThan(a)
      if (typeof item.resposta === 'string') {
        decimais++
        expect(item.resposta).toMatch(/,5$/)
      }
    }
    expect(decimais).toBeGreaterThan(30)
  })
})
