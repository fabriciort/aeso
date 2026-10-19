export type Relacao = '<' | '<=' | '>' | '>='
export type Intervalo = { de: number | null; ate: number | null; incluiDe?: boolean; incluiAte?: boolean }
export interface FaixasState {
  de: number; ate: number; intervalos: Intervalo[]
  rotulo?: string
  linhas?: { titulo: string; intervalos: Intervalo[] }[]
  teste?: { coeficientes: [number, number, number]; relacao: Relacao; direita: number }
  fatores?: [number, number]
  candidatos?: number[]; escolhido?: number; visitados?: number[]; ocultar?: boolean
}
export interface EspelhoState { par: [number, number]; fatores: number[]; fator?: number; visitados?: number[] }
export const contem = (i: Intervalo, x: number) => Number.isFinite(x) &&
  (i.de === null || (i.incluiDe ? x >= i.de : x > i.de)) && (i.ate === null || (i.incluiAte ? x <= i.ate : x < i.ate))
export const pertence = (is: Intervalo[], x: number) => is.some(i => contem(i, x))
export const comparar = (a: number, rel: Relacao, b: number) => rel === '<' ? a < b : rel === '<=' ? a <= b : rel === '>' ? a > b : a >= b
export const valorEm = (cs: [number, number, number], x: number) => cs[0] * x * x + cs[1] * x + cs[2]
export const relTex = (r: Relacao) => r === '<=' ? '\\le ' : r === '>=' ? '\\ge ' : r
export function intervaloValido(i: Intervalo): boolean {
  return Boolean(i && (i.de === null || Number.isFinite(i.de)) && (i.ate === null || Number.isFinite(i.ate)) &&
    (i.de === null || i.ate === null || i.de < i.ate || (i.de === i.ate && i.incluiDe && i.incluiAte)))
}
export function faixasJogaveis(s: FaixasState | undefined): s is FaixasState {
  return Boolean(s && Number.isFinite(s.de) && Number.isFinite(s.ate) && s.de < s.ate && Array.isArray(s.intervalos) && s.intervalos.every(intervaloValido) &&
    Array.isArray(s.candidatos) && s.candidatos.length >= 2 && new Set(s.candidatos).size === s.candidatos.length && s.candidatos.every(x => Number.isFinite(x) && x >= s.de && x <= s.ate) &&
    (!s.teste || (s.teste.coeficientes.every(Number.isFinite) && Number.isFinite(s.teste.direita) && s.candidatos.every(x => pertence(s.intervalos, x) === comparar(valorEm(s.teste!.coeficientes, x), s.teste!.relacao, s.teste!.direita)))))
}
export function espelhoJogavel(s: EspelhoState | undefined): s is EspelhoState {
  return Boolean(s && Array.isArray(s.par) && s.par.length === 2 && s.par.every(Number.isFinite) && s.par[0] < s.par[1] &&
    Array.isArray(s.fatores) && new Set(s.fatores).size === s.fatores.length && s.fatores.some(k => k < 0) && s.fatores.some(k => k > 0) && s.fatores.every(k => Number.isFinite(k) && k !== 0))
}
export const n = (x: number) => String(Object.is(x, -0) ? 0 : x).replace('-', '−').replace('.', ',')
export const t = (x: number) => String(Object.is(x, -0) ? 0 : x).replace('.', '{,}')
export function polinomio([a, b, c]: [number, number, number]) {
  return [[a, 'x^2'], [b, 'x'], [c, '']].filter(([k]) => k !== 0).map(([v, letra], j) => {
    const k = Number(v)
    return `${k < 0 ? '-' : j ? '+' : ''}${letra && Math.abs(k) === 1 ? '' : t(Math.abs(k))}${letra}`
  }).join('') || '0'
}
