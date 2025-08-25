import React from 'react'
import { useI18n } from '../i18n/I18nProvider'

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useI18n()
  return (
    <div id="language-switcher" className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1">
      <button
        onClick={() => setLang('tr')}
        className={`px-3 py-1 text-sm rounded-full ${lang === 'tr' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'tr'}
      >TR</button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 text-sm rounded-full ${lang === 'en' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'en'}
      >EN</button>
    </div>
  )
}

export default LanguageSwitcher

