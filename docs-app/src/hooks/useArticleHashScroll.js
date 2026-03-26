import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToIdAfterReveal } from '../utils/revealCitationTarget'

/** Отступ от верха viewport: ниже липкого заголовка (согласовано с scrollToIdAfterReveal / scroll-margin). */
export const ARTICLE_SPY_HEADER_OFFSET_PX = 96

/** Не давать spy «перетягивать» подсветку TOC во время плавной прокрутки к якорю (TOC / сноска). */
const SPY_SUPPRESS_AFTER_HASH_SCROLL_MS = 2000

function decodeHashFragment(raw) {
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

let hashSpyQuietUntil = 0

/** Подавить scroll-spy после перехода по якорю / сноске (можно вызывать из других хуков). */
export function quietHashSpy(ms = SPY_SUPPRESS_AFTER_HASH_SCROLL_MS) {
  hashSpyQuietUntil = Date.now() + ms
}

function isTextFragmentHash(raw) {
  return raw.startsWith(':~:text=') || raw.includes(':~:text=')
}

/**
 * Последний заголовок в порядке документа, чей верх уже не ниже линии чтения (под шапкой).
 * Закрытые details не учитываются; сноски/ручной блок сносок — как в useArticleTocHeadings.
 */
export function computeActiveHeadingIdFromArticleRoot(root) {
  if (!root) return null
  const headings = root.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
  if (!headings.length) return null

  let activeId = null
  for (const h of headings) {
    const hostDetails = h.closest('details')
    if (hostDetails && !hostDetails.open) continue
    if (h.getBoundingClientRect().top <= ARTICLE_SPY_HEADER_OFFSET_PX) {
      activeId = h.id
    }
  }
  if (!activeId) activeId = headings[0].id
  return activeId
}

/**
 * 1) После загрузки контента — прокрутка к элементу из hash (повтор до появления в DOM).
 * 2) При прокрутке — только activeHeadingId для подсветки TOC. Hash в URL НЕ пишем из spy:
 *    navigate({ hash }) заставляет движок снова прокручивать к якорю и дергает страницу (mobile/desktop).
 *    Актуальный фрагмент в адресе — после клика по TOC/сноске или внешнего deep link.
 *
 * @returns {string|null} activeHeadingId — id заголовка для подсветки в TOC
 */
export function useArticleHashScroll(articleBodyRef, { loading, slug, md, enabled }) {
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  const [activeHeadingId, setActiveHeadingId] = useState(null)

  useEffect(() => {
    hashSpyQuietUntil = 0
  }, [slug])

  useEffect(() => {
    if (!enabled || loading || !location.hash) return
    const raw = location.hash.slice(1)
    if (!raw) return
    if (isTextFragmentHash(raw)) return
    const targetId = decodeHashFragment(raw)

    let cancelled = false
    let attempts = 0
    const maxAttempts = 120

    const tick = () => {
      if (cancelled) return
      const el = document.getElementById(targetId)
      if (el) {
        const behavior = attempts === 0 ? 'smooth' : 'auto'
        quietHashSpy()
        scrollToIdAfterReveal(targetId, { behavior })
        return
      }
      attempts += 1
      if (attempts < maxAttempts) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
    return () => {
      cancelled = true
    }
  }, [enabled, loading, location.hash, md, slug])

  const runSpyRef = useRef(() => {})

  runSpyRef.current = () => {
    const loc = locationRef.current
    const hRaw = loc.hash.slice(1)

    /* После programmatic scroll к якорю подавляем смену hash, но TOC должен следовать реальной позиции,
     * иначе при ручном скролле во время окна quiet подсветка «залипает» на id из URL. */
    if (Date.now() < hashSpyQuietUntil) {
      const rootQ = articleBodyRef.current
      const fromScroll = rootQ ? computeActiveHeadingIdFromArticleRoot(rootQ) : null
      if (!isTextFragmentHash(hRaw) && hRaw) {
        const id = decodeHashFragment(hRaw)
        const hashEl = document.getElementById(id)
        const stillApproachingTarget =
          hashEl && hashEl.getBoundingClientRect().top > ARTICLE_SPY_HEADER_OFFSET_PX + 6
        if (stillApproachingTarget) {
          setActiveHeadingId((prev) => (prev === id ? prev : id))
        } else if (fromScroll) {
          setActiveHeadingId((prev) => (prev === fromScroll ? prev : fromScroll))
        }
      } else if (fromScroll) {
        setActiveHeadingId((prev) => (prev === fromScroll ? prev : fromScroll))
      }
      return
    }

    if (isTextFragmentHash(hRaw)) {
      const root = articleBodyRef.current
      const fromScroll = computeActiveHeadingIdFromArticleRoot(root)
      if (fromScroll) setActiveHeadingId((prev) => (prev === fromScroll ? prev : fromScroll))
      return
    }

    /* Пока цель deep link (#якорь) ещё ниже «линии» scroll-spy, не подменяем hash */
    const hashTargetId = hRaw ? decodeHashFragment(hRaw) : ''
    if (hashTargetId) {
      const hashTargetEl = document.getElementById(hashTargetId)
      if (hashTargetEl) {
        const r = hashTargetEl.getBoundingClientRect()
        if (r.top > ARTICLE_SPY_HEADER_OFFSET_PX + 6) {
          setActiveHeadingId((prev) => (prev === hashTargetId ? prev : hashTargetId))
          return
        }
      }
    }

    const root = articleBodyRef.current
    if (!root) return

    const spyId = computeActiveHeadingIdFromArticleRoot(root)
    if (!spyId) return

    setActiveHeadingId((prev) => (prev === spyId ? prev : spyId))
  }

  useEffect(() => {
    if (!enabled || loading) return

    let rafId = 0
    const schedule = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        runSpyRef.current()
      })
    }

    const root = articleBodyRef.current
    const nodes = root ? [...root.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')] : []

    const io =
      nodes.length > 0
        ? new IntersectionObserver(schedule, {
            root: null,
            rootMargin: `-${ARTICLE_SPY_HEADER_OFFSET_PX}px 0px 0px 0px`,
            threshold: [0, 0.01, 0.5, 1],
          })
        : null

    nodes.forEach((n) => io?.observe(n))
    window.addEventListener('resize', schedule, { passive: true })
    /* IntersectionObserver с rootMargin даёт не во всех случаях серию колбэков при скролле колёсиком;
     * один rAF-батч на scroll — лёгко и совпадает с прежней архитектурой hash-spy. */
    window.addEventListener('scroll', schedule, { passive: true })
    schedule()

    return () => {
      io?.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [enabled, loading, md, slug, articleBodyRef])

  useEffect(() => {
    if (!enabled || loading) return
    let raf = requestAnimationFrame(() => runSpyRef.current())
    return () => cancelAnimationFrame(raf)
  }, [enabled, loading, location.hash, location.pathname, location.search])

  return activeHeadingId
}
