import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

function stringifyClass(className) {
  if (className == null) return ''
  if (Array.isArray(className)) return className.filter(Boolean).join(' ')
  return String(className)
}

function subscribeHoverNone(callback) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(hover: none)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getHoverNoneSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
}

function getHoverNoneServerSnapshot() {
  return false
}

const COLUMN_PAD_PX = 14
const VIEW_EDGE_PX = 10
const TERM_GAP_PX = 10
const FLOAT_Z = 75

function isPdfOrExportLayout(el) {
  return Boolean(el?.closest?.('.docs-layout--mc-pdf') || el?.closest?.('.docs-pdf-export'))
}

function computeFootnoteFloatStyle(rootEl) {
  if (typeof window === 'undefined' || !rootEl) return null
  if (isPdfOrExportLayout(rootEl)) return null

  const column = rootEl.closest('.docs-article-body')
  const term = rootEl.querySelector('.docs-inline-tip__term')
  if (!column || !term) return null

  const col = column.getBoundingClientRect()
  const tr = term.getBoundingClientRect()

  let left = col.left + COLUMN_PAD_PX
  let width = col.width - 2 * COLUMN_PAD_PX
  const vw = window.innerWidth
  const vh = window.innerHeight

  width = Math.max(280, Math.min(width, vw - 2 * VIEW_EDGE_PX))
  if (left + width > vw - VIEW_EDGE_PX) {
    left = vw - VIEW_EDGE_PX - width
  }
  if (left < VIEW_EDGE_PX) {
    left = VIEW_EDGE_PX
    width = Math.min(width, vw - 2 * VIEW_EDGE_PX)
  }

  const gap = TERM_GAP_PX
  const spaceBelow = vh - tr.bottom - gap - VIEW_EDGE_PX
  const spaceAbove = tr.top - gap - VIEW_EDGE_PX
  const maxDefault = Math.min(440, Math.floor(vh * 0.48))

  let placeBelow = spaceBelow >= 120 || spaceBelow >= spaceAbove
  if (spaceBelow < 88 && spaceAbove > spaceBelow) placeBelow = false

  /** Потолок по вертикали; фактическая высота панели = по контенту до этого предела (CSS height: auto). */
  const capBelow = Math.min(maxDefault, Math.max(64, vh - (tr.bottom + gap) - VIEW_EDGE_PX))
  const anchorAboveY = tr.top - gap
  const capAbove = Math.min(maxDefault, Math.max(64, anchorAboveY - VIEW_EDGE_PX))

  let topPx
  let maxHeightPx
  let transform

  if (placeBelow) {
    topPx = tr.bottom + gap
    maxHeightPx = capBelow
    transform = 'none'
  } else {
    /* Низ панели у якоря: top = линия якоря, translateY(-100%) поднимает блок на свою высоту */
    topPx = anchorAboveY
    maxHeightPx = capAbove
    transform = 'translateY(-100%)'
  }

  return {
    position: 'fixed',
    left: `${Math.round(left)}px`,
    top: `${Math.round(topPx)}px`,
    transform,
    width: `${Math.round(width)}px`,
    maxHeight: `${Math.round(maxHeightPx)}px`,
    zIndex: FLOAT_Z,
    boxSizing: 'border-box',
  }
}

/**
 * [[термин|подсказка]] и GFM-сноски: hover/focus (desktop), тап (hover:none), Escape.
 * Панель сноски — fixed, ширина по колонке .docs-article-body.
 */
export default function MarkdownInlineTip({ className, children, tabIndex, ...rest }) {
  const rootRef = useRef(null)
  const leaveTimerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [focused, setFocused] = useState(false)
  const [floatStyle, setFloatStyle] = useState(null)

  const tapMode = useSyncExternalStore(
    subscribeHoverNone,
    getHoverNoneSnapshot,
    getHoverNoneServerSnapshot,
  )

  const baseCn = stringifyClass(className)
  const isFootnote = baseCn.split(/\s+/).includes('docs-inline-tip--footnote')

  const footnoteVisible = isFootnote && (hovering || pinned || focused || (tapMode && open))
  const simpleTapOpen = !isFootnote && tapMode && open
  const openClass = footnoteVisible || simpleTapOpen ? 'docs-inline-tip--open' : ''

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  const onMouseEnter = useCallback(() => {
    if (!isFootnote || tapMode) return
    clearLeaveTimer()
    setHovering(true)
  }, [isFootnote, tapMode, clearLeaveTimer])

  const onMouseLeave = useCallback(() => {
    if (!isFootnote || tapMode) return
    clearLeaveTimer()
    leaveTimerRef.current = window.setTimeout(() => {
      setHovering(false)
      leaveTimerRef.current = null
    }, 120)
  }, [isFootnote, tapMode, clearLeaveTimer])

  const onFocus = useCallback(() => {
    if (isFootnote) setFocused(true)
  }, [isFootnote])

  const onBlur = useCallback((e) => {
    if (!isFootnote) return
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setFocused(false)
    }
  }, [isFootnote])

  const onRootPointerDown = useCallback(
    (e) => {
      if (!tapMode) return
      const term = e.target.closest?.('.docs-inline-tip__term')
      if (!term || !rootRef.current?.contains(term)) return
      e.stopPropagation()
      setOpen((v) => !v)
    },
    [tapMode],
  )

  const onClickCapture = useCallback(
    (e) => {
      if (!isFootnote || tapMode) return
      const term = e.target.closest?.('.docs-inline-tip__term')
      if (!term || !rootRef.current?.contains(term)) return
      e.stopPropagation()
      setPinned((p) => !p)
    },
    [isFootnote, tapMode],
  )

  useLayoutEffect(() => {
    if (!isFootnote || !footnoteVisible) return
    const root = rootRef.current
    if (!root) return
    let cancelled = false
    const run = () => {
      if (cancelled) return
      const next = computeFootnoteFloatStyle(root)
      setFloatStyle(next)
    }
    const id = requestAnimationFrame(run)
    window.addEventListener('resize', run)
    window.addEventListener('scroll', run, true)
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
      window.removeEventListener('resize', run)
      window.removeEventListener('scroll', run, true)
    }
  }, [isFootnote, footnoteVisible, children])

  useEffect(() => {
    if (!isFootnote || footnoteVisible) return
    const id = requestAnimationFrame(() => setFloatStyle(null))
    return () => cancelAnimationFrame(id)
  }, [isFootnote, footnoteVisible])

  useEffect(() => {
    if (!open || !tapMode) return
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close, true)
    return () => document.removeEventListener('pointerdown', close, true)
  }, [open, tapMode])

  useEffect(() => {
    if (!isFootnote || !pinned || tapMode) return
    const close = (e) => {
      if (rootRef.current?.contains(e.target)) return
      setPinned(false)
    }
    document.addEventListener('pointerdown', close, true)
    return () => document.removeEventListener('pointerdown', close, true)
  }, [isFootnote, pinned, tapMode])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (!rootRef.current?.contains(document.activeElement)) return
      setOpen(false)
      setPinned(false)
      rootRef.current?.blur()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const ti = tabIndex === undefined || tabIndex === null ? 0 : tabIndex

  const footnotePanelFloat = isFootnote && footnoteVisible && floatStyle ? floatStyle : null

  const renderedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const cn = stringifyClass(child.props.className)
    if (isFootnote && cn.includes('docs-inline-tip__panel--footnote')) {
      const nextClass = [child.props.className, footnotePanelFloat ? 'docs-inline-tip__panel--footnote-float' : '']
        .filter(Boolean)
        .join(' ')
      return cloneElement(child, {
        className: nextClass,
        style: footnotePanelFloat ? { ...child.props.style, ...footnotePanelFloat } : child.props.style,
      })
    }
    return child
  })

  return (
    <span
      ref={rootRef}
      className={[baseCn, openClass].filter(Boolean).join(' ')}
      tabIndex={ti}
      onPointerDown={onRootPointerDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClickCapture={onClickCapture}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false)
          setPinned(false)
          e.currentTarget.blur()
        }
      }}
      {...rest}
    >
      {renderedChildren}
    </span>
  )
}
