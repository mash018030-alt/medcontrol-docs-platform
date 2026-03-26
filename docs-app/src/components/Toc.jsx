import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { quietHashSpy } from '../hooks/useArticleHashScroll'

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
    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId])

  if (!headings?.length) return null

  const handleClick = (e, id) => {
    e.preventDefault()
    quietHashSpy()
    navigate(
      { pathname: location.pathname, search: location.search, hash: `#${id}` },
      { replace: false, preventScrollReset: true },
    )
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
