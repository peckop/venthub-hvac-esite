import React, { useEffect } from 'react'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  noindex?: boolean
}

// Basit SEO yardımcı bileşeni: document.head üzerinde meta/link günceller
const Seo: React.FC<SeoProps> = ({ title, description, canonical, noindex }) => {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // canonical
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!linkCanonical) {
        linkCanonical = document.createElement('link')
        linkCanonical.setAttribute('rel', 'canonical')
        document.head.appendChild(linkCanonical)
      }
      linkCanonical.setAttribute('href', canonical)
    }

    // robots
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow')
  }, [title, description, canonical, noindex])

  return null
}

export default Seo
