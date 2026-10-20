// Os sistemas de equações (AF.U4), sem React (para o plano, o quadro das
// equações, o Mexa e os testes): ler uma equação do 1º grau com duas letras
// ('x + y = 10', '2x + 3y = 26', 'y = x + 2'), pôr um par nela e conferir,
// os pares inteiros de uma reta, onde duas retas se cruzam (ou se são
// paralelas, ou a mesma), a soma de duas equações (com uma delas
// multiplicada antes) e a troca de uma letra pelo que ela vale.

import { fmtNum } from './figura-geo'

const EPS = 1e-9
const limpa = (v: number) => Math.round(v * 1e9) / 1e9 || 0

/** Um termo de um lado da equação: o coeficiente com o sinal e a letra (sem letra, um número). */
export interface Termo {
  coef: number
  letra?: string
}

export interface Equacao {
  esquerda: Termo[]
  direita: Termo[]
  /** O texto como foi escrito, com o menos de verdade. */
  texto: string
}

/** O sinal de menos de verdade (−) no lugar do hífen. */
export const comMenos = (t: string) => t.replace(/-/g, '−')

/** One side: '2x + 3y', '−x + 2', '0,5x'. Undefined when it is not a sum of terms. */
function lerLado(s: string): Termo[] | undefined {
  const t = s.replace(/−/g, '-').trim()
  if (!t) return undefined
  const re = /\s*([+-])?\s*(\d[\d.]*(?:,\d+)?)?\s*(?:[·*×]\s*)?([a-zA-Z])?\s*/y
  const out: Termo[] = []
  let m: RegExpExecArray | null
  while (re.lastIndex < t.length && (m = re.exec(t)) !== null) {
    const [, sinal, n, letra] = m
    if (!n && !letra) return undefined
    if (out.length && !sinal) return undefined
    const v = n ? Number(n.replace(/\./g, '').replace(',', '.')) : 1
    if (!Number.isFinite(v)) return undefined
    out.push({ coef: sinal === '-' ? -v : v, ...(letra ? { letra } : {}) })
  }
  return re.lastIndex >= t.length && out.length ? out : undefined
}

/** Reads 'x + y = 10' (one '=', terms of a number and at most one letter); null otherwise. */
export function lerEquacao(t: unknown): Equacao | null {
  if (typeof t !== 'string') return null
  const lados = t.split('=')
  if (lados.length !== 2) return null
  const esquerda = lerLado(lados[0])
  const direita = lerLado(lados[1])
  if (!esquerda || !direita) return null
  return { esquerda, direita, texto: comMenos(t.trim()) }
}

/** The letters, in the order they first appear. */
export function letrasDe(eqs: Equacao[]): string[] {
  const out: string[] = []
  for (const e of eqs) for (const t of [...e.esquerda, ...e.direita]) if (t.letra && !out.includes(t.letra)) out.push(t.letra)
  return out
}

/** The equation as a·x + b·y = c, for the letters given ([a, b, c]). */
export function abcDe(e: Equacao, letras: [string, string]): [number, number, number] {
  let a = 0
  let b = 0
  let c = 0
  for (const [lado, s] of [[e.esquerda, 1], [e.direita, -1]] as const)
    for (const t of lado) {
      if (!t.letra) c -= s * t.coef
      else if (t.letra === letras[0]) a += s * t.coef
      else if (t.letra === letras[1]) b += s * t.coef
    }
  return [limpa(a), limpa(b), limpa(c)]
}

/** Whether the pair satisfies a·x + b·y = c. */
export const satisfaz = (r: [number, number, number], v: [number, number]) => Math.abs(r[0] * v[0] + r[1] * v[1] - r[2]) < 1e-7

export type Cruzamento = { tipo: 'ponto'; v: [number, number] } | { tipo: 'paralelas' } | { tipo: 'mesma' }

/** Where two lines a·x + b·y = c meet: one point, never (parallel) or everywhere (the same line). */
export function cruzamentoDe(r: [number, number, number], s: [number, number, number]): Cruzamento | null {
  if ((Math.abs(r[0]) < EPS && Math.abs(r[1]) < EPS) || (Math.abs(s[0]) < EPS && Math.abs(s[1]) < EPS)) return null
  const det = r[0] * s[1] - r[1] * s[0]
  if (Math.abs(det) < EPS) {
    const mesma = Math.abs(r[0] * s[2] - s[0] * r[2]) < EPS && Math.abs(r[1] * s[2] - s[1] * r[2]) < EPS
    return { tipo: mesma ? 'mesma' : 'paralelas' }
  }
  return { tipo: 'ponto', v: [limpa((r[2] * s[1] - r[1] * s[2]) / det), limpa((r[0] * s[2] - r[2] * s[0]) / det)] }
}

/** The pairs on the grid (multiples of each step, inside each range) that satisfy the line. */
export function paresNaGrade(r: [number, number, number], ex: { de: number; ate: number; passo: number }, ey: { de: number; ate: number; passo: number }): [number, number][] {
  const [a, b, c] = r
  const out: [number, number][] = []
  const naGrade = (v: number, e: typeof ex) => v >= e.de - EPS && v <= e.ate + EPS && Math.abs(v / e.passo - Math.round(v / e.passo)) < 1e-6
  for (let x = Math.ceil(ex.de / ex.passo - EPS) * ex.passo; x <= ex.ate + EPS; x += ex.passo) {
    const xv = limpa(x)
    if (Math.abs(b) < EPS) {
      if (Math.abs(a * xv - c) > 1e-7) continue
      for (let y = Math.ceil(ey.de / ey.passo - EPS) * ey.passo; y <= ey.ate + EPS; y += ey.passo) out.push([xv, limpa(y)])
      continue
    }
    const y = limpa((c - a * xv) / b)
    if (naGrade(y, ey)) out.push([xv, y])
  }
  return out
}

// ---------------------------------------------------------------- putting a pair in

/** A value in a sum: negatives in parentheses ((−2)), except at the very start. */
const valorTexto = (v: number, inicio: boolean) => (v < 0 && !inicio ? `(${fmtNum(v)})` : fmtNum(v))

/** A side with the letters replaced: '2 · 6 + 3 · 4', '3 − (−2)'. */
export function substituirLado(lado: Termo[], valores: Record<string, number>): string {
  return lado
    .map((t, i) => {
      const k = Math.abs(t.coef)
      const sinal = t.coef < 0 ? (i ? ' − ' : '−') : i ? ' + ' : ''
      if (!t.letra) return `${sinal}${fmtNum(k)}`
      const v = valores[t.letra] ?? 0
      const inicio = i === 0 && t.coef > 0
      return `${sinal}${Math.abs(k - 1) < EPS ? valorTexto(v, inicio) : `${fmtNum(k)} · ${valorTexto(v, false)}`}`
    })
    .join('')
}

export const valorLado = (lado: Termo[], valores: Record<string, number>) => limpa(lado.reduce((s, t) => s + t.coef * (t.letra ? (valores[t.letra] ?? 0) : 1), 0))

/**
 * The pair put in the equation, as it is checked on paper: '6 + 4 = 10',
 * '3 + 5 = 8 ≠ 10', '2 · 6 + 3 · 4 = 24 ≠ 26'; with letters on both sides,
 * '5 = 3 + 2' or '4 ≠ 3 + 2'.
 */
export function conferirTexto(e: Equacao, valores: Record<string, number>): { texto: string; ok: boolean } {
  const vl = valorLado(e.esquerda, valores)
  const vr = valorLado(e.direita, valores)
  const ok = Math.abs(vl - vr) < 1e-7
  const sl = substituirLado(e.esquerda, valores)
  const sr = substituirLado(e.direita, valores)
  const simples = (l: Termo[]) => l.length === 1 && (!l[0].letra || Math.abs(l[0].coef - 1) < EPS)
  if (e.direita.length === 1 && !e.direita[0].letra) {
    const l = simples(e.esquerda) ? sl : `${sl} = ${fmtNum(vl)}`
    if (simples(e.esquerda)) return { texto: `${l} ${ok ? '=' : '≠'} ${fmtNum(vr)}`, ok }
    return { texto: ok ? l : `${l} ≠ ${fmtNum(vr)}`, ok }
  }
  return { texto: `${sl} ${ok ? '=' : '≠'} ${sr}`, ok }
}

// ---------------------------------------------------------------- writing an equation

/** The term of a coefficient: 'x', '−x', '2x', '0,5y' (the sign apart: `comSinal` false gives the size only). */
export function termoTexto(k: number, letra: string, comSinal = true): string {
  const m = Math.abs(k)
  const t = Math.abs(m - 1) < EPS ? letra : `${fmtNum(m)}${letra}`
  return comSinal && k < 0 ? `−${t}` : t
}

/** 'x + y = 10', '2x − 3y = −4', '0 = 2' (every letter gone). */
export function equacaoTexto(coef: number[], c: number, letras: string[]): string {
  const partes: string[] = []
  coef.forEach((k, i) => {
    if (Math.abs(k) < EPS) return
    partes.push(partes.length ? `${k < 0 ? '−' : '+'} ${termoTexto(k, letras[i], false)}` : termoTexto(k, letras[i]))
  })
  return `${partes.join(' ') || '0'} = ${fmtNum(c)}`
}

// ---------------------------------------------------------------- the stacked system (livre.sistema)

export interface SistemaEstado {
  /** As equações, uma por linha: ['x + y = 10', 'x − y = 4']. */
  equacoes?: string[]
  /** Por quanto multiplicar cada equação antes de somar: [1, 2]. */
  vezes?: number[]
  /** As linhas já aparecem multiplicadas. */
  multiplicado?: boolean
  /** A linha da soma embaixo; os termos que se anulam ficam riscados. */
  somado?: boolean
  /** A letra a trocar pelo que ela vale (a primeira equação diz quanto vale: 'y = x + 2'). */
  trocar?: string
  /** A caixa já entrou no lugar da letra, na segunda equação. */
  trocado?: boolean
}

export interface LinhaSistema {
  coef: number[]
  c: number
  /** O fator ao lado da linha (1: nenhum). */
  vezes: number
}

export interface Sistema {
  letras: string[]
  /** As linhas como aparecem (multiplicadas, se for o caso). */
  linhas: LinhaSistema[]
  /** A soma, quando `somado`. */
  soma?: { coef: number[]; c: number }
  /** As letras que somem na soma (os índices de `letras`). */
  somem: number[]
  multiplicado: boolean
  somado: boolean
  /** Se algum fator é diferente de 1. */
  temVezes: boolean
}

const ehNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Reads `sistema` for the stacked equations (two or more, at most two letters); null otherwise or with `trocar`. */
export function sistemaDe(s: unknown): Sistema | null {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null
  const o = s as SistemaEstado
  if (typeof o.trocar === 'string') return null
  const eqs = (Array.isArray(o.equacoes) ? o.equacoes : []).map(lerEquacao)
  if (eqs.length < 2 || eqs.some((e) => !e)) return null
  const letras = letrasDe(eqs as Equacao[])
  if (!letras.length || letras.length > 2) return null
  const par: [string, string] = [letras[0], letras[1] ?? '']
  const vezes = (eqs as Equacao[]).map((_, i) => (ehNum(o.vezes?.[i]) && o.vezes![i] !== 0 ? o.vezes![i] : 1))
  const temVezes = vezes.some((k) => Math.abs(k - 1) > EPS)
  const somado = o.somado === true
  const multiplicado = temVezes && (o.multiplicado === true || somado)
  const linhas = (eqs as Equacao[]).map((e, i) => {
    const [a, b, c] = abcDe(e, par)
    const k = multiplicado ? vezes[i] : 1
    return { coef: [a, b].slice(0, letras.length).map((v) => limpa(v * k)), c: limpa(c * k), vezes: vezes[i] }
  })
  const soma = somado ? { coef: letras.map((_, j) => limpa(linhas.reduce((t, l) => t + l.coef[j], 0))), c: limpa(linhas.reduce((t, l) => t + l.c, 0)) } : undefined
  const somem = soma ? letras.flatMap((_, j) => (Math.abs(soma.coef[j]) < EPS && linhas.some((l) => Math.abs(l.coef[j]) > EPS) ? [j] : [])) : []
  return { letras, linhas, soma, somem, multiplicado, somado, temVezes }
}

/** One row of the stacked system, column by column: a sign cell and a term per letter (the number after the '=' is fmtNum(c)). */
export function celulasDe(coef: number[], letras: string[]): { sinal: string; termo: string }[] {
  const out: { sinal: string; termo: string }[] = []
  let antes = false
  coef.forEach((k, i) => {
    if (Math.abs(k) < EPS) {
      out.push({ sinal: '', termo: '' })
      return
    }
    out.push(antes ? { sinal: k < 0 ? '−' : '+', termo: termoTexto(k, letras[i], false) } : { sinal: '', termo: termoTexto(k, letras[i]) })
    antes = true
  })
  // Every letter gone: a 0 in the first column (0 = 2, 0 = 0).
  if (!antes && out.length) out[0] = { sinal: '', termo: '0' }
  return out
}

// ---------------------------------------------------------------- the substitution (livre.sistema.trocar)

export interface Trecho {
  t: string
  /** The letter being replaced (in the second equation). */
  letra?: boolean
}

export interface Troca {
  letra: string
  /** What the letter is worth: 'x + 2' (from the first equation, 'y = x + 2'). */
  valor: string
  /** The first equation, as written. */
  primeira: string
  /** The second one cut where the letter is: ['x + ', {y}, ' = 10']. */
  segunda: Trecho[]
  /** The second one with the box in: 'x + (x + 2) = 10'. */
  trocada: string
  trocado: boolean
}

/** Reads `sistema: { equacoes: ['y = x + 2', 'x + y = 10'], trocar: 'y' }`; null when the first is not 'y = …' or the second has no y. */
export function trocaDe(s: unknown): Troca | null {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null
  const o = s as SistemaEstado
  const letra = o.trocar
  if (typeof letra !== 'string' || !/^[a-zA-Z]$/.test(letra)) return null
  const [t1, t2] = Array.isArray(o.equacoes) ? o.equacoes : []
  const e1 = lerEquacao(t1)
  const e2 = lerEquacao(t2)
  if (!e1 || !e2) return null
  if (e1.esquerda.length !== 1 || e1.esquerda[0].letra !== letra || Math.abs(e1.esquerda[0].coef - 1) > EPS) return null
  if (e1.direita.some((t) => t.letra === letra)) return null
  const valor = comMenos(String(t1).split('=')[1].trim())
  const texto = comMenos(String(t2).trim())
  const segunda: Trecho[] = []
  let ultimo = 0
  const re = /[a-zA-Z]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(texto)) !== null) {
    if (m[0] !== letra) continue
    if (m.index > ultimo) segunda.push({ t: texto.slice(ultimo, m.index) })
    segunda.push({ t: letra, letra: true })
    ultimo = m.index + 1
  }
  if (!segunda.some((p) => p.letra)) return null
  if (ultimo < texto.length) segunda.push({ t: texto.slice(ultimo) })
  const caixa = `(${valor})`
  return { letra, valor, primeira: comMenos(String(t1).trim()), segunda, trocada: segunda.map((p) => (p.letra ? caixa : p.t)).join(''), trocado: o.trocado === true }
}
