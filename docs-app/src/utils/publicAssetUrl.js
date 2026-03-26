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
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return base ? `${base}${s}` : s
  }
  return path
}
