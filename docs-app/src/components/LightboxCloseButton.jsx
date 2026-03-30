import React from 'react'

/** Кнопка закрытия полноэкранного просмотра изображения (правый верхний угол). */
export default function LightboxCloseButton({ onClose }) {
  return (
    <button
      type="button"
      className="docs-lightbox-close"
      aria-label="Закрыть просмотр изображения"
      title="Закрыть"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <svg
        className="docs-lightbox-close__icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="square"
        />
      </svg>
    </button>
  )
}
