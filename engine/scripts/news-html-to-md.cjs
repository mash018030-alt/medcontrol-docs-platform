/**
 * Конвертация релиз-ноутс (HTML из папки News) в .md для отображения как обычные статьи.
 * Запуск из engine: node scripts/news-html-to-md.cjs
 */
const fs = require('fs')
const path = require('path')
const { parse } = require('node-html-parser')
const TurndownService = require('turndown')

const NEWS_DIR = path.join(__dirname, '../../content/News')

const RELEASES = [
  {
    slug: 'mc-cloud-1-12',
    title: 'MC Cloud 1.12',
    htmlFile: 'mc-cloud-1.12/MCCloud1.12.html',
    urlBase: '/content/News/mc-cloud-1.12',
  },
  {
    slug: 'mc-cloud-1-13',
    title: 'MC Cloud 1.13',
    htmlFile: 'mc-cloud-1.13/MCCloud1.13.html',
    urlBase: '/content/News/mc-cloud-1.13',
  },
  {
    slug: 'mc-cloud-1-13-patch',
    title: 'MC Cloud 1.13 Patch',
    htmlFile: 'mc-cloud-1-13-patch/MCCloud1.13Patch.html',
    urlBase: '/content/News/mc-cloud-1-13-patch',
  },
  {
    slug: 'mc-cloud-1-14',
    title: 'MC Cloud 1.14',
    htmlFile: 'mc-cloud-1-14/MCCloud1.14.html',
    urlBase: '/content/News/mc-cloud-1-14',
  },
  {
    slug: 'mc-cloud-1-15',
    title: 'MC Cloud 1.15',
    htmlFile: 'mc-cloud-1-15/MCCloud1.15.html',
    urlBase: '/content/News/mc-cloud-1.15',
  },
  {
    slug: 'mc-cloud-1-15-patch',
    title: 'MC Cloud 1.15 Patch',
    htmlFile: 'mc-cloud-1-15-patch/MCCloud1.15Patch.html',
    urlBase: '/content/News/mc-cloud-1-15-patch',
  },
  {
    slug: 'mc-cloud-1-16',
    title: 'MC Cloud 1.16',
    htmlFile: 'mc-cloud-1-16/MCCloud1.16.html',
    urlBase: '/content/News/mc-cloud-1-16',
  },
  {
    slug: 'mc-cloud-1-17',
    title: 'MC Cloud 1.17',
    htmlFile: 'mc-cloud-1-17/MCCloud1.17.html',
    urlBase: '/content/News/mc-cloud-1-17',
  },
  {
    slug: 'mc-cloud-1-18',
    title: 'MC Cloud 1.18',
    htmlFile: 'mc-cloud-1-18/MCCloud1.18.html',
    urlBase: '/content/News/mc-cloud-1-18',
  },
]

/**
 * Шапка экспорта Google Docs: «MEDCONTROL CLOUD», логотип, «ЧТО НОВОГО В ВЕРСИИ…»,
 * затем дублирующий абзац с тем же заголовком, что и у статьи (class title).
 */
function stripGoogleDocsReleaseHeader(body, title) {
  const normalizedTitle = title.replace(/\s+/g, ' ').trim()
  const elementChildren = () => body.childNodes.filter((n) => n.nodeType === 1)

  const first = elementChildren()[0]
  if (first) {
    const tag = (first.tagName || '').toLowerCase()
    if (tag === 'div' && /MEDCONTROL\s+CLOUD/i.test(first.textContent || '')) {
      first.remove()
    }
  }

  for (;;) {
    const el = elementChildren()[0]
    if (!el) break
    const tag = (el.tagName || '').toLowerCase()
    if (tag !== 'p') break
    const cls = el.getAttribute('class') || ''
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (cls.includes('title') && text === normalizedTitle) {
      el.remove()
      continue
    }
    break
  }
}

function convertOne({ slug, title, htmlFile, urlBase }) {
  const htmlPath = path.join(NEWS_DIR, htmlFile)
  if (!fs.existsSync(htmlPath)) {
    console.warn('Пропуск (нет файла):', htmlPath)
    return
  }
  const html = fs.readFileSync(htmlPath, 'utf8')
  const root = parse(html)
  const body = root.querySelector('body')
  if (!body) {
    console.error('Нет body:', htmlPath)
    return
  }
  stripGoogleDocsReleaseHeader(body, title)
  const bodyHtml = body.innerHTML

  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  turndown.addRule('images', {
    filter: 'img',
    replacement: (content, node) => {
      const src = node.getAttribute('src')
      if (!src) return ''
      const rel = src.replace(/^\.\//, '').replace(/\\/g, '/')
      const fullUrl = rel.startsWith('http') ? rel : `${urlBase}/${rel}`
      const alt = (node.getAttribute('alt') || path.basename(rel)).replace(/[[\]]/g, '')
      return `\n\n![${alt}](${fullUrl})\n\n`
    },
  })

  let md = turndown.turndown(bodyHtml)
  md = md.replace(/\n{4,}/g, '\n\n\n').replace(/\u00A0/g, ' ').trim()
  if (!md.startsWith('# ')) {
    md = `# ${title}\n\n${md}`
  }

  const outPath = path.join(NEWS_DIR, `${slug}.md`)
  fs.writeFileSync(outPath, md, 'utf8')
  console.log('Записано:', outPath, `(${Math.round(md.length / 1024)} KB)`)
}

function main() {
  for (const r of RELEASES) {
    convertOne(r)
  }
  console.log('Готово.')
}

main()
