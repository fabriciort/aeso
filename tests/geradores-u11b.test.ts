import { describe, expect, it } from 'vitest'
import { GERADORES_U11B } from '@/content/matematica/geradores/porcentagem-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado e refaz a conta por conta própria,
// sem usar as funções do gerador. Para fugir do ponto flutuante, todo
// número vira um inteiro de milésimos: 12,5 é 12.500 e R$ 1.102,50 é
// 1.102.500. As contas são feitas em BigInt.

const g = (id: string) => GERADORES_U11B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const B = (n: number) => BigInt(n)
const ESCALA = B(1000)
const ZERO = B(0)
const CEM = B(100)
/** '2,5' → 2.500; '2.000' → 2.000.000 (em BigInt). Até 3 casas. */
function mili(t: string): bigint {
  const [a, b = ''] = t.replace(/\./g, '').split(',')
  expect(b.length, `"${t}" tem mais de 3 casas`).toBeLessThanOrEqual(3)
  return BigInt(a) * ESCALA + BigInt(b.padEnd(3, '0'))
}
/** Os números escritos num texto, na ordem, com milhar e vírgula ("2.000", "4,80"). */
const numeros = (s: string) => [...s.matchAll(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g)].map((m) => mili(m[0]))
/** Os números do enunciado, inteiros (todos os enunciados desta parte só têm inteiros). */
function inteiros(item: Item): bigint[] {
  return numeros(item.enunciado).map((m) => {
    expect(m % ESCALA, `${item.enunciado}: número com vírgula`).toBe(ZERO)
    return m / ESCALA
  })
}
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
/** a ÷ b em milésimos, se der exato; senão, undefined. */
function divisao(a: bigint, b: bigint): bigint | undefined {
  return (a * ESCALA) % b === ZERO ? (a * ESCALA) / b : undefined
}
const abs = (n: bigint) => (n < ZERO ? -n : n)

describe('U11 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U11B).toHaveLength(9)
    for (const aula of ['B.U11.A4', 'B.U11.A5', 'B.U11.A6']) {
      expect(GERADORES_U11B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('respostas positivas em número; nenhum erro mapeado vale a certa', () => {
    for (const ger of GERADORES_U11B) {
      for (const item of itens(ger)) {
        expect(item.formato).toBe('numero')
        const certa = valor(item)
        expect(certa > ZERO, item.enunciado).toBe(true)
        for (const t of Object.keys(item.erros)) expect(mili(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
      }
    }
  })
  it('nível 3 sem visual; níveis 1 e 2 com visual e esboço', () => {
    for (const id of ['que-porcentagem-n3', 'variacoes-n3', 'juros-n3']) for (const item of itens(g(id))) expect(item.visual).toBeUndefined()
    for (const id of ['que-porcentagem-n1', 'que-porcentagem-n2', 'variacoes-n1', 'variacoes-n2', 'juros-n1', 'juros-n2']) {
      for (const item of itens(g(id))) {
        expect(['barra', 'grade', 'livre']).toContain(item.visual?.modelo)
        expect(item.visual!.esboco).toBeTruthy()
      }
    }
  })
})

describe('U11 · aula 4: que porcentagem é?', () => {
  it('que-porcentagem-n1: parte ÷ todo × 100, com a barra da parte', () => {
    for (const item of itens(g('que-porcentagem-n1'))) {
      const [x, y] = inteiros(item)
      expect(x < y, item.enunciado).toBe(true)
      expect(valor(item) * y, item.enunciado).toBe(x * CEM * ESCALA)
      expect(item.visual!.estado).toEqual({ partes: Number(y), pintadas: Number(x) })
      expect(erroPara(item, x * ESCALA)).toBe('parte-como-porcentagem')
      expect(erroPara(item, divisao(x, y)!)).toBe('esquece-multiplicar-por-100')
      const inverso = divisao(y * CEM, x)
      if (inverso !== undefined && inverso % B(10) === ZERO) expect(erroPara(item, inverso)).toBe('divide-todo-pela-parte')
    }
  })
  it('que-porcentagem-n2: o desconto sobre o preço, ou o aumento sobre a conta de antes', () => {
    let desc = 0
    let aum = 0
    for (const item of itens(g('que-porcentagem-n2'))) {
      const [a, b] = inteiros(item)
      expect(a, 'o todo nunca é 100').not.toBe(CEM)
      if (/desconto\?$/.test(item.enunciado)) {
        desc++
        expect(valor(item) * a, item.enunciado).toBe(b * CEM * ESCALA)
        expect(erroPara(item, b * ESCALA)).toBe('parte-como-porcentagem')
      } else {
        aum++
        expect(item.enunciado).toMatch(/aumento\?$/)
        expect(b > a).toBe(true)
        expect(valor(item) * a, item.enunciado).toBe((b - a) * CEM * ESCALA)
        expect(erroPara(item, (b - a) * ESCALA)).toBe('parte-como-porcentagem')
        const novo = divisao((b - a) * CEM, b)
        if (novo !== undefined && novo % B(10) === ZERO) expect(erroPara(item, novo)).toBe('porcentagem-sobre-o-valor-errado')
      }
    }
    expect(desc).toBeGreaterThan(100)
    expect(aum).toBeGreaterThan(100)
  })
  it('que-porcentagem-n3: até uma casa, e o decimal sem o × 100 mapeado', () => {
    let meia = 0
    for (const item of itens(g('que-porcentagem-n3'))) {
      // Turma: (alunos, faltas); salário e renda: (todo, parte).
      const [todo, parte] = inteiros(item)
      expect(parte < todo, item.enunciado).toBe(true)
      expect(valor(item) * todo, item.enunciado).toBe(parte * CEM * ESCALA)
      expect(valor(item) % B(100), 'no máximo uma casa').toBe(ZERO)
      if (valor(item) % ESCALA !== ZERO) meia++
      expect(erroPara(item, parte * ESCALA)).toBe('parte-como-porcentagem')
      expect(erroPara(item, divisao(parte, todo)!)).toBe('esquece-multiplicar-por-100')
    }
    expect(meia).toBeGreaterThan(30)
  })
})

describe('U11 · aula 5: variações sucessivas', () => {
  it('variacoes-n1: dois descontos, os fatores multiplicados', () => {
    for (const item of itens(g('variacoes-n1'))) {
      const [p, a, b] = inteiros(item)
      expect(valor(item) * CEM * CEM, item.enunciado).toBe(p * (CEM - a) * (CEM - b) * ESCALA)
      expect(erroPara(item, (p * (CEM - a - b) * ESCALA) / CEM)).toBe('soma-porcentagens-sucessivas')
    }
  })
  it('variacoes-n2: sobe e cai não volta; pontos percentuais não são porcentagem', () => {
    let sobe = 0
    let taxa = 0
    for (const item of itens(g('variacoes-n2'))) {
      if (/Quantos reais/.test(item.enunciado)) {
        sobe++
        const [p, a, a2] = inteiros(item)
        expect(a2).toBe(a)
        expect(valor(item) * CEM * CEM, item.enunciado).toBe(p * (CEM + a) * (CEM - a) * ESCALA)
        expect(valor(item) < p * ESCALA, 'fica abaixo do começo').toBe(true)
        expect(erroPara(item, p * ESCALA)).toBe('sobe-e-desce-volta-ao-mesmo')
      } else {
        taxa++
        const [x, y] = inteiros(item)
        expect(item.enunciado).toMatch(y > x ? /mais caros\?$/ : /mais baratos\?$/)
        expect(valor(item) * x, item.enunciado).toBe(abs(y - x) * CEM * ESCALA)
        expect(erroPara(item, abs(y - x) * ESCALA)).toBe('confunde-ponto-percentual')
      }
    }
    expect(sobe).toBeGreaterThan(100)
    expect(taxa).toBeGreaterThan(100)
  })
  it('variacoes-n3: o desconto total, o aumento total e a ação que sobe e cai', () => {
    const modos = { desconto: 0, aluguel: 0, acao: 0 }
    for (const item of itens(g('variacoes-n3'))) {
      const [a, b] = inteiros(item)
      const total = valor(item) * CEM // em centésimos de ponto, × 1.000
      if (/desconto total/.test(item.enunciado)) {
        modos.desconto++
        expect(total, item.enunciado).toBe((CEM * CEM - (CEM - a) * (CEM - b)) * ESCALA)
        expect(erroPara(item, (a + b) * ESCALA)).toBe('soma-porcentagens-sucessivas')
      } else if (/aluguel/.test(item.enunciado)) {
        modos.aluguel++
        expect(total, item.enunciado).toBe(((CEM + a) * (CEM + b) - CEM * CEM) * ESCALA)
        expect(erroPara(item, (a + b) * ESCALA)).toBe('soma-porcentagens-sucessivas')
      } else {
        modos.acao++
        expect(b).toBe(a)
        expect(total, item.enunciado).toBe(a * a * ESCALA)
        expect(erroPara(item, ZERO)).toBe('sobe-e-desce-volta-ao-mesmo')
      }
    }
    expect(modos.desconto).toBeGreaterThan(60)
    expect(modos.aluguel).toBeGreaterThan(60)
    expect(modos.acao).toBeGreaterThan(60)
  })
})

describe('U11 · aula 6: juros simples e compostos', () => {
  it('juros-n1: o valor inicial mais os mesmos juros todo mês', () => {
    for (const item of itens(g('juros-n1'))) {
      const [c, i, n] = inteiros(item)
      expect(valor(item) * CEM, item.enunciado).toBe((c * CEM + c * i * n) * ESCALA)
      expect(erroPara(item, (c * i * n * ESCALA) / CEM)).toBe('juros-sem-o-valor-inicial')
      const t = item.visual!.estado.tabela as { linhas: { valores: unknown[] }[] }
      expect(t.linhas[0].valores).toHaveLength(Number(n) + 1)
    }
  })
  it('juros-n2: multiplica pelo fator a cada mês; o total dos simples é erro mapeado', () => {
    for (const item of itens(g('juros-n2'))) {
      const [c, i, n] = inteiros(item)
      const k = Number(n)
      expect(valor(item) * CEM ** n, item.enunciado).toBe(c * ESCALA * (CEM + i) ** n)
      expect(valor(item) % B(10), 'exato em centavos').toBe(ZERO)
      expect(erroPara(item, ((c * CEM + c * i * n) * ESCALA) / CEM)).toBe('juros-compostos-como-simples')
      expect(erroPara(item, valor(item) - c * ESCALA)).toBe('juros-sem-o-valor-inicial')
      expect([2, 3]).toContain(k)
    }
  })
  it('juros-n3: o parcelado sobre o à vista, e os juros compostos pagos', () => {
    let parcelado = 0
    let juros = 0
    for (const item of itens(g('juros-n3'))) {
      if (/à vista/.test(item.enunciado)) {
        parcelado++
        const [v, n, q] = inteiros(item)
        const t = n * q
        expect(t > v).toBe(true)
        expect(valor(item) * v, item.enunciado).toBe((t - v) * CEM * ESCALA)
        expect(erroPara(item, (t - v) * ESCALA)).toBe('parte-como-porcentagem')
        const errado = divisao((t - v) * CEM, t)
        if (errado !== undefined && errado % B(10) === ZERO) expect(erroPara(item, errado)).toBe('porcentagem-sobre-o-valor-errado')
      } else {
        juros++
        const [c, n, i] = inteiros(item)
        expect(valor(item) * CEM ** n, item.enunciado).toBe(c * ESCALA * ((CEM + i) ** n - CEM ** n))
        expect(erroPara(item, (c * i * n * ESCALA) / CEM)).toBe('juros-compostos-como-simples')
      }
    }
    expect(parcelado).toBeGreaterThan(100)
    expect(juros).toBeGreaterThan(100)
  })
})
