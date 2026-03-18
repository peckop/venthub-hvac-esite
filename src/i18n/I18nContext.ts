import { createContext } from 'react'

export type Lang = 'tr' | 'en'

export interface I18nContextType {
    lang: Lang
    setLang: (l: Lang) => void
    t: (key: string, paramsOrAlt?: Record<string, unknown> | string) => string
}

export const I18nContext = createContext<I18nContextType | null>(null)



