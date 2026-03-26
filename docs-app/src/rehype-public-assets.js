/**
 * Префикс BASE_URL для путей в сыром HTML (rehype-raw): img src, a href и т.д.
 * Нужно для GitHub Pages (/repo-name/).
 */
function rewriteNode(node, base) {
  if (!node || typeof node !== 'object') return
  if (node.type === 'element') {
    const tag = node.tagName
    const props = node.properties || {}
    if (tag === 'img' && props.src != null) {
      const src = String(props.src)
      if (src.startsWith('/') && !src.startsWith('//')) props.src = `${base}${src}`
    }
    if (tag === 'a' && props.href != null) {
      const href = String(props.href)
      if (href.startsWith('/') && !href.startsWith('//')) props.href = `${base}${href}`
    }
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
