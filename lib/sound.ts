'use client'

import { getPreferences } from './preferences'

// Sons das aulas: curtos, baixos e sintetizados na hora (nenhum arquivo para
// baixar). Acerto sobe, erro desce sem punir, fim de aula é um arpejo.
// Desligam em Ajustes.

export type Som = 'certo' | 'erro' | 'fim'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** [frequency (Hz), start (s), duration (s)] */
const NOTAS: Record<Som, [number, number, number][]> = {
  certo: [
    [659.25, 0, 0.14],
    [987.77, 0.075, 0.22],
  ],
  erro: [
    [246.94, 0, 0.16],
    [207.65, 0.08, 0.22],
  ],
  fim: [
    [523.25, 0, 0.2],
    [659.25, 0.11, 0.2],
    [783.99, 0.22, 0.24],
    [1046.5, 0.34, 0.5],
  ],
}

export function som(s: Som) {
  if (!getPreferences().sounds) return
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + 0.01
  const peak = s === 'erro' ? 0.045 : 0.06
  for (const [freq, start, dur] of NOTAS[s]) {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = s === 'erro' ? 'triangle' : 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, t0 + start)
    g.gain.exponentialRampToValueAtTime(peak, t0 + start + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur)
    o.connect(g).connect(a.destination)
    o.start(t0 + start)
    o.stop(t0 + start + dur + 0.03)
  }
}
