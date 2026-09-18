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

/**
 * ⛔`dictionary` PROP'U KASITLI OLARAK YOK — bu bir eksiklik değil, ölçülmüş bir onarım.
 *
 * Bu bileşen `'use client'` olduğu için ona verilen her prop RSC yükünde serileşir. Eskiden
 * `src/app/[lang]/layout.tsx` sözlüğün TAMAMINI prop olarak geçiriyordu ve sonuç canlıda
 * ölçüldü (2026-09-18): ürün sayfasının %65,3'ü, kategori sayfasının %61,7'si gömülü sözlüktü
 * (~196 KB), admin bölümünün 1008 anahtarı dahil. Prop gereksizdi çünkü sözlükler aşağıda
 * modül düzeyinde zaten duruyor ve `lang` prop'u ilk render'da doğru dili veriyor.
 *
 * Prop tipten de çıkarıldı ki kapı TypeScript'in kendisi olsun: biri yeniden geçirmeye kalkarsa
 * derleme hatası alır. Ayrıca INV-SOZLUK-RSC-1 kolu layout kaynağını okuyup bu geçişi arar.
 */
interface I18nProviderProps {
  children: React.ReactNode
  lang?: Lang
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  lang: initialLang
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
      const currentDict = DICTS[lang] as AppDictionary
      const translation = getDictValue(currentDict, key)
      const hasTranslation = translation !== key
      if (!hasTranslation && typeof paramsOrAlt === 'string') return paramsOrAlt
      return interpolate(translation, typeof paramsOrAlt === 'object' ? paramsOrAlt : undefined)
    }
  }, [lang])

  const dict = useMemo(() => DICTS[lang] as AppDictionary, [lang])
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
