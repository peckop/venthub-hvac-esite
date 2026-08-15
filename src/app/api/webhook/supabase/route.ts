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
 * Aile slug'ı — PDP'nin KANONİK adresi bunun üzerinden kurulur
 * (`/[lang]/products/[family-slug]`). Üç dal (products · inventory_movements ·
 * product_prices) aynı çözümü yaptığı için tek yerde tutulur; ayrı ayrı yazıldığında
 * ikisi ürün slug'ını kullanıp sessizce yanlış yolu tazeliyordu.
 */
async function familySlugById(familyId: string | undefined): Promise<string | null> {
  if (!familyId) return null
  const { data } = await supabase
    .from('product_families')
    .select('slug')
    .eq('id', familyId)
    .single()
  return data?.slug ?? null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SupabaseWebhookPayload
    const webhookSecret = request.headers.get('x-webhook-secret')

    // Strict HMAC/Token Verification
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (expectedSecret && webhookSecret !== expectedSecret) {
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
       */
      const familySlug = await familySlugById(activeRecord.family_id as string | undefined)
      if (familySlug) {
        revalidatePath(`/tr/products/${familySlug}`)
        revalidatePath(`/en/products/${familySlug}`)
        revalidatedPaths.push(`/tr/products/${familySlug}`, `/en/products/${familySlug}`)
      }

      if (shouldRevalidateDiscovery) {
        revalidateTag(PRODUCTS_DISCOVERY_TAG)
        revalidateTag(HOME_DATA_TAG)
        revalidatedTags.push(PRODUCTS_DISCOVERY_TAG, HOME_DATA_TAG)
      }

      // If category has changed or is associated, we also revalidate the category path
      const categoryId = activeRecord.category_id as string | undefined
      if (categoryId) {
        const { data: category } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', categoryId)
          .single()
        
        if (category?.slug) {
          revalidatePath(`/tr/category/${category.slug}`)
          revalidatePath(`/en/category/${category.slug}`)
          revalidatedPaths.push(`/tr/category/${category.slug}`, `/en/category/${category.slug}`)
        }
      }
    }

    // 2. Table: categories
    else if (table === 'categories') {
      const categorySlug = activeRecord.slug as string | undefined
      if (categorySlug) {
        revalidatePath(`/tr/category/${categorySlug}`)
        revalidatePath(`/en/category/${categorySlug}`)
        revalidatedPaths.push(`/tr/category/${categorySlug}`, `/en/category/${categorySlug}`)
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
          // tazeliyordu (stok hareketi PDP'yi hiç yenilemiyordu).
          const familySlug = await familySlugById(product.family_id ?? undefined)
          if (familySlug) {
            revalidatePath(`/tr/products/${familySlug}`)
            revalidatePath(`/en/products/${familySlug}`)
            revalidatedPaths.push(`/tr/products/${familySlug}`, `/en/products/${familySlug}`)
          }

          // If product is linked to a category, revalidate category path too
          if (product.category_id) {
            const { data: category } = await supabase
              .from('categories')
              .select('slug')
              .eq('id', product.category_id)
              .single()

            if (category?.slug) {
              revalidatePath(`/tr/category/${category.slug}`)
              revalidatePath(`/en/category/${category.slug}`)
              revalidatedPaths.push(`/tr/category/${category.slug}`, `/en/category/${category.slug}`)
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

        const familySlug = await familySlugById(product?.family_id ?? undefined)
        if (familySlug) {
          revalidatePath(`/tr/products/${familySlug}`)
          revalidatePath(`/en/products/${familySlug}`)
          revalidatedPaths.push(`/tr/products/${familySlug}`, `/en/products/${familySlug}`)
        }
      }

      // PS-042: fiyat değişimi keşif (home-data/products-discovery) tag'lerini
      // BİLİNÇLİ olarak tetiklemez — Recep kararı: fiyat yalnız PDP'de gösterilir,
      // ürün kartlarında gösterilmez, dolayısıyla keşif önbelleğinin fiyat
      // değişiminde thrash olmasının hiçbir faydası yok. Bu, yukarıdaki
      // shouldRevalidateDiscovery=false ataması ile de garanti altına alınmıştır.
      // Biri "eksik" sanıp buraya revalidateTag(HOME_DATA_TAG) /
      // revalidateTag(PRODUCTS_DISCOVERY_TAG) EKLEMESİN.
    }

    return NextResponse.json({
      revalidated: true,
      event: { table, type },
      revalidatedPaths,
      revalidatedTags,
      // PS-042: products UPDATE'inde old_record yoksa alan-bazlı karşılaştırma yapılamadı —
      // bu durumda mevcut davranış (her zaman keşif tag'i tetikle) korunur.
      discoveryComparisonSkipped,
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
