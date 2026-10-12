'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Quadro posicional: uma coluna por casa (… M C D U), o algarismo grande e,
// embaixo, os blocos que ele vale. Para números grandes, o mesmo quadro vira
// um quadro de classes (milhões, milhares, unidades), três casas cada.

export interface QuadroState {
  casas?: string[]
  numero?: number | null
  numeros?: number[]
  algarismos?: (number | null)[]
  /** Uma casa ("C", "U e C"), ou um algarismo (3: acende todo 3). */
  destaque?: string | number | null
  casaDecisiva?: string
  primeiraDiferente?: string
  classes?: (string | null)[]
  grupos?: (number | null)[]
  leituras?: string[]
  cartoes?: number[]
  fichas?: (number | string)[]
  separadores?: number[]
  tamanhoGrupo?: number
  transicoes?: [number, number][]
  etiquetas?: string[]
  escritas?: string[]
  etiqueta?: string
  ditado?: string
  quantidadeOculta?: boolean
  blocosVisiveis?: boolean
  numeroOculto?: boolean
  /** Conta armada: as parcelas, o sinal, o resultado (da direita, pode ser parcial), o vai um e o empresta. */
  conta?: ContaState
  /** Divisão na chave. */
  divisao?: DivisaoState
  /** Quadro de unidades (km … mm): o número numa unidade e a vírgula que anda para outra. */
  medida?: MedidaState
}

export interface MedidaState {
  /** As unidades, da maior para a menor: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']. */
  casas: string[]
  /** O número, na unidade `de` ('1,25' ou 1.25). */
  numero: number | string
  /** A unidade do número: o último algarismo antes da vírgula fica nesta casa. */
  de: string
  /** A unidade de chegada: a vírgula fica depois desta casa, e os zeros que faltam aparecem. */
  para?: string
  /** Quantos algarismos cada casa leva (2 para m², 3 para m³). Padrão 1. */
  porCasa?: number
}

export interface ContaState {
  /** Números ou textos; com vírgula ('3,5' ou 3.5), a conta se alinha pela vírgula. */
  parcelas: (number | string)[]
  sinal?: '+' | '−'
  /** Os algarismos já escritos do resultado, da direita para a esquerda ("2", "32", "232"). */
  resultado?: string
  /** Vai um: um algarismo pequeno acima da casa ({ D: '1' }). */
  reservas?: Record<string, string>
  /** Empresta: o algarismo de cima riscado e o novo valor acima ({ D: '4', U: '12' }). */
  trocas?: Record<string, string>
  /** Casa acesa ('U', 'D', 'C'). */
  destaque?: string
  /** Multiplicação armada: as linhas entre os dois traços ('92', '230'). */
  parciais?: string[]
  /** Decimais: completa com zeros apagados as casas que faltam (3,5 aparece 3,50). */
  zeros?: boolean
  /** 'direita': arma como nos inteiros, cada caractere numa coluna, sem alinhar a vírgula (o erro, ou a multiplicação). */
  alinhar?: 'direita'
}

export interface DivisaoState {
  /** Um número, ou um texto com vírgula ('7,00'): a vírgula ocupa uma casa, e o quociente leva a sua ('1,75'). */
  dividendo: number | string
  divisor: number
  /** Os algarismos do quociente já escritos, da esquerda ('10'). */
  quociente?: string
  /** Linhas embaixo do dividendo: o texto e a casa (da esquerda, a partir de 0) onde ele termina. */
  linhas?: [string, number][]
  /** Casa do dividendo acesa (da esquerda, a partir de 0). */
  destaque?: number
}

export interface QuadroInteract {
  /** Digits placed by the student, one per column (null: empty). */
  filled?: (number | null)[]
  onSlot?: (i: number) => void
  /** Values placed in the classes, one per class. */
  classValues?: (number | null)[]
  onClass?: (i: number) => void
  /** Gaps (after digit i) where the student put a separator. */
  seps?: number[]
  onGap?: (i: number) => void
  /** Wrong placement: flash. */
  wrong?: boolean
  /** Quadro de unidades: a tap on a column puts the comma after it. */
  onCasa?: (casa: string) => void
}

const NOMES: Record<string, string> = { U: 'unidades', D: 'dezenas', C: 'centenas', M: 'milhares', DM: 'dezenas de milhar', CM: 'centenas de milhar' }
const ORDEM = ['U', 'D', 'C', 'M', 'DM', 'CM', 'UMi', 'DMi', 'CMi', 'UBi']
const amber = '#f6b74e'
const spring = { type: 'spring', stiffness: 420, damping: 30 } as const

const digitsOf = (n: number) => String(Math.abs(Math.trunc(n))).split('').map(Number)
const fmt = (n: number) => n.toLocaleString('pt-BR')

export function Quadro({ s, size, ...it }: { s: QuadroState; size: { w: number; h: number } } & QuadroInteract) {
  const tags = (s.etiquetas ?? s.escritas ?? (s.etiqueta ? [s.etiqueta] : [])).concat((s.fichas ?? []).map((f) => (typeof f === 'number' ? fmt(f) : f)))

  if (s.conta) return <Conta c={s.conta} size={size} />
  if (s.divisao) return <Divisao d={s.divisao} size={size} />
  if (s.medida) return <Medida m={s.medida} size={size} onCasa={it.onCasa} wrong={it.wrong} />
  if (s.quantidadeOculta && tags.length) return <Tags tags={tags} big />
  if (s.transicoes?.length) return <Transicoes t={s.transicoes} />
  if (s.algarismos && s.tamanhoGrupo) return <Separar s={s} seps={it.seps ?? s.separadores ?? []} onGap={it.onGap} size={size} />
  if (s.classes && (s.grupos || it.classValues || s.numero !== undefined)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-5">
        <Classes s={s} size={size} values={it.classValues} onClass={it.onClass} wrong={it.wrong} />
        {tags.length > 0 && <Tags tags={tags} />}
      </div>
    )
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      {s.ditado && <p className="text-center text-[22px] font-medium text-white">“{s.ditado}”</p>}
      <Colunas s={s} size={size} filled={it.filled} onSlot={it.onSlot} wrong={it.wrong} />
      {tags.length > 0 && <Tags tags={tags} />}
    </div>
  )
}

// ---------------------------------------------------------------- colunas

function Colunas({ s, size, filled, onSlot, wrong }: { s: QuadroState; size: { w: number; h: number }; filled?: (number | null)[]; onSlot?: (i: number) => void; wrong?: boolean }) {
  const rows: (number | null)[][] = []
  if (filled) rows.push(filled)
  else if (s.numeros?.length) for (const n of s.numeros) rows.push(digitsOf(n))
  else if (typeof s.numero === 'number' && !s.numeroOculto) rows.push(digitsOf(s.numero))
  else if (s.algarismos && s.numero !== null) rows.push(s.algarismos)
  const width = Math.max(s.casas?.length ?? 0, ...rows.map((r) => r.length), 3)
  const casas = s.casas && s.casas.length >= width ? s.casas : ORDEM.slice(0, width).reverse()
  const destaque = s.destaque ?? s.primeiraDiferente ?? s.casaDecisiva
  const hlCol = typeof destaque === 'string' ? columnsOf(destaque, casas) : new Set<number>()
  const hlDigit = typeof destaque === 'number' ? destaque : null
  const col = Math.min(92, Math.floor((size.w - 16) / casas.length))
  const showBlocks = s.blocosVisiveis !== false && rows.length === 1 && casas.length <= 4 && size.h > 300
  const digitSize = Math.min(60, col * 0.6, rows.length > 1 ? size.h / 7 : size.h / 5)

  // Right-align every row to the columns.
  const aligned = rows.map((r) => [...Array(Math.max(0, casas.length - r.length)).fill(undefined), ...r] as (number | null | undefined)[])
  if (!aligned.length) aligned.push(Array(casas.length).fill(null))

  return (
    <motion.div className="flex" animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
      {casas.map((casa, i) => (
        <div key={casa + i} className={cn('flex flex-col items-center border-white/10', i > 0 && 'border-l')} style={{ width: col }}>
          <span className={cn('pb-2 text-[15px] font-medium transition-colors', hlCol.has(i) ? 'text-[#f6b74e]' : 'text-white/45')} title={NOMES[casa]}>
            {casa}
          </span>
          {aligned.map((row, r) => {
            const dgt = row[i]
            const lit = hlCol.has(i) || (hlDigit !== null && dgt === hlDigit)
            const empty = dgt === null || (filled && dgt === undefined)
            return (
              <button
                key={r}
                type="button"
                disabled={!onSlot}
                onClick={() => onSlot?.(i)}
                className={cn(
                  // Not interactive: let the tap through (story taps on reading cards).
                  'relative grid place-items-center rounded-xl transition-colors disabled:pointer-events-none',
                  onSlot && 'cursor-pointer active:scale-[0.97]',
                  empty && 'border border-dashed border-white/25',
                  onSlot && empty && 'border-white/40 bg-white/[0.03]',
                  lit && 'bg-[#f6b74e]/[0.1]',
                )}
                style={{ width: col - 10, height: digitSize * 1.35, margin: '3px 0' }}
                aria-label={`Casa das ${NOMES[casa] ?? casa}${dgt !== null && dgt !== undefined ? `: ${dgt}` : ', vazia'}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {dgt !== null && dgt !== undefined && (
                    <motion.span
                      key={`${dgt}`}
                      initial={{ opacity: 0, y: -14, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 14, scale: 0.8 }}
                      transition={spring}
                      className="font-semibold tabular-nums"
                      style={{ fontSize: digitSize, color: lit ? amber : '#fff' }}
                    >
                      {dgt}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
          {showBlocks && <MiniBlocks casa={casa} n={aligned[0][i] ?? 0} w={col - 12} />}
        </div>
      ))}
    </motion.div>
  )
}

/** Which columns the content wants highlighted ("C", "U e C", "nenhuma"). */
function columnsOf(destaque: string, casas: string[]): Set<number> {
  const out = new Set<number>()
  if (destaque === 'nenhuma') return out
  for (const part of destaque.split(/\s*(?:\be\b|,)\s*/)) {
    const i = casas.indexOf(part.trim())
    if (i >= 0) out.add(i)
  }
  return out
}

/** Under a column: the blocks the digit is worth (plates, bars or cubes). */
function MiniBlocks({ casa, n, w }: { casa: string; n: number; w: number }) {
  const k = Math.max(4, Math.min(9, Math.floor(w / 11)))
  return (
    <div className="mt-3 flex min-h-[92px] flex-wrap content-start items-start justify-center gap-[3px]" style={{ width: w }}>
      <AnimatePresence initial={false} mode="popLayout">
        {Array.from({ length: n }).map((_, i) => (
          <motion.span
            key={`${casa}${i}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, delay: i * 0.03 }}
            className="block rounded-[2px] bg-white/85"
            style={
              casa === 'U'
                ? { width: k, height: k }
                : casa === 'D'
                  ? { width: k * 0.8, height: k * 5 }
                  : casa === 'C'
                    ? { width: k * 3.2, height: k * 3.2 }
                    : { width: k * 3.6, height: k * 3.6, boxShadow: `${k * 0.4}px -${k * 0.4}px 0 rgba(255,255,255,0.5)` }
            }
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------- classes

/** How a class value is written: empty before the first group, then 3 digits. */
function classText(values: (number | null)[], i: number): string | null {
  const v = values[i]
  if (v === null || v === undefined) return null
  const first = values.findIndex((x) => typeof x === 'number' && x > 0)
  if (first === -1 || i < first) return v === 0 ? '' : String(v)
  return i === first ? String(v) : String(v).padStart(3, '0')
}

function Classes({ s, size, values, onClass, wrong }: { s: QuadroState; size: { w: number; h: number }; values?: (number | null)[]; onClass?: (i: number) => void; wrong?: boolean }) {
  const classes = s.classes ?? []
  const vals = values ?? s.grupos ?? (typeof s.numero === 'number' && !s.numeroOculto ? splitClasses(s.numero, classes.length) : classes.map(() => null))
  const n = classes.length
  const box = Math.min(110, Math.floor((size.w - 8 * (n - 1) - 8) / n))
  const showNumber = typeof s.numero === 'number' && !s.numeroOculto && n > 0
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="flex gap-2" animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        {classes.map((name, i) => {
          const text = classText(vals, i)
          const empty = text === null
          return (
            <div key={i} className="flex flex-col items-center gap-2" style={{ width: box }}>
              <span className="text-[13px] text-white/55">{name ?? ''}</span>
              <button
                type="button"
                disabled={!onClass}
                onClick={() => onClass?.(i)}
                className={cn(
                  'grid w-full place-items-center rounded-2xl border transition-colors disabled:pointer-events-none',
                  empty ? 'border-dashed border-white/30' : 'border-white/15 bg-white/[0.05]',
                  onClass && 'cursor-pointer active:scale-[0.97]',
                  onClass && empty && 'border-white/45 bg-white/[0.03]',
                )}
                style={{ height: Math.min(76, box * 0.8) }}
                aria-label={`Classe dos ${name ?? ''}${text ? `: ${text}` : ', vazia'}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {text && (
                    <motion.span key={text} initial={{ opacity: 0, y: -10, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={spring} className="font-semibold tabular-nums text-white" style={{ fontSize: Math.min(30, box * 0.3) }}>
                      {text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              {s.leituras?.[i] && <span className="text-center text-[13px] text-white/60">{s.leituras[i]}</span>}
            </div>
          )
        })}
      </motion.div>
      <AnimatePresence>
        {showNumber && (
          <motion.p key={s.numero} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[30px] font-semibold tabular-nums tracking-tight text-white">
            {fmt(s.numero as number)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function splitClasses(n: number, count: number): (number | null)[] {
  const out: number[] = []
  let rest = Math.trunc(n)
  for (let i = 0; i < count; i++) {
    out.unshift(rest % 1000)
    rest = Math.floor(rest / 1000)
  }
  return out
}

// ---------------------------------------------------------------- separar

/** A row of digits with gaps: a tap on a gap puts (or removes) a separator. */
function Separar({ s, seps, onGap, size }: { s: QuadroState; seps: number[]; onGap?: (i: number) => void; size: { w: number; h: number } }) {
  const digits = s.algarismos ?? []
  const cell = Math.min(54, Math.floor((size.w - 24) / (digits.length * 1.45)))
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-end">
        {digits.map((d, i) => (
          <div key={i} className="flex items-end">
            <span className="grid place-items-center font-semibold tabular-nums text-white" style={{ width: cell, height: cell * 1.4, fontSize: cell }}>
              {d}
            </span>
            {i < digits.length - 1 && (
              <button
                type="button"
                disabled={!onGap}
                onClick={() => onGap?.(i)}
                className={cn('relative grid place-items-end rounded-lg pb-2 disabled:pointer-events-none', onGap && 'cursor-pointer hover:bg-white/[0.05]')}
                style={{ width: cell * 0.45, height: cell * 1.4 }}
                aria-label={seps.includes(i) ? `Tirar o ponto depois do ${i + 1}º algarismo` : `Pôr um ponto depois do ${i + 1}º algarismo`}
              >
                <AnimatePresence>
                  {seps.includes(i) ? (
                    <motion.span key="dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring} className="mx-auto block h-2.5 w-2.5 rounded-full bg-white" />
                  ) : (
                    onGap && <span className="mx-auto block h-6 w-px bg-white/20" />
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- conta armada

/**
 * A conta armada, como no caderno quadriculado: uma coluna por casa, as
 * parcelas alinhadas à direita, o sinal, o traço e o resultado, que se
 * escreve da direita para a esquerda. Acima da primeira parcela, em âmbar,
 * o vai um (reservas) ou o novo valor de uma casa que emprestou (trocas,
 * com o algarismo de baixo riscado).
 */
function Conta({ c, size }: { c: ContaState; size: { w: number; h: number } }) {
  const res = c.resultado ?? ''
  const parciais = c.parciais ?? []
  const txt = (n: number | string) => (typeof n === 'number' ? String(n).replace('.', ',') : n)
  const rows = c.parcelas.map(txt)
  // Decimals line up at the comma; the result, while it has no comma yet, fills from the right.
  const split = (t: string): [string, string] => {
    const k = t.indexOf(',')
    return k < 0 ? [t, ''] : [t.slice(0, k), t.slice(k + 1)]
  }
  const direita = c.alinhar === 'direita'
  const decW = direita ? 0 : Math.max(0, ...[...rows, ...parciais, res].filter((t) => t.includes(',')).map((t) => split(t)[1].length))
  const dec = decW > 0
  const intW = direita ? Math.max(2, ...[...rows, ...parciais, res].map((t) => t.length)) : Math.max(...rows.map((t) => split(t)[0].length), ...parciais.map((t) => split(t)[0].length), dec ? (res.includes(',') ? split(res)[0].length : Math.max(0, res.length - decW - 1)) : res.length, dec ? 1 : 2)
  const width = intW + (dec ? 1 + decW : 0)
  const comma = dec ? intW : -1
  // Right-aligned with commas, the place names would lie: the header stays blank.
  const casas = direita ? Array.from({ length: width }, (_, i) => `·${i}`) : [...ORDEM.slice(0, intW).reverse(), ...(dec ? [',', ...['d', 'c', 'm', 'dm'].slice(0, decW)] : [])]
  const col = Math.min(64, Math.floor((size.w - 64) / (width + 1)))
  const colW = (i: number) => (i === comma ? col * 0.45 : col)
  const rowW = casas.reduce((a, _, i) => a + colW(i), 0)
  const rowH = Math.min(col * 1.1, (size.h - 40) / (c.parcelas.length + parciais.length + 2.6))
  const fs = Math.min(col * 0.78, rowH * 0.8)
  const small = Math.max(13, fs * 0.45)
  /** One row of cells; with `zeros`, missing decimal places come back as ghost zeros. */
  const lay = (t: string, ghosts = false): { d: string; ghost?: boolean }[] => {
    if (!dec) return [...Array(Math.max(0, width - t.length)).fill(''), ...t.split('')].map((d) => ({ d }))
    const [a, b] = split(t)
    const hasComma = t.includes(',')
    const intCells = [...Array(Math.max(0, intW - a.length)).fill(''), ...a.split('')].map((d) => ({ d }))
    const fill = ghosts && c.zeros
    const fracCells = Array.from({ length: decW }, (_, i) => (i < b.length ? { d: b[i] } : fill ? { d: '0', ghost: true } : { d: '' }))
    return [...intCells, { d: hasComma || (fill && a) ? ',' : '', ghost: !hasComma }, ...fracCells]
  }
  const resLay = dec && !res.includes(',') ? [...Array(Math.max(0, width - res.length)).fill(''), ...res.split('')].map((d) => ({ d })) : lay(res)
  const cells = (n: number | string) => lay(txt(n), true).map((x) => x.d)
  const ghostOf = (n: number | string) => lay(txt(n), true).map((x) => Boolean(x.ghost))
  const resCells = resLay.map((x) => x.d)
  const pad = (t: string) => lay(t).map((x) => x.d)
  const top = { ...c.reservas, ...c.trocas }
  const lit = (i: number) => c.destaque === casas[i]
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="caderno rounded-2xl px-4 py-3">
        <div className="flex">
          <span style={{ width: col * 0.8 }} />
          {casas.map((casa, i) => (
            <span key={casa} className={cn('text-center text-[13px] font-medium', lit(i) ? 'text-[#f6b74e]' : 'text-white/40')} style={{ width: colW(i) }}>
              {casa === ',' || casa.startsWith('·') ? '' : casa}
            </span>
          ))}
        </div>
        {/* Vai um / empresta. */}
        <div className="flex" style={{ height: small * 1.5 }}>
          <span style={{ width: col * 0.8 }} />
          {casas.map((casa, i) => (
            <span key={casa} className="grid place-items-center font-semibold tabular-nums text-[#f6b74e]" style={{ width: colW(i), fontSize: small }}>
              <AnimatePresence>
                {top[casa] && (
                  <motion.span key={top[casa]} initial={{ opacity: 0, y: 8, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}>
                    {top[casa]}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          ))}
        </div>
        {c.parcelas.map((n, r) => (
          <div key={r} className="flex items-center" style={{ height: rowH }}>
            <span className="text-center font-medium text-white/70" style={{ width: col * 0.8, fontSize: fs * 0.8 }}>
              {r === c.parcelas.length - 1 ? (c.sinal ?? '+') : ''}
            </span>
            {cells(n).map((d, i) => {
              const crossed = r === 0 && c.trocas?.[casas[i]] !== undefined
              const ghost = ghostOf(n)[i]
              return (
                <span key={i} className={cn('relative grid place-items-center rounded-lg font-semibold tabular-nums', lit(i) && 'bg-[#f6b74e]/[0.1]')} style={{ width: colW(i), height: rowH, fontSize: fs, color: crossed || ghost ? 'rgba(255,255,255,0.4)' : '#fff' }}>
                  {d}
                  {crossed && <motion.span aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35 }} className="absolute h-[2px] origin-left rotate-[-20deg] bg-[#f6b74e]" style={{ width: fs * 0.8 }} />}
                </span>
              )
            })}
          </div>
        ))}
        <div className="ml-auto h-[2px] rounded-full bg-white/70" style={{ width: rowW + col * 0.8 }} />
        {parciais.map((p, r) => (
          <motion.div key={`pp${r}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center" style={{ height: rowH }}>
            <span className="text-center font-medium text-white/70" style={{ width: col * 0.8, fontSize: fs * 0.8 }}>
              {r === parciais.length - 1 && parciais.length > 1 ? '+' : ''}
            </span>
            {pad(p).map((d, i) => (
              <span key={i} className="grid place-items-center font-semibold tabular-nums text-white" style={{ width: colW(i), height: rowH, fontSize: fs }}>
                {d}
              </span>
            ))}
          </motion.div>
        ))}
        {parciais.length > 1 && <div className="ml-auto h-[2px] rounded-full bg-white/70" style={{ width: rowW + col * 0.8 }} />}
        <div className="flex items-center" style={{ height: rowH }}>
          <span style={{ width: col * 0.8 }} />
          {resCells.map((d, i) => (
            <span key={i} className={cn('grid place-items-center rounded-lg font-semibold tabular-nums text-[#f6b74e]', lit(i) && 'bg-[#f6b74e]/[0.1]')} style={{ width: colW(i), height: rowH, fontSize: fs }}>
              <AnimatePresence>
                {d && (
                  <motion.span key={d + i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                    {d}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- quadro de unidades

/** The digits of a measure laid in the unit table, and the value read with the comma after `para`. */
export function medidaCells(m: MedidaState): { cells: string[][]; comma: number; valor: string; zeros: Set<string> } {
  const k = Math.max(1, m.porCasa ?? 1)
  const t = typeof m.numero === 'number' ? String(m.numero).replace('.', ',') : m.numero
  const [a0, b0 = ''] = t.split(',')
  const a = a0.replace(/\D/g, '') || '0'
  const de = Math.max(0, m.casas.indexOf(m.de))
  const para = m.para && m.casas.includes(m.para) ? m.casas.indexOf(m.para) : de
  // Every digit has a slot: (column, position inside the column); the integer part ends at the last slot of `de`.
  const slot = (col: number, pos: number) => col * k + pos
  const endInt = slot(de, k - 1)
  const digits = new Map<number, string>()
  a.split('').forEach((d, i) => digits.set(endInt - a.length + 1 + i, d))
  b0.split('').forEach((d, i) => digits.set(endInt + 1 + i, d))
  const commaSlot = slot(para, k - 1)
  const keys = [...digits.keys()]
  // Zeros fill only what the reading needs: from the comma's place to the digits, never ahead of the number.
  const lo = Math.min(...keys, commaSlot)
  const hi = Math.max(...keys, commaSlot)
  const zeros = new Set<string>()
  const total = m.casas.length * k
  const flat: string[] = Array(total).fill('')
  for (let i = Math.max(0, lo); i <= Math.min(total - 1, hi); i++) {
    if (digits.has(i)) flat[i] = digits.get(i)!
    else {
      flat[i] = '0'
      zeros.add(String(i))
    }
  }
  const intPart = flat.slice(0, commaSlot + 1).join('').replace(/^0+(?=\d)/, '') || '0'
  const frac = flat.slice(commaSlot + 1).join('').replace(/0+$/, '')
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const cells = m.casas.map((_, c) => flat.slice(c * k, c * k + k))
  return { cells, comma: para, valor: frac ? `${intFmt},${frac}` : intFmt, zeros }
}

function Medida({ m, size, onCasa, wrong }: { m: MedidaState; size: { w: number; h: number }; onCasa?: (casa: string) => void; wrong?: boolean }) {
  const k = Math.max(1, m.porCasa ?? 1)
  const { cells, comma, valor, zeros } = medidaCells(m)
  const n = m.casas.length
  const col = Math.min(k > 1 ? 120 : 80, Math.floor((size.w - 24) / n))
  const fs = Math.min(40, (col / k) * 0.85, size.h / 6)
  const original = typeof m.numero === 'number' ? String(m.numero).replace('.', ',') : m.numero
  // Leading zeros before the first significant digit read dimmer.
  const firstSig = cells.flat().findIndex((d) => d !== '' && d !== '0')
  const sig = (c: number, j: number) => c * k + j >= Math.min(firstSig < 0 ? Infinity : firstSig, comma * k + k - 1)
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      <motion.div className="relative flex" animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        {m.casas.map((casa, c) => (
          <button
            key={casa}
            type="button"
            disabled={!onCasa}
            onClick={() => onCasa?.(casa)}
            className={cn('flex flex-col items-center border-white/10 disabled:pointer-events-none', c > 0 && 'border-l', onCasa && 'cursor-pointer active:scale-[0.97]')}
            style={{ width: col }}
            aria-label={`Vírgula depois de ${casa}`}
          >
            <span className={cn('pb-2 text-[15px] font-medium', casa === m.de ? 'text-white' : casa === m.para ? 'text-[#f6b74e]' : 'text-white/45')}>{casa}</span>
            <span className={cn('flex items-center justify-center rounded-xl', onCasa && 'border border-dashed border-white/25 bg-white/[0.03]')} style={{ width: col - 8, height: fs * 1.5 }}>
              {cells[c].map((d, j) => (
                <AnimatePresence key={j} mode="popLayout" initial={false}>
                  {d && (
                    <motion.span
                      key={d + (zeros.has(String(c * k + j)) ? 'z' : '')}
                      initial={{ opacity: 0, y: -12, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={spring}
                      className="font-semibold tabular-nums"
                      style={{ fontSize: fs, width: (col - 12) / k, textAlign: 'center', color: zeros.has(String(c * k + j)) ? amber : sig(c, j) ? '#fff' : 'rgba(255,255,255,0.35)' }}
                    >
                      {d}
                    </motion.span>
                  )}
                </AnimatePresence>
              ))}
            </span>
          </button>
        ))}
        {/* The comma, sitting on the line after the column of the unit being read. */}
        <motion.span
          className="pointer-events-none absolute font-bold text-[#f6b74e]"
          initial={false}
          animate={{ left: (comma + 1) * col - fs * 0.18, opacity: cells.slice(comma + 1).flat().some(Boolean) ? 1 : 0 }}
          transition={spring}
          style={{ bottom: fs * 0.05, fontSize: fs * 1.1, lineHeight: 1 }}
        >
          ,
        </motion.span>
      </motion.div>
      <p className="text-center text-[22px] font-semibold tabular-nums text-white">
        {m.para && m.para !== m.de ? (
          <>
            {original} {m.de} = <span className="text-[#f6b74e]">{valor} {m.para}</span>
          </>
        ) : (
          <>
            {valor} {m.de}
          </>
        )}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- divisão na chave

/**
 * O método da chave: o dividendo à esquerda, o divisor na caixa, o quociente
 * embaixo dele. As linhas embaixo do dividendo (o que se tira e o que sobra)
 * ficam alinhadas às casas do dividendo; uma linha que começa com "−" ganha
 * um traço embaixo.
 */
function Divisao({ d, size }: { d: DivisaoState; size: { w: number; h: number } }) {
  const dig = String(d.dividendo).split('')
  const q = d.quociente ?? ''
  const linhas = d.linhas ?? []
  const div = String(d.divisor)
  const cols = dig.length + 1 // one spare column on the left for the "−"
  const valor = typeof d.dividendo === 'number' ? d.dividendo : Number(d.dividendo.replace(/\./g, '').replace(',', '.'))
  const rightCols = Math.max(div.length, String(Math.floor(valor / Math.max(1, d.divisor))).length, q.length) + 0.6
  const col = Math.min(56, Math.floor((size.w - 64) / (cols + rightCols + 0.6)))
  const rowH = Math.min(col * 1.1, (size.h - 30) / (linhas.length + 1.4))
  const fs = Math.min(col * 0.78, rowH * 0.78)
  const cellsOf = (t: string, ate: number) => {
    const neg = t.startsWith('−') || t.startsWith('-')
    const body = neg ? t.slice(1) : t
    const row: string[] = Array(cols).fill('')
    const end = ate + 1 // shift for the spare column
    body.split('').forEach((ch, i) => (row[end - body.length + 1 + i] = ch))
    if (neg) row[end - body.length] = '−'
    return { row, neg, from: end - body.length + 1, to: end }
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="caderno flex rounded-2xl px-4 py-4">
        <div>
          <div className="flex" style={{ height: rowH }}>
            {['', ...dig].map((ch, i) => (
              <span key={i} className={cn('grid place-items-center rounded-lg font-semibold tabular-nums text-white', d.destaque === i - 1 && 'bg-[#f6b74e]/[0.15] text-[#f6b74e]')} style={{ width: col, height: rowH, fontSize: fs }}>
                {ch}
              </span>
            ))}
          </div>
          {linhas.map(([t, ate], r) => {
            const { row, neg, from, to } = cellsOf(t, ate)
            return (
              <motion.div key={`${r}-${t}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="relative flex" style={{ height: rowH }}>
                {row.map((ch, i) => (
                  <span key={i} className={cn('grid place-items-center font-semibold tabular-nums', ch === '−' ? 'text-white/70' : neg ? 'text-white/85' : 'text-[#f6b74e]')} style={{ width: col, height: rowH, fontSize: ch === '−' ? fs * 0.8 : fs }}>
                    {ch}
                  </span>
                ))}
                {neg && <span className="absolute bottom-0 h-[2px] rounded-full bg-white/60" style={{ left: (from - 1) * col + col * 0.3, width: (to - from + 1) * col + col * 0.7 }} />}
              </motion.div>
            )
          })}
        </div>
        <div className="border-l-2 border-white/70 pl-2">
          <div className="flex items-center border-b-2 border-white/70" style={{ height: rowH, minWidth: col * rightCols }}>
            {div.split('').map((ch, i) => (
              <span key={i} className="grid place-items-center font-semibold tabular-nums text-white" style={{ width: col, height: rowH, fontSize: fs }}>
                {ch}
              </span>
            ))}
          </div>
          <div className="flex" style={{ height: rowH }}>
            <AnimatePresence>
              {q.split('').map((ch, i) => (
                <motion.span key={`${i}${ch}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="grid place-items-center font-semibold tabular-nums text-[#f6b74e]" style={{ width: col, height: rowH, fontSize: fs }}>
                  {ch}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- outros

function Transicoes({ t }: { t: [number, number][] }) {
  const chain = [t[0][0], ...t.map((p) => p[1])]
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      {chain.map((n, i) => (
        <motion.div key={n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.25, duration: 0.5 }} className="flex flex-col items-center gap-3">
          {i > 0 && <span className="text-[14px] text-white/45">× 1.000</span>}
          <span className="text-[30px] font-semibold tabular-nums text-white">{fmt(n)}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Tags({ tags, big }: { tags: string[]; big?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', big && 'h-full content-center')}>
      {tags.map((t, i) => (
        <motion.span
          key={t + i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
          className={cn('rounded-2xl border border-white/15 bg-white/[0.05] font-semibold tabular-nums text-white', big ? 'px-6 py-4 text-[34px]' : 'px-4 py-2 text-[20px]')}
        >
          {t}
        </motion.span>
      ))}
    </div>
  )
}
