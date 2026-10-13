import { describe, expect, it } from 'vitest'
import { GERADORES_U9A } from '@/content/matematica/geradores/medidas-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê as medidas do enunciado (do visual, quando o enunciado é o
// desenho) e refaz a conta por conta própria, sem usar as funções do
// gerador. Toda medida vira um inteiro numa unidade bem pequena, para
// comparar sem decimais de JavaScript.

const g = (id: string) => GERADORES_U9A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const semNegrito = (s: string) => s.replace(/\*\*/g, '')

/** A potência de 10 de cada unidade, contada a partir da menor de cada grandeza. */
const EXP: Record<string, number> = {
  mm: 0, cm: 1, dm: 2, m: 3, dam: 4, hm: 5, km: 6,
  'µg': -3, mg: 0, g: 3, kg: 6,
  mL: 0, L: 3,
  'cm²': 0, 'dm²': 2, 'm²': 4,
}
const NOMES: Record<string, string> = {
  quilômetros: 'km', metros: 'm', centímetros: 'cm', milímetros: 'mm',
  quilos: 'kg', gramas: 'g', miligramas: 'mg', litros: 'L', mililitros: 'mL',
  'metros quadrados': 'm²', 'decímetros quadrados': 'dm²', 'centímetros quadrados': 'cm²',
}

/** "1.250" → [1250, 0]; "0,05" → [5, 2]. */
function num(s: string): [number, number] {
  const [i, f = ''] = s.replace(/\./g, '').split(',')
  return [Number(i + f), f.length]
}
/** A medida em 10^-9 da menor unidade da grandeza: sempre um inteiro. */
function base(n: number, d: number, u: string): number {
  const e = EXP[u] - d + 9
  expect(e, `${n}e-${d} ${u}`).toBeGreaterThanOrEqual(0)
  return n * 10 ** e
}
/** As medidas de um texto, na ordem: [número, casas decimais, unidade]. */
function medidas(s: string): [number, number, string][] {
  const re = /(\d[\d.]*(?:,\d+)?) (km|dam|hm|dm|cm²|dm²|m²|cm|mm|mg|kg|µg|mL|m|g|L)(?![\wµ²])/g
  return [...semNegrito(s).matchAll(re)].map((m) => [...num(m[1]), m[2]] as [number, number, string])
}
/** A resposta como o aluno digita: um inteiro como número, um decimal como texto com vírgula. */
function digitada(item: Item): [number, number] {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta)).toBe(true)
    return [item.resposta, 0]
  }
  expect(item.resposta).toMatch(/^\d+,\d*[1-9]$/)
  return num(item.resposta)
}
/** Nenhum erro previsto vale o mesmo que a resposta certa (0,50 = 0,5). */
function errosDiferentes(item: Item) {
  const [n, d] = digitada(item)
  for (const k of Object.keys(item.erros)) {
    const [a, b] = num(k)
    expect(a * 10 ** (12 - b), `${k} = ${item.resposta}`).not.toBe(n * 10 ** (12 - d))
  }
}
/** Conversões: a resposta, na unidade pedida, vale o mesmo que a medida do enunciado. */
function conversao(item: Item, porCasa = 1) {
  const [[n, d, de]] = medidas(item.enunciado)
  const nome = semNegrito(item.enunciado).match(/ em ([a-zíâôúé ]+?)(?: \(|\.)/)![1]
  const para = NOMES[nome]
  expect(para, nome).toBeDefined()
  const [a, b] = digitada(item)
  expect(base(a, b, para)).toBe(base(n, d, de))
  // O quadro de unidades mostra o número do enunciado, na unidade de partida.
  if (item.visual) {
    const m = (item.visual.estado as { medida: { numero: string; de: string; porCasa?: number } }).medida
    expect(m.de).toBe(de)
    expect(num(m.numero)).toEqual([n, d])
    expect(m.porCasa ?? 1).toBe(porCasa)
  }
  errosDiferentes(item)
  return { de, para, n, d }
}
const temErro = (item: Item, id: string) => expect(Object.values(item.erros), String(item.enunciado)).toContain(id)

describe('U9 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U9A).toHaveLength(9)
    for (const aula of ['B.U9.A1', 'B.U9.A2', 'B.U9.A3']) {
      expect(GERADORES_U9A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('respostas digitadas, sem visual no nível 3 e erros diferentes da certa', () => {
    for (const ger of GERADORES_U9A) {
      for (const item of itens(ger)) {
        expect(item.formato).toBe('numero')
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        errosDiferentes(item)
      }
    }
  })
})

describe('U9 · aula 1: comprimento', () => {
  it('comprimento-n1: para uma unidade menor, o número cresce', () => {
    for (const item of itens(g('comprimento-n1'))) {
      const { de, para } = conversao(item)
      expect(EXP[para]).toBeLessThan(EXP[de])
      expect(typeof item.resposta).toBe('number')
      temErro(item, 'converte-no-sentido-errado')
      temErro(item, 'fator-de-conversao-errado')
    }
  })
  it('comprimento-n2: para uma unidade maior, o número diminui', () => {
    for (const item of itens(g('comprimento-n2'))) {
      const { de, para } = conversao(item)
      expect(EXP[para]).toBeGreaterThan(EXP[de])
      temErro(item, 'converte-no-sentido-errado')
    }
  })
  it('comprimento-n3: medidas em unidades diferentes, somadas ou tiradas', () => {
    for (const item of itens(g('comprimento-n3'))) {
      const t = semNegrito(item.enunciado)
      const [[n1, d1, u1], [n2, d2, u2]] = medidas(t)
      expect(u1).not.toBe(u2)
      const para = t.includes('em centímetros') ? 'cm' : 'm'
      const tira = t.includes('sobrou')
      const total = tira ? base(n1, d1, u1) - base(n2, d2, u2) : base(n1, d1, u1) + base(n2, d2, u2)
      expect(total).toBeGreaterThan(0)
      expect(base(item.resposta as number, 0, para)).toBe(total)
      temErro(item, 'mistura-unidades')
    }
  })
})

describe('U9 · aula 2: massa e capacidade', () => {
  it('massa-capacidade-n1: kg, L e g para a unidade de mil vezes menor', () => {
    for (const item of itens(g('massa-capacidade-n1'))) {
      const { de, para } = conversao(item)
      expect(EXP[de] - EXP[para]).toBe(3)
      expect(typeof item.resposta).toBe('number')
      temErro(item, 'fator-de-conversao-errado')
    }
  })
  it('massa-capacidade-n2: g, mL e mg para a unidade de mil vezes maior', () => {
    for (const item of itens(g('massa-capacidade-n2'))) {
      const { de, para } = conversao(item)
      expect(EXP[para] - EXP[de]).toBe(3)
      temErro(item, 'converte-no-sentido-errado')
    }
  })
  it('massa-capacidade-n3: copos, comprimidos e microgramas', () => {
    for (const item of itens(g('massa-capacidade-n3'))) {
      const t = semNegrito(item.enunciado)
      const ms = medidas(t)
      const [a, b] = digitada(item)
      if (t.includes('copos')) {
        const [[ng, dg, ug], [nc, dc, uc]] = ms
        // Copos × tamanho do copo = a garrafa.
        expect(b).toBe(0)
        expect(a * base(nc, dc, uc)).toBe(base(ng, dg, ug))
        expect(a).toBeGreaterThan(1)
      } else if (t.includes('caixa')) {
        const [[nm, dm, um]] = ms
        const qtd = Number(t.match(/com (\d+) comprimidos/)![1])
        expect(base(a, b, 'g')).toBe(qtd * base(nm, dm, um))
      } else {
        const [[nm, dm, um]] = ms
        expect(um).toBe('mg')
        expect(b).toBe(0)
        expect(base(a, 0, 'µg')).toBe(base(nm, dm, um))
      }
    }
  })
})

describe('U9 · aula 3: área', () => {
  it('area-n1: a área do chão de quadradinhos de 1 m²', () => {
    for (const item of itens(g('area-n1'))) {
      const { linhas, colunas } = item.visual!.estado as { linhas: number; colunas: number }
      let conta = 0
      for (let i = 0; i < linhas; i++) for (let j = 0; j < colunas; j++) conta++
      expect(item.resposta).toBe(conta)
      expect(2 * (linhas + colunas)).not.toBe(conta)
      expect(item.erros[String(2 * (linhas + colunas))]).toBe('confunde-area-perimetro')
    }
  })
  it('area-n2: m², dm² e cm², com 2 algarismos por casa', () => {
    for (const item of itens(g('area-n2'))) {
      conversao(item, 2)
      temErro(item, 'converte-area-como-comprimento')
    }
  })
  it('area-n3: tapete, caixas de piso e preço por m²', () => {
    for (const item of itens(g('area-n3'))) {
      const t = semNegrito(item.enunciado)
      const ms = medidas(t)
      const [a, b] = digitada(item)
      // Os lados em milímetros (inteiros); a área em mm².
      const lado = ([n, d, u]: [number, number, string]) => base(n, d, u) / 10 ** 9
      if (t.includes('tapete')) {
        const area = lado(ms[0]) * lado(ms[1])
        // m² com b casas decimais → mm²: × 10^6 ÷ 10^b.
        expect(a * 10 ** (6 - b)).toBe(area)
        temErro(item, 'mistura-unidades')
      } else if (t.includes('caixa')) {
        const area = lado(ms[0]) * lado(ms[1])
        const caixa = ms[2][0] * 10 ** 6
        expect(ms[2][2]).toBe('m²')
        // O menor número de caixas que cobre o chão.
        expect(a * caixa).toBeGreaterThanOrEqual(area)
        expect((a - 1) * caixa).toBeLessThan(area)
      } else {
        const preco = Number(t.match(/R\$ (\d+)/)![1])
        const area = (lado(ms[0]) * lado(ms[1])) / 10 ** 6
        expect(a).toBe(area * preco)
        temErro(item, 'confunde-area-perimetro')
      }
    }
  })
})
