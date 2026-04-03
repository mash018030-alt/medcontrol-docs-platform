import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { rehypeFootnotesSection } from '../rehype-footnotes-section'
import { rehypePublicAssets } from '../rehype-public-assets'
import { rehypeRadioDefaultChecked } from '../rehype-radio-default-checked'
import { flatArticles, navTree } from '../data/nav'
import { recordArticleOpened } from '../services/dashboardRecentArticles'
import { buildSectionBundlePrintUrl, runArticlePdfExport, runPdfFromPrintUrl } from '../utils/runArticlePdfExport'
import { getDashboardSectionMeta } from '../data/docsDashboardSections'
import {
  ADMIN_LANDING_CARD_PREVIEW_FALLBACK,
  resolveAdminLandingCardPreview,
} from '../data/adminLandingCardPreview'
import {
  OBSHEE_LANDING_CARD_PREVIEW_FALLBACK,
  resolveObsheeLandingCardPreview,
} from '../data/obsheeLandingCardPreview'
import Toc from './Toc'
import SearchBar from './dashboard/SearchBar'
import LandingSectionTile from './LandingSectionTile'
import { MarkdownOl, MarkdownUl } from './markdownListComponents'
import MarkdownTr from './MarkdownTr'
import MarkdownTable from './MarkdownTable'
import MarkdownImg from './MarkdownImg'
import MarkdownDetails from './MarkdownDetails'
import { publicAssetUrl, routerLinkTo } from '../utils/publicAssetUrl'
import { fetchMarkdownText } from '../utils/fetchMarkdownText'
import { attachDocsCarousels } from '../utils/attachDocsCarousels'
import { useArticleHashScroll } from '../hooks/useArticleHashScroll'
import { useFootnoteBackrefClick } from '../hooks/useFootnoteBackrefClick'
import { useSearchTextScroll } from '../hooks/useSearchTextScroll'
import { useArticleTocHeadings } from '../hooks/useArticleTocHeadings'
import MarkdownHeading from './MarkdownHeading'
import LightboxCloseButton from './LightboxCloseButton'
import { createHeadingSlugAllocator } from '../utils/headingSlug'
import { buildMarkdownHeadingComponents } from '../utils/buildMarkdownHeadingComponents'

/** Ссылки на статьи (/0_docs/1_obshee/…) — через Link, чтобы работала клиентская навигация и deep link. */
function isInternalDocsPath(href) {
  if (href == null || typeof href !== 'string') return false
  if (!href.startsWith('/') || href.startsWith('//')) return false
  if (href.startsWith('/content/')) return false
  return true
}

const SECTION_LANDING_PDF_LABEL = 'Скачать в PDF'

function safeSectionBundleFilename(title) {
  const base =
    String(title)
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'razdel'
  return `${base}.pdf`
}

/** Разводящие с превью-картинками в карточках: «Общее», «Администрирование» (стили — docs-section-landing-root--obshee-stat). */
function SectionLandingObsheeStatPanel({ enabled, children }) {
  if (!enabled) return children
  return (
    <div className="docs-section-landing-root docs-section-landing-root--obshee-stat">
      {children}
    </div>
  )
}

export default function Article() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const slug = (location.pathname.replace(/^\//, '').replace(/\/$/, '') || '0_docs/4_medadmin/user-guide')
  const landingSection = navTree.find((item) => item.path === slug && item.children?.length)
  const statDashLandingPanel =
    (landingSection?.path === '0_docs/1_obshee/user-guide' ||
      landingSection?.path === '0_docs/2_admin/articles/00_main') &&
    !isMcPdf
  const landingDashboardMeta = landingSection ? getDashboardSectionMeta(landingSection.path) : null
  const [md, setMd] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const articleBodyRef = useRef(null)

  useEffect(() => {
    recordArticleOpened(slug)
  }, [slug])
  /* Карусели: точки, стрелки, свайп по области слайдов (см. attachDocsCarousels). */
  useEffect(() => {
    if (loading) return
    let detach = () => {}
    let raf2 = null
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = articleBodyRef.current
        if (!el) return
        detach = attachDocsCarousels(el)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2 != null) cancelAnimationFrame(raf2)
      detach()
    }
  }, [md, loading])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setLastUpdated(null)
    const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
    const path = `${base}/content/${slug}.md`.replace(/^\/+/, '/')
    const url = new URL(path, window.location.origin).href
    fetchMarkdownText(url, { notFoundMessage: 'Статья не найдена' })
      .then(({ text, lastModified }) => {
        if (lastModified) setLastUpdated(new Date(lastModified))
        setMd(text)
      })
      .catch((e) => setError(`${e.message || 'Failed to fetch'} (${url})`))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!isMcPdf || loading || landingSection) return
    const id = requestAnimationFrame(() => {
      articleBodyRef.current?.querySelectorAll('details').forEach((d) => {
        d.open = true
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isMcPdf, loading, landingSection, md, slug])

  const activeHeadingId = useArticleHashScroll(articleBodyRef, {
    loading,
    slug,
    md,
    enabled: !loading && !error && !landingSection,
  })
  useFootnoteBackrefClick(articleBodyRef, !loading && !error && !landingSection, md)

  useSearchTextScroll(articleBodyRef, {
    loading,
    error,
    landingSection: Boolean(landingSection),
    md,
    slug,
  })

  const currentIndex = flatArticles.findIndex((a) => a.path === slug)
  const prev = currentIndex > 0 ? flatArticles[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < flatArticles.length - 1
    ? flatArticles[currentIndex + 1]
    : null
  const [pdfExporting, setPdfExporting] = useState(false)
  const [sectionBundlePdfBusy, setSectionBundlePdfBusy] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const currentArticle = flatArticles.find((a) => a.path === slug)

  const landingH1Id = useMemo(() => {
    if (!landingSection) return ''
    const alloc = createHeadingSlugAllocator()
    /* Заголовок из nav, не из .md: иначе при HTTP-кэше .md на GH Pages может «залипать» старый H1 из PDF. */
    return alloc(landingSection.title)
  }, [landingSection])

  const headings = useArticleTocHeadings(
    articleBodyRef,
    !loading && !error && !landingSection,
    `${slug}|${landingSection ? 'L' : 'N'}|${md}`,
  )

  // Закрытие лайтбокса по Esc (глобальный обработчик, т.к. фокус может быть не на лайтбоксе)
  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightbox])

  const handleContentClick = (e) => {
    if (e.target.tagName !== 'IMG') return
    const inCarousel = e.target.closest('.docs-carousel')
    if (inCarousel?.dataset.docsCarouselSwipeJustNow === '1') return
    e.preventDefault()
    const el = articleBodyRef.current
    if (!el) return
    const clicked = e.target
    const carousel = clicked.closest('.docs-carousel')
    /* Только карусель — несколько слайдов со стрелками; иначе одна картинка (не вся статья). */
    const imgs = carousel
      ? Array.from(carousel.querySelectorAll('.docs-carousel-slide img'))
      : [clicked]
    const images = imgs.map((img) => ({
      src: img.currentSrc || img.getAttribute('src') || '',
      alt: img.alt || '',
    })).filter((x) => x.src)
    const idx = imgs.findIndex((img) => (img.currentSrc || img.getAttribute('src')) === (clicked.currentSrc || clicked.getAttribute('src')))
    if (images.length > 0) setLightbox({ images, currentIndex: idx >= 0 ? idx : 0 })
  }

  const handleDownloadPdf = () => {
    const el = articleBodyRef.current
    if (!el || pdfExporting) return
    const safeName = (currentArticle?.title || slug)
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'article'
    setPdfExporting(true)
    runArticlePdfExport(el, { filename: `${safeName}.pdf` }).finally(() => setPdfExporting(false))
  }

  const handleSectionLandingBundlePdf = () => {
    if (!landingSection || !landingDashboardMeta?.sectionPdfBundle || sectionBundlePdfBusy || isMcPdf) return
    const printUrl = buildSectionBundlePrintUrl(landingSection.path)
    const nameTitle = landingDashboardMeta.title || landingSection.title
    setSectionBundlePdfBusy(true)
    runPdfFromPrintUrl(printUrl, { filename: safeSectionBundleFilename(nameTitle) }).finally(() => {
      setSectionBundlePdfBusy(false)
    })
  }

  if (loading) return <div className="docs-article docs-loading">Загрузка…</div>
  if (error) {
    return (
      <div className="docs-article">
        <p>{error}</p>
        <Link to="/">На главную</Link>
      </div>
    )
  }

  return (
    <article className="docs-article">
      <div className="docs-article-body">
        {!landingSection && !isMcPdf && (
          <div className="docs-article-actions">
            <button
              type="button"
              className="docs-btn-pdf"
              onClick={handleDownloadPdf}
              disabled={pdfExporting}
            >
              {pdfExporting ? 'Формирование PDF…' : 'Скачать в PDF'}
            </button>
          </div>
        )}
        <div
          ref={articleBodyRef}
          className="docs-markdown-root"
          onClick={handleContentClick}
          role="presentation"
        >
        {landingSection ? (
          <SectionLandingObsheeStatPanel enabled={statDashLandingPanel}>
            <>
              <div className="docs-section-landing-title-row">
                <div className="docs-section-landing-title-row__cluster">
                  <MarkdownHeading
                    level={1}
                    id={landingH1Id}
                    isMcPdf={isMcPdf}
                    className="docs-section-landing-title-row__heading"
                  >
                    {landingSection.title}
                  </MarkdownHeading>
                  {!isMcPdf && landingDashboardMeta?.sectionPdfBundle ? (
                    <button
                      type="button"
                      className="docs-section-landing-pdf-btn"
                      onClick={handleSectionLandingBundlePdf}
                      disabled={sectionBundlePdfBusy}
                      title={sectionBundlePdfBusy ? 'Формирование PDF…' : SECTION_LANDING_PDF_LABEL}
                      aria-label={
                        sectionBundlePdfBusy
                          ? 'Формирование PDF'
                          : `${SECTION_LANDING_PDF_LABEL}: ${landingDashboardMeta?.title || landingSection.title}`
                      }
                    >
                      {sectionBundlePdfBusy ? 'Формирование PDF…' : SECTION_LANDING_PDF_LABEL}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="docs-section-landing-dashboard">
                <SearchBar sectionRootPath={landingSection.path} />
              </div>
              {/* Разводящая раздела: только плитки верхнего уровня из nav; без списков вложенных статей (недавние — только на главной). */}
              <div className="docs-landing-grid">
                {landingSection.children.map((child) => (
                  <LandingSectionTile
                    key={child.path}
                    path={child.path}
                    title={child.title}
                    cardPreviewSrc={
                      statDashLandingPanel
                        ? landingSection.path === '0_docs/1_obshee/user-guide'
                          ? resolveObsheeLandingCardPreview(child.path)
                          : resolveAdminLandingCardPreview(child.path)
                        : undefined
                    }
                    cardPreviewFallbackSrc={
                      statDashLandingPanel
                        ? landingSection.path === '0_docs/1_obshee/user-guide'
                          ? OBSHEE_LANDING_CARD_PREVIEW_FALLBACK
                          : ADMIN_LANDING_CARD_PREVIEW_FALLBACK
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          </SectionLandingObsheeStatPanel>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeRadioDefaultChecked(), rehypeFootnotesSection(), rehypePublicAssets()]}
            remarkRehypeOptions={{ footnoteLabel: 'Сноски' }}
            components={{
              ol: MarkdownOl,
              ul: MarkdownUl,
              details: MarkdownDetails,
              tr: MarkdownTr,
              table: MarkdownTable,
              img: MarkdownImg,
              /* passNode в react-markdown: не прокидывать `node` (hast) в Link/DOM */
              a: ({ href, className, children, node: _mdNode, ...props }) => {
                const isBackref =
                  (typeof className === 'string' && className.includes('data-footnote-backref')) ||
                  (href && String(href).startsWith('#user-content-fnref-'))
                const hashOnly = href && typeof href === 'string' && href.startsWith('#')
                const useNative =
                  isBackref ||
                  hashOnly ||
                  props.download != null ||
                  props.target === '_blank'
                if (!useNative && isInternalDocsPath(href)) {
                  return (
                    <Link
                      to={routerLinkTo(href)}
                      className={className}
                      {...props}
                    >
                      {children}
                    </Link>
                  )
                }
                const resolvedHref =
                  href && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')
                    ? publicAssetUrl(href)
                    : href
                return (
                  <a
                    href={resolvedHref}
                    className={className}
                    {...props}
                    {...(isBackref ? { title: 'Вернуться к месту в тексте', 'aria-label': 'Вернуться к месту в тексте' } : {})}
                  >
                    {children}
                  </a>
                )
              },
              ...buildMarkdownHeadingComponents(isMcPdf),
            }}
          >
            {md}
          </ReactMarkdown>
        )}

        {lastUpdated && !landingSection ? (
          <p className="docs-article-updated">
            Последнее обновление: {`${String(lastUpdated.getDate()).padStart(2, '0')}.${String(lastUpdated.getMonth() + 1).padStart(2, '0')}.${lastUpdated.getFullYear()}`}
          </p>
        ) : null}
        {!landingSection && (prev || next) ? (
          <footer className="docs-article-footer">
            {prev && (
              <Link to={`/${prev.path}`} className="docs-nav-prev">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link to={`/${next.path}`} className="docs-nav-next">
                {next.title} →
              </Link>
            )}
          </footer>
        ) : null}
        </div>
      </div>
      {!landingSection && !isMcPdf && <Toc headings={headings} activeId={activeHeadingId} />}
      {lightbox && lightbox.images && (
        <div
          ref={(node) => node?.focus()}
          className="docs-lightbox"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightbox(null)
            const n = lightbox.images.length
            if (n > 1 && e.key === 'ArrowLeft' && lightbox.currentIndex > 0) {
              e.stopPropagation()
              setLightbox((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }))
            }
            if (n > 1 && e.key === 'ArrowRight' && lightbox.currentIndex < n - 1) {
              e.stopPropagation()
              setLightbox((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Закрыть"
        >
          <div className="docs-lightbox-backdrop" />
          <LightboxCloseButton onClose={() => setLightbox(null)} />
          {lightbox.images.length > 1 && (
            <>
              {lightbox.currentIndex > 0 && (
                <button
                  type="button"
                  className="docs-lightbox-arrow docs-lightbox-arrow-prev"
                  aria-label="Предыдущее изображение"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }))
                  }}
                >
                  ‹
                </button>
              )}
              {lightbox.currentIndex < lightbox.images.length - 1 && (
                <button
                  type="button"
                  className="docs-lightbox-arrow docs-lightbox-arrow-next"
                  aria-label="Следующее изображение"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
                  }}
                >
                  ›
                </button>
              )}
            </>
          )}
          <img
            src={lightbox.images[lightbox.currentIndex]?.src}
            alt={lightbox.images[lightbox.currentIndex]?.alt}
            className="docs-lightbox-img"
            loading="eager"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  )
}
