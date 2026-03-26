import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMediaQuery } from '../hooks/useMediaQuery'

const DOCS_MOBILE_NAV_MQ = '(max-width: 1023px)'

const DocsLayoutContext = createContext(null)

export function DocsLayoutProvider({ children }) {
  const location = useLocation()
  const isMobileLayout = useMediaQuery(DOCS_MOBILE_NAV_MQ)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const toggleMobileNav = useCallback(() => setMobileNavOpen((v) => !v), [])

  useEffect(() => {
    closeMobileNav()
  }, [location.pathname, location.search, location.hash, closeMobileNav])

  useEffect(() => {
    if (!isMobileLayout) closeMobileNav()
  }, [isMobileLayout, closeMobileNav])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileNavOpen, closeMobileNav])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  const value = useMemo(
    () => ({
      isMobileLayout,
      mobileNavOpen,
      setMobileNavOpen,
      closeMobileNav,
      toggleMobileNav,
    }),
    [isMobileLayout, mobileNavOpen, closeMobileNav, toggleMobileNav],
  )

  return <DocsLayoutContext.Provider value={value}>{children}</DocsLayoutContext.Provider>
}

export function useDocsLayout() {
  const ctx = useContext(DocsLayoutContext)
  if (!ctx) {
    throw new Error('useDocsLayout must be used within DocsLayoutProvider')
  }
  return ctx
}

export { DOCS_MOBILE_NAV_MQ }
