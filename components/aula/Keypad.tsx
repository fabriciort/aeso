'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'

// Teclado numérico da aula: na tela, para o teclado do celular não cobrir o
// palco. O ponto é opcional (separa as classes: 12.500).

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export function Keypad({ value, onChange, onEnter, disabled, max = 14 }: { value: string; onChange: (v: string) => void; onEnter?: () => void; disabled?: boolean; max?: number }) {
  const press = (k: string) => {
    if (disabled) return
    haptic(4)
    if (k === '⌫') onChange(value.slice(0, -1))
    else if (value.replace(/\D/g, '').length < max) onChange(value + k)
  }

  // A physical keyboard works too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled || e.metaKey || e.ctrlKey) return
      if (/^[0-9.]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('⌫')
      else if (e.key === 'Enter' && value) onEnter?.()
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Teclado numérico">
      {KEYS.map((k) => (
        <motion.button
          key={k}
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={disabled}
          onClick={() => press(k)}
          aria-label={k === '⌫' ? 'Apagar' : k === '.' ? 'Ponto' : k}
          className={cn(
            'focus-ring grid h-[52px] place-items-center rounded-2xl text-[24px] font-medium tabular-nums text-white transition-colors disabled:opacity-40',
            k === '⌫' || k === '.' ? 'bg-transparent text-white/70 hover:bg-white/[0.05]' : 'bg-white/[0.07] hover:bg-white/[0.11]',
          )}
        >
          {k === '⌫' ? <Delete className="h-6 w-6" /> : k}
        </motion.button>
      ))}
    </div>
  )
}

/** The answer being typed, large, with a caret. */
export function Display({ value, state }: { value: string; state?: 'right' | 'wrong' | null }) {
  return (
    <motion.div
      animate={state === 'wrong' ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex h-[60px] items-center justify-center rounded-2xl border text-[34px] font-semibold tabular-nums tracking-tight transition-colors',
        state === 'right' ? 'border-white bg-white text-black' : state === 'wrong' ? 'border-rose-400/60 text-rose-100' : 'border-white/15 text-white',
      )}
      aria-live="polite"
    >
      {value || <span className="text-white/25">?</span>}
      {!state && <span className="ml-0.5 inline-block h-8 w-[2px] animate-pulse bg-white/70" />}
    </motion.div>
  )
}

/** Same number? Ignores the dots and spaces that only group the digits. */
export function sameAnswer(typed: string, answer: string | number): boolean {
  const n = (v: string) => v.replace(/[.\s]/g, '').replace(/^0+(?=\d)/, '').toLowerCase()
  return n(typed) === n(String(answer))
}

export const normalizeAnswer = (v: string) => v.replace(/[.\s]/g, '').replace(/^0+(?=\d)/, '')
