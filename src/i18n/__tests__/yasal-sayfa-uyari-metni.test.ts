import { describe, expect, it } from 'vitest'

import { en } from '../dictionaries/en'
import { tr } from '../dictionaries/tr'

/**
 * INV-YASAL-UYARI-1 — yasal sayfaların sarı kutusu müşteriye konuşur, geliştiriciye değil.
 *
 * NİÇİN VAR (2026-10-10, Kanban STS-4; canlı ölçüm OPS 2026-10-09): `legal.draftWarning` altı yasal
 * sayfada (KVKK, gizlilik, çerez, mesafeli satış, ön bilgilendirme, kullanım koşulları) hukuk
 * teyidi tamamlanana kadar sarı kutuda basılır. Kutudaki cümle geliştiriciye yazılmış bir nottu
 * ("test amaçlıdır… canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir
 * hukukçudan teyit alınız"): ziyaretçiye canlı sitede iç iş talimatı gösteriliyordu.
 *
 * Sayfa başlığındaki "(Taslak)" ibaresi DURUR: hukukçu teyidi bayrağı (legalReviewCompleted) false
 * iken durumun doğru ifadesidir. Bu test yalnız kutunun dilini kilitler. Kutu metni değişirse
 * açılış ön koşulu K11'in taslak bandı kalıpları (scripts/kip/acilis-onkosullari.mjs) da ayrıca
 * eşleşmemelidir; aşağıdaki yasak kalıp listesi onları kapsar.
 */
const GELISTIRICI_NOTU_KALIPLARI: RegExp[] = [
  /test amaçlı/i,
  /taslaktır ve test/i,
  /canlıya çıkmadan/i,
  /güncelleyiniz/i,
  /hukukçu/i,
  /testing purposes/i,
  /draft and for testing/i,
  /before going live/i,
  /update it with/i,
  /legal expert/i,
]

const ONAYLI_TR = 'Satıcı ve iletişim bilgileri bu metne eklenecektir.'

/**
 * Kutu şirketin durumunu ilan etmez, yalnız sayfayı anlatır (içerik kuralı: şirket iddiası yok, #1813).
 * Kuruluş, tescil, ünvan ya da "şirketimiz/our company" gibi bir durum bildirimi bu kutuya girmez.
 */
const SIRKET_DURUMU_KALIPLARI: RegExp[] = [/kuruluş/i, /tescil/i, /şirket/i, /incorporat/i, /company/i, /registered/i]

describe('INV-YASAL-UYARI-1 — legal.draftWarning geliştirici notu taşımaz', () => {
  const dilleri: Array<[string, string]> = [
    ['tr', tr.legal.draftWarning],
    ['en', en.legal.draftWarning],
  ]

  it.each(dilleri)('%s: metin boş değil ve geliştirici notu kalıplarından hiçbirini içermez', (_dil, metin) => {
    expect(typeof metin).toBe('string')
    expect(metin.trim().length).toBeGreaterThan(0)
    for (const kalip of GELISTIRICI_NOTU_KALIPLARI) {
      expect(metin, `yasak kalıp: ${String(kalip)}`).not.toMatch(kalip)
    }
  })

  it('tr: OPS onaylı cümle birebir yazılıdır (karar 317 uygulaması)', () => {
    expect(tr.legal.draftWarning).toBe(ONAYLI_TR)
  })

  it('iki dilde de satıcı ve iletişim bilgisinin metne ekleneceğini söyler; tarih ya da vaat sözü içermez', () => {
    expect(en.legal.draftWarning).toMatch(/seller/i)
    expect(en.legal.draftWarning).toMatch(/added/i)
    expect(tr.legal.draftWarning).not.toMatch(/\d{4}/)
    expect(en.legal.draftWarning).not.toMatch(/\d{4}/)
  })

  it.each(dilleri)('%s: kutu şirketin durumunu ilan etmez (kuruluş, tescil, ünvan, company)', (_dil, metin) => {
    for (const kalip of SIRKET_DURUMU_KALIPLARI) {
      expect(metin, `şirket durumu kalıbı: ${String(kalip)}`).not.toMatch(kalip)
    }
  })
})
