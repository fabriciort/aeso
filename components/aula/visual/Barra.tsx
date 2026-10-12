'use client'

import { AnimatePresence, motion } from 'framer-motion'

// A barra de frações. Cada barra é um inteiro (ou mais) partido em partes
// iguais; as pintadas, em âmbar, são a fração. Barras empilhadas do mesmo
// comprimento comparam pedaços: 1/2 e 2/4 ocupam o mesmo lugar. Cortes
// desiguais mostram o que não é fração.

export interface BarraLinha {
  /** Partes iguais em que cada inteiro é partido. */
  partes: number
  /** Quantas partes estão pintadas, a partir da esquerda (podem passar de um inteiro). */
  pintadas?: number
  /** Quantos inteiros a barra tem, lado a lado (padrão 1). */
  inteiros?: number
  /** Cortes desiguais, em frações do inteiro (0 a 1): substituem as partes iguais. */
  cortes?: number[]
  /** Partes pintadas em outra posição: índices das partes (substitui `pintadas`). */
  marcadas?: number[]
  /** O que aparece à direita da barra. Padrão: a fração pintada, como 3/4. */
  rotulo?: string
}

export interface BarraState {
  barras?: BarraLinha[]
  /** Atalho para uma barra só. */
  partes?: number
  pintadas?: number
  inteiros?: number
  cortes?: number[]
  marcadas?: number[]
  rotulo?: string
  /** Quantos inteiros cabem na largura (padrão: a barra mais longa). */
  escala?: number
  /** Escreve 1/d dentro de cada parte. */
  rotulos?: boolean
  /** Esconde a fração à direita de todas as barras. */
  semFracao?: boolean
  /** A barra em destaque (as outras ficam mais apagadas). */
  destaque?: number
  /** Uma linha vertical tracejada nesta posição, em inteiros (ex.: 0,5 para comparar com a metade). */
  guia?: number
}

export interface BarraInteract {
  /** Mexa "pintar": um toque numa parte da barra ativa. */
  onPart?: (barra: number, parte: number) => void
  /** Mexa "partir": um toque na barra ativa corta cada parte em mais. */
  onSplit?: (barra: number) => void
  /** Qual barra responde aos toques. */
  ativa?: number
  wrong?: boolean
}

const amber = '#f6b74e'
const ease = [0.22, 1, 0.36, 1] as const

export function barrasOf(s: BarraState): BarraLinha[] {
  if (s.barras?.length) return s.barras
  if (s.partes !== undefined || s.cortes) return [{ partes: s.partes ?? 1, pintadas: s.pintadas, inteiros: s.inteiros, cortes: s.cortes, marcadas: s.marcadas, rotulo: s.rotulo }]
  return []
}

/** The pieces of one bar, as [start, end] in wholes. */
function pecas(b: BarraLinha): [number, number][] {
  const inteiros = Math.max(1, b.inteiros ?? 1)
  if (b.cortes?.length) {
    const cs = [0, ...[...new Set(b.cortes)].filter((c) => c > 0 && c < 1).sort((x, y) => x - y), 1]
    const out: [number, number][] = []
    for (let w = 0; w < inteiros; w++) for (let i = 0; i < cs.length - 1; i++) out.push([w + cs[i], w + cs[i + 1]])
    return out
  }
  const p = Math.max(1, b.partes)
  return Array.from({ length: p * inteiros }, (_, i) => [i / p, (i + 1) / p])
}

const pintada = (b: BarraLinha, i: number) => (b.marcadas ? b.marcadas.includes(i) : i < (b.pintadas ?? 0))

function fracaoDe(b: BarraLinha): string | undefined {
  if (b.rotulo !== undefined) return b.rotulo
  if (b.cortes?.length) return undefined
  const n = b.marcadas ? b.marcadas.length : b.pintadas
  return n === undefined ? undefined : `${n}/${b.partes}`
}

export function Barra({ s, size, onPart, onSplit, ativa = 0, wrong }: { s: BarraState; size: { w: number; h: number } } & BarraInteract) {
  const barras = barrasOf(s)
  const escala = s.escala ?? Math.max(1, ...barras.map((b) => b.inteiros ?? 1))
  const labels = s.semFracao ? barras.map(() => undefined) : barras.map(fracaoDe)
  const labelW = labels.some(Boolean) ? 58 : 0
  const pad = 20
  const W = Math.max(120, Math.min(size.w - pad * 2 - labelW, 360 * Math.max(1, escala / 1.5)))
  const unit = W / escala
  const n = barras.length
  const bh = Math.max(30, Math.min(56, (size.h - 40) / Math.max(1, n) - 16))
  const gap = Math.min(22, bh * 0.45)
  const totalH = n * bh + (n - 1) * gap
  const ox = (size.w - W - labelW) / 2
  const oy = Math.max(12, (size.h - totalH) / 2)
  const yOf = (i: number) => oy + i * (bh + gap)

  return (
    <motion.svg
      width={size.w}
      height={size.h}
      className="select-none"
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      role="img"
      aria-label={`Barras de frações: ${labels.filter(Boolean).join(', ')}`}
    >
      {barras.map((b, bi) => {
        const ps = pecas(b)
        const y = yOf(bi)
        const dim = s.destaque !== undefined && s.destaque !== bi
        const tapPart = onPart && bi === ativa
        const tapSplit = onSplit && bi === ativa
        const inteiros = Math.max(1, b.inteiros ?? 1)
        const label = labels[bi]
        const frac = label?.match(/^(\d+)\/(\d+)$/)
        return (
          <motion.g key={`b${bi}`} animate={{ opacity: dim ? 0.4 : 1 }} transition={{ duration: 0.3 }} onClick={tapSplit ? () => onSplit!(bi) : undefined} style={{ cursor: tapSplit ? 'pointer' : undefined }}>
            {tapSplit && <rect x={ox - 6} y={y - 6} width={inteiros * unit + 12} height={bh + 12} rx={12} fill="rgba(246,183,78,0.05)" stroke={amber} strokeDasharray="5 5" strokeWidth={1.5} />}
            <AnimatePresence initial={false}>
              {ps.map(([a, z], i) => {
                const on = pintada(b, i)
                const x = ox + a * unit
                const w = (z - a) * unit
                return (
                  <motion.rect
                    key={`${bi}-${b.cortes ? 'c' : b.partes}-${i}`}
                    initial={{ opacity: 0, x, y, width: w, height: bh, fill: on ? amber : 'rgba(255,255,255,0.08)' }}
                    animate={{ opacity: 1, x, y, width: w, height: bh, fill: on ? amber : 'rgba(255,255,255,0.08)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth={1.5}
                    onClick={tapPart ? (ev) => (ev.stopPropagation(), onPart!(bi, i)) : undefined}
                    style={{ cursor: tapPart ? 'pointer' : undefined }}
                  />
                )
              })}
            </AnimatePresence>
            {/* The edges of each whole, stronger than the cuts inside it. */}
            {Array.from({ length: inteiros }, (_, w) => (
              <rect key={`w${w}`} x={ox + w * unit} y={y} width={unit} height={bh} rx={4} fill="none" stroke="#fff" strokeWidth={2.5} pointerEvents="none" />
            ))}
            {s.rotulos &&
              !b.cortes &&
              ps.map(([a, z], i) => {
                const w = (z - a) * unit
                if (w < 26) return null
                return (
                  <text key={`r${i}`} x={ox + (a + z) / 2 * unit} y={y + bh / 2 + 5} textAnchor="middle" fill={pintada(b, i) ? '#1a1206' : 'rgba(255,255,255,0.8)'} fontSize={Math.min(15, w / 2.6)} fontWeight={600} pointerEvents="none" className="tabular-nums">
                    1/{b.partes}
                  </text>
                )
              })}
            {label !== undefined && (
              <motion.g key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {frac ? (
                  <>
                    <text x={ox + W + labelW / 2 + 4} y={y + bh / 2 - 4} textAnchor="middle" fill="#fff" fontSize={18} fontWeight={700} className="tabular-nums">
                      {frac[1]}
                    </text>
                    <line x1={ox + W + labelW / 2 - 9} x2={ox + W + labelW / 2 + 17} y1={y + bh / 2 + 1} y2={y + bh / 2 + 1} stroke="#fff" strokeWidth={1.8} />
                    <text x={ox + W + labelW / 2 + 4} y={y + bh / 2 + 20} textAnchor="middle" fill="#fff" fontSize={18} fontWeight={700} className="tabular-nums">
                      {frac[2]}
                    </text>
                  </>
                ) : (
                  <text x={ox + W + labelW / 2 + 4} y={y + bh / 2 + 6} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={600}>
                    {label}
                  </text>
                )}
              </motion.g>
            )}
          </motion.g>
        )
      })}
      {s.guia !== undefined && (
        <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} x1={ox + s.guia * unit} x2={ox + s.guia * unit} y1={oy - 10} y2={oy + totalH + 10} stroke={amber} strokeWidth={2} strokeDasharray="6 5" pointerEvents="none" />
      )}
    </motion.svg>
  )
}
