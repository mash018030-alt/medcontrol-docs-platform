/**
 * Сервис PDF: headless Chromium печатает страницу как в браузере.
 * Запрос: POST /api/pdf  { "url": "https://…/path?mc_pdf=1&…" }
 *
 * Переменные окружения:
 *   PORT              — порт (по умолчанию 3001)
 *   ALLOWED_HOSTS     — через запятую, напр. localhost:5174,127.0.0.1:5174,docs.example.com
 *   CORS_ORIGIN              — Origin фронта или * (по умолчанию *)
 *   PDF_SINGLE_PAGE_MAX_PX        — если высота .docs-markdown-root не больше этого (по умолч. 24000),
 *                                   и расчётная высота страницы в мм не превышает лимит Chromium — PDF одной длинной страницей.
 *                                   Иначе — многостраничный A4.
 *   PDF_MAX_SINGLE_PAGE_HEIGHT_MM — потолок высоты одной PDF-страницы в мм (по умолч. 5000, не выше лимита Chromium ~5080).
 */
import express from 'express'
import cors from 'cors'
import { chromium } from 'playwright'

const PORT = Number(process.env.PORT) || 3001
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)
/** Типичные порты Vite (strictPort: false → 5175, 5176…); иначе Playwright получает 403 «хост не в списке». */
const DEFAULT_ALLOWED = (() => {
  const hosts = ['localhost', '127.0.0.1']
  const ports = []
  for (let p = 5173; p <= 5200; p++) ports.push(p)
  ports.push(3000, 4173, 4174, 4175)
  const out = []
  for (const h of hosts) {
    for (const p of ports) {
      out.push(`${h}:${p}`)
    }
  }
  return [...new Set(out)]
})()

function hostAllowed(host) {
  const h = host.toLowerCase()
  if (ALLOWED_HOSTS.length) return ALLOWED_HOSTS.includes(h)
  return DEFAULT_ALLOWED.includes(h)
}

/** Chromium ограничивает размер одной «страницы» при печати (~200 дюймов по стороне). Иначе page.pdf падает → 500. */
const CHROME_MAX_PDF_PAGE_HEIGHT_MM = 5000

/**
 * localhost / ::1 из URL пользователя приводим к 127.0.0.1, чтобы headless не ходил в IPv6,
 * когда Vite слушает только IPv4 (типично на Windows).
 */
function navigationUrlForPlaywright(printUrl) {
  const u = new URL(printUrl)
  const h = u.hostname.toLowerCase()
  if (h === 'localhost' || h === '[::1]' || h === '::1') {
    u.hostname = '127.0.0.1'
  }
  return u.href
}

const app = express()
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
)
app.use(express.json({ limit: '16kb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/pdf', async (req, res) => {
  const rawUrl = req.body?.url
  if (!rawUrl || typeof rawUrl !== 'string') {
    res.status(400).json({ error: 'Требуется поле url (строка)' })
    return
  }

  let target
  try {
    target = new URL(rawUrl)
  } catch {
    res.status(400).json({ error: 'Некорректный URL' })
    return
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    res.status(403).json({ error: 'Разрешены только http/https' })
    return
  }

  if (!hostAllowed(target.host)) {
    res.status(403).json({ error: `Хост не в списке разрешённых: ${target.host}` })
    return
  }

  if (target.searchParams.get('mc_pdf') !== '1') {
    res.status(400).json({ error: 'В URL должен быть параметр mc_pdf=1' })
    return
  }

  let browser
  try {
    const navigateTo = navigationUrlForPlaywright(target.href)
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(navigateTo, { waitUntil: 'load', timeout: 120_000 })
    await page.waitForSelector('.docs-markdown-root', { timeout: 60_000, state: 'attached' })
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => {
        d.open = true
      })
    })
    await new Promise((r) => setTimeout(r, 450))

    const scrollHeight = await page.evaluate(() => {
      const r = document.querySelector('.docs-markdown-root')
      return r ? r.scrollHeight : document.documentElement.scrollHeight
    })

    const maxSinglePx = Number(process.env.PDF_SINGLE_PAGE_MAX_PX) || 24000
    const margin = { top: 10, right: 12, bottom: 10, left: 12 }
    const heightMmFromContent = Math.ceil((scrollHeight / 96) * 25.4 + margin.top + margin.bottom + 24)
    const maxCustomPageHeightMm = Math.min(
      Number(process.env.PDF_MAX_SINGLE_PAGE_HEIGHT_MM) || CHROME_MAX_PDF_PAGE_HEIGHT_MM,
      CHROME_MAX_PDF_PAGE_HEIGHT_MM,
    )

    let pdfBuffer
    const marginPdf = {
      top: `${margin.top}mm`,
      right: `${margin.right}mm`,
      bottom: `${margin.bottom}mm`,
      left: `${margin.left}mm`,
    }

    if (scrollHeight <= maxSinglePx && heightMmFromContent <= maxCustomPageHeightMm) {
      try {
        pdfBuffer = await page.pdf({
          width: '210mm',
          height: `${heightMmFromContent}mm`,
          printBackground: true,
          margin: marginPdf,
        })
      } catch (e) {
        console.warn('[pdf-server] одностраничный PDF не удался, режим A4:', e.message)
        pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
        })
      }
    } else {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="article.pdf"')
    res.send(Buffer.from(pdfBuffer))
  } catch (e) {
    console.error('[pdf-server]', e)
    const errText =
      e && typeof e === 'object' && 'message' in e && String(e.message).trim()
        ? String(e.message)
        : String(e)
    res.status(500).json({ error: errText || 'Ошибка генерации PDF' })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
})

app.listen(PORT, () => {
  console.log(`docs-pdf-server слушает http://127.0.0.1:${PORT}`)
  console.log(`ALLOWED_HOSTS: ${ALLOWED_HOSTS.length ? ALLOWED_HOSTS.join(', ') : DEFAULT_ALLOWED.join(', ')}`)
})
