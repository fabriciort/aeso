// A contagem e os casos da U19, sem React (para o visual, o Mexa e os
// testes): a árvore de possibilidades (as escolhas em sequência se
// multiplicam), a tabela de dupla entrada (a grade de pares, como dois dados
// 6 × 6), os casos favoráveis e a chance escrita.

import { fmtNum } from './figura-geo'

export type CorCaso = 'ambar' | 'azul' | 'verde' | 'erro' | 'cinza' | 'lilas' | 'branco' | 'preto'

export interface Opcao {
  nome: string
  cor?: CorCaso
}

/** Color names the authors write: ours and the everyday ones. */
const CORES: Record<string, CorCaso> = {
  ambar: 'ambar', amarela: 'ambar', amarelo: 'ambar', laranja: 'ambar',
  azul: 'azul', azuis: 'azul',
  verde: 'verde', verdes: 'verde',
  erro: 'erro', rosa: 'erro', vermelha: 'erro', vermelho: 'erro', vermelhas: 'erro', vermelhos: 'erro',
  cinza: 'cinza', lilas: 'lilas', 'lilás': 'lilas', roxa: 'lilas', roxo: 'lilas',
  branco: 'branco', branca: 'branco', brancas: 'branco', brancos: 'branco',
  preto: 'preto', preta: 'preto', pretas: 'preto', pretos: 'preto',
}
const sem = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
export function corCanonica(c: unknown): CorCaso | undefined {
  if (typeof c !== 'string') return undefined
  return CORES[c.toLowerCase().trim()] ?? CORES[sem(c)]
}

export function opcaoDe(o: unknown): Opcao | undefined {
  if (typeof o === 'string' || typeof o === 'number') return { nome: typeof o === 'number' ? fmtNum(o) : o }
  if (o && typeof o === 'object' && 'nome' in o) {
    const x = o as { nome: unknown; cor?: unknown }
    return { nome: String(x.nome), cor: corCanonica(x.cor) }
  }
  return undefined
}

// ---------------------------------------------------------------- the tree

export interface ContagemState {
  /** A árvore: as opções de cada etapa, na ordem: [['azul', 'preta', 'branca'], ['jeans', 'social']]. Uma opção pode ter cor: { nome: 'azul', cor: 'azul' }. */
  arvore?: unknown[][]
  /** O nome de cada etapa, em cima da coluna: ['camisa', 'calça']. */
  nomes?: string[]
  /** Quantas etapas aparecem (padrão: todas). */
  mostradas?: number
  /** Um caminho aceso, uma opção por etapa: [0, 1] (a primeira camisa com a segunda calça). */
  caminho?: number[]
  /** Na ponta de cada ramo, a combinação inteira ("azul, jeans"). */
  combinacoes?: boolean
  /** A conta embaixo ("3 × 2 = 6"); false esconde. */
  conta?: boolean
  /** Depois do total da conta: 'roupas' ("3 × 2 = 6 roupas"). */
  unidade?: string
  /** A tabela de dupla entrada (veja `GradePares`). */
  grade?: GradePares
  /** Os casos favoráveis (acesos): uma regra ou a lista de casas [[linha, coluna]]. */
  favoraveis?: unknown
  /** Mexa "favoráveis": o aluno toca os casos. */
  marcar?: boolean
  /** Embaixo, "6 de 36 = 6/36"; com `simplificada`, "= 1/6"; com `porcentagem`, "≈ 16,7 %". */
  chance?: boolean
  simplificada?: boolean
  porcentagem?: boolean
  ramificar?: boolean
  rotulo?: string
}

export function etapasDe(s: ContagemState): Opcao[][] {
  if (!Array.isArray(s.arvore)) return []
  return s.arvore.filter(Array.isArray).map((et) => et.map(opcaoDe).filter((o): o is Opcao => Boolean(o))).filter((et) => et.length > 0).slice(0, 4)
}

export const mostradasDe = (s: ContagemState, total: number) => Math.max(0, Math.min(total, Math.round(typeof s.mostradas === 'number' ? s.mostradas : total)))

/** Every path through the first k stages (each one a list of choices), in order. */
export function caminhos(etapas: Opcao[][], k = etapas.length): number[][] {
  let out: number[][] = [[]]
  for (const et of etapas.slice(0, k)) out = out.flatMap((c) => et.map((_, i) => [...c, i]))
  return out
}

/** "3 × 2 = 6" for the first k stages ("3" for one, "" for none). */
export function contaTexto(tamanhos: number[], unidade?: string): string {
  if (!tamanhos.length) return ''
  const tot = tamanhos.reduce((a, b) => a * b, 1)
  const u = unidade ? ` ${unidade}` : ''
  return tamanhos.length === 1 ? `${fmtNum(tot)}${u}` : `${tamanhos.map((n) => fmtNum(n)).join(' × ')} = ${fmtNum(tot)}${u}`
}

// ---------------------------------------------------------------- the grid of pairs

export interface GradePares {
  /** O que vai em cada linha e em cada coluna: [1, 2, 3, 4, 5, 6], ou só 6 (de 1 a 6). */
  linhas?: unknown
  colunas?: unknown
  /** O nome de cada lado: ['1º dado', '2º dado'] (as linhas, à esquerda; as colunas, em cima). */
  nomes?: string[]
  /** O que cada casa mostra: 'par' (padrão: "2, 5"), 'soma', 'produto', 'diferenca' (a maior menos a menor) ou 'vazio'. */
  conteudo?: 'par' | 'soma' | 'produto' | 'diferenca' | 'vazio'
  /** Quantas casas estão preenchidas, linha por linha (padrão: todas). */
  preenchidas?: number
}

export interface GradeFinal {
  linhas: Opcao[]
  colunas: Opcao[]
  nomes: [string, string] | null
  conteudo: NonNullable<GradePares['conteudo']>
  preenchidas: number
}

function lado(v: unknown): Opcao[] {
  if (typeof v === 'number' && v >= 1) return Array.from({ length: Math.min(12, Math.round(v)) }, (_, i) => ({ nome: String(i + 1) }))
  return Array.isArray(v) ? v.map(opcaoDe).filter((o): o is Opcao => Boolean(o)).slice(0, 12) : []
}

export function gradeDe(s: ContagemState): GradeFinal | undefined {
  const g = s.grade
  if (!g || typeof g !== 'object') return undefined
  const linhas = lado(g.linhas ?? 6)
  const colunas = lado(g.colunas ?? g.linhas ?? 6)
  if (!linhas.length || !colunas.length) return undefined
  const conteudo = (['par', 'soma', 'produto', 'diferenca', 'vazio'] as const).find((c) => c === g.conteudo) ?? 'par'
  const nomes = Array.isArray(g.nomes) && g.nomes.length >= 2 ? ([String(g.nomes[0]), String(g.nomes[1])] as [string, string]) : null
  const n = linhas.length * colunas.length
  return { linhas, colunas, nomes, conteudo, preenchidas: typeof g.preenchidas === 'number' ? Math.max(0, Math.min(n, Math.round(g.preenchidas))) : n }
}

const numDe = (o: Opcao) => {
  const v = Number(o.nome.replace(/\./g, '').replace(',', '.').replace('−', '-'))
  return Number.isFinite(v) ? v : undefined
}

/** What a cell shows. */
export function textoCasa(g: GradeFinal, l: number, c: number): string {
  const a = g.linhas[l]
  const b = g.colunas[c]
  const x = numDe(a)
  const y = numDe(b)
  if (g.conteudo === 'vazio') return ''
  if (g.conteudo !== 'par' && x !== undefined && y !== undefined) return fmtNum(g.conteudo === 'soma' ? x + y : g.conteudo === 'produto' ? x * y : Math.abs(x - y))
  return `${a.nome}, ${b.nome}`
}

// ---------------------------------------------------------------- favourable cases

/** One case: what it is called, its number (if it is one) and its colour. */
export interface Caso {
  nome: string
  valor?: number
  cor?: CorCaso
  /** In the grid: the row and the column, and the two numbers. */
  l?: number
  c?: number
  a?: number
  b?: number
}

export function casosDaGrade(g: GradeFinal): Caso[] {
  const out: Caso[] = []
  g.linhas.forEach((la, l) =>
    g.colunas.forEach((co, c) => {
      const t = textoCasa(g, l, c)
      out.push({ nome: t, valor: numDe({ nome: t }), l, c, a: numDe(la), b: numDe(co) })
    }),
  )
  return out
}

const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined ? [] : [v])

/**
 * The favourable cases (indices), by the rule:
 * - a list of indices ([0, 2, 5]) or, in the grid, of cells ([[0, 5], [1, 4]]);
 * - { cor: 'azul' } or { cor: ['azul', 'verde'] };
 * - { valores: [2, 4, 6] } (by name or number, as written on the case);
 * - { maior: 4 }, { menor: 3 } (the number on the case: more than, less than);
 * - in the grid: { soma: 7 } or { soma: [7, 11] }, { iguais: true }, and the ones above for what the cell shows.
 * Unknown: none.
 */
export function favoraveisDe(casos: Caso[], regra: unknown): number[] {
  if (Array.isArray(regra)) {
    if (regra.every((r) => Array.isArray(r))) return casos.flatMap((k, i) => (regra.some((r) => (r as unknown[])[0] === k.l && (r as unknown[])[1] === k.c) ? [i] : []))
    return [...new Set(regra.filter((i): i is number => typeof i === 'number' && i >= 0 && i < casos.length).map(Math.round))].sort((a, b) => a - b)
  }
  if (!regra || typeof regra !== 'object') return []
  const r = regra as Record<string, unknown>
  const testes: ((k: Caso) => boolean)[] = []
  if (r.cor !== undefined) {
    const cs = lista(r.cor).map(corCanonica)
    testes.push((k) => k.cor !== undefined && cs.includes(k.cor))
  }
  if (r.valores !== undefined) {
    const vs = lista(r.valores).map((v) => (typeof v === 'number' ? fmtNum(v) : sem(String(v))))
    testes.push((k) => vs.includes(sem(k.nome)) || (k.valor !== undefined && vs.includes(fmtNum(k.valor))))
  }
  if (typeof r.maior === 'number') testes.push((k) => k.valor !== undefined && k.valor > (r.maior as number))
  if (typeof r.menor === 'number') testes.push((k) => k.valor !== undefined && k.valor < (r.menor as number))
  if (r.soma !== undefined) {
    const ss = lista(r.soma).filter((v): v is number => typeof v === 'number')
    testes.push((k) => k.a !== undefined && k.b !== undefined && ss.some((x) => Math.abs(k.a! + k.b! - x) < 1e-9))
  }
  if (r.iguais === true) testes.push((k) => k.l !== undefined && k.a !== undefined && k.a === k.b)
  if (!testes.length) return []
  return casos.flatMap((k, i) => (testes.every((t) => t(k)) ? [i] : []))
}

function mdc(a: number, b: number): number {
  return b ? mdc(b, a % b) : Math.abs(a)
}

/** The chance, in pieces: "6 de 36", the fraction, the simplified one and the percentage. */
export function chanceDe(f: number, n: number): { de: string; fracao: [number, number]; simples: [number, number] | null; pct: string; exata: boolean } {
  const d = n > 0 ? mdc(f, n) || 1 : 1
  const simples: [number, number] | null = d > 1 && f > 0 ? [f / d, n / d] : null
  const p = n > 0 ? (f / n) * 100 : 0
  const r = Math.round(p * 10) / 10
  return { de: `${fmtNum(f)} de ${fmtNum(n)}`, fracao: [f, n], simples, pct: `${fmtNum(r, 1)} %`, exata: Math.abs(r - p) < 1e-9 }
}
