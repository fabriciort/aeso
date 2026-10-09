import { describe, expect, it } from 'vitest'
import {
  ascend,
  blend,
  bumpGrad,
  contour,
  descend,
  directional,
  divergeEta,
  groundFromScreen,
  hills,
  norm,
  numericGrad,
  project,
  quadratic,
  quadraticFactors,
  sampleGrid,
  slopeDeg,
  zigzagEta,
  type Camera,
} from '@/lib/math/surface'
import {
  BOWL,
  DESCENT_BOUND,
  DESCENT_START,
  FALSE_SUMMIT_H,
  isRidgePoint,
  MOUNTAIN,
  P1,
  P3,
  PAO,
  RIDGE_POINT,
  RIO,
  SUMMIT,
  SUMMIT_H,
  TRAIL_A,
  TRAIL_B,
  trailLength,
  U_DIR,
  URCA,
} from '@/components/labs/gradiente/data'

describe('derivadas parciais', () => {
  it('a gaussiana girada tem gradiente exato (confere com diferenças finitas)', () => {
    const b = { x: 0.3, y: -0.2, h: 1.2, sx: 0.5, sy: 0.9, rot: 0.7 }
    const F = hills([b])
    for (const [x, y] of [
      [0, 0],
      [0.8, 0.1],
      [-0.4, -1],
    ]) {
      const exact = bumpGrad(b, x, y)
      const num = numericGrad(F, x, y)
      expect(exact[0]).toBeCloseTo(num[0], 6)
      expect(exact[1]).toBeCloseTo(num[1], 6)
    }
  })

  it('a montanha e o Rio também (soma de gaussianas)', () => {
    for (const T of [MOUNTAIN, RIO]) {
      for (const [x, y] of [
        [0.2, 0.3],
        [-0.7, 0.5],
        [1, -0.9],
      ]) {
        const g = T.field.grad(x, y)
        const n = numericGrad(T.field, x, y)
        expect(g[0]).toBeCloseTo(n[0], 6)
        expect(g[1]).toBeCloseTo(n[1], 6)
      }
    }
  })

  it('f = x² + 3y² em (1, 1): ∇f = (2, 6), |∇f| = √40 ≈ 6,32', () => {
    const F = quadratic(1, 3)
    expect(F.grad(...P1)).toEqual([2, 6])
    expect(norm(F.grad(...P1))).toBeCloseTo(Math.sqrt(40), 12)
    expect(norm(F.grad(...P1))).toBeCloseTo(6.32, 2)
  })

  it('derivada direcional em (1, 1) na direção (0,6; 0,8) é 6, e nunca passa de |∇f|', () => {
    const F = BOWL.field
    expect(directional(F, 1, 1, ...U_DIR)).toBeCloseTo(6, 12)
    for (let a = 0; a < 2 * Math.PI; a += 0.1) expect(directional(F, 1, 1, Math.cos(a), Math.sin(a))).toBeLessThanOrEqual(norm(F.grad(1, 1)) + 1e-12)
    // perpendicular to ∇f: no climb at all (walking along the level curve)
    const [gx, gy] = F.grad(1, 1)
    expect(directional(F, 1, 1, -gy, gx)).toBeCloseTo(0, 12)
  })

  it('o problema sozinho: ∇f(−2; 0,5) = (−4, 3), de comprimento 5', () => {
    expect(BOWL.field.grad(...P3)).toEqual([-4, 3])
    expect(norm(BOWL.field.grad(...P3))).toBe(5)
  })

  it('blend mistura alturas e gradientes linearmente', () => {
    const F = blend([quadratic(1, 0), quadratic(0, 1)], [0.25, 0.75])
    expect(F.f(2, 2)).toBeCloseTo(4, 12)
    expect(F.grad(2, 2)).toEqual([1, 3])
  })
})

describe('curvas de nível', () => {
  const n = 81
  it('os pontos da curva têm a altura pedida', () => {
    const F = quadratic(1, 3)
    const grid = sampleGrid(F, 3, n)
    const seg = contour(grid, n, 3, 4)
    expect(seg.length).toBeGreaterThan(40)
    for (let k = 0; k < seg.length; k += 2) expect(F.f(seg[k], seg[k + 1])).toBeCloseTo(4, 0)
  })

  it('o gradiente é perpendicular à curva de nível', () => {
    const grid = sampleGrid(MOUNTAIN.field, MOUNTAIN.L, n)
    const seg = contour(grid, n, MOUNTAIN.L, 0.5)
    let worst = 0
    for (let k = 0; k < seg.length; k += 4) {
      const dx = seg[k + 2] - seg[k]
      const dy = seg[k + 3] - seg[k + 1]
      const len = Math.hypot(dx, dy)
      if (len < 1e-3) continue
      const [gx, gy] = MOUNTAIN.field.grad((seg[k] + seg[k + 2]) / 2, (seg[k + 1] + seg[k + 3]) / 2)
      worst = Math.max(worst, Math.abs(dx * gx + dy * gy) / (len * Math.hypot(gx, gy)))
    }
    expect(worst).toBeLessThan(0.15)
  })

  it('curvas juntas = encosta íngreme: a trilha A sobe 300 m em bem menos chão que a B', () => {
    for (const p of [...TRAIL_A, ...TRAIL_B]) expect([0.3, 0.6].some((h) => Math.abs(MOUNTAIN.field.f(...p) - h) < 1e-6)).toBe(true)
    expect(trailLength(TRAIL_B) / trailLength(TRAIL_A)).toBeGreaterThan(2.5)
  })

  it('no cume o chão é plano: ∇f = 0 e o falso cume é mais baixo', () => {
    expect(norm(MOUNTAIN.field.grad(...SUMMIT))).toBeLessThan(1e-6)
    expect(SUMMIT_H).toBeGreaterThan(FALSE_SUMMIT_H + 0.3)
  })

  it('existe um ponto com ∂f/∂x = 0 que não é o cume', () => {
    expect(isRidgePoint(RIDGE_POINT)).toBe(true)
    expect(MOUNTAIN.field.f(...RIDGE_POINT)).toBeLessThan(SUMMIT_H - 0.1)
  })
})

describe('Pão de Açúcar e Morro da Urca (forma simplificada)', () => {
  it('cumes nas alturas reais: 396 m e ≈ 220 m', () => {
    expect(RIO.field.f(...PAO) * 1000).toBeCloseTo(396, 0)
    expect(Math.abs(RIO.field.f(...URCA) * 1000 - 220)).toBeLessThan(2)
  })
  it('o Pão de Açúcar é mais íngreme que a Urca', () => {
    const steepest = (c: [number, number]) => {
      let best = 0
      for (let a = 0; a < 2 * Math.PI; a += 0.2)
        for (let r = 0.05; r < 0.5; r += 0.02) best = Math.max(best, slopeDeg(RIO.field, c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)))
      return best
    }
    expect(steepest(PAO)).toBeGreaterThan(steepest(URCA))
  })
})

describe('câmera', () => {
  const cam: Camera = { yaw: 0.7, pitch: Math.PI / 2, scale: 100, cx: 200, cy: 150 }
  it('vista de cima: a altura não muda a posição na tela', () => {
    const a = project(cam, 0.3, -0.4, 0)
    const b = project(cam, 0.3, -0.4, 5)
    expect(a.X).toBeCloseTo(b.X, 9)
    expect(a.Y).toBeCloseTo(b.Y, 9)
  })
  it('groundFromScreen desfaz a projeção do chão (z = 0)', () => {
    for (const pitch of [0.5, 1, Math.PI / 2]) {
      const c = { ...cam, pitch, panX: 0.2, panY: -0.1 }
      const p = project(c, 0.6, 0.25, 0)
      const [x, y] = groundFromScreen(c, p.X, p.Y)
      expect(x).toBeCloseTo(0.6, 9)
      expect(y).toBeCloseTo(0.25, 9)
    }
  })
  it('vista de cima sem giro: norte para cima, leste para a direita', () => {
    const c = { ...cam, yaw: 0 }
    expect(project(c, 1, 0, 0).X).toBeGreaterThan(c.cx)
    expect(project(c, 0, 1, 0).Y).toBeLessThan(c.cy)
  })
})

describe('descida do gradiente em x² + 3y²', () => {
  const F = BOWL.field
  it('fatores por passo e limiares: zigue-zague acima de η = 1/6, diverge acima de 1/3', () => {
    expect(quadraticFactors(1, 3, 0.4)[1]).toBeCloseTo(-1.4, 12)
    expect(zigzagEta(1, 3)).toBeCloseTo(1 / 6, 12)
    expect(divergeEta(1, 3)).toBeCloseTo(1 / 3, 12)
  })
  it('passo bom chega rápido; passo pequeno chega devagar', () => {
    const good = descend(F, DESCENT_START, 0.15, { maxSteps: 200 })
    const small = descend(F, DESCENT_START, 0.02, { maxSteps: 400 })
    expect(good.status).toBe('chegou')
    expect(small.status).toBe('chegou')
    expect(small.path.length).toBeGreaterThan(4 * good.path.length)
  })
  it('η = 0,3 faz zigue-zague em y mas chega; η = 0,4 diverge', () => {
    const zig = descend(F, DESCENT_START, 0.3, { maxSteps: 200 })
    expect(zig.status).toBe('chegou')
    expect(Math.sign(zig.path[1][1])).toBe(-Math.sign(zig.path[2][1]))
    const big = descend(F, DESCENT_START, 0.4, { maxSteps: 60, bound: DESCENT_BOUND })
    expect(big.status).toBe('divergiu')
  })
  it('subida do gradiente acha o cume', () => {
    const top = ascend(MOUNTAIN.field, [0, 0])
    expect(top[0]).toBeCloseTo(SUMMIT[0], 3)
    expect(top[1]).toBeCloseTo(SUMMIT[1], 3)
  })
})
