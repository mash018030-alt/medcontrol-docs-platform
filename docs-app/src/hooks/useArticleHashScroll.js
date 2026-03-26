import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToIdAfterReveal } from '../utils/revealCitationTarget'

/** Отступ от верха viewport: ниже липкого заголовка (~80px) */
const HEADER_SCROLL_OFFSET_PX = 96

/** Не давать spy менять hash во время плавной прокрутки к якорю (иначе выигрывает предыдущий заголовок). */
const SPY_SUPPRESS_AFTER_HASH_SCROLL_MS = 2000

let hashSpyQuietUntil = 0

/** Подавить scroll-spy после перехода по якорю / сноске (можно вызывать из других хуков). */
export function quietHashSpy(ms = SPY_SUPPRESS_AFTER_HASH_SCROLL_MS) {
  hashSpyQuietUntil = Date.now() + ms
}

/**
 * 1) После загрузки контента — прокрутка к элементу из hash (повтор до появления в DOM).
 * 2) При прокрутке статьи — обновление hash через replace, чтобы обновление страницы
 *    открывало тот же раздел (в т.ч. если до этого листали только колёсиком, без клика по оглавлению).
 */
export function useArticleHashScroll(articleBodyRef, { loading, slug, md, enabled }) {
  const location = useLocation()
  const navigate = useNavigate()
  const skipScrollForSpyHash = useRef(false)

  useEffect(() => {
    if (!enabled || loading || !location.hash) return
    if (skipScrollForSpyHash.current) {
      skipScrollForSpyHash.current = false
      return
    }
    const raw = location.hash.slice(1)
    if (!raw) return
    /* Text Fragment — прокрутку делает браузер; id в DOM нет */
    if (raw.startsWith(':~:text=') || raw.includes(':~:text=')) return
    const targetId = decodeURIComponent(raw)

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

  useEffect(() => {
    if (!enabled || loading) return

    let rafId = 0
    const runSpy = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        if (Date.now() < hashSpyQuietUntil) return

        const h = location.hash.slice(1)
        if (h.startsWith(':~:text=') || h.includes(':~:text=')) return

        /* Пока цель deep link (#якорь) ещё ниже «линии» scroll-spy, не подменяем hash — иначе во время
         * smooth scroll к низу страницы spy успевает записать промежуточный заголовок и триггерит
         * повторную прокрутку не туда (FAQ → «Блокировки» и т.п.). */
        const hashTargetId = h ? decodeURIComponent(h) : ''
        if (hashTargetId) {
          const hashTargetEl = document.getElementById(hashTargetId)
          if (hashTargetEl) {
            const r = hashTargetEl.getBoundingClientRect()
            if (r.top > HEADER_SCROLL_OFFSET_PX + 6) return
          }
        }

        const root = articleBodyRef.current
        if (!root) return

        const headings = root.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
        if (!headings.length) return

        let activeId = null
        for (const h of headings) {
          const hostDetails = h.closest('details')
          if (hostDetails && !hostDetails.open) continue
          if (h.getBoundingClientRect().top <= HEADER_SCROLL_OFFSET_PX) {
            activeId = h.id
          }
        }
        if (!activeId) activeId = headings[0].id

        const currentRaw = location.hash.slice(1)
        const currentId = currentRaw ? decodeURIComponent(currentRaw) : ''
        if (activeId === currentId) return

        skipScrollForSpyHash.current = true
        navigate(
          {
            pathname: location.pathname,
            search: location.search,
            hash: `#${activeId}`,
          },
          { replace: true, preventScrollReset: true },
        )
      })
    }

    window.addEventListener('scroll', runSpy, { passive: true })
    window.addEventListener('resize', runSpy, { passive: true })

    return () => {
      window.removeEventListener('scroll', runSpy)
      window.removeEventListener('resize', runSpy)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [
    enabled,
    loading,
    md,
    slug,
    navigate,
    location.pathname,
    location.search,
    location.hash,
    articleBodyRef,
  ])
}
