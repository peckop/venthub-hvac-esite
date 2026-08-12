import { MetadataRoute } from 'next'

import { SITE_URL } from '../config/siteUrl'
import { HVAC_BRANDS } from '../data/brands'
import { getCategories } from '../lib/services/category.service'
import { getAllFamilySlugs } from '../lib/services/family.service'
import { supabaseStaticClient } from '../lib/supabase/static'
import { getLocalizedCategorySlug } from '../utils/categoryHelpers'
import { Routes } from '../utils/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const locales = ['tr', 'en']

  // Fetch all categories, product families and per-category product counts
  const [categories, familySlugs, countRes] = await Promise.all([
    getCategories(supabaseStaticClient).catch(() => []),
    getAllFamilySlugs(supabaseStaticClient).catch(() => []),
    // Supabase builder reject etmez; hata {error} alanında döner — data ?? [] yeterli
    supabaseStaticClient.rpc('get_category_counts'),
  ])

  // Nav (CategoryContext) ile tutarlılık: yalnız ÜRÜNÜ OLAN kategoriler sitemap'e yazılır.
  // Boş iskele kategoriler (gelecekteki ürün ailesi için bilinçli oluşturulmuş) DB'de kalır
  // ama arama motorlarına sunulmaz.
  const categoryCountMap = new Map<string, number>()
  for (const row of countRes.data ?? []) {
    categoryCountMap.set(row.category_id, row.product_count ?? 0)
  }
  const categoriesWithProducts = categories.filter((cat) => (categoryCountMap.get(cat.id) ?? 0) > 0)
  const categoriesById = new Map(categories.map((cat) => [cat.id, cat]))
  // Ebeveyni bulunamayan (silinmiş/pasif üst kategori) alt kategoriler hariç tutulur — kırık /category// URL üretilmez.
  const subCategoriesWithProducts = categoriesWithProducts.filter(
    (cat) => !!cat.parent_id && categoriesById.has(cat.parent_id)
  )

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

  // 2. Category Routes (URL'ler dile göre yerelleştirilmiş slug ile üretilir; boş kategoriler hariç)
  const categoryRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    categoriesWithProducts.map((cat) => ({
      url: `${baseUrl}/${lang}${Routes.category(getLocalizedCategorySlug(cat, lang))}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changefreq: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          tr: `${baseUrl}/tr${Routes.category(getLocalizedCategorySlug(cat, 'tr'))}`,
          en: `${baseUrl}/en${Routes.category(getLocalizedCategorySlug(cat, 'en'))}`,
        }
      }
    }))
  )

  // 2b. Alt-Kategori Routes (/[lang]/category/[parentSlug]/[subSlug]) — yalnız ürünü olan alt kategoriler
  const subCategoryRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    subCategoriesWithProducts.map((cat) => {
      const parent = categoriesById.get(cat.parent_id!)!  // filtre categoriesById.has() garantiledi
      return {
        url: `${baseUrl}/${lang}${Routes.category(
          getLocalizedCategorySlug(parent, lang),
          getLocalizedCategorySlug(cat, lang)
        )}`,
        lastModified: new Date(cat.updated_at || new Date()),
        changefreq: 'weekly',
        priority: 0.65,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr${Routes.category(
              getLocalizedCategorySlug(parent, 'tr'),
              getLocalizedCategorySlug(cat, 'tr')
            )}`,
            en: `${baseUrl}/en${Routes.category(
              getLocalizedCategorySlug(parent, 'en'),
              getLocalizedCategorySlug(cat, 'en')
            )}`,
          }
        }
      }
    })
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

  // 4. Product Routes — F5-B W2.2: AİLE tabanlı (32 aile × 2 dil).
  // Varyant URL'i sitemap'e ASLA girmez; varyant `?sku=` ile aynı aile sayfasında
  // seçilir ve kanonik adres daima aile slug'ıdır.
  const productRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    familySlugs
      .filter((f) => !!f.slug)
      .map((f) => ({
        url: `${baseUrl}/${lang}${Routes.product(f.slug)}`,
        lastModified: new Date(),
        changefreq: 'daily',
        priority: 0.9,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr${Routes.product(f.slug)}`,
            en: `${baseUrl}/en${Routes.product(f.slug)}`,
          }
        }
      }))
  )

  return [...staticRoutes, ...categoryRoutes, ...subCategoryRoutes, ...brandRoutes, ...productRoutes]
}
