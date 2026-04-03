/**
 * Карточки главной документации.
 * sectionPath — корень раздела в nav (переход по клику на карточку).
 */
const DASHBOARD_SECTION_PATHS = new Set()

export const docsDashboardSections = [
  {
    title: 'Глоссарий',
    description:
      'Словарь терминов, сокращений и сущностей платформы MedControl: роли, документы, осмотры, ПАК, подписи и другие базовые понятия',
    iconSrc: '/content/icons/dashboard/glossary.png',
    sectionPath: 'glossariy/user-guide',
    sectionPdfBundle: true,
  },
  {
    title: 'Общее',
    description:
      'Общее руководство по работе в АРМ: осмотры, организации, пользователи, документы, отчёты, ПАК и уведомления',
    iconSrc: '/content/icons/dashboard/main.png',
    sectionPath: 'obshee/user-guide',
    sectionPdfBundle: true,
  },
  {
    title: 'Администрирование',
    description:
      'Описание ролей, групп разрешений и доступных действий в системе: работа с пользователями, организациями, ПАК, документами, подписками и медданными',
    iconSrc: '/content/icons/dashboard/admin.png',
    sectionPath: 'admin/user-guide',
    sectionPdfBundle: true,
  },
  {
    title: 'Медкабинет',
    description:
      'Руководство для медработников по проведению и обработке осмотров, вынесению заключений, работе с сериями осмотров, документами и блокировками пользователей',
    iconSrc: '/content/icons/dashboard/medcab.png',
    sectionPath: 'medkabinet/user-guide',
    sectionPdfBundle: true,
  },
  {
    title: 'Медадминистратор',
    description:
      'Расширенный функционал для медадминистратора: настройка нежелательных событий и целевых показателей, работа с неподписанными документами и контроль смен медработников',
    iconSrc: '/content/icons/dashboard/medadmin.png',
    sectionPath: 'medadmin/user-guide',
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
