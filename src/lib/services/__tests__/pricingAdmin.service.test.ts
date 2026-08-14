import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import {
  coefficientToMarginPct,
  countProductsInScope,
  createPricingRule,
  marginPctToCoefficient,
  type ProductScopeRow,
  sampleProductsInScope,
  toPricingProductInput,
  updatePricingRule,
} from '../pricingAdmin.service'

// ── Cast'siz DI stub'ı ───────────────────────────────────────────────────────
// GERÇEK supabase-js client + PostgREST'i taklit eden sahte fetch: query-builder
// zincirleri gerçekten koşar, üretilen İSTEK (url + gövde) doğrulanabilir olur.
// Sahte client TİPİ uydurulmaz — çift-adımlı tip dönüşümü kullanılmaz.

interface CapturedRequest {
  method: string
  url: string
  body: unknown
  headers: Record<string, string>
}

interface StubResult {
  supabase: SupabaseClient<Database>
  calls: CapturedRequest[]
}

function stubClient(tables: Record<string, unknown[]>, totalCount = 0): StubResult {
  const calls: CapturedRequest[] = []

  const fakeFetch: typeof fetch = (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const method = init?.method ?? 'GET'
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    const rawBody = typeof init?.body === 'string' ? init.body : null
    calls.push({ method, url: href, body: rawBody ? JSON.parse(rawBody) : null, headers })

    const table = new URL(href).pathname.split('/').pop() ?? ''
    const rows = tables[table] ?? []
    const wantsSingleObject = (headers['accept'] ?? '').includes('pgrst.object')
    const payload = wantsSingleObject ? rows[0] ?? null : rows

    return Promise.resolve(
      new Response(method === 'HEAD' ? null : JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'content-range': `0-${Math.max(totalCount - 1, 0)}/${totalCount}`,
        },
      }),
    )
  }

  const supabase = createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { supabase, calls }
}

/** Cast'siz alan okuma: bilinmeyen gövdeden alan çeker. */
function readField(source: unknown, key: string): unknown {
  if (typeof source === 'object' && source !== null && key in source) {
    const record: Record<string, unknown> = { ...source }
    return record[key]
  }
  return undefined
}

const PRODUCT_ROW: ProductScopeRow = {
  id: 'p1',
  name: 'Vort Quadro Micro 100',
  sku: 'VQM-100',
  brand: 'Vortice',
  category_id: 'c1',
  cost_in_base: 1000,
}

// ── Saf çevriciler (float tuzağı dahil) ──────────────────────────────────────

describe('marj ↔ katsayı çevrimi', () => {
  it('katsayı ×1,4 → %40 TAM (float artığı yok)', () => {
    expect(coefficientToMarginPct(1.4)).toBe(40)
    expect(coefficientToMarginPct(1.4)).not.toBe(40.00000000000001)
  })

  it('%40 → ×1,4 ve gidiş-dönüş kararlı', () => {
    expect(marginPctToCoefficient(40)).toBe(1.4)
    expect(marginPctToCoefficient(coefficientToMarginPct(1.4))).toBe(1.4)
    expect(coefficientToMarginPct(marginPctToCoefficient(40))).toBe(40)
  })

  it('sınır değerler: ×1 → %0, ×2 → %100', () => {
    expect(coefficientToMarginPct(1)).toBe(0)
    expect(coefficientToMarginPct(2)).toBe(100)
    expect(marginPctToCoefficient(0)).toBe(1)
  })

  it('geçersiz girdi NaN döner (sessiz 0 yazmaz)', () => {
    expect(Number.isNaN(coefficientToMarginPct(Number.NaN))).toBe(true)
    expect(Number.isNaN(marginPctToCoefficient(Number.POSITIVE_INFINITY))).toBe(true)
  })
})

// ── Marka köprüsü (products.brand TEXT → brands.id) ──────────────────────────

describe('toPricingProductInput — marka köprüsü', () => {
  it('marka ADI brands.id ile eşlenir (köprü olmazsa marka kuralı sessizce eşleşmez)', () => {
    const map = new Map([['Vortice', 'brand-vortice']])
    const out = toPricingProductInput(PRODUCT_ROW, map)
    expect(out).toEqual({
      id: 'p1',
      brandId: 'brand-vortice',
      categoryId: 'c1',
      costInBase: 1000,
      name: 'Vort Quadro Micro 100',
      sku: 'VQM-100',
    })
  })

  it('bilinmeyen marka → brandId null (uydurma FK üretmez)', () => {
    const out = toPricingProductInput(PRODUCT_ROW, new Map())
    expect(out.brandId).toBeNull()
  })

  it('baştaki/sondaki boşluk toleransı', () => {
    const map = new Map([['Vortice', 'brand-vortice']])
    const out = toPricingProductInput({ ...PRODUCT_ROW, brand: ' Vortice ' }, map)
    expect(out.brandId).toBe('brand-vortice')
  })

  it('maliyetsiz ürün: costInBase null taşınır (cost_plus fiyatlayamaz sinyali)', () => {
    const out = toPricingProductInput({ ...PRODUCT_ROW, cost_in_base: null }, new Map())
    expect(out.costInBase).toBeNull()
  })
})

// ── Kapsam sorgularının ŞEKLİ ────────────────────────────────────────────────

describe('countProductsInScope', () => {
  it('scope 4 (global): yalnız aktif + silinmemiş ürünleri sayar', async () => {
    const { supabase, calls } = stubClient({ products: [] }, 348)
    const count = await countProductsInScope(supabase, 4, null)
    expect(count).toBe(348)
    const url = decodeURIComponent(calls[0].url)
    expect(url).toContain('deleted_at=is.null')
    expect(url).toContain('status=eq.active')
  })

  it('scope 2 (marka): önce brands adını çözer, sonra products.brand ile filtreler', async () => {
    const { supabase, calls } = stubClient({ brands: [{ id: 'b1', name: 'Vortice' }], products: [] }, 87)
    const count = await countProductsInScope(supabase, 2, 'b1')
    expect(count).toBe(87)
    expect(decodeURIComponent(calls[0].url)).toContain('id=eq.b1')
    expect(decodeURIComponent(calls[1].url)).toContain('brand=eq.Vortice')
  })

  it('scope 3 (kategori): ata-cascade karşılığı olarak alt kategorileri de kapsar', async () => {
    const { supabase, calls } = stubClient(
      {
        categories: [
          { id: 'c-parent', parent_id: null },
          { id: 'c-child', parent_id: 'c-parent' },
        ],
        products: [],
      },
      12,
    )
    const count = await countProductsInScope(supabase, 3, 'c-parent')
    expect(count).toBe(12)
    const productsUrl = decodeURIComponent(calls[calls.length - 1].url)
    expect(productsUrl).toContain('category_id=in.')
    expect(productsUrl).toContain('c-child')
  })

  it('hedef seçilmemiş ürün/marka/kategori kapsamı → 0 (sorgu bile atılmaz)', async () => {
    const { supabase, calls } = stubClient({ products: [] }, 999)
    expect(await countProductsInScope(supabase, 1, null)).toBe(0)
    expect(await countProductsInScope(supabase, 2, null)).toBe(0)
    expect(await countProductsInScope(supabase, 3, null)).toBe(0)
    expect(calls).toHaveLength(0)
  })
})

describe('sampleProductsInScope', () => {
  it('örnekleri fiyat motoru girdisine çevirir + limit uygular', async () => {
    const { supabase, calls } = stubClient({
      products: [PRODUCT_ROW],
      brands: [{ id: 'brand-vortice', name: 'Vortice' }],
    })
    const samples = await sampleProductsInScope(supabase, 4, null, 3)
    expect(samples).toHaveLength(1)
    expect(samples[0]).toMatchObject({ id: 'p1', sku: 'VQM-100', brandId: 'brand-vortice', costInBase: 1000 })
    const url = decodeURIComponent(calls[0].url)
    expect(url).toContain('limit=3')
    expect(url).toContain('cost_in_base')
  })
})

// ── Yazma payload disiplini ──────────────────────────────────────────────────

describe('createPricingRule / updatePricingRule payload disiplini', () => {
  it('INSERT: tenant_id GÖNDERİLMEZ (DB default jwt_tenant_id yazar)', async () => {
    const { supabase, calls } = stubClient({ pricing_rule: [{ id: 'r1' }] })
    await createPricingRule(supabase, {
      scope: 2,
      brand_id: 'b1',
      method: 'cost_plus',
      margin_pct: 40,
      priority: 10,
    })
    const insert = calls.find((c) => c.method === 'POST')
    expect(insert).toBeDefined()
    const body = insert?.body
    expect(Array.isArray(body) ? body[0] : body).toMatchObject({ scope: 2, brand_id: 'b1', margin_pct: 40 })
    expect(JSON.stringify(body)).not.toContain('tenant_id')
  })

  it('UPDATE: updated_at + updated_by ELLE basılır, tenant_id yine gönderilmez', async () => {
    const { supabase, calls } = stubClient({ pricing_rule: [{ id: 'r1' }] })
    await updatePricingRule(supabase, 'r1', { margin_pct: 45 }, 'user-42')
    const patch = calls.find((c) => c.method === 'PATCH')
    expect(patch).toBeDefined()
    const body = patch?.body
    expect(body).toMatchObject({ margin_pct: 45, updated_by: 'user-42' })
    expect(typeof readField(body, 'updated_at')).toBe('string')
    expect(JSON.stringify(body)).not.toContain('tenant_id')
    expect(decodeURIComponent(patch?.url ?? '')).toContain('id=eq.r1')
  })
})
