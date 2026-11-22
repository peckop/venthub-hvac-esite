/**
 * Ürün formu yükünün maliyet bölümü (ALT-123).
 *
 * KURAL: `products.update/insert` yüküne maliyet kolonu YALNIZ (a) kullanıcı yönetici ise VE (b) alan formda
 * DEĞİŞTİYSE girer. Aksi hâlde yükte maliyet kolonu hiç bulunmaz.
 *
 * NİÇİN: okuma `product_costs`'a geçti; moderatör için RLS 0 satır döndürür, form alanı 0 ile doldurur. Her
 * kayıtta alanı yüke geri koyan form moderatör kaydında maliyeti 0'a çeker ve DEĞİŞTİRMEDEN kaydeden yönetici
 * de eski/boş değerle üzerine yazabilir (senkron tetik 0'ı product_costs'a taşır). Değişmeyen alan hiç gönderilmez.
 */
export function buildCostPayload(input: {
  /** Maliyeti yazabilen rol mü (canViewCost: admin/super_admin). */
  isAdmin: boolean
  /** react-hook-form dirtyFields.purchase_price: alan kullanıcı tarafından değiştirildi mi. */
  purchasePriceDirty: boolean | undefined
  purchasePrice: number | undefined
}): { purchase_price?: number } {
  if (!input.isAdmin) return {}
  if (!input.purchasePriceDirty) return {}
  if (typeof input.purchasePrice !== 'number' || !Number.isFinite(input.purchasePrice)) return {}
  return { purchase_price: input.purchasePrice }
}
