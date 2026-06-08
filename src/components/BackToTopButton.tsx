'use client'

import React from 'react'

import { useScrollThrottle } from '../hooks/useScrollThrottle'
import { useI18n } from '../i18n/I18nProvider'

const BackToTopButton: React.FC = () => {
  const { t } = useI18n()
  
  // requestAnimationFrame ve 16ms throttle ile korunan scroll dinleyicisi
  const visible: boolean = useScrollThrottle({ 
    showAt: 400, 
    hideBelow: 300, 
    throttleMs: 16 
  })

  const handleScrollToTop = (): void => {
    const isReduced: boolean = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: 0,
      behavior: isReduced ? 'auto' : 'smooth'
    })
    
    // Focus Reset: Klavye navigasyonu odağını ana içeriğe taşır (Erişilebilirlik)
    const mainContent: HTMLElement | null = document.getElementById('main-content')
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1')
      mainContent.focus({ preventScroll: true })
    }
  }

  return (
    <button
      aria-label={t('common.backToTop')}
      onClick={handleScrollToTop}
      className={`bg-primary-navy hover:bg-secondary-blue text-white p-3 rounded-full shadow-lg transition-all duration-300 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none invisible'
      }`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default BackToTopButton



