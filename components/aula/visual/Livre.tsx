'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eraser, Grid3x3, NotebookPen, Pencil, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

// Modelo livre: quando nenhum modelo-âncora serve (U0: como estudar). Mostra
// o que o estado tem de visível: um ciclo de etapas, materiais, uma página
// de caderno, fichas para pôr em ordem. Estados sem nada visível não
// desenham nada: o cartão fica só com o texto.

export interface LivreState {
  etapas?: string[]
  etapa?: string
  materiais?: string[]
  fichas?: string[]
  lugares?: string[]
  pagina?: { titulo?: string; blocos?: string[] }
  dicas?: string[]
  alvos?: string[]
  registros?: string[]
  caminhos?: string[]
  comparacao?: string[]
  atalho?: string
  destino?: string
  superficie?: string
}

export interface LivreInteract {
  order?: string[]
  onFicha?: (f: string) => void
  wrong?: boolean
}

const ICONS: Record<string, typeof Pencil> = { celular: Smartphone, lápis: Pencil, borracha: Eraser, 'caderno fechado': NotebookPen, caderno: NotebookPen, 'caderno quadriculado': Grid3x3 }

export function hasLivre(s: LivreState): boolean {
  return Boolean(s.etapas || s.materiais || s.fichas || s.pagina || s.dicas || s.alvos || s.registros || s.caminhos || s.comparacao || s.atalho || s.superficie)
}

export function Livre({ s, ...it }: { s: LivreState; size: { w: number; h: number } } & LivreInteract) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
      {s.fichas && s.lugares ? (
        <Ordenar fichas={s.fichas} lugares={s.lugares} order={it.order ?? []} onFicha={it.onFicha} wrong={it.wrong} />
      ) : s.etapas ? (
        <Ciclo etapas={s.etapas} atual={s.etapa} />
      ) : s.pagina ? (
        <Pagina titulo={s.pagina.titulo} blocos={s.pagina.blocos ?? []} />
      ) : s.materiais ? (
        <Itens itens={s.materiais} icons />
      ) : s.dicas ? (
        <Itens itens={s.dicas.map((d, i) => `${i + 1}. ${d}`)} column />
      ) : s.atalho && s.destino ? (
        <div className="flex items-center gap-3">
          <Chip>{s.atalho}</Chip>
          <ArrowRight className="h-5 w-5 text-white/40" />
          <Chip>{s.destino}</Chip>
        </div>
      ) : (
        <Itens itens={s.alvos ?? s.registros ?? s.caminhos ?? s.comparacao ?? (s.superficie ? [s.superficie] : [])} column={Boolean(s.alvos)} />
      )}
    </div>
  )
}

function Chip({ children, on, className }: { children: React.ReactNode; on?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-[17px] font-medium transition-colors duration-300', on ? 'border-white bg-white text-black' : 'border-white/15 bg-white/[0.05] text-white/85', className)}>
      {children}
    </span>
  )
}

function Itens({ itens, icons, column }: { itens: string[]; icons?: boolean; column?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', column && 'flex-col')}>
      {itens.map((t, i) => {
        const Icon = icons ? ICONS[t] : undefined
        return (
          <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <Chip>
              {Icon && <Icon className="h-5 w-5 text-white/60" />}
              {t}
            </Chip>
          </motion.div>
        )
      })}
    </div>
  )
}

/** The study cycle: tentar → conferir → tentar de novo → revisar. */
function Ciclo({ etapas, atual }: { etapas: string[]; atual?: string }) {
  return (
    <ol className="flex w-full max-w-[320px] flex-col gap-2">
      {etapas.map((e, i) => {
        const on = e === atual
        return (
          <motion.li key={e} layout className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-semibold tabular-nums transition-colors duration-300', on ? 'bg-white text-black' : 'border border-white/20 text-white/50')}>{i + 1}</span>
            <span className={cn('flex-1 rounded-2xl border px-4 py-3 text-[18px] transition-all duration-300', on ? 'border-white/60 bg-white/[0.1] font-semibold text-white' : 'border-white/[0.08] text-white/55')}>{e}</span>
          </motion.li>
        )
      })}
    </ol>
  )
}

/** A notebook page with the three blocks of every Anote. */
function Pagina({ titulo, blocos }: { titulo?: string; blocos: string[] }) {
  return (
    <div className="caderno w-full max-w-[300px] rounded-2xl p-5">
      {titulo && <p className="mb-4 text-[17px] font-semibold text-white">{titulo}</p>}
      <div className="flex flex-col gap-3">
        {blocos.map((b, i) => (
          <motion.div key={b} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.2 }} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[13px] text-white/50">{b}</p>
            <div className="mt-2 h-1.5 w-3/4 rounded-full bg-white/15" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** Put the fichas in the right order: a tap sends a ficha to the next place. */
function Ordenar({ fichas, lugares, order, onFicha, wrong }: { fichas: string[]; lugares: string[]; order: string[]; onFicha?: (f: string) => void; wrong?: boolean }) {
  const loose = fichas.filter((f) => !order.includes(f))
  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-8">
      <motion.div className="flex w-full gap-3" animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        {lugares.map((l, i) => (
          <div key={l} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[13px] text-white/50">{l}</span>
            <div className={cn('grid h-16 w-full place-items-center rounded-2xl border border-dashed', order[i] ? 'border-transparent' : 'border-white/30')}>
              <AnimatePresence mode="popLayout">
                {order[i] && (
                  <motion.button key={order[i]} layoutId={`ficha-${order[i]}`} type="button" onClick={() => onFicha?.(order[i])} className={cn('h-16 w-full rounded-2xl text-[18px] font-semibold', wrong ? 'bg-rose-400/20 text-rose-100' : 'bg-white text-black')}>
                    {order[i]}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </motion.div>
      <div className="flex min-h-16 gap-3">
        {loose.map((f) => (
          <motion.button key={f} layoutId={`ficha-${f}`} type="button" onClick={() => onFicha?.(f)} className="h-14 rounded-2xl border border-white/20 bg-white/[0.06] px-5 text-[18px] font-medium text-white active:scale-95">
            {f}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
