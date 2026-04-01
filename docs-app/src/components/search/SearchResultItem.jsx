import { useState } from 'react'
import { Link } from 'react-router-dom'
import Accordion from './Accordion'
import HighlightedText from './HighlightedText'
import { navTree } from '../../data/nav'
import { buildArticleMcPdfUrl, runPdfFromPrintUrl } from '../../utils/runArticlePdfExport'

function isLandingHub(path) {
  return navTree.some((t) => t.path === path && t.children?.length)
}

function ChevronIcon({ expanded }) {
  return (
    <svg className="docs-search-chevron-svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function articleLinkTo(path, scrollPhrase) {
  if (!scrollPhrase || scrollPhrase.length < 4) return `/${path}`
  return {
    pathname: `/${path}`,
    hash: `:~:text=${encodeURIComponent(scrollPhrase)}`,
    state: { searchScroll: { needle: scrollPhrase } },
  }
}

function safeSearchPdfFilename(title) {
  const base =
    String(title)
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'article'
  return `${base}.pdf`
}

/**
 * @param {{
 *   result: { path: string, title: string, sectionTitle: string, snippet: string, scrollPhrase?: string },
 *   query: string,
 *   expanded: boolean,
 *   onToggle: () => void,
 *   showSectionLabel?: boolean,
 * }} props
 */
export default function SearchResultItem({ result, query, expanded, onToggle, showSectionLabel = true }) {
  const { path, title, sectionTitle, snippet, scrollPhrase = '' } = result
  const showPdf = !isLandingHub(path)
  const panelId = `search-snippet-${path.replace(/\//g, '-')}`
  const docTo = articleLinkTo(path, scrollPhrase)
  const [pdfBusy, setPdfBusy] = useState(false)

  const handleSearchPdf = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (pdfBusy) return
    setPdfBusy(true)
    runPdfFromPrintUrl(buildArticleMcPdfUrl(path), { filename: safeSearchPdfFilename(title) }).finally(() => {
      setPdfBusy(false)
    })
  }

  return (
    <Accordion expanded={expanded}>
      <div className="docs-search-card">
        <div
          className="docs-search-card-head"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.target.closest('a')) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onToggle()
            }
          }}
          aria-expanded={expanded}
          aria-controls={panelId}
        >
          <div className="docs-search-card-head-main">
            {showSectionLabel && sectionTitle ? (
              <span className="docs-search-card-section">{sectionTitle}</span>
            ) : null}
            <Link
              to={docTo}
              className="docs-search-card-title"
              onClick={(e) => e.stopPropagation()}
            >
              {title}
            </Link>
          </div>
          <span className="docs-search-card-chevron" aria-hidden>
            <ChevronIcon expanded={expanded} />
          </span>
        </div>
        {expanded && (
          <div
            className="docs-search-card-body"
            id={panelId}
            role="region"
            aria-label={`Фрагмент статьи «${title}»`}
          >
            <p className="docs-search-snippet">
              <HighlightedText text={snippet} query={query} />
            </p>
            <div className="docs-search-card-actions">
              <Link to={docTo} className="docs-search-action-link">
                Перейти к статье
              </Link>
              {showPdf && (
                <button
                  type="button"
                  className="docs-search-action-link docs-search-action-link--secondary"
                  onClick={handleSearchPdf}
                  disabled={pdfBusy}
                >
                  {pdfBusy ? 'Формирование PDF…' : 'Скачать PDF'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Accordion>
  )
}
