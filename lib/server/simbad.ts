import 'server-only'
import { fetchWithTimeout } from './http'

const TAP_URL = 'https://simbad.cds.unistra.fr/simbad/sim-tap/sync'
const SESAME_URL = 'https://cds.unistra.fr/cgi-bin/nph-sesame/-oxpI/SNV'

export type Row = Record<string, string | number | null>

/** Runs a synchronous ADQL query against SIMBAD TAP and returns named rows. */
export async function simbadTap(adql: string, timeoutMs = 20000): Promise<Row[]> {
  const body = new URLSearchParams({ REQUEST: 'doQuery', LANG: 'ADQL', FORMAT: 'json', QUERY: adql })
  const res = await fetchWithTimeout('SIMBAD', TAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    timeoutMs,
    next: { revalidate: 60 * 60 * 24 },
  })
  const json = (await res.json()) as { metadata?: { name: string }[]; data?: unknown[][] }
  const names = (json.metadata ?? []).map((m) => m.name)
  return (json.data ?? []).map((row) => {
    const out: Row = {}
    names.forEach((name, i) => {
      out[name] = (row[i] as string | number | null) ?? null
    })
    return out
  })
}

export interface SesameResult {
  name: string
  ra: number
  dec: number
  otype?: string
  morphology?: string
  spectralType?: string
  vmag?: number
  redshift?: number
  radialVelocity?: number
  parallax?: number
  aliases: string[]
  resolver: string
}

function tag(xml: string, name: string): string | undefined {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)
  return m ? m[1].trim() : undefined
}

function nested(xml: string, name: string): number | undefined {
  const block = tag(xml, name)
  if (!block) return undefined
  const v = tag(block, 'v') ?? block
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : undefined
}

function decode(s: string): string {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
}

/** Parses Sesame's XML output (exported for tests). */
export function parseSesameXml(xml: string): SesameResult | null {
  const resolvers = xml.match(/<Resolver[\s\S]*?<\/Resolver>/g) ?? []
  for (const r of resolvers) {
    const ra = parseFloat(tag(r, 'jradeg') ?? '')
    const dec = parseFloat(tag(r, 'jdedeg') ?? '')
    if (!Number.isFinite(ra) || !Number.isFinite(dec)) continue
    const resolver = /name="([^"]+)"/.exec(r)?.[1] ?? 'Sesame'
    const vmagBlock = /<mag band="V">([\s\S]*?)<\/mag>/.exec(r)?.[1]
    const vmag = vmagBlock ? parseFloat(tag(vmagBlock, 'v') ?? '') : NaN
    const aliases = Array.from(r.matchAll(/<alias>([\s\S]*?)<\/alias>/g)).map((m) => decode(m[1].trim()))
    return {
      name: decode(tag(r, 'oname') ?? ''),
      ra,
      dec,
      otype: tag(r, 'otype'),
      morphology: tag(r, 'MType'),
      spectralType: tag(r, 'spType'),
      vmag: Number.isFinite(vmag) ? vmag : undefined,
      redshift: nested(r, 'z'),
      radialVelocity: nested(r, 'Vel'),
      parallax: nested(r, 'plx'),
      aliases,
      resolver: resolver.split('=')[1]?.split(' ')[0] ?? resolver,
    }
  }
  return null
}

/** Resolves a name with CDS Sesame (SIMBAD → NED → VizieR). */
export async function sesame(name: string): Promise<SesameResult | null> {
  const res = await fetchWithTimeout('Sesame', `${SESAME_URL}?${encodeURIComponent(name)}`, {
    timeoutMs: 10000,
    next: { revalidate: 60 * 60 * 24 * 7 },
  })
  return parseSesameXml(await res.text())
}
