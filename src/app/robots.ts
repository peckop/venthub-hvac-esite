import { MetadataRoute } from 'next'

import { SITE_URL } from '../config/siteUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/auth/', '/account/', '/checkout/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
