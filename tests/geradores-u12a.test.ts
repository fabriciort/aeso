import { describe, expect, it } from 'vitest'
import { GERADORES_U12A } from '@/content/matematica/geradores/negativos-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (os trechos em negrito) e refaz a
// conta por conta própria, sem usar as funções do gerador. Os negativos
// aparecem na tela com o sinal de menos verdadeiro (−3) e, depois de um
// sinal, entre parênteses: 2 − (−3).

const g = (id: string) => GERADORES_U12A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** "−3" → -3; "(−3)" → -3; "12" → 12. O hífen não vale na tela. */
function inteiro(s: string): number {
  expect(s, 'use o sinal de menos verdadeiro (−), não o hífen').not.toMatch(/-/)
  const m = s.match(/^\(?(−?)(\d+)\)?$/)
  expect(m, s).not.toBeNull()
  if (s.startsWith('(')) expect(m![1], `parênteses só em volta de negativo: ${s}`).toBe('−')
  return (m![1] ? -1 : 1) * Number(m![2])
}
/** Os trechos em negrito do enunciado. */
const negritos = (t: string) => [...t.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** Os números dos trechos em negrito, na ordem (sem "R$" nem unidades). */
const numeros = (t: string) => negritos(t).map((b) => inteiro(b.match(/\(?−?\d+\)?/)![0]))
/** A conta em negrito ("3 − 5", "(−4) + (−3)") refeita: [x, sinal, y, resultado]. */
function conta(t: string): { x: number; op: '+' | '−'; y: number; valor: number } {
  const b = negritos(t).find((s) => / [+−] /.test(s))
  expect(b, t).toBeDefined()
  const m = b!.match(/^(\(−\d+\)|\d+) ([+−]) (\(−\d+\)|\d+)$/)
  expect(m, `conta mal escrita: ${b}`).not.toBeNull()
  const [x, y] = [inteiro(m![1]), inteiro(m![3])]
  const op = m![2] as '+' | '−'
  return { x, op, y, valor: op === '+' ? x + y : x - y }
}
/** O número digitado de uma chave de `erros` ("-3" e "−3" valem o mesmo). */
const digitado = (k: string) => Number(k.replace('−', '-'))
/** O erro previsto para esta resposta digitada. */
const erroDe = (item: Item, valor: number) => Object.entries(item.erros).find(([k]) => digitado(k) === valor)?.[1]

describe('U12 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U12A).toHaveLength(9)
    for (const aula of ['B.U12.A1', 'B.U12.A2', 'B.U12.A3']) {
      expect(GERADORES_U12A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('sinal: true em todo item numérico, sem visual no nível 3 e erros diferentes da certa', () => {
    for (const ger of GERADORES_U12A) {
      for (const item of itens(ger)) {
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        expect(item.enunciado, 'sem hífen no lugar do menos').not.toMatch(/-/)
        for (const d of item.dicas) expect(d, 'sem hífen no lugar do menos').not.toMatch(/-/)
        if (item.formato === 'numero') {
          expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
          expect(Number.isInteger(item.resposta)).toBe(true)
          const certa = item.resposta as number
          for (const k of Object.keys(item.erros)) {
            expect(Number.isInteger(digitado(k)), k).toBe(true)
            expect(digitado(k), `${k} = ${certa}`).not.toBe(certa)
          }
        } else {
          expect(item.formato).toBe('escolha')
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
        }
      }
    }
  })
})

describe('U12 · aula 1: abaixo de zero', () => {
  it('abaixo-de-zero-n1: o número do traço marcado', () => {
    let negativos = 0
    for (const item of itens(g('abaixo-de-zero-n1'))) {
      const e = item.visual!.estado as { de: number; ate: number; passo: number; marcas: number[]; marcaSemRotulo: number; sinais: boolean }
      expect(item.visual!.modelo).toBe('reta')
      expect(e.sinais).toBe(true)
      expect(e.passo).toBe(1)
      // O traço com "?" não pode ser um número já escrito.
      expect(e.marcas).not.toContain(e.marcaSemRotulo)
      expect(e.marcaSemRotulo).toBeGreaterThanOrEqual(e.de)
      expect(e.marcaSemRotulo).toBeLessThanOrEqual(e.ate)
      expect(item.resposta).toBe(e.marcaSemRotulo)
      const v = e.marcaSemRotulo
      if (v < 0) negativos++
      expect(erroDe(item, -v)).toBe(v < 0 ? 'esquece-sinal-do-resultado' : 'inverte-reta')
    }
    expect(negativos).toBeGreaterThan(150)
  })
  it('abaixo-de-zero-n2: qual é maior ou menor, e a distância até o zero', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('abaixo-de-zero-n2'))) {
      const dist = item.enunciado.match(/^Quantos passos separam o \*\*(.+)\*\* do zero, na reta\?$/)
      if (dist) {
        tipos.add('distancia')
        const v = inteiro(dist[1])
        expect(v).toBeLessThan(0)
        // A distância até o zero é o número sem o sinal.
        expect(item.resposta).toBe(Math.abs(v))
        expect(erroDe(item, v)).toBe('modulo-com-sinal')
        continue
      }
      const m = item.enunciado.match(/^Qual é (maior|menor): \*\*(.+)\*\* ou \*\*(.+)\*\*\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add(m![1])
      const [x, y] = [inteiro(m![2]), inteiro(m![3])]
      expect(x).not.toBe(y)
      expect(Math.min(x, y)).toBeLessThan(0)
      // Na reta, o maior é o que fica mais à direita.
      const certa = m![1] === 'maior' ? (x > y ? x : y) : x < y ? x : y
      expect(item.opcoes!.map(inteiro).sort()).toEqual([x, y].sort())
      expect(inteiro(item.opcoes![item.resposta as number])).toBe(certa)
      const outra = item.opcoes!.findIndex((o) => inteiro(o) !== certa)
      expect(item.erros[String(outra)]).toBe('negativo-maior-pelo-numero')
    }
    expect(tipos).toEqual(new Set(['distancia', 'maior', 'menor']))
  })
  it('abaixo-de-zero-n3: a mais fria, o maior saldo, o andar mais baixo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('abaixo-de-zero-n3'))) {
      const xs = numeros(item.enunciado)
      expect(new Set(xs).size).toBe(xs.length)
      expect(xs.filter((x) => x < 0).length).toBeGreaterThanOrEqual(2)
      const maior = /maior saldo/.test(item.enunciado)
      const menor = /mais baixa|mais embaixo/.test(item.enunciado)
      expect(maior).not.toBe(menor)
      tipos.add(/°C/.test(item.enunciado) ? 'temperatura' : /R\$/.test(item.enunciado) ? 'saldo' : 'andar')
      // Ordenar como na reta, da esquerda para a direita.
      const ordem = [...xs].sort((a, b) => a - b)
      const certa = maior ? ordem[ordem.length - 1] : ordem[0]
      expect(item.resposta).toBe(certa)
      // O negativo que engana: o mais perto do zero (para o menor) ou o mais longe (para o maior).
      const negs = ordem.filter((x) => x < 0)
      expect(erroDe(item, maior ? negs[0] : negs[negs.length - 1])).toBe('negativo-maior-pelo-numero')
      if (certa < 0) expect(erroDe(item, -certa)).toBe('esquece-sinal-do-resultado')
    }
    expect(tipos).toEqual(new Set(['temperatura', 'saldo', 'andar']))
  })
})

describe('U12 · aula 2: somar e subtrair na reta', () => {
  it('somar-subtrair-reta-n1: passar do zero, com a reta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('somar-subtrair-reta-n1'))) {
      const { x, op, y, valor } = conta(item.enunciado)
      expect(item.resposta).toBe(valor)
      expect(y).toBeGreaterThan(0)
      const e = item.visual!.estado as { de: number; ate: number; numeros: number[] }
      // O ponto de partida é o primeiro número da conta, e a chegada cabe na reta.
      expect(e.numeros).toEqual([x])
      expect(valor).toBeGreaterThanOrEqual(e.de)
      expect(valor).toBeLessThanOrEqual(e.ate)
      if (op === '−') {
        tipos.add('a − b')
        expect(x).toBeGreaterThan(0)
        expect(valor).toBeLessThan(0)
        expect(erroDe(item, y - x)).toBe('esquece-sinal-do-resultado')
        expect(erroDe(item, x + y)).toBe('anda-para-o-lado-errado')
      } else {
        tipos.add('(−a) + b')
        expect(x).toBeLessThan(0)
        expect(erroDe(item, x - y)).toBe('anda-para-o-lado-errado')
      }
    }
    expect(tipos).toEqual(new Set(['a − b', '(−a) + b']))
  })
  it('somar-subtrair-reta-n2: somar um negativo, dívida mais dívida', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('somar-subtrair-reta-n2'))) {
      const { x, op, y, valor } = conta(item.enunciado)
      expect(item.resposta).toBe(valor)
      if (op === '+' && x > 0) {
        tipos.add('a + (−b)')
        expect(y).toBeLessThan(0)
        expect(erroDe(item, x - y)).toBe('anda-para-o-lado-errado')
      } else if (op === '+') {
        tipos.add('(−a) + (−b)')
        expect(y).toBeLessThan(0)
        // "Menos com menos dá mais": o valor sem o sinal.
        expect(erroDe(item, -valor)).toBe('menos-com-menos-na-soma')
      } else {
        tipos.add('(−a) − b')
        expect(x).toBeLessThan(0)
        expect(y).toBeGreaterThan(0)
        expect(erroDe(item, x + y)).toBe('anda-para-o-lado-errado')
      }
    }
    expect(tipos).toEqual(new Set(['a + (−b)', '(−a) + (−b)', '(−a) − b']))
  })
  it('somar-subtrair-reta-n3: temperatura, saldo e elevador', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('somar-subtrair-reta-n3'))) {
      const [s, d] = numeros(item.enunciado)
      expect(d).toBeGreaterThan(0)
      const sobe = /subiu|depositou/.test(item.enunciado)
      const desce = /caiu|pagou|desceu/.test(item.enunciado)
      expect(sobe).not.toBe(desce)
      tipos.add(/°C/.test(item.enunciado) ? 'temperatura' : /R\$/.test(item.enunciado) ? 'saldo' : 'elevador')
      const certa = sobe ? s + d : s - d
      expect(item.resposta).toBe(certa)
      expect(erroDe(item, sobe ? s - d : s + d)).toBe('anda-para-o-lado-errado')
      // O elevador que desce de um andar acima do térreo passa do zero.
      if (/elevador/.test(item.enunciado) && desce && s >= 0) expect(certa).toBeLessThan(0)
      if (/boleto/.test(item.enunciado)) expect(certa).toBeLessThan(0)
    }
    expect(tipos).toEqual(new Set(['temperatura', 'saldo', 'elevador']))
  })
})

describe('U12 · aula 3: tirar um negativo', () => {
  it('tirar-negativo-n1: a − (−b), com as fichas', () => {
    for (const item of itens(g('tirar-negativo-n1'))) {
      const { x, op, y, valor } = conta(item.enunciado)
      expect(op).toBe('−')
      expect(y).toBeLessThan(0)
      expect(item.resposta).toBe(valor)
      // As fichas: x + |y| fichas + e |y| fichas −, em pares; o saldo é x.
      const s = (item.visual!.estado as { saldo: { positivas: number; negativas: number; pares: boolean } }).saldo
      expect(s.positivas - s.negativas).toBe(x)
      expect(s.negativas).toBe(-y)
      expect(s.pares).toBe(true)
      // Tiradas as −, sobram as +.
      expect(item.resposta).toBe(s.positivas)
      expect(erroDe(item, x + y)).toBe('tirar-negativo-subtrai')
    }
  })
  it('tirar-negativo-n2: tirar um negativo de um negativo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('tirar-negativo-n2'))) {
      const { x, op, y, valor } = conta(item.enunciado)
      expect(op).toBe('−')
      expect(y).toBeLessThan(0)
      expect(item.resposta).toBe(valor)
      tipos.add(x < 0 ? '(−a) − (−b)' : 'a − (−b)')
      // Ler x − (−b) como x − b.
      expect(erroDe(item, x + y)).toBe('tirar-negativo-subtrai')
      if (valor < 0) expect(erroDe(item, -valor)).toBe('esquece-sinal-do-resultado')
    }
    expect(tipos).toEqual(new Set(['(−a) − (−b)', 'a − (−b)']))
  })
  it('tirar-negativo-n3: diferença de temperatura e tarifa cancelada', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('tirar-negativo-n3'))) {
      const [a, b] = numeros(item.enunciado)
      if (/°C/.test(item.enunciado)) {
        tipos.add('temperatura')
        expect(Math.min(a, b)).toBeLessThan(0)
        expect(Math.max(a, b)).toBeGreaterThan(0)
        // Os passos do menor até o maior, na reta: até o zero e depois dele.
        const passos = -Math.min(a, b) + Math.max(a, b)
        expect(item.resposta).toBe(passos)
        expect(erroDe(item, Math.max(a, b) + Math.min(a, b))).toBe('tirar-negativo-subtrai')
      } else {
        tipos.add('tarifa')
        expect(item.enunciado).toMatch(/cancelou/)
        expect(a).toBeLessThan(0)
        expect(b).toBeGreaterThan(0)
        // Cancelar a tarifa devolve o dinheiro: a dívida diminui b.
        expect(item.resposta).toBe(a + b)
        expect(erroDe(item, a - b)).toBe('tirar-negativo-subtrai')
      }
    }
    expect(tipos).toEqual(new Set(['temperatura', 'tarifa']))
  })
})
