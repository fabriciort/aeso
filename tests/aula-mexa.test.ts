import { describe, expect, test } from 'vitest'
import { AULAS } from '@/content/matematica'
import type { Mexa } from '@/lib/formation/schema'
import { initMexa, kindOf, mexaStage, solveMexa, type MexaState } from '@/components/aula/mexa'
import { tipoDe } from '@/components/aula/visual/azulejos-pecas'
import { equacaoDe, inclinacaoDe, pecasDe, valorInferido } from '@/components/aula/visual/balanca-pratos'
import { areaDe, areaTotal, cameraDe, contagemTexto, dimsDe, dobrar, facesDe, facesVisiveis, partesDe, planificacao, somaTexto as somaFaces, TIRAS, type SolidoState } from '@/components/aula/visual/solido-geo'
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
