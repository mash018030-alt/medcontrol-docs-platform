export default function Toc({ headings }) {
  if (!headings?.length) return null

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">В этой статье</div>
      <ul className="docs-toc-list">
        {headings.map((h, idx) => (
          <li
            key={`${h.id}-${idx}`}
            className={`docs-toc-item docs-toc-h${h.level}`}
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
