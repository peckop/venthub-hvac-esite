import type { OrderBoardStatus } from './orderStatusMachine'

/**
 * Sipariş durum ETİKETLERİ — tek kaynak (T108-VH).
 *
 * NİÇİN VAR
 *
 * Durum etiketi iki admin yüzeyinde birbirinden bağımsız iki `switch` ile
 * üretiliyordu ve ikisi de eksikti. Ölçüm (2026-08-19):
 *
 *   · `RecentOrdersTable` DÖRT durum tanıyordu: completed, pending,
 *     processing, cancelled. Bunlardan `completed` hiçbir sipariş durumu
 *     DEĞİL — ölü dal.
 *   · `OrdersTableBody.prettyStatus` SEKİZ durum tanıyordu ama `processing`
 *     YOKTU — oysa durum-makinesi `confirmed → processing` geçişine izin
 *     veriyor, yani ulaşılabilir bir durum.
 *   · Sözlükte de `processing` anahtarı yoktu. Yani küme uyuşmazlığı üç
 *     katmandaydı: makine dokuz, sözlük sekiz, bileşenler dört ve sekiz.
 *
 * İkisinin de `default` dalı `return s` diyordu — yani **ham DB dizesi**
 * kullanıcıya basılıyordu, hem TR hem EN'de.
 *
 * YENİ SINIF — "ÇEVİRİ KAÇAĞI LİTERAL OLARAK GÖRÜNMEZ"
 *
 * Bu kaçak hiçbir i18n kapısına yakalanmadı ve yakalanamazdı: `return s` bir
 * dize SABİTİ değil, bir DEĞİŞKEN döndürür. `react/jsx-no-literals` ve
 * kardeşleri kaynakta ham LİTERAL arar; burada literal yok, çevrilmemiş metin
 * çalışma zamanında doğuyor. Bu yüzden kapı statik değil DAVRANIŞSAL olmak
 * zorunda: INV-ADMIN-STATUS-LABEL-1.
 *
 * KURAL: durum etiketi üreten her admin yüzeyi bu modülü kullanır; kendi
 * `switch`ini yazmaz. Küme `OrderBoardStatus`tan TÜRETİLİR — kopyalanmaz.
 */

/**
 * Her durum için sözlük anahtarı.
 *
 * `Record<OrderBoardStatus, string>` olması KASITLI: durum-makinesine yeni bir
 * durum eklenirse bu harita eksik kalır ve **tsc derlemeyi durdurur**. Yani
 * küme uyuşmazlığı bir daha sessizce doğamaz — tip sistemi ilk kapıdır.
 */
export const ORDER_STATUS_LABEL_KEYS: Record<OrderBoardStatus, string> = {
  pending: 'admin.orders.statusLabels.pending',
  paid: 'admin.orders.statusLabels.paid',
  confirmed: 'admin.orders.statusLabels.confirmed',
  processing: 'admin.orders.statusLabels.processing',
  shipped: 'admin.orders.statusLabels.shipped',
  delivered: 'admin.orders.statusLabels.delivered',
  cancelled: 'admin.orders.statusLabels.cancelled',
  refunded: 'admin.orders.statusLabels.refunded',
  partial_refunded: 'admin.orders.statusLabels.partialRefunded',
}

/** Haritanın anahtarları = tanınan durum kümesi. Ayrı bir liste TUTULMAZ. */
export const ORDER_STATUS_VALUES = Object.keys(ORDER_STATUS_LABEL_KEYS) as OrderBoardStatus[]

/** Bilinmeyen durum için nötr etiket — ham DB değeri ASLA basılmaz. */
export const ORDER_STATUS_UNKNOWN_KEY = 'admin.orders.statusLabels.unknown'

type Translate = (key: string, params?: Record<string, unknown>) => string

export function isOrderBoardStatus(value: string): value is OrderBoardStatus {
  return Object.prototype.hasOwnProperty.call(ORDER_STATUS_LABEL_KEYS, value)
}

/**
 * Durumun çevrilmiş etiketi.
 *
 * Bilinmeyen/boş değerde nötr sözlük anahtarı döner — çağıran tarafın ham
 * değere düşmesi için bir yol BIRAKILMAZ. Boş dize de bilinmeyen sayılır:
 * eskiden `if (!s) return s` ile boş dize aynen geri veriliyordu.
 */
export function orderStatusLabel(status: string | null | undefined, t: Translate): string {
  const key = (status ?? '').toLowerCase()
  if (!isOrderBoardStatus(key)) return t(ORDER_STATUS_UNKNOWN_KEY)
  return t(ORDER_STATUS_LABEL_KEYS[key])
}
