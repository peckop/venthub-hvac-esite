import { describe, expect, it } from 'vitest'

import { stokSatirlariniHazirla, urunSatiriDogrula } from '../semalar'

/**
 * ADM-6 — içe aktarılan satırın şema doğrulaması (zod). Eski hâl: `status` hücresi
 * `as` ile türe zorlanıyordu, `stock_qty` `Number()` ile NaN/negatif olabiliyordu, stok
 * miktarı negatifse sessizce 0'a kırpılıyordu, SKU biçimi hiç denetlenmiyordu.
 */

describe('urunSatiriDogrula', () => {
  it('geçerli satır: boş hücreler yok sayılır, sayılar tamsayıya çevrilir', () => {
    const s = urunSatiriDogrula({ sku: ' A-1 ', name: ' Fan ', status: 'active', stock_qty: '4', brand: '', price: '9' })
    expect(s).toEqual({ ok: true, veri: { sku: 'A-1', name: 'Fan', status: 'active', stock_qty: 4 } })
  })

  it.each([
    [{ sku: 'a-1', name: 'Fan' }, 'sku'],
    [{ sku: 'A 1', name: 'Fan' }, 'sku'],
    [{ sku: 'A-1', name: 'x'.repeat(301) }, 'name'],
    [{ sku: 'A-1', name: 'Fan', status: 'yayinda' }, 'status'],
    [{ sku: 'A-1', name: 'Fan', stock_qty: '-3' }, 'stock_qty'],
    [{ sku: 'A-1', name: 'Fan', stock_qty: '2.5' }, 'stock_qty'],
    [{ sku: 'A-1', name: 'Fan', stock_qty: 'NaN' }, 'stock_qty'],
    [{ sku: 'A-1', name: 'Fan', low_stock_threshold: '1e9' }, 'low_stock_threshold'],
  ])('%j → %s alanı geçersiz', (satir, alan) => {
    const s = urunSatiriDogrula(satir)
    expect(s.ok).toBe(false)
    if (!s.ok) expect(s.alan).toBe(alan)
  })
})

describe('stokSatirlariniHazirla', () => {
  it('qty / quantity / stock / new_stock sütun adlarından birini kabul eder', () => {
    for (const ad of ['qty', 'quantity', 'stock', 'new_stock']) {
      const s = stokSatirlariniHazirla([ad, 'sku'], [{ sku: 'A-1', [ad]: '7' }], [2])
      expect(s).toEqual({ ok: true, satirlar: [{ line: 2, sku: 'A-1', newQty: 7 }], hatalar: [] })
    }
  })

  it('sku ya da miktar sütunu yoksa eksikSutun', () => {
    expect(stokSatirlariniHazirla(['sku'], [{ sku: 'A' }], [2])).toEqual({ ok: false, hata: 'eksikSutun' })
  })

  it('geçersiz satırlar satır numarası ve sözlük anahtarıyla hatalara düşer', () => {
    const s = stokSatirlariniHazirla(
      ['sku', 'qty'],
      [
        { sku: '', qty: '1' },
        { sku: 'A-1', qty: 'on' },
        { sku: 'A-2', qty: '-4' },
        { sku: 'A-3', qty: '2000000' },
        { sku: 'kucuk', qty: '1' },
        { sku: 'A-4', qty: '3' },
      ],
      [2, 3, 4, 5, 6, 7],
    )
    expect(s).toEqual({
      ok: true,
      satirlar: [{ line: 7, sku: 'A-4', newQty: 3 }],
      hatalar: [
        { line: 2, sku: '', kod: 'missingSku' },
        { line: 3, sku: 'A-1', kod: 'qtyMustBeNumber' },
        { line: 4, sku: 'A-2', kod: 'qtyOutOfRange' },
        { line: 5, sku: 'A-3', kod: 'qtyOutOfRange' },
        { line: 6, sku: 'kucuk', kod: 'invalidSku' },
      ],
    })
  })
})

/** ADM-7 — #2202 incelemesinde çıkan stok içe aktarma bulguları. */
describe('stokSatirlariniHazirla — ADM-7', () => {
  it('aynı SKU iki kez geçerse HİÇBİRİ uygulanmaz; her satırı duplicateSku hatası olur (madde 2)', () => {
    const s = stokSatirlariniHazirla(
      ['sku', 'qty'],
      [
        { sku: 'A-1', qty: '5' },
        { sku: 'A-2', qty: '3' },
        { sku: 'A-3', qty: 'on' },
        { sku: ' A-1 ', qty: '9' },
      ],
      [2, 3, 4, 5],
    )
    expect(s).toEqual({
      ok: true,
      satirlar: [{ line: 3, sku: 'A-2', newQty: 3 }],
      hatalar: [
        { line: 2, sku: 'A-1', kod: 'duplicateSku' },
        { line: 4, sku: 'A-3', kod: 'qtyMustBeNumber' },
        { line: 5, sku: 'A-1', kod: 'duplicateSku' },
      ],
    })
  })

  it('tekrar, miktarı geçersiz satırla olsa da sayılır (hangisi kastedildi belli değil)', () => {
    const s = stokSatirlariniHazirla(['sku', 'qty'], [{ sku: 'A-1', qty: '5' }, { sku: 'A-1', qty: 'x' }], [2, 3])
    expect(s).toEqual({
      ok: true,
      satirlar: [],
      hatalar: [
        { line: 2, sku: 'A-1', kod: 'duplicateSku' },
        { line: 3, sku: 'A-1', kod: 'duplicateSku' },
      ],
    })
  })

  it.each([
    ['0x10', 'qtyMustBeNumber'],
    ['1e3', 'qtyMustBeNumber'],
    ['Infinity', 'qtyMustBeNumber'],
    ['1 2', 'qtyMustBeNumber'],
    ['5.0', 'qtyOutOfRange'],
    ['2,5', 'qtyOutOfRange'],
    ['+4', 'qtyOutOfRange'],
    ['-0', 'qtyOutOfRange'],
  ])('miktar %j → %s; ürün şemasıyla aynı desen (madde 3)', (qty, kod) => {
    const s = stokSatirlariniHazirla(['sku', 'qty'], [{ sku: 'A-1', qty }], [2])
    expect(s).toEqual({ ok: true, satirlar: [], hatalar: [{ line: 2, sku: 'A-1', kod }] })
  })

  it('kırpılmış tam sayı kabul edilir (ürün şemasıyla aynı)', () => {
    const s = stokSatirlariniHazirla(['sku', 'qty'], [{ sku: 'A-1', qty: ' 007 ' }], [2])
    expect(s.ok && s.satirlar).toEqual([{ line: 2, sku: 'A-1', newQty: 7 }])
  })
})
