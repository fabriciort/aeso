'use client'

import { useState } from 'react'
import Header from './Header'
import AstroView from './AstroView'
import Card from './Card'
import { Sun, Moon } from 'lucide-react'

export default function MainView() {
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState('M51') // valor padrão
  const [showAstroView, setShowAstroView] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleSearch = () => {
    if (query.trim()) {
      setTarget(query)
      setShowAstroView(true)
    }
  }

  const handleShowAstroView = () => {
    setShowAstroView(true)
  }

  const handleCloseAstroView = () => {
    setShowAstroView(false)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header query={query} setQuery={setQuery} handleSearch={handleSearch} />
        
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

        {/* Botões */}
        <div className="sticky bottom-8 w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <button
              onClick={toggleTheme}
              className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg transition-all"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleShowAstroView}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all"
            >
              Show AstroView
            </button>
          </div>
        </div>

        {/* AstroView Modal */}
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