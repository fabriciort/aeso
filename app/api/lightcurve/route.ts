import { NextResponse, type NextRequest } from 'next/server'
import { getLab } from '@/lib/labs/catalog'
import { isMock } from '@/lib/server/http'
import { simulatedLightCurve, tessLightCurve } from '@/lib/server/tess'

export const maxDuration = 60

// Only targets declared in lab definitions can be requested, so this route
// cannot be used to make the server download arbitrary files.
export async function GET(req: NextRequest) {
  const lab = getLab(req.nextUrl.searchParams.get('lab') ?? '')
  if (!lab?.target) return NextResponse.json({ error: 'Laboratório desconhecido' }, { status: 404 })

  if (isMock() || req.nextUrl.searchParams.get('fonte') === 'simulado') {
    return NextResponse.json(simulatedLightCurve(lab.target))
  }
  try {
    const lc = await tessLightCurve(lab.target)
    return NextResponse.json(lc, {
      headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000' },
    })
  } catch (err) {
    console.error('[lightcurve]', err)
    return NextResponse.json(
      { error: 'Não consegui baixar os dados do TESS agora.', fallback: true },
      { status: 502 },
    )
  }
}
