import { describe, expect, it } from 'vitest'
import { GERADORES_U5 } from '@/content/matematica/geradores/expressoes'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê a expressão (ou os números) do enunciado e refaz a conta por
// conta própria, com um avaliador escrito aqui, sem usar o do gerador.

const g = (id: string) => GERADORES_U5.find((x) => x.id === id)!
const n = (s: string) => Number(s.replace(/\./g, ''))
const nums = (s: string) => [...s.matchAll(/\d[\d.]*/g)].map((m) => n(m[0]))
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const escolhida = (item: Item) => item.opcoes![Number(item.resposta)]
const exprDe = (enunciado: string) => enunciado.replace(/^Resolva: /, '')

/** Avaliador clássico: expressão = termo (± termo)*; termo = fator (×÷ fator)*. */
function calcula(expr: string): number {
  const t = expr.match(/\d+|[+−×÷()]/g)!
  let i = 0
  const fator = (): number => {
    if (t[i] === '(') {
      i++
      const v = soma()
      expect(t[i++]).toBe(')')
      return v
    }
    return Number(t[i++])
  }
  const termo = (): number => {
    let v = fator()
    while (t[i] === '×' || t[i] === '÷') {
      const op = t[i++]
      const b = fator()
      if (op === '÷') expect(v % b, `${expr}: divisão não exata`).toBe(0)
      v = op === '×' ? v * b : v / b
    }
    return v
  }
  const soma = (): number => {
    let v = termo()
    while (t[i] === '+' || t[i] === '−') {
      const op = t[i++]
      v = op === '+' ? v + termo() : v - termo()
      expect(v, `${expr}: passou por um número negativo`).toBeGreaterThanOrEqual(0)
    }
    return v
  }
  const v = soma()
  expect(i, `${expr}: sobrou algo sem ler`).toBe(t.length)
  return v
}

/** Da esquerda para a direita, sem prioridade nem parênteses: a calculadora de balcão. */
function balcao(expr: string): number {
  const t = expr.match(/\d+|[+−×÷]/g)!
  let v = Number(t[0])
  for (let i = 1; i < t.length; i += 2) {
    const b = Number(t[i + 1])
    v = t[i] === '+' ? v + b : t[i] === '−' ? v - b : t[i] === '×' ? v * b : v / b
  }
  return v
}

/** Simula as teclas numa calculadora de balcão ("5 × 12 = + 25 ="): cada sinal fecha a conta anterior. */
function teclas(seq: string): number {
  let visor = 0
  let pendente: string | null = null
  for (const k of seq.split(' ')) {
    if (/^\d+$/.test(k)) {
      const x = Number(k)
      visor = pendente === null ? x : pendente === '+' ? visor + x : pendente === '−' ? visor - x : pendente === '×' ? visor * x : visor / x
      pendente = null
    } else if (k === '=') pendente = null
    else pendente = k
  }
  return visor
}

describe('U5 · o avaliador do teste', () => {
  it('confere os exemplos das aulas', () => {
    expect(calcula('2 + 3 × 4')).toBe(14)
    expect(balcao('2 + 3 × 4')).toBe(20)
    expect(calcula('5 + 2 × 3')).toBe(11)
    expect(calcula('10 − 3 + 2')).toBe(9)
    expect(calcula('20 − 4 × 3 + 2')).toBe(10)
    expect(calcula('30 − 4 × 5 + 6 ÷ 2')).toBe(13)
    expect(calcula('20 + 3 × 35')).toBe(125)
    expect(calcula('30 + 15 ÷ 3')).toBe(35)
    expect(calcula('(30 + 15) ÷ 3')).toBe(15)
    expect(calcula('(2 + 3) × 4')).toBe(20)
    expect(calcula('2 × (10 − 4) + 1')).toBe(13)
    expect(calcula('5 × (8 − 2) − 10')).toBe(20)
    expect(calcula('48 + 52 × 3')).toBe(204)
    expect(balcao('48 + 52 × 3')).toBe(300)
    expect(calcula('25 + 5 × 12')).toBe(85)
    expect(teclas('5 × 12 = + 25 =')).toBe(85)
    expect(teclas('3 × 4 = + 2 =')).toBe(14)
    expect(teclas('2 + 3 × 4 =')).toBe(20)
    expect(calcula('100 − 8 × 7')).toBe(44)
  })
})

describe('U5 · aula 1: a ordem das operações', () => {
  it('ordem-n1: uma conta de × ou ÷ e uma de + ou −; da esquerda para a direita é ignora-prioridade', () => {
    for (const item of itens(g('ordem-n1'))) {
      const e = exprDe(item.enunciado)
      expect(e).toMatch(/^\d+ [+−] \d+ [×÷] \d+$/)
      expect(item.resposta).toBe(calcula(e))
      const esq = balcao(e)
      expect(esq).not.toBe(item.resposta)
      if (Number.isInteger(esq) && esq >= 0) expect(item.erros[String(esq)]).toBe('ignora-prioridade')
      expect(e).toContain(item.visual!.estado.destaque as string)
    }
  })
  it('ordem-n2: mesma prioridade da esquerda para a direita, e três operações', () => {
    for (const item of itens(g('ordem-n2'))) {
      const e = exprDe(item.enunciado)
      expect(item.resposta).toBe(calcula(e))
      if (/^\d+ − \d+ \+ \d+$/.test(e)) {
        const [a, b, c] = nums(e)
        expect(item.erros[String(a - (b + c))]).toBe('soma-antes-de-subtrair')
      }
      if (/^\d+ ÷ \d+ × \d+$/.test(e)) {
        const [a, b, c] = nums(e)
        expect(item.erros[String(a / (b * c))]).toBe('multiplica-antes-de-dividir')
      }
      const esq = balcao(e)
      if (Number.isInteger(esq) && esq >= 0 && esq !== item.resposta) expect(item.erros[String(esq)]).toBe('ignora-prioridade')
    }
  })
  it('ordem-n3: compras, entradas, ovos e a conta dividida', () => {
    for (const item of itens(g('ordem-n3'))) {
      const s = item.enunciado
      const [x, y, z] = nums(s)
      let certa: number
      if (/compra .* cadernos/.test(s)) {
        certa = x - y * z
        expect(item.erros[String((x - y) * z)]).toBe('ignora-prioridade')
      } else if (/parcelas/.test(s)) {
        certa = x + y * z
        expect(item.erros[String((x + y) * z)]).toBe('ignora-prioridade')
      } else if (/ovos/.test(s)) {
        certa = x + y * z
        expect(item.erros[String((x + y) * z)]).toBe('ignora-prioridade')
      } else {
        // n pessoas dividem R$ a, e cada uma paga mais R$ b
        expect(y % x).toBe(0)
        certa = y / x + z
      }
      expect(item.resposta).toBe(certa)
      expect(certa).toBeGreaterThan(0)
    }
  })
})

describe('U5 · aula 2: parênteses e o sinal de igual', () => {
  it('parenteses-n1: parênteses no começo; sem eles é ignora-parenteses', () => {
    for (const item of itens(g('parenteses-n1'))) {
      const e = exprDe(item.enunciado)
      expect(e).toMatch(/^\(\d+ [+−] \d+\) [×÷] \d+$/)
      expect(item.resposta).toBe(calcula(e))
      const sem = e.replace(/[()]/g, '')
      const [a, op1, b, op2, c] = sem.split(' ')
      const semValor = (() => {
        const p = op2 === '×' ? Number(b) * Number(c) : Number(b) / Number(c)
        return op1 === '+' ? Number(a) + p : Number(a) - p
      })()
      if (Number.isInteger(semValor) && semValor >= 0 && semValor !== item.resposta) expect(item.erros[String(semValor)]).toBe('ignora-parenteses')
      expect(e.startsWith(item.visual!.estado.destaque as string)).toBe(true)
    }
  })
  it('parenteses-n2: parênteses no meio ou no fim, e a escrita com o sinal de igual', () => {
    let escolhas = 0
    for (const item of itens(g('parenteses-n2'))) {
      if (item.formato === 'escolha') {
        escolhas++
        const [a, b, c] = nums(item.enunciado)
        const certa = escolhida(item)
        expect(certa).toBe(`(${a} + ${b}) × ${c} = ${(a + b) * c}`)
        // Cada "=" da escrita certa liga coisas iguais; nas outras, algum não liga.
        for (const [i, o] of item.opcoes!.entries()) {
          const partes = o.split(' = ')
          const iguais = partes.every((p) => calcula(p) === calcula(partes[0]))
          expect(iguais).toBe(i === Number(item.resposta))
        }
        expect(Object.values(item.erros).sort()).toEqual(['ignora-parenteses', 'igual-encadeado'])
        continue
      }
      const e = exprDe(item.enunciado)
      expect(e).toMatch(/\(/)
      expect(item.resposta).toBe(calcula(e))
      if (/^\d+ − \(\d+ \+ \d+\)$/.test(e)) {
        const [a, b, c] = nums(e)
        expect(item.erros[String(a - b + c)]).toBe('ignora-parenteses')
      }
      if (/^\d+ × \(\d+ − \d+\)$/.test(e)) {
        const [a, b, c] = nums(e)
        expect(item.erros[String(a * b - c)]).toBe('ignora-parenteses')
      }
    }
    expect(escolhas).toBeGreaterThan(20)
  })
  it('parenteses-n3: dividir a conta, kits e gastos', () => {
    for (const item of itens(g('parenteses-n3'))) {
      const s = item.enunciado
      const [x, y, z] = nums(s)
      let certa: number
      if (/amigos dividem/.test(s)) {
        expect((y + z) % x).toBe(0)
        certa = (y + z) / x
      } else if (/kits/.test(s)) {
        certa = x * (y + z)
        expect(item.erros[String(x * y + z)]).toBe('ignora-parenteses')
      } else {
        certa = x - (y + z)
        expect(item.erros[String(x - y + z)]).toBe('ignora-parenteses')
      }
      expect(item.resposta).toBe(certa)
      expect(certa).toBeGreaterThan(0)
    }
  })
})

describe('U5 · aula 3: calculadora', () => {
  it('calculadora-n1: o visor da simples é a conta da esquerda para a direita', () => {
    for (const item of itens(g('calculadora-n1'))) {
      const m = item.enunciado.match(/mostrou (\d+) para (.+)\. Qual/)!
      const visor = Number(m[1])
      const e = m[2]
      expect(visor).toBe(balcao(e))
      expect(item.resposta).toBe(calcula(e))
      expect(visor).not.toBe(item.resposta)
      expect(item.erros[String(visor)]).toBe('calculadora-simples-sem-prioridade')
    }
  })
  it('calculadora-n2: só as teclas certas dão o resultado da regra', () => {
    for (const item of itens(g('calculadora-n2'))) {
      const e = item.enunciado.match(/certo de (.+)\?$/)![1]
      const certa = calcula(e)
      expect(teclas(escolhida(item))).toBe(certa)
      item.opcoes!.forEach((o, i) => {
        if (i !== Number(item.resposta)) {
          expect(teclas(o)).not.toBe(certa)
          expect(item.erros[String(i)]).toBe('calculadora-simples-sem-prioridade')
        }
      })
    }
  })
  it('calculadora-n3: o visor errado e o total certo', () => {
    for (const item of itens(g('calculadora-n3'))) {
      const [a, b, c, visor] = nums(item.enunciado)
      expect(visor).toBe((a + b) * c)
      expect(item.resposta).toBe(a + b * c)
      expect(item.erros[String(visor)]).toBe('calculadora-simples-sem-prioridade')
    }
  })
})

describe('U5 · todos os geradores', () => {
  it('respostas naturais e níveis 1, 2 e 3 por aula', () => {
    for (const ger of GERADORES_U5) for (const item of itens(ger)) {
      if (item.formato === 'numero') {
        expect(Number.isInteger(item.resposta)).toBe(true)
        expect(item.resposta as number).toBeGreaterThanOrEqual(0)
      }
    }
    for (const aula of ['B.U5.A1', 'B.U5.A2', 'B.U5.A3']) {
      expect(GERADORES_U5.filter((x) => x.aula === aula).map((x) => x.nivel).sort()).toEqual([1, 2, 3])
    }
  })
})
