// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-ODEME-CALLBACK-1/2/3 · iyzico-callback ödeme kaydını ön koşulsuz yazamaz (ALT-131,
 * güvenlik karnesi 2026-11 P1 HIGH; CLAUDE.md kural 11: sipariş/ödeme durumları monoton).
 *
 * DAVRANIŞLA ölçülür: `supabase/functions/iyzico-callback/index.ts` gerçek hâliyle yüklenir, `Deno.serve`'e
 * verilen işleyici yakalanır. İyzico SDK'sı (`npm:iyzipay`) bir taklitle, PostgREST sahte `fetch` ile
 * cevaplanır. Sahte PostgREST PATCH filtresini GERÇEKTEN uygular (`status=eq.`, `payment_status=in.(...)`):
 * okuma ile yazma arasında satır ilerlerse 0 satır güncellenir — veritabanının yapacağı gibi.
 *
 * SABOTAJ: aynı senaryolar kapısı SÖKÜLMÜŞ bir kopyaya karşı da koşar (karar "hep yaz", koşul filtresi
 * boş, debug ezilir — yani düzeltme öncesi davranış) ve oradaki saldırıların GEÇTİĞİ ölçülür.
 * Kapısız kopyada kırmızı görmeyen bir test, düzeltmeyi kanıtlamaz.
 */

const KOK = path.resolve(__dirname, '../../..')
const YOL = 'supabase/functions/iyzico-callback/index.ts'
const YENI = fs.readFileSync(path.join(KOK, YOL), 'utf8')
/** Kapıyı söken dönüşümler. Her biri en az bir kez eşleşmek ZORUNDA, yoksa sabotaj sessizce boşa düşer. */
const SOKUMLER: [RegExp, string][] = [
  [/basariYazilabilirMi\(siparisSatiri\)/g, '({ yaz: true, sebep: null })'],
  [/retYazilabilirMi\(siparisSatiri, [^)]*\)/g, '({ yaz: true, sebep: null })'],
  [/kosulFiltresi\((BASARI|RET)_ONCESI\)/g, "''"],
  [/debugBirlestir\(siparisSatiri\?\.payment_debug, /g, '((_eski: unknown, y: Record<string, unknown>) => y)(null, '],
]
function kapiyiSok(metin: string): string {
  let m = metin
  for (const [desen, yerine] of SOKUMLER) {
    if (!new RegExp(desen.source).test(m)) throw new Error(`sabotaj deseni eşleşmedi: ${desen}`)
    m = m.replace(desen, yerine)
  }
  return m
}

type Isleyici = (req: Request) => Promise<Response>
type Satir = {
  id: string
  tenant_id: string
  conversation_id: string
  total_amount: number
  currency: string
  status: string
  payment_status: string
  payment_token: string | null
  payment_debug: Record<string, unknown> | null
  coupon_code: string | null
  user_id: string | null
}

const SIPARIS = '11111111-1111-4111-8111-111111111111'
const KURBAN_TOKEN = 'tok-kurban'
const SALDIRGAN_TOKEN = 'tok-saldirgan'
const DEFTER = { refunded_total: 120, refunds: [{ id: 'r1', amount: 120 }], raw: { paymentId: 'gercek-odeme' }, stock_processed: true }

let satir: Satir
let patchlar: { url: URL; govde: Record<string, unknown>; guncellenen: number }[] = []
let rpcCagrilari: string[] = []
/** Gelir alarmı kodları (`client_errors` POST gövdesindeki `extra.code`). */
let alarmlar: string[] = []
/** Müşteri sepetinden kalem silme çağrısı sayısı. */
let sepetSilme = 0
/** PATCH anında satırın başka bir yazıcı tarafından değiştirildiği yarış senaryosu için. */
let patchOncesi: (() => void) | null = null
/** İyzico retrieve'in vereceği yanıt (token'a göre). */
let iyziYanit: (token: string) => Record<string, unknown> = () => ({})

function yeniSatir(over: Partial<Satir> = {}): Satir {
  return {
    id: SIPARIS,
    tenant_id: 'venthub',
    conversation_id: 'CONV-1730000000000',
    total_amount: 1200,
    currency: 'TRY',
    status: 'pending',
    payment_status: 'pending',
    payment_token: KURBAN_TOKEN,
    payment_debug: structuredClone(DEFTER),
    coupon_code: null,
    user_id: null,
    ...over,
  }
}

const basarili = (): Record<string, unknown> => ({
  status: 'success', paymentStatus: 'SUCCESS', basketId: SIPARIS, price: 1200, paidPrice: 1200, currency: 'TRY', paymentId: 'yeni-odeme',
})
const reddedildi = (): Record<string, unknown> => ({ status: 'success', paymentStatus: 'FAILURE', errorMessage: 'kart reddedildi' })

/** PostgREST filtresi: `eq.x` ya da `in.(x,y)`. */
function filtreUyar(deger: string, filtre: string | null): boolean {
  if (filtre === null) return true
  if (filtre.startsWith('eq.')) return deger === decodeURIComponent(filtre.slice(3))
  const m = /^in\.\((.*)\)$/.exec(filtre)
  if (m) return m[1].split(',').includes(deger)
  throw new Error(`sahte PostgREST bu filtreyi tanımıyor: ${filtre}`)
}

async function sahteFetch(girdi: RequestInfo | URL, secenek?: RequestInit): Promise<Response> {
  const url = new URL(typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.href : girdi.url)
  const yontem = (secenek?.method ?? 'GET').toUpperCase()
  if (url.pathname.endsWith('/rest/v1/venthub_orders')) {
    const idUyar = filtreUyar(satir.id, url.searchParams.get('id'))
    const convUyar = filtreUyar(satir.conversation_id, url.searchParams.get('conversation_id'))
    if (yontem === 'GET') return Response.json(idUyar && convUyar ? [structuredClone(satir)] : [])
    if (yontem === 'PATCH') {
      patchOncesi?.()
      const govde = JSON.parse(String(secenek?.body ?? '{}')) as Record<string, unknown>
      const uyar =
        idUyar && convUyar &&
        filtreUyar(satir.tenant_id, url.searchParams.get('tenant_id')) &&
        filtreUyar(satir.status, url.searchParams.get('status')) &&
        filtreUyar(satir.payment_status, url.searchParams.get('payment_status'))
      patchlar.push({ url, govde, guncellenen: uyar ? 1 : 0 })
      if (!uyar) return Response.json([])
      satir = { ...satir, ...(govde as Partial<Satir>) }
      return Response.json([structuredClone(satir)])
    }
  }
  if (url.pathname.includes('/rest/v1/rpc/')) {
    rpcCagrilari.push(url.pathname.split('/').pop() ?? '')
    return Response.json({ success: true })
  }
  if (url.pathname.endsWith('/rest/v1/client_errors')) {
    const g = JSON.parse(String(secenek?.body ?? '{}')) as { extra?: { code?: string } }
    alarmlar.push(g.extra?.code ?? '?')
    return new Response(null, { status: 201 })
  }
  if (url.pathname.endsWith('/rest/v1/coupons')) {
    return Response.json([{ discount_type: 'percentage', discount_value: 10, is_active: true, used_count: 0, usage_limit: null }])
  }
  if (url.pathname.endsWith('/rest/v1/shopping_carts')) return Response.json([{ id: 'sepet-1' }])
  if (url.pathname.endsWith('/rest/v1/cart_items') && yontem === 'DELETE') {
    sepetSilme++
    return new Response(null, { status: 204 })
  }
  // products: içerik bu testin konusu değil.
  if (yontem === 'POST') return new Response(null, { status: 201 })
  return Response.json([])
}

let tmp = ''
function dizin(): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'odeme-callback-'))
  return tmp
}

/** İyzico SDK taklidi: retrieve, testin `iyziYanit` işlevine sorulur. */
function iyziTaklidi(): string {
  const yol = path.join(dizin(), 'iyzipay-taklit.mjs')
  fs.writeFileSync(
    yol,
    'export default class { constructor() { this.checkoutForm = { retrieve: (req, cb) => cb(null, globalThis.__iyziYanit(req.token)) } } }\n',
  )
  return pathToFileURL(yol).href
}

/**
 * Callback kaynağını geçici dizine yazar; yalnız içe aktarma belirteçleri yerel dosyaya çevrilir
 * (`npm:iyzipay` → taklit, `../_shared/*.ts` → depodaki dosya). Gövde bayt bayt aynıdır.
 */
function nodeKopyasi(ad: string, metin: string): string {
  const taklit = iyziTaklidi()
  const paylasilan = pathToFileURL(path.join(KOK, 'supabase/functions/_shared')).href
  const cevrilmis = metin
    .replace(/["']npm:iyzipay["']/, `'${taklit}'`)
    .replace(/(['"])\.\.\/_shared\//g, `$1${paylasilan}/`)
  if (/["']npm:|https:\/\/esm\.sh|['"]\.\.\//.test(cevrilmis)) {
    throw new Error('iyzico-callback yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli')
  }
  const yol = path.join(dizin(), `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

async function isleyiciYukle(dosya: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => {
      yakalanan = f
    },
    env: {
      get: (k: string) =>
        ({
          SUPABASE_URL: 'https://ornek.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari',
          IYZICO_API_KEY: 'test-api',
          IYZICO_SECRET_KEY: 'test-gizli',
          IYZICO_BASE_URL: 'https://sandbox-api.iyzipay.com',
          PUBLIC_SITE_URL: 'https://venthub.com.tr',
          ALLOWED_ORIGINS: '',
        })[k],
    },
  })
  await import(/* @vite-ignore */ pathToFileURL(dosya).href)
  if (!yakalanan) throw new Error('Deno.serve çağrılmadı')
  return yakalanan
}

async function cagir(isleyici: Isleyici, govde: Record<string, unknown>) {
  const r = await isleyici(
    new Request('https://ornek.supabase.co/functions/v1/iyzico-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(govde),
    }),
  )
  return (await r.json()) as { status: string; updated: boolean }
}

/** Sipariş satırına bu çağrıyla gerçekten bir şey yazıldı mı? */
const yazildi = () => patchlar.some((p) => p.guncellenen > 0)

let yeni: Isleyici
let eski: Isleyici | null = null
let eskiYuklenemedi = ''

beforeAll(async () => {
  vi.stubGlobal('fetch', sahteFetch)
  ;(globalThis as Record<string, unknown>).__iyziYanit = (t: string) => iyziYanit(t)
  yeni = await isleyiciYukle(nodeKopyasi('yeni', YENI))
  try {
    eski = await isleyiciYukle(nodeKopyasi('kapisiz', kapiyiSok(YENI)))
  } catch (e) {
    eskiYuklenemedi = e instanceof Error ? e.message : String(e)
  }
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  satir = yeniSatir()
  patchlar = []
  rpcCagrilari = []
  alarmlar = []
  sepetSilme = 0
  patchOncesi = null
  iyziYanit = () => ({})
})

const YASAM_ILERI = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const ODEME_TUMU = ['pending', 'paid', 'failed', 'refunded', 'partial_refunded'] as const

describe('INV-ODEME-CALLBACK-1 · kimliksiz ret, başkasının siparişine yazılamaz (karne kilit b)', () => {
  it('saldırganın reddedilen token\'ı + kurbanın ödenmiş siparişi → hiçbir PATCH satır güncellemez', async () => {
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid' })
    iyziYanit = reddedildi
    await cagir(yeni, { token: SALDIRGAN_TOKEN, orderId: SIPARIS })
    expect(yazildi()).toBe(false)
    expect(satir.payment_status).toBe('paid')
    expect(satir.payment_debug).toEqual(DEFTER)
  })

  it('kurbanın siparişi hâlâ pending olsa bile başka token ile ret yazılmaz (bağ şartı)', async () => {
    iyziYanit = reddedildi
    await cagir(yeni, { token: SALDIRGAN_TOKEN, orderId: SIPARIS })
    expect(yazildi()).toBe(false)
    expect(satir.payment_status).toBe('pending')
  })

  it('siparişin KENDİ token\'ıyla gelen ret yazılır; iade defteri ezilmez, birleşir', async () => {
    satir = yeniSatir({ payment_debug: { refunded_total: 0, not: 'onceki' } })
    iyziYanit = reddedildi
    const c = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect(c.updated).toBe(true)
    expect(satir.payment_status).toBe('failed')
    expect(satir.status).toBe('pending')
    expect(satir.payment_debug).toMatchObject({ refunded_total: 0, not: 'onceki', paymentStatus: 'FAILURE' })
    const p = patchlar.find((x) => x.guncellenen > 0)
    expect(p?.url.searchParams.get('status')).toBe('eq.pending')
    expect(p?.url.searchParams.get('payment_status')).toBe('eq.pending')
  })

  it('token gövdede yoksa DB\'deki kendi token\'ı kullanılır (order-housekeeping yolu) ve ret yazılabilir', async () => {
    iyziYanit = reddedildi
    await cagir(yeni, { orderId: SIPARIS })
    expect(satir.payment_status).toBe('failed')
  })
})

describe('INV-ODEME-CALLBACK-2 · başarı geri saramaz (karne kilit a, kural 11)', () => {
  it('teslim edilmiş siparişe AYNI ödemenin bildirimi → PATCH yok, delivered kalır, cevap success, alarm yok', async () => {
    const kayit = { ...structuredClone(DEFTER), raw: { paymentId: 'yeni-odeme' }, paymentId: 'yeni-odeme' }
    satir = yeniSatir({ status: 'delivered', payment_status: 'paid', payment_debug: kayit })
    iyziYanit = basarili
    const c = await cagir(yeni, { orderId: SIPARIS })
    expect(c.status).toBe('success')
    expect(patchlar.filter((p) => 'status' in p.govde || 'payment_status' in p.govde)).toHaveLength(0)
    expect(satir.status).toBe('delivered')
    // Zararsız tekrarda stok RPC'si yine koşar ve stok damgasını BİRLEŞTİREREK ekler: defter korunur.
    expect(satir.payment_debug).toMatchObject({ refunded_total: 120, refunds: DEFTER.refunds, paymentId: 'yeni-odeme' })
    expect(alarmlar).toEqual([])
  })

  it('iptal edilmiş siparişe gelen gerçek ödeme sessiz kalmaz: yazılmaz, needs_review + PAYMENT_ON_TERMINATED_ORDER', async () => {
    satir = yeniSatir({ status: 'cancelled', payment_status: 'failed' })
    iyziYanit = basarili
    const c = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect(c.status).toBe('needs_review')
    expect(yazildi()).toBe(false)
    expect(satir.status).toBe('cancelled')
    expect(alarmlar).toEqual(['PAYMENT_ON_TERMINATED_ORDER'])
  })

  it('başka bir ödemeyle zaten ödenmiş siparişe ikinci tahsilat → needs_review + DUPLICATE_CHARGE', async () => {
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid', payment_debug: { ...structuredClone(DEFTER), paymentId: 'ilk-odeme' } })
    iyziYanit = basarili
    const c = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect(c.status).toBe('needs_review')
    expect(yazildi()).toBe(false)
    expect(alarmlar).toEqual(['DUPLICATE_CHARGE'])
  })

  it('iade edilmiş siparişe SUCCESS → refunded paid\'e dönmez', async () => {
    satir = yeniSatir({ status: 'cancelled', payment_status: 'refunded' })
    iyziYanit = basarili
    await cagir(yeni, { orderId: SIPARIS })
    expect(yazildi()).toBe(false)
    expect(satir.payment_status).toBe('refunded')
  })

  it('pending siparişe eşleşen SUCCESS yazılır; filtrede status=eq.pending var, önceki debug korunur', async () => {
    iyziYanit = basarili
    const c = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect(c).toMatchObject({ status: 'success', updated: true })
    expect(satir).toMatchObject({ status: 'confirmed', payment_status: 'paid' })
    expect(satir.payment_debug).toMatchObject({ refunded_total: 120, refunds: DEFTER.refunds, paymentId: 'yeni-odeme' })
    const p = patchlar.find((x) => 'status' in x.govde)
    expect(p?.url.searchParams.get('status')).toBe('eq.pending')
    expect(p?.url.searchParams.get('payment_status')).toBe('in.(pending,failed)')
  })

  it('okuma ile yazma arasında satır ilerlerse (yarış) yazım 0 satır döner ve yan etkiler koşmaz', async () => {
    iyziYanit = basarili
    patchOncesi = () => {
      satir = { ...satir, status: 'shipped', payment_status: 'paid' }
      patchOncesi = null
    }
    const c = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect(c.updated).toBe(false)
    expect(satir.status).toBe('shipped')
    expect(rpcCagrilari).not.toContain('process_order_stock_reduction')
  })

  it('aynı ödemenin ikinci bildirimi (İyzico POST + tarayıcı dönüşü): kupon, stok ve sepet ikinci kez dokunulmaz', async () => {
    satir = yeniSatir({ coupon_code: 'YUZDE10', user_id: 'musteri-1' })
    iyziYanit = basarili
    const c1 = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    const sepetIlk = sepetSilme
    expect(sepetIlk).toBeGreaterThan(0)
    const c2 = await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
    expect([c1.status, c2.status]).toEqual(['success', 'success'])
    expect(rpcCagrilari.filter((r) => r === 'increment_coupon_usage')).toHaveLength(1)
    expect(rpcCagrilari.filter((r) => r === 'process_order_stock_reduction')).toHaveLength(1)
    expect(sepetSilme).toBe(sepetIlk)
    expect(alarmlar).toEqual([])
  })

  it('kimliksiz tekrar bildirim: stok düşümü yarım kaldıysa YALNIZ stok onarılır, müşterinin sepeti boşaltılmaz', async () => {
    const kayit = { refunded_total: 0, paymentId: 'yeni-odeme', stock_processed: false }
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid', payment_debug: kayit, coupon_code: 'YUZDE10', user_id: 'musteri-1' })
    iyziYanit = basarili
    const c = await cagir(yeni, { orderId: SIPARIS })
    expect(c.status).toBe('success')
    expect(rpcCagrilari).toEqual(['process_order_stock_reduction'])
    expect(sepetSilme).toBe(0)
    expect(satir).toMatchObject({ status: 'confirmed', payment_status: 'paid' })
  })

  it('kayıtlı paymentId olmayan eski ödenmiş satır: fail-closed, PAYMENT_UNVERIFIED_LEGACY, defter değişmez', async () => {
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid' })
    iyziYanit = basarili
    const c = await cagir(yeni, { orderId: SIPARIS })
    expect(c.status).toBe('needs_review')
    expect(alarmlar).toEqual(['PAYMENT_UNVERIFIED_LEGACY'])
    expect(satir.payment_debug).toEqual(DEFTER)
  })

  it('tekrar bildirimde stok onarımı deftere yalnız stok alanı yazar; raw ve paymentId değişmez', async () => {
    const kayit = { refunded_total: 0, paymentId: 'yeni-odeme', raw: { paymentId: 'yeni-odeme', ozgun: true }, stock_processed: false }
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid', payment_debug: kayit })
    iyziYanit = basarili
    await cagir(yeni, { orderId: SIPARIS })
    expect(satir.payment_debug).toMatchObject({ raw: { paymentId: 'yeni-odeme', ozgun: true }, stock_processed: true })
  })
})

describe('INV-ODEME-CALLBACK-3 · monotonluk: pending dışındaki HER durum bu uçtan değişmez', () => {
  for (const status of YASAM_ILERI) {
    for (const payment_status of ODEME_TUMU) {
      it(`${status}/${payment_status}: SUCCESS da FAILURE da satırı değiştirmez`, async () => {
        for (const yanit of [basarili, reddedildi]) {
          satir = yeniSatir({ status, payment_status })
          patchlar = []
          iyziYanit = yanit
          await cagir(yeni, { token: KURBAN_TOKEN, orderId: SIPARIS })
          await cagir(yeni, { token: SALDIRGAN_TOKEN, orderId: SIPARIS })
          expect(satir.status).toBe(status)
          expect(satir.payment_status).toBe(payment_status)
          expect(satir.payment_debug).toEqual(DEFTER)
        }
      })
    }
  }
})

describe('SABOTAJ · aynı saldırılar kapısı sökülmüş koda karşı GEÇER (test körlüğü kontrolü)', () => {
  it('kapısız kopya kuruldu (dört söküm de eşleşti)', () => {
    expect(eskiYuklenemedi).toBe('')
    expect(eski).not.toBeNull()
  })

  it('kapısız kodda: saldırganın token\'ı kurbanın ödenmiş siparişini failed yapar ve defteri siler', async () => {
    satir = yeniSatir({ status: 'confirmed', payment_status: 'paid' })
    iyziYanit = reddedildi
    await cagir(eski as Isleyici, { token: SALDIRGAN_TOKEN, orderId: SIPARIS })
    expect(satir.payment_status).toBe('failed')
    expect(satir.payment_debug).not.toHaveProperty('refunded_total')
  })

  it('kapısız kodda: teslim edilmiş sipariş confirmed\'a geri sarılır', async () => {
    satir = yeniSatir({ status: 'delivered', payment_status: 'paid' })
    iyziYanit = basarili
    await cagir(eski as Isleyici, { orderId: SIPARIS })
    expect(satir.status).toBe('confirmed')
  })
})
