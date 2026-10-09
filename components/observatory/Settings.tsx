'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, SlidersHorizontal, Volume2 } from 'lucide-react'
import { canFullscreen, enterFocus, exitFocus, haptic, isInstalledApp } from '@/lib/observatory/immersive'
import { stopSpeaking, unlockVoice, voiceSupported } from '@/lib/observatory/voice'
import { setPreferences, usePreferences } from '@/lib/preferences'
import { cn } from '@/lib/utils'

// Ajustes do laboratório. Discreet on purpose: a row of small pills on the
// lab cover and a popover inside the lab. Both are off by default.

function useCapabilities() {
  const [caps, setCaps] = useState({ fullscreen: false, voice: false })
  useEffect(() => setCaps({ fullscreen: canFullscreen() && !isInstalledApp(), voice: voiceSupported() }), [])
  return caps
}

function toggleVoice(on: boolean) {
  if (on) unlockVoice()
  else stopSpeaking()
  setPreferences({ voice: on })
}

/** Pills shown under "Entrar no laboratório". Only stores the choice. */
export function CoverOptions({ className }: { className?: string }) {
  const prefs = usePreferences()
  const caps = useCapabilities()
  if (!caps.fullscreen && !caps.voice) return null
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2 sm:justify-start', className)}>
      {caps.voice && (
        <Pill on={prefs.voice} onClick={() => toggleVoice(!prefs.voice)} icon={<Volume2 className="h-3.5 w-3.5" />}>
          Voz da Vega
        </Pill>
      )}
      {caps.fullscreen && (
        <Pill on={prefs.fullscreen} onClick={() => setPreferences({ fullscreen: !prefs.fullscreen })} icon={<Maximize2 className="h-3.5 w-3.5" />}>
          Tela cheia
        </Pill>
      )}
    </div>
  )
}

function Pill({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        haptic(6)
        onClick()
      }}
      className={cn(
        'focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] transition-all active:scale-95',
        on ? 'border-white/25 bg-white/[0.12] text-white' : 'border-white/[0.07] bg-transparent text-white/45 hover:text-white/75',
      )}
    >
      {icon}
      {children}
      <span className={cn('ml-0.5 h-1.5 w-1.5 rounded-full transition-colors', on ? 'bg-emerald-300' : 'bg-white/20')} />
    </button>
  )
}

/** The in-lab settings button + popover. Applies changes immediately. */
export function LabSettings() {
  const [open, setOpen] = useState(false)
  const prefs = usePreferences()
  const caps = useCapabilities()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!caps.fullscreen && !caps.voice) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn('focus-ring grid h-10 w-10 place-items-center rounded-full transition active:scale-95', open ? 'bg-white/[0.12] text-white' : 'text-white/55 hover:bg-white/10 hover:text-white')}
        aria-label="Ajustes"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-[18px] w-[18px]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            style={{ originX: 1, originY: 0 }}
            className="glass-strong absolute right-0 top-12 z-50 w-[272px] rounded-[22px] p-2"
          >
            {caps.voice && (
              <>
                <Row label="Voz da Vega" hint="Lê cada cena em voz alta" on={prefs.voice} onChange={toggleVoice} />
                <AnimatePresence initial={false}>
                  {prefs.voice && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="flex gap-1 px-3 pb-2.5 pt-0.5">
                        {[
                          ['Calma', 0.9],
                          ['Normal', 1],
                          ['Rápida', 1.15],
                        ].map(([label, rate]) => (
                          <button
                            key={label}
                            onClick={() => setPreferences({ voiceRate: Number(rate) })}
                            className={cn('focus-ring h-8 flex-1 rounded-full text-[12px] transition', prefs.voiceRate === rate ? 'bg-white text-black' : 'bg-white/[0.06] text-white/60')}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
            {caps.fullscreen && (
              <Row
                label="Tela cheia"
                hint="Esconde as barras do navegador"
                on={prefs.fullscreen}
                onChange={(on) => {
                  setPreferences({ fullscreen: on })
                  void (on ? enterFocus() : exitFocus())
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        haptic(6)
        onChange(!on)
      }}
      className="focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] text-white">{label}</span>
        <span className="block text-[12px] text-white/45">{hint}</span>
      </span>
      <span className={cn('relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors', on ? 'bg-emerald-400' : 'bg-white/15')}>
        <motion.span className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow" animate={{ left: on ? 21 : 3 }} transition={{ type: 'spring', stiffness: 600, damping: 36 }} />
      </span>
    </button>
  )
}
