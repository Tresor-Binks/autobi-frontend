import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Augmente le seuil d'avertissement à 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Isole pptxgenjs dans son propre fichier JS
          pptxgen: ['pptxgenjs'],
        },
      },
    },
  },
})