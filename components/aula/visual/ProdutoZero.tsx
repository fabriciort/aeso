'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fatorTexto, numeroComSinal as n, produtoEm, type ProdutoZeroState } from './produto-zero'

export function ProdutoZero({ s, onX }: { s: ProdutoZeroState; onX?: (x: number) => void }) {
  const v = s.x === undefined ? undefined : produtoEm(s, s.x)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-3">
      <p className="text-center text-[22px] font-semibold">({fatorTexto(s.raizes[0])}) · ({fatorTexto(s.raizes[1])}) = 0</p>
      <div className="flex flex-wrap justify-center gap-2" aria-label="Valores para testar no lugar de x">
        {s.valores.map((x) => (
          <button key={x} type="button" disabled={!onX} onClick={() => onX?.(x)} aria-label={`Testar x igual a ${n(x)}`} aria-pressed={s.x === x}
            className={cn('min-h-11 min-w-11 rounded-xl border px-3 text-[18px] tabular-nums', s.encontradas?.includes(x) ? 'border-white bg-white text-black' : s.x === x ? 'border-[#f6b74e] text-[#f6b74e]' : 'border-white/25 text-white')}>
            {n(x)}
          </button>
        ))}
      </div>
      <div className="grid w-full max-w-sm grid-cols-3 text-center text-[17px]" aria-live="polite" aria-atomic="true">
        {[fatorTexto(s.raizes[0]), fatorTexto(s.raizes[1]), 'Produto'].map((label, i) => (
          <div key={i} className="border-b border-white/20 pb-2 text-white/60">{label}</div>
        ))}
        {v ? [v.a, v.b, v.produto].map((valor, i) => (
          <motion.div key={`${i}-${valor}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={cn('py-4 text-[28px] font-semibold', valor === 0 ? 'text-[#f6b74e]' : 'text-white')}>
            {n(valor)}
          </motion.div>
        )) : <p className="col-span-3 py-4 text-white/60">Escolha um valor de x.</p>}
      </div>
      <p className="min-h-6 text-center text-[17px] text-white/75">
        {v ? v.produto === 0 ? 'Um fator zerou. O produto também.' : 'Os dois fatores são diferentes de zero.' : 'O que faz o produto zerar?'}
      </p>
      {Boolean(s.encontradas?.length) && <p className="text-[18px] font-semibold">Raízes encontradas: {s.encontradas!.map(n).join(' e ')}</p>}
    </div>
  )
}
