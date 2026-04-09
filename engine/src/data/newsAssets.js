/** Публичный URL к файлу внутри public/content/1_news (PDF, изображения и т.д.) */
export function newsAssetPublicUrl(relPath) {
  const trimmed = String(relPath || '').replace(/^\/+/, '')
  if (!trimmed) return ''
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  const encoded = trimmed
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  const p = `${base}/content/1_news/${encoded}`.replace(/^\/+/, '/')
  return new URL(p, window.location.origin).href
}
