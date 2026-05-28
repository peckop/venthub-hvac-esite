import { useI18n } from '../i18n/I18nProvider'
import { Routes } from '../utils/routes'

type RouteFunction = (...args: unknown[]) => string

function localizeUrl(url: string, lang: string): string {
  // Admin ve API rotaları dil segmenti almaz
  if (url.startsWith('/admin') || url.startsWith('/api')) {
    return url
  }
  // Eğer url zaten /tr veya /en ile başlıyorsa, mükerrer ön ek eklememek için direkt döndür
  if (url.startsWith('/tr') || url.startsWith('/en')) {
    return url
  }
  // Kök sayfa /tr veya /en olacaktır
  return `/${lang}${url === '/' ? '' : url}`
}

function createLocalizedProxy<T extends object>(target: T, lang: string): T {
  return new Proxy(target, {
    get(t, prop) {
      const value = Reflect.get(t, prop)
      
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const originalUrl = (value as RouteFunction)(...args)
          return localizeUrl(originalUrl, lang)
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
 * A React hook that returns a proxy over the global `Routes` object, automatically
 * prepending the current language code to all returned route paths.
 * Admin and API routes are explicitly excluded from localization.
 *
 * @returns A localized proxy of the standard routing object
 *
 * @example
 * const routes = useLocalizedRoutes()
 * const localizedUrl = routes.product('vent-fan-123') // returns '/tr/products/vent-fan-123' if lang is 'tr'
 */
export function useLocalizedRoutes() {
  const { lang } = useI18n()
  return createLocalizedProxy(Routes, lang)
}
