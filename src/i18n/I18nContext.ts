import { createContext } from 'react'

import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'
export type AppDictionary = typeof tr

type NestedKeyOf<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`
}[keyof T & string]

export type TranslationKeys = NestedKeyOf<typeof tr>

/**
 * Geçiş stratejisi: Autocomplete sağlar ama henüz sözlükte olmayan
 * string literal anahtarları da kabul eder.
 */
export type TranslationKeyInput = TranslationKeys | (string & Record<never, never>)

export interface I18nContextType {
    lang: Lang
    setLang: (l: Lang) => void
    t: (key: TranslationKeyInput, paramsOrAlt?: Record<string, unknown> | string) => string
    dict: AppDictionary
}

export const I18nContext = createContext<I18nContextType | null>(null)
