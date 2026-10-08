// Surfaces z = f(x, y) for the "Subindo a montanha" lab (Cálculo 3): sums of
// gaussian hills with analytic partial derivatives, the gradient, level curves
// (marching squares), a small 3D camera (orthographic with optional
// perspective) and gradient descent. Pure functions, no DOM.

export type Vec2 = [number, number]

/** Anything with a height and an exact gradient. */
export interface Field {
  f(x: number, y: number): number
  grad(x: number, y: number): Vec2
}

/** A gaussian hill: height h at (x, y), widths sx, sy along its own axes, turned by rot (radians). */
export interface Bump {
  x: number
  y: number
  h: number
  sx: number
  sy: number
  rot?: number
}

function bumpParts(b: Bump, x: number, y: number) {
  const c = Math.cos(b.rot ?? 0)
  const s = Math.sin(b.rot ?? 0)
  const dx = x - b.x
  const dy = y - b.y
  const a = c * dx + s * dy
  const q = -s * dx + c * dy
  const g = b.h * Math.exp(-(a * a) / (2 * b.sx * b.sx) - (q * q) / (2 * b.sy * b.sy))
  return { c, s, a, q, g }
}

export function bumpHeight(b: Bump, x: number, y: number): number {
  return bumpParts(b, x, y).g
}

/** Exact partial derivatives of one gaussian hill (chain rule through the rotation). */
export function bumpGrad(b: Bump, x: number, y: number): Vec2 {
  const { c, s, a, q, g } = bumpParts(b, x, y)
  const ga = (-a / (b.sx * b.sx)) * g
  const gq = (-q / (b.sy * b.sy)) * g
  return [ga * c - gq * s, ga * s + gq * c]
}

/** f(x, y) = base + Σ gaussian hills. */
export function hills(bumps: Bump[], base = 0): Field {
  return {
    f: (x, y) => {
      let z = base
      for (const b of bumps) z += bumpHeight(b, x, y)
      return z
    },
    grad: (x, y) => {
      let gx = 0
      let gy = 0
      for (const b of bumps) {
        const [a, c] = bumpGrad(b, x, y)
        gx += a
        gy += c
      }
      return [gx, gy]
    },
  }
}

/** f(x, y) = a·x² + b·y² (a bowl when a, b > 0). */
export function quadratic(a: number, b: number): Field {
  return { f: (x, y) => a * x * x + b * y * y, grad: (x, y) => [2 * a * x, 2 * b * y] }
}

/** Weighted sum of fields (used to morph one terrain into another). */
export function blend(fields: Field[], w: number[]): Field {
  return {
    f: (x, y) => fields.reduce((z, F, i) => (w[i] ? z + w[i] * F.f(x, y) : z), 0),
    grad: (x, y) => {
      let gx = 0
      let gy = 0
      fields.forEach((F, i) => {
        if (!w[i]) return
        const [a, b] = F.grad(x, y)
        gx += w[i] * a
        gy += w[i] * b
      })
      return [gx, gy]
    },
  }
}

export const norm = (v: Vec2) => Math.hypot(v[0], v[1])

/** Central-difference gradient (to check the exact one). */
export function numericGrad(F: Field, x: number, y: number, h = 1e-5): Vec2 {
  return [(F.f(x + h, y) - F.f(x - h, y)) / (2 * h), (F.f(x, y + h) - F.f(x, y - h)) / (2 * h)]
}

/** Directional derivative D_u f = ∇f · u (u is normalized here). */
export function directional(F: Field, x: number, y: number, ux: number, uy: number): number {
  const n = Math.hypot(ux, uy) || 1
  const [gx, gy] = F.grad(x, y)
  return (gx * ux + gy * uy) / n
}

/** Steepest slope angle in degrees (same units on x, y and z). */
export function slopeDeg(F: Field, x: number, y: number): number {
  return (Math.atan(norm(F.grad(x, y))) * 180) / Math.PI
}

/** Climbs to the nearest summit (gradient ascent with backtracking). */
export function ascend(F: Field, start: Vec2, iters = 4000): Vec2 {
  let [x, y] = start
  let eta = 0.1
  for (let i = 0; i < iters; i++) {
    const [gx, gy] = F.grad(x, y)
    if (Math.hypot(gx, gy) < 1e-10) break
    const z = F.f(x, y)
    let nx = x + eta * gx
    let ny = y + eta * gy
    while (F.f(nx, ny) < z && eta > 1e-9) {
      eta /= 2
      nx = x + eta * gx
      ny = y + eta * gy
    }
    x = nx
    y = ny
    eta = Math.min(eta * 1.5, 1)
  }
  return [x, y]
}

/** Root of g on [a, b] by bisection (g(a) and g(b) with opposite signs). */
export function bisect(g: (t: number) => number, a: number, b: number, iters = 60): number {
  let ga = g(a)
  for (let i = 0; i < iters; i++) {
    const m = (a + b) / 2
    const gm = g(m)
    if (ga * gm <= 0) b = m
    else {
      a = m
      ga = gm
    }
  }
  return (a + b) / 2
}

/** Point along the ray start + t·dir where f crosses `level` (t in [0, tMax]). */
export function rayToLevel(F: Field, start: Vec2, dir: Vec2, level: number, tMax = 5): Vec2 {
  const at = (t: number): Vec2 => [start[0] + dir[0] * t, start[1] + dir[1] * t]
  const t = bisect((t) => F.f(...at(t)) - level, 0, tMax)
  return at(t)
}

// ------------------------------------------------------------ grids & level curves

/**
 * Samples f on an n × n grid over the square [−L, L]². Index j·n + i is the
 * point x = −L + 2L·i/(n−1), y = −L + 2L·j/(n−1).
 */
export function sampleGrid(F: Field, L: number, n: number, out = new Float32Array(n * n)): Float32Array {
  for (let j = 0; j < n; j++) {
    const y = -L + (2 * L * j) / (n - 1)
    for (let i = 0; i < n; i++) out[j * n + i] = F.f(-L + (2 * L * i) / (n - 1), y)
  }
  return out
}

/**
 * Level curve f = level by marching squares on a sampled grid. Returns flat
 * segments [x1, y1, x2, y2, …] in the grid's coordinates ([−L, L]²).
 * Saddle cells are resolved with the cell's average.
 */
export function contour(grid: ArrayLike<number>, n: number, L: number, level: number): number[] {
  const out: number[] = []
  const step = (2 * L) / (n - 1)
  const X = (i: number) => -L + i * step
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = grid[j * n + i] // (i, j)
      const b = grid[j * n + i + 1] // (i+1, j)
      const c = grid[(j + 1) * n + i + 1] // (i+1, j+1)
      const d = grid[(j + 1) * n + i] // (i, j+1)
      const code = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0)
      if (code === 0 || code === 15) continue
      const x0 = X(i)
      const y0 = X(j)
      const t = (p: number, q: number) => (level - p) / (q - p || 1e-12)
      // Edge crossing points: bottom (a→b), right (b→c), top (d→c), left (a→d).
      const B = () => [x0 + t(a, b) * step, y0]
      const R = () => [x0 + step, y0 + t(b, c) * step]
      const T = () => [x0 + t(d, c) * step, y0 + step]
      const Lf = () => [x0, y0 + t(a, d) * step]
      const seg = (p: number[], q: number[]) => out.push(p[0], p[1], q[0], q[1])
      switch (code) {
        case 1:
        case 14:
          seg(Lf(), B())
          break
        case 2:
        case 13:
          seg(B(), R())
          break
        case 3:
        case 12:
          seg(Lf(), R())
          break
        case 4:
        case 11:
          seg(R(), T())
          break
        case 6:
        case 9:
          seg(B(), T())
          break
        case 7:
        case 8:
          seg(Lf(), T())
          break
        case 5:
        case 10: {
          const mid = (a + b + c + d) / 4
          const centerHigh = mid > level
          if ((code === 5) === centerHigh) {
            seg(Lf(), T())
            seg(B(), R())
          } else {
            seg(Lf(), B())
            seg(R(), T())
          }
          break
        }
      }
    }
  }
  return out
}

// ------------------------------------------------------------ camera

/**
 * A turntable camera. yaw turns the terrain about the vertical axis; pitch is
 * the viewing elevation (π/2 = straight down: the contour map). scale is
 * pixels per unit, (cx, cy) the screen center, (panX, panY) the ground point
 * at the center and persp a mild perspective (0 = orthographic).
 */
export interface Camera {
  yaw: number
  pitch: number
  scale: number
  cx: number
  cy: number
  panX?: number
  panY?: number
  persp?: number
}

export interface Projected {
  X: number
  Y: number
  /** Larger = farther from the viewer (for painter's ordering). */
  depth: number
}

export function project(cam: Camera, x: number, y: number, z: number, out: Projected = { X: 0, Y: 0, depth: 0 }): Projected {
  const c = Math.cos(cam.yaw)
  const s = Math.sin(cam.yaw)
  const u = x - (cam.panX ?? 0)
  const v = y - (cam.panY ?? 0)
  const xr = u * c - v * s
  const yr = u * s + v * c
  const sp = Math.sin(cam.pitch)
  const cp = Math.cos(cam.pitch)
  const up = yr * sp + z * cp
  const depth = yr * cp - z * sp
  const k = cam.persp ? 1 / Math.max(0.2, 1 + cam.persp * depth) : 1
  out.X = cam.cx + cam.scale * k * xr
  out.Y = cam.cy - cam.scale * k * up
  out.depth = depth
  return out
}

/** Screen displacement (pixels) → ground displacement (z = 0, no perspective). */
export function groundDelta(cam: Camera, dX: number, dY: number): Vec2 {
  const c = Math.cos(cam.yaw)
  const s = Math.sin(cam.yaw)
  const A = dX / cam.scale
  const B = -dY / (cam.scale * Math.max(0.25, Math.sin(cam.pitch)))
  return [c * A + s * B, -s * A + c * B]
}

/** Screen point → ground point (z = 0, no perspective): exact for the map view. */
export function groundFromScreen(cam: Camera, X: number, Y: number): Vec2 {
  const [du, dv] = groundDelta(cam, X - cam.cx, Y - cam.cy)
  return [du + (cam.panX ?? 0), dv + (cam.panY ?? 0)]
}

// ------------------------------------------------------------ gradient descent

/** One step downhill: p ← p − η∇f(p). */
export function descentStep(F: Field, p: Vec2, eta: number): Vec2 {
  const [gx, gy] = F.grad(p[0], p[1])
  return [p[0] - eta * gx, p[1] - eta * gy]
}

export type DescentStatus = 'chegou' | 'divergiu' | 'andando'

/** Runs gradient descent: stops at the bottom (|∇f| < tol), when it leaves the box |x|,|y| ≤ bound, or after maxSteps. */
export function descend(F: Field, start: Vec2, eta: number, opts: { maxSteps?: number; tol?: number; bound?: number } = {}): { path: Vec2[]; status: DescentStatus } {
  const { maxSteps = 60, tol = 0.05, bound = Infinity } = opts
  const path: Vec2[] = [start]
  let p = start
  for (let k = 0; k < maxSteps; k++) {
    if (norm(F.grad(p[0], p[1])) < tol) return { path, status: 'chegou' }
    p = descentStep(F, p, eta)
    path.push(p)
    if (!Number.isFinite(p[0]) || Math.abs(p[0]) > bound || Math.abs(p[1]) > bound) return { path, status: 'divergiu' }
  }
  return { path, status: norm(F.grad(p[0], p[1])) < tol ? 'chegou' : 'andando' }
}

/**
 * For f = a·x² + b·y², each descent step multiplies x by (1 − 2aη) and y by
 * (1 − 2bη). A negative factor jumps to the other side (zigzag); a factor
 * beyond ±1 grows (diverges).
 */
export function quadraticFactors(a: number, b: number, eta: number): Vec2 {
  return [1 - 2 * a * eta, 1 - 2 * b * eta]
}

/** η above which descent on a·x² + b·y² starts to zigzag. */
export const zigzagEta = (a: number, b: number) => 1 / (2 * Math.max(a, b))
/** η above which descent on a·x² + b·y² diverges. */
export const divergeEta = (a: number, b: number) => 1 / Math.max(a, b)
