import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DocsDashboardGrid from '../dashboard/DocsDashboardGrid'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import { useDocSearchIndex } from '../../hooks/useDocSearchIndex'
import { searchDocuments, suggestArticlesByTitle } from '../../search/docSearch'
import { getDashboardSectionMeta, normalizeDashboardSectionParam } from '../../data/docsDashboardSections'

const DEBOUNCE_MS = 420

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlQ = searchParams.get('q') || ''
  const sectionPath = normalizeDashboardSectionParam(searchParams.get('section') || '')
  const sectionMeta = sectionPath ? getDashboardSectionMeta(sectionPath) : null
  const [inputValue, setInputValue] = useState(urlQ)
  const [searchQ, setSearchQ] = useState(urlQ)
  const debounceTimer = useRef(null)
  const { status, docs, error } = useDocSearchIndex()

  useEffect(() => {
    setInputValue(urlQ)
    setSearchQ(urlQ)
  }, [urlQ])

  const flushQuery = useCallback(
    (raw) => {
      const q = raw.trim()
      setSearchQ(q)
      const next = {}
      if (q) next.q = q
      if (sectionPath) next.section = sectionPath
      setSearchParams(next, { replace: true })
    },
    [setSearchParams, sectionPath],
  )

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      flushQuery(inputValue)
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounceTimer.current)
  }, [inputValue, flushQuery])

  const onEnter = useCallback(() => {
    clearTimeout(debounceTimer.current)
    flushQuery(inputValue)
  }, [inputValue, flushQuery])

  const suggestions = useMemo(
    () => suggestArticlesByTitle(inputValue, 6, sectionPath),
    [inputValue, sectionPath],
  )

  const results = useMemo(() => {
    if (!docs || !searchQ.trim()) return []
    return searchDocuments(docs, searchQ, sectionPath)
  }, [docs, searchQ, sectionPath])

  const hintId = 'docs-search-page-hint'
  const pageTitle = sectionMeta ? sectionMeta.title : 'Документация'

  return (
    <div className="docs-dashboard docs-search-page">
      <h1 className="docs-dashboard-page-title">{pageTitle}</h1>
      <SearchInput
        id="docs-search-page-input"
        value={inputValue}
        onChange={setInputValue}
        onEnter={onEnter}
        suggestions={suggestions}
        showSuggestionSection={!sectionPath}
        onSuggestionPick={(path) => {
          navigate(`/${path}`)
        }}
        aria-describedby={hintId}
      />
      <p id={hintId} className="docs-sr-only">
        {sectionPath
          ? `Поиск только в разделе «${pageTitle}»: по заголовкам и полному тексту статей раздела. Обновление с задержкой или по Enter.`
          : 'Поиск выполняется по заголовкам и полному тексту статей. Обновление списка с задержкой или по Enter.'}
      </p>
      {status === 'loading' && <p className="docs-search-status">Подготовка поиска по текстам…</p>}
      {status === 'error' && (
        <p className="docs-search-status docs-search-status--error" role="alert">
          Не удалось загрузить документы для поиска.{error?.message ? ` ${error.message}` : ''}
        </p>
      )}
      {!searchQ.trim() && !sectionPath ? <DocsDashboardGrid /> : null}
      {status === 'ready' && searchQ.trim() ? (
        <SearchResults results={results} query={searchQ} showSectionLabel={!sectionPath} />
      ) : null}
    </div>
  )
}
