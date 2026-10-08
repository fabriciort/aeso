'use client'

import { useSyncExternalStore } from 'react'
import { getPreferences } from '@/lib/preferences'

// A voz da Vega: narration with the browser's own speech synthesis (Web
// Speech API). Free, offline-capable and good enough for the MVP; a hosted
// voice (e.g. ElevenLabs) can replace `speak` later without touching callers.
//
// Browser quirks handled here:
// - Voices load asynchronously (voiceschanged).
// - Chrome stops long utterances after ~15 s: text is split into sentences.
// - iOS only speaks after a user gesture: call unlockVoice() inside a tap.
// - cancel() immediately followed by speak() is flaky on Android: small delay.

interface NarratorState {
  speaking: boolean
  /** Id of what is being read (e.g. "exoplaneta/observe/2"). */
  id: string | null
}

let state: NarratorState = { speaking: false, id: null }
const listeners = new Set<() => void>()
let token = 0
let cachedVoice: SpeechSynthesisVoice | null | undefined

function emit(next: NarratorState) {
  state = next
  listeners.forEach((l) => l())
}

export function voiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

const PREFERRED = /natural|neural|premium|enhanced|google|luciana|francisca|thalita|vitoria|camila|maria/i

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const br = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'pt-br')
  const pt = br.length ? br : voices.filter((v) => v.lang.toLowerCase().startsWith('pt'))
  cachedVoice = pt.find((v) => PREFERRED.test(v.name)) ?? pt.find((v) => v.localService) ?? pt[0] ?? null
  return cachedVoice
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

/**
 * The text of an element as it should be read aloud: math (KaTeX) is
 * replaced by its spoken form (data-say), hidden parts are skipped.
 */
export function readableText(el: HTMLElement | null): string {
  if (!el) return ''
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll<HTMLElement>('[data-say]').forEach((n) => n.replaceWith(` ${n.dataset.say ?? ''} `))
  clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
  return clone.textContent ?? ''
}

/** Turns on-screen notation into something a voice can read naturally. */
export function speechText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/δ/g, 'delta')
    .replace(/λ/g, 'lambda')
    .replace(/R★|R\*/g, 'R da estrela')
    .replace(/R☉/g, 'raios solares')
    .replace(/M☉/g, 'massas solares')
    .replace(/L☉/g, 'luminosidades solares')
    .replace(/R♃/g, 'raios de Júpiter')
    .replace(/★/g, 'estrela')
    .replace(/☉/g, 'Sol')
    .replace(/≈/g, ' aproximadamente ')
    .replace(/×/g, ' vezes ')
    .replace(/÷/g, ' dividido por ')
    .replace(/²/g, ' ao quadrado')
    .replace(/³/g, ' ao cubo')
    .replace(/⁴/g, ' à quarta')
    .replace(/→/g, ', ')
    .replace(/·/g, ', ')
    .replace(/…/g, '...')
    .replace(/(\d)\s?km\/s/g, '$1 quilômetros por segundo')
    .replace(/(\d)\s?Mpc/g, '$1 megaparsecs')
    .replace(/(\d)\s?nm\b/g, '$1 nanômetros')
    .replace(/(\d)\s?µm\b/g, '$1 micrômetros')
    .replace(/(\d)\s?K\b/g, '$1 kelvin')
    .replace(/(\d)\s?°C/g, '$1 graus Celsius')
    .replace(/(\d)\s?ppm/g, '$1 partes por milhão')
    .replace(/\s+/g, ' ')
    .trim()
}

function chunks(text: string): string[] {
  const parts = text.match(/[^.!?;:]+[.!?;:]*/g) ?? [text]
  const out: string[] = []
  for (const p of parts) {
    const s = p.trim()
    if (!s) continue
    if (out.length && (out[out.length - 1].length + s.length < 140)) out[out.length - 1] += ' ' + s
    else out.push(s)
  }
  return out
}

/** Reads `text` aloud, replacing anything being read. */
export function speak(text: string, id: string | null = null) {
  if (!voiceSupported()) return
  const synth = window.speechSynthesis
  const my = ++token
  synth.cancel()
  const parts = chunks(speechText(text))
  if (!parts.length) return
  emit({ speaking: true, id })
  const rate = getPreferences().voiceRate
  // A short pause lets cancel() settle (Android) and lets the scene's
  // animation start before the voice.
  setTimeout(() => {
    if (my !== token) return
    const voice = pickVoice()
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p)
      u.lang = voice?.lang ?? 'pt-BR'
      if (voice) u.voice = voice
      u.rate = rate
      u.pitch = 1.04
      if (i === parts.length - 1) {
        u.onend = () => my === token && emit({ speaking: false, id: null })
        u.onerror = () => my === token && emit({ speaking: false, id: null })
      }
      synth.speak(u)
    })
  }, 120)
}

export function stopSpeaking() {
  token++
  if (voiceSupported()) window.speechSynthesis.cancel()
  if (state.speaking) emit({ speaking: false, id: null })
}

/** Must run inside a tap: iOS only allows speech after a user gesture. */
export function unlockVoice() {
  if (!voiceSupported()) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
  } catch {}
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

const SERVER: NarratorState = { speaking: false, id: null }

export function useNarrator(): NarratorState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER)
}
