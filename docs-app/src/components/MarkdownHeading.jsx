import React from 'react'
import { announceHeadingLinkCopied } from '../utils/headingCopyFeedback'

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

/**
 * @param {{
 *   level: 1|2|3|4|5|6
 *   id: string
 *   isMcPdf: boolean
 *   children: React.ReactNode
 * }} props
 */
export default function MarkdownHeading({ level, id, isMcPdf, children, className, ...rest }) {
  const Tag = `h${level}`

  if (isMcPdf) {
    return (
      <Tag id={id} className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const mergedClass = ['docs-markdown-heading', className].filter(Boolean).join(' ')

  const handleAnchorClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`
    const ok = await copyTextToClipboard(url)
    if (ok) announceHeadingLinkCopied()
  }

  return (
    <Tag id={id} className={mergedClass} {...rest}>
      <a
        href={`#${id}`}
        className="docs-markdown-heading__anchor"
        onClick={handleAnchorClick}
        aria-label="Скопировать ссылку на раздел"
        title="Скопировать ссылку на раздел"
      >
        #
      </a>
      {children}
    </Tag>
  )
}
