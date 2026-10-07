'use client'

import { useSyncExternalStore } from 'react'

// Student progress, kept in the browser for the MVP (no accounts yet).
// Everything is wrapped in try/catch: storage can be unavailable.

export interface LabProgress {
  /** Index of the furthest step reached. */
  reached: number
  /** Step currently open. */
  current: number
  answers: Record<string, unknown>
  completedAt?: string
}

export interface Progress {
  onboarded: boolean
  name?: string
  labs: Record<string, LabProgress>
  recentSearches: string[]
}

const KEY = 'aeso:progress:v1'
const EMPTY: Progress = { onboarded: false, labs: {}, recentSearches: [] }

let cache: Progress | null = null
const listeners = new Set<() => void>()

function load(): Progress {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(KEY)
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : EMPTY
  } catch {
    cache = EMPTY
  }
  return cache
}

export function updateProgress(fn: (p: Progress) => Progress) {
  cache = fn(load())
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {}
  listeners.forEach((l) => l())
}

export function updateLab(slug: string, fn: (l: LabProgress) => LabProgress) {
  updateProgress((p) => {
    const prev = p.labs[slug] ?? { reached: 0, current: 0, answers: {} }
    return { ...p, labs: { ...p.labs, [slug]: fn(prev) } }
  })
}

export function rememberSearch(q: string) {
  updateProgress((p) => ({ ...p, recentSearches: [q, ...p.recentSearches.filter((s) => s !== q)].slice(0, 8) }))
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY)
}
