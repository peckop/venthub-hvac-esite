import { useI18n } from '../i18n/I18nProvider'
import { Routes } from '../utils/routes'

type RouteFunction = (...args: unknown[]) => string

function localizeUrl(url: string, lang: string): string {
  // Admin ve API rotaları dil segmenti almaz
  if (url.startsWith('/admin') || url.startsWith('/api')) {
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

export function useLocalizedRoutes() {
  const { lang } = useI18n()
  return createLocalizedProxy(Routes, lang)
}
