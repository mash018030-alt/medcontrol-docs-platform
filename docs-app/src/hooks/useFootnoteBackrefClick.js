import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { scrollToIdAfterReveal, decodeHashFragment } from '../utils/revealCitationTarget'
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

      quietHashSpy()
      const rawId = decodeHashFragment(href.slice(1))
      const locFrag = location.hash.startsWith('#') ? decodeHashFragment(location.hash.slice(1)) : ''
      if (locFrag && locFrag === rawId) {
        scrollToIdAfterReveal(rawId, { behavior: 'smooth' })
        return
      }
      const to = `${location.pathname}${location.search}${href.startsWith('#') ? href : `#${href}`}`
      navigate(to, { replace: true, preventScrollReset: true })
      /* Прокрутку делает useLayoutEffect(useArticleHashScroll), без второго smooth из TOC-lock */
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [articleBodyRef, enabled, contentKey, navigate, location.pathname, location.search, location.hash])
}
