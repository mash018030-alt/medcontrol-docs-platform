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
| **`docs-app/`** | Код **веб-движка** (не пользовательские статьи): навигация, поиск, Markdown, утилиты и скрипты. | [**`docs-app/README.md`**](docs-app/README.md) |
| **`docs-app/engine-docs/`** | Служебные регламенты **про движок** (PDF, таблицы и т.д.); не путать с контентом в submodule. | [**`docs-app/engine-docs/README.md`**](docs-app/engine-docs/README.md) |
| **`docs-app/public/content/`** | Submodule: `.md`, медиа, **`references/`** для переноса и исходников. | См. README в репозитории контента; URL — **`.gitmodules`**. |
| **`docs-app/pdf-server/`** | Сервис печати PDF для продакшена и локальной отладки. | [**`pdf-server/README.md`**](docs-app/pdf-server/README.md) |
| **`docs-brand/`** | Референсы **организации платформы** (палитра бренда, согласование UI документации), **без** пользовательских медиа и лого — те лежат в submodule. | [**`docs-brand/README.md`**](docs-brand/README.md), вход в цвета — [`docs-brand/colors/color-palette.md`](docs-brand/colors/color-palette.md) |
| **`archive/migration/`** | Снимки этапа разделения репозиториев (базовая линия проверки ссылок и навигации). | [**`archive/migration/README.md`**](archive/migration/README.md) |
| **`REPO-LAYOUT.md`** | Шпаргалка: движок vs контент vs `engine-docs`; опциональное переименование `docs-app`. | — |
| **`brief.md`** | Краткий бриф платформы (цели, границы, куда смотреть дальше). | — |
| **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`** | Общие правила для Cursor AI по проекту (UX, контент, PDF). Личные дополнения — любые другие `.mdc` в `.cursor/rules/` (не в git). | — |
| **`CONTEXT.md`** | Контекст проекта, устройство репозиториев, этапы. | После **`brief.md`** и `docs-app/README.md`. |
| **`CURSOR-AGENT-SETTINGS.md`** | Настройки агента Cursor (Run, Auto-Run, Protection) для этой папки. | Отдельно от **`CONTEXT.md`**. |
| **`.github/workflows/`** | Деплой на GitHub Pages (`deploy-pages.yml`, с submodule). **CI на PR** в `main`: **`ci.yml`** — клон с submodule, `npm ci` и **`npm run build`** в `docs-app/` (обязательный гейт); ESLint и `check-internal-links.mjs` запускаются, но пока **не блокируют** merge (`continue-on-error`), пока не вычищен долг. Скрипт ссылок завершает с **exit 1**, если есть битые ссылки или якоря. |
| **`.github/dependabot.yml`** | **Dependabot**: раз в неделю предлагает PR с обновлениями npm в **`docs-app/`** и **`docs-app/pdf-server/`** (отдельные манифесты). После мержа смотреть CI и при необходимости чейнджлог пакета. |

Служебные how-to **про движок** (не статьи MedControl): **[`docs-app/engine-docs/README.md`](docs-app/engine-docs/README.md)** (в т.ч. пакетный PDF раздела и снимок разводящей «Общее»). См. также **[`REPO-LAYOUT.md`](REPO-LAYOUT.md)**.

---

## Submodule: если что-то пошло не так

- Сменили URL репозитория контента: **`git submodule sync`**, затем **`git submodule update --init --recursive`**.
- Раньше использовали **`file://`** в **`.gitmodules`** — для общей работы лучше HTTPS (или SSH) и тот же **`sync` / `update`**.

---

## Перед коммитом (по желанию)

На GitHub при PR в **`main`** см. **`.github/workflows/ci.yml`**: обязательна сборка; линт и проверка ссылок — для отчёта (пока без стоп-крана).

**Проверка внутренних ссылок** (`docs-app/scripts/check-internal-links.mjs`) сканирует Markdown в **контентном submodule** **`docs-app/public/content/`** и сверяет пути с навигацией движка (`flatArticles` в `docs-app/src/data/nav.js` и дерево новостей). Без инициализированного submodule скрипт не даст полезной картины — см. раздел **«Первый запуск»**.

Локально по умолчанию скрипт завершается с **кодом 1**, если есть ошибки по ссылкам или якорям; только отчёт без ошибки:

`LINK_CHECK_STRICT=0 node scripts/check-internal-links.mjs` (из **`docs-app/`**).

Из **`docs-app/`**:

```bash
npm run lint
node scripts/check-internal-links.mjs
```

---

Платформа развивается; детали поведения и ограничений — в **`docs-app/README.md`** и **`CONTEXT.md`**. Работа агента Cursor в этом репо — **`CURSOR-AGENT-SETTINGS.md`**.
