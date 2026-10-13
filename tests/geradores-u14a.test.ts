import { describe, expect, it } from 'vitest'
import { GERADORES_U14A } from '@/content/matematica/geradores/algebra-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (as expressões em TeX, os números em negrito) e
// refaz a conta por conta própria, sem usar as funções do gerador: um
// pequeno leitor de expressões (com a ordem das operações e a escrita junta,
// 3x = 3 · x) calcula o valor numérico. Nas escolhas, a opção certa tem de
// valer o mesmo que a expressão do enunciado para vários valores da letra,
// e cada errada tem de diferir em algum deles.

const g = (id: string) => GERADORES_U14A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = ' '

// ---------------------------------------------------------------- leitor de expressões

/** O valor de uma expressão em TeX (3x + 4, 5 - 2 \cdot x, x^2, 3x \cdot x) com as letras valendo `vars`. */
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
        // A escrita junta: 3x, 2(x + 1).
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

const VALORES = [1, 2, 3, 5, 7, 10, -4]
/** As duas expressões valem o mesmo para todos os valores da letra. */
const equivalentes = (a: string, b: string, l: string) => VALORES.every((t) => valor(a, { [l]: t }) === valor(b, { [l]: t }))
/** A expressão de uma opção: o primeiro $...$ do texto. */
const daOpcao = (o: string) => {
  const m = o.match(/^\$\{(.+?)\}\$/)
  expect(m, `opção sem fórmula: ${o}`).not.toBeNull()
  return m![1]
}

/** Na escolha, só a certa vale o mesmo que a expressão `alvo`. */
function soACertaEquivale(item: Item, alvo: string, l: string) {
  expect(item.formato).toBe('escolha')
  item.opcoes!.forEach((o, i) => {
    expect(equivalentes(daOpcao(o), alvo, l), `${item.enunciado} › opção ${o}`).toBe(i === item.resposta)
  })
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

/** "Quanto vale F com l = v?": a expressão, a letra e o valor. */
const QUANTO = /^Quanto vale \$\{(.+)\}\$ com \$\{([a-z]) = (-?\d+)\}\\text\{\?\}\$$/
/** "Complete: F = □l. Que número vai no quadradinho?" */
const COMPLETE = /^Complete: \$\{(.+) = \\square ([a-z])\}\$\. Que número vai no quadradinho\?$/
/** "F é igual a quê?" */
const IGUAL = /^\$\{(.+)\}\$ é igual a quê\?$/

/** O número do quadradinho: F tem de valer k vezes a letra, para todo valor dela. */
function confereComplete(item: Item, m: RegExpMatchArray) {
  const [, f, l] = m
  for (const t of VALORES) expect(valor(f, { [l]: t }), item.enunciado).toBe(Number(item.resposta) * t)
}

describe('U14 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U14A).toHaveLength(9)
    for (const aula of ['B.U14.A1', 'B.U14.A2', 'B.U14.A3']) {
      expect(GERADORES_U14A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual nos níveis 1 e só neles, o menos verdadeiro fora do TeX e a tecla do menos', () => {
    for (const ger of GERADORES_U14A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        expect(foraDoTex(item.enunciado), 'sem hífen no lugar do menos').not.toMatch(/-/)
        for (const d of item.dicas) expect(foraDoTex(d), 'sem hífen no lugar do menos').not.toMatch(/-/)
        expect(item.enunciado, 'R$ e unidades com espaço que não quebra').not.toMatch(/R\$ |(\d|\$) (km|m)\b/)
        if (item.formato === 'numero') {
          expect(Number.isInteger(Number(item.resposta)), item.enunciado).toBe(true)
          // Da aula 2 em diante, nos níveis 2 e 3, o teclado sempre tem o menos.
          if (ger.aula !== 'B.U14.A1' && ger.nivel > 1) expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
          if (Number(item.resposta) < 0) expect(item.sinal).toBe(true)
        }
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('U14 · aula 1: uma letra no lugar de um número', () => {
  it('letra-numero-n1: quantas barras, kx com as barras na tela e o que quer dizer 4m', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('letra-numero-n1'))) {
      const az = (item.visual!.estado as { azulejos: { pecas: string[]; letra?: string } }).azulejos
      const c = item.enunciado.match(COMPLETE)
      if (c) {
        tipos.add('barras')
        confereComplete(item, c)
        // Uma barra por letra somada.
        expect(az.pecas.length).toBe(item.resposta)
        expect(new Set(az.pecas)).toEqual(new Set([c[2]]))
        continue
      }
      const q = item.enunciado.match(QUANTO)
      if (q) {
        tipos.add('valor')
        const [, f, l, v] = q
        expect(item.resposta).toBe(valor(f, { [l]: Number(v) }))
        const k = Number(f.replace(l, ''))
        // As barras na tela: k barras da letra.
        expect(az.pecas).toEqual(Array(k).fill(l))
        if (Number(`${k}${v}`) !== item.resposta) expect(erroDe(item, Number(`${k}${v}`))).toBe('junta-algarismos-com-a-letra')
        continue
      }
      const s = item.enunciado.match(/^(Uma?) (\S+) (pesa|custa|tem) \$\{([a-z])\}\$ (\S+)\. O que quer dizer \$\{(\d+)([a-z])\}\\text\{\?\}\$$/)
      expect(s, item.enunciado).not.toBeNull()
      tipos.add('sentido')
      const [, , coisa, , l, , k, l2] = s!
      expect(l2).toBe(l)
      const certa = item.opcoes![item.resposta as number]
      // A certa fala de k coisas, numa grandeza (peso, preço, volume); a do objeto fala só das coisas.
      expect(certa, item.enunciado).toMatch(new RegExp(`^O (peso|preço|volume) de ${k} `))
      const objeto = Object.entries(item.erros).find(([, e]) => e === 'letra-como-objeto')![0]
      expect(item.opcoes![Number(objeto)]).toMatch(new RegExp(`^${k} \\S+$`))
      const soma = Object.entries(item.erros).find(([, e]) => e === 'soma-no-lugar-de-multiplicar')![0]
      expect(item.opcoes![Number(soma)]).toContain(`de 1 ${coisa} e mais ${k}`)
    }
    expect(tipos).toEqual(new Set(['barras', 'valor', 'sentido']))
  })

  it('letra-numero-n2: kx (também com o ponto e com x de dois algarismos) e a + a + a', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('letra-numero-n2'))) {
      const q = item.enunciado.match(QUANTO)
      if (q) {
        const [, f, l, v] = q
        tipos.add(f.includes('\\cdot') ? 'ponto' : Number(v) > 9 ? 'dois algarismos' : 'junto')
        expect(item.resposta).toBe(valor(f, { [l]: Number(v) }))
        const k = f.match(/^\d+/)![0]
        const colado = Number(`${k}${v}`)
        if (colado !== item.resposta) expect(erroDe(item, colado)).toBe('junta-algarismos-com-a-letra')
        continue
      }
      const s = item.enunciado.match(IGUAL)
      expect(s, item.enunciado).not.toBeNull()
      tipos.add('soma')
      const l = s![1][0]
      soACertaEquivale(item, s![1], l)
      // A potência aparece entre as erradas, com o seu erro.
      const pot = item.opcoes!.findIndex((o) => o.includes('^'))
      expect(item.erros[String(pot)]).toBe('x-mais-x-da-x2')
    }
    expect(tipos).toEqual(new Set(['ponto', 'junto', 'dois algarismos', 'soma']))
  })

  it('letra-numero-n3: caixas de ovos, a corrida e a expressão das canetas', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('letra-numero-n3'))) {
      const ovos = item.enunciado.match(/^Uma caixa tem \$x\$ ovos\. Você compra \*\*(\d+)\*\* caixas\. Com \$\{x = (\d+)\}\$, quantos ovos são\?$/)
      if (ovos) {
        tipos.add('ovos')
        // Caixa por caixa.
        let total = 0
        for (let i = 0; i < Number(ovos[1]); i++) total += Number(ovos[2])
        expect(item.resposta).toBe(total)
        continue
      }
      const corrida = item.enunciado.match(new RegExp(`^Um aplicativo cobra \\$\\{(.+)\\}\\$ reais por uma corrida de \\$x\\$${NB}km\\. Quanto custa a corrida de \\*\\*(\\d+)\\*\\*${NB}km\\?$`))
      if (corrida) {
        tipos.add('corrida')
        expect(item.resposta).toBe(valor(corrida[1], { x: Number(corrida[2]) }))
        continue
      }
      const canetas = item.enunciado.match(/^Uma caneta custa \$c\$ reais\. Qual expressão dá o preço de \*\*(\d+)\*\* canetas\?$/)
      expect(canetas, item.enunciado).not.toBeNull()
      tipos.add('canetas')
      const k = Number(canetas![1])
      soACertaEquivale(item, Array(k).fill('c').join(' + '), 'c')
    }
    expect(tipos).toEqual(new Set(['ovos', 'corrida', 'canetas']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U14 · aula 2: expressões e valor numérico', () => {
  it('valor-numerico-n1: ax + b, b + ax e x², com x pequeno', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('valor-numerico-n1'))) {
      const q = item.enunciado.match(QUANTO)
      expect(q, item.enunciado).not.toBeNull()
      const [, f, l, v] = q!
      expect(l).toBe('x')
      expect(Number(v)).toBeGreaterThan(0)
      expect(item.resposta).toBe(valor(f, { x: Number(v) }))
      const ax = f.match(/^(\d+)x \+ (\d+)$/)
      const bax = f.match(/^(\d+) \+ (\d+)x$/)
      if (ax) {
        tipos.add('ax + b')
        // Somar antes de multiplicar: (a + b) · x.
        const errada = (Number(ax[1]) + Number(ax[2])) * Number(v)
        if (errada !== item.resposta && errada !== Number(`${ax[1]}${v}`) + Number(ax[2])) expect(erroDe(item, errada)).toBe('ignora-prioridade')
      } else if (bax) {
        tipos.add('b + ax')
        const errada = (Number(bax[1]) + Number(bax[2])) * Number(v)
        if (errada !== item.resposta) expect(erroDe(item, errada)).toBe('ignora-prioridade')
      } else {
        expect(f).toBe('x^2')
        tipos.add('x²')
      }
      // Na tela, a conta com o número no lugar da letra.
      const linhas = (item.visual!.estado as { expressao: string[] }).expressao
      expect(linhas[linhas.length - 1]).toContain(v)
    }
    expect(tipos).toEqual(new Set(['ax + b', 'b + ax', 'x²']))
  })

  it('valor-numerico-n2: x negativo, com parênteses', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('valor-numerico-n2'))) {
      const q = item.enunciado.match(QUANTO)
      expect(q, item.enunciado).not.toBeNull()
      const [, f, , v] = q!
      const x = Number(v)
      expect(x).toBeLessThan(0)
      expect(item.resposta).toBe(valor(f, { x }))
      const ax = f.match(/^(\d+)x$/)
      const bax = f.match(/^(\d+) - (\d+)x$/)
      if (ax) {
        tipos.add('ax')
        // Sem parênteses: a − |x|.
        const sem = Number(ax[1]) + x
        expect(erroDe(item, sem)).toBe('letra-negativa-sem-parenteses')
      } else if (bax) {
        tipos.add('b − ax')
        const sem = Number(bax[1]) - Number(bax[2]) + x
        if (sem !== item.resposta) expect(erroDe(item, sem)).toBe('letra-negativa-sem-parenteses')
      } else {
        expect(f).toBe('x^2')
        tipos.add('x²')
        expect(item.resposta).toBeGreaterThan(0)
        expect(erroDe(item, -Number(item.resposta))).toBe('potencia-sinal-fora-dos-parenteses')
      }
    }
    expect(tipos).toEqual(new Set(['ax', 'b − ax', 'x²']))
  })

  it('valor-numerico-n3: o táxi, a câmara fria e o perímetro', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('valor-numerico-n3'))) {
      const taxi = item.enunciado.match(new RegExp(`^Um táxi cobra R\\$${NB}(\\d+) para começar e R\\$${NB}(\\d+) por km\\. A corrida de \\$x\\$${NB}km custa \\$\\{(.+)\\}\\$ reais\\. E a de \\*\\*(\\d+)\\*\\*${NB}km\\?$`))
      if (taxi) {
        tipos.add('táxi')
        const [, b, a, f, d] = taxi
        // A expressão diz o que a história diz: começa em b e sobe a por km.
        expect(valor(f, { x: 0 })).toBe(Number(b))
        expect(valor(f, { x: 1 }) - valor(f, { x: 0 })).toBe(Number(a))
        // Km por km.
        let preco = Number(b)
        for (let i = 0; i < Number(d); i++) preco += Number(a)
        expect(item.resposta).toBe(preco)
        continue
      }
      const fria = item.enunciado.match(/^Depois de \$h\$ horas ligada, uma câmara fria marca \$\{(.+)\}\$ graus\. Quanto marca depois de \*\*(\d+)\*\* horas\?$/)
      if (fria) {
        tipos.add('câmara')
        expect(item.resposta).toBe(valor(fria[1], { h: Number(fria[2]) }))
        continue
      }
      const ret = item.enunciado.match(/^Um retângulo tem lados \$a\$ e \$b\$, e o perímetro é \$\{2a \+ 2b\}\$\. Quanto dá com \$\{a = (\d+)\}\$ e \$\{b = (\d+)\}\\text\{\?\}\$$/)
      expect(ret, item.enunciado).not.toBeNull()
      tipos.add('perímetro')
      const [p, q] = [Number(ret![1]), Number(ret![2])]
      // A volta: os quatro lados.
      expect(item.resposta).toBe(p + q + p + q)
      if (p * q !== item.resposta) expect(erroDe(item, p * q)).toBe('confunde-area-perimetro')
    }
    expect(tipos).toEqual(new Set(['táxi', 'câmara', 'perímetro']))
  })
})

// ---------------------------------------------------------------- aula 3

describe('U14 · aula 3: termos semelhantes', () => {
  it('termos-semelhantes-n1: ax + bx, x + bx e ax + b com os azulejos', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('termos-semelhantes-n1'))) {
      const pecas = (item.visual!.estado as { azulejos: { pecas: string[] } }).azulejos.pecas
      const c = item.enunciado.match(COMPLETE)
      if (c) {
        tipos.add(/(^|\s)x(\s|$)/.test(c[1]) ? 'x sozinho' : 'ax + bx')
        confereComplete(item, c)
        // Uma barra por x.
        expect(pecas.filter((p) => p === 'x').length).toBe(item.resposta)
        if (/(^|\s)x(\s|$)/.test(c[1])) expect(erroDe(item, Number(item.resposta) - 1)).toBe('letra-sozinha-sem-o-um')
        continue
      }
      const j = item.enunciado.match(/^Juntando as peças iguais, \$\{(.+)\}\$ vira o quê\?$/)
      expect(j, item.enunciado).not.toBeNull()
      tipos.add('não junta')
      soACertaEquivale(item, j![1], 'x')
      const [a, b] = j![1].match(/^(\d+)x \+ (\d+)$/)!.slice(1).map(Number)
      expect(pecas.filter((p) => p === 'x').length).toBe(a)
      expect(pecas.filter((p) => p === '1').length).toBe(b)
      for (const e of Object.values(item.erros)) expect(e).toBe('junta-termos-nao-semelhantes')
    }
    expect(tipos).toEqual(new Set(['ax + bx', 'x sozinho', 'não junta']))
  })

  it('termos-semelhantes-n2: subtração, o x sozinho e x · x contra x + x', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('termos-semelhantes-n2'))) {
      const c = item.enunciado.match(COMPLETE)
      if (c) {
        confereComplete(item, c)
        if (/ - x$/.test(c[1])) {
          tipos.add('menos x')
          expect(erroDe(item, Number(item.resposta) + 1)).toBe('letra-sozinha-sem-o-um')
        } else {
          tipos.add(Number(item.resposta) < 0 ? 'negativo' : 'positivo')
          if (Number(item.resposta) < 0) expect(erroDe(item, -Number(item.resposta))).toBe('esquece-sinal-do-resultado')
        }
        continue
      }
      const s = item.enunciado.match(IGUAL)
      expect(s, item.enunciado).not.toBeNull()
      tipos.add(s![1].includes('\\cdot') ? 'vezes' : 'mais')
      soACertaEquivale(item, s![1], 'x')
    }
    expect(tipos).toEqual(new Set(['menos x', 'negativo', 'positivo', 'vezes', 'mais']))
  })

  it('termos-semelhantes-n3: simplificar, o perímetro do terreno e ax + bx − cx', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('termos-semelhantes-n3'))) {
      const s = item.enunciado.match(/^Simplifique \$\{(.+)\}\$\. Qual expressão sobra\?$/)
      if (s) {
        tipos.add('simplificar')
        soACertaEquivale(item, s[1], 'x')
        // A certa tem dois termos: um com x e um número.
        expect(daOpcao(item.opcoes![item.resposta as number])).toMatch(/^\d+x \+ \d+$/)
        continue
      }
      const t = item.enunciado.match(new RegExp(`^Um terreno retangular tem lados de \\$x\\$${NB}m e \\*\\*(\\d+)\\*\\*${NB}m\\. Qual expressão dá o perímetro, em metros\\?$`))
      if (t) {
        tipos.add('terreno')
        const k = t[1]
        soACertaEquivale(item, `x + ${k} + x + ${k}`, 'x')
        const area = item.opcoes!.findIndex((o) => daOpcao(o) === `${k}x`)
        expect(item.erros[String(area)]).toBe('confunde-area-perimetro')
        continue
      }
      const c = item.enunciado.match(COMPLETE)
      expect(c, item.enunciado).not.toBeNull()
      tipos.add('três termos')
      confereComplete(item, c!)
      expect(item.resposta).not.toBe(0)
    }
    expect(tipos).toEqual(new Set(['simplificar', 'terreno', 'três termos']))
  })
})
