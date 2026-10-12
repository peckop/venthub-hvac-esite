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
import { adresRotalari } from '@/utils/yuzeyAdresleri'

import { buildBreadcrumbJsonLd } from '../jsonld'
import { aileKirintiAdimlari, type AileKirintisiGirdisi, kirintiHref } from '../kirinti'

const TABAN = 'https://venthub.test'

/** Kaynaktan blok ve satır yorumlarını atar. Satır yorumu işaretinin önündeki `:` URL şemasıdır, yorum başı değildir. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')
}

function girdi(ek: Partial<AileKirintisiGirdisi> = {}): AileKirintisiGirdisi {
  return {
    dil: 'tr',
    anasayfaAdi: 'Ana Sayfa',
    ana: { ad: 'Fanlar', slug: 'fanlar' },
    alt: { ad: 'Aksiyel Fanlar', slug: 'aksiyel-fanlar' },
    aile: { ad: 'BVU LS', slug: 'avens-bvu-ls' },
    model: null,
    bayrak: false,
    ...ek,
  }
}

describe('aileKirintiAdimlari', () => {
  it('aile sayfası: Ana Sayfa › Kategori › Alt › Aile, son basamak bağlantısız', () => {
    const adimlar = aileKirintiAdimlari(girdi())
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'BVU LS'])
    expect(adimlar.at(-1)?.path).toBeNull()
    // Son basamak dışındakilerin hepsi bağlantı: görünür kırıntıda <a> sayısı = adım sayısı − 1.
    expect(adimlar.slice(0, -1).every((a) => !!a.path)).toBe(true)
  })

  it('model sayfası: aile basamağı BAĞLANTI olur, son basamak model', () => {
    const adimlar = aileKirintiAdimlari(girdi({ model: { etiket: 'BVU LS 200' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'BVU LS', 'BVU LS 200'])
    expect(adimlar.at(-2)?.path).toBe('/tr/products/avens-bvu-ls')
    expect(adimlar.at(-1)?.path).toBeNull()
  })

  it('kapalı bayrak: bugünkü yollar (kategori dilsiz) — adres üreticisinden, marka basamağı yok', () => {
    const adimlar = aileKirintiAdimlari(girdi())
    expect(adimlar.map((a) => a.path)).toEqual([
      '/',
      '/category/fanlar',
      '/category/aksiyel-fanlar', // bugünkü `Routes.category`: dal tek başına adreslenir
      null,
    ])
  })

  it('açık bayrak: yeni şema (kategori), hepsi dil önekli; aile basamağı adres üreticisinin çıktısı', () => {
    const adimlar = aileKirintiAdimlari(girdi({ bayrak: true, model: { etiket: 'BVU LS 200' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'BVU LS', 'BVU LS 200'])
    expect(adimlar.slice(1, -1).every((a) => a.path?.startsWith('/tr/'))).toBe(true)
    expect(adimlar[1].path).toBe('/tr/kategori/fanlar')
    expect(adimlar[3].path).toBe(adresRotalari('tr', true).product('avens-bvu-ls'))
  })

  it('çözülemeyen basamak eklenmez, zincir kısalır (kategori yok, ad boş)', () => {
    const adimlar = aileKirintiAdimlari(girdi({ ana: null, alt: { ad: 'X', slug: 'x' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'BVU LS'])
    const bosAd = aileKirintiAdimlari(girdi({ ana: { ad: '  ', slug: 'fanlar' }, alt: null }))
    expect(bosAd.map((a) => a.name)).toEqual(['Ana Sayfa', 'BVU LS'])
  })

  it('alt kategori ana ile aynı slug ise tekrarlanmaz', () => {
    const adimlar = aileKirintiAdimlari(girdi({ alt: { ad: 'Fanlar', slug: 'fanlar' } }))
    expect(adimlar.map((a) => a.name)).toEqual(['Ana Sayfa', 'Fanlar', 'BVU LS'])
  })

  it('EN sayfa: aile adresi /en önekli', () => {
    const adimlar = aileKirintiAdimlari(girdi({ dil: 'en', model: { etiket: 'M1' } }))
    expect(adimlar.find((a) => a.name === 'BVU LS')?.path).toBe('/en/products/avens-bvu-ls')
  })
})

/**
 * URN-126 — MARKA BASAMAĞI YOK. Kırıntıda bir adım yukarı çıkan kullanıcı kategoriye gitmeli; marka
 * basamağı onu markanın TÜM ürünlerine düşürüyordu. Eski çağıran (alan hâlâ verilse bile) basamak çıkmaz.
 */
describe('aileKirintiAdimlari — marka basamağı yok (URN-126)', () => {
  // Değişmez nesne (literal DEĞİL): tip sistemi artık `marka` alanını kabul etmez, çalışma zamanı da yok sayar.
  const markaliGirdi = (ek: Partial<AileKirintisiGirdisi>) => ({
    ...girdi(ek),
    marka: { ad: 'Vortice', slug: 'vortice' },
  })

  it.each<[string, Partial<AileKirintisiGirdisi>]>([
    ['aile · kapalı bayrak · TR', { bayrak: false }],
    ['aile · açık bayrak · TR', { bayrak: true }],
    ['model · kapalı bayrak · TR', { bayrak: false, model: { etiket: 'BVU LS 200' } }],
    ['model · açık bayrak · TR', { bayrak: true, model: { etiket: 'BVU LS 200' } }],
    ['aile · kapalı bayrak · EN', { bayrak: false, dil: 'en' as const }],
    ['model · açık bayrak · EN', { bayrak: true, dil: 'en' as const, model: { etiket: 'M1' } }],
  ])('%s: marka verilse bile ad ve adres zincirinde marka yok, sıra değişmedi', (_ad, ek) => {
    const adimlar = aileKirintiAdimlari(markaliGirdi(ek))
    expect(adimlar.some((a) => a.name === 'Vortice')).toBe(false)
    expect(adimlar.some((a) => /\/(brands|markalar)(\/|$)/.test(a.path ?? ''))).toBe(false)
    // Marka verilmemiş girdiyle birebir aynı dizi.
    expect(adimlar).toEqual(aileKirintiAdimlari(girdi(ek)))
    const adlar = adimlar.map((a) => a.name)
    expect(adlar.slice(0, 3)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar'])
    expect(adlar.at(ek.model ? -2 : -1)).toBe('BVU LS')
  })

  it('JSON-LD BreadcrumbList aynı diziden: aile sayfasında 4, model sayfasında 5 öğe; marka öğesi yok', () => {
    const ld = (g: AileKirintisiGirdisi) =>
      buildBreadcrumbJsonLd({ lang: g.dil, baseUrl: TABAN, steps: aileKirintiAdimlari(g) }) as {
        itemListElement: { position: number; name: string; item?: string }[]
      }
    const aile = ld(girdi())
    expect(aile.itemListElement.map((e) => e.name)).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'BVU LS'])
    expect(aile.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4])
    const model = ld(girdi({ model: { etiket: 'BVU LS 200' }, bayrak: true }))
    expect(model.itemListElement).toHaveLength(5)
    for (const e of [...aile.itemListElement, ...model.itemListElement]) {
      expect(e.item ?? '').not.toMatch(/\/(brands|markalar)(\/|$)/)
    }
  })

  it('kaynak: kırıntı modülü marka adı/slug\'ı almaz ve marka rotası kurmaz (yorum satırları hariç)', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src/lib/seo/kirinti.ts'), 'utf8')
    const kod = yorumsuz(kaynak)
    expect(kod).not.toMatch(/\bmarka\b/)
    expect(kod).not.toMatch(/\.brand\(/)
  })

  it('kaynak denetiminin yorum sıyırıcısı URL şemasını yemez (INV-SCRUB-1 alt sınırı)', () => {
    // Şemayı yorum sanan sıyırıcı `https://...` satırının sonunu siler ve bekçiyi sessizce kör bırakır:
    // burada hem sıyrılan yorumun gittiği hem satırdaki URL'in KALDIĞI ölçülür.
    const ornek = ["const u = 'https://venthub.test/x' // marka açıklaması", '/* marka */ const v = 1'].join('\n')
    const kod = yorumsuz(ornek)
    expect(kod).toContain("'https://venthub.test/x'")
    expect(kod).toContain('const v = 1')
    expect(kod).not.toMatch(/marka/)
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

  it('GERÇEK DB marka adlarının TAMAMI (fikstür: 5 ölçülü marka + OPS-51 casals/flexiva = 7) kendi slug\'ına eşleşir, düşen ya da yanlış eşleşen yok', () => {
    const sonuc = Object.entries(DB_MARKALARI).map(([slug, m]) => [slug, markaBulAdla(m.ad)?.slug ?? null])
    expect(sonuc.filter(([slug, bulunan]) => bulunan !== slug)).toEqual([])
    expect(sonuc).toHaveLength(7)
    // Casals ürünlerinin `brand_name`'i ('Casals') artık vitrin markasına çözülür → aile sayfasındaki marka bağlantısı canlı.
    expect(markaBulAdla('Casals')?.slug).toBe('casals')
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

  it('URN-126: zincir çağrısı marka girdisi vermez (sayfa markayı kırıntı için çözmez)', () => {
    const cagri = kaynak.match(/aileKirintiAdimlari\(\{[\s\S]*?\n\s*\}\)/)
    expect(cagri).not.toBeNull()
    expect(cagri?.[0]).toMatch(/aile:\s*\{/) // doğru bloğu yakaladığımızın kanıtı
    expect(cagri?.[0]).not.toMatch(/marka/i)
  })
})
