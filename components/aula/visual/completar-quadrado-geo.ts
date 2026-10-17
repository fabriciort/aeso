/** Uma faixa t × x à direita do quadrado gira ao redor do seu centro. */
export function giroDaFaixa(x: number, t: number) {
  return { dx: -x / 2 - 1.5 * t, dy: (x + t) / 2, graus: 90 }
}
