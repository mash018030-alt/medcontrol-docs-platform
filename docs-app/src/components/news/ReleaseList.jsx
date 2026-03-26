import ReleaseGridItem from './ReleaseGridItem'

/**
 * @param {{ items: Array<{ title: string, path: string, pdf?: string }> }} props
 */
export default function ReleaseList({ items }) {
  if (!items.length) return null

  return (
    <div className="docs-news-grid" role="list">
      {items.map((item) => (
        <div key={item.path} className="docs-news-grid__cell" role="listitem">
          <ReleaseGridItem title={item.title} path={item.path} pdf={item.pdf} />
        </div>
      ))}
    </div>
  )
}
