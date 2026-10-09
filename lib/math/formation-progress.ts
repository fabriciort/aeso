'use client'

import { useSyncExternalStore } from 'react'
import { MODULES } from './curriculum'

// Progress in the Formação em Matemática, kept in the browser (MVP, no
// accounts yet). A unit is done when all its lessons are done.

interface FormationProgress {
  /** Lesson id → when it was mastered (ISO). */
  lessons: Record<string, string>
  /** Lesson id → the card the student was on (to resume). */
  cards?: Record<string, number>
  /** Diagnóstico de entrada: lesson id → answered right on the first try. */
  diagnostico?: Record<string, boolean>
}

const KEY = 'aeso:formacao:v1'
const EMPTY: FormationProgress = { lessons: {} }
let cache: FormationProgress | null = null
const listeners = new Set<() => void>()

function load(): FormationProgress {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(KEY)
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as FormationProgress) } : EMPTY
  } catch {
    cache = EMPTY
  }
  return cache
}

function save(next: FormationProgress) {
  cache = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {}
  listeners.forEach((l) => l())
}

export function markLessonDone(id: string) {
  const cur = load()
  if (cur.lessons[id]) return
  save({ ...cur, lessons: { ...cur.lessons, [id]: new Date().toISOString() } })
}

/** Remember the card the student is on, to resume the lesson later. */
export function saveCard(id: string, card: number) {
  const cur = load()
  if (cur.cards?.[id] === card) return
  save({ ...cur, cards: { ...cur.cards, [id]: card } })
}

export function saveDiagnostico(result: Record<string, boolean>) {
  const cur = load()
  save({ ...cur, diagnostico: { ...cur.diagnostico, ...result } })
}

/** Where to resume a lesson (0 when it was never opened). */
export function lessonCard(p: FormationProgress, id: string): number {
  return p.cards?.[id] ?? 0
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useFormationProgress(): FormationProgress {
  return useSyncExternalStore(subscribe, load, () => EMPTY)
}

/** Units whose lessons are all done (units without lessons yet never count). */
export function doneUnits(p: FormationProgress): Set<string> {
  const out = new Set<string>()
  for (const m of MODULES) for (const u of m.units) if (u.lessons.length && u.lessons.every((l) => p.lessons[l.id])) out.add(u.id)
  return out
}
