import {
  DOCS_VERSION_QUERY_KEY,
  LATEST_DOCS_VERSION_ID,
  resolveDocsVersionIdFromSearch,
} from '../data/docsDocumentationVersions'

/**
 * Строка query для навигации по документации с учётом выбранной редакции (и mc_pdf).
 * @param {string} currentSearch location.search
 * @param {string} docVersionId целевая версия каталога
 * @returns {string} суффикк вида "?docVer=1.17" или ""
 */
export function docsLocationSearchForVersion(currentSearch, docVersionId) {
  const cur = new URLSearchParams(currentSearch || '')
  const next = new URLSearchParams()
  if (cur.get('mc_pdf') === '1') next.set('mc_pdf', '1')
  if (docVersionId && docVersionId !== LATEST_DOCS_VERSION_ID) {
    next.set(DOCS_VERSION_QUERY_KEY, docVersionId)
  }
  const q = next.toString()
  return q ? `?${q}` : ''
}

/** Сохранить текущую выбранную редакцию при переходе по ссылкам. */
export function getDocsNavSearchSuffix(currentSearch) {
  const v = resolveDocsVersionIdFromSearch(currentSearch)
  return docsLocationSearchForVersion(currentSearch, v)
}

/**
 * Добавить docVer к внутреннему пути документации в href (если выбрана неактуальная редакция).
 * @param {string} href путь вида /0_docs/… или /0_docs/…?x=1#y
 * @param {string} locationSearch
 */
export function appendDocVerToInternalHref(href, locationSearch) {
  if (href == null || typeof href !== 'string') return href
  const v = resolveDocsVersionIdFromSearch(locationSearch)
  if (v === LATEST_DOCS_VERSION_ID) return href
  const hashIdx = href.indexOf('#')
  const pathAndQuery = hashIdx >= 0 ? href.slice(0, hashIdx) : href
  const frag = hashIdx >= 0 ? href.slice(hashIdx) : ''
  const sep = pathAndQuery.includes('?') ? '&' : '?'
  return `${pathAndQuery}${sep}${DOCS_VERSION_QUERY_KEY}=${encodeURIComponent(v)}${frag}`
}
