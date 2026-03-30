import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { quietHashSpy } from '../hooks/useArticleHashScroll'
import { scrollToIdAfterReveal, decodeHashFragment, resolveAnchorElement } from '../utils/revealCitationTarget'
import { armTocHashNavigation } from '../utils/hashNavigationLock'

export default function Toc({ headings, activeId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const listRef = useRef(null)

  useEffect(() => {
    if (!activeId || !listRef.current) return
    const wrap = listRef.current
    const want = `#${activeId}`
    const links = wrap.querySelectorAll('a.docs-toc-link')
    let link
    for (const a of links) {
      if (a.getAttribute('href') === want) {
        link = a
        break
      }
    }
    if (!link) return

    /* Никогда не вызывать scrollIntoView по ссылке TOC на деске: иначе цепочка предков
     * может прокрутить window и сломать переход по якорю (scrollToIdAfterReveal). */
    const aside = wrap.closest('.docs-toc')
    if (aside && aside.scrollHeight > aside.clientHeight + 2) {
      const ar = aside.getBoundingClientRect()
      const lr = link.getBoundingClientRect()
      const pad = 6
      if (lr.top < ar.top + pad) {
        aside.scrollTop -= ar.top + pad - lr.top
      } else if (lr.bottom > ar.bottom - pad) {
        aside.scrollTop += lr.bottom - (ar.bottom - pad)
      }
    }
  }, [activeId])

  if (!headings?.length) return null

  /**
   * В декларативном режиме (BrowserRouter + Routes) опция preventScrollReset не действует: navigate с # может
   * сбрасывать прокрутку после нашего scrollIntoView. Делаем commit навигации через flushSync, затем прокрутку.
   */
  /* TOC: только auto — два smooth подряд (Chromium + любой второй скролл) отменяют движение: подсветка по hash обновляется, а окно остаётся на месте. */
  const scrollToHeadingFromToc = (rawId) => {
    const run = () => {
      if (resolveAnchorElement(rawId)) {
        scrollToIdAfterReveal(rawId, { behavior: 'auto' })
        return true
      }
      return false
    }
    if (run()) return
    let attempt = 0
    const step = () => {
      if (run() || attempt++ > 90) return
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const handleClick = (e, id) => {
    e.preventDefault()
    quietHashSpy()
    const nextHash = `#${id}`
    const locFrag = location.hash.startsWith('#') ? decodeHashFragment(location.hash.slice(1)) : ''
    const nextFrag = decodeHashFragment(id)
    /* Сравниваем декодированные фрагменты: RR/браузер могут отличаться от `#${id}` по кодированию. */
    if (locFrag === nextFrag && locFrag !== '') {
      scrollToHeadingFromToc(id)
      return
    }
    armTocHashNavigation()
    flushSync(() => {
      navigate(
        { pathname: location.pathname, search: location.search, hash: nextHash },
        { replace: true, preventScrollReset: true },
      )
    })
    /* После commit + layout (consumeTocHashNavigationLock) — микротаск, чтобы не пересечься с ещё одним programmatic smooth. */
    queueMicrotask(() => scrollToHeadingFromToc(id))
  }

  return (
    <aside className="docs-toc" aria-label="Оглавление статьи">
      <div className="docs-toc-title">В этой статье</div>
      <ul ref={listRef} className="docs-toc-list">
        {headings.map((h, idx) => {
          const isActive = Boolean(activeId && h.id === activeId)
          return (
            <li
              key={`${h.id}-${idx}`}
              className={`docs-toc-item docs-toc-h${h.level}`}
            >
              <a
                href={`#${h.id}`}
                className={`docs-toc-link${isActive ? ' docs-toc-link--active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => handleClick(e, h.id)}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
