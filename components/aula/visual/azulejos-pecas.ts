// As peças dos azulejos algébricos e a expressão que elas formam (sem React, para o Mexa e os testes).

export type Peca = 'x²' | 'x' | '1' | '−x²' | '−x' | '−1'

export const tipoDe = (p: string): Peca => {
  const t = p
    .trim()
    .replace(/^-/, '−')
    .replace(/\^2|2$/, '²')
  const base = t.replace('−', '')
  const k = base === '1' ? '1' : base.endsWith('²') ? 'x²' : 'x'
  return (t.startsWith('−') ? `−${k}` : k) as Peca
}

/** "3x", "x", "−2x²", "4": the count of a kind, written as a term. */
export function termo(tipo: Peca, n: number, letra = 'x'): string {
  const neg = tipo.startsWith('−')
  const k = tipo.replace('−', '')
  const corpo = k === '1' ? String(n) : `${n === 1 ? '' : n}${k === 'x²' ? `${letra}²` : letra}`
  return neg ? `−${corpo}` : corpo
}

/** The simplified expression of the pieces: 2x² + 3x − 1 (each kind once, in the usual order). */
export function expressaoDe(pecas: string[], letra = 'x'): string {
  const conta = (t: Peca) => pecas.filter((p) => tipoDe(p) === t).length
  const termos = (['x²', 'x', '1'] as const)
    .map((k) => {
      const n = conta(k) - conta(`−${k}` as Peca)
      return n === 0 ? '' : termo(n < 0 ? (`−${k}` as Peca) : k, Math.abs(n), letra)
    })
    .filter(Boolean)
  if (!termos.length) return '0'
  return termos.reduce((s, t, i) => (i === 0 ? t : t.startsWith('−') ? `${s} − ${t.slice(1)}` : `${s} + ${t}`), '')
}

/** The opposite piece: x → −x, −1 → 1. */
export const oposto = (t: Peca): Peca => (t.startsWith('−') ? t.slice(1) : `−${t}`) as Peca

/**
 * The heap of each piece, in the order of the list. `montes: 3` makes 3 equal
 * heaps; `montes: [3, 5]` makes a heap of 3 pieces and one of 5 (what is left
 * goes to the last heap).
 */
export function montesDe(n: number, montes?: number | number[]): number[] {
  if (Array.isArray(montes) && montes.length) {
    const out: number[] = []
    montes.forEach((k, m) => {
      for (let i = 0; i < Math.max(0, Math.round(k)) && out.length < n; i++) out.push(m)
    })
    while (out.length < n) out.push(montes.length - 1)
    return out
  }
  const nm = Math.max(1, Math.min(n, Math.round(typeof montes === 'number' ? montes : 1)))
  const por = Math.ceil(n / nm)
  return Array.from({ length: n }, (_, i) => Math.floor(i / por))
}

/** How many heaps there are. */
export function quantosMontes(n: number, montes?: number | number[]): number {
  const ms = montesDe(n, montes)
  return ms.length ? ms[ms.length - 1] + 1 : 1
}

/** Mexa "virar": the pieces with the heap `virar` turned (x² → −x², −2x → 2x) when `virado`. */
export function pecasViradas(pecas: string[], montes?: number | number[], virar?: number, virado?: boolean): Peca[] {
  const ms = montesDe(pecas.length, montes)
  return pecas.map((p, i) => (virado && virar !== undefined && ms[i] === virar ? oposto(tipoDe(p)) : tipoDe(p)))
}
