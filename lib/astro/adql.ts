// Builds SIMBAD TAP (ADQL) queries from structured filters. All values that
// reach the SQL are validated/escaped here, never interpolated raw.

import type { SearchFilters } from './types'

const OTYPE_RE = /^[A-Za-z0-9*?+\-_]{1,12}(\.\.)?$/
const LIKE_RE = /^[A-Za-z0-9.+\-%]{1,12}$/
const CATALOG_RE = /^[A-Za-z0-9]{1,8}$/

function str(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

function finite(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

export const DEFAULT_LIMIT = 60
export const MAX_LIMIT = 200

export function buildCharacteristicsAdql(f: SearchFilters): string {
  const where: string[] = ['b.ra IS NOT NULL', 'b.dec IS NOT NULL']

  if (f.otype && OTYPE_RE.test(f.otype)) where.push(`b.otype = ${str(f.otype)}`)
  if (f.morphology && LIKE_RE.test(f.morphology)) where.push(`b.morph_type LIKE ${str(f.morphology)}`)
  if (f.spectralType && LIKE_RE.test(f.spectralType)) where.push(`b.sp_type LIKE ${str(f.spectralType + '%')}`)
  if (f.catalog && CATALOG_RE.test(f.catalog)) {
    where.push(`b.oid IN (SELECT oidref FROM ident WHERE id LIKE ${str(f.catalog + ' %')})`)
  }
  if (finite(f.magMax)) where.push(`f.V <= ${f.magMax}`)
  if (finite(f.magMin)) where.push(`f.V >= ${f.magMin}`)
  if (finite(f.redshiftMax)) where.push(`b.rvz_redshift <= ${f.redshiftMax}`)
  if (finite(f.redshiftMin)) where.push(`b.rvz_redshift >= ${f.redshiftMin}`)
  if (f.nearCoords && finite(f.nearCoords.ra) && finite(f.nearCoords.dec)) {
    const r = finite(f.radiusDeg) ? Math.min(Math.max(f.radiusDeg, 0.01), 30) : 1
    where.push(
      `CONTAINS(POINT('ICRS', b.ra, b.dec), CIRCLE('ICRS', ${f.nearCoords.ra}, ${f.nearCoords.dec}, ${r})) = 1`,
    )
  }

  let order = 'f.V ASC'
  if (f.sort === 'size') {
    where.push('b.galdim_majaxis IS NOT NULL')
    order = 'b.galdim_majaxis DESC'
  } else if (f.sort === 'redshift') {
    where.push('b.rvz_redshift IS NOT NULL')
    order = 'b.rvz_redshift DESC'
  } else {
    // Brightness is the default ordering; objects without V magnitude would
    // otherwise float to the top.
    where.push('f.V IS NOT NULL')
  }

  const limit = Math.min(Math.max(Math.round(f.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT)

  return [
    `SELECT TOP ${limit} b.main_id, b.ra, b.dec, b.otype, b.morph_type, b.sp_type,`,
    `  b.rvz_redshift, b.galdim_majaxis, f.V`,
    `FROM basic AS b LEFT JOIN allfluxes AS f ON f.oidref = b.oid`,
    `WHERE ${where.join('\n  AND ')}`,
    `ORDER BY ${order}`,
  ].join('\n')
}

/** Details for a single object, looked up by SIMBAD identifier. */
export function buildObjectAdql(identifier: string): string {
  return [
    'SELECT TOP 1 b.main_id, b.ra, b.dec, b.otype, b.morph_type, b.sp_type, b.rvz_redshift,',
    '  b.rvz_radvel, b.plx_value, b.galdim_majaxis, b.galdim_minaxis, f.U, f.B, f.V, f.R, f.I, f.J, f.H, f.K, f.G',
    'FROM basic AS b LEFT JOIN allfluxes AS f ON f.oidref = b.oid',
    `WHERE b.oid IN (SELECT oidref FROM ident WHERE id = ${str(identifier)})`,
  ].join('\n')
}

export function buildAliasesAdql(mainId: string): string {
  return [
    'SELECT TOP 40 i.id FROM ident AS i',
    `WHERE i.oidref IN (SELECT oidref FROM ident WHERE id = ${str(mainId)})`,
  ].join('\n')
}

export function buildDistanceAdql(mainId: string): string {
  return [
    'SELECT TOP 5 d.dist, d.unit, d.minus_err, d.plus_err, d.method FROM mesDistance AS d',
    `WHERE d.oidref IN (SELECT oidref FROM ident WHERE id = ${str(mainId)})`,
    'ORDER BY d.bibcode DESC',
  ].join('\n')
}

/** Nearest catalogued object to a position (distance in degrees). */
export function buildNearestAdql(ra: number, dec: number, radiusDeg: number): string {
  if (![ra, dec, radiusDeg].every(Number.isFinite)) throw new Error('coordenadas inválidas')
  return [
    `SELECT TOP 1 b.main_id, b.ra, b.dec, b.otype,`,
    `  DISTANCE(POINT('ICRS', b.ra, b.dec), POINT('ICRS', ${ra}, ${dec})) AS dist`,
    'FROM basic AS b',
    `WHERE CONTAINS(POINT('ICRS', b.ra, b.dec), CIRCLE('ICRS', ${ra}, ${dec}, ${radiusDeg})) = 1`,
    'ORDER BY dist ASC',
  ].join('\n')
}
