/**
 * Teklif durum makinesi — TEK SSOT (cetvel: docs/standards/quote-standard.md §4,
 * bekçi: INV-QUOTE-1 R1/R2/R3).
 *
 * v2 makinesi (T131-VH) — İKİ GİRİŞ, BEŞ TERMİNAL:
 *   GİRİŞLER   (satıcı) → draft        · (müşteri) → requested   [RFQ yolu korunur]
 *   GEÇİŞLER   requested → draft | rejected
 *              draft     → quoted | cancelled
 *              quoted    → accepted | rejected | expired | superseded | cancelled
 *              accepted  → converted
 *   TERMİNALLER rejected · expired · cancelled · superseded · converted
 *
 * ⭐ v1'den DEĞİŞEN İKİ ŞEY, adıyla:
 *  1. `requested → quoted` KAPANDI. Satıcı bir talebi doğrudan fiyatlayamaz; önce
 *     `draft`'a çeker. `requested` artık bir GELEN KUTUSU durumudur (§4).
 *  2. `accepted` ARTIK TERMİNAL DEĞİL — `accepted → converted` köprüsü açıldı (§10).
 *     Bekçinin R3 terminal listesi bu yüzden güncellendi; gevşetme değil, cetvelin
 *     kendi haritası. Kapının hâlâ ayırt ettiği bilerek-bozma ile kanıtlandı.
 *
 * İKİ tüketicisi var ve İKİSİ DE bu haritadan türemek zorunda:
 *  - UI aksiyonları (admin kuyruğu + müşteri kabul/ret) `allowedNextQuoteStatuses`
 *    üzerinden çizilir; ikinci bir geçiş listesi/switch zinciri yazılamaz (R1).
 *  - DB tetiği `enforce_quote_status_transition` (20260826233000_quote_v2_schema.sql)
 *    bu haritanın birebir aynasıdır; INV-QUOTE-1 R2 iki dosyayı KARŞILAŞTIRIR —
 *    buraya geçiş ekleyip migration'ı unutursan (ya da tersi) bekçi kırmızı verir.
 *
 * ⚠ HARİTANIN ÜSTÜNDEKİ ŞARTLAR burada YAZILI DEĞİLDİR, DB'dedir ve orada kalmalıdır:
 *  - MUHATAP KİLİDİ (§2.5): `user_id IS NULL` iken accepted/converted yönü reddedilir.
 *  - YAYIM KAPISI (§6/R10): `draft → quoted` için valid_until + currency zorunlu.
 *  - DÖNÜŞÜM KAPISI (§10): converted_order_id olmadan `converted` yazılamaz.
 * Bunları buraya kopyalamak dördüncü bir otorite yaratır; ekran kapısı sayılmaz.
 *
 * Terminaller SOĞURUCUDUR (R3): çıkış yok. İade makinesinin dersi — geri yürüyen
 * ticari statü, verilen sözün kaydını bozar.
 */

export const QUOTE_STATUSES = [
  'draft',
  'requested',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
  'superseded',
  'converted',
] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

/** Tam geçiş haritası — SSOT. Terminallerin boş dizisi KASITLI ve bekçi tarafından doğrulanır. */
export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ['quoted', 'cancelled'],
  requested: ['draft', 'rejected'],
  quoted: ['accepted', 'rejected', 'expired', 'superseded', 'cancelled'],
  accepted: ['converted'],
  rejected: [],
  expired: [],
  cancelled: [],
  superseded: [],
  converted: [],
}

/**
 * Rol dilimleri (cetvel §4): kim hangi geçişi YAPABİLİR. Haritanın alt kümeleridir —
 * bekçi (R1a) bu dilimlerin QUOTE_TRANSITIONS dışına taşmadığını ve birleşimlerinin
 * haritayı TAM kapladığını doğrular (dilimde unutulan geçiş = ölü geçiş).
 *
 * `quoted → expired` admin dilimindedir çünkü UI aksiyonu olarak da meşrudur; expiry
 * cron'u (§6 kapı 1) AYRI bir kalemdir ve bu dilimden bağımsız çalışır.
 */
export const QUOTE_ADMIN_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ['quoted', 'cancelled'],
  requested: ['draft', 'rejected'],
  quoted: ['expired', 'superseded', 'cancelled'],
  accepted: ['converted'],
  rejected: [],
  expired: [],
  cancelled: [],
  superseded: [],
  converted: [],
}

export const QUOTE_CUSTOMER_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: [],
  requested: [],
  quoted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  expired: [],
  cancelled: [],
  superseded: [],
  converted: [],
}

export function isQuoteStatus(value: string): value is QuoteStatus {
  return (QUOTE_STATUSES as readonly string[]).includes(value)
}

/** Verilen durumdan izinli TÜM sonraki durumlar (rol filtresiz). */
export function allowedNextQuoteStatuses(current: string): readonly QuoteStatus[] {
  return isQuoteStatus(current) ? QUOTE_TRANSITIONS[current] : []
}

/** Rol dilimli görünüm — UI aksiyon düğmeleri bunlardan çizilir. */
export function allowedAdminQuoteActions(current: string): readonly QuoteStatus[] {
  return isQuoteStatus(current) ? QUOTE_ADMIN_TRANSITIONS[current] : []
}

export function allowedCustomerQuoteActions(current: string): readonly QuoteStatus[] {
  return isQuoteStatus(current) ? QUOTE_CUSTOMER_TRANSITIONS[current] : []
}

/** Terminal (soğurucu) durum mu? */
export function isTerminalQuoteStatus(status: string): boolean {
  return isQuoteStatus(status) && QUOTE_TRANSITIONS[status].length === 0
}
