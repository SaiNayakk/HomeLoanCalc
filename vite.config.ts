import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'HomeLoanCalc: home loan EMI calculator',
        short_name: 'HomeLoanCalc',
        description: 'Calculate home loan EMI, prepayments, tax benefits and more',
        theme_color: '#f5f2ea',
        background_color: '#f5f2ea',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  server: {
    allowedHosts: ['loancalc-saiworks.nncs.in'],
  },
})
