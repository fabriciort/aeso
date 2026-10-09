// A synthesized two-tone siren (Web Audio API). The AudioContext is created
// lazily, inside the student's tap ("Ouvir"), as browsers require. The Palco
// drives the heard frequency every frame; stopSiren fades out and frees the
// nodes. Moderate volume, with fade in/out.

type Ctor = typeof AudioContext

let ctx: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null
let filter: BiquadFilterNode | null = null

const VOLUME = 0.07

/** The two tones of the siren (Hz), alternating every TONE_MS. */
export const SIREN_TONES = [650, 870] as const
export const TONE_MS = 600

export function sirenTone(nowMs: number): number {
  return SIREN_TONES[Math.floor(nowMs / TONE_MS) % 2]
}

export function audioSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return Boolean(w.AudioContext ?? w.webkitAudioContext)
}

/** Call inside a user gesture. Returns false if audio is unavailable. */
export function startSiren(): boolean {
  try {
    const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
    const AC = w.AudioContext ?? w.webkitAudioContext
    if (!AC) return false
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    if (osc) return true
    const t = ctx.currentTime
    osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = SIREN_TONES[0]
    filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2600
    gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(VOLUME * 0.6, t + 0.4)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    return true
  } catch {
    return false
  }
}

/** Heard frequency (Hz) and loudness (0–1), called by the Palco every frame. */
export function updateSiren(freq: number, level: number) {
  if (!ctx || !osc || !gain) return
  const t = ctx.currentTime
  if (Number.isFinite(freq)) osc.frequency.setTargetAtTime(Math.min(Math.max(freq, 80), 4000), t, 0.012)
  gain.gain.setTargetAtTime(VOLUME * Math.min(Math.max(level, 0), 1), t, 0.08)
}

export function sirenPlaying(): boolean {
  return Boolean(osc)
}

export function stopSiren() {
  if (!ctx || !osc || !gain) return
  const t = ctx.currentTime
  const o = osc
  const g = gain
  const f = filter
  g.gain.cancelScheduledValues(t)
  g.gain.setValueAtTime(g.gain.value, t)
  g.gain.linearRampToValueAtTime(0, t + 0.35)
  o.stop(t + 0.4)
  o.onended = () => {
    o.disconnect()
    f?.disconnect()
    g.disconnect()
  }
  osc = null
  gain = null
  filter = null
}
