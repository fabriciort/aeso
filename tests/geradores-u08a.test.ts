import { describe, expect, it } from 'vitest'
import { GERADORES_U8A } from '@/content/matematica/geradores/decimais-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (do visual, quando o enunciado é o
// desenho) e das opções, e refaz a conta por conta própria, sem usar as
// funções do gerador. Os decimais são comparados em centésimos inteiros.

const g = (id: string) => GERADORES_U8A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
const semNegrito = (s: string) => s.replace(/\*\*/g, '')

/** "3,07" → 307 centésimos; "0,5" → 50; "4" → 400. */
function cent(s: string): number {
  const [i, f = ''] = s.trim().split(',')
  expect(f.length).toBeLessThanOrEqual(2)
  return Number(i) * 100 + Number((f + '00').slice(0, 2))
}
/** Todos os decimais com vírgula de um texto, na ordem. */
const decimais = (s: string) => [...semNegrito(s).matchAll(/\d+,\d+/g)].map((m) => m[0])
const fracao = (s: string) => {
  const m = s.match(/\\frac\{(\d+)\}\{(\d+)\}/)!
  return [Number(m[1]), Number(m[2])] as [number, number]
}
/** A resposta digitada tem de ter vírgula (o teclado da tela abre com ela). */
const respostaDecimal = (item: Item) => {
  expect(typeof item.resposta).toBe('string')
  expect(String(item.resposta)).toMatch(/^\d+,\d{1,2}$/)
  return cent(String(item.resposta))
}
/** Nenhum erro previsto vale o mesmo que a resposta certa (0,50 = 0,5). */
const errosDiferentes = (item: Item) => {
  const num = (x: string) => Number(x.replace(',', '.'))
  for (const k of Object.keys(item.erros)) expect(num(k), `${k} = ${item.resposta}`).not.toBe(num(String(item.resposta)))
}
/** Arredonda centésimos ao décimo mais perto, com o empate para cima, contando a distância. */
function aoDecimo(h: number): number {
  const baixo = h - (h % 10)
  return h - baixo >= 5 ? baixo + 10 : baixo
}

describe('U8 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U8A).toHaveLength(9)
    for (const aula of ['B.U8.A1', 'B.U8.A2', 'B.U8.A3']) {
      expect(GERADORES_U8A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('opções únicas e erros apontando para opções erradas', () => {
    for (const ger of GERADORES_U8A) {
      for (const item of itens(ger)) {
        if (item.formato !== 'escolha') {
          if (typeof item.resposta === 'string') errosDiferentes(item)
          continue
        }
        expect(new Set(item.opcoes).size, ger.id).toBe(item.opcoes!.length)
        expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
        for (const k of Object.keys(item.erros)) expect(Number(k)).toBeLessThan(item.opcoes!.length)
      }
    }
  })
})

describe('U8 · aula 1: décimos e centésimos', () => {
  it('decimos-centesimos-n1: o número pintado na grade', () => {
    for (const item of itens(g('decimos-centesimos-n1'))) {
      const { pintadas } = item.visual!.estado as { pintadas: number }
      expect(pintadas).toBeGreaterThan(0)
      expect(pintadas).toBeLessThan(100)
      expect(respostaDecimal(item)).toBe(pintadas)
      // Só décimos: o erro de pôr o algarismo nos centésimos. Só centésimos: o zero esquecido.
      if (pintadas % 10 === 0) expect(item.erros[`0,0${pintadas / 10}`]).toBe('troca-decimo-centesimo')
      if (pintadas < 10) expect(item.erros[`0,${pintadas}`]).toBe('esquece-zero-decimal')
    }
  })
  it('decimos-centesimos-n2: reais e centavos com vírgula', () => {
    for (const item of itens(g('decimos-centesimos-n2'))) {
      const m = semNegrito(item.enunciado).match(/(\d+) (?:real|reais) e (\d+) centavos?/)!
      const reais = Number(m[1])
      const centavos = Number(m[2])
      expect(centavos).toBeLessThan(100)
      expect(respostaDecimal(item)).toBe(100 * reais + centavos)
      expect(String(item.resposta).split(',')[1]).toHaveLength(2)
      if (centavos < 10) expect(item.erros[`${reais},${centavos}`]).toBe('esquece-zero-decimal')
    }
  })
  it('decimos-centesimos-n3: o que quer dizer o algarismo', () => {
    for (const item of itens(g('decimos-centesimos-n3'))) {
      const m = semNegrito(item.enunciado).match(/R\$ (\d),(\d)(\d)\. O que quer dizer o (\d)\?/)!
      const [a, b, c, d] = m.slice(1).map(Number)
      expect(new Set([a, b, c]).size).toBe(3)
      expect([b, c]).toContain(d)
      const centavos = d === b ? 10 * d : d
      // A opção certa diz quantos centavos o algarismo vale.
      const certa = escolhida(item)
      expect(Number(certa.match(/(\d+) centavos/)![1])).toBe(centavos)
      expect(certa).toMatch(d === b ? /décimos/ : /centésimos/)
      const trocada = item.opcoes!.findIndex((o) => o.includes(d === b ? 'centésimos' : 'décimos'))
      expect(item.erros[String(trocada)]).toBe('troca-decimo-centesimo')
    }
  })
})

describe('U8 · aula 2: fração ↔ decimal', () => {
  for (const id of ['fracao-decimal-n1', 'fracao-decimal-n2']) {
    it(`${id}: a fração escrita como decimal`, () => {
      for (const item of itens(g(id))) {
        const [n, d] = fracao(item.enunciado)
        expect(n).toBeLessThan(d)
        // n/d = x/100: o decimal em centésimos.
        expect((n * 100) % d).toBe(0)
        expect(respostaDecimal(item)).toBe((n * 100) / d)
        if (id === 'fracao-decimal-n1') expect([10, 100]).toContain(d)
        expect(item.erros[`${n},${d}`]).toBe('fracao-vira-virgula')
        if (id === 'fracao-decimal-n2' && n === 1 && cent(`0,${d}`) !== (n * 100) / d) expect(item.erros[`0,${d}`]).toBe('denominador-como-decimal')
      }
    })
  }
  it('fracao-decimal-n3: a mesma medida, nos dois sentidos', () => {
    for (const item of itens(g('fracao-decimal-n3'))) {
      expect(item.visual).toBeUndefined()
      if (item.enunciado.includes('\\frac')) {
        const [n, d] = fracao(item.enunciado)
        const alvo = (n * 100) / d
        const vale = item.opcoes!.map((o, i) => ({ i, v: cent(decimais(o)[0]) })).filter(({ v }) => v === alvo).map(({ i }) => i)
        expect(vale).toEqual([Number(item.resposta)])
        expect(Object.values(item.erros)).toContain('fracao-vira-virgula')
      } else {
        const [x] = decimais(item.enunciado)
        const alvo = cent(x)
        // Opções a/b: vale a·100/b centésimos.
        const vale = item.opcoes!.map((o, i) => ({ i, f: fracao(o) })).filter(({ f: [a, b] }) => a * 100 === alvo * b).map(({ i }) => i)
        expect(vale).toEqual([Number(item.resposta)])
        const [a, b] = fracao(escolhida(item))
        expect(b).toBe(10)
        expect(item.erros[String(item.opcoes!.findIndex((o) => o.includes(`\\frac{${a}}{100}`)))]).toBe('troca-decimo-centesimo')
      }
    }
  })
})

describe('U8 · aula 3: comparar e arredondar', () => {
  it('comparar-decimais-n1: o maior dos dois, ou iguais', () => {
    for (const item of itens(g('comparar-decimais-n1'))) {
      const [p, q] = decimais(item.enunciado).map(cent)
      const certa = p === q ? 'São iguais' : p > q ? decimais(item.enunciado)[0] : decimais(item.enunciado)[1]
      expect(escolhida(item)).toBe(certa)
      // A isca: o de mais algarismos depois da vírgula parece maior.
      expect(Object.values(item.erros).some((e) => e === 'decimal-mais-casas-maior' || e === 'decimal-mais-curto-maior')).toBe(true)
      const { grades } = item.visual!.estado as { grades: { pintadas: number }[] }
      expect(grades.map((x) => x.pintadas)).toEqual([p, q])
    }
  })
  it('arredondar-decimais-n2: ao décimo mais perto', () => {
    for (const item of itens(g('arredondar-decimais-n2'))) {
      const [x] = decimais(item.enunciado)
      const h = cent(x)
      expect(h % 10).not.toBe(0)
      expect(respostaDecimal(item)).toBe(aoDecimo(h))
      // Cortar a última casa só erra quando o centésimo é 5 ou mais.
      const cortado = `${Math.floor(h / 100)},${Math.floor((h % 100) / 10)}`
      if (h % 10 >= 5) expect(['arredondar-corta-casas', 'empate-para-baixo']).toContain(item.erros[cortado])
      const { marcas } = item.visual!.estado as { marcas: number[] }
      expect(marcas.map((v) => Math.round(v * 100))).toContain(h)
    }
  })
  it('comparar-arredondar-n3: comparar três medidas ou arredondar uma', () => {
    for (const item of itens(g('comparar-arredondar-n3'))) {
      expect(item.visual).toBeUndefined()
      const texto = semNegrito(item.enunciado)
      if (item.formato === 'escolha') {
        const valores = decimais(texto).map(cent)
        expect(valores).toHaveLength(3)
        expect(new Set(valores).size).toBe(3)
        const maior = /comprida|pesado|mais água/.test(texto)
        const alvo = maior ? Math.max(...valores) : Math.min(...valores)
        expect(cent(decimais(escolhida(item))[0])).toBe(alvo)
        expect(Object.values(item.erros)).toEqual(['decimal-mais-casas-maior'])
      } else {
        const [x] = decimais(texto)
        const h = cent(x)
        if (/inteiro/.test(texto)) {
          const inteiro = Math.floor(h / 100)
          expect(item.resposta).toBe(h % 100 >= 50 ? inteiro + 1 : inteiro)
        } else {
          expect(respostaDecimal(item)).toBe(aoDecimo(h))
        }
      }
    }
  })
})
