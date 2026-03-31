import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI DUP Coach',
    short_name: 'Coach',
    description: 'Science-based AI weightlifting tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0c',
    theme_color: '#00f2ff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}