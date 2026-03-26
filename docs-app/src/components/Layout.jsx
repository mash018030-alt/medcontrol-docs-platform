import { useEffect } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import NewsSidebar from './NewsSidebar'

export default function Layout() {
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

  /* React Router не сбрасывает scroll; без этого переход «след./пред. статья» открывает низ страницы. */
  useEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname, location.search, location.hash])

  return (
    <div className={isMcPdf ? 'docs-layout docs-layout--mc-pdf' : 'docs-layout'}>
      {!isMcPdf && <Header />}
      <div className="docs-main">
        {!isMcPdf &&
          (showNewsSidebar ? <NewsSidebar /> : showDocsSidebar ? <Sidebar /> : null)}
        <main className="docs-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
