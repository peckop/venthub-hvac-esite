import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from '@/types/database.types';

import { validateServerCart } from '../order';

/**
 * Bu dosya 2026-08-15'te YENİDEN YAZILDI — ve eski hâli, düzeltilen hatanın kendisini
 * KİLİTLİYORDU:
 *
 * ```ts
 * expect(mockFetch).toHaveBeenCalledWith(..., {
 *   headers: { ..., Authorization: 'Bearer test-anon-key' }   // ← hata buydu
 * })
 * ```
 *
 * `order-validate` kimliği gövdedeki `user_id`'den değil TOKEN'dan alır (`auth.getUser`).
 * Anon anahtar bir proje JWT'sidir, `sub` claim'i yoktur → bir kullanıcıya çözülemez →
 * çağrı HER ZAMAN 401 döner. Ölçüldü (kontrol gruplu): anon → 401 "Invalid or expired
 * token" (fonksiyonun kendi gövdesinden), Authorization'sız ve çöp token → geçitten
 * farklı kodlar. Yani sunucu fiyat doğrulaması hiç çalışmamıştı.
 *
 * Test yeşildi ve yanlıştı: doğru davranışı değil, mevcut davranışı ölçüyordu. Kırmızı
 * bir teste bakarken sorulacak soru budur — "kod mu yanlış, yoksa test ESKİ sözleşme mi?"
 *
 * Stub deseni `pricing.resolve.test.ts`'ten: cast yok, GERÇEK supabase-js istemcisi sahte
 * `fetch` ile kuruluyor. Böylece istemcinin gerçekten hangi başlıkları gönderdiği de
 * ölçülebiliyor — mock'lanmış bir `functions.invoke` bunu gizlerdi.
 */

const ANON = 'stub-anon-key'

interface CapturedCall { url: string; headers: Headers; body: unknown }

/** Cast'siz DI stub'ı: gerçek istemci + sahte fetch. */
function stubClient(
  respond: () => Response,
  captured: CapturedCall[],
): SupabaseClient<Database> {
  const fakeFetch: typeof fetch = async (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
    let body: unknown = null
    try {
      body = typeof init?.body === 'string' ? JSON.parse(init.body) : null
    } catch {
      body = init?.body ?? null
    }
    captured.push({ url: href, headers, body })
    return respond()
  }
  return createClient<Database>('http://stub.local', ANON, {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const okResponse = (payload: unknown) =>
  new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })

describe('validateServerCart', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('order-validate\'i doğru gövdeyle çağırır ve cevabı döndürür', async () => {
    const payload = {
      ok: true,
      items: [{ product_id: 'p1', quantity: 2, unit_price: 50, price_list_id: 'pl1' }],
      mismatches: [],
      totals: { subtotal: 100 },
      cart_id: 'cart1',
    };
    const captured: CapturedCall[] = []
    const client = stubClient(() => okResponse(payload), captured)

    const result = await validateServerCart(client, { cartId: 'cart1', userId: 'user1' });

    expect(result).toEqual(payload);
    expect(captured).toHaveLength(1)
    expect(captured[0].url).toContain('/functions/v1/order-validate')
    expect(captured[0].body).toEqual({ cart_id: 'cart1', user_id: 'user1' })
  });

  it('Authorization başlığını İSTEMCİ kurar — fonksiyon elle anon anahtar koymaz', async () => {
    // Düzeltilen hatanın nüksetmesini engelleyen doğrudan kontrat. Oturum açıkken bu
    // başlık kullanıcının JWT'si olur; `validateServerCart` ona müdahale etmemeli.
    const captured: CapturedCall[] = []
    const client = stubClient(
      () => okResponse({ ok: true, items: [], mismatches: [], totals: { subtotal: 0 } }),
      captured,
    )

    await validateServerCart(client, { userId: 'user1' });

    // Oturum yokken istemci anon anahtara düşer; önemli olan başlığın İSTEMCİDEN gelmesi.
    expect(captured[0].headers.get('Authorization')).toBe(`Bearer ${ANON}`)
  });

  it('Edge Function hata döndürürse FIRLATIR (çağıran ödemeyi durdurabilsin)', async () => {
    const captured: CapturedCall[] = []
    const client = stubClient(
      () => new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
      captured,
    )

    await expect(validateServerCart(client, { cartId: 'cart1' })).rejects.toThrow();
  });

  it('boş/biçimsiz gövdeyi "doğrulandı" saymaz', async () => {
    // 200 ama `items` taşımayan bir cevap, doğrulamanın YAPILDIĞI anlamına gelmez.
    // Sessizce `ok` kabul etmek, doğrulamayı tamamen atlamakla aynı sonucu verirdi.
    const captured: CapturedCall[] = []
    const client = stubClient(() => okResponse({ ok: true, totals: { subtotal: 0 } }), captured)

    await expect(validateServerCart(client, { cartId: 'cart1' })).rejects.toThrow('ORDER_VALIDATE_EMPTY_RESPONSE');
  });
});
