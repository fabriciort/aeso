// O plano cartesiano da U18, sem React (para o visual, o Mexa e os testes):
// os eixos e a escala de cada um, os pontos com nome e coordenadas, as retas
// por uma regra (y = a·x + b) ou por dois pontos, e a máquina de função
// (entra um número, a regra trabalha, sai outro).
//
// As coordenadas são do mundo: x para a direita, y para cima.

import { fmtNum } from './figura-geo'
import { abcDe, cruzamentoDe, lerEquacao, letrasDe, type Cruzamento, type Equacao } from './sistema'

export type Vec = [number, number]
/** Um ponto: o nome de um ponto de `pontos` ('A') ou as coordenadas ([2, 3]). */
export type Ref = string | Vec
export type Cor = boolean | 'ambar' | 'azul' | 'verde' | 'erro' | 'branco'

export interface Eixo {
  de?: number
  ate?: number
  /** A distância entre duas linhas da grade (padrão: uma escala redonda). */
  passo?: number
  /** Os números aparecem de quantos em quantos passos (padrão: o que cabe); false esconde. */
  numeros?: number | false
  /** O nome do eixo ('horas', 'R$'); padrão 'x' e 'y'. */
  rotulo?: string
}

export interface RetaPlano {
  /** A reta de uma equação do 1º grau com duas letras: 'x + y = 10', '2x + 3y = 26', 'y = x + 2'. Vale mais que a, b e por; o rótulo é a equação. */
  equacao?: string
  /** y = a·x + b. */
  a?: number
  b?: number
  /** Ou a reta por dois pontos (nomes de `pontos` ou coordenadas). */
  por?: [Ref, Ref]
  /** Só o trecho com x entre `de` e `ate` (ex.: de: 0, para grandezas que não são negativas). */
  de?: number
  ate?: number
  destaque?: Cor
  tracejado?: boolean
  /** true escreve a regra ('y = 2x'); um texto escreve o texto. */
  rotulo?: boolean | string
}

export interface Traco {
  de: Ref
  ate: Ref
  destaque?: Cor
  tracejado?: boolean
}

export interface Maquina {
  /** A regra, em passos feitos da esquerda para a direita: '× 0,80 + 15', '÷ 2', '× 3 − 1', '²'. */
  regra?: string
  /** Ou a regra como y = a·x + b (o texto vira '× a + b'). */
  a?: number
  b?: number
  /** As saídas, quando a regra não é uma conta (vale mais que a regra). */
  saidas?: (number | string)[]
  /** Os números que entram, na ordem. */
  entradas?: number[]
  /** Quantos já passaram pela máquina (padrão 0). O último aparece na máquina; todos, na tabela. */
  feitas?: number
  /** Os nomes da entrada e da saída, na tabela e embaixo da máquina: ['kWh', 'R$']. Padrão: 'entra', 'sai'. */
  rotulos?: [string, string]
  /** false: sem a tabela embaixo da máquina. */
  tabela?: boolean
}

export interface TabelaPlano {
  /** O nome de cada linha: ['horas', 'R$']. */
  rotulos?: [string, string]
  /** Os pares, um por coluna: [[1, 20], [2, 40]]. `null` ou '?' deixa a casa vazia. */
  pares: [number | string | null, number | string | null][]
  /** false: os pares não viram pontos no plano. */
  noPlano?: boolean
}

export interface PlanoState {
  x?: Eixo | [number, number]
  y?: Eixo | [number, number]
  /** false esconde a grade. */
  grade?: boolean
  /** false esconde o plano (fica só a máquina ou a tabela). */
  eixos?: boolean
  /** true escreve 1º, 2º, 3º e 4º; uma lista acende esses quadrantes ([2]). */
  quadrantes?: boolean | number[]
  /** Pontos com nome ({ A: [3, 2] }) ou sem nome ([[1, 2], [2, 4]]). */
  pontos?: Record<string, Vec> | Vec[]
  /** A cor de cada ponto com nome ({ A: 'azul' }); padrão âmbar. */
  cores?: Record<string, Cor>
  /** false esconde os nomes; um mapa troca o texto. */
  nomes?: boolean | Record<string, string>
  /** As coordenadas junto do nome: true (todos) ou os nomes (['A']). */
  coordenadas?: boolean | string[]
  posRotulos?: Record<string, 'acima' | 'abaixo' | 'esquerda' | 'direita'>
  /** Tracejados do ponto até os dois eixos, com os números acesos: true (todos) ou os nomes. */
  guias?: boolean | string[]
  /** O ponto anda da origem: primeiro no x, depois no y. Um nome ou uma lista (um depois do outro). */
  caminho?: string | string[]
  segmentos?: ([Ref, Ref] | Traco)[]
  /** Liga os pontos (e os pares da tabela ou da máquina) na ordem, com uma linha. */
  ligar?: boolean
  retas?: RetaPlano[]
  /** O ponto onde as duas primeiras retas se cruzam, destacado, com as coordenadas. */
  cruzamento?: boolean
  /** O par posto em cada equação, embaixo do plano ('6 + 4 = 10'): true (o cruzamento) ou o par ([3, 7]). */
  conferir?: boolean | Vec
  maquina?: Maquina
  tabela?: TabelaPlano
  rotulo?: string
}

export interface EixoFinal {
  de: number
  ate: number
  passo: number
  numeros?: number | false
  rotulo: string
}

const EPS = 1e-9
const limpa = (v: number) => Math.round(v * 1e9) / 1e9

/** A round step: 1, 2 or 5 times a power of 10, at least `raw`. */
export function passoRedondo(raw: number): number {
  if (!(raw > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(raw))
  return ([1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw - EPS) ?? 10 * p)
}

export function resolve(r: Ref | undefined, pontos: PlanoState['pontos']): Vec | undefined {
  if (typeof r === 'string') {
    const p = pontos && !Array.isArray(pontos) ? pontos[r] : undefined
    return Array.isArray(p) && p.length >= 2 ? [Number(p[0]), Number(p[1])] : undefined
  }
  if (Array.isArray(r) && r.length >= 2 && r.every((v) => typeof v === 'number' && Number.isFinite(v))) return [r[0], r[1]]
  return undefined
}

export interface PontoPlano {
  /** O nome, para os pontos de `pontos` com nome. */
  nome?: string
  v: Vec
}

/** The points of `pontos`: named ones keep their name. */
export function pontosDe(s: PlanoState): PontoPlano[] {
  const p = s.pontos
  if (Array.isArray(p)) return p.map((v) => resolve(v, undefined)).filter((v): v is Vec => Boolean(v)).map((v) => ({ v }))
  if (p && typeof p === 'object') return Object.keys(p).flatMap((nome) => {
    const v = resolve(nome, p)
    return v ? [{ nome, v }] : []
  })
  return []
}

// ---------------------------------------------------------------- the machine

/** The steps of a rule ('× 0,80 + 15' → [['×', 0.8], ['+', 15]]); undefined when it is not a chain of steps. */
export function passosDaRegra(regra: string): [string, number][] | undefined {
  const t = regra.trim()
  if (!t) return undefined
  const re = /\s*(?:([×x*·÷/:+\-−])\s*(\d[\d.]*(?:,\d+)?)|(²|³))\s*/gy
  const out: [string, number][] = []
  let m: RegExpExecArray | null
  let fim = 0
  while ((m = re.exec(t)) !== null) {
    if (m[3]) out.push(['^', m[3] === '²' ? 2 : 3])
    else {
      const op = m[1] === 'x' || m[1] === '*' || m[1] === '·' ? '×' : m[1] === '/' || m[1] === ':' ? '÷' : m[1] === '-' ? '−' : m[1]
      out.push([op, Number(m[2].replace(/\./g, '').replace(',', '.'))])
    }
    fim = re.lastIndex
    if (fim >= t.length) break
  }
  return out.length && fim >= t.length ? out : undefined
}

/** The rule applied to x, step by step from left to right. */
export function aplicarRegra(regra: string, x: number): number | undefined {
  const passos = passosDaRegra(regra)
  if (!passos) return undefined
  let v = x
  for (const [op, n] of passos) {
    if (op === '×') v *= n
    else if (op === '÷') v = n === 0 ? NaN : v / n
    else if (op === '+') v += n
    else if (op === '−') v -= n
    else if (op === '^') v = v ** n
  }
  return Number.isFinite(v) ? limpa(v) : undefined
}

/** "× 2 + 1" from a and b (× 1 and + 0 are left out). */
export function regraTexto(a = 1, b = 0): string {
  const partes: string[] = []
  if (Math.abs(a - 1) > EPS) partes.push(`× ${a < 0 ? `(${fmtNum(a)})` : fmtNum(a)}`)
  if (Math.abs(b) > EPS) partes.push(`${b < 0 ? '−' : '+'} ${fmtNum(Math.abs(b))}`)
  return partes.join(' ') || '× 1'
}

export function regraDaMaquina(m: Maquina): string {
  return m.regra ?? regraTexto(m.a ?? 1, m.b ?? 0)
}

/** What comes out of the machine for the i-th input. */
export function saidaDe(m: Maquina, i: number): number | string | undefined {
  const dada = m.saidas?.[i]
  if (dada !== undefined && dada !== null) return dada
  const x = m.entradas?.[i]
  if (typeof x !== 'number') return undefined
  if (m.regra) return aplicarRegra(m.regra, x)
  return limpa((m.a ?? 1) * x + (m.b ?? 0))
}

/** The pairs (input, output) of the machine; the ones not fed yet have no output. */
export function paresDaMaquina(m: Maquina, feitas = m.feitas ?? 0): [number, number | string | undefined][] {
  return (m.entradas ?? []).map((x, i) => [x, i < feitas ? saidaDe(m, i) : undefined])
}

// ---------------------------------------------------------------- what goes on the plane

/** Whether the plane is drawn: with a machine or a table and no axes or drawing, only they show. */
export function temPlano(s: PlanoState): boolean {
  if (s.eixos === false) return false
  if (!s.maquina && !s.tabela) return true
  return Boolean(s.x || s.y || s.pontos || s.retas?.length || s.segmentos?.length)
}

/** The pairs that become points on the plane (machine outputs so far, or the table), in order. */
export function paresNoPlano(s: PlanoState): Vec[] {
  const out: Vec[] = []
  if (s.maquina) for (const [x, y] of paresDaMaquina(s.maquina)) if (typeof y === 'number') out.push([x, y])
  if (s.tabela && s.tabela.noPlano !== false) for (const [x, y] of s.tabela.pares ?? []) if (typeof x === 'number' && typeof y === 'number') out.push([x, y])
  return out
}

function eixoBruto(e: PlanoState['x']): Eixo {
  if (Array.isArray(e)) return { de: e[0], ate: e[1] }
  return e && typeof e === 'object' ? e : {}
}

/** One axis: the range (given, or what holds every point and the origin), the step and the name. */
export function eixoDe(s: PlanoState, qual: 'x' | 'y'): EixoFinal {
  const e = eixoBruto(s[qual])
  const k = qual === 'x' ? 0 : 1
  const rotulo = e.rotulo ?? qual
  let { de, ate } = e
  let passo = e.passo && e.passo > 0 ? e.passo : undefined
  if (de === undefined || ate === undefined) {
    const vals: number[] = [...pontosDe(s).map((p) => p.v[k]), ...paresNoPlano(s).map((p) => p[k])]
    const pts = s.pontos && !Array.isArray(s.pontos) ? s.pontos : undefined
    for (const t of s.segmentos ?? []) {
      const [a, b] = Array.isArray(t) ? t : [t.de, t.ate]
      for (const r of [a, b]) {
        const v = resolve(r, pts)
        if (v) vals.push(v[k])
      }
    }
    // The lines of equations: where they cut the axes, and where they cross.
    const letras = letrasDoPlano(s)
    for (const r of s.retas ?? []) {
      const eq = equacaoDa(r)
      if (!eq) continue
      const [a, b, c] = abcDe(eq, letras)
      const corte = k === 0 ? a : b
      // Only a hint of the range: rounded out, so 8,67 does not make the grid finer.
      if (Math.abs(corte) > EPS) {
        const v = limpa(c / corte)
        vals.push(v < 0 ? Math.floor(v) : Math.ceil(v))
      }
    }
    const cz = cruzamentoDoPlano(s)?.c
    if (cz?.tipo === 'ponto' && (s.retas ?? []).some((r) => equacaoDa(r))) vals.push(cz.v[k])
    const pc = Array.isArray(s.conferir) ? parConferir(s) : undefined
    if (pc) vals.push(pc[k])
    if (s.maquina && s.eixos !== false) {
      // The whole machine fits from the start: the plane does not change as the outputs come.
      const m = s.maquina
      ;(m.entradas ?? []).forEach((x, i) => {
        const y = saidaDe(m, i)
        if (k === 0) vals.push(x)
        else if (typeof y === 'number') vals.push(y)
      })
    }
    if (!vals.length) {
      de ??= -5
      ate ??= 5
    } else {
      const lo = Math.min(0, ...vals)
      const hi = Math.max(0, ...vals)
      const inteiros = vals.every((v) => Math.abs(v - Math.round(v)) < EPS)
      // With lines of equations, a finer grid (up to about 20 lines): the pairs are tapped on it.
      const div = (s.retas ?? []).some((r) => equacaoDa(r)) ? 20 : 10
      const p = passo ?? (inteiros ? Math.max(1, passoRedondo((hi - lo) / div)) : passoRedondo(Math.max(hi - lo, EPS) / div))
      passo = p
      de ??= lo < 0 ? limpa(Math.floor(lo / p + EPS) * p - p) : 0
      ate ??= limpa(Math.max(Math.ceil(hi / p - EPS) * p + (hi > 0 ? p : 0), de + 5 * p))
    }
  }
  if (ate <= de) ate = de + 1
  passo ??= passoRedondo((ate - de) / 12)
  return { de, ate, passo, numeros: e.numeros, rotulo }
}

/** The values of the grid lines of an axis (multiples of the step). */
export function linhasDoEixo(e: EixoFinal, cada = 1): number[] {
  const out: number[] = []
  const p = e.passo * cada
  for (let v = Math.ceil(e.de / p - EPS) * p; v <= e.ate + EPS; v += p) out.push(limpa(v))
  return out
}

/** A tap snapped to the nearest grid crossing, inside the axes. */
export function encaixar(v: Vec, ex: EixoFinal, ey: EixoFinal): Vec {
  const um = (t: number, e: EixoFinal) => limpa(Math.min(e.ate, Math.max(e.de, Math.round(t / e.passo) * e.passo)))
  return [um(v[0], ex), um(v[1], ey)]
}

/** Where the axes cross: the origin, or the edge when 0 is outside the range. */
export function cruzamento(ex: EixoFinal, ey: EixoFinal): Vec {
  const um = (e: EixoFinal) => (e.de > 0 ? e.de : e.ate < 0 ? e.ate : 0)
  return [um(ex), um(ey)]
}

/** "(3, 2)"; with a decimal, the semicolon: "(2,5; 3)". The minus is the true sign. */
export function coordTexto(v: Vec): string {
  const sep = v.some((t) => Math.abs(t - Math.round(t)) > EPS) ? '; ' : ', '
  return `(${fmtNum(v[0])}${sep}${fmtNum(v[1])})`
}

/** 1 to 4 (counterclockwise from the top right); 0 on an axis. */
export function quadranteDe(v: Vec): 0 | 1 | 2 | 3 | 4 {
  const [x, y] = v
  if (Math.abs(x) < EPS || Math.abs(y) < EPS) return 0
  return x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3
}

export const mesmoPonto = (a: Vec, b: Vec) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6

/** The line's equation, when it has one that reads ('x + y = 10'). */
export const equacaoDa = (r: RetaPlano): Equacao | null => lerEquacao(r.equacao)

/** The letters of the plane's equations (x and y; or the first two that appear: i and m). */
export function letrasDoPlano(s: Pick<PlanoState, 'retas'>): [string, string] {
  const ls = letrasDe((s.retas ?? []).map(equacaoDa).filter((e): e is Equacao => Boolean(e)))
  if (!ls.length || ls.includes('x') || ls.includes('y')) return ['x', 'y']
  return [ls[0], ls[1] ?? '']
}

/** The line's a and b (undefined b: a vertical line x = a). */
export function coeficientes(r: RetaPlano, pontos: PlanoState['pontos'], letras?: [string, string]): { a: number; b: number } | { vertical: number } | undefined {
  const eq = equacaoDa(r)
  if (eq) {
    const [a, b, c] = abcDe(eq, letras ?? letrasDoPlano({ retas: [r] }))
    if (Math.abs(b) > EPS) return { a: limpa(-a / b), b: limpa(c / b) }
    if (Math.abs(a) > EPS) return { vertical: limpa(c / a) }
    return undefined
  }
  if (r.por) {
    const p = resolve(r.por[0], pontos)
    const q = resolve(r.por[1], pontos)
    if (!p || !q || mesmoPonto(p, q)) return undefined
    if (Math.abs(q[0] - p[0]) < EPS) return { vertical: p[0] }
    const a = (q[1] - p[1]) / (q[0] - p[0])
    return { a: limpa(a), b: limpa(p[1] - a * p[0]) }
  }
  return { a: r.a ?? 1, b: r.b ?? 0 }
}

/** The part of the line inside the axes (and inside its own `de`..`ate`). */
export function retaNoQuadro(r: RetaPlano, ex: EixoFinal, ey: EixoFinal, pontos: PlanoState['pontos'], letras?: [string, string]): [Vec, Vec] | undefined {
  const c = coeficientes(r, pontos, letras)
  if (!c) return undefined
  if ('vertical' in c) {
    const x = c.vertical
    if (x < ex.de - EPS || x > ex.ate + EPS) return undefined
    return [[x, ey.de], [x, ey.ate]]
  }
  let x0 = Math.max(ex.de, r.de ?? -Infinity)
  let x1 = Math.min(ex.ate, r.ate ?? Infinity)
  if (Math.abs(c.a) > EPS) {
    const xa = (ey.de - c.b) / c.a
    const xb = (ey.ate - c.b) / c.a
    x0 = Math.max(x0, Math.min(xa, xb))
    x1 = Math.min(x1, Math.max(xa, xb))
  } else if (c.b < ey.de - EPS || c.b > ey.ate + EPS) return undefined
  if (x1 - x0 < EPS) return undefined
  return [[limpa(x0), limpa(c.a * x0 + c.b)], [limpa(x1), limpa(c.a * x1 + c.b)]]
}

/** 'y = 2x', 'y = 0,8x + 15', 'y = −x + 3', 'y = 3', 'x = 2'. */
export function retaTexto(r: RetaPlano, pontos: PlanoState['pontos']): string {
  const eq = equacaoDa(r)
  if (eq) return eq.texto
  const c = coeficientes(r, pontos)
  if (!c) return ''
  if ('vertical' in c) return `x = ${fmtNum(c.vertical)}`
  const { a, b } = c
  const ax = Math.abs(a) < EPS ? '' : Math.abs(a - 1) < EPS ? 'x' : Math.abs(a + 1) < EPS ? '−x' : `${fmtNum(a)}x`
  if (!ax) return `y = ${fmtNum(b)}`
  if (Math.abs(b) < EPS) return `y = ${ax}`
  return `y = ${ax} ${b < 0 ? '−' : '+'} ${fmtNum(Math.abs(b))}`
}

/** Any line as a·x + b·y = c (y = 2x + 1 is −2x + y = 1; x = 3 is x = 3). */
export function abcDaReta(r: RetaPlano, pontos: PlanoState['pontos'], letras?: [string, string]): [number, number, number] | undefined {
  const eq = equacaoDa(r)
  if (eq) return abcDe(eq, letras ?? letrasDoPlano({ retas: [r] }))
  const c = coeficientes(r, pontos)
  if (!c) return undefined
  return 'vertical' in c ? [1, 0, c.vertical] : [limpa(-c.a), 1, c.b]
}

/** The first two lines of the plane and where they meet (a point, parallel, or the same line). */
export function cruzamentoDoPlano(s: PlanoState): { i: number; j: number; c: Cruzamento } | undefined {
  const pts = s.pontos && !Array.isArray(s.pontos) ? s.pontos : undefined
  const letras = letrasDoPlano(s)
  const abcs = (s.retas ?? []).map((r) => abcDaReta(r, pts, letras))
  const idx = abcs.flatMap((v, i) => (v ? [i] : [])).slice(0, 2)
  if (idx.length < 2) return undefined
  const c = cruzamentoDe(abcs[idx[0]]!, abcs[idx[1]]!)
  return c ? { i: idx[0], j: idx[1], c } : undefined
}

/** The pair to check under the plane: the given one, or the crossing (`conferir: true`). */
export function parConferir(s: PlanoState): Vec | undefined {
  if (Array.isArray(s.conferir) && s.conferir.length === 2 && s.conferir.every((t) => typeof t === 'number' && Number.isFinite(t))) return [s.conferir[0], s.conferir[1]]
  if (s.conferir === true) {
    const c = cruzamentoDoPlano(s)?.c
    return c?.tipo === 'ponto' ? c.v : undefined
  }
  return undefined
}

/** Mexa "marcar": the swapped point (the student walked y first). */
export const trocado = (v: Vec): Vec => [v[1], v[0]]
