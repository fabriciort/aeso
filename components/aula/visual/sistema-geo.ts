/** ax + by = c. Os coeficientes descrevem retas, nunca 0x + 0y = c. */
export type EquacaoSistema = [number, number, number]
export type ParSistema = [number, number]
export interface SistemaState {
  equacoes: [EquacaoSistema, EquacaoSistema]
  pares?: ParSistema[]
  par?: ParSistema
  rotulos?: [string, string]
  modo?: 'testar' | 'somar'
  fatores?: [number, number]
  etapa?: number
}
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-8
export const atende = (e: EquacaoSistema, p: ParSistema) => perto(e[0] * p[0] + e[1] * p[1], e[2])
export const escalar = (e: EquacaoSistema, k: number): EquacaoSistema => [e[0] * k, e[1] * k, e[2] * k]
export function somadas(s: SistemaState): EquacaoSistema {
  const [a, b] = s.equacoes.map((e, j) => escalar(e, s.fatores?.[j] ?? 1))
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
export function sistemaValido(s: SistemaState | undefined): s is SistemaState {
  return Boolean(s && Array.isArray(s.equacoes) && s.equacoes.length === 2 && s.equacoes.every(e =>
    Array.isArray(e) && e.length === 3 && e.every(Number.isFinite) && (e[0] !== 0 || e[1] !== 0)))
}
export function parJogavel(s: SistemaState | undefined, p: unknown): boolean {
  return sistemaValido(s) && Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) &&
    s.equacoes.every(e => atende(e, p as ParSistema)) &&
    Boolean(s.pares?.some(q => q[0] === p[0] && q[1] === p[1]))
}
export function somaJogavel(s: SistemaState | undefined): boolean {
  if (!sistemaValido(s) || (s.fatores && (s.fatores.length !== 2 || !s.fatores.every(k => Number.isFinite(k) && k !== 0)))) return false
  const [a, b, c] = somadas(s)
  return Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && ((a === 0 && b !== 0) || (a !== 0 && b === 0))
}
export function linearTex([a, b, c]: EquacaoSistema): string {
  const termo = (n: number, letra: string) => `${Math.abs(n) === 1 ? '' : Math.abs(n)}${letra}`
  const x = a === 0 ? '' : `${a < 0 ? '-' : ''}${termo(a, 'x')}`
  const y = b === 0 ? '' : `${b < 0 ? '-' : x ? '+' : ''}${termo(b, 'y')}`
  return `${x}${y || (x ? '' : '0')}=${c}`
}
