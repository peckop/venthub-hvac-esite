/**
 * INV-MARKA-OLGU-3 · taslak metin tablosu tarayıcısı (vitrin-genel-metin-standard.md M1–M8; BLG-7).
 *
 * Her kural SABOTAJLA sınanır: kuralı bozan satır kurulur ve tarayıcının onu yakaladığı gösterilir; temiz
 * satırın geçmesi tek başına kapının kör olmadığını söylemez. Gerçek tablo (684 satır) depoya girmez
 * (yayından önce taslak metin halka açık depoda durmaz); bu testler sentetik satırlarla çalışır.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, it, expect } from 'vitest'

import kayit from '../../../docs/standards/marka-olgu-kaydi.json'
import { EN_TERIM_KALIPLARI, satirTara, tabloTara, uyariMi } from '../vitrin-tablo-tara.mjs'

type Satir = { anahtar: string; eski_tr: string; eski_en: string; yeni_tr: string; yeni_en: string; dayanak: string[]; kod_notu: string; kusur: string[] }
const ctx = {
  olguMetni: 'O12 Teklifle sipariş. O13 Ödeme kapalı. 47 ürün ailesi, 441 model. Vortice 1954.',
  sozlukMetni: 'Ürün Seçici Teklif İste Katalog Katalogu Orders',
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

  it('uydurma özel ad: bilinmeyen ad yakalanır (cümle başında da); sözlükteki, olgudaki ve çekimli biçim geçer', () => {
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Atlantis firması' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Katalog sayfası' }))).not.toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Vortice firması' }))).not.toContain('DAYANAKSIZ-AD')
    // BLG-7 onarımı: cümle başı artık ATLANMAZ (ilk sürümde "Atlantis ürünleri listelenir" geçiyordu).
    expect(tipler(satir({ yeni_tr: 'Atlantis ürünleri listelenir' }))).toContain('DAYANAKSIZ-AD')
    // Çekim eki: "Teklifle" ↔ "teklif", "Katalog" ↔ "katalogu" (öne ek gövdesi); ama alt dize ("kat" ⊂ "katalog") sayılmaz.
    expect(tipler(satir({ yeni_tr: 'Teklifle sipariş verilir' }))).not.toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Ürünleri sunan Kat firması' }))).toContain('DAYANAKSIZ-AD')
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

/**
 * BLG-7 ONARIM SABOTAJLARI (10-09 bağımsız çürütme: 46 girişimden 40'ı geçmişti). Her kök sebep (A–Q harfleri
 * çürütme raporundakiyle aynı) için kuralı atlatan girdi kurulur ve ONARILMIŞ kapının onu yakaladığı gösterilir.
 */
describe('INV-MARKA-OLGU-3 · onarım sabotajları (BLG-7 çürütme A–J, L, O, P, G)', () => {
  const marka = { ...ctx.kayit }

  it('A+B: İ/I katlaması, NBSP, sıfır genişlikli karakter ve bölünmüş boşluk yasak kalıbı ATLATMAZ', () => {
    for (const tr of ['EN İYİ fiyat', 'EN IYI fiyat', 'en iyi fiyat', 'e​n iyi fiyat', 'en ​ iyi fiyat', 'en   iyi fiyat', 'Teklifle ONAYLI satış', 'teklifle onayli satis']) {
      expect(tipler(satir({ yeni_tr: tr })), tr).toContain('YASAK-TR')
    }
    for (const en of ['The BEST unit', 'the best unit', 'Orders are PREMİUM', 'A world class supplier']) {
      expect(tipler(satir({ yeni_en: en })), en).toContain('YASAK-EN')
    }
  })

  it('H: NFD ve ASCII yazılmış Türkçe EN metinde K10 bulgusudur; "Ürün Seçici" muaf', () => {
    expect(tipler(satir({ yeni_en: 'Çözüm sunar' }))).toContain('K10-EN-TR-HARF') // C + birleştirici cedilla
    expect(tipler(satir({ yeni_en: 'Urunler icin teklif' }))).toContain('K10-EN-TR-HARF')
    expect(tipler(satir({ yeni_en: 'Use the Ürün Seçici tool' }))).not.toContain('K10-EN-TR-HARF')
  })

  it('F: tümü büyük harfli satır, başlık biçimi, apostroflu ve kıvrık tırnaklı özel ad ATLATMAZ', () => {
    expect(tipler(satir({ yeni_tr: 'ATLANTIS FANLARI', yeni_en: 'ATLANTIS FANS' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Atlantis Fanları Listesi', yeni_en: 'Atlantis Fan List' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: "Atlantis'in ürünleri teklifle sunulur" }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Teklifle ‘Atlantis’ ürünleri sunulur' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Teklifle sunulan “Atlantis” serisi' }))).toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Teklifle sunulan Atlantis-Pro serisi' }))).toContain('DAYANAKSIZ-AD')
    // Karşı kol: bilinen ad apostroflu ve tırnaklı yazılsa da geçer.
    expect(tipler(satir({ yeni_tr: "Vortice'nin ürünleri teklifle sunulur" }))).not.toContain('DAYANAKSIZ-AD')
    expect(tipler(satir({ yeni_tr: 'Teklifle ‘Vortice’ ürünleri sunulur' }))).not.toContain('DAYANAKSIZ-AD')
  })

  it('C+D: İngilizce ve Türkçe vaat listesi simetrik; "ömür boyu / lifetime" garanti olgusuyla bile yazılamaz', () => {
    const en = ['Parts in stock', 'Delivered within minutes', 'Ask our team', 'Decades of experience', 'Lifetime support', 'Three layers of filters', 'Expert engineers', 'The No. 1 choice']
    for (const e of en) expect(tipler(satir({ yeni_en: e })), e).toContain('YASAK-EN')
    const tr = ['Ömür boyu destek', 'Yılın deneyimiyle', 'Ekibimiz yanınızda', 'Sektörde No. 1 seçim', 'Numara bir marka']
    for (const t of tr) expect(tipler(satir({ yeni_tr: t })), t).toContain('YASAK-TR')
    expect(tipler(satir({ yeni_tr: 'Ömür boyu garanti', yeni_en: 'Lifetime warranty', dayanak: ['O16'] }))).toEqual(expect.arrayContaining(['YASAK-TR', 'YASAK-EN']))
  })

  it('O+G+P: yıl ve yüzde biçimleri, alan bağlamı ve takma adlar marka kaydını ATLATMAZ', () => {
    const k = (yeni_tr: string, yeni_en = 'Orders are placed by quotation') => satir({ yeni_tr, yeni_en, eski_tr: '', eski_en: '' })
    // O: biçim çeşitleri
    expect(tipler(k("Danfoss 1969'den beri üretir"))).toContain('MARKA-OLGU')
    expect(tipler(k('Danfoss 1969den beri üretir'))).toContain('MARKA-OLGU')
    expect(tipler(k('Danfoss yüzde 95 tasarruf der'))).toContain('MARKA-OLGU')
    expect(tipler(k('Teklifle', 'Danfoss claims 95 percent savings'))).toContain('MARKA-OLGU')
    // P: kuruluş yılı ile faaliyet başlangıcı AYRI olgudur (Vortice: founded DOGRULANAMADI, faaliyetBaslangici 1954)
    expect(tipler(k("Vortice 1954'te kuruldu"))).toContain('MARKA-OLGU')
    expect(tipler(k('Teklifle', 'Vortice was founded in 1954'))).toContain('MARKA-OLGU')
    expect(tipler(k("Vortice 1954'ten beri faaliyette"))).not.toContain('MARKA-OLGU')
    expect(tipler(k('Teklifle', 'Vortice has operated since 1954'))).not.toContain('MARKA-OLGU')
    // Danfoss: kuruluş 1933, frekans konvertörü üretimi 1968 — karışırsa kırmızı
    expect(tipler(k("Danfoss 1968'de kuruldu"))).toContain('MARKA-OLGU')
    expect(tipler(k("Danfoss 1933'te kuruldu"))).not.toContain('MARKA-OLGU')
    // G: markanın tam adı yazılmadan takma adla yazılan satır
    expect(tipler(k("Gebhardt 1959'dan beri üretir"))).toContain('MARKA-OLGU')
    expect(tipler(k("Nicotra-Gebhardt 1959'dan beri üretir"))).toContain('MARKA-OLGU')
    expect(marka.markalar['nicotra-gebhardt']).toBeTruthy()
  })

  it('I: yer tutucu büyük harf, rakam ve tire alır; süslü parantez içi serbest metin YASAK taramasından kaçmaz', () => {
    const e = tipler(satir({ yeni_tr: '{AILE_1} ailesi', yeni_en: '{AILE_1} family' }))
    expect(e).not.toContain('YER-TUTUCU-FARKLI')
    expect(tipler(satir({ yeni_tr: '{AILE_1} ailesi', yeni_en: '{AILE_2} family' }))).toContain('YER-TUTUCU-FARKLI')
    expect(tipler(satir({ yeni_tr: 'Teklifle {{en iyi}} fiyat' }))).toContain('YASAK-TR')
    expect(tipler(satir({ yeni_tr: '{{ aile }} ailesi', yeni_en: '{{aile}} family' }))).not.toContain('YER-TUTUCU-FARKLI')
  })

  it('J: yalnız boşluktan oluşan metin boş sayılır; "kaldırılmayacak" kaldırma beyanı değildir, "kaldırılmalı" beyandır', () => {
    expect(tipler(satir({ yeni_tr: '   ', yeni_en: ' ' }))).toContain('BOS-YENI')
    expect(tipler(satir({ yeni_tr: '', yeni_en: '', kod_notu: 'Bu alan kaldırılmayacak, metin sonra yazılacak' }))).toContain('BOS-YENI')
    expect(tipler(satir({ yeni_tr: '', yeni_en: '', kod_notu: 'Alan silinmez' }))).toContain('BOS-YENI')
    expect(tipler(satir({ yeni_tr: '', yeni_en: '', kod_notu: 'Kart gizlenmeli ve kaldırılmalı', dayanak: [] }))).not.toContain('BOS-YENI')
    expect(tipler(satir({ yeni_tr: '', yeni_en: '', kod_notu: 'Alan kaldırılır', dayanak: [] }))).not.toContain('BOS-YENI')
  })

  it('E: sayı, eski metinde alt dize olarak geçse de dayanak sayılmaz', () => {
    const s = satir({ eski_tr: '1215 model', eski_en: '1215 models', yeni_tr: '12 aile sunulur', yeni_en: '12 families offered' })
    expect(tipler(s)).toContain('DAYANAKSIZ-SAYI')
  })
})

describe('INV-MARKA-OLGU-3 · CLI: sessiz kapanma yok (BLG-7 çürütme L)', () => {
  const betik = resolve(__dirname, '..', 'vitrin-tablo-tara.mjs').replace(/\\/g, '/')
  const dizin = mkdtempSync(join(tmpdir(), 'vitrin-tara-'))
  const tablo = join(dizin, 'tablo.json')
  const olgu = join(dizin, 'olgu.md')
  const sozluk = join(dizin, 'sozluk.json')
  writeFileSync(tablo, JSON.stringify({ satirlar: [{ anahtar: 'a.b', eski_tr: 'x', eski_en: 'x', yeni_tr: 'Teklifle sipariş verilir', yeni_en: 'Orders are placed', dayanak: ['O12'], kod_notu: '', kusur: [] }] }))
  writeFileSync(olgu, 'O12 Teklifle sipariş. Orders are placed')
  writeFileSync(sozluk, JSON.stringify({ a: 'Teklif Orders placed' }))
  const calistir = (...args: string[]) => spawnSync(process.execPath, [betik, ...args], { encoding: 'utf8' })

  it('kayıt dosyası yoksa HATA (çıkış 2); bilerek atlama bayrağı uyarı basar', () => {
    const yok = join(dizin, 'yok.json')
    const r = calistir(tablo, '--olgu', olgu, '--sozluk', sozluk, sozluk, '--kayit', yok)
    expect(r.status).toBe(2)
    expect(r.stderr).toMatch(/kaydı bulunamadı/)
    const atla = calistir(tablo, '--olgu', olgu, '--sozluk', sozluk, sozluk, '--kayitsiz')
    expect(atla.status).toBe(0)
    expect(atla.stdout).toMatch(/M8-ATLANDI/)
  })

  it('olgu ya da sözlük dosyası yoksa ya da verilmediyse HATA (çıkış 2); "bulgu 0" sanılmaz', () => {
    expect(calistir(tablo, '--sozluk', sozluk, sozluk, '--kayitsiz').status).toBe(2)
    expect(calistir(tablo, '--olgu', join(dizin, 'yok.md'), '--sozluk', sozluk, sozluk, '--kayitsiz').status).toBe(2)
    expect(calistir(tablo, '--olgu', olgu, '--sozluk', sozluk, '--kayitsiz').status).toBe(2)
    expect(calistir(join(dizin, 'yok-tablo.json'), '--olgu', olgu, '--sozluk', sozluk, sozluk, '--kayitsiz').status).toBe(2)
  })
})
