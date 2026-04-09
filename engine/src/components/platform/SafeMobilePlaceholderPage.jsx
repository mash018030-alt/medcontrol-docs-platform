import { Link } from 'react-router-dom'

/** Заглушка продукта Safe Mobile (контент подключат отдельно). */
export default function SafeMobilePlaceholderPage() {
  return (
    <div className="docs-platform-home docs-safe-mobile-placeholder">
      <div className="docs-platform-home__inner">
        <p className="docs-platform-home__eyebrow">Продукт</p>
        <h1 className="docs-platform-home__title">Safe Mobile</h1>
        <p className="docs-platform-home__lead">
          Раздел документации для этого продукта будет подключён к платформе отдельно. Сейчас здесь заглушка —
          переключатель в шапке показывает нейтральное оформление вкладок.
        </p>
        <div className="docs-platform-home__cta">
          <Link to="/" className="docs-platform-home__cta-primary">
            К главной платформы
          </Link>
        </div>
      </div>
    </div>
  )
}
