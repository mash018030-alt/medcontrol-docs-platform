/**
 * Эксперимент: иконки на плитках заглавной страницы «Медадминистратор».
 * Для остальных разделов возвращается null — вёрстка как раньше.
 */
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.65,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function IconNastroyki() {
  return (
    <svg {...svgProps} aria-hidden>
      {/* Настройки / ползунки — медорганизация */}
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h4M9 8h4M17 16h4" />
    </svg>
  )
}

function IconUvedomleniya() {
  return (
    <svg {...svgProps} aria-hidden>
      <path d="M18 8A6 6 0 0 1 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconPereformirovanie() {
  return (
    <svg {...svgProps} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 14h8M8 18h5" />
      <path d="M20 6a7 7 0 0 1-1 3.9L17 11M20 6v4h-4" />
    </svg>
  )
}

function IconStatistika() {
  return (
    <svg {...svgProps} aria-hidden>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function IconSmena() {
  return (
    <svg {...svgProps} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

const MEDADMIN_ICONS = {
  'medadmin/nastroyki-medorganizacii': IconNastroyki,
  'medadmin/uvedomleniya-o-nepodpisannyh-dokumentah': IconUvedomleniya,
  'medadmin/pereformirovanie-dokumenta': IconPereformirovanie,
  'medadmin/statistika-smen-medrabotnika': IconStatistika,
  'medadmin/upravlenie-smenoy-medrabotnika': IconSmena,
}

export default function LandingTileIcon({ path }) {
  const Cmp = MEDADMIN_ICONS[path]
  if (!Cmp) return null
  return (
    <span className="docs-landing-tile-icon" aria-hidden>
      <Cmp />
    </span>
  )
}
