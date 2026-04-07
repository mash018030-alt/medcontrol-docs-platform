/**
 * Карточки главной документации.
 * sectionPath — корень раздела в nav (переход по клику на карточку).
 *
 * Иконки: репозиторий контента, `images/dashboards/0_main/*.png` (см. medcontrol-docs-content).
 */
const DASHBOARD_SECTION_PATHS = new Set()

const DASHBOARD_MAIN_ICONS = '/content/images/dashboards/0_main'

export const docsDashboardSections = [
  {
    title: 'Глоссарий',
    description:
      'Словарь терминов, сокращений и сущностей платформы MedControl: роли, документы, осмотры, ПАК, подписи и другие базовые понятия',
    iconSrc: `${DASHBOARD_MAIN_ICONS}/glossary.png`,
    sectionPath: '0_docs/0_glossariy/user_guide',
    sectionPdfBundle: true,
  },
  {
    title: 'Общее',
    description:
      'Общее руководство по работе в АРМ: осмотры, организации, пользователи, документы, отчёты, ПАК и уведомления',
    iconSrc: `${DASHBOARD_MAIN_ICONS}/main.png`,
    sectionPath: '0_docs/1_obshee/articles/00_main',
    sectionPdfBundle: true,
  },
  {
    title: 'Администрирование',
    description:
      'Описание ролей, групп разрешений и доступных действий в системе: работа с пользователями, организациями, ПАК, документами, подписками и медданными',
    iconSrc: `${DASHBOARD_MAIN_ICONS}/admin.png`,
    sectionPath: '0_docs/2_admin/articles/00_main',
    sectionPdfBundle: true,
  },
  {
    title: 'Медкабинет',
    description:
      'Руководство для медработников по проведению и обработке осмотров, вынесению заключений, работе с сериями осмотров, документами и блокировками пользователей',
    iconSrc: `${DASHBOARD_MAIN_ICONS}/medcab.png`,
    sectionPath: '0_docs/3_medkabinet/articles/00_main',
    sectionPdfBundle: true,
  },
  {
    title: 'Медадминистратор',
    description:
      'Расширенный функционал для медадминистратора: настройка нежелательных событий и целевых показателей, работа с неподписанными документами и контроль смен медработников',
    iconSrc: `${DASHBOARD_MAIN_ICONS}/medadmin.png`,
    sectionPath: '0_docs/4_medadmin/articles/00_main',
    sectionPdfBundle: true,
  },
]

for (const s of docsDashboardSections) {
  DASHBOARD_SECTION_PATHS.add(s.sectionPath)
}

/** Валидный путь раздела дашборда из query (?section=…) */
export function normalizeDashboardSectionParam(raw) {
  if (!raw || typeof raw !== 'string') return null
  try {
    const p = decodeURIComponent(raw.trim())
    return DASHBOARD_SECTION_PATHS.has(p) ? p : null
  } catch {
    return null
  }
}

export function getDashboardSectionMeta(sectionPath) {
  return docsDashboardSections.find((s) => s.sectionPath === sectionPath) ?? null
}
