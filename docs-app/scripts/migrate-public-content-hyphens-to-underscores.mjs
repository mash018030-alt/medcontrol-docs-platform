/**
 * Одноразовая миграция: в именах файлов и каталогов под public/content
 * заменяет дефисы на подчёркивания (кроме пропускаемых имён).
 * Порядок: сначала самые глубокие пути.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = path.join(__dirname, '../public/content')

const SKIP_TOP_LEVEL = new Set(['README.md'])

function collectEntries(root, rel = '') {
  const out = []
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, ent.name)
    const r = rel ? `${rel}/${ent.name}` : ent.name
    out.push({ full, name: ent.name, rel: r, isDir: ent.isDirectory() })
    if (ent.isDirectory()) {
      out.push(...collectEntries(full, r))
    }
  }
  return out
}

function needsRename(name) {
  return name.includes('-')
}

/** Имя без изменений на части пути — оставить как есть */
function toUnderscoreName(name) {
  return name.replace(/-/g, '_')
}

function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error('No', CONTENT_ROOT)
    process.exit(1)
  }
  const all = collectEntries(CONTENT_ROOT)
  const toRename = all.filter((e) => needsRename(e.name))
  toRename.sort((a, b) => b.rel.split('/').length - a.rel.split('/').length)

  for (const { full, name, rel } of toRename) {
    const parent = path.dirname(full)
    const next = toUnderscoreName(name)
    const dest = path.join(parent, next)
    if (fs.existsSync(dest)) {
      console.warn('Skip (exists):', rel, '→', next)
      continue
    }
    fs.renameSync(full, dest)
    console.log('Rename:', rel, '→', path.relative(CONTENT_ROOT, dest).split(path.sep).join('/'))
  }
  console.log('Done. Update news-tree paths and markdown links if needed.')
}

main()
