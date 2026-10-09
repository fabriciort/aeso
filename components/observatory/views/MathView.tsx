'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { getLesson, getModule, getUnit, MODULES, unitStatus, type ModuleId } from '@/lib/math/curriculum'
import { doneUnits, useFormationProgress } from '@/lib/math/formation-progress'
import { rise, spring, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { FormationMap, NEXT } from '@/components/math/FormationMap'
import { UnitPanel } from '@/components/math/UnitPanel'
import { useConteudo } from '@/components/aula/useConteudo'

// Matemática: the map of the Formação. Módulos on top, the prerequisite tree
// below. Almost no text: the map is the explanation.

const MODULE_KEY = 'aeso:formacao:modulo'

export default function MathView() {
  const { route, navigate } = useRouter()
  const progress = useFormationProgress()
  const done = useMemo(() => doneUnits(progress), [progress])
  const conteudo = useConteudo()
  const available = useMemo(() => new Set(conteudo?.AULAS.map((a) => a.id) ?? []), [conteudo])
  // Coming back from an aula, its unit stays open.
  const fromUnit = route.area === 'matematica' && route.unit ? getUnit(route.unit) : undefined
  const [moduleId, setModuleId] = useState<ModuleId>(fromUnit?.module ?? 'basica')
  const [selected, setSelected] = useState<string | null>(fromUnit?.id ?? null)
  const mod = getModule(moduleId)!
  const unit = selected ? getUnit(selected) : undefined
  const sheetDrag = useDragControls()

  useEffect(() => {
    if (fromUnit) {
      requestAnimationFrame(() => document.querySelector(`[data-unit="${fromUnit.id}"]`)?.scrollIntoView({ block: 'center' }))
      return
    }
    try {
      const saved = window.localStorage.getItem(MODULE_KEY) as ModuleId | null
      if (saved && getModule(saved)) setModuleId(saved)
    } catch {}
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const remember = (id: ModuleId) => {
    try {
      window.localStorage.setItem(MODULE_KEY, id)
    } catch {}
  }
  const chooseModule = (id: ModuleId) => {
    setModuleId(id)
    setSelected(null)
    remember(id)
  }
  // A prerequisite from another módulo moves the map there.
  const select = (id: string | null) => {
    const u = id ? getUnit(id) : undefined
    if (u && u.module !== moduleId) {
      setModuleId(u.module)
      remember(u.module)
    }
    setSelected(id)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useVegaScreen({
    state: unit
      ? `Mapa da Formação em Matemática, ${mod.title}: unidade ${unit.n}, "${unit.title}". Pré-requisitos: ${unit.requires.map((r) => getUnit(r)?.title).join(', ') || 'nenhum'}.`
      : `Mapa da Formação em Matemática, módulo ${mod.title}.`,
  })

  const openLab = (slug: string) => navigate({ area: 'laboratorio', slug })
  const openLesson = (id: string) => navigate({ area: 'aula', id })

  // The one obvious next action: the next aula ready to study, in the order
  // of the formation; without one, the first recommended unit.
  const units = MODULES.flatMap((m) => m.units)
  const nextLesson = units
    .filter((u) => unitStatus(u.id, done) === 'recomendada')
    .flatMap((u) => u.lessons)
    .find((l) => available.has(l.id) && !progress.lessons[l.id])
  const next = nextLesson ? getLesson(nextLesson.id)!.unit : units.find((u) => unitStatus(u.id, done) === 'recomendada')
  const goNext = () => {
    if (nextLesson) return openLesson(nextLesson.id)
    if (!next) return
    select(next.id)
    requestAnimationFrame(() => document.querySelector(`[data-unit="${next.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-6xl pb-16 pt-4">
      <motion.h1 variants={rise} className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[52px]">
        Matemática
      </motion.h1>

      {next && (
        <motion.button
          variants={rise}
          onClick={goNext}
          className="focus-ring group mt-6 flex w-full items-center gap-4 rounded-[24px] bg-white/[0.05] p-4 text-left transition hover:bg-white/[0.08] active:scale-[0.99]"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] text-[20px] font-semibold tabular-nums text-[#0b0904]" style={{ background: NEXT }}>
            {next.n}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] text-white/50">Próximo passo</span>
            <span className="block truncate text-[20px] font-semibold tracking-[-0.02em] text-white">{nextLesson?.title ?? next.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </motion.button>
      )}

      {/* Módulos, in order. */}
      <motion.nav variants={rise} aria-label="Módulos" className="-mx-4 mt-6 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ol className="flex min-w-max gap-2">
          {MODULES.map((m) => {
            const active = m.id === moduleId
            return (
              <li key={m.id}>
                <button
                  onClick={() => chooseModule(m.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn('focus-ring relative h-11 rounded-full px-5 text-[16px] transition-colors', active ? 'text-white' : 'text-white/50 hover:text-white/80')}
                >
                  {active && <motion.span layoutId="module-pill" transition={spring.snappy} className="absolute inset-0 rounded-full bg-white/[0.09]" />}
                  <span className="relative">{m.short}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </motion.nav>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={mod.id}
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-label={mod.title}
          >
            {mod.planned && <p className="mb-6 text-[16px] text-white/45">Em breve</p>}
            <FormationMap module={mod} done={done} selected={selected && getUnit(selected)?.module === mod.id ? selected : null} onSelect={select} />
          </motion.section>
        </AnimatePresence>

        {/* Desktop: side panel. */}
        <aside className="sticky top-6 hidden max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6 [scrollbar-width:thin] lg:block">
          <AnimatePresence mode="wait" initial={false}>
            {unit ? (
              <motion.div key={unit.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
                <UnitPanel unit={unit} done={done} lessonsDone={progress.lessons} available={available} onSelect={select} onOpenLab={openLab} onOpenLesson={openLesson} />
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center text-[17px] text-white/45">
                Toque numa unidade.
              </motion.p>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Phone: bottom sheet. */}
      <AnimatePresence>
        {unit && (
          <motion.div key="sheet" className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Fechar" onClick={() => setSelected(null)} className="absolute inset-0 bg-black/55" />
            <motion.div
              role="dialog"
              aria-label={`Unidade ${unit.n}: ${unit.title}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              drag="y"
              dragListener={false}
              dragControls={sheetDrag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => (info.offset.y > 100 || info.velocity.y > 500) && setSelected(null)}
              className="absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-[30px] bg-[#0b0c13] px-6 pb-[max(env(safe-area-inset-bottom),24px)]"
            >
              <div onPointerDown={(e) => sheetDrag.start(e)} className="sticky top-0 z-10 -mx-6 flex cursor-grab touch-none justify-center bg-[#0b0c13] pb-4 pt-3">
                <span className="h-1 w-10 rounded-full bg-white/20" />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={unit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                  <UnitPanel unit={unit} done={done} lessonsDone={progress.lessons} available={available} onSelect={select} onOpenLab={openLab} onOpenLesson={openLesson} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
