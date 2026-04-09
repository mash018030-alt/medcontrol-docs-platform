import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { DOCS_DASHBOARD_PATH, SAFE_MOBILE_PATH } from '../constants/docsRoutes.js'
import { useDocsLayout } from '../context/DocsLayoutContext'
import { useGlobalSearchOverlay } from '../context/GlobalSearchOverlayContext'
import { NEWS_ROOT_SLUG } from '../data/fetchNewsTree'
import { resolveDocsHomeAriaLabel } from '../utils/resolveDocsHomeAriaLabel'
import { resolveDocsLogoUrl } from '../utils/resolveDocsLogoUrl'

export default function Header() {
  const logoUrl = resolveDocsLogoUrl()
  const homeAriaLabel = resolveDocsHomeAriaLabel()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const isNews =
    location.pathname === '/news' || location.pathname.startsWith('/news/')
  const newsPathNorm = location.pathname.replace(/\/+$/, '') || '/'
  const isNewsHub = newsPathNorm === '/news'
  const pathNorm = location.pathname.replace(/\/+$/, '') || '/'
  const isPlatformHome = pathNorm === '/'
  const showProductSwitcher = pathNorm === '/' || pathNorm === SAFE_MOBILE_PATH
  const safeMobileProductTabActive = pathNorm === SAFE_MOBILE_PATH
  const hasTreeSidebar =
    !isMcPdf &&
    (isNews ? !isNewsHub
      : pathNorm !== '/' &&
        pathNorm !== SAFE_MOBILE_PATH &&
        pathNorm !== DOCS_DASHBOARD_PATH &&
        pathNorm !== '/search' &&
        pathNorm !== '/section-pdf-bundle')

  const { isMobileLayout, mobileNavOpen, toggleMobileNav } = useDocsLayout()
  const showMobileMenuBtn = isMobileLayout && hasTreeSidebar

  const showGlobalSearchTrigger =
    !isMcPdf &&
    pathNorm !== '/' &&
    pathNorm !== SAFE_MOBILE_PATH &&
    pathNorm !== DOCS_DASHBOARD_PATH &&
    pathNorm !== '/search'

  const { openSearch, open: globalSearchOpen } = useGlobalSearchOverlay()

  const docsTabActive = !isNews && !isPlatformHome

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
        {logoUrl && !isPlatformHome && pathNorm !== SAFE_MOBILE_PATH ? (
          <Link to={DOCS_DASHBOARD_PATH} className="docs-logo" aria-label={homeAriaLabel}>
            <img src={logoUrl} alt="" decoding="async" />
          </Link>
        ) : null}
        {showProductSwitcher ? (
          <nav className="docs-header-tabs docs-header-tabs--product-switch" aria-label="Продукты">
            <Link
              to={SAFE_MOBILE_PATH}
              className={`docs-header-tab${safeMobileProductTabActive ? ' docs-header-tab--active' : ''}`}
              onClick={(e) => {
                if (pathNorm === SAFE_MOBILE_PATH) e.preventDefault()
              }}
            >
              Safe Mobile
            </Link>
            <Link to={DOCS_DASHBOARD_PATH} className="docs-header-tab">
              MedControl
            </Link>
          </nav>
        ) : (
          <nav className="docs-header-tabs" aria-label="Основные разделы">
            <Link
              to={DOCS_DASHBOARD_PATH}
              className={`docs-header-tab${docsTabActive ? ' docs-header-tab--active' : ''}`}
              onClick={(e) => {
                if (!isNews && pathNorm === DOCS_DASHBOARD_PATH) e.preventDefault()
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
        )}
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
