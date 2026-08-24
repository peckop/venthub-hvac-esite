import { describe, expect, it } from 'vitest'

import { selectVariant } from '../selectVariant'

/**
 * INV-SKU-PARAM-1 — eşleşmeyen `?sku=` SESSİZCE başka bir ürüne düşmez.
 *
 * Eski davranış tek satırdı: `variants.find(v => v.sku === skuParam) ?? variants[0]`.
 * Yani var olmayan bir SKU istendiğinde ailenin ilk varyantı gösteriliyor, adres çubuğu
 * istenen SKU'yu göstermeye devam ediyor ve hiçbir yerde "bulamadım" denmiyordu.
 * Kullanıcı **başka kapasitedeki bir ürünün fiyatını** kendi istediği ürün sanıyordu.
 *
 * Bu testin koruduğu ayrım: `exact` ile `stale` **aynı şey değildir**, ikisi de bir varyant
 * döndürse bile. `stale` çağırana "URL'i temizle" der; o ayrım kaybolursa kusur geri gelir.
 */

const V = (sku: string) => ({ sku })
const AILE = [V('AVE-13056'), V('AVE-13057'), V('AVE-13050')]

describe('selectVariant — INV-SKU-PARAM-1', () => {
  it('(a) sku istenmedi → default, ailenin ilk varyanti', () => {
    const r = selectVariant(AILE, null)
    expect(r.kind).toBe('default')
    expect(r.kind === 'default' && r.variant.sku).toBe('AVE-13056')
  })

  it('(b) sku istendi ve VAR → exact, tam o varyant', () => {
    const r = selectVariant(AILE, 'AVE-13057')
    expect(r.kind).toBe('exact')
    expect(r.kind === 'exact' && r.variant.sku).toBe('AVE-13057')
  })

  it('(c) ⭐sku istendi ama YOK → stale (default DEGIL), istenen sku korunur', () => {
    const r = selectVariant(AILE, 'AVE-42500')
    // Kanarya: burada 'default' ya da 'exact' donerse eski sessiz-dusme davranisi geri gelmis demektir.
    expect(r.kind).toBe('stale')
    expect(r.kind === 'stale' && r.requestedSku).toBe('AVE-42500')
    // Yine de bir varyant gosterilir — bos sayfa basmak daha kotudur.
    expect(r.kind === 'stale' && r.variant.sku).toBe('AVE-13056')
  })

  it('(d) bos/bosluk sku istenmemis sayilir → default, stale DEGIL', () => {
    for (const bos of ['', '   ', undefined, null]) {
      const r = selectVariant(AILE, bos)
      expect(r.kind).toBe('default')
    }
  })

  it('(e) ailede hic varyant yoksa → empty, istenen sku raporlanir', () => {
    const bosAile = selectVariant([], 'AVE-13056')
    expect(bosAile.kind).toBe('empty')
    expect(bosAile.kind === 'empty' && bosAile.requestedSku).toBe('AVE-13056')

    const bosAileSkusuz = selectVariant([], null)
    expect(bosAileSkusuz.kind).toBe('empty')
    expect(bosAileSkusuz.kind === 'empty' && bosAileSkusuz.requestedSku).toBeNull()
  })

  it('(f) eslesme TAM dizedir — buyuk/kucuk harf ya da on-ek eslesmesi kabul edilmez', () => {
    // Gevsek eslesme, yanlis urunu "dogru" diye gostermenin bir baska yoludur.
    expect(selectVariant(AILE, 'ave-13056').kind).toBe('stale')
    expect(selectVariant(AILE, 'AVE-1305').kind).toBe('stale')
    expect(selectVariant(AILE, 'AVE-130566').kind).toBe('stale')
  })
})
