// Visual identity of each MAST collection (footprints, chips, legends).
const COLORS: Record<string, string> = {
  JWST: '#f6b74e',
  HST: '#5eb0ff',
  HLA: '#5eb0ff',
  HLSP: '#7dd3fc',
  GALEX: '#b993ff',
  TESS: '#ff7eb6',
  KEPLER: '#ff9f6e',
  K2: '#ff9f6e',
  SWIFT: '#46d9c6',
  IUE: '#c7a4ff',
  FUSE: '#d8b4fe',
  PS1: '#9be38b',
  SPITZER_SHA: '#ff6b6b',
  EUVE: '#a5b4fc',
}

export function missionColor(collection: string): string {
  return COLORS[collection.toUpperCase()] ?? '#a4adbd'
}

const ORDER = ['JWST', 'HST', 'HLSP', 'GALEX', 'TESS', 'SWIFT', 'KEPLER', 'K2', 'PS1', 'IUE', 'FUSE']

export function missionRank(collection: string): number {
  const i = ORDER.indexOf(collection.toUpperCase())
  return i === -1 ? ORDER.length : i
}
