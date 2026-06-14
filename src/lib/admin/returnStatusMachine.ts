/**
 * Returns durum-makinesi — TEK kaynak (SSOT) iade statü geçişleri.
 *
 * Monoton (yalnız ileri) geçişler. Hem per-satır aksiyon butonlarını ÜRETMEK hem de
 * `handleStatusUpdate`'i KORUMAK için kullanılır: UI bypass edilse bile izinsiz geçiş
 * mutasyona ulaşamaz (CLAUDE.md Kural 11 — sipariş/iade durumları monoton).
 */

/** Bilinen iade statüleri (DB `venthub_returns.status`). */
export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled'

/** Geçiş haritası — kaynak statüden izin verilen sonraki statüler. */
const TRANSITIONS: Record<string, readonly string[]> = {
  requested: ['approved', 'cancelled'],
  approved: ['in_transit', 'cancelled'],
  rejected: [],
  in_transit: ['received', 'cancelled'],
  received: ['refunded'],
  refunded: [],
  cancelled: [],
}

/**
 * Verilen statüden izin verilen sonraki statüleri döndürür.
 * Bilinmeyen statü → boş dizi (kilitli; ileri geçiş yok).
 */
export function allowedNextStatuses(current: string): string[] {
  return [...(TRANSITIONS[current] ?? [])]
}
