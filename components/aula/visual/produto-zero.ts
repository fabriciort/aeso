// O produto que zera (AF.U3), sem React, para o desenho, o Mexa "zerar" e os
// testes. Os fatores são x + a (a = −2 é "x − 2"; a = 0 é "x"). O aluno troca
// o x e vê cada fator e o produto: o produto só zera quando um fator zera.

export interface ProdutoZero {
  /** O a de cada fator x + a: [-2, 3] é (x − 2)(x + 3). */
  fatores: number[]
  /** Os valores de x que o aluno pode pôr, na ordem dos botões. */
  valores: number[]
  /** O x da conta mostrada embaixo. */
  x?: number
  /** Os valores já postos: os números aparecem na tabela. */
  marcados: number[]
  letra: string
}

const ehNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Reads `produtoZero: { fatores, valores, x?, marcados?, letra? }`; null without factors or values. */
export function produtoZeroDe(s: unknown): ProdutoZero | null {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null
  const o = s as Record<string, unknown>
  const fatores = Array.isArray(o.fatores) ? o.fatores.filter(ehNum) : []
  const valores = Array.isArray(o.valores) ? [...new Set(o.valores.filter(ehNum))] : []
  if (!fatores.length || !valores.length) return null
  const marcados = Array.isArray(o.marcados) ? o.marcados.filter((v): v is number => ehNum(v) && valores.includes(v)) : []
  const x = ehNum(o.x) ? o.x : undefined
  return { fatores, valores, x, marcados: x !== undefined && !marcados.includes(x) ? [...marcados, x] : marcados, letra: typeof o.letra === 'string' && o.letra ? o.letra : 'x' }
}

/** A number with the true minus sign and the decimal comma: −3, 0,5. */
export const numTexto = (n: number) => {
  const t = String(Math.abs(n)).replace('.', ',')
  return n < 0 ? `−${t}` : t
}

/** x − 2, x + 3, x. */
export const fatorTexto = (a: number, letra = 'x') => (a === 0 ? letra : `${letra} ${a < 0 ? '−' : '+'} ${numTexto(Math.abs(a))}`)

/** (x − 2)(x + 3); x(x − 4) when a factor is x alone. */
export const produtoTexto = (fatores: number[], letra = 'x') => fatores.map((a) => (a === 0 && fatores.length > 1 ? letra : `(${fatorTexto(a, letra)})`)).join('')

/** Rounded, to keep 0,1 + 0,2 from showing as 0,30000000000000004. */
const limpo = (n: number) => Math.round(n * 1e9) / 1e9 || 0

export const valorFator = (x: number, a: number) => limpo(x + a)
export const produtoEm = (x: number, fatores: number[]) => limpo(fatores.reduce((p, a) => p * (x + a), 1))

/** The x that zero each factor: x − 2 is zero at 2. */
export const raizesDe = (fatores: number[]) => [...new Set(fatores.map((a) => limpo(-a)))]

/** A piece of the worked line; `zero` lights a factor that is zero. */
export interface Trecho {
  t: string
  zero?: boolean
}

/** The value of x put in: (2 − 2) · (2 + 3); a factor x alone shows the number, in parentheses when negative. */
export function substituicao(x: number, fatores: number[]): Trecho[] {
  const out: Trecho[] = []
  fatores.forEach((a, i) => {
    if (i) out.push({ t: ' · ' })
    const zero = valorFator(x, a) === 0
    if (a === 0) out.push({ t: x < 0 ? `(${numTexto(x)})` : numTexto(x), zero })
    else out.push({ t: `(${numTexto(x)} ${a < 0 ? '−' : '+'} ${numTexto(Math.abs(a))})`, zero })
  })
  return out
}

/** The factors worked out: 0 · 5, (−5) · 0. */
export function valoresTexto(x: number, fatores: number[]): Trecho[] {
  const out: Trecho[] = []
  fatores.forEach((a, i) => {
    if (i) out.push({ t: ' · ' })
    const v = valorFator(x, a)
    out.push({ t: v < 0 ? `(${numTexto(v)})` : numTexto(v), zero: v === 0 })
  })
  return out
}

/** The whole worked line, as text: (2 − 2) · (2 + 3) = 0 · 5 = 0. */
export const contaTexto = (x: number, fatores: number[]) => `${substituicao(x, fatores).map((t) => t.t).join('')} = ${valoresTexto(x, fatores).map((t) => t.t).join('')} = ${numTexto(produtoEm(x, fatores))}`
