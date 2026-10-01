/**
 * Müşteri sipariş ekranlarının ortak durum gösterimi (URN-1).
 *
 * Önceden OrdersPage ve OrderDetailPage aynı eşlemeyi ayrı ayrı taşıyordu; `processing`
 * için dal yoktu, bu yüzden rozet ham "processing" basıyor ve adım çubuğu 1. adıma düşüyordu.
 * Kargo ekranları (Kargolarım, hesap özeti) ise ödenmemiş siparişi "Hazırlanıyor" gösteriyordu.
 * Hepsi bu dosyadan beslenir; i18n anahtarı döner, metin çağıranın `t()` fonksiyonundan gelir.
 */

/** Sipariş adım çubuğu: sıra sabittir, `processing` = "Hazırlanıyor". */
export const ORDER_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'] as const

export type OrderStep = (typeof ORDER_STEPS)[number]

/** Veritabanında `confirmed` ödemesi alınmış sipariştir; ekranda "Ödendi" adımıdır. */
export function normalizeOrderStatus(status: string | null | undefined): string {
  const s = (status ?? '').trim().toLowerCase()
  return s === 'confirmed' ? 'paid' : s
}

/**
 * Düz nesne araması `constructor` / `__proto__` / `toString` gibi durumlarda prototip üyesini
 * döndürür (`??` yakalamaz, `t()`'ye fonksiyon gider). Yalnız nesnenin KENDİ anahtarları geçerlidir.
 */
function ownLookup(table: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined
}

const LABEL_KEYS: Readonly<Record<string, string>> = {
  pending: 'orders.pending',
  paid: 'orders.paid',
  processing: 'orders.processing',
  shipped: 'orders.shipped',
  delivered: 'orders.delivered',
  failed: 'orders.failed',
  cancelled: 'orders.cancelled',
  refunded: 'orders.refunded',
}

/** Bilinmeyen durum ham basılmaz: nötr etiket anahtarı döner. */
export function orderStatusLabelKey(status: string | null | undefined): string {
  return ownLookup(LABEL_KEYS, normalizeOrderStatus(status)) ?? 'orders.statusUnknown'
}

const BADGE_CLASSES: Readonly<Record<string, string>> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function orderStatusBadgeClass(status: string | null | undefined): string {
  return ownLookup(BADGE_CLASSES, normalizeOrderStatus(status)) ?? 'bg-gray-100 text-gray-800'
}

/**
 * Adım çubuğunda aktif son adımın sırası. Çubukta yeri olmayan durum (iptal, iade, bilinmeyen)
 * 0 döner: çubuk ilk adımda durur, "geri düşme" yerine bilinçli başlangıç olur.
 */
export function orderStepIndex(status: string | null | undefined): number {
  const index = ORDER_STEPS.indexOf(normalizeOrderStatus(status) as OrderStep)
  return Math.max(index, 0)
}

/**
 * Kargo ekranlarında bir siparişin gösterilen evresi.
 * - `closed`: iptal / başarısız / iade; etiket siparişin KENDİ durumundan gelir (orders.cancelled vb.).
 * - `unknown`: tanımadığımız durum; nötr etiket (orders.statusUnknown), ham metin basılmaz.
 */
export type ShipPhase = 'awaitingPayment' | 'preparing' | 'shipped' | 'delivered' | 'closed' | 'unknown'

export interface ShipPhaseInput {
  status?: string | null
  shipped_at?: string | null
  tracking_number?: string | null
  delivered_at?: string | null
}

const CLOSED_STATUSES: readonly string[] = ['cancelled', 'failed', 'refunded']

/**
 * Kargo evresi. Sırayla: kapanmış sipariş (iptal/başarısız/iade) her şeyden önce gelir; sonra kargo
 * işareti (teslim/kargo tarihi, takip no, durum); sonra ödemesi alınmış sipariş "hazırlanıyor";
 * yalnız `pending` "ödeme bekleniyor". Tanınmayan durum "unknown" olur, "Hazırlanıyor" gösterilmez.
 */
export function shipPhase(row: ShipPhaseInput | undefined | null): ShipPhase {
  if (!row) return 'awaitingPayment'
  const status = normalizeOrderStatus(row.status)
  if (CLOSED_STATUSES.includes(status)) return 'closed'
  if (row.delivered_at || status === 'delivered') return 'delivered'
  if (row.shipped_at || row.tracking_number || status === 'shipped') return 'shipped'
  if (status === 'paid' || status === 'processing') return 'preparing'
  if (status === 'pending') return 'awaitingPayment'
  return 'unknown'
}

/** Kargo adım çubuğu: ödeme bekleyen, kapanmış ve tanınmayan siparişte hiçbir adım aktif değildir. */
export function shipPhaseStepIndex(phase: ShipPhase): number {
  switch (phase) {
    case 'delivered':
      return 2
    case 'shipped':
      return 1
    case 'preparing':
      return 0
    default:
      return -1
  }
}
