import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { rehypeFootnotesSection } from '../rehype-footnotes-section'
import { rehypePublicAssets } from '../rehype-public-assets'
import { orderedPathsForSectionPdfBundle } from '../data/nav'
import { docsDashboardSections } from '../data/docsDashboardSections'
import { MarkdownOl, MarkdownUl } from './markdownListComponents'
import MarkdownTr from './MarkdownTr'
import MarkdownTable from './MarkdownTable'
import MarkdownImg from './MarkdownImg'
import MarkdownDetails from './MarkdownDetails'
import { publicAssetUrl } from '../utils/publicAssetUrl'
import { readFetchedMarkdownBody } from '../utils/fetchMarkdownText'
import { buildMarkdownHeadingComponents } from '../utils/buildMarkdownHeadingComponents'

const ALLOWED_SECTION_PDF_ROOTS = new Set(
  docsDashboardSections.filter((s) => s.sectionPdfBundle).map((s) => s.sectionPath),
)

/**
 * Между файлами в PDF-сборке раздела — только визуальный разрыв (hr), без page-break.
 * Иначе после каждой короткой статьи на странице остаётся «конский» пустой хвост до следующей страницы.
 */
const SECTION_ARTICLE_SEPARATOR = '\n\n---\n\n'

async function fetchMd(path) {
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  const url = new URL(`${base}/content/${path}.md`.replace(/^\/+/, '/'), window.location.origin).href
  const r = await fetch(url, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`${path}: ${r.status}`)
  return readFetchedMarkdownBody(r, `${path}: не найден или не markdown`)
}

export default function SectionPdfBundlePage() {
  const [searchParams] = useSearchParams()
  const root = (searchParams.get('root') || '').trim()
  const articleBodyRef = useRef(null)
  const [combinedMd, setCombinedMd] = useState('')
  const [loading, setLoading] = useState(Boolean(root && ALLOWED_SECTION_PDF_ROOTS.has(root)))
  const [error, setError] = useState(null)
  const isMcPdf = searchParams.get('mc_pdf') === '1'

  useEffect(() => {
    if (!root || !ALLOWED_SECTION_PDF_ROOTS.has(root)) {
      setLoading(false)
      return
    }

    const paths = orderedPathsForSectionPdfBundle(root)
    if (!paths.length) {
      setError('Не удалось определить статьи раздела.')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const chunks = await Promise.all(paths.map((p) => fetchMd(p)))
        if (cancelled) return
        const parts = chunks.map((t) => t.trim()).filter(Boolean)
        const md = parts.join(SECTION_ARTICLE_SEPARATOR)
        setCombinedMd(md)
      } catch (e) {
        if (cancelled) return
        setError(e?.message || String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [root])

  useEffect(() => {
    if (!isMcPdf || loading || error) return
    const id = requestAnimationFrame(() => {
      articleBodyRef.current?.querySelectorAll('details').forEach((d) => {
        d.open = true
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isMcPdf, loading, error, combinedMd])

  if (!root) {
    return (
      <div className="docs-article docs-loading">
        <p>Не указан раздел (параметр root).</p>
        <Link to="/">На главную</Link>
      </div>
    )
  }

  if (!ALLOWED_SECTION_PDF_ROOTS.has(root)) {
    return (
      <div className="docs-article docs-loading">
        <p>Этот раздел пока не поддерживает сборку в один PDF.</p>
        <Link to="/">На главную</Link>
      </div>
    )
  }

  if (loading) return <div className="docs-article docs-loading">Собираем раздел для PDF…</div>
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
        <div
          ref={articleBodyRef}
          className="docs-markdown-root"
          role="presentation"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeFootnotesSection(), rehypePublicAssets()]}
            remarkRehypeOptions={{ footnoteLabel: 'Сноски' }}
            components={{
              ol: MarkdownOl,
              ul: MarkdownUl,
              details: MarkdownDetails,
              tr: MarkdownTr,
              table: MarkdownTable,
              img: MarkdownImg,
              a: ({ href, className, children, node: _mdNode, ...props }) => {
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
                    {...(isBackref
                      ? { title: 'Вернуться к месту в тексте', 'aria-label': 'Вернуться к месту в тексте' }
                      : {})}
                  >
                    {children}
                  </a>
                )
              },
              ...buildMarkdownHeadingComponents(isMcPdf),
            }}
          >
            {combinedMd}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  )
}
