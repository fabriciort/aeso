import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U03B } from '@/content/matematica/geradores/segundo-grau-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item, Rng } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. A equação do enunciado é lida por
// um avaliador pequeno, escrito aqui (2x^2 - 5x + 3); os coeficientes saem
// dos valores (P(0) é c; P(1) − P(−1) é 2b). As raízes são achadas por
// busca: cada número de uma grade fina que zera P, pondo-o no lugar do x.
// Quantas raízes há sai do menor valor de P, no meio da parábola (o
// quadrado completado): negativo, duas; zero, uma; positivo, nenhuma. Os
// problemas são refeitos pelo próprio problema: o lado que dá a área, a
// largura que dá o quadro.

const g = (id: string) => GERADORES_AF_U03B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = '\u00a0'

/** Avalia uma expressão em x: '2x^2 - 5x + 3', '-x^2 + 4'. */
function avalia(tex: string, x: number): number {
  const s = tex.replace(/\\cdot/g, '*').replace(/−/g, '-').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\s+/g, '')
  let i = 0
  const peek = () => s[i]
  function expr(): number {
    let v = termo()
    while (peek() === '+' || peek() === '-') {
      const op = s[i++]
      const t = termo()
      v = op === '+' ? v + t : v - t
    }
    return v
  }
  function termo(): number {
    let v = junto()
    while (peek() === '*') {
      i++
      v *= junto()
    }
    return v
  }
  function junto(): number {
    let v = fator()
    while (peek() === 'x' || peek() === '(' || /\d/.test(peek() ?? '')) v *= fator()
    return v
  }
  function fator(): number {
    if (peek() === '-') {
      i++
      return -fator()
    }
    const b = atomo()
    if (peek() === '^') {
      i++
      return b ** atomo()
    }
    return b
  }
  function atomo(): number {
    const c = peek()
    if (c === '(') {
      i++
      const v = expr()
      expect(s[i], `"${tex}": falta fechar parênteses`).toBe(')')
      i++
      return v
    }
    if (c === 'x') {
      i++
      return x
    }
    const m = s.slice(i).match(/^\d+/)
    expect(m, `"${tex}": não entendi em "${s.slice(i)}"`).not.toBeNull()
    i += m![0].length
    return Number(m![0])
  }
  const v = expr()
  expect(i, `"${tex}": sobrou "${s.slice(i)}"`).toBe(s.length)
  return v
}

const texs = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
const inteiros = (s: string) => [...s.replace(/\$[^$]*\$/g, '').matchAll(/\d+/g)].map((m) => Number(m[0]))

type P = (x: number) => number
/** A equação do enunciado (o primeiro TeX que termina em "= 0"): o lado esquerdo como função. */
function equacao(item: Item): P {
  const t = texs(item.enunciado).find((x) => / = 0$/.test(x))
  expect(t, `${item.enunciado}: sem a equação`).toBeDefined()
  const esq = t!.replace(/ = 0$/, '')
  return (x) => avalia(esq, x)
}
/** [a, b, c] pelos valores. */
const coef = (p: P): [number, number, number] => [(p(1) + p(-1)) / 2 - p(0), (p(1) - p(-1)) / 2, p(0)]
/** As raízes na grade de passo `passo`, de −60 a 60, pondo cada número no lugar do x. */
function raizesNaGrade(p: P, passo: number): number[] {
  const out: number[] = []
  for (let k = Math.round(-60 / passo); k <= Math.round(60 / passo); k++) {
    const x = k * passo
    if (Math.abs(p(x)) < 1e-9) out.push(x)
  }
  return out
}
/** Quantas raízes: o menor valor de P (a > 0), no meio, x = −b/2a. */
function quantasPeloMeio(p: P): number {
  const [a, b] = coef(p)
  expect(a).toBeGreaterThan(0)
  const menor = p(-b / (2 * a))
  return Math.abs(menor) < 1e-9 ? 1 : menor < 0 ? 2 : 0
}

/** O número como o aluno digita: '−2,5' → −2,5. */
const valor = (t: string | number) => {
  if (typeof t === 'number') return t
  expect(t, 'o número se escreve com o menos verdadeiro').not.toMatch(/-/)
  return Number(t.replace('−', '-').replace(',', '.'))
}
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => Math.abs(valor(t) - v) < 1e-9)
  return k === undefined ? undefined : item.erros[k]
}
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-9

describe('Álgebra e Funções, unidade 3 (aulas 5 a 7) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U03B).toHaveLength(9)
    for (const aula of ['AF.U3.A5', 'AF.U3.A6', 'AF.U3.A7']) {
      expect(GERADORES_AF_U03B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U03B) {
      expect(ger.id).toMatch(/^segundo-grau-(formula|discriminante|problemas)-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) {
          expect(item.visual, ger.id).toBeDefined()
          expect(item.visual!.esboco).toBeTruthy()
        } else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })

  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; espaço que não quebra; opções diferentes', () => {
    for (const ger of GERADORES_AF_U03B) {
      for (const item of itens(ger)) {
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        for (const t of textos) expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        for (const t of textos) expect(t, `${ger.id}: unidade sem espaço que não quebra em "${t}"`).not.toMatch(/[\d$] (m|cm)(²|\b)/)
        for (const t of textos) for (const x of texs(t)) expect(x, `${ger.id}: menos verdadeiro dentro do TeX em "${t}"`).not.toMatch(/−/)
        if (item.formato === 'escolha') {
          expect(item.opcoes!.length).toBeGreaterThanOrEqual(3)
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          expect(Object.keys(item.erros).length, item.enunciado).toBe(item.opcoes!.length - 1)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const certa = valor(item.resposta)
        for (const k of Object.keys(item.erros)) expect(valor(k), `${ger.id}: o erro "${k}" vale a certa`).not.toBe(certa)
        // Toda resposta que pode ser negativa leva a tecla do menos.
        if (Object.keys(item.erros).some((k) => valor(k) < 0) || certa < 0) expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
      }
    }
  })

  it('termina com um rng que sempre dá o mínimo ou o máximo', () => {
    for (const superior of [false, true]) {
      const borda: Rng = { int: (min, max) => (superior ? max : min), pick: (xs) => xs[superior ? xs.length - 1 : 0], next: () => (superior ? 0.999 : 0) }
      for (const ger of GERADORES_AF_U03B) {
        const item = ger.gerar(borda)
        expect(item.resposta, ger.id).toBeDefined()
        expect(Object.keys(item.erros), ger.id).not.toContain(String(item.resposta))
      }
    }
  })

  // ---------------------------------------------------------------- a fórmula

  it('formula-n1: a maior raiz de x² + bx + c = 0, com os azulejos de x² + bx = −c', () => {
    for (const item of itens(g('segundo-grau-formula-n1'))) {
      expect(negritos(item.enunciado)).toEqual(['maior'])
      const p = equacao(item)
      const [a, b, c] = coef(p)
      expect(a).toBe(1)
      const rs = raizesNaGrade(p, 1)
      expect(rs, item.enunciado).toHaveLength(2)
      const maior = Math.max(...rs)
      expect(item.resposta).toBe(maior)
      expect(item.sinal).toBe(true)
      const az = (item.visual!.estado as { azulejos: { completar: number; igual: number } }).azulejos
      expect(az.completar).toBe(b)
      expect(az.igual).toBe(-c)
      // Com +b, as raízes trocam de sinal; dividir só a raiz; esquecer de dividir.
      const raiz = Math.sqrt(b * b - 4 * c)
      // O primeiro tem a vez quando dois erros dão o mesmo número; os outros, ao menos mapeados.
      expect(erroPara(item, Math.max(...rs.map((x) => -x)))).toBe('formula-sinal-do-b')
      for (const v of [-b + raiz / 2, -b + raiz]) expect(erroPara(item, v), `${item.enunciado}: ${v}`).toBeDefined()
    }
  })

  /** As duas raízes de uma opção: '\frac{2 \pm \sqrt{16}}{2}' ou '2 \pm \frac{\sqrt{16}}{2}'. */
  function raizesDaOpcao(o: string): { valores: number[]; forma: 'fracao' | 'solta'; n: number; d: number; e: number } {
    const t = o.replace(/\$/g, '')
    let m = t.match(/^\\frac\{(-?\d+) \\pm \\sqrt\{(-?\d+)\}\}\{(\d+)\}$/)
    if (m) {
      const [n, d, e] = [Number(m[1]), Number(m[2]), Number(m[3])]
      return { valores: [(n + Math.sqrt(d)) / e, (n - Math.sqrt(d)) / e], forma: 'fracao', n, d, e }
    }
    m = t.match(/^(-?\d+) \\pm \\frac\{\\sqrt\{(-?\d+)\}\}\{(\d+)\}$/)
    expect(m, `opção "${o}"`).not.toBeNull()
    const [n, d, e] = [Number(m![1]), Number(m![2]), Number(m![3])]
    return { valores: [n + Math.sqrt(d) / e, n - Math.sqrt(d) / e], forma: 'solta', n, d, e }
  }
  const mesmoPar = (x: number[], y: number[]) => {
    const [a, b] = [...x].sort((u, v) => u - v)
    const [c, d] = [...y].sort((u, v) => u - v)
    return perto(a, c) && perto(b, d)
  }

  it('formula-n2: a fórmula montada dá as raízes; as erradas não', () => {
    for (const item of itens(g('segundo-grau-formula-n2'))) {
      expect(item.formato).toBe('escolha')
      const p = equacao(item)
      const [a, b, c] = coef(p)
      expect(b < 0 || c < 0, `${item.enunciado}: sem sinal que pega`).toBe(true)
      const rs = raizesNaGrade(p, 1)
      expect(rs, item.enunciado).toHaveLength(2)
      item.opcoes!.forEach((o, i) => {
        const op = raizesDaOpcao(o)
        if (i === item.resposta) {
          expect(mesmoPar(op.valores, rs), `${item.enunciado}: a certa "${o}" não dá as raízes`).toBe(true)
          return
        }
        expect(op.valores.some(Number.isNaN) || !mesmoPar(op.valores, rs), `${item.enunciado}: a errada "${o}" dá as raízes`).toBe(true)
        const esperado =
          op.forma === 'solta' ? 'divide-so-a-raiz' : op.n === b ? 'formula-sinal-do-b' : op.d !== b * b - 4 * a * c ? (c < 0 ? 'sinais-iguais-da-negativo' : 'termo-perde-o-sinal') : undefined
        expect(item.erros[String(i)], `${item.enunciado}: "${o}"`).toBe(esperado)
        if (op.forma === 'fracao' && op.n === -b) expect(op.d).toBe(b * b + 4 * a * c)
      })
    }
  })

  it('formula-n3: a maior ou a menor raiz de 2x² + bx + c = 0, que pode ser decimal', () => {
    for (const item of itens(g('segundo-grau-formula-n3'))) {
      const [qual] = negritos(item.enunciado)
      expect(['maior', 'menor']).toContain(qual)
      const p = equacao(item)
      const [a, b, c] = coef(p)
      expect(a).toBe(2)
      const rs = raizesNaGrade(p, 0.5)
      expect(rs, item.enunciado).toHaveLength(2)
      const escolhe = (xs: number[]) => (qual === 'maior' ? Math.max(...xs) : Math.min(...xs))
      const certa = escolhe(rs)
      expect(valor(item.resposta), item.enunciado).toBe(certa)
      // Um decimal vem como texto com vírgula; um inteiro, como número.
      if (Number.isInteger(certa)) expect(typeof item.resposta).toBe('number')
      else expect(item.resposta).toMatch(/^−?\d+,5$/)
      expect(item.sinal).toBe(true)
      const raiz = Math.sqrt(b * b - 4 * a * c)
      const casos: [number, string][] = [
        [escolhe(rs.map((x) => -x)), 'formula-sinal-do-b'],
        [escolhe([-b + raiz / (2 * a), -b - raiz / (2 * a)]), 'divide-so-a-raiz'],
        [escolhe([-b + raiz, -b - raiz]), 'esquece-de-dividir'],
      ]
      for (const [v, e] of casos) if (!perto(v, certa)) expect(erroPara(item, v), `${item.enunciado}: ${v} (${e})`).toBeDefined()
      expect(erroPara(item, casos[0][0])).toBe('formula-sinal-do-b')
    }
  })

  // ---------------------------------------------------------------- o discriminante

  it('discriminante-n1: quantas raízes, com os azulejos de x² + bx = −c', () => {
    const vistos = new Set<number>()
    for (const item of itens(g('segundo-grau-discriminante-n1'))) {
      const p = equacao(item)
      const [a, b, c] = coef(p)
      expect(a).toBe(1)
      expect(c, item.enunciado).not.toBe(0)
      const n = quantasPeloMeio(p)
      vistos.add(n)
      expect(item.resposta, item.enunciado).toBe(n)
      const az = (item.visual!.estado as { azulejos: { completar: number; igual: number; completo?: boolean } }).azulejos
      expect(az.completar).toBe(b)
      expect(az.igual).toBe(-c)
      expect(az.completo, 'o quadrado completo entregaria a resposta').toBeUndefined()
      if (n === 0) expect(erroPara(item, 2)).toBe('raiz-de-numero-negativo')
      if (n === 1) {
        expect(erroPara(item, 0)).toBe('discriminante-zero-nenhuma-raiz')
        expect(erroPara(item, 2)).toBe('discriminante-zero-da-duas')
      }
    }
    expect([...vistos].sort()).toEqual([0, 1, 2])
  })

  it('discriminante-n2: o valor de b² − 4ac, com b ou c negativo', () => {
    for (const item of itens(g('segundo-grau-discriminante-n2'))) {
      const p = equacao(item)
      const [a, b, c] = coef(p)
      expect(b < 0 || c < 0, item.enunciado).toBe(true)
      const delta = b * b - 4 * a * c
      expect(item.resposta, item.enunciado).toBe(delta)
      expect(item.sinal).toBe(true)
      // Conferência: o menor valor de P é −Δ/4a.
      expect(perto(p(-b / (2 * a)), -delta / (4 * a))).toBe(true)
      if (b < 0 && -b * b - 4 * a * c !== delta) expect(erroPara(item, -b * b - 4 * a * c)).toBe('potencia-sinal-fora-dos-parenteses')
      if (c < 0) expect(erroPara(item, b * b + 4 * a * c)).toBeDefined()
    }
  })

  it('discriminante-n3: quantas raízes com a diferente de 1, ou o número que deixa uma raiz só', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('segundo-grau-discriminante-n3'))) {
      if (item.enunciado.includes('\\square')) {
        vistos.add('uma')
        expect(negritos(item.enunciado)).toEqual(['uma'])
        const t = texs(item.enunciado).find((x) => x.includes('\\square = 0'))!
        const k = Number(item.resposta)
        const p: P = (x) => avalia(t.replace(' = 0', '').replace('\\square', `(${k})`), x)
        expect(quantasPeloMeio(p), item.enunciado).toBe(1)
        expect(raizesNaGrade(p, 1), item.enunciado).toHaveLength(1)
        const [, b] = coef(p)
        expect(erroPara(item, b * b)).toBe('completa-com-b-ao-quadrado')
        if (Math.abs(b / 2) !== k) expect(erroPara(item, Math.abs(b / 2))).toBe('completa-com-a-metade')
        continue
      }
      const p = equacao(item)
      const [a] = coef(p)
      expect(a, item.enunciado).toBeGreaterThan(1)
      const n = quantasPeloMeio(p)
      vistos.add(String(n))
      expect(item.resposta, item.enunciado).toBe(n)
      if (n === 0) expect(erroPara(item, 2)).toBe('raiz-de-numero-negativo')
      if (n === 1) expect(erroPara(item, 0)).toBe('discriminante-zero-nenhuma-raiz')
    }
    expect([...vistos].sort()).toEqual(['0', '1', '2', 'uma'])
  })

  // ---------------------------------------------------------------- problemas

  it('problemas-n1: o lado menor do terreno, e o −(lado maior) não serve', () => {
    for (const item of itens(g('segundo-grau-problemas-n1'))) {
      expect(item.enunciado).toContain(`${NB}m maior`)
      expect(negritos(item.enunciado)).toEqual(['menor'])
      const [k, area] = inteiros(item.enunciado)
      const lados = Array.from({ length: 100 }, (_, i) => i + 1).filter((x) => x * (x + k) === area)
      expect(lados, item.enunciado).toHaveLength(1)
      expect(item.resposta).toBe(lados[0])
      // A outra raiz da equação é negativa e também dá a área.
      const negativa = -(lados[0] + k)
      expect(negativa * (negativa + k)).toBe(area)
      expect(erroPara(item, negativa)).toBe('aceita-raiz-negativa-no-problema')
      expect(erroPara(item, lados[0] + k)).toBe('responde-outra-pergunta')
      const est = item.visual!.estado as { base: unknown[]; altura: unknown[]; total: string }
      expect(est.base).toEqual(['x', k])
      expect(est.altura).toEqual(['x'])
      expect(est.total).toBe(`área: ${area}${NB}m²`)
    }
  })

  it('problemas-n2: a largura da moldura', () => {
    for (const item of itens(g('segundo-grau-problemas-n2'))) {
      const [p, q, area] = inteiros(item.enunciado)
      expect(p).toBeGreaterThan(q)
      const ws = Array.from({ length: 50 }, (_, i) => i + 1).filter((w) => (p + 2 * w) * (q + 2 * w) === area)
      expect(ws, item.enunciado).toHaveLength(1)
      expect(item.resposta).toBe(ws[0])
      // A raiz negativa, na grade de meios, também dá a área.
      const negs = raizesNaGrade((x) => (p + 2 * x) * (q + 2 * x) - area, 0.5).filter((x) => x < 0)
      expect(negs).toHaveLength(1)
      expect(erroPara(item, negs[0])).toBe('aceita-raiz-negativa-no-problema')
      // A moldura de um lado só, quando dá um número que se digita.
      const umLado = raizesNaGrade((x) => (p + x) * (q + x) - area, 0.5).filter((x) => x > 0)
      if (umLado.length) expect(erroPara(item, umLado[0])).toBe('moldura-so-de-um-lado')
    }
  })

  it('problemas-n3: os dois números, ou o lado do quadrado que cresce', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('segundo-grau-problemas-n3'))) {
      if (item.enunciado.startsWith('Dois números')) {
        vistos.add('dois')
        expect(negritos(item.enunciado)).toEqual(['maior'])
        const [s, prod] = inteiros(item.enunciado)
        const us = Array.from({ length: s + 1 }, (_, i) => i).filter((u) => u * (s - u) === prod)
        expect(us.length, item.enunciado).toBe(2)
        expect(item.resposta).toBe(Math.max(...us))
        expect(erroPara(item, Math.min(...us))).toBe('responde-outra-pergunta')
        continue
      }
      vistos.add('quadrado')
      const [k, area] = inteiros(item.enunciado)
      const xs = Array.from({ length: 50 }, (_, i) => i + 1).filter((x) => (x + k) ** 2 === area)
      expect(xs, item.enunciado).toHaveLength(1)
      expect(item.resposta).toBe(xs[0])
      expect(item.sinal).toBe(true)
      const negs = raizesNaGrade((x) => (x + k) ** 2 - area, 1).filter((x) => x < 0)
      expect(negs).toHaveLength(1)
      expect(erroPara(item, negs[0])).toBe('aceita-raiz-negativa-no-problema')
      expect(erroPara(item, xs[0] + k)).toBe('responde-outra-pergunta')
      const semMeio = Array.from({ length: 50 }, (_, i) => i + 1).filter((x) => x * x + k * k === area)
      if (semMeio.length) expect(erroPara(item, semMeio[0])).toBe('quadrado-da-soma-sem-o-meio')
    }
    expect([...vistos].sort()).toEqual(['dois', 'quadrado'])
  })
})
