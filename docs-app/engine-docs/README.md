# Служебные заметки (`docs-app/engine-docs/`)

Внутренние how-to **про код и поведение движка** (не пользовательские статьи MedControl). На сайт и в поиск по статьям **не** попадают. **Не путать** с каталогом **`public/content/`** (submodule) и путями вида **`0_docs/…`**.

### Живой реестр поведения движка

- [**`IMPLEMENTATION-REGISTRY.md`**](IMPLEMENTATION-REGISTRY.md) — **сводная таблица**: что за что отвечает, какие инварианты не ломать. Обновляется **вместе с каждой существенной доработкой** `docs-app/` (в т.ч. после итераций по фидбеку). Точка входа для «как у нас сейчас сделано X».

| Файл | О чём |
|------|--------|
| [**`PDF-EXPORT.md`**](PDF-EXPORT.md) | **Регламент PDF:** Playwright vs html2pdf, DEV/prod, прокси, новости, сборка раздела, инварианты (не ломать). |
| [**`TABLES-DISPLAY.md`**](TABLES-DISPLAY.md) | **Таблицы в статьях:** markdown vs HTML, обёртка `MarkdownTable`, липкая шапка, `border-collapse`, горизонтальный скролл, чек-лист перед правками. |
| [**`SECTION_PDF_BUNDLE.md`**](SECTION_PDF_BUNDLE.md) | Пакетный PDF целого раздела с главного дашборда (иконка «Скачать в PDF» на карточке). |
| [**`OBSHEE-LANDING-SNAPSHOT.md`**](OBSHEE-LANDING-SNAPSHOT.md) | Архив: разводящая «Общее» — навигация, превью, PDF, чек-лист восстановления карточного UI. |

Подробнее о запуске и контенте — [**`../README.md`**](../README.md). PDF-сервер — [**`../pdf-server/README.md`**](../pdf-server/README.md).
