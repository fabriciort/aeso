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
