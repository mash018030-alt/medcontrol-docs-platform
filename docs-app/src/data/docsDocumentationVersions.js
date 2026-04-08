/** Query-параметр URL для выбранной редакции документации (глобально по сайту). */
export const DOCS_VERSION_QUERY_KEY = 'docVer'

/**
 * Каталог версий документации (синхрон с релизами продукта).
 * Порядок: от новой к старой (первая — актуальная линия).
 * @type {{ id: string, label: string, releaseDateISO: string }[]}
 */
export const DOCS_DOCUMENTATION_VERSIONS = [
  { id: '1.18', label: '1.18', releaseDateISO: '2026-04-03' },
  { id: '1.17', label: '1.17', releaseDateISO: '2026-02-10' },
]

/** Текущая актуальная версия документации на сайте. */
export const LATEST_DOCS_VERSION_ID = DOCS_DOCUMENTATION_VERSIONS[0]?.id ?? '1.18'

/**
 * Глобальный переключатель версий — только на разводящих четырёх разделов (00_main).
 * Не на статьях и не на главной дашборда.
 */
export const DOCS_VERSION_SWITCHER_LANDING_SLUGS = new Set([
  '0_docs/1_obshee/articles/00_main',
  '0_docs/2_admin/articles/00_main',
  '0_docs/3_medkabinet/articles/00_main',
  '0_docs/4_medadmin/articles/00_main',
])

/** @param {string} slug путь страницы без ведущего / */
export function shouldShowDocsVersionSwitcherOnLanding(slug) {
  return DOCS_VERSION_SWITCHER_LANDING_SLUGS.has(slug)
}

const VERSION_IDS = new Set(DOCS_DOCUMENTATION_VERSIONS.map((v) => v.id))

/**
 * @param {string} searchString window.location.search или аналог
 * @returns {string} id из каталога либо актуальная версия
 */
export function resolveDocsVersionIdFromSearch(searchString) {
  const raw = new URLSearchParams(searchString || '').get(DOCS_VERSION_QUERY_KEY)?.trim()
  if (!raw || !VERSION_IDS.has(raw)) return LATEST_DOCS_VERSION_ID
  return raw
}

/** @param {string} id */
export function getDocsVersionMeta(id) {
  return DOCS_DOCUMENTATION_VERSIONS.find((v) => v.id === id)
}

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

/** @param {string} isoDate YYYY-MM-DD */
export function formatDocsVersionDateRu(isoDate) {
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10))
  if (!y || !m || !d) return isoDate
  return `${d} ${MONTHS_RU[m - 1] ?? m} ${y}`
}

/** @param {string} isoDate YYYY-MM-DD — короткий вид для списка «История версий»: ДД.ММ.ГГ */
export function formatDocsVersionDateDDMMYY(isoDate) {
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10))
  if (!y || !m || !d) return isoDate
  const yy = String(y).slice(-2)
  return `${pad2(d)}.${pad2(m)}.${yy}`
}

function pad2(n) {
  return String(n).padStart(2, '0')
}
