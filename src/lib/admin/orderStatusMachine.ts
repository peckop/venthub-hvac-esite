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

/** Kanban'ın kullandığı efektif statüler (DB status + ödeme kaynaklı türevler). */
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
 * - `cancelled` her aşamadan erişilebilir: sipariş teslim edilene kadar iptal
 *   meşru bir sonuçtur.
 * - `delivered` sonrası tek çıkış `refunded`: teslim edilmiş bir siparişi iptal
 *   etmek yanlış kayıt üretir; para geri dönüyorsa doğru statü iadedir.
 * - `refunded` / `partial_refunded` / `cancelled` TERMİNAL.
 * - `paid` DB'de bir sipariş statüsü değil (ödeme statüsünden türer); panoda
 *   "Yeni" sütununda göründüğü için kaynak olarak ele alınır, hedef olarak asla.
 */
const TRANSITIONS: Record<OrderBoardStatus, readonly OrderBoardStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
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
