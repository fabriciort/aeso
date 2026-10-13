'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Fichas de saldo (U12): cada ficha + vale 1 real que você tem, cada ficha −
// vale 1 real que você deve. Uma + e uma − juntas valem zero (o par zero).
// Em cima ficam as +, embaixo as −, alinhadas: as colunas cheias são pares
// que se cancelam, e o que sobra é o saldo.
//
// No Mexa, o aluno tira fichas de um sinal (tirar um negativo é cancelar uma
// dívida). Quando não há fichas daquele sinal para tirar, ele põe pares zero
// (o saldo não muda) e depois tira.

export interface SaldoState {
  positivas?: number
  negativas?: number
  /** Molduras nas colunas que têm uma + e uma −, com "0" embaixo. */
  pares?: boolean
  /** Fichas que já saíram, apagadas e riscadas. */
  riscadas?: { positivas?: number; negativas?: number }
  /** A frase embaixo; sem ela, com `mostraSaldo`, aparece "saldo: −2". */
  rotulo?: string
  mostraSaldo?: boolean
  /** Mexa: o sinal das fichas que o aluno tira. */
  tirar?: '+' | '−' | '-'
}

export interface SaldoInteract {
  /** Fichas que o aluno já tirou (do sinal `tirar`). */
  removidas?: number
  /** Pares zero que o aluno já pôs. */
  paresPostos?: number
  onTirar?: () => void
  onPar?: () => void
  wrong?: boolean
}

const amber = '#f6b74e'
const sky = '#7dd3fc'
const sinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

export function Saldo({ s, size, removidas = 0, paresPostos = 0, onTirar, onPar, wrong }: { s: SaldoState; size: { w: number; h: number } } & SaldoInteract) {
  const tirarNeg = s.tirar === '−' || s.tirar === '-'
  const P0 = (s.positivas ?? 0) + paresPostos
  const N0 = (s.negativas ?? 0) + paresPostos
  const remP = s.tirar && !tirarNeg ? removidas : 0
  const remN = tirarNeg ? removidas : 0
  const P = P0 - remP
  const N = N0 - remN
  const riscP = s.riscadas?.positivas ?? 0
  const riscN = s.riscadas?.negativas ?? 0
  const cols = Math.max(1, P + riscP, N + riscN)
  const gap = 8
  const d = Math.max(22, Math.min(46, (size.w - 32) / cols - gap))
  const W = cols * (d + gap) - gap
  const pares = s.pares ? Math.min(P, N) : 0
  const saldo = P - N
  const legenda = s.rotulo ?? (s.mostraSaldo ? `saldo: ${sinal(saldo)}` : undefined)
  // The chips the student adds (zero pairs) are new keys; the ones taken go out with an exit.
  const fichas = (n: number, risc: number, orig: number, neg: boolean, tappable: boolean) => [
    ...Array.from({ length: n }, (_, i) => ({ key: `${neg ? 'n' : 'p'}${i < orig ? i : `a${i}`}`, riscada: false, tappable })),
    ...Array.from({ length: risc }, (_, i) => ({ key: `${neg ? 'n' : 'p'}r${i}`, riscada: true, tappable: false })),
  ]
  const linha = (neg: boolean) => {
    const tappable = Boolean(onTirar) && neg === tirarNeg
    const lista = neg ? fichas(N, riscN, s.negativas ?? 0, true, tappable) : fichas(P, riscP, s.positivas ?? 0, false, tappable)
    return (
      <div className="flex" style={{ gap, width: W, height: d }}>
        <AnimatePresence initial={false} mode="popLayout">
          {lista.map((f) => (
            <motion.button
              key={f.key}
              type="button"
              layout
              disabled={!f.tappable}
              onClick={f.tappable ? onTirar : undefined}
              initial={{ opacity: 0, scale: 0.4, y: neg ? 16 : -16 }}
              animate={{ opacity: f.riscada ? 0.3 : 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: neg ? 30 : -30 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={cn('relative grid shrink-0 place-items-center rounded-full font-bold leading-none', f.tappable ? 'cursor-pointer ring-2 ring-white/60 ring-offset-2 ring-offset-black' : 'cursor-default')}
              style={{ width: d, height: d, fontSize: d * 0.62, background: neg ? sky : amber, color: '#05060a' }}
              aria-label={neg ? 'ficha menos' : 'ficha mais'}
            >
              {neg ? '−' : '+'}
              {f.riscada && <span className="absolute inset-x-[-4px] top-1/2 h-[2px] -rotate-45 bg-white" />}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-3 select-none"
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      role="img"
      aria-label={`${P} fichas mais e ${N} fichas menos${legenda ? `; ${legenda}` : ''}`}
    >
      <div className="relative" style={{ width: W }}>
        {Array.from({ length: pares }, (_, i) => (
          <motion.div
            key={`par${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="pointer-events-none absolute rounded-full border border-dashed border-white/45"
            style={{ left: i * (d + gap) - 4, top: -4, width: d + 8, height: d * 2 + 14 + 8 }}
          />
        ))}
        <div className="flex flex-col" style={{ gap: 14 }}>
          {linha(false)}
          {linha(true)}
        </div>
        {pares > 0 && (
          <div className="absolute flex" style={{ top: d * 2 + 14 + 10, gap }}>
            {Array.from({ length: pares }, (_, i) => (
              <motion.span key={`z${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.12 }} className="text-center text-[15px] font-semibold text-white/70" style={{ width: d }}>
                0
              </motion.span>
            ))}
          </div>
        )}
      </div>
      {legenda && (
        <motion.p key={legenda} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('text-[24px] font-semibold tabular-nums text-white', pares > 0 && 'mt-6')}>
          {legenda}
        </motion.p>
      )}
      {onPar && (
        <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={onPar} className={cn('rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-[16px] font-medium text-white', !legenda && pares > 0 && 'mt-6')}>
          Pôr um par <span style={{ color: amber }}>+</span> <span style={{ color: sky }}>−</span> (vale 0)
        </motion.button>
      )}
    </motion.div>
  )
}
