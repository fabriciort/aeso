// Completar o quadrado com os azulejos (AF.U3), sem React, para o desenho, o
// Mexa "completar" e os testes. As peças de x² + bx (b par): o x² e b barras.
// Soltas, as barras ficam ao lado do x². Partidas, metade fica de pé à
// direita do x² e metade deitada embaixo, e falta o canto de baixo, (b/2) por
// (b/2). Completo, o canto se enche com (b/2)² quadradinhos novos:
// x² + 6x + 9 = (x + 3)².

import { LADO_X } from './azulejos-retangulo'

const VAO = 0.35
const VAO_SOBRA = 0.8
/** The b the tiles take: even, from 2 to 10 (b = 10 still reads on a phone). */
export const B_MAX = 10

export type Fase = 'soltas' | 'partido' | 'completo'
export const FASES: Fase[] = ['soltas', 'partido', 'completo']

export interface Completar {
  /** x² + bx. */
  b: number
  /** b / 2: the side of the missing corner. */
  m: number
  fase: Fase
  /** The right side of the equation x² + bx = c, when there is one. */
  igual?: number
  letra: string
}

const ehInteiro = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)

/** Reads `completar: b` (with `partido`, `completo`, `igual`, `letra`); null when b is not even between 2 and 10. */
export function completarDe(s: { completar?: unknown; partido?: unknown; completo?: unknown; igual?: unknown; letra?: unknown } | undefined): Completar | null {
  if (!s || !ehInteiro(s.completar) || s.completar < 2 || s.completar > B_MAX || s.completar % 2) return null
  const fase: Fase = s.completo === true ? 'completo' : s.partido === true ? 'partido' : 'soltas'
  return { b: s.completar, m: s.completar / 2, fase, igual: ehInteiro(s.igual) ? s.igual : undefined, letra: typeof s.letra === 'string' && s.letra ? s.letra : 'x' }
}

export interface PecaCompletar {
  /** Stable across the phases: 'q' (the x²), 'b0'…, 'u0'… (the units that complete). */
  id: string
  tipo: 'x²' | 'x' | '1'
  x: number
  y: number
  w: number
  h: number
}

export interface ArranjoCompletar {
  pecas: PecaCompletar[]
  /** The missing corner (dashed), once the bars are split. */
  canto?: { x: number; y: number; w: number; h: number }
  /** The square x + m by x + m, once the bars are split. */
  ret?: { w: number; h: number }
  largura: number
  altura: number
}

/**
 * Where each piece sits. Loose: the x² and the bars standing beside it, in
 * one row up to 4 bars, or in two rows of b/2 (the first row goes to the
 * right, the second lies down below). Split and complete: the square.
 */
export function arranjoCompletar(b: number, fase: Fase, X = LADO_X): ArranjoCompletar {
  const m = b / 2
  const pecas: PecaCompletar[] = [{ id: 'q', tipo: 'x²', x: 0, y: 0, w: X, h: X }]
  if (fase === 'soltas') {
    const porLinha = b <= 4 ? b : m
    for (let i = 0; i < b; i++) pecas.push({ id: `b${i}`, tipo: 'x', x: X + VAO_SOBRA + (i % porLinha) * (1 + VAO), y: Math.floor(i / porLinha) * (X + VAO), w: 1, h: X })
    const linhas = Math.ceil(b / porLinha)
    return { pecas, largura: X + VAO_SOBRA + porLinha * (1 + VAO) - VAO, altura: linhas * (X + VAO) - VAO }
  }
  for (let i = 0; i < m; i++) pecas.push({ id: `b${i}`, tipo: 'x', x: X + i, y: 0, w: 1, h: X })
  for (let j = 0; j < m; j++) pecas.push({ id: `b${m + j}`, tipo: 'x', x: 0, y: X + j, w: X, h: 1 })
  if (fase === 'completo') for (let k = 0; k < m * m; k++) pecas.push({ id: `u${k}`, tipo: '1', x: X + (k % m), y: X + Math.floor(k / m), w: 1, h: 1 })
  return { pecas, canto: { x: X, y: X, w: m, h: m }, ret: { w: X + m, h: X + m }, largura: X + m, altura: X + m }
}

/** The biggest drawing among the three phases of the same b: every card and every tap share one scale. */
export function extensaoCompletar(b: number, X = LADO_X): { largura: number; altura: number } {
  const as = FASES.map((f) => arranjoCompletar(b, f, X))
  return { largura: Math.max(...as.map((a) => a.largura)), altura: Math.max(...as.map((a) => a.altura)) }
}

/** A number with the true minus sign: −4. */
export const comSinal = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** x² + 6x. */
export const binomioTexto = (b: number, letra = 'x') => `${letra}² + ${b === 1 ? '' : b}${letra}`

/** x + 3. */
export const ladoCompletar = (m: number, letra = 'x') => `${letra} + ${m}`

/** A piece of a caption line; `novo` is the "+ 9" that was added. */
export interface Trecho {
  t: string
  novo?: boolean
}

export interface LinhaLegenda {
  trechos: Trecho[]
  cor: 'branco' | 'ambar' | 'rosa'
  /** A smaller line (a remark, not the equation). */
  nota?: boolean
}

/**
 * The caption under the tiles, line by line. Loose: x² + 6x (= 16). Split:
 * the same, and "falta um canto 3 por 3". Complete: x² + 6x + 9 = (x + 3)²;
 * with `igual`, x² + 6x + 9 = 16 + 9 and (x + 3)² = 25. A negative right side
 * says that no square has a negative area.
 */
export function legendaCompletar(c: Completar): LinhaLegenda[] {
  const { b, m, igual, letra } = c
  const esq = binomioTexto(b, letra)
  const q = m * m
  if (c.fase !== 'completo') {
    const l1: LinhaLegenda = { trechos: [{ t: igual === undefined ? esq : `${esq} = ${comSinal(igual)}` }], cor: 'branco' }
    return c.fase === 'partido' ? [l1, { trechos: [{ t: `falta um canto ${m} por ${m}` }], cor: 'ambar', nota: true }] : [l1]
  }
  const quadrado = `(${ladoCompletar(m, letra)})²`
  if (igual === undefined) return [{ trechos: [{ t: `${esq} ` }, { t: `+ ${q}`, novo: true }, { t: ` = ${quadrado}` }], cor: 'ambar' }]
  const soma = igual + q
  const linhas: LinhaLegenda[] = [
    { trechos: [{ t: `${esq} ` }, { t: `+ ${q}`, novo: true }, { t: ` = ${comSinal(igual)} ` }, { t: `+ ${q}`, novo: true }], cor: 'branco' },
    { trechos: [{ t: `${quadrado} = ${comSinal(soma)}` }], cor: soma < 0 ? 'rosa' : 'ambar' },
  ]
  if (soma < 0) linhas.push({ trechos: [{ t: 'nenhum quadrado tem área negativa' }], cor: 'rosa', nota: true })
  return linhas
}

/** How many caption lines the three phases can use, so the drawing keeps its place. */
export function linhasLegenda(c: Completar): number {
  return Math.max(...FASES.map((fase) => legendaCompletar({ ...c, fase }).length))
}

/** The caption as plain text (for the screen reader and the tests). */
export const legendaTexto = (c: Completar) => legendaCompletar(c).map((l) => l.trechos.map((t) => t.t).join('')).join('; ')
