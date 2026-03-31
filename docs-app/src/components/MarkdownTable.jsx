/**
 * Обёртка таблицы из markdown: при переполнении по ширине — прокрутка влево/вправо
 * и горизонтальный скроллбар снизу (см. `.docs-table-scroll` в App.css).
 */
export default function MarkdownTable({ children, node: _mdNode, ...props }) {
  return (
    <div
      className="docs-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Таблица, прокрутка по горизонтали"
    >
      <table {...props}>{children}</table>
    </div>
  )
}
