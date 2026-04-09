import { BookOpen, Layers } from 'lucide-react'

export default function PlatformHomePage() {
  return (
    <div className="docs-platform-home">
      <div className="docs-platform-home__inner">
        <p className="docs-platform-home__eyebrow">Платформа</p>
        <h1 className="docs-platform-home__title">Документация для продуктов</h1>
        <p className="docs-platform-home__lead">
          Этот сайт собран на универсальном движке: один интерфейс для справки, новостей релизов и поиска. Переход к
          продуктам — через переключатель в шапке; при подключении контента появятся отдельные разделы.
        </p>
        <ul className="docs-platform-home__features">
          <li>
            <Layers className="docs-platform-home__feature-icon" aria-hidden />
            <span>Нейтральная тема на этой странице; цвета продукта — в разделе документации.</span>
          </li>
          <li>
            <BookOpen className="docs-platform-home__feature-icon" aria-hidden />
            <span>Статьи, оглавление, версии и PDF — общие механики платформы.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
