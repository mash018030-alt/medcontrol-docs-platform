import MarkdownInlineTip from './MarkdownInlineTip'

function stringifyClass(className) {
  if (className == null) return ''
  if (Array.isArray(className)) return className.filter(Boolean).join(' ')
  return String(className)
}

/**
 * Обёртка для span из react-markdown: интерактивные подсказки [[a|b]] → .docs-inline-tip
 */
export default function MarkdownSpan(props = {}) {
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
    <span className={className} {...rest}>
      {children}
    </span>
  )
}
