'use client'

export default function Header() {
  return (
    <header className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2 text-green-800 dark:text-green-400">
        AESo Explorer
      </h1>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Interface unificada para explorar catálogos e observações do MAST Portal.
      </p>
    </header>
  )
}