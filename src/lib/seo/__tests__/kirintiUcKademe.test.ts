/**
 * URN-144 (karar 410) — üç kademeli kategori zincirinde aile kırıntısı ve BreadcrumbList JSON-LD.
 * Zincir `parent_id`'den gelir; ürün/aile sütunlarının karması (category_id = orta, subcategory_id = yaprak) kökü
 * düşürmez. İki kademede çıktı eski `ana`/`alt` girdisiyle BİREBİR aynıdır. Kimlikler/adlar test verisidir.
 */
import { describe, expect, it } from 'vitest'

import { buildBreadcrumbJsonLd } from '../jsonld'
import { aileKirintiAdimlari, type AileKirintisiGirdisi } from '../kirinti'

const TABAN = 'https://venthub.test'

const KOK = { ad: 'Aksesuarlar', slug: 'aksesuarlar' }
const ORTA = { ad: 'Elektrik Aksesuarları', slug: 'elektrik-aksesuarlari' }
const YAPRAK = { ad: 'Frekans Konvertörleri', slug: 'frekans-konvertorleri' }

function girdi(ek: Partial<AileKirintisiGirdisi> = {}): AileKirintisiGirdisi {
  return {
    dil: 'tr',
    anasayfaAdi: 'Ana Sayfa',
    ana: null,
    alt: null,
    aile: { ad: 'PTC', slug: 'ptc' },
    model: null,
    bayrak: true,
    ...ek,
  }
}

describe('aileKirintiAdimlari — zincir (üç kademe)', () => {
  it('kök › orta › yaprak › aile; her kategori TEK segmentli adrese gider, son basamak bağlantısız', () => {
    const adimlar = aileKirintiAdimlari(girdi({ zincir: [KOK, ORTA, YAPRAK] }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri', 'PTC'])
    expect(adimlar.map((a) => a.path)).toEqual([
      '/',
      '/tr/kategori/aksesuarlar',
      '/tr/kategori/elektrik-aksesuarlari',
      '/tr/kategori/frekans-konvertorleri',
      null,
    ])
    // Karar 407: adreste iç içe segment yok.
    expect(adimlar.every((a) => !a.path || (a.path.match(/\//g) ?? []).length <= 3)).toBe(true)
  })

  it('karma sütun: ana = orta, alt = yaprak girse bile zincir KÖKÜ içerir (zincir ana/alt\'e baskındır)', () => {
    const adimlar = aileKirintiAdimlari(girdi({ ana: ORTA, alt: YAPRAK, zincir: [KOK, ORTA, YAPRAK] }))
    expect(adimlar.map((a) => a.name)).toContain('Aksesuarlar')
    expect(adimlar.map((a) => a.name).slice(1, 4)).toEqual(['Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri'])
  })

  it('EN: dil önekli ve bölüm adı category', () => {
    const adimlar = aileKirintiAdimlari(
      girdi({ dil: 'en', zincir: [{ ad: 'Accessories', slug: 'accessories' }, { ad: 'Frequency Converters', slug: 'frequency-converters' }] }),
    )
    expect(adimlar.map((a) => a.path)).toEqual(['/', '/en/category/accessories', '/en/category/frequency-converters', null])
  })

  it('çözülemeyen (adı boş / slug boş) basamak atlanır, art arda aynı slug tek basamak olur', () => {
    const adimlar = aileKirintiAdimlari(girdi({ zincir: [KOK, { ad: ' ', slug: 'x' }, ORTA, ORTA] }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'PTC'])
  })

  it('model sayfası: zincirin ardından aile bağlantısı, son basamak model', () => {
    const adimlar = aileKirintiAdimlari(girdi({ zincir: [KOK, ORTA], model: { etiket: 'PTC 10' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'PTC', 'PTC 10'])
    expect(adimlar.at(-1)?.path).toBeNull()
    expect(adimlar.at(-2)?.path).toBeTruthy()
  })

  it('BreadcrumbList JSON-LD aynı diziden: konum sırası ve ad/adres görünür zincirle aynı', () => {
    const adimlar = aileKirintiAdimlari(girdi({ zincir: [KOK, ORTA, YAPRAK] }))
    const ld = buildBreadcrumbJsonLd({ lang: 'tr', baseUrl: TABAN, steps: adimlar }) as {
      itemListElement: { position: number; name: string; item?: string }[]
    }
    expect(ld.itemListElement.map((e) => e.name)).toEqual(adimlar.map((a) => a.name))
    expect(ld.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4, 5])
    expect(ld.itemListElement[3].item).toBe(`${TABAN}/tr/kategori/frekans-konvertorleri`)
  })
})

describe('aileKirintiAdimlari — iki kademe: zincir ile ana/alt AYNI çıktıyı verir (fark 0)', () => {
  const KOK2 = { ad: 'Fanlar', slug: 'fanlar' }
  const ALT2 = { ad: 'Kanal Tipi Fanlar', slug: 'kanal-tipi-fanlar' }

  for (const bayrak of [true, false]) {
    it(`bayrak=${bayrak}: ana/alt ≡ zincir [ana, alt]`, () => {
      const eski = aileKirintiAdimlari(girdi({ ana: KOK2, alt: ALT2, bayrak }))
      const yeni = aileKirintiAdimlari(girdi({ zincir: [KOK2, ALT2], bayrak }))
      expect(yeni).toEqual(eski)
    })

    it(`bayrak=${bayrak}: yalnız kök (alt yok) ≡ zincir [kök]`, () => {
      expect(aileKirintiAdimlari(girdi({ zincir: [KOK2], bayrak }))).toEqual(aileKirintiAdimlari(girdi({ ana: KOK2, alt: null, bayrak })))
    })
  }

  it('ana çözülemediyse eski sözleşme: alt de eklenmez (zincir verilmediğinde)', () => {
    const adimlar = aileKirintiAdimlari(girdi({ ana: null, alt: ALT2 }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'PTC'])
  })
})
