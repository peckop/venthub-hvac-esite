/**
 * Teklif durum makinesi — TEK SSOT (cetvel: docs/standards/quote-standard.md §Q2,
 * bekçi: INV-QUOTE-1 R1/R2/R3).
 *
 * Makine: requested → quoted → accepted | rejected | expired  (+ requested → rejected)
 *
 * İKİ tüketicisi var ve İKİSİ DE bu haritadan türemek zorunda:
 *  - UI aksiyonları (admin kuyruğu + müşteri kabul/ret) `allowedNextQuoteStatuses`
 *    üzerinden çizilir; ikinci bir geçiş listesi/switch zinciri yazılamaz (R1).
 *  - DB tetiği `enforce_quote_status_transition` (20260816125346_quotes_v1.sql) bu
 *    haritanın birebir aynasıdır; INV-QUOTE-1 R2 iki dosyayı KARŞILAŞTIRIR — buraya
 *    geçiş ekleyip migration'ı unutursan (ya da tersi) bekçi kırmızı verir.
 *
 * Terminaller SOĞURUCUDUR (R3): accepted/rejected/expired'dan çıkış yok. İade
 * makinesinin dersi — geri yürüyen ticari statü, verilen sözün kaydını bozar.
 */

export const QUOTE_STATUSES = ['requested', 'quoted', 'accepted', 'rejected', 'expired'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

/** Tam geçiş haritası — SSOT. Terminallerin boş dizisi KASITLI ve bekçi tarafından doğrulanır. */
export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  requested: ['quoted', 'rejected'],
  quoted: ['accepted', 'rejected', 'expired'],
  accepted: [],
  rejected: [],
  expired: [],
}

/**
 * Rol dilimleri (cetvel Q2): kim hangi geçişi YAPABİLİR. Haritanın alt kümeleridir —
 * bekçi (R1) bu dilimlerin QUOTE_TRANSITIONS dışına taşmadığını ve birleşimlerinin
 * haritayı TAM kapladığını doğrular (dilimde unutulan geçiş = ölü geçiş).
 */
export const QUOTE_ADMIN_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  requested: ['quoted', 'rejected'],
  quoted: ['expired'],
  accepted: [],
  rejected: [],
  expired: [],
}

export const QUOTE_CUSTOMER_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  requested: [],
  quoted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  expired: [],
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
