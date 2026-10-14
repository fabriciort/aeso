import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U01B } from '@/content/matematica/geradores/polinomios-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. As expressões (do enunciado e das
// opções) são lidas por um avaliador pequeno, escrito aqui, que entende a
// escrita junta (3x, 2x(x + 1)), as potências (x^2, x^{\square}), o \cdot e
// o \div: duas expressões são a mesma quando dão o mesmo número para vários
// valores de x. Os coeficientes saem dos valores (P(1) − P(−1) = 2 · o
// coeficiente de x, num polinômio de grau 2), não da escrita.

const g = (id: string) => GERADORES_AF_U01B.find((x) => x.id === id)!
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
/** O coeficiente de x² de um polinômio de grau até 3 sem termo constante: P(x) = ax³ + bx² + cx. */
const coefX2 = (p: F) => (p(1) + p(-1)) / 2

describe('Álgebra e Funções, unidade 1 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U01B).toHaveLength(9)
    for (const aula of ['AF.U1.A4', 'AF.U1.A5', 'AF.U1.A6']) {
      expect(GERADORES_AF_U01B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U01B) {
      expect(ger.id).toMatch(/^polinomios-[a-z-]+-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) expect(item.visual?.modelo, ger.id).toBe('retangulo')
        else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })
  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; opções diferentes', () => {
    for (const ger of GERADORES_AF_U01B) {
      for (const item of itens(ger)) {
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        // Fora do TeX, o menos é o verdadeiro.
        for (const t of textos) expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        // Número e unidade: espaço que não quebra.
        for (const t of textos) expect(t, `${ger.id}: unidade sem espaço que não quebra em "${t}"`).not.toMatch(/[\d$] m(²|\b)/)
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
    expect(avalia('3x(x + 4)', 2)).toBe(36)
    expect(avalia('3x^2 + 12x', 2)).toBe(36)
    expect(avalia('(x - 2)(x + 3)', 5)).toBe(24)
    expect(avalia('-2x(x^2 - 3x + 1)', 2)).toBe(4)
    expect(avalia('(6x^2 + 9x) \\div 3x', 2)).toBe(7)
    expect(avalia('12x^{5} \\div 4x^{2}', 2)).toBe(24)
    expect(avalia('(2x^3 - 4x) \\div (-2x)', 3)).toBe(-7)
    expect(avalia('-x^2', 3)).toBe(-9)
    expect(coefX((x) => avalia('(x + 2)(x + 3)', x))).toBe(5)
    expect(coefX2((x) => avalia('2x(x^2 - 3x + 1)', x))).toBe(-6)
  })
})

describe('aula 4: monômio vezes polinômio', () => {
  it('polinomios-monomio-polinomio-n1: ax(x + b) = ax² + □x, com o retângulo', () => {
    for (const item of itens(g('polinomios-monomio-polinomio-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^(\d+)x\(x \+ (\d+)\) = (\d+)x\^2 \+ \\square x$/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b, a2] = [Number(m![1]), Number(m![2]), Number(m![3])]
      expect(a2).toBe(a)
      expect(fecha(t, item.resposta as number), item.enunciado).toBe(true)
      expect(erroPara(item, b)).toBe('distributiva-parcial')
      if (a + b !== a * b) expect(erroPara(item, a + b)).toBe('soma-no-lugar-de-multiplicar')
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; areas: unknown[][] }
      expect(e.base).toEqual(['x', b])
      expect(e.altura).toEqual([`${a}x`])
      expect(e.areas[0][1]).toBe('?')
      expect(item.visual!.esboco).toBeTruthy()
    }
  })
  it('polinomios-monomio-polinomio-n2: o produto com sinais, binômio ou trinômio', () => {
    let tri = 0
    for (const item of itens(g('polinomios-monomio-polinomio-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^(-?\d+)x\((.+)\)$/)
      expect(m, item.enunciado).not.toBeNull()
      expect(t.includes('-'), `${t}: sempre há um menos`).toBe(true)
      const A = Number(m![1])
      const dentro = m![2]
      const grau = /x\^2/.test(dentro) ? 2 : 1
      if (grau === 2) tri++
      const produto: F = (x) => avalia(t, x)
      confereEscolha(item, produto)
      // O termo sem x de dentro, e o que o monômio faz com ele.
      const C = avalia(dentro, 0)
      // O último termo do produto (A·C·x) com o sinal trocado.
      expect(erroDaOpcao(item, (x) => produto(x) - 2 * A * C * x)).toBe('distributiva-sinal-do-negativo')
      // Só o primeiro termo multiplicado: A·x·x^grau, e o resto de dentro copiado.
      expect(erroDaOpcao(item, (x) => A * x * x ** grau + avalia(dentro, x) - x ** grau)).toBe('distributiva-parcial')
      // O último termo sem o x: A·C no lugar de A·C·x.
      expect(erroDaOpcao(item, (x) => produto(x) - A * C * x + A * C)).toBe('esquece-a-letra-no-produto')
    }
    expect(tri).toBeGreaterThan(100)
    expect(tri).toBeLessThan(200)
  })
  it('polinomios-monomio-polinomio-n3: um coeficiente do produto e a área do galpão', () => {
    const vistos = { coeficiente: 0, galpao: 0 }
    for (const item of itens(g('polinomios-monomio-polinomio-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Tire os parênteses')) {
        vistos.coeficiente++
        const [t, alvo] = texs(item.enunciado)
        const m = t.match(/^(-?\d+)x\(x\^2 ([+-]) (\d+)x ([+-]) (\d+)\)$/)
        expect(m, item.enunciado).not.toBeNull()
        const A = Number(m![1])
        const B = (m![2] === '-' ? -1 : 1) * Number(m![3])
        const C = (m![4] === '-' ? -1 : 1) * Number(m![5])
        const p: F = (x) => avalia(t, x)
        // P(x) = Ax³ + ABx² + ACx: os coeficientes pelos valores.
        const k = alvo === 'x^2' ? coefX2(p) : (p(1) - p(-1)) / 2 - A
        expect(['x^2', 'x']).toContain(alvo)
        expect(r, item.enunciado).toBe(k)
        expect(item.sinal).toBe(true)
        const outro = alvo === 'x^2' ? B : C
        if (A + outro !== r && A + outro !== -r) expect(erroPara(item, A + outro)).toBe('soma-no-lugar-de-multiplicar')
        if (A < 0 || outro < 0) expect(erroPara(item, -r)).toBe(A < 0 && outro < 0 ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo')
      } else {
        vistos.galpao++
        expect(item.enunciado).toMatch(new RegExp(`^Um galpão tem \\$\\d+x\\$${NB}m de fundo e \\$\\(x \\+ \\d+\\)\\$${NB}m de frente\\. Com \\*\\*x = \\d+\\*\\*, qual é a área, em m²\\?$`))
        const [fundo, frente] = texs(item.enunciado)
        const a = inteiros(fundo)[0]
        const b = inteiros(frente)[0]
        const k = inteiros(negritos(item.enunciado)[0])[0]
        // A área: fundo vezes frente, com o x medido, somando faixas.
        let area = 0
        for (let i = 0; i < k + b; i++) area += a * k
        expect(r, item.enunciado).toBe(area)
        expect(erroPara(item, a * k * k + b)).toBe('distributiva-parcial')
        expect(erroPara(item, a * k * k + a * b)).toBe('esquece-a-letra-no-produto')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('aula 5: polinômio vezes polinômio', () => {
  it('polinomios-binomios-n1: o número que falta em (x + a)(x + b), com o retângulo', () => {
    const vistos = { meio: 0, ponta: 0 }
    for (const item of itens(g('polinomios-binomios-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\(x \+ (\d+)\)\(x \+ (\d+)\) = x\^2 \+ (\\square |\d+)x \+ (\\square|\d+)$/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b] = [Number(m![1]), Number(m![2])]
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[] }
      expect(e.base).toEqual(['x', b])
      expect(e.altura).toEqual(['x', a])
      if (m![3] === '\\square ') {
        vistos.meio++
        expect(erroPara(item, 0)).toBe('produto-so-das-pontas')
        expect(erroPara(item, a)).toBe('produto-so-das-pontas')
        expect(erroPara(item, b)).toBe('produto-so-das-pontas')
      } else {
        vistos.ponta++
        expect(m![4]).toBe('\\square')
        if (a + b !== r) expect(erroPara(item, a + b)).toBe('soma-no-lugar-de-multiplicar')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('polinomios-binomios-n2: o produto de dois binômios com sinais', () => {
    for (const item of itens(g('polinomios-binomios-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/)
      expect(m, item.enunciado).not.toBeNull()
      expect(t.includes('-'), `${t}: sempre há um menos`).toBe(true)
      const A = (m![1] === '-' ? -1 : 1) * Number(m![2])
      const B = (m![3] === '-' ? -1 : 1) * Number(m![4])
      const produto: F = (x) => avalia(t, x)
      confereEscolha(item, produto)
      expect(erroDaOpcao(item, (x) => x * x + A * B)).toBe('produto-so-das-pontas')
      expect(erroDaOpcao(item, (x) => produto(x) - 2 * A * B)).toBe(A < 0 && B < 0 ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo')
    }
  })
  it('polinomios-binomios-n3: o coeficiente de x e a área da sala', () => {
    const vistos = { coeficiente: 0, sala: 0 }
    for (const item of itens(g('polinomios-binomios-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Multiplique')) {
        vistos.coeficiente++
        const [t, alvo] = texs(item.enunciado)
        expect(alvo).toBe('x')
        expect(t, item.enunciado).toMatch(/^\(\d+x [+-] \d+\)\(x [+-] \d+\)$/)
        expect(r, item.enunciado).toBe(coefX((x) => avalia(t, x)))
        expect(item.sinal).toBe(true)
        expect(erroPara(item, 0)).toBe('produto-so-das-pontas')
      } else {
        vistos.sala++
        expect(item.enunciado).toMatch(new RegExp(`^Uma sala tem \\$\\(x \\+ \\d+\\)\\$${NB}m por \\$\\(x \\+ \\d+\\)\\$${NB}m\\. Com \\*\\*x = \\d+\\*\\*, quantos m² de piso ela pede\\?$`))
        const [l1, l2] = texs(item.enunciado)
        const k = inteiros(negritos(item.enunciado)[0])[0]
        expect(r, item.enunciado).toBe(avalia(`${l1}${l2}`, k))
        const [a, b] = [inteiros(l1)[0], inteiros(l2)[0]]
        expect(erroPara(item, k * k + a * b)).toBe('produto-so-das-pontas')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('aula 6: dividir por um monômio', () => {
  it('polinomios-divisao-n1: (área) ÷ lado = cx + □, com o retângulo', () => {
    for (const item of itens(g('polinomios-divisao-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\((\d+)x\^2 \+ (\d+)x\) \\div (\d+)x = (\d*)x \+ \\square$/)
      expect(m, item.enunciado).not.toBeNull()
      const r = item.resposta as number
      expect(fecha(t, r), item.enunciado).toBe(true)
      const segundo = Number(m![2])
      expect(erroPara(item, segundo)).toBe('divide-so-o-primeiro')
      const e = item.visual!.estado as { base: unknown[]; altura: unknown[]; areas: unknown[][] }
      expect(e.altura).toEqual([`${m![3]}x`])
      expect(e.base[1]).toBe('?')
      expect(e.areas).toEqual([[`${m![1]}x²`, `${m![2]}x`]])
    }
  })
  it('polinomios-divisao-n2: o quociente com um termo negativo e expoentes maiores', () => {
    for (const item of itens(g('polinomios-divisao-n2'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^\((\d*)x\^(\d) - (\d+)x(?:\^(\d))?\) \\div (\d+)x(?:\^(\d))?$/)
      expect(m, item.enunciado).not.toBeNull()
      const quociente: F = (x) => avalia(t, x)
      confereEscolha(item, quociente)
      // Os dois termos do dividendo e o divisor, lidos do enunciado.
      const [primeiro, segundo] = t.slice(1, t.indexOf(')')).split(' - ')
      const divisor = t.slice(t.indexOf('\\div ') + 5)
      const n2 = m![4] ? Number(m![4]) : 1
      const e = m![6] ? Number(m![6]) : 1
      // Só o primeiro dividido, o segundo copiado.
      expect(erroDaOpcao(item, (x) => avalia(primeiro, x) / avalia(divisor, x) - avalia(segundo, x))).toBe('divide-so-o-primeiro')
      // Os expoentes somados: cada termo ÷ divisor vezes x^(2e).
      expect(erroDaOpcao(item, (x) => quociente(x) * x ** (2 * e))).toBe('potencia-soma-expoentes-na-divisao')
      // O termo negativo com o sinal trocado.
      expect(erroDaOpcao(item, (x) => quociente(x) + (2 * avalia(segundo, x)) / avalia(divisor, x))).toBe('sinais-diferentes-da-positivo')
      expect(n2).toBe(e)
    }
  })
  it('polinomios-divisao-n3: o número sem x, o expoente e a frente do depósito', () => {
    const vistos = { semX: 0, expoente: 0, deposito: 0 }
    for (const item of itens(g('polinomios-divisao-n3'))) {
      const r = item.resposta as number
      if (item.enunciado.startsWith('Divida')) {
        vistos.semX++
        const [t] = texs(item.enunciado)
        expect(t, item.enunciado).toMatch(/^\(-?\d*x\^3 [+-] \d*x\^2 [+-] \d*x\) \\div \(?-?\d+x\)?$/)
        const q: F = (x) => avalia(t, x)
        // O quociente tem grau 2: o valor em 0 sai de 1, 2 e 3 (Lagrange).
        const q0 = 3 * q(1) - 3 * q(2) + q(3)
        expect(r, item.enunciado).toBe(Math.round(q0))
        expect(Math.abs(q0 - r)).toBeLessThan(1e-6)
        expect(item.sinal).toBe(true)
        const divisor = t.slice(t.indexOf('\\div ') + 5)
        const k = avalia(divisor, 1)
        expect(erroPara(item, r * k)).toBe('divide-so-o-primeiro')
        if (k < 0 || r * k < 0) expect(erroPara(item, -r)).toBe(k < 0 && r * k < 0 ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo')
      } else if (item.enunciado.startsWith('Complete')) {
        vistos.expoente++
        const [t] = texs(item.enunciado)
        const m = t.match(/^(\d*)x\^(?:\{(\d+)\}|(\d)) \\div (\d+)x(?:\^(\d))? = (\d*)x\^\{\\square\}$/)
        expect(m, item.enunciado).not.toBeNull()
        expect(fecha(t, r), item.enunciado).toBe(true)
        const n = Number(m![2] ?? m![3])
        const e = m![5] ? Number(m![5]) : 1
        expect(erroPara(item, n + e)).toBe('potencia-soma-expoentes-na-divisao')
      } else {
        vistos.deposito++
        expect(item.enunciado).toMatch(new RegExp(`^Um depósito tem área \\$\\(\\d+x\\^2 \\+ \\d+x\\)\\$${NB}m² e \\$\\d+x\\$${NB}m de fundo\\. Com \\*\\*x = \\d+\\*\\*, quanto mede a frente, em metros\\?$`))
        const [area, fundo] = texs(item.enunciado)
        const k = inteiros(negritos(item.enunciado)[0])[0]
        // A frente é a área dividida pelo fundo, com o x medido.
        expect(r, item.enunciado).toBe(avalia(area, k) / avalia(fundo, k))
        const segundo = inteiros(area)[2]
        const a = inteiros(fundo)[0]
        expect(erroPara(item, (avalia(area, k) - segundo * k) / (a * k) + segundo * k)).toBe('divide-so-o-primeiro')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})
