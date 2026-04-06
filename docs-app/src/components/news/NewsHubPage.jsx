import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchNewsTree, releaseSectionCategories } from '../../data/fetchNewsTree'
import LatestReleaseBanner from './LatestReleaseBanner'
import ReleaseList from './ReleaseList'

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
    <article className="docs-article docs-news-hub">
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
            />
            {previous.length ? (
              <>
                <h3 className="docs-news-hub__subheading">Предыдущие релизы</h3>
                <ReleaseList items={previous} />
              </>
            ) : null}
          </section>
        )
      })}
    </article>
  )
}
