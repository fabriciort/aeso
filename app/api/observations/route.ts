import { NextResponse, type NextRequest } from 'next/server'
import { isMock } from '@/lib/server/http'
import { mockObservations } from '@/lib/server/fixtures'
import { observationsAround } from '@/lib/server/mast'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const ra = Number(p.get('ra'))
  const dec = Number(p.get('dec'))
  const radius = Math.min(Math.max(Number(p.get('radius') ?? 0.05) || 0.05, 0.001), 1)
  if (!Number.isFinite(ra) || !Number.isFinite(dec) || ra < 0 || ra >= 360 || Math.abs(dec) > 90) {
    return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 })
  }
  try {
    const observations = isMock() ? mockObservations(ra, dec) : await observationsAround(ra, dec, radius)
    return NextResponse.json(
      { observations },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('[observations]', err)
    return NextResponse.json({ error: 'Não foi possível consultar o MAST agora.' }, { status: 502 })
  }
}
