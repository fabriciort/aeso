'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock, Lock } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { TRACKS, type Track } from '@/lib/labs/math'
import type { Lab } from '@/lib/labs/types'
import { rise, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { useProgress, type LabProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { LabCover } from '@/components/labs/LabCover'
import { Tex } from '@/components/math/Tex'

// Matemática: the trilhas, from matemática básica to Cálculo 4, drawn as one
// path. Each trilha is a stop on the path; its laboratórios scroll sideways.

export default function MathView() {
  const { navigate } = useRouter()
  const progress = useProgress()
  useVegaScreen({ state: 'Trilhas de Matemática: básica, ensino médio, pré-cálculo e Cálculo 1 a 4.' })

  const all = TRACKS.flatMap((t) => t.labs.map((s) => getLab(s)).filter((l): l is Lab => Boolean(l)))
  const resume = all.find((l) => l.status === 'disponivel' && progress.labs[l.slug] && !progress.labs[l.slug].completedAt)

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-6xl pb-16 pt-4">
      <motion.header variants={rise} className="relative">
        <p className="eyebrow">Matemática</p>
        <h1 className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
          Veja a matemática acontecer.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/55">
          Da balança à equação diferencial: você mexe, prevê, erra, entende, e só depois a fórmula aparece, como resumo do que você já viu.
        </p>
        <div className="pointer-events-none absolute -top-2 right-0 hidden select-none text-[28px] text-white/[0.13] lg:block">
          <Tex>{'\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)'}</Tex>
        </div>
      </motion.header>

      {resume && (
        <motion.button
          variants={rise}
          onClick={() => navigate({ area: 'laboratorio', slug: resume.slug })}
          className="focus-ring group mt-8 flex w-full items-center gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-3 pr-5 text-left transition hover:border-white/20"
        >
          <LabCover lab={resume} className="h-16 w-20 shrink-0 rounded-[16px]" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow" style={{ color: resume.accent }}>
              Continue de onde parou
            </p>
            <p className="mt-1 truncate text-[16px] font-medium text-white">{resume.title}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </motion.button>
      )}

      <ol className="relative mt-10">
        {TRACKS.map((track, i) => (
          <TrackStop key={track.id} track={track} index={i} last={i === TRACKS.length - 1} labs={progress.labs} onOpen={(slug) => navigate({ area: 'laboratorio', slug })} />
        ))}
      </ol>
    </motion.div>
  )
}

function TrackStop({
  track,
  index,
  last,
  labs,
  onOpen,
}: {
  track: Track
  index: number
  last: boolean
  labs: Record<string, LabProgress>
  onOpen: (slug: string) => void
}) {
  const items = track.labs.map((s) => getLab(s)).filter((l): l is Lab => Boolean(l))
  const done = items.filter((l) => labs[l.slug]?.completedAt).length
  const ready = items.filter((l) => l.status === 'disponivel').length
  return (
    <motion.li variants={rise} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 pb-10 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-x-6">
      {/* The path */}
      {!last && (
        <span
          aria-hidden
          className="absolute left-[19.5px] top-11 h-[calc(100%-36px)] w-px sm:left-[23.5px]"
          style={{ background: `linear-gradient(${track.accent}, ${TRACKS[index + 1].accent})`, opacity: 0.35 }}
        />
      )}
      <span
        className="relative z-10 grid h-10 w-10 place-items-center rounded-full border text-[15px] font-semibold tabular-nums sm:h-12 sm:w-12"
        style={{ borderColor: `${track.accent}66`, background: `${track.accent}1a`, color: track.accent, boxShadow: `0 0 24px ${track.accent}22` }}
      >
        {done && done === items.length ? <Check className="h-5 w-5" /> : index + 1}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white sm:text-[28px]">{track.title}</h2>
          <span className="text-[13px] text-white/45">{track.level}</span>
        </div>
        <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/55">{track.promise}</p>
        <p className="mt-2 text-[12px] tabular-nums text-white/35">
          {ready ? `${ready} de ${items.length} laboratórios prontos` : 'Em produção'}
          {done > 0 && ` · ${done} concluído${done > 1 ? 's' : ''}`}
        </p>

        <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {items.map((lab) => (
            <LabCard key={lab.slug} lab={lab} p={labs[lab.slug]} onOpen={() => onOpen(lab.slug)} />
          ))}
        </div>
      </div>
    </motion.li>
  )
}

function LabCard({ lab, p, onOpen }: { lab: Lab; p?: LabProgress; onOpen: () => void }) {
  const available = lab.status === 'disponivel'
  const done = Boolean(p?.completedAt)
  const pct = p && lab.steps.length ? Math.round(((p.reached + 1) / lab.steps.length) * 100) : 0
  return (
    <button
      onClick={onOpen}
      className={cn(
        'focus-ring group w-[78%] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[24px] border text-left transition duration-500 sm:w-auto sm:max-w-none',
        available ? 'border-white/[0.09] bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20' : 'border-white/[0.05] bg-white/[0.015]',
      )}
    >
      <div className="relative">
        <LabCover lab={lab} big={available} className={cn('aspect-[16/10] w-full', !available && 'opacity-45 saturate-50')} />
        {p && available && !done && (
          <span className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/15">
            <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: lab.accent }} />
          </span>
        )}
      </div>
      <div className="p-4">
        <p className={cn('text-[16px] font-medium leading-snug', available ? 'text-white' : 'text-white/60')}>{lab.title}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/45">{lab.subtitle}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[12px]" style={{ color: available ? lab.accent : undefined }}>
          {done ? (
            <>
              <Check className="h-3.5 w-3.5" /> Concluído
            </>
          ) : available ? (
            <>
              <Clock className="h-3.5 w-3.5" /> {lab.minutes} min{p ? ` · ${pct}%` : ''}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-white/35">
              <Lock className="h-3 w-3" /> Em breve
            </span>
          )}
        </p>
      </div>
    </button>
  )
}
