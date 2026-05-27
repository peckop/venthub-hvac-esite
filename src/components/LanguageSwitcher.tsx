'use client'

import React from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { usePathname, useRouter } from 'next/navigation'
import type { Route } from 'next'

const LanguageSwitcher: React.FC = () => {
  const { lang, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang: 'tr' | 'en') => {
    // İstemci tarafında cookie'yi güncelle (Middleware dil algılama kararlılığı için)
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`

    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]

    if (firstSegment === 'tr' || firstSegment === 'en') {
      segments[0] = newLang
      const newPath = '/' + segments.join('/')
      router.push(newPath as Route)
    } else {
      const newPath = '/' + newLang + (pathname === '/' ? '' : pathname)
      router.push(newPath as Route)
    }
  }

  return (
    <div
      id="language-switcher"
      className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
      role="group"
      aria-label={t('common.languageSwitcher')}
    >
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'tr' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'tr'}
        aria-label={t('common.turkish')}
      >TR</button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'en' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'en'}
        aria-label={t('common.english')}
      >EN</button>
    </div>
  )
}

export default LanguageSwitcher
