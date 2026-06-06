import { MetadataRoute } from 'next'
import { getCategories } from '../lib/services/category.service'
import { getAllProducts } from '../lib/services/product.service'
import { HVAC_BRANDS } from '../data/brands'
import { SITE_URL } from '../config/siteUrl'
import { Routes } from '../utils/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const locales = ['tr', 'en']

  // Fetch all categories and products
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getAllProducts().catch(() => [])
  ])

  // 1. Static Routes
  const staticRoutesList = [
    '',
    '/products',
    '/brands',
    '/contact',
    '/about',
    '/destek/merkez',
    '/cart',
    '/legal/kvkk',
    '/legal/gizlilik-politikasi',
    '/legal/cerez-politikasi',
  ]

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    staticRoutesList.map((route) => ({
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date(),
      changefreq: 'daily',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          tr: `${baseUrl}/tr${route}`,
          en: `${baseUrl}/en${route}`,
        }
      }
    }))
  )

  // 2. Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    categories.map((cat) => ({
      url: `${baseUrl}/${lang}${Routes.category(cat.slug)}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changefreq: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          tr: `${baseUrl}/tr${Routes.category(cat.slug)}`,
          en: `${baseUrl}/en${Routes.category(cat.slug)}`,
        }
      }
    }))
  )

  // 3. Brand Routes
  const brandRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    HVAC_BRANDS.map((brand) => ({
      url: `${baseUrl}/${lang}${Routes.brand(brand.slug)}`,
      lastModified: new Date(),
      changefreq: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          tr: `${baseUrl}/tr${Routes.brand(brand.slug)}`,
          en: `${baseUrl}/en${Routes.brand(brand.slug)}`,
        }
      }
    }))
  )

  // 4. Product Routes (Sadece slug değerine sahip olanlar)
  const productRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    products
      .filter((prod) => !!prod.slug)
      .map((prod) => ({
        url: `${baseUrl}/${lang}${Routes.product(prod.slug!)}`,
        lastModified: new Date(prod.updated_at || new Date()),
        changefreq: 'daily',
        priority: 0.9,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr${Routes.product(prod.slug!)}`,
            en: `${baseUrl}/en${Routes.product(prod.slug!)}`,
          }
        }
      }))
  )

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes]
}
