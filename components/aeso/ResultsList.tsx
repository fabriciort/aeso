'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { ObjectListItem } from '@/lib/astro/types'
import { formatAngle, formatNumber } from '@/lib/format'
import SkyThumb from './SkyThumb'

interface ResultsListProps {
  description: string
  results: ObjectListItem[]
  interpretedBy: 'rules' | 'ai'
  onSelect: (item: ObjectListItem) => void
}

function thumbFov(item: ObjectListItem): number {
  if (item.sizeArcmin) return Math.min(Math.max((item.sizeArcmin * 2) / 60, 0.03), 6)
  return 0.15
}

export default function ResultsList({ description, results, interpretedBy, onSelect }: ResultsListProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            {interpretedBy === 'ai' && <Sparkles className="h-3 w-3 text-violet-300" />}
            {interpretedBy === 'ai' ? 'Interpretado por IA' : 'Busca por características'} · SIMBAD
          </p>
          <h2 className="mt-1 text-balance text-[28px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[34px]">
            {description}
          </h2>
        </div>
        <p className="text-sm text-white/45">
          {results.length} resultado{results.length === 1 ? '' : 's'}
        </p>
      </div>

      <motion.ul
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {results.map((r) => (
          <motion.li
            key={r.id}
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.97, filter: 'blur(6px)' },
              show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 28 } },
            }}
          >
            <button
              onClick={() => onSelect(r)}
              className="focus-ring group block w-full overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.025] text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]"
            >
              <div className="relative">
                <SkyThumb ra={r.ra} dec={r.dec} fov={thumbFov(r)} size={240} className="aspect-square w-full" alt={r.id} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-white/0 transition group-hover:text-white/80" />
                {r.magnitude !== undefined && (
                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-md">
                    V {formatNumber(r.magnitude)}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[15px] font-medium text-white">{r.id}</p>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {[r.typeLabel, r.morphology ?? r.spectralType, r.sizeArcmin ? formatAngle(r.sizeArcmin) : undefined]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
