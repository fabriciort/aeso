import { describe, expect, it } from 'vitest'
import { GERADORES_U11A } from '@/content/matematica/geradores/porcentagem-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (os trechos em negrito) e refaz a
// conta por conta própria, sem usar as funções do gerador. Todo número vira
// um inteiro em centésimos (o dinheiro em centavos), para comparar sem
// decimais de JavaScript.

const g = (id: string) => GERADORES_U11A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** "1.250" → 125000; "2,5" → 250; "0,05" → 5 (em centésimos). */
function ce(s: string): number {
  const [i, f = ''] = s.replace(/\./g, '').split(',')
  expect(f.length, s).toBeLessThanOrEqual(2)
  return Number(i + f.padEnd(2, '0'))
}
/** Os números de cada trecho em negrito, na ordem, em centésimos. */
function negritos(t: string): number[][] {
  return [...t.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => [...m[1].matchAll(/\d[\d.]*(?:,\d+)?/g)].map((n) => ce(n[0])))
}
/** O trecho em negrito com "%" e o com "R$": a porcentagem (inteira) e o valor em centavos. */
function pctEValor(t: string): { p: number; v: number } {
  const bs = [...t.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
  const p = bs.find((b) => b.includes('%'))!.match(/^(\d+) %/)
  const v = bs.find((b) => b.startsWith('R$ '))!.match(/^R\$ ([\d.]+)$/)
  expect(p, t).not.toBeNull()
  expect(v, t).not.toBeNull()
  return { p: Number(p![1]), v: ce(v![1]) }
}
/** A resposta como o aluno digita, em centésimos: um inteiro como número, um decimal como texto com vírgula. */
function digitada(item: Item): number {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta)).toBe(true)
    return item.resposta * 100
  }
  expect(item.resposta).toMatch(/^\d+,\d?[1-9]$/)
  return ce(item.resposta)
}
/** Nenhum erro previsto vale o mesmo que a resposta certa (0,50 = 0,5). */
function errosDiferentes(item: Item) {
  if (item.formato !== 'numero') return
  const certa = digitada(item)
  for (const k of Object.keys(item.erros)) {
    const [, f = ''] = k.split(',')
    if (f.length <= 2) expect(ce(k), `${k} = ${item.resposta}`).not.toBe(certa)
  }
}
const temErro = (item: Item, id: string) => expect(Object.values(item.erros), String(item.enunciado)).toContain(id)
/** O erro previsto para esta resposta digitada, em centésimos. */
const erroDe = (item: Item, valor: number) => Object.entries(item.erros).find(([k]) => ce(k) === valor)?.[1]

describe('U11 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U11A).toHaveLength(9)
    for (const aula of ['B.U11.A1', 'B.U11.A2', 'B.U11.A3']) {
      expect(GERADORES_U11A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('sem visual no nível 3 e erros diferentes da certa', () => {
    for (const ger of GERADORES_U11A) {
      for (const item of itens(ger)) {
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        errosDiferentes(item)
      }
    }
  })
})

describe('U11 · aula 1: por cento é por cem', () => {
  it('por-cento-n1: a porcentagem pintada na grade', () => {
    for (const item of itens(g('por-cento-n1'))) {
      const e = item.visual!.estado as { pintadas: number }
      expect(item.visual!.modelo).toBe('grade')
      expect(negritos(item.enunciado)).toEqual([[10000]])
      // Cada quadradinho é 1 de 100: a porcentagem é o número de quadradinhos.
      expect(digitada(item)).toBe(e.pintadas * 100)
      expect(e.pintadas).toBeGreaterThan(10)
      expect(e.pintadas % 10).not.toBe(0)
      expect(erroDe(item, (Math.floor(e.pintadas / 10) + (e.pintadas % 10)) * 100)).toBe('conta-grupos-como-unidades')
    }
  })
  it('por-cento-n2: de porcentagem para decimal e de volta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('por-cento-n2'))) {
      const ida = item.enunciado.match(/^Escreva \*\*(\d+) %\*\* como número decimal\.$/)
      const volta = item.enunciado.match(/^O número \*\*(\d+,\d+)\*\* é quantos por cento\?$/)
      expect(ida || volta, item.enunciado).toBeTruthy()
      if (ida) {
        tipos.add('ida')
        const p = Number(ida[1])
        // p % = p centésimos.
        expect(digitada(item)).toBe(p)
        expect(item.erros[String(p)]).toBe('porcentagem-como-numero-inteiro')
        if (p < 10) expect(erroDe(item, p * 10)).toBe('esquece-zero-decimal')
      } else {
        tipos.add('volta')
        const centesimos = ce(volta![1])
        expect(digitada(item)).toBe(centesimos * 100)
        if (centesimos < 10) expect(erroDe(item, centesimos * 1000)).toBe('esquece-zero-decimal')
      }
    }
    expect(tipos).toEqual(new Set(['ida', 'volta']))
  })
  it('por-cento-n3: "a em cada b" vira porcentagem', () => {
    for (const item of itens(g('por-cento-n3'))) {
      const m = item.enunciado.match(/\*\*(\d+) (?:em|de) cada (\d+)\*\*/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b] = [Number(m![1]), Number(m![2])]
      expect(a).toBeLessThan(b)
      // a de cada b = resposta de cada 100: resposta × b = a × 100.
      expect((digitada(item) / 100) * b).toBe(a * 100)
      temErro(item, 'fracao-vira-virgula')
    }
  })
})

describe('U11 · aula 2: porcentagem de um valor', () => {
  /** p % de R$ v: v × p ÷ 100 reais, que são v (em reais) × p centavos. */
  function deUmValor(item: Item) {
    const { p, v } = pctEValor(item.enunciado)
    expect(item.formato).toBe('numero')
    expect(digitada(item) * 100).toBe(v * p)
    // R$ 10 como 10 % de R$ 80 (menos quando é mesmo a resposta: 10 % de R$ 100).
    if (digitada(item) !== p * 100) expect(item.erros[String(p)]).toBe('porcentagem-como-numero-inteiro')
    return { p, v }
  }
  it('porcentagem-de-valor-n1: 10 % ou 50 %, com a barra', () => {
    const ps = new Set<number>()
    for (const item of itens(g('porcentagem-de-valor-n1'))) {
      const { p } = deUmValor(item)
      ps.add(p)
      const e = item.visual!.estado as { partes: number; pintadas: number; rotulo: string }
      expect(e.partes).toBe(10)
      expect(e.pintadas * 10).toBe(p)
      expect(e.rotulo).toBe(`${p} %`)
    }
    expect(ps).toEqual(new Set([10, 50]))
  })
  it('porcentagem-de-valor-n2: 1 %, 5 %, 20 % e 25 %, com a tabela', () => {
    const ps = new Set<number>()
    for (const item of itens(g('porcentagem-de-valor-n2'))) {
      const { p, v } = deUmValor(item)
      ps.add(p)
      const t = (item.visual!.estado as { tabela: { linhas: { valores: (number | string)[] }[] } }).tabela
      expect(t.linhas[0].valores[0]).toBe(100)
      expect(t.linhas[0].valores.at(-1)).toBe(p)
      expect(t.linhas[1].valores[0]).toBe(v / 100)
      if (p === 1) expect(erroDe(item, v / 10)).toBe('troca-10-e-1-por-cento')
      if (p !== 1) temErro(item, 'divide-pelo-numero-da-porcentagem')
    }
    expect(ps).toEqual(new Set([1, 5, 20, 25]))
  })
  it('porcentagem-de-valor-n3: porcentagens montadas, numa situação', () => {
    for (const item of itens(g('porcentagem-de-valor-n3'))) {
      const { p, v } = deUmValor(item)
      expect([1, 10, 50, 100]).not.toContain(p)
      // Dividir por 10 no lugar de 100: o resultado dez vezes maior.
      expect(erroDe(item, (v * p) / 10)).toBe('troca-10-e-1-por-cento')
    }
  })
})

describe('U11 · aula 3: aumento e desconto', () => {
  const ehDesconto = (t: string) => /desconto|OFF/.test(t)
  const ehAumento = (t: string) => /subiu|subir|mais cara/.test(t)
  it('aumento-desconto-n1: 10 % a menos ou a mais, com a barra', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('aumento-desconto-n1'))) {
      const { p, v } = pctEValor(item.enunciado)
      expect(p).toBe(10)
      const desc = ehDesconto(item.enunciado)
      expect(desc).not.toBe(ehAumento(item.enunciado))
      tipos.add(desc ? 'desconto' : 'aumento')
      // O valor final, em centavos: v ∓ v ÷ 10.
      expect(digitada(item)).toBe(desc ? v - v / 10 : v + v / 10)
      expect(erroDe(item, v / 10)).toBe(desc ? 'desconto-como-preco-final' : 'fator-de-aumento-sem-o-um')
      const e = item.visual!.estado as { pintadas: number }
      expect(e.pintadas).toBe(desc ? 9 : 11)
    }
    expect(tipos).toEqual(new Set(['desconto', 'aumento']))
  })
  it('aumento-desconto-n2: escolher o fator', () => {
    for (const item of itens(g('aumento-desconto-n2'))) {
      const [[pc]] = negritos(item.enunciado)
      const p = pc / 100
      const desc = ehDesconto(item.enunciado)
      expect(desc).not.toBe(ehAumento(item.enunciado))
      expect(item.formato).toBe('escolha')
      const fatores = item.opcoes!.map((o) => {
        expect(o).toMatch(/^× \d+(,\d+)?$/)
        return ce(o.slice(2))
      })
      expect(new Set(fatores).size).toBe(fatores.length)
      // O fator em centésimos: 100 − p ou 100 + p.
      expect(fatores[item.resposta as number]).toBe(desc ? 100 - p : 100 + p)
      const soP = fatores.indexOf(p)
      expect(item.erros[String(soP)]).toBe(desc ? 'desconto-como-preco-final' : 'fator-de-aumento-sem-o-um')
    }
  })
  it('aumento-desconto-n3: o valor final numa situação', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('aumento-desconto-n3'))) {
      const { p, v } = pctEValor(item.enunciado)
      const desc = ehDesconto(item.enunciado)
      expect(desc).not.toBe(ehAumento(item.enunciado))
      tipos.add(desc ? 'desconto' : 'aumento')
      // v centavos × (100 ∓ p) ÷ 100.
      expect(digitada(item) * 100).toBe(v * (desc ? 100 - p : 100 + p))
      expect(erroDe(item, (v * p) / 100)).toBe(desc ? 'desconto-como-preco-final' : 'fator-de-aumento-sem-o-um')
      if (desc) expect(digitada(item)).toBeLessThan(v)
      else expect(digitada(item)).toBeGreaterThan(v)
    }
    expect(tipos).toEqual(new Set(['desconto', 'aumento']))
  })
})
