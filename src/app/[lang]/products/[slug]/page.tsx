import type { Route } from 'next'
import { notFound,permanentRedirect } from 'next/navigation'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { storagePathToUrl } from '@/lib/images/productImage'
import {
  assertNoUuid,
  buildBreadcrumbJsonLd,
  buildProductGroupJsonLd,
  buildSeriesLandingJsonLd,
} from '@/lib/seo/jsonld'
import { getAllFamilySlugs } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '@/utils/categoryHelpers'
import SeriesLandingView from '@/views/category/SeriesLandingView'

import { SITE_URL } from '../../../../config/siteUrl'
import {
  getCachedFamilyDetail,
  getCachedFamilySlugById,
  getCachedProductBySlug,
  getCachedSeriesLanding,
  getFamilyDetailForRoute,
  preloadFamily,
} from '../../../../lib/data/preload'
import type { ProductRouteResolution } from '../../../../lib/data/productRoute'
import { resolveProductRoute } from '../../../../lib/data/productRoute'
import { Routes } from '../../../../utils/routes'
import { ProductDetailPage as PageComponent } from '../../../_components/ProductDetailPageView'

/**
 * F5-B W2.2 — PDP artık AİLE (product_families) kanoniktir.
 * `/[lang]/products/[slug]` slug'ı bir AİLE slug'ıdır; belirli varyant `?sku=` ile
 * ön-seçilir (canonical/metadata URL'lerine GİRMEZ). Eski varyant slug'ları
 * 308 (permanentRedirect) ile aile URL'ine taşınır.
 */

type LocalizedText = { tr?: string | null; en?: string | null } | null

function pickLang(value: LocalizedText, lang: string): string | null {
  if (!value) return null
  const preferred = lang === 'en' ? value.en : value.tr
  return preferred || value.tr || value.en || null
}

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    // Yalnız AİLE slug'ları prerender edilir — varyant slug'ı statik yol üretmez.
    const families = await getAllFamilySlugs(supabase)

    return families
      .filter((f) => !!f.slug)
      .flatMap((f) => [
        { lang: 'tr', slug: f.slug },
        { lang: 'en', slug: f.slug },
      ])
  } catch (e) {
    console.warn('generateStaticParams error for product families:', e)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  preloadFamily(slug, lang)

  try {
    const detail = await getCachedFamilyDetail(slug, lang)

    if (detail) {
      const { family, variants } = detail
      // ?sku= canonical'a GİRMEZ — aile URL'i tek kanonik adrestir.
      //
      // DİL ÖNEKİ ŞART (T083-VH). Eskiden burası `${SITE_URL}/products/${slug}` idi ve üç şeyi
      // aynı anda bozuyordu: (1) `middleware.ts:86` dil öneksiz her kullanıcı rotasını 307 ile
      // yönlendirdiği için kanonik bir YÖNLENDİRMEYİ gösteriyordu, (2) yönlendirmenin hedefi
      // `Accept-Language`'a göre seçildiğinden kanonik ZİYARETÇİYE GÖRE değişiyordu,
      // (3) en pahalısı: `/tr/...` ve `/en/...` sayfalarının İKİSİ DE aynı kanoniği bildiriyordu
      // → arama motoru kopya sayıp bir dili indeksten düşürebilirdi. `sitemap.ts` doğruyu
      // bildiriyordu, bu sayfa onu çürütüyordu.
      // Cetvel: docs/standards/canonical-url-standard.md §4 · bekçi: INV-CANONICAL-2.
      //
      // `Routes.product` + dil öneki bileşimi KASITLI: `sitemap.ts` de birebir aynı ifadeyi
      // kullanır, böylece iki yüzey aynı kaynaktan üretilir ve sessizce ayrışamaz.
      const trUrl = `${SITE_URL}/tr${Routes.product(family.slug)}`
      const enUrl = `${SITE_URL}/en${Routes.product(family.slug)}`
      const canonicalUrl = lang === 'en' ? enUrl : trUrl
      const title = pickLang(family.meta_title, lang) || `${family.name} | VentHub`
      const description =
        pickLang(family.meta_description, lang) ||
        pickLang(family.description, lang)?.substring(0, 160) ||
        // Son çare SEO açıklaması — sözlük yok (RSC metadata), dil koşuluyla çözülür.
        (lang === 'en' ? 'VentHub Product Details' : 'VentHub Ürün Detayı')
      const coverPath = variants.find((v) => v.images.length > 0)?.images[0]?.path

      return {
        title,
        description,
        alternates: {
          canonical: canonicalUrl,
          languages: {
            tr: trUrl,
            en: enUrl,
            'x-default': trUrl,
          },
        },
        openGraph: {
          title,
          description,
          url: canonicalUrl,
          siteName: 'VentHub',
          images: [
            {
              url: coverPath ? storagePathToUrl(coverPath) : '/images/og-default.jpg',
              width: 1200,
              height: 630,
            },
          ],
          locale: lang === 'en' ? 'en_US' : 'tr_TR',
          type: 'website',
        },
      }
    }
  } catch (e) {
    console.warn('generateMetadata error for product family:', e)
  }

  return {
    title: 'Ürün Detayı | VentHub',
    description: 'VentHub Endüstriyel Havalandırma Sistemleri Ürün Detayı',
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  preloadFamily(slug, lang)

  // T138 K1: zincir kararı `resolveProductRoute`'ta (saf, DI'lı, test edilebilir);
  // sayfa yalnız SONUCU uygular. 'generic' prerender tohumu sorgu yapmadan geçer.
  const resolution: ProductRouteResolution =
    slug === 'generic'
      ? { kind: 'unavailable' }
      : await resolveProductRoute(slug, lang, {
          familyDetail: getFamilyDetailForRoute,
          seriesLanding: getCachedSeriesLanding,
          variantBySlug: getCachedProductBySlug,
          familySlugById: getCachedFamilySlugById,
        })

  // permanentRedirect / notFound birer istisna fırlatır — koşulsuz, en üstte çağrılır.
  if (resolution.kind === 'redirect') permanentRedirect(resolution.to as Route)

  // SERİ → kendi landing'i (HTTP 200). Doğrudan varyantı olmadığı için PDP'ye giremez;
  // K1 öncesinde burada "ürün bulunamadı" kutusu basılıyordu (soft-404: 200 + boş sayfa).
  //
  // T138-VH K7: K1 bu dalda HİÇ JSON-LD basmıyordu (`buildProductGroupJsonLd` yalnız aşağıdaki
  // `family` dalında çağrılıyor, `variants` boş olduğu için seriye hiç girmiyordu — ölçüldü).
  // `ProductGroup` burada UYGUN DEĞİL (seri satılabilir bir ürün değil, model listesi);
  // `buildSeriesLandingJsonLd` CollectionPage + ItemList üretir (gerekçe: jsonld.ts yorumu).
  if (resolution.kind === 'series') {
    const { series, models } = resolution.landing
    const description =
      pickLang(series.description, lang) ||
      (lang === 'en' ? `${series.name} models at VentHub` : `VentHub'da ${series.name} modelleri`)
    const seriesJsonLd = buildSeriesLandingJsonLd({
      lang,
      baseUrl: SITE_URL,
      seriesSlug: series.slug,
      name: series.name,
      description,
      models,
    })

    assertNoUuid(seriesJsonLd)

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
        <SeriesLandingView series={series} models={models} lang={lang} />
      </>
    )
  }

  // GERÇEK 404 → ne aktif varyantlı aile, ne seri, ne varyant slug'ı. Varyantsız ve
  // seri OLMAYAN aile de buraya düşer: içi boş bir ürün sayfası 200 dönmemeli.
  if (resolution.kind === 'not-found') notFound()

  // `unavailable` = veri yok DEĞİL, veriye ULAŞILAMADI (ağ/RPC/env). 404 basılmaz —
  // önbelleğe alınabilen kalıcı bir yokluk beyanı olurdu; mevcut "bulunamadı" görünümü çizilir.
  const detail = resolution.kind === 'family' ? resolution.detail : null
  const family = detail?.family ?? null
  const variants = detail?.variants ?? []

  // ⭐REC-111: kategori JSON-LD'den ÖNCE çözülür — teklif modu kararı ona bağlı.
  // Eskiden bu satırlar aşağıda, breadcrumb bloğunda duruyordu ve `buildProductGroupJsonLd`
  // kategoriyi hiç görmüyordu; sonuç, vitrin "Teklif Alın" derken schema.org'da gerçek
  // fiyatın yayınlanmasıydı (canlıda 80 adresin 72'si).
  const mainCategory = family?.category ?? null
  const subCategory = family?.subcategory ?? null

  // W3.1: aile bulunamadıysa (not-found) JSON-LD hiç yazılmaz — tanımlanacak bir
  // ürün yok; ProductGroup + hasVariant[] (teklif modunda offers HİÇ yazılmaz).
  const jsonLd = family
    ? buildProductGroupJsonLd({ family, variants, lang, baseUrl: SITE_URL, mainCategory })
    : null

  if (jsonLd) assertNoUuid(jsonLd)

  // T154-VH bağlama — MODEL dalında BreadcrumbList JSON-LD.
  //
  // Kategori adları SUNUCUDA çözülür. Görsel breadcrumb (ProductDetailPageView) adları
  // `useCategories()` istemci bağlamından alır; o bağlam ilk render'da BOŞTUR. Zinciri
  // oradan üretseydik JSON-LD boş çıkardı ve iş "bitmiş görünüp" yüzey düzelmezdi —
  // makine breadcrumb'ı yine göremezdi.
  //
  // Ham `category.name`/slug YAZILMAZ (Mutlak Kural 7): DB'deki ad İngilizce'dir ve TR
  // sayfaya sızar. Sözlük → menu_label → name zinciri `getCategoryDisplayName` içinde.
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)

  const mainName = mainCategory ? getCategoryDisplayName(mainCategory, t) : ''
  const mainSlug = mainCategory ? getLocalizedCategorySlug(mainCategory, lang) : ''
  const subName = subCategory ? getCategoryDisplayName(subCategory, t) : ''
  const subSlug = subCategory ? getLocalizedCategorySlug(subCategory, lang) : ''

  // Kategori çözülemezse basamak HİÇ eklenmez (zincir kısalır, kırılmaz) — görsel
  // breadcrumb'ın ve CategoryLandingView'ın "parentVm yoksa basamak yok" kuralıyla aynı.
  // Ad boşsa da eklenmez: `buildBreadcrumbJsonLd` boş adda ATAR, ve boş bir basamak
  // zaten makineye hiçbir şey söylemez.
  const breadcrumbJsonLd =
    family && family.name.trim()
      ? buildBreadcrumbJsonLd({
          lang,
          baseUrl: SITE_URL,
          steps: [
            { name: t('category.breadcrumbHome'), path: '/' },
            ...(mainName && mainSlug ? [{ name: mainName, path: Routes.category(mainSlug) }] : []),
            ...(subName && subSlug && mainSlug && subSlug !== mainSlug
              ? [{ name: subName, path: Routes.category(mainSlug, subSlug) }]
              : []),
            // Bulunulan sayfa: path NULL olmak ZORUNDA (helper sözleşmesi).
            { name: family.name, path: null },
          ],
        })
      : null

  if (breadcrumbJsonLd) assertNoUuid(breadcrumbJsonLd)

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      )}
      {/* W4b: KDV etiketi sabit değil — bireysel/anon brüt, bayi/kurumsal net görür. */}
      <PageComponent family={family} variants={variants} priceTaxIncluded={detail?.price_tax_included ?? null} />
    </>
  )
}
