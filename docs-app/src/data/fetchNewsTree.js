/** Загрузка дерева новостей из public/content/1_news/news-tree.json */

/** Главная страница раздела новостей / релизов (хаб со списком). */
export const NEWS_ROOT_SLUG = 'news'

export async function fetchNewsTree() {
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  const path = `${base}/content/1_news/news-tree.json`.replace(/^\/+/, '/')
  const url = new URL(path, window.location.origin).href
  const r = await fetch(url)
  if (!r.ok) throw new Error('Не удалось загрузить структуру новостей')
  const data = await r.json()
  const tree = Array.isArray(data.tree) ? data.tree : []
  return tree
}

/**
 * Категории для хаба релизов: либо верхний уровень (MC Cloud, MC Mobile, …),
 * либо дети единственной ветки «Релизы».
 */
export function releaseSectionCategories(tree) {
  const branches = tree.filter((n) => n?.children?.length)
  if (branches.length === 1) {
    const nested = branches[0].children.filter((n) => n?.children?.length)
    if (nested.length > 0) return nested
  }
  return branches
}

/** Плоский список конечных статей (для «предыдущая / следующая») */
export function flattenNewsLeaves(tree) {
  const out = []
  function walk(nodes) {
    for (const n of nodes) {
      if (n.children?.length) walk(n.children)
      else if (n.path) out.push(n)
    }
  }
  walk(tree)
  return out
}

export function getExpandedNewsKeys(tree, slug) {
  const keys = new Set()
  function walk(nodes) {
    for (const node of nodes) {
      if (node.path === slug) {
        if (node.children?.length) keys.add(node.path)
        return true
      }
      if (node.children?.length) {
        if (walk(node.children)) {
          keys.add(node.path)
          return true
        }
      }
    }
    return false
  }
  for (const top of tree) {
    if (top.path === slug) {
      if (top.children?.length) keys.add(top.path)
      return keys
    }
    if (top.children?.length && walk(top.children)) {
      keys.add(top.path)
    }
  }
  return keys
}

export function newsSubtreeContains(item, slug) {
  if (item.path === slug) return true
  if (!item.children?.length) return false
  return item.children.some((c) => newsSubtreeContains(c, slug))
}

export function findNewsNode(tree, slug) {
  function walk(nodes) {
    for (const n of nodes) {
      if (n.path === slug) return n
      if (n.children?.length) {
        const f = walk(n.children)
        if (f) return f
      }
    }
    return null
  }
  return walk(tree)
}
