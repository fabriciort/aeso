'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Blocos de base 10: cubos (unidades), barras (dezenas), placas (centenas)
// e blocos de mil. Mudanças de quantidade animam: um grupo que fecha some
// num lugar e aparece no outro, nada pisca.

export interface BlocosState {
  milhares?: number
  centenas?: number
  dezenas?: number
  unidades?: number
  total?: number
  totalVisivel?: boolean
  destaque?: string
  rotulos?: string[]
  tamanhoGrupo?: number
  faltam?: number
  abrirDezenas?: boolean
  abrirCentenas?: boolean
}

const spring = { type: 'spring', stiffness: 380, damping: 32 } as const
const ink = 'rgba(255,255,255,0.9)'

export type Ordem = 'unidades' | 'dezenas' | 'centenas' | 'milhares'

export function Blocos({ s, size, onTap, canTap }: { s: BlocosState; size: { w: number; h: number }; onTap?: (ordem: Ordem) => void; canTap?: (ordem: Ordem) => boolean }) {
  const tap = (o: Ordem) => (onTap && (!canTap || canTap(o)) ? () => onTap(o) : undefined)
  const m = Math.max(0, s.milhares ?? 0)
  const c = Math.max(0, s.centenas ?? 0)
  const d = Math.max(0, s.dezenas ?? 0)
  const u = Math.max(0, s.unidades ?? 0)
  // Cube size: the whole scene fits the stage, as large as it can be.
  const groups = [m, c, d, u].filter(Boolean).length || 1
  const rowsU = Math.ceil(u / 10)
  const wide = m * 13.5 + (c ? 10 + (c - 1) * 2.8 : 0) + Math.min(d, 12) * 1.3 + Math.min(Math.max(u, s.tamanhoGrupo ?? 0), 10) * 1.05
  const tall = Math.max(d || c ? 10.5 : 0, m ? 13.5 : 0, rowsU * 1.05, 3) + (s.total !== undefined || s.rotulos ? 3 : 0)
  const k = Math.round(Math.max(6, Math.min(m || c ? 24 : 34, (size.w - 24 - 20 * (groups - 1)) / Math.max(wide, 8), (size.h - 24) / tall)))
  const total = s.total ?? m * 1000 + c * 100 + d * 10 + u
  const showTotal = s.totalVisivel !== false && s.total !== undefined
  const hl = (ordem: string) => s.destaque === ordem

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex max-w-full flex-wrap items-end justify-center gap-x-5 gap-y-4">
        <Group show={m > 0} highlight={hl('milhares')} onTap={tap('milhares')}>
          {Array.from({ length: m }).map((_, i) => (
            <motion.div key={`m${i}`} layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={spring}>
              <Mil k={k} />
            </motion.div>
          ))}
        </Group>
        <Group show={c > 0} highlight={hl('centenas')} onTap={tap('centenas')}>
          {Array.from({ length: c }).map((_, i) => (
            <motion.div key={`c${i}`} layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={spring} style={{ marginLeft: i ? -k * 7.2 : 0 }}>
              <Placa k={k} open={s.abrirCentenas} />
            </motion.div>
          ))}
        </Group>
        <Group show={d > 0} highlight={hl('dezenas')} onTap={tap('dezenas')}>
          {Array.from({ length: d }).map((_, i) => (
            <motion.div key={`d${i}`} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6 }} transition={spring}>
              <Barra k={k} open={s.abrirDezenas} />
            </motion.div>
          ))}
        </Group>
        <Group show={u > 0 || Boolean(s.tamanhoGrupo)} highlight={hl('unidades')} onTap={tap('unidades')}>
          <Cubos n={u} k={k} frame={s.tamanhoGrupo && u <= (s.tamanhoGrupo ?? 0) ? s.tamanhoGrupo : undefined} />
        </Group>
      </div>
      <AnimatePresence>
        {showTotal && (
          <motion.p key="total" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[22px] font-semibold tabular-nums text-white">
            {total.toLocaleString('pt-BR')}
          </motion.p>
        )}
      </AnimatePresence>
      {s.rotulos && (
        <div className="flex gap-4 text-[15px] text-white/60">
          {s.rotulos.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function Group({ show, highlight, onTap, children }: { show: boolean; highlight?: boolean; onTap?: () => void; children: React.ReactNode }) {
  if (!show) return null
  return (
    <motion.div
      layout
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      whileTap={onTap ? { scale: 0.96 } : undefined}
      className={cn(
        'relative flex flex-wrap items-end justify-center gap-[3px] rounded-2xl p-2 transition-colors',
        onTap && 'cursor-pointer hover:bg-white/[0.04]',
        highlight && 'bg-[#f6b74e]/[0.12] ring-1 ring-[#f6b74e]/60',
      )}
    >
      {onTap && <span aria-hidden className="pointer-events-none absolute -inset-1 animate-pulse rounded-[20px] border border-dashed border-white/45" />}
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  )
}

function Cube({ k, empty }: { k: number; empty?: boolean }) {
  return <span className={cn('block rounded-[2px]', empty ? 'border border-dashed border-white/40' : '')} style={{ width: k - 2, height: k - 2, background: empty ? 'transparent' : ink }} />
}

/** Loose cubes in rows of 10; with a frame of `frame` slots when grouping. */
function Cubos({ n, k, frame }: { n: number; k: number; frame?: number }) {
  if (frame) {
    return (
      <div className="grid gap-[2px] rounded-md border border-white/25 p-[3px]" style={{ gridTemplateColumns: `repeat(${Math.min(frame, 10)}, ${k - 2}px)` }}>
        {Array.from({ length: frame }).map((_, i) => (i < n ? <Cube key={i} k={k} /> : <Cube key={i} k={k} empty />))}
      </div>
    )
  }
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${Math.min(n, 10)}, ${k - 2}px)` }}>
      <AnimatePresence initial={false}>
        {Array.from({ length: n }).map((_, i) => (
          <motion.span key={i} layout initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.4 }} transition={spring}>
            <Cube k={k} />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** A bar of 10 cubes: one solid piece, the divisions drawn on it. Open: 10 loose cubes. */
function Barra({ k, open }: { k: number; open?: boolean }) {
  if (open) {
    return (
      <div className="flex flex-col" style={{ gap: 3 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="block rounded-[2px]" style={{ width: k - 2, height: k - 2, background: ink }} />
        ))}
      </div>
    )
  }
  return <span className="block rounded-[3px]" style={{ width: k - 2, height: k * 10 - 2, background: ink, backgroundImage: lines('to bottom', k) }} />
}

const lines = (dir: string, k: number) => `repeating-linear-gradient(${dir}, transparent 0, transparent ${k - 1.5}px, rgba(5,6,10,0.5) ${k - 1.5}px, rgba(5,6,10,0.5) ${k}px)`

/** A plate of 10 × 10: one solid square with the grid drawn on it. */
function Placa({ k, open }: { k: number; open?: boolean }) {
  if (open) {
    return (
      <div className="flex" style={{ gap: 3 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Barra key={i} k={k} />
        ))}
      </div>
    )
  }
  return <span className="block rounded-[3px] border border-[#05060a]" style={{ width: k * 10, height: k * 10, background: 'rgba(255,255,255,0.88)', backgroundImage: `${lines('to bottom', k)}, ${lines('to right', k)}` }} />
}

/** A thousand: ten plates stacked, in a light oblique projection; the grid shows on the front. */
function Mil({ k }: { k: number }) {
  const side = k * 10
  const step = k * 0.32
  return (
    <div className="relative" style={{ width: side + step * 9, height: side + step * 9 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-[3px] border border-[#05060a]"
          style={{
            left: i * step,
            bottom: i * step,
            width: side,
            height: side,
            background: `rgba(255,255,255,${0.5 + i * 0.042})`,
            backgroundImage: i === 9 ? `${lines('to bottom', k)}, ${lines('to right', k)}` : undefined,
          }}
        />
      ))}
    </div>
  )
}
