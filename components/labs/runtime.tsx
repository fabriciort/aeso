'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Lab } from '@/lib/labs/types'
import { STEP_LABEL } from '@/lib/labs/types'
import { rise, stagger } from '@/lib/motion'
import type { LightCurve } from '@/lib/server/tess'
import { cn } from '@/lib/utils'

// Shared runtime of a lab: the data it needs (fetched as soon as the lab
// opens, so later steps feel instant) and the contract between the player
// and each step.

export type DataState =
  | { status: 'loading' }
  | { status: 'ready'; data: LightCurve }
  | { status: 'error'; message: string }

export interface StepProps {
  lab: Lab
  answers: Record<string, unknown>
  setAnswer: (key: string, value: unknown) => void
  /** Allows the "Continuar" button. */
  setReady: (ready: boolean) => void
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

/** Standard two-column layout of an Etapa: narrative + instrument. */
export function StepFrame({
  lab,
  stepIndex,
  children,
  instrument,
  wideInstrument,
}: {
  lab: Lab
  stepIndex: number
  children: React.ReactNode
  instrument?: React.ReactNode
  wideInstrument?: boolean
}) {
  const step = lab.steps[stepIndex]
  return (
    <div className={cn('grid gap-6 lg:gap-10', instrument && (wideInstrument ? 'lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]'))}>
      <motion.div variants={stagger(0.06, 0.1)} initial="hidden" animate="show" className="order-2 flex flex-col gap-5 lg:order-1">
        <motion.p variants={rise} className="eyebrow" style={{ color: lab.accent }}>
          {stepIndex + 1}. {STEP_LABEL[step.kind]}
        </motion.p>
        <motion.h2 variants={rise} className="text-balance text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-[36px]">
          {step.title}
        </motion.h2>
        <motion.p variants={rise} className="text-[17px] leading-relaxed text-white/60">
          {step.goal}
        </motion.p>
        <motion.div variants={rise} className="flex flex-col gap-5">
          {children}
        </motion.div>
      </motion.div>
      {instrument && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="order-1 lg:order-2"
        >
          {instrument}
        </motion.div>
      )}
    </div>
  )
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#06070c]/80 backdrop-blur-xl', className)}>{children}</div>
}
