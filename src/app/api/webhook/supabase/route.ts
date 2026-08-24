import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import {
  discoveryTag,
  familyTag,
  HOME_DATA_TAG,
  homeDataTag,
  PRODUCTS_DISCOVERY_TAG,
  variantStockTag,
} from '@/lib/cache/tags'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
// Yalnız `type` import eden saf yardımcı (React/i18n/client bağımlılığı YOK — ölçüldü),
// bu yüzden route handler'da güvenle kullanılır.
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

export const dynamic = 'force-dynamic'

// PS-042: products UPDATE'inde keşif (discovery) tag'lerini yalnız bu alanlardan
// biri değiştiyse tetikleriz. old_record yoksa (bkz. hasOldRecord) karşılaştırma
// yapılamaz ve mevcut davranış (her zaman tetikle) korunur.
const PRODUCT_DISCOVERY_SENSITIVE_FIELDS = [
  'status',
  'family_id',
  'category_id',
  'subcategory_id',
  'deleted_at',
] as const

function hasDiscoverySensitiveChange(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown>
): boolean {
  return PRODUCT_DISCOVERY_SENSITIVE_FIELDS.some((field) => record[field] !== oldRecord[field])
}

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: Record<string, unknown> | null
  old_record: Record<string, unknown> | null
}

/**
 * T138-VH K6 — SERİ↔MODEL zinciri.
 *
 * `product_families.parent_family_id` (2026-08-21 prod'a uygulandı): `NULL` = seri (landing),
 * `NOT NULL` = model (kart/PDP). Bir MODEL değiştiğinde iki sayfa bayatlar: modelin kendi PDP'si
 * VE üstündeki SERİ landing'i (seri sayfası model kartını basıyor). Bu yürüyüş ikisini de bulur.
 *
 * Hiyerarşi DB'de tek seviyeli garantilenir (`product_families_single_level_guard` tetiği —
 * bkz. 20260821180000_t138_parent_family_id.sql: bir modelin ebeveyni asla model olamaz). Ama bu
 * route DB kısıtına KÖR — guard atlatılırsa (manuel UPDATE, ileride şema değişikliği) sonsuz/aşırı
 * sorguya düşmemek için MAX_FAMILY_CHAIN_HOPS + döngü koruması (seen) savunma katmanı olarak durur.
 * Sınır aşılırsa SESSİZCE KIRPILMAZ: console.error ile loglanır VE çağıranın `truncated` bayrağı
 * üzerinden yanıt gövdesinde (`fanoutTruncated`) ölçülebilir sinyale dönüşür.
 */
const MAX_FAMILY_CHAIN_HOPS = 4

interface FamilyChainRow {
  id: string
  slug: string | null
  parent_family_id: string | null
}

async function familyRowById(familyId: string | undefined): Promise<FamilyChainRow | null> {
  if (!familyId) return null
  const { data } = await supabase
    .from('product_families')
    .select('id, slug, parent_family_id')
    .eq('id', familyId)
    .single()
  return data ?? null
}

/**
 * `startId`'den başlayıp ebeveyn zincirini (tek seviyeli hiyerarşide: kendisi + varsa serisi)
 * yürür. Slug listesini sırayla (kendi önce) ve tekilleştirilmiş döndürür.
 */
async function walkFamilyChain(
  startId: string | undefined
): Promise<{ slugs: string[]; truncated: boolean }> {
  const slugs: string[] = []
  const seen = new Set<string>()
  let currentId = startId
  let hops = 0
  let truncated = false

  while (currentId) {
    if (hops >= MAX_FAMILY_CHAIN_HOPS) {
      truncated = true
      console.error(
        `[Supabase Webhook] product_families zincir yürüyüşü MAX_FAMILY_CHAIN_HOPS ` +
        `(${MAX_FAMILY_CHAIN_HOPS}) sınırına ulaştı — startId=${startId}, currentId=${currentId}. ` +
        'Tek-seviye guard (product_families_single_level_guard) atlatılmış olabilir; DB kontrol edilmeli.'
      )
      break
    }
    if (seen.has(currentId)) {
      truncated = true
      console.error(`[Supabase Webhook] product_families zincirinde DÖNGÜ tespit edildi — id=${currentId}. Yürüyüş durduruldu.`)
      break
    }
    seen.add(currentId)

    const row = await familyRowById(currentId)
    if (!row) break
    if (row.slug) slugs.push(row.slug)
    currentId = row.parent_family_id ?? undefined
    hops += 1
  }

  return { slugs: [...new Set(slugs)], truncated }
}

/**
 * Bir aile id'si için kendi + (varsa) seri sayfasını tazeler (path + familyTag).
 * `products` / `inventory_movements` / `product_prices` / `product_images` dallarının
 * hepsi buradan geçer — böylece "model değişti, serisi bayatladı" boşluğu TEK yerde kapanır.
 */
async function revalidateFamilyChain(
  familyId: string | undefined
): Promise<{ paths: string[]; tags: string[]; truncated: boolean }> {
  const { slugs, truncated } = await walkFamilyChain(familyId)
  const paths: string[] = []
  const tags: string[] = []

  for (const slug of slugs) {
    for (const lang of ['tr', 'en'] as const) {
      const p = `/${lang}/products/${slug}`
      revalidatePath(p)
      paths.push(p)
    }
    revalidateTag(familyTag(slug))
    tags.push(familyTag(slug))
  }

  return { paths, tags, truncated }
}

/** Kategori yolu çözmek için gereken minimum satır (slug + metadata). */
type CategoryRow = { id?: string; slug: string | null; metadata?: unknown; parent_id?: string | null }

/**
 * KATEGORİ YOLLARI — W1 + W2 (render-dalga1 planı).
 *
 * ⚠️ Buradaki iki kusur denetimle ölçüldü ve TR yüzeyini tamamen kör bırakıyordu:
 *
 *  W1 — Yol **kanonik EN slug** ile kuruluyordu (`/tr/category/<en-slug>`). TR sayfası
 *       `metadata.slug.tr` ile prerender edildiği için TR yolu HİÇ geçersiz kılınmıyordu:
 *       kategori değişir, Türkçe vitrin eski hâlinde donar. Artık dil başına doğru slug
 *       `getLocalizedCategorySlug` ile çözülür (CLAUDE.md kural 7 — kanonik EN, görünen
 *       URL dile göre). Kanonik yol da tazelenmeye DEVAM eder: 308 kaynağı olsa bile
 *       prerender edilmiş olabilir, kaldırmak yeni bir delik açardı.
 *
 *  W2 — 14 `revalidatePath` çağrısının tamamı TEK segmentliydi; `/category/[c]/[s]`
 *       (alt-kategori) hiç tazelenmiyordu. Artık `parent_id` varsa iki segmentli yol da
 *       üretilir.
 *
 * Yollar tekilleştirilir: iki dilin slug'ı aynı olabilir (çeviri yoksa kanoniğe düşer).
 */
function categoryPathsFor(category: CategoryRow, parent: CategoryRow | null): string[] {
  const paths = new Set<string>()
  const canonical = category.slug ?? ''

  for (const lang of ['tr', 'en'] as const) {
    const own = getLocalizedCategorySlug(category, lang) || canonical
    if (!own) continue

    paths.add(`/${lang}/category/${own}`)

    if (parent) {
      const parentSlug = getLocalizedCategorySlug(parent, lang) || parent.slug || ''
      if (parentSlug) paths.add(`/${lang}/category/${parentSlug}/${own}`)
    }
  }

  // Kanonik EN yolu her hâlükârda kalsın (yukarıdaki gerekçe).
  if (canonical) {
    paths.add(`/tr/category/${canonical}`)
    paths.add(`/en/category/${canonical}`)
  }

  return [...paths]
}

/** `categories` satırını id ile çeker (yol çözümü için gereken alanlarla). */
async function categoryRowById(id: string | undefined): Promise<CategoryRow | null> {
  if (!id) return null
  const { data } = await supabase
    .from('categories')
    .select('id, slug, metadata, parent_id')
    .eq('id', id)
    .single()
  return data ?? null
}

/** Bir kategori için tüm yolları (kendi + ebeveyn zinciri) tazeler; üretilenleri döndürür. */
async function revalidateCategoryTree(category: CategoryRow): Promise<string[]> {
  const parent = await categoryRowById(category.parent_id ?? undefined)
  const paths = categoryPathsFor(category, parent)
  for (const p of paths) revalidatePath(p)
  return paths
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SupabaseWebhookPayload
    const webhookSecret = request.headers.get('x-webhook-secret')

    /**
     * FAIL-CLOSED. Eski hâli `if (expectedSecret && ...)` idi: env TANIMSIZSA koşul hiç
     * çalışmıyor ve imza doğrulaması TAMAMEN atlanıyordu — yani yapılandırma eksikliği,
     * kapıyı sıkılaştırmak yerine SESSİZCE açıyordu. Bu, bu hafta iki kez düzeltilen
     * fail-open deseninin aynısı (shipping-webhook replay guard'ı, T025-VH).
     *
     * Env yoksa da 401 dönülür (500 değil): eksik yapılandırma, çağırana sunucunun iç
     * durumunu bildirmemeli. Sebep sunucu tarafında `error` seviyesinde loglanır.
     *
     * ROTASYON PENCERESİ (T031-VH). `_NEXT` ikinci bir GEÇERLİ değer tutar ve yalnız
     * rotasyon sırasında tanımlıdır. Aksi hâlde sırrı değiştirmenin kesintisiz yolu
     * yok: DB tetiği ile Vercel env'i aynı anda değişemez, hangisi önce dönerse diğer
     * taraf 401 alır ve **sayfa yenileme sessizce durur** — vitrin bayatlar, hiçbir
     * alarm çalmaz. İki değerin kabul edildiği pencere bu boşluğu kapatır: yeni değer
     * `_NEXT` olarak eklenir, DB tarafı geçirilir, doğrulanır, sonra ana değişkene
     * taşınıp `_NEXT` silinir. Sıra: secret-exposure-audit §4.1.
     *
     * Pencere iki DEĞERİ genişletir, kapıyı değil: liste boşsa istek yine reddedilir
     * ve listede olmayan değer yine 401 alır (INV-WEBHOOK-1 ikisini de davranışsal
     * olarak ölçer).
     */
    const acceptedSecrets = [
      process.env.SUPABASE_WEBHOOK_SECRET,
      process.env.SUPABASE_WEBHOOK_SECRET_NEXT,
    ].filter((s): s is string => typeof s === 'string' && s.length > 0)

    if (acceptedSecrets.length === 0) {
      console.error(
        '[Supabase Webhook] SUPABASE_WEBHOOK_SECRET tanımsız — istek REDDEDİLDİ. ' +
        'Doğrulanamayan çağrı kabul edilmez; env değişkenini ayarlayın.',
      )
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!webhookSecret || !acceptedSecrets.includes(webhookSecret)) {
      console.warn('Unauthorized Supabase webhook attempt blocked.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.warn(`[Supabase Webhook] Received ${payload.type} event on table "${payload.table}"`)

    const { table, type, record, old_record } = payload
    const activeRecord = record || old_record

    if (!activeRecord) {
      return NextResponse.json({ revalidated: false, message: 'No record found in payload' })
    }

    const tenantId = activeRecord.tenant_id as string | undefined

    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []
    // PS-042: products UPDATE'inde alan-bazlı karşılaştırma yapılıp yapılamadığını
    // (old_record var mı) yanıtta raporlamak için.
    let discoveryComparisonSkipped = false
    // T138-VH K6: seri↔model zincir yürüyüşü üst sınırı aştıysa (bkz. walkFamilyChain)
    // burada toplanır ve yanıt gövdesinde görünür olur — sessizce kırpma YOK.
    let fanoutTruncated = false

    // PS-042: keşif (discovery) tag'leri yalnız keşfi etkileyen değişimde tetiklenir.
    // products UPDATE'inde bu, duyarlı alan (status/family_id/category_id/subcategory_id/
    // deleted_at) karşılaştırmasıyla belirlenir; old_record yoksa karşılaştırma yapılamaz
    // ve mevcut davranış (her zaman tetikle) korunur. Bu karar hem global hem
    // tenant-scoped keşif tag'lerine AYNI şekilde uygulanır — stok-only UPDATE
    // tenant tag'i üzerinden de cache thrash edemez.
    let shouldRevalidateDiscovery = true
    if (table === 'inventory_movements' || table === 'product_prices') {
      // PS-042: fiyat (product_prices) da stok hareketi gibi keşif önbelleğini
      // asla thrash ETMEZ — Recep kararı: fiyat yalnız PDP'de gösterilir,
      // kartlarda gösterilmez. Bkz. table === 'product_prices' bloğu altındaki not.
      shouldRevalidateDiscovery = false
    } else if (table === 'products' && type === 'UPDATE') {
      if (record && old_record) {
        shouldRevalidateDiscovery = hasDiscoverySensitiveChange(record, old_record)
      } else {
        discoveryComparisonSkipped = true
      }
    }

    if (tenantId && shouldRevalidateDiscovery) {
      revalidateTag(homeDataTag(tenantId))
      revalidateTag(discoveryTag(tenantId))
      revalidatedTags.push(homeDataTag(tenantId), discoveryTag(tenantId))
    }

    // 1. Table: products
    if (table === 'products') {
      /**
       * PDP AİLE KANONİKTİR (`/[lang]/products/[family-slug]`) — ÜRÜN slug'ı değil.
       * Burada eskiden `activeRecord.slug` (ürün slug'ı) tazeleniyordu; prerender edilmiş
       * yol aile slug'ı olduğu için o çağrı VAR OLMAYAN bir yolu geçersiz kılıyordu, yani
       * ürün güncellemesi PDP'yi hiç tazelemiyordu. Sessiz bir kaçaktı; 2026-08-15 denetimi
       * yakaladı. `family_id` payload'da zaten var (`to_jsonb(NEW)`), ek sorgu gerekmez.
       *
       * T138-VH K6: aile MODEL ise (parent_family_id dolu) üstündeki SERİ sayfası da bayatlar —
       * `revalidateFamilyChain` bunu tek sorgu farkıyla (yalnız model ise ek hop) kapsar.
       */
      const { paths: familyChainPaths, tags: familyChainTags, truncated: productFanoutTruncated } =
        await revalidateFamilyChain(activeRecord.family_id as string | undefined)
      revalidatedPaths.push(...familyChainPaths)
      revalidatedTags.push(...familyChainTags)
      if (productFanoutTruncated) fanoutTruncated = true

      if (shouldRevalidateDiscovery) {
        revalidateTag(PRODUCTS_DISCOVERY_TAG)
        revalidateTag(HOME_DATA_TAG)
        revalidatedTags.push(PRODUCTS_DISCOVERY_TAG, HOME_DATA_TAG)
      }

      // If category has changed or is associated, we also revalidate the category path
      const categoryId = activeRecord.category_id as string | undefined
      if (categoryId) {
        const category = await categoryRowById(categoryId)
        if (category) {
          revalidatedPaths.push(...(await revalidateCategoryTree(category)))
        }
      }
    }

    // 2. Table: categories
    else if (table === 'categories') {
      // Payload zaten `to_jsonb(NEW)` — `metadata` ve `parent_id` içinde, ek sorgu gerekmez.
      const self: CategoryRow = {
        id: activeRecord.id as string | undefined,
        slug: (activeRecord.slug as string | null) ?? null,
        metadata: activeRecord.metadata,
        parent_id: (activeRecord.parent_id as string | null) ?? null,
      }
      if (self.slug) {
        revalidatedPaths.push(...(await revalidateCategoryTree(self)))
      }

      /**
       * W2 TERS YÖNÜ — denetimde HİÇ yoktu: bir ÜST kategorinin slug'ı değişirse
       * TÜM çocuklarının iki segmentli yolları değişir. Çocuklar tazelenmezse ebeveyn
       * adı düzelir ama alt-kategori sayfaları eski yolda donar (sessiz bayatlama).
       * Tavan küçük (ölçüm: en fazla 18 satır), tek sorgu yeter.
       */
      if (self.id) {
        const { data: children } = await supabase
          .from('categories')
          .select('id, slug, metadata, parent_id')
          .eq('parent_id', self.id)
        for (const child of children ?? []) {
          const childPaths = categoryPathsFor(child, self)
          for (const p of childPaths) revalidatePath(p)
          revalidatedPaths.push(...childPaths)
        }
      }

      // Revalidate listing caches since categorization structure changed
      revalidateTag(HOME_DATA_TAG)
      revalidateTag(PRODUCTS_DISCOVERY_TAG)
      revalidatedTags.push(HOME_DATA_TAG, PRODUCTS_DISCOVERY_TAG)
    }

    // 3. Table: inventory_movements (Real-time stock movement tracking)
    else if (table === 'inventory_movements') {
      const productId = activeRecord.product_id as string | undefined
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('family_id, category_id')
          .eq('id', productId)
          .single()

        if (product) {
          // Ürün slug'ı DEĞİL aile slug'ı — PDP aile kanoniktir; eskisi var olmayan yolu
          // tazeliyordu (stok hareketi PDP'yi hiç yenilemiyordu). T138-VH K6: aile MODEL ise
          // üstündeki SERİ sayfası da tazelenir (revalidateFamilyChain).
          const { paths: invFamilyPaths, tags: invFamilyTags, truncated: invFanoutTruncated } =
            await revalidateFamilyChain(product.family_id ?? undefined)
          revalidatedPaths.push(...invFamilyPaths)
          revalidatedTags.push(...invFamilyTags)
          if (invFanoutTruncated) fanoutTruncated = true

          // If product is linked to a category, revalidate category path too
          if (product.category_id) {
            const category = await categoryRowById(product.category_id)
            if (category) {
              revalidatedPaths.push(...(await revalidateCategoryTree(category)))
            }
          }
        }
      }

      // PS-042: stok hareketi (inventory_movements) artık keşif (home-data/products-discovery)
      // tag'lerini invalide ETMEZ — yalnız izole variantStockTag() invalide edilir, böylece
      // stok hareketi discovery cache'ini thrash etmez.
      revalidateTag(variantStockTag())
      revalidatedTags.push(variantStockTag())
    }

    // 4. Table: product_families (YENİ — PS-042)
    else if (table === 'product_families') {
      const familySlug = activeRecord.slug as string | undefined
      const parentFamilyId = activeRecord.parent_family_id as string | undefined

      // Aile değişikliği keşif listelerini de etkileyebilir (aile bazlı gruplama/filtreleme)
      revalidateTag(HOME_DATA_TAG)
      revalidateTag(PRODUCTS_DISCOVERY_TAG)
      revalidatedTags.push(HOME_DATA_TAG, PRODUCTS_DISCOVERY_TAG)

      if (familySlug) {
        /**
         * PDP YOLU DA TAZELENMELİ. Eskiden yalnız `familyTag` çağrılıyordu ve o tag'i
         * tüketen HİÇBİR `unstable_cache` yok — yani çağrı sessiz bir no-op'tu; aile adı
         * değişince PDP en fazla ISR yedeğiyle (1 saat) güncelleniyordu. PDP verisi
         * `React.cache()` ile sarılı olduğu için etkili olan şey `revalidatePath`'tir.
         */
        revalidatePath(`/tr/products/${familySlug}`)
        revalidatePath(`/en/products/${familySlug}`)
        revalidatedPaths.push(`/tr/products/${familySlug}`, `/en/products/${familySlug}`)

        revalidateTag(familyTag(familySlug))
        revalidatedTags.push(familyTag(familySlug))
      }

      /**
       * T138-VH K6: bu satır MODEL ise (parent_family_id dolu), üstündeki SERİ landing'i de
       * bayatlar — seri sayfası model kartını basıyor. `parent_family_id` payload'da zaten var
       * (`to_jsonb(NEW)`/`to_jsonb(OLD)`), ek okuma gerekmeden ayrım burada yapılır; yalnız
       * ebeveyn VARSA `walkFamilyChain` ile (savunma amaçlı üst-sınırlı) çözülür.
       */
      if (parentFamilyId) {
        const { slugs: seriesSlugs, truncated: seriesFanoutTruncated } =
          await walkFamilyChain(parentFamilyId)
        for (const slug of seriesSlugs) {
          revalidatePath(`/tr/products/${slug}`)
          revalidatePath(`/en/products/${slug}`)
          revalidatedPaths.push(`/tr/products/${slug}`, `/en/products/${slug}`)
          revalidateTag(familyTag(slug))
          revalidatedTags.push(familyTag(slug))
        }
        if (seriesFanoutTruncated) fanoutTruncated = true
      }
    }

    // 5. Table: product_prices (YENİ — fiyat değişimi → yalnız ilgili ürünün AİLE PDP yolu)
    else if (table === 'product_prices') {
      const productId = activeRecord.product_id as string | undefined
      if (productId) {
        // PDP AİLE kanoniktir (/[lang]/products/[family-slug]), ürün slug'ı değil.
        const { data: product } = await supabase
          .from('products')
          .select('family_id')
          .eq('id', productId)
          .single()

        // T138-VH K6: aile MODEL ise üstündeki SERİ PDP yolu da tazelenir.
        const { paths: priceFamilyPaths, tags: priceFamilyTags, truncated: priceFanoutTruncated } =
          await revalidateFamilyChain(product?.family_id ?? undefined)
        revalidatedPaths.push(...priceFamilyPaths)
        revalidatedTags.push(...priceFamilyTags)
        if (priceFanoutTruncated) fanoutTruncated = true
      }

      // PS-042: fiyat değişimi keşif (home-data/products-discovery) tag'lerini
      // BİLİNÇLİ olarak tetiklemez — Recep kararı: fiyat yalnız PDP'de gösterilir,
      // ürün kartlarında gösterilmez, dolayısıyla keşif önbelleğinin fiyat
      // değişiminde thrash olmasının hiçbir faydası yok. Bu, yukarıdaki
      // shouldRevalidateDiscovery=false ataması ile de garanti altına alınmıştır.
      // Biri "eksik" sanıp buraya revalidateTag(HOME_DATA_TAG) /
      // revalidateTag(PRODUCTS_DISCOVERY_TAG) EKLEMESİN.
    }

    /**
     * 6. Table: product_images (W4 — LANSMAN KRİTİK)
     *
     * Bugün tabloda **0 satır** var; zincir görseller yüklenmeden ÖNCE yerinde olmalı,
     * yoksa T069'da 374 ürünün görseli girilir ve hiçbir sayfa tazelenmez. Doğruluğu
     * canlı veriyle kanıtlanamadığı için sabotajla kanıtlanır (INV-RENDER-2).
     */
    else if (table === 'product_images') {
      const productId = activeRecord.product_id as string | undefined
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('family_id')
          .eq('id', productId)
          .single()

        // T138-VH K6: aile MODEL ise üstündeki SERİ PDP yolu da tazelenir.
        const { paths: imgFamilyPaths, tags: imgFamilyTags, truncated: imgFanoutTruncated } =
          await revalidateFamilyChain(product?.family_id ?? undefined)
        revalidatedPaths.push(...imgFamilyPaths)
        revalidatedTags.push(...imgFamilyTags)
        if (imgFanoutTruncated) fanoutTruncated = true
      }

      // Görsel keşif yüzeyinde GÖRÜNÜR (kart görseli) — fiyattan farklı olarak burada
      // keşif tag'i tetiklenir.
      revalidateTag(PRODUCTS_DISCOVERY_TAG)
      revalidateTag(HOME_DATA_TAG)
      revalidatedTags.push(PRODUCTS_DISCOVERY_TAG, HOME_DATA_TAG)
    }

    /** 7. Table: brands (W4) — markanın tüm ailelerinin PDP yolları + keşif. */
    else if (table === 'brands') {
      const brandId = activeRecord.id as string | undefined
      if (brandId) {
        const { data: families } = await supabase
          .from('product_families')
          .select('slug')
          .eq('brand_id', brandId)
          .is('deleted_at', null)

        for (const f of families ?? []) {
          if (!f.slug) continue
          revalidatePath(`/tr/products/${f.slug}`)
          revalidatePath(`/en/products/${f.slug}`)
          revalidatedPaths.push(`/tr/products/${f.slug}`, `/en/products/${f.slug}`)
        }
      }

      revalidateTag(PRODUCTS_DISCOVERY_TAG)
      revalidateTag(HOME_DATA_TAG)
      revalidatedTags.push(PRODUCTS_DISCOVERY_TAG, HOME_DATA_TAG)
    }

    /**
     * 8. Table: price_lists (W4) — TÜM ailelerin PDP yolları; keşife DOKUNMAZ.
     *
     * ⚠️ FAN-OUT SINIRI: bu dal aile sayısı kadar yol tazeler (ölçüm 2026-08-17: **32 aile**
     * → 64 çağrı). Katalog birkaç yüz aileye çıkarsa bu dal pahalılaşır ve **tag tabanlı**
     * çözüme geçilmelidir. Sınır cetvele sayıyla yazıldı; sessizce yavaşlamasın.
     *
     * Keşife dokunmama kararı `product_prices` ile aynı gerekçeye dayanır: fiyat yalnız
     * PDP'de gösterilir, kartlarda gösterilmez.
     */
    else if (table === 'price_lists') {
      const { data: families } = await supabase
        .from('product_families')
        .select('slug')
        .is('deleted_at', null)

      for (const f of families ?? []) {
        if (!f.slug) continue
        revalidatePath(`/tr/products/${f.slug}`)
        revalidatePath(`/en/products/${f.slug}`)
        revalidatedPaths.push(`/tr/products/${f.slug}`, `/en/products/${f.slug}`)
      }
    }

    /**
     * W3 — `sitemap.xml` DB'den üretiliyor ama hiçbir dal onu tazelemiyordu: build'de
     * donuyor, yeni ürün/kategori/aile arama motorlarına hiç bildirilmiyordu.
     * Katalog yapısını değiştiren dört tablo için tazelenir.
     */
    if (table === 'products' || table === 'categories' || table === 'product_families' || table === 'product_images') {
      revalidatePath('/sitemap.xml')
      revalidatedPaths.push('/sitemap.xml')
    }

    return NextResponse.json({
      revalidated: true,
      event: { table, type },
      revalidatedPaths,
      revalidatedTags,
      // PS-042: products UPDATE'inde old_record yoksa alan-bazlı karşılaştırma yapılamadı —
      // bu durumda mevcut davranış (her zaman keşif tag'i tetikle) korunur.
      discoveryComparisonSkipped,
      // T138-VH K6: seri↔model zincir yürüyüşü MAX_FAMILY_CHAIN_HOPS'u aştıysa (ya da döngü
      // bulduysa) burada true olur — sessizce kırpılmaz, ölçülebilir sinyal.
      fanoutTruncated,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Supabase Webhook Error]:', error)
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
