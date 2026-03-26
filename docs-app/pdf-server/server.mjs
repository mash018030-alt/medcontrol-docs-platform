/**
 * Сервис PDF: headless Chromium печатает страницу как в браузере.
 * Запрос: POST /api/pdf  { "url": "https://…/path?mc_pdf=1&…" }
 *
 * Переменные окружения:
 *   PORT              — порт (по умолчанию 3001)
 *   ALLOWED_HOSTS     — через запятую, напр. localhost:5174,127.0.0.1:5174,docs.example.com
 *   CORS_ORIGIN              — Origin фронта или * (по умолчанию *)
 *   PDF_SINGLE_PAGE_MAX_PX   — если высота .docs-markdown-root не больше этого (по умолч. 24000),
 *                                PDF одной длинной страницей A4 по ширине (без разрывов между секциями).
 *                                Иначе — многостраничный A4.
 */
import express from 'express'
import cors from 'cors'
import { chromium } from 'playwright'

const PORT = Number(process.env.PORT) || 3001
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)
const DEFAULT_ALLOWED = ['localhost:5174', '127.0.0.1:5174', 'localhost:3000', '127.0.0.1:3000']

function hostAllowed(host) {
  const h = host.toLowerCase()
  if (ALLOWED_HOSTS.length) return ALLOWED_HOSTS.includes(h)
  return DEFAULT_ALLOWED.includes(h)
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
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 120_000 })
    await page.waitForSelector('.docs-markdown-root', { timeout: 60_000 })
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
    const maxHeightMm = 13000

    let pdfBuffer
    const marginPdf = {
      top: `${margin.top}mm`,
      right: `${margin.right}mm`,
      bottom: `${margin.bottom}mm`,
      left: `${margin.left}mm`,
    }

    if (scrollHeight <= maxSinglePx && heightMmFromContent <= maxHeightMm) {
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
    res.status(500).json({ error: e.message || 'Ошибка генерации PDF' })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
})

app.listen(PORT, () => {
  console.log(`docs-pdf-server слушает http://127.0.0.1:${PORT}`)
  console.log(`ALLOWED_HOSTS: ${ALLOWED_HOSTS.length ? ALLOWED_HOSTS.join(', ') : DEFAULT_ALLOWED.join(', ')}`)
})
