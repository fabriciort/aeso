import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U04B } from '@/content/matematica/geradores/sistemas-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item, Rng } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o negrito, o TeX e os números) e refaz a conta
// por conta própria, sem usar as funções do gerador. As equações do
// enunciado são lidas por um leitor pequeno, escrito aqui ('2x - 3y = 7'
// vira [2, −3, 7]). O par que resolve o sistema é achado testando todos os
// pares inteiros de −40 a 40 nas duas equações. Quantas soluções há sai da
// regra de Cramer com os coeficientes lidos (o determinante e os dois
// outros). Os problemas são refeitos pelo próprio problema: as contagens que
// dão o total e o dinheiro.

const g = (id: string) => GERADORES_AF_U04B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = ' '

/** O R$ não abre TeX (components/aula/Rich.tsx): tira o cifrão do real antes de ler o TeX. */
const semReal = (s: string) => s.replace(/R\$/g, 'R')
const texs = (s: string) => [...semReal(s).matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
const inteiros = (s: string) => [...semReal(s).replace(/\$[^$]*\$/g, '').matchAll(/\d+/g)].map((m) => Number(m[0]))

type Eq = [number, number, number]

/** Um lado com x e y: '2x - 3y' → [2, −3, 0] (o número solto na terceira casa). */
function lado(t: string): Eq {
  const s = t.replace(/−/g, '-').replace(/\s+/g, '')
  const out: Eq = [0, 0, 0]
  const re = /([+-]?)(\d*)([xy]?)/y
  let i = 0
  while (i < s.length) {
    re.lastIndex = i
    const m = re.exec(s)
    expect(m && m[0].length > 0, `"${t}": não entendi em "${s.slice(i)}"`).toBe(true)
    const [todo, sinal, n, letra] = m!
    const v = (sinal === '-' ? -1 : 1) * (n ? Number(n) : 1)
    if (letra === 'x') out[0] += v
    else if (letra === 'y') out[1] += v
    else out[2] += v
    i += todo.length
  }
  return out
}
/** 'ax + by = c' → [a, b, c]. */
function lerEq(t: string): Eq {
  const [e, d] = t.split('=')
  expect(d, `"${t}": sem o =`).toBeDefined()
  const l = lado(e)
  const r = lado(d)
  return [l[0] - r[0], l[1] - r[1], r[2] - l[2]]
}
/** As duas equações do enunciado. */
function sistema(item: Item): [Eq, Eq] {
  const ts = texs(item.enunciado).filter((t) => t.includes('='))
  expect(ts, item.enunciado).toHaveLength(2)
  return [lerEq(ts[0]), lerEq(ts[1])]
}
const serve = (e: Eq, x: number, y: number) => e[0] * x + e[1] * y === e[2]
/** Os pares inteiros de −40 a 40 que servem às duas. */
function pares(e1: Eq, e2: Eq): [number, number][] {
  const out: [number, number][] = []
  for (let x = -40; x <= 40; x++) for (let y = -40; y <= 40; y++) if (serve(e1, x, y) && serve(e2, x, y)) out.push([x, y])
  return out
}
/** Quantas soluções, pela regra de Cramer: 0 (nenhuma), 1 (uma) ou 2 (infinitas). */
function cramer(e1: Eq, e2: Eq): 0 | 1 | 2 {
  const det = e1[0] * e2[1] - e1[1] * e2[0]
  if (det !== 0) return 1
  const dx = e1[2] * e2[1] - e1[1] * e2[2]
  const dy = e1[0] * e2[2] - e1[2] * e2[0]
  return dx === 0 && dy === 0 ? 2 : 0
}

/** O número como o aluno digita: '−5' → −5. */
const valor = (t: string | number) => {
  if (typeof t === 'number') return t
  expect(t, 'o número se escreve com o menos verdadeiro').not.toMatch(/-/)
  return Number(t.replace('−', '-'))
}
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => valor(t) === v)
  return k === undefined ? undefined : item.erros[k]
}

describe('Álgebra e Funções, unidade 4 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U04B).toHaveLength(9)
    for (const aula of ['AF.U4.A4', 'AF.U4.A5', 'AF.U4.A6']) {
      expect(GERADORES_AF_U04B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U04B) {
      expect(ger.id).toMatch(/^sistemas-(adicao|solucoes|problemas)-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) {
          expect(item.visual, ger.id).toBeDefined()
          expect(item.visual!.esboco).toBeTruthy()
        } else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })

  it('nenhum erro mapeado vale a certa; o menos é o verdadeiro; espaço que não quebra; opções diferentes', () => {
    for (const ger of GERADORES_AF_U04B) {
      for (const item of itens(ger)) {
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        for (const t of textos) expect(semReal(t).replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
        for (const t of textos) expect(t, `${ger.id}: R$ sem espaço que não quebra em "${t}"`).not.toMatch(/R\$ /)
        for (const t of textos) for (const x of texs(t)) expect(x, `${ger.id}: menos verdadeiro dentro do TeX em "${t}"`).not.toMatch(/−/)
        for (const t of textos) expect(t.length, `${ger.id}: texto longo "${t}"`).toBeLessThanOrEqual(220)
        expect(item.dicas).toHaveLength(3)
        if (item.formato === 'escolha') {
          expect(item.opcoes).toEqual(['Nenhuma', 'Uma', 'Infinitas'])
          expect(Object.keys(item.erros).length, item.enunciado).toBe(2)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const certa = valor(item.resposta)
        expect(Number.isInteger(certa)).toBe(true)
        for (const k of Object.keys(item.erros)) expect(valor(k), `${ger.id}: o erro "${k}" vale a certa`).not.toBe(certa)
        // Toda resposta que pode ser negativa leva a tecla do menos.
        if (Object.keys(item.erros).some((k) => valor(k) < 0) || certa < 0) expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
      }
    }
  })

  it('termina com um rng que sempre dá o mínimo ou o máximo', () => {
    for (const superior of [false, true]) {
      const borda: Rng = { int: (min, max) => (superior ? max : min), pick: (xs) => xs[superior ? xs.length - 1 : 0], next: () => (superior ? 0.999 : 0) }
      for (const ger of GERADORES_AF_U04B) {
        const item = ger.gerar(borda)
        expect(item.resposta, ger.id).toBeDefined()
        expect(Object.keys(item.erros), ger.id).not.toContain(String(item.resposta))
      }
    }
  })

  // ---------------------------------------------------------------- a adição

  /** O par do sistema e a resposta pedida no negrito. */
  function resolve(item: Item) {
    const [e1, e2] = sistema(item)
    const ps = pares(e1, e2)
    expect(ps, item.enunciado).toHaveLength(1)
    const [x, y] = ps[0]
    const [pedido] = negritos(item.enunciado)
    const certa = pedido === 'x' ? x : pedido === 'y' ? y : pedido === 'x + y' ? x + y : NaN
    expect(certa, `${item.enunciado}: pergunta "${pedido}"`).not.toBeNaN()
    return { e1, e2, x, y, pedido, certa }
  }

  it('adicao-n1: x + y = s e x − y = d, com as equações no palco', () => {
    for (const item of itens(g('sistemas-adicao-n1'))) {
      const { e1, e2, x, y, pedido, certa } = resolve(item)
      expect(e1.slice(0, 2)).toEqual([1, 1])
      expect(e2.slice(0, 2)).toEqual([1, -1])
      expect(item.resposta).toBe(certa)
      // Somadas: 2x = s + d. Parar no 2x, ou no x quando se pede o y.
      if (pedido === 'x') expect(erroPara(item, 2 * x)).toBe('esquece-de-dividir')
      else {
        expect(erroPara(item, x)).toBe('esquece-a-segunda-letra')
        if (2 * y !== x) expect(erroPara(item, 2 * y)).toBe('esquece-de-dividir')
      }
      const est = item.visual!.estado as { sistema: { equacoes: string[] } }
      expect(est.sistema.equacoes.map(lerEq)).toEqual([e1, e2])
    }
  })

  it('adicao-n2: multiplicar a segunda antes de somar', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('sistemas-adicao-n2'))) {
      const { e1, e2, x, pedido, certa } = resolve(item)
      vistos.add(pedido)
      expect(item.resposta).toBe(certa)
      expect(item.sinal).toBe(true)
      // Nenhuma letra some na soma direta; o y da segunda é ±1.
      expect(e1[0] + e2[0] !== 0 && e1[1] + e2[1] !== 0).toBe(true)
      expect(Math.abs(e2[1])).toBe(1)
      if (pedido === 'x') {
        // A segunda vezes m (o y fica oposto) só do lado esquerdo: (a1 + m·a2)x = c1 + c2.
        const m = -e1[1] / e2[1]
        const errado = (e1[2] + e2[2]) / (e1[0] + m * e2[0])
        if (Number.isInteger(errado) && errado !== x) expect(erroPara(item, errado)).toBe('multiplica-so-um-lado')
      } else if (x !== certa) expect(erroPara(item, x)).toBe('esquece-a-segunda-letra')
    }
    expect([...vistos].sort()).toEqual(['x', 'y'])
  })

  it('adicao-n3: coeficientes maiores, com a pergunta por x, y ou x + y', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('sistemas-adicao-n3'))) {
      const { e1, e2, x, pedido, certa } = resolve(item)
      vistos.add(pedido)
      expect(item.resposta).toBe(certa)
      expect(item.sinal).toBe(true)
      // O y da segunda é múltiplo do da primeira.
      expect(e2[1] % e1[1] === 0).toBe(true)
      if (pedido === 'x') {
        const k = e2[1] / e1[1]
        const errado = (e2[2] + e1[2]) / (e2[0] - k * e1[0])
        if (Number.isInteger(errado) && errado !== x) expect(erroPara(item, errado)).toBe('multiplica-so-um-lado')
      } else if (x !== certa) expect(erroPara(item, x)).toBe('esquece-a-segunda-letra')
    }
    expect([...vistos].sort()).toEqual(['x', 'x + y', 'y'])
  })

  // ---------------------------------------------------------------- nenhuma ou infinitas

  const ERROS_QUANTAS: Record<number, Record<string, string>> = {
    0: { '1': 'sistema-sempre-tem-um-par', '2': 'proporcional-so-a-esquerda' },
    1: { '0': 'acha-paralelas-sem-proporcao', '2': 'acha-paralelas-sem-proporcao' },
    2: { '0': 'zero-igual-zero-sem-solucao', '1': 'sistema-sempre-tem-um-par' },
  }

  for (const id of ['sistemas-solucoes-n1', 'sistemas-solucoes-n2']) {
    it(`${id.replace('sistemas-', '')}: quantas soluções, pela regra de Cramer e pelos pares`, () => {
      const vistos = new Set<number>()
      for (const item of itens(g(id))) {
        const [e1, e2] = sistema(item)
        const t = cramer(e1, e2)
        vistos.add(t)
        expect(item.resposta, item.enunciado).toBe(t)
        // Os pares inteiros confirmam: nenhum, um só ou muitos.
        const ps = pares(e1, e2)
        if (t === 0) expect(ps).toHaveLength(0)
        if (t === 1) expect(ps).toHaveLength(1)
        if (t === 2) expect(ps.length).toBeGreaterThan(1)
        // As duas equações nunca são iguais.
        expect(e1).not.toEqual(e2)
        expect(item.erros).toEqual(ERROS_QUANTAS[t])
        if (item.visual) {
          const retas = (item.visual.estado as { retas: { equacao: string }[] }).retas
          expect(retas.map((r) => lerEq(r.equacao))).toEqual([e1, e2])
        }
      }
      expect([...vistos].sort()).toEqual([0, 1, 2])
    })
  }

  it('solucoes-n3: o k que tira a solução ou dá infinitas', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('sistemas-solucoes-n3'))) {
      const ts = texs(item.enunciado)
      expect(ts).toHaveLength(2)
      const nenhuma = negritos(item.enunciado)[0] === 'não ter solução'
      vistos.add(nenhuma ? 'nenhuma' : 'infinitas')
      if (!nenhuma) expect(negritos(item.enunciado)).toEqual(['infinitas soluções'])
      const e1 = lerEq(ts[0])
      // A segunda com um número no lugar do k.
      const comK = (k: number) => lerEq(ts[1].replace('+ ky', k < 0 ? `- ${-k}y` : `+ ${k}y`).replace('= k', `= ${k}`))
      expect(ts[1]).toMatch(nenhuma ? /\+ ky = -?\d+$/ : /y = k$/)
      const alvo = nenhuma ? 0 : 2
      const ks = Array.from({ length: 81 }, (_, i) => i - 40).filter((k) => cramer(e1, comK(k)) === alvo)
      expect(ks, item.enunciado).toHaveLength(1)
      expect(item.resposta).toBe(ks[0])
      expect(item.sinal).toBe(true)
      if (nenhuma) expect(erroPara(item, e1[1])).toBe('multiplica-so-um-termo')
      else expect(erroPara(item, e1[2])).toBe('multiplica-so-um-lado')
    }
    expect([...vistos].sort()).toEqual(['infinitas', 'nenhuma'])
  })

  // ---------------------------------------------------------------- problemas

  it('problemas-n1: inteiras e meias no teatro', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('sistemas-problemas-n1'))) {
      expect(item.enunciado).toContain(`R$${NB}`)
      const [n, total, inteira, meia] = inteiros(item.enunciado)
      expect(inteira).toBe(2 * meia)
      const is = Array.from({ length: n + 1 }, (_, i) => i).filter((i) => inteira * i + meia * (n - i) === total)
      expect(is, item.enunciado).toHaveLength(1)
      const [pedido] = negritos(item.enunciado)
      vistos.add(pedido)
      const i = is[0]
      const certa = pedido === 'meias' ? n - i : i
      expect(item.resposta).toBe(certa)
      expect(erroPara(item, n - certa)).toBe('responde-outra-pergunta')
      const fichas = (item.visual!.estado as { materiais: string[] }).materiais
      expect(fichas).toEqual([`${n} ingressos`, `R$${NB}${total}`, `inteira: R$${NB}${inteira}`, `meia: R$${NB}${meia}`])
    }
    expect([...vistos].sort()).toEqual(['inteiras', 'meias'])
  })

  it('problemas-n2: as cédulas de dois valores', () => {
    for (const item of itens(g('sistemas-problemas-n2'))) {
      const [n, a, b, total, pedido] = inteiros(item.enunciado)
      expect(a).toBeLessThan(b)
      expect([a, b]).toContain(pedido)
      const us = Array.from({ length: n + 1 }, (_, u) => u).filter((u) => a * u + b * (n - u) === total)
      expect(us, item.enunciado).toHaveLength(1)
      const u = us[0]
      const certa = pedido === a ? u : n - u
      expect(item.resposta).toBe(certa)
      expect(erroPara(item, n - certa)).toBe('responde-outra-pergunta')
    }
  })

  it('problemas-n3: as idades, ou galinhas e porcos', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('sistemas-problemas-n3'))) {
      const [pedido] = negritos(item.enunciado)
      if (item.enunciado.startsWith('Num sítio')) {
        vistos.add('sitio')
        const [cab, patas] = inteiros(item.enunciado)
        const gs = Array.from({ length: cab + 1 }, (_, x) => x).filter((x) => 2 * x + 4 * (cab - x) === patas)
        expect(gs, item.enunciado).toHaveLength(1)
        const certa = pedido === 'galinhas' ? gs[0] : cab - gs[0]
        expect(['galinhas', 'porcos']).toContain(pedido)
        expect(item.resposta).toBe(certa)
        expect(erroPara(item, cab - certa)).toBe('responde-outra-pergunta')
        if (2 * certa !== cab - certa) expect(erroPara(item, 2 * certa)).toBe('esquece-de-dividir')
        continue
      }
      vistos.add('idades')
      const [s, dif] = inteiros(item.enunciado)
      // O mais novo: f + (f + dif) = s.
      const fs = Array.from({ length: s + 1 }, (_, f) => f).filter((f) => f + (f + dif) === s)
      expect(fs, item.enunciado).toHaveLength(1)
      const f = fs[0]
      const pedeMaisNovo = /^(o|a) /.test(pedido)
      const certa = pedeMaisNovo ? f : f + dif
      expect(item.resposta).toBe(certa)
      expect(erroPara(item, s - certa)).toBe('responde-outra-pergunta')
      if (2 * certa !== s - certa) expect(erroPara(item, 2 * certa)).toBe('esquece-de-dividir')
    }
    expect([...vistos].sort()).toEqual(['idades', 'sitio'])
  })
})
