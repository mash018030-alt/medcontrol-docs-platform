# MedControl Docs Platform

В корне репозитория — **две рабочие папки**:

| Папка | Назначение |
|-------|------------|
| **`content/`** | Статьи, медиа, новости, **`references/`**. [Подробнее →](content/README.md) |
| **`engine/`** | Код сайта (React + Vite), PDF-сервис, регламенты движка (**`engine/engine-docs/`**). Палитра и бренд в контенте: **`content/brand/`**, **`content/references/docs-brand/`**. [Подробнее →](engine/README.md) |

**Быстрый старт:** `cd engine && npm install && npm run dev` (Node **20**). После установки создаётся связь **`engine/public/content/`** → **`../content`** (скрипт **`engine/scripts/ensure-content-link.cjs`**).

Метадокументация репозитория (бриф, контекст, шпаргалка по дереву, настройки агента Cursor): **[`engine/repo-docs/README.md`](engine/repo-docs/README.md)**.

---

## Почему в корне ещё есть служебные папки

Их **нельзя** перенести в `engine/` или `content/` без поломки инструментов:

| Путь | Зачем |
|------|--------|
| **`.github/`** | GitHub Actions (CI, Pages) — ожидается только здесь |
| **`.cursor/`** | Правила Cursor для всего workspace |
| **`.vscode/`** | Задачи VS Code для открытой папки проекта |
| **`.gitignore`** | Правила игнорирования для всего дерева git |

Перед коммитом полезно из **`engine/`**: `npm run lint` и `node scripts/check-internal-links.mjs` (см. **`engine/README.md`** и **`.github/workflows/ci.yml`**).
