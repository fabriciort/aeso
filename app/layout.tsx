import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeManager from '@/components/ThemeManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MAST Viewer',
  description: 'Interface for exploring astronomical data from MAST',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 transition-colors duration-300`}>
        <ThemeManager />
        {children}
      </body>
    </html>
  )
}
