import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchInput from '../search/SearchInput'
import { suggestArticlesByTitle } from '../../search/docSearch'

const DEBOUNCE_MS = 420

/**
 * @param {{ sectionRootPath?: string | null }} props если задан — переход на /search с ?section=… и подсказки только по разделу
 */
export default function SearchBar({ sectionRootPath = null }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const timer = useRef(null)

  const suggestions = useMemo(
    () => suggestArticlesByTitle(value, 6, sectionRootPath),
    [value, sectionRootPath],
  )

  const searchUrl = (q) => {
    const sp = new URLSearchParams()
    sp.set('q', q)
    if (sectionRootPath) sp.set('section', sectionRootPath)
    return `/search?${sp.toString()}`
  }

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const q = value.trim()
      if (!q) return
      navigate(searchUrl(q), { replace: true })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer.current)
  }, [value, navigate, sectionRootPath])

  return (
    <>
      <SearchInput
        id="docs-dashboard-search-input"
        value={value}
        onChange={setValue}
        onEnter={() => {
          clearTimeout(timer.current)
          const q = value.trim()
          if (q) navigate(searchUrl(q), { replace: true })
        }}
        suggestions={suggestions}
        onSuggestionPick={(path) => navigate(`/${path}`)}
        aria-describedby="docs-dashboard-search-hint"
      />
      <span id="docs-dashboard-search-hint" className="docs-sr-only">
        Введите запрос. После паузы откроется страница результатов или нажмите Enter.
      </span>
    </>
  )
}
