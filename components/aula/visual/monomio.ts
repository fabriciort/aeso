// Monômios para o retângulo por área (sem React, para o player e os testes):
// ler '−3x²', multiplicar dois monômios (x² · 3x = 3x³) e somar as áreas
// juntando os termos semelhantes (x² + 3x + 2x + 6 = x² + 5x + 6).

export const MENOS = '−'

/** A monomial: the coefficient and each letter with its exponent ({ x: 2 } is x²). */
export interface Monomio {
  k: number
  letras: Record<string, number>
}

const SOBRE: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
const PARA_SOBRE = Object.fromEntries(Object.entries(SOBRE).map(([s, d]) => [d, s]))

/** '3x', 'x²', '−2x²', '-x', 'xy', '2a', 'x^2', '1,5', 7 → a monomial; anything else (like '?') → null. */
export function lerMonomio(v: number | string): Monomio | null {
  if (typeof v === 'number') return Number.isFinite(v) ? { k: v, letras: {} } : null
  let t = v.trim().replace(/\s+/g, '')
  let sinal = 1
  while (/^[+\-−]/.test(t)) {
    if (t[0] !== '+') sinal = -sinal
    t = t.slice(1)
  }
  const m = t.match(/^(\d+(?:[.,]\d+)?)?((?:[a-zA-Z](?:\^\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?)*)$/)
  if (!m || (!m[1] && !m[2])) return null
  const k = sinal * (m[1] ? Number(m[1].replace(',', '.')) : 1)
  const letras: Record<string, number> = {}
  for (const [, l, exp] of m[2].matchAll(/([a-zA-Z])(\^\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?/g)) {
    const e = exp ? Number(exp.startsWith('^') ? exp.slice(1) : [...exp].map((c) => SOBRE[c]).join('')) : 1
    letras[l] = (letras[l] ?? 0) + e
  }
  return { k, letras: limpa(letras) }
}

function limpa(letras: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(letras).filter(([, e]) => e !== 0))
}

/** The letter part, in alphabetical order: 'x²y'. */
export function parteLiteral(m: Monomio): string {
  return Object.keys(m.letras)
    .sort()
    .map((l) => (m.letras[l] === 1 ? l : `${l}${String(m.letras[l]).split('').map((d) => PARA_SOBRE[d]).join('')}`))
    .join('')
}

/** The grade (sum of the exponents): 3x²y has grade 3. */
export const grau = (m: Monomio) => Object.values(m.letras).reduce((a, b) => a + b, 0)

/** A number written the Brazilian way, with the true minus sign: −6, 1,5. */
export function escreveNumero(n: number): string {
  const r = Math.round(n * 1e9) / 1e9
  const t = Math.abs(r).toLocaleString('pt-BR', { maximumFractionDigits: 6 })
  return r < 0 ? `${MENOS}${t}` : t
}

/** '3x³', '−x', 'xy', '−6'. A coefficient 1 or −1 is hidden next to letters. */
export function escreveMonomio(m: Monomio): string {
  const lit = parteLiteral(m)
  if (!lit || m.k === 0) return escreveNumero(m.k)
  const a = Math.abs(m.k)
  return `${m.k < 0 ? MENOS : ''}${a === 1 ? '' : escreveNumero(a)}${lit}`
}

export function multiplica(a: Monomio, b: Monomio): Monomio {
  const letras = { ...a.letras }
  for (const [l, e] of Object.entries(b.letras)) letras[l] = (letras[l] ?? 0) + e
  return { k: a.k * b.k, letras: limpa(letras) }
}

/**
 * The area of one part: 3 × 4 = 12, 3 × x = 3x, x × x = x², x² · 3x = 3x³,
 * 2x · (−3) = −6x, −x · −2 = 2x. Two numbers give a number; anything else, text.
 * A part that is not a monomial (like '?') gives '?'.
 */
export function produto(a: number | string, b: number | string): number | string {
  if (typeof a === 'number' && typeof b === 'number') return a * b
  const ma = lerMonomio(a)
  const mb = lerMonomio(b)
  if (!ma || !mb) return '?'
  return escreveMonomio(multiplica(ma, mb))
}

/** Whether a part or an area is negative (−2, '−3x', '-x²'). */
export function ehNegativo(v: number | string | undefined): boolean {
  if (v === undefined) return false
  const m = lerMonomio(v)
  return m ? m.k < 0 : false
}

/** Terms written as a sum, the signs folded in: x² + 3x − 2x − 6. */
export function escreveSoma(termos: (number | string)[]): string {
  return pedacosSoma(termos).join('') || '0'
}

/**
 * The sum split term by term, each with its sign in front: ['x²', ' + 3x',
 * ' − 3x', ' − 9'] (joined, it is `escreveSoma`). Terms that are not
 * monomials are left out.
 */
export function pedacosSoma(termos: (number | string)[]): string[] {
  const ms = termos.map(lerMonomio).filter((m): m is Monomio => m !== null)
  return ms.map((m, i) => {
    const t = escreveMonomio(m)
    if (i === 0) return t
    return t.startsWith(MENOS) ? ` ${MENOS} ${t.slice(1)}` : ` + ${t}`
  })
}

/**
 * Which terms cancel: each term pairs with the first later term that is its
 * opposite (3x and −3x, 9 and −9), and both are marked. A term pairs once.
 * `undefined` (or anything that is not a monomial) never cancels.
 */
export function termosCancelados(termos: (number | string | undefined)[]): boolean[] {
  const ms = termos.map((t) => (t === undefined ? null : lerMonomio(t)))
  const out = ms.map(() => false)
  ms.forEach((m, i) => {
    if (!m || out[i] || m.k === 0) return
    const lit = parteLiteral(m)
    const j = ms.findIndex((n, jj) => jj > i && !out[jj] && n !== null && parteLiteral(n) === lit && Math.abs(n.k + m.k) < 1e-9)
    if (j >= 0) out[i] = out[j] = true
  })
  return out
}

/** A cell of the rectangle by area: [linha, coluna] of the parts. */
export type Celula = [number, number]

const ehCelula = (v: unknown): v is Celula => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number')

/**
 * The cells `destaque` lights: one cell ([0, 1]) or a list of cells
 * ([[0, 1], [1, 0]]). Anything else ('linha', 'coluna', nothing) lights none here.
 */
export function celulasDestaque(d: unknown): Celula[] {
  if (ehCelula(d)) return [d]
  if (Array.isArray(d)) return d.filter(ehCelula)
  return []
}

/** Like terms combined, highest grade first (ties keep the order they came in): x² + 3x + 2x + 6 → x² + 5x + 6. */
export function juntaTermos(termos: (number | string)[]): Monomio[] {
  const grupos: { lit: string; m: Monomio }[] = []
  for (const t of termos) {
    const m = lerMonomio(t)
    if (!m) continue
    const lit = parteLiteral(m)
    const g = grupos.find((x) => x.lit === lit)
    if (g) g.m = { ...g.m, k: Math.round((g.m.k + m.k) * 1e9) / 1e9 }
    else grupos.push({ lit, m })
  }
  return grupos
    .map((g, i) => ({ ...g, i }))
    .filter((g) => g.m.k !== 0)
    .sort((a, b) => grau(b.m) - grau(a.m) || a.i - b.i)
    .map((g) => g.m)
}

/** The sum of the terms, simplified: 'x² + 5x + 6' (or '0'). */
export function somaTermos(termos: (number | string)[]): string {
  const ms = juntaTermos(termos)
  return ms.length ? escreveSoma(ms.map(escreveMonomio)) : '0'
}

// O retângulo por área com monômios nos lados: quanto cada parte ocupa no
// desenho e o que o Mexa "revelar" descobre.

/** The letters of the parts, in alphabetical order (the first one is drawn longest). */
export function letrasDe(partes: (number | string)[]): string[] {
  const ls = new Set<string>()
  for (const p of partes) for (const l of Object.keys(lerMonomio(p)?.letras ?? {})) ls.add(l)
  return [...ls].sort()
}

/** How long one letter is drawn: x a little longer than the numbers; y shorter than x (they are not equal). */
const FATOR_LETRA = [1, 0.7, 0.55, 0.45]

/**
 * The drawing length of a part, in the scale of the numbers: a number by its
 * absolute value; x by `letra`; x² longer than x; k·x about k lengths of x,
 * clamped (5x is not drawn 5 times longer, or the other parts would vanish).
 */
export function comprimento(p: number | string, letra: number, letras: string[] = []): number {
  const m = lerMonomio(p)
  if (!m) return letra
  const ls = Object.entries(m.letras)
  const a = Math.abs(m.k)
  if (!ls.length) return a
  const c = a <= 2 ? a : Math.min(3.5, 2 + (a - 2) * 0.5)
  const corpo = ls.reduce((s, [l, e]) => s + (FATOR_LETRA[Math.max(0, letras.indexOf(l))] ?? 0.4) * (1 + 0.6 * (e - 1)), 0)
  return letra * c * corpo
}

/** The scale of a letter when the content gives none: 1,6 times the biggest number part (at least 4). */
export function letraPadrao(partes: (number | string)[]): number {
  const nums = partes.map(lerMonomio).filter((m): m is Monomio => m !== null && !Object.keys(m.letras).length)
  return Math.max(4, ...nums.map((m) => Math.abs(m.k) * 1.6))
}

export interface LadosArea {
  base?: (number | string)[]
  altura?: (number | string)[]
  oculto?: 'base' | 'altura'
}

/**
 * Mexa "revelar": what the taps uncover. With a hidden side (`oculto`), each
 * part of that side ('b0', 'b1' or 'h0'…); otherwise each cell's area ('0-1').
 */
export function revelaveis(s: LadosArea): string[] {
  const b = s.base ?? []
  const h = s.altura ?? []
  if (s.oculto === 'base') return b.map((_, j) => `b${j}`)
  if (s.oculto === 'altura') return h.map((_, i) => `h${i}`)
  return h.flatMap((_, i) => b.map((_, j) => `${i}-${j}`))
}

/** The key a tap on the cell (i, j) uncovers. */
export function chaveRevelar(s: LadosArea, i: number, j: number): string {
  if (s.oculto === 'base') return `b${j}`
  if (s.oculto === 'altura') return `h${i}`
  return `${i}-${j}`
}
