import { describe, expect, test } from 'vitest'
import { arranjoCompletar, completarDe, extensaoCompletar, legendaCompletar, legendaTexto, linhasLegenda, FASES, type Completar } from '@/components/aula/visual/azulejos-completar'
import { LADO_X } from '@/components/aula/visual/azulejos-retangulo'

// Completar o quadrado (AF.U3): as peças de x² + bx partidas ao redor do x²,
// o canto vazio de b/2 por b/2 e os quadradinhos que o completam.

const c = (b: number, extra: Partial<Completar> = {}): Completar => ({ ...completarDe({ completar: b })!, ...extra })
const sobrepoe = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w - 1e-9 && b.x < a.x + a.w - 1e-9 && a.y < b.y + b.h - 1e-9 && b.y < a.y + a.h - 1e-9

describe('completarDe', () => {
  test('lê b par de 2 a 10, a fase, o lado direito e a letra', () => {
    expect(completarDe({ completar: 6 })).toEqual({ b: 6, m: 3, fase: 'soltas', igual: undefined, letra: 'x' })
    expect(completarDe({ completar: 6, partido: true })?.fase).toBe('partido')
    expect(completarDe({ completar: 6, partido: true, completo: true })?.fase).toBe('completo')
    expect(completarDe({ completar: 2, igual: -5, letra: 'a' })).toMatchObject({ b: 2, m: 1, igual: -5, letra: 'a' })
    for (const b of [0, 3, 12, 6.5, -4]) expect(completarDe({ completar: b })).toBeNull()
    expect(completarDe({ completar: '6' })).toBeNull()
    expect(completarDe(undefined)).toBeNull()
  })
})

describe('arranjoCompletar', () => {
  test.each([2, 4, 6, 8, 10])('b = %i: as barras se partem ao redor do x² e o canto é b/2 por b/2', (b) => {
    const m = b / 2
    const soltas = arranjoCompletar(b, 'soltas')
    expect(soltas.pecas.filter((p) => p.tipo === 'x')).toHaveLength(b)
    expect(soltas.canto).toBeUndefined()
    const partido = arranjoCompletar(b, 'partido')
    const barras = partido.pecas.filter((p) => p.tipo === 'x')
    expect(barras.filter((p) => p.h === LADO_X && p.x >= LADO_X)).toHaveLength(m)
    expect(barras.filter((p) => p.w === LADO_X && p.y >= LADO_X)).toHaveLength(m)
    expect(partido.pecas.filter((p) => p.tipo === '1')).toHaveLength(0)
    expect(partido.canto).toEqual({ x: LADO_X, y: LADO_X, w: m, h: m })
    // Nothing covers the corner, and the square is x + m by x + m.
    for (const p of partido.pecas) expect(sobrepoe(p, partido.canto!)).toBe(false)
    expect(partido.ret).toEqual({ w: LADO_X + m, h: LADO_X + m })
    const completo = arranjoCompletar(b, 'completo')
    const unidades = completo.pecas.filter((p) => p.tipo === '1')
    expect(unidades).toHaveLength(m * m)
    for (const u of unidades) expect(u.x >= LADO_X && u.x + u.w <= LADO_X + m + 1e-9 && u.y >= LADO_X && u.y + u.h <= LADO_X + m + 1e-9).toBe(true)
    // No two pieces overlap, in any phase; the ids stay the same from one phase to the next.
    for (const a of [soltas, partido, completo]) a.pecas.forEach((p, i) => a.pecas.slice(i + 1).forEach((q) => expect(sobrepoe(p, q)).toBe(false)))
    expect(partido.pecas.map((p) => p.id)).toEqual(soltas.pecas.map((p) => p.id))
    // The area adds up: x² + bx + (b/2)² is the square.
    const area = completo.pecas.reduce((s, p) => s + p.w * p.h, 0)
    expect(area).toBeCloseTo((LADO_X + m) ** 2)
  })

  test('as soltas cabem numa fila até 4 barras; depois, em duas filas de b/2', () => {
    expect(arranjoCompletar(4, 'soltas').altura).toBeCloseTo(LADO_X)
    expect(new Set(arranjoCompletar(6, 'soltas').pecas.filter((p) => p.tipo === 'x').map((p) => p.y)).size).toBe(2)
  })

  test('a extensão é a maior das três fases (uma escala só)', () => {
    for (const b of [2, 6, 10]) {
      const ext = extensaoCompletar(b)
      for (const f of FASES) {
        expect(arranjoCompletar(b, f).largura).toBeLessThanOrEqual(ext.largura)
        expect(arranjoCompletar(b, f).altura).toBeLessThanOrEqual(ext.altura)
      }
    }
    // b = 10 still fits a phone: the square is at most about 11 units wide.
    expect(extensaoCompletar(10).largura).toBeLessThan(11)
  })
})

describe('legendaCompletar', () => {
  test('antes, partido e completo', () => {
    expect(legendaTexto(c(6))).toBe('x² + 6x')
    expect(legendaTexto(c(6, { fase: 'partido' }))).toBe('x² + 6x; falta um canto 3 por 3')
    expect(legendaTexto(c(6, { fase: 'completo' }))).toBe('x² + 6x + 9 = (x + 3)²')
    expect(legendaCompletar(c(6, { fase: 'completo' }))[0].trechos.find((t) => t.novo)?.t).toBe('+ 9')
    expect(legendaTexto(c(2, { fase: 'completo', letra: 'a' }))).toBe('a² + 2a + 1 = (a + 1)²')
  })

  test('com o lado direito, os dois lados ganham o + 9', () => {
    expect(legendaTexto(c(6, { igual: 16 }))).toBe('x² + 6x = 16')
    expect(legendaTexto(c(6, { igual: 16, fase: 'completo' }))).toBe('x² + 6x + 9 = 16 + 9; (x + 3)² = 25')
    expect(legendaCompletar(c(6, { igual: 16, fase: 'completo' }))[0].trechos.filter((t) => t.novo)).toHaveLength(2)
    expect(linhasLegenda(c(6, { igual: 16 }))).toBe(2)
    expect(linhasLegenda(c(6))).toBe(2)
  })

  test('com o lado direito negativo, nenhum quadrado tem área negativa', () => {
    const l = legendaCompletar(c(2, { igual: -5, fase: 'completo' }))
    expect(legendaTexto(c(2, { igual: -5, fase: 'completo' }))).toBe('x² + 2x + 1 = −5 + 1; (x + 1)² = −4; nenhum quadrado tem área negativa')
    expect(l[1].cor).toBe('rosa')
    expect(linhasLegenda(c(2, { igual: -5 }))).toBe(3)
    expect(legendaTexto(c(6, { igual: -9, fase: 'completo' }))).toBe('x² + 6x + 9 = −9 + 9; (x + 3)² = 0')
  })
})
