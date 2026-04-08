import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { docsMarkdownRehypePlugins } from '../docsMarkdownRehypePlugins'
import { flatArticles, navTree } from '../data/nav'
import { articlePathRedirects } from '../data/articlePathRedirects'
import { buildSectionBundlePrintUrl, runArticlePdfExport, runPdfFromPrintUrl } from '../utils/runArticlePdfExport'
import { getDashboardSectionMeta } from '../data/docsDashboardSections'
import Toc from './Toc'
import SectionArticleNavList from './SectionArticleNavList'
import { MarkdownOl, MarkdownUl } from './markdownListComponents'
import MarkdownTr from './MarkdownTr'
import MarkdownTable from './MarkdownTable'
import MarkdownImg from './MarkdownImg'
import MarkdownDetails from './MarkdownDetails'
import { publicAssetUrl, routerLinkTo } from '../utils/publicAssetUrl'
import { appendDocVerToInternalHref, getDocsNavSearchSuffix, docsLocationSearchForVersion } from '../utils/docsVersionNav'
import { fetchMarkdownText } from '../utils/fetchMarkdownText'
import {
  LATEST_DOCS_VERSION_ID,
  resolveDocsVersionIdFromSearch,
  getDocsVersionMeta,
  formatDocsVersionDateRu,
  shouldShowDocsVersionSwitcherOnLanding,
} from '../data/docsDocumentationVersions'
import {
  articleExistsInDocsVersion,
  buildArticleMarkdownUrl,
  getArticleVersionHistory,
  formatArticleHistoryLine,
} from '../data/docsArticleVersioning'
import DocsVersionSwitcher from './DocsVersionSwitcher'
import { useArticleHashScroll } from '../hooks/useArticleHashScroll'
import { useFootnoteBackrefClick } from '../hooks/useFootnoteBackrefClick'
import { useSearchTextScroll } from '../hooks/useSearchTextScroll'
import { useArticleTocHeadings } from '../hooks/useArticleTocHeadings'
import MarkdownHeading from './MarkdownHeading'
import MarkdownSpan from './MarkdownSpan'
import MarkdownDiv from './MarkdownDiv'
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

function ArticleContent({ slug, isMcPdf }) {
  const location = useLocation()
  const navigate = useNavigate()
  const docVersionId = resolveDocsVersionIdFromSearch(location.search)
  const navSearchSuffix = getDocsNavSearchSuffix(location.search)
  const landingSection = navTree.find((item) => item.path === slug && item.children?.length)
  const landingDashboardMeta = landingSection ? getDashboardSectionMeta(landingSection.path) : null
  const [md, setMd] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const articleBodyRef = useRef(null)
  const missingInVersion = !landingSection && !articleExistsInDocsVersion(slug, docVersionId)
  const viewingArchiveArticle = !landingSection && docVersionId !== LATEST_DOCS_VERSION_ID && !missingInVersion
  const articleVersionHistory = !landingSection ? getArticleVersionHistory(slug) : null

  /* Загрузка .md: setState до fetch — обычный паттерн; правило react-hooks/set-state-in-effect здесь шумит. */
  /* eslint-disable react-hooks/set-state-in-effect -- см. выше */
  useEffect(() => {
    if (!landingSection && !articleExistsInDocsVersion(slug, docVersionId)) {
      return
    }
    setLoading(true)
    setError(null)
    setLastUpdated(null)
    const url = buildArticleMarkdownUrl(slug, docVersionId)
    fetchMarkdownText(url, { notFoundMessage: 'Статья не найдена' })
      .then(({ text, lastModified }) => {
        if (lastModified) setLastUpdated(new Date(lastModified))
        setMd(text)
      })
      .catch((e) => setError(`${e.message || 'Failed to fetch'} (${url})`))
      .finally(() => setLoading(false))
  }, [slug, docVersionId, landingSection])
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const [sectionBundlePdfBusy, setSectionBundlePdfBusy] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const pdfFromSearchRef = useRef(false)
  const currentArticle = flatArticles.find((a) => a.path === slug)

  useEffect(() => {
    pdfFromSearchRef.current = false
  }, [slug])

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
    e.preventDefault()
    const clicked = e.target
    const src = clicked.currentSrc || clicked.getAttribute('src') || ''
    if (!src) return
    setLightbox({
      images: [{ src, alt: clicked.alt || '' }],
      currentIndex: 0,
    })
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

  const handleDownloadPdf = () => {
    const el = articleBodyRef.current
    if (!el || pdfExporting) return
    const safeName =
      (currentArticle?.title || slug).replace(/\s+/g, '_').replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'article'
    setPdfExporting(true)
    runArticlePdfExport(el, { filename: `${safeName}.pdf` }).finally(() => setPdfExporting(false))
  }

  useEffect(() => {
    if (loading || error || landingSection) return
    if (!location.state?.downloadPdf || pdfFromSearchRef.current) return
    if (!md) return
    const t = window.setTimeout(() => {
      const el = articleBodyRef.current
      if (!el) return
      pdfFromSearchRef.current = true
      const meta = flatArticles.find((a) => a.path === slug)
      const safeName =
        (meta?.title || slug).replace(/\s+/g, '_').replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'article'
      setPdfExporting(true)
      runArticlePdfExport(el, { filename: `${safeName}.pdf` })
        .finally(() => {
          setPdfExporting(false)
          navigate(
            { pathname: location.pathname, search: location.search, hash: location.hash },
            { replace: true, state: {} },
          )
        })
    }, 150)
    return () => clearTimeout(t)
  }, [
    loading,
    error,
    landingSection,
    location.state,
    location.pathname,
    location.search,
    location.hash,
    slug,
    navigate,
    md,
  ])

  if (missingInVersion) {
    const toLatestArticle = `/${slug}${docsLocationSearchForVersion(location.search, LATEST_DOCS_VERSION_ID)}`
    return (
      <article className="docs-article">
        <div className="docs-article-body">
          <p className="docs-article-version-missing">В этой версии документации статья отсутствует.</p>
          <p>
            <Link to={toLatestArticle}>Перейти к актуальной версии</Link>
          </p>
        </div>
      </article>
    )
  }

  if (loading) return <div className="docs-article docs-loading">Загрузка…</div>
  if (error) {
    const homeSuffix = docsLocationSearchForVersion(location.search, LATEST_DOCS_VERSION_ID)
    const toHome = homeSuffix ? `/${homeSuffix}` : '/'
    return (
      <div className="docs-article">
        <p>{error}</p>
        <Link to={toHome}>На главную</Link>
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
              {!isMcPdf && shouldShowDocsVersionSwitcherOnLanding(slug) ? (
                <DocsVersionSwitcher className="docs-version-switcher--section-landing" />
              ) : null}
            </div>
            <SectionArticleNavList nodes={landingSection.children} navSearchSuffix={navSearchSuffix} />
          </>
        ) : (
          <>
            {viewingArchiveArticle ? (
              <div className="docs-article-archive-line" role="status">
                <span className="docs-article-archive-line__text">
                  Версия: {getDocsVersionMeta(docVersionId)?.label ?? docVersionId} ·{' '}
                  {formatDocsVersionDateRu(
                    getDocsVersionMeta(docVersionId)?.releaseDateISO ?? '',
                  )}
                </span>
                <Link
                  className="docs-article-archive-line__link"
                  to={`/${slug}${docsLocationSearchForVersion(location.search, LATEST_DOCS_VERSION_ID)}`}
                >
                  Перейти к актуальной версии
                </Link>
              </div>
            ) : null}
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={docsMarkdownRehypePlugins()}
            remarkRehypeOptions={{ footnoteLabel: 'Сноски' }}
            components={{
              ol: MarkdownOl,
              ul: MarkdownUl,
              details: MarkdownDetails,
              tr: MarkdownTr,
              table: MarkdownTable,
              img: MarkdownImg,
              span: MarkdownSpan,
              div: MarkdownDiv,
              /* passNode в react-markdown: не прокидывать `node` (hast) в Link/DOM */
              a: ({ href, className, children, node: _omitMdNode, ...props } = {}) => {
                void _omitMdNode
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
                      to={routerLinkTo(appendDocVerToInternalHref(href, location.search))}
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
          </>
        )}

        {lastUpdated && !landingSection ? (
          <p className="docs-article-updated">
            Последнее обновление: {`${String(lastUpdated.getDate()).padStart(2, '0')}.${String(lastUpdated.getMonth() + 1).padStart(2, '0')}.${lastUpdated.getFullYear()}`}
          </p>
        ) : null}
        {!landingSection && (prev || next) ? (
          <footer className="docs-article-footer">
            {prev && (
              <Link to={`/${prev.path}${navSearchSuffix}`} className="docs-nav-prev">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link to={`/${next.path}${navSearchSuffix}`} className="docs-nav-next">
                {next.title} →
              </Link>
            )}
          </footer>
        ) : null}
        </div>
        {!landingSection && articleVersionHistory ? (
          <MarkdownDetails
            className="docs-article-version-history-disclosure"
            aria-label="История версий статьи"
            {...(isMcPdf ? { open: true } : {})}
          >
            <summary>
              <span className="docs-article-version-history-disclosure__label">История версий</span>
            </summary>
            <div className="docs-disclosure-content docs-article-version-history__content">
              <ul className="docs-article-version-history__list">
                {articleVersionHistory.map((entry) => {
                  const { primary, note } = formatArticleHistoryLine(entry)
                  const suffix = docsLocationSearchForVersion(location.search, entry.versionId)
                  return (
                    <li key={entry.versionId} className="docs-article-version-history__item">
                      <Link
                        to={`/${slug}${suffix}`}
                        className={
                          entry.versionId === docVersionId
                            ? 'docs-article-version-history__link docs-article-version-history__link--current'
                            : 'docs-article-version-history__link'
                        }
                      >
                        {primary}
                      </Link>
                      {note ? <span className="docs-article-version-history__note">{note}</span> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          </MarkdownDetails>
        ) : null}
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

export default function Article() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const rawSlug = location.pathname.replace(/^\//, '').replace(/\/$/, '') || '0_docs/4_medadmin/articles/00_main'
  const redirectTarget = articlePathRedirects[rawSlug]
  if (redirectTarget) {
    return <Navigate to={{ pathname: `/${redirectTarget}`, search: location.search }} replace />
  }
  const docVer = resolveDocsVersionIdFromSearch(location.search)
  return <ArticleContent key={`${rawSlug}|${docVer}`} slug={rawSlug} isMcPdf={isMcPdf} />
}
