import { Link } from 'react-router-dom'
import { newsAssetPublicUrl } from '../../data/newsAssets'
import { NEWS_RELEASE_PDF_ANCHOR } from './releasePdfAnchor'

const PDF_DOWNLOAD_TOOLTIP = 'Скачать в PDF'

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Строка релиза в сетке «Предыдущие релизы»: название ведёт на страницу, справа — скачивание PDF.
 * @param {{ title: string, path: string, pdf?: string }} props
 */
export default function ReleaseGridItem({ title, path: articlePath, pdf }) {
  const pdfFileUrl = pdf ? newsAssetPublicUrl(pdf) : ''

  const pdfControl = pdfFileUrl ? (
    <a
      href={pdfFileUrl}
      className="docs-news-release-row__pdf"
      download
      target="_blank"
      rel="noopener noreferrer"
      title={PDF_DOWNLOAD_TOOLTIP}
      aria-label={`${PDF_DOWNLOAD_TOOLTIP}: ${title}`}
    >
      <DownloadIcon />
    </a>
  ) : (
    <Link
      to={`/${articlePath}#${NEWS_RELEASE_PDF_ANCHOR}`}
      className="docs-news-release-row__pdf"
      title={PDF_DOWNLOAD_TOOLTIP}
      aria-label={`${PDF_DOWNLOAD_TOOLTIP}: ${title}`}
    >
      <DownloadIcon />
    </Link>
  )

  return (
    <div className="docs-news-release-row">
      <Link
        to={`/${articlePath}`}
        className="docs-news-release-row__surface"
        aria-label={`Перейти к релизу: ${title}`}
      >
        <span className="docs-news-release-row__label">{title}</span>
      </Link>
      {pdfControl}
    </div>
  )
}
