import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import {
  computePriceFromRule,
  getUserPriceSegment,
  type PricingRuleRow,
  resolvePrice,
  ruleMatchesProduct,
  sortRules,
} from '../pricing.service'

// ── Yardımcılar ──────────────────────────────────────────────────────────────

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

interface StubTables {
  pricing_rule?: PricingRuleRow[]
  categories?: { id: string; parent_id: string | null }[]
  currency_rates?: { rate: number; effective_date: string }[]
}

/**
 * Cast'siz DI stub'ı: GERÇEK supabase-js client'ı, PostgREST cevaplarını taklit eden
 * sahte fetch ile kurulur — query-builder zincirleri gerçekten çalışır.
 * (Sunucu-tarafı filtre taklit edilmez; resolvePrice kural filtresini TS'te yapar.)
 */
function stubClient(tables: StubTables): SupabaseClient<Database> {
  const lookup: Record<string, unknown[] | undefined> = {
    pricing_rule: tables.pricing_rule,
    categories: tables.categories,
    currency_rates: tables.currency_rates,
  }
  const fakeFetch: typeof fetch = (input) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const table = new URL(href).pathname.split('/').pop() ?? ''
    const rows = lookup[table] ?? []
    return Promise.resolve(
      new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
  return createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const PRODUCT = { id: 'p1', brandId: 'b1', categoryId: 'c-child', costInBase: 1000 }

// ── getUserPriceSegment (W2 tek sözleşme: segment kaynağı app_metadata) ──────

describe('getUserPriceSegment', () => {
  it('app_metadata.price_segment=dealer/corporate aynen döner', () => {
    expect(getUserPriceSegment({ app_metadata: { price_segment: 'dealer' } })).toBe('dealer')
    expect(getUserPriceSegment({ app_metadata: { price_segment: 'corporate' } })).toBe('corporate')
  })

  it('claim yok / geçersiz / anonim → güvenli varsayılan individual', () => {
    expect(getUserPriceSegment({ app_metadata: {} })).toBe('individual')
    expect(getUserPriceSegment({ app_metadata: { price_segment: 'admin' } })).toBe('individual')
    expect(getUserPriceSegment(null)).toBe('individual')
    expect(getUserPriceSegment(undefined)).toBe('individual')
  })
})

// ── computePriceFromRule (saf hesap) ─────────────────────────────────────────

describe('computePriceFromRule', () => {
  it('cost_plus %40: 1.000 TL maliyet → net 1.400 / brüt 1.680 (KDV %20)', () => {
    const out = computePriceFromRule(rule({ margin_pct: 40 }), 1000, [])
    expect(out).toEqual({ net: 1400, gross: 1680 })
  })

  it('katsayı ×2 = margin_pct 100: 1.000 TL alış → net 2.000 (katsayı çevrimi)', () => {
    const out = computePriceFromRule(rule({ margin_pct: 100 }), 1000, [])
    expect(out?.net).toBe(2000)
    expect(out?.gross).toBe(2400)
  })

  it('fixed KDV-dahil: 1.200 TL dahil → net 1.000 saklanır', () => {
    const out = computePriceFromRule(
      rule({ method: 'fixed', fixed_price: 1200, price_is_vat_inclusive: true, margin_pct: null }),
      1000,
      [],
    )
    expect(out?.net).toBe(1000)
    expect(out?.gross).toBe(1200)
  })

  it('fixed +KDV: 1.000 TL hariç → brüt 1.200 (maliyetsiz üründe de çalışır)', () => {
    const out = computePriceFromRule(
      rule({ method: 'fixed', fixed_price: 1000, price_is_vat_inclusive: false, margin_pct: null }),
      null,
      [],
    )
    expect(out).toEqual({ net: 1000, gross: 1200 })
  })

  it('min marj kelepçesi: %5 marj 100 TL altında kalırsa 100 TL\'ye çekilir', () => {
    const trace: string[] = []
    const out = computePriceFromRule(rule({ margin_pct: 5, min_margin_abs: 100 }), 1000, trace)
    expect(out?.net).toBe(1100)
    expect(trace.some(t => t.includes('min marj'))).toBe(true)
  })

  it('charm ,90: brüt 1.680 → 1.679,90 (yukarı taşmaz)', () => {
    const out = computePriceFromRule(rule({ margin_pct: 40, charm_ending: 0.9 }), 1000, [])
    expect(out?.gross).toBe(1679.9)
    expect(out?.net).toBeCloseTo(1399.9167, 3)
  })

  it('cost_plus maliyetsiz ürünü fiyatlayamaz (null)', () => {
    expect(computePriceFromRule(rule({}), null, [])).toBeNull()
  })

  it('percent_off_list W1 kapsamı dışı (null + trace notu)', () => {
    const trace: string[] = []
    expect(computePriceFromRule(rule({ method: 'percent_off_list' }), 1000, trace)).toBeNull()
    expect(trace.some(t => t.includes('kapsamı dışı'))).toBe(true)
  })
})

// ── ruleMatchesProduct / sortRules (merdiven) ────────────────────────────────

describe('ruleMatchesProduct', () => {
  const ancestors = new Set(['c-child', 'c-parent'])

  it('scope 1 ürün: product_id eşleşmesi', () => {
    expect(ruleMatchesProduct(rule({ scope: 1, product_id: 'p1' }), PRODUCT, ancestors)).toBe(true)
    expect(ruleMatchesProduct(rule({ scope: 1, product_id: 'p2' }), PRODUCT, ancestors)).toBe(false)
  })

  it('scope 2 marka + scope 3 kategori (ata-cascade) + scope 4 global', () => {
    expect(ruleMatchesProduct(rule({ scope: 2, brand_id: 'b1' }), PRODUCT, ancestors)).toBe(true)
    expect(ruleMatchesProduct(rule({ scope: 3, category_id: 'c-parent' }), PRODUCT, ancestors)).toBe(true)
    expect(ruleMatchesProduct(rule({ scope: 3, category_id: 'c-other' }), PRODUCT, ancestors)).toBe(false)
    expect(ruleMatchesProduct(rule({ scope: 4 }), PRODUCT, ancestors)).toBe(true)
  })
})

describe('sortRules', () => {
  it('en-özel-kazanır: ürün(1) < marka(2) < global(4)', () => {
    const sorted = sortRules(
      [rule({ id: 'g', scope: 4 }), rule({ id: 'u', scope: 1 }), rule({ id: 'm', scope: 2 })],
      null,
    )
    expect(sorted.map(r => r.id)).toEqual(['u', 'm', 'g'])
  })

  it('aynı scope: yüksek priority önce', () => {
    const sorted = sortRules([rule({ id: 'a', priority: 0 }), rule({ id: 'b', priority: 10 })], null)
    expect(sorted[0].id).toBe('b')
  })
})

// ── resolvePrice (uçtan uca, sahte-fetch DI client) ──────────────────────────

describe('resolvePrice', () => {
  it('global %40 kuralı: 1.000 TL maliyet → net 1.400 / brüt 1.680 + trace', async () => {
    const supabase = stubClient({ pricing_rule: [rule({ id: 'global-40' })] })
    const { price, trace } = await resolvePrice(supabase, PRODUCT)
    expect(price).toMatchObject({ net: 1400, gross: 1680, currency: 'TRY', ruleId: 'global-40', ruleScope: 4 })
    expect(trace.some(t => t.includes('KAZANAN'))).toBe(true)
  })

  it('ürün kuralı globali yener (stop-at-first-hit)', async () => {
    const supabase = stubClient({
      pricing_rule: [
        rule({ id: 'global-40', scope: 4, margin_pct: 40 }),
        rule({ id: 'urun-60', scope: 1, product_id: 'p1', margin_pct: 60 }),
      ],
    })
    const { price } = await resolvePrice(supabase, PRODUCT)
    expect(price?.ruleId).toBe('urun-60')
    expect(price?.net).toBe(1600)
  })

  it('maliyetsiz ürün + yalnız cost_plus kuralı → Teklif Alın (null)', async () => {
    const supabase = stubClient({ pricing_rule: [rule({})] })
    const { price, trace } = await resolvePrice(supabase, { ...PRODUCT, costInBase: null })
    expect(price).toBeNull()
    expect(trace.some(t => t.includes('Teklif Alın'))).toBe(true)
  })

  it('kural havuzu boş → Teklif Alın (null)', async () => {
    const { price } = await resolvePrice(stubClient({}), PRODUCT)
    expect(price).toBeNull()
  })

  it('EUR gösterimi: en güncel kurla böler', async () => {
    const supabase = stubClient({
      pricing_rule: [rule({})],
      currency_rates: [{ rate: 55.157, effective_date: '2026-08-13' }],
    })
    const { price } = await resolvePrice(supabase, PRODUCT, { currency: 'EUR', today: '2026-08-13' })
    expect(price?.currency).toBe('EUR')
    expect(price?.net).toBeCloseTo(1400 / 55.157, 3)
    expect(price?.gross).toBeCloseTo(1680 / 55.157, 2)
  })

  it('EUR istendi ama kur yok → Teklif Alın (null)', async () => {
    const supabase = stubClient({ pricing_rule: [rule({})] })
    const { price, trace } = await resolvePrice(supabase, PRODUCT, { currency: 'EUR' })
    expect(price).toBeNull()
    expect(trace.some(t => t.includes('kuru yok'))).toBe(true)
  })

  it('geçerlilik penceresi: süresi dolan kural elenir', async () => {
    const supabase = stubClient({ pricing_rule: [rule({ valid_to: '2026-01-01' })] })
    const { price } = await resolvePrice(supabase, PRODUCT, { today: '2026-08-13' })
    expect(price).toBeNull()
  })

  it('min_quantity: toptan kural tek adette devreye girmez, 10 adette girer', async () => {
    const supabase = stubClient({
      pricing_rule: [
        rule({ id: 'toptan', margin_pct: 20, min_quantity: 10 }),
        rule({ id: 'perakende', margin_pct: 40, min_quantity: 1 }),
      ],
    })
    const single = await resolvePrice(supabase, PRODUCT, { quantity: 1 })
    const bulk = await resolvePrice(supabase, PRODUCT, { quantity: 10 })
    expect(single.price?.ruleId).toBe('perakende')
    expect(bulk.price?.ruleId).toBe('toptan')
  })

  it('kategori ata-cascade: üst kategori kuralı alt kategorideki ürünü fiyatlar', async () => {
    const supabase = stubClient({
      pricing_rule: [rule({ id: 'kat-ust', scope: 3, category_id: 'c-parent', margin_pct: 50 })],
      categories: [
        { id: 'c-parent', parent_id: null },
        { id: 'c-child', parent_id: 'c-parent' },
      ],
    })
    const { price } = await resolvePrice(supabase, PRODUCT)
    expect(price?.ruleId).toBe('kat-ust')
    expect(price?.net).toBe(1500)
  })
})
