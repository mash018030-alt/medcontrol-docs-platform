export const DOCS_HEADING_LINK_COPIED = 'docs-heading-link-copied'

export function announceHeadingLinkCopied() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(DOCS_HEADING_LINK_COPIED))
}
