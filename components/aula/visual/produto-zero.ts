/** Valores de (x − p)(x − q). Os fatores são números com sinal, não áreas. */
export interface ProdutoZeroState {
  raizes: [number, number]
  valores: number[]
  x?: number
  encontradas?: number[]
}

export const numeroComSinal = (n: number) => String(n).replace('-', '−')
export const fatorTexto = (r: number) => r === 0 ? 'x' : `x ${r < 0 ? '+' : '−'} ${Math.abs(r)}`
export function produtoEm(s: ProdutoZeroState, x: number) {
  const [p, q] = s.raizes
  return { a: x - p, b: x - q, produto: (x - p) * (x - q) }
}

/** Um Mexa só é oferecido quando todas as raízes podem ser tocadas. */
export function produtoJogavel(s?: ProdutoZeroState): boolean {
  return Boolean(s && s.raizes?.length === 2 && s.raizes.every(Number.isFinite)
    && s.valores?.length && s.valores.every(Number.isFinite)
    && s.raizes.every((r) => s.valores.includes(r)))
}
