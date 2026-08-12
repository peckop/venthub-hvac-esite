import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// PS-042: cache tag izolasyonu testleri.
// next/cache mock'lanır (gerçek Next.js cache runtime'ı test ortamında yok);
// yalnız revalidateTag/revalidatePath çağrılarının HANGİ tag'lerle yapıldığını doğrularız.
const revalidateTagMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}))

// Route içinde products/inventory_movements dallarında categories/products tablolarına
// ek Supabase sorguları yapılıyor (category_id/product_id set edilmişse). Test senaryolarımız
// bu alanları payload'da vermediği için chain hiç çağrılmaz, ama import zinciri kırılmasın diye
// yine de basit bir chainable mock sağlıyoruz.
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

const WEBHOOK_SECRET = 'test-webhook-secret-mock'

function buildRequest(payload: unknown): NextRequest {
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  })
}

describe('POST /api/webhook/supabase — PS-042 cache tag izolasyonu', () => {
  const originalSecret = process.env.SUPABASE_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_WEBHOOK_SECRET', WEBHOOK_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalSecret === undefined) {
      delete process.env.SUPABASE_WEBHOOK_SECRET
    } else {
      process.env.SUPABASE_WEBHOOK_SECRET = originalSecret
    }
  })

  it('(a) inventory_movements → yalnız variant-stock tag invalide edilir, keşif tag\'i (home-data/products-discovery) ÇAĞRILMAZ', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'INSERT',
      table: 'inventory_movements',
      schema: 'public',
      record: {
        id: 'mv-1',
        product_id: undefined,
        tenant_id: 'tenant-1',
      },
      old_record: null,
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).toHaveBeenCalledWith('variant-stock')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('home-data')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('home-data-tenant-1')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('products-discovery-tenant-1')
    expect(json.revalidatedTags).toEqual(['variant-stock'])
  })

  it('(b) products status değişimi (old_record var) → keşif tag\'leri çağrılır', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'products',
      schema: 'public',
      record: {
        id: 'p-1',
        slug: 'test-product',
        status: 'active',
        tenant_id: 'tenant-1',
      },
      old_record: {
        id: 'p-1',
        slug: 'test-product',
        status: 'draft',
        tenant_id: 'tenant-1',
      },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).toHaveBeenCalledWith('home-data')
    expect(json.discoveryComparisonSkipped).toBe(false)
  })

  it('(c) products yalnız stock_qty değişimi (old_record var) → keşif tag\'leri çağrılmaz', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'products',
      schema: 'public',
      record: {
        id: 'p-1',
        slug: 'test-product',
        status: 'active',
        stock_qty: 5,
        tenant_id: 'tenant-1',
      },
      old_record: {
        id: 'p-1',
        slug: 'test-product',
        status: 'active',
        stock_qty: 10,
        tenant_id: 'tenant-1',
      },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).not.toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('home-data')
    // Tenant-scoped keşif tag'leri de AYNI kapıya tabidir — stok-only UPDATE
    // tenant tag'i üzerinden de home cache'i thrash edemez (ana sayfa iki tag'i birden taşır).
    expect(revalidateTagMock).not.toHaveBeenCalledWith('home-data-tenant-1')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('products-discovery-tenant-1')
    expect(json.discoveryComparisonSkipped).toBe(false)
  })

  it('products UPDATE\'te old_record yoksa (karşılaştırma yapılamaz) → mevcut davranış korunur (her zaman tetikle) ve discoveryComparisonSkipped=true raporlanır', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'products',
      schema: 'public',
      record: {
        id: 'p-1',
        slug: 'test-product',
        status: 'active',
        tenant_id: 'tenant-1',
      },
      old_record: null,
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).toHaveBeenCalledWith('home-data')
    expect(json.discoveryComparisonSkipped).toBe(true)
  })

  it('(d) product_families → keşif tag\'leri + family tag çağrılır', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'product_families',
      schema: 'public',
      record: {
        id: 'fam-1',
        slug: 'family-slug',
        tenant_id: 'tenant-1',
      },
      old_record: {
        id: 'fam-1',
        slug: 'family-slug',
        tenant_id: 'tenant-1',
      },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).toHaveBeenCalledWith('home-data')
    expect(revalidateTagMock).toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-family-slug')
    expect(json.revalidatedTags).toContain('product-family-family-slug')
  })
})
