/**
 * CSV içe aktarımı emekli `products.price` alanına YAZMAZ, ama fiyat sütununu SESSİZCE de yutmaz.
 *
 * NİÇİN VAR (2026-09-24, REC-182 yan bulgusu): `hazirlaUrunSatirlari` CSV'deki `price` hücresini
 * `products.price`'a koyuyordu. Vitrin o alanı okumuyor (satış fiyatı `product_prices`'tan, fiyat
 * motorundan gelir); cetvel de "TL gömme YOK" diyor (csv-import-export-standard). Sonuç: kullanıcı
 * fiyat yüklediğini sanıyor, vitrin değişmiyordu. Yönetici tablosunun aynı kusuru aynı gün kapandı.
 */
import { describe, expect, it } from 'vitest'

import { hazirlaUrunSatirlari } from '../csvProductMapping'

const KATEGORI = [{ id: 'c1', name: 'Fanlar', slug: 'fans' }]

describe('CSV içe aktarımında fiyat sütunu', () => {
  it('price dolu olsa da yazım nesnesine GİRMEZ', () => {
    const { payloads } = hazirlaUrunSatirlari(
      [{ sku: 'A-1', name: 'Kanal Fanı', price: '1999.90', stock_qty: '4', category_slug: 'fans' }],
      KATEGORI,
    )
    expect(payloads).toHaveLength(1)
    expect(payloads[0]).not.toHaveProperty('price')
    // aynı satırın öteki alanları yazılmaya devam eder
    expect(payloads[0]).toMatchObject({ sku: 'A-1', stock_qty: 4, category_id: 'c1' })
  })

  it('yok sayılan fiyat hücreleri SAYILIR (çağıran kullanıcıya gösterir)', () => {
    const { yoksayilanFiyat } = hazirlaUrunSatirlari(
      [
        { sku: 'A-1', name: 'Bir', price: '10' },
        { sku: 'A-2', name: 'İki', price: '' },
        { sku: 'A-3', name: 'Üç', price: '  ' },
        { sku: 'A-4', name: 'Dört' },
        { sku: 'A-5', name: 'Beş', price: '0' },
      ],
      KATEGORI,
    )
    // boş ve yalnız boşluk sayılmaz; "0" bir değerdir, sayılır
    expect(yoksayilanFiyat).toBe(2)
  })

  it('fiyat sütunu yoksa sayaç sıfır', () => {
    const { yoksayilanFiyat } = hazirlaUrunSatirlari([{ sku: 'A-1', name: 'Bir' }], KATEGORI)
    expect(yoksayilanFiyat).toBe(0)
  })
})
