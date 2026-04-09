/** Фрагмент из `location.hash` / `href` без '#', в одной форме для сравнения и getElementById. */
export function decodeHashFragment(raw) {
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * Элемент с id=value: getElementById в редких случаях расходится с querySelector для нестандартных id.
 */
export function resolveAnchorElement(rawId) {
  if (!rawId) return null
  const byId = document.getElementById(rawId)
  if (byId) return byId
  try {
    return document.querySelector(`[id="${CSS.escape(rawId)}"]`)
  } catch {
    return null
  }
}

/**
 * Раскрывает все родительские <details>, чтобы якорь внутри аккордеона стал виден для scrollIntoView.
 */
export function openAncestorDetails(el) {
  let n = el
  while (n) {
    if (n instanceof HTMLDetailsElement) n.open = true
    n = n.parentElement
  }
}

const FALLBACK_ANCHOR_OFFSET_PX = 80

/**
 * Совпадает с scroll-margin-top у целевого якоря (desktop ~80px, mobile calc(шапка + 12px)).
 * Брать из computed style, чтобы не расходиться с CSS при смене брейкпоинтов.
 */
export function resolveAnchorScrollOffsetPx(el) {
  if (typeof document === 'undefined') return FALLBACK_ANCHOR_OFFSET_PX
  if (document.documentElement.classList.contains('docs-layout--mc-pdf')) return 0
  if (!(el instanceof Element)) return FALLBACK_ANCHOR_OFFSET_PX
  const v = parseFloat(getComputedStyle(el).scrollMarginTop)
  if (Number.isFinite(v) && v > 0) return Math.round(v)
  return FALLBACK_ANCHOR_OFFSET_PX
}

/**
 * Отступ под липкую шапку: max(CSS scroll-margin заголовка, фактический низ .docs-header).
 * Иначе при «высокой» шапке (две строки, меню) якорь остаётся ниже, чем видимая зона чтения.
 */
export function resolveEffectiveStickyOffsetPx(el) {
  if (typeof document === 'undefined') return FALLBACK_ANCHOR_OFFSET_PX
  if (document.documentElement.classList.contains('docs-layout--mc-pdf')) return 0
  const fromMargin =
    el instanceof Element ? resolveAnchorScrollOffsetPx(el) : FALLBACK_ANCHOR_OFFSET_PX
  const header = document.querySelector('.docs-layout > .docs-header')
  if (!header) return fromMargin
  const bottom = header.getBoundingClientRect().bottom
  if (!Number.isFinite(bottom) || bottom <= 0) return fromMargin
  const fromHeader = Math.ceil(bottom) + 3
  return Math.max(fromMargin, fromHeader)
}

/** Линия scroll-spy: по первому заголовку статьи (тот же offset, что и для якорей). */
export function resolveArticleSpyOffsetPx(articleRoot) {
  if (typeof document === 'undefined') return FALLBACK_ANCHOR_OFFSET_PX
  if (document.documentElement.classList.contains('docs-layout--mc-pdf')) return 0
  const probe = articleRoot?.querySelector?.('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]') ?? null
  return resolveEffectiveStickyOffsetPx(probe)
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
 * Открывает details, затем прокручивает к якорю.
 * Сначала scrollIntoView (цепочка scroll-container), затем разовая коррекция по scroll-margin,
 * при сильном рассогласовании — запасной window.scrollTo (WebKit/вложенные скроллы).
 */
export function scrollToIdAfterReveal(rawId, { behavior = 'smooth' } = {}) {
  const el = resolveAnchorElement(rawId)
  if (!el) return false
  openAncestorDetails(el)
  const offsetPx = () => resolveEffectiveStickyOffsetPx(el)
  const finalizePosition = () => {
    const pad = offsetPx()
    const topNow = anchorViewportTopForScroll(el)
    /* Целевая линия: верх якоря у «полосы» под шапкой (как scroll-spy) */
    if (Math.abs(topNow - pad) > 6) {
      window.scrollBy({
        top: topNow - pad,
        behavior: behavior === 'smooth' ? 'auto' : behavior,
      })
    }
    requestAnimationFrame(() => {
      const pad2 = offsetPx()
      const t = anchorViewportTopForScroll(el)
      if (Math.abs(t - pad2) > 6) {
        const se = document.scrollingElement ?? document.documentElement
        const y = se.scrollTop + t - pad2
        window.scrollTo({ left: window.scrollX, top: Math.max(0, y), behavior: 'auto' })
      }
    })
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        el.scrollIntoView({ behavior, block: 'start', inline: 'nearest' })
      } catch {
        const se = document.scrollingElement ?? document.documentElement
        const y0 = se.scrollTop
        const pad = offsetPx()
        const top = anchorViewportTopForScroll(el) + y0 - pad
        window.scrollTo({ left: window.scrollX, top: Math.max(0, top), behavior: 'auto' })
        return
      }
      finalizePosition()
    })
  })
  return true
}
