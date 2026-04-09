import {
  DOCS_DOCUMENTATION_VERSIONS,
  LATEST_DOCS_VERSION_ID,
  getDocsVersionMeta,
  formatDocsVersionDateDDMMYY,
} from './docsDocumentationVersions'

/**
 * Ручные дополнения к истории версий (note, нестандартный порядок и т.д.).
 * По умолчанию блок «История версий» строится из allowlist снимков ARTICLE_PATHS_BY_SNAPSHOT_VERSION
 * плюс актуальная линия LATEST_DOCS_VERSION_ID — дублировать slug здесь не нужно.
 *
 * @type {Record<string, { versionId: string, releaseDateISO: string, note?: string }[]>}
 */
export const DOCS_ARTICLE_VERSION_HISTORY_BY_SLUG = {}

/**
 * Для версий старше актуальной: явный allowlist статей, для которых есть снимок в
 * public/previous_versions/{cloud|mobile}/<versionId>/0_docs/…/articles/*.md
 * и иллюстрации в …/images/<slug_статьи>/ (как в сабмодуле content).
 * Когда появится полный снимок релиза — заменяется логикой «все пути из манифеста».
 * @type {Record<string, Set<string>>}
 */
const ARTICLE_PATHS_BY_SNAPSHOT_VERSION = {
  '1.17': new Set(['0_docs/1_obshee/articles/01_avtorizaciya_v_arm']),
}

/** Сегмент URL для снимков документации (cloud | mobile). Сейчас архив только Cloud. */
const PREVIOUS_VERSIONS_PRODUCT = 'cloud'

/**
 * @param {string} slug путь статьи без .md
 * @param {string} versionId
 * @returns {boolean}
 */
export function articleExistsInDocsVersion(slug, versionId) {
  if (versionId === LATEST_DOCS_VERSION_ID) return true
  const set = ARTICLE_PATHS_BY_SNAPSHOT_VERSION[versionId]
  return Boolean(set?.has(slug))
}

/**
 * Снимки: для slug собрать id версий, где статья есть в архиве, отсортировать от новой к старой.
 * @param {string} slug
 * @returns {string[]}
 */
function snapshotVersionIdsForSlug(slug) {
  const ids = []
  for (const [versionId, set] of Object.entries(ARTICLE_PATHS_BY_SNAPSHOT_VERSION)) {
    if (set?.has(slug)) ids.push(versionId)
  }
  const order = DOCS_DOCUMENTATION_VERSIONS.map((v) => v.id)
  ids.sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
  return ids
}

/**
 * История для статьи: актуальная редакция + более старые, для которых есть снимок в previous_versions.
 * @param {string} slug
 * @returns {{ versionId: string, releaseDateISO: string, note?: string }[] | null}
 */
function deriveArticleVersionHistoryFromSnapshots(slug) {
  const snapshotIds = snapshotVersionIdsForSlug(slug)
  if (!snapshotIds.length) return null

  const rows = []
  const latestId = LATEST_DOCS_VERSION_ID
  const latestMeta = getDocsVersionMeta(latestId)
  if (latestMeta) {
    rows.push({ versionId: latestId, releaseDateISO: latestMeta.releaseDateISO })
  }
  for (const vid of snapshotIds) {
    if (vid === latestId) continue
    const m = getDocsVersionMeta(vid)
    if (m) rows.push({ versionId: vid, releaseDateISO: m.releaseDateISO })
  }
  return rows.length ? rows : null
}

/**
 * @param {string} slug
 * @returns {{ versionId: string, releaseDateISO: string, note?: string }[] | null}
 */
export function getArticleVersionHistory(slug) {
  const manual = DOCS_ARTICLE_VERSION_HISTORY_BY_SLUG[slug]
  if (manual?.length) return manual
  return deriveArticleVersionHistoryFromSnapshots(slug)
}

/**
 * Подпись для списка истории: «1.18 · 03.04.26»
 * @param {{ versionId: string, releaseDateISO: string, note?: string }} entry
 */
export function formatArticleHistoryLine(entry) {
  const meta = getDocsVersionMeta(entry.versionId)
  const label = meta?.label ?? entry.versionId
  const date = formatDocsVersionDateDDMMYY(entry.releaseDateISO)
  return { primary: `${label} · ${date}`, note: entry.note }
}

export function buildArticleMarkdownUrl(slug, versionId) {
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  if (versionId === LATEST_DOCS_VERSION_ID) {
    return new URL(`${base}/content/${slug}.md`.replace(/^\/+/, '/'), window.location.origin).href
  }
  return new URL(
    `${base}/previous_versions/${PREVIOUS_VERSIONS_PRODUCT}/${versionId}/${slug}.md`.replace(/^\/+/, '/'),
    window.location.origin,
  ).href
}
