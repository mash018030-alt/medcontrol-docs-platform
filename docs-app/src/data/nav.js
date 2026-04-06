// Древовидная структура документации для левого меню
// path — путь для роута и загрузки файла (без .md), совпадает с public/content/<path>.md
export const navTree = [
  {
    title: 'Глоссарий',
    path: '0_docs/0_glossariy/user-guide',
    children: [{ title: 'Термины и сокращения', path: '0_docs/0_glossariy/terminy-i-sokrashcheniya' }],
  },
  {
    title: 'Общее',
    path: '0_docs/1_obshee/articles/00_main',
    children: [
      { title: 'Авторизация в АРМ', path: '0_docs/1_obshee/articles/01_avtorizaciya-v-arm' },
      {
        title: 'Осмотры',
        path: '0_docs/1_obshee/articles/02_osmotry',
        children: [
          { title: 'Поиск осмотров', path: '0_docs/1_obshee/articles/03_poisk-osmotrov' },
          { title: 'Карточка осмотра', path: '0_docs/1_obshee/articles/08_kartochka-osmotra' },
          { title: 'Виды осмотров', path: '0_docs/1_obshee/articles/04_vidy-osmotrov' },
          { title: 'Серия осмотров', path: '0_docs/1_obshee/articles/05_seriya-osmotrov' },
          { title: 'История прохождения осмотров', path: '0_docs/1_obshee/articles/07_istoriya-prohozhdeniya-osmotrov' },
          { title: 'Возможные результаты осмотров', path: '0_docs/1_obshee/articles/06_vozmozhnye-rezultaty-osmotrov' },
        ],
      },
      {
        title: 'Организации',
        path: '0_docs/1_obshee/articles/09_organizacii',
        children: [
          { title: 'Карточка организации', path: '0_docs/1_obshee/articles/10_kartochka-organizacii' },
          { title: 'Настройки организации', path: '0_docs/1_obshee/articles/11_nastroyki-organizacii' },
        ],
      },
      {
        title: 'Пользователи',
        path: '0_docs/1_obshee/articles/12_polzovateli',
        children: [
          { title: 'Карточка пользователя', path: '0_docs/1_obshee/articles/14_kartochka-polzovatelya' },
          { title: 'Создание пользователя', path: '0_docs/1_obshee/articles/15_sozdanie-polzovatelya' },
          { title: 'Профиль пользователя', path: '0_docs/1_obshee/articles/13_profil-polzovatelya' },
        ],
      },
      { title: 'Документы', path: '0_docs/1_obshee/articles/16_dokumenty' },
      {
        title: 'Отчёты',
        path: '0_docs/1_obshee/articles/17_otchety',
        children: [{ title: 'Действия с отчётами', path: '0_docs/1_obshee/articles/18_deystviya-s-otchetami' }],
      },
      { title: 'ПАК', path: '0_docs/1_obshee/articles/19_pak' },
      {
        title: 'Уведомления',
        path: '0_docs/1_obshee/articles/20_uvedomleniya',
        children: [
          { title: 'Создание подписки', path: '0_docs/1_obshee/articles/21_uvedomleniya-sozdanie-podpiski' },
          { title: 'Действия с подпиской', path: '0_docs/1_obshee/articles/22_uvedomleniya-deystviya-s-podpiskoy' },
          { title: 'Шаблоны', path: '0_docs/1_obshee/articles/23_uvedomleniya-shablony' },
          { title: 'Уведомления в Telegram', path: '0_docs/1_obshee/articles/24_uvedomleniya-telegram' },
        ],
      },
      { title: 'Частые вопросы', path: '0_docs/1_obshee/articles/25_chastye-voprosy' },
    ],
  },
  {
    title: 'Администрирование',
    path: '0_docs/2_admin/articles/00_main',
    children: [
      {
        title: 'Пользователи',
        path: '0_docs/2_admin/articles/01_polzovateli_00',
        children: [
          {
            title: 'Группы разрешений пользователей',
            path: '0_docs/2_admin/articles/01_polzovateli_01-gruppy-razresheniy-polzovateley',
          },
        ],
      },
      {
        title: 'Организации',
        path: '0_docs/2_admin/articles/02_organizacii_00',
        children: [
          {
            title: 'Действия с организацией',
            path: '0_docs/2_admin/articles/02_organizacii_01_deystviya-s-organizaciej',
          },
          {
            title: 'Настройки организации',
            path: '0_docs/2_admin/articles/02_organizacii_02_nastroyki-organizacii',
          },
        ],
      },
      { title: 'Осмотры', path: '0_docs/2_admin/articles/07_osmotry' },
      { title: 'ПАК', path: '0_docs/2_admin/articles/08_pak' },
      { title: 'Админпанель', path: '0_docs/2_admin/articles/09_adminpanel' },
      { title: 'Частые вопросы', path: '0_docs/2_admin/articles/10_FAQ' },
    ],
  },
  {
    title: 'Медкабинет',
    path: '0_docs/3_medkabinet/articles/00_main',
    children: [
      { title: 'Подготовка к работе и\u00A0авторизация', path: '0_docs/3_medkabinet/articles/01_podgotovka-i-avtorizaciya' },
      {
        title: 'Личный кабинет медицинского работника',
        path: '0_docs/3_medkabinet/articles/02_lichnyy-kabinet-medrabotnika',
        children: [
          { title: 'Работа с осмотром', path: '0_docs/3_medkabinet/articles/03_rabota-v-medkabinete' },
          { title: 'Вынесение заключения по\u00A0осмотру', path: '0_docs/3_medkabinet/articles/04_vynesenie-zaklyucheniya-po-osmotru' },
          { title: 'Регламент отстранения работников', path: '0_docs/3_medkabinet/articles/05_reglament-otstraneniya' },
        ],
      },
      { title: 'Разблокировка пользователя', path: '0_docs/3_medkabinet/articles/06_polzovateli' },
      { title: 'Документы', path: '0_docs/3_medkabinet/articles/07_dokumenty' },
      { title: 'Подпись', path: '0_docs/3_medkabinet/articles/08_podpis' },
      { title: 'Частые вопросы', path: '0_docs/3_medkabinet/articles/09_chastye-voprosy' },
      { title: 'Нормативная база', path: '0_docs/3_medkabinet/articles/10_normativnaya-baza' },
    ],
  },
  {
    title: 'Медадминистратор',
    path: '0_docs/4_medadmin/articles/00_main',
    children: [
      { title: 'Настройки медорганизации', path: '0_docs/4_medadmin/articles/01_nastroyki-medorganizacii' },
      { title: 'Уведомления о\u00A0неподписанных документах', path: '0_docs/4_medadmin/articles/02_uvedomleniya-o-nepodpisannyh-dokumentah' },
      { title: 'Переформирование документа', path: '0_docs/4_medadmin/articles/03_pereformirovanie-dokumenta' },
      { title: 'Статистика смен медработника', path: '0_docs/4_medadmin/articles/04_statistika-smen-medrabotnika' },
      { title: 'Управление сменой медработника', path: '0_docs/4_medadmin/articles/05_upravlenie-smenoy-medrabotnika' },
    ],
  },
]

/** Заглавные страницы верхних разделов (сетка карточек): те же пути, что у корней navTree с подстатьями */
export const docsTopSectionLandingPaths = new Set(
  navTree.filter((n) => n.children?.length).map((n) => n.path),
)

// Плоский список всех статей для «Предыдущая / Следующая»
export const flatArticles = [
  { title: 'Глоссарий', path: '0_docs/0_glossariy/user-guide' },
  { title: 'Термины и сокращения', path: '0_docs/0_glossariy/terminy-i-sokrashcheniya' },
  { title: 'Общее', path: '0_docs/1_obshee/articles/00_main' },
  { title: 'Авторизация в АРМ', path: '0_docs/1_obshee/articles/01_avtorizaciya-v-arm' },
  { title: 'Осмотры', path: '0_docs/1_obshee/articles/02_osmotry' },
  { title: 'Поиск осмотров', path: '0_docs/1_obshee/articles/03_poisk-osmotrov' },
  { title: 'Карточка осмотра', path: '0_docs/1_obshee/articles/08_kartochka-osmotra' },
  { title: 'Виды осмотров', path: '0_docs/1_obshee/articles/04_vidy-osmotrov' },
  { title: 'Серия осмотров', path: '0_docs/1_obshee/articles/05_seriya-osmotrov' },
  { title: 'История прохождения осмотров', path: '0_docs/1_obshee/articles/07_istoriya-prohozhdeniya-osmotrov' },
  { title: 'Возможные результаты осмотров', path: '0_docs/1_obshee/articles/06_vozmozhnye-rezultaty-osmotrov' },
  { title: 'Организации', path: '0_docs/1_obshee/articles/09_organizacii' },
  { title: 'Карточка организации', path: '0_docs/1_obshee/articles/10_kartochka-organizacii' },
  { title: 'Настройки организации', path: '0_docs/1_obshee/articles/11_nastroyki-organizacii' },
  { title: 'Пользователи', path: '0_docs/1_obshee/articles/12_polzovateli' },
  { title: 'Карточка пользователя', path: '0_docs/1_obshee/articles/14_kartochka-polzovatelya' },
  { title: 'Создание пользователя', path: '0_docs/1_obshee/articles/15_sozdanie-polzovatelya' },
  { title: 'Профиль пользователя', path: '0_docs/1_obshee/articles/13_profil-polzovatelya' },
  { title: 'Документы', path: '0_docs/1_obshee/articles/16_dokumenty' },
  { title: 'Отчёты', path: '0_docs/1_obshee/articles/17_otchety' },
  { title: 'Действия с отчётами', path: '0_docs/1_obshee/articles/18_deystviya-s-otchetami' },
  { title: 'ПАК', path: '0_docs/1_obshee/articles/19_pak' },
  { title: 'Уведомления', path: '0_docs/1_obshee/articles/20_uvedomleniya' },
  { title: 'Создание подписки', path: '0_docs/1_obshee/articles/21_uvedomleniya-sozdanie-podpiski' },
  { title: 'Действия с подпиской', path: '0_docs/1_obshee/articles/22_uvedomleniya-deystviya-s-podpiskoy' },
  { title: 'Шаблоны', path: '0_docs/1_obshee/articles/23_uvedomleniya-shablony' },
  { title: 'Уведомления в Telegram', path: '0_docs/1_obshee/articles/24_uvedomleniya-telegram' },
  { title: 'Частые вопросы', path: '0_docs/1_obshee/articles/25_chastye-voprosy' },
  { title: 'Администрирование', path: '0_docs/2_admin/articles/00_main' },
  { title: 'Пользователи', path: '0_docs/2_admin/articles/01_polzovateli_00' },
  {
    title: 'Группы разрешений пользователей',
    path: '0_docs/2_admin/articles/01_polzovateli_01-gruppy-razresheniy-polzovateley',
  },
  { title: 'Организации', path: '0_docs/2_admin/articles/02_organizacii_00' },
  {
    title: 'Действия с организацией',
    path: '0_docs/2_admin/articles/02_organizacii_01_deystviya-s-organizaciej',
  },
  {
    title: 'Настройки организации',
    path: '0_docs/2_admin/articles/02_organizacii_02_nastroyki-organizacii',
  },
  { title: 'Осмотры', path: '0_docs/2_admin/articles/07_osmotry' },
  { title: 'ПАК', path: '0_docs/2_admin/articles/08_pak' },
  { title: 'Админпанель', path: '0_docs/2_admin/articles/09_adminpanel' },
  { title: 'Частые вопросы', path: '0_docs/2_admin/articles/10_FAQ' },
  { title: 'Медкабинет', path: '0_docs/3_medkabinet/articles/00_main' },
  { title: 'Подготовка к работе и\u00A0авторизация', path: '0_docs/3_medkabinet/articles/01_podgotovka-i-avtorizaciya' },
  { title: 'Личный кабинет медицинского работника', path: '0_docs/3_medkabinet/articles/02_lichnyy-kabinet-medrabotnika' },
  { title: 'Работа с осмотром', path: '0_docs/3_medkabinet/articles/03_rabota-v-medkabinete' },
  { title: 'Вынесение заключения по осмотру', path: '0_docs/3_medkabinet/articles/04_vynesenie-zaklyucheniya-po-osmotru' },
  { title: 'Регламент отстранения работников', path: '0_docs/3_medkabinet/articles/05_reglament-otstraneniya' },
  { title: 'Разблокировка пользователя', path: '0_docs/3_medkabinet/articles/06_polzovateli' },
  { title: 'Документы', path: '0_docs/3_medkabinet/articles/07_dokumenty' },
  { title: 'Подпись', path: '0_docs/3_medkabinet/articles/08_podpis' },
  { title: 'Частые вопросы', path: '0_docs/3_medkabinet/articles/09_chastye-voprosy' },
  { title: 'Нормативная база', path: '0_docs/3_medkabinet/articles/10_normativnaya-baza' },
  { title: 'Медадминистратор', path: '0_docs/4_medadmin/articles/00_main' },
  { title: 'Настройки медорганизации', path: '0_docs/4_medadmin/articles/01_nastroyki-medorganizacii' },
  { title: 'Уведомления о\u00A0неподписанных документах', path: '0_docs/4_medadmin/articles/02_uvedomleniya-o-nepodpisannyh-dokumentah' },
  { title: 'Переформирование документа', path: '0_docs/4_medadmin/articles/03_pereformirovanie-dokumenta' },
  { title: 'Статистика смен медработника', path: '0_docs/4_medadmin/articles/04_statistika-smen-medrabotnika' },
  { title: 'Управление сменой медработника', path: '0_docs/4_medadmin/articles/05_upravlenie-smenoy-medrabotnika' },
]

/**
 * Пути узлов с детьми, которые нужно раскрыть, чтобы в дереве был виден slug.
 */
export function getExpandedNavKeys(tree, slug) {
  const keys = new Set()
  function walk(nodes) {
    for (const node of nodes) {
      if (node.path === slug) {
        /* Сама статья-родитель (например «Осмотры»): без ключа ветка остаётся свёрнутой, хотя у узла есть подстатьи */
        if (node.children?.length) keys.add(node.path)
        return true
      }
      if (node.children?.length) {
        if (walk(node.children)) {
          keys.add(node.path)
          return true
        }
      }
    }
    return false
  }
  for (const top of tree) {
    if (top.path === slug) {
      if (top.children?.length) keys.add(top.path)
      return keys
    }
    if (top.children?.length && walk(top.children)) {
      keys.add(top.path)
    }
  }
  return keys
}

/** Текущий slug относится к этому узлу или любому из потомков */
export function navSubtreeContains(item, slug) {
  if (item.path === slug) return true
  if (!item.children?.length) return false
  return item.children.some((c) => navSubtreeContains(c, slug))
}

/** Статья принадлежит дереву раздела (корень — путь корневого узла в navTree). */
export function articleUnderSectionRoot(articlePath, sectionRootPath) {
  if (!articlePath || !sectionRootPath) return false
  const root = navTree.find((n) => n.path === sectionRootPath)
  if (!root) return false
  return navSubtreeContains(root, articlePath)
}

/** Пути статей раздела в порядке «Предыдущая / Следующая» (для PDF-сборки). */
export function orderedPathsInSection(sectionRootPath) {
  if (!sectionRootPath) return []
  return flatArticles.filter((a) => articleUnderSectionRoot(a.path, sectionRootPath)).map((a) => a.path)
}
