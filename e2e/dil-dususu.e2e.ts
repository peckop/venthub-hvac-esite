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

    const en = await request.get(`/en/category/fans`)
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    for (const parca of trMetin) expect(enHtml.includes(parca.slice(0, 60)), `EN sayfada TR metin: ${parca.slice(0, 60)}`).toBe(false)
  })
})
