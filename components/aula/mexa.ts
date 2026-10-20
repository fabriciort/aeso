import type { Mexa, Visual } from '@/lib/formation/schema'
import { tipoDe } from './visual/azulejos-pecas'
import { avisoDoPar, mesmoPar, paresDeFatores, retanguloDe, type Par } from './visual/azulejos-retangulo'
import { completarDe } from './visual/azulejos-completar'
import { produtoZeroDe, raizesDe } from './visual/produto-zero'
import { revelaveis, type LadosArea } from './visual/monomio'
import { contaPecas, inclinacaoDe, ladoTexto, pecasDe, pratoDe, valorInferido, type Lado, type PecaBalanca, type Prato } from './visual/balanca-pratos'
import type { BarraLinha, BarraState } from './visual/Barra'
import { fmtNum, grausMedir, leituraTransferidor, perimetroDe, poligonosDe, transferidorDe, type FiguraState } from './visual/figura-geo'
import type { Ordem } from './visual/Blocos'
import type { GradeItem } from './visual/Grade'
import { ajustarValor, dadosDe, eixoDoAjuste, tipoDe as tipoGrafico, type GraficoState } from './visual/grafico-geo'
import { abcDaReta, coordTexto, cruzamentoDoPlano, eixoDe, encaixar, equacaoDa, letrasDoPlano, mesmoPonto, pontosDe, retaTexto, trocado, type PlanoState, type RetaPlano, type Vec } from './visual/plano-geo'
import { conferirTexto, paresNaGrade, satisfaz, sistemaDe, trocaDe } from './visual/sistema'
import { areaDe, camadasDe, dimsDe, facesVisiveis, partesDe, type SolidoState } from './visual/solido-geo'
import { ativoDe, eixoDados, encaixarFulcro, fulcroNaMedia, lerValor, media, mediana, meioDaFila, mesmo, modas, ordemFila, type DadosState } from './visual/dados-geo'
import { casosDaGrade, corCanonica, etapasDe, favoraveisDe, gradeDe, type Caso, type ContagemState } from './visual/contagem-geo'
import { casosDe, MAX_JOGADAS, resultadosDe, type SorteioState } from './visual/sorteio-geo'
import { lerCondicao, testarFeito, testesDaSolucao, tracosDaReta, type MetaTestar } from './visual/reta-intervalos'
import type { Interact } from './visual/Stage'

// O "Mexa": o aluno manipula o modelo até chegar ao estado de sucesso que o
// conteúdo descreve em dados. Cada tipo de manipulação é um pequeno jogo de
// regras: estado inicial, o que um toque faz, quando está feito e como fica
// resolvido ("Me mostre").

export type Kind = 'blocos' | 'digitos' | 'classes' | 'separar' | 'etiquetas' | 'vizinho' | 'deslizar' | 'ordem' | 'linhas' | 'cortar' | 'girar' | 'revelar' | 'virar' | 'fatorar' | 'completar' | 'zerar' | 'mover' | 'pintar' | 'partir' | 'grade' | 'medida' | 'tabela' | 'saldo' | 'azulejos' | 'tirar' | 'dividir' | 'medir' | 'juntar' | 'contorno' | 'recortar' | 'desenrolar' | 'encaixar' | 'abrir' | 'empilhar' | 'faces' | 'marcar' | 'ler' | 'alimentar' | 'apontar' | 'ajustar' | 'ordenar' | 'equilibrar' | 'achar' | 'ramificar' | 'favoraveis' | 'jogar' | 'pares' | 'cruzar' | 'somar' | 'trocar' | 'testar' | 'espelhar' | 'mostre'

export interface MexaState {
  kind: Kind
  counts?: Record<Ordem, number>
  /** Quadro: digit or class value per column / class. */
  slots?: (number | null)[]
  /** Cards still to place, and the selected one (index in tray). */
  tray?: number[]
  sel?: number | null
  seps?: number[]
  placed?: Record<number, number>
  pick?: number | null
  drag?: number
  order?: string[]
  /** Quadro de unidades: the unit the comma was put after. */
  casa?: string | null
  /** Increments on each wrong try (shakes the stage). */
  wrong: number
  /** Short feedback under the instruction. */
  note?: string
  done: boolean
  shown?: boolean
}

const ORDENS: Ordem[] = ['unidades', 'dezenas', 'centenas', 'milhares']
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
const arr = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : undefined)

export function kindOf(card: Mexa): Kind {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  switch (card.visual.modelo) {
    case 'blocos':
      return ORDENS.some((o) => o in ok) ? 'blocos' : 'mostre'
    case 'quadro-posicional':
      if (e.medida && typeof ok.para === 'string') return 'medida'
      if (arr(e.cartoes) && arr(e.classes) && arr(ok.grupos)) return 'classes'
      if (arr(e.algarismos) && arr<unknown[]>(ok.grupos)?.every(Array.isArray)) return 'separar'
      if (arr(e.algarismos) && num(ok.numero) !== undefined) return 'digitos'
      return 'mostre'
    case 'reta':
      if (testarOf(card)) return 'testar'
      if (ok.espelhado === true && e.espelhado !== true && (arr(e.numeros)?.length || arr(e.intervalos)?.length)) return 'espelhar'
      if (card.acao.tipo === 'deslizar' && num(ok.numero) !== undefined) return 'deslizar'
      if (num(ok.vizinho) !== undefined && arr(e.escolhas)) return 'vizinho'
      if (num(ok.posicao) !== undefined || arr(ok.posicoes)) return 'etiquetas'
      return 'mostre'
    case 'livre':
      if (fatorarOf(card)) return 'fatorar'
      if (completarDe(e.azulejos as Record<string, unknown> | undefined) && ok.completo === true) return 'completar'
      if (zerarOf(card)) return 'zerar'
      if (somarOf(card)) return 'somar'
      if (trocarOf(card)) return 'trocar'
      if (typeof (e.azulejos as { virar?: number } | undefined)?.virar === 'number' && ok.virado === true) return 'virar'
      if ((e.azulejos as { agrupar?: boolean } | undefined)?.agrupar === true && ok.agrupado === true) return 'azulejos'
      if ((e.saldo as { tirar?: string } | undefined)?.tirar && num(ok.tiradas) !== undefined) return 'saldo'
      if ((e.tabela as { completar?: boolean } | undefined)?.completar === true && num(ok.colunas) !== undefined) return 'tabela'
      return arr(e.fichas) && arr(ok.ordem) ? 'ordem' : 'mostre'
    case 'retangulo':
      if ((num(e.recorte) ?? 0) > 0 && e.mover === true && ok.movido === true) return 'mover'
      if (e.adicionar === true && num(ok.linhas) !== undefined) return 'linhas'
      if (e.cortar === true && num(ok.corte) !== undefined) return 'cortar'
      if (ok.girado === true) return 'girar'
      if (e.revelar === true && num(ok.reveladas) !== undefined && arr(e.base)?.length && arr(e.altura)?.length) return 'revelar'
      return 'mostre'
    case 'barra':
      if (e.pintar === true && num(ok.pintadas) !== undefined) return 'pintar'
      if (e.partir === true && num(ok.partes) !== undefined) return 'partir'
      return 'mostre'
    case 'grade':
      return e.pintar === true && num(ok.pintadas) !== undefined ? 'grade' : 'mostre'
    case 'balanca': {
      const prato = (v: unknown) => v !== null && typeof v === 'object' && !Array.isArray(v)
      if (e.tirar === true && prato(ok.esquerda) && prato(ok.direita)) return 'tirar'
      if ((num(e.dividir) ?? 0) > 1 && ok.dividido === true) return 'dividir'
      return 'mostre'
    }
    case 'figura':
      if (e.transferidor && num(ok.graus) !== undefined) return 'medir'
      if (e.juntar === true && (num(ok.cantos) !== undefined || ok.juntados === true)) return 'juntar'
      if (e.contorno === true && num(ok.perimetro) !== undefined) return 'contorno'
      if (e.recortar === true && ok.recortado === true) return 'recortar'
      if (e.desenrolar === true && ok.desenrolado === true) return 'desenrolar'
      if (e.encaixar === true && ok.encaixado === true) return 'encaixar'
      return 'mostre'
    case 'solido':
      if (e.abrir === true && ok.aberto === true) return 'abrir'
      if (e.empilhar === true && num(ok.camadas) !== undefined) return 'empilhar'
      if (e.pintar === true && num(ok.area) !== undefined) return 'faces'
      return 'mostre'
    case 'plano':
      if (paresOf(card)) return 'pares'
      if (cruzarOf(card)) return 'cruzar'
      if (alvosMarcar(card).length) return 'marcar'
      if (typeof ok.lido === 'string' || num(ok.lidos) !== undefined) return 'ler'
      if (e.maquina && num(ok.saidas) !== undefined) return 'alimentar'
      return 'mostre'
    case 'grafico':
      if (itemApontar(card) !== undefined) return 'apontar'
      if (num(ok.valor) !== undefined && tipoGrafico(e as GraficoState) === 'barras') return 'ajustar'
      return 'mostre'
    case 'dados':
      if (!ativoDe(e as DadosState).length) return 'mostre'
      if (ok.ordenado === true) return 'ordenar'
      if (num(ok.media) !== undefined) return 'equilibrar'
      if (num(ok.mediana) !== undefined || num(ok.moda) !== undefined || num(ok.valor) !== undefined) return 'achar'
      return 'mostre'
    case 'contagem':
      if (num(ok.etapas) !== undefined && etapasDe(e as ContagemState).length) return 'ramificar'
      if (num(ok.favoraveis) !== undefined && favoraveisDoCard(card).fav.length) return 'favoraveis'
      return 'mostre'
    case 'sorteio':
      if (num(ok.jogadas) !== undefined && resultadosDe(e as SorteioState).length) return 'jogar'
      if (num(ok.favoraveis) !== undefined && favoraveisDoCard(card).fav.length) return 'favoraveis'
      return 'mostre'
    default:
      return 'mostre'
  }
}

const ehVec = (v: unknown): v is Vec => Array.isArray(v) && v.length === 2 && v.every((t) => typeof t === 'number' && Number.isFinite(t))

/** Mexa "marcar": the points the student marks ({ ponto: [3, 2] } or { pontos: [[3, 2], [−1, 4]] }). */
function alvosMarcar(card: Mexa): Vec[] {
  const ok = card.acao.sucesso
  if (ehVec(ok.ponto)) return [ok.ponto]
  return (arr<unknown>(ok.pontos) ?? []).filter(ehVec)
}

/** Mexa "apontar": the bar, slice or point to touch. */
function itemApontar(card: Mexa): number | undefined {
  const ok = card.acao.sucesso
  const tipo = tipoGrafico(card.visual.estado as GraficoState)
  return tipo === 'setores' ? num(ok.setor) : tipo === 'linhas' ? num(ok.ponto) : num(ok.barra)
}

/** Mexa "favoráveis": every case (a cell of the grid, a face, a ball) and the favourable ones, by the state's rule. */
export function favoraveisDoCard(card: Mexa): { casos: Caso[]; fav: number[] } {
  const e = card.visual.estado
  const g = card.visual.modelo === 'contagem' ? gradeDe(e as ContagemState) : undefined
  const casos: Caso[] = card.visual.modelo === 'contagem' ? (g ? casosDaGrade(g) : []) : casosDe(e as SorteioState)
  return { casos, fav: favoraveisDe(casos, e.favoraveis) }
}

/** A colour in the plural, for "Toque só nas vermelhas": azul → azuis, verde → verdes. */
function corPlural(c: unknown): string {
  const t = String(c).toLowerCase().trim()
  if (t.endsWith('s') || ['cinza', 'laranja', 'lilás', 'lilas'].includes(t)) return t
  return t.endsWith('l') ? `${t.slice(0, -1)}is` : `${t}s`
}

/** Mexa "favoráveis": why a case does not count, said with what is on it. */
function motivoFavoravel(caso: Caso, regra: unknown): string {
  const r = (regra && typeof regra === 'object' && !Array.isArray(regra) ? regra : {}) as Record<string, unknown>
  const txt = (x: unknown) => (typeof x === 'number' ? fmtNum(x) : String(x))
  const ou = (xs: unknown[]) => (xs.length > 1 ? `${xs.slice(0, -1).map(txt).join(', ')} ou ${txt(xs[xs.length - 1])}` : txt(xs[0]))
  const lista = (v: unknown) => (Array.isArray(v) ? v : [v])
  if (r.soma !== undefined && caso.a !== undefined && caso.b !== undefined) return `Essa casa dá ${fmtNum(caso.a)} + ${fmtNum(caso.b)} = ${fmtNum(caso.a + caso.b)}. Procure as que dão ${ou(lista(r.soma))}.`
  if (r.iguais === true && caso.l !== undefined) return 'Nessa casa os dois números são diferentes. Procure os pares iguais.'
  if (r.cor !== undefined && caso.l === undefined) {
    // A ball is called by its colour; a card or a name, by what is written on it.
    if (corCanonica(caso.nome)) return `Essa bola é ${caso.nome}. Toque só nas ${ou(lista(r.cor).map(corPlural))}.`
    return `Esse não é da cor pedida. Toque só nos casos ${ou(lista(r.cor).map(corPlural))}.`
  }
  if (r.valores !== undefined) return `Esse é o ${caso.nome}. Procure ${ou(lista(r.valores))}.`
  if (typeof r.maior === 'number') return `${caso.nome} não é maior que ${fmtNum(r.maior)}.`
  if (typeof r.menor === 'number') return `${caso.nome} não é menor que ${fmtNum(r.menor)}.`
  return 'Esse caso não serve. Confira o que a pergunta pede.'
}

/** Mexa "achar": what is asked (the median, the mode or a value) and the right number. */
function pedidoAchar(card: Mexa): { pedido: 'mediana' | 'moda' | 'valor'; alvo: number; vals: number[] } {
  const ok = card.acao.sucesso
  const vals = ativoDe(card.visual.estado as DadosState)
  if (num(ok.mediana) !== undefined) return { pedido: 'mediana', alvo: mediana(vals), vals }
  if (num(ok.moda) !== undefined) return { pedido: 'moda', alvo: ok.moda as number, vals }
  return { pedido: 'valor', alvo: ok.valor as number, vals }
}

const NOTE_ACHAR = {
  mediaNaMediana: 'Esse é o ponto de equilíbrio, a média. A mediana é o valor do meio, com os valores em fila.',
  modaNaMediana: 'Essa é a pilha mais alta, a moda. A mediana é o valor do meio, com os valores em fila.',
  mediana: 'Ainda não. Ponha os valores em fila, do menor ao maior: a mediana fica no meio.',
  medianaFila: 'Ainda não. A mediana fica no meio da fila: sobram tantos valores à esquerda quanto à direita.',
  meioNaModa: 'Esse é o valor do meio, a mediana. A moda é a pilha mais alta.',
  mediaNaModa: 'Esse é o ponto de equilíbrio, a média. A moda é a pilha mais alta.',
  moda: 'Ainda não. A moda é a pilha mais alta: o valor que mais aparece.',
  valor: 'Ainda não. Leia o número embaixo de cada pilha.',
}

/** Mexa "achar": a touched value, right or with the note that says what it is. */
function conferirAchar(card: Mexa, v: number, i?: number): { certo: boolean; note?: string } {
  const { pedido, alvo, vals } = pedidoAchar(card)
  const n = vals.length
  // In the queue, either middle place counts as the median (an even count: the median is between them).
  if (pedido === 'mediana' && i !== undefined && card.visual.estado.fila === true) {
    const j = ordemFila(vals).indexOf(i)
    if (meioDaFila(n).includes(j) && mesmo(mediana(vals), num(card.acao.sucesso.mediana) ?? NaN)) return { certo: true }
  }
  const ok = card.acao.sucesso
  // With two modes (a tie), either one counts.
  const mos = modas(vals)
  const certo = pedido === 'moda' ? mos.some((x) => mesmo(x, v)) && mos.some((x) => mesmo(x, alvo)) : mesmo(v, alvo) && (pedido !== 'mediana' || mesmo(alvo, ok.mediana as number))
  if (certo) return { certo }
  const m = media(vals)
  const ehModa = mos.some((x) => mesmo(x, v))
  if (pedido === 'mediana') return { certo, note: i !== undefined ? NOTE_ACHAR.medianaFila : mesmo(v, m) && !mesmo(m, alvo) ? NOTE_ACHAR.mediaNaMediana : ehModa ? NOTE_ACHAR.modaNaMediana : NOTE_ACHAR.mediana }
  if (pedido === 'moda') return { certo, note: mesmo(v, mediana(vals)) ? NOTE_ACHAR.meioNaModa : mesmo(v, m) ? NOTE_ACHAR.mediaNaModa : NOTE_ACHAR.moda }
  return { certo, note: NOTE_ACHAR.valor }
}

/** Mexa "ler": the named points, in order. */
const nomesDoPlano = (card: Mexa) => pontosDe(card.visual.estado as PlanoState).flatMap((p) => (p.nome ? [p.nome] : []))
const chave = (v: Vec) => `${v[0]},${v[1]}`
const deChave = (k: string): Vec => k.split(',').map(Number) as Vec

/** The figure's first polygon (contorno) and how many sides it has. */
function ladosDaFigura(card: Mexa): number {
  return poligonosDe(card.visual.estado as FiguraState)[0]?.verts.length ?? 0
}

/** Labels to place on the line and where each one goes. */
function labelsOf(card: Mexa): number[] {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  if (num(ok.posicao) !== undefined) return [num(e.etiquetaSolta) ?? (ok.posicao as number)]
  return arr<number>(e.etiquetas) ?? arr<number>(ok.posicoes) ?? []
}

function barrasOf(s: BarraState): BarraLinha[] {
  if (s.barras?.length) return s.barras
  if (s.partes !== undefined || s.cortes) return [{ partes: s.partes ?? 1, pintadas: s.pintadas, inteiros: s.inteiros, cortes: s.cortes, marcadas: s.marcadas, rotulo: s.rotulo }]
  return []
}

/** The grid number the student paints (grade Mexa), and the visual with it replaced. */
function gradeAtivaOf(card: Mexa): { i: number; g: GradeItem; com: (g: GradeItem) => Record<string, unknown> } {
  const e = card.visual.estado
  const i = num(e.ativa) ?? 0
  const gs: GradeItem[] = arr<GradeItem>(e.grades)?.length ? (e.grades as GradeItem[]) : [{ pintadas: num(e.pintadas), inteiros: num(e.inteiros), rotulo: e.rotulo as string | undefined, leitura: e.leitura as GradeItem['leitura'] }]
  const { pintar: _p, porColuna: _c, ativa: _a, pintadas: _n, inteiros: _w, marcadas: _k, rotulo: _r, leitura: _l, ...rest } = e
  void [_p, _c, _a, _n, _w, _k, _r, _l]
  return { i, g: gs[i] ?? {}, com: (g) => ({ ...rest, grades: gs.map((x, j) => (j === i ? g : x)) }) }
}

/** The bar the student works on (barra Mexa), and the visual with it replaced. */
function ativaOf(card: Mexa): { i: number; b: BarraLinha; com: (b: BarraLinha) => Record<string, unknown> } {
  const e = card.visual.estado
  const i = num(e.ativa) ?? 0
  const bs = barrasOf(e as BarraState)
  const { pintar: _p, partir: _q, fator: _f, ativa: _a, partes: _n, pintadas: _m, inteiros: _w, cortes: _c, marcadas: _k, rotulo: _r, ...rest } = e
  void [_p, _q, _f, _a, _n, _m, _w, _c, _k, _r]
  return { i, b: bs[i] ?? { partes: 1 }, com: (b) => ({ ...rest, barras: bs.map((x, j) => (j === i ? b : x)) }) }
}

/**
 * Mexa "fatorar": x² + bx + c (from `azulejos.fatorar`), the ways to arrange
 * the units (1 × c, 2 × c/2…), the pair that closes the rectangle and where
 * the Mexa starts (an `arranjo`, or loose).
 */
export function fatorarOf(card: Mexa): { b: number; c: number; pares: Par[]; alvo: number; inicio: number | null } | null {
  const az = card.visual.estado.azulejos as { fatorar?: unknown; arranjo?: unknown } | undefined
  const ok = arr<number>(card.acao.sucesso.fatorado)
  if (!az || !Array.isArray(az.fatorar) || !ok || ok.length !== 2) return null
  const r = retanguloDe({ fatorar: az.fatorar, arranjo: az.arranjo })
  if (!r) return null
  const pares = paresDeFatores(r.c)
  const alvo = pares.findIndex((p) => p[0] + p[1] === r.b && mesmoPar(p, ok as Par))
  if (alvo < 0) return null
  const ini = r.par ? pares.findIndex((p) => mesmoPar(p, r.par!)) : -1
  return { b: r.b, c: r.c, pares, alvo, inicio: ini < 0 ? null : ini }
}

/**
 * Mexa "zerar": the product (from `produtoZero`) and the values of x that
 * zero it. It is a Mexa only when `sucesso.raizes` are those values (in any
 * order) and every one of them has its button.
 */
export function zerarOf(card: Mexa): { raizes: number[]; marcados: number[]; x?: number } | null {
  const p = produtoZeroDe(card.visual.estado.produtoZero)
  const ok = arr<unknown>(card.acao.sucesso.raizes)
  if (!p || !ok?.length) return null
  const raizes = raizesDe(p.fatores)
  const pedidas = [...new Set(ok)]
  if (pedidas.length !== raizes.length || !raizes.every((r) => pedidas.includes(r) && p.valores.includes(r))) return null
  return { raizes, marcados: p.marcados, x: p.x }
}

/**
 * Mexa "pares": the first line of an equation (x + y = 10) is the rule; the
 * student finds `sucesso.pontos` pairs of it on the grid. It is a Mexa only
 * when the grid has that many. The axes are fixed from the start (the line
 * shows only at the end, and the plane must not change scale then).
 */
export function paresOf(card: Mexa) {
  const e = card.visual.estado as PlanoState
  const meta = num(card.acao.sucesso.pontos)
  if (card.visual.modelo !== 'plano' || meta === undefined || meta < 1) return null
  const i = (e.retas ?? []).findIndex((r) => equacaoDa(r))
  if (i < 0) return null
  const r = e.retas![i]
  const eq = equacaoDa(r)!
  const letras = letrasDoPlano(e)
  const abc = abcDaReta(r, undefined, letras)
  if (!abc) return null
  const ex = eixoDe(e, 'x')
  const ey = eixoDe(e, 'y')
  const solucoes = paresNaGrade(abc, ex, ey)
  if (solucoes.length < meta) return null
  return { i, eq, abc, letras, ex, ey, meta: Math.round(meta), solucoes }
}

/** Mexa "cruzar": the pair where the first two lines cross (`sucesso.par`), on the grid. */
export function cruzarOf(card: Mexa) {
  const e = card.visual.estado as PlanoState
  const par = card.acao.sucesso.par
  if (card.visual.modelo !== 'plano' || !ehVec(par)) return null
  const cz = cruzamentoDoPlano(e)
  if (cz?.c.tipo !== 'ponto' || !mesmoPonto(cz.c.v, par)) return null
  const ex = eixoDe(e, 'x')
  const ey = eixoDe(e, 'y')
  if (!mesmoPonto(encaixar(par, ex, ey), par)) return null
  return { par, i: cz.i, j: cz.j, letras: letrasDoPlano(e) }
}

/** Mexa "cruzar": why a pair is not the answer (on one line only, or on neither). */
function notaCruzar(card: Mexa, v: Vec): string {
  const e = card.visual.estado as PlanoState
  const { i, j, letras } = cruzarOf(card)!
  const retas = e.retas as RetaPlano[]
  const pts = e.pontos && !Array.isArray(e.pontos) ? e.pontos : undefined
  const serve = (k: number) => satisfaz(abcDaReta(retas[k], pts, letras)!, v)
  const nome = (k: number) => retaTexto(retas[k], pts) || 'a outra reta'
  const conta = (k: number) => {
    const eq = equacaoDa(retas[k])
    return eq ? `: ${conferirTexto(eq, { [letras[0]]: v[0], [letras[1]]: v[1] }).texto}` : ''
  }
  const p = coordTexto(v)
  if (serve(i) && !serve(j)) return `${p} está na reta ${nome(i)}, mas não na ${nome(j)}${conta(j)}.`
  if (serve(j) && !serve(i)) return `${p} está na reta ${nome(j)}, mas não na ${nome(i)}${conta(i)}.`
  return `${p} não está em nenhuma das duas retas. Procure onde elas se cruzam.`
}

/**
 * Mexa "somar": the stacked equations (`sistema`). With a "× 2", the first
 * tap multiplies and the second sums; without one, a tap sums. Done at
 * `sucesso.somado` (or `sucesso.multiplicado`, when only the multiplying is asked).
 */
export function somarOf(card: Mexa): { inicio: number; meta: number; temVezes: boolean } | null {
  if (card.visual.modelo !== 'livre') return null
  const o = card.visual.estado.sistema as { somado?: boolean; multiplicado?: boolean } | undefined
  const sis = sistemaDe(o)
  const ok = card.acao.sucesso
  if (!sis || o?.somado === true) return null
  if (ok.somado === true) return { inicio: !sis.temVezes || sis.multiplicado ? 1 : 0, meta: 2, temVezes: sis.temVezes }
  if (ok.multiplicado === true && sis.temVezes && !sis.multiplicado) return { inicio: 0, meta: 1, temVezes: true }
  return null
}

/** Mexa "trocar": the letter's box goes into the second equation (`sucesso.trocado`). */
export function trocarOf(card: Mexa) {
  if (card.visual.modelo !== 'livre' || card.acao.sucesso.trocado !== true) return null
  const t = trocaDe(card.visual.estado.sistema)
  return t && !t.trocado ? t : null
}

/**
 * Mexa "testar": the condition (`condicao`) and what to test (`sucesso.testados`,
 * how many different numbers, and/or `sucesso.testar`, numbers that must be
 * tested). The student taps the marks of the line. It is a Mexa only when the
 * condition reads and the marks are enough for the goal.
 */
export function testarOf(card: Mexa) {
  if (card.visual.modelo !== 'reta') return null
  const e = card.visual.estado
  const ok = card.acao.sucesso
  const cond = lerCondicao(e.condicao)
  const testados = num(ok.testados)
  const testar = arr<unknown>(ok.testar)?.filter((v): v is number => typeof v === 'number')
  if (!cond || (testados === undefined && !testar?.length)) return null
  const meta: MetaTestar = { testados: testados !== undefined ? Math.max(1, Math.round(testados)) : undefined, testar }
  const candidatos = tracosDaReta(e)
  if (!candidatos.length || (meta.testados ?? 0) > candidatos.length) return null
  if (testar?.some((v) => !candidatos.some((t) => Math.abs(t - v) < 1e-9))) return null
  return { cond, meta, candidatos }
}

/** The kinds of algebra tiles in the Mexa (x², x, 1 and their negatives). */
function tiposAzulejos(card: Mexa): string[] {
  const pecas = arr<string>((card.visual.estado.azulejos as { pecas?: string[] } | undefined)?.pecas) ?? []
  return [...new Set(pecas.map(tipoDe))]
}

/** The balance of a "tirar" Mexa: its pieces, what must be left on each plate, and the hidden value (given or the one that balances). */
function balancaOf(card: Mexa) {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  const esquerda = e.esquerda as Prato | undefined
  const direita = e.direita as Prato | undefined
  const pecas: Record<Lado, PecaBalanca[]> = { esquerda: pecasDe(esquerda, 'esquerda'), direita: pecasDe(direita, 'direita') }
  const alvo: Record<Lado, { x: number; n: number }> = { esquerda: pratoDe(ok.esquerda as Prato), direita: pratoDe(ok.direita as Prato) }
  const forcada = e.inclina === 'esquerda' || e.inclina === 'direita' ? (e.inclina as Lado) : undefined
  const valor = num(e.valor) ?? (forcada ? valorQueInclina(esquerda, direita, forcada) : valorInferido(esquerda, direita))
  // A balance that starts tilted (an inequality) has to stay tilted the same way: the goal is that side, not the level.
  const inicio = forcada ?? inclinacaoDe(pratoDe(esquerda), pratoDe(direita), valor)
  const resta = (fora: string[], lado: Lado) => contaPecas(pecas[lado].filter((p) => !fora.includes(p.id)))
  return { pecas, alvo, valor, resta, inicio }
}

/** A hidden value that makes the given plate go down (for a balance drawn tilted with `inclina` and no `valor`). */
function valorQueInclina(esquerda: Prato | undefined, direita: Prato | undefined, lado: Lado): number {
  const b = valorInferido(esquerda, direita)
  const cands = b === undefined ? [1] : [b - 1, b + 1, b - 0.5, b + 0.5, b / 2, b * 2].filter((v) => v >= 0)
  return cands.find((v) => inclinacaoDe(pratoDe(esquerda), pratoDe(direita), v) === lado) ?? cands[0] ?? 1
}

/** The pieces "Me mostre" takes out: boxes from the end, then the biggest weights that still leave the target. */
function tirarSolucao(card: Mexa): string[] {
  const { pecas, alvo } = balancaOf(card)
  const fora: string[] = []
  for (const lado of ['esquerda', 'direita'] as Lado[]) {
    const xs = pecas[lado].filter((p) => p.tipo === 'x')
    fora.push(...xs.slice(alvo[lado].x).map((p) => p.id))
    let n = contaPecas(pecas[lado]).n
    for (const p of pecas[lado].filter((q) => q.tipo !== 'x').sort((a, b) => b.valor - a.valor)) {
      if (n - p.valor >= alvo[lado].n) {
        fora.push(p.id)
        n -= p.valor
      }
    }
  }
  return fora
}

function targetOf(card: Mexa, label: number): number {
  const ok = card.acao.sucesso
  return num(ok.posicao) ?? label
}

export function initMexa(card: Mexa): MexaState {
  const kind = kindOf(card)
  const e = card.visual.estado
  const base: MexaState = { kind, wrong: 0, done: false }
  switch (kind) {
    case 'blocos':
      return { ...base, counts: { milhares: num(e.milhares) ?? 0, centenas: num(e.centenas) ?? 0, dezenas: num(e.dezenas) ?? 0, unidades: num(e.unidades) ?? 0 } }
    case 'digitos': {
      const digits = (arr<number | null>(e.algarismos) ?? []).filter((d): d is number => d !== null)
      const cols = arr<string>(e.casas)?.length ?? digits.length
      return { ...base, tray: digits, sel: 0, slots: Array(cols).fill(null) }
    }
    case 'classes':
      return { ...base, tray: arr<number>(e.cartoes) ?? [], sel: 0, slots: (arr<string>(e.classes) ?? []).map(() => null) }
    case 'separar':
      return { ...base, seps: [] }
    case 'etiquetas':
      return { ...base, placed: {}, pick: labelsOf(card)[0] ?? null }
    case 'vizinho':
      return { ...base, pick: null }
    case 'deslizar':
      return { ...base, drag: num(e.numero) ?? num(e.de) ?? 0 }
    case 'ordem':
      return { ...base, order: [] }
    case 'linhas':
      return { ...base, drag: num(e.linhas) ?? 0 }
    case 'cortar':
      return { ...base, pick: null }
    case 'revelar':
      return { ...base, order: [], casa: null }
    case 'fatorar':
      return { ...base, pick: fatorarOf(card)!.inicio }
    case 'completar':
      return { ...base, pick: (e.azulejos as { partido?: boolean }).partido === true ? 1 : 0 }
    case 'zerar': {
      const z = zerarOf(card)!
      return { ...base, order: z.marcados.map(String), drag: z.x }
    }
    case 'pintar':
      return { ...base, drag: ativaOf(card).b.pintadas ?? 0 }
    case 'partir':
      return { ...base, pick: ativaOf(card).b.partes }
    case 'grade':
      return { ...base, drag: gradeAtivaOf(card).g.pintadas ?? 0 }
    case 'medida':
      return { ...base, casa: null }
    case 'tabela':
      return { ...base, drag: num((e.tabela as { mostradas?: number }).mostradas) ?? 1 }
    case 'saldo':
      return { ...base, drag: 0, pick: 0 }
    case 'azulejos':
      return { ...base, order: [] }
    case 'tirar':
      return { ...base, order: [] }
    case 'dividir':
      return { ...base, pick: null }
    case 'medir':
      return { ...base, drag: undefined, casa: null }
    case 'juntar':
    case 'contorno':
    case 'faces':
      return { ...base, order: [] }
    case 'empilhar':
      return { ...base, drag: camadasDe(e as SolidoState, dimsDe(e as SolidoState)) }
    case 'marcar':
    case 'ler':
      return { ...base, order: [], casa: null }
    case 'alimentar':
      return { ...base, drag: num((e.maquina as { feitas?: number }).feitas) ?? 0 }
    case 'pares':
      return { ...base, order: [], drag: 0, casa: null }
    case 'cruzar':
      return { ...base, casa: null }
    case 'somar':
      return { ...base, pick: somarOf(card)!.inicio }
    case 'trocar':
    case 'espelhar':
      return base
    case 'testar':
      return { ...base, order: [] }
    case 'apontar':
      return { ...base, pick: null }
    case 'ajustar': {
      const d = dadosDe(e as GraficoState)
      return { ...base, drag: d[num(e.ativa) ?? 0]?.valor ?? 0 }
    }
    case 'ordenar':
    case 'favoraveis':
      return { ...base, order: [], pick: null }
    case 'equilibrar': {
      const ex = eixoDados(e as DadosState)
      return { ...base, drag: num(e.fulcro) ?? ex.de + ex.passo }
    }
    case 'achar':
      return { ...base, drag: undefined, pick: null }
    case 'ramificar':
      return { ...base, drag: num(e.mostradas) ?? 0 }
    case 'jogar':
      return { ...base, drag: num(e.jogadas) ?? 0 }
    default:
      return base
  }
}

/** The finished state ("Me mostre"). */
export function solveMexa(card: Mexa, st: MexaState): MexaState {
  const ok = card.acao.sucesso
  const e = card.visual.estado
  const done = { ...st, done: true, shown: true, note: undefined }
  switch (st.kind) {
    case 'blocos':
      return { ...done, counts: { ...st.counts!, ...(ok as Partial<Record<Ordem, number>>) } }
    case 'digitos': {
      const d = String(ok.numero).split('').map(Number)
      const cols = st.slots!.length
      return { ...done, tray: [], slots: [...Array(Math.max(0, cols - d.length)).fill(null), ...d] }
    }
    case 'classes':
      return { ...done, tray: [], slots: arr<number>(ok.grupos) }
    case 'separar': {
      const groups = ok.grupos as number[][]
      const seps: number[] = []
      let at = -1
      for (const g of groups.slice(0, -1)) seps.push((at += g.length))
      return { ...done, seps }
    }
    case 'etiquetas':
      return { ...done, placed: Object.fromEntries(labelsOf(card).map((l) => [l, targetOf(card, l)])), pick: null }
    case 'vizinho':
      return { ...done, pick: ok.vizinho as number }
    case 'deslizar':
      return { ...done, drag: ok.numero as number }
    case 'ordem':
      return { ...done, order: [...(ok.ordem as string[])] }
    case 'linhas':
      return { ...done, drag: ok.linhas as number }
    case 'cortar':
      return { ...done, pick: ok.corte as number }
    case 'revelar':
      return { ...done, order: revelaveis(e as LadosArea), casa: null }
    case 'fatorar':
      return { ...done, pick: fatorarOf(card)!.alvo }
    case 'completar':
      return { ...done, pick: 2 }
    case 'zerar': {
      const z = zerarOf(card)!
      return { ...done, order: [...new Set([...(st.order ?? []), ...z.raizes.map(String)])], drag: z.raizes[z.raizes.length - 1] }
    }
    case 'pintar':
      return { ...done, drag: ok.pintadas as number }
    case 'partir':
      return { ...done, pick: ok.partes as number }
    case 'grade':
      return { ...done, drag: ok.pintadas as number }
    case 'medida':
      return { ...done, casa: ok.para as string }
    case 'tabela':
      return { ...done, drag: ok.colunas as number }
    case 'azulejos':
      return { ...done, order: tiposAzulejos(card) }
    case 'tirar':
      return { ...done, order: tirarSolucao(card) }
    case 'dividir':
      return { ...done, pick: 0 }
    case 'medir':
      return { ...done, drag: undefined, casa: null }
    case 'juntar':
      return { ...done, order: ['0', '1', '2'] }
    case 'contorno':
      return { ...done, order: Array.from({ length: ladosDaFigura(card) }, (_, i) => String(i)) }
    case 'empilhar':
      return { ...done, drag: ok.camadas as number }
    case 'faces':
      return { ...done, order: partesDe(dimsDe(e as SolidoState).tipo) }
    case 'marcar':
      return { ...done, order: alvosMarcar(card).map(chave), casa: null }
    case 'ler':
      return { ...done, order: typeof ok.lido === 'string' ? [ok.lido] : nomesDoPlano(card).slice(0, num(ok.lidos) ?? 0) }
    case 'alimentar':
      return { ...done, drag: ok.saidas as number }
    case 'pares': {
      // Pairs spread along the line: the found ones stay, and the rest come from far apart.
      const p = paresOf(card)!
      const achados = (st.order ?? []).slice(0, p.meta)
      const livres = p.solucoes.map(chave).filter((k) => !achados.includes(k))
      const faltam = p.meta - achados.length
      const mais = Array.from({ length: faltam }, (_, k) => livres[Math.round(((k + 0.5) * livres.length) / faltam - 0.5)])
      return { ...done, order: [...achados, ...mais], casa: null }
    }
    case 'cruzar':
      return { ...done, casa: null }
    case 'somar':
      return { ...done, pick: somarOf(card)!.meta }
    case 'trocar':
    case 'espelhar':
      return done
    case 'testar': {
      const t = testarOf(card)!
      const feitos = (st.order ?? []).map(Number)
      const mais = testesDaSolucao(t.cond, { ...t.meta, testados: Math.max(0, (t.meta.testados ?? 0) - feitos.length) }, t.candidatos.filter((v) => !feitos.includes(v)))
      // The conta under the line shows the first number asked (the 3 of x > 3: the empty dot), or the last one tested.
      const todos = [...feitos, ...mais]
      return { ...done, order: todos.map(String), drag: t.meta.testar?.[0] ?? todos[todos.length - 1] }
    }
    case 'apontar':
      return { ...done, pick: null }
    case 'ajustar':
      return { ...done, drag: ok.valor as number }
    case 'ordenar':
      return { ...done, order: ordemFila(ativoDe(e as DadosState)).map(String), pick: null }
    case 'equilibrar':
      return { ...done, drag: media(ativoDe(e as DadosState)) }
    case 'achar':
      return { ...done, drag: undefined, pick: null }
    case 'ramificar':
      return { ...done, drag: ok.etapas as number }
    case 'favoraveis':
      return { ...done, order: favoraveisDoCard(card).fav.map(String), pick: null }
    case 'jogar':
      return { ...done, drag: ok.jogadas as number }
    case 'saldo': {
      // Just enough zero pairs to have the chips to take.
      const sd = e.saldo as { positivas?: number; negativas?: number; tirar?: string }
      const tem = sd.tirar === '+' ? (sd.positivas ?? 0) : (sd.negativas ?? 0)
      return { ...done, drag: ok.tiradas as number, pick: Math.max(st.pick ?? 0, (ok.tiradas as number) - tem) }
    }
    default:
      void e
      return done
  }
}

const NOTE_WRONG = 'Ainda não. Tente de novo.'
const NOTE_ESCALA = (escala: string) => `Esse número é da escala ${escala === 'fora' ? 'de fora' : 'de dentro'}. Use a que começa no 0, sobre o lado do ângulo.`
const NOTE_LADO = 'Siga o outro lado do ângulo até a escala.'
const NOTE_TROCOU = 'Você trocou x e y. O primeiro número anda para o lado; o segundo, para cima ou para baixo.'
const NOTE_SINAL = 'Confira os sinais: x negativo vai para a esquerda; y negativo, para baixo.'
const NOTE_MARCAR = 'Ainda não. Ande primeiro no x, para o lado; depois no y, para cima ou para baixo.'
const NOTE_APONTAR: Record<string, string> = {
  barras: 'Ainda não. Compare o topo de cada barra com os números do eixo.',
  linhas: 'Ainda não. Siga a linha e leia cada ponto no eixo.',
  setores: 'Ainda não. Compare o tamanho das fatias.',
}
const NOTE_ORDENAR = 'Ainda não. Vá do menor para o maior: toque no ponto mais à esquerda.'
const NOTE_INCLINOU = 'A balança inclinou: você tirou só de um lado. Tire o mesmo do outro lado.'
const NOTE_VIROU = 'A balança virou para o outro lado: você tirou só de um lado. Tire o mesmo do outro lado.'
const NOTE_ENDIREITOU = 'A balança ficou reta: você tirou só de um lado. Tire o mesmo do outro lado.'
const NOTE_CONTINUA = 'Continua inclinada para o mesmo lado.'

/** What the stage shows and how a touch changes the state. */
export function mexaStage(card: Mexa, st: MexaState, set: (s: MexaState) => void): { visual: Visual; interact?: Interact; tray?: { items: string[]; sel: number | null; onPick: (i: number) => void } } {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  const visual = (estado: Record<string, unknown>): Visual => ({ ...card.visual, estado })
  const lock = st.done

  switch (st.kind) {
    case 'blocos': {
      const c = st.counts!
      const next: Record<Ordem, Ordem | null> = { unidades: 'dezenas', dezenas: 'centenas', centenas: 'milhares', milhares: null }
      const prev: Record<Ordem, Ordem | null> = { unidades: null, dezenas: 'unidades', centenas: 'dezenas', milhares: 'centenas' }
      // Desagrupar (o "empresta"): a touch opens one piece into 10 of the order below.
      const abrir = e.desagrupar === true
      const canTap = (o: Ordem) => !lock && (abrir ? prev[o] !== null && c[o] >= 1 && c[o] > (num(ok[o]) ?? 0) : next[o] !== null && c[o] >= 10)
      return {
        // The frame of 10 only helps while the loose pieces are the ones being grouped.
        visual: visual({ ...e, ...c, tamanhoGrupo: (num(e.unidades) ?? 0) >= 10 && c.unidades <= 10 ? e.tamanhoGrupo : undefined }),
        interact: {
          blocos: {
            canTap,
            onTap: (o) => {
              if (!canTap(o)) return
              const counts = abrir ? { ...c, [o]: c[o] - 1, [prev[o]!]: c[prev[o]!] + 10 } : { ...c, [o]: c[o] - 10, [next[o]!]: c[next[o]!] + 1 }
              const done = ORDENS.filter((k) => k in ok).every((k) => counts[k] === ok[k])
              set({ ...st, counts, done, note: undefined })
            },
          },
        },
      }
    }
    case 'digitos':
    case 'classes': {
      const slots = st.slots!
      const tray = st.tray!
      const target = st.kind === 'digitos' ? String(ok.numero).split('').map(Number) : (ok.grupos as number[])
      const onSlot = (i: number) => {
        if (lock) return
        const s2 = [...slots]
        const t2 = [...tray]
        if (s2[i] !== null) {
          t2.push(s2[i] as number)
          s2[i] = null
        } else if (st.sel !== null && st.sel !== undefined && t2[st.sel] !== undefined) {
          s2[i] = t2[st.sel]
          t2.splice(st.sel, 1)
        } else return
        const full = s2.every((v) => v !== null) || t2.length === 0
        const placed = st.kind === 'digitos' ? s2.filter((v) => v !== null) : s2
        const right = full && eq(st.kind === 'digitos' ? s2.slice(s2.length - target.length) : placed, target) && (st.kind === 'classes' || s2.slice(0, s2.length - target.length).every((v) => v === null))
        set({ ...st, slots: s2, tray: t2, sel: t2.length ? 0 : null, done: right, wrong: full && !right ? st.wrong + 1 : st.wrong, note: full && !right ? NOTE_WRONG : undefined })
      }
      const shown = st.kind === 'classes' && st.done ? { ...e, numero: ok.numero } : e
      return {
        visual: visual(shown),
        interact: { quadro: st.kind === 'digitos' ? { filled: slots, onSlot: lock ? undefined : onSlot, wrong: Boolean(st.note) } : { classValues: slots, onClass: lock ? undefined : onSlot, wrong: Boolean(st.note) } },
        tray: { items: tray.map(String), sel: st.sel ?? null, onPick: (i) => !lock && set({ ...st, sel: i }) },
      }
    }
    case 'separar': {
      const digits = arr<number>(e.algarismos) ?? []
      const groups = ok.grupos as number[][]
      const onGap = (i: number) => {
        if (lock) return
        const seps = st.seps!.includes(i) ? st.seps!.filter((x) => x !== i) : [...st.seps!, i].sort((a, b) => a - b)
        const cut: number[][] = []
        let from = 0
        for (const s of [...seps, digits.length - 1]) {
          cut.push(digits.slice(from, s + 1))
          from = s + 1
        }
        const right = eq(cut, groups)
        const tooMany = !right && seps.length >= groups.length - 1
        set({ ...st, seps, done: right, wrong: tooMany ? st.wrong + 1 : st.wrong, note: tooMany ? 'Conte três a partir da direita.' : undefined })
      }
      return { visual: card.visual, interact: { quadro: { seps: st.seps, onGap: lock ? undefined : onGap } } }
    }
    case 'etiquetas': {
      const labels = labelsOf(card)
      const placed = st.placed!
      const loose = labels.filter((l) => placed[l] === undefined)
      const { etiquetas: _a, etiquetaSolta: _b, ...rest } = e
      void _a
      void _b
      return {
        visual: visual(rest),
        interact: {
          reta: {
            placed,
            loose,
            selectedTag: st.pick,
            onTag: lock ? undefined : (l) => set({ ...st, pick: l }),
            onPick: lock
              ? undefined
              : (v) => {
                  const label = st.pick
                  if (label === null || label === undefined) return
                  const p2 = { ...placed, [label]: v }
                  const right = v === targetOf(card, label)
                  const remaining = labels.filter((l) => p2[l] !== targetOf(card, l))
                  const done = remaining.length === 0
                  set({ ...st, placed: p2, pick: right ? (remaining.find((l) => p2[l] === undefined) ?? remaining[0] ?? null) : label, done, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Conte os intervalos de novo.' })
                },
          },
        },
      }
    }
    case 'vizinho': {
      const choices = arr<number>(e.escolhas) ?? []
      const from = (arr<number>(e.marcas) ?? []).find((m) => !choices.includes(m))
      return {
        visual: card.visual,
        interact: {
          reta: {
            selected: st.pick,
            wrong: Boolean(st.note),
            arcs: st.pick !== null && st.pick !== undefined && from !== undefined ? [{ from, to: st.pick }] : [],
            onPick: lock
              ? undefined
              : (v) => {
                  const pick = choices.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), choices[0])
                  const right = pick === ok.vizinho
                  set({ ...st, pick, done: right, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Compare as duas distâncias.' })
                },
          },
        },
      }
    }
    case 'deslizar': {
      const de = num(e.de) ?? 0
      const ate = num(e.ate) ?? 10
      const lo = de + (num(e.unidadeDe) ?? 0)
      const hi = de + (num(e.unidadeAte) ?? ate - de)
      const meio = num(e.meio) ?? (de + ate) / 2
      const v = st.drag ?? lo
      const { numero: _n, ...rest } = e
      void _n
      return {
        visual: visual(rest),
        interact: {
          reta: {
            dragValue: v,
            dragRange: [lo, hi],
            arcs: [{ from: v, to: v >= meio ? ate : de }],
            onDrag: lock ? undefined : (d) => d !== st.drag && set({ ...st, drag: d, note: undefined }),
            onRelease: lock
              ? undefined
              : () => {
                  const target = ok.numero as number
                  if (v === target) set({ ...st, done: true, note: undefined })
                  else if (v > target) set({ ...st, wrong: st.wrong + 1, note: 'Passou. Volte devagar.' })
                },
          },
        },
      }
    }
    case 'ordem': {
      const order = st.order!
      const target = ok.ordem as string[]
      return {
        visual: card.visual,
        interact: {
          livre: {
            order,
            wrong: Boolean(st.note),
            onFicha: lock
              ? undefined
              : (f) => {
                  const o2 = order.includes(f) ? order.filter((x) => x !== f) : [...order, f]
                  const full = o2.length === target.length
                  const right = full && eq(o2, target)
                  set({ ...st, order: o2, done: right, wrong: full && !right ? st.wrong + 1 : st.wrong, note: full && !right ? NOTE_WRONG : undefined })
                },
          },
        },
      }
    }
    case 'linhas': {
      // Rows go in one at a time; past the answer, the last row can be taken back.
      const target = ok.linhas as number
      const rows = st.drag ?? 0
      const cols = num(e.colunas) ?? 0
      const { adicionar: _a, ...rest } = e
      void _a
      const add = () => {
        const n = rows + 1
        const over = n > target
        set({ ...st, drag: n, done: n === target, wrong: over ? st.wrong + 1 : st.wrong, note: over ? 'Passou. Toque na última linha para tirar.' : undefined })
      }
      const remove = () => {
        const n = rows - 1
        set({ ...st, drag: n, done: n === target, note: undefined })
      }
      return {
        // A total of 0 counts up with the rows; a fixed total keeps the pieces not yet in a row loose.
        visual: visual({ ...rest, linhas: rows, ...(e.total === 0 ? { total: rows * cols } : num(e.total) ? { sobra: Math.max(0, (e.total as number) - rows * cols) } : {}) }),
        interact: { retangulo: { onAdd: lock || rows >= target + 2 ? undefined : add, onRemove: lock || rows <= target ? undefined : remove, maxLinhas: target + 1, wrong: Boolean(st.note) } },
      }
    }
    case 'cortar': {
      const { cortar: _c, ...rest } = e
      void _c
      const cut = st.pick
      return {
        visual: visual(cut !== null && cut !== undefined ? { ...rest, cortes: [cut], rotulos: true, areas: st.done ? (e.areas ?? true) : e.areas } : rest),
        interact: {
          retangulo: {
            wrong: Boolean(st.note),
            onCut: lock
              ? undefined
              : (i) => {
                  const right = i === ok.corte
                  set({ ...st, pick: i, done: right, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Tente partir em outro lugar.' })
                },
          },
        },
      }
    }
    case 'girar':
      return {
        visual: visual({ ...e, girar: st.done ? !e.girar : e.girar }),
        interact: { retangulo: { onTurn: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    case 'revelar': {
      // A tap on a part uncovers its area (or, with a hidden side, that part of the side); done when all are uncovered.
      const todas = revelaveis(e as LadosArea)
      const order = st.order ?? []
      const { revelar: _r, ...rest } = e
      void _r
      const ultima = st.casa?.split('-').map(Number) as [number, number] | undefined
      return {
        visual: visual({ ...rest, ...(ultima && !st.done ? { destaque: ultima } : {}) }),
        interact: {
          retangulo: {
            reveladas: order,
            onRevelar: lock
              ? undefined
              : (k, i, j) => {
                  if (order.includes(k) || !todas.includes(k)) return
                  const o2 = [...order, k]
                  set({ ...st, order: o2, casa: `${i}-${j}`, done: todas.every((t) => o2.includes(t)), note: undefined })
                },
          },
        },
      }
    }
    case 'fatorar': {
      // Each tap arranges the units another way (the next factor pair); the bars follow.
      // A pair whose sum is not b leaves bars missing or left over: it is shown, not counted as an error.
      const f = fatorarOf(card)!
      const az = e.azulejos as Record<string, unknown>
      const par = st.pick === null || st.pick === undefined ? undefined : f.pares[st.pick]
      return {
        visual: visual({ ...e, azulejos: { ...az, arranjo: par } }),
        interact: {
          livre: {
            escala: f.inicio === null ? [null, ...f.pares] : f.pares,
            onArrumar: lock
              ? undefined
              : () => {
                  const i = st.pick === null || st.pick === undefined ? 0 : (st.pick + 1) % f.pares.length
                  set({ ...st, pick: i, done: i === f.alvo, note: i === f.alvo ? undefined : (avisoDoPar(f.b, f.pares[i]) ?? undefined) })
                },
          },
        },
      }
    }
    case 'completar': {
      // The first tap splits the bars around the x² (the empty corner shows); the second fills the corner.
      const az = e.azulejos as Record<string, unknown>
      const fase = st.done ? 2 : (st.pick ?? 0)
      return {
        visual: visual({ ...e, azulejos: { ...az, partido: fase >= 1, completo: fase >= 2 } }),
        interact: { livre: { onCompletar: lock ? undefined : () => set({ ...st, pick: fase + 1, done: fase + 1 >= 2, note: undefined }) } },
      }
    }
    case 'zerar': {
      // Each button puts that x in the product; done when every value that zeros it was tried.
      const z = zerarOf(card)!
      const pz = e.produtoZero as Record<string, unknown>
      const marcados = (st.order ?? []).map(Number)
      return {
        visual: visual({ ...e, produtoZero: { ...pz, marcados, x: st.drag } }),
        interact: {
          livre: {
            onValor: lock
              ? undefined
              : (v) => {
                  const m2 = marcados.includes(v) ? marcados : [...marcados, v]
                  set({ ...st, order: m2.map(String), drag: v, done: z.raizes.every((r) => m2.includes(r)), note: undefined })
                },
          },
        },
      }
    }
    case 'mover': {
      // A tap cuts the L in two and takes the bottom piece to the side.
      const { mover: _m, ...rest } = e
      void _m
      return {
        visual: visual({ ...rest, movido: st.done || e.movido === true }),
        interact: { retangulo: { onMover: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    }
    case 'virar': {
      // A tap on the heap with the minus in front turns all its pieces at once.
      const az = e.azulejos as Record<string, unknown>
      return {
        visual: visual({ ...e, azulejos: { ...az, virado: st.done || az.virado === true } }),
        interact: { livre: { onVirar: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    }
    case 'pintar': {
      // A tap paints up to that part; a tap on a painted part takes it and the ones after it back.
      const { i, b, com } = ativaOf(card)
      const target = ok.pintadas as number
      const count = st.drag ?? 0
      return {
        visual: visual(com({ ...b, pintadas: count, marcadas: undefined })),
        interact: {
          barra: {
            ativa: i,
            wrong: Boolean(st.note),
            onPart: lock
              ? undefined
              : (_, p) => {
                  const n = p < count ? p : p + 1
                  const over = n > target
                  set({ ...st, drag: n, done: n === target, wrong: over ? st.wrong + 1 : st.wrong, note: over ? 'Passou. Toque numa pintada para tirar.' : undefined })
                },
          },
        },
      }
    }
    case 'partir': {
      // Each tap cuts every part into `fator` (2 by default); the painted amount stays the same.
      const { i, b, com } = ativaOf(card)
      const fator = num(e.fator) ?? 2
      const partes = st.pick ?? b.partes
      const k = partes / b.partes
      return {
        visual: visual(com({ ...b, partes, pintadas: b.pintadas !== undefined ? b.pintadas * k : undefined })),
        interact: {
          barra: {
            ativa: i,
            onSplit: lock
              ? undefined
              : () => {
                  const n = partes * fator
                  set({ ...st, pick: n, done: n === ok.partes, note: undefined })
                },
          },
        },
      }
    }
    case 'grade': {
      // A tap paints up to that square (or, with porColuna, up to the end of its column);
      // a tap on a painted one takes it and the ones after it back.
      const { i, g, com } = gradeAtivaOf(card)
      const L = Math.max(1, num(e.linhas) ?? 10)
      const porColuna = e.porColuna === true
      const target = ok.pintadas as number
      const count = st.drag ?? 0
      return {
        visual: visual(com({ ...g, pintadas: count, marcadas: undefined, rotulo: g.rotulo })),
        interact: {
          grade: {
            ativa: i,
            wrong: Boolean(st.note),
            onCell: lock
              ? undefined
              : (_, k) => {
                  const col = Math.floor(k / L)
                  const n = porColuna ? (k < count ? col * L : (col + 1) * L) : k < count ? k : k + 1
                  const over = n > target
                  set({ ...st, drag: n, done: n === target, wrong: over ? st.wrong + 1 : st.wrong, note: over ? 'Passou. Toque numa pintada para tirar.' : undefined })
                },
          },
        },
      }
    }
    case 'medida': {
      // A tap on a unit moves the comma to after it; the zeros that are needed appear.
      const m = e.medida as Record<string, unknown>
      return {
        visual: visual({ ...e, medida: { ...m, para: st.casa ?? undefined } }),
        interact: {
          quadro: {
            wrong: Boolean(st.note),
            onCasa: lock
              ? undefined
              : (casa) => {
                  const right = casa === ok.para
                  set({ ...st, casa, done: right, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Ainda não. Conte as casas até a unidade pedida.' })
                },
          },
        },
      }
    }
    case 'tabela': {
      // A tap on the next empty column fills it (and its arrows); one column at a time, up to the answer.
      const target = ok.colunas as number
      const vis = st.drag ?? 1
      return {
        visual: card.visual,
        interact: {
          livre: {
            mostradas: vis,
            wrong: Boolean(st.note),
            onColuna: lock || vis >= target
              ? undefined
              : (c) => {
                  if (c !== vis) return
                  const n = vis + 1
                  set({ ...st, drag: n, done: n === target, note: undefined })
                },
          },
        },
      }
    }
    case 'azulejos': {
      // A tap on a piece brings all the pieces of its kind together; done when every kind is together.
      const tipos = tiposAzulejos(card)
      const order = st.order ?? []
      return {
        visual: card.visual,
        interact: {
          livre: {
            agrupados: order,
            onPeca: lock
              ? undefined
              : (t) => {
                  if (order.includes(t)) return
                  const o2 = [...order, t]
                  set({ ...st, order: o2, done: tipos.every((k) => o2.includes(k)), note: undefined })
                },
          },
        },
      }
    }
    case 'saldo': {
      // A tap on a chip of the sign takes it out. With none of that sign left, a zero pair
      // (one + and one −) brings one in without changing the balance.
      const sd = e.saldo as { positivas?: number; negativas?: number; tirar?: string }
      const target = ok.tiradas as number
      const tiradas = st.drag ?? 0
      const pares = st.pick ?? 0
      const tem = (sd.tirar === '+' ? (sd.positivas ?? 0) : (sd.negativas ?? 0)) + pares - tiradas
      return {
        visual: card.visual,
        interact: {
          livre: {
            removidas: tiradas,
            paresPostos: pares,
            wrong: Boolean(st.note),
            onTirar: lock || tem <= 0
              ? undefined
              : () => {
                  const n = tiradas + 1
                  const restam = target - n
                  set({ ...st, drag: n, done: n === target, note: restam > 0 && tem - 1 === 0 ? 'Acabaram as fichas. Ponha um par: ele vale zero.' : undefined })
                },
            onPar: lock || pares >= target + 2 ? undefined : () => set({ ...st, pick: pares + 1, note: undefined }),
          },
        },
      }
    }
    case 'tirar': {
      // A tap takes a piece out. Taking from one side only tilts the balance (by the hidden value);
      // taking a piece that has to stay is a mistake. Done when what is left is the target, level.
      const { pecas, alvo, valor, resta, inicio } = balancaOf(card)
      const fora = st.order ?? []
      const letra = typeof e.letra === 'string' ? e.letra : 'x'
      const desigual = inicio !== 'equilibrio'
      const { inclina: _i, ...semInclina } = e
      void _i
      return {
        // Tilted from the start, the plates follow the real weights while the student takes pieces out (not a forced side).
        visual: visual({ ...(desigual ? semInclina : e), valor, ...(desigual && st.done && !e.rotulo && !e.mostraEquacao ? { rotulo: NOTE_CONTINUA } : {}) }),
        interact: {
          balanca: {
            fora,
            tremer: st.wrong,
            onPeca: lock
              ? undefined
              : (id) => {
                  const lado = id.split(':')[0] as Lado
                  const p = pecas[lado]?.find((q) => q.id === id)
                  if (!p || fora.includes(id)) return
                  const agora = resta(fora, lado)
                  const fica = p.tipo === 'x' ? agora.x <= alvo[lado].x : agora.n - p.valor < alvo[lado].n
                  if (fica) {
                    set({ ...st, wrong: st.wrong + 1, note: `${p.tipo === 'x' ? 'Essa caixa fica' : 'Esse peso fica'}: neste prato tem de sobrar ${ladoTexto(alvo[lado], letra)}.` })
                    return
                  }
                  const f2 = [...fora, id]
                  const E = resta(f2, 'esquerda')
                  const D = resta(f2, 'direita')
                  const inc = inclinacaoDe(E, D, valor)
                  const done = inc === inicio && eq(E, alvo.esquerda) && eq(D, alvo.direita)
                  const note = inc === inicio ? undefined : !desigual ? NOTE_INCLINOU : inc === 'equilibrio' ? NOTE_ENDIREITOU : NOTE_VIROU
                  set({ ...st, order: f2, done, note })
                },
          },
        },
      }
    }
    case 'dividir':
      // One tap on a group (either side) keeps that group on each plate.
      return {
        visual: card.visual,
        interact: { balanca: { escolhido: st.pick ?? null, onGrupo: lock ? undefined : (g) => set({ ...st, pick: g, done: true, note: undefined }) } },
      }
    case 'medir': {
      // A tap on the scale reads a number: right where the side crosses it, on the scale that starts at 0 on the other side.
      const fs = e as FiguraState
      const g = grausMedir(fs)
      const inv = transferidorDe(fs)?.invertido ?? false
      const lido = !st.done && st.drag !== undefined && st.casa ? { direcao: st.drag, escala: st.casa as 'dentro' | 'fora' } : null
      return {
        visual: visual({ ...e, medido: st.done }),
        interact: {
          figura: {
            lido,
            tremer: st.wrong,
            onEscala: lock
              ? undefined
              : (direcao, escala) => {
                  const valor = leituraTransferidor(direcao, escala, inv)
                  if (direcao === g && valor === ok.graus) return set({ ...st, drag: undefined, casa: null, done: true, note: undefined })
                  set({ ...st, drag: direcao, casa: escala, wrong: st.wrong + 1, note: direcao === g ? NOTE_ESCALA(escala) : NOTE_LADO })
                },
          },
        },
      }
    }
    case 'juntar': {
      // Each tap cuts one corner and puts it on the line, next to the ones already there.
      const order = st.order ?? []
      const meta = num(ok.cantos) ?? 3
      return {
        visual: visual({ ...e, juntados: order.map(Number) }),
        interact: {
          figura: {
            onCanto: lock
              ? undefined
              : (i) => {
                  if (order.includes(String(i))) return
                  const o2 = [...order, String(i)]
                  set({ ...st, order: o2, done: o2.length >= meta, note: undefined })
                },
          },
        },
      }
    }
    case 'contorno': {
      // Each tap lights a side and adds its measure; done when every side is lit (and the sum is the answer).
      const order = st.order ?? []
      const p = poligonosDe(e as FiguraState)[0]
      const n = p?.verts.length ?? 0
      return {
        visual: visual({ ...e, acesos: order.map(Number), soma: true }),
        interact: {
          figura: {
            onLado: lock
              ? undefined
              : (i) => {
                  if (order.includes(String(i)) || !p) return
                  const o2 = [...order, String(i)]
                  const todos = o2.length === n
                  const certo = todos && Math.abs((perimetroDe(p) ?? NaN) - (ok.perimetro as number)) < 1e-6
                  set({ ...st, order: o2, done: certo, note: undefined })
                },
          },
        },
      }
    }
    case 'recortar':
    case 'desenrolar':
    case 'encaixar': {
      // One tap does it: the piece moves, the circle rolls, the little squares fill the big one.
      const chave = st.kind === 'recortar' ? 'recortado' : st.kind === 'desenrolar' ? 'desenrolado' : 'encaixado'
      return {
        visual: visual({ ...e, [chave]: st.done }),
        interact: { figura: { onToque: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    }
    case 'abrir':
      // One tap: the faces turn about their hinges until the solid lies open.
      return {
        visual: visual({ ...e, aberto: st.done }),
        interact: { solido: { onToque: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    case 'empilhar': {
      // Each tap drops one more layer of little cubes, up to the height.
      const meta = ok.camadas as number
      const k = st.drag ?? 0
      return {
        visual: visual({ ...e, camadas: k, baseCheia: e.baseCheia === true && k <= 1 }),
        interact: { solido: { onToque: lock || k >= meta ? undefined : () => set({ ...st, drag: k + 1, done: k + 1 === meta, note: undefined }) } },
      }
    }
    case 'faces': {
      // Each tap paints a face and adds its area. On the closed solid, once the faces in view are
      // painted, it opens by itself to show the ones behind. Done when every face is painted (and the sum is the answer).
      const fs = e as SolidoState
      const d = dimsDe(fs)
      const partes = partesDe(d.tipo)
      const order = st.order ?? []
      const abriu = fs.aberto === true || facesVisiveis(fs).every((p) => order.includes(p))
      return {
        visual: visual({ ...e, pintadas: order, soma: true, aberto: abriu ? true : e.aberto }),
        interact: {
          solido: {
            onFace: lock
              ? undefined
              : (parte) => {
                  if (order.includes(parte) || !partes.includes(parte)) return
                  const o2 = [...order, parte]
                  const total = Math.round(o2.reduce((s, p) => s + areaDe(d, p), 0) * 100) / 100
                  set({ ...st, order: o2, done: o2.length === partes.length && Math.abs(total - (ok.area as number)) < 0.01, note: undefined })
                },
          },
        },
      }
    }
    case 'marcar': {
      // A tap on the grid marks the crossing; a target walks to its place (x first, then y).
      // The swapped point (y, x) and the point with a wrong sign have their own feedback.
      const alvos = alvosMarcar(card)
      const feitos = (st.order ?? []).map(deChave)
      const faltam = alvos.filter((a) => !feitos.some((f) => mesmoPonto(f, a)))
      // A named point at a target's place stays hidden until it is marked.
      const ps = e.pontos
      const pontos = ps && !Array.isArray(ps) && typeof ps === 'object' ? Object.fromEntries(Object.entries(ps as Record<string, Vec>).filter(([, v]) => !ehVec(v) || !faltam.some((a) => mesmoPonto(a, v)))) : ps
      return {
        visual: visual({ ...e, pontos }),
        interact: {
          plano: {
            marcados: feitos,
            errado: st.casa ? deChave(st.casa) : null,
            tremer: st.wrong,
            onMarcar: lock
              ? undefined
              : (v) => {
                  if (feitos.some((f) => mesmoPonto(f, v))) return
                  if (faltam.some((a) => mesmoPonto(a, v))) {
                    const o2 = [...(st.order ?? []), chave(v)]
                    return set({ ...st, order: o2, casa: null, done: o2.length >= alvos.length, note: undefined })
                  }
                  const troca = faltam.some((a) => mesmoPonto(trocado(a), v))
                  const sinal = !troca && faltam.some((a) => Math.abs(Math.abs(a[0]) - Math.abs(v[0])) < 1e-9 && Math.abs(Math.abs(a[1]) - Math.abs(v[1])) < 1e-9)
                  set({ ...st, casa: chave(v), wrong: st.wrong + 1, note: troca ? NOTE_TROCOU : sinal ? NOTE_SINAL : NOTE_MARCAR })
                },
          },
        },
      }
    }
    case 'ler': {
      // A tap on a named point shows its coordinates, with the dashes to the axes.
      const lidos = st.order ?? []
      const alvo = typeof ok.lido === 'string' ? ok.lido : undefined
      const meta = num(ok.lidos) ?? 1
      return {
        visual: card.visual,
        interact: {
          plano: {
            lidos,
            tremer: st.wrong,
            onPonto: lock
              ? undefined
              : (nome) => {
                  if (lidos.includes(nome)) return
                  const o2 = [...lidos, nome]
                  if (alvo && nome !== alvo) {
                    const v = pontosDe(e as PlanoState).find((p) => p.nome === nome)?.v
                    return set({ ...st, order: o2, wrong: st.wrong + 1, note: `Esse é o ${nome}${v ? ` ${coordTexto(v)}` : ''}. Procure o ponto pedido.` })
                  }
                  set({ ...st, order: o2, done: alvo ? true : o2.length >= meta, note: undefined })
                },
          },
        },
      }
    }
    case 'alimentar': {
      // Each tap puts the next number in the machine; done when `saidas` numbers came out.
      const m = e.maquina as { feitas?: number; entradas?: number[] }
      const meta = ok.saidas as number
      const k = st.drag ?? 0
      return {
        visual: visual({ ...e, maquina: { ...m, feitas: k } }),
        interact: { plano: { onAlimentar: lock || k >= meta || k >= (m.entradas?.length ?? 0) ? undefined : () => set({ ...st, drag: k + 1, done: k + 1 >= meta, note: undefined }) } },
      }
    }
    case 'pares': {
      // A tap on the grid: a pair that serves stays (amber, with its coordinates); one that does
      // not blinks and goes, with the sum that says why. Once enough pairs are found, the line shows through them.
      const p = paresOf(card)!
      const achados = (st.order ?? []).map(deChave)
      const ps = e as PlanoState
      const retas = st.done ? ps.retas : ps.retas!.filter((_, k) => k !== p.i)
      const rotulo = ps.rotulo ?? `${Math.min(achados.length, p.meta)} de ${p.meta} pares`
      return {
        visual: visual({ ...e, x: p.ex, y: p.ey, retas, rotulo }),
        interact: {
          plano: {
            achados,
            piscar: !st.done && st.casa ? { v: deChave(st.casa), n: st.drag ?? 0 } : null,
            onMarcar: lock
              ? undefined
              : (v) => {
                  if (achados.some((f) => mesmoPonto(f, v))) return
                  if (satisfaz(p.abc, v)) {
                    const o2 = [...(st.order ?? []), chave(v)]
                    return set({ ...st, order: o2, casa: null, done: o2.length >= p.meta, note: undefined })
                  }
                  const conta = conferirTexto(p.eq, { [p.letras[0]]: v[0], [p.letras[1]]: v[1] }).texto
                  set({ ...st, casa: chave(v), drag: (st.drag ?? 0) + 1, note: `${coordTexto(v)}: ${conta}. Esse par não serve.` })
                },
          },
        },
      }
    }
    case 'cruzar': {
      // A tap on the grid: the crossing lights up, with the pair checked in both equations.
      // A pair on one line only (or on neither) is a mistake, with the check that fails.
      const c = cruzarOf(card)!
      return {
        visual: visual({ ...e, cruzamento: st.done, conferir: st.done ? true : undefined }),
        interact: {
          plano: {
            errado: st.done || !st.casa ? null : deChave(st.casa),
            tremer: st.wrong,
            onMarcar: lock
              ? undefined
              : (v) => {
                  if (mesmoPonto(v, c.par)) return set({ ...st, casa: null, done: true, note: undefined })
                  set({ ...st, casa: chave(v), wrong: st.wrong + 1, note: notaCruzar(card, v) })
                },
          },
        },
      }
    }
    case 'somar': {
      // The first tap multiplies (with a "× 2"), the next one sums: the terms that cancel are struck out.
      const sm = somarOf(card)!
      const fase = st.pick ?? sm.inicio
      const sis = e.sistema as Record<string, unknown>
      return {
        visual: visual({ ...e, sistema: { ...sis, multiplicado: fase >= 1, somado: fase >= 2 } }),
        interact: {
          livre: {
            proximo: lock ? undefined : fase === 0 ? 'multiplicar' : 'somar',
            onSomar: lock ? undefined : () => set({ ...st, pick: fase + 1, done: fase + 1 >= sm.meta, note: undefined }),
          },
        },
      }
    }
    case 'trocar': {
      // A tap sends the box with what the letter is worth into its place, with the parentheses.
      const sis = e.sistema as Record<string, unknown>
      return {
        visual: visual({ ...e, sistema: { ...sis, trocado: st.done } }),
        interact: { livre: { onTrocar: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    }
    case 'testar': {
      // A tap on a mark puts that number in the condition: ✓ green if it serves, ✗ rose if not, with the sum under the line.
      // Not serving is not a mistake. At the end, the whole piece that serves shows (the band, the dots, the arrow).
      const t = testarOf(card)!
      const feitos = (st.order ?? []).map(Number)
      const unicos = [...new Set(feitos)]
      const ultimo = st.drag ?? feitos[feitos.length - 1]
      const { feito, falta } = testarFeito(t.cond, unicos, t.meta, t.candidatos)
      const alvoN = t.meta.testados ?? t.meta.testar?.length ?? 0
      const contador = st.done ? undefined : (falta ?? `${Math.min(unicos.length, alvoN)} de ${alvoN} números`)
      void feito
      return {
        visual: visual({ ...e, testados: unicos, ...(ultimo !== undefined ? { testado: ultimo } : {}), solucao: st.done || e.solucao === true }),
        interact: {
          reta: {
            contador,
            onPick: lock
              ? undefined
              : (v) => {
                  const o2 = unicos.includes(v) ? unicos : [...unicos, v]
                  set({ ...st, order: o2.map(String), drag: v, done: testarFeito(t.cond, o2, t.meta, t.candidatos).feito, note: undefined })
                },
          },
        },
      }
    }
    case 'espelhar':
      // One tap (on the "× (−1)" or on the line) multiplies everything by −1: each point flies over to the other side of zero.
      return {
        visual: visual({ ...e, espelhado: st.done }),
        interact: { reta: { onEspelhar: lock ? undefined : () => set({ ...st, done: true, note: undefined }) } },
      }
    case 'apontar': {
      // A tap on a bar (a slice, a point of the line): the right one lights up.
      const alvo = itemApontar(card)!
      const tipo = tipoGrafico(e as GraficoState)
      return {
        visual: visual(st.done ? { ...e, destaque: alvo } : e),
        interact: {
          grafico: {
            errado: st.done ? null : (st.pick ?? null),
            tremer: st.wrong,
            onItem: lock
              ? undefined
              : (i) => {
                  if (i === alvo) return set({ ...st, pick: null, done: true, note: undefined })
                  set({ ...st, pick: i, wrong: st.wrong + 1, note: NOTE_APONTAR[tipo] })
                },
          },
        },
      }
    }
    case 'ajustar': {
      // The student drags the bar `ativa` to the value; it is checked when the finger lifts.
      // The axis stays still while the bar moves.
      const alvo = ok.valor as number
      const gs = { ...e, eixoFim: eixoDoAjuste(e as GraficoState, alvo) } as GraficoState
      const i = num(e.ativa) ?? 0
      const v = st.drag ?? 0
      const dados = (arr<unknown>(e.dados) ?? []).map((d, j) => (j !== i ? d : Array.isArray(d) ? [d[0], v] : { ...(d as object), valor: v }))
      return {
        visual: visual({ ...gs, dados, destaque: st.done ? i : e.destaque }),
        interact: {
          grafico: {
            tremer: st.wrong,
            onAjuste: lock ? undefined : (x) => {
              const n = ajustarValor(gs, x, alvo)
              if (n !== st.drag) set({ ...st, drag: n, note: undefined })
            },
            onSolta: lock
              ? undefined
              : () => {
                  if (Math.abs(v - (ok.valor as number)) < 1e-9) set({ ...st, done: true, note: undefined })
                  else set({ ...st, wrong: st.wrong + 1, note: 'Ainda não. Leve o topo da barra até o valor, olhando os números do eixo.' })
                },
          },
        },
      }
    }
    case 'ordenar': {
      // A tap on a point sends it to the queue, if it is the smallest left; done when every point is in it.
      const vals = ativoDe(e as DadosState)
      const fila = (st.order ?? []).map(Number)
      return {
        visual: visual({ ...e, fila: false }),
        interact: {
          dados: {
            naFila: fila,
            errado: st.done ? null : (st.pick ?? null),
            tremer: st.wrong,
            onPonto: lock
              ? undefined
              : (i) => {
                  if (fila.includes(i) || i < 0 || i >= vals.length) return
                  const menor = Math.min(...vals.filter((_, j) => !fila.includes(j)))
                  if (!mesmo(vals[i], menor)) return set({ ...st, pick: i, wrong: st.wrong + 1, note: NOTE_ORDENAR })
                  const o2 = [...fila, i]
                  set({ ...st, order: o2.map(String), pick: null, done: o2.length === vals.length, note: undefined })
                },
          },
        },
      }
    }
    case 'equilibrar': {
      // The student drags the support; the line tilts while it is off the mean. Checked when the finger lifts.
      const ds = e as DadosState
      const vals = ativoDe(ds)
      const m = media(vals)
      const f = st.drag ?? m
      return {
        visual: visual(st.done ? { ...e, media: true, fulcro: undefined } : { ...e, media: false, fulcro: f }),
        interact: {
          dados: {
            tremer: st.wrong,
            onFulcro: lock
              ? undefined
              : (v) => {
                  const n = encaixarFulcro(ds, v, m)
                  if (n !== st.drag) set({ ...st, drag: n, note: undefined })
                },
            onSolta: lock
              ? undefined
              : () => {
                  if (fulcroNaMedia(ds, f, m)) set({ ...st, drag: m, done: true, note: undefined })
                  else set({ ...st, wrong: st.wrong + 1, note: f < m ? 'A reta pende para a direita: leve o apoio para a direita.' : 'A reta pende para a esquerda: leve o apoio para a esquerda.' })
                },
          },
        },
      }
    }
    case 'achar': {
      // A tap on the line (or on a point of the queue) reads a value; the right one lights the median, the mode or the point.
      const ds = e as DadosState
      const { pedido, alvo, vals } = pedidoAchar(card)
      const ex = eixoDados(ds)
      const fila = e.fila === true
      const tocar = (v: number, i?: number) => {
        const r = conferirAchar(card, v, i)
        if (r.certo) return set({ ...st, drag: undefined, pick: null, done: true, note: undefined })
        set({ ...st, drag: v, pick: i ?? null, wrong: st.wrong + 1, note: r.note })
      }
      const feito = pedido === 'mediana' ? { mediana: true } : pedido === 'moda' ? { moda: true } : { destaque: alvo }
      return {
        visual: visual(st.done ? { ...e, ...feito } : e),
        interact: {
          dados: {
            tremer: st.wrong,
            marcado: st.done || fila || st.drag === undefined ? null : { v: st.drag, certo: false },
            errado: st.done ? null : (st.pick ?? null),
            onValor: lock || fila ? undefined : (v) => tocar(lerValor(vals, v, ex)),
            onPonto: lock || !fila ? undefined : (i) => tocar(vals[i], i),
          },
        },
      }
    }
    case 'ramificar': {
      // Each tap grows the next stage of the tree; the count underneath grows with it.
      const meta = Math.min(ok.etapas as number, etapasDe(e as ContagemState).length)
      const k = st.drag ?? 0
      return {
        visual: visual({ ...e, mostradas: k }),
        interact: { contagem: { onRamo: lock || k >= meta ? undefined : () => set({ ...st, drag: k + 1, done: k + 1 >= meta, note: undefined }) } },
      }
    }
    case 'favoraveis': {
      // A tap lights a favourable case; a case that does not count shakes, with why. Done when all are lit.
      const { casos, fav } = favoraveisDoCard(card)
      const marcados = (st.order ?? []).map(Number)
      const meta = ok.favoraveis as number
      const onCaso = lock
        ? undefined
        : (i: number) => {
            if (marcados.includes(i) || !casos[i]) return
            if (!fav.includes(i)) return set({ ...st, pick: i, wrong: st.wrong + 1, note: motivoFavoravel(casos[i], e.favoraveis) })
            const o2 = [...marcados, i]
            set({ ...st, order: o2.map(String), pick: null, done: o2.length === fav.length && fav.length === meta, note: undefined })
          }
      const it = { marcados: st.done ? undefined : marcados, errado: st.done ? null : (st.pick ?? null), tremer: st.wrong, onCaso }
      return {
        visual: visual(st.done ? { ...e, marcar: false } : e),
        interact: card.visual.modelo === 'contagem' ? { contagem: it } : { sorteio: it },
      }
    }
    case 'jogar': {
      // Each button throws 1, 10 or 100 more times: the bars grow. Done at `jogadas` (and it goes on, up to 10.000).
      const meta = ok.jogadas as number
      const k = st.drag ?? 0
      return {
        visual: visual({ ...e, jogadas: k }),
        interact: {
          sorteio: {
            // The buttons stay after the goal: the student may keep throwing and watch the frequency settle.
            onJogar: (b) => {
              const n = Math.min(MAX_JOGADAS, k + Math.max(1, Math.round(b)))
              if (n !== k) set({ ...st, drag: n, done: st.done || n >= meta, note: undefined })
            },
          },
        },
      }
    }
    default:
      return { visual: card.visual }
  }
}

/** The gesture, said plainly, for a student who has not found it yet. */
export const GESTO: Record<Kind, string | null> = {
  blocos: 'Toque nas peças com a borda tracejada.',
  digitos: 'Toque num algarismo e depois na casa dele.',
  classes: 'Toque num grupo e depois na classe dele.',
  separar: 'Toque entre dois algarismos para pôr um ponto.',
  etiquetas: 'Toque na reta, onde a etiqueta vai.',
  vizinho: 'Toque numa das duas marcas.',
  deslizar: 'Arraste o ponto pela reta.',
  ordem: 'Toque nas fichas, na ordem.',
  linhas: 'Toque em "+ 1 linha".',
  cortar: 'Toque entre duas colunas para partir o retângulo.',
  girar: 'Toque no retângulo para girar.',
  revelar: 'Toque em cada parte do retângulo para descobrir.',
  virar: 'Toque no monte com o sinal de menos na frente.',
  fatorar: 'Toque nos azulejos para arrumar os quadradinhos de outro jeito.',
  completar: 'Toque nos azulejos: primeiro as barras se partem, depois o canto se enche.',
  zerar: 'Toque nos valores de x e veja quando o produto dá zero.',
  mover: 'Toque no pedaço tracejado para cortar e levar para o lado.',
  pintar: 'Toque nas partes da barra para pintar.',
  partir: 'Toque na barra para cortar as partes mais fino.',
  grade: 'Toque nos quadradinhos da grade para pintar.',
  medida: 'Toque na unidade em que a vírgula deve ficar.',
  tabela: 'Toque na coluna vazia para completar a tabela.',
  azulejos: 'Toque numa peça para juntar as do mesmo tipo.',
  saldo: 'Toque nas fichas para tirar. Se faltar ficha, ponha um par + e −.',
  tirar: 'Toque numa peça para tirá-la. Tire o mesmo dos dois pratos.',
  dividir: 'Toque num dos grupos com a borda tracejada.',
  medir: 'Toque no número da escala por onde passa o lado do ângulo.',
  juntar: 'Toque em cada canto colorido do triângulo.',
  contorno: 'Toque em cada lado da figura.',
  recortar: 'Toque na figura para recortar o triângulo tracejado.',
  desenrolar: 'Toque no círculo para ele rolar.',
  encaixar: 'Toque na figura para levar os quadradinhos ao quadrado grande.',
  abrir: 'Toque no sólido para abri-lo.',
  empilhar: 'Toque no sólido para pôr mais uma camada.',
  faces: 'Toque em cada face para pintá-la.',
  marcar: 'Ande no x, depois no y, e toque no cruzamento da grade.',
  ler: 'Toque num ponto para ver as coordenadas dele.',
  alimentar: 'Toque na máquina para pôr o próximo número.',
  apontar: 'Toque na barra, no ponto ou na fatia que responde à pergunta.',
  ajustar: 'Arraste a barra para cima ou para baixo até o valor.',
  ordenar: 'Toque no ponto mais à esquerda: ele vai para a fila.',
  equilibrar: 'Arraste o apoio pela reta até ela ficar reta.',
  achar: 'Toque na reta (ou na fila), no valor pedido.',
  ramificar: 'Toque na árvore para abrir a próxima etapa.',
  favoraveis: 'Toque em cada caso que serve.',
  jogar: 'Toque nos botões para jogar.',
  pares: 'Toque num cruzamento da grade: ponha o par na equação e veja se serve.',
  cruzar: 'Toque no ponto onde as duas retas se cruzam.',
  somar: 'Toque nas equações: o × multiplica uma delas; depois, as duas se somam.',
  trocar: 'Toque na caixa para pôr o que ela vale no lugar da letra.',
  testar: 'Toque num número da reta para pôr na condição. Teste um que serve e um que não serve.',
  espelhar: 'Toque em × (−1) para multiplicar tudo por −1.',
  mostre: null,
}
