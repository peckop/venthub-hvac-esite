import React, { useEffect } from 'react'

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

    upsertMeta('property', 'og:title', ogTitle)
    upsertMeta('property', 'og:description', ogDesc)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', ogUrl)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:site_name', 'VentHub')
    upsertMeta('property', 'og:locale', 'tr_TR')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', ogTitle)
    upsertMeta('name', 'twitter:description', ogDesc)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [title, description, canonical, noindex, image])

  return null
}

export default Seo
