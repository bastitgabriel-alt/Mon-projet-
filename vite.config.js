import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// En production, l'appli est hébergée sur GitHub Pages sous /Mon-projet-/ ;
// en dev on garde la racine pour ne pas changer l'URL locale habituelle.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Mon-projet-/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}']
      },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Marge - Organise tes révisions de prépa',
        short_name: 'Marge',
        description: "L'appli tout-en-un pour les élèves de CPGE : organisation, scan de copies annotées, fiches de révision.",
        theme_color: '#1c1440',
        background_color: '#f6f5fb',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true
  }
}))
