'use client'

import { useCallback, useRef } from 'react'

import ExplorerConsole, { type ExplorerConsoleHandle } from '@/components/search/ExplorerConsole'
import DiscoveryShowcase from '@/components/sections/DiscoveryShowcase'
import HeroSection from '@/components/sections/Hero'
import HighlightsSection from '@/components/sections/Highlights'
import ObservatoryRoadmap from '@/components/sections/ObservatoryRoadmap'
import SiteHeader from '@/components/layout/SiteHeader'

export default function MainView() {
  const explorerHandleRef = useRef<ExplorerConsoleHandle>(null)
  const explorerSectionRef = useRef<HTMLDivElement>(null)

  const handleExplore = useCallback(() => {
    explorerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      explorerHandleRef.current?.focusInput()
    }, 400)
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_55%)] bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.06),_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10">
        <SiteHeader onExplore={handleExplore} />

        <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-16 md:px-10">
          <HeroSection onExplore={handleExplore} />

          <div ref={explorerSectionRef}>
            <ExplorerConsole ref={explorerHandleRef} />
          </div>

          <HighlightsSection />
          <DiscoveryShowcase />
          <ObservatoryRoadmap />
        </main>

        <footer className="border-t border-white/5 bg-black/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© {currentYear} AESo • Explorador Astronômico. Licenças MIT / CC BY-SA.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html"
                className="transition hover:text-emerald-200"
              >
                MAST Portal
              </a>
              <a
                href="https://www.stsci.edu"
                className="transition hover:text-emerald-200"
              >
                STScI
              </a>
              <a
                href="https://github.com/fabriciort/aeso"
                className="transition hover:text-emerald-200"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
