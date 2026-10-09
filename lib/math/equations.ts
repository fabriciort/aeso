import { fmt, texNum } from './view'

// Linear equations as a two-pan balance (lab "Equações na balança").
//
// A side of the balance is m·(x·X + c): x mystery boxes (each weighing the
// unknown X), c unit weights (c < 0 = helium balloons, each pulling 1 up),
// and an optional multiplier m for grouped sides like 4(x − 1). Every
// operation the student can choose is an Op; `stepOptions` builds the
// plausible next moves (right ones and classic mistakes) for any state.

export interface Side {
  /** Multiplier of the whole side: m·(x·X + c). 1 when there are no parentheses. */
  m: number
  /** Number of boxes (coefficient of the unknown). */
  x: number
  /** Loose weights (negative = balloons). */
  c: number
}

export interface Equation {
  l: Side
  r: Side
}

export type Where = 'both' | 'left' | 'right'

export type Op =
  /** Put (positive) or take (negative) x boxes and c weights. */
  | { kind: 'add'; x: number; c: number; where: Where }
  /** Split into k equal groups and keep one. */
  | { kind: 'div'; k: number; where: Where }
  /** Open the parentheses. `wrong`: multiplies only the first term (classic mistake). */
  | { kind: 'expand'; where: Where; wrong?: boolean }

export const side = (x: number, c: number, m = 1): Side => ({ m, x, c })
export const equation = (l: Side, r: Side): Equation => ({ l, r })

/** Rounds away float noise (98,6 − 32 = 66,6, not 66,59999…). */
export const clean = (v: number) => Math.round(v * 1e9) / 1e9
const isInt = (v: number) => Math.abs(v - Math.round(v)) < 1e-9

export function valueOf(s: Side, X: number): number {
  return s.m * (s.x * X + s.c)
}

/** Right minus left: positive means the right pan is heavier. */
export function difference(e: Equation, X: number): number {
  return valueOf(e.r, X) - valueOf(e.l, X)
}

export function holdsAt(e: Equation, X: number): boolean {
  const scale = Math.max(1, Math.abs(valueOf(e.l, X)), Math.abs(valueOf(e.r, X)))
  return Math.abs(difference(e, X)) <= 1e-9 * scale
}

export function expandSide(s: Side, wrong = false): Side {
  return { m: 1, x: clean(s.m * s.x), c: wrong ? s.c : clean(s.m * s.c) }
}

function onSide(s: Side, op: Op): Side {
  switch (op.kind) {
    case 'add': {
      const e = expandSide(s)
      return { m: 1, x: clean(e.x + op.x), c: clean(e.c + op.c) }
    }
    case 'div':
      return { m: 1, x: clean((s.m * s.x) / op.k), c: clean((s.m * s.c) / op.k) }
    case 'expand':
      return s.m === 1 ? s : expandSide(s, op.wrong)
  }
}

export function apply(e: Equation, op: Op): Equation {
  return {
    l: op.where !== 'right' ? onSide(e.l, op) : e.l,
    r: op.where !== 'left' ? onSide(e.r, op) : e.r,
  }
}

export function applyAll(e: Equation, ops: Op[]): Equation {
  return ops.reduce(apply, e)
}

export type Solution = { kind: 'one'; x: number } | { kind: 'none' } | { kind: 'all' }

export function solve(e: Equation): Solution {
  const a = e.l.m * e.l.x - e.r.m * e.r.x
  const b = e.r.m * e.r.c - e.l.m * e.l.c
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-9 ? { kind: 'all' } : { kind: 'none' }
  return { kind: 'one', x: clean(b / a) }
}

/** x alone on one side, a number on the other. */
export function isSolved(e: Equation): boolean {
  const alone = (s: Side) => s.m === 1 && s.x === 1 && s.c === 0
  return (alone(e.l) && e.r.x === 0) || (alone(e.r) && e.l.x === 0)
}

/** What a side looks like on the balance. */
export function itemsOf(s: Side): { boxes: number; units: number; balloons: number } {
  const x = Math.round(s.m * s.x)
  const c = Math.round(s.m * s.c)
  return { boxes: Math.max(0, x), units: Math.max(0, c), balloons: Math.max(0, -c) }
}

// ------------------------------------------------------------------ notation

function termTex(x: number, v: string): string {
  if (x === 1) return v
  if (x === -1) return `-${v}`
  return `${texNum(x)}${v}`
}

export function sideTex(s: Side, v = 'x'): string {
  const parts: string[] = []
  if (s.x !== 0) parts.push(termTex(s.x, v))
  if (s.c !== 0 || s.x === 0) {
    if (parts.length) parts.push(s.c < 0 ? `- ${texNum(-s.c)}` : `+ ${texNum(s.c)}`)
    else parts.push(texNum(s.c))
  }
  const inner = parts.join(' ')
  if (s.m === 1) return inner
  return `${texNum(s.m)}(${inner})`
}

export function toTex(e: Equation, v = 'x', rel = '='): string {
  return `${sideTex(e.l, v)} ${rel} ${sideTex(e.r, v)}`
}

const num = (n: number) => fmt(n, 2).replace('−', 'menos ')

function sideSay(s: Side, v: string): string {
  const parts: string[] = []
  if (s.x !== 0) parts.push(s.x === 1 ? v : s.x === -1 ? `menos ${v}` : `${num(s.x)} ${v}`)
  if (s.c !== 0 || s.x === 0) {
    if (parts.length) parts.push(s.c < 0 ? `menos ${num(-s.c)}` : `mais ${num(s.c)}`)
    else parts.push(num(s.c))
  }
  const inner = parts.join(' ')
  return s.m === 1 ? inner : `${num(s.m)} vezes, ${inner}`
}

export function toSay(e: Equation, v = 'x', rel = 'igual a'): string {
  return `${sideSay(e.l, v)} ${rel} ${sideSay(e.r, v)}`
}

/** "−2", "+4", "÷3", "−2x": an operation in plain text (true minus sign). */
export function opText(op: Op, v = 'x'): string {
  if (op.kind === 'div') return `÷${fmt(op.k)}`
  if (op.kind === 'expand') return 'abrir parênteses'
  if (op.x !== 0) return `${op.x < 0 ? '−' : '+'}${Math.abs(op.x) === 1 ? '' : fmt(Math.abs(op.x))}${v}`
  return `${op.c < 0 ? '−' : '+'}${fmt(Math.abs(op.c))}`
}

export function opTex(op: Op, v = 'x'): string {
  if (op.kind === 'div') return `\\div ${texNum(op.k)}`
  if (op.kind === 'expand') return '(\\ldots)'
  if (op.x !== 0) return `${op.x < 0 ? '-' : '+'}${termTex(Math.abs(op.x), v)}`
  return `${op.c < 0 ? '-' : '+'}${texNum(Math.abs(op.c))}`
}

export function opSay(op: Op, v = 'x'): string {
  if (op.kind === 'div') return `dividir por ${num(op.k)}`
  if (op.kind === 'expand') return 'abrir os parênteses'
  const n = op.x !== 0 ? Math.abs(op.x) : Math.abs(op.c)
  const what = op.x !== 0 ? (n === 1 ? `1 ${v}` : `${num(n)} ${v}`) : num(n)
  return `${(op.x !== 0 ? op.x : op.c) < 0 ? 'tirar' : 'pôr'} ${what}`
}

export const WHERE_TEXT: Record<Where, string> = { both: 'dos dois lados', left: 'só da esquerda', right: 'só da direita' }

// ------------------------------------------------------------------ choices

/**
 * good: keeps the balance and gets closer to x alone.
 * breaks: done to one side only, the balance tips.
 * detour: legal, but leaves x still surrounded (takes the other side's number).
 * messy: legal, but turns weights into fractions.
 * stuck: asks for boxes that are not there.
 * coefNotLoose: subtracts the coefficient as if 3x were "3 + x".
 * wrongExpand: multiplies only the first term inside the parentheses.
 */
export type Verdict = 'good' | 'breaks' | 'detour' | 'messy' | 'stuck' | 'coefNotLoose' | 'wrongExpand'

export interface Option {
  id: string
  op: Op
  verdict: Verdict
  /** Big label of the button (TeX). */
  tex: string
  /** Small line under it ("dos dois lados"). */
  sub: string
  say: string
}

const other = (w: 'left' | 'right'): 'left' | 'right' => (w === 'left' ? 'right' : 'left')
const sideAt = (e: Equation, w: 'left' | 'right') => (w === 'left' ? e.l : e.r)

/**
 * The plausible next moves for a state, in priority order: the canonical
 * right move first, then the classic mistakes. `max` keeps the first ones;
 * use `shuffled` to present them.
 */
export function stepOptions(e: Equation, v = 'x', max = 4): Option[] {
  const out: Option[] = []
  const push = (op: Op, verdict: Verdict, tex?: string, sub?: string) => {
    const t = tex ?? opTex(op, v)
    const s = sub ?? WHERE_TEXT[op.where]
    out.push({ id: `${t}|${s}`, op, verdict, tex: t, sub: s, say: `${op.kind === 'expand' ? t : opSay(op, v)}, ${s}` })
  }
  if (isSolved(e) || solve(e).kind !== 'one') return []

  // Parentheses first: open them (or the classic half-opening).
  const g = e.l.m !== 1 ? 'left' : e.r.m !== 1 ? 'right' : null
  if (g) {
    const s = sideAt(e, g)
    const o = sideAt(e, other(g))
    push({ kind: 'expand', where: g }, 'good', sideTex(expandSide(s), v), 'abrir os parênteses')
    push({ kind: 'expand', where: g, wrong: true }, 'wrongExpand', sideTex(expandSide(s, true), v), 'abrir os parênteses')
    const k = s.m
    const fair = isInt((o.m * o.x) / k) && isInt((o.m * o.c) / k)
    push({ kind: 'div', k, where: 'both' }, fair ? 'good' : 'messy')
    return out.slice(0, max)
  }

  const lx = e.l.x
  const rx = e.r.x
  if (lx > 0 && rx > 0) {
    // Boxes on both sides: take the same number of boxes from each.
    const n = Math.min(lx, rx)
    const big: 'left' | 'right' = lx >= rx ? 'left' : 'right'
    push({ kind: 'add', x: -n, c: 0, where: 'both' }, 'good')
    push({ kind: 'add', x: -n, c: 0, where: big }, 'breaks')
    if (Math.max(lx, rx) !== n) push({ kind: 'add', x: -Math.max(lx, rx), c: 0, where: 'both' }, 'stuck')
    const cm = Math.min(e.l.c, e.r.c)
    if (cm > 0) push({ kind: 'add', x: 0, c: -cm, where: 'both' }, 'good')
    return out.slice(0, max)
  }

  const w: 'left' | 'right' = lx !== 0 ? 'left' : 'right'
  const s = sideAt(e, w)
  const o = sideAt(e, other(w))
  if (s.c !== 0) {
    // Weights (or balloons) next to the boxes: undo them on both sides.
    push({ kind: 'add', x: 0, c: -s.c, where: 'both' }, 'good')
    push({ kind: 'add', x: 0, c: -s.c, where: w }, 'breaks')
    if (o.c !== 0 && o.c !== s.c) push({ kind: 'add', x: 0, c: -o.c, where: 'both' }, 'detour')
    if (Math.abs(s.x) !== 1) {
      const fair = isInt(s.c / s.x) && isInt(o.c / s.x)
      push({ kind: 'div', k: s.x, where: 'both' }, fair ? 'good' : 'messy')
    }
    return out.slice(0, max)
  }

  // Boxes alone: split into equal groups.
  const k = s.x
  push({ kind: 'div', k, where: 'both' }, 'good')
  push({ kind: 'add', x: 0, c: -k, where: 'both' }, 'coefNotLoose')
  push({ kind: 'div', k, where: w }, 'breaks')
  return out.slice(0, max)
}

/** A stable shuffle (the right answer is not always first). */
export function shuffled<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    const j = h % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Follows the canonical right move until x is alone. */
export function solutionPath(e: Equation, limit = 12): Op[] {
  const ops: Op[] = []
  let cur = e
  while (!isSolved(cur) && ops.length < limit) {
    const good = stepOptions(cur).find((o) => o.verdict === 'good')
    if (!good) break
    ops.push(good.op)
    cur = apply(cur, good.op)
  }
  return ops
}

// ------------------------------------------------------------------ physics

/**
 * Equilibrium angle of the beam (rad, positive = right pan down): grows in
 * proportion to the weight difference for small differences and saturates
 * at `max` (the beam hits its stop).
 */
export function tiltTarget(diff: number, max = 0.28, scale = 3): number {
  return max * Math.tanh(diff / scale)
}

export interface SpringState {
  a: number
  v: number
}

/**
 * One step of a damped spring (semi-implicit Euler, sub-stepped so it is
 * stable at any frame rate). ζ < 1 gives a small, quickly damped wobble.
 */
export function springStep(s: SpringState, target: number, dt: number, omega = 6.5, zeta = 0.42): SpringState {
  let { a, v } = s
  const n = Math.max(1, Math.ceil(dt / (1 / 120)))
  const h = dt / n
  for (let i = 0; i < n; i++) {
    const acc = -omega * omega * (a - target) - 2 * zeta * omega * v
    v += acc * h
    a += v * h
  }
  return { a, v }
}

// ------------------------------------------------------------------ real world

/** Definition of the scales: t/°F = 1,8 · t/°C + 32 (NIST SP 811, Apêndice B). */
export const fahrenheitFromCelsius = (c: number) => clean(1.8 * c + 32)
export const celsiusFromFahrenheit = (f: number) => clean((f - 32) / 1.8)
