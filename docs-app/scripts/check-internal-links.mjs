import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const navSrc = fs.readFileSync(path.join(root, 'src/data/nav.js'), 'utf8')
const faStart = navSrc.indexOf('export const flatArticles = [')
if (faStart < 0) throw new Error('flatArticles not found')
const bracketStart = navSrc.indexOf('[', faStart)
const bracketEnd = navSrc.indexOf('\n]', bracketStart)
if (bracketStart < 0 || bracketEnd < 0) throw new Error('flatArticles array bounds not found')
const arr = navSrc.slice(bracketStart, bracketEnd + 2)
const flatArticles = [...arr.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])
const docSet = new Set(flatArticles)

const newsTree = JSON.parse(
  fs.readFileSync(path.join(root, 'public/content/News/news-tree.json'), 'utf8'),
)

function walkNews(nodes, out = []) {
  for (const n of nodes || []) {
    if (n.path) out.push(n.path.replace(/^\//, ''))
    if (n.children) walkNews(n.children, out)
  }
  return out
}
const newsPaths = new Set(walkNews(newsTree.tree))

const contentDir = path.join(root, 'public/content')

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0400-\u04FF-]/g, '')
}

function extractMdLinks(md) {
  const links = []
  const re = /\[[^\]]*\]\(([^)]+)\)/g
  let m
  while ((m = re.exec(md)) !== null) {
    const start = m.index
    if (start > 0 && md[start - 1] === '!') continue
    links.push(m[1].trim())
  }
  return links
}

const issues = []
const warnings = []
const mdFiles = []

function walkDir(d, rel = '') {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name)
    const r = rel ? `${rel}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      /* Служебная документация контент-репо (план миграции, архив чата) — не статьи сайта */
      if (rel === '' && ent.name === 'docs') continue
      walkDir(p, r)
    } else if (ent.name.endsWith('.md')) mdFiles.push({ full: p, rel: r.split(path.sep).join('/') })
  }
}
walkDir(contentDir)

for (const f of mdFiles) {
  if (f.rel === 'README.md') continue
  const md = fs.readFileSync(f.full, 'utf8')
  for (const url of extractMdLinks(md)) {
    if (!url || url.startsWith('#')) continue
    if (/^https?:\/\//i.test(url)) continue
    if (/^mailto:/i.test(url)) continue
    if (url.startsWith('/content/')) continue

    const [pathPart] = url.split('#')
    let p = pathPart

    if (p.startsWith('/')) p = p.replace(/^\//, '')
    else if (!p.startsWith('http')) {
      const dir = path.posix.dirname(f.rel)
      const combined = path.posix.normalize(`${dir}/${p}`)
      p = combined.replace(/^\.\//, '')
      if (p.endsWith('.md')) p = p.slice(0, -3)
    }

    if (!p) continue

    const normNews = p.startsWith('News/') ? `news/${p.slice(5)}` : p
    const isNewsTarget = normNews.startsWith('news/')

    if (isNewsTarget) {
      if (!newsPaths.has(normNews)) {
        issues.push({ file: f.rel, url, reason: `news path not in tree: ${normNews}` })
      }
    } else if (docSet.has(p)) {
      /* ok */
    } else if (fs.existsSync(path.join(contentDir, `${p}.md`))) {
      warnings.push({ file: f.rel, url, reason: `md exists but not in flatArticles: ${p}` })
    } else {
      issues.push({ file: f.rel, url, reason: `unknown doc path: ${p}` })
    }
  }
}

console.log('=== Broken / unknown internal links ===')
console.log(issues.length ? issues.map((i) => JSON.stringify(i)).join('\n') : '(none)')

console.log('\n=== md exists but not in nav (flatArticles) ===')
console.log(warnings.length ? warnings.map((w) => JSON.stringify(w)).join('\n') : '(none)')

// Anchor checks for FAQ table links
const anchorTargets = [
  { md: 'admin/organizacii.md', ids: ['создание-дочерней-организации'] },
  { md: 'admin/deystviya-s-organizaciej.md', ids: ['редактирование'] },
  { md: 'admin/nastroyki-organizacii.md', ids: ['настройки-организации', 'виды-осмотров'] },
  { md: 'admin/osmotry.md', ids: ['ручные-операции-над-осмотрами'] },
  { md: 'admin/pak.md', ids: ['создание-пак'] },
]

function headingsFromMd(body) {
  const headings = []
  for (const line of body.split(/\r?\n/)) {
    const hm = line.match(/^(#{1,6})\s+(.+)$/)
    if (hm) headings.push(slugify(hm[2].replace(/\s*#+\s*$/, '').trim()))
  }
  return headings
}

for (const { md: tf, ids } of anchorTargets) {
  const full = path.join(contentDir, tf)
  if (!fs.existsSync(full)) continue
  const body = fs.readFileSync(full, 'utf8')
  const headings = headingsFromMd(body)
  for (const id of ids) {
    if (!headings.includes(id)) {
      console.log(`\nAnchor missing: ${tf} #${id}`)
      const close = headings.filter((h) => h.includes(id.slice(0, 6)))
      if (close.length) console.log(`  similar slugs: ${close.slice(0, 8).join(', ')}`)
    }
  }
}

console.log('\n=== Hash targets (in-page / cross-doc) ===')
const hashIssues = []
for (const f of mdFiles) {
  const md = fs.readFileSync(f.full, 'utf8')
  const re = /\[[^\]]*\]\(([^)]+)\)/g
  let m
  while ((m = re.exec(md)) !== null) {
    if (m.index > 0 && md[m.index - 1] === '!') continue
    const url = m[1].trim()
    const hashIdx = url.indexOf('#')
    if (hashIdx < 0) continue
    const frag = url.slice(hashIdx + 1)
    if (!frag || frag.startsWith('user-content-fn')) continue
    if (/^ftnt(eref)?(_back)?/i.test(frag)) continue
    let pathPart = hashIdx === 0 ? '' : url.slice(0, hashIdx)
    let targetRoute = ''
    if (pathPart.startsWith('http') || pathPart.startsWith('mailto:')) continue
    if (pathPart.startsWith('/content/')) continue

    if (!pathPart || pathPart === '/') {
      targetRoute = f.rel.replace(/\.md$/, '').replace(/^News\//, '')
      if (!targetRoute.startsWith('news/') && !targetRoute.includes('/')) {
        targetRoute = `news/${targetRoute}`
      }
    } else {
      let p = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart
      if (!pathPart.startsWith('/')) {
        const dir = path.posix.dirname(f.rel)
        p = path.posix.normalize(`${dir}/${p}`).replace(/^\.\//, '')
        if (p.endsWith('.md')) p = p.slice(0, -3)
      }
      targetRoute = p
    }

    let targetFile
    if (targetRoute.startsWith('news/')) {
      const base = targetRoute.replace(/^news\//, '')
      targetFile = path.join(contentDir, 'News', `${base}.md`)
    } else {
      targetFile = path.join(contentDir, `${targetRoute}.md`)
    }

    if (!fs.existsSync(targetFile)) {
      hashIssues.push({ file: f.rel, url, reason: `hash target md missing: ${targetFile}` })
      continue
    }
    const heads = headingsFromMd(fs.readFileSync(targetFile, 'utf8'))
    if (!heads.includes(frag)) {
      hashIssues.push({ file: f.rel, url, reason: `no heading id "${frag}" in ${path.relative(contentDir, targetFile)}` })
    }
  }
}
console.log(
  hashIssues.length ? hashIssues.map((h) => JSON.stringify(h)).join('\n') : '(all hash links resolved)',
)
