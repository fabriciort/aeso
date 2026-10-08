'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Volume2 } from 'lucide-react'
import type { Lab } from '@/lib/labs/types'
import { stepLabel } from '@/lib/labs/types'
import type { LightCurve } from '@/lib/server/tess'
import { haptic } from '@/lib/observatory/immersive'
import { readableText, speak, stopSpeaking, unlockVoice, useNarrator, voiceSupported } from '@/lib/observatory/voice'
import { setPreferences, usePreferences } from '@/lib/preferences'
import { cn } from '@/lib/utils'
import { VegaOrb } from '@/components/observatory/Nav'

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

/**
 * Lab-wide live values (slider positions, the selected star…). Unlike
 * answers they are not saved; they survive step changes, which is what lets
 * a continuous Palco keep its state from one Etapa to the next.
 */
export type Live = Record<string, unknown>

interface Runtime {
  data: DataState
  useSimulated: () => void
  live: Live
  setLive: (patch: Live) => void
}

const RuntimeCtx = createContext<Runtime | null>(null)

export function LabRuntime({ lab, children }: { lab: Lab; children: React.ReactNode }) {
  const [data, setData] = useState<DataState>({ status: 'loading' })
  const [source, setSource] = useState<'real' | 'simulado'>('real')
  const [live, setLiveState] = useState<Live>({})
  const setLive = useCallback((patch: Live) => setLiveState((l) => ({ ...l, ...patch })), [])

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
  const value = useMemo(() => ({ data, useSimulated, live, setLive }), [data, useSimulated, live, setLive])
  return <RuntimeCtx.Provider value={value}>{children}</RuntimeCtx.Provider>
}

export function useLabRuntime(): Runtime {
  const v = useContext(RuntimeCtx)
  if (!v) throw new Error('useLabRuntime fora do LabRuntime')
  return v
}

/** Lab-wide live values, typed by the lab. */
export function useLive<T extends Live>(): [Partial<T>, (patch: Partial<T>) => void] {
  const { live, setLive } = useLabRuntime()
  return [live as Partial<T>, setLive as (patch: Partial<T>) => void]
}

// ------------------------------------------------------------ Palco contínuo

/**
 * A lab may own one continuous Palco: a single instrument mounted for the
 * whole lab, outside the Etapa transitions. It morphs from one Etapa (and
 * Cena) to the next instead of being replaced, so animations flow into each
 * other. Etapas then render only Legenda + Controles (StepFrame does this
 * automatically) and talk to the Palco through answers and live values.
 */
export interface StageProps {
  lab: Lab
  stepId: string
  stepIndex: number
  scene: number
  answers: Record<string, unknown>
  setAnswer: (key: string, value: unknown) => void
  live: Live
  setLive: (patch: Live) => void
}

export interface LabModule {
  steps: Record<string, React.ComponentType<StepProps>>
  Stage?: React.ComponentType<StageProps>
}

const ContinuousCtx = createContext(false)
export const ContinuousStage = ContinuousCtx.Provider

/**
 * The fixed, non-scrolling layout of an Etapa.
 * - Phone: Palco on top (fills the free space), then Legenda, then Controles.
 * - Desktop: Palco on the left, Legenda + Controles in a column on the right.
 * The Palco stays mounted across scenes; Legenda and Controles cross-fade.
 * In a lab with a continuous Palco, `stage` is ignored and only the text
 * column is rendered (the lab's Palco lives outside the Etapa).
 *
 * Voz: when narration is on, the Legenda of each Cena is read aloud (or
 * `narration`, when the on-screen text reads badly). `nudge` is a hint the
 * Vega offers if the student stays stuck on the same Cena for a while.
 */
export function StepFrame({
  lab,
  stepIndex,
  stage,
  caption,
  controls,
  scene = 0,
  narration,
  nudge,
}: {
  lab: Lab
  stepIndex: number
  stage?: React.ReactNode
  caption: React.ReactNode
  controls?: React.ReactNode
  scene?: number
  narration?: string
  nudge?: string
}) {
  const continuous = useContext(ContinuousCtx)
  const step = lab.steps[stepIndex]
  const id = `${lab.slug}/${step.id}/${scene}`
  const textRef = useRef<HTMLDivElement>(null)
  const { voice } = usePreferences()

  // Read the Legenda aloud once per Cena (not on every value change).
  useEffect(() => {
    if (!voice) return
    const t = setTimeout(() => {
      const text = narration ?? readableText(textRef.current)
      if (text.trim()) speak(text, id)
    }, 380)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, voice])

  const text = (
    <div className={cn('relative flex flex-col gap-3.5', continuous ? 'h-full justify-start pt-1 lg:justify-center' : 'shrink-0 lg:justify-center', !stage && !continuous && 'flex-1 justify-center')}>
      <Nudge id={id} text={nudge} voice={voice} />
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: lab.accent }}>
          {stepLabel(step)} <span className="text-white/35">· {step.title}</span>
        </p>
        <VoiceButton id={id} textRef={textRef} narration={narration} />
      </div>
      <div hidden ref={textRef}>
        {caption}
      </div>
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
  )

  if (continuous) return text
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
      {text}
    </div>
  )
}

/** Speaker next to the Legenda: turns the voice on, replays, or stops it. */
function VoiceButton({ id, textRef, narration }: { id: string; textRef: React.RefObject<HTMLDivElement | null>; narration?: string }) {
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported(voiceSupported()), [])
  const { voice } = usePreferences()
  const narrator = useNarrator()
  const speakingHere = narrator.speaking && narrator.id?.startsWith(id)
  if (!supported) return null
  const read = () => {
    const text = narration ?? readableText(textRef.current)
    if (text.trim()) speak(text, id)
  }
  return (
    <button
      onClick={() => {
        haptic(6)
        if (speakingHere) return stopSpeaking()
        if (!voice) {
          unlockVoice()
          setPreferences({ voice: true })
          return // StepFrame's effect reads the Cena once the voice is on
        }
        read()
      }}
      aria-label={speakingHere ? 'Parar a voz da Vega' : voice ? 'Ouvir de novo' : 'Ouvir a Vega'}
      title={speakingHere ? 'Parar' : voice ? 'Ouvir de novo' : 'Ouvir a Vega'}
      className={cn(
        'focus-ring -my-2 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-[12px] transition active:scale-95',
        speakingHere ? 'bg-violet-400/15 text-violet-100' : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80',
      )}
    >
      <VegaOrb size={22} pulse={speakingHere} />
      {speakingHere ? <SoundBars /> : voice ? <RotateCcw className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
    </button>
  )
}

function SoundBars() {
  return (
    <span className="flex h-3.5 items-center gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-violet-200"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </span>
  )
}

const NUDGE_AFTER_MS = 18000

/** A hint from the Vega when the student stays on the same Cena for a while. */
function Nudge({ id, text, voice }: { id: string; text?: string; voice: boolean }) {
  const [shown, setShown] = useState<string | null>(null)
  useEffect(() => {
    setShown(null)
    if (!text) return
    const t = setTimeout(() => {
      setShown(text)
      haptic(8)
      if (voice) speak(text, `${id}/dica`)
    }, NUDGE_AFTER_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, text])
  return (
    <AnimatePresence>
      {shown && text && (
        <motion.button
          key={shown}
          onClick={() => setShown(null)}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.18 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="absolute inset-x-0 bottom-full z-20 mb-3 flex items-start gap-2.5 rounded-[20px] border border-violet-300/20 bg-[#0d0b18]/90 p-3 text-left text-[14px] leading-snug text-violet-50/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          aria-live="polite"
        >
          <VegaOrb size={26} />
          <span className="min-w-0 flex-1 pt-0.5">{text}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function Panel({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('relative h-full overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#06070c] lg:rounded-[28px]', className)}>
      {children}
    </div>
  )
}
