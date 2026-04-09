export function SectionCardIcon({ variant }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  switch (variant) {
    /* Общее — обзорная документация, руководство */
    case 'book-open':
      return (
        <svg {...common}>
          <path
            d="M2 4a2 2 0 0 1 2-2h5v18H4a2 2 0 0 1-2-2V4z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M22 4v12a2 2 0 0 1-2 2h-5V2h5a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
        </svg>
      )
    /* Администрирование — настройки, управление системой */
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.55" />
          <path
            d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      )
    /* Медкабинет — клинический / рабочее место врача */
    case 'stethoscope':
      return (
        <svg {...common}>
          <path
            d="M4.5 4.5V9a3.5 3.5 0 0 0 3.5 3.5h1.5a2.5 2.5 0 0 1 2.5 2.5v1"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 3.5h1a1 1 0 0 1 1 1V6"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="17.5" cy="17" r="3" stroke="currentColor" strokeWidth="1.55" />
          <path
            d="M12 14.5c1.8.5 3.2 1.6 4.2 3"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      )
    /* Медадминистратор — медорганизация, административный контур */
    case 'hospital':
      return (
        <svg {...common}>
          <path
            d="M4 21h16M8 21V10.5h8V21M8 10.5V7l4-2.5L16 7v3.5"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 4.5v4M10 6.5h4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </svg>
      )
    case 'megaphone':
      return (
        <svg {...common}>
          <path
            d="M4 10v4c0 1 0 2 1 2h2l5 3V5L7 8H5c-1 0-1 1-1 2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'ruble':
      return (
        <svg {...common}>
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fill="currentColor"
            fontSize="17"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
          >
            ₽
          </text>
        </svg>
      )
    case 'info':
    default:
      return (
        <svg {...common}>
          <path
            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </svg>
      )
  }
}
