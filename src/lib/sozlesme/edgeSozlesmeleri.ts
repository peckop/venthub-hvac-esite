/**
 * İstemci ↔ Edge Function SÖZLEŞMELERİ — tek ortak şema (ALT-126, OPS-180 §7).
 *
 * NİÇİN BURADA: vitrin (src/views, src/components) yeniden yazılacak, arka uç korunuyor (karar 412).
 * Yeni vitrin hangi dosyadan çağırırsa çağırsın gövdeyi BU listelere göre kurar; Edge tarafı aynı
 * listelere conformance testleriyle bağlıdır (src/__tests__/conformance/sozlesme-*.test.ts).
 * Bu dosya vitrin kodu import ETMEZ; vitrin buna bağlanır, tersi değil.
 *
 * Edge fonksiyonları (Deno) bu dosyayı bugün import etmiyor: çalışan ödeme kodunu değiştirmek bu
 * işin kapsamı dışında. Bağ testtedir; sabotaj kolları bağın koptuğunu yakalar.
 */

// ── (1) ÖDEME: buildPaymentRequest → supabase/functions/iyzico-payment ─────────────────────────

/** iyzico-payment gövdesinin üst düzey alanları (istemcinin gönderdiği = Edge'in okuduğu). */
export const ODEME_ISTEGI_ALANLARI = [
  'amount',
  'cartItems',
  'customerInfo',
  'shippingAddress',
  'billingAddress',
  'user_id',
  'invoiceType',
  'invoiceInfo',
  'legalConsents',
  'shippingMethod',
  'couponCode',
] as const

/**
 * Edge'in GERİYE UYUM için ayrıca kabul ettiği eski adlar. İstemci bunları GÖNDERMEZ; yeni vitrin
 * de göndermemeli. Listede olmaları Edge'in okumasının "bilinmeyen alan" sayılmamasını sağlar.
 */
export const ODEME_ISTEGI_ESKI_ADLAR = ['customer', 'shipping', 'shipping_address', 'billing', 'billing_address'] as const

export const ODEME_KALEM_ALANLARI = ['product_id', 'quantity', 'price', 'product_name', 'product_image_url'] as const
export const ODEME_MUSTERI_ALANLARI = ['name', 'email', 'phone'] as const
export const ODEME_ADRES_ALANLARI = ['fullAddress', 'city', 'district', 'postalCode', 'address_type'] as const

/**
 * iyzico-callback'in döndürdüğü sonuç durumu (JSON `status` ve yönlendirmede `?status=`).
 * `needs_review`: para çekildi ama sipariş eşleşmesi doğrulanamadı (REC-355) — müşteriye
 * "başarısız" DENMEZ, iptal SEBEBİ SAYILMAZ.
 */
export const ODEME_SONUC_DURUMLARI = ['success', 'needs_review', 'failure', 'pending'] as const
export type OdemeSonucDurumu = (typeof ODEME_SONUC_DURUMLARI)[number]

// ── (2) MİSAFİR TEKLİF: quoteService.createGuestQuoteRequest → quote-request-guest ────────────

export const MISAFIR_TEKLIF_GOVDE_ALANLARI = ['contact', 'source', 'items', 'kvkkOnay', 'website'] as const
export const MISAFIR_TEKLIF_ILETISIM_ALANLARI = ['name', 'email', 'phone'] as const
export const MISAFIR_TEKLIF_KALEM_ALANLARI = ['productId', 'productName', 'qty', 'note'] as const
/**
 * İstemci gönderir, Edge BİLEREK okumaz: ürün adı veritabanından çözülür (güvenlik incelemesi
 * KRİTİK bulgu 1 — istemciden gelen ad e-postaya basılınca uç kimlik avı rölesine dönüyordu).
 */
export const MISAFIR_TEKLIF_YOK_SAYILAN_KALEM_ALANLARI = ['productName'] as const
export const TEKLIF_KAYNAKLARI = ['pdp', 'cart', 'project'] as const

// ── (3) KUPON: useCheckoutCoupon → apply-coupon ────────────────────────────────────────────

export const KUPON_ISTEGI_ALANLARI = ['code', 'subtotal'] as const
export const KUPON_YANITI_ALANLARI = ['valid', 'reason', 'discount_amount', 'final_total', 'normalized_code', 'details'] as const
/** `valid:false` yanıtının `reason` değerleri. `not_applicable` = süresi dolmuş/başlamamış/pasif/limit/alt sınır. */
export const KUPON_RED_SEBEPLERI = [
  'invalid_code',
  'invalid_subtotal',
  'db_error',
  'not_found',
  'not_applicable',
  'zero_discount',
  'internal',
] as const
/** Altyapı reddi (`{error}` gövdesi; `valid` yok): CORS, yöntem, içerik tipi, boyut, hız, ortam. */
export const KUPON_ALTYAPI_HATALARI = [
  'forbidden_origin',
  'method_not_allowed',
  'unsupported_media_type',
  'payload_too_large',
  'rate_limited',
  'missing_env',
] as const

/** İki anahtar kümesinin farkı; boş = sözleşmeye uyuyor. Testler ve sabotaj kolları bunu kullanır. */
export function anahtarFarki(
  gercek: Iterable<string>,
  beklenen: readonly string[],
): { eksik: string[]; fazla: string[] } {
  const g = new Set(gercek)
  const b = new Set(beklenen)
  return {
    eksik: [...b].filter((k) => !g.has(k)).sort(),
    fazla: [...g].filter((k) => !b.has(k)).sort(),
  }
}
