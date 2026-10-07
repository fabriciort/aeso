'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// Abertura: stars converge into the AESo ring while the environment really
// loads (fonts, the sky engine chunk). Then the ring expands and "opens" the
// Observatório. Shortened on later visits in the same session.

const MESSAGES = ['Calibrando instrumentos', 'Carregando o céu', 'Pronto']

export default function Boot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [leaving, setLeaving] = useState(false)
  // null until mounted: the server cannot know about sessionStorage, and the
  // first client render must match the server HTML.
  const [quick, setQuick] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      setQuick(window.sessionStorage.getItem('aeso:booted') === '1')
    } catch {
      setQuick(false)
    }
  }, [])

  const dots = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2
        const dist = 260 + ((i * 97) % 220)
        const start = (i * 2.399) % (Math.PI * 2)
        return { from: { x: Math.cos(start) * dist, y: Math.sin(start) * dist }, to: { x: Math.cos(a) * 34, y: Math.sin(a) * 34 }, d: (i % 12) * 0.03 }
      }),
    [],
  )

  useEffect(() => {
    if (quick === null) return
    let cancelled = false
    const minTime = quick ? 350 : 1700
    const started = performance.now()
    const tasks: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      // Warm up the sky engine chunk so the Céu opens instantly later.
      import('aladin-lite').catch(() => null),
    ]
    if (!quick) setTimeout(() => !cancelled && setPhase(1), 700)
    Promise.all(tasks.map((t) => Promise.race([t, new Promise((r) => setTimeout(r, 4000))]))).then(() => {
      const wait = Math.max(0, minTime - (performance.now() - started))
      setTimeout(() => {
        if (cancelled) return
        setPhase(2)
        setTimeout(
          () => {
            if (cancelled) return
            setLeaving(true)
            try {
              window.sessionStorage.setItem('aeso:booted', '1')
            } catch {}
            setTimeout(onDone, 650)
          },
          quick ? 50 : 420,
        )
      }, wait)
    })
    return () => {
      cancelled = true
    }
  }, [onDone, quick])

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#030407]"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: leaving ? 0.12 : 0 }}
      aria-live="polite"
      aria-label="Abrindo o Observatório"
    >
      <motion.div
        className="relative h-28 w-28"
        animate={leaving ? { scale: 12, opacity: 0, filter: 'blur(6px)' } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
      >
        {quick === false &&
          dots.map((p, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full bg-white"
              initial={{ x: p.from.x, y: p.from.y, opacity: 0 }}
              animate={{ x: p.to.x, y: p.to.y, opacity: [0, 1, 0.9, 0] }}
              transition={{ duration: 1.0, delay: p.d, ease: [0.22, 1, 0.36, 1], opacity: { duration: 1.25, delay: p.d, times: [0, 0.3, 0.8, 1] } }}
            />
          ))}
        <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full -rotate-90">
          <defs>
            <linearGradient id="boot-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="55%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="56"
            cy="56"
            r="34"
            fill="none"
            stroke="url(#boot-ring)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: quick ? 1 : 0 }}
            animate={{ pathLength: quick === null ? 0 : 1 }}
            transition={{ duration: 0.9, delay: quick ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>
        <motion.span
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          initial={{ scale: quick ? 1 : 0 }}
          animate={{ scale: quick === null ? 0 : 1, boxShadow: phase >= 2 ? '0 0 40px 12px rgba(255,255,255,0.75)' : '0 0 18px 4px rgba(255,255,255,0.6)' }}
          transition={{ duration: 0.6, delay: quick ? 0 : 1.1 }}
        />
      </motion.div>
      <div className="absolute inset-x-0 top-[calc(50%+90px)] text-center">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: leaving ? 0 : 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="text-[13px] tracking-[0.02em] text-white/45"
        >
          {quick === false ? MESSAGES[phase] : ''}
        </motion.p>
      </div>
    </motion.div>
  )
}
