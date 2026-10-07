'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { STEP_LABEL, type Lab } from '@/lib/labs/types'
import { rise, spring, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { updateLab, useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { EXOPLANETA_STEPS } from '@/components/labs/exoplaneta/steps'
import { LabRuntime, type StepProps } from '@/components/labs/runtime'
import { Button } from '../ui'
import { LabCover } from '@/components/labs/LabCover'

const STEP_COMPONENTS: Record<string, Record<string, React.ComponentType<StepProps & { onExplore?: () => void }>>> = {
  exoplaneta: EXOPLANETA_STEPS,
}

export default function LabView({ slug, stepId }: { slug: string; stepId?: string }) {
  const lab = getLab(slug)
  const { navigate } = useRouter()
  if (!lab) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="text-lg text-white">Laboratório não encontrado.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate({ area: 'laboratorios' })}>
            Ver laboratórios
          </Button>
        </div>
      </div>
    )
  }
  if (lab.status !== 'disponivel') return <ComingSoon lab={lab} />
  return (
    <LabRuntime lab={lab}>
      <LabPlayer lab={lab} stepId={stepId} />
    </LabRuntime>
  )
}

function ComingSoon({ lab }: { lab: Lab }) {
  const { navigate } = useRouter()
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center text-center">
      <div>
        <LabCover lab={lab} className="mx-auto mb-8 h-44 w-44 rounded-[32px]" />
        <p className="eyebrow">Em breve</p>
        <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.03em] text-white">{lab.title}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-white/55">{lab.subtitle}</p>
        <Button variant="secondary" className="mt-8" onClick={() => navigate({ area: 'laboratorios' })}>
          <ArrowLeft className="h-4 w-4" /> Outros laboratórios
        </Button>
      </div>
    </div>
  )
}

function LabPlayer({ lab, stepId }: { lab: Lab; stepId?: string }) {
  const { navigate } = useRouter()
  const { setOpen } = useVega()
  const progress = useProgress()
  const saved = progress.labs[lab.slug]
  const answers = useMemo(() => saved?.answers ?? {}, [saved])
  const started = Boolean(answers.__started)
  const fromUrl = stepId ? lab.steps.findIndex((s) => s.id === stepId) : -1
  const [index, setIndex] = useState(() => (fromUrl >= 0 ? Math.min(fromUrl, saved?.reached ?? 0) : (saved?.current ?? 0)))
  const [direction, setDirection] = useState(1)
  const [ready, setReady] = useState(false)
  const [showCover, setShowCover] = useState(!started && fromUrl < 0)
  const step = lab.steps[index]
  const reached = saved?.reached ?? 0
  const isLast = index === lab.steps.length - 1

  const setAnswer = useCallback(
    (key: string, value: unknown) => updateLab(lab.slug, (l) => ({ ...l, answers: { ...l.answers, [key]: value } })),
    [lab.slug],
  )

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(lab.steps.length - 1, i))
      setDirection(next >= index ? 1 : -1)
      setReady(false)
      setIndex(next)
      updateLab(lab.slug, (l) => ({ ...l, current: next, reached: Math.max(l.reached, next) }))
      navigate({ area: 'laboratorio', slug: lab.slug, step: lab.steps[next].id }, { replace: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [index, lab, navigate],
  )

  const finish = () => {
    updateLab(lab.slug, (l) => ({ ...l, completedAt: l.completedAt ?? new Date().toISOString() }))
    navigate({ area: 'laboratorios' })
  }

  // Mark completion as soon as the student reaches the last step.
  useEffect(() => {
    if (isLast && !saved?.completedAt && !showCover) {
      updateLab(lab.slug, (l) => ({ ...l, completedAt: new Date().toISOString() }))
    }
  }, [isLast, saved?.completedAt, showCover, lab.slug])

  // Keyboard: → / Enter continue, ← back.
  useEffect(() => {
    if (showCover) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && ready && !isLast) go(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, index, isLast, go, showCover])

  const Step = STEP_COMPONENTS[lab.slug]?.[step.id]

  if (showCover) {
    return (
      <Cover
        lab={lab}
        onStart={() => {
          setAnswer('__started', true)
          setShowCover(false)
          go(0)
        }}
      />
    )
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-24px)] flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 -mx-4 bg-gradient-to-b from-[#030407] via-[#030407]/90 to-transparent px-4 pb-6 pt-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ area: 'laboratorios' })}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Voltar aos laboratórios"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-white/80">{lab.title}</p>
          <button
            onClick={() => setOpen(true)}
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 text-[13px] text-white/80 transition hover:bg-white/[0.12] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Vega
          </button>
        </div>
        <ol className="mt-3 flex gap-1.5" aria-label="Etapas">
          {lab.steps.map((s, i) => {
            const canJump = i <= Math.max(reached, index)
            return (
              <li key={s.id} className="group relative flex-1">
                <button
                  disabled={!canJump}
                  onClick={() => go(i)}
                  className="focus-ring block w-full py-2"
                  aria-label={`Etapa ${i + 1}: ${s.title}`}
                  aria-current={i === index ? 'step' : undefined}
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: i === index ? lab.accent : 'rgba(255,255,255,0.7)' }}
                      initial={false}
                      animate={{ width: i < index || (i <= reached && i !== index) ? '100%' : i === index ? '100%' : '0%', opacity: i === index ? 1 : i <= reached ? 0.55 : 0 }}
                      transition={spring.soft}
                    />
                  </span>
                </button>
                <span className="pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2.5 py-1 text-[11px] text-white/80 opacity-0 transition group-hover:opacity-100 sm:block">
                  {STEP_LABEL[s.kind]}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Step */}
      <div className="relative flex-1 pb-28">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40, filter: 'blur(8px)' }),
              center: { opacity: 1, x: 0, filter: 'blur(0px)' },
              exit: (d: number) => ({ opacity: 0, x: d * -40, filter: 'blur(8px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {Step ? (
              <Step
                lab={lab}
                answers={answers}
                setAnswer={setAnswer}
                setReady={setReady}
                onExplore={() => navigate({ area: 'ceu', q: lab.target?.name })}
              />
            ) : (
              <p className="text-white/60">Esta etapa ainda não foi construída.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(env(safe-area-inset-bottom),12px)] lg:left-[84px]">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button variant="secondary" onClick={() => go(index - 1)} disabled={index === 0} className="glass-strong !bg-[#0b0d14]/80">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
          </Button>
          <span className="glass-strong hidden rounded-full px-3 py-2 text-xs text-white/50 sm:block">
            {index + 1} de {lab.steps.length} · {STEP_LABEL[step.kind]}
          </span>
          {isLast ? (
            <Button size="lg" onClick={finish}>
              <Check className="h-4 w-4" /> Concluir
            </Button>
          ) : (
            <Button size="lg" onClick={() => go(index + 1)} disabled={!ready} className={cn(ready && 'shadow-[0_0_30px_rgba(255,255,255,0.25)]')}>
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Cover({ lab, onStart }: { lab: Lab; onStart: () => void }) {
  const { navigate } = useRouter()
  useVegaScreen({ lab: lab.slug, state: 'Capa do laboratório: o aluno ainda não começou.' })
  return (
    <div className="relative mx-auto grid min-h-[calc(100dvh-80px)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1fr_440px]">
      <motion.div variants={stagger(0.07, 0.1)} initial="hidden" animate="show">
        <motion.button variants={rise} onClick={() => navigate({ area: 'laboratorios' })} className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-white/45 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Laboratórios
        </motion.button>
        <motion.p variants={rise} className="eyebrow" style={{ color: lab.accent }}>
          Laboratório · {lab.area}
        </motion.p>
        <motion.h1 variants={rise} className="mt-4 text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[60px]">
          {lab.title}
        </motion.h1>
        <motion.p variants={rise} className="mt-5 max-w-xl text-balance text-[19px] leading-relaxed text-white/60">
          {lab.subtitle}
        </motion.p>
        <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {lab.minutes} min
          </span>
          <span>{lab.level === 'Todos' ? 'Para todos os níveis' : lab.level}</span>
          <span>{lab.steps.length} etapas</span>
        </motion.div>
        <motion.div variants={rise} className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" onClick={onStart}>
            Começar <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.ol
        variants={stagger(0.06, 0.35)}
        initial="hidden"
        animate="show"
        className="glass relative space-y-1 rounded-[28px] p-3"
      >
        {lab.steps.map((s, i) => (
          <motion.li key={s.id} variants={rise} className="flex items-start gap-4 rounded-2xl px-3 py-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 font-mono text-[12px] text-white/55">{i + 1}</span>
            <span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: lab.accent }}>
                {STEP_LABEL[s.kind]}
              </span>
              <span className="mt-0.5 block text-[15px] text-white">{s.title}</span>
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}
