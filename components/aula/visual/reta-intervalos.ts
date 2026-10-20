// As inequações na reta (AF.U5), sem React (para a reta, o Mexa e os testes):
// ler uma condição ('x > 3', '2 < x ≤ 5', '2x + 3 < 11', '(x − 2)(x − 5) < 0',
// 'x < −3 ou x > 3'), pôr um número nela e mostrar a conta, achar o pedaço da
// reta que serve, a sobreposição de dois pedaços, o espelho de multiplicar
// por −1, e onde desenhar cada faixa, bolinha, seta e sinal.

import { fmtNum } from './figura-geo'

const EPS = 1e-9
const limpa = (v: number) => (Number.isFinite(v) ? Math.round(v * 1e9) / 1e9 || 0 : v)

/** Um pedaço da reta, como o conteúdo escreve: `de`/`ate` (null ou ausente: sem fim) e se cada ponta entra. */
export interface PedacoEntrada {
  de?: number | null
  ate?: number | null
  /** As pontas que entram: `true` as duas, `[true, false]` só a da esquerda. Padrão: nenhuma (bolinhas vazias). */
  inclui?: boolean | [boolean, boolean]
}

/** Uma faixa da reta: um pedaço, ou uma condição escrita (que pode ser uma união: 'x < −3 ou x > 3'). */
export type IntervaloEntrada =
  | string
  | (PedacoEntrada & {
      condicao?: string
      /** 'ambar', 'azul', 'verde' ou 'rosa'. Padrão: âmbar a primeira, azul a segunda. */
      cor?: string
      /** Um texto pequeno sobre a faixa, na cor dela ('x ≥ −1'). */
      rotulo?: string
    })

/** Um pedaço já lido: a e b podem ser ±Infinity; ia e ib dizem se a ponta entra. */
export interface Pedaco {
  a: number
  b: number
  ia: boolean
  ib: boolean
}

// ---------------------------------------------------------------------------
// Ler uma condição

type No =
  | { k: 'num'; v: number }
  | { k: 'var' }
  | { k: 'neg'; a: No }
  | { k: 'add'; termos: { s: 1 | -1; n: No }[] }
  | { k: 'mul'; fs: No[] }
  | { k: 'div'; a: No; b: No }
  | { k: 'pow'; a: No; n: number }
  | { k: 'par'; a: No }

export type Rel = '<' | '>' | '≤' | '≥' | '='

/** Uma cadeia de comparações: 2 < x ≤ 5 são os lados [2, x, 5] e as relações ['<', '≤']. */
interface Cadeia {
  lados: No[]
  rels: Rel[]
}

/** Uma condição: uniões ('ou') de conjunções ('e') de cadeias. */
export interface Condicao {
  ou: Cadeia[][]
  letra: string
  texto: string
}

type Tok = { t: 'num'; v: number } | { t: 'var'; l: string } | { t: 'op'; o: string } | { t: 'rel'; r: Rel } | { t: 'e' } | { t: 'ou' }

function tokens(s: string): Tok[] | null {
  const src = s.replace(/[−–]/g, '-').replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/\s+/g, ' ').trim()
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === ' ') {
      i++
      continue
    }
    const num = /^\d+(?:\.\d{3})*(?:,\d+)?|^\d+(?:,\d+)?/.exec(src.slice(i))
    if (num) {
      out.push({ t: 'num', v: Number(num[0].replace(/\./g, '').replace(',', '.')) })
      i += num[0].length
      continue
    }
    const word = /^[a-zA-Zà-ú]+/.exec(src.slice(i))
    if (word) {
      const w = word[0].toLowerCase()
      if (w === 'e') out.push({ t: 'e' })
      else if (w === 'ou') out.push({ t: 'ou' })
      else if (word[0].length === 1) out.push({ t: 'var', l: word[0] })
      else return null
      i += word[0].length
      continue
    }
    if ('<>≤≥='.includes(c)) {
      out.push({ t: 'rel', r: c as Rel })
      i++
      continue
    }
    if ('+-*·×/:()²³^'.includes(c)) {
      out.push({ t: 'op', o: c === '*' || c === '×' ? '·' : c === ':' ? '/' : c })
      i++
      continue
    }
    return null
  }
  return out
}

/** Lê uma condição; null quando não é uma comparação com uma letra só. */
export function lerCondicao(texto: unknown): Condicao | null {
  if (typeof texto !== 'string' || !texto.trim()) return null
  const tk = tokens(texto)
  if (!tk?.length) return null
  const letras = new Set(tk.flatMap((t) => (t.t === 'var' ? [t.l] : [])))
  if (letras.size > 1) return null
  const letra = [...letras][0] ?? 'x'
  let p = 0
  const peek = () => tk[p]
  const isOp = (o: string) => peek()?.t === 'op' && (peek() as { o: string }).o === o
  const fail = (): never => {
    throw new Error('condição')
  }

  const primario = (): No => {
    const t = peek()
    if (!t) return fail()
    if (t.t === 'num') {
      p++
      return { k: 'num', v: t.v }
    }
    if (t.t === 'var') {
      p++
      return { k: 'var' }
    }
    if (isOp('(')) {
      p++
      const a = expr()
      if (!isOp(')')) return fail()
      p++
      return { k: 'par', a }
    }
    return fail()
  }
  const potencia = (): No => {
    let a = primario()
    for (;;) {
      if (isOp('²') || isOp('³')) {
        const n = (peek() as { o: string }).o === '²' ? 2 : 3
        p++
        a = { k: 'pow', a, n }
      } else if (isOp('^')) {
        p++
        const t = peek()
        if (t?.t !== 'num' || !Number.isInteger(t.v) || t.v > 6) return fail()
        p++
        a = { k: 'pow', a, n: t.v }
      } else return a
    }
  }
  const fator = (): No => {
    if (isOp('-')) {
      p++
      return { k: 'neg', a: fator() }
    }
    if (isOp('+')) {
      p++
      return fator()
    }
    return potencia()
  }
  const termo = (): No => {
    const fs: No[] = [fator()]
    for (;;) {
      if (isOp('·')) {
        p++
        fs.push(fator())
      } else if (isOp('/')) {
        p++
        const b = fator()
        const a: No = fs.length === 1 ? fs[0] : { k: 'mul', fs: [...fs] }
        fs.length = 0
        fs.push({ k: 'div', a, b })
      } else if (peek()?.t === 'num' || peek()?.t === 'var' || isOp('(')) {
        // Multiplicação sem sinal: 2x, 3(x + 1), (x − 2)(x − 5).
        fs.push(potencia())
      } else break
    }
    return fs.length === 1 ? fs[0] : { k: 'mul', fs }
  }
  const expr = (): No => {
    const termos: { s: 1 | -1; n: No }[] = [{ s: 1, n: termo() }]
    while (isOp('+') || isOp('-')) {
      const s = isOp('+') ? 1 : -1
      p++
      termos.push({ s, n: termo() })
    }
    return termos.length === 1 ? termos[0].n : { k: 'add', termos }
  }
  const cadeia = (): Cadeia => {
    const lados = [expr()]
    const rels: Rel[] = []
    while (peek()?.t === 'rel') {
      rels.push((peek() as { r: Rel }).r)
      p++
      lados.push(expr())
    }
    if (!rels.length) return fail()
    return { lados, rels }
  }
  try {
    const ou: Cadeia[][] = [[cadeia()]]
    while (peek()?.t === 'e' || peek()?.t === 'ou') {
      const t = peek()!.t
      p++
      if (t === 'e') ou[ou.length - 1].push(cadeia())
      else ou.push([cadeia()])
    }
    if (p !== tk.length) return null
    return { ou, letra, texto: texto.replace(/-/g, '−').trim() }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Pôr um número na condição

function valor(n: No, x: number): number {
  switch (n.k) {
    case 'num':
      return n.v
    case 'var':
      return x
    case 'neg':
      return -valor(n.a, x)
    case 'add':
      return n.termos.reduce((s, t) => s + t.s * valor(t.n, x), 0)
    case 'mul':
      return n.fs.reduce((s, f) => s * valor(f, x), 1)
    case 'div':
      return valor(n.a, x) / valor(n.b, x)
    case 'pow':
      return valor(n.a, x) ** n.n
    case 'par':
      return valor(n.a, x)
  }
}

function vale(r: Rel, a: number, b: number): boolean {
  const d = limpa(a - b)
  if (r === '<') return d < -EPS
  if (r === '>') return d > EPS
  if (r === '≤') return d <= EPS
  if (r === '≥') return d >= -EPS
  return Math.abs(d) <= EPS
}

const valeCadeia = (c: Cadeia, x: number) => c.rels.every((r, i) => vale(r, valor(c.lados[i], x), valor(c.lados[i + 1], x)))

/** O número serve à condição? */
export function serve(c: Condicao, x: number): boolean {
  return c.ou.some((e) => e.every((ch) => valeCadeia(ch, x)))
}

const atomico = (n: No): boolean => n.k === 'num' || n.k === 'var' || (n.k === 'neg' && n.a.k === 'num')
/** Um número na conta: negativo entre parênteses quando vem depois de outra coisa. */
const nParen = (v: number) => (limpa(v) < 0 ? `(${fmtNum(limpa(v))})` : fmtNum(limpa(v)))

/** A expressão com o número no lugar da letra: 2x + 3 com 5 é "2 · 5 + 3"; (x − 2)(x − 5) com 3 é "(3 − 2)(3 − 5)". */
function escrever(n: No, x: number, primeiro = true): string {
  switch (n.k) {
    case 'num':
      return fmtNum(n.v)
    case 'var':
      return primeiro ? fmtNum(limpa(x)) : nParen(x)
    case 'neg':
      return `−${escrever(n.a, x, false)}`
    case 'add':
      return n.termos.map((t, i) => (i === 0 ? (t.s < 0 ? '−' : '') + escrever(t.n, x, t.s > 0) : `${t.s < 0 ? ' − ' : ' + '}${escrever(t.n, x, false)}`)).join('')
    case 'mul':
      return n.fs.map((f, i) => (i === 0 ? escrever(f, x, primeiro) : `${f.k === 'par' ? '' : ' · '}${escrever(f, x, false)}`)).join('')
    case 'div':
      return `${escrever(n.a, x, primeiro)} ÷ ${escrever(n.b, x, false)}`
    case 'pow': {
      const base = n.a.k === 'var' ? (x < 0 ? `(${fmtNum(limpa(x))})` : fmtNum(limpa(x))) : escrever(n.a, x, primeiro)
      return `${base}${n.n === 2 ? '²' : n.n === 3 ? '³' : `^${n.n}`}`
    }
    case 'par':
      return `(${escrever(n.a, x, true)})`
  }
}

/** A conta de um lado que não é só um número: "2 · 5 + 3 = 13", "(3 − 2)(3 − 5) = 1 · (−2) = −2". */
function contaDoLado(n: No, x: number): string | null {
  if (atomico(n)) return null
  const v = limpa(valor(n, x))
  const partes = [escrever(n, x)]
  if (n.k === 'mul' && n.fs.length > 1 && n.fs.some((f) => !atomico(f))) partes.push(n.fs.map((f, i) => (i === 0 ? fmtNum(limpa(valor(f, x))) : nParen(valor(f, x)))).join(' · '))
  partes.push(fmtNum(v))
  return [...new Set(partes)].join(' = ')
}

const NOME: Record<Rel, string> = { '<': 'menor que', '>': 'maior que', '≤': 'menor ou igual a', '≥': 'maior ou igual a', '=': 'igual a' }

export interface Teste {
  x: number
  serve: boolean
  /** As contas dos lados ("2 · 5 + 3 = 13"), ou vazio quando os lados são só números. */
  conta: string
  /** A comparação com os números: "13 < 11", "−1 ≤ 7 < 7", "−5 < −3 ou −5 > 3". */
  comparacao: string
  /** Quando falha por empate (3 > 3): "3 é igual a 3: não é maior." */
  empate?: string
  /** Por que não serve, por extenso: "13 não é menor que 11." */
  motivo?: string
}

/** Põe o número na condição e diz se serve, com a conta. */
export function testar(c: Condicao, x: number): Teste {
  const contas: string[] = []
  const comps: string[] = []
  let empate: string | undefined
  let motivo: string | undefined
  for (const e of c.ou) {
    const partes: string[] = []
    for (const ch of e) {
      const vs = ch.lados.map((l) => limpa(valor(l, x)))
      ch.lados.forEach((l) => {
        const t = contaDoLado(l, x)
        if (t && !contas.includes(t)) contas.push(t)
      })
      partes.push(vs.map((v, i) => (i === 0 ? fmtNum(v) : `${ch.rels[i - 1]} ${fmtNum(v)}`)).join(' '))
      ch.rels.forEach((r, i) => {
        if (vale(r, vs[i], vs[i + 1]) || motivo) return
        const [a, b] = [fmtNum(vs[i]), fmtNum(vs[i + 1])]
        if (Math.abs(vs[i] - vs[i + 1]) <= EPS && (r === '<' || r === '>')) {
          empate = `${a} é igual a ${b}: não é ${r === '>' ? 'maior' : 'menor'}.`
          motivo = empate
        } else motivo = `${a} não é ${NOME[r]} ${b}.`
      })
    }
    comps.push(partes.join(' e '))
  }
  const ok = serve(c, x)
  return { x: limpa(x), serve: ok, conta: contas.join('; '), comparacao: comps.join(' ou '), ...(ok ? {} : { empate, motivo }) }
}

// ---------------------------------------------------------------------------
// O pedaço que serve

type Poli = number[]
const pAdd = (a: Poli, b: Poli, s = 1): Poli => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + s * (b[i] ?? 0))
const pMul = (a: Poli, b: Poli): Poli => {
  const out: Poli = Array(a.length + b.length - 1).fill(0)
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)))
  return out
}
const grau = (a: Poli) => {
  let g = a.length - 1
  while (g > 0 && Math.abs(a[g]) < EPS) g--
  return g
}

function poli(n: No): Poli | null {
  switch (n.k) {
    case 'num':
      return [n.v]
    case 'var':
      return [0, 1]
    case 'neg': {
      const a = poli(n.a)
      return a && a.map((v) => -v)
    }
    case 'par':
      return poli(n.a)
    case 'add': {
      let s: Poli = [0]
      for (const t of n.termos) {
        const q = poli(t.n)
        if (!q) return null
        s = pAdd(s, q, t.s)
      }
      return s
    }
    case 'mul': {
      let s: Poli = [1]
      for (const f of n.fs) {
        const q = poli(f)
        if (!q) return null
        s = pMul(s, q)
      }
      return s
    }
    case 'div': {
      const a = poli(n.a)
      const b = poli(n.b)
      if (!a || !b || grau(b) > 0 || Math.abs(b[0]) < EPS) return null
      return a.map((v) => v / b[0])
    }
    case 'pow': {
      const a = poli(n.a)
      if (!a) return null
      let s: Poli = [1]
      for (let i = 0; i < n.n; i++) s = pMul(s, a)
      return s
    }
  }
}

const avaliar = (a: Poli, x: number) => a.reduceRight((s, c) => s * x + c, 0)

/** As raízes reais de um polinômio (exatas até o 2º grau; acima, procuradas). */
export function raizes(a: Poli): number[] {
  const g = grau(a)
  if (g === 0) return []
  if (g === 1) return [limpa(-a[0] / a[1])]
  if (g === 2) {
    const [c, b, A] = a
    const d = b * b - 4 * A * c
    if (d < -EPS) return []
    if (Math.abs(d) <= EPS) return [limpa(-b / (2 * A))]
    const r = Math.sqrt(d)
    return [limpa((-b - r) / (2 * A)), limpa((-b + r) / (2 * A))].sort((p, q) => p - q)
  }
  const lim = 1 + Math.max(...a.slice(0, g).map((c) => Math.abs(c / a[g])))
  const out: number[] = []
  const N = 4000
  let x0 = -lim
  let f0 = avaliar(a, x0)
  for (let i = 1; i <= N; i++) {
    const x1 = -lim + (2 * lim * i) / N
    const f1 = avaliar(a, x1)
    if (Math.abs(f1) < 1e-12) out.push(limpa(x1))
    else if (f0 * f1 < 0) {
      let [lo, hi] = [x0, x1]
      for (let k = 0; k < 80; k++) {
        const m = (lo + hi) / 2
        if (avaliar(a, lo) * avaliar(a, m) <= 0) hi = m
        else lo = m
      }
      out.push(limpa((lo + hi) / 2))
    }
    x0 = x1
    f0 = f1
  }
  return [...new Set(out)].sort((p, q) => p - q)
}

/** Todos os números que servem, em pedaços (da esquerda para a direita). */
export function solucaoDe(c: Condicao): Pedaco[] {
  const bordas = new Set<number>()
  for (const e of c.ou)
    for (const ch of e)
      ch.rels.forEach((_, i) => {
        const l = poli(ch.lados[i])
        const r = poli(ch.lados[i + 1])
        if (l && r) raizes(pAdd(l, r, -1)).forEach((v) => bordas.add(v))
      })
  const B = [...bordas].sort((p, q) => p - q)
  // Os trechos: (−∞, B0), {B0}, (B0, B1), …, (Bn, +∞).
  const trechos: { a: number; b: number; ponto: boolean; teste: number }[] = []
  if (!B.length) trechos.push({ a: -Infinity, b: Infinity, ponto: false, teste: 0 })
  B.forEach((v, i) => {
    trechos.push({ a: i ? B[i - 1] : -Infinity, b: v, ponto: false, teste: i ? (B[i - 1] + v) / 2 : v - 1 })
    trechos.push({ a: v, b: v, ponto: true, teste: v })
  })
  if (B.length) trechos.push({ a: B[B.length - 1], b: Infinity, ponto: false, teste: B[B.length - 1] + 1 })
  const out: Pedaco[] = []
  let cur: Pedaco | null = null
  for (const t of trechos) {
    if (!serve(c, t.teste)) {
      if (cur) out.push(cur)
      cur = null
      continue
    }
    if (!cur) cur = { a: t.a, b: t.b, ia: t.ponto, ib: t.ponto }
    else {
      cur.b = t.b
      cur.ib = t.ponto
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Um pedaço do conteúdo, lido. */
export function pedacoDe(p: PedacoEntrada): Pedaco | null {
  const a = typeof p.de === 'number' && Number.isFinite(p.de) ? p.de : -Infinity
  const b = typeof p.ate === 'number' && Number.isFinite(p.ate) ? p.ate : Infinity
  if (a > b) return null
  const inc = Array.isArray(p.inclui) ? p.inclui : [p.inclui === true, p.inclui === true]
  return { a, b, ia: Number.isFinite(a) && Boolean(inc[0]), ib: Number.isFinite(b) && Boolean(inc[1]) }
}

/** Os pedaços de uma faixa do conteúdo (uma condição escrita pode dar dois: 'x < −3 ou x > 3'). */
export function pedacosDe(e: IntervaloEntrada | undefined | null): Pedaco[] {
  if (!e) return []
  if (typeof e === 'string' || typeof e.condicao === 'string') {
    const c = lerCondicao(typeof e === 'string' ? e : e.condicao)
    return c ? solucaoDe(c) : []
  }
  const p = pedacoDe(e)
  return p ? [p] : []
}

/** O que serve aos dois: a sobreposição de duas listas de pedaços. */
export function intersecao(A: Pedaco[], B: Pedaco[]): Pedaco[] {
  const out: Pedaco[] = []
  for (const p of A)
    for (const q of B) {
      const a = Math.max(p.a, q.a)
      const b = Math.min(p.b, q.b)
      const ia = p.a === q.a ? p.ia && q.ia : p.a > q.a ? p.ia : q.ia
      const ib = p.b === q.b ? p.ib && q.ib : p.b < q.b ? p.ib : q.ib
      if (a < b || (a === b && ia && ib)) out.push({ a, b, ia, ib })
    }
  return out.sort((p, q) => p.a - q.a)
}

/** Multiplicar por −1: cada pedaço vai para o outro lado do zero (x < 3 vira −x > −3). */
export function espelhar(P: Pedaco[]): Pedaco[] {
  return P.map((p) => ({ a: limpa(-p.b), b: limpa(-p.a), ia: p.ib, ib: p.ia })).sort((p, q) => p.a - q.a)
}

/** Os pedaços escritos: "x > 3", "2 < x ≤ 5", "x < −3 ou x > 3". */
export function textoDe(P: Pedaco[], letra = 'x'): string {
  if (!P.length) return 'nenhum número'
  return P.map((p) => {
    const A = Number.isFinite(p.a)
    const B = Number.isFinite(p.b)
    if (!A && !B) return 'todo número'
    if (A && B && p.a === p.b) return `${letra} = ${fmtNum(p.a)}`
    if (!A) return `${letra} ${p.ib ? '≤' : '<'} ${fmtNum(p.b)}`
    if (!B) return `${letra} ${p.ia ? '≥' : '>'} ${fmtNum(p.a)}`
    return `${fmtNum(p.a)} ${p.ia ? '≤' : '<'} ${letra} ${p.ib ? '≤' : '<'} ${fmtNum(p.b)}`
  }).join(' ou ')
}

/** O número está no pedaço? */
export const dentro = (P: Pedaco[], x: number) => P.some((p) => (x > p.a && x < p.b) || (x === p.a && p.ia) || (x === p.b && p.ib))

// ---------------------------------------------------------------------------
// O desenho

export type Ponta = 'seta' | 'cheia' | 'vazia'

/** A faixa de um pedaço na parte visível da reta: de onde a onde, e o que vai em cada ponta. */
export interface Faixa {
  v1: number
  v2: number
  esq: Ponta
  dir: Ponta
}

/** Onde a faixa vai na reta de `de` a `ate`. Um pedaço que passa da ponta da reta segue com a seta; fora da reta, nada. */
export function faixaDe(p: Pedaco, de: number, ate: number): Faixa | null {
  if (p.b < de || p.a > ate || (p.b === de && !p.ib) || (p.a === ate && !p.ia)) return null
  const esq: Ponta = p.a < de ? 'seta' : p.ia ? 'cheia' : 'vazia'
  const dir: Ponta = p.b > ate ? 'seta' : p.ib ? 'cheia' : 'vazia'
  return { v1: Math.max(de, p.a), v2: Math.min(ate, p.b), esq, dir }
}

/** As pontas que são números (para escrever embaixo da reta). */
export const pontasDe = (P: Pedaco[]) => P.flatMap((p) => [p.a, p.b]).filter((v) => Number.isFinite(v))

/** Um pedaço com o sinal do produto: `{ ate: 2, sinal: '+' }`, `{ de: 2, ate: 5, sinal: '−', serve: true }`. */
export interface RegiaoEntrada extends PedacoEntrada {
  sinal: string
  /** O pedaço que serve fica pintado por baixo, na cor do sinal. */
  serve?: boolean
}

export interface Regiao {
  p: Pedaco
  sinal: '+' | '−'
  serve: boolean
  /** Onde o sinal fica: o meio da parte visível. */
  meio: number
}

/** As regiões de sinal, lidas, com o lugar de cada sinal. */
export function regioesDe(lista: unknown, de: number, ate: number): Regiao[] {
  if (!Array.isArray(lista)) return []
  return lista.flatMap((r: RegiaoEntrada) => {
    if (!r || typeof r !== 'object') return []
    const p = pedacoDe(r)
    const s = String(r.sinal ?? '').replace('-', '−').trim()
    if (!p || (s !== '+' && s !== '−')) return []
    const v1 = Math.max(de, p.a)
    const v2 = Math.min(ate, p.b)
    if (v1 > v2) return []
    return [{ p, sinal: s, serve: r.serve === true, meio: (v1 + v2) / 2 }]
  })
}

/** As raízes entre as regiões (as pontas finitas, sem repetir). */
export const raizesDasRegioes = (rs: Regiao[]) => [...new Set(rs.flatMap((r) => pontasDe([r.p])))].sort((a, b) => a - b)

/** O arco de um ponto que vai de x1 a x2 por cima da reta: `n` pontos [x, y] (y sobe com `lift`). */
export function arcoEspelho(x1: number, x2: number, y: number, lift: number, n = 12): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    return [x1 + (x2 - x1) * t, y - lift * 4 * t * (1 - t)]
  })
}

/** A altura do arco do espelho: proporcional à distância (os arcos de 3 e de 5 ficam um dentro do outro), `max` para a reta inteira. */
export const alturaDoArco = (dx: number, largura: number, max: number) => Math.max(12, (max * Math.abs(dx)) / Math.max(1, largura))

/** A comparação de dois números, antes e depois do espelho: 3 < 5 vira −3 > −5. */
export function comparacaoEspelho(a: number, b: number, espelhado: boolean): { esquerda: string; rel: string; direita: string } {
  const [p, q] = espelhado ? [limpa(-a), limpa(-b)] : [a, b]
  const rel = Math.abs(p - q) < EPS ? '=' : p < q ? '<' : '>'
  return { esquerda: fmtNum(p), rel, direita: fmtNum(q) }
}

/** A condição de um pedaço espelhado, escrita com −x: x < 3 vira −x > −3 (a relação fica em destaque). */
export function textoEspelho(P: Pedaco[], letra: string, espelhado: boolean): string {
  return espelhado ? textoDe(espelhar(P), `−${letra}`) : textoDe(P, letra)
}

// ---------------------------------------------------------------------------
// O Mexa "testar"

export interface MetaTestar {
  /** Quantos números diferentes testar. */
  testados?: number
  /** Números que têm de ser testados (o 3 de x > 3). */
  testar?: number[]
}

/** O Mexa "testar" terminou? Pede a meta, pelo menos um que serve e um que não serve (se a reta tem dos dois), e os números pedidos. */
export function testarFeito(c: Condicao, testados: number[], meta: MetaTestar, candidatos: number[]): { feito: boolean; falta?: string } {
  const unicos = [...new Set(testados)]
  const n = Math.max(meta.testados ?? 0, meta.testar?.length ?? 0)
  const pedidos = (meta.testar ?? []).filter((v) => !unicos.some((t) => Math.abs(t - v) < EPS))
  const temSim = candidatos.some((v) => serve(c, v))
  const temNao = candidatos.some((v) => !serve(c, v))
  const sim = unicos.some((v) => serve(c, v))
  const nao = unicos.some((v) => !serve(c, v))
  if (unicos.length < n) return { feito: false }
  if (temSim && !sim) return { feito: false, falta: 'Teste também um número que serve.' }
  if (temNao && !nao) return { feito: false, falta: 'Teste também um número que não serve.' }
  if (pedidos.length) return { feito: false, falta: `Teste também o ${pedidos.map((v) => fmtNum(v)).join(' e o ')}.` }
  return { feito: true }
}

/** Os números que "Me mostre" testa: os pedidos, depois um que serve e um que não, depois os mais perto das bordas. */
export function testesDaSolucao(c: Condicao, meta: MetaTestar, candidatos: number[]): number[] {
  const out: number[] = [...(meta.testar ?? []).filter((v) => candidatos.some((t) => Math.abs(t - v) < EPS))]
  const add = (v: number | undefined) => v !== undefined && !out.includes(v) && out.push(v)
  const P = solucaoDe(c)
  const bordas = pontasDe(P)
  const perto = [...candidatos].sort((p, q) => Math.min(...bordas.map((b) => Math.abs(p - b)), 1e9) - Math.min(...bordas.map((b) => Math.abs(q - b)), 1e9))
  if (!out.some((v) => serve(c, v))) add(perto.find((v) => serve(c, v)))
  if (!out.some((v) => !serve(c, v))) add(perto.find((v) => !serve(c, v)))
  for (const v of perto) {
    if (testarFeito(c, out, meta, candidatos).feito) break
    add(v)
  }
  return out
}

/** O passo redondo da reta quando o conteúdo não dá `passo` (o mesmo da reta). */
export function passoRedondo(span: number): number {
  const raw = span / 10
  const p = 10 ** Math.floor(Math.log10(raw || 1))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
}

/** Os traços da reta (onde o toque encaixa): de `de` a `ate`, de `passo` em `passo`. */
export function tracosDaReta(e: { de?: unknown; ate?: unknown; passo?: unknown }): number[] {
  const de = typeof e.de === 'number' ? e.de : 0
  const ate = typeof e.ate === 'number' ? e.ate : 10
  const passo = typeof e.passo === 'number' && e.passo > 0 ? e.passo : passoRedondo(ate - de)
  const n = Math.round((ate - de) / passo)
  if (!(n > 0) || n > 200) return []
  return Array.from({ length: n + 1 }, (_, i) => +(de + i * passo).toFixed(6))
}
