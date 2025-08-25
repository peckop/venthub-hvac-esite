import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'

const DICTS: Record<Lang, any> = { en, tr }

function get(obj: any, path: string): string {
  try {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) ?? path
  } catch {
    return path
  }
}

function detectDefaultLang(): Lang {
  if (typeof window === 'undefined') return 'tr'
  const saved = window.localStorage.getItem('lang')
  if (saved === 'tr' || saved === 'en') return saved
  const nav = navigator.language?.toLowerCase() || 'tr'
  return nav.startsWith('tr') ? 'tr' : 'en'
}

export const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string } | null>(null)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang())

  useEffect(() => {
    try { window.localStorage.setItem('lang', lang) } catch {}
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  const t = useMemo(() => {
    return (key: string) => get(DICTS[lang], key)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

