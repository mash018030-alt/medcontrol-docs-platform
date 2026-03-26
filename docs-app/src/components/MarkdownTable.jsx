/** Обёртка таблицы из markdown: горизонтальная прокрутка на узких экранах. */
export default function MarkdownTable({ children, ...props }) {
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
