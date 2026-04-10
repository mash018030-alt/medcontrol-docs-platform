# Контекст проекта MedControl Docs

Организация репозиториев, этапы и служебные заметки. Настройки агента Cursor (Run, Auto-Run, Protection) вынесены в **[`CURSOR-AGENT-SETTINGS.md`](CURSOR-AGENT-SETTINGS.md)**.

**Для новых чатов:** «каталог эталонов и вложений — **`content/references/`** (описание: **`content/repo_docs/REFERENCES.md`**), палитра — **`content/references/docs-brand/colors/`**, бриф — **`engine/repo-docs/brief.md`**, контекст — **`engine/repo-docs/CONTEXT.md`**».

**PDF (Playwright, прокси, новости, сборка раздела):** единый регламент — **[`../engine-docs/PDF-EXPORT.md`](../engine-docs/PDF-EXPORT.md)**; сервис — [`../pdf-server/README.md`](../pdf-server/README.md).

---

## Проект

Прототип платформы пользовательской документации для **MedControl** (демо, локально, без пуша в GitLab).

Порядок работ: сначала навайбкодить платформу, потом перенести PDF / Google Docs в Markdown.

---

## Организация

- **Рабочая папка** — отдельная на компе (не внутри git-learning).
- **references/** — в **`content/references/`**: экспорты руководств (HTML + `images/`), PDF-эталоны, иконки и прочие **вложения** (не статьи сайта). Полное описание — **`content/repo_docs/REFERENCES.md`**. Скрипт **`engine/scripts/html-to-md.cjs`** читает HTML из `content/references/manuals/...`. Текстовый референс палитры UI доков — **`content/references/docs-brand/colors/`** (точка входа **`color-palette.md`**); подключаемая тема — **`content/repo_docs/brand/theme.css`**.
- **brief.md** — краткий бриф платформы (цели и границы); этот файл — **контекст репо и процесса**. Настройки Cursor для агента — **`CURSOR-AGENT-SETTINGS.md`**.
- Несколько репозиториев на компе — нормально; ассистент видит только папку, открытую в Cursor (File → Open Folder).
- Текст из чата ассистент может сохранять в файлы.

---

## План

| Этап | Содержание |
|------|------------|
| **A** | Уточнение (материалы в контент-репо: `references/`, `engine/repo-docs/brief.md`) |
| **B** | Прототип: каркас, навигация, Markdown (своя платформа в **engine/**: React + Vite) |
| **C** | Перенос документов в Markdown |
| **D** | Интеграция на платформу |

---

*Сохраняйте контекст между чатами: продукт и репозиторий — здесь; кнопки и разрешения агента — в [`CURSOR-AGENT-SETTINGS.md`](CURSOR-AGENT-SETTINGS.md).*
