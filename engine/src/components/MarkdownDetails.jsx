import React from 'react'

/** rehype-raw + react-markdown не всегда прокидывают class с HTML — стиль платформы только с .docs-disclosure */
export default function MarkdownDetails({ className, children, node: _node, ...rest } = {}) {
  const cn = ['docs-disclosure', className].filter(Boolean).join(' ')
  return (
    <details {...rest} className={cn}>
      {children}
    </details>
  )
}
