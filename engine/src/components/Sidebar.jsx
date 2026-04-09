import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { DOCS_DASHBOARD_PATH } from '../constants/docsRoutes.js'
import { useDocsLayout } from '../context/DocsLayoutContext'
import { getExpandedNavKeys, navSubtreeContains, navTree } from '../data/nav'
import DocsBackLink from './DocsBackLink'

function slugFromPathname(pathname) {
  const s = pathname.replace(/^\//, '').replace(/\/$/, '')
  if (s === 'search' || s === 'documentation') return ''
  return s
}

function NavBranch({ item, depth, expanded, slug, toggle, ensureExpanded, onSameArticleClick }) {
  const hasChildren = Boolean(item.children?.length)
  const isOpen = hasChildren && expanded.has(item.path)
  /* Синяя плашка: только корень раздела (если мы где-то внутри него) или точное совпадение со статьёй */
  const rowActive =
    slug === item.path || (depth === 0 && hasChildren && navSubtreeContains(item, slug))
  /* Заглавная страница раздела (сетка карточек), не подстатья — светлая плашка в меню */
  const sectionLandingHighlight = rowActive && depth === 0 && slug === item.path

  const baseLinkClass = `docs-nav-link${depth === 0 ? ' docs-nav-section' : ''}${
    hasChildren ? ' docs-nav-subsection' : ''
  }`

  const listClass = depth === 0 ? 'docs-nav-sublist' : 'docs-nav-subsublist'

  return (
    <li className={depth === 0 ? 'docs-nav-item' : undefined}>
      <div
        className={`docs-nav-row${rowActive ? ' docs-nav-row-active' : ''}${
          sectionLandingHighlight ? ' docs-nav-row-section-landing' : ''
        }`}
        data-depth={depth}
      >
        {hasChildren ? (
          <button
            type="button"
            className="docs-nav-chevron"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Свернуть подразделы' : 'Развернуть подразделы'}
            onClick={(e) => toggle(item.path, e)}
          >
            <span className={`docs-nav-chevron-icon ${isOpen ? 'docs-nav-chevron-open' : ''}`} aria-hidden>
              ›
            </span>
          </button>
        ) : (
          <span className="docs-nav-chevron-spacer" aria-hidden />
        )}
        {hasChildren ? (
          <NavLink
            to={`/${item.path}`}
            className={`${baseLinkClass}${rowActive ? ' active' : ''}`}
            onClick={(e) => {
              /* Как у шеврона: клик по названию сворачивает ветку, если мы уже внутри этого раздела */
              if (isOpen && navSubtreeContains(item, slug)) {
                e.preventDefault()
                toggle(item.path, e)
                return
              }
              /* Раскрытие до проверки «тот же URL»: иначе на заглавной странице раздела same-article
                 делает return и ветка так и остаётся свёрнутой */
              ensureExpanded(item.path)
              if (onSameArticleClick(e, item.path)) return
            }}
          >
            {item.title}
          </NavLink>
        ) : (
          <NavLink
            to={`/${item.path}`}
            className={({ isActive }) => `${baseLinkClass}${isActive ? ' active' : ''}`}
            onClick={(e) => onSameArticleClick(e, item.path)}
          >
            {item.title}
          </NavLink>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className={listClass}>
          {item.children.map((child) => (
            <NavBranch
              key={child.path}
              item={child}
              depth={depth + 1}
              expanded={expanded}
              slug={slug}
              toggle={toggle}
              ensureExpanded={ensureExpanded}
              onSameArticleClick={onSameArticleClick}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Sidebar() {
  const { isMobileLayout, mobileNavOpen } = useDocsLayout()
  const location = useLocation()
  const navigate = useNavigate()
  const slug = slugFromPathname(location.pathname)
  const pathNorm = location.pathname.replace(/\/$/, '') || '/'
  const showDocsBack = pathNorm !== '/' && pathNorm !== DOCS_DASHBOARD_PATH

  const [expanded, setExpanded] = useState(() => getExpandedNavKeys(navTree, slug))

  /* При смене страницы только добавляем обязательные ветки к текущему URL;
     уже открытые руками разделы не схлопываем. */
  useEffect(() => {
    const routeKeys = getExpandedNavKeys(navTree, slug)
    setExpanded((prev) => {
      const next = new Set(prev)
      routeKeys.forEach((k) => next.add(k))
      return next
    })
  }, [slug])

  const toggle = useCallback((path, e) => {
    e?.preventDefault()
    e?.stopPropagation()
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const ensureExpanded = useCallback((path) => {
    setExpanded((prev) => new Set(prev).add(path))
  }, [])

  /** Повторный клик по текущей статье в меню — как якорь «в начало» справа: прокрутка наверх */
  const onSameArticleClick = useCallback(
    (e, itemPath) => {
      if (itemPath !== slug) return false
      e.preventDefault()
      e.stopPropagation()
      const scrollRoot = document.scrollingElement ?? document.documentElement
      scrollRoot.scrollTo({ top: 0, behavior: 'smooth' })
      if (location.hash) {
        navigate({ pathname: location.pathname, search: location.search }, { replace: true })
      }
      return true
    },
    [slug, location.pathname, location.search, location.hash, navigate]
  )

  return (
    <aside
      id="docs-nav-drawer"
      className={`docs-sidebar${isMobileLayout && mobileNavOpen ? ' docs-sidebar--open' : ''}`}
      aria-hidden={isMobileLayout ? !mobileNavOpen : undefined}
      inert={isMobileLayout && !mobileNavOpen ? true : undefined}
    >
      <nav className="docs-nav" aria-label="Разделы документации">
        <div className={`docs-sidebar-top${showDocsBack ? ' docs-sidebar-top--with-back' : ''}`}>
          {showDocsBack ? <DocsBackLink slug={slug} /> : null}
          <Link
            to={DOCS_DASHBOARD_PATH}
            className="docs-nav-title docs-nav-title-link"
            onClick={(e) => {
              if (location.pathname.replace(/\/$/, '') === DOCS_DASHBOARD_PATH) {
                e.preventDefault()
                const scrollRoot = document.scrollingElement ?? document.documentElement
                scrollRoot.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Документация
          </Link>
        </div>
        <ul className="docs-nav-list docs-nav-list-root">
          {navTree.map((item) => (
            <NavBranch
              key={item.path}
              item={item}
              depth={0}
              expanded={expanded}
              slug={slug}
              toggle={toggle}
              ensureExpanded={ensureExpanded}
              onSameArticleClick={onSameArticleClick}
            />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
