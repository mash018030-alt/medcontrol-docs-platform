import {
  LATEST_DOCS_VERSION_ID,
  getDocsVersionMeta,
  formatDocsVersionDateDDMMYY,
} from './docsDocumentationVersions'

/**
 * История редакций по slug статьи (только версии, в которых статья реально выпускалась/менялась).
 * Для пилота — одна статья; остальные без блока истории.
 *
 * @type {Record<string, { versionId: string, releaseDateISO: string, note?: string }[]>}
 */
export const DOCS_ARTICLE_VERSION_HISTORY_BY_SLUG = {
  '0_docs/1_obshee/articles/01_avtorizaciya_v_arm': [
    { versionId: '1.18', releaseDateISO: '2026-04-03' },
    { versionId: '1.17', releaseDateISO: '2026-02-10' },
  ],
}

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
 * @param {string} slug
 * @returns {{ versionId: string, releaseDateISO: string, note?: string }[] | null}
 */
export function getArticleVersionHistory(slug) {
  const list = DOCS_ARTICLE_VERSION_HISTORY_BY_SLUG[slug]
  return list?.length ? list : null
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
