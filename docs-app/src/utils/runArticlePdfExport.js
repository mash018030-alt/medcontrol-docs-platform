import html2pdf from 'html2pdf.js'

const PDF_WIDTH_PX = 672

/** Синхронно с брейкпоинтом мобильной вёрстки (см. DocsLayoutContext, App.css). */
const MOBILE_PDF_MQ = '(max-width: 1023px)'

/**
 * Узкий экран (телефон/планшет в портрете): сервис печати Playwright с телефона недоступен или не может
 * открыть «внутренний» URL — используем клиентский PDF или отдельную вкладку со сборкой раздела.
 */
export function preferClientSideArticlePdf() {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia(MOBILE_PDF_MQ).matches
  } catch {
    return false
  }
}

/**
 * База в VITE_PDF_SERVICE_URL указывает на тот же pdf-server, что и прокси Vite.
 * Прямой fetch с localhost:5174 на 127.0.0.1:3001 — другой «site» для браузера → часто TypeError: Failed to fetch (CORS / Private Network Access).
 */
function isLikelyLocalPdfServiceBase(url) {
  try {
    const u = new URL(url)
    const h = u.hostname.toLowerCase()
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
  } catch {
    return false
  }
}

/**
 * URL POST для печати: в dev — всегда same-origin `/api/pdf` (прокси → pdf-server:3001),
 * если не задан удалённый сервис. В production — только VITE_PDF_SERVICE_URL (полный URL сервиса).
 */
export function getPdfServiceApiUrl() {
  const trimmed = import.meta.env.VITE_PDF_SERVICE_URL?.trim()

  if (import.meta.env.DEV) {
    if (!trimmed || isLikelyLocalPdfServiceBase(trimmed)) {
      return '/api/pdf'
    }
    return `${trimmed.replace(/\/$/, '')}/api/pdf`
  }

  if (trimmed) return `${trimmed.replace(/\/$/, '')}/api/pdf`
  return null
}

function triggerBlobDownload(blob, filename) {
  const safe = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = safe
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** URL текущей страницы с mc_pdf=1 (для Playwright). */
export function buildMcPdfUrlFromCurrentWindow() {
  const pageUrl = new URL(window.location.href)
  pageUrl.searchParams.set('mc_pdf', '1')
  return pageUrl.toString()
}

/**
 * URL страницы-сборки раздела (все статьи подстраницы подряд), с mc_pdf=1.
 * @param {string} sectionRootPath например medadmin/user-guide
 */
export function buildSectionBundlePrintUrl(sectionRootPath) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '')
  const pathSeg = base ? `${base}/section-pdf-bundle` : '/section-pdf-bundle'
  const u = new URL(pathSeg, window.location.origin)
  u.searchParams.set('mc_pdf', '1')
  u.searchParams.set('root', sectionRootPath)
  return u.toString()
}

/**
 * URL одной статьи с mc_pdf=1 (для Playwright с текущего origin, без перехода в SPA).
 * @param {string} articlePath например obshee/user-guide
 */
export function buildArticleMcPdfUrl(articlePath) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '')
  const norm = String(articlePath).replace(/^\/+/, '')
  const pathSeg = base ? `${base}/${norm}` : `/${norm}`
  const u = new URL(pathSeg.replace(/\/{2,}/g, '/'), window.location.origin)
  u.searchParams.set('mc_pdf', '1')
  return u.toString()
}

/**
 * PDF через сервис Playwright (см. pdf-server/). Печатается страница по полному URL (с mc_pdf=1).
 */
async function runArticlePdfExportPlaywright(apiUrl, filename, printUrl) {
  const url = typeof printUrl === 'string' ? printUrl : String(printUrl)
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    /* Тело ответа читаем один раз: после неудачного json() второй text() часто пустой → в алерте только «Internal Server Error». */
    const raw = await res.text()
    let detail = res.statusText
    if (raw) {
      try {
        const j = JSON.parse(raw)
        const fromBody = j?.error || j?.message
        detail = fromBody ? String(fromBody) : raw.slice(0, 800)
      } catch {
        detail = raw.replace(/\s+/g, ' ').slice(0, 800)
      }
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }
  const blob = await res.blob()
  triggerBlobDownload(blob, filename)
}

/**
 * Экспорт через html2pdf/html2canvas (запасной путь, если VITE_PDF_SERVICE_URL не задан или сервис недоступен).
 */
async function runArticlePdfExportHtml2Pdf(rootEl, { filename }) {
  const detailsEls = [...rootEl.querySelectorAll('details')]
  const wasOpen = detailsEls.map((d) => d.open)
  detailsEls.forEach((d) => {
    d.open = true
  })

  rootEl.style.maxWidth = `${PDF_WIDTH_PX}px`
  rootEl.style.width = `${PDF_WIDTH_PX}px`
  rootEl.classList.add('docs-pdf-export')

  const teardown = () => {
    detailsEls.forEach((d, i) => {
      d.open = wasOpen[i]
    })
    rootEl.style.maxWidth = ''
    rootEl.style.width = ''
    rootEl.classList.remove('docs-pdf-export')
  }

  try {
    try {
      if (document.fonts?.ready) await document.fonts.ready
    } catch {
      /* ignore */
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    const blob = await html2pdf()
      .set({
        margin:16,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: PDF_WIDTH_PX,
          width: PDF_WIDTH_PX,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            'img',
            'h1',
            'h2',
            'h3',
            'h4',
            'li',
            'tr',
            '.docs-important',
            '.docs-note',
            'sup.docs-fnref',
          ],
        },
      })
      .from(rootEl)
      .outputPdf('blob')
    triggerBlobDownload(blob, filename)
  } catch {
    /* пользователь уже видит кнопку; тихий сбой */
  } finally {
    teardown()
  }
}

/**
 * Только Playwright: печать произвольной страницы с mc_pdf (например сборка раздела).
 * Без сервиса — показать сообщение, html2pdf не используем (другой DOM).
 */
export async function runPdfFromPrintUrl(printUrl, { filename }) {
  if (preferClientSideArticlePdf()) {
    const opened = window.open(printUrl, '_blank', 'noopener,noreferrer')
    if (!opened || opened.closed) {
      window.alert(
        [
          'На телефоне PDF раздела открывается отдельной вкладкой с версией для печати.',
          'Разрешите всплывающие окна для сайта или откройте документацию с компьютера, чтобы скачать файл одной кнопкой.',
        ].join('\n'),
      )
    }
    return
  }

  const apiUrl = getPdfServiceApiUrl()
  if (!apiUrl) {
    window.alert(
      [
        'Текстовый PDF (как при печати из Chromium) сейчас недоступен: в этой сборке не задан адрес сервиса печати.',
        '',
        'Статический хостинг (GitHub Pages и т.п.) не запускает pdf-server сам — его нужно вынести отдельно (Railway, VPS, свой домен).',
        'Перед сборкой фронта задайте VITE_PDF_SERVICE_URL на публичный URL сервиса, например: https://pdf.example.com',
        'На сервере в ALLOWED_HOSTS укажите хост вашей документации (например user.github.io), в CORS_ORIGIN — Origin сайта с доками.',
        '',
        'Локально: npm start в docs-app/pdf-server; в npm run dev прокси /api/pdf подставляется сам, переменная не обязательна.',
        'Подробнее: docs-app/pdf-server/README.md и docs-app/.env.example',
      ].join('\n'),
    )
    return
  }
  try {
    await runArticlePdfExportPlaywright(apiUrl, filename, printUrl)
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : String(e)
    window.alert(['Не удалось сформировать PDF через сервер печати.', '', msg].filter(Boolean).join('\n'))
    throw e
  }
}

/**
 * Сначала Playwright (dev: прокси /api/pdf → pdf-server; prod: VITE_PDF_SERVICE_URL), иначе html2pdf.
 * @param {HTMLElement} rootEl корень контента статьи
 * @param {{ filename: string, printUrl?: string | null }} opts при printUrl печатается эта страница, rootEl для запаса не нужен
 */
export async function runArticlePdfExport(rootEl, { filename, printUrl = null }) {
  const targetPrintUrl = printUrl || null

  if (preferClientSideArticlePdf() && !targetPrintUrl && rootEl) {
    await runArticlePdfExportHtml2Pdf(rootEl, { filename })
    return
  }

  const apiUrl = getPdfServiceApiUrl()
  if (apiUrl) {
    try {
      const url = targetPrintUrl ?? buildMcPdfUrlFromCurrentWindow()
      await runArticlePdfExportPlaywright(apiUrl, filename, url)
      return
    } catch (e) {
      if (targetPrintUrl) {
        /* сообщение уже в runPdfFromPrintUrl при прямом вызове; отсюда не должны попадать */
        console.warn('[PDF] раздел:', e)
        return
      }
      console.warn('[PDF] сервис недоступен, используется html2pdf:', e)
      const msg =
        e && typeof e === 'object' && 'message' in e ? String(e.message) : String(e)
      window.alert(
        [
          'Не удалось получить текстовый PDF через сервер печати.',
          'Сейчас будет скачан растровый PDF (как картинка).',
          '',
          'Проверьте: из каталога docs-app выполните npm run dev:with-pdf (или в pdf-server: npm install && npm start, порт 3001).',
          'В npm run dev запрос идёт на тот же сайт: POST /api/pdf (прокси Vite → pdf-server).',
          'Проверка: откройте в браузере http://127.0.0.1:3001/health — должен быть {"ok":true}.',
          'Инструкция: docs-app/pdf-server/README.md',
          '',
          msg ? `Детали: ${msg}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
    }
  }
  if (targetPrintUrl) {
    window.alert(
      [
        'Для этого PDF нужен сервис печати (pdf-server). В production задайте VITE_PDF_SERVICE_URL при сборке фронта.',
        'Инструкция: docs-app/pdf-server/README.md',
      ].join('\n'),
    )
    return
  }
  if (!apiUrl && !import.meta.env.DEV) {
    console.warn(
      '[PDF] В прод-сборке не задан VITE_PDF_SERVICE_URL — скачивается растровый PDF (html2pdf), не текстовый. См. docs-app/.env.example и pdf-server/README.md',
    )
  }
  await runArticlePdfExportHtml2Pdf(rootEl, { filename })
}
