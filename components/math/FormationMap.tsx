'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ancestors, descendants, getModule, getUnit, layoutModule, partOf, unitStatus, type Module } from '@/lib/math/curriculum'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'

// The prerequisite tree of one módulo. Prerequisites are always above the
// units that need them; only the essential edges are drawn (an edge implied
// by another path is left out), so the tree stays readable on a phone.
// Selecting a unit lights its whole chain of prerequisites in the unit's
// color and the units it opens below it, dashed.

const ROW = 136
const NODE = 54
/** Room for the two-line name under each node. */
const LABEL = 36
/** Room above the first row for "vem de…" tags. */
const PAD = 30

export function FormationMap({
  module,
  done,
  selected,
  onSelect,
}: {
  module: Module
  done: Set<string>
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { nodes, layers, edges } = useMemo(() => layoutModule(module), [module])
  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>()
    // Keep columns from spreading too far apart on wide screens.
    const span = Math.min(width, 640)
    const left = (width - span) / 2
    for (const n of nodes) m.set(n.id, { x: left + n.x * span, y: n.layer * ROW + NODE / 2 + PAD })
    return m
  }, [nodes, width])
  const span = Math.min(width, 640)
  const left = (width - span) / 2
  const top = (l: number) => l * ROW + PAD
  const bottom = (l: number) => top(l) + NODE + LABEL

  /** An edge leaves under the prerequisite's name, runs down its lane and enters the unit from above. */
  const pathOf = (pts: { x: number; layer: number }[]) => {
    const X = (x: number) => left + x * span
    let d = `M${X(pts[0].x)},${bottom(pts[0].layer) + 2}`
    for (let i = 1; i < pts.length; i++) {
      const y1 = i === 1 ? bottom(pts[0].layer) + 2 : bottom(pts[i - 1].layer)
      const y2 = i === pts.length - 1 ? top(pts[i].layer) - 4 : top(pts[i].layer)
      const k = (y2 - y1) * 0.6
      d += ` C${X(pts[i - 1].x)},${y1 + k} ${X(pts[i].x)},${y2 - k} ${X(pts[i].x)},${y2}`
      if (i < pts.length - 1) d += ` L${X(pts[i].x)},${bottom(pts[i].layer)}`
    }
    return d
  }

  const up = useMemo(() => (selected ? ancestors(selected) : new Set<string>()), [selected])
  const down = useMemo(() => (selected ? descendants(selected) : new Set<string>()), [selected])
  const color = (id: string) => partOf(getUnit(id)!)?.color ?? module.color
  const height = layers * ROW + PAD

  const edgeState = (a: string, b: string): 'chain' | 'opens' | 'idle' | 'dim' => {
    if (!selected) return 'idle'
    if ((up.has(a) || a === selected) && (up.has(b) || b === selected)) return 'chain'
    if ((a === selected || down.has(a)) && down.has(b)) return 'opens'
    return 'dim'
  }

  return (
    <div ref={wrap} className="relative w-full" style={{ height }} onClick={() => onSelect(null)}>
      {width > 0 && (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {edges.map((e) => {
              const s = edgeState(e.from, e.to)
              const stroke = s === 'chain' ? color(selected!) : s === 'opens' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.16)'
              return (
                <motion.path
                  key={`${e.from}-${e.to}`}
                  d={pathOf(e.points)}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: s === 'dim' ? 0.35 : 1,
                    stroke,
                    strokeWidth: s === 'chain' ? 2.4 : 1.4,
                  }}
                  transition={{ pathLength: { duration: 0.8, delay: 0.15 + e.points[0].layer * 0.05, ease: [0.22, 1, 0.36, 1] }, default: { duration: 0.35 } }}
                  strokeDasharray={s === 'opens' ? '4 5' : undefined}
                />
              )
            })}
          </svg>

          {nodes.map((n) => {
            const u = getUnit(n.id)!
            const p = pos.get(n.id)!
            const c = color(n.id)
            const status = unitStatus(n.id, done)
            const isSel = selected === n.id
            const inChain = up.has(n.id)
            const opens = down.has(n.id)
            const dim = Boolean(selected) && !isSel && !inChain && !opens
            return (
              <motion.button
                key={n.id}
                onClick={(e) => {
                  e.stopPropagation()
                  haptic(6)
                  onSelect(isSel ? null : n.id)
                }}
                initial={{ opacity: 0, y: 10, x: '-50%' }}
                animate={{ opacity: dim ? 0.32 : 1, y: 0, x: '-50%' }}
                transition={{ opacity: { duration: 0.3 }, y: { type: 'spring', stiffness: 260, damping: 30, delay: n.layer * 0.05 } }}
                className="focus-ring group absolute flex w-[104px] flex-col items-center gap-1.5 rounded-2xl text-center"
                style={{ left: p.x, top: p.y - NODE / 2 }}
                aria-pressed={isSel}
                aria-label={`Unidade ${u.n}: ${u.title}. ${status === 'concluida' ? 'Concluída' : status === 'recomendada' ? 'Recomendada agora' : 'Recomendada depois dos pré-requisitos'}`}
              >
                {(() => {
                  const ext = [...new Set(u.requires.map((r) => getUnit(r)!.module).filter((m) => m !== module.id))]
                  return ext.length ? (
                    <span className="pointer-events-none absolute -top-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#0b0c12] px-2.5 py-0.5 text-[12px] text-white/55">
                      vem de {ext.map((m) => getModule(m)!.short).join(' · ')}
                    </span>
                  ) : null
                })()}
                <motion.span
                  animate={{ scale: isSel ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="relative grid place-items-center rounded-[18px] border font-mono text-[17px] font-medium tabular-nums transition-colors"
                  style={{
                    width: NODE,
                    height: NODE,
                    color: status === 'concluida' ? '#05060a' : c,
                    background: status === 'concluida' ? c : isSel || inChain ? `${c}2e` : `${c}12`,
                    borderColor: isSel ? '#ffffff' : status === 'depois' ? `${c}33` : `${c}77`,
                    boxShadow: isSel ? `0 0 0 4px ${c}33, 0 8px 30px ${c}40` : status === 'recomendada' ? `0 0 24px ${c}30` : undefined,
                  }}
                >
                  {status === 'concluida' ? <Check className="h-5 w-5" strokeWidth={2.6} /> : u.n}
                  {status === 'recomendada' && !selected && (
                    <motion.span
                      className="absolute inset-[-5px] rounded-[22px] border"
                      style={{ borderColor: `${c}66` }}
                      animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.12, 1] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.span>
                <span className={cn('line-clamp-2 text-[14px] leading-tight transition-colors', isSel ? 'text-white' : status === 'depois' ? 'text-white/55' : 'text-white/80')}>
                  {u.short}
                </span>
              </motion.button>
            )
          })}
        </>
      )}
    </div>
  )
}
