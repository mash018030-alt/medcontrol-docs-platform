/**
 * Скрытый рендер markdown релиза и экспорт PDF без перехода на страницу статьи
 * (если нет pdf-server — тот же html2pdf, что на странице релиза).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { runArticlePdfExport } from '../../utils/runArticlePdfExport'
import { docsMarkdownRehypePlugins } from '../../docsMarkdownRehypePlugins'
import { newsArticleMdRelPaths } from '../../data/newsArticlePaths'
import { fetchMarkdownText } from '../../utils/fetchMarkdownText'
import { publicAssetUrl } from '../../utils/publicAssetUrl'
import { buildMarkdownHeadingComponents } from '../../utils/buildMarkdownHeadingComponents'
import MarkdownTr from '../MarkdownTr'
import MarkdownTable from '../MarkdownTable'
import MarkdownImg from '../MarkdownImg'
import MarkdownDetails from '../MarkdownDetails'
import MarkdownSpan from '../MarkdownSpan'
import MarkdownDiv from '../MarkdownDiv'

const isMcPdf = false

/**
 * @param {{ tree: unknown[], articlePath: string, filename: string, onDone: () => void }} props
 */
export default function NewsReleaseHubPdfExport({ tree, articlePath, filename, onDone }) {
  const [md, setMd] = useState(null)
  const rootRef = useRef(null)

  const markdownComponents = useMemo(
    () => ({
      tr: MarkdownTr,
      table: MarkdownTable,
      details: MarkdownDetails,
      img: MarkdownImg,
      span: MarkdownSpan,
      div: MarkdownDiv,
      a: ({ href, className, children, node: _mdNode, ...props } = {}) => {
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
    [],
  )

  useEffect(() => {
    let cancelled = false
    const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
    const relPaths = newsArticleMdRelPaths(tree, articlePath)
    ;(async () => {
      let lastErr = null
      for (const rel of relPaths) {
        const fetchPath = `${base}/content/${rel}`.replace(/^\/+/, '/')
        const url = new URL(fetchPath, window.location.origin).href
        try {
          const { text } = await fetchMarkdownText(url, {
            notFoundMessage: 'Не удалось загрузить страницу',
          })
          if (!cancelled) setMd(text)
          return
        } catch (e) {
          lastErr = e
        }
      }
      if (!cancelled) {
        window.alert(lastErr?.message || 'Не удалось загрузить релиз для PDF')
        onDone()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tree, articlePath, onDone])

  useLayoutEffect(() => {
    if (md === null) return
    let cancelled = false
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        if (cancelled) return
        const el = rootRef.current
        try {
          if (el) await runArticlePdfExport(el, { filename })
        } finally {
          if (!cancelled) onDone()
        }
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [md, filename, onDone])

  if (md === null) return null

  return (
    <div className="docs-news-hub-pdf-offscreen" aria-hidden>
      <div ref={rootRef} className="docs-markdown-root" role="presentation">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={docsMarkdownRehypePlugins()}
          remarkRehypeOptions={{ footnoteLabel: 'Сноски' }}
          components={markdownComponents}
        >
          {md}
        </ReactMarkdown>
      </div>
    </div>
  )
}
