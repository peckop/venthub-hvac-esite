import React, { useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  noindex?: boolean
  /**
   * OpenGraph/Twitter görseli. Sağlanmazsa varsayılan görsel kullanılır.
   */
  image?: string
}

// Küçük yardımcı: meta (name veya property) etiketini upsert eder
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Basit SEO yardımcı bileşeni: document.head üzerinde meta/link günceller
const Seo: React.FC<SeoProps> = ({ title, description, canonical, noindex, image }) => {
  const { lang } = useI18n()

  useEffect(() => {
    // Başlık
    if (title) {
      document.title = title
    }

    // Açıklama
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // Canonical (yoksa mevcut sayfayı kullan)
    const href = canonical || window.location.href
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', href)

    // hreflang alternates (tr-TR, en-US, x-default)
    try {
      const base = new URL(href, window.location.origin)
      const mkHref = (l: 'tr' | 'en') => {
        const u = new URL(base.href)
        u.searchParams.set('lang', l)
        return u.toString()
      }
      // x-default için dil parametresiz URL tercih edilir (dil-agnostik)
      const baseNoLang = new URL(base.href)
      baseNoLang.searchParams.delete('lang')

      const alts: { hreflang: string; href: string }[] = [
        { hreflang: 'tr-TR', href: mkHref('tr') },
        { hreflang: 'en-US', href: mkHref('en') },
        { hreflang: 'x-default', href: baseNoLang.toString() },
      ]
      // remove previous alternates first
      document.head.querySelectorAll('link[rel="alternate"]').forEach(el => el.parentElement?.removeChild(el))
      for (const a of alts) {
        const linkAlt = document.createElement('link')
        linkAlt.setAttribute('rel', 'alternate')
        linkAlt.setAttribute('hreflang', a.hreflang)
        linkAlt.setAttribute('href', a.href)
        document.head.appendChild(linkAlt)
      }
    } catch {}

    // Robots
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow')

    // Open Graph & Twitter (varsayılan değerlerle birlikte)
    const ogTitle = title || 'VentHub'
    const ogDesc = description || 'HVAC ürünleri ve çözümleri'
    const ogUrl = href
    const ogImage = image || '/images/hvac_heat_recovery_7.png'
    const ogLocale = lang === 'tr' ? 'tr_TR' : 'en_US'

    upsertMeta('property', 'og:title', ogTitle)
    upsertMeta('property', 'og:description', ogDesc)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', ogUrl)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:site_name', 'VentHub')
    upsertMeta('property', 'og:locale', ogLocale)

    // Open Graph alternate locales (diğer diller)
    try {
      // Önce mevcut alternate locale etiketlerini temizle
      document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.parentElement?.removeChild(el))
      const all = ['tr_TR', 'en_US'] as const
      for (const loc of all) {
        if (loc !== ogLocale) {
          const m = document.createElement('meta')
          m.setAttribute('property', 'og:locale:alternate')
          m.setAttribute('content', loc)
          document.head.appendChild(m)
        }
      }
    } catch {}

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', ogTitle)
    upsertMeta('name', 'twitter:description', ogDesc)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [title, description, canonical, noindex, image, lang])

  return null
}

export default Seo
