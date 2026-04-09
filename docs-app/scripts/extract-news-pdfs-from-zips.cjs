/**
 * Достаёт PDF из zip-архивов релизов (как в поставке) в каталоги content/News.
 * Cloud: путь и имя файла как в news-tree.json (pdf).
 * Mobile: MC Mobile/<slug>/MC Mobile x.y.z.pdf (zip = имя релиза + .zip).
 *
 * Запуск из docs-app: node scripts/extract-news-pdfs-from-zips.cjs
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const CONTENT_ROOT = path.join(__dirname, '../../content')
const NEWS = path.join(CONTENT_ROOT, 'News')

function readNewsTreeJson() {
  const c = [
    path.join(CONTENT_ROOT, '1_news/news_tree.json'),
    path.join(CONTENT_ROOT, '1_news/news-tree.json'),
    path.join(CONTENT_ROOT, 'News/news_tree.json'),
    path.join(CONTENT_ROOT, 'News/news-tree.json'),
  ]
  for (const p of c) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'))
  }
  throw new Error('news tree JSON not found under public/content')
}

const TREE = readNewsTreeJson()

/** Имя .zip на диске не всегда совпадает с title из дерева */
const CLOUD_ZIP_OVERRIDE = {
  'MC Cloud 1.14 Patch': 'MC Cloud 1.14 Patch ВНУТРЕННИЙ.zip',
  'MC Cloud 1.16 Patch 1': 'MC Cloud 1.16 Patch. 1.zip',
  'MC Cloud 1.18 Patch (1–2)': 'MC Cloud 1.18 Patch. 1-2.zip',
}

function listZipEntries(zipPath) {
  const out = execSync(`unzip -Z1 "${zipPath}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function extractEntry(zipPath, entry, destFile) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'news-pdf-'))
  try {
    execSync(`unzip -oq "${zipPath}" "${entry.replace(/"/g, '\\"')}" -d "${tmp}"`, {
      stdio: 'pipe',
      maxBuffer: 20 * 1024 * 1024,
    })
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name)
        if (fs.statSync(p).isDirectory()) walk(p)
        else if (name.toLowerCase().endsWith('.pdf')) return p
      }
      return ''
    }
    const found = walk(tmp)
    if (!found) throw new Error(`PDF not found after unzip: ${entry}`)
    fs.mkdirSync(path.dirname(destFile), { recursive: true })
    fs.copyFileSync(found, destFile)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

function cloudLeaves(node, acc = []) {
  if (!node) return acc
  if (node.pdf) acc.push({ title: node.title, pdf: node.pdf })
  if (node.children) node.children.forEach((c) => cloudLeaves(c, acc))
  return acc
}

function mobileLeaves(node, acc = []) {
  if (!node) return acc
  if (node.path && /^news\/mc_mobile_/.test(node.path) && !node.children?.length) {
    acc.push({ title: node.title, path: node.path })
  }
  if (node.children) node.children.forEach((c) => mobileLeaves(c, acc))
  return acc
}

const cloud = cloudLeaves(TREE.tree?.[0])
const cloudDir = path.join(NEWS, 'MC Cloud')

for (const { title, pdf: rel } of cloud) {
  const zipName = CLOUD_ZIP_OVERRIDE[title] || `${title}.zip`
  const zipPath = path.join(cloudDir, zipName)
  if (!fs.existsSync(zipPath)) {
    console.warn('Нет архива:', zipPath)
    continue
  }
  const entries = listZipEntries(zipPath).filter((e) => /\.pdf$/i.test(e))
  if (entries.length === 0) {
    console.warn('В архиве нет PDF:', zipPath)
    continue
  }
  const dest = path.join(NEWS, rel)
  const expectBase = path.basename(rel)
  const pick =
    entries.find((e) => path.basename(e) === expectBase) ||
    entries.find((e) => path.basename(e).replace(/\s*\(\d+\)\s*\.pdf$/i, '.pdf') === expectBase) ||
    entries[0]
  extractEntry(zipPath, pick, dest)
  console.log('OK', title, '→', rel)
}

const mobileDir = path.join(NEWS, 'MC Mobile')
for (const { title, path: newsPath } of mobileLeaves(TREE.tree?.[0])) {
  const slug = newsPath.replace(/^news\//, '')
  const zipPath = path.join(mobileDir, `${title}.zip`)
  if (!fs.existsSync(zipPath)) {
    console.warn('Нет архива:', zipPath)
    continue
  }
  const entries = listZipEntries(zipPath).filter((e) => /\.pdf$/i.test(e))
  if (entries.length === 0) {
    console.warn('В архиве нет PDF:', zipPath)
    continue
  }
  const destName = `${title}.pdf`
  const dest = path.join(NEWS, 'MC Mobile', slug, destName)
  extractEntry(zipPath, entries[0], dest)
  console.log('OK Mobile', title, '→', path.join('MC Mobile', slug, destName))
}

console.log('Готово.')
