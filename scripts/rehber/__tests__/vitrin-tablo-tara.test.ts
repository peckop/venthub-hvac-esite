/**
 * INV-MARKA-OLGU-3 · taslak metin tablosu tarayıcısı (vitrin-genel-metin-standard.md M1–M8; BLG-7).
 *
 * Her kural SABOTAJLA sınanır: kuralı bozan satır kurulur ve tarayıcının onu yakaladığı gösterilir; temiz
 * satırın geçmesi tek başına kapının kör olmadığını söylemez. Gerçek tablo (684 satır) depoya girmez
 * (yayından önce taslak metin halka açık depoda durmaz); bu testler sentetik satırlarla çalışır.
 */
import { describe, it, expect } from 'vitest'

import kayit from '../../../docs/standards/marka-olgu-kaydi.json'
import { EN_TERIM_KALIPLARI, satirTara, tabloTara, uyariMi } from '../vitrin-tablo-tara.mjs'

type Satir = { anahtar: string; eski_tr: string; eski_en: string; yeni_tr: string; yeni_en: string; dayanak: string[]; kod_notu: string; kusur: string[] }
const ctx = {
  olguMetni: 'O12 Teklifle sipariş. O13 Ödeme kapalı. 47 ürün ailesi, 441 model. Vortice 1954.',
  sozlukMetni: 'Ürün Seçici Teklif İste Katalog',
  olguNolari: new Set(['O12', 'O13', 'O16']),
  kayit,
  garantiOlgusu: 'O16',
}
const satir = (extra: Partial<Satir> = {}): Satir => ({
  anahtar: 'a.b', eski_tr: 'Eski metin', eski_en: 'Old text', yeni_tr: 'Teklifle sipariş verilir', yeni_en: 'Orders are placed by quotation',
  dayanak: ['O12'], kod_notu: '', kusur: ['A'], ...extra,
})
const tipler = (s: Satir) => satirTara(s, ctx).map((b: { tip: string }) => b.tip)

describe('INV-MARKA-OLGU-3 · tablo tarayıcısı', () => {
  it('temiz satır bulgusuz', () => {
    expect(satirTara(satir(), ctx)).toEqual([])
  })

  it('EN-TERIM: 6 yasak yazım (boşluk, NBSP, tire varyantlarıyla) yakalanır; doğru yazım geçer', () => {
    expect(EN_TERIM_KALIPLARI).toHaveLength(6)
    for (const kotu of ['Sub Product Groups', 'Sub-categories', 'Sub  Families', 'Sub Groups', 'Technical Product Family', 'Series‑Detail', 'SUB CATEGORY']) {
      expect(tipler(satir({ yeni_en: `Browse ${kotu} here` })), kotu).toContain('EN-TERIM')
    }
    for (const iyi of ['Subcategory', 'Subcategories', 'Subcategory Detail', 'Technical Product Families', 'Explore']) {
      expect(tipler(satir({ yeni_en: `Browse ${iyi} here` })), iyi).not.toContain('EN-TERIM')
    }
  })

  it.each([
    ['dünya lideri', 'YASAK-TR', { yeni_tr: 'Sektörün dünya lideri markası' }],
    ['maksimum verim', 'YASAK-TR', { yeni_tr: 'Maksimum verim sağlar' }],
    ['stok vaadi', 'YASAK-TR', { yeni_tr: 'Stoktan hızlı teslim' }],
    ['süslü soyut (kürasyon)', 'YASAK-TR', { yeni_tr: 'Özenli kürasyon sunar' }],
    ['world-class', 'YASAK-EN', { yeni_en: 'A world-class supplier' }],
    ['Knowledge Hub (EN yayımlanmaz)', 'YASAK-EN', { yeni_en: 'Visit the Knowledge Hub' }],
  ])('yasak kalıp yakalanır: %s', (_ad, tip, extra) => {
    expect(tipler(satir(extra as Partial<Satir>))).toContain(tip)
  })

  it('"garanti" yalnız garanti olgusuna (O16) dayanan satırda serbest', () => {
    const g = satir({ yeni_tr: 'Garanti koşulları ürün belgesindedir', yeni_en: 'Warranty terms are in the product documents' })
    expect(tipler(g)).toContain('YASAK-TR')
    expect(tipler({ ...g, dayanak: ['O16'] })).not.toContain('YASAK-TR')
    expect(tipler({ ...g, dayanak: ['O16'] })).not.toContain('YASAK-EN')
  })

  it('uydurma sayı: olguda ya da eski metinde olmayan sayı yakalanır; olgudaki geçer', () => {
    expect(tipler(satir({ yeni_tr: '12 aile sunulur', yeni_en: '12 families offered' }))).toContain('DAYANAKSIZ-SAYI')
    expect(tipler(satir({ yeni_tr: '47 ürün ailesi sunulur', yeni_en: '47 product families offered' }))).not.toContain('DAYANAKSIZ-SAYI')
    expect(tipler(satir({ eski_tr: '12 aile', eski_en: '12 families', yeni_tr: '12 aile sunulur', yeni_en: '12 families offered' }))).not.toContain('DAYANAKSIZ-SAYI')
  })

  it('uydurma özel ad: bilinmeyen ad yakalanır; sözlükteki, olgudaki ve cümle başı büyük harf geçer', () => {
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Atlantis firması' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Katalog sayfası' }))).not.toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Vortice firması' }))).not.toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Atlantis ürünleri listelenir' }))).not.toContain('DAYANAKSIZ-AD')
  })

  it('M8 MARKA-OLGU: marka adı geçen satırdaki izinsiz yıl ve yüzde yakalanır', () => {
    const olgusuz = satir({ yeni_tr: "Danfoss 1959'dan beri üretir", yeni_en: 'Danfoss has produced since 1959', eski_tr: "Danfoss 1959'dan beri", eski_en: 'Danfoss since 1959' })
    expect(tipler(olgusuz)).toContain('MARKA-OLGU')
    const yuzde = satir({ yeni_tr: "Danfoss enerjiyi %90'a kadar azaltır", yeni_en: 'Danfoss cuts energy by up to 90%', eski_tr: '%90 Danfoss', eski_en: '90% Danfoss' })
    expect(tipler(yuzde)).toContain('MARKA-OLGU')
    const dogru = satir({ yeni_tr: "Danfoss 1968'den beri frekans konvertörü üretir", yeni_en: 'Danfoss has made drives since 1968', eski_tr: "Danfoss 1968'den beri", eski_en: 'Danfoss since 1968' })
    expect(tipler(dogru)).not.toContain('MARKA-OLGU')
    const markasiz = satir({ yeni_tr: "1959'dan beri üretilir", yeni_en: 'Produced since 1959', eski_tr: '1959', eski_en: '1959' })
    expect(tipler(markasiz)).not.toContain('MARKA-OLGU')
  })

  it('K10: İngilizce metinde Türkçe harf yakalanır; "Ürün Seçici" adı muaftır', () => {
    expect(tipler(satir({ yeni_en: 'Çözüm sunar' }))).toContain('K10-EN-TR-HARF')
    expect(tipler(satir({ yeni_en: 'Use the Ürün Seçici tool' }))).not.toContain('K10-EN-TR-HARF')
  })

  it('yer tutucular TR ve EN arasında eşit olmalıdır', () => {
    expect(tipler(satir({ yeni_tr: '{aile} ailesi', yeni_en: '{model} family' }))).toContain('YER-TUTUCU-FARKLI')
    expect(tipler(satir({ yeni_tr: '{aile} ailesi', yeni_en: '{aile} family' }))).not.toContain('YER-TUTUCU-FARKLI')
  })

  it('boş yeni metin: kaldırma ve "EN karşılığı kaldırılır" istisnadır, açıklamasız boşluk bulgudur', () => {
    expect(tipler(satir({ yeni_tr: '', yeni_en: '' }))).toContain('BOS-YENI')
    expect(tipler(satir({ yeni_tr: '', yeni_en: '', kod_notu: 'Alan kaldırılır' }))).not.toContain('BOS-YENI')
    expect(tipler(satir({ yeni_en: '', kod_notu: 'EN karşılığı kaldırılır (Bilgi Merkezi yalnız TR)' }))).not.toContain('BOS-YENI')
  })

  it('dayanak: yok ve geçersiz yakalanır; iddiasız beyanlı kısa etiket dayanaksız geçer', () => {
    expect(tipler(satir({ dayanak: [] }))).toContain('DAYANAK-YOK')
    expect(tipler(satir({ dayanak: ['O99'] }))).toContain('DAYANAK-GECERSIZ')
    const etiket = satir({ dayanak: [], yeni_tr: 'Marka Bilgisi', yeni_en: 'Brand Information', kod_notu: 'olgu iddiası yok' })
    expect(tipler(etiket)).not.toContain('DAYANAK-YOK')
    expect(tipler({ ...etiket, kod_notu: '' })).toContain('DAYANAK-YOK')
    const uzun = satir({ dayanak: [], yeni_tr: 'Bu uzun bir cümledir ve dokuz sözcükten fazladır kesinlikle', yeni_en: 'This is a longer sentence with clearly more than eight words in it', kod_notu: 'olgu iddiası yok' })
    expect(tipler(uzun)).toContain('DAYANAK-YOK')
  })

  it('tabloTara: yinelenen anahtar yakalanır, UYARI bulgu sayılmaz', () => {
    const b = tabloTara([satir(), satir()], ctx)
    expect(b.map((x: { tip: string }) => x.tip)).toContain('CIFT-ANAHTAR')
    const uzun = satir({ eski_tr: 'Yirmi karakterlik eski', eski_en: 'Twenty chars old text', yeni_tr: 'Teklifle sipariş verilir ve ayrıntılar teklif aşamasında netleşir', yeni_en: 'Orders are placed by quotation and details are settled at the quotation stage' })
    const uyarilar = satirTara(uzun, ctx).filter(uyariMi)
    expect(uyarilar.length).toBeGreaterThan(0)
    expect(satirTara(uzun, ctx).filter((x: { tip: string }) => !uyariMi(x))).toEqual([])
  })
})
