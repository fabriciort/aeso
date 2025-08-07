'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, ChevronUp, ExternalLink, Settings } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { getObjectData, type ObjectData } from "@/lib/mast"

type SearchMode = 'default' | 'loading' | 'results'
type DataPackage = {
  id: string
  title: string
  type: string
  size: string
  date: string
}

function AstroViewEmbed({ target, ra, dec }: { target: string; ra?: number; dec?: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)
    
    const baseUrl = 'https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html'
    let astroViewUrl = ''
    if (ra !== undefined && dec !== undefined) {
      astroViewUrl = `${baseUrl}?ra=${ra}&dec=${dec}&radius=0.2&hips=DSS2%20Color`
    } else {
      astroViewUrl = `${baseUrl}?search=${encodeURIComponent(target)}&radius=0.2&hips=DSS2%20Color`
    }
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
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [objectData, setObjectData] = useState<ObjectData | null>(null)
  const [showMastPortal, setShowMastPortal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm) return

    setMode('loading')
    setIsLoading(true)
    try {
      const data = await getObjectData(searchTerm)
      setObjectData(data)
    } catch (error) {
      console.error(error)
      setObjectData(null)
    }
    setIsLoading(false)
    setMode('results')
  }

  const togglePackage = (id: string) => {
    setExpandedPackage(expandedPackage === id ? null : id)
  }

  const mockDataPackages: DataPackage[] = [
    { id: '1', title: 'HST/ACS Observation', type: 'FITS', size: '2.3 GB', date: '2024-01-15' },
    { id: '2', title: 'JWST Spectral Data', type: 'FITS', size: '1.8 GB', date: '2024-01-14' },
    { id: '3', title: 'Radio Observations', type: 'FITS', size: '3.1 GB', date: '2024-01-13' },
  ]

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
              }}
              className="text-zinc-400 hover:text-zinc-600 
                         dark:text-zinc-500 dark:hover:text-zinc-300 
                         transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </form>

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
                  <h2 className="text-2xl font-bold text-zinc-200">{searchTerm}</h2>
                  <div className="space-y-2 text-zinc-400">
                    {objectData ? (
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
                  <AstroViewEmbed target={searchTerm} ra={objectData?.ra} dec={objectData?.dec} />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-zinc-200">Available Data Packages</h3>
                <div className="space-y-4">
                  {mockDataPackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      layout
                      className="bg-zinc-800 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => togglePackage(pkg.id)}
                        className="w-full p-4 flex items-center justify-between text-zinc-200 hover:bg-zinc-700"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{pkg.title}</span>
                          <span className="text-sm text-zinc-400">{pkg.type}</span>
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
                            <div className="p-4 border-t border-zinc-700">
                              <div className="aspect-video bg-black rounded-lg mb-4">
                                {/* FITS visualization would go here */}
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                  FITS Preview
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
                                <div>
                                  <p>Size: {pkg.size}</p>
                                  <p>Date: {pkg.date}</p>
                                </div>
                                <div className="flex justify-end">
                                  <button className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600">
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
        <MastPortal target={searchTerm} onClose={() => setShowMastPortal(false)} />
      )}
    </div>
  )
}