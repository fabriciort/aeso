'use client'

import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fatorTexto, numTexto, produtoEm, produtoTexto, substituicao, valorFator, valoresTexto, type ProdutoZero as PZ, type Trecho } from './produto-zero'

// O produto que zera (AF.U3). Em cima, o produto, (x − 2)(x + 3). Embaixo, a
// tabela: uma coluna por valor de x, com cada fator e o produto; os valores
// já postos mostram os números, e o fator que dá zero fica âmbar. Na conta de
// baixo, o x da vez: (2 − 2) · (2 + 3) = 0 · 5 = 0, com o produto grande. No
// Mexa "zerar", cada botão de x põe aquele valor; termina quando o aluno
// achou os valores que zeram o produto.

const amber = '#fbbf24'

export function ProdutoZero({ p, size, onValor }: { p: PZ; size: { w: number; h: number }; onValor?: (x: number) => void }) {
  const { fatores, valores, marcados, letra } = p
  // A factor that is x alone would repeat the row of x: it has no row of its own.
  const comLinha = fatores.filter((a) => a !== 0)
  const linhas = comLinha.length + 2
  // Everything scales with the stage height (and the width, with many columns).
  const k = Math.max(0.62, Math.min(1, size.h / (150 + linhas * 44), (size.w - 16) / (70 + valores.length * 50)))
  const cel = Math.round(40 * k)
  const fs = Math.round(18 * k)
  const labelFs = Math.round(15 * k)
  const x = p.x
  const zera = (v: number) => produtoEm(v, fatores) === 0
  const marcado = (v: number) => marcados.includes(v)
  const rotulos = [letra, ...comLinha.map((a) => fatorTexto(a, letra)), 'produto']

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-2" style={{ gap: Math.round(16 * k) }}>
      <p className="whitespace-nowrap font-semibold tabular-nums text-white" style={{ fontSize: Math.round(26 * k) }}>
        {produtoTexto(fatores, letra)}
      </p>
      <div className="grid w-full max-w-[560px] items-center" style={{ gridTemplateColumns: `auto repeat(${valores.length}, minmax(0, 1fr))`, columnGap: Math.round(6 * k), rowGap: Math.round(4 * k) }}>
        {rotulos.map((r, i) => (
          <Fragment key={r + i}>
            <span className={cn('whitespace-nowrap pr-1 text-right tabular-nums', i === rotulos.length - 1 ? 'font-semibold text-white/80' : 'text-white/55')} style={{ fontSize: labelFs, gridColumn: 1, gridRow: i + 1 }}>
              {r}
            </span>
            {valores.map((v, j) => {
              const col = j + 2
              const atual = v === x
              if (i === 0) {
                const z = marcado(v) && zera(v)
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={!onValor}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      onValor?.(v)
                    }}
                    className={cn(
                      'rounded-xl font-semibold tabular-nums transition-colors duration-300',
                      z ? 'bg-[#fbbf24] text-black' : marcado(v) ? 'bg-white/20 text-white' : 'border border-white/25 bg-white/[0.04] text-white',
                      atual && 'ring-2 ring-white',
                      onValor && 'active:scale-95',
                    )}
                    style={{ gridColumn: col, gridRow: 1, height: cel + 4, fontSize: fs }}
                  >
                    {numTexto(v)}
                  </button>
                )
              }
              const produto = i === rotulos.length - 1
              const n = produto ? produtoEm(v, fatores) : valorFator(v, comLinha[i - 1])
              const zero = n === 0
              return (
                <div key={v} className={cn('grid place-items-center rounded-lg', atual ? 'bg-white/[0.07]' : '', produto && zero && marcado(v) && 'ring-2 ring-[#fbbf24]')} style={{ gridColumn: col, gridRow: i + 1, height: cel }}>
                  <AnimatePresence initial={false}>
                    {marcado(v) && (
                      <motion.span key="n" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className={cn('tabular-nums', produto ? 'font-bold' : 'font-medium')} style={{ fontSize: produto ? fs + 2 : fs, color: zero ? amber : produto ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                        {numTexto(n)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
      <div className="flex flex-col items-center" style={{ minHeight: Math.round(96 * k), gap: Math.round(2 * k) }}>
        <AnimatePresence mode="wait" initial={false}>
          {x !== undefined ? (
            <motion.div key={x} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="flex flex-col items-center">
              <Conta trechos={substituicao(x, fatores)} fs={Math.min(Math.round(21 * k), caber(size.w, substituicao(x, fatores)))} />
              <p className="flex items-baseline whitespace-nowrap font-semibold tabular-nums text-white">
                <Conta trechos={[{ t: '= ' }, ...valoresTexto(x, fatores), { t: ' = ' }]} fs={Math.round(21 * k)} />
                <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 18 }} className="ml-1 font-bold" style={{ fontSize: Math.round(44 * k), color: zera(x) ? amber : '#fff' }}>
                  {numTexto(produtoEm(x, fatores))}
                </motion.span>
              </p>
            </motion.div>
          ) : (
            <motion.p key="vazio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 text-white/40" style={{ fontSize: labelFs }}>
              {onValor ? `toque num valor de ${letra}` : ''}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** A long worked line shrinks to fit the width (about 0.56 em per character). */
const caber = (w: number, trechos: Trecho[]) => Math.max(14, (w - 24) / (0.56 * Math.max(1, trechos.map((t) => t.t).join('').length)))

function Conta({ trechos, fs }: { trechos: Trecho[]; fs: number }) {
  return (
    <span className="whitespace-nowrap font-semibold tabular-nums text-white/85" style={{ fontSize: fs }}>
      {trechos.map((t, i) => (
        <span key={i} style={t.zero ? { color: amber } : undefined}>
          {t.t.replace(/ /g, ' ')}
        </span>
      ))}
    </span>
  )
}
