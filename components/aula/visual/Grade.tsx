'use client'

import { motion } from 'framer-motion'

// A grade dos decimais. Cada grade é um inteiro: 10 colunas de 10
// quadradinhos. Uma coluna é um décimo, um quadradinho é um centésimo.
// O pintado enche coluna por coluna, então 0,25 são 2 colunas e 5
// quadradinhos, e 0,5 são 5 colunas: dá para ver qual é maior. Com
// `linhas: 1`, a grade vira uma tira de 10 décimos.

export interface GradeItem {
  /** Quadradinhos pintados, coluna por coluna (podem passar de uma grade: 135 são 1,35). */
  pintadas?: number
  /** Quantas grades este número ocupa, lado a lado (padrão: as que o pintado pede). */
  inteiros?: number
  /** Quadradinhos pintados fora da ordem, pelos índices (coluna por coluna, a partir de 0). */
  marcadas?: number[]
  /** O que aparece embaixo. Padrão: o número, como 0,25. */
  rotulo?: string
}

export interface GradeState extends GradeItem {
  /** Vários números, lado a lado, cada um com as suas grades. */
  grades?: GradeItem[]
  /** Quadradinhos por coluna (padrão 10). Com 1, cada grade é uma tira de décimos. */
  linhas?: number
  /** Separa as cores: as colunas cheias (décimos) em âmbar, os quadradinhos soltos (centésimos) em verde. */
  separar?: boolean
  /** Multiplicação: as primeiras [linhas, colunas] ficam claras; o cruzamento, em âmbar (0,3 × 0,4 = 0,12). */
  faixas?: [number, number]
  /** Escreve os décimos (0,1 … 1) embaixo das colunas. */
  escala?: boolean
  /** Esconde o número embaixo. */
  semRotulo?: boolean
  /** O índice do número em destaque; os outros ficam apagados. */
  destaque?: number
}

export interface GradeInteract {
  /** Mexa "pintar": um toque no quadradinho `cel` (contando de 0, coluna por coluna) do número `item`. */
  onCell?: (item: number, cel: number) => void
  ativa?: number
  wrong?: boolean
}

const amber = '#f6b74e'
const green = '#6fd3a8'
const ease = [0.22, 1, 0.36, 1] as const

export function gradesOf(s: GradeState): GradeItem[] {
  if (s.grades?.length) return s.grades
  return [{ pintadas: s.pintadas, inteiros: s.inteiros, marcadas: s.marcadas, rotulo: s.rotulo }]
}

/** How many wholes an item takes. */
export function inteirosDe(g: GradeItem, cels: number): number {
  const n = g.marcadas?.length ? Math.max(...g.marcadas) + 1 : (g.pintadas ?? 0)
  return Math.max(1, g.inteiros ?? Math.ceil(n / cels))
}

/** 25 of 100 → "0,25"; 50 of 100 → "0,5"; 7 of 10 → "0,7". */
export function decimal(n: number, cels: number): string {
  const casas = Math.round(Math.log10(cels))
  const v = n / cels
  const t = casas > 0 ? v.toFixed(casas).replace(/\.?0+$/, '') : String(v)
  return t.replace('.', ',')
}

export function Grade({ s, size, onCell, ativa = 0, wrong }: { s: GradeState; size: { w: number; h: number } } & GradeInteract) {
  const L = Math.max(1, s.linhas ?? 10)
  const C = 10
  const cels = L * C
  const items = gradesOf(s)
  const wholes = items.map((g) => inteirosDe(g, cels))
  const nW = wholes.reduce((a, b) => a + b, 0)
  const labelH = s.semRotulo ? 0 : 36
  const escalaH = s.escala ? 20 : 0
  const gapW = 10 // between wholes of one number
  const gapI = 28 // between numbers
  const pad = 16
  const gaps = (nW - items.length) * gapW + (items.length - 1) * gapI
  const byW = (size.w - pad * 2 - gaps) / (nW * C)
  const byH = (size.h - pad * 2 - labelH - escalaH) / L
  const cell = Math.max(4, Math.min(byW, byH, L === 1 ? 34 : 28))
  const gw = cell * C
  const gh = cell * L
  const totalW = nW * gw + gaps
  const ox0 = (size.w - totalW) / 2
  const oy = Math.max(pad, (size.h - gh - labelH - escalaH) / 2)

  let x = ox0
  const placed = items.map((g, i) => {
    const xs = Array.from({ length: wholes[i] }, (_, w) => x + w * (gw + gapW))
    x += wholes[i] * gw + (wholes[i] - 1) * gapW + gapI
    return xs
  })

  const fillOf = (g: GradeItem, k: number) => {
    const local = k % cels
    const r = local % L
    const c = Math.floor(local / L)
    if (s.faixas) {
      const [fl, fc] = s.faixas
      const inR = r < fl
      const inC = c < fc
      if (inR && inC) return amber
      if (inR || inC) return 'rgba(255,255,255,0.42)'
      return 'rgba(255,255,255,0.08)'
    }
    const on = g.marcadas ? g.marcadas.includes(k) : k < (g.pintadas ?? 0)
    if (!on) return 'rgba(255,255,255,0.08)'
    if (s.separar && !g.marcadas) {
      const cheias = Math.floor((g.pintadas ?? 0) / L)
      return Math.floor(k / L) < cheias ? amber : green
    }
    return amber
  }

  return (
    <motion.svg
      width={size.w}
      height={size.h}
      className="select-none"
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      role="img"
      aria-label={`Grade de decimais: ${items.map((g) => g.rotulo ?? decimal(g.pintadas ?? g.marcadas?.length ?? 0, cels)).join(', ')}`}
    >
      {items.map((g, i) => {
        const dim = s.destaque !== undefined && s.destaque !== i
        const tap = onCell && i === ativa
        const xs = placed[i]
        const label = g.rotulo ?? decimal(g.marcadas ? g.marcadas.length : (g.pintadas ?? 0), cels)
        const cx = (xs[0] + xs[xs.length - 1] + gw) / 2
        return (
          <motion.g key={`g${i}`} animate={{ opacity: dim ? 0.4 : 1 }} transition={{ duration: 0.3 }}>
            {xs.map((gx, w) => (
              <g key={`w${w}`}>
                {Array.from({ length: cels }, (_, local) => {
                  const k = w * cels + local
                  const r = local % L
                  const c = Math.floor(local / L)
                  const fill = fillOf(g, k)
                  return (
                    <motion.rect
                      key={k}
                      x={gx + c * cell}
                      y={oy + r * cell}
                      width={cell}
                      height={cell}
                      initial={false}
                      animate={{ fill }}
                      transition={{ duration: 0.3, ease, delay: s.faixas ? 0 : Math.min(0.4, (k % cels) * 0.004) }}
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth={0.8}
                      onClick={tap ? () => onCell!(i, k) : undefined}
                      style={{ cursor: tap ? 'pointer' : undefined }}
                    />
                  )
                })}
                {/* The tenths: a stronger line between the columns. */}
                {L > 1 &&
                  Array.from({ length: C - 1 }, (_, c) => (
                    <line key={`c${c}`} x1={gx + (c + 1) * cell} x2={gx + (c + 1) * cell} y1={oy} y2={oy + gh} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} pointerEvents="none" />
                  ))}
                <rect x={gx} y={oy} width={gw} height={gh} rx={3} fill="none" stroke="#fff" strokeWidth={2.2} pointerEvents="none" />
                {tap && <rect x={gx - 5} y={oy - 5} width={gw + 10} height={gh + 10} rx={8} fill="none" stroke={amber} strokeDasharray="5 5" strokeWidth={1.5} pointerEvents="none" />}
                {s.escala &&
                  Array.from({ length: C }, (_, c) =>
                    cell * 1 >= 22 || c % 2 === 1 ? (
                      <text key={`e${c}`} x={gx + (c + 1) * cell} y={oy + gh + 15} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11} className="tabular-nums">
                        {c === C - 1 ? '1' : `0,${c + 1}`}
                      </text>
                    ) : null,
                  )}
              </g>
            ))}
            {!s.semRotulo && (
              <motion.text key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} x={cx} y={oy + gh + escalaH + 28} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700} className="tabular-nums">
                {label}
              </motion.text>
            )}
          </motion.g>
        )
      })}
    </motion.svg>
  )
}
