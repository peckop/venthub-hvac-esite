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
const { familyRowsById, productRowsById, categoryRowsById, categoryChildrenByParentId, categorySingleQueryIds } = vi.hoisted(() => ({
  // URN-12: `categories` tablosuna `.eq('id', x).single()` ile giden sorguların kimlikleri (istek-içi önbellek ölçümü).
  categorySingleQueryIds: [] as string[],
  familyRowsById: new Map<
    string,
    { id: string; slug: string | null; parent_family_id: string | null }
  >(),
  productRowsById: new Map<
    string,
    { family_id: string | null; category_id?: string | null }
  >(),
  // URN-12: categories satırları (id → satır) ve bir üst kategorinin çocukları (parent_id → satırlar).
  categoryRowsById: new Map<
    string,
    { id: string; slug: string | null; metadata?: unknown; parent_id: string | null }
  >(),
  categoryChildrenByParentId: new Map<
    string,
    { id: string; slug: string | null; metadata?: unknown; parent_id: string | null }[]
  >(),
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn((table: string) => {
      let queriedId: string | undefined
      let queriedColumn: string | undefined
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((col: string, val: string) => {
          queriedColumn = col
          queriedId = val
          return builder
        }),
        is: vi.fn(() => builder),
        // `await supabase.from('categories').select().eq('parent_id', id)` (çocuk sorgusu) `single()` çağırmaz.
        then: (resolve: (value: { data: unknown }) => unknown) =>
          resolve({
            data:
              table === 'categories' && queriedColumn === 'parent_id' && queriedId
                ? (categoryChildrenByParentId.get(queriedId) ?? [])
                : undefined,
          }),
        single: vi.fn(async () => {
          if (table === 'product_families') {
            const row = queriedId ? familyRowsById.get(queriedId) : undefined
            return { data: row ?? null, error: null }
          }
          if (table === 'products') {
            const row = queriedId ? productRowsById.get(queriedId) : undefined
            return { data: row ?? null, error: null }
          }
          if (table === 'categories') {
            if (queriedId) categorySingleQueryIds.push(queriedId)
            const row = queriedId ? categoryRowsById.get(queriedId) : undefined
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
    categoryRowsById.clear()
    categoryChildrenByParentId.clear()
    categorySingleQueryIds.length = 0
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

  // ============================================================================
  // URN-12 (REC-300 3g-2a) — ESKİ slug / ESKİ kategori: webhook yalnız YENİ değeri değil ESKİSİNİ de tazeler.
  // `old_record` kuralı (scripts/webhook_setup.sql): INSERT'te NULL, DELETE'te `record` NULL, UPDATE'te ikisi de dolu.
  // ============================================================================

  const yollarOf = () => revalidatePathMock.mock.calls.map(([p]) => p as string)

  describe('URN-12 — product_families eski slug', () => {
    const aile = (slug: string, extra: Record<string, unknown> = {}) => ({
      id: 'fam-1',
      slug,
      parent_family_id: null,
      tenant_id: 'tenant-1',
      ...extra,
    })

    it('(U12-a) slug A→B: ESKİ slug\'ın iki dildeki yolları ve etiketi de tazelenir', async () => {
      const { POST } = await import('../route')

      const res = await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('yeni-aile'), old_record: aile('eski-aile'),
      }))
      const json = await res.json()

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/products/yeni-aile', '/en/products/yeni-aile',
        '/tr/products/eski-aile', '/en/products/eski-aile',
      ]))
      expect(revalidateTagMock).toHaveBeenCalledWith('product-family-yeni-aile')
      expect(revalidateTagMock).toHaveBeenCalledWith('product-family-eski-aile')
      expect(json.revalidatedTags).toEqual(expect.arrayContaining([
        'product-family-yeni-aile', 'product-family-eski-aile',
      ]))
    })

    it('(U12-b) A→B→A ardışık iki payload: İKİSİNDE de önceki slug tazelenir (geri dönüşte B\'nin önbelleği kalmaz)', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('slug-b'), old_record: aile('slug-a'),
      }))
      const ilkYollar = yollarOf()
      expect(ilkYollar).toEqual(expect.arrayContaining(['/tr/products/slug-a', '/tr/products/slug-b']))

      revalidatePathMock.mockClear()
      revalidateTagMock.mockClear()

      await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('slug-a'), old_record: aile('slug-b'),
      }))
      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/products/slug-a', '/en/products/slug-a', '/tr/products/slug-b', '/en/products/slug-b',
      ]))
      expect(revalidateTagMock).toHaveBeenCalledWith('product-family-slug-a')
      expect(revalidateTagMock).toHaveBeenCalledWith('product-family-slug-b')
    })

    it('(U12-c) slug DEĞİŞMEDİ: eski slug için ek çağrı yok, yollar tekrarlanmaz', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('ayni-aile', { name: 'Yeni ad' }), old_record: aile('ayni-aile', { name: 'Eski ad' }),
      }))

      const aileTagleri = revalidateTagMock.mock.calls.filter(([t]) => String(t).startsWith('product-family-'))
      expect(aileTagleri).toEqual([['product-family-ayni-aile']])
      expect(yollarOf().filter((p) => p === '/tr/products/ayni-aile')).toHaveLength(1)
    })

    it('(U12-d) UPDATE\'te old_record YOK → yalnız yeni slug tazelenir, hata yok (güvenli düşüş)', async () => {
      const { POST } = await import('../route')

      const res = await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('yeni-aile'), old_record: null,
      }))

      expect(res.status).toBe(200)
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/products/yeni-aile']))
      expect(yollarOf().some((p) => p.includes('eski'))).toBe(false)
    })

    it('(U12-e) INSERT (old_record NULL) yalnız yeni; DELETE (record NULL) eski satırı tazeler', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'INSERT', table: 'product_families', schema: 'public',
        record: aile('eklenen-aile'), old_record: null,
      }))
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/products/eklenen-aile']))

      revalidatePathMock.mockClear()
      await POST(buildRequest({
        type: 'DELETE', table: 'product_families', schema: 'public',
        record: null, old_record: aile('silinen-aile'),
      }))
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/products/silinen-aile', '/en/products/silinen-aile']))
    })

    it('(U12-f) MODEL başka seriye taşındı: ESKİ serinin landing\'i de tazelenir; ortak seri iki kez tazelenmez', async () => {
      familyRowsById.set('seri-eski', { id: 'seri-eski', slug: 'seri-eski-slug', parent_family_id: null })
      familyRowsById.set('seri-yeni', { id: 'seri-yeni', slug: 'seri-yeni-slug', parent_family_id: null })
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'product_families', schema: 'public',
        record: aile('model-slug', { parent_family_id: 'seri-yeni' }),
        old_record: aile('model-slug', { parent_family_id: 'seri-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/products/seri-yeni-slug', '/tr/products/seri-eski-slug',
      ]))
      expect(revalidateTagMock).toHaveBeenCalledWith('product-family-seri-eski-slug')
    })
  })

  describe('URN-12 — products eski aile + eski/yeni category_id, subcategory_id', () => {
    const urun = (extra: Record<string, unknown>) => ({
      id: 'p-1', slug: 'urun-slug', status: 'active', tenant_id: 'tenant-1', ...extra,
    })

    beforeEach(() => {
      categoryRowsById.set('kok-eski', { id: 'kok-eski', slug: 'kok-eski-slug', metadata: null, parent_id: null })
      categoryRowsById.set('kok-yeni', { id: 'kok-yeni', slug: 'kok-yeni-slug', metadata: null, parent_id: null })
      categoryRowsById.set('alt-eski', { id: 'alt-eski', slug: 'alt-eski-slug', metadata: null, parent_id: 'kok-eski' })
      categoryRowsById.set('alt-yeni', { id: 'alt-yeni', slug: 'alt-yeni-slug', metadata: null, parent_id: 'kok-yeni' })
    })

    it('(U12-g) eski≠yeni category_id: İKİ kategorinin yolları tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-yeni' }), old_record: urun({ category_id: 'kok-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/category/kok-yeni-slug', '/tr/category/kok-eski-slug', '/en/category/kok-eski-slug',
      ]))
    })

    it('(U12-h) eski≠yeni subcategory_id: yeni ve eski alt kategori (üstleriyle) tazelenir; subcategory_id eskiden hiç tazelenmiyordu', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-yeni', subcategory_id: 'alt-yeni' }),
        old_record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/kategori/kok-yeni-slug/alt-yeni-slug', '/en/category/kok-yeni-slug/alt-yeni-slug',
        '/tr/kategori/kok-eski-slug/alt-eski-slug', '/en/category/kok-eski-slug/alt-eski-slug',
      ]))
    })

    it('(U12-i) yalnız subcategory_id değişti (category_id aynı): eski alt kategori tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-yeni' }),
        old_record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/kategori/kok-yeni-slug/alt-yeni-slug', '/tr/kategori/kok-eski-slug/alt-eski-slug',
      ]))
    })

    it('(U12-j) değişmeyen kategori tek kez tazelenir (tekilleştirme), yanıtta tekrar yok', async () => {
      const { POST } = await import('../route')

      const res = await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski', stock_qty: 1 }),
        old_record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski', stock_qty: 2 }),
      }))
      const json = await res.json()

      const kategoriYollari = (json.revalidatedPaths as string[]).filter((p) => p.includes('kok-eski-slug'))
      expect(new Set(kategoriYollari).size).toBe(kategoriYollari.length)
      expect(yollarOf().filter((p) => p === '/tr/category/kok-eski-slug')).toHaveLength(1)
    })

    it('(U12-k) UPDATE\'te old_record YOK → yalnız yeni kategori/alt kategori tazelenir, hata yok', async () => {
      const { POST } = await import('../route')

      const res = await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-yeni', subcategory_id: 'alt-yeni' }), old_record: null,
      }))

      expect(res.status).toBe(200)
      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/category/kok-yeni-slug', '/tr/kategori/kok-yeni-slug/alt-yeni-slug',
      ]))
      expect(yollarOf().some((p) => p.includes('eski'))).toBe(false)
    })

    it('(U12-l) DELETE (record NULL): silinen ürünün kategori/alt kategorisi tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'DELETE', table: 'products', schema: 'public',
        record: null, old_record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/category/kok-eski-slug', '/tr/kategori/kok-eski-slug/alt-eski-slug',
      ]))
    })

    it('(U12-t) ortak üstü paylaşan eski+yeni category_id/subcategory_id: categories tablosuna kimlik başına TEK sorgu (istek-içi önbellek)', async () => {
      // Yeni alt ve eski alt AYNI üstü (kok-yeni) paylaşır; üst, hem category_id olarak hem iki alt kategorinin
      // ebeveyni olarak istenir. Önbelleksiz kok-yeni 3 kez çekilirdi.
      categoryRowsById.set('alt-eski-2', { id: 'alt-eski-2', slug: 'alt-eski-2-slug', metadata: null, parent_id: 'kok-yeni' })
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ category_id: 'kok-yeni', subcategory_id: 'alt-yeni' }),
        old_record: urun({ category_id: 'kok-eski', subcategory_id: 'alt-eski-2' }),
      }))

      const sayim = new Map<string, number>()
      for (const id of categorySingleQueryIds) sayim.set(id, (sayim.get(id) ?? 0) + 1)
      expect([...sayim.entries()].filter(([, n]) => n > 1)).toEqual([])
      expect([...sayim.keys()].sort()).toEqual(['alt-eski-2', 'alt-yeni', 'kok-eski', 'kok-yeni'])
      // Önbellek yolları değiştirmez: dört kimliğin hepsi tazelendi.
      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/category/kok-yeni-slug', '/tr/category/kok-eski-slug',
        '/tr/kategori/kok-yeni-slug/alt-yeni-slug', '/tr/kategori/kok-yeni-slug/alt-eski-2-slug',
      ]))
    })

    it('(U12-m) ürün başka aileye taşındı: ESKİ ailenin ve serisinin PDP yolu da tazelenir', async () => {
      familyRowsById.set('aile-yeni', { id: 'aile-yeni', slug: 'aile-yeni-slug', parent_family_id: 'seri-1' })
      familyRowsById.set('aile-eski', { id: 'aile-eski', slug: 'aile-eski-slug', parent_family_id: 'seri-1' })
      familyRowsById.set('seri-1', { id: 'seri-1', slug: 'seri-slug', parent_family_id: null })
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'products', schema: 'public',
        record: urun({ family_id: 'aile-yeni' }), old_record: urun({ family_id: 'aile-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/products/aile-yeni-slug', '/tr/products/aile-eski-slug', '/tr/products/seri-slug',
      ]))
      // Ortak seri tek kez tazelenir.
      expect(yollarOf().filter((p) => p === '/tr/products/seri-slug')).toHaveLength(1)
      expect(revalidateTagMock.mock.calls.filter(([t]) => t === 'product-family-seri-slug')).toHaveLength(1)
    })
  })

  describe('URN-12 — categories eski slug / eski ebeveyn', () => {
    const kat = (extra: Record<string, unknown>) => ({
      id: 'kat-1', slug: 'kat-slug', metadata: null, parent_id: null, tenant_id: 'tenant-1', ...extra,
    })

    it('(U12-n) kanonik slug A→B: ESKİ slug\'ın yolları da tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'yeni-kat' }), old_record: kat({ slug: 'eski-kat' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/category/yeni-kat', '/tr/category/eski-kat', '/en/category/eski-kat',
      ]))
    })

    it('(U12-o) yalnız TR çeviri slug\'ı (metadata.slug.tr) değişti: eski TR yolu tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'kanonik', metadata: { slug: { tr: 'yeni-tr', en: 'ayni-en' } } }),
        old_record: kat({ slug: 'kanonik', metadata: { slug: { tr: 'eski-tr', en: 'ayni-en' } } }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/category/yeni-tr', '/tr/category/eski-tr']))
      // EN slug'ı değişmedi: yeni ve eski ağacın ORTAK yolu tek kez tazelenir (tekilleştirme).
      expect(yollarOf().filter((p) => p === '/en/category/ayni-en')).toHaveLength(1)
    })

    it('(U12-p) A→B→A ardışık iki payload: ikisinde de önceki slug tazelenir', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'kat-b' }), old_record: kat({ slug: 'kat-a' }),
      }))
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/category/kat-a', '/tr/category/kat-b']))

      revalidatePathMock.mockClear()
      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'kat-a' }), old_record: kat({ slug: 'kat-b' }),
      }))
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/category/kat-a', '/tr/category/kat-b']))
    })

    it('(U12-q) ÜST kategorinin slug\'ı değişti: çocukların ESKİ iki segmentli yolları da tazelenir', async () => {
      categoryChildrenByParentId.set('kat-1', [
        { id: 'cocuk-1', slug: 'cocuk-slug', metadata: null, parent_id: 'kat-1' },
      ])
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'ust-yeni' }), old_record: kat({ slug: 'ust-eski' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/kategori/ust-yeni/cocuk-slug', '/tr/kategori/ust-eski/cocuk-slug',
        '/en/category/ust-eski/cocuk-slug',
      ]))
    })

    it('(U12-r) ALT kategori başka üste taşındı: eski üst altındaki yol tazelenir', async () => {
      categoryRowsById.set('ust-eski-id', { id: 'ust-eski-id', slug: 'ust-eski', metadata: null, parent_id: null })
      categoryRowsById.set('ust-yeni-id', { id: 'ust-yeni-id', slug: 'ust-yeni', metadata: null, parent_id: null })
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'alt', parent_id: 'ust-yeni-id' }),
        old_record: kat({ slug: 'alt', parent_id: 'ust-eski-id' }),
      }))

      expect(yollarOf()).toEqual(expect.arrayContaining([
        '/tr/kategori/ust-yeni/alt', '/tr/kategori/ust-eski/alt',
      ]))
    })

    it('(U12-u) yolla ilgisiz metadata alanı değişti: eski yol çalışması açılmaz, üst satırı tek kez sorgulanır, yol tekrarı yok', async () => {
      categoryRowsById.set('ust-1', { id: 'ust-1', slug: 'ust-slug', metadata: null, parent_id: null })
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'alt', parent_id: 'ust-1', metadata: { slug: { tr: 'alt-tr', en: 'alt-en' }, description: 'Yeni' } }),
        old_record: kat({ slug: 'alt', parent_id: 'ust-1', metadata: { slug: { tr: 'alt-tr', en: 'alt-en' }, description: 'Eski' } }),
      }))

      expect(categorySingleQueryIds.filter((id) => id === 'ust-1')).toHaveLength(1)
      const yollar = yollarOf()
      expect(new Set(yollar).size).toBe(yollar.length)
      expect(yollar).toEqual(expect.arrayContaining(['/tr/category/alt-tr', '/tr/kategori/ust-slug/alt-tr']))
    })

    it('(U12-s) değişmeyen satır: ek (eski) yol üretilmez; old_record YOK iken yalnız yeni yollar', async () => {
      const { POST } = await import('../route')

      await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'ayni', name: 'B' }), old_record: kat({ slug: 'ayni', name: 'A' }),
      }))
      expect(yollarOf().filter((p) => p === '/tr/category/ayni')).toHaveLength(1)

      revalidatePathMock.mockClear()
      const res = await POST(buildRequest({
        type: 'UPDATE', table: 'categories', schema: 'public',
        record: kat({ slug: 'yeni' }), old_record: null,
      }))
      expect(res.status).toBe(200)
      expect(yollarOf()).toEqual(expect.arrayContaining(['/tr/category/yeni']))
      expect(yollarOf().some((p) => p.includes('eski'))).toBe(false)
    })
  })
})
