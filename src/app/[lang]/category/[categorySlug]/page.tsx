import { unstable_cache } from 'next/cache'
import { notFound,permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { assertNoUuid, buildCategoryJsonLd } from '@/lib/seo/jsonld'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { SITE_URL } from '../../../../config/siteUrl'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../../../lib/cache/tags'
import { getCachedCategoryData, preloadCategory } from '../../../../lib/data/preload'
import type { DomainCategory } from '../../../../lib/type-converters'
import { mapDatabaseCategoryToDomain } from '../../../../lib/type-converters'
import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../../../types/db-rows'
import type { FamilyListItem } from '../../../../types/ui-models'
import { DEFAULT_TENANT_ID } from '../../../../utils/tenantConstants'
import PageComponent from '../../../../views/CategoryPage'

/**
 * Sayfa başına AİLE sayısı.
 *
 * ⭐24 → 48 (REC-59, 2026-09-08). NİÇİN: `?page=` sorgu parametresi bu rotayı DİNAMİK
 * yapıyordu (Next 15: `searchParams` alan sayfa build'de prerender edilemez). Parametreyi
 * kaldırmak için iki yol vardı — ayrı bir sayfalama segmenti açmak (`/sayfa/2`), ya da
 * sayfa boyunu bütün kategoriler tek sayfaya sığacak kadar büyütmek.
 *
 * ÖLÇÜM KARARI VERDİ: canlı DB'de 23 aktif kategoriden YALNIZ BİRİ 24'ü aşıyor (fans, 34
 * aile); ikincisi 12, üçüncüsü 6. Yani sayfalama 46 adresin yalnız birinde tetikleniyordu.
 * 48 sayfa boyu ile hepsi tek sayfaya sığar, parametre kalkar, ADRES DEĞİŞMEZ ve hiçbir
 * yönlendirme gerekmez. Segment açmak, bir adres için tüm adres şemasını değiştirmek olurdu.
 *
 * ⚠BU SAYI BİR TAVANDIR VE BÜYÜYEBİLİR: en kalabalık kategori 48'i aştığı gün sayfalama
 * sessizce eksik liste basar (48'den sonrası GÖRÜNMEZ). O yüzden `INV-KATEGORI-STATIK-1`
 * bir kol olarak "en kalabalık kategori ≤ PAGE_SIZE" ölçer ve aşıldığı gün KIRMIZI verir —
 * o gün ayrı segment işi açılır. Sessiz eksilme değil, açık kırmızı.
 */
const PAGE_SIZE = 48

/**
 * Aile listesi önbelleği. Anahtar SaaS kuralı gereği hem `lang` hem `tenantId`
 * hem de kategori + sayfa içerir (kural 12); etiketler ana sayfa (home-data) değil
 * KEŞİF (discovery) alanıdır — stok hareketi bu listeyi thrash etmez (PS-042).
 */
const getCachedFamilies = (
  lang: string,
  tenantId: string,
  categoryId: string,
  page: number,
  categoryIds: string[]
) => unstable_cache(
  async () => getFamiliesEnriched(supabase, {
    categoryIds,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  }),
  ['category-families', lang, tenantId, categoryId, String(page)],
  // revalidate: 3600 = emniyet kemeri (webhook sinyali kaçarsa en fazla 1 saat bayat).
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/**
 * ⭐SAYFA DAİMA 1 (REC-59). `?page=` kalktı — `parsePageParam` ile birlikte, çünkü artık
 * okunacak bir parametre yok. Sabit, `unstable_cache` anahtarında ve JSON-LD'de niçin hâlâ
 * bir "sayfa" kavramı geçtiğini açıklamak için duruyor: veri katmanı sayfalamayı destekliyor,
 * bu rota onu KULLANMIYOR. Segment tabanlı sayfalama gerekirse (bkz. PAGE_SIZE notu) burası
 * yeniden okunur.
 */
const SAYFA = 1

// React.cache() ile bağımsız Supabase ORM sorgusu (L10_05 Kurumsal Disiplini)
const _getCachedSupabaseData = cache((id: string) => {
  return supabase.from('categories').select('*').eq('id', id).single()
})


/**
 * ⭐DENEY (REC-59, geri alınabilir): rota sınıfını AÇIKÇA ilan et.
 * `about` rotası bunu yazıyor ve üretilen HTML'inde CSR bailout işareti YOK (ölçüldü: 0);
 * kategori yazmıyordu ve 2 işaret taşıyordu. `force-static` altında `useSearchParams()`
 * boş döner ve bailout üretmez — yani işaretin kaynağını bileşen bileşen aramak yerine
 * rotayı ait olduğu sınıfa koymak.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug, metadata')
    .eq('is_active', true)

  const categoriesList = (data || []) as { slug: string | null, metadata: unknown }[]
  // Her dil için O DİLİN görünen slug'ı üretilir (tr → metadata.slug.tr, en → kanonik).
  return categoriesList.flatMap((c) => [
    { lang: 'tr', categorySlug: getLocalizedCategorySlug(c, 'tr') },
    { lang: 'en', categorySlug: getLocalizedCategorySlug(c, 'en') }
  ])
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string, lang: string }> }) {
  const { categorySlug, lang } = await params
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)
  
  if (!category) {
    return {
      title: lang === 'en' ? 'Category Not Found | VentHub' : 'Kategori Bulunamadı | VentHub',
    }
  }

  // SSOT: kategori adı DAİMA getCategoryDisplayName üzerinden çözülür
  // (translation_key → menu_label → name). Server Component olduğumuz için useI18n yok;
  // t'yi aktif dilin sözlüğünden kuruyoruz — aksi halde TR sayfada ham İngilizce DB adı sızar.
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t)

  const desc = lang === 'en'
    ? `Explore the highest quality and most economical ventilation products in the ${displayName} category.`
    : `${displayName} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`

  // hreflang: her dil kendi görünen slug'ıyla bildirilir; x-default = TR.
  const trUrl = `${SITE_URL}/tr/category/${getLocalizedCategorySlug(category, 'tr')}`
  const enUrl = `${SITE_URL}/en/category/${getLocalizedCategorySlug(category, 'en')}`
  const canonicalUrl = lang === 'en' ? enUrl : trUrl

  return {
    title: `${displayName} | VentHub`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
    },
    openGraph: {
      title: `${displayName} | VentHub`,
      description: desc,
      url: canonicalUrl,
      siteName: 'VentHub',
      images: [
        {
          url: category.image_url || '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ categorySlug: string, lang: string }>
}) {
  const { categorySlug, lang } = await params
  const page = SAYFA
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)

  // ⭐OLMAYAN KATEGORİ GERÇEK 404 DÖNER (2026-09-08, REC-205 kardeşi — canlı ölçüm).
  //
  // Eskiden `category` null iken sayfa kendi "Kategori Bulunamadı" görünümünü çiziyor ve
  // HTTP **200** dönüyordu. Canlıda ölçüldü: uydurma bir slug (`boyle-bir-kategori-yok-12345`)
  // 200 + `noindex` YOK ile yanıtlanıyordu — klasik soft-404. Google böyle sayfaları tarar ve
  // "Kopya / standart sayfa yok" kutusuna yazar; REC-205'te şikâyet edilen kutu tam budur.
  //
  // Rota statiğe geçince kusurun ÖMRÜ uzadı: üretilen "bulunamadı" sayfası artık CDN'de
  // saklanıyor (ölçümde `X-Vercel-Cache: HIT`). Kusur yeni değil, kalıcı hâle geldi.
  //
  // `notFound()` güvenli, çünkü yokluk ile ölçüm hatası ARTIK AYRI: `getCachedCategoryData`
  // sorgu düştüğünde `throw` eder (5xx, önbelleğe girmez), yalnız gerçekten satır yoksa null
  // döner. Bu ayrım olmadan geçici bir DB arızası kalıcı 404 üretirdi.
  if (!category) {
    notFound()
  }

  // Gelen slug aktif dilin görünen slug'ı değilse (ör. kanonik EN slug /tr/ altında,
  // ya da eski TR kanonik slug) doğru dil URL'ine 308 ile kalıcı yönlendir.
  {
    const expectedSlug = getLocalizedCategorySlug(category, lang)
    if (expectedSlug && expectedSlug !== categorySlug) {
      permanentRedirect(`/${lang}/category/${expectedSlug}`)
    }
  }

  const dict = lang === 'en' ? en : tr
  // SSOT: JSON-LD adı da sözlükten çözülür (bkz. generateMetadata yorumu)
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t) || categorySlug

  let families: FamilyListItem[] = []
  let total = 0
  let subCategories: DomainCategory[] = []

  if (category) {
    // ⭐DERLEME SABİTİ, `headers()` DEĞİL (REC-59). Eskiden `(await getTenantConfig()).id`
    // idi ve o çağrı `next/headers` okuduğu için bu rotayı İSTEK ANINDA render edilmeye
    // zorluyordu — build "Route ... couldn't be rendered statically because it used
    // `headers`" diyordu ve 46 kategori adresinin HİÇBİRİ önceden üretilmiyordu.
    //
    // NİÇİN GÜVENLİ, ÖLÇÜLDÜ (2026-09-08, canlı DB): `categories` (30), `product_families`
    // (47) ve `products` (442) satırlarının TAMAMI tek `tenant_id` taşıyor ve o değer
    // `DEFAULT_TENANT_ID` ile BİREBİR aynı. Yani sabit, bugün zaten dönen değerdir.
    //
    // ⭐DAHASI: bu değişiklik SESSİZ BİR RİSKİ KAPATIYOR. Tazeleme webhook'u `tenantId`yi
    // DB SATIRINDAN alıyor (`api/webhook/supabase/route.ts` → `activeRecord.tenant_id`),
    // sayfa ise BAŞLIKTAN alıyordu. İkisi bir gün ayrışsaydı webhook
    // `products-discovery-<X>` etiketini tazeler, sayfa `products-discovery-<Y>` ile
    // önbelleklenmiş olurdu ve tazeleme ISKALARDI — hiçbir kapı görmeden. Tek sabit, iki
    // kaynağı teke indirir.
    //
    // Çok-kiracılı yapı PARK'ta (Recep kararı 2026-08-28, REC-88). Geri açılırsa doğru yol
    // kiracı başına ayrı yayın olur; RSC render yolunda `headers()` okumak değil.
    const tenantId = DEFAULT_TENANT_ID

    // SSR: Alt kategorilerin tam verisini çek — client-side hydration race'ini ortadan kaldır
    const [{ data: subsData }, { data: countsData }] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content')
        .eq('parent_id', category.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase.rpc('get_category_counts')
    ])

    // Ürünü OLMAYAN alt kategoriler gizlenir — CategoryContext istemcide aynı count>0
    // süzgeçini uyguluyordu; SSR'da uygulanmayınca hydration'da kart zıplaması oluyordu.
    const countMap = new Map<string, number>()
    for (const row of countsData ?? []) {
      countMap.set(row.category_id, row.product_count ?? 0)
    }

    const categoriesArray = (subsData || []) as DbCategory[]
    subCategories = categoriesArray
      .filter((s) => (countMap.get(s.id) ?? 0) > 0)
      .map(s => mapDatabaseCategoryToDomain({
        ...s,
        name: s.name || '',
        menu_label: s.menu_label as string | null,
        marketing_title: s.marketing_title as string | null,
        translation_key: s.translation_key as string | null,
        description: s.description as string | null,
        metadata: s.metadata as CategoryMetadata | null,
        authority_content: s.authority_content as AuthorityContent | null
      } as DbCategory))

    const categoryIds = [category.id, ...subCategories.map(s => s.id)]

    const familiesPage = await getCachedFamilies(lang, tenantId, category.id, page, categoryIds)
    families = familiesPage.items
    total = familiesPage.total
  }

  // W3.1 (B9): itemListElement URL'lerine /${lang} prefix'i buildCategoryJsonLd
  // içinde garanti edilir (eski kod dilsiz `${SITE_URL}/products/${slug}` yazıyordu).
  const jsonLd = buildCategoryJsonLd({
    lang,
    baseUrl: SITE_URL,
    categorySlug,
    name: displayName,
    description: lang === 'en' ? `Products in category ${displayName}` : `${displayName} kategorisindeki ürünler`,
    total,
    page,
    pageSize: PAGE_SIZE,
    families,
  })

  assertNoUuid(jsonLd)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
        <PageComponent
          initialCategory={category}
          families={families}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          initialSubCategories={subCategories}
        />
      </React.Suspense>
    </>
  )
}
