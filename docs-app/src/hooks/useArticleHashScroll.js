import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  scrollToIdAfterReveal,
  resolveArticleSpyOffsetPx,
  decodeHashFragment,
  resolveAnchorElement,
} from '../utils/revealCitationTarget'
import { consumeTocHashNavigationLock } from '../utils/hashNavigationLock'

/** Не давать spy «перетягивать» подсветку TOC во время плавной прокрутки к якорю (TOC / сноска). */
const SPY_SUPPRESS_AFTER_HASH_SCROLL_MS = 2000

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

  const offsetPx = resolveArticleSpyOffsetPx(root)
  let activeId = null
  for (const h of headings) {
    const hostDetails = h.closest('details')
    if (hostDetails && !hostDetails.open) continue
    if (h.getBoundingClientRect().top <= offsetPx) {
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

  /* Layout: до paint. Прокрутка по hash — кроме клика по TOC: его скролл делает сам Toc (один smooth). */
  useLayoutEffect(() => {
    if (!enabled || loading || !location.hash) return
    if (consumeTocHashNavigationLock()) return
    const raw = location.hash.slice(1)
    if (!raw) return
    if (isTextFragmentHash(raw)) return
    const targetId = decodeHashFragment(raw)

    let cancelled = false
    let attempts = 0
    const maxAttempts = 120
    let rafId = 0

    const tick = () => {
      if (cancelled) return
      const el = resolveAnchorElement(targetId)
      if (el) {
        const behavior = attempts === 0 ? 'smooth' : 'auto'
        quietHashSpy()
        scrollToIdAfterReveal(targetId, { behavior })
        return
      }
      attempts += 1
      if (attempts < maxAttempts) {
        rafId = requestAnimationFrame(tick)
      }
    }

    if (resolveAnchorElement(targetId)) {
      quietHashSpy()
      scrollToIdAfterReveal(targetId, { behavior: 'smooth' })
    } else {
      rafId = requestAnimationFrame(tick)
    }
    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [enabled, loading, location.hash, md, slug])

  const runSpyRef = useRef(() => {})

  runSpyRef.current = () => {
    const loc = locationRef.current
    const hRaw = loc.hash.slice(1)
    const rootSpy = articleBodyRef.current
    const spyOffsetPx = resolveArticleSpyOffsetPx(rootSpy)

    /* После programmatic scroll к якорю подавляем смену hash, но TOC должен следовать реальной позиции,
     * иначе при ручном скролле во время окна quiet подсветка «залипает» на id из URL. */
    if (Date.now() < hashSpyQuietUntil) {
      const rootQ = articleBodyRef.current
      const fromScroll = rootQ ? computeActiveHeadingIdFromArticleRoot(rootQ) : null
      if (!isTextFragmentHash(hRaw) && hRaw) {
        const id = decodeHashFragment(hRaw)
        const hashEl = resolveAnchorElement(id)
        const stillApproachingTarget =
          hashEl && hashEl.getBoundingClientRect().top > spyOffsetPx + 6
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
      const hashTargetEl = resolveAnchorElement(hashTargetId)
      if (hashTargetEl) {
        const r = hashTargetEl.getBoundingClientRect()
        if (r.top > spyOffsetPx + 6) {
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
    const ioTopMargin = resolveArticleSpyOffsetPx(root)

    const io =
      nodes.length > 0
        ? new IntersectionObserver(schedule, {
            root: null,
            rootMargin: `-${ioTopMargin}px 0px 0px 0px`,
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
