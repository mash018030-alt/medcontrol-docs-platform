/* Недавно открытые статьи: только для карточек главной «Документация» (DocsDashboardPage → SectionCard).
 * Не подключать к разводящим разделов (дерево статей на user-guide и т.п.). */
import { articleUnderSectionRoot, flatArticles } from '../data/nav'

/** @type {Map<string, string>} */
const pathToTitle = new Map(flatArticles.map((a) => [a.path, a.title]))

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

/**
 * Последние открытые статьи раздела (корень — путь вида obshee/user-guide), по порядку из localStorage.
 * @param {string} sectionRootPath
 * @param {number} [limit]
 * @returns {{ path: string, title: string }[]}
 */
export function getRecentArticleOpensForSection(sectionRootPath, limit = 2) {
  if (typeof localStorage === 'undefined' || !sectionRootPath) return []
  try {
    const raw = localStorage.getItem(DASHBOARD_RECENT_STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : { entries: [] }
    const entries = Array.isArray(data?.entries) ? data.entries : []
    const out = []
    for (const e of entries) {
      const p = e?.path
      if (!p || typeof p !== 'string') continue
      if (!articleUnderSectionRoot(p, sectionRootPath)) continue
      const title = pathToTitle.get(p)
      if (!title) continue
      out.push({ path: p, title })
      if (out.length >= limit) break
    }
    return out
  } catch {
    return []
  }
}
