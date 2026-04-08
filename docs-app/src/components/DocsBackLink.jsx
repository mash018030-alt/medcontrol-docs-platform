import { Link, useLocation } from 'react-router-dom'
import { getDocsBackNav } from '../utils/docsBackNavigation'
import { getDocsNavSearchSuffix } from '../utils/docsVersionNav'

/** @param {{ slug: string }} props */
export default function DocsBackLink({ slug }) {
  const location = useLocation()
  const { to, ariaLabel } = getDocsBackNav(slug)
  const suffix = getDocsNavSearchSuffix(location.search)
  return (
    <Link
      to={`${to}${suffix}`}
      className="docs-back-link docs-back-link--sidebar"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <svg className="docs-back-link__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
        />
      </svg>
    </Link>
  )
}
