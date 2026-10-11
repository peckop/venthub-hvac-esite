import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modellerdenVeri, yayindaVeriAyarla } from '@/config/__tests__/yayindaTestKiti'
import { HVAC_BRANDS } from '@/data/brands'
import { type AdresDili, type AdresNesnesi, adresUret } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import type { KiraciHaritasi } from '../haritaTipi'
import { fiksturHaritasi, modelSlugluHarita } from './fikstur'

/**
 * REC-300 Faz 3 m.4 — ESKİ ADRES EŞLEYİCİSİ (plan §4.1, §6). Her kuralın en az bir testi; kural
 * numaraları `eslestirici.ts` başlığındakilerle aynı.
 */
// URN-31: model hedefi yalnız yayındaki listedeki SKU için üretilir (adres metni listeden; fikstürdeki Faz 2 metinleri).
// Liste dışı SKU davranışı: eslestiriciYayinda.test.ts.
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
const SEA = { aile: 'storm-serisi', sku: 'SEA-61143003', tr: 'storm-14-atex-cati-fani', en: 'storm-14-atex-roof-fan' }
const VRT = { aile: 'vortice-vort-commercial-in-line-rectangular', sku: 'VRT-CA-IL-4020-ES-RECT', tr: 'vortice-ca-il-4020-kanal-fani', en: 'vortice-ca-il-4020-duct-fan' }
beforeEach(() => yayindaVeriAyarla(modellerdenVeri([SEA])))

const h = fiksturHaritasi()

function esle(yol: string, sku: string | null = null, dil: AdresDili = 'tr', harita: KiraciHaritasi = h) {
  const dilTespit = vi.fn(() => dil)
  const sonuc = eskiAdresEsle(harita, { yol, sku, dilTespit })
  return { sonuc, dilTespit }
}

describe('kural 1 — dil önekli eski adres → TEK 308', () => {
  it.each([
    ['/tr/category/fans', '/tr/kategori/fanlar'], // TR önekinde EN slug'lı eski adres
    ['/tr/category/fanlar', '/tr/kategori/fanlar'],
    // SEO-35 B-1: kanonik adres TEK segment — dalın üst slug'ı adrese girmez, tek sıçrama.
    ['/tr/category/duct-fans', '/tr/kategori/kanal-tipi-fanlar'], // tek seviyeli dal (bugünkü canlı kanonik)
    ['/tr/category/kanal-tipi-fanlar', '/tr/kategori/kanal-tipi-fanlar'],
    ['/tr/category/fans/duct-fans', '/tr/kategori/kanal-tipi-fanlar'], // (a) bugünkü canlı iç içe, EN biçim
    ['/tr/category/fanlar/kanal-tipi-fanlar', '/tr/kategori/kanal-tipi-fanlar'], // (a) iç içe, TR biçim
    ['/tr/kategori/fanlar/kanal-tipi-fanlar', '/tr/kategori/kanal-tipi-fanlar'], // (a) 3-C'nin iki seviyeli adresi
    ['/tr/kategori/duct-fans', '/tr/kategori/kanal-tipi-fanlar'], // yeni önekte EN biçimli slug
    ['/tr/category/kanal-fanlari', '/tr/kategori/kanal-tipi-fanlar'], // takma ad (DB tetiği)
    ['/en/category/fans/duct-fans', '/en/category/duct-fans'], // (a) EN iç içe → tek segmentli kanonik
    ['/en/category/kanal-tipi-fanlar', '/en/category/duct-fans'], // EN önekinde TR biçimli dal
    ['/en/category/fanlar', '/en/category/fans'], // EN önekinde TR slug
    ['/tr/products/storm-serisi', '/tr/urun/storm-serisi'], // aile, eski önek
    ['/en/products/seat-storm', '/en/products/storm-serisi'], // eski aile slug'ı (takma ad)
    ['/tr/products/vortice-lineo-100-quiet', '/tr/urun/vortice-lineo-quiet-sessiz-kanal-fanlari'], // tohum: Lineo çap (URN-53: yeni slug)
    ['/en/products/vortice-lineo-315-quiet', '/en/products/vortice-lineo-quiet-sessiz-kanal-fanlari'],
    ['/tr/products/vortice-ca-il-4020-es-rect-16076', '/tr/urun/vortice-vort-commercial-in-line-rectangular'], // tohum/takma: ürün
    ['/tr/products/vorticent-cms-atex-35-14-t4-4kw-253490106xn', '/tr/urun/vortice-vorticent-cms-atex'], // config'te satırı YOK, takma adda var
    ['/tr/products', '/tr/urunler'],
    ['/en/urunler', '/en/products'],
  ])('%s → %s', (yol, hedef) => {
    const { sonuc, dilTespit } = esle(yol)
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('üst değişimi (O6): üst segmenti yanlış iki seviyeli adres dalın kanonik tek segmentli adresine gider', () => {
    expect(esle('/tr/category/air-curtains/duct-fans').sonuc?.hedef).toBe('/tr/kategori/kanal-tipi-fanlar')
    expect(esle('/tr/kategori/hava-perdeleri/kanal-tipi-fanlar').sonuc?.hedef).toBe('/tr/kategori/kanal-tipi-fanlar')
    expect(esle('/en/category/air-curtains/duct-fans').sonuc?.hedef).toBe('/en/category/duct-fans')
  })

  it('(a) iç içe adres TEK sıçramada biter: hedef tek segment ve yeniden eşleşmez (ikinci hop yok)', () => {
    for (const yol of [
      '/tr/category/fanlar/kanal-tipi-fanlar',
      '/tr/kategori/fanlar/kanal-tipi-fanlar',
      '/en/category/fans/duct-fans',
    ]) {
      const hedef = esle(yol).sonuc?.hedef
      expect(hedef, yol).toBeDefined()
      expect(hedef!.split('/').filter(Boolean), `${yol} → ${hedef} tek segmentli değil`).toHaveLength(3)
      expect(esle(hedef!).sonuc, `${yol} → ${hedef} yeniden eşleşiyor (ikinci sıçrama)`).toBeNull()
    }
  })

  it('pasif kategori (O4): aktif üst köke; üstü de pasifse tüm ürünler', () => {
    expect(esle('/tr/category/jet-fans').sonuc?.hedef).toBe('/tr/kategori/fanlar')
    expect(esle('/tr/category/rectangular-duct-fans').sonuc?.hedef).toBe('/tr/urunler')
    expect(esle('/en/category/commercial-ventilation').sonuc?.hedef).toBe('/en/products')
  })

  it('büyük harfli eski adres tek hop\'ta küçük harfli kanoniğe', () => {
    expect(esle('/tr/category/FANS').sonuc).toEqual({ hedef: '/tr/kategori/fanlar', durum: 308 })
    expect(esle('/en/category/Fans').sonuc).toEqual({ hedef: '/en/category/fans', durum: 308 })
  })
})

describe('kural 2 — dilsiz eski adres → TEK 307 (dil tespiti); Türkçe slug → deterministik TR 308', () => {
  it('Türkçe slug: TR\'ye 308, dil tespiti ÇAĞRILMAZ (bugünkü 4 hop\'luk /category/fanlar zinciri)', () => {
    const { sonuc, dilTespit } = esle('/category/fanlar', null, 'en')
    expect(sonuc).toEqual({ hedef: '/tr/kategori/fanlar', durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it.each([
    ['/category/hava-temizleyiciler-anti-viral-urunler', '/tr/urunler'], // tohum: ölü hedef → tüm ürünler
    ['/category/hiz-kontrolu-cihazlari', '/tr/kategori/hiz-anahtarlari'], // tohum: DB'de hiç olmamış slug
    ['/category/isi-geri-kazanim-cihazlari', '/tr/kategori/isi-geri-kazanim'], // tohum: 404 hedef → en yakın canlı kök
    ['/category/ticari-havalandirma', '/tr/urunler'], // pasif kök
    ['/category/otopark-jet-fanlari', '/tr/kategori/fanlar'], // pasif dal
    ['/urunler', '/tr/urunler'],
  ])('%s → TR 308 %s', (yol, hedef) => {
    expect(esle(yol, null, 'en').sonuc).toEqual({ hedef, durum: 308 })
  })

  it('dilden bağımsız slug: ziyaretçinin diline 307', () => {
    expect(esle('/category/fans', null, 'en').sonuc).toEqual({ hedef: '/en/category/fans', durum: 307 })
    expect(esle('/category/fans', null, 'tr').sonuc).toEqual({ hedef: '/tr/kategori/fanlar', durum: 307 })
    expect(esle('/category/heat-recovery-units', null, 'en').sonuc).toEqual({ hedef: '/en/category/heat-recovery-vmc', durum: 307 })
    expect(esle('/products/storm-serisi', null, 'en').sonuc).toEqual({ hedef: '/en/products/storm-serisi', durum: 307 })
    expect(esle('/products/storm-serisi', null, 'tr').sonuc).toEqual({ hedef: '/tr/urun/storm-serisi', durum: 307 })
    expect(esle('/products', null, 'en').sonuc).toEqual({ hedef: '/en/products', durum: 307 })
  })

  it('dilsiz YENİ adres (D3): /urun/<aile> EN ziyaretçide /en/products karşılığına', () => {
    expect(esle('/urun/storm-serisi', null, 'en').sonuc).toEqual({ hedef: '/en/products/storm-serisi', durum: 307 })
  })
})

describe('kural 3 — segment öneki + sondaki eğik çizgi', () => {
  it('dilsiz :path* karşılığı: /category/fanlar/<dal> tek hop\'ta tek segmentli yeni adrese (B-1)', () => {
    expect(esle('/category/fanlar/duct-fans', null, 'en').sonuc).toEqual({
      hedef: '/tr/kategori/kanal-tipi-fanlar',
      durum: 308,
    })
  })

  it('tanınmayan kuyruk düşer, bilinen en uzun önek kazanır', () => {
    expect(esle('/tr/category/fans/bilinmeyen').sonuc?.hedef).toBe('/tr/kategori/fanlar')
    expect(esle('/category/isi-geri-kazanim-cihazlari/eski/alt', null, 'en').sonuc?.hedef).toBe('/tr/kategori/isi-geri-kazanim')
  })

  it('sondaki / normalize edilir: /tr/category/fans/ tek hop; kanonik + / eşleşmez', () => {
    expect(esle('/tr/category/fans/').sonuc).toEqual({ hedef: '/tr/kategori/fanlar', durum: 308 })
    expect(esle('/en/category/fans/').sonuc).toBeNull()
  })
})

describe('kural 4 — ?sku= ayrıştırılır, hedefte query YOK', () => {
  const m = modelSlugluHarita()

  it('aile + ?sku= → model kanoniği (TR ve EN, eski ve yeni önek); SKU harf duyarsız', () => {
    expect(esle('/tr/products/storm-serisi', 'sea-61143003', 'tr', m).sonuc).toEqual({
      hedef: '/tr/urun/storm-14-atex-cati-fani-p-sea-61143003',
      durum: 308,
    })
    expect(esle('/en/products/storm-serisi', 'SEA-61143003', 'tr', m).sonuc).toEqual({
      hedef: '/en/products/storm-14-atex-roof-fan-p-sea-61143003',
      durum: 308,
    })
    expect(esle('/tr/urun/storm-serisi', 'SEA-61143003', 'tr', m).sonuc?.hedef).toBe('/tr/urun/storm-14-atex-cati-fani-p-sea-61143003')
  })

  it('eski SKU (takma ad tur=sku) bugünkü modele çözülür', () => {
    expect(esle('/tr/products/storm-serisi', 'SEA-ESKI-61143003', 'tr', m).sonuc?.hedef).toBe(
      '/tr/urun/storm-14-atex-cati-fani-p-sea-61143003'
    )
  })

  it('eski ürün slug\'ı → model kanoniği', () => {
    yayindaVeriAyarla(modellerdenVeri([SEA, VRT]))
    expect(esle('/en/products/vortice-ca-il-4020-es-rect-16076', null, 'tr', m).sonuc?.hedef).toBe(
      '/en/products/vortice-ca-il-4020-duct-fan-p-vrt-ca-il-4020-es-rect'
    )
  })

  it('bilinmeyen SKU yok sayılır: yol kendi başına çözülür', () => {
    expect(esle('/tr/products/storm-serisi', 'YOK-1').sonuc?.hedef).toBe('/tr/urun/storm-serisi')
    expect(esle('/en/products/storm-serisi', 'YOK-1').sonuc).toBeNull()
  })

  it('SKU yayında değilken (liste dışı / boş liste) EN kanonik aile + ?sku= kendine yönlenmez (model seçimi düşmesin)', () => {
    yayindaVeriAyarla({ modeller: {}, surumler: {} })
    expect(esle('/en/products/storm-serisi', 'SEA-61143003').sonuc).toBeNull()
  })

  it('hiçbir hedefte ? yok', () => {
    for (const [yol, sku] of [
      ['/tr/products/storm-serisi', 'SEA-61143003'],
      ['/en/products/storm-serisi', 'SEA-61143003'],
      ['/products/storm-serisi', 'SEA-61143003'],
    ] as const) {
      const hedef = esle(yol, sku, 'en', m).sonuc?.hedef
      expect(hedef).toBeDefined()
      expect(hedef).not.toContain('?')
    }
  })
})

describe('kural 5 — hedefler yeni şemadan (adresUret(…, dil, true))', () => {
  it('kategori, aile ve model hedefleri adresUret çıktısıyla aynı', () => {
    const m = modelSlugluHarita()
    expect(esle('/tr/category/duct-fans').sonuc?.hedef).toBe(
      adresUret({ tur: 'kategori', kok: 'fanlar', dal: 'kanal-tipi-fanlar' }, 'tr', true)
    )
    expect(esle('/tr/products/storm-serisi').sonuc?.hedef).toBe(adresUret({ tur: 'aile', slug: 'storm-serisi' }, 'tr', true))
    expect(esle('/tr/products/storm-serisi', 'SEA-61143003', 'tr', m).sonuc?.hedef).toBe(
      adresUret({ tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003' }, 'tr', true)
    )
  })
})

describe('kural 6 — kanonik adres ve tanınmayan yol → null', () => {
  it.each([
    '/en/category/fans',
    '/en/category/duct-fans', // B-1: alt kategori de tek segment kanonik
    '/tr/kategori/fanlar',
    '/tr/kategori/kanal-tipi-fanlar',
    '/en/products/storm-serisi',
    '/tr/urun/storm-serisi',
    '/tr/urunler',
    '/en/products',
    '/',
    '/tr',
    '/tr/cart',
    '/tr/checkout',
    '/admin/products',
    '/tr/about',
    '/tr/category',
    '/tr/products/0b8a3f4e-1c2d-4e5f-8a9b-0c1d2e3f4a5b', // UUID → middleware'in bugünkü UUID dalı
    '/tr/products/storm-14-atex-cati-fani-p-sea-61143003', // model adresi → sayfa çözücüsü
    '/tr/products/bilinmeyen-aile',
    '/tr/category/%E0%A4%A', // bozuk yüzde kodlaması
  ])('%s → null', (yol) => {
    expect(esle(yol).sonuc).toBeNull()
  })

  it('kiracının haritası yoksa null (tahmin yürütülmez)', () => {
    expect(eskiAdresEsle(undefined, { yol: '/tr/category/fans', sku: null, dilTespit: () => 'tr' })).toBeNull()
  })
})

/**
 * URN-119 — MARKA kolu. Bayrak açıkken dilsiz `/brands` ve `/brands/<slug>` bugün iki sıçramaydı (middleware dil
 * önekini 307 ile ekler, sonra sayfa `/tr/brands…` → `/tr/markalar…` 308 verir); eşleyici tek adımda yeni adrese
 * götürür. Bayrak KAPALIYKEN eşleyici hiç çağrılmaz: `middleware-bayrak-kapali.test.ts` ve `bayrak-kapisi.test.ts`.
 */
describe('kural 7 — marka kolu: dilsiz /brands ve /brands/<slug> TEK sıçrama (URN-119)', () => {
  const MARKA = 'vortice'
  const DIL_ONEKI = [
    ['/tr', 'tr'],
    ['/en', 'en'],
  ] as const

  it.each([
    ['/brands', 'tr', '/tr/markalar'],
    ['/brands', 'en', '/en/brands'],
    [`/brands/${MARKA}`, 'tr', `/tr/markalar/${MARKA}`],
    [`/brands/${MARKA}`, 'en', `/en/brands/${MARKA}`],
    // `/urun/<aile>` ile aynı kalıp (D3): Türkçe bölüm adı + slug de ziyaretçinin diline gider.
    [`/markalar/${MARKA}`, 'tr', `/tr/markalar/${MARKA}`],
    [`/markalar/${MARKA}`, 'en', `/en/brands/${MARKA}`],
  ] as const)('dilsiz %s (ziyaretçi %s) → TEK 307 %s', (yol, dil, hedef) => {
    const { sonuc, dilTespit } = esle(yol, null, dil)
    expect(sonuc).toEqual({ hedef, durum: 307 })
    expect(dilTespit).toHaveBeenCalledTimes(1)
  })

  it('dilsiz /markalar (Türkçe bölüm adı): dil tespiti ÇAĞRILMAZ, TR\'ye 308 (`/urunler` ile aynı)', () => {
    for (const ziyaretci of ['tr', 'en'] as const) {
      const { sonuc, dilTespit } = esle('/markalar', null, ziyaretci)
      expect(sonuc).toEqual({ hedef: '/tr/markalar', durum: 308 })
      expect(dilTespit).not.toHaveBeenCalled()
    }
  })

  it.each([
    ['/tr/brands', '/tr/markalar'],
    [`/tr/brands/${MARKA}`, `/tr/markalar/${MARKA}`],
    ['/tr/brands/nicotra-gebhardt', '/tr/markalar/nicotra-gebhardt'],
    ['/en/markalar', '/en/brands'],
    [`/en/markalar/${MARKA}`, `/en/brands/${MARKA}`],
  ])('dil önekli %s → TEK 308 %s (dil tespiti çağrılmaz)', (yol, hedef) => {
    const { sonuc, dilTespit } = esle(yol, null, 'en')
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('büyük harf ve sondaki eğik çizgi normalize edilir; sayfanın 308\'iyle AYNI hedef', () => {
    expect(esle(`/brands/${MARKA.toUpperCase()}`, null, 'tr').sonuc).toEqual({ hedef: `/tr/markalar/${MARKA}`, durum: 307 })
    expect(esle(`/BRANDS/${MARKA}/`, null, 'en').sonuc).toEqual({ hedef: `/en/brands/${MARKA}`, durum: 307 })
    expect(esle(`/tr/brands/${MARKA.toUpperCase()}/`).sonuc).toEqual({ hedef: `/tr/markalar/${MARKA}`, durum: 308 })
    expect(esle('/tr/brands/').sonuc).toEqual({ hedef: '/tr/markalar', durum: 308 })
    // EN'de adres yerinde kalır; yalnız büyük harfli yazım küçük harfli kanoniğe gider.
    expect(esle(`/en/brands/${MARKA.toUpperCase()}`).sonuc).toEqual({ hedef: `/en/brands/${MARKA}`, durum: 308 })
  })

  it('yüzde kodlu yazım çözülür: /brands/vor%74ice → vortice', () => {
    expect(esle('/brands/vor%74ice', null, 'tr').sonuc).toEqual({ hedef: `/tr/markalar/${MARKA}`, durum: 307 })
  })

  it.each([
    '/tr/markalar',
    `/tr/markalar/${MARKA}`,
    '/en/brands',
    '/en/brands/',
    `/en/brands/${MARKA}`,
    `/en/brands/${MARKA}/`,
  ])('kanonik %s → null (kendine yönlenmez, döngü yok)', (yol) => {
    const { sonuc, dilTespit } = esle(yol)
    expect(sonuc).toBeNull()
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it.each([
    '/brands/a/b', // iki slug segmenti: marka sayfası yok
    '/tr/brands/a/b',
    `/brands/${MARKA}/urunler`,
    '/markalar/a/b',
    '/brands/bilinmeyen-marka', // listede olmayan slug: bugünkü akış (404) karar versin
    '/tr/brands/bilinmeyen-marka',
    '/en/markalar/bilinmeyen-marka',
    '/tr/brands/frekans-konvertoru', // yayından kalkan marka: next.config 308'i (markaYonlendirmeleri.mjs) karar verir
    '/brands/nicotra%20gebhardt', // ad ile eşleşen yazım: sayfanın kendi 308'ine kalır, burada ikinci sıçrama kurulmaz
    '/brandsx',
    '/brands-vortice',
  ])('tanınmayan %s → null', (yol) => {
    const { sonuc, dilTespit } = esle(yol, null, 'en')
    expect(sonuc).toBeNull()
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('kiracının haritası yoksa marka kolu da null (tahmin yürütülmez)', () => {
    for (const yol of ['/brands', `/brands/${MARKA}`, `/tr/brands/${MARKA}`]) {
      expect(eskiAdresEsle(undefined, { yol, sku: null, dilTespit: () => 'tr' })).toBeNull()
    }
  })

  it('?sku= marka adresinde yok sayılır ve hedefte query yok', () => {
    const sonuc = eskiAdresEsle(h, { yol: `/brands/${MARKA}`, sku: 'SEA-61143003', dilTespit: () => 'tr' })
    expect(sonuc).toEqual({ hedef: `/tr/markalar/${MARKA}`, durum: 307 })
  })

  it('⭐yayındaki HER marka × HER giriş biçimi: hedef adresUret ile aynı, ikinci sıçrama YOK', () => {
    expect(HVAC_BRANDS.length).toBeGreaterThan(0)
    const girisler: { yol: string; hedefDili: AdresDili; nesne: AdresNesnesi }[] = []
    for (const m of HVAC_BRANDS) {
      const nesne: AdresNesnesi = { tur: 'marka', slug: m.slug }
      for (const [onek, dil] of DIL_ONEKI) {
        girisler.push({ yol: `${onek}/brands/${m.slug}`, hedefDili: dil, nesne })
        girisler.push({ yol: `${onek}/markalar/${m.slug}`, hedefDili: dil, nesne })
      }
      // Dilsiz: ziyaretçi diline göre (esle'nin varsayılanı 'tr'; EN ziyaretçi ayrıca).
      girisler.push({ yol: `/brands/${m.slug}`, hedefDili: 'tr', nesne })
    }
    for (const [onek, dil] of DIL_ONEKI) {
      const nesne: AdresNesnesi = { tur: 'markalar' }
      girisler.push({ yol: `${onek}/brands`, hedefDili: dil, nesne })
      girisler.push({ yol: `${onek}/markalar`, hedefDili: dil, nesne })
    }
    girisler.push({ yol: '/brands', hedefDili: 'tr', nesne: { tur: 'markalar' } })

    for (const { yol, hedefDili, nesne } of girisler) {
      const beklenen = adresUret(nesne, hedefDili, true)
      const sonuc = esle(yol, null, hedefDili).sonuc
      if (sonuc === null) {
        // Yalnız kanonik adres kendine yönlenir: yol zaten hedefin kendisi.
        expect(yol, `${yol} null döndü ama kanonik değil (beklenen ${beklenen})`).toBe(beklenen)
        continue
      }
      expect(sonuc.hedef, yol).toBe(beklenen)
      expect(sonuc.hedef, yol).not.toContain('?')
      expect(esle(sonuc.hedef, null, hedefDili).sonuc, `${yol} → ${sonuc.hedef} yeniden eşleşiyor (ikinci sıçrama)`).toBeNull()
    }
  })

  it('hedefler iki dilde tablodan: TR /tr/markalar…, EN /en/brands… (adresUret ile aynı, bayrak açık)', () => {
    expect(adresUret({ tur: 'markalar' }, 'tr', true)).toBe('/tr/markalar')
    expect(adresUret({ tur: 'markalar' }, 'en', true)).toBe('/en/brands')
    expect(adresUret({ tur: 'marka', slug: MARKA }, 'tr', true)).toBe(`/tr/markalar/${MARKA}`)
    expect(adresUret({ tur: 'marka', slug: MARKA }, 'en', true)).toBe(`/en/brands/${MARKA}`)
  })
})

describe('istek yolu işleme — ikinci dereceden yavaşlama (ReDoS) yok (ALT-15)', () => {
  // normalizeEt middleware'de İSTEK yolunda çalışır. Eski `replace(/\/+$/, '')` 64.000 ardışık `/` + harfte
  // ≈ 3 sn CPU yiyordu (kare büyüme); doğrusal döngü ≈ 0.
  it('kaynakta sondaki-eğik-çizgi kırpan düzenli ifade YOK (yorumlar hariç)', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src', 'lib', 'adres', 'eslestirici.ts'), 'utf8')
    const kod = kaynak
      .split('\n')
      .filter((satir) => !/^\s*(\/\/|\/\*|\*)/.test(satir))
      .join('\n')
    expect(kod.includes('replace(/\\/+$/')).toBe(false)
  })

  it('64.000 ardışık `/` + harf: eskiAdresEsle 250 ms altında', () => {
    const kotu = `${'/'.repeat(64_000)}x`
    const t0 = performance.now()
    expect(esle(kotu).sonuc).toBeNull()
    expect(performance.now() - t0).toBeLessThan(250)
  })

  it('kırpma davranışı eskisiyle aynı: sondaki bir ya da çok `/` aynı sonucu verir, yalnız `/` eşleşmez', () => {
    const referans = esle('/tr/category/fans').sonuc
    expect(referans).not.toBeNull()
    for (const yol of ['/tr/category/fans/', '/tr/category/fans///']) {
      expect(esle(yol).sonuc).toEqual(referans)
    }
    for (const yol of ['/', '//', '///']) expect(esle(yol).sonuc).toBeNull()
  })
})
