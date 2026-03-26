import { flatArticles } from '../data/nav'

/** @type {string} */
export const DASHBOARD_RECENT_STORAGE_KEY = 'docs-dashboard-recent-opens'

export const DASHBOARD_RECENT_UPDATED_EVENT = 'docs-recent-open-updated'

/**
 * Запись открытия статьи (глобально в браузере). Позже источник можно заменить на API пользователя.
 * @param {string} path slug без ведущего /
 */
export function recordArticleOpened(path) {
  if (typeof localStorage === 'undefined' || !path) return
  if (!flatArticles.some((a) => a.path === path)) return

  try {
    const raw = localStorage.getItem(DASHBOARD_RECENT_STORAGE_KEY)
    let data = raw ? JSON.parse(raw) : { entries: [] }
    if (!data || typeof data !== 'object') data = { entries: [] }
    let entries = Array.isArray(data.entries) ? [...data.entries] : []
    entries = entries.filter((e) => e?.path !== path)
    entries.unshift({ path, openedAt: Date.now() })
    const trimmed = entries.slice(0, 400)
    localStorage.setItem(DASHBOARD_RECENT_STORAGE_KEY, JSON.stringify({ entries: trimmed }))
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(DASHBOARD_RECENT_UPDATED_EVENT))
}
