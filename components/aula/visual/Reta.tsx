'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
}

const amber = '#f6b74e'
const rose = '#fb7185'
const fmt = (n: number) => n.toLocaleString('pt-BR')
const springX = { type: 'spring', stiffness: 320, damping: 30 } as const

function niceStep(span: number): number {
  const raw = span / 10
  const p = 10 ** Math.floor(Math.log10(raw || 1))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
}

export function Reta({ s, size, ...it }: { s: RetaState; size: { w: number; h: number } } & RetaInteract) {
  const de = s.de ?? 0
  const ate = s.ate ?? 10
  const passo = s.passo ?? niceStep(ate - de)
  const W = size.w
  const pad = 34
  const x = (v: number) => pad + ((v - de) / (ate - de || 1)) * (W - pad * 2)

  const staticTags = it.placed ? [] : [...(s.etiquetas ?? []), ...(s.fichas ?? []), ...(s.etiquetaSolta !== undefined ? [s.etiquetaSolta] : [])]
  const tray = it.loose ?? staticTags
  const legend = [...(s.comparacoes ?? []), ...(typeof s.comparacao === 'string' ? [s.comparacao] : []), ...(s.aproximacao ? [s.aproximacao] : [])]
  const H = Math.max(120, Math.min(220, size.h - (tray.length ? 76 : 0) - (legend.length ? 40 * legend.length : 0)))
  const y = H * 0.56

  const ticks: number[] = []
  const n = Math.round((ate - de) / passo)
  if (n <= 200) for (let i = 0; i <= n; i++) ticks.push(+(de + i * passo).toFixed(6))
  const labels = new Set(s.marcas?.length ? s.marcas : s.marcas ? [] : [de, ate])
  const offGrid = [...labels].filter((m) => !ticks.includes(m))
  const dense = ticks.length > 30
  const points = [
    ...(s.numeros ?? []),
    ...(s.exemplos ?? []),
    ...(s.numero !== undefined && it.dragValue === undefined ? [s.numero] : []),
    ...(s.exato !== undefined ? [s.exato] : []),
    ...(Array.isArray(s.comparacao) ? s.comparacao : []),
    ...(s.maior !== undefined ? [s.maior] : []),
  ].filter((v, i, a) => a.indexOf(v) === i)
  const from = s.numeros ?? s.exemplos ?? []
  const arcs = (it.arcs ?? (s.vizinhos && from.length === s.vizinhos.length ? from.map((f, i) => ({ from: f, to: s.vizinhos![i] })) : [])).filter((a) => a.from !== a.to)
  // With arrows above the line, the numbers of the points go below it.
  const pointLabelY = arcs.length ? y + 32 : y - 18
  const interactive = Boolean(it.onPick || it.onDrag)

  const valueAt = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = de + ((e.clientX - r.left - pad) / (W - pad * 2)) * (ate - de)
    let snapped = Math.round(v / passo) * passo
    if (it.dragRange) snapped = Math.min(it.dragRange[1], Math.max(it.dragRange[0], snapped))
    return Math.min(ate, Math.max(de, +snapped.toFixed(6)))
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
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
        {ticks.map((t) => {
          const big = labels.has(t)
          return <line key={t} x1={x(t)} x2={x(t)} y1={y - (big ? 10 : dense ? 4 : 7)} y2={y + (big ? 10 : dense ? 4 : 7)} stroke={big ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={big ? 2 : 1} />
        })}
        {offGrid.map((t) => (
          <line key={`o${t}`} x1={x(t)} x2={x(t)} y1={y - 10} y2={y + 10} stroke="#fff" strokeWidth={2} />
        ))}
        {[...labels].map((t) => (
          <motion.text key={`l${t}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={x(t)} y={y + 32} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={15} fontWeight={500} className="tabular-nums">
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
          return (
            <motion.path
              key={`a${i}-${a.from}-${a.to}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              d={`M ${x1} ${y - 12} Q ${(x1 + x2) / 2} ${y - 12 - lift} ${x2} ${y - 12}`}
              fill="none"
              stroke={amber}
              strokeWidth={1.75}
              strokeLinecap="round"
              markerEnd="url(#reta-arrow)"
            />
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
        {points.map((v) => (
          <g key={`p${v}`}>
            <motion.circle initial={{ r: 0 }} animate={{ r: 7 }} transition={springX} cx={x(v)} cy={y} fill={amber} />
            {!labels.has(v) && (
              <text x={x(v)} y={pointLabelY} textAnchor="middle" fill={amber} fontSize={16} fontWeight={600} className="tabular-nums">
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
      {legend.length > 0 && (
        <div className="flex flex-col items-center gap-1 pt-1">
          {legend.map((l, i) => (
            <motion.p key={l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.35 }} className="text-[24px] font-semibold tabular-nums text-white">
              {l}
            </motion.p>
          ))}
        </div>
      )}
    </div>
  )
}
