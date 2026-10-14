import { describe, expect, it } from 'vitest'
import { GERADORES_U19A } from '@/content/matematica/geradores/estatistica-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (ou o desenho, no nível 1) e refaz a conta por
// conta própria, sem usar as funções do gerador: a média pela soma e pela
// quantidade, a mediana pondo a lista em fila, a moda contando cada valor, a
// amplitude pelo maior e pelo menor, o desvio pelo valor menos a média e o
// desvio padrão pela raiz da média dos quadrados. Os erros previsíveis são
// recalculados do mesmo jeito e conferidos um a um.

const g = (id: string) => GERADORES_U19A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = ' '

// ---------------------------------------------------------------- ajudas

const r6 = (x: number) => Math.round(x * 1e6) / 1e6
/** Um número como está na tela: −3 vale -3; 1.000 vale 1000; 32,5 vale 32.5; +3 vale 3. */
const num = (t: string) => Number(t.trim().replace('−', '-').replace('+', '').replace(/\./g, '').replace(',', '.'))
/** "8, 2, 5, 2 e 3" (com ou sem unidade no fim). */
const nums = (t: string) => t.replace(/ \S+$/, '').split(/, | e /).map(num)
/** A resposta como o aluno digita: inteiro, ou com vírgula. */
const digitada = (x: number) => (Number.isInteger(r6(x)) ? r6(x) : String(r6(x)).replace('.', ','))
const chave = (x: number) => String(r6(x)).replace('.', ',')
const digitavel = (x: number) => Number.isFinite(x) && Math.abs(Math.round(x * 100) - x * 100) < 1e-6

const somar = (v: number[]) => v.reduce((a, b) => a + b, 0)
const mediaDe = (v: number[]) => r6(somar(v) / v.length)
function medianaDe(v: number[]): number {
  const o = [...v].sort((a, b) => a - b)
  if (o.length % 2) return o[(o.length - 1) / 2]
  return r6((o[o.length / 2 - 1] + o[o.length / 2]) / 2)
}
/** Os dois do meio da fila (ou o do meio, repetido). */
function meios(v: number[]): [number, number] {
  const o = [...v].sort((a, b) => a - b)
  return o.length % 2 ? [o[(o.length - 1) / 2], o[(o.length - 1) / 2]] : [o[o.length / 2 - 1], o[o.length / 2]]
}
/** O meio da lista como veio. */
function meioComoVeio(v: number[]): number {
  return v.length % 2 ? v[(v.length - 1) / 2] : r6((v[v.length / 2 - 1] + v[v.length / 2]) / 2)
}
/** A moda única (o valor que aparece mais que todos os outros), ou null. */
function modaDe(v: number[]): number | null {
  const c: Record<number, number> = {}
  for (const x of v) c[x] = (c[x] ?? 0) + 1
  const pares = Object.entries(c).map(([k, q]) => [Number(k), q] as const).sort((a, b) => b[1] - a[1])
  if (pares[0][1] < 2 || (pares.length > 1 && pares[1][1] === pares[0][1])) return null
  return pares[0][0]
}
const distintosMedia = (v: number[]) => mediaDe([...new Set(v)])
const dpDe = (v: number[]) => {
  const m = somar(v) / v.length
  return Math.sqrt(somar(v.map((x) => (x - m) ** 2)) / v.length)
}

/** O mapa de erros que se espera: na ordem dada, só os digitáveis, sem a certa e sem repetir. */
function esperado(certa: number, pares: [number | null, string][], positivos = true): Record<string, string> {
  const e: Record<string, string> = {}
  const vistos = new Set([chave(certa)])
  for (const [v, id] of pares) {
    if (v === null || !digitavel(v) || (positivos && v < 0)) continue
    const k = chave(v === 0 ? 0 : v)
    if (vistos.has(k)) continue
    vistos.add(k)
    e[k] = id
  }
  return e
}
const foraDoTex = (t: string) => t.replace(/\$[^$]*\$/g, '')
const valoresDo = (item: Item) => (item.visual!.estado as { valores: number[] }).valores

describe('U19 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U19A).toHaveLength(9)
    for (const aula of ['B.U19.A1', 'B.U19.A2', 'B.U19.A3']) {
      expect(GERADORES_U19A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual só no nível 1, o menos verdadeiro, o espaço que não quebra e a resposta como se digita', () => {
    for (const ger of GERADORES_U19A) {
      for (const item of itens(ger)) {
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções repetidas').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
        } else {
          for (const k of Object.keys(item.erros)) expect(num(k), `${k} vale a resposta: ${item.enunciado}`).not.toBe(num(String(item.resposta)))
          // Inteiro como número; decimal como o aluno digita, com vírgula e até 2 casas.
          if (typeof item.resposta === 'string') expect(item.resposta, item.enunciado).toMatch(/^\d+,\d{1,2}$/)
          else expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
          for (const k of Object.keys(item.erros)) expect(k, `chave como se digita: ${k}`).toMatch(/^-?\d+(,\d{1,2})?$/)
        }
        if (ger.nivel === 1) expect(item.visual?.modelo, `${ger.id}: o nível 1 tem o gráfico de pontos`).toBe('dados')
        else expect(item.visual, `${ger.id}: os níveis 2 e 3 não têm visual`).toBeUndefined()
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(foraDoTex(t), `sem hífen no lugar do menos: ${t}`).not.toMatch(/-/)
          expect(t, `R$ com espaço que não quebra: ${t}`).not.toMatch(/R\$ /)
          expect(t, `unidade com espaço que não quebra: ${t}`).not.toMatch(/\d (mg|mL|g|%)(\b|$)/)
          expect(t, `ponto de milhar: ${t}`).not.toMatch(/\d{4}/)
          expect(t, `vírgula decimal: ${t}`).not.toMatch(/\d\.\d{1,2}\b(?!\d)/)
        }
        expect(item.enunciado.replace(/\$/g, '').length, item.enunciado).toBeLessThanOrEqual(140)
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('U19 · aula 1: média, mediana e moda', () => {
  it('media-mediana-moda-n1: a média, a mediana e a moda das notas desenhadas', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('media-mediana-moda-n1'))) {
      const v = valoresDo(item)
      for (const x of v) expect(x >= 0 && x <= 10 && Number.isInteger(x), 'notas de 0 a 10').toBe(true)
      const pede = item.enunciado.match(/Qual é a (média|mediana|moda) das notas\?$/)![1]
      tipos.add(pede)
      const meio = (Math.min(...v) + Math.max(...v)) / 2
      if (pede === 'média') {
        const certa = somar(v) / v.length
        expect(Number.isInteger(certa)).toBe(true)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(esperado(certa, [[distintosMedia(v), 'media-esquece-valores'], [meio, 'media-do-menor-e-do-maior'], [medianaDe(v), 'troca-media-mediana-moda']]))
      } else if (pede === 'mediana') {
        expect(v.length % 2).toBe(1)
        const certa = medianaDe(v)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(esperado(certa, [[mediaDe(v), 'troca-media-mediana-moda'], [modaDe(v), 'troca-media-mediana-moda'], [meio, 'media-do-menor-e-do-maior']]))
      } else {
        const certa = modaDe(v)
        expect(certa, `uma moda só: ${v}`).not.toBeNull()
        expect(v.filter((x) => x === certa)).toHaveLength(3)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(esperado(certa!, [[Math.max(...v), 'moda-e-o-maior-valor'], [3, 'moda-como-frequencia'], [medianaDe(v), 'troca-media-mediana-moda']]))
      }
    }
    expect(tipos).toEqual(new Set(['média', 'mediana', 'moda']))
  })

  it('media-mediana-moda-n2: a lista fora de ordem, com quantidade par e valores repetidos', () => {
    const tipos = new Set<string>()
    const re = /^(.+) em (\d+) (jogos|meses|dias|semanas|horas): (.+)\. Qual é a (média|mediana)\?$/
    for (const item of itens(g('media-mediana-moda-n2'))) {
      const m = item.enunciado.match(re)
      expect(m, item.enunciado).not.toBeNull()
      const v = nums(m![4])
      expect(v).toHaveLength(Number(m![2]))
      if (m![5] === 'média') {
        tipos.add('média')
        expect(new Set(v).size, `há um valor repetido: ${item.enunciado}`).toBeLessThan(v.length)
        const certa = somar(v) / v.length
        expect(Number.isInteger(certa)).toBe(true)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(esperado(certa, [[distintosMedia(v), 'media-esquece-valores'], [medianaDe(v), 'troca-media-mediana-moda']]))
        continue
      }
      const certa = medianaDe(v)
      expect(item.resposta).toEqual(digitada(certa))
      if (v.length % 2 === 0) {
        tipos.add('par')
        const [a, b] = meios(v)
        expect(item.erros).toEqual(esperado(certa, [[a, 'mediana-par-pega-um-do-meio'], [b, 'mediana-par-pega-um-do-meio'], [meioComoVeio(v), 'mediana-sem-ordenar']]))
      } else {
        tipos.add('ímpar')
        expect(meioComoVeio(v), `o meio da lista não é o da fila: ${item.enunciado}`).not.toBe(certa)
        expect(item.erros).toEqual(esperado(certa, [[meioComoVeio(v), 'mediana-sem-ordenar'], [mediaDe(v), 'troca-media-mediana-moda']]))
      }
    }
    expect(tipos).toEqual(new Set(['média', 'par', 'ímpar']))
  })

  it('media-mediana-moda-n3: a nota que falta, o total pela média e a média dos pães', () => {
    const tipos = new Set<string>()
    const NUM: Record<string, number> = { três: 3, quatro: 4 }
    const ORD: Record<string, number> = { quarta: 4, quinta: 5 }
    for (const item of itens(g('media-mediana-moda-n3'))) {
      const nota = item.enunciado.match(/^\S+ tirou (.+) nas (três|quatro) primeiras provas\. Quanto precisa tirar na (quarta|quinta) para ficar com média (\d+)\?$/)
      if (nota) {
        tipos.add('nota')
        const v = nums(nota[1])
        const k = NUM[nota[2]]
        expect(v).toHaveLength(k)
        expect(ORD[nota[3]]).toBe(k + 1)
        const alvo = Number(nota[4])
        const falta = alvo * (k + 1) - somar(v)
        expect(falta >= 0 && falta <= 10, 'uma nota de 0 a 10').toBe(true)
        expect(item.resposta).toBe(falta)
        expect(somar([...v, falta]) / (k + 1)).toBe(alvo)
        expect(item.erros).toEqual(esperado(falta, [[alvo, 'responde-outra-pergunta'], [alvo * k - somar(v), 'media-esquece-valores']]))
        continue
      }
      const total = item.enunciado.match(/^A média de (\d+) entregas foi de (\d+) minutos\. Quantos minutos as (\d+) entregas somaram\?$/)
      if (total) {
        tipos.add('total')
        const [q, m] = [Number(total[1]), Number(total[2])]
        expect(Number(total[3])).toBe(q)
        expect(item.resposta).toBe(q * m)
        expect(item.erros).toEqual(esperado(q * m, [[q + m, 'soma-no-lugar-de-multiplicar'], [m, 'responde-outra-pergunta']]))
        continue
      }
      const paes = item.enunciado.match(/^Uma padaria vendeu (.+) pães em 5 dias\. Quantos pães por dia, na média\?$/)
      expect(paes, item.enunciado).not.toBeNull()
      tipos.add('pães')
      const v = nums(paes![1])
      expect(v).toHaveLength(5)
      const certa = somar(v) / 5
      expect(Number.isInteger(certa)).toBe(true)
      expect(item.resposta).toBe(certa)
      expect(item.erros).toEqual(esperado(certa, [[(Math.min(...v) + Math.max(...v)) / 2, 'media-do-menor-e-do-maior'], [medianaDe(v), 'troca-media-mediana-moda'], [somar(v), 'responde-outra-pergunta']]))
    }
    expect(tipos).toEqual(new Set(['nota', 'total', 'pães']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U19 · aula 2: quando a média engana', () => {
  it('media-engana-n1: a mediana e a amplitude dos salários desenhados, com um que destoa', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('media-engana-n1'))) {
      const v = valoresDo(item)
      const alto = Math.max(...v)
      expect(alto, 'um salário destoa').toBeGreaterThanOrEqual(15)
      expect(v.filter((x) => x > 5), 'só um destoa').toHaveLength(1)
      expect(v.length % 2).toBe(1)
      if (/mediana/.test(item.enunciado)) {
        tipos.add('mediana')
        const certa = medianaDe(v)
        expect(certa).toBeLessThanOrEqual(5)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(esperado(certa, [[mediaDe(v), 'usa-sempre-a-media'], [alto, 'mediana-segue-o-extremo']]))
      } else {
        expect(item.enunciado).toMatch(/Qual é a amplitude, em mil reais\?$/)
        tipos.add('amplitude')
        const certa = alto - Math.min(...v)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual({ [String(alto)]: 'amplitude-e-o-maior-valor' })
      }
    }
    expect(tipos).toEqual(new Set(['mediana', 'amplitude']))
  })

  it('media-engana-n2: o maior salário muda, e qual loja se espalha mais', () => {
    const tipos = new Set<string>()
    const reS = /^Salários de uma firma, em mil reais: (.+)\. O de (\d+) mil passa para (\d+) mil\. Qual é a nova (média|mediana)\?$/
    const reL = /^Pães vendidos em 4 dias\. Loja A: (.+)\. Loja B: (.+)\. As duas têm média (\d+)\. Qual se espalha mais\?$/
    for (const item of itens(g('media-engana-n2'))) {
      const s = item.enunciado.match(reS)
      if (s) {
        const v = nums(s[1])
        const [x, y] = [Number(s[2]), Number(s[3])]
        expect(x).toBe(Math.max(...v))
        expect(v.filter((w) => w === x)).toHaveLength(1)
        const novos = v.map((w) => (w === x ? y : w))
        const antes = medianaDe(v)
        if (s[4] === 'média') {
          tipos.add('média')
          const certa = somar(novos) / novos.length
          expect(Number.isInteger(certa)).toBe(true)
          expect(item.resposta).toBe(certa)
          expect(item.erros).toEqual(esperado(certa, [[antes, 'troca-media-mediana-moda']]))
        } else {
          tipos.add('mediana')
          const certa = medianaDe(novos)
          expect(certa, 'a mediana não muda').toBe(antes)
          expect(item.resposta).toEqual(digitada(certa))
          expect(item.erros).toEqual(esperado(certa, [[antes + (y - x), 'mediana-segue-o-extremo'], [mediaDe(novos), 'usa-sempre-a-media']]))
        }
        continue
      }
      const l = item.enunciado.match(reL)
      expect(l, item.enunciado).not.toBeNull()
      tipos.add('lojas')
      const [a, b] = [nums(l![1]), nums(l![2])]
      const m = Number(l![3])
      expect(mediaDe(a)).toBe(m)
      expect(mediaDe(b)).toBe(m)
      for (const w of [...a, ...b]) expect(w).toBeGreaterThan(0)
      const [ampA, ampB] = [Math.max(...a) - Math.min(...a), Math.max(...b) - Math.min(...b)]
      expect(ampA).not.toBe(ampB)
      expect(item.opcoes).toEqual(['A Loja A', 'A Loja B', 'As duas espalham igual'])
      expect(item.resposta).toBe(ampA > ampB ? 0 : 1)
      expect(item.erros).toEqual({ '2': 'usa-sempre-a-media' })
    }
    expect(tipos).toEqual(new Set(['média', 'mediana', 'lojas']))
  })

  it('media-engana-n3: qual resumo usar, e a mediana da viagem com um dia que destoa', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('media-engana-n3'))) {
      if (item.formato === 'escolha') {
        expect(item.opcoes).toEqual(['A média', 'A mediana', 'A moda'])
        // Quem pergunta pelo mais pedido quer a moda; com um valor que destoa, a mediana.
        const maisPedido = /vende mais|mais pedido|mais escolhem/.test(item.enunciado)
        const certa = maisPedido ? 2 : 1
        tipos.add(maisPedido ? 'moda' : 'mediana')
        if (!maisPedido) expect(item.enunciado, 'há um valor que destoa').toMatch(/milhões|R\$ 40 mil|2 horas/)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual({ '0': 'usa-sempre-a-media', [String(3 - certa)]: 'troca-media-mediana-moda' })
        continue
      }
      const m = item.enunciado.match(/^Os minutos de viagem de Rui até o trabalho em (\d+) dias: (.+)\. Qual é a mediana, em minutos\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add('viagem')
      const v = nums(m![2])
      expect(v).toHaveLength(Number(m![1]))
      expect(v.filter((x) => x >= 90), 'um dia destoa').toHaveLength(1)
      const certa = medianaDe(v)
      expect(meioComoVeio(v)).not.toBe(certa)
      expect(item.resposta).toBe(certa)
      expect(item.erros).toEqual(esperado(certa, [[mediaDe(v), 'usa-sempre-a-media'], [meioComoVeio(v), 'mediana-sem-ordenar']]))
    }
    expect(tipos).toEqual(new Set(['mediana', 'moda', 'viagem']))
  })
})

// ---------------------------------------------------------------- aula 3

/** O desvio padrão tem raiz exata e se digita com até 2 casas. */
function dpExato(v: number[]): number {
  const s = dpDe(v)
  expect(digitavel(s), `desvio padrão exato: ${v}`).toBe(true)
  return r6(s)
}
const variancia = (v: number[]) => {
  const m = somar(v) / v.length
  return r6(somar(v.map((x) => (x - m) ** 2)) / v.length)
}
const distanciaMedia = (v: number[]) => {
  const m = somar(v) / v.length
  return r6(somar(v.map((x) => Math.abs(x - m))) / v.length)
}
const errosDp = (v: number[], s: number) => esperado(s, [[variancia(v), 'desvio-padrao-sem-a-raiz'], [distanciaMedia(v), 'desvio-padrao-sem-o-quadrado'], [variancia(v) / 2, 'raiz-e-a-metade']])

describe('U19 · aula 3: desvio padrão', () => {
  it('desvio-padrao-n1: o desvio de um valor e a soma dos desvios, no desenho', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('desvio-padrao-n1'))) {
      const v = valoresDo(item)
      const m = somar(v) / v.length
      expect(Number.isInteger(m)).toBe(true)
      expect(v.length).toBeLessThanOrEqual(10)
      expect(item.sinal, 'o teclado não entrega o sinal').toBe(true)
      const d = item.enunciado.match(/^Cada ponto é (um comprimido|uma garrafa|um pacote de café), em (mg|mL|g)\. A média é ([\d.]+) (mg|mL|g)\. Qual é o desvio do de ([\d.]+) (mg|mL|g)\?$/)
      if (d) {
        tipos.add('desvio')
        expect(num(d[3])).toBe(m)
        const valor = num(d[5])
        expect(v).toContain(valor)
        const certa = valor - m
        expect(certa).not.toBe(0)
        expect(item.resposta).toBe(certa)
        expect(item.erros).toEqual(certa < 0 ? { [String(-certa)]: 'esquece-sinal-do-resultado' } : {})
        if (certa < 0) tipos.add('negativo')
        continue
      }
      expect(item.enunciado).toMatch(/^Cada ponto é (um comprimido|uma garrafa|um pacote de café), em (mg|mL|g)\. Quanto dá a soma de todos os desvios até a média\?$/)
      tipos.add('soma')
      expect(item.resposta).toBe(0)
      expect(r6(somar(v.map((x) => x - m)))).toBe(0)
      expect(item.erros).toEqual({ [String(somar(v.map((x) => Math.abs(x - m))))]: 'soma-desvios-sem-sinal' })
    }
    expect(tipos).toEqual(new Set(['desvio', 'negativo', 'soma']))
  })

  it('desvio-padrao-n2: o desvio padrão a partir dos desvios', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('desvio-padrao-n2'))) {
      const m = item.enunciado.match(/^Os desvios até a média são (.+)\. Qual é o desvio padrão\?$/)
      expect(m, item.enunciado).not.toBeNull()
      for (const t of m![1].split(/, | e /)) expect(t, 'o desvio com sinal: +3, −1, 0').toMatch(/^([+−][1-9]\d*|0)$/)
      const d = nums(m![1])
      expect(somar(d), 'os desvios somam 0').toBe(0)
      // Desvios até a média 0: o desvio padrão é a raiz da média dos quadrados.
      const s = dpExato(d)
      vistos.add(String(s))
      expect(item.resposta).toEqual(digitada(s))
      expect(item.erros).toEqual(errosDp(d, s))
      expect(item.erros[chave(variancia(d))], 'esquecer a raiz é um erro previsto').toBe('desvio-padrao-sem-a-raiz')
    }
    expect(vistos.has('1.5'), 'há um desvio padrão decimal').toBe(true)
  })

  it('desvio-padrao-n3: o desvio padrão a partir dos valores, e se o lote passou', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('desvio-padrao-n3'))) {
      const c = item.enunciado.match(/^(Comprimidos|Garrafas|Pacotes de café) de ([\d.]+) (mg|mL|g)\. As medidas: (.+)\. Qual é o desvio padrão, em (mg|mL|g)\?$/)
      if (c) {
        tipos.add('conta')
        const v = nums(c[4])
        expect(c[4].endsWith(`${NB}${c[3]}`)).toBe(true)
        expect(mediaDe(v), 'a média é o peso do rótulo').toBe(num(c[2]))
        const s = dpExato(v)
        expect(item.resposta).toEqual(digitada(s))
        expect(item.erros).toEqual(errosDp(v, s))
        continue
      }
      const l = item.enunciado.match(/^(Comprimidos|Garrafas|Pacotes de café) de ([\d.]+) (mg|mL|g): (.+)\. O controle aceita desvio padrão de até (\d+) (mg|mL|g)\. O lote passou\?$/)
      expect(l, item.enunciado).not.toBeNull()
      const v = nums(l![4])
      expect(mediaDe(v), 'a média é o peso do rótulo: só o espalhamento decide').toBe(num(l![2]))
      const s = dpExato(v)
      const L = Number(l![5])
      const passou = s <= L
      tipos.add(passou ? 'passou' : 'reprovou')
      expect(item.opcoes).toEqual(['Passou', 'Reprovou'])
      expect(item.resposta).toBe(passou ? 0 : 1)
      if (passou) {
        // Quem esquece a raiz compara o quadrado com o limite e reprova o lote.
        expect(variancia(v)).toBeGreaterThan(L)
        expect(item.erros).toEqual({ '1': 'desvio-padrao-sem-a-raiz' })
      } else expect(item.erros).toEqual({ '0': 'usa-sempre-a-media' })
    }
    expect(tipos).toEqual(new Set(['conta', 'passou', 'reprovou']))
  })
})
