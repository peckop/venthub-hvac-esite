/**
 * INV-PDP-LISTE-FIYATI-1 — teklif kipinde "Liste Fiyatı" etiketi basılmaz (URN-83).
 *
 * KORUDUĞU KUSUR: ürün sayfasının "Hızlı Detaylar" kutusunda satır etiketi sabit `common.listingPrice`
 * ("Liste Fiyatı") idi, değeri ise teklif kipinde `pdp.techQuote` ("Teknik Teklif İste"). Ekranda
 * "Liste Fiyatı: Teknik Teklif İste" yazıyordu: fiyat gösterilmeyen sayfa etiketiyle fiyat varmış gibi konuşuyordu.
 * Üstteki fiyat bloğunda aynı kusur URN-60'ta düzeltilmişti (`quoteMode ? pdp.quoteLabel : pdp.priceAvailability`);
 * bu kutu o gün atlanmıştı.
 *
 * ÖLÇÜT: `t('common.listingPrice')` ürün sayfasında YALNIZ `quoteMode ? t('pdp.quoteLabel') : t('common.listingPrice')`
 * kalıbının içinde geçer. Yorumlar atılır (kural yalnız yorumda anılırsa uygulanmaz).
 *
 * NE ÖLÇMEZ: ekranda gerçekten ne çizildiğini (sayfa bileşeni render edilmez; ağır bağımlılığı var) ve
 * `quoteMode` değerinin doğru hesaplandığını (o kapı `INV-FIYAT-SIZINTI-1`).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

const PDP = path.join(process.cwd(), 'src', 'app', '_components', 'ProductDetailPageView.tsx')

/** Blok ve satır yorumlarını atar (JSX `{/* ... *\/}` yorumları dahil: süslü parantez kalır, içerik gider). */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const KAYNAK = govde(fs.readFileSync(PDP, 'utf8'))

const KORUMALI = /quoteMode\s*\?\s*t\('pdp\.quoteLabel'\)\s*:\s*t\('common\.listingPrice'\)/g
const CIPLAK_VEYA_KORUMALI = /t\('common\.listingPrice'\)/g

describe('INV-PDP-LISTE-FIYATI-1 — "Liste Fiyatı" etiketi teklif kipinde çıkmaz', () => {
  it('ÖLÇÜM KONTROLÜ: ürün sayfası okundu ve fiyat etiketlerini içeriyor (sahte-yeşil muhafızı)', () => {
    expect(KAYNAK).toContain("t('pdp.techQuote')")
    expect(KAYNAK).toContain("t('pdp.quoteLabel')")
  })

  it('"Liste Fiyatı" etiketi quoteMode ile korunuyor: teklif kipinde pdp.quoteLabel basılır', () => {
    expect(
      (KAYNAK.match(KORUMALI) ?? []).length,
      "Hızlı Detaylar kutusunda `quoteMode ? t('pdp.quoteLabel') : t('common.listingPrice')` yok: teklif kipinde " +
        '"Liste Fiyatı: Teknik Teklif İste" çelişkisi geri gelir.',
    ).toBeGreaterThanOrEqual(1)
  })

  it('common.listingPrice koşulsuz (çıplak) kullanılmaz: her kullanım korumalı kalıbın içinde', () => {
    const tumu = (KAYNAK.match(CIPLAK_VEYA_KORUMALI) ?? []).length
    const korumali = (KAYNAK.match(KORUMALI) ?? []).length
    expect(tumu, 'common.listingPrice hiç kullanılmıyor: ölçüt kör').toBeGreaterThanOrEqual(1)
    expect(tumu, 'common.listingPrice korumasız bir yerde de basılıyor (quoteMode dışı)').toBe(korumali)
  })

  it('teklif kipi etiketi "fiyat" demez; "Liste Fiyatı" metninin kendisi değişmedi', () => {
    // TR ve EN: teklif etiketi fiyat vaadi taşımaz.
    expect(tr.pdp.quoteLabel).not.toMatch(/fiyat/i)
    expect(en.pdp.quoteLabel).not.toMatch(/price/i)
    // Etiketin fiyat kipindeki metni DEĞİŞMEZ (yalnız koşulu eklendi, sözlük metni olduğu gibi).
    expect(tr.common.listingPrice).toBe('Liste Fiyatı')
    expect(en.common.listingPrice).toBe('List Price')
  })
})
