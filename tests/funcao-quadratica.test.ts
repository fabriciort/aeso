import { describe, expect, it } from 'vitest'
import {
  apex,
  canonical,
  discriminant,
  evaluate,
  FREE_THROW_DX,
  fromVertex,
  G_EARTH,
  G_MOON,
  ghosts,
  halfWidth,
  heightOfTime,
  landing,
  lerpQuad,
  minSpeedAngle,
  perfectSpeed,
  position,
  rad,
  rangeFlat,
  RELEASE_HEIGHT,
  RIM_HEIGHT,
  rootCount,
  roots,
  shotOutcome,
  speedThrough,
  trajectory,
  velocity,
  vertex,
  vertexLocusB,
} from '@/lib/math/quadratic'

const H = { a: -5, b: 10, c: 2 } // the Resolva problem: h(t) = −5t² + 10t + 2

describe('the parabola', () => {
  it('FIBA: the ring is 4,225 m ahead of the free-throw line', () => {
    expect(FREE_THROW_DX).toBeCloseTo(4.225, 10)
    expect(RIM_HEIGHT).toBe(3.05)
  })

  it('vertex at −b/2a (the Resolva problem: top at t = 1 s, 7 m)', () => {
    expect(vertex(H)).toEqual({ x: 1, y: 7 })
    expect(vertex({ a: -5, b: 20, c: 1 })).toEqual({ x: 2, y: 21 })
  })

  it('Bhaskara: Δ = 140 and the ball lands at t = 1 + √140/10 ≈ 2,18 s', () => {
    expect(discriminant(H)).toBe(140)
    const [r1, r2] = roots(H)
    expect(r1).toBeCloseTo(1 - Math.sqrt(140) / 10, 12)
    expect(r2).toBeCloseTo(2.1832, 4)
    for (const r of roots(H)) expect(evaluate(H, r)).toBeCloseTo(0, 10)
  })

  it('√Δ/(2|a|) is the distance from the axis of symmetry to each root', () => {
    const [r1, r2] = roots(H)
    const v = vertex(H)
    expect(halfWidth(H)).toBeCloseTo(v.x - r1, 12)
    expect(halfWidth(H)).toBeCloseTo(r2 - v.x, 12)
  })

  it('Δ counts how many times the parabola touches the floor: 2, 1, 0', () => {
    expect(rootCount({ a: 1, b: 0, c: -1 })).toBe(2)
    expect(rootCount({ a: 1, b: 2, c: 1 })).toBe(1)
    expect(rootCount({ a: 1, b: 0, c: 1 })).toBe(0)
    expect(roots({ a: 0, b: 2, c: -4 })).toEqual([2])
  })

  it('stable roots when b² ≫ 4ac', () => {
    const [r1] = roots({ a: 1, b: 1e8, c: 1 })
    expect(r1).toBeCloseTo(-1e8, -2)
    const r2 = roots({ a: 1, b: 1e8, c: 1 })[1]
    expect(r2).toBeCloseTo(-1e-8, 15)
  })

  it('canonical form round-trips', () => {
    const k = canonical(H)
    expect(k).toEqual({ a: -5, h: 1, k: 7 })
    const back = fromVertex(k.a, k.h, k.k)
    expect(back.a).toBeCloseTo(-5)
    expect(back.b).toBeCloseTo(10)
    expect(back.c).toBeCloseTo(2)
  })

  it('blending coefficients blends the curves point by point', () => {
    const p = { a: 1, b: 0, c: 0 }
    const q = { a: -0.5, b: 2, c: 3 }
    for (const x of [-2, 0, 1.5]) expect(evaluate(lerpQuad(p, q, 0.3), x)).toBeCloseTo(0.7 * evaluate(p, x) + 0.3 * evaluate(q, x), 12)
  })

  it('changing only b moves the vertex along y = c − a·x²', () => {
    for (const b of [-3, -1, 0, 2, 5]) {
      const q = { a: -0.4, b, c: 2 }
      const v = vertex(q)
      expect(v.y).toBeCloseTo(vertexLocusB(q, v.x), 12)
    }
  })
})

describe('the throw (sem ar)', () => {
  const l = { v: 8, theta: rad(50), h0: 2, g: G_EARTH }

  it('the path y(x) is the quadratic a = −g/(2v²cos²θ), b = tanθ, c = h₀', () => {
    const q = trajectory(l)
    for (const t of [0, 0.3, 0.7, 1.2]) {
      const p = position(l, t)
      expect(evaluate(q, p.x)).toBeCloseTo(p.y, 10)
    }
    expect(q.c).toBe(2)
    expect(q.b).toBeCloseTo(Math.tan(rad(50)), 12)
  })

  it('the ghosts are equally spaced horizontally (vx is constant)', () => {
    const gs = ghosts(l, 0.1, 1.2)
    const dx = gs.slice(1).map((p, i) => p.x - gs[i].x)
    for (const d of dx) expect(d).toBeCloseTo(l.v * Math.cos(l.theta) * 0.1, 10)
    // …but not vertically: they bunch up near the top.
    const dy = gs.slice(1).map((p, i) => Math.abs(p.y - gs[i].y))
    expect(Math.min(...dy)).toBeLessThan(dy[0] / 3)
  })

  it('at the top the ball is slowest but does not stop', () => {
    const top = apex(l)
    const v = velocity(l, top.t)
    expect(v.vy).toBeCloseTo(0, 12)
    expect(v.speed).toBeCloseTo(l.v * Math.cos(l.theta), 12)
    for (const t of [0, top.t / 2, top.t * 1.5]) expect(velocity(l, t).speed).toBeGreaterThan(v.speed)
    expect(vertex(trajectory(l)).x).toBeCloseTo(top.x, 10)
    expect(vertex(heightOfTime(l))).toEqual({ x: expect.closeTo(top.t, 10), y: expect.closeTo(top.y, 10) })
  })

  it('a perfect free throw goes in; too weak is short, too strong is long', () => {
    const theta = rad(52)
    const v = perfectSpeed(theta)
    expect(v).toBeGreaterThan(6.5)
    expect(v).toBeLessThan(8)
    const L = { v, theta, h0: RELEASE_HEIGHT, g: G_EARTH }
    const hit = shotOutcome(L)
    expect(hit.kind).toBe('cesta')
    expect(Math.abs(hit.miss)).toBeLessThan(1e-9)
    expect(shotOutcome({ ...L, v: v * 0.85 }).kind).toBe('curto')
    expect(['longo', 'tabela']).toContain(shotOutcome({ ...L, v: v * 1.12 }).kind)
    expect(shotOutcome({ ...L, theta: rad(30), v: perfectSpeed(rad(30)) * 1.15 }).kind).toBe('tabela')
  })

  it('the angle of least effort to the ring is 45° + ½·atan(dy/dx) ≈ 51°', () => {
    const dy = RIM_HEIGHT - RELEASE_HEIGHT
    const best = minSpeedAngle(FREE_THROW_DX, dy)
    expect(best * (180 / Math.PI)).toBeCloseTo(51.3, 1)
    const vBest = speedThrough(best, FREE_THROW_DX, dy, G_EARTH)
    for (const d of [-8, -3, 3, 8]) expect(speedThrough(best + rad(d), FREE_THROW_DX, dy, G_EARTH)).toBeGreaterThan(vBest)
    expect(Number.isNaN(speedThrough(rad(10), FREE_THROW_DX, dy, G_EARTH))).toBe(true)
  })

  it('on flat ground 45° goes farthest, and 30° ties with 60°', () => {
    const R = (d: number) => rangeFlat(10, rad(d), G_EARTH)
    expect(R(45)).toBeCloseTo(100 / G_EARTH, 10)
    for (const d of [20, 30, 40, 44, 46, 60, 70]) expect(R(d)).toBeLessThan(R(45))
    expect(R(30)).toBeCloseTo(R(60), 10)
    expect(landing({ v: 10, theta: rad(45), h0: 0, g: G_EARTH }).x).toBeCloseTo(R(45), 8)
  })

  it('on the Moon the same throw is g_T/g_L ≈ 6 times wider (a is 6× smaller)', () => {
    const earth = trajectory(l)
    const moon = trajectory({ ...l, g: G_MOON })
    expect(earth.a / moon.a).toBeCloseTo(G_EARTH / G_MOON, 10)
    expect(G_EARTH / G_MOON).toBeCloseTo(6.05, 2)
    expect(rangeFlat(10, rad(45), G_MOON) / rangeFlat(10, rad(45), G_EARTH)).toBeCloseTo(G_EARTH / G_MOON, 10)
  })
})
