import { expect, it } from 'vitest'
import { giroDaFaixa } from '@/components/aula/visual/completar-quadrado-geo'

it('o giro conserva os lados e leva os quatro cantos da faixa para baixo do quadrado', () => {
  for (const [x, t] of [[60, 20], [132, 44], [6, 2]]) {
    const g = giroDaFaixa(x, t)
    const cx = x + 1.5 * t
    const cy = x / 2
    // Giro de 90°: (dx, dy) vira (−dy, dx), sem deformar o retângulo.
    const antes = [[x + t, 0], [x + 2 * t, 0], [x + 2 * t, x], [x + t, x]]
    const depois = antes.map(([a, b]) => [cx - (b - cy) + g.dx, cy + (a - cx) + g.dy])
    expect(new Set(depois.map((v) => v.join(',')))).toEqual(new Set([[0, x], [x, x], [0, x + t], [x, x + t]].map((v) => v.join(','))))
    expect(g.graus).toBe(90)
  }
})
