'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { giroDaFaixa } from './completar-quadrado-geo'

export interface CompletarState {
  /** x² + 2mx = direita, com m positivo. O desenho representa x positivo. */
  metade: number
  direita: number
  etapa?: number
}

/** As duas faixas conservam a área; só o canto acrescentado muda os dois lados da igualdade. */
export function CompletarQuadrado({ s, size, onCompletar }: { s: CompletarState; size: { w: number; h: number }; onCompletar?: () => void }) {
  const reduz = useReducedMotion()
  const etapa = s.etapa ?? 0
  const m = s.metade
  const compacto = size.h < 300
  const u = Math.max(1, Math.min((size.w - 64) / 11, (size.h - (compacto ? 88 : 150)) / 9, 32))
  const x = 6 * u
  const t = 2 * u
  const ox = (size.w - x - 2 * t) / 2
  const oy = 32
  const txt = Math.max(14, Math.min(21, u))
  const giro = giroDaFaixa(x, t)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <svg width="100%" height={Math.max(120, 9 * u + 42)} viewBox={`0 0 ${size.w} ${9 * u + 42}`} role="img" aria-label={etapa === 0 ? `x ao quadrado com ${2 * m} x ao lado` : `Quadrado de lado x mais ${m}, ${etapa === 2 ? 'com' : 'sem'} o canto de área ${m * m}`}>
        <g transform={`translate(${ox},${oy})`}>
          <rect width={x} height={x} rx={4} fill="white" fillOpacity={0.1} stroke="white" strokeOpacity={0.6} />
          <text x={x / 2} y={x / 2} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={txt + 4}>x²</text>
          <rect x={x} width={t} height={x} rx={3} fill="#f6b74e" fillOpacity={0.2} stroke="#f6b74e" />
          <text x={x + t / 2} y={x / 2} dominantBaseline="middle" textAnchor="middle" fill="#f6b74e" fontSize={txt}>{m}x</text>
          <motion.g initial={false} animate={{ x: etapa > 0 ? giro.dx : 0, y: etapa > 0 ? giro.dy : 0, rotate: etapa > 0 ? giro.graus : 0 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} transition={{ duration: reduz ? 0 : 0.65 }}>
            <rect x={x + t} width={t} height={x} rx={3} fill="#f6b74e" fillOpacity={0.2} stroke="#f6b74e" />
          </motion.g>
          <motion.text animate={{ x: etapa > 0 ? x / 2 : x + 1.5 * t, y: etapa > 0 ? x + t / 2 : x / 2 }}
            transition={{ duration: reduz ? 0 : 0.65 }} dominantBaseline="middle" textAnchor="middle" fill="#f6b74e" fontSize={txt}>{m}x</motion.text>
          {etapa > 0 && <g>
            <rect x={x} y={x} width={t} height={t} rx={3} fill="#f6b74e" fillOpacity={etapa === 2 ? 0.35 : 0} stroke="#f6b74e" strokeDasharray={etapa === 2 ? undefined : '5 4'} />
            <text x={x + t / 2} y={x + t / 2} dominantBaseline="middle" textAnchor="middle" fill="#f6b74e" fontSize={txt}>{etapa === 2 ? m * m : '?'}</text>
            <text x={x + t / 2} y={-12} textAnchor="middle" fill="white" fontSize={txt}>{m}</text>
            <text x={-10} y={x + t / 2} textAnchor="end" fill="white" fontSize={txt}>{m}</text>
          </g>}
          <text x={x / 2} y={-12} textAnchor="middle" fill="white" fontSize={txt}>x</text>
        </g>
      </svg>
      <p className="text-center text-[20px] font-semibold" aria-live="polite">
        {etapa === 2 ? `(x + ${m})² = ${s.direita + m * m}` : `x² + ${2 * m}x = ${s.direita}`}
      </p>
      {!compacto && <p className="text-center text-[16px] text-white/70">
        {etapa === 2 ? `+ ${m * m} dos dois lados: ${s.direita} + ${m * m} = ${s.direita + m * m}` : etapa === 1 ? `Falta um canto de ${m} por ${m}.` : `Duas faixas de ${m}x formam ${2 * m}x.`}
      </p>}
      {onCompletar && <button type="button" onClick={onCompletar} className="min-h-11 rounded-full border border-[#f6b74e]/60 px-5 text-[17px] text-[#f6b74e] active:scale-95">
        {etapa === 0 ? 'Repartir as faixas' : `Somar ${m * m} dos dois lados`}
      </button>}
    </div>
  )
}
