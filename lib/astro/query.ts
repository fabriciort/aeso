// Understands what the user typed in the search bar.
//
//   "M51", "NGC 1300", "HD 209458"            → identifier
//   "202.47 +47.19", "13h29m52s +47d11m43s"   → coordinates
//   "galáxias espirais mais brilhantes que 10" → characteristic search
//
// The characteristic parser is rule-based (pt-BR and English) and produces a
// SearchFilters object; the server can optionally refine it with Claude.

import { parseCoordinates, type Coordinates } from './coords'
import { lookupFamous, normalize } from './catalog'
import type { SearchFilters } from './types'

export type QueryIntent =
  | { kind: 'coordinates'; coords: Coordinates }
  | { kind: 'identifier'; identifier: string }
  | { kind: 'characteristics'; filters: SearchFilters; recognized: boolean }

// Order matters: more specific phrases first.
const TYPE_RULES: { re: RegExp; otype: string; morphology?: string }[] = [
  { re: /aglomerados? de galaxias|galaxy clusters?|clusters? of galaxies/, otype: 'ClG' },
  { re: /grupos? (compactos? )?de galaxias|galaxy groups?/, otype: 'GrG' },
  { re: /galaxias? espira(l|is) barrad[ao]s?|barred spiral/, otype: 'G..', morphology: 'SB%' },
  { re: /galaxias? espira(l|is)|spiral galax/, otype: 'G..', morphology: 'S%' },
  { re: /galaxias? elipticas?|elliptical galax/, otype: 'G..', morphology: 'E%' },
  { re: /galaxias? lenticular(es)?|lenticular galax/, otype: 'G..', morphology: 'S0%' },
  { re: /galaxias? irregular(es)?|irregular galax/, otype: 'G..', morphology: 'I%' },
  { re: /galaxias? seyfert|seyfert/, otype: 'SyG..' },
  { re: /galaxias? starburst|starburst/, otype: 'SBG' },
  { re: /radiogalaxias?|radio galax/, otype: 'rG' },
  { re: /nucleos? galacticos? ativos?|agns?\b|active galactic/, otype: 'AGN..' },
  { re: /quasar(es|s)?|qsos?\b/, otype: 'QSO..' },
  { re: /blazar(es|s)?/, otype: 'Bla..' },
  { re: /galaxias?|galax(y|ies)/, otype: 'G..' },
  { re: /nebulosas? planetarias?|planetary nebula/, otype: 'PN' },
  { re: /nebulosas? escuras?|dark nebula/, otype: 'DNe' },
  { re: /nebulosas? de reflexao|reflection nebula/, otype: 'RNe' },
  { re: /regio(es|ao) h ?ii|h ?ii regions?/, otype: 'HII' },
  { re: /remanescentes? de supernovas?|supernova remnants?|snrs?\b/, otype: 'SNR' },
  { re: /supernovas?/, otype: 'SN..' },
  { re: /nebulosas?|nebula/, otype: 'ISM..' },
  { re: /aglomerados? globular(es)?|globular clusters?/, otype: 'GlC' },
  { re: /aglomerados? abertos?|open clusters?/, otype: 'OpC' },
  { re: /aglomerados? (estelar(es)?|de estrelas)|star clusters?|aglomerados?/, otype: 'Cl*..' },
  { re: /exoplanetas?|planetas? extrassolares?|exoplanets?/, otype: 'Pl..' },
  { re: /anas? brancas?|white dwarfs?/, otype: 'WD*..' },
  { re: /anas? marro(m|ns)|brown dwarfs?/, otype: 'BD*..' },
  { re: /estrelas? de neutrons?|neutron stars?/, otype: 'N*..' },
  { re: /pulsar(es|s)?/, otype: 'Psr' },
  { re: /buracos? negros?|black holes?/, otype: 'BH' },
  { re: /cefeidas?|cepheids?/, otype: 'Ce*..' },
  { re: /gigantes? vermelhas?|red giants?/, otype: 'RG*' },
  { re: /estrelas? variave(l|is)|variable stars?/, otype: 'V*..' },
  { re: /estrelas? (duplas?|binarias?)|binar(y|ies)|double stars?/, otype: '**..' },
  { re: /estrelas? jove(m|ns)|young stars?|young stellar/, otype: 'Y*O..' },
  { re: /estrelas?|stars?/, otype: '*..' },
]

const CATALOG_RULES: { re: RegExp; prefix: string }[] = [
  { re: /\bmessier\b|catalogo m\b/, prefix: 'M' },
  { re: /\bngc\b/, prefix: 'NGC' },
  { re: /\bic\b(?! ?\d)/, prefix: 'IC' },
  { re: /\bcaldwell\b/, prefix: 'C' },
  { re: /\bhenry draper\b|\bhd\b(?! ?\d)/, prefix: 'HD' },
  { re: /\bhipparcos\b|\bhip\b(?! ?\d)/, prefix: 'HIP' },
  { re: /\babell\b(?! ?\d)/, prefix: 'ACO' },
]

const NUMBER = String.raw`(\d+(?:[.,]\d+)?)`

function n(s: string): number {
  return parseFloat(s.replace(',', '.'))
}

/** Parses a characteristic query into structured filters. */
export function parseCharacteristics(input: string): { filters: SearchFilters; recognized: boolean } {
  const q = normalize(input)
  const filters: SearchFilters = {}
  let recognized = false

  for (const rule of TYPE_RULES) {
    if (rule.re.test(q)) {
      filters.otype = rule.otype
      if (rule.morphology) filters.morphology = rule.morphology
      recognized = true
      break
    }
  }

  for (const rule of CATALOG_RULES) {
    if (rule.re.test(q)) {
      filters.catalog = rule.prefix
      recognized = true
      break
    }
  }

  // Spectral class: "tipo espectral G2", "estrelas tipo M", "spectral type K"
  const sp = /(?:tipo espectral|classe espectral|spectral (?:type|class)|estrelas? (?:do )?tipo|stars? of type|type)\s+([obafgkm])(\d(?:\.\d)?)?\b/.exec(q)
  if (sp) {
    filters.spectralType = sp[1].toUpperCase() + (sp[2] ?? '')
    if (!filters.otype) filters.otype = '*..'
    recognized = true
  }

  // Magnitude: "mais brilhantes que 9", "brighter than 9", "mag < 10", "magnitude menor que 8",
  // "magnitude entre 5 e 8"
  const between = new RegExp(`mag(?:nitude)?s?\\s*(?:entre|between)\\s*${NUMBER}\\s*(?:e|and|-|a)\\s*${NUMBER}`).exec(q)
  const brighter = new RegExp(`(?:mais brilhantes? (?:que|do que)|brighter than|mag(?:nitude)?s?\\s*(?:<=?|menor(?:es)? (?:que|do que)|abaixo de|ate|up to|below|less than))\\s*(?:mag(?:nitude)?\\s*)?${NUMBER}`).exec(q)
  const fainter = new RegExp(`(?:mais fracas? (?:que|do que)|fainter than|mag(?:nitude)?s?\\s*(?:>=?|maior(?:es)? (?:que|do que)|acima de|above|greater than))\\s*(?:mag(?:nitude)?\\s*)?${NUMBER}`).exec(q)
  if (between) {
    const [a, b] = [n(between[1]), n(between[2])].sort((x, y) => x - y)
    filters.magMin = a
    filters.magMax = b
    recognized = true
  } else {
    if (brighter) {
      filters.magMax = n(brighter[1])
      recognized = true
    }
    if (fainter) {
      filters.magMin = n(fainter[1])
      recognized = true
    }
  }

  // Redshift: "z < 0.01", "redshift maior que 2"
  const zMax = new RegExp(`(?:\\bz|redshift)\\s*(?:<=?|menor (?:que|do que)|abaixo de|below|less than)\\s*${NUMBER}`).exec(q)
  const zMin = new RegExp(`(?:\\bz|redshift)\\s*(?:>=?|maior (?:que|do que)|acima de|above|greater than)\\s*${NUMBER}`).exec(q)
  if (zMax) {
    filters.redshiftMax = n(zMax[1])
    recognized = true
  }
  if (zMin) {
    filters.redshiftMin = n(zMin[1])
    recognized = true
  }

  // Proximity: "perto de M51", "near Orion Nebula", "ao redor de 202.4 47.2", "num raio de 2 graus"
  const near = /(?:perto d[eoa]s?|proximos? (?:a|ao|de|da|do)|proximas? (?:a|de|da|do)|ao redor d[eoa]|em torno d[eoa]|around|near(?:by)?|close to)\s+(.+?)(?:\s+(?:num|em um|no|within|in a)?\s*raio.*|\s+within.*|$)/.exec(q)
  if (near) {
    filters.near = near[1].trim()
    const coords = parseCoordinates(filters.near)
    if (coords) filters.nearCoords = coords
    recognized = true
  }
  const radius = new RegExp(`(?:raio|radius|within)\\s*(?:de|of)?\\s*${NUMBER}\\s*(graus?|degrees?|deg|°|arcmin|minutos? de arco|')`).exec(q)
  if (radius) {
    const value = n(radius[1])
    filters.radiusDeg = /arcmin|minuto|'/.test(radius[2]) ? value / 60 : value
  }

  // Sorting and limits
  if (/mais brilhantes?|brightest/.test(q)) filters.sort = 'brightness'
  else if (/maiores|largest|biggest/.test(q)) filters.sort = 'size'
  else if (/mais distantes?|farthest|most distant|maior redshift|highest redshift/.test(q)) filters.sort = 'redshift'

  const limit = /(?:top|primeir[oa]s|first)\s*(\d{1,3})|^(\d{1,3})\s/.exec(q)
  if (limit) filters.limit = Math.min(200, parseInt(limit[1] ?? limit[2], 10))

  return { filters, recognized }
}

/** Looks like a catalog designation: has letters and digits, few words. */
function looksLikeIdentifier(q: string): boolean {
  const words = q.trim().split(/\s+/)
  if (words.length > 4) return false
  if (/\d/.test(q)) return true
  // Single proper names such as "Vega", "Betelgeuse", "Andromeda"
  return words.length <= 2
}

export function classifyQuery(input: string): QueryIntent {
  const raw = input.trim()
  const coords = parseCoordinates(raw)
  if (coords) return { kind: 'coordinates', coords }

  const famous = lookupFamous(raw)
  if (famous) return { kind: 'identifier', identifier: famous.id }

  const { filters, recognized } = parseCharacteristics(raw)
  // A short designation such as "NGC 1300" also triggers the catalog rule
  // ("ngc"), so identifiers win when the query has digits and no other filter.
  const onlyCatalog =
    recognized &&
    filters.catalog &&
    !filters.otype &&
    filters.magMax === undefined &&
    filters.magMin === undefined &&
    !filters.near &&
    !filters.spectralType
  if (recognized && !(onlyCatalog && /\d/.test(raw))) {
    return { kind: 'characteristics', filters, recognized }
  }

  if (looksLikeIdentifier(raw)) return { kind: 'identifier', identifier: raw }
  return { kind: 'characteristics', filters, recognized: false }
}

/** Human readable summary of filters (pt-BR), shown above results. */
export function describeFilters(f: SearchFilters, typeLabel?: string): string {
  const parts: string[] = []
  parts.push(typeLabel ?? 'Objetos')
  if (f.catalog) parts.push(`do catálogo ${f.catalog === 'M' ? 'Messier' : f.catalog === 'ACO' ? 'Abell' : f.catalog}`)
  if (f.spectralType) parts.push(`de tipo espectral ${f.spectralType}`)
  if (f.magMin !== undefined && f.magMax !== undefined) parts.push(`com magnitude entre ${f.magMin} e ${f.magMax}`)
  else if (f.magMax !== undefined) parts.push(`mais brilhantes que mag ${f.magMax}`)
  else if (f.magMin !== undefined) parts.push(`mais fracos que mag ${f.magMin}`)
  if (f.redshiftMax !== undefined) parts.push(`com z < ${f.redshiftMax}`)
  if (f.redshiftMin !== undefined) parts.push(`com z > ${f.redshiftMin}`)
  if (f.near) parts.push(`a até ${formatRadius(f.radiusDeg ?? 1)} de ${f.near}`)
  return parts.join(' ')
}

function formatRadius(deg: number): string {
  return deg < 1 ? `${Math.round(deg * 60)}′` : `${deg}°`
}
