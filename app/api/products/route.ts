import { NextResponse, type NextRequest } from 'next/server'
import { isMock } from '@/lib/server/http'
import { mockProducts } from '@/lib/server/fixtures'
import { productsFor } from '@/lib/server/mast'

export async function GET(req: NextRequest) {
  const obsid = req.nextUrl.searchParams.get('obsid') ?? ''
  if (!/^\d{1,15}$/.test(obsid)) {
    return NextResponse.json({ error: 'obsid inválido' }, { status: 400 })
  }
  try {
    const products = isMock() ? mockProducts(obsid) : await productsFor(obsid)
    return NextResponse.json(
      { products },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('[products]', err)
    return NextResponse.json({ error: 'Não foi possível listar os arquivos agora.' }, { status: 502 })
  }
}
