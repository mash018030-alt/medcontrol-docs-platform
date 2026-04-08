# Реестр реализации движка (живой документ)

**Назначение:** кратко фиксировать *как сейчас устроены* нетривиальные части `docs-app`, чтобы при следующих правках не «ломать неочевидное». Документ **обновляется вместе с кодом** (в т.ч. после вашего ОС на правки).

**Связанные регламенты** (углубленно): см. таблицу в [`README.md`](README.md).

| Область | Ключевые файлы / пути | Инварианты (не ломать без осознанного ТЗ) | Обновлено |
|--------|------------------------|--------------------------------------------|-----------|
| **Версии документации (переключатель, query, архив .md)** | `src/components/DocsVersionSwitcher.jsx`, `src/styles/docsVersionSwitcher.css`, `src/data/docsDocumentationVersions.js`, `src/utils/docsVersionNav.js`, `src/data/docsArticleVersioning.js`, `src/components/Article.jsx` | Query-параметр из `DOCS_VERSION_QUERY_KEY` (`docVer`); неактуальная редакция → `fetch` текста из `buildArticleMarkdownUrl` (**не** из `public/content/`). Внутренние ссылки при архиве дополняются через `appendDocVerToInternalHref`. **Архив:** только пути из allowlist в `docsArticleVersioning.js`. | 2026-04-08 |
| **Каталог архивных снимков (файлы на диске)** | `public/previous_versions/{cloud\|mobile}/<versionId>/0_docs/…/articles/*.md` и `…/images/<slug статьи>/` (опционально `…/sources/<slug>/` для pdf/zip); актуальный контент — сабмодуль `public/content/` | URL в коде: `PREVIOUS_VERSIONS_PRODUCT` + `buildArticleMarkdownUrl` → сегмент **`cloud`** (или позже **mobile**). Структура зеркалит `content`: разделы → `articles` + `images/<папка как у статьи>`. | 2026-04-08 |
| **Rehype / react-markdown pipeline** | `src/docsMarkdownRehypePlugins.js`, `src/rehype-*.js` | Плагины в `use([...])` передавать как **attacher-функции без преждевременного `()`** (иначе unified трактует inner `(tree)=>…` как attacher и вызывает без AST → `'children' in undefined`). Порядок: `rehypeRaw` → `rehypeFootnotesSection` → `rehypePublicAssets` → `rehypeInlineTooltip` → `rehypeFootnoteTooltips` → `rehypeSanitizeChildLists`. | 2026-03-30 |
| **Макрос «архивная редакция» в статьях снимка** | Архивные `.md` в `previous_versions/.../articles/` | Для предупреждения «вы смотрите старую версию» в теле снимка использовать **`docs-attention` / `docs-attention-title`** (не `docs-info`). Справочные блоки — по смыслу `docs-info`, `docs-note` и т.д. | 2026-04-08 |
| **Таблицы в статьях** | `src/components/MarkdownTable.jsx`, `MarkdownTr.jsx`, `App.css` | См. **`TABLES-DISPLAY.md`**. | — |
| **PDF** | `pdf-server/`, `runArticlePdfExport.js`, прокси в `vite.config.js` | См. **`PDF-EXPORT.md`**. | — |

## Как вести строку реестра

1. Добавьте/измените строку в таблице или уточните «Инварианты».
2. Колонку **Обновлено** — дата правки (YYYY-MM-DD).
3. Если тема большая — вынесите детали в отдельный `engine-docs/TOPIC.md` и в таблице оставьте одну ссылку.

## История существенных правок (кратко)

- **2026-03-30:** в `docsMarkdownRehypePlugins.js` снова убраны `()` у кастомных rehype-плагинов (регрессия: падение рендера статей с `'children' in undefined`).
- **2026-04-08:** заведён реестр; зафиксированы версии документации, `previous_versions` (cloud/mobile, статьи+картинки), rehype attacher, макрос предупреждения в архивных статьях.
