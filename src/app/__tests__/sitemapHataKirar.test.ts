import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-SITEMAP-HATA-1 — site haritası, veri hatasını YUTMAZ (REC-300 onarımı, OPS 2026-09-29).
 *
 * NİÇİN: `sitemap.ts` aile ve kategori sorgularını `.catch(() => [])` ile sarıyordu. Build anındaki TEK
 * geçici DB hatası ürünsüz harita üretirdi; Google'a o gider (CI koşusu 36548708171: kategori 24, ürün 0).
 * `get_category_counts` ise hatayı {error} alanında döner (reject etmez) ve `data ?? []` ile sessizce
 * "hiçbir kategoride ürün yok" olurdu. Artık her biri build'i KIRAR; yeniden deneme ile örtülmez.
 *
 * KAPI İKİ ŞEY TUTAR: (1) her hata yolu sitemap()'i REDDEDİLMİŞ söz yapar, (2) sağlıklı veri hâlâ üretir
 * (aşırı düzeltme yok — tek kollu kapı "her zaman fırlat" sabotajını da geçirirdi).
 */
type Kat = { id: string; slug: string; parent_id: string | null; metadata: unknown; updated_at: string }

const KATEGORI: Kat[] = [
  { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
]

async function sitemapKur(kosul: {
  kategoriler?: () => Promise<Kat[]>
  aileler?: () => Promise<{ slug: string }[]>
  sayimlar?: () => Promise<{ data: unknown; error: unknown }>
}) {
  vi.resetModules()
  vi.doMock('@/lib/supabase/static', () => ({
    supabaseStaticClient: {
      rpc: kosul.sayimlar ?? (async () => ({ data: [{ category_id: 'k1', product_count: 3 }], error: null })),
    },
  }))
  vi.doMock('@/lib/services/category.service', () => ({
    getCategories: kosul.kategoriler ?? (async () => KATEGORI),
  }))
  vi.doMock('@/lib/services/family.service', () => ({
    getAllFamilySlugs: kosul.aileler ?? (async () => [{ slug: 'vortice-lineo-quiet' }]),
  }))
  return (await import('../sitemap')).default
}

describe('INV-SITEMAP-HATA-1 — veri hatası site haritasını üretilmez kılar', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabase/static')
    vi.doUnmock('@/lib/services/category.service')
    vi.doUnmock('@/lib/services/family.service')
    vi.resetModules()
  })

  it('sağlıklı veri: harita üretilir (kategori + aile satırı var)', async () => {
    const sitemap = await sitemapKur({})
    const satirlar = await sitemap()
    expect(satirlar.some((s) => s.url.endsWith('/tr/category/fanlar'))).toBe(true)
    expect(satirlar.some((s) => s.url.endsWith('/tr/products/vortice-lineo-quiet'))).toBe(true)
  })

  it('aile sorgusu hata verirse harita ÜRETİLMEZ (eskiden ürünsüz harita)', async () => {
    const sitemap = await sitemapKur({ aileler: async () => { throw new Error('aile DB hatası') } })
    await expect(sitemap()).rejects.toThrow('aile DB hatası')
  })

  it('kategori sorgusu hata verirse harita ÜRETİLMEZ', async () => {
    const sitemap = await sitemapKur({ kategoriler: async () => { throw new Error('kategori DB hatası') } })
    await expect(sitemap()).rejects.toThrow('kategori DB hatası')
  })

  it('kategori sayım RPC\'si {error} dönerse harita ÜRETİLMEZ (reject etmeyen hata yolu)', async () => {
    const sitemap = await sitemapKur({ sayimlar: async () => ({ data: null, error: { message: 'rpc düştü' } }) })
    await expect(sitemap()).rejects.toThrow(/get_category_counts.*rpc düştü/)
  })

  it('hatasız ama BOŞ aile listesi de ürünsüz haritadır → ÜRETİLMEZ', async () => {
    const sitemap = await sitemapKur({ aileler: async () => [] })
    await expect(sitemap()).rejects.toThrow(/boş katalog/)
  })

  it('hatasız ama BOŞ kategori listesi → ÜRETİLMEZ', async () => {
    const sitemap = await sitemapKur({ kategoriler: async () => [] })
    await expect(sitemap()).rejects.toThrow(/boş katalog/)
  })
})
