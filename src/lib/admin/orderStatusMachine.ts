/**
 * Sipariş durum-makinesi — TEK kaynak (SSOT) sipariş statü geçişleri.
 *
 * NİÇİN VAR (2026-08-15 operasyon döngüsü denetimi, T058-VH):
 * Kanban panosunda HİÇBİR geçiş koruması yoktu. Teslim edilmiş bir sipariş
 * "Yeni" sütununa geri sürüklenebiliyor, iptal edilmiş bir sipariş yeniden
 * hazırlığa alınabiliyordu. Bu, CLAUDE.md kural 11'in ("sipariş/iade durumları
 * MONOTON — sadece ileri") doğrudan ihlaliydi ve tek bir yanlış sürükleme
 * müşteriye yanlış bildirim + tutarsız kayıt üretiyordu.
 *
 * İade akışındaki `returnStatusMachine` ile aynı desen: harita hem panonun
 * hangi hedefi kabul edeceğini belirler hem de mutasyonu KORUR.
 */

/**
 * Kanban'ın kullandığı **efektif** statüler.
 *
 * ⚠ BU BİR SSOT DEĞİL, **BİRLEŞİMDİR** (T111-VH ile açıkça yazıldı).
 * Aşağıdaki dokuz değer İKİ AYRI DB kolonundan gelir:
 *
 *   · `venthub_orders.status`         → pending · confirmed · processing ·
 *                                        shipped · delivered · cancelled
 *   · `venthub_orders.payment_status` → paid · refunded · partial_refunded
 *
 * Kolonların kendi sözlükleri `orderStatusDomain.ts`'te, canlı DB kısıtından
 * ölçülmüş hâlleriyle durur ve **otorite orasıdır**. Bu tip yalnız panonun
 * iki kolonu tek bir görünümde birleştirdiği hâli ifade eder.
 *
 * Karıştırmanın bedeli İKİ KEZ ödendi: T052'de `status IN ('paid',…)` kapısı
 * hiç açılmadığı için satışta stok hiç düşmedi; T111'de admin filtresi üç
 * ödeme değerini `status`'a sorduğu için o filtreler hep boş döndü.
 * `status IN (…)` yazan yeni kod, değerleri **bu tipe değil**
 * `ORDER_DB_STATUSES`'a karşı doğrulamalıdır.
 */
export type OrderBoardStatus =
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partial_refunded'

/**
 * Geçiş haritası.
 *
 * - `cancelled` her aşamadan erişilebilir AMA teslimden sonra değil: teslim
 *   edilmiş bir siparişi "iptal" saymak yanlış kayıt üretir.
 * - `refunded` / `partial_refunded` HER aşamadan erişilebilir. İlk yazımda yalnız
 *   `delivered`'dan izin verilmişti ve bu YANLIŞTI: müşteri ödedikten sonra kargo
 *   çıkmadan da iade isteyebilir, para her aşamada geri dönebilir. Mevcut testler
 *   bunu (`processing → refunded`) yakaladı — dar makine gerçek bir iş akışını
 *   kapatıyordu.
 * - `delivered` sonrası tek çıkış iadedir: teslim edilmiş bir siparişi iptal
 *   etmek yanlış kayıt üretir; para geri dönüyorsa doğru statü iadedir.
 * - `refunded` / `partial_refunded` / `cancelled` TERMİNAL.
 * - `paid` DB'de bir sipariş statüsü değil (ödeme statüsünden türer); panoda
 *   "Yeni" sütununda göründüğü için kaynak olarak ele alınır, hedef olarak asla.
 */
const TRANSITIONS: Record<OrderBoardStatus, readonly OrderBoardStatus[]> = {
  pending: ['confirmed', 'cancelled', 'refunded', 'partial_refunded'],
  paid: ['confirmed', 'cancelled', 'refunded', 'partial_refunded'],
  confirmed: ['processing', 'shipped', 'cancelled', 'refunded', 'partial_refunded'],
  processing: ['shipped', 'cancelled', 'refunded', 'partial_refunded'],
  shipped: ['delivered', 'cancelled', 'refunded', 'partial_refunded'],
  delivered: ['refunded', 'partial_refunded'],
  cancelled: [],
  refunded: [],
  partial_refunded: ['refunded'],
}

/** Verilen statüden izin verilen sonraki statüler. Bilinmeyen statü → kilitli. */
export function allowedNextOrderStatuses(current: string): OrderBoardStatus[] {
  return [...(TRANSITIONS[current as OrderBoardStatus] ?? [])]
}

/** Geçiş izinli mi? Panonun sürükle-bırak kapısı ve mutasyon koruması bunu kullanır. */
export function canTransitionOrder(current: string, next: string): boolean {
  return allowedNextOrderStatuses(current).includes(next as OrderBoardStatus)
}
