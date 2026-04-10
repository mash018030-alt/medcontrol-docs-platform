import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { newsArticleMdRelPaths } from '../src/data/newsArticlePaths.js'

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

const contentRoot = path.join(root, '..', 'content')
const newsTreePath = fs.existsSync(path.join(contentRoot, '1_news/news_tree.json'))
  ? path.join(contentRoot, '1_news/news_tree.json')
  : path.join(contentRoot, '1_news/news-tree.json')
const newsTree = JSON.parse(fs.readFileSync(newsTreePath, 'utf8'))

function walkNews(nodes, out = []) {
  for (const n of nodes || []) {
    if (n.path) out.push(n.path.replace(/^\//, ''))
    if (n.children) walkNews(n.children, out)
  }
  return out
}
const newsPaths = new Set(walkNews(newsTree.tree))

const contentDir = contentRoot

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

const navPathIssues = []
const issues = []
const warnings = []
const mdFiles = []

for (const ap of docSet) {
  const mdPath = path.join(contentDir, `${ap}.md`)
  if (!fs.existsSync(mdPath)) {
    navPathIssues.push({
      file: 'engine/src/data/nav.js',
      url: ap,
      reason: `flatArticles: отсутствует content/${ap}.md`,
    })
  }
}

function walkDir(d, rel = '') {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name)
    const r = rel ? `${rel}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      /* Служебная документация контент-репо — не статьи сайта */
      if (
        rel === '' &&
        (ent.name === 'docs' ||
          ent.name === 'references' ||
          ent.name === 'repo_docs' ||
          ent.name === 'repo-docs')
      )
        continue
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

    let normNews = p
    if (p.startsWith('News/')) normNews = `news/${p.slice(5)}`
    else if (p.startsWith('1_news/')) normNews = `news/${p.slice('1_news/'.length)}`
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

console.log('=== flatArticles → content/<path>.md ===')
console.log(
  navPathIssues.length ? navPathIssues.map((i) => JSON.stringify(i)).join('\n') : '(все пути из nav имеют файл)',
)

console.log('\n=== Broken / unknown internal links ===')
console.log(issues.length ? issues.map((i) => JSON.stringify(i)).join('\n') : '(none)')

console.log('\n=== md exists but not in nav (flatArticles) ===')
console.log(warnings.length ? warnings.map((w) => JSON.stringify(w)).join('\n') : '(none)')

// Anchor checks for FAQ table links
const anchorTargets = [
  { md: '0_docs/2_admin/articles/02_organizacii_00.md', ids: ['создание-дочерней-организации'] },
  { md: '0_docs/2_admin/articles/02_organizacii_01_deystviya_s_organizaciej.md', ids: ['редактирование'] },
  {
    md: '0_docs/2_admin/articles/02_organizacii_02_nastroyki_organizacii.md',
    ids: ['настройки-организации', 'виды-осмотров'],
  },
  { md: '0_docs/2_admin/articles/07_osmotry.md', ids: ['ручные-операции-над-осмотрами'] },
  { md: '0_docs/2_admin/articles/08_pak.md', ids: ['создание-пак'] },
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

    /** #якорь в той же статье: для 1_news/.../articles/*.md маршрут news/... иначе строится неверно */
    const sameFileNewsArticle =
      (!pathPart || pathPart === '/') && /^1_news\/[^/]+\/articles\//.test(f.rel)

    if (sameFileNewsArticle) {
      targetRoute = ''
    } else if (!pathPart || pathPart === '/') {
      let tr = f.rel.replace(/\.md$/, '')
      tr = tr.replace(/^News\//, '').replace(/^1_news\//, 'news/')
      if (!tr.startsWith('news/') && !tr.includes('/')) {
        tr = `news/${tr}`
      }
      targetRoute = tr
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
    if (sameFileNewsArticle) {
      targetFile = f.full
    } else if (targetRoute.startsWith('news/')) {
      targetFile = null
      for (const rel of newsArticleMdRelPaths(newsTree.tree, targetRoute)) {
        const candidate = path.join(contentDir, rel)
        if (fs.existsSync(candidate)) {
          targetFile = candidate
          break
        }
      }
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

const linkProblems = navPathIssues.length + issues.length + hashIssues.length
if (linkProblems > 0) {
  console.error(
    `\ncheck-internal-links: ${navPathIssues.length} nav/content, ${issues.length} broken/unknown links, ${hashIssues.length} hash issues — exit 1 (только отчёт: LINK_CHECK_STRICT=0)`,
  )
  if (process.env.LINK_CHECK_STRICT === '0') process.exit(0)
  process.exit(1)
}
