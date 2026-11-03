// ÖDEME YAZIM KAPISI (ALT-131 · güvenlik karnesi 2026-11 P1) — saf karar, ağa çıkmaz, yazmaz.
//
// SORUN (kod yolundan, karne §4 P1): `iyzico-callback` kimliksiz bir uçtur (İyzico'nun kendi POST'u
// Authorization taşımaz). Eşleşme kapısı (`odeme_eslesme.ts`) yalnız BAŞARILI ödemenin hangi siparişe
// ait olduğunu soruyordu; iki yol açık kalmıştı:
//   1. BAŞARISIZLIK DALI hiçbir bağ sormadan `payment_status='failed'` yazıyordu. Saldırgan kendi
//      reddedilen ödemesinin token'ını kurbanın `orderId`'siyle POST edince kurbanın ÖDENMİŞ
//      siparişi 'failed' görünüyordu.
//   2. PATCH filtresi yalnız `id`/`conversation_id` idi, satırın MEVCUT durumunu sormuyordu ve
//      `payment_debug`'ı TÜMÜYLE değiştiriyordu: iade defteri (`refunded_total`, `refunds`) ve
//      iadenin kullandığı `raw` (İyzico ödeme kalemleri) silinebiliyordu. Başarı dalında da teslim
//      edilmiş bir sipariş 'confirmed'a geri sarılabiliyordu (CLAUDE.md kural 11: durumlar monoton).
//
// ÇÖZÜM, ÜÇ KAT:
//   (a) Yazmadan önce satırın durumuna bakılır (bu modül, test edilebilir saf karar).
//   (b) Aynı koşul PATCH filtresine de girer → okuma ile yazma arasındaki yarış penceresi kapanır;
//       satır o arada ilerlediyse PATCH 0 satır döner, hiçbir şey yazılmaz.
//   (c) `payment_debug` birleştirilir, ezilmez: önceki anahtarlar (iade defteri) korunur.
//
// ⭐Veritabanı katmanındaki karşılığı (service_role'ün de geri saramaması) ayrı migration PR'ıdır.

export type YazimSatiri = {
  status?: unknown
  payment_status?: unknown
  payment_token?: unknown
  payment_debug?: unknown
}

export type YazimKarari = { yaz: boolean; sebep: string | null }

/** Başarılı + eşleşmiş ödeme yalnız bu durumdaki satıra yazılır. */
export const BASARI_ONCESI = {
  status: ['pending'],
  // 'failed' → 'paid': müşteri aynı siparişte yeniden denedi ve bu kez ödedi. Geri sarma değil, ileri.
  payment_status: ['pending', 'failed'],
} as const

/** Ödeme reddi yalnız bu durumdaki satıra yazılır. 'paid'/'refunded' üstüne 'failed' ASLA. */
export const RET_ONCESI = {
  status: ['pending'],
  payment_status: ['pending'],
} as const

const metin = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)

function durumUygun(satir: YazimSatiri | null, kosul: { status: readonly string[]; payment_status: readonly string[] }): YazimKarari {
  if (!satir) return { yaz: false, sebep: 'siparis_satiri_yok' }
  const s = metin(satir.status)
  const p = metin(satir.payment_status)
  if (!s || !kosul.status.includes(s)) return { yaz: false, sebep: `status_${s ?? 'yok'}` }
  if (!p || !kosul.payment_status.includes(p)) return { yaz: false, sebep: `payment_status_${p ?? 'yok'}` }
  return { yaz: true, sebep: null }
}

/** Başarılı ve eşleşmiş ödemenin siparişe yazılıp yazılamayacağı (eşleşme kapısından SONRA sorulur). */
export function basariYazilabilirMi(satir: YazimSatiri | null): YazimKarari {
  return durumUygun(satir, BASARI_ONCESI)
}

/**
 * Ödeme reddinin siparişe yazılıp yazılamayacağı.
 *
 * ⭐BAĞ ŞARTI: reddedilen ödemenin token'ı, siparişin KENDİ token'ı olmalı (`iyzico-payment` ödeme
 * formunu kurarken `payment_token`'ı yazar). İstekten gelen başka bir token, başka birinin ödemesidir.
 * Siparişte token yoksa karar verilemez → yazılmaz (fail-closed; sipariş 'pending' kalır, bugünkü
 * "yanıt yok" davranışıyla aynı).
 */
export function retYazilabilirMi(satir: YazimSatiri | null, istekToken: string | null | undefined): YazimKarari {
  const durum = durumUygun(satir, RET_ONCESI)
  if (!durum.yaz) return durum
  const siparisToken = metin(satir?.payment_token)
  if (!siparisToken) return { yaz: false, sebep: 'siparis_token_yok' }
  if (!metin(istekToken) || istekToken !== siparisToken) return { yaz: false, sebep: 'token_siparise_ait_degil' }
  return { yaz: true, sebep: null }
}

/** Ödemesi işlenmiş sayılan ödeme durumları (başarı bildiriminin TEKRARI zararsız olabilir). */
const ISLENMIS_ODEME = ['paid', 'partial_refunded', 'refunded']

export type YazilmayanBasari =
  /** Aynı ödemenin ikinci bildirimi (İyzico POST + tarayıcı dönüşü): sorun yok. */
  | { tur: 'tekrar' }
  /** Para çekildi, kayıt tutmuyor: insan bakmalı. Cevap 'needs_review', gelir alarmı kalkar. */
  | { tur: 'inceleme'; kod: 'DUPLICATE_CHARGE' | 'PAYMENT_ON_TERMINATED_ORDER' }

/**
 * Başarılı + eşleşmiş ödeme, satır 'pending' olmadığı için YAZILMADIĞINDA ne olduğu (ALT-131,
 * security-reviewer bulgu 1). Sessiz `success` iki durumu ayırmıyordu:
 *   - satır zaten bu ödemeyle ödenmiş → zararsız tekrar;
 *   - satır iptal edilmiş (housekeeping 15. dakikada iptal etti, müşteri sonra ödedi) ya da başka bir
 *     ödemeyle ödenmiş (aynı sipariş için iki form, iki tahsilat) → para var, kayıt yok.
 * Tekrarın kanıtı kayıtlı `payment_debug.paymentId` ile bu bildirimin `paymentId`'sinin eşitliğidir;
 * kanıt yoksa inceleme (fail-closed: yanlış alarm, kaçan tahsilattan ucuzdur).
 */
export function yazilmayanBasari(satir: YazimSatiri | null, paymentId: unknown): YazilmayanBasari {
  const p = metin(satir?.payment_status)
  const dbg = satir?.payment_debug && typeof satir.payment_debug === 'object' ? (satir.payment_debug as Record<string, unknown>) : {}
  const kayitli = metin(dbg.paymentId)
  const gelen = metin(paymentId)
  if (p && ISLENMIS_ODEME.includes(p)) {
    // Kayıtlı paymentId YOKSA (eski satır) "farklı ödeme" kanıtlanamaz: tekrar sayılır. Aksi hâlde
    // sipariş kimliğini bilen biri her çağrıda sahte DUPLICATE_CHARGE alarmı üretebilirdi.
    if (!kayitli || (gelen && kayitli === gelen)) return { tur: 'tekrar' }
    return { tur: 'inceleme', kod: 'DUPLICATE_CHARGE' }
  }
  return { tur: 'inceleme', kod: 'PAYMENT_ON_TERMINATED_ORDER' }
}

/** PostgREST in.(...) listesi. Değerler sabit sözlükten gelir, dışarıdan değil. */
const liste = (d: readonly string[]) => (d.length === 1 ? `eq.${d[0]}` : `in.(${d.join(',')})`)

/** PATCH'e eklenecek koşul: okuma anındaki karar yazma anında DB'de yeniden doğrulanır. */
export function kosulFiltresi(kosul: { status: readonly string[]; payment_status: readonly string[] }): string {
  return `&status=${liste(kosul.status)}&payment_status=${liste(kosul.payment_status)}`
}

/**
 * `payment_debug` birleştirmesi: önceki anahtarlar korunur, bu çağrının alanları üzerine yazılır.
 * Önceki değer nesne değilse (null, dizi, metin) yok sayılır.
 */
export function debugBirlestir(mevcut: unknown, yeni: Record<string, unknown>): Record<string, unknown> {
  const eski = mevcut && typeof mevcut === 'object' && !Array.isArray(mevcut) ? (mevcut as Record<string, unknown>) : {}
  return { ...eski, ...yeni }
}
