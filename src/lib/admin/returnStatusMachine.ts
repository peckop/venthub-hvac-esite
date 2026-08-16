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

/**
 * Geçiş haritası — kaynak statüden izin verilen sonraki statüler.
 *
 * `requested → rejected` 2026-08-15'te EKLENDİ. Yokluğu tek satırlık bir eksik
 * değil, **bir yeteneğin tamamen kapalı olması** demekti: aksiyon butonları bu
 * haritadan üretildiği için "Reddet" hiç render edilmiyordu ve toplu işlemde
 * `rejected` seçeneği daima 0 hedef buluyordu (ölü seçenek). Yani admin bir iade
 * talebini **reddedemiyordu**; elindeki tek çıkış `cancelled` idi ve o "müşteri
 * vazgeçti" anlamına gelir — kaydı yanlış sebeple kapatır.
 * DB zaten kabul ediyordu (`venthub_returns_status_check` içinde `rejected` var),
 * tıkanma yalnız buradaydı.
 *
 * `approved → rejected` BİLEREK YOK: onaylanmış bir talebi reddetmek geriye
 * dönüştür ve monotonluğu bozar (CLAUDE.md kural 11). Onaydan sonra vazgeçiliyorsa
 * doğru statü `cancelled`'dır.
 */
const TRANSITIONS: Record<string, readonly string[]> = {
  requested: ['approved', 'rejected', 'cancelled'],
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
