import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DomainCategory } from '@/lib/type-converters'

/**
 * INV-EN-YAYIN-2 — `EN_YAYIN` TEK BAYRAK, İKİ DAVRANIŞ: hreflang + `/en` dizin durumu (REC-300 Faz 3e-3)
 * + pasif kategori `noindex` (O4).
 *
 * NİÇİN VAR (canlı ölçüm, 2026-09-29): `EN_YAYIN` kapalıyken dil layout'u `/en` ağacına `noindex, follow`
 * basıyordu ama (1) `/en` ve `/en/products` kendi `robots: { index: true }`larıyla onu EZİP `index, follow`
 * dönüyordu, (2) hreflang `tr/en/x-default` kapalıyken de her sayfada ve site haritası satırında
 * beyan ediliyordu — dizine kapalı bir sayfayı Google'a "İngilizce eş" diye göstermek. Ayrıca 7 pasif
 * kategori sayfası 200 dönüp robots etiketsizdi (dizine girebilirdi).
 *
 * BU KAPI NE ÖLÇER: bayrağın İKİ hâlinde de (a) hreflang var/yok, (b) `/en` + `/en/products` robots,
 * (c) pasif/aktif kategori robots, (d) site haritası satırında `alternates` var/yok. Bayrak derleme sabiti;
 * `vi.doMock` + `vi.resetModules` ile iki hâlde de modül grafiği sıfırdan yüklenir — ölçülen şey
 * bayrağın değeri değil, tüketicilerin ona GERÇEKTEN bağlı olmasıdır.
 *
 * ÖLÇMEDİĞİ: canlıda Google'ın davranışı (GSC, yayın sonrası).
 */

// Veri katmanı ağa gitmez; kalıcı mock'lar (`vi.mock` hoist edilir, `resetModules`tan etkilenmez).
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) }),
    rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }] }),
  },
}))
vi.mock('@/lib/services/category.service', () => ({
  getCategories: async () => [
    { id: 'k1', slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
  ],
}))
vi.mock('@/lib/services/family.service', () => ({
  getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
  getFamiliesEnriched: async () => [],
}))

const KATEGORI = (aktif: boolean | null) =>
  ({
    id: 'k1',
    slug: 'fans',
    name: 'Fans',
    description: '',
    image_url: null,
    is_active: aktif,
    parent_id: null,
    metadata: { slug: { tr: 'fanlar', en: 'fans' } },
  }) as unknown as DomainCategory

const EN_ISTEK = { params: Promise.resolve({ lang: 'en' }) }
const TR_ISTEK = { params: Promise.resolve({ lang: 'tr' }) }
const NOINDEX = { index: false, follow: true }
const INDEX = { index: true, follow: true }

/** `EN_YAYIN` verilen değerde sabitlenir; tüketici modüller sıfırdan yüklenir. */
async function bayrakla(acik: boolean) {
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: acik,
  }))
  const { sayfaUstVerisi } = await import('../sayfaUstVerisi')
  const ana = await import('../../../app/[lang]/page')
  const urunler = await import('../../../app/[lang]/products/page')
  const seciciSayfa = await import('../../../app/[lang]/urun-secici/page')
  const kategori = await import('../../../app/_components/kategoriSayfasi')
  const marka = await import('../../../app/_components/markaSayfasi')
  const { default: sitemap } = await import('../../../app/sitemap')
  return { sayfaUstVerisi, ana, urunler, seciciSayfa, kategori, marka, sitemap }
}

describe('INV-EN-YAYIN-2 — hreflang + /en noindex + pasif kategori', () => {
  afterEach(() => {
    vi.doUnmock('@/config/features')
    vi.resetModules()
  })

  describe('EN_YAYIN KAPALI', () => {
    it('sayfaUstVerisi: hreflang YOK (yalnız canonical, kendi dilinde); EN noindex, TR robots yok', async () => {
      const { sayfaUstVerisi } = await bayrakla(false)
      const tr = sayfaUstVerisi({ lang: 'tr', yol: '/destek/sss', baslik: 'B', aciklama: 'A' })
      const en = sayfaUstVerisi({ lang: 'en', yol: '/destek/sss', baslik: 'B', aciklama: 'A' })
      expect(tr.alternates).toEqual({ canonical: expect.stringMatching(/\/tr\/destek\/sss$/) })
      expect(en.alternates).toEqual({ canonical: expect.stringMatching(/\/en\/destek\/sss$/) })
      expect(tr.alternates).not.toHaveProperty('languages')
      expect(tr.robots).toBeUndefined()
      expect(en.robots).toEqual(NOINDEX)
    })

    it('/en ve /en/products: noindex, follow — sayfanın kendi robots\'u layout\'unkini EZMEZ; TR bugünkü', async () => {
      const { ana, urunler } = await bayrakla(false)
      expect((await ana.generateMetadata(EN_ISTEK)).robots).toEqual(NOINDEX)
      expect((await urunler.generateMetadata(EN_ISTEK)).robots).toEqual(NOINDEX)
      expect((await ana.generateMetadata(TR_ISTEK)).robots).toEqual(INDEX)
      expect((await urunler.generateMetadata(TR_ISTEK)).robots).toEqual(INDEX)
    })

    it('el yazımı hreflang yüzeyleri (ana sayfa, ürünler, ürün seçici, marka, kategori): languages YOK, canonical KALIR', async () => {
      const { ana, urunler, seciciSayfa, marka, kategori } = await bayrakla(false)
      const metalar = [
        await ana.generateMetadata(TR_ISTEK),
        await ana.generateMetadata(EN_ISTEK),
        await urunler.generateMetadata(TR_ISTEK),
        await urunler.generateMetadata(EN_ISTEK),
        await seciciSayfa.generateMetadata(TR_ISTEK),
        await seciciSayfa.generateMetadata(EN_ISTEK),
        marka.markaUstVerisi('tr', 'avens'),
        marka.markaUstVerisi('en', 'avens'),
        kategori.kategoriSayfasiUstVerisi('tr', KATEGORI(true)),
        kategori.kategoriSayfasiUstVerisi('en', KATEGORI(true)),
      ]
      for (const m of metalar) {
        expect(m.alternates?.canonical, 'canonical bozulmamalı').toBeTruthy()
        expect(m.alternates, 'EN kapalı ama hreflang beyan ediliyor').not.toHaveProperty('languages')
      }
    })

    it('kategori: pasif (is_active=false) → noindex, follow; aktif → robots alanı YOK (TR)', async () => {
      const { kategori } = await bayrakla(false)
      expect(kategori.kategoriSayfasiUstVerisi('tr', KATEGORI(false)).robots).toEqual(NOINDEX)
      expect(kategori.kategoriSayfasiUstVerisi('tr', KATEGORI(true)).robots).toBeUndefined()
      expect(kategori.kategoriSayfasiUstVerisiK3b('tr', KATEGORI(false), null).robots).toEqual(NOINDEX)
      expect(kategori.kategoriSayfasiUstVerisiK3b('tr', KATEGORI(true), null).robots).toBeUndefined()
    })

    it('site haritası: satırların HİÇBİRİNDE alternates alanı yok; /en adresi de yok', async () => {
      const { sitemap } = await bayrakla(false)
      const satirlar = await sitemap()
      expect(satirlar.length).toBeGreaterThan(0)
      expect(satirlar.filter((s) => 'alternates' in s)).toEqual([])
      expect(satirlar.filter((s) => s.url.includes('/en/') || s.url.endsWith('/en'))).toEqual([])
    })
  })

  describe('EN_YAYIN AÇIK — ikisi birden GERİ GELİR', () => {
    it('sayfaUstVerisi: hreflang tr/en/x-default var; EN robots yok', async () => {
      const { sayfaUstVerisi } = await bayrakla(true)
      const tr = sayfaUstVerisi({ lang: 'tr', yol: '/destek/sss', baslik: 'B', aciklama: 'A' })
      const en = sayfaUstVerisi({ lang: 'en', yol: '/destek/sss', baslik: 'B', aciklama: 'A' })
      for (const m of [tr, en]) {
        expect(Object.keys(m.alternates?.languages ?? {}).sort()).toEqual(['en', 'tr', 'x-default'])
      }
      expect(tr.robots).toBeUndefined()
      expect(en.robots).toBeUndefined()
    })

    it('/en ve /en/products: bugünkü index, follow', async () => {
      const { ana, urunler } = await bayrakla(true)
      expect((await ana.generateMetadata(EN_ISTEK)).robots).toEqual(INDEX)
      expect((await urunler.generateMetadata(EN_ISTEK)).robots).toEqual(INDEX)
      expect((await ana.generateMetadata(TR_ISTEK)).robots).toEqual(INDEX)
      expect((await urunler.generateMetadata(TR_ISTEK)).robots).toEqual(INDEX)
    })

    it('el yazımı hreflang yüzeyleri: languages tr/en/x-default BİREBİR geri gelir', async () => {
      const { ana, urunler, seciciSayfa, marka, kategori } = await bayrakla(true)
      const metalar = [
        await ana.generateMetadata(TR_ISTEK),
        await urunler.generateMetadata(EN_ISTEK),
        await seciciSayfa.generateMetadata(TR_ISTEK),
        marka.markaUstVerisi('tr', 'avens'),
        kategori.kategoriSayfasiUstVerisi('en', KATEGORI(true)),
      ]
      for (const m of metalar) {
        expect(Object.keys(m.alternates?.languages ?? {}).sort()).toEqual(['en', 'tr', 'x-default'])
      }
    })

    it('kategori: pasif HER HÂLDE noindex (bayrakla ilgisiz); aktif etkilenmez', async () => {
      const { kategori } = await bayrakla(true)
      expect(kategori.kategoriSayfasiUstVerisi('tr', KATEGORI(false)).robots).toEqual(NOINDEX)
      expect(kategori.kategoriSayfasiUstVerisi('tr', KATEGORI(true)).robots).toBeUndefined()
      expect(kategori.kategoriSayfasiUstVerisi('en', KATEGORI(true)).robots).toBeUndefined()
    })

    it('site haritası: /en adresleri VAR ve HER satırda alternates.languages {tr,en} (bugünkü çıktı)', async () => {
      const { sitemap } = await bayrakla(true)
      const satirlar = await sitemap()
      expect(satirlar.some((s) => s.url.includes('/en/') || s.url.endsWith('/en'))).toBe(true)
      const alternatesiOlmayan = satirlar.filter((s) => !s.alternates?.languages)
      // Bilgi Merkezi satırları (kendi kuralı: hreflang yalnız iki dil de yayındaysa) hariç tutulur.
      expect(alternatesiOlmayan.filter((s) => !s.url.includes('/bilgi-merkezi') && !s.url.includes('/knowledge-hub'))).toEqual([])
      const ornek = satirlar.find((s) => s.url.endsWith('/tr/products'))
      expect(ornek?.alternates?.languages).toEqual({
        tr: expect.stringMatching(/\/tr\/products$/),
        en: expect.stringMatching(/\/en\/products$/),
      })
    })
  })
})
