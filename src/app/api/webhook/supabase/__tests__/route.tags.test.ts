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

// Route içinde products/inventory_movements dallarında categories/products/product_families
// tablolarına ek Supabase sorguları yapılıyor (category_id/product_id/family_id set edilmişse).
// Çoğu test senaryosu bu alanları payload'da vermediği için chain hiç çağrılmaz — ama T138-VH K6
// zincir yürüyüşü (walkFamilyChain) testleri id'ye göre FARKLI satır dönmesini gerektiriyor, bu
// yüzden mock `.eq('id', val)` argümanını izleyip `familyRowsById`/`productRowsById` map'lerinden
// okuyan bir builder'a yükseltildi. `vi.hoisted` kullanılır çünkü `vi.mock` fabrikası hoist edilir
// ve dışarıdaki değişkenlere normal kapanışla erişemez.
const { familyRowsById, productRowsById } = vi.hoisted(() => ({
  familyRowsById: new Map<
    string,
    { id: string; slug: string | null; parent_family_id: string | null }
  >(),
  productRowsById: new Map<
    string,
    { family_id: string | null; category_id?: string | null }
  >(),
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn((table: string) => {
      let queriedId: string | undefined
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((_col: string, val: string) => {
          queriedId = val
          return builder
        }),
        is: vi.fn(() => builder),
        single: vi.fn(async () => {
          if (table === 'product_families') {
            const row = queriedId ? familyRowsById.get(queriedId) : undefined
            return { data: row ?? null, error: null }
          }
          if (table === 'products') {
            const row = queriedId ? productRowsById.get(queriedId) : undefined
            return { data: row ?? null, error: null }
          }
          return { data: null, error: null }
        }),
      }
      return builder
    }),
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
    familyRowsById.clear()
    productRowsById.clear()
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

  // ============================================================================
  // T138-VH K6 — SERİ↔MODEL webhook fan-out (bkz. route.ts walkFamilyChain/revalidateFamilyChain)
  // ============================================================================

  it('(K6-a) MODEL (product_families, parent_family_id dolu) değişince SERİ\'nin tag\'i + PDP yolu da tazelenir', async () => {
    familyRowsById.set('series-1', { id: 'series-1', slug: 'seri-slug', parent_family_id: null })

    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'product_families',
      schema: 'public',
      record: {
        id: 'model-1',
        slug: 'model-slug',
        parent_family_id: 'series-1',
        tenant_id: 'tenant-1',
      },
      old_record: {
        id: 'model-1',
        slug: 'model-slug',
        parent_family_id: 'series-1',
        tenant_id: 'tenant-1',
      },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    // Kendi (model) sayfası
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-model-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/products/model-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/en/products/model-slug')
    // Üstündeki SERİ sayfası — bu K6'nın kapattığı boşluk
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-seri-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/products/seri-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/en/products/seri-slug')
    expect(json.revalidatedTags).toContain('product-family-seri-slug')
    expect(json.fanoutTruncated).toBe(false)
  })

  it('(K6-a2) products satırı MODEL bir aileye bağlıysa, o ailenin SERİ\'si de tazelenir', async () => {
    familyRowsById.set('model-1', { id: 'model-1', slug: 'model-slug', parent_family_id: 'series-1' })
    familyRowsById.set('series-1', { id: 'series-1', slug: 'seri-slug', parent_family_id: null })

    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'products',
      schema: 'public',
      record: { id: 'p-1', slug: 'urun-slug', family_id: 'model-1', status: 'active', tenant_id: 'tenant-1' },
      old_record: { id: 'p-1', slug: 'urun-slug', family_id: 'model-1', status: 'active', tenant_id: 'tenant-1' },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/products/model-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/products/seri-slug')
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-seri-slug')
    expect(json.fanoutTruncated).toBe(false)
  })

  it('(K6-b) SERİ (product_families, parent_family_id NULL) değişince YALNIZ kendi tag\'i tazelenir, ebeveyn zincirine gidilmez', async () => {
    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'product_families',
      schema: 'public',
      record: { id: 'series-1', slug: 'seri-slug', parent_family_id: null, tenant_id: 'tenant-1' },
      old_record: { id: 'series-1', slug: 'seri-slug', parent_family_id: null, tenant_id: 'tenant-1' },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-seri-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/products/seri-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/en/products/seri-slug')
    // Ebeveyn yok → ek path/tag üretilmemeli (yalnız kendi ikisi: tr+en)
    const familyTagCalls = revalidateTagMock.mock.calls.filter(([tag]) =>
      typeof tag === 'string' && tag.startsWith('product-family-')
    )
    expect(familyTagCalls).toEqual([['product-family-seri-slug']])
    expect(json.fanoutTruncated).toBe(false)
  })

  it('(K6-c) zincir üst-sınırı (MAX_FAMILY_CHAIN_HOPS) aşılırsa SESSİZCE kırpılmaz — fanoutTruncated=true + console.error', async () => {
    // Bozuk/derin zincir simülasyonu: DB tek-seviye guard'ı atlatılmış gibi davranırız
    // (route.ts bu duruma KÖRdür, savunma amaçlı üst sınırla durur).
    familyRowsById.set('f1', { id: 'f1', slug: 's1', parent_family_id: 'f2' })
    familyRowsById.set('f2', { id: 'f2', slug: 's2', parent_family_id: 'f3' })
    familyRowsById.set('f3', { id: 'f3', slug: 's3', parent_family_id: 'f4' })
    familyRowsById.set('f4', { id: 'f4', slug: 's4', parent_family_id: 'f5' })
    // f5 kasıtlı olarak map'te YOK — MAX_FAMILY_CHAIN_HOPS(4)'e ulaşılınca zaten fetch edilmeyecek.

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { POST } = await import('../route')

    const payload = {
      type: 'UPDATE',
      table: 'products',
      schema: 'public',
      record: { id: 'p-1', slug: 'urun-slug', family_id: 'f1', status: 'active', tenant_id: 'tenant-1' },
      old_record: { id: 'p-1', slug: 'urun-slug', family_id: 'f1', status: 'active', tenant_id: 'tenant-1' },
    }

    const res = await POST(buildRequest(payload))
    const json = await res.json()

    // Sınıra kadar bulunan HER halka tazelenir — sessizce hiçbiri atlanmaz.
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-s1')
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-s2')
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-s3')
    expect(revalidateTagMock).toHaveBeenCalledWith('product-family-s4')

    // Ama sınır aşıldığı GÖRÜNÜR olmalı: yanıt gövdesi + log.
    expect(json.fanoutTruncated).toBe(true)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('MAX_FAMILY_CHAIN_HOPS')
    )

    consoleErrorSpy.mockRestore()
  })
})
