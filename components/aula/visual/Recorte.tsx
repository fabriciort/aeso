'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { recorteGeo, rotulosRecorte } from './recorte-geo'

// A diferença de quadrados (AF.U2): um quadrado x por x sem um canto b por b.
// No Mexa "mover", o toque corta o L em dois retângulos; o de baixo gira e
// vai para o lado do outro, e os dois viram um retângulo só, (x + b) por
// (x − b). Os rótulos mudam junto, e embaixo aparece x² − 9 = (x + 3)(x − 3).

const amber = '#fbbf24'
const ease = [0.22, 1, 0.36, 1] as const

export function Recorte({ b, letra = 'x', movido, size, onMover }: { b: number; letra?: string; movido: boolean; size: { w: number; h: number }; onMover?: () => void }) {
  // A state that arrives already moved is drawn in place; a tap plays the cut and the move.
  const deCara = useRef(movido).current
  const g = recorteGeo()
  const t = rotulosRecorte(b, letra, movido)
  const antes = rotulosRecorte(b, letra, false)
  const tocavel = Boolean(onMover) && !movido
  const fs = 16
  const larguraTexto = (s: string) => [...s].length * fs * 0.55
  const labelL = Math.max(larguraTexto(antes.menos), larguraTexto(letra)) + 18
  const labelR = larguraTexto(antes.menos) + 18
  const topH = 34
  const botH = 30
  const eqTxt = rotulosRecorte(b, letra, true).equacao
  const eqFs = Math.max(15, Math.min(24, (size.w - 24) / (0.56 * [...eqTxt].length)))
  const eqH = eqFs + 26
  // One scale for both states: the square (1 by 1) and the long rectangle (1 + b by 1 − b).
  const S = Math.max(60, Math.min(300, (size.w - 24 - labelL) / g.depois.w, size.w - 24 - labelL - labelR, size.h - 16 - topH - botH - eqH))
  const W = (movido ? g.depois.w : g.antes.w) * S
  const ox = (size.w - W - labelL - (movido ? 0 : labelR)) / 2 + labelL
  const oy = Math.max(8, (size.h - S - topH - botH - eqH) / 2) + topH
  const atraso = deCara ? 0 : 1.35
  const r = g.r
  const peca = g.peca
  const fixo = g.fixo

  const rotulo = (key: string, txt: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', cor = 'rgba(255,255,255,0.85)', delay = 0) => (
    <motion.text key={key} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay } }} exit={{ opacity: 0, transition: { duration: 0.2 } }} x={x} y={y} textAnchor={anchor} fill={cor} fontSize={fs} fontWeight={600} className="tabular-nums">
      {txt}
    </motion.text>
  )

  return (
    <svg width={size.w} height={size.h} className="select-none" role="img" aria-label={movido ? `Retângulo de ${t.topo} por ${t.esquerda}` : `Quadrado de lado ${letra} sem um canto de lado ${b}`} onClick={tocavel ? onMover : undefined} style={{ cursor: tocavel ? 'pointer' : undefined }}>
      <motion.g initial={false} animate={{ x: ox, y: oy }} transition={{ duration: 0.8, ease, delay: deCara ? 0 : 0.5 }}>
        {/* The top piece stays where it is. */}
        <rect x={fixo.x * S} y={fixo.y * S} width={fixo.w * S - 2} height={fixo.h * S - 2} rx={5} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.75)" strokeWidth={1.5} />
        {/* The corner that is missing. */}
        <motion.rect initial={false} animate={{ opacity: movido ? 0 : 1 }} transition={{ delay: movido && !deCara ? 0.4 : 0 }} x={g.buraco.x * S} y={g.buraco.y * S} width={g.buraco.w * S - 2} height={g.buraco.h * S - 2} rx={5} fill="none" stroke="rgba(255,255,255,0.35)" strokeDasharray="5 5" strokeWidth={1.5} />
        {/* The bottom piece: cut off, turned a quarter and slid to the right. */}
        <motion.g
          initial={false}
          animate={movido ? { x: g.giro.dx * S, y: g.giro.dy * S, rotate: g.giro.graus } : { x: 0, y: 0, rotate: 0 }}
          transition={{ duration: 0.95, ease, delay: deCara ? 0 : 0.45 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <rect x={peca.x * S} y={peca.y * S} width={peca.w * S - 2} height={peca.h * S - 2} rx={5} fill="rgba(251,191,36,0.16)" stroke={tocavel ? amber : 'rgba(251,191,36,0.85)'} strokeDasharray={tocavel ? '6 4' : undefined} strokeWidth={1.5} />
        </motion.g>
        {/* The cut, along the top of the hole: a hint before the tap, a flash while it cuts. */}
        <motion.line
          initial={false}
          animate={{ opacity: movido ? (deCara ? 0 : [0, 1, 1, 0]) : tocavel ? 0.55 : 0 }}
          transition={movido && !deCara ? { duration: 1.2, times: [0, 0.15, 0.5, 1] } : { duration: 0.3 }}
          x1={-6}
          x2={(1 - r) * S + 6}
          y1={(1 - r) * S - 1}
          y2={(1 - r) * S - 1}
          stroke={amber}
          strokeWidth={2.5}
          strokeDasharray="7 5"
        />
        <AnimatePresence initial={false}>
          {!movido && [
            rotulo('topo-a', antes.topo, S / 2, -12, 'middle'),
            rotulo('esq-a', antes.esquerda, -12, S / 2 + 5, 'end'),
            rotulo('dir-fixo', antes.menos, S + 10, ((1 - r) * S) / 2 + 5, 'start'),
            rotulo('dir-buraco', antes.b, S + 10, (1 - r) * S + (r * S) / 2 + 5, 'start', 'rgba(255,255,255,0.55)'),
            rotulo('baixo-peca', antes.menos, ((1 - r) * S) / 2, S + 22, 'middle', amber),
            rotulo('baixo-buraco', antes.b, (1 - r) * S + (r * S) / 2, S + 22, 'middle', 'rgba(255,255,255,0.55)'),
            rotulo('area-buraco', antes.buraco, (1 - r) * S + (r * S) / 2, (1 - r) * S + (r * S) / 2 + 5, 'middle', 'rgba(255,255,255,0.35)'),
          ]}
          {movido && [
            <motion.g key="cota" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: atraso } }}>
              <line x1={0} x2={g.depois.w * S - 2} y1={-8} y2={-8} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
              <line x1={0} x2={0} y1={-13} y2={-3} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
              <line x1={g.depois.w * S - 2} x2={g.depois.w * S - 2} y1={-13} y2={-3} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
              <line x1={S - 1} x2={S - 1} y1={-11} y2={-5} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
            </motion.g>,
            rotulo('topo-d', t.topo, (g.depois.w * S) / 2, -16, 'middle', '#fff', atraso),
            rotulo('esq-d', t.esquerda, -12, (g.depois.h * S) / 2 + 5, 'end', '#fff', atraso),
            rotulo('seg-x', letra, S / 2, 20, 'middle', 'rgba(255,255,255,0.45)', atraso),
            rotulo('seg-b', t.b, S + (r * S) / 2, 20, 'middle', 'rgba(251,191,36,0.85)', atraso),
          ]}
        </AnimatePresence>
      </motion.g>
      <AnimatePresence initial={false}>
        <motion.text key={t.equacao} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: movido ? atraso + 0.2 : 0, duration: 0.4 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }} x={size.w / 2} y={oy + S + botH + eqFs + 8} textAnchor="middle" fill={movido ? amber : '#fff'} fontSize={eqFs} fontWeight={700} className="tabular-nums">
          {t.equacao}
        </motion.text>
      </AnimatePresence>
    </svg>
  )
}
