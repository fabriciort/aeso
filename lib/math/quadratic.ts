// Quadratic functions and the projectile that draws them. Pure and
// testable: the Palco of "O arremesso perfeito" (funcao-quadratica) only
// calls these.
//
// Physics: constant gravity, no air resistance ("sem ar"). Under those
// assumptions a launched ball follows y(x) = a·x² + b·x + c exactly, with
//   a = −g / (2·v²·cos²θ),  b = tan θ,  c = h₀.

export interface Quad {
  a: number
  b: number
  c: number
}

// ------------------------------------------------------------ real numbers

/** Standard gravity, rounded as in school physics (9,80665 m/s²). */
export const G_EARTH = 9.8
/** Surface gravity of the Moon, 1,62 m/s² (NASA Moon Fact Sheet). */
export const G_MOON = 1.62

/** FIBA Official Basketball Rules: top of the ring 3,05 m above the floor. */
export const RIM_HEIGHT = 3.05
/** FIBA: far edge of the free-throw line is 5,80 m from the inner edge of the end line. */
export const FT_LINE_FROM_END = 5.8
/** FIBA: centre of the ring is 1,575 m from the inner edge of the end line. */
export const RIM_FROM_END = 1.575
/** Horizontal distance from the free-throw line to the centre of the ring: 4,225 m. */
export const FREE_THROW_DX = FT_LINE_FROM_END - RIM_FROM_END
/** FIBA: front face of the backboard 1,20 m from the end line → 0,375 m behind the ring centre. */
export const BOARD_DX = FREE_THROW_DX + (RIM_FROM_END - 1.2)
/** FIBA: backboard 1,05 m tall, lower edge 2,90 m above the floor. */
export const BOARD_BOTTOM = 2.9
export const BOARD_TOP = 2.9 + 1.05
/** FIBA: inner diameter of the ring 0,45 m. */
export const RIM_RADIUS = 0.225
/** Size 7 ball: circumference ≈ 0,75 m → radius ≈ 0,12 m. */
export const BALL_RADIUS = 0.12
/** Example release height of a free throw (an adult's raised hands), labelled as an example. */
export const RELEASE_HEIGHT = 2.1

// ------------------------------------------------------------ the parabola

export const evaluate = (q: Quad, x: number) => (q.a * x + q.b) * x + q.c

export const discriminant = (q: Quad) => q.b * q.b - 4 * q.a * q.c

/** Vertex (xv, yv) = (−b/2a, c − b²/4a). */
export function vertex(q: Quad): { x: number; y: number } {
  const x = -q.b / (2 * q.a)
  return { x, y: evaluate(q, x) }
}

/**
 * Real roots in ascending order: two, one (Δ = 0, within a relative
 * tolerance) or none. With a = 0 the "parabola" is a line: one root (or none).
 */
export function roots(q: Quad, eps = 1e-9): number[] {
  if (Math.abs(q.a) < 1e-12) return Math.abs(q.b) < 1e-12 ? [] : [-q.c / q.b]
  const d = discriminant(q)
  const scale = Math.max(q.b * q.b, Math.abs(4 * q.a * q.c), 1e-12)
  if (Math.abs(d) <= eps * scale) return [-q.b / (2 * q.a)]
  if (d < 0) return []
  const s = Math.sqrt(d)
  // Numerically stable form (no cancellation when b² ≫ 4ac).
  const k = -0.5 * (q.b + Math.sign(q.b || 1) * s)
  const r1 = k / q.a
  const r2 = k !== 0 ? q.c / k : -r1
  return r1 < r2 ? [r1, r2] : [r2, r1]
}

/** How many times the parabola touches y = 0: 2, 1 or 0 (sign of Δ). */
export function rootCount(q: Quad, eps = 1e-9): 0 | 1 | 2 {
  return roots(q, eps).length as 0 | 1 | 2
}

/** Distance from the axis of symmetry to each root: √Δ / (2|a|). */
export function halfWidth(q: Quad): number {
  const d = discriminant(q)
  return d < 0 ? NaN : Math.sqrt(d) / (2 * Math.abs(q.a))
}

/** Vertex (canonical) form y = a(x − h)² + k. */
export function canonical(q: Quad): { a: number; h: number; k: number } {
  const v = vertex(q)
  return { a: q.a, h: v.x, k: v.y }
}

/** Expands a(x − h)² + k back into ax² + bx + c. */
export function fromVertex(a: number, h: number, k: number): Quad {
  return { a, b: -2 * a * h, c: a * h * h + k }
}

/** Linear blend of two quadratics: the same as blending their y at every x. */
export function lerpQuad(p: Quad, q: Quad, t: number): Quad {
  return { a: p.a + (q.a - p.a) * t, b: p.b + (q.b - p.b) * t, c: p.c + (q.c - p.c) * t }
}

/**
 * Where the vertex goes when only b changes (a and c fixed): the curve
 * y = c − a·x², a parabola opening the other way through (0, c).
 */
export const vertexLocusB = (q: Quad, x: number) => q.c - q.a * x * x

// ------------------------------------------------------------ the throw

export interface Launch {
  /** Launch speed, m/s. */
  v: number
  /** Launch angle above the horizontal, radians. */
  theta: number
  /** Release height, m. */
  h0: number
  /** Gravity, m/s². */
  g: number
}

export const deg = (rad: number) => (rad * 180) / Math.PI
export const rad = (degrees: number) => (degrees * Math.PI) / 180

/** The path y(x) of a launch as a quadratic in x (x measured from the hand). */
export function trajectory(l: Launch): Quad {
  const cos = Math.cos(l.theta)
  return { a: -l.g / (2 * l.v * l.v * cos * cos), b: Math.tan(l.theta), c: l.h0 }
}

/** Height as a function of time: h(t) = −g/2·t² + v·sinθ·t + h₀. */
export function heightOfTime(l: Launch): Quad {
  return { a: -l.g / 2, b: l.v * Math.sin(l.theta), c: l.h0 }
}

export function position(l: Launch, t: number): { x: number; y: number } {
  return { x: l.v * Math.cos(l.theta) * t, y: l.h0 + l.v * Math.sin(l.theta) * t - 0.5 * l.g * t * t }
}

/** Velocity components: vx never changes; vy falls by g every second. */
export function velocity(l: Launch, t: number): { vx: number; vy: number; speed: number } {
  const vx = l.v * Math.cos(l.theta)
  const vy = l.v * Math.sin(l.theta) - l.g * t
  return { vx, vy, speed: Math.hypot(vx, vy) }
}

export const apexTime = (l: Launch) => (l.v * Math.sin(l.theta)) / l.g

export function apex(l: Launch): { t: number; x: number; y: number } {
  const t = apexTime(l)
  return { t, ...position(l, t) }
}

/** Last time the ball is at height y (on the way down), or NaN if it never gets there. */
export function timeDownAt(l: Launch, y: number): number {
  const r = roots({ a: -l.g / 2, b: l.v * Math.sin(l.theta), c: l.h0 - y })
  return r.length ? r[r.length - 1] : NaN
}

/** Where and when the ball reaches the floor (y = 0). */
export function landing(l: Launch): { t: number; x: number } {
  const t = timeDownAt(l, 0)
  return { t, x: l.v * Math.cos(l.theta) * t }
}

/** Range on flat ground from the floor: R = v²·sin(2θ)/g. */
export const rangeFlat = (v: number, theta: number, g: number) => (v * v * Math.sin(2 * theta)) / g

/**
 * Launch speed that makes a ball thrown at angle θ pass through the point
 * (dx, dy) relative to the hand. NaN when the angle is too flat to get there.
 */
export function speedThrough(theta: number, dx: number, dy: number, g: number): number {
  const cos = Math.cos(theta)
  const den = 2 * cos * cos * (dx * Math.tan(theta) - dy)
  return den > 0 ? Math.sqrt((g * dx * dx) / den) : NaN
}

/** The angle that needs the least speed to reach (dx, dy): 45° + ½·atan(dy/dx). */
export const minSpeedAngle = (dx: number, dy: number) => Math.PI / 4 + Math.atan2(dy, dx) / 2

/** The ball every dt seconds (the "fantasmas"), up to tEnd. */
export function ghosts(l: Launch, dt: number, tEnd: number): { t: number; x: number; y: number }[] {
  const out: { t: number; x: number; y: number }[] = []
  for (let i = 0; i * dt <= tEnd + 1e-9; i++) out.push({ t: i * dt, ...position(l, i * dt) })
  return out
}

// ------------------------------------------------------------ the free throw

export type ShotKind = 'cesta' | 'aro' | 'tabela' | 'curto' | 'longo'

export interface ShotOutcome {
  kind: ShotKind
  /** When the ball meets the ring, the board or the floor, s. */
  t: number
  x: number
  y: number
  /** Signed horizontal miss at ring height (ball centre − ring centre), m; NaN if it never came down through that height. */
  miss: number
}

/**
 * What happens to a free throw (hand at x = 0, ring centre at
 * x = FREE_THROW_DX, height RIM_HEIGHT). The ball scores when its centre
 * comes down through the ring height within `tolerance` of the centre. The
 * real margin is RIM_RADIUS − BALL_RADIUS ≈ 0,1 m; the lab is a bit more
 * forgiving (default 0,16 m) because it is played with a finger.
 */
export function shotOutcome(l: Launch, tolerance = 0.16): ShotOutcome {
  const vx = l.v * Math.cos(l.theta)
  const tDown = timeDownAt(l, RIM_HEIGHT)
  const xDown = vx * tDown
  const miss = Number.isFinite(tDown) ? xDown - FREE_THROW_DX : NaN
  // Backboard: the ball's front reaches the board face while level with it.
  const tBoard = (BOARD_DX - BALL_RADIUS) / vx
  const yBoard = position(l, tBoard).y
  const boardFirst = yBoard >= BOARD_BOTTOM - BALL_RADIUS && yBoard <= BOARD_TOP && (!Number.isFinite(tDown) || tBoard < tDown)
  if (boardFirst) return { kind: 'tabela', t: tBoard, x: BOARD_DX - BALL_RADIUS, y: yBoard, miss }
  if (Number.isFinite(tDown) && tDown > apexTime(l)) {
    if (Math.abs(miss) <= tolerance) return { kind: 'cesta', t: tDown, x: xDown, y: RIM_HEIGHT, miss }
    if (Math.abs(miss) <= RIM_RADIUS + BALL_RADIUS + 0.02) return { kind: 'aro', t: tDown, x: xDown, y: RIM_HEIGHT, miss }
  }
  // A miss is "short" or "long" by where it came down through the ring
  // height (a ball that never got that high is short).
  const land = landing(l)
  return { kind: Number.isFinite(miss) && miss > 0 ? 'longo' : 'curto', t: land.t, x: land.x, y: 0, miss }
}

/** The launch speed that sinks a free throw at angle θ from height h0 (Earth). */
export const perfectSpeed = (theta: number, h0 = RELEASE_HEIGHT, g = G_EARTH) => speedThrough(theta, FREE_THROW_DX, RIM_HEIGHT - h0, g)
