import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U03A } from '@/content/matematica/geradores/segundo-grau-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item, Rng } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o TeX) e refaz a conta por conta própria, sem
// usar as funções do gerador. As equações são lidas por um avaliador
// pequeno, escrito aqui, que entende a escrita junta (3x, x(x - 4),
// (x - 2)(x + 3)), as potências (x^2) e o \cdot. As raízes saem da procura:
// cada inteiro de −30 a 30 é posto no lugar do x, e é raiz quando os dois
// lados dão o mesmo número. O número que completa um quadrado é conferido
// achando um h com (x + h)² igual ao trinômio para vários x.

const g = (id: string) => GERADORES_AF_U03A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** Os valores de x em que duas expressões são comparadas. */
const XS = [-7, -3, -1, 1, 2, 3, 5, 9]

/** Avalia uma expressão em x: '(x - 2)(x + 3)', 'x^2 + 5x + 6', '3x^2', 'x(x - 4)', '(x + 4)^2'. */
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
  /** Fatores escritos juntos: 3x, x(x - 4), (x + 2)(x + 3). */
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
/** Os dois lados de uma equação em TeX. */
const lados = (eq: string) => {
  const partes = eq.split(' = ')
  expect(partes, `"${eq}": uma igualdade`).toHaveLength(2)
  return partes as [string, string]
}
/** As raízes inteiras de uma equação, procuradas de −30 a 30: os dois lados dão o mesmo número. */
function raizes(eq: string): number[] {
  const [esq, dir] = lados(eq)
  const out: number[] = []
  for (let x = -30; x <= 30; x++) if (avalia(esq, x) === avalia(dir, x)) out.push(x)
  return out
}
/** Os números dos fatores x + a de um produto: '(x - 2)(x + 3)' → [−2, 3]; 'x(x - 1)' → [0, −1]. */
function numerosDosFatores(tex: string): number[] {
  return [...tex.matchAll(/\(x ([+-]) (\d+)\)|(?<![\d(])x(?=\()/g)].map((m) => (m[1] ? (m[1] === '-' ? -1 : 1) * Number(m[2]) : 0))
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
/** A maior ou a menor raiz, como o enunciado pede. */
function pedida(item: Item, rs: number[]): number {
  const m = item.enunciado.match(/qual é a (maior|menor) raiz/i)
  expect(m, item.enunciado).not.toBeNull()
  return m![1].toLowerCase() === 'maior' ? Math.max(...rs) : Math.min(...rs)
}
/** O h com (x + h)² igual a x² + bx + v para todo x testado, ou undefined. */
function ladoDoQuadrado(b: number, v: number): number | undefined {
  for (let h = -30; h <= 30; h++) if (XS.every((x) => (x + h) ** 2 === x * x + b * x + v)) return h
  return undefined
}

describe('Álgebra e Funções, unidade 3 (aulas 1 a 4) · geradores', () => {
  it('12 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U03A).toHaveLength(12)
    for (const aula of ['AF.U3.A1', 'AF.U3.A2', 'AF.U3.A3', 'AF.U3.A4']) {
      expect(GERADORES_AF_U03A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U03A) {
      expect(ger.id).toMatch(/^segundo-grau-(duas-raizes|produto-zero|fatoracao|completar)-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) {
          expect(item.visual, ger.id).toBeDefined()
          expect(item.visual!.esboco).toBeTruthy()
        } else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })
  it('respostas inteiras; nenhum erro vale a certa; o menos é o verdadeiro; tecla do menos', () => {
    for (const ger of GERADORES_AF_U03A) {
      for (const item of itens(ger)) {
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
        expect(item.dicas).toHaveLength(3)
        const textos = [item.enunciado, ...item.dicas]
        // Fora do TeX, o menos é o verdadeiro.
        for (const t of textos) expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        // Nenhum TeX vazio nem cifrão solto.
        for (const t of textos) expect((t.match(/\$/g) ?? []).length % 2, `${ger.id}: cifrão solto em "${t}"`).toBe(0)
        for (const t of Object.keys(item.erros)) expect(valor(t), `${item.enunciado}: o erro "${t}" vale a certa`).not.toBe(item.resposta)
        if ((item.resposta as number) < 0) expect(item.sinal, item.enunciado).toBe(true)
      }
    }
  })
  it('o avaliador, a procura de raízes e o leitor de fatores conferem com contas feitas à mão', () => {
    expect(avalia('(x - 2)(x + 3)', 4)).toBe(14)
    expect(avalia('x(x - 4)', 5)).toBe(5)
    expect(avalia('3x^2', 2)).toBe(12)
    expect(avalia('(x + 4)^2', -1)).toBe(9)
    expect(raizes('x^2 - 5x + 6 = 0')).toEqual([2, 3])
    expect(raizes('x^2 = 25')).toEqual([-5, 5])
    expect(raizes('x^2 + 9 = 0')).toEqual([])
    expect(raizes('(2x - 6)(x + 4) = 0')).toEqual([-4, 3])
    expect(numerosDosFatores('x(x - 1)(x + 12)')).toEqual([0, -1, 12])
    expect(numerosDosFatores('(x + 2)(x - 3)')).toEqual([2, -3])
    expect(ladoDoQuadrado(6, 9)).toBe(3)
    expect(ladoDoQuadrado(6, 3)).toBeUndefined()
  })
  it('termina com o rng de borda, que repete sempre o mínimo ou o máximo', () => {
    for (const superior of [false, true]) {
      const borda: Rng = {
        int: (min, max) => (superior ? max : min),
        pick: (items) => items[superior ? items.length - 1 : 0],
        next: () => (superior ? 0.999 : 0),
      }
      for (const ger of GERADORES_AF_U03A) {
        const item = ger.gerar(borda)
        expect(item.resposta, ger.id).toBeDefined()
        expect(Object.keys(item.erros), ger.id).not.toContain(String(item.resposta))
      }
    }
  })
})

describe('aula 1: x² = k tem duas raízes', () => {
  it('segundo-grau-duas-raizes-n1: a menor raiz de x² = k, com o quadrado de lado x', () => {
    for (const item of itens(g('segundo-grau-duas-raizes-n1'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^x\^2 = \d+$/)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(rs[0], eq).toBe(-rs[1])
      expect(item.resposta).toBe(pedida(item, rs))
      expect(erroPara(item, rs[1])).toBe('raiz-so-positiva')
      const k = Number(lados(eq)[1])
      if (k % 2 === 0 && k / 2 !== rs[1]) expect(erroPara(item, k / 2)).toBe('raiz-e-a-metade')
      expect(item.visual!.modelo).toBe('retangulo')
      expect(item.visual!.estado).toMatchObject({ base: ['x'], altura: ['x'], areas: [[String(k)]] })
    }
  })
  it('segundo-grau-duas-raizes-n2: a maior ou a menor raiz de (x + a)² = k', () => {
    const vistos = { maior: 0, menor: 0 }
    for (const item of itens(g('segundo-grau-duas-raizes-n2'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^\(x [+-] \d+\)\^2 = \d+$/)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      const certa = pedida(item, rs)
      expect(item.resposta).toBe(certa)
      // O número do parêntese, lido do TeX: o centro das duas raízes é −a.
      const [a] = numerosDosFatores(lados(eq)[0])
      expect(rs[0] + rs[1]).toBe(-2 * a)
      // Desfazer o + a somando a espelha a raiz pedida em torno do zero e a desloca: x = a ± n.
      const espelho = 2 * a + certa
      expect(erroPara(item, espelho), eq).toBe('desfaz-com-a-mesma-operacao')
      if (/menor/.test(item.enunciado)) {
        vistos.menor++
        expect(erroPara(item, Math.max(...rs))).toBe('raiz-so-positiva')
      } else vistos.maior++
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('segundo-grau-duas-raizes-n3: quantas raízes tem x² + a = b, e a menor raiz de cx² = d', () => {
    const vistos = { zero: 0, uma: 0, duas: 0, coeficiente: 0 }
    for (const item of itens(g('segundo-grau-duas-raizes-n3'))) {
      const [eq] = texs(item.enunciado)
      const [esq, dir] = lados(eq)
      if (item.enunciado.startsWith('Quantas')) {
        expect(eq).toMatch(/^x\^2 \+ \d+ = -?\d+$/)
        // x² = k, com k = b − a lido dos dois lados em x = 0.
        const k = avalia(dir, 0) - avalia(esq, 0)
        const certa = k > 0 ? 2 : k === 0 ? 1 : 0
        expect(item.resposta, eq).toBe(certa)
        if (certa === 2) {
          vistos.duas++
          expect(erroPara(item, 1)).toBe('raiz-so-positiva')
        } else if (certa === 1) vistos.uma++
        else {
          vistos.zero++
          expect(erroPara(item, 2)).toBe('raiz-de-numero-negativo')
          expect(raizes(eq)).toEqual([])
        }
      } else {
        vistos.coeficiente++
        expect(eq).toMatch(/^\d+x\^2 = \d+$/)
        const rs = raizes(eq)
        expect(rs).toHaveLength(2)
        expect(item.resposta).toBe(pedida(item, rs))
        expect(erroPara(item, Math.max(...rs))).toBe('raiz-so-positiva')
        expect(erroPara(item, -(rs[1] ** 2))).toBe('esquece-de-dividir')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
})

describe('aula 2: produto igual a zero', () => {
  it('segundo-grau-produto-zero-n1: a maior ou a menor raiz de (x + p)(x + q) = 0, com a tabela', () => {
    for (const item of itens(g('segundo-grau-produto-zero-n1'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^\(x [+-] \d+\)\(x [+-] \d+\) = 0$/)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(item.resposta).toBe(pedida(item, rs))
      const ns = numerosDosFatores(lados(eq)[0])
      // Copiar o número do fator: o oposto de cada raiz.
      for (const raiz of rs) if (-raiz !== item.resposta) expect(erroPara(item, -raiz), eq).toBe('raiz-com-o-sinal-do-fator')
      const e = item.visual!.estado as { produtoZero: { fatores: number[]; valores: number[] } }
      expect(e.produtoZero.fatores).toEqual(ns)
      for (const raiz of rs) expect(e.produtoZero.valores).toContain(raiz)
      expect(e.produtoZero.valores.length).toBeLessThanOrEqual(8)
    }
  })
  it('segundo-grau-produto-zero-n2: um fator com número na frente', () => {
    for (const item of itens(g('segundo-grau-produto-zero-n2'))) {
      const [eq] = texs(item.enunciado)
      const m = eq.match(/^\((\d)x ([+-]) (\d+)\)\(x [+-] \d+\) = 0$/)
      expect(m, eq).not.toBeNull()
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(item.resposta).toBe(pedida(item, rs))
      // A raiz do fator kx + m: o x com kx + m = 0, procurado entre as raízes.
      const k = Number(m![1])
      const mm = (m![2] === '-' ? -1 : 1) * Number(m![3])
      const daFrente = rs.find((x) => k * x + mm === 0)!
      expect(daFrente, eq).toBeDefined()
      const outra = rs.find((x) => x !== daFrente)!
      if (k * daFrente !== item.resposta) expect(erroPara(item, k * daFrente), eq).toBe('esquece-de-dividir')
      for (const raiz of [daFrente, outra]) if (-raiz !== item.resposta) expect(erroPara(item, -raiz), eq).toBe('raiz-com-o-sinal-do-fator')
      // Nenhum erro é a outra raiz.
      for (const t of Object.keys(item.erros)) expect(rs, eq).not.toContain(valor(t))
    }
  })
  it('segundo-grau-produto-zero-n3: a soma das raízes de três fatores', () => {
    let comX = 0
    for (const item of itens(g('segundo-grau-produto-zero-n3'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^(x|\(x [+-] \d+\))(\(x [+-] \d+\)){2} = 0$/)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(3)
      const soma = rs.reduce((a, b) => a + b, 0)
      expect(item.resposta, eq).toBe(soma)
      expect(soma).not.toBe(0)
      expect(erroPara(item, -soma)).toBe('raiz-com-o-sinal-do-fator')
      if (eq.startsWith('x(')) comX++
    }
    expect(comX).toBeGreaterThan(20)
  })
})

describe('aula 3: resolver por fatoração', () => {
  it('segundo-grau-fatoracao-n1: a maior ou a menor raiz de x² + bx + c = 0, com os azulejos', () => {
    for (const item of itens(g('segundo-grau-fatoracao-n1'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^x\^2 \+ \d*x \+ \d+ = 0$/)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(item.resposta).toBe(pedida(item, rs))
      const [esq] = lados(eq)
      const c = avalia(esq, 0)
      const b = (avalia(esq, 1) - avalia(esq, -1)) / 2
      expect((item.visual!.estado as { azulejos: { fatorar: number[] } }).azulejos.fatorar).toEqual([b, c])
      expect(b).toBeLessThanOrEqual(8)
      expect(c).toBeLessThanOrEqual(12)
      for (const raiz of rs) expect(erroPara(item, -raiz), eq).toBe('raiz-com-o-sinal-do-fator')
      for (const v of [c, -c]) if (![...rs, ...rs.map((x) => -x)].includes(v)) expect(erroPara(item, v), eq).toBe('iguala-a-zero-sem-fatorar')
    }
  })
  it('segundo-grau-fatoracao-n2: x² = bx, a diferença de quadrados e o trinômio com sinais', () => {
    const vistos = { evidencia: 0, diferenca: 0, trinomio: 0 }
    for (const item of itens(g('segundo-grau-fatoracao-n2'))) {
      const [eq] = texs(item.enunciado)
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(item.resposta, eq).toBe(pedida(item, rs))
      if (/^x\^2 = -?\d+x$/.test(eq)) {
        vistos.evidencia++
        // A raiz 0 é a pedida, e a divisão por x deixa só a outra.
        expect(rs).toContain(0)
        expect(item.resposta).toBe(0)
        const outra = rs.find((x) => x !== 0)!
        expect(erroPara(item, outra)).toBe('divide-por-x-e-perde-o-zero')
      } else if (/^x\^2 - \d+ = 0$/.test(eq)) {
        vistos.diferenca++
        expect(rs[0]).toBe(-rs[1])
        expect(erroPara(item, rs[1])).toBe('raiz-so-positiva')
        const n2 = -avalia(lados(eq)[0], 0)
        expect(erroPara(item, n2)).toBe('fatora-sem-tirar-a-raiz')
        expect(erroPara(item, -n2)).toBe('fatora-sem-tirar-a-raiz')
      } else {
        vistos.trinomio++
        expect(eq).toMatch(/^x\^2 [+-] \d*x [+-] \d+ = 0$/)
        for (const raiz of rs) if (-raiz !== item.resposta) expect(erroPara(item, -raiz), eq).toBe('raiz-com-o-sinal-do-fator')
        const c = avalia(lados(eq)[0], 0)
        if (![...rs, ...rs.map((x) => -x)].includes(c)) expect(erroPara(item, c), eq).toBe('iguala-a-zero-sem-fatorar')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('segundo-grau-fatoracao-n3: arrumar antes de fatorar', () => {
    const vistos = { direita: 0, esquerda: 0 }
    for (const item of itens(g('segundo-grau-fatoracao-n3'))) {
      const [eq] = texs(item.enunciado)
      const [esq, dir] = lados(eq)
      // Nada de zero de um lado: a equação chega desarrumada.
      expect(dir).not.toBe('0')
      if (esq === 'x^2') vistos.direita++
      else vistos.esquerda++
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      expect(item.resposta).toBe(pedida(item, rs))
      for (const raiz of rs) if (-raiz !== item.resposta) expect(erroPara(item, -raiz), eq).toBe('raiz-com-o-sinal-do-fator')
      for (const t of Object.keys(item.erros)) expect(rs, eq).not.toContain(valor(t))
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('aula 4: completar o quadrado', () => {
  it('segundo-grau-completar-n1: o número que completa x² + bx, com as barras partidas', () => {
    for (const item of itens(g('segundo-grau-completar-n1'))) {
      const [t] = texs(item.enunciado)
      const m = t.match(/^x\^2 \+ (\d+)x \+ \\square$/)
      expect(m, t).not.toBeNull()
      const b = Number(m![1])
      const h = ladoDoQuadrado(b, item.resposta as number)
      expect(h, t).toBeDefined()
      expect(erroPara(item, b * b)).toBe('completa-com-b-ao-quadrado')
      if (h !== item.resposta) expect(erroPara(item, h!)).toBe('completa-com-a-metade')
      expect(item.visual!.estado).toEqual({ azulejos: { completar: b, partido: true } })
    }
  })
  it('segundo-grau-completar-n2: com b negativo, ou o lado direito depois de completar', () => {
    const vistos = { negativo: 0, direito: 0 }
    for (const item of itens(g('segundo-grau-completar-n2'))) {
      const r = item.resposta as number
      const [t, depois] = texs(item.enunciado)
      if (item.enunciado.startsWith('Que número')) {
        vistos.negativo++
        const m = t.match(/^x\^2 - (\d+)x \+ \\square$/)
        expect(m, t).not.toBeNull()
        const b = -Number(m![1])
        const h = ladoDoQuadrado(b, r)
        expect(h, t).toBeDefined()
        expect(erroPara(item, -r)).toBe('canto-do-quadrado-negativo')
        expect(erroPara(item, b * b)).toBe('completa-com-b-ao-quadrado')
        if (-h! !== r) expect(erroPara(item, -h!)).toBe('completa-com-a-metade')
      } else {
        vistos.direito++
        // As duas equações têm as mesmas raízes quando o □ é a resposta.
        expect(depois).toMatch(/^\(x [+-] \d+\)\^2 = \\square$/)
        const antes = raizes(t)
        const agora = raizes(depois.replace('\\square', `(${r})`))
        expect(antes.length, t).toBeGreaterThan(0)
        expect(agora, `${t} e ${depois}`).toEqual(antes)
        const c = avalia(lados(t)[1], 0)
        expect(erroPara(item, c)).toBe('opera-so-de-um-lado')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('segundo-grau-completar-n3: a maior ou a menor raiz de x² + bx = c', () => {
    for (const item of itens(g('segundo-grau-completar-n3'))) {
      const [eq] = texs(item.enunciado)
      expect(eq).toMatch(/^x\^2 [+-] \d*x = -?\d+$/)
      expect(lados(eq)[1]).not.toBe('0')
      const rs = raizes(eq)
      expect(rs, eq).toHaveLength(2)
      const certa = pedida(item, rs)
      expect(item.resposta).toBe(certa)
      // O centro das raízes é −h, a metade do número do x com o sinal trocado.
      const esq = lados(eq)[0]
      const b = (avalia(esq, 1) - avalia(esq, -1)) / 2
      expect(rs[0] + rs[1]).toBe(-b)
      // Desfazer o + h somando h: x = h ± n, a raiz pedida deslocada de b.
      expect(erroPara(item, certa + b), eq).toBe('desfaz-com-a-mesma-operacao')
      if (/menor/.test(item.enunciado)) expect(erroPara(item, Math.max(...rs))).toBe('raiz-so-positiva')
    }
  })
})
