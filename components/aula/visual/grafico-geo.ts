// Os gráficos de dados da U18, sem React (para o visual, o Mexa e os testes):
// barras, linhas e setores; a escala do eixo (com o eixo cortado e a escala
// torta, para a aula dos gráficos que enganam) e as porcentagens dos setores.

import { fmtNum } from './figura-geo'
import { passoRedondo } from './plano-geo'

export type CorGrafico = boolean | 'ambar' | 'azul' | 'verde' | 'erro' | 'cinza' | 'lilas'

export interface Dado {
  rotulo: string
  valor: number
  cor?: CorGrafico
}

export interface Serie {
  nome?: string
  valores: number[]
  cor?: CorGrafico
}

export interface GraficoState {
  /** 'barras' (padrão), 'linhas' ou 'setores'. */
  tipo?: 'barras' | 'linhas' | 'setores'
  /** Os dados, na ordem: [['jan', 120], ['fev', 90]] ou [{ rotulo: 'jan', valor: 120, cor: 'ambar' }]. */
  dados?: ([string, number] | Dado)[]
  /** Linhas: mais séries sobre os mesmos rótulos ({ nome: 'Ana', valores: [3, 5, 4] }). */
  series?: Serie[]
  /** Linhas: o nome de cada linha, na ordem (a dos `dados` primeiro), na legenda em cima. */
  legenda?: string[]
  /** O eixo começa aqui (o eixo cortado). Padrão 0. */
  eixoInicio?: number
  /** O eixo vai até aqui (padrão: uma marca redonda acima do maior valor). */
  eixoFim?: number
  /** A distância entre as marcas do eixo. */
  passo?: number
  /** A escala torta: estas marcas ficam à mesma distância na tela, com valores desiguais ([0, 10, 20, 50, 100]). */
  escala?: number[]
  /** O sinal de eixo cortado (um zigue-zague) quando o eixo não começa no 0. */
  quebra?: boolean
  /** Dois gráficos lado a lado: este e a versão honesta (eixo no 0, escala regular). Um par troca os títulos. */
  honesto?: boolean | [string, string]
  /** Os valores escritos (padrão: sim nas barras e nos setores, não nas linhas). */
  valores?: boolean
  /** Antes e depois de cada valor ('R$ ', ' %'). */
  antes?: string
  depois?: string
  /** Barras, pontos ou fatias acesas (índices). */
  destaque?: number | number[]
  titulo?: string
  /** O nome do eixo vertical ('milhões de R$') e do horizontal ('mês'). */
  rotuloY?: string
  rotuloX?: string
  rotulo?: string
  /** Mexa "ajustar": a barra que o aluno arrasta (padrão 0) e o passo do arraste (padrão: o das marcas). */
  ativa?: number
  ajustePasso?: number
}

const EPS = 1e-9
const limpa = (v: number) => Math.round(v * 1e9) / 1e9

export function dadosDe(s: GraficoState): Dado[] {
  return (s.dados ?? []).flatMap((d): Dado[] => {
    if (Array.isArray(d)) return typeof d[1] === 'number' ? [{ rotulo: String(d[0]), valor: d[1] }] : []
    return d && typeof d.valor === 'number' ? [{ rotulo: String(d.rotulo ?? ''), valor: d.valor, cor: d.cor }] : []
  })
}

export const tipoDe = (s: GraficoState) => s.tipo ?? 'barras'

/** The series drawn: the data first, then `series`. */
export function seriesDe(s: GraficoState): Serie[] {
  const d = dadosDe(s)
  const out: Serie[] = d.length ? [{ valores: d.map((x) => x.valor) }] : []
  for (const se of s.series ?? []) if (Array.isArray(se?.valores)) out.push(se)
  return out
}

export interface Escala {
  de: number
  ate: number
  /** The numbers on the axis. */
  marcas: number[]
  /** Where a value goes, from 0 (bottom) to 1 (top). */
  pos: (v: number) => number
  /** The inverse: the value at a height (for the drag). */
  valorEm: (t: number) => number
  torta: boolean
}

/** The vertical scale. `honesta` ignores the cut axis and the crooked scale. */
export function escalaDe(s: GraficoState, honesta = false): Escala {
  const todos = seriesDe(s).flatMap((x) => x.valores).filter((v) => Number.isFinite(v))
  const max = Math.max(0, ...todos)
  const torta = !honesta && Array.isArray(s.escala) && s.escala.length >= 2 ? [...s.escala].sort((a, b) => a - b) : undefined
  if (torta) {
    const n = torta.length - 1
    const pos = (v: number) => {
      let i = torta.findIndex((m, j) => j < n && v <= torta[j + 1] + EPS)
      if (i < 0) i = n - 1
      const a = torta[i]
      const b = torta[i + 1]
      return Math.max(0, Math.min(1.08, (i + (v - a) / (b - a || 1)) / n))
    }
    const valorEm = (t: number) => {
      const f = Math.max(0, Math.min(1, t)) * n
      const i = Math.min(n - 1, Math.floor(f))
      return limpa(torta[i] + (f - i) * (torta[i + 1] - torta[i]))
    }
    return { de: torta[0], ate: torta[n], marcas: torta, pos, valorEm, torta: true }
  }
  const de = honesta ? Math.min(0, ...todos) : (s.eixoInicio ?? Math.min(0, ...todos))
  const passo = s.passo && s.passo > 0 && !(honesta && s.eixoInicio) ? s.passo : passoRedondo(Math.max(EPS, (s.eixoFim ?? max) - de) / 5)
  const fim = honesta ? max : (s.eixoFim ?? max)
  const ate = Math.max(de + passo, limpa(Math.ceil((fim - de) / passo - EPS) * passo + de))
  const marcas: number[] = []
  for (let v = de; v <= ate + EPS; v += passo) marcas.push(limpa(v))
  const pos = (v: number) => Math.max(0, Math.min(1.08, (v - de) / (ate - de)))
  const valorEm = (t: number) => limpa(de + Math.max(0, Math.min(1, t)) * (ate - de))
  return { de, ate, marcas, pos, valorEm, torta: false }
}

/** Whole percentages that add up to 100 (largest remainder). */
export function porcentagensDe(valores: number[]): number[] {
  const tot = valores.reduce((a, b) => a + Math.max(0, b), 0)
  if (tot <= 0) return valores.map(() => 0)
  const brutos = valores.map((v) => (Math.max(0, v) / tot) * 100)
  const base = brutos.map(Math.floor)
  let falta = 100 - base.reduce((a, b) => a + b, 0)
  const ordem = brutos.map((b, i) => [b - base[i], i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of ordem) {
    if (falta <= 0) break
    base[i]++
    falta--
  }
  return base
}

/** The slices: start and end angles in degrees, clockwise from the top. */
export function setoresDe(valores: number[]): { de: number; ate: number }[] {
  const tot = valores.reduce((a, b) => a + Math.max(0, b), 0)
  let a = 0
  return valores.map((v) => {
    const g = tot > 0 ? (Math.max(0, v) / tot) * 360 : 0
    const out = { de: a, ate: a + g }
    a += g
    return out
  })
}

export function valorTexto(s: GraficoState, v: number): string {
  return `${s.antes ?? ''}${fmtNum(v)}${s.depois ?? ''}`
}

export function destaquesDe(s: GraficoState): number[] {
  return typeof s.destaque === 'number' ? [s.destaque] : Array.isArray(s.destaque) ? s.destaque : []
}

/** The index of the biggest value (the first, in a tie). */
export function maiorDe(s: GraficoState): number {
  const d = dadosDe(s)
  return d.reduce((m, x, i) => (x.valor > d[m].valor ? i : m), 0)
}

/** Mexa "ajustar": the axis top while the bar moves (fixed, a round mark above the data and the target). */
export function eixoDoAjuste(s: GraficoState, alvo: number): number {
  if (s.eixoFim !== undefined) return s.eixoFim
  const max = Math.max(alvo, ...seriesDe(s).flatMap((x) => x.valores))
  return escalaDe({ ...s, dados: [['', max * 1.2]], series: undefined }).ate
}

/** Mexa "ajustar": a value snapped to the step and kept inside the axis. Without `ajustePasso`, the step is the marks' (or a half, a quarter, a fifth, a tenth of it, so the target can be reached). */
export function ajustarValor(s: GraficoState, v: number, alvo?: number): number {
  const e = escalaDe(s)
  const marca = e.torta ? 1 : e.marcas.length > 1 ? e.marcas[1] - e.marcas[0] : 1
  const divide = (p: number) => alvo === undefined || Math.abs((alvo - e.de) / p - Math.round((alvo - e.de) / p)) < 1e-6
  const passo = s.ajustePasso && s.ajustePasso > 0 ? s.ajustePasso : ([1, 2, 4, 5, 10].map((k) => marca / k).find(divide) ?? marca / 10)
  return limpa(Math.min(e.ate, Math.max(e.de, Math.round((v - e.de) / passo) * passo + e.de)))
}
