'use client'

import { useMemo, useState } from 'react'
import Header from './Header'
import AstroView from './AstroView'
import Card from './Card'
import MetamorphicSearchBar, { type SearchResultPayload } from './MetaMearchBar'

export default function MainView() {
  const [showAstroView, setShowAstroView] = useState(false)
  const [defaultView, setDefaultView] = useState<'sky' | 'portal'>('sky')
  const [searchResult, setSearchResult] = useState<SearchResultPayload | null>(null)

  const handleShowAstroView = (view: 'sky' | 'portal' = 'sky') => {
    setDefaultView(view)
    setShowAstroView(true)
  }

  const handleCloseAstroView = () => {
    setShowAstroView(false)
  }

  const handleSearchResult = (payload: SearchResultPayload | null) => {
    setSearchResult(payload)
    if (payload?.action === 'astroview') {
      handleShowAstroView('sky')
    }
    if (payload?.action === 'portal') {
      handleShowAstroView('portal')
    }
  }

  const coordinates = useMemo(() => {
    if (!searchResult?.objectData) return undefined
    return { ra: searchResult.objectData.ra, dec: searchResult.objectData.dec }
  }, [searchResult])

  const target = searchResult?.term ?? ''

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header />

        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-full max-w-4xl">
            <MetamorphicSearchBar onSearchResult={handleSearchResult} />
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/70 dark:bg-zinc-800/50 backdrop-blur rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Contexto da busca</h3>
            {target ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm text-zinc-500">Alvo</p>
                  <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{target}</p>
                </div>
                {coordinates && (
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">RA: {coordinates.ra.toFixed(4)}</span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">Dec: {coordinates.dec.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleShowAstroView('sky')}
                    disabled={!target}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all"
                  >
                    {target ? `Abrir AstroView para ${target}` : 'Busque algo para habilitar'}
                  </button>
                  <button
                    onClick={() => handleShowAstroView('portal')}
                    disabled={!target}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-500 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all"
                  >
                    {target ? 'Abrir Portal MAST' : 'Portal indisponível sem alvo'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Realize uma busca ou use um comando para ver os detalhes do alvo.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card
              title="Atalhos da missão"
              description="Acesse rapidamente ferramentas do MAST e material de apoio."
              link="#"
              image="mast_welcome.jpeg"
            />
            <Card
              title="Últimos destaques"
              description="Fique por dentro das novidades científicas e observações recentes."
              link="#"
              image="blog.jpg"
            />
            <Card
              title="Meu espaço"
              description="Centralize pacotes baixados, listas e favoritos."
              link="#"
              image="data_card.jpeg"
            />
          </div>
        </section>

        {showAstroView && target && (
          <AstroView
            target={target}
            coordinates={coordinates}
            defaultView={defaultView}
            onClose={handleCloseAstroView}
          />
        )}
      </div>
    </div>
  )
}
