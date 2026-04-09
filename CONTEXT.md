# Контекст проекта MedControl Docs

Организация репозиториев, этапы и служебные заметки. Настройки агента Cursor (Run, Auto-Run, Protection) вынесены в **[`CURSOR-AGENT-SETTINGS.md`](CURSOR-AGENT-SETTINGS.md)**.

**Для новых чатов:** «используй материалы из **`content/references/`** (**references/README.md**), палитру из **`engine/docs-brand/colors/`**, **`brief.md`** и при необходимости **`CONTEXT.md`**».

**PDF (Playwright, прокси, новости, сборка раздела):** единый регламент — **[`engine/engine-docs/PDF-EXPORT.md`](engine/engine-docs/PDF-EXPORT.md)**; сервис — [`engine/pdf-server/README.md`](engine/pdf-server/README.md).

---

## Проект

Прототип платформы пользовательской документации для **MedControl** (демо, локально, без пуша в GitLab).

Порядок работ: сначала навайбкодить платформу, потом перенести PDF / Google Docs в Markdown.

---

## Организация

- **Рабочая папка** — отдельная на компе (не внутри git-learning).
- **references/** — в **`content/references/`**: тексты требований, экспорты руководств (HTML + `images/`), лого, PDF-эталоны и прочие медиа. См. **`references/README.md`** там же. Скрипт **`engine/scripts/html-to-md.cjs`** читает HTML из `content/references/manuals/...`. Референсы организации платформы (палитра и т.п.) — отдельно в **`engine/docs-brand/`**.
- **engine/docs-brand/colors/** — внутри движка (**`engine/docs-brand/`**): Markdown-референс цветовой палитры и при необходимости образцы `*.png`. Не входит в **`content/`**, чтобы не смешиваться со статьями и поиском по ним. Начало — **`engine/docs-brand/colors/color-palette.md`**.
- **brief.md** — краткий бриф платформы (цели и границы); этот файл — **контекст репо и процесса**. Настройки Cursor для агента — **`CURSOR-AGENT-SETTINGS.md`**.
- Несколько репозиториев на компе — нормально; ассистент видит только папку, открытую в Cursor (File → Open Folder).
- Текст из чата ассистент может сохранять в файлы.

---

## План

| Этап | Содержание |
|------|------------|
| **A** | Уточнение (материалы в контент-репо: `references/`, brief.md) |
| **B** | Прототип: каркас, навигация, Markdown (своя платформа в **engine/**: React + Vite) |
| **C** | Перенос документов в Markdown |
| **D** | Интеграция на платформу |

---

*Сохраняйте контекст между чатами: продукт и репозиторий — здесь; кнопки и разрешения агента — в [`CURSOR-AGENT-SETTINGS.md`](CURSOR-AGENT-SETTINGS.md).*
