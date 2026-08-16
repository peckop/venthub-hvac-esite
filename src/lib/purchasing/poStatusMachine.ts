/**
 * PO durum-makinesi — TEK kaynak (SSOT) satınalma siparişi statü geçişleri.
 *
 * Cetvel: docs/standards/purchasing-standard.md §3. Monoton (yalnız ileri) geçişler;
 * terminal statüler soğurucudur. `src/lib/admin/returnStatusMachine.ts` ile aynı şekil.
 *
 * Sözlük, migration'daki `purchase_orders.status` CHECK kısıtıyla BİREBİR aynıdır;
 * pariteyi INV-PURCH-1/R1 doğrular (T052 dersi: sözlük iki yerde ayrı yaşayamaz —
 * RPC kapısı CHECK'te olmayan 'paid' bekliyordu ve stok hiç düşmedi).
 */

/** Bilinen PO statüleri (DB `purchase_orders.status`). */
export type PoStatus =
  | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'cancelled'

export const PO_STATUSES: readonly PoStatus[] = [
  'draft',
  'ordered',
  'partially_received',
  'received',
  'closed',
  'cancelled',
]

/**
 * Geçiş haritası — kaynak statüden izin verilen sonraki statüler.
 *
 * `partially_received → cancelled` BİLEREK YOK (cetvel §3, karar günlüğü): mal kısmen
 * girdi; geri alma iade/düzeltme akışıdır, statü geri sarma değil. Kalanın gelmeyeceği
 * kabulü = kısa kapama (`closed`, gerekçe notu zorunlu — servis uygular).
 */
const TRANSITIONS: Record<string, readonly string[]> = {
  draft: ['ordered', 'cancelled'],
  ordered: ['partially_received', 'received', 'cancelled'],
  partially_received: ['received', 'closed'],
  received: ['closed'],
  closed: [],
  cancelled: [],
}

/**
 * TÜREV statüler ELLE SEÇİLEMEZ (cetvel §3.2): `partially_received` ve `received`
 * yalnız `process_goods_receipt` RPC'sinin miktar hesabından doğar. Servisteki elle
 * geçiş yolu bu ikisini hedef olarak REDDEDER; harita yine de içerir ki RPC'nin
 * türettiği geçişler de aynı sözlükten doğrulanabilsin.
 */
export const DERIVED_STATUSES: readonly PoStatus[] = ['partially_received', 'received']

/**
 * Verilen statüden izin verilen sonraki statüleri döndürür.
 * Bilinmeyen statü → boş dizi (kilitli; ileri geçiş yok).
 */
export function allowedNextPoStatuses(current: string): string[] {
  return [...(TRANSITIONS[current] ?? [])]
}

/** Elle (admin eliyle) yapılabilir geçiş mi? Türev hedefler elle seçilemez. */
export function isManualPoTransitionAllowed(current: string, next: string): boolean {
  if ((DERIVED_STATUSES as readonly string[]).includes(next)) return false
  return allowedNextPoStatuses(current).includes(next)
}
