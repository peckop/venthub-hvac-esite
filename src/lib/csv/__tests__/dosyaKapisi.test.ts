import { describe, expect, it } from 'vitest'

import { CSV_HATA_ANAHTARI, CSV_MAKS_BAYT, csvDosyasiDenetle, csvDosyasiOku } from '../dosyaKapisi'

/**
 * ADM-6 — içe aktarma dosya kapısı. Eski hâl: `<input accept=".csv">` dışında hiçbir denetim
 * yoktu (accept yalnız tarayıcı ipucudur; dosya seçicide "tüm dosyalar" seçilince aşılır).
 * Boyut ve satır sınırı olmadığı için 200 MB'lık bir dosya sekmeyi kilitler, binlerce SKU tek
 * `in(...)` sorgusuna gider.
 */

const dosya = (ad: string, icerik: string, tur = 'text/csv') => new File([icerik], ad, { type: tur })

describe('csvDosyasiDenetle', () => {
  it('geçerli .csv kabul edilir (büyük harf uzantı dahil)', () => {
    expect(csvDosyasiDenetle({ name: 'stok.csv', size: 10, type: 'text/csv' })).toBeNull()
    expect(csvDosyasiDenetle({ name: 'STOK.CSV', size: 10, type: '' })).toBeNull()
    // Windows Excel CSV'yi bu türle bildirir
    expect(csvDosyasiDenetle({ name: 'stok.csv', size: 10, type: 'application/vnd.ms-excel' })).toBeNull()
  })

  it('uzantı .csv değilse reddedilir', () => {
    expect(csvDosyasiDenetle({ name: 'stok.xlsx', size: 10, type: '' })).toBe('uzanti')
    expect(csvDosyasiDenetle({ name: 'stok.csv.exe', size: 10, type: '' })).toBe('uzanti')
    expect(csvDosyasiDenetle({ name: 'csv', size: 10, type: '' })).toBe('uzanti')
  })

  it('beyan edilen tür metin dışıysa reddedilir', () => {
    expect(csvDosyasiDenetle({ name: 'stok.csv', size: 10, type: 'application/x-msdownload' })).toBe('tur')
    expect(csvDosyasiDenetle({ name: 'stok.csv', size: 10, type: 'image/png' })).toBe('tur')
  })

  it('boyut sınırı: tam sınır geçer, bir bayt fazlası reddedilir; boş dosya reddedilir', () => {
    expect(csvDosyasiDenetle({ name: 'a.csv', size: CSV_MAKS_BAYT, type: '' })).toBeNull()
    expect(csvDosyasiDenetle({ name: 'a.csv', size: CSV_MAKS_BAYT + 1, type: '' })).toBe('boyut')
    expect(csvDosyasiDenetle({ name: 'a.csv', size: 0, type: '' })).toBe('bos')
  })
})

describe('csvDosyasiOku — kapı + ayrıştırma tek çağrıda', () => {
  it('geçerli dosya ayrıştırılır', async () => {
    const s = await csvDosyasiOku(dosya('a.csv', 'sku,qty\nA-1,4'))
    expect(s.ok && s.satirlar).toEqual([{ sku: 'A-1', qty: '4' }])
  })

  it('uzantı hatası dosya OKUNMADAN döner', async () => {
    const s = await csvDosyasiOku(dosya('a.txt', 'sku\nA'))
    expect(s).toEqual({ ok: false, hata: 'uzanti' })
  })

  it('satır sınırı çağırandan gelir', async () => {
    const s = await csvDosyasiOku(dosya('a.csv', 'sku\n1\n2\n3'), 2)
    expect(s).toEqual({ ok: false, hata: 'cokSatir' })
  })

  it('her hata kodunun sözlük anahtarı vardır', () => {
    for (const anahtar of Object.values(CSV_HATA_ANAHTARI)) {
      expect(anahtar).toMatch(/^admin\.dataTable\.csvImport\.[a-zA-Z]+$/)
    }
    expect(Object.keys(CSV_HATA_ANAHTARI).sort()).toEqual(
      ['bos', 'boyut', 'cokSatir', 'kapanmamisTirnak', 'tekrarBaslik', 'tur', 'uzanti'].sort(),
    )
  })
})
