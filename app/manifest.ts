import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ÉLEVÉ Business Partners',
    short_name: 'ÉLEVÉ',
    description: 'Smarter strategy. Seamless systems. More room to grow.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111114',
    theme_color: '#111114',
    icons: [
      { src: '/brand/eleve-mark-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/eleve-mark-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/eleve-mark-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
