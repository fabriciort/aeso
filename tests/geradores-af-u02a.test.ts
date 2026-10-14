import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U02A } from '@/content/matematica/geradores/fatoracao-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. As expressões (do enunciado e das
// opções) são lidas por um avaliador pequeno, escrito aqui, que entende a
// escrita junta (3x, 2x(x + 1)), as potências (x^2, x^{\square}), o \cdot e
// o \div: duas expressões são a mesma quando dão o mesmo número para vários
// valores de x. Os coeficientes saem dos valores (P(1) − P(−1) = 2 · o
// coeficiente de x, num polinômio de grau 2), não da escrita.

const g = (id: string) => GERADORES_AF_U02A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = '\u00a0'

/** Os valores de x em que duas expressões são comparadas (sem o zero, por causa da divisão). */
const XS = [-7, -3, -1, 1, 2, 3, 5, 9]

/**
 * Avalia uma expressão em x: '3x(x + 4)', '(x - 2)(x + 3)', 'x^2 + 5x + 6',
 * '(6x^2 + 9x) \div 3x', '-2x^{3}'. Um produto escrito junto (3x, 2x(…)) vale
 * como um fator só, então '÷ 3x' divide por 3x.
 */
function avalia(tex: string, x: number): number {
  const s = tex
    .replace(/\$/g, '')
    .replace(/\\cdot|·|×/g, '*')
    .replace(/\\div|÷/g, '/')
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
    while (peek() === '*' || peek() === '/') {
      const op = s[i++]
      const f = junto()
      v = op === '*' ? v * f : v / f
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
/** O coeficiente de x de um polinômio de grau até 2, pelos valores. */
const coefX = (p: F) => (p(1) - p(-1)) / 2

/** O quadrado de n, somando n vezes o n (sem a potência do gerador). */
const quadradoDe = (k: number) => {
  let s = 0
  for (let i = 0; i < Math.abs(k); i++) s += Math.abs(k)
  return s
}

describe('Álgebra e Funções, unidade 2 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U02A).toHaveLength(9)
    for (const aula of ['AF.U2.A1', 'AF.U2.A2', 'AF.U2.A3']) {
      expect(GERADORES_AF_U02A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U02A) {
      expect(ger.id).toMatch(/^fatoracao-[a-z-]+-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) expect(item.visual?.modelo, ger.id).toBe('retangulo')
        else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })
  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; opções diferentes', () => {
    for (const ger of GERADORES_AF_U02A) {
      for (const item of itens(ger)) {
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        // Fora do TeX, o menos é o verdadeiro.
        for (const t of textos) expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        // Número e unidade: espaço que não quebra.
        for (const t of textos) expect(t, `${ger.id}: unidade sem espaço que não quebra em "${t}"`).not.toMatch(/[\dx$] m(²|\b)/)
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta)).toBe(true)
        for (const t of Object.keys(item.erros)) expect(valor(t), `${item.enunciado}: o erro "${t}" vale a certa`).not.toBe(item.resposta)
        if ((item.resposta as number) < 0) expect(item.sinal, item.enunciado).toBe(true)
      }
    }
  })
  it('o avaliador de expressões confere com contas feitas à mão', () => {
    expect(avalia('(x + 3)^2', 1)).toBe(16)
    expect(avalia('x^2 + 6x + 9', 1)).toBe(16)
    expect(avalia('(2x - 3)^2', 2)).toBe(1)
    expect(avalia('(x + 3)(x - 3)', 10)).toBe(91)
    expect(avalia('4x^2 - 12x + 9', 2)).toBe(1)
    expect(coefX((x) => avalia('(x - 5)^2', x))).toBe(-10)
  })
})

describe('aula 1: o quadrado da soma', () => {
  it('fatoracao-quadrado-soma-n1: o número que falta em (x + a)², com o quadrado', () => {
    const vistos = { meio: 0, canto: 0 }
    for (const item of itens(g('fatoracao-quadrado-soma-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\(x \+ (\d+)\)\^2 = x\^2 \+ (\\square |\d+)x \+ (\\square|\d+)$/)
      expect(m, item.enunciado).not.toBeNull()
      const a = Number(m![1])
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; areas: unknown[][] }
      expect(e.base).toEqual(['x', a])
      expect(e.altura).toEqual(['x', a])
      if (m![2] === '\\square ') {
        vistos.meio++
        expect(e.areas[0][1]).toBe('?')
        expect(e.areas[1][0]).toBe('?')
        expect(erroPara(item, 0)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, a)).toBe('produto-so-das-pontas')
      } else {
        vistos.canto++
        expect(m![3]).toBe('\\square')
        expect(e.areas[1][1]).toBe('?')
        if (2 * a !== r) expect(erroPara(item, 2 * a)).toBe('potencia-multiplica-base-pelo-expoente')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(100)
  })
  it('fatoracao-quadrado-soma-n2: o desenvolvimento de (px + a)² entre os erros comuns', () => {
    for (const item of itens(g('fatoracao-quadrado-soma-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\((\d+)x \+ (\d+)\)\^2$/)
      expect(m, item.enunciado).not.toBeNull()
      const [p, a] = [Number(m![1]), Number(m![2])]
      const q: F = (x) => avalia(t, x)
      confereEscolha(item, q)
      // Sem os dois do meio; com um só; com p no lugar de p² no pedaço grande.
      expect(erroDaOpcao(item, (x) => p * p * x * x + a * a)).toBe('quadrado-da-soma-sem-o-meio')
      expect(erroDaOpcao(item, (x) => q(x) - p * a * x)).toBe('produto-so-das-pontas')
      expect(erroDaOpcao(item, (x) => q(x) - (p * p - p) * x * x)).toBe('quadrado-do-monomio-so-na-letra')
    }
  })
  it('fatoracao-quadrado-soma-n3: a área do quarto, o coeficiente de x e um quadrado de cabeça', () => {
    const vistos = { quarto: 0, coeficiente: 0, cabeca: 0 }
    for (const item of itens(g('fatoracao-quadrado-soma-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Um quarto')) {
        vistos.quarto++
        expect(item.enunciado).toMatch(new RegExp(`^Um quarto quadrado tem \\$\\(x \\+ \\d+\\)\\$${NB}m de lado\\. Com \\*\\*x = \\d+\\*\\*, quantos m² de piso ele pede\\?$`))
        const [lado] = texs(item.enunciado)
        const k = inteiros(negritos(item.enunciado)[0])[0]
        const a = inteiros(lado)[0]
        expect(r, item.enunciado).toBe(quadradoDe(k + a))
        expect(r).toBe(avalia(`${lado}^2`, k))
        expect(erroPara(item, k * k + a * a)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, k * k + k * a + a * a)).toBe('produto-so-das-pontas')
      } else if (item.enunciado.startsWith('Desenvolva')) {
        vistos.coeficiente++
        const [t, alvo] = texs(item.enunciado)
        expect(alvo).toBe('x')
        expect(t).toMatch(/^\(\d+x \+ \d+\)\^2$/)
        const c = coefX((x) => avalia(t, x))
        expect(r, item.enunciado).toBe(c)
        expect(erroPara(item, c / 2)).toBe('produto-so-das-pontas')
        expect(erroPara(item, 0)).toBe('quadrado-da-soma-sem-o-meio')
      } else {
        vistos.cabeca++
        const [t] = texs(item.enunciado)
        const m = t.match(/^(\d+)\^2$/)
        expect(m, item.enunciado).not.toBeNull()
        const k = Number(m![1])
        expect(r, item.enunciado).toBe(quadradoDe(k))
        const dz = k - (k % 10)
        const u = k % 10
        expect(u).toBeGreaterThan(0)
        expect(erroPara(item, dz * dz + u * u)).toBe('quadrado-da-soma-sem-o-meio')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(60)
  })
})

describe('aula 2: o quadrado da diferença', () => {
  it('fatoracao-quadrado-diferenca-n1: o número que falta em (x − a)², com o quadrado', () => {
    const vistos = { meio: 0, canto: 0 }
    for (const item of itens(g('fatoracao-quadrado-diferenca-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\(x - (\d+)\)\^2 = x\^2 - (\\square |\d+)x \+ (\\square|\d+)$/)
      expect(m, item.enunciado).not.toBeNull()
      const a = Number(m![1])
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; areas: unknown[][] }
      expect(e.base).toEqual(['x', -a])
      expect(e.altura).toEqual(['x', -a])
      if (m![2] === '\\square ') {
        vistos.meio++
        expect(erroPara(item, 0)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, a)).toBe('produto-so-das-pontas')
      } else {
        vistos.canto++
        expect(item.sinal).toBe(true)
        expect(e.areas[1][1]).toBe('?')
        expect(erroPara(item, -r)).toBe('canto-do-quadrado-negativo')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(100)
  })
  it('fatoracao-quadrado-diferenca-n2: o desenvolvimento de (px − a)² entre os erros comuns', () => {
    for (const item of itens(g('fatoracao-quadrado-diferenca-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\((\d*)x - (\d+)\)\^2$/)
      expect(m, item.enunciado).not.toBeNull()
      const p = m![1] ? Number(m![1]) : 1
      const a = Number(m![2])
      const q: F = (x) => avalia(t, x)
      confereEscolha(item, q)
      expect(erroDaOpcao(item, (x) => q(x) - 2 * a * a)).toBe('canto-do-quadrado-negativo')
      expect(erroDaOpcao(item, (x) => p * p * x * x - a * a)).toBe('quadrado-da-soma-sem-o-meio')
      expect(erroDaOpcao(item, (x) => q(x) + 4 * p * a * x)).toBe('sinais-diferentes-da-positivo')
    }
  })
  it('fatoracao-quadrado-diferenca-n3: o coeficiente de x, o terreno e um quadrado de cabeça', () => {
    const vistos = { coeficiente: 0, terreno: 0, cabeca: 0 }
    for (const item of itens(g('fatoracao-quadrado-diferenca-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Desenvolva')) {
        vistos.coeficiente++
        const [t, alvo] = texs(item.enunciado)
        expect(alvo).toBe('x')
        expect(t).toMatch(/^\(\d*x - \d+\)\^2$/)
        const c = coefX((x) => avalia(t, x))
        expect(r, item.enunciado).toBe(c)
        expect(item.sinal).toBe(true)
        expect(erroPara(item, -c)).toBe('sinais-diferentes-da-positivo')
        expect(erroPara(item, c / 2)).toBe('produto-so-das-pontas')
      } else if (item.enunciado.startsWith('Um terreno')) {
        vistos.terreno++
        expect(item.enunciado).toMatch(new RegExp(`^Um terreno quadrado tem x${NB}m de lado e perde \\d+${NB}m na frente e \\d+${NB}m no lado\\. Com \\*\\*x = \\d+\\*\\*, quantos m² sobram\\?$`))
        const k = inteiros(negritos(item.enunciado)[0])[0]
        const [a, a2] = inteiros(item.enunciado.slice(0, item.enunciado.indexOf('Com')))
        expect(a2).toBe(a)
        expect(k).toBeGreaterThan(a)
        // O que sobra: o lado menos a, ao quadrado.
        expect(r, item.enunciado).toBe(quadradoDe(k - a))
        expect(erroPara(item, k * k - a * a)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, k * k - 2 * a * k - a * a)).toBe('canto-do-quadrado-negativo')
      } else {
        vistos.cabeca++
        const [t] = texs(item.enunciado)
        const m = t.match(/^(\d+)\^2$/)
        expect(m, item.enunciado).not.toBeNull()
        const k = Number(m![1])
        expect(r, item.enunciado).toBe(quadradoDe(k))
        const dz = Math.ceil(k / 10) * 10
        const u = dz - k
        expect(u).toBeGreaterThan(0)
        expect(erroPara(item, dz * dz - u * u)).toBe('quadrado-da-soma-sem-o-meio')
        expect(erroPara(item, dz * dz - 2 * dz * u - u * u)).toBe('canto-do-quadrado-negativo')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(60)
  })
})

describe('aula 3: a soma vezes a diferença', () => {
  it('fatoracao-soma-diferenca-n1: o número que falta em (x + a)(x − a), com o retângulo', () => {
    const vistos = { meio: 0, canto: 0 }
    for (const item of itens(g('fatoracao-soma-diferenca-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\(x \+ (\d+)\)\(x - (\d+)\) = x\^2 (?:\+ \\square x - (\d+)|- \\square)$/)
      expect(m, item.enunciado).not.toBeNull()
      const a = Number(m![1])
      expect(Number(m![2])).toBe(a)
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; cancela: boolean }
      expect(e.base).toEqual(['x', a])
      expect(e.altura).toEqual(['x', -a])
      expect(e.cancela).toBe(true)
      if (m![3]) {
        vistos.meio++
        expect(item.sinal).toBe(true)
        expect(erroPara(item, -2 * a)).toBe('meios-opostos-somados')
        expect(erroPara(item, 2 * a)).toBe('meios-opostos-somados')
      } else {
        vistos.canto++
        if (2 * a !== r) expect(erroPara(item, 2 * a)).toBe('potencia-multiplica-base-pelo-expoente')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(100)
  })
  it('fatoracao-soma-diferenca-n2: o produto de (px + a)(px − a) entre os erros comuns', () => {
    for (const item of itens(g('fatoracao-soma-diferenca-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\((\d*)x ([+-]) (\d+)\)\((\d*)x ([+-]) (\d+)\)$/)
      expect(m, item.enunciado).not.toBeNull()
      expect(m![1]).toBe(m![4])
      expect(m![3]).toBe(m![6])
      expect(m![2]).not.toBe(m![5])
      const p = m![1] ? Number(m![1]) : 1
      const a = Number(m![3])
      const q: F = (x) => avalia(t, x)
      confereEscolha(item, q)
      expect(erroDaOpcao(item, (x) => q(x) + 2 * a * a)).toBe('sinais-diferentes-da-positivo')
      expect(erroDaOpcao(item, (x) => q(x) - 2 * p * a * x)).toBe('meios-opostos-somados')
      expect(erroDaOpcao(item, (x) => avalia(`(${p}x - ${a})^2`, x))).toBe('soma-vezes-diferenca-como-quadrado')
    }
  })
  it('fatoracao-soma-diferenca-n3: uma conta de cabeça e o terreno que perde área', () => {
    const vistos = { cabeca: 0, terreno: 0 }
    for (const item of itens(g('fatoracao-soma-diferenca-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Calcule')) {
        vistos.cabeca++
        const [t] = texs(item.enunciado)
        const m = t.match(/^(\d+) \\cdot (\d+)$/)
        expect(m, item.enunciado).not.toBeNull()
        const [x, y] = [Number(m![1]), Number(m![2])]
        // Os dois em volta da mesma dezena redonda, a distâncias iguais.
        expect((x + y) % 20).toBe(0)
        let produto = 0
        for (let i = 0; i < y; i++) produto += x
        expect(r, item.enunciado).toBe(produto)
        const meio = (x + y) / 2
        expect(erroPara(item, meio * meio)).toBe('mais-e-menos-nao-mudam-a-area')
      } else {
        vistos.terreno++
        expect(item.enunciado).toMatch(new RegExp(`^Um terreno quadrado tem \\d+${NB}m de lado\\. Ele ganha \\d+${NB}m na frente e perde \\d+${NB}m no fundo\\. Quantos m² de área ele perde\\?$`))
        const [k, a, a2] = inteiros(item.enunciado)
        expect(a2).toBe(a)
        expect(r, item.enunciado).toBe(quadradoDe(k) - (k + a) * (k - a))
        expect(erroPara(item, 0)).toBe('mais-e-menos-nao-mudam-a-area')
      }
    }
    for (const [k, v] of Object.entries(vistos)) expect(v, k).toBeGreaterThan(100)
  })
})
