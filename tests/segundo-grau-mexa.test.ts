import { describe, expect, it } from 'vitest'
import { AULAS_AF_U03 } from '@/content/matematica/algebra/u03'
import { initMexa, kindOf, mexaStage, solveMexa, type MexaState } from '@/components/aula/mexa'
import { produtoEm, produtoJogavel } from '@/components/aula/visual/produto-zero'
import type { Mexa } from '@/lib/formation/schema'

const cards = AULAS_AF_U03.flatMap((a) => a.cartoes).filter((c): c is Mexa => c.tipo === 'mexa')
const produto = cards.find((c) => kindOf(c) === 'zerar')!
const quadrado = cards.find((c) => kindOf(c) === 'completarQuadrado')!
function jogo(card: Mexa) {
  let state = initMexa(card)
  return { get state() { return state }, stage: () => mexaStage(card, state, (s: MexaState) => { state = s }) }
}

describe('descobertas de Equações do 2º grau', () => {
  it('exige encontrar as duas raízes, mantém a exploração e não conta tentativas como erros', () => {
    const j = jogo(produto)
    const tocar = (x: number) => j.stage().interact!.livre!.onX!(x)
    tocar(0)
    expect(j.state.done).toBe(false)
    expect(j.state.wrong).toBe(0)
    expect(j.state.note).toContain('não zerou')
    tocar(2)
    tocar(2)
    expect(j.state.order).toEqual(['2'])
    expect(j.state.done).toBe(false)
    tocar(-3)
    expect(j.state.done).toBe(true)
    expect(j.state.order).toEqual(['2', '-3'])
    tocar(0)
    expect(j.state.done).toBe(true)
    expect(j.state.order).toEqual(['2', '-3'])
    tocar(999)
    expect(j.state.pick).toBe(0)
  })

  it('trata raiz repetida como um valor e recusa um tabuleiro sem todas as raízes', () => {
    const s = { raizes: [2, 2] as [number, number], valores: [0, 1, 2, 3] }
    expect(produtoJogavel(s)).toBe(true)
    expect(produtoEm(s, 2).produto).toBe(0)
    expect(produtoJogavel({ ...s, valores: [0, 1] })).toBe(false)
    const card: Mexa = { ...produto, visual: { ...produto.visual, estado: { produtoZero: s } } }
    const j = jogo(card)
    j.stage().interact!.livre!.onX!(2)
    expect(j.state.done).toBe(true)
    expect(j.state.order).toEqual(['2'])
  })

  it('primeiro move sem somar; só depois acrescenta a área do canto aos dois lados', () => {
    const j = jogo(quadrado)
    expect(j.stage().visual.estado.completarQuadrado).toMatchObject({ etapa: 0, direita: 16 })
    j.stage().interact!.retangulo!.onCompletar!()
    expect(j.state.done).toBe(false)
    expect(j.stage().visual.estado.completarQuadrado).toMatchObject({ etapa: 1, direita: 16 })
    j.stage().interact!.retangulo!.onCompletar!()
    expect(j.state.done).toBe(true)
    expect(j.stage().visual.estado.completarQuadrado).toMatchObject({ etapa: 2, metade: 3, direita: 16 })
    expect(j.stage().interact!.retangulo!.onCompletar).toBeUndefined()
  })

  it('Me mostre revela as mesmas descobertas e pode ser repetido', () => {
    for (const card of [produto, quadrado]) {
      const solved = solveMexa(card, initMexa(card))
      expect(solved.done).toBe(true)
      expect(solveMexa(card, solved)).toEqual(solved)
      expect(mexaStage(card, solved, () => {}).visual.estado).toBeDefined()
    }
  })
})
