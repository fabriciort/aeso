// A diferença de quadrados como recorte (AF.U2), sem React, para o desenho e
// os testes: um quadrado x por x sem um canto b por b. O L que sobra se parte
// em dois retângulos; o de baixo gira e vai para o lado, e os dois formam um
// retângulo só, (x + b) por (x − b). A área não muda: x² − b² = (x + b)(x − b).

import { escreveNumero, MENOS } from './monomio'

/** How long b is drawn, as a part of x (x is a length we do not know: any value bigger than b works). */
export const RAZAO_RECORTE = 0.34

export interface Ret {
  x: number
  y: number
  w: number
  h: number
}

export interface RecorteGeo {
  /** The side b, as a part of x (x = 1). */
  r: number
  /** The top piece: x wide, x − b tall. It never moves. */
  fixo: Ret
  /** The bottom piece before the move: x − b wide, b tall. */
  peca: Ret
  /** The same piece after the move, turned a quarter: b wide, x − b tall, to the right of the top piece. */
  pecaMovida: Ret
  /** The corner that is missing: b by b. */
  buraco: Ret
  /** How the piece travels: from its centre to the new one, turning 90°. */
  giro: { dx: number; dy: number; graus: number }
  /** The whole drawing before and after (x = 1). */
  antes: { w: number; h: number }
  depois: { w: number; h: number }
}

export function recorteGeo(r = RAZAO_RECORTE): RecorteGeo {
  const fixo = { x: 0, y: 0, w: 1, h: 1 - r }
  const peca = { x: 0, y: 1 - r, w: 1 - r, h: r }
  const pecaMovida = { x: 1, y: 0, w: r, h: 1 - r }
  const centro = (q: Ret) => [q.x + q.w / 2, q.y + q.h / 2]
  const [ax, ay] = centro(peca)
  const [bx, by] = centro(pecaMovida)
  return { r, fixo, peca, pecaMovida, buraco: { x: 1 - r, y: 1 - r, w: r, h: r }, giro: { dx: bx - ax, dy: by - ay, graus: 90 }, antes: { w: 1, h: 1 }, depois: { w: 1 + r, h: 1 - r } }
}

/** The words on the drawing, before and after the move. */
export interface RotulosRecorte {
  /** Over the top side. */
  topo: string
  /** Beside the left side. */
  esquerda: string
  /** The side b (on the hole, before; over the moved piece, after). */
  b: string
  /** x − b: the short side of each piece. */
  menos: string
  /** The area of the corner that is missing (b²). */
  buraco: string
  /** The line below: x² − 9 before; x² − 9 = (x + 3)(x − 3) after. */
  equacao: string
}

export function rotulosRecorte(b: number, letra = 'x', movido = false): RotulosRecorte {
  const nb = escreveNumero(b)
  const quadrado = escreveNumero(b * b)
  const menos = `${letra} ${MENOS} ${nb}`
  const mais = `${letra} + ${nb}`
  const area = `${letra}² ${MENOS} ${quadrado}`
  return {
    topo: movido ? mais : letra,
    esquerda: movido ? menos : letra,
    b: nb,
    menos,
    buraco: quadrado,
    equacao: movido ? `${area} = (${mais})(${menos})` : area,
  }
}
