/**
 * INV-GSC-TABAN-1 · Search Console taban betiğinin ağsız parçaları (pazar-olcum-standard.md P2, P6).
 *
 * Kilitlenenler:
 *   1. Pencere son 3 günü (ön veri) dışarıda bırakır, istenen gün sayısı kadar geriye gider.
 *   2. Adres sınıfı: adres yayınında değişecek önekler (ürün/kategori/marka) eski ve yeni biçimde ayrı sayılır.
 *   3. Depo içi çıktı yolu tanınır (veri PUBLIC depoya girmesin — betik bu durumda git check-ignore sorar).
 *   4. Betikte sır ya da gömülü anahtar yolu yok; anahtar yalnız GSC_SA_ANAHTAR ortam değişkeninden.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { donem, sinif, sinifOzeti, depoIcinde } from '../gsc-taban.mjs'

describe('INV-GSC-TABAN-1', () => {
  it('pencere: son 3 gün dışarıda, 90 gün geriye', () => {
    expect(donem(new Date('2026-09-24T12:00:00Z'))).toEqual({ startDate: '2026-06-24', endDate: '2026-09-21' })
    expect(donem(new Date('2026-09-24T12:00:00Z'), 7)).toEqual({ startDate: '2026-09-15', endDate: '2026-09-21' })
  })
  it('adres sınıfı: bugünkü ve yayın sonrası önekler aynı sınıfta', () => {
    expect(sinif('https://venthub.com.tr/tr/products/danfoss-fc51')).toBe('urun')
    expect(sinif('https://venthub.com.tr/tr/urun/danfoss-fc51')).toBe('urun')
    expect(sinif('https://venthub.com.tr/tr/category/frekans-konvertorleri')).toBe('kategori')
    expect(sinif('https://venthub.com.tr/tr/kategori/x/y')).toBe('kategori')
    expect(sinif('https://venthub.com.tr/tr/brands/avens')).toBe('marka')
    expect(sinif('https://venthub.com.tr/tr/markalar/avens')).toBe('marka')
    expect(sinif('https://venthub.com.tr/tr/bilgi-merkezi/frekans-konvertoru')).toBe('destek')
    expect(sinif('https://venthub.com.tr/tr')).toBe('ana')
    expect(sinif('https://venthub.com.tr/')).toBe('ana')
    expect(sinif('https://venthub.com.tr/tr/contact')).toBe('diger')
    expect(sinif('https://venthub.com.tr/tr/productsxyz')).toBe('diger')
  })
  it('sınıf özeti sayar ve toplar', () => {
    const o = sinifOzeti([
      { keys: ['https://venthub.com.tr/tr/products/a'], clicks: 1, impressions: 10 },
      { keys: ['https://venthub.com.tr/tr/products/b'], clicks: 0, impressions: 5 },
      { keys: ['https://venthub.com.tr/tr'], clicks: 2, impressions: 3 },
    ])
    expect(o).toEqual({ urun: { sayfa: 2, tik: 1, gosterim: 15 }, ana: { sayfa: 1, tik: 2, gosterim: 3 } })
  })
  it('depo içi çıktı yolu tanınır, depo dışı tanınmaz', () => {
    expect(depoIcinde('C:/tmp/depo/docs/x', 'C:/tmp/depo')).toBe(true)
    expect(depoIcinde('C:/tmp/depo', 'C:/tmp/depo')).toBe(true)
    expect(depoIcinde('C:/tmp/depo-baska/x', 'C:/tmp/depo')).toBe(false)
    expect(depoIcinde('C:/Users/a/AppData/Local/Temp/x', 'C:/tmp/depo')).toBe(false)
  })
  it('betikte sır ve gömülü anahtar yolu yok', () => {
    const k = readFileSync(join(__dirname, '..', 'gsc-taban.mjs'), 'utf8')
    expect(k).not.toMatch(/private_key|BEGIN PRIVATE|gsc-anahtar\.json|USERPROFILE/)
    expect(k).toMatch(/process\.env\.GSC_SA_ANAHTAR/)
  })
})
