import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'

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
    return (current as string) ?? path
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
  } catch {}
  const saved = window.localStorage.getItem('lang')
  if (saved === 'tr' || saved === 'en') return saved
  const nav = navigator.language?.toLowerCase() || 'tr'
  return nav.startsWith('tr') ? 'tr' : 'en'
}

// eslint-disable-next-line react-refresh/only-export-components
export const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string, params?: Record<string, unknown>) => string } | null>(null)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang())

  useEffect(() => {
    try { window.localStorage.setItem('lang', lang) } catch {}
  }, [lang])

  // Keep <html lang> and dir in sync with current language for a11y & SEO
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang)
        document.documentElement.setAttribute('dir', 'ltr')
      }
    } catch {}
  }, [lang])

  const setLang = React.useCallback((l: Lang) => setLangState(l), [])

  const t = useMemo(() => {
    return (key: string, params?: Record<string, unknown>) => interpolate(get(DICTS[lang], key), params)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
