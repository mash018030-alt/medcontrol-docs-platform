/**
 * В React у <input type="radio" checked> из rehype-raw часто получается «контролируемый»
 * инпут без onChange — после гидрации checked сбрасывается, CSS-карусель (.docs-carousel) ломается.
 * defaultChecked даёт корректное начальное состояние для нативной группы радиокнопок.
 */
function walk(node, fn) {
  fn(node)
  const ch = node.children
  if (Array.isArray(ch)) {
    for (const c of ch) walk(c, fn)
  }
}

function radioHasCheckedAttr(properties) {
  const p = properties || {}
  if (p.checked === true) return true
  if (p.checked === '') return true
  if (typeof p.checked === 'string' && p.checked.toLowerCase() === 'checked') return true
  return false
}

export function rehypeRadioDefaultChecked() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'input') return
      const p = node.properties || (node.properties = {})
      if (String(p.type || '').toLowerCase() !== 'radio') return
      if (!radioHasCheckedAttr(p)) return
      p.defaultChecked = true
      delete p.checked
    })
    return tree
  }
}
