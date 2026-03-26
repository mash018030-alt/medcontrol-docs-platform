/**
 * Обёртка раскрывающегося блока (single-open управляется родителем).
 * @param {{ expanded: boolean, children: import('react').ReactNode }} props
 */
export default function Accordion({ expanded, children }) {
  return (
    <div className={`docs-search-accordion${expanded ? ' docs-search-accordion--expanded' : ''}`}>
      {children}
    </div>
  )
}
