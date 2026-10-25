import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-SITEMAP-YASAL-1 (URN-140, OPS emri SEO-61) — dizine KAPALI yasal sayfa site haritasında ilan edilmez.
 *
 * NİÇİN VAR (canlı ölçüm 25 Ekim): `/legal/kvkk`, `/legal/gizlilik-politikasi`, `/legal/cerez-politikasi` hem
 * canlı sitemap.xml'de duruyordu hem `noindex, follow` basıyordu (URN-97). Google'a "tara ve dizine al" diyen satır ile
 * "dizine alma" diyen robots birbirini çürütür; Search Console "gönderildi ama noindex" hatası üretir
 * (aynı kural `/cart` için PR-1'de uygulanmıştı). Harita artık sayfanın robots'unu veren İŞLEVDEN
 * (`yasalDizinDisi`) okur: taslakken satır yok, hukukçu teyidi ve satıcı bilgileri tamamlanınca kendiliğinden geri gelir.
 *
 * KAPI İKİ DURUMU DA ÖLÇER (tek kollu kapı "her zaman çıkar" sabotajını geçirirdi): (1) dizin dışı → hiçbir dilde yasal
 * satır yok, öteki statik satırlar yerinde; (2) dizine açık → üç sayfa × dil satırı alternates ile geri gelir;
 * (3) mock'suz gerçek yapılandırma: harita, sayfanın kullandığı `yasalDizinDisi()` ile aynı kararı verir.
 * ÖLÇMEDİĞİ: canlı sitemap.xml (birleşme sonrası tarayıcı bölmesiyle ayrıca ölçülür), Google'ın dizinden çıkarışı (GSC).
 */
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }] }),
  },
}))
vi.mock('@/lib/services/category.service', () => ({
  getCategories: async () => [
    { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
  ],
}))
vi.mock('@/lib/services/family.service', () => ({
  getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
  getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
  getBrandFamilyCount: async () => 5,
}))

const YASAL = /\/(legal|yasal)\//
const UC_SAYFA = ['kvkk', 'gizlilik-politikasi', 'cerez-politikasi']

type Durum = { dizinDisi: boolean | 'gercek'; enYayin: boolean }

async function harita({ dizinDisi, enYayin }: Durum) {
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: enYayin,
    ADRES_SEMASI_K3B: false,
  }))
  if (dizinDisi !== 'gercek') {
    vi.doMock('@/config/legal', async (orijinal) => ({
      ...(await orijinal<typeof import('@/config/legal')>()),
      yasalDizinDisi: () => dizinDisi,
    }))
  }
  const { SITE_URL } = await import('../../config/siteUrl')
  const { default: sitemap } = await import('../sitemap')
  const satirlar = await sitemap()
  return { satirlar, base: SITE_URL }
}

describe('INV-SITEMAP-YASAL-1 — yasal sayfalar haritada yalnız dizine açıkken', () => {
  afterEach(() => {
    vi.doUnmock('@/config/features')
    vi.doUnmock('@/config/legal')
    vi.resetModules()
  })

  it.each([false, true])('dizin DIŞI (taslak): hiçbir dilde yasal satır yok; öteki statik satırlar yerinde (EN_YAYIN %s)', async (enYayin) => {
    const { satirlar, base } = await harita({ dizinDisi: true, enYayin })
    const yasal = satirlar.filter((s) => YASAL.test(s.url))
    expect(yasal.map((s) => s.url)).toEqual([])
    // Hiçbir satırın hreflang eşi de yasal sayfayı göstermez (alternates içinde kalıntı yok).
    expect(JSON.stringify(satirlar.map((s) => s.alternates ?? null))).not.toMatch(YASAL)
    // Aşırı düzeltme yok: yasal olmayan statik satırlar duruyor.
    const yollar = satirlar.map((s) => s.url.replace(base, ''))
    expect(yollar).toContain('/tr/contact')
    expect(yollar).toContain('/tr/about')
    expect(yollar).toContain('/tr/urun-secici')
    if (enYayin) expect(yollar).toContain('/en/contact')
  })

  it('dizine AÇIK (hukukçu teyidi + satıcı bilgileri tamam), EN_YAYIN kapalı: üç TR satırı geri gelir', async () => {
    const { satirlar, base } = await harita({ dizinDisi: false, enYayin: false })
    const yollar = satirlar.map((s) => s.url.replace(base, '')).filter((y) => YASAL.test(y))
    expect(yollar).toEqual(UC_SAYFA.map((s) => `/tr/legal/${s}`))
  })

  it('dizine AÇIK, EN_YAYIN açık: üç sayfa × iki dil = 6 satır, her biri hreflang eşiyle', async () => {
    const { satirlar, base } = await harita({ dizinDisi: false, enYayin: true })
    const yasal = satirlar.filter((s) => YASAL.test(s.url))
    expect(yasal.map((s) => s.url.replace(base, '')).sort()).toEqual(
      ['tr', 'en'].flatMap((dil) => UC_SAYFA.map((s) => `/${dil}/legal/${s}`)).sort(),
    )
    for (const satir of yasal) expect(satir.alternates, satir.url).toBeDefined()
  })

  it('gerçek yapılandırma: harita sayfanın robots kararıyla AYNI işlevden okur (ayrışamaz)', async () => {
    const { yasalDizinDisi } = await import('@/config/legal')
    const { satirlar } = await harita({ dizinDisi: 'gercek', enYayin: false })
    const yasalVar = satirlar.some((s) => YASAL.test(s.url))
    expect(yasalVar).toBe(!yasalDizinDisi())
  })
})
