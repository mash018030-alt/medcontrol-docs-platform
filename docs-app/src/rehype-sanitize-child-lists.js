/**
 * Удаляет null/undefined из `children` у узлов HAST.
 * Иначе в unist-util-visit-parents при обходе попадает `factory(undefined)` и падает:
 * «Cannot use 'in' operator to search for 'children' in undefined».
 */
function stripInvalidChildren(node) {
  if (!node || typeof node !== 'object') return
  const ch = node.children
  if (Array.isArray(ch)) {
    node.children = ch.filter((c) => c != null && typeof c === 'object')
    for (const c of node.children) stripInvalidChildren(c)
  }
}

export function rehypeSanitizeChildLists() {
  return (tree) => {
    stripInvalidChildren(tree)
    return tree
  }
}
