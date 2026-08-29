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

/**
 * A custom React hook that returns a proxied version of the global `Routes` object.
 * Automatically intercepts route function calls and injects the active language prefix.
 * Centralizes the single source of truth for localization routing rules.
 *
 * @returns A proxied `Routes` object where all route generation functions output localized URLs
 *
 * @example
 * const routes = useLocalizedRoutes();
 * // When active language is 'en':
 * const url = routes.product('123'); // returns '/en/product/123' instead of '/product/123'
 */
export function useLocalizedRoutes() {
  const { lang } = useI18n()
  return useMemo(() => createLocalizedProxy(Routes, lang), [lang])
}
