'use client'

import React, { useCallback, useContext, useEffect,useMemo, useState } from 'react'

import { en } from './dictionaries/en'
import { tr } from './dictionaries/tr'
import { getDictValue } from './getDictValue'
import { type AdminDictionary,type AppDictionary, I18nContext, type Lang, type TranslationKeyInput } from './I18nContext'

export type { Lang }

type Dict = Record<string, unknown>
const DICTS: Record<Lang, Dict> = { en, tr }

/**
 * ⭐ADMIN SÖZLÜĞÜ DİNAMİK YÜKLENİR (REC-59 Faz 2, karar 47).
 *
 * NİÇİN: admin sözlüğü vitrin sözlüğünün içinde statik duruyordu ve her müşteri sayfasının
 * indirdiği pakete giriyordu — canlıda ölçüldü (2026-09-18): `static/chunks/7681-*.js`
 * 356.040 bayt, ana sayfa bunu indiriyordu; içinde "Kuponlar", "Stok Hareketleri",
 * "Denetim Kaydı" gibi müşterinin ASLA görmeyeceği yazılar vardı.
 *
 * `import()` çağrısı webpack'e ayrı parça ürettirir; o parça yalnız bu fonksiyon çağrılınca
 * indirilir ve fonksiyonu YALNIZ admin kabuğu çağırır.
 *
 * ⛔Bu iki satırı statik `import` hâline getirmek, ayrımı sessizce geri alır: kod derlenir,
 * tipler geçer, ekranlar doğru çalışır — yalnız paket yeniden şişer. Kapı:
 * `src/i18n/__tests__/admin-sozlugu-vitrin-paketine-girmez.test.ts` (INV-ADMIN-SOZLUK-2).
 */
async function adminSozluguGetir(lang: Lang): Promise<AdminDictionary> {
  if (lang === 'en') return (await import('./dictionaries/admin/en')).admin as AdminDictionary
  return (await import('./dictionaries/admin/tr')).admin as AdminDictionary
}

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

  /**
   * Yüklenmiş admin sözlükleri, DİL BAŞINA. Dil değişince o dilin sözlüğü bir kez daha
   * indirilir; ikinci kez aynı dile dönülürse ağ isteği yapılmaz (burada duruyor).
   */
  const [adminSozlukler, setAdminSozlukler] = useState<Partial<Record<Lang, AdminDictionary>>>({})
  const [adminYukleniyor, setAdminYukleniyor] = useState(false)

  const ensureAdminDict = useCallback(() => {
    if (adminSozlukler[lang] || adminYukleniyor) return
    setAdminYukleniyor(true)
    let iptal = false
    adminSozluguGetir(lang)
      .then(sozluk => {
        if (iptal) return
        setAdminSozlukler(onceki => ({ ...onceki, [lang]: sozluk }))
      })
      .catch(() => {
        /*
          Yükleme düşerse (ağ yok, parça 404) SESSİZ KALMAZ: admin kabuğu `adminDictReady`
          false kaldığı için beklemeye devam eder ve kendi hata yolunu gösterir. Burada
          ekrana yazı basmıyoruz çünkü bu katmanın dili yok — yazıyı gösterecek sözlük tam
          da yüklenemeyen şey.
        */
      })
      .finally(() => { if (!iptal) setAdminYukleniyor(false) })
    return () => { iptal = true }
  }, [lang, adminSozlukler, adminYukleniyor])

  const t = useMemo(() => {
    return (key: TranslationKeyInput, paramsOrAlt?: Record<string, unknown> | string) => {
      const temel = DICTS[lang] as AppDictionary
      const adminSozluk = adminSozlukler[lang]
      const currentDict = (adminSozluk ? { ...temel, admin: adminSozluk } : temel) as AppDictionary
      const translation = getDictValue(currentDict, key)
      const hasTranslation = translation !== key
      if (!hasTranslation && typeof paramsOrAlt === 'string') return paramsOrAlt
      return interpolate(translation, typeof paramsOrAlt === 'object' ? paramsOrAlt : undefined)
    }
  }, [lang, adminSozlukler])

  const dict = useMemo(() => {
    const temel = DICTS[lang] as AppDictionary
    const adminSozluk = adminSozlukler[lang]
    return (adminSozluk ? { ...temel, admin: adminSozluk } : temel) as AppDictionary
  }, [lang, adminSozlukler])

  const adminDictReady = Boolean(adminSozlukler[lang])

  const value = useMemo(
    () => ({ lang, setLang, t, dict, ensureAdminDict, adminDictReady }),
    [lang, setLang, t, dict, ensureAdminDict, adminDictReady]
  )

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
      dict: tr as AppDictionary,
      // Sağlayıcı yokken (test/izole render) admin sözlüğü yüklenmez; kabuk beklemeye düşmesin
      // diye sessiz bir no-op veriyoruz, hazır bayrağı da false kalıyor.
      ensureAdminDict: () => { },
      adminDictReady: false
    }
  }
  return ctx
}
