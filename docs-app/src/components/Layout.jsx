import { useEffect } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { DocsLayoutProvider, useDocsLayout } from '../context/DocsLayoutContext'
import Header from './Header'
import Sidebar from './Sidebar'
import NewsSidebar from './NewsSidebar'

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
  const showDocsSidebar =
    !isNews &&
    pathname !== '/' &&
    pathname !== '/search' &&
    pathname !== '/section-pdf-bundle'
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

  return (
    <div className={isMcPdf ? 'docs-layout docs-layout--mc-pdf' : 'docs-layout'}>
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
    </div>
  )
}

export default function Layout() {
  return (
    <DocsLayoutProvider>
      <LayoutShell />
    </DocsLayoutProvider>
  )
}
