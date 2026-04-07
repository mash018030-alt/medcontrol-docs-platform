import { Link } from 'react-router-dom'

const PDF_DOWNLOAD_TOOLTIP = 'Скачать в PDF'

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Строка релиза в сетке «Предыдущие релизы»: название — на статью; иконка — скачать PDF без ухода с хаба.
 * @param {{ title: string, path: string, onReleasePdf?: function, releasePdfBusy?: boolean }} props
 */
export default function ReleaseGridItem({
  title,
  path: articlePath,
  onReleasePdf,
  releasePdfBusy = false,
}) {
  return (
    <div className="docs-news-release-row">
      <Link
        to={`/${articlePath}`}
        className="docs-news-release-row__surface"
        aria-label={`Перейти к релизу: ${title}`}
      >
        <span className="docs-news-release-row__label">{title}</span>
      </Link>
      <button
        type="button"
        className="docs-news-release-row__pdf"
        title={PDF_DOWNLOAD_TOOLTIP}
        aria-label={`${PDF_DOWNLOAD_TOOLTIP}: ${title}`}
        disabled={releasePdfBusy}
        onClick={() => onReleasePdf?.(articlePath, title)}
      >
        <DownloadIcon />
      </button>
    </div>
  )
}
