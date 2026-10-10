'use client'

import { useSyncExternalStore } from 'react'

// Ajustes do aluno, kept in the browser. Everything is opt-in: the lab works
// beautifully in a normal browser tab, silent, and the student chooses to
// add tela cheia or the Vega's voice.

export interface Preferences {
  /** Open labs in fullscreen (Android/desktop). Off by default. */
  fullscreen: boolean
  /** Vega reads each scene aloud (Web Speech API). Off by default. */
  voice: boolean
  /** Speech rate: 0.9 calm, 1 normal, 1.15 quick. */
  voiceRate: number
  /** Short sounds in the lessons (right, wrong, lesson done). On by default. */
  sounds: boolean
}

const KEY = 'aeso:prefs:v1'
export const DEFAULT_PREFERENCES: Preferences = { fullscreen: false, voice: false, voiceRate: 1, sounds: true }

let cache: Preferences | null = null
const listeners = new Set<() => void>()

function load(): Preferences {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(KEY)
    cache = raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFERENCES
  } catch {
    cache = DEFAULT_PREFERENCES
  }
  return cache
}

export function getPreferences(): Preferences {
  return typeof window === 'undefined' ? DEFAULT_PREFERENCES : load()
}

export function setPreferences(patch: Partial<Preferences>) {
  cache = { ...load(), ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_PREFERENCES)
}
