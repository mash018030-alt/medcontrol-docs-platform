import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchNewsTree, releaseSectionCategories } from '../../data/fetchNewsTree'
import {
  runArticlePdfExport,
  getPdfServiceApiUrl,
  buildArticleMcPdfUrl,
} from '../../utils/runArticlePdfExport'
import LatestReleaseBanner from './LatestReleaseBanner'
import NewsReleaseHubPdfExport from './NewsReleaseHubPdfExport'
import ReleaseList from './ReleaseList'

function safeNewsPdfFilename(title) {
  const base =
    String(title)
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0400-\u04FF_-]/gi, '') || 'release'
  return `${base}.pdf`
}

function hubSectionId(categoryPath) {
  const tail = categoryPath.split('/').filter(Boolean).pop() || 'releases'
  return `hub-${tail}`
}

function sortNewestFirst(leaves) {
  return [...leaves].reverse()
}

export default function NewsHubPage() {
  const location = useLocation()
  const [tree, setTree] = useState([])
  const [err, setErr] = useState(null)
  const [ready, setReady] = useState(false)
  const [pdfBusyPath, setPdfBusyPath] = useState(null)
  const [clientPdfJob, setClientPdfJob] = useState(null)

  const clearClientPdfJob = useCallback(() => {
    setClientPdfJob(null)
    setPdfBusyPath(null)
  }, [])

  const handleReleasePdf = useCallback(
    async (articlePath, title) => {
      if (pdfBusyPath != null) return
      setPdfBusyPath(articlePath)
      const filename = safeNewsPdfFilename(title)
      try {
        if (getPdfServiceApiUrl()) {
          await runArticlePdfExport(document.body, {
            filename,
            printUrl: buildArticleMcPdfUrl(articlePath),
          })
          setPdfBusyPath(null)
          return
        }
        setClientPdfJob({ articlePath, filename })
      } catch {
        setPdfBusyPath(null)
      }
    },
    [pdfBusyPath],
  )

  useEffect(() => {
    let cancelled = false
    fetchNewsTree()
      .then((t) => {
        if (!cancelled) {
          setTree(t)
          setErr(null)
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message || 'Ошибка загрузки')
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    const id = location.hash?.replace(/^#/, '')
    if (!id || !ready) return
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash, ready, tree])

  if (!ready) {
    return <div className="docs-article docs-loading">Загрузка…</div>
  }

  if (err) {
    return (
      <div className="docs-article">
        <p>{err}</p>
      </div>
    )
  }

  const categories = releaseSectionCategories(tree)

  return (
    <article className="docs-article docs-news-hub" aria-busy={pdfBusyPath != null}>
      {clientPdfJob ? (
        <NewsReleaseHubPdfExport
          tree={tree}
          articlePath={clientPdfJob.articlePath}
          filename={clientPdfJob.filename}
          onDone={clearClientPdfJob}
        />
      ) : null}
      <header id="hub-releases" className="docs-news-hub__header">
        <h1 className="docs-news-hub__title">Релизы</h1>
      </header>

      {categories.map((cat) => {
        const ordered = sortNewestFirst(cat.children)
        const latest = ordered[0]
        const previous = ordered.slice(1)
        if (!latest) return null

        const sectionId = hubSectionId(cat.path)
        const label = cat.title.includes('Cloud') ? 'Cloud' : cat.title.includes('Mobile') ? 'Mobile' : cat.title

        return (
          <section key={cat.path} id={sectionId} className="docs-news-hub__section" aria-labelledby={`${sectionId}-heading`}>
            <h2 id={`${sectionId}-heading`} className="docs-news-hub__section-title">
              {cat.title}
            </h2>
            <LatestReleaseBanner
              title={latest.title}
              categoryLabel={label}
              articlePath={latest.path}
              onReleasePdf={handleReleasePdf}
              releasePdfBusy={pdfBusyPath != null}
            />
            {previous.length ? (
              <>
                <h3 className="docs-news-hub__subheading">Предыдущие релизы</h3>
                <ReleaseList items={previous} onReleasePdf={handleReleasePdf} releasePdfBusy={pdfBusyPath != null} />
              </>
            ) : null}
          </section>
        )
      })}
    </article>
  )
}
