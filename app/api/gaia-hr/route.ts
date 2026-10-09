import { NextResponse } from 'next/server'
import { absoluteMagnitude, luminosityFromAbsG, simulatedPopulation } from '@/lib/astro/stars'
import { fetchWithTimeout, isMock } from '@/lib/server/http'

export const maxDuration = 60

// Thousands of nearby stars from Gaia DR3 for the H-R diagram lab.
// The query is fixed (no user input reaches the archive). When the archive
// cannot be reached, a simulated population is returned, labelled as such.

const GAIA_TAP = 'https://gea.esac.esa.int/tap-server/tap/sync'

// Stars within 100 pc (parallax > 10 mas) with good parallaxes (S/N > 10)
// and a GSP-Phot temperature. random_index gives an unbiased random subset.
const ADQL = `SELECT TOP 3000 teff_gspphot, phot_g_mean_mag, parallax
FROM gaiadr3.gaia_source
WHERE parallax > 10
  AND parallax_over_error > 10
  AND teff_gspphot IS NOT NULL
  AND phot_g_mean_mag IS NOT NULL
ORDER BY random_index`

export interface GaiaHr {
  source: 'gaia' | 'simulado'
  /** [Teff K, L L☉] */
  stars: [number, number][]
}

interface TapJson {
  metadata?: { name: string }[]
  data?: (number | null)[][]
}

const round3 = (x: number) => Number(x.toPrecision(3))

async function gaiaStars(): Promise<[number, number][]> {
  const body = new URLSearchParams({ REQUEST: 'doQuery', LANG: 'ADQL', FORMAT: 'json', QUERY: ADQL })
  const res = await fetchWithTimeout('Gaia', GAIA_TAP, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    timeoutMs: 40000,
    cache: 'no-store',
  })
  const json = (await res.json()) as TapJson
  const names = (json.metadata ?? []).map((m) => m.name.toLowerCase())
  const iT = names.indexOf('teff_gspphot')
  const iG = names.indexOf('phot_g_mean_mag')
  const iP = names.indexOf('parallax')
  if (iT < 0 || iG < 0 || iP < 0) throw new Error('Resposta do Gaia sem as colunas esperadas')
  const stars: [number, number][] = []
  for (const row of json.data ?? []) {
    const teff = Number(row[iT])
    const g = Number(row[iG])
    const plx = Number(row[iP])
    if (!(teff > 0 && plx > 0 && Number.isFinite(g))) continue
    // Approximation: L from the G-band absolute magnitude, without the
    // bolometric correction. Hot and very cool stars come out a bit too faint.
    const lum = luminosityFromAbsG(absoluteMagnitude(g, plx))
    stars.push([Math.round(teff), round3(lum)])
  }
  if (stars.length < 100) throw new Error(`Gaia devolveu só ${stars.length} estrelas`)
  return stars
}

const simulated = (): GaiaHr => ({ source: 'simulado', stars: simulatedPopulation(3000) })

export async function GET() {
  if (isMock()) return NextResponse.json(simulated())
  try {
    const stars = await gaiaStars()
    return NextResponse.json({ source: 'gaia', stars } satisfies GaiaHr, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch (err) {
    console.error('[gaia-hr]', err)
    // Short cache, so the real data is tried again soon.
    return NextResponse.json(simulated(), { headers: { 'Cache-Control': 'public, s-maxage=300' } })
  }
}
