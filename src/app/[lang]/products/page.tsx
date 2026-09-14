import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import React from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { getCategories } from '@/lib/services/category.service'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient } from '@/lib/supabase/static'

import { type CategoryViewModelLite } from '../../../components/home/GuidedCategoryDiscovery'
import { SITE_URL } from '../../../config/siteUrl'
import { TenantProvider } from '../../../hooks/useTenant'
import { compareText } from '../../../i18n/sort'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../../lib/cache/tags'
import { toUICategoryList } from '../../../lib/type-converters'
import { getCategoryDescription, getCategoryDisplayName, getLocalizedCategorySlug } from '../../../utils/categoryHelpers'
import { DEFAULT_TENANT_CONFIG, DEFAULT_TENANT_ID } from '../../../utils/tenantConstants'
import CategoryMasterView from '../../../views/CategoryMasterView'

/**
 * F5-B W2.1 — sunucu sayfalaması: sayfa başına AİLE sayısı.
 *
 * ⭐24 → 72 (REC-59 adım 2, 2026-09-14). NİÇİN: `?page=` sorgu parametresi bu rotayı
 * DİNAMİK yapıyordu — Next 15'te `searchParams` alan sayfa prerender EDİLEMEZ. Parametreyi
 * kaldırmak için iki yol vardı: ayrı bir sayfalama segmenti açmak (`/products/sayfa/2`) ya
 * da sayfa boyunu tüm listeyi kapsayacak kadar büyütmek. İkincisi seçildi çünkü kategori
 * rotası aynı kararı 2026-09-08'de aldı (24 → 48) ve adres DEĞİŞMİYOR (Recep kararı
 * 2026-09-04, "Adım B": 1. sayfa statik, adres değişmez).
 *
 * ÖLÇÜLDÜ, VARSAYILMADI (prod SELECT, 2026-09-14): `product_families` tablosunda **47**
 * satır var (47 seri/landing, 0 model). Yani bugün 2. sayfada 23 aile duruyordu ve o sayfa
 * sitemap'te HİÇ geçmiyordu — kendi verdiğimiz sinyalde yoktu.
 *
 * ⚠SESSİZ EKSİLME RİSKİ: sayfalama kalktığı için, aile sayısı bu tavanı aştığı gün fazlası
 * ekranda HİÇ görünmez ve hiçbir hata çıkmaz. Bekçinin (INV-URUNLER-STATIK-1) K5 kolu
 * ölçülen 47'yi dondurur ve tavan aşıldığı gün KIRMIZI verir; o gün ayrı segment sayfalaması
 * işi açılır — bu YAPISAL bir karardır ve Recep'e gider.
 */
const PAGE_SIZE = 72

const getCachedFamilies = (lang: string, tenantId: string, page: number) => unstable_cache(
  async () => getFamiliesEnriched(supabaseStaticClient, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  }),
  ['products-discovery-families', lang, tenantId, String(page)],
  // revalidate: 3600 = emniyet kemeri — webhook sinyali kaçarsa (ör. deploy-sonrası sessizlik)
  // liste en fazla 1 saat bayat kalabilir. Sinyalli tazeleme (revalidateTag) aynen çalışır.
  // (Ana sayfadaki (src/app/[lang]/page.tsx) desenle aynı emniyet kemeri.)
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/**
 * REC-213-A — keşif sayfasının KATEGORİ verisi.
 *
 * NİÇİN ANA SAYFANIN ÖNBELLEĞİ KULLANILMIYOR: `home-page-data` anahtarı ve
 * `HOME_DATA_TAG` etiketi ana sayfaya aittir; keşif yüzeyini oraya bağlamak
 * PS-042'nin reddettiği şeydir (bir yüzeyin tazelenmesi ötekini sessizce
 * ısıtır/soğutur). Aynı sorgular, KENDİ keşif etiketiyle.
 *
 * Anahtar `lang` VE `tenantId` içerir (kural 12) — dil ya da kiracı düşerse
 * bir kiracının kategori listesi ötekine servis edilirdi.
 */
const getCachedKategoriler = (lang: string, tenantId: string) => unstable_cache(
  async () => {
    const [catData, countRes] = await Promise.all([
      getCategories(supabaseStaticClient),
      supabaseStaticClient.rpc('get_category_counts'),
    ])
    const sayimlar: Record<string, number> = {}
    for (const row of countRes.data ?? []) {
      sayimlar[row.category_id] = row.product_count ?? 0
    }
    return { catData, sayimlar }
  },
  ['products-discovery-categories', lang, tenantId],
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/**
 * ⭐SAYFA DAİMA 1 (REC-59 adım 2). `?page=` KALKTI — `parsePageParam` ile birlikte, çünkü
 * artık çağıranı yok. Sabit, `getCachedFamilies`'in imzasını bozmadan okunabilir kalsın diye
 * duruyor; kaldırılırsa önbellek anahtarındaki `String(page)` bileşeni de anlamını yitirir.
 * Kategori rotasındaki `SAYFA` sabitinin ikizidir.
 */
const SAYFA = 1

/**
 * ⭐ROTA SINIFINI AÇIKÇA İLAN ET (REC-59). Kategori rotası aynı satırı taşıyor ve üretilen
 * HTML'inde CSR bailout işareti YOK (ölçüldü 2026-09-14: `about` 0, kategori 0, ilan
 * etmeyen ana sayfa 2, marka sayfası 2). `force-static` altında `useSearchParams()` boş
 * döner ve bailout üretmez — çatıdaki bilinçli adalar (Vercel Analytics, NavigationTracker)
 * sayfayı istemciye düşürmez.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3. */
export const revalidate = 3600

export async function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }]
}

/**
 * REC-338 — bu rotanın `generateMetadata`'sı HİÇ YOKTU.
 *
 * ÖLÇÜM (canlı, 2026-09-14): `/tr/products` ve `/en/products` HTML'inde `rel="canonical"`
 * SIFIR; `<title>` kök layout'un varsayılanıydı (`VentHub — Premium HVAC Çözümleri` /
 * `... Solutions`). Yani sitenin en büyük liste sayfasının kendi başlığı ve kanonik adresi
 * yoktu — arama motoru için bu sayfa ana sayfanın kopyası gibi görünüyordu.
 *
 * `?page=` kaldırılmasıyla aynı PR'da olmasının sebebi: sorgu parametreli adresler kanonik
 * koruması olmadan duruyordu; ikisi aynı kusurun iki ucu.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr

  const trUrl = `${SITE_URL}/tr/products`
  const enUrl = `${SITE_URL}/en/products`
  const canonicalUrl = lang === 'en' ? enUrl : trUrl

  const title = dict.products.discovery.seoTitle
  const description = dict.products.discovery.seoDesc

  return {
    title,
    description,
    // hreflang deseni site geneliyle AYNI: yalın `tr`/`en` + `x-default` = TR.
    // Bölge kodlu biçim (`tr-TR`) bilerek kullanılmıyor — aynı sitede iki biçim
    // tutarsız sinyal üretir (REC-127'de ana sayfada ölçülmüştü).
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
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 * F5-B W2.1: liste birimi varyant değil AİLE satırıdır (374 varyant → 32 aile).
 */
export default async function Page({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const page = SAYFA
  // ⭐DERLEME SABİTİ, `headers()` DEĞİL (REC-59 Adım B/1 — Recep kararı 2026-09-04).
  // Eskiden `await getTenantConfig()` idi ve o çağrı `utils/tenantServer.ts` üzerinden
  // `await headers()` okuyordu; build bunu "couldn't be rendered statically because it
  // used `headers`" diye reddediyordu. Ana sayfa ve kategori rotası aynı deseni aldı.
  // Sabit ile canlı `tenants` satırı BİREBİR aynı (prod SELECT, tablo TEK satır).
  // Çok-kiracılı yapı PARK'ta (REC-88); geri açılırsa doğru yol kiracı başına ayrı yayın.
  const tenantConfig = DEFAULT_TENANT_CONFIG
  const tenantId = DEFAULT_TENANT_ID
  const { items: families, total } = await getCachedFamilies(lang, tenantId, page)
  const dict = lang === 'en' ? en : tr

  // Kategori kapısı — ana sayfayla AYNI kurallar, bilerek birebir:
  //  · yalnız KÖK kategoriler (parent_id yok) ve yalnız ÜRÜNÜ OLANLAR (nav ile tutarlı;
  //    boş iskele kategoriye giden kapı, müşteriyi boş sayfaya götürürdü),
  //  · ad DAİMA getCategoryDisplayName (kural 7 — ham `name` render YASAK),
  //  · görünen slug dile göre getLocalizedCategorySlug,
  //  · açıklama dil-farkındalı çözücüden (REC-161).
  // Sunucu bileşeniyiz, `useI18n` yok: `t` aktif dilin sözlüğünden kurulur.
  const t = (key: string) => getDictValue(dict, key)
  let kategoriler: CategoryViewModelLite[] = []
  try {
    const { catData, sayimlar } = await getCachedKategoriler(lang, tenantId)
    kategoriler = toUICategoryList(catData)
      .filter((c) => !c.parent_id && (sayimlar[c.id] ?? 0) > 0)
      .sort((a, b) => compareText(a.name, b.name, lang))
      .map((c) => ({
        id: c.id,
        slug: getLocalizedCategorySlug(c, lang),
        displayName: getCategoryDisplayName(c, t),
        description: getCategoryDescription(c, lang),
        image_url: c.image_url,
      }))
  } catch (error) {
    // Kategori bloğu sayfanın EKİdir, şartı değil: veri düşerse ürün listesi yine gelir.
    // Sessiz yutmuyoruz — düşerse görünsün diye loglanıyor (ana sayfadaki desenin aynısı).
    console.warn('Kategori kapisi verisi alinamadi (/products):', error)
  }

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <TenantProvider value={tenantConfig}>
        <CategoryMasterView
          initialCategory={null}
          kategoriler={kategoriler}
          families={families}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </TenantProvider>
    </React.Suspense>
  )
}
