'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Orbit, Sparkles } from 'lucide-react'

type HeroSectionProps = {
  onExplore?: () => void
}

const stats = [
  { label: 'Catálogos integrados', value: '125+' },
  { label: 'Objetos indexados', value: '1.5B+' },
  { label: 'Atualizações diárias', value: '320K' }
]

export default function HeroSection({ onExplore }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-900/10 p-10 shadow-2xl"
    >
      <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative grid gap-10 lg:grid-cols-[1.4fr,1fr]"
      >
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            <Sparkles className="h-4 w-4" />
            Nova geração de exploração astronômica
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Uma central moderna para navegar pelo MAST e pelo cosmos
            </h1>
            <p className="text-lg text-slate-300">
              Unimos dados, visualizações e ferramentas avançadas para acelerar descobertas. Pesquise, investigue e colete informações de missões históricas e observações de ponta em uma experiência fluida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Iniciar exploração
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#roadmap"
              className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Ver roadmap
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent)]" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200">
                <Orbit className="h-4 w-4" />
                Destaque científico
              </span>
              <span className="text-xs text-slate-400">Atualizado em tempo real</span>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-white">Galáxia de Andrômeda (M31)</p>
              <p className="text-sm text-slate-300">
                Construa catálogos personalizados combinando exposições do HST, JWST e telescópios terrestres. Compare espectros, anote regiões de interesse e sincronize com sua pipeline científica.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200">RA</dt>
                <dd className="font-medium">00h 42m 44.3s</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200">Dec</dt>
                <dd className="font-medium">+41° 16′ 9″</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200">Magnitude</dt>
                <dd className="font-medium">3.4 (V)</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200">Distância</dt>
                <dd className="font-medium">2.54 Mly</dd>
              </div>
            </dl>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
