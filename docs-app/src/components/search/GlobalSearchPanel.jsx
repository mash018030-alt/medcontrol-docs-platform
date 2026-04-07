import SearchInput from './SearchInput'
import SearchResults from './SearchResults'

/**
 * Общая разметка поиска (поле, статус индекса, результаты) — та же логика, что на /search.
 */
export default function GlobalSearchPanel({
  inputId,
  inputRef,
  inputValue,
  onInputChange,
  onEnter,
  suggestions,
  onSuggestionPick,
  showSuggestionSection = true,
  hintId,
  hintText,
  placeholder = 'Поиск',
  status,
  error,
  searchQ,
  results,
  showSectionLabelInResults = true,
  children,
}) {
  return (
    <>
      <SearchInput
        id={inputId}
        inputRef={inputRef}
        value={inputValue}
        onChange={onInputChange}
        onEnter={onEnter}
        suggestions={suggestions}
        showSuggestionSection={showSuggestionSection}
        onSuggestionPick={onSuggestionPick}
        placeholder={placeholder}
        aria-describedby={hintId}
      />
      <p id={hintId} className="docs-sr-only">
        {hintText}
      </p>
      {status === 'loading' && <p className="docs-search-status">Подготовка поиска по текстам…</p>}
      {status === 'error' && (
        <p className="docs-search-status docs-search-status--error" role="alert">
          Не удалось загрузить документы для поиска.{error?.message ? ` ${error.message}` : ''}
        </p>
      )}
      {children}
      {status === 'ready' && searchQ.trim() ? (
        <SearchResults results={results} query={searchQ} showSectionLabel={showSectionLabelInResults} />
      ) : null}
    </>
  )
}
