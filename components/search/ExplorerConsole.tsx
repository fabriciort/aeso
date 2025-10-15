'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Orbit,
  Search,
  Settings2,
  Telescope,
  X
} from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { getObjectData, type ObjectData } from '@/lib/mast'

export type ExplorerConsoleHandle = {
  focusInput: () => void
}

type ViewState = 'idle' | 'loading' | 'results' | 'error'

type DataPackage = {
  id: string
  title: string
  instrument: string
  size: string
  date: string
}

const suggestions = ['M51', 'NGC 1300', 'Horsehead Nebula', 'TRAPPIST-1', 'M31']

const mockDataPackages: DataPackage[] = [
  {
    id: 'hst-acs',
    title: 'HST / ACS Wide Field',
    instrument: 'F606W • 5200s',
    size: '2.4 GB',
    date: '2024-01-15'
  },
  {
    id: 'jwst-nircam',
    title: 'JWST / NIRCam Deep Field',
    instrument: 'F200W • 6400s',
    size: '1.8 GB',
    date: '2024-01-12'
  },
  {
    id: 'radio-alma',
    title: 'ALMA Continuum Map',
    instrument: 'Band 6 • 1.3mm',
    size: '3.1 GB',
    date: '2024-01-11'
  }
]

const insightTiles = [
  {
    title: 'Cartografia multiespectral',
    description: 'Cruze espectros com mosaicos ópticos e radiointerferométricos sem sair do navegador.',
    icon: Telescope
  },
  {
    title: 'Insights orbitais',
    description: 'Obtenha efemérides, janelas de visibilidade e predições de transientes com poucos cliques.',
    icon: Orbit
  }
]

const ExplorerConsole = forwardRef<ExplorerConsoleHandle>((_, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [objectData, setObjectData] = useState<ObjectData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [showPortal, setShowPortal] = useState(false)

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus()
    }
  }))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = async (term?: string) => {
    const nextQuery = (term ?? query).trim()
    if (!nextQuery) return

    setQuery(nextQuery)
    setViewState('loading')
    setErrorMessage(null)
    setShowPortal(false)

    try {
      const data = await getObjectData(nextQuery)
      if (!data) {
        setObjectData(null)
        setErrorMessage('Nenhum objeto encontrado com os parâmetros informados.')
        setViewState('error')
        return
      }

      setObjectData(data)
      setViewState('results')
    } catch (error) {
      console.error(error)
      setErrorMessage('Não foi possível conectar ao MAST no momento. Tente novamente mais tarde.')
      setViewState('error')
    }
  }

  const togglePackage = (id: string) => {
    setExpandedPackage((current) => (current === id ? null : id))
  }

  const metrics = objectData
    ? [
        {
          label: 'Ascensão reta',
          value: objectData.coordinates?.ra_str ?? '—',
          icon: Compass
        },
        {
          label: 'Declinação',
          value: objectData.coordinates?.dec_str ?? '—',
          icon: MapPin
        },
        {
          label: 'Magnitude',
          value: objectData.magnitude ? objectData.magnitude.toString() : '—',
          icon: Telescope
        },
        {
          label: 'Constelação',
          value: objectData.constellation ?? '—',
          icon: Orbit
        }
      ]
    : []

  return (
    <section className="relative" aria-label="Console de exploração astronômica">
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl"
      >
        <div className="border-b border-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Console científico</p>
              <h2 className="text-2xl font-semibold text-white">
                Pesquise por objetos, missões ou coordenadas
              </h2>
            </div>
            <button
              onClick={() => setShowPortal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
            >
              Acessar MAST completo
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSearch()
            }}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: NGC 1300, TRAPPIST-1, RA 00h42m44s Dec +41°16′9″"
              className="flex-1 bg-transparent placeholder:text-slate-500 focus:outline-none"
              aria-label="Pesquisar objeto astronômico"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setObjectData(null)
                  setViewState('idle')
                }}
                className="rounded-full border border-white/10 p-1 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-200"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Buscar
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {viewState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 p-6 lg:grid-cols-[1.1fr,1fr]"
            >
              <div className="space-y-5 text-sm text-slate-300">
                <p className="rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-500/5 p-5 text-emerald-100">
                  Comece com um objeto clássico ou cole as coordenadas diretamente. Nós conectamos automaticamente os serviços do MAST, resolvemos nomes e sugerimos observações relacionadas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSearch(item)}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-300 hover:text-emerald-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {insightTiles.map((tile) => (
                  <div
                    key={tile.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                  >
                    <tile.icon className="mt-1 h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-semibold text-white">{tile.title}</p>
                      <p className="text-slate-300">{tile.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {viewState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-8 p-6 lg:grid-cols-[1fr,1fr]"
            >
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 bg-white/10" />
                <Skeleton className="h-20 w-full bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full bg-white/10" />
                  <Skeleton className="h-16 w-full bg-white/10" />
                </div>
              </div>
              <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-300" />
              </div>
            </motion.div>
          )}

          {viewState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 p-6"
            >
              <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
                {errorMessage}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="rounded-full border border-white/10 px-3 py-2 transition hover:border-emerald-300 hover:text-emerald-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {viewState === 'results' && objectData && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10 p-6"
            >
              <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      {objectData.source === 'api' ? 'Dados do MAST' : 'Dados de referência' }
                    </span>
                    {objectData.additionalNames && (
                      <span className="text-xs text-slate-400">
                        {objectData.additionalNames.join(' • ')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-semibold text-white">{objectData.name}</h3>
                    {objectData.description && (
                      <p className="text-sm text-slate-300">{objectData.description}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                      >
                        <metric.icon className="h-5 w-5 text-emerald-300" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">{metric.label}</p>
                          <p className="font-semibold text-white">{metric.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-semibold">
                    <button
                      onClick={() => setShowPortal(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-slate-950 transition hover:bg-emerald-400"
                    >
                      Abrir MAST Portal
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <a
                      href="https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-slate-200 transition hover:border-emerald-300 hover:text-emerald-200"
                    >
                      Documentação do MAST
                    </a>
                  </div>
                </div>

                <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
                  <AstroViewEmbed target={objectData.name} ra={objectData.ra} dec={objectData.dec} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Pacotes de dados relacionados</h4>
                <div className="space-y-3">
                  {mockDataPackages.map((pkg) => (
                    <div key={pkg.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                      <button
                        onClick={() => togglePackage(pkg.id)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
                        aria-expanded={expandedPackage === pkg.id}
                      >
                        <div>
                          <p className="font-semibold text-white">{pkg.title}</p>
                          <p className="text-xs text-slate-400">{pkg.instrument}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{pkg.size}</span>
                          <span>{pkg.date}</span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                            FITS
                          </span>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {expandedPackage === pkg.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-white/10 bg-slate-950/80"
                          >
                            <div className="grid gap-4 p-4 sm:grid-cols-[1.3fr,1fr]">
                              <div className="h-48 rounded-xl border border-white/10 bg-black/60">
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                                  Pré-visualização FITS
                                </div>
                              </div>
                              <div className="flex flex-col justify-between gap-4 text-xs text-slate-300">
                                <p>
                                  Organize downloads com metadados completos e scripts automáticos para pipelines Python ou notebooks Jupyter.
                                </p>
                                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400">
                                  Preparar download
                                  <Settings2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showPortal && (
        <PortalOverlay
          target={objectData?.name ?? query}
          onClose={() => setShowPortal(false)}
        />
      )}
    </section>
  )
})

ExplorerConsole.displayName = 'ExplorerConsole'

export default ExplorerConsole

function AstroViewEmbed({ target, ra, dec }: { target: string; ra?: number; dec?: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)

    const baseUrl = 'https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html'
    const url =
      ra !== undefined && dec !== undefined
        ? `${baseUrl}?ra=${ra}&dec=${dec}&radius=0.3&hips=DSS2%20Color`
        : `${baseUrl}?search=${encodeURIComponent(target)}&radius=0.3&hips=DSS2%20Color`

    iframe.src = url

    const handleLoad = () => {
      setIsLoading(false)
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [target, ra, dec])

  return (
    <div className="relative h-full min-h-[280px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-slate-200">
          Carregando visualização...
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={`AstroView ${target}`}
        className="absolute inset-0 h-full w-full rounded-3xl border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}

type PortalOverlayProps = {
  target: string
  onClose: () => void
}

function PortalOverlay({ target, onClose }: PortalOverlayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !target) return

    setIsLoading(true)
    const url = `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${encodeURIComponent(target)}`
    iframe.src = url

    const handleLoad = () => {
      setIsLoading(false)
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [target])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">MAST Portal</p>
            <p className="text-sm font-semibold text-white">{target}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-emerald-300 hover:text-emerald-200"
            aria-label="Fechar visualização"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-sm text-slate-200">
              Carregando MAST Portal...
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="MAST Portal"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  )
}
