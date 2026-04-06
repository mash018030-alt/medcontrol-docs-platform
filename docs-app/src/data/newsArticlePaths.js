/**
 * Пути к .md релизов под public/content:
 * новая раскладка — 1_news/0_mc_cloud/articles|1_news/1_mc_mobile/articles;
 * запасной вариант — плоский 1_news/{slug}.md (как раньше).
 */

function mdFileSlugFromNewsPath(fullSlug) {
  const parts = String(fullSlug || '').split('/')
  return parts[parts.length - 1] || ''
}

function findNewsPathTrail(nodes, targetSlug, trail = []) {
  if (!Array.isArray(nodes)) return null
  for (const n of nodes) {
    if (!n?.path) continue
    const next = [...trail, n.path]
    if (n.path === targetSlug) return next
    if (n.children?.length) {
      const r = findNewsPathTrail(n.children, targetSlug, next)
      if (r) return r
    }
  }
  return null
}

/**
 * Каталог продукта внутри 1_news (рядом с articles/ и images/).
 * @param {string[] | null} trail — цепочка path от корня дерева до листа
 * @returns {'0_mc_cloud' | '1_mc_mobile' | null}
 */
export function newsArticlesPackDirFromTrail(trail) {
  if (!trail?.length) return null
  if (trail.includes('news/mc-mobile')) return '1_mc_mobile'
  if (trail.includes('news/mc-cloud')) return '0_mc_cloud'
  return null
}

/**
 * Относительные пути к .md относительно public/content (в порядке попытки загрузки).
 * @param {unknown[]} tree — массив из news-tree.json
 * @param {string} fullSlug — например news/mc-cloud-1-17
 * @returns {string[]}
 */
export function newsArticleMdRelPaths(tree, fullSlug) {
  const fileSlug = mdFileSlugFromNewsPath(fullSlug)
  if (!fileSlug) return []
  const trail = findNewsPathTrail(tree, fullSlug)
  const pack = newsArticlesPackDirFromTrail(trail)
  const paths = []
  if (pack) paths.push(`1_news/${pack}/articles/${fileSlug}.md`)
  paths.push(`1_news/${fileSlug}.md`)
  return paths
}
