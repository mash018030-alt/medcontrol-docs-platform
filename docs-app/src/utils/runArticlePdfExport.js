import html2pdf from 'html2pdf.js'

const PDF_WIDTH_PX = 672

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
 * PDF через сервис Playwright (см. pdf-server/). Печатается страница по полному URL (с mc_pdf=1).
 */
async function runArticlePdfExportPlaywright(serviceBase, filename, printUrl) {
  const base = String(serviceBase).replace(/\/$/, '')
  const url = typeof printUrl === 'string' ? printUrl : String(printUrl)
  const res = await fetch(`${base}/api/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = await res.json()
      if (j.error) detail = j.error
    } catch {
      try {
        detail = await res.text()
      } catch {
        /* ignore */
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

    await html2pdf()
      .set({
        margin:16,
        filename,
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
          avoid: ['img', 'h1', 'h2', 'h3', 'h4', '.docs-carousel', '.docs-carousel-slide', '.docs-important'],
        },
      })
      .from(rootEl)
      .save()
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
  const service = import.meta.env.VITE_PDF_SERVICE_URL?.trim()
  if (!service) {
    window.alert(
      [
        'Скачивание PDF всего раздела доступно при запущенном сервисе печати.',
        'Задайте VITE_PDF_SERVICE_URL в .env.local и запустите docs-app/pdf-server — см. pdf-server/README.md.',
      ].join('\n'),
    )
    return
  }
  try {
    await runArticlePdfExportPlaywright(service, filename, printUrl)
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : String(e)
    window.alert(['Не удалось сформировать PDF раздела.', '', msg].filter(Boolean).join('\n'))
    throw e
  }
}

/**
 * Сначала Playwright (если задан VITE_PDF_SERVICE_URL), иначе html2pdf (растр — текст в PDF не выделяется).
 * @param {HTMLElement} rootEl корень контента статьи
 * @param {{ filename: string, printUrl?: string | null }} opts при printUrl печатается эта страница, rootEl для запаса не нужен
 */
export async function runArticlePdfExport(rootEl, { filename, printUrl = null }) {
  const service = import.meta.env.VITE_PDF_SERVICE_URL?.trim()
  const targetPrintUrl = printUrl || null
  if (service) {
    try {
      const url = targetPrintUrl ?? buildMcPdfUrlFromCurrentWindow()
      await runArticlePdfExportPlaywright(service, filename, url)
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
          'Проверьте: pdf-server запущен, VITE_PDF_SERVICE_URL верный, после правок .env перезапущен npm run dev.',
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
        'Для PDF всего раздела нужен сервис печати (VITE_PDF_SERVICE_URL + pdf-server).',
        'Инструкция: docs-app/pdf-server/README.md',
      ].join('\n'),
    )
    return
  }
  await runArticlePdfExportHtml2Pdf(rootEl, { filename })
}
