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
}

function stubClient(tables: StubTables, calls: CapturedWrite[]): SupabaseClient<Database> {
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
      const rows = lookup[table] ?? []
      return Promise.resolve(
        new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )
    }

    let body: unknown = null
    if (typeof init?.body === 'string') {
      try {
        body = JSON.parse(init.body)
      } catch {
        body = init.body
      }
    }
    calls.push({ method, table, url, body })
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
    expect(calls.filter(c => c.table === 'products')).toHaveLength(0)
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

    const updates = calls.filter(c => c.table === 'products')
    expect(updates).toHaveLength(1)
    expect(updates[0].body).toMatchObject({ cost_in_base: 350, purchase_rate_to_base: 35 })
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
    expect(calls.filter(c => c.table === 'products')).toHaveLength(0)
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
    expect(calls.filter(c => c.table === 'products')).toHaveLength(0)
  })
})
