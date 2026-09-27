import { useMemo } from 'react'

import { ADRES_SEMASI_K3B } from '../config/features'
import { useI18n } from '../i18n/I18nProvider'
import { localizedHref, Routes } from '../utils/routes'
import { adresDili, adresRotalari } from '../utils/yuzeyAdresleri'

type RouteFunction = (...args: unknown[]) => string

// Dil-önekleme mantığı tek kaynakta: utils/routes.ts'teki localizedHref (SSOT).
// Proxy onu sarar; RSC/route-handler/Breadcrumb ise localizedHref'i doğrudan çağırır.
//
// REC-300 Faz 3d: `ADRES_SEMASI_K3B` AÇIKKEN vitrin nesnesi üreten dört fonksiyon (`category`,
// `product`, `products`, `brand`) `adresUret`'e gider (`adresRotalari`) — bu vekili kullanan 35+
// yüzey (kart, menü, kırıntı, sihirbaz, sepet, favori…) tek noktadan yeni şemaya geçer.
// KAPALIYKEN (bugün) bu dal hiç kurulmaz: vekil birebir eskisi.
function createLocalizedProxy<T extends object>(
  target: T,
  lang: string,
  ustOrtu: Partial<Record<PropertyKey, unknown>> | null,
): T {
  return new Proxy(target, {
    get(t, prop) {
      if (ustOrtu && prop in ustOrtu) return ustOrtu[prop]
      const value = Reflect.get(t, prop)

      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const originalUrl = (value as RouteFunction)(...args)
          return localizedHref(originalUrl, lang)
        }
      }
      
      if (value !== null && typeof value === 'object') {
        return createLocalizedProxy(value, lang, null)
      }
      
      return value
    }
  })
}

export function useLocalizedRoutes() {
  const { lang } = useI18n()
  return useMemo(
    () =>
      createLocalizedProxy(
        Routes,
        lang,
        ADRES_SEMASI_K3B ? { ...adresRotalari(adresDili(lang)) } : null,
      ),
    [lang],
  )
}
