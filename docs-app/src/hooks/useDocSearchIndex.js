import { useEffect, useState } from 'react'
import { loadAllDocs } from '../search/docSearch'

/**
 * Один раз загружает тексты всех статей для клиентского поиска.
 * @returns {{ status: 'idle' | 'loading' | 'ready' | 'error', docs: Map<string, { md: string, article: { title: string, path: string } }> | null, error: Error | null }}
 */
export function useDocSearchIndex() {
  const [status, setStatus] = useState('loading')
  const [docs, setDocs] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    loadAllDocs()
      .then((map) => {
        if (!cancelled) {
          setDocs(map)
          setStatus('ready')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { status, docs, error }
}
