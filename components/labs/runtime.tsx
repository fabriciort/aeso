'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Lab } from '@/lib/labs/types'
import { STEP_LABEL } from '@/lib/labs/types'
import type { LightCurve } from '@/lib/server/tess'
import { cn } from '@/lib/utils'

// Shared runtime of a lab: the data it needs (fetched as soon as the lab
// opens, so later steps feel instant) and the contract between the player
// and each Etapa.
//
// An Etapa is a single, non-scrolling screen: a Palco (the instrument,
// always visible), a Legenda (one or two sentences) and Controles near the
// thumb. Longer content is split into Cenas: "Continuar" first advances the
// scenes of the current Etapa, then moves to the next Etapa.

export type DataState =
  | { status: 'loading' }
  | { status: 'ready'; data: LightCurve }
  | { status: 'error'; message: string }

export interface StepNav {
  /** Called by the player on "Continuar"; return true if handled (next scene). */
  next?: () => boolean
  /** Called on "Voltar"; return true if handled (previous scene). */
  back?: () => boolean
}

export interface StepProps {
  lab: Lab
  answers: Record<string, unknown>
  setAnswer: (key: string, value: unknown) => void
  /** Allows the "Continuar" button. */
  setReady: (ready: boolean) => void
  /** Lets an Etapa handle Continuar/Voltar for its scenes. */
  registerNav: (nav: StepNav) => void
  /** Reports scene progress (shown inside the step's progress segment). */
  reportScene: (scene: number, total: number) => void
  onExplore?: () => void
}

/** Scenes inside an Etapa. Restores the last scene from saved answers. */
export function useScenes(props: StepProps, total: number, key: string) {
  const { registerNav, reportScene, answers, setAnswer } = props
  const saved = typeof answers[key] === 'number' ? Math.min(answers[key] as number, total - 1) : 0
  const [scene, setSceneState] = useState(saved)
  const ref = useRef(scene)
  ref.current = scene
  const setScene = useCallback(
    (s: number) => {
      setSceneState(s)
      setAnswer(key, s)
    },
    [key, setAnswer],
  )
  useEffect(() => {
    registerNav({
      next: () => {
        if (ref.current < total - 1) {
          setScene(ref.current + 1)
          return true
        }
        return false
      },
      back: () => {
        if (ref.current > 0) {
          setScene(ref.current - 1)
          return true
        }
        return false
      },
    })
  }, [registerNav, setScene, total])
  useEffect(() => reportScene(scene, total), [scene, total, reportScene])
  return [scene, setScene] as const
}

interface Runtime {
  data: DataState
  useSimulated: () => void
}

const RuntimeCtx = createContext<Runtime | null>(null)

export function LabRuntime({ lab, children }: { lab: Lab; children: React.ReactNode }) {
  const [data, setData] = useState<DataState>({ status: 'loading' })
  const [source, setSource] = useState<'real' | 'simulado'>('real')

  useEffect(() => {
    if (!lab.target) return
    const controller = new AbortController()
    setData({ status: 'loading' })
    fetch(`/api/lightcurve?lab=${lab.slug}${source === 'simulado' ? '&fonte=simulado' : ''}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body?.error ?? 'Falha ao carregar os dados')
        setData({ status: 'ready', data: body as LightCurve })
      })
      .catch((e) => {
        if (!controller.signal.aborted) setData({ status: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' })
      })
    return () => controller.abort()
  }, [lab.slug, lab.target, source])

  const useSimulated = useCallback(() => setSource('simulado'), [])
  return <RuntimeCtx.Provider value={{ data, useSimulated }}>{children}</RuntimeCtx.Provider>
}

export function useLabRuntime(): Runtime {
  const v = useContext(RuntimeCtx)
  if (!v) throw new Error('useLabRuntime fora do LabRuntime')
  return v
}

/**
 * The fixed, non-scrolling layout of an Etapa.
 * - Phone: Palco on top (fills the free space), then Legenda, then Controles.
 * - Desktop: Palco on the left, Legenda + Controles in a column on the right.
 * The Palco stays mounted across scenes; Legenda and Controles cross-fade.
 */
export function StepFrame({
  lab,
  stepIndex,
  stage,
  caption,
  controls,
  scene = 0,
}: {
  lab: Lab
  stepIndex: number
  stage?: React.ReactNode
  caption: React.ReactNode
  controls?: React.ReactNode
  scene?: number
}) {
  const step = lab.steps[stepIndex]
  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-4', stage && 'lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10')}>
      {stage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[200px] flex-1 lg:h-full lg:max-h-[min(78vh,720px)] lg:self-center"
        >
          {stage}
        </motion.div>
      )}
      <div className={cn('flex shrink-0 flex-col gap-3.5 lg:justify-center', !stage && 'flex-1 justify-center')}>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: lab.accent }}>
          {STEP_LABEL[step.kind]} <span className="text-white/35">· {step.title}</span>
        </p>
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={scene}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="text-[17px] leading-snug text-white/85 lg:text-[19px] lg:leading-relaxed [&_strong]:font-semibold [&_strong]:text-white"
            >
              {caption}
            </motion.div>
          </AnimatePresence>
        </div>
        {controls && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`c-${scene}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {controls}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export function Panel({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('relative h-full overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#06070c] lg:rounded-[28px]', className)}>
      {children}
    </div>
  )
}
