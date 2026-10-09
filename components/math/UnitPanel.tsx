'use client'

import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, Check, FlaskConical } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { getLesson, getModule, getUnit, partOf, unitStatus, unlocks, type Unit } from '@/lib/math/curriculum'
import { cn } from '@/lib/utils'
import { hasLabModule } from '@/components/labs/registry'

// A unit, at a glance: what comes before, what comes after, its aulas.
// Few words, large type: the map already tells most of the story.

export function UnitPanel({
  unit,
  done,
  onSelect,
  onOpenLab,
}: {
  unit: Unit
  done: Set<string>
  onSelect: (id: string) => void
  onOpenLab: (slug: string) => void
}) {
  const c = colorOf(unit)
  const status = unitStatus(unit.id, done)
  const next = unlocks(unit.id)
  const lab = unit.lab ? getLab(unit.lab) : undefined
  const labReady = Boolean(lab && lab.status === 'disponivel' && hasLabModule(lab.slug))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border font-mono text-[20px] tabular-nums"
          style={{ color: status === 'concluida' ? '#05060a' : c, background: status === 'concluida' ? c : `${c}18`, borderColor: `${c}66` }}
        >
          {status === 'concluida' ? <Check className="h-6 w-6" strokeWidth={2.6} /> : unit.n}
        </span>
        <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white">{unit.title}</h2>
      </header>

      {status === 'recomendada' && unit.requires.length > 0 && (
        <p className="text-[17px]" style={{ color: c }}>
          Você já tem a base.
        </p>
      )}

      {unit.requires.length > 0 && <Row icon={<ArrowUp className="h-4 w-4" />} ids={unit.requires} from={unit} done={done} onSelect={onSelect} />}
      {next.length > 0 && <Row icon={<ArrowDown className="h-4 w-4" />} ids={next.map((u) => u.id)} from={unit} done={done} onSelect={onSelect} />}

      {unit.lessons.length > 0 && (
        <ol className="flex flex-col">
          {unit.lessons.map((l, i) => {
            const uses = [...new Set((l.requires ?? []).map((r) => getLesson(r)!.unit).filter((u) => u.id !== unit.id))]
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, type: 'spring', stiffness: 260, damping: 30 }}
                className="flex items-center gap-3 border-t border-white/[0.06] py-3 first:border-t-0"
              >
                <span className="w-5 shrink-0 font-mono text-[14px] tabular-nums text-white/35">{i + 1}</span>
                <span className="min-w-0 flex-1 text-[17px] leading-snug text-white/90">{l.title}</span>
                {uses.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSelect(u.id)}
                    aria-label={`Usa a unidade ${u.n}, ${u.title}`}
                    className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full border px-1.5 font-mono text-[12px] tabular-nums"
                    style={{ color: colorOf(u), borderColor: `${colorOf(u)}55` }}
                  >
                    {u.n}
                  </button>
                ))}
              </motion.li>
            )
          })}
        </ol>
      )}

      {lab && (
        <button
          onClick={() => labReady && onOpenLab(lab.slug)}
          disabled={!labReady}
          className={cn(
            'focus-ring group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
            labReady ? 'border-white/[0.1] bg-white/[0.04] hover:border-white/25' : 'border-white/[0.06] opacity-60',
          )}
        >
          <FlaskConical className="h-5 w-5 shrink-0" style={{ color: lab.accent }} />
          <span className="min-w-0 flex-1 truncate text-[17px] text-white">{lab.title}</span>
          {labReady && <ArrowRight className="h-5 w-5 text-white/45 transition group-hover:translate-x-0.5 group-hover:text-white" />}
        </button>
      )}

      <div className="rounded-full bg-white/[0.06] py-3.5 text-center text-[16px] text-white/50">Em breve</div>
    </div>
  )
}

function colorOf(u: Unit) {
  return partOf(u)?.color ?? getModule(u.module)!.color
}

/** Before (↑) or after (↓): just the units, as chips. */
function Row({ icon, ids, from, done, onSelect }: { icon: React.ReactNode; ids: string[]; from: Unit; done: Set<string>; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2.5 text-white/35">{icon}</span>
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => {
          const u = getUnit(id)!
          const c = colorOf(u)
          const other = u.module !== from.module
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border pl-1.5 pr-4 text-[15px] text-white/85 transition hover:text-white"
              style={{ borderColor: `${c}40`, background: `${c}0f` }}
            >
              <span className="grid h-7 min-w-7 place-items-center rounded-full font-mono text-[12px] tabular-nums" style={{ background: `${c}22`, color: c }}>
                {done.has(id) ? <Check className="h-3.5 w-3.5" /> : u.n}
              </span>
              {other ? `${getModule(u.module)!.short} · ${u.short}` : u.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}
