# Каталог папки `content/references/`

Здесь лежат **эталоны, PDF, экспорты руководств, иконки и прочие вложения** для сверки и разработки. Это **не** статьи сайта: движок не сканирует ветку **`references/`** как документацию для меню.

**Снимок структуры раздела «Общее» (тексты, файлы, связь с разводящей):** **[`OBSHEE_CONTENT_SNAPSHOT.md`](OBSHEE_CONTENT_SNAPSHOT.md)** (пара к снимку UI в движке: **`engine/engine-docs/OBSHEE-LANDING-SNAPSHOT.md`**).

## PDF и эталоны для сверки

При архивации или релизе сюда же можно класть официальные PDF-руководства.

**Раздел «Общее»**

- **Файл:** `1. Общее. MC Cloud. Руководство пользователя.pdf` (в каталоге **[`../references/`](../references/)**)
- **Назначение:** эталон для сверки с текстами статей в **`0_docs/1_obshee/`**.

## Где лежит папка на диске

**Путь в репозитории:** **`content/references/`** (рядом с **`0_docs/`**, **`1_news/`** и т.д.). На собранном сайте тот же каталог доступен как **`/content/references/…`**.

Краткая карта платформы — **[`../../engine/repo-docs/brief.md`](../../engine/repo-docs/brief.md)** и индекс **[`../../engine/repo-docs/README.md`](../../engine/repo-docs/README.md)**. Регламент скриншотов в статьях — **[`izobrazheniya_v_statyah.md`](izobrazheniya_v_statyah.md)**.

## Корень `references/` (файлы)

| Что | Назначение |
|-----|------------|
| `требования_к_платформе.md` | Требования к платформе документации (текст), если заведён |
| `референс_по_видео_прототипа.md` | Заметки по видео-прототипу, если заведён |
| `*.pdf`, `*.pptx`, `*.mp4`, `*.png` | Отчёты, презентация, видео, предупреждающие скрины и т.п. |

## Подпапки

- **`docs-brand/`** — канон палитры UI доков MedControl: **`docs-brand/colors/color-palette.md`**, поясняющие `.md`, PDF/PNG от дизайна в **`colors/`**. Тема в браузере — **`brand/theme.css`** (папка **`content/repo_docs/brand/`**). См. **[`../references/docs-brand/README.md`](../references/docs-brand/README.md)**.
- **`manuals/1_obshee_extract/`** — экспорт «1. Общее»: HTML `1..MCCloud..html`, каталог **`images/`**.
- **`manuals/admin_extract/`** — экспорт администрирования: `2..MCCloud..html`, **`images/`**.
- **`manuals/medkabinet_extract/`** — экспорт «Медкабинет»: `3..MCCloud..html`, **`images/`**.
- **`manuals/4_rukovodstvo/`** — руководство медадминистратора: `4..MCCloud..html`, **`images/`**.
- **`icons/`**, **`macroces/`** и др. — вспомогательные материалы по смыслу папки.

## Скрипт конвертации HTML → Markdown

Из каталога **`engine`**:

```bash
node scripts/html-to-md.cjs
node scripts/html-to-md.cjs admin
node scripts/html-to-md.cjs obshee
node scripts/html-to-md.cjs medkabinet
```

Исходники HTML и картинок читаются из **`content/references/`** (для медкабинета — **`manuals/medkabinet_extract/`**).
