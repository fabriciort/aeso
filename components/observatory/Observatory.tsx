'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { viewTransition } from '@/lib/motion'
import { useImmersive } from '@/lib/observatory/immersive'
import { ObservatoryRouter, parseRoute, useRouter, type Route } from '@/lib/observatory/router'
import { VegaProvider } from '@/lib/observatory/vega-context'
import { useProgress } from '@/lib/progress'
import Starfield from '@/components/aeso/Starfield'
import { cn } from '@/lib/utils'
import Boot from './Boot'
import { Rail, TabBar } from './Nav'
import Vega from './Vega'
import Welcome from './Welcome'
import HomeView from './views/HomeView'
import LabsView from './views/LabsView'
import LabView from './views/LabView'
import MathView from './views/MathView'
import SkyView from './views/SkyView'

// The lesson player (and KaTeX with it) loads only when a lesson opens.
const AulaView = dynamic(() => import('./views/AulaView'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100svh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
    </div>
  ),
})

// O Observatório: one continuous environment. Areas swap in place with a
// crossfade; the URL follows along so links and back/forward work.

export default function Observatory({ path, search }: { path: string; search: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <ObservatoryRouter initial={parseRoute(path, search)}>
        <VegaProvider>
          <Shell />
        </VegaProvider>
      </ObservatoryRouter>
    </MotionConfig>
  )
}

type Stage = 'boot' | 'welcome' | 'ready'

function Shell() {
  const { route, navigate } = useRouter()
  const progress = useProgress()
  const [stage, setStage] = useState<Stage>('boot')

  const latest = useRef({ onboarded: progress.onboarded, area: route.area })
  latest.current = { onboarded: progress.onboarded, area: route.area }

  // After the Abertura, decide once whether to show Boas-vindas: first visit
  // only, and not when arriving through a deep link to a specific place.
  const onBooted = useCallback(() => {
    const { onboarded, area } = latest.current
    setStage(!onboarded && area === 'inicio' ? 'welcome' : 'ready')
  }, [])

  const key = route.area === 'laboratorio' ? `lab:${route.slug}` : route.area === 'aula' ? `aula:${route.id}` : route.area
  const fullscreen = route.area === 'laboratorio' || route.area === 'aula'
  const immersive = useImmersive()
  // Inside a lab in fullscreen the rail disappears: nothing but the lab.
  const focus = route.area === 'laboratorio' && immersive

  // Installable app (see app/manifest.ts): register the service worker.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <div style={{ '--rail': focus ? '0px' : '84px' } as React.CSSProperties}>
      <Starfield dimmed={fullscreen || route.area === 'ceu'} />
      <AnimatePresence>{stage === 'boot' && <Boot key="boot" onDone={onBooted} />}</AnimatePresence>
      <AnimatePresence>
        {stage === 'welcome' && (
          <Welcome
            key="welcome"
            onFinish={(r: Route) => {
              setStage('ready')
              navigate(r, { replace: true })
            }}
          />
        )}
      </AnimatePresence>

      {!focus && <Rail />}
      <TabBar />
      <main className={cn('min-h-dvh px-4 sm:px-6 lg:pr-10', fullscreen ? 'pb-0 pt-0' : 'pb-28 pt-3 lg:pb-10', focus ? 'lg:pl-10' : 'lg:pl-[calc(84px+40px)]')}>
        <AnimatePresence mode="wait" initial={false}>
          {stage !== 'boot' && (
            <motion.div key={key} variants={viewTransition} initial="initial" animate="enter" exit="exit">
              {route.area === 'inicio' && <HomeView />}
              {route.area === 'ceu' && <SkyView />}
              {route.area === 'laboratorios' && <LabsView />}
              {route.area === 'matematica' && <MathView />}
              {route.area === 'laboratorio' && <LabView slug={route.slug} stepId={route.step} />}
              {route.area === 'aula' && <AulaView id={route.id} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Vega />
    </div>
  )
}
