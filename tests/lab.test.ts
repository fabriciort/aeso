import { describe, expect, it } from 'vitest'
import { readTableColumns } from '@/lib/astro/fits'
import { centralDepth, durationFraction, overlapArea, transitFlux } from '@/lib/astro/transit'
import { bestRadiusRatio, phaseOf } from '@/lib/astro/lightcurve'
import { EXOPLANETA } from '@/lib/labs/catalog'

// --- Build a tiny FITS file: empty primary HDU + BINTABLE (TIME D, FLUX E, QUALITY J)
function card(s: string) {
  return s.padEnd(80, ' ').slice(0, 80)
}
function header(cards: string[]) {
  const text = [...cards.map(card), card('END')].join('')
  return text.padEnd(Math.ceil(text.length / 2880) * 2880, ' ')
}
function makeFits(rows: [number, number, number][]): ArrayBuffer {
  const primary = header(['SIMPLE  =                    T', 'BITPIX  =                    8', 'NAXIS   =                    0', 'EXTEND  =                    T'])
  const rowBytes = 8 + 4 + 4
  const ext = header([
    "XTENSION= 'BINTABLE'",
    'BITPIX  =                    8',
    'NAXIS   =                    2',
    `NAXIS1  = ${String(rowBytes).padStart(20)}`,
    `NAXIS2  = ${String(rows.length).padStart(20)}`,
    'PCOUNT  =                    0',
    'GCOUNT  =                    1',
    'TFIELDS =                    3',
    "TTYPE1  = 'TIME    '",
    "TFORM1  = 'D       '",
    "TTYPE2  = 'PDCSAP_FLUX'",
    "TFORM2  = 'E       '",
    "TTYPE3  = 'QUALITY '",
    "TFORM3  = 'J       '",
    'SECTOR  =                    7',
  ])
  const dataLen = Math.ceil((rowBytes * rows.length) / 2880) * 2880
  const buf = new ArrayBuffer(primary.length + ext.length + dataLen)
  const bytes = new Uint8Array(buf)
  let o = 0
  for (const ch of primary + ext) bytes[o++] = ch.charCodeAt(0)
  const v = new DataView(buf)
  rows.forEach(([t, f, q], i) => {
    const p = o + i * rowBytes
    v.setFloat64(p, t, false)
    v.setFloat32(p + 8, f, false)
    v.setInt32(p + 12, q, false)
  })
  return buf
}

describe('FITS', () => {
  it('reads BINTABLE columns and header', () => {
    const buf = makeFits([
      [1.5, 100, 0],
      [1.6, NaN, 0],
      [1.7, 99.5, 128],
    ])
    const cols = readTableColumns(buf, ['TIME', 'PDCSAP_FLUX', 'QUALITY'])
    expect(Array.from(cols.TIME)).toEqual([1.5, 1.6, 1.7])
    expect(cols.PDCSAP_FLUX[0]).toBeCloseTo(100)
    expect(Number.isNaN(cols.PDCSAP_FLUX[1])).toBe(true)
    expect(cols.QUALITY[2]).toBe(128)
    expect(cols.header.SECTOR).toBe(7)
  })
  it('rejects non-FITS', () => {
    expect(() => readTableColumns(new ArrayBuffer(2880), ['TIME'])).toThrow()
  })
})

describe('transit physics', () => {
  it('overlap area limits', () => {
    expect(overlapArea(0.1, 0)).toBeCloseTo(Math.PI * 0.01)
    expect(overlapArea(0.1, 2)).toBe(0)
    const half = overlapArea(0.1, 1)
    expect(half).toBeGreaterThan(0)
    expect(half).toBeLessThan(Math.PI * 0.01)
  })
  it('depth ≈ k² (Jupiter/Sun ≈ 1 %)', () => {
    const noLd = { u1: 0, u2: 0 }
    expect(centralDepth(0.1, 0, noLd)).toBeCloseTo(0.01, 5)
    expect(centralDepth(0.2, 0, noLd) / centralDepth(0.1, 0, noLd)).toBeCloseTo(4, 3)
    // limb darkening deepens the centre of the transit
    expect(centralDepth(0.1)).toBeGreaterThan(0.01)
    expect(transitFlux(0.1, 5)).toBe(1)
  })
  it('WASP-121 b duration ≈ 2,9 h', () => {
    const t = EXOPLANETA.target!
    const hours = durationFraction(t.radiusRatio, { aR: t.aR, b: t.impact }) * t.period * 24
    expect(hours).toBeGreaterThan(2.6)
    expect(hours).toBeLessThan(3.2)
  })
})

describe('fitting', () => {
  it('recovers the radius ratio from a noiseless folded curve', () => {
    const t = EXOPLANETA.target!
    const g = { aR: t.aR, b: t.impact }
    const data = []
    for (let h = -4; h <= 4; h += 0.05) {
      const ph = h / 24 / t.period
      const ang = 2 * Math.PI * ph
      const z = Math.hypot(t.aR * Math.sin(ang), t.impact * Math.cos(ang))
      data.push({ h, f: transitFlux(0.1245, z, t.limbDarkening) })
    }
    expect(bestRadiusRatio(data, t.period, g, t.limbDarkening)).toBeCloseTo(0.1245, 3)
  })
  it('phase wraps to [-0.5, 0.5)', () => {
    expect(phaseOf(10, 1, 0)).toBeCloseTo(0)
    expect(phaseOf(10.25, 1, 0)).toBeCloseTo(0.25)
    expect(phaseOf(9.75, 1, 0)).toBeCloseTo(-0.25)
  })
})

describe('pipeline (simulated TESS sector)', async () => {
  const { simulatedLightCurve } = await import('@/lib/server/tess')
  it('finds the transit and recovers k within 4 %', () => {
    const lc = simulatedLightCurve(EXOPLANETA.target!)
    expect(lc.source).toBe('simulado')
    expect(lc.series.length).toBeGreaterThan(500)
    expect(Math.abs(lc.fitRadiusRatio - 0.1245) / 0.1245).toBeLessThan(0.04)
    // folded minimum sits at mid-transit
    const min = lc.foldedBinned.reduce((a, b) => (b.f < a.f ? b : a))
    expect(Math.abs(min.h)).toBeLessThan(0.5)
    expect(lc.noisePpm).toBeGreaterThan(600)
    expect(lc.noisePpm).toBeLessThan(1200)
  })
})
