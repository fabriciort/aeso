'use client'

import { AnimatePresence, motion } from 'framer-motion'

// O retângulo da multiplicação. Em quadradinhos, cada linha é um grupo igual
// e o total é linhas × colunas; partido (cortes), mostra a distributiva. Por
// área (base e altura em partes), mostra 23 × 14 = 200 + 30 + 80 + 12 sem
// desenhar 322 quadradinhos.

export interface RetanguloState {
  linhas?: number
  colunas?: number
  rotulos?: boolean
  cortes?: number[]
  cortesLinhas?: number[]
  areas?: boolean | (number | string)[][]
  destaque?: [number, number] | 'linha' | 'coluna'
  girar?: boolean
  total?: number | string
  grupos?: boolean
  /** Por área: as partes de cada lado. Uma parte pode ser uma letra ('x'), desenhada com `tamanhoLetra`. */
  base?: (number | string)[]
  altura?: (number | string)[]
  /** Com letras nos lados: quanto uma letra ocupa, na escala dos números (padrão: um pouco mais que a maior parte numérica). */
  tamanhoLetra?: number
  /** O resto: quadradinhos soltos numa linha incompleta, embaixo do retângulo. */
  sobra?: number
  /** Fração de fração: as primeiras [linhas, colunas] ficam claras; o cruzamento das duas, em âmbar. */
  faixas?: [number, number]
}

export interface RetanguloInteract {
  /** Mexa "adicionar": the ghost row to tap, and taps on the last row to take it back. */
  onAdd?: () => void
  onRemove?: () => void
  /** How many rows the stage must leave room for. */
  maxLinhas?: number
  /** Mexa "cortar": a tap between columns i - 1 and i. */
  onCut?: (i: number) => void
  /** Mexa "girar": a tap on the rectangle. */
  onTurn?: () => void
  wrong?: boolean
}

const amber = '#fbbf24'
const ease = [0.22, 1, 0.36, 1] as const

/** Sizes of the parts of n squares cut at the given positions. */
function parts(n: number, cuts: number[] = []): number[] {
  const cs = [...new Set(cuts)].filter((c) => c > 0 && c < n).sort((a, b) => a - b)
  const out: number[] = []
  let from = 0
  for (const c of [...cs, n]) {
    out.push(c - from)
    from = c
  }
  return out
}

export function Retangulo({ s, size, onAdd, onRemove, maxLinhas, onCut, onTurn, wrong }: { s: RetanguloState; size: { w: number; h: number } } & RetanguloInteract) {
  if (s.base?.length && s.altura?.length) return <Area s={s} size={size} />
  return <Quadradinhos s={s} size={size} onAdd={onAdd} onRemove={onRemove} maxLinhas={maxLinhas} onCut={onCut} onTurn={onTurn} wrong={wrong} />
}

function Quadradinhos({ s, size, onAdd, onRemove, maxLinhas, onCut, onTurn, wrong }: { s: RetanguloState; size: { w: number; h: number } } & RetanguloInteract) {
  const turned = Boolean(s.girar)
  const L0 = Math.max(0, s.linhas ?? 0)
  const C0 = Math.max(1, s.colunas ?? 1)
  // Turning swaps rows and columns; each square keeps its key and slides to its new place.
  const L = turned ? C0 : L0
  const C = turned ? L0 : C0
  const colParts = parts(C, turned ? s.cortesLinhas : s.cortes)
  const rowParts = parts(L, turned ? s.cortes : s.cortesLinhas)
  // Nothing arranged yet (0 rows) but a total: the pieces wait loose, in rows of `colunas`.
  const totalN = typeof s.total === 'number' ? s.total : 0
  const pile = L0 === 0 && !onAdd && !s.sobra && totalN > 0 ? totalN : 0
  const sobra = turned ? 0 : Math.max(0, s.sobra ?? 0) + pile
  const sobraRows = Math.ceil(sobra / C)
  const roomRows = Math.max(L + sobraRows, maxLinhas ?? 0, 1)
  const gap = 8 // between parts
  const rowGap = s.grupos ? 6 : 0
  const labelW = s.rotulos ? 30 : 0
  const labelH = s.rotulos ? 26 : 0
  const totalH = s.total !== undefined ? 40 : 0
  const k = Math.max(
    6,
    Math.min(
      s.faixas ? 56 : 40,
      (size.w - 32 - labelW - gap * (colParts.length - 1)) / C,
      (size.h - 24 - labelH - totalH - gap * (rowParts.length - 1) - rowGap * (roomRows - 1)) / roomRows,
    ),
  )
  const cell = k - Math.max(1.5, k * 0.08)
  const colStart: number[] = []
  colParts.reduce((acc, p, i) => (colStart.push(acc), acc + p * k + (i < colParts.length - 1 ? gap : 0)), 0)
  const rowStart: number[] = []
  rowParts.reduce((acc, p, i) => (rowStart.push(acc), acc + p * k + p * rowGap + (i < rowParts.length - 1 ? gap : 0)), 0)
  const W = C * k + gap * (colParts.length - 1)
  const H = (n: number) => n * k + n * rowGap + gap * (rowParts.length - 1)
  const fullH = Math.max(H(L), H(roomRows))
  const ox = (size.w - W - labelW) / 2 + labelW
  const oy = Math.max(8, (size.h - fullH - labelH - totalH) / 2) + labelH

  const xOf = (c: number) => {
    let acc = 0
    for (let i = 0; i < colParts.length; i++) {
      if (c < acc + colParts[i]) return ox + colStart[i] + (c - acc) * k
      acc += colParts[i]
    }
    return ox + W
  }
  const partOfRow = (r: number) => {
    let acc = 0
    for (let i = 0; i < rowParts.length; i++) {
      if (r < acc + rowParts[i]) return [i, r - acc] as const
      acc += rowParts[i]
    }
    return [rowParts.length - 1, 0] as const
  }
  const yOf = (r: number) => {
    const [i, j] = partOfRow(r)
    return oy + rowStart[i] + j * (k + rowGap)
  }
  const partOfCol = (c: number) => {
    let acc = 0
    for (let i = 0; i < colParts.length; i++) {
      if (c < acc + colParts[i]) return i
      acc += colParts[i]
    }
    return colParts.length - 1
  }
  const lit = (r: number, c: number) => {
    if (s.destaque === 'linha') return r === 0
    if (s.destaque === 'coluna') return c === 0
    if (Array.isArray(s.destaque)) return partOfRow(r)[0] === s.destaque[0] && partOfCol(c) === s.destaque[1]
    return false
  }
  const faixa = (r: number, c: number) => {
    const inR = r < s.faixas![0]
    const inC = c < s.faixas![1]
    return inR && inC ? amber : inR || inC ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.14)'
  }
  const areaText = (i: number, j: number) => {
    if (Array.isArray(s.areas)) return s.areas[i]?.[j]
    if (s.areas) return rowParts[i] * colParts[j]
    return undefined
  }

  const cells: { key: string; r: number; c: number }[] = []
  for (let r = 0; r < L0; r++) for (let c = 0; c < C0; c++) cells.push({ key: `${r}-${c}`, r: turned ? c : r, c: turned ? r : c })
  const canRemove = Boolean(onRemove) && L > 0
  const loose = Array.from({ length: sobra }, (_, i) => ({ key: `s${i}`, r: L + Math.floor(i / C), c: i % C }))

  return (
    <motion.svg
      width={size.w}
      height={size.h}
      className="select-none"
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onTurn}
      style={{ cursor: onTurn ? 'pointer' : undefined }}
      role="img"
      aria-label={`Retângulo de ${L} linhas e ${C} colunas`}
    >
      <AnimatePresence initial={false}>
        {cells.map(({ key, r, c }) => (
          <motion.rect
            key={key}
            initial={{ opacity: 0, x: xOf(c), y: yOf(r) - k * 0.6 }}
            animate={{ opacity: 1, x: xOf(c), y: yOf(r) }}
            exit={{ opacity: 0, y: yOf(r) - k * 0.6 }}
            transition={{ duration: 0.45, ease }}
            width={cell}
            height={cell}
            rx={Math.min(5, k * 0.18)}
            fill={s.faixas ? faixa(r, c) : lit(r, c) ? amber : 'rgba(255,255,255,0.88)'}
            onClick={canRemove && r === L - 1 ? (ev) => (ev.stopPropagation(), onRemove!()) : undefined}
            style={{ cursor: canRemove && r === L - 1 ? 'pointer' : undefined }}
          />
        ))}
        {loose.map(({ key, r, c }) => (
          <motion.rect
            key={key}
            initial={{ opacity: 0, x: xOf(c), y: yOf(Math.min(r, L)) + (r >= L ? (r - L + 1) * (k + rowGap) + 6 : 0) - k * 0.6 }}
            animate={{ opacity: 1, x: xOf(c), y: oy + H(L) + (r - L) * (k + rowGap) + 6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            width={cell}
            height={cell}
            rx={Math.min(5, k * 0.18)}
            fill="rgba(251,191,36,0.18)"
            stroke={amber}
            strokeWidth={1.5}
          />
        ))}
      </AnimatePresence>

      {onAdd && (
        <motion.g key="ghost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={(ev) => (ev.stopPropagation(), onAdd())} style={{ cursor: 'pointer' }}>
          <rect x={ox - 4} y={yOf(Math.max(0, L - 1)) + (L ? k + rowGap : 0) - 2} width={W + 8} height={k + 4} rx={8} fill="rgba(251,191,36,0.06)" stroke={amber} strokeDasharray="5 5" strokeWidth={1.5} />
          <text x={ox + W / 2} y={yOf(Math.max(0, L - 1)) + (L ? k + rowGap : 0) + k / 2 + 5} textAnchor="middle" fill={amber} fontSize={14} fontWeight={600}>
            + 1 linha
          </text>
        </motion.g>
      )}

      {onCut &&
        Array.from({ length: C - 1 }, (_, i) => i + 1).map((i) => (
          <g key={`cut${i}`} onClick={(ev) => (ev.stopPropagation(), onCut(i))} style={{ cursor: 'pointer' }}>
            <rect x={xOf(i) - k / 2} y={oy - 6} width={k} height={H(L) + 12} fill="transparent" />
            <line x1={xOf(i) - (k - cell) / 2} x2={xOf(i) - (k - cell) / 2} y1={oy - 4} y2={oy + H(L) + 4} stroke="rgba(251,191,36,0.35)" strokeDasharray="3 5" strokeWidth={1.5} />
          </g>
        ))}

      {colParts.length > 1 &&
        colParts.slice(1).map((_, i) => {
          const xx = ox + colStart[i + 1] - gap / 2 - (k - cell) / 2
          return <motion.line key={`cv${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x1={xx} x2={xx} y1={oy - 6} y2={oy + H(L) + 2} stroke={amber} strokeWidth={2} strokeDasharray="6 5" />
        })}
      {rowParts.length > 1 &&
        rowParts.slice(1).map((_, i) => {
          const yy = oy + rowStart[i + 1] - gap / 2 - (k - cell) / 2
          return <motion.line key={`ch${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x1={ox - 6} x2={ox + W + 2} y1={yy} y2={yy} stroke={amber} strokeWidth={2} strokeDasharray="6 5" />
        })}

      {s.rotulos && (
        <>
          {colParts.map((p, i) => (
            <motion.text key={`tc${i}-${p}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={ox + colStart[i] + (p * k - (k - cell)) / 2} y={oy - 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={15} fontWeight={600} className="tabular-nums">
              {p}
            </motion.text>
          ))}
          {L > 0 &&
            rowParts.map((p, i) => (
              <motion.text key={`tr${i}-${p}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={ox - 12} y={oy + rowStart[i] + (p * (k + rowGap) - (k - cell)) / 2 + 5} textAnchor="end" fill="rgba(255,255,255,0.85)" fontSize={15} fontWeight={600} className="tabular-nums">
                {p}
              </motion.text>
            ))}
        </>
      )}

      {s.areas &&
        L > 0 &&
        rowParts.map((rp, i) =>
          colParts.map((cp, j) => {
            const t = areaText(i, j)
            if (t === undefined) return null
            const cx = ox + colStart[j] + (cp * k - (k - cell)) / 2
            const cy = oy + rowStart[i] + (rp * (k + rowGap) - (k - cell)) / 2
            const fs = Math.max(13, Math.min(26, Math.min(cp, rp) * k * 0.5))
            return (
              <motion.g key={`ar${i}-${j}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + 0.15 * (i * colParts.length + j) }}>
                <rect x={cx - fs * 1.3} y={cy - fs * 0.75} width={fs * 2.6} height={fs * 1.5} rx={fs * 0.4} fill="rgba(5,6,10,0.82)" />
                <text x={cx} y={cy + fs * 0.36} textAnchor="middle" fill={amber} fontSize={fs} fontWeight={700} className="tabular-nums">
                  {typeof t === 'number' ? t.toLocaleString('pt-BR') : t}
                </text>
              </motion.g>
            )
          }),
        )}

      {s.total !== undefined && (
        <motion.text key="total" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} x={size.w / 2} y={oy + H(roomRows) + 32} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={600} className="tabular-nums">
          {s.total.toLocaleString('pt-BR')}
        </motion.text>
      )}
    </motion.svg>
  )
}

function Area({ s, size }: { s: RetanguloState; size: { w: number; h: number } }) {
  const base = s.base!
  const altura = s.altura!
  // A letter is a length we do not know: it is drawn a little longer than the numbers next to it.
  const nums = [...base, ...altura].filter((v): v is number => typeof v === 'number')
  const letra = s.tamanhoLetra ?? Math.max(4, ...nums.map((n) => n * 1.6))
  const med = (v: number | string) => (typeof v === 'number' ? v : letra)
  const sb = base.reduce<number>((a, b) => a + med(b), 0)
  const sa = altura.reduce<number>((a, b) => a + med(b), 0)
  const labelW = 40
  const labelH = 28
  const totalH = s.total !== undefined ? 40 : 0
  const availW = size.w - 32 - labelW
  const availH = size.h - 24 - labelH - totalH
  // Proportional, but no part thinner than its label.
  const minPart = 46
  const scale = Math.min(availW / sb, availH / sa)
  const widths = base.map((b) => Math.max(minPart, med(b) * scale))
  const heights = altura.map((a) => Math.max(altura.length === 1 ? 84 : 60, med(a) * scale))
  const fitW = Math.min(1, availW / widths.reduce((a, b) => a + b, 0))
  const fitH = Math.min(1, availH / heights.reduce((a, b) => a + b, 0))
  const ws = widths.map((w) => w * fitW)
  const hs = heights.map((h) => h * fitH)
  const W = ws.reduce((a, b) => a + b, 0)
  const H = hs.reduce((a, b) => a + b, 0)
  const ox = (size.w - W - labelW) / 2 + labelW
  const oy = Math.max(8, (size.h - H - labelH - totalH) / 2) + labelH
  const xs = ws.map((_, i) => ox + ws.slice(0, i).reduce((a, b) => a + b, 0))
  const ys = hs.map((_, i) => oy + hs.slice(0, i).reduce((a, b) => a + b, 0))
  const lit = (i: number, j: number) => Array.isArray(s.destaque) && s.destaque[0] === i && s.destaque[1] === j
  const areaText = (i: number, j: number) => (Array.isArray(s.areas) ? s.areas[i]?.[j] : s.areas ? produto(altura[i], base[j]) : undefined)

  return (
    <svg width={size.w} height={size.h} role="img" aria-label={`Retângulo de ${altura.join(' + ')} por ${base.join(' + ')}, partido`}>
      {altura.map((a, i) =>
        base.map((b, j) => (
          <motion.rect
            key={`p${i}-${j}`}
            initial={{ opacity: 0, x: xs[j], y: ys[i], width: ws[j] - 3, height: hs[i] - 3 }}
            animate={{ opacity: 1, x: xs[j], y: ys[i], width: ws[j] - 3, height: hs[i] - 3 }}
            transition={{ duration: 0.45, ease }}
            rx={6}
            fill={lit(i, j) ? 'rgba(251,191,36,0.28)' : 'rgba(255,255,255,0.1)'}
            stroke={lit(i, j) ? amber : 'rgba(255,255,255,0.75)'}
            strokeWidth={1.5}
          />
        )),
      )}
      {base.map((b, j) => (
        <motion.text key={`b${j}-${b}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={xs[j] + ws[j] / 2} y={oy - 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={16} fontWeight={600} className="tabular-nums">
          {escreve(b)}
        </motion.text>
      ))}
      {altura.map((a, i) => (
        <motion.text key={`h${i}-${a}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={ox - 12} y={ys[i] + hs[i] / 2 + 5} textAnchor="end" fill="rgba(255,255,255,0.85)" fontSize={16} fontWeight={600} className="tabular-nums">
          {escreve(a)}
        </motion.text>
      ))}
      {altura.map((_, i) =>
        base.map((_, j) => {
          const t = areaText(i, j)
          if (t === undefined) return null
          const fs = Math.max(13, Math.min(24, Math.min(ws[j], hs[i]) * 0.32))
          return (
            <motion.text key={`a${i}-${j}-${t}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + 0.15 * (i * base.length + j) }} x={xs[j] + ws[j] / 2} y={ys[i] + hs[i] / 2 + fs * 0.35} textAnchor="middle" fill={amber} fontSize={fs} fontWeight={700} className="tabular-nums">
              {typeof t === 'number' ? t.toLocaleString('pt-BR') : t}
            </motion.text>
          )
        }),
      )}
      {s.total !== undefined && (
        <motion.text initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} x={size.w / 2} y={oy + H + 32} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={600} className="tabular-nums">
          {escreve(s.total)}
        </motion.text>
      )}
    </svg>
  )
}

const escreve = (v: number | string) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)

/** The area of one part: 3 × 4 = 12, 3 × x = 3x, x × x = x², 2x × 3 = 6x. */
export function produto(a: number | string, b: number | string): number | string {
  if (typeof a === 'number' && typeof b === 'number') return a * b
  const partes = (v: number | string): [number, string] => {
    if (typeof v === 'number') return [v, '']
    const m = v.match(/^(\d*)([a-zA-Z]+)$/)
    return m ? [m[1] ? Number(m[1]) : 1, m[2]] : [1, v]
  }
  const [ka, la] = partes(a)
  const [kb, lb] = partes(b)
  const k = ka * kb
  const letras = la && lb && la === lb ? `${la}²` : [la, lb].filter(Boolean).sort().join('')
  return `${k === 1 ? '' : k.toLocaleString('pt-BR')}${letras}`
}
