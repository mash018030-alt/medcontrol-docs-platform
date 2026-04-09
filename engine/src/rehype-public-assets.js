/**
 * Префикс BASE_URL для статики в сыром HTML (rehype-raw), которую React не оборачивает
 * своими компонентами: например <video><source src="…">.
 *
 * Не трогаем <a> и <img>: у react-markdown для них href/src остаются вида /obshee/… или /content/…,
 * а префикс подкаталога добавляют <Link> (basename) и publicAssetUrl в MarkdownImg / кастомных «a».
 * Двойной префикс ломал маршруты (/repo/repo/obshee/…) и картинки на GitHub Pages.
 */
function rewriteNode(node, base) {
  if (!node || typeof node !== 'object') return
  if (node.type === 'element') {
    const tag = node.tagName
    const props = node.properties || {}
    if (tag === 'source' && props.src != null) {
      const src = String(props.src)
      if (src.startsWith('/') && !src.startsWith('//')) props.src = `${base}${src}`
    }
  }
  const ch = node.children
  if (Array.isArray(ch)) {
    for (const c of ch) rewriteNode(c, base)
  }
}

export function rehypePublicAssets() {
  return (tree) => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    if (base) rewriteNode(tree, base)
    return tree
  }
}
