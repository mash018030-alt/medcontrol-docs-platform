import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import {
  DOCS_DOCUMENTATION_VERSIONS,
  LATEST_DOCS_VERSION_ID,
  resolveDocsVersionIdFromSearch,
  getDocsVersionMeta,
  formatDocsVersionDateRu,
} from '../data/docsDocumentationVersions'
import { docsLocationSearchForVersion } from '../utils/docsVersionNav'

function menuPositionStyle(triggerEl) {
  if (!triggerEl || typeof window === 'undefined') return null
  const r = triggerEl.getBoundingClientRect()
  const gutter = 8
  return {
    position: 'fixed',
    top: r.bottom + 6,
    right: Math.max(gutter, window.innerWidth - r.right),
    minWidth: Math.max(r.width, 184),
    maxWidth: 'min(20rem, calc(100vw - 1rem))',
    zIndex: 55,
  }
}

export default function DocsVersionSwitcher({ className = '' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMcPdf = searchParams.get('mc_pdf') === '1'
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState(null)
  const menuListId = useId()

  const currentId = resolveDocsVersionIdFromSearch(location.search)
  const currentMeta = getDocsVersionMeta(currentId)

  const close = () => setOpen(false)
  const toggle = () => setOpen((v) => !v)

  /* Позиция выпадающего списка: измерение DOM после открытия (портал в body). */
  /* eslint-disable react-hooks/set-state-in-effect -- синхронизация координат с кнопкой */
  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null)
      return
    }
    const el = triggerRef.current
    setMenuStyle(menuPositionStyle(el))
  }, [open, currentId])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return undefined
    const reposition = () => {
      setMenuStyle(menuPositionStyle(triggerRef.current))
    }
    window.addEventListener('resize', reposition)
    return () => window.removeEventListener('resize', reposition)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onScrollClose = () => {
      close()
    }
    window.addEventListener('scroll', onScrollClose, true)
    return () => window.removeEventListener('scroll', onScrollClose, true)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDownCapture = (e) => {
      const t = triggerRef.current
      const m = menuRef.current
      if (t?.contains(e.target)) return
      if (m?.contains(e.target)) return
      close()
    }
    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (isMcPdf) return null

  const triggerLabel = `v${currentMeta?.label ?? currentId}`

  const pickVersion = (id) => {
    const q = docsLocationSearchForVersion(location.search, id)
    navigate(`${location.pathname}${q}${location.hash || ''}`)
    close()
  }

  const menuNode =
    open && menuStyle && typeof document !== 'undefined'
      ? createPortal(
          <ul
            ref={menuRef}
            id={menuListId}
            className="docs-version-switcher__menu"
            role="listbox"
            aria-label="Версии документации"
            style={menuStyle}
          >
            {DOCS_DOCUMENTATION_VERSIONS.map((v) => {
              const selected = v.id === currentId
              const dateLine = formatDocsVersionDateRu(v.releaseDateISO)
              const isLatest = v.id === LATEST_DOCS_VERSION_ID
              return (
                <li key={v.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`docs-version-switcher__option${selected ? ' docs-version-switcher__option--active' : ''}`}
                    onClick={() => pickVersion(v.id)}
                  >
                    <span className="docs-version-switcher__option-text">
                      <span className="docs-version-switcher__option-title">
                        v{v.label}
                        {isLatest ? ' (текущая)' : ''}
                      </span>
                      <span className="docs-version-switcher__option-date">{dateLine}</span>
                    </span>
                    {selected ? <Check className="docs-version-switcher__check" size={18} strokeWidth={2} aria-hidden /> : null}
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body,
        )
      : null

  return (
    <div className={`docs-version-switcher${className ? ` ${className}` : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="docs-version-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuListId : undefined}
        aria-label={`Версия документации: ${triggerLabel}. Открыть список`}
        onClick={toggle}
      >
        <span className="docs-version-switcher__dot" aria-hidden />
        <span className="docs-version-switcher__label">{triggerLabel}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`docs-version-switcher__chevron${open ? ' docs-version-switcher__chevron--open' : ''}`}
          aria-hidden
        />
      </button>
      {menuNode}
    </div>
  )
}
