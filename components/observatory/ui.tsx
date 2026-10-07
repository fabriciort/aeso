'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/observatory/immersive'

// Small UI primitives shared by the Observatório.

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'md' | 'lg' }
>(function Button({ variant = 'primary', size = 'md', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        'focus-ring inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        size === 'lg' ? 'h-12 px-6 text-[15px]' : 'h-10 px-4 text-[14px]',
        variant === 'primary' && 'bg-white text-black hover:bg-white/90',
        variant === 'secondary' && 'border border-white/10 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]',
        variant === 'ghost' && 'text-white/65 hover:bg-white/[0.06] hover:text-white',
        className,
      )}
    />
  )
})

export function Slider({
  value,
  min,
  max,
  step = 0.001,
  onChange,
  label,
  display,
  className,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  label: string
  display?: React.ReactNode
  className?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-white/60">{label}</span>
        {display && <span className="font-mono text-[13px] tabular-nums text-white">{display}</span>}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="aeso-range w-full"
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
    </label>
  )
}

export function Callout({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'good' | 'warn' | 'info'; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border px-4 py-3 text-[14px] leading-relaxed',
        tone === 'neutral' && 'border-white/[0.08] bg-white/[0.03] text-white/75',
        tone === 'good' && 'border-emerald-300/20 bg-emerald-400/[0.07] text-emerald-50/90',
        tone === 'warn' && 'border-amber-300/20 bg-amber-400/[0.07] text-amber-50/90',
        tone === 'info' && 'border-sky-300/20 bg-sky-400/[0.07] text-sky-50/90',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

/** The AESo mark: a ring with a bright core. */
export function Logo({ size = 28, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-violet-500" />
      <span className="absolute rounded-full bg-[#05060a]" style={{ inset: Math.max(2, size * 0.11) }} />
      <span
        className={cn('relative rounded-full bg-white', glow && 'shadow-[0_0_12px_3px_rgba(255,255,255,0.75)]')}
        style={{ width: size * 0.22, height: size * 0.22 }}
      />
    </span>
  )
}

export function Choice({
  selected,
  state,
  onClick,
  children,
  disabled,
}: {
  selected?: boolean
  state?: 'correct' | 'wrong' | null
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => {
        haptic(8)
        onClick?.()
      }}
      disabled={disabled}
      className={cn(
        'focus-ring w-full rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all duration-200 active:scale-[0.99]',
        !state && !selected && 'border-white/[0.08] bg-white/[0.03] text-white/85 hover:border-white/20 hover:bg-white/[0.06]',
        !state && selected && 'border-sky-300/50 bg-sky-400/10 text-white',
        state === 'correct' && 'border-emerald-300/50 bg-emerald-400/10 text-white',
        state === 'wrong' && 'border-rose-300/40 bg-rose-400/[0.08] text-white/80',
        disabled && !state && 'opacity-50',
      )}
    >
      {children}
    </button>
  )
}
