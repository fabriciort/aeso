'use client'

import { motion } from 'framer-motion'
import { arranjo, extensaoMaxima, ladoTexto, legendaArranjo, type Par, type RetanguloAzulejos } from './azulejos-retangulo'

// Os azulejos de x² + bx + c arrumados num retângulo (AF.U2). O x² no canto
// de cima, à esquerda; p barras de pé à direita; q barras deitadas embaixo;
// os c quadradinhos numa grade p por q no canto de baixo. Os lados são x + p
// e x + q. No Mexa "fatorar", cada toque arruma os quadradinhos de outro
// jeito (1 × 6, 2 × 3) e as barras vão atrás; uma barra que falta é uma vaga
// tracejada, uma que sobra fica de lado, apagada.

const COR = { 'x²': '#c4b5fd', x: '#f6b74e', '1': '#e5e7eb' } as const
const amber = '#fbbf24'

export function AzulejosRetangulo({ r, letra = 'x', escala, size, onArrumar, wrong }: { r: RetanguloAzulejos; letra?: string; escala?: (Par | null)[]; size: { w: number; h: number }; onArrumar?: () => void; wrong?: boolean }) {
  const a = arranjo(r.b, r.c, r.par)
  // In a Mexa every arrangement shares one scale (the biggest), so a new one never jumps in size.
  const ext = extensaoMaxima(r.b, r.c, escala?.length ? escala : [r.par])
  const maxLado = Math.max(...(escala ?? [r.par]).flatMap((p) => (p ? [p[0], p[1]] : [0])))
  const labelL = maxLado ? [...ladoTexto(maxLado, letra)].length * 9.5 + 18 : 0
  const topH = maxLado ? 32 : 6
  const legH = 48
  const u = Math.max(8, Math.min(46, (size.w - 24 - labelL) / ext.largura, (size.h - 16 - topH - legH) / ext.altura))
  const W = a.largura * u
  const ox = (size.w - W - (a.par ? labelL : 0)) / 2 + (a.par ? labelL : 0)
  // The scale is shared; the place is not: each arrangement sits centred, with the line below it.
  const oy = Math.max(8, (size.h - a.altura * u - topH - legH) / 2) + topH
  const legenda = legendaArranjo(a, r.b, r.c, letra)
  const corLegenda = !a.par ? '#fff' : a.fecha ? amber : '#fda4af'
  const legFs = Math.max(15, Math.min(24, (size.w - 24) / (0.56 * [...legenda].length)))
  const mola = { type: 'spring', stiffness: 170, damping: 22 } as const
  const tocavel = Boolean(onArrumar)
  // The unit keeps its "1" only while it reads.
  const comUm = u >= 15

  return (
    <motion.svg
      width={size.w}
      height={size.h}
      className="select-none"
      role="img"
      aria-label={`Azulejos: ${legenda}`}
      onClick={onArrumar}
      style={{ cursor: tocavel ? 'pointer' : undefined }}
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
    >
      {a.pecas.map((p) => {
        const x = ox + p.x * u
        const y = oy + p.y * u
        const w = p.w * u - 1.5
        const h = p.h * u - 1.5
        const falta = p.estado === 'falta'
        const nome = p.tipo === 'x²' ? `${letra}²` : p.tipo === 'x' ? letra : '1'
        const fs = p.tipo === '1' ? Math.max(10, u * 0.55) : Math.max(11, Math.min(22, u * 0.6))
        const mostraNome = !falta && (p.tipo !== '1' || comUm)
        return (
          <motion.g key={p.id} initial={{ opacity: 0 }} animate={{ opacity: p.estado === 'sobra' ? 0.45 : 1 }} exit={{ opacity: 0 }}>
            <motion.rect
              initial={false}
              animate={{ x, y, width: w, height: h }}
              transition={mola}
              rx={Math.min(5, u * 0.2)}
              fill={falta ? 'rgba(251,191,36,0.06)' : COR[p.tipo]}
              stroke={falta ? amber : 'rgba(0,0,0,0.35)'}
              strokeWidth={falta ? 1.5 : 1}
              strokeDasharray={falta ? '5 4' : undefined}
            />
            {mostraNome && (
              <motion.text initial={false} animate={{ x: x + w / 2, y: y + h / 2 + fs * 0.36 }} transition={mola} textAnchor="middle" fill="#05060a" fontSize={fs} fontWeight={600} style={{ pointerEvents: 'none' }}>
                {nome}
              </motion.text>
            )}
          </motion.g>
        )
      })}
      {a.par && a.ret && (
        <g style={{ pointerEvents: 'none' }}>
          <motion.text key={`t${a.par[0]}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={ox + (a.ret.w * u) / 2} y={oy - 14} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize={16} fontWeight={600} className="tabular-nums">
            {ladoTexto(a.par[0], letra)}
          </motion.text>
          <Cota x1={ox} x2={ox + a.ret.w * u - 1.5} y={oy - 6} />
          <motion.text key={`l${a.par[1]}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={ox - 14} y={oy + (a.ret.h * u) / 2 + 5} textAnchor="end" fill="rgba(255,255,255,0.9)" fontSize={16} fontWeight={600} className="tabular-nums">
            {ladoTexto(a.par[1], letra)}
          </motion.text>
          <Cota y1={oy} y2={oy + a.ret.h * u - 1.5} x={ox - 6} />
        </g>
      )}
      <motion.text key={legenda} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} x={size.w / 2} y={oy + a.altura * u + 36} textAnchor="middle" fill={corLegenda} fontSize={legFs} fontWeight={700} className="tabular-nums">
        {legenda}
      </motion.text>
    </motion.svg>
  )
}

/** A thin dimension line along a side, with ticks at the ends. */
export function Cota({ x1, x2, y, y1, y2, x }: { x1?: number; x2?: number; y?: number; y1?: number; y2?: number; x?: number }) {
  const cor = 'rgba(255,255,255,0.35)'
  if (x1 !== undefined && x2 !== undefined && y !== undefined)
    return (
      <motion.g initial={false} animate={{ opacity: 1 }}>
        <motion.line initial={false} animate={{ x1, x2, y1: y, y2: y }} stroke={cor} strokeWidth={1.5} />
        <motion.line initial={false} animate={{ x1, x2: x1, y1: y - 4, y2: y + 4 }} stroke={cor} strokeWidth={1.5} />
        <motion.line initial={false} animate={{ x1: x2, x2, y1: y - 4, y2: y + 4 }} stroke={cor} strokeWidth={1.5} />
      </motion.g>
    )
  return (
    <motion.g initial={false} animate={{ opacity: 1 }}>
      <motion.line initial={false} animate={{ x1: x, x2: x, y1, y2 }} stroke={cor} strokeWidth={1.5} />
      <motion.line initial={false} animate={{ x1: x! - 4, x2: x! + 4, y1, y2: y1 }} stroke={cor} strokeWidth={1.5} />
      <motion.line initial={false} animate={{ x1: x! - 4, x2: x! + 4, y1: y2, y2 }} stroke={cor} strokeWidth={1.5} />
    </motion.g>
  )
}
