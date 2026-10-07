'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { AstroObject, ObjectListItem, Observation, SearchResponse } from '@/lib/astro/types'
import { fetchObservations, searchQuery } from '@/lib/client/api'
import { cn } from '@/lib/utils'
import { useVegaScreen } from '@/lib/observatory/vega-context'
import { rememberSearch } from '@/lib/progress'
import ObjectDetails from '@/components/aeso/ObjectDetails'
import Observations from '@/components/aeso/Observations'
import ResultsList from '@/components/aeso/ResultsList'
import SearchBar, { type SearchBarHandle } from '@/components/aeso/SearchBar'
import SkyThumb from '@/components/aeso/SkyThumb'
import SkyViewer from '@/components/aeso/SkyViewer'

const spring = { type: 'spring' as const, stiffness: 300, damping: 34, mass: 0.9 }

const FEATURED = [
  { q: 'M51', title: 'Galáxia do Rodamoinho', ra: 202.4696, dec: 47.1952, fov: 0.32 },
  { q: 'M42', title: 'Nebulosa de Órion', ra: 83.8221, dec: -5.3911, fov: 1.1 },
  { q: 'M16', title: 'Pilares da Criação', ra: 274.7, dec: -13.8069, fov: 0.6 },
  { q: 'NGC 1300', title: 'Espiral barrada', ra: 49.9208, dec: -19.4111, fov: 0.14 },
]

const EXAMPLES = ['Pilares da Criação', 'galáxias espirais mais brilhantes que 10', 'nebulosas planetárias perto de M27', 'WASP-121']

type Phase = 'idle' | 'loading' | 'done'

function observationRadius(o: AstroObject): number {
  const fromSize = o.sizeArcmin ? o.sizeArcmin / 2 / 60 : o.fov / 4
  return Math.min(Math.max(fromSize, 0.01), 0.25)
}

export default function SkyView() {
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
        if (r.kind === 'object' || r.kind === 'list') rememberSearch(query)
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

  useVegaScreen({
    state: object
      ? `Objeto aberto no Céu: ${object.displayName} (${object.id})${object.typeLabel ? `, ${object.typeLabel}` : ''}. ${observations ? `${observations.length} observações do MAST listadas.` : ''}`
      : list
        ? `Lista de resultados: ${list.description}.`
        : 'Tela de busca do Céu.',
  })
  const showObject = object && result?.kind === 'object'
  const showList = !showObject && list && result?.kind === 'list'

  return (
    <LayoutGroup>
      <div className="relative mx-auto flex min-h-[calc(100dvh-24px)] w-full max-w-[1400px] flex-col">

        <motion.section
          layout
          transition={spring}
          className={cn('flex flex-col items-center', idle ? 'flex-1 justify-center pb-[6vh] pt-6' : 'sticky top-2 z-40 pb-2 pt-1')}
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
                <p className="eyebrow mb-4">Céu</p>
                <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-transparent sm:text-[64px]">
                  Encontre qualquer
                  <br />coisa no céu.
                </h1>
                <p className="mx-auto mt-5 max-w-lg text-balance text-[17px] leading-relaxed text-white/50">
                  Busque pelo nome, pelo catálogo ou descreva o que procura. Veja no céu e baixe os dados dos telescópios.
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
