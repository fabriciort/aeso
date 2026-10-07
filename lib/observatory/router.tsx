'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Client-side routing inside the Observatório: the URL follows the state
// (shareable links, back/forward) but the page never reloads.

export type Route =
  | { area: 'inicio' }
  | { area: 'ceu'; q?: string }
  | { area: 'laboratorios' }
  | { area: 'laboratorio'; slug: string; step?: string }

export const BASE = '/app'

export function parseRoute(pathname: string, search: string): Route {
  const parts = pathname.replace(/^\/app\/?/, '').split('/').filter(Boolean)
  const params = new URLSearchParams(search)
  if (parts[0] === 'ceu') return { area: 'ceu', q: params.get('q') ?? undefined }
  if (parts[0] === 'laboratorios' && parts[1]) return { area: 'laboratorio', slug: parts[1], step: params.get('etapa') ?? undefined }
  if (parts[0] === 'laboratorios') return { area: 'laboratorios' }
  return { area: 'inicio' }
}

export function routeToUrl(r: Route): string {
  switch (r.area) {
    case 'inicio':
      return BASE
    case 'ceu':
      return `${BASE}/ceu${r.q ? `?q=${encodeURIComponent(r.q)}` : ''}`
    case 'laboratorios':
      return `${BASE}/laboratorios`
    case 'laboratorio':
      return `${BASE}/laboratorios/${r.slug}${r.step ? `?etapa=${r.step}` : ''}`
  }
}

interface RouterValue {
  route: Route
  navigate: (r: Route, opts?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterValue | null>(null)

export function ObservatoryRouter({ initial, children }: { initial: Route; children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(initial)

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname, window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((r: Route, opts: { replace?: boolean } = {}) => {
    const url = routeToUrl(r)
    if (opts.replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    setRoute(r)
    if (!opts.replace) window.scrollTo({ top: 0 })
  }, [])

  const value = useMemo(() => ({ route, navigate }), [route, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter fora do ObservatoryRouter')
  return ctx
}
