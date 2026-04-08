import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDebouncedDocSearch } from '../../hooks/useDebouncedDocSearch'
import GlobalSearchPanel from './GlobalSearchPanel'

/**
 * Глобальный поиск в оверлее: тот же debounce, индекс и выдача, что на странице /search (без привязки к URL).
 */
export default function GlobalSearchDialog({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const pathKeyRef = useRef(`${location.pathname}${location.search}`)

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
    sectionPath: null,
    urlMode: false,
    open,
  })

  useEffect(() => {
    if (!open) {
      pathKeyRef.current = `${location.pathname}${location.search}`
      return
    }
    const cur = `${location.pathname}${location.search}`
    if (pathKeyRef.current !== cur) {
      onClose()
    }
    pathKeyRef.current = cur
  }, [location.pathname, location.search, open, onClose])

  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const hintId = 'docs-global-search-dialog-hint'

  return (
    <div
      className="docs-global-search-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="docs-global-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Поиск по документации"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="docs-global-search-dialog__close"
          onClick={onClose}
          aria-label="Закрыть поиск"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="docs-global-search-dialog__body">
          <GlobalSearchPanel
            inputId="docs-global-search-input"
            inputRef={inputRef}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onEnter={onEnter}
            suggestions={suggestions}
            showSuggestionSection
            onSuggestionPick={(path) => {
              navigate(`/${path}`)
              onClose()
            }}
            hintId={hintId}
            hintText="Глобальный поиск по заголовкам и полному тексту статей. Список обновляется с небольшой задержкой или сразу по Enter."
            placeholder="Поиск по документации"
            status={status}
            error={error}
            searchQ={searchQ}
            results={results}
            showSectionLabelInResults
          />
        </div>
      </div>
    </div>
  )
}
