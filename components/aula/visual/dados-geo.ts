// Os dados da U19, sem React (para o visual, o Mexa e os testes): o gráfico de
// pontos sobre a reta, a média (o ponto de equilíbrio), a mediana (o do meio
// da fila), a moda (a pilha mais alta), a amplitude, os desvios e o desvio
// padrão.

import { fmtNum } from './figura-geo'
import { passoRedondo } from './plano-geo'

export type CorDados = boolean | 'ambar' | 'azul' | 'verde' | 'erro' | 'cinza' | 'lilas' | 'branco'

export interface Conjunto {
  nome?: string
  valores: number[]
}

export interface DadosState {
  /** Os valores, na ordem em que foram anotados: [7, 5, 8, 7, 6]. */
  valores?: number[]
  /** Dois (ou três) conjuntos na mesma escala, um embaixo do outro: [{ nome: 'Loja A', valores: [...] }]. */
  conjuntos?: Conjunto[]
  /** A reta: o começo, o fim, a distância entre as marcas e de quantas em quantas marcas vai um número. */
  de?: number
  ate?: number
  passo?: number
  numeros?: number | false
  /** Junto dos números das medidas ('min', 'mg', 'R$' vai antes: use `antes`). */
  unidade?: string
  antes?: string
  /** O apoio (o triângulo) na média, com "média 7"; a reta fica reta. */
  media?: boolean
  /** O apoio neste lugar: fora da média, a reta inclina para o lado mais pesado. */
  fulcro?: number
  /** A mediana: uma linha azul no valor do meio; com `fila`, os do meio da fila acesos. */
  mediana?: boolean
  /** A moda: as pilhas mais altas em verde, com "moda". */
  moda?: boolean
  /** Os pontos saem da reta e formam uma fila, do menor ao maior, com o número dentro. */
  fila?: boolean
  /** O colchete do menor ao maior, com "amplitude: 12 − 3 = 9". */
  amplitude?: boolean
  /** O segmento de cada ponto até a média (à direita em verde, à esquerda em rosa), com o desvio (+2, −3). */
  desvios?: boolean
  /** Embaixo, a soma dos desvios: (+2) + (−3) + … = 0. */
  somaDesvios?: boolean
  /** As distâncias até a média, todas da mesma cor, e embaixo a distância média. */
  distancias?: boolean
  /** A faixa média ± desvio padrão, sombreada. `true` calcula (dividindo por n); um número dá o desvio. */
  faixa?: boolean | number
  /** Valores acesos em âmbar (todos os pontos com esse valor): 30 ou [2, 30]. */
  destaque?: number | number[]
  titulo?: string
  rotulo?: string
  /** Mexa: o conjunto que recebe os toques (com `conjuntos`), o passo do arraste do apoio. */
  ativo?: number
  ajustePasso?: number
}

const EPS = 1e-9
const limpa = (v: number) => Math.round(v * 1e9) / 1e9
const finito = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** The sets drawn: `conjuntos`, or `valores` as one set. Non-numbers are left out. */
export function conjuntosDe(s: DadosState): Conjunto[] {
  if (Array.isArray(s.conjuntos) && s.conjuntos.length)
    return s.conjuntos.slice(0, 3).map((c) => ({ nome: typeof c?.nome === 'string' ? c.nome : undefined, valores: Array.isArray(c?.valores) ? c.valores.filter(finito) : [] }))
  return [{ valores: Array.isArray(s.valores) ? s.valores.filter(finito) : [] }]
}

/** The set the Mexa works on. */
export const ativoDe = (s: DadosState): number[] => {
  const cs = conjuntosDe(s)
  return cs[Math.min(cs.length - 1, Math.max(0, s.ativo ?? 0))]?.valores ?? []
}

export function media(v: number[]): number {
  return v.length ? limpa(v.reduce((a, b) => a + b, 0) / v.length) : 0
}

/** The indices in queue order: from the smallest to the biggest (a tie keeps the order of the list). */
export function ordemFila(v: number[]): number[] {
  return v.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((p) => p[1])
}

/** The places in the middle of the queue: one (odd) or two (even). */
export function meioDaFila(n: number): number[] {
  if (n <= 0) return []
  return n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]
}

export function mediana(v: number[]): number {
  if (!v.length) return 0
  const o = [...v].sort((a, b) => a - b)
  const m = meioDaFila(o.length)
  return limpa(m.reduce((a, i) => a + o[i], 0) / m.length)
}

/** The values that appear most (all of them, in a tie). Every value once: no mode. */
export function modas(v: number[]): number[] {
  const c = contagens(v)
  const max = Math.max(0, ...c.values())
  if (max <= 1 && v.length > 1) return []
  return [...c.entries()].filter(([, n]) => n === max).map(([x]) => x).sort((a, b) => a - b)
}

export function contagens(v: number[]): Map<number, number> {
  const c = new Map<number, number>()
  for (const x of v) c.set(limpa(x), (c.get(limpa(x)) ?? 0) + 1)
  return c
}

export function amplitude(v: number[]): number {
  return v.length ? limpa(Math.max(...v) - Math.min(...v)) : 0
}

/** Each value minus the mean (they add up to zero). */
export function desvios(v: number[]): number[] {
  const m = media(v)
  return v.map((x) => limpa(x - m))
}

/** The mean distance to the mean (the mean absolute deviation). */
export function distanciaMedia(v: number[]): number {
  return v.length ? limpa(desvios(v).reduce((a, d) => a + Math.abs(d), 0) / v.length) : 0
}

/** The standard deviation: the root of the mean of the squared deviations (by n; by n − 1 with `amostra`). */
export function desvioPadrao(v: number[], amostra = false): number {
  const n = v.length - (amostra ? 1 : 0)
  if (n <= 0) return 0
  return limpa(Math.sqrt(desvios(v).reduce((a, d) => a + d * d, 0) / n))
}

/** The height of each point in its stack (0 is on the line), in the order of the list. */
export function niveis(v: number[]): number[] {
  const vistos = new Map<number, number>()
  return v.map((x) => {
    const k = limpa(x)
    const n = vistos.get(k) ?? 0
    vistos.set(k, n + 1)
    return n
  })
}

export interface EixoDados {
  de: number
  ate: number
  passo: number
  /** A number every `numeros` marks. */
  numeros: number
  marcas: number[]
}

/** The line: from a step before the smallest to a step after the biggest (or what the state says). */
export function eixoDados(s: DadosState): EixoDados {
  const todos = conjuntosDe(s).flatMap((c) => c.valores)
  const extra = [s.fulcro].filter(finito)
  const lo = Math.min(...todos, ...extra, ...(todos.length || extra.length ? [] : [0]))
  const hi = Math.max(...todos, ...extra, ...(todos.length || extra.length ? [] : [10]))
  const passo = finito(s.passo) && s.passo > 0 ? s.passo : passoRedondo(Math.max(hi - lo, 1) / 8)
  // A margin of at least half a step on each side, so no point sits on the end of the line.
  const baixo = Math.floor(lo / passo + EPS) * passo
  const alto = Math.ceil(hi / passo - EPS) * passo
  // Data that is never negative (times, weights, money) keeps the line from 0 on.
  const de = finito(s.de) ? s.de : limpa(lo - baixo < passo / 2 && !(lo >= 0 && baixo - passo < 0) ? baixo - passo : baixo)
  const ateRaw = finito(s.ate) ? s.ate : limpa(alto - hi < passo / 2 ? alto + passo : alto)
  const ate = Math.max(de + passo, ateRaw)
  const marcas: number[] = []
  for (let k = 0; de + k * passo <= ate + EPS && k < 400; k++) marcas.push(limpa(de + k * passo))
  const numeros = s.numeros === false ? 0 : finito(s.numeros) && s.numeros >= 1 ? Math.round(s.numeros) : 0
  return { de, ate, passo, numeros, marcas }
}

/** A number every k marks, so the numbers fit side by side. */
export function numerosCabem(e: EixoDados, larguraPx: number, fs = 12): number {
  if (e.numeros) return e.numeros
  const n = Math.max(1, e.marcas.length - 1)
  const maior = Math.max(...e.marcas.map((m) => fmtNum(m).length)) * fs * 0.56 + 8
  return [1, 2, 5, 10, 20, 50].find((k) => (larguraPx / n) * k >= maior) ?? 100
}

/** How much the line tilts (screen degrees, clockwise: the right side goes down) with the support at `fulcro`. */
export function inclinacao(valores: number[], fulcro: number, e: EixoDados): number {
  if (!valores.length) return 0
  const d = (media(valores) - fulcro) / Math.max(EPS, e.ate - e.de)
  if (Math.abs(d) < 1e-6) return 0
  // Proportional to how far the support is from the mean (the student sees it level off as it gets closer), up to 10°.
  return Math.max(-10, Math.min(10, d * 45 + Math.sign(d) * 1.5))
}

/** Mexa "equilibrar": the support snapped to the drag step (the line's step, or a half, a quarter, a fifth, a tenth of it: what reaches the mean). */
export function passoDoFulcro(s: DadosState, alvo: number): number {
  const e = eixoDados(s)
  const divide = (p: number) => Math.abs((alvo - e.de) / p - Math.round((alvo - e.de) / p)) < 1e-6
  return finito(s.ajustePasso) && s.ajustePasso > 0 ? s.ajustePasso : ([1, 2, 4, 5, 10].map((k) => e.passo / k).find(divide) ?? e.passo / 10)
}

/** Mexa "equilibrar": how close to the mean the support snaps onto it (a finger is not precise): half a drag step, or 3 % of the line. */
export function imaDoFulcro(s: DadosState, alvo: number): number {
  const e = eixoDados(s)
  return Math.max(passoDoFulcro(s, alvo) / 2, (e.ate - e.de) * 0.03)
}

/** Mexa "equilibrar": the support where the finger is, on the drag step; near the mean, on the mean. */
export function encaixarFulcro(s: DadosState, v: number, alvo: number): number {
  const e = eixoDados(s)
  if (Math.abs(v - alvo) <= imaDoFulcro(s, alvo)) return alvo
  const passo = passoDoFulcro(s, alvo)
  return limpa(Math.min(e.ate, Math.max(e.de, Math.round((v - e.de) / passo) * passo + e.de)))
}

/** Mexa "equilibrar": the support is on the mean (a mean like 7,33 is not on the drag step: it snaps). */
export const fulcroNaMedia = (s: DadosState, f: number, m: number) => Math.abs(f - m) <= imaDoFulcro(s, m) + 1e-9

/** Mexa "achar": the value read where the student touched the line. Near a value, the mean or the median, that one; else the nearest half step. */
export function lerValor(valores: number[], v: number, e: EixoDados): number {
  const cands = [...new Set([...valores, media(valores), mediana(valores)].map(limpa))]
  const perto = cands.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), cands[0] ?? v)
  if (cands.length && Math.abs(perto - v) <= e.passo * 0.6) return perto
  return limpa(Math.round((v - e.de) / (e.passo / 2)) * (e.passo / 2) + e.de)
}

export const mesmo = (a: number, b: number) => Math.abs(a - b) < 1e-6

/** A number with its unit: "7 min", "R$ 1.200". */
export function comUnidade(s: DadosState, v: number): string {
  return `${s.antes ?? ''}${fmtNum(v)}${s.unidade ? ` ${s.unidade}` : ''}`
}

/** A deviation with its sign: +2, −3, 0. */
export function comSinal(d: number): string {
  return Math.abs(d) < 1e-9 ? '0' : d > 0 ? `+${fmtNum(d)}` : fmtNum(d)
}

/** The sum of the deviations, written out: (+2) + (−3) + (+1) = 0. */
export function somaDesviosTexto(v: number[]): string {
  const ds = desvios(v)
  const soma = limpa(ds.reduce((a, b) => a + b, 0))
  return `${ds.map((d) => `(${comSinal(d)})`).join(' + ')} = ${fmtNum(Math.abs(soma) < 1e-6 ? 0 : soma)}`
}

export function destaquesDe(s: DadosState): number[] {
  return finito(s.destaque) ? [s.destaque] : Array.isArray(s.destaque) ? s.destaque.filter(finito) : []
}
