/** Карточка раздела на главной дашборда документации. */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getDocsNavSearchSuffix } from '../../utils/docsVersionNav'
import { SectionCardIcon } from './SectionCardIcons'
import { buildSectionBundlePrintUrl, runPdfFromPrintUrl } from '../../utils/runArticlePdfExport'

const PDF_SECTION_TOOLTIP = 'Скачать в PDF'

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
  const location = useLocation()
  const navSearchSuffix = getDocsNavSearchSuffix(location.search)
  const [sectionPdfBusy, setSectionPdfBusy] = useState(false)

  const handleSectionPdf = () => {
    if (!sectionPdfBundle || sectionPdfBusy) return
    const printUrl = buildSectionBundlePrintUrl(sectionPath)
    setSectionPdfBusy(true)
    runPdfFromPrintUrl(printUrl, { filename: safePdfFilename(title) }).finally(() => {
      setSectionPdfBusy(false)
    })
  }

  return (
    <article className="docs-dashboard-card docs-dashboard-card--nav-row">
      <div className="docs-dashboard-card-top-row">
        <Link
          to={`/${sectionPath}${navSearchSuffix}`}
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
    </article>
  )
}
