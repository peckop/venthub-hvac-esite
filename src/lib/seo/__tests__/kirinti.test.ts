/**
 * URN-21 — aile/model kırıntısı: görünür `<nav>` ile JSON-LD BreadcrumbList TEK kaynaktan gelir.
 *
 * Ölçülen kusur (canlı, ham HTML, 2026-10-03): 47 aile sayfasında gövdede kategoriye/markaya bağlantı 0;
 * kırıntı yalnız JSON-LD'deydi. Burada: (1) zincirin kuralları, (2) JSON-LD `item` adresleri ile görünür
 * bağlantı adreslerinin aynı veriden çıkması, (3) sayfa kaynağında iki yüzeyin aynı diziyi tüketmesi.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { DB_MARKALARI } from '@/data/__tests__/markaDbFiksturu'
import { markaBulAdla } from '@/data/brands'

import { buildBreadcrumbJsonLd } from '../jsonld'
import { aileKirintiAdimlari, type AileKirintisiGirdisi, kirintiHref } from '../kirinti'

const TABAN = 'https://venthub.test'

function girdi(ek: Partial<AileKirintisiGirdisi> = {}): AileKirintisiGirdisi {
  return {
    dil: 'tr',
    anasayfaAdi: 'Ana Sayfa',
    ana: { ad: 'Fanlar', slug: 'fanlar' },
    alt: { ad: 'Aksiyel Fanlar', slug: 'aksiyel-fanlar' },
    marka: { ad: 'Avens', slug: 'avens' },
    aile: { ad: 'BVU LS', slug: 'avens-bvu-ls' },
    model: null,
    bayrak: false,
    ...ek,
  }
}

describe('aileKirintiAdimlari', () => {
  it('aile sayfası: Ana Sayfa › Kategori › Alt › Marka › Aile, son basamak bağlantısız', () => {
    const adimlar = aileKirintiAdimlari(girdi())
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'Avens', 'BVU LS'])
    expect(adimlar.at(-1)?.path).toBeNull()
    // Son basamak dışındakilerin hepsi bağlantı: görünür kırıntıda <a> sayısı = adım sayısı − 1.
    expect(adimlar.slice(0, -1).every((a) => !!a.path)).toBe(true)
  })

  it('model sayfası: aile basamağı BAĞLANTI olur, son basamak model', () => {
    const adimlar = aileKirintiAdimlari(girdi({ model: { etiket: 'BVU LS 200' } }))
    expect(adimlar.map((a) => a.name).slice(-2)).toEqual(['BVU LS', 'BVU LS 200'])
    expect(adimlar.at(-2)?.path).toBe('/tr/products/avens-bvu-ls')
    expect(adimlar.at(-1)?.path).toBeNull()
  })

  it('kapalı bayrak: bugünkü yollar (kategori dilsiz, marka/aile dil önekli) — adres üreticisinden', () => {
    const adimlar = aileKirintiAdimlari(girdi())
    expect(adimlar.map((a) => a.path)).toEqual([
      '/',
      '/category/fanlar',
      '/category/aksiyel-fanlar', // bugünkü `Routes.category`: dal tek başına adreslenir
      '/tr/brands/avens',
      null,
    ])
  })

  it('açık bayrak: yeni şema (kategori/markalar), hepsi dil önekli', () => {
    const adimlar = aileKirintiAdimlari(girdi({ bayrak: true, model: { etiket: 'BVU LS 200' } }))
    expect(adimlar.slice(1, -1).every((a) => a.path?.startsWith('/tr/'))).toBe(true)
    expect(adimlar[1].path).toBe('/tr/kategori/fanlar')
    expect(adimlar[3].path).toBe('/tr/markalar/avens')
  })

  it('çözülemeyen basamak eklenmez, zincir kısalır (kategori yok, marka yok, ad boş)', () => {
    const adimlar = aileKirintiAdimlari(girdi({ ana: null, alt: { ad: 'X', slug: 'x' }, marka: null }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'BVU LS'])
    const bosAd = aileKirintiAdimlari(girdi({ ana: { ad: '  ', slug: 'fanlar' }, alt: null, marka: null }))
    expect(bosAd.map((a) => a.name)).toEqual(['Ana Sayfa', 'BVU LS'])
  })

  it('alt kategori ana ile aynı slug ise tekrarlanmaz', () => {
    const adimlar = aileKirintiAdimlari(girdi({ alt: { ad: 'Fanlar', slug: 'fanlar' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Avens', 'BVU LS'])
  })

  it('EN sayfa: marka ve aile adresleri /en önekli', () => {
    const adimlar = aileKirintiAdimlari(girdi({ dil: 'en', model: { etiket: 'M1' } }))
    expect(adimlar.find((a) => a.name === 'Avens')?.path).toBe('/en/brands/avens')
    expect(adimlar.find((a) => a.name === 'BVU LS')?.path).toBe('/en/products/avens-bvu-ls')
  })
})

describe('JSON-LD ile görünür kırıntı aynı veri', () => {
  it.each([
    ['aile', girdi()],
    ['model', girdi({ model: { etiket: 'BVU LS 200' } })],
    ['açık bayrak', girdi({ bayrak: true })],
  ])('%s: JSON-LD adları ve adresleri, görünür bağlantı adresleriyle birebir', (_ad, g) => {
    const adimlar = aileKirintiAdimlari(g)
    const ld = buildBreadcrumbJsonLd({ lang: g.dil, baseUrl: TABAN, steps: adimlar }) as {
      itemListElement: { name: string; item?: string }[]
    }
    expect(ld.itemListElement.map((e) => e.name)).toEqual(adimlar.map((a) => a.name))
    adimlar.forEach((adim, i) => {
      const item = ld.itemListElement[i].item
      if (adim.path === null) {
        expect(item).toBeUndefined()
        return
      }
      // Ana Sayfa: JSON-LD `/tr/`, görünür `/tr` (sondaki eğik çizgi yönlendirme doğurur) — aynı sayfa.
      const gorunur = kirintiHref(adim.path, g.dil)
      expect(item?.replace(/\/$/, '')).toBe(`${TABAN}${gorunur}`)
    })
  })
})

describe('kirintiHref', () => {
  it('dil önekini yalnız yoksa ekler; ana sayfa eğik çizgisiz', () => {
    expect(kirintiHref('/', 'tr')).toBe('/tr')
    expect(kirintiHref('/category/fanlar', 'en')).toBe('/en/category/fanlar')
    expect(kirintiHref('/tr/kategori/fanlar', 'tr')).toBe('/tr/kategori/fanlar')
  })
})

describe('markaBulAdla', () => {
  it('DB adı (AVenS, SEAT, Nicotra Gebhardt) vitrin markasına eşleşir; bilinmeyen/boş null', () => {
    expect(markaBulAdla('AVenS')?.slug).toBe('avens')
    expect(markaBulAdla('SEAT')?.slug).toBe('seat')
    expect(markaBulAdla('Nicotra Gebhardt')?.slug).toBe('nicotra-gebhardt')
    expect(markaBulAdla('Bilinmeyen')).toBeNull()
    expect(markaBulAdla(null)).toBeNull()
    expect(markaBulAdla('  ')).toBeNull()
  })

  it('GERÇEK DB marka adlarının TAMAMI (fikstür, 2026-10-03 ölçümü: 5 marka / 47 aile) kendi slug\'ına eşleşir, düşen ya da yanlış eşleşen yok', () => {
    const sonuc = Object.entries(DB_MARKALARI).map(([slug, m]) => [slug, markaBulAdla(m.ad)?.slug ?? null])
    expect(sonuc.filter(([slug, bulunan]) => bulunan !== slug)).toEqual([])
    expect(sonuc).toHaveLength(5)
  })

  it('farklı iki marka adı aynı kayda düşmez (yanlış eşleşme yok)', () => {
    const bulunan = Object.values(DB_MARKALARI).map((m) => markaBulAdla(m.ad)?.slug)
    expect(new Set(bulunan).size).toBe(bulunan.length)
  })
})

describe('aileSayfasi.tsx: tek kaynak bağlaması (kaynak denetimi)', () => {
  const kaynak = readFileSync(join(process.cwd(), 'src/app/_components/aileSayfasi.tsx'), 'utf8')

  it('zincir tek yerde kurulur; JSON-LD o diziyi alır ve görünüm aynı diziyi prop olarak alır', () => {
    expect(kaynak.match(/aileKirintiAdimlari\(/g)).toHaveLength(1)
    expect(kaynak).toMatch(/buildBreadcrumbJsonLd\(\{[^}]*steps: kirinti/)
    expect(kaynak).toMatch(/kirinti=\{kirinti\}/)
  })
})
