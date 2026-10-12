import { describe, expect, it } from 'vitest'
import { GERADORES_U9B } from '@/content/matematica/geradores/medidas-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (e, na escolha, as opções) e refaz
// a conta por conta própria, sem usar as funções do gerador. Para fugir do
// ponto flutuante, todo decimal vira um inteiro de milionésimos: 2,54 é
// 2.540.000. Produtos de dois decimais são feitos em BigInt.

const g = (id: string) => GERADORES_U9B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const ESCALA = BigInt(1_000_000)
/** '2,54' → 2.540.000; '35.000' → 35.000.000.000 (em BigInt). Até 6 casas. */
function micro(t: string): bigint {
  const [a, b = ''] = t.replace(/\./g, '').split(',')
  expect(b.length, `"${t}" tem mais de 6 casas`).toBeLessThanOrEqual(6)
  return BigInt(a) * ESCALA + BigInt(b.padEnd(6, '0'))
}
/** Os números escritos num texto, na ordem, com milhar e vírgula ("35.000", "0,3048"). */
const numeros = (s: string) => [...s.matchAll(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g)].map((m) => m[0])
/** A resposta em milionésimos: texto com vírgula ou inteiro. */
function valor(item: Item): bigint {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta)).toBe(true)
    return BigInt(item.resposta) * ESCALA
  }
  expect(item.resposta, 'decimal com vírgula, sem ponto').toMatch(/^\d+,\d+$/)
  return micro(item.resposta)
}
/** O erro mapeado para a resposta errada que vale `m` milionésimos. */
function erroPara(item: Item, m: bigint): string | undefined {
  const k = Object.keys(item.erros).find((t) => micro(t) === m)
  return k === undefined ? undefined : item.erros[k]
}
/** a × b, os dois em milionésimos, de volta em milionésimos. */
const vezes = (a: bigint, b: bigint) => (a * b) / ESCALA
/** a ÷ b arredondado a 1 casa, em milionésimos. */
function divididoUmaCasa(a: bigint, b: bigint): bigint {
  const decimos = (a * BigInt(10) * BigInt(2) + b) / (b * BigInt(2))
  return decimos * (ESCALA / BigInt(10))
}

describe('U9 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U9B).toHaveLength(9)
    for (const aula of ['B.U9.A4', 'B.U9.A5', 'B.U9.A6']) {
      expect(GERADORES_U9B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('respostas decimais vêm com vírgula; nenhum erro mapeado vale a certa', () => {
    for (const ger of GERADORES_U9B) {
      for (const item of itens(ger)) {
        if (item.formato !== 'numero') continue
        const certa = valor(item)
        for (const t of Object.keys(item.erros)) expect(micro(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
      }
    }
  })
})

describe('U9 · aula 4: volume e o litro', () => {
  it('volume-litro-n1: litros vezes 1.000; os fatores 10 e 100 são erro de volume', () => {
    for (const item of itens(g('volume-litro-n1'))) {
      const [x] = numeros(item.enunciado)
      const l = micro(x)
      expect(item.enunciado).toMatch(/ L\b/)
      expect(valor(item), item.enunciado).toBe(l * BigInt(1000))
      expect(erroPara(item, l * BigInt(100))).toBe('converte-volume-como-comprimento')
      expect(erroPara(item, l * BigInt(10))).toBe('converte-volume-como-comprimento')
      expect(erroPara(item, l / BigInt(1000))).toBe('converte-no-sentido-errado')
      expect(item.visual?.estado.medida).toMatchObject({ porCasa: 3, de: 'dm³' })
    }
  })
  it('volume-litro-n2: m³ e litros nos dois sentidos, com 1 m³ = 1.000 L', () => {
    let ida = 0
    let volta = 0
    for (const item of itens(g('volume-litro-n2'))) {
      const [x] = numeros(item.enunciado)
      const v = micro(x)
      if (/m³\. Quantos litros/.test(item.enunciado)) {
        ida++
        expect(valor(item), item.enunciado).toBe(v * BigInt(1000))
        expect(erroPara(item, v)).toBe('confunde-m3-com-litro')
        expect(erroPara(item, v * BigInt(10))).toBe('converte-volume-como-comprimento')
        expect(erroPara(item, v * BigInt(100))).toBe('converte-volume-como-comprimento')
      } else {
        volta++
        expect(item.enunciado).toMatch(/ L\. Quantos m³/)
        expect(valor(item), item.enunciado).toBe(v / BigInt(1000))
        expect(v % BigInt(1000), 'o volume em m³ tem no máximo 1 casa').toBe(BigInt(0))
        expect(erroPara(item, v)).toBe('confunde-m3-com-litro')
        expect(erroPara(item, v / BigInt(100))).toBe('converte-volume-como-comprimento')
      }
    }
    expect(ida).toBeGreaterThan(50)
    expect(volta).toBeGreaterThan(50)
  })
  it('volume-litro-n3: as três medidas multiplicadas, em litros, sem visual', () => {
    for (const item of itens(g('volume-litro-n3'))) {
      const ns = numeros(item.enunciado).map(Number)
      expect(ns, item.enunciado).toHaveLength(3)
      const [a, b, c] = ns
      const cm3 = a * b * c
      expect(cm3 % 1000, 'litros inteiros').toBe(0)
      expect(item.resposta, item.enunciado).toBe(cm3 / 1000)
      expect(erroPara(item, BigInt(cm3 / 100) * ESCALA)).toBe('converte-volume-como-comprimento')
      expect(item.visual).toBeUndefined()
    }
  })
})

/** Os horários de um texto ("19 h 40", "21 h"), em minutos desde a meia-noite. */
const horarios = (s: string) => [...s.matchAll(/(\d{1,2}) h(?: (\d{2}))?/g)].map((m) => Number(m[1]) * 60 + Number(m[2] ?? 0))

describe('U9 · aula 5: tempo', () => {
  it('tempo-n1: horas com vírgula vezes 60; ler o depois da vírgula como minutos é erro', () => {
    for (const item of itens(g('tempo-n1'))) {
      const [x] = numeros(item.enunciado)
      const [h, frac = ''] = x.split(',')
      expect(frac.length, `${x}: uma hora não cheia`).toBeGreaterThan(0)
      // Em centésimos de hora, vezes 60 minutos, dividido por 100.
      const centesimos = Number(h) * 100 + Number(frac.padEnd(2, '0'))
      expect((centesimos * 60) % 100, 'minutos inteiros').toBe(0)
      expect(item.resposta, item.enunciado).toBe((centesimos * 60) / 100)
      // 1,5 h lido como 1 h 50 min.
      const comoMinutos = Number(h) * 60 + Number(frac.padEnd(2, '0'))
      expect(item.erros[String(comoMinutos)]).toBe('hora-decimal-como-minutos')
    }
  })
  it('tempo-n2: a soma passa da hora; a certa vira a hora, e 8 h 75 é erro', () => {
    for (const item of itens(g('tempo-n2'))) {
      const [inicio] = horarios(item.enunciado)
      const d = Number(item.enunciado.match(/(\d+) min/)![1])
      const fim = inicio + d
      expect(Math.floor(fim / 60), 'passa da hora').toBe(Math.floor(inicio / 60) + 1)
      const certa = `${Math.floor(fim / 60)} h ${String(fim % 60).padStart(2, '0')}`
      expect(item.opcoes![item.resposta as number], item.enunciado).toBe(certa)
      const baseCem = `${Math.floor(inicio / 60)} h ${(inicio % 60) + d}`
      const i = item.opcoes!.indexOf(baseCem)
      expect(i, `${item.enunciado}: falta a opção ${baseCem}`).toBeGreaterThanOrEqual(0)
      expect(item.erros[String(i)]).toBe('tempo-em-base-cem')
      for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
    }
  })
  it('tempo-n3: a duração em minutos; a subtração como números comuns é erro', () => {
    for (const item of itens(g('tempo-n3'))) {
      const ts = horarios(item.enunciado)
      expect(ts, item.enunciado).toHaveLength(2)
      const [a, b] = ts
      expect(b % 60, 'os minutos do fim são menos que os do começo').toBeLessThan(a % 60)
      expect(item.resposta, item.enunciado).toBe(b - a)
      // 21 h 15 − 19 h 40 como 2115 − 1940.
      const comum = (Math.floor(b / 60) * 100 + (b % 60)) - (Math.floor(a / 60) * 100 + (a % 60))
      expect(item.erros[String(comum)]).toBe('tempo-em-base-cem')
      expect(item.visual).toBeUndefined()
    }
  })
})

describe('U9 · aula 6: outras unidades', () => {
  const FATORES: [RegExp, string][] = [
    [/1 pol = 2,54 cm/, '2,54'],
    [/1 pé = 0,3048 m/, '0,3048'],
    [/1 milha náutica = 1,852 km/, '1,852'],
    [/1 milha ≈ 1,6 km/, '1,6'],
  ]
  /** O primeiro número do enunciado e o fator que ele mesmo dá. */
  function dados(item: Item): { n: bigint; f: bigint; nome: string } {
    const achado = FATORES.find(([re]) => re.test(item.enunciado))
    expect(achado, `${item.enunciado}: sem o fator`).toBeDefined()
    const [x] = numeros(item.enunciado)
    return { n: micro(x), f: micro(achado![1]), nome: achado![1] }
  }
  for (const id of ['fator-conversao-n1', 'fator-conversao-n2', 'fator-conversao-n3']) {
    it(`${id}: multiplica pelo fator ao ir, divide ao voltar`, () => {
      for (const item of itens(g(id))) {
        const { n, f } = dados(item)
        const volta = /Quantas polegadas/.test(item.enunciado)
        if (volta) {
          expect(valor(item) * f / ESCALA, item.enunciado).toBe(n)
          expect(erroPara(item, vezes(n, f))).toBe('converte-no-sentido-errado')
        } else {
          expect(valor(item), item.enunciado).toBe(vezes(n, f))
          // Dividir no lugar de multiplicar: arredondado a 1 casa, ou ao inteiro nas altitudes.
          expect(erroPara(item, divididoUmaCasa(n, f)) ?? erroPara(item, ((BigInt(2) * n + f) / (BigInt(2) * f)) * ESCALA), item.enunciado).toBe('converte-no-sentido-errado')
        }
      }
    })
  }
  it('a milha náutica com o fator da milha da estrada é erro mapeado', () => {
    let vistos = 0
    for (const id of ['fator-conversao-n2', 'fator-conversao-n3']) {
      for (const item of itens(g(id)).filter((i) => /náutica/.test(i.enunciado))) {
        vistos++
        const { n } = dados(item)
        expect(erroPara(item, vezes(n, micro('1,6')))).toBe('milha-nautica-igual-milha')
      }
    }
    expect(vistos).toBeGreaterThan(100)
  })
  it('nível 3 sem visual; níveis 1 e 2 com visual', () => {
    for (const item of itens(g('fator-conversao-n3'))) expect(item.visual).toBeUndefined()
    for (const id of ['fator-conversao-n1', 'fator-conversao-n2']) for (const item of itens(g(id))) expect(item.visual?.esboco).toBeTruthy()
  })
})
