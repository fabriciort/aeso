import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U02B } from '@/content/matematica/geradores/fatoracao-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. As expressões (do enunciado e das
// opções) são lidas por um avaliador pequeno, escrito aqui, que entende a
// escrita junta (3x, 2x(x + 1), (x + 2)(x + 3)), as potências (x^2, x^{3})
// e o \cdot: duas expressões são a mesma quando dão o mesmo número para
// vários valores de x. Os coeficientes de um trinômio saem dos valores
// (P(0) é o termo sem x; P(1) − P(−1) é o dobro do coeficiente de x), e o
// fator comum sai dos termos lidos um a um (o MDC por divisões sucessivas, a
// menor potência).

const g = (id: string) => GERADORES_AF_U02B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = '\u00a0'

/** Os valores de x em que duas expressões são comparadas. */
const XS = [-7, -3, -1, 1, 2, 3, 5, 9]

/** Avalia uma expressão em x: '3x(2x + 3)', '(x - 2)(x + 3)', 'x^2 + 5x + 6', '(x + 4)^2', '-2x^{3}'. */
function avalia(tex: string, x: number): number {
  const s = tex
    .replace(/\$/g, '')
    .replace(/\\cdot|·|×/g, '*')
    .replace(/−/g, '-')
    .replace(/\{/g, '(')
    .replace(/\}/g, ')')
    .replace(/\s+/g, '')
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
  /** Fatores escritos juntos: 3x, 2x(x + 1), (x + 2)(x + 3). */
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
type F = (x: number) => number
const f = (e: string | F): F => (typeof e === 'string' ? (x) => avalia(e, x) : e)
/** Duas expressões iguais para todo x testado. */
const mesma = (a: string | F, b: string | F) => XS.every((x) => Math.abs(f(a)(x) - f(b)(x)) < 1e-6)
/** Uma igualdade com □: vale para todo x quando o □ é `r`. */
const fecha = (igualdade: string, r: number) => {
  const [esq, dir] = igualdade.replace(/\\square/g, `(${r})`).split(' = ')
  return mesma(esq, dir)
}

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
const texs = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
const inteiros = (s: string) => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))
/** O número como o aluno digita a resposta errada: '−12' → −12. */
const valor = (t: string) => {
  expect(t, 'o erro se escreve com o menos verdadeiro').not.toMatch(/-/)
  return Number(t.replace('−', '-'))
}
/** O erro mapeado para a resposta errada que vale `v` (formato número). */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => valor(t) === v)
  return k === undefined ? undefined : item.erros[k]
}
/** O erro mapeado para a opção que é a mesma expressão que `e` (formato escolha). */
const erroDaOpcao = (item: Item, e: string | F) => {
  const i = item.opcoes!.findIndex((o) => mesma(o, e))
  expect(i, `${item.enunciado}: nenhuma opção é a esperada`).toBeGreaterThanOrEqual(0)
  return item.erros[String(i)]
}
/** Uma escolha: a certa é a esperada, e nenhuma errada é a mesma expressão (nem a mesma que outra errada). */
function confereEscolha(item: Item, esperada: F) {
  expect(item.formato).toBe('escolha')
  const certa = item.opcoes![item.resposta as number]
  expect(mesma(certa, esperada), `${item.enunciado}: a opção certa "${certa}" não é a do enunciado`).toBe(true)
  item.opcoes!.forEach((o, i) => {
    if (i !== item.resposta) expect(mesma(o, esperada), `${item.enunciado}: a opção errada "${o}" vale o mesmo que a certa`).toBe(false)
    item.opcoes!.forEach((o2, j) => {
      if (j > i) expect(mesma(o, o2), `${item.enunciado}: "${o}" e "${o2}" valem o mesmo`).toBe(false)
    })
  })
  for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
}
/** Os coeficientes de um polinômio de grau 2, pelos valores: [b, c] em x² + bx + c (o de x² conferido). */
function bc(p: F): [number, number] {
  const c = p(0)
  const b = (p(1) - p(-1)) / 2
  expect((p(1) + p(-1)) / 2 - c, 'o coeficiente de x² é 1').toBe(1)
  return [b, c]
}

/** Os termos de um polinômio em TeX, um a um: '12x^3 - 8x^2' → [[12, 3], [−8, 2]]. */
function termos(tex: string): [number, number][] {
  return tex
    .replace(/ - /g, ' + -')
    .split(' + ')
    .map((t) => {
      const m = t.match(/^(-?)(\d*)(x(?:\^(\d+))?)?$/)
      expect(m, `"${tex}": termo "${t}"`).not.toBeNull()
      const k = (m![1] ? -1 : 1) * (m![2] ? Number(m![2]) : 1)
      const e = m![3] ? (m![4] ? Number(m![4]) : 1) : 0
      return [k, e]
    })
}
/** O MDC por divisões sucessivas (Euclides), escrito de novo aqui. */
function mdcDe(ns: number[]): number {
  return ns.map(Math.abs).reduce((a, b) => {
    let [x, y] = [a, b]
    while (y > 0) [x, y] = [y, x - Math.floor(x / y) * y]
    return x
  })
}
/** O maior fator comum de um polinômio: [número, expoente]. */
const fatorComum = (tex: string): [number, number] => {
  const ts = termos(tex)
  return [mdcDe(ts.map(([k]) => k)), Math.min(...ts.map(([, e]) => e))]
}

describe('Álgebra e Funções, unidade 2 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U02B).toHaveLength(9)
    for (const aula of ['AF.U2.A4', 'AF.U2.A5', 'AF.U2.A6']) {
      expect(GERADORES_AF_U02B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U02B) {
      expect(ger.id).toMatch(/^fatoracao-(evidencia|trinomio|notaveis)-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) {
          expect(item.visual, ger.id).toBeDefined()
          expect(item.visual!.esboco).toBeTruthy()
        } else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })
  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; opções diferentes', () => {
    for (const ger of GERADORES_AF_U02B) {
      for (const item of itens(ger)) {
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        // Fora do TeX, o menos é o verdadeiro.
        for (const t of textos) expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        // Número e unidade: espaço que não quebra.
        for (const t of textos) expect(t, `${ger.id}: unidade sem espaço que não quebra em "${t}"`).not.toMatch(/[\d$] m(²|\b)/)
        if (item.formato === 'escolha') {
          expect(item.opcoes!.length).toBeGreaterThanOrEqual(3)
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          // Toda opção errada aponta para um erro comum.
          expect(Object.keys(item.erros).length, item.enunciado).toBe(item.opcoes!.length - 1)
          continue
        }
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta)).toBe(true)
        for (const t of Object.keys(item.erros)) expect(valor(t), `${item.enunciado}: o erro "${t}" vale a certa`).not.toBe(item.resposta)
        if ((item.resposta as number) < 0) expect(item.sinal, item.enunciado).toBe(true)
      }
    }
  })
  it('o avaliador e o leitor de termos conferem com contas feitas à mão', () => {
    expect(avalia('3x(2x + 3)', 2)).toBe(42)
    expect(avalia('6x^2 + 9x', 2)).toBe(42)
    expect(avalia('(x + 2)(x - 3)', 5)).toBe(14)
    expect(avalia('(x - 4)^2', 1)).toBe(9)
    expect(avalia('x^2 + (12)x + 36', 1)).toBe(49)
    expect(avalia('-2x^{3}', 2)).toBe(-16)
    expect(bc((x) => avalia('(x + 2)(x - 3)', x))).toEqual([-1, -6])
    expect(termos('12x^3 - 8x^2 + x - 5')).toEqual([[12, 3], [-8, 2], [1, 1], [-5, 0]])
    expect(fatorComum('18x^4 - 12x^2')).toEqual([6, 2])
    expect(fecha('6x^2 + 9x = 3x(2x + \\square)', 3)).toBe(true)
  })
})

describe('aula 4: fator comum em evidência', () => {
  it('fatoracao-evidencia-n1: acx² + adx = ax(cx + □), com o retângulo', () => {
    for (const item of itens(g('fatoracao-evidencia-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^(\d+)x\^2 \+ (\d+)x = (\d+)x\((\d*)x \+ \\square\)$/)
      expect(m, item.enunciado).not.toBeNull()
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      // O fator de fora é o maior: o MDC dos números, e x.
      const [esq] = t.split(' = ')
      expect(fatorComum(esq)).toEqual([Number(m![3]), 1])
      expect(erroPara(item, Number(m![2]))).toBe('evidencia-esquece-termo')
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; areas: unknown[][] }
      expect(item.visual!.modelo).toBe('retangulo')
      expect(e.altura).toEqual([`${m![3]}x`])
      expect(e.base[1]).toBe('?')
      expect(e.areas).toEqual([[`${m![1]}x²`, `${m![2]}x`]])
    }
  })
  it('fatoracao-evidencia-n2: escolher o maior fator comum', () => {
    for (const item of itens(g('fatoracao-evidencia-n2'))) {
      const [t] = texs(item.enunciado)
      expect(item.enunciado).toMatch(/^Qual é o maior fator comum de \$.+\$\?$/)
      const ts = termos(t)
      expect(ts).toHaveLength(2)
      const [n, e] = fatorComum(t)
      const maior = Math.max(...ts.map(([, x]) => x))
      confereEscolha(item, (x) => n * x ** e)
      expect(erroDaOpcao(item, () => n)).toBe('fator-comum-incompleto')
      expect(erroDaOpcao(item, (x) => n * x ** maior)).toBe('fator-comum-maior-potencia')
      // Um divisor comum menor, com a letra certa.
      const menor = item.opcoes!.findIndex((o) => [2, 3, 4, 5, 6].some((d) => d < n && n % d === 0 && mesma(o, (x) => d * x ** e)))
      expect(menor, item.enunciado).toBeGreaterThanOrEqual(0)
      expect(item.erros[String(menor)]).toBe('mdc-nao-e-o-maior')
    }
  })
  it('fatoracao-evidencia-n3: o número sem x dentro, o número e o expoente do fator comum', () => {
    const vistos = { semX: 0, numero: 0, expoente: 0 }
    for (const item of itens(g('fatoracao-evidencia-n3'))) {
      const r = item.resposta as number
      const [t, fator] = texs(item.enunciado)
      const [n, e] = fatorComum(t)
      if (item.enunciado.startsWith('Ponha em evidência')) {
        vistos.semX++
        const ts = termos(t)
        expect(ts.map(([, x]) => x)).toEqual([3, 2, 1])
        // Dentro do parêntese, o termo de grau 1 dividido pelo fator n·x vira o número sem x.
        const c = ts[2][0] / n
        expect(e).toBe(1)
        expect(r, item.enunciado).toBe(c)
        expect(item.sinal).toBe(true)
        expect(erroPara(item, ts[2][0])).toBe('evidencia-esquece-termo')
        expect(erroPara(item, -c)).toBe('termo-perde-o-sinal')
        if (Math.abs(c) === 1) expect(erroPara(item, 0)).toBe('evidencia-esquece-termo')
      } else if (fator.startsWith('\\square')) {
        vistos.numero++
        expect(fator).toBe(`\\square ${e === 1 ? 'x' : `x^${e}`}`)
        expect(r, item.enunciado).toBe(n)
        for (const d of [2, 3, 4, 5, 6]) if (d < n && n % d === 0) expect(erroPara(item, d)).toBe('mdc-nao-e-o-maior')
      } else {
        vistos.expoente++
        expect(fator).toBe(`${n}x^{\\square}`)
        expect(r, item.enunciado).toBe(e)
        const maior = Math.max(...termos(t).map(([, x]) => x))
        expect(erroPara(item, maior)).toBe('fator-comum-maior-potencia')
        expect(erroPara(item, 0)).toBe('fator-comum-incompleto')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})

describe('aula 5: fatorar x² + bx + c', () => {
  it('fatoracao-trinomio-n1: o par de números que fecha o retângulo, com os azulejos', () => {
    for (const item of itens(g('fatoracao-trinomio-n1'))) {
      const [t] = texs(item.enunciado)
      const [b, c] = bc((x) => avalia(t, x))
      expect(item.formato).toBe('escolha')
      const pares = item.opcoes!.map((o) => {
        const m = o.match(/^(\d+) e (\d+)$/)
        expect(m, o).not.toBeNull()
        return [Number(m![1]), Number(m![2])]
      })
      pares.forEach(([p, q], i) => {
        const fecha2 = p + q === b && p * q === c
        expect(fecha2, `${item.enunciado}: ${p} e ${q}`).toBe(i === item.resposta)
        if (i === item.resposta) return
        // O erro: produto certo e soma errada, ou soma certa e produto errado.
        expect(item.erros[String(i)]).toBe(p * q === c ? 'fatores-com-a-soma-errada' : 'fatores-com-o-produto-errado')
        expect(p * q === c || p + q === b).toBe(true)
      })
      const e = item.visual!.estado as { azulejos: { fatorar: number[] } }
      expect(e.azulejos.fatorar).toEqual([b, c])
      expect(b).toBeLessThanOrEqual(8)
      expect(c).toBeLessThanOrEqual(12)
    }
  })
  it('fatoracao-trinomio-n2: a fatoração com sinais', () => {
    for (const item of itens(g('fatoracao-trinomio-n2'))) {
      const [t] = texs(item.enunciado)
      const p: F = (x) => avalia(t, x)
      const [b, c] = bc(p)
      expect(b).not.toBe(0)
      confereEscolha(item, p)
      for (const o of item.opcoes!) expect(o).toMatch(/^\$\(x [+-] \d+\)\(x [+-] \d+\)\$$/)
      expect(erroDaOpcao(item, (x) => x * x - b * x + c)).toBe('fatora-com-o-sinal-trocado')
      item.opcoes!.forEach((o, i) => {
        if (i === item.resposta) return
        const [b2, c2] = bc((x) => avalia(o, x))
        if (c2 === c && b2 === -b) return
        expect(item.erros[String(i)], o).toBe(c2 === c ? 'fatores-com-a-soma-errada' : 'fatores-com-o-produto-errado')
        if (c2 !== c) expect(b2).toBe(b)
      })
    }
  })
  it('fatoracao-trinomio-n3: o número do outro fator e o lado do terreno', () => {
    const vistos = { fator: 0, terreno: 0 }
    for (const item of itens(g('fatoracao-trinomio-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Em')) {
        vistos.fator++
        const [t] = texs(item.enunciado)
        expect(t).toMatch(/^x\^2 [+-] \d*x [+-] \d+ = \(x [+-] \d+\)\(x \+ \\square\)$/)
        expect(fecha(t, r), item.enunciado).toBe(true)
        expect(item.sinal).toBe(true)
        expect(erroPara(item, -r)).toBe('fatora-com-o-sinal-trocado')
      } else {
        vistos.terreno++
        expect(item.enunciado).toMatch(new RegExp(`^Um terreno tem área \\$\\(x\\^2 \\+ \\d+x \\+ \\d+\\)\\$${NB}m² e um lado de \\$\\(x \\+ \\d+\\)\\$${NB}m\\. Com \\*\\*x = \\d+\\*\\*, quanto mede o outro lado, em metros\\?$`))
        const [area, lado] = texs(item.enunciado)
        const k = inteiros(negritos(item.enunciado)[0])[0]
        // O outro lado: a área dividida pelo lado, com o x medido.
        expect(r * avalia(lado, k), item.enunciado).toBe(avalia(area, k))
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('aula 6: reconhecer os produtos notáveis', () => {
  it('fatoracao-notaveis-n1: o lado do canto, com o recorte ou os azulejos', () => {
    const vistos = { recorte: 0, quadrado: 0 }
    for (const item of itens(g('fatoracao-notaveis-n1'))) {
      const [t] = texs(item.enunciado)
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const c = avalia(t.split(' = ')[0], 0)
      if (c < 0) {
        vistos.recorte++
        expect(t).toMatch(/^x\^2 - \d+ = \(x \+ \\square\)\(x - \\square\)$/)
        expect(item.visual!.estado).toEqual({ recorte: r })
        expect(erroPara(item, -c)).toBe('fatora-sem-tirar-a-raiz')
      } else {
        vistos.quadrado++
        expect(t).toMatch(/^x\^2 \+ \d+x \+ \d+ = \(x \+ \\square\)\^2$/)
        const [b] = bc((x) => avalia(t.split(' = ')[0], x))
        expect((item.visual!.estado as { azulejos: { fatorar: number[] } }).azulejos.fatorar).toEqual([b, c])
        expect(erroPara(item, c)).toBe('fatora-sem-tirar-a-raiz')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('fatoracao-notaveis-n2: escolher a fatoração da diferença de quadrados ou do quadrado perfeito', () => {
    const vistos = { diferenca: 0, soma: 0, menos: 0 }
    for (const item of itens(g('fatoracao-notaveis-n2'))) {
      const [t] = texs(item.enunciado)
      const p: F = (x) => avalia(t, x)
      const [b, c] = bc(p)
      confereEscolha(item, p)
      // O lado do canto, achado contando.
      let lado = 1
      while (lado * lado < Math.abs(c)) lado++
      expect(lado * lado).toBe(Math.abs(c))
      const quadrado = (s: number) => (x: number) => (x + s) ** 2
      const somaDif = (s: number) => (x: number) => (x + s) * (x - s)
      if (b === 0) {
        vistos.diferenca++
        expect(c).toBeLessThan(0)
        expect(erroDaOpcao(item, quadrado(-lado))).toBe('confunde-diferenca-e-quadrado-ao-fatorar')
        expect(erroDaOpcao(item, somaDif(lado * lado))).toBe('fatora-sem-tirar-a-raiz')
      } else {
        const s = b > 0 ? lado : -lado
        expect(b).toBe(2 * s)
        if (b > 0) vistos.soma++
        else vistos.menos++
        expect(erroDaOpcao(item, quadrado(-s))).toBe('fatora-com-o-sinal-trocado')
        expect(erroDaOpcao(item, somaDif(lado))).toBe('confunde-diferenca-e-quadrado-ao-fatorar')
        expect(erroDaOpcao(item, quadrado(s * lado))).toBe('fatora-sem-tirar-a-raiz')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('fatoracao-notaveis-n3: o lado do quadrado, o termo do meio e a placa remontada', () => {
    const vistos = { lado: 0, meio: 0, placa: 0 }
    for (const item of itens(g('fatoracao-notaveis-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Complete')) {
        vistos.lado++
        const [t] = texs(item.enunciado)
        expect(t).toMatch(/^x\^2 [+-] \d+x \+ \d+ = \(x [+-] \\square\)\^2$/)
        expect(fecha(t, r), item.enunciado).toBe(true)
        expect(erroPara(item, avalia(t.split(' = ')[0], 0))).toBe('fatora-sem-tirar-a-raiz')
      } else if (item.enunciado.startsWith('Para')) {
        vistos.meio++
        const [t, q] = texs(item.enunciado)
        expect(fecha(`${t} = ${q}`, r), item.enunciado).toBe(true)
        expect(item.sinal).toBe(true)
        expect(erroPara(item, 0)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, r / 2)).toBe('produto-so-das-pontas')
        expect(erroPara(item, -r)).toBe('fatora-com-o-sinal-trocado')
      } else {
        vistos.placa++
        expect(item.enunciado).toMatch(new RegExp(`^Uma placa de x por x${NB}m perdeu um canto de \\d+ por \\d+${NB}m\\. Remontada, a sobra tem um lado de \\$\\(x \\+ \\d+\\)\\$${NB}m\\. Com \\*\\*x = \\d+\\*\\*, quanto mede o outro\\?$`))
        const [b] = inteiros(item.enunciado)
        const k = inteiros(negritos(item.enunciado)[0])[0]
        // A sobra: o quadrado de k por k sem o canto de b por b, dividida pelo lado k + b.
        expect(r * (k + b), item.enunciado).toBe(k * k - b * b)
        expect(erroPara(item, k - b * b)).toBe('fatora-sem-tirar-a-raiz')
        expect(erroPara(item, k + b)).toBe('confunde-diferenca-e-quadrado-ao-fatorar')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})
