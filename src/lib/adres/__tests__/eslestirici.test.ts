import { describe, expect, it, vi } from 'vitest'

import { type AdresDili, adresUret } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import type { KiraciHaritasi } from '../haritaTipi'
import { fiksturHaritasi, modelSlugluHarita } from './fikstur'

/**
 * REC-300 Faz 3 m.4 — ESKİ ADRES EŞLEYİCİSİ (plan §4.1, §6). Her kuralın en az bir testi; kural
 * numaraları `eslestirici.ts` başlığındakilerle aynı.
 */
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
    ['/tr/category/duct-fans', '/tr/kategori/fanlar/kanal-tipi-fanlar'], // tek seviyeli dal
    ['/tr/category/kanal-tipi-fanlar', '/tr/kategori/fanlar/kanal-tipi-fanlar'],
    ['/tr/category/fans/duct-fans', '/tr/kategori/fanlar/kanal-tipi-fanlar'], // iki seviye, EN biçim
    ['/tr/category/kanal-fanlari', '/tr/kategori/fanlar/kanal-tipi-fanlar'], // takma ad (DB tetiği)
    ['/en/category/duct-fans', '/en/category/fans/duct-fans'], // EN tek seviyeli dal (REC-205, Y4)
    ['/en/category/fanlar', '/en/category/fans'], // EN önekinde TR slug
    ['/tr/products/storm-serisi', '/tr/urun/storm-serisi'], // aile, eski önek
    ['/en/products/seat-storm', '/en/products/storm-serisi'], // eski aile slug'ı (takma ad)
    ['/tr/products/vortice-lineo-100-quiet', '/tr/urun/vortice-lineo-quiet'], // tohum: Lineo çap
    ['/en/products/vortice-lineo-315-quiet', '/en/products/vortice-lineo-quiet'],
    ['/tr/products/vortice-ca-il-4020-es-rect-16076', '/tr/urun/vortice-vort-commercial-in-line-rectangular'], // tohum/takma: ürün
    ['/tr/products/vorticent-cms-atex-35-14-t4-4kw-253490106xn', '/tr/urun/vortice-vorticent-cms-atex'], // config'te satırı YOK, takma adda var
    ['/tr/products', '/tr/urunler'],
    ['/en/urunler', '/en/products'],
  ])('%s → %s', (yol, hedef) => {
    const { sonuc, dilTespit } = esle(yol)
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('üst değişimi (O6): kök segmenti yanlış iki seviyeli adres dalın bugünkü köküne gider', () => {
    expect(esle('/tr/category/air-curtains/duct-fans').sonuc?.hedef).toBe('/tr/kategori/fanlar/kanal-tipi-fanlar')
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
    ['/category/hiz-kontrolu-cihazlari', '/tr/kategori/kontrol-sistemleri/hiz-anahtarlari'], // tohum: DB'de hiç olmamış slug
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
  it('dilsiz :path* karşılığı: /category/fanlar/<dal> tek hop\'ta iki seviyeli yeni adrese', () => {
    expect(esle('/category/fanlar/duct-fans', null, 'en').sonuc).toEqual({
      hedef: '/tr/kategori/fanlar/kanal-tipi-fanlar',
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
    expect(esle('/en/products/vortice-ca-il-4020-es-rect-16076', null, 'tr', m).sonuc?.hedef).toBe(
      '/en/products/vortice-ca-il-4020-duct-fan-p-vrt-ca-il-4020-es-rect'
    )
  })

  it('bilinmeyen SKU yok sayılır: yol kendi başına çözülür', () => {
    expect(esle('/tr/products/storm-serisi', 'YOK-1').sonuc?.hedef).toBe('/tr/urun/storm-serisi')
    expect(esle('/en/products/storm-serisi', 'YOK-1').sonuc).toBeNull()
  })

  it('model adres metni yokken (Faz 2 öncesi) EN kanonik aile + ?sku= kendine yönlenmez (model seçimi düşmesin)', () => {
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
      adresUret({ tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003', slug: 'storm-14-atex-cati-fani' }, 'tr', true)
    )
  })
})

describe('kural 6 — kanonik adres ve tanınmayan yol → null', () => {
  it.each([
    '/en/category/fans',
    '/en/category/fans/duct-fans',
    '/tr/kategori/fanlar',
    '/tr/kategori/fanlar/kanal-tipi-fanlar',
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
