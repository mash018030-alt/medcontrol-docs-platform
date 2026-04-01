// Древовидная структура документации для левого меню
// path — путь для роута и загрузки файла (без .md)
export const navTree = [
  {
    title: 'Глоссарий',
    path: 'glossariy/user-guide',
    children: [{ title: 'Термины и сокращения', path: 'glossariy/terminy-i-sokrashcheniya' }],
  },
  {
    title: 'Общее',
    path: 'obshee/user-guide',
    children: [
      { title: 'Авторизация в АРМ', path: 'obshee/avtorizaciya-v-arm' },
      {
        title: 'Осмотры',
        path: 'obshee/osmotry',
        children: [
          { title: 'Поиск осмотров', path: 'obshee/poisk-osmotrov' },
          { title: 'Карточка осмотра', path: 'obshee/kartochka-osmotra' },
          { title: 'Виды осмотров', path: 'obshee/vidy-osmotrov' },
          { title: 'Серия осмотров', path: 'obshee/seriya-osmotrov' },
          { title: 'История прохождения осмотров', path: 'obshee/istoriya-prohozhdeniya-osmotrov' },
          { title: 'Возможные результаты осмотров', path: 'obshee/vozmozhnye-rezultaty-osmotrov' },
        ],
      },
      {
        title: 'Организации',
        path: 'obshee/organizacii',
        children: [
          { title: 'Карточка организации', path: 'obshee/kartochka-organizacii' },
          { title: 'Настройки организации', path: 'obshee/nastroyki-organizacii' },
        ],
      },
      {
        title: 'Пользователи',
        path: 'obshee/polzovateli',
        children: [
          { title: 'Карточка пользователя', path: 'obshee/kartochka-polzovatelya' },
          { title: 'Создание пользователя', path: 'obshee/sozdanie-polzovatelya' },
          { title: 'Профиль пользователя', path: 'obshee/profil-polzovatelya' },
        ],
      },
      { title: 'Документы', path: 'obshee/dokumenty' },
      {
        title: 'Отчёты',
        path: 'obshee/otchety',
        children: [{ title: 'Действия с отчётами', path: 'obshee/deystviya-s-otchetami' }],
      },
      { title: 'ПАК', path: 'obshee/pak' },
      {
        title: 'Уведомления',
        path: 'obshee/uvedomleniya',
        children: [
          { title: 'Создание подписки', path: 'obshee/uvedomleniya-sozdanie-podpiski' },
          { title: 'Действия с подпиской', path: 'obshee/uvedomleniya-deystviya-s-podpiskoy' },
          { title: 'Шаблоны', path: 'obshee/uvedomleniya-shablony' },
          { title: 'Уведомления в Telegram', path: 'obshee/uvedomleniya-telegram' },
        ],
      },
      { title: 'Частые вопросы', path: 'obshee/chastye-voprosy' },
    ],
  },
  {
    title: 'Администрирование',
    path: 'admin/user-guide',
    children: [
      {
        title: 'Пользователи',
        path: 'admin/polzovateli',
        children: [
          { title: 'Группы разрешений пользователей', path: 'admin/gruppy-razresheniy-polzovateley' },
        ],
      },
      {
        title: 'Организации',
        path: 'admin/organizacii',
        children: [
          { title: 'Действия с организацией', path: 'admin/deystviya-s-organizaciej' },
          { title: 'Настройки организации', path: 'admin/nastroyki-organizacii' },
        ],
      },
      { title: 'Осмотры', path: 'admin/osmotry' },
      { title: 'ПАК', path: 'admin/pak' },
      { title: 'Админпанель', path: 'admin/adminpanel' },
      { title: 'Частые вопросы', path: 'admin/chastye-voprosy' },
    ],
  },
  {
    title: 'Медкабинет',
    path: 'medkabinet/user-guide',
    children: [
      { title: 'Подготовка к работе и\u00A0авторизация', path: 'medkabinet/podgotovka-i-avtorizaciya' },
      {
        title: 'Личный кабинет медицинского работника',
        path: 'medkabinet/lichnyy-kabinet-medrabotnika',
        children: [
          { title: 'Работа с осмотром', path: 'medkabinet/rabota-v-medkabinete' },
          { title: 'Вынесение заключения по\u00A0осмотру', path: 'medkabinet/vynesenie-zaklyucheniya-po-osmotru' },
          { title: 'Регламент отстранения работников', path: 'medkabinet/reglament-otstraneniya' },
        ],
      },
      { title: 'Разблокировка пользователя', path: 'medkabinet/polzovateli' },
      { title: 'Документы', path: 'medkabinet/dokumenty' },
      { title: 'Подпись', path: 'medkabinet/podpis' },
      { title: 'Частые вопросы', path: 'medkabinet/chastye-voprosy' },
      { title: 'Нормативная база', path: 'medkabinet/normativnaya-baza' },
    ],
  },
  {
    title: 'Медадминистратор',
    path: 'medadmin/user-guide',
    children: [
      { title: 'Настройки медорганизации', path: 'medadmin/nastroyki-medorganizacii' },
      { title: 'Уведомления о\u00A0неподписанных документах', path: 'medadmin/uvedomleniya-o-nepodpisannyh-dokumentah' },
      { title: 'Переформирование документа', path: 'medadmin/pereformirovanie-dokumenta' },
      { title: 'Статистика смен медработника', path: 'medadmin/statistika-smen-medrabotnika' },
      { title: 'Управление сменой медработника', path: 'medadmin/upravlenie-smenoy-medrabotnika' },
    ],
  },
]

/** Заглавные страницы верхних разделов (сетка карточек): те же пути, что у корней navTree с подстатьями */
export const docsTopSectionLandingPaths = new Set(
  navTree.filter((n) => n.children?.length).map((n) => n.path),
)

// Плоский список всех статей для «Предыдущая / Следующая»
export const flatArticles = [
  { title: 'Глоссарий', path: 'glossariy/user-guide' },
  { title: 'Термины и сокращения', path: 'glossariy/terminy-i-sokrashcheniya' },
  { title: 'Общее', path: 'obshee/user-guide' },
  { title: 'Авторизация в АРМ', path: 'obshee/avtorizaciya-v-arm' },
  { title: 'Осмотры', path: 'obshee/osmotry' },
  { title: 'Поиск осмотров', path: 'obshee/poisk-osmotrov' },
  { title: 'Карточка осмотра', path: 'obshee/kartochka-osmotra' },
  { title: 'Виды осмотров', path: 'obshee/vidy-osmotrov' },
  { title: 'Серия осмотров', path: 'obshee/seriya-osmotrov' },
  { title: 'История прохождения осмотров', path: 'obshee/istoriya-prohozhdeniya-osmotrov' },
  { title: 'Возможные результаты осмотров', path: 'obshee/vozmozhnye-rezultaty-osmotrov' },
  { title: 'Организации', path: 'obshee/organizacii' },
  { title: 'Карточка организации', path: 'obshee/kartochka-organizacii' },
  { title: 'Настройки организации', path: 'obshee/nastroyki-organizacii' },
  { title: 'Пользователи', path: 'obshee/polzovateli' },
  { title: 'Карточка пользователя', path: 'obshee/kartochka-polzovatelya' },
  { title: 'Создание пользователя', path: 'obshee/sozdanie-polzovatelya' },
  { title: 'Профиль пользователя', path: 'obshee/profil-polzovatelya' },
  { title: 'Документы', path: 'obshee/dokumenty' },
  { title: 'Отчёты', path: 'obshee/otchety' },
  { title: 'Действия с отчётами', path: 'obshee/deystviya-s-otchetami' },
  { title: 'ПАК', path: 'obshee/pak' },
  { title: 'Уведомления', path: 'obshee/uvedomleniya' },
  { title: 'Создание подписки', path: 'obshee/uvedomleniya-sozdanie-podpiski' },
  { title: 'Действия с подпиской', path: 'obshee/uvedomleniya-deystviya-s-podpiskoy' },
  { title: 'Шаблоны', path: 'obshee/uvedomleniya-shablony' },
  { title: 'Уведомления в Telegram', path: 'obshee/uvedomleniya-telegram' },
  { title: 'Частые вопросы', path: 'obshee/chastye-voprosy' },
  { title: 'Администрирование', path: 'admin/user-guide' },
  { title: 'Пользователи', path: 'admin/polzovateli' },
  { title: 'Группы разрешений пользователей', path: 'admin/gruppy-razresheniy-polzovateley' },
  { title: 'Организации', path: 'admin/organizacii' },
  { title: 'Действия с организацией', path: 'admin/deystviya-s-organizaciej' },
  { title: 'Настройки организации', path: 'admin/nastroyki-organizacii' },
  { title: 'Осмотры', path: 'admin/osmotry' },
  { title: 'ПАК', path: 'admin/pak' },
  { title: 'Админпанель', path: 'admin/adminpanel' },
  { title: 'Частые вопросы', path: 'admin/chastye-voprosy' },
  { title: 'Медкабинет', path: 'medkabinet/user-guide' },
  { title: 'Подготовка к работе и\u00A0авторизация', path: 'medkabinet/podgotovka-i-avtorizaciya' },
  { title: 'Личный кабинет медицинского работника', path: 'medkabinet/lichnyy-kabinet-medrabotnika' },
  { title: 'Работа с осмотром', path: 'medkabinet/rabota-v-medkabinete' },
  { title: 'Вынесение заключения по осмотру', path: 'medkabinet/vynesenie-zaklyucheniya-po-osmotru' },
  { title: 'Регламент отстранения работников', path: 'medkabinet/reglament-otstraneniya' },
  { title: 'Разблокировка пользователя', path: 'medkabinet/polzovateli' },
  { title: 'Документы', path: 'medkabinet/dokumenty' },
  { title: 'Подпись', path: 'medkabinet/podpis' },
  { title: 'Частые вопросы', path: 'medkabinet/chastye-voprosy' },
  { title: 'Нормативная база', path: 'medkabinet/normativnaya-baza' },
  { title: 'Медадминистратор', path: 'medadmin/user-guide' },
  { title: 'Настройки медорганизации', path: 'medadmin/nastroyki-medorganizacii' },
  { title: 'Уведомления о\u00A0неподписанных документах', path: 'medadmin/uvedomleniya-o-nepodpisannyh-dokumentah' },
  { title: 'Переформирование документа', path: 'medadmin/pereformirovanie-dokumenta' },
  { title: 'Статистика смен медработника', path: 'medadmin/statistika-smen-medrabotnika' },
  { title: 'Управление сменой медработника', path: 'medadmin/upravlenie-smenoy-medrabotnika' },
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

/** Статья принадлежит дереву раздела (корень — путь вида obshee/user-guide). */
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
