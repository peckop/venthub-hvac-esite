// KTL-86: UnoPIM içerik doluluk çekirdeği (saf). Bozma testi: defterdeki sayı bozulunca karşılaştırma sapma bildirmeli.
import { describe, expect, it } from 'vitest'

import { blokOku, bosMu, doluluk, duzAlanlar, karsilastir, kaynakFarki, ozetBlogu } from '../unopim-icerik-kurallar.mjs'

const olcu = (a: string | null) => ({ unit: 'WATT', amount: a, family: 'Power' })
const urun = (sku: string, aile: string, common: Record<string, unknown>, tr = 'Ad') => ({
  sku, aile, status: 'false',
  values: {
    common,
    categories: ['k1'],
    channel_locale_specific: { default: { tr_TR: { name: tr }, en_US: { name: 'Name' } } },
  },
})
const aileler = { a: ['name', 'rated_power_w', 'ip_rating', 'sku'], b: ['name', 'ip_rating'] }

describe('bosMu', () => {
  it('boş sayılanlar', () => {
    for (const v of [null, undefined, '', '  ', [], {}, olcu(null), olcu('')]) expect(bosMu(v)).toBe(true)
  })
  it('dolu sayılanlar', () => {
    for (const v of ['x', 0, false, ['a'], olcu('12.0000')]) expect(bosMu(v)).toBe(false)
  })
})

describe('duzAlanlar', () => {
  it('yerel değerleri alan@yerel olarak açar', () => {
    const d = duzAlanlar(urun('s', 'a', { brand: 'B' }).values)
    expect(d['name@tr_TR']).toBe('Ad')
    expect(d['name@en_US']).toBe('Name')
    expect(d.brand).toBe('B')
    expect(d.categories).toEqual(['k1'])
  })
})

describe('doluluk', () => {
  const sonuc = doluluk([
    urun('s1', 'a', { rated_power_w: olcu('10'), ip_rating: 'IP44' }),
    urun('s2', 'a', { rated_power_w: olcu(null), ip_rating: 'IP44' }),
    urun('s3', 'b', { ip_rating: '' }),
  ], aileler)

  it('sayıları ve aile sayısını verir', () => {
    expect(sonuc.urun).toBe(3)
    expect(sonuc.aile).toBe(2)
    expect(sonuc.genel['name@tr_TR']).toEqual({ n: 3, dolu: 3 })
    expect(sonuc.genel.image.n).toBe(3)
  })
  it('kısmi ve tam boş alanı ayırır (aile bazında)', () => {
    const git = (aile: string, alan: string) => sonuc.teknikSatirlari.find((t: { aile: string; alan: string }) => t.aile === aile && t.alan === alan)
    expect(git('a', 'rated_power_w')).toMatchObject({ dolu: 1, bos: 1, bosSku: ['s2'] })
    expect(git('b', 'ip_rating')).toMatchObject({ dolu: 0, bos: 1 })
    expect(git('a', 'ip_rating')).toBeUndefined()
    expect(sonuc.teknik).toEqual({ bosHucre: 2, kismiAlan: 1, tamBosAlan: 1 })
  })
  it('genel ve sistem alanları teknik tabloya girmez', () => {
    expect(sonuc.teknikSatirlari.some((t: { alan: string }) => t.alan === 'name' || t.alan === 'sku')).toBe(false)
  })
})

describe('blok ve karşılaştırma', () => {
  const sonuc = doluluk([urun('s1', 'a', { rated_power_w: olcu('1'), ip_rating: 'x' })], aileler)
  const blok = ozetBlogu(sonuc)
  const md = `# d\n<!-- olcum-ozet:basla\n${JSON.stringify(blok)}\nolcum-ozet:bitti -->\n`

  it('blok mdden okunur, bozuk ya da yok ise null', () => {
    expect(blokOku(md)).toEqual(blok)
    expect(blokOku('yok')).toBeNull()
    expect(blokOku('<!-- olcum-ozet:basla {bozuk olcum-ozet:bitti -->')).toBeNull()
  })
  it('aynı sayılar tutarlı', () => {
    expect(karsilastir(blok, blok)).toEqual([])
  })
  it('BOZMA: defterdeki sayı değişince sapma yakalanır', () => {
    const bozuk = JSON.parse(JSON.stringify(blok))
    bozuk.urun = 999
    bozuk.genel['image'] = '0/999'
    bozuk.teknik.kismiAlan = 77
    const fark = karsilastir(bozuk, blok)
    expect(fark.length).toBe(3)
    expect(fark.join('|')).toContain('urun')
    expect(fark.join('|')).toContain('genel.image')
    expect(fark.join('|')).toContain('teknik.kismiAlan')
  })
})

describe('kaynakFarki (tetik = kaynak değişikliği)', () => {
  const damga = { unopimSonGuncelleme: '2026-11-07 19:59:31', unopimUrunSayisi: 1165, tasarimGoruntuSha: 'abc' }
  it('kaynak değişmediyse fark yok', () => {
    expect(kaynakFarki(damga, { ...damga })).toEqual([])
  })
  it('UnoPIM güncelleme damgası ya da ürün sayısı değişince yakalar', () => {
    expect(kaynakFarki(damga, { ...damga, unopimSonGuncelleme: '2026-11-10 08:00:00' })).toHaveLength(1)
    expect(kaynakFarki(damga, { ...damga, unopimUrunSayisi: 1166 })).toHaveLength(1)
  })
  it('Design anlık görüntü sha değişince yakalar; canlı Design damgası yoksa karşılaştırmaz', () => {
    expect(kaynakFarki(damga, { ...damga, tasarimGoruntuSha: 'xyz' })).toHaveLength(1)
    expect(kaynakFarki(damga, { ...damga, tasarimGoruntuSha: null })).toEqual([])
  })
  it('defterde damga yoksa fark sayılır', () => {
    expect(kaynakFarki(undefined, damga)).toHaveLength(1)
    expect(kaynakFarki(null, damga)).toHaveLength(1)
  })
})
