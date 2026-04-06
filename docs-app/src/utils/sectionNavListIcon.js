import {
  Folder,
  FileText,
  Stethoscope,
  Building2,
  Users,
  BarChart3,
  Monitor,
  Bell,
  HelpCircle,
  Shield,
  KeyRound,
  PenLine,
  BookOpen,
  ClipboardList,
  UserCircle,
  Wrench,
} from 'lucide-react'

/** @param {string} path */
function lo(path) {
  return String(path || '').toLowerCase()
}

/**
 * Иконка пункта разводящего списка: ветка — папка; лист — по смыслу пути.
 * @param {string} path
 * @param {boolean} hasChildren
 */
export function resolveSectionNavListIcon(path, hasChildren) {
  if (hasChildren) return Folder
  const s = lo(path)
  if (/avtorizac|podgotovka.*avtoriz|podgotovka-i-avtoriz/.test(s)) return KeyRound
  if (/termin|glossariy|sokrashch/.test(s)) return BookOpen
  if (/normativ/.test(s)) return BookOpen
  if (
    /osmotr|zaklyuchen|medkabinet|rabota-v-med|reglament-otstran|poisk-osmotr|kartochka-osmotr|vidy-osmotr|seriya-osmotr|istoriya-prohozhdeniya|vozmozhnye-rezultaty|07_osmotry/.test(
      s,
    )
  ) {
    return Stethoscope
  }
  if (/organizac|medorganizac|deystviya-s-organizac|nastroyki-organizac|02_organizacii/.test(s)) return Building2
  if (
    /polzovatel|razblokirov|gruppy-razreshen|smen-medrabotnik|upravlenie-smenoy|statistika-smen|01_polzovateli/.test(s)
  ) {
    return Users
  }
  if (s.includes('nepodpis') || /pereformirovan|\/dokumenty?$|dokumenty-/.test(s)) return FileText
  if (/\/podpis$|\/podpis\//.test(s) || s.endsWith('/podpis')) return PenLine
  if (/otchet|deystviya-s-otchet/.test(s)) return BarChart3
  if (/\/pak$|_pak|08_pak/.test(s)) return Monitor
  if (/uvedomlen|podpisk|shablon|telegram/.test(s)) return Bell
  if (/chasty|faq|vopros|10_faq/.test(s)) return HelpCircle
  if (/adminpanel|09_adminpanel|gruppy-razresheniy-polzovateley/.test(s)) return Shield
  if (/lichnyy-kabinet/.test(s)) return UserCircle
  if (/reglament/.test(s)) return ClipboardList
  if (/nastroyki-medorganizacii/.test(s)) return Wrench
  return FileText
}
