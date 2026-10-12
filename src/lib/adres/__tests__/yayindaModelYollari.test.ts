/**
 * INV-YAYINDA-MODEL-8 — webhook tazeleme için model yolları (URN-31). ALTYAPI bu yol üreticisini webhook'a
 * bağlar (`tazemeYollari.ts` / route.ts bu işin dosyası DEĞİL); burada yalnız üretici ölçülür:
 *  - yollar `adresUret`'in ÜRETTİĞİ model adresleridir (biçim kopyası yok), iki dilde, sorgusuz;
 *  - yalnız yayındaki listedeki SKU'lar (sürümler dahil); liste dışı / boş liste → boş küme (var olmayan sayfayı
 *    tazelemek boş iştir, ama yanlışlıkla aile?sku= yolu üretmek tazelemeyi yanlış sayfaya vurur);
 *  - bilinmeyen SKU / aile → boş (hata fırlatmaz: webhook yolu üretici yüzünden düşmesin).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

import { adresUret } from '@/utils/adresUret'

import { aileModelYollari, skuModelYollari, yayindaModelYollari } from '../yayindaModelYollari'

const yol = (aile: string, sku: string, dil: 'tr' | 'en') => adresUret({ tur: 'model', aileSlug: aile, sku }, dil, true)

beforeEach(() => yayindaListesiAyarla({ modeller: { 'aile-a': ['AAA-100', 'AAA-200'], 'aile-b': ['BBB-1'] }, surumler: { 'AAA-101': 'AAA-100' } }))

describe('yayindaModelYollari', () => {
  it('her kayıt (sürüm dahil) × iki dil; yollar adresUret çıktısı', () => {
    const yollar = yayindaModelYollari()
    expect(yollar).toHaveLength(8)
    expect(new Set(yollar).size).toBe(8)
    for (const [aile, sku] of [['aile-a', 'AAA-100'], ['aile-a', 'AAA-200'], ['aile-b', 'BBB-1'], ['aile-a', 'AAA-101']]) {
      for (const dil of ['tr', 'en'] as const) expect(yollar).toContain(yol(aile, sku, dil))
    }
  })

  it('hiçbir yolda sorgu yok, hepsi dil önekli', () => {
    for (const y of yayindaModelYollari()) {
      expect(y).not.toContain('?')
      expect(y).toMatch(/^\/(tr|en)\//)
    }
  })

  it('FAIL-CLOSED: boş liste → boş küme', () => {
    yayindaListesiAyarla({})
    expect(yayindaModelYollari()).toEqual([])
  })
})

describe('skuModelYollari / aileModelYollari', () => {
  it('SKU → o modelin iki dildeki yolu (küçük harf girdi de çözülür)', () => {
    expect(skuModelYollari('aaa-200').sort()).toEqual([yol('aile-a', 'AAA-200', 'en'), yol('aile-a', 'AAA-200', 'tr')].sort())
  })

  it('sürüm SKU\'su kendi yollarını verir (temelinin değil)', () => {
    expect(skuModelYollari('AAA-101')).toContain(yol('aile-a', 'AAA-101', 'tr'))
    expect(skuModelYollari('AAA-101')).not.toContain(yol('aile-a', 'AAA-100', 'tr'))
  })

  it('aile → ailedeki tüm yayındaki modeller (sürüm dahil)', () => {
    expect(aileModelYollari('aile-a')).toHaveLength(6)
    expect(aileModelYollari('aile-b')).toHaveLength(2)
  })

  it('liste dışı SKU, bilinmeyen aile, boş/geçersiz girdi → boş küme (fırlatmaz)', () => {
    for (const g of ['ZZZ-9', '', '  ']) expect(skuModelYollari(g)).toEqual([])
    expect(aileModelYollari('yok-aile')).toEqual([])
    expect(aileModelYollari('')).toEqual([])
  })
})
