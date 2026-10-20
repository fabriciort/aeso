'use client'

import { motion } from 'framer-motion'
import { arranjoCompletar, extensaoCompletar, ladoCompletar, legendaCompletar, legendaTexto, linhasLegenda, FASES, type Completar } from './azulejos-completar'
import { Cota } from './AzulejosRetangulo'

// Completar o quadrado (AF.U3). As peças de x² + 6x: o x² e 6 barras. Partidas,
// 3 barras ficam de pé à direita do x² e 3 deitadas embaixo, e falta o canto
// de baixo, tracejado, 3 por 3. Completo, o canto se enche com 9
// quadradinhos novos, em âmbar: x² + 6x + 9 = (x + 3)². No Mexa "completar",
// o primeiro toque parte as barras e o segundo enche o canto. As três fases
// de um mesmo b usam uma escala só.

const COR = { 'x²': '#c4b5fd', x: '#f6b74e', '1': '#e5e7eb' } as const
const NOVO = '#fde68a'
const amber = '#fbbf24'
const CORES = { branco: '#fff', ambar: amber, rosa: '#fda4af' } as const

export function AzulejosCompletar({ c, size, onCompletar }: { c: Completar; size: { w: number; h: number }; onCompletar?: () => void }) {
  const a = arranjoCompletar(c.b, c.fase)
  const ext = extensaoCompletar(c.b)
  const lado = ladoCompletar(c.m, c.letra)
  const labelL = [...lado].length * 9.5 + 18
  const topH = 32
  // The caption keeps one size across the phases: the longest main line of the three sets it.
  const principais = FASES.flatMap((fase) => legendaCompletar({ ...c, fase }).filter((l) => !l.nota).map((l) => l.trechos.map((t) => t.t).join('')))
  const maiorLinha = Math.max(...principais.map((t) => [...t].length))
  const legFs = Math.max(15, Math.min(24, (size.w - 24) / (0.56 * maiorLinha)))
  const notaFs = Math.max(14, Math.min(17, legFs * 0.8))
  const nLinhas = linhasLegenda(c)
  const legH = 18 + nLinhas * legFs * 1.4
  const u = Math.max(8, Math.min(46, (size.w - 24 - labelL) / ext.largura, (size.h - 16 - topH - legH) / ext.altura))
  const W = a.largura * u
  const comLados = Boolean(a.ret)
  const ox = (size.w - W - (comLados ? labelL : 0)) / 2 + (comLados ? labelL : 0)
  const oy = Math.max(8, (size.h - a.altura * u - topH - legH) / 2) + topH
  const linhas = legendaCompletar(c)
  const mola = { type: 'spring', stiffness: 170, damping: 22 } as const
  const comUm = u >= 15
  const completo = c.fase === 'completo'

  return (
    <motion.svg width={size.w} height={size.h} className="select-none" role="img" aria-label={`Azulejos: ${legendaTexto(c)}`} onClick={onCompletar} style={{ cursor: onCompletar ? 'pointer' : undefined }}>
      {a.canto && (
        <motion.g key="canto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x={ox + a.canto.x * u} y={oy + a.canto.y * u} width={a.canto.w * u - 1.5} height={a.canto.h * u - 1.5} rx={Math.min(5, u * 0.2)} fill="rgba(251,191,36,0.07)" stroke={amber} strokeWidth={2} strokeDasharray="6 4" />
          {!completo && a.canto.w * u >= 50 && (
            <text x={ox + (a.canto.x + a.canto.w / 2) * u} y={oy + (a.canto.y + a.canto.h / 2) * u + 6} textAnchor="middle" fill={amber} fontSize={Math.max(13, Math.min(20, a.canto.w * u * 0.24))} fontWeight={600} className="tabular-nums" style={{ pointerEvents: 'none' }}>
              {`${c.m} × ${c.m}`}
            </text>
          )}
        </motion.g>
      )}
      {a.pecas.map((p, k) => {
        const x = ox + p.x * u
        const y = oy + p.y * u
        const w = p.w * u - 1.5
        const h = p.h * u - 1.5
        const novo = p.tipo === '1'
        const nome = p.tipo === 'x²' ? `${c.letra}²` : p.tipo === 'x' ? c.letra : '1'
        const fs = p.tipo === '1' ? Math.max(10, u * 0.55) : Math.max(11, Math.min(22, u * 0.6))
        const mostraNome = p.tipo !== '1' || comUm
        const atraso = novo ? 0.15 + (k - 1 - c.b) * 0.05 : 0
        return (
          <motion.g key={p.id} initial={{ opacity: 0, scale: novo ? 0.4 : 1 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: atraso, duration: 0.3 }} style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}>
            <motion.rect initial={false} animate={{ x, y, width: w, height: h }} transition={mola} rx={Math.min(5, u * 0.2)} fill={novo ? NOVO : COR[p.tipo]} stroke={novo ? amber : 'rgba(0,0,0,0.35)'} strokeWidth={novo ? 1.5 : 1} />
            {mostraNome && (
              <motion.text initial={false} animate={{ x: x + w / 2, y: y + h / 2 + fs * 0.36 }} transition={mola} textAnchor="middle" fill="#05060a" fontSize={fs} fontWeight={600} style={{ pointerEvents: 'none' }}>
                {nome}
              </motion.text>
            )}
          </motion.g>
        )
      })}
      {a.ret && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ pointerEvents: 'none' }}>
          <text x={ox + (a.ret.w * u) / 2} y={oy - 14} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize={16} fontWeight={600} className="tabular-nums">
            {lado}
          </text>
          <Cota x1={ox} x2={ox + a.ret.w * u - 1.5} y={oy - 6} />
          <text x={ox - 14} y={oy + (a.ret.h * u) / 2 + 5} textAnchor="end" fill="rgba(255,255,255,0.9)" fontSize={16} fontWeight={600} className="tabular-nums">
            {lado}
          </text>
          <Cota y1={oy} y2={oy + a.ret.h * u - 1.5} x={ox - 6} />
        </motion.g>
      )}
      {linhas.map((l, i) => {
        const fs = l.nota ? notaFs : legFs
        const y = oy + a.altura * u + 36 + i * legFs * 1.4
        return (
          <motion.text key={`${c.fase}-${i}-${l.trechos.map((t) => t.t).join('')}`} initial={{ opacity: 0, y: y + 6 }} animate={{ opacity: 1, y }} transition={{ delay: 0.35 + i * 0.25 }} x={size.w / 2} textAnchor="middle" fill={CORES[l.cor]} fontSize={fs} fontWeight={l.nota ? 600 : 700} className="tabular-nums">
            {l.trechos.map((t, j) => (
              <tspan key={j} fill={t.novo ? NOVO : undefined} style={t.novo ? { textDecoration: 'underline', textUnderlineOffset: 4 } : undefined}>
                {t.t.replace(/ /g, ' ')}
              </tspan>
            ))}
          </motion.text>
        )
      })}
    </motion.svg>
  )
}
