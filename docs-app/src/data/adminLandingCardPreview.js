/** Превью карточек разводящей «Администрирование». Файлы: public/content/images/dashboards/admin/1.png … 6.png */

const DASHBOARDS = '/content/images/dashboards'
const ADMIN_TILES = `${DASHBOARDS}/admin`

export const ADMIN_LANDING_CARD_PREVIEW_FALLBACK = `${ADMIN_TILES}/1.png`

/** Порядок как у детей admin/user-guide в nav (сверху вниз). */
const BY_PATH = {
  'admin/polzovateli': `${ADMIN_TILES}/1.png`,
  'admin/organizacii': `${ADMIN_TILES}/2.png`,
  'admin/osmotry': `${ADMIN_TILES}/3.png`,
  'admin/pak': `${ADMIN_TILES}/4.png`,
  'admin/adminpanel': `${ADMIN_TILES}/5.png`,
  'admin/chastye-voprosy': `${ADMIN_TILES}/6.png`,
}

export function resolveAdminLandingCardPreview(sectionPath) {
  if (!sectionPath || typeof sectionPath !== 'string') return ADMIN_LANDING_CARD_PREVIEW_FALLBACK
  return BY_PATH[sectionPath] ?? `${ADMIN_TILES}/${sectionPath.split('/').pop()}.png`
}
