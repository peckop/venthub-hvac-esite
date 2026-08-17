/**
 * KARGO YAZIMI — PAYLAŞILAN TAKİP NUMARASI NİYET BEYANI (T058-VH devamı).
 *
 * ÖLÇÜLEN KUSUR (2026-08-17): `admin-update-shipping` sunucusu, aynı takip numarası
 * başka bir siparişte kayıtlıysa **409 `tracking_number_in_use`** döndürür ve yazmaz.
 * Kaçış kapısı vardır — istek `allow_shared_tracking: true` taşırsa yazar (gerçek
 * lojistikte iki siparişi TEK kolide birleştirmek meşrudur).
 *
 * Kusur şuydu: **hiçbir istemci bu bayrağı göndermiyordu.** `OrdersTableBody` toplu
 * kargoda kullanıcıya "aynı takip numarası bilerek mi?" diye SORUYOR, onayı ALIYOR —
 * ve o onayı isteğe hiç koymuyordu. Yani kullanıcının kararı toplanıp ÇÖPE atılıyor,
 * sunucu 409 dönüyor, admin yalnız "bazıları başarısız" görüyordu. Kaçış kapısı
 * sunucuda vardı ama **hiçbir yüzeyden ULAŞILAMIYORDU**.
 *
 * Bu modül tek bir şeyi sahiplenir: çağrıyı yap, 409'u AYIRT ET, niyet beyanıyla
 * tekrar gönder. Metin ÜRETMEZ (i18n çağırana ait) ve onay SORMAZ (onay yüzeyi
 * `ConfirmProvider`'ındır) — böylece hem sipariş hem lojistik yüzeyi aynı davranışı
 * kopyalamadan paylaşır.
 */

/** Sunucunun 409 gövdesinde döndürdüğü hata kodu (`admin-update-shipping`). */
export const SHARED_TRACKING_CONFLICT = 'tracking_number_in_use'

/**
 * Bu modülün istemciden ihtiyaç duyduğu TEK yetenek. `SupabaseClient<Database>`
 * yerine dar bir sözleşme yazıldı — gerçek istemci bunu yapısal olarak zaten
 * karşılıyor, ama test bir "sahte istemci" üretmek için tip zorlamasına (`as unknown
 * as`) mecbur kalmıyor. Tip zorlaması testte de üretimdeki kadar tehlikelidir:
 * sözleşme değişince derleyici susar ve test yanlış şekli doğrulamaya devam eder.
 */
export interface ShippingFunctionsHost {
  functions: {
    invoke(name: string, options: { body: Record<string, unknown> }): Promise<{ error: unknown }>
  }
}

/**
 * `interface` DEĞİL `type`: arayüzlerin örtük indeks imzası yoktur ve
 * `Record<string, unknown>` bekleyen `invoke` sözleşmesine geçmezdi.
 */
export type ShippingUpdateBody = {
  order_id: string
  carrier: string
  tracking_number: string
  tracking_url: string | null
  send_email: boolean
}

export type ShippingInvokeOutcome =
  | { ok: true; conflict: false }
  /** `conflict: true` → SADECE paylaşılan takip numarası reddi; başka her hata `false`. */
  | { ok: false; conflict: boolean; error: unknown }

/**
 * Hatanın "paylaşılan takip numarası" reddi olup olmadığını söyler.
 *
 * NİÇİN GÖVDE OKUNUYOR: `supabase-js` non-2xx'te `FunctionsHttpError` üretir ve
 * `error.context` ham `Response`'tur; mesaj metni yalnız "Edge Function returned a
 * non-2xx status code" der. Hangi 409 olduğunu ancak gövdedeki `error` kodu söyler.
 * Durum koduna bakmak YETMEZ: aynı uç başka 409'lar da döndürebilir ve o zaman
 * kullanıcıya yanlış soruyu sorardık.
 *
 * Gövde okunamazsa **false** döner (çatışma değil sayılır). Gerekçe: emin olmadan
 * "birleştirmeyi onaylıyor musun?" diye sormak, kullanıcıyı anlamadığı bir kararın
 * içine sokar ve onay alınca bayrağı gönderip gerçek bir hatayı maskeleyebilirdi.
 */
export async function isSharedTrackingConflict(error: unknown): Promise<boolean> {
  const context = (error as { context?: unknown } | null)?.context
  if (!(context instanceof Response)) return false
  if (context.status !== 409) return false
  try {
    // `clone()`: gövde tek kullanımlıktır; çağıran aynı `Response`'u loglamak için
    // tekrar okumak isteyebilir, onu tüketmiş olmayalım.
    const body: unknown = await context.clone().json()
    return (body as { error?: unknown } | null)?.error === SHARED_TRACKING_CONFLICT
  } catch {
    return false
  }
}

/**
 * `admin-update-shipping` çağrısı. `allowSharedTracking` yalnız kullanıcı AÇIKÇA
 * onayladığında `true` geçilir — varsayılan `false`, yani sunucunun benzersizlik
 * kapısı yürürlükte kalır.
 */
export async function invokeShippingUpdate(
  supabase: ShippingFunctionsHost,
  body: ShippingUpdateBody,
  allowSharedTracking = false,
): Promise<ShippingInvokeOutcome> {
  const payload = allowSharedTracking ? { ...body, allow_shared_tracking: true } : body
  const { error } = await supabase.functions.invoke('admin-update-shipping', { body: payload })
  if (!error) return { ok: true, conflict: false }
  return { ok: false, conflict: await isSharedTrackingConflict(error), error }
}

/**
 * Kullanıcı paylaşılan takip numarasını onaylamadı → yazma yapılmadı.
 * Hata DEĞİL bir KARAR: çağıran bunu "başarısız" değil "vazgeçildi" olarak bildirir.
 */
export class SharedTrackingDeclinedError extends Error {
  constructor() {
    super('Paylaşılan takip numarası onaylanmadı; kargo bilgisi yazılmadı.')
    this.name = 'SharedTrackingDeclinedError'
  }
}
