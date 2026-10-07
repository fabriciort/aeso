import type { Metadata } from 'next'
import Observatory from '@/components/observatory/Observatory'

export const metadata: Metadata = {
  title: 'Observatório · AESo',
}

export default async function ObservatoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { path = [] } = await params
  const sp = await searchParams
  const search = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (v === undefined ? [] : Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v]])),
  ).toString()
  return <Observatory path={`/app/${path.join('/')}`} search={search ? `?${search}` : ''} />
}
