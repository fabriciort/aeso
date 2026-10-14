import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U01A } from '@/content/matematica/geradores/polinomios-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (os polinômios em TeX) e refaz a conta por conta
// própria, sem usar as funções do gerador: um pequeno leitor de expressões
// (com a ordem das operações, a escrita junta 3x = 3 · x e as potências)
// calcula o valor numérico, e os coeficientes saem resolvendo o polinômio
// em seis valores de x. Nas escolhas, a opção certa tem de valer o mesmo que
// a conta do enunciado para vários valores das letras, e cada errada tem de
// diferir em algum deles. Os erros previsíveis são refeitos do jeito errado
// (virar só o primeiro termo, somar os coeficientes) e conferidos pelo id.

const g = (id: string) => GERADORES_AF_U01A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

// ---------------------------------------------------------------- leitor de expressões

/** O valor de uma expressão em TeX (3x^2 - 4x + 5, (-2x^3) \cdot 5x^4, 2x^2y) com as letras valendo `vars`. */
function valor(src: string, vars: Record<string, number>): number {
  // As chaves do TeX (x^{5}) agrupam como parênteses.
  const limpo = src.replace(/\\cdot|\\times/g, '*').replace(/\s+/g, '').replace(/\{/g, '(').replace(/\}/g, ')')
  const toks = limpo.match(/\d+|[a-z]|[+\-*^()]/g) ?? []
  expect(toks.join(''), `expressão com algo estranho: ${src}`).toBe(limpo)
  let i = 0
  const espia = () => toks[i]
  const come = () => toks[i++]
  function atomo(): number {
    const t = come()
    if (t === '(') {
      const v = soma()
      expect(come()).toBe(')')
      return v
    }
    if (/^\d+$/.test(t)) return Number(t)
    expect(t in vars, `letra sem valor: ${t} em ${src}`).toBe(true)
    return vars[t]
  }
  function potencia(): number {
    const b = atomo()
    if (espia() !== '^') return b
    come()
    const e = atomo()
    let v = 1
    for (let k = 0; k < e; k++) v *= b
    return v
  }
  function unario(): number {
    if (espia() === '-') {
      come()
      return -unario()
    }
    return potencia()
  }
  function produto(): number {
    let v = unario()
    for (;;) {
      const t = espia()
      if (t === '*') {
        come()
        v *= unario()
      } else if (t !== undefined && (/^[a-z(]$/.test(t) || /^\d+$/.test(t))) {
        // A escrita junta: 3x, 2(x + 1), x^2y.
        v *= potencia()
      } else return v
    }
  }
  function soma(): number {
    let v = produto()
    for (;;) {
      const t = espia()
      if (t === '+') {
        come()
        v += produto()
      } else if (t === '-') {
        come()
        v -= produto()
      } else return v
    }
  }
  const v = soma()
  expect(i, `sobrou algo em ${src}`).toBe(toks.length)
  return v
}

const VALORES = [1, 2, 3, -1, -2, 5]
const PARES = [[1, 1], [2, 3], [3, 2], [-1, 2], [2, -3], [5, 1]]
/** As duas expressões valem o mesmo para os valores das letras (x, ou x e y). */
const equivalentes = (a: string, b: string) =>
  /y/.test(a + b)
    ? PARES.every(([x, y]) => valor(a, { x, y }) === valor(b, { x, y }))
    : VALORES.every((x) => valor(a, { x }) === valor(b, { x }))

/** Os coeficientes de um polinômio em x de grau até 5, do grau 0 em diante (resolvendo em x = 0 … 5). */
function coefs(src: string): number[] {
  const n = 6
  const m = Array.from({ length: n }, (_, i) => [...Array.from({ length: n }, (_, j) => i ** j), valor(src, { x: i })])
  for (let c = 0; c < n; c++) {
    const p = m.findIndex((row, r) => r >= c && row[c] !== 0)
    ;[m[c], m[p]] = [m[p], m[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = m[r][c] / m[c][c]
      for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k]
    }
  }
  return m.map((row, i) => Math.round(row[n] / row[i]) + 0)
}
const grauDe = (src: string) => coefs(src).reduce((g, k, i) => (k !== 0 ? i : g), 0)

/** Os termos de uma expressão sem parênteses, com o sinal de cada um: '4x + 2x^3 - 7' → ['4x', '+2x^3', '-7']. */
const termos = (src: string) => src.replace(/\s+/g, '').match(/[+-]?[^+-]+/g)!
/** O grau de um termo escrito: 7 → 0, 4x → 1, 2x^3 → 3. */
const grauDoTermo = (t: string) => (t.includes('x') ? (t.match(/x\^\{?(\d+)/) ? Number(t.match(/x\^\{?(\d+)/)![1]) : 1) : 0)

/** A expressão de uma opção: o primeiro $...$ do texto. */
const daOpcao = (o: string) => {
  const m = o.match(/^\$\{(.+)\}\$$/)
  expect(m, `opção sem fórmula: ${o}`).not.toBeNull()
  return m![1]
}

/** Na escolha, só a certa vale o mesmo que a expressão `alvo`. */
function soACertaEquivale(item: Item, alvo: string) {
  expect(item.formato).toBe('escolha')
  item.opcoes!.forEach((o, i) => {
    expect(equivalentes(daOpcao(o), alvo), `${item.enunciado} › opção ${o}`).toBe(i === item.resposta)
  })
}
/** O erro da opção que vale o mesmo que `errada` (se houver uma). */
function erroDaOpcao(item: Item, errada: string): string | undefined | null {
  const i = item.opcoes!.findIndex((o) => equivalentes(daOpcao(o), errada))
  return i < 0 ? null : item.erros[String(i)]
}

// ---------------------------------------------------------------- conferências gerais

function errosDiferentes(item: Item) {
  if (item.formato === 'escolha') {
    for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
    expect(new Set(item.opcoes).size, 'opções repetidas').toBe(item.opcoes!.length)
    return
  }
  for (const k of Object.keys(item.erros)) expect(Number(k.replace('−', '-')), `${k} vale a resposta: ${item.enunciado}`).not.toBe(Number(item.resposta))
}
const erroDe = (item: Item, v: number) => Object.entries(item.erros).find(([k]) => Number(k) === v)?.[1]
const foraDoTex = (t: string) => t.replace(/\$[^$]*\$/g, '')

/** "Complete: F = G. Que número vai no quadradinho?": com a resposta no quadradinho, os dois lados valem o mesmo. */
const COMPLETE = /^Complete: \$\{(.+) = (.+)\}\$\. Que número vai no quadradinho\?$/
function confereComplete(item: Item, m: RegExpMatchArray) {
  const [, f, gg] = m
  expect(gg).toContain('\\square')
  expect(equivalentes(f, gg.replace('\\square', `(${item.resposta})`)), item.enunciado).toBe(true)
}

/** Peças dos azulejos → o valor de cada uma com x = t. */
const valorPeca = (p: string, t: number) => {
  const s = p.startsWith('−') || p.startsWith('-') ? -1 : 1
  const k = p.replace(/^[−-]/, '')
  return s * (k === '1' ? 1 : k === 'x' ? t : t * t)
}
type Az = { pecas: string[]; montes?: number[]; virar?: number; agrupado?: boolean }
const azDe = (item: Item) => (item.visual!.estado as { azulejos: Az }).azulejos

describe('AF.U1 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_AF_U01A).toHaveLength(9)
    for (const aula of ['AF.U1.A1', 'AF.U1.A2', 'AF.U1.A3']) {
      expect(GERADORES_AF_U01A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual só no nível 1, o menos verdadeiro fora do TeX, o espaço que não quebra e a tecla do menos', () => {
    for (const ger of GERADORES_AF_U01A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        else expect(item.visual, `${ger.id}: só o nível 1 tem visual`).toBeUndefined()
        expect(foraDoTex(item.enunciado), 'sem hífen no lugar do menos').not.toMatch(/-/)
        for (const d of item.dicas) expect(foraDoTex(d), 'sem hífen no lugar do menos').not.toMatch(/-/)
        expect(item.enunciado, 'unidades com espaço que não quebra').not.toMatch(/(\d|\$) (cm|m)\b/)
        if (item.formato === 'numero') {
          expect(Number.isInteger(Number(item.resposta)), item.enunciado).toBe(true)
          if (Number(item.resposta) < 0) expect(item.sinal).toBe(true)
        }
        // Toda fórmula de opção é um polinômio que o leitor entende.
        if (item.formato === 'escolha' && item.opcoes!.every((o) => o.startsWith('$'))) for (const o of item.opcoes!) valor(daOpcao(o), { x: 2, y: 3 })
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('AF.U1 · aula 1: monômios e polinômios', () => {
  it('polinomios-termos-n1: o polinômio das peças, o coeficiente de x e o 1 escondido de x²', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-termos-n1'))) {
      const pecas = azDe(item).pecas
      const conta = (k: string) => pecas.filter((p) => p === k).length
      if (item.enunciado === 'Junte as peças iguais. Que polinômio elas formam?') {
        tipos.add('polinômio')
        soACertaEquivale(item, `${conta('x²')}x^2 + ${conta('x')}x + ${conta('1')}`)
        expect(erroDaOpcao(item, `${pecas.length}x`)).toBe('junta-termos-nao-semelhantes')
        continue
      }
      if (item.enunciado === 'Junte as peças iguais. Qual é o coeficiente de $x$?') {
        tipos.add('coeficiente')
        expect(item.resposta).toBe(conta('x'))
        expect(erroDe(item, pecas.length)).toBe('junta-termos-nao-semelhantes')
        continue
      }
      const m = item.enunciado.match(/^As peças formam \$\{(.+)\}\$\. Qual é o coeficiente de \$\{x\^2\}\$\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add('x² sozinho')
      expect(item.resposta).toBe(coefs(m![1])[2])
      expect(item.resposta).toBe(conta('x²'))
      // As peças são o polinômio do enunciado.
      for (const t of VALORES) expect(pecas.reduce((s, p) => s + valorPeca(p, t), 0)).toBe(valor(m![1], { x: t }))
      expect(erroDe(item, 2)).toBe('coeficiente-e-o-expoente')
      expect(erroDe(item, 0)).toBe('letra-sozinha-sem-o-um')
    }
    expect(tipos).toEqual(new Set(['polinômio', 'coeficiente', 'x² sozinho']))
  })

  it('polinomios-termos-n2: o grau fora de ordem, o coeficiente com sinal e o nome pelo número de termos', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-termos-n2'))) {
      const grau = item.enunciado.match(/^Qual é o grau de \$\{(.+)\}\$\?$/)
      if (grau) {
        tipos.add('grau')
        const f = grau[1]
        expect(item.resposta).toBe(grauDe(f))
        // O maior grau não está no começo.
        const primeiro = grauDoTermo(termos(f)[0])
        expect(primeiro).not.toBe(item.resposta)
        expect(erroDe(item, primeiro)).toBe('grau-pelo-primeiro-termo')
        continue
      }
      const c = item.enunciado.match(/^Qual é o coeficiente de \$x\$ em \$\{(.+)\}\$\?$/)
      if (c) {
        tipos.add('coeficiente')
        const k = coefs(c[1])[1]
        expect(item.resposta).toBe(k)
        expect(k).toBeLessThan(0)
        expect(item.sinal).toBe(true)
        expect(erroDe(item, -k)).toBe('termo-perde-o-sinal')
        continue
      }
      const n = item.enunciado.match(/^Pelo número de termos, \$\{(.+)\}\$ é um monômio, um binômio ou um trinômio\?$/)
      expect(n, item.enunciado).not.toBeNull()
      tipos.add('nome')
      expect(item.opcoes).toEqual(['Monômio', 'Binômio', 'Trinômio'])
      // Cada termo escrito tem um grau diferente: contar os termos é contar os coeficientes que não são zero.
      expect(item.resposta).toBe(coefs(n![1]).filter((k) => k !== 0).length - 1)
      expect(item.resposta).toBe(termos(n![1]).length - 1)
    }
    expect(tipos).toEqual(new Set(['grau', 'coeficiente', 'nome']))
  })

  it('polinomios-termos-n3: arrumar com os sinais, o coeficiente depois de juntar e o grau da área do terreno', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-termos-n3'))) {
      const a = item.enunciado.match(/^Arrume \$\{(.+)\}\$ do maior grau para o menor\. Como fica\?$/)
      if (a) {
        tipos.add('arrumar')
        soACertaEquivale(item, a[1])
        // A certa está do maior grau para o menor.
        const graus = termos(daOpcao(item.opcoes![item.resposta as number])).map(grauDoTermo)
        expect(graus).toEqual([...graus].sort((p, q) => q - p))
        expect(new Set(graus).size).toBe(graus.length)
        for (const e of Object.values(item.erros)) expect(e).toBe('termo-perde-o-sinal')
        continue
      }
      const j = item.enunciado.match(/^Junte os termos semelhantes de \$\{(.+)\}\$\. Qual é o coeficiente de \$\{x\^2\}\$\?$/)
      if (j) {
        tipos.add('juntar')
        const k = coefs(j[1])[2]
        expect(item.resposta).toBe(k)
        expect(k).not.toBe(0)
        // Quem perde o sinal soma os dois coeficientes de x² sem os sinais.
        const semSinal = termos(j[1]).filter((t) => grauDoTermo(t) === 2).reduce((s, t) => s + (Number(t.replace(/[+-]/, '').replace(/x.*/, '')) || 1), 0)
        expect(erroDe(item, semSinal)).toBe('termo-perde-o-sinal')
        continue
      }
      const t = item.enunciado.match(/^A área de um terreno, em metros quadrados, é \$\{(.+)\}\$\. Qual é o grau desse polinômio\?$/)
      expect(t, item.enunciado).not.toBeNull()
      tipos.add('terreno')
      expect(item.resposta).toBe(grauDe(t![1]))
      expect(grauDoTermo(termos(t![1])[0])).not.toBe(item.resposta)
    }
    expect(tipos).toEqual(new Set(['arrumar', 'juntar', 'terreno']))
  })
})

// ---------------------------------------------------------------- aula 2

/** "(P) - (Q)" ou "(P) + (Q)": os dois polinômios e o sinal do meio. */
function doisPolinomios(conta: string) {
  const m = conta.match(/^\((.+)\) ([+-]) \((.+)\)$/)
  expect(m, conta).not.toBeNull()
  return { p: m![1], menos: m![2] === '-', q: m![3] }
}
/** P − Q como quem troca só o sinal do primeiro termo de Q: P + Q − 2·(primeiro termo). */
const viraSoOPrimeiro = (p: string, q: string) => `${p} + ${q} - 2(${termos(q)[0]})`

describe('AF.U1 · aula 2: somar e subtrair polinômios', () => {
  it('polinomios-somar-n1: um coeficiente da soma ou da diferença, com os montes de azulejos', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-somar-n1'))) {
      const m = item.enunciado.match(/^(Junte os dois montes|Tire o segundo monte do primeiro): \$\{(.+)\}\$\. Qual é (o coeficiente de \$x\$|o número sem letra)\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [, , conta, perg] = m!
      const { p, menos, q } = doisPolinomios(conta)
      expect(menos).toBe(m![1].startsWith('Tire'))
      tipos.add(menos ? 'diferença' : 'soma')
      const grau = perg.includes('$x$') ? 1 : 0
      const k = coefs(conta)[grau]
      expect(item.resposta).toBe(k)
      expect(k).not.toBe(0)
      expect(item.sinal).toBe(true)
      // Os montes são os dois polinômios; o menos fica na frente do segundo.
      const az = azDe(item)
      expect(az.montes).toHaveLength(2)
      const [n1] = az.montes!
      for (const t of VALORES) {
        expect(az.pecas.slice(0, n1).reduce((s, x) => s + valorPeca(x, t), 0)).toBe(valor(p, { x: t }))
        expect(az.pecas.slice(n1).reduce((s, x) => s + valorPeca(x, t), 0)).toBe(valor(q, { x: t }))
      }
      expect(az.virar).toBe(menos ? 1 : undefined)
      if (menos) {
        const errado = coefs(viraSoOPrimeiro(p, q))[grau]
        if (errado !== k) expect(erroDe(item, errado)).toBe('menos-so-no-primeiro')
      }
    }
    expect(tipos).toEqual(new Set(['soma', 'diferença']))
  })

  it('polinomios-somar-n2: a diferença inteira, um coeficiente sem peças e a soma', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-somar-n2'))) {
      const e = item.enunciado.match(/^\$\{(.+)\}\$ é igual a quê\?$/)
      if (e) {
        const { p, menos, q } = doisPolinomios(e[1])
        tipos.add(menos ? 'diferença' : 'soma')
        soACertaEquivale(item, e[1])
        if (menos) {
          expect(erroDaOpcao(item, viraSoOPrimeiro(p, q))).toBe('menos-so-no-primeiro')
          expect(erroDaOpcao(item, `${p} + ${q}`)).toBe('ignora-o-menos-do-parentese')
        } else {
          // Quem soma os expoentes escreve x^4 no lugar de x^2.
          const [c0, c1, c2] = coefs(e[1])
          expect(erroDaOpcao(item, `${c2}x^4 + ${c1}x + ${c0}`)).toBe('potencia-soma-expoentes-na-adicao')
        }
        continue
      }
      const c = item.enunciado.match(/^Calcule \$\{(.+)\}\$\. Qual é (o coeficiente de \$x\$|o número sem letra)\?$/)
      expect(c, item.enunciado).not.toBeNull()
      tipos.add('coeficiente')
      const { p, menos, q } = doisPolinomios(c![1])
      expect(menos).toBe(true)
      const grau = c![2].includes('$x$') ? 1 : 0
      expect(item.resposta).toBe(coefs(c![1])[grau])
      expect(item.resposta).not.toBe(0)
      expect(item.sinal).toBe(true)
      expect(erroDe(item, coefs(viraSoOPrimeiro(p, q))[grau])).toBe('menos-so-no-primeiro')
    }
    expect(tipos).toEqual(new Set(['diferença', 'soma', 'coeficiente']))
  })

  it('polinomios-somar-n3: o lucro, o valor com x = 2 e o perímetro do triângulo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-somar-n3'))) {
      const l = item.enunciado.match(/^Uma loja vende \$x\$ cadernos\. A receita é \$\{(.+)\}\$ reais e o custo, \$\{(.+)\}\$ reais\. Qual expressão dá o lucro, a receita menos o custo\?$/)
      if (l) {
        tipos.add('lucro')
        const [, rec, custo] = l
        soACertaEquivale(item, `${rec} - (${custo})`)
        expect(erroDaOpcao(item, viraSoOPrimeiro(rec, custo))).toBe('menos-so-no-primeiro')
        expect(erroDaOpcao(item, `${rec} + ${custo}`)).toBe('ignora-o-menos-do-parentese')
        continue
      }
      const v = item.enunciado.match(/^Quanto vale \$\{(.+)\}\$ com \$\{x = (-?\d+)\}\$\?$/)
      if (v) {
        tipos.add('valor')
        const x = Number(v[2])
        expect(item.resposta).toBe(valor(v[1], { x }))
        expect(item.sinal).toBe(true)
        const { p, q } = doisPolinomios(v[1])
        const errado = valor(viraSoOPrimeiro(p, q), { x })
        if (errado !== item.resposta) expect(erroDe(item, errado)).toBe('menos-so-no-primeiro')
        continue
      }
      const t = item.enunciado.match(/^Os lados de um triângulo medem \$\{(.+)\}\$, \$\{(.+)\}\$ e \$\{(.+)\}\$ metros\. Qual é o perímetro\?$/)
      expect(t, item.enunciado).not.toBeNull()
      tipos.add('triângulo')
      const lados = t!.slice(1, 4)
      soACertaEquivale(item, lados.map((x) => `(${x})`).join(' + '))
      const [c0, c1] = coefs(lados.map((x) => `(${x})`).join(' + '))
      expect(erroDaOpcao(item, `${c1}x^2 + ${c0}`)).toBe('x-mais-x-da-x2')
    }
    expect(tipos).toEqual(new Set(['lucro', 'valor', 'triângulo']))
  })
})

// ---------------------------------------------------------------- aula 3

describe('AF.U1 · aula 3: multiplicar monômios', () => {
  it('polinomios-produto-monomios-n1: a área de ax por bx, o coeficiente e o expoente de xᵐ · xⁿ', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-produto-monomios-n1'))) {
      const c = item.enunciado.match(COMPLETE)
      if (c) {
        confereComplete(item, c)
        const exp = c[1].match(/^x\^\{(\d+)\} \\cdot x\^\{(\d+)\}$/)
        if (exp) {
          tipos.add('expoente')
          const [m, n] = [Number(exp[1]), Number(exp[2])]
          if (m * n !== m + n) expect(erroDe(item, m * n)).toBe('potencia-multiplica-expoentes')
          expect((item.visual!.estado as { expressao: string[] }).expressao[1].split('x').length - 1).toBe(m + n)
          continue
        }
        tipos.add('coeficiente')
        const [a, b] = c[1].match(/^(\d+)x \\cdot (\d+)x$/)!.slice(1).map(Number)
        expect(erroDe(item, a + b)).toBe('soma-coeficientes-na-multiplicacao')
        continue
      }
      const r = item.enunciado.match(/^Um retângulo tem lados \$\{(\d+)x\}\$ e \$\{(\d+)x\}\$\. Qual é a área\?$/)
      expect(r, item.enunciado).not.toBeNull()
      tipos.add('área')
      const [a, b] = [r![1], r![2]]
      soACertaEquivale(item, `${a}x \\cdot ${b}x`)
      expect(erroDaOpcao(item, `${Number(a) + Number(b)}x^2`)).toBe('soma-coeficientes-na-multiplicacao')
      expect(erroDaOpcao(item, `${Number(a) + Number(b)}x`)).toBe('soma-no-lugar-de-multiplicar')
      const e = item.visual!.estado as { base: string[]; altura: string[] }
      expect([...e.altura, ...e.base]).toEqual([`${a}x`, `${b}x`])
    }
    expect(tipos).toEqual(new Set(['expoente', 'coeficiente', 'área']))
  })

  it('polinomios-produto-monomios-n2: com sinais, com o x sozinho e a soma que não se junta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-produto-monomios-n2'))) {
      const c = item.enunciado.match(COMPLETE)
      if (c) {
        confereComplete(item, c)
        expect(item.sinal).toBe(true)
        if (c[2].includes('x^{\\square}')) {
          tipos.add('x sozinho')
          const m = Number(c[1].match(/x\^\{(\d+)\}/)![1])
          expect(erroDe(item, m)).toBe('letra-sozinha-sem-o-um')
        } else {
          tipos.add('sinais')
          // O sinal trocado é o erro da regra dos sinais.
          const negativos = (c[1].match(/\(-/g) ?? []).length
          expect(erroDe(item, -Number(item.resposta))).toBe(negativos === 2 ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo')
        }
        continue
      }
      const e = item.enunciado.match(/^\$\{(.+)\}\$ é igual a quê\?$/)
      expect(e, item.enunciado).not.toBeNull()
      soACertaEquivale(item, e![1])
      const [m, op, n] = e![1].match(/^x\^\{(\d+)\} (\\cdot|\+) x\^\{(\d+)\}$/)!.slice(1)
      if (op === '+') {
        tipos.add('mais')
        expect(erroDaOpcao(item, `x^{${Number(m) + Number(n)}}`)).toBe('potencia-soma-expoentes-na-adicao')
      } else {
        tipos.add('vezes')
        if (Number(m) * Number(n) !== Number(m) + Number(n)) expect(erroDaOpcao(item, `x^{${Number(m) * Number(n)}}`)).toBe('potencia-multiplica-expoentes')
      }
    }
    expect(tipos).toEqual(new Set(['x sozinho', 'sinais', 'mais', 'vezes']))
  })

  it('polinomios-produto-monomios-n3: o produto com sinais, o volume da caixa e duas letras', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('polinomios-produto-monomios-n3'))) {
      const cx = item.enunciado.match(/^Uma caixa mede \$\{(\d+)x\}\$ cm de largura, \$\{(\d+)x\}\$ cm de comprimento e \$\{(\d+)x\}\$ cm de altura\. Qual expressão dá o volume, em cm³\?$/)
      if (cx) {
        tipos.add('caixa')
        const [a, b, c] = cx.slice(1, 4).map(Number)
        soACertaEquivale(item, `${a}x \\cdot ${b}x \\cdot ${c}x`)
        expect(erroDaOpcao(item, `${a + b + c}x^3`)).toBe('soma-coeficientes-na-multiplicacao')
        continue
      }
      const e = item.enunciado.match(/^\$\{(.+)\}\$ é igual a quê\?$/)
      expect(e, item.enunciado).not.toBeNull()
      soACertaEquivale(item, e![1])
      if (e![1].includes('y')) {
        tipos.add('duas letras')
        // Quem esquece o expoente 1 do x e do y sozinhos.
        const [a, p, b, q] = e![1].match(/^(\d+)x\^\{?(\d+)\}?y \\cdot (\d+)xy\^\{?(\d+)\}?$/)!.slice(1).map(Number)
        expect(erroDaOpcao(item, `${a * b}x^{${p}}y^{${q}}`)).toBe('letra-sozinha-sem-o-um')
        continue
      }
      tipos.add('sinais')
      const [a, m, b, n] = e![1].match(/^\(?(-?\d+)x\^\{?(\d+)\}?\)? \\cdot \(?(-?\d+)x\^\{?(\d+)\}?\)?$/)!.slice(1).map(Number)
      expect(erroDaOpcao(item, `${-a * b}x^{${m + n}}`)).toBe((a < 0) === (b < 0) ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo')
      expect(erroDaOpcao(item, `${a + b}x^{${m + n}}`)).toBe('soma-coeficientes-na-multiplicacao')
    }
    expect(tipos).toEqual(new Set(['caixa', 'duas letras', 'sinais']))
  })
})
