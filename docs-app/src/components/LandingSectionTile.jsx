import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LandingTileIcon from './LandingTileIcon'
import { publicAssetUrl } from '../utils/publicAssetUrl'

const PDF_LABEL = 'Скачать в PDF'

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Плитка статьи на разводящей странице раздела: клик по основной области ведёт к статье; PDF — отдельная ссылка. */
export default function LandingSectionTile({ path, title, cardPreviewSrc, cardPreviewFallbackSrc }) {
  const previewUrl = cardPreviewSrc ? publicAssetUrl(cardPreviewSrc) : null
  const previewFallbackUrl = cardPreviewFallbackSrc ? publicAssetUrl(cardPreviewFallbackSrc) : null
  const [imgSrc, setImgSrc] = useState(previewUrl)
  const fallbackTriedRef = useRef(false)

  useEffect(() => {
    fallbackTriedRef.current = false
    setImgSrc(previewUrl)
  }, [previewUrl])

  if (previewUrl) {
    let cardPreviewClass = 'docs-landing-tile docs-landing-tile--card-preview'
    if (path === 'obshee/pak') cardPreviewClass += ' docs-landing-tile--card-preview-inset-preview'
    const isObsheeFaqPreview = path === 'obshee/chastye-voprosy'
    return (
      <div className={cardPreviewClass}>
        <div className="docs-landing-tile__card-header">
          <Link
            to={`/${path}`}
            className="docs-landing-tile__title-link"
            aria-label={`Перейти к статье: ${title}`}
          >
            <span className="docs-landing-tile-text">{title}</span>
          </Link>
          <Link
            to={`/${path}`}
            className="docs-landing-tile__pdf-dash"
            state={{ downloadPdf: true }}
            title={PDF_LABEL}
            aria-label={`${PDF_LABEL}: ${title}`}
          >
            <PdfIcon />
          </Link>
        </div>
        <Link
          to={`/${path}`}
          className={
            isObsheeFaqPreview
              ? 'docs-landing-tile__surface docs-landing-tile__surface--obshee-preview docs-landing-tile__surface--obshee-faq-preview'
              : 'docs-landing-tile__surface docs-landing-tile__surface--obshee-preview'
          }
          aria-label={`Перейти к статье: ${title}`}
        >
          <div
            className={
              isObsheeFaqPreview
                ? 'docs-landing-tile__preview-wrap docs-landing-tile__preview-wrap--obshee-faq'
                : 'docs-landing-tile__preview-wrap'
            }
          >
            <img
              src={imgSrc || previewUrl}
              alt=""
              className="docs-landing-tile__preview-img"
              loading="lazy"
              decoding="async"
              onError={() => {
                if (!previewFallbackUrl || fallbackTriedRef.current) return
                fallbackTriedRef.current = true
                setImgSrc(previewFallbackUrl)
              }}
            />
          </div>
        </Link>
      </div>
    )
  }

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
