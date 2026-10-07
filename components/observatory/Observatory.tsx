'use client'

import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { viewTransition } from '@/lib/motion'
import { ObservatoryRouter, parseRoute, useRouter, type Route } from '@/lib/observatory/router'
import { VegaProvider } from '@/lib/observatory/vega-context'
import { useProgress } from '@/lib/progress'
import Starfield from '@/components/aeso/Starfield'
import Boot from './Boot'
import { Rail, TabBar } from './Nav'
import Vega from './Vega'
import Welcome from './Welcome'
import HomeView from './views/HomeView'
import LabsView from './views/LabsView'
import LabView from './views/LabView'
import SkyView from './views/SkyView'

// O Observatório: one continuous environment. Areas swap in place with a
// crossfade; the URL follows along so links and back/forward work.

export default function Observatory({ path, search }: { path: string; search: string }) {
  return (
    <ObservatoryRouter initial={parseRoute(path, search)}>
      <VegaProvider>
        <Shell />
      </VegaProvider>
    </ObservatoryRouter>
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

  const key = route.area === 'laboratorio' ? `lab:${route.slug}` : route.area

  return (
    <>
      <Starfield dimmed={route.area === 'laboratorio' || route.area === 'ceu'} />
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

      <Rail />
      <TabBar />
      <main className="min-h-dvh px-4 pb-28 pt-3 sm:px-6 lg:pb-10 lg:pl-[calc(84px+40px)] lg:pr-10">
        <AnimatePresence mode="wait" initial={false}>
          {stage !== 'boot' && (
            <motion.div key={key} variants={viewTransition} initial="initial" animate="enter" exit="exit">
              {route.area === 'inicio' && <HomeView />}
              {route.area === 'ceu' && <SkyView />}
              {route.area === 'laboratorios' && <LabsView />}
              {route.area === 'laboratorio' && <LabView slug={route.slug} stepId={route.step} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Vega />
    </>
  )
}
