/**
 * Проверка: каждый заголовок из .md (кроме первого H1) встречается в тексте PDF из news-tree.
 * Запуск: node scripts/verify-news-md-vs-pdf.cjs
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const NEWS = path.join(__dirname, '../public/content/News')
const TREE = JSON.parse(fs.readFileSync(path.join(NEWS, 'news-tree.json'), 'utf8'))

function collectPdfLeaves(node, acc = []) {
  if (!node) return acc
  if (node.pdf && node.path?.startsWith('news/mc-cloud-')) acc.push(node)
  if (node.children) node.children.forEach((c) => collectPdfLeaves(c, acc))
  return acc
}

function pdfText(pdfRel) {
  const p = path.join(NEWS, pdfRel)
  if (!fs.existsSync(p)) return { err: `нет файла ${pdfRel}` }
  try {
    const t = execSync(`pdftotext -enc UTF-8 "${p}" -`, {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })
    return { t }
  } catch (e) {
    return { err: String(e.message) }
  }
}

function mdHeadings(mdPath) {
  const md = fs.readFileSync(mdPath, 'utf8')
  const lines = md.split(/\r?\n/)
  const heads = []
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/)
    if (m) heads.push({ level: m[1].length, text: m[2].trim() })
  }
  return heads
}

function normalize(s) {
  return s
    .replace(/\u00ad/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const leaves = collectPdfLeaves(TREE.tree?.[0])
let bad = 0
for (const leaf of leaves) {
  const slug = leaf.path.replace(/^news\//, '')
  const mdPath = path.join(NEWS, `${slug}.md`)
  const { t, err } = pdfText(leaf.pdf)
  if (err) {
    console.error('SKIP', slug, err)
    bad++
    continue
  }
  if (!fs.existsSync(mdPath)) {
    console.error('Нет MD:', mdPath)
    bad++
    continue
  }
  const heads = mdHeadings(mdPath)
  const pdfN = normalize(t)
  const miss = []
  for (let i = 0; i < heads.length; i++) {
    if (i === 0 && heads[i].level === 1) continue
    const h = normalize(heads[i].text)
    if (h.length < 3) continue
    if (!pdfN.includes(h)) miss.push(heads[i].text)
  }
  if (miss.length) {
    console.error('FAIL', slug, 'не в PDF:', miss.slice(0, 6).join(' | '))
    bad++
  } else {
    console.log('OK', slug)
  }
}

if (bad) process.exit(1)
