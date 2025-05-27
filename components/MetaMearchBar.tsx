'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, ChevronUp, ExternalLink, Settings } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { getObjectData, getObservationsByCoordinates, ObjectData, ObservationData } from '../../lib/mast'

type SearchMode = 'default' | 'loading' | 'results'

function AstroViewEmbed({ target }: { target: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)
    
    const astroViewUrl = `https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html?search=${encodeURIComponent(target)}&ra=&dec=&radius=0.02917&hips=DSS2%20Color`
    iframe.src = astroViewUrl

    const handleLoad = () => {
      setIsLoading(false)
      
      setTimeout(() => {
        iframe.contentWindow?.postMessage({
          type: 'search',
          target: target,
          service: 'AstroView'
        }, '*')
      }, 1000)
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [target])

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

export default function MetamorphicSearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [mode, setMode] = useState<SearchMode>('default')
  const [isLoading, setIsLoading] = useState(false)
  const [showMastPortal, setShowMastPortal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [objectDetails, setObjectDetails] = useState<ObjectData | null>(null)
  const [observationResults, setObservationResults] = useState<ObservationData[]>([])
  const [expandedObservationId, setExpandedObservationId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm) return

    setMode('loading')
    setIsLoading(true)
    setObjectDetails(null)
    setObservationResults([])
    setSearchError(null)

    try {
      const basicData = await getObjectData(searchTerm)

      if (basicData && typeof basicData.ra === 'number' && typeof basicData.dec === 'number') {
        setObjectDetails(basicData)
        const observations = await getObservationsByCoordinates(basicData.ra, basicData.dec, 0.1) // Using 0.1 as radius
        if (observations) {
          setObservationResults(observations)
        }
        setMode('results')
      } else {
        setSearchError("Object not found or could not be resolved. Please try a different name.")
        setMode('default')
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchError("An error occurred while fetching data. Please try again.")
      setMode('default')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleObservation = (obsId: string) => {
    setExpandedObservationId(expandedObservationId === obsId ? null : obsId)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        layout
        className="relative bg-white/5 dark:bg-zinc-800/50 
                   backdrop-blur-md rounded-2xl 
                   shadow-lg dark:shadow-zinc-900/20 
                   border border-zinc-200/10 dark:border-zinc-700/30
                   transition-colors duration-200"
        animate={{ height: mode === 'default' ? 'auto' : '85vh' }}
      >
        <form onSubmit={handleSearch} 
              className="flex items-center p-4 border-b 
                         border-zinc-200/10 dark:border-zinc-700/30">
          <Search className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for an astronomical object..."
            className="w-full px-4 py-2 bg-transparent 
                       text-zinc-800 dark:text-zinc-100 
                       placeholder-zinc-400 dark:placeholder-zinc-500 
                       focus:outline-none transition-colors duration-200"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setMode('default')
                setSearchError(null) // Clear error when search term is cleared
              }}
              className="text-zinc-400 hover:text-zinc-600 
                         dark:text-zinc-500 dark:hover:text-zinc-300 
                         transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </form>

        {searchError && mode === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 text-center text-red-400"
          >
            {searchError}
          </motion.div>
        )}

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
              <div className="grid grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-zinc-200">{objectDetails?.name || searchTerm}</h2>
                  <div className="space-y-2 text-zinc-400">
                    <p>RA: {objectDetails?.coordinates?.ra_str || 'N/A'}</p>
                    <p>Dec: {objectDetails?.coordinates?.dec_str || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 flex items-center gap-2"
                      onClick={() => setShowMastPortal(true)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open MAST Portal
                    </button>
                  </div>
                </div>
                
                <div className="aspect-square bg-black rounded-lg relative overflow-hidden">
                  <div className="absolute top-2 right-2 z-10 flex space-x-2">
                    <button className="p-2 bg-zinc-800/80 rounded-lg hover:bg-zinc-700/80 backdrop-blur-sm">
                      <Settings className="w-4 h-4 text-zinc-200" />
                    </button>
                  </div>
                  <AstroViewEmbed target={searchTerm} />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-zinc-200">Observation Results</h3>
                {objectDetails && observationResults.length === 0 && (
                  <p className="text-zinc-400">No detailed observation data found for this object.</p>
                )}
                {observationResults.length > 0 && (
                  <div className="space-y-4">
                    {observationResults.map((obs) => (
                      <motion.div
                        key={obs.obs_id}
                        layout
                        className="bg-zinc-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleObservation(obs.obs_id)}
                          className="w-full p-4 flex items-center justify-between text-zinc-200 hover:bg-zinc-700"
                        >
                          <div className="flex items-center space-x-4 text-left">
                            <span className="font-medium">{obs.instrument_name} ({obs.obs_id})</span>
                            <span className="text-sm text-zinc-400">{obs.productType}</span>
                          </div>
                          {expandedObservationId === obs.obs_id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedObservationId === obs.obs_id && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 border-t border-zinc-700 text-sm text-zinc-300 space-y-2">
                                <p><strong>Instrument:</strong> {obs.instrument_name}</p>
                                <p><strong>Observation ID:</strong> {obs.obs_id}</p>
                                <p><strong>Product Type:</strong> {obs.productType}</p>
                                <p><strong>Filters:</strong> {obs.filters}</p>
                                <p><strong>Exposure Time:</strong> {obs.t_exptime}s</p>
                                {obs.dataURL && (
                                  <p>
                                    <strong>Data URL:</strong> 
                                    <a 
                                      href={`https://mast.stsci.edu/api/v0.1/Download/file?uri=${obs.dataURL}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="ml-1 text-blue-400 hover:text-blue-300 underline transition-colors"
                                    >
                                      Download Data
                                    </a>
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {showMastPortal && objectDetails && (
        <MastPortal target={objectDetails.name || searchTerm} onClose={() => setShowMastPortal(false)} />
      )}
    </div>
  )
}