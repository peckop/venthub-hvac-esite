import { useMemo } from 'react'

import { useI18n } from '../i18n/I18nProvider'
import { localizedHref, Routes } from '../utils/routes'

type RouteFunction = (...args: unknown[]) => string

// Dil-önekleme mantığı tek kaynakta: utils/routes.ts'teki localizedHref (SSOT).
// Proxy onu sarar; RSC/route-handler/Breadcrumb ise localizedHref'i doğrudan çağırır.
function createLocalizedProxy<T extends object>(target: T, lang: string): T {
  return new Proxy(target, {
    get(t, prop) {
      const value = Reflect.get(t, prop)

      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const originalUrl = (value as RouteFunction)(...args)
          return localizedHref(originalUrl, lang)
        }
      }
      
      if (value !== null && typeof value === 'object') {
        return createLocalizedProxy(value, lang)
      }
      
      return value
    }
  })
}

export function useLocalizedRoutes() {
  const { lang } = useI18n()
  return useMemo(() => createLocalizedProxy(Routes, lang), [lang])
}
