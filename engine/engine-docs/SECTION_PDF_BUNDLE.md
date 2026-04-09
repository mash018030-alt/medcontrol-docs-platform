# Сборка PDF целого раздела (главный дашборд)

Краткая памятка для доработок и отладки. Общие правила экспорта PDF: **[`PDF-EXPORT.md`](PDF-EXPORT.md)**.

## Поведение

- На главной (`/`) у карточек разделов справа — иконка загрузки (как у строк «Предыдущие релизы»), подсказка при наведении: **«Скачать в PDF»** (`title` / `aria-label`).
- По клику запрашивается PDF через **Playwright** (`engine/pdf-server`): печатается страница с `mc_pdf=1` и параметром `root` (корень раздела из `nav`, напр. `obshee/user-guide`).
- Без `VITE_PDF_SERVICE_URL` показывается сообщение — отдельный html2pdf для этой страницы не используется.

## Ключевые файлы

| Что | Где |
|-----|-----|
| Список карточек и флаг `sectionPdfBundle` | `src/data/docsDashboardSections.js` |
| Кнопка-иконка, вызов экспорта | `src/components/dashboard/SectionCard.jsx` |
| Сборка markdown по `orderedPathsForSectionPdfBundle` + склейка `---` между файлами | `src/components/SectionPdfBundlePage.jsx` |
| URL печати, `runPdfFromPrintUrl` | `src/utils/runArticlePdfExport.js` |
| Порядок статей раздела | `orderedPathsForSectionPdfBundle` (без разводящей `…/00_main`) в `src/data/nav.js` |
| Маршрут страницы сборки | `src/App.jsx` — `section-pdf-bundle` **выше** `:path/*` |
| Раскладка без шапки/сайдбара для печати | `src/components/Layout.jsx` — `mc_pdf=1` |
| Chromium PDF, высота страницы | `pdf-server/server.mjs` |

## Разрешённые корни (`root`)

Совпадают с карточками, у которых в `docsDashboardSections` задано `sectionPdfBundle: true`. Логика валидации в `SectionPdfBundlePage` строит `Set` из того же массива.

## Склейка контента

- Файлы подряд в порядке `flatArticles` внутри раздела; страница-лендинг `…/00_main` **не** входит в PDF (начинается с первой подстатьи, напр. «Авторизация в АРМ»). Раздел «Глоссарий» (`user_guide`) без `00_main` не затрагивается.
- Между фрагментами вставляется markdown **`---`** (hr), **без** принудительного `page-break-before`, чтобы не было пустых пол-страницы после коротких статей.

## Переменные окружения

- `VITE_PDF_SERVICE_URL` — база сервиса (см. `pdf-server/README.md`).
- Сервер: `ALLOWED_HOSTS` должен включать хост dev-сервера (например `localhost:5174`).
