import { describe, expect, it } from 'vitest'

import { ayristir, markaBaglantisiSorunu } from '../bot-karnesi.mjs'

/**
 * SEO-40 · bot karnesi aile sayfasında MARKA BAĞLANTISINI sayar; sıfırsa kırmızıdır.
 *
 * NİÇİN: URN-126 aile/model kırıntısından marka basamağını kaldırdı (kategoriden geri giden kullanıcı markanın TÜM ürünlerine
 * düşüyordu); markaya bağlantı artık sayfadaki üretici bloğunda (`/tr/brands/<marka>`, "ÜRETİCİ VERİSİ" etiketi). Karne bunu
 * saymıyordu: üretici bloğu bozulursa marka sayfası aile sayfalarından bağlantı almaz, hiçbir kapı görmezdi.
 * Canlı ölçüm (2026-10-13, /tr/products/seat-serisi): kırıntıda marka YOK, `<main>` içinde marka bağlantısı 1.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: sayım, sıfırda kusur, tür sınırı, header/nav/footer'ın sayılmaması ve şema
 * kapsamı ayrı davranışlardır; her biri tek başına bozulduğunda kendi kolu kırmızı vermelidir.
 */

const sayfa = (govde: string) => `<html><head><title>x</title></head><body>${govde}</body></html>`
const kirinti =
  '<nav aria-label="Sayfa yolu"><a href="/tr">Ana Sayfa</a><a href="/tr/category/fanlar">Fanlar</a><span aria-current="page">SEAT Storm</span></nav>'

describe('bot karnesi · aile sayfası marka bağlantısı (SEO-40)', () => {
  it('(a) üretici bloğundaki bağlantı sayılır, kusur yok', () => {
    const a = ayristir(
      sayfa(`<main>${kirinti}<div><span><a href="/tr/brands/seat">SEAT</a></span><span>ÜRETİCİ VERİSİ</span></div><h1>SEAT</h1></main>`),
    )
    expect(a.markaBaglantisi).toBe(1)
    expect(markaBaglantisiSorunu('aile-urun', a)).toBeNull()
  })

  it('(b) yalnız kırıntı bağlantıları (marka yok) → 0 ve MARKA-BAGLANTISI-YOK', () => {
    const a = ayristir(sayfa(`<main>${kirinti}<h1>SEAT Storm</h1></main>`))
    expect(a.markaBaglantisi).toBe(0)
    expect(markaBaglantisiSorunu('aile-urun', a)).toMatch(/^MARKA-BAGLANTISI-YOK/)
  })

  it('(c) tür sınırı: kategori, marka ve model sayfasında sıfır kusur sayılmaz', () => {
    const a = ayristir(sayfa(`<main>${kirinti}</main>`))
    expect(a.markaBaglantisi).toBe(0)
    for (const tur of ['kategori', 'marka', 'model', 'ana', 'alt-kategori']) {
      expect(markaBaglantisiSorunu(tur, a)).toBeNull()
    }
  })

  it('(d) yeni şema ve mutlak adres de sayılır, EN öneki de', () => {
    const yeni = ayristir(sayfa('<main><a href="/tr/markalar/seat">SEAT</a></main>'))
    const mutlak = ayristir(sayfa('<main><a href="https://venthub.com.tr/tr/brands/seat">SEAT</a></main>'))
    const en = ayristir(sayfa('<main><a href="/en/brands/seat">SEAT</a></main>'))
    expect([yeni.markaBaglantisi, mutlak.markaBaglantisi, en.markaBaglantisi]).toEqual([1, 1, 1])
  })

  it('(e) bağlantı olmayan "SEAT" yazısı ve slug\'sız liste adresi sayılmaz', () => {
    const a = ayristir(
      sayfa('<main><p>SEAT markasının ürünü /tr/brands/seat adresinde</p><a href="/tr/brands">Markalar</a><a href="/tr/markalar">Markalar</a></main>'),
    )
    expect(a.markaBaglantisi).toBe(0)
  })

  it('(f) <main> varsa header/footer bağlantısı sayılmaz (gövde bağlantısı değildir)', () => {
    const a = ayristir(
      sayfa('<header><a href="/tr/brands/seat">SEAT</a></header><main><h1>SEAT Storm</h1></main><footer><a href="/tr/brands/seat">SEAT</a></footer>'),
    )
    expect(a.markaBaglantisi).toBe(0)
    expect(markaBaglantisiSorunu('aile-urun', a)).toMatch(/^MARKA-BAGLANTISI-YOK/)
  })

  it('(g) <main> yoksa gövdeden sayılır; birden çok bağlantı toplanır', () => {
    const a = ayristir(sayfa('<div><a href="/tr/brands/seat">SEAT</a><a href="/tr/brands/seat">SEAT</a></div>'))
    expect(a.markaBaglantisi).toBe(2)
  })

  it('(h) ayrıştırılamayan sayfa (a=null) kusur üretmez', () => {
    expect(markaBaglantisiSorunu('aile-urun', null)).toBeNull()
  })
})
