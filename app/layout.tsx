import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'AESo — Explorador do céu',
  description:
    'Busque objetos astronômicos por nome, catálogo, coordenadas ou características, veja-os no céu interativo e baixe os dados do MAST.',
}

export const viewport: Viewport = {
  themeColor: '#030407',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  )
}
