'use client'

import React, { useContext, useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
    if (typeof current === 'string') return current
    if (typeof current === 'number' || typeof current === 'boolean') return String(current)
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

/**
 * URL'deki lang parametresini izleyen yardımcı bileşen.
 * useSearchParams() kullandığı için Suspense içinde tutulmalıdır.
 */
function LanguageUrlWatcher({ onLangChange }: { onLangChange: (l: Lang) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const fromUrl = searchParams?.get('lang')
    if (fromUrl === 'tr' || fromUrl === 'en') {
      onLangChange(fromUrl as Lang)
    }
  }, [searchParams, onLangChange])

  return null
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('tr')

  // Initial detection on mount (Client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang')
      if (saved === 'tr' || saved === 'en') {
        setLangState(saved as Lang)
      } else {
        const nav = navigator.language?.toLowerCase() || 'tr'
        setLangState(nav.startsWith('tr') ? 'tr' : 'en')
      }
    } catch {
      setLangState('tr')
    }
  }, [])

  useEffect(() => {
    try { 
      window.localStorage.setItem('lang', lang) 
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
      if (!hasTranslation && typeof paramsOrAlt === 'string') return paramsOrAlt
      return interpolate(translation, typeof paramsOrAlt === 'object' ? paramsOrAlt : undefined)
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <I18nContext.Provider value={value}>
      <Suspense fallback={null}>
        <LanguageUrlWatcher onLangChange={setLang} />
      </Suspense>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
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
