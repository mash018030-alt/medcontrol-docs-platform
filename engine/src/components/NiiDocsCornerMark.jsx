import { Link } from 'react-router-dom'

/**
 * Постоянная метка платформы в правом нижнем углу (нейтральный стиль).
 * Ведёт на корень приложения — тот же origin, что и у страницы.
 */
export default function NiiDocsCornerMark() {
  return (
    <Link
      to="/"
      className="docs-nii-corner-mark"
      aria-label="На главную платформы НИИ_Docs"
    >
      <span className="docs-nii-corner-mark__nii">НИИ</span>
      <span className="docs-nii-corner-mark__underscore" aria-hidden>
        _
      </span>
      <span className="docs-nii-corner-mark__docs">Docs</span>
    </Link>
  )
}
