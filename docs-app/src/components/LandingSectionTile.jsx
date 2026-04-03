import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LandingTileIcon from './LandingTileIcon'
import { publicAssetUrl } from '../utils/publicAssetUrl'
import { buildArticleMcPdfUrl, runPdfFromPrintUrl } from '../utils/runArticlePdfExport'

const PDF_LABEL = 'Скачать в PDF'

function safeArticlePdfFilename(title) {
  const base =
    String(title)
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'article'
  return `${base}.pdf`
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Плитка на разводящей странице раздела (`…/user-guide`): одна тема — одна плитка, без вложенных списков ссылок на статьи. */
export default function LandingSectionTile({ path, title, cardPreviewSrc, cardPreviewFallbackSrc }) {
  const previewUrl = cardPreviewSrc ? publicAssetUrl(cardPreviewSrc) : null
  const previewFallbackUrl = cardPreviewFallbackSrc ? publicAssetUrl(cardPreviewFallbackSrc) : null
  const [imgSrc, setImgSrc] = useState(previewUrl)
  const [pdfBusy, setPdfBusy] = useState(false)
  const fallbackTriedRef = useRef(false)

  const handleTilePdf = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (pdfBusy) return
    const printUrl = buildArticleMcPdfUrl(path)
    setPdfBusy(true)
    runPdfFromPrintUrl(printUrl, { filename: safeArticlePdfFilename(title) }).finally(() => {
      setPdfBusy(false)
    })
  }

  useEffect(() => {
    fallbackTriedRef.current = false
    setImgSrc(previewUrl)
  }, [previewUrl])

  if (previewUrl) {
    let cardPreviewClass = 'docs-landing-tile docs-landing-tile--card-preview'
    if (path === '0_docs/1_obshee/pak' || path === '0_docs/2_admin/articles/08_pak') {
      cardPreviewClass += ' docs-landing-tile--card-preview-inset-preview'
    }
    const isDashFaqPreview =
      path === '0_docs/1_obshee/chastye-voprosy' || path === '0_docs/2_admin/articles/10_FAQ'
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
          <button
            type="button"
            className="docs-landing-tile__pdf-dash"
            onClick={handleTilePdf}
            disabled={pdfBusy}
            title={pdfBusy ? 'Формирование PDF…' : PDF_LABEL}
            aria-label={pdfBusy ? 'Формирование PDF' : `${PDF_LABEL}: ${title}`}
          >
            <PdfIcon />
          </button>
        </div>
        <Link
          to={`/${path}`}
          className={
            isDashFaqPreview
              ? 'docs-landing-tile__surface docs-landing-tile__surface--obshee-preview docs-landing-tile__surface--obshee-faq-preview'
              : 'docs-landing-tile__surface docs-landing-tile__surface--obshee-preview'
          }
          aria-label={`Перейти к статье: ${title}`}
        >
          <div
            className={
              isDashFaqPreview
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
      <button
        type="button"
        className="docs-news-release-row__pdf docs-landing-tile__pdf"
        onClick={handleTilePdf}
        disabled={pdfBusy}
        title={pdfBusy ? 'Формирование PDF…' : PDF_LABEL}
        aria-label={pdfBusy ? 'Формирование PDF' : `${PDF_LABEL}: ${title}`}
      >
        <PdfIcon />
      </button>
    </div>
  )
}
