import { redirect } from 'next/navigation'
import Landing from '@/components/site/Landing'

// Old links (/?q=M51) open the Céu inside the Observatório.
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  if (q) redirect(`/app/ceu?q=${encodeURIComponent(q)}`)
  return <Landing />
}
