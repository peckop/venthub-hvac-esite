import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import React, { cache } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { kategoriKanonikAdresi } from '@/lib/data/kategoriSegmenti'
import type { KategoriUst } from '@/lib/data/preload'
import { assertNoUuid, buildCategoryJsonLd } from '@/lib/seo/jsonld'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { SITE_URL } from '../../config/siteUrl'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../lib/cache/tags'
import type { DomainCategory } from '../../lib/type-converters'
import { mapDatabaseCategoryToDomain } from '../../lib/type-converters'
import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../types/db-rows'
import type { FamilyListItem } from '../../types/ui-models'
import { kategoriMetniniIndir } from '../../utils/categoryHelpers'
import { aileMetniniIndir } from '../../utils/dilMetni'
import { DEFAULT_TENANT_ID } from '../../utils/tenantConstants'
import PageComponent from '../../views/CategoryPage'

/**
 * KATEGORİ SAYFASI — üst veri + gövde, İKİ rotanın ortak çekirdeği (REC-300 Faz 3b-2).
 *
 * NİÇİN AYRI MODÜL (aileSayfasi.tsx ile aynı gerekçe): bu kod 2026-09-25'e kadar yalnız
 * `app/[lang]/category/[categorySlug]/page.tsx`'in içindeydi. K3-b şeması aynı sayfayı
 * `/tr/kategori/<kök>[/<dal>]` adresinde (ve bayrak açıkken EN iki seviyeli adreste) çizecek.
 * Gövdeyi kopyalamak iki kaynağı ayrıştırırdı — REC-205'te aynı nesne iki farklı sayfadan
 * yayınlanınca Google zayıf olanı eledi. Rotalar bu modülü çağırır.
 *
 * Taşıma BİREBİR: davranış değişikliği yok. Sayfa sınıfı ilanları (`dynamic`, `revalidate`,
 * `generateStaticParams`) rota dosyalarında kalır — Next.js onları yalnız rota modülünden okur.
 */

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

/** Başlık + açıklama — iki kipin ortak metni (sözlükten; RSC olduğumuz için `t` elle kurulur). */
function kategoriMetinleri(lang: string, category: DomainCategory) {
  // SSOT: kategori adı DAİMA getCategoryDisplayName üzerinden çözülür
  // (translation_key → menu_label → name). Server Component olduğumuz için useI18n yok;
  // t'yi aktif dilin sözlüğünden kuruyoruz — aksi halde TR sayfada ham İngilizce DB adı sızar.
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t)

  const desc = lang === 'en'
    ? `Explore the highest quality and most economical ventilation products in the ${displayName} category.`
    : `${displayName} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`
  return { displayName, desc }
}

/** Kategori bulunamadığında üst veri (sayfa 404/308 verir; başlık yine dili bilir). */
export function kategoriBulunamadiUstVerisi(lang: string): Metadata {
  return {
    title: lang === 'en' ? 'Category Not Found | VentHub' : 'Kategori Bulunamadı | VentHub',
  }
}

/**
 * BUGÜNKÜ üst veri (bayrak KAPALI) — `category/[categorySlug]/page.tsx`'ten BİREBİR taşındı.
 * Adresler bugünkü şemada (`/tr/category/<slug>` tek seviye).
 */
export function kategoriSayfasiUstVerisi(lang: string, category: DomainCategory): Metadata {
  const { displayName, desc } = kategoriMetinleri(lang, category)

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

/**
 * K3-b üst verisi (bayrak AÇIK): canonical, hreflang ve og:url `adresUret`'ten (kategoriKanonikAdresi),
 * ortak kalıp `sayfaUstVerisi` (dil yolları + EN dizin dışılığı). Dal adresi iki seviyeli.
 */
export function kategoriSayfasiUstVerisiK3b(
  lang: string,
  category: DomainCategory,
  ust: KategoriUst | null,
): Metadata {
  const { displayName, desc } = kategoriMetinleri(lang, category)
  const trYol = kategoriKanonikAdresi(category, ust, 'tr')
  const enYol = kategoriKanonikAdresi(category, ust, 'en')
  const m = sayfaUstVerisi({
    lang,
    yol: lang === 'en' ? enYol : trYol,
    dilYollari: { tr: trYol, en: enYol },
    baslik: `${displayName} | VentHub`,
    aciklama: desc,
  })
  return {
    ...m,
    openGraph: {
      ...m.openGraph,
      images: [
        {
          url: category.image_url || '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

export interface KategoriSayfasiProps {
  lang: string
  category: DomainCategory
  /** Adresteki (görünen) slug — JSON-LD ve ad yedeği için; bugünkü rotayla aynı girdi. */
  categorySlug: string
}

/** Kategori sayfası gövdesi — alt kategoriler + aile listesi + JSON-LD + görünüm. */
export async function KategoriSayfasi({ lang, category, categorySlug }: KategoriSayfasiProps) {
  const page = SAYFA

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
        // `marketing_title` KASITEN YOK — emekli alan (REC-297); gerekçe `preload.ts`
        // CATEGORY_COLUMNS başlığında. Bekçi: INV-MARKETING-YUK-1.
        .select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, menu_label, metadata, translation_key, authority_content')
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
        translation_key: s.translation_key as string | null,
        description: s.description as string | null,
        metadata: s.metadata as CategoryMetadata | null,
        authority_content: s.authority_content as AuthorityContent | null
      } as DbCategory))

    const categoryIds = [category.id, ...subCategories.map(s => s.id)]

    const familiesPage = await getCachedFamilies(lang, tenantId, category.id, page, categoryIds)
    // INV-DIL-DUSUSU-1: aile satırı {tr,en} açıklamayı taşır; kart göstermese de istemciye
    // giden gömülü veriye yazılıyordu (2026-09-23 ölçümü, /en/category/fans) → sayfanın diline iner.
    families = familiesPage.items.map((f) => aileMetniniIndir(f, lang))
    total = familiesPage.total
  }

  // W3.1 (B9): itemListElement URL'lerine /${lang} prefix'i buildCategoryJsonLd
  // içinde garanti edilir (eski kod dilsiz `${SITE_URL}/products/${slug}` yazıyordu).
  // ⚠K3-b: JSON-LD adresleri bugünkü şemada kalır — `buildCategoryJsonLd`'nin `adresUret`'e
  // bağlanması REC-300 Faz 3d'nin (yüzeyler, plan madde 2/7) işidir; bayrak kapalıyken fark yok.
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
        {/* INV-DIL-DUSUSU-1 gömülü katman: istemciye yalnız sayfanın dilindeki metin gider. */}
        <PageComponent
          initialCategory={kategoriMetniniIndir(category, lang)}
          families={families}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          initialSubCategories={subCategories.map((s) => kategoriMetniniIndir(s, lang))}
        />
      </React.Suspense>
    </>
  )
}
