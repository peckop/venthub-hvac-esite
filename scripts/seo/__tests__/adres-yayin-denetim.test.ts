/**
 * INV-ADRES-YAYIN-DENETIM-1 · adres yayını arama görünürlüğü denetimi (ağ TAKLİT edilerek).
 * Cetvel: docs/standards/yayin-gorunurluk-denetim-standard.md · plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §6–§8.
 *
 * Kilitlenenler: eski adres → aynı (200) ya da tek 308 → hedef 200 temiz; zincir, geçici yönlendirme,
 * 404, yanlış hedef KIRMIZI; dilsiz eski adreste tek 307 meşru; site haritasında yönlendirme KIRMIZI;
 * model sayısı beklenenden farklıysa KIRMIZI; canonical kendini göstermiyorsa ya da hreflang eksikse KIRMIZI;
 * yönlendirme İZLENMEZ (her sıçrama ayrı istek, redirect: 'manual').
 */
import { describe, it, expect } from 'vitest'
import { haritaAyristir, sayfaEtiketleri, eskiSinifla, denetle, MODEL_DESENI } from '../adres-yayin-denetim.mjs'

type Cevap = { status: number; location?: string; body?: string }
const taklit = (tablo: Record<string, Cevap>) => {
  const cagrilar: { url: string; redirect?: string }[] = []
  const getir = async (url: string, o: { redirect?: string } = {}) => {
    cagrilar.push({ url, redirect: o.redirect })
    const c = tablo[url]
    if (!c) throw new Error(`taklitte yok: ${url}`)
    return { status: c.status, headers: { get: (h: string) => (h.toLowerCase() === 'location' ? c.location ?? null : null) }, text: async () => c.body ?? '' }
  }
  return { getir, cagrilar }
}
const T = 'https://site.test'
const sayfa = (adres: string, alt: Record<string, string>, canon = adres) =>
  `<html><head><link rel="canonical" href="${canon}">${Object.entries(alt).map(([d, h]) => `<link rel="alternate" hreflang="${d}" href="${h}">`).join('')}</head><body></body></html>`
const harita = (adresler: string[]) =>
  `<urlset>${adresler.map((a) => `<url><loc>${a}</loc><xhtml:link rel="alternate" hreflang="tr" href="${a}" /></url>`).join('')}</urlset>`

describe('INV-ADRES-YAYIN-DENETIM-1 · ayrıştırma', () => {
  it('site haritası adres ve hreflang', () => {
    const { adresler, hreflang } = haritaAyristir(harita([`${T}/tr/a`, `${T}/tr/b`]))
    expect(adresler).toEqual([`${T}/tr/a`, `${T}/tr/b`])
    expect(hreflang.get(`${T}/tr/a`)).toEqual({ tr: `${T}/tr/a` })
  })
  it('sayfa canonical + hreflang yalnız head içinden', () => {
    const e = sayfaEtiketleri(sayfa(`${T}/tr/a`, { tr: `${T}/tr/a`, en: `${T}/en/a`, 'x-default': `${T}/tr/a` }))
    expect(e.canonical).toEqual([`${T}/tr/a`])
    expect(Object.keys(e.hreflang).sort()).toEqual(['en', 'tr', 'x-default'])
  })
  it('model deseni -p-<sku>', () => {
    expect(MODEL_DESENI.test('/tr/urun/lineo-100-p-vrt-253490106xn')).toBe(true)
    expect(MODEL_DESENI.test('/tr/urun/vortice-lineo')).toBe(false)
  })
})

describe('INV-ADRES-YAYIN-DENETIM-1 · eski adres sınıfı', () => {
  it('200 → AYNI; tek 308 → hedef 200 → TEK-308; yönlendirme izlenmez', async () => {
    const { getir, cagrilar } = taklit({
      [`${T}/tr/cart`]: { status: 200 },
      [`${T}/tr/products/fc51`]: { status: 308, location: '/tr/urun/fc51' },
      [`${T}/tr/urun/fc51`]: { status: 200 },
    })
    expect((await eskiSinifla(`${T}/tr/cart`, getir)).sinif).toBe('AYNI')
    expect((await eskiSinifla(`${T}/tr/products/fc51`, getir)).sinif).toBe('TEK-308')
    expect(cagrilar.every((c) => c.redirect === 'manual')).toBe(true)
  })
  it('⭐zincir (2 sıçrama) KIRMIZI sınıf', async () => {
    const { getir } = taklit({
      [`${T}/category/fanlar`]: { status: 308, location: '/tr/category/fanlar' },
      [`${T}/tr/category/fanlar`]: { status: 308, location: '/tr/kategori/fanlar' },
      [`${T}/tr/kategori/fanlar`]: { status: 200 },
    })
    expect((await eskiSinifla(`${T}/category/fanlar`, getir)).sinif).toBe('ZINCIR')
  })
  it('dilsiz eski adreste tek 307 meşru; dilli adreste 307 GECICI', async () => {
    const { getir } = taklit({
      [`${T}/category/fanlar`]: { status: 307, location: '/tr/kategori/fanlar' },
      [`${T}/tr/kategori/fanlar`]: { status: 200 },
      [`${T}/tr/category/fans`]: { status: 307, location: '/tr/kategori/fanlar' },
    })
    expect((await eskiSinifla(`${T}/category/fanlar`, getir)).sinif).toBe('TEK-307-DILSIZ')
    expect((await eskiSinifla(`${T}/tr/category/fans`, getir)).sinif).toBe('GECICI')
  })
  it('404 → YOK; hedef haritadakinden farklı → HEDEF-YANLIS', async () => {
    const { getir } = taklit({
      [`${T}/tr/products/eski`]: { status: 404 },
      [`${T}/tr/products/fc51`]: { status: 308, location: '/tr/urun/baska' },
      [`${T}/tr/urun/baska`]: { status: 200 },
    })
    expect((await eskiSinifla(`${T}/tr/products/eski`, getir)).sinif).toBe('YOK')
    expect((await eskiSinifla(`${T}/tr/products/fc51`, getir, `${T}/tr/urun/fc51`)).sinif).toBe('HEDEF-YANLIS')
  })
})

describe('INV-ADRES-YAYIN-DENETIM-1 · uçtan uca (taklit site)', () => {
  const A = `${T}/tr/urun/fc51-p-131b0000`
  const B = `${T}/en/products/fc51-p-131b0000`
  const alt = { tr: A, en: B, 'x-default': A }
  it('temiz site → TEMIZ; model sayısı doğru', async () => {
    const { getir } = taklit({
      [`${T}/sitemap.xml`]: { status: 200, body: harita([A, B]) },
      [A]: { status: 200, body: sayfa(A, alt) },
      [B]: { status: 200, body: sayfa(B, alt) },
    })
    const s = await denetle({ taban: T, modelBeklenen: 2, sayfaDenetimi: true, getir })
    expect(s.durum).toBe('TEMIZ')
    expect(s.ozet.modelAdres).toBe(2)
  })
  it('⭐site haritasında yönlendiren adres, yanlış canonical, eksik hreflang, model sayısı → KIRMIZI', async () => {
    const C = `${T}/tr/kategori/eski`
    const { getir } = taklit({
      [`${T}/sitemap.xml`]: { status: 200, body: harita([A, B, C]) },
      [A]: { status: 200, body: sayfa(A, { tr: A, en: B }) },
      [B]: { status: 200, body: sayfa(B, alt, A) },
      [C]: { status: 308, location: '/tr/kategori/yeni' },
      [`${T}/tr/kategori/yeni`]: { status: 200 },
    })
    const s = await denetle({ taban: T, modelBeklenen: 442, sayfaDenetimi: true, getir })
    const siniflar = s.kirmizi.map((k: { sinif: string }) => k.sinif)
    expect(s.durum).toBe('KIRMIZI')
    expect(siniflar).toContain('HARITADA-YONLENDIRME')
    expect(siniflar).toContain('CANONICAL')
    expect(siniflar).toContain('HREFLANG')
    expect(siniflar).toContain('MODEL-SAYISI')
  })
  it('EN_YAYIN kapalıyken EN alternatifi haritada yoksa bilinçli bayrakla kırmızı değil, sayılır; bayraksız KIRMIZI', async () => {
    const tabloOlustur = () => taklit({
      [`${T}/sitemap.xml`]: { status: 200, body: harita([A]) },
      [A]: { status: 200, body: sayfa(A, alt) },
    })
    const bayrakli = await denetle({ taban: T, sayfaDenetimi: true, enHaritaDisiBilincli: true, getir: tabloOlustur().getir })
    expect(bayrakli.durum).toBe('TEMIZ')
    expect(bayrakli.ozet.sayfa.bilincliEn).toBe(1)
    const bayraksiz = await denetle({ taban: T, sayfaDenetimi: true, getir: tabloOlustur().getir })
    expect(bayraksiz.kirmizi.map((k: { sinif: string }) => k.sinif)).toContain('HREFLANG')
  })
  it('açılmayan site haritası KIRMIZI (durum kodu ya da ağ hatası)', async () => {
    const { getir } = taklit({ [`${T}/sitemap.xml`]: { status: 500 } })
    expect((await denetle({ taban: T, getir })).durum).toBe('KIRMIZI')
    const { getir: bos } = taklit({})
    expect((await denetle({ taban: T, getir: bos })).durum).toBe('KIRMIZI')
  })
  it('⭐ağ hatası tek adreste koşuyu çökertmez; o adres AG-HATASI/HATA olur', async () => {
    const { getir } = taklit({ [`${T}/sitemap.xml`]: { status: 200, body: harita([A]) } })
    const s = await denetle({ taban: T, getir })
    expect(s.durum).toBe('KIRMIZI')
    expect(s.kirmizi.map((k: { sinif: string }) => k.sinif).sort()).toEqual(['AG-HATASI', 'HATA'])
  })
})
