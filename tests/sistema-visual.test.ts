import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { AULAS_AF_U04 } from '@/content/matematica/algebra/u04'
import { initMexa, kindOf, mexaStage, solveMexa } from '@/components/aula/mexa'
import { atende, escalar, linearTex, parJogavel, sistemaValido, somaJogavel, somadas, type SistemaState } from '@/components/aula/visual/sistema-geo'
import type { Mexa } from '@/lib/formation/schema'

const cards = AULAS_AF_U04.flatMap(a => a.cartoes).filter((c): c is Mexa => c.tipo === 'mexa')
const ticket = cards.find(c => kindOf(c) === 'testarSistema')!
const soma = cards.find(c => kindOf(c) === 'somarSistema' && (c.visual.estado.sistema as SistemaState).fatores![0] !== 1)!

describe('Manipulação de sistemas: condições e igualdade', () => {
  it('um par que atende só à quantidade não conclui a tarefa', () => {
    let st = initMexa(ticket)
    const set = (n: typeof st) => { st = n }
    const stage = () => mexaStage(ticket, st, set)
    stage().interact!.livre!.onParSistema!(0) // (6,6), 12 ingressos mas R$ 90
    expect(st.done).toBe(false)
    expect(st.wrong).toBe(0) // tentativa exploratória
    expect(st.note).toContain('duas')
    stage().interact!.livre!.onParSistema!(-1)
    stage().interact!.livre!.onParSistema!(99)
    stage().interact!.livre!.onParSistema!(0.5)
    expect(st.pick).toBe(0)
    stage().interact!.livre!.onParSistema!(1)
    expect(st.done).toBe(true)
    // Pode continuar comparando depois de descobrir, sem perder a conquista.
    stage().interact!.livre!.onParSistema!(2)
    expect(st.done).toBe(true)
    expect(st.pick).toBe(2)
    const solved = solveMexa(ticket, initMexa(ticket))
    const s = mexaStage(ticket, solved, set).visual.estado.sistema as SistemaState
    expect(s.equacoes.every(e => atende(e, s.par!))).toBe(true)
  })
  it('mostra a multiplicação inteira antes da soma e trava só ao concluir', () => {
    let st = initMexa(soma)
    const stage = () => mexaStage(soma, st, n => { st = n })
    expect(st.pick).toBe(0)
    stage().interact!.livre!.onSomarSistema!()
    expect(st.pick).toBe(1); expect(st.done).toBe(false)
    const s = stage().visual.estado.sistema as SistemaState
    expect(escalar(s.equacoes[0], 2)).toEqual([2, 4, 18])
    expect(escalar(s.equacoes[1], -1)).toEqual([-2, -1, -12])
    stage().interact!.livre!.onSomarSistema!()
    expect(st.done).toBe(true)
    expect(somadas(s)).toEqual([0, 3, 6])
    expect(stage().interact!.livre!.onSomarSistema).toBeUndefined()
    expect(solveMexa(soma, initMexa(soma)).pick).toBe(2)
  })
  it('recusa operações que apagam a condição ou não eliminam exatamente uma incógnita', () => {
    const s: SistemaState = { equacoes: [[1, 2, 9], [2, 1, 12]], fatores: [2, -1] }
    expect(somaJogavel(s)).toBe(true)
    for (const fatores of [[0, -1], [1, 1], [NaN, 1], [Infinity, 2]] as [number, number][]) expect(somaJogavel({ ...s, fatores })).toBe(false)
    expect(somaJogavel({ equacoes: [[1, 1, 3], [-1, -1, -3]] })).toBe(false)
    expect(sistemaValido({ equacoes: [[0, 0, 3], [1, 1, 2]] })).toBe(false)
    expect(parJogavel(undefined, [8, 4])).toBe(false)
    expect(parJogavel(ticket.visual.estado.sistema as SistemaState, [6, 6])).toBe(false)
    expect(parJogavel(ticket.visual.estado.sistema as SistemaState, [8, 4])).toBe(true)
  })
  it('a consequência somada não substitui sozinha as duas condições', () => {
    const s: SistemaState = { equacoes: [[1, 1, 12], [1, -1, 4]] }
    expect(atende(somadas(s), [8, 0])).toBe(true)
    expect(s.equacoes.every(e => atende(e, [8, 0]))).toBe(false)
  })
  it('formata sinais e coeficientes sem termos fantasma e compila em TeX', () => {
    expect(linearTex([0, -1, 3])).toBe('-y=3')
    expect(linearTex([-1, 0, 2])).toBe('-x=2')
    expect(linearTex([0, 0, 0])).toBe('0=0')
    expect(linearTex([1, 1, 6])).toBe('x+y=6')
    for (const c of AULAS_AF_U04.flatMap(a => a.cartoes)) {
      if ('visual' in c && c.visual?.estado.sistema) {
        const s = c.visual.estado.sistema as SistemaState
        for (const e of [...s.equacoes, somadas(s)]) expect(() => katex.renderToString(linearTex(e), { throwOnError: true })).not.toThrow()
      }
    }
  })
})
