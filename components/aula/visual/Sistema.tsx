'use client'

import { Tex } from '@/components/math/Tex'
import { Fit } from '../Fit'
import { cn } from '@/lib/utils'
import { atende, escalar, linearTex, somadas, type SistemaState } from './sistema-geo'

const n = (v: number) => String(v).replace('-', '−').replace('.', ',')
export function Sistema({ s, onParSistema, onSomarSistema, size }: {
  s: SistemaState; size: { w: number; h: number }
  onParSistema?: (i: number) => void; onSomarSistema?: () => void
}) {
  const compacto = size.h < 300
  const soma = s.modo === 'somar'
  const etapa = s.etapa ?? 0
  const fatores = s.fatores ?? [1, 1]
  const escaladas = s.equacoes.map((e, j) => escalar(e, fatores[j]))
  const par = s.par
  return <div className={cn('flex h-full w-full flex-col items-center justify-center px-2', compacto ? 'gap-2' : 'gap-4')}>
    {!soma && <p className="text-center text-[15px] text-white/60">{par ? `x = ${n(par[0])} · y = ${n(par[1])}` : 'O mesmo par nas duas condições'}</p>}
    <div className={cn('flex w-full max-w-sm flex-col', compacto ? 'gap-2' : 'gap-3')} aria-live="polite" aria-atomic="true">
      {s.equacoes.map((e, j) => {
        const ok = par && atende(e, par)
        const v = par ? e[0] * par[0] + e[1] * par[1] : null
        return <div key={j} className={cn('rounded-xl border px-3', compacto ? 'py-2' : 'py-3', par ? ok ? 'border-[#f6b74e]/70' : 'border-white/25' : 'border-white/15')}>
          <div className="mb-1 flex items-center justify-between gap-2 text-[13px] text-white/60">
            <span>{s.rotulos?.[j] ?? `${j + 1}ª condição`}</span>
            {soma ? <span>× ({n(fatores[j])})</span> : par && <span>{ok ? 'Confere' : 'Não confere'}</span>}
          </div>
          <Fit size={compacto ? 21 : 25} min={17} className="text-center"><Tex>{linearTex(soma && etapa >= 1 ? escaladas[j] : e)}</Tex></Fit>
          {par && <Fit size={18} min={14} className={cn('mt-1 text-center', ok ? 'text-[#f6b74e]' : 'text-white/65')}>
            <Tex>{`${e[0]}\\cdot(${par[0]})${e[1] < 0 ? '-' : '+'}${Math.abs(e[1])}\\cdot(${par[1]})=${v}${ok ? '=' : '\\ne'}${e[2]}`}</Tex>
          </Fit>}
        </div>
      })}
    </div>
    {soma ? <>
      {etapa >= 2 && <div className="w-full max-w-sm border-t border-[#f6b74e]/60 pt-2 text-[#f6b74e]" aria-live="polite">
        <Fit size={25} min={18} className="text-center"><Tex>{linearTex(somadas(s))}</Tex></Fit>
        <p className="mt-1 text-center text-[14px]">Somamos à esquerda e à direita.</p>
      </div>}
      {onSomarSistema && etapa < 2 && <button type="button" onClick={onSomarSistema} className="min-h-11 rounded-xl border border-[#f6b74e]/60 px-4 py-2 text-[16px] text-[#f6b74e]">
        {etapa === 0 ? 'Multiplicar as equações' : 'Somar os dois lados'}
      </button>}
    </> : Boolean(s.pares?.length) && <div className="grid w-full max-w-sm grid-cols-2 gap-2" aria-label="Pares para testar">
      {s.pares!.map(([x, y], j) => <button key={`${x},${y}`} type="button" disabled={!onParSistema}
        aria-label={`Testar x = ${n(x)} e y = ${n(y)}`} aria-pressed={par?.[0] === x && par?.[1] === y}
        onClick={() => onParSistema?.(j)} className={cn('min-h-11 rounded-xl border px-2 py-2 text-[16px] tabular-nums', par?.[0] === x && par?.[1] === y ? 'border-[#f6b74e] text-[#f6b74e]' : 'border-white/20')}>
        x = {n(x)}; y = {n(y)}
      </button>)}
    </div>}
  </div>
}
