import { expect, test } from '@playwright/test'

/**
 * INV-DIL-DUSUSU-1 · canlı HTML kolu — EN sayfada TR gövde metni 0.
 *
 * Statik kol (`src/test/dil-dususu-yok.test.ts`) kodda çapraz dil düşüşü desenini yasaklar; bu
 * kol gerçek sunucunun ürettiği HTML'i ölçer: aynı sayfanın TR sürümündeki açıklama metni EN
 * sürümünde GÖRÜNMEZ (yüzey ya gizlenir ya kendi dilinde doludur).
 *
 * Örnek aile `avens-nimax`: 2026-09-22 ölçümünde TR açıklaması var, EN yok (47 ailenin 25'i
 * böyle). Aile adresi değişirse (K17: casals-nimax) istek 308'i izler; EN metin doldurulursa
 * test yine geçer — iddia "EN'de TR metin yok"tur, "EN'de metin yok" değil.
 */
const ORNEK_AILE = '/products/avens-nimax'
const ORNEK_KATEGORI = '/category/fanlar'

function testIdMetinleri(html: string, testId: string): string[] {
  const d = new RegExp(`data-testid="${testId}"[^>]*>([\\s\\S]*?)</(?:p|div)>`, 'g')
  return [...html.matchAll(d)]
    .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 20)
}

test.describe('INV-DIL-DUSUSU-1 — EN sayfada TR gövde metni yok', () => {
  test('ürün (aile) açıklaması', async ({ request }) => {
    const tr = await request.get(`/tr${ORNEK_AILE}`)
    expect(tr.status()).toBe(200)
    const trMetin = testIdMetinleri(await tr.text(), 'urun-aciklama')
    expect(trMetin.length, 'TR sayfada açıklama bekleniyordu — örnek aile değişmiş olabilir').toBeGreaterThan(0)

    const en = await request.get(`/en${ORNEK_AILE}`)
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    for (const parca of trMetin) expect(enHtml.includes(parca.slice(0, 60)), `EN sayfada TR metin: ${parca.slice(0, 60)}`).toBe(false)
  })

  test('kategori alt dal paragrafları', async ({ request }) => {
    const tr = await request.get(`/tr${ORNEK_KATEGORI}`)
    expect(tr.status()).toBe(200)
    const trMetin = testIdMetinleri(await tr.text(), 'alt-kategori-aciklama')
    // Boş liste = boş geçiş; ölçülecek TR metin yoksa test hiçbir şey kanıtlamaz.
    expect(trMetin.length, 'TR kategori sayfasında alt dal açıklaması bekleniyordu').toBeGreaterThan(0)

    const en = await request.get(`/en/category/fans`)
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    for (const parca of trMetin) expect(enHtml.includes(parca.slice(0, 60)), `EN sayfada TR metin: ${parca.slice(0, 60)}`).toBe(false)
  })

  // 2026-09-23 ölçümü: kategori sayfasının aile listesi {tr,en} açıklamayı gömülü veriye
  // yazıyordu — kart göstermiyordu, ekran temizdi, HTML değildi. Ekran ve gömülü katman ayrı ölçülür.
  test('kategori sayfasının gömülü aile listesi', async ({ request }) => {
    const tr = await request.get(`/tr${ORNEK_AILE}`)
    expect(tr.status()).toBe(200)
    const trMetin = testIdMetinleri(await tr.text(), 'urun-aciklama')
    expect(trMetin.length, 'TR sayfada açıklama bekleniyordu — örnek aile değişmiş olabilir').toBeGreaterThan(0)

    const en = await request.get(`/en/category/fans`)
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    for (const parca of trMetin) expect(enHtml.includes(parca.slice(0, 60)), `EN kategori sayfasında TR aile metni: ${parca.slice(0, 60)}`).toBe(false)
  })

  // URN-105 (2026-10-10): kategorinin arama sonucu alanları (`seo_title`, `seo_desc` ve `metadata.seo_*_en`)
  // yalnız sunucuda başlık/açıklama üretir. KTL-21 28 kategoriyi doldurunca bu metinler gömülü veriye (RSC
  // yükü) düştü ve yukarıdaki "alt dal paragrafları" kolu kırmızı verdi. Burada ham değerin kendisi aranır:
  // sayfanın meta etiketi bunları DOLU basar, gömülü veride ise hiç bulunmaz (kaçışlı JSON: \"seo_desc\":\"...).
  for (const yol of ['/tr', '/en', '/tr/category/fanlar', '/en/category/fans']) {
    test(`gömülü arama alanları: ${yol}`, async ({ request }) => {
      const yanit = await request.get(yol)
      expect(yanit.status()).toBe(200)
      const html = await yanit.text()
      const dolu = [...html.matchAll(/\\"seo_(?:title|desc)(?:_en)?\\":\\"([^\\]{3,})/g)].map((m) => m[0].slice(0, 80))
      expect(dolu, `${yol}: arama sonucu alanı gömülü veride: ${dolu.slice(0, 2).join(' | ')}`).toEqual([])
    })
  }
})
