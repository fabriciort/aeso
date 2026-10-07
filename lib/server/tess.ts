import 'server-only'
import { readTableColumns } from '@/lib/astro/fits'
import { binBy, bestRadiusRatio, clean, detrend, findEpoch, phaseOf, robustStd, type FoldedPoint } from '@/lib/astro/lightcurve'
import { durationFraction, transitFlux as transitFluxForSim } from '@/lib/astro/transit'
import type { LabTarget } from '@/lib/labs/types'
import { fetchWithTimeout } from './http'
import { mastInvoke, mastUriToUrl } from './mast'

export interface LightCurve {
  source: 'tess' | 'simulado'
  target: string
  sector?: number
  tic?: string
  exposureSec?: number
  fileName?: string
  period: number
  /** Epoch of mid-transit (days, same scale as series). */
  t0: number
  /** Full light curve, binned, time in days from the first point. */
  series: { t: number; f: number }[]
  /** Points near transit, folded: hours from mid-transit. */
  folded: FoldedPoint[]
  /** Same, averaged in bins. */
  foldedBinned: FoldedPoint[]
  /** Scatter of unbinned points out of transit, in ppm. */
  noisePpm: number
  /** Best-fit radius ratio from these data (for checking the student's fit). */
  fitRadiusRatio: number
  durationHours: number
}

async function findTessLightCurve(t: LabTarget): Promise<{ url: string; fileName: string }> {
  const obs = await mastInvoke({
    service: 'Mast.Caom.Filtered.Position',
    format: 'json',
    pagesize: 50,
    page: 1,
    params: {
      columns: 'obsid,obs_id,t_exptime,sequence_number,dataproduct_type,obs_collection',
      filters: [
        { paramName: 'obs_collection', values: ['TESS'] },
        { paramName: 'dataproduct_type', values: ['timeseries'] },
      ],
      position: `${t.ra}, ${t.dec}, 0.004`,
    },
  })
  const rows = (obs.data ?? []) as { obsid: string | number; obs_id?: string; t_exptime?: number; sequence_number?: number }[]
  // Prefer 2-minute cadence SPOC light curves, earliest sector first.
  const candidates = rows
    .filter((r) => /-s$/.test(String(r.obs_id ?? '')) || Number(r.t_exptime) === 120)
    .sort((a, b) => Number(a.sequence_number ?? 999) - Number(b.sequence_number ?? 999))
  for (const c of candidates.length ? candidates : rows) {
    const prods = await mastInvoke({ service: 'Mast.Caom.Products', params: { obsid: String(c.obsid) }, format: 'json' })
    const lc = (prods.data ?? []).find((p) => /_lc\.fits$/.test(String(p.productFilename)) && !/fast/.test(String(p.productFilename)))
    if (lc) {
      const url = mastUriToUrl(String(lc.dataURI))
      if (url) return { url, fileName: String(lc.productFilename) }
    }
  }
  throw new Error(`Nenhuma curva de luz do TESS encontrada para ${t.name}`)
}

export async function tessLightCurve(t: LabTarget): Promise<LightCurve> {
  const { url, fileName } = await findTessLightCurve(t)
  const res = await fetchWithTimeout('MAST', url, { timeoutMs: 40000, cache: 'no-store' })
  const buffer = await res.arrayBuffer()
  const cols = readTableColumns(buffer, ['TIME', 'PDCSAP_FLUX', 'QUALITY'])
  return processLightCurve(t, cols.TIME, cols.PDCSAP_FLUX, cols.QUALITY, {
    sector: Number(cols.header.SECTOR) || undefined,
    tic: cols.header.TICID ? String(cols.header.TICID) : undefined,
    exposureSec: 120,
    fileName,
  })
}

/** Cleans, detrends, folds and summarises a raw light curve. */
export function processLightCurve(
  t: LabTarget,
  time: ArrayLike<number>,
  flux: ArrayLike<number>,
  quality: ArrayLike<number> | undefined,
  meta: Partial<LightCurve>,
  source: LightCurve['source'] = 'tess',
): LightCurve {
  const geometry = { aR: t.aR, b: t.impact }
  const durationDays = durationFraction(t.radiusRatio, geometry) * t.period
  const durationHours = durationDays * 24

  let pts = clean(time, flux, quality)
  if (pts.length < 100) throw new Error('Curva de luz com poucos pontos válidos')
  // Pass 1: rough trend, find the transit epoch; pass 2: mask transits.
  const rough = detrend(pts, 1.0)
  const t0 = findEpoch(rough, t.period, durationDays)
  const inTransit = (x: number) => Math.abs(phaseOf(x, t.period, t0)) * t.period < durationDays * 0.75
  pts = detrend(pts, 1.0, inTransit)

  const start = pts[0].t
  const series = binBy(
    pts.map((p) => ({ x: p.t - start, y: p.f })),
    0,
    pts[pts.length - 1].t - start + 1e-9,
    Math.min(2400, Math.max(200, Math.round((pts[pts.length - 1].t - start) * 96))),
  ).map((b) => ({ t: b.x, f: b.y }))

  const windowH = Math.max(durationHours * 1.6, 3)
  const folded: FoldedPoint[] = []
  for (const p of pts) {
    const h = phaseOf(p.t, t.period, t0) * t.period * 24
    if (Math.abs(h) <= windowH) folded.push({ h, f: p.f })
  }
  const foldedBinned = binBy(
    folded.map((p) => ({ x: p.h, y: p.f })),
    -windowH,
    windowH,
    Math.round((windowH * 2 * 60) / 10),
  ).map((b) => ({ h: b.x, f: b.y }))

  const outOfTransit = pts.filter((p) => !inTransit(p.t)).map((p) => p.f)
  const fitRadiusRatio = bestRadiusRatio(foldedBinned, t.period, geometry, t.limbDarkening)

  // Keep the payload small: decimate unbinned folded points.
  const step = Math.max(1, Math.ceil(folded.length / 3000))
  return {
    source,
    target: t.name,
    period: t.period,
    t0: t0 - start,
    series,
    folded: folded.filter((_, i) => i % step === 0),
    foldedBinned,
    noisePpm: Math.round(robustStd(outOfTransit) * 1e6),
    fitRadiusRatio,
    durationHours,
    ...meta,
  }
}

/**
 * Synthetic light curve with the target's real parameters, used offline
 * (AESO_MOCK=1) or when MAST is unreachable. Always labelled "simulado".
 */
export function simulatedLightCurve(t: LabTarget, seed = 42): LightCurve {
  let s = seed
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand())
  const time: number[] = []
  const flux: number[] = []
  const t0 = 1.137
  for (let d = 0; d < 27; d += 2 / 1440) {
    if (d > 13.1 && d < 14.4) continue // mid-sector data downlink gap
    const phase = phaseOf(d, t.period, t0)
    const z = Math.abs(phase) < 0.25 ? Math.hypot(t.aR * Math.sin(2 * Math.PI * phase), t.impact * Math.cos(2 * Math.PI * phase)) : Infinity
    const model = Number.isFinite(z) ? transitFluxForSim(t.radiusRatio, z, t.limbDarkening) : 1
    const trend = 1 + 0.0015 * Math.sin(d / 4.3) + 0.0008 * Math.sin(d / 1.7 + 1)
    time.push(d)
    flux.push(model * trend * (1 + 900e-6 * gauss()))
  }
  return processLightCurve(t, time, flux, undefined, { exposureSec: 120 }, 'simulado')
}
