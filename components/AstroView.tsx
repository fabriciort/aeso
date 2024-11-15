'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface AstroViewProps {
  target: string
  onClose: () => void
}

export default function AstroView({ target, onClose }: AstroViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)
    
    const mastUrl = `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${encodeURIComponent(target)}`
    iframe.src = mastUrl

    const handleLoad = () => {
      setIsLoading(false)
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [target])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-4 md:inset-16 bg-zinc-900 rounded-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 bg-zinc-800">
          <h2 className="text-neutral-200 font-semibold">MAST Viewer - {target}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
            aria-label="Close viewer"
          >
            <X className="text-neutral-300" size={20} />
          </button>
        </div>
        {/* iframe */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-xl animate-pulse">Loading MAST Portal...</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="MAST Portal"
            sandbox="allow-scripts allow-same-origin allow-forms"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  )
} 