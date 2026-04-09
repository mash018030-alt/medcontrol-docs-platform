import ReleaseGridItem from './ReleaseGridItem'

/**
 * @param {{
 *   items: Array<{ title: string, path: string }>,
 *   onReleasePdf?: (articlePath: string, title: string) => void,
 *   releasePdfBusy?: boolean,
 * }} props
 */
export default function ReleaseList({ items, onReleasePdf, releasePdfBusy = false }) {
  if (!items.length) return null

  return (
    <div className="docs-news-grid" role="list">
      {items.map((item) => (
        <div key={item.path} className="docs-news-grid__cell" role="listitem">
          <ReleaseGridItem
            title={item.title}
            path={item.path}
            onReleasePdf={onReleasePdf}
            releasePdfBusy={releasePdfBusy}
          />
        </div>
      ))}
    </div>
  )
}
