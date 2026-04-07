import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadAllDocs } from '../search/docSearch'

const DocSearchIndexContext = createContext(null)

export function DocSearchIndexProvider({ children }) {
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

  const value = useMemo(() => ({ status, docs, error }), [status, docs, error])
  return <DocSearchIndexContext.Provider value={value}>{children}</DocSearchIndexContext.Provider>
}

export function useDocSearchIndex() {
  const ctx = useContext(DocSearchIndexContext)
  if (!ctx) {
    throw new Error('useDocSearchIndex must be used within DocSearchIndexProvider')
  }
  return ctx
}
