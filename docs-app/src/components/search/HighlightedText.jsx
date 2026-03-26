import { useMemo } from 'react'
import { normalizeToken, searchTokensFromQuery, shouldHighlightWord } from '../../search/docSearch'

/** @param {{ text: string, query: string }} props */
export default function HighlightedText({ text, query }) {
  const queryTokens = useMemo(() => searchTokensFromQuery(query), [query])
  if (!text) return null

  const parts = text.split(/([\p{L}\p{N}]+)/u)

  return (
    <span className="docs-search-highlight-root">
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return <span key={i}>{part}</span>
        }
        const norm = normalizeToken(part)
        const hit = shouldHighlightWord(norm, queryTokens)
        if (hit) {
          return (
            <mark key={i} className="docs-search-mark">
              {part}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}
