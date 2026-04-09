import { findAndReplace } from 'hast-util-find-and-replace'
import { h } from 'hastscript'

const pairs = [
  ['зелёный', (value) => h('span', { className: 'docs-good', class: 'docs-good' }, value)],
  ['жёлтый', (value) => h('span', { className: 'docs-normal', class: 'docs-normal' }, value)],
  ['красный', (value) => h('span', { className: 'docs-bad', class: 'docs-bad' }, value)],
]

/** Rehype plugin: подсвечивает слова зелёный/жёлтый/красный в тексте (span с классами цветов). */
export function rehypeColorWords() {
  return (tree) => {
    findAndReplace(tree, pairs)
  }
}
