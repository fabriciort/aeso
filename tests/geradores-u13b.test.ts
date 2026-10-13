import { describe, expect, it } from 'vitest'
import { GERADORES_U13B } from '@/content/matematica/geradores/potencias-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (o negrito e o TeX) e refaz a conta
// por conta própria, sem usar as funções do gerador. Para fugir do ponto
// flutuante, todo número vira um inteiro em BigInt, na escala de 10⁻²⁰:
// 0,00007 é 7 × 10¹⁵ e 150.000.000 é 15 × 10²⁷.

const g = (id: string) => GERADORES_U13B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const CASAS = 20
const B = (n: number | string) => BigInt(n)
const p10 = (n: number) => B(10) ** B(n)

/** '150.000.000', '0,00007', '−5', '1{,}5' → o número na escala de 10⁻²⁰. */
function val(t: string): bigint {
  const s = t.trim().replace(/\{,\}/g, ',').replace(/\./g, '').replace(/−/g, '-')
  const neg = s.startsWith('-')
  const [a, b = ''] = (neg ? s.slice(1) : s).split(',')
  expect(a, `"${t}" não é um número`).toMatch(/^\d+$/)
  expect(b, `"${t}" não é um número`).toMatch(/^\d*$/)
  expect(b.length).toBeLessThanOrEqual(CASAS)
  const v = B(a) * p10(CASAS) + B(b.padEnd(CASAS, '0') || '0')
  return neg ? -v : v
}
/** a × 10ⁿ na mesma escala. */
const vezes10 = (a: bigint, n: number) => (n >= 0 ? a * p10(n) : (expect(a % p10(-n), 'cabe na escala').toBe(B(0)), a / p10(-n)))
/** A resposta do item na escala. */
function resposta(item: Item): bigint {
  if (typeof item.resposta === 'number') {
    expect(Number.isInteger(item.resposta), `${item.enunciado}: decimal deveria ir como texto com vírgula`).toBe(true)
    return B(item.resposta) * p10(CASAS)
  }
  expect(item.resposta, 'decimal com vírgula, sem ponto').toMatch(/^−?\d+,\d+$/)
  return val(item.resposta)
}
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: bigint) => {
  const k = Object.keys(item.erros).find((t) => val(t) === v)
  return k === undefined ? undefined : item.erros[k]
}
const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** "$1{,}5 \times 10^{8}$" → [1,5 na escala, 8]; com "?" no expoente, n = null. */
function cientifica(t: string): [bigint, number | null] {
  const m = t.match(/\$(\d+(?:\{,\}\d+)?) \\times 10\^\{(-?\d+|\?)\}\$/)
  expect(m, `"${t}" sem a × 10ⁿ`).not.toBeNull()
  return [val(m![1]), m![2] === '?' ? null : Number(m![2])]
}
/** O maior inteiro cujo quadrado (ou cubo) não passa de x, por busca. */
const raiz = (x: number, grau = 2) => {
  let k = 0
  while ((k + 1) ** grau <= x) k++
  return k
}
const UM = p10(CASAS)
const DEZ = p10(CASAS + 1)

describe('U13 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U13B).toHaveLength(9)
    for (const aula of ['B.U13.A4', 'B.U13.A5', 'B.U13.A6']) {
      expect(GERADORES_U13B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; quem pede expoente tem a tecla do menos', () => {
    for (const ger of GERADORES_U13B) {
      for (const item of itens(ger)) {
        if (item.formato === 'escolha') {
          expect(item.opcoes!.length).toBeGreaterThanOrEqual(2)
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const certa = resposta(item)
        for (const t of Object.keys(item.erros)) {
          expect(t, 'o erro se escreve com o menos verdadeiro').not.toMatch(/-/)
          expect(val(t), `${item.enunciado}: o erro "${t}" vale a resposta certa`).not.toBe(certa)
        }
        if (/expoente\?/.test(item.enunciado)) expect(item.sinal, item.enunciado).toBe(true)
      }
    }
  })
  it('nível 1 com visual e esboço; níveis 2 e 3 sem visual', () => {
    for (const id of ['notacao-cientifica-n1', 'raiz-quadrada-n1', 'estimar-raiz-n1']) {
      for (const item of itens(g(id))) expect(item.visual?.esboco).toBeTruthy()
    }
    for (const id of ['notacao-cientifica-n2', 'notacao-cientifica-n3', 'raiz-quadrada-n2', 'raiz-quadrada-n3', 'estimar-raiz-n2', 'estimar-raiz-n3']) {
      for (const item of itens(g(id))) expect(item.visual).toBeUndefined()
    }
  })
})

describe('U13 · aula 4: notação científica', () => {
  it('notacao-cientifica-n1: o expoente de d seguido de zeros, com o quadro de potências', () => {
    for (const item of itens(g('notacao-cientifica-n1'))) {
      const [t] = negritos(item.enunciado)
      const N = val(t)
      const [a, n] = cientifica(item.enunciado)
      expect(n).toBeNull()
      expect(a % UM, 'um algarismo só').toBe(B(0))
      expect(a >= UM && a < DEZ).toBe(true)
      expect(vezes10(a, item.resposta as number), item.enunciado).toBe(N)
      const e = item.resposta as number
      expect(erroPara(item, B(e + 1) * UM)).toBe('expoente-conta-os-zeros')
      expect(erroPara(item, B(-e) * UM)).toBe('expoente-com-sinal-trocado')
      const m = (item.visual!.estado as { medida: { casas: string[]; numero: string; de: string } }).medida
      expect(m.numero).toBe(t)
      expect(m.casas).toHaveLength(e + 1)
      expect(m.de).toBe('× 1')
    }
  })
  it('notacao-cientifica-n2: expoentes de números grandes e pequenos, e a forma certa', () => {
    const vistos = { grande: 0, pequeno: 0, forma: 0 }
    for (const item of itens(g('notacao-cientifica-n2'))) {
      const [t] = negritos(item.enunciado)
      const N = val(t)
      if (item.formato === 'escolha') {
        vistos.forma++
        expect(item.enunciado).toMatch(/^Os três valem/)
        const formas = item.opcoes!.map(cientifica)
        for (const [a, n] of formas) expect(vezes10(a, n!), `${item.opcoes} valem ${t}`).toBe(N)
        const dentro = formas.map(([a]) => a >= UM && a < DEZ)
        expect(dentro.filter(Boolean)).toHaveLength(1)
        expect(item.resposta).toBe(dentro.indexOf(true))
        const erradas = Object.fromEntries([0, 1, 2].filter((i) => i !== item.resposta).map((i) => [String(i), 'notacao-fora-de-1-a-10']))
        expect(item.erros).toEqual(erradas)
        continue
      }
      expect(item.enunciado).toMatch(/Qual é o expoente\?$/)
      const [a, n] = cientifica(item.enunciado)
      expect(n).toBeNull()
      expect(a >= UM && a < DEZ, 'a mantissa está entre 1 e 10').toBe(true)
      const e = item.resposta as number
      expect(vezes10(a, e), item.enunciado).toBe(N)
      if (N >= UM) {
        vistos.grande++
        expect(e).toBeGreaterThan(0)
        expect(a % UM, 'dois algarismos: o caso que pega').not.toBe(B(0))
        // Os zeros de 150.000.000 são 7, os algarismos são 9.
        const zeros = t.replace(/\D/g, '').replace(/[1-9]/g, '').length
        expect(erroPara(item, B(zeros) * UM)).toBe('expoente-conta-os-zeros')
        expect(erroPara(item, B(t.replace(/\D/g, '').length) * UM)).toBe('expoente-conta-os-zeros')
      } else {
        vistos.pequeno++
        expect(e).toBeLessThan(0)
        expect(erroPara(item, B(-e) * UM)).toBe('expoente-com-sinal-trocado')
        // Os zeros depois da vírgula de 0,00007 são 4.
        const zerosDepois = t.split(',')[1].match(/^0*/)![0].length
        expect(erroPara(item, B(-zerosDepois) * UM)).toBe('expoente-conta-os-zeros')
      }
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(60)
  })
  it('notacao-cientifica-n3: de volta sem a potência, números grandes e pequenos', () => {
    const vistos = { grande: 0, pequeno: 0, tresAlgarismos: 0 }
    for (const item of itens(g('notacao-cientifica-n3'))) {
      expect(item.enunciado).toMatch(/Escreva o número sem a potência de 10\.$/)
      const [a, n] = cientifica(item.enunciado)
      expect(a >= UM && a < DEZ).toBe(true)
      if ((a * B(10)) % UM !== B(0)) vistos.tresAlgarismos++
      const certa = vezes10(a, n!)
      expect(resposta(item), item.enunciado).toBe(certa)
      if (n! > 0) {
        vistos.grande++
        expect(typeof item.resposta).toBe('number')
        // Quem põe n zeros depois de todos os algarismos da mantissa.
        const digitos = a.toString().replace(/0+$/, '')
        expect(erroPara(item, B(digitos + '0'.repeat(n!)) * UM)).toBe('expoente-conta-os-zeros')
      } else {
        vistos.pequeno++
        expect(item.enunciado).toMatch(/m de espessura/)
        expect(certa < UM).toBe(true)
        expect(erroPara(item, vezes10(a, -n!))).toBe('expoente-com-sinal-trocado')
        expect(erroPara(item, vezes10(a, n! - 1))).toBe('expoente-conta-os-zeros')
      }
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(40)
  })
})

describe('U13 · aula 5: raiz quadrada', () => {
  it('raiz-quadrada-n1: a raiz de um quadrado até 10 × 10, com o quadrado na tela', () => {
    for (const item of itens(g('raiz-quadrada-n1'))) {
      const A = Number(item.enunciado.match(/\\sqrt\{(\d+)\}/)![1])
      expect(Number(negritos(item.enunciado)[0])).toBe(A)
      const n = item.resposta as number
      expect(n * n, item.enunciado).toBe(A)
      expect(n).toBeGreaterThan(0)
      expect(n).toBeLessThanOrEqual(10)
      expect(item.visual!.estado).toMatchObject({ linhas: n, colunas: n, total: A })
      if (A % 2 === 0 && A / 2 !== n) expect(erroPara(item, B(A / 2) * UM)).toBe('raiz-e-a-metade')
    }
  })
  it('raiz-quadrada-n2: quadrados até 144 e a raiz de uma soma', () => {
    let soma = 0
    for (const item of itens(g('raiz-quadrada-n2'))) {
      const m = item.enunciado.match(/\\sqrt\{(\d+)(?: \+ (\d+))?\}/)!
      const x = Number(m[1])
      const y = m[2] === undefined ? 0 : Number(m[2])
      const n = item.resposta as number
      expect(n * n, item.enunciado).toBe(x + y)
      if (m[2] !== undefined) {
        soma++
        expect(item.enunciado, 'a fórmula inteira entre chaves').toMatch(/\$\{\\sqrt\{\d+ \+ \d+\}\}\$/)
        const [rx, ry] = [raiz(x), raiz(y)]
        expect(rx * rx).toBe(x)
        expect(ry * ry).toBe(y)
        expect(erroPara(item, B(rx + ry) * UM)).toBe('raiz-da-soma-separada')
      } else {
        expect(n).toBeGreaterThanOrEqual(7)
        expect(n).toBeLessThanOrEqual(12)
        if (x % 2 === 0) expect(erroPara(item, B(x / 2) * UM)).toBe('raiz-e-a-metade')
      }
    }
    expect(soma).toBeGreaterThan(100)
    expect(soma).toBeLessThan(200)
  })
  it('raiz-quadrada-n3: cerca da horta, quarto do tamanho da sala e azulejo', () => {
    const vistos = { cerca: 0, quarto: 0, azulejo: 0 }
    for (const item of itens(g('raiz-quadrada-n3'))) {
      const b = negritos(item.enunciado)
      const certa = item.resposta as number
      if (/cerca/.test(item.enunciado)) {
        vistos.cerca++
        const A = Number(b[0].replace('\u00a0m²', ''))
        const lado = raiz(A)
        expect(lado * lado).toBe(A)
        expect(certa, item.enunciado).toBe(4 * lado)
        expect(erroPara(item, B(A) * UM)).toBe('confunde-area-perimetro')
      } else if (/quarto/.test(item.enunciado)) {
        vistos.quarto++
        const [x, y] = b.map((t) => Number(t.replace('\u00a0m', '')))
        expect(x).not.toBe(y)
        expect(certa * certa, item.enunciado).toBe(x * y)
      } else {
        vistos.azulejo++
        expect(item.enunciado).toMatch(/azulejo/)
        const A = Number(b[0].replace('\u00a0cm²', '').replace(/\./g, ''))
        expect(certa * certa, item.enunciado).toBe(A)
        expect(certa % 10).toBe(0)
        expect(erroPara(item, B(A / 2) * UM)).toBe('raiz-e-a-metade')
        expect(erroPara(item, B(A / 4) * UM)).toBe('confunde-area-perimetro')
      }
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(60)
  })
})

describe('U13 · aula 6: estimar raízes e raiz cúbica', () => {
  /** "Entre 4 e 5" ou "Entre 4 m e 5 m" → [4, 5]. */
  const entre = (t: string) => {
    const m = t.match(/^Entre (\d+)(?:\u00a0m)? e (\d+)(?:\u00a0m)?$/)
    expect(m, t).not.toBeNull()
    return [Number(m![1]), Number(m![2])]
  }
  /** Confere a escolha "entre quais": os lados (certa), os quadrados e a metade. */
  function confereEntre(item: Item, x: number) {
    const ops = item.opcoes!.map(entre)
    const certa = ops.findIndex(([p, q]) => q === p + 1 && p * p < x && x < q * q)
    expect(certa, `${item.enunciado}: uma opção com os lados`).toBeGreaterThanOrEqual(0)
    expect(item.resposta).toBe(certa)
    const k = ops[certa][0]
    const quadrados = ops.findIndex(([p, q]) => p === k * k && q === (k + 1) * (k + 1))
    const metade = ops.findIndex(([p, q]) => p === Math.floor(x / 2) && q === p + 1)
    expect(item.erros[String(quadrados)]).toBe('estima-com-os-quadrados')
    expect(item.erros[String(metade)]).toBe('raiz-e-a-metade')
  }

  it('estimar-raiz-n1: entre quais inteiros, com o quadrado e a sobra na tela', () => {
    for (const item of itens(g('estimar-raiz-n1'))) {
      expect(item.formato).toBe('escolha')
      const x = Number(item.enunciado.match(/\\sqrt\{(\d+)\}/)![1])
      const k = raiz(x)
      expect(k * k, 'não é um quadrado').not.toBe(x)
      confereEntre(item, x)
      expect(item.visual!.estado).toMatchObject({ linhas: k, colunas: k, sobra: x - k * k })
    }
  })
  it('estimar-raiz-n2: a raiz cúbica de um cubo e o teste do meio', () => {
    const vistos = { cubica: 0, meio: 0 }
    for (const item of itens(g('estimar-raiz-n2'))) {
      const cubo = item.enunciado.match(/\\sqrt\[3\]\{([\d.]+)\}/)
      if (cubo) {
        vistos.cubica++
        const c = Number(cubo[1].replace(/\./g, ''))
        const n = item.resposta as number
        expect(n ** 3, item.enunciado).toBe(c)
        if (c % 3 === 0) expect(erroPara(item, B(c / 3) * UM)).toBe('raiz-cubica-e-dividir-por-3')
        continue
      }
      vistos.meio++
      const m = item.enunciado.match(/\$(\d+)\{,\}5 \\times (\d+)\{,\}5\$/)!
      expect(m[1]).toBe(m[2])
      const k = B(m[1])
      const meio = k * UM + UM / B(2)
      expect(resposta(item), item.enunciado).toBe((meio * meio) / UM)
      expect(erroPara(item, k * k * UM + UM / B(4))).toBe('multiplica-partes-separadas')
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(100)
  })
  it('estimar-raiz-n3: a horta e a caixa cúbica', () => {
    const vistos = { horta: 0, caixa: 0 }
    for (const item of itens(g('estimar-raiz-n3'))) {
      const [t] = negritos(item.enunciado)
      if (item.formato === 'escolha') {
        vistos.horta++
        expect(item.enunciado).toMatch(/horta quadrada/)
        const x = Number(t.replace('\u00a0m²', ''))
        expect(raiz(x) ** 2).not.toBe(x)
        confereEntre(item, x)
        continue
      }
      vistos.caixa++
      expect(item.enunciado).toMatch(/cubo/)
      const c = Number(t.replace('\u00a0L', '').replace(/\./g, ''))
      const n = item.resposta as number
      expect(n ** 3, item.enunciado).toBe(c)
      if (c % 3 === 0) expect(erroPara(item, B(c / 3) * UM)).toBe('raiz-cubica-e-dividir-por-3')
    }
    for (const n of Object.values(vistos)) expect(n).toBeGreaterThan(100)
  })
})
