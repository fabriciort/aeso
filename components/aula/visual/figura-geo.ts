// A figura da U16 (geometria plana), sem React (para o visual, o Mexa e os
// testes): pontos com nome, lados, ângulos, perímetro, a leitura do
// transferidor, o recorte do paralelogramo, os quadrados de Pitágoras e o
// círculo desenrolado.
//
// As coordenadas são do "mundo": x para a direita, y para cima, em unidades
// (1 unidade = 1 quadradinho da grade). O palco escala tudo para caber.

export type Vec = [number, number]
/** Um ponto: o nome de um ponto de `pontos` ('A') ou as coordenadas ([2, 3]). */
export type Ref = string | Vec
/** Cor de destaque: true ou 'ambar' (âmbar), 'azul' (sky), 'erro' (rose). */
export type Cor = boolean | 'ambar' | 'azul' | 'verde' | 'erro'

/** Um segmento (ou reta, ou semirreta): ['A', 'B'], ['A', 'B', '5 cm'] ou o objeto. */
export type Traco = [Ref, Ref] | [Ref, Ref, string] | { de: Ref; ate: Ref; medida?: string; destaque?: Cor; tracejado?: boolean }

export interface Poligono {
  /** Os cantos, em ordem (a figura fecha sozinha). */
  vertices: Ref[]
  /** Pinta o interior (true: âmbar claro; 'azul'…). */
  preenchido?: Cor
  /** O contorno em cor. */
  destaque?: Cor
  /** A medida de cada lado (lado i vai do canto i ao canto i + 1): true calcula; uma lista escreve o que vier (null pula). */
  lados?: boolean | (string | number | null)[]
  /** O arco de cada canto com o valor: true calcula os graus; uma lista escreve o que vier (null pula). */
  angulos?: boolean | (string | number | null)[]
  /** Cantos com o quadradinho do ângulo reto (índices ou nomes). */
  angulosRetos?: (number | string)[]
  /** Uma palavra no meio da figura ("quadrado"). */
  nome?: string
}

export interface Angulo {
  /** Forma com pontos: o vértice e um ponto em cada lado. */
  vertice?: Ref
  de?: Ref
  ate?: Ref
  /** Forma isolada: a abertura, em graus (o lado `de` aponta para `inicio`, padrão 0 = para a direita). */
  graus?: number
  inicio?: number
  /** Onde fica o vértice do ângulo isolado (padrão [0, 0]). */
  em?: Ref
  /** O comprimento dos lados do ângulo isolado (padrão 1). */
  comprimento?: number
  /** O arco (padrão true). */
  arco?: boolean
  /** Escreve o valor: true mostra os graus ("60°"); um texto escreve o texto ('?'). */
  valor?: boolean | string
  destaque?: Cor
  /** Uma palavra embaixo do ângulo ("agudo"). */
  nome?: string
  /** false: não desenha os lados (quando eles já são segmentos da figura). */
  lados?: boolean
}

export interface Circulo {
  centro?: Ref
  raio: number
  raioVisivel?: boolean
  diametroVisivel?: boolean
  raioTexto?: string
  diametroTexto?: string
  preenchido?: Cor
  destaque?: Cor
}

export interface Recorte {
  /** O pedaço que sai, e o que fica. */
  pedaco: Ref[]
  resto: Ref[]
  /** Para onde o pedaço anda: [dx, dy]. */
  mover: Vec
}

export interface FiguraState {
  pontos?: Record<string, Vec>
  /** Os nomes dos pontos: false esconde; um mapa troca o texto ({ O: 'centro' }). */
  rotulos?: boolean | Record<string, string>
  /** Onde vai o nome de um ponto, quando o automático não fica bom: { A: 'abaixo' }. */
  posRotulos?: Record<string, 'acima' | 'abaixo' | 'esquerda' | 'direita'>
  segmentos?: Traco[]
  retas?: Traco[]
  semirretas?: Traco[]
  poligono?: Poligono | Ref[]
  poligonos?: (Poligono | Ref[])[]
  angulo?: Angulo | Angulo[]
  transferidor?: boolean | { raio?: number; invertido?: boolean }
  /** Com o transferidor: o número certo aceso e o valor no arco. */
  medido?: boolean
  circulo?: Circulo
  quadradosNosLados?: boolean | { quadriculado?: boolean; areas?: boolean | (string | number | null)[] }
  grade?: boolean
  /** A unidade das medidas calculadas e da soma ('cm'). */
  unidade?: string
  rotulo?: string
  /** Lados acesos do (primeiro) polígono, e a soma deles embaixo. */
  acesos?: number[] | boolean
  soma?: boolean
  /** Os cantos do triângulo recortados e juntos sobre uma reta (true: todos; lista: esses, nesta ordem). */
  juntados?: boolean | number[]
  recorte?: Recorte
  recortado?: boolean
  desenrolado?: boolean
  encaixado?: boolean
  // Mexa
  juntar?: boolean
  contorno?: boolean
  recortar?: boolean
  desenrolar?: boolean
  encaixar?: boolean
}

const EPS = 1e-6
const rad = (g: number) => (g * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

export const PI_TEXTO = '3,14'

/** 3.14 → "3,14"; −2 → "−2"; at most 2 decimals. */
export function fmtNum(v: number, casas = 2): string {
  const r = Math.round(v * 10 ** casas) / 10 ** casas
  return String(Object.is(r, -0) ? 0 : r)
    .replace('.', ',')
    .replace('-', '−')
}

export function resolve(r: Ref | undefined, pontos: Record<string, Vec> | undefined): Vec | undefined {
  if (typeof r === 'string') {
    const p = pontos?.[r]
    return Array.isArray(p) && p.length >= 2 ? [Number(p[0]), Number(p[1])] : undefined
  }
  if (Array.isArray(r) && r.length >= 2 && r.every((v) => typeof v === 'number' && Number.isFinite(v))) return [r[0], r[1]]
  return undefined
}

export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
export const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k]
export const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1])
/** Direction from a to b, in degrees (0 = right, 90 = up). */
export const direcao = (a: Vec, b: Vec) => deg(Math.atan2(b[1] - a[1], b[0] - a[0]))
export const polar = (c: Vec, r: number, g: number): Vec => [c[0] + r * Math.cos(rad(g)), c[1] + r * Math.sin(rad(g))]
/** Angle to (−180, 180]. */
export const norm180 = (g: number) => {
  let x = ((g % 360) + 360) % 360
  if (x > 180) x -= 360
  return x
}

export function centroide(pts: Vec[]): Vec {
  if (!pts.length) return [0, 0]
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
}

/** Positive when the vertices go counterclockwise. */
export function areaAssinada(pts: Vec[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const q = pts[(i + 1) % pts.length]
    a += p[0] * q[1] - q[0] * p[1]
  }
  return a / 2
}

/** The interior corner at vertex i: it sweeps counterclockwise from `de` to `ate` (degrees, ate > de). */
export function cantoDe(pts: Vec[], i: number): { de: number; ate: number; graus: number } {
  const n = pts.length
  const v = pts[i]
  const prox = direcao(v, pts[(i + 1) % n])
  const ant = direcao(v, pts[(i - 1 + n) % n])
  const ccw = areaAssinada(pts) >= 0
  const de = ccw ? prox : ant
  let ate = ccw ? ant : prox
  while (ate <= de) ate += 360
  return { de, ate, graus: ate - de }
}

export function anguloInterno(pts: Vec[], i: number): number {
  return cantoDe(pts, i).graus
}

// ---------------------------------------------------------------- normalized content

export interface PoligonoN {
  verts: Vec[]
  nomes: (string | undefined)[]
  o: Poligono
}

export function poligonoN(p: Poligono | Ref[] | undefined, pontos: Record<string, Vec> | undefined): PoligonoN | undefined {
  if (!p) return undefined
  const o: Poligono = Array.isArray(p) ? { vertices: p } : p
  const refs = Array.isArray(o.vertices) ? o.vertices : []
  const verts = refs.map((r) => resolve(r, pontos))
  if (verts.length < 2 || verts.some((v) => !v)) return undefined
  return { verts: verts as Vec[], nomes: refs.map((r) => (typeof r === 'string' ? r : undefined)), o }
}

export function poligonosDe(s: FiguraState): PoligonoN[] {
  return [s.poligono, ...(Array.isArray(s.poligonos) ? s.poligonos : [])].map((p) => poligonoN(p, s.pontos)).filter((p): p is PoligonoN => Boolean(p))
}

export interface TracoN {
  a: Vec
  b: Vec
  medida?: string
  destaque?: Cor
  tracejado?: boolean
}

export function tracosDe(lista: Traco[] | undefined, pontos: Record<string, Vec> | undefined): TracoN[] {
  if (!Array.isArray(lista)) return []
  const out: TracoN[] = []
  for (const t of lista) {
    const o = Array.isArray(t) ? { de: t[0], ate: t[1], medida: t[2] as string | undefined } : t
    const a = resolve(o?.de, pontos)
    const b = resolve(o?.ate, pontos)
    if (!a || !b) continue
    const extra = Array.isArray(t) ? {} : { destaque: t.destaque, tracejado: t.tracejado }
    out.push({ a, b, medida: o.medida, ...extra })
  }
  return out
}

export interface AnguloN {
  v: Vec
  /** Direction of the first side (degrees), the opening and its turn (1 = counterclockwise). */
  de: number
  graus: number
  sentido: 1 | -1
  comp: [number, number]
  o: Angulo
}

export function angulosDe(s: FiguraState): AnguloN[] {
  const lista = s.angulo ? (Array.isArray(s.angulo) ? s.angulo : [s.angulo]) : []
  const out: AnguloN[] = []
  for (const o of lista) {
    if (!o) continue
    if (o.vertice !== undefined) {
      const v = resolve(o.vertice, s.pontos)
      const a = resolve(o.de, s.pontos)
      const c = resolve(o.ate, s.pontos)
      if (!v || !a || !c) continue
      const da = direcao(v, a)
      const delta = norm180(direcao(v, c) - da)
      out.push({ v, de: da, graus: Math.abs(delta), sentido: delta < 0 ? -1 : 1, comp: [dist(v, a), dist(v, c)], o })
    } else if (typeof o.graus === 'number') {
      const v = resolve(o.em, s.pontos) ?? [0, 0]
      const L = typeof o.comprimento === 'number' && o.comprimento > 0 ? o.comprimento : 1
      out.push({ v, de: o.inicio ?? 0, graus: Math.abs(o.graus), sentido: o.graus < 0 ? -1 : 1, comp: [L, L], o })
    }
  }
  return out
}

/** The angle the student measures with the protractor (the first one), in whole degrees. */
export function grausMedir(s: FiguraState): number | undefined {
  const a = angulosDe(s)[0]
  return a ? Math.round(a.graus) : undefined
}

export function transferidorDe(s: FiguraState): { raio?: number; invertido: boolean } | undefined {
  if (!s.transferidor) return undefined
  const t = typeof s.transferidor === 'object' ? s.transferidor : {}
  return { raio: typeof t.raio === 'number' ? t.raio : undefined, invertido: t.invertido === true }
}

/**
 * The number read on the protractor at a direction (0 to 180, from the angle's
 * first side). The inner scale starts at 0 on that side; the outer one starts
 * at 0 on the other end (with `invertido`, the other way round).
 */
export function leituraTransferidor(direcao: number, escala: 'dentro' | 'fora', invertido = false): number {
  return (escala === 'dentro') !== invertido ? direcao : 180 - direcao
}

/** The scale that starts at 0 on the angle's first side. */
export const escalaCerta = (invertido = false): 'dentro' | 'fora' => (invertido ? 'fora' : 'dentro')

// ---------------------------------------------------------------- sides and perimeter

/** "5 cm" → 5, "2,5 m" → 2.5, 7 → 7. */
export function valorDeMedida(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v !== 'string') return undefined
  const m = v.replace(/\./g, '').replace(',', '.').replace('−', '-').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : undefined
}

/** The number on each side of a polygon (side i goes from vertex i to vertex i + 1). */
export function ladosValores(p: PoligonoN): (number | undefined)[] {
  const n = p.verts.length
  return p.verts.map((v, i) => {
    if (Array.isArray(p.o.lados)) return valorDeMedida(p.o.lados[i])
    return Math.round(dist(v, p.verts[(i + 1) % n]) * 100) / 100
  })
}

/** What is written on each side (undefined: nothing). */
export function ladosTextos(p: PoligonoN, unidade?: string): (string | undefined)[] {
  const n = p.verts.length
  const u = unidade ? ` ${unidade}` : ''
  if (Array.isArray(p.o.lados)) return p.verts.map((_, i) => {
    const t = (p.o.lados as (string | number | null)[])[i]
    return typeof t === 'number' ? fmtNum(t) + u : (t ?? undefined)
  })
  if (p.o.lados === true) return p.verts.map((v, i) => fmtNum(dist(v, p.verts[(i + 1) % n]), 1) + u)
  return p.verts.map(() => undefined)
}

export function angulosTextos(p: PoligonoN): (string | undefined)[] {
  if (Array.isArray(p.o.angulos)) return p.verts.map((_, i) => {
    const t = (p.o.angulos as (string | number | null)[])[i]
    return typeof t === 'number' ? `${fmtNum(t)}°` : (t ?? undefined)
  })
  if (p.o.angulos === true) return p.verts.map((_, i) => `${Math.round(anguloInterno(p.verts, i))}°`)
  return p.verts.map(() => undefined)
}

export function perimetroDe(p: PoligonoN): number | undefined {
  const v = ladosValores(p)
  return v.every((x) => x !== undefined) ? Math.round((v as number[]).reduce((s, x) => s + x, 0) * 1000) / 1000 : undefined
}

/** "5 + 4 + 5" while sides are missing; "5 + 4 + 5 + 4 = 18 cm" when all are lit. */
export function somaTexto(valores: (number | undefined)[], acesos: number[], unidade?: string): string {
  const lista = acesos.map((i) => valores[i]).filter((v): v is number => v !== undefined)
  if (!lista.length) return ''
  const t = lista.map((v) => fmtNum(v)).join(' + ')
  if (acesos.length < valores.length) return t
  const total = lista.reduce((s, v) => s + v, 0)
  return `${t} = ${fmtNum(total)}${unidade ? ` ${unidade}` : ''}`
}

// ---------------------------------------------------------------- area: cut and move

function noSegmento(p: Vec, a: Vec, b: Vec): boolean {
  const L = dist(a, b)
  if (L < EPS) return dist(p, a) < EPS
  const cross = Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / L
  const t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L)
  return cross < 1e-6 && t >= -EPS && t <= 1 + EPS
}

export function dentro(p: Vec, pts: Vec[]): boolean {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** The edges of the piece that cross the figure (the cut): their midpoint is inside, not on the border. */
export function linhasDeCorte(pedaco: Vec[], figura: Vec[]): [Vec, Vec][] {
  const out: [Vec, Vec][] = []
  for (let i = 0; i < pedaco.length; i++) {
    const a = pedaco[i]
    const b = pedaco[(i + 1) % pedaco.length]
    const m = mul(add(a, b), 0.5)
    const naBorda = figura.some((p, j) => noSegmento(m, p, figura[(j + 1) % figura.length]))
    if (!naBorda && dentro(m, figura)) out.push([a, b])
  }
  return out
}

/**
 * A parallelogram with a horizontal base becomes a rectangle: the triangle on
 * one side is cut at the height and moved to the other side.
 */
export function recortePadrao(pts: Vec[]): { pedaco: Vec[]; resto: Vec[]; mover: Vec } | undefined {
  if (pts.length !== 4) return undefined
  const ys = [...pts].sort((a, b) => a[1] - b[1])
  const [b1, b2, t1, t2] = ys
  if (Math.abs(b1[1] - b2[1]) > EPS || Math.abs(t1[1] - t2[1]) > EPS || Math.abs(t1[1] - b1[1]) < EPS) return undefined
  const [A, B] = b1[0] <= b2[0] ? [b1, b2] : [b2, b1]
  const [D, C] = t1[0] <= t2[0] ? [t1, t2] : [t2, t1]
  const w = B[0] - A[0]
  if (Math.abs(C[0] - D[0] - w) > EPS || w < EPS) return undefined
  const s = D[0] - A[0]
  if (Math.abs(s) < EPS || Math.abs(s) >= w) return undefined
  if (s > 0) {
    const F: Vec = [D[0], A[1]]
    return { pedaco: [A, F, D], resto: [F, B, C, D], mover: [w, 0] }
  }
  const F: Vec = [C[0], B[1]]
  return { pedaco: [F, B, C], resto: [A, F, C, D], mover: [-w, 0] }
}

export function recorteDe(s: FiguraState): { pedaco: Vec[]; resto: Vec[]; mover: Vec } | undefined {
  const r = s.recorte
  if (r && Array.isArray(r.pedaco) && Array.isArray(r.resto) && Array.isArray(r.mover)) {
    const pedaco = r.pedaco.map((p) => resolve(p, s.pontos))
    const resto = r.resto.map((p) => resolve(p, s.pontos))
    if (pedaco.every(Boolean) && resto.every(Boolean)) return { pedaco: pedaco as Vec[], resto: resto as Vec[], mover: [Number(r.mover[0]) || 0, Number(r.mover[1]) || 0] }
    return undefined
  }
  const p = poligonosDe(s)[0]
  return p ? recortePadrao(p.verts) : undefined
}

// ---------------------------------------------------------------- Pythagoras

/** The square on side P→Q, on the side away from `centro`: [P, Q, Q + n, P + n]. */
export function quadradoNoLado(P: Vec, Q: Vec, centro: Vec): Vec[] {
  const u = sub(Q, P)
  let n: Vec = [-u[1], u[0]]
  const m = mul(add(P, Q), 0.5)
  if (n[0] * (m[0] - centro[0]) + n[1] * (m[1] - centro[1]) < 0) n = [u[1], -u[0]]
  return [P, Q, add(Q, n), add(P, n)]
}

/** A right triangle: the vertex of the right angle, the two legs and the hypotenuse (as side indices). */
export function pitagorasDe(pts: Vec[]): { reto: number; catetos: [number, number]; hipotenusa: number; lados: number[] } | undefined {
  if (pts.length !== 3) return undefined
  const reto = [0, 1, 2].find((i) => Math.abs(anguloInterno(pts, i) - 90) < 0.5)
  if (reto === undefined) return undefined
  const lados = [0, 1, 2].map((i) => dist(pts[i], pts[(i + 1) % 3]))
  // Side i joins vertex i and i + 1: the legs touch the right-angle vertex.
  const catetos = [reto, (reto + 2) % 3].sort((a, b) => lados[a] - lados[b]) as [number, number]
  return { reto, catetos, hipotenusa: (reto + 1) % 3, lados }
}

export interface Celula {
  c: Vec
  /** Direction of the square's base (degrees). */
  ang: number
}

/** The unit cells of a square [P, Q, Q + n, P + n], row by row from P. */
export function celulasDoQuadrado(q: Vec[]): Celula[] {
  const [P, Q, , N] = q
  const L = Math.round(dist(P, Q))
  if (L < 1 || Math.abs(dist(P, Q) - L) > 1e-6) return []
  const u = mul(sub(Q, P), 1 / L)
  const n = mul(sub(N, P), 1 / L)
  const ang = direcao(P, Q)
  const out: Celula[] = []
  for (let j = 0; j < L; j++) for (let i = 0; i < L; i++) out.push({ c: add(P, add(mul(u, i + 0.5), mul(n, j + 0.5))), ang })
  return out
}

/**
 * Where the cells of the two small squares go in the big one: the a × a cells
 * fill a corner block, and the b × b cells fill the L that is left. Needs whole
 * sides with a² + b² = c² (3-4-5, 6-8-10, 5-12-13).
 */
export function encaixeDe(pts: Vec[]): { origem: [Celula[], Celula[]]; alvo: [Celula[], Celula[]]; hipotenusa: Celula[] } | undefined {
  const pg = pitagorasDe(pts)
  if (!pg) return undefined
  const centro = centroide(pts)
  const quad = (i: number) => quadradoNoLado(pts[i], pts[(i + 1) % 3], centro)
  const [ia, ib] = pg.catetos
  const ca = celulasDoQuadrado(quad(ia))
  const cb = celulasDoQuadrado(quad(ib))
  const ch = celulasDoQuadrado(quad(pg.hipotenusa))
  const a = Math.round(Math.sqrt(ca.length))
  const c = Math.round(Math.sqrt(ch.length))
  if (!ca.length || !cb.length || ca.length + cb.length !== ch.length) return undefined
  const bloco: Celula[] = []
  const resto: Celula[] = []
  ch.forEach((cel, k) => ((k % c) < a && Math.floor(k / c) < a ? bloco : resto).push(cel))
  return { origem: [ca, cb], alvo: [bloco, resto], hipotenusa: ch }
}

// ---------------------------------------------------------------- the triangle's corners

/** Where each corner goes on the line, in the order they were joined: the first on the left. */
export function cantosNaReta(graus: number[], ordem: number[]): Map<number, { de: number; ate: number }> {
  const out = new Map<number, { de: number; ate: number }>()
  let usado = 0
  for (const i of ordem) {
    const g = graus[i] ?? 0
    out.set(i, { de: 180 - usado - g, ate: 180 - usado })
    usado += g
  }
  return out
}

/** The circumference measured in diameters. */
export const voltasDoDiametro = Math.PI
