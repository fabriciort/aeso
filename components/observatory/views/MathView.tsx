'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { getModule, getUnit, MODULES, type ModuleId } from '@/lib/math/curriculum'
import { doneUnits, useFormationProgress } from '@/lib/math/formation-progress'
import { rise, spring, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { LabCover } from '@/components/labs/LabCover'
import { hasLabModule } from '@/components/labs/registry'
import { FormationMap } from '@/components/math/FormationMap'
import { UnitPanel } from '@/components/math/UnitPanel'

// Matemática: the map of the Formação. On top, the módulos in order; below,
// the prerequisite tree of the chosen módulo. Tapping a unit shows what it
// asks for before, what it opens after, and its aulas.

const MODULE_KEY = 'aeso:formacao:modulo'

export default function MathView() {
  const { navigate } = useRouter()
  const progress = useFormationProgress()
  const done = useMemo(() => doneUnits(progress), [progress])
  const [moduleId, setModuleId] = useState<ModuleId>('basica')
  const [selected, setSelected] = useState<string | null>(null)
  const mod = getModule(moduleId)!
  const unit = selected ? getUnit(selected) : undefined
  const sheetDrag = useDragControls()

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODULE_KEY) as ModuleId | null
      if (saved && getModule(saved)) setModuleId(saved)
    } catch {}
  }, [])
  const chooseModule = (id: ModuleId) => {
    setModuleId(id)
    setSelected(null)
    try {
      window.localStorage.setItem(MODULE_KEY, id)
    } catch {}
  }
  // Selecting a unit of another módulo (a cross-módulo prerequisite) moves the map there.
  const select = (id: string | null) => {
    if (id) {
      const u = getUnit(id)
      if (u && u.module !== moduleId) {
        setModuleId(u.module)
        try {
          window.localStorage.setItem(MODULE_KEY, u.module)
        } catch {}
      }
    }
    setSelected(id)
  }
  // Escape closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useVegaScreen({
    state: unit
      ? `Mapa da Formação em Matemática, ${mod.title}: o aluno abriu a unidade ${unit.n}, "${unit.title}". Pré-requisitos: ${unit.requires.map((r) => getUnit(r)?.title).join(', ') || 'nenhum'}.`
      : `Mapa da Formação em Matemática, módulo ${mod.title}.`,
  })

  const labs = mod.units.map((u) => (u.lab ? getLab(u.lab) : undefined)).filter((l) => l && l.status === 'disponivel' && hasLabModule(l.slug))

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-6xl pb-16 pt-4">
      <motion.header variants={rise}>
        <p className="eyebrow">Formação em Matemática</p>
        <h1 className="mt-3 text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">Do zero ao Cálculo, passo a passo.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/55">
          Cada unidade mostra o que você precisa saber antes e o que ela abre depois. Comece pelo que já tem base: o caminho aparece sozinho.
        </p>
      </motion.header>

      {/* The módulos, in order of dependency. */}
      <motion.nav variants={rise} aria-label="Módulos da formação" className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ol className="flex min-w-max items-stretch gap-2">
          {MODULES.map((m, i) => {
            const active = m.id === moduleId
            const units = m.units.length
            return (
              <li key={m.id} className="flex items-center gap-2">
                <button
                  onClick={() => chooseModule(m.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn('focus-ring relative w-[176px] rounded-[20px] border px-4 py-3 text-left transition', active ? 'border-white/25' : 'border-white/[0.07] hover:border-white/15')}
                >
                  {active && <motion.span layoutId="module-active" transition={spring.snappy} className="absolute inset-0 rounded-[20px]" style={{ background: `${m.color}14` }} />}
                  <span className="relative flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] tabular-nums" style={{ background: `${m.color}22`, color: m.color }}>
                      {i + 1}
                    </span>
                    <span className={cn('text-[14px] font-medium leading-tight', active ? 'text-white' : 'text-white/75')}>{m.title}</span>
                  </span>
                  <span className="relative mt-1.5 block text-[12px] text-white/40">
                    {units} unidades · {m.planned ? 'em planejamento' : 'em construção'}
                  </span>
                </button>
                {i < MODULES.length - 1 && <span aria-hidden className="h-px w-3 bg-white/15" />}
              </li>
            )
          })}
        </ol>
      </motion.nav>

      <div className={cn('mt-8 lg:grid lg:items-start lg:gap-10', 'lg:grid-cols-[minmax(0,1fr)_380px]')}>
        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={mod.id}
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6">
                <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">{mod.title}</h2>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/55">{mod.promise}</p>
                {mod.milestone && <p className="mt-2 text-[13px] text-white/40">{mod.milestone}</p>}
                {mod.planned ? (
                  <p className="mt-4 inline-flex rounded-full border border-white/[0.08] px-3 py-1.5 text-[12.5px] text-white/55">Em planejamento: a estrutura prevista das unidades</p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {mod.parts
                      .filter((p) => p.id.length === 1)
                      .map((p) => (
                        <span key={p.id} className="inline-flex items-center gap-1.5 text-[12.5px] text-white/55">
                          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.title}
                        </span>
                      ))}
                  </div>
                )}
                <p className="mt-5 text-[13px] text-white/40">Toque numa unidade para ver o que ela pede antes e o que ela abre depois.</p>
              </div>

              {labs.length > 0 && (
                <div className="-mx-4 mb-8 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {labs.map((lab) => (
                    <button
                      key={lab!.slug}
                      onClick={() => navigate({ area: 'laboratorio', slug: lab!.slug })}
                      className="focus-ring group flex w-[260px] shrink-0 items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-2 pr-4 text-left transition hover:border-white/20"
                    >
                      <LabCover lab={lab!} className="h-14 w-16 shrink-0 rounded-[14px]" />
                      <span className="min-w-0">
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-white/40">Laboratório pronto</span>
                        <span className="block truncate text-[14px] text-white">{lab!.title}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <FormationMap module={mod} done={done} selected={selected && getUnit(selected)?.module === mod.id ? selected : null} onSelect={select} />
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Desktop: side panel. */}
        <aside className="sticky top-6 hidden max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6 [scrollbar-width:thin] lg:block">
          <AnimatePresence mode="wait" initial={false}>
            {unit ? (
              <motion.div key={unit.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
                <UnitPanel unit={unit} done={done} onSelect={select} onOpenLab={(slug) => navigate({ area: 'laboratorio', slug })} />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
                <p className="text-[15px] text-white/60">Escolha uma unidade no mapa.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/40">As unidades que brilham são as recomendadas agora: você já tem a base para elas.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Phone: bottom sheet. */}
      <AnimatePresence>
        {unit && (
          <motion.div key="sheet" className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Fechar" onClick={() => setSelected(null)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            <motion.div
              role="dialog"
              aria-label={`Unidade ${unit.n}: ${unit.title}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              drag="y"
              dragListener={false}
              dragControls={sheetDrag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && setSelected(null)}
              className="absolute inset-x-0 bottom-0 max-h-[78svh] overflow-y-auto rounded-t-[28px] border-t border-white/[0.08] bg-[#0a0b12] px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-0"
            >
              <div
                onPointerDown={(e) => sheetDrag.start(e)}
                className="sticky top-0 z-10 -mx-5 mb-2 flex cursor-grab touch-none items-center justify-center bg-[#0a0b12] px-5 pb-3 pt-3"
              >
                <span className="h-1 w-10 rounded-full bg-white/20" />
                <button onClick={() => setSelected(null)} aria-label="Fechar" className="focus-ring absolute right-3 top-1.5 grid h-9 w-9 place-items-center rounded-full text-white/55 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={unit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                  <UnitPanel unit={unit} done={done} onSelect={select} onOpenLab={(slug) => navigate({ area: 'laboratorio', slug })} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
