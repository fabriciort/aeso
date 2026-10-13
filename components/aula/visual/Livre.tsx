'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Eraser, Grid3x3, NotebookPen, Pencil, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Azulejos, type AzulejosState } from './Azulejos'
import { Saldo, type SaldoState } from './Saldo'
import { Tabela, type TabelaState } from './Tabela'

// Modelo livre: quando nenhum modelo-âncora serve (U0: como estudar). Mostra
// o que o estado tem de visível: um ciclo de etapas, materiais, uma página
// de caderno, fichas para pôr em ordem. Estados sem nada visível não
// desenham nada: o cartão fica só com o texto.

export interface LivreState {
  /** A jornada da formação: as paradas, a atual e (opcional) as já feitas. */
  jornada?: string[]
  aqui?: number
  feitas?: number
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
  /** Uma expressão resolvida em etapas, uma por linha; `destaque` é um trecho da última. */
  expressao?: string[]
  destaque?: string
  /** Visores de calculadora lado a lado. */
  calculadoras?: { nome: string; teclas: string; visor: string }[]
  /** A tabela de proporção (U10). */
  tabela?: TabelaState
  /** Fichas de saldo + e − (U12). */
  saldo?: SaldoState
  /** Azulejos algébricos: x², x e 1 (U14). */
  azulejos?: AzulejosState
}

export interface LivreInteract {
  order?: string[]
  onFicha?: (f: string) => void
  wrong?: boolean
  /** Tabela, Mexa "completar": um toque numa coluna vazia, e quantas já aparecem. */
  onColuna?: (c: number) => void
  mostradas?: number
  /** Saldo, Mexa "tirar": fichas já tiradas, pares zero já postos. */
  removidas?: number
  paresPostos?: number
  onTirar?: () => void
  onPar?: () => void
  /** Azulejos, Mexa "agrupar": tipos já juntados e o toque numa peça. */
  agrupados?: string[]
  onPeca?: (tipo: string) => void
}

const ICONS: Record<string, typeof Pencil> = { celular: Smartphone, lápis: Pencil, borracha: Eraser, 'caderno fechado': NotebookPen, caderno: NotebookPen, 'caderno quadriculado': Grid3x3 }

export function hasLivre(s: LivreState): boolean {
  return Boolean(s.azulejos?.pecas?.length || s.saldo || s.tabela?.linhas?.length || s.expressao?.length || s.calculadoras?.length || s.jornada || s.etapas || s.materiais || s.fichas || s.pagina || s.dicas || s.alvos || s.registros || s.caminhos || s.comparacao || s.atalho || s.superficie)
}

export function Livre({ s, size, ...it }: { s: LivreState; size: { w: number; h: number } } & LivreInteract) {
  if (s.azulejos?.pecas?.length) return <Azulejos s={s.azulejos} size={size} agrupados={it.agrupados} onPeca={it.onPeca} wrong={it.wrong} />
  if (s.saldo) return <Saldo s={s.saldo} size={size} removidas={it.removidas} paresPostos={it.paresPostos} onTirar={it.onTirar} onPar={it.onPar} wrong={it.wrong} />
  if (s.tabela?.linhas?.length) return <Tabela s={s.tabela} size={size} onColuna={it.onColuna} mostradas={it.mostradas} wrong={it.wrong} />
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
      {s.expressao?.length && s.fichas && s.lugares ? (
        <>
          <Expressao etapas={s.expressao} destaque={s.destaque} w={size.w} />
          <Ordenar fichas={s.fichas} lugares={s.lugares} order={it.order ?? []} onFicha={it.onFicha} wrong={it.wrong} />
        </>
      ) : s.expressao?.length ? (
        <Expressao etapas={s.expressao} destaque={s.destaque} w={size.w} />
      ) : s.calculadoras?.length ? (
        <Calculadoras c={s.calculadoras} />
      ) : s.jornada ? (
        <Jornada paradas={s.jornada} aqui={s.aqui ?? 0} feitas={s.feitas ?? 0} h={size.h} />
      ) : s.fichas && s.lugares ? (
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

/** Each step of the expression on its own line; the last is the current one. */
function Expressao({ etapas, destaque, w }: { etapas: string[]; destaque?: string; w: number }) {
  const last = etapas.length - 1
  // A long line shrinks to fit the width (about 0.56 em per character), never below 18 px.
  const caber = (t: string, max: number) => Math.max(18, Math.min(max, (w - 24) / (0.56 * Math.max(1, t.length))))
  const marked = (t: string) => {
    const at = destaque ? t.indexOf(destaque) : -1
    if (at < 0) return t
    return (
      <>
        {t.slice(0, at)}
        <motion.span layoutId="exp-destaque" className="rounded-lg px-1.5 py-0.5 text-[#f6b74e] ring-2 ring-[#f6b74e]">
          {destaque}
        </motion.span>
        {t.slice(at + destaque!.length)}
      </>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3">
      {etapas.map((t, i) => (
        <motion.p
          key={`${i}-${t}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i === last ? 0.15 : 0, duration: 0.45 }}
          className={cn('whitespace-nowrap font-semibold tabular-nums', i === last ? 'text-white' : 'text-white/45')}
          style={{ fontSize: i === last ? caber(t, 32) : Math.min(20, caber(t, 20)) }}
        >
          {i === last ? marked(t) : t}
        </motion.p>
      ))}
    </div>
  )
}

function Calculadoras({ c }: { c: { nome: string; teclas: string; visor: string }[] }) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-4">
      {c.map((k, i) => (
        <motion.div key={k.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="flex w-[150px] flex-col gap-2 rounded-3xl border border-white/15 bg-white/[0.04] p-3">
          <span className="text-center text-[13px] font-medium text-white/55">{k.nome}</span>
          <span className="rounded-xl bg-[#0f1a12] px-3 py-3 text-right font-mono text-[30px] font-semibold tabular-nums text-[#c8f7c5]">{k.visor}</span>
          <span className="text-center text-[13px] tabular-nums text-white/50">{k.teclas}</span>
        </motion.div>
      ))}
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
      <div className="flex min-h-16 flex-wrap justify-center gap-3">
        {loose.map((f) => (
          <motion.button key={f} layoutId={`ficha-${f}`} type="button" onClick={() => onFicha?.(f)} className="h-14 rounded-2xl border border-white/20 bg-white/[0.06] px-5 text-[18px] font-medium text-white active:scale-95">
            {f}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/**
 * The journey of the formation: a path of stops, from counting to Calculus.
 * The stops already done are checked, the current one is lit and says "você
 * está aqui", the ones ahead wait, dim. The path draws itself on arrival.
 */
function Jornada({ paradas, aqui, feitas, h }: { paradas: string[]; aqui: number; feitas: number; h: number }) {
  const row = Math.max(26, Math.min(46, (h - 24) / paradas.length))
  const dot = Math.min(22, row * 0.55)
  return (
    <ol className="relative flex flex-col" style={{ gap: 0 }} aria-label="A jornada da formação">
      {/* The path behind the stops. */}
      <motion.span
        aria-hidden
        className="absolute w-[2px] origin-top rounded-full bg-white/15"
        style={{ left: dot / 2 - 1, top: row / 2, height: row * (paradas.length - 1) }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        aria-hidden
        className="absolute w-[2px] origin-top rounded-full bg-white/80"
        style={{ left: dot / 2 - 1, top: row / 2 }}
        initial={{ height: 0 }}
        animate={{ height: row * Math.max(0, aqui) }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {paradas.map((p, i) => {
        const done = i < Math.max(feitas, aqui)
        const on = i === aqui
        return (
          <motion.li
            key={p}
            className="relative flex items-center gap-4"
            style={{ height: row }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}
          >
            <span
              className={cn(
                'relative grid shrink-0 place-items-center rounded-full transition-colors duration-500',
                on ? 'bg-[#f6b74e]' : done ? 'bg-white' : 'border-2 border-white/20 bg-[#05060a]',
              )}
              style={{ width: dot, height: dot }}
            >
              {on && <motion.span aria-hidden className="absolute inset-0 rounded-full bg-[#f6b74e]" animate={{ scale: [1, 1.9], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />}
              {done && !on && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
            </span>
            <span className={cn('text-[17px] leading-none transition-colors duration-500', on ? 'font-semibold text-white' : done ? 'text-white/70' : 'text-white/40')}>{p}</span>
            {on && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="rounded-full bg-[#f6b74e]/15 px-2.5 py-1 text-[13px] font-medium leading-none text-[#f6b74e]">
                você está aqui
              </motion.span>
            )}
          </motion.li>
        )
      })}
    </ol>
  )
}
