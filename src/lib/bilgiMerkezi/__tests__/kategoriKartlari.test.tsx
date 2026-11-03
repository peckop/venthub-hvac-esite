import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { type RehberYazisi, YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import RehberYazisiSayfasi from '../../../views/knowledge/RehberYazisiSayfasi'
import { IcBaglantiHatasi } from '../icBaglanti'
import { yaziSayfasiHazirla } from '../sayfa'
import { ORNEK_YAZI } from './ornekYazi'
import { sahteKaynak } from './sahteKaynak'

/**
 * URN-151 — rehber yazısındaki "İlgili ürün kategorileri" kutusu (rehber-yazisi-standard R3.3, markasız).
 * Kaynak: `yazi.ilgiliKategoriler` (vh:kategori/<EN slug>). Boş alan = blok hiç basılmaz; çözülemeyen/pasif
 * kategori sessiz geçmez (derleme durur); aile kartı olan yazılar aynı kalır.
 */

const kategorili = (kimlikler: readonly `vh:kategori/${string}`[]): RehberYazisi => ({ ...ORNEK_YAZI, ilgiliKategoriler: kimlikler })

describe('kategori kartı — sayfa modeli', () => {
  it('⭐ilgiliKategoriler → kart: ad, kısa metin ve dil önekli kategori adresi (TR)', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans', 'vh:kategori/roof-fans'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    expect(s.kategoriKartlari.map((k) => k.ad)).toEqual(['Kategori duct-fans', 'Kategori roof-fans'])
    expect(s.kategoriKartlari[0]?.aciklama).toBe('duct-fans kategorisinin kısa metni.')
    expect(s.kategoriKartlari[0]?.href).toMatch(/^\/tr\/.*kanal-tipi-fanlar/)
    expect(s.kategoriKartlari[1]?.href).toMatch(/^\/tr\/.*cati-tipi-fanlar/)
  })

  it('EN: adres /en/ önekli; kısa metin yoksa BOŞ (Türkçe yedek yok) ama kart yine çizilir', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans'])
    const s = await yaziSayfasiHazirla(yazi, 'en', sahteKaynak(), [yazi])
    expect(s.kategoriKartlari).toHaveLength(1)
    expect(s.kategoriKartlari[0]?.href).toMatch(/^\/en\/.*duct-fans/)
    expect(s.kategoriKartlari[0]?.aciklama).toBe('')
  })

  it('⭐alan yok ya da boş → kart yok; aile kartı olan yazı aynı kalır', async () => {
    const yok = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    expect(yok.kategoriKartlari).toEqual([])
    expect(yok.urunKartlari).toHaveLength(1)
    const bos = kategorili([])
    const b = await yaziSayfasiHazirla(bos, 'tr', sahteKaynak(), [bos])
    expect(b.kategoriKartlari).toEqual([])
    expect(b.urunKartlari).toEqual(yok.urunKartlari)
  })

  it('aile kartı ve kategori kartı birlikte: ikisi de dolu, birbirini bozmaz', async () => {
    const yazi = kategorili(['vh:kategori/air-curtains'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    expect(s.urunKartlari.map((k) => k.ad)).toEqual(['Vortice VORT Mono'])
    expect(s.kategoriKartlari).toHaveLength(1)
  })

  it('aynı kategori iki kez yazılırsa tek kart', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans', 'vh:kategori/duct-fans'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    expect(s.kategoriKartlari).toHaveLength(1)
  })

  it('eski (takma adlı) kategori slug\'ı bugünkü kategoriye çözülür', async () => {
    const yazi = kategorili(['vh:kategori/eski-kategori'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    expect(s.kategoriKartlari[0]?.ad).toBe('Kategori air-curtains')
  })

  it('⭐HATA YOLU: olmayan/pasif kategori sessiz geçmez (derleme durur)', async () => {
    const yazi = kategorili(['vh:kategori/boyle-kategori-yok'])
    await expect(yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])).rejects.toBeInstanceOf(IcBaglantiHatasi)
  })

  it('HATA YOLU: kart verisi alınamazsa (kategoriKarti null) ATAR', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans'])
    const kaynak = sahteKaynak({ kategoriKarti: async () => null })
    await expect(yaziSayfasiHazirla(yazi, 'tr', kaynak, [yazi])).rejects.toThrow(/etkin kategori bulunamadı/)
  })

  it('HATA YOLU: görünen ad boşsa ATAR (boş başlıklı kart basılmaz)', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans'])
    const kaynak = sahteKaynak({ kategoriKarti: async (slug) => ({ slug, ad: '  ', aciklama: 'x' }) })
    await expect(yaziSayfasiHazirla(yazi, 'tr', kaynak, [yazi])).rejects.toThrow(/görünen ad boş/)
  })

  it('HATA YOLU: kaynak hata verirse (ağ yok) yutulmaz', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans'])
    const kaynak = sahteKaynak({
      kategoriKarti: async () => {
        throw new Error('ağ yok')
      },
    })
    await expect(yaziSayfasiHazirla(yazi, 'tr', kaynak, [yazi])).rejects.toThrow('ağ yok')
  })

  it('⭐yayındaki sessiz fan rehberi: ilgiliKategoriler iki kategori kartı olur', async () => {
    const sessiz = YAZILAR.find((y) => y.kimlik === 'sessiz-fan-secimi')
    expect(sessiz, 'yazı yayından kalktıysa bu testi de güncelle').toBeDefined()
    const s = await yaziSayfasiHazirla(sessiz as RehberYazisi, 'tr', sahteKaynak())
    expect(s.kategoriKartlari).toHaveLength(2)
    expect(s.urunKartlari.length).toBeGreaterThan(0)
  })
})

describe('kategori kartı — görünüm', () => {
  it('⭐başlık sözlükten (TR/EN), kartlar bağlantı, kısa metin yoksa satır yok', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans', 'vh:kategori/roof-fans'])
    const trSayfa = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    const { container, unmount } = render(<RehberYazisiSayfasi sayfa={trSayfa} />)
    const baslik = container.querySelector('#ilgili-kategoriler')
    expect(baslik?.textContent).toBe(tr.bilgiMerkezi.yazi.kategorilerBaslik)
    const kartlar = container.querySelectorAll('section[aria-labelledby="ilgili-kategoriler"] li a')
    expect(kartlar).toHaveLength(2)
    expect(kartlar[0]?.getAttribute('href')).toBe(trSayfa.kategoriKartlari[0]?.href)
    expect(kartlar[0]?.textContent).toContain('duct-fans kategorisinin kısa metni.')
    expect(kartlar[0]?.textContent).toContain(tr.bilgiMerkezi.yazi.kategoriDugme)

    // İkinci çizimden önce ilki sökülür: `#id` seçici belge genelinde ilk eşleşmeyi bulur, aynı kimlikli iki çizimde
    // ikinci kapsayıcıda yanlış `null` verir (test artefaktı, sayfa kusuru değil).
    unmount()
    const enSayfa = await yaziSayfasiHazirla(yazi, 'en', sahteKaynak(), [yazi])
    const { container: enKap } = render(<RehberYazisiSayfasi sayfa={enSayfa} />)
    expect(enKap.querySelector('#ilgili-kategoriler')?.textContent).toBe(en.bilgiMerkezi.yazi.kategorilerBaslik)
    const enKart = enKap.querySelector('section[aria-labelledby="ilgili-kategoriler"] li a')
    // EN'de kısa metin boş: kartta yalnız ad + düğme (Türkçe yedek metin yok).
    expect(enKart?.querySelectorAll('span')).toHaveLength(2)
    expect(enKart?.textContent).not.toContain('kısa metni')
  })

  it('kategori bloğu aile bloğundan ÖNCE gelir (genelden özele)', async () => {
    const yazi = kategorili(['vh:kategori/air-curtains'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    const { container } = render(<RehberYazisiSayfasi sayfa={s} />)
    const kat = container.querySelector('#ilgili-kategoriler')
    const aile = container.querySelector('#ilgili-urunler')
    expect(kat).not.toBeNull()
    expect(aile).not.toBeNull()
    expect(kat?.compareDocumentPosition(aile as Element) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('⭐kategori yoksa blok ve başlığı hiç basılmaz; aile bloğu aynen durur', async () => {
    const s = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    const { container } = render(<RehberYazisiSayfasi sayfa={s} />)
    expect(container.querySelector('#ilgili-kategoriler')).toBeNull()
    expect(container.querySelector('#ilgili-urunler')?.textContent).toBe(tr.bilgiMerkezi.yazi.urunlerBaslik)
  })

  it('SABOTAJ — kategori kartlarını boşaltınca blok kaybolur (kapı çizimi gerçekten ölçüyor)', async () => {
    const yazi = kategorili(['vh:kategori/duct-fans'])
    const s = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    const tam = render(<RehberYazisiSayfasi sayfa={s} />)
    expect(tam.container.querySelector('#ilgili-kategoriler')).not.toBeNull()
    tam.unmount() // ikinci çizimde `null` ölçümü ilk çizimin kimliğine takılmasın (belge genelinde #id araması)
    const { container } = render(<RehberYazisiSayfasi sayfa={{ ...s, kategoriKartlari: [] }} />)
    expect(container.querySelector('#ilgili-kategoriler')).toBeNull()
  })
})
