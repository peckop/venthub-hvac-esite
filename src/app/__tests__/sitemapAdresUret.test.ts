import { afterEach, describe, expect, it, vi } from 'vitest'

import ALTIN from './fixtures/sitemapAltin.json'

/**
 * INV-SITEMAP-ADRES-1 — site haritası adresleri `adresUret` katmanından gelir (REC-300 Faz 3e-1).
 *
 * KAPALI (ADRES_SEMASI_K3B=false, bugün): çıktı, bu değişiklikten ÖNCEKİ kodun çıktısıyla BAYT BAYT aynı.
 * `fixtures/sitemapAltin.json` eski kodun (master 25c78d9c9) aynı sahte veriyle ürettiği satırlardır
 * (url, changefreq, priority, alternates); `{BASE}` = SITE_URL. EN_YAYIN'ın iki hâli de sabitlenir.
 * AÇIK (Faz 4 yayın günü): her satır kanonik yeni şemadan; kategori dalı iki seviyeli, marka `markalar`,
 * ürün listesi `urunler`, aile `urun`; her adres tekil ve tek kanonik (sıçrama yok).
 *
 * ÖLÇMEDİĞİ: 442 model adresi (3e-2), gerçek DB verisi, canlıda 308 sıçraması (yayın günü Faz 4).
 */
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: async () => ({
      data: [
        { category_id: 'k1', product_count: 3 },
        { category_id: 'k2', product_count: 2 },
        { category_id: 'k3', product_count: 4 },
        { category_id: 'k4', product_count: 0 },
      ],
    }),
  },
}))
vi.mock('@/lib/services/category.service', () => ({
  getCategories: async () => [
    { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
    { id: 'k2', slug: 'quiet-duct-fans', parent_id: 'k1', metadata: { slug: { tr: 'sessiz-kanal-fanlari', en: 'quiet-duct-fans' } }, updated_at: '2026-09-02T00:00:00.000Z' },
    { id: 'k3', slug: 'air-curtains', parent_id: null, metadata: { slug: { tr: 'hava-perdeleri', en: 'air-curtains' } }, updated_at: '2026-09-03T00:00:00.000Z' },
    { id: 'k4', slug: 'bos-kategori', parent_id: null, metadata: { slug: { tr: 'bos', en: 'empty' } }, updated_at: '2026-09-04T00:00:00.000Z' },
  ],
}))
vi.mock('@/lib/services/family.service', () => ({
  getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }, { slug: 'vortice-hava-perdesi' }, { slug: '' }],
  // REC-454 (master): aile lastmod'u ayrı sorgudan gelir; bu test yalnız ADRESİ ölçer, tarih sitemapLastmod.test.ts'te.
  getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
  // OPS-51: marka ürün sayısı ENJEKTE (DB yerine). Flexiva ürünsüz → haritada yok (altın veriyle tutarlı); diğerleri ürünlü.
  getBrandFamilyCount: async (_supabase: unknown, ad: string) => (ad === 'Flexiva' ? 0 : 5),
}))

type Satir = { url: string; changefreq: unknown; priority: unknown; alternates: unknown }

async function harita(enYayin: boolean, k3b: boolean): Promise<{ satirlar: Satir[]; base: string }> {
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: enYayin,
    ADRES_SEMASI_K3B: k3b,
  }))
  const { SITE_URL } = await import('../../config/siteUrl')
  const { default: sitemap } = await import('../sitemap')
  const ham = await sitemap()
  return {
    base: SITE_URL,
    satirlar: ham.map((s) => ({
      url: s.url,
      changefreq: s.changeFrequency ?? (s as { changefreq?: string }).changefreq,
      priority: s.priority,
      alternates: s.alternates,
    })),
  }
}

const altinaCevir = (satirlar: Satir[], base: string) =>
  JSON.parse(JSON.stringify(satirlar).split(base).join('{BASE}')) as Satir[]

describe('INV-SITEMAP-ADRES-1 — site haritası adresUret katmanından', () => {
  afterEach(() => {
    vi.doUnmock('@/config/features')
    vi.resetModules()
  })

  describe('bayrak KAPALI — çıktı eski kodla bayt bayt aynı', () => {
    // OPS-51: marka listesi 5 → 7 ama haritada 6: casals girdi (+1 TR, +2 iki dilde), flexiva ürünsüz olduğu için
    // sitemap DIŞI (noindex,follow sayfa): 21 → 22 (TR) ve 40 → 42 (iki dil). Altın dosya yalnız casals satırlarıyla genişledi.
    it('EN_YAYIN kapalı: 22 satır, altın veriyle birebir', async () => {
      const { satirlar, base } = await harita(false, false)
      expect(satirlar).toHaveLength(22)
      expect(altinaCevir(satirlar, base)).toEqual(ALTIN.enKapali)
    })

    it('EN_YAYIN açık: 42 satır (iki dil, alternates ile), altın veriyle birebir', async () => {
      const { satirlar, base } = await harita(true, false)
      expect(satirlar).toHaveLength(42)
      expect(altinaCevir(satirlar, base)).toEqual(ALTIN.enAcik)
    })
  })

  describe('bayrak AÇIK — kanonik yeni şema', () => {
    it('TR adresleri: ürün listesi urunler, kategori kök ve kök/dal, marka markalar, aile urun', async () => {
      const { satirlar, base } = await harita(false, true)
      const yollar = satirlar.map((s) => s.url.replace(base, ''))
      expect(yollar).toContain('/tr/urunler')
      expect(yollar).toContain('/tr/kategori/fanlar')
      expect(yollar).toContain('/tr/kategori/fanlar/sessiz-kanal-fanlari')
      expect(yollar).toContain('/tr/kategori/hava-perdeleri')
      expect(yollar).toContain('/tr/markalar/vortice')
      expect(yollar).toContain('/tr/urun/vortice-lineo-quiet')
      // Marka LİSTESİ iki şemada da /brands (markalar/page.tsx yok); statikler dokunulmaz.
      expect(yollar).toContain('/tr/brands')
      expect(yollar).toContain('/tr/contact')
    })

    it('eski şema adresi HİÇBİRİNDE kalmaz (kategori dalı iki seviyeli, /category /brands/<slug> /products/<aile> yok)', async () => {
      const { satirlar, base } = await harita(true, true)
      const yollar = satirlar.map((s) => s.url.replace(base, ''))
      expect(yollar.filter((y) => /^\/tr\/(category|products\/|brands\/)/.test(y))).toEqual([])
      expect(yollar).not.toContain('/tr/kategori/sessiz-kanal-fanlari')
    })

    it('EN adresleri: category/fans/quiet-duct-fans, brands/<slug>, products/<aile>; hreflang eşleri satırın kendi adresiyle tutarlı', async () => {
      const { satirlar, base } = await harita(true, true)
      const en = satirlar.filter((s) => s.url.startsWith(`${base}/en/`)).map((s) => s.url.replace(base, ''))
      expect(en).toContain('/en/category/fans/quiet-duct-fans')
      expect(en).toContain('/en/brands/vortice')
      expect(en).toContain('/en/products/vortice-lineo-quiet')
      expect(en).toContain('/en/products')
      for (const s of satirlar) {
        const langs = (s.alternates as { languages?: Record<string, string> } | undefined)?.languages
        if (!langs) continue
        expect(Object.values(langs)).toContain(s.url)
      }
    })

    it('her adres tekil; her satır tek hop (kanonik) — yinelenen adres yok', async () => {
      for (const enYayin of [false, true]) {
        const { satirlar } = await harita(enYayin, true)
        const urls = satirlar.map((s) => s.url)
        expect(new Set(urls).size).toBe(urls.length)
      }
    })
  })
})
