'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { LABS } from '@/lib/labs/catalog'
import { rise, stagger } from '@/lib/motion'
import { useRouter } from '@/lib/observatory/router'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { useProgress } from '@/lib/progress'
import { LabCover } from '@/components/labs/LabCover'

export default function LabsView() {
  const { navigate } = useRouter()
  const progress = useProgress()
  useVegaScreen({ state: 'Catálogo de laboratórios.' })
  const available = LABS.filter((l) => l.status === 'disponivel')
  const soon = LABS.filter((l) => l.status !== 'disponivel')

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-12 pb-16 pt-4">
      <motion.header variants={rise}>
        <p className="eyebrow">Laboratórios</p>
        <h1 className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
          Aprenda fazendo ciência.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/55">
          Cada laboratório começa num cenário que você controla e termina com uma medida em dados reais de telescópios.
        </p>
      </motion.header>

      <motion.section variants={rise} className="space-y-4">
        {available.map((lab) => {
          const p = progress.labs[lab.slug]
          const done = Boolean(p?.completedAt)
          const pct = p ? Math.round(((p.reached + 1) / lab.steps.length) * 100) : 0
          return (
            <button
              key={lab.slug}
              onClick={() => navigate({ area: 'laboratorio', slug: lab.slug })}
              className="focus-ring group grid w-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] text-left transition duration-500 hover:border-white/20 hover:bg-white/[0.04] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
            >
              <LabCover lab={lab} className="aspect-[16/10] w-full md:aspect-auto md:min-h-[320px]" big />
              <div className="flex flex-col justify-between gap-8 p-7 sm:p-9">
                <div>
                  <p className="eyebrow" style={{ color: lab.accent }}>
                    {lab.area} · {lab.level === 'Todos' ? 'Todos os níveis' : lab.level}
                  </p>
                  <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[34px]">{lab.title}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-white/60">{lab.subtitle}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {lab.concepts.map((c) => (
                      <span key={c} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[12px] text-white/55">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-white/45">
                    <Clock className="h-3.5 w-3.5" /> {lab.minutes} min
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-black transition group-hover:gap-3">
                    {done ? (
                      <>
                        <Check className="h-4 w-4" /> Rever
                      </>
                    ) : p ? (
                      <>Continuar · {pct}%</>
                    ) : (
                      <>Começar</>
                    )}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </motion.section>

      <motion.section variants={rise} className="space-y-4">
        <h3 className="text-[15px] font-medium text-white/70">Em breve</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {soon.map((lab) => (
            <button
              key={lab.slug}
              onClick={() => navigate({ area: 'laboratorio', slug: lab.slug })}
              className="focus-ring group overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.02] text-left transition duration-500 hover:-translate-y-0.5 hover:border-white/15"
            >
              <LabCover lab={lab} className="aspect-[4/3] w-full opacity-80 transition group-hover:opacity-100" />
              <div className="p-4">
                <p className="text-[15px] font-medium text-white">{lab.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/45">{lab.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}

