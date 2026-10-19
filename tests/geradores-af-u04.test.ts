import { describe, expect, it } from 'vitest'
import { AULAS_AF_U04 } from '@/content/matematica/algebra/u04'
import { GERADORES_AF_U04 } from '@/content/matematica/geradores/sistemas'
import { rng } from '@/lib/formation/rng'
import { getUnit } from '@/lib/math/curriculum'
import type { Item, Rng } from '@/lib/formation/schema'

// Leitor independente: resolve o que está escrito, sem consultar estados
// visuais, coeficientes internos ou a solução usada na construção do item.
function avaliar(src: string, x: number, y: number): number {
  const limpo = src.replace(/\{,\}/g, '.').replace(/−/g, '-').replace(/\s/g, '')
  const ts = limpo.match(/\d+(?:\.\d+)?|[xy()+\-*]/g) ?? []
  expect(ts.join('')).toBe(limpo)
  let j = 0
  function atomo(): number {
    const t = ts[j++]
    if (t === '(') { const n = soma(); expect(ts[j++]).toBe(')'); return n }
    if (t === 'x') return x
    if (t === 'y') return y
    expect(t).toMatch(/^\d+(?:\.\d+)?$/)
    return Number(t)
  }
  function sinal(): number {
    if (ts[j] === '-') { j++; return -sinal() }
    if (ts[j] === '+') { j++; return sinal() }
    return atomo()
  }
  function produto(): number {
    let n = sinal()
    while (j < ts.length && (ts[j] === '*' || /^[xy(\d]/.test(ts[j]))) {
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
const valor = (s: unknown) => Number(String(s).replace('{,}', '.').replace(',', '.').replace('−', '-'))
const textoPar = (s: string) => s.replace(/[$()]/g, '').split(';').map(valor)
const perto = (x: number, y: number) => Math.abs(x - y) < 1e-8
function sistema(t: string) {
  const fs = [...t.matchAll(/\$([^$]+)\$/g)].map(m => m[1]).filter(s => s.includes('='))
    .map(s => { const [a, b] = s.split('='); return (x: number, y: number) => avaliar(a, x, y) - avaliar(b, x, y) })
  expect(fs).toHaveLength(2)
  const [[a, b, c], [d, e, f]] = fs.map(fn => { const k = fn(0, 0); return [fn(1, 0) - k, fn(0, 1) - k, -k] })
  const det = a * e - b * d
  const tipo = !perto(det, 0) ? 'Uma solução' : perto(a * f, c * d) && perto(b * f, c * e) ? 'Infinitas soluções' : 'Nenhuma solução'
  return { fs, tipo, x: (c * e - b * f) / det, y: (a * f - c * d) / det }
}
function conferir(i: Item, valida: (s: string) => boolean) {
  const os = i.opcoes!.map(valida)
  expect(os.filter(Boolean)).toHaveLength(1)
  expect(os[Number(i.resposta)]).toBe(true)
}

describe('Sistemas: enunciados resolvidos de forma independente', () => {
  it('cobre seis aulas com três níveis e apoio visual apenas no começo', () => {
    expect(AULAS_AF_U04.map(a => a.id)).toEqual(getUnit('AF.U4')!.lessons.map(a => a.id))
    expect(GERADORES_AF_U04).toHaveLength(18)
    for (const a of AULAS_AF_U04) {
      const gs = a.cartoes.flatMap(c => c.tipo === 'sua-vez' ? c.geradores : [])
      expect(gs.map(id => GERADORES_AF_U04.find(g => g.id === id)?.nivel)).toEqual([1, 2, 3])
      for (const c of a.cartoes) {
        expect(c.esboco?.length).toBeGreaterThan(0)
        if ('visual' in c && c.visual) expect(c.visual.esboco?.length).toBeGreaterThan(0)
      }
    }
  })
  for (const g of GERADORES_AF_U04) {
    it(`${g.id}: 300 sementes e os extremos do RNG`, () => {
      const extremos: Rng[] = [false, true].map(max => ({ next: () => max ? 1 - Number.EPSILON : 0, int: (a, b) => max ? b : a, pick: xs => xs[max ? xs.length - 1 : 0] }))
      for (const r of [...Array.from({ length: 300 }, (_, j) => rng(j * 731 + 17)), ...extremos]) {
        const i = g.gerar(r)
        if (g.nivel > 1) expect(i.visual).toBeUndefined()
        if (g.aula !== 'AF.U4.A6') {
          const s = sistema(i.enunciado)
          if (g.aula === 'AF.U4.A5' && g.nivel > 1) conferir(i, t => t === s.tipo)
          else if (i.formato === 'escolha') conferir(i, t => { const [x, y] = textoPar(t); return s.fs.every(fn => perto(fn(x, y), 0)) })
          else {
            expect(s.tipo).toBe('Uma solução')
            const alvo = i.enunciado.includes('**y**') ? s.y : s.x
            expect(valor(i.resposta)).toBeCloseTo(alvo, 8)
          }
        } else if (g.nivel === 2) {
          const [c, d] = [...i.enunciado.matchAll(/R\$ (\d+)/g)].map(m => Number(m[1]))
          // Os preços são a única interseção das duas compras do enunciado.
          const x = (3 * d - 2 * c) / 5
          const y = (3 * c - 2 * d) / 5
          expect(2 * x + 3 * y).toBeCloseTo(c)
          expect(3 * x + 2 * y).toBeCloseTo(d)
          expect(valor(i.resposta)).toBe(x)
          expect(x).toBeGreaterThan(0); expect(y).toBeGreaterThan(0)
        } else {
          const total = Number(i.enunciado.match(/^(\d+) bilhetes/)![1])
          const [p, q, custo] = [...i.enunciado.matchAll(/R\$ (\d+)/g)].map(m => Number(m[1]))
          // Enumera contagens permitidas em vez de repetir a eliminação do gerador.
          const xs = Array.from({ length: total + 1 }, (_, x) => x).filter(x => p * x + q * (total - x) === custo)
          if (g.nivel === 1) { expect(xs).toHaveLength(1); expect(valor(i.resposta)).toBe(xs[0]) }
          else conferir(i, t => t === (xs.length ? 'Compra possível' : 'Compra impossível'))
        }
        if (i.formato === 'numero' && valor(i.resposta) < 0) expect(i.sinal).toBe(true)
      }
    })
  }
})
