// O sorteio da U19, sem React (para o visual, o Mexa e os testes): os casos
// possíveis (as faces do dado, a moeda, as bolas no saco, as cartas), os
// favoráveis e a simulação: jogar muitas vezes, contar e ver a frequência
// relativa chegar perto da chance. A simulação é determinística: a mesma
// `semente` dá sempre os mesmos resultados.

import { corCanonica, opcaoDe, type Caso, type CorCaso } from './contagem-geo'

export interface SorteioState {
  /** Os casos: 'dado', 'moeda', ou uma lista (cartas, nomes, números): ['A', 'K', 'Q'] ou [{ nome: 'A', cor: 'erro' }]. */
  casos?: unknown
  /** As bolas no saco, por cor: { azul: 3, vermelha: 2 } (ou [['azul', 3], ['vermelha', 2]]). */
  bolas?: unknown
  /** Os favoráveis: uma lista de índices, { cor: 'azul' }, { valores: [2, 4, 6] }, { maior: 4 }, { menor: 3 }. */
  favoraveis?: unknown
  /** Mexa "favoráveis". */
  marcar?: boolean
  chance?: boolean
  simplificada?: boolean
  porcentagem?: boolean
  /** Um caso que saiu: ele sobe, com um anel; os outros apagam. */
  sorteado?: number
  // ---- a simulação
  /** Quantas vezes já jogou: com ela, o palco mostra as contagens (barras) no lugar dos casos. */
  jogadas?: number
  /** A semente do sorteio (padrão 1). Mude para ter outra sequência. */
  semente?: number
  /** Os primeiros resultados, fixos: ['cara', 'cara', 'cara', 'cara', 'cara'] (a falácia do jogador). Depois, o sorteio segue. */
  sequencia?: unknown[]
  /** A curva da frequência relativa ao longo das jogadas: true (do primeiro caso) ou o índice do caso. */
  curva?: boolean | number
  /** A linha da chance sobre as barras (padrão: sim). */
  probabilidade?: boolean
  /** Mexa "jogar": os botões (padrão [1, 10, 100]). */
  botoes?: number[]
  rotulo?: string
}

export type TipoSorteio = 'dado' | 'moeda' | 'bolas' | 'lista'

export interface CasoSorteio extends Caso {
  /** The outcome it counts for in the simulation (balls of a colour are one outcome). */
  resultado: number
}

export interface Resultado {
  nome: string
  cor?: CorCaso
  /** Weight (balls of that colour; 1 for a face). */
  peso: number
}

const NOMES_COR: Record<CorCaso, string> = { ambar: 'amarela', azul: 'azul', verde: 'verde', erro: 'vermelha', cinza: 'cinza', lilas: 'roxa', branco: 'branca', preto: 'preta' }

export function tipoSorteio(s: SorteioState): TipoSorteio {
  if (s.casos === 'dado') return 'dado'
  if (s.casos === 'moeda') return 'moeda'
  if (s.bolas && typeof s.bolas === 'object') return 'bolas'
  return 'lista'
}

/** The colours of the bag, with how many of each (an unknown colour is left out). */
export function bolasDe(s: SorteioState): { cor: CorCaso; nome: string; n: number }[] {
  const b = s.bolas
  const pares: [unknown, unknown][] = Array.isArray(b) ? b.filter(Array.isArray).map((p) => [p[0], p[1]] as [unknown, unknown]) : b && typeof b === 'object' ? Object.entries(b) : []
  return pares.flatMap(([c, n]) => {
    const cor = corCanonica(c)
    const k = typeof n === 'number' ? Math.max(0, Math.min(30, Math.round(n))) : 0
    return cor && k ? [{ cor, nome: typeof c === 'string' ? c : NOMES_COR[cor], n: k }] : []
  })
}

/** The outcomes of one throw (for the simulation and its bars). */
export function resultadosDe(s: SorteioState): Resultado[] {
  switch (tipoSorteio(s)) {
    case 'dado':
      return Array.from({ length: 6 }, (_, i) => ({ nome: String(i + 1), peso: 1 }))
    case 'moeda':
      return [{ nome: 'cara', cor: 'ambar', peso: 1 }, { nome: 'coroa', cor: 'azul', peso: 1 }]
    case 'bolas':
      return bolasDe(s).map((b) => ({ nome: b.nome, cor: b.cor, peso: b.n }))
    default:
      return (Array.isArray(s.casos) ? s.casos : []).map(opcaoDe).filter((o): o is NonNullable<typeof o> => Boolean(o)).slice(0, 24).map((o) => ({ nome: o.nome, cor: o.cor, peso: 1 }))
  }
}

/** Every possible case, one by one (each ball is a case). */
export function casosDe(s: SorteioState): CasoSorteio[] {
  const tipo = tipoSorteio(s)
  if (tipo === 'bolas') return bolasDe(s).flatMap((b, r) => Array.from({ length: b.n }, () => ({ nome: b.nome, cor: b.cor, resultado: r })))
  return resultadosDe(s).map((r, i) => {
    const v = Number(r.nome.replace(',', '.'))
    return { nome: r.nome, cor: r.cor, valor: Number.isFinite(v) && r.nome.trim() !== '' ? v : undefined, resultado: i }
  })
}

// ---------------------------------------------------------------- the simulation

/** A small seeded generator (mulberry32): the same seed, the same numbers. */
export function gerador(semente: number): () => number {
  let a = (Math.round(semente) >>> 0) || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const MAX_JOGADAS = 10000

/** The first n results (outcome indices): the fixed `sequencia` first, then the seeded draw. */
export function sortear(s: SorteioState, n: number): number[] {
  const rs = resultadosDe(s)
  if (!rs.length) return []
  const total = rs.reduce((a, r) => a + r.peso, 0)
  const bolas = tipoSorteio(s) === 'bolas'
  const fixos = (Array.isArray(s.sequencia) ? s.sequencia : []).flatMap((x) => {
    const nome = typeof x === 'number' ? String(x) : String(x ?? '').toLowerCase().trim()
    const i = rs.findIndex((r) => r.nome.toLowerCase() === nome || (bolas && corCanonica(nome) === r.cor))
    return i >= 0 ? [i] : []
  })
  const k = Math.max(0, Math.min(MAX_JOGADAS, Math.round(n)))
  const rnd = gerador(typeof s.semente === 'number' ? s.semente : 1)
  const out: number[] = []
  for (let j = 0; j < k; j++) {
    if (j < fixos.length) {
      out.push(fixos[j])
      continue
    }
    let x = rnd() * total
    let i = 0
    while (i < rs.length - 1 && x >= rs[i].peso) x -= rs[i++].peso
    out.push(i)
  }
  return out
}

export function jogadasDe(s: SorteioState): number | undefined {
  return typeof s.jogadas === 'number' && Number.isFinite(s.jogadas) ? Math.max(0, Math.min(MAX_JOGADAS, Math.round(s.jogadas))) : undefined
}

/** How many times each outcome came out. */
export function contarResultados(res: number[], n: number): number[] {
  const c = Array(n).fill(0)
  for (const r of res) if (r >= 0 && r < n) c[r]++
  return c
}

/** The chance of each outcome (its weight over the total). */
export function chancesDe(s: SorteioState): number[] {
  const rs = resultadosDe(s)
  const total = rs.reduce((a, r) => a + r.peso, 0)
  return rs.map((r) => (total ? r.peso / total : 0))
}

/** The relative frequency of outcome `i` after each throw, sampled at most `pontos` times: [throws, frequency]. */
export function curvaDe(res: number[], i: number, pontos = 120): [number, number][] {
  const out: [number, number][] = []
  if (!res.length) return out
  const passo = Math.max(1, Math.ceil(res.length / pontos))
  let k = 0
  for (let j = 0; j < res.length; j++) {
    if (res[j] === i) k++
    if ((j + 1) % passo === 0 || j === res.length - 1) out.push([j + 1, k / (j + 1)])
  }
  return out
}

/** A percentage with at most one decimal, with a comma: 52 %, 16,7 %. */
export function pctTexto(p: number): string {
  const r = Math.round(p * 1000) / 10
  return `${String(r).replace('.', ',')} %`
}
