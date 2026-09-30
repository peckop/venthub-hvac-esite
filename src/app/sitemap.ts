import { MetadataRoute } from 'next'

import { EN_YAYIN } from '../config/features'
import { SITE_URL } from '../config/siteUrl'
import { HVAC_BRANDS } from '../data/brands'
import { bilgiMerkeziSiteHaritasi } from '../lib/bilgiMerkezi/siteHaritasi'
import { siteHaritasiAlternates } from '../lib/seo/enYayinKurali'
import { getCategories } from '../lib/services/category.service'
import { getAllFamilySlugs, getFamilyLastModified } from '../lib/services/family.service'
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
   * `alternates.languages` blokları da AYNI BAYRAĞA BAĞLI (REC-300 Faz 3e-3, OPS hükmü 2026-09-29):
   * kapalıyken satırda `alternates` alanı hiç çıkmaz (Google'a dizine kapalı `/en` eşi
   * gösterilmez, sayfaların `<link rel=alternate>`i de aynı kuralla kalkar — `enYayinKurali.ts`);
   * açılınca bugünkü çıktı BİREBİR geri gelir. Bayrağın eski "BİLİNEN SINIR" maddesi bununla kalktı.
   */
  const locales = EN_YAYIN ? ['tr', 'en'] : ['tr']

  // Fetch all categories, product families and per-category product counts.
  //
  // HATA YUTULMAZ (REC-300 onarımı, OPS 2026-09-29): önceki `.catch(() => [])` build anındaki TEK geçici DB
  // hatasını boş listeye çeviriyordu → ürünsüz/kategorisiz harita üretilir, Google'a o gider (CI koşusu
  // 36548708171: kategori 24, ürün 0 ölçüldü). Artık hata build'i KIRAR; yeniden deneme ile örtülmez —
  // Vercel önceki başarılı yayını tutar, bozuk harita canlıya çıkmaz. Servisler zaten `throw` eder.
  //
  // TEK İSTİSNA — SAHTE VERİTABANLI CI BUILD'İ: `ci.yml` `Build (blocking)` adımı `dummy.supabase.co` ile
  // (ağ yok) koşar ve rotaların ağsız ortamda da ÜRETİLEBİLMESİ zorunludur (bkz. `urunlerSayfasi.tsx`
  // "HATA YOLU"; ilk denemede bu PR o build'i kırdı — koşu 36553735279). Sahte adreste veri hiç gelmez;
  // orada boş liste ile devam edilir ve uyarı basılır. Gerçek adreste (Vercel, e2e-smoke gerçek-env build'i)
  // katı kural geçerlidir.
  // BİREBİR eşitlik (OPS şartı): boş, tanımsız, yanlış yazılmış ya da `xdummy.supabase.co` gibi kaçak adres
  // gevşek kola GİRMEZ — yanlış yapılandırılmış canlı ortam sessizce ürünsüz haritaya düşmesin.
  const veritabaniSahte = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co'
  const [categories, familySlugs, aileTarihleri, countRes] = await Promise.all([
    veritabaniSahte ? getCategories(supabaseStaticClient).catch(() => []) : getCategories(supabaseStaticClient),
    veritabaniSahte ? getAllFamilySlugs(supabaseStaticClient).catch(() => []) : getAllFamilySlugs(supabaseStaticClient),
    // REC-454: aile lastmod'u = ailenin + aktif varyantlarının en son `updated_at`'i. Hata yutulmaz
    // (aynı katı kural); sahte veritabanında boş harita → lastmod hiç yazılmaz.
    veritabaniSahte
      ? getFamilyLastModified(supabaseStaticClient).catch(() => new Map<string, string>())
      : getFamilyLastModified(supabaseStaticClient),
    // Supabase builder reject ETMEZ; hata {error} alanında döner — aşağıda AÇIKÇA fırlatılır.
    supabaseStaticClient.rpc('get_category_counts'),
  ])
  if (veritabaniSahte) {
    console.warn('[sitemap] sahte veritabanı (dummy.supabase.co): kategori/aile satırları OLMADAN üretildi — yalnız CI derlemesi için')
  } else {
    if (countRes.error) throw new Error(`sitemap: get_category_counts başarısız — ${countRes.error.message}`)
    // Hata olmadan BOŞ dönmek de ürünsüz haritadır (canlıda 24 kategori / 47 aile var; sıfır = veri kaybı).
    if (categories.length === 0 || familySlugs.length === 0) {
      throw new Error(
        `sitemap: boş katalog (kategori ${categories.length}, aile ${familySlugs.length}) — ürünsüz harita üretilmez`,
      )
    }
  }

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
    // `/destek/merkez` ÇIKTI (karar 92): adres 308 verir; Bilgi Merkezi aşağıda kendi bloğunda
    // (bölüm adı dile göre değiştiği için bu ortak listeye giremez).
    // Ürün Seçici (karar K17): hesaplama araçlarının tek kalıcı girişi. Dört aracın
    // KENDİ adresleri sitemap'te YOK ve bu kasıtlı — arama motoruna verilen kapı tek
    // olsun; araçlar bu sayfadan bulunur.
    '/urun-secici',
    // `/cart` YOK (PR-1, bot karnesi 2026-09-24): sepet X-Robots noindex taşır; dizine
    // kapalı adresi site haritasında ilan etmek Search Console'da "gönderildi ama noindex"
    // hatası üretir.
    '/legal/kvkk',
    '/legal/gizlilik-politikasi',
    '/legal/cerez-politikasi',
  ]

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    staticRoutesList.map((route) => ({
      url: `${baseUrl}/${lang}${route}`,
      // lastmod YOK (REC-454): bu sayfaların güvenilir değişiklik tarihi yok. Eskiden `new Date()`
      // yazılıyordu = her üretimde "bugün değişti" → Google haritanın tarihlerine güvenmeyi bırakır.
      // Uydurma tarih yerine alan hiç yazılmaz (Google: lastmod isteğe bağlıdır).
      changefreq: 'daily',
      priority: route === '' ? 1.0 : 0.8,
      ...siteHaritasiAlternates({
        tr: `${baseUrl}/tr${route}`,
        en: `${baseUrl}/en${route}`,
      }),
    }))
  )

  // 2. Category Routes (URL'ler dile göre yerelleştirilmiş slug ile üretilir; boş kategoriler hariç)
  const categoryRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    categoriesWithProducts.map((cat) => ({
      url: `${baseUrl}/${lang}${Routes.category(getLocalizedCategorySlug(cat, lang))}`,
      // Tarihsiz satırda `new Date()` yedeği KALDIRILDI (REC-454) — tarih yoksa alan yazılmaz.
      ...(cat.updated_at ? { lastModified: new Date(cat.updated_at) } : {}),
      changefreq: 'weekly',
      priority: 0.7,
      ...siteHaritasiAlternates({
        tr: `${baseUrl}/tr${Routes.category(getLocalizedCategorySlug(cat, 'tr'))}`,
        en: `${baseUrl}/en${Routes.category(getLocalizedCategorySlug(cat, 'en'))}`,
      }),
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
      // lastmod YOK (REC-454): marka listesi kod sabiti, sayfanın değişiklik tarihi tutulmuyor.
      changefreq: 'weekly',
      priority: 0.6,
      ...siteHaritasiAlternates({
        tr: `${baseUrl}/tr${Routes.brand(brand.slug)}`,
        en: `${baseUrl}/en${Routes.brand(brand.slug)}`,
      }),
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
        // REC-454: gerçek değişiklik tarihi (aile + aktif varyantlar). Seri slug'ı haritada yok → alan yazılmaz.
        ...(aileTarihleri.has(f.slug) ? { lastModified: new Date(aileTarihleri.get(f.slug) as string) } : {}),
        changefreq: 'daily',
        priority: 0.9,
        ...siteHaritasiAlternates({
          tr: `${baseUrl}/tr${Routes.product(f.slug)}`,
          en: `${baseUrl}/en${Routes.product(f.slug)}`,
        }),
      }))
  )

  // `subCategoryRoutes` KALDIRILDI (REC-205) — alt kategoriler `categoryRoutes` içinde
  // zaten tek seviyeli kanonik adresleriyle var; ikinci kez eklemek çift yayın demekti.
  return [...staticRoutes, ...bilgiMerkeziSiteHaritasi(baseUrl), ...categoryRoutes, ...brandRoutes, ...productRoutes]
}
