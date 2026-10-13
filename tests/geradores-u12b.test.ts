import { describe, expect, it } from 'vitest'
import { GERADORES_U12B } from '@/content/matematica/geradores/negativos-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado e refaz a conta por conta própria,
// sem usar as funções do gerador. Para fugir do ponto flutuante, todo
// número vira um inteiro de milésimos, em BigInt: −0,75 é −750 e
// −R$ 12,50 é −12.500.

const g = (id: string) => GERADORES_U12B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const ESCALA = BigInt(1000)
const ZERO = BigInt(0)

/** '−2,5' ou '-2,5' → −2.500; '12' → 12.000. Até 3 casas. */
function mili(t: string): bigint {
  const s = t.trim().replace(/−/g, '-')
  const neg = s.startsWith('-')
  const [a, b = ''] = (neg ? s.slice(1) : s).split(',')
  expect(a, `"${t}" não é um número`).toMatch(/^\d+$/)
  expect(b.length, `"${t}" tem mais de 3 casas`).toBeLessThanOrEqual(3)
  const v = BigInt(a) * ESCALA + BigInt(b.padEnd(3, '0') || '0')
  return neg ? -v : v
}
/** A resposta em milésimos: inteiro (número) ou decimal em texto, com vírgula. */
function valor(item: Item): bigint {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta), `${item.enunciado}: resposta ${item.resposta} deveria ser texto com vírgula`).toBe(true)
    return BigInt(item.resposta) * ESCALA
  }
  expect(item.resposta, 'decimal com vírgula e o menos verdadeiro').toMatch(/^−?\d+,\d+$/)
  return mili(item.resposta)
}
/** Os trechos em negrito do enunciado. */
const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** O número de um trecho em negrito ("1,5 °C", "−R$ 12,50", "3"), em milésimos. */
function numero(t: string): bigint {
  const m = t.match(/^(−)?(?:R\$ )?(\d+(?:,\d+)?)(?: °C)?$/)
  expect(m, `"${t}" não é um número do enunciado`).not.toBeNull()
  return mili(`${m![1] ?? ''}${m![2]}`)
}
/** Conta com × e ÷, da esquerda para a direita, em inteiros: "(−4) × (−5) ÷ (−2)". */
function conta(t: string): bigint {
  const tokens = t.split(' ')
  const n = (s: string) => {
    expect(s, `"${s}": negativo depois de um sinal vai entre parênteses`).toMatch(/^(\(−\d+\)|\d+)$/)
    return BigInt(s.replace(/[()]/g, '').replace('−', '-'))
  }
  let v = n(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const x = n(tokens[i + 1])
    if (op === '×') v *= x
    else {
      expect(op).toBe('÷')
      expect(v % x, `${t}: divisão não exata`).toBe(ZERO)
      v /= x
    }
  }
  return v * ESCALA
}
/** O erro mapeado para a resposta errada que vale `m` milésimos. */
function erroPara(item: Item, m: bigint): string | undefined {
  const k = Object.keys(item.erros).find((t) => mili(t) === m)
  return k === undefined ? undefined : item.erros[k]
}

describe('U12 (aulas 4 e 5) · geradores', () => {
  it('6 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U12B).toHaveLength(6)
    for (const aula of ['B.U12.A4', 'B.U12.A5']) {
      expect(GERADORES_U12B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('todo item numérico tem a tecla do menos; nenhum erro mapeado vale a certa', () => {
    for (const ger of GERADORES_U12B) {
      for (const item of itens(ger)) {
        if (item.formato === 'escolha') continue
        expect(item.formato).toBe('numero')
        expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
        const certa = valor(item)
        for (const t of Object.keys(item.erros)) {
          expect(t, 'o erro se escreve com o menos verdadeiro').not.toMatch(/-/)
          expect(mili(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
        }
      }
    }
  })
  it('sem hífen no lugar do menos nos textos', () => {
    for (const ger of GERADORES_U12B) {
      for (const item of itens(ger)) {
        // Fora do TeX, o menos é sempre "−".
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(t.replace(/R\$/g, 'R').replace(/\$[^$]*\$/g, ''), t).not.toMatch(/-\d|\(-/)
        }
      }
    }
  })
  it('nível 1 com visual e esboço; níveis 2 e 3 sem visual', () => {
    for (const id of ['multiplicar-negativos-n1', 'racionais-n1']) {
      for (const item of itens(g(id))) {
        expect(['livre', 'reta']).toContain(item.visual?.modelo)
        expect(item.visual!.esboco).toBeTruthy()
      }
    }
    for (const id of ['multiplicar-negativos-n2', 'multiplicar-negativos-n3', 'racionais-n2', 'racionais-n3']) {
      for (const item of itens(g(id))) expect(item.visual).toBeUndefined()
    }
  })
})

describe('U12 · aula 4: multiplicar e dividir', () => {
  it('multiplicar-negativos-n1: um positivo vezes um negativo, com as fichas da dívida', () => {
    for (const item of itens(g('multiplicar-negativos-n1'))) {
      const [t] = negritos(item.enunciado)
      const certa = conta(t)
      expect(valor(item), item.enunciado).toBe(certa)
      expect(certa < ZERO, 'sinais diferentes: negativo').toBe(true)
      const [x, y] = t.split(' × ').map((s) => BigInt(s.replace(/[()]/g, '').replace('−', '-')))
      expect(x * y < ZERO, 'um positivo e um negativo').toBe(true)
      const saldo = (item.visual!.estado as { saldo: { negativas: number } }).saldo
      expect(BigInt(saldo.negativas) * ESCALA).toBe(-certa)
      expect(erroPara(item, -certa)).toBe('sinais-diferentes-da-positivo')
      expect(erroPara(item, (x + y) * ESCALA)).toBe('soma-no-lugar-de-multiplicar')
    }
  })
  it('multiplicar-negativos-n2: menos vezes menos, e divisões com sinais', () => {
    let vezes = 0
    let divide = 0
    const casos = new Set<string>()
    for (const item of itens(g('multiplicar-negativos-n2'))) {
      const [t] = negritos(item.enunciado)
      const certa = conta(t)
      expect(valor(item), item.enunciado).toBe(certa)
      if (t.includes('×')) {
        vezes++
        expect(t).toMatch(/^\(−\d\) × \(−\d\)$/)
        expect(certa > ZERO).toBe(true)
        expect(erroPara(item, -certa)).toBe('sinais-iguais-da-negativo')
      } else {
        divide++
        const [a, , b] = t.split(' ')
        casos.add(`${a.startsWith('(')}${b.startsWith('(')}`)
        expect(erroPara(item, -certa)).toBe(certa < ZERO ? 'sinais-diferentes-da-positivo' : 'sinais-iguais-da-negativo')
      }
    }
    expect(vezes).toBeGreaterThan(100)
    expect(divide).toBeGreaterThan(100)
    expect(casos.size, 'os três casos de sinal na divisão').toBe(3)
  })
  it('multiplicar-negativos-n3: câmara fria, parcelas e três números', () => {
    const vistos = { camara: 0, parcelas: 0, tres: 0 }
    for (const item of itens(g('multiplicar-negativos-n3'))) {
      const b = negritos(item.enunciado)
      if (/câmara fria/.test(item.enunciado)) {
        vistos.camara++
        const [t, c, h] = b.map(numero)
        const certa = t - (c * h) / ESCALA
        expect(valor(item), item.enunciado).toBe(certa)
        expect(certa < ZERO, 'a câmara passa do zero').toBe(true)
        expect(erroPara(item, -certa)).toBe('decimal-negativo-sem-sinal')
        expect(erroPara(item, t + (c * h) / ESCALA)).toBe('sinais-diferentes-da-positivo')
      } else if (/parcelas/.test(item.enunciado)) {
        vistos.parcelas++
        const [total, n] = b.map(numero)
        expect(total % n, 'parcelas inteiras').toBe(ZERO)
        const certa = -(total * ESCALA) / n
        expect(valor(item), item.enunciado).toBe(certa)
        expect(erroPara(item, -certa)).toBe('sinais-diferentes-da-positivo')
      } else {
        vistos.tres++
        const certa = conta(b[0])
        expect(valor(item), item.enunciado).toBe(certa)
        expect(b[0].split(' ')).toHaveLength(5)
        expect(erroPara(item, -certa)).toBeDefined()
      }
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(60)
  })
})

describe('U12 · aula 5: os números racionais', () => {
  it('racionais-n1: o maior ou o menor de dois negativos, um com uma casa e o outro com duas', () => {
    let maior = 0
    for (const item of itens(g('racionais-n1'))) {
      const [a, b] = negritos(item.enunciado).map(numero)
      expect(item.opcoes!.map(mili)).toEqual([a, b])
      expect(a < ZERO && b < ZERO, 'dois negativos').toBe(true)
      expect(a).not.toBe(b)
      const pedeMaior = /^Qual é maior/.test(item.enunciado)
      if (pedeMaior) maior++
      else expect(item.enunciado).toMatch(/^Qual é menor/)
      const certo = pedeMaior ? (a > b ? 0 : 1) : a < b ? 0 : 1
      expect(item.resposta, item.enunciado).toBe(certo)
      expect(item.erros).toEqual({ [String(1 - certo)]: 'compara-decimais-negativos-sem-o-sinal' })
      // Um com uma casa, o outro com duas: o caso que pega.
      expect(new Set(item.opcoes!.map((o) => o.split(',')[1].length))).toEqual(new Set([1, 2]))
      const pontos = (item.visual!.estado as { numeros: number[] }).numeros
      expect(pontos.map((p) => BigInt(Math.round(p * 1000)))).toEqual([a, b])
    }
    expect(maior).toBeGreaterThan(100)
    expect(maior).toBeLessThan(200)
  })
  it('racionais-n2: o sinal de uma fração, em decimal', () => {
    const lugares = new Set<string>()
    for (const item of itens(g('racionais-n2'))) {
      const m = item.enunciado.match(/^Escreva \$(-?)\\frac\{(-?)(\d+)\}\{(-?)(\d+)\}\$ em decimal\.$/)
      expect(m, item.enunciado).not.toBeNull()
      const [, frente, cima, n, baixo, d] = m!
      lugares.add(`${frente}|${cima}|${baixo}`)
      const menos = [frente, cima, baixo].filter(Boolean).length
      expect(menos === 1 || (menos === 2 && !frente), 'um menos só, ou em cima e embaixo').toBe(true)
      const modulo = (BigInt(n) * ESCALA) / BigInt(d)
      expect((BigInt(n) * ESCALA) % BigInt(d), 'decimal exato').toBe(ZERO)
      const certa = menos === 2 ? modulo : -modulo
      expect(valor(item), item.enunciado).toBe(certa)
      expect(erroPara(item, -certa)).toBe(menos === 2 ? 'menos-no-numerador-e-no-denominador' : 'sinais-diferentes-da-positivo')
    }
    expect(lugares.size, 'na frente, em cima, embaixo e nos dois').toBe(4)
  })
  it('racionais-n3: temperatura que passa do zero, boleto e tarifas', () => {
    const vistos = { termometro: 0, boleto: 0, tarifas: 0 }
    for (const item of itens(g('racionais-n3'))) {
      const b = negritos(item.enunciado).map(numero)
      let certa: bigint
      if (/termômetro/.test(item.enunciado)) {
        vistos.termometro++
        const [t, q] = b
        expect(q > t && t > ZERO).toBe(true)
        certa = t - q
        expect(erroPara(item, -certa)).toBe('decimal-negativo-sem-sinal')
      } else if (/boleto/.test(item.enunciado)) {
        vistos.boleto++
        const [s, p] = b
        expect(p > s && s > ZERO).toBe(true)
        certa = s - p
        expect(erroPara(item, -certa)).toBe('decimal-negativo-sem-sinal')
      } else {
        vistos.tarifas++
        expect(item.enunciado).toMatch(/tarifas/)
        const [s, k, t] = b
        expect(s < ZERO, 'o saldo começa negativo').toBe(true)
        certa = s - (k * t) / ESCALA
        expect(erroPara(item, s + (k * t) / ESCALA)).toBe('sinais-diferentes-da-positivo')
      }
      expect(valor(item), item.enunciado).toBe(certa)
      expect(certa < ZERO, 'o resultado é negativo').toBe(true)
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(60)
  })
})
