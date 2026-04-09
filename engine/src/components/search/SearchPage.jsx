import { useNavigate, useSearchParams } from 'react-router-dom'
import DocsDashboardGrid from '../dashboard/DocsDashboardGrid'
import GlobalSearchPanel from './GlobalSearchPanel'
import { useDebouncedDocSearch } from '../../hooks/useDebouncedDocSearch'
import { getDashboardSectionMeta, normalizeDashboardSectionParam } from '../../data/docsDashboardSections'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlQ = searchParams.get('q') || ''
  const sectionPath = normalizeDashboardSectionParam(searchParams.get('section') || '')
  const sectionMeta = sectionPath ? getDashboardSectionMeta(sectionPath) : null

  const {
    inputValue,
    setInputValue,
    onEnter,
    suggestions,
    results,
    searchQ,
    status,
    error,
  } = useDebouncedDocSearch({
    sectionPath,
    urlMode: true,
    urlQ,
    setSearchParams,
    open: true,
  })

  const hintId = 'docs-search-page-hint'
  const pageTitle = sectionMeta ? sectionMeta.title : 'Документация'
  const hintText = sectionPath
    ? `Поиск только в разделе «${pageTitle}»: по заголовкам и полному тексту статей раздела. Обновление с задержкой или по Enter.`
    : 'Поиск выполняется по заголовкам и полному тексту статей. Обновление списка с задержкой или по Enter.'

  return (
    <div className="docs-dashboard docs-search-page">
      <h1 className="docs-dashboard-page-title">{pageTitle}</h1>
      <GlobalSearchPanel
        inputId="docs-search-page-input"
        inputValue={inputValue}
        onInputChange={setInputValue}
        onEnter={onEnter}
        suggestions={suggestions}
        showSuggestionSection={!sectionPath}
        onSuggestionPick={(path) => navigate(`/${path}`)}
        hintId={hintId}
        hintText={hintText}
        placeholder="Поиск"
        status={status}
        error={error}
        searchQ={searchQ}
        results={results}
        showSectionLabelInResults={!sectionPath}
      >
        {!searchQ.trim() && !sectionPath ? <DocsDashboardGrid /> : null}
      </GlobalSearchPanel>
    </div>
  )
}
