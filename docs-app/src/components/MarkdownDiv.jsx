import MarkdownInlineTip from './MarkdownInlineTip'

function stringifyClass(className) {
  if (className == null) return ''
  if (Array.isArray(className)) return className.filter(Boolean).join(' ')
  return String(className)
}

/**
 * Сырой HTML: div с .docs-inline-tip (редко). GFM-сноски после rehype-footnote-tooltips — span, через MarkdownSpan.
 */
export default function MarkdownDiv(props = {}) {
  const { className, children, node: _node, ...rest } = props
  const cn = stringifyClass(className)
  if (cn.split(/\s+/).filter(Boolean).includes('docs-inline-tip')) {
    return (
      <MarkdownInlineTip className={className} {...rest}>
        {children}
      </MarkdownInlineTip>
    )
  }
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  )
}
