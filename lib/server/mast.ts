import 'server-only'
import type { DataProduct, Observation } from '@/lib/astro/types'
import { fetchWithTimeout } from './http'

const MAST_INVOKE = 'https://mast.stsci.edu/api/v0/invoke'
export const MAST_DOWNLOAD = 'https://mast.stsci.edu/api/v0.1/Download/file?uri='

interface MastResponse {
  status?: string
  msg?: string
  data?: Record<string, unknown>[]
  resolvedCoordinate?: { ra: number | string; decl: number | string; canonicalName?: string; objectType?: string }[]
}

/**
 * Calls the MAST Mashup API. Long-running CAOM queries answer with
 * status=EXECUTING and must be re-requested until COMPLETE.
 */
export async function mastInvoke(request: Record<string, unknown>, timeoutMs = 25000): Promise<MastResponse> {
  const deadline = Date.now() + timeoutMs
  for (let attempt = 0; ; attempt++) {
    const res = await fetchWithTimeout('MAST', MAST_INVOKE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ request: JSON.stringify(request) }),
      timeoutMs: Math.max(deadline - Date.now(), 1000),
      cache: 'no-store',
    })
    const json = (await res.json()) as MastResponse
    if (json.status !== 'EXECUTING' || Date.now() > deadline || attempt > 10) return json
    await new Promise((r) => setTimeout(r, 800 + attempt * 400))
  }
}

export async function mastNameLookup(name: string) {
  const json = await mastInvoke({ service: 'Mast.Name.Lookup', params: { input: name, format: 'json' }, format: 'json' }, 10000)
  const r = json.resolvedCoordinate?.[0]
  if (!r) return null
  const ra = Number(r.ra)
  const dec = Number(r.decl)
  if (!Number.isFinite(ra) || !Number.isFinite(dec)) return null
  return { ra, dec, name: r.canonicalName ?? name, objectType: r.objectType }
}

export function mastUriToUrl(uri?: string | null): string | undefined {
  if (!uri) return undefined
  if (/^https?:\/\//.test(uri)) return uri
  return MAST_DOWNLOAD + encodeURIComponent(uri)
}

function mjdToIso(mjd: unknown): string | undefined {
  const n = Number(mjd)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return new Date((n - 40587) * 86400000).toISOString()
}

const s = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : String(v))
const num = (v: unknown) => {
  const n = Number(v)
  return v === null || v === undefined || v === '' || !Number.isFinite(n) ? undefined : n
}

export function toObservation(row: Record<string, unknown>): Observation {
  return {
    obsid: String(row.obsid),
    collection: s(row.obs_collection) ?? '—',
    instrument: s(row.instrument_name) ?? '—',
    filters: s(row.filters),
    target: s(row.target_name),
    productType: s(row.dataproduct_type),
    date: mjdToIso(row.t_min),
    exposure: num(row.t_exptime),
    proposalId: s(row.proposal_id),
    ra: Number(row.s_ra),
    dec: Number(row.s_dec),
    region: s(row.s_region),
    previewUrl: mastUriToUrl(s(row.jpegURL)),
    isPublic: String(row.dataRights ?? 'PUBLIC').toUpperCase() === 'PUBLIC',
    calibLevel: num(row.calib_level),
    wavelengthRegion: s(row.wavelength_region),
  }
}

export async function observationsAround(ra: number, dec: number, radiusDeg: number): Promise<Observation[]> {
  const json = await mastInvoke({
    service: 'Mast.Caom.Filtered.Position',
    format: 'json',
    pagesize: 500,
    page: 1,
    removenullcolumns: true,
    params: {
      columns: '*',
      filters: [
        { paramName: 'intentType', values: ['science'] },
        { paramName: 'dataproduct_type', values: ['image', 'spectrum', 'cube', 'timeseries'] },
      ],
      position: `${ra}, ${dec}, ${radiusDeg}`,
    },
  })
  if (json.status === 'ERROR') throw new Error(json.msg ?? 'MAST retornou erro')
  return (json.data ?? []).map(toObservation).filter((o) => Number.isFinite(o.ra) && Number.isFinite(o.dec))
}

export function toProduct(row: Record<string, unknown>): DataProduct {
  const uri = String(row.dataURI ?? '')
  return {
    id: String(row.obsID ?? '') + ':' + String(row.productFilename ?? uri),
    filename: s(row.productFilename) ?? uri.split('/').pop() ?? uri,
    uri,
    downloadUrl: mastUriToUrl(uri) ?? '',
    size: num(row.size),
    productType: s(row.productType),
    description: s(row.description),
    subgroup: s(row.productSubGroupDescription),
    calibLevel: num(row.calib_level),
    isPublic: String(row.dataRights ?? 'PUBLIC').toUpperCase() === 'PUBLIC',
  }
}

export async function productsFor(obsid: string): Promise<DataProduct[]> {
  const json = await mastInvoke({ service: 'Mast.Caom.Products', params: { obsid }, format: 'json', pagesize: 1000, page: 1 })
  if (json.status === 'ERROR') throw new Error(json.msg ?? 'MAST retornou erro')
  return (json.data ?? []).map(toProduct).filter((p) => p.uri)
}
