import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

export interface ValidationItem { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }
export interface StockIssue { product_id: string; requested: number; available: number }
interface PriceMismatch {
  product_id: string;
  expected_price: number;
  actual_price: number;
}

export interface ValidationResult { ok: boolean; items: ValidationItem[]; mismatches: PriceMismatch[]; stock_issues?: StockIssue[]; totals: { subtotal: number }; cart_id?: string }

/**
 * Sepeti sunucuya doğrulatır (fiyat + stok) — `order-validate` Edge Function'ı.
 *
 * ## ⭐ NİÇİN `supabase.functions.invoke` — ham `fetch` DEĞİL (2026-08-15, ölçülerek)
 *
 * Önceki hâli `fetch`'e **anon anahtarı** `Authorization` başlığı olarak koyuyordu.
 * `order-validate` ise kimliği gövdedeki `user_id`'den değil **token'dan** alır
 * (`auth.getUser`). Anon anahtar bir proje JWT'sidir; `sub` claim'i yoktur, dolayısıyla
 * bir kullanıcıya çözülemez. Ölçüm (kontrol gruplu, 2026-08-15):
 *
 * ```
 * anon anahtarla     -> 401 {"error":"unauthorized","message":"Invalid or expired token"}
 * Authorization'sız  -> 401 {"code":"UNAUTHORIZED_NO_AUTH_HEADER"}      (geçitten)
 * çöp token          -> 401 {"code":"UNAUTHORIZED_INVALID_JWT_FORMAT"}  (geçitten)
 * ```
 *
 * Üç FARKLI cevap: yani istek fonksiyona ulaşıyor ve fonksiyon anon anahtarı reddediyor.
 * Sonuç: bu çağrı **her zaman** 401 alıyordu — yani sunucu fiyat doğrulaması hiç
 * çalışmamıştı. Çağıran taraf hatayı yuttuğu için kimse fark etmedi.
 *
 * `functions.invoke` oturumun **kullanıcı JWT**'sini kendisi ekler — `iyzico-payment`
 * çağrısı da zaten böyle yapılıyor ve o çalışıyor. Aynı istemciyi kullanmak, iki çağrının
 * kimlik davranışının ayrışmasını da engeller.
 *
 * DI kuralı (CLAUDE.md §2): istemci parametre olarak alınır, modül düzeyinde import edilmez.
 *
 * @throws Doğrulama yapılamazsa hata fırlatır. **Yutma** — çağıran ödemeyi durdurmalıdır;
 *   sessizce devam etmek, tutarı istemcinin belirlemesi demektir.
 */
export async function validateServerCart(
  supabase: SupabaseClient<Database>,
  input: { cartId?: string; userId?: string },
): Promise<ValidationResult> {
  const { data, error } = await supabase.functions.invoke<ValidationResult>('order-validate', {
    body: { cart_id: input.cartId, user_id: input.userId },
  })
  if (error) throw error
  // Boş gövde = doğrulama YAPILMADI. "ok" saymak, doğrulamayı atlamakla aynı şey.
  if (!data || !Array.isArray(data.items)) {
    throw new Error('ORDER_VALIDATE_EMPTY_RESPONSE')
  }
  return data
}
