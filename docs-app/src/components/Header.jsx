import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useDocsLayout } from '../context/DocsLayoutContext'
import { NEWS_ROOT_SLUG } from '../data/fetchNewsTree'
import { docsTopSectionLandingPaths } from '../data/nav'
import { suggestArticlesByTitle } from '../search/docSearch'
import { publicAssetUrl } from '../utils/publicAssetUrl'
import HighlightedText from './search/HighlightedText'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const isNews =
    location.pathname === '/news' || location.pathname.startsWith('/news/')
  const newsPathNorm = location.pathname.replace(/\/+$/, '') || '/'
  const isNewsHub = newsPathNorm === '/news'
  const hasTreeSidebar =
    !isMcPdf &&
    (isNews ? !isNewsHub
      : location.pathname !== '/' &&
        location.pathname !== '/search' &&
        location.pathname !== '/section-pdf-bundle')

  const { isMobileLayout, mobileNavOpen, toggleMobileNav } = useDocsLayout()
  const showMobileMenuBtn = isMobileLayout && hasTreeSidebar

  const docSlug = location.pathname.replace(/^\//, '').replace(/\/$/, '')
  const hideDocsSearch =
    location.pathname === '/' ||
    isNews ||
    (!!docSlug && docsTopSectionLandingPaths.has(docSlug))

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const qTrim = query.trim()
  const suggestions = useMemo(() => suggestArticlesByTitle(query, 8), [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goSearch = (q) => {
    const t = q.trim()
    if (!t) return
    navigate(`/search?q=${encodeURIComponent(t)}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <header className="docs-header">
      <div className="docs-header-inner">
        {showMobileMenuBtn ? (
          <button
            type="button"
            className="docs-header-menu-btn"
            onClick={toggleMobileNav}
            aria-expanded={mobileNavOpen}
            aria-controls="docs-nav-drawer"
            aria-label={mobileNavOpen ? 'Закрыть меню разделов' : 'Открыть меню разделов'}
          >
            <svg className="docs-header-menu-svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
              />
            </svg>
          </button>
        ) : null}
        <Link to="/" className="docs-logo" aria-label="MedControl документация — на главную">
          <img src={publicAssetUrl('/content/images/logo/logo_3.png')} alt="" decoding="async" />
        </Link>
        <nav className="docs-header-tabs" aria-label="Основные разделы">
          <Link
            to="/"
            className={`docs-header-tab${!isNews ? ' docs-header-tab--active' : ''}`}
            onClick={(e) => {
              if (!isNews && location.pathname === '/') e.preventDefault()
            }}
          >
            Документация
          </Link>
          <Link
            to={`/${NEWS_ROOT_SLUG}`}
            className={`docs-header-tab${isNews ? ' docs-header-tab--active' : ''}`}
            onClick={(e) => {
              if (location.pathname === `/${NEWS_ROOT_SLUG}`) e.preventDefault()
            }}
          >
            Новости
          </Link>
        </nav>
        {!hideDocsSearch && (
          <div className="docs-search-wrap" ref={wrapRef}>
            <input
              type="search"
              className="docs-search-input"
              placeholder="Поиск по документации"
              size={26}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  goSearch(query)
                }
              }}
              aria-autocomplete="list"
              aria-expanded={open && qTrim.length > 0}
              aria-controls="docs-header-search-suggestions"
            />
            {open && qTrim.length > 0 && (
              <ul id="docs-header-search-suggestions" className="docs-search-dropdown">
                {suggestions.map((a) => (
                  <li key={a.path}>
                    <Link
                      to={`/${a.path}`}
                      className="docs-search-item docs-search-item--suggestion"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setQuery('')
                        setOpen(false)
                      }}
                    >
                      <span className="docs-search-suggestion-section">{a.sectionTitle}</span>
                      <span className="docs-search-suggestion-title docs-search-suggestion-title--header">
                        <HighlightedText text={a.title} query={query} />
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="docs-search-dropdown-footer">
                  <button
                    type="button"
                    className="docs-search-item docs-search-item--action"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goSearch(query)}
                  >
                    Все результаты поиска
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
