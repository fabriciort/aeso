import { describe, expect, test } from 'vitest'
import { AULAS } from '@/content/matematica'
import type { Mexa } from '@/lib/formation/schema'
import { initMexa, kindOf, mexaStage, solveMexa, type MexaState } from '@/components/aula/mexa'

// Cada "Mexa" do conteúdo tem de ser jogável no player: o aluno consegue
// chegar ao estado de sucesso só com toques, e "Me mostre" resolve.

const mexas = AULAS.flatMap((a) => a.cartoes.map((c, i) => ({ aula: a.id, i, c }))).filter((x): x is { aula: string; i: number; c: Mexa } => x.c.tipo === 'mexa')

/** Plays the card the way a student who knows the answer would. */
function play(card: Mexa): MexaState {
  let st = initMexa(card)
  const set = (s: MexaState) => (st = s)
  const stage = () => mexaStage(card, st, set)
  const ok = card.acao.sucesso as Record<string, unknown>
  switch (st.kind) {
    case 'blocos':
      for (let n = 0; n < 50 && !st.done; n++) {
        const b = stage().interact!.blocos!
        const o = (['unidades', 'dezenas', 'centenas'] as const).find((k) => b.canTap!(k) && (st.counts![k] - 10 >= ((ok[k] as number) ?? 0)))
        if (!o) break
        b.onTap(o)
      }
      break
    case 'digitos':
    case 'classes': {
      const solved = solveMexa(card, st).slots!
      solved.forEach((v, slot) => {
        if (v === null) return
        stage().tray!.onPick(st.tray!.indexOf(v))
        const q = stage().interact!.quadro!
        ;(q.onSlot ?? q.onClass)!(slot)
      })
      break
    }
    case 'separar':
      for (const g of solveMexa(card, st).seps!) stage().interact!.quadro!.onGap!(g)
      break
    case 'etiquetas':
      while (!st.done && st.pick !== null && st.pick !== undefined) {
        const label = st.pick
        const target = (ok.posicao as number) ?? label
        stage().interact!.reta!.onPick!(target)
        if (st.pick === label && !st.done) break
      }
      break
    case 'vizinho':
      stage().interact!.reta!.onPick!(ok.vizinho as number)
      break
    case 'deslizar':
      stage().interact!.reta!.onDrag!(ok.numero as number)
      stage().interact!.reta!.onRelease!()
      break
    case 'ordem':
      for (const f of ok.ordem as string[]) stage().interact!.livre!.onFicha!(f)
      break
  }
  return st
}

describe('Mexa do piloto', () => {
  test.each(mexas.map((m) => [`${m.aula} cartão ${m.i + 1}`, m.c] as const))('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('um erro não conta como acerto', () => {
    const card = mexas.find((m) => kindOf(m.c) === 'vizinho')!.c
    let st = initMexa(card)
    const wrong = (card.visual.estado.escolhas as number[]).find((v) => v !== card.acao.sucesso.vizinho)!
    mexaStage(card, st, (s) => (st = s)).interact!.reta!.onPick!(wrong)
    expect(st.done).toBe(false)
    expect(st.wrong).toBe(1)
  })
})
