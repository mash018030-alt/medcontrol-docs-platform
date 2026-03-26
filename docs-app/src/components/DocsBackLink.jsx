import { Link } from 'react-router-dom'
import { getDocsBackNav } from '../utils/docsBackNavigation'

/** @param {{ slug: string }} props */
export default function DocsBackLink({ slug }) {
  const { to, ariaLabel } = getDocsBackNav(slug)
  return (
    <Link
      to={to}
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
