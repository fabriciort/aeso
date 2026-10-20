'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { alturaDoArco, arcoEspelho, comparacaoEspelho, espelhar, faixaDe, intersecao, lerCondicao, pedacosDe, pontasDe, raizesDasRegioes, regioesDe, solucaoDe, testar, textoEspelho, type IntervaloEntrada, type Pedaco, type Ponta, type RegiaoEntrada } from './reta-intervalos'

// Reta numérica: marcas a cada passo, números nas marcas pedidas, pontos e
// etiquetas que deslizam até o lugar. Também é controle: tocar uma marca,
// levar uma etiqueta ao lugar, deslizar um ponto.

export interface RetaState {
  de?: number
  ate?: number
  passo?: number
  marcas?: number[]
  marcaSemRotulo?: number
  numero?: number
  numeros?: number[]
  exemplos?: number[]
  vizinhos?: number[]
  /** Saltos (contas de cabeça): [de, para, rótulo], ex.: [38, 40, '+2']. */
  saltos?: [number, number, string?][]
  etiquetas?: number[]
  etiquetaSolta?: number
  fichas?: number[]
  escolhas?: number[]
  meio?: number
  maior?: number
  exato?: number
  aproximado?: number
  destaqueIntervalos?: boolean
  comparacoes?: string[]
  comparacao?: string | number[]
  aproximacao?: string
  unidade?: string
  /** Frações: os números aparecem como k/d (o 1, o 2… continuam inteiros). Ex.: 4 mostra 3/4. */
  fracoes?: number
  /** Negativos: o lado esquerdo do zero em azul, o direito em âmbar, e o zero mais forte. */
  sinais?: boolean
  /** Distância até o zero: um colchete embaixo, do zero até cada número, com o rótulo ("3 passos"). */
  distancias?: [number, string?][]
  /** Inequações (AF.U5): faixas grossas com bolinha vazia ou cheia e a seta. 'x > 3', { de: 2, ate: 5, inclui: [false, true] }. */
  intervalos?: IntervaloEntrada[]
  /** Com dois intervalos: o que serve aos dois, em verde, na própria reta. */
  sobreposicao?: boolean
  /** O sinal em cada pedaço (2º grau): [{ ate: 2, sinal: '+' }, { de: 2, ate: 5, sinal: '−', serve: true }, { de: 5, sinal: '+' }]. */
  regioes?: RegiaoEntrada[]
  /** A condição dos testes ('x > 3', '2x + 3 < 11', '(x − 2)(x − 5) < 0'). */
  condicao?: string
  /** Números já testados na condição: ✓ verde ou ✗ rosa. */
  testados?: number[]
  /** O teste cuja conta aparece embaixo (padrão: o último de `testados`). */
  testado?: number
  /** A faixa do que serve à condição. */
  solucao?: boolean
  /** Multiplicar por −1: os `numeros` e os `intervalos` vão para o outro lado do zero. */
  espelhado?: boolean
  /** A letra das frases (padrão x). */
  letra?: string
}

export interface RetaInteract {
  /** Etiquetas the student placed: label → position. */
  placed?: Record<number, number>
  /** Etiquetas still in the tray, and the one selected to place. */
  loose?: number[]
  selectedTag?: number | null
  onTag?: (label: number) => void
  /** A tap (or drag) on the line, snapped to the step. */
  onPick?: (v: number) => void
  /** A draggable point (deslizar), its range and release. */
  dragValue?: number
  dragRange?: [number, number]
  onDrag?: (v: number) => void
  onRelease?: () => void
  /** Escolha the student tapped. */
  selected?: number | null
  /** Curved arrows from a number to where it goes (arredondar). */
  arcs?: { from: number; to: number }[]
  wrong?: boolean
  /** Mexa "espelhar": the "× (−1)" button (a tap on the line also mirrors). */
  onEspelhar?: () => void
  /** A small line under everything ("2 de 4 números"). */
  contador?: string
}

const amber = '#f6b74e'
const rose = '#fb7185'
const sky = '#7dd3fc'
const green = '#6fd3a8'
const bg = '#05060a'
const COR: Record<string, string> = { ambar: amber, 'âmbar': amber, azul: sky, verde: green, rosa: rose, erro: rose }
const corDoSinal = (s: '+' | '−') => (s === '+' ? amber : sky)
// The minus is the true sign (−3), not a hyphen.
const fmtNum = (n: number) => (Object.is(n, -0) ? 0 : n).toLocaleString('pt-BR').replace(/^-/, '−')
const fmtFrac = (d: number) => (n: number) => {
  const k = Math.round(n * d)
  return k % d === 0 ? fmtNum(k / d) : `${fmtNum(k)}/${d}`
}
const springX = { type: 'spring', stiffness: 320, damping: 30 } as const

function niceStep(span: number): number {
  const raw = span / 10
  const p = 10 ** Math.floor(Math.log10(raw || 1))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
}

export function Reta({ s, size, ...it }: { s: RetaState; size: { w: number; h: number } } & RetaInteract) {
  const fmt = s.fracoes ? fmtFrac(s.fracoes) : fmtNum
  const de = s.de ?? 0
  const ate = s.ate ?? 10
  const passo = s.passo ?? niceStep(ate - de)
  const W = size.w
  const pad = 34
  const x = (v: number) => pad + ((v - de) / (ate - de || 1)) * (W - pad * 2)

  const staticTags = it.placed ? [] : [...(s.etiquetas ?? []), ...(s.fichas ?? []), ...(s.etiquetaSolta !== undefined ? [s.etiquetaSolta] : [])]
  const tray = it.loose ?? staticTags
  const legend = [...(s.comparacoes ?? []), ...(typeof s.comparacao === 'string' ? [s.comparacao] : []), ...(s.aproximacao ? [s.aproximacao] : [])]

  // Inequações (AF.U5): the pieces of the line, the signs of a product, the tests, the mirror.
  const letra = s.letra ?? 'x'
  const cond = lerCondicao(s.condicao)
  const espelhoModo = s.espelhado !== undefined || Boolean(it.onEspelhar)
  const esp = s.espelhado === true
  const rows: { P: Pedaco[]; P0: Pedaco[]; cor: string; rotulo?: string }[] = (s.intervalos ?? []).slice(0, 3).map((en, i) => {
    const P0 = pedacosDe(en)
    const o = typeof en === 'object' && en ? en : {}
    return { P: esp ? espelhar(P0) : P0, P0, cor: COR[o.cor ?? ''] ?? [amber, sky, green][i], rotulo: o.rotulo }
  })
  if (s.solucao && cond) {
    const P0 = solucaoDe(cond)
    rows.push({ P: esp ? espelhar(P0) : P0, P0, cor: amber })
  }
  const sobre = s.sobreposicao && rows.length >= 2 ? intersecao(rows[0].P, rows[1].P) : null
  const regs = regioesDe(s.regioes, de, ate)
  const raizes = raizesDasRegioes(regs)
  const testes = cond ? [...new Set(s.testados ?? [])].map((v) => testar(cond, v)) : []
  const ultimo = s.testado ?? s.testados?.[s.testados.length - 1]
  const contaT = cond && ultimo !== undefined ? testar(cond, ultimo) : null
  const espNums = espelhoModo ? (s.numeros ?? []) : []
  const fraseEsp: { partes: string[]; rel: number } | null = (() => {
    if (!espelhoModo || typeof s.comparacao === 'string') return null
    if (espNums.length === 2) {
      const c = comparacaoEspelho(espNums[0], espNums[1], esp)
      return { partes: [c.esquerda, c.rel, c.direita], rel: 1 }
    }
    if (rows.length === 1 && !espNums.length) {
      const partes = textoEspelho(rows[0].P0, letra, esp).split(/ ([<>≤≥]) /)
      return { partes, rel: 1 }
    }
    return null
  })()
  const temBotao = Boolean(it.onEspelhar) && !esp
  // The mirror keeps the button's room even after the tap, so the line does not jump while the points fly.
  const reservaBotao = espelhoModo && (Boolean(it.onEspelhar) || s.espelhado !== undefined)
  // With a condition, the room for the sum and the counter is kept from the first tap to the end (the line does not jump).
  const extraH = (cond ? 82 + 22 : 0) + (fraseEsp ? 44 : 0) + (!cond && it.contador ? 22 : 0)
  const H = Math.max(120, Math.min(220, size.h - (tray.length || reservaBotao ? 76 : 0) - (legend.length ? 40 * legend.length : 0) - extraH))
  const y = H * 0.56

  const ticks: number[] = []
  const n = Math.round((ate - de) / passo)
  if (n <= 200) for (let i = 0; i <= n; i++) ticks.push(+(de + i * passo).toFixed(6))
  const labels = new Set(s.marcas?.length ? s.marcas : s.marcas ? [] : [de, ate])
  // The ends of the pieces, the roots, the tested numbers and the mirrored ones are written under the line.
  const noTrecho = (v: number) => v >= de - 1e-9 && v <= ate + 1e-9
  for (const v of [...rows.flatMap((r) => pontasDe(r.P)), ...pontasDe(sobre ?? []), ...raizes, ...testes.map((t) => t.x), ...espNums.flatMap((v) => [v, -v])]) if (noTrecho(v)) labels.add(+v.toFixed(6))
  const corLabel = new Map<number, string>()
  for (const v of espNums) corLabel.set(esp ? -v : v, s.sinais && (esp ? -v : v) < 0 ? sky : amber)
  for (const t of testes) corLabel.set(t.x, t.serve ? green : rose)
  const offGrid = [...labels].filter((m) => !ticks.includes(m))
  const dense = ticks.length > 30
  const points = [
    ...(espelhoModo ? [] : (s.numeros ?? [])),
    ...(s.exemplos ?? []),
    ...(s.numero !== undefined && it.dragValue === undefined ? [s.numero] : []),
    ...(s.exato !== undefined ? [s.exato] : []),
    ...(Array.isArray(s.comparacao) ? s.comparacao : []),
    ...(s.maior !== undefined ? [s.maior] : []),
    ...(s.saltos ?? []).flatMap(([f, t]) => [f, t]),
  ].filter((v, i, a) => a.indexOf(v) === i)
  const from = s.numeros ?? s.exemplos ?? []
  const arcs: { from: number; to: number; label?: string }[] = (
    it.arcs ?? (s.saltos ? s.saltos.map(([f, t, label]) => ({ from: f, to: t, label })) : s.vizinhos && from.length === s.vizinhos.length ? from.map((f, i) => ({ from: f, to: s.vizinhos![i] })) : [])
  ).filter((a) => a.from !== a.to)
  // With arrows above the line, the numbers of the points go below it.
  const pointLabelY = arcs.length ? y + 32 : y - 18
  // Labels on the same row never overlap: neighbours closer than their width
  // are pushed apart a little (38 next to 40, 60 next to 63).
  const lx = spread([...labels, ...(arcs.length ? points.filter((v) => !labels.has(v)) : [])], x, fmt)
  const interactive = Boolean(it.onPick || it.onDrag || it.onEspelhar)
  // Rows: one piece goes on the line itself; two or more go a little above it, side by side, and what serves both goes on the line.
  const rowY = (i: number) => (rows.length >= 2 ? y - 22 - i * 30 : y)
  const pontasNaReta = new Set([...(rows.length === 1 ? pontasDe(rows[0].P) : []), ...pontasDe(sobre ?? [])].filter(noTrecho))
  const maxLift = Math.max(24, Math.min(70, y - 24))
  // The mirror's arcs: each number (and each end of a piece) to its opposite.
  const espArcs = esp ? [...espNums, ...rows.flatMap((r) => pontasDe(r.P0))].filter((v, i, a) => v !== 0 && a.indexOf(v) === i && noTrecho(v) && noTrecho(-v)) : []

  const valueAt = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = de + ((e.clientX - r.left - pad) / (W - pad * 2)) * (ate - de)
    let snapped = Math.round(v / passo) * passo
    if (it.dragRange) snapped = Math.min(it.dragRange[1], Math.max(it.dragRange[0], snapped))
    return Math.min(ate, Math.max(de, +snapped.toFixed(6)))
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {reservaBotao && !tray.length && (
        <div className="flex min-h-[64px] items-center justify-center pb-3">
          {temBotao && <motion.button type="button" onClick={() => it.onEspelhar?.()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-dashed border-[#f6b74e] bg-[#f6b74e]/10 px-5 py-2 text-[22px] font-semibold tabular-nums text-[#f6b74e]">
            × (−1)
          </motion.button>}
        </div>
      )}
      {tray.length > 0 && (
        <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-3 pb-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {tray.map((t, i) => {
              const sel = it.selectedTag === t
              return (
                <motion.button
                  key={`${t}-${i}`}
                  layout
                  type="button"
                  disabled={!it.onTag}
                  onClick={() => it.onTag?.(t)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: sel ? -4 : 0 }}
                  exit={{ opacity: 0, y: 30, scale: 0.8 }}
                  transition={springX}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-[20px] font-semibold tabular-nums transition-colors disabled:pointer-events-none',
                    sel ? 'border-[#f6b74e] bg-[#f6b74e] text-black' : 'border-white/20 bg-white/[0.06] text-white',
                  )}
                >
                  {fmt(t)}
                  {s.unidade && <span className="ml-1 text-[14px] font-medium opacity-70">{s.unidade}</span>}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}
      <motion.svg
        width={W}
        height={H}
        className={cn('touch-none select-none', interactive && 'cursor-pointer')}
        animate={it.wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        onPointerDown={(e) => {
          if (!interactive) return
          if (it.onEspelhar) return it.onEspelhar()
          e.currentTarget.setPointerCapture(e.pointerId)
          const v = valueAt(e)
          if (it.onDrag) it.onDrag(v)
          else it.onPick?.(v)
        }}
        onPointerMove={(e) => {
          if (it.onDrag && e.buttons) it.onDrag(valueAt(e))
        }}
        onPointerUp={() => it.onRelease?.()}
        role="img"
        aria-label={`Reta numérica de ${fmt(de)} a ${fmt(ate)}`}
      >
        {s.destaqueIntervalos &&
          ticks.slice(0, -1).map((t, i) => (
            <motion.rect
              key={`i${t}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.25 }}
              x={x(t) + 2}
              y={y - 5}
              width={x(t + passo) - x(t) - 4}
              height={10}
              rx={5}
              fill={i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(246,183,78,0.45)'}
            />
          ))}
        <line x1={pad - 12} x2={W - pad + 22} y1={y} y2={y} stroke="rgba(255,255,255,0.75)" strokeWidth={2} strokeLinecap="round" />
        <path d={`M ${W - pad + 18} ${y - 5} L ${W - pad + 25} ${y} L ${W - pad + 18} ${y + 5}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {s.sinais && de < 0 && ate > 0 && (
          <>
            <line x1={pad - 12} x2={x(0)} y1={y} y2={y} stroke={sky} strokeWidth={3} strokeLinecap="round" />
            <line x1={x(0)} x2={W - pad + 18} y1={y} y2={y} stroke={amber} strokeWidth={3} strokeLinecap="round" />
            <line x1={x(0)} x2={x(0)} y1={y - 15} y2={y + 15} stroke="#fff" strokeWidth={2.5} />
          </>
        )}
        {(s.distancias ?? []).map(([v, rot], i) => {
          const yb = y + 44 + i * 34
          return (
            <motion.g key={`d${v}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.4 }}>
              <path d={`M ${x(0)} ${yb - 6} L ${x(0)} ${yb} L ${x(v)} ${yb} L ${x(v)} ${yb - 6}`} fill="none" stroke={v < 0 ? sky : amber} strokeWidth={1.75} strokeLinejoin="round" />
              {rot && (
                <text x={(x(0) + x(v)) / 2} y={yb + 16} textAnchor="middle" fill={v < 0 ? sky : amber} fontSize={14} fontWeight={600}>
                  {rot}
                </text>
              )}
            </motion.g>
          )
        })}
        {ticks.map((t) => {
          const big = labels.has(t)
          return <line key={t} x1={x(t)} x2={x(t)} y1={y - (big ? 10 : dense ? 4 : 7)} y2={y + (big ? 10 : dense ? 4 : 7)} stroke={big ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={big ? 2 : 1} />
        })}
        {offGrid.map((t) => (
          <line key={`o${t}`} x1={x(t)} x2={x(t)} y1={y - 10} y2={y + 10} stroke="#fff" strokeWidth={2} />
        ))}
        {regs.map((r, i) =>
          r.serve ? <g key={`rs${i}-${r.p.a}-${r.p.b}`}>{faixas([r.p], corDoSinal(r.sinal), y, 8, `rs${i}`, de, ate, x, W, pad)}</g> : null,
        )}
        {raizes.map((r) => (
          <line key={`rz${r}`} x1={x(r)} x2={x(r)} y1={y - 14} y2={y + 14} stroke="#fff" strokeWidth={2.5} />
        ))}
        {regs.map((r, i) => (
          <motion.text key={`sg${i}-${r.meio}-${r.sinal}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.3 }} x={x(r.meio)} y={y - 24} textAnchor="middle" fill={corDoSinal(r.sinal)} fontSize={34} fontWeight={700}>
            {r.sinal}
          </motion.text>
        ))}
        {/* No exit animation: an old band leaves at once (a fading one could stay stuck between cards). */}
        <g>
          {rows.map((r, i) => (
            <motion.g key={`row${i}-${esp}-${r.P.map((p) => `${p.a},${p.b},${p.ia},${p.ib}`).join(';')}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: espelhoModo && esp ? 0.75 : 0.1 + i * 0.25, duration: 0.35 }}>
              {faixas(r.P, r.cor, rowY(i), rows.length >= 2 ? 6 : 8, `r${i}`, de, ate, x, W, pad)}
              {r.rotulo && (() => {
                const vis = r.P.map((p) => faixaDe(p, de, ate)).filter((f) => f !== null)
                if (!vis.length) return null
                // Beside the free end of a ray (left of x ≥ −1, right of x < 3); otherwise above the band.
                const w = r.rotulo.length * 8 + 6
                const f = vis.length === 1 ? vis[0] : null
                const yy = rowY(i)
                const props = { fill: r.cor, fontSize: 15, fontWeight: 600, className: 'tabular-nums' }
                if (f && f.dir === 'seta' && f.esq !== 'seta' && x(f.v1) - 14 - w >= 4) return <text x={x(f.v1) - 14} y={yy + 5} textAnchor="end" {...props}>{r.rotulo}</text>
                if (f && f.esq === 'seta' && f.dir !== 'seta' && x(f.v2) + 14 + w <= W - 4) return <text x={x(f.v2) + 14} y={yy + 5} textAnchor="start" {...props}>{r.rotulo}</text>
                const cx = Math.min(W - pad - w / 2, Math.max(pad + w / 2, (x(vis[0].v1) + x(vis[vis.length - 1].v2)) / 2))
                return <text x={cx} y={yy - 12} textAnchor="middle" {...props}>{r.rotulo}</text>
              })()}
            </motion.g>
          ))}
          {sobre && (
            <motion.g key={`sobre-${sobre.map((p) => `${p.a},${p.b},${p.ia},${p.ib}`).join(';')}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + rows.length * 0.25, duration: 0.4 }}>
              {faixas(sobre, green, y, 8, 'sobre', de, ate, x, W, pad)}
            </motion.g>
          )}
        </g>
        {espArcs.map((v) => {
          const x1 = x(v)
          const x2 = x(-v)
          const lift = alturaDoArco(x2 - x1, W - pad * 2, maxLift)
          return (
            <motion.path
              key={`ea${v}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              d={`M ${x1} ${y - 10} Q ${(x1 + x2) / 2} ${y - 10 - 2 * lift} ${x2} ${y - 10}`}
              fill="none"
              stroke={amber}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              markerEnd="url(#reta-arrow)"
            />
          )
        })}
        {[...labels].map((t) => (
          <motion.text key={`l${t}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={lx.get(t) ?? x(t)} y={y + 32} textAnchor="middle" fill={corLabel.get(t) ?? 'rgba(255,255,255,0.85)'} fontSize={15} fontWeight={corLabel.has(t) ? 700 : 500} className="tabular-nums">
            {fmt(t)}
          </motion.text>
        ))}
        {s.marcaSemRotulo !== undefined && (
          <>
            <line x1={x(s.marcaSemRotulo)} x2={x(s.marcaSemRotulo)} y1={y - 10} y2={y + 10} stroke="#fff" strokeWidth={2} />
            <text x={x(s.marcaSemRotulo)} y={y + 32} textAnchor="middle" fill={amber} fontSize={16} fontWeight={600}>
              ?
            </text>
          </>
        )}
        {s.meio !== undefined && <line x1={x(s.meio)} x2={x(s.meio)} y1={y - 30} y2={y + 14} stroke="rgba(255,255,255,0.5)" strokeDasharray="3 4" strokeWidth={1.5} />}
        {arcs.map((a, i) => {
          const x1 = x(a.from)
          const x2 = x(a.to)
          const lift = Math.min(46, Math.abs(x2 - x1) * 0.45 + 12)
          // Saltos go one after the other, like a finger hopping on the line.
          const delay = s.saltos ? i * 0.45 : 0
          // A jump and its way back (84 → 55, 55 → 84): the way back goes under the numbers.
          const under = a.to < a.from && arcs.some((b) => b.from === a.to && b.to === a.from)
          return (
            <g key={`a${i}-${a.from}-${a.to}`}>
            {a.label && (
              <motion.text initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + 0.35 }} x={(x1 + x2) / 2} y={under ? y + 58 + lift * 0.55 : y - 18 - lift * 0.55} textAnchor="middle" fill={amber} fontSize={15} fontWeight={600} className="tabular-nums">
                {a.label}
              </motion.text>
            )}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
              d={under ? `M ${x1} ${y + 40} Q ${(x1 + x2) / 2} ${y + 40 + lift} ${x2} ${y + 40}` : `M ${x1} ${y - 12} Q ${(x1 + x2) / 2} ${y - 12 - lift} ${x2} ${y - 12}`}
              fill="none"
              stroke={amber}
              strokeWidth={1.75}
              strokeLinecap="round"
              markerEnd="url(#reta-arrow)"
            />
            </g>
          )
        })}
        <defs>
          <marker id="reta-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke={amber} strokeWidth={1.6} strokeLinecap="round" />
          </marker>
        </defs>
        {s.aproximado !== undefined && <circle cx={x(s.aproximado)} cy={y} r={11} fill="none" stroke="#fff" strokeWidth={1.5} />}
        {(s.escolhas ?? []).map((v) => {
          const on = it.selected === v
          return <motion.circle key={`e${v}`} cx={x(v)} cy={y} initial={false} animate={{ r: on ? 13 : 11 }} fill={on ? (it.wrong ? rose : amber) : 'rgba(5,6,10,0.9)'} stroke={on ? (it.wrong ? rose : amber) : 'rgba(255,255,255,0.7)'} strokeWidth={1.75} />
        })}
        {espNums.map((v, i) => (
          <PontoEspelho key={`pe${i}`} xa={x(v)} xb={x(-v)} y={y} esp={esp} lift={alturaDoArco(x(-v) - x(v), W - pad * 2, maxLift)} cor={s.sinais && (esp ? -v : v) < 0 ? sky : amber} />
        ))}
        {testes.map((t) => (
          <motion.g key={`t${t.x}`} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={springX} style={{ transformOrigin: `${x(t.x)}px ${y}px` }}>
            {/* On an end of the piece, the empty or full dot says it already. */}
            {!pontasNaReta.has(t.x) && <circle cx={x(t.x)} cy={y} r={6.5} fill={t.serve ? green : rose} stroke={bg} strokeWidth={1.5} />}
            <text x={x(t.x)} y={y - 16} textAnchor="middle" fill={t.serve ? green : rose} fontSize={18} fontWeight={700}>
              {t.serve ? '✓' : '✗'}
            </text>
          </motion.g>
        ))}
        {points.map((v) => (
          <g key={`p${v}`}>
            <motion.circle initial={{ r: 0 }} animate={{ r: 7 }} transition={springX} cx={x(v)} cy={y} fill={s.sinais && v < 0 ? sky : amber} />
            {!labels.has(v) && (
              <text x={(arcs.length && lx.get(v)) || x(v)} y={pointLabelY} textAnchor="middle" fill={s.sinais && v < 0 ? sky : amber} fontSize={16} fontWeight={600} className="tabular-nums">
                {fmt(v)}
              </text>
            )}
          </g>
        ))}
        {it.dragValue !== undefined && (
          <>
            <motion.circle initial={false} animate={{ cx: x(it.dragValue) }} transition={{ type: 'spring', stiffness: 600, damping: 38 }} cy={y} r={14} fill={amber} />
            <motion.text initial={false} animate={{ x: x(it.dragValue) }} transition={{ type: 'spring', stiffness: 600, damping: 38 }} y={y - 50} textAnchor="middle" fill={amber} fontSize={19} fontWeight={600} className="tabular-nums">
              {fmt(it.dragValue)}
            </motion.text>
          </>
        )}
        {Object.entries(it.placed ?? {}).map(([label, pos]) => {
          const ok = Number(label) === pos
          return (
            <motion.g key={`tag${label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.g initial={{ x: x(pos), y: -24 }} animate={{ x: x(pos), y: 0 }} transition={springX}>
                <line x1={0} x2={0} y1={y - 22} y2={y} stroke={ok ? 'rgba(255,255,255,0.8)' : rose} strokeWidth={1.5} />
                <rect x={-24} y={y - 50} width={48} height={28} rx={9} fill={ok ? '#fff' : 'rgba(251,113,133,0.15)'} stroke={ok ? 'none' : rose} />
                <text x={0} y={y - 30} textAnchor="middle" fontSize={15} fontWeight={600} fill={ok ? '#05060a' : '#fecdd3'} className="tabular-nums">
                  {fmt(Number(label))}
                </text>
              </motion.g>
            </motion.g>
          )
        })}
      </motion.svg>
      {fraseEsp && (
        <p className="flex items-baseline gap-[0.35em] whitespace-nowrap pt-1 text-[26px] font-semibold tabular-nums text-white">
          {fraseEsp.partes.map((t, i) =>
            i % 2 === 1 ? (
              <motion.span key={`${i}${t}${esp}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: esp ? 1.25 : 1 }} transition={{ delay: esp ? 0.8 : 0, type: 'spring', stiffness: 300, damping: 18 }} style={{ color: esp ? amber : undefined, display: 'inline-block' }}>
                {t}
              </motion.span>
            ) : (
              <motion.span key={`${i}${t}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: esp ? 0.6 : 0 }}>
                {t}
              </motion.span>
            ),
          )}
        </p>
      )}
      {cond && (
        <div className="flex min-h-[82px] flex-col items-center justify-start gap-0.5 px-3 pt-1 text-center">
          {contaT?.conta && (
            <motion.p key={`cc${contaT.x}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[17px] leading-snug tabular-nums text-white/70">
              {contaT.conta}
            </motion.p>
          )}
          {contaT && (
            <motion.p key={`cv${contaT.x}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[23px] font-semibold leading-snug tabular-nums" style={{ color: contaT.serve ? green : rose }}>
              {contaT.comparacao} {contaT.serve ? '✓' : '✗'}
            </motion.p>
          )}
          {contaT?.empate && (
            <motion.p key={`ce${contaT.x}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-[15px] leading-snug text-rose-200">
              {contaT.empate}
            </motion.p>
          )}
        </div>
      )}
      {legend.length > 0 && (
        <div className="flex flex-col items-center gap-1 pt-1">
          {legend.map((l, i) => (
            <motion.p key={l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.35 }} className="text-[24px] font-semibold tabular-nums text-white">
              {l}
            </motion.p>
          ))}
        </div>
      )}
      {(it.contador || cond) && <p className="min-h-[22px] pt-1 text-[14px] text-white/50">{it.contador}</p>}
    </div>
  )
}

/** The thick band of each piece, with the empty or full dot at each end, or the arrow where it goes on without end. */
function faixas(P: Pedaco[], cor: string, yy: number, grossa: number, key: string, de: number, ate: number, x: (v: number) => number, W: number, pad: number) {
  const ponta = (tipo: Ponta, px: number, lado: -1 | 1, k: string) =>
    tipo === 'seta' ? (
      <path key={k} d={`M ${px} ${yy - 7.5} L ${px + lado * 12} ${yy} L ${px} ${yy + 7.5} Z`} fill={cor} />
    ) : tipo === 'cheia' ? (
      <circle key={k} cx={px} cy={yy} r={7.5} fill={cor} />
    ) : (
      <circle key={k} cx={px} cy={yy} r={6.75} fill={bg} stroke={cor} strokeWidth={2.75} />
    )
  return P.map((p, j) => {
    const f = faixaDe(p, de, ate)
    if (!f) return null
    const xa = f.esq === 'seta' ? pad - 14 : x(f.v1)
    const xb = f.dir === 'seta' ? W - pad + 14 : x(f.v2)
    return (
      <g key={`${key}-${j}`}>
        <line x1={xa} x2={xb} y1={yy} y2={yy} stroke={cor} strokeWidth={grossa} />
        {ponta(f.esq, xa, -1, 'a')}
        {ponta(f.dir, xb, 1, 'b')}
      </g>
    )
  })
}

/** A point of the mirror: when it is multiplied by −1, it travels along an arc to the other side of zero. */
function PontoEspelho({ xa, xb, y, esp, lift, cor }: { xa: number; xb: number; y: number; esp: boolean; lift: number; cor: string }) {
  const antes = useRef(esp)
  const voo = useRef<{ esp: boolean; cx: number[]; cy: number[] } | null>(null)
  if (antes.current !== esp) {
    const arco = esp ? arcoEspelho(xa, xb, y, lift * 1.1) : arcoEspelho(xb, xa, y, lift * 1.1)
    voo.current = { esp, cx: arco.map((p) => p[0]), cy: arco.map((p) => p[1]) }
  }
  useEffect(() => {
    antes.current = esp
  }, [esp])
  const alvo = esp ? xb : xa
  // A flight only counts while it ends where the point is now (the stage may have changed size).
  const v = voo.current?.esp === esp && Math.abs(voo.current.cx[voo.current.cx.length - 1] - alvo) < 0.5 ? voo.current : null
  return <motion.circle initial={false} animate={v ? { cx: v.cx, cy: v.cy } : { cx: alvo, cy: y }} transition={{ duration: 0.9, ease: 'easeInOut' }} r={7.5} fill={cor} />
}

/** Label centres for one row of numbers, nudged apart so none overlap. */
function spread(values: number[], x: (v: number) => number, fmt: (v: number) => string): Map<number, number> {
  const items = [...new Set(values)].map((v) => ({ v, c: x(v), w: fmt(v).length * 9 + 6 })).sort((a, b) => a.c - b.c)
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1]
      const b = items[i]
      const overlap = (a.w + b.w) / 2 - (b.c - a.c)
      if (overlap > 0) {
        a.c -= overlap / 2
        b.c += overlap / 2
      }
    }
  }
  return new Map(items.map((it) => [it.v, it.c]))
}
