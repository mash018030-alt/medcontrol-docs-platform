import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// На проде всегда выкладывайте весь каталог dist/ (index.html + assets/* с новыми хэшами в именах).
//
// По умолчанию base: '/' — стили и скрипты грузятся, если dist отдаётся с корня домена
// или через `npm run preview`. Иначе (типичный случай) сборка с /repo-name/ даёт ссылки
// /repo-name/assets/… и при открытии сайта не с того пути CSS/JS 404 → «голый» HTML.
// GitHub Pages (project site): npm run build:gh-pages

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

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
            ? 'Порт 3001 не отвечает: запустите pdf-server (из engine: npm run dev:with-pdf или в pdf-server: npm start).'
            : String(err.message || '')
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: hint }))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawTitle = (env.VITE_DOCS_SITE_TITLE || '').trim()
  const docsSiteTitle = rawTitle || 'MedControl — Документация'

  return {
    plugins: [
      react(),
      {
        name: 'html-docs-head',
        transformIndexHtml(html) {
          let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtmlText(docsSiteTitle)}</title>`)
          const favUrl = (env.VITE_DOCS_FAVICON_URL || '').trim()
          if (favUrl) {
            const favType = (env.VITE_DOCS_FAVICON_TYPE || '').trim() || 'image/svg+xml'
            if (/^https?:\/\//i.test(favUrl)) {
              out = out.replace(
                /<link rel="icon"[^>]*>/,
                `<link rel="icon" type="${escapeHtmlText(favType)}" href="${escapeHtmlText(favUrl)}" />`,
              )
            } else {
              const path = favUrl.replace(/^\/+/, '')
              out = out.replace(
                /<link rel="icon"[^>]*>/,
                `<link rel="icon" type="${escapeHtmlText(favType)}" href="%BASE_URL%${escapeHtmlText(path)}" />`,
              )
            }
          }
          return out
        },
      },
    ],
    base: '/',
    server: {
      /* true: слушать 0.0.0.0 — удобнее с Windows/WSL и показывает URL для сети */
      host: true,
      port: 5174,
      /* false: если 5174 занят (старый vite / второй терминал), Vite возьмёт 5175 и т.д. */
      strictPort: false,
      /* PDF: браузер бьёт в тот же origin → без CORS; цель — engine/pdf-server (npm start) */
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
  }
})
