import { describe, expect, it } from 'vitest'
import { GERADORES_U15A } from '@/content/matematica/geradores/equacoes-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (a equação em TeX, os números em negrito ou com
// R$) e refaz a conta por conta própria, sem usar as funções do gerador: um
// pequeno leitor de expressões (com a ordem das operações e a escrita junta,
// 3x = 3 · x) dá o valor de cada lado. Cada lado de uma equação do 1º grau é
// uma reta: o valor em x = 0 e em x = 1 basta para achar quantos x e quanto
// número ele tem, e a solução sai daí. Nas escolhas, a certa é conferida
// trocando o x pelo número ou refazendo a operação nos dois lados.

const g = (id: string) => GERADORES_U15A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = '\u00a0'

// ---------------------------------------------------------------- leitor de expressões

/** O valor de uma expressão em TeX (3x + 4, 5 - 2 \cdot x, -x + 2) com as letras valendo `vars`. */
function valor(src: string, vars: Record<string, number>): number {
  const limpo = src.replace(/\\cdot|\\times/g, '*').replace(/\s+/g, '').replace(/\{/g, '(').replace(/\}/g, ')')
  const toks = limpo.match(/\d+|[a-z]|[+\-*()]/g) ?? []
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
  function unario(): number {
    if (espia() === '-') {
      come()
      return -unario()
    }
    return atomo()
  }
  function produto(): number {
    let v = unario()
    for (;;) {
      const t = espia()
      if (t === '*') {
        come()
        v *= unario()
      } else if (t !== undefined && (/^[a-z(]$/.test(t) || /^\d+$/.test(t))) {
        // A escrita junta: 3x.
        v *= atomo()
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

/** Um lado: quantos x (k) e quanto número (n). */
function ladoDe(src: string): { k: number; n: number } {
  const n = valor(src, { x: 0 })
  return { k: valor(src, { x: 1 }) - n, n }
}
/** A equação "L = R": os dois lados e a solução. */
function resolve(eq: string) {
  const partes = eq.split('=')
  expect(partes, `não é uma equação: ${eq}`).toHaveLength(2)
  const L = ladoDe(partes[0])
  const R = ladoDe(partes[1])
  expect(L.k, `os x se cancelam: ${eq}`).not.toBe(R.k)
  return { L, R, x: (R.n - L.n) / (L.k - R.k), lados: partes }
}
/** Os dois lados valem o mesmo com x = v? */
const bate = (eq: string, v: number) => {
  const [l, r] = eq.split('=')
  return valor(l, { x: v }) === valor(r, { x: v })
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
const opcaoComErro = (item: Item, erro: string) => {
  const e = Object.entries(item.erros).find(([, v]) => v === erro)
  return e ? item.opcoes![Number(e[0])] : undefined
}

/** A balança do visual tem os pratos da equação. */
function balancaBate(item: Item, eq: string) {
  expect(item.visual!.modelo).toBe('balanca')
  const e = item.visual!.estado as { esquerda: { x?: number; n?: number }; direita: { x?: number; n?: number } }
  const { L, R } = resolve(eq)
  expect([e.esquerda.x ?? 0, e.esquerda.n ?? 0], eq).toEqual([L.k, L.n])
  expect([e.direita.x ?? 0, e.direita.n ?? 0], eq).toEqual([R.k, R.n])
  // Os pesos de 1 cabem um a um em cada prato.
  expect(L.n, eq).toBeLessThanOrEqual(20)
  expect(R.n, eq).toBeLessThanOrEqual(20)
  expect(L.n).toBeGreaterThanOrEqual(0)
  expect(R.n).toBeGreaterThanOrEqual(0)
}

const RESOLVA = /^Resolva \$\{(.+)\}\$\. Quanto (pesa uma caixa|vale \$x\$)\?$/
const QUANTO = /^Quanto vale \$x\$ em \$\{(.+)\}\\text\{\?\}\$$/
const RETA = /^A balança está reta: \$\{(.+)\}\$\. Quanto pesa (a|uma) caixa\?$/
const PASSO = /^Qual é um bom primeiro passo para resolver \$\{(.+)\}\\text\{\?\}\$$/

describe('U15 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U15A).toHaveLength(9)
    for (const aula of ['B.U15.A1', 'B.U15.A2', 'B.U15.A3']) {
      expect(GERADORES_U15A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual só no nível 1, o menos verdadeiro fora do TeX e a tecla do menos', () => {
    for (const ger of GERADORES_U15A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        else expect(item.visual, `${ger.id}: os níveis 2 e 3 não têm visual`).toBeUndefined()
        expect(foraDoTex(item.enunciado), 'sem hífen no lugar do menos').not.toMatch(/-/)
        for (const d of item.dicas) expect(foraDoTex(d), `sem hífen no lugar do menos: ${d}`).not.toMatch(/-/)
        for (const o of item.opcoes ?? []) expect(foraDoTex(o), 'sem hífen no lugar do menos').not.toMatch(/-/)
        expect(item.enunciado, 'R$ e unidades com espaço que não quebra').not.toMatch(/R\$ |(\d|\*) (kg|GB)\b/)
        if (item.formato === 'numero') {
          expect(Number.isInteger(Number(item.resposta)), item.enunciado).toBe(true)
          // Nos níveis 2 e 3, o teclado sempre tem o menos: a solução de uma equação pode ser negativa.
          if (ger.nivel > 1) expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
          if (Number(item.resposta) < 0) expect(item.sinal).toBe(true)
        }
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('U15 · aula 1: igualdade é equilíbrio', () => {
  it('equilibrio-n1: o peso da caixa (x + a = b e kx = b) e mexer num prato só', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('equilibrio-n1'))) {
      const m = item.enunciado.match(RETA)
      if (m) {
        const eq = m[1]
        const { L, R, x } = resolve(eq)
        expect(item.resposta).toBe(x)
        expect(x).toBeGreaterThan(0)
        balancaBate(item, eq)
        if (L.k === 1) {
          tipos.add('x + a')
          expect(erroDe(item, L.n + R.n)).toBe('desfaz-com-a-mesma-operacao')
        } else {
          tipos.add('kx')
          expect(L.n).toBe(0)
          expect(erroDe(item, R.n)).toBe('esquece-de-dividir')
          if (R.n - L.k !== x) expect(erroDe(item, R.n - L.k)).toBe('subtrai-o-coeficiente')
        }
        continue
      }
      const s = item.enunciado.match(/^A balança está reta: \$\{(.+)\}\$\. Você (põe|tira) (\d+) pesos? só (no|do) prato da (esquerda|direita)\. O que acontece\?$/)
      expect(s, item.enunciado).not.toBeNull()
      tipos.add('um prato')
      const [, eq, verbo, k, , ladoMexe] = s!
      const { L, R, x } = resolve(eq)
      balancaBate(item, eq)
      // Pesa cada prato com o peso da caixa e muda só um deles.
      let esq = L.k * x + L.n
      let dir = R.k * x + R.n
      const d = verbo === 'põe' ? Number(k) : -Number(k)
      if (ladoMexe === 'esquerda') esq += d
      else dir += d
      // Só dá para tirar pesos que estão lá.
      if (verbo === 'tira') expect(Number(k)).toBeLessThanOrEqual(ladoMexe === 'esquerda' ? L.n : R.n)
      const certa = esq > dir ? 'O prato da esquerda desce' : esq < dir ? 'O prato da direita desce' : 'A balança continua reta'
      expect(item.opcoes![item.resposta as number]).toBe(certa)
      expect(opcaoComErro(item, 'opera-so-de-um-lado')).toBe('A balança continua reta')
    }
    expect(tipos).toEqual(new Set(['x + a', 'kx', 'um prato']))
  })

  it('equilibrio-n2: x + a = b em outras ordens, kx = b e se um valor é solução', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('equilibrio-n2'))) {
      const q = item.enunciado.match(QUANTO)
      if (q) {
        const { L, R, x } = resolve(q[1])
        expect(item.resposta).toBe(x)
        const lx = L.k ? L : R
        const ln = L.k ? R : L
        if (lx.k === 1) {
          tipos.add(q[1].startsWith('x') ? 'x + a' : 'outra ordem')
          expect(erroDe(item, lx.n + ln.n)).toBe('desfaz-com-a-mesma-operacao')
        } else {
          tipos.add('kx')
          expect(erroDe(item, ln.n)).toBe('esquece-de-dividir')
        }
        continue
      }
      const s = item.enunciado.match(/^O valor \$\{x = (\d+)\}\$ é solução de \$\{(.+)\}\\text\{\?\}\$$/)
      expect(s, item.enunciado).not.toBeNull()
      const v = Number(s![1])
      const e = bate(s![2], v)
      tipos.add(e ? 'é' : 'não é')
      expect(item.opcoes).toEqual(['Sim', 'Não'])
      expect(item.resposta).toBe(e ? 0 : 1)
      if (!e) expect(item.erros['0']).toBe('nao-confere-a-solucao')
    }
    expect(tipos).toEqual(new Set(['x + a', 'outra ordem', 'kx', 'é', 'não é']))
  })

  it('equilibrio-n3: sacos de arroz, a caixa e o peso, e qual valor é a solução', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('equilibrio-n3'))) {
      const sacos = item.enunciado.match(new RegExp(`^Numa balança, \\*\\*(\\d+)\\*\\* sacos iguais de arroz equilibram \\*\\*(\\d+)\\*\\*${NB}kg\\. Quanto pesa cada saco, em kg\\?$`))
      if (sacos) {
        tipos.add('sacos')
        // Saco por saco.
        let total = 0
        for (let i = 0; i < Number(sacos[1]); i++) total += Number(item.resposta)
        expect(total).toBe(Number(sacos[2]))
        expect(erroDe(item, Number(sacos[2]))).toBe('esquece-de-dividir')
        continue
      }
      const caixa = item.enunciado.match(new RegExp(`^Uma caixa e um peso de \\*\\*(\\d+)\\*\\*${NB}kg equilibram \\*\\*(\\d+)\\*\\*${NB}kg\\. Quanto pesa a caixa, em kg\\?$`))
      if (caixa) {
        tipos.add('caixa')
        expect(Number(item.resposta) + Number(caixa[1])).toBe(Number(caixa[2]))
        continue
      }
      const s = item.enunciado.match(/^Qual destes valores é a solução de \$\{(.+)\}\\text\{\?\}\$$/)
      expect(s, item.enunciado).not.toBeNull()
      tipos.add('qual')
      const eq = s![1]
      item.opcoes!.forEach((o, i) => {
        const v = o.match(/^\$\{x = (-?\d+)\}\$$/)
        expect(v, o).not.toBeNull()
        expect(bate(eq, Number(v![1])), `${eq} › ${o}`).toBe(i === item.resposta)
      })
      // A errada de quem não divide: o número da direita menos o solto.
      const { L, R } = resolve(eq)
      expect(opcaoComErro(item, 'esquece-de-dividir')).toBe(`\${x = ${R.n - L.n}}$`)
    }
    expect(tipos).toEqual(new Set(['sacos', 'caixa', 'qual']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U15 · aula 2: resolver passo a passo', () => {
  it('resolver-equacao-n1: ax + b = c na balança e x − a = b na reta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('resolver-equacao-n1'))) {
      const m = item.enunciado.match(RESOLVA)
      expect(m, item.enunciado).not.toBeNull()
      const eq = m![1]
      const { L, R, x } = resolve(eq)
      expect(item.resposta).toBe(x)
      expect(Number.isInteger(x) && x > 0).toBe(true)
      if (item.visual!.modelo === 'balanca') {
        tipos.add('balança')
        balancaBate(item, eq)
        expect(L.k).toBeGreaterThan(1)
        expect(erroDe(item, R.n - L.n)).toBe('esquece-de-dividir')
        continue
      }
      tipos.add('reta')
      expect(item.visual!.modelo).toBe('reta')
      expect(L.k).toBe(1)
      expect(L.n).toBeLessThan(0)
      // Na reta: o número da direita aceso, a equação embaixo, e o x cabe no trecho sem aparecer.
      const e = item.visual!.estado as { marcas: number[]; comparacao: string; ate: number }
      expect(e.marcas).toEqual([R.n])
      expect(e.comparacao.replace('−', '-')).toBe(eq)
      expect(e.ate).toBeGreaterThanOrEqual(x)
      expect(JSON.stringify(e)).not.toContain(`${x},`)
      if (R.n + L.n !== x) expect(erroDe(item, R.n + L.n)).toBe('desfaz-com-a-mesma-operacao')
    }
    expect(tipos).toEqual(new Set(['balança', 'reta']))
  })

  it('resolver-equacao-n2: ax − b = c, soluções negativas e o primeiro passo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('resolver-equacao-n2'))) {
      const m = item.enunciado.match(RESOLVA)
      if (m) {
        const { L, R, x } = resolve(m[1])
        expect(item.resposta).toBe(x)
        expect(Number.isInteger(x)).toBe(true)
        if (x < 0) {
          tipos.add('negativa')
          expect(erroDe(item, -x)).toBe('esquece-sinal-do-resultado')
        } else {
          tipos.add('menos')
          expect(L.n).toBeLessThan(0)
          // Quem não divide responde o lado direito mais o b.
          expect(erroDe(item, R.n - L.n)).toBe('esquece-de-dividir')
        }
        continue
      }
      const p = item.enunciado.match(PASSO)
      expect(p, item.enunciado).not.toBeNull()
      tipos.add('passo')
      const eq = p![1]
      const { L, R, x } = resolve(eq)
      item.opcoes!.forEach((o, i) => {
        const s = o.match(/^(Somar|Tirar) (\d+) (dos dois lados|só do lado (esquerdo|direito))$/)
        expect(s, o).not.toBeNull()
        const d = (s![1] === 'Somar' ? 1 : -1) * Number(s![2])
        const esq = s![3] === 'dos dois lados' || s![4] === 'esquerdo'
        const dir = s![3] === 'dos dois lados' || s![4] === 'direito'
        const L2 = { k: L.k, n: L.n + (esq ? d : 0) }
        const R2 = { k: R.k, n: R.n + (dir ? d : 0) }
        const x2 = (R2.n - L2.n) / (L2.k - R2.k)
        // Bom passo: a solução não muda e o número solto do lado do x some.
        const bom = x2 === x && L2.n === 0
        expect(bom, `${eq} › ${o}`).toBe(i === item.resposta)
        if (x2 !== x) expect(item.erros[String(i)], o).toBe('opera-so-de-um-lado')
        else if (!bom) expect(item.erros[String(i)], o).toBe('desfaz-com-a-mesma-operacao')
      })
    }
    expect(tipos).toEqual(new Set(['menos', 'negativa', 'passo']))
  })

  it('resolver-equacao-n3: as cobranças, números maiores e conferir', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('resolver-equacao-n3'))) {
      const c = item.enunciado.match(new RegExp(`^(.+) cobra R\\$${NB}(\\d+) (.+) e R\\$${NB}(\\d+) (.+)\\. A conta deu R\\$${NB}(\\d+)\\. .+\\?$`))
      if (c) {
        tipos.add('cobrança')
        const m = Number(c[2])
        const p = Number(c[4])
        const t = Number(c[6])
        // Unidade por unidade, a partir do valor fixo.
        let conta = m
        for (let i = 0; i < Number(item.resposta); i++) conta += p
        expect(conta, item.enunciado).toBe(t)
        expect(erroDe(item, t - m)).toBe('esquece-de-dividir')
        continue
      }
      const r = item.enunciado.match(RESOLVA)
      if (r) {
        tipos.add(item.resposta as number < 0 ? 'negativa' : 'maior')
        const { x } = resolve(r[1])
        expect(item.resposta).toBe(x)
        expect(Number.isInteger(x)).toBe(true)
        if (x < 0) expect(erroDe(item, -x)).toBe('esquece-sinal-do-resultado')
        continue
      }
      const s = item.enunciado.match(/^Alguém achou \$\{x = (\d+)\}\$ em \$\{(.+)\}\$\. Para conferir, quanto dá o lado esquerdo com \$\{x = (\d+)\}\\text\{\?\}\$$/)
      expect(s, item.enunciado).not.toBeNull()
      const v = Number(s![1])
      expect(Number(s![3])).toBe(v)
      const [esq] = s![2].split('=')
      tipos.add(bate(s![2], v) ? 'confere' : 'não confere')
      expect(item.resposta).toBe(valor(esq, { x: v }))
      const { L } = resolve(s![2])
      expect(erroDe(item, Number(`${L.k}${v}`) + L.n)).toBe('junta-algarismos-com-a-letra')
    }
    expect(tipos).toEqual(new Set(['cobrança', 'maior', 'negativa', 'confere', 'não confere']))
  })
})

// ---------------------------------------------------------------- aula 3

describe('U15 · aula 3: x dos dois lados', () => {
  it('x-dos-dois-lados-n1: ax + b = cx + d na balança, e quantas caixas tirar', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('x-dos-dois-lados-n1'))) {
      const q = item.enunciado.match(/^A balança está reta: \$\{(.+)\}\$\. Quantas caixas dá para tirar de cada prato\?$/)
      if (q) {
        tipos.add('caixas')
        const { L, R } = resolve(q[1])
        balancaBate(item, q[1])
        expect(item.resposta).toBe(Math.min(L.k, R.k))
        continue
      }
      const m = item.enunciado.match(RESOLVA)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add('resolver')
      const eq = m![1]
      balancaBate(item, eq)
      const { L, R, x } = resolve(eq)
      expect(L.k).toBeGreaterThan(0)
      expect(R.k).toBeGreaterThan(0)
      expect(item.resposta).toBe(x)
      expect(Number.isInteger(x) && x > 0).toBe(true)
      expect(bate(eq, x)).toBe(true)
      if (L.k - R.k > 1) expect(erroDe(item, R.n - L.n)).toBe('esquece-de-dividir')
    }
    expect(tipos).toEqual(new Set(['caixas', 'resolver']))
  })

  it('x-dos-dois-lados-n2: caixas à direita, soluções negativas e o primeiro passo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('x-dos-dois-lados-n2'))) {
      const m = item.enunciado.match(RESOLVA)
      if (m) {
        const { L, R, x } = resolve(m[1])
        expect(item.resposta).toBe(x)
        expect(Number.isInteger(x)).toBe(true)
        expect(L.k).toBeGreaterThan(0)
        expect(R.k).toBeGreaterThan(0)
        tipos.add(x < 0 ? 'negativa' : R.k > L.k ? 'à direita' : 'outra')
        if (x < 0) expect(erroDe(item, -x)).toBe('esquece-sinal-do-resultado')
        // Quem muda o x de lado sem trocar o sinal soma os x.
        const passa = (L.n - R.n) / (L.k + R.k)
        if (Number.isInteger(passa) && passa !== x) {
          const pm = erroDe(item, passa) ?? erroDe(item, -passa)
          expect(pm, m[1]).toBe('passa-para-o-outro-lado')
        }
        continue
      }
      const p = item.enunciado.match(PASSO)
      expect(p, item.enunciado).not.toBeNull()
      tipos.add('passo')
      const { L, R } = resolve(p![1])
      const certa = item.opcoes![item.resposta as number]
      const t = certa.match(/^Tirar \$\{(.+)\}\$ dos dois lados$/)
      expect(t, certa).not.toBeNull()
      // Tira-se o número de x do lado que tem menos: sobra x de um lado só.
      const k = ladoDe(t![1]).k
      expect(k).toBe(Math.min(L.k, R.k))
      expect(ladoDe(t![1]).n).toBe(0)
      expect(opcaoComErro(item, 'opera-so-de-um-lado')).toMatch(/só do lado/)
      const junta = opcaoComErro(item, 'junta-termos-nao-semelhantes')!
      const j = junta.match(/^Juntar \$\{(.+)\}\$ em \$\{(.+)\}\$$/)
      expect(j, junta).not.toBeNull()
      // "Juntar" muda o valor do lado: não são a mesma coisa.
      expect(valor(j![1], { x: 5 })).not.toBe(valor(j![2], { x: 5 }))
    }
    expect(tipos).toEqual(new Set(['à direita', 'negativa', 'passo']))
  })

  it('x-dos-dois-lados-n3: dois planos de celular e equações maiores', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('x-dos-dois-lados-n3'))) {
      const pl = item.enunciado.match(new RegExp(`^O plano A custa R\\$${NB}(\\d+) mais R\\$${NB}(\\d+) por GB\\. O plano B, R\\$${NB}(\\d+) mais R\\$${NB}(\\d+) por GB\\. Com quantos GB custam o mesmo\\?$`))
      if (pl) {
        tipos.add('planos')
        const [pA, gA, pB, gB] = pl.slice(1).map(Number)
        const x = Number(item.resposta)
        expect(pA + gA * x, item.enunciado).toBe(pB + gB * x)
        expect(x).toBeGreaterThan(0)
        continue
      }
      const m = item.enunciado.match(RESOLVA)
      expect(m, item.enunciado).not.toBeNull()
      const { L, R, x } = resolve(m![1])
      expect(L.k).toBeGreaterThan(0)
      expect(R.k).toBeGreaterThan(0)
      tipos.add(x < 0 ? 'negativa' : 'positiva')
      expect(item.resposta).toBe(x)
      expect(bate(m![1], x)).toBe(true)
    }
    expect(tipos).toEqual(new Set(['planos', 'negativa', 'positiva']))
  })
})
