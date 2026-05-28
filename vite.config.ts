import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Para GitHub Pages, o base deve ser o nome do repositório
// Ex: https://mastersfurios-max.github.io/to-gestor-web/
const base = process.env.GITHUB_PAGES === 'true' ? '/to-gestor-web/' : '/'

export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
})
