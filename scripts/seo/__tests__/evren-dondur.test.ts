/**
 * INV-EVREN-DONDUR-1 · Eski site adres evreni birleştirme (Kanban SEO-76).
 * Kilitlenenler: dil/tür/sorgu türü sınıflaması; satır yalnız dizinli (harita ∧ Google PASS) ya da trafikli (GSC tık/gösterim > 0)
 * ise girer; ölçülemeyen adres OLCULEMEDI yazılır (sessiz PASS yok); CSV tırnaklama; özet sayıları.
 */
import { describe, it, expect } from 'vitest'
import { dilBul, turBul, sorguTuru, birlestir, csvUret, ozetle } from '../evren-dondur.mjs'

const B = 'https://venthub.com.tr'

describe('sınıflama', () => {
  it('dil: /tr, /en ya da yok', () => {
    expect(dilBul(`${B}/tr/category/x`)).toBe('tr')
    expect(dilBul(`${B}/en/products/y`)).toBe('en')
    expect(dilBul(`${B}/category/jet-fans`)).toBe('yok')
    expect(dilBul(`${B}/`)).toBe('yok')
  })
  it('tür: dil öneki atılarak', () => {
    expect(turBul(`${B}/tr/products/a`)).toBe('urun')
    expect(turBul(`${B}/en/category/fans/b`)).toBe('kategori')
    expect(turBul(`${B}/category/jet-fans`)).toBe('kategori')
    expect(turBul(`${B}/tr/brands/avens`)).toBe('marka')
    expect(turBul(`${B}/tr/bilgi-merkezi/x`)).toBe('bilgi-merkezi')
    expect(turBul(`${B}/en`)).toBe('ana')
    expect(turBul(`${B}/tr/contact`)).toBe('diger')
  })
  it('sorgu türü: sku ayrı, diğer sorgu, yoksa null', () => {
    expect(sorguTuru(`${B}/tr/products/a?sku=ABC`)).toBe('sku')
    expect(sorguTuru(`${B}/en/products?brand=X`)).toBe('sorgu')
    expect(sorguTuru(`${B}/tr/products/a`)).toBeNull()
  })
})

describe('birleştir', () => {
  const harita = [`${B}/tr/a`, `${B}/tr/b`, `${B}/tr/c`]
  const gsc = [{ adres: `${B}/tr/a`, tik: 3, gosterim: 10 }, { adres: `${B}/en/z`, tik: 0, gosterim: 4 }, { adres: `${B}/tr/sifir`, tik: 0, gosterim: 0 }]
  const dizinDurumu = {
    [`${B}/tr/a`]: { karar: 'PASS', kapsam: 'ok' },
    [`${B}/tr/b`]: { karar: 'PASS', kapsam: 'ok' },
    [`${B}/tr/c`]: { karar: 'NEUTRAL', kapsam: 'Discovered' },
    [`${B}/en/z`]: { karar: 'NEUTRAL', kapsam: 'Crawled' },
  }
  const s = birlestir({ harita, gsc, dizinDurumu, tarih: '2026-11-10' })
  it('dizinli ya da trafikli girer; ikisi de değilse girmez', () => {
    expect(s.map((r: { adres: string }) => r.adres)).toEqual([`${B}/en/z`, `${B}/tr/a`, `${B}/tr/b`])
  })
  it('kaynak, dizinli, tık ve gösterim doğru; ölçülemeyen OLCULEMEDI', () => {
    const a = s.find((r: { adres: string }) => r.adres === `${B}/tr/a`)
    expect(a).toMatchObject({ kaynak: 'harita+gsc', dizinli: true, tik90: 3, gosterim90: 10, dil: 'tr' })
    const z = s.find((r: { adres: string }) => r.adres === `${B}/en/z`)
    expect(z).toMatchObject({ kaynak: 'gsc', dizinli: false, gosterim90: 4, dil: 'en' })
    const o = birlestir({ harita: [], gsc: [{ adres: `${B}/tr/q`, tik: 1, gosterim: 1 }], dizinDurumu: {}, tarih: 'g' })
    expect(o[0].googleKarar).toBe('OLCULEMEDI')
  })
  it('sku adresi kaynakta işaretlenir', () => {
    const r = birlestir({ harita: [], gsc: [{ adres: `${B}/tr/products/x?sku=1`, tik: 0, gosterim: 2 }], dizinDurumu: {}, tarih: 'g' })
    expect(r[0].kaynak).toBe('gsc+sku')
  })
})

describe('çıktı', () => {
  it('csv tırnaklar; özet sayar', () => {
    const satirlar = [{ adres: `${B}/a,b`, dil: 'tr', tur: 'urun', kaynak: 'harita', googleKarar: 'PASS', googleKapsam: 'x "y"', dizinli: true, tik90: 1, gosterim90: 2, tarih: 'g' }]
    const csv = csvUret(satirlar)
    expect(csv.split('\n')[1]).toContain('"https://venthub.com.tr/a,b"')
    expect(csv).toContain('"x ""y"""')
    expect(ozetle(satirlar)).toMatchObject({ satir: 1, dizinli: 1, trafikli: 1, skuAdresi: 0 })
  })
})
