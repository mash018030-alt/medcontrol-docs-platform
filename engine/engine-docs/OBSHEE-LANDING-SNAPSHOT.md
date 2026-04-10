# Снимок разводящей «Общее» (`/0_docs/1_obshee/articles/00_main`)

**Расположение:** репозиторий движка, **`engine/engine-docs/OBSHEE-LANDING-SNAPSHOT.md`** (папка регламентов про движок — см. **[README.md](README.md)** в этой же папке). Служебная заметка про интерфейс и код разводящей. **Не путать** с вложениями в **`content/references/`** (см. **`content/repo_docs/REFERENCES.md`**) — там PDF, лого, экспорты и прочий архив для сверки.

**Дата фиксации:** 2026-04-07 (пути приведены к канону **`nav.js`**: каталог **`articles/`**, подчёркивания в сегментах).

**Канонический путь раздела** (URL, `flatArticles`, файлы статей): **`0_docs/1_obshee/articles/00_main`**.  
Раньше в документах встречались варианты с дефисами (`user-guide`, `chastye-voprosy` и т.п.) и без **`articles/`** — такие URL при необходимости ведут на канон через **`engine/src/data/articlePathRedirects.js`**; для техписов и снимков ориентироваться на пути **как в `nav.js`**.

**Текущая разводящая (после упрощения):** вложенный список ссылок по дереву `nav.js` — компонент `engine/src/components/SectionArticleNavList.jsx`, подключение в `Article.jsx` для пути **`0_docs/1_obshee/articles/00_main`**; на странице нет поиска и нет карточек с превью. Кнопка «Скачать в PDF» **только** для всего раздела (шапка). На обычных страницах статей документации кнопки PDF одной статьи нет.

Ниже — **снимок прежнего карточного дашборда** (для восстановления внешнего вида и поведения без устных передач).

**Обновление 2026-04-09:** превью **`content/images/dashboards/Obshee/`** и **`…/admin/`** удалены из репозитория; разводящие — **список ссылок** без плиток. Удалены неиспользуемые модули **`obsheeLandingCardPreview.js`**, **`adminLandingCardPreview.js`** и скрипты **`obshee-9-normalize-width.cjs`**, **`rebuild-obshee-9-preview.cjs`**. Разделы §3–§8 ниже — **историческая справка**; при восстановлении карточек файлы превью можно взять из **истории git**.

Тексты статей и скриншоты внутри статей **не** дублируются здесь — они лежат в **`content/0_docs/1_obshee/articles/`**. Отдельный **PDF-эталон** для сверки текстов — в **`content/references/`** (см. **`content/repo_docs/REFERENCES.md`**).

---

## 1. Идентификаторы и маршрут

| Что | Значение |
|-----|----------|
| Путь в URL | `0_docs/1_obshee/articles/00_main` (в dev: `http://localhost:5174/0_docs/1_obshee/articles/00_main` при базовом URL `/`) |
| Корень раздела в навигации | Тот же путь — узел с `children` в `engine/src/data/nav.js` |
| Markdown-файл корня | `content/0_docs/1_obshee/articles/00_main.md` — краткое оглавление; **разводящая на сайте** — список из React (`SectionArticleNavList`), не рендер этого `.md` как основного тела |

---

## 2. Карточка раздела на главной «Документация»

Источник: `engine/src/data/docsDashboardSections.js` (объект с `sectionPath: '0_docs/1_obshee/articles/00_main'`).

- **Заголовок:** Общее  
- **Описание:** «Общее руководство по работе в АРМ: осмотры, организации, пользователи, документы, отчёты, ПАК и уведомления»  
- **Иконка:** `/content/images/dashboards/0_main/main.png` (см. `docsDashboardSections.js`)  
- **Сборка PDF всего раздела:** `sectionPdfBundle: true` (кнопка в шапке разводящей вызывает печать/экспорт по маршруту с `mc_pdf`, см. `engine/src/components/Article.jsx` и `engine/src/utils/runArticlePdfExport`).

---

## 3. Состав плиток (порядок карточек)

**Источник правды:** прямые дети узла «Общее» в `engine/src/data/nav.js` — именно их перебирает `Article.jsx` для сетки. Вложенные статьи в меню **не** показываются отдельными плитками.

Порядок сверху вниз в коде (как в nav на дату снимка):

1. Авторизация в АРМ — `0_docs/1_obshee/articles/01_avtorizaciya_v_arm`
2. Осмотры — `0_docs/1_obshee/articles/02_osmotry`
3. Организации — `0_docs/1_obshee/articles/09_organizacii`
4. Пользователи — `0_docs/1_obshee/articles/12_polzovateli`
5. Документы — `0_docs/1_obshee/articles/16_dokumenty`
6. Отчёты — `0_docs/1_obshee/articles/17_otchety`
7. ПАК — `0_docs/1_obshee/articles/19_pak`
8. Уведомления — `0_docs/1_obshee/articles/20_uvedomleniya`
9. Частые вопросы — `0_docs/1_obshee/articles/25_chastye_voprosy`

---

## 4. Превью-картинки на карточках (сетка 3×3) *[история; файлы и модуль удалены из репо]*

**Было:** `engine/src/data/obsheeLandingCardPreview.js` (удалён) и PNG в `content/images/dashboards/Obshee/` (удалены). Нумерация рядов: 1–3, 4–6, 7–9 (слева направо, сверху вниз).

| № файла | Путь статьи (корневая тема плитки) |
|--------|-------------------------------------|
| `1.png` | `0_docs/1_obshee/articles/01_avtorizaciya_v_arm` |
| `2.png` | `0_docs/1_obshee/articles/02_osmotry` |
| `3.png` | `0_docs/1_obshee/articles/09_organizacii` |
| `4.png` | `0_docs/1_obshee/articles/12_polzovateli` |
| `5.png` | `0_docs/1_obshee/articles/16_dokumenty` |
| `6.png` | `0_docs/1_obshee/articles/17_otchety` |
| `7.png` | `0_docs/1_obshee/articles/19_pak` |
| `8.png` | `0_docs/1_obshee/articles/20_uvedomleniya` |
| `9.png` | `0_docs/1_obshee/articles/25_chastye_voprosy` |

**Fallback** при ошибке загрузки изображения: `content/images/dashboards/Obshee.png` (`OBSHEE_LANDING_CARD_PREVIEW_FALLBACK`).

Для путей, которых нет в таблице, в коде есть запасной шаблон: `Obshee/<последний-сегмент-пути>.png` (на случай расширения списка плиток).

**Вспомогательные скрипты** (исторически): `obshee-9-normalize-width.cjs` и `rebuild-obshee-9-preview.cjs` **удалены**; остаётся при необходимости `split-obshee-guide.cjs`.

---

## 5. Особые варианты вёрстки карточек

**Источник (исторический):** компонент плитки разводящей и стили `.docs-section-landing-root--obshee-stat` в `engine/src/App.css`. Конкретное имя файла компонента при восстановлении сверять с актуальной структурой `engine/src/components/`.

- **ПАК** (`0_docs/1_obshee/articles/19_pak`): модификатор `docs-landing-tile--card-preview-inset-preview` — превью уже по ширине (inset), чтобы кадр скрина совпал с макетом.
- **Частые вопросы** (`0_docs/1_obshee/articles/25_chastye_voprosy`): классы `…--obshee-faq-preview` / `…--obshee-faq` — другое скругление превью из-за белых углов PNG.

Подробные числа (отступы, сетка 3 колонки, размеры кнопки PDF, запреты на изменения) зафиксированы в Cursor-правилах (раздел «источник: docs-obshee-dashboard-invariants.mdc» в `.cursor/rules/medcontrol-docs-cursor-rules.mdc`) — при восстановлении сверяться с ним и с актуальным блоком CSS в `engine/src/App.css` (искать комментарий «Разводящая «Общее»»).

---

## 6. Поведение на странице

| Элемент | Поведение |
|---------|-----------|
| Заголовок H1 | Берётся из **nav** (`landingSection.title`), не из кэшированного текста markdown, чтобы не расходился с PDF. |
| Поиск | Компонент `SearchBar` с `sectionRootPath={landingSection.path}`: подсказки и переход на `/search` с `?section=0_docs/1_obshee/articles/00_main` ограничивают выдачу разделом (см. `engine/src/search/docSearch.js`). |
| PDF в шапке раздела | Одна кнопка «Скачать в PDF» для **пакета статей раздела** (если в meta включён `sectionPdfBundle`). |
| PDF на карточке | Кнопка у каждой плитки: печать **одной** статьи по пути плитки (`buildArticleMcPdfUrl`). |

Смежное правило UX — раздел «docs-dashboard-recent-and-landing» в **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`**: на разводящей **нет** блока «недавно открытые» (он только на главной дашборда).

---

## 7. Включение «стат-дашборда» в коде *[история]*

**Сейчас** этот режим в UI **отключён**. Раньше разводящая с превью и стилями «obshee-stat» включалась, когда:

- текущий slug — узел nav с детьми **и**
- путь **`0_docs/1_obshee/articles/00_main`** или **`0_docs/2_admin/articles/00_main`** **и**
- не режим `?mc_pdf=1`.

Логика: `engine/src/components/Article.jsx` (`statDashLandingPanel`, `SectionLandingObsheeStatPanel` — имена уточнять в актуальном файле).

---

## 8. Чек-лист «вернуть как было»

1. Узел «Общее» в `engine/src/data/nav.js` с тем же `path` **`0_docs/1_obshee/articles/00_main`** и тем же порядком `children` (п. 3).  
2. Запись в `engine/src/data/docsDashboardSections.js` (п. 2).  
3. Восстановить из истории git: резолвер превью (бывший `obsheeLandingCardPreview.js`) и файлы `content/images/dashboards/Obshee/1.png` … `9.png` + fallback; для «Администрирования» — аналогично `admin/` и бывший `adminLandingCardPreview.js`.  
4. Компонент плиток разводщей и ветки ПАК / FAQ в стилях — см. `engine/src/components/` и `App.css`.  
5. `engine/src/components/Article.jsx` — условие `statDashLandingPanel` для obshee.  
6. CSS в `engine/src/App.css` для `.docs-section-landing-root--obshee-stat` и связанных классов; сверка с блоком «docs-obshee-dashboard-invariants» в **`.cursor/rules/medcontrol-docs-cursor-rules.mdc`**.  
7. При необходимости — `content/0_docs/1_obshee/articles/00_main.md` как текстовое оглавление для читателя (не обязателен для сетки карточек).

---

*При существенных изменениях разводящей обновляйте этот файл или делайте новый снимок с новой датой.*
