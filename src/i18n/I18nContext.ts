import { createContext } from 'react'

export type Lang = 'tr' | 'en'

export interface I18nContextType {
    lang: Lang
    setLang: (l: Lang) => void
    t: (key: string, params?: Record<string, unknown>) => string
}

export const I18nContext = createContext<I18nContextType | null>(null)
