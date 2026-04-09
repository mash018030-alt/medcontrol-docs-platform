/** Превью карточек разводящей «Общее». Картинки: public/content/images/dashboards/Obshee/1.png … 9.png */

const DASHBOARDS = '/content/images/dashboards'
const OBSHEE_TILES = `${DASHBOARDS}/Obshee`

/** Файла `Obshee.png` в корне dashboards нет в контент-репо — используем первую плитку сетки. */
export const OBSHEE_LANDING_CARD_PREVIEW_FALLBACK = `${OBSHEE_TILES}/1.png`

/**
 * Сетка 3×3 как на странице: в ряду слева направо; ряды сверху вниз — 1–3, 4–6, 7–9
 * (соответствует перечислению «1,2,3» затем «ниже» 4–6 и т.д.).
 */
const BY_PATH = {
  '0_docs/1_obshee/articles/01_avtorizaciya_v_arm': `${OBSHEE_TILES}/1.png`,
  '0_docs/1_obshee/articles/02_osmotry': `${OBSHEE_TILES}/2.png`,
  '0_docs/1_obshee/articles/09_organizacii': `${OBSHEE_TILES}/3.png`,
  '0_docs/1_obshee/articles/12_polzovateli': `${OBSHEE_TILES}/4.png`,
  '0_docs/1_obshee/articles/16_dokumenty': `${OBSHEE_TILES}/5.png`,
  '0_docs/1_obshee/articles/17_otchety': `${OBSHEE_TILES}/6.png`,
  '0_docs/1_obshee/articles/19_pak': `${OBSHEE_TILES}/7.png`,
  '0_docs/1_obshee/articles/20_uvedomleniya': `${OBSHEE_TILES}/8.png`,
  '0_docs/1_obshee/articles/25_chastye_voprosy': `${OBSHEE_TILES}/9.png`,
}

export function resolveObsheeLandingCardPreview(sectionPath) {
  if (!sectionPath || typeof sectionPath !== 'string') return OBSHEE_LANDING_CARD_PREVIEW_FALLBACK
  return BY_PATH[sectionPath] ?? `${OBSHEE_TILES}/${sectionPath.split('/').pop()}.png`
}
