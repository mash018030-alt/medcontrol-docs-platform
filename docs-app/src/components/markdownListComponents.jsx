function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/** Явные классы — стили списков в App.css; `node` не пробрасываем в DOM */
export function MarkdownOl({ className, node, ...props } = {}) {
  return <ol {...props} className={cx('docs-md-ol', className)} />
}

export function MarkdownUl({ className, node, ...props } = {}) {
  return <ul {...props} className={cx('docs-md-ul', className)} />
}
