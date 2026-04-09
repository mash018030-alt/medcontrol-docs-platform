import { findAndReplace } from 'hast-util-find-and-replace'
import { h } from 'hastscript'

/**
 * В тексте статей: [[видимый термин|краткая подсказка]]
 * Не срабатывает в code/pre и др. (см. ignore).
 */
const TIP_PATTERN = /\[\[([^\]|]+?)\|([^\]]+?)\]\]/g

const IGNORE_TAGS = ['code', 'pre', 'kbd', 'samp', 'script', 'style', 'textarea', 'title']

export function rehypeInlineTooltip() {
  return (tree) => {
    findAndReplace(
      tree,
      [
        [
          TIP_PATTERN,
          (_full, label, tip) => {
            const l = String(label).trim()
            const t = String(tip).trim()
            if (!l || !t) return false
            return h('span', { className: ['docs-inline-tip'], tabIndex: 0 }, [
              h('span', { className: ['docs-inline-tip__term'] }, [l]),
              h('span', { className: ['docs-inline-tip__panel'], role: 'tooltip' }, [t]),
            ])
          },
        ],
      ],
      { ignore: IGNORE_TAGS },
    )
  }
}
