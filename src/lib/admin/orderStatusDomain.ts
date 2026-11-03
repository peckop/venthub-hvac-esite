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

/**
 * VERİTABANI geçiş tabloları — `trg_orders_monoton_durum` (migration
 * `20261103120000_venthub_orders_monoton_durum.sql`) ile AYNI olmak ZORUNDA.
 * Kopyaların ayrışmasını INV-SIPARIS-MONOTON-1 yakalar (SQL ↔ bu dosya ↔ edge ortak modülü).
 *
 * Kanban makinesi (`orderStatusMachine.ts`) bundan GENİŞ olabilir (panoda 'paid'/'refunded' birleşik
 * sütunlar var); veritabanı tablosu son sözü söyler.
 */
export const ORDER_DB_TRANSITIONS: Readonly<Record<OrderDbStatus, readonly OrderDbStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export const PAYMENT_DB_TRANSITIONS: Readonly<Record<PaymentDbStatus, readonly PaymentDbStatus[]>> = {
  pending: ['paid', 'failed'],
  failed: ['paid'],
  paid: ['partial_refunded', 'refunded'],
  partial_refunded: ['refunded'],
  refunded: [],
}

/** Aynı değer her zaman serbest; bilinmeyen değer kilitli. */
export function isOrderDbTransitionAllowed(from: string, to: string): boolean {
  if (!isOrderDbStatus(from)) return false
  return from === to || ORDER_DB_TRANSITIONS[from].includes(to as OrderDbStatus)
}

/** `null` ödeme durumu 'pending' sayılır (kolon NULL'a izin verir). */
export function isPaymentDbTransitionAllowed(from: string | null, to: string | null): boolean {
  const a = from ?? 'pending'
  const b = to ?? 'pending'
  if (!isPaymentDbStatus(a)) return false
  return a === b || PAYMENT_DB_TRANSITIONS[a].includes(b as PaymentDbStatus)
}

export type RefundPlan =
  | { ok: true; status?: OrderDbStatus; payment_status: 'refunded' | 'partial_refunded' }
  | { ok: false; error: string }

/**
 * İade yazımının DB alanları (ALT-131, OPS kararı).
 *
 *  · İade yalnız ÖDENMİŞ siparişe yazılır (`paid`; tam iade için `partial_refunded` de olur).
 *  · Sipariş durumu yalnız tam iadede ve yalnız kargolanmamış siparişte `cancelled` olur
 *    (`iyzico-refund` ile aynı kural). Kargolanmış ya da TESLİM EDİLMİŞ siparişin durumu korunur:
 *    teslim sonrası iade `status=delivered`, `payment_status=refunded` bırakır.
 *  · Kısmi iade sipariş durumunu hiç değiştirmez.
 */
export function planRefundFields(
  kind: 'refunded' | 'partial_refunded',
  current: { status: string | null; payment_status: string | null },
): RefundPlan {
  const odeme = current.payment_status ?? 'pending'
  // `refunded` + tam iade: aynı değerin yeniden yazımı (iyzico-refund önce yazmış olabilir) serbest.
  const odemeUygun = odeme === 'paid' || odeme === 'partial_refunded' || (kind === 'refunded' && odeme === 'refunded')
  if (!odemeUygun) {
    return { ok: false, error: `İade yalnız ödenmiş siparişe yazılabilir (ödeme durumu: ${odeme})` }
  }
  const kargolanmamis = current.status === 'pending' || current.status === 'confirmed' || current.status === 'processing'
  if (kind === 'refunded' && kargolanmamis) {
    return { ok: true, status: 'cancelled', payment_status: 'refunded' }
  }
  return { ok: true, payment_status: kind }
}
