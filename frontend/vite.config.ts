import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['d2dsq7g7tuywgd.cloudfront.net'],
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['d2dsq7g7tuywgd.cloudfront.net'],
    port: 5173,
  },
})
