import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  fetchNewsTree,
  getExpandedNewsKeys,
  newsSubtreeContains,
  NEWS_ROOT_SLUG,
} from '../data/fetchNewsTree'
import NewsBackLink from './NewsBackLink'

/** Якоря хаба: #hub-mc-cloud → news/mc-cloud, #hub-releases → news/releases (любая глубина в дереве) */
function branchPathFromNewsHubHash(hash, tree) {
  const id = hash?.replace(/^#/, '') || ''
  const m = /^hub-(.+)$/.exec(id)
  if (!m) return null
  const path = `${NEWS_ROOT_SLUG}/${m[1]}`
  function contains(nodes) {
    for (const t of nodes) {
      if (t.path === path) return true
      if (t.children?.length && contains(t.children)) return true
    }
    return false
  }
  return contains(tree) ? path : null
}

function NewsNavBranch({
  item,
  depth,
  expanded,
  navSlug,
  pathnameSlug,
  toggle,
  ensureExpanded,
  onSameArticleClick,
  newsHubSlug,
}) {
  const hasChildren = Boolean(item.children?.length)
  const isOpen = hasChildren && expanded.has(item.path)
  const rowActive =
    navSlug === item.path || (depth === 0 && hasChildren && newsSubtreeContains(item, navSlug))
  const sectionLandingHighlight = rowActive && depth === 0 && navSlug === item.path
  const onNewsHub = pathnameSlug === newsHubSlug
  const titleClickCollapses =
    isOpen &&
    (newsSubtreeContains(item, navSlug) || (onNewsHub && expanded.has(item.path)))

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
              if (titleClickCollapses) {
                e.preventDefault()
                toggle(item.path, e)
                return
              }
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
            <NewsNavBranch
              key={child.path}
              item={child}
              depth={depth + 1}
              expanded={expanded}
              navSlug={navSlug}
              pathnameSlug={pathnameSlug}
              toggle={toggle}
              ensureExpanded={ensureExpanded}
              onSameArticleClick={onSameArticleClick}
              newsHubSlug={newsHubSlug}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function NewsSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathnameSlug = location.pathname.replace(/^\//, '').replace(/\/$/, '') || NEWS_ROOT_SLUG
  const pathNorm = location.pathname.replace(/\/$/, '') || '/'
  const showNewsBack = pathNorm !== `/${NEWS_ROOT_SLUG}`

  const [tree, setTree] = useState([])
  const [expanded, setExpanded] = useState(() => new Set())

  const hubBranchPath = tree.length ? branchPathFromNewsHubHash(location.hash, tree) : null
  const navSlug =
    pathnameSlug === NEWS_ROOT_SLUG && hubBranchPath ? hubBranchPath : pathnameSlug

  useEffect(() => {
    let cancelled = false
    fetchNewsTree()
      .then((t) => {
        if (!cancelled) setTree(t)
      })
      .catch(() => {
        if (!cancelled) setTree([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (tree.length === 0) return
    if (pathnameSlug === NEWS_ROOT_SLUG) {
      const branch = branchPathFromNewsHubHash(location.hash, tree)
      setExpanded(() => {
        if (!branch) return new Set()
        return getExpandedNewsKeys(tree, branch)
      })
      return
    }
    const routeKeys = getExpandedNewsKeys(tree, pathnameSlug)
    setExpanded((prev) => {
      const next = new Set(prev)
      routeKeys.forEach((k) => next.add(k))
      return next
    })
  }, [pathnameSlug, tree, location.hash])

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

  const onSameArticleClick = useCallback(
    (e, itemPath) => {
      const atSamePlace =
        itemPath === pathnameSlug ||
        (pathnameSlug === NEWS_ROOT_SLUG && hubBranchPath === itemPath)
      if (!atSamePlace) return false
      e.preventDefault()
      e.stopPropagation()
      const scrollRoot = document.scrollingElement ?? document.documentElement
      scrollRoot.scrollTo({ top: 0, behavior: 'smooth' })
      if (location.hash) {
        navigate({ pathname: location.pathname, search: location.search }, { replace: true })
      }
      return true
    },
    [
      pathnameSlug,
      hubBranchPath,
      location.pathname,
      location.search,
      location.hash,
      navigate,
    ]
  )

  return (
    <aside className="docs-sidebar">
      <nav className="docs-nav" aria-label="Новости и релизы">
        <div className={`docs-sidebar-top${showNewsBack ? ' docs-sidebar-top--with-back' : ''}`}>
          {showNewsBack ? <NewsBackLink /> : null}
          <Link
            to={`/${NEWS_ROOT_SLUG}`}
            className="docs-nav-title docs-nav-title-link"
            onClick={(e) => {
              if (location.pathname.replace(/\/$/, '') === `/${NEWS_ROOT_SLUG}`) {
                e.preventDefault()
                const scrollRoot = document.scrollingElement ?? document.documentElement
                scrollRoot.scrollTo({ top: 0, behavior: 'smooth' })
                if (location.hash) {
                  navigate({ pathname: `/${NEWS_ROOT_SLUG}`, search: location.search }, { replace: true })
                }
              }
            }}
          >
            Новости
          </Link>
        </div>
        <ul className="docs-nav-list docs-nav-list-root">
          {tree.map((item) => (
            <NewsNavBranch
              key={item.path}
              item={item}
              depth={0}
              expanded={expanded}
              navSlug={navSlug}
              pathnameSlug={pathnameSlug}
              toggle={toggle}
              ensureExpanded={ensureExpanded}
              onSameArticleClick={onSameArticleClick}
              newsHubSlug={NEWS_ROOT_SLUG}
            />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
