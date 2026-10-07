'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { AstroObject, ObjectListItem, Observation, SearchResponse } from '@/lib/astro/types'
import { fetchObservations, searchQuery } from '@/lib/client/api'
import { cn } from '@/lib/utils'
import ObjectDetails from './ObjectDetails'
import Observations from './Observations'
import ResultsList from './ResultsList'
import SearchBar, { type SearchBarHandle } from './SearchBar'
import SkyThumb from './SkyThumb'
import SkyViewer from './SkyViewer'
import Starfield from './Starfield'

const spring = { type: 'spring' as const, stiffness: 300, damping: 34, mass: 0.9 }

const FEATURED = [
  { q: 'M51', title: 'Galáxia do Rodamoinho', ra: 202.4696, dec: 47.1952, fov: 0.32 },
  { q: 'M42', title: 'Nebulosa de Órion', ra: 83.8221, dec: -5.3911, fov: 1.1 },
  { q: 'M16', title: 'Pilares da Criação', ra: 274.7, dec: -13.8069, fov: 0.6 },
  { q: 'NGC 1300', title: 'Espiral barrada', ra: 49.9208, dec: -19.4111, fov: 0.14 },
]

const EXAMPLES = [
  'galáxias espirais mais brilhantes que 10',
  'nebulosas planetárias perto de M27',
  'aglomerados globulares do catálogo messier',
  '13h29m52s +47d11m43s',
]

type Phase = 'idle' | 'loading' | 'done'

function observationRadius(o: AstroObject): number {
  const fromSize = o.sizeArcmin ? o.sizeArcmin / 2 / 60 : o.fov / 4
  return Math.min(Math.max(fromSize, 0.01), 0.25)
}

export default function Explorer() {
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [object, setObject] = useState<AstroObject | null>(null)
  const [list, setList] = useState<Extract<SearchResponse, { kind: 'list' }> | null>(null)
  const [observations, setObservations] = useState<Observation[] | null>(null)
  const [obsError, setObsError] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const searchRef = useRef<SearchBarHandle>(null)
  const requestRef = useRef<AbortController | null>(null)

  const loadObservations = useCallback((o: AstroObject) => {
    setObservations(null)
    setObsError(null)
    const controller = new AbortController()
    fetchObservations(o.ra, o.dec, observationRadius(o), controller.signal)
      .then(setObservations)
      .catch((e) => {
        if (!controller.signal.aborted) setObsError(e instanceof Error ? e.message : 'Erro ao consultar o MAST')
      })
    return controller
  }, [])

  const run = useCallback(
    async (q: string, opts: { push?: boolean; keepList?: boolean } = {}) => {
      const query = q.trim()
      if (!query) return
      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller
      setPhase('loading')
      if (opts.push !== false) {
        const url = new URL(window.location.href)
        url.searchParams.set('q', query)
        window.history.pushState({ q: query }, '', url)
      }
      try {
        const r = await searchQuery(query, controller.signal)
        if (controller.signal.aborted) return
        setResult(r)
        if (r.kind === 'object') {
          setObject(r.object)
          if (!opts.keepList) setList(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else if (r.kind === 'list') {
          setList(r)
          setObject(null)
        }
        setPhase('done')
      } catch (e) {
        if (controller.signal.aborted) return
        setResult({ kind: 'error', query, message: e instanceof Error ? e.message : 'Falha na busca' })
        setPhase('done')
      }
    },
    [],
  )

  // Load observations whenever the focused object changes.
  useEffect(() => {
    if (!object) return
    const controller = loadObservations(object)
    return () => controller.abort()
  }, [object, loadObservations])

  // Deep links (?q=...) and browser back/forward.
  useEffect(() => {
    const fromUrl = () => {
      const q = new URL(window.location.href).searchParams.get('q')
      if (q) {
        setInput(q)
        run(q, { push: false })
      } else {
        reset(false)
      }
    }
    fromUrl()
    window.addEventListener('popstate', fromUrl)
    return () => window.removeEventListener('popstate', fromUrl)
  }, [run])

  function reset(push = true) {
    requestRef.current?.abort()
    setPhase('idle')
    setResult(null)
    setObject(null)
    setList(null)
    setObservations(null)
    if (push) window.history.pushState({}, '', window.location.pathname)
  }

  const selectFromList = (item: ObjectListItem) => {
    setInput(item.id)
    run(item.id, { keepList: true })
  }

  const backToList = () => {
    if (!list) return
    setInput(list.query)
    setObject(null)
    setResult(list)
    const url = new URL(window.location.href)
    url.searchParams.set('q', list.query)
    window.history.pushState({ q: list.query }, '', url)
  }

  const idle = phase === 'idle' || (phase === 'loading' && !result)
  const showObject = object && result?.kind === 'object'
  const showList = !showObject && list && result?.kind === 'list'

  return (
    <LayoutGroup>
      <Starfield dimmed={!idle} />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center justify-between">
          <button onClick={() => reset()} className="focus-ring flex items-center gap-2.5 rounded-full pr-2" aria-label="Início">
            <span className="relative grid h-7 w-7 place-items-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-violet-500 opacity-90" />
              <span className="absolute inset-[3px] rounded-full bg-[#05060a]" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">AESo</span>
          </button>
          <a
            href="https://github.com/fabriciort/aeso"
            target="_blank"
            rel="noreferrer"
            className="focus-ring grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Código no GitHub"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
        </header>

        <motion.section
          layout
          transition={spring}
          className={cn('flex flex-col items-center', idle ? 'flex-1 justify-center pb-[10vh]' : 'sticky top-2 z-40 pb-2 pt-1')}
        >
          <AnimatePresence mode="popLayout">
            {idle && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...spring, delay: 0.05 } }}
                exit={{ opacity: 0, y: -24, filter: 'blur(10px)', transition: { duration: 0.35 } }}
                className="mb-9 text-center"
              >
                <p className="eyebrow mb-4">MAST · SIMBAD · CDS</p>
                <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-transparent sm:text-[64px]">
                  O universo,
                  <br />a uma busca de distância.
                </h1>
                <p className="mx-auto mt-5 max-w-lg text-balance text-[17px] leading-relaxed text-white/50">
                  Digite um nome, catálogo, coordenadas ou descreva o que procura. Veja no céu e baixe os dados.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout transition={spring} className={cn('w-full', idle ? 'max-w-2xl' : 'max-w-[1400px]')}>
            <SearchBar
              ref={searchRef}
              value={input}
              onChange={setInput}
              onSubmit={(q) => run(q)}
              loading={phase === 'loading'}
              compact={!idle}
              onClear={() => (idle ? undefined : reset())}
            />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {idle && (
              <motion.div
                key="examples"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.12 } }}
                exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2"
              >
                {EXAMPLES.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setInput(e)
                      run(e)
                    }}
                    className="chip focus-ring"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <AnimatePresence mode="popLayout">
          {idle && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.2 } }}
              exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
              className="pb-10"
            >
              <p className="eyebrow mb-3 text-center">Comece por aqui</p>
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
                {FEATURED.map((f) => (
                  <button
                    key={f.q}
                    onClick={() => {
                      setInput(f.title)
                      run(f.q)
                    }}
                    className="focus-ring group relative overflow-hidden rounded-[22px] border border-white/[0.07] text-left transition duration-500 hover:-translate-y-1 hover:border-white/20"
                  >
                    <SkyThumb ra={f.ra} dec={f.dec} fov={f.fov} size={300} className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-[1.04]" alt={f.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className="font-mono text-[11px] text-white/55">{f.q}</p>
                      <p className="text-[14px] font-medium leading-tight text-white">{f.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!idle && (
            <motion.main
              key="results"
              initial={{ opacity: 0, y: 28, scale: 0.985, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { ...spring, delay: 0.08 } }}
              exit={{ opacity: 0, y: 20, filter: 'blur(8px)', transition: { duration: 0.25 } }}
              className="flex-1 pb-24 pt-4"
            >
              {(result?.kind === 'empty' || result?.kind === 'error') && phase === 'done' && (
                <Message title={result.message} hint={result.kind === 'empty' ? result.hint : undefined} error={result.kind === 'error'} onRetry={() => run(result.query, { push: false })} />
              )}

              {showObject && object && (
                <div className="space-y-14">
                  {list && (
                    <button onClick={backToList} className="chip focus-ring -mb-8">
                      <ArrowLeft className="h-3.5 w-3.5" /> {list.description}
                    </button>
                  )}
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <motion.div layoutId="sky" transition={spring}>
                      <SkyViewer
                        ra={object.ra}
                        dec={object.dec}
                        fov={object.fov}
                        label={object.displayName === object.id ? object.id : `${object.displayName} · ${object.id}`}
                        observations={observations ?? undefined}
                        highlighted={highlighted}
                        className="h-[58vh] min-h-[360px] w-full border border-white/[0.07] lg:h-[70vh]"
                      />
                    </motion.div>
                    <aside className="glass rounded-[28px] p-6 lg:h-[70vh] lg:overflow-y-auto">
                      <ObjectDetails key={object.id} object={object} interpretedBy={result?.kind === 'object' ? result.interpretedBy : undefined} />
                    </aside>
                  </div>
                  <Observations
                    observations={observations}
                    error={obsError}
                    targetLabel={object.id.replace(/\s+/g, '')}
                    highlighted={highlighted}
                    onHighlight={setHighlighted}
                  />
                </div>
              )}

              {showList && list && (
                <ResultsList description={list.description} results={list.results} interpretedBy={list.interpretedBy} onSelect={selectFromList} />
              )}

              {phase === 'loading' && !showObject && !showList && <LoadingState />}
            </motion.main>
          )}
        </AnimatePresence>

        <footer className="pb-6 text-center text-[11px] text-white/30">
          Dados: MAST/STScI, SIMBAD e Aladin Lite (CDS, Strasbourg). Imagens de levantamentos HiPS.
        </footer>
      </div>
    </LayoutGroup>
  )
}

function Message({ title, hint, error, onRetry }: { title: string; hint?: string; error?: boolean; onRetry: () => void }) {
  return (
    <div className="mx-auto mt-[8vh] max-w-lg text-center">
      <div className={cn('mx-auto mb-5 h-12 w-12 rounded-full', error ? 'bg-rose-400/15' : 'bg-white/[0.06]')}>
        <div className={cn('h-full w-full rounded-full border', error ? 'border-rose-300/30' : 'border-white/10')} />
      </div>
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">{title}</h2>
      {hint && <p className="mt-2 text-sm leading-relaxed text-white/50">{hint}</p>}
      {error && (
        <button onClick={onRetry} className="chip focus-ring mt-5">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="relative h-[58vh] min-h-[360px] overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.02] lg:h-[70vh]">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
      <div className="glass space-y-4 rounded-[28px] p-6">
        <div className="h-3 w-24 rounded bg-white/[0.07]" />
        <div className="h-9 w-3/4 rounded-lg bg-white/[0.08]" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-16 rounded-2xl bg-white/[0.04]" />
          <div className="h-16 rounded-2xl bg-white/[0.04]" />
        </div>
        <div className="h-40 rounded-3xl bg-white/[0.03]" />
      </div>
    </div>
  )
}
