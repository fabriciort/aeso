import { describe, expect, it } from 'vitest'
import { AULAS_AF_U03 } from '@/content/matematica/algebra/u03'
import { GERADORES_AF_U03A } from '@/content/matematica/geradores/segundo-grau-a'
import { GERADORES_AF_U03B } from '@/content/matematica/geradores/segundo-grau-b'
import { getUnit } from '@/lib/math/curriculum'
import { rng } from '@/lib/formation/rng'
import type { Item, Rng } from '@/lib/formation/schema'

const geradores = [...GERADORES_AF_U03A, ...GERADORES_AF_U03B]

// Leitor independente do código de produção: substitui x no enunciado e
// respeita potência, sinais, parênteses e multiplicação implícita.
function avaliar(src: string, x: number): number {
  const limpo = src.replace(/\s/g, '').replace(/−/g, '-').replace(/\\cdot/g, '*')
  const ts = limpo.match(/\d+|[x()+\-*^]/g) ?? []
  expect(ts.join('')).toBe(limpo)
  let j = 0
  function atomo(): number {
    const t = ts[j++]
    if (t === '(') { const n = soma(); expect(ts[j++]).toBe(')'); return n }
    if (t === 'x') return x
    expect(t).toMatch(/^\d+$/)
    return Number(t)
  }
  function potencia(): number {
    const n = atomo()
    if (ts[j] !== '^') return n
    j++
    return n ** atomo()
  }
  function sinal(): number {
    if (ts[j] === '-') { j++; return -sinal() }
    if (ts[j] === '+') { j++; return sinal() }
    return potencia()
  }
  function produto(): number {
    let n = sinal()
    while (j < ts.length && (ts[j] === '*' || /^[x(\d]/.test(ts[j]))) {
      if (ts[j] === '*') j++
      n *= sinal()
    }
    return n
  }
  function soma(): number {
    let n = produto()
    while (ts[j] === '+' || ts[j] === '-') { const t = ts[j++]; n += (t === '+' ? 1 : -1) * produto() }
    return n
  }
  const n = soma()
  expect(j).toBe(ts.length)
  return n
}
const texes = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
function equacao(item: Item) {
  const t = texes(item.enunciado).find((s) => s.includes('=')) ?? texes(item.enunciado)[0]
  const [a, b = '0'] = t.split('=')
  return (x: number) => avaliar(a, x) - avaliar(b, x)
}
const valor = (v: unknown) => Number(String(v).replace('−', '-').replace(',', '.'))
const raizes = (s: string) => [...s.matchAll(/x = (-?\d+(?:\{,\}\d+)?)/g)].map((m) => Number(m[1].replace('{,}', '.')))
const candidatas = Array.from({ length: 181 }, (_, j) => -45 + j / 2)
const roots = (f: (x: number) => number) => candidatas.filter((x) => Math.abs(f(x)) < 1e-9)
const ordenar = (xs: number[]) => [...xs].sort((a, b) => a - b)

function conferirEscolhas(item: Item, certas: number[]) {
  expect(item.opcoes!.length).toBeGreaterThan(1)
  expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
  const valida = item.opcoes!.map((s) => {
    if (s === 'Nenhuma raiz real') return certas.length === 0
    return JSON.stringify(ordenar(raizes(s))) === JSON.stringify(ordenar(certas))
  })
  expect(valida.filter(Boolean)).toHaveLength(1)
  expect(valida[Number(item.resposta)]).toBe(true)
}

describe('Equações do 2º grau: cobertura e resolução independente', () => {
  it('entrega o currículo inteiro e três níveis por aula, com cartões e visuais esboçados', () => {
    expect(AULAS_AF_U03.map((a) => a.id)).toEqual(getUnit('AF.U3')!.lessons.map((a) => a.id))
    for (const aula of AULAS_AF_U03) {
      const ids = aula.cartoes.flatMap((c) => c.tipo === 'sua-vez' ? c.geradores : [])
      expect(ids.map((id) => geradores.find((g) => g.id === id)?.nivel)).toEqual([1, 2, 3])
      for (const c of aula.cartoes) {
        expect(c.esboco?.length).toBeGreaterThan(0)
        if ('visual' in c && c.visual) expect(c.visual.esboco?.length).toBeGreaterThan(0)
      }
    }
  })

  for (const gerador of geradores) {
    it(`${gerador.id}: 300 enunciados resolvidos sem usar a fórmula do gerador`, () => {
      for (let seed = 1; seed <= 300; seed++) {
        const item = gerador.gerar(rng(seed))
        expect(item, `semente ${seed}`).toEqual(gerador.gerar(rng(seed)))
        if (gerador.nivel > 1) expect(item.visual).toBeUndefined()
        if (gerador.aula === 'AF.U3.A7') {
          const numeros = [...item.enunciado.matchAll(/\d+/g)].map((m) => Number(m[0]))
          if (gerador.nivel === 1) {
            const [area, diferenca] = numeros
            const x = valor(item.resposta)
            expect(x).toBeGreaterThan(0)
            expect(x * (x + diferenca)).toBe(area)
          } else if (gerador.nivel === 2) {
            const [a, b, area] = numeros
            const x = valor(item.resposta)
            expect(x).toBeGreaterThan(0)
            expect((a + 2 * x) * (b + 2 * x)).toBe(area)
          } else {
            const [produto] = numeros
            const pares = (s: string) => s.split('; ').map((p) => p.split(' e ').map(valor))
            const validas = item.opcoes!.map((s) => {
              const ps = pares(s)
              return ps.length === 2 && ps.every(([a, b]) => b - a === 1 && a * b === produto)
                && ps[0][0] !== ps[1][0]
            })
            expect(validas.filter(Boolean)).toHaveLength(1)
            expect(validas[Number(item.resposta)]).toBe(true)
          }
        } else {
          const f = equacao(item)
          if (gerador.id === 'segundo-completar-n1') {
            // Reconstrói o coeficiente de x com diferenças de valores.
            const b = (f(1) - f(-1)) / 2
            expect(valor(item.resposta)).toBe((b / 2) ** 2)
            const q = item.visual!.estado.completarQuadrado as { metade: number; direita: number }
            expect(q.metade * 2).toBe(b)
          } else if (gerador.aula === 'AF.U3.A6') {
            // Uma parábola amostrada em −1, 0 e 1 fornece a, b e c.
            const c = f(0)
            const b = (f(1) - f(-1)) / 2
            const a = (f(1) + f(-1)) / 2 - c
            const d = b * b - 4 * a * c
            expect(valor(item.resposta)).toBe(d > 0 ? 2 : d === 0 ? 1 : 0)
          } else if (item.formato === 'escolha') {
            conferirEscolhas(item, roots(f))
          } else {
            const answer = valor(item.resposta)
            expect(f(answer)).toBe(0)
            expect(answer).toBe(Math.min(...roots(f)))
          }
        }
      }
    })
  }

  it('cobre sinais, zero, raiz repetida, coeficiente negativo e raízes não inteiras', () => {
    const delta = new Set<number>()
    const formula = new Set<string>()
    for (let seed = 1; seed <= 300; seed++) {
      const d = geradores.find((g) => g.id === 'segundo-delta-n3')!.gerar(rng(seed))
      delta.add(valor(d.resposta))
      const i = geradores.find((g) => g.id === 'segundo-formula-n3')!.gerar(rng(seed))
      const rs = raizes(i.opcoes![Number(i.resposta)])
      if (i.enunciado.includes('$-2x')) formula.add('a negativo')
      if (rs.some((x) => !Number.isInteger(x))) formula.add('fracionária')
      if (rs.some((x) => x < 0)) formula.add('negativa')
    }
    expect([...delta].sort()).toEqual([0, 1, 2])
    expect([...formula].sort()).toEqual(['a negativo', 'fracionária', 'negativa'])
  })

  it('termina com os dois extremos de RNG e nunca mapeia a resposta certa como erro', () => {
    for (const topo of [false, true]) {
      const r: Rng = { int: (a, b) => topo ? b : a, pick: (xs) => xs[topo ? xs.length - 1 : 0], next: () => topo ? 0.999 : 0 }
      for (const g of geradores) {
        const item = g.gerar(r)
        expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
        if (item.formato === 'escolha') expect(item.opcoes!.length).toBeGreaterThan(1)
      }
    }
  })
})
