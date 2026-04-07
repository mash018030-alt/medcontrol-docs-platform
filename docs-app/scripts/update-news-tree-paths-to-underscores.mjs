/**
 * После переименования каталогов: в news_tree.json поля path и pdf
 * переводятся на сегменты с подчёркиваниями (дефис → _ в каждом сегменте пути).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const J = path.join(__dirname, '../public/content/1_news/news_tree.json')

function fixSlashes(p) {
  return p
    .split('/')
    .map((s) => s.replace(/-/g, '_'))
    .join('/')
}

function walk(nodes) {
  if (!Array.isArray(nodes)) return
  for (const n of nodes) {
    if (n.path) n.path = fixSlashes(n.path)
    if (n.pdf) n.pdf = fixSlashes(n.pdf)
    if (n.children?.length) walk(n.children)
  }
}

const data = JSON.parse(fs.readFileSync(J, 'utf8'))
walk(data.tree)
fs.writeFileSync(J, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
console.log('Updated', J)
