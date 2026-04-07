import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useDocSearchIndex } from './useDocSearchIndex'
import { searchDocuments, suggestArticles, suggestArticlesByTitle } from '../search/docSearch'

const DEBOUNCE_MS = 320

/**
 * Общая логика поля поиска, подсказок и выдачи (как на /search).
 * @param {{
 *   sectionPath?: string | null,
 *   urlMode?: boolean,
 *   urlQ?: string,
 *   setSearchParams?: (next: Record<string, string>, opts?: { replace?: boolean }) => void,
 *   open?: boolean,
 * }} options
 */
export function useDebouncedDocSearch({
  sectionPath = null,
  urlMode = false,
  urlQ = '',
  setSearchParams,
  open = true,
} = {}) {
  const { status, docs, error } = useDocSearchIndex()
  const [inputValue, setInputValue] = useState(urlMode ? urlQ : '')
  const [searchQ, setSearchQ] = useState(urlMode ? urlQ.trim() : '')
  const debounceTimer = useRef(null)
  const internalUrlSyncRef = useRef(false)

  useEffect(() => {
    if (!urlMode) return
    if (internalUrlSyncRef.current) {
      internalUrlSyncRef.current = false
      setSearchQ(urlQ.trim())
      return
    }
    setInputValue(urlQ)
    setSearchQ(urlQ.trim())
  }, [urlQ, urlMode])

  useEffect(() => {
    if (urlMode) return
    if (!open) return
    setInputValue('')
    setSearchQ('')
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
  }, [open, urlMode])

  const flushQuery = useCallback(
    (raw) => {
      const qRaw = raw
      const q = qRaw.trim()
      setSearchQ(q)
      if (urlMode && setSearchParams) {
        const next = {}
        if (qRaw) next.q = qRaw
        if (sectionPath) next.section = sectionPath
        internalUrlSyncRef.current = true
        setSearchParams(next, { replace: true })
      }
    },
    [urlMode, setSearchParams, sectionPath],
  )

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      flushQuery(inputValue)
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounceTimer.current)
  }, [inputValue, flushQuery])

  const onEnter = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    flushQuery(inputValue)
  }, [inputValue, flushQuery])

  const suggestions = useMemo(() => {
    if (!docs) return suggestArticlesByTitle(inputValue, 6, sectionPath)
    return suggestArticles(docs, inputValue, 6, sectionPath)
  }, [docs, inputValue, sectionPath])

  const results = useMemo(() => {
    if (!docs || !searchQ.trim()) return []
    return searchDocuments(docs, searchQ, sectionPath)
  }, [docs, searchQ, sectionPath])

  return {
    inputValue,
    setInputValue,
    onEnter,
    suggestions,
    results,
    searchQ,
    status,
    error,
  }
}
