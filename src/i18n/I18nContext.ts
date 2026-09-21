import { createContext } from 'react'

/**
 * ⭐`import type` — BİLEREK. Admin sözlüğü buradan YALNIZ TİP olarak alınır; TypeScript
 * tip-only import'u derlemede tamamen siler, yani bu satır JS paketine BİR BAYT bile
 * eklemez. Ölçüldü (REC-59 Faz 2): `import` (değer) hâlinde admin sözlüğü müşteri
 * paketine giriyordu.
 *
 * Amaç: admin kodunda `t('admin.users.title')` yazarken otomatik tamamlama ve tip kontrolü
 * KAYBOLMASIN, ama çalışma zamanında sözlük yalnız admin ekranlarında yüklensin.
 */
import type { admin as adminTr } from './dictionaries/admin/tr'
import { tr } from './dictionaries/tr'

export type Lang = 'tr' | 'en'
export type AdminDictionary = typeof adminTr

/**
 * Vitrin sözlüğü + admin sözlüğü. Admin bölümü çalışma zamanında YALNIZ admin ekranlarında
 * doludur; vitrinde `dict.admin` TANIMSIZDIR. Vitrin kodunda `admin.*` anahtarı kullanmak
 * zaten yasak ve ayrı bir kapı bunu ölçüyor (INV-ADMIN-SOZLUK-1).
 */
export type AppDictionary = typeof tr & { admin?: AdminDictionary }

type NestedKeyOf<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`
}[keyof T & string]

export type TranslationKeys =
  | NestedKeyOf<typeof tr>
  | `admin.${NestedKeyOf<AdminDictionary>}`

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
    /**
     * Admin sözlüğünü o anki dil için yükler (dinamik import). Yalnız admin kabuğu çağırır;
     * vitrin hiç çağırmaz, bu yüzden admin sözlüğü vitrin paketine girmez.
     * Aynı dil için ikinci çağrı ağ isteği ÜRETMEZ (yüklenen sözlük bellekte tutulur).
     */
    ensureAdminDict: () => void
    /** Admin sözlüğü o anki dil için hazır mı. Admin kabuğu buna bakıp bekler. */
    adminDictReady: boolean
}

export const I18nContext = createContext<I18nContextType | null>(null)
