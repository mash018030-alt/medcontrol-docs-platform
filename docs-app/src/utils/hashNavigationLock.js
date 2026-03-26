/**
 * Клик по TOC выставляет флаг: useArticleHashScroll не дублирует программную прокрутку
 * (два smooth подряд в Chromium отменяют движение — визуально «ничего не происходит»).
 */
export const tocHashNavigationLock = { current: false }

export function armTocHashNavigation() {
  tocHashNavigationLock.current = true
}

export function consumeTocHashNavigationLock() {
  if (!tocHashNavigationLock.current) return false
  tocHashNavigationLock.current = false
  return true
}
