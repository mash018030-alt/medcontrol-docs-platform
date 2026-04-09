# Папка `references/`

Вспомогательные материалы для техписов и разработки: **не** публикуются как страницы сайта (если движок не сканирует эту папку как статьи).

## PDF и эталоны для сверки

При архивации или релизе сюда же можно класть официальные PDF-руководства.

**Раздел «Общее»**

- **Файл:** `1. Общее. MC Cloud. Руководство пользователя.pdf`
- **Назначение:** эталон для сверки с текстами статей в **`0_docs/1_obshee/`** (в репозитории контента).
- **Снимок структуры контента и связи с разводящей:** `OBSHEE_CONTENT_SNAPSHOT.md` (пара к снимку UI в репозитории движка: **`docs-app/engine-docs/OBSHEE-LANDING-SNAPSHOT.md`**).

## Где лежит папка

**Путь в репозитории платформы:** **`content/references/`** (корень репо, рядом с **`0_docs/`**, **`1_news/`** и т.д.). На сайте и для Vite тот же каталог доступен как **`/content/references/…`**.

Краткая карта для людей и для ассистента (дополнительно к **`brief.md`**, **`CONTEXT.md`** и при настройке Cursor — **`CURSOR-AGENT-SETTINGS.md`** в репозитории движка).

## Корень `references/`

| Что | Назначение |
|-----|------------|
| `требования_к_платформе.md` | Требования к платформе документации (текст) |
| `референс_по_видео_прототипа.md` | Описание и заметки по видео-прототипу |
| `*.pdf`, `*.pptx`, `*.mp4`, `*.png` | Отчёты, презентация, видео, предупреждающие скрины и т.п. |

## Подпапки

- **`manuals/1_obshee_extract/`** — экспорт «1. Общее»: HTML `1..MCCloud..html`, каталог **`images/`**.
- **`manuals/admin_extract/`** — экспорт администрирования: `2..MCCloud..html`, **`images/`**.
- **`manuals/medkabinet_extract/`** — экспорт «Медкабинет»: `3..MCCloud..html`, **`images/`**.
- **`manuals/4_rukovodstvo/`** — руководство медадминистратора: `4..MCCloud..html`, **`images/`**.
- **`Colors/`** — палитра и токены цвета (`color_palette.md`, `light.md`, `sinii.md`, `temno_sinii.md`, `help_gradient.md`). В репозитории движка договорённости по цветам могут дублироваться в `docs-brand/colors` (например `accent-blue.md`, `dark-blue.md`) — сверяйте с этим каталогом при переносе.

## Скрипт конвертации HTML → Markdown

Из каталога `docs-app` движка:

```bash
node scripts/html-to-md.cjs
node scripts/html-to-md.cjs admin
node scripts/html-to-md.cjs obshee
node scripts/html-to-md.cjs medkabinet
```

Исходники HTML/картинок подставляются из этой папки `references/` (для медкабинета — **`manuals/medkabinet_extract/`**).
