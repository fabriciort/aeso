import { describe, expect, it } from 'vitest'
import { ALL_UNITS, MODULES, ancestors, essentialRequires, getLesson, getUnit, layoutModule, missingRequires, unitStatus } from '@/lib/math/curriculum'
import { getLab } from '@/lib/labs/catalog'

describe('currículo da formação', () => {
  it('ids únicos e toda referência existe', () => {
    const ids = ALL_UNITS.map((u) => u.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const u of ALL_UNITS) {
      for (const r of u.requires) expect(getUnit(r), `${u.id} → ${r}`).toBeDefined()
      for (const l of u.lessons) for (const r of l.requires ?? []) expect(getLesson(r), `${l.id} → ${r}`).toBeDefined()
      if (u.lab) expect(getLab(u.lab), u.lab).toBeDefined()
    }
  })

  it('o grafo não tem ciclos', () => {
    for (const u of ALL_UNITS) expect(ancestors(u.id).has(u.id), u.id).toBe(false)
  })

  it('uma aula só exige aulas de unidades que vêm antes', () => {
    for (const u of ALL_UNITS)
      for (const l of u.lessons)
        for (const r of l.requires ?? []) {
          const owner = getLesson(r)!.unit.id
          expect(owner === u.id || ancestors(u.id).has(owner), `${l.id} exige ${r}, mas ${u.id} não depende de ${owner}`).toBe(true)
        }
  })

  it('pré-requisitos entre módulos seguem a ordem dos módulos', () => {
    const order = new Map(MODULES.map((m, i) => [m.id, i]))
    for (const u of ALL_UNITS) for (const r of u.requires) expect(order.get(getUnit(r)!.module)!).toBeLessThanOrEqual(order.get(u.module)!)
  })

  it('a Matemática Básica vai de U0 a U20 e termina no projeto final', () => {
    const b = MODULES[0]
    expect(b.units.map((u) => u.n)).toEqual(Array.from({ length: 21 }, (_, i) => i))
    // Every unit except the project leads somewhere: nothing is a dead end.
    for (const u of b.units.slice(0, -1)) expect(ancestors('B.U20').has(u.id), u.id).toBe(true)
  })

  it('a redução transitiva tira só o que já está implícito', () => {
    const u16 = getUnit('B.U16')!
    expect(essentialRequires(u16)).toEqual(['B.U13']) // U13 already needs U9
    const u20 = getUnit('B.U20')!
    expect(essentialRequires(u20)).not.toContain('B.U15') // U18 already needs U15
  })

  it('o layout põe todo pré-requisito numa camada acima', () => {
    for (const m of MODULES) {
      const { nodes, edges } = layoutModule(m)
      const layer = new Map(nodes.map((n) => [n.id, n.layer]))
      for (const u of m.units) for (const r of u.requires) if (layer.has(r)) expect(layer.get(r)!).toBeLessThan(layer.get(u.id)!)
      // Every edge passes through each layer between its ends exactly once.
      for (const e of edges) expect(e.points.map((p) => p.layer)).toEqual(Array.from({ length: e.points.length }, (_, i) => layer.get(e.from)! + i))
    }
  })

  it('status: recomendada quando os pré-requisitos estão feitos, nunca bloqueada', () => {
    const none = new Set<string>()
    expect(unitStatus('B.U0', none)).toBe('recomendada')
    expect(unitStatus('B.U7', none)).toBe('depois')
    const done = new Set(['B.U0', 'B.U1', 'B.U2', 'B.U3', 'B.U4'])
    expect(unitStatus('B.U6', done)).toBe('recomendada')
    expect(missingRequires('B.U7', done).map((u) => u.id)).toEqual(['B.U6'])
  })
})
