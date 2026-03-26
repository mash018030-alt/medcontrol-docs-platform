import { navTree, navSubtreeContains } from '../data/nav'

/** Верхнеуровневый узел раздела (например obshee/user-guide), в который входит slug. */
export function findTopSectionNodeForSlug(slug) {
  for (const top of navTree) {
    if (top.path === slug || navSubtreeContains(top, slug)) return top
  }
  return null
}

/**
 * Контролируемый «назад» без history.back(): дашборд или корень раздела.
 * @param {string} slug путь статьи/раздела без ведущего /
 * @returns {{ to: string, ariaLabel: string }}
 */
export function getDocsBackNav(slug) {
  const section = findTopSectionNodeForSlug(slug)
  if (!section) {
    return { to: '/', ariaLabel: 'На главную документации' }
  }
  if (slug === section.path) {
    return { to: '/', ariaLabel: 'На главную документации' }
  }
  return {
    to: `/${section.path}`,
    ariaLabel: `К разделу «${section.title}»`,
  }
}
