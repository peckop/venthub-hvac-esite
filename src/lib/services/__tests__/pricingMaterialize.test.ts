import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import type { PricingRuleRow } from '../pricing.service'
import { DERIVED_VALID_FROM, materializePrices, refreshCostInBase } from '../pricingMaterialize.service'

// ── Yardımcılar (pricing.resolve.test.ts ALTIN ÖRNEĞİ'nin genişletilmişi) ────
//
// Cast'siz DI stub'ı: GERÇEK supabase-js client'ı, PostgREST cevaplarını taklit eden
// sahte fetch ile kurulur. GET → tablo verisini olduğu gibi döner (sunucu-tarafı
// filtre/sayfalama taklit edilmez — motorun TS filtresi zaten test edilir, burada
// materialize'ın DB'ye YAZDIĞI istekleri yakalamak asıl amaç). Yazma (POST/PATCH)
// istekleri `calls`'a kaydedilir → dryRun/upsert-gövdesi doğrulaması bunun üzerinden yapılır.

function rule(partial: Partial<PricingRuleRow>): PricingRuleRow {
  return {
    id: 'rule-default',
    tenant_id: 'tenant-1',
    price_book_id: null,
    scope: 4,
    product_id: null,
    brand_id: null,
    category_id: null,
    method: 'cost_plus',
    base: 'cost',
    margin_pct: 40,
    surcharge: 0,
    fixed_price: null,
    vat_rate_pct: 20,
    price_is_vat_inclusive: false,
    min_margin_abs: null,
    max_margin_abs: null,
    round_to: null,
    charm_ending: null,
    min_quantity: 1,
    priority: 0,
    is_exclusive: true,
    currency: null,
    valid_from: null,
    valid_to: null,
    created_at: '2026-08-13T00:00:00Z',
    updated_at: '2026-08-13T00:00:00Z',
    updated_by: null,
    ...partial,
  }
}

interface ProductFixtureRow {
  id: string
  name: string
  sku: string
  brand: string
  category_id: string | null
  cost_in_base: number | null
  purchase_price?: number
  purchase_currency?: string
  purchase_rate_to_base?: number | null
}

interface StubTables {
  pricing_rule?: PricingRuleRow[]
  categories?: { id: string; parent_id: string | null }[]
  price_lists?: { id: string; user_type: string | null }[]
  brands?: { id: string; name: string }[]
  products?: ProductFixtureRow[]
  currency_rates?: { rate: number; effective_date: string }[]
  /** Mevcut cache fotoğrafı — elle-ezme koruması ve bayat-satır tasfiyesi bunun üstünden test edilir. */
  product_prices?: {
    id: string
    product_id: string
    price_list_id: string
    currency: string
    is_derived: boolean
    is_active: boolean
  }[]
}

interface CapturedWrite {
  method: string
  table: string
  url: URL
  body: unknown
  /** İstek başlıkları (küçük harf) — fiyat günlüğü yöntem başlığı doğrulaması için. */
  headers: Record<string, string>
}

interface StubSecenekleri {
  /** `maliyet_yenile` RPC'si sunucu hatası (PostgREST 400 + hata gövdesi) döner — atomik-hata yolu testi. */
  rpcHatasi?: boolean
}

function stubClient(
  tables: StubTables,
  calls: CapturedWrite[],
  gets?: URL[],
  secenek?: StubSecenekleri,
): SupabaseClient<Database> {
  const lookup: Record<string, unknown[] | undefined> = {
    pricing_rule: tables.pricing_rule,
    categories: tables.categories,
    price_lists: tables.price_lists,
    brands: tables.brands,
    products: tables.products,
    currency_rates: tables.currency_rates,
    product_prices: tables.product_prices,
  }
  const fakeFetch: typeof fetch = (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const url = new URL(href)
    const table = url.pathname.split('/').pop() ?? ''
    const method = (init?.method ?? 'GET').toUpperCase()

    if (method === 'GET') {
      gets?.push(url)
      const tumu = lookup[table] ?? []

      // ⛔SAHTE SUNUCU `Range` VE `Content-Range`i TAŞIMALI (INV-TAVAN-1, 2026-09-07).
      //
      // Eskiden bu dal, istenen aralığı YOK SAYIP tabloyu olduğu gibi döndürüyor ve
      // `Content-Range` başlığını HİÇ basmıyordu. İkisi de gerçek PostgREST'ten sapma:
      //  · `count: 'exact'` istendiğinde kesin toplam **Content-Range başlığında** gelir;
      //    başlık yoksa supabase-js `count` alanını `null` bırakır.
      //  · `range()` istendiğinde sunucu SADECE o dilimi döner.
      // Sapmanın bedeli ölçüldü: sayfalı çekim kapısı eklendiğinde bu paket CI'da
      // düştü — kod doğruydu, YALANCI OLAN STUB'DI. Bir stub gerçeği taklit etmiyorsa,
      // üstünde koşan test neyi ölçtüğünü bilmiyor demektir.
      // ⚠postgrest-js `range()` aralığı `offset`/`limit` SORGU PARAMETRESİYLE yollar (2.116.0'da ölçüldü; `Range`
      // başlığı yolu yalnız eski sürümlerde). Yalnız başlığa bakan stub, 100+ satırlı bir tabloda sonsuz döngüye
      // girer: her sayfa TÜM tabloyu döner, "kısa sayfa" hiç gelmez, işçi belleği doldurup düşer.
      const araligi = /(\d+)-(\d+)/.exec(init?.headers ? String(new Headers(init.headers).get('Range') ?? '') : '')
      const offsetParam = url.searchParams.get('offset')
      const limitParam = url.searchParams.get('limit')
      const bas = offsetParam !== null ? Number(offsetParam) : araligi ? Number(araligi[1]) : 0
      const son =
        limitParam !== null ? bas + Number(limitParam) - 1 : araligi ? Number(araligi[2]) : tumu.length - 1
      const rows = araligi || offsetParam !== null || limitParam !== null ? tumu.slice(bas, son + 1) : tumu

      const basliklar: Record<string, string> = { 'Content-Type': 'application/json' }
      const prefer = init?.headers ? String(new Headers(init.headers).get('Prefer') ?? '') : ''
      if (prefer.includes('count=exact')) {
        basliklar['Content-Range'] =
          rows.length > 0 ? `${bas}-${bas + rows.length - 1}/${tumu.length}` : `*/${tumu.length}`
      }
      return Promise.resolve(new Response(JSON.stringify(rows), { status: 200, headers: basliklar }))
    }

    let body: unknown = null
    if (typeof init?.body === 'string') {
      try {
        body = JSON.parse(init.body)
      } catch {
        body = init.body
      }
    }
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    calls.push({ method, table, url, body, headers })
    if (secenek?.rpcHatasi && table === 'maliyet_yenile') {
      return Promise.resolve(
        new Response(JSON.stringify({ code: '22023', message: 'maliyet_yenile: eksik/gecersiz eleman', details: null, hint: null }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
    const echo = Array.isArray(body) ? body : body != null ? [body] : []
    return Promise.resolve(
      new Response(JSON.stringify(echo), { status: 201, headers: { 'Content-Type': 'application/json' } }),
    )
  }
  return createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const INDIVIDUAL_LIST = { id: 'pl-individual', user_type: 'individual' }
const DEALER_LIST = { id: 'pl-dealer', user_type: 'dealer' }

// ── materializePrices ─────────────────────────────────────────────────────────

describe('materializePrices', () => {
  it('dryRun (varsayılan) hiçbir yazma isteği üretmez', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-40' })],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
      },
      calls,
    )

    const summary = await materializePrices(supabase)

    expect(summary.dryRun).toBe(true)
    expect(summary.pricedProducts).toBe(1)
    expect(summary.rowsUpserted).toBe(1) // sayım hesaplanır — sadece GERÇEK yazma yapılmaz
    expect(calls.filter(c => c.table === 'product_prices')).toHaveLength(0)
  })

  it('fiyatlanamayan ürün için satır yazılmaz + quoteOnly artar', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-cost-plus' })], // yalnız cost_plus — maliyetsiz ürünü fiyatlayamaz
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 },
          { id: 'p2', name: 'Fan B', sku: 'SKU-2', brand: 'Vortice', category_id: null, cost_in_base: null },
        ],
      },
      calls,
    )

    const summary = await materializePrices(supabase, { dryRun: false })

    expect(summary.pricedProducts).toBe(1)
    expect(summary.quoteOnlyProducts).toBe(1)
    expect(summary.bySegment[0]).toMatchObject({ priced: 1, quoteOnly: 1 })

    const upserts = calls.filter(c => c.table === 'product_prices')
    expect(upserts).toHaveLength(1)
    const rows = upserts[0].body as { product_id: string }[]
    expect(rows.map(r => r.product_id)).toEqual(['p1'])
  })

  it('marka köprüsü sayesinde scope=2 (marka) kuralı eşleşir', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [
          rule({ id: 'global-10', scope: 4, margin_pct: 10 }),
          rule({ id: 'brand-25', scope: 2, brand_id: 'brand-uuid-1', margin_pct: 25 }),
        ],
        price_lists: [INDIVIDUAL_LIST],
        brands: [{ id: 'brand-uuid-1', name: 'Vortice' }],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
      },
      calls,
    )

    const summary = await materializePrices(supabase, { dryRun: false })

    // Köprü çalışmasaydı brand_id hiç eşleşmez, global-10 kazanırdı (net 1100).
    expect(summary.samples[0]?.ruleId).toBe('brand-25')
    expect(summary.samples[0]?.net).toBe(1250)
  })

  it('upsert gövdesi doğru alanları + DERIVED_VALID_FROM sentinelini taşır', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-40', margin_pct: 40 })],
        price_lists: [INDIVIDUAL_LIST, DEALER_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
      },
      calls,
    )

    await materializePrices(supabase, { dryRun: false })

    const upserts = calls.filter(c => c.table === 'product_prices')
    expect(upserts).toHaveLength(1) // tek toplu upsert (buffer < 500)
    // Cetvel §8.1: tekil anahtar para birimini İÇERİR (aynı ürünün TRY/EUR satırı yan yana durabilsin).
    expect(upserts[0].url.searchParams.get('on_conflict')).toBe(
      'product_id,price_list_id,currency,valid_from',
    )

    const rows = upserts[0].body as Record<string, unknown>[]
    expect(rows).toHaveLength(2) // individual + dealer

    const individualRow = rows.find(r => r.price_list_id === 'pl-individual')
    const dealerRow = rows.find(r => r.price_list_id === 'pl-dealer')

    expect(individualRow).toMatchObject({
      product_id: 'p1',
      currency: 'TRY',
      net_price: 1400,
      gross_price: 1680,
      is_derived: true,
      is_active: true,
      valid_from: DERIVED_VALID_FROM,
      base_price: 1680, // individual → gross
    })
    expect(dealerRow).toMatchObject({
      product_id: 'p1',
      net_price: 1400,
      gross_price: 1680,
      valid_from: DERIVED_VALID_FROM,
      base_price: 1400, // dealer → net
    })
    expect(rows.every(r => !('tenant_id' in r))).toBe(true) // tenant_id asla gönderilmez
  })

  it('elle ezilmiş satırı (is_derived=false) EZMEZ — fiyat dondurmanın taşıyıcısı odur', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-40' })],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
        product_prices: [
          {
            id: 'pp-manual',
            product_id: 'p1',
            price_list_id: INDIVIDUAL_LIST.id,
            currency: 'TRY',
            is_derived: false, // admin elle sabitlemiş
            is_active: true,
          },
        ],
      },
      calls,
    )

    const summary = await materializePrices(supabase, { dryRun: false })

    expect(summary.skippedManual).toBe(1)
    expect(summary.rowsUpserted).toBe(0)
    // Elle ezilmiş satır ne güncellenir ne pasifleştirilir.
    expect(calls.filter(c => c.table === 'product_prices')).toHaveLength(0)
    expect(summary.deactivated).toBe(0)
  })

  it('fiyat günlüğü: upsert VE bayat pasifleştirme yeniden_hesap + AYNI uuid oturumunu taşır (INV-FIYAT-GUNLUGU-1)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-10', scope: 4, margin_pct: 10 })],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
        // Bu koşuda üretilmeyen türetilmiş satır → pasifleştirilir (ikinci istek türü).
        product_prices: [
          { id: 'pp-stale', product_id: 'p-eski', price_list_id: INDIVIDUAL_LIST.id, currency: 'TRY', is_derived: true, is_active: true },
        ],
      },
      calls,
    )

    await materializePrices(supabase, { dryRun: false })

    const upsert = calls.find(c => c.table === 'product_prices' && c.method === 'POST')
    const patch = calls.find(c => c.table === 'product_prices' && c.method === 'PATCH')
    expect(upsert, 'upsert isteği yok').toBeDefined()
    expect(patch, 'pasifleştirme isteği yok').toBeDefined()
    for (const c of [upsert, patch]) {
      expect(c?.headers['x-degisiklik-yontemi']).toBe('yeniden_hesap')
    }
    const oturum = upsert?.headers['x-degisiklik-oturumu'] ?? ''
    // Tetik yalnız uuid biçimini kabul eder (aksi hâlde oturum bilgisi sessizce atılır).
    expect(oturum).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(patch?.headers['x-degisiklik-oturumu']).toBe(oturum)
  })

  it('fiyat günlüğü: dryRun HİÇBİR yazma isteği atmaz', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-10', scope: 4, margin_pct: 10 })],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
      },
      calls,
    )
    await materializePrices(supabase, { dryRun: true })
    expect(calls).toEqual([])
  })

  it('bu koşuda üretilmeyen bayat türetilmiş satırı pasifleştirir', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        // Kural yok → hiçbir ürün fiyatlanamaz; cache'teki eski satır bayat kalır.
        pricing_rule: [],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
        product_prices: [
          {
            id: 'pp-stale',
            product_id: 'p1',
            price_list_id: INDIVIDUAL_LIST.id,
            currency: 'TRY',
            is_derived: true,
            is_active: true,
          },
        ],
      },
      calls,
    )

    const summary = await materializePrices(supabase, { dryRun: false })

    expect(summary.quoteOnlyProducts).toBe(1)
    expect(summary.deactivated).toBe(1)
    const patches = calls.filter(c => c.table === 'product_prices' && c.method === 'PATCH')
    expect(patches).toHaveLength(1)
    expect(patches[0].body).toMatchObject({ is_active: false })
    expect(patches[0].url.searchParams.get('id')).toBe('in.(pp-stale)')
  })

  it('mevcut cache fotoğrafını SAYFALAYARAK okur (1000 satır tavanına takılmaz)', async () => {
    // 348 ürün × 3 segment = 1044 satır yazan bir iş, cache'i tek sayfada okuyamaz:
    // PostgREST satır tavanı (varsayılan 1000) sessizce kırpardı ve elle-ezme koruması
    // ile bayat tasfiyesi FARKINDA OLMADAN yanlış çalışırdı.
    const calls: CapturedWrite[] = []
    const gets: URL[] = []
    const supabase = stubClient(
      {
        pricing_rule: [rule({ id: 'global-40' })],
        price_lists: [INDIVIDUAL_LIST],
        brands: [],
        products: [{ id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 1000 }],
      },
      calls,
      gets,
    )

    await materializePrices(supabase)

    const snapshotGets = gets.filter(u => u.pathname.endsWith('/product_prices'))
    expect(snapshotGets.length).toBeGreaterThan(0)
    // Sıralama şart: order olmadan hangi satırların düştüğü belirsiz olurdu.
    expect(snapshotGets[0].searchParams.get('order')).toBe('id.asc')
    expect(snapshotGets[0].searchParams.get('valid_from')).toBe(`eq.${DERIVED_VALID_FROM}`)
  })
})

// ── refreshCostInBase ────────────────────────────────────────────────────────

describe('refreshCostInBase', () => {
  it('kuru olmayan para biriminde ürünü atlar (skippedNoRate)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: null, purchase_price: 100, purchase_currency: 'USD', purchase_rate_to_base: null },
        ],
        currency_rates: [], // USD için kur yok
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.scanned).toBe(1)
    expect(summary.skippedNoRate).toBe(1)
    expect(summary.updated).toBe(0)
    expect(calls).toHaveLength(0) // yazılacak satır yoksa RPC de ÇAĞRILMAZ
  })

  it('purchase_price <= 0 olan ürünü atlar (skippedNoPurchasePrice)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: null, purchase_price: 0, purchase_currency: 'EUR', purchase_rate_to_base: null },
        ],
        currency_rates: [{ rate: 35, effective_date: '2026-08-13' }],
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.scanned).toBe(1)
    expect(summary.skippedNoPurchasePrice).toBe(1)
    expect(summary.updated).toBe(0)
  })

  it('EUR kuruyla cost_in_base hesaplar ve DEĞİŞTİYSE günceller (dryRun:false)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: null, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: null },
        ],
        currency_rates: [{ rate: 35, effective_date: '2026-08-13' }],
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.updated).toBe(1)
    expect(summary.ratesUsed).toEqual([{ currency: 'EUR', rate: 35, effectiveDate: '2026-08-13' }])

    // Yazım TEK atomik RPC'dir (karar 186); ürün başına PATCH YOK.
    expect(calls.filter(c => c.table === 'products')).toHaveLength(0)
    const rpcCalls = calls.filter(c => c.table === 'maliyet_yenile')
    expect(rpcCalls).toHaveLength(1)
    expect(rpcCalls[0].method).toBe('POST')
    // Maliyetin HESAPLANDIĞI alış fiyatı da gider: okuma ile yazma arasında fiyat değişirse RPC satırı yazmaz ve
    // tüm partiyi geri alır (eski fiyattan üretilmiş maliyet canlıya geçmesin).
    expect(rpcCalls[0].body).toEqual({
      p_satirlar: [
        { id: 'p1', cost_in_base: 350, purchase_rate_to_base: 35, purchase_price: 10, purchase_currency: 'EUR' },
      ],
    })
    // Günlük etiketi: yöntem + koşu kimliği (uuid) istek başlığıyla gider.
    expect(rpcCalls[0].headers['x-degisiklik-yontemi']).toBe('maliyet_yenileme')
    expect(rpcCalls[0].headers['x-degisiklik-oturumu']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('348 ürün değişse de TEK istek atar (parti özeti sözleşmesi: ayrı PATCH sağanağı yok)', async () => {
    const calls: CapturedWrite[] = []
    const urunler: ProductFixtureRow[] = Array.from({ length: 348 }, (_, i) => ({
      id: `p${i}`, name: `Fan ${i}`, sku: `SKU-${i}`, brand: 'Vortice', category_id: null,
      cost_in_base: null, purchase_price: 10 + i, purchase_currency: 'EUR', purchase_rate_to_base: null,
    }))
    const supabase = stubClient({ products: urunler, currency_rates: [{ rate: 35, effective_date: '2026-08-13' }] }, calls)

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.updated).toBe(348)
    expect(calls).toHaveLength(1)
    expect(calls[0].table).toBe('maliyet_yenile')
    expect((calls[0].body as { p_satirlar: unknown[] }).p_satirlar).toHaveLength(348)
  })

  it('RPC hata dönerse fırlatır (yarım yenileme yok: sunucu tüm partiyi geri alır)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: null, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: null },
        ],
        currency_rates: [{ rate: 35, effective_date: '2026-08-13' }],
      },
      calls,
      undefined,
      { rpcHatasi: true },
    )

    await expect(refreshCostInBase(supabase, { dryRun: false })).rejects.toMatchObject({ code: '22023' })
    expect(calls.filter(c => c.table === 'products')).toHaveLength(0)
  })

  it('fazla ondalıklı kur sütun duyarlığına (6) yuvarlanır: aynı kur ikinci koşuda "değişmedi" sayılır', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          // DB'de numeric(18,6) olarak saklanmış kur: 35.123457. Kaynak kur 35.1234567 (7 ondalık).
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 351.2346, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: 35.123457 },
        ],
        currency_rates: [{ rate: 35.1234567, effective_date: '2026-08-13' }],
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.updated).toBe(0)
    expect(calls).toHaveLength(0)
  })

  it('parti sınırını (5000) aşarsa BÖLMEDEN durur ve hiçbir yazma isteği atmaz', async () => {
    const calls: CapturedWrite[] = []
    const urunler: ProductFixtureRow[] = Array.from({ length: 5001 }, (_, i) => ({
      id: `p${i}`, name: `Fan ${i}`, sku: `SKU-${i}`, brand: 'Vortice', category_id: null,
      cost_in_base: null, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: null,
    }))
    const supabase = stubClient({ products: urunler, currency_rates: [{ rate: 35, effective_date: '2026-08-13' }] }, calls)

    await expect(refreshCostInBase(supabase, { dryRun: false })).rejects.toThrow(/sınır 5000/)
    expect(calls).toHaveLength(0)
  })

  it('dryRun (varsayılan) hiçbir yazma isteği üretmez ama sayımları döner', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: null, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: null },
        ],
        currency_rates: [{ rate: 35, effective_date: '2026-08-13' }],
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase)

    expect(summary.updated).toBe(1) // hesap yapılır, sadece YAZILMAZ
    expect(calls).toHaveLength(0)
  })

  it('değeri zaten aynı olan satırı "updated" saymaz (gereksiz yazma yok)', async () => {
    const calls: CapturedWrite[] = []
    const supabase = stubClient(
      {
        products: [
          { id: 'p1', name: 'Fan A', sku: 'SKU-1', brand: 'Vortice', category_id: null, cost_in_base: 350, purchase_price: 10, purchase_currency: 'EUR', purchase_rate_to_base: 35 },
        ],
        currency_rates: [{ rate: 35, effective_date: '2026-08-13' }],
      },
      calls,
    )

    const summary = await refreshCostInBase(supabase, { dryRun: false })

    expect(summary.updated).toBe(0)
    expect(calls).toHaveLength(0)
  })
})
