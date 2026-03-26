import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { scrollToIdAfterReveal } from '../utils/revealCitationTarget'
import { quietHashSpy } from './useArticleHashScroll'

/**
 * Стрелка «назад к тексту» из блока сносок: браузерная прокрутка по # не открывает <details>.
 * Перехватываем клик, раскрываем все вложенные аккордеоны, синхронизируем hash и прокручиваем.
 */
export function useFootnoteBackrefClick(articleBodyRef, enabled, contentKey = '') {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!enabled) return
    const root = articleBodyRef.current
    if (!root) return

    const onClick = (e) => {
      const a = e.target?.closest?.('a')
      if (!a || !root.contains(a)) return
      const href = a.getAttribute('href')
      if (!href) return
      const isGfmBackref =
        href.startsWith('#user-content-fnref-')
      const isManualBackref = href.startsWith('#ftnt_back')
      if (!isGfmBackref && !isManualBackref) return

      e.preventDefault()
      e.stopPropagation()

      const id = decodeURIComponent(href.slice(1))
      quietHashSpy()
      navigate(
        { pathname: location.pathname, search: location.search, hash: href },
        { replace: true, preventScrollReset: true },
      )
      scrollToIdAfterReveal(id, { behavior: 'smooth' })
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [articleBodyRef, enabled, contentKey, navigate, location.pathname, location.search])
}
