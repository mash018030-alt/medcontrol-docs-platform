import { Link } from 'react-router-dom'
import { resolveSectionNavListIcon } from '../utils/sectionNavListIcon'

/** Только прямые темы раздела (без подстатей на разводящей). */
export default function SectionArticleNavList({ nodes, navSearchSuffix = '' }) {
  if (!nodes?.length) return null
  return (
    <nav className="docs-section-landing-nav" aria-label="Статьи раздела">
      <ul className="docs-section-landing-nav-list">
        {nodes.map((node) => {
          const hasChildren = node.children?.length > 0
          const Icon = resolveSectionNavListIcon(node.path, hasChildren)
          return (
            <li key={node.path} className="docs-section-landing-nav-item">
              <Link to={`/${node.path}${navSearchSuffix}`} className="docs-section-landing-nav-link">
                <span className="docs-section-landing-nav-icon" aria-hidden>
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span className="docs-section-landing-nav-label">{node.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
