import { describe, expect, test } from 'vitest'
import { AULAS } from '@/content/matematica'
import type { Mexa } from '@/lib/formation/schema'
import { favoraveisDoCard, initMexa, kindOf, mexaStage, solveMexa, type MexaState } from '@/components/aula/mexa'
import { ativoDe, media, meioDaFila, ordemFila, type DadosState } from '@/components/aula/visual/dados-geo'
import { pecasViradas, tipoDe } from '@/components/aula/visual/azulejos-pecas'
import { revelaveis, type LadosArea } from '@/components/aula/visual/monomio'
import { equacaoDe, inclinacaoDe, pecasDe, valorInferido } from '@/components/aula/visual/balanca-pratos'
import { areaDe, areaTotal, cameraDe, contagemTexto, dimsDe, dobrar, facesDe, facesVisiveis, partesDe, planificacao, somaTexto as somaFaces, TIRAS, type SolidoState } from '@/components/aula/visual/solido-geo'
import { aplicarRegra, coordTexto, eixoDe, encaixar, paresDaMaquina, passosDaRegra, quadranteDe, regraTexto, retaNoQuadro, retaTexto, type PlanoState, type Vec as VecPlano } from '@/components/aula/visual/plano-geo'
import { ajustarValor, eixoDoAjuste, escalaDe, porcentagensDe, setoresDe, valorTexto, type GraficoState } from '@/components/aula/visual/grafico-geo'
import { anguloInterno, cantosNaReta, encaixeDe, escalaCerta, grausMedir, leituraTransferidor, perimetroDe, pitagorasDe, poligonosDe, quadradoNoLado, recortePadrao, somaTexto, ladosValores, transferidorDe, valorDeMedida, type FiguraState, type Vec } from '@/components/aula/visual/figura-geo'

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
        const abrir = card.visual.estado.desagrupar === true
        const o = abrir
          ? (['milhares', 'centenas', 'dezenas'] as const).find((k) => b.canTap!(k))
          : (['unidades', 'dezenas', 'centenas'] as const).find((k) => b.canTap!(k) && (st.counts![k] - 10 >= ((ok[k] as number) ?? 0)))
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
    case 'linhas':
      for (let n = 0; n < 30 && !st.done; n++) stage().interact!.retangulo!.onAdd!()
      break
    case 'cortar':
      stage().interact!.retangulo!.onCut!(ok.corte as number)
      break
    case 'girar':
      stage().interact!.retangulo!.onTurn!()
      break
    case 'revelar': {
      // Taps every cell, row by row (with a hidden side, the second row only repeats the first).
      const e = card.visual.estado as unknown as { base: unknown[]; altura: unknown[] } & LadosArea
      e.altura.forEach((_, i) => e.base.forEach((_, j) => {
        const r = stage().interact!.retangulo!
        if (r.onRevelar) r.onRevelar(e.oculto === 'base' ? `b${j}` : e.oculto === 'altura' ? `h${i}` : `${i}-${j}`, i, j)
      }))
      break
    }
    case 'virar':
      stage().interact!.livre!.onVirar!()
      break
    case 'fatorar':
      // Tries the factor pairs in turn until the rectangle closes.
      for (let n = 0; n < 12 && !st.done; n++) stage().interact!.livre!.onArrumar!()
      break
    case 'mover':
      stage().interact!.retangulo!.onMover!()
      break
    case 'pintar': {
      const b = stage().interact!.barra!
      b.onPart!(b.ativa ?? 0, (ok.pintadas as number) - 1)
      break
    }
    case 'medida':
      stage().interact!.quadro!.onCasa!(ok.para as string)
      break
    case 'grade': {
      const g = stage().interact!.grade!
      g.onCell!(g.ativa ?? 0, (ok.pintadas as number) - 1)
      break
    }
    case 'tabela':
      for (let n = 0; n < 12 && !st.done; n++) stage().interact!.livre!.onColuna!(st.drag!)
      break
    case 'azulejos':
      for (let n = 0; n < 8 && !st.done; n++) {
        const l = stage().interact!.livre!
        const tipos: string[] = [...new Set((card.visual.estado.azulejos as { pecas: string[] }).pecas.map(tipoDe))]
        l.onPeca!(tipos.find((t) => !(l.agrupados ?? []).includes(t))!)
      }
      break
    case 'saldo':
      for (let n = 0; n < 40 && !st.done; n++) {
        const l = stage().interact!.livre!
        if (l.onTirar) l.onTirar()
        else l.onPar!()
      }
      break
    case 'tirar':
      // Takes the pieces one at a time, alternating sides (the balance tilts and levels again on the way).
      for (const id of solveMexa(card, st).order!) stage().interact!.balanca!.onPeca!(id)
      break
    case 'dividir':
      stage().interact!.balanca!.onGrupo!(0)
      break
    case 'medir': {
      const fs = card.visual.estado as FiguraState
      stage().interact!.figura!.onEscala!(grausMedir(fs)!, escalaCerta(transferidorDe(fs)?.invertido))
      break
    }
    case 'juntar':
      for (const i of [0, 1, 2]) if (!st.done) stage().interact!.figura!.onCanto!(i)
      break
    case 'contorno': {
      const n = poligonosDe(card.visual.estado as FiguraState)[0].verts.length
      for (let i = 0; i < n; i++) stage().interact!.figura!.onLado!(i)
      break
    }
    case 'recortar':
    case 'desenrolar':
    case 'encaixar':
      stage().interact!.figura!.onToque!()
      break
    case 'abrir':
      stage().interact!.solido!.onToque!()
      break
    case 'empilhar':
      for (let n = 0; n < 30 && !st.done; n++) stage().interact!.solido!.onToque!()
      break
    case 'faces': {
      // Only the faces in view can be touched until the solid opens.
      const fs = card.visual.estado as SolidoState
      for (const p of [...facesVisiveis(fs), ...partesDe(dimsDe(fs).tipo)]) stage().interact!.solido!.onFace!(p)
      break
    }
    case 'marcar': {
      const alvos = (Array.isArray(ok.pontos) ? ok.pontos : [ok.ponto]) as VecPlano[]
      for (const v of alvos) stage().interact!.plano!.onMarcar!(v)
      break
    }
    case 'ler':
      if (typeof ok.lido === 'string') stage().interact!.plano!.onPonto!(ok.lido)
      else for (const nome of Object.keys(card.visual.estado.pontos as object).slice(0, ok.lidos as number)) stage().interact!.plano!.onPonto!(nome)
      break
    case 'alimentar':
      for (let n = 0; n < 30 && !st.done; n++) stage().interact!.plano!.onAlimentar!()
      break
    case 'apontar':
      stage().interact!.grafico!.onItem!((ok.barra ?? ok.setor ?? ok.ponto) as number)
      break
    case 'ajustar':
      stage().interact!.grafico!.onAjuste!(ok.valor as number)
      stage().interact!.grafico!.onSolta!()
      break
    case 'ordenar':
      for (const i of ordemFila(ativoDe(card.visual.estado as DadosState))) stage().interact!.dados!.onPonto!(i)
      break
    case 'equilibrar':
      stage().interact!.dados!.onFulcro!(media(ativoDe(card.visual.estado as DadosState)))
      stage().interact!.dados!.onSolta!()
      break
    case 'achar': {
      const vals = ativoDe(card.visual.estado as DadosState)
      const alvo = (ok.mediana ?? ok.moda ?? ok.valor) as number
      const d = stage().interact!.dados!
      if (d.onPonto) d.onPonto(ordemFila(vals)[meioDaFila(vals.length)[0]])
      else d.onValor!(alvo)
      break
    }
    case 'ramificar':
      for (let n = 0; n < 6 && !st.done; n++) stage().interact!.contagem!.onRamo!()
      break
    case 'favoraveis':
      for (const i of favoraveisDoCard(card).fav) {
        const it = stage().interact!
        ;(it.contagem ?? it.sorteio)!.onCaso!(i)
      }
      break
    case 'jogar':
      for (let n = 0; n < 200 && !st.done; n++) stage().interact!.sorteio!.onJogar!(10)
      break
    case 'partir':
      for (let n = 0; n < 10 && !st.done; n++) {
        const b = stage().interact!.barra!
        b.onSplit!(b.ativa ?? 0)
      }
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
    if (kindOf(card) === 'revelar') expect(card.acao.sucesso.reveladas).toBe(revelaveis(card.visual.estado as LadosArea).length)
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

const retangulo = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'retangulo', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa
const livre = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'livre', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa do retângulo com monômios', () => {
  const revelar = retangulo({ base: ['x', 3], altura: ['x', 2], revelar: true, total: 'x² + 5x + 6', somaTermos: true }, { reveladas: 4 })
  const dividir = retangulo({ base: ['2x', 3], altura: ['3x'], areas: [['6x²', '9x']], oculto: 'base', revelar: true }, { reveladas: 2 })

  test('revelar é jogável', () => {
    for (const card of [revelar, dividir, retangulo({ base: ['x²', '−3x', 1], altura: ['2x'], revelar: true }, { reveladas: 3 })]) {
      expect(kindOf(card)).toBe('revelar')
      const st = play(card)
      expect(st.done).toBe(true)
      expect(st.wrong).toBe(0)
      expect(st.order).toHaveLength(card.acao.sucesso.reveladas as number)
      expect(solveMexa(card, initMexa(card)).order).toEqual(revelaveis(card.visual.estado as LadosArea))
    }
  })

  test('cada toque descobre uma parte; tocar de novo não conta', () => {
    let st = initMexa(revelar)
    const tap = (k: string, i: number, j: number) => mexaStage(revelar, st, (s) => (st = s)).interact!.retangulo!.onRevelar!(k, i, j)
    tap('0-1', 0, 1)
    tap('0-1', 0, 1)
    expect(st.order).toEqual(['0-1'])
    expect(mexaStage(revelar, st, () => {}).visual.estado.destaque).toEqual([0, 1])
    tap('0-0', 0, 0)
    tap('1-0', 1, 0)
    expect(st.done).toBe(false)
    tap('1-1', 1, 1)
    expect(st.done).toBe(true)
    expect(mexaStage(revelar, st, () => {}).interact!.retangulo!.onRevelar).toBeUndefined()
  })

  test('no lado oculto, um toque em qualquer parte da coluna descobre o lado', () => {
    let st = initMexa(dividir)
    mexaStage(dividir, st, (s) => (st = s)).interact!.retangulo!.onRevelar!('b1', 0, 1)
    expect(st.order).toEqual(['b1'])
  })
})

describe('Mexa dos azulejos: virar', () => {
  const virar = livre({ azulejos: { pecas: ['x²', 'x', 'x', 'x²', '−x', '−x', '−x', '1'], montes: [3, 5], virar: 1 } }, { virado: true })

  test('virar é jogável e troca o sinal do monte', () => {
    expect(kindOf(virar)).toBe('virar')
    const st = play(virar)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    const az = mexaStage(virar, st, () => {}).visual.estado.azulejos as { pecas: string[]; montes: number[]; virar: number; virado: boolean }
    expect(az.virado).toBe(true)
    expect(pecasViradas(az.pecas, az.montes, az.virar, az.virado)).toEqual(['x²', 'x', 'x', '−x²', 'x', 'x', 'x', '−1'])
    expect(solveMexa(virar, initMexa(virar)).done).toBe(true)
  })
})

describe('Mexa dos azulejos: fatorar', () => {
  const fatorar = (b: number, c: number, fatorado: [number, number], extra: Record<string, unknown> = {}) => livre({ azulejos: { fatorar: [b, c], ...extra } }, { fatorado })

  test('fatorar é jogável: x² + 5x + 6, x² + 7x + 12, x² + 4x + 4, x² + 7x + 6', () => {
    for (const [b, c, f] of [[5, 6, [2, 3]], [7, 12, [3, 4]], [4, 4, [2, 2]], [7, 6, [1, 6]], [8, 12, [6, 2]]] as [number, number, [number, number]][]) {
      const card = fatorar(b, c, f)
      expect(kindOf(card)).toBe('fatorar')
      const st = play(card)
      expect(st.done).toBe(true)
      expect(st.wrong).toBe(0)
      const az = mexaStage(card, st, () => {}).visual.estado.azulejos as { arranjo: [number, number] }
      expect([...az.arranjo].sort((x, y) => x - y)).toEqual([...f].sort((x, y) => x - y))
      expect(solveMexa(card, initMexa(card)).done).toBe(true)
      expect(solveMexa(card, initMexa(card)).pick).toBe(st.pick)
    }
  })

  test('cada toque tenta o próximo par; o que não fecha diz o que falta ou sobra', () => {
    const card = fatorar(5, 6, [3, 2])
    let st = initMexa(card)
    const tap = () => mexaStage(card, st, (s) => (st = s)).interact!.livre!.onArrumar!()
    expect(mexaStage(card, st, () => {}).visual.estado.azulejos).not.toHaveProperty('arranjo', expect.anything())
    tap()
    expect((mexaStage(card, st, () => {}).visual.estado.azulejos as { arranjo: number[] }).arranjo).toEqual([1, 6])
    expect(st.done).toBe(false)
    expect(st.wrong).toBe(0)
    expect(st.note).toBe('1 + 6 = 7 barras, mas você tem 5: faltam 2 barras. Toque de novo.')
    tap()
    expect(st.done).toBe(true)
    expect(st.note).toBeUndefined()
    expect(mexaStage(card, st, () => {}).interact!.livre!.onArrumar).toBeUndefined()

    const sobra = fatorar(7, 6, [1, 6], { arranjo: [2, 3] })
    let s2 = initMexa(sobra)
    expect(s2.pick).toBe(1)
    const tap2 = () => mexaStage(sobra, s2, (s) => (s2 = s)).interact!.livre!.onArrumar!()
    tap2()
    expect(s2.done).toBe(true)
  })

  test('sem par que feche, ou com o par errado, não é um Mexa fatorar', () => {
    expect(kindOf(fatorar(5, 7, [1, 7]))).toBe('mostre')
    expect(kindOf(fatorar(5, 6, [1, 6]))).toBe('mostre')
  })
})

describe('Mexa do recorte: mover', () => {
  const mover = retangulo({ recorte: 3, mover: true }, { movido: true })

  test('mover é jogável e deixa o retângulo (x + 3)(x − 3)', () => {
    expect(kindOf(mover)).toBe('mover')
    expect(mexaStage(mover, initMexa(mover), () => {}).visual.estado.movido).toBe(false)
    const st = play(mover)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    const v = mexaStage(mover, st, () => {}).visual.estado
    expect(v.movido).toBe(true)
    expect(v).not.toHaveProperty('mover')
    expect(mexaStage(mover, st, () => {}).interact!.retangulo!.onMover).toBeUndefined()
    expect(solveMexa(mover, initMexa(mover)).done).toBe(true)
  })

  test('sem mover: true, o recorte é só um desenho', () => {
    expect(kindOf(retangulo({ recorte: 3 }, { movido: true }))).toBe('mostre')
  })
})

const balanca = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'balanca', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa da balança', () => {
  const tirar = balanca({ esquerda: { x: 3, n: 2 }, direita: { x: 1, n: 10 }, tirar: true }, { esquerda: { x: 2 }, direita: { n: 8 } })

  test('as contas da balança', () => {
    expect(valorInferido({ x: 2, n: 3 }, { n: 11 })).toBe(4)
    expect(valorInferido({ x: 3, n: 2 }, { x: 1, n: 10 })).toBe(4)
    expect(inclinacaoDe({ x: 1, n: 2 }, { n: 9 }, 3)).toBe('direita')
    expect(inclinacaoDe({ x: 1, n: 2 }, { n: 9 })).toBe('equilibrio')
    expect(inclinacaoDe({ x: 1 }, { n: 9 }, 3, 'esquerda')).toBe('esquerda')
    expect(equacaoDe({ x: 2, n: 3 }, { x: 0, n: 11 })).toBe('2x + 3 = 11')
    expect(equacaoDe({ x: 1, n: 0 }, { x: 0, n: 7 }, 'a', 'direita', true)).toBe('a < 7')
    // More than 20 units become weights of 10 and the rest.
    expect(pecasDe({ n: 37 }, 'direita').map((p) => p.valor)).toEqual([10, 10, 10, 1, 1, 1, 1, 1, 1, 1])
    expect(pecasDe({ x: 2, n: 8 }, 'esquerda', 2).filter((p) => p.grupo === 1).length).toBe(5)
  })

  test('tirar e dividir são jogáveis', () => {
    for (const card of [tirar, balanca({ esquerda: { x: 2, n: 3 }, direita: { n: 11 }, valor: 4, tirar: true }, { esquerda: { x: 2 }, direita: { n: 8 } }), balanca({ esquerda: { x: 3 }, direita: { n: 12 }, dividir: 3 }, { dividido: true })]) {
      expect(kindOf(card)).not.toBe('mostre')
      const st = play(card)
      expect(st.done).toBe(true)
      expect(st.wrong).toBe(0)
      expect(solveMexa(card, initMexa(card)).done).toBe(true)
    }
  })

  test('tirar de um lado só inclina; do outro, volta ao equilíbrio', () => {
    let st = initMexa(tirar)
    const tap = (id: string) => mexaStage(tirar, st, (s) => (st = s)).interact!.balanca!.onPeca!(id)
    tap('esquerda:1:0')
    expect(st.note).toMatch(/inclinou/)
    expect(st.wrong).toBe(0)
    tap('direita:1:0')
    expect(st.note).toBeUndefined()
    expect(st.done).toBe(false)
  })

  test('tirar uma peça que tem de ficar é erro', () => {
    let st = initMexa(tirar)
    const tap = (id: string) => mexaStage(tirar, st, (s) => (st = s)).interact!.balanca!.onPeca!(id)
    tap('esquerda:x:0')
    tap('direita:x:0')
    tap('esquerda:x:1')
    expect(st.wrong).toBe(1)
    expect(st.note).toMatch(/caixa fica/)
    expect(st.order).toEqual(['esquerda:x:0', 'direita:x:0'])
  })
})

const figura = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'figura', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa da figura', () => {
  const medir = figura({ angulo: { graus: 60 }, transferidor: true }, { graus: 60 })
  const cartoes: [string, Mexa][] = [
    ['medir', medir],
    ['medir com pontos', figura({ pontos: { V: [0, 0], A: [4, 0], C: [-1, 1] }, angulo: { vertice: 'V', de: 'A', ate: 'C' }, transferidor: true }, { graus: 135 })],
    ['medir invertido', figura({ angulo: { graus: 50, inicio: 180 }, transferidor: { invertido: true } }, { graus: 50 })],
    ['juntar', figura({ poligono: { vertices: [[0, 0], [6, 0], [2, 4]], angulos: true }, juntar: true }, { cantos: 3 })],
    ['juntar (juntados)', figura({ poligono: [[0, 0], [5, 0], [1, 3]], juntar: true }, { juntados: true })],
    ['contorno', figura({ poligono: { vertices: [[0, 0], [5, 0], [5, 4], [0, 4]], lados: ['5 cm', '4 cm', '5 cm', '4 cm'] }, unidade: 'cm', contorno: true }, { perimetro: 18 })],
    ['recortar', figura({ grade: true, poligono: [[0, 0], [6, 0], [8, 3], [2, 3]], recortar: true }, { recortado: true })],
    ['desenrolar', figura({ circulo: { raio: 1, diametroVisivel: true }, desenrolar: true }, { desenrolado: true })],
    ['encaixar', figura({ poligono: [[0, 0], [4, 0], [0, 3]], quadradosNosLados: true, encaixar: true }, { encaixado: true })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('as contas da figura', () => {
    expect(anguloInterno([[0, 0], [4, 0], [0, 3]], 0)).toBeCloseTo(90)
    const tri: Vec[] = [[0, 0], [6, 0], [2, 4]]
    expect([0, 1, 2].reduce((s, i) => s + anguloInterno(tri, i), 0)).toBeCloseTo(180)
    // Clockwise vertices give the same interior angles.
    expect(anguloInterno([[0, 0], [2, 4], [6, 0]], 0)).toBeCloseTo(anguloInterno(tri, 0))
    expect(grausMedir({ pontos: { V: [0, 0], A: [3, 0], C: [-1, 1] }, angulo: { vertice: 'V', de: 'A', ate: 'C' } })).toBe(135)
    expect(leituraTransferidor(60, 'dentro')).toBe(60)
    expect(leituraTransferidor(60, 'fora')).toBe(120)
    expect(leituraTransferidor(60, 'fora', true)).toBe(60)
    expect(valorDeMedida('2,5 m')).toBe(2.5)
    expect(valorDeMedida('1.200 m')).toBe(1200)
    const ret = poligonosDe({ poligono: { vertices: [[0, 0], [5, 0], [5, 4], [0, 4]] } })[0]
    expect(perimetroDe(ret)).toBe(18)
    expect(somaTexto(ladosValores(ret), [0, 1], 'cm')).toBe('5 + 4')
    expect(somaTexto(ladosValores(ret), [0, 1, 2, 3], 'cm')).toBe('5 + 4 + 5 + 4 = 18 cm')
    // The parallelogram 6 × 3 becomes a rectangle with the same 18 squares.
    const r = recortePadrao([[0, 0], [6, 0], [8, 3], [2, 3]])!
    expect(r.mover).toEqual([6, 0])
    expect(r.pedaco).toEqual([[0, 0], [2, 0], [2, 3]])
    expect(recortePadrao([[2, 0], [8, 0], [6, 3], [0, 3]])!.mover).toEqual([-6, 0])
    expect(recortePadrao([[0, 0], [6, 0], [6, 3], [0, 3]])).toBeUndefined()
    // 3-4-5: 9 + 16 squares fill the 25.
    const pg = pitagorasDe([[0, 0], [4, 0], [0, 3]])!
    expect(pg.reto).toBe(0)
    expect(pg.lados[pg.hipotenusa]).toBeCloseTo(5)
    const enc = encaixeDe([[0, 0], [4, 0], [0, 3]])!
    expect(enc.origem.map((c) => c.length)).toEqual([9, 16])
    expect(enc.alvo.map((c) => c.length)).toEqual([9, 16])
    expect(encaixeDe([[0, 0], [2, 0], [0, 3]])).toBeUndefined()
    expect(quadradoNoLado([0, 0], [4, 0], [1, 1])).toEqual([[0, 0], [4, 0], [4, -4], [0, -4]])
    const na = cantosNaReta([60, 70, 50], [2, 0, 1])
    expect(na.get(2)).toEqual({ de: 130, ate: 180 })
    expect(na.get(1)).toEqual({ de: 0, ate: 70 })
  })

  test('ler a escala de fora é o erro comum', () => {
    let st = initMexa(medir)
    const tap = (d: number, e: 'dentro' | 'fora') => mexaStage(medir, st, (s) => (st = s)).interact!.figura!.onEscala!(d, e)
    tap(60, 'fora')
    expect(st.done).toBe(false)
    expect(st.wrong).toBe(1)
    expect(st.note).toMatch(/escala de fora/)
    tap(90, 'dentro')
    expect(st.note).toMatch(/outro lado/)
    tap(60, 'dentro')
    expect(st.done).toBe(true)
  })

  test('o contorno soma na ordem dos toques e só termina com todos os lados', () => {
    const card = cartoes.find(([t]) => t === 'contorno')![1]
    let st = initMexa(card)
    const tap = (i: number) => mexaStage(card, st, (s) => (st = s)).interact!.figura!.onLado!(i)
    tap(2)
    tap(2)
    tap(0)
    expect(st.order).toEqual(['2', '0'])
    expect(st.done).toBe(false)
    expect(mexaStage(card, st, () => {}).visual.estado).toMatchObject({ acesos: [2, 0], soma: true })
  })
})

const solido = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'solido', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa do sólido', () => {
  const pintar = solido({ comprimento: 4, largura: 3, altura: 2, unidade: 'cm', pintar: true }, { area: 52 })
  const cartoes: [string, Mexa][] = [
    ['abrir a caixa', solido({ comprimento: 4, largura: 3, altura: 2, abrir: true }, { aberto: true })],
    ['abrir o cilindro', solido({ solido: 'cilindro', raio: 2, altura: 5, abrir: true }, { aberto: true })],
    ['abrir o prisma', solido({ solido: 'prisma', comprimento: 6, largura: 4, altura: 5, abrir: true }, { aberto: true })],
    ['empilhar', solido({ comprimento: 4, largura: 3, altura: 2, empilhar: true }, { camadas: 2 })],
    ['empilhar da base', solido({ comprimento: 4, largura: 3, altura: 3, baseCheia: true, empilhar: true }, { camadas: 3 })],
    ['empilhar discos', solido({ solido: 'cilindro', raio: 2, altura: 4, empilhar: true }, { camadas: 4 })],
    ['pintar a caixa fechada', pintar],
    ['pintar o cubo aberto', solido({ solido: 'cubo', aresta: 3, aberto: true, pintar: true }, { area: 54 })],
    ['pintar o cilindro', solido({ solido: 'cilindro', raio: 1, altura: 2, pintar: true }, { area: 18.84 })],
    ['pintar o prisma', solido({ solido: 'prisma', comprimento: 6, largura: 4, altura: 10, aberto: true, pintar: true }, { area: 184 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('as contas do sólido', () => {
    const caixa = dimsDe({ comprimento: 4, largura: 3, altura: 2 })
    expect(partesDe('caixa').map((p) => areaDe(caixa, p))).toEqual([8, 6, 12, 6, 8, 12])
    expect(areaTotal(caixa)).toBe(52)
    expect(areaTotal(dimsDe({ solido: 'cubo', aresta: 3 }))).toBe(54)
    // Cylinder: 2 × 3,14 × 1² + 2 × 3,14 × 1 × 2.
    expect(areaTotal(dimsDe({ solido: 'cilindro', raio: 1, altura: 2 }))).toBe(18.84)
    // Prism with the 6-4 triangle: sides 5 and 5.
    const pr = dimsDe({ solido: 'prisma', comprimento: 6, largura: 4, altura: 10 })
    expect(partesDe('prisma').map((p) => areaDe(pr, p))).toEqual([60, 50, 12, 50, 12])
    expect(somaFaces(caixa, ['frente', 'topo'])).toBe('8 + 12')
    expect(somaFaces(caixa, partesDe('caixa'), 'cm')).toBe('8 + 6 + 12 + 6 + 8 + 12 = 52 cm²')
    expect(contagemTexto({ baseCheia: true }, caixa, 1)).toBe('4 × 3 = 12 cubinhos')
    expect(contagemTexto({}, caixa, 2)).toBe('2 camadas de 12 = 24')
    expect(contagemTexto({ unidade: 'cm' }, caixa, 1)).toBe('1 camada de 12 = 12 cm³')
    expect(contagemTexto({ solido: 'cilindro' }, dimsDe({ solido: 'cilindro', raio: 2 }), 3)).toBe('3 camadas de 12,56 = 37,68')
    expect(facesVisiveis({})).toEqual(['frente', 'direita', 'topo'])
    expect(facesVisiveis({ solido: 'cilindro' })).toEqual(['topo', 'lateral'])
    expect(facesVisiveis({ solido: 'prisma' })).toEqual(['frente', 'direita', 'topo'])
    expect(cameraDe('caixa', 1)).toEqual({ th: 0, ph: 0 })
  })

  test('a planificação dobra no sólido', () => {
    const perto = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6))
    // The box: closed, every corner is a corner of the 4 × 3 × 2 box; open, it is the net, flat.
    const caixa = dimsDe({ comprimento: 4, largura: 3, altura: 2 })
    const fechada = facesDe(caixa, 1).faces
    for (const f of fechada) for (const p of f.pts) perto([[0, 4], [0, 3], [0, 2]].map(([a, b], i) => (Math.abs(p[i] - a) < 1e-6 ? a : b)), p)
    const tras = fechada.find((f) => f.id === 'tras')!
    tras.pts.forEach((p) => expect(p[1]).toBeCloseTo(3))
    perto(tras.n, [0, 1, 0])
    perto(fechada.find((f) => f.id === 'topo')!.n, [0, 0, 1])
    const aberta = dobrar(planificacao(caixa), 0).faces
    for (const f of aberta) f.pts.forEach((p) => expect(p[1]).toBeCloseTo(0))
    // The prism: the top triangle closes at the height, with its back corner at (3, 4).
    const pr = facesDe(dimsDe({ solido: 'prisma', comprimento: 6, largura: 4, altura: 5 }), 1).faces
    const topo = pr.find((f) => f.id === 'topo')!
    perto(topo.pts[2], [3, 4, 5])
    for (const id of ['direita', 'esquerda']) {
      const f = pr.find((x) => x.id === id)!
      expect(f.pts.some((p) => Math.abs(p[0] - 3) < 1e-6 && Math.abs(p[1] - 4) < 1e-6)).toBe(true)
    }
    // The cylinder: the strips close around the axis, and the top disk lies on them.
    const r = 2
    const ci = facesDe(dimsDe({ solido: 'cilindro', raio: r, altura: 3 }), 1).faces
    const lat = ci.filter((f) => f.parte === 'lateral')
    expect(lat.length).toBe(TIRAS)
    for (const f of lat) for (const p of f.pts) expect(Math.hypot(p[0], p[1] - r)).toBeCloseTo(r, 1)
    for (const p of ci.find((f) => f.id === 'topo')!.pts) {
      expect(p[2]).toBeCloseTo(3)
      expect(Math.hypot(p[0], p[1] - r)).toBeCloseTo(r)
    }
    // Open, the side is a rectangle of width 2πr.
    const xs = facesDe(dimsDe({ solido: 'cilindro', raio: r, altura: 3 }), 0).faces.filter((f) => f.parte === 'lateral').flatMap((f) => f.pts.map((p) => p[0]))
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(2 * Math.PI * r)
  })

  test('pintar soma as áreas na ordem dos toques; a caixa fechada se abre quando as faces à vista estão pintadas', () => {
    let st = initMexa(pintar)
    const stage = () => mexaStage(pintar, st, (s) => (st = s))
    const tap = (p: string) => stage().interact!.solido!.onFace!(p)
    tap('topo')
    tap('topo')
    tap('frente')
    expect(st.order).toEqual(['topo', 'frente'])
    expect(stage().visual.estado).toMatchObject({ pintadas: ['topo', 'frente'], soma: true })
    expect(stage().visual.estado.aberto).toBeUndefined()
    tap('direita')
    expect(stage().visual.estado.aberto).toBe(true)
    for (const p of ['base', 'tras', 'esquerda']) tap(p)
    expect(st.done).toBe(true)
    expect(somaFaces(dimsDe(pintar.visual.estado as SolidoState), st.order!, 'cm')).toBe('12 + 8 + 6 + 12 + 8 + 6 = 52 cm²')
  })

  test('empilhar para na altura pedida', () => {
    const card = cartoes.find(([t]) => t === 'empilhar')![1]
    let st = initMexa(card)
    const stage = () => mexaStage(card, st, (s) => (st = s))
    expect(stage().visual.estado.camadas).toBe(0)
    stage().interact!.solido!.onToque!()
    expect(st.done).toBe(false)
    expect(stage().visual.estado.camadas).toBe(1)
    stage().interact!.solido!.onToque!()
    expect(st.done).toBe(true)
    expect(stage().interact!.solido!.onToque).toBeUndefined()
  })
})

const plano = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'plano', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa
const grafico = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'grafico', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa do plano', () => {
  const marcar = plano({ x: [-5, 5], y: [-5, 5], pontos: { A: [3, 2] } }, { ponto: [3, 2] })
  const luz = plano({ maquina: { regra: '× 0,80 + 15', entradas: [0, 100, 200, 300], rotulos: ['kWh', 'R$'] }, x: { de: 0, ate: 300, passo: 50, rotulo: 'kWh' }, y: { de: 0, ate: 300, passo: 50, rotulo: 'R$' } }, { saidas: 4 })
  const cartoes: [string, Mexa][] = [
    ['marcar', marcar],
    ['marcar vários', plano({ x: [-5, 5], y: [-5, 5], quadrantes: true }, { pontos: [[-2, 3], [-4, -1], [2, -3]] })],
    ['ler um', plano({ pontos: { A: [2, 3], B: [-3, 1] } }, { lido: 'B' })],
    ['ler todos', plano({ pontos: { A: [2, 3], B: [-3, 1], C: [0, -2] } }, { lidos: 3 })],
    ['alimentar', luz],
    ['alimentar sem plano', plano({ maquina: { a: 2, b: 1, entradas: [1, 2, 3] } }, { saidas: 3 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('as contas do plano', () => {
    expect(coordTexto([3, 2])).toBe('(3, 2)')
    expect(coordTexto([-1, -4])).toBe('(−1, −4)')
    expect(coordTexto([2.5, 3])).toBe('(2,5; 3)')
    expect([quadranteDe([3, 2]), quadranteDe([-3, 2]), quadranteDe([-3, -2]), quadranteDe([3, -2]), quadranteDe([0, 2])]).toEqual([1, 2, 3, 4, 0])
    expect(passosDaRegra('× 0,80 + 15')).toEqual([['×', 0.8], ['+', 15]])
    expect(aplicarRegra('× 0,80 + 15', 150)).toBe(135)
    expect(aplicarRegra('÷ 2 − 1', 10)).toBe(4)
    expect(aplicarRegra('²', -3)).toBe(9)
    expect(aplicarRegra('1.000 + x', 2)).toBeUndefined()
    expect(aplicarRegra('+ 1.000', 2)).toBe(1002)
    expect(regraTexto(2, 1)).toBe('× 2 + 1')
    expect(regraTexto(1, -3)).toBe('− 3')
    expect(paresDaMaquina({ a: 3, entradas: [1, 2, 3] }, 2)).toEqual([[1, 3], [2, 6], [3, undefined]])
    expect(paresDaMaquina({ regra: '× 2', saidas: [null as unknown as number, 'muito'], entradas: [1, 2] }, 2)).toEqual([[1, 2], [2, 'muito']])
    const ex = eixoDe({}, 'x')
    expect([ex.de, ex.ate, ex.passo, ex.rotulo]).toEqual([-5, 5, 1, 'x'])
    // Only positive data: the axis starts at 0 and has room for the biggest.
    const ey = eixoDe({ pontos: [[1, 40], [2, 80], [3, 120]] }, 'y')
    expect(ey.de).toBe(0)
    expect(ey.ate).toBeGreaterThanOrEqual(120)
    expect(ey.passo).toBe(20)
    expect(eixoDe({ pontos: { A: [-3, 2] } }, 'x').de).toBeLessThan(-3)
    expect(encaixar([2.6, -1.2], ex, ex)).toEqual([3, -1])
    expect(encaixar([9, 9], ex, ex)).toEqual([5, 5])
    // y = 2x inside −5..5: from (−2,5; −5) to (2,5; 5).
    expect(retaNoQuadro({ a: 2 }, ex, ex, undefined)).toEqual([[-2.5, -5], [2.5, 5]])
    expect(retaNoQuadro({ a: 2, de: 0 }, ex, ex, undefined)).toEqual([[0, 0], [2.5, 5]])
    expect(retaNoQuadro({ a: 0, b: 9 }, ex, ex, undefined)).toBeUndefined()
    expect(retaNoQuadro({ por: [[2, -5], [2, 1]] }, ex, ex, undefined)).toEqual([[2, -5], [2, 5]])
    expect(retaTexto({ a: 2 }, undefined)).toBe('y = 2x')
    expect(retaTexto({ a: 0.8, b: 15 }, undefined)).toBe('y = 0,8x + 15')
    expect(retaTexto({ a: -1, b: -3 }, undefined)).toBe('y = −x − 3')
    expect(retaTexto({ por: ['A', 'B'] }, { A: [0, 1], B: [2, 5] })).toBe('y = 2x + 1')
  })

  test('marcar: trocar x e y e errar o sinal têm aviso próprio', () => {
    let st = initMexa(marcar)
    const stage = () => mexaStage(marcar, st, (s) => (st = s))
    // The named point at the target stays hidden until it is marked.
    expect((stage().visual.estado as PlanoState).pontos).toEqual({})
    stage().interact!.plano!.onMarcar!([2, 3])
    expect(st.wrong).toBe(1)
    expect(st.note).toMatch(/trocou x e y/)
    expect(stage().interact!.plano!.errado).toEqual([2, 3])
    stage().interact!.plano!.onMarcar!([-3, 2])
    expect(st.note).toMatch(/sinais/)
    stage().interact!.plano!.onMarcar!([1, 1])
    expect(st.note).toMatch(/primeiro no x/)
    stage().interact!.plano!.onMarcar!([3, 2])
    expect(st.done).toBe(true)
    expect(stage().interact!.plano!.marcados).toEqual([[3, 2]])
    expect((stage().visual.estado as PlanoState).pontos).toEqual({ A: [3, 2] })
  })

  test('ler: tocar no ponto errado mostra quem ele é', () => {
    const card = cartoes.find(([t]) => t === 'ler um')![1]
    let st = initMexa(card)
    mexaStage(card, st, (s) => (st = s)).interact!.plano!.onPonto!('A')
    expect(st.done).toBe(false)
    expect(st.note).toBe('Esse é o A (2, 3). Procure o ponto pedido.')
  })

  test('alimentar: cada toque põe um número, e a máquina para no último', () => {
    let st = initMexa(luz)
    const stage = () => mexaStage(luz, st, (s) => (st = s))
    stage().interact!.plano!.onAlimentar!()
    expect((stage().visual.estado.maquina as { feitas: number }).feitas).toBe(1)
    expect(paresDaMaquina(stage().visual.estado.maquina as PlanoState['maquina'] & object)).toEqual([[0, 15], [100, undefined], [200, undefined], [300, undefined]])
    for (let i = 0; i < 3; i++) stage().interact!.plano!.onAlimentar!()
    expect(st.done).toBe(true)
    expect(stage().interact!.plano!.onAlimentar).toBeUndefined()
    expect(paresDaMaquina(stage().visual.estado.maquina as PlanoState['maquina'] & object).map((p) => p[1])).toEqual([15, 95, 175, 255])
  })
})

describe('Mexa do gráfico', () => {
  const vendas = { dados: [['jan', 92], ['fev', 95], ['mar', 98]], eixoInicio: 90 }
  const cartoes: [string, Mexa][] = [
    ['apontar a barra', grafico(vendas, { barra: 2 })],
    ['apontar o ponto', grafico({ tipo: 'linhas', dados: [['seg', 3], ['ter', 7], ['qua', 5]] }, { ponto: 1 })],
    ['apontar a fatia', grafico({ tipo: 'setores', dados: [['aluguel', 50], ['comida', 30], ['outros', 20]] }, { setor: 1 })],
    ['ajustar', grafico({ dados: [['jan', 40], ['fev', 0]], ativa: 1 }, { valor: 60 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('as contas do gráfico', () => {
    // The cut axis: 92 and 98 look like 1 and 4 times; from 0, almost the same.
    const cortado = escalaDe(vendas as GraficoState)
    expect(cortado.de).toBe(90)
    expect(cortado.pos(98) / cortado.pos(92)).toBeCloseTo(4)
    const honesta = escalaDe(vendas as GraficoState, true)
    expect(honesta.de).toBe(0)
    expect(honesta.pos(98) / honesta.pos(92)).toBeCloseTo(98 / 92)
    expect(escalaDe({ dados: [['a', 37]] }).marcas).toEqual([0, 10, 20, 30, 40])
    // The crooked scale: the marks are evenly spaced on the screen.
    const torta = escalaDe({ dados: [['a', 30]], escala: [0, 10, 20, 50, 100] })
    expect(torta.pos(10)).toBeCloseTo(0.25)
    expect(torta.pos(35)).toBeCloseTo(0.625)
    expect(torta.valorEm(0.625)).toBeCloseTo(35)
    expect(porcentagensDe([1, 1, 1])).toEqual([34, 33, 33])
    expect(porcentagensDe([50, 30, 20])).toEqual([50, 30, 20])
    expect(setoresDe([1, 3]).map((x) => x.ate)).toEqual([90, 360])
    expect(valorTexto({ antes: 'R$ ' }, 1250.5)).toBe('R$ 1.250,5')
    // Marks of 20 in 20; the step halves so the target 50 can be reached.
    expect(ajustarValor({ dados: [['a', 40]], eixoFim: 100 }, 47)).toBe(40)
    expect(ajustarValor({ dados: [['a', 40]], eixoFim: 100 }, 47, 50)).toBe(50)
    expect(ajustarValor({ dados: [['a', 40]], eixoFim: 100, ajustePasso: 2 }, 47)).toBe(48)
    expect(ajustarValor({ dados: [['a', 40]], eixoFim: 100 }, 900)).toBe(100)
    // The axis of the drag holds the target and does not move.
    expect(eixoDoAjuste({ dados: [['a', 40], ['b', 0]] }, 60)).toBe(80)
  })

  test('apontar a barra errada é erro; a certa acende', () => {
    const card = cartoes[0][1]
    let st = initMexa(card)
    const stage = () => mexaStage(card, st, (s) => (st = s))
    stage().interact!.grafico!.onItem!(0)
    expect(st.wrong).toBe(1)
    expect(stage().interact!.grafico!.errado).toBe(0)
    stage().interact!.grafico!.onItem!(2)
    expect(st.done).toBe(true)
    expect(stage().visual.estado.destaque).toBe(2)
  })

  test('ajustar só confere ao soltar', () => {
    const card = cartoes[3][1]
    let st = initMexa(card)
    const stage = () => mexaStage(card, st, (s) => (st = s))
    expect(st.drag).toBe(0)
    stage().interact!.grafico!.onAjuste!(38)
    expect((stage().visual.estado.dados as [string, number][])[1]).toEqual(['fev', 40])
    stage().interact!.grafico!.onSolta!()
    expect(st.wrong).toBe(1)
    stage().interact!.grafico!.onAjuste!(61)
    stage().interact!.grafico!.onSolta!()
    expect(st.done).toBe(true)
  })
})

const dados = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'dados', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa
const contagem = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'contagem', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa
const sorteio = (estado: Record<string, unknown>, sucesso: Record<string, unknown>): Mexa => ({ tipo: 'mexa', texto: '', visual: { modelo: 'sorteio', estado }, acao: { instrucao: '', sucesso } }) as unknown as Mexa

describe('Mexa dos dados', () => {
  const notas = [5, 7, 8, 6, 7, 9, 7, 6, 8, 4]
  const ordenar = dados({ valores: [7, 4, 9, 6, 8], mediana: true }, { ordenado: true })
  const equilibrar = dados({ valores: notas, fulcro: 4 }, { media: 6.7 })
  const mediana = dados({ valores: [3, 7, 4, 8, 4, 9, 10] }, { mediana: 7 })
  const filaPar = dados({ valores: [3, 8, 5, 6, 9, 4], fila: true }, { mediana: 5.5 })
  const moda = dados({ valores: [2, 3, 3, 5, 5, 6] }, { moda: 3 })
  const cartoes: [string, Mexa][] = [
    ['ordenar', ordenar],
    ['equilibrar', equilibrar],
    ['equilibrar com média que não cai na marca', dados({ valores: [6, 7, 9] }, { media: 22 / 3 })],
    ['achar a mediana', mediana],
    ['achar a mediana na fila (quantidade par)', filaPar],
    ['achar a moda', moda],
    ['achar o valor que destoa', dados({ valores: [2, 2, 2.5, 3, 3, 3.5, 30], unidade: 'mil R$' }, { valor: 30 })],
    ['dois conjuntos: o ativo recebe o toque', dados({ conjuntos: [{ nome: 'A', valores: [28, 30, 32] }, { nome: 'B', valores: [20, 30, 40, 42] }], ativo: 1, fulcro: 25 }, { media: 33 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('os formatos de sucesso', () => {
    expect(kindOf(ordenar)).toBe('ordenar')
    expect(kindOf(equilibrar)).toBe('equilibrar')
    expect(kindOf(mediana)).toBe('achar')
    expect(kindOf(moda)).toBe('achar')
    expect(kindOf(dados({}, { media: 3 }))).toBe('mostre')
  })

  test('ordenar: só o menor que falta vai para a fila', () => {
    let st = initMexa(ordenar)
    const stage = () => mexaStage(ordenar, st, (s) => (st = s))
    expect(stage().interact!.dados!.naFila).toEqual([])
    stage().interact!.dados!.onPonto!(0)
    expect(st.wrong).toBe(1)
    expect(st.note).toMatch(/do menor para o maior/)
    expect(stage().interact!.dados!.errado).toBe(0)
    stage().interact!.dados!.onPonto!(1)
    expect(stage().interact!.dados!.naFila).toEqual([1])
    expect(stage().interact!.dados!.errado).toBeNull()
    // The median shows only when the queue is complete.
    for (const i of [3, 0, 4, 2]) stage().interact!.dados!.onPonto!(i)
    expect(st.done).toBe(true)
    expect(stage().visual.estado.mediana).toBe(true)
  })

  test('equilibrar: confere ao soltar, diz para que lado ir e encaixa perto da média', () => {
    let st = initMexa(equilibrar)
    const stage = () => mexaStage(equilibrar, st, (s) => (st = s))
    expect(st.drag).toBe(4)
    expect(stage().visual.estado.fulcro).toBe(4)
    stage().interact!.dados!.onFulcro!(5.5)
    expect(st.done).toBe(false)
    stage().interact!.dados!.onSolta!()
    expect(st.wrong).toBe(1)
    expect(st.note).toMatch(/para a direita/)
    stage().interact!.dados!.onFulcro!(8.5)
    stage().interact!.dados!.onSolta!()
    expect(st.note).toMatch(/para a esquerda/)
    // A finger near 6,7 (6,55) lands on it.
    stage().interact!.dados!.onFulcro!(6.55)
    expect(st.drag).toBe(6.7)
    stage().interact!.dados!.onSolta!()
    expect(st.done).toBe(true)
    expect(stage().visual.estado.media).toBe(true)
  })

  test('achar: a média e a moda no lugar da mediana têm aviso próprio', () => {
    // 3, 4, 4, 7, 8, 9, 10: média 45 ÷ 7 ≈ 6,43; moda 4; mediana 7.
    let st = initMexa(mediana)
    const stage = () => mexaStage(mediana, st, (s) => (st = s))
    stage().interact!.dados!.onValor!(45 / 7)
    expect(st.note).toMatch(/ponto de equilíbrio, a média/)
    expect(stage().interact!.dados!.marcado?.certo).toBe(false)
    expect(stage().interact!.dados!.marcado?.v).toBeCloseTo(45 / 7)
    stage().interact!.dados!.onValor!(4)
    expect(st.note).toMatch(/pilha mais alta, a moda/)
    stage().interact!.dados!.onValor!(9.1)
    expect(st.note).toMatch(/Ponha os valores em fila/)
    expect(st.wrong).toBe(3)
    stage().interact!.dados!.onValor!(7.2)
    expect(st.done).toBe(true)
    expect(stage().visual.estado.mediana).toBe(true)
  })

  test('achar na fila: a mediana fica escondida até o toque certo; com duas modas, as duas valem', () => {
    let st = initMexa(filaPar)
    const stage = () => mexaStage(filaPar, st, (s) => (st = s))
    expect(stage().visual.estado.mediana).toBeUndefined()
    // 3, 4, 5, 6, 8, 9: o 4 (índice 5) não é do meio.
    stage().interact!.dados!.onPonto!(5)
    expect(st.note).toMatch(/meio da fila/)
    stage().interact!.dados!.onPonto!(3)
    expect(st.done).toBe(true)
    expect(stage().visual.estado.mediana).toBe(true)
    let sm = initMexa(moda)
    mexaStage(moda, sm, (s) => (sm = s)).interact!.dados!.onValor!(5)
    expect(sm.done).toBe(true)
  })
})

describe('Mexa da contagem', () => {
  const roupas = contagem({ arvore: [['azul', 'preta', 'branca'], ['jeans', 'social']], nomes: ['camisa', 'calça'] }, { etapas: 2 })
  const soma7 = contagem({ grade: { linhas: 6, colunas: 6, conteudo: 'soma' }, favoraveis: { soma: 7 }, chance: true, simplificada: true }, { favoraveis: 6 })
  const cartoes: [string, Mexa][] = [
    ['ramificar', roupas],
    ['ramificar a partir da primeira etapa', contagem({ arvore: [['a', 'b'], ['1', '2', '3'], ['x', 'y']], mostradas: 1 }, { etapas: 3 })],
    ['marcar as somas 7', soma7],
    ['marcar os pares iguais', contagem({ grade: { linhas: 6 }, favoraveis: { iguais: true } }, { favoraveis: 6 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('ramificar: cada toque abre uma etapa', () => {
    let st = initMexa(roupas)
    const stage = () => mexaStage(roupas, st, (s) => (st = s))
    expect(stage().visual.estado.mostradas).toBe(0)
    stage().interact!.contagem!.onRamo!()
    expect(stage().visual.estado.mostradas).toBe(1)
    expect(st.done).toBe(false)
    stage().interact!.contagem!.onRamo!()
    expect(st.done).toBe(true)
    expect(stage().interact!.contagem!.onRamo).toBeUndefined()
  })

  test('favoráveis: a casa que não serve diz quanto dá', () => {
    let st = initMexa(soma7)
    const stage = () => mexaStage(soma7, st, (s) => (st = s))
    stage().interact!.contagem!.onCaso!(0)
    expect(st.wrong).toBe(1)
    expect(st.note).toBe('Essa casa dá 1 + 1 = 2. Procure as que dão 7.')
    expect(stage().interact!.contagem!.errado).toBe(0)
    stage().interact!.contagem!.onCaso!(5)
    expect(stage().interact!.contagem!.marcados).toEqual([5])
    // Touching a lit cell again does nothing.
    stage().interact!.contagem!.onCaso!(5)
    expect(st.wrong).toBe(1)
    for (const i of [10, 15, 20, 25, 30]) stage().interact!.contagem!.onCaso!(i)
    expect(st.done).toBe(true)
  })

  test('um sucesso com a conta errada não fecha', () => {
    const errado = contagem({ grade: { linhas: 6, conteudo: 'soma' }, favoraveis: { soma: 7 } }, { favoraveis: 5 })
    expect(play(errado).done).toBe(false)
  })
})

describe('Mexa do sorteio', () => {
  const moeda = sorteio({ casos: 'moeda', jogadas: 0, semente: 3, curva: true }, { jogadas: 100 })
  const saco = sorteio({ bolas: { azul: 3, vermelha: 2 }, favoraveis: { cor: 'vermelha' }, chance: true }, { favoraveis: 2 })
  const cartoes: [string, Mexa][] = [
    ['jogar', moeda],
    ['jogar o dado mil vezes', sorteio({ casos: 'dado', jogadas: 0, botoes: [10, 100, 1000] }, { jogadas: 1000 })],
    ['marcar as bolas vermelhas', saco],
    ['marcar as faces pares', sorteio({ casos: 'dado', favoraveis: { valores: [2, 4, 6] }, chance: true }, { favoraveis: 3 })],
    ['marcar as cartas', sorteio({ casos: ['A', 'K', 'Q', 'J'], favoraveis: [0] }, { favoraveis: 1 })],
  ]

  test.each(cartoes)('%s é jogável', (_, card) => {
    expect(kindOf(card)).not.toBe('mostre')
    const st = play(card)
    expect(st.done).toBe(true)
    expect(st.wrong).toBe(0)
    expect(solveMexa(card, initMexa(card)).done).toBe(true)
  })

  test('jogar: as jogadas somam, e dá para continuar depois da meta', () => {
    let st = initMexa(moeda)
    const stage = () => mexaStage(moeda, st, (s) => (st = s))
    stage().interact!.sorteio!.onJogar!(1)
    stage().interact!.sorteio!.onJogar!(10)
    expect(stage().visual.estado.jogadas).toBe(11)
    expect(st.done).toBe(false)
    stage().interact!.sorteio!.onJogar!(100)
    expect(st.done).toBe(true)
    stage().interact!.sorteio!.onJogar!(100)
    expect(stage().visual.estado.jogadas).toBe(211)
    expect(st.done).toBe(true)
  })

  test('favoráveis: a bola de outra cor diz a cor', () => {
    let st = initMexa(saco)
    const stage = () => mexaStage(saco, st, (s) => (st = s))
    stage().interact!.sorteio!.onCaso!(0)
    expect(st.note).toBe('Essa bola é azul. Toque só nas vermelhas.')
    stage().interact!.sorteio!.onCaso!(3)
    stage().interact!.sorteio!.onCaso!(4)
    expect(st.done).toBe(true)
    let sd = initMexa(cartoes[3][1])
    mexaStage(cartoes[3][1], sd, (s) => (sd = s)).interact!.sorteio!.onCaso!(0)
    expect(sd.note).toBe('Esse é o 1. Procure 2, 4 ou 6.')
  })
})
