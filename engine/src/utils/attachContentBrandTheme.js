/**
 * Подключает theme.css из репозитория контента (content/brand/theme.css → /content/brand/theme.css).
 * Вызывать после импорта App.css, чтобы переменные перекрывали нейтральные дефолты движка.
 *
 * Отключить (только нейтральные токены из App.css): в `engine/.env.local` задать
 * `VITE_DOCS_USE_CONTENT_THEME=0` и перезапустить `npm run dev`.
 */
export function attachContentBrandTheme() {
  if (typeof document === 'undefined') return
  const useTheme = import.meta.env.VITE_DOCS_USE_CONTENT_THEME
  if (useTheme === '0' || useTheme === 'false') return
  const id = 'docs-content-brand-theme'
  if (document.getElementById(id)) return

  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  const href = `${prefix}content/brand/theme.css`

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}
