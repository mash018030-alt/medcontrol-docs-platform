import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// На проде всегда выкладывайте весь каталог dist/ (index.html + assets/* с новыми хэшами в именах).
//
// По умолчанию base: '/' — стили и скрипты грузятся, если dist отдаётся с корня домена
// или через `npm run preview`. Иначе (типичный случай) сборка с /repo-name/ даёт ссылки
// /repo-name/assets/… и при открытии сайта не с того пути CSS/JS 404 → «голый» HTML.
// GitHub Pages (project site): npm run build:gh-pages

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    /* true: слушать 0.0.0.0 — удобнее с Windows/WSL и показывает URL для сети */
    host: true,
    port: 5174,
    /* false: если 5174 занят (старый vite / второй терминал), Vite возьмёт 5175 и т.д. */
    strictPort: false,
    /* PDF: браузер бьёт в тот же origin → без CORS; цель — docs-app/pdf-server (npm start) */
    proxy: {
      '/api/pdf': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    emptyOutDir: true,
  },
})
