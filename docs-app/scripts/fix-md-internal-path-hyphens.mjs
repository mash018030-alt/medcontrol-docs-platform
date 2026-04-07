/**
 * После унификации имён контента (- → _): правит пути во внутренних Markdown-ссылках и картинках.
 * Фрагменты (#...) не меняются.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.join(__dirname, '..', 'public', 'content')

function rewritePathSegmentsHyphens(p) {
  return p.replace(/-/g, '_')
}

function shouldRewriteHref(href) {
  const h = href.trim()
  if (!h || h.startsWith('#')) return false
  if (/^https?:\/\//i.test(h) || /^mailto:/i.test(h)) return false
  if (
    h.startsWith('/0_docs/') ||
    h.startsWith('/1_news/') ||
    h.startsWith('/content/') ||
    h.startsWith('/images/') ||
    h.startsWith('/references/')
  )
    return true
  // относительные пути к статьям/ассетам (без схемы)
  if (!h.startsWith('/') && !h.includes('://') && /\.(md|png|jpe?g|gif|webp|svg|pdf)(\?|#|$)/i.test(h))
    return true
  if (!h.startsWith('/') && !h.includes('://') && /^\.\.?\//.test(h)) return true
  if (!h.startsWith('/') && !h.includes('://') && /articles\//.test(h)) return true
  return false
}

function processHref(href) {
  const trimmed = href.trim()
  const q = trimmed.indexOf('?')
  const hashIdx = trimmed.indexOf('#')
  let pathEnd = trimmed.length
  if (hashIdx >= 0) pathEnd = Math.min(pathEnd, hashIdx)
  if (q >= 0) pathEnd = Math.min(pathEnd, q)

  const pathPart = trimmed.slice(0, pathEnd)
  const rest = trimmed.slice(pathEnd)

  if (!shouldRewriteHref(pathPart || trimmed)) return href

  const newPath = rewritePathSegmentsHyphens(pathPart)
  return newPath + rest
}

function fixMarkdownBody(body) {
  let out = body

  // [text](url) и ![alt](url), опционально пробел + "title"
  out = out.replace(/\]\(([^)]+)\)/g, (full, inner) => {
    const m = /^(\S+)(\s+"(?:[^"\\]|\\.)*")$/.exec(inner.trim())
    const urlPart = m ? m[1] : inner.trim()
    const titlePart = m ? m[2] : ''
    return `](${processHref(urlPart)}${titlePart})`
  })

  // Ссылки в стиле reference: [ref]: url
  out = out.replace(/^(\[[^\]]+\]:\s*)(\S+)/gm, (line, prefix, url) => {
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return line
    return prefix + processHref(url)
  })

  return out
}

function walkMdFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'repo_docs' || ent.name === 'repo-docs') continue
      walkMdFiles(p, out)
    } else if (ent.name.endsWith('.md')) out.push(p)
  }
  return out
}

const files = walkMdFiles(contentDir)
let changed = 0
for (const f of files) {
  const rel = path.relative(contentDir, f)
  if (rel === 'README.md') continue
  const raw = fs.readFileSync(f, 'utf8')
  const next = fixMarkdownBody(raw)
  if (next !== raw) {
    fs.writeFileSync(f, next, 'utf8')
    changed++
  }
}
console.log(`fix-md-internal-path-hyphens: updated ${changed} file(s) under public/content`)
