import React from 'react'

/** Текстовое содержимое ячейки (hast). */
function hastTextContent(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value
  if (node.type === 'element' && node.children?.length) {
    return node.children.map(hastTextContent).join('')
  }
  return ''
}

/**
 * Строка-рубрика в FAQ-таблице: | **Тема** | |
 * Объединяем ячейки и выравниваем заголовок по центру.
 */
function isTopicSectionRow(node) {
  if (!node?.children || node.children.length !== 2) return false
  const [a, b] = node.children
  if (a.tagName !== 'td' || b.tagName !== 'td') return false
  if (hastTextContent(b).trim() !== '') return false
  const t1 = hastTextContent(a).trim()
  if (!t1) return false

  const inner = a.children
  if (!inner?.length) return false

  const allText = hastTextContent(a).trim()
  const onlyStrong =
    inner.length === 1 &&
    inner[0].tagName === 'strong' &&
    hastTextContent(inner[0]).trim() === allText
  const paragraphStrong =
    inner.length === 1 &&
    inner[0].tagName === 'p' &&
    inner[0].children?.length === 1 &&
    inner[0].children[0].tagName === 'strong' &&
    hastTextContent(inner[0].children[0]).trim() === allText

  return onlyStrong || paragraphStrong
}

/**
 * @param {import('react-markdown').Components['tr']} props
 */
export default function MarkdownTr({ node, children, ...rest }) {
  if (node && isTopicSectionRow(node)) {
    const cells = React.Children.toArray(children)
    const firstTd = cells[0]
    if (cells.length === 2 && React.isValidElement(firstTd)) {
      const cls = [firstTd.props.className, 'docs-table-topic-cell'].filter(Boolean).join(' ')
      return (
        <tr {...rest}>
          {React.cloneElement(firstTd, { colSpan: 2, className: cls })}
        </tr>
      )
    }
  }
  return <tr {...rest}>{children}</tr>
}
