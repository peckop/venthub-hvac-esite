/**
 * REC-300 Faz 3d — vitrin yüzeyleri `adresUret`'e bağlandı. Bu dosya iki şeyi sabitler:
 *
 *  1. BAYRAK KAPALIYKEN (bugün) her yüzeyin çıktısı BİREBİR bugünkü. Beklenen dizgeler bu değişiklikten
 *     ÖNCEKİ kodun ifadesinin çıktısıdır (tabloda yazılı; `Routes`/`localizedHref` ile yeniden
 *     HESAPLANMAZ — hesaplansaydı ikisi birlikte bozulduğunda test yeşil kalırdı).
 *  2. AÇIK kip (`bayrak = true` parametresi) plan §2 şemasını verir; `?sku=` hiçbir yüzeyde yok.
 *
 * Varsayılan bayrakla (gerçek `features.ts`) koşar; bayrağın kendisi `adresUret.test.ts`'te sabit.
 * Açık kipin varsayılanla (vekil, middleware, bilgi merkezi) davranışı: `yuzeyAdresleriK3b.test.tsx`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cozumKartiAdresi } from '../../components/home/ApplicationSolutions'
import { modellerdenVeri, yayindaVeriAyarla } from '../../config/__tests__/yayindaTestKiti'
import { type ProductRouteDeps,resolveProductRoute } from '../../lib/data/productRoute'
import {
  buildBreadcrumbJsonLd,
  buildCategoryJsonLd,
  buildProductGroupJsonLd,
  buildSeriesLandingJsonLd,
} from '../../lib/seo/jsonld'
import type { FamilyVariant } from '../../lib/services/family.service'
import type { FamilyListItem } from '../../types/ui-models'
import { getCategoryUrlFromTopic } from '../applicationLinks'
import {
  adresRotalari,
  dilDegistirYolu,
  kategoriKirintiYolu,
  urunDetayYoluMu,
  urunlerBolumuOnekleri,
} from '../yuzeyAdresleri'

// URN-31: model adresi yalnız yayındaki listedeki SKU için üretilir; adres metni listeden. Varsayılan liste: üç SKU,
// adres metni aile slug'ı (eski beklentilerle aynı). Bayrak KAPALI kolları listeden bağımsızdır (INV-YAYINDA-MODEL-7).
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
beforeEach(() =>
  yayindaVeriAyarla(
    modellerdenVeri(
      ['SEA-61143003', 'SEA-1', 'SEA-2'].map((sku) => ({ aile: 'storm-serisi', sku, tr: 'storm-serisi', en: 'storm-serisi' })),
    ),
  ),
)

describe('adresRotalari — vekilin (useLocalizedRoutes) ve sunucu yüzeylerinin ortak üreticisi', () => {
  // [çağrı, dil, BUGÜNKÜ çıktı, K3-b çıktısı]
  const tablo: [string, (r: ReturnType<typeof adresRotalari>) => string, 'tr' | 'en', string, string][] = [
    ['kök kategori', (r) => r.category('fanlar'), 'tr', '/tr/category/fanlar', '/tr/kategori/fanlar'],
    ['dal (üst verilir)', (r) => r.category('fanlar', 'kanal-tipi-fanlar'), 'tr', '/tr/category/kanal-tipi-fanlar', '/tr/kategori/fanlar/kanal-tipi-fanlar'],
    ['dal EN', (r) => r.category('fans', 'duct-fans'), 'en', '/en/category/duct-fans', '/en/category/fans/duct-fans'],
    ["dal 'undefined' dizgesi", (r) => r.category('fanlar', 'undefined'), 'tr', '/tr/category/fanlar', '/tr/kategori/fanlar'],
    ['aile', (r) => r.product('storm-serisi'), 'tr', '/tr/products/storm-serisi', '/tr/urun/storm-serisi'],
    ['model (?sku=)', (r) => r.product('storm-serisi', 'SEA-61143003'), 'tr', '/tr/products/storm-serisi?sku=SEA-61143003', '/tr/urun/storm-serisi-p-sea-61143003'],
    ['model EN', (r) => r.product('storm-serisi', 'SEA-61143003'), 'en', '/en/products/storm-serisi?sku=SEA-61143003', '/en/products/storm-serisi-p-sea-61143003'],
    ['boş aile slug (eski favori satırı)', (r) => r.product('', 'X-1'), 'tr', '/tr/products/?sku=X-1', '/tr/urunler'],
    ['tüm ürünler', (r) => r.products(), 'tr', '/tr/products', '/tr/urunler'],
    ['tüm ürünler EN', (r) => r.products(), 'en', '/en/products', '/en/products'],
    ['marka süzgeci', (r) => r.products({ brand: 'Vortice' }), 'tr', '/tr/products?brand=Vortice', '/tr/urunler?brand=Vortice'],
    ['marka', (r) => r.brand('vortice'), 'tr', '/tr/brands/vortice', '/tr/markalar/vortice'],
    ['marka EN', (r) => r.brand('vortice'), 'en', '/en/brands/vortice', '/en/brands/vortice'],
  ]

  it.each(tablo)('KAPALI birebir bugünkü: %s', (_ad, cagri, dil, bugun) => {
    expect(cagri(adresRotalari(dil))).toBe(bugun)
    expect(cagri(adresRotalari(dil, false))).toBe(bugun)
  })

  it.each(tablo)('AÇIK plan §2: %s', (_ad, cagri, dil, _bugun, yeni) => {
    const adres = cagri(adresRotalari(dil, true))
    expect(adres).toBe(yeni)
    expect(adres).not.toContain('sku=')
  })

  it('UUID slug: iki kipte de bugünkü `assertProductSlug` sözleşmesi (geliştirmede ATAR; üretimde eski yol → sayfa katmanı çözer, madde 6)', () => {
    const uuid = '0b0e6a52-6d0c-4f4f-9d5d-2f7a9b6b1c11'
    expect(() => adresRotalari('tr', false).product(uuid)).toThrow(/UUID/)
    expect(() => adresRotalari('tr', true).product(uuid)).toThrow(/UUID/)
  })
})

describe('dilDegistirYolu — LanguageSwitcher', () => {
  const tablo: [string, 'tr' | 'en', string, string][] = [
    // [yol, yeni dil, BUGÜNKÜ, K3-b]
    ['/tr/products/storm-serisi', 'en', '/en/products/storm-serisi', '/en/products/storm-serisi'],
    ['/tr/urun/storm-serisi-p-sea-1', 'en', '/en/urun/storm-serisi-p-sea-1', '/en/products/storm-serisi-p-sea-1'],
    ['/en/products/storm-serisi', 'tr', '/tr/products/storm-serisi', '/tr/urun/storm-serisi'],
    ['/en/products', 'tr', '/tr/products', '/tr/urunler'],
    ['/tr/urunler', 'en', '/en/urunler', '/en/products'],
    ['/tr/kategori/fanlar/kanal-tipi-fanlar', 'en', '/en/kategori/fanlar/kanal-tipi-fanlar', '/en/category/fanlar/kanal-tipi-fanlar'],
    ['/en/category/fans', 'tr', '/tr/category/fans', '/tr/kategori/fans'],
    ['/tr/markalar/vortice', 'en', '/en/markalar/vortice', '/en/brands/vortice'],
    ['/en/brands/vortice', 'tr', '/tr/brands/vortice', '/tr/markalar/vortice'],
    ['/tr/cart', 'en', '/en/cart', '/en/cart'],
    ['/tr', 'en', '/en', '/en'],
    ['/about', 'en', '/en/about', '/en/about'],
    ['/', 'tr', '/tr', '/tr'],
  ]
  it.each(tablo)('%s → %s', (yol, dil, bugun, yeni) => {
    expect(dilDegistirYolu(yol, dil)).toBe(bugun)
    expect(dilDegistirYolu(yol, dil, false)).toBe(bugun)
    expect(dilDegistirYolu(yol, dil, true)).toBe(yeni)
  })
})

describe('ClientLayout · MobilAltSekmeCubugu yol yüklemleri', () => {
  it.each([
    ['/tr/products/storm-serisi', true, true],
    ['/en/products/storm-serisi', true, true],
    ['/tr/urun/storm-serisi', false, true],
    ['/tr/urunler', false, false],
    ['/tr/category/fanlar', false, false],
  ])('urunDetayYoluMu(%s): bugün %s, K3-b %s', (yol, bugun, yeni) => {
    expect(urunDetayYoluMu(yol)).toBe(bugun)
    expect(urunDetayYoluMu(yol, false)).toBe(bugun)
    expect(urunDetayYoluMu(yol, true)).toBe(yeni)
  })

  it('urunlerBolumuOnekleri: bugün yalnız /<dil>/products; K3-b TR iki bölüm, EN tek', () => {
    expect(urunlerBolumuOnekleri('tr')).toEqual(['/tr/products'])
    expect(urunlerBolumuOnekleri('en', false)).toEqual(['/en/products'])
    expect(urunlerBolumuOnekleri('tr', true)).toEqual(['/tr/urunler', '/tr/urun'])
    expect(urunlerBolumuOnekleri('en', true)).toEqual(['/en/products'])
  })
})

describe('kırıntı yolu (aile sayfası BreadcrumbList + breadcrumbUtils)', () => {
  it('KAPALI: bugünkü dilsiz Routes.category; AÇIK: iki seviyeli dil önekli', () => {
    expect(kategoriKirintiYolu('fanlar', null, 'tr')).toBe('/category/fanlar')
    expect(kategoriKirintiYolu('fanlar', 'kanal-tipi-fanlar', 'tr', false)).toBe('/category/kanal-tipi-fanlar')
    expect(kategoriKirintiYolu('fanlar', 'kanal-tipi-fanlar', 'tr', true)).toBe('/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(kategoriKirintiYolu('fans', null, 'en', true)).toBe('/en/category/fans')
  })

  it('buildBreadcrumbJsonLd: dilsiz yol bugünkü gibi önek alır, önekli yol ikinci kez almaz', () => {
    const ld = buildBreadcrumbJsonLd({
      lang: 'tr',
      baseUrl: 'https://x',
      steps: [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Fanlar', path: '/category/fanlar' },
        { name: 'Kanal', path: '/tr/kategori/fanlar/kanal-tipi-fanlar' },
        { name: 'Aile', path: null },
      ],
    }) as { itemListElement: { item?: string }[] }
    expect(ld.itemListElement.map((i) => i.item)).toEqual([
      'https://x/tr', // REC-494: ana sayfa sonda eğik çizgisiz (`/tr/` 308 verir)
      'https://x/tr/category/fanlar',
      'https://x/tr/kategori/fanlar/kanal-tipi-fanlar',
      undefined,
    ])
  })
})

describe('Bilgi merkezi konu → kategori (TopicPage) ve ana sayfa çözüm kartları', () => {
  it.each([
    ['hava-perdesi', 'tr', '/category/air-curtains', '/tr/kategori/hava-perdeleri'],
    ['jet-fan', 'tr', '/category/jet-fans', '/tr/kategori/fanlar'],
    ['hrv', 'en', '/category/heat-recovery-units', '/en/category/heat-recovery-vmc'],
    ['', 'tr', '/products', '/tr/urunler'],
  ])('getCategoryUrlFromTopic(%s, %s)', (konu, dil, bugun, yeni) => {
    expect(getCategoryUrlFromTopic(konu, dil)).toBe(bugun)
    expect(getCategoryUrlFromTopic(konu, dil, false)).toBe(bugun)
    expect(getCategoryUrlFromTopic(konu, dil, true)).toBe(yeni)
  })

  it('cozumKartiAdresi: görünen slug her iki kipte dile göre (URN-19); bayrak yalnız şemayı değiştirir', () => {
    const kart = { categorySlug: 'air-curtains', trSlug: 'hava-perdeleri' }
    // Yedek yol (kategori listesi gelmedi): TR → trSlug, EN → kanonik slug.
    expect(cozumKartiAdresi(kart, 'tr')).toBe('/tr/category/hava-perdeleri')
    expect(cozumKartiAdresi(kart, 'tr', false)).toBe('/tr/category/hava-perdeleri')
    expect(cozumKartiAdresi(kart, 'en', false)).toBe('/en/category/air-curtains')
    expect(cozumKartiAdresi(kart, 'tr', true)).toBe('/tr/kategori/hava-perdeleri')
    expect(cozumKartiAdresi(kart, 'en', true)).toBe('/en/category/air-curtains')
  })

  it('cozumKartiAdresi: slug listedeki kategoriden çözülür (DB değişirse kart kendiliğinden izler)', () => {
    const kart = { categorySlug: 'air-curtains', trSlug: 'hava-perdeleri' }
    const liste = [
      { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
      { slug: 'air-curtains', metadata: { slug: { tr: 'hava-perdesi-yeni', en: 'air-curtains-new' } } },
    ]
    expect(cozumKartiAdresi(kart, 'tr', false, liste)).toBe('/tr/category/hava-perdesi-yeni')
    expect(cozumKartiAdresi(kart, 'en', false, liste)).toBe('/en/category/air-curtains-new')
    expect(cozumKartiAdresi(kart, 'tr', true, liste)).toBe('/tr/kategori/hava-perdesi-yeni')
    // Listede kategori yoksa yedek.
    expect(cozumKartiAdresi({ categorySlug: 'heat-recovery-vmc', trSlug: 'isi-geri-kazanim' }, 'tr', false, liste)).toBe(
      '/tr/category/isi-geri-kazanim',
    )
  })
})

// ── JSON-LD (madde 2, 7, 11) ────────────────────────────────────────────────────────────────
const variant = (o: Partial<FamilyVariant>): FamilyVariant => ({
  id: 'v', sku: 'SKU-1', name: 'M', slug: 'm', model_code: null, price: null, stock_qty: 0,
  technical_specs: null, description: null, images: [], ...o,
})
const family = {
  id: 'f', name: 'Storm', slug: 'storm-serisi', series_code: null, description: null, brand_name: null,
  category_id: null, subcategory_id: null, meta_title: null, meta_description: null, category: null, subcategory: null,
}
const FIYATLI_KATEGORI = { metadata: { hide_price: false } }
const varyantlar = [variant({ sku: 'SEA-1', price: 1500, stock_qty: 3 }), variant({ id: 'v2', sku: 'SEA-2', price: null })]

type Dugum = { url?: string; offers?: { price: string } }
const grup = (bayrak: boolean | undefined, lang = 'tr') =>
  buildProductGroupJsonLd({ family, variants: varyantlar, lang, baseUrl: 'https://x', mainCategory: FIYATLI_KATEGORI, bayrak }) as {
    url: string
    hasVariant: Dugum[]
  }

describe('Product JSON-LD — madde 11: fiyatlı modelde offers KORUNUR, fiyatsızda UYDURULMAZ (iki kol)', () => {
  it.each([
    ['KAPALI (varsayılan)', undefined],
    ['KAPALI', false],
    ['AÇIK', true],
  ] as const)('%s', (_ad, bayrak) => {
    const ld = grup(bayrak)
    expect(ld.hasVariant[0].offers?.price).toBe('1500.00')
    expect(ld.hasVariant[1]).not.toHaveProperty('offers')
  })

  it('KAPALI: aile url bugünkü, varyant düğümünde url YOK (tek adres aileydi)', () => {
    const ld = grup(undefined)
    expect(ld.url).toBe('https://x/tr/products/storm-serisi')
    expect(ld.hasVariant.every((v) => !('url' in v))).toBe(true)
  })

  it('AÇIK: aile url adresUret, her model kendi kanonik adresi (?sku= yok)', () => {
    const tr = grup(true)
    expect(tr.url).toBe('https://x/tr/urun/storm-serisi')
    expect(tr.hasVariant.map((v) => v.url)).toEqual([
      'https://x/tr/urun/storm-serisi-p-sea-1',
      'https://x/tr/urun/storm-serisi-p-sea-2',
    ])
    expect(grup(true, 'en').hasVariant[0].url).toBe('https://x/en/products/storm-serisi-p-sea-1')
  })
})

describe('CollectionPage JSON-LD (kategori + seri)', () => {
  const aileler = [{ slug: 'storm-serisi' }] as FamilyListItem[]
  const kategori = (bayrak: boolean | undefined, sayfaYolu?: string) =>
    buildCategoryJsonLd({
      lang: 'tr', baseUrl: 'https://x', categorySlug: 'kanal-tipi-fanlar', name: 'K', description: 'd',
      total: 1, page: 1, pageSize: 24, families: aileler, sayfaYolu, bayrak,
    }) as { url: string; itemListElement: { url: string }[] }

  it('KAPALI birebir bugünkü (sayfaYolu verilse bile okunmaz)', () => {
    for (const ld of [kategori(undefined), kategori(false, '/tr/kategori/fanlar/kanal-tipi-fanlar')]) {
      expect(ld.url).toBe('https://x/tr/category/kanal-tipi-fanlar')
      expect(ld.itemListElement[0].url).toBe('https://x/tr/products/storm-serisi')
    }
  })

  it('AÇIK: sayfa yolu iki seviyeli kanonik, aile adresleri adresUret', () => {
    const ld = kategori(true, '/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(ld.url).toBe('https://x/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(ld.itemListElement[0].url).toBe('https://x/tr/urun/storm-serisi')
  })

  it('seri: KAPALI bugünkü, AÇIK adresUret', () => {
    const seri = (bayrak?: boolean) =>
      buildSeriesLandingJsonLd({ lang: 'tr', baseUrl: 'https://x', seriesSlug: 'lineo', name: 'L', description: 'd', models: aileler, bayrak }) as {
        url: string
        itemListElement: { url: string }[]
      }
    expect(seri().url).toBe('https://x/tr/products/lineo')
    expect(seri().itemListElement[0].url).toBe('https://x/tr/products/storm-serisi')
    expect(seri(true).url).toBe('https://x/tr/urun/lineo')
    expect(seri(true).itemListElement[0].url).toBe('https://x/tr/urun/storm-serisi')
  })
})

// ── Ürün rotası yönlendirme hedefi + UUID (madde 6) ─────────────────────────────────────────
function deps(o: Partial<ProductRouteDeps> = {}): ProductRouteDeps {
  return {
    familyDetail: vi.fn().mockResolvedValue(null),
    seriesLanding: vi.fn().mockResolvedValue(null),
    variantBySlug: vi.fn().mockResolvedValue(null),
    familySlugById: vi.fn().mockResolvedValue('storm-serisi'),
    takmaAd: vi.fn().mockResolvedValue(null),
    variantById: vi.fn().mockResolvedValue(null),
    ...o,
  }
}

describe('resolveProductRoute — yönlendirme hedefi', () => {
  it('varyant slug: KAPALI bugünkü ?sku=, AÇIK modelin adresi', async () => {
    // Adres metni yayındaki listeden gelir: bu testte modelin listedeki metni `storm-10`.
    yayindaVeriAyarla(modellerdenVeri([{ aile: 'storm-serisi', sku: 'SEA-1', tr: 'storm-10', en: 'storm-10' }]))
    const d = () => deps({ variantBySlug: vi.fn().mockResolvedValue({ sku: 'SEA-1', family_id: 'f' }) })
    expect(await resolveProductRoute('storm-10', 'tr', d())).toMatchObject({ kind: 'redirect', to: '/tr/products/storm-serisi?sku=SEA-1' })
    expect(await resolveProductRoute('storm-10', 'en', d(), false)).toMatchObject({ to: '/en/products/storm-serisi?sku=SEA-1' })
    expect(await resolveProductRoute('storm-10', 'en', d(), true)).toMatchObject({
      kind: 'redirect',
      to: '/en/products/storm-10-p-sea-1',
      hedef: { aileSlug: 'storm-serisi', sku: 'SEA-1' },
    })
  })

  it('aile takma adı: KAPALI bugünkü, AÇIK adresUret', async () => {
    const d = () => deps({ takmaAd: vi.fn(async (tur: string) => (tur === 'aile' ? 'f' : null)) })
    expect(await resolveProductRoute('eski-aile', 'tr', d())).toMatchObject({ to: '/tr/products/storm-serisi' })
    expect(await resolveProductRoute('eski-aile', 'tr', d(), true)).toMatchObject({ to: '/tr/urun/storm-serisi' })
  })

  const uuid = '0b0e6a52-6d0c-4f4f-9d5d-2f7a9b6b1c11'
  it('UUID: KAPALI sayfa katmanı UUID dalına GİRMEZ (bugün middleware çözer) → bugünkü zincir', async () => {
    const d = deps({ variantById: vi.fn().mockResolvedValue({ sku: 'SEA-1', family_id: 'f' }) })
    expect(await resolveProductRoute(uuid, 'tr', d)).toEqual({ kind: 'not-found' })
    expect(d.variantById).not.toHaveBeenCalled()
  })

  it('UUID: AÇIK sayfa katmanında modelin adresine tek 308 (adrese UUID yazılmaz); yoksa 404; hata → unavailable', async () => {
    const d = deps({ variantById: vi.fn().mockResolvedValue({ sku: 'SEA-1', family_id: 'f' }) })
    expect(await resolveProductRoute(uuid, 'en', d, true)).toMatchObject({ kind: 'redirect', to: '/en/products/storm-serisi-p-sea-1' })
    expect(await resolveProductRoute(uuid, 'tr', deps(), true)).toEqual({ kind: 'not-found' })
    const hata = deps({ variantById: vi.fn().mockRejectedValue(new Error('db')) })
    expect(await resolveProductRoute(uuid, 'tr', hata, true)).toEqual({ kind: 'unavailable' })
  })
})
