'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const GAP = 12

const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ bottom: number; right: number }>({ bottom: 24, right: 24 })
  const { t } = useI18n()

  useEffect(() => {
    const onScroll = (_e: Event) => {
      const y = window.scrollY || document.documentElement.scrollTop
      setVisible(y > 400)
    }
    onScroll(new Event('scroll'))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const computePos = () => {
      const el = document.getElementById('language-switcher')
      if (el) {
        const rect = el.getBoundingClientRect()
        const bottomFromViewport = Math.max(16, window.innerHeight - rect.bottom)
        const rightToLeftEdge = window.innerWidth - rect.left
        // If there is enough horizontal space, place to the left of language switcher; otherwise stack above it.
        if (rect.left > 220) {
          setPos({ bottom: bottomFromViewport, right: rightToLeftEdge + GAP })
        } else {
          setPos({ bottom: bottomFromViewport + rect.height + GAP, right: 24 })
        }
      } else {
        setPos({ bottom: 24, right: 24 })
      }
    }
    computePos()
    window.addEventListener('resize', computePos)
    const id = setInterval(computePos, 500) // in case layout shifts late
    return () => {
      window.removeEventListener('resize', computePos)
      clearInterval(id)
    }
  }, [])

  return (
    <button
      aria-label={t('common.backToTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bg-primary-navy hover:bg-secondary-blue text-white p-3 rounded-full shadow-lg transition-shadow duration-300 z-40 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none invisible'}`}
      style={{ bottom: pos.bottom, right: pos.right }}
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



