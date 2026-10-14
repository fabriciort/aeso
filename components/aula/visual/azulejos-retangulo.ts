// Os azulejos de x² + bx + c arrumados num retângulo (AF.U2), sem React, para
// o desenho, o Mexa "fatorar" e os testes. O x² fica no canto de cima, à
// esquerda; p barras de pé à direita dele; q barras deitadas embaixo; e os c
// quadradinhos numa grade de p colunas por q linhas, no canto de baixo. O
// retângulo fecha quando p × q = c e p + q = b: os lados são x + p e x + q.

/** How long x is drawn, in units (not a whole number: x is not 3 or 4). */
export const LADO_X = 3.6
/** The gap between loose pieces, and between the rectangle and the bars left over. */
const VAO = 0.35
const VAO_SOBRA = 0.8

export type Par = [number, number]

/** The ways to put c units in a grid, p ≤ q: 6 → [1, 6], [2, 3]; 4 → [1, 4], [2, 2]. */
export function paresDeFatores(c: number): Par[] {
  const n = Math.round(c)
  const out: Par[] = []
  for (let p = 1; p * p <= n; p++) if (n % p === 0) out.push([p, n / p])
  return out
}

/** The pair that closes the rectangle of x² + bx + c (sum b, product c), or null when there is none. */
export function fatoracaoDe(b: number, c: number): Par | null {
  return paresDeFatores(c).find(([p, q]) => p + q === b) ?? null
}

export const mesmoPar = (a: Par, b: Par) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])

export type TipoPeca = 'x²' | 'x' | '1'

export interface PecaPos {
  /** Stable across arrangements: 'q' (the x²), 'b0'…, 'u0'…; a missing slot is 'f0'…. */
  id: string
  tipo: TipoPeca
  x: number
  y: number
  w: number
  h: number
  /** 'posta' in the rectangle (or loose), 'sobra' set aside, 'falta' an empty slot (dashed). */
  estado: 'posta' | 'sobra' | 'falta'
}

export interface Arranjo {
  pecas: PecaPos[]
  /** The whole drawing, in units. */
  largura: number
  altura: number
  /** Arranged as a rectangle (with `par`); loose otherwise. */
  par: Par | null
  /** Bars the rectangle asks for that are not there, and bars that are left over. */
  faltam: number
  sobram: number
  /** All bars used, no gaps: the rectangle closes. */
  fecha: boolean
  /** The size of the rectangle itself (x + p by x + q), when arranged. */
  ret?: { w: number; h: number }
}

/**
 * Where each piece of x² + bx + c sits. With no pair, loose: the x² first,
 * the bars standing beside it (up to 5 in a row) and the units below, up to
 * 6 in a row. With a pair [p, q]: the rectangle (bars to the right first,
 * then below); a bar it lacks is a dashed slot at the end of the bottom row;
 * a bar left over stands aside, to the right.
 */
export function arranjo(b: number, c: number, par: Par | null, X = LADO_X): Arranjo {
  const nb = Math.max(0, Math.round(b))
  const nc = Math.max(0, Math.round(c))
  const pecas: PecaPos[] = [{ id: 'q', tipo: 'x²', x: 0, y: 0, w: X, h: X, estado: 'posta' }]
  if (!par) {
    const porLinhaB = 5
    const linhasB = Math.max(1, Math.ceil(nb / porLinhaB))
    for (let i = 0; i < nb; i++) {
      const col = i % porLinhaB
      const lin = Math.floor(i / porLinhaB)
      pecas.push({ id: `b${i}`, tipo: 'x', x: X + VAO_SOBRA + col * (1 + VAO), y: lin * (X + VAO), w: 1, h: X, estado: 'posta' })
    }
    const topo = Math.max(X, linhasB * (X + VAO) - VAO) + VAO_SOBRA
    const porLinhaU = 6
    for (let i = 0; i < nc; i++) pecas.push({ id: `u${i}`, tipo: '1', x: (i % porLinhaU) * (1 + VAO), y: topo + Math.floor(i / porLinhaU) * (1 + VAO), w: 1, h: 1, estado: 'posta' })
    const largura = Math.max(X + VAO_SOBRA + Math.min(nb, porLinhaB) * (1 + VAO) - VAO, Math.min(nc, porLinhaU) * (1 + VAO) - VAO, X)
    const altura = nc ? topo + Math.ceil(nc / porLinhaU) * (1 + VAO) - VAO : Math.max(X, linhasB * (X + VAO) - VAO)
    return { pecas, largura, altura, par: null, faltam: 0, sobram: 0, fecha: false }
  }
  const [p, q] = par
  // The slots: p standing bars to the right of the x², then q lying bars below it.
  const vagas = [
    ...Array.from({ length: p }, (_, i) => ({ x: X + i, y: 0, w: 1, h: X })),
    ...Array.from({ length: q }, (_, j) => ({ x: 0, y: X + j, w: X, h: 1 })),
  ]
  const postas = Math.min(nb, vagas.length)
  vagas.forEach((v, k) => pecas.push(k < postas ? { id: `b${k}`, tipo: 'x', ...v, estado: 'posta' } : { id: `f${k - postas}`, tipo: 'x', ...v, estado: 'falta' }))
  const sobram = nb - postas
  for (let k = 0; k < sobram; k++) pecas.push({ id: `b${postas + k}`, tipo: 'x', x: X + p + VAO_SOBRA + k * (1 + VAO), y: 0, w: 1, h: X, estado: 'sobra' })
  // The units fill the corner row by row; the grid is p by q, so p × q must be c.
  for (let i = 0; i < nc; i++) pecas.push({ id: `u${i}`, tipo: '1', x: X + (i % Math.max(1, p)), y: X + Math.floor(i / Math.max(1, p)), w: 1, h: 1, estado: 'posta' })
  const faltam = vagas.length - postas
  const largura = X + p + (sobram ? VAO_SOBRA + sobram * (1 + VAO) - VAO : 0)
  const altura = Math.max(X + q, X + Math.ceil(nc / Math.max(1, p)))
  return { pecas, largura, altura, par, faltam, sobram, fecha: faltam === 0 && sobram === 0 && p * q === nc, ret: { w: X + p, h: X + q } }
}

/** The biggest drawing among the arrangements a Mexa can show (loose and every pair), so the scale never jumps. */
export function extensaoMaxima(b: number, c: number, pares: (Par | null)[], X = LADO_X): { largura: number; altura: number } {
  const as = pares.map((par) => arranjo(b, c, par, X))
  return { largura: Math.max(...as.map((a) => a.largura)), altura: Math.max(...as.map((a) => a.altura)) }
}

/** x² + 5x + 6, with the letter. */
export function trinomioTexto(b: number, c: number, letra = 'x'): string {
  const termos = [`${letra}²`, b ? `${b === 1 ? '' : b}${letra}` : '', c ? String(c) : ''].filter(Boolean)
  return termos.join(' + ')
}

/** x + 3 (x alone for 0). */
export const ladoTexto = (n: number, letra = 'x') => (n ? `${letra} + ${n}` : letra)

/** (x + 2)(x + 3); a square reads (x + 2)². */
export function fatoradoTexto(par: Par, letra = 'x'): string {
  if (par[0] === par[1]) return `(${ladoTexto(par[0], letra)})²`
  return `(${ladoTexto(par[0], letra)})(${ladoTexto(par[1], letra)})`
}

/**
 * What a pair says about the rectangle, for the Mexa: "1 + 6 = 7 barras, mas
 * você tem 5: faltam 2." or "… sobram 2."; null when it closes.
 */
export function avisoDoPar(b: number, par: Par): string | null {
  const s = par[0] + par[1]
  if (s === b) return null
  const d = Math.abs(s - b)
  const barras = (n: number) => (n === 1 ? '1 barra' : `${n} barras`)
  if (s > b) return `${par[0]} + ${par[1]} = ${s} barras, mas você tem ${b}: ${d === 1 ? 'falta' : 'faltam'} ${barras(d)}. Toque de novo.`
  return `${par[0]} + ${par[1]} = ${s} barras, mas você tem ${b}: ${d === 1 ? 'sobra' : 'sobram'} ${barras(d)}. Toque de novo.`
}

/** Under the drawing: the expression, what is missing or left over, or the factored form. */
export function legendaArranjo(a: Arranjo, b: number, c: number, letra = 'x'): string {
  if (!a.par) return trinomioTexto(b, c, letra)
  if (a.fecha) return `${trinomioTexto(b, c, letra)} = ${fatoradoTexto(a.par, letra)}`
  if (a.faltam) return a.faltam === 1 ? 'falta 1 barra' : `faltam ${a.faltam} barras`
  if (a.sobram) return a.sobram === 1 ? 'sobra 1 barra' : `sobram ${a.sobram} barras`
  return `${a.par[0]} × ${a.par[1]} não dá ${c}`
}

/** The state of the rectangle tiles, as the content writes it. */
export interface RetanguloAzulejos {
  /** x² + bx + c. */
  b: number
  c: number
  /** The arrangement shown: a pair, or null (loose). */
  par: Par | null
}

const ehPar = (v: unknown): v is Par => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)

/**
 * Reads `retangulo: [p, q]` (the finished rectangle, (x + p)(x + q)) or
 * `fatorar: [b, c]` with an optional `arranjo: [p, q]` (loose without it).
 */
export function retanguloDe(s: { retangulo?: unknown; fatorar?: unknown; arranjo?: unknown }): RetanguloAzulejos | null {
  if (ehPar(s.fatorar)) return { b: s.fatorar[0], c: s.fatorar[1], par: ehPar(s.arranjo) ? s.arranjo : null }
  if (ehPar(s.retangulo)) return { b: s.retangulo[0] + s.retangulo[1], c: s.retangulo[0] * s.retangulo[1], par: s.retangulo }
  return null
}
