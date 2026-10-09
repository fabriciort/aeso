import { describe, expect, it } from 'vitest'
import { AULAS, ESBOCOS_CHECKPOINTS, GERADORES, getGerador, ROTEIRO_DIAGNOSTICO_ENTRADA } from '@/content/matematica'
import { getUnit } from '@/lib/math/curriculum'
import { rng } from '@/lib/formation/rng'
import type { Cartao, Rng, Visual } from '@/lib/formation/schema'

const unidades = ['B.U0', 'B.U1']
const piloto = AULAS.filter((aula) => unidades.some((unidade) => aula.id.startsWith(unidade + '.')))

function visuais(cartao: Cartao): Visual[] {
  const principal = 'visual' in cartao && cartao.visual ? [cartao.visual] : []
  const opcoes = cartao.tipo === 'aposta' ? cartao.opcoes : cartao.tipo === 'passo' ? cartao.passos.flatMap((passo) => passo.opcoes) : []
  return [...principal, ...opcoes.flatMap((opcao) => opcao.mostra ? [opcao.mostra] : [])]
}

describe('cobertura e integração do piloto', () => {
  it('entrega todas as aulas das duas unidades, na ordem do currículo', () => {
    const previstas = unidades.flatMap((unidade) => getUnit(unidade)!.lessons.map((aula) => aula.id))
    expect(piloto.map((aula) => aula.id)).toEqual(previstas)
  })

  it('cada aula usa geradores próprios dos três níveis e esboça todos os cartões e visuais', () => {
    for (const aula of piloto) {
      expect(aula.esboco?.trim().length, aula.id).toBeGreaterThan(0)
      const praticas = aula.cartoes.filter((cartao) => cartao.tipo === 'sua-vez').flatMap((cartao) => cartao.geradores)
      const geradores = praticas.map((id) => getGerador(id)!)
      expect([...new Set(geradores.map((gerador) => gerador.nivel))].sort(), aula.id).toEqual([1, 2, 3])
      for (const gerador of geradores) expect(gerador.aula, gerador.id).toBe(aula.id)
      for (const [indice, cartao] of aula.cartoes.entries()) {
        const onde = aula.id + ': cartão ' + (indice + 1)
        expect(cartao.esboco?.trim().length, onde).toBeGreaterThan(0)
        for (const visual of visuais(cartao)) expect(visual.esboco?.trim().length, onde).toBeGreaterThan(0)
      }
    }
  })

  it('diagnóstico e checkpoints cobrem seus alvos com referências válidas', () => {
    expect(ROTEIRO_DIAGNOSTICO_ENTRADA.map((slot) => slot.alvo)).toEqual(getUnit('B.U1')!.lessons.map((aula) => aula.id))
    expect(ESBOCOS_CHECKPOINTS.map((checkpoint) => checkpoint.unidade)).toEqual(unidades)
    for (const checkpoint of ESBOCOS_CHECKPOINTS) {
      expect(checkpoint.blocos.map((bloco) => bloco.aula)).toEqual(getUnit(checkpoint.unidade)!.lessons.map((aula) => aula.id))
      for (const bloco of checkpoint.blocos) {
        expect(bloco.geradores.length).toBeGreaterThan(0)
        for (const id of bloco.geradores) expect(getGerador(id)?.aula, id).toBe(bloco.aula)
      }
    }
  })
})

describe('respostas e suporte dos geradores do piloto', () => {
  it('não entrega visual no nível 3 e mantém escolhas únicas e índices válidos', () => {
    for (const gerador of GERADORES) {
      for (let seed = 1; seed <= 300; seed++) {
        const item = gerador.gerar(rng(seed))
        if (gerador.nivel === 3) expect(item.visual, gerador.id).toBeUndefined()
        if (item.visual) expect(item.visual.esboco?.trim().length, gerador.id).toBeGreaterThan(0)
        if (item.formato === 'escolha') {
          const opcoes = item.opcoes!
          expect(new Set(opcoes).size, gerador.id).toBe(opcoes.length)
          expect(Number.isInteger(item.resposta), gerador.id).toBe(true)
          expect(Number(item.resposta), gerador.id).toBeGreaterThanOrEqual(0)
          expect(Number(item.resposta), gerador.id).toBeLessThan(opcoes.length)
          for (const indice of Object.keys(item.erros)) {
            expect(Number.isInteger(Number(indice)), gerador.id).toBe(true)
            expect(Number(indice), gerador.id).toBeGreaterThanOrEqual(0)
            expect(Number(indice), gerador.id).toBeLessThan(opcoes.length)
          }
          for (const opcao of opcoes) expect(opcao.length, gerador.id).toBeLessThanOrEqual(140)
        } else {
          expect(Number.isSafeInteger(item.resposta), gerador.id).toBe(true)
          expect(Number(item.resposta), gerador.id).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('termina também com rng que sempre seleciona a borda inferior ou superior', () => {
    for (const superior of [false, true]) {
      const borda: Rng = {
        int: (min, max) => superior ? max : min,
        pick: (items) => items[superior ? items.length - 1 : 0],
        next: () => superior ? 0.999 : 0,
      }
      for (const gerador of GERADORES) {
        const item = gerador.gerar(borda)
        expect(item.resposta, gerador.id).toBeDefined()
        expect(Object.keys(item.erros), gerador.id).not.toContain(String(item.resposta))
      }
    }
  })
})
