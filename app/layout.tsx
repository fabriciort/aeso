import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'AESo · Aprenda o universo fazendo ciência',
  description:
    'Laboratórios interativos de física e astronomia com dados reais de telescópios, um céu inteiro para explorar e uma guia de IA. Em português, direto no navegador.',
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
