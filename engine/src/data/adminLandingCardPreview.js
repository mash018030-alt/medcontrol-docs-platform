/** Превью карточек разводящей «Администрирование». Файлы: public/content/images/dashboards/admin/1.png … 6.png */

const DASHBOARDS = '/content/images/dashboards'
const ADMIN_TILES = `${DASHBOARDS}/admin`

export const ADMIN_LANDING_CARD_PREVIEW_FALLBACK = `${ADMIN_TILES}/1.png`

/** Порядок как у детей разводящей 0_docs/2_admin/articles/00_main в nav (сверху вниз). */
const BY_PATH = {
  '0_docs/2_admin/articles/01_polzovateli_00': `${ADMIN_TILES}/1.png`,
  '0_docs/2_admin/articles/02_organizacii_00': `${ADMIN_TILES}/2.png`,
  '0_docs/2_admin/articles/07_osmotry': `${ADMIN_TILES}/3.png`,
  '0_docs/2_admin/articles/08_pak': `${ADMIN_TILES}/4.png`,
  '0_docs/2_admin/articles/09_adminpanel': `${ADMIN_TILES}/5.png`,
  '0_docs/2_admin/articles/10_FAQ': `${ADMIN_TILES}/6.png`,
}

export function resolveAdminLandingCardPreview(sectionPath) {
  if (!sectionPath || typeof sectionPath !== 'string') return ADMIN_LANDING_CARD_PREVIEW_FALLBACK
  return BY_PATH[sectionPath] ?? `${ADMIN_TILES}/${sectionPath.split('/').pop()}.png`
}
