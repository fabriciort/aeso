import { describe, expect, it } from 'vitest'
import { GERADORES_U18A } from '@/content/matematica/geradores/graficos-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (ou o desenho, no nível 1) e refaz a conta por
// conta própria, sem usar as funções do gerador: o quadrante pelos sinais
// do par, o ponto que anda somando o deslocamento ao par, a distância no
// mapa pela diferença das coordenadas, o valor da barra pelos dados do
// desenho, o salto pela diferença de cada mês para o seguinte, a fatia pela
// regra de três (parte ÷ todo · 100), o desenho do eixo cortado pelo que
// passa do começo do eixo e a escala torta pela posição das marcas.

const g = (id: string) => GERADORES_U18A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = '\u00a0'

// ---------------------------------------------------------------- ajudas

/** Um número como está na tela: −3 vale -3; 2.000 vale 2000. */
const num = (t: string) => Number(t.replace('−', '-').replace(/\./g, ''))
/** O par (x, y) da tela, com o espaço que não quebra. */
const PAR = `\\((−?\\d+),${NB}(−?\\d+)\\)`
const QUADRANTES = ['1º quadrante', '2º quadrante', '3º quadrante', '4º quadrante']
/** O quadrante pelos sinais: (+, +) é o 1º, (−, +) o 2º, (−, −) o 3º, (+, −) o 4º. */
function quadrante(x: number, y: number): number {
  expect(x * y, 'ponto fora dos eixos').not.toBe(0)
  if (x > 0 && y > 0) return 1
  if (x < 0 && y > 0) return 2
  if (x < 0 && y < 0) return 3
  return 4
}
const MOVE: Record<string, [number, number]> = {
  'para a direita': [1, 0],
  'para a esquerda': [-1, 0],
  'para cima': [0, 1],
  'para baixo': [0, -1],
  'à direita': [1, 0],
  'à esquerda': [-1, 0],
  acima: [0, 1],
  abaixo: [0, -1],
}
const MES: Record<string, number> = { janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11 }
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DIA: Record<string, string> = { 'na segunda': 'seg', 'na terça': 'ter', 'na quarta': 'qua', 'na quinta': 'qui', 'na sexta': 'sex', 'no sábado': 'sáb' }

function errosDiferentes(item: Item) {
  if (item.formato === 'escolha') {
    for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
    expect(new Set(item.opcoes).size, 'opções repetidas').toBe(item.opcoes!.length)
    return
  }
  for (const k of Object.keys(item.erros)) expect(Number(k), `${k} vale a resposta: ${item.enunciado}`).not.toBe(Number(item.resposta))
}
const erroDe = (item: Item, v: number) => Object.entries(item.erros).find(([k]) => Number(k) === v)?.[1]
const foraDoTex = (t: string) => t.replace(/\$[^$]*\$/g, '')
type Dados = [string, number][]

describe('U18 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U18A).toHaveLength(9)
    for (const aula of ['B.U18.A1', 'B.U18.A2', 'B.U18.A3']) {
      expect(GERADORES_U18A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual só no nível 1, o menos verdadeiro, espaço que não quebra e o par sem quebra', () => {
    for (const ger of GERADORES_U18A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        else expect(item.visual, `${ger.id}: os níveis 2 e 3 não têm visual`).toBeUndefined()
        if (item.visual) expect(item.visual.modelo).toBe(ger.aula === 'B.U18.A1' ? 'plano' : 'grafico')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(foraDoTex(t), `sem hífen no lugar do menos: ${t}`).not.toMatch(/-/)
          expect(t, `R$ com espaço que não quebra: ${t}`).not.toMatch(/R\$ /)
          expect(t, `% com espaço que não quebra: ${t}`).not.toMatch(/\d %/)
          expect(t, `o par não quebra: ${t}`).not.toMatch(/\(−?\d+, −?\d+\)/)
        }
        expect(item.enunciado.replace(/\$/g, '').length, item.enunciado).toBeLessThanOrEqual(140)
        if (item.formato === 'numero') {
          expect(Number.isInteger(Number(item.resposta)), item.enunciado).toBe(true)
          // As coordenadas podem ser negativas: o teclado não entrega o sinal.
          if (ger.aula === 'B.U18.A1' && /Qual é o (x|y)/.test(item.enunciado)) expect(item.sinal, item.enunciado).toBe(true)
          else expect(Number(item.resposta), item.enunciado).toBeGreaterThan(0)
        }
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

/** Na escolha do quadrante: a certa pelos sinais; a do par trocado é a troca; as outras, o sinal. */
function quadranteBate(item: Item, x: number, y: number) {
  expect(item.formato).toBe('escolha')
  expect(item.opcoes).toEqual(QUADRANTES)
  const q = quadrante(x, y)
  expect(item.resposta).toBe(q - 1)
  const troca = quadrante(y, x)
  for (let i = 0; i < 4; i++) {
    if (i === q - 1) continue
    expect(item.erros[String(i)], `${item.enunciado} › ${QUADRANTES[i]}`).toBe(i === troca - 1 ? 'troca-x-e-y' : 'ignora-sinal-da-coordenada')
  }
}

describe('U18 · aula 1: coordenadas', () => {
  it('coordenadas-n1: o x, o y e o quadrante do ponto desenhado', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('coordenadas-n1'))) {
      const e = item.visual!.estado as { pontos: { P: [number, number] }; x: [number, number] }
      const [x, y] = e.pontos.P
      expect(Math.abs(x)).toBeLessThanOrEqual(5)
      expect(Math.abs(y)).toBeLessThanOrEqual(5)
      expect(Math.abs(x)).not.toBe(Math.abs(y))
      if (item.enunciado === 'Em que quadrante fica o ponto P?') {
        tipos.add('quadrante')
        quadranteBate(item, x, y)
        continue
      }
      const m = item.enunciado.match(/^Qual é o (x|y) do ponto P\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add(m![1])
      const [certa, outro] = m![1] === 'x' ? [x, y] : [y, x]
      expect(item.resposta).toBe(certa)
      expect(item.sinal).toBe(true)
      expect(erroDe(item, outro)).toBe('troca-x-e-y')
      expect(erroDe(item, -certa)).toBe('ignora-sinal-da-coordenada')
    }
    expect(tipos).toEqual(new Set(['quadrante', 'x', 'y']))
  })

  it('coordenadas-n2: o quadrante pelo par e o ponto que anda', () => {
    const tipos = new Set<string>()
    const reQ = new RegExp(`^Em que quadrante fica o ponto ${PAR}\\?$`)
    const reA = new RegExp(`^O ponto ${PAR} anda (\\d+) (para a direita|para a esquerda|para cima|para baixo)\\. Qual é o (x|y) do ponto novo\\?$`)
    for (const item of itens(g('coordenadas-n2'))) {
      const q = item.enunciado.match(reQ)
      if (q) {
        tipos.add('quadrante')
        quadranteBate(item, num(q[1]), num(q[2]))
        continue
      }
      const a = item.enunciado.match(reA)
      expect(a, item.enunciado).not.toBeNull()
      const [x, y, k] = [num(a![1]), num(a![2]), Number(a![3])]
      const [dx, dy] = MOVE[a![4]]
      const novo = { x: x + dx * k, y: y + dy * k }
      const eixo = a![5] as 'x' | 'y'
      expect(item.resposta).toBe(novo[eixo])
      expect(item.sinal).toBe(true)
      const muda = (eixo === 'x' ? dx : dy) !== 0
      tipos.add(muda ? 'muda' : 'não muda')
      const antes = eixo === 'x' ? x : y
      const d = (eixo === 'x' ? dx : dy) * k
      if (muda) {
        expect(erroDe(item, antes - d)).toBe('anda-para-o-lado-errado')
        if (antes !== 0 && -antes + d !== antes - d) expect(erroDe(item, -antes + d)).toBe('ignora-sinal-da-coordenada')
      } else {
        // Mexer no x quando o ponto sobe (ou no y quando anda de lado) é a troca.
        expect(erroDe(item, antes + k)).toBe('troca-x-e-y')
        expect(erroDe(item, antes - k)).toBe('troca-x-e-y')
      }
    }
    expect(tipos).toEqual(new Set(['quadrante', 'muda', 'não muda']))
  })

  it('coordenadas-n3: as quadras do mapa e a batalha naval', () => {
    const tipos = new Set<string>()
    const reM = new RegExp(`^No mapa do bairro, a praça é o \\(0,${NB}0\\)\\. \\S+ \\S+ está em ${PAR} e \\S+ \\S+, em ${PAR}\\. Quantas quadras de uma até a outra\\?$`)
    const reB = new RegExp(`^Batalha naval: seu tiro caiu em ${PAR}\\. O navio está (\\d+) casas (à direita|à esquerda|acima|abaixo) do tiro\\. Qual é o (x|y) do navio\\?$`)
    for (const item of itens(g('coordenadas-n3'))) {
      const m = item.enunciado.match(reM)
      if (m) {
        tipos.add('mapa')
        const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(num)
        // Na mesma linha ou na mesma coluna: a distância é a diferença do outro número.
        expect(x1 === x2 || y1 === y2, item.enunciado).toBe(true)
        expect(x1 === x2 && y1 === y2).toBe(false)
        const dist = Math.abs(x2 - x1) + Math.abs(y2 - y1)
        expect(item.resposta).toBe(dist)
        const [a, b] = x1 === x2 ? [y1, y2] : [x1, x2]
        if (a * b < 0) {
          tipos.add('mapa com o 0 no meio')
          expect(erroDe(item, Math.abs(Math.abs(a) - Math.abs(b)))).toBe(Math.abs(a) === Math.abs(b) ? undefined : 'ignora-sinal-da-coordenada')
        }
        continue
      }
      const b = item.enunciado.match(reB)
      expect(b, item.enunciado).not.toBeNull()
      tipos.add('batalha')
      const [x, y, k] = [num(b![1]), num(b![2]), Number(b![3])]
      const [dx, dy] = MOVE[b![4]]
      const navio = { x: x + dx * k, y: y + dy * k }
      const eixo = b![5] as 'x' | 'y'
      // A pergunta é sempre o número que muda.
      expect(eixo === 'x' ? dx : dy).not.toBe(0)
      expect(item.resposta).toBe(navio[eixo])
      expect(item.sinal).toBe(true)
      const antes = eixo === 'x' ? x : y
      const d = (eixo === 'x' ? dx : dy) * k
      expect(erroDe(item, antes - d)).toBe('anda-para-o-lado-errado')
    }
    expect(tipos).toEqual(new Set(['mapa', 'mapa com o 0 no meio', 'batalha']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U18 · aula 2: ler gráficos', () => {
  it('ler-grafico-n1: o valor da barra (ou do ponto) lido no eixo', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('ler-grafico-n1'))) {
      const e = item.visual!.estado as { tipo: string; dados: Dados; passo: number; eixoFim: number; valores: boolean; destaque: number }
      expect(e.valores, 'os valores não vêm escritos').toBe(false)
      expect(e.passo).toBe(20)
      expect(e.dados.length).toBeGreaterThanOrEqual(4)
      expect(e.dados.length).toBeLessThanOrEqual(7)
      for (const [, v] of e.dados) {
        expect(v % 10).toBe(0)
        expect(v).toBeGreaterThan(0)
        expect(v).toBeLessThanOrEqual(e.eixoFim)
      }
      let rotulo: string
      const b = item.enunciado.match(/^Quanto foi a conta de água de (\S+), em reais\? Leia no eixo\.$/)
      if (b) {
        expect(e.tipo).toBe('barras')
        rotulo = MES_CURTO[MES[b[1]]]
      } else {
        const l = item.enunciado.match(/^Quantos clientes a loja teve (n[ao] \S+)\? Leia no eixo\.$/)
        expect(l, item.enunciado).not.toBeNull()
        expect(e.tipo).toBe('linhas')
        rotulo = DIA[l![1]]
      }
      const i = e.dados.findIndex(([t]) => t === rotulo)
      expect(i, item.enunciado).toBeGreaterThanOrEqual(0)
      expect(e.destaque).toBe(i)
      const v = e.dados[i][1]
      expect(item.resposta).toBe(v)
      const entre = v % 20 !== 0
      tipos.add(`${e.tipo} ${entre ? 'entre marcas' : 'na marca'}`)
      // Ler a marca mais perto: a de baixo ou a de cima.
      const perto = entre ? [v - 10, v + 10] : [v - 20, v + 20]
      for (const w of perto) if (w > 0) expect(erroDe(item, w)).toBe('le-valor-entre-marcas')
    }
    expect(tipos).toEqual(new Set(['barras entre marcas', 'barras na marca', 'linhas entre marcas', 'linhas na marca']))
  })

  it('ler-grafico-n2: o maior salto e a fatia em reais', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('ler-grafico-n2'))) {
      const s = item.enunciado.match(/^A conta de luz foi (.+)\. Em que mês ela deu o maior salto\?$/)
      if (s) {
        tipos.add('salto')
        const meses = [...s[1].matchAll(/R\$\u00a0(\d+) em (\S+?)(?:,| e |$)/g)].map((m) => ({ v: Number(m[1]), mes: m[2] }))
        expect(meses, item.enunciado).toHaveLength(4)
        for (let j = 1; j < 4; j++) expect(MES[meses[j].mes]).toBe(MES[meses[j - 1].mes] + 1)
        expect(item.opcoes).toEqual(meses.slice(1).map((m) => `em ${m.mes}`))
        const saltos = [1, 2, 3].map((j) => meses[j].v - meses[j - 1].v)
        const maior = Math.max(...saltos)
        expect(saltos.filter((x) => x === maior)).toHaveLength(1)
        expect(item.resposta).toBe(saltos.indexOf(maior))
        // O mês mais caro é uma opção errada: o erro da aula.
        const topo = meses.reduce((m, x, j) => (x.v > meses[m].v ? j : m), 0)
        expect(topo).toBeGreaterThan(0)
        expect(topo - 1).not.toBe(item.resposta)
        expect(item.erros[String(topo - 1)]).toBe('subida-pela-altura')
        continue
      }
      const f = item.enunciado.match(/^Na pizza do salário de R\$\u00a0([\d.]+), a fatia d[oa] .+ é de (\d+)\u00a0%\. Quanto é, em reais\?$/)
      expect(f, item.enunciado).not.toBeNull()
      tipos.add('fatia em reais')
      const [S, p] = [num(f![1]), Number(f![2])]
      expect(item.resposta).toBe((S / 100) * p)
      expect(erroDe(item, p)).toBe('porcentagem-como-numero-inteiro')
      if (S % p === 0 && S / p !== (S / 100) * p && S / p !== p) expect(erroDe(item, S / p)).toBe('divide-pelo-numero-da-porcentagem')
    }
    expect(tipos).toEqual(new Set(['salto', 'fatia em reais']))
  })

  it('ler-grafico-n3: a fatia em % e a fatia que falta', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('ler-grafico-n3'))) {
      const f = item.enunciado.match(/^Dos R\$\u00a0([\d.]+) do salário, R\$\u00a0([\d.]+) vão para .+\. Na pizza do salário, essa fatia é de quantos %\?$/)
      if (f) {
        tipos.add('fatia em %')
        const [S, V] = [num(f[1]), num(f[2])]
        expect(item.resposta).toBe((V * 100) / S)
        expect(erroDe(item, V)).toBe('parte-como-porcentagem')
        if (S % V === 0 && S / V !== item.resposta) expect(erroDe(item, S / V)).toBe('divide-todo-pela-parte')
        continue
      }
      const r = item.enunciado.match(/^Na pizza dos gastos, o aluguel é (\d+)\u00a0%, a comida (\d+)\u00a0% e o transporte (\d+)\u00a0%\. O resto é lazer\. Quantos % é o lazer\?$/)
      expect(r, item.enunciado).not.toBeNull()
      tipos.add('falta')
      const soma = Number(r![1]) + Number(r![2]) + Number(r![3])
      expect(item.resposta).toBe(100 - soma)
      expect(erroDe(item, soma)).toBe('responde-outra-pergunta')
    }
    expect(tipos).toEqual(new Set(['fatia em %', 'falta']))
  })
})

// ---------------------------------------------------------------- aula 3

/** A escala torta: as marcas ficam à mesma distância; um valor numa marca fica na altura índice ÷ (marcas − 1). */
const altura = (escala: number[], v: number) => {
  const i = escala.indexOf(v)
  expect(i, `${v} está numa marca`).toBeGreaterThan(0)
  return i / (escala.length - 1)
}

describe('U18 · aula 3: gráficos que enganam', () => {
  it('grafico-enganoso-n1: onde começa o eixo e a escala torta desenhada', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('grafico-enganoso-n1'))) {
      const e = item.visual!.estado as { dados: Dados; eixoInicio?: number; escala?: number[] }
      if (item.enunciado.startsWith('Onde começa o eixo')) {
        tipos.add('eixo')
        expect(e.eixoInicio).toBeGreaterThan(0)
        expect(item.resposta).toBe(e.eixoInicio)
        for (const [, v] of e.dados) expect(v).toBeGreaterThan(e.eixoInicio!)
        expect(erroDe(item, 0)).toBe('nao-olha-o-inicio-do-eixo')
        continue
      }
      expect(item.enunciado).toBe('Quantas vezes o valor de B é o de A? Leia as marcas do eixo.')
      tipos.add('torta')
      const esc = e.escala!
      // As marcas pulam valores diferentes: a escala é torta.
      const pulos = esc.slice(1).map((m, j) => m - esc[j])
      expect(new Set(pulos).size).toBeGreaterThan(1)
      const [[ra, a], [rb, b]] = e.dados
      expect([ra, rb]).toEqual(['A', 'B'])
      expect(item.resposta).toBe(b / a)
      const parece = altura(esc, b) / altura(esc, a)
      expect(parece).not.toBe(b / a)
      expect(erroDe(item, parece)).toBe('nao-confere-a-escala')
    }
    expect(tipos).toEqual(new Set(['eixo', 'torta']))
  })

  it('grafico-enganoso-n2: o tamanho do desenho e o valor no eixo cortado', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('grafico-enganoso-n2'))) {
      const d = item.enunciado.match(/^Um gráfico mostra (\d+) e (\d+), com o eixo começando no (\d+)\. No desenho, a barra de (\d+) fica quantas vezes a de (\d+)\?$/)
      if (d) {
        tipos.add('desenho')
        const [x1, x2, s] = [Number(d[1]), Number(d[2]), Number(d[3])]
        expect([Number(d[4]), Number(d[5])]).toEqual([x2, x1])
        expect(x1).toBeGreaterThan(s)
        // O desenho mostra só o que passa do começo do eixo.
        expect(item.resposta).toBe((x2 - s) / (x1 - s))
        expect(erroDe(item, 1)).toBe('nao-olha-o-inicio-do-eixo')
        continue
      }
      const v = item.enunciado.match(/^Num gráfico, o eixo começa no (\d+) e cada marca pula (\d+)\. A barra chega (\d+) marcas acima do pé\. Quanto ela vale\?$/)
      expect(v, item.enunciado).not.toBeNull()
      tipos.add('valor')
      const [s, p, h] = [Number(v![1]), Number(v![2]), Number(v![3])]
      expect(item.resposta).toBe(s + p * h)
      expect(erroDe(item, p * h)).toBe('nao-olha-o-inicio-do-eixo')
    }
    expect(tipos).toEqual(new Set(['desenho', 'valor']))
  })

  it('grafico-enganoso-n3: a subida de verdade, em %, e a escala torta descrita', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('grafico-enganoso-n3'))) {
      const a = item.enunciado.match(/^Um anúncio mostra o plano A a R\$\u00a0(\d+) e o B a R\$\u00a0(\d+), com o eixo começando no (\d+)\. Quantos % B custa a mais que A\?$/)
      if (a) {
        tipos.add('anúncio')
        const [pa, pb, c] = [Number(a[1]), Number(a[2]), Number(a[3])]
        expect(pb).toBeGreaterThan(pa)
        expect(c).toBeLessThan(pa)
        expect(item.resposta).toBe(((pb - pa) * 100) / pa)
        // Pelo desenho, B parece k vezes A: "subiu (k − 1) · 100 %".
        const k = (pb - c) / (pa - c)
        expect(Number.isInteger(k) && k >= 2).toBe(true)
        expect(erroDe(item, (k - 1) * 100)).toBe('nao-olha-o-inicio-do-eixo')
        if (pb - pa !== item.resposta) expect(erroDe(item, pb - pa)).toBe('parte-como-porcentagem')
        continue
      }
      const t = item.enunciado.match(/^Um gráfico tem as marcas (.+), à mesma distância\. A barra A chega no (\d+), e a B no (\d+)\. Quantas vezes B vale A\?$/)
      expect(t, item.enunciado).not.toBeNull()
      tipos.add('torta')
      const esc = t![1].split(/, | e /).map(Number)
      const [va, vb] = [Number(t![2]), Number(t![3])]
      expect(item.resposta).toBe(vb / va)
      const parece = altura(esc, vb) / altura(esc, va)
      expect(parece).not.toBe(vb / va)
      expect(erroDe(item, parece)).toBe('nao-confere-a-escala')
    }
    expect(tipos).toEqual(new Set(['anúncio', 'torta']))
  })
})
