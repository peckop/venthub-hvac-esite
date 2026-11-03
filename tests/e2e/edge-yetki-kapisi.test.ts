/**
 * KİLİT · edge yetki/tenant kapısı (karne 2026-11 kök 2 · OPS-211)
 *
 * Statik kurallar (`edge-security.test.ts` R13/R14/R8-EK) kodun BİÇİMİNİ ölçer. Bu dosya
 * DAVRANIŞI ölçer: gerçek edge kaynağı Deno simülatöründe koşar, Supabase istemcisi ve
 * `fetch` sahte. Karnedeki her bulgunun "bunu geri gelmekten alıkoyacak test" satırı burada:
 *
 *   Y1 · order-validate   — A, B'nin `cart_id`'siyle 404 alır; sepet kalemleri hiç okunmaz.
 *   Y6 · iyzico-refund    — admin olmayana sipariş VAR da olsa YOK da olsa 403; sipariş okunmaz.
 *   Y7 · healthz          — müşteri JWT'siyle ayrıntı (eksik env listesi, sürüm) dönmez;
 *                           service_role ile döner.
 *   K4 · sabit zaman      — `timingSafeEquals` / HMAC / Bearer doğru ve yanlış değeri ayırır;
 *                           cron uçları yanlış anahtarla 401, doğru anahtarla kapıyı geçer;
 *                           kargo webhook'u yanlış token'la 401.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupDenoRuntime, DenoRuntimeSimulator } from './helpers/denoRuntime'
import {
  bearerEsitMi,
  hmacImzaGecerli,
  timingSafeEquals,
} from '../../supabase/functions/_shared/sabit_zaman'
import { iyzipaySayac } from './helpers/iyzipaySahte'

const SUPABASE_URL = 'https://ornek-proje.supabase.co'
const SERVICE_KEY = 'service-role-anahtari-0123456789'
const ANON_KEY = 'anon-anahtari'
const TENANT = 'd3b07384-d113-495f-a558-8c38634e0000'

/* ------------------------------------------------------------------ *
 * Sahte dünya: JWT → kullanıcı, kullanıcı → profil, REST tabloları.
 * ------------------------------------------------------------------ */
const dunya = vi.hoisted(() => ({
  kullanicilar: new Map<string, { id: string; app_metadata: Record<string, unknown> }>(),
  profiller: new Map<string, { role: string; tenant_id: string }>(),
}))

vi.mock('@supabase/supabase-js', () => {
  /** Her zincir çağrısını kabul eden, sonunda boş veri dönen sorgu. */
  const zincir = (tablo: string) => {
    const filtre: Record<string, unknown> = {}
    const q: Record<string, unknown> = {}
    const kendisi = () => q
    for (const ad of ['select', 'order', 'limit', 'lt', 'gte', 'lte', 'in', 'update', 'insert', 'neq']) {
      q[ad] = kendisi
    }
    q.eq = (kolon: string, deger: unknown) => {
      filtre[kolon] = deger
      return q
    }
    q.maybeSingle = async () => {
      if (tablo === 'user_profiles') {
        return { data: dunya.profiller.get(String(filtre.id)) ?? null, error: null }
      }
      return { data: null, error: null }
    }
    q.single = q.maybeSingle
    q.then = (coz: (v: unknown) => void) => coz({ data: [], error: null })
    return q
  }
  return {
    createClient: () => ({
      auth: {
        getUser: async (token: string) => {
          const user = dunya.kullanicilar.get(token)
          return user ? { data: { user }, error: null } : { data: { user: null }, error: { message: 'bad jwt' } }
        },
      },
      from: (tablo: string) => zincir(tablo),
      rpc: async () => ({ data: null, error: null }),
    }),
  }
})

// iyzico-refund `npm:iyzipay` import eder; Vite bu öneki paketleyemediği için simülatör onu
// test sahtesine yönlendirir. Yetki kapısı testinde SDK hiç kurulmamalı.
const IYZIPAY_SAHTE = process.cwd() + '/tests/e2e/helpers/iyzipaySahte.ts'

/** `fetch` sahtesi: çağrılan her adresi kaydeder, tabloya göre cevap üretir. */
type Cevaplayici = (url: string, init?: RequestInit) => Response | undefined
let cagrilar: string[] = []
function fetchKur(cevapla: Cevaplayici) {
  cagrilar = []
  vi.stubGlobal('fetch', async (girdi: string | URL | Request, init?: RequestInit) => {
    const url = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.href : girdi.url
    cagrilar.push(url)
    return cevapla(url, init) ?? new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
  })
}
const jsonCevap = (v: unknown, status = 200) =>
  new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json' } })

function kullaniciEkle(token: string, id: string, role: string) {
  dunya.kullanicilar.set(token, { id, app_metadata: { tenant_id: TENANT } })
  dunya.profiller.set(id, { role, tenant_id: TENANT })
}

const fnYolu = (ad: string) => process.cwd() + `/supabase/functions/${ad}/index.ts`
const istek = (ad: string, token: string | null, init: RequestInit = {}) =>
  new Request(`https://localhost/functions/v1/${ad}`, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init.headers as Record<string, string>) ?? {}),
    },
  })

let simulator: DenoRuntimeSimulator
beforeEach(() => {
  dunya.kullanicilar.clear()
  dunya.profiller.clear()
  kullaniciEkle('jwt-musteri-a', 'user-a', 'user')
  kullaniciEkle('jwt-musteri-b', 'user-b', 'user')
  kullaniciEkle('jwt-admin', 'user-admin', 'admin')
  simulator = setupDenoRuntime({
    env: {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
      SUPABASE_ANON_KEY: ANON_KEY,
      IYZICO_API_KEY: 'k',
      IYZICO_SECRET_KEY: 's',
      IYZICO_BASE_URL: 'https://sandbox-api.iyzipay.com',
      RELEASE: 'v-test',
      COMMIT_SHA: 'abc123',
    },
    moduleRewrites: {
      'npm:iyzipay': IYZIPAY_SAHTE,
      'https://deno.land/std@0.177.0/http/server.ts': process.cwd() + '/tests/e2e/helpers/denoStdServeSahte.ts',
    },
  })
})
afterEach(() => {
  simulator.cleanup()
  vi.unstubAllGlobals()
})

/* ------------------------------------------------------------------ *
 * K4 — ortak sabit zamanlı yardımcılar
 * ------------------------------------------------------------------ */
describe('K4 · _shared/sabit_zaman.ts', () => {
  it('timingSafeEquals eşit/farklı/uzunluk farklı değerleri doğru ayırır', () => {
    expect(timingSafeEquals('abc', 'abc')).toBe(true)
    expect(timingSafeEquals('abc', 'abd')).toBe(false)
    expect(timingSafeEquals('abc', 'abcd')).toBe(false)
    expect(timingSafeEquals('', 'a')).toBe(false)
    expect(timingSafeEquals('ğüş', 'ğüş')).toBe(true)
  })

  it('hmacImzaGecerli doğru imzayı kabul eder, yanlışı ve boş sırrı reddeder', async () => {
    const govde = '{"a":1}'
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('sir'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const imza = btoa(
      String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(govde)))),
    )
    expect(await hmacImzaGecerli('sir', govde, imza)).toBe(true)
    expect(await hmacImzaGecerli('sir', govde, `sha256=${imza}`)).toBe(true)
    expect(await hmacImzaGecerli('sir', govde + ' ', imza)).toBe(false)
    expect(await hmacImzaGecerli('', govde, imza)).toBe(false)
    expect(await hmacImzaGecerli('sir', govde, '')).toBe(false)
  })

  it('bearerEsitMi yalnız tam anahtarı kabul eder', () => {
    expect(bearerEsitMi(`Bearer ${SERVICE_KEY}`, SERVICE_KEY)).toBe(true)
    expect(bearerEsitMi(`Bearer ${SERVICE_KEY}x`, SERVICE_KEY)).toBe(false)
    expect(bearerEsitMi(null, SERVICE_KEY)).toBe(false)
    expect(bearerEsitMi('Bearer ', '')).toBe(false)
  })
})

/* ------------------------------------------------------------------ *
 * K4 — cron uçları ortak kapıdan geçiyor
 * ------------------------------------------------------------------ */
describe('K4 · zamanlanmış uçlar service_role anahtarını sabit zamanlı doğrular', () => {
  const ayniBoyYanlis = SERVICE_KEY.slice(0, -1) + (SERVICE_KEY.endsWith('9') ? '8' : '9')

  it('release-expired-reservations: yanlış anahtar 401, müşteri 401, service_role kapıyı geçer', async () => {
    fetchKur(() => undefined)
    const yol = fnYolu('release-expired-reservations')
    expect((await simulator.invokeFunction(yol, istek('release-expired-reservations', ayniBoyYanlis))).status).toBe(401)
    expect((await simulator.invokeFunction(yol, istek('release-expired-reservations', 'jwt-musteri-a'))).status).toBe(401)
    const servis = await simulator.invokeFunction(yol, istek('release-expired-reservations', SERVICE_KEY))
    expect(servis.status).toBe(200)
    const admin = await simulator.invokeFunction(yol, istek('release-expired-reservations', 'jwt-admin'))
    expect(admin.status).toBe(200)
  })

  it('order-housekeeping: kimliksiz 401, yanlış anahtar 401, müşteri 403, service_role kapıyı geçer', async () => {
    fetchKur(() => undefined)
    const yol = fnYolu('order-housekeeping')
    expect((await simulator.invokeFunction(yol, istek('order-housekeeping', null))).status).toBe(401)
    expect((await simulator.invokeFunction(yol, istek('order-housekeeping', ayniBoyYanlis))).status).toBe(401)
    expect((await simulator.invokeFunction(yol, istek('order-housekeeping', 'jwt-musteri-a'))).status).toBe(403)
    const servis = await simulator.invokeFunction(yol, istek('order-housekeeping', SERVICE_KEY))
    expect([401, 403]).not.toContain(servis.status)
    // Kapı geçildi: sipariş tablosuna gidildi.
    expect(cagrilar.some((u) => u.includes('/rest/v1/venthub_orders'))).toBe(true)
  })

  it('shipping-webhook: aynı uzunlukta yanlış legacy token 401', async () => {
    simulator.setEnv('SHIPPING_WEBHOOK_TOKEN', 'legacy-token-555')
    fetchKur(() => undefined)
    const res = await simulator.invokeFunction(
      fnYolu('shipping-webhook'),
      istek('shipping-webhook', null, {
        headers: { 'x-webhook-token': 'legacy-token-556', 'x-timestamp': String(Date.now()) },
        body: JSON.stringify({ order_number: 'ORD-1', status: 'shipped' }),
      }),
    )
    expect(res.status).toBe(401)
  })
})

/* ------------------------------------------------------------------ *
 * Y1 — order-validate başkasının sepetini okuyamaz
 * ------------------------------------------------------------------ */
describe('Y1 · order-validate sepet sahipliği', () => {
  const SEPET_A = '11111111-1111-1111-1111-111111111111'
  const SEPET_B = '22222222-2222-2222-2222-222222222222'
  const sepetler = [
    { id: SEPET_A, user_id: 'user-a' },
    { id: SEPET_B, user_id: 'user-b' },
  ]
  /** PostgREST filtresini taklit eder: user_id + (varsa) id + tenant_id. */
  const cevapla: Cevaplayici = (url) => {
    if (url.includes('/rest/v1/shopping_carts')) {
      const u = new URL(url)
      if (u.searchParams.get('tenant_id') !== `eq.${TENANT}`) return jsonCevap([])
      const user = u.searchParams.get('user_id')?.replace(/^eq\./, '')
      const id = u.searchParams.get('id')?.replace(/^eq\./, '')
      return jsonCevap(sepetler.filter((s) => s.user_id === user && (!id || s.id === id)).map((s) => ({ id: s.id })))
    }
    if (url.includes('/rest/v1/cart_items')) {
      return jsonCevap([{ product_id: 'p1', quantity: 1, unit_price: 10, price_list_id: null }])
    }
    if (url.includes('/rest/v1/products')) return jsonCevap([{ id: 'p1', price: 10, stock_qty: 5 }])
    return undefined
  }

  it("A, B'nin cart_id'siyle 404 alır ve B'nin kalemleri hiç okunmaz", async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(
      fnYolu('order-validate'),
      istek('order-validate', 'jwt-musteri-a', { body: JSON.stringify({ cart_id: SEPET_B }) }),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('cart_not_found')
    expect(cagrilar.some((u) => u.includes('/rest/v1/cart_items'))).toBe(false)
  })

  it('var olmayan cart_id ile de AYNI cevap (varlık sızmaz)', async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(
      fnYolu('order-validate'),
      istek('order-validate', 'jwt-musteri-a', {
        body: JSON.stringify({ cart_id: '33333333-3333-3333-3333-333333333333' }),
      }),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('cart_not_found')
  })

  it('A kendi sepetiyle 200 alır; kalem sorgusu tenant filtreli', async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(
      fnYolu('order-validate'),
      istek('order-validate', 'jwt-musteri-a', { body: JSON.stringify({ cart_id: SEPET_A }) }),
    )
    expect(res.status).toBe(200)
    const kalem = cagrilar.find((u) => u.includes('/rest/v1/cart_items'))
    expect(kalem).toContain(`cart_id=eq.${SEPET_A}`)
    expect(kalem).toContain(`tenant_id=eq.${TENANT}`)
  })

  it('kimliksiz istek 401', async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(fnYolu('order-validate'), istek('order-validate', null, { body: '{}' }))
    expect(res.status).toBe(401)
  })
})

/* ------------------------------------------------------------------ *
 * Y6 — iyzico-refund yetkiden önce sipariş yüklemez
 * ------------------------------------------------------------------ */
describe('Y6 · iyzico-refund önce yetki, sonra sipariş', () => {
  const VAR_OLAN = '44444444-4444-4444-4444-444444444444'
  const cevapla: Cevaplayici = (url) => {
    if (url.includes('/rest/v1/venthub_orders')) {
      const u = new URL(url)
      if (u.searchParams.get('id') === `eq.${VAR_OLAN}`) {
        return jsonCevap([{ id: VAR_OLAN, user_id: 'user-a', tenant_id: TENANT, total_amount: 100, payment_debug: {} }])
      }
      return jsonCevap([])
    }
    return undefined
  }

  it('müşteri: var olan ve olmayan sipariş için AYNI 403; sipariş tablosuna gidilmez', async () => {
    for (const orderId of [VAR_OLAN, '55555555-5555-5555-5555-555555555555']) {
      fetchKur(cevapla)
      const res = await simulator.invokeFunction(
        fnYolu('iyzico-refund'),
        istek('iyzico-refund', 'jwt-musteri-a', { body: JSON.stringify({ order_id: orderId }) }),
      )
      expect(res.status).toBe(403)
      expect(cagrilar.some((u) => u.includes('/rest/v1/venthub_orders'))).toBe(false)
    }
    expect(iyzipaySayac.kurulum).toBe(0)
  })

  it('service_role anahtarı para iadesi yetkisi VERMEZ (403)', async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(
      fnYolu('iyzico-refund'),
      istek('iyzico-refund', SERVICE_KEY, { body: JSON.stringify({ order_id: VAR_OLAN }) }),
    )
    expect(res.status).toBe(403)
  })

  it('admin: sipariş yalnız kendi tenant filtresiyle okunur; yoksa 404', async () => {
    fetchKur(cevapla)
    const res = await simulator.invokeFunction(
      fnYolu('iyzico-refund'),
      istek('iyzico-refund', 'jwt-admin', {
        body: JSON.stringify({ order_id: '55555555-5555-5555-5555-555555555555' }),
      }),
    )
    expect(res.status).toBe(404)
    const okuma = cagrilar.find((u) => u.includes('/rest/v1/venthub_orders'))
    expect(okuma).toContain(`tenant_id=eq.${TENANT}`)
  })
})

/* ------------------------------------------------------------------ *
 * Y7 — healthz ayrıntısı yalnız ayrıcalıklı çağırana
 * ------------------------------------------------------------------ */
describe('Y7 · healthz ayrıntı görünürlüğü', () => {
  const get = (token: string | null) => istek('healthz', token, { method: 'GET' })

  it('müşteri JWT: yalnız hüküm ve ödeme ortamı; eksik env listesi, sürüm, sebep YOK', async () => {
    fetchKur(() => new Response(null, { status: 200 }))
    const res = await simulator.invokeFunction(fnYolu('healthz'), get('jwt-musteri-a'))
    const govde = await res.json()
    expect(typeof govde.durum).toBe('string')
    expect(govde.config.odeme_ortami).toBe('sandbox')
    expect(govde.config.sorunlu).toBeUndefined()
    expect(govde.config.denetlenen).toBeUndefined()
    expect(govde.release).toBeUndefined()
    expect(govde.commit).toBeUndefined()
    expect(govde.sebep).toBeUndefined()
    expect(Object.keys(govde.config)).toEqual(['odeme_ortami'])
  })

  it('anon anahtar (satış açılış K2 betiği): yalnız hüküm ve ödeme ortamı', async () => {
    fetchKur(() => new Response(null, { status: 200 }))
    const govde = await (await simulator.invokeFunction(fnYolu('healthz'), get(ANON_KEY))).json()
    expect(Object.keys(govde.config)).toEqual(['odeme_ortami'])
    expect(govde.release).toBeUndefined()
  })

  it('service_role ve admin: ayrıntılı gövde döner', async () => {
    for (const token of [SERVICE_KEY, 'jwt-admin']) {
      fetchKur(() => new Response(null, { status: 200 }))
      const govde = await (await simulator.invokeFunction(fnYolu('healthz'), get(token))).json()
      expect(govde.release).toBe('v-test')
      expect(govde.commit).toBe('abc123')
      expect(Array.isArray(govde.config.sorunlu)).toBe(true)
      expect(typeof govde.config.denetlenen).toBe('number')
    }
  })
})
