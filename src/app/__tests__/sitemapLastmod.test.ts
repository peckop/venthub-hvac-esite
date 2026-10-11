import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-SITEMAP-LASTMOD-1 — site haritası UYDURMA tarih yazmaz (REC-454, GEO-SEO 2026-09-30).
 *
 * NİÇİN: harita her üretimde `lastModified: new Date()` yazıyordu; canlıda 87 adresin 61'i her gün
 * "bugün değişti" görünüyordu. Google lastmod'u yalnız tutarlı biçimde doğruysa kullanır — her şeyi
 * her gün değişmiş ilan eden haritanın tarihlerini yok sayar; yeni rehber yazısının gerçek tarihi de
 * kaybolur. Kural: tarih ya gerçek değişiklikten gelir ya da alan HİÇ yazılmaz.
 *
 * YÖNTEM: saat ileri (2031) sabitlenir. Hiçbir satır o güne ait tarih taşıyamaz — taşıyorsa bir yer hâlâ
 * "şimdi"yi yazıyordur. Ayrıca aile satırı veritabanı tarihini, tarihsiz aile ise alansız çıkar.
 */
const SIMDI = new Date('2031-01-01T12:00:00.000Z')

async function sitemapKur(aileTarihleri: () => Promise<Map<string, string>>) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
  vi.doMock('@/lib/supabase/static', () => ({
    supabaseStaticClient: { rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }], error: null }) },
  }))
  vi.doMock('@/lib/services/category.service', () => ({
    getCategories: async () => [
      { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
    ],
  }))
  vi.doMock('@/lib/services/family.service', () => ({
    getAllFamilySlugs: async () => [{ slug: 'tarihli-aile' }, { slug: 'seri-slug' }],
    getFamilySitemapData: async () => ({ aileTarihleri: await aileTarihleri(), modeller: [] }),
    // OPS-51: marka ürün sayısı ENJEKTE (DB yerine): marka satırları (lastmod yazılmaz kolu) haritada kalır.
    getBrandFamilyCount: async () => 5,
  }))
  return (await import('../sitemap')).default
}

describe('INV-SITEMAP-LASTMOD-1 — lastmod gerçek değişiklikten ya da hiç', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.doUnmock('@/lib/supabase/static')
    vi.doUnmock('@/lib/services/category.service')
    vi.doUnmock('@/lib/services/family.service')
    vi.resetModules()
  })

  it('hiçbir satır üretim anını lastmod diye yazmaz', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(SIMDI)
    const sitemap = await sitemapKur(async () => new Map([['tarihli-aile', '2026-09-20T10:00:00.000Z']]))
    const satirlar = await sitemap()
    expect(satirlar.length).toBeGreaterThan(3)
    const uydurma = satirlar.filter((s) => s.lastModified && new Date(s.lastModified).getUTCFullYear() === 2031)
    expect(uydurma.map((s) => s.url)).toEqual([])
  })

  it('aile satırı veritabanındaki en son değişiklik tarihini taşır; tarihsiz (seri) satırda alan yok', async () => {
    const sitemap = await sitemapKur(async () => new Map([['tarihli-aile', '2026-09-20T10:00:00.000Z']]))
    const satirlar = await sitemap()
    const aile = satirlar.find((s) => s.url.endsWith('/tr/products/tarihli-aile'))
    const seri = satirlar.find((s) => s.url.endsWith('/tr/products/seri-slug'))
    expect(aile?.lastModified && new Date(aile.lastModified).toISOString()).toBe('2026-09-20T10:00:00.000Z')
    expect(seri).toBeDefined()
    expect(seri && 'lastModified' in seri).toBe(false)
  })

  it('sabit sayfa ve marka satırında lastmod yazılmaz; kategori kendi updated_at tarihini taşır', async () => {
    const sitemap = await sitemapKur(async () => new Map())
    const satirlar = await sitemap()
    const ana = satirlar.find((s) => s.url.endsWith('/tr'))
    const marka = satirlar.find((s) => s.url.includes('/tr/brands/'))
    const kategori = satirlar.find((s) => s.url.endsWith('/tr/category/fanlar'))
    expect(ana && 'lastModified' in ana).toBe(false)
    expect(marka && 'lastModified' in marka).toBe(false)
    expect(kategori?.lastModified && new Date(kategori.lastModified).toISOString()).toBe('2026-09-01T00:00:00.000Z')
  })

  it('aile tarih sorgusu hata verirse harita ÜRETİLMEZ (hata yutulmaz, INV-SITEMAP-HATA-1 ile aynı kural)', async () => {
    const sitemap = await sitemapKur(async () => {
      throw new Error('tarih DB hatası')
    })
    await expect(sitemap()).rejects.toThrow('tarih DB hatası')
  })
})
