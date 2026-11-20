import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'https://srv1023256.hstgr.cloud'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icons/matheus-personal-192.png', 'icons/matheus-personal-512.png'],
        manifest: {
          name: 'Matheus Personal',
          short_name: 'Matheus',
          description: 'Área do aluno, treinos e acompanhamento Matheus Personal',
          start_url: '/login',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait-primary',
          theme_color: '#020408',
          background_color: '#020408',
          icons: [
            { src: '/icons/matheus-personal-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/matheus-personal-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/matheus-personal-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        buffer: 'buffer'
      }
    },
    define: {
      global: 'globalThis'
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    build: {
      copyPublicDir: true
    }
  }
})
