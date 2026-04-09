import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { DOCS_DASHBOARD_PATH, SAFE_MOBILE_PATH } from '../constants/docsRoutes.js'
import { DocsLayoutProvider, useDocsLayout } from '../context/DocsLayoutContext'
import { DocSearchIndexProvider } from '../context/DocSearchIndexContext'
import { GlobalSearchOverlayProvider } from '../context/GlobalSearchOverlayContext'
import { DOCS_HEADING_LINK_COPIED } from '../utils/headingCopyFeedback'
import Header from './Header'
import NiiDocsCornerMark from './NiiDocsCornerMark'
import Sidebar from './Sidebar'
import NewsSidebar from './NewsSidebar'

function HeadingLinkCopyToast() {
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef(0)

  useEffect(() => {
    if (isMcPdf) return undefined
    const onCopied = () => {
      setVisible(true)
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 2200)
    }
    window.addEventListener(DOCS_HEADING_LINK_COPIED, onCopied)
    return () => {
      window.removeEventListener(DOCS_HEADING_LINK_COPIED, onCopied)
      window.clearTimeout(hideTimerRef.current)
    }
  }, [isMcPdf])

  if (isMcPdf || !visible) return null
  return (
    <div className="docs-heading-copy-toast" role="status" aria-live="polite">
      Ссылка скопирована
    </div>
  )
}

function LayoutShell() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const isNews =
    location.pathname === '/news' || location.pathname.startsWith('/news/')
  const { pathname } = location
  const newsPathNorm = pathname.replace(/\/+$/, '') || '/'
  const isNewsHub = newsPathNorm === '/news'
  const showNewsSidebar = isNews && !isNewsHub
  const pathNorm = pathname.replace(/\/+$/, '') || '/'
  const showDocsSidebar =
    !isNews &&
    pathNorm !== '/' &&
    pathNorm !== SAFE_MOBILE_PATH &&
    pathNorm !== DOCS_DASHBOARD_PATH &&
    pathNorm !== '/search' &&
    pathNorm !== '/section-pdf-bundle'
  const showTreeSidebar = showNewsSidebar || showDocsSidebar

  const { isMobileLayout, mobileNavOpen, closeMobileNav } = useDocsLayout()

  /* React Router не сбрасывает scroll под футеры; без этого переход «след./пред. статья» открывает низ страницы.
   * Зависимости только pathname + search: смена одного лишь # не должна вызывать этот эффект (иначе сброс hash
   * без смены пути давал scrollTo(0,0) во время чтения). Если после перехода в URL уже есть hash — не трогаем
   * окно (позицию задаёт useArticleHashScroll по deep link). */
  useEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  const layoutClassNames = [
    isMcPdf ? 'docs-layout docs-layout--mc-pdf' : 'docs-layout',
    !isMcPdf && !showTreeSidebar ? 'docs-layout--no-side-nav' : '',
    !isMcPdf && (pathNorm === '/' || pathNorm === SAFE_MOBILE_PATH) ? 'docs-layout--platform-home' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={layoutClassNames}>
      <HeadingLinkCopyToast />
      {!isMcPdf && <Header />}
      {!isMcPdf && isMobileLayout && showTreeSidebar && mobileNavOpen && (
        <button
          type="button"
          className="docs-mobile-nav-backdrop"
          aria-label="Закрыть меню разделов"
          onClick={closeMobileNav}
        />
      )}
      <div className={`docs-main${isMobileLayout && showTreeSidebar ? ' docs-main--mobile-nav' : ''}`}>
        {!isMcPdf && (showNewsSidebar ? <NewsSidebar /> : showDocsSidebar ? <Sidebar /> : null)}
        <main className="docs-content">
          <Outlet />
        </main>
      </div>
      {!isMcPdf && <NiiDocsCornerMark />}
    </div>
  )
}

export default function Layout() {
  return (
    <DocsLayoutProvider>
      <DocSearchIndexProvider>
        <GlobalSearchOverlayProvider>
          <LayoutShell />
        </GlobalSearchOverlayProvider>
      </DocSearchIndexProvider>
    </DocsLayoutProvider>
  )
}
