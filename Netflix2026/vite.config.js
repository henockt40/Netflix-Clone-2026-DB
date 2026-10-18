import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Original Vite setup preserved; proxy is only for the new auth backend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3777',
    },
  },
})
