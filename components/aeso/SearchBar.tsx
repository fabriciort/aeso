'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Crosshair, Search, Sparkles, Telescope, X } from 'lucide-react'
import { suggest } from '@/lib/astro/catalog'
import { formatDec, formatRA } from '@/lib/astro/coords'
import { classifyQuery, describeFilters } from '@/lib/astro/query'
import { cn } from '@/lib/utils'

export interface SearchBarHandle {
  focus: () => void
}

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit: (q: string) => void
  loading?: boolean
  compact?: boolean
  onClear?: () => void
}

interface Option {
  key: string
  query: string
  title: string
  subtitle?: string
  icon: 'object' | 'coords' | 'search'
}

const ICONS = { object: Telescope, coords: Crosshair, search: Sparkles }

const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar(
  { value, onChange, onSubmit, loading, compact, onClear },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(-1)
  const [dismissed, setDismissed] = useState(false)

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }))

  // ⌘K / Ctrl+K / "/" focus the search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const options = useMemo<Option[]>(() => {
    const q = value.trim()
    if (!q) return []
    const out: Option[] = []
    const intent = classifyQuery(q)
    if (intent.kind === 'coordinates') {
      out.push({
        key: 'coords',
        query: q,
        title: `${formatRA(intent.coords.ra)}  ${formatDec(intent.coords.dec)}`,
        subtitle: 'Ir para estas coordenadas',
        icon: 'coords',
      })
    }
    for (const s of suggest(q, 5)) {
      out.push({ key: `s-${s.id}`, query: s.id, title: s.label, subtitle: `${s.type} · ${s.id}`, icon: 'object' })
    }
    if (intent.kind === 'characteristics' && intent.recognized) {
      out.unshift({
        key: 'search',
        query: q,
        title: q,
        subtitle: `Buscar ${describeFilters(intent.filters).replace(/^Objetos/, 'objetos')}`,
        icon: 'search',
      })
    } else if (intent.kind !== 'coordinates' && !out.some((o) => o.query.toLowerCase() === q.toLowerCase())) {
      out.push({ key: 'raw', query: q, title: q, subtitle: 'Buscar por nome ou identificador', icon: 'object' })
    }
    return out.slice(0, 7)
  }, [value])

  useEffect(() => {
    setActive(-1)
    setDismissed(false)
  }, [value])

  const open = focused && !dismissed && options.length > 0 && !loading

  const submit = (q: string) => {
    if (!q.trim()) return
    setDismissed(true)
    inputRef.current?.blur()
    onSubmit(q.trim())
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp' && options.length) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = active >= 0 && open ? options[active] : null
      if (opt) onChange(opt.icon === 'object' && opt.key.startsWith('s-') ? opt.title : value)
      submit(opt ? opt.query : value)
    } else if (e.key === 'Escape') {
      if (open) setDismissed(true)
      else inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <motion.form
        layout
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
        className={cn(
          'glass-strong relative flex items-center overflow-hidden transition-[box-shadow,border-color] duration-300',
          compact ? 'h-14 rounded-[22px] pl-4 pr-2' : 'h-[68px] rounded-[26px] pl-5 pr-2.5',
          focused && 'border-white/20 shadow-[0_0_0_4px_rgba(94,176,255,0.12),0_30px_80px_-20px_rgba(0,0,0,0.8)]',
        )}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <Search className={cn('shrink-0 text-white/45 transition-colors', focused && 'text-white/80', compact ? 'h-[18px] w-[18px]' : 'h-5 w-5')} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="M51, NGC 1300, 202.47 +47.19, galáxias espirais brilhantes…"
          aria-label="Buscar objetos astronômicos"
          aria-expanded={open}
          aria-controls="aeso-suggestions"
          aria-activedescendant={active >= 0 ? `aeso-opt-${active}` : undefined}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent px-3 text-white placeholder:text-white/30 focus:outline-none',
            compact ? 'text-[15px]' : 'text-[17px]',
          )}
        />
        <AnimatePresence initial={false}>
          {value && !loading && (
            <motion.button
              key="clear"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                onChange('')
                onClear?.()
                inputRef.current?.focus()
              }}
              className="focus-ring mr-1 grid h-8 w-8 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
        <button
          type="submit"
          disabled={!value.trim() || loading}
          aria-label="Buscar"
          className={cn(
            'focus-ring grid shrink-0 place-items-center rounded-full bg-white text-black transition-all duration-300 hover:scale-[1.04] active:scale-95 disabled:bg-white/10 disabled:text-white/30 disabled:hover:scale-100',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          ) : (
            <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
          )}
        </button>

        {/* Indeterminate progress hairline */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 h-px overflow-hidden"
            >
              <div className="h-full w-1/3 animate-progress bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="aeso-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.985, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 520, damping: 40 }}
            className="glass-strong absolute inset-x-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-[22px] p-1.5"
          >
            {options.map((o, i) => {
              const Icon = ICONS[o.icon]
              return (
                <li
                  key={o.key}
                  id={`aeso-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (o.key.startsWith('s-')) onChange(o.title)
                    submit(o.query)
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors',
                    i === active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                      o.icon === 'search' ? 'bg-gradient-to-br from-sky-400/25 to-violet-500/25 text-sky-200' : 'bg-white/[0.06] text-white/60',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-white">{o.title}</span>
                    {o.subtitle && <span className="block truncate text-xs text-white/45">{o.subtitle}</span>}
                  </span>
                  {i === active && <kbd className="hidden text-[11px] text-white/35 sm:block">↵</kbd>}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
})

export default SearchBar
