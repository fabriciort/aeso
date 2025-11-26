'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Eye, ExternalLink } from 'lucide-react'

interface AstroViewProps {
  target: string
  coordinates?: { ra: number; dec: number }
  defaultView?: 'sky' | 'portal'
  onClose: () => void
}

function buildAstroViewUrl(target: string, coordinates?: { ra: number; dec: number }, options?: { radius?: string; hips?: string }) {
  const baseUrl = 'https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html'
  const params = new URLSearchParams({
    radius: options?.radius ?? '0.3',
    hips: options?.hips ?? 'DSS2 Color'
  })

  if (coordinates) {
    params.set('ra', String(coordinates.ra))
    params.set('dec', String(coordinates.dec))
  } else {
    params.set('search', target)
  }

  return `${baseUrl}?${params.toString()}`
}

function buildPortalUrl(target: string) {
  return `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${encodeURIComponent(target)}`
}

export default function AstroView({ target, coordinates, defaultView = 'sky', onClose }: AstroViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'sky' | 'portal'>(defaultView)

  const targetLabel = useMemo(() => {
    if (!coordinates) return target
    const { ra, dec } = coordinates
    return `${target} (RA ${ra.toFixed(4)}, Dec ${dec.toFixed(4)})`
  }, [coordinates, target])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    setIsLoading(true)

    const url = view === 'sky'
      ? buildAstroViewUrl(target, coordinates)
      : buildPortalUrl(target)

    iframe.src = url

    const handleLoad = () => setIsLoading(false)
    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [coordinates, target, view])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-4 md:inset-10 bg-zinc-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-800 border-b border-zinc-700/70">
          <div>
            <p className="text-sm text-zinc-400">Visualizando</p>
            <h2 className="text-lg font-semibold text-neutral-100">{targetLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('sky')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors border ${view === 'sky' ? 'bg-green-600 text-white border-green-500' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
            >
              <Eye size={16} /> AstroView
            </button>
            <button
              onClick={() => setView('portal')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors border ${view === 'portal' ? 'bg-green-600 text-white border-green-500' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
            >
              <ExternalLink size={16} /> MAST Portal
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-200 hover:bg-zinc-700 rounded-full transition-colors"
              aria-label="Close viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-lg animate-pulse">Carregando {view === 'sky' ? 'AstroView' : 'MAST Portal'}...</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title={view === 'sky' ? 'AstroView sky viewer' : 'MAST portal viewer'}
            sandbox="allow-scripts allow-same-origin allow-forms"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  )
}
