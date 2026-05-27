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
    if (lang === newLang) return

    // İstemci tarafında cookie'yi güncelle (Middleware dil algılama kararlılığı için)
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`

    // URL'deki dil segmentini değiştirerek yönlendir
    if (pathname.startsWith(`/${lang}`)) {
      const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
      router.push(newPath as Route)
    } else {
      router.push(`/${newLang}${pathname}` as Route)
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
