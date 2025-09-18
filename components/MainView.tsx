'use client'

import { useState } from 'react'
import type { ObjectData } from '@/lib/mast'
import Header from './Header'
import AstroView from './AstroView'
import Card from './Card'
import MetamorphicSearchBar from './MetaMearchBar'

export default function MainView() {
  const [showAstroView, setShowAstroView] = useState(false)
  const [target, setTarget] = useState('M51')
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null)

  const handleShowAstroView = () => {
    if (selectedObject) {
      setShowAstroView(true)
    }
  }

  const handleCloseAstroView = () => {
    setShowAstroView(false)
  }

  const handleObjectResolved = (data: ObjectData | null) => {
    setSelectedObject(data)
    if (data) {
      setTarget(data.metadata?.canonicalName ?? data.name)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header />
        
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-full max-w-4xl">
            <MetamorphicSearchBar onObjectResolved={handleObjectResolved} />
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            title="Boas-vindas ao AESo"
            description="Explore o acervo do MAST com consultas inteligentes e visualização imediata."
            link="#"
            image="mast_welcome.jpeg"
          />
          <Card
            title="Atualizações do MAST"
            description="Fique por dentro de novas observações, campanhas e catálogos publicados."
            link="#"
            image="blog.jpg"
          />
          <Card
            title="Minhas coleções"
            description="Organize listas de alvos, downloads e recortes personalizados em um só lugar."
            link="#"
            image="data_card.jpeg"
          />
        </main>

        <div className="sticky bottom-8 w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-end">
            <button
              onClick={handleShowAstroView}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800/60 disabled:text-white/60 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all"
              disabled={!selectedObject}
              title={selectedObject ? undefined : 'Realize uma busca para habilitar o portal'}
            >
              Abrir MAST Portal
            </button>
          </div>
        </div>

        {showAstroView && target && (
          <AstroView
            target={target}
            onClose={handleCloseAstroView}
          />
        )}
      </div>
    </div>
  )
} 