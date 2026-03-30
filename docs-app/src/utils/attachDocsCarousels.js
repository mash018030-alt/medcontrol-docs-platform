/**
 * Подключает точки, стрелки и горизонтальный свайп по области слайдов для .docs-carousel внутри root.
 * @param {HTMLElement | null} rootEl
 * @returns {() => void} detach — снять слушатели
 */
function ensureCarouselHasCheckedRadio(carousel) {
  const radios = carousel.querySelectorAll('input[type="radio"]')
  if (radios.length === 0) return
  const any = Array.from(radios).some((r) => r.checked)
  if (!any) {
    radios[0].checked = true
  }
}

export function attachDocsCarousels(rootEl) {
  const attached = []
  const swipeTimeouts = []

  if (!rootEl) {
    return () => {}
  }

  const updateEdgeArrows = (carousel) => {
    const radios = carousel.querySelectorAll('input[type="radio"]')
    const arrowPrev = carousel.querySelector('.docs-carousel-arrow-prev')
    const arrowNext = carousel.querySelector('.docs-carousel-arrow-next')
    const n = radios.length
    if (n === 0) return
    let i = Array.from(radios).findIndex((r) => r.checked)
    if (i < 0) i = 0
    const atFirst = i <= 0
    const atLast = i >= n - 1
    if (arrowPrev) {
      arrowPrev.classList.toggle('docs-carousel-arrow--hidden', atFirst)
      arrowPrev.setAttribute('tabindex', atFirst ? '-1' : '0')
    }
    if (arrowNext) {
      arrowNext.classList.toggle('docs-carousel-arrow--hidden', atLast)
      arrowNext.setAttribute('tabindex', atLast ? '-1' : '0')
    }
  }

  rootEl.querySelectorAll('.docs-carousel').forEach((carousel) => {
    ensureCarouselHasCheckedRadio(carousel)
    const radios = carousel.querySelectorAll('input[type="radio"]')
    const labels = carousel.querySelectorAll('.docs-carousel-dots label')
    const arrowPrev = carousel.querySelector('.docs-carousel-arrow-prev')
    const arrowNext = carousel.querySelector('.docs-carousel-arrow-next')
    const slides = carousel.querySelector('.docs-carousel-slides')
    const n = radios.length

    const goTo = (idx) => (e) => {
      e.preventDefault()
      if (radios[idx]) radios[idx].checked = true
      updateEdgeArrows(carousel)
    }
    labels.forEach((lbl, idx) => {
      const handler = goTo(idx)
      lbl.addEventListener('click', handler)
      attached.push({ el: lbl, type: 'click', handler })
    })

    const onSlideChange = () => updateEdgeArrows(carousel)
    radios.forEach((radio) => {
      radio.addEventListener('change', onSlideChange)
      attached.push({ el: radio, type: 'change', handler: onSlideChange })
    })

    if (arrowPrev && n > 0) {
      const goPrev = (e) => {
        e.preventDefault()
        const i = Array.from(radios).findIndex((r) => r.checked)
        if (i <= 0) return
        if (radios[i - 1]) radios[i - 1].checked = true
        updateEdgeArrows(carousel)
      }
      arrowPrev.addEventListener('click', goPrev)
      attached.push({ el: arrowPrev, type: 'click', handler: goPrev })
    }
    if (arrowNext && n > 0) {
      const goNext = (e) => {
        e.preventDefault()
        const i = Array.from(radios).findIndex((r) => r.checked)
        if (i < 0 || i >= n - 1) return
        if (radios[i + 1]) radios[i + 1].checked = true
        updateEdgeArrows(carousel)
      }
      arrowNext.addEventListener('click', goNext)
      attached.push({ el: arrowNext, type: 'click', handler: goNext })
    }

    if (slides && n > 1) {
      const SWIPE_MIN_PX = 44
      const markSwipeSuppress = () => {
        carousel.dataset.docsCarouselSwipeJustNow = '1'
        const tid = window.setTimeout(() => {
          delete carousel.dataset.docsCarouselSwipeJustNow
        }, 380)
        swipeTimeouts.push(tid)
      }

      let startX = 0
      let startY = 0
      let tracking = false

      const onTouchStart = (e) => {
        if (e.touches.length !== 1) return
        tracking = true
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }

      const onTouchEnd = (e) => {
        if (!tracking) return
        tracking = false
        const t = e.changedTouches[0]
        if (!t) return
        const dx = t.clientX - startX
        const dy = t.clientY - startY
        if (Math.abs(dx) < SWIPE_MIN_PX) return
        if (Math.abs(dx) < Math.abs(dy)) return

        const i = Array.from(radios).findIndex((r) => r.checked)
        if (i < 0) return

        if (dx < 0 && i < n - 1) {
          markSwipeSuppress()
          radios[i + 1].checked = true
          updateEdgeArrows(carousel)
        } else if (dx > 0 && i > 0) {
          markSwipeSuppress()
          radios[i - 1].checked = true
          updateEdgeArrows(carousel)
        }
      }

      slides.addEventListener('touchstart', onTouchStart, { passive: true })
      slides.addEventListener('touchend', onTouchEnd, { passive: true })
      attached.push({ el: slides, type: 'touchstart', handler: onTouchStart })
      attached.push({ el: slides, type: 'touchend', handler: onTouchEnd })
    }

    updateEdgeArrows(carousel)
    requestAnimationFrame(() => {
      ensureCarouselHasCheckedRadio(carousel)
      updateEdgeArrows(carousel)
    })
  })

  return () => {
    attached.forEach(({ el, type, handler }) => el.removeEventListener(type, handler))
    swipeTimeouts.forEach((tid) => window.clearTimeout(tid))
  }
}
