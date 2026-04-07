import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// На проде всегда выкладывайте весь каталог dist/ (index.html + assets/* с новыми хэшами в именах).
//
// По умолчанию base: '/' — стили и скрипты грузятся, если dist отдаётся с корня домена
// или через `npm run preview`. Иначе (типичный случай) сборка с /repo-name/ даёт ссылки
// /repo-name/assets/… и при открытии сайта не с того пути CSS/JS 404 → «голый» HTML.
// GitHub Pages (project site): npm run build:gh-pages

/** Прокси на pdf-server: при ECONNREFUSED http-proxy отдаёт HTML «Internal Server Error» без JSON — ломает разбор ошибки на фронте. */
function vitePdfServerProxy() {
  return {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    configure(proxy) {
      proxy.on('error', (err, _req, res) => {
        if (!res || typeof res.writeHead !== 'function' || res.headersSent) return
        const hint =
          err.code === 'ECONNREFUSED'
            ? 'Порт 3001 не отвечает: запустите pdf-server (из docs-app: npm run dev:with-pdf или в pdf-server: npm start).'
            : String(err.message || err)
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: hint }))
      })
    },
  }
}

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
      '/api/pdf': vitePdfServerProxy(),
    },
  },
  /* Тот же прокси для npm run preview — иначе встроенный VITE_PDF_SERVICE_URL на :3001 снова даёт cross-origin */
  preview: {
    proxy: {
      '/api/pdf': vitePdfServerProxy(),
    },
  },
  build: {
    emptyOutDir: true,
  },
})
