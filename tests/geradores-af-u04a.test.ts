import { describe, expect, it } from 'vitest'
import { GERADORES_AF_U04A } from '@/content/matematica/geradores/sistemas-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item, Rng } from '@/lib/formation/schema'

// Cada teste lê o enunciado (o TeX e os números do texto) e refaz a conta
// por conta própria, sem usar as funções do gerador. As equações são lidas
// por um leitor pequeno, escrito aqui, que entende termos com x, y e
// números dos dois lados do = ('2x - 3y = -4', 'y = x + 2'). O sistema é
// resolvido pela regra de Cramer com os coeficientes lidos, e o par achado
// é conferido nas duas equações. Nos problemas, os pares inteiros de uma
// faixa são testados um a um.

const g = (id: string) => GERADORES_AF_U04A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** a·x + b·y = c. */
type Eq = [number, number, number]

/** Lê um lado: termos com x, y ou só número. Devolve [coef de x, coef de y, número solto]. */
function lado(s: string): [number, number, number] {
  const t = s.replace(/−/g, '-').replace(/\s+/g, '')
  expect(t, `lado vazio em "${s}"`).not.toBe('')
  const re = /([+-]?)(\d*)([xy]?)/y
  const v: [number, number, number] = [0, 0, 0]
  let i = 0
  while (i < t.length) {
    re.lastIndex = i
    const m = re.exec(t)!
    expect(m[0].length, `"${s}": não entendi em "${t.slice(i)}"`).toBeGreaterThan(0)
    expect(m[2] || m[3], `"${s}": termo vazio`).toBeTruthy()
    const k = (m[1] === '-' ? -1 : 1) * (m[2] ? Number(m[2]) : 1)
    if (m[3] === 'x') v[0] += k
    else if (m[3] === 'y') v[1] += k
    else v[2] += k
    i += m[0].length
  }
  return v
}
/** Lê uma equação do 1º grau com x e y: '2x + 3y = 26', 'y = x - 3'. */
function equacao(tex: string): Eq {
  const partes = tex.split('=')
  expect(partes, `"${tex}": uma igualdade`).toHaveLength(2)
  const [e, d] = partes.map(lado)
  return [e[0] - d[0], e[1] - d[1], d[2] - e[2]]
}
/** Resolve pela regra de Cramer; undefined se as retas não se cruzam num ponto. */
function cramer(e1: Eq, e2: Eq): [number, number] | undefined {
  const det = e1[0] * e2[1] - e1[1] * e2[0]
  if (det === 0) return undefined
  return [(e1[2] * e2[1] - e1[1] * e2[2]) / det || 0, (e1[0] * e2[2] - e1[2] * e2[0]) / det || 0]
}
const serve = (e: Eq, [x, y]: [number, number]) => e[0] * x + e[1] * y === e[2]

const texs = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1].replace(/^\{(.*)\}$/, '$1'))
/** Os pares escritos no texto: '(3, −2)' → [3, −2]. */
const pares = (s: string) => [...s.matchAll(/\(([−-]?\d+), ([−-]?\d+)\)/g)].map((m) => [Number(m[1].replace('−', '-')), Number(m[2].replace('−', '-'))] as [number, number])
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
/** A letra pedida ("quanto vale x?"). */
const pedida = (item: Item) => {
  const m = item.enunciado.match(/quanto vale ([xy])\?$/)
  expect(m, item.enunciado).not.toBeNull()
  return m![1] as 'x' | 'y'
}

describe('Álgebra e Funções, unidade 4 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3, visual só no nível 1', () => {
    expect(GERADORES_AF_U04A).toHaveLength(9)
    for (const aula of ['AF.U4.A1', 'AF.U4.A2', 'AF.U4.A3']) {
      expect(GERADORES_AF_U04A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_AF_U04A) {
      expect(ger.id).toMatch(/^sistemas-(pares|cruzamento|substituicao)-n[123]$/)
      for (const item of itens(ger)) {
        if (ger.nivel === 1) {
          expect(item.visual, ger.id).toBeDefined()
          expect(item.visual!.esboco).toBeTruthy()
        } else expect(item.visual, ger.id).toBeUndefined()
      }
    }
  })
  it('respostas inteiras; nenhum erro vale a certa; o menos é o verdadeiro; tecla do menos; espaço que não quebra', () => {
    for (const ger of GERADORES_AF_U04A) {
      for (const item of itens(ger)) {
        expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
        expect(item.dicas).toHaveLength(3)
        const textos = [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]
        for (const t of textos) {
          // Fora do TeX, o menos é o verdadeiro.
          expect(t.replace(/\$[^$]*\$/g, ''), `${ger.id}: hífen fora do TeX em "${t}"`).not.toMatch(/-/)
          // Nenhum cifrão solto.
          expect((t.replace(/R\$/g, '').match(/\$/g) ?? []).length % 2, `${ger.id}: cifrão solto em "${t}"`).toBe(0)
          // Dentro do TeX, o hífen (o − não é TeX).
          for (const x of texs(t.replace(/R\$/g, ''))) expect(x, `${ger.id}: menos verdadeiro dentro do TeX`).not.toMatch(/−/)
          // O real com espaço: R$ 26.
          expect(t, `${ger.id}: R$ sem espaço`).not.toMatch(/R\$\d/)
          expect(t.length, `${ger.id}: texto longo`).toBeLessThanOrEqual(220)
        }
        if (item.formato === 'escolha') {
          const os = item.opcoes!
          expect(new Set(os).size).toBe(os.length)
          expect(os.length).toBeGreaterThanOrEqual(3)
          expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
        } else {
          expect(item.formato).toBe('numero')
          for (const t of Object.keys(item.erros)) expect(valor(t), `${item.enunciado}: o erro "${t}" vale a certa`).not.toBe(item.resposta)
          if ((item.resposta as number) < 0) expect(item.sinal, item.enunciado).toBe(true)
        }
      }
    }
  })
  it('o leitor de equações e a regra de Cramer conferem com contas feitas à mão', () => {
    expect(equacao('x + y = 10')).toEqual([1, 1, 10])
    expect(equacao('2x - 3y = -4')).toEqual([2, -3, -4])
    expect(equacao('y = x - 3')).toEqual([-1, 1, -3])
    expect(equacao('5x + 6 = 16')).toEqual([5, 0, 10])
    expect(cramer([1, 1, 10], [2, 3, 26])).toEqual([4, 6])
    expect(cramer([1, 1, 3], [2, 2, 6])).toBeUndefined()
    expect(pares('(3, −2) e (0, 10)')).toEqual([[3, -2], [0, 10]])
  })
  it('termina com o rng de borda, que repete sempre o mínimo ou o máximo', () => {
    for (const superior of [false, true]) {
      const borda: Rng = {
        int: (min, max) => (superior ? max : min),
        pick: (items) => items[superior ? items.length - 1 : 0],
        next: () => (superior ? 0.999 : 0),
      }
      for (const ger of GERADORES_AF_U04A) {
        const item = ger.gerar(borda)
        expect(item.resposta, ger.id).toBeDefined()
        expect(Object.keys(item.erros), ger.id).not.toContain(String(item.resposta))
      }
    }
  })
})

describe('aula 1: duas incógnitas', () => {
  it('sistemas-pares-n1: o y de x + y = S, dado o x', () => {
    for (const item of itens(g('sistemas-pares-n1'))) {
      const [eq] = texs(item.enunciado)
      const e = equacao(eq)
      expect(e.slice(0, 2)).toEqual([1, 1])
      const x = Number(item.enunciado.match(/com x = (\d+)/)![1])
      const ys = Array.from({ length: 61 }, (_, i) => i - 30).filter((y) => serve(e, [x, y]))
      expect(ys).toEqual([item.resposta])
      expect(erroPara(item, e[2] + x)).toBe('desfaz-com-a-mesma-operacao')
    }
  })
  it('sistemas-pares-n2: só um par está na reta; o par trocado aponta para troca-x-e-y', () => {
    let negativos = 0
    for (const item of itens(g('sistemas-pares-n2'))) {
      const [eq] = texs(item.enunciado)
      const e = equacao(eq)
      const ps = item.opcoes!.map((o) => {
        const p = pares(o)
        expect(p, o).toHaveLength(1)
        return p[0]
      })
      const certos = ps.flatMap((p, i) => (serve(e, p) ? [i] : []))
      expect(certos, eq).toEqual([item.resposta])
      const [x, y] = ps[item.resposta as number]
      if (x < 0 || y < 0) negativos++
      const trocado = ps.findIndex(([a, b]) => a === y && b === x)
      if (trocado >= 0) expect(item.erros[String(trocado)]).toBe('troca-x-e-y')
    }
    expect(negativos).toBeGreaterThan(50)
  })
  it('sistemas-pares-n3: a outra quantidade de uma compra, testando de 0 a 60', () => {
    for (const item of itens(g('sistemas-pares-n3'))) {
      const m = item.enunciado.match(/custa R\$ (\d+) e .+, R\$ (\d+)\. Uma mesa gastou R\$ (\d+) com (\d+) /)
      expect(m, item.enunciado).not.toBeNull()
      const [p, s, t, n] = m!.slice(1).map(Number)
      const ms = Array.from({ length: 61 }, (_, i) => i).filter((k) => p * n + s * k === t)
      expect(ms).toEqual([item.resposta])
      if (t - p * n !== item.resposta) expect(erroPara(item, t - p * n)).toBe('esquece-de-dividir')
      expect(item.enunciado).toMatch(/(Quantos (sucos|cafés)|Quantas canetas)\?$/)
    }
  })
})

describe('aula 2: duas condições ao mesmo tempo', () => {
  it('sistemas-cruzamento-n1: o par das duas, entre pares de uma só e o trocado', () => {
    for (const item of itens(g('sistemas-cruzamento-n1'))) {
      const [t1, t2] = texs(item.enunciado)
      const e1 = equacao(t1)
      const e2 = equacao(t2)
      const sol = cramer(e1, e2)!
      expect(sol, item.enunciado).toBeDefined()
      expect(serve(e1, sol) && serve(e2, sol)).toBe(true)
      const ps = item.opcoes!.map((o) => pares(o)[0])
      expect(ps[item.resposta as number]).toEqual(sol)
      ps.forEach((p, i) => {
        if (i === item.resposta) return
        const quantas = [serve(e1, p), serve(e2, p)].filter(Boolean).length
        expect(quantas, `${item.enunciado} ${item.opcoes![i]}`).toBe(1)
        const trocado = p[0] === sol[1] && p[1] === sol[0]
        expect(item.erros[String(i)]).toBe(trocado ? 'troca-x-e-y' : 'par-so-de-uma-equacao')
      })
      // As retas do palco são as do enunciado.
      const retas = (item.visual!.estado.retas as { equacao: string }[]).map((r) => equacao(r.equacao))
      expect(retas).toEqual([e1, e2])
    }
  })
  it('sistemas-cruzamento-n2: o par serve às duas, a uma só ou a nenhuma', () => {
    const vistos = [0, 0, 0, 0]
    for (const item of itens(g('sistemas-cruzamento-n2'))) {
      const [t1, t2] = texs(item.enunciado)
      const e1 = equacao(t1)
      const e2 = equacao(t2)
      expect(cramer(e1, e2), item.enunciado).toBeDefined()
      const [p] = pares(item.enunciado.replace(/\$[^$]*\$/g, ''))
      const a = serve(e1, p)
      const b = serve(e2, p)
      const certa = a && b ? 0 : a ? 1 : b ? 2 : 3
      expect(item.resposta, item.enunciado).toBe(certa)
      expect(item.opcoes![certa]).toMatch([/às duas/, /só à primeira/, /só à segunda/, /nenhuma/][certa])
      vistos[certa]++
      if (certa === 1 || certa === 2) expect(item.erros['0']).toBe('par-so-de-uma-equacao')
    }
    for (const n of vistos) expect(n).toBeGreaterThan(40)
  })
  it('sistemas-cruzamento-n3: carros e motos ou frutas, testando os pares', () => {
    for (const item of itens(g('sistemas-cruzamento-n3'))) {
      const e = item.enunciado
      let condicoes: [Eq, Eq]
      let pedeX: boolean
      const carros = e.match(/há (\d+) veículos, entre carros e motos, e (\d+) rodas\. Quant(as motos|os carros)\?$/)
      if (carros) {
        condicoes = [[1, 1, Number(carros[1])], [4, 2, Number(carros[2])]]
        pedeX = carros[3] === 'os carros'
      } else {
        const f = e.match(/^(\d+) frutas, entre maçãs a R\$ (\d+) e peras a R\$ (\d+), custaram R\$ (\d+)\. Quant(as maçãs|as peras)\?$/)
        expect(f, e).not.toBeNull()
        condicoes = [[1, 1, Number(f![1])], [Number(f![2]), Number(f![3]), Number(f![4])]]
        pedeX = f![5] === 'as maçãs'
      }
      const sols: [number, number][] = []
      for (let x = 0; x <= 30; x++) for (let y = 0; y <= 30; y++) if (serve(condicoes[0], [x, y]) && serve(condicoes[1], [x, y])) sols.push([x, y])
      expect(sols, e).toHaveLength(1)
      const [x, y] = sols[0]
      expect(item.resposta).toBe(pedeX ? x : y)
      expect(erroPara(item, pedeX ? y : x)).toBe('responde-outra-pergunta')
    }
  })
})

describe('aula 3: substituição', () => {
  it('sistemas-substituicao-n1: y = x + a e x + y = S', () => {
    for (const item of itens(g('sistemas-substituicao-n1'))) {
      const [t1, t2] = texs(item.enunciado)
      expect(t1).toMatch(/^y = x [+-] \d+$/)
      const e1 = equacao(t1)
      const e2 = equacao(t2)
      const sol = cramer(e1, e2)!
      expect(serve(e1, sol) && serve(e2, sol)).toBe(true)
      const qual = pedida(item)
      expect(item.resposta).toBe(qual === 'x' ? sol[0] : sol[1])
      if (qual === 'y') expect(erroPara(item, sol[0])).toBe('esquece-a-segunda-letra')
      else expect(erroPara(item, 2 * sol[0])).toBe('esquece-de-dividir')
      // O palco mostra o mesmo sistema, já trocado.
      const est = item.visual!.estado.sistema as { equacoes: string[]; trocado: boolean }
      expect(est.equacoes.map(equacao)).toEqual([e1, e2])
      expect(est.trocado).toBe(true)
    }
  })
  it('sistemas-substituicao-n2: com 2y, 3y ou 4y, o x, o y ou a equação da troca', () => {
    const vistos = { escolha: 0, numero: 0 }
    for (const item of itens(g('sistemas-substituicao-n2'))) {
      const [t1, t2] = texs(item.enunciado)
      const m1 = t1.match(/^y = (\d*)x ([+-]) (\d+)$/)
      expect(m1, t1).not.toBeNull()
      const k = m1![1] ? Number(m1![1]) : 1
      const q = (m1![2] === '-' ? -1 : 1) * Number(m1![3])
      const e1 = equacao(t1)
      const e2 = equacao(t2)
      expect(e2[1]).toBeGreaterThanOrEqual(2)
      const sol = cramer(e1, e2)!
      expect(serve(e1, sol) && serve(e2, sol)).toBe(true)
      // Sem os parênteses, o número do y pega só o kx: m·x + n·k·x + q = c.
      const xSem = (e2[2] - q) / (e2[0] + e2[1] * k)
      if (item.formato === 'escolha') {
        vistos.escolha++
        // Cada opção é uma equação só com x; a certa tem o x do sistema e é a troca feita com os parênteses.
        const eqs = item.opcoes!.map((o) => equacao(texs(o)[0]))
        for (const e of eqs) expect(e[1]).toBe(0)
        const certa = eqs[item.resposta as number]
        expect(certa[0]).toBe(e2[0] + e2[1] * k)
        expect(certa[2]).toBe(e2[2] - e2[1] * q)
        expect(certa[0] * sol[0]).toBe(certa[2])
        eqs.forEach((e, i) => {
          if (i === item.resposta) return
          expect(e[0] === certa[0] && e[2] === certa[2], item.opcoes![i]).toBe(false)
          if (e[0] === certa[0] && e[2] === e2[2] - q) expect(item.erros[String(i)]).toBe('substitui-sem-parenteses')
          expect(item.erros[String(i)]).toBeTruthy()
        })
      } else {
        vistos.numero++
        const qual = pedida(item)
        expect(item.resposta).toBe(qual === 'x' ? sol[0] : sol[1])
        if (qual === 'x' && Number.isInteger(xSem) && xSem !== sol[0]) expect(erroPara(item, xSem)).toBe('substitui-sem-parenteses')
        if (qual === 'y' && sol[0] !== sol[1]) expect(erroPara(item, sol[0])).toBe('esquece-a-segunda-letra')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('sistemas-substituicao-n3: isolar o y antes, em x + y = S ou x − y = D', () => {
    for (const item of itens(g('sistemas-substituicao-n3'))) {
      const [t1, t2] = texs(item.enunciado)
      expect(t1).toMatch(/^x [+-] y = -?\d+$/)
      const e1 = equacao(t1)
      const e2 = equacao(t2)
      const sol = cramer(e1, e2)!
      expect(sol, item.enunciado).toBeDefined()
      expect(Number.isInteger(sol[0]) && Number.isInteger(sol[1])).toBe(true)
      expect(serve(e1, sol) && serve(e2, sol)).toBe(true)
      const qual = pedida(item)
      expect(item.resposta).toBe(qual === 'x' ? sol[0] : sol[1])
      // Isolar sem trocar o sinal do x: y = c1 + x (na soma) ou y = c1 − x (na diferença).
      const errado: Eq = e1[1] === 1 ? [-1, 1, e1[2]] : [1, 1, e1[2]]
      const solErr = cramer(errado, e2)
      if (solErr && Number.isInteger(solErr[0]) && Number.isInteger(solErr[1])) {
        const v = qual === 'x' ? solErr[0] : solErr[1]
        if (v !== item.resposta && !(qual === 'y' && v === sol[0])) expect(erroPara(item, v), item.enunciado).toBe('passa-para-o-outro-lado')
      }
    }
  })
})
