'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, ChevronUp, ExternalLink, Settings, Compass, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getObjectData, type ObjectData } from '@/lib/mast'

type SearchMode = 'default' | 'loading' | 'results'
type DataPackage = {
  id: string
  title: string
  type: string
  size: string
  date: string
}

export type SearchAction = 'search' | 'astroview' | 'portal' | 'help'

export type SearchResultPayload = {
  term: string
  objectData: ObjectData | null
  action: SearchAction
}

interface MetamorphicSearchBarProps {
  onSearchResult?: (payload: SearchResultPayload | null) => void
}

function AstroViewEmbed({ target, ra, dec, hips, radius }: { target: string; ra?: number; dec?: number; hips: string; radius: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)

    const baseUrl = 'https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html'
    const hasCoords = typeof ra === 'number' && typeof dec === 'number'
    const params = new URLSearchParams({
      radius,
      hips
    })

    if (hasCoords) {
      params.set('ra', String(ra))
      params.set('dec', String(dec))
    } else {
      params.set('search', target)
    }

    const astroViewUrl = `${baseUrl}?${params.toString()}`
    iframe.src = astroViewUrl

    const handleLoad = () => {
      setIsLoading(false)
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [target, ra, dec, hips, radius])

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-xl animate-pulse">Carregando visualização...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full absolute inset-0 rounded-lg"
        title="AstroView"
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}

function MastPortal({ target, onClose }: { target: string; onClose: () => void }) {
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
          <h2 className="text-neutral-200 font-semibold">MAST Portal - {target}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
            aria-label="Close viewer"
          >
            <X className="text-neutral-300" size={20} />
          </button>
        </div>
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

function parseCommand(input: string): { action: SearchAction; term: string } {
  const trimmed = input.trim()
  if (trimmed.toLowerCase().startsWith('/astro ')) {
    return { action: 'astroview', term: trimmed.slice(7).trim() }
  }
  if (trimmed.toLowerCase().startsWith('astro:')) {
    return { action: 'astroview', term: trimmed.slice(6).trim() }
  }
  if (trimmed.toLowerCase().startsWith('/portal ')) {
    return { action: 'portal', term: trimmed.slice(8).trim() }
  }
  if (trimmed.toLowerCase().startsWith('portal:')) {
    return { action: 'portal', term: trimmed.slice(7).trim() }
  }
  if (trimmed === '/help' || trimmed === 'help') {
    return { action: 'help', term: '' }
  }
  return { action: 'search', term: trimmed }
}

export default function MetamorphicSearchBar({ onSearchResult }: MetamorphicSearchBarProps) {
  const [mode, setMode] = useState<SearchMode>('default')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [objectData, setObjectData] = useState<ObjectData | null>(null)
  const [showMastPortal, setShowMastPortal] = useState(false)
  const [lastPayload, setLastPayload] = useState<SearchResultPayload | null>(null)
  const [hipsLayer, setHipsLayer] = useState('DSS2 Color')
  const [radius, setRadius] = useState('0.3')

  const commandInfo = parseCommand(searchTerm)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm) return

    const { action, term } = parseCommand(searchTerm)
    if (action === 'help') {
      setMode('results')
      setObjectData(null)
      const payload: SearchResultPayload = { action, term: 'help', objectData: null }
      setLastPayload(payload)
      onSearchResult?.(payload)
      return
    }

    setMode('loading')
    try {
      const data = await getObjectData(term)
      setObjectData(data)
      const payload: SearchResultPayload = { term, objectData: data, action }
      setLastPayload(payload)
      onSearchResult?.(payload)
      if (action === 'portal') {
        setShowMastPortal(true)
      }
    } catch (error) {
      console.error(error)
      setObjectData(null)
      const payload: SearchResultPayload = { term, objectData: null, action }
      setLastPayload(payload)
      onSearchResult?.(payload)
    }
    setMode('results')
  }

  const togglePackage = (id: string) => {
    setExpandedPackage(expandedPackage === id ? null : id)
  }

  const openViewer = (action: SearchAction) => {
    if (!lastPayload) return
    const payload = { ...lastPayload, action }
    onSearchResult?.(payload)
    if (action === 'portal') setShowMastPortal(true)
  }

  const mockDataPackages: DataPackage[] = [
    { id: '1', title: 'HST/ACS Observation', type: 'FITS', size: '2.3 GB', date: '2024-01-15' },
    { id: '2', title: 'JWST Spectral Data', type: 'FITS', size: '1.8 GB', date: '2024-01-14' },
    { id: '3', title: 'Radio Observations', type: 'FITS', size: '3.1 GB', date: '2024-01-13' },
  ]

  const renderCommandHint = () => {
    if (commandInfo.action === 'astroview') {
      return 'Comando: abrir AstroView focado no alvo informado'
    }
    if (commandInfo.action === 'portal') {
      return 'Comando: abrir portal MAST com este termo'
    }
    if (commandInfo.action === 'help') {
      return 'Comando: ver ajuda e exemplos de meta busca'
    }
    return 'Digite um objeto ou use comandos: /astro, /portal, help'
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        layout
        className="relative bg-white/70 dark:bg-zinc-800/50
                   backdrop-blur-md rounded-2xl
                   shadow-lg dark:shadow-zinc-900/20
                   border border-zinc-200/60 dark:border-zinc-700/30
                   transition-colors duration-200"
        animate={{ height: mode === 'default' ? 'auto' : '85vh' }}
      >
        <form
          onSubmit={handleSearch}
          className="flex items-center p-4 border-b
                         border-zinc-200/60 dark:border-zinc-700/30
                         bg-white/60 dark:bg-transparent rounded-t-2xl"
        >
          <Search className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busque objetos, comandos ou abra ferramentas..."
            className="w-full px-4 py-2 bg-transparent
                       text-zinc-800 dark:text-zinc-100
                       placeholder-zinc-500 dark:placeholder-zinc-500
                       focus:outline-none transition-colors duration-200"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setMode('default')
                setObjectData(null)
                setLastPayload(null)
                onSearchResult?.(null)
              }}
              className="text-zinc-400 hover:text-zinc-600
                         dark:text-zinc-500 dark:hover:text-zinc-300
                         transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </form>

        <div className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
            <Sparkles size={16} /> {renderCommandHint()}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">/astro Vega</span>
            <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">/portal NGC 1300</span>
            <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">help</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              </div>
            </motion.div>
          )}

          {mode === 'results' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-200">{lastPayload?.term}</h2>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
                    {commandInfo.action === 'help' ? (
                      <div className="space-y-2">
                        <p>Use a MetaSearch como uma linha de comando:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>/astro &lt;objeto&gt;</strong> abre o AstroView focado no alvo.</li>
                          <li><strong>/portal &lt;objeto&gt;</strong> abre o Portal MAST para esse termo.</li>
                          <li><strong>help</strong> mostra esta ajuda rápida.</li>
                        </ul>
                      </div>
                    ) : objectData ? (
                      <>
                        {objectData.coordinates && (
                          <>
                            <p>RA: {objectData.coordinates.ra_str}</p>
                            <p>Dec: {objectData.coordinates.dec_str}</p>
                          </>
                        )}
                        {objectData.distance && <p>Distance: {objectData.distance}</p>}
                        {objectData.magnitude && <p>Magnitude: {objectData.magnitude}</p>}
                      </>
                    ) : (
                      <p>Objeto não encontrado.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2 shadow disabled:bg-zinc-500"
                      disabled={!lastPayload || lastPayload.action === 'help'}
                      onClick={() => openViewer('astroview')}
                    >
                      <Compass className="w-4 h-4" /> Abrir AstroView
                    </button>
                    <button
                      className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 flex items-center gap-2 shadow disabled:bg-zinc-500"
                      disabled={!lastPayload || lastPayload.action === 'help'}
                      onClick={() => openViewer('portal')}
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir Portal MAST
                    </button>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/30 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Refinar visualização</p>
                    <div className="flex flex-wrap gap-3 items-center text-sm">
                      <label className="flex items-center gap-2">
                        <span className="text-zinc-600 dark:text-zinc-300">HIPS:</span>
                        <select
                          value={hipsLayer}
                          onChange={(e) => setHipsLayer(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1"
                        >
                          <option>DSS2 Color</option>
                          <option>2MASS J</option>
                          <option>GALEX Near UV</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2">
                        <span className="text-zinc-600 dark:text-zinc-300">Raio:</span>
                        <select
                          value={radius}
                          onChange={(e) => setRadius(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1"
                        >
                          <option value="0.2">0.2°</option>
                          <option value="0.3">0.3°</option>
                          <option value="0.5">0.5°</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="aspect-square bg-white dark:bg-black rounded-lg relative overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                  <div className="absolute top-2 right-2 z-10 flex space-x-2">
                    <button className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700">
                      <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-200" />
                    </button>
                  </div>
                  <AstroViewEmbed
                    target={lastPayload?.term ?? searchTerm}
                    ra={objectData?.ra}
                    dec={objectData?.dec}
                    hips={hipsLayer}
                    radius={radius}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-200">Pacotes de dados disponíveis</h3>
                <div className="space-y-4">
                  {mockDataPackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      layout
                      className="bg-white/80 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700"
                    >
                      <button
                        onClick={() => togglePackage(pkg.id)}
                        className="w-full p-4 flex items-center justify-between text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{pkg.title}</span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">{pkg.type}</span>
                        </div>
                        {expandedPackage === pkg.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedPackage === pkg.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-700">
                              <div className="aspect-video bg-zinc-100 dark:bg-black rounded-lg mb-4">
                                <div className="w-full h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                  FITS Preview
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-zinc-700 dark:text-zinc-300">
                                <div>
                                  <p>Size: {pkg.size}</p>
                                  <p>Date: {pkg.date}</p>
                                </div>
                                <div className="flex justify-end">
                                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 shadow">
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {showMastPortal && (
        <MastPortal target={lastPayload?.term ?? searchTerm} onClose={() => setShowMastPortal(false)} />
      )}
    </div>
  )
}
