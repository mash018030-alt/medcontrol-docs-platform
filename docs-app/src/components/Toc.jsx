import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { quietHashSpy } from '../hooks/useArticleHashScroll'
import { scrollToIdAfterReveal, decodeHashFragment } from '../utils/revealCitationTarget'
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

  const handleClick = (e, id) => {
    e.preventDefault()
    quietHashSpy()
    const nextHash = `#${id}`
    const locFrag = location.hash.startsWith('#') ? decodeHashFragment(location.hash.slice(1)) : ''
    const nextFrag = decodeHashFragment(id)
    /* Сравниваем декодированные фрагменты: RR/браузер могут отличаться от `#${id}` по кодированию. */
    if (locFrag === nextFrag && locFrag !== '') {
      scrollToIdAfterReveal(id, { behavior: 'smooth' })
      return
    }
    /* Строковый to надёжнее объекта в RR7; прокрутка из TOC — одна (arm + microtask), эффект по hash пропускаем. */
    armTocHashNavigation()
    const to = `${location.pathname}${location.search}${nextHash}`
    navigate(to, { replace: true, preventScrollReset: true })
    queueMicrotask(() => {
      scrollToIdAfterReveal(id, { behavior: 'smooth' })
    })
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
