'use client'

import React, { useContext, useEffect,useMemo, useState } from 'react'

import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'
import { getDictValue } from './getDictValue'
import { type AppDictionary, I18nContext, type Lang, type TranslationKeyInput } from './I18nContext'

export type { Lang }

type Dict = Record<string, unknown>
const DICTS: Record<Lang, Dict> = { en, tr }

function interpolate(str: string, params?: Record<string, unknown>): string {
  if (!params) return str
  return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, p1) => {
    const v = (params as Record<string, unknown>)[p1]
    return v === undefined || v === null ? '' : String(v)
  })
}

interface I18nProviderProps {
  children: React.ReactNode
  lang?: Lang
  dictionary?: AppDictionary
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  lang: initialLang, 
  dictionary 
}) => {
  const [lang, setLangState] = useState<Lang>(initialLang || 'tr')

  // Sync state if initialLang prop changes
  useEffect(() => {
    if (initialLang) {
      setLangState(initialLang)
    }
  }, [initialLang])

  // Initial detection on mount (Client-side only fallback if no initialLang)
  useEffect(() => {
    if (initialLang) return
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
  }, [initialLang])

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
    return (key: TranslationKeyInput, paramsOrAlt?: Record<string, unknown> | string) => {
      const currentDict = dictionary || (DICTS[lang] as AppDictionary)
      const translation = getDictValue(currentDict, key)
      const hasTranslation = translation !== key
      if (!hasTranslation && typeof paramsOrAlt === 'string') return paramsOrAlt
      return interpolate(translation, typeof paramsOrAlt === 'object' ? paramsOrAlt : undefined)
    }
  }, [lang, dictionary])

  const dict = useMemo(() => dictionary || (DICTS[lang] as AppDictionary), [lang, dictionary])
  const value = useMemo(() => ({ lang, setLang, t, dict }), [lang, setLang, t, dict])

  return (
    <I18nContext.Provider value={value}>
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
      t: (key: TranslationKeyInput, paramsOrAlt?: Record<string, unknown> | string) => {
        return typeof paramsOrAlt === 'string' ? paramsOrAlt : key
      },
      dict: tr as AppDictionary
    }
  }
  return ctx
}
