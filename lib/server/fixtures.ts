import 'server-only'
import type { DataProduct, Observation, SearchResponse } from '@/lib/astro/types'
import { classifyQuery } from '@/lib/astro/query'

// Offline fixtures used when AESO_MOCK=1 (development without network access
// to MAST/CDS, UI work, screenshots). Values approximate real M51 data.

const M51 = {
  id: 'M  51',
  displayName: 'Galáxia do Rodamoinho',
  ra: 202.4696292,
  dec: 47.1952583,
  otype: 'Sy2',
  typeLabel: 'Galáxia Seyfert 2',
  morphology: 'SA(s)bc pec',
  magnitudes: [
    { band: 'B', value: 9.26 },
    { band: 'V', value: 8.36 },
    { band: 'J', value: 6.4 },
    { band: 'K', value: 5.5 },
  ],
  redshift: 0.00154,
  radialVelocity: 463,
  distance: { value: 8.58, unit: 'Mpc', source: 'TRGB' },
  sizeArcmin: 13.71,
  aliases: ['NGC 5194', 'Whirlpool Galaxy', 'UGC 8493', 'Arp 85', 'VV 403', 'LEDA 47404', '2MASX J13295269+4711429', 'IRAS 13277+4727'],
  fov: 0.55,
  sources: ['Sesame/Simbad', 'SIMBAD'],
}

export function mockSearch(query: string): SearchResponse {
  const intent = classifyQuery(query)
  if (intent.kind === 'coordinates') {
    return {
      kind: 'object',
      query,
      object: { ...M51, id: 'Coordenadas', displayName: 'Coordenadas', ra: intent.coords.ra, dec: intent.coords.dec, typeLabel: 'Posição no céu', fov: 0.3, aliases: [], magnitudes: [], distance: undefined, otype: undefined, morphology: undefined, redshift: undefined, radialVelocity: undefined, sizeArcmin: undefined },
    }
  }
  if (intent.kind === 'characteristics') {
    return {
      kind: 'list',
      query,
      description: 'Galáxias espirais mais brilhantes que mag 10',
      filters: intent.filters,
      interpretedBy: 'rules',
      results: [
        { id: 'M  31', ra: 10.6847, dec: 41.2687, otype: 'G', typeLabel: 'Galáxia', morphology: 'SA(s)b', magnitude: 3.44, redshift: -0.001, sizeArcmin: 199.5 },
        { id: 'M  33', ra: 23.4621, dec: 30.66, otype: 'G', typeLabel: 'Galáxia', morphology: 'SA(s)cd', magnitude: 5.72, sizeArcmin: 70.8 },
        { id: 'M  81', ra: 148.888, dec: 69.065, otype: 'Sy2', typeLabel: 'Galáxia Seyfert 2', morphology: 'SA(s)ab', magnitude: 6.94, sizeArcmin: 26.9 },
        { id: 'M  83', ra: 204.2538, dec: -29.8657, otype: 'SBG', typeLabel: 'Galáxia starburst', morphology: 'SAB(s)c', magnitude: 7.54, sizeArcmin: 12.9 },
        { id: 'M  51', ra: 202.4696, dec: 47.1952, otype: 'Sy2', typeLabel: 'Galáxia Seyfert 2', morphology: 'SA(s)bc pec', magnitude: 8.36, sizeArcmin: 13.7 },
        { id: 'M 101', ra: 210.8023, dec: 54.3489, otype: 'G', typeLabel: 'Galáxia', morphology: 'SAB(rs)cd', magnitude: 7.86, sizeArcmin: 28.8 },
        { id: 'M  64', ra: 194.1821, dec: 21.6827, otype: 'Sy2', typeLabel: 'Galáxia Seyfert 2', morphology: '(R)SA(rs)ab', magnitude: 8.52, sizeArcmin: 10.7 },
        { id: 'NGC   253', ra: 11.888, dec: -25.2882, otype: 'SBG', typeLabel: 'Galáxia starburst', morphology: 'SAB(s)c', magnitude: 7.09, sizeArcmin: 27.5 },
      ],
    }
  }
  return { kind: 'object', query, object: M51, interpretedBy: 'rules' }
}

function box(ra: number, dec: number, w: number, angle = 0): string {
  const pts: number[] = []
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = (dx * w) / 2
    const y = (dy * w) / 2
    const a = (angle * Math.PI) / 180
    const rx = x * Math.cos(a) - y * Math.sin(a)
    const ry = x * Math.sin(a) + y * Math.cos(a)
    pts.push(ra + rx / Math.cos((dec * Math.PI) / 180), dec + ry)
  }
  return `POLYGON ICRS ${pts.map((p) => p.toFixed(6)).join(' ')}`
}

export function mockObservations(ra: number, dec: number): Observation[] {
  const rows: [string, string, string, string, number, number, number, number][] = [
    ['JWST', 'NIRCAM/IMAGE', 'F200W', 'image', 0.036, 15, 2023, 1783],
    ['JWST', 'MIRI/IMAGE', 'F770W', 'image', 0.025, 20, 2023, 3435],
    ['HST', 'ACS/WFC', 'F435W;F555W;F658N', 'image', 0.056, 0, 2005, 10452],
    ['HST', 'WFC3/UVIS', 'F275W', 'image', 0.044, 40, 2016, 13364],
    ['HST', 'STIS', 'G430L', 'spectrum', 0.004, 0, 2002, 9068],
    ['GALEX', 'GALEX', 'NUV', 'image', 1.2, 0, 2007, 0],
    ['TESS', 'Photometer', 'TESS', 'timeseries', 0.2, 0, 2019, 0],
    ['SWIFT', 'UVOT', 'UVW2', 'image', 0.28, 10, 2011, 0],
  ]
  return rows.map(([collection, instrument, filters, productType, w, angle, year, proposal], i) => ({
    obsid: String(24000000 + i),
    collection,
    instrument,
    filters,
    target: 'M51',
    productType,
    date: new Date(Date.UTC(year, i, 3 + i)).toISOString(),
    exposure: 600 + i * 420,
    proposalId: proposal ? String(proposal) : undefined,
    ra: ra + (i - 4) * 0.004,
    dec: dec + (i % 3) * 0.003,
    region: box(ra + (i - 4) * 0.004, dec + (i % 3) * 0.003, w, angle),
    isPublic: i !== 1,
    calibLevel: 3,
    wavelengthRegion: collection === 'JWST' ? 'INFRARED' : collection === 'GALEX' || collection === 'SWIFT' ? 'UV' : 'OPTICAL',
  }))
}

export function mockProducts(obsid: string): DataProduct[] {
  const base = `mast:HST/product/jmock${obsid}`
  return [
    ['drz.fits', 'SCIENCE', 'DADS DRZ file - calibrated combined image', 3, 168_000_000],
    ['flt.fits', 'SCIENCE', 'DADS FLT file - calibrated exposure', 2, 168_000_000],
    ['raw.fits', 'SCIENCE', 'DADS RAW file - raw exposure', 1, 33_000_000],
    ['drz.jpg', 'PREVIEW', 'Preview image', 3, 420_000],
    ['asn.fits', 'AUXILIARY', 'Association file', 1, 17_000],
  ].map(([suffix, productType, description, calibLevel, size]) => ({
    id: `${obsid}:${suffix}`,
    filename: `jmock${obsid}_${suffix}`,
    uri: `${base}_${suffix}`,
    downloadUrl: `https://mast.stsci.edu/api/v0.1/Download/file?uri=${encodeURIComponent(`${base}_${suffix}`)}`,
    size: size as number,
    productType: productType as string,
    description: description as string,
    calibLevel: calibLevel as number,
    isPublic: true,
  }))
}
