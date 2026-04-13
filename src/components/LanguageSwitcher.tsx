'use client'

import React from 'react'
import { useI18n } from '../i18n/I18nProvider'

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      id="language-switcher"
      className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
      role="group"
      aria-label={t('common.languageSwitcher')}
    >
      <button
        onClick={() => setLang('tr')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'tr' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'tr'}
        aria-label={t('common.turkish')}
      >TR</button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'en' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'en'}
        aria-label={t('common.english')}
      >EN</button>
    </div>
  )
}

export default LanguageSwitcher




