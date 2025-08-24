import React from 'react'
import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setVisible(y > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll as any)
  }, [])

  if (!visible) return null

  return (
    <button
      aria-label="Başa dön"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary-navy hover:bg-secondary-blue text-white p-3 rounded-full shadow-lg transition-all z-40 border border-white/20"
    >
      <ChevronUp size={20} />
    </button>
  )
}

export default BackToTopButton
