import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'https://srv1023256.hstgr.cloud'

  return {
    plugins: [react()],
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
