'use client'

import { useEffect, useState } from 'react'
import { simulatedPopulation } from '@/lib/astro/stars'

// Thousands of stars for the diagram: Gaia DR3 through /api/gaia-hr, or a
// simulated population (labelled) when the archive or the network fails.

export interface GaiaData {
  source: 'gaia' | 'simulado'
  /** [Teff K, L L☉] */
  stars: [number, number][]
}

/** Lab-wide live values shared by the Palco and the Etapas. */
export interface HrLive {
  [key: string]: unknown
  /** Named star tapped (shows its card). */
  selected: string | null
  /** Movable radius line in "Entenda", R☉. */
  radius: number
  /** Radius line in "Meça", R☉. */
  measureR: number
  gaiaCount: number
  gaiaSource: 'gaia' | 'simulado'
  /** Bumped to replay the Sun's track. */
  trackReplay: number
}

let pending: Promise<GaiaData> | null = null

export function loadGaia(): Promise<GaiaData> {
  if (!pending) {
    pending = fetch('/api/gaia-hr')
      .then((r) => (r.ok ? (r.json() as Promise<GaiaData>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => (Array.isArray(d?.stars) && d.stars.length > 50 ? d : Promise.reject(new Error('vazio'))))
      .catch((): GaiaData => ({ source: 'simulado', stars: simulatedPopulation(3000) }))
  }
  return pending
}

export function useGaia(): GaiaData | null {
  const [data, setData] = useState<GaiaData | null>(null)
  useEffect(() => {
    let alive = true
    void loadGaia().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [])
  return data
}
