import { Link } from 'react-router-dom'
import { newsAssetPublicUrl } from '../../data/newsAssets'
import { NEWS_RELEASE_PDF_ANCHOR } from './releasePdfAnchor'

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * @param {{
 *   title: string
 *   categoryLabel: string
 *   articlePath: string
 *   pdfRelPath?: string
 * }} props
 */
export default function LatestReleaseBanner({ title, categoryLabel, articlePath, pdfRelPath }) {
  const pdfFileUrl = pdfRelPath ? newsAssetPublicUrl(pdfRelPath) : ''

  const pdfControl = pdfFileUrl ? (
    <a
      href={pdfFileUrl}
      className="docs-news-banner__icon-btn"
      download
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Скачать в PDF: ${title}`}
      title="Скачать в PDF"
    >
      <DownloadIcon />
    </a>
  ) : (
    <Link
      to={`/${articlePath}#${NEWS_RELEASE_PDF_ANCHOR}`}
      className="docs-news-banner__icon-btn"
      aria-label={`Скачать в PDF: ${title}`}
      title="Скачать в PDF"
    >
      <DownloadIcon />
    </Link>
  )

  return (
    <div className="docs-news-banner" data-category={categoryLabel}>
      <div className="docs-news-banner__bg" aria-hidden />
      <div className="docs-news-banner__inner">
        <p className="docs-news-banner__eyebrow">
          Новый релиз <span aria-hidden>🔥</span>
        </p>
        <div className="docs-news-banner__card">
          <div className="docs-news-banner__card-row">
            <Link
              to={`/${articlePath}`}
              className="docs-news-banner__card-title-link"
              aria-label={`Перейти к релизу: ${title}`}
            >
              {title}
            </Link>
            {pdfControl}
          </div>
        </div>
      </div>
      <span className="docs-news-banner__watermark" aria-hidden>
        {categoryLabel}
      </span>
    </div>
  )
}
