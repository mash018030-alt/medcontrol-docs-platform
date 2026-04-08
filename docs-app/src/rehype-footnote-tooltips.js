import { h } from 'hastscript'

/**
 * GFM-сноски [^n] → инлайн-тултипы (.docs-inline-tip), section.footnotes удаляется.
 * Подмена через span внутри того же <p>, без блочного div — иначе точка после [^n] уезжает в следующий абзац.
 */
function deepClone(node) {
  if (node == null || typeof node !== 'object') return null
  try {
    return JSON.parse(JSON.stringify(node))
  } catch {
    return null
  }
}

function stripFootnoteBackrefsFromNode(node) {
  if (!node || typeof node !== 'object') return
  if (!Array.isArray(node.children)) return
  node.children = node.children.filter((ch) => {
    if (!ch) return false
    if (ch.type === 'element' && ch.tagName === 'a') {
      const p = ch.properties || {}
      const cls = p.className
      const cl = Array.isArray(cls) ? cls.join(' ') : String(cls || '')
      if (cl.includes('data-footnote-backref') || p.dataFootnoteBackref != null) {
        return false
      }
    }
    stripFootnoteBackrefsFromNode(ch)
    return true
  })
}

function isFootnotesSection(node) {
  if (!node || node.type !== 'element' || node.tagName !== 'section') return false
  const cls = node.properties?.className
  const classes = Array.isArray(cls) ? cls : cls ? String(cls).split(/\s+/) : []
  if (classes.includes('footnotes')) return true
  if (node.properties && Object.prototype.hasOwnProperty.call(node.properties, 'dataFootnotes')) return true
  return false
}

function findFootnotesSection(root) {
  let found = null
  function walk(node, parent, index) {
    if (!node) return
    if (node.type === 'element' && isFootnotesSection(node)) {
      found = { section: node, parent, index }
      return
    }
    if (Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        walk(node.children[i], node, i)
        if (found) return
      }
    }
  }
  walk(root, null, -1)
  return found
}

function isFootnoteRefLink(a) {
  if (!a || a.type !== 'element' || a.tagName !== 'a') return false
  const href = a.properties?.href
  if (typeof href !== 'string' || !href.startsWith('#user-content-fn-')) return false
  const rid = a.properties?.id
  return typeof rid === 'string' && rid.startsWith('user-content-fnref-')
}

function isFootnoteSup(sup, map) {
  if (!sup || sup.type !== 'element' || sup.tagName !== 'sup') return false
  if (!Array.isArray(sup.children) || sup.children.length !== 1) return false
  const a = sup.children[0]
  if (!isFootnoteRefLink(a)) return false
  const id = String(a.properties.href).slice(1)
  const body = map.get(id)
  return Boolean(body?.length)
}

function hastPlainText(node) {
  if (!node) return ''
  if (node.type === 'text') return String(node.value || '')
  if (!Array.isArray(node.children)) return ''
  return node.children.map(hastPlainText).join('')
}

function footnoteListPlainText(listEl) {
  const lis = (listEl.children || []).filter((x) => x?.type === 'element' && x.tagName === 'li')
  const parts = lis.map((li) => hastPlainText(li).replace(/\s+/g, ' ').trim()).filter(Boolean)
  return parts.join(' · ')
}

/** Узел без видимого текста (только пробелы/переносы) — в block-контейнере даёт лишнюю строку и пустой низ панели */
function isWhitespaceOnlyTextNode(node) {
  return node?.type === 'text' && !/[^\s]/.test(String(node.value || ''))
}

function trimPhrasingTextEdges(nodes) {
  const out = [...nodes]
  while (out.length) {
    const f = out[0]
    if (f?.type === 'text' && !/[^\s]/.test(String(f.value || ''))) out.shift()
    else break
  }
  while (out.length) {
    const f = out[out.length - 1]
    if (f?.type === 'text' && !/[^\s]/.test(String(f.value || ''))) out.pop()
    else break
  }
  return out
}

function clonePhrasingChain(children) {
  const nodes = (children || [])
    .map((x) => {
      const c = deepClone(x)
      if (!c) return null
      if (c.type === 'element') stripFootnoteBackrefsFromNode(c)
      if (c.type === 'text' && isWhitespaceOnlyTextNode(c)) {
        c.value = ' '
      }
      return c
    })
    .filter(Boolean)
  return trimPhrasingTextEdges(nodes)
}

/** Тело сноски (дети li) → только phrasing для span-панели */
function footnoteBodyToPhrasing(inner) {
  const out = []
  for (const ch of inner) {
    if (!ch) continue
    if (ch.type === 'text') {
      if (isWhitespaceOnlyTextNode(ch)) continue
      const t = deepClone(ch)
      if (t) out.push(t)
      continue
    }
    if (ch.type !== 'element') continue
    if (ch.tagName === 'p') {
      out.push(h('span', { className: ['docs-inline-tip__fn-p'] }, clonePhrasingChain(ch.children)))
      continue
    }
    if (ch.tagName === 'ul' || ch.tagName === 'ol') {
      const text = footnoteListPlainText(ch)
      if (text)
        out.push(h('span', { className: ['docs-inline-tip__fn-p'] }, [{ type: 'text', value: text }]))
      continue
    }
    const c = deepClone(ch)
    if (c) {
      stripFootnoteBackrefsFromNode(c)
      out.push(c)
    }
  }
  return out
}

function makeFootnoteReplacement(sup, map) {
  const a = sup.children[0]
  const id = String(a.properties.href).slice(1)
  const body = map.get(id) || []
  const termChildren = deepClone(a.children) || []
  const panelChildren = footnoteBodyToPhrasing(body)
  if (!panelChildren.length || !termChildren.length) return null
  const tip = h(
    'span',
    {
      className: ['docs-inline-tip__panel', 'docs-inline-tip__panel--footnote'],
      role: 'tooltip',
    },
    panelChildren,
  )
  return h(
    'span',
    { className: ['docs-inline-tip', 'docs-inline-tip--footnote'], tabIndex: 0 },
    [h('span', { className: ['docs-inline-tip__term'] }, termChildren), tip],
  )
}

function replaceFootnoteSupsDepthFirst(node, map) {
  if (!node || !Array.isArray(node.children)) return
  for (const child of node.children) {
    replaceFootnoteSupsDepthFirst(child, map)
  }
  const ch = node.children
  for (let i = 0; i < ch.length; i++) {
    if (isFootnoteSup(ch[i], map)) {
      const r = makeFootnoteReplacement(ch[i], map)
      if (r) ch[i] = r
    }
  }
}

export function rehypeFootnoteTooltips() {
  return (tree) => {
    const loc = findFootnotesSection(tree)
    if (!loc || !loc.parent || loc.index < 0) return tree

    const { section, parent, index: sectionIndex } = loc
    const map = new Map()
    const ol = section.children?.find((c) => c?.type === 'element' && c.tagName === 'ol')
    if (ol && Array.isArray(ol.children)) {
      for (const li of ol.children) {
        if (!li || li.type !== 'element' || li.tagName !== 'li') continue
        const id = li.properties?.id
        if (typeof id !== 'string' || !id.startsWith('user-content-fn-')) continue
        const cloned = deepClone(li)
        if (!cloned || !Array.isArray(cloned.children)) continue
        stripFootnoteBackrefsFromNode(cloned)
        const inner = cloned.children.filter(Boolean)
        if (inner.length) map.set(id, inner)
      }
    }

    parent.children.splice(sectionIndex, 1)

    replaceFootnoteSupsDepthFirst(tree, map)

    return tree
  }
}
