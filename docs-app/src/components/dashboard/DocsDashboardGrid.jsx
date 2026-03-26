import SectionCard from './SectionCard'
import { docsDashboardSections } from '../../data/docsDashboardSections'

/**
 * @param {{ sectionRootPath?: string | null }} props один раздел — только его карточка; иначе все разделы (главная)
 */
export default function DocsDashboardGrid({ sectionRootPath = null }) {
  const list = sectionRootPath
    ? docsDashboardSections.filter((s) => s.sectionPath === sectionRootPath)
    : docsDashboardSections

  return (
    <div className="docs-dashboard-grid">
      {list.map((section) => (
        <SectionCard key={section.sectionPath} {...section} />
      ))}
    </div>
  )
}
