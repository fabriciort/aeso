'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, FlaskConical, House, Orbit } from 'lucide-react'
import { rise, spring, stagger } from '@/lib/motion'
import type { Route } from '@/lib/observatory/router'
import { updateProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { Button, Logo } from './ui'

// Boas-vindas: shown once, right after the first Abertura.

const PATHS: { route: Route; icon: typeof House; title: string; text: string; badge?: string }[] = [
  {
    route: { area: 'laboratorio', slug: 'exoplaneta' },
    icon: FlaskConical,
    title: 'Fazer meu primeiro laboratório',
    text: 'Encontre um exoplaneta com dados reais do telescópio TESS. Cerca de 20 minutos.',
    badge: 'Recomendado',
  },
  { route: { area: 'ceu' }, icon: Orbit, title: 'Explorar o céu', text: 'Busque galáxias, nebulosas e estrelas e veja tudo o que os telescópios observaram.' },
  { route: { area: 'inicio' }, icon: House, title: 'Conhecer o Observatório', text: 'Comece pelo Início e escolha com calma.' },
]

export default function Welcome({ onFinish }: { onFinish: (r: Route) => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  const finish = (r: Route) => {
    updateProgress((p) => ({ ...p, onboarded: true, name: name.trim() || p.name }))
    onFinish(r)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#030407]/70 px-4 py-10 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.form
              key="hello"
              variants={stagger(0.08, 0.15)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -16, filter: 'blur(8px)', transition: { duration: 0.3 } }}
              onSubmit={(e) => {
                e.preventDefault()
                setStep(1)
              }}
              className="text-center"
            >
              <motion.div variants={rise} className="mb-8 flex justify-center">
                <Logo size={56} glow />
              </motion.div>
              <motion.h1 variants={rise} className="text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[48px]">
                Boas-vindas ao Observatório.
              </motion.h1>
              <motion.p variants={rise} className="mx-auto mt-4 max-w-md text-balance text-[17px] leading-relaxed text-white/55">
                Aqui você aprende física e astronomia imaginando, testando e medindo com dados reais de telescópios.
              </motion.p>
              <motion.label variants={rise} className="mx-auto mt-10 block max-w-sm text-left">
                <span className="mb-2 block text-[13px] text-white/50">Como podemos te chamar? (opcional)</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="Seu nome"
                  className="focus-ring h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-[16px] text-white placeholder:text-white/25"
                />
              </motion.label>
              <motion.div variants={rise} className="mt-6">
                <Button size="lg" type="submit">
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              key="paths"
              variants={stagger(0.07, 0.1)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <motion.h2 variants={rise} className="text-center text-[32px] font-semibold tracking-[-0.035em] text-white sm:text-[40px]">
                {name.trim() ? `${name.trim()}, por onde começamos?` : 'Por onde começamos?'}
              </motion.h2>
              <div className="mt-8 space-y-3">
                {PATHS.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <motion.button
                      key={p.title}
                      variants={rise}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={spring.snappy}
                      onClick={() => finish(p.route)}
                      className={cn(
                        'focus-ring flex w-full items-start gap-4 rounded-[24px] border p-5 text-left transition-colors',
                        i === 0 ? 'border-amber-200/25 bg-amber-200/[0.06] hover:bg-amber-200/[0.1]' : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]',
                      )}
                    >
                      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', i === 0 ? 'bg-amber-200/15 text-amber-100' : 'bg-white/[0.06] text-white/70')}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[17px] font-medium text-white">{p.title}</span>
                          {p.badge && <span className="rounded-full bg-amber-200/15 px-2 py-0.5 text-[11px] text-amber-100">{p.badge}</span>}
                        </span>
                        <span className="mt-1 block text-[14px] leading-relaxed text-white/55">{p.text}</span>
                      </span>
                      <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-white/40" />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-10 flex justify-center gap-2">
          {[0, 1].map((i) => (
            <motion.span key={i} animate={{ width: step === i ? 22 : 6, opacity: step === i ? 1 : 0.35 }} className="h-1.5 rounded-full bg-white" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
