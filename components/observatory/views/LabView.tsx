'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Clock, Download, Maximize2, Share, X } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { STEP_LABEL, type Lab } from '@/lib/labs/types'
import { rise, spring, stagger } from '@/lib/motion'
import { canFullscreen, enterFocus, exitFocus, haptic, useImmersive, useInstall, useKeepAwake } from '@/lib/observatory/immersive'
import { useRouter } from '@/lib/observatory/router'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { updateLab, useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { EXOPLANETA_STEPS } from '@/components/labs/exoplaneta/steps'
import { LabCover } from '@/components/labs/LabCover'
import { LabRuntime, type StepNav, type StepProps } from '@/components/labs/runtime'
import { VegaOrb } from '../Nav'
import { Button } from '../ui'

const STEP_COMPONENTS: Record<string, Record<string, React.ComponentType<StepProps>>> = {
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

type Phase = 'cover' | 'diving' | 'playing'

function LabPlayer({ lab, stepId }: { lab: Lab; stepId?: string }) {
  const { navigate } = useRouter()
  const progress = useProgress()
  const immersive = useImmersive()
  const saved = progress.labs[lab.slug]
  const answers = useMemo(() => saved?.answers ?? {}, [saved])
  const fromUrl = stepId ? lab.steps.findIndex((s) => s.id === stepId) : -1
  const [index, setIndex] = useState(() => (fromUrl >= 0 ? Math.min(fromUrl, saved?.reached ?? 0) : (saved?.current ?? 0)))
  const [direction, setDirection] = useState(1)
  const [ready, setReady] = useState(false)
  // Deep links to a specific step skip the cover.
  const [phase, setPhase] = useState<Phase>(fromUrl >= 0 ? 'playing' : 'cover')
  const step = lab.steps[index]
  const reached = saved?.reached ?? 0
  const isLast = index === lab.steps.length - 1
  const nav = useRef<StepNav>({})
  const [sceneInfo, setSceneInfo] = useState<[number, number]>([0, 1])
  const registerNav = useCallback((n: StepNav) => {
    nav.current = n
  }, [])
  const reportScene = useCallback((scene: number, total: number) => setSceneInfo([scene, total]), [])
  useKeepAwake(phase === 'playing')

  // The lab is a fixed, non-scrolling screen.
  useEffect(() => {
    if (phase !== 'playing') return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      html.style.overflow = prev
    }
  }, [phase])

  const setAnswer = useCallback(
    (key: string, value: unknown) => updateLab(lab.slug, (l) => ({ ...l, answers: { ...l.answers, [key]: value } })),
    [lab.slug],
  )

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(lab.steps.length - 1, i))
      setDirection(next >= index ? 1 : -1)
      setReady(false)
      nav.current = {}
      setSceneInfo([0, 1])
      setIndex(next)
      updateLab(lab.slug, (l) => ({ ...l, current: next, reached: Math.max(l.reached, next) }))
      navigate({ area: 'laboratorio', slug: lab.slug, step: lab.steps[next].id }, { replace: true })
      haptic(6)
    },
    [index, lab, navigate],
  )

  // Continuar/Voltar first walk through the scenes of the current Etapa.
  const forward = useCallback(() => {
    if (nav.current.next?.()) {
      haptic(6)
      return
    }
    go(index + 1)
  }, [go, index])
  const backward = useCallback(() => {
    if (nav.current.back?.()) {
      haptic(6)
      return
    }
    go(index - 1)
  }, [go, index])

  const leave = useCallback(() => {
    void exitFocus()
    navigate({ area: 'laboratorios' })
  }, [navigate])

  const finish = () => {
    updateLab(lab.slug, (l) => ({ ...l, completedAt: l.completedAt ?? new Date().toISOString() }))
    haptic([10, 50, 10])
    leave()
  }

  // Entering: fullscreen request happens inside the tap, then the dive
  // animation plays (and covers the browser's own fullscreen notice).
  const enter = () => {
    void enterFocus()
    haptic(10)
    setAnswer('__started', true)
    setPhase('diving')
  }

  useEffect(() => {
    if (phase !== 'diving') return
    const t = setTimeout(() => {
      setPhase('playing')
      go(fromUrl >= 0 ? fromUrl : (saved?.current ?? 0))
    }, 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (isLast && !saved?.completedAt && phase === 'playing') {
      updateLab(lab.slug, (l) => ({ ...l, completedAt: new Date().toISOString() }))
    }
  }, [isLast, saved?.completedAt, phase, lab.slug])

  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && ready && !isLast) forward()
      if (e.key === 'ArrowLeft') backward()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, isLast, forward, backward, phase])

  // Leaving the lab area always leaves fullscreen.
  useEffect(() => () => void exitFocus(), [])

  const Step = STEP_COMPONENTS[lab.slug]?.[step.id]

  if (phase === 'cover' || phase === 'diving') {
    return (
      <>
        <Cover lab={lab} resume={Boolean(answers.__started)} onEnter={enter} />
        <Portal>
          <AnimatePresence>{phase === 'diving' && <Dive key="dive" accent={lab.accent} title={lab.title} />}</AnimatePresence>
        </Portal>
      </>
    )
  }

  return (
    <div className="relative flex h-[100svh] flex-col overflow-hidden">
      <TopBar lab={lab} index={index} reached={reached} scene={sceneInfo} onJump={go} onClose={leave} immersive={immersive} />

      <div className="relative min-h-0 flex-1 pb-3">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            className="h-full"
            key={step.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 48, filter: 'blur(10px)' }),
              center: { opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
              exit: (d: number) => ({ opacity: 0, x: d * -48, filter: 'blur(10px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {Step ? (
              <Step
                lab={lab}
                answers={answers}
                setAnswer={setAnswer}
                setReady={setReady}
                registerNav={registerNav}
                reportScene={reportScene}
                onExplore={() => {
                  void exitFocus()
                  navigate({ area: 'ceu', q: lab.target?.name })
                }}
              />
            ) : (
              <p className="text-white/60">Esta etapa ainda não foi construída.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomBar
        index={index}
        total={lab.steps.length}
        label={STEP_LABEL[step.kind]}
        ready={ready}
        isLast={isLast}
        accent={lab.accent}
        canBack={index > 0 || sceneInfo[0] > 0}
        onBack={backward}
        onNext={forward}
        onFinish={finish}
      />
    </div>
  )
}

/**
 * Fixed overlays must live outside the animated view: an ancestor with a CSS
 * transform or filter (our view transitions) turns position: fixed into
 * position: absolute.
 */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, document.body) : null
}

// ---------------------------------------------------------------- Bars

function TopBar({
  lab,
  index,
  reached,
  scene,
  onJump,
  onClose,
  immersive,
}: {
  lab: Lab
  index: number
  reached: number
  scene: [number, number]
  onJump: (i: number) => void
  onClose: () => void
  immersive: boolean
}) {
  const { setOpen } = useVega()
  const step = lab.steps[index]
  // Decided after mount: the server cannot know about the Fullscreen API.
  const [fsAvailable, setFsAvailable] = useState(false)
  useEffect(() => setFsAvailable(canFullscreen()), [])
  return (
    <div className="relative z-30 shrink-0 pb-3 pt-[max(env(safe-area-inset-top),10px)] lg:pb-5 lg:pt-4">
      <ol className="flex gap-1" aria-label="Etapas">
        {lab.steps.map((s, i) => {
          const canJump = i <= Math.max(reached, index)
          const state = i < index || (i <= reached && i !== index) ? 'done' : i === index ? 'current' : 'todo'
          return (
            <li key={s.id} className="group relative flex-1">
              <button disabled={!canJump} onClick={() => onJump(i)} className="focus-ring block w-full py-1.5" aria-label={`Etapa ${i + 1}: ${s.title}`} aria-current={i === index ? 'step' : undefined}>
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full rounded-full"
                    initial={false}
                    animate={{
                      scaleX: state === 'todo' ? 0 : state === 'current' ? Math.max(0.12, (scene[0] + 1) / scene[1]) : 1,
                      backgroundColor: state === 'current' ? lab.accent : 'rgba(255,255,255,0.55)',
                    }}
                    style={{ originX: 0 }}
                    transition={spring.soft}
                  />
                </span>
              </button>
              <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2.5 py-1 text-[11px] text-white/80 opacity-0 transition group-hover:opacity-100 lg:block">
                {STEP_LABEL[s.kind]}
              </span>
            </li>
          )
        })}
      </ol>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={onClose} className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95" aria-label="Sair do laboratório">
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <p className="truncate text-[13px] font-medium text-white/85 lg:text-[14px]">
            <span className="lg:hidden">
              {index + 1}/{lab.steps.length} · {STEP_LABEL[step.kind]}
            </span>
            <span className="hidden lg:inline">{lab.title}</span>
          </p>
        </div>
        {!immersive && fsAvailable && (
          <button
            onClick={() => void enterFocus()}
            className="focus-ring hidden h-10 items-center gap-1.5 rounded-full px-3 text-[13px] text-white/55 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            title="Entrar em tela cheia"
          >
            <Maximize2 className="h-4 w-4" /> Modo foco
          </button>
        )}
        <button onClick={() => setOpen(true)} className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.06] pl-1.5 pr-3 text-[13px] text-white/85 transition hover:bg-white/[0.12] active:scale-95" aria-label="Abrir a Vega">
          <VegaOrb size={26} /> Vega
        </button>
      </div>
    </div>
  )
}

function BottomBar({
  index,
  total,
  label,
  ready,
  isLast,
  accent,
  canBack,
  onBack,
  onNext,
  onFinish,
}: {
  index: number
  total: number
  label: string
  ready: boolean
  isLast: boolean
  accent: string
  canBack: boolean
  onBack: () => void
  onNext: () => void
  onFinish: () => void
}) {
  return (
    <div className="relative z-30 shrink-0 pb-[max(env(safe-area-inset-bottom),14px)] lg:pb-6">
      <div>
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button
            onClick={onBack}
            disabled={!canBack}
            aria-label="Etapa anterior"
            className="focus-ring grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 transition active:scale-95 disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="hidden flex-1 text-center text-xs text-white/40 lg:block">
            {index + 1} de {total} · {label}
          </span>
          {isLast ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onFinish}
              className="focus-ring flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[16px] font-medium text-black lg:w-56 lg:flex-none"
            >
              <Check className="h-5 w-5" /> Concluir
            </motion.button>
          ) : (
            <motion.button
              whileTap={ready ? { scale: 0.97 } : undefined}
              onClick={() => ready && onNext()}
              aria-disabled={!ready}
              className={cn(
                'focus-ring relative flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full text-[16px] font-medium transition-colors duration-500 lg:w-56 lg:flex-none',
                ready ? 'bg-white text-black' : 'bg-white/[0.08] text-white/35',
              )}
            >
              {ready && (
                <motion.span
                  key={`shine-${index}`}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  initial={{ x: '-150%' }}
                  animate={{ x: '400%' }}
                  transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.15 }}
                  style={{ mixBlendMode: 'overlay' }}
                />
              )}
              <span className="relative">{ready ? 'Continuar' : 'Complete a etapa'}</span>
              {ready && <ArrowRight className="relative h-5 w-5" />}
              {ready && <span className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 32px ${accent}55` }} />}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Cover

function Cover({ lab, resume, onEnter }: { lab: Lab; resume: boolean; onEnter: () => void }) {
  const { navigate } = useRouter()
  const { mode, install } = useInstall()
  useVegaScreen({ lab: lab.slug, state: 'Capa do laboratório: o aluno ainda não entrou.' })
  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col pb-10 lg:grid lg:min-h-[calc(100dvh-40px)] lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12">
      {/* Mobile: big living art on top */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative -mx-4 h-[42svh] min-h-[260px] overflow-hidden sm:-mx-6 lg:hidden"
      >
        <LabCover lab={lab} big className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030407]/40 via-transparent to-[#030407]" />
        <button
          onClick={() => navigate({ area: 'laboratorios' })}
          className="focus-ring absolute left-4 top-[max(env(safe-area-inset-top),14px)] grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-xl"
          aria-label="Voltar aos laboratórios"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </motion.div>

      <motion.div variants={stagger(0.07, 0.15)} initial="hidden" animate="show" className="-mt-10 lg:mt-0">
        <motion.button variants={rise} onClick={() => navigate({ area: 'laboratorios' })} className="mb-8 hidden items-center gap-1.5 text-[13px] text-white/45 hover:text-white lg:inline-flex">
          <ArrowLeft className="h-3.5 w-3.5" /> Laboratórios
        </motion.button>
        <motion.p variants={rise} className="eyebrow" style={{ color: lab.accent }}>
          Laboratório · {lab.area}
        </motion.p>
        <motion.h1 variants={rise} className="mt-3 text-balance text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[52px] lg:text-[60px]">
          {lab.title}
        </motion.h1>
        <motion.p variants={rise} className="mt-4 max-w-xl text-balance text-[17px] leading-relaxed text-white/60 lg:text-[19px]">
          {lab.subtitle}
        </motion.p>
        <motion.div variants={rise} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {lab.minutes} min
          </span>
          <span>{lab.level === 'Todos' ? 'Para todos os níveis' : lab.level}</span>
          <span>{lab.steps.length} etapas</span>
        </motion.div>

        <motion.div variants={rise} className="mt-8">
          <motion.button
            onClick={onEnter}
            whileTap={{ scale: 0.97 }}
            className="focus-ring group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-white text-[17px] font-semibold text-black sm:w-auto sm:px-10"
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: [`0 0 0 0 ${lab.accent}66`, `0 0 0 14px ${lab.accent}00`] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            {resume ? 'Voltar ao laboratório' : 'Entrar no laboratório'}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
          <p className="mt-3 text-center text-[12px] text-white/35 sm:text-left">Abre em tela cheia, com a tela sempre acesa.</p>
        </motion.div>

        {mode !== 'none' && (
          <motion.div variants={rise} className="mt-6 rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4">
            {mode === 'prompt' ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-white">Instale o AESo</p>
                  <p className="text-[12.5px] leading-snug text-white/50">Abre como um app, em tela cheia, direto da sua tela inicial.</p>
                </div>
                <Button variant="secondary" onClick={() => void install()}>
                  <Download className="h-4 w-4" /> Instalar
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Share className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <p className="text-[13px] leading-relaxed text-white/60">
                  <span className="font-medium text-white">Tela cheia no iPhone:</span> toque em <span className="text-white">Compartilhar</span> e depois em{' '}
                  <span className="text-white">Adicionar à Tela de Início</span>. O AESo abre como um app, sem barras.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.ol variants={stagger(0.06, 0.35)} initial="hidden" animate="show" className="glass relative mt-10 space-y-0.5 rounded-[28px] p-2.5 lg:mt-0">
        {lab.steps.map((s, i) => (
          <motion.li key={s.id} variants={rise} className="flex items-center gap-4 rounded-2xl px-3 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 font-mono text-[12px] text-white/55">{i + 1}</span>
            <span className="min-w-0">
              <span className="block text-[10.5px] font-medium uppercase tracking-[0.14em]" style={{ color: lab.accent }}>
                {STEP_LABEL[s.kind]}
              </span>
              <span className="block truncate text-[15px] text-white">{s.title}</span>
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}

/** The "dive": a star rushes toward you and you fall into the lab. */
function Dive({ accent, title }: { accent: string; title: string }) {
  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-[#030407]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-px w-16 origin-left rounded-full bg-white/70"
            style={{ rotate: `${(a * 180) / Math.PI}deg` }}
            initial={{ x: 0, opacity: 0, scaleX: 0.2 }}
            animate={{ x: [20, 600], opacity: [0, 0.9, 0], scaleX: [0.2, 3] }}
            transition={{ duration: 1.1, delay: 0.1 + (i % 6) * 0.05, ease: [0.55, 0, 0.75, 0] }}
          />
        )
      })}
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        style={{ background: `radial-gradient(circle, #fff7e0 0%, #ffd27a 45%, ${accent} 70%, transparent 72%)`, boxShadow: `0 0 80px 20px ${accent}55` }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1, 28], opacity: [0, 1, 1] }}
        transition={{ duration: 1.35, times: [0, 0.45, 1], ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.p
        className="relative text-[13px] font-medium uppercase tracking-[0.2em] text-white/70"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 0], y: [8, 0, -6] }}
        transition={{ duration: 1.1, times: [0, 0.4, 1] }}
      >
        {title}
      </motion.p>
      <motion.div className="absolute inset-0 bg-[#030407]" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1] }} transition={{ duration: 1.5, times: [0, 0.75, 1] }} />
    </motion.div>
  )
}
