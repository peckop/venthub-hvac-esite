import { MetadataRoute } from 'next'
import { getCategories, getAllProducts } from '../lib/supabase'
import { HVAC_BRANDS } from '../lib/brands'
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
  ]

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    staticRoutesList.map((route) => ({
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date(),
      changefreq: 'daily',
      priority: route === '' ? 1.0 : 0.8,
    }))
  )

  // 2. Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    categories.map((cat) => ({
      url: `${baseUrl}/${lang}${Routes.category(cat.slug)}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changefreq: 'weekly',
      priority: 0.7,
    }))
  )

  // 3. Brand Routes
  const brandRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    HVAC_BRANDS.map((brand) => ({
      url: `${baseUrl}/${lang}${Routes.brand(brand.slug)}`,
      lastModified: new Date(),
      changefreq: 'weekly',
      priority: 0.6,
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
      }))
  )

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes]
}
