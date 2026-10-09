'use client'

import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, FlaskConical, Sparkles } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { getLesson, getModule, getUnit, missingRequires, partOf, unitStatus, unlocks, type Unit } from '@/lib/math/curriculum'
import { cn } from '@/lib/utils'
import { hasLabModule } from '@/components/labs/registry'

// What a unit asks for before, what it opens after, and its aulas. Opened
// from the map (bottom sheet on phones, side panel on desktop).

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
  const part = partOf(unit)
  const mod = getModule(unit.module)!
  const c = part?.color ?? mod.color
  const status = unitStatus(unit.id, done)
  const missing = missingRequires(unit.id, done)
  const next = unlocks(unit.id)
  const lab = unit.lab ? getLab(unit.lab) : undefined
  const labReady = Boolean(lab && lab.status === 'disponivel' && hasLabModule(lab.slug))

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow" style={{ color: c }}>
          {mod.planned ? mod.title : part && part.id.length === 1 ? `Parte ${part.id} · ${part.title}` : part?.title}
        </p>
        <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white">
          <span className="mr-2 font-mono text-[20px] tabular-nums" style={{ color: c }}>
            {unit.n}
          </span>
          {unit.title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/60">
          <span className="text-white/40">Ao final: </span>
          {unit.outcome}
        </p>
      </header>

      {/* Where the student stands: a recommendation, never a lock. */}
      <div
        className="rounded-2xl border px-4 py-3 text-[14px] leading-snug"
        style={{ borderColor: status === 'depois' ? 'rgba(255,255,255,0.08)' : `${c}40`, background: status === 'depois' ? 'rgba(255,255,255,0.03)' : `${c}10` }}
      >
        {status === 'concluida' ? (
          <span className="inline-flex items-center gap-2 text-white/85">
            <Check className="h-4 w-4" style={{ color: c }} /> Você concluiu esta unidade.
          </span>
        ) : status === 'recomendada' ? (
          <span className="inline-flex items-center gap-2 text-white/85">
            <Sparkles className="h-4 w-4" style={{ color: c }} /> {unit.requires.length ? 'Você já tem a base. É um ótimo próximo passo.' : 'É por aqui que começa.'}
          </span>
        ) : (
          <span className="text-white/70">
            Recomendamos começar depois de {missing.length === 1 ? 'concluir' : 'concluir estas'}{' '}
            {missing.map((m, i) => (
              <span key={m.id}>
                <button onClick={() => onSelect(m.id)} className="font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
                  {label(m, unit)}
                </button>
                {i < missing.length - 2 ? ', ' : i === missing.length - 2 ? ' e ' : ''}
              </span>
            ))}
            . Elas dão a base que esta unidade usa.
          </span>
        )}
      </div>

      {(unit.requires.length > 0 || next.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {unit.requires.length > 0 && (
            <Links icon={<ArrowUp className="h-3.5 w-3.5" />} title="Precisa de" ids={unit.requires} from={unit} done={done} onSelect={onSelect} />
          )}
          {next.length > 0 && <Links icon={<ArrowDown className="h-3.5 w-3.5" />} title="Abre caminho para" ids={next.map((u) => u.id)} from={unit} done={done} onSelect={onSelect} />}
        </div>
      )}

      {unit.lessons.length > 0 ? (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-white/45">
            <BookOpen className="h-3.5 w-3.5" /> Aulas
          </h3>
          <ol className="space-y-1">
            {unit.lessons.map((l, i) => {
              const cross = (l.requires ?? []).map((r) => getLesson(r)!).filter((x) => x.unit.id !== unit.id)
              return (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 30 }}
                  className="flex gap-3 rounded-2xl px-2 py-2.5"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] tabular-nums text-white/60" style={{ borderColor: `${c}40` }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-snug text-white/90">{l.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-white/45">{l.idea}</p>
                    {cross.length > 0 && (
                      <p className="mt-1.5 flex flex-wrap gap-1.5">
                        {cross.map((x) => (
                          <button
                            key={x.lesson.id}
                            onClick={() => onSelect(x.unit.id)}
                            className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11.5px] text-white/55 transition hover:bg-white/[0.1] hover:text-white/80"
                            title="Esta aula usa uma aula de outra unidade"
                          >
                            usa: {x.unit.n} · {x.lesson.title}
                          </button>
                        ))}
                      </p>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </section>
      ) : (
        <p className="text-[14px] leading-relaxed text-white/45">As aulas desta unidade ainda estão sendo planejadas.</p>
      )}

      {(lab || unit.mission) && (
        <section className="space-y-2">
          {lab && (
            <button
              onClick={() => labReady && onOpenLab(lab.slug)}
              disabled={!labReady}
              className={cn(
                'focus-ring group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                labReady ? 'border-white/[0.1] bg-white/[0.04] hover:border-white/25' : 'border-white/[0.06] opacity-60',
              )}
            >
              <FlaskConical className="h-4 w-4 shrink-0" style={{ color: lab.accent }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-white/40">Laboratório interativo</span>
                <span className="block truncate text-[15px] text-white">{lab.title}</span>
              </span>
              {labReady && <ArrowRight className="h-4 w-4 text-white/45 transition group-hover:translate-x-0.5 group-hover:text-white" />}
            </button>
          )}
          {unit.mission && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: c }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-white/40">Missão · em produção</span>
                <span className="block text-[15px] text-white/85">{unit.mission}</span>
              </span>
            </div>
          )}
        </section>
      )}

      <div className="rounded-full border border-white/[0.08] px-4 py-3 text-center text-[14px] text-white/50">Aulas em produção</div>
    </div>
  )
}

/** "U6 · Múltiplos e primos", with the módulo when it is another one. */
function label(u: Unit, from: Unit) {
  const m = getModule(u.module)!
  return u.module === from.module ? `${u.n} · ${u.short}` : `${m.title} · ${u.short}`
}

function Links({ icon, title, ids, from, done, onSelect }: { icon: React.ReactNode; title: string; ids: string[]; from: Unit; done: Set<string>; onSelect: (id: string) => void }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.14em] text-white/45">
        {icon} {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const u = getUnit(id)!
          const c = partOf(u)?.color ?? getModule(u.module)!.color
          const ok = done.has(id)
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] text-white/80 transition hover:text-white"
              style={{ borderColor: `${c}40`, background: `${c}10` }}
            >
              {ok ? <Check className="h-3.5 w-3.5" style={{ color: c }} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />}
              {label(u, from)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
