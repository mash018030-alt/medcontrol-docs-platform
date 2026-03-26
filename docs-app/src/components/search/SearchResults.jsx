import { useState, useEffect } from 'react'
import SearchResultItem from './SearchResultItem'

/** @param {{ results: { path: string, title: string, sectionTitle: string, snippet: string, score: number }[], query: string, showSectionLabel?: boolean }} props */
export default function SearchResults({ results, query, showSectionLabel = true }) {
  const [openId, setOpenId] = useState(null)
  const q = query.trim()

  useEffect(() => {
    setOpenId(null)
  }, [query])

  if (!q) return null

  if (results.length === 0) {
    return (
      <div className="docs-search-empty">
        <p className="docs-search-empty-title">Ничего не найдено</p>
        <p className="docs-search-empty-text">
          Попробуйте изменить формулировку или использовать другие слова.
        </p>
      </div>
    )
  }

  return (
    <div className="docs-search-results">
      <p className="docs-search-count" aria-live="polite">
        Найдено: {results.length}
      </p>
      <ul className="docs-search-results-list">
        {results.map((r) => (
          <li key={r.path}>
            <SearchResultItem
              result={r}
              query={q}
              showSectionLabel={showSectionLabel}
              expanded={openId === r.path}
              onToggle={() => setOpenId((prev) => (prev === r.path ? null : r.path))}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
