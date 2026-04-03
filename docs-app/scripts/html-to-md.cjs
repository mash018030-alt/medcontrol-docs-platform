/**
 * Конвертация HTML (экспорт Google Docs) в Markdown для платформы документации.
 * Копирует картинки в public/content/images/<section>/ и подставляет пути.
 *
 * Запуск из docs-app:
 *   node scripts/html-to-md.cjs           — раздел «Медадминистратор» (4-rukovodstvo)
 *   node scripts/html-to-md.cjs admin      — раздел «Admin» (2. Администрирование)
 *   node scripts/html-to-md.cjs obshee    — раздел «Общее» (1. Общее. MC Cloud), без титула/содержания/аннотации/рекомендации
 *   node scripts/html-to-md.cjs medkabinet — раздел «Медкабинет» (источник: public/content/references/manuals/medkabinet-extract)
 *
 * Исходники HTML лежат в репозитории контента: public/content/references/ (submodule).
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('node-html-parser')
const TurndownService = require('turndown')

const CONTENT_ROOT = path.resolve(__dirname, '../public/content')
const REF_ROOT = path.join(CONTENT_ROOT, 'references')
const arg = process.argv[2]
const isAdmin = arg === 'admin'
const isObshee = arg === 'obshee'
const isMedkabinet = arg === 'medkabinet'

const config = isAdmin
  ? {
      INPUT_HTML: path.join(REF_ROOT, 'manuals/admin_extract/2..MCCloud..html'),
      INPUT_IMAGES: path.join(REF_ROOT, 'manuals/admin_extract/images'),
      OUTPUT_MD: path.join(CONTENT_ROOT, 'admin/user-guide.md'),
      OUTPUT_IMAGES: path.join(CONTENT_ROOT, 'images/admin'),
      IMAGE_URL_PREFIX: '/content/images/admin',
      TITLE: 'Администрирование. MC Cloud. Руководство пользователя',
      SKIP_UNTIL: null,
    }
  : isObshee
  ? {
      INPUT_HTML: path.join(REF_ROOT, 'manuals/1-obshee-extract/1..MCCloud..html'),
      INPUT_IMAGES: path.join(REF_ROOT, 'manuals/1-obshee-extract/images'),
      OUTPUT_MD: path.join(CONTENT_ROOT, 'obshee/user-guide.md'),
      OUTPUT_IMAGES: path.join(CONTENT_ROOT, 'images/obshee'),
      IMAGE_URL_PREFIX: '/content/images/obshee',
      TITLE: 'Общее. MC Cloud. Руководство пользователя',
      SKIP_UNTIL: 'АВТОРИЗАЦИЯ В АРМ',
    }
  : isMedkabinet
  ? {
      INPUT_HTML: path.join(REF_ROOT, 'manuals/medkabinet-extract/3..MCCloud..html'),
      INPUT_IMAGES: path.join(REF_ROOT, 'manuals/medkabinet-extract/images'),
      OUTPUT_MD: path.join(CONTENT_ROOT, 'medkabinet/user-guide.md'),
      OUTPUT_IMAGES: path.join(CONTENT_ROOT, 'images/medkabinet'),
      IMAGE_URL_PREFIX: '/content/images/medkabinet',
      TITLE: 'Медкабинет',
      SKIP_UNTIL: null,
    }
  : {
      INPUT_HTML: path.join(REF_ROOT, 'manuals/4-rukovodstvo/4..MCCloud..html'),
      INPUT_IMAGES: path.join(REF_ROOT, 'manuals/4-rukovodstvo/images'),
      OUTPUT_MD: path.join(CONTENT_ROOT, 'rukovodstvo/user-guide.md'),
      OUTPUT_IMAGES: path.join(CONTENT_ROOT, 'images/rukovodstvo'),
      IMAGE_URL_PREFIX: '/content/images/rukovodstvo',
      TITLE: 'Руководство пользователя. Медицинский администратор MC Cloud',
      SKIP_UNTIL: null,
    }

const { INPUT_HTML, INPUT_IMAGES, OUTPUT_MD, OUTPUT_IMAGES, IMAGE_URL_PREFIX, TITLE, SKIP_UNTIL } = config

function findFirstElementWithText(node, text, options = {}) {
  if (node.nodeType !== 1) return null
  if (node.textContent && node.textContent.trim().includes(text)) {
    const raw = node.textContent.trim()
    if (options.notFollowedByPageNum && /\d\s*$/.test(raw)) return null
    let p = node.parentNode
    while (p && p.tagName !== 'BODY') {
      if (p.tagName === 'A') return null
      p = p.parentNode
    }
    return node
  }
  for (const child of node.childNodes) {
    const found = findFirstElementWithText(child, text, options)
    if (found) return found
  }
  return null
}

function getBodyHtmlFromFirstContent(body, skipUntil, options = {}) {
  if (!skipUntil) return body.innerHTML
  const startEl = findFirstElementWithText(body, skipUntil, options)
  if (!startEl) {
    console.warn('Не найден текст для начала контента:', skipUntil, '— беру весь body')
    return body.innerHTML
  }
  let block = startEl
  while (block.parentNode && block.parentNode !== body) block = block.parentNode
  const children = body.childNodes
  let startIndex = -1
  for (let i = 0; i < children.length; i++) {
    if (children[i] === block) {
      startIndex = i
      break
    }
  }
  if (startIndex < 0) return body.innerHTML
  let html = ''
  const startOuter = startEl.outerHTML || startEl.toString()
  if (block === startEl) {
    for (let i = startIndex; i < children.length; i++) {
      const n = children[i]
      html += n.toString ? n.toString() : (n.outerHTML || '')
    }
  } else {
    const blockHtml = block.toString ? block.toString() : block.innerHTML
    const pos = blockHtml.indexOf(startOuter)
    if (pos >= 0) {
      html = blockHtml.substring(pos)
      for (let i = startIndex + 1; i < children.length; i++) {
        const n = children[i]
        html += n.toString ? n.toString() : (n.outerHTML || '')
      }
    } else {
      html = block.innerHTML
      for (let i = startIndex + 1; i < children.length; i++) {
        const n = children[i]
        html += n.toString ? n.toString() : (n.outerHTML || '')
      }
    }
  }
  console.log('Пропущены титул, содержание, аннотация, рекомендация. Контент с:', skipUntil)
  return html
}

function main() {
  console.log('Читаю HTML...', INPUT_HTML)
  const html = fs.readFileSync(INPUT_HTML, 'utf8')
  const root = parse(html)
  const body = root.querySelector('body')
  if (!body) {
    console.error('Тег <body> не найден')
    process.exit(1)
  }

  const bodyHtml = getBodyHtmlFromFirstContent(body, SKIP_UNTIL, { notFollowedByPageNum: true })
  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  turndown.addRule('images', {
    filter: 'img',
    replacement: (content, node) => {
      const src = node.getAttribute('src')
      if (!src) return ''
      const basename = path.basename(src)
      return `\n\n![${basename}](${IMAGE_URL_PREFIX}/${basename})\n\n`
    }
  })

  console.log('Конвертирую в Markdown...')
  let md = turndown.turndown(bodyHtml)

  md = md.replace(/\n{4,}/g, '\n\n\n').replace(/^\s+|\s+$/gm, '').trim()
  if (isObshee && SKIP_UNTIL) {
    let idx = md.indexOf('* * *# АВТОРИЗАЦИЯ')
    if (idx < 0) idx = md.indexOf('# АВТОРИЗАЦИЯ В АРМ')
    if (idx > 0) {
      md = md.substring(idx)
      md = md.replace(/^\* \* \*# /, '## ')
    .replace(/^(## АВТОРИЗАЦИЯ В АРМ)(Перед)/, '$1\n\n$2')
      md = md.replace(/^# АВТОРИЗАЦИЯ В АРМ/, '## АВТОРИЗАЦИЯ В АРМ')
      md = `# ${TITLE}\n\n` + md
      console.log('В Markdown обрезаны титул, содержание, аннотация, рекомендация.')
    }
  }
  if (!md.startsWith('# ')) {
    md = `# ${TITLE}\n\n` + md
  }

  fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true })
  fs.mkdirSync(OUTPUT_IMAGES, { recursive: true })

  console.log('Копирую картинки...')
  const imageFiles = fs.readdirSync(INPUT_IMAGES)
  for (const file of imageFiles) {
    const src = path.join(INPUT_IMAGES, file)
    const dest = path.join(OUTPUT_IMAGES, file)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest)
    }
  }

  // Неразрывные пробелы заменяем на обычные (по требованиям платформы)
  md = md.replace(/\u00A0/g, ' ')

  fs.writeFileSync(OUTPUT_MD, md, 'utf8')
  console.log('Готово.')
  console.log('  Markdown:', OUTPUT_MD)
  console.log('  Картинки:', OUTPUT_IMAGES, `(${imageFiles.length} файлов)`)
}

main()
