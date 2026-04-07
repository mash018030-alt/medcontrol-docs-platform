# MedControl Docs Platform

Репозиторий **движка** документации MedControl: приложение на React и Vite в каталоге **`docs-app/`**. Статьи, картинки и служебные материалы контента подключаются **git submodule** в **`docs-app/public/content/`** (отдельный репозиторий; URL — в **`.gitmodules`**).

---

## Требования

- **Node.js 20** (та же версия используется в CI при сборке).
- **Git** с поддержкой submodule.

---

## Первый запуск

Клонировать репозиторий **вместе с submodule** (без него в интерфейсе не будет статей):

```bash
git clone --recurse-submodules <URL-этого-репозитория>
cd medcontrol-docs-platform
```

Если клон уже есть, но папка контента пустая:

```bash
git submodule update --init --recursive
```

Установка и dev-сервер:

```bash
cd docs-app
npm install
npm run dev
```

URL и порт выведет Vite (по умолчанию часто **5174**). Продакшен-сборка статики: **`npm run build`** из **`docs-app/`**.

**Текстовый PDF (Playwright)** в разработке: **`npm run dev:with-pdf`** и описание в [**`docs-app/pdf-server/README.md`**](docs-app/pdf-server/README.md).

---

## Структура репозитория

| Каталог / файл | Назначение | Подробнее |
|----------------|------------|-----------|
| **`docs-app/`** | Платформа: навигация, поиск, Markdown, утилиты и скрипты. | [**`docs-app/README.md`**](docs-app/README.md) |
| **`docs-app/public/content/`** | Submodule: `.md`, медиа, **`references/`** для переноса и исходников. | См. README в репозитории контента; URL — **`.gitmodules`**. |
| **`docs-app/pdf-server/`** | Сервис печати PDF для продакшена и локальной отладки. | [**`pdf-server/README.md`**](docs-app/pdf-server/README.md) |
| **`design/`** | Референсы **организации платформы** (палитра бренда, согласование UI документации), **без** пользовательских медиа и лого — те лежат в submodule. | [**`design/README.md`**](design/README.md), вход в цвета — [`design/colors/color-palette.md`](design/colors/color-palette.md) |
| **`CONTEXT.md`** | Контекст проекта, план этапов, заметки для Cursor. | После README и `docs-app/README.md`. |
| **`.github/workflows/`** | Сборка и публикация (в этом репозитории — GitHub Pages, submodule включается в job). | При другом хостинге достаточно той же **`npm ci`** + **`npm run build`** из `docs-app/` (см. workflow). |

Дополнительно по продукту: [**`docs-app/SECTION_PDF_BUNDLE.md`**](docs-app/SECTION_PDF_BUNDLE.md) (пакетный PDF по разделу), [**`docs-app/OBSHEE-LANDING-SNAPSHOT.md`**](docs-app/OBSHEE-LANDING-SNAPSHOT.md) (архивный снимок разводящей «Общее» в коде).

---

## Submodule: если что-то пошло не так

- Сменили URL репозитория контента: **`git submodule sync`**, затем **`git submodule update --init --recursive`**.
- Раньше использовали **`file://`** в **`.gitmodules`** — для общей работы лучше HTTPS (или SSH) и тот же **`sync` / `update`**.

---

## Перед коммитом (по желанию)

Из **`docs-app/`**:

```bash
npm run lint
node scripts/check-internal-links.mjs
```

---

Платформа развивается; детали поведения и ограничений — в **`docs-app/README.md`** и **`CONTEXT.md`**.
