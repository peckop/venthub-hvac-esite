/**
 * `?sku=` → varyant seçimi (saf).
 *
 * NİÇİN AYRI BİR DOSYA:
 * Bu karar daha önce `ProductDetailPageView` içinde tek satırdı:
 *   `variants.find((v) => v.sku === skuParam) ?? variants[0]`
 * Davranışı şuydu: **eşleşmeyen bir SKU sessizce ailenin ilk varyantına düşer.** Kullanıcı
 * başka kapasitedeki bir ürünün fiyatını ve özelliklerini görür, adres çubuğu hâlâ istediği
 * SKU'yu gösterir ve hiçbir yerde "bulamadım" denmez. Bir çürütme turunda (2026-08-22)
 * kanıtlandı; tek satır olduğu için de hiçbir test bunu görmüyordu.
 *
 * Ayrıca bu, kimlik düzeltmesi (T148-VH) için bir ön koşul: SKU'lar değişince eski
 * paylaşılmış linkler tam bu yola düşecekti.
 *
 * Dört sonucu AYIRIYORUZ çünkü çağıranın her birine farklı davranması gerekiyor —
 * özellikle `stale`, "istenen şey vardı ama bulunamadı" demektir ve sessizce yutulamaz.
 */

export type VariantLike = { sku: string }

export type VariantSelection<T extends VariantLike> =
  /** `?sku=` verildi ve tam eşleşti. */
  | { kind: 'exact'; variant: T }
  /** `?sku=` verildi ama ailede YOK — ilk varyanta düşüldü, çağıran URL'i temizlemeli. */
  | { kind: 'stale'; variant: T; requestedSku: string }
  /** `?sku=` hiç verilmedi — ailenin ilk varyantı kanonik seçimdir. */
  | { kind: 'default'; variant: T }
  /** Ailede hiç varyant yok. */
  | { kind: 'empty'; requestedSku: string | null }

export function selectVariant<T extends VariantLike>(
  variants: readonly T[],
  requestedSku: string | null | undefined
): VariantSelection<T> {
  const requested = requestedSku && requestedSku.trim() ? requestedSku : null

  const first = variants[0]
  if (!first) return { kind: 'empty', requestedSku: requested }

  if (!requested) return { kind: 'default', variant: first }

  const match = variants.find((v) => v.sku === requested)
  if (match) return { kind: 'exact', variant: match }

  // İstenen varyant yok. İlk varyantı GÖSTERİRİZ (boş sayfa basmak daha kötü) ama bunu
  // `stale` olarak işaretleriz — çağıran adres çubuğunu kanonikleştirir, böylece URL
  // artık var olmayan bir ürünü işaret etmeye devam etmez.
  return { kind: 'stale', variant: first, requestedSku: requested }
}
