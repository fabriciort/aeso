'use client'

import { Fragment, useId } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fmtNum } from './figura-geo'
import { celulasDe, type Sistema as S, type Troca } from './sistema'

// Os sistemas de equações (AF.U4), as duas contas que não precisam do plano.
//
// A adição: as equações empilhadas, alinhadas termo a termo (x sobre x, y
// sobre y, = sobre =), como duas balanças em equilíbrio. Um "× 2" ao lado de
// uma linha diz por quanto multiplicá-la; multiplicada, a linha mostra os
// números novos. Somadas, aparece a linha da soma embaixo de um traço, e os
// termos que se anulam (+y e −y) ficam riscados: 2x = 14. No Mexa "somar",
// um toque multiplica (se houver o "× 2") e o outro soma.
//
// A substituição: a primeira equação diz quanto vale uma letra (y = x + 2),
// numa caixa; na segunda, a letra acesa. Trocada, a caixa, com os
// parênteses, voa para o lugar da letra: x + (x + 2) = 10. No Mexa "trocar",
// um toque troca.

const amber = '#f6b74e'
const sky = '#7dd3fc'
const rose = '#fb7185'
const CORES = [amber, sky]
const ease = [0.22, 1, 0.36, 1] as const

export function SistemaSoma({ s, size, onSomar, proximo }: { s: S; size: { w: number; h: number }; onSomar?: () => void; proximo?: 'multiplicar' | 'somar' }) {
  const { letras, linhas, soma, somem } = s
  const L = letras.length
  const linhasTxt = [...linhas.map((l) => ({ cel: celulasDe(l.coef, letras), c: fmtNum(l.c) })), ...(soma ? [{ cel: celulasDe(soma.coef, letras), c: fmtNum(soma.c) }] : [])]
  const largTermo = letras.map((_, j) => Math.max(...linhasTxt.map((r) => [...r.cel[j].termo].length + (r.cel[j].sinal ? 2 : 0)), 1))
  const largC = Math.max(...linhasTxt.map((r) => [...r.c].length))
  const chars = 2 + largTermo.reduce((t, n) => t + n + 1, 0) + 2 + largC + (s.temVezes ? 5 : 0)
  const nRows = linhas.length + 1
  const fs = Math.max(18, Math.min(44, (size.w - 28) / (0.6 * chars), (size.h - 24) / (nRows * 1.75)))
  const rowH = fs * 1.55
  // Columns: the + of the sum, then a term per letter (with its sign, right-aligned: y under 2y), the =, the number and the "× 2".
  const cols = `${fs * 1.2}px ${letras.map(() => 'auto').join(' ')} auto auto ${s.temVezes ? 'auto' : ''}`
  const colEq = 2 + L
  const ultima = linhas.length - 1
  const pulsa = { animate: { opacity: [0.55, 1, 0.55] }, transition: { duration: 1.6, repeat: Infinity } }

  const celula = (txt: string, j: number, riscado: boolean, linha: number, col: number, peso: number, atraso = 0) => (
    <span key={`${linha}:${col}`} className="relative grid place-items-center tabular-nums" style={{ gridRow: linha + 1, gridColumn: col, height: rowH, padding: `0 ${fs * 0.16}px 0 ${col > 2 && col < colEq ? fs * 0.22 : fs * 0.16}px`, justifySelf: 'stretch', justifyItems: col === colEq ? 'center' : 'end' }}>
      <motion.span key={txt} initial={{ opacity: 0 }} animate={{ opacity: riscado ? 0.4 : 1 }} transition={{ duration: 0.4, delay: riscado ? 0.35 : atraso }} style={{ color: j >= 0 ? CORES[j] : '#fff', fontWeight: peso }}>
        {txt}
      </motion.span>
      {riscado && txt && <motion.span className="absolute left-0 right-0 top-1/2 rounded-full" style={{ height: Math.max(2.5, fs * 0.09), background: rose, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35, delay: 0.1 + j * 0.15, ease }} />}
    </span>
  )

  const linha = (cel: { sinal: string; termo: string }[], c: string, i: number, eSoma: boolean) => {
    const out: React.ReactNode[] = []
    const peso = eSoma ? 700 : 600
    const atraso = eSoma ? 0.6 : 0
    cel.forEach((t, j) => {
      const riscado = !eSoma && somem.includes(j)
      out.push(celula(t.termo ? `${t.sinal ? `${t.sinal} ` : ''}${t.termo}` : '', t.termo === '0' ? -1 : j, riscado, i, 2 + j, peso, atraso))
    })
    out.push(celula('=', -1, false, i, colEq, 500, atraso))
    out.push(celula(c, -1, false, i, colEq + 1, peso, atraso))
    return out
  }

  return (
    <div className="flex h-full w-full items-center justify-center px-2" onClick={onSomar} style={{ cursor: onSomar ? 'pointer' : undefined }} role={onSomar ? 'button' : 'img'} aria-label={onSomar ? (proximo === 'multiplicar' ? 'multiplicar a equação' : 'somar as equações') : 'sistema de equações'}>
      <div className="grid items-center" style={{ gridTemplateColumns: cols, fontSize: fs, columnGap: 0 }}>
        {linhas.map((l, i) => (
          <Fragment key={i}>
            {linha(linhasTxt[i].cel, linhasTxt[i].c, i, false)}
            {s.temVezes && Math.abs(l.vezes - 1) > 1e-9 && (
              <motion.span
                className={cn('ml-3 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold tabular-nums', s.multiplicado ? 'border-white/15 bg-white/[0.06] text-white/55' : 'border-white/60 text-white')}
                style={{ gridRow: i + 1, gridColumn: colEq + 2, fontSize: fs * 0.62, ...(proximo === 'multiplicar' ? { borderColor: amber, borderStyle: 'dashed', color: amber } : {}) }}
                {...(proximo === 'multiplicar' ? pulsa : {})}
              >
                × {l.vezes < 0 ? `(${fmtNum(l.vezes)})` : fmtNum(l.vezes)}
              </motion.span>
            )}
          </Fragment>
        ))}
        {/* The + of the sum, at the left of the last equation. */}
        {(soma || proximo === 'somar') && (
          <motion.span
            className="grid place-items-center rounded-full font-semibold"
            style={{ gridRow: ultima + 1, gridColumn: 1, width: fs * 1.1, height: fs * 1.1, color: soma ? '#fff' : amber, border: proximo === 'somar' ? `2px dashed ${amber}` : undefined, fontSize: fs * 0.8 }}
            initial={{ opacity: 0 }}
            {...(proximo === 'somar' ? pulsa : { animate: { opacity: 1 } })}
          >
            +
          </motion.span>
        )}
        {soma && (
          <>
            <motion.span className="rounded-full bg-white/60" style={{ gridRow: linhas.length + 1, gridColumn: `1 / ${colEq + 2}`, height: 2, alignSelf: 'start', originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 0.4, ease }} />
            {linha(linhasTxt[linhas.length].cel, linhasTxt[linhas.length].c, linhas.length, true)}
          </>
        )}
      </div>
    </div>
  )
}

export function SistemaTroca({ t, size, onTrocar }: { t: Troca; size: { w: number; h: number }; onTrocar?: () => void }) {
  const maior = Math.max([...t.primeira].length, [...t.trocada].length + 1)
  const fs = Math.max(20, Math.min(36, (size.w - 36) / (0.6 * maior), size.h / 5))
  const caixa = (txt: string, layoutId?: string) => (
    <motion.span
      layoutId={layoutId}
      className="inline-block whitespace-nowrap rounded-xl px-1.5"
      style={{ border: `2px ${onTrocar ? 'dashed' : 'solid'} ${onTrocar ? amber : sky}`, background: 'rgba(125,211,252,0.10)' }}
      {...(onTrocar ? { animate: { opacity: [0.7, 1, 0.7] }, transition: { duration: 1.6, repeat: Infinity } } : { transition: { type: 'spring', stiffness: 80, damping: 16 } })}
    >
      {txt}
    </motion.span>
  )
  let primeiraLetra = true
  // The box's flight is namespaced: another stage on the page never takes it.
  const grupo = useId()
  return (
    <LayoutGroup id={grupo}>
      <div className="flex h-full w-full flex-col items-center justify-center px-2 tabular-nums" style={{ gap: fs * 0.9, fontSize: fs, cursor: onTrocar ? 'pointer' : undefined }} onClick={onTrocar} role={onTrocar ? 'button' : 'img'} aria-label={onTrocar ? `trocar ${t.letra} por ${t.valor}` : `${t.primeira}; ${t.trocado ? t.trocada : t.segunda.map((p) => p.t).join('')}`}>
        <p className="whitespace-nowrap font-semibold text-white">
          <span style={{ color: sky }}>{t.letra}</span>
          {' = '}
          {t.trocado ? (
            <span className="inline-block whitespace-nowrap rounded-xl border-2 border-dashed border-white/25 px-1.5 text-white/40">{t.valor}</span>
          ) : (
            caixa(t.valor, 'troca')
          )}
        </p>
        <p className="whitespace-nowrap font-semibold text-white">
          {t.segunda.map((p, i) => {
            if (!p.letra) return <span key={i}>{p.t.replace(/ /g, ' ')}</span>
            const id = primeiraLetra ? 'troca' : undefined
            primeiraLetra = false
            if (t.trocado) return <Fragment key={i}>{id ? caixa(`(${t.valor})`, id) : <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{caixa(`(${t.valor})`)}</motion.span>}</Fragment>
            return (
              <span key={i} className="inline-block px-0.5 leading-none" style={{ color: sky, borderBottom: `3px solid ${sky}`, paddingBottom: 2 }}>
                {p.t}
              </span>
            )
          })}
        </p>
      </div>
    </LayoutGroup>
  )
}
