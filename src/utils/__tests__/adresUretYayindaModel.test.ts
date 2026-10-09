/**
 * INV-YAYINDA-MODEL-4 — `adresUret` + JSON-LD + canonical + model seçimi: model adresi YALNIZ listedeki
 * SKU için üretilir (URN-31). Liste dışı SKU'nun "model adresi" aile sayfası + `?sku=` seçimidir;
 * aksi hâlde 404 olan bir adres müşteriye, canonical'a ya da yapısal veriye sızardı.
 *
 * Adres BİÇİMİNDEN bağımsız: model adresi `modelSegmentiCoz` ile geri çözülür (round-trip); metin
 * sabiti ('-p-') kapıda YOK (karar 286 biçimi değiştirirse bu dosya değişmez).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { sentetikSlug, yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

vi.mock('@/lib/data/preload', () => ({
  getCachedFamilyDetail: vi.fn(),
  preloadFamily: vi.fn(),
  getFamilyDetailForRoute: vi.fn(),
  getCachedSeriesLanding: vi.fn(),
  getCachedProductBySlug: vi.fn(),
  getCachedFamilySlugById: vi.fn(),
  getCachedTakmaAd: vi.fn(),
  getCachedVariantById: vi.fn(),
  getCachedModelBySku: vi.fn(),
}))

import { aileSayfasiAdresleri } from '@/app/_components/aileSayfasi'
import { SITE_URL } from '@/config/siteUrl'
import { buildProductGroupJsonLd } from '@/lib/seo/jsonld'
import type { FamilyVariant } from '@/lib/services/family.service'
import { adresUret } from '@/utils/adresUret'
import { modelAdresiCoz } from '@/utils/modelAdresBicimi'
import { adresRotalari, modelBaglantiAdresi, modelSecimiHedefi } from '@/utils/yuzeyAdresleri'

const AILE = 'aile-a'
const LISTE = { modeller: { [AILE]: ['AAA-100', 'AAA-200'] }, surumler: { 'AAA-101': 'AAA-100' } }

const modelNesnesi = (sku: string) => ({ tur: 'model', aileSlug: AILE, sku }) as const
const sonSegment = (adres: string) => adres.split('?')[0].split('/').pop() ?? ''
/** Adres model sayfası mı? (çözücü round-trip ile) */
const modelSayfasiMi = (adres: string) => modelAdresiCoz(sonSegment(adres)) !== null

beforeEach(() => yayindaListesiAyarla(LISTE))

describe('adresUret (K3B açık) — model adresi liste kapısından geçer', () => {
  it.each(['tr', 'en'] as const)('liste içi (%s): model sayfası adresi; çözücüyle SKU\'ya döner; sorgu yok', (dil) => {
    const adres = adresUret(modelNesnesi('AAA-100'), dil, true)
    expect(modelSayfasiMi(adres)).toBe(true)
    expect(adres).not.toContain('?')
    expect(modelAdresiCoz(sonSegment(adres))?.sku).toBe('AAA-100')
  })

  it.each(['tr', 'en'] as const)('adres metni LİSTEDEKİ slug_%s; çağıranın verdiği slug yok sayılır', (dil) => {
    const adres = adresUret({ tur: 'model', aileSlug: AILE, sku: 'AAA-100', slug: 'cagiranin-metni' }, dil, true)
    expect(modelAdresiCoz(sonSegment(adres))?.slugMetni).toBe(sentetikSlug('AAA-100', dil))
    expect(adres).not.toContain('cagiranin-metni')
  })

  it('TR ve EN adresinin metni farklı (dil başına ayrı slug)', () => {
    const tr = modelAdresiCoz(sonSegment(adresUret(modelNesnesi('AAA-100'), 'tr', true)))?.slugMetni
    const en = modelAdresiCoz(sonSegment(adresUret(modelNesnesi('AAA-100'), 'en', true)))?.slugMetni
    expect(tr).not.toBe(en)
  })

  it.each(['tr', 'en'] as const)('liste DIŞI (%s): aile adresi + ?sku= (model sayfası adresi DEĞİL)', (dil) => {
    const adres = adresUret(modelNesnesi('ZZZ-9'), dil, true)
    expect(adres).toBe(`${adresUret({ tur: 'aile', slug: AILE }, dil, true)}?sku=ZZZ-9`)
    expect(modelSayfasiMi(adres)).toBe(false)
  })

  it('liste dışı SKU yüzde-kodlanır (sorguya ham karakter sızmaz)', () => {
    expect(adresUret(modelNesnesi('Z Z&9'), 'tr', true)).toBe(`${adresUret({ tur: 'aile', slug: AILE }, 'tr', true)}?sku=Z%20Z%269`)
  })

  it('sürüm: kendi sayfası var (kanonik temele gider, adres üretilir)', () => {
    expect(modelSayfasiMi(adresUret(modelNesnesi('AAA-101'), 'tr', true))).toBe(true)
  })

  it('FAIL-CLOSED: boş liste → HİÇBİR SKU model sayfası adresi almaz', () => {
    yayindaListesiAyarla({})
    for (const sku of ['AAA-100', 'AAA-101', 'ZZZ-9']) expect(modelSayfasiMi(adresUret(modelNesnesi(sku), 'tr', true))).toBe(false)
  })

  it('SKU küçük harf / kenar boşluğu ile gelse de aynı karar (kimlik normalleşir)', () => {
    expect(modelSayfasiMi(adresUret(modelNesnesi('aaa-100'), 'tr', true))).toBe(true)
    expect(modelSayfasiMi(adresUret(modelNesnesi(' AAA-100 '), 'tr', true))).toBe(true)
  })

  it('aile slug\'ına DÜŞÜLMEZ: model adresinin metni aile slug\'ı değil (slug yok = liste kaydı geçersiz = adres yok)', () => {
    const adres = adresUret(modelNesnesi('AAA-100'), 'tr', true)
    expect(modelAdresiCoz(sonSegment(adres))?.slugMetni).not.toBe(AILE)
  })
})

describe('yüzey fonksiyonları aynı karardan geçer (tek nokta: adresUret)', () => {
  it('adresRotalari(açık).product ve modelBaglantiAdresi: liste içi model sayfası, liste dışı ?sku=', () => {
    for (const dil of ['tr', 'en'] as const) {
      expect(modelSayfasiMi(adresRotalari(dil, true).product(AILE, 'AAA-200'))).toBe(true)
      expect(modelSayfasiMi(modelBaglantiAdresi(dil, AILE, 'AAA-200', true))).toBe(true)
      expect(adresRotalari(dil, true).product(AILE, 'ZZZ-9')).toBe(`${adresRotalari(dil, true).product(AILE)}?sku=ZZZ-9`)
      expect(modelBaglantiAdresi(dil, AILE, 'ZZZ-9', true)).toBe(adresRotalari(dil, true).product(AILE, 'ZZZ-9'))
    }
  })
})

describe('modelSecimiHedefi (handleSelectVariant kararı) — liste dışına model sayfası push EDİLMEZ', () => {
  it('KAPALI + aile sayfası: bugünkü ?sku= yazıcısı', () => {
    expect(modelSecimiHedefi('tr', AILE, 'AAA-100', false, false)).toEqual({ tur: 'sorgu' })
  })

  it('AÇIK + aile sayfası + liste içi SKU: modelin sayfasına git', () => {
    const h = modelSecimiHedefi('tr', AILE, 'AAA-200', false, true)
    expect(h.tur).toBe('git')
    expect(h.tur === 'git' && modelSayfasiMi(h.adres)).toBe(true)
  })

  it('AÇIK + aile sayfası + liste DIŞI SKU: sorgu yazıcısı (404 olacak adrese push YOK, geçmiş şişmez)', () => {
    expect(modelSecimiHedefi('tr', AILE, 'ZZZ-9', false, true)).toEqual({ tur: 'sorgu' })
  })

  it('model sayfasından liste DIŞI kardeşe: aile sayfası + ?sku= adresine gider (model sayfası değil)', () => {
    const h = modelSecimiHedefi('tr', AILE, 'ZZZ-9', true, true)
    expect(h.tur).toBe('git')
    expect(h.tur === 'git' && modelSayfasiMi(h.adres)).toBe(false)
    expect(h.tur === 'git' && h.adres).toBe(`${adresUret({ tur: 'aile', slug: AILE }, 'tr', true)}?sku=ZZZ-9`)
  })

  it('model sayfasından liste içi kardeşe: kardeşin model sayfasına gider', () => {
    const h = modelSecimiHedefi('en', AILE, 'AAA-200', true, true)
    expect(h.tur === 'git' && modelSayfasiMi(h.adres)).toBe(true)
  })

  it('FAIL-CLOSED: boş listede aile sayfasında hiçbir seçim model sayfasına gitmez', () => {
    yayindaListesiAyarla({})
    expect(modelSecimiHedefi('tr', AILE, 'AAA-100', false, true)).toEqual({ tur: 'sorgu' })
  })

  it('PDP handleSelectVariant bu kararı KULLANIR; model adresi kendi başına kurmaz (kaynak denetimi)', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src/app/_components/ProductDetailPageView.tsx'), 'utf8')
    const govde = kaynak.slice(kaynak.indexOf('const handleSelectVariant'), kaynak.indexOf('const modelAdresi = '))
    expect(govde).toContain('modelSecimiHedefi(')
    // 4. argüman "model sayfasındayız" bilgisidir (çürütme bulgu 1): `true` yazılırsa kapalı kipte de push yapılırdı.
    expect(govde).toMatch(/modelSecimiHedefi\(adresDili\(lang\), family\.slug, sku, sunucuSku !== null\)/)
    // push YALNIZ kararın verdiği adrese ve YALNIZ `git` kararında; başka hiçbir push/adres kurulumu yok.
    expect(govde).toMatch(/if \(hedef\.tur === 'git'\) \{\s*router\.push\(hedef\.adres as Route/)
    expect(govde.match(/router\.push\(/g)).toHaveLength(1)
    expect(govde).not.toMatch(/tur:\s*'model'/)
    expect(govde).not.toContain('ADRES_SEMASI_K3B')
  })
})

const variant = (o: Partial<FamilyVariant>): FamilyVariant => ({
  id: 'v', sku: 'SKU-1', name: 'M', slug: 'm', model_code: null, price: null, stock_qty: 0,
  technical_specs: null, description: null, images: [], ...o,
})
const aile = {
  id: 'f', name: 'A', slug: AILE, series_code: null, description: null, brand_name: null,
  category_id: null, subcategory_id: null, meta_title: null, meta_description: null, category: null, subcategory: null,
}
const varyantlar = ['AAA-100', 'AAA-101', 'ZZZ-9'].map((sku, i) => variant({ id: `v${i}`, sku }))
type Dugum = { url?: string }
const jsonLd = (bayrak: boolean | undefined) =>
  buildProductGroupJsonLd({ family: aile, variants: varyantlar, lang: 'tr', baseUrl: 'https://x', mainCategory: null, bayrak }) as {
    hasVariant: Dugum[]
  }

describe('JSON-LD hasVariant.url — yalnız dizine açık model sayfası adresi', () => {
  it('AÇIK: liste içi temel model url taşır; sürüm ve liste dışı varyantta url YOK', () => {
    const [temel, surum, disi] = jsonLd(true).hasVariant
    expect(temel.url && modelSayfasiMi(temel.url)).toBe(true)
    expect(surum).not.toHaveProperty('url')
    expect(disi).not.toHaveProperty('url')
  })

  it('FAIL-CLOSED: boş liste → hiçbir varyantta url yok', () => {
    yayindaListesiAyarla({})
    expect(jsonLd(true).hasVariant.every((v) => !('url' in v))).toBe(true)
  })

  it('KAPALI: varyant düğümünde url yok (liste ne olursa)', () => {
    expect(jsonLd(false).hasVariant.every((v) => !('url' in v))).toBe(true)
  })
})

describe('canonical / hreflang / og:url (aileSayfasiAdresleri)', () => {
  it('liste içi model: kanonik kendisi', () => {
    const a = aileSayfasiAdresleri(AILE, 'AAA-200', true)
    expect(a.tr).toBe(`${SITE_URL}${adresUret(modelNesnesi('AAA-200'), 'tr', true)}`)
    expect(a.en).toBe(`${SITE_URL}${adresUret(modelNesnesi('AAA-200'), 'en', true)}`)
  })

  it('SÜRÜM: kanonik TEMEL modelin adresi (URN-27 asgarisi); iki dilde', () => {
    const a = aileSayfasiAdresleri(AILE, 'AAA-101', true)
    expect(a.tr).toBe(`${SITE_URL}${adresUret(modelNesnesi('AAA-100'), 'tr', true)}`)
    expect(a.en).toBe(`${SITE_URL}${adresUret(modelNesnesi('AAA-100'), 'en', true)}`)
  })

  it('liste dışı SKU (olmaması gereken yol): kanonik AİLE adresine düşer, 404 adrese işaret etmez', () => {
    const a = aileSayfasiAdresleri(AILE, 'ZZZ-9', true)
    expect(a.tr).toBe(`${SITE_URL}${adresUret({ tur: 'aile', slug: AILE }, 'tr', true)}`)
  })
})
