import { useState, useEffect, useRef } from 'react'
import HighlightedText from './HighlightedText'

/**
 * @param {{
 *   id?: string,
 *   value: string,
 *   onChange: (v: string) => void,
 *   onEnter?: () => void,
 *   suggestions?: { title: string, path: string, sectionTitle: string }[],
 *   onSuggestionPick?: (path: string) => void,
 *   placeholder?: string,
 *   showSuggestionSection?: boolean,
 *   'aria-describedby'?: string,
 *   inputRef?: import('react').RefObject<HTMLInputElement | null>,
 * }} props
 */
export default function SearchInput({
                                    id = 'docs-search-input',
                                    value,
                                    onChange,
                                    onEnter,
                                    suggestions = [],
                                    onSuggestionPick,
                                    placeholder = 'Поиск',
                                    showSuggestionSection = true,
                                    'aria-describedby': ariaDescribedBy,
                                    inputRef,
                                  }) {
  const wrapRef = useRef(null)
  const [panelDismissed, setPanelDismissed] = useState(false)

  useEffect(() => {
    setPanelDismissed(false)
  }, [value])

  useEffect(() => {
    const hasPanel = suggestions.length > 0 && value.trim().length > 0
    if (!hasPanel || panelDismissed) return
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPanelDismissed(true)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [suggestions, value, panelDismissed])

  const showSuggestions =
    !panelDismissed &&
    suggestions.length > 0 &&
    value.trim().length > 0

  const listId = `${id}-suggestions`

  return (
    <div ref={wrapRef} className="docs-dashboard-search docs-search-input-wrap">
      <label className="docs-dashboard-search-label" htmlFor={id}>
        <span className="docs-sr-only">Поиск по документации</span>
        <input
          ref={inputRef}
          id={id}
          type="search"
          className="docs-dashboard-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setPanelDismissed(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter?.()
            }
          }}
          autoComplete="off"
          enterKeyHint="search"
          aria-describedby={ariaDescribedBy}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listId : undefined}
        />
      </label>
      {showSuggestions && (
        <ul id={listId} className="docs-search-suggestions" role="listbox">
          {suggestions.map((a) => (
            <li key={a.path} role="option">
              <button
                type="button"
                className="docs-search-suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPanelDismissed(true)
                  onSuggestionPick?.(a.path)
                }}
              >
                <span className="docs-search-suggestion-label">
                  {showSuggestionSection && a.sectionTitle ? (
                    <span className="docs-search-suggestion-section">{a.sectionTitle}</span>
                  ) : null}
                  <span className="docs-search-suggestion-title">
                    <HighlightedText text={a.title} query={value} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <span className="docs-dashboard-search-icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M16 16l5 5" />
        </svg>
      </span>
    </div>
  )
}
