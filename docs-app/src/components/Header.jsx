import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useDocsLayout } from '../context/DocsLayoutContext'
import { useGlobalSearchOverlay } from '../context/GlobalSearchOverlayContext'
import { NEWS_ROOT_SLUG } from '../data/fetchNewsTree'
import { publicAssetUrl } from '../utils/publicAssetUrl'

export default function Header() {
  const location = useLocation()
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

  const showGlobalSearchTrigger =
    !isMcPdf && location.pathname !== '/' && location.pathname !== '/search'

  const { openSearch, open: globalSearchOpen } = useGlobalSearchOverlay()

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
        {showGlobalSearchTrigger ? (
          <div className="docs-header-search-trigger-wrap">
            <button
              type="button"
              className="docs-header-search-trigger"
              onClick={openSearch}
              aria-haspopup="dialog"
              aria-expanded={globalSearchOpen}
            >
              <svg className="docs-header-search-trigger__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M16 16l5 5" />
              </svg>
              <span className="docs-header-search-trigger__label">Поиск по документации</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
