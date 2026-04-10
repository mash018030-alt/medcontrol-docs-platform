# Папка `references/`

Вспомогательные материалы для техписов и разработки: **не** публикуются как страницы сайта (если движок не сканирует эту папку как статьи).

## PDF и эталоны для сверки

При архивации или релизе сюда же можно класть официальные PDF-руководства.

**Раздел «Общее»**

- **Файл:** `1. Общее. MC Cloud. Руководство пользователя.pdf`
- **Назначение:** эталон для сверки с текстами статей в **`0_docs/1_obshee/`** (в репозитории контента).
- **Снимок структуры контента и связи с разводящей:** `OBSHEE_CONTENT_SNAPSHOT.md` (пара к снимку UI в репозитории движка: **`engine/engine-docs/OBSHEE-LANDING-SNAPSHOT.md`**).

## Где лежит папка

**Путь в репозитории платформы:** **`content/references/`** (корень репо, рядом с **`0_docs/`**, **`1_news/`** и т.д.). На сайте и для Vite тот же каталог доступен как **`/content/references/…`**.

Краткая карта для людей и для ассистента (дополнительно к **[`../../engine/repo-docs/brief.md`](../../engine/repo-docs/brief.md)** и соседним файлам в **`engine/repo-docs/`** — индекс **[`../../engine/repo-docs/README.md`](../../engine/repo-docs/README.md)**). Регламент скриншотов и путей к картинкам в статьях — в **[`../repo_docs/izobrazheniya_v_statyah.md`](../repo_docs/izobrazheniya_v_statyah.md)**.

## Корень `references/`

| Что | Назначение |
|-----|------------|
| `требования_к_платформе.md` | Требования к платформе документации (текст) |
| `референс_по_видео_прототипа.md` | Описание и заметки по видео-прототипу |
| `*.pdf`, `*.pptx`, `*.mp4`, `*.png` | Отчёты, презентация, видео, предупреждающие скрины и т.п. |

## Подпапки

- **`docs-brand/`** — **канонический** текстовый референс палитры UI доков MedControl: **`docs-brand/colors/color-palette.md`** и соседние `.md`. Подключаемые в браузер переменные — в **`../brand/theme.css`**. См. **[`docs-brand/README.md`](docs-brand/README.md)**.
- **`manuals/1_obshee_extract/`** — экспорт «1. Общее»: HTML `1..MCCloud..html`, каталог **`images/`**.
- **`manuals/admin_extract/`** — экспорт администрирования: `2..MCCloud..html`, **`images/`**.
- **`manuals/medkabinet_extract/`** — экспорт «Медкабинет»: `3..MCCloud..html`, **`images/`**.
- **`manuals/4_rukovodstvo/`** — руководство медадминистратора: `4..MCCloud..html`, **`images/`**.
- **`Colors/`** — старые материалы от дизайна (PDF/PNG и черновые `.md`). Не дублируйте смысл **`docs-brand/colors/`**: при расхождении правьте **`docs-brand/`** и **`../brand/theme.css`**, здесь оставляйте вложения для архива.

## Скрипт конвертации HTML → Markdown

Из каталога `engine` движка:

```bash
node scripts/html-to-md.cjs
node scripts/html-to-md.cjs admin
node scripts/html-to-md.cjs obshee
node scripts/html-to-md.cjs medkabinet
```

Исходники HTML/картинок подставляются из этой папки `references/` (для медкабинета — **`manuals/medkabinet_extract/`**).
