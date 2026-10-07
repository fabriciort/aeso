import 'server-only'
import { buildAliasesAdql, buildCharacteristicsAdql, buildDistanceAdql, buildObjectAdql } from '@/lib/astro/adql'
import { formatRA, formatDec } from '@/lib/astro/coords'
import { lookupFamous } from '@/lib/astro/catalog'
import { otypeFamily, otypeLabel } from '@/lib/astro/otypes'
import { classifyQuery, describeFilters, parseCharacteristics } from '@/lib/astro/query'
import type { AstroObject, Measurement, ObjectListItem, SearchFilters, SearchResponse } from '@/lib/astro/types'
import { UpstreamError } from './http'
import { claudeEnabled, interpretWithClaude, toFilters } from './interpret'
import { mastNameLookup } from './mast'
import { sesame, simbadTap, type Row } from './simbad'

const SPEED_OF_LIGHT = 299792.458 // km/s
const H0 = 70 // km/s/Mpc

const numOrUndef = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : undefined
}

function clean(id: string): string {
  return id.replace(/\s+/g, ' ').trim()
}

function defaultFov(otype?: string, sizeArcmin?: number): number {
  if (sizeArcmin && sizeArcmin > 0) return Math.min(Math.max((sizeArcmin * 2.4) / 60, 0.04), 12)
  switch (otypeFamily(otype)) {
    case 'galaxy':
      return 0.2
    case 'nebula':
      return 0.4
    case 'cluster':
      return 0.35
    case 'star':
    case 'compact':
      return 0.08
    default:
      return 0.25
  }
}

function pickDistance(rows: Row[], parallax?: number, redshift?: number): Measurement | undefined {
  const measured = rows.find((r) => numOrUndef(r.dist) && r.unit)
  if (measured) {
    return { value: Number(measured.dist), unit: String(measured.unit).trim(), source: String(measured.method ?? 'SIMBAD').trim() || 'SIMBAD' }
  }
  if (parallax && parallax > 0.05) return { value: 1000 / parallax, unit: 'pc', source: 'paralaxe' }
  if (redshift && redshift > 0.003 && redshift < 0.5) {
    return { value: (SPEED_OF_LIGHT * redshift) / H0, unit: 'Mpc', source: 'redshift (H₀ = 70)', approximate: true }
  }
  return undefined
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch {
    return fallback
  }
}

/** Resolves a name/identifier into a fully described object. */
export async function resolveObject(identifier: string, displayName = identifier): Promise<AstroObject | null> {
  const sources: string[] = []
  const ses = await safe(sesame(identifier), null)
  let ra = ses?.ra
  let dec = ses?.dec
  let mainId = ses?.name ? clean(ses.name) : undefined
  if (ses) sources.push(`Sesame/${ses.resolver}`)

  if (ra === undefined || dec === undefined) {
    const mast = await safe(mastNameLookup(identifier), null)
    if (!mast) return null
    ra = mast.ra
    dec = mast.dec
    mainId ??= mast.name
    sources.push('MAST Name Lookup')
  }

  // Rich details from SIMBAD TAP (sizes, fluxes, distances, aliases).
  const lookupId = mainId ?? identifier
  const [rows, aliasRows, distRows] = await Promise.all([
    safe(simbadTap(buildObjectAdql(lookupId), 12000), [] as Row[]),
    safe(simbadTap(buildAliasesAdql(lookupId), 12000), [] as Row[]),
    safe(simbadTap(buildDistanceAdql(lookupId), 12000), [] as Row[]),
  ])
  const row = rows[0]
  if (row) sources.push('SIMBAD')

  const otype = (row?.otype as string | undefined)?.trim() || ses?.otype
  const redshift = numOrUndef(row?.rvz_redshift) ?? ses?.redshift
  const parallax = numOrUndef(row?.plx_value) ?? ses?.parallax
  const sizeArcmin = numOrUndef(row?.galdim_majaxis)

  const magnitudes: { band: string; value: number }[] = []
  for (const band of ['U', 'B', 'V', 'G', 'R', 'I', 'J', 'H', 'K']) {
    const v = numOrUndef(row?.[band])
    if (v !== undefined) magnitudes.push({ band, value: v })
  }
  if (!magnitudes.length && ses?.vmag !== undefined) magnitudes.push({ band: 'V', value: ses.vmag })

  const aliasSet = new Set<string>([...aliasRows.map((r) => clean(String(r.id))), ...(ses?.aliases ?? []).map(clean)])
  const id = clean(String(row?.main_id ?? mainId ?? identifier))
  aliasSet.delete(id)

  const famous = lookupFamous(displayName) ?? lookupFamous(identifier)
  return {
    id,
    displayName: famous ? famous.names[0] : displayName,
    ra: numOrUndef(row?.ra) ?? ra,
    dec: numOrUndef(row?.dec) ?? dec,
    otype,
    typeLabel: otypeLabel(otype) ?? famous?.type,
    morphology: ((row?.morph_type as string | undefined) ?? ses?.morphology)?.trim() || undefined,
    spectralType: ((row?.sp_type as string | undefined) ?? ses?.spectralType)?.trim() || undefined,
    magnitudes,
    redshift,
    radialVelocity: numOrUndef(row?.rvz_radvel) ?? ses?.radialVelocity,
    parallax,
    distance: pickDistance(distRows, parallax, redshift),
    sizeArcmin,
    aliases: Array.from(aliasSet).slice(0, 24),
    fov: defaultFov(otype, sizeArcmin),
    sources,
  }
}

function coordinateObject(ra: number, dec: number, query: string): AstroObject {
  return {
    id: `${formatRA(ra)} ${formatDec(dec)}`,
    displayName: 'Coordenadas',
    ra,
    dec,
    typeLabel: 'Posição no céu',
    fov: 0.3,
    aliases: [],
    sources: [`entrada: ${query}`],
  }
}

async function runCharacteristics(query: string, filters: SearchFilters, interpretedBy: 'rules' | 'claude'): Promise<SearchResponse> {
  const f = { ...filters }
  if (f.near && !f.nearCoords) {
    const ref = await resolveObject(f.near)
    if (!ref) return { kind: 'empty', query, message: `Não encontrei "${f.near}" para usar como referência.` }
    f.nearCoords = { ra: ref.ra, dec: ref.dec }
    f.near = ref.displayName !== ref.id ? ref.displayName : ref.id
  }
  const rows = await simbadTap(buildCharacteristicsAdql(f))
  const results: ObjectListItem[] = rows.map((r) => ({
    id: clean(String(r.main_id)),
    ra: Number(r.ra),
    dec: Number(r.dec),
    otype: (r.otype as string | null)?.trim() || undefined,
    typeLabel: otypeLabel(r.otype as string | null),
    morphology: (r.morph_type as string | null)?.trim() || undefined,
    spectralType: (r.sp_type as string | null)?.trim() || undefined,
    magnitude: numOrUndef(r.V),
    redshift: numOrUndef(r.rvz_redshift),
    sizeArcmin: numOrUndef(r.galdim_majaxis),
  }))
  const typeLabel = f.otype ? pluralLabel(f) : undefined
  const description = describeFilters(f, typeLabel)
  if (!results.length) {
    return { kind: 'empty', query, message: 'Nenhum objeto atende a esses critérios.', hint: description }
  }
  return { kind: 'list', query, description, filters: f, results, interpretedBy }
}

const PLURALS: Record<string, string> = {
  G: 'Galáxias', ClG: 'Aglomerados de galáxias', GrG: 'Grupos de galáxias', SyG: 'Galáxias Seyfert',
  SBG: 'Galáxias starburst', rG: 'Radiogaláxias', AGN: 'Núcleos galácticos ativos', QSO: 'Quasares',
  Bla: 'Blazares', PN: 'Nebulosas planetárias', DNe: 'Nebulosas escuras', RNe: 'Nebulosas de reflexão',
  HII: 'Regiões H II', SNR: 'Remanescentes de supernova', SN: 'Supernovas', ISM: 'Nebulosas e nuvens',
  GlC: 'Aglomerados globulares', OpC: 'Aglomerados abertos', 'Cl*': 'Aglomerados estelares', Pl: 'Exoplanetas',
  'WD*': 'Anãs brancas', 'BD*': 'Anãs marrons', 'N*': 'Estrelas de nêutrons', Psr: 'Pulsares', BH: 'Buracos negros',
  'Ce*': 'Cefeidas', 'RG*': 'Gigantes vermelhas', 'V*': 'Estrelas variáveis', '**': 'Estrelas duplas e múltiplas',
  'Y*O': 'Objetos estelares jovens', '*': 'Estrelas',
}

const MORPH: [string, string][] = [['SB', ' espirais barradas'], ['S0', ' lenticulares'], ['S', ' espirais'], ['E', ' elípticas'], ['I', ' irregulares']]

function pluralLabel(f: SearchFilters): string {
  const code = f.otype?.replace(/\.\.$/, '') ?? ''
  const base = PLURALS[code] ?? `Objetos do tipo ${otypeLabel(code) ?? code}`
  const morph = f.morphology ? (MORPH.find(([p]) => f.morphology!.startsWith(p))?.[1] ?? '') : ''
  return base + morph
}

export async function search(query: string): Promise<SearchResponse> {
  const q = query.trim().slice(0, 300)
  if (!q) return { kind: 'empty', query: q, message: 'Digite algo para buscar.' }

  try {
    const intent = classifyQuery(q)

    if (intent.kind === 'coordinates') {
      return { kind: 'object', query: q, object: coordinateObject(intent.coords.ra, intent.coords.dec, q) }
    }

    if (intent.kind === 'identifier') {
      const obj = await resolveObject(intent.identifier, q)
      if (obj) return { kind: 'object', query: q, object: obj, interpretedBy: 'rules' }
    }

    if (intent.kind === 'characteristics' && intent.recognized && !claudeEnabled()) {
      return await runCharacteristics(q, intent.filters, 'rules')
    }

    // Free-form or unresolved: ask Claude when available.
    const ai = await interpretWithClaude(q)
    if (ai?.intent === 'object' && ai.objectName) {
      const obj = await resolveObject(ai.objectName, q)
      if (obj) return { kind: 'object', query: q, object: obj, interpretedBy: 'claude' }
    }
    if (ai?.intent === 'search') {
      return await runCharacteristics(q, toFilters(ai), 'claude')
    }

    if (intent.kind === 'characteristics' && intent.recognized) {
      return await runCharacteristics(q, intent.filters, 'rules')
    }

    const partial = parseCharacteristics(q)
    return {
      kind: 'empty',
      query: q,
      message: `Não encontrei "${q}".`,
      hint: partial.recognized
        ? undefined
        : 'Tente um identificador (M51, NGC 1300, HD 209458), coordenadas (202.47 +47.19) ou características ("galáxias espirais mais brilhantes que 10").',
    }
  } catch (err) {
    const message =
      err instanceof UpstreamError ? `${err.message}. Tente novamente em instantes.` : 'Algo deu errado ao processar a busca.'
    console.error('[search]', err)
    return { kind: 'error', query: q, message }
  }
}
