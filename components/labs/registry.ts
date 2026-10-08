'use client'

import { useEffect, useState } from 'react'
import type { LabModule } from './runtime'

// Lab content is code-split: each lab's Etapas and Palco load on demand
// (preloaded while the cover is on screen, so entering feels instant).

const LOADERS: Record<string, () => Promise<{ default: LabModule }>> = {
  exoplaneta: () => import('./exoplaneta'),
  'cor-das-estrelas': () => import('./cor-das-estrelas'),
  orbitas: () => import('./orbitas'),
  'universo-em-expansao': () => import('./universo-em-expansao'),
  'diagrama-hr': () => import('./diagrama-hr'),
  derivada: () => import('./derivada'),
  'circulo-trigonometrico': () => import('./circulo-trigonometrico'),
  'funcao-quadratica': () => import('./funcao-quadratica'),
  'series-taylor': () => import('./series-taylor'),
  integral: () => import('./integral'),
  equacoes: () => import('./equacoes'),
  'equacoes-diferenciais': () => import('./equacoes-diferenciais'),
  gradiente: () => import('./gradiente'),
}

const cache = new Map<string, LabModule>()
const pending = new Map<string, Promise<LabModule>>()

export function hasLabModule(slug: string) {
  return slug in LOADERS
}

export function loadLab(slug: string): Promise<LabModule> {
  const done = cache.get(slug)
  if (done) return Promise.resolve(done)
  let p = pending.get(slug)
  if (!p) {
    const loader = LOADERS[slug]
    if (!loader) return Promise.reject(new Error(`Laboratório sem conteúdo: ${slug}`))
    p = loader().then((m) => {
      cache.set(slug, m.default)
      return m.default
    })
    pending.set(slug, p)
  }
  return p
}

export function useLabModule(slug: string): LabModule | null {
  const [mod, setMod] = useState<LabModule | null>(() => cache.get(slug) ?? null)
  useEffect(() => {
    let alive = true
    loadLab(slug)
      .then((m) => alive && setMod(m))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [slug])
  return mod
}
