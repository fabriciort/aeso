import { describe, expect, it } from 'vitest'
import { GERADORES_U14B } from '@/content/matematica/geradores/algebra-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito e o TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador. As expressões (do enunciado e
// das opções) são lidas por um avaliador pequeno, escrito aqui: duas
// expressões são a mesma quando dão o mesmo número para vários valores de x.

const g = (id: string) => GERADORES_U14B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** Os valores de x em que duas expressões são comparadas. */
const XS = [-7, -2, 0, 1, 3, 6, 10, 13]

/**
 * Avalia uma expressão em x: '2x - 3', '-2(x + 5)', '\frac{x}{2}',
 * 'x + 5 \cdot 2', '3 − x'. Multiplicação junta (2x, 2(…)), o menos
 * verdadeiro e o hífen valem o mesmo.
 */
function avalia(tex: string, x: number): number {
  let s = tex
    .replace(/\$/g, '')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\cdot|·|×/g, '*')
    .replace(/−/g, '-')
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
    let v = fator()
    for (;;) {
      if (peek() === '*' || peek() === '/') {
        const op = s[i++]
        const f = fator()
        v = op === '*' ? v * f : v / f
      } else if (peek() === 'x' || peek() === '(' || /\d/.test(peek() ?? '')) {
        v *= fator() // multiplicação junta: 2x, 2(x + 3), x(…)
      } else return v
    }
  }
  function fator(): number {
    const c = peek()
    if (c === '-') {
      i++
      return -fator()
    }
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
  s = ''
  return v
}
/** Duas expressões iguais para todo x testado. */
const mesma = (a: string | ((x: number) => number), b: string | ((x: number) => number)) => {
  const f = (e: string | ((x: number) => number)) => (typeof e === 'string' ? (x: number) => avalia(e, x) : e)
  return XS.every((x) => Math.abs(f(a)(x) - f(b)(x)) < 1e-9)
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
const erroDaOpcao = (item: Item, e: string | ((x: number) => number)) => {
  const i = item.opcoes!.findIndex((o) => mesma(o, e))
  expect(i, `${item.enunciado}: nenhuma opção é a esperada`).toBeGreaterThanOrEqual(0)
  return item.erros[String(i)]
}

/** Uma escolha: a certa é a esperada, e nenhuma errada é a mesma expressão. */
function confereEscolha(item: Item, esperada: (x: number) => number) {
  expect(item.formato).toBe('escolha')
  const certa = item.opcoes![item.resposta as number]
  expect(mesma(certa, esperada), `${item.enunciado}: a opção certa "${certa}" não é a da frase`).toBe(true)
  item.opcoes!.forEach((o, i) => {
    if (i !== item.resposta) expect(mesma(o, esperada), `${item.enunciado}: a opção errada "${o}" vale o mesmo que a certa`).toBe(false)
  })
  for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
}

describe('U14 (aulas 4 e 5) · geradores', () => {
  it('6 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U14B).toHaveLength(6)
    for (const aula of ['B.U14.A4', 'B.U14.A5']) {
      expect(GERADORES_U14B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; opções diferentes', () => {
    for (const ger of GERADORES_U14B) {
      for (const item of itens(ger)) {
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
    expect(avalia('2(x + 3)', 4)).toBe(14)
    expect(avalia('2x - 3', 10)).toBe(17)
    expect(avalia('-2(x - 3)', 5)).toBe(-4)
    expect(avalia('\\frac{x}{2}', 10)).toBe(5)
    expect(avalia('x + 5 \\cdot 2', 1)).toBe(11)
    expect(avalia('3 − x', 40)).toBe(-37)
    expect(avalia('-x + 3', 1)).toBe(2)
  })
})

describe('U14 · aula 4: distributiva com letras', () => {
  it('distributiva-letras-n1: a(x + b) = ax + □, com o retângulo', () => {
    for (const item of itens(g('distributiva-letras-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^(\d+)\(x \+ (\d+)\) = (\d+)x \+ \\square$/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b, a2] = [Number(m![1]), Number(m![2]), Number(m![3])]
      expect(a2).toBe(a)
      // A resposta é o que falta para os dois lados serem a mesma expressão.
      const falta = item.resposta as number
      expect(mesma(`${a}(x + ${b})`, `${a}x + ${falta}`), item.enunciado).toBe(true)
      expect(erroPara(item, b)).toBe('distributiva-parcial')
      if (a + b !== a * b) expect(erroPara(item, a + b)).toBe('soma-no-lugar-de-multiplicar')
      const e = item.visual!.estado as { base: (string | number)[]; altura: number[] }
      expect(e.base).toEqual(['x', b])
      expect(e.altura).toEqual([a])
      expect(item.visual!.esboco).toBeTruthy()
    }
  })
  it('distributiva-letras-n2: tirar parênteses com um menos dentro ou fora', () => {
    let fora = 0
    for (const item of itens(g('distributiva-letras-n2'))) {
      const [t] = texs(item.enunciado)
      expect(t, item.enunciado).toMatch(/^-?\d+\(x [+-] \d+\)$/)
      if (t.startsWith('-')) fora++
      confereEscolha(item, (x) => avalia(t, x))
      // O erro do sinal: o termo sem x com o sinal trocado.
      const m = t.match(/^(-?\d+)\(x ([+-]) (\d+)\)$/)!
      const A = Number(m[1])
      const B = (m[2] === '-' ? -1 : 1) * Number(m[3])
      expect(erroDaOpcao(item, (x) => A * x - A * B)).toBe('distributiva-sinal-do-negativo')
      expect(erroDaOpcao(item, (x) => A * x + B)).toBe('distributiva-parcial')
      expect(t.includes('-'), 'sempre há um menos').toBe(true)
      expect(item.visual).toBeUndefined()
    }
    expect(fora).toBeGreaterThan(100)
  })
  it('distributiva-letras-n3: pôr em evidência, a horta e o termo sem x', () => {
    const vistos = { evidencia: 0, area: 0, valor: 0, constante: 0 }
    for (const item of itens(g('distributiva-letras-n3'))) {
      expect(item.visual).toBeUndefined()
      const r = item.resposta as number
      if (item.enunciado.startsWith('Ponha em evidência')) {
        vistos.evidencia++
        const [t] = texs(item.enunciado)
        const m = t.match(/^(\d+)x ([+-]) (\d+) = (\d+)\(x ([+-]) \\square\)$/)
        expect(m, item.enunciado).not.toBeNull()
        const [a, s, c, a2, s2] = [Number(m![1]), m![2], Number(m![3]), Number(m![4]), m![5]]
        expect(a2).toBe(a)
        expect(s2).toBe(s)
        expect(mesma(`${a}x ${s} ${c}`, `${a}(x ${s} ${r})`), item.enunciado).toBe(true)
        expect(erroPara(item, c)).toBe('evidencia-esquece-termo')
      } else if (item.enunciado.startsWith('Uma horta')) {
        const [fundo] = negritos(item.enunciado)
        const a = inteiros(fundo)[0]
        const frente = texs(item.enunciado)[0]
        const b = Number(frente.match(/^\(x \+ (\d+)\)$/)![1])
        if (/\\square/.test(item.enunciado)) {
          vistos.area++
          expect(texs(item.enunciado)[1]).toBe(`${a}x + \\square`)
          expect(mesma(`${a}(x + ${b})`, `${a}x + ${r}`), item.enunciado).toBe(true)
          expect(erroPara(item, b)).toBe('distributiva-parcial')
        } else {
          vistos.valor++
          const k = inteiros(negritos(item.enunciado)[1])[0]
          // A área de um retângulo: fundo vezes frente, com a frente medida.
          let area = 0
          for (let i = 0; i < k + b; i++) area += a
          expect(r, item.enunciado).toBe(area)
          expect(erroPara(item, a * k + b)).toBe('distributiva-parcial')
        }
      } else {
        vistos.constante++
        expect(item.enunciado).toMatch(/^Tire os parênteses de \$.+\$\. Qual é o número que fica sem o x\?$/)
        const [t] = texs(item.enunciado)
        // O termo sem x é o valor da expressão em x = 0.
        expect(r, item.enunciado).toBe(avalia(t, 0))
        expect(item.sinal).toBe(true)
        expect(erroPara(item, -r)).toBe('distributiva-sinal-do-negativo')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
})

/** O que uma frase diz, lido aqui de forma independente. */
const VEZES: Record<string, number> = { dobro: 2, triplo: 3, 'quádruplo': 4 }
function leFrase(f: string): (x: number) => number {
  let m: RegExpMatchArray | null
  if (f === 'o dobro de um número') return (x) => x + x
  if (f === 'o triplo de um número') return (x) => x + x + x
  if (f === 'a metade de um número') return (x) => x / 2
  if (f === 'o sucessor de um número') return (x) => x + 1
  if ((m = f.match(/^(\d+) a mais que um número$/))) return (x) => x + Number(m![1])
  if ((m = f.match(/^(\d+) a menos que um número$/))) return (x) => x - Number(m![1])
  if ((m = f.match(/^o (dobro|triplo|quádruplo) de um número, (mais|menos) (\d+)$/))) {
    const [k, s, b] = [VEZES[m[1]], m[2] === 'mais' ? 1 : -1, Number(m[3])]
    return (x) => k * x + s * b
  }
  if ((m = f.match(/^o (dobro|triplo|quádruplo) da soma de um número com (\d+)$/))) {
    const [k, b] = [VEZES[m[1]], Number(m[2])]
    return (x) => k * (x + b)
  }
  if ((m = f.match(/^o (dobro|triplo|quádruplo) da diferença entre um número e (\d+)$/))) {
    const [k, b] = [VEZES[m[1]], Number(m[2])]
    return (x) => k * (x - b)
  }
  if ((m = f.match(/^a soma de um número com (\d+), vezes (\d+)$/))) {
    const [b, k] = [Number(m[1]), Number(m[2])]
    return (x) => (x + b) * k
  }
  throw new Error(`frase que o teste não conhece: "${f}"`)
}
/** A outra leitura da frase: os parênteses no lugar errado. */
function outraLeitura(f: string): (x: number) => number {
  let m: RegExpMatchArray | null
  if ((m = f.match(/^o (dobro|triplo|quádruplo) de um número, (mais|menos) (\d+)$/))) {
    const [k, s, b] = [VEZES[m[1]], m[2] === 'mais' ? 1 : -1, Number(m[3])]
    return (x) => k * (x + s * b)
  }
  if ((m = f.match(/^o (dobro|triplo|quádruplo) da (soma|diferença) (?:de|entre) um número (?:com|e) (\d+)$/))) {
    const [k, s, b] = [VEZES[m[1]], m[2] === 'soma' ? 1 : -1, Number(m[3])]
    return (x) => k * x + s * b
  }
  if ((m = f.match(/^a soma de um número com (\d+), vezes (\d+)$/))) {
    const [b, k] = [Number(m[1]), Number(m[2])]
    return (x) => k * x + b
  }
  throw new Error(`frase sem outra leitura: "${f}"`)
}

describe('U14 · aula 5: traduzir frases', () => {
  it('traduzir-frases-n1: uma palavra, uma conta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('traduzir-frases-n1'))) {
      const [frase] = negritos(item.enunciado)
      tipos.add(frase.replace(/\d+/, 'B'))
      confereEscolha(item, leFrase(frase))
      if (/^o (dobro|triplo)/.test(frase)) {
        const k = frase.includes('dobro') ? 2 : 3
        expect(erroDaOpcao(item, (x) => x + k)).toBe('vezes-como-mais')
      }
      if (frase.startsWith('a metade')) expect(erroDaOpcao(item, (x) => 2 * x)).toBe('confunde-dobro-e-metade')
      const m = frase.match(/^(\d+) a menos que/)
      if (m) expect(erroDaOpcao(item, (x) => Number(m[1]) - x)).toBe('inverte-ordem-da-subtracao')
    }
    expect(tipos.size).toBe(6)
  })
  it('traduzir-frases-n2: com e sem parênteses, em escolha ou com um número', () => {
    let escolhas = 0
    let numeros = 0
    for (const item of itens(g('traduzir-frases-n2'))) {
      const fs = negritos(item.enunciado)
      const frase = fs[fs.length - 1]
      const certa = leFrase(frase)
      const outra = outraLeitura(frase)
      if (item.formato === 'escolha') {
        escolhas++
        confereEscolha(item, certa)
        expect(erroDaOpcao(item, outra)).toBe('traduz-parenteses-errados')
      } else {
        numeros++
        const n = inteiros(fs[0])[0]
        expect(item.resposta, item.enunciado).toBe(certa(n))
        expect(erroPara(item, outra(n))).toBe('traduz-parenteses-errados')
        expect(item.resposta as number).toBeGreaterThan(0)
      }
    }
    expect(escolhas).toBeGreaterThan(100)
    expect(numeros).toBeGreaterThan(100)
  })
  it('traduzir-frases-n3: preços com valor fixo e idades', () => {
    let precos = 0
    let idades = 0
    for (const item of itens(g('traduzir-frases-n3'))) {
      const fs = negritos(item.enunciado)
      const r = item.resposta as number
      if (fs[0].startsWith('R$')) {
        precos++
        const [f, p, k] = fs.map((t) => inteiros(t)[0])
        expect(fs).toHaveLength(3)
        // O fixo uma vez, e o preço por unidade somado k vezes.
        let total = f
        for (let i = 0; i < k; i++) total += p
        expect(r, item.enunciado).toBe(total)
        expect(erroPara(item, (f + p) * k)).toBe('ignora-prioridade')
        expect(erroPara(item, p * k)).toBe('esquece-valor-fixo')
      } else {
        idades++
        const m = fs[0].match(/^o (dobro|triplo) da idade (?:dela|dele), mais (\d+)\u00a0anos$/)
        expect(m, item.enunciado).not.toBeNull()
        const [k, b] = [VEZES[m![1]], Number(m![2])]
        const n = inteiros(fs[1])[0]
        expect(r, item.enunciado).toBe(k * n + b)
        expect(erroPara(item, k * (n + b))).toBe('traduz-parenteses-errados')
        expect(r, 'idade de mãe plausível').toBeGreaterThanOrEqual(n + 14)
      }
    }
    expect(precos).toBeGreaterThan(100)
    expect(idades).toBeGreaterThan(50)
  })
})
