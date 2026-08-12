/**
 * Cache tag SSOT (F5-B W1.2 / PS-042)
 *
 * Next.js `unstable_cache`/`revalidateTag` tag string'leri için tek merkez.
 * Bu dosya davranışı DEĞİŞTİRMEZ — src/app/api/webhook/supabase/route.ts,
 * src/app/[lang]/page.tsx ve src/app/[lang]/products/page.tsx içinde daha önce
 * dağınık olarak literal string olarak kullanılan tag adlarını AYNEN sabitler.
 *
 * Yeni eklenenler (variantStockTag, familyTag): stok hareketi (inventory_movements)
 * keşif (discovery) tag'lerini artık thrash etmesin diye izole bir tag alanı sağlar.
 */

/** Ana sayfa (home) veri önbelleği — global tag. */
export const HOME_DATA_TAG = 'home-data'

/** Ürün/kategori keşif (discovery) listeleme önbelleği — global tag. */
export const PRODUCTS_DISCOVERY_TAG = 'products-discovery'

/** Ana sayfa veri önbelleği — tenant'a özel tag. */
export function homeDataTag(tenantId?: string): string {
  return tenantId ? `home-data-${tenantId}` : HOME_DATA_TAG
}

/** Ürün/kategori keşif (discovery) önbelleği — tenant'a özel tag. */
export function discoveryTag(tenantId?: string): string {
  return tenantId ? `products-discovery-${tenantId}` : PRODUCTS_DISCOVERY_TAG
}

/**
 * Ürün ailesi (product_families) sayfa/veri önbelleği — slug'a özel tag.
 * YENİ (PS-042): aile değişikliklerini izole invalide etmek için.
 */
export function familyTag(slug: string): string {
  return `product-family-${slug}`
}

/**
 * Stok hareketi (inventory_movements) kaynaklı önbellek etkisi — keşif
 * (home-data / products-discovery) tag'lerinden İZOLE.
 * YENİ (PS-042): stok hareketi artık keşif cache'ini thrash etmesin diye
 * ayrı bir tag alanına yönlendirilir.
 */
export function variantStockTag(): string {
  return 'variant-stock'
}
