import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router ile sayfa geçişlerinde otomatik scroll to top sağlar
 * Smooth scroll davranışını koruyarak performanslı bir deneyim sunar
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // RAF kullanarak DOM güncellenene kadar bekle
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth' // Mevcut smooth scroll davranışını koru
      })
    }

    // Sayfa geçişinde kısa bir gecikme ile scroll
    // DOM'un render edilmesini bekle
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToTop)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [pathname]) // pathname değiştiğinde tetikle

  return null // UI render etmez
}

export default ScrollToTop