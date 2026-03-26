import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// На проде всегда выкладывайте весь каталог dist/ (index.html + assets/* с новыми хэшами в именах).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    emptyOutDir: true,
  },
})
