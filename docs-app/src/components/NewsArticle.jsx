import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { runArticlePdfExport } from '../utils/runArticlePdfExport'
import { rehypeFootnotesSection } from '../rehype-footnotes-section'
import { rehypePublicAssets } from '../rehype-public-assets'
import { attachDocsCarousels } from '../utils/attachDocsCarousels'
import {
  fetchNewsTree,
  findNewsNode,
  flattenNewsLeaves,
  NEWS_ROOT_SLUG,
} from '../data/fetchNewsTree'
import Toc from './Toc'
import { NEWS_RELEASE_PDF_ANCHOR } from './news/releasePdfAnchor'
import { useArticleHashScroll } from '../hooks/useArticleHashScroll'
import { useFootnoteBackrefClick } from '../hooks/useFootnoteBackrefClick'
import { useArticleTocHeadings } from '../hooks/useArticleTocHeadings'
import MarkdownTr from './MarkdownTr'
import MarkdownTable from './MarkdownTable'
import LightboxCloseButton from './LightboxCloseButton'
import MarkdownImg from './MarkdownImg'
import { publicAssetUrl } from '../utils/publicAssetUrl'
import { buildMarkdownHeadingComponents } from '../utils/buildMarkdownHeadingComponents'

function mdFileSlugFromPath(newsPath) {
  const parts = newsPath.split('/')
  return parts[parts.length - 1] || ''
}

export default function NewsArticle() {
  const params = useParams()
  const splat = params['*'] ?? ''
  const newsSlugPath = String(splat).replace(/^\/+|\/+$/g, '')
  const fullSlug = newsSlugPath ? `news/${newsSlugPath}` : ''

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'

  const [tree, setTree] = useState([])
  const [treeError, setTreeError] = useState(null)
  const [treeReady, setTreeReady] = useState(false)

  const [md, setMd] = useState('')
  const [mdLoading, setMdLoading] = useState(false)
  const [mdError, setMdError] = useState(null)

  const [pdfExporting, setPdfExporting] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const articleBodyRef = useRef(null)

  const markdownComponents = useMemo(
    () => ({
      tr: MarkdownTr,
      table: MarkdownTable,
      img: MarkdownImg,
      a: ({ href, className, children, ...props }) => {
        const isBackref =
          (typeof className === 'string' && className.includes('data-footnote-backref')) ||
          (href && String(href).startsWith('#user-content-fnref-'))
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
    }),
    [isMcPdf],
  )

  useEffect(() => {
    if (!fullSlug) {
      navigate(`/${NEWS_ROOT_SLUG}`, { replace: true })
    }
  }, [fullSlug, navigate])

  useEffect(() => {
    let cancelled = false
    fetchNewsTree()
      .then((t) => {
        if (!cancelled) {
          setTree(t)
          setTreeError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setTree([])
          setTreeError(e.message || 'Ошибка загрузки')
        }
      })
      .finally(() => {
        if (!cancelled) setTreeReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const node = useMemo(() => {
    if (!treeReady || !fullSlug) return null
    return findNewsNode(tree, fullSlug)
  }, [tree, treeReady, fullSlug])

  const isLanding = Boolean(node?.children?.length)
  const isLeaf = Boolean(node && !node.children?.length)

  const tocEnabled =
    Boolean(fullSlug) &&
    treeReady &&
    Boolean(node) &&
    !mdLoading &&
    !mdError &&
    isLeaf

  const headings = useArticleTocHeadings(
    articleBodyRef,
    tocEnabled,
    `${fullSlug}|${isLeaf ? 'Y' : 'N'}|${md}`,
  )

  /** В новостях в оглавлении только h2+, без дублирования заголовка страницы (h1). */
  const tocHeadings = useMemo(() => headings.filter((h) => h.level >= 2), [headings])

  useEffect(() => {
    if (!isMcPdf || mdLoading || !isLeaf) return
    const id = requestAnimationFrame(() => {
      articleBodyRef.current?.querySelectorAll('details').forEach((d) => {
        d.open = true
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isMcPdf, mdLoading, isLeaf, md, fullSlug])

  useEffect(() => {
    if (!fullSlug || !treeReady || !node) {
      if (!fullSlug || !treeReady) return
      setMd('')
      setMdError(null)
      setMdLoading(false)
      return
    }
    if (node.children?.length) {
      setMd('')
      setMdError(null)
      setMdLoading(false)
      return
    }
    const fileSlug = mdFileSlugFromPath(fullSlug)
    setMdLoading(true)
    setMdError(null)
    const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
    const path = `${base}/content/News/${fileSlug}.md`.replace(/^\/+/, '/')
    const url = new URL(path, window.location.origin).href
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить страницу')
        return r.text()
      })
      .then((text) => {
        setMd(text)
      })
      .catch((e) => setMdError(e.message || 'Ошибка'))
      .finally(() => setMdLoading(false))
  }, [fullSlug, treeReady, node])

  const activeHeadingId = useArticleHashScroll(articleBodyRef, {
    loading: mdLoading,
    slug: fullSlug,
    md,
    enabled: !mdLoading && !mdError && isLeaf && Boolean(node),
  })
  useFootnoteBackrefClick(articleBodyRef, !mdLoading && !mdError && isLeaf && Boolean(node), md)

  useEffect(() => {
    if (mdLoading || !isLeaf) return
    let detach = () => {}
    const frame = requestAnimationFrame(() => {
      const el = articleBodyRef.current
      if (!el) return
      detach = attachDocsCarousels(el)
    })
    return () => {
      cancelAnimationFrame(frame)
      detach()
    }
  }, [md, mdLoading, isLeaf])

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightbox])

  const flatLeaves = useMemo(() => flattenNewsLeaves(tree), [tree])
  const leafIndex = flatLeaves.findIndex((a) => a.path === fullSlug)
  const prev = leafIndex > 0 ? flatLeaves[leafIndex - 1] : null
  const next =
    leafIndex >= 0 && leafIndex < flatLeaves.length - 1 ? flatLeaves[leafIndex + 1] : null
  const handleContentClick = (e) => {
    if (e.target.tagName !== 'IMG') return
    const inCarousel = e.target.closest('.docs-carousel')
    if (inCarousel?.dataset.docsCarouselSwipeJustNow === '1') return
    e.preventDefault()
    const el = articleBodyRef.current
    if (!el) return
    const clicked = e.target
    const carousel = clicked.closest('.docs-carousel')
    const imgs = carousel
      ? Array.from(carousel.querySelectorAll('.docs-carousel-slide img'))
      : [clicked]
    const images = imgs
      .map((img) => ({
        src: img.currentSrc || img.getAttribute('src') || '',
        alt: img.alt || '',
      }))
      .filter((x) => x.src)
    const idx = imgs.findIndex(
      (img) =>
        (img.currentSrc || img.getAttribute('src')) ===
        (clicked.currentSrc || clicked.getAttribute('src'))
    )
    if (images.length > 0) setLightbox({ images, currentIndex: idx >= 0 ? idx : 0 })
  }

  const handleDownloadPdf = () => {
    const el = articleBodyRef.current
    if (!el || pdfExporting) return
    const safeName = (node?.title || mdFileSlugFromPath(fullSlug))
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'news'
    setPdfExporting(true)
    runArticlePdfExport(el, { filename: `${safeName}.pdf` }).finally(() => setPdfExporting(false))
  }

  if (!fullSlug) {
    return null
  }

  if (!treeReady) {
    return <div className="docs-article docs-loading">Загрузка…</div>
  }

  if (treeError && tree.length === 0) {
    return (
      <div className="docs-article">
        <p>{treeError}</p>
        <Link to={`/${NEWS_ROOT_SLUG}`}>К разделу новостей</Link>
      </div>
    )
  }

  if (!node) {
    return (
      <div className="docs-article">
        <p>Страница не найдена.</p>
        <Link to={`/${NEWS_ROOT_SLUG}`}>К разделу новостей</Link>
      </div>
    )
  }

  if (isLanding) {
    const tail = node.path.split('/').filter(Boolean).pop() || ''
    return <Navigate to={`/news#hub-${tail}`} replace />
  }

  if (isLeaf) {
    if (mdLoading) return <div className="docs-article docs-loading">Загрузка…</div>
    if (mdError) {
      return (
        <div className="docs-article">
          <p>{mdError}</p>
          <Link to={`/${NEWS_ROOT_SLUG}`}>К разделу новостей</Link>
        </div>
      )
    }

    return (
      <article className="docs-article">
        <div className="docs-article-body">
          {!isMcPdf && (
            <div className="docs-article-actions">
              <button
                type="button"
                id={NEWS_RELEASE_PDF_ANCHOR}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeFootnotesSection(), rehypePublicAssets()]}
              remarkRehypeOptions={{ footnoteLabel: 'Сноски' }}
              components={markdownComponents}
            >
              {md}
            </ReactMarkdown>
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
          </div>
        </div>
        {!isMcPdf && <Toc headings={tocHeadings} activeId={activeHeadingId} />}
        {lightbox && lightbox.images && (
          <div
            ref={(n) => n?.focus()}
            className="docs-lightbox"
            onClick={() => setLightbox(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightbox(null)
              const n = lightbox.images.length
              if (n > 1 && e.key === 'ArrowLeft' && lightbox.currentIndex > 0) {
                e.stopPropagation()
                setLightbox((prevLb) => ({
                  ...prevLb,
                  currentIndex: prevLb.currentIndex - 1,
                }))
              }
              if (n > 1 && e.key === 'ArrowRight' && lightbox.currentIndex < n - 1) {
                e.stopPropagation()
                setLightbox((prevLb) => ({
                  ...prevLb,
                  currentIndex: prevLb.currentIndex + 1,
                }))
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
                      setLightbox((prevLb) => ({
                        ...prevLb,
                        currentIndex: prevLb.currentIndex - 1,
                      }))
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
                      setLightbox((prevLb) => ({
                        ...prevLb,
                        currentIndex: prevLb.currentIndex + 1,
                      }))
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

  return (
    <div className="docs-article">
      <p>Для этой страницы не задан контент.</p>
      <Link to={`/${NEWS_ROOT_SLUG}`}>К разделу новостей</Link>
    </div>
  )
}
