import { NextResponse, type NextRequest } from 'next/server'
import { isMock } from '@/lib/server/http'
import { mockSearch } from '@/lib/server/fixtures'
import { search } from '@/lib/server/search'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const result = isMock() ? mockSearch(q) : await search(q)
  return NextResponse.json(result, {
    status: result.kind === 'error' ? 502 : 200,
    headers: result.kind === 'error' ? {} : { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
