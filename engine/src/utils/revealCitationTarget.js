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

/**
 * Цепочка overflow-y между якорем и корнем: без сдвига их scrollTop окно может остаться наверху,
 * а scrollIntoView прокручивает не тот порт (flex / вложенные колонки).
 */
function alignElementInVerticalScrollParents(targetEl, marginPx = 8) {
  let p = targetEl.parentElement
  while (p && p !== document.body && p !== document.documentElement) {
    const st = getComputedStyle(p)
    const oy = st.overflowY
    if (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      p.scrollHeight > p.clientHeight + 2
    ) {
      const er = targetEl.getBoundingClientRect()
      const pr = p.getBoundingClientRect()
      if (er.top < pr.top + marginPx) {
        p.scrollTop -= pr.top + marginPx - er.top
      } else if (er.bottom > pr.bottom - marginPx) {
        p.scrollTop += er.bottom - (pr.bottom - marginPx)
      }
    }
    p = p.parentElement
  }
}

/** Прокрутка окна документа: явный scrollTop, без scrollIntoView (стабильнее при SPA-навигации). */
function scrollViewportToElement(el, behavior) {
  const pad = resolveEffectiveStickyOffsetPx(el)
  const se = document.scrollingElement ?? document.documentElement
  const rect = el.getBoundingClientRect()
  const nextTop = rect.top + se.scrollTop - pad
  window.scrollTo({
    left: window.scrollX,
    top: Math.max(0, nextTop),
    behavior,
  })
}

/**
 * Открывает details, затем прокручивает к якорю.
 * Сначала вложенные scroll-container, затем window по геометрии (и повтор на следующих кадрах после layout).
 */
export function scrollToIdAfterReveal(rawId, { behavior = 'smooth' } = {}) {
  const el = resolveAnchorElement(rawId)
  if (!el) return false
  openAncestorDetails(el)
  const beh = behavior === 'smooth' ? 'smooth' : 'auto'

  const pulse = (b) => {
    alignElementInVerticalScrollParents(el)
    scrollViewportToElement(el, b)
  }

  pulse(beh)
  requestAnimationFrame(() => {
    pulse(beh === 'smooth' ? 'auto' : beh)
    requestAnimationFrame(() => pulse('auto'))
  })
  return true
}
