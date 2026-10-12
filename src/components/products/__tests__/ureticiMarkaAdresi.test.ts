/**
 * URN-126 — üretici bloğunun marka adresi: marka ADINDAN (aile satırı slug taşımaz) dil önekli, şemaya duyarlı adres.
 * Çözülemeyen ad `null` verir; çağıran bağlantıyı HİÇ çizmez.
 */
import { describe, expect, it } from 'vitest'

import { DB_MARKALARI } from '@/data/__tests__/markaDbFiksturu'
import { adresRotalari } from '@/utils/yuzeyAdresleri'

import { ureticiMarkaAdresi } from '../ureticiMarkaAdresi'

describe('ureticiMarkaAdresi', () => {
  it('kapalı bayrak: bugünkü şema (/<dil>/brands/<slug>), iki dilde', () => {
    expect(ureticiMarkaAdresi('AVenS', 'tr', false)).toBe('/tr/brands/avens')
    expect(ureticiMarkaAdresi('AVenS', 'en', false)).toBe('/en/brands/avens')
  })

  it('açık bayrak: yeni şema (TR /tr/markalar/<slug>, EN /en/brands/<slug>)', () => {
    expect(ureticiMarkaAdresi('AVenS', 'tr', true)).toBe('/tr/markalar/avens')
    expect(ureticiMarkaAdresi('AVenS', 'en', true)).toBe('/en/brands/avens')
  })

  it('adres adres üreticisinin çıktısıdır (elle birleştirme yok): her marka × dil × bayrak', () => {
    for (const m of Object.values(DB_MARKALARI)) {
      for (const dil of ['tr', 'en'] as const) {
        for (const bayrak of [false, true]) {
          const adres = ureticiMarkaAdresi(m.ad, dil, bayrak)
          expect(adres).not.toBeNull()
          const slug = adres?.split('/').at(-1) ?? ''
          expect(adres).toBe(adresRotalari(dil, bayrak).brand(slug))
        }
      }
    }
  })

  it('ad yazımı: harf duyarsız, ayraçsız eşleşir (AVenS, avens, Nicotra Gebhardt)', () => {
    expect(ureticiMarkaAdresi('avens', 'tr', false)).toBe('/tr/brands/avens')
    expect(ureticiMarkaAdresi('Nicotra Gebhardt', 'tr', false)).toBe('/tr/brands/nicotra-gebhardt')
  })

  it.each([
    ['vitrinde olmayan marka', 'Bilinmeyen Marka'],
    ['boş dize', ''],
    ['yalnız boşluk', '   '],
    ['yalnız ayraç', '---'],
    ['null', null],
    ['undefined', undefined],
  ] as [string, string | null | undefined][])('%s → null (bağlantı çizilmez)', (_ad, ad) => {
    for (const bayrak of [false, true]) {
      expect(ureticiMarkaAdresi(ad, 'tr', bayrak)).toBeNull()
      expect(ureticiMarkaAdresi(ad, 'en', bayrak)).toBeNull()
    }
  })
})
