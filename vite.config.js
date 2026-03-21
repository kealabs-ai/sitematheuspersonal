import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
        target: 'https://srv1023256.hstgr.cloud',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    copyPublicDir: true
  }
})
