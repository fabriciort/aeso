'use client'

import { useState } from 'react'
import Header from './Header'
import AstroView from './AstroView'
import Card from './Card'
import MetamorphicSearchBar from './MetaMearchBar'

export default function MainView() {
  const [showAstroView, setShowAstroView] = useState(false)
  const [target, setTarget] = useState('M51')

  const handleShowAstroView = () => {
    setShowAstroView(true)
  }

  const handleCloseAstroView = () => {
    setShowAstroView(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header />
        
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-full max-w-4xl">
            <MetamorphicSearchBar />
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            title="Welcome to MAST Viewer"
            description="Explore the cosmos with our advanced tools and data."
            link="#"
            image="mast_welcome.jpeg"
          />
          <Card
            title="Latest Blog Posts"
            description="Stay updated with the latest astronomical discoveries and MAST news."
            link="#"
            image="blog.jpg"
          />
          <Card
            title="My Data"
            description="Access and manage your personal MAST data and observations."
            link="#"
            image="data_card.jpeg"
          />
        </main>

        <div className="sticky bottom-8 w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-end">
            <button
              onClick={handleShowAstroView}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all"
            >
              Show MAST Portal
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