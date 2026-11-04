// Çağıran sınıfı: yardımcı modül (uç değil) — parası çekilmiş olabilecek siparişi süpürücülerden korur
// ve yönetici durum yazımının kararını verir.
//
// NİÇİN VAR (karne 2026-11 §4 P2 + P11 · Kanban OPS-222)
//
// P2: `iyzico-callback` ödeme BAŞARILI ama siparişle eşleşmediğinde siparişe hiçbir şey yazmaz;
// yalnız `client_errors`'a `extra.code = PAYMENT_ORDER_MISMATCH` + `extra.order_id` alarmı düşer.
// Sipariş `pending/pending` kalır ve iki süpürücü (`release-expired-reservations` 24 saatte,
// `order-housekeeping` 15 dakikada) onu "ödenmemiş" sanıp `cancelled + failed` yapıyordu: müşteri
// ödemiş, sipariş başarısız. İşaret sütunu yok (migration gerektirirdi); kanıt o alarm satırıdır.
//
// P11: `admin-update-order` geçişin yönüne ve gerekçesine bakmadan yazıyordu; karar burada saf
// fonksiyon olarak durur ki çevrimdışı sınansın.

import { siparisGecisiIzinliMi, SIPARIS_DURUM_IZIN } from './siparis_gecis.ts'

/** `iyzico-callback`in eşleşmeyen ödeme alarmının kodu (iyzico-callback/index.ts, raiseRevenueAlarm). */
export const ESLESMEYEN_ODEME_KODU = 'PAYMENT_ORDER_MISMATCH'

/** Tek sorguda sorulan en çok sipariş kimliği (URL uzunluğu sınırı). */
const PARCA = 50

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>

/** Kayıt ölçülemedi: çağıran HİÇBİR siparişi sonlandırmaz (fail-closed). */
export class IncelemeOlculemediError extends Error {
  constructor(detay: string) {
    super(`INCELEME_OLCULEMEDI:${detay}`)
    this.name = 'IncelemeOlculemediError'
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Verilen siparişlerden hangileri için `PAYMENT_ORDER_MISMATCH` kaydı var?
 *
 * Sorgu ağ ya da HTTP hatası verirse FIRLATIR: "kayıt yok" ile "bakamadım" aynı şey değildir;
 * ikincisini birincisi saymak parası çekilmiş siparişi iptal ettirir.
 */
export async function eslesmeyenOdemeSiparisleri(
  supabaseUrl: string,
  serviceRoleKey: string,
  orderIds: readonly string[],
  fetchFn: FetchFn = fetch,
): Promise<Set<string>> {
  const bulunan = new Set<string>()
  // PostgREST `in.(...)` listesine yalnız UUID biçimli değer girer (enjeksiyon yüzeyi yok).
  const kimlikler = [...new Set(orderIds)].filter((id) => UUID_RE.test(id))
  for (let i = 0; i < kimlikler.length; i += PARCA) {
    const parca = kimlikler.slice(i, i + PARCA)
    // Kaynak süzgeci (OPS-225 LOW-2): kaydı yalnız `iyzico-callback`in edge alarmı sayılır.
    // `log-client-error` oturumlu kullanıcıya `extra` yazdırır; bugün maskesi UUID'yi bozuyor
    // ama korunma tesadüfe dayanmasın.
    const url = `${supabaseUrl}/rest/v1/client_errors?select=extra`
      + `&env=eq.edge&extra->>fn=eq.iyzico-callback`
      + `&extra->>code=eq.${ESLESMEYEN_ODEME_KODU}`
      + `&extra->>order_id=in.(${parca.join(',')})`
    let resp: Response
    try {
      resp = await fetchFn(url, { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } })
    } catch (e) {
      throw new IncelemeOlculemediError(e instanceof Error ? e.name : 'ag')
    }
    if (!resp.ok) throw new IncelemeOlculemediError(`http_${resp.status}`)
    const govde: unknown = await resp.json().catch(() => null)
    if (!Array.isArray(govde)) throw new IncelemeOlculemediError('govde_dizi_degil')
    for (const satir of govde) {
      if (typeof satir !== 'object' || satir === null) continue
      const extra = (satir as Record<string, unknown>).extra
      if (typeof extra !== 'object' || extra === null) continue
      const id = (extra as Record<string, unknown>).order_id
      if (typeof id === 'string' && parca.includes(id)) bulunan.add(id)
    }
  }
  return bulunan
}

/** pending → confirmed için en kısa gerekçe (karakter, kırpılmış). */
export const GEREKCE_EN_AZ = 10

export type AdminDurumKarari =
  | { islem: 'yaz' }
  | { islem: 'reddet'; http: 400 | 409; kod: string }

/**
 * Yönetici durum yazımının kararı (P11).
 *
 *  · `status` yok → 400 `missing_status` (eskiden varsayılan `'paid'` yazılıyordu)
 *  · sözlük dışı → 400 `invalid_status`
 *  · geri ya da izin dışı geçiş (`delivered → confirmed`, `cancelled → pending` …) → 409 `INVALID_TRANSITION`
 *  · `pending → confirmed` gerekçesiz → 409 `REASON_REQUIRED`. Bu geçiş ödeme alınmadan "onaylandı"
 *    demektir (havale gibi elle doğrulanan ödeme); kim, niçin yazdı sorusu denetim satırında cevaplanır.
 *
 * `mevcut` null ise (satır okunmadı) karar verilemez; çağıran önce satırı okur.
 */
export function adminDurumKarari(girdi: { mevcut: string; yeni: unknown; gerekce: unknown }): AdminDurumKarari {
  const g0 = adminDurumGirdisi(girdi.yeni)
  if (!g0.gecerli) return { islem: 'reddet', http: 400, kod: g0.kod }
  const yeni = g0.durum
  if (!siparisGecisiIzinliMi(girdi.mevcut, yeni)) {
    return { islem: 'reddet', http: 409, kod: 'INVALID_TRANSITION' }
  }
  if (girdi.mevcut === 'pending' && yeni === 'confirmed') {
    const g = typeof girdi.gerekce === 'string' ? girdi.gerekce.trim() : ''
    if (g.length < GEREKCE_EN_AZ) return { islem: 'reddet', http: 409, kod: 'REASON_REQUIRED' }
  }
  return { islem: 'yaz' }
}

/**
 * İstek gövdesindeki `status`: satır okunmadan verilebilen karar (400 sınıfı).
 * Yok/boş → `missing_status`; sözlük (`SIPARIS_DURUM_IZIN` anahtarları) dışı → `invalid_status`.
 */
export function adminDurumGirdisi(deger: unknown):
  | { gecerli: true; durum: string }
  | { gecerli: false; kod: 'missing_status' | 'invalid_status' } {
  if (deger === undefined || deger === null || (typeof deger === 'string' && deger.trim() === '')) {
    return { gecerli: false, kod: 'missing_status' }
  }
  if (typeof deger !== 'string') return { gecerli: false, kod: 'invalid_status' }
  const d = deger.trim()
  return Object.prototype.hasOwnProperty.call(SIPARIS_DURUM_IZIN, d)
    ? { gecerli: true, durum: d }
    : { gecerli: false, kod: 'invalid_status' }
}
