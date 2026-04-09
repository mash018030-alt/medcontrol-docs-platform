const DEFAULT = 'На главную документации'

/** Подпись для ссылки с логотипом (a11y). Переопределение: `VITE_DOCS_HOME_ARIA_LABEL`. */
export function resolveDocsHomeAriaLabel() {
  const t = (import.meta.env.VITE_DOCS_HOME_ARIA_LABEL || '').trim()
  return t || DEFAULT
}
