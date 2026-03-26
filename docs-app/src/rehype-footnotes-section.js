/**
 * Заглушка: блок сносок остаётся в конце документа (после основного текста), под разделительной линией из CSS.
 * Ранее плагин переносил section.footnotes перед первым h3 — это отключено.
 */
export function rehypeFootnotesSection() {
  return (tree) => tree
}
