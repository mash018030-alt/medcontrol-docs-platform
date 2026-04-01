/** Превью карточек разводящей «Общее». Картинки: public/content/images/dashboards/Obshee/1.png … 9.png */

const DASHBOARDS = '/content/images/dashboards'
const OBSHEE_TILES = `${DASHBOARDS}/Obshee`

export const OBSHEE_LANDING_CARD_PREVIEW_FALLBACK = `${DASHBOARDS}/Obshee.png`

/**
 * Сетка 3×3 как на странице: в ряду слева направо; ряды сверху вниз — 1–3, 4–6, 7–9
 * (соответствует перечислению «1,2,3» затем «ниже» 4–6 и т.д.).
 */
const BY_PATH = {
  'obshee/avtorizaciya-v-arm': `${OBSHEE_TILES}/1.png`,
  'obshee/osmotry': `${OBSHEE_TILES}/2.png`,
  'obshee/organizacii': `${OBSHEE_TILES}/3.png`,
  'obshee/polzovateli': `${OBSHEE_TILES}/4.png`,
  'obshee/dokumenty': `${OBSHEE_TILES}/5.png`,
  'obshee/otchety': `${OBSHEE_TILES}/6.png`,
  'obshee/pak': `${OBSHEE_TILES}/7.png`,
  'obshee/uvedomleniya': `${OBSHEE_TILES}/8.png`,
  'obshee/chastye-voprosy': `${OBSHEE_TILES}/9.png`,
}

export function resolveObsheeLandingCardPreview(sectionPath) {
  if (!sectionPath || typeof sectionPath !== 'string') return OBSHEE_LANDING_CARD_PREVIEW_FALLBACK
  return BY_PATH[sectionPath] ?? `${OBSHEE_TILES}/${sectionPath.split('/').pop()}.png`
}
