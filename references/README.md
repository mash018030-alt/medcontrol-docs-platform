# Папка references

Краткая карта для людей и для ассистента в новых чатах (вместе с `CONTEXT.md` и `brief.md` в корне репозитория).

## Корень `references/`

| Что | Назначение |
|-----|------------|
| `требования-к-платформе.md` | Требования к платформе документации (текст) |
| `референс-по-видео-прототипа.md` | Описание и заметки по видео-прототипу |
| `*.pdf`, `*.pptx`, `*.mp4`, `*.png` | Отчёты, презентация, видео, предупреждающие скрины и т.п. |

## Подпапки

- **`1-obshee-extract/`** — экспорт «1. Общее»: HTML `1..MCCloud..html`, каталог **`images/`**.
- **`admin_extract/`** — экспорт администрирования: `2..MCCloud..html`, **`images/`**.
- **`manuals/medkabinet-extract/`** — экспорт «Медкабинет»: `3..MCCloud..html`, **`images/`** (путь обновлён относительно старого `references/medkabinet-extract/`).
- **`4-rukovodstvo/`** — руководство медадминистратора: `4..MCCloud..html`, **`images/`**.
- **`Colors&logo/`** — палитра и токены цвета (`color-palette.md`, `light.md`, `sinii.md`, `temno_sinii.md`).
- **`icons/`** — референсные иконки.
- **`logo/`** — референсы логотипа.

## Скрипт конвертации HTML → Markdown

Из каталога `docs-app`:

```bash
node scripts/html-to-md.cjs
node scripts/html-to-md.cjs admin
node scripts/html-to-md.cjs obshee
node scripts/html-to-md.cjs medkabinet
```

Исходники HTML/картинок подставляются из `references/` (для медкабинета — **`references/manuals/medkabinet-extract/`**).

Примечание: на Windows имя папки **`Colors&logo`** содержит символ `&`; в путях `path.join` / проводника это обычная папка.
