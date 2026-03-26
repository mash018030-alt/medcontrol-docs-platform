import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { normalizeText } from '../search/docSearch'

/**
 * Fallback, если браузер не прокрутил по #:~:text=… — ищем фрагмент в отрендеренном markdown.
 */
export function useSearchTextScroll(articleBodyRef, {
  loading,
  error,
  landingSection,
  md,
  slug,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
  }, [slug, location.state?.searchScroll?.needle])

  useEffect(() => {
    if (loading || error || landingSection || !articleBodyRef.current) return
    const needle = location.state?.searchScroll?.needle
    if (!needle || doneRef.current) return

    const root = articleBodyRef.current
    const normNeedle = normalizeText(needle).replace(/\s+/g, ' ').trim()
    if (normNeedle.length < 3) return

    const prefix = normNeedle.slice(0, Math.min(Math.max(12, Math.floor(normNeedle.length / 2)), 56))

    let cancelled = false
    const tick = (attempt) => {
      if (cancelled || attempt > 80 || !articleBodyRef.current) return

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
      let node
      let foundEl = null
      while ((node = walker.nextNode())) {
        const raw = node.textContent || ''
        if (!raw.trim()) continue
        const nt = normalizeText(raw).replace(/\s+/g, ' ')
        if (nt.includes(prefix) || raw.includes(needle.slice(0, Math.min(24, needle.length)))) {
          let el = node.parentElement
          while (el && el !== root) {
            const tag = el.tagName
            if (/^(P|H[1-6]|LI|BLOCKQUOTE|TD|TH|DD|DT)$/i.test(tag)) break
            el = el.parentElement
          }
          foundEl = el || node.parentElement
          break
        }
      }

      if (foundEl) {
        doneRef.current = true
        foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const nextState = { ...(location.state || {}) }
        delete nextState.searchScroll
        navigate(
          { pathname: location.pathname, search: location.search, hash: location.hash },
          { replace: true, state: Object.keys(nextState).length ? nextState : {} },
        )
        return
      }

      requestAnimationFrame(() => {
        if (!cancelled) tick(attempt + 1)
      })
    }

    requestAnimationFrame(() => tick(0))
    return () => {
      cancelled = true
    }
  }, [
    loading,
    error,
    landingSection,
    md,
    slug,
    location.pathname,
    location.search,
    location.hash,
    location.state,
    navigate,
    articleBodyRef,
  ])
}
