import type { MetadataRoute } from 'next'

// Installable web app: launched from the home screen it opens straight into
// the Observatório with no browser UI (and no fullscreen notice).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AESo · Observatório',
    short_name: 'AESo',
    description: 'Aprenda física e astronomia fazendo ciência com dados reais de telescópios.',
    id: '/app',
    start_url: '/app?origem=app',
    scope: '/',
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone'],
    orientation: 'portrait',
    background_color: '#030407',
    theme_color: '#030407',
    lang: 'pt-BR',
    categories: ['education', 'science'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
