/**
 * Карточка раздела на главной дашборда документации. Блок «недавно открытые» здесь — только на этой странице, не на разводящих разделов.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionCardIcon } from './SectionCardIcons'
import { buildSectionBundlePrintUrl, runPdfFromPrintUrl } from '../../utils/runArticlePdfExport'
import {
  DASHBOARD_RECENT_UPDATED_EVENT,
  getRecentArticleOpensForSection,
} from '../../services/dashboardRecentArticles'

const PDF_SECTION_TOOLTIP = 'Скачать в PDF'
const RECENT_LIMIT = 2

function DashboardDocLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinejoin="round" />
      <path d="M12 18V9M9 14l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashboardDownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function dashboardIconUrl(path) {
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}

function safePdfFilename(title) {
  const base =
    title
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'razdel'
  return `${base}.pdf`
}

/**
 * @param {{ title: string, description?: string, iconSrc?: string, icon?: string, sectionPath: string, sectionPdfBundle?: boolean }} props
 */
export default function SectionCard({
  title,
  description = '',
  iconSrc,
  icon = 'info',
  sectionPath,
  sectionPdfBundle = false,
}) {
  const [sectionPdfBusy, setSectionPdfBusy] = useState(false)
  const [recentOpens, setRecentOpens] = useState(() => getRecentArticleOpensForSection(sectionPath, RECENT_LIMIT))

  useEffect(() => {
    const sync = () => setRecentOpens(getRecentArticleOpensForSection(sectionPath, RECENT_LIMIT))
    sync()
    window.addEventListener(DASHBOARD_RECENT_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(DASHBOARD_RECENT_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [sectionPath])

  const handleSectionPdf = () => {
    if (!sectionPdfBundle || sectionPdfBusy) return
    const printUrl = buildSectionBundlePrintUrl(sectionPath)
    setSectionPdfBusy(true)
    runPdfFromPrintUrl(printUrl, { filename: safePdfFilename(title) }).finally(() => {
      setSectionPdfBusy(false)
    })
  }

  const recentListId = `docs-dashboard-recent-${sectionPath.replace(/[^\w-]/g, '-')}`

  return (
    <article className="docs-dashboard-card docs-dashboard-card--nav-row">
      <div className="docs-dashboard-card-top-row">
        <Link
          to={`/${sectionPath}`}
          className="docs-dashboard-card-surface"
          aria-label={`Перейти в раздел: ${title}`}
        >
          <div className="docs-dashboard-card-main docs-dashboard-card-main--surface">
            <div className="docs-dashboard-card-icon-wrap">
              {iconSrc ? (
                <img src={dashboardIconUrl(iconSrc)} alt="" className="docs-dashboard-card-icon-img" decoding="async" />
              ) : (
                <SectionCardIcon variant={icon} />
              )}
            </div>
            <div className="docs-dashboard-card-heading">
              <h2 className="docs-dashboard-card-title">{title}</h2>
              {description ? (
                <p className="docs-dashboard-card-description">{description}</p>
              ) : null}
            </div>
          </div>
        </Link>
        {sectionPdfBundle ? (
          <button
            type="button"
            className="docs-dashboard-card__pdf"
            onClick={handleSectionPdf}
            disabled={sectionPdfBusy}
            title={sectionPdfBusy ? 'Формирование PDF…' : PDF_SECTION_TOOLTIP}
            aria-label={sectionPdfBusy ? 'Формирование PDF' : `${PDF_SECTION_TOOLTIP}: ${title}`}
          >
            <DashboardDownloadIcon />
          </button>
        ) : null}
      </div>
      {recentOpens.length > 0 ? (
        <ul className="docs-dashboard-card-docs" id={recentListId} aria-label={`Недавно открытые в разделе «${title}»`}>
          {recentOpens.map(({ path, title: articleTitle }) => (
            <li key={path}>
              <Link to={`/${path}`} className="docs-dashboard-doc-item">
                <span className="docs-dashboard-doc-icon" aria-hidden>
                  <DashboardDocLinkIcon />
                </span>
                <span className="docs-dashboard-doc-label">{articleTitle}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
