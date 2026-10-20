'use client'

import { AnimatePresence, motion } from 'framer-motion'

// A tabela de proporção: duas grandezas, uma em cada linha, e os pares lado a
// lado em colunas. As setas mostram o que se faz de uma coluna para a outra
// (× 2 em cima e × 2 embaixo: é proporção) e, à direita, de uma linha para a
// outra (o fator que vale para todas as colunas). Na inversa, a seta de
// cima diz × 2 e a de baixo, ÷ 2.

export type TabelaValor = number | string | null

export interface TabelaLinha {
  /** O nome da grandeza, à esquerda ("farinha (xícaras)"). */
  rotulo: string
  /** Um valor por coluna. `null` ou `'?'` é o que falta descobrir. */
  valores: TabelaValor[]
}

export interface TabelaSeta {
  /** Colunas de saída e de chegada (a partir de 0). */
  de: number
  para: number
  /** O que a seta diz ("× 3", "÷ 2", "+ 2"). */
  rotulo: string
  /** Embaixo da última linha, em vez de em cima da primeira. */
  embaixo?: boolean
}

export interface TabelaState {
  linhas: TabelaLinha[]
  setas?: TabelaSeta[]
  /** Uma seta à direita, da primeira linha para a segunda, com este rótulo ("× 3"). */
  fator?: string
  /** O `fator` só aparece quando todas as colunas já estão à vista (no Mexa, depois da última). */
  fatorNoFim?: boolean
  /** Colunas em destaque (moldura âmbar). */
  destaque?: number[]
  /** Quantas colunas aparecem; as outras ficam como caixas vazias (Mexa "completar"). */
  mostradas?: number
  /** Mexa: tocar na próxima coluna vazia a preenche. */
  completar?: boolean
}

export interface TabelaInteract {
  /** Mexa "completar": um toque numa coluna ainda vazia. */
  onColuna?: (coluna: number) => void
  /** Quantas colunas já aparecem (substitui `mostradas`). */
  mostradas?: number
  wrong?: boolean
}

const amber = '#f6b74e'
const ease = [0.22, 1, 0.36, 1] as const

const falta = (v: TabelaValor) => v === null || v === '?'
// Negatives with the true minus sign (−3), not the hyphen of toLocaleString.
const texto = (v: TabelaValor) => (falta(v) ? '?' : typeof v === 'number' ? v.toLocaleString('pt-BR').replace('-', '−') : v)

export function Tabela({ s, size, onColuna, mostradas: shown, wrong }: { s: TabelaState; size: { w: number; h: number } } & TabelaInteract) {
  const linhas = s.linhas ?? []
  const n = Math.max(0, ...linhas.map((l) => l.valores.length))
  const vis = Math.min(n, shown ?? s.mostradas ?? n)
  const setas = (s.setas ?? []).filter((a) => a.de < vis && a.para < vis)
  const temCima = setas.some((a) => !a.embaixo)
  const temBaixo = setas.some((a) => a.embaixo)
  const pad = 12
  const room = (lw: number, fw: number) => (size.w - pad * 2 - lw - fw) / Math.max(1, n)
  // Many columns on a phone: the labels and the side arrow give up room first.
  // The labels take what their longest word line needs (they wrap), up to 30 % of the width.
  const fitLabel = Math.min(124, size.w * 0.3, Math.max(56, ...linhas.map((l) => Math.min(l.rotulo.length, 14) * 7.2 + 10)))
  const roomy = room(fitLabel, s.fator ? 78 : 0) >= 54
  const fatorW = s.fator ? (roomy ? 78 : 58) : 0
  const labelW = roomy ? fitLabel : Math.min(fitLabel, 66)
  const cellW = Math.max(40, Math.min(92, room(labelW, fatorW)))
  const cellH = Math.max(46, Math.min(64, size.h / 6))
  const arcH = Math.min(46, cellW * 0.55)
  const W = labelW + n * cellW + fatorW
  const H = linhas.length * cellH + (temCima ? arcH + 18 : 0) + (temBaixo ? arcH + 18 : 0)
  const ox = Math.max(pad, (size.w - W) / 2)
  const oy = Math.max(8, (size.h - H) / 2) + (temCima ? arcH + 18 : 0)
  // One size per row, the one its longest number fits in (a row of 1.000.000 does not shrink the row of 10⁶).
  // In digit widths: dots, commas and spaces are narrow, the % sign is wide, superscripts are small.
  const largura = (t: string) => [...t].reduce((w, ch) => w + (ch === '.' || ch === ',' ? 0.5 : ch === ' ' ? 0.4 : ch === '%' ? 1.4 : /[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(ch) ? 0.6 : 1), 0)
  const fsLinha = linhas.map((l) => Math.min(26, cellH * 0.46, (cellW - 12) / (0.58 * Math.max(2, ...l.valores.map((v) => largura(String(texto(v))))))))
  const cx = (c: number) => ox + labelW + (c + 0.5) * cellW
  const yTop = oy
  const yBot = oy + linhas.length * cellH

  return (
    <motion.div
      className="relative h-full w-full select-none"
      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      role="img"
      aria-label={`Tabela: ${linhas.map((l) => `${l.rotulo}: ${l.valores.slice(0, vis).map(texto).join(', ')}`).join('; ')}`}
    >
      {linhas.map((l, r) => (
        <div key={`r${r}`} className="absolute flex items-center pr-2 text-[14px] font-medium leading-tight text-white/70" style={{ left: ox, top: oy + r * cellH, width: labelW, height: cellH }}>
          {l.rotulo}
        </div>
      ))}
      {Array.from({ length: n }, (_, c) => {
        const on = c < vis
        const next = !on && c === vis && onColuna
        const dest = on && s.destaque?.includes(c)
        return (
          <motion.div
            key={`c${c}`}
            className="absolute rounded-xl"
            style={{ left: cx(c) - cellW / 2 + 3, top: oy - 3, width: cellW - 6, height: linhas.length * cellH + 6, cursor: next ? 'pointer' : undefined }}
            animate={{ boxShadow: dest ? `inset 0 0 0 2px ${amber}` : next ? `inset 0 0 0 1.5px ${amber}` : 'inset 0 0 0 0px transparent', backgroundColor: next ? 'rgba(246,183,78,0.06)' : 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.3 }}
            onClick={next ? () => onColuna!(c) : undefined}
          >
            {linhas.map((l, r) => {
              const v = l.valores[c] ?? null
              const q = falta(v)
              return (
                <div key={`v${r}`} className="absolute inset-x-0 grid place-items-center" style={{ top: 3 + r * cellH, height: cellH }}>
                  <div className={`grid h-[82%] w-[calc(100%-4px)] place-items-center rounded-lg border ${on ? (q ? 'border-dashed border-[#f6b74e]/70' : 'border-white/20 bg-white/[0.05]') : 'border-dashed border-white/20'}`}>
                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.span
                          key={`${c}-${r}-${texto(v)}`}
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, ease, delay: r * 0.12 }}
                          className="whitespace-nowrap font-semibold tabular-nums"
                          style={{ fontSize: fsLinha[r], color: q ? amber : '#fff' }}
                        >
                          {texto(v)}
                        </motion.span>
                      ) : next && r === 0 ? (
                        <span className="text-[22px] font-semibold text-[#f6b74e]">+</span>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )
      })}
      <svg className="pointer-events-none absolute inset-0" width={size.w} height={size.h}>
        <defs>
          <marker id="tab-ponta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={amber} />
          </marker>
        </defs>
        <AnimatePresence initial={false}>
          {setas.map((a) => {
            const x1 = cx(a.de)
            const x2 = cx(a.para)
            const y = a.embaixo ? yBot + 6 : yTop - 6
            const k = a.embaixo ? 1 : -1
            const peak = y + k * arcH
            const mid = (x1 + x2) / 2
            const sx = x1 + (x2 > x1 ? 8 : -8)
            const ex = x2 + (x2 > x1 ? -8 : 8)
            return (
              <motion.g key={`${a.de}-${a.para}-${a.embaixo ? 'b' : 't'}-${a.rotulo}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, delay: 0.25 }}>
                <path d={`M${sx} ${y} Q${mid} ${peak} ${ex} ${y}`} fill="none" stroke={amber} strokeWidth={2} markerEnd="url(#tab-ponta)" />
                <text x={mid} y={a.embaixo ? peak + 4 : peak + 4} textAnchor="middle" fill={amber} fontSize={15} fontWeight={700} className="tabular-nums" style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 5 }}>
                  {a.rotulo}
                </text>
              </motion.g>
            )
          })}
        </AnimatePresence>
        {s.fator && linhas.length >= 2 && (!s.fatorNoFim || vis >= n) && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.2 }}>
            <path d={`M${ox + labelW + n * cellW + 6} ${oy + cellH / 2} Q${ox + labelW + n * cellW + (roomy ? 34 : 26)} ${oy + cellH} ${ox + labelW + n * cellW + 8} ${oy + cellH * 1.5}`} fill="none" stroke={amber} strokeWidth={2} markerEnd="url(#tab-ponta)" />
            <text x={ox + labelW + n * cellW + (roomy ? 30 : 22)} y={oy + cellH + 5} textAnchor="start" fill={amber} fontSize={15} fontWeight={700} className="tabular-nums" style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 5 }}>
              {s.fator}
            </text>
          </motion.g>
        )}
      </svg>
    </motion.div>
  )
}
