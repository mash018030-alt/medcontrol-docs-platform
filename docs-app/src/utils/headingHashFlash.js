import { resolveAnchorElement } from './revealCitationTarget'

const FLASH_CLASS = 'docs-heading--hash-flash'

const HASH_FLASH_DELAY_MS = 450
const HASH_FLASH_DURATION_MS = 2000

/** Краткая подсветка заголовка после перехода по #якорю. */
export function scheduleHeadingHashFlash(targetId) {
  if (!targetId) return () => {}

  let flashTimer = 0
  let clearTimer = 0

  flashTimer = window.setTimeout(() => {
    const el = resolveAnchorElement(targetId)
    if (!el) return
    el.classList.add(FLASH_CLASS)
    clearTimer = window.setTimeout(() => {
      el.classList.remove(FLASH_CLASS)
    }, HASH_FLASH_DURATION_MS)
  }, HASH_FLASH_DELAY_MS)

  return () => {
    window.clearTimeout(flashTimer)
    window.clearTimeout(clearTimer)
    const el = resolveAnchorElement(targetId)
    el?.classList.remove(FLASH_CLASS)
  }
}
