import React, { useContext, useMemo, useState, useEffect } from 'react'
import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'

import { I18nContext, type Lang } from './I18nContext'

export type { Lang }


type Dict = Record<string, unknown>
const DICTS: Record<Lang, Dict> = { en, tr }

function get(obj: Dict, path: string): string {
  try {
    const keys = path.split('.')
    let current: unknown = obj
    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k]
      } else {
        current = undefined
        break
      }
    }
    
    // Safety check: React cannot render objects as children
    if (typeof current === 'string') {
      return current
    }
    
    if (typeof current === 'number' || typeof current === 'boolean') {
      return String(current)
    }

    // If it's an object or undefined, return the path itself to avoid "Objects are not valid as a React child"
    return path
  } catch {
    return path
  }
}

function interpolate(str: string, params?: Record<string, unknown>): string {
  if (!params) return str
  return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, p1) => {
    const v = (params as Record<string, unknown>)[p1]
    return v === undefined || v === null ? '' : String(v)
  })
}

function detectDefaultLang(): Lang {
  if (typeof window === 'undefined') return 'tr'
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('lang')
    if (fromUrl === 'tr' || fromUrl === 'en') {
      return fromUrl
    }
  } catch { }
  const saved = window.localStorage.getItem('lang')
  if (saved === 'tr' || saved === 'en') return saved
  const nav = navigator.language?.toLowerCase() || 'tr'
  return nav.startsWith('tr') ? 'tr' : 'en'
}



export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang())

  useEffect(() => {
    try { window.localStorage.setItem('lang', lang) } catch { }
  }, [lang])

  // Keep <html lang> and dir in sync with current language for a11y & SEO
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang)
        document.documentElement.setAttribute('dir', 'ltr')
      }
    } catch { }
  }, [lang])

  const setLang = React.useCallback((l: Lang) => setLangState(l), [])

  const t = useMemo(() => {
    return (key: string, paramsOrAlt?: Record<string, any> | string) => {
      const translation = get(DICTS[lang], key)
      const hasTranslation = translation !== key
      
      if (!hasTranslation && typeof paramsOrAlt === 'string') {
        return paramsOrAlt
      }
      
      return interpolate(translation, typeof paramsOrAlt === 'object' ? paramsOrAlt : undefined)
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Statik build sırasında veya sağlayıcı dışındaki kullanımlarda hata fırlatmak yerine güvenli bir geri dönüş sağla
    return {
      lang: 'tr' as Lang,
      setLang: () => { },
      t: (key: string, paramsOrAlt?: Record<string, any> | string) => {
        return typeof paramsOrAlt === 'string' ? paramsOrAlt : key
      }
    }
  }
  return ctx
}



