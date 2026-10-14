import { describe, expect, test } from 'vitest'
import { arranjo, avisoDoPar, extensaoMaxima, fatoracaoDe, fatoradoTexto, LADO_X, legendaArranjo, mesmoPar, paresDeFatores, retanguloDe, trinomioTexto } from '@/components/aula/visual/azulejos-retangulo'
import { recorteGeo, rotulosRecorte } from '@/components/aula/visual/recorte-geo'

// Os azulejos de x² + bx + c arrumados em retângulo e o recorte da diferença de quadrados (AF.U2).

describe('pares de fatores', () => {
  test('só os pares que multiplicam c, do mais fino ao mais largo', () => {
    expect(paresDeFatores(6)).toEqual([[1, 6], [2, 3]])
    expect(paresDeFatores(12)).toEqual([[1, 12], [2, 6], [3, 4]])
    expect(paresDeFatores(4)).toEqual([[1, 4], [2, 2]])
    expect(paresDeFatores(7)).toEqual([[1, 7]])
    expect(paresDeFatores(1)).toEqual([[1, 1]])
  })

  test('o par que fecha tem a soma b', () => {
    expect(fatoracaoDe(5, 6)).toEqual([2, 3])
    expect(fatoracaoDe(7, 12)).toEqual([3, 4])
    expect(fatoracaoDe(4, 4)).toEqual([2, 2])
    expect(fatoracaoDe(7, 6)).toEqual([1, 6])
    expect(fatoracaoDe(5, 7)).toBeNull()
    expect(mesmoPar([2, 3], [3, 2])).toBe(true)
    expect(mesmoPar([1, 6], [2, 3])).toBe(false)
  })
})

describe('o arranjo das peças', () => {
  const conta = (a: ReturnType<typeof arranjo>, tipo: string, estado: string) => a.pecas.filter((p) => p.tipo === tipo && p.estado === estado).length

  test('2 × 3 fecha x² + 5x + 6: barras de pé à direita, deitadas embaixo, a grade no canto', () => {
    const a = arranjo(5, 6, [2, 3])
    expect(a.fecha).toBe(true)
    expect([a.faltam, a.sobram]).toEqual([0, 0])
    expect(a.ret).toEqual({ w: LADO_X + 2, h: LADO_X + 3 })
    const de = (id: string) => a.pecas.find((p) => p.id === id)!
    expect(de('q')).toMatchObject({ x: 0, y: 0, w: LADO_X, h: LADO_X })
    expect(de('b0')).toMatchObject({ x: LADO_X, y: 0, w: 1, h: LADO_X })
    expect(de('b1')).toMatchObject({ x: LADO_X + 1, y: 0, w: 1, h: LADO_X })
    expect(de('b2')).toMatchObject({ x: 0, y: LADO_X, w: LADO_X, h: 1 })
    expect(de('b4')).toMatchObject({ x: 0, y: LADO_X + 2, w: LADO_X, h: 1 })
    // The units fill exactly the corner p by q: no gap, no overlap.
    const us = a.pecas.filter((p) => p.tipo === '1')
    expect(new Set(us.map((p) => `${Math.round(p.x - LADO_X)},${Math.round(p.y - LADO_X)}`))).toEqual(new Set(['0,0', '1,0', '0,1', '1,1', '0,2', '1,2']))
    expect(legendaArranjo(a, 5, 6)).toBe('x² + 5x + 6 = (x + 2)(x + 3)')
  })

  test('1 × 6 em x² + 5x + 6: faltam 2 barras (vagas tracejadas embaixo)', () => {
    const a = arranjo(5, 6, [1, 6])
    expect(a.fecha).toBe(false)
    expect([a.faltam, a.sobram]).toEqual([2, 0])
    expect(conta(a, 'x', 'posta')).toBe(5)
    expect(conta(a, 'x', 'falta')).toBe(2)
    // The empty slots are the last ones of the bottom row.
    expect(a.pecas.filter((p) => p.estado === 'falta').map((p) => p.y)).toEqual([LADO_X + 4, LADO_X + 5])
    expect(legendaArranjo(a, 5, 6)).toBe('faltam 2 barras')
    expect(avisoDoPar(5, [1, 6])).toBe('1 + 6 = 7 barras, mas você tem 5: faltam 2 barras. Toque de novo.')
  })

  test('2 × 3 em x² + 7x + 6: sobram 2 barras, de lado', () => {
    const a = arranjo(7, 6, [2, 3])
    expect([a.faltam, a.sobram, a.fecha]).toEqual([0, 2, false])
    const sobras = a.pecas.filter((p) => p.estado === 'sobra')
    expect(sobras).toHaveLength(2)
    expect(sobras.every((p) => p.x > LADO_X + 2)).toBe(true)
    expect(a.largura).toBeGreaterThan(LADO_X + 2)
    expect(legendaArranjo(a, 7, 6)).toBe('sobram 2 barras')
    expect(avisoDoPar(7, [2, 3])).toBe('2 + 3 = 5 barras, mas você tem 7: sobram 2 barras. Toque de novo.')
    expect(avisoDoPar(6, [2, 3])).toBe('2 + 3 = 5 barras, mas você tem 6: sobra 1 barra. Toque de novo.')
    expect(avisoDoPar(7, [3, 4])).toBeNull()
  })

  test('soltas: todas as peças, sem se sobrepor', () => {
    for (const [b, c] of [[5, 6], [8, 12], [4, 4], [1, 1]]) {
      const a = arranjo(b, c, null)
      expect(a.pecas).toHaveLength(1 + b + c)
      expect(a.pecas.every((p) => p.estado === 'posta')).toBe(true)
      for (const p of a.pecas) for (const q of a.pecas) {
        if (p === q) continue
        const sobrepoe = p.x < q.x + q.w - 1e-9 && q.x < p.x + p.w - 1e-9 && p.y < q.y + q.h - 1e-9 && q.y < p.y + p.h - 1e-9
        expect(sobrepoe, `${p.id} e ${q.id}`).toBe(false)
      }
      for (const p of a.pecas) {
        expect(p.x + p.w).toBeLessThanOrEqual(a.largura + 1e-9)
        expect(p.y + p.h).toBeLessThanOrEqual(a.altura + 1e-9)
      }
      expect(legendaArranjo(a, b, c)).toBe(trinomioTexto(b, c))
    }
  })

  test('arrumadas: nada se sobrepõe, e tudo cabe no desenho', () => {
    for (const [b, c] of [[5, 6], [7, 12], [8, 12], [4, 4], [7, 6], [6, 9]]) {
      for (const par of paresDeFatores(c)) {
        const a = arranjo(b, c, par)
        expect(a.pecas.filter((p) => p.estado !== 'falta' && p.tipo === 'x')).toHaveLength(b)
        expect(a.pecas.filter((p) => p.tipo === '1')).toHaveLength(c)
        const reais = a.pecas
        for (const p of reais) for (const q of reais) {
          if (p === q) continue
          const sobrepoe = p.x < q.x + q.w - 1e-9 && q.x < p.x + p.w - 1e-9 && p.y < q.y + q.h - 1e-9 && q.y < p.y + p.h - 1e-9
          expect(sobrepoe, `${b},${c} ${par} ${p.id} e ${q.id}`).toBe(false)
        }
        for (const p of a.pecas) {
          expect(p.x + p.w).toBeLessThanOrEqual(a.largura + 1e-9)
          expect(p.y + p.h).toBeLessThanOrEqual(a.altura + 1e-9)
        }
        expect(a.fecha).toBe(par[0] + par[1] === b)
      }
    }
  })

  test('uma escala só para o Mexa: a maior extensão', () => {
    const e = extensaoMaxima(5, 6, [null, [1, 6], [2, 3]])
    expect(e.altura).toBe(LADO_X + 6)
    expect(e.largura).toBeGreaterThanOrEqual(arranjo(5, 6, null).largura)
  })

  test('o estado do conteúdo: retangulo pronto ou fatorar com arranjo', () => {
    expect(retanguloDe({ retangulo: [2, 3] })).toEqual({ b: 5, c: 6, par: [2, 3] })
    expect(retanguloDe({ fatorar: [5, 6] })).toEqual({ b: 5, c: 6, par: null })
    expect(retanguloDe({ fatorar: [5, 6], arranjo: [1, 6] })).toEqual({ b: 5, c: 6, par: [1, 6] })
    expect(retanguloDe({})).toBeNull()
    expect(retanguloDe({ retangulo: [0, 3] })).toBeNull()
  })

  test('os textos', () => {
    expect(trinomioTexto(5, 6)).toBe('x² + 5x + 6')
    expect(trinomioTexto(1, 0, 'a')).toBe('a² + a')
    expect(fatoradoTexto([2, 3])).toBe('(x + 2)(x + 3)')
    expect(fatoradoTexto([2, 2])).toBe('(x + 2)²')
    expect(legendaArranjo(arranjo(4, 4, [2, 2]), 4, 4)).toBe('x² + 4x + 4 = (x + 2)²')
  })
})

describe('o recorte da diferença de quadrados', () => {
  test('os dois pedaços do L formam o retângulo (x + b) por (x − b), com a mesma área', () => {
    const g = recorteGeo(0.3)
    const area = (r: { w: number; h: number }) => r.w * r.h
    expect(area(g.fixo) + area(g.peca)).toBeCloseTo(1 - 0.3 ** 2)
    expect(area(g.depois)).toBeCloseTo(1 - 0.3 ** 2)
    expect(g.depois).toEqual({ w: 1.3, h: 0.7 })
    // Turned a quarter, the piece swaps its sides and lands to the right of the top piece.
    expect([g.pecaMovida.w, g.pecaMovida.h]).toEqual([g.peca.h, g.peca.w].map((n) => expect.closeTo(n)))
    expect(g.pecaMovida.x).toBe(g.fixo.x + g.fixo.w)
    expect(g.pecaMovida.h).toBeCloseTo(g.fixo.h)
    expect(g.peca.x + g.peca.w / 2 + g.giro.dx).toBeCloseTo(g.pecaMovida.x + g.pecaMovida.w / 2)
    expect(g.peca.y + g.peca.h / 2 + g.giro.dy).toBeCloseTo(g.pecaMovida.y + g.pecaMovida.h / 2)
    expect(g.buraco).toEqual({ x: 0.7, y: 0.7, w: 0.3, h: 0.3 })
  })

  test('os rótulos antes e depois', () => {
    expect(rotulosRecorte(3)).toMatchObject({ topo: 'x', esquerda: 'x', b: '3', menos: 'x − 3', buraco: '9', equacao: 'x² − 9' })
    expect(rotulosRecorte(3, 'x', true)).toMatchObject({ topo: 'x + 3', esquerda: 'x − 3', equacao: 'x² − 9 = (x + 3)(x − 3)' })
    expect(rotulosRecorte(2, 'a', true).equacao).toBe('a² − 4 = (a + 2)(a − 2)')
  })
})
