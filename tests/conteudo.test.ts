import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { AULAS, ERROS, GERADORES, getGerador } from '@/content/matematica'
import { getLesson } from '@/lib/math/curriculum'
import { rng } from '@/lib/formation/rng'
import type { Cartao, Linha, Opcao, Visual } from '@/lib/formation/schema'

// Valida todo o conteúdo da formação contra o contrato (lib/formation/schema.ts)
// e as diretrizes (docs/CONTEUDO.md). Se um teste falhar, a mensagem diz o
// que corrigir.

const MAX = 140
const erroIds = new Set(ERROS.map((e) => e.id))

/** Every $...$ in a text and every Linha must compile in KaTeX. */
function texOk(tex: string, where: string) {
  expect(() => katex.renderToString(tex, { throwOnError: true, strict: false }), `${where}: TeX inválido "${tex}"`).not.toThrow()
}
/**
 * Linguagem (docs/CONTEUDO.md, "Tom e linguagem"): o aluno não vê rótulos
 * de exemplo nem códigos internos.
 */
const PROIBIDO: [RegExp, string][] = [
  [/imaginad|hipot[ée]tic/i, 'não rotule o exemplo ("exemplo imaginado"): diga a situação direto ("Você comprou 27 arruelas.")'],
  [/\bB\.U\d|\bU\d{1,2}\b/, 'não use códigos internos (U1, B.U1.A2): escreva "unidade 1", "esta aula"'],
]
function linguagem(t: string, where: string) {
  for (const [re, porque] of PROIBIDO) expect(re.test(t), `${where}: ${porque}. "${t}"`).toBe(false)
}

function texto(t: string | undefined, where: string) {
  if (t === undefined) return
  linguagem(t, where)
  const visible = t.replace(/\$[^$]*\$/g, (m) => m.slice(1, -1)).replace(/\*\*/g, '')
  expect(visible.length, `${where}: texto com ${visible.length} caracteres (máximo ${MAX}). Divida em dois cartões. "${t}"`).toBeLessThanOrEqual(MAX)
  for (const m of t.match(/\$[^$]+\$/g) ?? []) texOk(m.slice(1, -1), where)
}
const linha = (l: Linha, where: string) => {
  texOk(l.tex, where)
  linguagem(l.tex, where)
  linguagem(l.fala, where)
  expect(l.fala.trim().length, `${where}: linha sem fala`).toBeGreaterThan(0)
}
function opcoes(os: Opcao[], where: string) {
  expect(os.length, `${where}: precisa de pelo menos 2 opções`).toBeGreaterThanOrEqual(2)
  expect(os.filter((o) => o.certa).length, `${where}: precisa de exatamente 1 opção certa`).toBe(1)
  for (const o of os) {
    texto(o.texto, `${where} › opção`)
    texto(o.explica, `${where} › explica`)
    if (o.erro) expect(erroIds.has(o.erro), `${where}: erro "${o.erro}" não existe em content/matematica/erros.ts`).toBe(true)
    if (o.mostra) visual(o.mostra, `${where} › mostra`)
  }
}
const visual = (v: Visual, where: string) => {
  expect(v.modelo, `${where}: visual sem modelo`).toBeTruthy()
  expect(typeof v.estado, `${where}: estado deve ser um objeto com dados`).toBe('object')
}

function cartao(c: Cartao, where: string) {
  if ('fala' in c && c.fala) linguagem(c.fala, `${where} › fala`)
  switch (c.tipo) {
    case 'gancho':
    case 'ideia':
    case 'fecho':
      texto(c.texto, where)
      if (c.visual) visual(c.visual, where)
      break
    case 'mexa':
      texto(c.texto, where)
      texto(c.acao.instrucao, `${where} › ação`)
      visual(c.visual, where)
      expect(c.acao.mostre.length, `${where}: toda tarefa precisa de "mostre" (saída para quem travar)`).toBeGreaterThan(0)
      break
    case 'aposta':
      texto(c.pergunta, where)
      visual(c.visual, where)
      opcoes(c.opcoes, where)
      break
    case 'anote':
      texto(c.definicao, `${where} › definição`)
      texto(c.alerta, `${where} › alerta`)
      linha(c.exemplo, `${where} › exemplo`)
      break
    case 'passo':
      texto(c.problema, where)
      visual(c.visual, where)
      expect(c.passos.length, `${where}: passo a passo sem passos`).toBeGreaterThan(0)
      c.passos.forEach((p, i) => {
        texto(p.pergunta, `${where} › passo ${i + 1}`)
        opcoes(p.opcoes, `${where} › passo ${i + 1}`)
        linha(p.linha, `${where} › passo ${i + 1}`)
      })
      break
    case 'caderno':
      texto(c.instrucao, where)
      expect(c.resolucao.length, `${where}: caderno sem resolução para comparar`).toBeGreaterThan(0)
      c.resolucao.forEach((l, i) => linha(l, `${where} › resolução ${i + 1}`))
      break
    case 'sua-vez':
      expect(c.geradores.length, `${where}: "sua vez" sem geradores`).toBeGreaterThan(0)
      for (const g of c.geradores) expect(getGerador(g), `${where}: gerador "${g}" não está em content/matematica/index.ts`).toBeDefined()
      break
  }
}

describe('aulas', () => {
  for (const a of AULAS) {
    describe(a.id, () => {
      it('existe no currículo, com o mesmo título', () => {
        const l = getLesson(a.id)
        expect(l, `${a.id} não existe em lib/math/curriculum.ts`).toBeDefined()
        expect(a.titulo, 'o título deve ser igual ao do currículo (ou atualize o currículo)').toBe(l!.lesson.title)
      })
      it('tem a estrutura de uma aula', () => {
        const tipos = a.cartoes.map((c) => c.tipo)
        expect(tipos[0], 'a aula começa com um gancho').toBe('gancho')
        expect(tipos[tipos.length - 1], 'a aula termina com um fecho').toBe('fecho')
        expect(tipos, 'a aula precisa de um cartão "anote"').toContain('anote')
        expect(tipos, 'a aula precisa de "sua vez"').toContain('sua-vez')
        expect(tipos.some((t) => t === 'mexa' || t === 'aposta'), 'a aula precisa de interação antes da ideia (mexa ou aposta)').toBe(true)
        expect(a.vega.length, 'contexto da Vega vazio').toBeGreaterThan(40)
      })
      it('cada cartão segue o contrato', () => {
        a.cartoes.forEach((c, i) => cartao(c, `${a.id} › cartão ${i + 1} (${c.tipo})`))
      })
    })
  }
})

describe('geradores', () => {
  it('ids únicos', () => {
    const ids = GERADORES.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  for (const g of GERADORES) {
    it(`${g.id}: 300 exercícios coerentes`, () => {
      expect(getLesson(g.aula), `${g.id}: aula "${g.aula}" não existe no currículo`).toBeDefined()
      for (let seed = 1; seed <= 300; seed++) {
        const item = g.gerar(rng(seed))
        const where = `${g.id} (semente ${seed})`
        texto(item.enunciado, where)
        expect(item.dicas, `${where}: precisa de 3 dicas`).toHaveLength(3)
        item.dicas.forEach((d) => texto(d, `${where} › dica`))
        expect(Object.keys(item.erros), `${where}: a resposta certa não pode estar entre os erros`).not.toContain(String(item.resposta))
        for (const e of Object.values(item.erros)) expect(erroIds.has(e), `${where}: erro "${e}" não existe`).toBe(true)
        if (item.formato === 'escolha') {
          expect(item.opcoes?.length, `${where}: escolha sem opções`).toBeGreaterThan(1)
          expect(Number(item.resposta)).toBeLessThan(item.opcoes!.length)
          item.opcoes!.forEach((o) => texto(o, `${where} › opção`))
        }
      }
    })
    it(`${g.id}: mesma semente, mesmo exercício`, () => {
      expect(g.gerar(rng(42))).toEqual(g.gerar(rng(42)))
    })
  }
})

describe('erros comuns', () => {
  it('ids únicos e completos', () => {
    expect(new Set(ERROS.map((e) => e.id)).size).toBe(ERROS.length)
    for (const e of ERROS) for (const k of ['nome', 'causa', 'exemplo', 'desmonte'] as const) expect(e[k].length, `${e.id}.${k}`).toBeGreaterThan(5)
  })
})
