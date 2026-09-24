/**
 * INV-REHBER-ALINTI-1 · alıntı doğrulamanın saf yardımcıları (rehber-yazisi-standard.md R2.3).
 *
 * ⭐Doğuran vaka (2026-09-24): Google SSS belgesi 301 ile güncellemeler sayfasına gidiyordu; alıntı 2023
 * kaydında birebir vardı ama aynı sayfada özelliğin 2026-05-07'de kaldırıldığı yazıyordu. Özetleyici araç
 * "birebir var" dedi. Bu test o vakanın kısaltılmış kopyasını kurar: alıntı BULUNUR ve bayatlık işareti
 * YAKALANIR — ikisi ayrı sonuçtur. Ağ çağrısı test edilmez (CI kapısı ağsız; ALTYAPI şartı).
 */
import { describe, it, expect } from 'vitest'
import { htmlMetin, normalize, alintiBul, sonGuncelleme, sha256, hukum, yolDegisti } from '../alinti-dogrula.mjs'

const GUNCELLEMELER = `<html><body><p>Last updated 2026-09-18 UTC.</p>
<h3>May 8</h3><p>Deprecating the FAQ rich result feature. This feature will no longer appear in Google Search starting May 7, 2026.</p>
<h3>September 2023</h3><p>Updated the FAQ structured data documentation to state that the feature is only shown for well-known, authoritative government and health websites.</p>
<script>var x = "only shown for well-known";</script></body></html>`

describe('INV-REHBER-ALINTI-1', () => {
  it('⭐bayat alıntı: bulunur AMA bayatlık işareti yakalanır (SSS vakası)', () => {
    const r = alintiBul(htmlMetin(GUNCELLEMELER), 'only shown for well-known, authoritative government and health websites')
    expect(r.bulundu).toBe(true)
    expect(r.bayatlikIsareti).toMatch(/deprecat|no longer/i)
    expect(r.baglamYillari).toEqual(expect.arrayContaining(['2026']))
    expect(r.baglam).toMatch(/no longer appear/)
    expect(hukum({ ...r, durum: 200 })).toBe('INCELE')
  })
  it('⚠işaret AYIRT ETMEZ: olağan "removed" cümlesi de INCELE verir — düşürmez, yargıya gönderir', () => {
    const r = alintiBul('Notify Google when pages are added or removed. The Indexing API can only be used for JobPosting.', 'can only be used for JobPosting')
    expect(r.bulundu).toBe(true)
    expect(hukum({ ...r, durum: 200 })).toBe('INCELE')
  })
  it('işaret alıntının KENDİSİNDEYSE çevre sayılmaz', () => {
    const r = alintiBul('Intro text here. This feature will no longer appear in Search. Other text.', 'This feature will no longer appear in Search.')
    expect(r.bayatlikIsareti).toBeNull()
    expect(hukum({ ...r, durum: 200 })).toBe('GECTI')
  })
  it('⭐yol değişikliği INCELE verir — SSS vakasının güvenilir işareti', () => {
    const ilk = 'https://developers.google.com/search/docs/appearance/structured-data/faqpage'
    const son = 'https://developers.google.com/search/updates#removing-faq-rich-result'
    expect(yolDegisti(ilk, son)).toBe(true)
    expect(yolDegisti('https://x.com/a/', 'https://x.com/a?hl=en')).toBe(false)
    expect(hukum({ bulundu: true, bayatlikIsareti: null, durum: 200, yonlendi: true })).toBe('INCELE')
  })
  it('bulunamayan ya da 200 dışı kaynak KALDI', () => {
    expect(hukum({ bulundu: false })).toBe('KALDI')
    expect(hukum({ bulundu: true, bayatlikIsareti: null, durum: 404 })).toBe('KALDI')
  })
  it('güncel alıntı: bulunur, bayatlık işareti yok', () => {
    const r = alintiBul('Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings.', 'many pages are generated for the primary purpose')
    expect(r).toMatchObject({ bulundu: true, bayatlikIsareti: null })
  })
  it('kaynakta olmayan alıntı: bulunamaz (uydurma atıf)', () => {
    expect(alintiBul(htmlMetin(GUNCELLEMELER), 'FAQ rich results are shown for all ecommerce sites')).toMatchObject({ bulundu: false, sebep: 'ALINTI-YOK' })
  })
  it('bağlantı içindeki kelimeden sonra noktalama boşluğu alıntıyı düşürmez (Indexing API vakası)', () => {
    const html = '<p>can only be used with <a href="#">JobPosting</a> or <a href="#">BroadcastEvent</a> embedded in a <a href="#">VideoObject</a>.</p>'
    expect(alintiBul(htmlMetin(html), 'with JobPosting or BroadcastEvent embedded in a VideoObject.').bulundu).toBe(true)
  })
  it('PDF satır sonu hecelemesi birleşir (kaynak dizini metni)', () => {
    const dizin = 'Extra cooling or derating of the motor is not required in\nvariable torque applications where the torque is propor-\ntional to the square of the speed'
    expect(alintiBul(dizin, 'where the torque is proportional to the square of the speed').bulundu).toBe(true)
  })
  it('parçalı alıntı: her parça ayrı aranır; biri yoksa KALDI (birleşik dize hiç geçmez)', () => {
    const metin = 'Power range: 0.18-2.2 kW. Some other text here. Three phase 380-480 V AC: 0.37-22 kW.'
    const iyi = alintiBul(metin, 'Power range: 0.18-2.2 kW [...] Three phase 380-480 V AC: 0.37-22 kW')
    expect(iyi).toMatchObject({ bulundu: true, parca: 2 })
    const kotu = alintiBul(metin, 'Power range: 0.18-2.2 kW / Three phase 380-480 V AC: 0.55-30 kW')
    expect(kotu).toMatchObject({ bulundu: false, sebep: 'PARCA-YOK' })
    expect(kotu.eksikParca).toEqual(['Three phase 380-480 V AC: 0.55-30 kW'])
  })
  it('PDF bitişik harfi (ﬂ) ve rakamlı tireli kırılma normal yazımla eşleşir', () => {
    expect(alintiBul('the air ﬂow is reduced', 'the air flow is reduced').bulundu).toBe(true)
    expect(alintiBul('convert 3-\nphase AC voltage', 'convert 3-phase AC voltage').bulundu).toBe(true)
  })
  it('bitişik "shielded/armored" parçalayıcı sayılmaz (boşluklu " / " değil)', () => {
    expect(alintiBul('Maximum motor cable length, shielded/armored 15 m', 'shielded/armored 15 m').bulundu).toBe(true)
  })
  it('script içeriği görünür metne girmez', () => {
    expect(htmlMetin('<p>a</p><script>gizli metin</script>')).toBe('a')
  })
  it('tırnak, tire ve boşluk farkı alıntıyı düşürmez; Türkçe büyük/küçük harf', () => {
    expect(normalize('“İtme”  kuvveti – 50 N')).toBe(normalize('"itme" kuvveti - 50 N'))
    expect(alintiBul('Kapalı OTOPARKLARDA mekanik havalandırma', 'kapalı otoparklarda').bulundu).toBe(true)
  })
  it('Türkçe bayatlık işareti de yakalanır (mevzuat)', () => {
    expect(alintiBul('Bu madde 2024 yılında yürürlükten kaldırılmıştır. Eski hüküm: sığınak zorunludur.', 'sığınak zorunludur').bayatlikIsareti).toBeTruthy()
  })
  it('son güncelleme tarihi ve sha256', () => {
    expect(sonGuncelleme(GUNCELLEMELER)).toBe('2026-09-18')
    expect(sha256('a')).toHaveLength(64)
  })
})
