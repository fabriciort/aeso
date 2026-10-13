import { describe, expect, it } from 'vitest'
import { GERADORES_U15B } from '@/content/matematica/geradores/equacoes-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. As equações e inequações são lidas
// por um avaliador pequeno, escrito aqui, e resolvidas na força bruta:
// troca-se o x por cada número de uma lista até os dois lados baterem (ou a
// comparação ser verdadeira). Assim a conferência não repete o caminho de
// quem resolve com a balança.

const g = (id: string) => GERADORES_U15B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

type F = (x: number) => number
const compiladas = new Map<string, F>()
/**
 * Lê uma expressão em x ('2(x + 3)', '\\frac{x}{3} - 2', '5 + 2x', '-11') e a
 * devolve como uma função de x. Multiplicação junta (2x, 2(…)); o menos
 * verdadeiro e o hífen valem o mesmo.
 */
function compila(t: string): F {
  const pronta = compiladas.get(t)
  if (pronta) return pronta
  const s = t
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\cdot|·|×/g, '*')
    .replace(/−/g, '-')
    .replace(/\s+/g, '')
  let i = 0
  const peek = () => s[i]
  function expr(): F {
    let v = termo()
    while (peek() === '+' || peek() === '-') {
      const op = s[i++]
      const [a, u] = [v, termo()]
      v = op === '+' ? (x) => a(x) + u(x) : (x) => a(x) - u(x)
    }
    return v
  }
  function termo(): F {
    let v = fator()
    for (;;) {
      if (peek() === '*' || peek() === '/') {
        const op = s[i++]
        const [a, f] = [v, fator()]
        v = op === '*' ? (x) => a(x) * f(x) : (x) => a(x) / f(x)
      } else if (peek() === 'x' || peek() === '(' || /\d/.test(peek() ?? '')) {
        const [a, f] = [v, fator()]
        v = (x) => a(x) * f(x)
      } else return v
    }
  }
  function fator(): F {
    const c = peek()
    if (c === '-') {
      i++
      const f = fator()
      return (x) => -f(x)
    }
    if (c === '(') {
      i++
      const v = expr()
      expect(s[i], `"${t}": falta fechar parênteses`).toBe(')')
      i++
      return v
    }
    if (c === 'x') {
      i++
      return (x) => x
    }
    const m = s.slice(i).match(/^\d+/)
    expect(m, `"${t}": não entendi em "${s.slice(i)}"`).not.toBeNull()
    i += m![0].length
    const n = Number(m![0])
    return () => n
  }
  const v = expr()
  expect(i, `"${t}": sobrou "${s.slice(i)}"`).toBe(s.length)
  compiladas.set(t, v)
  return v
}
const avalia = (t: string, x: number) => compila(t)(x)

/** Os dois lados e a relação de uma equação ou inequação em TeX. */
function partes(t: string): [string, string, string] {
  const m = t.match(/^(.+?) (=|>|<) (.+)$/)
  expect(m, `"${t}" não é uma equação nem uma inequação`).not.toBeNull()
  return [m![1], m![2], m![3]]
}
const predicados = new Map<string, (x: number) => boolean>()
/** A comparação vale em x? */
function vale(t: string, x: number): boolean {
  let p = predicados.get(t)
  if (!p) {
    const [a, rel, b] = partes(t)
    const [fa, fb] = [compila(a), compila(b)]
    p = rel === '=' ? (x) => Math.abs(fa(x) - fb(x)) < 1e-9 : rel === '>' ? (x) => fa(x) > fb(x) + 1e-9 : (x) => fa(x) < fb(x) - 1e-9
    predicados.set(t, p)
  }
  return p(x)
}
const CANDIDATOS = Array.from({ length: 601 }, (_, i) => i - 200)
/** As soluções inteiras de uma equação, na força bruta. */
const solucoes = (t: string) => CANDIDATOS.filter((x) => vale(t, x))
/** A única solução inteira de uma equação (ou undefined, se não houver uma só). */
function resolve(t: string): number | undefined {
  const s = solucoes(t)
  return s.length === 1 ? s[0] : undefined
}
/** Valores de x, inteiros e quebrados, para comparar duas inequações. */
const AMOSTRA = Array.from({ length: 121 }, (_, i) => -15 + i * 0.25)
const mesmoConjunto = (a: string, b: string) => AMOSTRA.every((x) => vale(a, x) === vale(b, x))

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
const texs = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
const inteiro = (s: string) => {
  const m = s.match(/\d+/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0])
}
/** O número como o aluno digita a resposta errada: '−12' → −12. */
const valor = (t: string) => {
  expect(t, 'o erro se escreve com o menos verdadeiro').not.toMatch(/-/)
  return Number(t.replace('−', '-'))
}
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => valor(t) === v)
  return k === undefined ? undefined : item.erros[k]
}
/** O erro da opção que diz o mesmo que a comparação `t` (formato escolha). */
const erroDaOpcao = (item: Item, t: string) => {
  const i = item.opcoes!.findIndex((o) => mesmoConjunto(o.replace(/\$/g, ''), t))
  expect(i, `${item.enunciado}: nenhuma opção é "${t}"`).toBeGreaterThanOrEqual(0)
  return item.erros[String(i)]
}

describe('U15 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U15B).toHaveLength(9)
    for (const aula of ['B.U15.A4', 'B.U15.A5', 'B.U15.A6']) {
      expect(GERADORES_U15B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U15B.filter((x) => x.nivel > 1)) for (const item of itens(ger)) expect(item.visual, ger.id).toBeUndefined()
  })
  it('nenhum erro vale a certa; o menos é o verdadeiro; reais e unidades com espaço que não quebra', () => {
    for (const ger of GERADORES_U15B) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas]) {
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/-/)
          expect(t, `${ger.id}: R$ e unidades com espaço que não quebra em "${t}"`).not.toMatch(/R\$ |\d (km|anos|meses|horas|GB)\b/)
        }
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
        for (const t of Object.keys(item.erros)) expect(valor(t), `${item.enunciado}: o erro "${t}" vale a certa`).not.toBe(item.resposta)
        if ((item.resposta as number) < 0) expect(item.sinal, item.enunciado).toBe(true)
      }
    }
  })
  it('o avaliador e a força bruta conferem com contas feitas à mão', () => {
    expect(avalia('2(x + 3)', 4)).toBe(14)
    expect(avalia('\\frac{x}{3} - 2', 15)).toBe(3)
    expect(avalia('-11', 0)).toBe(-11)
    expect(resolve('2(x + 3) = 14')).toBe(4)
    expect(resolve('\\frac{x}{2} + 1 = 4')).toBe(6)
    expect(resolve('2x = 7')).toBeUndefined()
    expect(vale('x + 3 > 7', 4)).toBe(false)
    expect(vale('x + 3 > 7', 4.5)).toBe(true)
    expect(mesmoConjunto('x + 3 > 7', 'x > 4')).toBe(true)
    expect(mesmoConjunto('x + 3 > 7', 'x < 4')).toBe(false)
  })
})

describe('U15 · aula 4: parênteses e frações', () => {
  it('equacao-parenteses-n1: a(x + b) = c na balança, x/k = m na barra', () => {
    const vistos = { parenteses: 0, fracao: 0 }
    for (const item of itens(g('equacao-parenteses-n1'))) {
      const [t] = texs(item.enunciado)
      expect(item.enunciado).toBe(`Resolva $${t}$. Quanto vale x?`)
      const x = resolve(t)
      expect(x, t).toBeDefined()
      expect(item.resposta, t).toBe(x)
      let m: RegExpMatchArray | null
      if ((m = t.match(/^(\d+)\(x \+ (\d+)\) = (\d+)$/))) {
        vistos.parenteses++
        const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])]
        // Distribuir só no primeiro termo: ax + b = c.
        const parcial = resolve(`${a}x + ${b} = ${c}`)
        if (parcial !== undefined) expect(erroPara(item, parcial)).toBe('distributiva-parcial')
        // A balança: a caixas e a · b pesos contra c, em equilíbrio com o x achado, até 20 pesos por prato.
        const e = item.visual!.estado as { esquerda: { x: number; n: number }; direita: { n: number } }
        expect(item.visual!.modelo).toBe('balanca')
        expect(e.esquerda.x * x! + e.esquerda.n).toBe(e.direita.n)
        expect(e.esquerda.x).toBe(a)
        expect(e.direita.n).toBeLessThanOrEqual(20)
      } else if ((m = t.match(/^\\frac\{x\}\{(\d+)\} = (\d+)$/))) {
        vistos.fracao++
        const [k, v] = [Number(m[1]), Number(m[2])]
        expect(erroPara(item, v)).toBe('opera-so-de-um-lado')
        expect(item.visual!.modelo).toBe('barra')
        expect((item.visual!.estado as { partes: number }).partes).toBe(k)
      } else throw new Error(`forma inesperada: ${t}`)
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('equacao-parenteses-n2: x/k ± b = c e a(x − b) = c, sem visual', () => {
    const vistos = { mais: 0, menos: 0, parenteses: 0 }
    for (const item of itens(g('equacao-parenteses-n2'))) {
      const [t] = texs(item.enunciado)
      const x = resolve(t)
      expect(x, t).toBeDefined()
      expect(item.resposta, t).toBe(x)
      expect(item.sinal).toBe(true)
      let m: RegExpMatchArray | null
      if ((m = t.match(/^\\frac\{x\}\{(\d+)\} ([+-]) (\d+) = (\d+)$/))) {
        const [k, s, b, c] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])]
        if (s === '+') vistos.mais++
        else vistos.menos++
        // Multiplicar só o x/k pelo k: x ± b = k · c.
        expect(erroPara(item, resolve(`x ${s} ${b} = ${k * c}`)!)).toBe('multiplica-so-um-termo')
        expect(c, 'lado direito positivo').toBeGreaterThan(0)
      } else if ((m = t.match(/^(\d+)\(x - (\d+)\) = (\d+)$/))) {
        vistos.parenteses++
        const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])]
        const parcial = resolve(`${a}x - ${b} = ${c}`)
        if (parcial !== undefined) expect(erroPara(item, parcial)).toBe('distributiva-parcial')
      } else throw new Error(`forma inesperada: ${t}`)
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('equacao-parenteses-n3: os combos e a conta dividida com gorjeta', () => {
    const NUM: Record<string, number> = { Dois: 2, Três: 3, Quatro: 4 }
    const vistos = { combos: 0, conta: 0 }
    for (const item of itens(g('equacao-parenteses-n3'))) {
      const fs = negritos(item.enunciado)
      const r = item.resposta as number
      if (item.enunciado.includes('combos')) {
        vistos.combos++
        const a = NUM[item.enunciado.split(' ')[0]]
        expect(a, item.enunciado).toBeDefined()
        const [b, c] = fs.map(inteiro)
        // O lanche: o preço que, com o suco, a vezes, dá o total.
        expect(r, item.enunciado).toBe(resolve(`${a}(x + ${b}) = ${c}`))
        expect(erroPara(item, c / a), 'o preço de um combo').toBe('responde-outra-pergunta')
      } else {
        vistos.conta++
        const [k, gorjeta, t] = fs.map(inteiro)
        expect(fs[0]).toBe(`${k} amigos`)
        expect(r, item.enunciado).toBe(resolve(`\\frac{x}{${k}} + ${gorjeta} = ${t}`))
        expect(erroPara(item, t - gorjeta), 'a parte de um só').toBe('responde-outra-pergunta')
        expect(erroPara(item, k * t - gorjeta)).toBe('multiplica-so-um-termo')
      }
      expect(r).toBeGreaterThan(0)
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

/** Os três valores em reais de uma tarifa: o fixo, o valor por unidade e o total. */
const tarifa = (item: Item) => {
  const fs = negritos(item.enunciado)
  expect(fs, item.enunciado).toHaveLength(3)
  for (const f of fs) expect(f).toMatch(/^R\$ \d+$/)
  return fs.map(inteiro)
}

describe('U15 · aula 5: do problema à equação', () => {
  it('equacao-problema-n1: a equação que conta a história', () => {
    for (const item of itens(g('equacao-problema-n1'))) {
      expect(item.formato).toBe('escolha')
      const [f, p, total] = tarifa(item)
      const certa = item.opcoes![item.resposta as number].replace(/\$/g, '')
      const [esq, rel, dir] = partes(certa)
      expect(rel).toBe('=')
      expect(avalia(dir, 0)).toBe(total)
      // O preço: o fixo uma vez, mais p por unidade.
      for (const x of [0, 1, 2, 7]) expect(avalia(esq, x), certa).toBe(f + x * p)
      item.opcoes!.forEach((o, i) => {
        if (i === item.resposta) return
        const [e] = partes(o.replace(/\$/g, ''))
        expect([0, 1, 2, 7].every((x) => avalia(e, x) === f + x * p), `${o} vale o mesmo que a certa`).toBe(false)
      })
      // As leituras erradas: o fixo e o valor por unidade trocados, e o fixo esquecido.
      const opcaoQue = (preco: (x: number) => number) => {
        const i = item.opcoes!.findIndex((o) => [0, 1, 2, 7].every((x) => avalia(partes(o.replace(/\$/g, ''))[0], x) === preco(x)))
        expect(i, `${item.enunciado}: falta uma leitura errada`).toBeGreaterThanOrEqual(0)
        return item.erros[String(i)]
      }
      expect(opcaoQue((x) => p + f * x)).toBe('equacao-diferente-do-problema')
      expect(opcaoQue((x) => p * x)).toBe('esquece-valor-fixo')
    }
  })
  it('equacao-problema-n2: resolver a tarifa e responder a quantidade', () => {
    for (const item of itens(g('equacao-problema-n2'))) {
      const [f, p, total] = tarifa(item)
      // Na força bruta: quantas unidades fazem o fixo mais p por unidade dar o total.
      let k = 0
      while (f + p * k < total) k++
      expect(f + p * k, item.enunciado).toBe(total)
      expect(item.resposta, item.enunciado).toBe(k)
      expect(item.enunciado).toMatch(/\?$/)
      expect(erroPara(item, total - f), 'o que se pagou pelas unidades').toBe('responde-outra-pergunta')
      if (Number.isInteger(total / p) && total / p !== k && total / p !== total - f) expect(erroPara(item, total / p)).toBe('esquece-valor-fixo')
    }
  })
  it('equacao-problema-n3: idades, com a resposta que não é o x', () => {
    const VEZES: Record<string, number> = { 'o dobro': 2, 'o triplo': 3, 'o quádruplo': 4 }
    const vistos = { vezes: 0, mais: 0 }
    for (const item of itens(g('equacao-problema-n3'))) {
      const fs = negritos(item.enunciado)
      const r = item.resposta as number
      expect(fs[1]).toMatch(/^\d+ anos$/)
      const soma = inteiro(fs[1])
      if (fs[0] in VEZES) {
        vistos.vezes++
        const k = VEZES[fs[0]]
        // A menor idade é x; a maior, k vezes; juntas, a soma.
        const x = resolve(`x + ${k}x = ${soma}`)!
        expect(r, item.enunciado).toBe(k * x)
        expect(erroPara(item, x)).toBe('responde-outra-pergunta')
        expect(r - x, 'diferença de idade plausível').toBeGreaterThanOrEqual(14)
      } else {
        vistos.mais++
        const m = fs[0].match(/^(\d+) anos a mais$/)
        expect(m, item.enunciado).not.toBeNull()
        const d = Number(m![1])
        const x = resolve(`x + x + ${d} = ${soma}`)!
        expect(r, item.enunciado).toBe(x + d)
        expect(erroPara(item, x)).toBe('responde-outra-pergunta')
        // A pergunta é a pessoa que tem os anos a mais.
        const nome = item.enunciado.split(' ')[0]
        expect(item.enunciado.endsWith(`Quantos anos tem ${nome}?`)).toBe(true)
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('U15 · aula 6: inequações simples', () => {
  it('inequacao-n1: a solução de x + a > b ou x + a < b, com a balança inclinada', () => {
    for (const item of itens(g('inequacao-n1'))) {
      expect(item.formato).toBe('escolha')
      const [t] = texs(item.enunciado)
      const [, rel, dir] = partes(t)
      expect(rel).toMatch(/^[<>]$/)
      const certa = item.opcoes![item.resposta as number].replace(/\$/g, '')
      expect(mesmoConjunto(certa, t), `${t}: a certa "${certa}" não tem as mesmas soluções`).toBe(true)
      item.opcoes!.forEach((o, i) => {
        if (i !== item.resposta) expect(mesmoConjunto(o.replace(/\$/g, ''), t), `${t}: a errada "${o}" vale o mesmo`).toBe(false)
      })
      // A borda: onde os dois lados empatam.
      const borda = resolve(t.replace(/[<>]/, '='))!
      expect(erroDaOpcao(item, `x ${rel === '>' ? '<' : '>'} ${borda}`)).toBe('inequacao-sentido-trocado')
      expect(erroDaOpcao(item, `x = ${borda}`)).toBe('inequacao-como-equacao')
      // A balança desce para o lado maior.
      const e = item.visual!.estado as { inclina: string; direita: { n: number } }
      expect(e.inclina).toBe(rel === '>' ? 'esquerda' : 'direita')
      expect(e.direita.n).toBe(avalia(dir, 0))
      expect(e.direita.n).toBeLessThanOrEqual(20)
    }
  })
  it('inequacao-n2: o menor ou o maior inteiro que é solução', () => {
    let negativas = 0
    for (const item of itens(g('inequacao-n2'))) {
      const [t] = texs(item.enunciado)
      const [, rel] = partes(t)
      const s = solucoes(t)
      const menor = item.enunciado.includes('**menor número inteiro**')
      expect(menor || item.enunciado.includes('**maior número inteiro**'), item.enunciado).toBe(true)
      // Com >, as soluções vão até o fim da lista; com <, começam no começo.
      if (menor) {
        expect(rel).toBe('>')
        expect(item.resposta, t).toBe(Math.min(...s))
      } else {
        expect(rel).toBe('<')
        expect(item.resposta, t).toBe(Math.max(...s))
      }
      if ((item.resposta as number) < 0) negativas++
      expect(item.sinal).toBe(true)
      const borda = resolve(t.replace(/[<>]/, '='))!
      expect(erroPara(item, borda)).toBe('inequacao-inclui-a-borda')
    }
    expect(negativas).toBeGreaterThan(20)
  })
  it('inequacao-n3: o cofre e o plano de celular', () => {
    const vistos = { cofre: 0, plano: 0 }
    for (const item of itens(g('inequacao-n3'))) {
      const fs = negritos(item.enunciado)
      for (const f of fs) expect(f).toMatch(/^R\$ \d+$/)
      const r = item.resposta as number
      if (item.enunciado.includes('cofre')) {
        vistos.cofre++
        const [s, p, m] = fs.map(inteiro)
        // Mês a mês, até o cofre passar da meta.
        let n = 0
        let cofre = s
        while (cofre <= m) {
          n++
          cofre += p
        }
        expect(r, item.enunciado).toBe(n)
        expect(erroPara(item, n - 1), 'o mês que chega ou ainda não passa').toBe('inequacao-inclui-a-borda')
      } else {
        vistos.plano++
        const [a, f, gb] = fs.map(inteiro)
        // GB a GB, enquanto o plano B for mais barato.
        let n = 0
        while (f + gb * (n + 1) < a) n++
        expect(f + gb * n).toBeLessThan(a)
        expect(r, item.enunciado).toBe(n)
        expect(f + gb * (n + 1), 'com um GB a mais, empata').toBe(a)
        expect(erroPara(item, n + 1)).toBe('inequacao-inclui-a-borda')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})
