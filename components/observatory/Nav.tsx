'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FlaskConical, House, Orbit, Sigma, Sparkles } from 'lucide-react'
import { spring } from '@/lib/motion'
import { getLab, isMathLab } from '@/lib/labs/catalog'
import { useRouter, type Route } from '@/lib/observatory/router'
import { useVega } from '@/lib/observatory/vega-context'
import { cn } from '@/lib/utils'
import { Logo } from './ui'

const ITEMS: { area: 'inicio' | 'ceu' | 'laboratorios' | 'matematica'; label: string; icon: typeof House; route: Route }[] = [
  { area: 'inicio', label: 'Início', icon: House, route: { area: 'inicio' } },
  { area: 'ceu', label: 'Céu', icon: Orbit, route: { area: 'ceu' } },
  { area: 'laboratorios', label: 'Laboratórios', icon: FlaskConical, route: { area: 'laboratorios' } },
  { area: 'matematica', label: 'Matemática', icon: Sigma, route: { area: 'matematica' } },
]

function activeArea(r: Route) {
  if (r.area === 'laboratorio') return isMathLab(getLab(r.slug)) ? 'matematica' : 'laboratorios'
  if (r.area === 'aula') return 'matematica'
  return r.area
}

/** Desktop: slim rail on the left. */
export function Rail() {
  const { route, navigate } = useRouter()
  const { open, setOpen } = useVega()
  const active = activeArea(route)
  return (
    <nav aria-label="Áreas do Observatório" className="fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col items-center border-r border-white/[0.05] bg-[#030407]/70 py-5 backdrop-blur-2xl lg:flex">
      <Link href="/" className="focus-ring mb-8 rounded-full" aria-label="Site do AESo">
        <Logo size={30} />
      </Link>
      <ul className="flex flex-1 flex-col gap-2">
        {ITEMS.map((it) => {
          const Icon = it.icon
          const isActive = active === it.area
          return (
            <li key={it.area}>
              <button
                onClick={() => navigate(it.route)}
                aria-current={isActive ? 'page' : undefined}
                className={cn('focus-ring group relative flex w-[68px] flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors', isActive ? 'text-white' : 'text-white/45 hover:text-white/80')}
              >
                {isActive && <motion.span layoutId="rail-active" transition={spring.snappy} className="absolute inset-0 rounded-2xl bg-white/[0.08]" />}
                <Icon className="relative h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="relative text-[10.5px] font-medium">{it.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <button
        onClick={() => setOpen(!open)}
        aria-pressed={open}
        className={cn('focus-ring flex w-[68px] flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors', open ? 'bg-violet-400/15 text-violet-100' : 'text-white/45 hover:text-white/80')}
      >
        <VegaOrb size={22} />
        <span className="text-[10.5px] font-medium">Vega</span>
      </button>
    </nav>
  )
}

/** Mobile: bottom tab bar. Hidden inside a lab (focus mode). */
export function TabBar() {
  const { route, navigate } = useRouter()
  const { setOpen } = useVega()
  if (route.area === 'laboratorio' || route.area === 'aula') return null
  const active = activeArea(route)
  return (
    <nav aria-label="Áreas do Observatório" className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),10px)] z-40 lg:hidden">
      <ul className="glass-strong mx-auto flex max-w-md items-center justify-around rounded-[26px] px-2 py-1.5">
        {ITEMS.map((it) => {
          const Icon = it.icon
          const isActive = active === it.area
          return (
            <li key={it.area} className="flex-1">
              <button
                onClick={() => navigate(it.route)}
                aria-current={isActive ? 'page' : undefined}
                className={cn('focus-ring relative flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors', isActive ? 'text-white' : 'text-white/45')}
              >
                {isActive && <motion.span layoutId="tab-active" transition={spring.snappy} className="absolute inset-0 rounded-2xl bg-white/[0.08]" />}
                <Icon className="relative h-5 w-5" />
                <span className="relative text-[10.5px] font-medium">{it.label}</span>
              </button>
            </li>
          )
        })}
        <li className="flex-1">
          <button onClick={() => setOpen(true)} className="focus-ring flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 text-white/45">
            <VegaOrb size={20} />
            <span className="text-[10.5px] font-medium">Vega</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export function VegaOrb({ size = 24, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#a78bfa,#7dd3fc,#f0abfc,#a78bfa)]"
        animate={{ rotate: 360 }}
        transition={{ duration: pulse ? 2.5 : 8, repeat: Infinity, ease: 'linear' }}
      />
      <span className="absolute inset-[22%] rounded-full bg-[#0b0d14]" />
      <Sparkles className="relative text-white" style={{ width: size * 0.42, height: size * 0.42 }} />
    </span>
  )
}
