import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Route değişiminde sayfayı anında en üste kaydırır.
 * useLayoutEffect kullanarak ilk boya (paint) öncesinde çalışır ve titremeyi azaltır.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    // Hash anchor varsa (/#section) scroll'u engellemeyelim
    if (window.location.hash) return
    // Instant scroll, smooth değil — gezinme sonrası titreme olmasın
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default ScrollToTop
