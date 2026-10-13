// O sólido da U17 (sólidos e volume), sem React (para o visual, o Mexa e os
// testes): a caixa, o cubo, o prisma de base triangular e o cilindro, que se
// abrem na planificação; a pirâmide e o cone, só para nomear. Também as áreas
// das faces, a soma das faces pintadas e a contagem das camadas de cubinhos.
//
// O mundo: x para a direita, y para o fundo, z para cima, em unidades. Cada
// sólido que abre é guardado como a sua planificação: as faces no plano y = 0
// (a face da frente fica parada), cada uma presa à face-mãe por uma dobradiça.
// Dobrar é girar cada face em torno da dobradiça, para o fundo (y > 0): com a
// dobra 1, o sólido está fechado; com 0, está aberto no plano.

import { fmtNum } from './figura-geo'

export type V2 = [number, number]
export type V3 = [number, number, number]
export type TipoSolido = 'caixa' | 'cubo' | 'prisma' | 'cilindro' | 'piramide' | 'cone'
/** Cor de destaque: true ou 'ambar' (âmbar), 'azul', 'verde', 'erro' (rosa). */
export type CorFace = boolean | 'ambar' | 'azul' | 'verde' | 'erro'
export type NomeMedida = 'comprimento' | 'largura' | 'altura' | 'raio' | 'volta'

export interface SolidoState {
  solido?: TipoSolido
  comprimento?: number
  largura?: number
  altura?: number
  /** O cubo: a medida de cada aresta. */
  aresta?: number
  raio?: number
  /** O prisma: onde fica o canto de trás do triângulo, de 0 (em cima do canto esquerdo: triângulo retângulo) a 1; padrão 0,5. */
  apice?: number
  unidade?: string
  /** As medidas nas arestas: true (padrão) escreve todas; false esconde; um mapa troca o texto ou, com null, esconde uma. */
  medidas?: boolean | Partial<Record<NomeMedida, string | number | null | false>>
  /** Faces acesas: um nome ('base'), uma lista, 'bases', 'laterais' ou um mapa { base: 'azul' }. */
  destaque?: string | string[] | Record<string, CorFace>
  /** Uma palavra dentro da face: { base: 'base', lateral: 'face lateral' }. */
  nomes?: Record<string, string>
  /** A área dentro de cada face: true calcula; um mapa escreve o que vier. */
  areas?: boolean | Record<string, string | number>
  /** A planificação: true (ou um número de 0 a 1, meio aberto). */
  aberto?: boolean | number
  /** As arestas escondidas, tracejadas. */
  ocultas?: boolean
  /** Cubinhos: quantas camadas cheias (a caixa vira cubinhos de 1 unidade). */
  camadas?: number
  /** Cubinhos: só a camada do fundo, contada (comprimento × largura). */
  baseCheia?: boolean
  /** A contagem embaixo ("2 camadas de 12 = 24"); false esconde. */
  contagem?: boolean
  /** Faces pintadas de âmbar (Mexa "pintar"). */
  pintadas?: string[]
  /** A soma das áreas das faces pintadas, embaixo. */
  soma?: boolean
  rotulo?: string
  // Mexa
  abrir?: boolean
  empilhar?: boolean
  pintar?: boolean
}

/** π nas contas que o aluno vê (como na unidade 16). */
export const PI_SOLIDO = 3.14
/** O cilindro é feito de tiras finas que se desenrolam (ímpar: uma no meio). */
export const TIRAS = 41
const LADOS_DISCO = 48

const TIPOS: TipoSolido[] = ['caixa', 'cubo', 'prisma', 'cilindro', 'piramide', 'cone']
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const pos = (v: unknown, padrao: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : padrao)
const r2 = (v: number) => Math.round(v * 100) / 100

export interface Dims {
  tipo: TipoSolido
  /** Caixa e prisma: comprimento (a aresta da frente), largura (o fundo) e altura. */
  c: number
  l: number
  h: number
  r: number
  /** Prisma: o canto de trás do triângulo, de 0 a 1. */
  ap: number
}

export function tipoDe(s: SolidoState): TipoSolido {
  return s.solido && TIPOS.includes(s.solido) ? s.solido : 'caixa'
}

export function dimsDe(s: SolidoState): Dims {
  const tipo = tipoDe(s)
  const base = { tipo, c: 1, l: 1, h: 1, r: 1, ap: 0.5 }
  switch (tipo) {
    case 'cubo': {
      const a = pos(s.aresta ?? s.comprimento, 3)
      return { ...base, c: a, l: a, h: a }
    }
    case 'caixa':
      return { ...base, c: pos(s.comprimento, 4), l: pos(s.largura, 3), h: pos(s.altura, 2) }
    case 'prisma':
      return { ...base, c: pos(s.comprimento, 6), l: pos(s.largura, 4), h: pos(s.altura, 5), ap: clamp(typeof s.apice === 'number' ? s.apice : 0.5, 0, 1) }
    case 'piramide':
      return { ...base, c: pos(s.comprimento, 4), l: pos(s.largura ?? s.comprimento, 4), h: pos(s.altura, 4) }
    case 'cilindro':
    case 'cone':
      return { ...base, r: pos(s.raio, 2), h: pos(s.altura, 4) }
  }
}

/** Whether the solid opens into a net (the pyramid and the cone are only named). */
export const abre = (t: TipoSolido) => t !== 'piramide' && t !== 'cone'

/** The faces of each solid, in the order "Me mostre" paints them (the ones in view first). */
export function partesDe(t: TipoSolido): string[] {
  switch (t) {
    case 'caixa':
    case 'cubo':
      return ['frente', 'direita', 'topo', 'esquerda', 'tras', 'base']
    case 'prisma':
      return ['frente', 'direita', 'topo', 'esquerda', 'base']
    case 'cilindro':
      return ['topo', 'lateral', 'base']
    case 'piramide':
      return ['frente', 'direita', 'tras', 'esquerda', 'base']
    case 'cone':
      return ['lateral', 'base']
  }
}

/** 'bases', 'laterais', a name or a list → face → color. */
export function destaquesDe(s: SolidoState): Record<string, CorFace> {
  const partes = partesDe(tipoDe(s))
  const d = s.destaque
  const out: Record<string, CorFace> = {}
  const um = (n: string, cor: CorFace) => {
    if (n === 'bases') ['base', 'topo'].forEach((p) => partes.includes(p) && (out[p] = cor))
    else if (n === 'laterais') partes.filter((p) => p !== 'base' && p !== 'topo').forEach((p) => (out[p] = cor))
    else if (partes.includes(n)) out[n] = cor
  }
  if (typeof d === 'string') um(d, true)
  else if (Array.isArray(d)) d.forEach((n) => typeof n === 'string' && um(n, true))
  else if (d && typeof d === 'object') for (const [n, c] of Object.entries(d)) if (c) um(n, c)
  return out
}

// ---------------------------------------------------------------- the net

export interface FaceDef {
  id: string
  /** Which face of the solid (the cylinder's strips are all 'lateral'). */
  parte: string
  /** The corners in the net, (x, z), counterclockwise. */
  pts: V2[]
  /** The face it hangs from (−1: the one that stays put). */
  pai: number
  /** The hinge, on the edge shared with the parent. */
  eixo?: [V2, V2]
  /** How far it turns to close, in degrees. */
  angulo: number
  /** Edge i (from corner i to i + 1) is a smooth fold inside a curved surface: drawn only on the outline. Same key on both sides. */
  suaves?: (string | undefined)[]
}

const ret = (x0: number, z0: number, x1: number, z1: number): V2[] => [
  [x0, z0],
  [x1, z0],
  [x1, z1],
  [x0, z1],
]

function disco(cx: number, cz: number, r: number, n = LADOS_DISCO): V2[] {
  // Counterclockwise, from the bottom point.
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)] as V2
  })
}

const graus = (r: number) => (r * 180) / Math.PI

export function planificacao(d: Dims): FaceDef[] {
  const { c, l, h } = d
  switch (d.tipo) {
    case 'caixa':
    case 'cubo':
      return [
        { id: 'frente', parte: 'frente', pts: ret(0, 0, c, h), pai: -1, angulo: 0 },
        { id: 'topo', parte: 'topo', pts: ret(0, h, c, h + l), pai: 0, eixo: [[0, h], [c, h]], angulo: 90 },
        { id: 'base', parte: 'base', pts: ret(0, -l, c, 0), pai: 0, eixo: [[0, 0], [c, 0]], angulo: 90 },
        { id: 'esquerda', parte: 'esquerda', pts: ret(-l, 0, 0, h), pai: 0, eixo: [[0, 0], [0, h]], angulo: 90 },
        { id: 'direita', parte: 'direita', pts: ret(c, 0, c + l, h), pai: 0, eixo: [[c, 0], [c, h]], angulo: 90 },
        { id: 'tras', parte: 'tras', pts: ret(c + l, 0, 2 * c + l, h), pai: 4, eixo: [[c + l, 0], [c + l, h]], angulo: 90 },
      ]
    case 'prisma': {
      // The triangle: the front edge c, and the back corner at (ap·c, l) seen from above.
      const xa = d.ap * c
      const wL = Math.hypot(xa, l)
      const wR = Math.hypot(c - xa, l)
      return [
        { id: 'frente', parte: 'frente', pts: ret(0, 0, c, h), pai: -1, angulo: 0 },
        { id: 'direita', parte: 'direita', pts: ret(c, 0, c + wR, h), pai: 0, eixo: [[c, 0], [c, h]], angulo: 180 - graus(Math.atan2(l, c - xa)) },
        { id: 'esquerda', parte: 'esquerda', pts: ret(-wL, 0, 0, h), pai: 0, eixo: [[0, 0], [0, h]], angulo: 180 - graus(Math.atan2(l, xa)) },
        { id: 'topo', parte: 'topo', pts: [[0, h], [c, h], [xa, h + l]], pai: 0, eixo: [[0, h], [c, h]], angulo: 90 },
        { id: 'base', parte: 'base', pts: [[0, 0], [xa, -l], [c, 0]], pai: 0, eixo: [[0, 0], [c, 0]], angulo: 90 },
      ]
    }
    case 'cilindro': {
      // The side is a chain of thin strips: the one in the middle stays, the others curl back.
      const n = TIRAS
      const s = (2 * Math.PI * d.r) / n
      const m = (n - 1) / 2
      const out: FaceDef[] = [{ id: 'lateral:0', parte: 'lateral', pts: ret(-s / 2, 0, s / 2, h), pai: -1, angulo: 0, suaves: [undefined, 'b:1', undefined, 'b:-1'] }]
      let pai = 0
      for (let k = 1; k <= m; k++) {
        const x0 = s / 2 + (k - 1) * s
        out.push({ id: `lateral:${k}`, parte: 'lateral', pts: ret(x0, 0, x0 + s, h), pai, eixo: [[x0, 0], [x0, h]], angulo: 360 / n, suaves: [undefined, k < m ? `b:${k + 1}` : undefined, undefined, `b:${k}`] })
        pai = out.length - 1
      }
      pai = 0
      for (let k = 1; k <= m; k++) {
        const x1 = -s / 2 - (k - 1) * s
        out.push({ id: `lateral:-${k}`, parte: 'lateral', pts: ret(x1 - s, 0, x1, h), pai, eixo: [[x1, 0], [x1, h]], angulo: 360 / n, suaves: [undefined, `b:-${k}`, undefined, k < m ? `b:-${k + 1}` : undefined] })
        pai = out.length - 1
      }
      out.push({ id: 'topo', parte: 'topo', pts: disco(0, h + d.r, d.r), pai: 0, eixo: [[-s / 2, h], [s / 2, h]], angulo: 90 })
      out.push({ id: 'base', parte: 'base', pts: disco(0, -d.r, d.r), pai: 0, eixo: [[-s / 2, 0], [s / 2, 0]], angulo: 90 })
      return out
    }
    default:
      return []
  }
}

// ---------------------------------------------------------------- folding

/** An affine map p → R·p + t (R row by row). */
export interface Mat {
  R: number[]
  t: V3
}

const ID: Mat = { R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] }

export const giraV = (m: Mat, p: V3): V3 => [m.R[0] * p[0] + m.R[1] * p[1] + m.R[2] * p[2], m.R[3] * p[0] + m.R[4] * p[1] + m.R[5] * p[2], m.R[6] * p[0] + m.R[7] * p[1] + m.R[8] * p[2]]
export const aplica = (m: Mat, p: V3): V3 => {
  const q = giraV(m, p)
  return [q[0] + m.t[0], q[1] + m.t[1], q[2] + m.t[2]]
}

function compoe(a: Mat, b: Mat): Mat {
  const R: number[] = []
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R.push(a.R[i * 3] * b.R[j] + a.R[i * 3 + 1] * b.R[3 + j] + a.R[i * 3 + 2] * b.R[6 + j])
  return { R, t: aplica(a, b.t) }
}

/** Turning by `g` degrees about the line through P with unit direction u. */
function rotacao(P: V3, u: V3, g: number): Mat {
  const a = (g * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const [x, y, z] = u
  const k = 1 - c
  const R = [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k]
  const RP = giraV({ R, t: [0, 0, 0] }, P)
  return { R, t: [P[0] - RP[0], P[1] - RP[1], P[2] - RP[2]] }
}

export const noPlano = (p: V2): V3 => [p[0], 0, p[1]]

export interface Face3 {
  id: string
  parte: string
  pts: V3[]
  /** Outward normal. */
  n: V3
  suaves?: (string | undefined)[]
}

/**
 * The faces at a fold (1: closed; 0: the net, flat in y = 0) and the map of
 * each face from the net to the world. The hinge turns the face to the back
 * (y > 0): the axis is (−nz, 0, nx), n pointing from the hinge into the face.
 */
export function dobrar(defs: FaceDef[], dobra: number): { faces: Face3[]; mats: Mat[] } {
  const mats: Mat[] = []
  const faces: Face3[] = defs.map((f) => {
    let m = ID
    if (f.pai >= 0 && f.eixo) {
      const [a, b] = f.eixo
      const ux = b[0] - a[0]
      const uz = b[1] - a[1]
      const L = Math.hypot(ux, uz) || 1
      const cx = f.pts.reduce((s, p) => s + p[0], 0) / f.pts.length - (a[0] + b[0]) / 2
      const cz = f.pts.reduce((s, p) => s + p[1], 0) / f.pts.length - (a[1] + b[1]) / 2
      const along = (cx * ux + cz * uz) / L
      let nx = cx - (along * ux) / L
      let nz = cz - (along * uz) / L
      const nl = Math.hypot(nx, nz) || 1
      nx /= nl
      nz /= nl
      m = compoe(mats[f.pai] ?? ID, rotacao(noPlano(a), [-nz, 0, nx], f.angulo * dobra))
    }
    mats.push(m)
    return { id: f.id, parte: f.parte, pts: f.pts.map((p) => aplica(m, noPlano(p))), n: giraV(m, [0, -1, 0]), suaves: f.suaves }
  })
  return { faces, mats }
}

function normalDe(pts: V3[], dentro: V3): V3 {
  let n: V3 = [0, 0, 0]
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    n = [n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1])]
  }
  const L = Math.hypot(...n) || 1
  n = [n[0] / L, n[1] / L, n[2] / L]
  const c = pts.reduce<V3>((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length, s[2] + p[2] / pts.length], [0, 0, 0])
  if (n[0] * (c[0] - dentro[0]) + n[1] * (c[1] - dentro[1]) + n[2] * (c[2] - dentro[2]) < 0) n = [-n[0], -n[1], -n[2]]
  return n
}

/** The pyramid and the cone, closed (they do not open). */
export function solidoFechado(d: Dims): Face3[] {
  if (d.tipo === 'piramide') {
    const { c, l, h } = d
    const A: V3 = [c / 2, l / 2, h]
    const b: V3[] = [
      [0, 0, 0],
      [c, 0, 0],
      [c, l, 0],
      [0, l, 0],
    ]
    const centro: V3 = [c / 2, l / 2, h / 4]
    const nomes = ['frente', 'direita', 'tras', 'esquerda']
    const faces: Face3[] = nomes.map((nome, i) => {
      const pts = [b[i], b[(i + 1) % 4], A]
      return { id: nome, parte: nome, pts, n: normalDe(pts, centro) }
    })
    return [{ id: 'base', parte: 'base', pts: b, n: [0, 0, -1] }, ...faces]
  }
  if (d.tipo === 'cone') {
    const { r, h } = d
    const n = LADOS_DISCO
    const A: V3 = [0, r, h]
    const aro = Array.from({ length: n }, (_, i): V3 => [r * Math.sin((2 * Math.PI * i) / n), r - r * Math.cos((2 * Math.PI * i) / n), 0])
    const centro: V3 = [0, r, h / 4]
    const faces: Face3[] = aro.map((p, i) => {
      const pts = [p, aro[(i + 1) % n], A]
      return { id: `lateral:${i}`, parte: 'lateral', pts, n: normalDe(pts, centro), suaves: [undefined, `c:${(i + 1) % n}`, `c:${i}`] }
    })
    return [{ id: 'base', parte: 'base', pts: aro, n: [0, 0, -1] }, ...faces]
  }
  return []
}

/** The faces at a fold, for any solid (the pyramid and the cone are always closed). */
export function facesDe(d: Dims, dobra: number): { faces: Face3[]; mats: Mat[]; defs: FaceDef[] } {
  if (!abre(d.tipo)) return { faces: solidoFechado(d), mats: [], defs: [] }
  const defs = planificacao(d)
  return { ...dobrar(defs, dobra), defs }
}

// ---------------------------------------------------------------- the camera

export interface Camera {
  /** Turn around the vertical (degrees; positive shows the right side) and the height of the eye (positive shows the top). */
  th: number
  ph: number
}

/** Closed: seen from the front, a little to the right and from above. Open: straight from the front (the net is in y = 0). */
export function cameraDe(t: TipoSolido, aberto: number): Camera {
  const th0 = t === 'prisma' ? 48 : 30
  return { th: th0 * (1 - aberto), ph: 22 * (1 - aberto) }
}

/** [x on screen, y on screen (down), depth (bigger is farther)], in world units. Linear: works for directions too. */
export function projeta(p: V3, cam: Camera): V3 {
  const t = (cam.th * Math.PI) / 180
  const q = (cam.ph * Math.PI) / 180
  const x1 = p[0] * Math.cos(t) + p[1] * Math.sin(t)
  const y1 = -p[0] * Math.sin(t) + p[1] * Math.cos(t)
  const Z = p[2] * Math.cos(q) + y1 * Math.sin(q)
  const D = y1 * Math.cos(q) - p[2] * Math.sin(q)
  return [x1, -Z, D]
}

export const deFrente = (n: V3, cam: Camera) => projeta(n, cam)[2] < -1e-6

/** The faces the student sees on the closed solid. */
export function facesVisiveis(s: SolidoState): string[] {
  const d = dimsDe(s)
  const cam = cameraDe(d.tipo, 0)
  const vis = new Set(facesDe(d, 1).faces.filter((f) => deFrente(f.n, cam)).map((f) => f.parte))
  return partesDe(d.tipo).filter((p) => vis.has(p))
}

// ---------------------------------------------------------------- areas

/** The area of each face (π = 3,14), rounded to 2 decimals. */
export function areaDe(d: Dims, parte: string): number {
  const { c, l, h, r } = d
  switch (d.tipo) {
    case 'caixa':
    case 'cubo':
      return r2(parte === 'frente' || parte === 'tras' ? c * h : parte === 'esquerda' || parte === 'direita' ? l * h : c * l)
    case 'prisma': {
      const xa = d.ap * c
      if (parte === 'frente') return r2(c * h)
      if (parte === 'direita') return r2(Math.hypot(c - xa, l) * h)
      if (parte === 'esquerda') return r2(Math.hypot(xa, l) * h)
      return r2((c * l) / 2)
    }
    case 'cilindro':
      return r2(parte === 'lateral' ? 2 * PI_SOLIDO * r * h : PI_SOLIDO * r * r)
    case 'piramide': {
      if (parte === 'base') return r2(c * l)
      const lado = parte === 'frente' || parte === 'tras' ? c : l
      const outro = parte === 'frente' || parte === 'tras' ? l : c
      return r2((lado * Math.hypot(h, outro / 2)) / 2)
    }
    case 'cone':
      return r2(parte === 'base' ? PI_SOLIDO * r * r : PI_SOLIDO * r * Math.hypot(r, h))
  }
}

export function areaTotal(d: Dims): number {
  return r2(partesDe(d.tipo).reduce((s, p) => s + areaDe(d, p), 0))
}

const comUnidade = (v: number, u: string | undefined, pot = '') => `${fmtNum(v)}${u ? ` ${u}${pot}` : ''}`

/** The text inside each face (its area, or what the author wrote). */
export function areaTexto(s: SolidoState, d: Dims, parte: string): string | undefined {
  if (s.areas && typeof s.areas === 'object') {
    const t = s.areas[parte]
    return t === undefined || t === null ? undefined : typeof t === 'number' ? comUnidade(t, s.unidade, '²') : t
  }
  if (s.areas === true || (s.soma && s.pintadas?.includes(parte))) return comUnidade(areaDe(d, parte), s.unidade, '²')
  return undefined
}

/** "12 + 8 + 6" while faces are missing; with all of them, "… = 52 cm²". */
export function somaTexto(d: Dims, pintadas: string[], unidade?: string): string {
  const partes = partesDe(d.tipo)
  const lista = pintadas.filter((p, i) => partes.includes(p) && pintadas.indexOf(p) === i)
  if (!lista.length) return ''
  const t = lista.map((p) => fmtNum(areaDe(d, p))).join(' + ')
  if (lista.length < partes.length) return t
  return `${t} = ${comUnidade(r2(lista.reduce((s, p) => s + areaDe(d, p), 0)), unidade, '²')}`
}

// ---------------------------------------------------------------- volume in layers

/** Cubinhos: the box (or cylinder, or prism) filled layer by layer. */
export const modoCamadas = (s: SolidoState) => typeof s.camadas === 'number' || s.baseCheia === true || s.empilhar === true

/** How many full layers (baseCheia: 1), between 0 and the height. */
export function camadasDe(s: SolidoState, d: Dims): number {
  if (s.baseCheia && !(typeof s.camadas === 'number' && s.camadas > 1)) return 1
  const k = typeof s.camadas === 'number' && Number.isFinite(s.camadas) ? Math.round(s.camadas) : 0
  return clamp(k, 0, Math.ceil(d.h - 1e-9))
}

/** The area of one layer (the base). */
export function areaDaBase(d: Dims): number {
  if (d.tipo === 'cilindro' || d.tipo === 'cone') return r2(PI_SOLIDO * d.r * d.r)
  if (d.tipo === 'prisma') return r2((d.c * d.l) / 2)
  return r2(d.c * d.l)
}

/** "4 × 3 = 12 cubinhos" for the bottom layer; "2 camadas de 12 = 24" (with the unit, "= 24 cm³"). */
export function contagemTexto(s: SolidoState, d: Dims, k: number): string {
  const base = areaDaBase(d)
  if (s.baseCheia && k <= 1) {
    if (d.tipo === 'cilindro') return `${fmtNum(PI_SOLIDO)} × ${fmtNum(d.r)} × ${fmtNum(d.r)} = ${fmtNum(base)}`
    if (d.tipo === 'prisma') return `${fmtNum(d.c)} × ${fmtNum(d.l)} ÷ 2 = ${fmtNum(base)}`
    return `${fmtNum(d.c)} × ${fmtNum(d.l)} = ${fmtNum(base)} cubinhos`
  }
  if (k <= 0) return ''
  return `${k} ${k === 1 ? 'camada' : 'camadas'} de ${fmtNum(base)} = ${comUnidade(r2(k * base), s.unidade, '³')}`
}

/** The unit grid on each rectangular face of the net: the lines in net coordinates (layer lines are `forte`). */
export function gradeDe(defs: FaceDef[], soCamadas: boolean): { face: number; a: V2; b: V2; forte: boolean }[] {
  const out: { face: number; a: V2; b: V2; forte: boolean }[] = []
  defs.forEach((f, i) => {
    if (f.pts.length !== 4) return
    const xs = f.pts.map((p) => p[0])
    const zs = f.pts.map((p) => p[1])
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]
    // The top and the bottom lie flat: their lines are not layers.
    const deitada = f.parte === 'topo' || f.parte === 'base'
    if (soCamadas && deitada) return
    for (let z = z0 + 1; z < z1 - 1e-6; z++) out.push({ face: i, a: [x0, z], b: [x1, z], forte: !deitada })
    if (!soCamadas) for (let x = x0 + 1; x < x1 - 1e-6; x++) out.push({ face: i, a: [x, z0], b: [x, z1], forte: false })
  })
  return out
}

// ---------------------------------------------------------------- measures and lines

/** A point on a face of the net (2D, with `face`) or in the world (3D), and the side its label goes to. */
export interface Ancora {
  face?: string
  p: V2 | V3
  dir: V2 | V3
}

export interface RotuloSolido {
  k: string
  texto: string
  /** When it shows: on the closed solid, on the net, or always. */
  quando: 'fechado' | 'aberto' | 'sempre'
  a: Ancora
  /** A dimension line from `a` to `ate`, with the text in the middle. */
  ate?: Ancora
  cor?: 'ambar' | 'azul'
}

export interface LinhaSolido {
  k: string
  face?: string
  a: V2 | V3
  b: V2 | V3
  tracejado?: boolean
  cor: 'ambar' | 'azul'
  /** Only on the closed solid (the pyramid's height goes through the inside). */
  quando: 'fechado' | 'sempre'
}

export function medidaTexto(s: SolidoState, nome: NomeMedida, valor: number): string | undefined {
  if (s.medidas === false) return undefined
  const m = s.medidas && typeof s.medidas === 'object' ? s.medidas : {}
  if (nome in m) {
    const t = m[nome]
    if (t === null || t === false || t === undefined) return undefined
    return typeof t === 'number' ? comUnidade(t, s.unidade) : t
  }
  return comUnidade(r2(valor), s.unidade)
}

/** The measures on the edges and the lines they need (the radius, the triangle's height). */
export function medidasDe(s: SolidoState, d: Dims): { rotulos: RotuloSolido[]; linhas: LinhaSolido[] } {
  const rotulos: RotuloSolido[] = []
  const linhas: LinhaSolido[] = []
  const { c, l, h, r } = d
  const add = (k: NomeMedida, valor: number, quando: RotuloSolido['quando'], a: Ancora, extra: Partial<RotuloSolido> = {}) => {
    const texto = medidaTexto(s, k, valor)
    if (texto) rotulos.push({ k: `${k}:${quando}`, texto, quando, a, ...extra })
    return Boolean(texto)
  }
  switch (d.tipo) {
    case 'caixa':
    case 'cubo':
      add('comprimento', c, 'fechado', { face: 'frente', p: [c / 2, 0], dir: [0, -1] })
      add('comprimento', c, 'aberto', { face: 'topo', p: [c / 2, h + l], dir: [0, 1] })
      add('altura', h, 'fechado', { face: 'frente', p: [0, h / 2], dir: [-1, 0] })
      add('altura', h, 'aberto', { face: 'esquerda', p: [-l, h / 2], dir: [-1, 0] })
      add('largura', l, 'sempre', { face: 'direita', p: [c + l / 2, 0], dir: [0, -1] })
      break
    case 'prisma': {
      const xa = d.ap * c
      add('comprimento', c, 'fechado', { face: 'frente', p: [c / 2, 0], dir: [0, -1] })
      add('comprimento', c, 'aberto', { face: 'frente', p: [c / 2, 0], dir: [0, 1] })
      add('altura', h, 'fechado', { face: 'frente', p: [0, h / 2], dir: [-1, 0] })
      add('altura', h, 'aberto', { face: 'esquerda', p: [-Math.hypot(xa, l), h / 2], dir: [-1, 0] })
      // The triangle's height, dashed on the top face.
      if (add('largura', l, 'sempre', { face: 'topo', p: [xa, h + l / 2], dir: [xa > c / 2 ? -1 : 1, 0] }, { cor: 'azul' }))
        linhas.push({ k: 'alt-tri', face: 'topo', a: [xa, h], b: [xa, h + l], tracejado: true, cor: 'azul', quando: 'sempre' })
      break
    }
    case 'cilindro': {
      const meia = Math.PI * r
      if (add('raio', r, 'sempre', { face: 'topo', p: [r / 2, h + r], dir: [0, 1] }, { cor: 'ambar' })) linhas.push({ k: 'raio', face: 'topo', a: [0, h + r], b: [r, h + r], cor: 'ambar', quando: 'sempre' })
      const t = (cameraDe('cilindro', 0).th * Math.PI) / 180
      add('altura', h, 'fechado', { p: [-r * Math.cos(t), r - r * Math.sin(t), h / 2], dir: [-Math.cos(t), -Math.sin(t), 0] })
      add('altura', h, 'aberto', { face: `lateral:-${(TIRAS - 1) / 2}`, p: [-meia, h / 2], dir: [-1, 0] })
      add('volta', 2 * PI_SOLIDO * r, 'aberto', { face: `lateral:-${(TIRAS - 1) / 2}`, p: [-meia, Math.min(h * 0.16, 0.6)], dir: [0, 1] }, { ate: { face: `lateral:${(TIRAS - 1) / 2}`, p: [meia, Math.min(h * 0.16, 0.6)], dir: [0, 1] }, cor: 'azul' })
      break
    }
    case 'piramide':
      add('comprimento', c, 'sempre', { p: [c / 2, 0, 0], dir: [0, 0, -1] })
      add('largura', l, 'sempre', { p: [c, l / 2, 0], dir: [1, 0, -1] })
      if (add('altura', h, 'sempre', { p: [c / 2, l / 2, h / 2], dir: [-1, 0, 0] }, { cor: 'azul' })) linhas.push({ k: 'alt', a: [c / 2, l / 2, 0], b: [c / 2, l / 2, h], tracejado: true, cor: 'azul', quando: 'fechado' })
      break
    case 'cone':
      if (add('raio', r, 'sempre', { p: [r / 2, r, 0], dir: [0, -1, -1] }, { cor: 'ambar' })) linhas.push({ k: 'raio', a: [0, r, 0], b: [r, r, 0], tracejado: true, cor: 'ambar', quando: 'fechado' })
      if (add('altura', h, 'sempre', { p: [0, r, h / 2], dir: [-1, 0, 0] }, { cor: 'azul' })) linhas.push({ k: 'alt', a: [0, r, 0], b: [0, r, h], tracejado: true, cor: 'azul', quando: 'fechado' })
      break
  }
  return { rotulos, linhas }
}
