'use client'

import { Tex } from '@/components/math/Tex'
import { Fit } from '../Fit'
import { cn } from '@/lib/utils'
import { comparar, n, pertence, relTex, t, valorEm, type EspelhoState, type FaixasState, type Intervalo } from './inequacao-geo'

const ambar = '#f6b74e'
/** Segmentos contínuos: círculos indicam inclusão; setas continuam além da janela. */
function Linha({ de, ate, intervalos, pontos = [], size, titulo }: { de: number; ate: number; intervalos: Intervalo[]; pontos?: { x: number; ok: boolean }[]; size: number; titulo?: string }) {
  const w = Math.max(240, size - 16), pad = 30, y = 40
  const X = (x: number) => pad + (x - de) / (ate - de) * (w - 2 * pad)
  const bordas = intervalos.flatMap(i => [i.de, i.ate]).filter((x): x is number => x !== null && x >= de && x <= ate)
  const labels = [...new Set([de, ate, ...(de < 0 && ate > 0 ? [0] : []), ...bordas])].sort((a, b) => a - b)
  return <div className="w-full">
    {titulo && <p className="text-center text-[14px] text-white/65">{titulo}</p>}
    <svg width={w} height={84} className="mx-auto max-w-full" viewBox={`0 0 ${w} 84`} role="img" aria-label={titulo ?? 'Reta do conjunto de soluções'}>
      <path d={`M${pad-8} ${y}H${w-pad+8}`} stroke="white" strokeOpacity=".35" strokeWidth="2" />
      {labels.map((x,j) => <g key={x}><path d={`M${X(x)} ${y-4}v8`} stroke="white" strokeOpacity=".45" /><text x={X(x)} y={y+25+(j > 0 && X(x)-X(labels[j-1]) < 25 ? 13 : 0)} textAnchor="middle" fill="white" fillOpacity=".7" fontSize="14">{n(x)}</text></g>)}
      {intervalos.map((i,j) => {
        const l = X(Math.max(de, i.de ?? de)), r = X(Math.min(ate, i.ate ?? ate))
        if (r < l) return null
        return <g key={j}>
          <path d={`M${l} ${y}H${r}`} stroke={ambar} strokeWidth="5" />
          {(i.de === null || i.de < de) && <path d={`M${l+8} ${y-7}l-9 7 9 7`} fill="none" stroke={ambar} strokeWidth="3" />}
          {(i.ate === null || i.ate > ate) && <path d={`M${r-8} ${y-7}l9 7 -9 7`} fill="none" stroke={ambar} strokeWidth="3" />}
          {[[i.de,i.incluiDe],[i.ate,i.incluiAte]].map(([x,on], k) => typeof x === 'number' && x >= de && x <= ate ? <circle key={k} cx={X(x)} cy={y} r={6} fill={on ? ambar : '#030407'} stroke={ambar} strokeWidth="2" /> : null)}
        </g>
      })}
      {pontos.map(p => <g key={p.x}><circle cx={X(p.x)} cy={y} r={5} fill={p.ok ? ambar : 'white'} stroke="#030407" strokeWidth="2" /><text x={X(p.x)} y={y-16} textAnchor="middle" fill={p.ok ? ambar : 'white'} fontSize="15">{n(p.x)}</text></g>)}
    </svg>
  </div>
}

export function Faixas({ s, size, onTestarFaixa }: { s: FaixasState; size: { w: number; h: number }; onTestarFaixa?: (x: number) => void }) {
  const feitas = s.visitados ?? []
  const revelar = !s.ocultar || Boolean(s.candidatos?.every(x => feitas.includes(x)))
  const x = s.escolhido
  const ok = x === undefined ? false : pertence(s.intervalos, x)
  const resultado = x === undefined || !s.teste ? undefined : valorEm(s.teste.coeficientes, x)
  const compacto = size.h < 320
  const fator = (r: number) => `x${r < 0 ? '+' : '-'}${t(Math.abs(r))}`
  return <div className={cn('flex h-full w-full flex-col items-center justify-center px-2', compacto ? 'gap-1' : 'gap-3')}>
    {s.linhas?.map((l,j) => <Linha key={j} de={s.de} ate={s.ate} intervalos={l.intervalos} size={size.w-16} titulo={l.titulo} />)}
    <Linha de={s.de} ate={s.ate} intervalos={revelar ? s.intervalos : []} size={size.w-16}
      titulo={s.linhas ? 'As duas condições juntas' : undefined} pontos={x === undefined ? [] : [{x,ok}]} />
    {revelar && s.rotulo && <Fit size={23} min={17} className="w-full text-center text-[#f6b74e]"><Tex>{s.rotulo}</Tex></Fit>}
    {!s.intervalos.length && revelar && <p className="text-[17px] text-white/70">Nenhum número serve.</p>}
    {s.fatores && <div className="w-full text-center text-[18px]" aria-live="polite">
      <Fit size={21} min={17}><Tex>{`${fator(s.fatores[0])},\\quad ${fator(s.fatores[1])}`}</Tex></Fit>
      <p className="mt-1 text-[17px]">{x === undefined ? 'Compare o sinal dos dois fatores.' : `${n(x-s.fatores[0])} · (${n(x-s.fatores[1])}) = ${n((x-s.fatores[0])*(x-s.fatores[1]))}`}</p>
    </div>}
    {s.candidatos && <div className="flex flex-wrap justify-center gap-2" aria-label="Números para testar">
      {s.candidatos.map(v => <button key={v} type="button" disabled={!onTestarFaixa} onClick={() => onTestarFaixa?.(v)} aria-label={`Testar x = ${n(v)}`} aria-pressed={x === v}
        className={cn('min-h-11 min-w-11 rounded-xl border px-3 text-[18px]', x===v ? 'border-[#f6b74e] text-[#f6b74e]' : feitas.includes(v) ? 'border-white/70' : 'border-white/20')}>{n(v)}</button>)}
    </div>}
    {x !== undefined && <div className="text-center text-[17px]" aria-live="polite" aria-atomic="true">
      {s.teste && resultado !== undefined && <Fit size={21} min={17}><Tex>{`${t(resultado)}${relTex(s.teste.relacao)}${t(s.teste.direita)}\\quad\\text{${comparar(resultado,s.teste.relacao,s.teste.direita) ? 'verdadeiro' : 'falso'}}`}</Tex></Fit>}
      <p className="mt-1">x = {n(x)} {ok ? 'pertence ao conjunto.' : 'fica fora do conjunto.'}</p>
    </div>}
  </div>
}

export function Espelho({ s, size, onFatorOrdem }: { s: EspelhoState; size: {w:number;h:number}; onFatorOrdem?: (k:number)=>void }) {
  const k=s.fator ?? 1, [a,b]=s.par, lim=Math.max(...s.par.map(Math.abs),...s.par.map(x=>Math.abs(x*k)))+3
  return <div className="flex h-full flex-col items-center justify-center gap-3 px-2">
    <Linha de={-lim} ate={lim} intervalos={[]} pontos={[{x:a,ok:false},{x:b,ok:true}]} size={size.w-16} titulo="Antes de multiplicar" />
    <Linha de={-lim} ate={lim} intervalos={[]} pontos={[{x:a*k,ok:false},{x:b*k,ok:true}]} size={size.w-16} titulo={`Os dois valores × (${n(k)})`} />
    <Fit size={23} min={18} className="text-[#f6b74e]"><Tex>{`${t(a)}<${t(b)}\\quad\\Longrightarrow\\quad${t(a*k)}${k>0?'<':'>'}${t(b*k)}`}</Tex></Fit>
    <div className="flex flex-wrap justify-center gap-2">{s.fatores.map(f => <button key={f} type="button" disabled={!onFatorOrdem} onClick={()=>onFatorOrdem?.(f)} aria-label={`Multiplicar por ${n(f)}`} aria-pressed={k===f} className={cn('min-h-11 rounded-xl border px-4 text-[17px]',k===f?'border-[#f6b74e] text-[#f6b74e]':'border-white/25')}>× ({n(f)})</button>)}</div>
  </div>
}
