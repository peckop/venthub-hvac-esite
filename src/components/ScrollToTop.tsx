import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Route değişiminde sayfayı anında en üste kaydırır (Sadece PUSH aksiyonlarında).
 * Geri dönüşlerde (POP) tarayıcının native scroll restorasyonuna izin verir.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()
  const navType = useNavigationType()

  useLayoutEffect(() => {
    // Hash anchor varsa (/#section) scroll'u engellemeyelim
    if (window.location.hash) return

    // Eğer geri/ileri (POP) işlemiyse scroll'a dokunma, tarayıcı halletsin
    if (navType === 'POP') return

    // Instant scroll, smooth değil — gezinme sonrası titreme olmasın
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, navType])

  return null
}

export default ScrollToTop
