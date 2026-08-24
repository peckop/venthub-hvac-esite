/**
 * Sipariş durumu ile ÖDEME durumu — İKİ AYRI SÖZLÜK (T111-VH).
 *
 * NİÇİN VAR
 *
 * `venthub_orders` üzerinde **iki ayrı CHECK kısıtı** var ve ikisi farklı
 * kavramı yönetiyor. Canlı prod DB'den `pg_constraint` ile ölçüldü
 * (2026-08-19; EDGE bağımsız olarak aynı ölçümü tekrarladı):
 *
 *   venthub_orders_status_check
 *     pending · confirmed · processing · shipped · delivered · cancelled
 *
 *   venthub_orders_payment_status_check
 *     pending · paid · failed · refunded · partial_refunded
 *
 * Yani `paid`, `refunded`, `partial_refunded` **sipariş durumu DEĞİLDİR** —
 * `status` kolonunda asla göremezsin. `failed` de öyle.
 *
 * BU KARIŞIM BEDELİ BİR KEZ ZATEN ÖDETTİ (T052-VH)
 *
 * Stok düşürme RPC'sinin ilk kapısı `status IN ('paid','processing')` idi.
 * `paid` hiçbir zaman geçerli bir `status` olmadığı için **kapı hiç açılmadı**;
 * başarılı ödemede callback `status='confirmed', payment_status='paid'`
 * yazıyordu. Sonuç: satışta stok hiç düşmedi ve üstüne "başarılı" damgası
 * basıldı.
 *
 * VE İKİNCİ KEZ ÖDETİYORDU (T111 ölçümü)
 *
 * Admin sipariş tablosunun durum filtresi `status` kolonuna sorgu atıyor ama
 * seçenek listesinde `paid`/`refunded`/`partial_refunded` vardı — yani **üç
 * filtre her zaman sıfır sonuç** döndürüyordu. Tek belirtisi boş ekrandı.
 *
 * KURAL: `status` kolonuna giden hiçbir değer ödeme sözlüğünden gelemez.
 * Zorlayan kapı: INV-ADMIN-STATUS-FILTER-1.
 */

/** `venthub_orders_status_check` — sipariş durumunun TEK otoritesi. */
export const ORDER_DB_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

/** `venthub_orders_payment_status_check` — ödeme durumunun TEK otoritesi. */
export const PAYMENT_DB_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'partial_refunded',
] as const

export type OrderDbStatus = (typeof ORDER_DB_STATUSES)[number]
export type PaymentDbStatus = (typeof PAYMENT_DB_STATUSES)[number]

/**
 * Yalnız ödeme sözlüğünde olan değerler.
 *
 * Türetilir, elle yazılmaz: iki liste değişirse bu küme kendiliğinden doğru
 * kalır. `pending` iki sözlükte de var, o yüzden burada YOK — ve bu kasıtlı,
 * çünkü `status='pending'` tamamen meşru bir filtredir.
 */
export const PAYMENT_ONLY_STATUSES: readonly string[] = PAYMENT_DB_STATUSES.filter(
  (p): p is PaymentDbStatus => !(ORDER_DB_STATUSES as readonly string[]).includes(p),
)

export function isOrderDbStatus(value: string): value is OrderDbStatus {
  return (ORDER_DB_STATUSES as readonly string[]).includes(value)
}

export function isPaymentDbStatus(value: string): value is PaymentDbStatus {
  return (PAYMENT_DB_STATUSES as readonly string[]).includes(value)
}

/** İade edilmiş mi — kaynak ÖDEME kolonudur, sipariş kolonu değil. */
export function isRefundedPayment(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === 'refunded' || paymentStatus === 'partial_refunded'
}
