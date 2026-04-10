# MedControl — контент документации

Каталог со статьями (Markdown), изображениями и служебными файлами для сайта документации MedControl. В репозитории платформы лежит **в корне** как **`content/`**; движок (Vite) подключает его как **`engine/public/content/`** (см. **`engine/scripts/ensure-content-link.cjs`**).

Целевое дерево контента описано в **[repo_docs/REPO_STRUCTURE.md](repo_docs/REPO_STRUCTURE.md)** (префикс `docs/`, `news/`, словарь имён). Пока перестройка не завершена, структура может ещё совпадать со старым видом под `public/content/` в движке.

## О репозитории (`repo_docs/`)

Папка **`repo_docs/`** — не пользовательская документация MedControl (она в **`0_docs/`** и т.д.), а заметки **про устройство этого Git-репозитория**, миграцию структуры и **порядок работы с контентом** (пути, скрины в статьях).

| Файл | Назначение |
|------|------------|
| [repo_docs/REPO_STRUCTURE.md](repo_docs/REPO_STRUCTURE.md) | **Словарь имён, этапы 1–3, с чего начать** (каркас `docs/`/`news/`, затем раздел «Администрирование» и остальные по шаблону) |
| [repo_docs/izobrazheniya_v_statyah.md](repo_docs/izobrazheniya_v_statyah.md) | **Скриншоты в статьях:** пути `/content/…`, имена файлов, ширина на странице, списки в markdown, PDF |
| [repo_docs/REFERENCES.md](repo_docs/REFERENCES.md) | **Каталог `references/`:** PDF, экспорты руководств, палитра в `docs-brand/`, скрипт HTML→MD (не страницы сайта) |
| [repo_docs/OBSHEE_CONTENT_SNAPSHOT.md](repo_docs/OBSHEE_CONTENT_SNAPSHOT.md) | Снимок структуры контента раздела «Общее» и связь с разводящей в движке |
| [references/README.md](references/README.md) | Краткий указатель: куда смотреть описание папки `references/` |
| `images/dashboards/0_main/*.png` | Иконки карточек разделов на главном дашборде «Документация» (`admin.png`, `glossary.png`, `main.png`, `medadmin.png`, `medcab.png`); в движке путь вида `/content/images/dashboards/0_main/<файл>.png`. Папки превью разводящих **`Obshee/`** и **`admin/`** удалены — старый карточный UI не используется (см. `engine/engine-docs/OBSHEE-LANDING-SNAPSHOT.md`). |
| `images/logo/logo_3.png` | Логотип платформы; в движке: `/content/images/logo/logo_3.png` |

Редактируйте файлы в этом каталоге; код движка лежит в **`engine/src/`** и соседних папках того же репозитория.

## Связь с движком

Контент обслуживается Vite как статика под **`/content/…`**. Раньше этот набор велся в отдельном репозитории [medcontrol-docs-content](https://github.com/mash018030-alt/medcontrol-docs-content); теперь он встроен в платформу. Детали структуры — в **`repo_docs/REPO_STRUCTURE.md`**. Что именно лежит в `content/`, а что по-прежнему в коде движка (меню документации, новости) — в том же файле, подраздел **«Граница контент ↔ движок»**.

## Базовая линия «до миграции»

Снимок проверки внутренних ссылок и списка путей из `flatArticles` на момент разделения репозиториев лежит в **репозитории движка**: **`engine/archive/migration/baseline-links-before-migration.txt`** (зачем хранится — **`engine/archive/migration/README.md`**). Дубликат в `repo_docs/` не обязателен.

## Локальный Git и GitHub

Репозиторий можно вести только локально; для команды и CI добавьте remote:

```bash
git remote add origin <URL-репозитория-на-GitHub>
git push -u origin main
```
