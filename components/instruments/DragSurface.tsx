'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Direct manipulation layer: drag up/down anywhere on an instrument to change
// a value (planet size, model depth…). A hint shows until the first drag.

export default function DragSurface({
  onDrag,
  hint,
  className,
  onEnd,
}: {
  /** Vertical movement in pixels since the last event (positive = down). */
  onDrag: (dy: number) => void
  hint?: string
  className?: string
  onEnd?: () => void
}) {
  const last = useRef<number | null>(null)
  const [used, setUsed] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <div
      className={cn('absolute inset-0 z-[1] cursor-ns-resize select-none', className)}
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        last.current = e.clientY
        setActive(true)
      }}
      onPointerMove={(e) => {
        if (last.current === null) return
        const dy = e.clientY - last.current
        last.current = e.clientY
        if (dy !== 0) {
          onDrag(dy)
          if (!used) setUsed(true)
        }
      }}
      onPointerUp={() => {
        last.current = null
        setActive(false)
        onEnd?.()
      }}
      onPointerCancel={() => {
        last.current = null
        setActive(false)
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
      <AnimatePresence>
        {hint && !used && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 py-1.5 pl-2 pr-3.5 text-[12.5px] text-white/85 backdrop-blur-xl"
          >
            <motion.span animate={{ y: [0, -3, 0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col text-white/70">
              <ChevronUp className="-mb-1.5 h-3.5 w-3.5" />
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/** A short burst of particles, for moments of success. */
export function Burst({ color = '#6ee7b7', count = 14 }: { color?: string; count?: number }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 2) * 0.2
        const d = 46 + (i % 3) * 18
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 0, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        )
      })}
    </span>
  )
}
