'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { celulasDestaque, chaveRevelar, comprimento, ehNegativo, escreveMonomio, escreveNumero, lerMonomio, letraPadrao, letrasDe, MENOS, pedacosSoma, produto, revelaveis, somaTermos, termosCancelados, type Celula } from './monomio'
import { Recorte } from './Recorte'

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
  /** Acende partes: uma ([0, 1]), uma lista ([[0, 1], [1, 0]]), a primeira linha ou a primeira coluna. */
  destaque?: Celula | Celula[] | 'linha' | 'coluna'
  girar?: boolean
  total?: number | string
  grupos?: boolean
  /** Por área: as partes de cada lado. Uma parte pode ser um monômio ('x', '3x', 'x²', '−2', 'xy'), desenhada com `tamanhoLetra`. */
  base?: (number | string)[]
  altura?: (number | string)[]
  /** Com letras nos lados: quanto uma letra ocupa, na escala dos números (padrão: um pouco mais que a maior parte numérica). */
  tamanhoLetra?: number
  /** Por área: esse lado aparece com "?" em cada parte (o desenho usa as partes de verdade). Para a divisão. */
  oculto?: 'base' | 'altura'
  /** Por área: embaixo, a soma das áreas e, juntando os termos semelhantes, a soma simplificada. */
  somaTermos?: boolean
  /** Por área, Mexa "revelar": tocar cada parte descobre a área dela (ou, com `oculto`, a parte do lado). */
  revelar?: boolean
  /** O resto: quadradinhos soltos numa linha incompleta, embaixo do retângulo. */
  sobra?: number
  /** Fração de fração: as primeiras [linhas, colunas] ficam claras; o cruzamento das duas, em âmbar. */
  faixas?: [number, number]
  /** Por área: duas partes de áreas opostas (3x e −3x) aparecem apagadas e riscadas; na soma também. */
  cancela?: boolean
  /** A diferença de quadrados: um quadrado x por x sem o canto `recorte` por `recorte` (AF.U2). */
  recorte?: number
  /** Com `recorte`: o pedaço de baixo já foi para o lado; o desenho é (x + b) por (x − b). */
  movido?: boolean
  /** Com `recorte`: a letra do lado grande (padrão "x"). */
  letra?: string
  /** Com `recorte`, Mexa "mover": o toque corta o L e leva um pedaço para o lado. */
  mover?: boolean
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
  /** Mexa "revelar" (por área): o que já foi descoberto ('0-1' é a área da parte; 'b1', 'h0', uma parte do lado oculto) e o toque numa parte. */
  reveladas?: string[]
  onRevelar?: (chave: string, i: number, j: number) => void
  /** Mexa "mover" (recorte): o toque no quadrado recortado. */
  onMover?: () => void
}

const amber = '#fbbf24'
const ease = [0.22, 1, 0.36, 1] as const
// The red of the negative algebra tiles: a part or an area that subtracts.
const rose = '#fb7185'

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

export function Retangulo({ s, size, onAdd, onRemove, maxLinhas, onCut, onTurn, wrong, reveladas, onRevelar, onMover }: { s: RetanguloState; size: { w: number; h: number } } & RetanguloInteract) {
  if (typeof s.recorte === 'number' && s.recorte > 0) return <Recorte b={s.recorte} letra={s.letra} movido={Boolean(s.movido)} size={size} onMover={onMover} />
  if (s.base?.length && s.altura?.length) return <Area s={s} size={size} reveladas={reveladas} onRevelar={onRevelar} />
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
    return celulasDestaque(s.destaque).some(([i, j]) => partOfRow(r)[0] === i && partOfCol(c) === j)
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

function Area({ s, size, reveladas, onRevelar }: { s: RetanguloState; size: { w: number; h: number } } & RetanguloInteract) {
  const base = s.base!
  const altura = s.altura!
  const partes = [...base, ...altura]
  // A letter is a length we do not know: it is drawn a little longer than the numbers next to it.
  const letra = s.tamanhoLetra ?? letraPadrao(partes)
  const letras = letrasDe(partes)
  const med = (v: number | string) => comprimento(v, letra, letras)
  const sb = base.reduce<number>((a, b) => a + med(b), 0)
  const sa = altura.reduce<number>((a, b) => a + med(b), 0)
  // Mexa "revelar": until every key is uncovered, the hidden ones show "?".
  const revelando = Boolean(onRevelar) || reveladas !== undefined
  const chaves = revelaveis(s)
  const aberto = (k: string) => !revelando || (reveladas ?? []).includes(k)
  const tudo = chaves.every(aberto)
  const rotuloLado = (v: number | string, k: string, lado: 'base' | 'altura') => (s.oculto === lado && (!revelando || !aberto(k)) ? '?' : escreve(v))
  const areaText = (i: number, j: number): number | string | undefined => {
    if (Array.isArray(s.areas)) return s.areas[i]?.[j]
    if (s.areas || revelando) return produto(altura[i], base[j])
    return undefined
  }
  const termos = altura.flatMap((_, i) => base.map((_, j) => areaText(i, j))).filter((t): t is number | string => t !== undefined)
  // The sum below appears when every area is in view; its room is kept from the start, so nothing jumps.
  const somaToda = s.somaTermos && termos.length && termos.every((t) => lerMonomio(t) !== null) ? [pedacosSoma(termos).join(''), somaTermos(termos)] : undefined
  const linhasSoma = somaToda ? (somaToda[0] === somaToda[1] ? 1 : 2) : 0
  const soma = tudo ? somaToda : undefined
  const mostraTotal = s.total !== undefined && tudo
  const labelW = Math.max(40, ...altura.map((a) => String(rotuloLado(a, '', 'altura')).length * 10 + 14))
  const labelH = 28
  const totalH = (s.total !== undefined ? 40 : 0) + linhasSoma * 32 + (linhasSoma ? 8 : 0)
  const availW = size.w - 32 - labelW
  const availH = size.h - 24 - labelH - totalH
  // Proportional, but no part thinner than its label.
  const minPart = 46
  const scale = Math.min(availW / sb, availH / sa)
  const widths = base.map((b) => Math.max(minPart, med(b) * scale))
  const heights = altura.map((a) => Math.max(altura.length === 1 ? 84 : 60, med(a) * scale))
  const fitW = Math.min(1, availW / widths.reduce((a, b) => a + b, 0))
  const fitH = Math.min(1, availH / heights.reduce((a, b) => a + b, 0))
  // The same parts on both sides ((x + 3)²) make a square: both sides take the smaller fit.
  const quadrado = base.length === altura.length && base.every((b, i) => String(b) === String(altura[i]))
  const lados = base.map((b) => Math.max(minPart, med(b) * scale))
  const fitQ = Math.min(1, Math.min(availW, availH) / lados.reduce((a, b) => a + b, 0))
  const ws = quadrado ? lados.map((l) => l * fitQ) : widths.map((w) => w * fitW)
  const hs = quadrado ? ws : heights.map((h) => h * fitH)
  const W = ws.reduce((a, b) => a + b, 0)
  const H = hs.reduce((a, b) => a + b, 0)
  const ox = (size.w - W - labelW) / 2 + labelW
  const oy = Math.max(8, (size.h - H - labelH - totalH) / 2) + labelH
  const xs = ws.map((_, i) => ox + ws.slice(0, i).reduce((a, b) => a + b, 0))
  const ys = hs.map((_, i) => oy + hs.slice(0, i).reduce((a, b) => a + b, 0))
  const acesas = celulasDestaque(s.destaque)
  const lit = (i: number, j: number) => acesas.some(([a, b]) => a === i && b === j)
  // Opposite areas cancel (3x and −3x): only areas in view take part.
  const vistas = altura.map((_, i) => base.map((_, j) => (revelando && !s.oculto && !aberto(chaveRevelar(s, i, j)) ? undefined : areaText(i, j))))
  const cancelados = s.cancela ? termosCancelados(vistas.flat()) : []
  const riscada = (i: number, j: number) => Boolean(cancelados[i * base.length + j])
  const corLado = (v: number | string, rotulo: string) => (rotulo === '?' ? amber : ehNegativo(v) ? rose : 'rgba(255,255,255,0.85)')
  const fimY = oy + H

  return (
    <svg width={size.w} height={size.h} className="select-none" role="img" aria-label={`Retângulo de ${altura.map(escreve).join(' + ')} por ${base.map(escreve).join(' + ')}, partido`}>
      {altura.map((_, i) =>
        base.map((_, j) => {
          const neg = ehNegativo(areaText(i, j))
          const fechado = revelando && !s.oculto && !aberto(chaveRevelar(s, i, j))
          const tocavel = Boolean(onRevelar) && !aberto(chaveRevelar(s, i, j))
          return (
            <motion.rect
              key={`p${i}-${j}`}
              initial={{ opacity: 0, x: xs[j], y: ys[i], width: ws[j] - 3, height: hs[i] - 3 }}
              animate={{ opacity: riscada(i, j) ? 0.4 : 1, x: xs[j], y: ys[i], width: ws[j] - 3, height: hs[i] - 3 }}
              transition={{ duration: 0.45, ease }}
              rx={6}
              fill={lit(i, j) ? 'rgba(251,191,36,0.28)' : neg && !fechado ? 'rgba(251,113,133,0.16)' : 'rgba(255,255,255,0.1)'}
              stroke={lit(i, j) ? amber : neg && !fechado ? rose : 'rgba(255,255,255,0.75)'}
              strokeWidth={1.5}
              strokeDasharray={tocavel ? '6 4' : undefined}
              onClick={tocavel ? () => onRevelar!(chaveRevelar(s, i, j), i, j) : undefined}
              style={{ cursor: tocavel ? 'pointer' : undefined }}
            />
          )
        }),
      )}
      {base.map((b, j) => {
        const r = rotuloLado(b, `b${j}`, 'base')
        return (
          <motion.text key={`b${j}-${r}`} initial={{ opacity: 0, scale: r === '?' ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }} x={xs[j] + ws[j] / 2} y={oy - 10} textAnchor="middle" fill={corLado(b, r)} fontSize={16} fontWeight={600} className="tabular-nums">
            {r}
          </motion.text>
        )
      })}
      {altura.map((a, i) => {
        const r = rotuloLado(a, `h${i}`, 'altura')
        return (
          <motion.text key={`h${i}-${r}`} initial={{ opacity: 0, scale: r === '?' ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }} x={ox - 12} y={ys[i] + hs[i] / 2 + 5} textAnchor="end" fill={corLado(a, r)} fontSize={16} fontWeight={600} className="tabular-nums">
            {r}
          </motion.text>
        )
      })}
      {altura.map((_, i) =>
        base.map((_, j) => {
          const t0 = areaText(i, j)
          if (t0 === undefined) return null
          const fechado = revelando && !s.oculto && !aberto(chaveRevelar(s, i, j))
          const t = fechado ? '?' : escreve(t0)
          const neg = !fechado && ehNegativo(t0)
          // No wider than its part: '−6x²' in a thin part gets a smaller font.
          const largura = [...t].reduce((a, c) => a + (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(c) ? 0.4 : 0.62), 0)
          const fs = Math.max(12, Math.min(24, Math.max(16, Math.min(ws[j], hs[i]) * 0.32), (ws[j] - 10) / Math.max(1, largura)))
          const fora = riscada(i, j)
          const meio = largura * fs * 0.5 + 6
          const cx = xs[j] + ws[j] / 2
          const cy = ys[i] + hs[i] / 2
          return (
            <g key={`a${i}-${j}-${t}`}>
            <motion.text
              initial={{ opacity: 0, scale: fechado ? 1 : revelando ? 0.3 : 0.8 }}
              animate={{ opacity: fora ? 0.45 : 1, scale: 1 }}
              transition={revelando ? { type: 'spring', stiffness: 420, damping: 14 } : { delay: 0.25 + 0.15 * (i * base.length + j) }}
              x={xs[j] + ws[j] / 2}
              y={ys[i] + hs[i] / 2 + fs * 0.35}
              textAnchor="middle"
              fill={fechado ? 'rgba(255,255,255,0.4)' : neg ? rose : amber}
              fontSize={fs}
              fontWeight={700}
              className="tabular-nums"
              style={{ pointerEvents: 'none' }}
            >
              {t}
            </motion.text>
            {/* A cancelled area (3x against −3x) is struck through, like the opposite tiles. */}
            {fora && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: revelando ? 0.3 : 0.6, duration: 0.35 }} x1={cx - meio} y1={cy + fs * 0.3} x2={cx + meio} y2={cy - fs * 0.3} stroke="#fff" strokeWidth={2} strokeLinecap="round" style={{ pointerEvents: 'none' }} />}
            </g>
          )
        }),
      )}
      {soma && (
        <motion.g key={`soma-${soma.join('|')}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: revelando ? 0.35 : 0.25 + 0.15 * termos.length }}>
          {soma.slice(0, linhasSoma).map((linha, n) => {
            const txt = n === 0 ? linha : `= ${linha}`
            const fs = Math.max(14, Math.min(20, (size.w - 24) / Math.max(1, [...txt].length * 0.56)))
            // With `cancela`, the first line strikes the terms that cancel (x² + 3x − 3x − 9).
            const pedacos = n === 0 && linhasSoma > 1 && s.cancela ? pedacosSoma(termos) : undefined
            const fora = pedacos ? termosCancelados(termos) : []
            return (
              <text key={n} x={size.w / 2} y={fimY + 30 + n * 32} textAnchor="middle" fill={n === linhasSoma - 1 ? amber : 'rgba(255,255,255,0.85)'} fontSize={fs} fontWeight={n === linhasSoma - 1 ? 700 : 600} className="tabular-nums">
                {pedacos
                  ? pedacos.map((p, k) => (
                      <tspan key={k} fillOpacity={fora[k] ? 0.45 : 1} textDecoration={fora[k] ? 'line-through' : undefined}>
                        {p.replace(/^ /, '\u00a0').replace(/ $/, '\u00a0')}
                      </tspan>
                    ))
                  : txt}
              </text>
            )
          })}
        </motion.g>
      )}
      {mostraTotal && (
        <motion.text initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: revelando ? 0.35 : 0 }} x={size.w / 2} y={fimY + linhasSoma * 32 + (linhasSoma ? 8 : 0) + 32} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={600} className="tabular-nums">
          {escreve(s.total!)}
        </motion.text>
      )}
    </svg>
  )
}

/** A side or an area as the student reads it: 1.000, −2, −3x (a monomial written the usual way). */
const escreve = (v: number | string) => {
  if (typeof v === 'number') return escreveNumero(v)
  const m = lerMonomio(v)
  return m && Object.keys(m.letras).length ? escreveMonomio(m) : v.replace(/-/g, MENOS)
}

export { produto }
