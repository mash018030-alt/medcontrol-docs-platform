import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchInput from '../search/SearchInput'
import { suggestArticles, suggestArticlesByTitle } from '../../search/docSearch'
import { useDocSearchIndex } from '../../hooks/useDocSearchIndex'

/**
 * @param {{ sectionRootPath?: string | null }} props если задан — переход на /search с ?section=… и подсказки только по разделу
 */
export default function SearchBar({ sectionRootPath = null }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const { docs } = useDocSearchIndex()

  const suggestions = useMemo(() => {
    if (!docs) return suggestArticlesByTitle(value, 6, sectionRootPath)
    return suggestArticles(docs, value, 6, sectionRootPath)
  }, [docs, value, sectionRootPath])

  const searchUrl = (q) => {
    const sp = new URLSearchParams()
    sp.set('q', q)
    if (sectionRootPath) sp.set('section', sectionRootPath)
    return `/search?${sp.toString()}`
  }

  return (
    <>
      <SearchInput
        id="docs-dashboard-search-input"
        value={value}
        onChange={setValue}
        onEnter={() => {
          const q = value.trim()
          if (q) navigate(searchUrl(q), { replace: true })
        }}
        suggestions={suggestions}
        onSuggestionPick={(path) => navigate(`/${path}`)}
        aria-describedby="docs-dashboard-search-hint"
      />
      <span id="docs-dashboard-search-hint" className="docs-sr-only">
        Введите запрос и нажмите Enter, чтобы открыть страницу результатов.
      </span>
    </>
  )
}
