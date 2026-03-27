import { useLayoutEffect, useState } from 'react'

/** Текст пункта TOC без символа «#» из ссылки-копирования (.docs-markdown-heading__anchor). */
function tocHeadingVisibleText(el) {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('.docs-markdown-heading__anchor').forEach((n) => n.remove())
  return (clone.textContent || '').replace(/\s+/g, ' ').trim()
}

/**
 * Оглавление справа: заголовки из DOM после ReactMarkdown (широкие таблицы/HTML не ломают парсер строк).
 */
export function useArticleTocHeadings(rootRef, enabled, syncKey) {
  const [headings, setHeadings] = useState([])

  useLayoutEffect(() => {
    /* setState после отрисовки markdown — стандартный паттерн «прочитать DOM» */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!enabled) {
      setHeadings([])
      return
    }
    const root = rootRef.current
    if (!root) {
      setHeadings([])
      return
    }
    const nodes = root.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    setHeadings(
      Array.from(nodes)
        .filter((el) => !el.closest('section.footnotes') && !el.closest('.docs-manual-footnotes'))
        .map((el) => ({
          level: Number(el.tagName.charAt(1)),
          text: tocHeadingVisibleText(el),
          id: el.id,
        }))
    )
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [enabled, rootRef, syncKey])

  return headings
}
