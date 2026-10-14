import { describe, expect, it } from 'vitest'
import { GERADORES_U19B } from '@/content/matematica/geradores/estatistica-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (os números em negrito, as cores, a regra do
// dado) e refaz a conta por conta própria, sem usar as funções do gerador.
// A contagem é conferida listando as combinações uma a uma (laços aninhados,
// não multiplicação); os dois dados, percorrendo as 36 casas da grade; as
// cartas, testando carta por carta; a frequência, pela fração do enunciado.
// Nas escolhas, a fração de cada opção é lida do TeX e comparada com a
// chance calculada; a opção certa traz a fração sem simplificar, com os
// casos possíveis embaixo.

const g = (id: string) => GERADORES_U19B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** '1.200 vezes' → 1200; '70 %' → 70. */
const numero = (s: string) => {
  const m = s.match(/\d[\d.]*/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0].replace(/\./g, ''))
}
const medidas = (item: Item) => negritos(item.enunciado).map(numero)
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-9
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => perto(Number(t), v))
  return k === undefined ? undefined : item.erros[k]
}
/** A fração de uma opção: '$\frac{3}{8}$' → [3, 8]. */
const fracao = (t: string): [number, number] | null => {
  const m = t.match(/\\frac\{(\d+)\}\{(\d+)\}/)
  return m ? [Number(m[1]), Number(m[2])] : null
}
const valorDe = (t: string) => {
  const f = fracao(t)
  return f ? f[0] / f[1] : NaN
}
/** O erro da opção cuja fração vale `v`. */
const erroDaOpcao = (item: Item, v: number) => {
  const i = item.opcoes!.findIndex((o) => perto(valorDe(o), v))
  return i < 0 ? undefined : item.erros[String(i)]
}
const certaDe = (item: Item) => item.opcoes![item.resposta as number]

/** Quantas combinações, listando uma a uma (sem multiplicar). */
function listar(tamanhos: number[]): number {
  let total = 0
  const anda = (etapa: number) => {
    if (etapa === tamanhos.length) {
      total++
      return
    }
    for (let i = 0; i < tamanhos[etapa]; i++) anda(etapa + 1)
  }
  anda(0)
  return total
}

/** As 36 casas de dois dados que servem, e as que sobram sem a ordem (a ≤ b). */
function casas(serve: (a: number, b: number) => boolean) {
  const todas: [number, number][] = []
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (serve(a, b)) todas.push([a, b])
  return { c: todas.length, u: todas.filter(([a, b]) => a <= b).length }
}

/** As cores do saco: '**3** azuis, **4** vermelhas e **1** verde' → { azul: 3, vermelha: 4, verde: 1 }. */
const SINGULAR: Record<string, string> = { azul: 'azul', azuis: 'azul', vermelha: 'vermelha', vermelhas: 'vermelha', verde: 'verde', verdes: 'verde', amarela: 'amarela', amarelas: 'amarela' }
function saco(t: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const m of t.matchAll(/\*\*(\d+)\*\* (?:bolas? )?([a-z]+)/g)) out[SINGULAR[m[2]]] = Number(m[1])
  return out
}
const soma = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

describe('U19 (aulas 4 a 6) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U19B).toHaveLength(9)
    const modelos: Record<string, string> = { 'B.U19.A4': 'contagem', 'B.U19.A5': 'sorteio', 'B.U19.A6': 'grafico' }
    for (const aula of Object.keys(modelos)) {
      expect(GERADORES_U19B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U19B) {
      for (const item of itens(ger)) {
        if (ger.nivel > 1) expect(item.visual, ger.id).toBeUndefined()
        else expect(item.visual?.modelo, ger.id).toBe(modelos[ger.aula])
      }
    }
  })
  it('nenhum erro vale a certa; sem hífen fora do TeX; % e milhar bem escritos', () => {
    for (const ger of GERADORES_U19B) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/-/)
          expect(t, `${ger.id}: % sem o espaço que não quebra em "${t}"`).not.toMatch(/\d %/)
          expect(fora(t), `${ger.id}: milhar sem ponto em "${t}"`).not.toMatch(/\d{4}/)
        }
        expect(item.dicas).toHaveLength(3)
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          // Toda opção errada aponta para um erro.
          expect(Object.keys(item.erros).length, item.enunciado).toBe(item.opcoes!.length - 1)
          continue
        }
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
        expect(item.resposta as number).toBeGreaterThan(0)
        for (const t of Object.keys(item.erros)) expect(perto(Number(t), item.resposta as number), `${item.enunciado}: o erro "${t}" vale a certa`).toBe(false)
      }
    }
  })
  it('as contas de conferência batem com contas feitas à mão', () => {
    expect(listar([3, 2])).toBe(6)
    expect(listar([3, 4, 2])).toBe(24)
    expect(casas((a, b) => a + b === 7)).toEqual({ c: 6, u: 3 })
    expect(casas((a, b) => a === b)).toEqual({ c: 6, u: 6 })
    expect(saco('Um saco tem **3** azuis, **4** vermelhas e **1** verde.')).toEqual({ azul: 3, vermelha: 4, verde: 1 })
    expect(numero('1.200 vezes')).toBe(1200)
  })
})

describe('U19 · aula 4: contagem', () => {
  it('contagem-n1: duas etapas, com a árvore na tela', () => {
    for (const item of itens(g('contagem-n1'))) {
      const [a, b] = medidas(item)
      expect(item.resposta, item.enunciado).toBe(listar([a, b]))
      const e = item.visual!.estado as { arvore: unknown[][]; conta: boolean }
      expect(e.arvore.map((x) => x.length)).toEqual([a, b])
      // A conta não aparece embaixo: ela entregaria a resposta.
      expect(e.conta).toBe(false)
      expect(erroPara(item, a + b)).toBe('soma-no-lugar-de-multiplicar')
      expect(erroPara(item, a)).toBe('esquece-uma-etapa')
    }
  })
  it('contagem-n2: três etapas e dois sorteios juntos', () => {
    const vistos = { tres: 0, moeda: 0, dados: 0, roleta: 0 }
    for (const item of itens(g('contagem-n2'))) {
      const t = item.enunciado
      let tamanhos: number[]
      if (t.includes('moeda e um dado')) {
        vistos.moeda++
        tamanhos = [2, 6]
      } else if (t.includes('dois dados')) {
        vistos.dados++
        tamanhos = [6, 6]
        expect(erroPara(item, 21)).toBe('ignora-a-ordem-dos-dados')
      } else if (t.includes('roleta')) {
        vistos.roleta++
        tamanhos = [6, medidas(item)[0]]
      } else {
        vistos.tres++
        tamanhos = medidas(item)
        expect(tamanhos).toHaveLength(3)
      }
      expect(item.resposta, t).toBe(listar(tamanhos))
      const s = tamanhos.reduce((x, y) => x + y, 0)
      expect(erroPara(item, s)).toBe('soma-no-lugar-de-multiplicar')
      // Esquecer uma etapa: uma das etapas fica de fora (a não ser que coincida com a soma).
      if (tamanhos.length === 3) {
        const [a, b, c] = tamanhos
        for (const p of [listar([a, b]), listar([b, c]), listar([a, c])]) if (p !== s) expect(erroPara(item, p)).toBe('esquece-uma-etapa')
      } else if (tamanhos[1] !== s) expect(erroPara(item, tamanhos[1])).toBe('esquece-uma-etapa')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
  it('contagem-n3: senhas e códigos com letras e algarismos', () => {
    const vistos = { senha: 0, codigo: 0 }
    for (const item of itens(g('contagem-n3'))) {
      const fs = medidas(item)
      let tamanhos: number[]
      if (item.enunciado.startsWith('Uma senha')) {
        vistos.senha++
        tamanhos = Array(fs[0]).fill(10)
      } else {
        vistos.codigo++
        const [letras, alfabeto, k] = fs
        expect(alfabeto).toBe(26)
        tamanhos = [...Array(letras).fill(26), ...Array(k).fill(10)]
        expect(erroPara(item, 26 ** letras)).toBe('esquece-uma-etapa')
      }
      // Até 4 posições: a lista tem no máximo 67.600 combinações.
      expect(item.resposta, item.enunciado).toBe(listar(tamanhos))
      expect(erroPara(item, tamanhos.reduce((x, y) => x + y, 0))).toBe('soma-no-lugar-de-multiplicar')
      if (tamanhos.filter((x) => x === 10).length >= 2) expect(erroPara(item, (item.resposta as number) / 10)).toBe('conta-zeros-errado')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})

/** As faces do dado que servem, lidas da regra do enunciado. */
function facesDaRegra(t: string): number[] {
  const todas = [1, 2, 3, 4, 5, 6]
  if (t.includes('ímpar')) return todas.filter((f) => f % 2 === 1)
  if (t.includes('par')) return todas.filter((f) => f % 2 === 0)
  if (t.includes('múltiplo de 3')) return todas.filter((f) => f % 3 === 0)
  let m = t.match(/maior que (\d)/)
  if (m) return todas.filter((f) => f > Number(m![1]))
  m = t.match(/menor que (\d)/)
  if (m) return todas.filter((f) => f < Number(m![1]))
  m = t.match(/sair o (\d)\?/)
  expect(m, t).not.toBeNull()
  return [Number(m![1])]
}

describe('U19 · aula 5: probabilidade', () => {
  it('probabilidade-n1: o dado e o saco, com os casos acesos na tela', () => {
    const vistos = { dado: 0, saco: 0 }
    for (const item of itens(g('probabilidade-n1'))) {
      const certa = fracao(certaDe(item))!
      let f: number
      let n: number
      if (item.enunciado.includes('dado')) {
        vistos.dado++
        const faces = facesDaRegra(item.enunciado)
        f = faces.length
        n = 6
        const e = item.visual!.estado as { casos: string; favoraveis: { valores: number[] } }
        expect(e.casos).toBe('dado')
        expect(e.favoraveis.valores).toEqual(faces)
      } else {
        vistos.saco++
        const s = saco(item.enunciado)
        const cor = SINGULAR[item.enunciado.match(/ser ([a-z]+)\?$/)![1]]
        f = s[cor]
        n = soma(s)
        const e = item.visual!.estado as { bolas: Record<string, number>; favoraveis: { cor: string } }
        expect(e.bolas).toEqual(s)
        expect(e.favoraveis.cor).toBe(cor)
        const k = Object.keys(s).length
        // Uma cor para cada caso, quando dá outra chance (e outra fração que as de cima).
        if (f * k !== n && ![f / (n - f), n / f].some((v) => perto(v, 1 / k))) expect(erroDaOpcao(item, 1 / k)).toBe('resultados-como-casos-iguais')
      }
      // A certa: os favoráveis em cima, todos os possíveis embaixo, sem simplificar.
      expect(certa, item.enunciado).toEqual([f, n])
      for (const o of item.opcoes!) if (o !== certaDe(item)) expect(perto(valorDe(o), f / n), o).toBe(false)
      expect(erroDaOpcao(item, f / (n - f))).toBe('pintadas-sobre-nao-pintadas')
      expect(erroDaOpcao(item, n / f)).toBe('troca-numerador-denominador')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('probabilidade-n2: a chance em porcentagem, no saco e nas cartas', () => {
    const vistos = { saco: 0, cartas: 0 }
    for (const item of itens(g('probabilidade-n2'))) {
      let f: number
      let n: number
      if (item.enunciado.includes('saco')) {
        vistos.saco++
        const s = saco(item.enunciado)
        f = s[SINGULAR[item.enunciado.match(/bola ([a-z]+), em %/)![1]]]
        n = soma(s)
      } else {
        vistos.cartas++
        const [N, m] = medidas(item)
        n = N
        f = 0
        for (let carta = 1; carta <= N; carta++) if (carta % m === 0) f++
      }
      expect(perto(item.resposta as number, (f / n) * 100), item.enunciado).toBe(true)
      if (f !== item.resposta) expect(erroPara(item, f)).toBe('parte-como-porcentagem')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('probabilidade-n3: dois dados, sem a grade', () => {
    const vistos = { soma: 0, maior: 0, iguais: 0 }
    for (const item of itens(g('probabilidade-n3'))) {
      const t = item.enunciado
      let r: { c: number; u: number }
      /** As frações que vêm antes da de baixo errada (3/33 vale 1/11: fica o erro das 11 somas). */
      const antes: number[] = []
      if (t.includes('mesmo número')) {
        vistos.iguais++
        r = casas((a, b) => a === b)
        // Sem a ordem, os 36 resultados viram 21.
        expect(erroDaOpcao(item, 6 / 21)).toBe('ignora-a-ordem-dos-dados')
      } else {
        const S = medidas(item)[0]
        if (t.includes('maior que')) {
          vistos.maior++
          r = casas((a, b) => a + b > S)
          expect(erroDaOpcao(item, (12 - S) / 11)).toBe('resultados-como-casos-iguais')
          antes.push((12 - S) / 11)
        } else {
          vistos.soma++
          r = casas((a, b) => a + b === S)
          expect(erroDaOpcao(item, 1 / 11)).toBe('resultados-como-casos-iguais')
          antes.push(1 / 11)
        }
        expect(erroDaOpcao(item, r.u / 36)).toBe('ignora-a-ordem-dos-dados')
        antes.push(r.u / 36)
      }
      expect(fracao(certaDe(item)), t).toEqual([r.c, 36])
      for (const o of item.opcoes!) if (o !== certaDe(item)) expect(perto(valorDe(o), r.c / 36), o).toBe(false)
      if (!antes.some((v) => perto(v, r.c / (36 - r.c)))) expect(erroDaOpcao(item, r.c / (36 - r.c))).toBe('pintadas-sobre-nao-pintadas')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(40)
  })
})

describe('U19 · aula 6: frequência e simulação', () => {
  it('frequencia-n1: a frequência em porcentagem, lida no gráfico', () => {
    const vistos = { moeda: 0, dado: 0 }
    for (const item of itens(g('frequencia-n1'))) {
      const fs = medidas(item)
      const e = item.visual!.estado as { dados: [string, number][] }
      const total = e.dados.reduce((a, d) => a + d[1], 0)
      let N: number
      let C: number
      if (item.enunciado.includes('moeda')) {
        vistos.moeda++
        ;[N, C] = fs
        expect(e.dados[0]).toEqual(['cara', C])
        expect(erroPara(item, 50)).toBe('frequencia-igual-a-chance')
      } else {
        vistos.dado++
        let k: number
        ;[N, k, C] = fs
        expect(e.dados.map((d) => d[0])).toEqual(['1', '2', '3', '4', '5', '6'])
        expect(e.dados[k - 1][1]).toBe(C)
      }
      // As barras somam as jogadas do enunciado.
      expect(total).toBe(N)
      expect(perto(item.resposta as number, (C / N) * 100), item.enunciado).toBe(true)
      if (C !== item.resposta) expect(erroPara(item, C)).toBe('parte-como-porcentagem')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('frequencia-n2: quantas vezes se espera um resultado', () => {
    const vistos = { dado: 0, moeda: 0, saco: 0 }
    for (const item of itens(g('frequencia-n2'))) {
      const fs = medidas(item)
      const t = item.enunciado
      let esperado: number
      if (t.includes('dado')) {
        vistos.dado++
        const [N] = fs
        esperado = N / 6
        expect(erroPara(item, N * 6)).toBe('operacao-trocada')
      } else if (t.includes('moeda')) {
        vistos.moeda++
        const [N] = fs
        esperado = N / 2
        expect(erroPara(item, N * 2)).toBe('operacao-trocada')
      } else {
        vistos.saco++
        const [a, b, N] = fs
        esperado = (N * a) / (a + b)
        expect(erroPara(item, N * a)).toBe('esquece-de-dividir')
      }
      expect(Number.isInteger(esperado), t).toBe(true)
      expect(item.resposta, t).toBe(esperado)
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('frequencia-n3: a falácia do jogador e em quem confiar', () => {
    const vistos = { falacia: 0, confianca: 0 }
    for (const item of itens(g('frequencia-n3'))) {
      const t = item.enunciado
      const certa = certaDe(item)
      if (t.includes('confiar')) {
        vistos.confianca++
        const nomes = [...t.matchAll(/(?:moeda, |; )([A-ZÀ-Ú][a-zà-ú]+)/g)].map((m) => m[1])
        const [n1, , n2] = medidas(item)
        expect(nomes).toHaveLength(2)
        expect(certa.startsWith(`Em ${n1 > n2 ? nomes[0] : nomes[1]}:`), t).toBe(true)
        for (const e of Object.values(item.erros)) expect(e).toBe('frequencia-igual-a-chance')
        continue
      }
      vistos.falacia++
      // A chance não muda com o que já saiu: a da moeda, a do dado ou a do saco, que volta igual.
      let chance: number
      if (t.includes('moeda')) chance = 1 / 2
      else if (t.includes('dado')) chance = 1 / 6
      else {
        const [a, b] = medidas(item)
        chance = a / (a + b)
        expect(erroDaOpcao(item, a / b)).toBe('pintadas-sobre-nao-pintadas')
      }
      expect(perto(valorDe(certa), chance), `${t} → ${certa}`).toBe(true)
      expect(certa).not.toMatch(/Mais|Menos/)
      item.opcoes!.forEach((o, i) => {
        if (/Mais|Menos/.test(o)) expect(item.erros[String(i)]).toBe('falacia-do-jogador')
      })
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(40)
  })
})
