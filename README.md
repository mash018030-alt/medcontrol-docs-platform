# MedControl Docs Platform

Репозиторий платформы документации MedControl: **два корневых каталога** — **`content/`** (статьи, медиа, `references/`) и **`engine/`** (код движка на React и Vite). Для сборки и dev Vite видит контент как **`engine/public/content/`**: после **`npm install`** / **`npm ci`** в `engine/` скрипт **`scripts/ensure-content-link.cjs`** создаёт связь (junction на Windows, symlink на Linux) на **`../content`**. Раньше контент вели в отдельном репозитории [medcontrol-docs-content](https://github.com/mash018030-alt/medcontrol-docs-content).

---

## Требования

- **Node.js 20** (та же версия используется в CI при сборке).
- **Git**.

---

## Первый запуск

```bash
git clone <URL-этого-репозитория>
cd medcontrol-docs-platform
```

Установка и dev-сервер (после **`npm install`** в `engine/` автоматически создаётся связь **`public/content`** → **`../content`**):

```bash
cd engine
npm install
npm run dev
```

URL и порт выведет Vite (по умолчанию часто **5174**). Продакшен-сборка статики: **`npm run build`** из **`engine/`**.

**Текстовый PDF (Playwright)** в разработке: **`npm run dev:with-pdf`** и описание в [**`engine/pdf-server/README.md`**](engine/pdf-server/README.md).

---

## Структура репозитория

| Каталог / файл | Назначение | Подробнее |
|----------------|------------|-----------|
| **`content/`** | Пользовательский контент: `.md`, изображения, **`references/`**, новости. **Источник правды** для текстов сайта. | [**`content/README.md`**](content/README.md) |
| **`engine/`** | Код **веб-движка** (не пользовательские статьи): навигация, поиск, Markdown, утилиты и скрипты. | [**`engine/README.md`**](engine/README.md) |
| **`engine/engine-docs/`** | Служебные регламенты **про движок** (PDF, таблицы и т.д.); не путать с пользовательским контентом. | [**`engine/engine-docs/README.md`**](engine/engine-docs/README.md) |
| **`engine/pdf-server/`** | Сервис печати PDF для продакшена и локальной отладки. | [**`engine/pdf-server/README.md`**](engine/pdf-server/README.md) |
| **`engine/docs-brand/`** | Референсы **организации платформы** (палитра бренда, согласование UI документации), **без** пользовательских медиа и лого — те в **`content/`**. | [**`engine/docs-brand/README.md`**](engine/docs-brand/README.md), вход в цвета — [`engine/docs-brand/colors/color-palette.md`](engine/docs-brand/colors/color-palette.md) |
| **`archive/migration/`** | Снимки этапа разделения репозиториев (базовая линия проверки ссылок и навигации). | [**`archive/migration/README.md`**](archive/migration/README.md) |
| **`REPO-LAYOUT.md`** | Шпаргалка: **`content/`** vs **`engine/`**, `engine-docs`, связь `public/content`. | — |
| **`brief.md`** | Краткий бриф платформы (цели, границы, куда смотреть дальше). | — |
| **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`** | Общие правила для Cursor AI по проекту (UX, контент, PDF). Личные дополнения — любые другие `.mdc` в `.cursor/rules/` (не в git). | — |
| **`CONTEXT.md`** | Контекст проекта, устройство репозиториев, этапы. | После **`brief.md`** и `engine/README.md`. |
| **`CURSOR-AGENT-SETTINGS.md`** | Настройки агента Cursor (Run, Auto-Run, Protection) для этой папки. | Отдельно от **`CONTEXT.md`**. |
| **`.github/workflows/`** | Деплой на GitHub Pages (`deploy-pages.yml`). **CI на PR** в `main`: **`ci.yml`** — checkout, `npm ci` и **`npm run build`** в `engine/` (обязательный гейт); ESLint и `check-internal-links.mjs` запускаются, но пока **не блокируют** merge (`continue-on-error`), пока не вычищен долг. Скрипт ссылок завершает с **exit 1**, если есть битые ссылки или якоря. |
| **`.github/dependabot.yml`** | **Dependabot**: раз в неделю предлагает PR с обновлениями npm в **`engine/`** и **`engine/pdf-server/`** (отдельные манифесты). После мержа смотреть CI и при необходимости чейнджлог пакета. |

Служебные how-to **про движок** (не статьи MedControl): **[`engine/engine-docs/README.md`](engine/engine-docs/README.md)** (в т.ч. пакетный PDF раздела и снимок разводящей «Общее»). См. также **[`REPO-LAYOUT.md`](REPO-LAYOUT.md)**.

---

## Перед коммитом (по желанию)

На GitHub при PR в **`main`** см. **`.github/workflows/ci.yml`**: обязательна сборка; линт и проверка ссылок — для отчёта (пока без стоп-крана).

**Проверка внутренних ссылок** (`engine/scripts/check-internal-links.mjs`) сканирует Markdown в **`content/`** и сверяет пути с навигацией движка (`flatArticles` в `engine/src/data/nav.js` и дерево новостей).

Локально по умолчанию скрипт завершается с **кодом 1**, если есть ошибки по ссылкам или якорям; только отчёт без ошибки:

`LINK_CHECK_STRICT=0 node scripts/check-internal-links.mjs` (из **`engine/`**).

Из **`engine/`**:

```bash
npm run lint
node scripts/check-internal-links.mjs
```

---

Платформа развивается; детали поведения и ограничений — в **`engine/README.md`** и **`CONTEXT.md`**. Работа агента Cursor в этом репо — **`CURSOR-AGENT-SETTINGS.md`**.
