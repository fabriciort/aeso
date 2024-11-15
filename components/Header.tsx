'use client'

import { Search } from 'lucide-react'

interface HeaderProps {
  query: string
  setQuery: (query: string) => void
  handleSearch: () => void
}

export default function Header({ query, setQuery, handleSearch }: HeaderProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-800 dark:text-green-400">
        M.A.S.T. Viewer
      </h1>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for an object..."
          className="w-full px-6 py-4 rounded-full bg-white dark:bg-zinc-800/90 
                     border border-neutral-200 dark:border-zinc-700
                     shadow-lg focus:ring-2 focus:ring-green-500 
                     focus:border-transparent outline-none
                     text-neutral-800 dark:text-neutral-200
                     placeholder-neutral-400 dark:placeholder-neutral-500"
        />
        <button 
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                   text-gray-400 hover:text-green-600 dark:hover:text-green-400
                   transition-colors"
          aria-label="Search"
        >
          <Search size={24} />
        </button>
      </div>
    </header>
  )
} 