import { MetadataRoute } from 'next'

import { EN_YAYIN } from '../config/features'
import { SITE_URL } from '../config/siteUrl'
import { HVAC_BRANDS } from '../data/brands'
import { getCategories } from '../lib/services/category.service'
import { getAllFamilySlugs } from '../lib/services/family.service'
import { supabaseStaticClient } from '../lib/supabase/static'
import { getLocalizedCategorySlug } from '../utils/categoryHelpers'
import { Routes } from '../utils/routes'

/**
 * W3 (render-dalga1) — YEDEK TAZELEME YOLU.
 *
 * Sitemap DB'den üretiliyor ama hiçbir webhook dalı onu tazelemiyordu: build'de donuyor,
 * yeni ürün/kategori/aile arama motorlarına hiç bildirilmiyordu. Webhook artık
 * `revalidatePath('/sitemap.xml')` çağırıyor; bu beyan İKİNCİ hattır — webhook düşerse
 * (secret rotasyonu, ağ hatası, 401) sitemap en fazla bu süre kadar bayat kalır.
 *
 * 6 saat: katalog günde birkaç kez değişiyor; daha kısası boşuna DB yükü, daha uzunu
 * webhook arızasında fark edilmeyecek kadar bayat.
 */
export const revalidate = 21600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  /**
   * REC-204 — site haritasına HANGİ dillerin yazılacağı.
   *
   * `EN_YAYIN` kapalıyken `/en/…` adresleri site haritasından TAMAMEN çıkar: Google'a
   * "bunları tara" diye bir talep gitmez. Sayfalar çalışmaya devam eder (bkz. bayrağın
   * kendi gerekçesi, `src/config/features.ts`).
   *
   * ⚠`alternates.languages` blokları BİLEREK DOKUNULMADI: hreflang beyanı sayfa var
   * olduğu sürece doğrudur ve onu bozmak TR sayfaların dil eşleşmesini de bozar.
   * Bayrağın "BİLİNEN SINIR" maddesi tam olarak bunu yazıyor.
   */
  const locales = EN_YAYIN ? ['tr', 'en'] : ['tr']

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
  // NOT (REC-205): `categoriesById` ve `subCategoriesWithProducts` yalnız iki seviyeli adres
  // üretimi için vardı; o blok kaldırıldığı için ikisi de gereksizleşti. Alt kategoriler
  // `categoriesWithProducts` içinde zaten yer alıyor ve tek seviyeli adresle ilan ediliyor.

  // 1. Static Routes
  const staticRoutesList = [
    '',
    '/products',
    '/brands',
    '/contact',
    '/about',
    '/destek/merkez',
    // Ürün Seçici (karar K17): hesaplama araçlarının tek kalıcı girişi. Dört aracın
    // KENDİ adresleri sitemap'te YOK ve bu kasıtlı — arama motoruna verilen kapı tek
    // olsun; araçlar bu sayfadan bulunur.
    '/urun-secici',
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

  // 2b. KALDIRILDI (REC-205, 2026-09-07) — alt kategoriler için İKİNCİ, iki seviyeli adres
  // üretiliyordu: `/[lang]/category/[üst]/[alt]`. Ama yukarıdaki 2. blok (`categoryRoutes`)
  // `categoriesWithProducts` üzerinden ZATEN üst ve alt kategorilerin HEPSİNİ tek seviyeli
  // adresle ekliyor. Sonuç: aynı sayfa site haritasında iki kez, iki farklı adresle
  // (TR: 23 tek seviyeli + 17 iki seviyeli → 17 × 2 dil = 34 çift adres) ve her iki sayfa
  // da kendini kanonik ilan ediyordu.
  //
  // Google bunu ölçtü ve iki seviyeli olanı ELEDİ (GSC: "Kopya, Google kullanıcıdan farklı
  // bir standart sayfa seçti" → /tr/category/fanlar/endustriyel-tavan-vantilatorleri).
  // Haklıydı: iki seviyeli varyantta `og:url` ve `CollectionPage` yapısal verisi yoktu.
  //
  // Kanonik artık TEK SEVİYELİ; iki seviyeli adres 301 ile oraya gider (o rota yalnız
  // yönlendirme yapar). Site haritası kanonik olmayan adresi İLAN ETMEZ.

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

  // `subCategoryRoutes` KALDIRILDI (REC-205) — alt kategoriler `categoryRoutes` içinde
  // zaten tek seviyeli kanonik adresleriyle var; ikinci kez eklemek çift yayın demekti.
  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes]
}
