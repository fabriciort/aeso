'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Sparkles, X } from 'lucide-react'

type SiteHeaderProps = {
  onExplore?: () => void
}

const navigation = [
  { name: 'Início', href: '#top' },
  { name: 'Catálogos', href: '#catalogs' },
  { name: 'Tecnologia', href: '#roadmap' },
  { name: 'Documentação', href: 'https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html' }
]

export default function SiteHeader({ onExplore }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleExplore = () => {
    setIsMenuOpen(false)
    onExplore?.()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3 text-slate-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">AESo</span>
            <p className="font-semibold">MAST Discovery</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition-colors hover:text-emerald-300"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={handleExplore}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-300 hover:text-white"
          >
            Explorar agora
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-emerald-300 hover:text-emerald-200 md:hidden"
          aria-label="Alternar menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/5 bg-slate-950/95 px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5 hover:text-emerald-200"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleExplore}
              className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-left font-medium text-emerald-100 transition hover:border-emerald-300 hover:text-white"
            >
              Explorar agora
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
