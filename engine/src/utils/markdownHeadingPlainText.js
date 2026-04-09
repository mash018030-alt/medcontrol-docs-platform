import React from 'react'

/** Плоский текст заголовка для id (String(children) → «[object Object]» при разметке внутри ##). */
export function markdownHeadingPlainText(children) {
  if (children == null || children === false) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(markdownHeadingPlainText).join('')
  if (React.isValidElement(children)) return markdownHeadingPlainText(children.props?.children)
  return ''
}
