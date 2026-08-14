import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import {
  attachDisplayPrices,
  type DisplayPriceInfo,
  fetchDisplayPrices,
  withDisplayPrices,
} from '../displayPrice.service'

// ── Yardımcılar ──────────────────────────────────────────────────────────────

/** Sahte RPC cevabı: senaryonun döndürdüğü HTTP durumu + gövde. */
interface RpcReply {
  status: number
  body: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/** İstek gövdesinden `p_product_ids`i cast'siz çıkarır (tip-guard zinciri). */
function readProductIds(body: unknown): string[] {
  if (typeof body !== 'string') return []
  const parsed: unknown = JSON.parse(body)
  if (!isRecord(parsed)) return []
  const ids = parsed.p_product_ids
  return isStringArray(ids) ? ids : []
}

/**
 * Cast'siz DI stub'ı (ev deseni): GERÇEK supabase-js client'ı, `get_display_prices`
 * RPC'sini taklit eden sahte fetch ile kurulur — rpc zinciri gerçekten çalışır.
 * `calls`, RPC'ye giden her POST'un ürün kimliklerini SIRAYLA toplar; parçalama
 * (chunk) davranışı böyle ölçülür. RPC dışı istekler kayda girmez.
 */
function stubClient(reply: (productIds: string[]) => RpcReply): {
  supabase: SupabaseClient<Database>
  calls: string[][]
} {
  const calls: string[][] = []
  const fakeFetch: typeof fetch = (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (!new URL(href).pathname.endsWith('/rpc/get_display_prices')) {
      return Promise.resolve(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }))
    }
    const productIds = readProductIds(init?.body)
    calls.push(productIds)
    const { status, body } = reply(productIds)
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
  const supabase = createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { supabase, calls }
}

/** Her istenen kimliği fiyatlayan varsayılan cevap. */
function priceAll(amount: number, taxIncluded: boolean) {
  return (productIds: string[]): RpcReply => ({
    status: 200,
    body: productIds.map(id => ({ product_id: id, display_price: amount, tax_included: taxIncluded })),
  })
}

// ── fetchDisplayPrices ───────────────────────────────────────────────────────

describe('fetchDisplayPrices', () => {
  it('fiyatı olmayan ürün haritada YER ALMAZ (yokluk ≠ sıfır fiyat)', async () => {
    const { supabase } = stubClient(() => ({
      status: 200,
      body: [{ product_id: 'p1', display_price: 1680, tax_included: true }],
    }))

    const prices = await fetchDisplayPrices(supabase, ['p1', 'p2'])

    expect(prices.get('p1')).toEqual({ amount: 1680, taxIncluded: true })
    expect(prices.has('p2')).toBe(false)
    expect(prices.size).toBe(1)
  })

  it('fiyatsız satır attachDisplayPrices ile null taşır → vitrin "Teklif Alın"', async () => {
    const { supabase } = stubClient(() => ({
      status: 200,
      body: [{ product_id: 'p1', display_price: 1680, tax_included: true }],
    }))

    const prices = await fetchDisplayPrices(supabase, ['p1', 'p2'])
    const rows = attachDisplayPrices([{ id: 'p1' }, { id: 'p2' }], prices)

    expect(rows[0]).toEqual({ id: 'p1', displayPrice: 1680, displayPriceTaxIncluded: true })
    expect(rows[1]).toEqual({ id: 'p2', displayPrice: null, displayPriceTaxIncluded: null })
  })

  it('sıfır/negatif/sayı-olmayan tutar fiyat SAYILMAZ (haritaya girmez)', async () => {
    const { supabase } = stubClient(() => ({
      status: 200,
      body: [
        { product_id: 'sifir', display_price: 0, tax_included: true },
        { product_id: 'negatif', display_price: -5, tax_included: true },
        { product_id: 'bos', display_price: null, tax_included: true },
        { product_id: 'gecerli', display_price: 1200, tax_included: true },
      ],
    }))

    const prices = await fetchDisplayPrices(supabase, ['sifir', 'negatif', 'bos', 'gecerli'])

    expect([...prices.keys()]).toEqual(['gecerli'])
  })

  it('200 üstü üründe RPC PARÇALANARAK çağrılır (200 + 50)', async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `p-${i}`)
    const { supabase, calls } = stubClient(priceAll(100, false))

    const prices = await fetchDisplayPrices(supabase, ids)

    expect(calls).toHaveLength(2)
    expect(calls[0]).toHaveLength(200)
    expect(calls[1]).toHaveLength(50)
    expect(calls[0][0]).toBe('p-0')
    expect(calls[1][49]).toBe('p-249')
    expect(prices.size).toBe(250)
  })

  it('mükerrer/boş kimlikler ayıklanır; kimlik yoksa RPC hiç çağrılmaz', async () => {
    const { supabase, calls } = stubClient(priceAll(100, false))

    expect((await fetchDisplayPrices(supabase, [])).size).toBe(0)
    expect((await fetchDisplayPrices(supabase, ['', ''])).size).toBe(0)
    expect(calls).toHaveLength(0)

    await fetchDisplayPrices(supabase, ['p1', 'p1', 'p2'])
    expect(calls).toEqual([['p1', 'p2']])
  })

  it('RPC hata dönerse PATLAMAZ, boş harita döner (sayfa düşmemeli)', async () => {
    const { supabase, calls } = stubClient(() => ({
      status: 403,
      body: { code: '42501', message: 'permission denied for function get_display_prices', details: null, hint: null },
    }))

    const prices = await fetchDisplayPrices(supabase, ['p1', 'p2'])

    expect(prices.size).toBe(0)
    expect(calls).toHaveLength(1)
  })

  it('parçalardan biri hata dönse bile diğer parçanın fiyatları korunur', async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `p-${i}`)
    const { supabase } = stubClient(productIds =>
      productIds.length === 200
        ? { status: 500, body: { code: 'XX000', message: 'boom', details: null, hint: null } }
        : { status: 200, body: productIds.map(id => ({ product_id: id, display_price: 100, tax_included: true })) },
    )

    const prices = await fetchDisplayPrices(supabase, ids)

    expect(prices.size).toBe(50)
    expect(prices.has('p-249')).toBe(true)
    expect(prices.has('p-0')).toBe(false)
  })

  it('taxIncluded satırdan birebir taşınır (bireysel BRÜT / bayi NET)', async () => {
    const { supabase } = stubClient(() => ({
      status: 200,
      body: [
        { product_id: 'bireysel', display_price: 1680, tax_included: true },
        { product_id: 'bayi', display_price: 1400, tax_included: false },
      ],
    }))

    const prices = await fetchDisplayPrices(supabase, ['bireysel', 'bayi'])

    expect(prices.get('bireysel')).toEqual({ amount: 1680, taxIncluded: true })
    expect(prices.get('bayi')).toEqual({ amount: 1400, taxIncluded: false })
  })
})

// ── attachDisplayPrices (saf) ────────────────────────────────────────────────

describe('attachDisplayPrices', () => {
  it('haritadaki fiyatı iliştirir, olmayanı null bırakır; satırın diğer alanları korunur', () => {
    const prices = new Map<string, DisplayPriceInfo>([['p1', { amount: 999, taxIncluded: false }]])

    const rows = attachDisplayPrices([{ id: 'p1', name: 'Fanlı' }, { id: 'p2', name: 'Fansız' }], prices)

    expect(rows).toEqual([
      { id: 'p1', name: 'Fanlı', displayPrice: 999, displayPriceTaxIncluded: false },
      { id: 'p2', name: 'Fansız', displayPrice: null, displayPriceTaxIncluded: null },
    ])
  })
})

// ── withDisplayPrices (kısayol) ──────────────────────────────────────────────

describe('withDisplayPrices', () => {
  it('satırları tek çağrıda fiyatlandırır', async () => {
    const { supabase, calls } = stubClient(priceAll(2400, true))

    const rows = await withDisplayPrices(supabase, [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }])

    expect(calls).toEqual([['p1', 'p2']])
    expect(rows).toEqual([
      { id: 'p1', name: 'A', displayPrice: 2400, displayPriceTaxIncluded: true },
      { id: 'p2', name: 'B', displayPrice: 2400, displayPriceTaxIncluded: true },
    ])
  })

  it('boş satır listesinde RPC hiç çağrılmaz', async () => {
    const { supabase, calls } = stubClient(priceAll(100, true))

    expect(await withDisplayPrices(supabase, [])).toEqual([])
    expect(calls).toHaveLength(0)
  })
})
