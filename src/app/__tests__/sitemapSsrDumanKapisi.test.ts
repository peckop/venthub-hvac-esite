import { afterEach, describe, expect, it, vi } from 'vitest'

import { kurallar, temsilcileriSec, urunDetayAdresiMi } from '../../../tests/smoke/ssr-kurallari'

/**
 * INV-SITEMAP-DUMAN-1 — SSR duman KAPISI, GERÇEK site haritası üreticisinin çıktısını tanır (URN-85, Faz 3-C 2/2).
 *
 * NİÇİN BU KOL VAR: kapının adres kalıpları (`tests/smoke/ssr-kurallari.ts`) bağımsız ölçüt olarak ELLE yazılıdır
 * ve `ssr-duman-kilidi.test.ts` INV-DUMAN-9 onları elle kurulmuş fikstürle sınar. Elle fikstür, üreticinin
 * GERÇEKTE yazdığı adresten ayrışabilir — #1811'de tam bu oldu: üretici açık şemaya geçti, kapı eski kalıpta kaldı,
 * sayımlar 0/0/0 verdi ve kırmızıyı E2E koşusu (admin-smoke) buldu. Bu kol aynı ayrışmayı birim kapıda (`ci`)
 * yakalar: sitemap üreticisi gerçekten çalıştırılır, çıktısı kapının temsilci seçicisine verilir.
 *
 * BAYRAĞIN İKİ DURUMU × EN yayını iki durumu = dört harita. Kapı bayrağı OKUMAZ; her haritada AYNI kapı koşar.
 *
 * ÖLÇMEDİĞİ: sayfaların gerçek HTML'i (gövdeler sahtedir: kök → alt grup başlığı, dal/yaprak → aile kartı), gerçek DB
 * verisi, 442 model adresi. Sayfa içeriğinin doluluğu E2E koşusunda (`e2e/ssr-html.e2e.ts`) ölçülür.
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
  getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }, { slug: 'vortice-hava-perdesi' }],
  getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
  getBrandFamilyCount: async (_supabase: unknown, ad: string) => (ad === 'Flexiva' ? 0 : 5),
}))

/** Sitemap üreticisini verilen bayrak değerleriyle çalıştırır; satır adreslerini döner. */
async function haritaAdresleri(enYayin: boolean, k3b: boolean): Promise<string[]> {
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: enYayin,
    ADRES_SEMASI_K3B: k3b,
  }))
  const { default: sitemap } = await import('../sitemap')
  return (await sitemap()).map((s) => s.url)
}

const ALTGRUPLU_GOVDE = '<html><h1>Fanlar</h1><h2>Alt Ürün Grupları</h2></html>'
const YAPRAK_GOVDE = '<html><h1>Kategori</h1><div data-ssr="family-card"></div></html>'

/** Sahte ağ: harita gerçek üreticiden, kategori gövdeleri sahte (`fanlar` altı olan kök, gerisi yaprak). */
function ag(adresler: string[]) {
  const xml = `<urlset>${adresler.map((u) => `<loc>${u}</loc>`).join('')}</urlset>`
  return async (url: string): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> => {
    if (url.endsWith('/sitemap.xml')) return { ok: true, status: 200, text: async () => xml }
    const yol = new URL(url, 'http://x.invalid').pathname
    if (/^\/tr\/(category|kategori)\//.test(yol)) {
      return { ok: true, status: 200, text: async () => (/\/fanlar$/.test(yol) ? ALTGRUPLU_GOVDE : YAPRAK_GOVDE) }
    }
    return { ok: false, status: 404, text: async () => '' }
  }
}

describe('INV-SITEMAP-DUMAN-1 — kapı, gerçek site haritası üreticisinin çıktısını tanır', () => {
  afterEach(() => {
    vi.doUnmock('@/config/features')
    vi.resetModules()
  })

  for (const [enYayin, k3b] of [
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const) {
    describe(`EN_YAYIN ${enYayin ? 'açık' : 'kapalı'} · ADRES_SEMASI_K3B ${k3b ? 'açık' : 'kapalı'}`, () => {
      it('her kapıda-koşan sınıfın temsilcisi bulunur; seçim İÇERİKTEN; kural yolları şemayla uyumlu', async () => {
        const adresler = await haritaAdresleri(enYayin, k3b)
        const yollar = adresler.map((u) => new URL(u).pathname)
        // Fikstürün gerçekten o şemada olduğunun kanıtı (yanlış kipte sahte yeşil olmasın):
        const eskiKalipSayisi = yollar.filter((y) => /^\/tr\/(category|products\/|brands\/)/.test(y)).length
        expect(eskiKalipSayisi === 0, 'bayrak kipi harita biçimine yansımadı').toBe(k3b)

        const t = await temsilcileriSec('', ag(adresler))
        expect(t.secim.icerikten, 'seçim içerikten yapılmalı (kök/dal adresi gevşek kola düşmemeli)').toBe(true)
        expect(t.altgrupluKategori).toMatch(/\/fanlar$/)
        expect(t.yaprakKategori).toBeTruthy()
        expect(t.yaprakKategori).not.toBe(t.altgrupluKategori)
        expect(t.atlananlar).toEqual([])

        // Ürün ve marka detay temsilcisi, harita şemasının kendi biçiminde.
        expect(urunDetayAdresiMi(t.pdp ?? '')).toBe(true)
        expect(t.pdp?.startsWith(k3b ? '/tr/urun/' : '/tr/products/')).toBe(true)
        expect(t.marka?.startsWith(k3b ? '/tr/markalar/' : '/tr/brands/')).toBe(true)

        // Derinlik sayımı: açıkta kök 2 + dal 1; eskide tek seviyeli 3, iki seviyeli 0.
        expect(t.sayimlar.kategori).toBe(k3b ? 2 : 3)
        expect(t.sayimlar.ikiSegmentli).toBe(k3b ? 1 : 0)
        expect(t.sayimlar.pdp).toBe(2)
        expect(t.sayimlar.marka).toBeGreaterThan(0)

        // Kapıda koşan yedi sınıfın hepsi üretilir ve liste yolları şemayla uyumludur.
        const k = kurallar(t, true)
        expect(k.map((x) => x.sinif).sort()).toEqual(
          ['anasayfa', 'liste', 'liste-en', 'marka', 'marka-listesi', 'pdp', 'yaprak-kategori'].sort(),
        )
        expect(k.find((x) => x.sinif === 'liste')?.yol).toBe(k3b ? '/tr/urunler' : '/tr/products')
        expect(k.find((x) => x.sinif === 'marka-listesi')?.yol).toBe(k3b ? '/tr/markalar' : '/tr/brands')
        expect(k.find((x) => x.sinif === 'liste-en')?.yol).toBe('/en/products')
      })
    })
  }
})
