# Снимок разводящей «Общее» (`/0_docs/1_obshee/user-guide`)

**Расположение:** репозиторий движка, **`docs-app/docs/OBSHEE-LANDING-SNAPSHOT.md`** (папка внутренних how-to — см. **`docs/README.md`**). Служебная заметка про интерфейс и код разводящей. **Не путать** с **`docs-app/public/content/references/`** в submodule — там PDF, лого, экспорты руководств и прочий контентный архив.

**Дата фиксации:** 2026-04-06.

**Текущая разводящая (после упрощения):** вложенный список ссылок по дереву `nav.js` — компонент `docs-app/src/components/SectionArticleNavList.jsx`, подключение в `Article.jsx` для пути `0_docs/1_obshee/user-guide`; на странице нет поиска и нет карточек с превью. Кнопка «Скачать в PDF» **только** для всего раздела (шапка). На обычных страницах статей документации кнопки PDF одной статьи нет.

Ниже — **снимок прежнего карточного дашборда** (для восстановления внешнего вида и поведения без устных передач).

Тексты статей и скриншоты внутри статей **не** дублируются здесь — они остаются в `docs-app/public/content/0_docs/1_obshee/`. Отдельный **PDF-эталон** для сверки текстов — в `docs-app/public/content/references/` (см. `docs-app/public/content/references/README.md`).

---

## 1. Идентификаторы и маршрут

| Что | Значение |
|-----|----------|
| Путь в URL | `0_docs/1_obshee/user-guide` (в dev: `http://localhost:5174/0_docs/1_obshee/user-guide` при базовом URL `/`) |
| Корень раздела в навигации | Тот же путь — узел с `children` в `docs-app/src/data/nav.js` |
| Markdown-файл корня | `docs-app/public/content/0_docs/1_obshee/user-guide.md` — краткое оглавление; **разводящая на сайте** — список из React (`SectionArticleNavList`), не рендер этого `.md` как основного тела |

---

## 2. Карточка раздела на главной «Документация»

Источник: `docs-app/src/data/docsDashboardSections.js` (объект с `sectionPath: '0_docs/1_obshee/user-guide'`).

- **Заголовок:** Общее  
- **Описание:** «Общее руководство по работе в АРМ: осмотры, организации, пользователи, документы, отчёты, ПАК и уведомления»  
- **Иконка:** `/content/icons/dashboard/main.png`  
- **Сборка PDF всего раздела:** `sectionPdfBundle: true` (кнопка в шапке разводящей вызывает печать/экспорт по маршруту с `mc_pdf`, см. `docs-app/src/components/Article.jsx` и `docs-app/src/utils/runArticlePdfExport`).

---

## 3. Состав плиток (порядок карточек)

**Источник правды:** прямые дети узла «Общее» в `docs-app/src/data/nav.js` — именно их перебирает `Article.jsx` для сетки. Вложенные статьи в меню **не** показываются отдельными плитками.

Порядок сверху вниз в коде (как в nav на дату снимка):

1. Авторизация в АРМ — `0_docs/1_obshee/avtorizaciya-v-arm`
2. Осмотры — `0_docs/1_obshee/osmotry`
3. Организации — `0_docs/1_obshee/organizacii`
4. Пользователи — `0_docs/1_obshee/polzovateli`
5. Документы — `0_docs/1_obshee/dokumenty`
6. Отчёты — `0_docs/1_obshee/otchety`
7. ПАК — `0_docs/1_obshee/pak`
8. Уведомления — `0_docs/1_obshee/uvedomleniya`
9. Частые вопросы — `0_docs/1_obshee/chastye-voprosy`

---

## 4. Превью-картинки на карточках (сетка 3×3)

**Источник:** `docs-app/src/data/obsheeLandingCardPreview.js`.

Файлы лежат в `docs-app/public/content/images/dashboards/Obshee/`. Нумерация рядов: 1–3, 4–6, 7–9 (слева направо, сверху вниз).

| № файла | Путь статьи (корневая тема плитки) |
|--------|-------------------------------------|
| `1.png` | `0_docs/1_obshee/avtorizaciya-v-arm` |
| `2.png` | `0_docs/1_obshee/osmotry` |
| `3.png` | `0_docs/1_obshee/organizacii` |
| `4.png` | `0_docs/1_obshee/polzovateli` |
| `5.png` | `0_docs/1_obshee/dokumenty` |
| `6.png` | `0_docs/1_obshee/otchety` |
| `7.png` | `0_docs/1_obshee/pak` |
| `8.png` | `0_docs/1_obshee/uvedomleniya` |
| `9.png` | `0_docs/1_obshee/chastye-voprosy` |

**Fallback** при ошибке загрузки изображения: `docs-app/public/content/images/dashboards/Obshee.png` (`OBSHEE_LANDING_CARD_PREVIEW_FALLBACK`).

Для путей, которых нет в таблице, в коде есть запасной шаблон: `Obshee/<последний-сегмент-пути>.png` (на случай расширения списка плиток).

**Вспомогательные скрипты** (подготовка/нормализация превью): `docs-app/scripts/obshee-9-normalize-width.cjs`, `docs-app/scripts/rebuild-obshee-9-preview.cjs`, `docs-app/scripts/split-obshee-guide.cjs`.

---

## 5. Особые варианты вёрстки карточек

**Источник:** `docs-app/src/components/LandingSectionTile.jsx` + стили `.docs-section-landing-root--obshee-stat` в `docs-app/src/App.css`.

- **ПАК** (`0_docs/1_obshee/pak`): модификатор `docs-landing-tile--card-preview-inset-preview` — превью уже по ширине (inset), чтобы кадр скрина совпал с макетом.
- **Частые вопросы** (`0_docs/1_obshee/chastye-voprosy`): классы `…--obshee-faq-preview` / `…--obshee-faq` — другое скругление превью из-за белых углов PNG.

Подробные числа (отступы, сетка 3 колонки, размеры кнопки PDF, запреты на изменения) зафиксированы в Cursor-правилах (раздел «источник: docs-obshee-dashboard-invariants.mdc» в `.cursor/rules/medcontrol-docs-cursor-rules.mdc`) — при восстановлении сверяться с ним и с актуальным блоком CSS в `docs-app/src/App.css` (искать комментарий «Разводящая «Общее»»).

---

## 6. Поведение на странице

| Элемент | Поведение |
|---------|-----------|
| Заголовок H1 | Берётся из **nav** (`landingSection.title`), не из кэшированного текста markdown, чтобы не расходился с PDF. |
| Поиск | Компонент `SearchBar` с `sectionRootPath={landingSection.path}`: подсказки и переход на `/search` с `?section=0_docs/1_obshee/user-guide` ограничивают выдачу разделом (см. `docs-app/src/search/docSearch.js`). |
| PDF в шапке раздела | Одна кнопка «Скачать в PDF» для **пакета статей раздела** (если в meta включён `sectionPdfBundle`). |
| PDF на карточке | Кнопка у каждой плитки: печать **одной** статьи по пути плитки (`buildArticleMcPdfUrl`). |

Смежное правило UX — раздел «docs-dashboard-recent-and-landing» в **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`**: на разводящей **нет** блока «недавно открытые» (он только на главной дашборда).

---

## 7. Включение «стат-дашборда» в коде

Разводящая с превью и стилями «obshee-stat» включается, когда:

- текущий slug — узел nav с детьми **и**
- путь `0_docs/1_obshee/user-guide` или `0_docs/2_admin/articles/00_main` **и**
- не режим `?mc_pdf=1`.

Логика: `docs-app/src/components/Article.jsx` (`statDashLandingPanel`, `SectionLandingObsheeStatPanel`).

---

## 8. Чек-лист «вернуть как было»

1. Узел «Общее» в `docs-app/src/data/nav.js` с тем же `path` и тем же порядком `children` (п. 3).  
2. Запись в `docs-app/src/data/docsDashboardSections.js` (п. 2).  
3. `docs-app/src/data/obsheeLandingCardPreview.js` и файлы `docs-app/public/content/images/dashboards/Obshee/1.png` … `9.png` + fallback.  
4. `docs-app/src/components/LandingSectionTile.jsx` — ветки ПАК / FAQ.  
5. `docs-app/src/components/Article.jsx` — условие `statDashLandingPanel` для obshee.  
6. CSS в `docs-app/src/App.css` для `.docs-section-landing-root--obshee-stat` и связанных классов; сверка с блоком «docs-obshee-dashboard-invariants» в **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`**.  
7. При необходимости — `docs-app/public/content/0_docs/1_obshee/user-guide.md` как текстовое оглавление для читателя (не обязателен для сетки карточек).

---

*При существенных изменениях разводящей обновляйте этот файл или делайте новый снимок с новой датой.*
