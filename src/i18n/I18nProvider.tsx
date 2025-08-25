import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'

type Dict = Record<string, any>
const DICTS: Record<Lang, Dict> = { en, tr }

function get(obj: Dict, path: string): string {
  try {
    return path.split('.').reduce((o: any, k: string) => (o ? o[k] : undefined), obj) ?? path
  } catch {
    return path
  }
}

function interpolate(str: string, params?: Record<string, any>): string {
  if (!params) return str
  return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, p1) => {
    const v = params[p1]
    return v === undefined || v === null ? '' : String(v)
  })
}

function detectDefaultLang(): Lang {
  if (typeof window === 'undefined') return 'tr'
  const saved = window.localStorage.getItem('lang')
  if (saved === 'tr' || saved === 'en') return saved
  const nav = navigator.language?.toLowerCase() || 'tr'
  return nav.startsWith('tr') ? 'tr' : 'en'
}

export const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string, params?: Record<string, any>) => string } | null>(null)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang())

  useEffect(() => {
    try { window.localStorage.setItem('lang', lang) } catch {}
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  const t = useMemo(() => {
    return (key: string, params?: Record<string, any>) => interpolate(get(DICTS[lang], key), params)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

