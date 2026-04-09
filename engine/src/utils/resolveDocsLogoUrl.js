import { publicAssetUrl } from './publicAssetUrl.js'

const DEFAULT_LOGO_PATH = '/content/images/logo/logo_3.png'

/**
 * URL логотипа в шапке.
 * - переменная не задана → лого MedControl по умолчанию;
 * - `VITE_DOCS_LOGO_URL=` (пустая строка в .env) → без логотипа;
 * - иначе путь или абсолютный URL (как в markdown), через `publicAssetUrl`.
 */
export function resolveDocsLogoUrl() {
  const raw = import.meta.env.VITE_DOCS_LOGO_URL
  if (raw === '') return null
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (trimmed !== '') {
    const path = trimmed.startsWith('/') || /^(?:https?:)?\/\//i.test(trimmed) ? trimmed : `/${trimmed}`
    return publicAssetUrl(path)
  }
  return publicAssetUrl(DEFAULT_LOGO_PATH)
}
