'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { FAMOUS_OBJECTS } from '@/lib/astro/catalog'
import { LABS } from '@/lib/labs/catalog'
import { rise, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { useProgress } from '@/lib/progress'
import SkyThumb from '@/components/aeso/SkyThumb'
import { LabCover } from '@/components/labs/LabCover'

// Coordinates for the "objeto do dia" rotation (subset of FAMOUS_OBJECTS).
const DAILY: Record<string, { ra: number; dec: number; fov: number }> = {
  M51: { ra: 202.4696, dec: 47.1952, fov: 0.32 },
  M42: { ra: 83.8221, dec: -5.3911, fov: 1.1 },
  M16: { ra: 274.7, dec: -13.8069, fov: 0.6 },
  M31: { ra: 10.6847, dec: 41.2687, fov: 3.2 },
  M104: { ra: 189.9976, dec: -11.6231, fov: 0.2 },
  M57: { ra: 283.3963, dec: 33.0292, fov: 0.06 },
  M1: { ra: 83.6331, dec: 22.0145, fov: 0.2 },
  'NGC 5139': { ra: 201.6968, dec: -47.4795, fov: 0.9 },
  'NGC 3372': { ra: 161.265, dec: -59.6845, fov: 2.2 },
  M101: { ra: 210.8023, dec: 54.3489, fov: 0.5 },
}

function greeting(h: number) {
  if (h < 5) return 'Boa noite'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function HomeView() {
  const { navigate } = useRouter()
  const progress = useProgress()
  const [q, setQ] = useState('')
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])
  useVegaScreen({ state: 'Início do Observatório.' })

  const inProgress = LABS.find((l) => progress.labs[l.slug] && !progress.labs[l.slug].completedAt && l.status === 'disponivel')
  const first = LABS.find((l) => l.status === 'disponivel')!
  const featuredLab = inProgress ?? first
  const lp = progress.labs[featuredLab.slug]
  const pct = lp ? Math.round(((lp.reached + 1) / featuredLab.steps.length) * 100) : 0

  const ids = Object.keys(DAILY)
  const dayIndex = now ? Math.floor(now.getTime() / 86_400_000) % ids.length : 0
  const dailyId = ids[dayIndex]
  const daily = FAMOUS_OBJECTS.find((o) => o.id === dailyId)!
  const dailyPos = DAILY[dailyId]

  return (
    <motion.div variants={stagger(0.06, 0.05)} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-10 pb-16 pt-4">
      <motion.header variants={rise}>
        <p className="eyebrow">{now ? now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : ' '}</p>
        <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
          {now ? greeting(now.getHours()) : 'Olá'}
          {progress.name ? `, ${progress.name}` : ''}.
        </h1>
      </motion.header>

      <motion.form
        variants={rise}
        onSubmit={(e) => {
          e.preventDefault()
          if (q.trim()) navigate({ area: 'ceu', q: q.trim() })
        }}
        className="glass-strong flex h-14 items-center gap-3 rounded-[22px] pl-5 pr-2"
      >
        <Search className="h-[18px] w-[18px] text-white/45" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque no céu: M51, Pilares da Criação, WASP-121…"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/30 focus:outline-none"
          aria-label="Buscar no céu"
        />
        <button type="submit" disabled={!q.trim()} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-black transition active:scale-95 disabled:bg-white/10 disabled:text-white/30" aria-label="Buscar">
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.form>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <motion.button
          variants={rise}
          onClick={() => navigate({ area: 'laboratorio', slug: featuredLab.slug })}
          className="focus-ring group relative overflow-hidden rounded-[32px] border border-white/[0.08] text-left"
        >
          <LabCover lab={featuredLab} big className="absolute inset-y-0 right-0 h-full w-full transition-transform duration-1000 group-hover:scale-[1.03] sm:w-[68%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-[#05060b] sm:via-[#05060b]/80 sm:to-transparent" />
          <div className="relative flex min-h-[340px] flex-col justify-end p-7">
            <p className="eyebrow" style={{ color: featuredLab.accent }}>
              {inProgress ? 'Continue de onde parou' : 'Seu primeiro laboratório'}
            </p>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-white">{featuredLab.title}</h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/65">{featuredLab.subtitle}</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-black transition group-hover:gap-3">
                {inProgress ? `Continuar · ${pct}%` : 'Começar'} <ArrowRight className="h-4 w-4" />
              </span>
              {inProgress && (
                <span className="h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: featuredLab.accent }} />
                </span>
              )}
            </div>
          </div>
        </motion.button>

        <motion.button
          variants={rise}
          onClick={() => navigate({ area: 'ceu', q: daily.id })}
          className="focus-ring group relative overflow-hidden rounded-[32px] border border-white/[0.08] text-left"
        >
          <SkyThumb ra={dailyPos.ra} dec={dailyPos.dec} fov={dailyPos.fov} size={512} className="absolute inset-0 h-full w-full transition-transform duration-1000 group-hover:scale-[1.05]" alt={daily.names[0]} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="relative flex min-h-[340px] flex-col justify-end p-7">
            <p className="eyebrow !text-white/60">Objeto do dia</p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">{daily.names[0]}</h2>
            <p className="mt-1 text-[14px] text-white/55">
              {daily.type} · {daily.id}
            </p>
          </div>
        </motion.button>
      </div>

      {progress.recentSearches.length > 0 && (
        <motion.section variants={rise}>
          <p className="eyebrow mb-3">Buscas recentes</p>
          <div className="flex flex-wrap gap-2">
            {progress.recentSearches.map((s) => (
              <button key={s} onClick={() => navigate({ area: 'ceu', q: s })} className="chip focus-ring">
                {s}
              </button>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={rise}>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-white">Laboratórios</h3>
          <button onClick={() => navigate({ area: 'laboratorios' })} className="text-[14px] text-white/50 hover:text-white">
            Ver todos
          </button>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
          {LABS.map((l) => (
            <button
              key={l.slug}
              onClick={() => navigate({ area: 'laboratorio', slug: l.slug })}
              className="focus-ring w-[200px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.02] text-left transition hover:-translate-y-0.5 hover:border-white/15 sm:w-auto"
            >
              <LabCover lab={l} className="aspect-[4/3] w-full" />
              <div className="p-3.5">
                <p className="line-clamp-1 text-[14px] font-medium text-white">{l.title}</p>
                <p className="mt-0.5 text-[12px] text-white/40">{l.status === 'disponivel' ? `${l.minutes} min` : 'Em breve'}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
