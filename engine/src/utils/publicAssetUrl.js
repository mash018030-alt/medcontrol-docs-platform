/**
 * Корневые пути из markdown/HTML (/content/…, /medkabinet/…) при base ≠ '/'
 * (например GitHub Pages: /repo-name/).
 */
export function publicAssetUrl(path) {
  if (path == null || typeof path !== 'string') return path
  const s = path.trim()
  if (!s) return path
  if (s.startsWith('#')) return path
  if (/^(?:https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) return path
  if (s.startsWith('/')) {
    let assetPath = s
    /* Старые ссылки в релизах: /content/News/… → фактическая папка 1_news */
    if (assetPath.startsWith('/content/News/')) {
      assetPath = `/content/1_news/${assetPath.slice('/content/News/'.length)}`
    }
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    if (!base) return assetPath
    if (assetPath === base || assetPath.startsWith(`${base}/`)) return assetPath
    return `${base}${assetPath}`
  }
  return path
}

/**
 * Путь для React Router <Link to={…}>: убрать дублирующий префикс BASE_URL, если href уже
 * содержит подкаталог деплоя (старые сборки, сырой HTML).
 */
export function routerLinkTo(href) {
  if (href == null || typeof href !== 'string') return href
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  if (!base) return href
  const i = href.indexOf('#')
  const pathPart = i >= 0 ? href.slice(0, i) : href
  const frag = i >= 0 ? href.slice(i) : ''
  let p = pathPart
  if (p === base || p.startsWith(`${base}/`)) {
    p = p.slice(base.length) || '/'
  }
  return `${p}${frag}`
}
