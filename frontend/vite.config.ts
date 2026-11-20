import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
}

export default defineConfig({
  base: './',
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    allowedHosts: ['d2dsq7g7tuywgd.cloudfront.net'],
    proxy: apiProxy,
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: ['d2dsq7g7tuywgd.cloudfront.net'],
    port: 5173,
    proxy: apiProxy,
  },
})
