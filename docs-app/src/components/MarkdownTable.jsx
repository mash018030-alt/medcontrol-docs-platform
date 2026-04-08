import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Обёртка таблицы из markdown: при переполнении по ширине — прокрутка влево/вправо
 * и горизонтальный скроллбар снизу (см. `.docs-table-scroll` в App.css).
 * Если таблица помещается по ширине, добавляется `docs-table-scroll--no-h-scroll`, чтобы
 * у обёртки не было горизонтального scrollport — иначе ломается `position: sticky` у шапки
 * при прокрутке страницы.
 */
export default function MarkdownTable({ children, node: _mdNode, ...props } = {}) {
  const wrapRef = useRef(null)
  const [noHScroll, setNoHScroll] = useState(false)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const table = wrap.querySelector('table')
    if (!table) return

    const measure = () => {
      const w = wrap.clientWidth
      if (w < 48) return
      setNoHScroll(table.scrollWidth <= w + 2)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(table)
    return () => ro.disconnect()
  }, [children])

  const className = ['docs-table-scroll', noHScroll ? 'docs-table-scroll--no-h-scroll' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={wrapRef}
      className={className}
      tabIndex={noHScroll ? undefined : 0}
      role="region"
      aria-label={noHScroll ? 'Таблица' : 'Таблица, прокрутка по горизонтали'}
    >
      <table {...props}>{children}</table>
    </div>
  )
}
