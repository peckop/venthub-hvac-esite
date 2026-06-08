'use client'

import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { useI18n } from '../i18n/I18nProvider'

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang: 'tr' | 'en') => {
    if (lang === newLang) return

    // İstemci tarafında cookie'yi güncelle (Middleware dil algılama kararlılığı için)
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`

    // Local storage güncelle (I18nProvider fallback için)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lang', newLang)
      }
    } catch {}

    // İstemci tarafı state'ini anında güncelle (Buton ve client çevirileri için)
    setLang(newLang)

    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]

    let newPath = '/'
    if (firstSegment === 'tr' || firstSegment === 'en') {
      segments[0] = newLang
      newPath = '/' + segments.join('/')
    } else {
      newPath = '/' + newLang + (pathname === '/' ? '' : pathname)
    }

    // SPA akışını ve pürüzsüzlüğü koruyarak yönlendir ve sunucu cache'ini yenile
    router.push(newPath as Route)
    router.refresh()
  }

  return (
    <div
      id="language-switcher"
      className="bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
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
