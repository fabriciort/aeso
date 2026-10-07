import { describe, expect, it } from 'vitest'
import { parseCoordinates, formatRA, formatDec } from '@/lib/astro/coords'
import { classifyQuery, parseCharacteristics } from '@/lib/astro/query'
import { buildCharacteristicsAdql } from '@/lib/astro/adql'
import { lookupFamous, suggest } from '@/lib/astro/catalog'

describe('coordinates', () => {
  it('parses decimal degrees', () => {
    expect(parseCoordinates('202.47 47.19')).toEqual({ ra: 202.47, dec: 47.19 })
    expect(parseCoordinates('10,6847, +41,2687')).toEqual({ ra: 10.6847, dec: 41.2687 }) // decimal comma (pt-BR)
    expect(parseCoordinates('10.6847, -41.2687')).toEqual({ ra: 10.6847, dec: -41.2687 })
  })
  it('parses sexagesimal', () => {
    const c = parseCoordinates('13h29m52.7s +47d11m43s')!
    expect(c.ra).toBeCloseTo(202.4696, 3)
    expect(c.dec).toBeCloseTo(47.1953, 3)
    const d = parseCoordinates('05:35:17.3 -05:23:28')!
    expect(d.ra).toBeCloseTo(83.822, 2)
    expect(d.dec).toBeCloseTo(-5.391, 2)
  })
  it('rejects non-coordinates', () => {
    expect(parseCoordinates('M51')).toBeNull()
    expect(parseCoordinates('NGC 1300')).toBeNull()
    expect(parseCoordinates('400 10')).toBeNull()
  })
  it('formats', () => {
    expect(formatRA(202.4696292)).toBe('13h 29m 52.71s')
    expect(formatDec(-5.391111)).toBe('−05° 23′ 28.0″')
  })
})

describe('classifyQuery', () => {
  it('identifiers', () => {
    expect(classifyQuery('M51')).toEqual({ kind: 'identifier', identifier: 'M51' })
    expect(classifyQuery('NGC 1300')).toEqual({ kind: 'identifier', identifier: 'NGC 1300' })
    expect(classifyQuery('HD 209458')).toMatchObject({ kind: 'identifier' })
    expect(classifyQuery('Betelgeuse')).toMatchObject({ kind: 'identifier', identifier: 'Betelgeuse' })
  })
  it('popular names map to catalog ids', () => {
    expect(classifyQuery('pilares da criação')).toEqual({ kind: 'identifier', identifier: 'M16' })
    expect(classifyQuery('Galáxia de Andrômeda')).toEqual({ kind: 'identifier', identifier: 'M31' })
  })
  it('coordinates', () => {
    expect(classifyQuery('202.47 +47.19').kind).toBe('coordinates')
  })
  it('characteristics', () => {
    const r = classifyQuery('galáxias espirais mais brilhantes que 10')
    expect(r).toMatchObject({ kind: 'characteristics', recognized: true, filters: { otype: 'G..', morphology: 'S%', magMax: 10, sort: 'brightness' } })
    expect(classifyQuery('messier')).toMatchObject({ kind: 'characteristics', filters: { catalog: 'M' } })
  })
})

describe('parseCharacteristics', () => {
  it('handles proximity and radius', () => {
    const { filters } = parseCharacteristics('nebulosas planetárias perto de M27 num raio de 30 arcmin')
    expect(filters).toMatchObject({ otype: 'PN', near: 'm27', radiusDeg: 0.5 })
  })
  it('handles english and magnitude ranges', () => {
    expect(parseCharacteristics('globular clusters with magnitude between 8 and 5').filters).toMatchObject({ otype: 'GlC', magMin: 5, magMax: 8 })
  })
  it('spectral types', () => {
    expect(parseCharacteristics('estrelas tipo M brilhantes').filters).toMatchObject({ otype: '*..', spectralType: 'M' })
  })
  it('redshift', () => {
    expect(parseCharacteristics('quasares com z > 6').filters).toMatchObject({ otype: 'QSO..', redshiftMin: 6 })
  })
})

describe('ADQL', () => {
  it('escapes and bounds values', () => {
    const adql = buildCharacteristicsAdql({ otype: "G'; DROP", catalog: 'NGC', magMax: 10, limit: 9999 })
    expect(adql).not.toContain('DROP')
    expect(adql).toContain("id LIKE 'NGC %'")
    expect(adql).toContain('SELECT TOP 200')
    expect(adql).toContain('f.V <= 10')
  })
  it('cone search', () => {
    const adql = buildCharacteristicsAdql({ otype: 'PN', nearCoords: { ra: 299.9, dec: 22.7 }, radiusDeg: 2 })
    expect(adql).toContain("CIRCLE('ICRS', 299.9, 22.7, 2)")
  })
})

describe('catalog', () => {
  it('suggests', () => {
    expect(suggest('andro')[0].id).toBe('M31')
    expect(suggest('m5').map((s) => s.id)).toContain('M51')
    expect(lookupFamous('m 51')?.id).toBe('M51')
  })
})

describe('operators', () => {
  it('mag < N', () => {
    expect(parseCharacteristics('galaxias mag < 9,5').filters).toMatchObject({ otype: 'G..', magMax: 9.5 })
  })
})
