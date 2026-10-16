/**
 * URN-135 (U4 · Design D4) — Lineo Quiet AİLE sayfasının title / H1 / ilk paragraf / meta metni, GERÇEK sunucu çıktısında.
 *
 *  (a) generateMetadata (`aileSayfasiUstVerisi`): title ve description geçersiz kılmadan, OpenGraph aynı değerler; ≤155;
 *      eşleşmeyen slug ve model rotası (sunucuSku) bugünkü DB zincirini AYNEN kullanır; iki bayrak kipinde de çalışır
 *  (b) sayfa gövdesi (`AileSayfasi`): H1 ve açıklama paragrafı geçersiz kılınmış; Suspense yedeği (`?sku=` köprüsü askıdayken)
 *      AYNI H1'i ve paragrafı gösterir; breadcrumb ve model tablosu DEĞİŞMEZ
 *  (c) görünen = yapısal: JSON-LD `description` görünen paragrafla aynı, `name` aile adı
 *  (d) `?sku=` ile model seçilince varyantın kendi açıklaması geri gelir
 *  (e) istemci demeti: `ProductDetailPageView` import kapanışı şablon/ses veri modüllerine ULAŞMAZ
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LINEO_QUIET_AILE_SLUG, META_AZAMI } from '@/data/sessizFan/aileMetinleri'

const durum = vi.hoisted(() => ({
  acik: false,
  dil: 'tr' as 'tr' | 'en',
  detail: null as unknown,
  sku: null as string | null,
  askida: false,
}))

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  get ADRES_SEMASI_K3B() {
    return durum.acik
  },
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/products/x',
  // `askida`: `?sku=` köprüsü askıya girer → Suspense yedeği (varsayılan varyantla çizilmiş TAM gövde) HTML'e yazılır.
  useSearchParams: () => {
    if (durum.askida) throw new Promise<never>(() => {})
    return new URLSearchParams(durum.sku ? { sku: durum.sku } : {})
  },
}))

vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(async () => durum.detail),
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('@/i18n/dictionaries/tr')
  const { en: enSozluk } = await import('@/i18n/dictionaries/en')
  const { getDictValue: oku } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      lang: durum.dil,
      t: (k: string) => oku(durum.dil === 'en' ? enSozluk : trSozluk, k),
    }),
  }
})
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => ({ categories: [] }) }))
vi.mock('../../hooks/useCartHook', () => ({ useCart: () => ({ addToCart: vi.fn() }) }))
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))
vi.mock('../../hooks/useProjectLists', () => ({ useProjectLists: () => ({ refreshProjects: vi.fn() }) }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../components/ImageGallery', () => ({ default: () => null }))
vi.mock('../../components/product/ProductSmartInference', () => ({ ProductSmartInference: () => null }))
vi.mock('../../components/products', () => ({ AddToProjectModal: () => null }))
vi.mock('../../components/quotes/QuoteRequestModal', () => ({ default: () => null }))

import { AileSayfasi, aileSayfasiUstVerisi } from '../_components/aileSayfasi'

const KODLAR = [
  '17160', '17161', '17162', '17164', '17165', '17166',
  '17170', '17171', '17172', '17174', '17175', '17176',
]

const DB_BASLIK = 'Vortice Lineo Quiet Sessiz Kanal Fanları'
const DB_ACIKLAMA = 'DB aile açıklaması: bu metin geçersiz kılma varken görünmemeli.'

function varyant(kod: string, aciklama: string | null = null) {
  return {
    id: `v-${kod}`,
    sku: `VRT-${kod}`,
    name: `Lineo ${kod}`,
    slug: null,
    model_code: kod,
    price: null,
    stock_qty: null,
    technical_specs: null,
    description: aciklama,
    images: [],
  }
}

function detayKur(slug: string, kodlar: string[] = KODLAR, ilkAciklama: string | null = null) {
  return {
    family: {
      id: 'f1',
      name: DB_BASLIK,
      name_i18n: { tr: DB_BASLIK, en: 'Vortice Lineo Quiet Silent Duct Fans' },
      slug,
      series_code: null,
      description: { tr: DB_ACIKLAMA, en: 'DB family description (EN).' },
      brand_name: 'Vortice',
      category_id: null,
      subcategory_id: null,
      meta_title: { tr: 'DB meta başlığı', en: 'DB meta title' },
      meta_description: { tr: 'DB meta açıklaması.', en: 'DB meta description.' },
      category: null,
      subcategory: null,
    },
    variants: kodlar.map((k, i) => varyant(k, i === 0 ? ilkAciklama : null)),
    price_tax_included: null,
  }
}

const h1ler = (h: string) => [...h.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim())
const aciklamaKutulari = (h: string) =>
  [...h.matchAll(/<div data-testid="urun-aciklama"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim())
const jsonLdler = (h: string): Array<Record<string, unknown>> =>
  [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1].replace(/\\u003c/g, '<').replace(/\\u003e/g, '>')),
  )

async function html(lang: 'tr' | 'en', slug: string, sunucuSku: string | null = null): Promise<string> {
  durum.dil = lang
  durum.detail = detayKur(slug)
  return renderToStaticMarkup(await AileSayfasi({ lang, slug, sunucuSku }))
}

beforeEach(() => {
  durum.acik = false
  durum.dil = 'tr'
  durum.sku = null
  durum.askida = false
})

describe('(a) generateMetadata', () => {
  it.each([
    ['tr', false],
    ['tr', true],
    ['en', false],
    ['en', true],
  ] as const)('%s · bayrak %s: title/description geçersiz kılmadan, OpenGraph aynı değerler, ≤155', async (lang, acik) => {
    durum.acik = acik
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG)
    const m = await aileSayfasiUstVerisi(lang, LINEO_QUIET_AILE_SLUG)
    const baslik = lang === 'tr' ? 'Vortice Lineo Quiet Sessiz Kanal Fanı: 12 Model | VentHub' : 'Vortice Lineo Quiet Silent Duct Fan: 12 Models | VentHub'
    expect(m.title).toBe(baslik)
    expect(m.description).toMatch(/^Vortice Lineo Quiet/)
    expect(m.description).toContain('12')
    expect(m.description).toContain('dB(A) · 4 V ·')
    expect([...(m.description ?? '')].length).toBeLessThanOrEqual(META_AZAMI)
    expect(m.openGraph?.title).toBe(m.title)
    expect(m.openGraph?.description).toBe(m.description)
    expect(m.title).not.toContain('DB meta')
    expect(m.description).not.toContain('DB meta')
  })

  it('model sayısı canlı varyant sayısı: 11 varyant → 11 model', async () => {
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG, KODLAR.slice(0, 11))
    const m = await aileSayfasiUstVerisi('tr', LINEO_QUIET_AILE_SLUG)
    expect(m.title).toBe('Vortice Lineo Quiet Sessiz Kanal Fanı: 11 Model | VentHub')
    expect(m.description).toContain('11 modeli')
  })

  it('ses verisi kesişimi boşsa meta sayısız ve yine ≤155', async () => {
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG, ['99901', '99902'])
    const m = await aileSayfasiUstVerisi('tr', LINEO_QUIET_AILE_SLUG)
    expect(m.title).toContain('2 Model')
    expect(m.description).toBe('Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; AC ile EC motorlu 2 modeli vardır.')
  })

  it('eşleşmeyen slug: bugünkü DB zinciri AYNEN (meta_title, meta_description)', async () => {
    durum.detail = detayKur('avens-bvu-ls')
    const m = await aileSayfasiUstVerisi('tr', 'avens-bvu-ls')
    expect(m.title).toBe('DB meta başlığı')
    expect(m.description).toBe('DB meta açıklaması.')
    expect(m.openGraph?.title).toBe('DB meta başlığı')
    durum.dil = 'en'
    const e = await aileSayfasiUstVerisi('en', 'avens-bvu-ls')
    expect(e.title).toBe('DB meta title')
  })

  it('model rotası (sunucuSku): geçersiz kılma uygulanmaz, DB zinciri AYNEN', async () => {
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG)
    const m = await aileSayfasiUstVerisi('tr', LINEO_QUIET_AILE_SLUG, 'VRT-17164')
    expect(m.title).toBe('DB meta başlığı')
    expect(m.description).toBe('DB meta açıklaması.')
  })
})

describe('(b) sayfa gövdesi: H1 ve ilk paragraf', () => {
  it.each(['tr', 'en'] as const)('%s: H1 geçersiz kılınmış, açıklama kutusu geçersiz kılınmış paragraf', async (lang) => {
    const h = await html(lang, LINEO_QUIET_AILE_SLUG)
    expect(h1ler(h)).toEqual([lang === 'tr' ? 'Vortice Lineo Quiet Sessiz Kanal Tipi Fan' : 'Vortice Lineo Quiet Silent In-Line Duct Fan'])
    const kutu = aciklamaKutulari(h)
    expect(kutu).toHaveLength(1)
    expect(kutu[0]).toContain(lang === 'tr' ? 'katalogdaki en düşük değer 9,9 dB(A) · 4 V · gövde, 3 m.' : 'the lowest catalogue value is 9.9 dB(A) · 4 V · casing, 3 m.')
    expect(h).not.toContain(DB_ACIKLAMA)
    expect(h).not.toContain('DB family description')
  })

  it('ÇİFT GÖVDE kasıtlı: Suspense yedeği (köprü askıda) de AYNI H1 ve AYNI paragrafı gösterir', async () => {
    const normal = await html('tr', LINEO_QUIET_AILE_SLUG)
    durum.askida = true
    const yedek = await html('tr', LINEO_QUIET_AILE_SLUG)
    // Yedek gerçekten çizildi: köprü askıdayken HTML'de H1 var (varsayılan varyantla tam gövde).
    expect(h1ler(yedek)).toHaveLength(1)
    expect(h1ler(yedek)).toEqual(h1ler(normal))
    expect(aciklamaKutulari(yedek)).toEqual(aciklamaKutulari(normal))
  })

  it('eşleşmeyen slug: H1 ve açıklama bugünkü kaynaktan (aile adı, DB açıklaması)', async () => {
    const h = await html('tr', 'avens-bvu-ls')
    expect(h1ler(h)).toEqual([DB_BASLIK])
    expect(aciklamaKutulari(h)).toEqual([DB_ACIKLAMA])
  })

  it('model rotası (sunucuSku): H1 aile adı kalır, geçersiz kılma uygulanmaz', async () => {
    const h = await html('tr', LINEO_QUIET_AILE_SLUG, 'VRT-17164')
    expect(h1ler(h)).toEqual([DB_BASLIK])
    expect(aciklamaKutulari(h)).toEqual([DB_ACIKLAMA])
  })

  it('breadcrumb son basamağı ve model adları DEĞİŞMEZ: aile adı (H1 geçersiz kılması kırıntıya sızmaz)', async () => {
    const h = await html('tr', LINEO_QUIET_AILE_SLUG)
    const bc = jsonLdler(h).find((j) => j['@type'] === 'BreadcrumbList')
    const maddeler = (bc?.itemListElement ?? []) as Array<{ name: string }>
    expect(maddeler.at(-1)?.name).toBe(DB_BASLIK)
  })
})

describe('(c) görünen = yapısal (JSON-LD)', () => {
  it.each(['tr', 'en'] as const)('%s: ProductGroup.description görünen paragrafla aynı, name aile adı', async (lang) => {
    const h = await html(lang, LINEO_QUIET_AILE_SLUG)
    const grup = jsonLdler(h).find((j) => j['@type'] === 'ProductGroup')
    expect(grup).toBeDefined()
    expect(grup?.description).toBe(aciklamaKutulari(h)[0])
    expect(grup?.name).toBe(lang === 'tr' ? DB_BASLIK : 'Vortice Lineo Quiet Silent Duct Fans')
    expect(grup?.productGroupID).toBe(LINEO_QUIET_AILE_SLUG)
    expect((grup?.hasVariant as unknown[]).length).toBe(12)
  })

  it('eşleşmeyen slug: JSON-LD açıklaması DB metni (dokunulmadı)', async () => {
    const h = await html('tr', 'avens-bvu-ls')
    expect(jsonLdler(h).find((j) => j['@type'] === 'ProductGroup')?.description).toBe(DB_ACIKLAMA)
  })
})

describe('(d) ?sku= ile model seçilince', () => {
  it('model seçilmemişken (sku yok) ilk varyantın kendi açıklaması olsa bile aile tanıtımı görünür; iki gövde aynı', async () => {
    durum.dil = 'tr'
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG, KODLAR, 'Model açıklaması: yalnız bu modele ait.')
    const normal = renderToStaticMarkup(await AileSayfasi({ lang: 'tr', slug: LINEO_QUIET_AILE_SLUG, sunucuSku: null }))
    durum.askida = true
    const yedek = renderToStaticMarkup(await AileSayfasi({ lang: 'tr', slug: LINEO_QUIET_AILE_SLUG, sunucuSku: null }))
    expect(aciklamaKutulari(normal)[0]).toContain('katalogdaki en düşük değer')
    expect(aciklamaKutulari(normal)).not.toContain('Model açıklaması: yalnız bu modele ait.')
    expect(aciklamaKutulari(yedek)).toEqual(aciklamaKutulari(normal))
  })

  it('varyantın kendi açıklaması geri gelir, H1 yine geçersiz kılınmış aile başlığı', async () => {
    durum.dil = 'tr'
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG, KODLAR, 'Model açıklaması: yalnız bu modele ait.')
    durum.sku = 'VRT-17160'
    const h = renderToStaticMarkup(await AileSayfasi({ lang: 'tr', slug: LINEO_QUIET_AILE_SLUG, sunucuSku: null }))
    expect(aciklamaKutulari(h)).toEqual(['Model açıklaması: yalnız bu modele ait.'])
    expect(h1ler(h)).toEqual(['Vortice Lineo Quiet Sessiz Kanal Tipi Fan'])
  })

  it('model seçili ama varyantın açıklaması yok: aile düzeyi geçersiz kılınmış paragraf', async () => {
    durum.dil = 'tr'
    durum.detail = detayKur(LINEO_QUIET_AILE_SLUG)
    durum.sku = 'VRT-17164'
    const h = renderToStaticMarkup(await AileSayfasi({ lang: 'tr', slug: LINEO_QUIET_AILE_SLUG, sunucuSku: null }))
    expect(aciklamaKutulari(h)[0]).toContain('katalogdaki en düşük değer')
  })
})

/**
 * (e) İSTEMCİ DEMETİ — `ProductDetailPageView` `'use client'`'tır; import kapanışına giren her modül tarayıcıya gider.
 * Şablonlar ve ses veri modülü sunucuda çözülür, PDP'ye yalnız hazır dizeler geçer (`gorunenBaslik`, `gorunenAciklama`).
 * Çözümleme bilerek basit (ureticiMarkaBaglantisi.test.tsx ile aynı yöntem): `@/` ve göreli yollar, type-only atlanır.
 */
const KOK = process.cwd()
const UZANTILAR = ['.ts', '.tsx']
const PDP_DOSYASI = 'src/app/_components/ProductDetailPageView.tsx'

function importBelirtecleri(kaynak: string): string[] {
  const bulunan: string[] = []
  for (const m of kaynak.matchAll(/^(?:import|export)\b(?!\s+type\b)[^'";]*?\bfrom\s*['"]([^'"]+)['"]/gm)) bulunan.push(m[1])
  for (const m of kaynak.matchAll(/^import\s*['"]([^'"]+)['"]/gm)) bulunan.push(m[1])
  return bulunan
}

function belirtecCoz(belirtec: string, kaynakDosya: string): string | null {
  let taban: string
  if (belirtec.startsWith('@/')) taban = join(KOK, 'src', belirtec.slice(2))
  else if (belirtec.startsWith('.')) taban = resolve(dirname(join(KOK, kaynakDosya)), belirtec)
  else return null
  const adaylar = [...UZANTILAR.map((u) => `${taban}${u}`), ...UZANTILAR.map((u) => join(taban, `index${u}`)), taban]
  for (const aday of adaylar) {
    if (!UZANTILAR.includes(extname(aday)) || !existsSync(aday) || !statSync(aday).isFile()) continue
    return relative(KOK, aday).replace(/\\/g, '/')
  }
  return null
}

function importKapanisi(baslangic: string): Set<string> {
  const dosyalar = new Set<string>([baslangic])
  const kuyruk = [baslangic]
  while (kuyruk.length > 0) {
    const dosya = kuyruk.pop() as string
    for (const belirtec of importBelirtecleri(readFileSync(join(KOK, dosya), 'utf8'))) {
      const hedef = belirtecCoz(belirtec, dosya)
      if (!hedef || dosyalar.has(hedef)) continue
      dosyalar.add(hedef)
      kuyruk.push(hedef)
    }
  }
  return dosyalar
}

describe('(e) istemci demeti', () => {
  it('NEGATİF KONTROL: sunucu modülü aileSayfasi şablon modülüne ULAŞIR (ölçüt çalışıyor)', () => {
    expect(importKapanisi('src/app/_components/aileSayfasi.tsx').has('src/data/sessizFan/aileMetinleri.ts')).toBe(true)
  })

  it('PDP import kapanışı aile şablonlarına ve ses veri modüllerine girmez (yalnız hazır dize prop)', () => {
    const dosyalar = importKapanisi(PDP_DOSYASI)
    expect(dosyalar.size).toBeGreaterThan(40)
    for (const yasak of ['src/data/sessizFan/aileMetinleri.ts', 'src/data/sessizFan/sesOzeti.ts', 'src/data/sessizFan/sesVerisi.ts']) {
      expect(dosyalar.has(yasak), `${yasak} istemci demetine giriyor`).toBe(false)
    }
  })
})
