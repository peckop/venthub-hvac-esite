import { MetadataRoute } from 'next'
import { getCategories, getAllProducts } from '../lib/supabase'
import { HVAC_BRANDS } from '../lib/brands'
import { SITE_URL } from '../config/siteUrl'
import { Routes } from '../utils/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Fetch all categories and products
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getAllProducts().catch(() => [])
  ])

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/products',
    '/brands',
    '/contact',
    '/about',
    '/destek/merkez',
    '/cart',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changefreq: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 2. Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}${Routes.category(cat.slug)}`,
    lastModified: new Date(cat.updated_at || new Date()),
    changefreq: 'weekly',
    priority: 0.7,
  }))

  // 3. Brand Routes
  const brandRoutes: MetadataRoute.Sitemap = HVAC_BRANDS.map((brand) => ({
    url: `${baseUrl}${Routes.brand(brand.slug)}`,
    lastModified: new Date(),
    changefreq: 'weekly',
    priority: 0.6,
  }))

  // 4. Product Routes (Sadece slug değerine sahip olanlar)
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((prod) => !!prod.slug)
    .map((prod) => ({
      url: `${baseUrl}${Routes.product(prod.slug!)}`,
      lastModified: new Date(prod.updated_at || new Date()),
      changefreq: 'daily',
      priority: 0.9,
    }))

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes]
}
