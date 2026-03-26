/**
 * Раскрывает все родительские <details>, чтобы якорь внутри аккордеона стал видимым и доступным для scrollIntoView.
 */
export function openAncestorDetails(el) {
  let n = el
  while (n) {
    if (n instanceof HTMLDetailsElement) n.open = true
    n = n.parentElement
  }
}

/** Как useArticleHashScroll HEADER_SCROLL_OFFSET_PX — место под липкий заголовок */
const ARTICLE_ANCHOR_SCROLL_OFFSET_PX = 96

function getAnchorScrollOffsetPx() {
  if (typeof document === 'undefined') return ARTICLE_ANCHOR_SCROLL_OFFSET_PX
  return document.documentElement.classList.contains('docs-layout--mc-pdf')
    ? 0
    : ARTICLE_ANCHOR_SCROLL_OFFSET_PX
}

/** Пустой inline span (напр. id="ftnt_back*") даёт нулевой rect — берём следующий узел ([3]). */
function anchorViewportTopForScroll(el) {
  const r = el.getBoundingClientRect()
  if (r.width > 0 || r.height > 0) return r.top
  const next = el.nextElementSibling
  if (next) {
    const r2 = next.getBoundingClientRect()
    if (r2.width > 0 || r2.height > 0) return r2.top
  }
  return r.top
}

/**
 * Открывает цепочку details и прокручивает к элементу с id после reflow (два rAF).
 * @param {string} rawId — без '#', уже decodeURIComponent при необходимости
 * @param {{ behavior?: ScrollBehavior }} options
 * @returns {boolean}
 */
export function scrollToIdAfterReveal(rawId, { behavior = 'smooth' } = {}) {
  const el = document.getElementById(rawId)
  if (!el) return false
  openAncestorDetails(el)
  const offsetPx = getAnchorScrollOffsetPx()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const top = anchorViewportTopForScroll(el) + window.scrollY - offsetPx
      window.scrollTo({ top: Math.max(0, top), behavior })
    })
  })
  return true
}
