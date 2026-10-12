import { describe, expect, it } from 'vitest'
import { GERADORES_U10B } from '@/content/matematica/geradores/proporcao-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (e, na escolha, as opções) e refaz
// a conta por conta própria, sem usar as funções do gerador. Para fugir do
// ponto flutuante, todo número vira um inteiro de milésimos: 2,5 é 2.500 e
// R$ 4,80 é 4.800. As contas são feitas em BigInt.

const g = (id: string) => GERADORES_U10B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const ESCALA = BigInt(1000)
const ZERO = BigInt(0)
/** '2,5' → 2.500; '2.000' → 2.000.000 (em BigInt). Até 3 casas. */
function mili(t: string): bigint {
  const [a, b = ''] = t.replace(/\./g, '').split(',')
  expect(b.length, `"${t}" tem mais de 3 casas`).toBeLessThanOrEqual(3)
  return BigInt(a) * ESCALA + BigInt(b.padEnd(3, '0'))
}
/** Os números escritos num texto, na ordem, com milhar e vírgula ("2.000", "4,80"). */
const numeros = (s: string) => [...s.matchAll(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g)].map((m) => mili(m[0]))
/** A resposta em milésimos: texto com vírgula ou inteiro. */
function valor(item: Item): bigint {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta), `${item.enunciado}: resposta ${item.resposta}`).toBe(true)
    return BigInt(item.resposta) * ESCALA
  }
  expect(item.resposta, 'decimal com vírgula, sem ponto').toMatch(/^\d+,\d+$/)
  return mili(item.resposta)
}
/** O erro mapeado para a resposta errada que vale `m` milésimos. */
function erroPara(item: Item, m: bigint): string | undefined {
  const k = Object.keys(item.erros).find((t) => mili(t) === m)
  return k === undefined ? undefined : item.erros[k]
}
/** a × b ÷ c, os três em milésimos, de volta em milésimos; undefined se não der exato em milésimos. */
function vezesSobre(a: bigint, b: bigint, c: bigint): bigint | undefined {
  const num = a * b
  return num % c === ZERO ? num / c : undefined
}

describe('U10 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U10B).toHaveLength(9)
    for (const aula of ['B.U10.A4', 'B.U10.A5', 'B.U10.A6']) {
      expect(GERADORES_U10B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('nenhum erro mapeado vale a certa; respostas decimais vêm com vírgula', () => {
    for (const ger of GERADORES_U10B) {
      for (const item of itens(ger)) {
        if (item.formato !== 'numero') continue
        const certa = valor(item)
        expect(certa > ZERO, item.enunciado).toBe(true)
        for (const t of Object.keys(item.erros)) expect(mili(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
      }
    }
  })
  it('nível 3 sem visual; níveis 1 e 2 com a tabela', () => {
    for (const id of ['inversa-n3', 'taxa-unitaria-n3', 'concentracao-n3']) for (const item of itens(g(id))) expect(item.visual).toBeUndefined()
    for (const id of ['inversa-n1', 'inversa-n2', 'taxa-unitaria-n1', 'taxa-unitaria-n2', 'concentracao-n1', 'concentracao-n2']) {
      for (const item of itens(g(id))) {
        expect(item.visual?.modelo).toBe('livre')
        const t = item.visual!.estado.tabela as { linhas: { valores: unknown[] }[] }
        expect(t.linhas.length).toBeGreaterThanOrEqual(2)
        expect(item.visual!.esboco).toBeTruthy()
      }
    }
  })
})

describe('U10 · aula 4: inversamente proporcional', () => {
  for (const id of ['inversa-n1', 'inversa-n2', 'inversa-n3']) {
    it(`${id}: o produto dos dois primeiros, dividido pelo terceiro`, () => {
      for (const item of itens(g(id))) {
        const ns = numeros(item.enunciado)
        expect(ns, item.enunciado).toHaveLength(3)
        const [a, b, c] = ns
        // a × b é o que não muda (o trabalho todo, ou a distância).
        expect(valor(item) * c, item.enunciado).toBe(a * b)
        // A regra de três direta, quando dá conta exata, é erro mapeado.
        const obra = /operários/.test(item.enunciado)
        const direta = obra ? vezesSobre(a, c, b) : vezesSobre(b, c, a)
        if (direta !== undefined && direta % BigInt(10) === ZERO) expect(erroPara(item, direta), item.enunciado).toBe('regra-de-tres-direta-na-inversa')
      }
    })
  }
  it('inversa-n1: o dobro ou o triplo, e a direta sempre mapeada', () => {
    for (const item of itens(g('inversa-n1'))) {
      const [x, t, y] = numeros(item.enunciado)
      const k = y / x
      expect(y % x, item.enunciado).toBe(ZERO)
      expect([BigInt(2), BigInt(3)]).toContain(k)
      expect(erroPara(item, t * k)).toBe('regra-de-tres-direta-na-inversa')
      // 3 torneiras a mais, 3 horas a menos.
      const aditivo = t - (y - x)
      if (aditivo > ZERO && aditivo !== valor(item)) expect(erroPara(item, aditivo)).toBe('pensa-aditivamente')
    }
  })
  it('inversa-n2: menos gente, ou um fator que não é inteiro', () => {
    for (const item of itens(g('inversa-n2'))) {
      const [x, , y] = numeros(item.enunciado)
      expect(y < x || y % x !== ZERO, item.enunciado).toBe(true)
    }
  })
  it('inversa-n3: velocidade e tempo, e operários para um prazo, os dois aparecem', () => {
    const its = itens(g('inversa-n3'))
    expect(its.filter((i) => /km\/h/.test(i.enunciado)).length).toBeGreaterThan(80)
    expect(its.filter((i) => /operários/.test(i.enunciado)).length).toBeGreaterThan(80)
  })
})

describe('U10 · aula 5: taxa unitária', () => {
  it('taxa-unitaria-n1: o valor dividido pela quantidade', () => {
    for (const item of itens(g('taxa-unitaria-n1'))) {
      const [q, v] = numeros(item.enunciado)
      expect(item.enunciado).toMatch(/1 (kg|L|h)\?$/)
      expect(valor(item) * q, item.enunciado).toBe(v * ESCALA)
      expect(erroPara(item, (v * q) / ESCALA)).toBe('operacao-trocada')
      expect(erroPara(item, v - (q - ESCALA))).toBe('pensa-aditivamente')
    }
  })
  it('taxa-unitaria-n2: a certa é o pacote de quilo (ou litro) mais barato', () => {
    let grande = 0
    let pequeno = 0
    for (const item of itens(g('taxa-unitaria-n2'))) {
      const [a, pa, b, pb] = numeros(item.enunciado)
      const u = item.enunciado.match(/ (kg|L) por/)![1]
      // Preço por unidade sem dividir: pa ÷ a < pb ÷ b quando pa × b < pb × a.
      expect(pa * b, `${item.enunciado}: empate`).not.toBe(pb * a)
      expect(pa < pb, `${item.enunciado}: o pacote grande custa mais no total`).toBe(true)
      const grandeGanha = pb * a < pa * b
      if (grandeGanha) grande++
      else pequeno++
      const certa = `No de ${(grandeGanha ? b : a) / ESCALA} ${u}`
      const errada = `No de ${(grandeGanha ? a : b) / ESCALA} ${u}`
      expect(item.opcoes![item.resposta as number], item.enunciado).toBe(certa)
      const i = item.opcoes!.indexOf(errada)
      expect(item.erros[String(i)], item.enunciado).toBe(grandeGanha ? 'compara-preco-sem-taxa-unitaria' : 'maior-pacote-sempre-mais-barato')
      expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
    }
    expect(grande).toBeGreaterThan(100)
    expect(pequeno).toBeGreaterThan(100)
  })
  it('taxa-unitaria-n3: a taxa vezes a quantidade nova', () => {
    for (const item of itens(g('taxa-unitaria-n3'))) {
      const [q1, v1, q2] = numeros(item.enunciado)
      expect(valor(item) * q1, item.enunciado).toBe(v1 * q2)
      expect(q2 % q1 === ZERO || q1 % q2 === ZERO, `${item.enunciado}: o fator não é inteiro`).toBe(false)
      const aditivo = v1 + (q2 - q1)
      if (aditivo > ZERO) expect(erroPara(item, aditivo), item.enunciado).toBe('pensa-aditivamente')
    }
  })
})

describe('U10 · aula 6: concentração e diluição', () => {
  it('concentracao-n1: mg/mL vezes mL, ou mg dividido por mL', () => {
    for (const item of itens(g('concentracao-n1'))) {
      const [p, q] = numeros(item.enunciado)
      if (/Quantos mg há/.test(item.enunciado)) {
        expect(valor(item), item.enunciado).toBe((p * q) / ESCALA)
        expect(erroPara(item, p + q)).toBe('soma-no-lugar-de-multiplicar')
      } else {
        expect(item.enunciado).toMatch(/em cada mL\?$/)
        expect(valor(item) * q, item.enunciado).toBe(p * ESCALA)
        expect(erroPara(item, (p * q) / ESCALA)).toBe('operacao-trocada')
      }
    }
  })
  it('concentracao-n2: o soluto fica; a concentração cai na razão do volume', () => {
    let conc = 0
    let sol = 0
    for (const item of itens(g('concentracao-n2'))) {
      const [v, c, v2] = numeros(item.enunciado)
      expect(v2 % v, 'o volume vai a um múltiplo').toBe(ZERO)
      if (/Quantos mg\/mL/.test(item.enunciado)) {
        conc++
        expect(valor(item) * v2, item.enunciado).toBe(c * v)
        expect(erroPara(item, (c * v2) / v)).toBe('regra-de-tres-direta-na-inversa')
      } else {
        sol++
        expect(item.enunciado).toMatch(/mg de soluto há agora\?$/)
        expect(valor(item), item.enunciado).toBe((c * v) / ESCALA)
        expect(erroPara(item, (c * v2) / ESCALA)).toBe('diluir-muda-o-soluto')
      }
    }
    expect(conc).toBeGreaterThan(100)
    expect(sol).toBeGreaterThan(100)
  })
  it('concentracao-n3: concentração × volume igual antes e depois', () => {
    const modos = { final: 0, forte: 0, agua: 0 }
    for (const item of itens(g('concentracao-n3'))) {
      const ns = numeros(item.enunciado)
      expect(ns, item.enunciado).toHaveLength(3)
      if (/mL de água junta\?$/.test(item.enunciado)) {
        modos.agua++
        const [v1, c1, c2] = ns
        // Volume final: c1 × v1 ÷ c2; a água é o que falta.
        const vf = (c1 * v1) / c2
        expect((c1 * v1) % c2, 'volume final exato').toBe(ZERO)
        expect(valor(item), item.enunciado).toBe(vf - v1)
        expect(erroPara(item, vf)).toBe('esquece-volume-do-concentrado')
      } else if (/Quantos mL dela entram\?$/.test(item.enunciado)) {
        modos.forte++
        const [v2, c2, c1] = ns
        expect(valor(item) * c1, item.enunciado).toBe(v2 * c2)
        expect(valor(item) < v2, 'entra menos que o volume final').toBe(true)
      } else {
        modos.final++
        expect(item.enunciado).toMatch(/Quantos mg\/mL fica\?$/)
        const [v1, c1, v2] = ns
        expect(v2 > v1, 'o volume cresce').toBe(true)
        expect(valor(item) * v2, item.enunciado).toBe(c1 * v1)
        const direta = vezesSobre(c1, v2, v1)
        if (direta !== undefined && direta % BigInt(10) === ZERO) expect(erroPara(item, direta)).toBe('regra-de-tres-direta-na-inversa')
      }
    }
    expect(modos.final).toBeGreaterThan(60)
    expect(modos.forte).toBeGreaterThan(60)
    expect(modos.agua).toBeGreaterThan(60)
  })
})
