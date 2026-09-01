import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbCategory } from '../../types/db-rows'
import type { FamilyListItem } from '../../types/ui-models'

// F5-B W2.x — Aile (product_families) servis katmanı.
// Vitrin listeleri varyant satırı değil AİLE satırı tüketir (PS-041);
// veri kaynağı DB tarafındaki iki RPC'dir (20260812_f5b_family_rpcs.sql).

export interface GetFamiliesParams {
  categoryIds?: string[]
  searchQuery?: string
  brand?: string
  /** RPC tarafında 96'ya kadar kırpılır. */
  limit?: number
  offset?: number
}

export interface FamiliesPage {
  items: FamilyListItem[]
  /** Sayfalama toplamı (window count) — filtre setine göre toplam aile sayısı. */
  total: number
}

export async function getFamiliesEnriched(
  supabase: SupabaseClient<Database>,
  params: GetFamiliesParams = {}
): Promise<FamiliesPage> {
  const { data, error } = await supabase.rpc('get_product_families_enriched', {
    p_category_ids: params.categoryIds,
    p_limit: params.limit ?? 24,
    p_offset: params.offset ?? 0,
    p_search_query: params.searchQuery,
    p_brand: params.brand,
  })

  if (error) throw error
  const items = (data ?? []) as FamilyListItem[]

  // REC-108: liste RPC'si de ham `f.name` döndürüyor. Dönen id kümesi için ad çevirileri
  // TEK sorguyla çekilip gömülür; hiç satır yoksa hiç sorgu atılmaz. Çeviri BURADA
  // ÇÖZÜLMEZ — sayfa verisi `unstable_cache` içinde tutuluyor ve çözüm burada yapılsaydı
  // önbellek içeriği dile bağımlı olurdu (plan §6.5/B2).
  if (items.length > 0) {
    const { data: cevirRows, error: cevirError } = await supabase
      .from('product_families')
      .select('id,name_i18n')
      .in(
        'id',
        items.map((i) => i.id)
      )

    if (cevirError) throw cevirError
    const cevirById = new Map((cevirRows ?? []).map((r) => [r.id, asAdCevirisi(r.name_i18n)]))
    for (const item of items) item.name_i18n = cevirById.get(item.id) ?? null
  }

  return { items, total: items[0]?.total_count ?? 0 }
}

/** get_family_detail RPC'sinin 'variants' eleman modeli. */
export interface FamilyVariant {
  id: string
  sku: string
  name: string
  slug: string | null
  model_code: string | null
  price: number | null
  stock_qty: number | null
  technical_specs: Record<string, string | number | boolean | null> | null
  /** Dil çözülmüş açıklama (varyant → aile fallback'i RPC'de). */
  description: string | null
  images: { path: string; alt: string | null; sort_order: number }[]
}

export interface FamilyDetail {
  family: {
    id: string
    name: string
    /**
     * REC-108: aile adı çevirileri. RPC bunu DÖNDÜRMEZ (`'name', f.name` — ham kolon);
     * `getFamilyDetail` aşağıda tek ek sorguyla gömer. Alan yalnız TAŞINIR, çözümü
     * render anında `familyName()` yapar (plan §6.5/B2).
     */
    name_i18n?: { tr?: string | null; en?: string | null } | null
    slug: string
    series_code: string | null
    description: { tr?: string | null; en?: string | null } | null
    brand_name: string | null
    category_id: string | null
    subcategory_id: string | null
    meta_title: { tr?: string | null; en?: string | null } | null
    meta_description: { tr?: string | null; en?: string | null } | null
    /**
     * Breadcrumb kategori basamağı için TAM kategori satırı — `category_id`'nin yanında
     * bilerek durur. `getSeriesLanding` bunu K7'de zaten yapıyordu; MODEL dalı yapmıyordu,
     * yani iki dal asimetrikti: seri sayfası kategori ADINI çözebiliyor, ürün sayfası
     * çözemiyordu. Ad çözümü (`getCategoryDisplayName`) id ile değil SATIRLA çalışır
     * (translation_key/menu_label/name orada) — id taşımak yetmez.
     * RPC yalnız id döndürür; satırlar burada tek ek sorguyla gömülür.
     */
    category: DbCategory | null
    subcategory: DbCategory | null
  }
  variants: FamilyVariant[]
  /**
   * W4b: gösterilen fiyatların KDV semantiği. Bireysel/anon brüt (KDV dahil), bayi/kurumsal
   * net görür — etiket buna göre çizilir. RPC kök düzeyinde döndürür; alan taşınmazsa PDP
   * fiyatının KDV durumu hakkında hiçbir bilgi kalmaz (regresyon).
   */
  price_tax_included: boolean | null
}

/**
 * RPC Json dönüşünü FamilyDetail'e daraltan runtime guard.
 * Şema RPC tarafında bizim kontrolümüzde (jsonb_build_object) — burada yalnız
 * sözleşmenin iskeletini (family objesi + variants dizisi) doğrularız.
 */
function parseFamilyDetail(data: unknown): FamilyDetail | null {
  if (typeof data !== 'object' || data === null) return null
  const obj = data as Record<string, unknown>
  const family = obj.family
  const variants = obj.variants
  if (typeof family !== 'object' || family === null || !Array.isArray(variants)) return null
  const taxIncluded = typeof obj.price_tax_included === 'boolean' ? obj.price_tax_included : null
  return { family, variants, price_tax_included: taxIncluded } as FamilyDetail
}

export async function getFamilyDetail(
  supabase: SupabaseClient<Database>,
  slug: string,
  lang: string
): Promise<FamilyDetail | null> {
  const { data, error } = await supabase.rpc('get_family_detail', {
    p_slug: slug,
    p_lang: lang,
  })

  if (error) throw error
  const detail = parseFamilyDetail(data)
  if (!detail) return null

  // Kategori SATIRLARINI göm — `getSeriesLanding` ile BİREBİR aynı desen (aşağıda). RPC yalnız
  // id döndürüyor; ad çözümü (`getCategoryDisplayName`) satır ister. İkisi tek sorguda çekilir;
  // hiçbiri yoksa hiç sorgu atılmaz.
  const categoryIds = [detail.family.category_id, detail.family.subcategory_id].filter(
    (id): id is string => !!id
  )
  let categoryById = new Map<string, DbCategory>()
  if (categoryIds.length > 0) {
    const { data: categoryRows, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)
      .returns<DbCategory[]>()

    if (categoryError) throw categoryError
    categoryById = new Map((categoryRows ?? []).map((c) => [c.id, c]))
  }

  detail.family.category = detail.family.category_id
    ? (categoryById.get(detail.family.category_id) ?? null)
    : null
  detail.family.subcategory = detail.family.subcategory_id
    ? (categoryById.get(detail.family.subcategory_id) ?? null)
    : null

  // REC-108: AD ÇEVİRİLERİ. RPC ham `f.name` döndürüyor; `name_i18n` kolonu DB'de dolu
  // ama RPC'de hiç referansı yok. RPC'yi yeniden tanımlamak yerine (dönüş tipi değişince
  // `drop` gerekir ve önceki migration'ların eklediği alanların elle taşınması riski
  // doğar — bkz. plan §3) alan burada gömülür: kategori satırlarıyla BİREBİR aynı desen.
  detail.family.name_i18n = await getAileAdCevirisi(supabase, detail.family.id)

  return detail
}

/** `product_families.name_i18n` — tek aile için (PDP yolu). Satır yoksa `null`. */
async function getAileAdCevirisi(
  supabase: SupabaseClient<Database>,
  familyId: string
): Promise<{ tr?: string | null; en?: string | null } | null> {
  const { data, error } = await supabase
    .from('product_families')
    .select('name_i18n')
    .eq('id', familyId)
    .maybeSingle()

  if (error) throw error
  return asAdCevirisi(data?.name_i18n)
}

/**
 * `name_i18n` JSONB'sini daraltan runtime guard. `Json` tipi her şey olabilir; dizi ya
 * da skaler gelirse `null` döneriz — `familyName()` o zaman ham ada düşer (güvenli).
 */
function asAdCevirisi(deger: unknown): { tr?: string | null; en?: string | null } | null {
  if (typeof deger !== 'object' || deger === null || Array.isArray(deger)) return null
  const obj = deger as Record<string, unknown>
  const tr = typeof obj.tr === 'string' ? obj.tr : null
  const en = typeof obj.en === 'string' ? obj.en : null
  if (tr === null && en === null) return null
  return { tr, en }
}

/**
 * T138-VH K1 — SERİ LANDING modeli.
 *
 * `product_families.parent_family_id` (20260821180000) hiyerarşiyi TEK seviye tutar:
 * `NULL` = **seri** (landing sayfası), `NOT NULL` = **model** (vitrin kartı).
 * Seri satırının doğrudan varyantı YOKTUR — bu yüzden `get_product_families_enriched`
 * onu inner-join ile eler ve `get_family_detail` boş `variants` döndürür. Yani seri
 * slug'ı bugün PDP zincirinde "ürün bulunamadı" kutusuna düşer (soft-404, HTTP 200).
 * Bu fonksiyon o boşluğu doldurur: seri + altındaki MODEL kartları.
 *
 * Kart modeli KASITLI olarak `FamilyListItem` — vitrin kartı (`FamilyCard`) ile birebir
 * aynı sözleşme; seri sayfası kendi kart tipini icat etmez.
 *
 * Cetvel: docs/standards/product-schema-standard.md §11.5 (MODEL KATMANI).
 */
export interface SeriesLanding {
  series: {
    id: string
    name: string
    /** REC-108: ad cevirileri — TASINIR, cozumu render aninda familyName() yapar. */
    name_i18n?: { tr?: string | null; en?: string | null } | null
    slug: string
    series_code: string | null
    description: { tr?: string | null; en?: string | null } | null
    brand_name: string | null
    category_id: string | null
    subcategory_id: string | null
    /**
     * T138-VH K7 — breadcrumb + JSON-LD hiyerarşisi için gömülü kategori/alt kategori.
     * `category_id`/`subcategory_id` YALNIZ id taşır; görünen ad (`getCategoryDisplayName`)
     * ve görünen slug (`getLocalizedCategorySlug`) tam `DbCategory` satırı ister — bu yüzden
     * ayrı bir sorguyla (aşağıda) doldurulur. İkisi de yoksa `null` (breadcrumb kısalır,
     * kırılmaz — CategoryLandingView/CategorySeriesView'daki "parentVm yoksa basamak yok"
     * kuralıyla aynı desen).
     */
    category: DbCategory | null
    subcategory: DbCategory | null
  }
  /** Seri altındaki modeller — aktif varyantı olmayan model listeye GİRMEZ (RPC ile aynı kural). */
  models: FamilyListItem[]
}

/** PostgREST gömülü tekil ilişkiyi sürüme göre nesne veya tek elemanlı dizi olarak verir. */
function embeddedBrandName(brands: { name: string } | { name: string }[] | null): string | null {
  if (!brands) return null
  return Array.isArray(brands) ? (brands[0]?.name ?? null) : brands.name
}

function asLocalizedText(value: unknown): { tr?: string | null; en?: string | null } | null {
  return typeof value === 'object' && value !== null
    ? (value as { tr?: string | null; en?: string | null })
    : null
}

/**
 * Seri slug'ını landing verisine çevirir. Slug bir seri DEĞİLSE (model, ya da hiç yoksa)
 * `null` döner — çağıran o zaman kendi zincirine devam eder.
 *
 * Modeli olmayan seri de `null` döndürür: içi boş bir landing sayfası SEO çöpüdür ve
 * "seri kabuğu yaratıldı ama modelleri bağlanmadı" hatasını GÖRÜNÜR kılmak gerekir
 * (sessiz-boş sınıfı — 404 verir, 200 vermez).
 */
export async function getSeriesLanding(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<SeriesLanding | null> {
  const { data: series, error } = await supabase
    .from('product_families')
    .select(
      'id,name,name_i18n,slug,series_code,description,category_id,subcategory_id,parent_family_id,brands(name)'
    )
    .eq('slug', slug)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  // Satır yok → bu slug bir aile değil. Satır var ama parent DOLU → o bir MODEL:
  // model normal PDP zincirine aittir, landing'e değil.
  if (!series || series.parent_family_id !== null) return null

  const { data: modelRows, error: modelError } = await supabase
    .from('product_families')
    .select(
      'id,name,name_i18n,slug,series_code,description,category_id,subcategory_id,brands(name),products!inner(sku,product_images(path,sort_order))'
    )
    .eq('parent_family_id', series.id)
    .is('deleted_at', null)
    // Aktif varyantı olmayan model gizlenir — `get_product_families_enriched`'in
    // inner-join kuralının PostgREST karşılığı; iki yüzey aynı kuralı uygular.
    .eq('products.status', 'active')
    .is('products.deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (modelError) throw modelError

  const rows = modelRows ?? []
  const models: FamilyListItem[] = rows.map((m) => {
    // Kapak kuralı RPC ile aynı: sku sırasına göre ilk aktif varyantın ilk görseli.
    const variants = [...m.products].sort((a, b) => (a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0))
    const coverPath =
      variants
        .flatMap((v) => [...v.product_images].sort((x, y) => x.sort_order - y.sort_order))
        .map((img) => img.path)[0] ?? null

    return {
      id: m.id,
      name: m.name,
      name_i18n: asAdCevirisi(m.name_i18n),
      slug: m.slug,
      series_code: m.series_code,
      description: asLocalizedText(m.description),
      brand_name: embeddedBrandName(m.brands),
      category_id: m.category_id,
      subcategory_id: m.subcategory_id,
      cover_image_path: coverPath,
      variant_count: variants.length,
      // FamilyCard fiyat BASMAZ (PS-042, Recep kararı 2026-08-15) — buradan fiyat
      // sızdırmak, motor fiyatı (display_price) yerine ham kolonu göstermek olurdu.
      min_price: null,
      total_count: rows.length,
    }
  })

  if (models.length === 0) return null

  // T138-VH K7: breadcrumb kategori basamağı için tam kategori satırı (ad + görünen slug).
  // `category_id`/`subcategory_id` zaten seride var — ayrı sorgu ikisini BİRLİKTE çeker
  // (tek round-trip; hiçbiri yoksa hiç sorgu atılmaz).
  const categoryIds = [series.category_id, series.subcategory_id].filter(
    (id): id is string => !!id
  )
  let categoryById = new Map<string, DbCategory>()
  if (categoryIds.length > 0) {
    const { data: categoryRows, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)
      .returns<DbCategory[]>()

    if (categoryError) throw categoryError
    categoryById = new Map((categoryRows ?? []).map((c) => [c.id, c]))
  }

  return {
    series: {
      id: series.id,
      name: series.name,
      name_i18n: asAdCevirisi(series.name_i18n),
      slug: series.slug,
      series_code: series.series_code,
      description: asLocalizedText(series.description),
      brand_name: embeddedBrandName(series.brands),
      category_id: series.category_id,
      subcategory_id: series.subcategory_id,
      category: series.category_id ? (categoryById.get(series.category_id) ?? null) : null,
      subcategory: series.subcategory_id
        ? (categoryById.get(series.subcategory_id) ?? null)
        : null,
    },
    models,
  }
}

/**
 * Seri (parent_family_id IS NULL **ve** en az bir modeli olan) slug'ları.
 *
 * Bunlar liste RPC'sinden GELMEZ: RPC aktif varyantı olmayan aileyi eler, seri satırının
 * ise doğrudan varyantı yoktur. Ayrı çekilmezse seri landing sayfaları ne sitemap'te
 * ne `generateStaticParams`'ta olur — sessiz boşluk.
 */
async function getSeriesSlugs(supabase: SupabaseClient<Database>): Promise<{ slug: string }[]> {
  const { data: children, error } = await supabase
    .from('product_families')
    .select('parent_family_id')
    .not('parent_family_id', 'is', null)
    .is('deleted_at', null)

  if (error) throw error

  const parentIds = [
    ...new Set((children ?? []).map((c) => c.parent_family_id).filter((v): v is string => !!v)),
  ]
  if (parentIds.length === 0) return []

  const { data: parents, error: parentError } = await supabase
    .from('product_families')
    .select('slug')
    .in('id', parentIds)
    .is('deleted_at', null)

  if (parentError) throw parentError
  return (parents ?? []).map((p) => ({ slug: p.slug }))
}

/**
 * Sitemap/statik üretim için aile slug listesi — boş aile (aktif varyantsız)
 * RPC tarafından zaten gizlenir; ayrı bir sorgu tutmamak için liste RPC'si kullanılır.
 * T138 K1: SERİ slug'ları RPC'de görünmediği için ayrıca eklenir (bkz. `getSeriesSlugs`).
 */
export async function getAllFamilySlugs(
  supabase: SupabaseClient<Database>
): Promise<{ slug: string }[]> {
  // SESSİZ KIRPMA YASAK: tek sayfa yerine total'e ulaşana kadar SAYFALAYARAK tüketilir.
  // (Ölçüm 2026-08-21: sabit limit 96 + total yok sayımı; model katmanıyla aile sayısı
  // 96'yı aşınca sitemap ve generateStaticParams sessizce kesilirdi — T138 ön-koşulu,
  // render-dalga1 §W5. Bekçi: INV-FAMILY-SLUGS-1.)
  const PAGE = 96
  const MAX_PAGES = 50 // 4800 aile tavanı — sonsuz döngü emniyeti
  const slugs: { slug: string }[] = []
  let offset = 0
  let total = 0
  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, total: t } = await getFamiliesEnriched(supabase, { limit: PAGE, offset })
    total = t
    slugs.push(...items.map((f) => ({ slug: f.slug })))
    offset += items.length
    if (items.length < PAGE || slugs.length >= total) break
  }
  if (total > 0 && slugs.length < total) {
    // Fail-visible: eksik liste sitemap/SSG'de sessiz boşluk demektir.
    throw new Error(
      'getAllFamilySlugs: ' + slugs.length + '/' + total +
        ' aile alinabildi (sayfalama tavani ' + MAX_PAGES * PAGE + ')'
    )
  }

  // Seri landing slug'ları RPC'de görünmez (yukarıdaki tavan kontrolü RPC toplamına aittir;
  // bu yüzden birleştirme kontrolden SONRA yapılır, aksi halde eşitlik sahte kırmızı verirdi).
  const seen = new Set(slugs.map((s) => s.slug))
  for (const s of await getSeriesSlugs(supabase)) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug)
      slugs.push(s)
    }
  }
  return slugs
}
