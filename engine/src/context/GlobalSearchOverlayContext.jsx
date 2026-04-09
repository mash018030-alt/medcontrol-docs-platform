import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import GlobalSearchDialog from '../components/search/GlobalSearchDialog'

const GlobalSearchOverlayContext = createContext(null)

export function GlobalSearchOverlayProvider({ children }) {
  const [open, setOpen] = useState(false)
  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])
  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  )
  return (
    <GlobalSearchOverlayContext.Provider value={value}>
      {children}
      <GlobalSearchDialog open={open} onClose={closeSearch} />
    </GlobalSearchOverlayContext.Provider>
  )
}

export function useGlobalSearchOverlay() {
  const ctx = useContext(GlobalSearchOverlayContext)
  if (!ctx) {
    throw new Error('useGlobalSearchOverlay must be used within GlobalSearchOverlayProvider')
  }
  return ctx
}
