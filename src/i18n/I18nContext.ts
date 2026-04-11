import { createContext } from 'react'
import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'
export type AppDictionary = typeof tr

export interface I18nContextType {
    lang: Lang
    setLang: (l: Lang) => void
    t: (key: string, paramsOrAlt?: Record<string, unknown> | string) => string
    dict: AppDictionary
}

export const I18nContext = createContext<I18nContextType | null>(null)
