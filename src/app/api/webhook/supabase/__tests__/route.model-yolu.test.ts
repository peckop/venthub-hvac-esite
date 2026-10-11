import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

/**
 * INV-WEBHOOK-MODEL-YOLU-1 — products webhook dalı, YAYINDAKİ modelin sayfa yolunu (TR + EN) da tazeler (ALT-16,
 * REC-300 3g-2). Bayrak KAPALI kipte (varsayılan, `ADRES_SEMASI_K3B = false`) ölçülür; açık kip ayrı dosyada
 * (`route.model-yolu.acik.test.ts`).
 *
 * KURALLAR (kart): (1) yol `adresUret` tek noktasından, webhook yol metni çoğaltmaz; (2) liste dışı SKU'da davranış
 * DEĞİŞMEZ; (3) liste boşsa hiçbir ek yol; (4) çağrı başına ek yol en çok (yeni + eski SKU) × 2 dil = 4.
 */
const revalidatePathMock = vi.fn()
const revalidateTagMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}))

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

// family_id verilmediği için aile/kategori sorguları çalışmaz; yine de DB'ye hiç gidilmesin.
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => {
      const builder = {
        select: () => builder,
        eq: () => builder,
        is: () => builder,
        single: async () => ({ data: null, error: null }),
        then: (resolve: (v: { data: unknown }) => unknown) => resolve({ data: [] }),
      }
      return builder
    },
  },
}))

const WEBHOOK_SECRET = 'test-webhook-secret-mock'

function istek(payload: unknown): NextRequest {
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify(payload),
  })
}

async function urunGuncelle(record: Record<string, unknown>, oldRecord: Record<string, unknown> | null = null) {
  const { POST } = await import('../route')
  const res = await POST(istek({ type: 'UPDATE', table: 'products', schema: 'public', record, old_record: oldRecord }))
  return (await res.json()) as { revalidatedPaths: string[] }
}

const { adresUret } = await import('@/utils/adresUret')
const modelYolu = (aile: string, sku: string, dil: 'tr' | 'en') =>
  String(adresUret({ tur: 'model', aileSlug: aile, sku }, dil, true))

describe('INV-WEBHOOK-MODEL-YOLU-1 — products webhook: yayındaki model sayfası yolları (bayrak kapalı)', () => {
  const originalSecret = process.env.SUPABASE_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_WEBHOOK_SECRET', WEBHOOK_SECRET)
    yayindaListesiAyarla({ modeller: { 'aile-a': ['AAA-100', 'AAA-200'] }, surumler: { 'AAA-101': 'AAA-100' } })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalSecret === undefined) delete process.env.SUPABASE_WEBHOOK_SECRET
    else process.env.SUPABASE_WEBHOOK_SECRET = originalSecret
  })

  it('liste içi SKU → modelin TR ve EN yolu hem yanıtta hem revalidatePath çağrısında (adresUret çıktısı)', async () => {
    const json = await urunGuncelle({ id: 'p1', sku: 'AAA-100', price: 10 })
    for (const dil of ['tr', 'en'] as const) {
      const yol = modelYolu('aile-a', 'AAA-100', dil)
      expect(json.revalidatedPaths).toContain(yol)
      expect(revalidatePathMock).toHaveBeenCalledWith(yol)
    }
  })

  it('SKU küçük harf/boşluklu gelse de (DB biçimi bozuk) liste içi model bulunur', async () => {
    const json = await urunGuncelle({ id: 'p1', sku: ' aaa-200 ' })
    expect(json.revalidatedPaths).toContain(modelYolu('aile-a', 'AAA-200', 'tr'))
  })

  it('sürüm SKU kendi yolunu alır (sürüm sayfası kendi adresinde 200)', async () => {
    const json = await urunGuncelle({ id: 'p1', sku: 'AAA-101' })
    expect(json.revalidatedPaths).toContain(modelYolu('aile-a', 'AAA-101', 'tr'))
  })

  it('liste DIŞI SKU → davranış DEĞİŞMEZ: yol kümesi, liste boşken verilen kümeyle birebir aynı', async () => {
    const dis = await urunGuncelle({ id: 'p1', sku: 'ZZZ-999', status: 'active' })
    revalidatePathMock.mockClear()
    yayindaListesiAyarla({})
    const bos = await urunGuncelle({ id: 'p1', sku: 'ZZZ-999', status: 'active' })
    expect(new Set(dis.revalidatedPaths)).toEqual(new Set(bos.revalidatedPaths))
  })

  it('BOŞ liste → hiçbir ek yol (yol kümesi sku taşımayan payload ile aynı)', async () => {
    yayindaListesiAyarla({})
    const skuLu = await urunGuncelle({ id: 'p1', sku: 'AAA-100' })
    const skuSuz = await urunGuncelle({ id: 'p1' })
    expect(skuLu.revalidatedPaths).toEqual(skuSuz.revalidatedPaths)
  })

  it('SKU hiç yoksa / metin değilse ek yol yok ve hata fırlatmaz', async () => {
    const baz = (await urunGuncelle({ id: 'p1' })).revalidatedPaths
    for (const sku of [null, 123, '', '   ', { a: 1 }]) {
      const json = await urunGuncelle({ id: 'p1', sku })
      expect(json.revalidatedPaths).toEqual(baz)
    }
  })

  it('SKU DEĞİŞTİ (old_record) → eski SKU sayfası da tazelenir; ek yol en çok 4', async () => {
    const baz = (await urunGuncelle({ id: 'p0' })).revalidatedPaths
    const json = await urunGuncelle({ id: 'p1', sku: 'AAA-200' }, { id: 'p1', sku: 'AAA-100' })
    for (const sku of ['AAA-100', 'AAA-200']) {
      for (const dil of ['tr', 'en'] as const) expect(json.revalidatedPaths).toContain(modelYolu('aile-a', sku, dil))
    }
    expect(json.revalidatedPaths.filter((p) => !baz.includes(p))).toHaveLength(4)
  })

  it('SKU aynı kaldıysa eski değer eklenmez: ek yol yalnız 2 (TR+EN)', async () => {
    const baz = (await urunGuncelle({ id: 'p0' })).revalidatedPaths
    const json = await urunGuncelle({ id: 'p1', sku: 'AAA-100' }, { id: 'p1', sku: 'AAA-100' })
    expect(json.revalidatedPaths.filter((p) => !baz.includes(p))).toHaveLength(2)
  })

  it('model yolu başka tabloyu etkilemez: categories dalı model yolu üretmez', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      istek({
        type: 'UPDATE',
        table: 'categories',
        schema: 'public',
        record: { id: 'c1', slug: 'kat', sku: 'AAA-100' },
        old_record: null,
      })
    )
    const json = (await res.json()) as { revalidatedPaths: string[] }
    expect(json.revalidatedPaths).not.toContain(modelYolu('aile-a', 'AAA-100', 'tr'))
  })
})
