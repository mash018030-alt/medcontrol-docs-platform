import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// На проде всегда выкладывайте весь каталог dist/ (index.html + assets/* с новыми хэшами в именах).
// Сборка для GitHub Pages (project site): /repo-name/
const GITHUB_PAGES_BASE = '/medcontrol-docs-platform/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    emptyOutDir: true,
  },
}))
