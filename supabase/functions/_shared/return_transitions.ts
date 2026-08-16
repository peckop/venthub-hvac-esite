// Çağıran sınıfı: yardımcı modül (uç değil) — iade statü geçişlerinin SUNUCU tarafı.
//
// NİÇİN VAR (T057-VH · 2026-08-15 operasyon döngüsü denetimi §3)
//
// Denetim, iade statüsü için **üç çelişen otorite** buldu:
//
//   1. `src/lib/admin/returnStatusMachine.ts` — istemci geçiş tablosu (admin UI'ı üretir)
//   2. `returns-webhook/index.ts` — bir SIRALAMA (rank) haritası
//   3. Veritabanı — hiçbir geçiş trigger'ı yok; PostgREST'ten her geçiş mümkün
//
// İkincisi bu dosyanın kapattığı yerdir. Eski kod statüleri sayısal bir sıraya diziyordu:
//
//     { requested:0, approved:1, rejected:1, in_transit:2, received:3, refunded:4, cancelled:4 }
//     if (nextRank < curRank) -> engelle
//
// Buradaki hata, **iade akışının bir sıra olmadığıdır.** `rejected` bir SONLANMA durumudur
// ama sıralamada ortada (1) durur; dolayısıyla kargo firmasının gönderdiği bir `in_transit`
// (2) mesajı "ilerleme" sayılır ve REDDEDİLMİŞ bir iadeyi yeniden canlandırır. Aynı şekilde
// `refunded` ve `cancelled` eşit rütbededir (4 = 4) ve `4 < 4` yanlış olduğu için parası
// iade edilmiş bir iade `cancelled`'a çevrilebilir. İkisi de ölçüldü, ikisi de guard'dan
// geçiyordu.
//
// Doğrusu bir sıra değil, AÇIK bir geçiş tablosudur; sonlanma durumları SOĞURUCUDUR:
// oradan çıkış yoktur, ne ileri ne geri.
//
// ── Kargo firması neyi söyleyebilir, neyi söyleyemez ────────────────────────────
// Bu tablo, istemci makinesinin İZİN VERDİKLERİNİN BİR ALT KÜMESİDİR ve bilinçli olarak
// daha dardır. Fark tek bir yerde: `received -> refunded` istemcide vardır, burada YOKTUR.
// Çünkü `refunded` bir PARA kararıdır; onu admin verir, kargo firması değil. Bir kargo
// webhook'unun "iade edildi" diyebilmesi, dış bir sistemin ödeme durumunu ilan etmesi
// demek olurdu. Bu ayrım INV-RETURN-1 testiyle sabitlenmiştir.

/** DB `venthub_returns.status` CHECK kısıtındaki değerler (2026-08-16 prod'dan doğrulandı). */
export const RETURN_STATUSES = [
  'requested',
  'approved',
  'rejected',
  'in_transit',
  'received',
  'refunded',
  'cancelled',
] as const

export type ReturnStatus = (typeof RETURN_STATUSES)[number]

/**
 * Sonlanma (terminal) durumları — SOĞURUCU. Bir iade buraya geldiyse dış bir sinyal onu
 * hiçbir yöne taşıyamaz. `returnStatusMachine.ts` de bu üçünü boş geçiş listesiyle
 * işaretler; iki taraf bu küme üzerinde anlaşmak ZORUNDADIR (INV-RETURN-1).
 */
export const TERMINAL_RETURN_STATUSES: readonly ReturnStatus[] = ['rejected', 'refunded', 'cancelled']

/**
 * Kargo webhook'unun yapmasına izin verilen geçişler.
 * Anahtar = mevcut statü · değer = webhook'un yazabileceği statüler.
 */
export const CARRIER_ALLOWED_TRANSITIONS: Readonly<Record<ReturnStatus, readonly ReturnStatus[]>> = {
  requested: ['cancelled'],
  approved: ['in_transit', 'cancelled'],
  in_transit: ['received', 'cancelled'],
  // Paket bize ulaştı; bundan sonrası (para iadesi) kargo firmasının bileceği iş değil.
  received: [],
  rejected: [],
  refunded: [],
  cancelled: [],
}

export function isTerminalReturnStatus(status: string): boolean {
  return (TERMINAL_RETURN_STATUSES as readonly string[]).includes(status)
}

export type TransitionVerdict =
  | { allowed: true }
  | { allowed: false; reason: 'terminal' | 'not_allowed' | 'unknown_current' | 'unknown_next' }

/**
 * Bu geçiş yapılabilir mi?
 *
 * Bilinmeyen statüde AÇIKÇA reddeder — eski kod bilinmeyen statüyü `?? curRank` ile
 * "mevcutla aynı" sayıp geçiriyordu, yani tanımadığı bir değer sessizce yazılabiliyordu.
 * Tanımadığımız bir şeyi geçirmek, kuralı olmayan bir kapıdır.
 */
export function canCarrierTransition(current: string, next: string): TransitionVerdict {
  if (current === next) return { allowed: true }
  if (!(RETURN_STATUSES as readonly string[]).includes(current)) {
    return { allowed: false, reason: 'unknown_current' }
  }
  if (!(RETURN_STATUSES as readonly string[]).includes(next)) {
    return { allowed: false, reason: 'unknown_next' }
  }
  if (isTerminalReturnStatus(current)) return { allowed: false, reason: 'terminal' }
  const allowed = CARRIER_ALLOWED_TRANSITIONS[current as ReturnStatus]
  return allowed.includes(next as ReturnStatus) ? { allowed: true } : { allowed: false, reason: 'not_allowed' }
}
