import { Link } from 'react-router-dom'
import LandingTileIcon from './LandingTileIcon'

const PDF_LABEL = 'Скачать в PDF'

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Плитка статьи на разводящей странице раздела: клик по основной области ведёт к статье; PDF — отдельная ссылка. */
export default function LandingSectionTile({ path, title }) {
  return (
    <div className="docs-landing-tile">
      <Link
        to={`/${path}`}
        className="docs-landing-tile__surface"
        aria-label={`Перейти к статье: ${title}`}
      >
        <LandingTileIcon path={path} />
        <span className="docs-landing-tile-text">{title}</span>
      </Link>
      <Link
        to={`/${path}`}
        className="docs-news-release-row__pdf docs-landing-tile__pdf"
        state={{ downloadPdf: true }}
        title={PDF_LABEL}
        aria-label={`${PDF_LABEL}: ${title}`}
      >
        <PdfIcon />
      </Link>
    </div>
  )
}
