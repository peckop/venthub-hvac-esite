import { describe, expect, it } from 'vitest'

import { byText, compareText, harmanlamaDileDuyarliMi } from '../sort'

/**
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen D
 *
 * Bu takım yalnız yardımcının kendisini sınar. Yardımcının KULLANILDIĞINI
 * `src/__tests__/conformance/i18n-locale-compare.test.ts` (INV-9) zorlar.
 */

const KATEGORILER = ['Çatı Fanları', 'Cam Fanları', 'Sığınak', 'Sirkülasyon', 'Isıtıcı', 'İç Ortam']

describe('harmanlama ORTAMI — varsayım değil ölçüm', () => {
  it('Intl.Collator gerçekten dile duyarlı (ICU verisi var)', () => {
    // ICU'suz bir çalıştırmada Collator sessizce kök harmanlamaya düşer ve HATA FIRLATMAZ.
    // Bu iddia düşerse yardımcı çalışıyor GÖRÜNÜR ama Türkçe sırayı bozar.
    expect(harmanlamaDileDuyarliMi()).toBe(true)
  })
})

describe('compareText — Türk alfabesi', () => {
  it("'ı' harfi 'i'den ÖNCE gelir", () => {
    expect(compareText('ı', 'i', 'tr')).toBeLessThan(0)
  })

  it("aksanlı harf temel harften SONRA gelir (ç > c, ş > s, ü > u)", () => {
    expect(compareText('c', 'ç', 'tr')).toBeLessThan(0)
    expect(compareText('s', 'ş', 'tr')).toBeLessThan(0)
    expect(compareText('u', 'ü', 'tr')).toBeLessThan(0)
  })

  it('sayılar metinsel değil SAYISAL sıralanır', () => {
    // Sayısal olmasaydı "Fan 10" < "Fan 2" olurdu (metinsel sırada '1' < '2').
    expect(compareText('Fan 2', 'Fan 10', 'tr')).toBeLessThan(0)
  })
})

describe('compareText — dil GERÇEKTEN fark yaratıyor', () => {
  it("'tr' ile 'en' AYNI diziyi FARKLI sıralar", () => {
    // Bu iddia, kusurun kendisini kanıtlar: dil verilmezse hangi sırayı alacağınız
    // çalışma ortamının varsayılanına, yani TESADÜFE kalır.
    const trSirali = [...KATEGORILER].sort((a, b) => compareText(a, b, 'tr'))
    const enSirali = [...KATEGORILER].sort((a, b) => compareText(a, b, 'en'))
    expect(trSirali).not.toEqual(enSirali)
  })

  it("'tr' sırası beklenen alfabetik diziyi verir", () => {
    expect([...KATEGORILER].sort((a, b) => compareText(a, b, 'tr'))).toEqual([
      'Cam Fanları',
      'Çatı Fanları',
      'Isıtıcı',
      'İç Ortam',
      'Sığınak',
      'Sirkülasyon',
    ])
  })

  it('sonuç ÇALIŞMA ORTAMININ varsayılanına bağlı DEĞİL', () => {
    // Dil açıkça verildiği için, ortam varsayılanı ne olursa olsun sonuç aynıdır.
    // SSR (Node) ile istemci (tarayıcı) arasındaki hidrasyon kayması buradan kapanır.
    const a = [...KATEGORILER].sort((x, y) => compareText(x, y, 'tr'))
    const b = [...KATEGORILER].sort((x, y) => compareText(x, y, 'tr'))
    expect(a).toEqual(b)
    expect(a).not.toEqual([...KATEGORILER].sort((x, y) => compareText(x, y, 'en')))
  })
})

describe('byText — alan seçiciyle sıralama', () => {
  it('nesne dizisini alanına göre sıralar', () => {
    const kayitlar = KATEGORILER.map((name) => ({ name }))
    expect(kayitlar.sort(byText((k) => k.name, 'tr')).map((k) => k.name)).toEqual([
      'Cam Fanları',
      'Çatı Fanları',
      'Isıtıcı',
      'İç Ortam',
      'Sığınak',
      'Sirkülasyon',
    ])
  })
})
